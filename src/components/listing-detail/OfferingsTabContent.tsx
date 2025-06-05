import React from 'react';
import { ListChecks, Home, ShoppingBag, Car } from 'lucide-react';
import type { Listing } from '../../types/listings';
import { ListingCategory } from '../../types/listings';
import { AdditionalServices } from './';

interface OfferingsTabContentProps {
  listing: Listing;
}

const OfferingsTabContent: React.FC<OfferingsTabContentProps> = ({ listing }) => {
  // Determine tab title based on listing category
  const getTabTitle = () => {
    switch (listing.category) {
      case ListingCategory.SERVICES:
        return 'Services';
      case ListingCategory.PROPERTY:
        return 'Amenities';
      case ListingCategory.STORE:
        return 'Products';
      case ListingCategory.AUTO_DEALERSHIP:
        return 'Vehicles';
      default:
        return 'Offerings';
    }
  };

  // Get appropriate icon based on listing category
  const getTabIcon = () => {
    switch (listing.category) {
      case ListingCategory.SERVICES:
        return ListChecks;
      case ListingCategory.PROPERTY:
        return Home;
      case ListingCategory.STORE:
        return ShoppingBag;
      case ListingCategory.AUTO_DEALERSHIP:
        return Car;
      default:
        return ListChecks;
    }
  };

  const TabIcon = getTabIcon();
  const tabTitle = getTabTitle();

  // Render placeholder content when no offerings data is available
  const renderPlaceholder = () => (
    <div className="text-center py-10">
      <TabIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-500">No {tabTitle.toLowerCase()} information available</h3>
      <p className="text-neutral-400 mt-2">This listing hasn't added any {tabTitle.toLowerCase()} details yet.</p>
    </div>
  );

  // Render content based on listing category
  const renderCategoryContent = () => {
    switch (listing.category) {
      case ListingCategory.SERVICES:
        if (!listing.services || listing.services.length === 0) return renderPlaceholder();
        return (
          <div className="space-y-6">
            <AdditionalServices services={listing.services} />
          </div>
        );
        
      case ListingCategory.PROPERTY:
        if (!listing.propertyDetails) return renderPlaceholder();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listing.propertyDetails.amenities && listing.propertyDetails.amenities.length > 0 ? (
                <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-yellow-500" /> Amenities
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {listing.propertyDetails.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-yellow-500" /> Amenities
                  </h3>
                  <p className="text-neutral-500">No amenities listed</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case ListingCategory.STORE:
        // For store, we'll show a placeholder for products
        return (
          <div className="space-y-6">
            <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-yellow-500" /> Featured Products
              </h3>
              <p className="text-neutral-500 mb-4">This store hasn't added any products yet.</p>
              
              {/* If the store has additional services, show them */}
              {listing.services && listing.services.length > 0 && (
                <div className="mt-8">
                  <AdditionalServices services={listing.services} />
                </div>
              )}
            </div>
          </div>
        );
        
      case ListingCategory.AUTO_DEALERSHIP:
        if (!listing.autoDealershipDetails) return renderPlaceholder();
        return (
          <div className="space-y-6">
            <div className="bg-neutral-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-yellow-500" /> Vehicle Types
              </h3>
              {listing.autoDealershipDetails.vehicleTypes && listing.autoDealershipDetails.vehicleTypes.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.autoDealershipDetails.vehicleTypes.map((type, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      <span>{type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-500">No vehicle types specified</p>
              )}
            </div>
            
            {/* If the dealership has additional services, show them */}
            {listing.services && listing.services.length > 0 && (
              <div className="mt-8">
                <AdditionalServices services={listing.services} />
              </div>
            )}
          </div>
        );
        
      default:
        return renderPlaceholder();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
        <TabIcon className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> {tabTitle}
      </h2>
      
      {renderCategoryContent()}
      
      {/* Call to Action Button */}
      <div className="mt-8 text-center">
        <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors">
          {listing.category === ListingCategory.SERVICES ? 'Inquire About Services' : 
           listing.category === ListingCategory.PROPERTY ? 'Request More Information' :
           listing.category === ListingCategory.STORE ? 'Contact Store' :
           'Contact Dealership'}
        </button>
      </div>
    </div>
  );
};

export default OfferingsTabContent;
