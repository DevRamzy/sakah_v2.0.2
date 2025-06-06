import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import CreateListingWizard from './features/listings/components/wizard/CreateListingWizard';
import UnifiedListingDetailPage from './pages/UnifiedListingDetailPage';
import ListingsPage from './pages/ListingsPage';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import { testSupabaseConnection } from './utils/supabaseTest';
import { useEffect } from 'react';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Category Landing Pages
import ServicesLandingPage from './pages/category/ServicesLandingPage';
import PropertyLandingPage from './pages/category/PropertyLandingPage';
import StoresLandingPage from './pages/category/StoresLandingPage';
import VehiclesLandingPage from './pages/category/VehiclesLandingPage';

// Category Archive Pages
import ServicesArchivePage from './pages/category/ServicesArchivePage';
import PropertyArchivePage from './pages/category/PropertyArchivePage';
import StoresArchivePage from './pages/category/StoresArchivePage';
import VehiclesArchivePage from './pages/category/VehiclesArchivePage';

function App() {
  const { loading } = useAuth();

  // Run Supabase connection test when the app loads
  useEffect(() => {
    console.log('[App] Running Supabase connection test...');
    testSupabaseConnection().then(result => {
      console.log('[App] Supabase connection test result:', result);
    });
  }, []);

  // Add more detailed loading state information
  if (loading) {
    console.log('[App] App is in loading state');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading application...</p>
      </div>
    );
  }
  
  console.log('[App] Loading complete, rendering routes');

  return (
    <Router>
      <Routes>
        {/* Landing page as the main route */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          
          {/* General listings page */}
          <Route path="/listings" element={<ListingsPage />} />
          
          {/* Category Landing Pages */}
          <Route path="/services" element={<ServicesLandingPage />} />
          <Route path="/property" element={<PropertyLandingPage />} />
          <Route path="/stores" element={<StoresLandingPage />} />
          <Route path="/vehicles" element={<VehiclesLandingPage />} />
          
          {/* Category Archive Pages */}
          <Route path="/services/browse" element={<ServicesArchivePage />} />
          <Route path="/property/browse" element={<PropertyArchivePage />} />
          <Route path="/stores/browse" element={<StoresArchivePage />} />
          <Route path="/vehicles/browse" element={<VehiclesArchivePage />} />
          
          {/* Unified listing detail page handles all listing types */}
          <Route path="/listings/:listingId" element={<UnifiedListingDetailPage />} />
          
          {/* Legacy property route redirects to unified page */}
          <Route path="/property/:listingId" element={<Navigate to="/listings/:listingId" replace />} />
        </Route>

        {/* Auth routes without layout */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected routes without main layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-listing" element={<CreateListingWizard />} />
        </Route>
        
        {/* Admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/listings" element={<AdminListingsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Catch all route redirects to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App