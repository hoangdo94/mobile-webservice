var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookSchema = new Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishYear: { type: Number },
    genres: { type: [String] },
    review: { type: String },
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

var Book = mongoose.model('Book', bookSchema);

module.exports = Book;