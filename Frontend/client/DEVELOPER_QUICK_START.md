# Developer Quick Start - Onboarding Architecture

## 🎯 Core Concepts (Read First)

**Onboarding = Deterministic State Machine**
- User progresses through fixed sequence: OTP → BasicDetails → Photos → Payment → MarriageDetails → FinalReview → SharedProfiles
- Each step **requires** previous step completion
- Routes are **guarded** — direct URL bypass impossible
- Central source of truth: `src/lib/onboardingFlow.js`

---

## 📦 Key Files at a Glance

| File | Purpose |
|------|---------|
| `src/lib/onboardingFlow.js` | 🧠 **State machine logic** — progression rules, access decisions |
| `src/App.jsx` | 🛣️ **Route definitions** — all routes with guards applied |
| `src/components/shared/OnboardingGuard.jsx` | 🔒 **Guard enforcer** — validates prerequisites, redirects |
| `src/contexts/ProfileContext.jsx` | 📝 **Form data** — basicDetails, marriageDetails, photoMeta |
| `src/contexts/OnboardingProgressContext.jsx` | ✅ **Progress flags** — otpVerified, basicDetailsCompleted, etc. |
| `src/pages/app/Dashboard.jsx` | 🏠 **Entry point** — shows progress, "Continue" button |

---

## 🔍 Understanding the Flow

### How User Progress Is Tracked
```javascript
// OnboardingProgressContext stores ONE object:
const progress = {
  otpVerified: true,           // ✅ Set after OTP verification
  basicDetailsCompleted: true, // ✅ Set after Form1 submit
  photosUploaded: true,        // ✅ Set after PhotoUploadScreen submit
  paymentConfirmed: true,      // ✅ Set after PaymentScreen submit
  marriageDetailsCompleted: true, // ✅ Set after Form2 submit
  profileApproved: false,      // ❌ Still pending (admin approval)
};
```
**Storage**: `localStorage['roots-rings-progress']`

### How Guards Work
```javascript
// In src/App.jsx
<Route path="upload-photos" 
  element={<OnboardingGuard required={['basicDetailsCompleted']}>
    <PhotoUploadScreen />
  </OnboardingGuard>} 
/>
```

**Guard Logic**:
1. User navigates to `/app/upload-photos`
2. `OnboardingGuard` checks: `progress.basicDetailsCompleted === true`?
3. ✅ **YES**: Component renders, user sees PhotoUploadScreen
4. ❌ **NO**: Guard redirects to `/app/basic-details` (first missing prerequisite)

### How Dashboard Calculates Next Step
```javascript
import { getCanonicalNextUrl } from '../lib/onboardingFlow';

const Dashboard = () => {
  const { progress } = useOnboardingProgress();
  
  // If: otpVerified=true, basicDetailsCompleted=false
  // → returns '/app/basic-details'
  const nextUrl = getCanonicalNextUrl(progress);
  
  return (
    <button onClick={() => navigate(nextUrl)}>
      Continue →
    </button>
  );
};
```

---

## 💻 Common Tasks

### Task 1: Add New Onboarding Step
**Scenario**: New step "Background Check" required between Payment and MarriageDetails

```javascript
// 1. Update src/lib/onboardingFlow.js
export const ONBOARDING_SEQUENCE = [
  { key: 'otpVerified', label: 'OTP Verified', route: '/app/basic-details' },
  // ... existing steps ...
  { key: 'paymentConfirmed', label: 'Payment Confirmed', route: '/app/payment-status' },
  
  // 👇 ADD NEW STEP
  { key: 'backgroundCheckPassed', label: 'Background Check', route: '/app/background-check' },
  
  { key: 'marriageDetailsCompleted', label: 'Marriage Details', route: '/app/marriage-details' },
  // ... rest ...
];

// 2. Update src/contexts/OnboardingProgressContext.jsx (initial state)
const defaultProgress = {
  // ... existing ...
  backgroundCheckPassed: false, // 👈 ADD
  // ... rest ...
};

// 3. Add route in src/App.jsx
<Route path="background-check" 
  element={<OnboardingGuard required={['paymentConfirmed']}>
    <BackgroundCheckScreen />
  </OnboardingGuard>} 
/>

// 4. Create page component: src/pages/app/BackgroundCheckScreen.jsx
// (copy structure from existing pages)

// ✅ Done! Guards & redirects auto-apply
```
**Why so simple?** Because logic is centralized; `canAccessRoute()` reads from `ONBOARDING_SEQUENCE`.

---

### Task 2: Update User Form Data
```javascript
import { useProfile } from '../contexts/ProfileContext';

export const Form1 = () => {
  const { basicDetails, updateBasic } = useProfile();
  
  const handleChange = (field, value) => {
    updateBasic({ [field]: value }); // ✅ Debounced write to localStorage
  };
  
  const handleSubmit = () => {
    // Data already saved via debounce
    // Now mark milestone as complete:
    const { progress, updateProgress } = useOnboardingProgress();
    updateProgress({ basicDetailsCompleted: true });
  };
};
```
**Storage**: `localStorage['roots-rings-profile']` (debounced, ~500ms delay)

---

### Task 3: Upload Photo without Base64
```javascript
import { useProfile } from '../contexts/ProfileContext';
import { useOnboardingProgress } from '../contexts/OnboardingProgressContext';

export const PhotoUploadScreen = () => {
  const { updatePhotoMeta } = useProfile();
  const { updateProgress } = useOnboardingProgress();
  
  const handlePhotoSelect = (file) => {
    // ✅ Ephemeral preview URL (NOT stored in localStorage)
    const preview = URL.createObjectURL(file);
    setPreview(preview);
    
    // ✅ Store ONLY metadata (lightweight)
    updatePhotoMeta('headshot', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
  };
  
  const handleSubmit = () => {
    // Simulate upload, then mark as complete
    updateProgress({ photosUploaded: true });
    navigate('/app/payment-status');
  };
};
```
**Key Rule**: `localStorage` holds metadata only, NOT binary data (images, files, base64).

