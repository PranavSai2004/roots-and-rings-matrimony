import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"></div>
      </div>

          <div className="relative z-10 w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          {/* Brand header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Roots & Rings
              </span>
            </h1>
            <p className="text-luxe-gray-400 text-sm mt-2">Premium Matrimony Platform</p>
          </div>

          {/* Content */}
          <div className="bg-navy-900/50 backdrop-blur-xl border border-gold-500/10 rounded-xl p-8 shadow-2xl">
            {children || <Outlet />}
          </div>

          {/* Footer text */}
          <p className="text-center text-luxe-gray-500 text-xs mt-8">
            We respect your privacy. Your data is secure and encrypted.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
