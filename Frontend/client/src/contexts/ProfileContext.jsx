import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'roots-rings-profile';

const defaultProfile = {
  basicDetails: {
    fullName: '',
    gender: '',
    dob: '',
    height: '',
    religion: '',
    caste: '',
    motherTongue: '',
    education: '',
    occupation: '',
    city: '',
    state: '',
  },
  marriageDetails: {
    height: '',
    familyType: '',
    siblings: '',
    maritalStatus: '',
    expectations: '',
    lifestyle: '',
    aboutMe: '',
  },
  // photos store only lightweight metadata and uploaded URLs (no base64)
  photos: {
    headshot: null,
    halfBody: null,
    threeQuarter: null,
    fullBody: null,
  },
};

export const ProfileContext = createContext(null);

const readStored = () => {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw);
    return {
      ...defaultProfile,
      ...parsed,
      basicDetails: { ...defaultProfile.basicDetails, ...(parsed.basicDetails || {}) },
      marriageDetails: { ...defaultProfile.marriageDetails, ...(parsed.marriageDetails || {}) },
      photos: { ...defaultProfile.photos, ...(parsed.photos || {}) },
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultProfile;
  }
};

// Simple debounce helper to avoid writing on every keystroke
const debounce = (fn, wait = 400) => {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => readStored());

  const saveRef = React.useRef(
    debounce((value) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {}
    }, 500)
  );

  useEffect(() => {
    saveRef.current(profile);
  }, [profile]);

  const updateBasic = React.useCallback((updates) => {
    setProfile((cur) => ({ ...cur, basicDetails: { ...cur.basicDetails, ...updates } }));
  }, []);

  const updateMarriage = React.useCallback((updates) => {
    setProfile((cur) => ({ ...cur, marriageDetails: { ...cur.marriageDetails, ...updates } }));
  }, []);

  const updatePhotoMeta = React.useCallback((key, meta) => {
    setProfile((cur) => ({ ...cur, photos: { ...cur.photos, [key]: meta } }));
  }, []);

  const resetProfile = React.useCallback(() => {
    setProfile(defaultProfile);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({
    profile,
    basicDetails: profile.basicDetails,
    marriageDetails: profile.marriageDetails,
    photos: profile.photos,
    updateBasic,
    updateMarriage,
    updatePhotoMeta,
    resetProfile,
  }), [profile, updateBasic, updateMarriage, updatePhotoMeta, resetProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
