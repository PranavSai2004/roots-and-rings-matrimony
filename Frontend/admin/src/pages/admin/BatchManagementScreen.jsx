import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as Arrow, FaGift as Gift } from 'react-icons/fa6';
import { AdminCard, AdminTable, StatusBadge } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const formatTimeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
};

const getBatchStatus = (expiresAt) => {
  if (new Date(expiresAt) < new Date()) return 'expired';
  return 'active';
};

const formatExpiresIn = (expiresAt) => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''}`;
};

export const BatchManagementScreen = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await adminApi.get('/admin/batches');
      setBatches(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Batch ID' },
    { key: 'recipient', label: 'Recipient Mobile' },
    { key: 'created', label: 'Created' },
    { key: 'recipients', label: 'Profiles Shared' },
    { key: 'status', label: 'Status' },
    { key: 'expiresIn', label: 'Expires In' },
  ];

  const rows = batches.map(batch => ({
    id: batch._id,
    name: () => <span className="text-luxe-gray-300 font-mono text-xs">{batch._id.slice(-6).toUpperCase()}</span>,
    recipient: batch.recipientMobile || batch.recipientUserId?.mobile || 'Unknown',
    created: formatTimeAgo(batch.createdAt),
    recipients: batch.selectedProfileIds?.length || 0,
    status: () => <StatusBadge status={getBatchStatus(batch.expiresAt)} size="sm" />,
    expiresIn: formatExpiresIn(batch.expiresAt),
  }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Batch History</h1>
            <p className="text-luxe-gray-400">Monitor all shared profile batches</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/admin/batches/create')}
            className="px-4 py-2 rounded-lg bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Gift size={16} />
            Create Batch
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <AdminCard>
          {loading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full" /></div>
          ) : batches.length === 0 ? (
            <div className="py-12 text-center text-luxe-gray-500">No batches have been shared yet.</div>
          ) : (
            <AdminTable columns={columns} rows={rows} />
          )}
        </AdminCard>
      </motion.div>
    </div>
  );
};

export default BatchManagementScreen;
