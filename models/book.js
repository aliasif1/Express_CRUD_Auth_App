const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    author: String,
    title: String,
    pages: Number,
});

module.exports = mongoose.model('book', bookSchema);