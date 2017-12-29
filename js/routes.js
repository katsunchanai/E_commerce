let express = require('express');
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({extended:false});
let jsonParser = bodyParser.json({});
var ObjectId = require('mongodb').ObjectId;
var json2csv = require('json2csv');

const Query = require('query-string');
const qs = require('querystring');

let app = require('express').Router();

let model = require('./model.js');

module.exports=app;

app.get('/login', (req, res) => {
   return res.render('login.ejs', { title: 'Login Page',user:req.session.user,tokens:req.session.bal,status:"0"});
});

app.post('/login', urlencodedParser, async (req, res) => {
  let tmp = await model.authenticate(req.body.uname, req.body.pword);
  if (tmp === 1) {
    await new Promise((resolve, reject)=> {
      req.session.regenerate(resolve);
    });
    req.session.user = req.body.uname;
    var fml = await model.getbal(req.session.user);
    req.session.bal = fml.bal;
    res.redirect('/');
  }
  else {
    req.session.destroy(()=>{});  // Safe asyncrhous call
    return res.render('login.ejs',
      { title: 'Login Page',
        loginMsg: 'Incorrect username or password! Please try again.',
        status:'-300',
      });
  }
});

app.get('/record',(req,res)=> {
  var fields = ['ItemId','Title','Quantity','Tokens','Total','RecordTime','Owner'];
  model.Record.find({},
    {_id: 0, __v:0, Pic:0},
    function(err,result){
      if(err){
        throw (err);
      }
      var csv = json2csv({data: result, fields: fields});
      res.attachment('records.csv');
      res.status(200).send(csv);
      }
    );
});


app.get('/logout', (req, res) => {
  req.session.destroy(()=>{});   // Safe asyncrhonus call
  res.redirect('/login');
});

app.get('/hist',async (req,res) => {
  if (!(req.session.user)) {
      return res.render('login.ejs',
      { title: 'Login Page',
        status: "-100",
      });
  }
  let page;
  if (!(req.query.page - 0)){
    page = NaN;
  }
  else page = req.query.page - 0;
  let pageData = await model.showItems(req.session.user,page);
  return res.render('history.ejs',{Query:Query,title: 'Purchase Records',
                            user:req.session.user,pageData:pageData,
                            tokens:req.session.bal});
});

app.get('/', (req, res) => {
   return res.render('index.ejs', { title: 'Main',user:req.session.user,tokens:req.session.bal});
});

app.use('/listItems2', async (req, res) => {
  try {
    let page = req.query.page - 0;
    let orderBy = req.query.orderBy-0;
    let order = req.query.order-0;
    let pageData = await model.getItems(page, orderBy, order);
    return res.render('listItems2.ejs', { title: 'Item Listing', pageData: pageData,
                                   Query:Query,user:req.session.user,tokens:req.session.bal});
  } catch (err) {
    console.error(err);
    res.status(500).send('Error!');
  }
});

