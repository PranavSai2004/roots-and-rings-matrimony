import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart as Heart, FaRotateRight as Refresh } from 'react-icons/fa6';
import {
  AdminCard,
  AdminTable,
  StatusBadge,
  EmptyState,
} from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const InterestTrackingScreen = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInterests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/interests?limit=100');
      setInterests(res.data.data || []);
      setTotal(res.data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterests(); }, []);

  const filteredInterests = React.useMemo(() => {
    return interests.filter((i) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesFrom =
          i.recipientUserId?.fullName?.toLowerCase().includes(query) ||
          i.recipientUserId?.mobile?.includes(query);
        const matchesTo =
          i.targetProfileId?.name?.toLowerCase().includes(query) ||
          i.targetProfileId?.city?.toLowerCase().includes(query);
        if (!matchesFrom && !matchesTo) return false;
      }
      if (statusFilter) {
        if (i.interestStatus !== statusFilter) return false;
      }
      return true;
    });
  }, [interests, searchQuery, statusFilter]);

  const columns = [
    { key: 'fromMember', label: 'Interested User (From)' },
    { key: 'toMember', label: 'Target Profile (To)' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date Recorded' },
    { key: 'action', label: 'Action' },
  ];

  const rows = filteredInterests.map((i) => ({
    id: i._id,
    fromMember: () => (
      <div>
        <p className="text-luxe-gray font-medium text-sm">{i.recipientUserId?.fullName || 'Unknown'}</p>
        <p className="text-xs text-luxe-gray-400 mt-0.5">{i.recipientUserId?.mobile || '—'}</p>
      </div>
    ),
    toMember: () => (
      <div>
        <p className="text-luxe-gray font-medium text-sm">{i.targetProfileId?.name || 'Unknown'}</p>
        <p className="text-xs text-luxe-gray-400 mt-0.5">{i.targetProfileId?.city || 'Unknown'}</p>
      </div>
    ),
    status: () => <StatusBadge status={i.interestStatus || 'pending'} size="sm" />,
    date: formatDate(i.createdAt),
    action: () => (
      <button
        onClick={() => navigate(`/admin/interests/${i._id}`, { state: { interest: i } })}
        className="text-gold-400 hover:text-gold-300 font-medium text-sm transition-colors"
      >
        View Details
      </button>
    ),
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair text-luxe-gray mb-1">Interest Tracking (CRM)</h1>
          <p className="text-luxe-gray-400 text-sm">Monitor and manage member interests and responses</p>
        </div>
        <button
          onClick={fetchInterests}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-gold-400 hover:bg-gold-500/10 text-sm transition-all"
        >
          <Refresh size={14} /> Refresh
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Interests', value: total, color: 'text-luxe-gray' },
          { label: 'Pending', value: interests.filter(i => i.interestStatus === 'pending').length, color: 'text-yellow-400' },
          { label: 'Contacted', value: interests.filter(i => i.interestStatus === 'contacted').length, color: 'text-blue-400' },
          { label: 'Meeting Scheduled', value: interests.filter(i => i.interestStatus === 'meeting_scheduled').length, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl border border-gold-500/10 bg-navy-900/40">
            <p className="text-xs text-luxe-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Filter Panel */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <AdminCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="🔍 Search by Interested User (Name, Mobile) or Target Candidate (Name, City)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-4 py-2.5 text-sm text-luxe-gray placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-3 py-2.5 text-sm text-luxe-gray cursor-pointer focus:outline-none focus:border-gold-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="meeting_scheduled">Meeting Scheduled</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold underline underline-offset-4 shrink-0 transition-all"
            >
              Reset Filters
            </button>
          )}
        </AdminCard>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AdminCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-luxe-gray">Interest Pipeline</h2>
            <Heart className="text-gold-400" size={24} />
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
            <EmptyState title="No interests found" message="No members have recorded interests yet." />
          )}
        </AdminCard>
      </motion.div>
    </div>
  );
};

export default InterestTrackingScreen;
