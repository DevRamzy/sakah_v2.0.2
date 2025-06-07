import React, { useState } from 'react';
import { Edit, Trash2, EyeOff, Eye, BarChart2, Share2, AlertCircle } from 'lucide-react';
import type { Listing } from '../../types/listings';
import { Link } from 'react-router-dom';
import { deleteListing } from '../../features/listings/services/listingService';
import { useNavigate } from 'react-router-dom';

interface ListingOwnerControlsProps {
  listing: Listing;
  userId: string | undefined;
}

const ListingOwnerControls: React.FC<ListingOwnerControlsProps> = ({ listing, userId }) => {
  // Check if the current user is the owner of this listing
  const isOwner = userId === listing.userId;
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!isOwner) return null;
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const success = await deleteListing(listing.id!);
        if (success) {
          navigate('/dashboard');
        } else {
          alert('Failed to delete listing. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('An error occurred while deleting the listing.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const getStatusBadge = () => {
    const status = listing.status || (listing.isPublished ? 'approved' : 'pending');
    
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Approval
          </span>
        );
    }
  };
  
  return (
    <div className="bg-neutral-800 text-white rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Owner Controls</h3>
        <div className="flex items-center">
          {getStatusBadge()}
        </div>
      </div>
      
      {/* Rejection reason if applicable */}
      {listing.status === 'rejected' && listing.rejectionReason && (
        <div className="mb-4 p-3 bg-red-900/30 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-300">Rejection Reason:</p>
              <p className="text-sm text-red-200">{listing.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Link 
          to={`/edit-listing/${listing.id}`}
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
        >
          <Edit className="w-5 h-5 mb-1" />
          <span className="text-xs">Edit</span>
        </Link>
        
        <button 
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="w-5 h-5 border-2 border-t-2 border-white rounded-full animate-spin mb-1"></div>
              <span className="text-xs">Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5 mb-1" />
              <span className="text-xs">Delete</span>
            </>
          )}
        </button>
        
        <Link 
          to={`/listings/${listing.id}/analytics`}
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
        >
          <BarChart2 className="w-5 h-5 mb-1" />
          <span className="text-xs">Analytics</span>
        </Link>
        
        <button 
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}
        >
          <Share2 className="w-5 h-5 mb-1" />
          <span className="text-xs">Share</span>
        </button>
      </div>
      
      {listing.status === 'pending' && (
        <div className="mt-4 text-xs text-yellow-300 bg-yellow-900/30 p-3 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            This listing is pending admin approval. Once approved, it will be visible to the public.
            This process typically takes 24-48 hours.
          </span>
        </div>
      )}
      
      {listing.status === 'rejected' && (
        <div className="mt-4 text-xs text-red-300 bg-red-900/30 p-3 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            This listing has been rejected. Please review the rejection reason above,
            make the necessary changes, and resubmit for approval.
          </span>
        </div>
      )}
    </div>
  );
};

export default ListingOwnerControls;