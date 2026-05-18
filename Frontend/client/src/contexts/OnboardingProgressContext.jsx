import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const STORAGE_KEY = 'roots-rings-progress';

const defaultProgress = {
  otpVerified: false,
  basicDetailsCompleted: false,
  photosUploaded: false,
  paymentConfirmed: false,
  marriageDetailsCompleted: false,
  profileApproved: false,
};

export const OnboardingProgressContext = createContext(null);

const safeRead = () => {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);
    return { ...defaultProgress, ...parsed };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultProgress;
  }
};

export const OnboardingProgressProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [progress, setProgress] = useState(() => safeRead());

  // Derive state during render to prevent redirect loops caused by stale context
  const effectiveProgress = useMemo(() => {
    if (isAuthenticated && user) {
      return {
        ...progress,
        otpVerified: true,
        basicDetailsCompleted: user.form1Completed || (user.registrationStep >= 1) || progress.basicDetailsCompleted,
        photosUploaded: (user.registrationStep >= 2) || progress.photosUploaded,
        paymentConfirmed: user.paymentStatus === 'verified' || user.paymentStatus === 'confirmed',
        marriageDetailsCompleted: user.form2Completed || (user.registrationStep >= 4) || progress.marriageDetailsCompleted,
        profileApproved: user.form1ReviewStatus === 'approved' || user.accountStatus === 'approved',
      };
    }
    return progress;
  }, [isAuthenticated, user, progress]);

  // Sync to local state and localStorage safely
  useEffect(() => {
    const keys = ['otpVerified', 'basicDetailsCompleted', 'photosUploaded', 'paymentConfirmed', 'marriageDetailsCompleted', 'profileApproved'];
    const hasChanges = keys.some(key => effectiveProgress[key] !== progress[key]);

    if (hasChanges) {
      setProgress(effectiveProgress);
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(effectiveProgress));
    } catch {}
  }, [effectiveProgress, progress]);

  const updateProgress = useCallback((updates) => {
    setProgress((p) => ({ ...p, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({ 
    progress: effectiveProgress, 
    updateProgress, 
    resetProgress 
  }), [effectiveProgress, updateProgress, resetProgress]);

  return <OnboardingProgressContext.Provider value={value}>{children}</OnboardingProgressContext.Provider>;
};
