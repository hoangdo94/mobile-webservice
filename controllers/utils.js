var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');
var bcrypt = require('bcrypt');
var _ = require('lodash');

var User = require('../models/user');

// Handle password, image in requests
var hashPassword = function(plain) {
    return new Promise(function(resolve, reject) {
        if (!plain) resolve(null);
        bcrypt.genSalt(10, function(err, salt) {
            if (err) reject(err);
            bcrypt.hash(plain, salt, function(err, hash) {
                if (err) reject(err);
                resolve(hash);
            });
        });
    });
};

var compareHash = function(plain, hash) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(plain, hash, function(err, res) {
            if (err) reject(err);
            resolve(res);
        });
    });
};

var handleFileUpload = function(file) {
    return new Promise(function(resolve, reject) {
        if (file) {
            var dest = 'public/images/';
            var ext = path.extname(file.originalname);
            var fileName = file.filename + ext;
            fs.rename(file.path, dest + fileName, function (err) {
                if (err) reject(err);
                resolve(fileName);
            });
        } else {
            resolve(null);
        }
    });
};

var refineData = function(data) {
    return new Promise(function(resolve, reject) {
        Promise.all([hashPassword(data.password)]) // Add more tasks if needed
            .then(function(res) {
                if (res[0] !== null) {
                    data.password = res[0];
                }
                // omit some sensitive fields
                resolve(_.omit(data, ['createdAt', 'updatedAt']));
            })
            .catch(function(err) {
                reject(err);
            });
    });
};


// Middlewares
var cors = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};

var basicAuth = function(req, res, next) {
    var unauthRespone = {
        status: 0,
        message: 'unauthorized'
    };
    var authHeader = req.get('Authorization');
    if (!authHeader) {
        res.status(401).json(unauthRespone);
    } else {
        var credentials = new Buffer(authHeader.replace('Basic ', '').trim(), 'base64').toString().split(':');
        User.findOne({ username: credentials[0] })
            .then(function(user) {
                if (user) {
                    compareHash(credentials[1], user.password)
                        .then(function(result) {
                            if (result) {
                                req.user = {
                                    _id: user._id.toString(),
                                    admin: user.admin
                                };
                                next();
                            } else {
                                res.status(401).json(unauthRespone);
                            }
                        });
                } else {
                    res.status(401).json(unauthRespone);
                }
            })
            .catch(function(err) {
                res.json(err);
            });
    }

};

module.exports = {
    hashPassword: hashPassword,
    compareHash: compareHash,
    handleFileUpload: handleFileUpload,
    refineData: refineData,
    cors: cors,
    basicAuth: basicAuth
};