import React from 'react';
import { ListChecks } from 'lucide-react';

interface Service {
  id?: string;
  name: string;
  description?: string;
  price?: number;
}

interface AdditionalServicesProps {
  services: Service[];
}

const AdditionalServices: React.FC<AdditionalServicesProps> = ({ services }) => {
  if (!services || services.length === 0) return null;
  
  return (
    <div className="mt-8 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
        <ListChecks className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Additional Services
      </h3>
      <ul className="space-y-4">
        {services.map(service => (
          <li 
            key={service.id || service.name} 
            className="p-4 border border-neutral-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="font-semibold text-neutral-900 text-lg">{service.name}</p>
            {service.description && <p className="text-sm text-neutral-600 mt-1.5">{service.description}</p>}
            {service.price && <p className="text-base text-neutral-700 mt-2 font-medium">Price: ${service.price}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdditionalServices;
