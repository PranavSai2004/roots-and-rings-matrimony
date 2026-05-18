import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminCard } from '../../components/admin/shared/AdminComponents';
import { useAdmin } from '../../hooks/useAdmin'; // Use admin hook to get email

export const AdminSettingsScreen = () => {
  const { admin } = useAdmin();
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableAutoApproval: false,
    enableBatchReminder: true,
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccessMsg(''); // Clear success msg on change
  };

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-playfair text-luxe-gray mb-2">Admin Settings</h1>
        <p className="text-luxe-gray-400">Configure admin panel preferences and system settings</p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AdminCard>
          <h2 className="text-lg font-semibold text-luxe-gray mb-6">Profile Details</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-gold-500/10">
              <p className="font-medium text-luxe-gray">Admin Name</p>
              <p className="text-sm text-gold-400 mt-2">{admin?.fullName || 'Super Admin'}</p>
            </div>
            <div className="p-4 rounded-lg border border-gold-500/10">
              <p className="font-medium text-luxe-gray">Email</p>
              <p className="text-sm text-gold-400 mt-2">{admin?.email || 'admin@rootsandrings.com'}</p>
            </div>
          </div>
        </AdminCard>
      </motion.div>

      {/* Notification Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <AdminCard>
          <h2 className="text-lg font-semibold text-luxe-gray mb-6">Notification & Automation</h2>
          <div className="space-y-4">
            {[
              { key: 'enableNotifications', label: 'New Profile Alerts', description: 'Receive alerts when users complete Form-1' },
              { key: 'enableAutoApproval', label: 'Auto-Approval (Beta)', description: 'Automatically approve complete profiles (not recommended)' },
              { key: 'enableBatchReminder', label: 'Batch Expiry Reminders', description: 'Show alerts before sent batches expire' },
            ].map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between p-4 rounded-lg border border-gold-500/10 hover:bg-gold-500/5 transition-all"
              >
                <div>
                  <p className="font-medium text-luxe-gray">{setting.label}</p>
                  <p className="text-xs text-luxe-gray-400 mt-1">{setting.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(setting.key)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings[setting.key] ? 'bg-gold-500/30' : 'bg-navy-800'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-gold-400 transition-all ${
                      settings[setting.key] ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </AdminCard>
      </motion.div>

      {/* System Configurations (Read Only) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <AdminCard>
          <h2 className="text-lg font-semibold text-luxe-gray mb-6">System Configurations (Fixed)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-navy-950/50 border border-gold-500/10">
              <p className="font-medium text-luxe-gray text-sm">Batch Share Expiry Time</p>
              <p className="text-xs text-gold-400 mt-2">24 Hours</p>
              <p className="text-[10px] text-luxe-gray-500 mt-1">Managed by Backend Cron Job</p>
            </div>
            <div className="p-4 rounded-lg bg-navy-950/50 border border-gold-500/10">
              <p className="font-medium text-luxe-gray text-sm">Storage Protocol</p>
              <p className="text-xs text-gold-400 mt-2">AWS S3 Integration</p>
              <p className="text-[10px] text-luxe-gray-500 mt-1">Images are compressed on upload</p>
            </div>
          </div>
        </AdminCard>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center">
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-green-400 text-sm font-medium">
            ✅ {successMsg}
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          className="w-full px-6 py-4 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 hover:bg-gold-500/30 font-semibold transition-all shadow-luxury"
        >
          Save Preferences
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AdminSettingsScreen;
