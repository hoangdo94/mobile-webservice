var express = require('express');
var _ = require('lodash');
var utils = require('../../controllers/utils');
var multer  = require('multer');
var upload = multer({ dest: 'tmp/' });
var router = express.Router();

router.post('/', upload.single('file'), function(req, res, next) {
    utils.handleFileUpload(req.file)
        .then(function(url) {
            res.json({
                status: 1,
                data: {
                    url: url
                }
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
