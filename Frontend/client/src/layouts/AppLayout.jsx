import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars as Menu, FaXmark as X, FaChevronDown } from 'react-icons/fa6';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const AppLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const response = await api.get('/profile/me');
          setProfileInfo(response.data);
        } catch (e) {
          console.error('Error fetching profile avatar info:', e);
        }
      })();
    }
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const primaryPhoto = profileInfo?.photos?.find(p => p.photoType === 'headshot') || profileInfo?.photos?.[0];

  const navItems = [
    { label: 'Dashboard', href: '/app/dashboard' },
    { label: 'Curated Matches', href: '/app/shared-profiles' },
    { label: 'My Profile', href: '/app/my-profile' },
    { label: 'Support', href: '/app/support' },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-navy-950/95 backdrop-blur-xl border-b border-gold-500/10 shadow-luxury'
            : 'bg-navy-950/50 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/app/dashboard"
              className="flex items-center gap-2 group"
            >
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 group-hover:from-gold-300 group-hover:to-gold-400 transition-all">
                R&R
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-luxe-gray-300 hover:text-gold-400 transition-colors text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side - Profile & Menu */}
            <div className="flex items-center gap-4">
              {/* Profile dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 p-1 px-3 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/25 text-gold-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                >
                  {primaryPhoto?.photoUrl ? (
                    <img 
                      src={primaryPhoto.photoUrl} 
                      alt="Primary Profile avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-gold-500/30" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-sm font-playfair shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      {profileInfo?.form1Data?.fullName?.charAt(0) || user?.mobile?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest text-gold-400/90 font-playfair">
                    {profileInfo?.form1Data?.fullName?.split(' ')[0] || 'Menu'}
                  </span>
                  <FaChevronDown className="text-[10px] opacity-75" />
                </motion.button>

                {/* Dropdown menu */}
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-navy-900 border border-gold-500/20 rounded-xl shadow-luxury overflow-hidden z-50 backdrop-blur-md"
                  >
                    {/* VIP Member Details Header */}
                    <div className="px-4 py-3.5 border-b border-gold-500/10 bg-navy-950/60 text-left">
                      <p className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-300 to-gold-400 font-playfair truncate leading-tight pb-0.5">
                        {profileInfo?.form1Data?.fullName || 'Registry Member'}
                      </p>
                      <p className="text-[11px] text-luxe-gray-300 mt-1.5 font-mono select-all tracking-wider">
                        ID: {user?._id ? `${user._id.toString().slice(-8).toUpperCase()}` : 'PENDING'}
                      </p>
                      <p className="text-xs text-luxe-gray-400 mt-1 font-mono truncate">
                        {user?.mobile || 'No Mobile'}
                      </p>
                    </div>

                    {/* Quick Menu Links */}
                    <div className="py-1.5 flex flex-col">
                      <button
                        onClick={() => { setIsProfileOpen(false); navigate('/app/my-profile'); }}
                        className="w-full text-left px-4 py-3 text-sm text-luxe-gray-300 hover:bg-gold-500/5 hover:text-gold-400 transition-colors flex items-center gap-2.5"
                      >
                        <span className="text-base">👤</span> My Profile
                      </button>
                      <button
                        onClick={() => { setIsProfileOpen(false); navigate('/app/support'); }}
                        className="w-full text-left px-4 py-3 text-sm text-luxe-gray-300 hover:bg-gold-500/5 hover:text-gold-400 transition-colors flex items-center gap-2.5"
                      >
                        <span className="text-base">💬</span> Help & Support
                      </button>
                    </div>

                    {/* Logout CTA */}
                    <div className="border-t border-gold-500/10">
                      <button
                        onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5"
                      >
                        <span className="text-base">🚪</span> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gold-500/10 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="text-gold-400 text-xl" />
                ) : (
                  <Menu className="text-gold-400 text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 border-t border-gold-500/10"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-luxe-gray-300 hover:text-gold-400 hover:bg-navy-900/50 transition-colors text-sm"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-luxe-gray-300 hover:text-gold-400 hover:bg-navy-900/50 transition-colors text-sm mt-2 border-t border-gold-500/10"
              >
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children || <Outlet />}
        </motion.div>
      </main>
    </div>
  );
};
