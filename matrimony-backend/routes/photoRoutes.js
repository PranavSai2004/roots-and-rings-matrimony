const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const authMiddleware = require("../middleware/authMiddleware");

const {
  uploadPhoto,
  completePhotoUpload
} = require("../controllers/photoController");

// Secure photo upload endpoint
router.post(
  "/upload",
  authMiddleware,
  upload.single("photo"),
  uploadPhoto
);

// Endpoint to mark upload phase as complete
router.post("/complete", authMiddleware, completePhotoUpload);

module.exports = router;