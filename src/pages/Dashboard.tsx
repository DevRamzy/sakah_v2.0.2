import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ListingsTab from '../features/listings/components/dashboard/ListingsTab';
import { 
  Home, 
  ListChecks, 
  Settings, 
  PlusCircle, 
  LogOut, 
  User, 
  Bell, 
  Heart, 
  Clock, 
  ChevronRight,
  BarChart2,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

interface DashboardStats {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  savedListings: number;
}

const Dashboard: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    publishedListings: 0,
    draftListings: 0,
    savedListings: 0
  });
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your listing "Downtown Apartment" has 5 new views', time: '2 hours ago', read: false },
    { id: 2, message: 'New message from a potential customer', time: '1 day ago', read: true },
    { id: 3, message: 'Your account has been successfully verified', time: '3 days ago', read: true }
  ]);
  const navigate = useNavigate();

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
          const fetchStats = async () => {
            try {
              // Get total listings count
              const { count: totalCount } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
                
              // Get published listings count
              const { count: publishedCount } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_published', true);
                
              // Calculate draft listings
              const draftCount = (totalCount || 0) - (publishedCount || 0);
              
              // For now, use a placeholder for saved listings
              const savedCount = 3;
              
              setStats({
                totalListings: totalCount || 0,
                publishedListings: publishedCount || 0,
                draftListings: draftCount,
                savedListings: savedCount
              });
            } catch (error) {
              console.error('Error fetching stats:', error);
            }
          };
          
          fetchStats();
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
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-2">
                    Welcome back, {profile?.full_name || profile?.username || 'User'}!
                  </h2>
                  <p className="text-black/80 max-w-xl">
                    Manage your listings, track performance, and grow your presence on Sakah.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link 
                    to="/create-listing" 
                    className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Create New Listing
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ListChecks className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    All
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.totalListings}</h3>
                <p className="text-neutral-500 text-sm">Total Listings</p>
                <Link to="/dashboard?tab=listings" className="mt-4 text-sm text-blue-600 flex items-center hover:underline">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart2 className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.publishedListings}</h3>
                <p className="text-neutral-500 text-sm">Published Listings</p>
                <Link to="/dashboard?tab=listings&filter=published" className="mt-4 text-sm text-green-600 flex items-center hover:underline">
                  View published <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.draftListings}</h3>
                <p className="text-neutral-500 text-sm">Draft Listings</p>
                <Link to="/dashboard?tab=listings&filter=draft" className="mt-4 text-sm text-yellow-600 flex items-center hover:underline">
                  View drafts <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    Saved
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.savedListings}</h3>
                <p className="text-neutral-500 text-sm">Saved Listings</p>
                <Link to="/dashboard?tab=saved" className="mt-4 text-sm text-red-600 flex items-center hover:underline">
                  View saved <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            </div>
            
            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-neutral-800">Recent Activity</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-neutral-800">Profile Updated</p>
                          <p className="text-sm text-neutral-500">You updated your profile information</p>
                          <p className="text-xs text-neutral-400 mt-1">2 days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <ListChecks className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-neutral-800">Listing Published</p>
                          <p className="text-sm text-neutral-500">Your listing "Downtown Apartment" was published</p>
                          <p className="text-xs text-neutral-400 mt-1">3 days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-neutral-800">New Message</p>
                          <p className="text-sm text-neutral-500">You received a new message about your listing</p>
                          <p className="text-xs text-neutral-400 mt-1">5 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-neutral-800">Notifications</h3>
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-200">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-neutral-50 transition-colors ${!notification.read ? 'bg-yellow-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <p className={`text-sm ${!notification.read ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-yellow-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 text-center border-t border-neutral-200">
                    <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-neutral-800 mb-6">Account Settings</h2>
            
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Profile Information</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-16 w-16 text-neutral-400" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-yellow-500 text-black p-2 rounded-full hover:bg-yellow-600 transition-colors">
                        <PlusCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={profile?.full_name || ''}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          defaultValue={profile?.username || ''}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        To change your email address, please contact support.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Tell us a bit about yourself..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Security</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-md font-medium text-neutral-800 mb-2">Password</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Update your password to keep your account secure.
                  </p>
                  <button className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors">
                    Change Password
                  </button>
                </div>
                
                <div className="pt-6 border-t border-neutral-200">
                  <h4 className="text-md font-medium text-neutral-800 mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Add an extra layer of security to your account.
                  </p>
                  <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors">
                    Enable 2FA
                  </button>
                </div>
                
                <div className="pt-6 border-t border-neutral-200">
                  <h4 className="text-md font-medium text-neutral-800 mb-2">Account Deactivation</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Temporarily deactivate or permanently delete your account.
                  </p>
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
            
            {/* Notification Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Notification Preferences</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-neutral-800">Email Notifications</h4>
                    <p className="text-sm text-neutral-600">Receive updates about your account via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <h4 className="text-md font-medium text-neutral-800">Listing Updates</h4>
                    <p className="text-sm text-neutral-600">Get notified about views, inquiries, and interactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <h4 className="text-md font-medium text-neutral-800">Marketing Communications</h4>
                    <p className="text-sm text-neutral-600">Receive promotional offers and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-black shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/Sakah logo new.png" alt="Sakah Logo" className="h-8 mr-2" />
            </Link>
            <div className="hidden md:block ml-6">
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative text-white hover:text-yellow-400 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors">
                <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <span className="hidden md:inline-block">{profile?.full_name || profile?.username || 'User'}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 hidden group-hover:block">
                <Link to="/dashboard?tab=settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden sticky top-24">
                <nav className="p-4 space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-yellow-500 text-black' : 'text-neutral-700 hover:bg-neutral-100'}`}
                  >
                    <Home className={`mr-3 h-5 w-5 ${activeTab === 'overview' ? 'text-black' : 'text-neutral-500'}`} />
                    Dashboard Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'listings' ? 'bg-yellow-500 text-black' : 'text-neutral-700 hover:bg-neutral-100'}`}
                  >
                    <ListChecks className={`mr-3 h-5 w-5 ${activeTab === 'listings' ? 'text-black' : 'text-neutral-500'}`} />
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-yellow-500 text-black' : 'text-neutral-700 hover:bg-neutral-100'}`}
                  >
                    <Settings className={`mr-3 h-5 w-5 ${activeTab === 'settings' ? 'text-black' : 'text-neutral-500'}`} />
                    Account Settings
                  </button>
                  <Link
                    to="/create-listing"
                    className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <PlusCircle className="mr-3 h-5 w-5 text-neutral-500" />
                    Create Listing
                  </Link>
                  
                  {/* Admin Panel Link - Only visible for admin users */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                    >
                      <ShieldCheck className="mr-3 h-5 w-5 text-yellow-500" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-red-500" />
                    Sign Out
                  </button>
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