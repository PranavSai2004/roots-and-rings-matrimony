const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  mobile: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    default: ""
  },

  otpVerified: {
    type: Boolean,
    default: false
  },

  form1Completed: {
    type: Boolean,
    default: false
  },

  form2Completed: {
    type: Boolean,
    default: false
  },

  paymentStatus: {
    type: String,
    default: "pending"
  },

  submittedTransactionId: {
    type: String,
    default: ""
  },

  adminApprovedForForm2: {
    type: Boolean,
    default: false
  },

  accountStatus: {
    type: String,
    default: "pending"
  },

  registrationStep: {
    type: Number,
    default: 0
  },

  form1ReviewStatus: {
    type: String,
    enum: ["pending_review", "approved", "rejected", "changes_requested"],
    default: "pending_review"
  },

  photosReviewStatus: {
    type: String,
    enum: ["pending_review", "approved", "rejected", "changes_requested"],
    default: "pending_review"
  },

  form2ReviewStatus: {
    type: String,
    enum: ["pending_review", "approved", "rejected", "changes_requested"],
    default: "pending_review"
  },

  form2Status: {
    type: String,
    enum: ["locked", "unlocked", "completed"],
    default: "locked"
  },

  adminNotes: {
    type: String,
    default: ""
  },

  lastReviewedAt: Date,

  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "users");