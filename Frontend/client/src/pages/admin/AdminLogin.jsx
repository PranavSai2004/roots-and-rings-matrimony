import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock as Lock, FaUser as User, FaEye as Eye, FaEyeSlash as EyeSlash } from 'react-icons/fa6';
import axios from 'axios';


export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        import.meta.env.VITE_API_BASE_URL + '/auth/admin/login',
        { email, password }
      );

      // Store admin token and info
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <Lock className="text-3xl text-navy-950" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">
            Roots & Rings
          </h1>
          <p className="text-luxe-gray-400">Admin Portal</p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
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

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-luxe-gray-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gold-500 text-lg" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rootsandrings.com"
                className="w-full pl-10 pr-4 py-3 bg-navy-950/50 border border-gold-500/20 rounded-lg text-luxe-gray-100 placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-luxe-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gold-500 text-lg" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-navy-950/50 border border-gold-500/20 rounded-lg text-luxe-gray-100 placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gold-500 hover:text-gold-400"
              >
                {showPassword ? <EyeSlash className="text-lg" /> : <Eye className="text-lg" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-gold-500/30 text-gold-500 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-luxe-gray-400 cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <Lock className="text-lg" />
                Login as Admin
              </>
            )}
          </motion.button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gold-500/5 border border-gold-500/20 rounded-lg text-center">
            <p className="text-xs text-luxe-gray-400 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gold-400 font-mono">admin@roots.com / Admin@123</p>
          </div>
        </motion.form>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-luxe-gray-500 mt-8"
        >
          🔒 This portal is for authorized administrators only.
        </motion.p>
      </motion.div>
    </div>
  );
};
