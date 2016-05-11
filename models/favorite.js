var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    bookId: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: Date,
    updatedAt: Date
});

favoriteSchema.index({bookId: 1, userId: 1}, {unique: true});

favoriteSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});

var Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
