import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUsers as Users,
  FaCheckDouble as Check,
  FaCreditCard as Card,
  FaHandshake as Heart,
  FaGift as Gift,
  FaHeart as Interest,
  FaClock as Clock,
  FaArrowRight as Arrow,
  FaEye as Eye,
} from 'react-icons/fa6';
import {
  MetricCard,
  AdminCard,
  AdminTable,
  ActivityFeed,
  StatusBadge,
} from '../../components/admin/shared/AdminComponents';

import { useEffect } from 'react';
import api from '../../services/adminApi';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [paymentQueue, setPaymentQueue] = useState([]);
  const [expiringShares, setExpiringShares] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, reviewsRes, paymentsRes, expiringRes, notifRes] = await Promise.all([
        api.get(`/admin/stats?period=${selectedPeriod}`),
        api.get('/admin/reviews/pending?limit=3'),
        api.get('/admin/payment/pending?limit=3'),
        api.get('/admin/stats/expiring'),
        api.get('/admin/notifications')
      ]);

      setStats(statsRes.data.stats);
      setReviewQueue(reviewsRes.data.data || []);
      setPaymentQueue(paymentsRes.data.data || []);
      setExpiringShares(expiringRes.data.data || []);
      setNotifications(notifRes.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const metrics = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, tone: 'default', change: 0 },
    { label: 'Approved Profiles', value: stats.approvedUsers, icon: Check, tone: 'positive', change: 0 },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Check, tone: 'warning', change: 0 },
    { label: 'Total Batches', value: stats.totalBatches, icon: Gift, tone: 'default', change: 0 },
    { label: 'Active Batches', value: stats.activeBatches, icon: Gift, tone: 'positive', change: 0 },
    { label: 'Total Interests', value: stats.totalInterests, icon: Interest, tone: 'positive', change: 0 },
  ] : [];

  const reviewQueueColumns = [
    { key: 'name', label: 'Member' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const reviewQueueRows = reviewQueue.map(user => ({
    id: user._id,
    name: user.mobile,
    status: () => <StatusBadge status={user.form1ReviewStatus === 'pending_review' ? 'pending' : 'pending'} size="sm" />,
    action: () => <button onClick={() => navigate(`/admin/reviews/${user._id}`)} className="text-gold-400 hover:text-gold-300 text-sm font-medium">Review</button>,
  }));

  const paymentQueueColumns = [
    { key: 'member', label: 'Member' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const paymentQueueRows = paymentQueue.map(user => ({
    id: user._id,
    member: user.fullName || user.mobile,
    status: user.paymentStatus,
    action: () => <button onClick={() => navigate('/admin/payments')} className="text-gold-400 hover:text-gold-300 text-sm font-medium">Verify</button>,
  }));

  const recentActivity = notifications.slice(0, 5).map(n => {
    const name = n.fullName || 'Member';
    const mobile = n.userId?.mobile || 'N/A';
    
    let action = '';
    let badge = 'info';
    
    if (n.formUpdated === 'form1') {
      action = `✏️ ${name} (${mobile}) updated Profile Form 1`;
      badge = 'pending';
    } else if (n.formUpdated === 'form2') {
      action = `💍 ${name} (${mobile}) updated Marriage Details`;
      badge = 'success';
    } else {
      action = n.message;
      badge = 'info';
    }
    
    return {
      action,
      time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(n.createdAt).toLocaleDateString(),
      badge
    };
  });

  const activityFeedList = recentActivity.length > 0 ? recentActivity : [
    {
      action: "System operational. Monitoring matchmaking pipelines...",
      time: new Date().toLocaleDateString(),
      badge: "success"
    }
  ];

  const expiringSharesList = expiringShares.map((share, idx) => ({
    id: share._id || idx,
    member: share.fromMember,
    shares: share.toMember,
    expiresIn: new Date(share.expiresAt).toLocaleDateString()
  }));

  return (
    <div className="w-full max-w-none space-y-8 p-4 sm:p-6 xl:p-8 2xl:p-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Operational Dashboard</h1>
          <p className="text-luxe-gray-400">Moderation & matching control center</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all ${
                selectedPeriod === period
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'border border-gold-500/10 text-luxe-gray-400 hover:border-gold-500/20'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-8">
        {/* Left Column - Operational Queues */}
        <div className="space-y-6 xl:col-span-2 2xl:col-span-3">
          {/* Profile Review Queue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Queue</p>
                  <h2 className="text-2xl font-playfair text-luxe-gray">Profile Reviews</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/admin/reviews')}
                  className="px-4 py-2 rounded-lg bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 text-sm font-semibold transition-all flex items-center gap-2"
                >
                  View All
                  <Arrow size={14} />
                </motion.button>
              </div>
              <AdminTable columns={reviewQueueColumns} rows={reviewQueueRows} />
            </AdminCard>
          </motion.div>

          {/* Payment Queue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AdminCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Verification</p>
                  <h2 className="text-2xl font-playfair text-luxe-gray">Payment Queue</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/admin/payments')}
                  className="px-4 py-2 rounded-lg bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 text-sm font-semibold transition-all flex items-center gap-2"
                >
                  View All
                  <Arrow size={14} />
                </motion.button>
              </div>
              <AdminTable columns={paymentQueueColumns} rows={paymentQueueRows} />
            </AdminCard>
          </motion.div>
        </div>

        {/* Right Column - Monitoring & Summary */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ActivityFeed activities={activityFeedList} />
          </motion.div>

          {/* Expiring Shares */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AdminCard>
              <h3 className="text-sm font-semibold text-luxe-gray mb-4">Expiring Soon</h3>
              <div className="space-y-3">
                {expiringSharesList.length === 0 ? (
                  <p className="text-xs text-luxe-gray-400 text-center py-6">No profile shares expiring soon.</p>
                ) : expiringSharesList.map((share) => (
                  <div key={share.id} className="flex items-center justify-between pb-3 border-b border-gold-500/10 last:border-0">
                    <div>
                      <p className="text-sm text-luxe-gray">{share.member}</p>
                      <p className="text-xs text-luxe-gray-400">{share.shares} shares</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                      <Clock size={14} />
                      {share.expiresIn}
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AdminCard>
              <h3 className="text-sm font-semibold text-luxe-gray mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/admin/reviews')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gold-500/10 hover:bg-gold-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm text-luxe-gray">Review Pending Profiles</span>
                  <Arrow size={14} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button
                  onClick={() => navigate('/admin/payments')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gold-500/10 hover:bg-gold-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm text-luxe-gray">Verify Payments</span>
                  <Arrow size={14} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button
                  onClick={() => navigate('/admin/batches/create')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gold-500/10 hover:bg-gold-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm text-luxe-gray">Create New Batch</span>
                  <Arrow size={14} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button
                  onClick={() => navigate('/admin/search-profiles')}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gold-500/10 hover:bg-gold-500/10 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm text-luxe-gray">Search & Filter</span>
                  <Arrow size={14} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </div>
            </AdminCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
