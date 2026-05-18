import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck as CheckCircle, FaArrowRight as ArrowRight, FaStar as Sparkles } from 'react-icons/fa6';


export const FinalReviewScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-luxury">
              <CheckCircle className="text-3xl" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-400 text-sm mb-4">
              <Sparkles className="text-xs" />
              Final review in progress
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-3">
              Your complete profile is under final review
            </h1>
            <p className="text-luxe-gray-400 max-w-2xl mx-auto">
              You will start receiving curated profile matches soon. Our team is preparing your invitation-only profile access.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {[
              { title: 'Verification', text: 'Your profile and documents are being finalized.' },
              { title: 'Curated Matches', text: 'We will share handpicked profiles privately.' },
              { title: 'Next Step', text: 'Stay tuned for your first invitation bundle.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border border-gold-500/20 bg-navy-900/50 shadow-luxury">
                <p className="text-gold-400 font-semibold mb-2">{item.title}</p>
                <p className="text-sm text-luxe-gray-400">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/app/dashboard')} className="btn-ghost flex-1 sm:flex-none sm:px-8">
              Return to Dashboard
            </button>
            <button onClick={() => navigate('/app/shared-profiles')} className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none sm:px-8">
              View Shared Profiles
              <ArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
  );
};
