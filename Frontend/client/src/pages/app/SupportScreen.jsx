import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWhatsapp as Whatsapp, 
  FaPhone as Phone, 
  FaEnvelope as Envelope, 
  FaChevronDown as ChevronDown,
  FaChevronUp as ChevronUp,
  FaCircleQuestion as Question
} from 'react-icons/fa6';

export const SupportScreen = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [copied, setCopied] = useState(false);

  const faqs = [
    {
      q: "How long does my profile approval take?",
      a: "Our verification team manually audits every profile to maintain the highest quality registry. Verification is typically completed within 2 to 4 hours of completing your photo uploads."
    },
    {
      q: "Who is allowed to view my photos?",
      a: "Your privacy is our absolute priority. Your photos are secured behind private S3 storage and are only visible to logged-in, approved matching members. Search engines and search visitors cannot access them."
    },
    {
      q: "How do I upgrade to the premium tier?",
      a: "After your photos are approved, you can complete the one-time registration payment on your dashboard. Once confirmed, you will instantly unlock Form-2 (Marriage Details) and receive full access to shared matches."
    },
    {
      q: "Can I edit my profile after it has been approved?",
      a: "Absolutely! You can modify any section (Basic details, photos, or astrology fields) at any time. To protect registry authenticity, any edit goes through a silent background review by our admin team while your account remains active."
    }
  ];

  const handleWhatsappClick = () => {
    const message = encodeURIComponent("Hello Roots & Rings Support, I am a registered member and need concierge assistance with my account details.");
    window.open(`https://wa.me/919652884472?text=${message}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+919652884472';
  };

  const handleEmailClick = () => {
    // Robust clipboard fallback: copy email automatically so the user is never stuck
    try {
      navigator.clipboard.writeText('rootsandringsmatrimony@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-navy-950 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Luxury Glowing Ambient Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-navy-900/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* Header Title */}
        <div className="text-center space-y-3 pb-6 border-b border-gold-500/10">
          <h1 className="text-4xl sm:text-5xl font-playfair font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-gold-400 to-gold-500">
            Roots & Rings VIP Concierge
          </h1>
          <p className="text-luxe-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            Welcome to premium support. Connect directly with your dedicated matchmaking assistant for immediate account assistance.
          </p>
        </div>

        {/* Concierge Connect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: WhatsApp */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-navy-900/60 border border-gold-500/15 rounded-2xl p-6 flex flex-col justify-between items-center text-center backdrop-blur-md shadow-luxury hover:border-gold-500/35 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <Whatsapp size={22} />
            </div>
            <div className="space-y-2 mb-6">
              <h3 className="text-md font-semibold text-luxe-gray-100 uppercase tracking-widest font-playfair">Instant WhatsApp</h3>
              <p className="text-xs text-luxe-gray-400 leading-relaxed">
                Connect with our team instantly over WhatsApp for ultra-fast chat answers.
              </p>
            </div>
            <button 
              onClick={handleWhatsappClick}
              className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(34,197,94,0.15)]"
            >
              Chat in WhatsApp
            </button>
          </motion.div>

          {/* Card 2: Phone */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-navy-900/60 border border-gold-500/15 rounded-2xl p-6 flex flex-col justify-between items-center text-center backdrop-blur-md shadow-luxury hover:border-gold-500/35 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-400 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Phone size={20} />
            </div>
            <div className="space-y-2 mb-6">
              <h3 className="text-md font-semibold text-luxe-gray-100 uppercase tracking-widest font-playfair">Helpline Hotline</h3>
              <p className="text-xs text-luxe-gray-400 leading-relaxed">
                Prefer speaking with an agent? Call our direct hotline anytime.
              </p>
            </div>
            <button 
              onClick={handlePhoneClick}
              className="w-full py-2.5 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-navy-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-gold"
            >
              Call Hotline
            </button>
          </motion.div>

          {/* Card 3: Email */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-navy-900/60 border border-gold-500/15 rounded-2xl p-6 flex flex-col justify-between items-center text-center backdrop-blur-md shadow-luxury hover:border-gold-500/35 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Envelope size={20} />
            </div>
            <div className="space-y-2 mb-6">
              <h3 className="text-md font-semibold text-luxe-gray-100 uppercase tracking-widest font-playfair">Concierge Email</h3>
              <p className="text-xs text-luxe-gray-400 leading-relaxed">
                For detailed questions or document verification help, send an email.
              </p>
            </div>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=rootsandringsmatrimony@gmail.com&su=Roots%20and%20Rings%20Matchmaking%20Concierge"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleEmailClick}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border block text-center ${
                copied 
                  ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-[0_0_15px_rgba(198,166,74,0.3)] font-bold' 
                  : 'bg-navy-850 hover:bg-gold-500/5 text-luxe-gray-200 border-gold-500/20 hover:border-gold-500/40'
              }`}
            >
              {copied ? '✓ Copied to Clipboard!' : 'Write Email'}
            </a>
          </motion.div>

        </div>

        {/* Accordion FAQ Block */}
        <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6 md:p-8 space-y-6 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-4 border-b border-gold-500/5">
            <Question size={18} className="text-gold-400" />
            <h2 className="text-lg font-semibold uppercase tracking-widest text-gold-400 font-playfair">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="border border-gold-500/5 rounded-xl overflow-hidden bg-navy-950/40 transition-all duration-300"
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gold-500/5 transition-colors"
                  >
                    <span className="text-sm font-semibold text-luxe-gray-200 tracking-wide pr-4">
                      {faq.q}
                    </span>
                    <span className="text-gold-400 flex-shrink-0">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 pt-1 text-xs text-luxe-gray-400 leading-relaxed font-medium border-t border-gold-500/5"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Support disclaimer */}
        <div className="text-center text-[10px] text-luxe-gray-500 max-w-md mx-auto tracking-wide leading-relaxed">
          * Direct voice lines are active 9:00 AM to 9:00 PM. WhatsApp Concierge support remains monitored around the clock to support premium member success.
        </div>

      </div>
    </div>
  );
};

export default SupportScreen;
