var express = require('express');
var router = express.Router();

var product_controller = require('../controllers/product');

router.get('/', product_controller.products_get);

module.exports = router;
