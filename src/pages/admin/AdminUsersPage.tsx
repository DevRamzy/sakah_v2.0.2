import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  Download
} from 'lucide-react';

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
  status?: string;
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);

  const ITEMS_PER_PAGE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply role filter if not 'all'
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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
        listing_count: userListingCounts[item.id] || 0,
        status: item.status || 'active' // Default status if not set
      }));

      setUsers(transformedData);
      setTotalCount(count || 0);
      
      // Reset selectAll when fetching new users
      setSelectAll(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Exception fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === user?.id) {
      alert("You cannot change your own role!");
      return;
    }

    const confirmChange = window.confirm(`Are you sure you want to change this user's role to ${newRole}?`);
    if (!confirmChange) return;

    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error changing user role:', error);
        alert('Failed to change user role: ' + error.message);
      } else {
        // Log the action
        await supabase
          .from('admin_activity_logs')
          .insert([{
            admin_id: user?.id,
            action: 'update_role',
            entity_type: 'user',
            entity_id: userId,
            details: { new_role: newRole }
          }]);
          
        fetchUsers();
      }
    } catch (error) {
      console.error('Exception changing user role:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (userId === user?.id) {
      alert("You cannot change your own status!");
      return;
    }

    const confirmChange = window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`);
    if (!confirmChange) return;

    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error changing user status:', error);
        alert('Failed to change user status: ' + error.message);
      } else {
        // Log the action
        await supabase
          .from('admin_activity_logs')
          .insert([{
            admin_id: user?.id,
            action: 'update_status',
            entity_type: 'user',
            entity_id: userId,
            details: { new_status: newStatus }
          }]);
          
        fetchUsers();
      }
    } catch (error) {
      console.error('Exception changing user status:', error);
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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    switch (action) {
      case 'export':
        alert(`Exporting data for ${selectedUsers.length} users`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
          alert(`Deleting ${selectedUsers.length} users`);
        }
        break;
      case 'suspend':
        if (window.confirm(`Are you sure you want to suspend ${selectedUsers.length} users?`)) {
          alert(`Suspending ${selectedUsers.length} users`);
        }
        break;
      default:
        break;
    }
  };

  const handleViewUserDetails = async (userId: string) => {
    setShowUserDetails(userId);
    
    try {
      // Fetch detailed user information
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user details:', error);
        return;
      }
      
      // Fetch user's listings count
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      setUserDetails({
        ...data,
        listing_count: listingsCount || 0
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string = 'active') => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleRoleFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${roleFilter === 'all' ? 'bg-black text-white' : 'bg-white text-neutral-700 border border-neutral-300'}`}
          >
            All Roles
          </button>
          <button 
            onClick={() => handleRoleFilterChange('user')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${roleFilter === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-neutral-700 border border-neutral-300'}`}
          >
            Users
          </button>
          <button 
            onClick={() => handleRoleFilterChange('admin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${roleFilter === 'admin' ? 'bg-yellow-500 text-black' : 'bg-white text-neutral-700 border border-neutral-300'}`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, username or email"
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Search
            </button>
          </form>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
            
            <button
              onClick={() => handleBulkAction('export')}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center"
              disabled={selectedUsers.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="username_asc">Username (A-Z)</option>
                  <option value="username_desc">Username (Z-A)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Listings Count
                </label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="all">Any</option>
                  <option value="0">No Listings</option>
                  <option value="1-5">1-5 Listings</option>
                  <option value="6-10">6-10 Listings</option>
                  <option value="10+">10+ Listings</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 text-center">
              <User className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No users found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setShowFilters(false);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-neutral-300 rounded"
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Listings
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {users.map((profile) => (
                      <motion.tr 
                        key={profile.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-neutral-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(profile.id)}
                            onChange={() => handleSelectUser(profile.id)}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-neutral-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {profile.avatar_url ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={profile.avatar_url} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                                  <User className="h-5 w-5 text-neutral-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-800">
                                {profile.full_name || 'No Name'}
                              </div>
                              <div className="text-sm text-neutral-500">
                                @{profile.username || profile.id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">{profile.email || 'No Email'}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(profile.status)}`}>
                            {profile.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {profile.listing_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewUserDetails(profile.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <div className="relative group">
                              <button
                                className="p-1 text-neutral-600 hover:text-neutral-800 rounded-full hover:bg-neutral-100"
                                title="More Options"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 hidden group-hover:block">
                                {profile.id !== user?.id && (
                                  <>
                                    <button
                                      onClick={() => handleRoleChange(profile.id, profile.role === 'admin' ? 'user' : 'admin')}
                                      disabled={processingId === profile.id}
                                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                    >
                                      {profile.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(profile.id, profile.status === 'active' ? 'suspended' : 'active')}
                                      disabled={processingId === profile.id}
                                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                    >
                                      {profile.status === 'active' ? 'Suspend User' : 'Activate User'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">
                      {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('export')}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Export Selected
                      </button>
                      <button
                        onClick={() => handleBulkAction('suspend')}
                        className="px-3 py-1.5 bg-yellow-500 text-black text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Suspend Selected
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 rounded-lg ${
                      currentPage === page 
                        ? 'bg-yellow-500 text-black font-medium' 
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-neutral-800">User Details</h2>
              <button 
                onClick={() => setShowUserDetails(null)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mb-3">
                    {userDetails.avatar_url ? (
                      <img src={userDetails.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-neutral-400" />
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userDetails.role === 'admin' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userDetails.role}
                  </span>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {userDetails.full_name || 'No Name'}
                    </h3>
                    <p className="text-neutral-500">@{userDetails.username || userDetails.id.substring(0, 8)}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Email</p>
                        <p className="text-neutral-800">{userDetails.email || 'No Email'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Joined</p>
                        <p className="text-neutral-800">{formatDate(userDetails.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <ListChecks className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Listings</p>
                        <p className="text-neutral-800">{userDetails.listing_count} total</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Status</p>
                        <p className={`${
                          userDetails.status === 'active' ? 'text-green-600' : 
                          userDetails.status === 'suspended' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {userDetails.status || 'Active'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">Account Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {userDetails.id !== user?.id && (
                        <>
                          <button
                            onClick={() => {
                              handleRoleChange(userDetails.id, userDetails.role === 'admin' ? 'user' : 'admin');
                              setShowUserDetails(null);
                            }}
                            className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm rounded-lg hover:bg-yellow-200 transition-colors"
                          >
                            {userDetails.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                          
                          {userDetails.status === 'active' ? (
                            <button
                              onClick={() => {
                                handleStatusChange(userDetails.id, 'suspended');
                                setShowUserDetails(null);
                              }}
                              className="px-3 py-1.5 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Suspend User
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                handleStatusChange(userDetails.id, 'active');
                                setShowUserDetails(null);
                              }}
                              className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-lg hover:bg-green-200 transition-colors"
                            >
                              Activate User
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        View Listings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-700 mb-3">Activity Log</h4>
                <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-500">
                  Activity log will be implemented in a future update.
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setShowUserDetails(null)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors mr-2"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;