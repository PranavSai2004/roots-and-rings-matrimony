const BasicProfile = require('../models/BasicProfile');
const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const Joi = require('joi');

const form1Schema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  dob: Joi.date().iso().required(),
  height: Joi.string().allow('', null),
  religion: Joi.string().allow('', null),
  caste: Joi.string().allow('', null),
  motherTongue: Joi.string().allow('', null),
  education: Joi.string().allow('', null),
  occupation: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null)
});

// POST /profile/form1/submit
exports.submitForm1 = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware
    
    // Fetch user to check current registrationStep and mobile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Temporarily improve backend debugging
    console.log('DEBUG: req.body =', req.body);
    console.log('DEBUG: userId =', userId);

    const { error, value } = form1Schema.validate(req.body, { stripUnknown: true });
    
    if (error) {
      console.log('DEBUG: Validation error =', error.details);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const {
      fullName,
      gender,
      dob,
      height,
      religion,
      caste,
      motherTongue,
      education,
      occupation,
      city,
      state,
    } = value;

    // Fetch existing profile to detect changes
    const existingProfile = await BasicProfile.findOne({ userId });
    const changedFields = [];
    if (existingProfile) {
      const fieldMap = { fullName, gender, dob, height, religion, caste, motherTongue, education, occupation, city, state };
      const dbMap = { fullName: existingProfile.fullName, gender: existingProfile.gender, dob: existingProfile.dob, height: existingProfile.height, religion: existingProfile.religion, caste: existingProfile.caste, motherTongue: existingProfile.motherTongue, education: existingProfile.education, occupation: existingProfile.profession, city: existingProfile.city, state: existingProfile.state };
      for (const key of Object.keys(fieldMap)) {
        if (String(fieldMap[key] || '') !== String(dbMap[key] || '')) changedFields.push(key);
      }
    }

    // Upsert: create or update existing profile for this user
    const profile = await BasicProfile.findOneAndUpdate(
      { userId },
      { userId, fullName, gender, dob, height, religion, caste, motherTongue, education, profession: occupation, city, state },
      { upsert: true, new: true, runValidators: false }
    );

    const wasChangesRequested = user.form1ReviewStatus === 'changes_requested';

    // Update user status - always reset to pending_review on re-submit
    const userUpdate = {
      form1Completed: true,
      form1ReviewStatus: 'pending_review',
      registrationStep: Math.max(1, user.registrationStep || 1),
    };

    // If photos are already approved or pending review, clear the admin feedback notes
    if (user.photosReviewStatus !== 'changes_requested' && user.photosReviewStatus !== 'rejected') {
      userUpdate.adminNotes = '';
    }

    await User.findByIdAndUpdate(userId, userUpdate);

    // Create admin notification if this is an update (not first submission) or changes-requested reply
    if (existingProfile && (changedFields.length > 0 || wasChangesRequested)) {
      await AdminNotification.create({
        userId,
        type: 'profile_update',
        formUpdated: 'form1',
        changedFields,
        message: `User ${user.mobile} has resubmitted Form 1 details${wasChangesRequested ? ' in response to changes requested' : ''}.${changedFields.length > 0 ? ` Changed: ${changedFields.join(', ')}` : ''}`,
      });
    } else if (!existingProfile) {
      await AdminNotification.create({
        userId,
        type: 'profile_update',
        formUpdated: 'form1',
        message: `User ${user.mobile} submitted Form 1 details for the first time.`,
      });
    }

    console.log(`✅ Form-1 submitted for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Profile details saved. Awaiting admin review.',
      profile,
    });
  } catch (error) {
    console.error('❌ Form1 Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /profile/form1 — fetch existing profile
exports.getForm1 = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await BasicProfile.findOne({ userId });

    return res.status(200).json({
      success: true,
      profile: profile || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// GET /profile/form1/review-status
exports.getForm1ReviewStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('form1ReviewStatus photosReviewStatus form2ReviewStatus form2Status adminNotes');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Map backend statuses to frontend expectations
    // Frontend expects: pending, approved, rejected
    let status = 'pending';
    let rejectedForms = [];
    
    if (user.form1ReviewStatus === 'rejected' || user.form1ReviewStatus === 'changes_requested') rejectedForms.push('form1');
    if (user.photosReviewStatus === 'rejected' || user.photosReviewStatus === 'changes_requested') rejectedForms.push('photos');
    if (user.form2ReviewStatus === 'rejected' || user.form2ReviewStatus === 'changes_requested') rejectedForms.push('form2');

    if (rejectedForms.length > 0) {
      status = 'rejected';
    } else if (user.form1ReviewStatus === 'approved' && user.photosReviewStatus === 'approved') {
      if (user.form2Status === 'completed' && user.form2ReviewStatus !== 'approved') {
         status = 'pending'; // Form 2 is submitted but not yet approved
      } else {
         status = 'approved';
      }
    }

    return res.status(200).json({
      success: true,
      status,
      feedback: user.adminNotes || null,
      rejectedForms
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /profile/me — fetch the user's complete profile
exports.getMyFullProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password -otpStore');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const MarriageDetails = require('../models/MarriageDetails');
    const ProfilePhoto = require('../models/ProfilePhoto');
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

    const form1Data = await BasicProfile.findOne({ userId });
    const form2Data = await MarriageDetails.findOne({ userId });
    const photos = await ProfilePhoto.find({ userId }).sort({ createdAt: -1 });

    const photosWithPresignedUrls = await Promise.all(
      photos.map(async (photo) => {
        const doc = photo.toObject ? photo.toObject() : photo;
        doc.photoUrl = await generatePresignedUrl(doc.photoUrl);
        return doc;
      })
    );

    return res.status(200).json({
      success: true,
      user,
      form1Data: form1Data || {},
      form2Data: form2Data || null,
      photos: photosWithPresignedUrls || []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};