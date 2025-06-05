import React from 'react';
import { Edit, Trash2, EyeOff, Eye, BarChart2, Share2 } from 'lucide-react';
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
  
  return (
    <div className="bg-neutral-800 text-white rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Owner Controls</h3>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            listing.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {listing.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
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
        
        <button 
          className="flex flex-col items-center bg-neutral-700 hover:bg-neutral-600 transition-colors rounded p-3"
        >
          {listing.isPublished ? (
            <>
              <EyeOff className="w-5 h-5 mb-1" />
              <span className="text-xs">Unpublish</span>
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 mb-1" />
              <span className="text-xs">Publish</span>
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
      
      {!listing.isPublished && (
        <div className="mt-4 text-xs text-neutral-400">
          This listing is currently in draft mode and is only visible to you.
        </div>
      )}
    </div>
  );
};

export default ListingOwnerControls;
