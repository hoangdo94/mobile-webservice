var Promise = require('bluebird');
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

var refineData = function(data) {
    return new Promise(function(resolve, reject) {
        if (!data.password) {
            resolve(data);
        }
        hashPassword(data.password)
            .then(function(hash) {
                console.log(hash);
                data.password = hash;
                console.log(data);
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
    refineData: refineData
};