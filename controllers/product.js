var Product = require('../models/product');

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

exports.products_get = function(req, res, next) {
    Product.find({})
    .exec(function(err, products) {
        if (err) {
            return next(err);
        } else {
            res.render('products', {products: products});
        }
    });
};