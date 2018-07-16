var async = require('async');

// require models
var User = require('../models/user');
var Order = require('../models/order');

// require functions from express-validator
var { body, validationResult } = require('express-validator/check');
var { sanitizeBody } = require('express-validator/filter');

// display list of all Orders
exports.order_list = function(req, res, next) {

  Order.find()
    .populate('user')
    .exec(function (err, list_orders) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('order_list', {title: 'Order List', order_list: list_orders});
    });
};

// display detail page for a specific Order
exports.order_detail = function(req, res, next) {
    Order.findById(req.params.id)
    .populate('user')
    .exec(function (err, order) {
      if (err) { return next(err); }
      if (order === null) { // No results.
          var err = new Error('Order not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('order_detail', { title: 'Order', order:  order});
    });
};

// display Order create form on GET
exports.order_create_get = function(req, res, next) {       
    User.find({},'firstName')
    .exec(function (err, users) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('order_form', {title: 'Create Order', user_list:users});
    });
    
};

// handle Order create on POST
exports.order_create_post = [

    // Validate fields.
    body('user', 'User must be specified').isLength({ min: 1 }).trim(),
    body('price', 'Price must be specified').isLength({ min: 1 }).trim(),
    
    // Sanitize fields.
    sanitizeBody('user').trim().escape(),
    sanitizeBody('price').trim().escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Order object with escaped and trimmed data.
        var order = new Order(
          { user: req.body.user,
            price: req.body.price
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            User.find({},'firstName')
                .exec(function (err, users) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('order_form', { title: 'Create Order', user_list : users, selected_user : order.user._id , errors: errors.array(), order:order });
            });
            return;
        }
        else {
            // Data from form is valid.
            order.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new order record.
                   res.redirect(order.url);
                });
        }
    }
];

// display Order delete form on GET
exports.order_delete_get = function (req, res, next) {
    async.parallel({
        order: function (callback) {
            Order.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        
        if (results.order === null) { // No results.
            res.redirect('/catalog/orders');
        }
        
        // Successful, so render.
        res.render('order_delete', { title: 'Delete Order', order: results.order } );
    });
};

// handle Order delete on POST
exports.order_delete_post = function(req, res, next) {
    async.parallel({
        order: function(callback) {
          Order.findById(req.body.orderid).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        
        // Delete order and redirect to the list of orders.
        Order.findByIdAndRemove(req.body.orderid, function deleteOrders(err) {
            if (err) { return next(err); }
            // Success - go to order list
            res.redirect('/catalog/orders');
        });
    });
};