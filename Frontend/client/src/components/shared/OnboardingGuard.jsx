import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { canAccessRoute } from '../../lib/onboardingFlow';

/**
 * OnboardingGuard - enforces prerequisite checks for routes
 * Uses centralized onboarding flow rules from lib/onboardingFlow.js
 * @param {string[]} required - Array of progress flag keys that must be true
 * @param {JSX.Element} children - Component to render if all prerequisites are met
 */
export const OnboardingGuard = ({ required = [], children }) => {
  const navigate = useNavigate();
  const { progress } = useOnboardingProgress();

  React.useEffect(() => {
    if (required.length === 0) return; // No guards, allow access

    // Check the first required flag using centralized flow logic
    const primaryRequired = required[0];
    const decision = canAccessRoute(progress, primaryRequired);

    if (!decision.allowed && decision.nextAllowedRoute) {
      // Redirect to the next required step in the canonical flow
      navigate(decision.nextAllowedRoute, { replace: true });
    }
  }, [progress, navigate, required]);

  return children;
};

export default OnboardingGuard;
