var express = require('express');
var router = express.Router();

var booking_controller = require('../controllers/booking');

router.get('/', booking_controller.bookings);

router.get('/:id', booking_controller.booking);

module.exports = router;
