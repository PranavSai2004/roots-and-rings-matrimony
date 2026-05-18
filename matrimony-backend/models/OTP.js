const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  msg91RequestId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast lookup
otpSchema.index({ mobile: 1, used: 1 });
// TTL Index - auto-delete after 10 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
