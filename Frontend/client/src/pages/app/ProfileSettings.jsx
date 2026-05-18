import { motion } from 'framer-motion';
import { FaUser as User, FaLock as Lock, FaBell as Bell, FaPen as Pen } from 'react-icons/fa6';


export const ProfileSettings = () => {
  const settings = [
    { label: 'Profile visibility', value: 'Private until approved', icon: Lock },
    { label: 'Notifications', value: 'SMS + email alerts enabled', icon: Bell },
    { label: 'Bio tone', value: 'Warm and values-focused', icon: Pen },
  ];

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">Profile Settings</h1>
            <p className="text-luxe-gray-400">Control how your profile is presented and what the team can see.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl border border-gold-500/20 bg-navy-900/50 shadow-luxury">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400">
                  <User />
                </div>
                <div>
                  <p className="text-luxe-gray-100 font-semibold">Identity</p>
                  <p className="text-sm text-luxe-gray-400">Profile visibility and presentation settings</p>
                </div>
              </div>

              <div className="space-y-4">
                {settings.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="p-4 rounded-xl border border-luxe-gray-700/30 bg-navy-950/60 flex items-start gap-3">
                      <Icon className="mt-1 text-gold-400" />
                      <div>
                        <p className="text-sm font-medium text-luxe-gray-100">{item.label}</p>
                        <p className="text-sm text-luxe-gray-400">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gold-500/20 bg-navy-900/50 shadow-luxury">
              <h2 className="text-lg font-semibold text-luxe-gray-100 mb-4">Trust Center</h2>
              <p className="text-sm text-luxe-gray-400 mb-4">Your data stays private. Only the verification team can see sensitive fields.</p>
              <button className="btn-primary w-full">Request Profile Update</button>
            </div>
          </div>
        </div>
      </div>
  );
};
