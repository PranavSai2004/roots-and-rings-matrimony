const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  createdByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  recipientMobile: {
    type: String,
    required: true
  },

  selectedProfileIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  status: {
    type: String,
    enum: ["active", "expired", "closed"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("Batch", batchSchema);
