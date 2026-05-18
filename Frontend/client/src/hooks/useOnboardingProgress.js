import { useContext } from 'react';
import { OnboardingProgressContext } from '../contexts/OnboardingProgressContext';

export const useOnboardingProgress = () => {
  const context = useContext(OnboardingProgressContext);
  if (!context) {
    throw new Error('useOnboardingProgress must be used within OnboardingProgressProvider');
  }
  return context;
};
