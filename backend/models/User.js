const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false, // Made optional
    unique: false,   // No longer unique if optional
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['manager', 'user'],
    default: 'user',
  },
});

module.exports = mongoose.model('User', UserSchema);
