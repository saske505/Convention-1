var Booking = require('../models/booking');
var Cart = require('../models/cart');

exports.requiresLogin = function(req, res, next) {
    if (req.session && req.session.userid) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        
        err.status = 401;
        
        return next(err);
    }
};

exports.index = function(req, res) {   
    res.redirect('/');
};

exports.bookings_get = function(req, res, next) {
    Booking.find({}, 'name price quantity')
    .exec(function(err, bookings) {
        if (err) {
            return next(err);
        } else {
            res.render('bookings', {bookings: bookings}); 
        }
    });
};

exports.booking_get = function(req, res, next) {
    Booking.findById(req.params.id)
    .exec(function(err, booking) {
        if (err) { 
            return next(err);
        } else {
            res.render('booking', {booking: booking});
        }
    });
};

exports.book_post = function(req, res, next) {
    var bookingid = req.params.id;
    var cartid = req.session.cartid;
    
    Booking.findById(bookingid)
    .exec(function(err, booking) {
        var bookingToAdd = [
            {
                '_id': booking._id,
                'name': booking.name,
                'price': booking.price,
                'quantity': booking.quantity
            }
        ];
        
        Cart.update({_id: cartid}, {$push: {bookings: {$each: bookingToAdd}}}, {}, function(err, result) {
            if (err) {
                return next(err);
            } else {
                Cart.findById(cartid)
                .populate('user')
                .populate('bookings')
                .exec(function(err, cart) {
                    if (err) {
                        return next(err);
                    } else {
                        var recalculatedQuantity = booking.quantity - 1;
                        
                        var updatedBooking = {
                            _id: booking._id,
                            name: booking.name,
                            price: booking.price,
                            quantity: recalculatedQuantity
                        };
                        
                        Booking.findByIdAndUpdate(bookingid, updatedBooking, {}, function(err) {
                            if (err) {
                                return next(err);
                            } else {
                                var recalculatedTotal = cart.total + booking.price;
                        
                                var updatedCart = {
                                    _id: cart._id,
                                    bookings: cart.bookings,
                                    user: cart.user,
                                    total: recalculatedTotal
                                };

                                Cart.findByIdAndUpdate(cartid, updatedCart, {}, function(err) {
                                    if (err) {
                                        return next(err);
                                    } else {
                                        res.render('cart', {cart: updatedCart});
                                    }
                                }); 
                            }
                        });
                    }
                });
            }
        });
    });
};

exports.book_delete_post = function(req, res, next) {
    var bookingid = req.params.id;
    var cartid = req.session.cartid;
    
    Booking.findById(bookingid)
    .exec(function(err, booking) {
       if (err) {
           return next(err);
       } else {
            booking.quantity = booking.quantity + 1;
            
            booking.save(function(err, updatedBooking) {
                if (err) {
                    return next(err);
                } else {
                    Cart.findById(cartid)
                    .populate('user')
                    .populate('booking')
                    .exec(function(err, cart) {
                        if (err) {
                            return next(err);
                        } else {
                            cart.total = cart.total - booking.price;
                            
                            cart.bookings.remove(bookingid);
                            
                            cart.save(function(err, cart) {
                                if (err) {
                                    return next(err);
                                } else {
                                    res.render('index');
                                }
                            });
                        }
                    });     
                }
            });
       }
    });
};