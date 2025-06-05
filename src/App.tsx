import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CreateListingWizard from './features/listings/components/wizard/CreateListingWizard';
import ListingDetailPage from './pages/ListingDetailPage';
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-listing" element={<CreateListingWizard />} />
          {/* Add more protected routes here */}
        </Route>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:listingId" element={<ListingDetailPage />} />
          {/* Add other public-facing routes here that need Header/Footer */}
        </Route>

        {/* The ListingDetailPage itself handles auth for draft listings - this comment seems to be related to a specific detail within ListingDetailPage and doesn't affect the layout structure. */}
        {/* Routes without MainLayout (e.g., if some protected routes shouldn't have it, or other specific cases) */}
        {/* For example, if there was a public homepage distinct from /listings: <Route path="/home" element={<HomePage />} /> */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App
