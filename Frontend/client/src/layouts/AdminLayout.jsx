import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars as Menu, FaXmark as X } from 'react-icons/fa6';

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Profile Reviews', href: '#reviews' },
  { label: 'Payment Verification', href: '#payments' },
  { label: 'Match Sharing', href: '#sharing' },
  { label: 'User Management', href: '#users' },
  { label: 'Interest Tracking', href: '#interests' },
];

export const AdminLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-luxe-gray">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-gold-500/10 bg-navy-900/80 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gold-500/10">
          <div className="w-11 h-11 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-luxury">
            <span className="text-navy-950 font-playfair font-bold text-lg">R&R</span>
          </div>
          <div>
            <h1 className="font-playfair text-2xl text-luxe-gray">Admin Suite</h1>
            <p className="text-xs tracking-[0.3em] uppercase text-gold-400">Luxury Operations</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-luxe-gray-300 hover:bg-gold-500/10 hover:text-gold-400 transition-all"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-gold-500/10">
          <button
            onClick={() => navigate('/')}
            className="w-full btn-ghost text-left justify-start"
          >
            Return to Site
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gold-500/10 bg-navy-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold-400">Admin Dashboard</p>
              <h2 className="font-playfair text-2xl text-luxe-gray">Operational overview</h2>
            </div>

            <div className="hidden lg:block text-right">
              <p className="text-sm text-luxe-gray-300">Premium moderation and matching controls</p>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-xl border border-gold-500/15 bg-gold-500/10 p-2 text-gold-400"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="lg:hidden border-t border-gold-500/10 bg-navy-900/95 px-4 py-3"
            >
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="rounded-xl px-4 py-3 text-left text-sm text-luxe-gray-300 hover:bg-gold-500/10 hover:text-gold-400"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
};
