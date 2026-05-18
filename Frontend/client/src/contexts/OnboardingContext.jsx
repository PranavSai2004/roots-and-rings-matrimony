import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'roots-rings-onboarding';

const defaultOnboardingState = {
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
  photos: {
    headshot: null,
    halfBody: null,
    threeQuarter: null,
    fullBody: null,
  },
  photoPreviews: {
    headshot: null,
    halfBody: null,
    threeQuarter: null,
    fullBody: null,
  },
  progress: {
    otpVerified: false,
    basicDetailsCompleted: false,
    photosUploaded: false,
    verificationInProgress: false,
    paymentConfirmed: false,
    marriageDetailsUnlocked: false,
    marriageDetailsCompleted: false,
  },
};

const OnboardingContext = createContext(null);

const readStoredState = () => {
  if (typeof window === 'undefined') {
    return defaultOnboardingState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultOnboardingState;
    }

    const parsed = JSON.parse(stored);
    return {
      ...defaultOnboardingState,
      ...parsed,
      basicDetails: { ...defaultOnboardingState.basicDetails, ...parsed.basicDetails },
      marriageDetails: { ...defaultOnboardingState.marriageDetails, ...parsed.marriageDetails },
      photos: { ...defaultOnboardingState.photos, ...parsed.photos },
      photoPreviews: { ...defaultOnboardingState.photoPreviews, ...parsed.photoPreviews },
      progress: { ...defaultOnboardingState.progress, ...parsed.progress },
    };
  } catch {
    return defaultOnboardingState;
  }
};

export const OnboardingProvider = ({ children }) => {
  throw new Error('OnboardingProvider is deprecated. Use ProfileProvider and OnboardingProgressProvider.');
  const [state, setState] = useState(() => readStoredState());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateBasicDetails = (updates) => {
    setState((current) => ({
      ...current,
      basicDetails: {
        ...current.basicDetails,
        ...updates,
      },
    }));
  };

  const updateMarriageDetails = (updates) => {
    setState((current) => ({
      ...current,
      marriageDetails: {
        ...current.marriageDetails,
        ...updates,
      },
    }));
  };

  const updatePhoto = (photoKey, value) => {
    setState((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [photoKey]: value,
      },
    }));
  };

  const updatePhotoPreview = (photoKey, previewValue) => {
    setState((current) => ({
      ...current,
      photoPreviews: {
        ...current.photoPreviews,
        [photoKey]: previewValue,
      },
    }));
  };

  const updateProgress = (updates) => {
    setState((current) => ({
      ...current,
      progress: {
        ...current.progress,
        ...updates,
      },
    }));
  };

  const resetOnboarding = () => {
    setState(defaultOnboardingState);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({
    state,
    basicDetails: state.basicDetails,
    marriageDetails: state.marriageDetails,
    photos: state.photos,
    photoPreviews: state.photoPreviews,
    progress: state.progress,
    updateBasicDetails,
    updateMarriageDetails,
    updatePhoto,
    updatePhotoPreview,
    updateProgress,
    resetOnboarding,
  }), [state]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
