import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    pendingListings: 0,
    totalUsers: 0,
    featuredListings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

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
          .eq('status', 'pending');
        
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
          .limit(10);
        
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
    return new Date(dateString).toLocaleString();
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
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-3xl font-bold">{stats.totalListings}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="material-icons text-blue-600">format_list_bulleted</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-3xl font-bold">{stats.pendingListings}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="material-icons text-yellow-600">pending_actions</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured Listings</p>
                  <p className="text-3xl font-bold">{stats.featuredListings}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="material-icons text-purple-600">star</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="material-icons text-green-600">people</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Recent Activity */}
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {activity.admin_name || 'Unknown Admin'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(activity.action)}`}>
                            {activity.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.entity_type} #{activity.entity_id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(activity.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/admin/listings?status=pending" className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <span className="material-icons text-yellow-600 mr-3">approval</span>
                <span>Review Pending Listings</span>
              </a>
              <a href="/admin/users" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="material-icons text-blue-600 mr-3">manage_accounts</span>
                <span>Manage Users</span>
              </a>
              <a href="/admin/settings" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="material-icons text-green-600 mr-3">settings</span>
                <span>Update Site Settings</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
