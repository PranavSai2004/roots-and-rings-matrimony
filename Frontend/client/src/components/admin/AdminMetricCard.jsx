import { motion } from 'framer-motion';

export const AdminMetricCard = ({ label, value, description, tone = 'gold' }) => {
  const toneClasses =
    tone === 'muted'
      ? 'bg-navy-900/60 border-gold-500/10'
      : 'bg-gold-500/10 border-gold-500/15';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border backdrop-blur-md p-5 shadow-luxury ${toneClasses}`}
    >
      <p className="text-xs uppercase tracking-[0.28em] text-gold-400">{label}</p>
      <div className="mt-3 text-3xl font-playfair text-luxe-gray">{value}</div>
      <p className="mt-2 text-sm text-luxe-gray-dark leading-relaxed">{description}</p>
    </motion.div>
  );
};
