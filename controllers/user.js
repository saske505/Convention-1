var async = require('async');

// require user model
var User = require('../models/user');

// require functions from express-validator
var { check, validationResult } = require('express-validator/check');
var { sanitizeBody } = require('express-validator/filter');

// this method ensures users have to be logged in to access the pages
exports.requiresLogin = function (req, res, next) {
    console.log(req.session);
    
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        
        err.status = 401;
        
        return next(err);
    }
};

// redirects th user to the home page
exports.index = function (req, res) {   
    res.redirect('/');
};

// display detail page for a specific user
exports.user_detail = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
              .exec(callback);
        }
    }, function(err, results) {
        if (err) { 
            return next(err);
        }
        if (results.user === null) { 
            var err = new Error('User not found.');
            
            err.status = 404;
            
            return next(err);
        }
        
        // successful, so render
        res.render('user_detail', {title: 'User', user:  results.user});
    });
};

// display user create form on GET
exports.user_signup_get = function(req, res, next) { 
    res.render('user_signup', {title: 'Sign Up'});
};

// handle user create on POST
exports.user_signup_post =  [
    // validate the user form
    check('email', 'Email Address required')
        .isLength({min: 1})
        .trim(),
//    check('email', 'Invalid email address')
//        .isEmail(),
    check('username', 'Username required')
        .isLength({min: 1})
        .trim(),
    check("password", 'Password required')
        .isLength({min: 1})
        .trim(),
    check('passwordConf', 'Passwords do not match')
        .isLength({min: 1})
        .custom((value, { req }) => value === req.body.password),
    
    // create some logic to ensure the passwords match
    
    // sanitize the form's fields
    sanitizeBody('email').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('passwordConf').trim().escape(),

    // process request after validation and sanitization
    (req, res, next) => {
        // extract the validation errors from a request
        var errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // There are errors, render the form again with sanitized values/error messages
            res.render('user_signup', {title: 'Sign Up', errors: errors.array()});
        } else {
            // create a user object with escaped and trimmed data
            var userData = { 
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            };

            User.create(userData, function (err, user) {
                if (err) {
                    return next(err);
                } else {
                    req.session.userId = user._id;
                    // user saved, redirect to user detail page
                   res.render('user_detail', {title: 'User', user: user, session: req.session});
                }
            });
        }
    }
];

//
// display user create form on GET
exports.user_login_get = function(req, res, next) { 
    res.render('user_login', {title: 'Log In'});
};

// handle user create on POST
exports.user_login_post =  [
    // validate the user form
    check('username', 'Username required')
        .isLength({min: 1})
        .trim(),
    check("password", 'Password required')
        .exists()
        .isLength({min: 1})
        .trim(),
    
    // sanitize the form's fields
    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').trim().escape(),

    // process request after validation and sanitization
    (req, res, next) => {
        // extract the validation errors from a request
        var errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // There are errors, render the form again with sanitized values/error messages
            
            res.render('user_login', {title: 'Log In', errors: errors.array()});
        } else {
            User.authenticate(req.body.username, req.body.password, function (error, user) {
                if (error || !user) {
                    res.render('user_login', {title: 'Log In', authFail: 'Unable to log in with username/password.'});
                } else {
                    req.session.userId = user._id;

                    res.render('user_detail', {title: 'User', user: user, session: req.session});
                }
            });
        }
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

// display user delete form on GET
exports.user_delete_get = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) { 
            return next(err);
        }
        
        if (results.user === null) {
            // no results
            res.redirect('user/' + req.params.id);
        }
        
        // successful, so render
        res.render('user_delete', {title: 'Delete User', user: results.user});
    });
};

// handle user delete on POST
exports.user_delete_post = function(req, res, next) {
    async.parallel({
        user: function(callback) {
            User.findById(req.body.userid).exec(callback);
        }
    }, function(err, results) {
        if (err) { 
            return next(err);
        }
        
        // success
        User.findByIdAndRemove(req.body.userid, function deleteUser(err) {
            if (err) {
                return next(err);
            }
            
            // success
            res.render('index');
        });
    });
};

// display user update form on GET
exports.user_update_get = function(req, res, next) {
    // get user for form
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) { 
            return next(err);
        }

        if (results.user === null) { 
            // no results
            var err = new Error('User not found.');

            err.status = 404;

            return next(err);
        }

        // success
        res.render('user_update', {title: 'Update User', user: results.user});
    });
};

// handle user update on POST
exports.user_update_post = [
    // validate the user form
    check('email', 'Email Address required')
        .isLength({min: 1})
        .trim(),
//    check('email', 'Invalid email address')
//        .isEmail(),
    check('username', 'Username required')
        .isLength({min: 1})
        .trim(),
    
    // sanitize the form's fields
    sanitizeBody('email').trim().escape(),
    sanitizeBody('username').trim().escape(),

    // process request after validation and sanitization
    (req, res, next) => {
        // extract the validation errors from a request
        var errors = validationResult(req);
        
        var oldUser = function(callback) {
            User.findById(req.body.userid).exec(callback);
        };
    
        if (!errors.isEmpty()) {
            // there are errors, render form again with sanitized values/error messages
            res.render('user_update', { title: 'Update User', user: oldUser, errors: errors.array() });
            
            return;
        }
        else {
            // create a user object with escaped/trimmed data and old id
            var user = new User({ 
                email: req.body.email,
                username: req.body.username,
                _id:req.params.id
            });
            
            User.findByIdAndUpdate(req.params.id, user, {}, function (err,theuser) {
                if (err) {
                    return next(err);
                }
                
                // successful
                res.redirect(theuser.url);
            });
        }
    }
];