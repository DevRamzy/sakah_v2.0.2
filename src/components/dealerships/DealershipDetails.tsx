import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Car, 
  Award,
  Clock,
  DollarSign,
  Shield,
  Wrench,
  Star
} from 'lucide-react';

interface DealershipDetailsProps {
  description: string;
  brands: string[];
  vehicleTypes: string[];
  services: string[];
  specialties: string[];
  yearEstablished?: number;
  financingAvailable: boolean;
  certifications?: string[];
  warranties?: string[];
}

const DealershipDetails: React.FC<DealershipDetailsProps> = ({
  description,
  brands,
  vehicleTypes,
  services,
  specialties,
  yearEstablished,
  financingAvailable,
  certifications = [],
  warranties = []
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    inventory: false,
    services: false,
    financing: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const CollapsibleSection: React.FC<{
    title: string;
    sectionKey: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }> = ({ title, sectionKey, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </button>
      
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-neutral-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dealership Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-3">
            <Car className="w-5 h-5 text-yellow-500" />
            Dealership Overview
          </h3>
          {yearEstablished && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Est. {yearEstablished}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-2xl font-bold text-neutral-800">{brands.length}</div>
            <div className="text-sm text-neutral-600">Brands Available</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-2xl font-bold text-neutral-800">{vehicleTypes.length}</div>
            <div className="text-sm text-neutral-600">Vehicle Types</div>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <div className="text-2xl font-bold text-neutral-800">{services.length}</div>
            <div className="text-sm text-neutral-600">Services Offered</div>
          </div>
        </div>
      </div>

      {/* About Dealership */}
      <CollapsibleSection
        title="About Our Dealership"
        sectionKey="description"
        icon={Car}
      >
        <div className="pt-4">
          <p className="text-neutral-700 leading-relaxed whitespace-pre-line mb-4">
            {description}
          </p>
          
          {specialties.length > 0 && (
            <div>
              <h4 className="font-semibold text-neutral-800 mb-3">Our Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Vehicle Inventory */}
      <CollapsibleSection
        title="Vehicle Inventory"
        sectionKey="inventory"
        icon={Car}
      >
        <div className="pt-4 space-y-6">
          <div>
            <h4 className="font-semibold text-neutral-800 mb-3">Available Brands</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {brands.map((brand, index) => (
                <div key={index} className="p-3 bg-neutral-50 rounded-lg text-center hover:bg-neutral-100 transition-colors">
                  <span className="font-medium text-neutral-800">{brand}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-800 mb-3">Vehicle Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicleTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Car className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-700">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Services & Maintenance */}
      <CollapsibleSection
        title="Services & Maintenance"
        sectionKey="services"
        icon={Wrench}
      >
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:border-yellow-300 transition-colors">
                <Wrench className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-neutral-700">{service}</span>
              </div>
            ))}
          </div>
          
          {warranties.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Warranty Options
              </h4>
              <div className="space-y-2">
                {warranties.map((warranty, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-green-800">{warranty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Financing Options */}
      <CollapsibleSection
        title="Financing & Payment Options"
        sectionKey="financing"
        icon={DollarSign}
      >
        <div className="pt-4">
          <div className={`p-4 rounded-lg border-2 ${
            financingAvailable 
              ? 'bg-green-50 border-green-200' 
              : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className={`w-6 h-6 ${
                financingAvailable ? 'text-green-600' : 'text-neutral-500'
              }`} />
              <h4 className={`font-semibold ${
                financingAvailable ? 'text-green-800' : 'text-neutral-700'
              }`}>
                Financing {financingAvailable ? 'Available' : 'Not Available'}
              </h4>
            </div>
            
            {financingAvailable ? (
              <div className="space-y-3">
                <p className="text-green-700">
                  We offer competitive financing options to help you get the vehicle you want.
                </p>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Competitive interest rates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Flexible payment terms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Quick approval process
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Trade-in options available
                  </li>
                </ul>
              </div>
            ) : (
              <p className="text-neutral-600">
                Please contact us for payment options and pricing information.
              </p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500" />
            Certifications & Awards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-neutral-700">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DealershipDetails;