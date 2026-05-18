import { motion } from 'framer-motion';
import { FaHeart as Heart, FaPeopleGroup as Group, FaRing as Ring } from 'react-icons/fa6';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const meaningCards = [
    {
      title: 'Roots',
      icon: Group,
      copy: 'Family values, trust, culture, and the grounded relationships that shape a lifelong home.',
    },
    {
      title: 'Rings',
      icon: Ring,
      copy: 'Marriage, commitment, and the bond that grows stronger through every shared season.',
    },
    {
      title: 'Together',
      icon: Heart,
      copy: 'Meaningful connections that grow into lifelong relationships with dignity and warmth.',
    },
  ];

  return (
    <section id="meaning" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(198,166,74,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(214,165,87,0.08),transparent_28%)]" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <div className="max-w-4xl mx-auto text-center mb-14 md:mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
              <Heart size={15} className="text-gold-400" />
              <span className="text-xs tracking-[0.28em] uppercase text-gold-400">Brand Meaning</span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="font-playfair text-4xl md:text-6xl font-bold text-luxe-gray leading-tight">
              Roots in family.
              <span className="block text-gradient mt-3">Rings in commitment.</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="mt-6 text-lg md:text-xl text-luxe-gray-dark leading-relaxed max-w-3xl mx-auto">
              Roots & Rings stands for meaningful connections that grow into lifelong relationships.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-center">
            <motion.div variants={itemVariants} className="luxury-card p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(198,166,74,0.06),transparent_45%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.3em] text-gold-400">A heritage story</p>
                <p className="mt-5 text-luxe-gray text-lg md:text-2xl font-playfair leading-relaxed">
                  The name carries two promises: that every introduction honors family roots, and every relationship is guided toward a lasting ring of commitment.
                </p>

                <div className="mt-8 grid sm:grid-cols-3 gap-4">
                  {meaningCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.title} className="rounded-2xl border border-gold-500/15 bg-navy-950/45 p-4">
                        <div className="w-11 h-11 rounded-xl bg-gold-gradient flex items-center justify-center mb-4">
                          <Icon className="text-navy-950" size={18} />
                        </div>
                        <h3 className="font-playfair text-xl text-luxe-gray">{card.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-luxe-gray-dark">{card.copy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-5">
              <div className="rounded-3xl bg-navy-950/55 border border-gold-500/15 p-6 md:p-8 shadow-luxury">
                <p className="text-sm uppercase tracking-[0.28em] text-gold-400">Emotional tone</p>
                <p className="mt-4 text-2xl md:text-3xl font-playfair text-luxe-gray leading-snug">
                  Warm, culturally rooted, and deeply reassuring.
                </p>
              </div>
              <div className="rounded-3xl bg-gold-500/10 border border-gold-500/15 p-6 md:p-8">
                <p className="text-gold-400 font-medium">The closing promise</p>
                <p className="mt-3 text-lg text-luxe-gray-dark leading-relaxed">
                  We are here to guide families with discretion, care, and a sense of continuity that feels both personal and premium.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
