import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMagnifyingGlass as Search, FaFilter as Filter, FaEye as Eye, FaRotateRight as Refresh } from 'react-icons/fa6';
import { AdminCard, AdminTable, StatusBadge } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const PaymentHistoryScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const res = await adminApi.get(`/admin/payment/history?${params.toString()}`);
      setPayments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, fromDate, toDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const columns = [
    { key: 'member', label: 'Member' },
    { key: 'transactionId', label: 'Transaction ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Method' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const rows = payments.map((p) => ({
    id: p._id,
    member: () => (
      <div>
        <p className="text-luxe-gray font-medium">{p.userFullName}</p>
        <p className="text-xs text-luxe-gray-400">{p.userId?.mobile}</p>
      </div>
    ),
    transactionId: () => <span className="font-mono text-xs text-gold-400">{p.transactionId}</span>,
    amount: `₹${p.paymentAmount?.toLocaleString() || 0}`,
    method: p.paymentMethod,
    date: formatDate(p.paymentDate),
    status: () => <StatusBadge status={p.paymentStatus || 'pending'} size="sm" />,
    action: () => (
      <button
        onClick={() => setSelectedPayment(p)}
        className="text-gold-400 hover:text-gold-300 transition-all flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-lg text-xs font-medium"
      >
        <Eye size={12} /> View Details
      </button>
    ),
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-luxe-gray mb-1">Payment History</h1>
          <p className="text-luxe-gray-400 text-sm">Comprehensive track of all client transactions</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminCard>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-luxe-gray-400 mb-1">Search User / Txn ID</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, Mobile, or Txn ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-navy-950/50 border border-gold-500/20 rounded-lg text-sm text-luxe-gray focus:outline-none focus:border-gold-500/50"
                />
                <Search className="absolute left-3 top-2.5 text-luxe-gray-400" size={14} />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-luxe-gray-400 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-navy-950/50 border border-gold-500/20 rounded-lg text-sm text-luxe-gray focus:outline-none focus:border-gold-500/50"
              >
                <option value="" className="bg-navy-900">All Statuses</option>
                <option value="pending" className="bg-navy-900">Pending</option>
                <option value="verified" className="bg-navy-900">Verified</option>
                <option value="rejected" className="bg-navy-900">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-luxe-gray-400 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 bg-navy-950/50 border border-gold-500/20 rounded-lg text-sm text-luxe-gray focus:outline-none focus:border-gold-500/50"
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-luxe-gray-400 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 bg-navy-950/50 border border-gold-500/20 rounded-lg text-sm text-luxe-gray focus:outline-none focus:border-gold-500/50"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-lg hover:bg-gold-500/30 transition-all h-[38px] flex items-center justify-center">
                <Search size={14} />
              </button>
            </div>
          </form>
        </AdminCard>
      </motion.div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-luxe-gray">Transactions</h2>
            <button onClick={fetchHistory} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gold-500/10 text-gold-400 text-xs font-medium hover:bg-gold-500/20 transition-all">
              <Refresh size={12} /> Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-8 text-red-400 text-sm">{error}</div>
          ) : rows.length > 0 ? (
            <AdminTable columns={columns} rows={rows} />
          ) : (
            <div className="text-center py-12 text-luxe-gray-400 text-sm">No payment records found</div>
          )}
        </AdminCard>
      </motion.div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="bg-navy-900 border-l border-gold-500/20 w-full max-w-md h-full shadow-luxury-lg overflow-y-auto"
          >
            <div className="p-6 sticky top-0 bg-navy-900/90 backdrop-blur border-b border-gold-500/10 flex justify-between items-center">
              <h3 className="text-xl font-playfair text-luxe-gray">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-luxe-gray-400 hover:text-white transition-colors text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gold-500/10">
                <div>
                  <p className="text-2xl font-bold text-gold-400">₹{selectedPayment.paymentAmount?.toLocaleString()}</p>
                  <p className="text-sm text-luxe-gray-400">Transaction Amount</p>
                </div>
                <StatusBadge status={selectedPayment.paymentStatus || 'pending'} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-luxe-gray-400">Client Name</p>
                  <p className="text-sm text-luxe-gray">{selectedPayment.userFullName}</p>
                </div>
                <div>
                  <p className="text-xs text-luxe-gray-400">Client Mobile</p>
                  <p className="text-sm text-luxe-gray">{selectedPayment.userId?.mobile}</p>
                </div>
                <div>
                  <p className="text-xs text-luxe-gray-400">Transaction ID</p>
                  <p className="text-sm font-mono text-gold-400 break-all">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-luxe-gray-400">Method</p>
                  <p className="text-sm text-luxe-gray">{selectedPayment.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-luxe-gray-400">Payment Date</p>
                  <p className="text-sm text-luxe-gray">{formatDate(selectedPayment.paymentDate)}</p>
                </div>
              </div>

              <div className="p-4 bg-navy-950/50 rounded-xl border border-gold-500/10">
                <p className="text-xs text-luxe-gray-400 mb-2">Proof of Payment</p>
                {selectedPayment.proofUrl === 'manual_verification' ? (
                  <p className="text-sm text-gold-400">Verified Manually via Admin Panel</p>
                ) : (
                  <a href={selectedPayment.proofUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline break-all">
                    View Uploaded Proof
                  </a>
                )}
              </div>

              {selectedPayment.verifiedByAdmin && (
                <div className="pt-4 border-t border-gold-500/10">
                  <p className="text-xs text-luxe-gray-400">Verified By</p>
                  <p className="text-sm text-luxe-gray">{selectedPayment.verifiedByAdmin?.fullName} ({selectedPayment.verifiedByAdmin?.email})</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gold-500/10">
                <p className="text-xs text-luxe-gray-400">Admin Remarks</p>
                <p className="text-sm text-luxe-gray whitespace-pre-wrap">{selectedPayment.remarks || 'No remarks provided.'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryScreen;
