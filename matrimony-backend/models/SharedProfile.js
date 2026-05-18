const mongoose = require("mongoose");

const sharedProfileSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },

  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  limitedProfileData: {
    name: String,
    age: Number,
    occupation: String,
    caste: String,
    city: String,
    primaryImage: String
  },

  expiresAt: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  },

  viewedAt: Date,

  isViewed: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SharedProfile", sharedProfileSchema);
