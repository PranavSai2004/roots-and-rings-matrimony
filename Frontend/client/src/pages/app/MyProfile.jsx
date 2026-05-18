import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser as User, 
  FaCamera as Camera, 
  FaHeart as Heart, 
  FaPen as Edit, 
  FaLocationDot as Location, 
  FaUserGraduate as Graduate, 
  FaBriefcase as Briefcase, 
  FaRing as Ring, 
  FaCompass as Compass,
  FaFileInvoiceDollar as Dollar,
  FaChevronRight as ArrowRight,
  FaXmark as X,
  FaCircleCheck as Verified
} from 'react-icons/fa6';
import api from '../../services/api';

const Card = ({ title, children, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-navy-900/60 border border-gold-500/10 rounded-2xl p-6 hover:border-gold-500/25 transition-all duration-300 shadow-luxury"
  >
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gold-500/5">
      <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gold-400">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {children}
    </div>
  </motion.div>
);

const Field = ({ label, value }) => (
  <div className="group">
    <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5 group-hover:text-gold-400/70 transition-colors">{label}</p>
    <p className="text-sm text-luxe-gray-200 font-medium tracking-wide">
      {value || <span className="text-luxe-gray-600 italic">Not specified</span>}
    </p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]',
    changes_requested: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]',
    pending_review: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.05)]',
  };
  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase ${map[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {status?.replace(/_/g, ' ') || 'Awaiting Review'}
    </span>
  );
};

