import React from 'react';
import { Edit, Trash2, EyeOff, Eye, BarChart2, Share2, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Listing } from '../../types/listings';
import { Link } from 'react-router-dom';

interface ListingOwnerControlsProps {
  listing: Listing;
  userId: string | undefined;
}

const ListingOwnerControls: React.FC<ListingOwnerControlsProps> = ({ listing, userId }) => {
  // Check if the current user is the owner of this listing
  const isOwner = userId === listing.userId;
  
  if (!isOwner) return null;
  
  // Get status information
  const status = listing.status || (listing.isPublished ? 'approved' : 'pending');
  const statusInfo = {
    pending: {
      label: 'Pending Review',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      message: 'Your listing is currently under review. This process typically takes 1-2 business days.'
    },
    approved: {
      label: 'Published',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      message: 'Your listing is published and visible to the public.'
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-800',
      icon: AlertTriangle,
      message: listing.rejectionReason || 'Your listing was rejected. Please edit and resubmit.'
    }
  };
  
  const currentStatus = statusInfo[status as keyof typeof statusInfo];
  
  return (
    <div className="bg-neutral-800 text-white rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Owner Controls</h3>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
            <currentStatus.icon className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </span>
        </div>
      </div>
      
      {/* Status message */}
      <div className="mb-4 text-sm text-neutral-300">
        {currentStatus.message}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Link 
          to={`/listings/${listing.id}/edit`}
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
        >
          <Edit className="w-5 h-5 mb-1" />
          <span className="text-xs">Edit</span>
        </Link>
        
        <button 
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
          onClick={() => window.confirm('Are you sure you want to delete this listing?')}
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-xs">Delete</span>
        </button>
        
        {status === 'approved' && (
          <button 
            className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
          >
            <EyeOff className="w-5 h-5 mb-1" />
            <span className="text-xs">Unpublish</span>
          </button>
        )}
        
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
      
      {status === 'rejected' && (
        <div className="mt-4 text-xs text-neutral-400">
          Edit your listing to address the rejection reason, then resubmit for review.
        </div>
      )}
      
      {status === 'pending' && (
        <div className="mt-4 text-xs text-neutral-400">
          You'll receive a notification when your listing is approved or if any changes are needed.
        </div>
      )}
    </div>
  );
};

export default ListingOwnerControls;