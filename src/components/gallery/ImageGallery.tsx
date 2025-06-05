import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlaceholderImage, getImageUrl } from '../../utils/imageUtils';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import type { ListingImage } from '../../types/listings';

// Our component can work with either ListingImage from the app or a simpler ImageItem structure
export interface ImageItem {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ImageGalleryProps {
  images: (ImageItem | ListingImage)[];
  initialImageIndex?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  initialImageIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [imageErrorStates, setImageErrorStates] = useState<Record<number, boolean>>({});
  const [thumbnailLoadingStates, setThumbnailLoadingStates] = useState<Record<number, boolean>>({});
  const [thumbnailErrorStates, setThumbnailErrorStates] = useState<Record<number, boolean>>({});
  
  // Handle empty images array
  if (!images || images.length === 0) {
    return null;
  }
  
  // Process images to ensure they have valid URLs
  const processedImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    
    // Debug: Log incoming images
    console.log('[ImageGallery] Processing images:', images);
    
    // Process each image to ensure it has a valid URL
    const processed = images.map(image => {
      // If the image already has a valid URL, use it directly
      if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
        return image;
      }
      
      // If the image has a storagePath or path, generate a URL
      if ('storagePath' in image || 'path' in image) {
        const storagePath = (image as ListingImage).storagePath || (image as any).path;
        if (storagePath) {
          try {
            const url = getImageUrl(storagePath, 'listing_images');
            console.log(`[ImageGallery] Generated URL for image:`, { storagePath, url });
            return { ...image, url };
          } catch (error) {
            console.error(`[ImageGallery] Error generating URL:`, error);
            return { ...image, url: getPlaceholderImage() };
          }
        }
      }
      
      // Fallback to placeholder
      return { ...image, url: getPlaceholderImage() };
    });
    
    console.log('[ImageGallery] Processed images:', processed);
    return processed;
  }, [images]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };


  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false); // Reset zoom when toggling fullscreen
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
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
  React.useEffect(() => {
    const newDirection = page > currentIndex ? -1 : 1;
    setPage([currentIndex, newDirection]);
  }, [currentIndex]);

  // Render gallery in standard mode
  const renderStandardGallery = () => (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-lg bg-neutral-100 aspect-video mb-4">
        <AnimatePresence initial={false} custom={direction}>
          <div className="relative w-full h-full" key={currentIndex}>
            {/* Loading indicator */}
            {imageLoadingStates[currentIndex] !== false && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
              </div>
            )}
            
            {/* Error indicator */}
            {imageErrorStates[currentIndex] && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-500">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p>Failed to load image</p>
              </div>
            )}
            
            <motion.img
              key={currentIndex}
              src={processedImages[currentIndex]?.url || getPlaceholderImage()}
              alt={`Image ${currentIndex + 1}`}
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className={`w-full h-full object-contain ${imageLoadingStates[currentIndex] !== false ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
              loading="eager"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onLoad={() => {
                console.log(`[ImageGallery] Image ${currentIndex} loaded successfully:`, processedImages[currentIndex]?.url);
                setImageLoadingStates(prev => ({ ...prev, [currentIndex]: false }));
              }}
              onError={(e) => {
                console.error(`[ImageGallery] Error loading image ${currentIndex}:`, processedImages[currentIndex]?.url, e);
                setImageLoadingStates(prev => ({ ...prev, [currentIndex]: false }));
                setImageErrorStates(prev => ({ ...prev, [currentIndex]: true }));
              }}
            />
          </div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="View fullscreen"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div className="flex overflow-x-auto space-x-2 pb-2 hide-scrollbar">
        {processedImages.map((image, index) => (
          <motion.div
            key={image.id || index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 cursor-pointer border-2 ${currentIndex === index ? 'border-yellow-500' : 'border-transparent'}`}
          >
            <div className="relative h-16 w-16">
              {/* Loading state for thumbnail */}
              {thumbnailLoadingStates[index] !== false && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 rounded">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Error state for thumbnail */}
              {thumbnailErrorStates[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 rounded">
                  <AlertCircle className="w-4 h-4 text-neutral-400" />
                </div>
              )}
              
              <img 
                src={image?.url || getPlaceholderImage()} 
                alt={`Thumbnail ${index + 1}`} 
                className={`h-16 w-16 object-cover rounded ${thumbnailLoadingStates[index] !== false ? 'opacity-0' : 'opacity-100'}`}
                loading="eager"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={() => setThumbnailLoadingStates(prev => ({ ...prev, [index]: false }))}
                onError={() => {
                  setThumbnailLoadingStates(prev => ({ ...prev, [index]: false }));
                  setThumbnailErrorStates(prev => ({ ...prev, [index]: true }));
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Image counter */}
      <div className="text-center text-sm text-neutral-500 mt-2">
        {currentIndex + 1} / {processedImages.length}
      </div>
    </div>
  );

  // Render gallery in fullscreen mode
  const renderFullscreenGallery = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.img
          src={processedImages[currentIndex].url || getPlaceholderImage(1200, 800)}
          alt={`Image ${currentIndex + 1}`}
          className={`max-h-screen max-w-screen ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'}`}
          style={{ 
            objectFit: "contain",
            transition: "transform 0.3s ease-in-out"
          }}
          onClick={toggleZoom}
          animate={{ scale: isZoomed ? 1.5 : 1 }}
        />
      </div>
      
      {/* Controls */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
      
      {/* Close button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        aria-label="Close fullscreen"
      >
        <X className="w-6 h-6" />
      </button>
      
      {/* Zoom toggle */}
      <button
        onClick={toggleZoom}
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
      >
        {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
      </button>
      
      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
        {currentIndex + 1} / {processedImages.length}
      </div>
    </motion.div>
  );

  return (
    <>
      {renderStandardGallery()}
      <AnimatePresence>
        {isFullscreen && renderFullscreenGallery()}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
