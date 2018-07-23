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

exports.cart_get = function(req, res, next) {
    Cart.findById(req.params.id)
   .populate('user')
   .populate('bookings')
   .exec(function(err, cart) {
       if (err) { 
           return next(err);
       } else {
           if (cart === null) {
               var err = new Error('Cart not found');

               err.status = 404;

               return next(err);
           } else {
               res.render('cart', {cart: cart});
           }
       }
    });
};