import { auth } from './firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import axios from 'axios';

// Setup reCAPTCHA for OTP sending
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  try {
    // Firebase v9+ modular API: auth is the FIRST argument
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log('✅ reCAPTCHA verified:', response);
      },
      'expired-callback': () => {
        console.warn('⚠️ reCAPTCHA expired');
      },
      'error-callback': (error) => {
        console.error('❌ reCAPTCHA error:', error);
      }
    });
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
  }
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    // Add country code if not present
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : '+91' + phoneNumber.replace(/\D/g, '').slice(-10);

    console.log('📱 Sending OTP to:', formattedPhone);

    // Ensure reCAPTCHA is set up
    if (!window.recaptchaVerifier) {
      setupRecaptcha();
    }

    const appVerifier = window.recaptchaVerifier;

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      appVerifier
    );

    // Store confirmation result for OTP verification
    window.confirmationResult = confirmationResult;

    console.log('✅ OTP sent successfully to', formattedPhone);
    return {
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      formattedPhone
    };
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    
    // Handle specific errors
    if (error.code === 'auth/invalid-phone-number') {
      return { success: false, message: 'Invalid phone number format' };
    } else if (error.code === 'auth/too-many-requests') {
      return { success: false, message: 'Too many attempts. Please try again later.' };
    }
    
    return { 
      success: false, 
      message: error.message || 'Failed to send OTP. Please try again.' 
    };
  }
};

// Verify OTP and get Firebase token
export const verifyOTP = async (otp) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('OTP session expired. Please request a new OTP.');
    }

    console.log('🔐 Verifying OTP...');

    // Verify OTP with Firebase
    const credential = await window.confirmationResult.confirm(otp);
    const idToken = await credential.user.getIdToken();
    const phoneNumber = credential.user.phoneNumber;

    console.log('✅ OTP verified successfully');

    return {
      success: true,
      idToken,
      phoneNumber,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);

    if (error.code === 'auth/invalid-verification-code') {
      return { success: false, message: 'Invalid OTP. Please check and try again.' };
    } else if (error.code === 'auth/code-expired') {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    return { 
      success: false, 
      message: error.message || 'Failed to verify OTP. Please try again.' 
    };
  }
};

// Send Firebase token to backend for user creation/login
export const firebaseLoginBackend = async (idToken, phoneNumber) => {
  try {
    console.log('📤 Sending to backend for verification...');

    const response = await axios.post(
      import.meta.env.VITE_API_BASE_URL + '/auth/firebase-login',
      { idToken, phone: phoneNumber },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { token, user } = response.data;

    // Store JWT in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('✅ Backend login successful');

    return {
      success: true,
      token,
      user,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('❌ Backend login error:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Backend verification failed'
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Logged out successfully');
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('❌ Error logging out:', error);
    return { success: false, message: 'Failed to logout' };
  }
};

// Rate limiting - Allow 1 OTP per 60 seconds
export const checkOTPRateLimit = () => {
  const lastOTPTime = localStorage.getItem('lastOTPTime');
  const now = Date.now();
  const cooldownPeriod = 60 * 1000; // 60 seconds

  if (lastOTPTime && now - parseInt(lastOTPTime) < cooldownPeriod) {
    const remainingSeconds = Math.ceil((cooldownPeriod - (now - parseInt(lastOTPTime))) / 1000);
    return {
      allowed: false,
      message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      remainingSeconds
    };
  }

  localStorage.setItem('lastOTPTime', now.toString());
  return { allowed: true };
};

// Clear OTP session on logout
export const clearOTPSession = () => {
  window.confirmationResult = null;
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};
