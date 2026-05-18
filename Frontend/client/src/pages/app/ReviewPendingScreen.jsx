import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheck as CheckCircle,
  FaClock as Clock,
  FaArrowRight as ArrowRight,
  FaHouse as Home,
} from 'react-icons/fa6';
import api from '../../services/api';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { useAuth } from '../../hooks/useAuth';

export const ReviewPendingScreen = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { updateProgress } = useOnboardingProgress();
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes estimate
  const [reviewStatus, setReviewStatus] = useState('pending'); // pending, approved, rejected
  const [feedback, setFeedback] = useState(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // Poll for review status every 10 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get('/profile/form1/review-status');

        setReviewStatus(response.data.status); // pending, approved, rejected
        if (response.data.feedback) {
          setFeedback(response.data.feedback);
        }

        if (response.data.status === 'approved') {
          setIsPolling(false);
          await refreshUser();
          updateProgress({ profileApproved: true });
          clearInterval(pollInterval);
          navigate('/app/payment-status');
        } else if (response.data.status === 'rejected') {
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // 10 seconds

    // Also start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeline = () => {
    const base = [
      {
        step: 1,
        title: '✓ Profile Completed',
        description: 'Your details are saved',
        completed: true,
        time: 'Just now',
      },
      {
        step: 2,
        title: '✓ Photos Uploaded',
        description: 'All 4 photos received',
        completed: true,
        time: 'Just now',
      },
    ];

    if (reviewStatus === 'pending') {
      base.push({
        step: 3,
        title: '⏳ Under Review',
        description: 'Verification in progress',
        completed: false,
        time: 'In Progress',
      });
    } else if (reviewStatus === 'approved') {
      base.push({
        step: 3,
        title: '✓ Approved',
        description: 'Profile verified successfully',
        completed: true,
        time: 'Just now',
      });
    } else if (reviewStatus === 'rejected') {
      base.push({
        step: 3,
        title: '❌ Changes Requested',
        description: 'Please review the feedback',
        completed: false,
        time: 'Review needed',
      });
    }

    base.push({
      step: 4,
      title: reviewStatus === 'approved' ? '🔓 Payment & Form-2 Unlocked' : 'Payment & Form-2',
      description: 'Unlock advanced features',
      completed: reviewStatus === 'approved',
      time: reviewStatus === 'approved' ? 'Ready' : 'Pending',
    });

    base.push({
      step: 5,
      title: 'Start Matching',
      description: 'See compatible profiles',
      completed: reviewStatus === 'approved',
      time: 'Coming soon',
    });

    return base;
  };

  const timeline = getTimeline();

  return (
    <div className="min-h-screen bg-navy-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 flex items-center justify-center">
              <CheckCircle className="text-4xl text-navy-950" />
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-luxe-gray-100 mb-2">
              Profile Under Review
            </h1>
            <p className="text-luxe-gray-400 text-lg">
              Great! Your profile has been submitted successfully.
            </p>
          </motion.div>

          {/* Estimated Time Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-6 bg-gradient-to-r from-gold-500/10 to-gold-500/5 border border-gold-500/20 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <Clock className="text-2xl text-gold-400" />
              <div>
                <p className="text-sm text-gold-400 mb-1">Estimated Review Time</p>
                <p className="text-2xl font-bold text-gold-400">
                  24-48 hours
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, staggerChildren: 0.1 }}
            className="mb-8"
          >
            <h3 className="text-lg font-bold text-luxe-gray-100 mb-6">
              What Happens Next
            </h3>

            <div className="space-y-4 relative">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="relative flex gap-6"
                >
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-12 ${
                        item.completed
                          ? 'bg-gradient-to-b from-gold-500 to-gold-500/30'
                          : 'bg-navy-800'
                      }`}
                    ></div>
                  )}

                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        item.completed
                          ? 'bg-gold-500 text-navy-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                          : item.time === 'In Progress'
                          ? 'bg-gold-500 text-navy-950 shadow-[0_0_20px_rgba(198,166,74,0.3)] animate-pulse'
                          : 'bg-navy-800 text-luxe-gray-500 border border-gold-500/20'
                      }`}
                    >
                      {item.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-2">
                    <h4 className="font-bold text-luxe-gray-100 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-luxe-gray-400 mb-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-luxe-gray-600">{item.time}</p>
                    {item.step === 3 && reviewStatus === 'rejected' && feedback && (
                      <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg">
                        <p className="text-xs text-red-400 uppercase font-semibold mb-1">Admin Feedback</p>
                        <p className="text-sm text-red-200">{feedback}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Information Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-navy-900/50 border border-gold-500/20 rounded-lg"
            >
              <p className="text-sm text-gold-400 font-bold mb-2">📋 Verification In Progress</p>
              <p className="text-xs text-luxe-gray-400">
                Your details and photos are being checked for authenticity and safety.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-navy-900/50 border border-gold-500/20 rounded-lg"
            >
              <p className="text-sm text-gold-400 font-bold mb-2">🔔 Notifications</p>
              <p className="text-xs text-luxe-gray-400">
                We'll notify you via SMS and email when your profile is approved.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-navy-900/50 border border-gold-500/20 rounded-lg"
            >
              <p className="text-sm text-gold-400 font-bold mb-2">✓ Verification</p>
              <p className="text-xs text-luxe-gray-400">
                Once verified, you'll get access to search and message profiles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-navy-900/50 border border-gold-500/20 rounded-lg"
            >
              <p className="text-sm text-gold-400 font-bold mb-2">💰 Payment</p>
              <p className="text-xs text-luxe-gray-400">
                You will receive payment instructions through WhatsApp after approval.
              </p>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/app/dashboard')}
              className="w-full sm:w-2/3 px-8 py-3 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-950 font-bold rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Home className="text-lg" />
              Go to Dashboard
            </motion.button>
          </motion.div>

          {/* Support Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 bg-navy-900/50 border border-luxe-gray-700/30 rounded-lg text-center"
          >
            <p className="text-xs text-luxe-gray-400">
              Need help? <button onClick={() => navigate('/app/support')} className="text-gold-400 hover:text-gold-300 font-medium">Contact support</button>
            </p>
          </motion.div>
        </div>
      </div>
  );
};
