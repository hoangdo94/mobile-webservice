var express = require('express');
var _ = require('lodash');
var User = require('../../models/user');
var utils = require('../../controllers/utils');
var router = express.Router();

router.post('/', utils.basicAuth, function(req, res, next) {
    User.findById(req.user._id)
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

module.exports = router;
