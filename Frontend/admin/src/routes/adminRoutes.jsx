import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import AdminLayout from '../components/admin/layout/AdminLayout';
import AdminLoginScreen from '../pages/admin/AdminLoginScreen';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PendingReviewList from '../pages/admin/PendingReviewList';
import ReviewDetailScreen from '../pages/admin/ReviewDetailScreen';
import PaymentQueueScreen from '../pages/admin/PaymentQueueScreen';
import PaymentHistoryScreen from '../pages/admin/PaymentHistoryScreen';
import Form2ReviewList from '../pages/admin/Form2ReviewList';
import Form2DetailReview from '../pages/admin/Form2DetailReview';
import SearchProfilesScreen from '../pages/admin/SearchProfilesScreen';
import BatchCreationScreen from '../pages/admin/BatchCreationScreen';
import BatchManagementScreen from '../pages/admin/BatchManagementScreen';
import InterestTrackingScreen from '../pages/admin/InterestTrackingScreen';
import InterestDetailScreen from '../pages/admin/InterestDetailScreen';
import MonitoringDashboard from '../pages/admin/MonitoringDashboard';
import AdminSettingsScreen from '../pages/admin/AdminSettingsScreen';
import MemberDirectoryScreen from '../pages/admin/MemberDirectoryScreen';
import AdminUserProfileView from '../pages/admin/AdminUserProfileView';

// Protected Route Wrapper
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* Login Route (Public) */}
      <Route path="/admin/login" element={<AdminLoginScreen />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Reviews - Profile Moderation */}
        <Route path="reviews" element={<PendingReviewList />} />
        <Route path="reviews/:profileId" element={<ReviewDetailScreen />} />

        {/* Payments - Payment Verification */}
        <Route path="payments" element={<PaymentQueueScreen />} />
        <Route path="payments/history" element={<PaymentHistoryScreen />} />

        {/* Form-2 - Marriage Details Review */}
        <Route path="form2" element={<Form2ReviewList />} />
        <Route path="form2/:profileId" element={<Form2DetailReview />} />

        {/* Search & Filter */}
        <Route path="search-profiles" element={<SearchProfilesScreen />} />

        {/* Batch Management */}
        <Route path="batches/create" element={<BatchCreationScreen />} />
        <Route path="batches" element={<BatchManagementScreen />} />

        {/* Interest CRM */}
        <Route path="interests" element={<InterestTrackingScreen />} />
        <Route path="interests/:interestId" element={<InterestDetailScreen />} />

        {/* Monitoring */}
        <Route path="monitoring" element={<MonitoringDashboard />} />

        {/* Settings */}
        <Route path="settings" element={<AdminSettingsScreen />} />

        {/* Member Directory */}
        <Route path="members" element={<MemberDirectoryScreen />} />

        {/* Full User Profile View */}
        <Route path="profile/:userId" element={<AdminUserProfileView />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
