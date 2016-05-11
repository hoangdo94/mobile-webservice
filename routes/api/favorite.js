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
    Favorite.find({user: req.params.id})
        .populate('book')
        .then(function(favorites) {
            var books = _.map(favorites, function(favorite) {
              return favorite.book;
            });
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
    Favorite.find({book: req.params.id})
        .populate('user', '-password -__v')
        .then(function(favorites) {
            var users = _.map(favorites, function(favorite) {
                return favorite.user;
            });
            res.json({
                status: 1,
                data: users
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
            book: book._id,
            user: req.user._id
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
          user: userId,
          book: req.params.bookId
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
