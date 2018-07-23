#! /usr/bin/env node

console.log('This script populates some test products to my database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    
    return;
}

var mongoose = require('mongoose');
var async = require('async');

// require models
var Product = require('./models/product');

var mongoDB = userArgs[0];

mongoose.connect(mongoDB);

mongoose.Promise = global.Promise;

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = [];

function productCreate(name, sku, cost_price, selling_price, items_in_stock, cb) {
    productDetail = { 
        name: name,
        sku: sku,
        cost_price: cost_price,
        selling_price: selling_price,
        items_in_stock: items_in_stock
    };
    
    var product = new Product(productDetail);  
  
    product.save(function(err) {
        if (err) {
          cb(err, null);

          return;
        }
    
        console.log('New Product: ' + product);

        products.push(product);

        cb(null, product);
    });
};

function createProducts(cb) {
    async.parallel(
    [
        function(callback) {
            productCreate('2 Sleeper','ref1',1000,1500,10, callback);
        },
        function(callback) {
            productCreate('3 Sleeper','ref2',800,1300,15, callback);
        },
        function(callback) {
            productCreate('5 Sleeper','ref3',500,1000,20, callback);
        }
    ],cb
    );
}

async.series(
[
    createProducts
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Products: ' + products);
    }

    // All done, disconnect from database
    mongoose.connection.close();
});