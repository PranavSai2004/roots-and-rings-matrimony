import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft as Back, FaCheck as Save, FaClock as Pending, FaBan as Closed, FaCalendar as Meeting } from 'react-icons/fa6';
import { AdminCard, StatusBadge, NotesPanel } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const DetailRow = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-navy-950/50 border border-gold-500/10">
    <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-1">{label}</p>
    <p className="text-sm text-luxe-gray leading-relaxed">{value || '—'}</p>
  </div>
);

export const InterestDetailScreen = () => {
  const navigate = useNavigate();
  const { interestId } = useParams();
  const location = useLocation();

  // If passed from tracking screen, use it directly, else we could fetch (but for now assume passed)
  const initialData = location.state?.interest;

  const [interest, setInterest] = useState(initialData);
  const [status, setStatus] = useState(initialData?.interestStatus || 'pending');
  const [notes, setNotes] = useState(initialData?.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // If someone lands here directly without state, they should go back
  useEffect(() => {
    if (!initialData) {
      navigate('/admin/interests');
    }
  }, [initialData, navigate]);

  if (!interest) return null;

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await adminApi.patch(`/admin/interests/${interestId}/status`, {
        interestStatus: status,
        adminNotes: notes
      });
      setSuccessMsg('Status updated successfully!');
      setTimeout(() => navigate('/admin/interests'), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Pending },
    { value: 'contacted', label: 'Contacted', icon: Save },
    { value: 'meeting_scheduled', label: 'Meeting Scheduled', icon: Meeting },
    { value: 'closed', label: 'Closed', icon: Closed },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/interests')}
          className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-all"
        >
          <Back size={20} />
          <span className="text-sm font-medium">Back to CRM</span>
        </button>
        <StatusBadge status={interest.interestStatus} size="lg" />
      </motion.div>

      {successMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
          ✅ {successMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AdminCard>
              <h2 className="text-xl font-semibold text-luxe-gray mb-6">Interest Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div>
                  <h3 className="text-sm text-gold-400 uppercase font-semibold mb-4 border-b border-gold-500/20 pb-2">From Member</h3>
                  <div className="space-y-3">
                    <DetailRow label="Name" value={interest.recipientUserId?.fullName} />
                    <DetailRow label="Mobile" value={interest.recipientUserId?.mobile} />
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-navy-900 border border-gold-500/30 items-center justify-center text-gold-400">
                  →
                </div>

                {/* To Profile */}
                <div>
                  <h3 className="text-sm text-gold-400 uppercase font-semibold mb-4 border-b border-gold-500/20 pb-2">Interested In</h3>
                  <div className="space-y-3">
                    <DetailRow label="Name" value={interest.targetProfileId?.name} />
                    <DetailRow label="Age / Profession" value={`${interest.targetProfileId?.age || '?'} yrs, ${interest.targetProfileId?.profession || '?'}`} />
                    <DetailRow label="City" value={interest.targetProfileId?.city} />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gold-500/10 pt-6">
                <DetailRow label="Recorded On" value={new Date(interest.createdAt).toLocaleString('en-IN')} />
                {interest.adminNotified && (
                  <p className="text-xs text-green-400 mt-2">✓ Admin has been notified</p>
                )}
              </div>
            </AdminCard>
          </motion.div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <AdminCard>
              <h3 className="text-sm font-semibold text-luxe-gray mb-4">Update Status</h3>
              <div className="space-y-3 mb-6">
                {statusOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${status === opt.value ? 'bg-gold-500/10 border-gold-500/50' : 'bg-navy-950/50 border-gold-500/10 hover:border-gold-500/30'}`}>
                      <input
                        type="radio"
                        name="status"
                        value={opt.value}
                        checked={status === opt.value}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-4 h-4 accent-gold-500"
                      />
                      <Icon className={status === opt.value ? 'text-gold-400' : 'text-luxe-gray-500'} size={14} />
                      <span className={`text-sm ${status === opt.value ? 'text-luxe-gray' : 'text-luxe-gray-400'}`}>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              
              <NotesPanel notes={notes} onNotesChange={setNotes} placeholder="Add progress notes (e.g., 'Called boy's family on Tuesday...')" />

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30 font-semibold transition-all disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Updates'}
              </button>
            </AdminCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InterestDetailScreen;
