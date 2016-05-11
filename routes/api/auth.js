var express = require('express');
var _ = require('lodash');
var User = require('../../models/user');
var utils = require('../../controllers/utils');
var router = express.Router();

router.post('/', utils.basicAuth, function(req, res, next) {
    User.findById(req.user._id, {'password': 0, '__v': 0})
        .then(function(user) {
            if (user) {
                user._id = user._id.toString();
                res.json({
                    status: 1,
                    data: user
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

module.exports = router;
