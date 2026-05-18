import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AdminContext = createContext();
const BASE = import.meta.env.VITE_ADMIN_API_BASE_URL;

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const storedAdmin = localStorage.getItem('admin-session');
    if (token && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-session');
      }
    }
    setLoading(false);
  }, []);

  const loginAdmin = React.useCallback(async (email, password) => {
    try {
      const res = await axios.post(`${BASE}/admin/login`, { email, password });
      const { token, admin: adminData } = res.data;

      localStorage.setItem('admin-token', token);
      localStorage.setItem('admin-session', JSON.stringify(adminData));

      setAdmin(adminData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  const logoutAdmin = React.useCallback(() => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-session');
  }, []);

  const memoValue = React.useMemo(() => ({
    admin,
    isAuthenticated,
    loading,
    loginAdmin,
    logoutAdmin
  }), [admin, isAuthenticated, loading, loginAdmin, logoutAdmin]);

  return (
    <AdminContext.Provider value={memoValue}>
      {children}
    </AdminContext.Provider>
  );
};


