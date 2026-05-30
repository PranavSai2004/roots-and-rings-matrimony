const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const OTP = require('../models/OTP');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
const EMAIL_SEND_TIMEOUT_MS = parseInt(process.env.EMAIL_SEND_TIMEOUT_MS, 10) || 15000;
const EMAIL_RETRY_LIMIT = parseInt(process.env.EMAIL_RETRY_LIMIT, 10) || 1;

let transporter = null;
let transporterReady = false;
let transporterConfig = null;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getEmailConfig = () => {
  if (process.env.RESEND_API_KEY) {
    return {
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    };
  }

  if (process.env.SENDGRID_API_KEY) {
    return {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM,
    };
  }

  const hasSmtpEnv =
    process.env.SMTP_HOST ||
    process.env.SMTP_PORT ||
    process.env.SMTP_USER ||
    process.env.SMTP_PASS;

  if (hasSmtpEnv) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return {
      provider: 'smtp',
      host: process.env.SMTP_HOST,
      port,
      secure,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    };
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    return {
      provider: 'gmail-smtp',
      host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.GMAIL_SMTP_PORT || '465', 10),
      secure: process.env.GMAIL_SMTP_SECURE === 'true' || !process.env.GMAIL_SMTP_PORT,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    };
  }

  return null;
};

const validateEmailConfig = (config) => {
  if (!config) {
    return ['RESEND_API_KEY/SENDGRID_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_APP_PASSWORD'];
  }

  const missing = [];

  if (config.provider === 'resend' || config.provider === 'sendgrid') {
    if (!config.apiKey) missing.push(config.provider === 'resend' ? 'RESEND_API_KEY' : 'SENDGRID_API_KEY');
    if (!config.from) missing.push('EMAIL_FROM');
    return missing;
  }

  if (!config.host) missing.push('SMTP_HOST');
  if (!config.port) missing.push('SMTP_PORT');
  if (!config.user) missing.push(config.provider === 'gmail-smtp' ? 'EMAIL_USER' : 'SMTP_USER');
  if (!config.pass) missing.push(config.provider === 'gmail-smtp' ? 'EMAIL_APP_PASSWORD' : 'SMTP_PASS');
  if (!config.from) missing.push('EMAIL_FROM');
  return missing;
};

const createTransporter = (config) => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    requireTLS: !config.secure,
    connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
    greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
    socketTimeout: EMAIL_SEND_TIMEOUT_MS,
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
};

const withTimeout = (promise, timeoutMs, errorMessage) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(createError(errorMessage, 504));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const initEmailService = async () => {
  transporterConfig = getEmailConfig();
  const missing = validateEmailConfig(transporterConfig);

  if (missing.length) {
    transporter = null;
    transporterReady = false;
    console.error('EMAIL_CONFIG_MISSING', { missing });
    throw createError('Email configuration missing', 500);
  }

  if (transporterConfig.provider === 'resend' || transporterConfig.provider === 'sendgrid') {
    transporter = null;
    transporterReady = true;
    console.log('✅ Email provider configured', {
      provider: transporterConfig.provider,
    });
    return;
  }

  transporter = createTransporter(transporterConfig);

  try {
    await withTimeout(transporter.verify(), EMAIL_SEND_TIMEOUT_MS, 'SMTP verify timeout');
    transporterReady = true;
    console.log('✅ Email transporter verified', {
      provider: transporterConfig.provider,
      host: transporterConfig.host,
      port: transporterConfig.port,
      secure: transporterConfig.secure,
    });
  } catch (error) {
    transporterReady = false;
    console.error('EMAIL_TRANSPORT_VERIFY_FAILED', {
      message: error.message,
      code: error.code,
      command: error.command,
    });
  }
};

const isRetryableError = (error) => {
  if (!error) return false;
  const retryableCodes = new Set([
    'ETIMEDOUT',
    'ECONNECTION',
    'ECONNRESET',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'ESOCKET',
  ]);
  return retryableCodes.has(error.code) || error.statusCode === 504;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWithRetry = async (sendFn) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= EMAIL_RETRY_LIMIT) {
    try {
      return await sendFn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === EMAIL_RETRY_LIMIT) {
        throw error;
      }
      await sleep(400 * (attempt + 1));
    }
    attempt += 1;
  }

  throw lastError;
};

