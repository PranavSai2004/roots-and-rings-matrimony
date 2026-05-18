import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as Arrow, FaRotateRight as Refresh, FaHourglass as Pending } from 'react-icons/fa6';
import { AdminCard, AdminTable, StatusBadge, EmptyState } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const PendingReviewList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/reviews/pending?limit=50');
      setReviews(res.data.data || []);
      setTotal(res.data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const columns = [
    { key: 'mobile', label: 'Mobile / ID' },
    { key: 'photos', label: 'Photos' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const getStageLabel = (step) => {
    switch (step) {
      case 1:
        return { text: '📝 Basic Details Filled (Photos Pending)', className: 'text-amber-400 font-medium' };
      case 2:
        return { text: '📸 Basic & Photos Submitted (Awaiting Approval)', className: 'text-cyan-400 font-medium' };
      case 3:
        return { text: '💳 Approved & Awaiting Form 2 Unlock', className: 'text-emerald-400 font-medium' };
      case 4:
        return { text: '💍 Marriage Details Submitted (Form-2 Pending)', className: 'text-purple-400 font-medium' };
      default:
        return { text: `Step ${step || 0}`, className: 'text-luxe-gray-400' };
    }
  };

  const rows = reviews.map((r) => {
    const stage = getStageLabel(r.registrationStep);
    return {
      id: r._id,
      mobile: () => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-luxe-gray font-medium font-mono text-sm">{r.mobile}</p>
            {r.adminNotes && (
              <span 
                title={r.adminNotes}
                className="px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 text-[10px] font-semibold border border-gold-500/20 cursor-help"
              >
                📝 Note
              </span>
            )}
          </div>
          <p className={`text-[10px] uppercase tracking-wider ${stage.className}`}>
            {stage.text}
          </p>
        </div>
      ),
      photos: () => (
        <span className={`text-xs font-medium ${r.photoCount > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
          {r.photoCount || 0} / 1 uploaded
        </span>
      ),
      submitted: formatDate(r.createdAt),
      status: () => <StatusBadge status={r.form1ReviewStatus || 'pending'} size="sm" />,
      action: () => (
        <button
          onClick={() => navigate(`/admin/reviews/${r._id}`)}
          className="text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 text-sm transition-colors"
        >
          Review <Arrow size={12} />
        </button>
      ),
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair text-luxe-gray mb-1">Profile Reviews</h1>
          <p className="text-luxe-gray-400 text-sm">Form-1 + photo moderation queue</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-gold-400 hover:bg-gold-500/10 text-sm transition-all"
        >
          <Refresh size={14} /> Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending Reviews', value: total, color: 'text-yellow-400' },
          { label: 'With Photos', value: reviews.filter(r => r.photoCount >= 4).length, color: 'text-green-400' },
          { label: 'Missing Photos', value: reviews.filter(r => (r.photoCount || 0) < 4).length, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl border border-gold-500/10 bg-navy-900/40">
            <p className="text-xs text-luxe-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AdminCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-luxe-gray">Pending Reviews</h2>
              <p className="text-xs text-luxe-gray-400 mt-1">{total} profiles awaiting moderation</p>
            </div>
            <Pending className="text-gold-400" size={20} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm text-center py-8">{error}</div>
          ) : rows.length > 0 ? (
            <AdminTable columns={columns} rows={rows} />
          ) : (
            <EmptyState title="No pending reviews" message="All profiles have been reviewed or no new submissions yet." />
          )}
        </AdminCard>
      </motion.div>
    </div>
  );
};

export default PendingReviewList;
