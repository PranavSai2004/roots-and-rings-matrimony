import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FaCheck as Check,
  FaLock as Lock,
  FaClock as Clock,
  FaArrowRight as ArrowRight,
  FaEye as Eye,
  FaCamera as Camera,
  FaHeart as Heart,
  FaUser as User,
} from 'react-icons/fa6';
import { useAuth } from '../../hooks/useAuth';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { getCanonicalNextUrl } from '../../lib/onboardingFlow';
import api from '../../services/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { progress, updateProgress } = useOnboardingProgress();
  const [profileData, setProfileData] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(null);

  useEffect(() => {
    refreshUser();
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/profile/form1');
      setProfileData(response.data);

      // Also fetch review status
      const statusResponse = await api.get('/profile/form1/review-status');
      setReviewStatus(statusResponse.data);
      
      // Update onboarding progress if approved
      if (statusResponse.data.status === 'approved' && !progress.profileApproved) {
        updateProgress({ profileApproved: true });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const progressSteps = [
    {
      id: 'otp',
      label: 'OTP Verified',
      completed: true,
      icon: Check,
    },
    {
      id: 'form1',
      label: 'Form-1 Completed',
      completed: progress.basicDetailsCompleted,
      icon: progress.basicDetailsCompleted ? Check : User,
    },
    {
      id: 'photos',
      label: 'Photos Uploaded',
      completed: progress.photosUploaded,
      icon: progress.photosUploaded ? Check : Camera,
    },
    {
      id: 'review',
      label: 'Profile Under Review',
      completed: progress.profileApproved,
      pending: progress.photosUploaded && !progress.profileApproved,
      icon: progress.profileApproved ? Check : Clock,
    },
    {
      id: 'form2',
      label: 'Marriage Details',
      completed: progress.marriageDetailsCompleted,
      locked: !progress.paymentConfirmed,
      icon: progress.marriageDetailsCompleted ? Check : (!progress.paymentConfirmed ? Lock : Heart),
    },
  ];

  const PIPELINE_MILESTONES = [
    'otpVerified',
    'basicDetailsCompleted',
    'photosUploaded',
    'profileApproved',
    'paymentConfirmed',
    'marriageDetailsCompleted'
  ];

  const completedStepsCount = PIPELINE_MILESTONES.filter(key => progress[key]).length;
  const profileCompletion = Math.round((completedStepsCount / PIPELINE_MILESTONES.length) * 100);

  const quickActions = [
    {
      id: 'profile',
      label: 'Basic Details',
      icon: User,
      color: 'from-gold-400 to-gold-500',
      action: () => navigate('/app/basic-details'),
      disabled: progress.basicDetailsCompleted,
      badge: progress.basicDetailsCompleted ? '✓ Done' : null,
    },
    {
      id: 'photos',
      label: 'Upload Photos',
      icon: Camera,
      color: 'from-gold-400 to-gold-500',
      action: () => navigate('/app/upload-photos'),
      disabled: !progress.basicDetailsCompleted || progress.photosUploaded,
      badge: progress.photosUploaded 
        ? '✓ Done' 
        : (!progress.basicDetailsCompleted ? '🔒 Locked (Prerequisite)' : null),
    },
    {
      id: 'interested',
      label: 'Marriage Details',
      icon: Heart,
      color: 'from-gold-500 to-gold-600',
      action: () => navigate(progress.paymentConfirmed ? '/app/marriage-details' : '/app/payment-status'),
      disabled: !progress.paymentConfirmed || progress.marriageDetailsCompleted,
      badge: progress.marriageDetailsCompleted 
        ? '✓ Done' 
        : (!progress.paymentConfirmed ? '🔒 Locked (Pay to Unlock)' : null),
    },
    {
      id: 'shared',
      label: 'View Profiles',
      icon: Eye,
      color: 'from-navy-900 to-navy-800',
      action: () => navigate('/app/shared-profiles'),
      disabled: !progress.profileApproved,
      badge: !progress.profileApproved ? '🔒 Locked (Pending Review)' : null,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Your Profile Dashboard
              </span>
            </h1>
            <p className="text-luxe-gray-400">
              Welcome back! Complete your profile to get matches from our premium members.
            </p>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mb-8 p-6 bg-gradient-to-r ${reviewStatus?.status === 'rejected' ? 'from-red-900/50 to-red-800/50 border-red-500/20' : reviewStatus?.status === 'approved' ? 'from-green-900/50 to-green-800/50 border-green-500/20' : 'from-navy-900/50 to-navy-800/50 border-gold-500/20'} border rounded-xl shadow-luxury backdrop-blur-sm`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className={`text-sm mb-2 ${reviewStatus?.status === 'rejected' ? 'text-red-400' : reviewStatus?.status === 'approved' ? 'text-green-400' : 'text-luxe-gray-400'}`}>Profile Status</p>
                <h2 className="text-2xl font-bold text-luxe-gray-100 mb-3">
                  {reviewStatus?.status === 'rejected' ? 'Changes Requested' : reviewStatus?.status === 'approved' ? 'Profile Approved' : 'Verification In Progress'}
                </h2>
                <p className={`text-sm ${reviewStatus?.status === 'rejected' ? 'text-red-300' : reviewStatus?.status === 'approved' ? 'text-green-300' : 'text-luxe-gray-400'}`}>
                  {reviewStatus?.status === 'rejected' ? 'Please review the feedback below and update your profile.' : reviewStatus?.status === 'approved' ? 'Your profile has been verified and approved. You are ready to explore!' : 'Your profile is currently under verification. We typically confirm the next step within 24-48 hours.'}
                </p>
                {reviewStatus?.status === 'rejected' && reviewStatus?.feedback && (
                  <div className="mt-4 p-4 bg-red-950/50 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400 uppercase font-semibold mb-1">Admin Feedback</p>
                    <p className="text-sm text-red-200 mb-3">{reviewStatus.feedback}</p>

                    {/* Resubmission Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-3.5">
                      {progress.basicDetailsCompleted && !reviewStatus.rejectedForms?.includes('form1') && (
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-[11px] rounded border border-green-500/20 font-medium">
                          ✓ Form 1 updates submitted (Awaiting Review)
                        </span>
                      )}
                      {progress.photosUploaded && !reviewStatus.rejectedForms?.includes('photos') && (
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-[11px] rounded border border-green-500/20 font-medium">
                          ✓ Photo updates submitted (Awaiting Review)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {reviewStatus.rejectedForms?.includes('form1') && (
                        <button onClick={() => navigate('/app/basic-details')} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded hover:bg-red-500/30 transition-all border border-red-500/30">
                          Update Form 1
                        </button>
                      )}
                      {reviewStatus.rejectedForms?.includes('photos') && (
                        <button onClick={() => navigate('/app/upload-photos')} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded hover:bg-red-500/30 transition-all border border-red-500/30">
                          Update Photos
                        </button>
                      )}
                      {reviewStatus.rejectedForms?.includes('form2') && (
                        <button onClick={() => navigate('/app/marriage-details')} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded hover:bg-red-500/30 transition-all border border-red-500/30">
                          Update Marriage Details
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#1F2937"
                      strokeWidth="8"
                    />
                    <motion.circle
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 283 - (283 * profileCompletion) / 100 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gold-500">
                      {profileCompletion}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-luxe-gray-400">Complete</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Timeline */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-3"
          >
            {progressSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.completed;
              const isPending = step.pending;
              const isLocked = step.locked;

              return (
                <motion.div
                  key={step.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-gold-500/10 border-gold-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                        : isPending
                        ? 'bg-gold-500/10 border-gold-500/40 shadow-[0_0_20px_rgba(198,166,74,0.08)]'
                        : isLocked
                        ? 'bg-navy-800/50 border-luxe-gray-700/30 opacity-60'
                        : 'bg-navy-800/50 border-gold-500/20 hover:border-gold-500/50'
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          isCompleted
                            ? 'bg-gold-500 text-navy-950'
                            : isPending
                            ? 'bg-gold-500 text-navy-950'
                            : isLocked
                            ? 'bg-luxe-gray-700 text-luxe-gray-500'
                            : 'bg-gold-500/20 text-gold-400'
                        }`}
                      >
                        <Icon className="text-sm" />
                      </div>
                      <p className="text-xs font-medium text-luxe-gray-300">
                        {step.label}
                      </p>
                    </div>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className="hidden md:flex justify-center -mt-2 relative z-0">
                      <div
                        className={`w-1 h-4 ${
                          isCompleted ? 'bg-gold-500' : 'bg-luxe-gray-700'
                        }`}
                      ></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-luxe-gray-100">Quick Actions</h3>
              {/* Continue to Next Step button - using centralized flow or targeted unlocking */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (reviewStatus?.rejectedForms?.length > 0) {
                    if (reviewStatus.rejectedForms.includes('form1')) return navigate('/app/basic-details');
                    if (reviewStatus.rejectedForms.includes('photos')) return navigate('/app/upload-photos');
                    if (reviewStatus.rejectedForms.includes('form2')) return navigate('/app/marriage-details');
                  }
                  navigate(getCanonicalNextUrl(progress));
                }}
                className="px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-500 text-navy-950 font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                Continue <ArrowRight className="text-lg" />
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    variants={itemVariants}
                    whileHover={{ scale: action.disabled ? 1 : 1.05 }}
                    whileTap={{ scale: action.disabled ? 1 : 0.95 }}
                    onClick={action.action}
                    disabled={action.disabled}
                    className={`p-4 rounded-lg border transition-all group relative overflow-hidden ${
                      action.disabled
                        ? 'bg-navy-800/50 border-luxe-gray-700/30 opacity-50 cursor-not-allowed'
                        : `bg-gradient-to-br ${action.color} border-transparent hover:shadow-lg`
                    }`}
                  >
                    <div className="relative z-10">
                      <Icon
                        className={`text-2xl mb-2 ${
                          action.disabled
                            ? 'text-luxe-gray-600'
                            : 'text-white'
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          action.disabled
                            ? 'text-luxe-gray-400'
                            : 'text-white'
                        }`}
                      >
                        {action.label}
                      </p>
                      {action.badge ? (
                        <p className={`text-xs mt-1 font-semibold ${
                          action.badge.includes('🔒')
                            ? 'text-luxe-gray-500'
                            : 'text-gold-400'
                        }`}>
                          {action.badge}
                        </p>
                      ) : action.disabled ? (
                        <p className="text-xs text-gold-400 font-semibold mt-1">✓ Done</p>
                      ) : null}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Info Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* How It Works */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-navy-900/50 border border-gold-500/20 rounded-xl backdrop-blur-sm"
            >
              <h4 className="text-lg font-bold text-gold-400 mb-4">📋 How It Works</h4>
              <ol className="space-y-2 text-sm text-luxe-gray-400">
                <li>✓ Fill out your profile details</li>
                <li>✓ Upload clear photos</li>
                <li>✓ We verify and prepare your profile</li>
                <li>✓ Start seeing profiles</li>
              </ol>
            </motion.div>

            {/* Privacy Promise */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-navy-900/50 border border-gold-500/20 rounded-xl backdrop-blur-sm"
            >
              <h4 className="text-lg font-bold text-gold-400 mb-4">🔒 Privacy First</h4>
              <ul className="space-y-2 text-sm text-luxe-gray-400">
                <li>✓ Your data is encrypted</li>
                <li>✓ No spam or harassment</li>
                <li>✓ Anonymous browsing</li>
                <li>✓ You control visibility</li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-navy-900/50 border border-gold-500/20 rounded-xl backdrop-blur-sm"
            >
              <h4 className="text-lg font-bold text-gold-400 mb-4">💬 Need Help?</h4>
              <p className="text-sm text-luxe-gray-400 mb-4">
                Our support team is available 24/7
              </p>
              <button 
                onClick={() => navigate('/app/support')}
                className="w-full btn-primary text-sm"
              >
                Contact Support
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
  );
};
