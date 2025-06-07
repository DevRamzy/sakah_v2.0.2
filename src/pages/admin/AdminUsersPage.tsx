import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  listing_count?: number;
}

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply role filter if not 'all'
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      // Apply search filter if present
      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Get user IDs for a separate query to count listings
      const userIds = data.map(user => user.id);
      
      // If we have users, fetch their listing counts
      let userListingCounts: Record<string, number> = {};
      if (userIds.length > 0) {
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('user_id, count(*)')
          .in('user_id', userIds)
          .group('user_id') as any; // Type assertion needed due to Supabase typing limitations
          
        if (listingError) {
          console.error('Error fetching listing counts:', listingError);
        } else if (listingData) {
          // Create a map of user_id to listing count
          userListingCounts = listingData.reduce((acc: Record<string, number>, item: { user_id: string; count: number }) => {
            acc[item.user_id] = item.count;
            return acc;
          }, {});
        }
      }
      
      // Transform data to include listing count
      const transformedData = data.map(item => ({
        ...item,
        listing_count: userListingCounts[item.id] || 0
      }));

      setUsers(transformedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Exception fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === user?.id) {
      alert("You cannot change your own role!");
      return;
    }

    const confirmChange = window.confirm(`Are you sure you want to change this user's role to ${newRole}?`);
    if (!confirmChange) return;

    setProcessingId(userId);
    try {
      const { error } = await supabase.rpc('set_user_role', {
        user_id: userId,
        admin_id: user?.id,
        new_role: newRole
      });

      if (error) {
        console.error('Error changing user role:', error);
        alert('Failed to change user role: ' + error.message);
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Exception changing user role:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleRoleFilterChange('all')}
            className={`px-4 py-2 rounded-md ${roleFilter === 'all' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => handleRoleFilterChange('user')}
            className={`px-4 py-2 rounded-md ${roleFilter === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Users
          </button>
          <button 
            onClick={() => handleRoleFilterChange('admin')}
            className={`px-4 py-2 rounded-md ${roleFilter === 'admin' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, username or email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Listings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((profile) => (
                      <motion.tr 
                        key={profile.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {profile.avatar_url ? (
                                <img className="h-10 w-10 rounded-full" src={profile.avatar_url} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="material-icons text-gray-500">person</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {profile.full_name || 'No Name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{profile.username || profile.id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{profile.email || 'No Email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.role === 'admin' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {profile.listing_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {profile.id !== user?.id && (
                            <select
                              value={profile.role}
                              onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                              disabled={processingId === profile.id}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page ? 'bg-yellow-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
