import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars as Menu, FaXmark as X, FaArrowRight as ArrowRight } from 'react-icons/fa6';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInBrandIntro, setIsInBrandIntro] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Still in brand intro section if scroll is less than 80% of viewport height
      const isInIntro = window.scrollY < window.innerHeight * 0.8;
      setIsInBrandIntro(isInIntro);
      setIsScrolled(window.scrollY > 32 && !isInIntro);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#meaning' },
    { label: 'How It Works', href: '#process' },
    { label: 'Profiles', href: '#profiles' },
    { label: 'Contact', href: '#contact' },
    { label: 'Login', href: '/login' },
  ];

  const handleNavClick = (href) => {
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRouteClick = (href) => {
    setIsOpen(false);
    navigate(href);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`fixed w-full top-0 z-50 smooth-transition ${
        isInBrandIntro 
          ? 'bg-gradient-to-b from-navy-950/40 to-transparent backdrop-blur-sm' 
          : isScrolled 
          ? 'bg-navy-950/95 shadow-luxury backdrop-blur-xl border-b border-gold-500/15' 
          : 'bg-navy-950/35 backdrop-blur-md'
      }`}
    >
      <div className="container-max flex items-center justify-between h-18">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => handleNavClick('#home')}
          className="flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-luxury">
            <span className="text-navy-950 font-playfair font-bold text-lg">R&R</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-playfair text-xl md:text-2xl font-bold text-luxe-gray">Roots & Rings</h1>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-400">Heritage Matrimony</p>
          </div>
        </motion.button>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <motion.button
              key={link.label}
              whileHover={{ y: -2 }}
              onClick={() => (link.href.startsWith('#') ? handleNavClick(link.href) : handleRouteClick(link.href))}
              className="text-sm font-medium text-luxe-gray-300 hover:text-gold-400 smooth-transition"
            >
              {link.label}
            </motion.button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/app/dashboard')} className="btn-primary">
              Dashboard
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2">
              Get Started
              <ArrowRight size={14} />
            </motion.button>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gold-400 hover:text-gold-300"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-navy-950 border-t border-gold-500/10"
      >
        <div className="container-max py-4 space-y-2">
          {navLinks.map((link) => (
            <motion.button
              key={link.label}
              whileHover={{ x: 5 }}
              onClick={() => (link.href.startsWith('#') ? handleNavClick(link.href) : handleRouteClick(link.href))}
              className="block w-full text-left py-3 text-luxe-gray-300 hover:text-gold-400 smooth-transition font-medium"
            >
              {link.label}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setIsOpen(false);
              navigate(isAuthenticated ? '/dashboard' : '/login');
            }}
            className="w-full btn-primary mt-3"
          >
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </motion.button>
        </div>
      </motion.div>
    </motion.nav>
  );
}
