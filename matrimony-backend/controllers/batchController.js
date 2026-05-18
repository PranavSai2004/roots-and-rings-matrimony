const Batch = require("../models/Batch");
const SharedProfile = require("../models/SharedProfile");
const User = require("../models/User");
const BasicProfile = require("../models/BasicProfile");
const ProfilePhoto = require("../models/ProfilePhoto");

// Share profiles to user
exports.shareBatch = async (req, res) => {
  try {
    const { recipientUserId, selectedProfileIds } = req.body;

    if (!recipientUserId || !selectedProfileIds || selectedProfileIds.length === 0) {
      return res.status(400).json({
        message: "recipientUserId and selectedProfileIds required"
      });
    }

    if (selectedProfileIds.length < 1 || selectedProfileIds.length > 15) {
      return res.status(400).json({ message: "Select between 1 and 15 profiles" });
    }

    // Get recipient user
    const recipientUser = await User.findById(recipientUserId);
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    // Verify all selected users are form1-approved
    const approvedUsers = await User.find({
      _id: { $in: selectedProfileIds },
      form1ReviewStatus: "approved"
    });

    if (approvedUsers.length !== selectedProfileIds.length) {
      return res.status(400).json({ message: "Some profiles are not yet approved" });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const batch = await Batch.create({
      createdByAdminId: req.admin.adminId,
      recipientUserId,
      recipientMobile: recipientUser.mobile,
      selectedProfileIds,
      expiresAt
    });

    // Create shared profile records - populate from BasicProfile
    const sharedProfiles = [];
    for (const profileUserId of selectedProfileIds) {
      const basicProfile = await BasicProfile.findOne({ userId: profileUserId })
        .select("fullName dob city religion caste education profession");
      const primaryPhoto = await ProfilePhoto.findOne({ userId: profileUserId, isPrimary: true });

      const dob = basicProfile?.dob ? new Date(basicProfile.dob) : null;
      const age = dob
        ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
        : null;

      const sharedProfile = await SharedProfile.create({
        batchId: batch._id,
        recipientUserId,
        profileId: profileUserId,
        limitedProfileData: {
          name: basicProfile?.fullName || "—",
          age: age || "—",
          occupation: basicProfile?.profession || "—",
          caste: basicProfile?.caste || "—",
          city: basicProfile?.city || "—",
          primaryImage: primaryPhoto?.photoUrl || null
        },
        expiresAt
      });

      sharedProfiles.push(sharedProfile);
    }

    res.json({
      message: "Batch shared successfully",
      batch: {
        _id: batch._id,
        recipientUserId,
        recipientMobile: recipientUser.mobile,
        profileCount: selectedProfileIds.length,
        status: "active",
        expiresAt,
        sharedProfileCount: sharedProfiles.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user batches
exports.getUserBatches = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get batches where user is recipient
    const totalCount = await Batch.countDocuments({
      recipientUserId: userId,
      expiresAt: { $gt: new Date() }
    });

    const batches = await Batch.find({
      recipientUserId: userId,
      expiresAt: { $gt: new Date() }
    })
      .populate("createdByAdminId", "email fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: batches
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get single batch details
exports.getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId)
      .populate("createdByAdminId", "email fullName")
      .populate("recipientUserId", "name mobile");

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found"
      });
    }

    // Check if batch is expired
    if (batch.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Batch has expired"
      });
    }

    res.json({
      message: "Batch details retrieved",
      batch
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Admin: Get all batches (History)
exports.getAllBatches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalCount = await Batch.countDocuments();

    const batches = await Batch.find()
      .populate("createdByAdminId", "fullName email")
      .populate("recipientUserId", "mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: batches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
