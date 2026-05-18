import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaCheck as Check, FaArrowRight as ArrowRight, FaLockOpen as LockOpen, FaClock as Clock } from 'react-icons/fa6';
import axios from 'axios';


export const Form2UnlockScreen = () => {
  const navigate = useNavigate();
  const [form2Status, setForm2Status] = useState('pending'); // pending, approved, rejected
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Poll for Form-2 review status every 10 seconds
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          import.meta.env.VITE_API_BASE_URL + '/profile/form2/review-status',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setForm2Status(response.data.status);
        if (response.data.feedback) {
          setFeedback(response.data.feedback);
        }

        // Stop polling if status changes
        if (response.data.status !== 'pending') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Form-2 polling error:', error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {form2Status === 'pending' && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-luxury animate-spin">
                  <Clock className="text-3xl" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-yellow-400 mb-3">
                  ⏳ Form-2 Under Review
                </h1>
                <p className="text-luxe-gray-400 max-w-2xl mx-auto">
                  Your marriage details form is being reviewed. We'll notify you once it's approved.
                </p>
              </motion.div>
            </>
          )}

          {form2Status === 'approved' && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400 shadow-luxury">
                  <Check className="text-3xl" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-sm mb-4">
                  <LockOpen className="text-xs" />
                  Form-2 Approved!
                </div>
                <h1 className="text-3xl font-bold text-green-400 mb-3">
                  ✅ Your Profile is Complete!
                </h1>
                <p className="text-luxe-gray-400 max-w-2xl mx-auto">
                  Congratulations! Your profile has been fully verified and you're now eligible for matches.
                </p>
              </motion.div>
            </>
          )}

          {form2Status === 'rejected' && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 flex justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-luxury">
                  <Clock className="text-3xl" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-red-400 mb-3">
                  ⚠️ Changes Requested
                </h1>
                {feedback && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                    <p className="text-red-300">{feedback}</p>
                  </div>
                )}
                <p className="text-luxe-gray-400 max-w-2xl mx-auto">
                  Please review the feedback and re-submit your marriage details.
                </p>
              </motion.div>
            </>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/app/dashboard')} className="btn-ghost flex-1 sm:flex-none sm:px-8">
              Back to Dashboard
            </button>
            {form2Status === 'approved' && (
              <button onClick={() => navigate('/app/dashboard')} className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none sm:px-8">
                View Matches
                <ArrowRight className="text-xs" />
              </button>
            )}
            {form2Status === 'rejected' && (
              <button onClick={() => navigate('/app/form-2')} className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none sm:px-8">
                Re-submit Form-2
                <ArrowRight className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>
  );
};
