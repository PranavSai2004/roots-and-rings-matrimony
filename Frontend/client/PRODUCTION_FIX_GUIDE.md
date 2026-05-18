# PRODUCTION FIX GUIDE - P0/P1 Issues
## Quick Reference for Pre-Launch Fixes

**Total Time**: ~3-4 hours  
**Risk Level**: LOW — All fixes are isolated, non-breaking changes

---

## P0-1: Admin Route Authentication (15 min)

### Issue
Anyone can access `/admin/dashboard` without authentication.

### Current Code (src/App.jsx)
```javascript
{/* Admin Routes - UNPROTECTED */}
<Route path="/admin" element={<AdminLayout />}>
  <Route path="dashboard" element={<AdminDashboard />} />
</Route>
```

### Fixed Code
```javascript
{/* Admin Routes - PROTECTED */}
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<AdminDashboard />} />
</Route>
```

### Verification
```bash
# Test: Unauthenticated user tries to access /admin
# Expected: Redirects to AccessGate (unauthorized page)

# Test: Authenticated user accesses /admin
# Expected: Shows AdminLayout and dashboard
```

---

## P0-2: Progress Flag Sync (30 min)

### Issue
- AuthContext uses: `form1Completed`, `form2Unlocked`, `form2Completed`, `paymentDone`
- OnboardingProgressContext uses: `basicDetailsCompleted`, `marriageDetailsCompleted`, `paymentConfirmed`
- onboardingFlow.js expects: `basicDetailsCompleted`, `photosUploaded`, `paymentConfirmed`, `profileApproved`
- Result: Dashboard reads stale progress, guards use correct progress, inconsistent

### Strategy
Rename all progress keys to match ONBOARDING_SEQUENCE exactly.

### Step 1: Update OnboardingProgressContext.jsx (Already has correct keys ✅)
```javascript
const defaultProgress = {
  otpVerified: false,
  basicDetailsCompleted: false,
  photosUploaded: false,
  verificationInProgress: false,
  paymentConfirmed: false,
  marriageDetailsUnlocked: false,
  marriageDetailsCompleted: false,
  profileApproved: false,
};
```

### Step 2: Update AuthContext.jsx - Remove userProgress (OLD)
```javascript
// REMOVE THIS:
const [userProgress, setUserProgress] = useState({
  otpVerified: false,
  form1Completed: false,
  photosUploaded: false,
  verificationInProgress: false,
  form2Unlocked: false,
  form2Completed: false,
  paymentDone: false,
});

// AND THIS in loginUser:
updateProgress({ otpVerified: true });

// AND THIS in value object:
// userProgress is no longer needed
```

### Step 3: Update AuthContext useEffect - Remove userProgress sync
```javascript
// BEFORE:
useEffect(() => {
  const storedUser = safeParseStoredValue('user', null);
  const storedProgress = safeParseStoredValue('userProgress', null);  // ❌ REMOVE

  if (storedUser) {
    setUser(storedUser);
    setIsAuthenticated(true);
  }

  if (storedProgress) {
    setUserProgress(storedProgress);  // ❌ REMOVE
  }

  setLoading(false);
}, []);

// AFTER:
useEffect(() => {
  const storedUser = safeParseStoredValue('user', null);

  if (storedUser) {
    setUser(storedUser);
    setIsAuthenticated(true);
  }

  setLoading(false);
}, []);
```

### Step 4: Update Dashboard.jsx - Read from OnboardingProgressContext only
```javascript
// BEFORE:
const { user, userProgress } = useAuth();
const { progress } = useOnboardingProgress();

const progressSteps = [
  {
    id: 'form1',
    label: 'Form-1 Completed',
    completed: userProgress.form1Completed,  // ❌ Wrong source
    icon: User,
  },
  // ...
];

// AFTER:
const { user } = useAuth();
const { progress } = useOnboardingProgress();

const progressSteps = [
  {
    id: 'form1',
    label: 'Form-1 Completed',
    completed: progress.basicDetailsCompleted,  // ✅ Correct source
    icon: User,
  },
  {
    id: 'photos',
    label: 'Photos Uploaded',
    completed: progress.photosUploaded,  // ✅ Correct source
    icon: Camera,
  },
  {
    id: 'payment',
    label: 'Payment Confirmed',
    completed: progress.paymentConfirmed,  // ✅ Correct source (new)
    icon: Heart,
  },
  // Remove: profile under review, form2 unlocked (replace with actual progress keys)
];

// Update profileCompletion calculation:
const profileCompletion = Math.round(
  (Object.values(progress).filter(Boolean).length /
    Object.keys(progress).length) *
    100
);
```