const sendViaResend = async ({ to, subject, text, html }) => {
  const response = await withTimeout(
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${transporterConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: transporterConfig.from,
        to,
        subject,
        text,
        html,
      }),
    }),
    EMAIL_SEND_TIMEOUT_MS,
    'Email send timeout'
  );

  if (!response.ok) {
    const body = await response.text();
    let errorMessage = 'Resend API error';
    
    // Parse Resend JSON error if possible
    try {
      const parsed = JSON.parse(body);
      if (parsed && parsed.message) {
        // Handle unverified domain / sandbox restriction
        if (response.status === 403 && parsed.message.includes('testing emails')) {
          errorMessage = 'Resend Domain Unverified: You can only send to your own email address. Add and verify your custom domain in the Resend dashboard to send to real users.';
        } else {
          errorMessage = parsed.message;
        }
      }
    } catch (e) {
      if (response.status === 403 && body.toLowerCase().includes('from')) {
        errorMessage = 'Resend sender not verified';
      }
    }
    
    const error = createError(errorMessage, response.status);
    error.response = body;
    throw error;
  }

  try {
    const payload = await response.json();
    console.log('EMAIL_PROVIDER_RESPONSE', {
      provider: 'resend',
      statusCode: response.status,
      response: payload,
    });
  } catch (error) {
    console.log('EMAIL_PROVIDER_RESPONSE', {
      provider: 'resend',
      statusCode: response.status,
    });
  }
};

const sendViaSendGrid = async ({ to, subject, text, html }) => {
  const response = await withTimeout(
    fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${transporterConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: transporterConfig.from },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    }),
    EMAIL_SEND_TIMEOUT_MS,
    'Email send timeout'
  );

  if (!response.ok) {
    const body = await response.text();
    const error = createError('SendGrid API error', response.status);
    error.response = body;
    throw error;
  }
};

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP to email
const sendEmailOTP = async (email, mobile) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError('Invalid email address', 400);
    }

    // Rate limit: no resend within 60 seconds
    const recentOTP = await OTP.findOne({
      mobile,
      used: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOTP) {
      throw createError('OTP already sent. Please wait 60 seconds before requesting again.', 429);
    }

    const plainOTP = generateOTP();
    const hashedOTP = await bcrypt.hash(plainOTP, 10);

    if (!transporterConfig) {
      await initEmailService();
    }

    if (!transporterConfig) {
      throw createError('Email configuration missing', 500);
    }

    const subject = `${plainOTP} is your Roots & Rings OTP`;
    const text = `Your Roots & Rings OTP is: ${plainOTP}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\nNever share this code with anyone.\n\nIf you did not request this, ignore this email.`;
    const html = `
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
      `;

    console.log('EMAIL_SEND_ATTEMPT', {
      provider: transporterConfig.provider,
      from: transporterConfig.from,
      to: email,
      subject,
    });

    if (transporterConfig.provider === 'resend') {
      await sendWithRetry(() => sendViaResend({
        to: email,
        subject,
        text,
        html,
      }));
    } else if (transporterConfig.provider === 'sendgrid') {
      await sendWithRetry(() => sendViaSendGrid({
        to: email,
        subject,
        text,
        html,
      }));
    } else {
      if (!transporter) {
        await initEmailService();
      }

      if (!transporter || !transporterReady) {
        throw createError('Email service unavailable', 502);
      }

      const mailOptions = {
        from: `"Roots & Rings" <${transporterConfig.from}>`,
        replyTo: transporterConfig.from,
        to: email,
        subject,
        text,
        html,
      };

      await sendWithRetry(() => withTimeout(
        transporter.sendMail(mailOptions),
        EMAIL_SEND_TIMEOUT_MS,
        'Email send timeout'
      ));
    }

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
    const statusCode = error.statusCode || 500;
    if (error.response) {
      console.error('EMAIL_PROVIDER_RESPONSE', {
        statusCode,
        response: error.response,
      });
    }
    if (statusCode >= 500) {
      console.error('EMAIL_SEND_FAILED', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
    }
    throw createError(error.message || 'Failed to send OTP email', statusCode);
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

module.exports = { sendEmailOTP, verifyEmailOTP, initEmailService };
