var express = require('express');

var router = express.Router();
    
var cart_controller = require('../controllers/cart');

router.get('/:id', cart_controller.requiresLogin, cart_controller.cart_get);

module.exports = router;