### Step 5: Update All Form Pages - Use progress.basicDetailsCompleted, etc.
```javascript
// Form1.jsx
const quickActions = [
  {
    id: 'profile',
    label: 'Complete Profile',
    icon: User,
    color: 'from-gold-400 to-gold-500',
    action: () => navigate('/app/basic-details'),
    disabled: progress.basicDetailsCompleted,  // ✅ Changed
  },
  {
    id: 'photos',
    label: 'Upload Photos',
    icon: Camera,
    color: 'from-gold-400 to-gold-500',
    action: () => navigate('/app/upload-photos'),
    disabled: progress.photosUploaded,  // ✅ Changed
  },
  {
    id: 'interested',
    label: 'Marriage Details',
    icon: Heart,
    color: 'from-gold-500 to-gold-600',
    action: () => navigate(progress.paymentConfirmed ? '/app/marriage-details' : '/app/marriage-details-unlock'),  // ✅ Changed
    disabled: false,
  },
];
```

### Step 6: Update form submission handlers
```javascript
// Form1.jsx - handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep()) return;

  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
    updateProgress({ basicDetailsCompleted: true });  // ✅ Changed from form1Completed
    navigate('/app/upload-photos');
  }, 800);
};

// Form2.jsx - handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep()) return;

  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
    updateProgress({ marriageDetailsCompleted: true });  // ✅ Changed from form2Completed
    navigate('/app/final-review');
  }, 800);
};

// PhotoUploadScreen.jsx - handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
    updateProgress({ photosUploaded: true });  // ✅ Correct
    navigate('/app/payment-status');
  }, 800);
};

// PaymentScreen.jsx - handleConfirmPayment (when payment complete)
const handleConfirmPayment = () => {
  updateProgress({ paymentConfirmed: true });  // ✅ Changed from paymentDone
  navigate('/app/form-2-unlock');
};
```

### Verification
```bash
# Test 1: Submit Form1, check progress
# Expected: progress.basicDetailsCompleted === true

# Test 2: Try accessing form2 before payment
# Expected: OnboardingGuard redirects to /app/payment-status

# Test 3: Dashboard progress bar
# Expected: Accurate completion percentage
```

---

## P1-1: Form Validation (30 min)

### Issue
Forms accept empty fields. Need proper validation.

### Create: src/lib/formValidation.js
```javascript
/**
 * Form validation utilities
 */

export const validateForm1Step = (stepNumber, data) => {
  const errors = {};

  if (stepNumber === 1) {
    // Personal Details
    if (!data.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    } else if (data.fullName.trim().length < 3) {
      errors.fullName = 'Name must be at least 3 characters';
    }

    if (!data.gender) {
      errors.gender = 'Please select gender';
    }

    if (!data.dob) {
      errors.dob = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(data.dob).getFullYear();
      if (age < 18) {
        errors.dob = 'Must be at least 18 years old';
      }
    }

    if (!data.height) {
      errors.height = 'Height is required';
    }
  } else if (stepNumber === 2) {
    // Religious Details
    if (!data.religion) {
      errors.religion = 'Religion is required';
    }

    if (!data.caste) {
      errors.caste = 'Caste is required';
    }

    if (!data.motherTongue) {
      errors.motherTongue = 'Mother tongue is required';
    }
  } else if (stepNumber === 3) {
    // Professional Details
    if (!data.education) {
      errors.education = 'Education is required';
    }

    if (!data.occupation?.trim()) {
      errors.occupation = 'Occupation is required';
    }

    if (!data.city?.trim()) {
      errors.city = 'City is required';
    } else if (data.city.trim().length < 2) {
      errors.city = 'City name must be at least 2 characters';
    }

    if (!data.state) {
      errors.state = 'State is required';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateForm2 = (data) => {
  const errors = {};

  if (!data.height) {
    errors.height = 'Height is required';
  }

  if (!data.familyType) {
    errors.familyType = 'Family type is required';
  }

  if (!data.siblings) {
    errors.siblings = 'Number of siblings is required';
  }

  if (!data.maritalStatus) {
    errors.maritalStatus = 'Marital status is required';
  }

  if (!data.expectations?.trim()) {
    errors.expectations = 'Expectations are required';
  } else if (data.expectations.trim().length < 10) {
    errors.expectations = 'Please provide at least 10 characters';
  } else if (data.expectations.trim().length > 500) {
    errors.expectations = 'Expectations cannot exceed 500 characters';
  }

  if (!data.lifestyle?.trim()) {
    errors.lifestyle = 'Lifestyle information is required';
  } else if (data.lifestyle.trim().length < 10) {
    errors.lifestyle = 'Please provide at least 10 characters';
  }

  if (!data.aboutMe?.trim()) {
    errors.aboutMe = 'About me is required';
  } else if (data.aboutMe.trim().length < 20) {
    errors.aboutMe = 'Please provide at least 20 characters';
  } else if (data.aboutMe.trim().length > 700) {
    errors.aboutMe = 'About me cannot exceed 700 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### Update: Form1.jsx
```javascript
import { validateForm1Step } from '../../lib/formValidation';

