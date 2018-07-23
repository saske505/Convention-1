/* global __dirname */

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var session = require('express-session');

require('pug');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var bookingRouter = require('./routes/booking');

var mongoUri = 'mongodb://admin:woopwoop1@ds147451.mlab.com:47451/convention';

var options = {
  autoIndex: false, // don't build indexes
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE, // never stop trying to reconnect
  reconnectInterval: 500, // reconnect every 500ms
  poolSize: 10, // maintain up to 10 socket connections
  // if not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // give up initial connection after 10 seconds
  socketTimeoutMS: 45000 // close sockets after 45 seconds of inactivity
};

mongoose.connect(mongoUri, options, function(err) {
    if (err) {
        throw err;
    } else {
        console.log('Successfully connected to MongoDB.');
    }
});

mongoose.Promise = global.Promise;

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error: '));

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false
}));

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/booking', bookingRouter);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  
  err.status = 404;
  
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;

  res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
  
    res.render('error', {title: err.status, error: err});
});

module.exports = app;