var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lat: Number,
    long: Number,
    placeName: String,
    createdAt: Date,
    updatedAt: Date
});

locationSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    next();
});


var Location = mongoose.model('Location', locationSchema);

module.exports = Location;
