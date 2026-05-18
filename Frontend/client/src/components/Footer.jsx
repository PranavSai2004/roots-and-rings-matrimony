import { motion } from 'framer-motion';
import { FaHeart as Heart, FaEnvelope as Mail, FaPhone as Phone, FaLocationDot as MapPin } from 'react-icons/fa6';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-navy-950 border-t border-gold-500/15">
      <div className="section-padding">
        <div className="container-max">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="rounded-[2rem] border border-gold-500/15 bg-navy-900/60 p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-luxury">
                  <Heart className="text-navy-950" size={18} />
                </div>
                <div>
                  <h3 className="font-playfair text-2xl text-luxe-gray">Roots & Rings</h3>
                  <p className="text-xs tracking-[0.28em] uppercase text-gold-400">Family-led matrimonial consultancy</p>
                </div>
              </div>

              <p className="font-playfair text-3xl md:text-4xl text-luxe-gray leading-tight max-w-xl">
                Built for families who value trust, warmth, and the dignity of a thoughtful introduction.
              </p>

              <p className="mt-5 text-luxe-gray-dark leading-relaxed max-w-2xl">
                Continuing a trusted matchmaking tradition through the next generation, with privacy-first introductions and careful relationship guidance.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gold-500/15 bg-gold-500/10 p-5">
                  <p className="text-gold-400 font-medium">10+ Years of Trusted Matchmaking Legacy</p>
                  <p className="text-sm text-luxe-gray-dark mt-1">A calm, family-operated process with a premium standard of care.</p>
                </div>
                <div className="rounded-2xl border border-gold-500/15 bg-gold-500/10 p-5">
                  <p className="text-gold-400 font-medium">Meaningful connections</p>
                  <p className="text-sm text-luxe-gray-dark mt-1">We guide introductions that feel dignified, rooted, and lasting.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="grid gap-4"
            >
              <div className="rounded-[2rem] border border-gold-500/15 bg-navy-900/60 p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.28em] text-gold-400">Contact</p>
                <div className="mt-5 space-y-4 text-luxe-gray-dark">
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-gold-400 mt-1" />
                    <div>
                      <p className="text-luxe-gray">G. Ramana</p>
                      <p className="text-sm"></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-gold-400 mt-1" />
                    <div>
                      <p className="text-luxe-gray">G. Bharani Lok Manikanta</p>
                      <p className="text-sm">Phone: 9398856527 • Founder & CEO</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-gold-400 mt-1" />
                    <div>
                      <p className="text-luxe-gray">G. Pardha Saradhi</p>
                      <p className="text-sm">Phone: 9652884472  • Relationship Manager</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gold-500/15 bg-navy-900/60 p-6 md:p-8">
                <div className="flex items-start gap-3 text-luxe-gray-dark">
                  <Mail size={16} className="text-gold-400 mt-1" />
                  <div>
                    <p className="text-luxe-gray">Private introductions only</p>
                    <p className="text-sm mt-1">Contacts are shared respectfully for relationship guidance and support.</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 text-luxe-gray-dark">
                  <MapPin size={16} className="text-gold-400 mt-1" />
                  <div>
                    <p className="text-luxe-gray">Heritage-led matchmaking</p>
                    <p className="text-sm mt-1">A family-first service designed around trust and discretion.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 h-px bg-gold-gradient opacity-70" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 text-sm text-luxe-gray-dark">
            <p>© {currentYear} Roots & Rings. All rights reserved.</p>
            <p className="text-gold-400 italic">“Meaningful connections that last a lifetime.”</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
