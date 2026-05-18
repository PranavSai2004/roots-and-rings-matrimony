const User = require("../models/User");
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

// Search & Filter Profiles
exports.searchProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 1. Build Match for BasicProfile
    const profileMatch = {};

    if (req.query.ageMin || req.query.ageMax) {
      // Age is derived from dob. Calculate date boundaries.
      profileMatch.dob = {};
      const now = new Date();
      if (req.query.ageMin) {
        const minDate = new Date();
        minDate.setFullYear(now.getFullYear() - parseInt(req.query.ageMin));
        profileMatch.dob.$lte = minDate;
      }
      if (req.query.ageMax) {
        const maxDate = new Date();
        maxDate.setFullYear(now.getFullYear() - parseInt(req.query.ageMax) - 1);
        profileMatch.dob.$gte = maxDate;
      }
    }

    if (req.query.location) profileMatch.city = new RegExp(req.query.location, "i");
    if (req.query.caste) profileMatch.caste = new RegExp(req.query.caste, "i");
    if (req.query.religion) profileMatch.religion = new RegExp(req.query.religion, "i");
    if (req.query.gender) profileMatch.gender = req.query.gender;
    if (req.query.education) profileMatch.education = new RegExp(req.query.education, "i");
    if (req.query.profession) profileMatch.profession = new RegExp(req.query.profession, "i");
    if (req.query.language) profileMatch.motherTongue = new RegExp(req.query.language, "i");

    if (req.query.income) {
      // Map income string from frontend if needed. Let's just do a regex for now if it's a string range.
      // Frontend passes e.g. '10L-20L'
      profileMatch.annualIncomeText = new RegExp(req.query.income, "i"); 
      // Assuming it's stored as text, or else omit for now if the data structure doesn't match perfectly.
    }
    
    if (req.query.lifestyle) profileMatch.lifestyle = new RegExp(req.query.lifestyle, "i");

    // Build the aggregation pipeline
    const pipeline = [
      { $match: profileMatch },
      // Lookup User to check account status
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      // Exclude matched users from search results
      { $match: { "user.accountStatus": { $ne: "matched" } } }
    ];

    // Family Values from MarriageDetails
    if (req.query.familyValues) {
      pipeline.push({
        $lookup: {
          from: "marriagedetails",
          localField: "userId",
          foreignField: "userId",
          as: "marriageDetails"
        }
      });
      pipeline.push({ $unwind: { path: "$marriageDetails", preserveNullAndEmptyArrays: true } });
      
      if (req.query.familyValues) pipeline.push({ $match: { "marriageDetails.familyValues": new RegExp(req.query.familyValues, "i") } });
    }

    // Sort
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: { createdAt: sortOrder } });

    // Pagination
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    });

    const results = await BasicProfile.aggregate(pipeline);
    const totalCount = results[0].metadata[0]?.total || 0;
    const rawProfiles = results[0].data;

    // Map the results and attach primary photos
    const mappedProfiles = await Promise.all(
      rawProfiles.map(async (p) => {
        const photo = await ProfilePhoto.findOne({ userId: p.userId }).sort({ createdAt: -1 });
        const presignedPhotoUrl = photo ? await generatePresignedUrl(photo.photoUrl) : null;
        
        const dob = p.dob ? new Date(p.dob) : null;
        const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : null;

        return {
          _id: p.userId, 
          firstName: p.fullName?.split(' ')[0] || "—",
          fullName: p.fullName,
          age: age || "?",
          gender: p.gender,
          location: p.city || "—",
          caste: p.caste || "—",
          religion: p.religion || "—",
          education: p.education || "—",
          occupation: p.profession || "—",
          motherTongue: p.motherTongue || "—",
          photoUrl: presignedPhotoUrl,
          registrationStep: p.user?.registrationStep || 0,
          accountStatus: p.user?.accountStatus || "pending"
        };
      })
    );

    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      filters: req.query,
      profiles: mappedProfiles
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Profile (for admin preview)
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile retrieved successfully", profile: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
