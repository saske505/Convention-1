var express = require('express');
var router = express.Router();

var product_controller = require('../controllers/product');

router.get('/', product_controller.products_get);

router.get('/create', product_controller.create_get);

router.post('/create', product_controller.create_post);

router.get('/:id', product_controller.product_get);

router.get('/:id/delete', product_controller.delete_get);

router.post('/:id/delete', product_controller.delete_post);

router.get('/:id/update', product_controller.update_get);

router.post('/:id/update', product_controller.update_post);

module.exports = router;
