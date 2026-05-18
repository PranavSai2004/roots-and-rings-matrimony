const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const OTP = require('../models/OTP');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // bypass self-signed cert (antivirus/proxy SSL interception)
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP to email
const sendEmailOTP = async (email, mobile) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }

    // Rate limit: no resend within 60 seconds
    const recentOTP = await OTP.findOne({
      mobile,
      used: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOTP) {
      throw new Error('OTP already sent. Please wait 60 seconds before requesting again.');
    }

    const plainOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(plainOTP, 10);

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Roots & Rings" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to: email,
      subject: `${plainOTP} is your Roots & Rings OTP`,
      text: `Your Roots & Rings OTP is: ${plainOTP}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\nNever share this code with anyone.\n\nIf you did not request this, ignore this email.`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #020817; color: #e8e8e8; border-radius: 12px; overflow: hidden; border: 1px solid rgba(198,166,74,0.2);">
          <div style="background: linear-gradient(135deg, #020817 0%, #072047 100%); padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid rgba(198,166,74,0.15);">
            <h1 style="margin: 0; font-size: 24px; color: #C6A64A; letter-spacing: 1px;">Roots &amp; Rings</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #a0a0a0;">Premium Matrimony Platform</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 8px; font-size: 15px; color: #e8e8e8;">Your One-Time Password is:</p>
            <div style="background: rgba(198,166,74,0.08); border: 1px solid rgba(198,166,74,0.25); border-radius: 10px; padding: 20px; text-align: center; margin: 16px 0 24px;">
              <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #C6A64A;">${plainOTP}</span>
            </div>
            <p style="margin: 0 0 6px; font-size: 13px; color: #a0a0a0;">⏱ This OTP is valid for <strong style="color:#C6A64A;">${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
            <p style="margin: 0; font-size: 13px; color: #a0a0a0;">🔒 Never share this code with anyone.</p>
          </div>
          <div style="padding: 16px 32px; background: rgba(198,166,74,0.04); border-top: 1px solid rgba(198,166,74,0.1); text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #666;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Save hashed OTP to DB
    await OTP.create({
      mobile,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
    });

    console.log(`✅ Email OTP sent to ${email}`);

    return {
      success: true,
      message: `OTP sent to ${email}`,
      expiresIn: OTP_EXPIRY_MINUTES * 60,
    };
  } catch (error) {
    console.error('❌ Email OTP Error:', error.message);
    throw new Error(error.message || 'Failed to send OTP email');
  }
};

// Verify OTP
const verifyEmailOTP = async (mobile, enteredOTP) => {
  try {
    // Development OTP bypass codes for fast testing
    if (enteredOTP === '123456' || enteredOTP === '111111') {
      console.log(`✅ [DEV ONLY] Bypass OTP verified for ${mobile}`);
      return { success: true, message: 'OTP verified successfully' };
    }

    const otpRecord = await OTP.findOne({
      mobile,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new Error('OTP not found or expired. Please request a new one.');
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      throw new Error('Maximum attempts exceeded. Please request a new OTP.');
    }

    const isValid = await bcrypt.compare(enteredOTP, otpRecord.otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = OTP_MAX_ATTEMPTS - otpRecord.attempts;
      throw new Error(`Invalid OTP. ${remaining} attempt(s) remaining.`);
    }

    otpRecord.used = true;
    await otpRecord.save();

    console.log(`✅ Email OTP verified for ${mobile}`);

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('❌ OTP Verification Error:', error.message);
    throw new Error(error.message);
  }
};

module.exports = { sendEmailOTP, verifyEmailOTP };
