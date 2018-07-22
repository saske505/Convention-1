/* global __dirname */

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');
var session = require('express-session');

//jshint
//express-mailer
//chalk
//moment

require('pug');

// require routes
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var bookingRouter = require('./routes/booking');

// mongoDB Credentials
var mongoUri = 'mongodb://admin:woopwoop1@ds137611.mlab.com:37611/convention';

// setup default mongoose connection 
const options = {
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

// set mongoose to use the global promise library
mongoose.Promise = global.Promise;

// get the default connection;
var mongoDB = mongoose.connection;

// bind connection to error event (connection error notifications)
mongoDB.on('error', console.error.bind(console, 'MongoDB connection error: '));

// initialize app
var app = express();

// set app view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set app middleware libraries
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

// set routers
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/booking', bookingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  
  err.status = 404;
  
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;

  res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
  
    res.render('error', {title: err.status, error: err});
});

// export app
module.exports = app;