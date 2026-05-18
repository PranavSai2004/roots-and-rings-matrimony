const mongoose = require("mongoose");

const marriageDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    default: "Marriage Details"
  },

  form2ReviewStatus: {
    type: String,
    enum: ["pending_review", "approved", "rejected", "changes_requested"],
    default: "pending_review"
  },

  adminNotes: {
    type: String,
    default: ""
  },

  lastReviewedAt: Date,

  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  
  raasi: {
    type: String,
    trim: true
  },

  nakshatra: {
    type: String,
    trim: true
  },

  gothram: {
    type: String,
    trim: true
  },

  height: {
    type: String,
    trim: true
  },

  weight: {
    type: Number
  },

  bloodGroup: {
    type: String,
    trim: true
  },

  physicalStatus: {
    type: String,
    enum: ["Normal", "normal", "Physically Challenged", "physically-challenged", "physically_challenged", "Other", "other", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  familyType: {
    type: String,
    enum: ["Nuclear", "nuclear", "Joint", "joint", "Extended", "extended", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  siblings: {
    type: Number,
    min: 0,
    required: true
  },

  maritalStatus: {
    type: String,
    enum: ["Never Married", "never-married", "never_married", "never married", "Divorced", "divorced", "Widowed", "widowed", "Separated", "separated", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  lifestyle: {
    type: String,
    trim: true
  },

  fatherOccupation: {
    type: String,
    trim: true
  },

  motherOccupation: {
    type: String,
    trim: true
  },

  familyValues: {
    type: String,
    enum: ["Traditional", "traditional", "Moderate", "moderate", "Liberal", "liberal", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  nativePlace: {
    type: String,
    trim: true
  },

  companyName: {
    type: String,
    trim: true
  },

  annualIncome: {
    type: Number,
    min: 0
  },

  workLocation: {
    type: String,
    trim: true
  },

  jobType: {
    type: String,
    enum: ["Private", "private", "Government", "government", "Business", "business", "Self-employed", "self-employed", "self_employed", "Other", "other", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  diet: {
    type: String,
    enum: ["Vegetarian", "vegetarian", "Non-Vegetarian", "non-vegetarian", "non_vegetarian", "Eggetarian", "eggetarian", "Vegan", "vegan", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  smoking: {
    type: String,
    enum: ["No", "no", "Occasionally", "occasionally", "Yes", "yes", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  drinking: {
    type: String,
    enum: ["No", "no", "Occasionally", "occasionally", "Yes", "yes", "Prefer Not to Say", "prefer-not-to-say", "prefer_not_to_say"],
    default: "Prefer Not to Say"
  },

  aboutMe: {
    type: String,
    trim: true
  },

  expectations: {
    type: String,
    trim: true
  },

  preferredAgeRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },

  preferredLocation: {
    type: String,
    trim: true
  },

  preferredEducation: {
    type: String,
    trim: true
  },

  preferredProfession: {
    type: String,
    trim: true
  },

  preferredReligion: {
    type: String,
    trim: true
  },

  preferredCaste: {
    type: String,
    trim: true
  }

}, { timestamps: true });

module.exports = mongoose.model("MarriageDetails", marriageDetailsSchema);
