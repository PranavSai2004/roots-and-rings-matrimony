import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCircleCheck as Verify, FaClock as Clock, FaRotateRight as Refresh } from 'react-icons/fa6';
import { AdminCard, AdminTable, StatusBadge, ConfirmationModal } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const PaymentQueueScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ transactionId: '', amount: '', paymentMethod: 'UPI' });
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/payment/pending');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const openVerifyModal = (user) => {
    setSelectedUser(user);
    setVerifyForm({
      transactionId: user.submittedTransactionId || '',
      amount: '2000', // Auto fill flat fee default of 2000 INR
      paymentMethod: 'UPI'
    });
    setShowConfirmation(true);
  };

  const handleVerifyPayment = async () => {
    const isCash = verifyForm.paymentMethod.toLowerCase() === 'cash';
    if (!verifyForm.amount || (!isCash && !verifyForm.transactionId)) {
      alert(isCash ? 'Amount is required' : 'Transaction ID and amount are required');
      return;
    }
    setVerifying(true);
    try {
      await adminApi.post(`/admin/payment/${selectedUser._id}/verify`, verifyForm);
      setSuccessMsg(`Payment verified for ${selectedUser.fullName || selectedUser.mobile}. Form-2 unlocked!`);
      setShowConfirmation(false);
      fetchQueue(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const columns = [
    { key: 'member', label: 'Member' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'txid', label: 'Submitted Ref' },
    { key: 'submitted', label: 'Approved On' },
    { key: 'status', label: 'Payment' },
    { key: 'action', label: 'Action' },
  ];

  const rows = users.map((u) => ({
    id: u._id,
    member: () => <span className="text-luxe-gray font-medium">{u.fullName || '—'}</span>,
    mobile: () => <span className="font-mono text-xs text-luxe-gray-400">{u.mobile}</span>,
    txid: () => u.submittedTransactionId ? (
      <span className="font-mono text-xs text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-md border border-gold-500/20">
        {u.submittedTransactionId}
      </span>
    ) : (
      <span className="text-xs text-luxe-gray-500 italic">No reference ID</span>
    ),
    submitted: formatDate(u.createdAt),
    status: () => <StatusBadge status={u.paymentStatus || 'pending'} size="sm" />,
    action: () => (
      <button
        onClick={() => openVerifyModal(u)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30 text-xs font-semibold transition-all"
      >
        <Verify size={12} /> Verify Payment
      </button>
    ),
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-playfair text-luxe-gray mb-1">Payment Verification</h1>
          <p className="text-luxe-gray-400 text-sm">Approve-verified users awaiting payment → Form-2 unlock</p>
        </div>
        <button onClick={fetchQueue} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-gold-400 hover:bg-gold-500/10 text-sm transition-all">
          <Refresh size={14} /> Refresh
        </button>
      </motion.div>

      {successMsg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✅ {successMsg}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-luxe-gray">Payment Queue</h2>
              <p className="text-xs text-luxe-gray-400 mt-1">{users.length} profiles awaiting payment verification</p>
            </div>
            <Clock className="text-gold-400" size={22} />
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
            <div className="text-center py-12 text-luxe-gray-400 text-sm">
              ✅ No profiles awaiting payment verification
            </div>
          )}
        </AdminCard>
      </motion.div>

      {/* Verify Payment Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy-900 border border-gold-500/20 rounded-2xl p-8 max-w-md w-full shadow-luxury-lg"
          >
            <h3 className="text-xl font-playfair text-luxe-gray mb-1">Verify Payment</h3>
            <p className="text-xs text-luxe-gray-400 mb-6">
              For: <span className="text-gold-400">{selectedUser?.fullName || selectedUser?.mobile}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-luxe-gray-400 mb-1">
                  Transaction ID {verifyForm.paymentMethod.toLowerCase() !== 'cash' && '*'}
                </label>
                <input
                  value={verifyForm.transactionId}
                  onChange={(e) => setVerifyForm(p => ({ ...p, transactionId: e.target.value }))}
                  placeholder="UPI/Transaction reference"
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray text-sm focus:outline-none focus:border-gold-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-luxe-gray-400 mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  value={verifyForm.amount}
                  onChange={(e) => setVerifyForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 8500"
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray text-sm focus:outline-none focus:border-gold-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-luxe-gray-400 mb-1">Payment Method</label>
                <select
                  value={verifyForm.paymentMethod}
                  onChange={(e) => setVerifyForm(p => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-4 py-2.5 text-luxe-gray text-sm focus:outline-none"
                >
                  {['UPI', 'NEFT', 'IMPS', 'Cash', 'Other'].map(m => (
                    <option key={m} value={m} className="bg-navy-900">{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gold-500/20 text-luxe-gray-400 hover:text-luxe-gray text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPayment}
                disabled={verifying}
                className="flex-1 px-4 py-2.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-semibold text-sm transition-all disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : '✓ Confirm Payment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PaymentQueueScreen;
