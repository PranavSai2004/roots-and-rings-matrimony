const MarriageDetails = require('../models/MarriageDetails');
const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const Joi = require('joi');

const form2Schema = Joi.object({
  height: Joi.string().allow('', null),
  weight: Joi.string().allow('', null),
  bloodGroup: Joi.string().allow('', null),
  physicalStatus: Joi.string().allow('', null),
  familyType: Joi.string().allow('', null),
  siblings: Joi.number().min(0).required(),
  fatherOccupation: Joi.string().allow('', null),
  motherOccupation: Joi.string().allow('', null),
  familyValues: Joi.string().allow('', null),
  nativePlace: Joi.string().allow('', null),
  companyName: Joi.string().allow('', null),
  annualIncome: Joi.string().allow('', null),
  workLocation: Joi.string().allow('', null),
  jobType: Joi.string().allow('', null),
  diet: Joi.string().allow('', null),
  smoking: Joi.string().allow('', null),
  drinking: Joi.string().allow('', null),
  aboutMe: Joi.string().allow('', null),
  expectations: Joi.string().allow('', null),
  maritalStatus: Joi.string().allow('', null),
  lifestyle: Joi.string().allow('', null),
  raasi: Joi.string().allow('', null),
  nakshatra: Joi.string().allow('', null),
  gothram: Joi.string().allow('', null),
  preferredAgeRange: Joi.object({
    min: Joi.number().allow('', null),
    max: Joi.number().allow('', null)
  }).allow(null),
  preferredLocation: Joi.string().allow('', null),
  preferredEducation: Joi.string().allow('', null),
  preferredProfession: Joi.string().allow('', null),
  preferredReligion: Joi.string().allow('', null),
  preferredCaste: Joi.string().allow('', null)
});

// POST /profile/form2/submit
exports.submitForm2 = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware
    
    console.log("FORM2 BODY:", req.body);
    console.log("AUTH USER:", req.user);

    // Check user is allowed to fill Form-2
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.paymentStatus !== 'confirmed' && user.paymentStatus !== 'verified' && user.adminApprovedForForm2 !== true) {
      return res.status(403).json({
        success: false,
        message: 'Form-2 is locked. Please complete payment and await admin approval.',
      });
    }

    const { error, value } = form2Schema.validate(req.body, { stripUnknown: true });
    
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const {
      height,
      weight,
      bloodGroup,
      physicalStatus,
      familyType,
      siblings,
      fatherOccupation,
      motherOccupation,
      familyValues,
      nativePlace,
      companyName,
      annualIncome,
      workLocation,
      jobType,
      diet,
      smoking,
      drinking,
      aboutMe,
      expectations,
      maritalStatus,
      lifestyle,
      raasi,
      nakshatra,
      gothram,
      preferredAgeRange,
      preferredLocation,
      preferredEducation,
      preferredProfession,
      preferredReligion,
      preferredCaste
    } = value;

    // Fetch existing doc to compute field diff
    const existingDoc = await MarriageDetails.findOne({ userId });
    const changedFields = [];
    if (existingDoc) {
      const incoming = { 
        height, weight, bloodGroup, physicalStatus, familyType, siblings, 
        fatherOccupation, motherOccupation, familyValues, nativePlace, 
        companyName, annualIncome, workLocation, jobType, diet, smoking, 
        drinking, aboutMe, expectations, maritalStatus, lifestyle, raasi, 
        nakshatra, gothram, preferredLocation, preferredEducation, 
        preferredProfession, preferredReligion, preferredCaste 
      };
      for (const key of Object.keys(incoming)) {
        if (String(incoming[key] ?? '') !== String(existingDoc[key] ?? '')) changedFields.push(key);
      }
    }

    // Upsert marriage details
    const marriageDetails = await MarriageDetails.findOneAndUpdate(
      { userId },
      { 
        userId, height, weight, bloodGroup, physicalStatus, familyType, siblings, 
        fatherOccupation, motherOccupation, familyValues, nativePlace, companyName, 
        annualIncome, workLocation, jobType, diet, smoking, drinking, aboutMe, 
        expectations, maritalStatus, lifestyle, raasi, nakshatra, gothram, 
        preferredAgeRange, preferredLocation, preferredEducation, preferredProfession, 
        preferredReligion, preferredCaste, form2ReviewStatus: 'pending_review' 
      },
      { upsert: true, new: true, runValidators: false }
    );

    const wasChangesRequested = user.form2ReviewStatus === 'changes_requested';

    // Update user status
    await User.findByIdAndUpdate(userId, {
      form2Completed: true,
      registrationStep: 4,
      form2Status: 'completed',
      form2ReviewStatus: 'pending_review',
      adminNotes: '', // Reset Form-2 feedback immediately on resubmission
    });

    // Create admin notification if this is a re-submission with changes or changes-requested reply
    if (existingDoc && (changedFields.length > 0 || wasChangesRequested)) {
      await AdminNotification.create({
        userId,
        type: 'profile_update',
        formUpdated: 'form2',
        changedFields,
        message: `User ${user.mobile} has resubmitted Marriage Details${wasChangesRequested ? ' in response to changes requested' : ''}.${changedFields.length > 0 ? ` Changed: ${changedFields.join(', ')}` : ''}`,
      });
    } else if (!existingDoc) {
      await AdminNotification.create({
        userId,
        type: 'profile_update',
        formUpdated: 'form2',
        message: `User ${user.mobile} submitted Marriage Details (Form 2) for the first time.`,
      });
    }

    console.log(`✅ Form-2 submitted for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: 'Marriage details saved. Awaiting final admin review.',
      marriageDetails,
    });
  } catch (err) {
    console.error("FORM2 SAVE ERROR:", err);
    return res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
};

// GET /profile/form2 — fetch existing Form-2 data
exports.getForm2 = async (req, res) => {
  try {
    const userId = req.userId;
    const marriageDetails = await MarriageDetails.findOne({ userId });

    return res.status(200).json({
      success: true,
      marriageDetails: marriageDetails || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
