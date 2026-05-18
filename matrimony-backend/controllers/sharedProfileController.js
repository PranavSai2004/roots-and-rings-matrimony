const SharedProfile = require("../models/SharedProfile");
const User = require("../models/User");

// Get shared profiles for user
exports.getSharedProfiles = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // SECURITY: Ensure user is only requesting their own profiles
    if (req.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden: You cannot access profiles shared with another user."
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();

    // Get only active (non-expired) shared profiles
    const totalCount = await SharedProfile.countDocuments({
      recipientUserId: userId,
      status: "active",
      expiresAt: { $gt: now }
    });

    const sharedProfiles = await SharedProfile.find({
      recipientUserId: userId,
      status: "active",
      expiresAt: { $gt: now }
    })
      .populate("profileId", "name age profession caste city primaryImage")
      .populate("batchId", "createdAt expiresAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out any where batchId population might fail or batch itself is expired (belt and braces)
    const validProfiles = sharedProfiles.filter(sp => sp.batchId && new Date(sp.batchId.expiresAt) > now);

    // Add watermark to each profile
    const profilesWithWatermark = validProfiles.map(sp => {
      const user = sp.recipientUserId;
      const userMobile = typeof user === 'object' ? user.mobile : user;
      
      // Super robust fail-safe resolver: get raw ObjectId string even if population fails or returns null
      const rawProfileId = sp.populated("profileId") || sp.profileId;
      const profileIdStr = rawProfileId ? rawProfileId.toString() : '';

      return {
        _id: sp._id,
        batchId: sp.batchId,
        profileUserId: profileIdStr,
        profileData: {
          ...sp.limitedProfileData,
          primaryImage: sp.limitedProfileData.primaryImage ? `/user/shared-profiles/watermark/${profileIdStr}` : null
        },
        watermark: {
          platform: "Roots & Rings Matrimony",
          sharedFor: userMobile || req.mobile, // req.mobile comes from authMiddleware
          expiresAt: sp.expiresAt,
          doNotShare: "Confidential"
        },
        isViewed: sp.isViewed,
        createdAt: sp.createdAt
      };
    });

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      data: profilesWithWatermark
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Mark profile as viewed
exports.markAsViewed = async (req, res) => {
  try {
    const { sharedProfileId } = req.params;

    const sharedProfile = await SharedProfile.findByIdAndUpdate(
      sharedProfileId,
      {
        isViewed: true,
        viewedAt: new Date()
      },
      { new: true }
    );

    if (!sharedProfile) {
      return res.status(404).json({
        message: "Shared profile not found"
      });
    }

    res.json({
      message: "Profile marked as viewed",
      isViewed: sharedProfile.isViewed
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const sharp = require('sharp');
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require('../config/s3');
const ProfilePhoto = require('../models/ProfilePhoto');

// GET /shared-profiles/watermark/:profileId
exports.getWatermarkedPhoto = async (req, res) => {
  try {
    // Auth is handled by a custom query-based middleware or authMiddleware 
    const { profileId } = req.params;
    
    // 1. Verify user actually has this profile shared with them
    const hasAccess = await SharedProfile.findOne({
      recipientUserId: req.userId,
      profileId: profileId,
      status: "active",
      expiresAt: { $gt: new Date() }
    });

    if (!hasAccess) {
      return res.status(403).send("Forbidden or Expired");
    }

    // 2. Find photo (primary first, fallback to latest)
    let photo = await ProfilePhoto.findOne({ userId: profileId, isPrimary: true });
    if (!photo) {
      photo = await ProfilePhoto.findOne({ userId: profileId }).sort({ createdAt: -1 });
    }
    if (!photo) return res.status(404).send("No photo");

    // 3. Fetch image buffer (S3 or Local filesystem)
    let buffer;
    if (photo.photoUrl.includes("amazonaws.com")) {
      // Extract S3 key
      const urlParts = photo.photoUrl.split('/');
      const key = decodeURIComponent(urlParts[urlParts.length - 1]);

      // Fetch from S3
      const s3Response = await s3.send(new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }));
      buffer = await s3Response.Body.transformToByteArray();
    } else {
      // Fetch from Local Filesystem
      const fs = require('fs').promises;
      const path = require('path');
      
      let relativePath = photo.photoUrl;
      if (relativePath.startsWith('http')) {
        try {
          const urlObj = new URL(relativePath);
          relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
        } catch (e) {
          console.error("URL Parse error in photoUrl:", e);
        }
      }
      
      // Resolve path
      const absolutePath = path.resolve(__dirname, '..', relativePath);
      try {
        buffer = await fs.readFile(absolutePath);
      } catch (err) {
        console.error("Local file read error:", err.message);
        return res.status(404).send("Local photo file not found");
      }
    }
    
    // 4. Create SVG watermark
    const svgText = `
      <svg width="600" height="800">
        <style>
          .title { fill: rgba(255, 255, 255, 0.4); font-size: 32px; font-weight: bold; transform: rotate(-45deg); transform-origin: center; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" class="title">CONFIDENTIAL • SHARED FOR ${req.mobile || req.userId}</text>
      </svg>
    `;

    // 5. Apply watermark using sharp
    const watermarkedBuffer = await sharp(buffer)
      .composite([{
        input: Buffer.from(svgText),
        gravity: 'center'
      }])
      .jpeg()
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(watermarkedBuffer);

  } catch (error) {
    console.error("Watermark Error:", error.message);
    res.status(500).send("Error generating watermark");
  }
};
