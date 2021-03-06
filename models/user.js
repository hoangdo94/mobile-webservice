var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var userSchema = new Schema({
    name: { type: String, min: 3, max: 20 },
    username: { type: String, required: true, unique: true, match: /^[a-z0-9_-]{3,16}$/ },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/ },
    avatar: { type: String, default: 'default.png' },
    admin: { type: Boolean, default: false },
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

userSchema.plugin(mongoosePaginate);

var User = mongoose.model('User', userSchema);

module.exports = User;
