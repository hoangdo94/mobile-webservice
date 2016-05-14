var express = require('express');
var _ = require('lodash');
var utils = require('../../controllers/utils');
var Location = require('../../models/location');

var router = express.Router();

router.post('/', utils.basicAuth, function(req, res, next) {
    var loc = Location(req.body);
    loc.user = req.user._id;
    loc.save()
      .then(function() {
          res.json({
              status: 1,
              message: 'Recorded location'
          });
      })
      .catch(function(err) {
          res.json({
              status: 0,
              message: err.errmsg || err.message
          });
      });
});

router.get('/', utils.basicAuth, function(req, res, next) {
    Location.find({user: req.user._id})
      .sort({createdAt: -1})
      .limit(5)
      .then(function(locs) {
          res.json({
            status: 1,
            data: locs
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
