import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers as Users, FaMagnifyingGlass as Search, FaArrowRight as Arrow, FaCircleCheck as Check, FaClock as Clock, FaXmark as X, FaHeart } from 'react-icons/fa6';
import api from '../../services/adminApi';
import { StatusBadge } from '../../components/admin/shared/AdminComponents';

const statusColor = (status) => {
  if (status === 'approved') return 'text-green-400';
  if (status === 'rejected' || status === 'changes_requested') return 'text-red-400';
  return 'text-yellow-400';
};

const getStageBadge = (step, accountStatus) => {
  if (accountStatus === 'matched') {
    return { label: 'Matched 💍', className: 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 font-bold' };
  }
  switch (step) {
    case 0:
      return { label: 'Registered', className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
    case 1:
      return { label: 'Form 1 Done', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    case 2:
      return { label: 'Photos Done', className: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' };
    case 3:
      return { label: 'Payment Done', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    case 4:
      return { label: 'Form 2 Done', className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
    default:
      return { label: `Step ${step || 0}`, className: 'bg-gold-500/10 text-gold-400 border border-gold-500/20' };
  }
};

export const MemberDirectoryScreen = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMembers();
  }, [page]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/members?page=${page}&limit=20`);
      setMembers(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/members/${userId}/status`, { accountStatus: newStatus });
      setMembers(prev => prev.map(m => {
        if (m._id === userId) {
          return { ...m, accountStatus: newStatus };
        }
        return m;
      }));
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update member status');
    }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.fullName?.toLowerCase().includes(search.toLowerCase()) || m.mobile?.includes(search) || m.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'matched' && m.accountStatus === 'matched') ||
      (filterStatus === 'approved' && m.form1ReviewStatus === 'approved' && m.photosReviewStatus === 'approved' && m.accountStatus !== 'matched') ||
      (filterStatus === 'pending' && (m.form1ReviewStatus === 'pending_review' || m.photosReviewStatus === 'pending_review') && m.accountStatus !== 'matched') ||
      (filterStatus === 'rejected' && (m.form1ReviewStatus === 'rejected' || m.form1ReviewStatus === 'changes_requested') && m.accountStatus !== 'matched');
    return matchSearch && matchStatus;
  });

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 xl:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Admin</p>
          <h1 className="text-3xl font-playfair text-luxe-gray">Member Directory</h1>
          <p className="text-luxe-gray-400 text-sm mt-1">All registered users and their current pipeline status</p>
        </div>
        <div className="flex items-center gap-2 text-luxe-gray-400 text-sm">
          <Users size={16} />
          <span>{members.length} members on this page</span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxe-gray-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-navy-900/50 border border-gold-500/20 rounded-lg text-sm text-luxe-gray placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'approved', 'pending', 'rejected', 'matched'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all capitalize ${filterStatus === s ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'border border-gold-500/10 text-luxe-gray-400 hover:border-gold-500/20'}`}
            >
              {s === 'matched' ? '💍 matched' : s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-navy-900/50 border border-gold-500/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-luxe-gray-400 py-16">No members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-500/10 text-sm font-bold uppercase tracking-widest text-gold-400 bg-gold-500/5">
                  <th className="px-6 py-4.5 text-left">Member</th>
                  <th className="px-6 py-4.5 text-left">Mobile</th>
                  <th className="px-6 py-4.5 text-left">City</th>
                  <th className="px-6 py-4.5 text-left">Stage</th>
                  <th className="px-6 py-4.5 text-left">Form 1</th>
                  <th className="px-6 py-4.5 text-left">Photos</th>
                  <th className="px-6 py-4.5 text-left">Payment</th>
                  <th className="px-6 py-4.5 text-left">Form 2</th>
                  <th className="px-6 py-4.5 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/5">
                {filtered.map((m, idx) => (
                  <motion.tr
                    key={m._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-gold-500/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-luxe-gray-100">{m.fullName}</p>
                          {m.adminNotes && (
                            <span 
                              title={m.adminNotes}
                              className="px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 text-[10px] font-semibold border border-gold-500/20 cursor-help"
                            >
                              📝 Note
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-luxe-gray-400 mt-0.5">{m.gender}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[15px] font-semibold text-luxe-gray-200 font-mono tracking-wide">{m.mobile}</td>
                    <td className="px-6 py-4 text-[15px] font-medium text-luxe-gray-200">{m.city}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const badge = getStageBadge(m.registrationStep, m.accountStatus);
                        return (
                          <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold tracking-wide ${statusColor(m.form1ReviewStatus)}`}>
                      {m.form1ReviewStatus?.replace('_', ' ')}
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold tracking-wide ${statusColor(m.photosReviewStatus)}`}>
                      {m.photosReviewStatus?.replace('_', ' ')}
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold tracking-wide ${m.paymentStatus === 'confirmed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {m.paymentStatus}
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold tracking-wide ${statusColor(m.form2ReviewStatus)}`}>
                      {m.form2ReviewStatus?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            navigate(`/admin/profile/${m._id}`);
                          }}
                          className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 text-sm font-bold transition-colors"
                        >
                          View <Arrow size={14} />
                        </button>
                        {m.accountStatus === 'matched' ? (
                          <button
                            onClick={() => handleStatusChange(m._id, 'active')}
                            className="flex items-center gap-1 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-300 text-xs font-semibold px-2 py-0.5 rounded border border-slate-500/20 transition-all cursor-pointer"
                            title="Revert back to Active status"
                          >
                            Revert
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(m._id, 'matched')}
                            className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                            title="Mark this member as matched"
                          >
                            <FaHeart size={9} className="text-pink-400 animate-pulse" /> Matched
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-gold-500/20 text-gold-400 text-sm disabled:opacity-40 hover:bg-gold-500/10 transition-all">Prev</button>
          <span className="text-sm text-luxe-gray-400">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-gold-500/20 text-gold-400 text-sm disabled:opacity-40 hover:bg-gold-500/10 transition-all">Next</button>
        </div>
      )}
    </div>
  );
};

export default MemberDirectoryScreen;
