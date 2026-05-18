const MarriageDetails = require("../models/MarriageDetails");
const User = require("../models/User");
const AdminReview = require("../models/AdminReview");

// Get Pending Marriage Details Reviews
exports.getPendingMarriageDetailsReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await MarriageDetails.countDocuments({
      form2ReviewStatus: "pending_review"
    });

    const reviews = await MarriageDetails.find({
      form2ReviewStatus: "pending_review"
    })
      .select("_id userId form2ReviewStatus createdAt lastReviewedAt adminNotes")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get user details for each marriage details
    const reviewsWithUserDetails = await Promise.all(
      reviews.map(async (record) => {
        const user = await User.findById(record.userId).select("mobile adminNotes");
        return {
          ...record.toObject(),
          mobile: user?.mobile,
          adminNotes: user?.adminNotes || record.adminNotes
        };
      })
    );

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: reviewsWithUserDetails
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Specific Marriage Details Review Card
exports.getMarriageDetailsReviewCard = async (req, res) => {
  try {
    const { userId } = req.params;

    const marriageDetails = await MarriageDetails.findOne({ userId })
      .populate("lastReviewedBy", "email fullName");

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    const user = await User.findById(userId).select("mobile createdAt adminNotes");

    res.json({
      user: {
        _id: user._id,
        mobile: user.mobile,
        createdAt: user.createdAt,
        adminNotes: user.adminNotes
      },
      marriageDetails
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Approve Marriage Details
exports.approveMarriageDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNotes } = req.body;

    const marriageDetails = await MarriageDetails.findOne({ userId });

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Associated user not found"
      });
    }

    const form2ReviewStatusBefore = user.form2ReviewStatus || "pending_review";

    // Update User Document
    user.form2ReviewStatus = "approved";
    user.form2Status = "completed";
    user.registrationStep = 4;
    user.accountStatus = "active";
    if (adminNotes) {
      user.adminNotes = adminNotes;
    }
    user.lastReviewedAt = new Date();
    user.lastReviewedBy = req.admin?.adminId || null;
    await user.save();

    // Update MarriageDetails Document
    marriageDetails.form2ReviewStatus = "approved";
    marriageDetails.adminNotes = adminNotes || "";
    marriageDetails.lastReviewedAt = new Date();
    marriageDetails.lastReviewedBy = req.admin?.adminId || null;
    await marriageDetails.save();

    // Create Audit Trail
    await AdminReview.create({
      userId: user._id,
      adminId: req.admin?.adminId || null,
      action: "approved",
      form2ReviewStatusBefore,
      form2ReviewStatusAfter: "approved",
      adminNotes: adminNotes || "Form-2 details approved by admin"
    });

    res.json({
      message: "Marriage Details approved successfully",
      marriageDetails: {
        _id: marriageDetails._id,
        userId: marriageDetails.userId,
        form2ReviewStatus: marriageDetails.form2ReviewStatus
      }
    });
  } catch (error) {
    console.error("FORM2 APPROVAL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

// Request Changes on Marriage Details
exports.requestMarriageDetailsChanges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { changesRequested, adminNotes } = req.body;

    if (!changesRequested) {
      return res.status(400).json({
        message: "Changes requested message required"
      });
    }

    const marriageDetails = await MarriageDetails.findOne({ userId });

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Associated user not found"
      });
    }

    const form2ReviewStatusBefore = user.form2ReviewStatus || "pending_review";

    // Update User Document
    user.form2ReviewStatus = "changes_requested";
    user.form2Status = "unlocked";
    if (adminNotes || changesRequested) {
      user.adminNotes = adminNotes || changesRequested;
    }
    user.lastReviewedAt = new Date();
    user.lastReviewedBy = req.admin?.adminId || null;
    await user.save();

    // Update MarriageDetails Document
    marriageDetails.form2ReviewStatus = "changes_requested";
    marriageDetails.adminNotes = adminNotes || changesRequested;
    marriageDetails.lastReviewedAt = new Date();
    marriageDetails.lastReviewedBy = req.admin?.adminId || null;
    await marriageDetails.save();

    // Create Audit Trail
    await AdminReview.create({
      userId: user._id,
      adminId: req.admin?.adminId || null,
      action: "changes_requested",
      form2ReviewStatusBefore,
      form2ReviewStatusAfter: "changes_requested",
      adminNotes: adminNotes || changesRequested,
      changesRequested: changesRequested
    });

    res.json({
      message: "Changes requested from user",
      marriageDetails: {
        _id: marriageDetails._id,
        userId: marriageDetails.userId,
        form2ReviewStatus: marriageDetails.form2ReviewStatus
      }
    });
  } catch (error) {
    console.error("FORM2 REQUEST CHANGES ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

// Reject Marriage Details
exports.rejectMarriageDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason required"
      });
    }

    const marriageDetails = await MarriageDetails.findOne({ userId });

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Associated user not found"
      });
    }

    const form2ReviewStatusBefore = user.form2ReviewStatus || "pending_review";

    // Update User Document
    user.form2ReviewStatus = "rejected";
    if (adminNotes || rejectionReason) {
      user.adminNotes = adminNotes || rejectionReason;
    }
    user.lastReviewedAt = new Date();
    user.lastReviewedBy = req.admin?.adminId || null;
    await user.save();

    // Update MarriageDetails Document
    marriageDetails.form2ReviewStatus = "rejected";
    marriageDetails.adminNotes = adminNotes || rejectionReason;
    marriageDetails.lastReviewedAt = new Date();
    marriageDetails.lastReviewedBy = req.admin?.adminId || null;
    await marriageDetails.save();

    // Create Audit Trail
    await AdminReview.create({
      userId: user._id,
      adminId: req.admin?.adminId || null,
      action: "rejected",
      form2ReviewStatusBefore,
      form2ReviewStatusAfter: "rejected",
      adminNotes: adminNotes || rejectionReason,
      rejectionReason: rejectionReason
    });

    res.json({
      message: "Marriage Details rejected",
      marriageDetails: {
        _id: marriageDetails._id,
        userId: marriageDetails.userId,
        form2ReviewStatus: marriageDetails.form2ReviewStatus
      }
    });
  } catch (error) {
    console.error("FORM2 REJECT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};
