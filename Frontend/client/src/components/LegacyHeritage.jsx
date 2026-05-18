import { motion } from 'framer-motion';
import { FaLandmark as Landmark, FaCalendarDays as CalendarDays, FaPeopleGroup as PeopleGroup } from 'react-icons/fa6';

const legacyPoints = [
  { title: 'Trusted legacy', copy: 'Built upon the trusted legacy of Pardha Saradhi Marriage Bureau.', icon: Landmark },
  { title: 'Next generation', copy: 'Continuing a trusted matchmaking tradition through the next generation.', icon: PeopleGroup },
  { title: '10+ years', copy: 'A decade-plus of relationship guidance, family credibility, and quiet service.', icon: CalendarDays },
];

export default function LegacyHeritage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
  };

  return (
    <section id="legacy" className="section-padding bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(198,166,74,0.12),transparent_28%)] pointer-events-none" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.div variants={itemVariants} className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-10 items-center">
            <div className="rounded-[2rem] overflow-hidden border border-gold-500/15 bg-navy-900/55 p-7 md:p-10">
              <p className="text-xs uppercase tracking-[0.28em] text-gold-400">Heritage</p>
              <h2 className="mt-4 font-playfair text-4xl md:text-6xl text-luxe-gray leading-tight">
                Trusted across generations.
              </h2>
              <p className="mt-5 text-luxe-gray-dark leading-relaxed text-lg">
                The experience feels emotionally warm because it is grounded in continuity, family stewardship, and a reputation that has been shaped with care.
              </p>
              <div className="mt-7 rounded-2xl bg-gold-500/10 border border-gold-500/15 p-5">
                <p className="font-playfair text-2xl text-luxe-gray">“We honor tradition while guiding modern families with discretion.”</p>
              </div>
            </div>

            <div className="grid gap-5 md:gap-6">
              {legacyPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <motion.div key={point.title} variants={itemVariants} className="luxury-card p-6 md:p-7 flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-luxury flex-shrink-0">
                      <Icon className="text-navy-950" size={22} />
                    </div>
                    <div>
                      <h3 className="font-playfair text-2xl text-luxe-gray">{point.title}</h3>
                      <p className="mt-2 text-luxe-gray-dark leading-relaxed">{point.copy}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
