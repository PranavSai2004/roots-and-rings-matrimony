import { motion } from 'framer-motion';
import { FaUserTie as UserTie, FaPhone as Phone, FaHeart as Heart } from 'react-icons/fa6';

const teamMembers = [
  { name: 'G. Ramana' },
  { name: 'G. Bharani Lok Manikanta', phone: '9398856527', role: 'Founder & CEO' },
  { name: 'G. Pardha Saradhi', phone: '9652884472', role: 'Relationship Manager' },
];

export default function FounderTeam() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
  };

  return (
    <section id="team" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,166,74,0.09),transparent_26%)] pointer-events-none" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
              <Heart size={15} className="text-gold-400" />
              <span className="text-xs tracking-[0.28em] uppercase text-gold-400">Founder & Relationship Team</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-luxe-gray">
              A family you can <span className="text-gradient">talk to</span>
            </h2>
            <p className="mt-6 text-lg text-luxe-gray-dark leading-relaxed">
              The experience is intentionally personal and approachable, with named people guiding the journey instead of anonymous service layers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member) => (
              <motion.article key={member.name} variants={itemVariants} whileHover={{ y: -8 }} className="luxury-card p-7 md:p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto shadow-luxury">
                  <UserTie className="text-navy-950" size={22} />
                </div>
                <h3 className="mt-5 font-playfair text-2xl text-luxe-gray">{member.name}</h3>
                <p className="mt-2 text-gold-400">{member.role}</p>
                {member.phone && (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-500/15 bg-gold-500/10 px-4 py-2 text-sm text-luxe-gray">
                    <Phone size={14} className="text-gold-400" />
                    {member.phone}
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
