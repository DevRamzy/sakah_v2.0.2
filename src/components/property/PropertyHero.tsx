import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize, 
  Share2, 
  Heart, 
  Camera,
  Play,
  MapPin,
  Bed,
  Bath,
  Square
} from 'lucide-react';

interface PropertyHeroProps {
  propertyName: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  location: string;
  images?: Array<{ url: string; id?: string }>;
  hasVirtualTour?: boolean;
  onScheduleViewing: () => void;
  onContactAgent: () => void;
}

const PropertyHero: React.FC<PropertyHeroProps> = ({
  propertyName,
  price,
  bedrooms,
  bathrooms,
  squareFootage,
  location,
  images = [],
  hasVirtualTour = false,
  onScheduleViewing,
  onContactAgent
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (isGalleryOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }
    return () => {
      body.style.overflow = 'auto';
    };
  }, [isGalleryOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyName,
          text: `Check out this property: ${propertyName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <div className="relative bg-white">
      {/* Back Navigation */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          to="/listings"
          className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Listings</span>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
            isFavorited 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="p-3 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300 shadow-lg"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Gallery */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]?.url}
              alt={`${propertyName} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter and Gallery Button */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm">{images.length} Photos</span>
              </button>
              {hasVirtualTour && (
                <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-all duration-300 font-medium">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Virtual Tour</span>
                </button>
              )}
            </div>

            {/* Image Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <Camera className="w-16 h-16 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Property Information Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{propertyName}</h1>
              <div className="flex items-center gap-2 text-white/90 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
                {formatPrice(price)}
              </div>
              <div className="flex gap-6 text-white/90">
                {bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {squareFootage && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5" />
                    <span>{squareFootage.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onScheduleViewing}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors duration-300"
              >
                Schedule Viewing
              </button>
              <button
                onClick={onContactAgent}
                className="px-6 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold rounded-lg transition-all duration-300 border border-white/30"
              >
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={`${propertyName} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-yellow-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyHero;