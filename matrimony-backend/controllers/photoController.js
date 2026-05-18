const ProfilePhoto = require('../models/ProfilePhoto');
const User = require('../models/User');

// POST /profile/upload-photo
exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware
    const { photoType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo uploaded' });
    }

    // req.file.location = S3 URL (set by multer-s3)
    const photoUrl = req.file.location || req.file.path;

    const photo = await ProfilePhoto.create({
      userId,
      photoUrl,
      photoType: photoType || 'general',
      isPrimary: photoType === 'headshot',
    });

    console.log(`✅ Photo uploaded for user: ${userId}, type: ${photoType}`);

    return res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl,
      photo,
    });
  } catch (error) {
    console.error('❌ Photo Upload Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /profile/complete-photos — called after all 4 photos are uploaded
exports.completePhotoUpload = async (req, res) => {
  try {
    const userId = req.userId;
    const AdminNotification = require('../models/AdminNotification');
    const user = await User.findById(userId);

    const wasChangesRequested = user && user.photosReviewStatus === 'changes_requested';

    const userUpdate = {
      photosReviewStatus: 'pending_review',
      registrationStep: 2,
    };

    if (user && user.form1ReviewStatus !== 'changes_requested' && user.form1ReviewStatus !== 'rejected') {
      userUpdate.adminNotes = '';
    }

    await User.findByIdAndUpdate(userId, userUpdate);

    if (wasChangesRequested) {
      await AdminNotification.create({
        userId,
        type: 'profile_update',
        formUpdated: 'photos',
        changedFields: ['photos'],
        message: `User ${user.mobile} has re-uploaded photos in response to changes requested.`,
      });
    } else if (!user.photosReviewStatus || user.photosReviewStatus === 'pending') {
      await AdminNotification.create({
        userId,
        type: 'profile_update',
        formUpdated: 'photos',
        changedFields: ['photos'],
        message: `User ${user.mobile} has completed photo upload for the first time.`,
      });
    }

    console.log(`✅ Photo upload completed for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Photos submitted for review',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require('../config/s3');

// DELETE /profile/photo/:photoType
exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    const { photoType } = req.params;

    const photo = await ProfilePhoto.findOne({ userId, photoType });
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // Extract S3 key from URL
    const urlParts = photo.photoUrl.split('/');
    const key = decodeURIComponent(urlParts[urlParts.length - 1]);

    if (key) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }));
      console.log(`✅ Photo deleted from S3: ${key}`);
    }

    await ProfilePhoto.deleteOne({ _id: photo._id });

    return res.status(200).json({ success: true, message: 'Photo removed successfully' });
  } catch (error) {
    console.error('❌ Delete Photo Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};