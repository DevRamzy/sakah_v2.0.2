import React from 'react';
import { Clock } from 'lucide-react';
import type { BusinessHours as BusinessHoursType } from '../../types/listings';

interface BusinessHoursProps {
  businessHours: BusinessHoursType[];
}

const BusinessHours: React.FC<BusinessHoursProps> = ({ businessHours }) => {
  if (!businessHours || businessHours.length === 0) return null;
  
  return (
    <div className="mt-8 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <Clock className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Business Hours
      </h3>
      <ul className="space-y-2">
        {businessHours.map(bh => (
          <li key={bh.day} className="flex justify-between text-base text-neutral-700 py-2 border-b border-neutral-100 last:border-b-0">
            <span className="font-medium text-neutral-800 capitalize">{bh.day}:</span> 
            <span className={`font-medium ${!bh.isClosed && bh.openTime && bh.closeTime ? 'text-green-700' : 'text-red-600'}`}>
              {!bh.isClosed && bh.openTime && bh.closeTime ? `${bh.openTime} - ${bh.closeTime}` : 'Closed'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessHours;
