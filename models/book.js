var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var Comment = require('./comment');
var Favorite = require('./favorite');

var bookSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publishYear: {
        type: Number
    },
    genres: {
        type: [String]
    },
    review: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        default: 'default.png'
    },
    createdAt: Date,
    updatedAt: Date
});

bookSchema.index({
    '$**': 'text'
}, {
    'weights': {
        title: 3,
        author: 2,
        review: 1,
        genres: 1
    }
});

bookSchema.pre('save', function(next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});

bookSchema.plugin(mongoosePaginate);

var Book = mongoose.model('Book', bookSchema);

module.exports = Book;
