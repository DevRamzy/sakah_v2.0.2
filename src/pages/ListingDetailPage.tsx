import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getListingById } from '../features/listings/services/listingService';
import { listBuckets, getPlaceholderImage, getImageUrl } from '../utils/imageUtils';
import { ListingCategory } from '../types/listings';
import type { 
  Listing, 
  PropertyListing, 
  ServiceListing, 
  AutoDealershipListing,
  StoreListing,
  BusinessHours
} from '../types/listings';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Star, Phone, Mail, Globe, Clock, Tag, BedDouble, Bath, ListChecks, Wrench, ShoppingBag, Car, Building, Info, ShieldCheck, ExternalLink, Bookmark, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import ImageGallery from '../components/gallery/ImageGallery';

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value?: string | number | null, children?: React.ReactNode, className?: string }> = ({ icon: Icon, label, value, children, className }) => (
  <div className={`py-3 ${className || ''}`}>
    <div className="flex items-center mb-1.5">
      <Icon className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
      <dt className="text-base font-medium text-neutral-700">{label}</dt>
    </div>
    <dd className="text-neutral-800 ml-7 text-base">
      {children || value || <span className="text-neutral-400 italic">Not specified</span>}
    </dd>
  </div>
);

const renderCategorySpecificDetails = (listing: Listing) => {
  // Render property-specific details
  const renderPropertyDetails = (listing: PropertyListing) => {
    const { propertyDetails } = listing;
    
    if (!propertyDetails) return null;
    
    return (
      <div className="mb-8 pb-8 border-b border-neutral-200">
        <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
          <Building className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Property Details
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {propertyDetails.propertyType && <DetailItem icon={Building} label="Property Type" value={propertyDetails.propertyType} />}
          {propertyDetails.bedrooms && <DetailItem icon={BedDouble} label="Bedrooms" value={propertyDetails.bedrooms} />}
          {propertyDetails.bathrooms && <DetailItem icon={Bath} label="Bathrooms" value={propertyDetails.bathrooms} />}
          {propertyDetails.size && <DetailItem icon={MapPin} label="Square Footage" value={`${propertyDetails.size} sq ft`} />}
          {propertyDetails.amenities && propertyDetails.amenities.length > 0 && (
            <DetailItem icon={ListChecks} label="Amenities" className="md:col-span-2">
              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {propertyDetails.amenities.map((amenity: string, index: number) => (
                  <li key={index} className="flex items-center bg-neutral-50 px-3 py-2 rounded-lg shadow-sm">
                    <ShieldCheck className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                    <span className="text-neutral-800">{amenity}</span>
                  </li>
                ))}
              </ul>
            </DetailItem>
          )}
        </dl>
      </div>
    );
  };

  switch (listing.category) {
    case ListingCategory.PROPERTY:
      const propertyListing = listing as PropertyListing;
      return renderPropertyDetails(propertyListing);
    case ListingCategory.SERVICES:
      const serviceListing = listing as ServiceListing;
      return (
        <div className="mb-8 pb-8 border-b border-neutral-200">
          <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
            <Wrench className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Service Details
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {serviceListing.services && serviceListing.services.length > 0 && (
              <div className="md:col-span-2">
                <h4 className="font-semibold text-lg text-neutral-800 mb-3">Services Offered</h4>
                <ul className="space-y-3">
                  {serviceListing.services.map(service => (
                    <li key={service.id || service.name} className="p-4 border border-neutral-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
                      <div className="font-semibold text-neutral-900 text-lg">{service.name}</div>
                      {service.description && <div className="text-neutral-600 mt-1.5">{service.description}</div>}
                      {service.price && <div className="font-medium text-neutral-700 mt-2">Price: ${service.price}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </dl>
        </div>
      );
    case ListingCategory.STORE:
      const storeListing = listing as StoreListing;
      return (
        <div className="mb-8 pb-8 border-b border-neutral-200">
          <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Store Details
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem icon={Clock} label="Business Hours" className="md:col-span-2">
              {storeListing.businessHours && storeListing.businessHours.length > 0 ? (
                <ul className="space-y-1.5">
                  {storeListing.businessHours.map((bh: BusinessHours) => (
                    <li key={bh.day} className="flex justify-between py-1">
                      <span className="font-medium capitalize">{bh.day}:</span> 
                      <span className={`font-medium ${!bh.isClosed && bh.openTime && bh.closeTime ? 'text-green-700' : 'text-red-600'}`}>
                        {!bh.isClosed && bh.openTime && bh.closeTime ? `${bh.openTime} - ${bh.closeTime}` : 'Closed'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-neutral-400 italic">No business hours specified</span>
              )}
            </DetailItem>
          </dl>
        </div>
      );
    case ListingCategory.AUTO_DEALERSHIP:
      const autoDealershipListing = listing as AutoDealershipListing;
      const { autoDealershipDetails } = autoDealershipListing;
      
      return (
        <div className="mb-8 pb-8 border-b border-neutral-200">
          <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
            <Car className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Dealership Details
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {autoDealershipDetails?.financingAvailable !== undefined && (
              <DetailItem 
                icon={Tag} 
                label="Financing" 
                value={autoDealershipDetails.financingAvailable ? 'Available' : 'Not Available'} 
              />
            )}
            
            {autoDealershipDetails?.brands && autoDealershipDetails.brands.length > 0 && (
              <DetailItem icon={Tag} label="Brands" className="md:col-span-2">
                <div className="flex flex-wrap gap-2 mt-2">
                  {autoDealershipDetails.brands.map((brand, index) => (
                    <span key={index} className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg shadow-sm border border-neutral-200">
                      {brand}
                    </span>
                  ))}
                </div>
              </DetailItem>
            )}
            
            {autoDealershipDetails?.specializations && autoDealershipDetails.specializations.length > 0 && (
              <DetailItem icon={ShieldCheck} label="Specializations" className="md:col-span-2">
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {autoDealershipDetails.specializations.map((spec, index) => (
                    <li key={index} className="flex items-center bg-neutral-50 px-3 py-2 rounded-lg shadow-sm">
                      <ShieldCheck className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                      <span className="text-neutral-800">{spec}</span>
                    </li>
                  ))}
                </ul>
              </DetailItem>
            )}
            
            {autoDealershipDetails?.servicesOffered && autoDealershipDetails.servicesOffered.length > 0 && (
              <DetailItem icon={ListChecks} label="Services Offered" className="md:col-span-2">
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {autoDealershipDetails.servicesOffered.map((service: string, index: number) => (
                    <li key={index} className="flex items-center bg-neutral-50 px-3 py-2 rounded-lg shadow-sm">
                      <ShieldCheck className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
                      <span className="text-neutral-800">{service}</span>
                    </li>
                  ))}
                </ul>
              </DetailItem>
            )}
            
            <DetailItem icon={Clock} label="Business Hours" className="md:col-span-2">
              {autoDealershipListing.businessHours && autoDealershipListing.businessHours.length > 0 ? (
                <ul className="space-y-1.5">
                  {autoDealershipListing.businessHours.map((bh: BusinessHours) => (
                    <li key={bh.day} className="flex justify-between py-1">
                      <span className="font-medium capitalize">{bh.day}:</span> 
                      <span className={`font-medium ${!bh.isClosed && bh.openTime && bh.closeTime ? 'text-green-700' : 'text-red-600'}`}>
                        {!bh.isClosed && bh.openTime && bh.closeTime ? `${bh.openTime} - ${bh.closeTime}` : 'Closed'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-neutral-400 italic">No business hours specified</span>
              )}
            </DetailItem>
          </dl>
        </div>
      );
    default:
      return null;
  }
};

const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  // const mainContentRef = useRef<HTMLDivElement>(null); // Not used currently

  const { scrollYProgress: scrollYProgressHero } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // scrollYProgressContent and its useScroll call removed as it's unused
  // const { scrollYProgress: scrollYProgressContent } = useScroll({
  //   target: mainContentRef,
  //   offset: ['start end', 'end start'],
  // });

  const heroImageY = useTransform(scrollYProgressHero, [0, 1], ['0%', '50%']);
  const heroImageScale = useTransform(scrollYProgressHero, [0, 1], [1, 1.3]);
  const heroContentOpacity = useTransform(scrollYProgressHero, [0, 0.5, 1], [1, 1, 0]);

  const processedImages = useMemo(() => {
    if (!listing?.images) return [];
    
    console.log('[ListingDetailPage] Raw listing images:', listing.images);
    
    // Process each image individually for better debugging
    const processed = listing.images.map(image => {
      // Log the raw image data
      console.log('[ListingDetailPage] Processing image:', {
        id: image.id,
        path: image.path,
        storagePath: image.storagePath,
        isPrimary: image.isPrimary
      });
      
      // If the image already has a valid URL, use it directly
      if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
        console.log('[ListingDetailPage] Image already has valid URL:', image.url);
        return image;
      }
      
      // Generate URL from storagePath
      const storagePath = image.storagePath || image.path;
      if (storagePath) {
        try {
          const url = getImageUrl(storagePath, 'listing_images');
          console.log(`[ListingDetailPage] Generated URL for image:`, { storagePath, url });
          return { ...image, url };
        } catch (error) {
          console.error(`[ListingDetailPage] Error generating URL:`, error);
          return { ...image, url: getPlaceholderImage() };
        }
      }
      
      // Fallback to placeholder
      return { ...image, url: getPlaceholderImage() };
    });
    
    console.log('[ListingDetailPage] Processed images:', processed);
    return processed;
  }, [listing?.images]);

  const primaryImage = useMemo(() => {
    if (!processedImages?.length) return getPlaceholderImage();
    
    // Find the primary image, or default to the first image
    const primary = processedImages.find(img => img.isPrimary) || processedImages[0];
    return primary.url || getPlaceholderImage();
  }, [processedImages]);

  const enhancedListing = useMemo(() => {
    if (!listing) return null;
    return {
      ...listing,
      images: processedImages
    };
  }, [listing, processedImages]);

  useEffect(() => {
    if (!listingId) {
      setError('Listing ID is missing.');
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        
        // Debug: List available buckets in Supabase
        const buckets = await listBuckets();
        console.log('[ListingDetailPage] Available buckets in Supabase:', buckets);
        
        const fetchedListing = await getListingById(listingId);

        if (!fetchedListing) {
          setError('Listing not found.');
          setLoading(false);
          return;
        }

        // Access control logic
        if (!fetchedListing.isPublished) {
          if (!user || user.id !== fetchedListing.userId) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
        }

        console.log('[ListingDetailPage] Fetched Listing Images:', fetchedListing?.images);
        setListing(fetchedListing);
        setError(null);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, user?.id]);



  // Mock rating data (would come from the database in a real implementation)
  const rating = listing ? {
    value: (Math.random() * 1.5 + 3.5).toFixed(1), // Random rating between 3.5 and 5.0
    count: Math.floor(Math.random() * 300) + 10 // Random count between 10 and 310
  } : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-100 p-4 text-center">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h1>
        <p className="text-lg text-neutral-700 mb-8">You do not have permission to view this listing as it is currently a draft.</p>
        <Link to="/listings" className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
          Back to Listings
        </Link>
        {/* <Navigate to="/" replace /> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-100 p-4 text-center">
        <Info className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-4">Error</h1>
        <p className="text-lg text-neutral-700 mb-8">{error}</p>
        <Link to="/listings" className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
          Back to Listings
        </Link>
        {/* <Navigate to="/" replace /> */}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-100 p-4 text-center">
        <Info className="w-16 h-16 text-neutral-500 mb-4" />
        <p className="text-2xl text-neutral-700">Listing not found.</p>
        <Link to="/listings" className="mt-6 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
          Back to Listings
        </Link>
      </div>
    );
  }



  // Handle contact button click
  const handleContactClick = () => {
    if (listing?.phone) {
      window.location.href = `tel:${listing.phone}`;
    } else if (listing?.email) {
      window.location.href = `mailto:${listing.email}`;
    } else {
      // Handle case where no contact info is available, perhaps scroll to a contact form if one exists
      console.log('No contact information available');
    }
  };

  // Handle save button click (placeholder)
  const handleSaveClick = () => {
    // Implement save/bookmark functionality here
    console.log('Save listing clicked');
    alert('Save functionality to be implemented!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="bg-neutral-100 min-h-screen"
    >
      {/* Hero Section */}
      <motion.div 
        ref={heroRef} 
        className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-black"
      >
        {primaryImage ? (
          <motion.img 
            src={primaryImage} 
            alt={listing.businessName} 
            className="absolute inset-0 w-full h-[130%] md:h-[150%] object-cover"
            style={{ y: heroImageY, scale: heroImageScale }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
            <Building className="w-32 h-32 text-neutral-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        
        <Link 
          to="/listings"
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-black/50 hover:bg-yellow-500 text-white hover:text-black p-2.5 rounded-full transition-colors duration-300 shadow-lg"
          aria-label="Back to listings"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Link>

        <motion.div 
          style={{ opacity: heroContentOpacity }}
          className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10"
        >
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-xl">
            {listing.businessName}
          </h1>
        </motion.div>

        {/* Floating action buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-30">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.2 }}
            onClick={handleContactClick}
            className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all duration-300">
            <Phone className="w-6 h-6 text-white" />
          </motion.button>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.3 }}
            onClick={handleSaveClick}
            className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-neutral-800 transition-all duration-300">
            <Bookmark className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-t-xl md:rounded-xl -mt-12 md:-mt-20 relative z-10">
        <div className="p-6 md:p-10">
          {/* Header Section (condensed, as title is in hero) */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
              {/* Business Name h1 is removed from here */}
              {rating && (
                <div className="flex items-center flex-shrink-0 bg-neutral-100 px-4 py-2 rounded-lg shadow-sm">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="ml-2 text-lg font-semibold text-neutral-800">{rating.value}</span>
                  <span className="ml-1.5 text-sm text-neutral-500">({rating.count} reviews)</span>
                </div>
              )}
            </div>
            <div className="flex items-center text-neutral-700 mb-4 text-lg">
              <MapPin className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" />
              <span>{listing.location}</span>
            </div>
            <span 
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium tracking-wide 
                ${listing.isPublished 
                  ? 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/30' 
                  : 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/30'}
              `}
            >
              {listing.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          
          {/* Image Gallery Section */}
          {listing.images && listing.images.length > 0 && (
            <div className="mb-8 pb-8 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                <ImageIcon className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Gallery
              </h2>
              <ImageGallery 
                images={enhancedListing ? enhancedListing.images : []} 
                initialImageIndex={enhancedListing && enhancedListing.images.findIndex(img => img.isPrimary) !== -1 ? 
                  enhancedListing.images.findIndex(img => img.isPrimary) : 0} 
              />
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mb-8 pb-8 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> About this Business
              </h2>
              <p className="text-neutral-700 text-base leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Core Details Section */}
          <div className="mb-8 pb-8 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
              <Tag className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> General Information
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DetailItem icon={Tag} label="Category" value={`${listing.category}${listing.subcategory ? ` - ${listing.subcategory}` : ''}`} />
              {listing.phone && <DetailItem icon={Phone} label="Phone"><a href={`tel:${listing.phone}`} className="text-yellow-600 hover:text-yellow-700 hover:underline">{listing.phone}</a></DetailItem>}
              {listing.email && <DetailItem icon={Mail} label="Email"><a href={`mailto:${listing.email}`} className="text-yellow-600 hover:text-yellow-700 hover:underline">{listing.email}</a></DetailItem>}
              {listing.website && 
                <DetailItem icon={Globe} label="Website" className="md:col-span-2">
                  <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-700 hover:underline flex items-center">
                    {listing.website} <ExternalLink className="w-4 h-4 ml-1.5" />
                  </a>
                </DetailItem>
              }
            </dl>
          </div>

          {/* Category Specific Details Rendered Here */}
          {renderCategorySpecificDetails(listing)}

          {/* Business Hours */}
          {listing.businessHours && listing.businessHours.length > 0 && (
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Business Hours
              </h3>
              <ul className="space-y-2">
                {listing.businessHours.map(bh => (
                  <li key={bh.day} className="flex justify-between text-base text-neutral-700 py-2 border-b border-neutral-100 last:border-b-0">
                    <span className="font-medium text-neutral-800 capitalize">{bh.day}:</span> 
                    <span className={`font-medium ${!bh.isClosed && bh.openTime && bh.closeTime ? 'text-green-700' : 'text-red-600'}`}>
                      {!bh.isClosed && bh.openTime && bh.closeTime ? `${bh.openTime} - ${bh.closeTime}` : 'Closed'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services (if applicable and not the primary category, e.g. for a Store that also offers repairs) */}
          {listing.category !== ListingCategory.SERVICES && listing.services && listing.services.length > 0 && (
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                <ListChecks className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Additional Services
              </h3>
              <ul className="space-y-4">
                {listing.services.map(service => (
                  <li key={service.id || service.name} className="p-4 border border-neutral-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
                    <p className="font-semibold text-neutral-900 text-lg">{service.name}</p>
                    {service.description && <p className="text-sm text-neutral-600 mt-1.5">{service.description}</p>}
                    {service.price && <p className="text-base text-neutral-700 mt-2 font-medium">Price: ${service.price}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListingDetailPage;
