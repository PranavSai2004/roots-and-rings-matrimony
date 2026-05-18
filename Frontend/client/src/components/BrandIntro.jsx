import { motion } from 'framer-motion';

/**
 * Premium brand introduction section
 * Displays fullscreen Roots & Rings logo/banner with cinematic animations
 * Only this section appears on initial page load
 */
export default function BrandIntro() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: 'easeOut',
        delay: 0.2,
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.4,
      },
    },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: 0.8,
      },
    },
  };

  const scrollHintVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: [0, 1, 0],
      y: [0, 8, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      },
    },
  };

  return (
    <motion.section
      id="brand-intro"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-luxury-gradient"
    >
      {/* Layered ambient background (clipped to viewport) */}
      <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 0 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-24 top-1/4 w-[28rem] h-[28rem] rounded-full bg-gold-500/12 blur-3xl transform-gpu"
        />
        <motion.div
          animate={{ rotate: 0 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
          className="absolute -left-20 bottom-24 w-[22rem] h-[22rem] rounded-full bg-gold-400/10 blur-3xl transform-gpu"
        />
        <div className="absolute inset-0 bg-vignette pointer-events-none" />
      </div>

      {/* Main logo section (no boxed container) */}
      <motion.div
        variants={logoVariants}
        className="flex flex-col items-center justify-center gap-6 z-10 px-6 text-center"
      >
        {/* Subtle halo behind the mark */}
        <motion.div
          variants={glowVariants}
          className="absolute z-0 w-[26rem] h-[26rem] rounded-full bg-gold-500/14 blur-3xl"
        />

        {/* Floating mark */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full ring-1 ring-gold-300/20 shadow-[0_25px_60px_rgba(198,166,74,0.08)] bg-transparent">
              <span className="font-playfair font-extrabold text-3xl md:text-5xl text-gold-300 tracking-wide">R&R</span>
            </div>
          </div>

          <h1 className="font-playfair text-4xl md:text-6xl font-extrabold text-gold-200 leading-tight tracking-[0.12em]">
            ROOTS & RINGS
          </h1>

          <div className="max-w-2xl space-y-6">
            <p className="font-playfair text-base md:text-xl text-gold-100/90 font-light tracking-wider">
              A decade of trust. A legacy of traditions.
              Founded by G. Ramana through Pardha Saradhi Marriage Bureau, this journey now continues through his sons, Pardha Saradhi and Bharani Lok Manikanta — preserving family values while creating timeless connections for generations to come.
            </p>
            <div className="pt-4 border-t border-gold-500/10">
              <p className="font-playfair text-base md:text-xl text-gold-300 font-bold tracking-wider text-center">
                For trusted matrimonial guidance:
                <br />
                <span className="text-xl md:text-2xl text-gold-200 block mt-2">G. Ramana – 9393914070</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll hint - centered precisely */}
      <motion.div
        variants={scrollHintVariants}
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-3 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-poppins text-xs uppercase tracking-[0.18em] text-gold-200">Scroll to explore</span>
          <svg className="w-6 h-6 text-gold-200 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l6-6m-6 6-6-6" />
          </svg>
        </div>
      </motion.div>
    </motion.section>
  );
}
