import React from 'react';
import { Info } from 'lucide-react';

interface ListingDescriptionProps {
  description: string;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({ description }) => {
  if (!description) return null;
  
  return (
    <div className="mb-8 pb-8 border-b border-neutral-200">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <Info className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> About this Business
      </h2>
      <p className="text-neutral-700 text-base leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
};

export default ListingDescription;
