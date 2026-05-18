import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as ArrowRight, FaHeart as Heart, FaShieldHeart as ShieldHeart } from 'react-icons/fa6';

export default function Hero() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: 'easeOut' },
    },
  };

  const statItems = [
    { value: '10+ Years', label: 'Trusted legacy' },
    { value: 'Private', label: 'Curated introductions' },
    { value: 'Family-led', label: 'Guidance and care' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-luxury-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,166,74,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(214,165,87,0.12),transparent_32%)]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 right-0 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-gold-400/10 blur-3xl"
        />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container-max grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-center z-10 relative">
        <div>
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
            <ShieldHeart size={15} className="text-gold-400" />
            <span className="text-xs sm:text-sm tracking-[0.24em] uppercase text-gold-400 font-medium">Premium Family Matrimony</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-luxe-gray">
            Connecting Hearts.
            <span className="block text-gradient mt-3">Creating Forever.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-lg md:text-xl text-luxe-gray-dark leading-relaxed">
            Premium privacy-focused matrimonial matchmaking rooted in trust, family values, and meaningful relationships.
          </motion.p>

          <motion.p variants={itemVariants} className="mt-5 max-w-xl text-base md:text-lg text-gold-400/90 italic leading-relaxed">
            “We don’t just match profiles, we unite destinies.”
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-4">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/login')} className="btn-primary flex items-center justify-center gap-2">
              Get Started
              <ArrowRight size={16} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => document.querySelector('#process')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary">
              How It Works
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {statItems.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gold-500/15 bg-navy-900/55 backdrop-blur-md px-5 py-4">
                <p className="font-playfair text-2xl text-gold-400">{stat.value}</p>
                <p className="text-sm text-luxe-gray-dark mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gold-500/10 blur-2xl" />
          <div className="relative rounded-[2rem] border border-gold-500/20 bg-navy-900/55 backdrop-blur-xl p-6 md:p-8 shadow-luxury-lg overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,166,74,0.16),transparent_40%)]" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gold-400">Trust first</p>
                  <h2 className="font-playfair text-3xl text-luxe-gray mt-2">For families who value legacy.</h2>
                </div>
                <div className="w-16 h-16 rounded-full border border-gold-500/30 flex items-center justify-center bg-gold-500/10">
                  <Heart className="text-gold-400" size={24} />
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden border border-gold-500/15 bg-gradient-to-br from-navy-800/70 to-navy-950/80 p-5 md:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-black/15 border border-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gold-400/80">Roots</p>
                    <p className="mt-3 text-sm text-luxe-gray-dark leading-relaxed">Family values, culture, trust, and strong relationships.</p>
                  </div>
                  <div className="rounded-2xl bg-black/15 border border-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gold-400/80">Rings</p>
                    <p className="mt-3 text-sm text-luxe-gray-dark leading-relaxed">Marriage, commitment, and lifelong emotional bonding.</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-gold-500/15 pt-4">
                  <p className="text-luxe-gray text-base md:text-lg leading-relaxed">
                    Meaningful connections that grow into lifelong relationships.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gold-500/10 border border-gold-500/15 p-4">
                  <p className="text-sm text-gold-400 font-medium">Privacy-led guidance</p>
                  <p className="text-sm text-luxe-gray-dark mt-1">Controlled sharing, careful reviews, and calm support.</p>
                </div>
                <div className="rounded-2xl bg-gold-500/10 border border-gold-500/15 p-4">
                  <p className="text-sm text-gold-400 font-medium">Heritage credibility</p>
                  <p className="text-sm text-luxe-gray-dark mt-1">Built with the cadence of a family-led consultancy.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
