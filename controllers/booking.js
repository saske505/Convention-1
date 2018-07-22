// require booking model
var Booking = require('../models/booking');

// redirects th booking to the home page
exports.index = function (req, res) {   
    res.redirect('/');
};

// display all bookings
exports.booking = function(req, res, next) {
    Booking.find({}, 'name price quantity')
        .exec(function (err, bookings) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('bookings', {bookings: bookings});
        });
};