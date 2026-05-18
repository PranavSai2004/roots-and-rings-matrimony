import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagnifyingGlass as Search, FaSliders as Sliders, FaArrowRight as Arrow } from 'react-icons/fa6';
import { AdminCard } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

export const SearchProfilesScreen = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    location: '',
    caste: '',
    gender: '',
    religion: '',
    education: '',
    profession: '',
    language: ''
  });

  const getPhotoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${cleanPath}`;
  };

  const searchProfiles = async () => {
    setSearched(true);
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.ageMin) queryParams.append('ageMin', filters.ageMin);
      if (filters.ageMax) queryParams.append('ageMax', filters.ageMax);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.caste) queryParams.append('caste', filters.caste);
      if (filters.gender) queryParams.append('gender', filters.gender);
      if (filters.religion) queryParams.append('religion', filters.religion);
      if (filters.education) queryParams.append('education', filters.education);
      if (filters.profession) queryParams.append('profession', filters.profession);
      if (filters.language) queryParams.append('language', filters.language);

      const response = await adminApi.get(`/search?${queryParams.toString()}`);
      setProfiles(response.data.profiles || []);
    } catch (err) {
      setError('Failed to fetch profiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const getPipelineBadge = (step, status) => {
    if (status === 'approved' && step === 4) {
      return { text: '✓ Verified Active Member', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    }
    switch (step) {
      case 0:
        return { text: 'Registered (No Profile)', className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
      case 1:
        return { text: '📝 Form 1 Done (Photos Pending)', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      case 2:
        return { text: '📸 Photos Done (Awaiting Review)', className: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
      case 3:
        return { text: '💳 Paid (Awaiting Form 2)', className: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' };
      case 4:
        return { text: '💍 Form 2 Submitted (Awaiting Approval)', className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      default:
        return { text: `Step ${step}`, className: 'bg-gold-500/10 text-gold-400 border border-gold-500/20' };
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Matchmaker Toolkit</p>
        <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Search Profiles</h1>
        <p className="text-luxe-gray-400 text-sm">Advanced admin CRM search and precision matching pipeline</p>
      </motion.div>

      {/* Filter Board */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminCard>
          <div className="space-y-5">
            {/* Primary filters grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Min Age</label>
                <input
                  type="number"
                  placeholder="e.g. 21"
                  className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                  value={filters.ageMin}
                  onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Max Age</label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                  value={filters.ageMax}
                  onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">City / Location</label>
                <input
                  type="text"
                  placeholder="Search city..."
                  className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Gender</label>
                <select
                  className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                >
                  <option value="">Any Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Expandable Drawer */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-gold-500/10 pt-5 mt-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Caste</label>
                      <input
                        type="text"
                        placeholder="e.g. Kshatriya"
                        className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                        value={filters.caste}
                        onChange={(e) => setFilters({...filters, caste: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Religion</label>
                      <input
                        type="text"
                        placeholder="e.g. Hindu"
                        className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                        value={filters.religion}
                        onChange={(e) => setFilters({...filters, religion: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Education</label>
                      <input
                        type="text"
                        placeholder="e.g. MBA"
                        className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                        value={filters.education}
                        onChange={(e) => setFilters({...filters, education: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Profession</label>
                      <input
                        type="text"
                        placeholder="e.g. Doctor"
                        className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                        value={filters.profession}
                        onChange={(e) => setFilters({...filters, profession: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-gold-400/80 font-bold">Mother Tongue</label>
                      <input
                        type="text"
                        placeholder="e.g. Telugu"
                        className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray-100 text-sm focus:outline-none focus:border-gold-500/50"
                        value={filters.language}
                        onChange={(e) => setFilters({...filters, language: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-gold-500/5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all ${showAdvanced ? 'bg-gold-500/20 text-gold-400 border-gold-500/30' : 'border-gold-500/15 text-luxe-gray-400 hover:border-gold-500/30'}`}
              >
                <Sliders size={14} /> {showAdvanced ? 'Hide Advanced Filters' : 'Advanced Filters'}
              </button>
              <button
                type="button"
                onClick={searchProfiles}
                className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-navy-950 text-sm font-bold transition-all shadow-lg shadow-gold-500/10"
              >
                <Search size={14} /> Search
              </button>
            </div>
          </div>
        </AdminCard>
      </motion.div>

      {/* Profiles Search Result List */}
      {searched && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AdminCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-luxe-gray">Search Results</h2>
                <p className="text-xs text-luxe-gray-400 mt-1">Showing {profiles.length} matches found</p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-400 text-sm text-center py-8">{error}</div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {profiles.map(profile => (
                  <div
                    key={profile._id}
                    className="p-5 rounded-xl border border-gold-500/10 bg-navy-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      {profile.photoUrl ? (
                        <img src={getPhotoUrl(profile.photoUrl)} alt={profile.fullName} className="w-14 h-14 rounded-xl object-cover border border-gold-500/20" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0 text-navy-950 font-bold text-xl">
                          {profile.fullName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="text-base font-bold text-luxe-gray-100">{profile.fullName}</p>
                          {(() => {
                            const badge = getPipelineBadge(profile.registrationStep, profile.accountStatus);
                            return (
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${badge.className}`}>
                                {badge.text}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[13.5px] text-luxe-gray-400 leading-relaxed">
                          {profile.age} Yrs · {profile.gender} · {profile.location} · <span className="text-gold-400/90 font-medium">{profile.religion}</span> ({profile.caste}) · <span className="text-luxe-gray-300 font-medium">{profile.occupation}</span> · <span className="text-emerald-400/90">{profile.motherTongue}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/profile/${profile._id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gold-500/10 text-gold-400 hover:text-gold-300 hover:border-gold-500/30 text-sm font-bold transition-all self-stretch sm:self-auto justify-center"
                    >
                      View Details <Arrow size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-luxe-gray-500 text-center py-16">
                <p className="text-lg font-medium text-luxe-gray-400">No profiles found</p>
                <p className="text-xs text-luxe-gray-600 mt-1">Try adjusting your filters or expanding your search scope.</p>
              </div>
            )}
          </AdminCard>
        </motion.div>
      )}
    </div>
  );
};

export default SearchProfilesScreen;
