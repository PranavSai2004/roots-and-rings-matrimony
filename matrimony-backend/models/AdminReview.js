const mongoose = require("mongoose");

const adminReviewSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },

  action: {
    type: String,
    enum: ["approved", "rejected", "changes_requested"],
    required: true
  },

  form1ReviewStatusBefore: String,

  form1ReviewStatusAfter: String,

  photosReviewStatusBefore: String,

  photosReviewStatusAfter: String,

  form2ReviewStatusBefore: String,

  form2ReviewStatusAfter: String,

  adminNotes: String,

  rejectionReason: String,

  changesRequested: String

}, { timestamps: true });

module.exports = mongoose.model("AdminReview", adminReviewSchema, "admin_reviews");
