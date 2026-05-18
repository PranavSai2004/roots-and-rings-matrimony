import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft as Back, FaUser as User, FaCamera as Camera, FaHeart as Heart, FaHistory as History, FaCheckCircle as Check, FaTimesCircle as Times, FaClock as Clock, FaDownload as Download } from 'react-icons/fa';
import api from '../../services/adminApi';

const StatusPill = ({ status }) => {
  const map = {
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    changes_requested: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    pending_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border font-semibold ${map[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-luxe-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm text-luxe-gray font-medium">{value || <span className="text-luxe-gray-600 italic">Not provided</span>}</p>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-navy-900/50 border border-gold-500/10 rounded-xl p-6">
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gold-500/10">
      <Icon className="text-gold-400" size={16} />
      <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">{children}</div>
  </div>
);

export const AdminUserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/admin/reviews/${userId}`);
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-center text-red-400 p-10">Failed to load profile.</div>;

  const { user, form1Data: f1, photos, form2Data: f2, reviewHistory } = data;
  const primaryPhoto = photos?.find(p => p.photoType === 'headshot') || photos?.[0];

  const tabs = ['overview', 'form1', 'photos', 'form2', 'history'];

  const handleDownloadPhoto = async (photoUrl, photoType) => {
    try {
      const fullUrl = photoUrl.startsWith('http') 
        ? photoUrl 
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${photoUrl}`;
        
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.fullName?.replace(/\s+/g, '_') || 'Member'}_${photoType || 'photo'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      const fallbackUrl = photoUrl.startsWith('http') 
        ? photoUrl 
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${photoUrl}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 xl:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/members')} className="flex items-center gap-2 text-sm text-luxe-gray-400 hover:text-gold-400 transition-colors">
          <Back size={14} /> Member Directory
        </button>
        <span className="text-luxe-gray-600">/</span>
        <span className="text-sm text-luxe-gray">{f1?.fullName || user.mobile}</span>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-navy-900/80 to-navy-800/80 border border-gold-500/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
            {primaryPhoto?.photoUrl ? (
              <img src={primaryPhoto.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-navy-950 font-bold text-3xl">{f1?.fullName?.charAt(0) || '?'}</span>
            )}
          </div>
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-playfair text-luxe-gray mb-1">{f1?.fullName || 'Unknown'}</h1>
            <p className="text-sm text-luxe-gray-400 mb-3">{user.mobile} {user.email && `· ${user.email}`} · {f1?.city}, {f1?.state}</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-luxe-gray-400">
                <span>Form 1:</span><StatusPill status={user.form1ReviewStatus} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-luxe-gray-400">
                <span>Photos:</span><StatusPill status={user.photosReviewStatus} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-luxe-gray-400">
                <span>Payment:</span><StatusPill status={user.paymentStatus} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-luxe-gray-400">
                <span>Form 2:</span><StatusPill status={user.form2ReviewStatus || 'pending_review'} />
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => navigate(`/admin/reviews/${userId}`)} className="px-4 py-2 bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-lg text-sm font-semibold hover:bg-gold-500/30 transition-all">
              Review Form 1
            </button>
            {user.form2Status === 'completed' && (
              <button onClick={() => navigate(`/admin/form2/${userId}`)} className="px-4 py-2 bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-lg text-sm font-semibold hover:bg-gold-500/30 transition-all">
                Review Form 2
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-navy-900/50 border border-gold-500/10 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-luxe-gray-400 hover:text-gold-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Registered', value: new Date(user.createdAt).toLocaleDateString() },
                { label: 'Pipeline Stage', value: ['Registered','Form 1','Photos','Payment','Form 2'][user.registrationStep] || `Step ${user.registrationStep}` },
                { label: 'Admin Notes', value: user.adminNotes || 'None' },
                { label: 'Last Reviewed', value: user.lastReviewedAt ? new Date(user.lastReviewedAt).toLocaleDateString() : 'Never' },
              ].map(item => (
                <div key={item.label} className="bg-navy-900/50 border border-gold-500/10 rounded-xl p-4">
                  <p className="text-xs text-luxe-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm text-luxe-gray font-medium truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Premium Full-Width Admin Notes Panel */}
            <div className="bg-navy-900/50 border border-gold-500/20 rounded-xl p-6 shadow-luxury">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gold-500/10">
                <History className="text-gold-400" size={16} />
                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-widest">Profile Moderation & Admin Notes</h3>
              </div>
              {user.adminNotes ? (
                <div className="p-4 rounded-lg bg-gold-500/5 border border-gold-500/15">
                  <p className="text-sm text-luxe-gray leading-relaxed whitespace-pre-wrap">{user.adminNotes}</p>
                </div>
              ) : (
                <p className="text-sm text-luxe-gray-500 italic">No admin notes have been written for this member yet.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'form1' && f1 && (
          <Section title="Basic Profile" icon={User}>
            <Field label="Full Name" value={f1.fullName} />
            <Field label="Gender" value={f1.gender} />
            <Field 
              label="Date of Birth" 
              value={f1.dob ? (() => { 
                const d = new Date(f1.dob); 
                const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000)); 
                return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (${age} Years Old)`; 
              })() : null} 
            />
            <Field label="Height" value={f1.height} />
            <Field label="Religion" value={f1.religion} />
            <Field label="Caste" value={f1.caste} />
            <Field label="Mother Tongue" value={f1.motherTongue} />
            <Field label="Education" value={f1.education} />
            <Field label="Occupation" value={f1.profession} />
            <Field label="City" value={f1.city} />
            <Field label="State" value={f1.state} />
          </Section>
        )}

        {activeTab === 'photos' && (
          <div className="bg-navy-900/50 border border-gold-500/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gold-500/10">
              <Camera className="text-gold-400" size={16} />
              <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-widest">Photo Portfolio</h3>
            </div>
            {!photos || photos.length === 0 ? (
              <p className="text-luxe-gray-500 text-sm">No photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {photos.map((p, idx) => (
                  <div key={p._id || idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gold-500/15 group shadow-luxury">
                    <img src={p.photoUrl} alt={p.photoType || "Portfolio image"} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                    
                    {/* Top-Right Download Overlay Button */}
                    <button
                      onClick={() => handleDownloadPhoto(p.photoUrl, p.photoType)}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-navy-950/80 hover:bg-gold-500 hover:text-navy-950 text-gold-400 border border-gold-500/30 flex items-center justify-center backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg"
                      title="Download Photo to Device"
                    >
                      <Download size={12} />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent flex flex-col justify-end p-3.5 pointer-events-none">
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

        {activeTab === 'form2' && (
          f2 ? (
            <div className="space-y-5">
              <Section title="Astrology" icon={Heart}>
                <Field label="Raasi" value={f2.raasi} />
                <Field label="Nakshatra" value={f2.nakshatra} />
                <Field label="Gothram" value={f2.gothram} />
              </Section>
              <Section title="Personal Info" icon={User}>
                <Field label="Height" value={f2.height} />
                <Field label="Weight" value={f2.weight && `${f2.weight} kg`} />
                <Field label="Blood Group" value={f2.bloodGroup} />
                <Field label="Marital Status" value={f2.maritalStatus} />
                <Field label="Physical Status" value={f2.physicalStatus} />
                <Field label="Diet" value={f2.diet} />
                <Field label="Smoking" value={f2.smoking} />
                <Field label="Drinking" value={f2.drinking} />
              </Section>
              <Section title="Family" icon={Heart}>
                <Field label="Family Type" value={f2.familyType} />
                <Field label="Family Values" value={f2.familyValues} />
                <Field label="Siblings" value={f2.siblings?.toString()} />
                <Field label="Native Place" value={f2.nativePlace} />
                <Field label="Father Occupation" value={f2.fatherOccupation} />
                <Field label="Mother Occupation" value={f2.motherOccupation} />
              </Section>
              <Section title="Professional" icon={User}>
                <Field label="Job Type" value={f2.jobType} />
                <Field label="Company" value={f2.companyName} />
                <Field label="Annual Income" value={f2.annualIncome && `₹${Number(f2.annualIncome).toLocaleString()}`} />
                <Field label="Work Location" value={f2.workLocation} />
              </Section>
              <div className="bg-navy-900/50 border border-gold-500/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gold-500/10">
                  <Heart className="text-gold-400" size={16} />
                  <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-widest">About & Expectations</h3>
                </div>
                {f2.aboutMe && <div><p className="text-xs text-luxe-gray-500 mb-1">About Me</p><p className="text-sm text-luxe-gray">{f2.aboutMe}</p></div>}
                {f2.expectations && <div><p className="text-xs text-luxe-gray-500 mb-1">Expectations</p><p className="text-sm text-luxe-gray">{f2.expectations}</p></div>}
                {f2.lifestyle && <div><p className="text-xs text-luxe-gray-500 mb-1">Lifestyle</p><p className="text-sm text-luxe-gray">{f2.lifestyle}</p></div>}
              </div>
            </div>
          ) : <p className="text-luxe-gray-500 text-sm p-4">Marriage Details not submitted yet.</p>
        )}

        {activeTab === 'history' && (
          <div className="bg-navy-900/50 border border-gold-500/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gold-500/10">
              <History className="text-gold-400" size={16} />
              <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-widest">Review History</h3>
            </div>
            {reviewHistory?.length === 0 ? (
              <p className="text-luxe-gray-500 text-sm">No review history yet.</p>
            ) : (
              <div className="space-y-3">
                {reviewHistory.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gold-500/10">
                    <StatusPill status={r.action} />
                    <div className="flex-1">
                      <p className="text-sm text-luxe-gray">{r.notes || 'No notes'}</p>
                      <p className="text-xs text-luxe-gray-500 mt-1">By {r.adminId?.email || 'Admin'} · {new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminUserProfileView;
