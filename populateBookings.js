#! /usr/bin/env node

console.log('This script populates some test bookings to my database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var bookingArgs = process.argv.slice(2);

if (!bookingArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    
    return;
}

var mongoose = require('mongoose');
var async = require('async');

// require models
var Booking = require('./models/booking');

var mongoDB = bookingArgs[0];

mongoose.connect(mongoDB);

mongoose.Promise = global.Promise;

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var bookings = [];

function bookingCreate(name, price, quantity, cb) {
    bookingDetail = { 
        name: name,
        price: price,
        quantity: quantity
    };
    
    var booking = new Booking(bookingDetail);  
  
    booking.save(function (err) {
        if (err) {
          cb(err, null);

          return;
        }
    
        console.log('New Booking: ' + booking);

        bookings.push(booking);

        cb(null, booking);
    });
};

function createBookings(cb) {
    async.parallel(
        [
            function(callback) {
                bookingCreate('2 Sleeper','1500','10', callback);
            },
            function(callback) {
                bookingCreate('3 Sleeper','1200','20', callback);
            }
        ],cb
    );
}

async.series(
    [
        createBookings
    ],
    // Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('bookings: ' + bookings);
        }

        // All done, disconnect from database
        mongoose.connection.close();
    });