const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getSharedProfiles,
  markAsViewed,
  getWatermarkedPhoto
} = require("../controllers/sharedProfileController");

// Get shared profiles for user (Protected)
router.get("/shared-profiles/user/:userId", authMiddleware, getSharedProfiles);

// Mark profile as viewed
router.post("/shared-profiles/:sharedProfileId/viewed", authMiddleware, markAsViewed);

// Secure watermark proxy route
router.get("/shared-profiles/watermark/:profileId", authMiddleware, getWatermarkedPhoto);

module.exports = router;
