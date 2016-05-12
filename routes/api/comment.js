var express = require('express');
var utils = require('../../controllers/utils');
var _ = require('lodash');
var Promise = require('bluebird');

var Book = require('../../models/book');
var Comment = require('../../models/comment');

var router = express.Router();

// router.use(utils.checkHeader);

router.get('/:bookId', function(req, res, next) {
    Comment.find({book: req.params.bookId})
        .populate('user', '-password -__v')
        .then(function(comments) {
            res.json({
                status: 1,
                data: comments
            });
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

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
            var comment = Comment(req.body);
            comment.user = req.user._id;
            comment.book = book._id;
            return comment.save();
        })
        .then(function(comment) {
            if (comment) {
                comment.user = req.user;
                res.json({
                    status: 1,
                    message: 'created',
                    data: {
                      '_id': comment._id,
                      book: comment.book,
                      user: req.user,
                      content: comment.content,
                      createdAt: comment.createdAt,
                      updatedAt: comment.updatedAt
                    }
                });
            } else {
                res.json({
                    status: 0,
                    message: 'not created'
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

router.put('/:id', utils.basicAuth, function(req, res, next) {
    new Promise(function(resolve, reject) {
        Comment.findById(req.params.id)
            .then(function(comment) {
                if (!comment) {
                    reject({
                        status: 0,
                        message: 'not found'
                    });
                } else {
                    if (req.user._id !== comment.user.toString() && !req.user.admin) {
                        reject({
                            status: 0,
                            message: 'no permission'
                        });
                    } else {
                        resolve(comment);
                    }
                }
            });
    })
        .then(function(comment) {
            _.assign(comment, req.body);
            return comment.save();
        })
        .then(function() {
            res.json({
                status: 1,
                message: 'updated'
            });
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

router.delete('/:id', utils.basicAuth, function(req, res, next) {
    new Promise(function(resolve, reject) {
        Comment.findById(req.params.id)
            .then(function(comment) {
                if (!comment) {
                    reject({
                        status: 0,
                        message: 'not found'
                    });
                } else {
                    if (req.user._id !== comment.user.toString() && !req.user.admin) {
                        reject({
                            status: 0,
                            message: 'no permission'
                        });
                    } else {
                        resolve(comment._id);
                    }
                }
            });
    })
        .then(function(id) {
            return Comment.findByIdAndRemove(id);
        })
        .then(function () {
            res.json({
                status: 1,
                message: 'deleted'
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
