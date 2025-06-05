import React from 'react';
import { Wrench } from 'lucide-react';
import type { ServiceListing } from '../../types/listings';

interface ServiceDetailsProps {
  listing: ServiceListing;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ listing }) => {
  if (!listing.services || listing.services.length === 0) return null;
  
  return (
    <div className="mb-8 pb-8 border-b border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <Wrench className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Service Details
      </h3>
      <div className="md:col-span-2">
        <h4 className="font-semibold text-lg text-neutral-800 mb-3">Services Offered</h4>
        <ul className="space-y-3">
          {listing.services.map(service => (
            <li key={service.id || service.name} className="p-4 border border-neutral-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="font-semibold text-neutral-900 text-lg">{service.name}</div>
              {service.description && <div className="text-neutral-600 mt-1.5">{service.description}</div>}
              {service.price && <div className="font-medium text-neutral-700 mt-2">Price: ${service.price}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServiceDetails;
