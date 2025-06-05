import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { BaseListing } from '../../../types/listings';
import { ListingCategory } from '../../../types/listings';
import { MapPin, Star } from 'lucide-react';

interface ListingCardProps {
  listing: BaseListing;
  viewMode?: 'grid' | 'list';
}

const DefaultImage = ({ category, viewMode }: { category: ListingCategory, viewMode?: 'grid' | 'list' }) => {
  // Basic placeholder based on category - can be expanded with actual SVGs or themed images
  let bgColor = 'bg-neutral-200';
  let textColor = 'text-neutral-600';
  let text = 'Image';

  switch (category) {
    case ListingCategory.PROPERTY:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      text = 'Property';
      break;
    case ListingCategory.SERVICES:
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      text = 'Service';
      break;
    case ListingCategory.STORE:
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-700';
      text = 'Store';
      break;
    case ListingCategory.AUTO_DEALERSHIP:
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      text = 'Auto';
      break;
  }

  const heightClass = viewMode === 'list' ? 'h-full' : 'h-48';
  const roundedClass = viewMode === 'list' ? 'rounded-l-lg rounded-t-none' : 'rounded-t-lg';

  return (
    <div className={`w-full ${heightClass} flex items-center justify-center ${bgColor} ${roundedClass}`}>
      <span className={`text-xl font-semibold ${textColor}`}>{text}</span>
    </div>
  );
};

// Helper function to get category label and color
const getCategoryInfo = (category: ListingCategory) => {
  switch (category) {
    case ListingCategory.PROPERTY:
      return { label: 'Property', bgColor: 'bg-blue-500', textColor: 'text-white' };
    case ListingCategory.SERVICES:
      return { label: 'Services', bgColor: 'bg-green-500', textColor: 'text-white' };
    case ListingCategory.STORE:
      return { label: 'Stores', bgColor: 'bg-amber-400', textColor: 'text-black' };
    case ListingCategory.AUTO_DEALERSHIP:
      return { label: 'Automotive', bgColor: 'bg-red-500', textColor: 'text-white' };
    default:
      return { label: 'Business', bgColor: 'bg-neutral-500', textColor: 'text-white' };
  }
};

const ListingCard: React.FC<ListingCardProps> = ({ listing, viewMode = 'grid' }) => {
  const primaryImage = listing.images?.find(img => img.isPrimary)?.url || listing.images?.[0]?.url;
  const { label: categoryLabel, bgColor: categoryBgColor, textColor: categoryTextColor } = getCategoryInfo(listing.category);
  
  // Mock rating data (would come from the database in a real implementation)
  const rating = {
    value: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5 and 5.0
    count: Math.floor(Math.random() * 300) + 10 // Random count between 10 and 310
  };
  
  const isListView = viewMode === 'list';

  if (isListView) {
    return (
      <motion.div 
        className="bg-white shadow-md rounded-lg overflow-hidden flex flex-row w-full" 
        whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="relative block w-1/3 md:w-48 flex-shrink-0">
          <Link to={`/listings/${listing.id}`}>
            {primaryImage ? (
              <img 
                src={primaryImage} 
                alt={listing.businessName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <DefaultImage category={listing.category} viewMode="list" />
            )}
          </Link>
          <div className={`absolute top-0 left-0 ${categoryBgColor} ${categoryTextColor} text-xs font-medium py-1 px-2 rounded-br-md`}>
            {categoryLabel}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-neutral-800 truncate" title={listing.businessName}>
              <Link to={`/listings/${listing.id}`} className="hover:text-yellow-500">
                {listing.businessName}
              </Link>
            </h3>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium">{rating.value}</span>
              <span className="ml-1 text-xs text-neutral-500">({rating.count})</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-neutral-400 flex-shrink-0" />
            <span className="truncate" title={listing.location}>{listing.location}</span>
          </p>
          
          {listing.description && (
            <p className="text-sm text-neutral-600 line-clamp-2" title={listing.description}>
              {listing.description}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid View (default)
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full" 
      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative">
        <Link to={`/listings/${listing.id}`}>
          {primaryImage ? (
            <img 
              src={primaryImage} 
              alt={listing.businessName} 
              className="w-full h-48 object-cover"
            />
          ) : (
            <DefaultImage category={listing.category} viewMode="grid" />
          )}
        </Link>
        <div className={`absolute top-0 left-0 ${categoryBgColor} ${categoryTextColor} text-xs font-medium py-1 px-2 rounded-br-md`}>
          {categoryLabel}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold text-neutral-800 truncate" title={listing.businessName}>
            <Link to={`/listings/${listing.id}`} className="hover:text-yellow-500">
              {listing.businessName}
            </Link>
          </h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating.value}</span>
            <span className="ml-1 text-xs text-neutral-500">({rating.count})</span>
          </div>
        </div>
        
        <p className="text-sm text-neutral-500 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-neutral-400 flex-shrink-0" />
          <span className="truncate" title={listing.location}>{listing.location}</span>
        </p>
        
        {listing.description && (
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2" title={listing.description}>
            {listing.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;