---

### Task 4: Check if User Can Access a Route (programmatically)
```javascript
import { canAccessRoute } from '../lib/onboardingFlow';

const MyComponent = () => {
  const { progress } = useOnboardingProgress();
  
  // Check if user can access marriage details route
  const decision = canAccessRoute(progress, 'marriageDetailsCompleted');
  
  if (decision.allowed) {
    return <div>User can access this content</div>;
  } else {
    return (
      <div>
        <p>Cannot access yet. Reason: {decision.reason}</p>
        <p>Redirect to: {decision.nextAllowedRoute}</p>
      </div>
    );
  }
};
```

---

### Task 5: Add a Progress Indicator Widget
```javascript
import { ONBOARDING_SEQUENCE, getNextRequiredStep } from '../lib/onboardingFlow';

export const ProgressBar = () => {
  const { progress } = useOnboardingProgress();
  
  const nextStep = getNextRequiredStep(progress);
  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalSteps = ONBOARDING_SEQUENCE.length;
  const percentage = (completedCount / totalSteps) * 100;
  
  return (
    <div>
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
      <p>
        {completedCount} of {totalSteps} steps complete
      </p>
      {nextStep && (
        <p>Next: {nextStep.label} ({nextStep.route})</p>
      )}
    </div>
  );
};
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Storing Image Data in localStorage
```javascript
// DON'T DO THIS:
const base64 = await fileToBase64(file);
updatePhotoMeta('photo', { data: base64 }); // ❌ 2MB+ per photo!
localStorage.setItem('photo-backup', base64); // ❌ BLOAT
```

**✅ Correct**: Store only metadata
```javascript
const preview = URL.createObjectURL(file);
updatePhotoMeta('photo', { fileName, size, type }); // ✅ ~200 bytes
```

---

### ❌ Mistake 2: Hardcoding Routes in Guards
```javascript
// DON'T DO THIS:
if (!progress.basicDetailsCompleted) {
  navigate('/app/basic-details'); // ❌ Route hardcoded
}
```

**✅ Correct**: Use centralized logic
```javascript
const decision = canAccessRoute(progress, 'photosUploaded');
if (!decision.allowed) {
  navigate(decision.nextAllowedRoute); // ✅ Dynamic redirect
}
```

---

### ❌ Mistake 3: Creating New Context for Every Feature
```javascript
// DON'T DO THIS:
const [state, setState] = useState(...);
<MyContext.Provider value={{ state, setState }}>
  // ❌ Causes re-renders across entire app
```

**✅ Correct**: Use existing focused contexts
```javascript
const { progress, updateProgress } = useOnboardingProgress();
const { basicDetails, updateBasic } = useProfile();
// ✅ Only components using these contexts re-render
```

---

## 🧪 Testing Checklist

### Before Deployment
- [ ] User can navigate through full onboarding sequence without skipping
- [ ] Refreshing page at any step maintains progress (check localStorage)
- [ ] Direct URL to restricted route redirects to first missing prerequisite
- [ ] No base64 data in `localStorage['roots-rings-progress']` or `localStorage['roots-rings-profile']`
- [ ] Dashboard "Continue" button navigates to correct next step
- [ ] All guards properly wrapped around routes (check App.jsx)
- [ ] No console errors/warnings on critical pages

### Manual Test Cases
1. **Full Flow**: OTP → Form1 → Photos → Payment → Form2 → FinalReview → SharedProfiles
2. **Backward Navigation**: Go back to previous step, modify data, submit again
3. **Refresh at Each Step**: Verify data persists and user stays on same page
4. **Direct URL Bypass**: Try navigating to `/app/marriage-details` before payment → should redirect to `/app/payment-status`
5. **Admin Approval**: Simulate `progress.profileApproved = true` → verify access to `/app/shared-profiles`

---

## 📊 Performance Tips

1. **Debouncing**: ProfileContext debounces writes (default ~500ms)
   - Avoid multiple rapid `updateBasic()` calls in loops
   - Use single `updateBasic({ field1, field2, field3 })` batch update

2. **Memoization**: Context values are memoized to prevent cascading re-renders
   - Only components calling `useProfile()` / `useOnboardingProgress()` re-render

3. **Conditional Rendering**: Use `canAccessRoute()` instead of complex ternaries
   - Keeps logic in one place, easier to maintain

---

## 🔗 Useful Links

- [Main Architecture Doc](./ARCHITECTURE_MIGRATION.md)
- [React Router Docs](https://reactrouter.com/)
- [Context API Best Practices](https://react.dev/reference/react/useContext)
- [Tailwind Config](./tailwind.config.js)

---

## 💬 Need Help?

**"How do I add a new progress flag?"**  
→ Update `ONBOARDING_SEQUENCE` in `src/lib/onboardingFlow.js` and add to `defaultProgress` in `src/contexts/OnboardingProgressContext.jsx`

**"How do I prevent users from skipping steps?"**  
→ Use `<OnboardingGuard required={['prerequisiteFlag']}>` wrapper on restricted routes

**"Where should I store form data?"**  
→ Use `ProfileContext.updateBasic()` / `updateMarriage()`. It auto-persists to localStorage (debounced).

**"How do I know what the user's next required step is?"**  
→ Call `getCanonicalNextUrl(progress)` or `getNextRequiredStep(progress)` from `lib/onboardingFlow.js`

---

**Last Updated**: 2025-01-24  
**Status**: ✅ Production Ready  
**Questions?** Check ARCHITECTURE_MIGRATION.md for detailed explanations
