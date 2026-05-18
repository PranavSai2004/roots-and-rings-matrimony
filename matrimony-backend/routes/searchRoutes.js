const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  searchProfiles,
  getProfile
} = require("../controllers/searchController");

// User search profiles
router.get("/", authMiddleware, searchProfiles);

// Get single profile
router.get("/:userId", authMiddleware, getProfile);

module.exports = router;
