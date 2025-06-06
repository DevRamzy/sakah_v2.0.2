import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  owner_id: string;
  owner_name?: string;
}

const AdminListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const statusFilter = searchParams.get('status') || 'all';
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchListings();
  }, [statusFilter, currentPage]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select('*, profiles!listings_owner_id_fkey(full_name, username)', { count: 'exact' });

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      // Transform data to include owner name
      const transformedData = data.map(item => ({
        ...item,
        owner_name: item.profiles?.full_name || item.profiles?.username || 'Unknown User'
      }));

      setListings(transformedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Exception fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setSearchParams({ status });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApprove = async (listingId: string) => {
    setProcessingId(listingId);
    try {
      const { error } = await supabase.rpc('approve_listing', {
        listing_id: listingId,
        admin_id: user?.id
      });

      if (error) {
        console.error('Error approving listing:', error);
        alert('Failed to approve listing: ' + error.message);
      } else {
        fetchListings();
      }
    } catch (error) {
      console.error('Exception approving listing:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (listingId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled

    setProcessingId(listingId);
    try {
      const { error } = await supabase.rpc('reject_listing', {
        listing_id: listingId,
        admin_id: user?.id,
        reason
      });

      if (error) {
        console.error('Error rejecting listing:', error);
        alert('Failed to reject listing: ' + error.message);
      } else {
        fetchListings();
      }
    } catch (error) {
      console.error('Exception rejecting listing:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFeatured = async (listingId: string, featured: boolean) => {
    setProcessingId(listingId);
    try {
      const { error } = await supabase.rpc('toggle_featured_listing', {
        listing_id: listingId,
        admin_id: user?.id,
        featured: !featured
      });

      if (error) {
        console.error('Error toggling featured status:', error);
        alert('Failed to update featured status: ' + error.message);
      } else {
        fetchListings();
      }
    } catch (error) {
      console.error('Exception toggling featured status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Listings</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleStatusChange('all')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => handleStatusChange('pending')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => handleStatusChange('approved')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => handleStatusChange('rejected')}
            className={`px-4 py-2 rounded-md ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <>
          {listings.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">No listings found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <motion.tr 
                        key={listing.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                          <div className="text-sm text-gray-500">{listing.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.owner_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(listing.status)}`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(listing.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleToggleFeatured(listing.id, listing.is_featured)}
                            disabled={processingId === listing.id}
                            className={`material-icons ${listing.is_featured ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-600`}
                          >
                            star
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <a 
                            href={`/listings/${listing.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </a>
                          {listing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(listing.id)}
                                disabled={processingId === listing.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(listing.id)}
                                disabled={processingId === listing.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
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

export default AdminListingsPage;
