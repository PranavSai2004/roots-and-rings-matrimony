import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft as Back,
  FaCircleCheck as Approve,
  FaCircleXmark as Reject,
  FaTriangleExclamation as RequestChanges,
} from 'react-icons/fa6';
import { AdminCard, StatusBadge, NotesPanel, ConfirmationModal } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const DetailRow = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-navy-950/50 border border-gold-500/10">
    <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-1">{label}</p>
    <p className="text-sm text-luxe-gray leading-relaxed whitespace-pre-wrap">{value || '—'}</p>
  </div>
);

export const Form2DetailReview = () => {
  const navigate = useNavigate();
  const { profileId } = useParams(); // profileId here is the userId

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [changesMessage, setChangesMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get(`/admin/marriage-details/${profileId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Marriage Details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [profileId]);

  const handleAction = (action) => {
    setSelectedAction(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (selectedAction === 'approve') {
        await adminApi.post(`/admin/marriage-details/${profileId}/approve`, { adminNotes: notes });
      } else if (selectedAction === 'reject') {
        await adminApi.post(`/admin/marriage-details/${profileId}/reject`, {
          rejectionReason: rejectionReason || 'Rejected by admin',
          adminNotes: notes,
        });
      } else if (selectedAction === 'request_changes') {
        await adminApi.post(`/admin/marriage-details/${profileId}/request-changes`, {
          changesRequested: changesMessage || notes,
          adminNotes: notes,
        });
      }
      setShowConfirmation(false);
      setTimeout(() => navigate('/admin/form2'), 500);
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

  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  const { marriageDetails: form2, user } = data || {};

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/form2')}
          className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-all"
        >
          <Back size={20} />
          <span className="text-sm font-medium">Back to Form-2 Queue</span>
        </button>
        <StatusBadge status={form2?.form2ReviewStatus || 'pending'} size="lg" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AdminCard>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-playfair text-luxe-gray">Marriage Details Review</h1>
                  <p className="text-xs text-gold-400 font-mono mt-2">Mobile: {user?.mobile}</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Astrology & Horoscope */}
                <div>
                  <h3 className="text-sm font-semibold text-luxe-gray mb-3 border-b border-gold-500/20 pb-2">Astrology & Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailRow label="Raasi" value={form2?.raasi} />
                    <DetailRow label="Nakshatra" value={form2?.nakshatra} />
                    <DetailRow label="Gothram" value={form2?.gothram} />
                  </div>
                </div>

                {/* Physical & Personal */}
                <div>
                  <h3 className="text-sm font-semibold text-luxe-gray mb-3 border-b border-gold-500/20 pb-2">Physical & Personal Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailRow label="Height" value={form2?.height} />
                    <DetailRow label="Weight (kg)" value={form2?.weight} />
                    <DetailRow label="Blood Group" value={form2?.bloodGroup} />
                    <DetailRow label="Physical Status" value={form2?.physicalStatus} />
                    <DetailRow label="Marital Status" value={form2?.maritalStatus} />
                    <DetailRow label="Diet" value={form2?.diet} />
                    <DetailRow label="Smoking" value={form2?.smoking} />
                    <DetailRow label="Drinking" value={form2?.drinking} />
                    <DetailRow label="Lifestyle" value={form2?.lifestyle} />
                  </div>
                </div>

                {/* Family Background */}
                <div>
                  <h3 className="text-sm font-semibold text-luxe-gray mb-3 border-b border-gold-500/20 pb-2">Family Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailRow label="Family Type" value={form2?.familyType} />
                    <DetailRow label="Family Values" value={form2?.familyValues} />
                    <DetailRow label="Siblings" value={form2?.siblings} />
                    <DetailRow label="Father Occupation" value={form2?.fatherOccupation} />
                    <DetailRow label="Mother Occupation" value={form2?.motherOccupation} />
                    <DetailRow label="Native Place" value={form2?.nativePlace} />
                  </div>
                </div>

                {/* Professional Details */}
                <div>
                  <h3 className="text-sm font-semibold text-luxe-gray mb-3 border-b border-gold-500/20 pb-2">Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Job Type" value={form2?.jobType} />
                    <DetailRow label="Company Name" value={form2?.companyName} />
                    <DetailRow label="Annual Income (₹)" value={form2?.annualIncome} />
                    <DetailRow label="Work Location" value={form2?.workLocation} />
                  </div>
                </div>

                {/* Partner Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-luxe-gray mb-3 border-b border-gold-500/20 pb-2">Partner Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailRow 
                      label="Age Range" 
                      value={form2?.preferredAgeRange?.min && form2?.preferredAgeRange?.max 
                        ? `${form2.preferredAgeRange.min} - ${form2.preferredAgeRange.max} yrs` 
                        : '—'} 
                    />
                    <DetailRow label="Location" value={form2?.preferredLocation} />
                    <DetailRow label="Education" value={form2?.preferredEducation} />
                    <DetailRow label="Profession" value={form2?.preferredProfession} />
                    <DetailRow label="Religion" value={form2?.preferredReligion} />
                    <DetailRow label="Caste" value={form2?.preferredCaste} />
                  </div>
                </div>

                {/* Descriptive */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-luxe-gray border-b border-gold-500/20 pb-2">About & Expectations</h3>
                  <DetailRow label="About Me" value={form2?.aboutMe} />
                  <DetailRow label="Expectations" value={form2?.expectations} />
                </div>
              </div>
            </AdminCard>
          </motion.div>
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
                  disabled={form2?.form2ReviewStatus === 'approved'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Approve size={18} /> Approve Details
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
                  <Reject size={18} /> Reject Details
                </motion.button>
              </div>
            </AdminCard>
          </motion.div>

          {/* Previous Notes callout */}
          {(user?.adminNotes || form2?.adminNotes) && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.25 }}
              className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/15"
            >
              <h4 className="text-xs uppercase tracking-widest text-gold-400 font-bold mb-2">Previous Admin Notes</h4>
              <p className="text-sm text-luxe-gray leading-relaxed whitespace-pre-wrap">{user?.adminNotes || form2?.adminNotes}</p>
            </motion.div>
          )}

          {/* Notes */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <NotesPanel notes={notes} onNotesChange={setNotes} placeholder="Add moderation notes..." />
          </motion.div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        title={`${selectedAction === 'approve' ? 'Approve' : selectedAction === 'reject' ? 'Reject' : 'Request Changes for'} Marriage Details?`}
        message={
          selectedAction === 'approve'
            ? 'Profile will be fully approved and eligible for batch sharing.'
            : selectedAction === 'reject'
            ? 'Form-2 details will be rejected.'
            : 'Form-2 will be unlocked so the user can make changes.'
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

export default Form2DetailReview;
