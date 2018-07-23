var bcrypt = require('bcrypt');

var User = require('../models/user');
var Cart = require('../models/cart');

var {check, validationResult} = require('express-validator/check');
var {sanitizeBody} = require('express-validator/filter');

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

exports.user = function(req, res, next) {
    User.findById(req.params.id)
    .exec(function(err, user) {
        if (err) {
            return next(err);
        } else {
            res.render('user', {user: user});
        }
    });
};

exports.signup_get = function(req, res, next) { 
    res.render('signup');
};

exports.signup_post =  [
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
    
    sanitizeBody('email').trim().escape(),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('passwordConf').trim().escape(),

    (req, res, next) => {
        var errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            res.render('signup', {errors: errors.array()});
        } else {
            var userData = { 
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            };

            User.create(userData, function(err, user) {
                if (err) {
                    return next(err);
                } else {
                    var cartData = {
                        user: user,
                        total: 0
                    }
                    
                    Cart.create(cartData, function(err, cart) {
                        if (err) {
                            return next(err);
                        } else {
                            req.session.userid = user._id;
                            req.session.cartid = cart._id;
                            
                            res.render('user', {user: user});
                        }
                    });
                }
            });
        }
    }
];

exports.login_get = function(req, res, next) { 
    res.render('login');
};

exports.login_post =  [
    check('username', 'Username required')
        .isLength({min: 1})
        .trim(),
    check("password", 'Password required')
        .exists()
        .isLength({min: 1})
        .trim(),
    
    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').trim().escape(),

    (req, res, next) => {
        var errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            res.render('login', {errors: errors.array()});
        } else {
            User.authenticate(req.body.username, req.body.password, function(error, user) {
                if (error || !user) {
                    res.render('login', {authFail: 'Unable to log in with username/password.'});
                } else {
                    Cart.findOne({user: user})
                    .exec(function(err, cart) {
                        if (err) {
                            return next(err);
                        } else {
                            req.session.userid = user._id;
                            req.session.cartid = cart._id;
                            
                            res.render('user', {user: user});
                        }
                    });
                }
            });
        }
    }
];


exports.user_logout_get = function(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/user/login');
            }
        });
    }
};

exports.user_delete_get = function(req, res, next) {
    User.findById(req.params.id)
    .exec(function(err, user) {
        if (err) {
            res.redirect('user/' + req.params.id);
        } else {
            res.render('user_delete', {user: user});
        }
    });
};

exports.user_delete_post = function(req, res, next) {
    User.findById(req.params.id)
    .exec(function(err, user) {
        if (err) { 
            return next(err);
        } else {
            User.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    return next(err);
                }

                req.session.destroy(function(err) {
                    if (err) {
                        return next(err);
                    } else {
                        return res.redirect('/user/login');
                    }
                });
            });
        }
    });
};

exports.user_update_get = function(req, res, next) {
    User.findById(req.params.id)
    .exec(function(err, user) {
        if (err) { 
            return next(err);
        } else {
            res.render('user_update', {user: user});
        }
    });
};

exports.user_update_post = [
    check('email', 'Email Address required')
        .isLength({min: 1})
        .trim(),
//    check('email', 'Invalid email address')
//        .isEmail(),
    check('username', 'Username required')
        .isLength({min: 1})
        .trim(),
    
    sanitizeBody('email').trim().escape(),
    sanitizeBody('username').trim().escape(),

    (req, res, next) => {
        var errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            res.render('user_update', {errors: errors.array()});
            
            return;
        }
        else {
            var user = new User({ 
                email: req.body.email,
                username: req.body.username,
                _id:req.params.id
            });
            
            User.findByIdAndUpdate(req.params.id, user, {}, function(err) {
                if (err) {
                    return next(err);
                } else {
                    req.session.userid = user._id;

                    res.render('user', {user: user});
                }
            });
        }
    }
];

exports.user_changepassword_get = function(req, res, next) {
    User.findById(req.params.id)
    .exec(function(err, user) {
        if (err) { 
            return next(err);
        } else {
            res.render('user_changepassword');
        }
    });
};

exports.user_changepassword_post = [
    check("password", 'Password required')
        .isLength({min: 1})
        .trim(),
    check('passwordConf', 'Passwords do not match')
        .isLength({min: 1})
        .custom((value, { req }) => value === req.body.password),
    
    sanitizeBody('password').trim().escape(),
    sanitizeBody('passwordConf').trim().escape(),

    (req, res, next) => {
        var errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            res.render('user_changepassword', {errors: errors.array()});
            
            return;
        }
        else {
            User.findById(req.params.id)
            .exec(function(err, oldUser) {
                if (err) {
                    return next(err);
                } else {
                    bcrypt.hash(req.body.password, 10, function(err, hash) {
                        if (err) {
                            return next(err);
                        } else {
                            req.body.password = hash;

                            var user = new User({
                                email: oldUser.email,
                                username: oldUser.username,
                                password: req.body.password,
                                _id:req.params.id
                            });

                            User.findByIdAndUpdate(req.params.id, user, {}, function(err,updatedUser) {
                                if (err) {
                                    return next(err);
                                } else {
                                    req.session.userid = updatedUser._id;
                                    res.render('user', {user: updatedUser});
                                }
                            }); 
                        }
                    });
                }
            });
        }
    }
];