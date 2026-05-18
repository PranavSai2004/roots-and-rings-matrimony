import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as ArrowRight } from 'react-icons/fa6';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

export const OTPEntryScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const phoneNumber = sessionStorage.getItem('tempPhone') || '';

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock verification - in real app, verify with backend
      if (otpCode === '111111' || otpCode === '000000') {
        setIsLoading(false);
        // Login user
        loginUser(phoneNumber);
        sessionStorage.removeItem('tempPhone');
        // Show success and redirect
        navigate('/app/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid OTP. Try again.');
      }
    }, 1500);
  };

  return (
    <AuthLayout>
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-luxe-gray-100 mb-2">Enter OTP</h2>
          <p className="text-luxe-gray-400 text-sm">
            We've sent a code to {phoneNumber}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* OTP Input Fields */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-luxe-gray-300 mb-4">
              6-Digit Code
            </label>
            <div
              className="flex gap-3 justify-center mb-4"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all focus:outline-none ${
                    error
                        ? 'border-gold-500/50 bg-gold-500/10 focus:border-gold-500'
                      : digit
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-gold-500/20 bg-navy-900/50 focus:border-gold-500'
                  } text-gold-400`}
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gold-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-navy-800/50 border border-gold-500/20 rounded-lg mb-8"
          >
            <p className="text-xs text-luxe-gray-400">
              💡 Demo: Use 111111 or 000000 for testing
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="text-sm" />
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate('/otp-verify')}
            className="w-full btn-ghost mt-3"
          >
            Back
          </motion.button>
        </form>
      </div>
    </AuthLayout>
  );
};
