import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import { getListingById } from '../features/listings/services/listingService';
import { useAuth } from '../contexts/AuthContext';
import type { Listing } from '../types/listings';
import type { ProcessedImage } from '../types/images';
import ListingHero from '../components/listing-detail/ListingHero';
import ListingActionButtons from '../components/listing-detail/ListingActionButtons';
import ListingOwnerControls from '../components/listing-detail/ListingOwnerControls';

const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Process images only if listing exists
  const processedImages = useMemo(() => {
    if (!listing?.images) return [];
    
    return (listing.images || []).map((image: any) => {
      // Handle string image paths
      if (typeof image === 'string') {
        return { 
          url: getImageUrl(image), 
          isPrimary: false 
        } as ProcessedImage;
      }
      
      // Handle image objects
      try {
        // If image already has a valid URL
        if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
          return {
            ...image,
            isPrimary: image.isPrimary || false
          } as ProcessedImage;
        }
        
        // Get URL from storage path
        const storagePath = image.storagePath || image.path;
        if (storagePath) {
          return {
            ...image,
            url: getImageUrl(storagePath, 'listing_images'),
            isPrimary: image.isPrimary || false
          } as ProcessedImage;
        }
        
        // Fallback
        return {
          ...image,
          url: getPlaceholderImage(),
          isPrimary: image.isPrimary || false
        } as ProcessedImage;
      } catch (error) {
        // Error fallback
        return {
          ...image,
          url: getPlaceholderImage(),
          isPrimary: image.isPrimary || false
        } as ProcessedImage;
      }
    });
  }, [listing?.images]);

  const primaryImage = useMemo(() => {
    if (!processedImages?.length) return getPlaceholderImage();
    const primary = processedImages.find((img) => img.isPrimary) || processedImages[0];
    return primary.url || getPlaceholderImage();
  }, [processedImages]);

  useEffect(() => {
    if (!listingId) {
      setError('Listing ID is missing.');
      setLoading(false);
      return;
    }
    const fetchListing = async () => {
      try {
        setLoading(true);
        const fetchedListing = await getListingById(listingId);
        if (!fetchedListing) {
          setError('Listing not found.');
          setLoading(false);
          return;
        }
        if (!fetchedListing.isPublished) {
          if (!user || user.id !== fetchedListing.userId) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
        }
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

  const handleContactClick = () => {
    if (listing?.phone) window.location.href = `tel:${listing.phone}`;
    else if (listing?.email) window.location.href = `mailto:${listing.email}`;
    else console.log('No contact information available');
  };

  const handleSaveClick = () => {
    console.log('Save listing clicked');
    alert('Save functionality to be implemented!');
  };

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

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-neutral-50 min-h-screen pb-16"
    >
      {/* Hero Banner with Image Slider */}
      <ListingHero 
        businessName={listing.businessName}
        primaryImage={primaryImage}
        images={processedImages.map(img => ({ 
          url: img.url || '', 
          id: img.id || String(Math.random()) 
        }))}
        category={listing.category}
        subcategory={listing.subcategory}
        location={listing.location}
        isVerified={true} // Assuming the business is verified
        businessHours={listing.businessHours?.reduce((acc, hour) => {
          acc[hour.day] = hour.isClosed ? 'Closed' : `${hour.openTime || '9:00 am'} - ${hour.closeTime || '6:00 pm'}`;
          return acc;
        }, {} as Record<string, string>)}
      />
      
      {/* Floating Action Buttons */}
      <ListingActionButtons 
        onContactClick={handleContactClick}
        onSaveClick={handleSaveClick}
      />

      {/* Main Content Container - 90% width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-[90%] max-w-7xl">
        {/* Owner Controls - Only visible to listing owner */}
        <ListingOwnerControls listing={listing} userId={user?.id} />
        
        {/* Added By Section */}
        <div className="mt-6 mb-8">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Added By:</h3>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
              {listing.userId ? listing.userId.substring(0, 2).toUpperCase() : 'JD'}
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <div className="flex items-center gap-4 mt-1">
                <a href={`tel:${listing.phone || '+254 700 123 456'}`} className="text-sm text-neutral-600 flex items-center hover:text-yellow-500 transition-colors">
                  <Phone className="w-4 h-4 text-yellow-500 mr-1" />
                  {listing.phone || '+254 700 123 456'}
                </a>
                <a href={`mailto:${listing.email || 'john@example.com'}`} className="text-sm text-neutral-600 flex items-center hover:text-yellow-500 transition-colors">
                  <Mail className="w-4 h-4 text-yellow-500 mr-1" />
                  {listing.email || 'john@example.com'}
                </a>
              </div>
            </div>
          </div>
        </div>
        

        
        {/* About Service Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">About Service</h2>
          <p className="text-neutral-600 whitespace-pre-line">{listing.description}</p>
        </div>
        
        {/* Listing Details Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Listing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listing.services && listing.services.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                <ul className="list-disc list-inside space-y-1">
                  {listing.services.map((service, index) => (
                    <li key={service.id || index} className="text-neutral-600">{service.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Additional details based on category */}
            {listing.category === 'PROPERTY' && listing.propertyDetails && (
              <div>
                <h3 className="text-lg font-medium mb-2">Property Details</h3>
                <p className="text-neutral-600">Type: {listing.propertyDetails.propertyType}</p>
                {listing.propertyDetails.size && <p className="text-neutral-600">Size: {listing.propertyDetails.size} sqft</p>}
                {listing.propertyDetails.bedrooms && <p className="text-neutral-600">Bedrooms: {listing.propertyDetails.bedrooms}</p>}
                {listing.propertyDetails.bathrooms && <p className="text-neutral-600">Bathrooms: {listing.propertyDetails.bathrooms}</p>}
              </div>
            )}
          </div>
        </div>
        
        {/* Business Hours Section */}
        {listing.businessHours && listing.businessHours.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Business Hours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {listing.businessHours.map((hour, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="font-medium">{hour.day}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${hour.isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {hour.isClosed ? 'Closed' : `${hour.openTime} - ${hour.closeTime}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Featured Service Providers Section */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Featured Service Providers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'sim1',
                name: 'Premium Cleaning Services',
                category: listing.category,
                location: 'Nairobi, Kenya',
                image: 'https://source.unsplash.com/random/300x200?cleaning,1'
              },
              {
                id: 'sim2',
                name: 'Expert Home Repairs',
                category: listing.category,
                location: 'Mombasa, Kenya',
                image: 'https://source.unsplash.com/random/300x200?repair,2'
              },
              {
                id: 'sim3',
                name: 'Luxury Interior Design',
                category: listing.category,
                location: 'Kisumu, Kenya',
                image: 'https://source.unsplash.com/random/300x200?interior,3'
              },
              {
                id: 'sim4',
                name: 'Professional Landscaping',
                category: listing.category,
                location: 'Nakuru, Kenya',
                image: 'https://source.unsplash.com/random/300x200?landscape,4'
              }
            ].map((item) => (
              <Link 
                key={item.id} 
                to={`/listings/${item.id}`}
                className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-neutral-200 relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <p className="text-sm text-neutral-500 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {item.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingDetailPage;
