var express = require('express');
var router = express.Router();
var userAPI = require('./api/user');
var authAPI = require('./api/auth');
var uploadAPI = require('./api/upload');
var bookAPI = require('./api/book');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Mobile Webservice' });
});

router.use('/upload', uploadAPI);
router.use('/auth', authAPI);
router.use('/users', userAPI);
router.use('/books', bookAPI);

module.exports = router;
