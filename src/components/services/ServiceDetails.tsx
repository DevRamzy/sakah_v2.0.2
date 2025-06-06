import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Award, 
  Clock,
  DollarSign,
  CheckCircle,
  Star,
  MapPin
} from 'lucide-react';

interface ServiceDetailsProps {
  description: string;
  services: Array<{
    id?: string;
    name: string;
    description?: string;
    price?: number;
  }>;
  credentials?: string[];
  serviceArea?: string[];
  experience?: number;
  specialties?: string[];
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  description,
  services,
  credentials = [],
  serviceArea = [],
  experience,
  specialties = []
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    services: false,
    credentials: false,
    coverage: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
      {/* Service Description */}
      <CollapsibleSection
        title="About Our Services"
        sectionKey="description"
        icon={Wrench}
      >
        <div className="pt-4">
          <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
          
          {experience && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Experience</h4>
                  <p className="text-yellow-700">{experience} years of professional service</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Services & Pricing */}
      <CollapsibleSection
        title="Services & Pricing"
        sectionKey="services"
        icon={DollarSign}
      >
        <div className="pt-4">
          <div className="grid grid-cols-1 gap-4">
            {services.map((service, index) => (
              <div key={service.id || index} className="p-4 border border-neutral-200 rounded-lg hover:border-yellow-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-neutral-800">{service.name}</h4>
                  {service.price && (
                    <span className="text-lg font-bold text-yellow-600">
                      {formatPrice(service.price)}
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-neutral-600 text-sm">{service.description}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Credentials & Certifications */}
      {credentials.length > 0 && (
        <CollapsibleSection
          title="Credentials & Certifications"
          sectionKey="credentials"
          icon={Award}
        >
          <div className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((credential, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-700">{credential}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Service Coverage Area */}
      {serviceArea.length > 0 && (
        <CollapsibleSection
          title="Service Coverage Area"
          sectionKey="coverage"
          icon={MapPin}
        >
          <div className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {serviceArea.map((area, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-yellow-500" />
            Specialties
          </h3>
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
  );
};

export default ServiceDetails;