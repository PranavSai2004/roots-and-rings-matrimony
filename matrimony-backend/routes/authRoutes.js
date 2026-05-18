const express = require("express");
const router = express.Router();

const { sendEmailOTP, verifyEmailOTP, adminLogin, checkMobile } = require("../controllers/authController");
const { otpLimiter } = require("../middleware/rateLimiter");

router.post("/check-mobile", checkMobile);
router.post("/send-email-otp", otpLimiter, sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/admin-login", adminLogin);

module.exports = router;