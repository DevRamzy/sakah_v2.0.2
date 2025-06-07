import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ListingsTab from '../features/listings/components/dashboard/ListingsTab';
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Settings, 
  Home, 
  X 
} from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

interface DashboardStats {
  total_listings: number;
  published_listings: number;
  draft_listings: number;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    total_listings: 0,
    published_listings: 0,
    draft_listings: 0
  });
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [rejectedListings, setRejectedListings] = useState<any[]>([]);

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
          
          // Fetch dashboard stats
          try {
            const { data: statsData, error: statsError } = await supabase.rpc('get_user_dashboard_stats', {
              user_id: user.id
            });
            
            if (statsError) {
              console.error('Error fetching stats:', statsError);
              
              // Fallback to direct queries if RPC fails
              const [totalRes, publishedRes] = await Promise.all([
                supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_published', true)
              ]);
              
              const total = totalRes.count || 0;
              const published = publishedRes.count || 0;
              
              setStats({
                total_listings: total,
                published_listings: published,
                draft_listings: total - published
              });
            } else {
              setStats({
                total_listings: statsData.total_listings || 0,
                published_listings: statsData.published_listings || 0,
                draft_listings: statsData.draft_listings || 0
              });
            }
          } catch (statsError) {
            console.error('Error in stats flow:', statsError);
          }
          
          // Fetch pending listings
          const { data: pendingData } = await supabase
            .from('listings')
            .select('id, business_name, category, created_at, status')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (pendingData) {
            setPendingListings(pendingData);
          }
          
          // Fetch rejected listings
          const { data: rejectedData } = await supabase
            .from('listings')
            .select('id, business_name, category, created_at, status, rejection_reason')
            .eq('user_id', user.id)
            .eq('status', 'rejected')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (rejectedData) {
            setRejectedListings(rejectedData);
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

  // Redirect to login if not authenticated
  if (!user && !loading) {
    return <Navigate to="/auth\" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'listings':
        return user ? <ListingsTab userId={user.id} /> : null;
      case 'overview':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-neutral-800">{stats.total_listings}</h3>
                <p className="text-neutral-500 text-sm">Total Listings</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-neutral-800">{stats.published_listings}</h3>
                <p className="text-neutral-500 text-sm">Approved Listings</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-neutral-800">{pendingListings.length}</h3>
                <p className="text-neutral-500 text-sm">Pending Approval</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-neutral-500" />
                  Account Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <User className="w-5 h-5 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-neutral-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="text-neutral-800">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-neutral-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-neutral-500">Member since</p>
                      <p className="text-neutral-800">{user?.created_at ? formatDate(user.created_at) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-neutral-100">
                  <Link 
                    to="/dashboard/profile" 
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
              
              {/* Pending Approvals */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-neutral-500" />
                  Pending Approvals
                </h3>
                
                {pendingListings.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-neutral-600">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingListings.map(listing => (
                      <div key={listing.id} className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-neutral-800">{listing.business_name}</p>
                            <p className="text-sm text-neutral-500">
                              {listing.category.replace('_', ' ')} • Submitted on {formatDate(listing.created_at)}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {pendingListings.length > 0 && (
                      <div className="mt-4 text-center">
                        <Link 
                          to="/dashboard/listings?status=pending" 
                          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          View All Pending
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Rejected Listings */}
              {rejectedListings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 md:col-span-2">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    Rejected Listings
                  </h3>
                  
                  <div className="space-y-3">
                    {rejectedListings.map(listing => (
                      <div key={listing.id} className="p-4 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-neutral-800">{listing.business_name}</p>
                            <p className="text-sm text-neutral-500">
                              {listing.category.replace('_', ' ')} • Rejected on {formatDate(listing.created_at)}
                            </p>
                            {listing.rejection_reason && (
                              <p className="mt-2 text-sm text-red-600">
                                <strong>Reason:</strong> {listing.rejection_reason}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Rejected
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Link 
                            to={`/edit-listing/${listing.id}`}
                            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            Edit & Resubmit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  to="/create-listing" 
                  className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Plus className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-neutral-800">Create New Listing</span>
                </Link>
                
                <Link 
                  to="/dashboard/listings" 
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-neutral-800">Manage Listings</span>
                </Link>
                
                <Link 
                  to="/dashboard/settings" 
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Settings className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium text-neutral-800">Account Settings</span>
                </Link>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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