import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, ArrowLeft } from 'lucide-react';

interface ListingStateHandlerProps {
  loading: boolean;
  error: string | null;
  accessDenied: boolean;
  listing: any;
  children: React.ReactNode;
  backPath?: string;
}

const ListingStateHandler: React.FC<ListingStateHandlerProps> = ({
  loading,
  error,
  accessDenied,
  listing,
  children,
  backPath = "/listings"
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-100 p-4 text-center">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h1>
        <p className="text-lg text-neutral-700 mb-8">
          You do not have permission to view this listing as it is currently a draft.
        </p>
        <Link 
          to={backPath} 
          className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-100 p-4 text-center">
        <Info className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-4">Error</h1>
        <p className="text-lg text-neutral-700 mb-8">{error || 'Listing not found.'}</p>
        <Link 
          to={backPath} 
          className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default ListingStateHandler;