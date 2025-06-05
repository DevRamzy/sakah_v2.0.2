import React from 'react';
import { Car, Tag, ShieldCheck, ListChecks, Clock } from 'lucide-react';
import type { AutoDealershipListing, BusinessHours } from '../../types/listings';
import DetailItem from './DetailItem';

interface AutoDealershipDetailsProps {
  listing: AutoDealershipListing;
}

const AutoDealershipDetails: React.FC<AutoDealershipDetailsProps> = ({ listing }) => {
  const { autoDealershipDetails } = listing;
  
  if (!autoDealershipDetails) return null;
  
  return (
    <div className="mb-8 pb-8 border-b border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <Car className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Dealership Details
      </h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {autoDealershipDetails?.financingAvailable !== undefined && (
          <DetailItem 
            icon={Tag} 
            label="Financing" 
            value={autoDealershipDetails.financingAvailable ? 'Available' : 'Not Available'} 
          />
        )}
        
        {autoDealershipDetails?.brands && autoDealershipDetails.brands.length > 0 && (
          <DetailItem icon={Tag} label="Brands" className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mt-2">
              {autoDealershipDetails.brands.map((brand, index) => (
                <span key={index} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg shadow-sm border border-neutral-200">
                  {brand}
                </span>
              ))}
            </div>
          </DetailItem>
        )}
        
        {autoDealershipDetails?.specialties && autoDealershipDetails.specialties.length > 0 && (
          <DetailItem icon={ShieldCheck} label="Specializations" className="md:col-span-2">
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {autoDealershipDetails.specialties.map((spec: string, index: number) => (
                <li key={index} className="flex items-center bg-neutral-50 px-3 py-2 rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-800">{spec}</span>
                </li>
              ))}
            </ul>
          </DetailItem>
        )}
        
        {autoDealershipDetails?.services && autoDealershipDetails.services.length > 0 && (
          <DetailItem icon={ListChecks} label="Services Offered" className="md:col-span-2">
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {autoDealershipDetails.services.map((service: string, index: number) => (
                <li key={index} className="flex items-center bg-neutral-50 px-3 py-2 rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-800">{service}</span>
                </li>
              ))}
            </ul>
          </DetailItem>
        )}
        
        <DetailItem icon={Clock} label="Business Hours" className="md:col-span-2">
          {listing.businessHours && listing.businessHours.length > 0 ? (
            <ul className="space-y-1.5">
              {listing.businessHours.map((bh: BusinessHours) => (
                <li key={bh.day} className="flex justify-between py-1">
                  <span className="font-medium capitalize">{bh.day}:</span> 
                  <span className={`font-medium ${!bh.isClosed && bh.openTime && bh.closeTime ? 'text-green-700' : 'text-red-600'}`}>
                    {!bh.isClosed && bh.openTime && bh.closeTime ? `${bh.openTime} - ${bh.closeTime}` : 'Closed'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-neutral-400 italic">No business hours specified</span>
          )}
        </DetailItem>
      </dl>
    </div>
  );
};

export default AutoDealershipDetails;
