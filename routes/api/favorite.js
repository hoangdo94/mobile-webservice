var express = require('express');
var utils = require('../../controllers/utils');
var _ = require('lodash');
var Promise = require('bluebird');

var User = require('../../models/user');
var Book = require('../../models/book');
var Favorite = require('../../models/favorite');

var router = express.Router();

// get favorite books of an user
router.get('/user/:id', function(req, res, next) {
    Favorite.find({userId: req.params.id})
        .then(function(favorites) {
            var ids = _.map(favorites, function(favorite) {
              return favorite.bookId;
            });
            return Book.find({_id: {$in: ids}});
        })
        .then(function(books) {
            res.json({
                status: 1,
                data: books
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
    Favorite.find({bookId: req.params.id})
        .then(function(favorites) {
            var ids = _.map(favorites, function(favorite) {
              return favorite.userId;
            });
            return User.find({_id: {$in: ids}});
        })
        .then(function(users) {
            var refinedUsers = _.map(users, function(user) {
                user = JSON.parse(JSON.stringify(user));
                return _.omit(user, ['password', '__v']);
              });
            res.json({
                status: 1,
                data: refinedUsers
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
            .then(function (book) {
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
            bookId: book._id,
            userId: req.user._id
          });
          return favorite.save();
        })
        .then(function(favorite) {
            if (favorite) {
                res.json({
                    status: 1,
                    message: 'Added to favorited list'
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
    var userId = req.user._id;
    new Promise(function(resolve, reject) {
        Favorite.findOne({
          userId: userId,
          bookId: req.params.bookId
        })
            .then(function (favorite) {
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
                status: 0,
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

module.exports = router;
