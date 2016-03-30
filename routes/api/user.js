var express = require('express');
var utils = require('../../controllers/utils');
var _ = require('lodash');
var multer  = require('multer');
var upload = multer({ dest: 'tmp/' });
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
        })
    }
    User.find()
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
                message: err.errmsg
            });
        });
});

router.post('/', upload.single('avatar'), function(req, res, next) {
    utils.refineData(req.body, req.file)
        .then(function (data) {
            var user = User(data);
            return user.save();
        })
        .then(function(user) {
            if (user) {
                res.json({
                    status: 1,
                    message: 'created'
                });
            } else {
                res.json({
                    status: 0,
                    message: 'not created'
                })
            }
        })
        .catch(function(err) {
            res.json({
                status: 0,
                message: err.errmsg
            });
        });

});

router.get('/:id', utils.basicAuth, function(req, res, next) {
    if ((req.user._id !== req.params.id) && !req.user.admin) {
        // only admin and the user himself/herself can get user's information
        return res.status(401).json({
            status: 0,
            message: 'no permission'
        })
    }
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
        .catch(function(error) {
            res.json({
                status: 0,
                message: err.errmsg
            });
        });
});

router.put('/:id', utils.basicAuth, upload.single('avatar'), function(req, res, next) {
    if ((req.user._id !== req.params.id) && !req.user.admin) {
        // only admin and the user himself/herself can change user's information
        return res.status(401).json({
            status: 0,
            message: 'no permission'
        })
    }
    Promise.all([User.findById(req.params.id), utils.refineData(req.body, req.file)])
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
                message: err.errmsg
            });
        });
});

router.delete('/:id', utils.basicAuth, function(req, res, next) {
    if (!req.user.admin) {
        // only admin can delete user
        return res.status(401).json({
            status: 0,
            message: 'no permission'
        })
    }
    User.findByIdAndRemove(req.params.id)
        .then(function() {
            res.json({
                status: 1,
                message: 'deleted'
            });
        })
        .catch(function(error) {
            res.json({
                status: 0,
                message: err.errmsg
            });
        })
});

module.exports = router;
