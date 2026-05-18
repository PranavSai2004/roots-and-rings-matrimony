const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const AdminReview = require("../models/AdminReview");
const BasicProfile = require("../models/BasicProfile");
const ProfilePhoto = require("../models/ProfilePhoto");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");

async function generatePresignedUrl(photoUrl) {
  if (!photoUrl) return null;
  if (!photoUrl.includes('amazonaws.com')) return photoUrl;
  try {
    const urlParts = photoUrl.split('/');
    const key = decodeURIComponent(urlParts[urlParts.length - 1]);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });
    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return photoUrl;
  }
}

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: "Admin account is inactive"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: "admin"
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        fullName: admin.fullName
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Pending Reviews List
exports.getPendingReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments({
      form1ReviewStatus: "pending_review"
    });

    const reviews = await User.find({
      form1ReviewStatus: "pending_review"
    })
      .select("_id mobile createdAt form1ReviewStatus photosReviewStatus registrationStep lastReviewedAt adminNotes")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get photo count for each user
    const reviewsWithPhotoCount = await Promise.all(
      reviews.map(async (user) => {
        const photoCount = await ProfilePhoto.countDocuments({
          userId: user._id
        });
        return {
          ...user.toObject(),
          photoCount
        };
      })
    );

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: reviewsWithPhotoCount
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Single User Review Card
exports.getUserReviewCard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -otpStore");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const form1Data = await BasicProfile.findOne({ userId: user._id });
    const photos = await ProfilePhoto.find({ userId: user._id }).sort({ createdAt: -1 });

    const photosWithPresignedUrls = await Promise.all(
      photos.map(async (photo) => {
        const doc = photo.toObject ? photo.toObject() : photo;
        doc.photoUrl = await generatePresignedUrl(doc.photoUrl);
        return doc;
      })
    );

    const MarriageDetails = require('../models/MarriageDetails');
    const form2Data = await MarriageDetails.findOne({ userId: user._id });

    const reviewHistory = await AdminReview.find({ userId: user._id })
      .populate("adminId", "email fullName")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        mobile: user.mobile,
        email: user.email,
        createdAt: user.createdAt,
        registrationStep: user.registrationStep,
        form1ReviewStatus: user.form1ReviewStatus,
        photosReviewStatus: user.photosReviewStatus,
        form2ReviewStatus: user.form2ReviewStatus,
        paymentStatus: user.paymentStatus,
        form2Status: user.form2Status,
        adminNotes: user.adminNotes,
        lastReviewedAt: user.lastReviewedAt,
        lastReviewedBy: user.lastReviewedBy
      },
      form1Data: form1Data || {},
      photos: photosWithPresignedUrls || [],
      form2Data: form2Data || null,
      reviewHistory: reviewHistory || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Form-1 + Photos
