import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { BaseListing } from '../../../types/listings';
import { ListingCategory } from '../../../types/listings';
import { MapPin, Star, Clock, DollarSign, Home, Wrench, ShoppingBag, Car, Calendar } from 'lucide-react';
import { getImageUrl, getPlaceholderImage } from '../../../utils/imageUtils';

interface ListingCardProps {
  listing: BaseListing;
  viewMode?: 'grid' | 'list';
  featured?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  viewMode = 'grid',
  featured = false
}) => {
  const primaryImage = listing.images?.find(img => img.isPrimary)?.url || 
                       listing.images?.[0]?.url || 
                       getPlaceholderImage();
  
  // Mock rating data (would come from the database in a real implementation)
  const rating = {
    value: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5 and 5.0
    count: Math.floor(Math.random() * 300) + 10 // Random count between 10 and 310
  };
  
  const isListView = viewMode === 'list';

  // Get category-specific details and styling
  const getCategoryDetails = () => {
    switch (listing.category) {
      case ListingCategory.PROPERTY:
        return {
          icon: Home,
          label: 'Property',
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          hoverColor: 'group-hover:bg-blue-600',
          borderColor: 'border-blue-500',
          accentColor: 'text-blue-600'
        };
      case ListingCategory.SERVICES:
        return {
          icon: Wrench,
          label: 'Services',
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          hoverColor: 'group-hover:bg-green-600',
          borderColor: 'border-green-500',
          accentColor: 'text-green-600'
        };
      case ListingCategory.STORE:
        return {
          icon: ShoppingBag,
          label: 'Store',
          bgColor: 'bg-purple-500',
          textColor: 'text-white',
          hoverColor: 'group-hover:bg-purple-600',
          borderColor: 'border-purple-500',
          accentColor: 'text-purple-600'
        };
      case ListingCategory.AUTO_DEALERSHIP:
        return {
          icon: Car,
          label: 'Vehicles',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          hoverColor: 'group-hover:bg-red-600',
          borderColor: 'border-red-500',
          accentColor: 'text-red-600'
        };
      default:
        return {
          icon: Home,
          label: 'Listing',
          bgColor: 'bg-yellow-500',
          textColor: 'text-black',
          hoverColor: 'group-hover:bg-yellow-600',
          borderColor: 'border-yellow-500',
          accentColor: 'text-yellow-600'
        };
    }
  };

  const categoryDetails = getCategoryDetails();
  const CategoryIcon = categoryDetails.icon;

  // Render category-specific details
  const renderCategorySpecificDetails = () => {
    switch (listing.category) {
      case ListingCategory.PROPERTY:
        return (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-1" />
              <span>{listing.subcategory || 'Property'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Available Now</span>
            </div>
          </div>
        );
      case ListingCategory.SERVICES:
        return (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="flex items-center">
              <Wrench className="w-4 h-4 mr-1" />
              <span>{listing.subcategory || 'Service'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Quick Response</span>
            </div>
          </div>
        );
      case ListingCategory.STORE:
        return (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-1" />
              <span>{listing.subcategory || 'Store'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Open Now</span>
            </div>
          </div>
        );
      case ListingCategory.AUTO_DEALERSHIP:
        return (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="flex items-center">
              <Car className="w-4 h-4 mr-1" />
              <span>{listing.subcategory || 'Dealership'}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>Financing Available</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isListView) {
    return (
      <motion.div 
        className={`bg-white shadow-md rounded-lg overflow-hidden flex flex-row w-full group ${featured ? 'ring-2 ring-yellow-400' : ''}`}
        whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="relative block w-1/3 md:w-48 flex-shrink-0">
          <Link to={`/listings/${listing.id}`} className="block h-full">
            <div className="w-full h-full overflow-hidden">
              <img 
                src={primaryImage} 
                alt={listing.businessName} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage();
                }}
              />
            </div>
            <div className={`absolute top-0 left-0 ${categoryDetails.bgColor} ${categoryDetails.textColor} text-xs font-medium py-1 px-2 rounded-br-md ${categoryDetails.hoverColor} transition-colors`}>
              {categoryDetails.label}
            </div>
            {featured && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
                FEATURED
              </div>
            )}
          </Link>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-neutral-800 truncate" title={listing.businessName}>
              <Link to={`/listings/${listing.id}`} className={`hover:${categoryDetails.accentColor}`}>
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
          
          {renderCategorySpecificDetails()}
          
          {listing.description && (
            <p className="text-sm text-neutral-600 mt-2 line-clamp-2" title={listing.description}>
              {listing.description}
            </p>
          )}
          
          <div className="mt-auto pt-3 flex justify-end">
            <Link 
              to={`/listings/${listing.id}`}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${categoryDetails.bgColor} ${categoryDetails.textColor} hover:opacity-90 transition-opacity`}
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (default)
  return (
    <motion.div 
      className={`bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full group ${featured ? 'ring-2 ring-yellow-400' : ''}`}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative">
        <Link to={`/listings/${listing.id}`} className="block">
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={primaryImage} 
              alt={listing.businessName} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage();
              }}
            />
          </div>
          <div className={`absolute top-0 left-0 ${categoryDetails.bgColor} ${categoryDetails.textColor} text-xs font-medium py-1 px-2 rounded-br-md ${categoryDetails.hoverColor} transition-colors`}>
            {categoryDetails.label}
          </div>
          {featured && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-bl-md">
              FEATURED
            </div>
          )}
        </Link>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold text-neutral-800 truncate" title={listing.businessName}>
            <Link to={`/listings/${listing.id}`} className={`hover:${categoryDetails.accentColor}`}>
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
        
        {renderCategorySpecificDetails()}
        
        {listing.description && (
          <p className="text-sm text-neutral-600 mt-2 mb-3 line-clamp-2" title={listing.description}>
            {listing.description}
          </p>
        )}
        
        <div className="mt-auto pt-3 border-t border-neutral-100">
          <Link 
            to={`/listings/${listing.id}`}
            className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${categoryDetails.bgColor} ${categoryDetails.textColor} hover:opacity-90 transition-opacity`}
          >
            <CategoryIcon className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;