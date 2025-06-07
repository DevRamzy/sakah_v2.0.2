import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Users, 
  ListChecks, 
  Settings, 
  Clock, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  totalListings: number;
  pendingListings: number;
  totalUsers: number;
  featuredListings: number;
}

interface RecentActivity {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  admin_name?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    pendingListings: 0,
    totalUsers: 0,
    featuredListings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsByCategory, setListingsByCategory] = useState({
    SERVICES: 0,
    PROPERTY: 0,
    STORE: 0,
    AUTO_DEALERSHIP: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch total listings count
        const { count: totalListings } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true });
        
        // Fetch pending listings count
        const { count: pendingListings } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', false);
        
        // Fetch featured listings count
        const { count: featuredListings } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true);
        
        // Fetch total users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch recent admin activity
        const { data: activityData, error: activityError } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (activityError) {
          console.error('Error fetching activity logs:', activityError);
        } else if (activityData) {
          // Fetch admin names for the activity logs
          const adminIds = [...new Set(activityData.map(item => item.admin_id))];
          
          if (adminIds.length > 0) {
            const { data: admins } = await supabase
              .from('profiles')
              .select('id, full_name, username')
              .in('id', adminIds);
            
            const adminMap = new Map();
            admins?.forEach(admin => {
              adminMap.set(admin.id, admin.full_name || admin.username || 'Unknown Admin');
            });
            
            const enrichedActivity = activityData.map(item => ({
              ...item,
              admin_name: adminMap.get(item.admin_id) || 'Unknown Admin'
            }));
            
            setRecentActivity(enrichedActivity);
          } else {
            setRecentActivity(activityData);
          }
        }
        
        // Fetch listings by category
        const { data: categoryData, error: categoryError } = await supabase
          .from('listings')
          .select('category, count')
          .group('category');
          
        if (!categoryError && categoryData) {
          const categoryMap = {
            SERVICES: 0,
            PROPERTY: 0,
            STORE: 0,
            AUTO_DEALERSHIP: 0
          };
          
          categoryData.forEach(item => {
            if (item.category in categoryMap) {
              categoryMap[item.category as keyof typeof categoryMap] = item.count;
            }
          });
          
          setListingsByCategory(categoryMap);
        }
        
        // Fetch recent users
        const { data: recentUsersData } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentUsersData) {
          setRecentUsers(recentUsersData);
        }
        
        // Fetch pending approvals (listings awaiting review)
        const { data: pendingApprovalsData } = await supabase
          .from('listings')
          .select('id, business_name, category, user_id, created_at')
          .eq('is_published', false)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (pendingApprovalsData) {
          // Get user info for each listing
          const userIds = [...new Set(pendingApprovalsData.map(item => item.user_id))];
          
          if (userIds.length > 0) {
            const { data: users } = await supabase
              .from('profiles')
              .select('id, username, full_name')
              .in('id', userIds);
              
            const userMap = new Map();
            users?.forEach(user => {
              userMap.set(user.id, user.full_name || user.username || 'Unknown User');
            });
            
            const enrichedApprovals = pendingApprovalsData.map(item => ({
              ...item,
              owner_name: userMap.get(item.user_id) || 'Unknown User'
            }));
            
            setPendingApprovals(enrichedApprovals);
          } else {
            setPendingApprovals(pendingApprovalsData);
          }
        }
        
        setStats({
          totalListings: totalListings || 0,
          pendingListings: pendingListings || 0,
          totalUsers: totalUsers || 0,
          featuredListings: featuredListings || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-green-100 text-green-800';
      case 'reject':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-yellow-100 text-yellow-800';
      case 'update_role':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Last updated:</span>
          <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
          <button className="p-2 text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ListChecks className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+12%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-neutral-800">{stats.totalListings}</h3>
              <p className="text-neutral-500 text-sm">Total Listings</p>
              <Link to="/admin/listings" className="mt-4 text-sm text-blue-600 flex items-center hover:underline">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex items-center text-red-600">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">-3%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-neutral-800">{stats.pendingListings}</h3>
              <p className="text-neutral-500 text-sm">Pending Approval</p>
              <Link to="/admin/listings?status=pending" className="mt-4 text-sm text-yellow-600 flex items-center hover:underline">
                Review pending <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+5%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-neutral-800">{stats.featuredListings}</h3>
              <p className="text-neutral-500 text-sm">Featured Listings</p>
              <Link to="/admin/listings?featured=true" className="mt-4 text-sm text-purple-600 flex items-center hover:underline">
                Manage featured <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+8%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-neutral-800">{stats.totalUsers}</h3>
              <p className="text-neutral-500 text-sm">Total Users</p>
              <Link to="/admin/users" className="mt-4 text-sm text-green-600 flex items-center hover:underline">
                Manage users <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          </div>
          
          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Listings by Category */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold mb-6">Listings by Category</h2>
              <div className="h-64 flex items-end justify-between px-4">
                {Object.entries(listingsByCategory).map(([category, count], index) => {
                  const getColor = () => {
                    switch(category) {
                      case 'SERVICES': return 'bg-green-500';
                      case 'PROPERTY': return 'bg-blue-500';
                      case 'STORE': return 'bg-purple-500';
                      case 'AUTO_DEALERSHIP': return 'bg-red-500';
                      default: return 'bg-neutral-500';
                    }
                  };
                  
                  const maxCount = Math.max(...Object.values(listingsByCategory));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={category} className="flex flex-col items-center">
                      <div 
                        className={`w-16 ${getColor()} rounded-t-lg transition-all duration-1000`} 
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <div className="mt-2 text-xs font-medium text-neutral-600 text-center">
                        {category.replace('_', ' ')}
                      </div>
                      <div className="mt-1 text-sm font-bold text-neutral-800">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            
            {/* Recent Users */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Recent Users</h2>
                <Link to="/admin/users" className="text-sm text-yellow-600 hover:underline">View all</Link>
              </div>
              
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-300 text-neutral-600">
                          {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-neutral-800">{user.full_name || user.username || 'Unknown User'}</p>
                      <p className="text-xs text-neutral-500">Joined {formatDate(user.created_at)}</p>
                    </div>
                    <Link to={`/admin/users?id=${user.id}`} className="text-yellow-600 hover:text-yellow-700">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Pending Approvals & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  Pending Approvals
                </h2>
                <Link to="/admin/listings?status=pending" className="text-sm text-yellow-600 hover:underline">
                  View all
                </Link>
              </div>
              
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p>No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map(listing => (
                    <div key={listing.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-800">{listing.business_name}</h3>
                          <p className="text-sm text-neutral-500">
                            By {listing.owner_name} • {formatDate(listing.created_at)}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                              {listing.category.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Recent Activity */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
              
              {recentActivity.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No recent activity found</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`p-2 rounded-lg ${getActionColor(activity.action)} mr-3 flex-shrink-0`}>
                        {activity.action === 'approve' && <CheckCircle className="w-5 h-5" />}
                        {activity.action === 'reject' && <AlertTriangle className="w-5 h-5" />}
                        {activity.action === 'feature' && <Star className="w-5 h-5" />}
                        {activity.action === 'update_role' && <Users className="w-5 h-5" />}
                        {!['approve', 'reject', 'feature', 'update_role'].includes(activity.action) && <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {activity.admin_name} {activity.action}ed {activity.entity_type} #{activity.entity_id.substring(0, 8)}...
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Quick Actions */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/listings?status=pending" className="flex items-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors group">
                <div className="p-3 bg-yellow-100 rounded-lg mr-4 group-hover:bg-yellow-200 transition-colors">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Review Listings</h3>
                  <p className="text-sm text-neutral-600">{stats.pendingListings} pending</p>
                </div>
              </Link>
              
              <Link to="/admin/users" className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Manage Users</h3>
                  <p className="text-sm text-neutral-600">{stats.totalUsers} total users</p>
                </div>
              </Link>
              
              <Link to="/admin/settings" className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">Site Settings</h3>
                  <p className="text-sm text-neutral-600">Update configuration</p>
                </div>
              </Link>
            </div>
          </motion.div>
          
          {/* System Status */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-lg font-semibold mb-6">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Database</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Storage</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Authentication</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">API</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

function ChevronRight(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}