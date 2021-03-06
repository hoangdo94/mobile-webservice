var express = require('express');
var utils = require('../../controllers/utils');
var pushbots = require('../../controllers/pushbots');
var _ = require('lodash');
var Promise = require('bluebird');

var User = require('../../models/user');
var Book = require('../../models/book');
var Favorite = require('../../models/favorite');

var router = express.Router();

// get favorite books of an user
router.get('/user/:id', function(req, res, next) {
    var options = {
        populate: {
            path: 'book',
            select: '-__v'
        },
        sort: {
            createdAt: -1
        }
    };
    if ((page = Math.abs(parseInt(req.query.page))) > 0) {
      options.page = page;
    }
    if ((limit = Math.abs(parseInt(req.query.perPage))) > 0) {
      options.limit = limit;
    }
    Favorite.paginate({
            user: req.params.id
        }, options)
        .then(function(result) {
            res.json({
                status: 1,
                total: result.total,
                perPage: result.limit,
                page: result.page,
                pages: result.pages,
                data: _.map(result.docs, function(favorite) {
                    return favorite.book;
                })
            });
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

// get list of users who added this book to favorite
router.get('/book/:id', function(req, res, next) {
    var options = {
        populate: {
            path: 'user',
            select: '-password -__v'
        },
        sort: {
            createdAt: -1
        }
    };
    if ((page = Math.abs(parseInt(req.query.page))) > 0) {
      options.page = page;
    }
    if ((limit = Math.abs(parseInt(req.query.perPage))) > 0) {
      options.limit = limit;
    }
    Favorite.paginate({
            book: req.params.id
        }, options)
        .then(function(result) {
            res.json({
                status: 1,
                total: result.total,
                perPage: result.limit,
                page: result.page,
                pages: result.pages,
                data: _.map(result.docs, function(favorite) {
                    return favorite.user;
                })
            });
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

// add book to favorite list
router.post('/:bookId', utils.basicAuth, function(req, res, next) {
    new Promise(function(resolve, reject) {
            Book.findById(req.params.bookId)
                .then(function(book) {
                    if (book) {
                        resolve(book);
                    } else {
                        reject({
                            status: 0,
                            message: 'Book not found'
                        });
                    }
                });
        })
        .then(function(book) {
            var favorite = Favorite({
                book: book._id,
                user: req.user._id
            });
            pushbots.sendPushNotification(book.userId, {
              message: req.user.username + ' đã thích cuốn sách "' + book.title + '" của bạn',
              image: 'http://api.ws.hoangdo.info/images/' + book.cover,
              nextActivity: 'hcmut.cse.bookslover.BookDetailsActivity',
              fields: {
                bookId: book._id,
                BigTextStyle: true,
                bigText: req.user.username + ' đã thích cuốn sách "' + book.title + '" của bạn'
              }
            });
            return favorite.save();
        })
        .then(function(favorite) {
            if (favorite) {
                res.json({
                    status: 1,
                    message: 'Added to favorited list',
                    data: favorite
                });
            } else {
                res.json({
                    status: 0,
                    message: 'Not added to favorited list'
                });
            }
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

// remove book from favorite list
router.delete('/:bookId', utils.basicAuth, function(req, res, next) {
    var user = req.user._id;
    new Promise(function(resolve, reject) {
            Favorite.findOne({
                    user: user,
                    book: req.params.bookId
                })
                .then(function(favorite) {
                    if (favorite) {
                        resolve(favorite._id);
                    } else {
                        reject({
                            status: 0,
                            message: 'Favorite not found'
                        });
                    }
                });
        })
        .then(function(favoriteId) {
            return Favorite.findByIdAndRemove(favoriteId);
        })
        .then(function() {
            res.json({
                status: 1,
                message: 'Removed from favorited list'
            });
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

router.get('/check/:bookId', utils.basicAuth, function(req, res, next) {
    var user = req.user._id;
    Favorite.findOne({user: user, book: req.params.bookId})
      .then(function(favorite) {
          if (favorite) {
            res.json({
                status: 1,
                data: true
            });
          } else {
            res.json({
                status: 1,
                data: false
            });
          }
      })
      .catch(function(err) {
          res.json({
              status: 0,
              message: err.errmsg || err.message
          });
      });
});

module.exports = router;
