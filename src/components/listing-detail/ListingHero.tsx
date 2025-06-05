import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, ChevronLeft, Clock, MapPin, Star, ChevronRight, Image as ImageIcon, X, Maximize } from 'lucide-react';

interface ListingHeroProps {
  businessName: string;
  primaryImage: string | null;
  images?: Array<{ url: string; id?: string }>;
  category?: string;
  subcategory?: string;
  location?: string;
  isVerified?: boolean;
  businessHours?: Record<string, string>;
}

const ListingHero: React.FC<ListingHeroProps> = ({ 
  businessName, 
  primaryImage, 
  images = [],
  category, 
  subcategory,
  location,
  isVerified = false,
  businessHours = {}
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use images array if available, otherwise create an array with just the primary image
  const galleryImages = images.length > 0 ? images : (primaryImage ? [{ url: primaryImage }] : []);
  // Get current day to check if business is open
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isOpen = businessHours && businessHours[today] && businessHours[today] !== 'Closed';
  
  // Format hours for display
  const currentHours = businessHours && businessHours[today] ? businessHours[today] : '9:00 am - 6:00 pm';

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }
    return () => {
      body.style.overflow = 'auto'; // Cleanup on component unmount
    };
  }, [isModalOpen]);

  const handleOpenModal = (index?: number) => {
    if (typeof index === 'number') {
      setCurrentImageIndex(index);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative bg-black pt-8 pb-24 md:pt-12 md:pb-32 lg:pt-16 lg:pb-40"> {/* Main hero container with increased bottom padding to accommodate overlap */}
      {/* Background Image - Full Bleed */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {primaryImage ? (
          <motion.img 
            src={primaryImage} 
            alt={businessName} 
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <Building className="w-32 h-32 text-neutral-700" />
          </div>
        )}
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
      </div>

      {/* Content Wrapper (90% width, centered, flex for columns) */}
      <div className="relative z-10 w-[90%] max-w-7xl mx-auto flex flex-col md:flex-row md:items-start gap-x-8 gap-y-8">
        {/* Left Column: Text Content */}
        <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col">
          {/* Back button */} 
          <div className="mb-4 md:mb-6 self-start">
            <Link 
              to="/listings"
              className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md hover:bg-yellow-500 text-white hover:text-black rounded-full transition-all duration-300 shadow-lg group"
              aria-label="Back to listings"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Listings</span>
            </Link>
          </div>

          {/* Breadcrumb navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center text-sm text-white/80 mb-4"
          >
            <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/services" className="hover:text-yellow-400 transition-colors">{category || 'Services'}</Link>
            <span className="mx-2">/</span>
            <Link to={`/services/${subcategory?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-yellow-400 transition-colors">{subcategory || 'Home Services'}</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Listing Details</span>
          </motion.div>
          
          {/* Business name and verified badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-3 md:mb-4"
          >
            <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-lg">
              {businessName}
            </h1>
            {isVerified && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center">
                <Star className="w-3 h-3 mr-1 fill-black" /> VERIFIED
              </span>
            )}
          </motion.div>
          
          {/* Location and hours */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
          >
            {location && (
              <div className="flex items-center text-white/90">
                <MapPin className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm">{location}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm text-white/90">{today}: {currentHours}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Image Carousel */} 
        <div className="w-full md:w-2/5 lg:w-1/3 mt-4 md:mt-0 self-center md:self-start relative z-20"> {/* Added z-20 to ensure it stays above content below */} 
          {/* Carousel Card - this is the element that will overlap */} 
          <div className="bg-white rounded-lg shadow-xl overflow-hidden transform md:translate-y-1/2 lg:translate-y-2/3">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[2/3] lg:aspect-[1/2]"> {/* Much taller aspect ratio */}
              <AnimatePresence initial={false}>
                {galleryImages.length > 0 ? (
                  <motion.img 
                    key={currentImageIndex}
                    src={galleryImages[currentImageIndex]?.url} 
                    alt={`${businessName} - Image ${currentImageIndex + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    onClick={() => handleOpenModal(currentImageIndex)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <ImageIcon className="w-16 h-16 text-neutral-300" />
                  </div>
                )}
              </AnimatePresence>
              
              {/* Show all photos button */} 
              {galleryImages.length > 0 && (
                <button 
                  onClick={() => handleOpenModal(currentImageIndex)}
                  className="absolute top-3 right-3 z-10 p-2 bg-black/40 backdrop-blur-sm hover:bg-yellow-500 text-white hover:text-black rounded-full transition-all duration-300"
                  aria-label="Show all photos"
                >
                  <Maximize className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

              {/* Image count indicator */}
              {galleryImages.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>
              )}
              
              {/* Slider navigation buttons - only show if multiple images */}
              {galleryImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-yellow-500 text-white hover:text-black flex items-center justify-center transition-all duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % galleryImages.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-sm hover:bg-yellow-500 text-white hover:text-black flex items-center justify-center transition-all duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </>
              )}
              
              {/* Image indicator dots */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {galleryImages.map((_, index) => (
                    <button 
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-yellow-500 scale-125 w-3' : 'bg-white/60 hover:bg-white'}`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {isModalOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-md p-4"
            onClick={handleCloseModal} // Close modal on backdrop click
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-neutral-800 text-white rounded-lg shadow-2xl w-full max-w-screen-lg h-full max-h-[75vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside content
            >
              {/* Close button for modal */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-20 p-2 bg-black/30 hover:bg-yellow-500 text-white hover:text-black rounded-full transition-colors duration-200"
                aria-label="Close gallery"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image Display Area */}
              <div className="flex-grow relative w-full h-full flex items-center justify-center p-4 md:p-8">
                <AnimatePresence initial={false} custom={currentImageIndex}>
                  <motion.img
                    key={currentImageIndex} // Ensure re-render on image change
                    src={galleryImages[currentImageIndex]?.url}
                    alt={`${businessName} - Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none"
                    initial={{ opacity: 0, x: 0 }} // x: direction * 200 for slide effect if desired
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </AnimatePresence>
              </div>

              {/* Modal Navigation and Info Footer */}
              {galleryImages.length > 1 && (
                <div className="relative z-10 p-4 bg-neutral-800/50 border-t border-neutral-700">
                  <div className="flex items-center justify-between mb-3">
                    {/* Previous Button */}
                    <button 
                      onClick={() => setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)}
                      className="p-2 rounded-full hover:bg-neutral-700 transition-colors duration-200 disabled:opacity-50"
                      disabled={galleryImages.length <= 1}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="text-sm font-medium">
                      {currentImageIndex + 1} / {galleryImages.length}
                    </div>

                    {/* Next Button */}
                    <button 
                      onClick={() => setCurrentImageIndex(prev => (prev + 1) % galleryImages.length)}
                      className="p-2 rounded-full hover:bg-neutral-700 transition-colors duration-200 disabled:opacity-50"
                      disabled={galleryImages.length <= 1}
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex justify-center gap-2">
                    {galleryImages.map((_, index) => (
                      <button
                        key={`modal-dot-${index}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-800 ${currentImageIndex === index ? 'bg-yellow-500 scale-110' : 'bg-neutral-600 hover:bg-neutral-500'}`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingHero;
