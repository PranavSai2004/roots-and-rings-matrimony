import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPhone as Phone,
  FaEnvelope as Mail,
  FaArrowRight as ArrowRight,
  FaShieldHalved as Shield,
  FaRotateRight as Resend,
} from 'react-icons/fa6';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';

const API = import.meta.env.VITE_API_BASE_URL + '/auth';

// ─── Reusable Field ───────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled, error, maxLength }) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-3.5 text-[#C6A64A]/50 text-base" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full bg-[#072047]/50 border rounded-lg px-4 py-3 transition-all
          focus:outline-none focus:ring-2 focus:ring-[#C6A64A]/20 focus:border-[#C6A64A]/50
          text-[#e8e8e8] placeholder-[#a0a0a0]/40 disabled:opacity-50 disabled:cursor-not-allowed
          ${Icon ? 'pl-11' : ''}
          ${error ? 'border-red-500/50' : 'border-[#C6A64A]/20'}`}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-400 text-xs mt-1.5"
      >
        {error}
      </motion.p>
    )}
  </div>
);

// ─── OTP Box Input ────────────────────────────────────────────────────────────
const OTPInput = ({ otp, setOtp, disabled }) => {
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) setOtp(pasted.split(''));
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otp.map((digit, i) => (
        <motion.input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className={`w-11 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-[#C6A64A]/20 disabled:opacity-50
            text-[#C6A64A] bg-[#072047]/60
            ${digit ? 'border-[#C6A64A]' : 'border-[#C6A64A]/20 focus:border-[#C6A64A]/60'}`}
        />
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const EmailOTPScreen = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { updateProgress } = useOnboardingProgress();

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(null); // null = unverified, true = new, false = existing
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Start 60s countdown
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // ── Validate mobile ──
  const validateMobile = () => {
    const errs = {};
    if (!/^\d{10}$/.test(mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
    setError(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Validate email ──
  const validateEmail = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    setError(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Smart Send OTP (With Dynamic Checking) ──
  const handleSend = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError({});

    if (!validateMobile()) return;

    setLoading(true);
    try {
      if (isNewUser === null) {
        // Step A: Check mobile existence in registry
        const checkRes = await axios.post(`${API}/check-mobile`, { mobile });
        const { exists, email: backendMaskedEmail } = checkRes.data;

        if (exists) {
          // Returning member: Auto send OTP directly to their stored email!
          setIsNewUser(false);
          setMaskedEmail(backendMaskedEmail);
          
          await axios.post(`${API}/send-email-otp`, { mobile });
          setSuccessMsg(`OTP sent to your registered email: ${backendMaskedEmail}`);
          setStep('otp');
          startCountdown();
        } else {
          // Brand new user: Show email field dynamically
          setIsNewUser(true);
        }
      } else if (isNewUser === true) {
        // Step B: Send OTP for brand new user (both email + mobile validated)
        if (!validateEmail()) {
          setLoading(false);
          return;
        }

        await axios.post(`${API}/send-email-otp`, { mobile, email });
        setSuccessMsg(`OTP sent to ${email}`);
        setStep('otp');
        startCountdown();
      }
    } catch (err) {
      setError({ api: err.response?.data?.message || 'Failed to request OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError({ otp: 'Enter all 6 digits' });
      return;
    }

    setLoading(true);
    setError({});
    try {
      const res = await axios.post(`${API}/verify-email-otp`, { 
        mobile, 
        email: isNewUser ? email : undefined, 
        otp: code 
      });
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      loginUser(user);
      
      // Update onboarding progress directly in context
      updateProgress({
        otpVerified: true,
        basicDetailsCompleted: user.registrationStep >= 1,
        photosUploaded: user.registrationStep >= 2,
      });

      setSuccessMsg('✅ Verified! Redirecting...');
      setTimeout(() => navigate('/app/dashboard'), 1200);
    } catch (err) {
      setError({ otp: err.response?.data?.message || 'Invalid OTP. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (countdown > 0) return;
    setError({});
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      await axios.post(`${API}/send-email-otp`, { 
        mobile, 
        email: isNewUser ? email : undefined 
      });
      setSuccessMsg('New OTP sent!');
      startCountdown();
    } catch (err) {
      setError({ otp: err.response?.data?.message || 'Failed to resend OTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C6A64A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C6A64A]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-[#d4a557] to-[#C6A64A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(198,166,74,0.3)]"
          >
            <Shield className="text-[#020817] text-2xl" />
          </motion.div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4a557] to-[#C6A64A] font-['Playfair_Display']">
            Roots &amp; Rings
          </h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Premium Matrimony Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#072047]/50 backdrop-blur-xl border border-[#C6A64A]/10 rounded-2xl p-8 shadow-[0_20px_60px_rgba(198,166,74,0.1)]">

          {/* Success message */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 text-sm text-center font-medium leading-relaxed"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* API-level error */}
          <AnimatePresence>
            {error.api && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-sm text-center"
              >
                {error.api}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Mobile + Email ── */}
            {step === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSend}
              >
                <h2 className="text-xl font-bold text-[#e8e8e8] mb-1">Welcome</h2>
                <p className="text-[#a0a0a0] text-sm mb-6">Enter your mobile number to get started</p>

                <Field
                  label="Mobile Number"
                  icon={Phone}
                  type="tel"
                  value={mobile}
                  onChange={(e) => { 
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); 
                    setError({}); 
                    setIsNewUser(null); 
                  }}
                  placeholder="10-digit mobile number"
                  disabled={loading}
                  error={error.mobile}
                  maxLength={10}
                />

                {/* Returning User Notification Banner */}
                {isNewUser === false && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-lg mb-6 text-center"
                  >
                    <p className="text-xs text-gold-400 font-medium leading-relaxed">
                      ✨ Welcome back! Secure OTP will be sent to: <br/>
                      <span className="underline font-mono tracking-wider font-semibold text-gold-300">{maskedEmail}</span>
                    </p>
                  </motion.div>
                )}

                {/* Brand New Registration Field Toggle */}
                <AnimatePresence>
                  {isNewUser === true && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-gold-500/5 border border-gold-500/10 rounded-lg mb-4">
                        <p className="text-xs text-gold-400/90 font-medium">
                          👋 Welcome to Roots & Rings! Enter your email below to register your premium registry profile.
                        </p>
                      </div>
                      <Field
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError({}); }}
                        placeholder="your@email.com"
                        disabled={loading}
                        error={error.email}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-3 bg-[#C6A64A]/8 border border-[#C6A64A]/15 rounded-lg mb-6">
                  <p className="text-xs text-[#a0a0a0] leading-relaxed">
                    📧 Secure 6-digit verification code will be sent to the email address.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading || !/^\d{10}$/.test(mobile) || (isNewUser === true && !email)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold
                    bg-[#C6A64A] text-[#020817] hover:bg-[#d4a557] transition-all
                    shadow-[0_4px_20px_rgba(198,166,74,0.25)] hover:shadow-[0_4px_30px_rgba(198,166,74,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#020817]/30 border-t-[#020817] rounded-full animate-spin" />
                  ) : (
                    <>{isNewUser === null ? 'Continue' : 'Send OTP'} <ArrowRight className="text-sm" /></>
                  )}
                </motion.button>

                <p className="text-center text-xs text-[#a0a0a0] mt-4">
                  For existing approved profiles or new premium registrations.
                </p>
              </motion.form>
            )}

            {/* ── STEP 2: OTP Entry ── */}
            {step === 'otp' && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerify}
              >
                <h2 className="text-xl font-bold text-[#e8e8e8] mb-1">Enter OTP</h2>
                <p className="text-[#a0a0a0] text-sm mb-2 leading-relaxed">
                  Sent to <span className="text-[#C6A64A] font-semibold">{isNewUser ? email : maskedEmail}</span>
                </p>
                <p className="text-[#a0a0a0] text-xs mb-6">
                  Mobile: <span className="text-[#e8e8e8] font-mono font-semibold">{mobile}</span>
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-4 text-center">
                    6-Digit Code
                  </label>
                  <OTPInput otp={otp} setOtp={setOtp} disabled={loading} />
                  
                  <p className="text-center text-xs text-[#C6A64A]/80 italic mt-4 leading-relaxed px-2">
                    "If you do not see the secure OTP in your primary Inbox, please make sure to check your Spam or Junk folder."
                  </p>
                  
                  {error.otp && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-3 text-center"
                    >
                      {error.otp}
                    </motion.p>
                  )}
                </div>

                {/* Countdown */}
                {countdown > 0 && (
                  <div className="mb-5 text-center">
                    <p className="text-xs text-[#a0a0a0]">
                      Resend OTP in <span className="text-[#C6A64A] font-bold">{countdown}s</span>
                    </p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold
                    bg-[#C6A64A] text-[#020817] hover:bg-[#d4a557] transition-all
                    shadow-[0_4px_20px_rgba(198,166,74,0.25)] hover:shadow-[0_4px_30px_rgba(198,166,74,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#020817]/30 border-t-[#020817] rounded-full animate-spin" />
                  ) : (
                    <>Verify &amp; Continue <ArrowRight className="text-sm" /></>
                  )}
                </motion.button>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => { 
                      setStep('form'); 
                      setOtp(['','','','','','']); 
                      setError({}); 
                      setSuccessMsg(''); 
                      setIsNewUser(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#a0a0a0]
                      hover:text-[#C6A64A] hover:bg-[#C6A64A]/8 border border-[#C6A64A]/15
                      transition-all"
                  >
                    ← Change Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#a0a0a0]
                      hover:text-[#C6A64A] hover:bg-[#C6A64A]/8 border border-[#C6A64A]/15
                      transition-all disabled:opacity-40 disabled:cursor-not-allowed
                      flex items-center justify-center gap-1.5"
                  >
                    <Resend className="text-xs" /> Resend
                  </motion.button>
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-[#666] mt-6">
          🔒 Your data is secure and encrypted.
        </p>
      </motion.div>
    </div>
  );
};
