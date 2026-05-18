import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMagnifyingGlass as Search, FaFilter as Filter, FaHeart as Heart, FaX as X, FaClock as Clock } from 'react-icons/fa6';
import axios from 'axios';


export const SearchPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [filters, setFilters] = useState({
    ageMin: 20,
    ageMax: 35,
    heightMin: 140,
    heightMax: 180,
    location: '',
    caste: '',
    religion: '',
    education: '',
    income: '',
    lifestyle: '',
    familyValues: '',
    language: '',
    search: '',
  });

  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];
  const castes = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'No caste'];
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain'];
  const educations = ['10th', '12th', 'Bachelor', 'Master', 'PhD'];
  const incomes = ['Below 5L', '5L-10L', '10L-20L', '20L-50L', 'Above 50L'];
  const lifestyles = ['Conservative', 'Moderate', 'Liberal'];
  const familyValues = ['Traditional', 'Progressive', 'Mixed'];
  const languages = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

  const searchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Build query params from filters
      const queryParams = new URLSearchParams();
      if (filters.ageMin) queryParams.append('ageMin', filters.ageMin);
      if (filters.ageMax) queryParams.append('ageMax', filters.ageMax);
      if (filters.heightMin) queryParams.append('heightMin', filters.heightMin);
      if (filters.heightMax) queryParams.append('heightMax', filters.heightMax);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.caste) queryParams.append('caste', filters.caste);
      if (filters.religion) queryParams.append('religion', filters.religion);
      if (filters.education) queryParams.append('education', filters.education);
      if (filters.income) queryParams.append('income', filters.income);
      if (filters.lifestyle) queryParams.append('lifestyle', filters.lifestyle);
      if (filters.familyValues) queryParams.append('familyValues', filters.familyValues);
      if (filters.language) queryParams.append('language', filters.language);

      const response = await axios.get(
        `\${import.meta.env.VITE_API_BASE_URL}/search?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfiles(response.data.profiles || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchProfiles();
  }, []);

  const handleLike = async (profileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        import.meta.env.VITE_API_BASE_URL + '/interests/send',
        { recipientId: profileId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Interest sent! They will see your profile.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send interest');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2 flex items-center gap-3">
            <Search className="text-gold-500" /> Search Profiles
          </h1>
          <p className="text-luxe-gray-400">Find your perfect match using advanced filters</p>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-navy-900/50 border border-gold-500/20 rounded-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Age</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="18"
                  max="60"
                  value={filters.ageMin}
                  onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                  placeholder="Min"
                  className="flex-1 bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                />
                <span className="text-luxe-gray-400 flex items-center">-</span>
                <input
                  type="number"
                  min="18"
                  max="60"
                  value={filters.ageMax}
                  onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                  placeholder="Max"
                  className="flex-1 bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                />
              </div>
            </div>

            {/* Height Range */}
            <div>
              <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Height (cm)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.heightMin}
                  onChange={(e) => setFilters({ ...filters, heightMin: e.target.value })}
                  placeholder="Min"
                  className="flex-1 bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                />
                <span className="text-luxe-gray-400 flex items-center">-</span>
                <input
                  type="number"
                  value={filters.heightMax}
                  onChange={(e) => setFilters({ ...filters, heightMax: e.target.value })}
                  placeholder="Max"
                  className="flex-1 bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
              >
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* Religion */}
            <div>
              <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Religion</label>
              <select
                value={filters.religion}
                onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
                className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
              >
                <option value="">All Religions</option>
                {religions.map(rel => <option key={rel} value={rel}>{rel}</option>)}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gold-400 text-sm hover:text-gold-300 flex items-center gap-2 mb-4"
          >
            <Filter className="text-xs" /> {showAdvanced ? 'Hide Advanced' : 'Show Advanced'} Filters
          </button>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gold-500/10">
              {/* Caste */}
              <div>
                <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Caste</label>
                <select
                  value={filters.caste}
                  onChange={(e) => setFilters({ ...filters, caste: e.target.value })}
                  className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                >
                  <option value="">All Castes</option>
                  {castes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Education</label>
                <select
                  value={filters.education}
                  onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                  className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                >
                  <option value="">All Education</option>
                  {educations.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                </select>
              </div>

              {/* Income */}
              <div>
                <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Annual Income</label>
                <select
                  value={filters.income}
                  onChange={(e) => setFilters({ ...filters, income: e.target.value })}
                  className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                >
                  <option value="">All Income</option>
                  {incomes.map(inc => <option key={inc} value={inc}>{inc}</option>)}
                </select>
              </div>

              {/* Lifestyle */}
              <div>
                <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Lifestyle</label>
                <select
                  value={filters.lifestyle}
                  onChange={(e) => setFilters({ ...filters, lifestyle: e.target.value })}
                  className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                >
                  <option value="">All Lifestyles</option>
                  {lifestyles.map(ls => <option key={ls} value={ls}>{ls}</option>)}
                </select>
              </div>

              {/* Family Values */}
              <div>
                <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Family Values</label>
                <select
                  value={filters.familyValues}
                  onChange={(e) => setFilters({ ...filters, familyValues: e.target.value })}
                  className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                >
                  <option value="">All Values</option>
                  {familyValues.map(fv => <option key={fv} value={fv}>{fv}</option>)}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-luxe-gray-300 mb-2">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  className="w-full bg-navy-950 border border-gold-500/20 rounded px-2 py-2 text-luxe-gray-100 text-sm"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={searchProfiles}
            disabled={loading}
            className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Clock className="animate-spin text-xs" /> Searching...
              </>
            ) : (
              <>
                <Search className="text-xs" /> Search {profiles.length} Results
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-8">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {profiles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {profiles.map((profile) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative h-96 rounded-xl overflow-hidden border border-gold-500/20 shadow-luxury hover:shadow-xl transition-all"
              >
                {/* Image */}
                <img
                  src={profile.photoUrl || 'https://via.placeholder.com/400x500?text=' + profile.firstName}
                  alt={profile.firstName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {profile.firstName}, {profile.age}
                  </h3>
                  <p className="text-sm text-luxe-gray-300 mb-1">{profile.occupation}</p>
                  <p className="text-xs text-gold-400 mb-4">{profile.location}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 rounded-lg bg-navy-900/50 hover:bg-gold-500/10 border border-gold-500/15 text-luxe-gray-300 hover:text-gold-400 transition-all flex items-center justify-center gap-2">
                      <X className="text-sm" /> Pass
                    </button>
                    <button
                      onClick={() => handleLike(profile._id)}
                      className="flex-1 py-2 rounded-lg bg-gold-500/20 hover:bg-gold-500 border border-gold-500 text-gold-300 hover:text-navy-950 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Heart className="text-sm" /> Interest
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : !loading ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-4">🔍</p>
            <p className="text-xl font-bold text-luxe-gray-300">No profiles found</p>
            <p className="text-luxe-gray-400">Try adjusting your filters</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
