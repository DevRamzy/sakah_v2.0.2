import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CreateListingWizard from './features/listings/components/wizard/CreateListingWizard';
import UnifiedListingDetailPage from './pages/UnifiedListingDetailPage';
import ListingsPage from './pages/ListingsPage';
import MainLayout from './components/layout/MainLayout';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard\" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-listing" element={<CreateListingWizard />} />
        </Route>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/listings" element={<ListingsPage />} />
          {/* Unified listing detail page handles all listing types */}
          <Route path="/listings/:listingId" element={<UnifiedListingDetailPage />} />
          {/* Legacy property route redirects to unified page */}
          <Route path="/property/:listingId" element={<Navigate to="/listings/:listingId\" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/\" replace />} />
      </Routes>
    </Router>
  );
}

export default App