var express = require('express');
var router = express.Router();

// require user controller 
var booking_controller = require('../controllers/booking');

// GET request to view all bookings
router.get('/', booking_controller.booking);

module.exports = router;
