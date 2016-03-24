var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');
var bcrypt = require('bcrypt');

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

var handleImage = function(file) {
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

var refineData = function(data, file) {
    return new Promise(function(resolve, reject) {
        Promise.all([hashPassword(data.password), handleImage(file)])
            .then(function(res) {
                data.password = res[0];
                data.avatar = res[1];
                resolve(data);
            })
            .catch(function(err) {
                reject(err);
            });
    });
}

module.exports = {
    hashPassword: hashPassword,
    compareHash: compareHash,
    handleImage: handleImage,
    refineData: refineData
};