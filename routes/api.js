var express = require('express');
var utils = require('../controllers/utils');
var router = express.Router();
var userAPI = require('./api/user');
var authAPI = require('./api/auth');
var uploadAPI = require('./api/upload');
var bookAPI = require('./api/book');
var commentAPI = require('./api/comment');
var favoriteAPI = require('./api/favorite');
var locationAPI = require('./api/location');

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Mobile Webservice' });
});

router.use(utils.cors);

router.use('/upload', uploadAPI);
router.use('/auth', authAPI);
router.use('/users', userAPI);
router.use('/books', bookAPI);
router.use('/comments', commentAPI);
router.use('/favorites', favoriteAPI);
router.use('/locations', locationAPI);

module.exports = router;
