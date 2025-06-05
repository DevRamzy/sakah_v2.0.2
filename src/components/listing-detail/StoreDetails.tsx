import React from 'react';
import { ShoppingBag, Clock } from 'lucide-react';
import type { StoreListing, BusinessHours } from '../../types/listings';
import DetailItem from './DetailItem';

interface StoreDetailsProps {
  listing: StoreListing;
}

const StoreDetails: React.FC<StoreDetailsProps> = ({ listing }) => {
  return (
    <div className="mb-8 pb-8 border-b border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <ShoppingBag className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Store Details
      </h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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

export default StoreDetails;
