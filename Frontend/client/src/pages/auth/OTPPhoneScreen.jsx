import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhone as Phone, FaArrowRight as ArrowRight } from 'react-icons/fa6';
import { AuthLayout } from '../../layouts/AuthLayout';
import { FormInput } from '../../components/forms/FormComponents';

export const OTPPhoneScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Store phone number for next step
      sessionStorage.setItem('tempPhone', phoneNumber);
      navigate('/otp-verify', { state: { phoneNumber } });
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
          <h2 className="text-2xl font-bold text-luxe-gray-100 mb-2">Welcome Back</h2>
          <p className="text-luxe-gray-400 text-sm">
            Enter your phone number to continue
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Mobile Number"
            type="tel"
            placeholder="Enter 10 digit number"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
              setError('');
            }}
            error={error}
            icon={Phone}
            required
            disabled={isLoading}
          />

          {/* OTP Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg"
          >
            <p className="text-xs text-luxe-gray-400">
              📱 We'll send you an OTP (One-Time Password) on this number. It's completely secure.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !phoneNumber}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                Sending OTP...
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight className="text-sm" />
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-luxe-gray-500">
            Don't have an account? We'll create one when you verify your phone.
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};
