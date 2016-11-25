var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//set static path
app.use(express.static(path.join(__dirname, 'public')));

//Global validationErrors
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});
//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg : msg,
      value: value
    };
  }
}));

app.get('/', function(req, res){
  db.users.find(function(err, docs) {
    res.render('index', {
      title : 'Customers',
      users: docs
    });
  });
});

app.post('/users/add', function(req, res){
  req.checkBody('firstName', 'First Name is required').notEmpty();
  req.checkBody('lastName', 'Last Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    res.render('index', {
      title : 'Customers',
      users: users,
      errors: errors
    });
  }else{
    var newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    };
    db.users.insert(newUser, function(err, result){
      if(err){
        console.log(err);
      }
      res.redirect('/');
    });
  }

});

app.delete('/users/delete/:id', function(req, res){
  console.log(req.params.id);
  db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
    if(err){
      console.log(err);
    }
    res.redirect('/');
  });
});

app.listen(3000, function(){
  console.log('server started on port 3000...');
})
