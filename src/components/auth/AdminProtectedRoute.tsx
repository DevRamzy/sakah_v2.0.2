import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminProtectedRouteProps {
  redirectPath?: string;
}

/**
 * A route wrapper that only allows access to users with admin role
 * Redirects to the specified path if the user is not an admin
 */
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  redirectPath = '/dashboard'
}) => {
  const { user, profile, loading, isAdmin, refreshProfile } = useAuth();

  // Add diagnostic logging
  useEffect(() => {
    console.log('[AdminProtectedRoute] Rendering with state:', { 
      userExists: !!user, 
      profileExists: !!profile,
      isAdmin, 
      loading 
    });
  }, [user, profile, isAdmin, loading]);

  // If we have a user but no profile, try to refresh the profile
  useEffect(() => {
    if (user && !profile && !loading) {
      console.log('[AdminProtectedRoute] User exists but no profile, refreshing profile');
      refreshProfile();
    }
  }, [user, profile, loading, refreshProfile]);

  if (loading) {
    console.log('[AdminProtectedRoute] Still loading, showing spinner');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-gray-600">Checking admin access...</p>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('[AdminProtectedRoute] No user, redirecting to auth page');
    return <Navigate to="/auth" replace />;
  }

  // Handle case where profile might be null but user exists
  if (!profile) {
    console.log('[AdminProtectedRoute] User exists but profile is null, showing loading');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  // Redirect to dashboard if logged in but not an admin
  if (!isAdmin) {
    console.log('[AdminProtectedRoute] User is not admin, redirecting to', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // User is logged in and is an admin, render the protected content
  console.log('[AdminProtectedRoute] User is admin, rendering admin content');
  return <Outlet />;
};

export default AdminProtectedRoute;
