// require booking model
var Booking = require('../models/booking');

// this method ensures users have to be logged in to access the pages
exports.requiresLogin = function (req, res, next) {
    if (req.session && req.session.userid) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        
        err.status = 401;
        
        return next(err);
    }
};

exports.index = function (req, res) {   
    res.redirect('/');
};

exports.bookings = function(req, res, next) {
    Booking.find({}, 'name price quantity')
    .exec(function (err, bookings) {
        if (err) {
            return next(err);
        } else {
            res.render('bookings', {bookings: bookings}); 
        }
    });
};

exports.booking = function(req, res, next) {
    Booking.findById(req.params.id)
    .exec(function (err, booking) {
        if (err) { 
            return next(err);
        } else {
            res.render('booking', {booking: booking});
        }
    });
};