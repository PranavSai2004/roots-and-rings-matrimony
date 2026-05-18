const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const authMiddleware = require("../middleware/authMiddleware");

const {
  recordInterest,
  getUserInterests,
  getAllInterests,
  updateInterestStatus
} = require("../controllers/userInterestController");

// User record interest (Protected)
router.post("/interested/:sharedProfileId", authMiddleware, recordInterest);

// User get own interests (Protected)
router.get("/my-interests/:userId", authMiddleware, getUserInterests);

// Admin get all interests
router.get("/interests", adminAuth, getAllInterests);

// Admin update interest status
router.patch("/interests/:interestId/status", adminAuth, updateInterestStatus);

module.exports = router;
