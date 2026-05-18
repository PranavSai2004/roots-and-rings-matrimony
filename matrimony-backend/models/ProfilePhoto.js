const mongoose = require("mongoose");

const profilePhotoSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  photoUrl: {
    type: String,
    required: true
  },

  photoType: {
    type: String,
    enum: [
      "headshot",
      "halfBody",
      "threeQuarter",
      "fullBody"
    ],
    required: true
  },

  isPrimary: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("ProfilePhoto", profilePhotoSchema);