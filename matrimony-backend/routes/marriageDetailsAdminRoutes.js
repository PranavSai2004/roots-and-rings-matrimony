const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  getPendingMarriageDetailsReviews,
  getMarriageDetailsReviewCard,
  approveMarriageDetails,
  requestMarriageDetailsChanges,
  rejectMarriageDetails
} = require("../controllers/marriageDetailsAdminController");

// Protected endpoints
router.get("/marriage-details/pending", adminAuth, getPendingMarriageDetailsReviews);
router.get("/marriage-details/:userId", adminAuth, getMarriageDetailsReviewCard);
router.post("/marriage-details/:userId/approve", adminAuth, approveMarriageDetails);
router.post("/marriage-details/:userId/request-changes", adminAuth, requestMarriageDetailsChanges);
router.post("/marriage-details/:userId/reject", adminAuth, rejectMarriageDetails);

module.exports = router;
