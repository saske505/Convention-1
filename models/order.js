var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OrderSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true }, //reference to the associated user
    price: {type: String, required: true}
  }
);

// Virtual for order's URL
OrderSchema
.virtual('url')
.get(function () {
  return '/catalog/order/' + this._id;
});

//Export model
module.exports = mongoose.model('Order', OrderSchema);