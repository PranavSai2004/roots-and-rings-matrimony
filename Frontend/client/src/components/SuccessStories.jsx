import { motion } from 'framer-motion';
import { FaQuoteLeft as Quote, FaHeart as Heart } from 'react-icons/fa6';
import { testimonials } from '../data/content';

export default function SuccessStories() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
  };

  return (
    <section id="testimonials" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,166,74,0.09),transparent_30%)] pointer-events-none" />
      <div className="container-max relative">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect-dark mb-6">
              <Heart size={15} className="text-gold-400" />
              <span className="text-xs tracking-[0.28em] uppercase text-gold-400">Quotes of Trust</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold text-luxe-gray">
              Love stories with <span className="text-gradient">family warmth</span>
            </h2>
            <p className="mt-6 text-lg text-luxe-gray-dark leading-relaxed">
              Elegant words from couples and families who value privacy, care, and long-term credibility.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {testimonials.map((testimonial) => (
              <motion.article key={testimonial.id} variants={itemVariants} className="luxury-card p-7 md:p-8 relative overflow-hidden">
                <Quote className="absolute right-5 top-5 text-gold-400/30" size={34} />
                <p className="font-playfair text-2xl md:text-3xl text-luxe-gray leading-relaxed pr-8">
                  “{testimonial.story}”
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <img src={testimonial.couple.image1} alt={testimonial.couple.name1} className="w-12 h-12 rounded-full border-2 border-navy-900 object-cover" />
                    <img src={testimonial.couple.image2} alt={testimonial.couple.name1} className="w-12 h-12 rounded-full border-2 border-navy-900 object-cover" />
                  </div>
                  <div>
                    <p className="text-gold-400 font-medium">{testimonial.couple.name1}</p>
                    <p className="text-sm text-luxe-gray-dark">{testimonial.date}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-14 rounded-[2rem] border border-gold-500/15 bg-navy-950/50 p-7 md:p-10 text-center">
            <p className="font-playfair text-2xl md:text-3xl text-luxe-gray leading-relaxed">
              “Connecting Hearts. Creating Forever.”
            </p>
            <p className="mt-4 text-luxe-gray-dark max-w-2xl mx-auto">
              Your introduction is handled with care so every next step feels calm, dignified, and clear.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
