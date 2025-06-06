import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Heart, Calendar, Phone, Mail } from 'lucide-react';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import { getListingById } from '../features/listings/services/listingService';
import { useAuth } from '../contexts/AuthContext';
import type { PropertyListing } from '../types/listings';

// Import new property-specific components
import PropertyHero from '../components/property/PropertyHero';
import PropertyDetails from '../components/property/PropertyDetails';
import MortgageCalculator from '../components/property/MortgageCalculator';
import PropertyMap from '../components/property/PropertyMap';
import SimilarProperties from '../components/property/SimilarProperties';
import ContactAgent from '../components/property/ContactAgent';

const PropertyDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Process images for the property
  const processedImages = useMemo(() => {
    if (!listing?.images) return [];
    
    return (listing.images || []).map((image: any) => {
      if (typeof image === 'string') {
        return { 
          url: getImageUrl(image), 
          id: String(Math.random()) 
        };
      }
      
      try {
        if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
          return {
            url: image.url,
            id: image.id || String(Math.random())
          };
        }
        
        const storagePath = image.storagePath || image.path;
        if (storagePath) {
          return {
            url: getImageUrl(storagePath, 'listing_images'),
            id: image.id || String(Math.random())
          };
        }
        
        return {
          url: getPlaceholderImage(),
          id: image.id || String(Math.random())
        };
      } catch (error) {
        return {
          url: getPlaceholderImage(),
          id: image.id || String(Math.random())
        };
      }
    });
  }, [listing?.images]);

  useEffect(() => {
    if (!listingId) {
      setError('Property ID is missing.');
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const fetchedListing = await getListingById(listingId);
        
        if (!fetchedListing) {
          setError('Property not found.');
          setLoading(false);
          return;
        }

        // Check if this is a property listing
        if (fetchedListing.category !== 'PROPERTY') {
          setError('This is not a property listing.');
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

        setListing(fetchedListing as PropertyListing);
        setError(null);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [listingId, user?.id]);

  const handleScheduleViewing = () => {
    // Implement scheduling logic
    console.log('Schedule viewing clicked');
    alert('Scheduling feature to be implemented!');
  };

  const handleContactAgent = () => {
    // Implement contact logic
    console.log('Contact agent clicked');
    if (listing?.phone) {
      window.location.href = `tel:${listing.phone}`;
    } else if (listing?.email) {
      window.location.href = `mailto:${listing.email}`;
    }
  };

  // Mock data for demonstration
  const mockAgent = {
    id: 'agent-1',
    name: 'Sarah Johnson',
    title: 'Senior Real Estate Agent',
    phone: listing?.phone || '+1 (555) 123-4567',
    email: listing?.email || 'sarah.johnson@realty.com',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 8,
    propertiesSold: 156,
    specialties: ['Luxury Homes', 'First-time Buyers', 'Investment Properties']
  };

  const mockSimilarProperties = [
    {
      id: 'prop-1',
      name: 'Modern Downtown Condo',
      price: 450000,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      location: 'Downtown District',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      isNew: true
    },
    {
      id: 'prop-2',
      name: 'Suburban Family Home',
      price: 380000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      location: 'Maple Heights',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'
    },
    {
      id: 'prop-3',
      name: 'Luxury Townhouse',
      price: 620000,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2400,
      location: 'Heritage Hills',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'
    }
  ];

  const mockNearbyAmenities = [
    { name: 'Starbucks Coffee', type: 'restaurant' as const, distance: '0.2 miles', rating: 4.5 },
    { name: 'Whole Foods Market', type: 'shopping' as const, distance: '0.5 miles', rating: 4.3 },
    { name: 'Lincoln Elementary', type: 'school' as const, distance: '0.8 miles', rating: 4.7 },
    { name: 'City General Hospital', type: 'hospital' as const, distance: '1.2 miles', rating: 4.1 },
    { name: 'Metro Station', type: 'transport' as const, distance: '0.3 miles' },
    { name: 'Central Park', type: 'other' as const, distance: '0.6 miles', rating: 4.8 }
  ];

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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ArrowLeft className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h1>
        <p className="text-lg text-neutral-700 mb-8">You do not have permission to view this property as it is currently a draft.</p>
        <Link to="/listings" className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
          Back to Listings
        </Link>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-100 p-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ArrowLeft className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-red-700 mb-4">Error</h1>
        <p className="text-lg text-neutral-700 mb-8">{error || 'Property not found.'}</p>
        <Link to="/listings" className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
          Back to Listings
        </Link>
      </div>
    );
  }

  // Calculate estimated price for mortgage calculator
  const estimatedPrice = 500000; // You could derive this from listing data

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-neutral-50 min-h-screen"
    >
      {/* Property Hero Section */}
      <PropertyHero
        propertyName={listing.businessName}
        price={estimatedPrice}
        bedrooms={listing.propertyDetails?.bedrooms}
        bathrooms={listing.propertyDetails?.bathrooms}
        squareFootage={listing.propertyDetails?.size}
        location={listing.location}
        images={processedImages}
        hasVirtualTour={true}
        onScheduleViewing={handleScheduleViewing}
        onContactAgent={handleContactAgent}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <PropertyDetails
              description={listing.description}
              features={listing.propertyDetails?.amenities || []}
              propertyHistory={[
                { date: 'June 2024', event: 'Listed for Sale', price: estimatedPrice },
                { date: 'March 2023', event: 'Price Reduced', price: estimatedPrice + 50000 },
                { date: 'January 2023', event: 'Listed for Sale', price: estimatedPrice + 75000 }
              ]}
              yearBuilt={2018}
              propertyType={listing.propertyDetails?.propertyType || 'Single Family Home'}
              lotSize={8500}
              hoaFees={150}
              taxInfo={{
                annualTax: 8500,
                taxYear: 2024
              }}
            />

            {/* Mortgage Calculator */}
            <MortgageCalculator propertyPrice={estimatedPrice} />

            {/* Property Map */}
            <PropertyMap
              address={listing.location}
              nearbyAmenities={mockNearbyAmenities}
            />

            {/* Similar Properties */}
            <SimilarProperties
              properties={mockSimilarProperties}
              currentPropertyId={listing.id || ''}
            />
          </div>

          {/* Right Column - Contact Agent */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactAgent
                agent={mockAgent}
                propertyName={listing.businessName}
                onScheduleViewing={handleScheduleViewing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Sharing Buttons - Fixed Position */}
      <div className="fixed bottom-6 left-6 z-30 flex flex-col gap-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: listing.businessName,
                text: `Check out this property: ${listing.businessName}`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
          title="Share Property"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
          title="Save to Favorites"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default PropertyDetailPage;