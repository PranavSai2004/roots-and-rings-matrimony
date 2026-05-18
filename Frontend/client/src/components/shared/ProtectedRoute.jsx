import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (!isAuthenticated) return <AccessGate />;

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Wait for auth state to hydrate

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

const AccessGate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-[2rem] border border-gold-500/15 bg-navy-900/70 backdrop-blur-xl shadow-luxury p-8 md:p-10 text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-gold-400">Private access</p>
        <h1 className="mt-4 font-playfair text-4xl text-luxe-gray">This area is for verified families only.</h1>
        <p className="mt-4 text-luxe-gray-dark leading-relaxed">
          Please sign in to continue to your private dashboard, profile steps, and curated matches.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth/login')}
            className="btn-primary"
          >
            Continue to Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="btn-ghost"
          >
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
