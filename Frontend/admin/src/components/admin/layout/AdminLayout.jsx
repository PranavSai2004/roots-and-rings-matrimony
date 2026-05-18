import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars as Menu,
  FaXmark as X,
  FaTableColumns as Dashboard,
  FaCheckDouble as Reviews,
  FaCreditCard as Payment,
  FaHandshake as Form2,
  FaMagnifyingGlass as Search,
  FaGift as Batch,
  FaHeart as Interest,
  FaEye as Monitoring,
  FaGear as Settings,
  FaRightFromBracket as SignOut,
  FaBell as Bell,
  FaChevronDown as ChevronDown,
  FaAddressBook as Directory,
} from 'react-icons/fa6';
import { useAdmin } from '../../../hooks/useAdmin';
import api from '../../../services/adminApi';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logoutAdmin } = useAdmin();
  const sidebarWidth = sidebarOpen ? 280 : 88;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/admin/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const markSingleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/admin/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Dashboard },
    { label: 'Profile Reviews', href: '/admin/reviews', icon: Reviews },
    { label: 'Payment Queue', href: '/admin/payments', icon: Payment },
    { label: 'Marriage Details', href: '/admin/form2', icon: Form2 },
    { label: 'Member Directory', href: '/admin/members', icon: Directory },
    { label: 'Search Profiles', href: '/admin/search-profiles', icon: Search },
    { label: 'Batch Management', href: '/admin/batches', icon: Batch },
    { label: 'Interest Tracking', href: '/admin/interests', icon: Interest },
    { label: 'Monitoring', href: '/admin/monitoring', icon: Monitoring },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-40 flex flex-shrink-0 flex-col overflow-hidden border-r border-gold-500/10 bg-navy-950/80 backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gold-500/10">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
              <span className="text-navy-950 font-playfair font-bold text-lg">R&R</span>
            </div>
            {sidebarOpen && (
              <div className="hidden lg:block">
                <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Admin</p>
                <p className="text-xs text-luxe-gray-400">Operations</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  location.pathname === item.href
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                    : 'text-luxe-gray-300 hover:bg-gold-500/10 hover:text-gold-400'
                }`}
              >
                <Icon className="text-lg flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gold-500/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-luxe-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <SignOut className="text-lg flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        style={{ marginLeft: sidebarWidth }}
        className="flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300"
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-20 flex-shrink-0 items-center justify-between border-b border-gold-500/10 bg-navy-950/60 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg border border-gold-500/20 hover:bg-gold-500/10 text-gold-400 transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Roots & Rings</p>
              <p className="text-lg font-playfair text-luxe-gray">Admin Operations</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && unreadCount > 0) markAllRead(); }}
                className="relative w-10 h-10 rounded-lg border border-gold-500/20 hover:bg-gold-500/10 flex items-center justify-center text-gold-400 transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-black border-2 border-navy-950 shadow-md shadow-red-500/20">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-navy-900 border border-gold-500/20 rounded-xl shadow-luxury z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gold-500/10">
                      <p className="text-sm font-semibold text-luxe-gray">Notifications</p>
                      <div className="flex items-center gap-3">
                        <button onClick={markAllRead} className="text-xs text-gold-400 hover:underline">Mark all read</button>
                        <span className="text-gold-500/30 text-[10px]">|</span>
                        <button onClick={clearAllNotifications} className="text-xs text-red-400 hover:underline font-medium">Clear all</button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gold-500/10 scrollbar-luxury">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-luxe-gray-400 text-center py-8">No notifications</p>
                      ) : notifications.map(n => {
                        const name = n.fullName || 'Member';
                        const mobile = n.userId?.mobile || 'N/A';
                        
                        let actionLabel = '🔔 Notification';
                        let detailDesc = n.message;
                        let actionColor = 'text-gold-400';
                        
                        if (n.formUpdated === 'form1') {
                          actionLabel = '✏️ Profile Update';
                          actionColor = 'text-cyan-400';
                          detailDesc = n.message.split('Changed:')[1] 
                            ? `Changed fields: ${n.message.split('Changed:')[1]}` 
                            : 'Basic profile details updated';
                        } else if (n.formUpdated === 'form2') {
                          actionLabel = '💍 Marriage Info';
                          actionColor = 'text-purple-400';
                          detailDesc = n.message.split('Changed:')[1] 
                            ? `Changed fields: ${n.message.split('Changed:')[1]}` 
                            : 'Marriage details updated';
                        }
                        
                        return (
                          <div 
                            key={n._id} 
                            onClick={() => markSingleRead(n._id, n.isRead)}
                            className={`px-4 py-3 cursor-pointer ${!n.isRead ? 'bg-gold-500/5 hover:bg-gold-500/10' : 'hover:bg-navy-800/30'} transition-all flex flex-col gap-1`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-luxe-gray-100 flex items-center gap-2">
                                <span>{name}</span>
                                <span className="text-xs font-semibold text-luxe-gray-400 font-mono">({mobile})</span>
                              </p>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${actionColor}`}>
                                {actionLabel}
                              </span>
                            </div>
                            <p className="text-xs text-luxe-gray-400 leading-normal">
                              {detailDesc}
                            </p>
                            <p className="text-[10px] text-luxe-gray-500 mt-0.5">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gold-500/20 hover:bg-gold-500/10 text-luxe-gray transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
                  <span className="text-navy-950 font-bold text-sm">{(admin?.name || admin?.email || 'A').charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden sm:block text-sm">{admin?.name || 'Admin'}</span>
                <ChevronDown size={14} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {adminMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-navy-900 border border-gold-500/20 rounded-xl shadow-luxury z-50"
                >
                  <div className="p-4 border-b border-gold-500/10">
                    <p className="text-sm font-semibold text-luxe-gray truncate" title={admin?.email}>
                      {admin?.email}
                    </p>
                    <p className="text-xs text-luxe-gray-400 mt-1 capitalize">
                      Role: {admin?.role?.replace('_', ' ') || 'Super Admin'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm transition-all"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="min-h-full w-full max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
