var express = require('express');
var router = express.Router();

var booking_controller = require('../controllers/booking');

router.get('/', booking_controller.bookings_get);

router.get('/:id', booking_controller.booking_get);

router.post('/book/:id', booking_controller.requiresLogin, booking_controller.book_post);

router.post('/:id/delete', booking_controller.requiresLogin, booking_controller.book_delete_post);

module.exports = router;
