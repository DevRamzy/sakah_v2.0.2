import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ListingsTab from '../features/listings/components/dashboard/ListingsTab';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

interface DashboardStats {
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          // First check if the profile exists
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', user.id);

          if (countError) {
            console.error('Error checking profile existence:', countError);
            setLoading(false);
            return;
          }

          // If profile doesn't exist, create it
          if (count === 0) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: user.id,
                  username: user.email?.split('@')[0] || 'user',
                  full_name: '',
                  avatar_url: '',
                  role: 'user'
                }
              ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              setLoading(false);
              return;
            }
          }

          // Now fetch the profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error in profile flow:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setStatsLoading(true);
      setStatsError(null);
      
      try {
        const { data, error } = await supabase.rpc('get_user_dashboard_stats');
        
        if (error) {
          console.error('Error fetching stats:', error);
          setStatsError(error.message);
          return;
        }
        
        setStats(data);
      } catch (err) {
        console.error('Exception fetching stats:', err);
        setStatsError('Failed to load dashboard statistics');
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [user, activeTab]);

  // Redirect to login if not authenticated
  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return user ? <ListingsTab userId={user.id} /> : null;
      case 'overview':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="bg-primary-light rounded-full p-4">
                  <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{profile?.full_name || 'User'}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                    {profile?.role || 'user'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Listings Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Your Listings</h3>
              
              {statsLoading ? (
                <div className="bg-white rounded-lg shadow p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : statsError ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-red-500 text-center">
                    <p>{statsError}</p>
                    <button 
                      onClick={() => setStatsError(null)}
                      className="mt-2 text-primary hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500 text-sm">Total Listings</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.totalListings || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500 text-sm">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats?.pendingListings || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500 text-sm">Approved</p>
                    <p className="text-3xl font-bold text-green-500">{stats?.approvedListings || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500 text-sm">Rejected</p>
                    <p className="text-3xl font-bold text-red-500">{stats?.rejectedListings || 0}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Account Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p>{profile?.username || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account created</p>
                      <p className="text-xs text-gray-500">{user?.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last sign in</p>
                      <p className="text-xs text-gray-500">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 mb-4">Manage your account settings and preferences</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">Profile Information</h3>
                  <p className="text-sm text-gray-500 mb-4">Update your account's profile information</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out">
                    Edit Profile
                  </button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-2">Password</h3>
                  <p className="text-sm text-gray-500 mb-4">Ensure your account is using a secure password</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <header className="bg-charcoal shadow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/Sakah logo new.png" alt="Sakah Logo" className="h-8 mr-2" />
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-jet-black bg-primary hover:bg-jet-black hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-charcoal rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-medium text-white">Navigation</h2>
                </div>
                <nav className="p-4 space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-primary text-jet-black' : 'text-white hover:bg-charcoal hover:bg-opacity-80'}`}
                  >
                    <svg className={`mr-3 h-5 w-5 ${activeTab === 'overview' ? 'text-jet-black' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'listings' ? 'bg-primary text-jet-black' : 'text-white hover:bg-charcoal hover:bg-opacity-80'}`}
                  >
                    <svg className={`mr-3 h-5 w-5 ${activeTab === 'listings' ? 'text-jet-black' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'settings' ? 'bg-primary text-jet-black' : 'text-white hover:bg-charcoal hover:bg-opacity-80'}`}
                  >
                    <svg className={`mr-3 h-5 w-5 ${activeTab === 'settings' ? 'text-jet-black' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <Link
                    to="/create-listing"
                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-white hover:bg-charcoal hover:bg-opacity-80"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Listing
                  </Link>
                  
                  {/* Admin Panel Link - Only visible for admin users */}
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-yellow-500 text-black hover:bg-yellow-600"
                    >
                      <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;