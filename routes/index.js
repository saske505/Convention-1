var express = require('express');

var router = express.Router();
    
// redirect '/' to index
router.get('/', function(req, res, next) {
    res.render('index');
});

// GET home page
router.get('/index', function(req, res, next) {
    res.render('index');
});

module.exports = router;