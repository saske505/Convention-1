var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/user');

router.get('/signup', user_controller.signup_get);

router.post('/signup', user_controller.signup_post);

router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post);

router.get('/logout', user_controller.user_logout_get);

router.get('/:id/delete', user_controller.requiresLogin, user_controller.user_delete_get);

router.post('/:id/delete', user_controller.requiresLogin, user_controller.user_delete_post);

router.get('/:id/update', user_controller.requiresLogin, user_controller.user_update_get);

router.post('/:id/update', user_controller.requiresLogin, user_controller.user_update_post);

router.get('/:id/changepassword', user_controller.requiresLogin, user_controller.user_changepassword_get);

router.post('/:id/changepassword', user_controller.requiresLogin, user_controller.user_changepassword_post);

router.get('/:id', user_controller.requiresLogin, user_controller.user);

module.exports = router;
