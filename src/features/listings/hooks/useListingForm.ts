import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ListingFormState, BusinessHours } from '../../../types/listings';
import { ListingCategory } from '../../../types/listings';
import { createListing, updateListing, getListingById } from '../services/listingService';
import { useAuth } from '../../../contexts/AuthContext';

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: 'Monday', openTime: '09:00', closeTime: '17:00', isClosed: false },
  { day: 'Tuesday', openTime: '09:00', closeTime: '17:00', isClosed: false },
  { day: 'Wednesday', openTime: '09:00', closeTime: '17:00', isClosed: false },
  { day: 'Thursday', openTime: '09:00', closeTime: '17:00', isClosed: false },
  { day: 'Friday', openTime: '09:00', closeTime: '17:00', isClosed: false },
  { day: 'Saturday', openTime: '10:00', closeTime: '15:00', isClosed: false },
  { day: 'Sunday', openTime: null, closeTime: null, isClosed: true },
];

const initialFormState: ListingFormState = {
  category: '',
  subcategory: '',
  businessName: '',
  description: '',
  location: '',
  phone: '',
  email: '',
  website: '',
  businessHours: DEFAULT_BUSINESS_HOURS,
  services: [],
  propertyDetails: null,
  autoDealershipDetails: null,
  images: [],
  isPublished: false,
  status: 'pending',
  currentStep: 0
};

interface UseListingFormProps {
  existingListingId?: string;
}

export const useListingForm = ({ existingListingId }: UseListingFormProps = {}) => {
  const [formState, setFormState] = useState<ListingFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load existing listing if editing
  useEffect(() => {
    const loadExistingListing = async () => {
      if (existingListingId && user) {
        setIsLoading(true);
        setError(null);
        
        try {
          const listing = await getListingById(existingListingId);
          
          if (!listing) {
            setError('Listing not found');
            return;
          }
          
          if (listing.userId !== user.id) {
            setError('You do not have permission to edit this listing');
            return;
          }
          
          // Transform the listing data to match our form state
          const updatedFormState: ListingFormState = {
            category: listing.category,
            subcategory: listing.subcategory,
            businessName: listing.businessName,
            description: listing.description,
            location: listing.location,
            phone: listing.phone || '',
            email: listing.email || '',
            website: listing.website || '',
            businessHours: listing.businessHours || DEFAULT_BUSINESS_HOURS,
            services: listing.services || [],
            propertyDetails: listing.category === ListingCategory.PROPERTY 
              ? (listing as any).propertyDetails 
              : null,
            autoDealershipDetails: listing.category === ListingCategory.AUTO_DEALERSHIP 
              ? (listing as any).autoDealershipDetails 
              : null,
            images: listing.images || [],
            isPublished: listing.isPublished,
            status: listing.status || 'pending',
            rejectionReason: listing.rejectionReason,
            currentStep: 0
          };
          
          setFormState(updatedFormState);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load listing';
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadExistingListing();
  }, [existingListingId, user]);

  // Update a form field
  const updateFormField = useCallback(<K extends keyof ListingFormState>(
    field: K, 
    value: ListingFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // Special handling for category changes
    if (field === 'category') {
      const category = value as ListingCategory | '';
      
      // Reset category-specific fields when changing categories
      if (category === ListingCategory.PROPERTY) {
        setFormState(prev => ({
          ...prev,
          [field]: value,
          propertyDetails: {
            propertyType: '',
            size: undefined,
            bedrooms: undefined,
            bathrooms: undefined,
            amenities: []
          },
          autoDealershipDetails: null
        }));
      } else if (category === ListingCategory.AUTO_DEALERSHIP) {
        setFormState(prev => ({
          ...prev,
          [field]: value,
          autoDealershipDetails: {
            vehicleTypes: [],
            brands: [],
            services: [],
            yearEstablished: undefined,
            specialties: [],
            financingAvailable: false
          },
          propertyDetails: null
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          [field]: value,
          propertyDetails: null,
          autoDealershipDetails: null
        }));
      }
    }
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (isStepComplete(formState.currentStep)) {
      setFormState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1
      }));
    }
  }, [formState]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  }, []);

  // Go to a specific step
  const goToStep = useCallback((step: number) => {
    // Only allow going to a step if all previous steps are complete
    for (let i = 0; i < step; i++) {
      if (!isStepComplete(i)) {
        return;
      }
    }
    
    setFormState(prev => ({
      ...prev,
      currentStep: step
    }));
  }, []);

  // Check if a step is complete
  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Category Selection
        return !!formState.category && !!formState.subcategory;
        
      case 1: // Basic Info
        return !!formState.businessName && formState.businessName.length >= 3 && 
               !!formState.description && formState.description.length >= 10;
        
      case 2: // Contact Info
        return !!formState.location;
        
      case 3: // Business Hours (if applicable)
        // Skip for property listings
        if (formState.category === ListingCategory.PROPERTY) {
          return true;
        }
        return formState.businessHours.length > 0;
        
      case 4: // Services (if applicable)
        // Skip for property and auto dealership listings
        if (formState.category === ListingCategory.PROPERTY || 
            formState.category === ListingCategory.AUTO_DEALERSHIP) {
          return true;
        }
        // Services are optional for other categories
        return true;
        
      case 5: // Property Details (if applicable)
        if (formState.category !== ListingCategory.PROPERTY) {
          return true;
        }
        return !!formState.propertyDetails && !!formState.propertyDetails.propertyType;
        
      case 6: // Auto Dealership Details (if applicable)
        if (formState.category !== ListingCategory.AUTO_DEALERSHIP) {
          return true;
        }
        return !!formState.autoDealershipDetails && formState.autoDealershipDetails.brands.length > 0;
        
      case 7: // Images
        // At least one image is required
        return formState.images.length > 0;
        
      default:
        return false;
    }
  }, [formState]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setError(null);
  }, []);

  // Save the listing
  const saveListing = useCallback(async (publish: boolean = false): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to create a listing');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare the listing data
      const listingData = {
        userId: user.id,
        category: formState.category as ListingCategory,
        subcategory: formState.subcategory,
        businessName: formState.businessName,
        description: formState.description,
        location: formState.location,
        phone: formState.phone || undefined,
        email: formState.email || undefined,
        website: formState.website || undefined,
        businessHours: formState.businessHours,
        services: formState.services,
        isPublished: false, // Always save as not published initially
        status: 'pending', // Always set status to pending for new or updated listings
        images: formState.images
      };
      
      // Add category-specific details
      if (formState.category === ListingCategory.PROPERTY && formState.propertyDetails) {
        (listingData as any).propertyDetails = formState.propertyDetails;
      } else if (formState.category === ListingCategory.AUTO_DEALERSHIP && formState.autoDealershipDetails) {
        (listingData as any).autoDealershipDetails = formState.autoDealershipDetails;
      }
      
      let listingId: string | null;
      
      if (existingListingId) {
        // If this is a rejected listing being resubmitted, update the status
        if (formState.status === 'rejected') {
          listingData.status = 'pending';
        }
        
        // Update existing listing
        const success = await updateListing(existingListingId, listingData);
        listingId = success ? existingListingId : null;
      } else {
        // Create new listing
        listingId = await createListing(listingData);
      }
      
      if (listingId) {
        // Navigate to the listing page or dashboard
        navigate(`/listings/${listingId}`);
        return listingId;
      }
      
      setError('Failed to save listing');
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error saving listing';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [formState, user, existingListingId, navigate]);

  return {
    formState,
    updateFormField,
    nextStep,
    prevStep,
    goToStep,
    isStepComplete,
    resetForm,
    saveListing,
    isLoading,
    error
  };
};