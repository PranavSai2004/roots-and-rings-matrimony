import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart as Heart,
  FaCheck as Check,
  FaClock as Clock,
  FaBan as Ban,
  FaCalendar as Calendar,
  FaLocationDot as Location,
  FaUserTie as Occupation,
} from 'react-icons/fa6';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

export const Interests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sent');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchInterests();
    }
  }, [user]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `\${import.meta.env.VITE_API_BASE_URL}/user/my-interests/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Map the returned data structure to match frontend expectations
      const mappedInterests = response.data.data.map(i => {
        return {
          id: i._id,
          name: i.targetProfileId?.name || 'Unknown',
          age: i.targetProfileId?.age || '?',
          occupation: i.targetProfileId?.profession || 'N/A',
          location: i.targetProfileId?.city || 'Unknown',
          image: i.targetProfileId?.primaryImage || 'https://via.placeholder.com/150?text=Photo',
          status: i.interestStatus,
          date: new Date(i.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          })
        };
      });

      setInterests(mappedInterests);
    } catch (err) {
      console.error('Error fetching interests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'contacted':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          label: 'Admin Contacting',
        };
      case 'meeting_scheduled':
        return {
          icon: Check,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'Meeting Scheduled',
        };
      case 'closed':
        return {
          icon: Ban,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: 'Closed',
        };
      default: // pending
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          label: 'Pending Admin Review',
        };
    }
  };

  // Currently we only have 'sent' interests recorded. Future expansion can include 'received'.
  const displayInterests = interests;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
              Interest History
            </span>
          </h1>
          <p className="text-luxe-gray-400">Track the profiles you've shown interest in.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gold-500/20 mb-8">
          {['sent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-sm font-medium transition-all relative ${
                activeTab === tab
                  ? 'text-gold-400'
                  : 'text-luxe-gray-500 hover:text-luxe-gray-300'
              }`}
            >
              <span className="capitalize">{tab} Interests</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {displayInterests.length > 0 ? (
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {displayInterests.map((interest) => {
                  const statusConfig = getStatusConfig(interest.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={interest.id}
                      variants={itemVariants}
                      className="p-4 bg-navy-900/50 border border-gold-500/20 rounded-xl hover:border-gold-500/40 transition-all flex flex-col sm:flex-row gap-6"
                    >
                      {/* Profile Image */}
                      <div className="w-full sm:w-32 h-40 sm:h-32 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={interest.image}
                          alt={interest.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {interest.name}, {interest.age}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-luxe-gray-400">
                              <span className="flex items-center gap-1.5">
                                <Occupation className="text-gold-500/70" />
                                {interest.occupation}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Location className="text-gold-500/70" />
                                {interest.location}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gold-500/10 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-luxe-gray-500">
                            <Calendar size={14} />
                            Requested on {interest.date}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-navy-900/30 border border-gold-500/10 rounded-xl"
              >
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                  <Heart className="text-2xl text-luxe-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-luxe-gray-300 mb-2">No interests yet</h3>
                <p className="text-luxe-gray-500">
                  When you show interest in a profile, it will appear here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
