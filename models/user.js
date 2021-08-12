const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    validated: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('user', userSchema);