import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCircleCheck as Check } from 'react-icons/fa6';
import { AdminCard, ConfirmationModal } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

export const BatchCreationScreen = () => {
  const [step, setStep] = useState(1);
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Profile filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState(''); // '', 'male', 'female'
  const [religionFilter, setReligionFilter] = useState('');
  const [casteFilter, setCasteFilter] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  // Step 2: Recipient filters state
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [recipientCityFilter, setRecipientCityFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, recipientsRes] = await Promise.all([
        adminApi.get('/admin/profiles/approved'),
        adminApi.get('/admin/profiles/recipients')
      ]);
      setAvailableProfiles(profilesRes.data.data || []);
      setAvailableRecipients(recipientsRes.data.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Memoized dynamic lists of religions and recipient cities for selectors
  const uniqueReligions = React.useMemo(() => {
    const religions = availableProfiles.map(p => p.religion).filter(Boolean);
    return [...new Set(religions)];
  }, [availableProfiles]);

  const uniqueRecipientCities = React.useMemo(() => {
    const cities = availableRecipients.map(r => r.city).filter(c => c && c !== '—');
    return [...new Set(cities)];
  }, [availableRecipients]);

  // Real-time memoized filtering of approved profiles
  const filteredProfiles = React.useMemo(() => {
    return availableProfiles.filter(profile => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = profile.fullName?.toLowerCase().includes(query);
        const matchesCity = profile.city?.toLowerCase().includes(query);
        const matchesOccupation = profile.occupation?.toLowerCase().includes(query);
        if (!matchesName && !matchesCity && !matchesOccupation) return false;
      }
      // 2. Gender Filter
      if (genderFilter) {
        if (profile.gender?.toLowerCase() !== genderFilter.toLowerCase()) return false;
      }
      // 3. Religion Filter
      if (religionFilter) {
        if (profile.religion?.toLowerCase() !== religionFilter.toLowerCase()) return false;
      }
      // 4. Caste Filter
      if (casteFilter.trim()) {
        if (!profile.caste?.toLowerCase().includes(casteFilter.toLowerCase())) return false;
      }
      // 5. Min Age
      if (minAge) {
        if (profile.age && profile.age < parseInt(minAge)) return false;
      }
      // 6. Max Age
      if (maxAge) {
        if (profile.age && profile.age > parseInt(maxAge)) return false;
      }
      return true;
    });
  }, [availableProfiles, searchQuery, genderFilter, religionFilter, casteFilter, minAge, maxAge]);

  // Real-time memoized filtering of recipients
  const filteredRecipients = React.useMemo(() => {
    return availableRecipients.filter(recipient => {
      // 1. Search Query
      if (recipientSearchQuery.trim()) {
        const query = recipientSearchQuery.toLowerCase();
        const matchesName = recipient.fullName?.toLowerCase().includes(query);
        const matchesMobile = recipient.mobile?.includes(query);
        if (!matchesName && !matchesMobile) return false;
      }
      // 2. City Filter
      if (recipientCityFilter) {
        if (recipient.city?.toLowerCase() !== recipientCityFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [availableRecipients, recipientSearchQuery, recipientCityFilter]);

  const toggleProfile = (id) => {
    setSelectedProfiles(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleRecipient = (id) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleConfirmBatch = async () => {
    setCreating(true);
    setSuccessMsg('');
    try {
      // Create a batch for EACH selected recipient
      for (const recipientId of selectedRecipients) {
        await adminApi.post('/admin/batches/share', {
          recipientUserId: recipientId,
          selectedProfileIds: selectedProfiles
        });
      }
      setSuccessMsg(`Successfully shared ${selectedProfiles.length} profiles to ${selectedRecipients.length} recipients.`);
      setShowConfirmation(false);
      setStep(1);
      setSelectedProfiles([]);
      setSelectedRecipients([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating batches');
      setShowConfirmation(false);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Create Batch</h1>
        <p className="text-luxe-gray-400">Distribute approved profiles to eligible premium members</p>
      </motion.div>

      {successMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✅ {successMsg}
        </motion.div>
      )}

      {/* Progress Steps */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`p-4 rounded-lg border transition-all ${step >= s ? 'bg-gold-500/20 border-gold-500/30' : 'bg-navy-950/50 border-gold-500/10'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-luxe-gray">Step {s}</span>
              {step > s && <Check className="text-green-400" size={18} />}
            </div>
            <p className="text-xs text-luxe-gray-400 mt-1">
              {s === 1 ? 'Select Profiles' : s === 2 ? 'Choose Recipients' : 'Review & Create'}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Step 1: Select Profiles */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-luxe-gray">Select Profiles to Share</h2>
              <span className="text-sm text-gold-400">{selectedProfiles.length} / 15 selected</span>
            </div>

            {/* Premium Filters Panel */}
            <div className="mb-6 p-5 rounded-xl bg-navy-950/40 border border-gold-500/10 space-y-4 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search field */}
                <div>
                  <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-widest mb-1.5">Search Match</label>
                  <input
                    type="text"
                    placeholder="Search name, city, job..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-gold-500/20 text-luxe-gray placeholder-luxe-gray-500 text-sm focus:border-gold-500/50 outline-none transition-all"
                  />
                </div>

                {/* Gender pills */}
                <div>
                  <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-widest mb-1.5">Gender</label>
                  <div className="flex gap-2">
                    {['', 'male', 'female'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => setGenderFilter(gender)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                          genderFilter === gender
                            ? 'bg-gold-500/20 border-gold-500 text-gold-400 font-bold'
                            : 'bg-navy-900 border-gold-500/20 text-luxe-gray-400 hover:border-gold-500/40'
                        }`}
                      >
                        {gender === '' ? 'All' : gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Religion dropdown */}
                <div>
                  <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-widest mb-1.5">Religion</label>
                  <select
                    value={religionFilter}
                    onChange={(e) => setReligionFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-gold-500/20 text-luxe-gray text-sm focus:border-gold-500/50 outline-none transition-all"
                  >
                    <option value="">All Religions</option>
                    {uniqueReligions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Caste field */}
                <div>
                  <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-widest mb-1.5">Caste</label>
                  <input
                    type="text"
                    placeholder="Filter by caste..."
                    value={casteFilter}
                    onChange={(e) => setCasteFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-gold-500/20 text-luxe-gray placeholder-luxe-gray-500 text-sm focus:border-gold-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Advanced Row (Age Range & Reset) */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gold-500/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-gold-400 tracking-widest uppercase">Age Range:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-16 px-2 py-1 rounded bg-navy-900 border border-gold-500/20 text-luxe-gray text-center text-xs focus:border-gold-500/50 outline-none"
                  />
                  <span className="text-luxe-gray-500 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-16 px-2 py-1 rounded bg-navy-900 border border-gold-500/20 text-luxe-gray text-center text-xs focus:border-gold-500/50 outline-none"
                  />
                </div>

                {/* Filter counts */}
                <span className="text-xs text-luxe-gray-400 italic">
                  Showing {filteredProfiles.length} of {availableProfiles.length} candidates
                </span>

                {(searchQuery || genderFilter || religionFilter || casteFilter || minAge || maxAge) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setGenderFilter('');
                      setReligionFilter('');
                      setCasteFilter('');
                      setMinAge('');
                      setMaxAge('');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-4 ml-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProfiles.length === 0 ? (
                <div className="col-span-full text-center py-12 text-luxe-gray-500 text-sm">
                  {availableProfiles.length === 0 ? "No approved profiles available to share." : "No profiles match your active filters."}
                </div>
              ) : (
                filteredProfiles.map((profile) => (
                  <motion.button
                    key={profile._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => toggleProfile(profile._id)}
                    className={`p-5 rounded-xl border transition-all text-left flex items-start gap-5 ${
                      selectedProfiles.includes(profile._id)
                        ? 'bg-gold-500/20 border-gold-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                        : 'bg-navy-950/50 border-gold-500/10 hover:border-gold-500/25'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-navy-900 border border-gold-500/15">
                      {profile.primaryImage ? (
                        <img src={profile.primaryImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gold-500/10 text-gold-400 font-bold uppercase text-lg">{profile.fullName?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-luxe-gray text-base truncate">{profile.fullName}</h3>
                        {profile.gender && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${
                            profile.gender.toLowerCase() === 'male' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                          }`}>
                            {profile.gender}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-luxe-gray-300 mt-1 leading-relaxed">
                        {profile.age || '?'} yrs · {profile.city || 'Unknown'}<br/>
                        <span className="text-luxe-gray-400 text-xs">{profile.occupation || 'N/A'}</span>
                      </p>
                      {profile.religion && (
                        <span className="inline-block mt-2 text-[10px] font-semibold tracking-widest text-gold-400 uppercase">
                          {profile.religion} {profile.caste ? `· ${profile.caste}` : ''}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setStep(2)}
              disabled={selectedProfiles.length === 0 || selectedProfiles.length > 15}
              className="mt-6 w-full px-4 py-3 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30 font-semibold transition-all disabled:opacity-50"
            >
              Continue ({selectedProfiles.length} selected)
            </motion.button>
          </AdminCard>
        </motion.div>
      )}

      {/* Step 2: Choose Recipients */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminCard>
            <h2 className="text-xl font-semibold text-luxe-gray mb-6">Choose Recipients</h2>

            {/* Recipient Quick Filters */}
            <div className="mb-6 p-4 rounded-xl bg-navy-950/40 border border-gold-500/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient Search */}
              <div>
                <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-widest mb-1.5">Search Recipient</label>
                <input
                  type="text"
                  placeholder="Search by name, mobile..."
                  value={recipientSearchQuery}
                  onChange={(e) => setRecipientSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-gold-500/20 text-luxe-gray placeholder-luxe-gray-500 text-sm focus:border-gold-500/50 outline-none transition-all"
                />
              </div>

              {/* City filter dropdown */}
              <div>
                <label className="block text-[10px] font-semibold text-gold-400 uppercase tracking-widest mb-1.5">Filter by Location</label>
                <select
                  value={recipientCityFilter}
                  onChange={(e) => setRecipientCityFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-gold-500/20 text-luxe-gray text-sm focus:border-gold-500/50 outline-none transition-all"
                >
                  <option value="">All Locations</option>
                  {uniqueRecipientCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {filteredRecipients.length === 0 ? (
                <div className="text-center py-12 text-luxe-gray-500 text-sm">
                  {availableRecipients.length === 0 ? "No eligible recipients (requires verified payment)." : "No recipients match your active search filters."}
                </div>
              ) : (
                filteredRecipients.map((recipient) => (
                  <label
                    key={recipient._id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedRecipients.includes(recipient._id) ? 'bg-gold-500/10 border-gold-500/30' : 'border-gold-500/10 hover:bg-gold-500/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(recipient._id)}
                      onChange={() => toggleRecipient(recipient._id)}
                      className="w-4 h-4 accent-gold-500 rounded"
                    />
                    <div className="ml-4 flex-1 flex justify-between items-center">
                      <div>
                        <p className="text-luxe-gray font-medium">{recipient.fullName}</p>
                        <p className="text-xs text-luxe-gray-400 font-mono mt-0.5">{recipient.mobile}</p>
                      </div>
                      <span className="text-xs font-semibold text-gold-400 bg-gold-500/5 border border-gold-500/10 px-2.5 py-1 rounded-full uppercase">
                        {recipient.city || '—'}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 px-4 py-3 rounded-lg border border-gold-500/30 text-gold-400 font-semibold transition-all hover:bg-gold-500/10">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedRecipients.length === 0}
                className="flex-1 px-4 py-3 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30 font-semibold transition-all disabled:opacity-50"
              >
                Review ({selectedRecipients.length} recipients)
              </button>
            </div>
          </AdminCard>
        </motion.div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <AdminCard>
            <h2 className="text-xl font-semibold text-luxe-gray mb-6">Review Batch Distribution</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-navy-950/50 border border-gold-500/10 text-center">
                <p className="text-xs text-gold-400 uppercase font-semibold">Profiles in Batch</p>
                <p className="text-3xl font-semibold text-luxe-gray mt-2">{selectedProfiles.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-navy-950/50 border border-gold-500/10 text-center">
                <p className="text-xs text-gold-400 uppercase font-semibold">Recipients</p>
                <p className="text-3xl font-semibold text-luxe-gray mt-2">{selectedRecipients.length}</p>
              </div>
            </div>
            <p className="text-sm text-luxe-gray-400 text-center mb-6">
              A total of <strong className="text-gold-400">{selectedProfiles.length * selectedRecipients.length}</strong> shared profile cards will be generated.<br/>
              They will automatically expire in 24 hours.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 px-4 py-3 rounded-lg border border-gold-500/30 text-gold-400 font-semibold transition-all hover:bg-gold-500/10">Back</button>
              <button
                onClick={() => setShowConfirmation(true)}
                className="flex-1 px-4 py-3 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30 font-semibold transition-all"
              >
                Send Batch Now
              </button>
            </div>
          </AdminCard>
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        title="Distribute Batch?"
        message={`This will share ${selectedProfiles.length} profile(s) with ${selectedRecipients.length} user(s). The batch will expire in 24 hours.`}
        onConfirm={handleConfirmBatch}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
};

export default BatchCreationScreen;
