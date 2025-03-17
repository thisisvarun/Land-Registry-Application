const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  privateKey: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, enum: ['civilian', 'government'], default: 'civilian' },
});

module.exports = mongoose.model('User', userSchema);