export const Form1 = () => {
  // ... existing code ...

  const validateStep = () => {
    const { isValid, errors } = validateForm1Step(currentStep, formData);
    if (!isValid) {
      setErrors(errors);
      return false;
    }
    return true;
  };

  // ... rest of component ...
};
```

### Update: Form2.jsx
```javascript
import { validateForm2 } from '../../lib/formValidation';

export const Form2 = () => {
  // ... existing code ...

  const validateStep = () => {
    const { isValid, errors } = validateForm2(formData);
    if (!isValid) {
      setErrors(errors);
      return false;
    }
    return true;
  };

  // ... rest of component ...
};
```

### Verification
```bash
# Test 1: Try to submit Form1 with empty fullName
# Expected: Error message shows "Full name is required"

# Test 2: Try to submit with age < 18
# Expected: Error message shows "Must be at least 18 years old"

# Test 3: Submit valid form
# Expected: No error messages, form advances
```

---

## P1-2: Form Save Feedback (20 min)

### Update: src/components/shared/SaveNotification.jsx (NEW)
```javascript
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck as Check, FaExclamationTriangle as Warning } from 'react-icons/fa6';

export const SaveNotification = ({ show, type = 'success', message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 flex items-center gap-2 ${
            type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}
        >
          {type === 'success' ? (
            <Check size={18} />
          ) : (
            <Warning size={18} />
          )}
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### Update: Form1.jsx
```javascript
import { SaveNotification } from '../../components/shared/SaveNotification';

export const Form1 = () => {
  const [showSave, setShowSave] = useState(false);
  
  // In ProfileContext, detect when debounced save completes
  // For MVP, show notification after form update
  const handleChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    updateBasic(updatedFormData);
    
    // Show save feedback
    setShowSave(true);
    setTimeout(() => setShowSave(false), 2000);
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <>
      <SaveNotification show={showSave} message="Changes saved" />
      {/* ... form JSX ... */}
    </>
  );
};
```

### Verification
```bash
# Test 1: Type in form field
# Expected: Toast shows "Changes saved" after ~500ms

# Test 2: Refresh page
# Expected: Form data persists from localStorage
```

---

## P1-3: Real File Upload (45 min)

### Update: PhotoUploadScreen.jsx
```javascript
const uploadFile = async (file, photoType) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', photoType);

    // Replace with real API endpoint
    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser sets it with boundary
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      uploadedUrl: data.url,  // Backend returns the URL
      fileName: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// In component:
const handleUploadPhoto = async (photoType) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [photoType]: 'File too large (max 5MB)' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [photoType]: 'Invalid file type' }));
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);

    // Upload
    setIsLoading(true);
    try {
      const uploadedMeta = await uploadFile(file, photoType);
      
      // Store only metadata (not base64)
      updatePhotoMeta(photoType, {
        fileName: uploadedMeta.fileName,
        uploadedUrl: uploadedMeta.uploadedUrl,
        status: 'uploaded',
      });

      // Update preview
      setPreviewUrls(prev => ({ ...prev, [photoType]: preview }));
      
      // Clear error
      setErrors(prev => ({ ...prev, [photoType]: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [photoType]: 'Upload failed' }));
    } finally {
      setIsLoading(false);
    }
  };

  input.click();
};
```

### Verification
```bash
# Test 1: Upload valid image
# Expected: Shows preview, calls /api/photos/upload, stores URL in ProfileContext

# Test 2: Upload too-large file (>5MB)
# Expected: Shows error "File too large (max 5MB)"

# Test 3: Refresh page
# Expected: Uploaded photos persist (URLs shown, not base64)
```

---

## P1-4: Move Sensitive Data to sessionStorage (20 min)

### Update: AuthContext.jsx
```javascript
const safeParseStored = (key, storage, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const store = storage === 'session' ? window.sessionStorage : window.localStorage;
  const storedValue = store.getItem(key);
  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    store.removeItem(key);
    return fallback;
  }
};

export const AuthProvider = ({ children }) => {
  // ... existing code ...

  // Check sessionStorage for existing user on mount
  useEffect(() => {
    const storedUser = safeParseStored('user', 'session', null);  // ✅ Use sessionStorage

    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const loginUser = (phoneNumber) => {
    const newUser = {
      phoneNumber,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUser(newUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('user', JSON.stringify(newUser));  // ✅ Use sessionStorage
  };

  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('user');  // ✅ Use sessionStorage
    localStorage.removeItem('userProgress');  // Keep for cleanup
    setUserProgress({...});
  };

  // ... rest of component ...
};
```

### Why?
- **sessionStorage** is cleared when tab closes
- **localStorage** persists indefinitely
- Phone number should not persist across browser sessions
- Attack vector: XSS can read localStorage, but sessionStorage is cleared when tab closes

---

## P1-5: Cross-Tab State Sync (45 min)

### Update: OnboardingProgressContext.jsx
```javascript
export const OnboardingProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(() => safeRead());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // ✅ NEW: Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newProgress = JSON.parse(e.newValue);
          setProgress(newProgress);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateProgress = (updates) => setProgress(p => ({ ...p, ...updates }));
  const resetProgress = () => {
    setProgress(defaultProgress);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const value = useMemo(() => ({ progress, updateProgress, resetProgress }), [progress]);
  return <OnboardingProgressContext.Provider value={value}>{children}</OnboardingProgressContext.Provider>;
};
```

### Similar Update: ProfileContext.jsx
```javascript
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => readStored());

  // ... debounced write logic ...

  // ✅ NEW: Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newProfile = JSON.parse(e.newValue);
          setProfile(newProfile);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ... rest of component ...
};
```

### Verification
```bash
# Test 1: Open app in two tabs
# Tab A: Submit Form1
# Expected: Tab B instantly shows progress updated (cross-tab sync)

# Test 2: Modify progress in one tab
# Expected: Other tab reflects change within 100ms
```

---

## IMPLEMENTATION ORDER

1. **P0-1** (15 min): Admin auth guard — START HERE, highest blocking risk
2. **P0-2** (30 min): Progress flag unification — CRITICAL state consistency
3. **P1-1** (30 min): Form validation — Prevents invalid data submission
4. **P1-2** (20 min): Save feedback — UX improvement
5. **P1-3** (45 min): Real file upload — Connect to backend
6. **P1-4** (20 min): sessionStorage migration — Security improvement
7. **P1-5** (45 min): Cross-tab sync — Multi-tab support

**Total: ~3 hours 45 minutes**

---

## TESTING CHECKLIST

After each fix, verify:

```
[ ] Build passes: npm run build (zero errors)
[ ] No console warnings/errors
[ ] Can complete full onboarding flow
[ ] Refresh page at each step - data persists
[ ] Logout/login - correct reset
[ ] Admin page requires auth
[ ] Form validation prevents empty submissions
[ ] Save feedback appears
[ ] File upload works with real API
```

---

## ROLLBACK PLAN

If issues arise:
1. Revert Git commit
2. Rebuild
3. Test locally
4. Create bug ticket with reproduction steps

All changes are non-breaking and can be safely reverted.

---

**Created**: May 2026  
**Status**: Ready for implementation  
**Risk**: LOW
