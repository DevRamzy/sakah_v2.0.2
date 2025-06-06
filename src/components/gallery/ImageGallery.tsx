import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlaceholderImage } from '../../utils/imageUtils';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import type { ProcessedImage } from '../../types/images';

interface ImageGalleryProps {
  images: ProcessedImage[];
  initialImageIndex?: number;
  onClose?: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  initialImageIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [imageErrorStates, setImageErrorStates] = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance in pixels
  const minSwipeDistance = 50;
  
  // Handle empty images array
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-white text-center p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl">No images available</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setIsZoomed(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
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

  // Variants for animation
  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // Direction of slide animation
  const [[page, direction], setPage] = useState([0, 0]);

  // Update page and direction when currentIndex changes
  useEffect(() => {
    const newDirection = page > currentIndex ? -1 : 1;
    setPage([currentIndex, newDirection]);
  }, [currentIndex, page]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            {/* Loading indicator */}
            {imageLoadingStates[currentIndex] !== false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
              </div>
            )}
            
            {/* Error indicator */}
            {imageErrorStates[currentIndex] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p>Failed to load image</p>
              </div>
            )}
            
            <img
              src={images[currentIndex]?.url || getPlaceholderImage()}
              alt={images[currentIndex]?.alt || `Image ${currentIndex + 1}`}
              className={`max-h-full max-w-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'} ${imageLoadingStates[currentIndex] !== false ? 'opacity-0' : 'opacity-100'}`}
              onClick={toggleZoom}
              onLoad={() => setImageLoadingStates(prev => ({ ...prev, [currentIndex]: false }))}
              onError={() => {
                setImageLoadingStates(prev => ({ ...prev, [currentIndex]: false }));
                setImageErrorStates(prev => ({ ...prev, [currentIndex]: true }));
              }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>

      {/* Zoom toggle */}
      <button
        onClick={toggleZoom}
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
      >
        {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
      </button>
      
      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full z-20">
        {currentIndex + 1} / {images.length}
      </div>
      
      {/* Thumbnail Strip */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 hide-scrollbar z-20">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index ? 'border-yellow-500' : 'border-transparent'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;