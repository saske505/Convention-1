#! /usr/bin/env node

console.log('This script populates some test users & orders to my database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var User = require('./models/user')
var Order = require('./models/order')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []
var orders = []

function userCreate(firstName, lastName, cb) {
  userDetail = { 
    firstName: firstName,
    lastName: lastName
  }
    
  var user = new User(userDetail);  
  
  user.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    
    console.log('New User: ' + user);
    
    users.push(user)
    
    cb(null, user)
  }  );
}

function orderCreate(user, price, cb) {
  orderDetail = { 
    user: user,
    price: price
  }    
    
  var order = new Order(orderDetail);    
  order.save(function (err) {
    if (err) {
      console.log('ERROR CREATING Order: ' + order);
      
      cb(err, null)
      return
    }
    
    console.log('New Order: ' + order);
    
    orders.push(order)
    
    cb(null, user)
  }  );
}

function createUsers(cb) {
    async.parallel([
        function(callback) {
            userCreate('Stephan','Kroukamp', callback);
        },
        function(callback) {
            userCreate('Bernard','Heymans', callback);
        },
        function(callback) {
            userCreate('Gareth','Henriksen', callback);
        },
        function(callback) {
            userCreate('Hein','Smit', callback);
        },
        function(callback) {
            userCreate('Emile','Parker', callback);
        },
        function(callback) {
            userCreate('Tanya','Viljoen', callback);
        },
        function(callback) {
            userCreate('Bright','Xaki', callback);
        }
        ],
        // optional callback
        cb);
}

function createOrders(cb) {
    async.parallel([
        function(callback) {
          orderCreate(users[0], '1', callback)
        },
        function(callback) {
          orderCreate(users[1], '2', callback)
        },
        function(callback) {
          orderCreate(users[2], '3', callback)
        },
        function(callback) {
          orderCreate(users[3], '4', callback)
        },
        function(callback) {
          orderCreate(users[3], '5', callback)
        },
        function(callback) {
          orderCreate(users[3], '6', callback)
        },
        function(callback) {
            orderCreate(users[4], '7', callback)
        },
        function(callback) {
            orderCreate(users[4], '8', callback)
        },
        function(callback) {
          orderCreate(users[4], '9', callback)
        },
        function(callback) {
          orderCreate(users[0], '10', callback)
        },
        function(callback) {
          orderCreate(users[1], '11', callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createUsers,
    createOrders
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('orders: ' + orders);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



