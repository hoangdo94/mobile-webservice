var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var bookSchema = new Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishYear: { type: Number },
    genres: { type: [String] },
    review: { type: String, required: true },
    cover: { type: String, default: 'default.png' },
    createdAt: Date,
    updatedAt: Date
});

bookSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});

bookSchema.plugin(mongoosePaginate);

var Book = mongoose.model('Book', bookSchema);

module.exports = Book;
