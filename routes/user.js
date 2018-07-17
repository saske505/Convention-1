var express = require('express');
var router = express.Router();

// require user controller 
var user_controller = require('../controllers/user');

// GET request for creating a User. NOTE This must come before routes that display User (uses id)
router.get('/signup', user_controller.user_create_get);

// POST request for creating User
router.post('/signup', user_controller.user_create_post);

// GET request for logging in
router.get('/login', user_controller.user_login_get);

// POST request for logging in
router.post('/login', user_controller.user_login_post);

// GET /logout
router.get('/logout', user_controller.user_logout_get);

// GET request for one User
router.get('/:id', user_controller.requiresLogin, user_controller.user_detail);

module.exports = router;
