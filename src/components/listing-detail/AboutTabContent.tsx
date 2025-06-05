import React from 'react';
import { Info, MapPin } from 'lucide-react';
import type { Listing } from '../../types/listings';
import { ListingGeneralInfo } from './';
import { CategoryDetails } from './';
import { BusinessHours } from './';

interface AboutTabContentProps {
  listing: Listing;
}

const AboutTabContent: React.FC<AboutTabContentProps> = ({ listing }) => {
  return (
    <div className="space-y-8">
      {/* Description Section */}
      <div className="pb-6 border-b border-neutral-200">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
          <Info className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> About this Business
        </h2>
        <div className="text-neutral-700 text-base leading-relaxed whitespace-pre-line">
          {listing.description || <span className="text-neutral-400 italic">No description provided</span>}
        </div>
      </div>

      {/* General Information */}
      <div className="pb-6 border-b border-neutral-200">
        <ListingGeneralInfo
          category={listing.category}
          subcategory={listing.subcategory}
          phone={listing.phone}
          email={listing.email}
          website={listing.website}
        />
      </div>

      {/* Category-specific Details */}
      <div className="pb-6 border-b border-neutral-200">
        <CategoryDetails listing={listing} />
      </div>

      {/* Business Hours if available */}
      {listing.businessHours && listing.businessHours.length > 0 && (
        <div className="pb-6 border-b border-neutral-200">
          <BusinessHours businessHours={listing.businessHours} />
        </div>
      )}

      {/* Location Map */}
      <div className="pb-6">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
          <MapPin className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Location
        </h2>
        <div className="bg-neutral-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-neutral-600">{listing.location}</p>
            <p className="text-sm text-neutral-400 mt-2">Interactive map coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTabContent;
