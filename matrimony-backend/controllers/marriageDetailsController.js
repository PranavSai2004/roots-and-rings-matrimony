const MarriageDetails = require("../models/MarriageDetails");
const User = require("../models/User");

// Create or Update Marriage Details
exports.createMarriageDetails = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.form2Status !== "unlocked") {
      return res.status(400).json({
        message: "Marriage Details form is not unlocked for this user"
      });
    }

    // Check if Marriage Details already exists
    let marriageDetails = await MarriageDetails.findOne({ userId });

    if (marriageDetails) {
      // Update existing
      marriageDetails = Object.assign(marriageDetails, req.body);
      await marriageDetails.save();
    } else {
      // Create new
      marriageDetails = await MarriageDetails.create(req.body);
    }

    // Update user status
    await User.findByIdAndUpdate(userId, {
      form2Completed: true,
      form2Status: "completed"
    });

    res.json({
      message: "Marriage Details saved successfully",
      marriageDetails
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Marriage Details
exports.getMarriageDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId required"
      });
    }

    const marriageDetails = await MarriageDetails.findOne({ userId });

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    res.json({
      message: "Marriage Details retrieved successfully",
      marriageDetails
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Marriage Details
exports.updateMarriageDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId required"
      });
    }

    let marriageDetails = await MarriageDetails.findOne({ userId });

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    marriageDetails = Object.assign(marriageDetails, req.body);
    await marriageDetails.save();

    res.json({
      message: "Marriage Details updated successfully",
      marriageDetails
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Marriage Details
exports.deleteMarriageDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId required"
      });
    }

    const marriageDetails = await MarriageDetails.findOneAndDelete({ userId });

    if (!marriageDetails) {
      return res.status(404).json({
        message: "Marriage Details not found"
      });
    }

    // Update user status
    await User.findByIdAndUpdate(userId, {
      form2Completed: false,
      form2Status: "unlocked"
    });

    res.json({
      message: "Marriage Details deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