export const MyProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMsg || '');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profile/me');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        navigate('/app/my-profile', { replace: true, state: {} });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-950">
      <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center text-red-400 font-semibold">
      Failed to load profile. Please refresh or log in again.
    </div>
  );

  const { user, form1Data: f1, form2Data: f2, photos } = data;
  const primaryPhoto = photos?.find(p => p.photoType === 'headshot') || photos?.[0];

  const handleEditRedirect = (path) => {
    setShowEditModal(false);
    navigate(path);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'personal', label: 'Personal & Family', icon: User },
    { id: 'astrology', label: 'Astrology & Career', icon: Ring },
    { id: 'portfolio', label: 'Photos Portfolio', icon: Camera }
  ];

  return (
    <div className="min-h-screen bg-navy-950 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial effects for premium luxury feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-navy-800/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">

        {/* Success Toast Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-emerald-400 text-sm font-semibold tracking-wide shadow-[0_4px_30px_rgba(16,185,129,0.1)] backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage('')}
                className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <X size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gold-500/10 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-playfair font-semibold text-luxe-gray-100 tracking-wide">My Profile</h1>
            <p className="text-luxe-gray-400 text-sm mt-1">This is how matching members view your verified card details</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowEditModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-navy-950 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-gold"
          >
            <Edit size={14} /> Edit Profile Sections
          </motion.button>
        </div>

        {/* Dynamic Card Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-gradient-to-br from-navy-900/90 to-navy-850/90 border border-gold-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative overflow-hidden backdrop-blur-md"
        >
          {/* Main Photo headshot */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-gold-500/30 flex-shrink-0 relative group shadow-luxury">
            {primaryPhoto?.photoUrl ? (
              <img src={primaryPhoto.photoUrl} alt="Primary profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-navy-800 flex items-center justify-center text-gold-400 text-5xl font-bold font-playfair">
                {f1?.fullName?.charAt(0) || '?'}
              </div>
            )}
          </div>

          {/* Core Info Info */}
          <div className="flex-1 text-center md:text-left space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-gold-400 to-gold-500 font-playfair tracking-wide flex items-center justify-center md:justify-start gap-2">
                {f1?.fullName || 'Unknown User'}
                {user?.accountStatus === 'approved' && <Verified className="text-gold-400 text-xl" />}
              </h2>
              <div className="mx-auto md:mx-0">
                <StatusBadge status={user?.accountStatus || user?.form1ReviewStatus} />
              </div>
            </div>

            <p className="text-md text-luxe-gray-300 font-medium tracking-wide flex items-center justify-center md:justify-start gap-1.5">
              <span>{f1?.gender}</span>
              <span className="text-gold-500/30">•</span>
              <span>{f1?.city}, {f1?.state}</span>
              <span className="text-gold-500/30">•</span>
              <span>{f1?.profession || f1?.occupation || 'Member'}</span>
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs text-luxe-gray-400 border-t border-gold-500/5 pt-3.5">
              <div>Mobile: <span className="text-luxe-gray-200 font-semibold tracking-wider">{user?.mobile}</span></div>
              {user?.email && <div>Email: <span className="text-luxe-gray-200 font-semibold">{user?.email}</span></div>}
            </div>
          </div>
        </motion.div>

        {/* Deluxe Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-navy-900/60 border border-gold-500/10 rounded-2xl w-full sm:w-max no-scrollbar">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-gold-500/25 text-gold-400 border border-gold-500/30' 
                    : 'text-luxe-gray-400 hover:text-gold-300 hover:bg-gold-500/5'
                }`}
              >
                <TabIcon size={12} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Tabs Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <>
                <Card title="Quick Overview" icon={Compass}>
                  <Field label="Full Name" value={f1?.fullName} />
                  <Field label="Mother Tongue" value={f1?.motherTongue} />
                  <Field label="Profile Age" value={f1?.dob ? new Date().getFullYear() - new Date(f1.dob).getFullYear() + " Years" : null} />
                  <Field label="Current Status" value={user?.accountStatus || 'Pending Review'} />
                  <Field label="Registration Step" value={`Step ${user?.registrationStep}`} />
                </Card>

                {/* About and expectations banner */}
                {f2 && (f2.aboutMe || f2.expectations || f2.lifestyle) && (
                  <div className="bg-navy-900/50 border border-gold-500/10 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-gold-500/5">
                      <Heart className="text-gold-400" size={16} />
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-gold-400">About Me & Partner Details</h3>
                    </div>
                    {f2.aboutMe && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest font-semibold">About Myself</p>
                        <p className="text-sm text-luxe-gray-200 leading-relaxed font-medium">{f2.aboutMe}</p>
                      </div>
                    )}
                    {f2.expectations && (
                      <div className="space-y-1 pt-3">
                        <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest font-semibold">Partner Expectations</p>
                        <p className="text-sm text-luxe-gray-200 leading-relaxed font-medium">{f2.expectations}</p>
                      </div>
                    )}
                    {f2.lifestyle && (
                      <div className="space-y-1 pt-3">
                        <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest font-semibold">My Lifestyle Notes</p>
                        <p className="text-sm text-luxe-gray-200 leading-relaxed font-medium">{f2.lifestyle}</p>
                      </div>
                    )}

                    {/* Ideal Partner Preferences Grid */}
                    {(f2.preferredAgeRange?.min || f2.preferredLocation || f2.preferredEducation || f2.preferredProfession || f2.preferredReligion || f2.preferredCaste) && (
                      <div className="pt-5 border-t border-gold-500/5 space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-gold-400 font-bold">Ideal Partner Preferences</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="p-3.5 rounded-xl bg-navy-950/40 border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                            <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5">Preferred Age</p>
                            <p className="text-sm text-luxe-gray-200 font-medium">
                              {f2.preferredAgeRange?.min || f2.preferredAgeRange?.max
                                ? `${f2.preferredAgeRange.min || 'Any'} - ${f2.preferredAgeRange.max || 'Any'} yrs`
                                : '—'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-navy-950/40 border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                            <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5">Location</p>
                            <p className="text-sm text-luxe-gray-200 font-medium">{f2.preferredLocation || '—'}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-navy-950/40 border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                            <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5">Education</p>
                            <p className="text-sm text-luxe-gray-200 font-medium">{f2.preferredEducation || '—'}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-navy-950/40 border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                            <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5">Profession</p>
                            <p className="text-sm text-luxe-gray-200 font-medium">{f2.preferredProfession || '—'}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-navy-950/40 border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                            <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5">Religion</p>
                            <p className="text-sm text-luxe-gray-200 font-medium">{f2.preferredReligion || '—'}</p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-navy-950/40 border border-gold-500/5 hover:border-gold-500/10 transition-colors">
                            <p className="text-[10px] text-luxe-gray-500 uppercase tracking-widest mb-0.5">Caste</p>
                            <p className="text-sm text-luxe-gray-200 font-medium">{f2.preferredCaste || '—'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'personal' && (
              <>
                <Card title="Personal Specifications" icon={User}>
                  <Field label="Gender" value={f1?.gender} />
                  <Field label="Date of Birth" value={f1?.dob ? new Date(f1.dob).toLocaleDateString() : null} />
                  <Field label="Height" value={f1?.height || f2?.height} />
                  <Field label="Weight" value={f2?.weight ? `${f2.weight} kg` : null} />
                  <Field label="Blood Group" value={f2?.bloodGroup} />
                  <Field label="Physical Status" value={f2?.physicalStatus} />
                </Card>

                <Card title="Community & Family" icon={Heart}>
                  <Field label="Religion" value={f1?.religion} />
                  <Field label="Caste" value={f1?.caste} />
                  <Field label="Family Type" value={f2?.familyType} />
                  <Field label="Family Values" value={f2?.familyValues} />
                  <Field label="Siblings Count" value={f2?.siblings?.toString()} />
                  <Field label="Native Place" value={f2?.nativePlace} />
                </Card>
              </>
            )}

            {activeTab === 'astrology' && (
              <>
                <Card title="Horoscope & Astrology" icon={Ring}>
                  <Field label="Raasi" value={f2?.raasi} />
                  <Field label="Nakshatra" value={f2?.nakshatra} />
                  <Field label="Gothram" value={f2?.gothram} />
                </Card>

                <Card title="Professional Background" icon={Briefcase}>
                  <Field label="Education Level" value={f1?.education} />
                  <Field label="Occupation" value={f1?.profession || f1?.occupation} />
                  <Field label="Employment Sector" value={f2?.jobType} />
                  <Field label="Company Name" value={f2?.companyName} />
                  <Field label="Annual Income" value={f2?.annualIncome ? `₹${Number(f2.annualIncome).toLocaleString()}` : null} />
                  <Field label="Work Location" value={f2?.workLocation} />
                </Card>
              </>
            )}

            {activeTab === 'portfolio' && (
              <div className="bg-navy-900/60 border border-gold-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gold-500/5">
                  <Camera className="text-gold-400" size={16} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gold-400">Photo Portfolio</h3>
                </div>
                {!photos || photos.length === 0 ? (
                  <p className="text-luxe-gray-500 text-sm">No photos uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {photos.map((p, idx) => (
                      <div key={p._id || idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gold-500/15 group shadow-luxury hover:border-gold-500/40 transition-colors duration-300">
                        <img src={p.photoUrl} alt={p.photoType || "Portfolio image"} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent flex flex-col justify-end p-3.5">
                          <span className="text-[10px] text-luxe-gray-300 font-bold uppercase tracking-widest capitalize">
                            {p.photoType === 'headshot' ? 'Primary Headshot 👑' : p.photoType?.replace(/([A-Z])/g, ' $1') || 'General'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deluxe Premium Edit Selector Pop-up/Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-navy-950/85 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-navy-900 border border-gold-500/30 rounded-2xl p-6 shadow-luxury overflow-hidden relative z-10"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gold-500/10 mb-5">
                <div>
                  <h3 className="text-xl font-bold font-playfair text-luxe-gray-100">Select Section to Edit</h3>
                  <p className="text-xs text-luxe-gray-400 mt-1">Changes are live immediately upon admin approval</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-luxe-gray-400 hover:text-gold-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Option 1: Basic Profile */}
                <motion.div 
                  whileHover={{ x: 4, scale: 1.01 }}
                  onClick={() => handleEditRedirect('/app/basic-details')}
                  className="flex items-center gap-4 p-4 bg-navy-850 hover:bg-gold-500/5 border border-gold-500/10 rounded-xl cursor-pointer group transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 transition-all">
                    <User size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-luxe-gray-100 group-hover:text-gold-400 transition-colors">Basic Details</h4>
                    <p className="text-xs text-luxe-gray-400">Name, caste, community details, city, and state</p>
                  </div>
                  <ArrowRight size={14} className="text-luxe-gray-500 group-hover:text-gold-400 transition-colors" />
                </motion.div>

                {/* Option 2: Photos Portfolio */}
                <motion.div 
                  whileHover={{ x: 4, scale: 1.01 }}
                  onClick={() => handleEditRedirect('/app/upload-photos')}
                  className="flex items-center gap-4 p-4 bg-navy-850 hover:bg-gold-500/5 border border-gold-500/10 rounded-xl cursor-pointer group transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 transition-all">
                    <Camera size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-luxe-gray-100 group-hover:text-gold-400 transition-colors">Photos Portfolio</h4>
                    <p className="text-xs text-luxe-gray-400">Headshot, half body, and full length photos</p>
                  </div>
                  <ArrowRight size={14} className="text-luxe-gray-500 group-hover:text-gold-400 transition-colors" />
                </motion.div>

                {/* Option 3: Marriage Details */}
                <motion.div 
                  whileHover={{ x: 4, scale: 1.01 }}
                  onClick={() => handleEditRedirect((user?.paymentStatus === 'confirmed' || user?.paymentStatus === 'verified') ? '/app/marriage-details' : '/app/payment-status')}
                  className="flex items-center gap-4 p-4 bg-navy-850 hover:bg-gold-500/5 border border-gold-500/10 rounded-xl cursor-pointer group transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 transition-all">
                    <Heart size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-luxe-gray-100 group-hover:text-gold-400 transition-colors">Marriage Details</h4>
                    <p className="text-xs text-luxe-gray-400">Astrology, professional income, family background, & expectations</p>
                  </div>
                  <ArrowRight size={14} className="text-luxe-gray-500 group-hover:text-gold-400 transition-colors" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProfile;
