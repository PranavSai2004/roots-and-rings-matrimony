import { motion } from 'framer-motion';
import { FaHeart as Heart, FaClock as Clock, FaEye as Eye, FaShieldHeart as ShieldHeart } from 'react-icons/fa6';
import { featuredProfiles } from '../data/content';

export default function ProfileCarousel() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <section id="profiles" className="section-padding bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,166,74,0.08),transparent_26%)] pointer-events-none" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
              <ShieldHeart size={15} className="text-gold-400" />
              <span className="text-xs tracking-[0.28em] uppercase text-gold-400">Curated Profiles</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-luxe-gray">
              Carefully selected, <span className="text-gradient">privately shared</span>
            </h2>
            <p className="mt-6 text-lg text-luxe-gray-dark leading-relaxed">
              Explore premium profile cards with elegant spacing, a discreet watermark area, and a limited access window for every introduction.
            </p>
            <div className="mt-8 inline-block px-8 py-3.5 rounded-full bg-gold-500/5 border border-gold-500/15 backdrop-blur-sm shadow-luxury">
              <p className="text-xs sm:text-sm tracking-[0.18em] uppercase font-bold text-gold-400 font-mono">
                🛡️ PREVIEW CARDS ONLY • TO PROTECT PRIVACY, ALL ACTUAL MEMBER DATA AND IMAGES ARE KEPT ENTIRELY CONFIDENTIAL
              </p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {featuredProfiles.map((profile, index) => (
              <motion.article key={profile.id} variants={itemVariants} whileHover={{ y: -8 }} className="group relative overflow-hidden rounded-[2rem] border border-gold-500/15 bg-navy-900/70 backdrop-blur-md shadow-luxury">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <motion.img whileHover={{ scale: 1.06 }} src={profile.image} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-transparent" />
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full bg-gold-500/15 border border-gold-500/20 px-3 py-1 text-xs tracking-[0.22em] uppercase text-gold-400 backdrop-blur-sm">
                      Watermark
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1 text-xs text-luxe-gray backdrop-blur-sm">
                      <Clock size={12} className="text-gold-400" />
                      Expires in 18h
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-playfair text-2xl text-luxe-gray">{profile.name}</h3>
                          {profile.verified && <span className="text-xs rounded-full bg-gold-500 text-navy-950 px-2 py-1 font-semibold">Verified</span>}
                        </div>
                        <p className="text-sm text-luxe-gray/90">{profile.age} • {profile.location}</p>
                        <p className="text-sm text-gold-400 mt-1">{profile.occupation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.25em] text-gold-400/80">Profile</p>
                        <p className="font-playfair text-lg text-luxe-gray">0{index + 1}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-3 text-sm text-luxe-gray-dark mb-5">
                    <Eye size={14} className="text-gold-400" />
                    Shared only after verification and private approval.
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-secondary flex items-center justify-center gap-2">
                    Interested
                    <Heart size={14} />
                  </motion.button>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
