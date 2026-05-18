import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldHeart as ShieldHeart, FaWhatsapp as Whatsapp, FaClock as Clock, FaLock as Lock } from 'react-icons/fa6';
import api from '../../services/api';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { useAuth } from '../../hooks/useAuth';

export const PaymentScreen = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { updateProgress } = useOnboardingProgress();
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPaymentStatus();

    // Poll for payment status every 12 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get('/payment/status');
        const status = response.data.status;
        setPaymentStatus(status);
        
        if (status === 'verified') {
          await refreshUser();
          updateProgress({ paymentConfirmed: true });
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Payment polling error:', error);
      }
    }, 12000);

    return () => clearInterval(pollInterval);
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const response = await api.get('/payment/status');
      const status = response.data.status;
      setPaymentStatus(status);
      if (status === 'verified') {
        await refreshUser();
        updateProgress({ paymentConfirmed: true });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      alert('Please enter a valid Transaction Reference ID / Number.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        '/payment/verify',
        { transactionId: transactionId.trim() }
      );
      // Backend updates status to 'awaiting' pending manual review
      setPaymentStatus('awaiting');
      setIsLoading(false);
    } catch (error) {
      console.error('Payment verification error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          {paymentStatus === 'pending' && (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-400 text-sm mb-4">
                <ShieldHeart className="text-xs animate-pulse" />
                Payment Approval Instructions
              </div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">
                Your profile has been approved
              </h1>
              <p className="text-luxe-gray-400 max-w-xl mx-auto">
                Please complete the premium matchmaking payment using the details shared on WhatsApp. Enter your transaction details below to request unlock.
              </p>
            </>
          )}

          {paymentStatus === 'awaiting' && (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-sm mb-4">
                <Clock className="text-xs animate-spin-slow" />
                ⏳ Verification Pending Approval
              </div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-gold-500 mb-2">
                Payment Verification Pending
              </h1>
              <p className="text-luxe-gray-400 max-w-xl mx-auto">
                Our matchmaking team is verifying your payment details. Once verified, Form-2 (Marriage Details) will unlock automatically.
              </p>
            </>
          )}

          {paymentStatus === 'verified' && (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-sm mb-4">
                <ShieldHeart className="text-xs" />
                Payment Verified!
              </div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">
                ✅ Premium Unlock Complete
              </h1>
              <p className="text-luxe-gray-400 max-w-xl mx-auto">
                Your payment has been successfully confirmed. You can now complete your Marriage Details.
              </p>
            </>
          )}
        </motion.div>

        {paymentStatus === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-navy-900/60 border border-gold-500/10 rounded-2xl p-6 mb-8 max-w-xl mx-auto shadow-luxury">
            <label className="block text-xs uppercase tracking-widest text-gold-400 font-semibold mb-3">
              Transaction ID / Ref Number *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. UPI Ref: 412984572911..."
              className="w-full bg-navy-950/70 border border-gold-500/25 rounded-xl px-4 py-3.5 text-gold-200 placeholder-gold-500/25 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all font-mono mb-4 text-sm"
              disabled={isLoading}
            />
            <p className="text-[11px] text-luxe-gray-500 leading-relaxed">
              ⚠️ Entering an invalid or blank ID will delay approval. Please ensure it matches your payment confirmation slip.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-2xl border shadow-luxury transition-all duration-500 ${
            paymentStatus === 'verified'
              ? 'bg-green-500/10 border-green-500/30'
              : paymentStatus === 'awaiting'
              ? 'bg-yellow-500/5 border-yellow-500/20'
              : 'bg-navy-900/50 border-gold-500/20'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentStatus === 'verified'
                  ? 'bg-green-500/10 text-green-400'
                  : paymentStatus === 'awaiting'
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-gold-500/10 text-gold-400'
              }`}>
                {paymentStatus === 'verified' ? '✅' : <Clock className={paymentStatus === 'awaiting' ? 'animate-pulse' : ''} />}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-luxe-gray-100 font-playfair">Payment Verification</h2>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  paymentStatus === 'verified'
                    ? 'text-green-400'
                    : paymentStatus === 'awaiting'
                    ? 'text-yellow-400'
                    : 'text-luxe-gray-400'
                }`}>
                  {paymentStatus === 'verified' ? 'Verified' : paymentStatus === 'awaiting' ? 'Awaiting Approval' : 'Pending'}
                </p>
              </div>
            </div>
            <p className="text-sm text-luxe-gray-400 leading-relaxed">
              {paymentStatus === 'verified'
                ? 'Your premium access is confirmed. Form-2 is now fully unlocked.'
                : paymentStatus === 'awaiting'
                ? 'Moderators are verifying your payment against bank records. Please stay on this screen or return later.'
                : 'The support team will share payment details on WhatsApp. Once submitted, our team will verify.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gold-500/20 bg-navy-900/50 shadow-luxury">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400"><Lock /></div>
              <div>
                <h2 className="text-xl font-semibold text-luxe-gray-100 font-playfair">Dignity & Privacy</h2>
                <p className="text-sm text-luxe-gray-400">Secure Matchmaking Bureau</p>
              </div>
            </div>
            <p className="text-sm text-luxe-gray-400 leading-relaxed">
              No public or auto-debited payment gateways are used. Your transactions stay confidential, private, and managed by trusted family guides.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/app/dashboard')} className="btn-ghost flex-1">Back to Dashboard</button>
          {paymentStatus === 'pending' && (
            <button
              onClick={handleVerifyPayment}
              disabled={isLoading || !transactionId.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Whatsapp className="text-xs" />
              {isLoading ? 'Submitting...' : 'Submit Verification Request'}
            </button>
          )}
          {paymentStatus === 'awaiting' && (
            <button
              disabled
              className="w-full sm:flex-1 py-3 px-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock className="animate-spin-slow" />
              Pending Admin Review
            </button>
          )}
          {paymentStatus === 'verified' && (
            <button onClick={() => navigate('/app/marriage-details')} className="btn-primary flex-1">
              Continue to Form-2
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