app.get('/item', async (req, res) => {
  try {
    let itemId = req.query.id;
    let data = await model.getItem(itemId);
    return res.render('item.ejs', {title: 'Item', data: data, Query: Query, user:req.session.user,tokens:req.session.bal});
  } catch (err) {
    console.error(err);
    res.status(500).send('Error!');
  }
});
app.post('/redeem', bodyParser.json({type: 'json'}));
app.post('/redeem', async (req,res) => {
  var data = await model.getItem(req.body[0].pid);
  var total = data.cost * req.body[0].qty;
  if ( (Number(req.body[0].qty) < 0) || isNaN(Number(req.body[0].qty)) || ! (Number.isInteger(parseInt(req.body[0].qty)))
        || (req.body[0].qty.split('.').length != 1) || parseInt(req.body[0].qty) === 0) {
    return res.json(3);
  }
  else if (!(req.session.user)) {
    return res.json(0);
  }
  else if (data.qty < req.body[0].qty){
    return res.json(4);
  }
  else {
  model.User.findOne({username:req.session.user},
    function(err,result){
      if(err){
        throw err;
      }
      if (result.bal < total){
        return res.json(2);
      }
      if (result.bal > total){
        model.User.update({username:req.session.user},
          {$set: {bal: (result.bal-total)}},
          function (err2,result2) {
            if(err2){
              throw (err2)}
          model.Item.update({"_id":ObjectId(req.body[0].pid)},
                {$set: {qty: (data.qty-req.body[0].qty)}},
                function(err3, result3){
                  if (result3.n > 0 && result2.n > 0){
                    model.User.findOne({username:req.session.user},
                      function(err4,result4){
                        if(err4){
                          throw (err4);
                        }
                        model.Record.create({ItemId: data._id, Title:data.title, Quantity:req.body[0].qty,Pic:data.pic,
                                             Tokens: data.cost, Total: total, RecordTime:Date.now(),Owner:req.session.user},
                          function(err5){
                            if (err5) throw (err5);
                            var newbal = result4.bal;
                            req.session.bal = newbal;
                            return res.json(1);
                        });
                    }); 
                }});   
            });
          }
      });
    }
});

app.get('/admin', (req,res) => {
  if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  else {
  return res.render('admin.ejs',{user:req.session.user});
  }
});

app.get('/createpage',(req,res) => {
  if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  return res.render('create.ejs',{user:req.session.user});
});
app.post('/create', bodyParser.json({type: 'json'}));
app.post('/create', async (req,res) => {
if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }

    if (!(!req.body[0].title.trim()) && !(!req.body[0].cost.trim()) &&  !(!req.body[0].qty.trim()) &&
         !(!req.body[0].pic.trim()) && !(!req.body[0].description.trim()) && !(!req.body[0].tags.trim()) &&
         (!isNaN(parseFloat(req.body[0].cost.trim())) && isFinite(req.body[0].cost.trim()))== true &&
         (!isNaN(parseFloat(req.body[0].qty.trim())) && isFinite(req.body[0].qty.trim()))== true &&
         (req.body[0].qty.split('.').length == 1) && (parseInt(req.body[0].qty.trim()) > 0) &&
         (req.body[0].cost.split('.').length == 1) && (parseInt(req.body[0].cost.trim()) > 0)
         ) {
      var newitem = req.body[0];
      let itemexit = await model.Item.count({title: req.body[0].title});
      if (itemexit == 0) {
      model.Item.create(
        newitem,
        function (err){
          if (err) {
            throw (err);
          }
          else return res.json(1); });
    }
    else return res.json(-1);
  }
    else return res.json(0);
});

app.get('/deletepage',(req,res) => {
if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  return res.render('delete.ejs',{user:req.session.user});
});
app.post('/del', bodyParser.json({type: 'json'}));
app.post('/del',(req,res) => {
if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  var ser;
  if (req.body[0] == "title") {
     ser = {title:req.body[1]};
  }
  else if (req.body[0] == "pid") {
    ser = {"_id":ObjectId(req.body[1])};
  }
    model.Item.remove(ser,
      function(err,final){
        if(err){
          throw err;
        }
        return res.json(final);
      });
});

