const User = require('../models/User');

// GET /payment/status
exports.getPaymentStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('paymentStatus');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      status: user.paymentStatus || 'pending',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /payment/verify (Dummy for now, usually handled by admin but frontend has a 'verify' button)
exports.verifyPaymentStub = async (req, res) => {
  try {
    const userId = req.userId;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    // In a real app, this would notify admin or check gateway
    // For stabilization, we'll mark it as 'awaiting_verification' so admin can see it in queue
    const user = await User.findById(userId);

    await User.findByIdAndUpdate(userId, {
      paymentStatus: 'awaiting',
      submittedTransactionId: transactionId,
    });

    try {
      const AdminNotification = require('../models/AdminNotification');
      await AdminNotification.create({
        userId,
        type: 'payment_upload',
        message: `User ${user.mobile} submitted payment with Transaction ID: ${transactionId} for verification.`,
      });
    } catch (err) {
      console.error('❌ Failed to create payment notification:', err.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment submitted for verification. Please wait for admin approval.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
