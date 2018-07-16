var express = require('express');
var router = express.Router();

// require controller modules
var user_controller = require('../controllers/user');
var order_controller = require('../controllers/order');

/// USER ROUTES ///

// GET catalog home page
router.get('/', user_controller.index);

// GET request for creating a User. NOTE This must come before routes that display User (uses id)
router.get('/user/create', user_controller.user_create_get);

// POST request for creating User
router.post('/user/create', user_controller.user_create_post);

// GET request to delete User
router.get('/user/:id/delete', user_controller.user_delete_get);

// POST request to delete User
router.post('/user/:id/delete', user_controller.user_delete_post);

// GET request to update User
router.get('/user/:id/update', user_controller.user_update_get);

// POST request to update User
router.post('/user/:id/update', user_controller.user_update_post);

// GET request for one User
router.get('/user/:id', user_controller.user_detail);

// GET request for list of all Users
router.get('/users', user_controller.user_list);

/// ORDER ROUTES ///

// GET request for creating a Order. NOTE This must come before route that displays Order (uses id)
router.get('/order/create', order_controller.order_create_get);

// POST request for creating Order
router.post('/order/create', order_controller.order_create_post);

// GET request to delete Order
router.get('/order/:id/delete', order_controller.order_delete_get);

// POST request to delete Order
router.post('/order/:id/delete', order_controller.order_delete_post);

// GET request for one Order
router.get('/order/:id', order_controller.order_detail);

// GET request for list of all Orders
router.get('/orders', order_controller.order_list);

module.exports = router;