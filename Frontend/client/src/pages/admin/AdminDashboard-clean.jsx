import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShieldHeart as ShieldHeart, FaClock as Clock, FaUsers as Users, FaCheckCircle as CheckCircle, FaXCircle as XCircle, FaSignOutAlt as SignOut } from 'react-icons/fa6';
import axios from 'axios';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        import.meta.env.VITE_API_BASE_URL + '/admin/dashboard',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl border-2 shadow-luxury ${
        color === 'gold'
          ? 'border-gold-500/30 bg-gold-500/10'
          : color === 'green'
          ? 'border-green-500/30 bg-green-500/10'
          : color === 'red'
          ? 'border-red-500/30 bg-red-500/10'
          : 'border-blue-500/30 bg-blue-500/10'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          color === 'gold'
            ? 'bg-gold-500/20'
            : color === 'green'
            ? 'bg-green-500/20'
            : color === 'red'
            ? 'bg-red-500/20'
            : 'bg-blue-500/20'
        }`}>
          <Icon className={`text-2xl ${
            color === 'gold'
              ? 'text-gold-400'
              : color === 'green'
              ? 'text-green-400'
              : color === 'red'
              ? 'text-red-400'
              : 'text-blue-400'
          }`} />
        </div>
      </div>
      <p className="text-luxe-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-3xl font-bold ${
        color === 'gold'
          ? 'text-gold-400'
          : color === 'green'
          ? 'text-green-400'
          : color === 'red'
          ? 'text-red-400'
          : 'text-blue-400'
      }`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-luxe-gray-500 mt-2">{subtitle}</p>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Logout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-luxe-gray-400">Matrimony Platform Management</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-2 transition-all"
          >
            <SignOut className="text-lg" /> Logout
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="text-gold-400 text-5xl animate-spin mx-auto mb-4" />
            <p className="text-luxe-gray-400">Loading dashboard...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers || 0}
                subtitle="Active profiles"
                color="gold"
              />
              <StatCard
                icon={Clock}
                title="Pending Form-1"
                value={stats.pendingForm1 || 0}
                subtitle="Waiting for approval"
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                title="Approved Forms"
                value={stats.approvedForms || 0}
                subtitle="Verified profiles"
                color="green"
              />
              <StatCard
                icon={XCircle}
                title="Rejected Forms"
                value={stats.rejectedForms || 0}
                subtitle="Changes requested"
                color="red"
              />
            </motion.div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Form-2 Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl border border-gold-500/20 bg-navy-900/50 shadow-luxury"
              >
                <h3 className="text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                  📋 Form-2 Reviews
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-luxe-gray-400">Pending:</span>
                    <span className="text-xl font-bold text-yellow-400">{stats.pendingForm2 || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-luxe-gray-400">Approved:</span>
                    <span className="text-xl font-bold text-green-400">{stats.approvedForm2 || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-luxe-gray-400">Rejected:</span>
                    <span className="text-xl font-bold text-red-400">{stats.rejectedForm2 || 0}</span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl border border-gold-500/20 bg-navy-900/50 shadow-luxury"
              >
                <h3 className="text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                  💳 Payment Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-luxe-gray-400">Pending:</span>
                    <span className="text-xl font-bold text-blue-400">{stats.pendingPayments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-luxe-gray-400">Verified:</span>
                    <span className="text-xl font-bold text-green-400">{stats.verifiedPayments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-luxe-gray-400">Total Revenue:</span>
                    <span className="text-xl font-bold text-gold-400">₹{stats.totalRevenue || 0}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/reviews/form1')}
                className="p-4 rounded-lg border border-gold-500/30 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle /> Review Form-1 ({stats.pendingForm1})
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/reviews/form2')}
                className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Clock /> Review Form-2 ({stats.pendingForm2})
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/payments')}
                className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-semibold transition-all flex items-center justify-center gap-2"
              >
                💳 Verify Payments ({stats.pendingPayments})
              </motion.button>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12 text-red-400">
            ❌ Failed to load dashboard
          </div>
        )}
      </div>
    </div>
  );
};
