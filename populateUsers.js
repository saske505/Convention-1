#! /usr/bin/env node

console.log('This script populates some test users to my database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    
    return;
}

var mongoose = require('mongoose');
var async = require('async');

// require models
var User = require('./models/user');

var mongoDB = userArgs[0];

mongoose.connect(mongoDB);

mongoose.Promise = global.Promise;

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = [];

function userCreate(firstName, lastName, userName, email, mobile, password, cb) {
    userDetail = { 
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        email: email,
        mobile: mobile,
        password: password
    };
    
    var user = new User(userDetail);  
  
    user.save(function(err) {
        if (err) {
          cb(err, null);

          return;
        }
    
        console.log('New User: ' + user);

        users.push(user);

        cb(null, user);
    });
};

function createUsers(cb) {
    async.parallel(
        [
            function(callback) {
                userCreate('Stephan','Kroukamp','stephan.kroukamp','stephan.kroukamp@gmail.com','0795068709','spw', callback);
            },
            function(callback) {
                userCreate('Benita','Kroukamp','benita.kroukamp','benitak@mweb.co.za','0835990722','bpw', callback);
            }
        ],cb
    );
}

async.series(
    [
        createUsers
    ],
    // Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('users: ' + users);
        }

        // All done, disconnect from database
        mongoose.connection.close();
    });