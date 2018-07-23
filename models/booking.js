var mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    price: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    quantity: {
        type: String,
        required: true
    }
});

BookingSchema.virtual('url').get(function() {
    return '/booking/' + this._id;
});

var User = mongoose.model('Booking', BookingSchema);

module.exports = User;