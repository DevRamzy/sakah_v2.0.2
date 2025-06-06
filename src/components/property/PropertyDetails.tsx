import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Home, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Wifi,
  Car,
  Trees,
  Shield,
  Zap
} from 'lucide-react';

interface PropertyDetailsProps {
  description: string;
  features: string[];
  propertyHistory: Array<{
    date: string;
    event: string;
    price?: number;
  }>;
  yearBuilt?: number;
  propertyType: string;
  lotSize?: number;
  hoaFees?: number;
  taxInfo?: {
    annualTax: number;
    taxYear: number;
  };
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  description,
  features,
  propertyHistory,
  yearBuilt,
  propertyType,
  lotSize,
  hoaFees,
  taxInfo
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    features: false,
    history: false,
    details: false
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

  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    if (lowerFeature.includes('wifi') || lowerFeature.includes('internet')) return Wifi;
    if (lowerFeature.includes('parking') || lowerFeature.includes('garage')) return Car;
    if (lowerFeature.includes('garden') || lowerFeature.includes('yard')) return Trees;
    if (lowerFeature.includes('security') || lowerFeature.includes('alarm')) return Shield;
    if (lowerFeature.includes('electric') || lowerFeature.includes('solar')) return Zap;
    return Home;
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
      {/* Description */}
      <CollapsibleSection
        title="Property Description"
        sectionKey="description"
        icon={Home}
      >
        <div className="pt-4">
          <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </CollapsibleSection>

      {/* Features & Amenities */}
      <CollapsibleSection
        title="Features & Amenities"
        sectionKey="features"
        icon={Home}
      >
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const IconComponent = getFeatureIcon(feature);
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <IconComponent className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      {/* Property Details */}
      <CollapsibleSection
        title="Property Details"
        sectionKey="details"
        icon={Home}
      >
        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Property Type</span>
                <span className="font-medium text-neutral-800">{propertyType}</span>
              </div>
              {yearBuilt && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Year Built</span>
                  <span className="font-medium text-neutral-800">{yearBuilt}</span>
                </div>
              )}
              {lotSize && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Lot Size</span>
                  <span className="font-medium text-neutral-800">{lotSize.toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {hoaFees && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">HOA Fees</span>
                  <span className="font-medium text-neutral-800">{formatPrice(hoaFees)}/month</span>
                </div>
              )}
              {taxInfo && (
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Annual Tax ({taxInfo.taxYear})</span>
                  <span className="font-medium text-neutral-800">{formatPrice(taxInfo.annualTax)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Property History */}
      <CollapsibleSection
        title="Property History"
        sectionKey="history"
        icon={TrendingUp}
      >
        <div className="pt-4">
          <div className="space-y-4">
            {propertyHistory.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-neutral-800">{event.event}</p>
                    <p className="text-sm text-neutral-600">{event.date}</p>
                  </div>
                </div>
                {event.price && (
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800">{formatPrice(event.price)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default PropertyDetails;