import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope as Mail, FaLock as Lock, FaArrowRight as Arrow } from 'react-icons/fa6';
import { useAdmin } from '../../hooks/useAdmin';

export const AdminLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAdmin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAdmin(email, password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-luxury-gradient">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl border border-gold-500/20 bg-navy-900/70 p-8 shadow-luxury backdrop-blur-xl md:p-10">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-luxury">
              <span className="text-navy-950 font-playfair font-bold text-3xl">R&R</span>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Admin Portal</h1>
            <p className="text-sm text-luxe-gray-400">Operational Dashboard Access</p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email Field */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-400 font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500/50 text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@matrimonial.com"
                  disabled={isLoading}
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl pl-12 pr-4 py-3 text-luxe-gray placeholder-luxe-gray-600 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold-400 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500/50 text-lg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl pl-12 pr-4 py-3 text-luxe-gray placeholder-luxe-gray-600 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gold-500/20 bg-navy-950/50 accent-gold-500 cursor-pointer"
              />
              <span className="text-sm text-luxe-gray-400">Remember this device</span>
            </label>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-navy-950 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-luxury"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <Arrow size={16} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gold-500/10 text-center">
            <p className="text-xs text-luxe-gray-400">
              Secure operational access · Multi-factor authentication enabled
            </p>
          </div>
            </div>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {/* <div className="rounded-2xl border border-gold-500/20 bg-navy-900/50 p-4 text-xs text-luxe-gray-400 backdrop-blur-xl">
              <p className="mb-2 font-semibold text-gold-400">Demo Credentials:</p>
              <p>Email: admin@matrimonial.com</p>
              <p>Password: admin123</p>
            </div> */}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
