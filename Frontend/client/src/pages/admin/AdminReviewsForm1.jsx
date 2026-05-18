import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck as Check, FaX as X, FaClock as Clock, FaMessage as Message, FaStar as Star } from 'react-icons/fa6';
import axios from 'axios';


export const AdminReviewsForm1 = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        import.meta.env.VITE_API_BASE_URL + '/admin/reviews/pending',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      alert(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing('approve');
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `\${import.meta.env.VITE_API_BASE_URL}/admin/reviews/${selectedReview._id}/approve`,
        { adminNotes: feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from list
      setReviews(reviews.filter(r => r._id !== selectedReview._id));
      setSelectedReview(null);
      setFeedback('');
      alert('✅ Profile approved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide rejection reason');
      return;
    }

    try {
      setProcessing('reject');
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `\${import.meta.env.VITE_API_BASE_URL}/admin/reviews/${selectedReview._id}/reject`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews(reviews.filter(r => r._id !== selectedReview._id));
      setSelectedReview(null);
      setFeedback('');
      alert('❌ Profile rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for changes');
      return;
    }

    try {
      setProcessing('changes');
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `\${import.meta.env.VITE_API_BASE_URL}/admin/reviews/${selectedReview._id}/request-changes`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews(reviews.filter(r => r._id !== selectedReview._id));
      setSelectedReview(null);
      setFeedback('');
      alert('📝 Changes requested');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request changes');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">
            Form-1 Profile Reviews
          </h1>
          <p className="text-luxe-gray-400">
            {reviews.length} pending reviews waiting for approval
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <Clock className="text-gold-400 text-5xl animate-spin mx-auto mb-4" />
                <p className="text-luxe-gray-400">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 p-4 rounded-xl border border-gold-500/20 bg-gold-500/5">
                <Check className="text-5xl text-gold-400 mx-auto mb-3" />
                <p className="text-xl font-semibold text-luxe-gray-300">All Caught Up!</p>
                <p className="text-luxe-gray-400">No pending Form-1 reviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedReview(review)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReview?._id === review._id
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-gold-500/20 bg-navy-900/50 hover:bg-navy-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-luxe-gray-100">
                          {review.firstName} {review.lastName}
                        </h3>
                        <p className="text-sm text-luxe-gray-400">
                          {review.age} • {review.location}
                        </p>
                        <p className="text-xs text-gold-400 mt-1">
                          {review.occupation}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`text-sm ${
                                i < (review.rating || 3)
                                  ? 'text-gold-400 fill-gold-400'
                                  : 'text-luxe-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-luxe-gray-500">
                          Submitted {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Review Details & Actions */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedReview ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-6 rounded-xl border border-gold-500/20 bg-navy-900/50 shadow-luxury"
                >
                  {/* Profile Summary */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-luxe-gray-100 mb-4">
                      {selectedReview.firstName} {selectedReview.lastName}
                    </h2>
                    <div className="space-y-2 text-sm text-luxe-gray-400">
                      <p>📍 <span className="text-luxe-gray-300">{selectedReview.location}</span></p>
                      <p>🎓 <span className="text-luxe-gray-300">{selectedReview.education}</span></p>
                      <p>💼 <span className="text-luxe-gray-300">{selectedReview.occupation}</span></p>
                      <p>⛩️ <span className="text-luxe-gray-300">{selectedReview.religion}</span></p>
                      <p>📋 <span className="text-luxe-gray-300">{selectedReview.caste}</span></p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6 pb-6 border-b border-gold-500/10">
                    <p className="text-xs font-semibold text-gold-400 mb-2">BIO</p>
                    <p className="text-sm text-luxe-gray-400">{selectedReview.bio}</p>
                  </div>

                  {/* Feedback Area */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gold-400 mb-2">
                      ADMIN NOTES
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add notes or reasons for decision..."
                      rows="4"
                      className="w-full bg-navy-950 border border-gold-500/20 rounded-lg px-3 py-2 text-sm text-luxe-gray-100 placeholder-luxe-gray-500 focus:outline-none focus:border-gold-500/50"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApprove}
                      disabled={processing}
                      className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {processing === 'approve' ? (
                        <Clock className="animate-spin text-sm" />
                      ) : (
                        <Check className="text-sm" />
                      )}
                      Approve
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRequestChanges}
                      disabled={processing || !feedback.trim()}
                      className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {processing === 'changes' ? (
                        <Clock className="animate-spin text-sm" />
                      ) : (
                        <Message className="text-sm" />
                      )}
                      Request Changes
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReject}
                      disabled={processing || !feedback.trim()}
                      className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {processing === 'reject' ? (
                        <Clock className="animate-spin text-sm" />
                      ) : (
                        <X className="text-sm" />
                      )}
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-6 rounded-xl border border-gold-500/20 bg-navy-900/30 text-center"
                >
                  <p className="text-luxe-gray-400">👆 Select a profile to review</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
