// This file contains code to repopulate the DB with test data
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

require('./js/db.js'); // Set up connection and create DB if it does not exists yet

var model = require('./js/model.js');

model.User.remove({}, function(err) {
  if (err)
    return console.log(err);

  model.Item.remove({}, function(err) {
    if (err)
      return console.log(err);
      model.Record.remove({}, function(err) {
        if (err)
          return console.log(err);
    populateData();
  });
});
});

// ----------------------------------------------------------------------
function populateData() {
  var t = [ 'yummy', 'delicious', 'yuk', 'pretty', 'funny',
            'pricy', 'meh', 'interesting', 'omg', 'bravo' ];

  var records = [
  _record('5a328c787787c409bf5dfc32','Quis nostrud','bootstrap-women-ware1.jpg',20,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,14,445,new Date(2016, 05, 04),'eric'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,15,118,new Date(2016, 11, 11),'bob'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,19,9918,new Date(2016, 12, 08),'susan'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,29,241,new Date(2016, 05, 12),'fred'),
  _record('5a328c787787c409bf5dfc35','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 05, 05),'eric'),
  _record('5a328c787787c409bf5dfc35','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 06, 06),'susan'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 07, 07),'bob'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 08, 08),'john'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 08, 08),'john'),
  _record('5a328c787787c409bf5dfc32','Quis nostrud','bootstrap-women-ware1.jpg',20,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 08, 08),'john'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 08, 08),'john'),
  _record('5a328c787787c409bf5dfc32','Quis nostrud','bootstrap-women-ware1.jpg',20,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 08, 08),'john'),
  _record('5a328c787787c409bf5dfc32','KNOW EXACTLY','bootstrap-women-ware4.jpg',20,17,340,new Date(2016, 08, 08),'john'),
  _record('5a328c787787c409bf5dfc32','Quis nostrud','bootstrap-women-ware1.jpg',20,17,340,new Date(2016, 11, 10),'john'),
  _record('5a328c787787c409bf5dfc2c','Congue diam congue','1.jpg',35,17,340,new Date(2016, 11, 10),'john'),
  ];

  var items = [
    _item('Phasellus consequat','Description1',341,1299, new Date(2016, 11, 10),'9.jpg',[t[0], t[1], t[3], t[4]]),
    _item('Erat gravida','Description2', 28,1252, new Date(2016, 10, 10),'8.jpg',[t[3], t[5], t[8], t[4]]),
    _item('WUAM ULTRICES RUTRUM','Description3', 341,53253,new Date(2016, 1, 12),'7.jpg',[t[0], t[9], t[3], t[4]]),
    _item('Nam imperdiet','Description4', 49, 422,new Date(2016, 3, 13),'6.jpg',[t[0], t[1], t[6], t[4]]),
    _item('Congue diam congue','Description5', 35,686, new Date(2016, 4, 30),'1.jpg',[t[0], t[2], t[8], t[7]]),
    _item('Gravida placerat','Description6', 61, 123,new Date(2016, 2, 20),'2.jpg',[t[1], t[1], t[3], t[4]]),
    _item('Orci et nisl iaculis','Description7', 233, 12,new Date(2016, 1, 15),'3.jpg',[t[2], t[7], t[4], t[4]]),
    _item('Urna nec lectus mollis','Description8', 134, 962,new Date(2016, 1, 1),'4.jpg',[t[0], t[9], t[8], t[3]]),
    _item('Suspendisse aliquet','Description9', 261, 12339,new Date(2016, 6, 20),'5.jpg',[t[0], t[2], t[3], t[1]]),
    _item('Commodo consequat','Description10', 25, 65,new Date(2016, 3, 10),'bootstrap-women-ware2.jpg',[t[7], t[1], t[3], t[2]]),
    _item('Quis nostrud','Description11', 17, 7666,new Date(2016, 1, 20),'bootstrap-women-ware1.jpg',[t[0], t[1], t[3], t[3]]),
    _item('KNOW EXACTLY TURNED','Description12', 25, 811,new Date(2016, 10, 10),'bootstrap-women-ware6.jpg',[t[0], t[1], t[7], t[4]]),
    _item('World once','Description13', 26, 444,new Date(2016, 9, 11),'bootstrap-women-ware5.jpg',[t[9], t[4], t[8], t[2]]),
    _item('KNOW EXACTLY','Description14',45, 665,new Date(2016, 1, 12),'bootstrap-women-ware4.jpg',[t[2], t[1], t[5], t[6]]),
    _item('UT WISI ENIM AD','Description15',33, 12,new Date(2015, 11, 10),'bootstrap-women-ware3.jpg',[t[0], t[2], t[4], t[7]]),
    _item('YOU THINK WATER','Description16',47,561, new Date(2015, 2, 12),'bootstrap-women-ware2.jpg',[t[8], t[0], t[2], t[3]]),
    _item('QUIS NOSTRUD EXERCI','Description17',61, 774,new Date(2015, 2, 12),'bootstrap-women-ware1.jpg',[t[8], t[0], t[2], t[3]]),
  ];

  // 11 users
  var users = [
    _user('john', 'john@example.com','123',663000000000),
    _user('jane', 'jane@yahoo.com', '123',998),
    _user('eric', 'eric@gmail.com', '123',448),
    _user('matt', 'matt@gmail.com', '123',123),
    _user('jill', 'jill@yahoo.com', '123',45),
    _user('bill', 'bill@gmail.com', '123',67),
    _user('bob', 'bob@hotmail.com', '123',68),
    _user('charles', 'charles@hotmail.com', '123',99),
    _user('susan', 'susan@gmail.com', '123',451),
    _user('tanya', 'tanya@foo.com', '123',667),
    _user('fred', 'fred@bar.com', '123',881),
    _user('admin', 'admin@admin.com', 'admin')
  ];

  model.User.create(users, function(err, _users) {
    if (err) handleError(err);
    model.Item.create(items, function(err, _items) {
      if (err) handleError(err);
      model.Record.create(records, function(err, _record){
        if (err) handleError(err);

      console.log(_users);
      console.log(_items);
      console.log(_record);
      mongoose.connection.close();
      });
    });
  });


function _record(ItemId,Title,Pic,Quantity,Tokens,Total,RecordTime,Owner) {
  return {
    ItemId: ItemId,
    Title: Title,
    Pic: Pic,
    Quantity: Quantity,
    Tokens: Tokens,
    Total: Total,
    RecordTime: RecordTime,
    Owner: Owner
  };
}

function _user(username, email, password, bal) {
  var hash = bcrypt.hashSync(password, salt);
  return {
    username: username,
    email: email,
    password: hash,
    bal: bal,
  };
}

function _item(title,description,cost,qty,createdOn,pic,tags) {
  return {
    title: title,
    description:description,
    cost: cost,
    qty: qty,
    createdOn: createdOn,
    pic: pic,
    tags: tags,
  };
}

function handleError(err) {
  console.log(err);
  mongoose.connection.close();
}
}
