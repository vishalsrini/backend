var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var index = require('./routes/index');
var users = require('./routes/users');
var offers = require('./routes/offers');
var negotiations = require('./routes/negotiations');
var requirements = require('./routes/requirements');

var mongoose = require('mongoose');

var config = require('./config.js');

/**-------- Connection with Mongo starts ------*/
mongoose.connect(config.mongoUrl, {
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', function (err) {
  console.log(err);
});

db.once('open', function () {
  console.log('connected successfully');
});

/**--------- Connection completed ----------*/

var app = express();

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
//   next();
// });

app.use(function (req, res, next) { 
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); 
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, x-access-token'); 
  res.setHeader('Access-Control-Allow-Credentials', true); 
  if ('OPTIONS' === req.method) { 
    res.send(204); 
  } else { 
    next(); 
  } 
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());




/** --- Passport Configuration
 *  --- Model - User
 */
var User = require('./models/user');
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/**--------- Passport initialization completes -------*/

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/req', requirements);
app.use('/offers', offers);
app.use('/negotiate', negotiations);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {
      status: err.status
    }
  });
});

module.exports = app;
