const mongoose = require("mongoose");

const basicProfileSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  fullName: {
    type: String,
    required: true
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true
  },

  dob: {
    type: Date,
    required: true
  },

  height: {
    type: String
  },

  religion: {
    type: String
  },

  caste: {
    type: String
  },

  motherTongue: {
    type: String
  },

  education: {
    type: String
  },

  profession: {
    type: String
  },

  city: {
    type: String
  },

  state: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("BasicProfile", basicProfileSchema);