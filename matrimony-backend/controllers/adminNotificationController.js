const AdminNotification = require('../models/AdminNotification');
const User = require('../models/User');
const BasicProfile = require('../models/BasicProfile');

// GET /admin/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'mobile');

    const enriched = await Promise.all(
      notifications.map(async (n) => {
        const doc = n.toObject ? n.toObject() : n;
        if (n.userId) {
          const profile = await BasicProfile.findOne({ userId: n.userId._id || n.userId }).select('fullName');
          doc.fullName = profile?.fullName || null;
        } else {
          doc.fullName = null;
        }
        return doc;
      })
    );

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    return res.status(200).json({ success: true, notifications: enriched, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /admin/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, { isRead: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /admin/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /admin/notifications/clear-all
exports.clearAllNotifications = async (req, res) => {
  try {
    await AdminNotification.deleteMany({});
    return res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /admin/members — all users with their profile data
exports.getAllMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('mobile email form1Completed form2Completed paymentStatus form1ReviewStatus photosReviewStatus form2ReviewStatus form2Status adminApprovedForForm2 registrationStep createdAt adminNotes accountStatus');

    // Enrich with basic profile names
    const enriched = await Promise.all(users.map(async (user) => {
      const profile = await BasicProfile.findOne({ userId: user._id }).select('fullName city gender');
      return {
        _id: user._id,
        mobile: user.mobile,
        email: user.email,
        fullName: profile?.fullName || 'N/A',
        city: profile?.city || 'N/A',
        gender: profile?.gender || 'N/A',
        form1ReviewStatus: user.form1ReviewStatus,
        photosReviewStatus: user.photosReviewStatus,
        form2ReviewStatus: user.form2ReviewStatus,
        paymentStatus: user.paymentStatus,
        registrationStep: user.registrationStep,
        adminApprovedForForm2: user.adminApprovedForForm2,
        createdAt: user.createdAt,
        adminNotes: user.adminNotes,
        accountStatus: user.accountStatus || 'pending'
      };
    }));

    const total = await User.countDocuments();

    return res.status(200).json({ success: true, data: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /admin/members/:userId/status
exports.updateMemberStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountStatus } = req.body;

    if (!['pending', 'active', 'matched', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid account status' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { accountStatus },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: `Account status updated to ${accountStatus}`, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
