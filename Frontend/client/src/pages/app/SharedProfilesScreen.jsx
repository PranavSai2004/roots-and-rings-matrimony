import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  FaHeart as Heart,
  FaX as X,
  FaMessage as Message,
  FaFilter as Filter,
  FaCheck as Check,
  FaClock as Clock,
  FaWater as Watermark,
} from 'react-icons/fa6';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';


export const SharedProfilesScreen = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [passes, setPasses] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [batchExpiry, setBatchExpiry] = useState(null);
  const [filters, setFilters] = useState({
    ageMin: 20,
    ageMax: 35,
    location: 'all',
  });

  // Fetch batch profiles and own interests on mount
  useEffect(() => {
    if (user?._id) {
      fetchBatchProfiles();
      fetchMyInterests();
    }
  }, [user]);

  const fetchMyInterests = async () => {
    try {
      const response = await api.get(`/user/my-interests/${user._id}?limit=200`);
      console.log('🔍 [DEBUG] my-interests raw response data:', response.data.data);
      const likedTargetIds = (response.data.data || []).map(i => {
        return i.targetProfileId && i.targetProfileId._id ? i.targetProfileId._id : i.targetProfileId;
      }).filter(Boolean);
      console.log('🔍 [DEBUG] parsed likedTargetIds:', likedTargetIds);
      setFavorites(new Set(likedTargetIds));
    } catch (err) {
      console.error('Error preloading liked states:', err);
    }
  };

  // Handle batch expiry countdown
  useEffect(() => {
    if (!batchExpiry) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeLeft = new Date(batchExpiry) - now;

      if (timeLeft <= 0) {
        setError('Batch profiles have expired');
        clearInterval(interval);
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [batchExpiry]);

  const fetchBatchProfiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/user/shared-profiles/user/${user._id}`);

      // Map the returned data structure to match frontend expectations
      const mappedProfiles = response.data.data.map(p => {
        const imageUrl = p.profileData?.primaryImage 
          ? `${import.meta.env.VITE_API_BASE_URL}${p.profileData.primaryImage}?token=${token}`
          : 'https://via.placeholder.com/400x600?text=Photo';

        return {
          id: p._id,
          profileUserId: p.profileUserId,
          name: p.profileData?.name || 'Unknown',
          age: p.profileData?.age || '?',
          occupation: p.profileData?.occupation || 'N/A',
          location: p.profileData?.city || 'Unknown',
          caste: p.profileData?.caste || '—',
          image: imageUrl
        };
      });

      console.log('🔍 [DEBUG] mappedProfiles:', mappedProfiles);
      setProfiles(mappedProfiles);
      // Get the closest expiry date
      const closestExpiry = response.data.data.reduce((acc, p) => {
        const pExp = new Date(p.watermark.expiresAt);
        return (!acc || pExp < acc) ? pExp : acc;
      }, null);
      
      setBatchExpiry(closestExpiry);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching batch profiles:', err);
      setError(err.response?.data?.message || 'Failed to load batch profiles');
      setLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!batchExpiry) return '';
    const now = new Date();
    const timeLeft = new Date(batchExpiry) - now;
    if (timeLeft <= 0) return 'Expired';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(
      (profile) =>
        profile.age >= filters.ageMin &&
        profile.age <= filters.ageMax &&
        (filters.location === 'all' || (profile.location && profile.location.includes(filters.location)))
    );
  }, [profiles, filters]);

  const handleLike = async (profileId, profileUserId) => {
    try {
      await api.post(`/user/interested/${profileId}`, { userId: user._id });

      const newFavorites = new Set(favorites);
      const targetKey = profileUserId || profileId;
      if (newFavorites.has(targetKey)) {
        newFavorites.delete(targetKey);
      } else {
        newFavorites.add(targetKey);
      }
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Error sending interest:', err);
      alert(err.response?.data?.message || 'Failed to send interest');
    }
  };

  const handlePass = (profileId) => {
    setPasses((prev) => new Set([...prev, profileId]));
  };

  const displayProfiles = filteredProfiles.filter((p) => !passes.has(p.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 py-12 flex items-center justify-center">
        <div className="text-center">
          <Clock className="text-gold-400 text-5xl animate-spin mx-auto mb-4" />
          <p className="text-luxe-gray-400 text-lg">Loading batch profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-950 py-12 flex items-center justify-center">
        <div className="text-center p-8 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-lg font-semibold mb-2">❌ {error}</p>
          <p className="text-luxe-gray-400">The batch has expired or is no longer available.</p>
        </div>
      </div>
    );
  }

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
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                  Discover Profiles
                </span>
              </h1>
              <p className="text-luxe-gray-400">
                {displayProfiles.length} profiles match your criteria
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 rounded-lg text-gold-400 transition-all"
            >
              <Filter className="text-lg" />
              Filters
            </motion.button>
          </motion.div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-6 bg-navy-900/50 border border-gold-500/20 rounded-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-luxe-gray-300 mb-3">
                      Age Range
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="18"
                        max="50"
                        value={filters.ageMin}
                        onChange={(e) =>
                          setFilters({ ...filters, ageMin: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="18"
                        max="50"
                        value={filters.ageMax}
                        onChange={(e) =>
                          setFilters({ ...filters, ageMax: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <div className="text-xs text-gold-400 text-center">
                        {filters.ageMin} - {filters.ageMax} years
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-luxe-gray-300 mb-3">
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      className="w-full bg-navy-900/50 border border-gold-500/20 rounded-lg px-3 py-2 text-luxe-gray-100 cursor-pointer"
                    >
                      <option value="all">All Locations</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFilters({ ageMin: 20, ageMax: 35, location: 'all' });
                        setShowFilters(false);
                      }}
                      className="w-full btn-primary"
                    >
                      Apply Filters
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profiles Grid */}
          {displayProfiles.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {displayProfiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative"
                  >
                    <div className="relative h-80 rounded-xl overflow-hidden border border-gold-500/20 shadow-luxury hover:shadow-lg transition-all cursor-pointer">
                      {/* Image */}
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80"></div>

                      {/* Watermark */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gold-500/20 border border-gold-500/50 rounded-full flex items-center gap-1">
                        <Check className="text-xs text-gold-400" />
                        <span className="text-xs text-gold-400 font-medium">Verified</span>
                      </div>

                      {/* Watermark - "Roots & Rings" overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                        <div className="text-center">
                          <p className="text-6xl font-bold text-gold-400 transform -rotate-45">
                            Roots & Rings
                          </p>
                        </div>
                      </div>

                      {/* Expiry Timer - Batch Expires Soon Warning */}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-navy-950/70 border border-yellow-500/50 rounded-full flex items-center gap-2">
                        <Clock className="text-xs text-yellow-400 animate-pulse" />
                        <p className="text-xs text-yellow-300 font-medium">
                          {getTimeRemaining()}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {profile.name}, {profile.age}
                        </h3>
                        <p className="text-sm text-luxe-gray-300 mb-3">
                          {profile.occupation} • {profile.location} • <span className="text-gold-400 font-semibold">{profile.caste}</span>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePass(profile.id)}
                            className="flex-1 py-2.5 rounded-lg bg-navy-900/50 hover:bg-red-500/10 border border-gold-500/15 hover:border-red-500/30 text-luxe-gray-300 hover:text-red-400 transition-all flex items-center justify-center gap-2"
                          >
                            <X className="text-sm" />
                            Pass
                          </motion.button>

                           <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLike(profile.id, profile.profileUserId)}
                            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
                              favorites.has(profile.profileUserId || profile.id)
                                ? 'bg-gold-500 text-navy-950 border border-gold-500 shadow-lg shadow-gold-500/20'
                                : 'bg-navy-900/50 hover:bg-gold-500/20 border border-luxe-gray-500/30 hover:border-gold-500/50 text-gold-400 hover:text-gold-300'
                            }`}
                          >
                            <Heart
                              className={`text-sm ${
                                favorites.has(profile.profileUserId || profile.id) ? 'fill-current' : ''
                              }`}
                            />
                            {favorites.has(profile.profileUserId || profile.id) ? 'Liked' : 'Like'}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-3xl mb-4">😔</p>
              <p className="text-xl font-bold text-luxe-gray-300 mb-2">
                No profiles available
              </p>
              <p className="text-luxe-gray-400">
                Try adjusting your filters to see more matches
              </p>
            </motion.div>
          )}
        </div>
      </div>
  );
};