app.get('/updatepage',(req,res) => {
  if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  return res.render('update.ejs',{user:req.session.user});
});
app.get('/update',async (req,res) => {
  if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  var tmp = {};
  if (!(!req.query.title.trim())) {
    tmp.title = req.query.title;
  }
  if (!(!req.query.cost.trim())) {
    if (!isNaN(parseFloat(req.query.cost.trim())) && (isFinite(req.query.cost.trim()) == true) &&
        (req.query.cost.split('.').length == 1) && (parseInt(req.query.cost.trim()) > 0))
    {tmp.cost = req.query.cost;}
    else return res.json(-2);
  }
    if (!(!req.query.qty.trim())) {
    if (!isNaN(parseFloat(req.query.qty.trim())) && (isFinite(req.query.qty.trim()) == true) &&
        (req.query.qty.split('.').length == 1) && (parseInt(req.query.qty.trim()) > 0))
    {tmp.qty = req.query.qty;}
    else return res.json(-2);
  }
    if (!(!req.query.description.trim())) {
    tmp.description = req.query.description;
  }

  if (!(!req.query.tags.trim())) {
    let arr = req.query.tags.split(/[ .:;?@#$%^*-+_='!~,`"&|()<>{}\[\]\r\n/\\]+/);
    arr = arr.filter(x=>x!='');
    arr = arr.map(x=>x.toLowerCase());
    tmp.tags = arr;
  }

  if ((await Object.keys(tmp).length) == 0) {
    return res.json(-3);
  }

var conditions;
  if (req.query.match == "title") {
     conditions = {title:req.query.inputval};
  }
  else if (req.query.match == "pid"){
    conditions = {"_id": ObjectId(req.query.inputval)};
  }

var updatevar = {$set:tmp};
model.Item.update(conditions,
  updatevar,
  function (err,result) {
    if(err){
      throw (err);
    }
    else if (result.n > 0) {
      return res.json(1);
    }
    else {
      return res.json(0);
    }
  });
});

app.get('/retreivepage',(req,res) => {
    if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      });
  }
  return res.render('retrieve.ejs',{user:req.session.user});
});

app.get('/re', async (req, res) => {
    if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,tokens:req.session.bal,
        status: "-200",
      }); }

  let tmp = {};
  if (req.query.tori == "title")
    {if (!(!req.query.title.trim())) tmp.title = req.query.title;}
    else {if(!(!req.query.title.trim())) tmp._id = ObjectId(req.query.title);}

  if (!(!req.query.cost.val.trim())) {
    if (!isNaN(parseFloat(req.query.cost.val.trim())) && (isFinite(req.query.cost.val.trim()) == true) &&
      (req.query.cost.val.split('.').length == 1) && (parseInt(req.query.cost.val.trim()) > 0))
      {
      if (req.query.cost.cri == "$eq") tmp.cost = parseInt(req.query.cost.val);
      else if (req.query.cost.cri == "$lt") tmp.cost = {$lt : parseInt(req.query.cost.val)};
      else if (req.query.cost.cri == "$gt") tmp.cost = {$gt : parseInt(req.query.cost.val)};
    } else return res.json(-1);}

  if (!(!req.query.qty.val.trim())) {
    if (!isNaN(parseFloat(req.query.qty.val.trim())) && (isFinite(req.query.qty.val.trim()) == true) &&
      (req.query.qty.val.split('.').length == 1) && (parseInt(req.query.qty.val.trim()) > 0))
      {
      if (req.query.qty.cri == "$eq") tmp.qty = parseInt(req.query.qty.val);
      else if (req.query.qty.cri == "$lt") tmp.qty = {$lt : parseInt(req.query.qty.val)};
      else if (req.query.qty.cri == "$gt") tmp.qty = {$gt : parseInt(req.query.qty.val)};
    } else return res.json(-1);}

  if (!(!req.query.tags.trim())) {
    let arr = req.query.tags.split(/[ .:;?@#$%^*-+_='!~,`"&|()<>{}\[\]\r\n/\\]+/);
    arr = arr.filter(x=>x!='');
    arr = arr.map(x=>x.toLowerCase());
    tmp.tags = {$all: arr};
  }

    if ((await Object.keys(tmp).length) == 0) tmp = {};
    req.session.serch = tmp;
    return res.json(100);
});

app.get('/adminre', async (req, res) => {
    if (req.session.user != 'admin'){
    return res.render('login.ejs',
      { title: 'Login Page',
        user:req.session.user,
        status: "-200",
      });
  }
  let page;
  if (!(req.query.page - 0)){
    page = NaN;
  }
  else page = req.query.page - 0;
  let pageData = await model.aserch(req.session.serch,page);
  return res.render('adminre.ejs',{Query:Query,title:'Admin Search', user:req.session.user,pageData:pageData});
});


