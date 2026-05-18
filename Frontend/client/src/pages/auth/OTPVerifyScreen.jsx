import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck as Check, FaMobileRetro as Mobile } from 'react-icons/fa6';
import { AuthLayout } from '../../layouts/AuthLayout';

export const OTPVerifyScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber] = useState(location.state?.phoneNumber || sessionStorage.getItem('tempPhone') || '');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleContinue = () => {
    navigate('/otp-entry');
  };

  const handleEditNumber = () => {
    sessionStorage.removeItem('tempPhone');
    navigate('/');
  };

  return (
    <AuthLayout>
      <div className="text-center">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 flex items-center justify-center">
            <Check className="text-navy-950 text-2xl" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-luxe-gray-100 mb-2">OTP Sent</h2>
          <p className="text-luxe-gray-400 text-sm mb-6">
            We've sent a 6-digit code to your phone
          </p>

          {/* Phone number display */}
          <div className="mb-8 p-4 bg-navy-800/50 border border-gold-500/20 rounded-lg">
            <div className="flex items-center justify-center gap-3 text-luxe-gray-300">
              <Mobile className="text-gold-500 text-lg" />
              <span className="font-medium">{phoneNumber}</span>
            </div>
          </div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mb-8 text-center ${timeLeft > 0 ? 'text-gold-500' : 'text-luxe-gray-500'}`}
          >
            <p className="text-sm mb-2">OTP expires in:</p>
            <p className="text-3xl font-bold">{String(timeLeft).padStart(2, '0')}s</p>
          </motion.div>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg text-left">
            <div className="space-y-2 text-xs text-luxe-gray-300">
              <div>✓ Check your SMS or notifications</div>
              <div>✓ Don't share this code with anyone</div>
              <div>✓ You have {timeLeft} seconds to enter the code</div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full btn-primary"
          >
            I Have the Code
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEditNumber}
            className="w-full btn-ghost"
          >
            Use Different Number
          </motion.button>
        </div>
      </div>
    </AuthLayout>
  );
};
