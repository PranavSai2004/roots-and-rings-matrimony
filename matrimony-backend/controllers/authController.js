const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmailOTP, verifyEmailOTP } = require('../services/emailService');

// Check Mobile Number Status (Detect existing vs new user)
exports.checkMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
    }

    const user = await User.findOne({ mobile });
    if (user && user.email) {
      // Mask email for user visual verification: e.g. pardha@gmail.com -> pa***a@gmail.com
      const [name, domain] = user.email.split('@');
      const maskedName = name.length > 2 
        ? name.slice(0, 2) + '*'.repeat(name.length - 3) + name.slice(-1)
        : name.charAt(0) + '*';
      const maskedEmail = `${maskedName}@${domain}`;
      
      return res.status(200).json({
        success: true,
        exists: true,
        email: maskedEmail
      });
    }
    return res.status(200).json({
      success: true,
      exists: false
    });
  } catch (error) {
    console.error('❌ Check Mobile Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server checking error' });
  }
};

// Send Email OTP
exports.sendEmailOTP = async (req, res) => {
  try {
    let { mobile, email } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      email = existingUser.email;
    } else if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required for new registration' });
    }

    const result = await sendEmailOTP(email, mobile);

    return res.status(200).json({
      success: true,
      message: result.message,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    console.error('❌ Send Email OTP Error:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
};

// Verify Email OTP and login/register user
exports.verifyEmailOTP = async (req, res) => {
  try {
    let { mobile, email, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }

    // Verify OTP
    await verifyEmailOTP(mobile, otp);

    // Find or create user
    let user = await User.findOne({ mobile });

    if (!user) {
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required for new registration' });
      }
      user = await User.create({
        mobile,
        email,
        otpVerified: true,
        form1Completed: false,
        form2Completed: false,
        paymentStatus: 'pending',
        adminApprovedForForm2: false,
        accountStatus: 'pending',
        registrationStep: 0,
      });
      console.log('✅ New user created:', user._id);

      try {
        const AdminNotification = require('../models/AdminNotification');
        await AdminNotification.create({
          userId: user._id,
          type: 'new_registration',
          message: `New user registered with mobile ${mobile}`,
        });
      } catch (err) {
        console.error('❌ Failed to create new registration notification:', err.message);
      }
    } else {
      user.otpVerified = true;
      if (email) user.email = email; // update email if provided
      await user.save();
      console.log('✅ Existing user verified:', user._id);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, mobile: user.mobile },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id,
        mobile: user.mobile,
        email: user.email,
        otpVerified: user.otpVerified,
        registrationStep: user.registrationStep,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error('❌ Verify Email OTP Error:', error.message);
    return res.status(400).json({ success: false, message: error.message || 'OTP verification failed' });
  }
};


// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const Admin = require('../models/Admin');
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('❌ Admin Login Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Admin login failed'
    });
  }
};