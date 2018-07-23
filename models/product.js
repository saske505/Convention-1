var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    cost_price: {
        type: Number,
        required: true
    },
    selling_price: {
        type: Number,
        required: true
    },
    items_in_stock: {
        type: Number,
        required: true
    }
});

// virtual for Products's URL
ProductSchema.virtual('url').get(function() {
    return '/product/' + this._id;
});

var Product = mongoose.model('Product', ProductSchema);

// export product Model
module.exports = Product;