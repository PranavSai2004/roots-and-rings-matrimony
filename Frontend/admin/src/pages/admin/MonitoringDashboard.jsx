import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock as Clock, FaUsers as Users, FaFileSignature as Form, FaGift as Batch, FaHeart as Heart, FaUserCheck as UserCheck } from 'react-icons/fa6';
import { AdminCard } from '../../components/admin/shared/AdminComponents';
import adminApi from '../../services/adminApi';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-6 rounded-xl border border-gold-500/10 bg-navy-900/40 hover:bg-gold-500/5 transition-all`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-luxe-gray-400 uppercase tracking-widest font-semibold">{title}</p>
        <p className="text-3xl font-bold mt-2 text-luxe-gray">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={20} className={color.replace('bg-', 'text-').replace('/10', '')} />
      </div>
    </div>
  </motion.div>
);

const formatExpiresIn = (expiresAt) => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h`;
};

export const MonitoringDashboard = () => {
  const [stats, setStats] = useState(null);
  const [expiringShares, setExpiringShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, sharesRes] = await Promise.all([
          adminApi.get('/admin/stats'),
          adminApi.get('/admin/stats/expiring')
        ]);
        
        setStats(statsRes.data.stats);
        setExpiringShares(sharesRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Analytics & Monitoring</h1>
        <p className="text-luxe-gray-400">Platform overview and real-time alerts</p>
      </motion.div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full" /></div>
      ) : (
        <>
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Registrations" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-500/20 text-blue-400" delay={0.1} />
            <StatCard title="Approved Profiles" value={stats?.approvedUsers || 0} icon={UserCheck} color="bg-green-500/20 text-green-400" delay={0.2} />
            <StatCard title="Pending Reviews" value={stats?.pendingReviews || 0} icon={Form} color="bg-yellow-500/20 text-yellow-400" delay={0.3} />
            <StatCard title="Total Batches Shared" value={stats?.totalBatches || 0} icon={Batch} color="bg-purple-500/20 text-purple-400" delay={0.4} />
            <StatCard title="Active Shares" value={stats?.activeBatches || 0} icon={Clock} color="bg-cyan-500/20 text-cyan-400" delay={0.5} />
            <StatCard title="Interests Recorded" value={stats?.totalInterests || 0} icon={Heart} color="bg-rose-500/20 text-rose-400" delay={0.6} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <AdminCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-luxe-gray">Expiring Shares (Next 48h)</h2>
                  <Clock className="text-yellow-400" size={20} />
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {expiringShares.length === 0 ? (
                    <div className="text-center py-8 text-luxe-gray-500">No shares expiring soon.</div>
                  ) : (
                    expiringShares.map((share) => (
                      <div
                        key={share._id}
                        className="p-4 rounded-lg border border-gold-500/10 bg-navy-950/50 hover:border-gold-500/30 transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="text-luxe-gray font-medium text-sm">Target: <span className="text-gold-400">{share.fromMember}</span></p>
                          <p className="text-xs text-luxe-gray-400 mt-1">Shared to: {share.toMember}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold whitespace-nowrap">
                          <Clock size={12} />
                          {formatExpiresIn(share.expiresAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AdminCard>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                 <AdminCard>
                 <h2 className="text-xl font-semibold text-luxe-gray mb-6">System Health & Metrics</h2>
                 <div className="space-y-6">
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-luxe-gray-400">Profile Approval Rate</span>
                       <span className="text-green-400">{stats?.totalUsers ? Math.round((stats.approvedUsers / stats.totalUsers) * 100) : 0}%</span>
                     </div>
                     <div className="w-full bg-navy-950 rounded-full h-2">
                       <div className="bg-green-400 h-2 rounded-full" style={{ width: `${stats?.totalUsers ? Math.round((stats.approvedUsers / stats.totalUsers) * 100) : 0}%` }}></div>
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-luxe-gray-400">Pending Review Load</span>
                       <span className="text-gold-400">{stats?.totalUsers ? Math.round((stats.pendingReviews / stats.totalUsers) * 100) : 0}%</span>
                     </div>
                     <div className="w-full bg-navy-950 rounded-full h-2">
                       <div className="bg-gold-400 h-2 rounded-full" style={{ width: `${stats?.totalUsers ? Math.round((stats.pendingReviews / stats.totalUsers) * 100) : 0}%` }}></div>
                     </div>
                   </div>

                   <div className="pt-6 mt-6 border-t border-gold-500/10">
                     <p className="text-sm text-luxe-gray-400 mb-4">Background Jobs</p>
                     <div className="flex items-center justify-between p-3 rounded bg-navy-950/50 border border-gold-500/10">
                       <span className="text-sm text-luxe-gray">Auto-Expiry Cron Job</span>
                       <span className="flex items-center gap-2 text-xs text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Active</span>
                     </div>
                   </div>
                 </div>
               </AdminCard>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonitoringDashboard;
