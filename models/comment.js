var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String},
    content: { type: String, required: true },
    createdAt: Date,
    updatedAt: Date
});

commentSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
