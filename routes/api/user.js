var express = require('express');
var utils = require('../../controllers/utils');
var _ = require('lodash');
var Promise = require('bluebird');

var User = require('../../models/user');

var router = express.Router();

router.get('/', function(req, res, next) {
    User.find()
        .then(function(users) {
            res.json(users);
        })
        .catch(function(error) {
            res.json(error);
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
            res.json(err);
        });

});

router.get('/:id', function(req, res, next) {
    User.findById(req.params.id)
        .then(function(user) {
            res.json(user);
        })
        .catch(function(error) {
            res.json(error);
        });
});

router.put('/:id', function(req, res, next) {
    Promise.all([User.findById(req.params.id), utils.refineData(req.body)])
        .then(function(res) {
            if (res[0]) {
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
        .catch(function(error) {
            res.json(error);
        });
});

router.delete('/:id', function(req, res, next) {
    User.findByIdAndRemove(req.params.id)
        .then(function() {
            res.json({
                status: 1,
                message: 'deleted'
            });
        })
        .catch(function(error) {
            res.json(error);
        })
});

module.exports = router;