exports.approveReview = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNotes } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const form1ReviewStatusBefore = user.form1ReviewStatus;
    const photosReviewStatusBefore = user.photosReviewStatus;

    // Update user statuses
    user.form1ReviewStatus = "approved";
    user.photosReviewStatus = "approved";
    user.lastReviewedAt = new Date();
    user.lastReviewedBy = req.admin.adminId;
    user.adminNotes = adminNotes || "";

    await user.save();

    // Update all photos to approved
    await ProfilePhoto.updateMany(
      { userId: user._id },
      { status: "approved" }
    );

    // Create audit trail
    await AdminReview.create({
      userId: user._id,
      adminId: req.admin.adminId,
      action: "approved",
      form1ReviewStatusBefore,
      form1ReviewStatusAfter: "approved",
      photosReviewStatusBefore,
      photosReviewStatusAfter: "approved",
      adminNotes: adminNotes || ""
    });

    res.json({
      message: "Profile approved successfully",
      user: {
        _id: user._id,
        mobile: user.mobile,
        form1ReviewStatus: user.form1ReviewStatus,
        photosReviewStatus: user.photosReviewStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Reject Review
exports.rejectReview = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const form1ReviewStatusBefore = user.form1ReviewStatus;
    const photosReviewStatusBefore = user.photosReviewStatus;

    // Update user statuses
    user.form1ReviewStatus = "rejected";
    user.photosReviewStatus = "rejected";
    user.lastReviewedAt = new Date();
    user.lastReviewedBy = req.admin.adminId;
    user.adminNotes = adminNotes || rejectionReason || "";

    await user.save();

    // Update all photos to rejected
    await ProfilePhoto.updateMany(
      { userId: user._id },
      { status: "rejected" }
    );

    // Create audit trail
    await AdminReview.create({
      userId: user._id,
      adminId: req.admin.adminId,
      action: "rejected",
      form1ReviewStatusBefore,
      form1ReviewStatusAfter: "rejected",
      photosReviewStatusBefore,
      photosReviewStatusAfter: "rejected",
      rejectionReason,
      adminNotes: adminNotes || ""
    });

    res.json({
      message: "Profile rejected successfully",
      user: {
        _id: user._id,
        mobile: user.mobile,
        form1ReviewStatus: user.form1ReviewStatus,
        photosReviewStatus: user.photosReviewStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Request Changes
exports.requestChanges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { changesRequested, adminNotes } = req.body;

    if (!changesRequested) {
      return res.status(400).json({
        message: "Changes requested message required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const form1ReviewStatusBefore = user.form1ReviewStatus;
    const photosReviewStatusBefore = user.photosReviewStatus;

    // Update user statuses
    user.form1ReviewStatus = "changes_requested";
    user.photosReviewStatus = "changes_requested";
    user.lastReviewedAt = new Date();
    user.lastReviewedBy = req.admin.adminId;
    user.adminNotes = adminNotes || changesRequested || "";

    await user.save();

    // Update all photos status
    await ProfilePhoto.updateMany(
      { userId: user._id },
      { status: "pending" }
    );

    // Create audit trail
    await AdminReview.create({
      userId: user._id,
      adminId: req.admin.adminId,
      action: "changes_requested",
      form1ReviewStatusBefore,
      form1ReviewStatusAfter: "changes_requested",
      photosReviewStatusBefore,
      photosReviewStatusAfter: "changes_requested",
      changesRequested,
      adminNotes: adminNotes || ""
    });

    res.json({
      message: "Changes requested from user",
      user: {
        _id: user._id,
        mobile: user.mobile,
        form1ReviewStatus: user.form1ReviewStatus,
        photosReviewStatus: user.photosReviewStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Verify Payment & Unlock Form-2
const Payment = require('../models/Payment');

exports.verifyPayment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { transactionId, amount, paymentMethod, adminNotes } = req.body;

    let finalTransactionId = transactionId;
    const isCash = paymentMethod && paymentMethod.toLowerCase() === 'cash';
    if (isCash && !transactionId) {
      finalTransactionId = `CASH-${Date.now()}`;
    }

    if (!finalTransactionId || !amount || !paymentMethod) {
      return res.status(400).json({
        message: isCash ? "Amount and payment method required" : "Transaction ID, amount, and payment method required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.form1ReviewStatus !== "approved") {
      return res.status(400).json({
        message: "User profile must be approved before payment verification"
      });
    }

    // Normalize payment method for schema
    let normalizedMethod = paymentMethod ? paymentMethod.toLowerCase() : 'upi';
    if (['neft', 'imps'].includes(normalizedMethod)) {
      normalizedMethod = 'bank_transfer';
    } else if (!['upi', 'bank_transfer', 'cash', 'other'].includes(normalizedMethod)) {
      normalizedMethod = 'other';
    }

    // Create payment record
    const payment = await Payment.create({
      userId,
      paymentAmount: Number(amount),
      paymentMethod: normalizedMethod,
      transactionId: finalTransactionId,
      verifiedByAdmin: req.admin.adminId,
      paymentStatus: 'verified',
      proofUrl: 'manual_verification', // fallback since admin verifies directly here
      remarks: adminNotes || ''
    });

    // Update user payment status
    user.paymentStatus = "verified";
    user.form2Status = "unlocked";
    user.adminApprovedForForm2 = true;

    await user.save();

    res.json({
      message: "Payment verified successfully, Form-2 unlocked",
      payment,
      user: {
        _id: user._id,
        mobile: user.mobile,
        paymentStatus: user.paymentStatus,
        form2Status: user.form2Status
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Approved Users Awaiting Payment (Payment Queue)
exports.getApprovedAwaitingPayment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {
      form1ReviewStatus: "approved",
      paymentStatus: { $in: ["pending", "awaiting"] }
    };

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("_id mobile email createdAt form1ReviewStatus paymentStatus registrationStep submittedTransactionId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const usersWithProfile = await Promise.all(
      users.map(async (user) => {
        const profile = await BasicProfile.findOne({ userId: user._id }).select("fullName city");
        return {
          ...user.toObject(),
          fullName: profile?.fullName || "—",
          city: profile?.city || "—",
        };
      })
    );

    res.json({ success: true, data: usersWithProfile, total: usersWithProfile.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Fully Approved Profiles for Batch Selection
exports.getApprovedProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { 
      form1ReviewStatus: "approved",
      accountStatus: { $ne: "matched" }
    };
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("_id mobile email paymentStatus accountStatus")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const profilesWithDetails = await Promise.all(
      users.map(async (user) => {
        const profile = await BasicProfile.findOne({ userId: user._id })
          .select("fullName gender dob city religion caste education profession");
        const photo = await ProfilePhoto.findOne({ userId: user._id, isPrimary: true });

        if (!profile) return null;

        const dob = profile.dob ? new Date(profile.dob) : null;
        const age = dob
          ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
          : null;

        return {
          _id: user._id,
          mobile: user.mobile,
          fullName: profile.fullName,
          gender: profile.gender,
          age,
          city: profile.city,
          occupation: profile.profession,
          religion: profile.religion,
          caste: profile.caste,
          primaryImage: await generatePresignedUrl(photo?.photoUrl) || null,
        };
      })
    );

    const filtered = profilesWithDetails.filter(Boolean);
    res.json({ success: true, data: filtered, total: filtered.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Approved Recipient Users (users who can receive batches — payment verified)
exports.getApprovedRecipients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { 
      paymentStatus: "verified",
      accountStatus: { $ne: "matched" }
    };
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("_id mobile email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const recipientsWithNames = await Promise.all(
      users.map(async (user) => {
        const profile = await BasicProfile.findOne({ userId: user._id }).select("fullName city");
        return {
          _id: user._id,
          mobile: user.mobile,
          email: user.email,
          fullName: profile?.fullName || user.mobile,
          city: profile?.city || "—",
        };
      })
    );

    res.json({ success: true, data: recipientsWithNames, total: recipientsWithNames.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Monitoring Dashboard Analytics ---

const Batch = require("../models/Batch");
const UserInterest = require("../models/UserInterest");

exports.getDashboardStats = async (req, res) => {
  try {
    const period = req.query.period || 'week';
    let dateQuery = {};
    const now = new Date();
    
    if (period === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: startOfToday } };
    } else if (period === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: sevenDaysAgo } };
    } else if (period === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: thirtyDaysAgo } };
    }

    const totalUsers = await User.countDocuments(dateQuery);
    const approvedUsers = await User.countDocuments({ 
      form1ReviewStatus: "approved",
      ...dateQuery
    });
    const pendingReviews = await User.countDocuments({ 
      form1ReviewStatus: "pending_review",
      ...dateQuery
    });
    const totalBatches = await Batch.countDocuments(dateQuery);
    const activeBatches = await Batch.countDocuments({ 
      expiresAt: { $gt: now },
      ...dateQuery
    });
    const totalInterests = await UserInterest.countDocuments(dateQuery);

    res.json({
      success: true,
      stats: {
        totalUsers,
        approvedUsers,
        pendingReviews,
        totalBatches,
        activeBatches,
        totalInterests
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const SharedProfile = require("../models/SharedProfile");

exports.getExpiringShares = async (req, res) => {
  try {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const expiringProfiles = await SharedProfile.find({
      status: "active",
      expiresAt: { $gt: now, $lte: fortyEightHoursFromNow }
    })
      .populate("recipientUserId", "mobile")
      .populate("profileId", "name")
      .sort({ expiresAt: 1 })
      .limit(20);

    const formatted = await Promise.all(
      expiringProfiles.map(async (sp) => {
        const targetProfile = await BasicProfile.findOne({ userId: sp.profileId }).select("fullName");
        const recipientProfile = await BasicProfile.findOne({ userId: sp.recipientUserId }).select("fullName");
        return {
          _id: sp._id,
          fromMember: targetProfile?.fullName || sp.profileId?.name || "Unknown",
          toMember: recipientProfile?.fullName || sp.recipientUserId?.mobile || "Unknown",
          expiresAt: sp.expiresAt
        };
      })
    );

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Payment History System ---
exports.getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { status, search, fromDate, toDate } = req.query;

    let query = {};
    if (status) query.paymentStatus = status;
    if (fromDate && toDate) {
      query.paymentDate = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }

    if (search) {
      const userMatches = await BasicProfile.find({ fullName: { $regex: search, $options: "i" } }).select("userId");
      const userIds = userMatches.map(m => m.userId);
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } }
      ];
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("userId", "mobile email")
      .populate("verifiedByAdmin", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = await Promise.all(
      payments.map(async (payment) => {
        const profile = await BasicProfile.findOne({ userId: payment.userId._id }).select("fullName");
        return {
          ...payment.toObject(),
          userFullName: profile?.fullName || "—"
        };
      })
    );

    res.json({ success: true, data, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

