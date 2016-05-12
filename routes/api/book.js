var express = require('express');
var utils = require('../../controllers/utils');
var _ = require('lodash');
var Promise = require('bluebird');

var Book = require('../../models/book');

var router = express.Router();

// router.use(utils.checkHeader);

router.get('/', function(req, res, next) {
    var query = {};
    var options = {};
    if (req.query.userId) {
        query.userId = req.query.userId;
    }
    if (req.query.search) {
        query.$text = {
            $search: req.query.search
        };
        options.select = {
            score: {
                $meta: 'textScore'
            }
        };
        options.sort = {
            score: {
                $meta: 'textScore'
            }
        };
    }
    if (req.query.year) {
        query.publishYear = {};
        if ((min = Math.abs(parseInt(req.query.year.min))) > 0) {
          query.publishYear.$gte = min;
        }
        if ((max = Math.abs(parseInt(req.query.year.max))) > 0) {
          query.publishYear.$lte = max;
        }
    }
    if ((page = Math.abs(parseInt(req.query.page))) > 0) {
        options.page = page;
    }
    if ((limit = Math.abs(parseInt(req.query.perPage))) > 0) {
        options.limit = limit;
    }
    Book.paginate(query, options)
        .then(function(result) {
            res.json({
                status: 1,
                total: result.total,
                perPage: result.limit,
                page: result.page,
                pages: result.pages,
                data: result.docs
            });
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg || err.message
            });
        });
});

router.post('/', utils.basicAuth, function(req, res, next) {
    var book = Book(req.body);
    book.userId = req.user._id;
    book.save()
        .then(function(book) {
            if (book) {
                res.json({
                    status: 1,
                    message: 'created',
                    data: book
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

router.get('/:id', function(req, res, next) {
    Book.findById(req.params.id)
        .then(function(book) {
            if (book) {
                book = JSON.parse(JSON.stringify(book));
                res.json({
                    status: 1,
                    data: _.omit(book, ['__v'])
                });
            } else {
                res.json({
                    status: 0,
                    message: 'not found'
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
            Book.findById(req.params.id)
                .then(function(book) {
                    if (!book) {
                        reject({
                            status: 0,
                            message: 'not found'
                        });
                    } else {
                        if (req.user._id !== book.userId && !req.user.admin) {
                            reject({
                                status: 0,
                                message: 'no permission'
                            });
                        } else {
                            resolve(book);
                        }
                    }
                });
        })
        .then(function(book) {
            _.assign(book, req.body);
            return book.save();
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
            Book.findById(req.params.id)
                .then(function(book) {
                    if (!book) {
                        reject({
                            status: 0,
                            message: 'not found'
                        });
                    } else {
                        if (req.user._id !== book.userId && !req.user.admin) {
                            reject({
                                status: 0,
                                message: 'no permission'
                            });
                        } else {
                            resolve(book._id);
                        }
                    }
                });
        })
        .then(function(id) {
            return Book.findByIdAndRemove(id);
        })
        .then(function() {
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
