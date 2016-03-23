var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    location: {
        placeName: String,
        longitude: Number,
        latitude: Number
    },
    meta: {
        age: Number,
        website: String
    },
    createdAt: Date,
    updatedAt: Date
});

userSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});

var User = mongoose.model('User', userSchema);

module.exports = User;