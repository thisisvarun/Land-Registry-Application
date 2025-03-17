const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  landId: { type: Number, required: true },
  surveyNumber: { type: String, required: true },
  details: { type: String, required: true },
  isListed: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
});

module.exports = mongoose.model('Land', landSchema);