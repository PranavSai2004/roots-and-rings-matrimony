import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft as Back,
  FaCircleCheck as Approve,
  FaCircleXmark as Reject,
  FaTriangleExclamation as RequestChanges,
  FaRotateRight as Refresh,
  FaDownload as Download,
} from 'react-icons/fa6';
import { AdminCard, StatusBadge, NotesPanel, ReviewTimeline, ConfirmationModal } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN') : '—';

const DetailRow = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-navy-950/50 border border-gold-500/10">
    <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">{label}</p>
    <p className="text-sm text-luxe-gray mt-1">{value || '—'}</p>
  </div>
);

export const ReviewDetailScreen = () => {
  const navigate = useNavigate();
  const { profileId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesMessage, setChangesMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get(`/admin/reviews/${profileId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [profileId]);

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
      a.download = `${data?.user?.fullName?.replace(/\s+/g, '_') || 'Member'}_${photoType || 'photo'}.jpg`;
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

  const handleAction = (action) => {
    setSelectedAction(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (selectedAction === 'approve') {
        await adminApi.post(`/admin/reviews/${profileId}/approve`, { adminNotes: notes });
        setActionSuccess('Profile approved successfully!');
      } else if (selectedAction === 'reject') {
        await adminApi.post(`/admin/reviews/${profileId}/reject`, {
          rejectionReason: rejectionReason || 'Rejected by admin',
          adminNotes: notes,
        });
        setActionSuccess('Profile rejected.');
      } else if (selectedAction === 'request_changes') {
        await adminApi.post(`/admin/reviews/${profileId}/request-changes`, {
          changesRequested: changesMessage || notes,
          adminNotes: notes,
        });
        setActionSuccess('Changes requested from user.');
      }
      setShowConfirmation(false);
      setTimeout(() => navigate('/admin/reviews'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
      setShowConfirmation(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-400">{error}</div>
  );

  const { user, form1Data, photos = [], reviewHistory = [] } = data || {};
  const dob = form1Data?.dob ? new Date(form1Data.dob) : null;
  const age = dob ? Math.floor((Date.now() - dob) / (365.25 * 24 * 3600 * 1000)) : null;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/reviews')}
          className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-all"
        >
          <Back size={20} />
          <span className="text-sm font-medium">Back to Reviews</span>
        </button>
        <StatusBadge status={user?.form1ReviewStatus || 'pending'} size="lg" />
      </motion.div>

      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium"
        >
          {actionSuccess} Redirecting...
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AdminCard>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-playfair text-luxe-gray">{form1Data?.fullName || '—'}</h1>
                  <p className="text-luxe-gray-400 text-sm mt-2">
                    {age ? `${age} yrs` : '—'} · {form1Data?.city || '—'} · {form1Data?.profession || '—'}
                  </p>
                  <p className="text-xs text-gold-400 font-mono mt-1">{user?.mobile}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shrink-0">
                  <span className="text-navy-950 font-bold text-2xl">
                    {form1Data?.fullName?.charAt(0) || '?'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <DetailRow label="Gender" value={form1Data?.gender} />
                <DetailRow label="DOB" value={form1Data?.dob ? new Date(form1Data.dob).toLocaleDateString('en-IN') : '—'} />
                <DetailRow label="Height" value={form1Data?.height} />
                <DetailRow label="Religion" value={form1Data?.religion} />
                <DetailRow label="Caste" value={form1Data?.caste} />
                <DetailRow label="Mother Tongue" value={form1Data?.motherTongue} />
                <DetailRow label="Education" value={form1Data?.education} />
                <DetailRow label="Occupation" value={form1Data?.profession} />
                <DetailRow label="State" value={form1Data?.state} />
              </div>
            </AdminCard>
          </motion.div>

          {/* Photos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AdminCard>
              <h2 className="text-lg font-semibold text-luxe-gray mb-4">
                Photo Portfolio ({photos.length} / 4 uploaded)
              </h2>
              {photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((p, idx) => (
                    <div key={p._id || idx} className="relative rounded-xl overflow-hidden border border-gold-500/20 aspect-[3/4] group shadow-luxury">
                      <img
                        src={p.photoUrl}
                        alt={p.photoType || "Portfolio Photo"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        onError={(e) => { e.target.src = 'https://placehold.co/150x200/1a1a2e/d4af37?text=No+Photo'; }}
                      />
                      
                      {/* Top-Right Download Overlay Button */}
                      <button
                        onClick={() => handleDownloadPhoto(p.photoUrl, p.photoType)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-navy-950/80 hover:bg-gold-500 hover:text-navy-950 text-gold-400 border border-gold-500/30 flex items-center justify-center backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg"
                        title="Download Photo to Device"
                      >
                        <Download size={12} />
                      </button>

                      <span className="absolute bottom-2 left-2 text-[10px] bg-navy-950/80 text-gold-400 font-bold rounded px-2 py-0.5 capitalize pointer-events-none">
                        {p.photoType === 'headshot' ? 'Primary Headshot 👑' : p.photoType?.replace(/([A-Z])/g, ' $1') || 'General'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-yellow-400 text-sm">⚠ No photos uploaded yet</div>
              )}
            </AdminCard>
          </motion.div>

          {/* Account Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AdminCard>
              <h2 className="text-lg font-semibold text-luxe-gray mb-4">Account Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <DetailRow label="Submitted" value={formatDate(user?.createdAt)} />
                <DetailRow label="Form1 Status" value={user?.form1ReviewStatus} />
                <DetailRow label="Photos Status" value={user?.photosReviewStatus} />
                <DetailRow label="Payment" value={user?.paymentStatus} />
                <DetailRow label="Form2 Status" value={user?.form2Status || '—'} />
                <DetailRow label="Step" value={user?.registrationStep?.toString()} />
              </div>
              {user?.adminNotes && (
                <div className="mt-4 p-3 rounded-lg bg-gold-500/5 border border-gold-500/15">
                  <p className="text-xs text-gold-400 font-semibold uppercase mb-1">Previous Admin Notes</p>
                  <p className="text-sm text-luxe-gray-300">{user.adminNotes}</p>
                </div>
              )}
            </AdminCard>
          </motion.div>

          {/* Review History */}
          {reviewHistory.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <ReviewTimeline events={reviewHistory.map(h => ({
                action: h.action,
                timestamp: formatDate(h.createdAt),
                notes: h.adminNotes,
              }))} />
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <AdminCard>
              <h3 className="text-sm font-semibold text-luxe-gray mb-4">Review Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction('approve')}
                  disabled={user?.form1ReviewStatus === 'approved'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Approve size={18} /> Approve Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction('request_changes')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 font-semibold transition-all"
                >
                  <RequestChanges size={18} /> Request Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction('reject')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-semibold transition-all"
                >
                  <Reject size={18} /> Reject Profile
                </motion.button>
              </div>
            </AdminCard>
          </motion.div>

          {/* Notes */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <NotesPanel notes={notes} onNotesChange={setNotes} placeholder="Add moderation notes..." />
          </motion.div>

          {/* Checklist */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <AdminCard>
              <h3 className="text-sm font-semibold text-luxe-gray mb-4">Review Checklist</h3>
              <div className="space-y-3">
                {[
                  { label: 'All Form-1 fields filled', checked: !!form1Data?.fullName },
                  { label: `Photos present (${photos.length}/4)`, checked: photos.length >= 1 },
                  { label: 'Primary Headshot uploaded', checked: photos.some(p => p.photoType === 'headshot') },
                  { label: 'Photos look genuine & clear', checked: false },
                  { label: 'No policy violations', checked: false },
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 rounded accent-gold-500"
                    />
                    <span className="text-sm text-luxe-gray-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </AdminCard>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        title={`${selectedAction === 'approve' ? 'Approve' : selectedAction === 'reject' ? 'Reject' : 'Request Changes for'} Profile?`}
        message={
          selectedAction === 'approve'
            ? 'This profile will move to payment step. User will be notified.'
            : selectedAction === 'reject'
            ? 'User will be notified and profile will be rejected.'
            : 'User will be asked to update their information.'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirmation(false)}
        isDangerous={selectedAction === 'reject'}
      >
        {(selectedAction === 'reject' || selectedAction === 'request_changes') && (
          <div className="mt-2">
            <label className="block text-xs uppercase tracking-widest text-gold-400 font-semibold mb-2">
              {selectedAction === 'reject' ? 'Reason for Rejection *' : 'Changes Requested *'}
            </label>
            <textarea
              value={selectedAction === 'reject' ? rejectionReason : changesMessage}
              onChange={(e) => selectedAction === 'reject' ? setRejectionReason(e.target.value) : setChangesMessage(e.target.value)}
              placeholder={`Enter ${selectedAction === 'reject' ? 'rejection reason' : 'required changes'}...`}
              className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-3 py-2 text-sm text-luxe-gray placeholder-luxe-gray-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all resize-none h-20"
              required
            />
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default ReviewDetailScreen;
