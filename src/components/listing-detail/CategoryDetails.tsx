import React from 'react';
import type { Listing } from '../../types/listings';
import { ListingCategory } from '../../types/listings';
import PropertyDetails from './PropertyDetails';
import ServiceDetails from './ServiceDetails';
import StoreDetails from './StoreDetails';
import AutoDealershipDetails from './AutoDealershipDetails';

interface CategoryDetailsProps {
  listing: Listing;
}

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ listing }) => {
  switch (listing.category) {
    case ListingCategory.PROPERTY:
      return <PropertyDetails listing={listing} />;
      
    case ListingCategory.SERVICES:
      return <ServiceDetails listing={listing} />;
      
    case ListingCategory.STORE:
      return <StoreDetails listing={listing} />;
      
    case ListingCategory.AUTO_DEALERSHIP:
      return <AutoDealershipDetails listing={listing} />;
      
    default:
      return null;
  }
};

export default CategoryDetails;
