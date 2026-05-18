const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPaymentStatus, verifyPaymentStub } = require('../controllers/paymentController');

router.get('/status', authMiddleware, getPaymentStatus);
router.post('/verify', authMiddleware, verifyPaymentStub);

module.exports = router;
