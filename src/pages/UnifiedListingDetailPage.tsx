import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getListingById } from '../features/listings/services/listingService';
import { useAuth } from '../contexts/AuthContext';
import type { Listing, PropertyListing, ServiceListing, StoreListing, AutoDealershipListing } from '../types/listings';
import { ListingCategory } from '../types/listings';
import { Info, Image, MessageSquare, Package } from 'lucide-react';

// Shared components
import { useImageProcessor } from '../components/shared/ImageProcessor';
import ListingStateHandler from '../components/shared/ListingStateHandler';
import HeroSection from '../components/shared/HeroSection';
import Tabs from '../components/ui/Tabs';

// Property-specific components
import PropertyDetails from '../components/property/PropertyDetails';
import PropertyMap from '../components/property/PropertyMap';
import SimilarProperties from '../components/property/SimilarProperties';
import ContactAgent from '../components/property/ContactAgent';
import MortgageCalculator from '../components/property/MortgageCalculator';

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
  ListingOwnerControls,
  ListingActionButtons
} from '../components/listing-detail';

import { formatPrice } from '../utils/formatters';

const UnifiedListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

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

  const handleContactClick = () => {
    // Scroll to contact form
    const contactElement = document.getElementById('contact-section');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveClick = () => {
    // Implement save functionality
    alert('Listing saved to your favorites!');
  };

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

  const renderPropertyDetailPage = (propertyListing: PropertyListing) => {
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
      },
      {
        id: 'prop-2',
        name: 'Suburban Family Home',
        price: 520000,
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 2400,
        location: 'Pleasant Valley',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
        isNew: false
      },
      {
        id: 'prop-3',
        name: 'Luxury Waterfront Villa',
        price: 1250000,
        bedrooms: 5,
        bathrooms: 4.5,
        squareFootage: 3800,
        location: 'Harbor View',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
        isNew: false
      }
    ];

    const mockNearbyAmenities = [
      { name: 'Starbucks Coffee', type: 'restaurant' as const, distance: '0.2 miles', rating: 4.5 },
      { name: 'Whole Foods Market', type: 'shopping' as const, distance: '0.5 miles', rating: 4.3 },
      { name: 'Central Park', type: 'other' as const, distance: '0.7 miles', rating: 4.8 },
      { name: 'Downtown Elementary', type: 'school' as const, distance: '0.9 miles', rating: 4.2 },
      { name: 'City Hospital', type: 'hospital' as const, distance: '1.2 miles', rating: 4.0 },
      { name: 'Metro Station', type: 'transport' as const, distance: '0.3 miles', rating: 4.1 }
    ];

    const propertyFeatures = propertyListing.propertyDetails?.amenities || [
      'Central Air Conditioning',
      'Hardwood Floors',
      'Stainless Steel Appliances',
      'Walk-in Closets',
      'Granite Countertops',
      'In-unit Laundry',
      'Private Balcony',
      'High Ceilings',
      'Fireplace',
      'Smart Home Features'
    ];

    const propertyHistory = [
      { date: 'June 2024', event: 'Listed for Sale', price: estimatedPrice },
      { date: 'January 2022', event: 'Last Sold', price: estimatedPrice - 75000 },
      { date: 'March 2018', event: 'Listed for Sale', price: estimatedPrice - 100000 },
      { date: 'April 2018', event: 'Sold', price: estimatedPrice - 90000 }
    ];

    const tabs = [
      {
        id: 'details',
        label: 'Property Details',
        icon: Info,
        children: (
          <PropertyDetails
            description={propertyListing.description}
            features={propertyFeatures}
            propertyHistory={propertyHistory}
            yearBuilt={2018}
            propertyType={propertyListing.propertyDetails?.propertyType || 'Single Family Home'}
            lotSize={8500}
            hoaFees={150}
            taxInfo={{ annualTax: 8500, taxYear: 2024 }}
          />
        )
      },
      {
        id: 'location',
        label: 'Location',
        icon: MapPin,
        children: (
          <PropertyMap 
            address={propertyListing.location} 
            nearbyAmenities={mockNearbyAmenities} 
          />
        )
      },
      {
        id: 'gallery',
        label: 'Photos',
        icon: Image,
        children: (
          <GalleryTabContent images={processedImages} />
        )
      },
      {
        id: 'reviews',
        label: 'Reviews',
        icon: MessageSquare,
        children: (
          <ReviewsTabContent listing={propertyListing} />
        )
      }
    ];

    return (
      <div className="bg-neutral-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListingOwnerControls listing={propertyListing} userId={user?.id} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <Tabs tabs={tabs} defaultTabId="details" />
              
              <div className="mt-8">
                <SimilarProperties 
                  properties={mockSimilarProperties} 
                  currentPropertyId={propertyListing.id || ''} 
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-8">
                <div id="contact-section">
                  <ContactAgent
                    agent={mockAgent}
                    propertyName={propertyListing.businessName}
                    onScheduleViewing={handleScheduleViewing}
                  />
                </div>
                
                <MortgageCalculator propertyPrice={estimatedPrice} />
              </div>
            </div>
          </div>
        </div>
        
        <ListingActionButtons 
          onContactClick={handleContactClick}
          onSaveClick={handleSaveClick}
        />
      </div>
    );
  };

  const renderServiceDetailPage = (serviceListing: ServiceListing) => {
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

    const tabs = [
      {
        id: 'about',
        label: 'About',
        icon: Info,
        children: (
          <ServiceDetails
            description={serviceListing.description}
            services={serviceListing.services || []}
            credentials={['Licensed Professional', 'Insured & Bonded', '5-Star Rated']}
            serviceArea={mockProvider.serviceArea}
            experience={mockProvider.yearsExperience}
            specialties={['Emergency Services', 'Same-Day Service', 'Free Estimates']}
          />
        )
      },
      {
        id: 'services',
        label: 'Services',
        icon: Package,
        children: (
          <OfferingsTabContent listing={serviceListing} />
        )
      },
      {
        id: 'gallery',
        label: 'Photos',
        icon: Image,
        children: (
          <GalleryTabContent images={processedImages} />
        )
      },
      {
        id: 'reviews',
        label: 'Reviews',
        icon: MessageSquare,
        children: (
          <ReviewsTabContent listing={serviceListing} />
        )
      }
    ];

    return (
      <div className="bg-neutral-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListingOwnerControls listing={serviceListing} userId={user?.id} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <Tabs tabs={tabs} defaultTabId="about" />
            </div>
            
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-8" id="contact-section">
                <ContactProvider
                  provider={mockProvider}
                  serviceName={serviceListing.businessName}
                  onScheduleConsultation={handleScheduleConsultation}
                />
              </div>
            </div>
          </div>
        </div>
        
        <ListingActionButtons 
          onContactClick={handleContactClick}
          onSaveClick={handleSaveClick}
        />
      </div>
    );
  };

  const renderStoreDetailPage = (storeListing: StoreListing) => {
    const tabs = [
      {
        id: 'about',
        label: 'About',
        icon: Info,
        children: (
          <StoreDetails
            description={storeListing.description}
            storeType={storeListing.subcategory || 'Retail Store'}
            businessHours={storeListing.businessHours || []}
            socialMedia={{
              facebook: 'https://facebook.com/store',
              instagram: 'https://instagram.com/store',
              website: storeListing.website
            }}
            specialOffers={['10% off first purchase', 'Free shipping on orders over $50']}
            paymentMethods={['Cash', 'Credit Cards', 'Digital Payments', 'Gift Cards']}
          />
        )
      },
      {
        id: 'products',
        label: 'Products',
        icon: Package,
        children: (
          <OfferingsTabContent listing={storeListing} />
        )
      },
      {
        id: 'gallery',
        label: 'Photos',
        icon: Image,
        children: (
          <GalleryTabContent images={processedImages} />
        )
      },
      {
        id: 'reviews',
        label: 'Reviews',
        icon: MessageSquare,
        children: (
          <ReviewsTabContent listing={storeListing} />
        )
      }
    ];

    return (
      <div className="bg-neutral-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListingOwnerControls listing={storeListing} userId={user?.id} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <Tabs tabs={tabs} defaultTabId="about" />
            </div>
            
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-8" id="contact-section">
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
        
        <ListingActionButtons 
          onContactClick={handleContactClick}
          onSaveClick={handleSaveClick}
        />
      </div>
    );
  };

  const renderDealershipDetailPage = (dealershipListing: AutoDealershipListing) => {
    const tabs = [
      {
        id: 'about',
        label: 'About',
        icon: Info,
        children: (
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
        )
      },
      {
        id: 'vehicles',
        label: 'Vehicles',
        icon: Package,
        children: (
          <OfferingsTabContent listing={dealershipListing} />
        )
      },
      {
        id: 'gallery',
        label: 'Photos',
        icon: Image,
        children: (
          <GalleryTabContent images={processedImages} />
        )
      },
      {
        id: 'reviews',
        label: 'Reviews',
        icon: MessageSquare,
        children: (
          <ReviewsTabContent listing={dealershipListing} />
        )
      }
    ];

    return (
      <div className="bg-neutral-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListingOwnerControls listing={dealershipListing} userId={user?.id} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <Tabs tabs={tabs} defaultTabId="about" />
            </div>
            
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-8" id="contact-section">
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
        
        <ListingActionButtons 
          onContactClick={handleContactClick}
          onSaveClick={handleSaveClick}
        />
      </div>
    );
  };

  const renderCategorySpecificPage = (listing: Listing) => {
    switch (listing.category) {
      case ListingCategory.PROPERTY:
        return renderPropertyDetailPage(listing as PropertyListing);
      case ListingCategory.SERVICES:
        return renderServiceDetailPage(listing as ServiceListing);
      case ListingCategory.STORE:
        return renderStoreDetailPage(listing as StoreListing);
      case ListingCategory.AUTO_DEALERSHIP:
        return renderDealershipDetailPage(listing as AutoDealershipListing);
      default:
        return null;
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
            {renderCategorySpecificPage(listing)}
          </>
        )}
      </motion.div>
    </ListingStateHandler>
  );
};

export default UnifiedListingDetailPage;