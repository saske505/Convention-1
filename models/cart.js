var mongoose = require('mongoose');

var CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    total: {
        type: String,
        required: true
    }
});

CartSchema.virtual('url').get(function () {
    return '/cart/' + this._id;
});

var Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;