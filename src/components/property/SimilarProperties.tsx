import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react';

interface SimilarProperty {
  id: string;
  name: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  location: string;
  image: string;
  isNew?: boolean;
}

interface SimilarPropertiesProps {
  properties: SimilarProperty[];
  currentPropertyId: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ 
  properties, 
  currentPropertyId 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Filter out the current property
  const filteredProperties = properties.filter(prop => prop.id !== currentPropertyId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h3 className="text-xl font-semibold text-neutral-800 mb-6">Similar Properties</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link to={`/listings/${property.id}`} className="block">
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                {/* Property Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle favorite logic
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <Heart className="w-4 h-4 text-neutral-600 hover:text-red-500" />
                  </button>

                  {/* New Badge */}
                  {property.isNew && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                      NEW
                    </div>
                  )}

                  {/* Price Overlay */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                    <span className="font-semibold">{formatPrice(property.price)}</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-neutral-800 mb-2 line-clamp-1">
                    {property.name}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-neutral-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm line-clamp-1">{property.location}</span>
                  </div>

                  {/* Property Stats */}
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>{property.squareFootage.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500">No similar properties found</p>
        </div>
      )}

      {filteredProperties.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            to="/listings?category=PROPERTY"
            className="inline-flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
          >
            View All Properties
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimilarProperties;