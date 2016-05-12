var express = require('express');
var utils = require('../../controllers/utils');
var _ = require('lodash');
var Promise = require('bluebird');

var User = require('../../models/user');

var router = express.Router();

// router.use(utils.checkHeader);

router.get('/', utils.basicAuth, function(req, res, next) {
    if (!req.user.admin) {
        // only admin can get user list
        return res.status(401).json({
            status: 0,
            message: 'no permission'
        });
    }
    var options = {
      select: '-password -__v'
    };
    if ((page = Math.abs(parseInt(req.query.page))) > 0) {
      options.page = page;
    }
    if ((limit = Math.abs(parseInt(req.query.perPage))) > 0) {
      options.limit = limit;
    }
    User.paginate({}, options)
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

router.post('/', function(req, res, next) {
    utils.refineData(req.body)
        .then(function (data) {
            var user = User(data);
            return user.save();
        })
        .then(function(user) {
            if (user) {
                res.json({
                    status: 1,
                    message: 'created',
                    data: user
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
    User.findById(req.params.id)
        .then(function(user) {
            if (user) {
                user = JSON.parse(JSON.stringify(user));
                res.json({
                    status: 1,
                    data: _.omit(user, ['password', '__v'])
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
    if ((req.user._id !== req.params.id) && !req.user.admin) {
        // only admin and the user himself/herself can change user's information
        return res.status(401).json({
            status: 0,
            message: 'no permission'
        });
    }
    Promise.all([User.findById(req.params.id), utils.refineData(req.body)])
        .then(function(res) {
            if (res[0]) {
                if (!req.user.admin) {
                    // prevent normal user to update admin field
                    _.omit(res[1], ['admin']);
                }
                _.assign(res[0], res[1]);

                return res[0].save();
            }
            return Promise.rejected({
                status: 0,
                message: 'not found'
            });
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
    if (!req.user.admin) {
        // only admin can delete user
        return res.status(401).json({
            status: 0,
            message: 'no permission'
        });
    }
    User.findByIdAndRemove(req.params.id)
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
