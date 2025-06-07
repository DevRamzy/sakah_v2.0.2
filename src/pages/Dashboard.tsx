import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  ShieldCheck,
  Eye,
  AlertTriangle,
  CheckCircle,
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
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  savedListings: number;
  totalViews: number;
  totalInquiries: number;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const Dashboard: React.FC = () => {
  const { user, signOut, isAdmin, profile: authProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    publishedListings: 0,
    draftListings: 0,
    savedListings: 0,
    totalViews: 0,
    totalInquiries: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Your listing "Downtown Apartment" has 5 new views', time: '2 hours ago', read: false, type: 'info', link: '/listings/1' },
    { id: 2, message: 'New message from a potential customer', time: '1 day ago', read: true, type: 'success', link: '/messages/1' },
    { id: 3, message: 'Your account has been successfully verified', time: '3 days ago', read: true, type: 'success' }
  ]);
  const [activities, setActivities] = useState<Activity[]>([
    { 
      id: 1, 
      type: 'profile', 
      title: 'Profile Updated', 
      description: 'You updated your profile information',
      time: '2 days ago',
      icon: User,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      id: 2, 
      type: 'listing', 
      title: 'Listing Published', 
      description: 'Your listing "Downtown Apartment" was published',
      time: '3 days ago',
      icon: ListChecks,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    { 
      id: 3, 
      type: 'message', 
      title: 'New Message', 
      description: 'You received a new message about your listing',
      time: '5 days ago',
      icon: MessageSquare,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const navigate = useNavigate();

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  // Initialize tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'listings', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      // Fetch all data in a single query where possible to improve performance
      const [profileResponse, statsResponse] = await Promise.all([
        // Profile data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
          
        // Stats data - using RPC for better performance
        supabase.rpc('get_user_dashboard_stats', { user_id: user.id })
      ]);
      
      // Handle profile data
      if (profileResponse.error) {
        // If profile doesn't exist, create it
        if (profileResponse.error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              full_name: '',
              avatar_url: '',
              role: 'user'
            }]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            setProfile(newProfile);
          }
        } else {
          console.error('Error fetching profile:', profileResponse.error);
        }
      } else {
        setProfile(profileResponse.data);
      }
      
      // Handle stats data
      if (statsResponse.error) {
        console.error('Error fetching stats:', statsResponse.error);
        
        // Fallback to separate queries if RPC fails
        const [totalCount, publishedCount] = await Promise.all([
          supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
            
          supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_published', true)
        ]);
        
        const draftCount = (totalCount.count || 0) - (publishedCount.count || 0);
        
        setStats({
          totalListings: totalCount.count || 0,
          publishedListings: publishedCount.count || 0,
          draftListings: draftCount,
          savedListings: 3, // Placeholder
          totalViews: 120, // Placeholder
          totalInquiries: 8 // Placeholder
        });
      } else {
        setStats({
          totalListings: statsResponse.data.total_listings || 0,
          publishedListings: statsResponse.data.published_listings || 0,
          draftListings: statsResponse.data.draft_listings || 0,
          savedListings: 3, // Placeholder
          totalViews: 120, // Placeholder
          totalInquiries: 8 // Placeholder
        });
      }
      
      // Fetch notifications and activities in a real implementation
      // For now, we'll use the mock data
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, fetchDashboardData]);

  // Redirect to login if not authenticated
  if (!user && !loading) {
    return <Navigate to="/auth\" replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
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
                    aria-label="Create a new listing"
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
                    <ListChecks className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    All
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.totalListings}</h3>
                <p className="text-neutral-500 text-sm">Total Listings</p>
                <Link 
                  to="/dashboard?tab=listings" 
                  className="mt-4 text-sm text-blue-600 flex items-center hover:underline"
                  aria-label="View all listings"
                >
                  View all <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart2 className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.publishedListings}</h3>
                <p className="text-neutral-500 text-sm">Published Listings</p>
                <Link 
                  to="/dashboard?tab=listings&filter=published" 
                  className="mt-4 text-sm text-green-600 flex items-center hover:underline"
                  aria-label="View published listings"
                >
                  View published <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.draftListings}</h3>
                <p className="text-neutral-500 text-sm">Draft Listings</p>
                <Link 
                  to="/dashboard?tab=listings&filter=draft" 
                  className="mt-4 text-sm text-yellow-600 flex items-center hover:underline"
                  aria-label="View draft listings"
                >
                  View drafts <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Heart className="w-6 h-6 text-red-600" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    Saved
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800">{stats.savedListings}</h3>
                <p className="text-neutral-500 text-sm">Saved Listings</p>
                <Link 
                  to="/dashboard?tab=saved" 
                  className="mt-4 text-sm text-red-600 flex items-center hover:underline"
                  aria-label="View saved listings"
                >
                  View saved <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                  Listing Views
                </h3>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-3xl font-bold text-neutral-800">{stats.totalViews}</p>
                    <p className="text-sm text-neutral-500">Total views this month</p>
                  </div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span className="font-medium">+12%</span>
                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </div>
                </div>
                <div className="h-24 w-full bg-neutral-50 rounded-lg flex items-end p-2">
                  {/* Placeholder for chart - would be replaced with actual chart component */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-blue-500 rounded-t-sm mx-0.5" 
                      style={{ 
                        height: `${Math.max(15, Math.floor(Math.random() * 100))}%`,
                        opacity: i === 13 ? 1 : 0.7 - (13 - i) * 0.05
                      }}
                      aria-hidden="true"
                    ></div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-600" aria-hidden="true" />
                  Inquiries
                </h3>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-3xl font-bold text-neutral-800">{stats.totalInquiries}</p>
                    <p className="text-sm text-neutral-500">Total inquiries this month</p>
                  </div>
                  <div className="text-sm text-green-600 flex items-center">
                    <span className="font-medium">+5%</span>
                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </div>
                </div>
                <div className="h-24 w-full bg-neutral-50 rounded-lg flex items-end p-2">
                  {/* Placeholder for chart - would be replaced with actual chart component */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-green-500 rounded-t-sm mx-0.5" 
                      style={{ 
                        height: `${Math.max(10, Math.floor(Math.random() * 80))}%`,
                        opacity: i === 13 ? 1 : 0.7 - (13 - i) * 0.05
                      }}
                      aria-hidden="true"
                    ></div>
                  ))}
                </div>
              </motion.div>
            </div>
            
            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-neutral-800">Recent Activity</h3>
                    <Link to="/dashboard/activity" className="text-sm text-yellow-600 hover:text-yellow-700">
                      View all
                    </Link>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {activities.map(activity => (
                        <div key={activity.id} className="flex items-start">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
                            <activity.icon className={`h-5 w-5 ${activity.iconColor}`} aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-neutral-800">{activity.title}</p>
                            <p className="text-sm text-neutral-500">{activity.description}</p>
                            <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                      
                      {activities.length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
                          <p className="text-neutral-500">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-neutral-800">Notifications</h3>
                    <div className="flex items-center">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full mr-2">
                        {notifications.filter(n => !n.read).length}
                      </span>
                      {notifications.length > 0 && (
                        <button 
                          onClick={handleMarkAllNotificationsAsRead}
                          className="text-xs text-neutral-600 hover:text-neutral-800"
                          aria-label="Mark all as read"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-neutral-200 max-h-[400px] overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-neutral-50 transition-colors ${!notification.read ? 'bg-yellow-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-start">
                              {notification.type === 'success' && (
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                              )}
                              {notification.type === 'warning' && (
                                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                              )}
                              {notification.type === 'error' && (
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                              )}
                              {notification.type === 'info' && (
                                <Bell className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                              )}
                              <p className={`text-sm ${!notification.read ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
                                {notification.message}
                              </p>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                            {notification.link && (
                              <Link 
                                to={notification.link} 
                                className="text-xs text-yellow-600 hover:text-yellow-700 mt-1 inline-block"
                                onClick={() => handleMarkNotificationAsRead(notification.id)}
                              >
                                View details
                              </Link>
                            )}
                          </div>
                          <div className="flex items-start ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkNotificationAsRead(notification.id)}
                                className="text-neutral-400 hover:text-neutral-600 p-1"
                                aria-label="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-neutral-400 hover:text-neutral-600 p-1"
                              aria-label="Delete notification"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-neutral-500">No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 text-center border-t border-neutral-200">
                      <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  )}
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
                          <img 
                            src={profile.avatar_url} 
                            alt="Profile" 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <User className="h-16 w-16 text-neutral-400" aria-hidden="true" />
                        )}
                      </div>
                      <button 
                        className="absolute bottom-0 right-0 bg-yellow-500 text-black p-2 rounded-full hover:bg-yellow-600 transition-colors"
                        aria-label="Upload new profile picture"
                      >
                        <PlusCircle className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          defaultValue={profile?.full_name || ''}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          aria-describedby="fullNameHelp"
                        />
                        <p id="fullNameHelp" className="mt-1 text-xs text-neutral-500">
                          Your full name as you'd like it displayed
                        </p>
                      </div>
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                          Username
                        </label>
                        <input
                          id="username"
                          type="text"
                          defaultValue={profile?.username || ''}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          aria-describedby="usernameHelp"
                        />
                        <p id="usernameHelp" className="mt-1 text-xs text-neutral-500">
                          This will be used in your profile URL
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
                        aria-describedby="emailHelp"
                      />
                      <p id="emailHelp" className="mt-1 text-xs text-neutral-500">
                        To change your email address, please contact support.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Tell us a bit about yourself..."
                        aria-describedby="bioHelp"
                      ></textarea>
                      <p id="bioHelp" className="mt-1 text-xs text-neutral-500">
                        Brief description for your profile. URLs are hyperlinked.
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                        aria-label="Save profile changes"
                      >
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
                  <button 
                    className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                    aria-label="Change password"
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="pt-6 border-t border-neutral-200">
                  <h4 className="text-md font-medium text-neutral-800 mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Add an extra layer of security to your account.
                  </p>
                  <button 
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
                    aria-label="Enable two-factor authentication"
                  >
                    Enable 2FA
                  </button>
                </div>
                
                <div className="pt-6 border-t border-neutral-200">
                  <h4 className="text-md font-medium text-neutral-800 mb-2">Account Deactivation</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Temporarily deactivate or permanently delete your account.
                  </p>
                  <button 
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    aria-label="Deactivate account"
                  >
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
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      defaultChecked 
                      aria-label="Toggle email notifications"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <h4 className="text-md font-medium text-neutral-800">Listing Updates</h4>
                    <p className="text-sm text-neutral-600">Get notified about views, inquiries, and interactions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      defaultChecked 
                      aria-label="Toggle listing update notifications"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <h4 className="text-md font-medium text-neutral-800">Marketing Communications</h4>
                    <p className="text-sm text-neutral-600">Receive promotional offers and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      aria-label="Toggle marketing communications"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    aria-label="Save notification preferences"
                  >
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
            <button 
              className="relative text-white hover:text-yellow-400 transition-colors"
              onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
              aria-label={`Notifications (${notifications.filter(n => !n.read).length} unread)`}
            >
              <Bell className="h-6 w-6" aria-hidden="true" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
                aria-label="User menu"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <User className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <span className="hidden md:inline-block">{profile?.full_name || profile?.username || 'User'}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 hidden group-hover:block" role="menu">
                <Link 
                  to="/dashboard?tab=settings" 
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  role="menuitem"
                >
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    role="menuitem"
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotificationsPanel && (
        <div className="fixed inset-0 z-40 overflow-hidden" aria-labelledby="notifications-panel">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-neutral-500 bg-opacity-75 transition-opacity" onClick={() => setShowNotificationsPanel(false)}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex" aria-labelledby="notifications-panel-heading">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  <div className="px-4 py-6 sm:px-6 border-b border-neutral-200">
                    <div className="flex items-start justify-between">
                      <h2 id="notifications-panel-heading" className="text-lg font-medium text-neutral-900">Notifications</h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          onClick={() => setShowNotificationsPanel(false)}
                          className="bg-white rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none"
                          aria-label="Close panel"
                        >
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-neutral-500">
                        You have {notifications.filter(n => !n.read).length} unread notifications
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleMarkAllNotificationsAsRead}
                          className="text-sm text-yellow-600 hover:text-yellow-700"
                          aria-label="Mark all as read"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 divide-y divide-neutral-200 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3\" aria-hidden="true" />
                        <p className="text-neutral-500">No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 hover:bg-neutral-50 transition-colors ${!notification.read ? 'bg-yellow-50' : ''}`}
                        >
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <div className="flex items-start">
                                {notification.type === 'success' && (
                                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                                )}
                                {notification.type === 'warning' && (
                                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                                )}
                                {notification.type === 'error' && (
                                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                                )}
                                {notification.type === 'info' && (
                                  <Bell className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5\" aria-hidden="true" />
                                )}
                                <p className={`text-sm ${!notification.read ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
                                  {notification.message}
                                </p>
                              </div>
                              <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                              {notification.link && (
                                <Link 
                                  to={notification.link} 
                                  className="text-xs text-yellow-600 hover:text-yellow-700 mt-1 inline-block"
                                  onClick={() => {
                                    handleMarkNotificationAsRead(notification.id);
                                    setShowNotificationsPanel(false);
                                  }}
                                >
                                  View details
                                </Link>
                              )}
                            </div>
                            <div className="flex items-start ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  className="text-neutral-400 hover:text-neutral-600 p-1"
                                  aria-label="Mark as read"
                                >
                                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-neutral-400 hover:text-neutral-600 p-1"
                                aria-label="Delete notification"
                              >
                                <X className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

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
                <nav className="p-4 space-y-1" aria-label="Dashboard navigation">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-yellow-500 text-black' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    aria-current={activeTab === 'overview' ? 'page' : undefined}
                  >
                    <Home className={`mr-3 h-5 w-5 ${activeTab === 'overview' ? 'text-black' : 'text-neutral-500'}`} aria-hidden="true" />
                    Dashboard Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'listings' ? 'bg-yellow-500 text-black' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    aria-current={activeTab === 'listings' ? 'page' : undefined}
                  >
                    <ListChecks className={`mr-3 h-5 w-5 ${activeTab === 'listings' ? 'text-black' : 'text-neutral-500'}`} aria-hidden="true" />
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-yellow-500 text-black' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    aria-current={activeTab === 'settings' ? 'page' : undefined}
                  >
                    <Settings className={`mr-3 h-5 w-5 ${activeTab === 'settings' ? 'text-black' : 'text-neutral-500'}`} aria-hidden="true" />
                    Account Settings
                  </button>
                  <Link
                    to="/create-listing"
                    className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
                    aria-label="Create a new listing"
                  >
                    <PlusCircle className="mr-3 h-5 w-5 text-neutral-500" aria-hidden="true" />
                    Create Listing
                  </Link>
                  
                  {/* Admin Panel Link - Only visible for admin users */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                      aria-label="Go to admin panel"
                    >
                      <ShieldCheck className="mr-3 h-5 w-5 text-yellow-500" aria-hidden="true" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
                    aria-label="Sign out"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-red-500" aria-hidden="true" />
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