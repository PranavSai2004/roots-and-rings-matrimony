const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  adminLogin,
  getPendingReviews,
  getUserReviewCard,
  approveReview,
  rejectReview,
  requestChanges,
  verifyPayment,
  getApprovedAwaitingPayment,
  getApprovedProfiles,
  getApprovedRecipients,
  getDashboardStats,
  getExpiringShares,
  getPaymentHistory
} = require("../controllers/adminController");

const adminNotificationController = require('../controllers/adminNotificationController');
const userInterestController = require('../controllers/userInterestController');

// Admin Auth
router.post("/login", adminLogin);

// Dashboard Stats
router.get("/stats", adminAuth, getDashboardStats);
router.get("/stats/expiring", adminAuth, getExpiringShares);

// Form-1 & Photos Review
router.get("/reviews/pending", adminAuth, getPendingReviews);
router.get("/reviews/:userId", adminAuth, getUserReviewCard);
router.post("/reviews/:userId/approve", adminAuth, approveReview);
router.post("/reviews/:userId/reject", adminAuth, rejectReview);
router.post("/reviews/:userId/request-changes", adminAuth, requestChanges);

// Payment Management
router.post("/payment/:userId/verify", adminAuth, verifyPayment);
router.get("/payment/pending", adminAuth, getApprovedAwaitingPayment);
router.get("/payment/history", adminAuth, getPaymentHistory);

router.get("/profiles/approved", adminAuth, getApprovedProfiles);
router.get("/profiles/recipients", adminAuth, getApprovedRecipients);

// Member Directory
router.get("/members", adminAuth, adminNotificationController.getAllMembers);
router.patch("/members/:userId/status", adminAuth, adminNotificationController.updateMemberStatus);

// Admin Notifications
router.get("/notifications", adminAuth, adminNotificationController.getNotifications);
router.delete("/notifications/clear-all", adminAuth, adminNotificationController.clearAllNotifications);
router.patch("/notifications/read-all", adminAuth, adminNotificationController.markAllAsRead);
router.patch("/notifications/:id/read", adminAuth, adminNotificationController.markAsRead);

// Interest Tracking (CRM)
router.get("/interests", adminAuth, userInterestController.getAllInterests);
router.patch("/interests/:interestId/status", adminAuth, userInterestController.updateInterestStatus);

module.exports = router;
