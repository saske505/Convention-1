var express = require('express');
var router = express.Router();

var booking_controller = require('../controllers/booking');

router.get('/', booking_controller.bookings);

router.get('/:id', booking_controller.booking);

router.post('/book/:id', booking_controller.requiresLogin, booking_controller.book);
module.exports = router;
