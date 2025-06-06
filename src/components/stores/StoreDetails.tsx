import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Store, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink
} from 'lucide-react';

interface StoreDetailsProps {
  description: string;
  storeType: string;
  businessHours: Array<{
    day: string;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  specialOffers?: string[];
  paymentMethods?: string[];
}

const StoreDetails: React.FC<StoreDetailsProps> = ({
  description,
  storeType,
  businessHours,
  socialMedia = {},
  specialOffers = [],
  paymentMethods = []
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    hours: false,
    offers: false,
    social: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = businessHours.find(h => h.day === currentDay);
    if (!todayHours || todayHours.isClosed) {
      return { isOpen: false, status: 'Closed' };
    }
    
    if (todayHours.openTime && todayHours.closeTime) {
      const isOpen = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
      return { 
        isOpen, 
        status: isOpen ? 'Open' : 'Closed',
        hours: `${todayHours.openTime} - ${todayHours.closeTime}`
      };
    }
    
    return { isOpen: false, status: 'Closed' };
  };

  const status = getCurrentStatus();

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'website': return Globe;
      default: return ExternalLink;
    }
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
      {/* Store Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-3">
            <Store className="w-5 h-5 text-yellow-500" />
            Store Information
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.isOpen 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.status}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-600 mb-1">Store Type</p>
            <p className="font-medium text-neutral-800">{storeType}</p>
          </div>
          {status.hours && (
            <div>
              <p className="text-sm text-neutral-600 mb-1">Today's Hours</p>
              <p className="font-medium text-neutral-800">{status.hours}</p>
            </div>
          )}
        </div>
      </div>

      {/* Store Description */}
      <CollapsibleSection
        title="About Our Store"
        sectionKey="description"
        icon={Store}
      >
        <div className="pt-4">
          <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </CollapsibleSection>

      {/* Business Hours */}
      <CollapsibleSection
        title="Business Hours"
        sectionKey="hours"
        icon={Clock}
      >
        <div className="pt-4">
          <div className="space-y-3">
            {businessHours.map((hours, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="font-medium text-neutral-800 capitalize">{hours.day}</span>
                <span className={`font-medium ${
                  !hours.isClosed && hours.openTime && hours.closeTime 
                    ? 'text-green-700' 
                    : 'text-red-600'
                }`}>
                  {!hours.isClosed && hours.openTime && hours.closeTime 
                    ? `${hours.openTime} - ${hours.closeTime}` 
                    : 'Closed'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Special Offers */}
      {specialOffers.length > 0 && (
        <CollapsibleSection
          title="Special Offers & Promotions"
          sectionKey="offers"
          icon={Store}
        >
          <div className="pt-4">
            <div className="space-y-3">
              {specialOffers.map((offer, index) => (
                <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">{offer}</p>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Social Media & Online Presence */}
      {Object.keys(socialMedia).length > 0 && (
        <CollapsibleSection
          title="Connect With Us"
          sectionKey="social"
          icon={Globe}
        >
          <div className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(socialMedia).map(([platform, url]) => {
                if (!url) return null;
                const IconComponent = getSocialIcon(platform);
                
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors group"
                  >
                    <IconComponent className="w-6 h-6 text-neutral-600 group-hover:text-yellow-500 transition-colors" />
                    <span className="text-sm font-medium text-neutral-700 capitalize">
                      {platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-3">
            <Store className="w-5 h-5 text-yellow-500" />
            Accepted Payment Methods
          </h3>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetails;