const mongoose = require("mongoose");

const userInterestSchema = new mongoose.Schema({
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

  targetProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  interested: {
    type: Boolean,
    default: true
  },

  adminNotified: {
    type: Boolean,
    default: false
  },

  interestStatus: {
    type: String,
    enum: ["pending", "contacted", "meeting_scheduled", "closed"],
    default: "pending"
  },

  adminNotes: String,

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index across the batch, recipient, and target candidate trio to allow multiple likes per batch
userInterestSchema.index({ batchId: 1, recipientUserId: 1, targetProfileId: 1 }, { unique: true });

module.exports = mongoose.model("UserInterest", userInterestSchema);
