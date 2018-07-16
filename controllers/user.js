var async = require('async');

// require models
var User = require('../models/user');
var Order = require('../models/order');

// require functions from express-validator
var { body, validationResult } = require('express-validator/check');
var { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res) {   
    
    async.parallel({
        user_count: function(callback) {
            User.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        order_count: function(callback) {
            Order.count({}, callback);
        }
    }, function(err, results) {
        res.render('index', {title: 'Convention', error: err, data: results});
    });
};

// display list of all Users
exports.user_list = function(req, res, next) {

  User.find({}, 'firstName lastName')
    .exec(function (err, list_users) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('user_list', {title: 'User List', user_list: list_users});
    });
};

// display detail page for a specific User
exports.user_detail = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
              .exec(callback);
        },
        order: function(callback) {
          Order.find({ 'user': req.params.id })
          .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user === null) { // No results.
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('user_detail', { title: 'User', user:  results.user, orders: results.order } );
    });
};

// display User create form on GET
exports.user_create_get = function(req, res, next) { 
    res.render('user_form', {title: 'Create User'});
};

// handle User create on POST
exports.user_create_post =  [
    // Validate that the firstName & lastName field is not empty.
    body('firstName', 'First Name required').isLength({ min: 1 }).trim(),
    body('lastName', 'Last Name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the firstName & lastName field.
    sanitizeBody('firstName').trim().escape(),
    sanitizeBody('lastName').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a user object with escaped and trimmed data.
        var user = new User(
            { 
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }
        );

        if (!errors.isEmpty()) {
            //There are errors. Render the form again with sanitized values/error messages.
            res.render('user_form', { title: 'Create User', user: user, errors: errors.array()});
        return;
        }
        else {
            user.save(function (err) {
                if (err) { 
                    return next(err); 
                }
                
                // User saved. Redirect to user detail page
                res.redirect(user.url);
            });
        }
    }
];

// display User delete form on GET
exports.user_delete_get = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        },
        users_orders: function(callback) {
          Order.find({ 'user': req.params.id }).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        
        if (results.user === null) { // No results.
            res.redirect('/catalog/users');
        }
        
        // Successful, so render.
        res.render('user_delete', {title: 'Delete User', user: results.user, user_orders: results.users_orders});
    });
};

// handle User delete on POST
exports.user_delete_post = function(req, res, next) {
    async.parallel({
        user: function(callback) {
          User.findById(req.body.userid).exec(callback);
        },
        users_orders: function(callback) {
          Order.find({'user': req.body.userid}).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        
        // Success
        if (results.users_orders.length > 0) {
            // User has orders. Render in same way as for GET route.
            res.render('user_delete', { title: 'Delete User', user: results.user, user_orders: results.users_orders } );
            
            return;
        }
        else {
            // User has no orders. Delete object and redirect to the list of users.
            User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
                if (err) { return next(err); }
                
                // Success - go to user list
                res.redirect('/catalog/users');
            });
        }
    });
};

// display user update form on GET.
exports.user_update_get = function(req, res, next) {
    // Get book & order for form.
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).populate('order').exec(callback);
        },
        orders: function(callback) {
            Order.find(callback);
        }
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.user === null) { // No results.
                var err = new Error('User not found');
                err.status = 404;
                return next(err);
            }
            // Success.

            res.render('user_form', { title: 'Update User', orders:results.orders, user: results.user });
        });
};

// handle user update on POST.
exports.user_update_post = [
    // Validate fields.
    body('firstName', 'First Name must not be empty.').isLength({ min: 1 }).trim(),
    body('lastName', 'Last Name must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('firstName').trim().escape(),
    sanitizeBody('lastName').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a User object with escaped/trimmed data and old id.
        var user = new User(
          { firstName: req.body.firstName,
            lastName: req.body.lastName,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all orders for form.
            async.parallel({
                orders: function(callback) {
                    Order.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('user_form', { title: 'Update Order',orders:results.orders, user: user, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(req.params.id, user, {}, function (err,theUser) {
                if (err) { return next(err); }
                   // Successful - redirect to user detail page.
                   res.redirect(theUser.url);
            });
        }
    }
];