import React from 'react';
import { Building, BedDouble, Bath, MapPin, ListChecks, ShieldCheck } from 'lucide-react';
import DetailItem from './DetailItem';
import type { PropertyListing } from '../../types/listings';

interface PropertyDetailsProps {
  listing: PropertyListing;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ listing }) => {
  const { propertyDetails } = listing;
  
  if (!propertyDetails) return null;
  
  return (
    <div className="mb-8 pb-8 border-b border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <Building className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Property Details
      </h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {propertyDetails.propertyType && <DetailItem icon={Building} label="Property Type" value={propertyDetails.propertyType} />}
        {propertyDetails.bedrooms && <DetailItem icon={BedDouble} label="Bedrooms" value={propertyDetails.bedrooms} />}
        {propertyDetails.bathrooms && <DetailItem icon={Bath} label="Bathrooms" value={propertyDetails.bathrooms} />}
        {propertyDetails.size && <DetailItem icon={MapPin} label="Square Footage" value={`${propertyDetails.size} sq ft`} />}
        {propertyDetails.amenities && propertyDetails.amenities.length > 0 && (
          <DetailItem icon={ListChecks} label="Amenities" className="md:col-span-2">
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {propertyDetails.amenities.map((amenity: string, index: number) => (
                <li key={index} className="flex items-center bg-neutral-50 px-3 py-2 rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-800">{amenity}</span>
                </li>
              ))}
            </ul>
          </DetailItem>
        )}
      </dl>
    </div>
  );
};

export default PropertyDetails;
