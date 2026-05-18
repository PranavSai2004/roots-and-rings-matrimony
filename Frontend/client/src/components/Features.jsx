import { motion } from 'framer-motion';
import { FaCheck as Check, FaShieldHeart as ShieldHeart, FaLock as Lock, FaClock as Clock } from 'react-icons/fa6';

const trustPoints = [
  'Verified profiles',
  'Controlled profile sharing',
  'Time-limited profile access',
  'Privacy-focused matchmaking',
];

const processCards = [
  { title: 'Registration', copy: 'Register with your mobile number and begin with a calm, guided first step.', icon: Check },
  { title: 'Profile + photos', copy: 'Complete your profile and upload photos so the team can understand your story.', icon: ShieldHeart },
  { title: 'Verification + Payment' , copy: 'Complete verification and secure payment to activate your profile for curated matrimonial matching.', icon: Lock },
  { title: 'Private access', copy: 'Matched profiles are shared privately with a limited viewing window.', icon: Clock },
];

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
  };

  return (
    <section id="process" className="section-padding bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,166,74,0.1),transparent_34%)] pointer-events-none" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
              <ShieldHeart size={15} className="text-gold-400" />
              <span className="text-xs tracking-[0.28em] uppercase text-gold-400">How It Works</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-luxe-gray">
              A guided process that feels <span className="text-gradient">calm and clear</span>
            </h2>
            <p className="mt-6 text-lg text-luxe-gray-dark leading-relaxed">
              We reduce confusion by moving step by step, keeping every introduction discreet, respectful, and easy to understand.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {processCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} variants={itemVariants} className="luxury-card p-7 md:p-8 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-gold-500/8 blur-2xl" />
                  <div className="relative flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center flex-shrink-0 shadow-luxury">
                      <Icon className="text-navy-950" size={22} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-gold-400">Step {index + 1}</p>
                      <h3 className="mt-2 font-playfair text-2xl text-luxe-gray">{card.title}</h3>
                      <p className="mt-3 text-luxe-gray-dark leading-relaxed">{card.copy}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={itemVariants} className="mt-14 md:mt-16 rounded-[2rem] border border-gold-500/15 bg-navy-900/55 p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              {trustPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-2 rounded-full border border-gold-500/15 bg-gold-500/10 px-4 py-2 text-sm text-luxe-gray">
                  <Check size={14} className="text-gold-400" />
                  {point}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
