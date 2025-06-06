import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getListingById } from '../features/listings/services/listingService';
import { useAuth } from '../contexts/AuthContext';
import type { Listing, PropertyListing, ServiceListing, StoreListing, AutoDealershipListing } from '../types/listings';
import { ListingCategory } from '../types/listings';

// Shared components
import { useImageProcessor } from '../components/shared/ImageProcessor';
import ListingStateHandler from '../components/shared/ListingStateHandler';
import HeroSection from '../components/shared/HeroSection';

// Property-specific components
import PropertyDetails from '../components/property/PropertyDetails';
import PropertyMap from '../components/property/PropertyMap';
import SimilarProperties from '../components/property/SimilarProperties';
import ContactAgent from '../components/property/ContactAgent';

// Service-specific components
import ServiceDetails from '../components/services/ServiceDetails';
import ContactProvider from '../components/services/ContactProvider';

// Store-specific components
import StoreDetails from '../components/stores/StoreDetails';
import ContactStore from '../components/stores/ContactStore';

// Dealership-specific components
import DealershipDetails from '../components/dealerships/DealershipDetails';
import ContactDealership from '../components/dealerships/ContactDealership';

// General listing components
import { 
  AboutTabContent,
  OfferingsTabContent,
  ReviewsTabContent,
  GalleryTabContent,
  ListingSidebar,
  ListingOwnerControls
} from '../components/listing-detail';

import { formatPrice } from '../utils/formatters';

const UnifiedListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const processedImages = useImageProcessor(listing?.images);

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

  const handleScheduleViewing = () => {
    console.log('Schedule viewing clicked');
    alert('Scheduling feature to be implemented!');
  };

  const handleScheduleConsultation = () => {
    console.log('Schedule consultation clicked');
    alert('Consultation scheduling feature to be implemented!');
  };

  const handleScheduleTestDrive = () => {
    console.log('Schedule test drive clicked');
    alert('Test drive scheduling feature to be implemented!');
  };

  const renderPropertySpecificContent = (propertyListing: PropertyListing) => {
    const estimatedPrice = 500000; // You could derive this from listing data
    
    const mockAgent = {
      id: 'agent-1',
      name: 'Sarah Johnson',
      title: 'Senior Real Estate Agent',
      phone: propertyListing.phone || '+1 (555) 123-4567',
      email: propertyListing.email || 'sarah.johnson@realty.com',
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
      }
    ];

    const mockNearbyAmenities = [
      { name: 'Starbucks Coffee', type: 'restaurant' as const, distance: '0.2 miles', rating: 4.5 },
      { name: 'Whole Foods Market', type: 'shopping' as const, distance: '0.5 miles', rating: 4.3 }
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyDetails
              description={propertyListing.description}
              features={propertyListing.propertyDetails?.amenities || []}
              propertyHistory={[
                { date: 'June 2024', event: 'Listed for Sale', price: estimatedPrice }
              ]}
              yearBuilt={2018}
              propertyType={propertyListing.propertyDetails?.propertyType || 'Single Family Home'}
              lotSize={8500}
              hoaFees={150}
              taxInfo={{ annualTax: 8500, taxYear: 2024 }}
            />
            <PropertyMap address={propertyListing.location} nearbyAmenities={mockNearbyAmenities} />
            <SimilarProperties properties={mockSimilarProperties} currentPropertyId={propertyListing.id || ''} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactAgent
                agent={mockAgent}
                propertyName={propertyListing.businessName}
                onScheduleViewing={handleScheduleViewing}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderServiceSpecificContent = (serviceListing: ServiceListing) => {
    const mockProvider = {
      id: 'provider-1',
      name: 'John Smith',
      title: 'Professional Service Provider',
      phone: serviceListing.phone || '+1 (555) 123-4567',
      email: serviceListing.email || 'john.smith@services.com',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 89,
      yearsExperience: 12,
      completedJobs: 245,
      responseTime: '< 2 hours',
      serviceArea: ['Downtown', 'Midtown', 'Suburbs', 'North District']
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ServiceDetails
              description={serviceListing.description}
              services={serviceListing.services || []}
              credentials={['Licensed Professional', 'Insured & Bonded', '5-Star Rated']}
              serviceArea={mockProvider.serviceArea}
              experience={mockProvider.yearsExperience}
              specialties={['Emergency Services', 'Same-Day Service', 'Free Estimates']}
            />
            <ReviewsTabContent listing={serviceListing} />
            <GalleryTabContent images={processedImages} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactProvider
                provider={mockProvider}
                serviceName={serviceListing.businessName}
                onScheduleConsultation={handleScheduleConsultation}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStoreSpecificContent = (storeListing: StoreListing) => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StoreDetails
              description={storeListing.description}
              storeType="Retail Store"
              businessHours={storeListing.businessHours || []}
              socialMedia={{
                facebook: 'https://facebook.com/store',
                instagram: 'https://instagram.com/store',
                website: storeListing.website
              }}
              specialOffers={['10% off first purchase', 'Free shipping on orders over $50']}
              paymentMethods={['Cash', 'Credit Cards', 'Digital Payments', 'Gift Cards']}
            />
            <ReviewsTabContent listing={storeListing} />
            <GalleryTabContent images={processedImages} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactStore
                storeName={storeListing.businessName}
                phone={storeListing.phone}
                email={storeListing.email}
                address={storeListing.location}
                businessHours={storeListing.businessHours || []}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDealershipSpecificContent = (dealershipListing: AutoDealershipListing) => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DealershipDetails
              description={dealershipListing.description}
              brands={dealershipListing.autoDealershipDetails?.brands || []}
              vehicleTypes={dealershipListing.autoDealershipDetails?.vehicleTypes || []}
              services={dealershipListing.autoDealershipDetails?.services || []}
              specialties={dealershipListing.autoDealershipDetails?.specialties || []}
              yearEstablished={dealershipListing.autoDealershipDetails?.yearEstablished}
              financingAvailable={dealershipListing.autoDealershipDetails?.financingAvailable || false}
              certifications={['Authorized Dealer', 'ASE Certified', 'Better Business Bureau A+']}
              warranties={['Manufacturer Warranty', 'Extended Warranty Available', 'Service Guarantee']}
            />
            <ReviewsTabContent listing={dealershipListing} />
            <GalleryTabContent images={processedImages} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactDealership
                dealershipName={dealershipListing.businessName}
                phone={dealershipListing.phone}
                email={dealershipListing.email}
                address={dealershipListing.location}
                businessHours={dealershipListing.businessHours || []}
                onScheduleTestDrive={handleScheduleTestDrive}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralListingContent = (generalListing: Listing) => {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-[90%] max-w-7xl">
        <ListingOwnerControls listing={generalListing} userId={user?.id} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <AboutTabContent listing={generalListing} />
            <OfferingsTabContent listing={generalListing} />
            <ReviewsTabContent listing={generalListing} />
            <GalleryTabContent images={processedImages} />
          </div>
          <div className="lg:col-span-1">
            <ListingSidebar listing={generalListing} />
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySpecificContent = (listing: Listing) => {
    switch (listing.category) {
      case ListingCategory.PROPERTY:
        return renderPropertySpecificContent(listing as PropertyListing);
      case ListingCategory.SERVICES:
        return renderServiceSpecificContent(listing as ServiceListing);
      case ListingCategory.STORE:
        return renderStoreSpecificContent(listing as StoreListing);
      case ListingCategory.AUTO_DEALERSHIP:
        return renderDealershipSpecificContent(listing as AutoDealershipListing);
      default:
        return renderGeneralListingContent(listing);
    }
  };

  return (
    <ListingStateHandler
      loading={loading}
      error={error}
      accessDenied={accessDenied}
      listing={listing}
    >
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-neutral-50 min-h-screen"
      >
        {listing && (
          <>
            <HeroSection
              title={listing.businessName}
              subtitle={listing.category === ListingCategory.PROPERTY ? formatPrice(500000) : undefined}
              location={listing.location}
              images={processedImages}
              hasVirtualTour={listing.category === ListingCategory.PROPERTY}
            >
              {/* Category-specific hero content */}
              {listing.category === ListingCategory.PROPERTY && (
                <div className="flex gap-6 text-white/90">
                  {(listing as PropertyListing).propertyDetails?.bedrooms && (
                    <div className="flex items-center gap-2">
                      <span>{(listing as PropertyListing).propertyDetails?.bedrooms} bed{(listing as PropertyListing).propertyDetails?.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {(listing as PropertyListing).propertyDetails?.bathrooms && (
                    <div className="flex items-center gap-2">
                      <span>{(listing as PropertyListing).propertyDetails?.bathrooms} bath{(listing as PropertyListing).propertyDetails?.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {(listing as PropertyListing).propertyDetails?.size && (
                    <div className="flex items-center gap-2">
                      <span>{(listing as PropertyListing).propertyDetails?.size.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>
              )}
            </HeroSection>

            {/* Render category-specific content */}
            {renderCategorySpecificContent(listing)}
          </>
        )}
      </motion.div>
    </ListingStateHandler>
  );
};

export default UnifiedListingDetailPage;