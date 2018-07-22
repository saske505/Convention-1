var mongoose = require('mongoose');

// create booking schema
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

// virtual for Booking's URL
BookingSchema.virtual('url').get(function () {
  return '/booking/' + this._id;
});

var User = mongoose.model('Booking', BookingSchema);

// export booking Model
module.exports = User;