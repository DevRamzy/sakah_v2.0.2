import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Share2, 
  Heart, 
  Camera,
  Play,
  MapPin
} from 'lucide-react';
import type { ProcessedImage } from '../../types/images';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  location: string;
  images: ProcessedImage[];
  backPath?: string;
  backLabel?: string;
  hasVirtualTour?: boolean;
  onShare?: () => void;
  onFavorite?: () => void;
  children?: React.ReactNode; // For custom overlay content
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  location,
  images,
  backPath = "/listings",
  backLabel = "Back to Listings",
  hasVirtualTour = false,
  onShare,
  onFavorite,
  children
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;

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

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out: ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show a toast or notification here
      alert('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (onFavorite) {
      onFavorite();
    }
  };

  const handleNext = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const handlePrevious = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  };

  // Touch event handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Handle keyboard navigation in fullscreen gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        setIsGalleryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGalleryOpen, images.length]);

  // Ensure we have valid images
  const validImages = images.filter(img => img && img.url);
  const hasImages = validImages.length > 0;

  return (
    <div className="relative bg-white">
      {/* Back Navigation */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          to={backPath}
          className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{backLabel}</span>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleFavorite}
          className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
            isFavorited 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="p-3 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300 shadow-lg"
          aria-label="Share listing"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Gallery */}
      <div 
        className="relative h-[60vh] md:h-[70vh] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {hasImages ? (
          <>
            <img
              src={validImages[currentImageIndex]?.url}
              alt={validImages[currentImageIndex]?.alt || title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter and Gallery Button */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-10">
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full transition-all duration-300"
                aria-label="Open gallery"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm">{validImages.length} Photos</span>
              </button>
              {hasVirtualTour && (
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-all duration-300 font-medium"
                  aria-label="View virtual tour"
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Virtual Tour</span>
                </button>
              )}
            </div>

            {/* Image Dots */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1 z-10">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
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

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
              {subtitle && (
                <p className="text-xl text-white/90 mb-2">{subtitle}</p>
              )}
              <div className="flex items-center gap-2 text-white/90 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
              {children}
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
            ref={galleryRef}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label="Close gallery"
              >
                <X className="w-6 h-6" />
              </button>

              <div 
                className="relative w-full h-full flex items-center justify-center p-4"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={validImages[currentImageIndex]?.url}
                  alt={validImages[currentImageIndex]?.alt || title}
                  className="max-w-full max-h-full object-contain"
                />

                {validImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 hide-scrollbar">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-yellow-500' : 'border-transparent'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {validImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;