import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const safeParseStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);
  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = React.useCallback(async () => {
    try {
      const token = window.localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/profile/me');
      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // Check localStorage for existing user on mount
  useEffect(() => {
    const storedUser = safeParseStoredValue('user', null);
    const storedToken = window.localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(storedUser);
      setIsAuthenticated(true);
      refreshUser();
    }

    setLoading(false);
  }, [refreshUser]);

  const loginUser = React.useCallback((backendUser) => {
    setUser(backendUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(backendUser));
    localStorage.setItem('token', backendUser.token || localStorage.getItem('token'));
    localStorage.removeItem('roots-rings-progress');
    localStorage.removeItem('roots-rings-profile');
  }, []);

  const logoutUser = React.useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userProgress');
    localStorage.removeItem('roots-rings-progress');
    localStorage.removeItem('roots-rings-profile');
  }, []);

  const memoValue = React.useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    loginUser,
    logoutUser,
    refreshUser,
  }), [user, isAuthenticated, loading, loginUser, logoutUser, refreshUser]);

  return <AuthContext.Provider value={memoValue}>{children}</AuthContext.Provider>;
};
