import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as Arrow, FaRotateRight as Refresh, FaHandshake as Icon } from 'react-icons/fa6';
import { AdminCard, AdminTable, StatusBadge, EmptyState } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const Form2ReviewList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/marriage-details/pending?limit=50');
      setReviews(res.data.data || []);
      setTotal(res.data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Form-2 reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const columns = [
    { key: 'mobile', label: 'User Mobile' },
    { key: 'submitted', label: 'Submitted On' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const rows = reviews.map((r) => ({
    id: r._id,
    mobile: () => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-luxe-gray">{r.mobile || '—'}</span>
        {r.adminNotes && (
          <span 
            title={r.adminNotes}
            className="px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 text-[10px] font-semibold border border-gold-500/20 cursor-help"
          >
            📝 Note
          </span>
        )}
      </div>
    ),
    submitted: formatDate(r.createdAt),
    status: () => <StatusBadge status={r.form2ReviewStatus || 'pending'} size="sm" />,
    action: () => (
      <button
        onClick={() => navigate(`/admin/form2/${r.userId}`)}
        className="text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1 text-sm transition-colors"
      >
        Review <Arrow size={12} />
      </button>
    ),
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair text-luxe-gray mb-1">Marriage Details Review</h1>
          <p className="text-luxe-gray-400 text-sm">Moderation queue for Form-2 approval</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-gold-400 hover:bg-gold-500/10 text-sm transition-all"
        >
          <Refresh size={14} /> Refresh
        </button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-luxe-gray">Pending Form-2 Submissions</h2>
              <p className="text-xs text-luxe-gray-400 mt-1">{total} profiles awaiting final approval</p>
            </div>
            <Icon className="text-gold-400" size={24} />
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
            <EmptyState title="No pending reviews" message="All Form-2 submissions have been reviewed." />
          )}
        </AdminCard>
      </motion.div>
    </div>
  );
};

export default Form2ReviewList;
