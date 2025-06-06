import React, { useState } from 'react';
import { MapPin, Navigation, Coffee, ShoppingBag, GraduationCap, Hospital, Car } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  nearbyAmenities?: Array<{
    name: string;
    type: 'restaurant' | 'shopping' | 'school' | 'hospital' | 'transport' | 'other';
    distance: string;
    rating?: number;
  }>;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  address,
  latitude,
  longitude,
  nearbyAmenities = []
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'amenities'>('map');

  const getAmenityIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return Coffee;
      case 'shopping': return ShoppingBag;
      case 'school': return GraduationCap;
      case 'hospital': return Hospital;
      case 'transport': return Car;
      default: return MapPin;
    }
  };

  const getAmenityColor = (type: string) => {
    switch (type) {
      case 'restaurant': return 'text-orange-500';
      case 'shopping': return 'text-purple-500';
      case 'school': return 'text-blue-500';
      case 'hospital': return 'text-red-500';
      case 'transport': return 'text-green-500';
      default: return 'text-neutral-500';
    }
  };

  // Mock map URL - in a real implementation, you'd use Google Maps, Mapbox, etc.
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-neutral-800">Location & Nearby</h3>
        </div>
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'map'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'amenities'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Amenities
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        <div className="relative">
          <div className="h-96 bg-neutral-100 flex items-center justify-center">
            {/* In a real implementation, you'd embed an actual map here */}
            <iframe
              src={mapUrl}
              width="100%"
              height="384"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
          
          {/* Address Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-neutral-800">{address}</p>
                  <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nearbyAmenities.length > 0 ? (
              nearbyAmenities.map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity.type);
                const iconColor = getAmenityColor(amenity.type);
                
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                    <div className={`p-2 rounded-lg bg-white ${iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800">{amenity.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-neutral-600">{amenity.distance}</span>
                        {amenity.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-yellow-600">★</span>
                            <span className="text-sm text-neutral-600">{amenity.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-8">
                <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No nearby amenities data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;