import React from 'react';
import { Tag, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import DetailItem from './DetailItem';

interface ListingGeneralInfoProps {
  category: string;
  subcategory?: string;
  phone?: string;
  email?: string;
  website?: string;
}

const ListingGeneralInfo: React.FC<ListingGeneralInfoProps> = ({
  category,
  subcategory,
  phone,
  email,
  website
}) => {
  return (
    <div className="mb-8 pb-8 border-b border-neutral-200">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <Tag className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> General Information
      </h2>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <DetailItem 
          icon={Tag} 
          label="Category" 
          value={`${category}${subcategory ? ` - ${subcategory}` : ''}`} 
        />
        
        {phone && (
          <DetailItem icon={Phone} label="Phone">
            <a href={`tel:${phone}`} className="text-yellow-600 hover:text-yellow-700 hover:underline">
              {phone}
            </a>
          </DetailItem>
        )}
        
        {email && (
          <DetailItem icon={Mail} label="Email">
            <a href={`mailto:${email}`} className="text-yellow-600 hover:text-yellow-700 hover:underline">
              {email}
            </a>
          </DetailItem>
        )}
        
        {website && (
          <DetailItem icon={Globe} label="Website" className="md:col-span-2">
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-yellow-600 hover:text-yellow-700 hover:underline flex items-center"
            >
              {website} <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
          </DetailItem>
        )}
      </dl>
    </div>
  );
};

export default ListingGeneralInfo;
