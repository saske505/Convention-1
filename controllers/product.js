var Product = require('../models/product');

var {check, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');

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

exports.product_get = function(req, res, next) {
    Product.findById(req.params.id)
    .exec(function(err, product) {
        if (err) {
            return next(err);
        } else {
            res.render('product', {product: product});
        }
    });
};

exports.create_get = function(req, res, next) {
    res.render('product_create');
};
exports.create_post = function(req, res, next) {
    
};
exports.create_post = [
    check('name', 'Name required')
        .isLength({min: 1})
        .trim(),
    check('sku', 'SKU required')
        .isLength({min: 1})
        .trim(),
    check("cost_price", 'Cost Price required'),
    check("selling_price", 'Selling Price required'),
    check("items_in_stock", 'Items in Stock required'),

    sanitizeBody('name').trim().escape(),
    sanitizeBody('sku').trim().escape(),
    sanitizeBody('cost_price').escape(),
    sanitizeBody('selling_price').escape(),
    sanitizeBody('items_in_stock').escape(),

    (req, res, next) => {
        var errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('create_product', {errors: errors.array()});
        } else {
            var productData = { 
                name: req.body.name,
                sku: req.body.sku,
                cost_price: req.body.cost_price,
                selling_price: req.body.selling_price,
                items_in_stock: req.body.items_in_stock
            };

            Product.create(productData, function(err, product) {
                if (err) {
                    return next(err);
                } else {
                    res.render('product', {product: product});
                }
            });
        }
    }
];

exports.delete_get = function(req, res, next) {
    Product.findById(req.params.id)
    .exec(function(err, product) {
        if (err) {
            res.redirect(product.url);
        } else {
            res.render('product_delete', {product: product});
        }
    });
};

exports.delete_post = function(req, res, next) {
    Product.findById(req.params.id)
    .exec(function(err, product) {
        if (err) { 
            return next(err);
        } else {
            Product.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/products');
                }
            });
        }
    });
};

exports.update_get = function(req, res, next) {
    Product.findById(req.params.id)
    .exec(function(err, product) {
        if (err) { 
            return next(err);
        } else {
            res.render('product_update', {product: product});
        }
    });
};

exports.update_post = function(req, res, next) {
    
};

exports.update_post = [
    check('name', 'Name required')
        .isLength({min: 1})
        .trim(),
    check('sku', 'SKU required')
        .isLength({min: 1})
        .trim(),
    check("cost_price", 'Cost Price required')
        .isLength({min: 1}),
    check("selling_price", 'Selling Price required')
        .isLength({min: 1}),
    check("items_in_stock", 'Items in Stock required')
        .isLength({min: 1}),

    sanitizeBody('name').trim().escape(),
    sanitizeBody('sku').trim().escape(),
    sanitizeBody('cost_price').escape(),
    sanitizeBody('selling_price').escape(),
    sanitizeBody('items_in_stock').escape(),

    (req, res, next) => {
        var errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            res.render('products_update', {errors: errors.array()});
            
            return;
        }
        else {
            var product = new Product({ 
                _id:req.params.id,
                name: req.body.name,
                sku: req.body.sku,
                cost_price: req.body.cost_price,
                selling_price: req.body.selling_price,
                items_in_stock: req.body.items_in_stock
            });
            
            Product.findByIdAndUpdate(req.params.id, product, {}, function(err) {
                if (err) {
                    return next(err);
                } else {
                    res.render('product', {product: product});
                }
            });
        }
    }
];