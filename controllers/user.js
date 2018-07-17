var async = require('async');
var bcrypt = require('bcrypt');

// require Model
var User = require('../models/user');

// require functions from express-validator
var { body, validationResult } = require('express-validator/check');
var { sanitizeBody } = require('express-validator/filter');

exports.requiresLogin = function (req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        
        err.status = 401;
        
        return next(err);
    }
};

exports.index = function (req, res) {   
    
    async.parallel({
        user_count: function(callback) {
            User.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
        }
    }, function(err, results) {
        res.redirect('/');
    });
};

// display detail page for a specific User
exports.user_detail = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
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
        
        res.render('user_detail', { title: 'User', user:  results.user } );
    });
};

// display User create form on GET
//input#userid.form-control(type='hidden', name=userid value=(undefined === user ? '' : user._id)) figure out how to store the session
exports.user_create_get = function(req, res, next) { 
    res.render('user_signup', {title: 'Sign Up'});
};

// handle User create on POST
exports.user_create_post =  [
    // Validate the User form
    body('email', 'Email Address required').isLength({ min: 1 }).trim(),
    body('username', 'Username required').isLength({ min: 1 }).trim(),
    body('password', 'Password required').isLength({ min: 1 }).trim(),
    body('passwordConf', 'PasswordConf required').isLength({ min: 1 }).trim(),
    
    //create some logic to ensure the passwords match
    
    // Sanitize the form's fields
    sanitizeBody('email').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('passwordConf').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a user object with escaped and trimmed data.
        var userData = { 
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                passwordConf: req.body.passwordConf
            };

        User.create(userData, function (err, user) {
            if (err) {
                return next(err);
            } else {
                // User saved. Redirect to user detail page
                res.redirect(user.url);
            }
        });
    }
];

//
// display User create form on GET
//input#userid.form-control(type='hidden', name=userid value=(undefined === user ? '' : user._id)) figure out how to store the session
exports.user_login_get = function(req, res, next) { 
    res.render('user_login', {title: 'Log In'});
};

// handle User create on POST
exports.user_login_post =  [
    // Validate the User form
    body('username', 'Username required').isLength({ min: 1 }).trim(),
    body('password', 'Password required').isLength({ min: 1 }).trim(),
    
    // Sanitize the form's fields
    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        User.authenticate(req.body.username, req.body.password, function (error, user) {
            if (error || !user) {
              var err = new Error('Wrong username or password.');
              err.status = 401;
              return next(err);
            } else {
              req.session.userId = user._id;
              console.log(user._id);
              return res.render('index');
            }
          });
    }
];


// logout on GET
exports.user_logout_get = function(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
            return next(err);
        } else {
            return res.redirect('/');
        }
      });
    }
};

// display User delete form on GET
exports.user_delete_get = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        
        if (results.user === null) { // No results.
            res.redirect('user/' + req.params.id);
        }
        
        // Successful, so render.
        res.render('user_delete', {title: 'Delete User', user: results.user});
    });
};

// handle User delete on POST
exports.user_delete_post = function(req, res, next) {
    async.parallel({
        user: function(callback) {
          User.findById(req.body.userid).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
            if (err) { return next(err); }
            // Success - go to user list
            res.render('index');
        });
    });
};

// display user update form on GET.
exports.user_update_get = function(req, res, next) {
    // Get User for form
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        }
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.user === null) { // No results.
                var err = new Error('User not found');
                err.status = 404;
                return next(err);
            }
            // Success.

            res.render('user_signup', { title: 'Update User', user: results.user });
        });
};

// handle user update on POST.
exports.user_update_post = [
    // Validate fields.
    body('firstName', 'First Name must not be empty.').isLength({ min: 1 }).trim(),
    body('lastName', 'Last Name must not be empty.').isLength({ min: 1 }).trim(),
    body('username', 'Username must not be empty.').isLength({ min: 1 }).trim(),
    body('email', 'Email Address must not be empty.').isLength({ min: 1 }).trim(),
    body('mobile', 'Mobile Number must not be empty.').isLength({ min: 1 }).trim(),
    body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('firstName').trim().escape(),
    sanitizeBody('lastName').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('email').trim().escape(),
    sanitizeBody('mobile').trim().escape(),
    sanitizeBody('password').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a User object with escaped/trimmed data and old id.
        var user = new User(
          { firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (errors.isEmpty()) {
            // Data from form is valid. Update the record.
            User.findByIdAndUpdate(req.params.id, user, {}, function (err,theUser) {
                if (err) { return next(err); }
                   // Successful - redirect to user detail page.
                   res.redirect(theUser.url);
            });
        }
    }
];