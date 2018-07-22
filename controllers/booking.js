// require booking model
var Booking = require('../models/booking');

// this method ensures users have to be logged in to access the pages
exports.requiresLogin = function (req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        
        err.status = 401;
        
        return next(err);
    }
};

// redirects th booking to the home page
exports.index = function (req, res) {   
    res.redirect('/');
};

// display all bookings
exports.bookings = function(req, res, next) {
    Booking.find({}, 'name price quantity')
    .exec(function (err, bookings) {
        if (err) {
            return next(err);
        } else {
           //Successful, so render
            res.render('bookings', {bookings: bookings}); 
        }
    });
};

// display detail of a booking
exports.booking = function(req, res, next) {
    Booking.findById(req.params.id)
    .exec(function (err, booking) {
        if (err) { 
            return next(err);
        } else {
            //Successful, so render
            res.render('booking', {booking: booking});
        }
    });
};