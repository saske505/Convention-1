var express = require('express');
var router = express.Router();

// require user controller 
var user_controller = require('../controllers/user');

// GET request for creating a user
router.get('/signup', user_controller.signup_get);

// POST request for creating a user
router.post('/signup', user_controller.signup_post);

// GET request for logging in
router.get('/login', user_controller.login_get);

// POST request for logging in
router.post('/login', user_controller.login_post);

// GET request for logging out
router.get('/logout', user_controller.user_logout_get);

// GET request for deleting a user
router.get('/:id/delete', user_controller.requiresLogin, user_controller.user_delete_get);

// POST request for deleting a user
router.post('/:id/delete', user_controller.requiresLogin, user_controller.user_delete_post);

// GET request for updating a user
router.get('/:id/update', user_controller.requiresLogin, user_controller.user_update_get);

// POST request for updating a user
router.post('/:id/update', user_controller.requiresLogin, user_controller.user_update_post);

// GET request to change a user's password
router.get('/:id/changepassword', user_controller.requiresLogin, user_controller.user_changepassword_get);

// POST request to change a user's password
router.post('/:id/changepassword', user_controller.requiresLogin, user_controller.user_changepassword_post);

// GET request for a user's details
router.get('/:id', user_controller.requiresLogin, user_controller.user);

module.exports = router;
