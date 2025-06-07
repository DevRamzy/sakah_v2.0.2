import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserListings } from '../../services/listingService';
import type { BaseListing } from '../../../../types/listings';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Edit, Eye, Trash2 } from 'lucide-react';

interface ListingsTabProps {
  userId: string;
}

const ListingsTab: React.FC<ListingsTabProps> = ({ userId }) => {
  const [listings, setListings] = useState<BaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const userListings = await getUserListings(userId);
        setListings(userListings);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load your listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [userId]);

  // Function to get status badge based on listing status
  const getStatusBadge = (listing: BaseListing) => {
    const status = listing.status || (listing.isPublished ? 'approved' : 'pending');
    
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  // Function to get category badge
  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, { bg: string; text: string }> = {
      PROPERTY: { bg: 'bg-blue-100', text: 'text-blue-800' },
      SERVICES: { bg: 'bg-purple-100', text: 'text-purple-800' },
      STORE: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      AUTO_DEALERSHIP: { bg: 'bg-teal-100', text: 'text-teal-800' },
    };

    const colors = categoryColors[category] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
        {category.replace('_', ' ')}
      </span>
    );
  };

  // Format date to readable string
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter listings based on active filter
  const filteredListings = listings.filter(listing => {
    if (activeFilter === 'all') return true;
    const status = listing.status || (listing.isPublished ? 'approved' : 'pending');
    return status === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No listings</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new listing.</p>
        <div className="mt-6">
          <Link
            to="/create-listing"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Listings</h2>
        <Link
          to="/create-listing"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Listing
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === 'all' 
              ? 'bg-primary text-black' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          All ({listings.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === 'pending' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Pending ({listings.filter(l => l.status === 'pending' || (!l.status && !l.isPublished)).length})
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === 'approved' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Approved ({listings.filter(l => l.status === 'approved' || (!l.status && l.isPublished)).length})
        </button>
        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeFilter === 'rejected' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Rejected ({listings.filter(l => l.status === 'rejected').length})
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredListings.map((listing) => (
            <motion.li 
              key={listing.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary truncate">{listing.businessName}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      {getStatusBadge(listing)}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    {getCategoryBadge(listing.category)}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {listing.location}
                    </p>
                    {listing.subcategory && (
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        {listing.subcategory}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p>Created on <time dateTime={listing.createdAt ? listing.createdAt.toISOString() : undefined}>{formatDate(listing.createdAt)}</time></p>
                  </div>
                </div>
                
                {/* Rejection reason if applicable */}
                {listing.status === 'rejected' && listing.rejectionReason && (
                  <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Rejected:</span> {listing.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex justify-end space-x-3">
                  <Link
                    to={`/listings/${listing.id}`}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/edit-listing/${listing.id}`}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this listing?')) {
                        // Delete functionality would go here
                        alert('Delete functionality will be implemented soon');
                      }
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListingsTab;