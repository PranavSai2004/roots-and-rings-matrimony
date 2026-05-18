import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { OnboardingProgressProvider } from './contexts/OnboardingProgressContext';
import { ProtectedRoute, PublicRoute } from './components/shared/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import OnboardingGuard from './components/shared/OnboardingGuard';

// Public Pages
import { Landing } from './pages/Landing';
import { EmailOTPScreen } from './pages/EmailOTPScreen';

// App Pages
import { Dashboard } from './pages/app/Dashboard';
import { Form1 } from './pages/app/Form1';
import { PhotoUploadScreen } from './pages/app/PhotoUploadScreen';
import { ReviewPendingScreen } from './pages/app/ReviewPendingScreen';
import { SharedProfilesScreen } from './pages/app/SharedProfilesScreen';
import { Form2 } from './pages/app/Form2';
import { PaymentScreen } from './pages/app/PaymentScreen';
import { Form2UnlockScreen } from './pages/app/Form2UnlockScreen';
import { FinalReviewScreen } from './pages/app/FinalReviewScreen';
import { ProfileSettings } from './pages/app/ProfileSettings';
import { Interests } from './pages/app/Interests';
import { MyProfile } from './pages/app/MyProfile';
import { SupportScreen } from './pages/app/SupportScreen';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <OnboardingProgressProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/auth/login" element={<PublicRoute><EmailOTPScreen /></PublicRoute>} />
            <Route path="/auth" element={<Navigate to="/auth/login" replace />} />

            {/* Legacy redirects (keep old URLs working) */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/otp-phone" element={<Navigate to="/auth/login" replace />} />
            <Route path="/otp-verify" element={<Navigate to="/auth/login" replace />} />
            <Route path="/otp-entry" element={<Navigate to="/auth/login" replace />} />


            {/* App routes grouped under /app - nested layout using AppLayout */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<OnboardingGuard required={[ 'otpVerified' ]}><Dashboard /></OnboardingGuard>} />
              <Route path="basic-details" element={<OnboardingGuard required={[ 'otpVerified' ]}><Form1 /></OnboardingGuard>} />
              <Route path="upload-photos" element={<OnboardingGuard required={[ 'basicDetailsCompleted' ]}><PhotoUploadScreen /></OnboardingGuard>} />
              <Route path="review-pending" element={<OnboardingGuard required={[ 'photosUploaded' ]}><ReviewPendingScreen /></OnboardingGuard>} />
              <Route path="payment-status" element={<OnboardingGuard required={[ 'profileApproved' ]}><PaymentScreen /></OnboardingGuard>} />
              <Route path="marriage-details" element={<OnboardingGuard required={[ 'paymentConfirmed' ]}><Form2 /></OnboardingGuard>} />
              <Route path="final-review" element={<OnboardingGuard required={[ 'marriageDetailsCompleted' ]}><FinalReviewScreen /></OnboardingGuard>} />
              <Route path="shared-profiles" element={<OnboardingGuard required={[ 'profileApproved' ]}><SharedProfilesScreen /></OnboardingGuard>} />
              <Route path="profile-settings" element={<ProfileSettings />} />
              <Route path="interests" element={<Interests />} />
              <Route path="my-profile" element={<MyProfile />} />
              <Route path="support" element={<SupportScreen />} />
            </Route>

            {/* Legacy app routes */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/basic-details" element={<Navigate to="/app/basic-details" replace />} />
            <Route path="/upload-photos" element={<Navigate to="/app/upload-photos" replace />} />
            <Route path="/marriage-details" element={<Navigate to="/app/marriage-details" replace />} />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </OnboardingProgressProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
