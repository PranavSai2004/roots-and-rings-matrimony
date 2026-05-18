const UserInterest = require("../models/UserInterest");
const SharedProfile = require("../models/SharedProfile");
const User = require("../models/User");
const BasicProfile = require("../models/BasicProfile");

const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Record interest click
exports.recordInterest = async (req, res) => {
  try {
    const { sharedProfileId } = req.params;
    const { userId } = req.body;

    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: User ID mismatch." });
    }

    // Get shared profile details
    const sharedProfile = await SharedProfile.findById(sharedProfileId);
    if (!sharedProfile) {
      return res.status(404).json({
        message: "Shared profile not found"
      });
    }

    // Check expiration
    if (new Date(sharedProfile.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Cannot show interest, this profile has expired." });
    }

    // Check if already interested
    const existingInterest = await UserInterest.findOne({
      batchId: sharedProfile.batchId,
      recipientUserId: userId,
      targetProfileId: sharedProfile.profileId
    });

    if (existingInterest) {
      return res.json({
        message: "Interest already recorded",
        interest: existingInterest
      });
    }

    // Create interest record
    const interest = await UserInterest.create({
      batchId: sharedProfile.batchId,
      recipientUserId: userId,
      targetProfileId: sharedProfile.profileId,
      interested: true
    });

    res.json({
      message: "Interest recorded successfully",
      interest: {
        _id: interest._id,
        targetProfileId: interest.targetProfileId,
        status: interest.interestStatus,
        recordedAt: interest.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get user interests
exports.getUserInterests = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: Cannot access other users' interests." });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await UserInterest.countDocuments({
      recipientUserId: userId
    });

    const interests = await UserInterest.find({
      recipientUserId: userId
    })
      .populate("batchId", "createdAt expiresAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enrich with target user's full name, age, profession, city, caste from BasicProfile
    const enrichedInterests = await Promise.all(
      interests.map(async (i) => {
        const doc = i.toObject();
        if (i.targetProfileId) {
          const profile = await BasicProfile.findOne({ userId: i.targetProfileId }).select('fullName dob profession city caste');
          doc.targetProfileId = {
            _id: i.targetProfileId,
            name: profile?.fullName || "—",
            age: profile?.dob ? calculateAge(profile.dob) : null,
            profession: profile?.profession || "—",
            city: profile?.city || "—",
            caste: profile?.caste || "—"
          };
        }
        return doc;
      })
    );

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: enrichedInterests
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Admin: Get all interests
exports.getAllInterests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || null;
    const batchId = req.query.batchId || null;

    let filter = {};
    if (status) filter.interestStatus = status;
    if (batchId) filter.batchId = batchId;

    const totalCount = await UserInterest.countDocuments(filter);

    const interests = await UserInterest.find(filter)
      .populate("recipientUserId", "mobile")
      .populate("batchId", "createdAt expiresAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enrich with recipient user's full name and target user's details from BasicProfile
    const enrichedInterests = await Promise.all(
      interests.map(async (i) => {
        const doc = i.toObject();
        if (i.recipientUserId) {
          const profile = await BasicProfile.findOne({ userId: i.recipientUserId._id || i.recipientUserId }).select('fullName');
          doc.recipientUserId = {
            ...doc.recipientUserId,
            fullName: profile?.fullName || "—"
          };
        }
        if (i.targetProfileId) {
          const targetId = i.targetProfileId._id || i.targetProfileId;
          const profile = await BasicProfile.findOne({ userId: targetId }).select('fullName dob profession city caste');
          doc.targetProfileId = {
            ...doc.targetProfileId,
            _id: targetId,
            name: profile?.fullName || "—",
            age: profile?.dob ? calculateAge(profile.dob) : null,
            profession: profile?.profession || "—",
            city: profile?.city || "—",
            caste: profile?.caste || "—"
          };
        }
        return doc;
      })
    );

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: enrichedInterests
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Admin: Update interest status
exports.updateInterestStatus = async (req, res) => {
  try {
    const { interestId } = req.params;
    const { interestStatus, adminNotes } = req.body;

    if (!["pending", "contacted", "meeting_scheduled", "closed"].includes(interestStatus)) {
      return res.status(400).json({
        message: "Invalid interest status"
      });
    }

    const interest = await UserInterest.findById(interestId);
    if (!interest) {
      return res.status(404).json({
        message: "Interest not found"
      });
    }

    interest.interestStatus = interestStatus;
    if (adminNotes !== undefined) {
      interest.adminNotes = adminNotes;
    }
    interest.adminNotified = true;
    interest.updatedAt = new Date();
    
    await interest.save();

    res.json({
      message: "Interest status updated",
      interest: {
        _id: interest._id,
        interestStatus: interest.interestStatus,
        adminNotified: interest.adminNotified,
        updatedAt: interest.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
