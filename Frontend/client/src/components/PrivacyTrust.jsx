import { motion } from 'framer-motion';
import { FaShieldHeart as ShieldHeart, FaEye as Eye, FaClock as Clock, FaUsers as Users } from 'react-icons/fa6';

const trustItems = [
  { title: 'Verified profiles', copy: 'Carefully screened introductions that build confidence from the start.', icon: ShieldHeart },
  { title: 'Controlled sharing', copy: 'Profiles are shared only with the right families at the right time.', icon: Eye },
  { title: 'Time-limited access', copy: 'Curated introductions stay visible for a limited, respectful window.', icon: Clock },
  { title: 'Privacy-focused matchmaking', copy: 'Every interaction is guided by discretion and trust.', icon: Users },
];

export default function PrivacyTrust() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
  };

  return (
    <section id="privacy" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,166,74,0.1),transparent_28%)] pointer-events-none" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
              <ShieldHeart size={15} className="text-gold-400" />
              <span className="text-xs tracking-[0.28em] uppercase text-gold-400">Privacy & Trust</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-luxe-gray">
              Safety, exclusivity, and <span className="text-gradient">controlled introductions</span>
            </h2>
            <p className="mt-6 text-lg text-luxe-gray-dark leading-relaxed">
              This is a guided matrimonial consultancy, not an open dating feed. Each profile moves through a careful, private review flow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={itemVariants} className="luxury-card p-6 md:p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mb-5 shadow-luxury">
                    <Icon className="text-navy-950" size={22} />
                  </div>
                  <h3 className="font-playfair text-xl text-luxe-gray">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-luxe-gray-dark">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={itemVariants} className="mt-14 rounded-[2rem] border border-gold-500/15 bg-gold-500/10 p-7 md:p-10 text-center">
            <p className="font-playfair text-2xl md:text-3xl text-luxe-gray leading-relaxed">
              Controlled profile sharing keeps the experience respectful, private, and reassuring for every family.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
