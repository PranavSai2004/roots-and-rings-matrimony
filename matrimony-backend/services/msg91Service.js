const axios = require('axios');
const bcrypt = require('bcrypt');
const OTP = require('../models/OTP');

// MSG91 API Configuration - Updated for correct endpoint
const MSG91_API_URL = 'https://api.msg91.com/api/sendhttp.php';
const MSG91_API_KEY = process.env.MSG91_API_KEY;
const MSG91_ROUTE = process.env.MSG91_ROUTE || '2';
const SENDER_ID = '516843';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for secure storage
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// Verify hashed OTP
const verifyHashedOTP = async (plainOTP, hashedOTP) => {
  return await bcrypt.compare(plainOTP, hashedOTP);
};

// Format message for MSG91
const formatMessage = (otp) => {
  return `Roots & Rings
OTP: ${otp}
Expires: 10 mins
Never share`;
};

// Send OTP via MSG91
const sendOTP = async (mobile) => {
  try {
    // Validate mobile
    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      throw new Error('Invalid mobile number');
    }

    // Check if OTP was recently sent (rate limiting)
    // For testing: 30 seconds; for production: 5 * 60 * 1000 (5 minutes)
    const recentOTP = await OTP.findOne({
      mobile,
      used: false,
      createdAt: { $gt: new Date(Date.now() - 30 * 1000) } // 30 seconds for testing
    });

    if (recentOTP) {
      throw new Error('OTP already sent. Please try again in 30 seconds.');
    }

    // Generate new OTP
    const plainOTP = generateOTP();
    const hashedOTP = await hashOTP(plainOTP);

    // Format message
    const message = formatMessage(plainOTP);

    console.log(`📱 Sending OTP to ${mobile}...`);
    console.log(`Message: ${message}`);
    console.log(`API Key: ${MSG91_API_KEY?.substring(0, 10)}...`);
    
    // Log exact request parameters
    const requestParams = {
      authkey: MSG91_API_KEY,
      mobiles: '91' + mobile,
      message: message,
      sender: SENDER_ID,
      route: MSG91_ROUTE
    };
    console.log(`📤 Sending to MSG91 with params:`, JSON.stringify(requestParams, null, 2));

    // Call MSG91 API with correct parameters
    const response = await axios.get(MSG91_API_URL, {
      params: requestParams
    });

    console.log(`✅ MSG91 Response:`, response.data);
    console.log(`📋 Message ID:`, response.data?.message_id || response.data);

    // Save OTP to database
    const otpRecord = await OTP.create({
      mobile,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
      msg91RequestId: response.data.request_id || null
    });

    return {
      success: true,
      message: `OTP sent to ${mobile}`,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
      mobile: mobile
    };
  } catch (error) {
    console.error('❌ MSG91 Error:', error.message);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Verify OTP
const verifyOTP = async (mobile, enteredOTP) => {
  try {
    // Validate inputs
    if (!mobile || !enteredOTP) {
      throw new Error('Mobile and OTP are required');
    }

    // Find the latest OTP for this mobile
    const otpRecord = await OTP.findOne({
      mobile,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new Error('OTP not found or expired');
    }

    // Check max attempts
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Verify OTP
    const isValid = await verifyHashedOTP(enteredOTP, otpRecord.otp);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new Error('Invalid OTP');
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    console.log(`✅ OTP verified for ${mobile}`);

    return {
      success: true,
      message: 'OTP verified successfully',
      mobile: mobile,
      otpRecord: otpRecord
    };
  } catch (error) {
    console.error('❌ OTP Verification Error:', error.message);
    throw new Error(`OTP verification failed: ${error.message}`);
  }
};

// Get OTP status (for debugging)
const getOTPStatus = async (mobile) => {
  try {
    const otpRecord = await OTP.findOne({
      mobile,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return {
        status: 'not_found',
        message: 'No active OTP found for this mobile'
      };
    }

    return {
      status: 'active',
      mobile: otpRecord.mobile,
      attempts: otpRecord.attempts,
      expiresAt: otpRecord.expiresAt,
      expiresIn: Math.round((otpRecord.expiresAt - Date.now()) / 1000)
    };
  } catch (error) {
    console.error('❌ Get OTP Status Error:', error.message);
    throw new Error(`Failed to get OTP status: ${error.message}`);
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  getOTPStatus,
  generateOTP
};
