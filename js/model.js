var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;
var bcrypt = require('bcryptjs');

var UserSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bal: {type: Number},
});

var ItemSchema = Schema({
  title: { type: String, default: '' },
  description: {type: String, default: ''},
  cost: {type: Number},
  qty: {type: Number},
  createdOn: { type: Date, default: Date.now },
  pic: {type: String, default: ''},
  tags: [ { type: String } ]
});

var RecordSchema = Schema({
  ItemId: { type: String, required: true},
  Title: {type: String, required: true},
  Pic: {type: String, default: ''},
  Quantity: {type: Number,required: true},
  Tokens: {type: Number,required: true},
  Total: {type: Number,required: true},
  RecordTime: {type: Date,required: true},
  Owner: { type: String,required: true},
});

var User = mongoose.model('User', UserSchema);
var Item = mongoose.model('Item', ItemSchema);
var Record = mongoose.model('Record', RecordSchema);



class PaginationData {
  constructor (props) {
    if (props === undefined)
      return;

    for (let key in props) {
      this[key] = props[key];
    }
  }

  validate() { // Ensure all required properties have a value.
    let requiredProperties =
      [ 'pageCount', 'pageSize', 'currentPage', 'items', 'params' ];
    for (let p of requiredProperties) {
      if (this[p] === undefined) {
        console.error(this, `Property '${p}' is undefined.`);
      }
    }
  }
}

async function showItems(user,page) {
  let pData = {
    pageSize: 10,
    params: {},
  };
  let condition = {Owner: user};
  let itemCount = await Record.count(condition);
  pData.pageCount = Math.ceil(itemCount / pData.pageSize);
  if (page == NaN) {
    page = 1;
  }
  pData.currentPage = page;
  pData.items = await Record.
    find(condition).
    skip(pData.pageSize * (pData.currentPage-1)).
    limit(pData.pageSize).
    sort({RecordTime : -1}).
    exec();
  return pData;
}

async function aserch(condition,page) {
  let pData = {
    pageSize: 10,
    params: {},
  };
  let itemCount = await Item.count(condition);
  pData.pageCount = Math.ceil(itemCount / pData.pageSize);
  if (page == NaN) {
    page = 1;
  }
  pData.currentPage = page;
  pData.items = await Item.
    find(condition).
    skip(pData.pageSize * (pData.currentPage-1)).
    limit(pData.pageSize).
    sort({createdOn: -1}).
    exec();
  return pData;
}

async function getItems(page, orderBy, order) {
  order = (order == 1 || order == -1) ? order : 1;
  let pData = new PaginationData( {
     pageSize: 10,
     params: {
       orderBy: orderBy,
       order: order
     }
  });
  let condition = {};   // Retrieve all items
  let itemCount = await Item.count(condition);
  pData.pageCount = Math.ceil(itemCount / pData.pageSize);
  page = (!page || page <= 0) ? 1 : page;
  page = (page >= pData.pageCount) ? pData.pageCount : page;
  pData.currentPage = page;
  let sortParam = {};
  if (orderBy == 1) {
    sortParam = {createdOn: order };
  }
  else {
    sortParam = {cost: order};
  }
  pData.items = await Item.
    find(condition).
    skip(pData.pageSize * (pData.currentPage-1)).
    limit(pData.pageSize).
    sort(sortParam).
    exec();
  pData.validate();
  return pData;
}

async function getItem(id) {
  let _id = new mongoose.Types.ObjectId(id);
  let result = await Item.
    findOne( {_id: _id} ).
    // populate('owner', 'username'). // only return the owner's username
    exec();
  return result;
}

async function getbal(name) {
  let result = await User.
    findOne( {username:name} ).
    exec();
  return result;
}

// Place holder for authentication
async function authenticate(user, password) {
  let result = await User.
    findOne({username: user}).
    exec();
    let tmptmp = await bcrypt.compare(password,result.password);
    if (user === user && tmptmp==true){
      return 1;
    }
    else {
      return 0;
    }
}

module.exports = {
  User: User,
  Item: Item,
  Record: Record,
  authenticate: authenticate,
  getItems: getItems,
  getItem: getItem,
  getbal: getbal,
  showItems: showItems,
  aserch: aserch,
}
