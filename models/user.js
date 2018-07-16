var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  }
);

// Virtual for user's URL
UserSchema
.virtual('url')
.get(function () {
  return '/catalog/user/' + this._id;
});

//Export model
module.exports = mongoose.model('User', UserSchema);