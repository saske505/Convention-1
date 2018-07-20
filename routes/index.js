var express = require('express');

var router = express.Router();
    
// redirect '/' to index
router.get('/', function(req, res, next) {
    res.render('index', {session: req.session});
});

// GET home page
router.get('/index', function(req, res, next) {
    res.render('index', {session: req.session});
});

module.exports = router;