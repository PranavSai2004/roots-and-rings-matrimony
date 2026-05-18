import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhone as Phone, FaLock as Lock, FaClock as Clock } from 'react-icons/fa6';
import { 
  setupRecaptcha, 
  sendOTP, 
  verifyOTP, 
  firebaseLoginBackend,
  checkOTPRateLimit,
  clearOTPSession 
} from '../utils/firebaseAuth';
import { useAuth } from '../hooks/useAuth';



export const FirebaseOTPScreen = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [step, setStep] = useState('phone'); // phone, otp, loading
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    setupRecaptcha();
    return () => clearOTPSession();
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate phone number
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Check rate limiting
    const rateLimitCheck = checkOTPRateLimit();
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message);
      setCountdown(rateLimitCheck.remainingSeconds);
      return;
    }

    setLoading(true);
    const result = await sendOTP(phone);

    if (result.success) {
      setSuccessMessage(result.message);
      setStep('otp');
      setCountdown(60); // Start 60-second countdown
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    // Step 1: Verify OTP with Firebase
    const otpResult = await verifyOTP(otp);

    if (!otpResult.success) {
      setError(otpResult.message);
      setLoading(false);
      return;
    }

    setSuccessMessage('✅ OTP verified! Logging in...');

    // Step 2: Send Firebase token to backend
    const backendResult = await firebaseLoginBackend(
      otpResult.idToken,
      otpResult.phoneNumber
    );

    if (backendResult.success) {
      // Step 3: Update global auth state with real backend user
      loginUser(backendResult.user);
      setSuccessMessage('✅ Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 1500);
    } else {
      setError(backendResult.message);
      setStep('phone'); // Reset to phone step
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-gold-950/20 to-navy-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 flex justify-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg">
              <Phone className="text-3xl text-navy-950" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">
            Roots & Rings
          </h1>
          <p className="text-luxe-gray-400">Login with Phone Number</p>
        </div>

        {/* Main Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP}
          className="p-8 bg-navy-900/50 border border-gold-500/20 rounded-2xl shadow-luxury backdrop-blur-sm"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-400 text-sm">❌ {error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-400 text-sm">{successMessage}</p>
            </motion.div>
          )}

          {/* Phone Number Step */}
          {step === 'phone' && (
            <div>
              <label className="block text-sm font-medium text-luxe-gray-300 mb-3">
                Mobile Number (10 digits)
              </label>
              <div className="relative mb-6">
                <div className="absolute left-0 top-0 h-full flex items-center px-3 text-gold-500 text-lg">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                  className="w-full pl-20 pr-4 py-3 bg-navy-950/50 border border-gold-500/20 rounded-lg text-luxe-gray-100 placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* reCAPTCHA container */}
              <div id="recaptcha-container" className="mb-6" />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin text-lg" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone className="text-lg" />
                    Send OTP
                  </>
                )}
              </motion.button>

              <p className="text-xs text-luxe-gray-500 text-center mt-4">
                We'll send you a One-Time Password via SMS
              </p>
            </div>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <div>
              <label className="block text-sm font-medium text-luxe-gray-300 mb-3">
                Enter OTP (6 digits)
              </label>
              <p className="text-xs text-luxe-gray-400 mb-4">
                OTP sent to +91{phone}
              </p>

              <div className="relative mb-6">
                <Lock className="absolute left-3 top-3 text-gold-500 text-lg" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full pl-10 pr-4 py-3 bg-navy-950/50 border border-gold-500/20 rounded-lg text-luxe-gray-100 placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors text-center tracking-widest text-xl"
                  disabled={loading}
                />
              </div>

              {/* Countdown Timer */}
              {countdown > 0 && (
                <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <p className="text-yellow-400 text-sm">
                    ⏱️ Request new OTP in {countdown}s
                  </p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="animate-spin text-lg" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="text-lg" />
                    Verify OTP
                  </>
                )}
              </motion.button>

              {/* Resend OTP */}
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                }}
                disabled={countdown > 0}
                className="w-full mt-3 py-2 text-gold-400 hover:text-gold-300 text-sm font-medium disabled:opacity-50"
              >
                ← Back to phone number
              </button>
            </div>
          )}
        </motion.form>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-luxe-gray-500 mt-8"
        >
          🔒 Your data is secure. We'll never share your phone number.
        </motion.p>
      </motion.div>
    </div>
  );
};
