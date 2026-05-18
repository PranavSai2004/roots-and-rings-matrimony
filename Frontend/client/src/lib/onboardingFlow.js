/**
 * src/lib/onboardingFlow.js
 * Centralized onboarding progression logic and state machine rules.
 * Defines the canonical progression sequence and rules for route access.
 */

/**
 * Onboarding progression sequence in canonical order.
 * Each step depends on the previous step's completion.
 */
export const ONBOARDING_SEQUENCE = [
  { key: 'otpVerified', label: 'OTP Verified', route: '/auth/login' },
  { key: 'basicDetailsCompleted', label: 'Basic Details', route: '/app/basic-details' },
  { key: 'photosUploaded', label: 'Photos Uploaded', route: '/app/upload-photos' },
  { key: 'profileApproved', label: 'Profile Approved', route: '/app/review-pending' },
  { key: 'paymentConfirmed', label: 'Payment Confirmed', route: '/app/payment-status' },
  { key: 'marriageDetailsCompleted', label: 'Marriage Details', route: '/app/marriage-details' },
];

/**
 * Get the next required step in the onboarding flow based on current progress.
 * @param {Object} progress - Current onboarding progress object
 * @returns {Object|null} - Next required step or null if all steps complete
 */
export function getNextRequiredStep(progress) {
  for (const step of ONBOARDING_SEQUENCE) {
    if (!progress[step.key]) {
      return step;
    }
  }
  return null; // All steps complete
}

/**
 * Check if user is allowed to access a specific onboarding route.
 * @param {Object} progress - Current onboarding progress object
 * @param {string} routeKey - Unique key for the route (e.g., 'basicDetailsCompleted')
 * @returns {Object} - { allowed: boolean, nextAllowedRoute: string|null, reason: string }
 */
export function canAccessRoute(progress, routeKey) {
  // Find the index of the requested route in the sequence
  const targetStepIndex = ONBOARDING_SEQUENCE.findIndex(step => step.key === routeKey);
  
  if (targetStepIndex === -1) {
    // Route not in sequence; allow access if authenticated
    return { allowed: true, nextAllowedRoute: null, reason: 'Route not in onboarding sequence' };
  }

  // Check all previous steps AND the target step itself are complete
  for (let i = 0; i <= targetStepIndex; i++) {
    const prevStep = ONBOARDING_SEQUENCE[i];
    if (!progress[prevStep.key]) {
      // User hasn't completed a prerequisite; redirect to the route to resolve this step
      return {
        allowed: false,
        nextAllowedRoute: prevStep.route,
        reason: `Missing prerequisite: ${prevStep.label}`,
      };
    }
  }

  // All prerequisites met
  return { allowed: true, nextAllowedRoute: null, reason: 'Prerequisite steps complete' };
}

/**
 * Get the canonical "next step" URL based on current progress.
 * Used by Dashboard and other entry points to redirect users to their current place in the flow.
 * @param {Object} progress - Current onboarding progress object
 * @returns {string} - URL to redirect to, or '/app/dashboard' if flow is complete
 */
export function getCanonicalNextUrl(progress) {
  const nextStep = getNextRequiredStep(progress);
  return nextStep ? nextStep.route : '/app/dashboard';
}

/**
 * Determine if a progress flag should be set for a given milestone.
 * @param {string} flagKey - The progress flag key
 * @returns {string} - Human-readable description of the milestone
 */
export function getMilestoneDescription(flagKey) {
  const step = ONBOARDING_SEQUENCE.find(s => s.key === flagKey);
  return step ? step.label : 'Unknown milestone';
}
