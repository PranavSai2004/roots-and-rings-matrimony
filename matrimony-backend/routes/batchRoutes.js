const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

const {
  shareBatch,
  getUserBatches,
  getBatchDetails,
  getAllBatches
} = require("../controllers/batchController");

// Admin create batch
router.post("/batches/share", adminAuth, shareBatch);

// Admin get all batches
router.get("/batches", adminAuth, getAllBatches);

// Get user batches (Wait, is this admin auth? adminRoutes usually mounts to /admin)
router.get("/batches/user/:userId", adminAuth, getUserBatches);

// Get single batch
router.get("/batches/:batchId", adminAuth, getBatchDetails);

module.exports = router;
