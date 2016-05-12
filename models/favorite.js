var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var favoriteSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: Date,
    updatedAt: Date
});

favoriteSchema.index({book: 1, user: 1}, {unique: true});

favoriteSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});

favoriteSchema.plugin(mongoosePaginate);

var Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
