var express = require('express');
var router = express.Router();
var userAPI = require('./api/user');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Mobile Webservice' });
});

router.use('/users', userAPI);

module.exports = router;
