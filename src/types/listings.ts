// Using const object instead of enum to work with erasableSyntaxOnly config
export const ListingCategory = {
  SERVICES: 'SERVICES',
  PROPERTY: 'PROPERTY',
  STORE: 'STORE',
  AUTO_DEALERSHIP: 'AUTO_DEALERSHIP'
} as const;

// Type for the ListingCategory values
export type ListingCategory = typeof ListingCategory[keyof typeof ListingCategory];

// Subcategories for each main category
export const SubcategoryMap = {
  [ListingCategory.SERVICES]: [
    'Home Services',
    'Professional Services',
    'Health & Wellness',
    'Education & Training',
    'Tech Services',
    'Events & Entertainment',
    'Other Services'
  ],
  [ListingCategory.PROPERTY]: [
    'Residential',
    'Commercial',
    'Land',
    'Industrial',
    'Mixed Use'
  ],
  [ListingCategory.STORE]: [
    'Retail',
    'Grocery',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Food & Beverage',
    'Other Retail'
  ],
  [ListingCategory.AUTO_DEALERSHIP]: [
    'New Cars',
    'Used Cars',
    'Luxury Vehicles',
    'Commercial Vehicles',
    'Motorcycles',
    'Parts & Accessories'
  ]
} as const;

export interface BusinessHours {
  day: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface Service {
  id?: string;
  name: string;
  description?: string;
  price?: number;
}

export interface AutoDealershipDetails {
  id?: string;
  listingId?: string;
  vehicleTypes: string[];
  brands: string[];
  services: string[];
  yearEstablished?: number;
  specialties: string[];
  financingAvailable: boolean;
}

export interface PropertyDetails {
  propertyType: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

export interface ListingImage {
  id?: string;
  listingId?: string;
  storagePath: string;
  path: string;
  isPrimary: boolean;
  url?: string;
}

export interface BaseListing {
  id?: string;
  userId: string;
  category: ListingCategory;
  subcategory: string;
  businessName: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isPublished: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  businessHours?: BusinessHours[];
  services?: Service[];
  images?: ListingImage[];
}

export interface ServiceListing extends BaseListing {
  category: 'SERVICES';
  services: Service[];
}

export interface PropertyListing extends BaseListing {
  category: 'PROPERTY';
  propertyDetails: PropertyDetails;
}

export interface StoreListing extends BaseListing {
  category: 'STORE';
  businessHours: BusinessHours[];
}

export interface AutoDealershipListing extends BaseListing {
  category: 'AUTO_DEALERSHIP';
  autoDealershipDetails: AutoDealershipDetails;
  businessHours: BusinessHours[];
}

export type Listing = 
  | ServiceListing 
  | PropertyListing 
  | StoreListing 
  | AutoDealershipListing;

// Wizard form state interface
export interface ListingFormState {
  // Step 1: Category Selection
  category: ListingCategory | '';
  subcategory: string;
  
  // Step 2: Basic Info
  businessName: string;
  description: string;
  
  // Step 3: Contact Info
  location: string;
  phone: string;
  email: string;
  website: string;
  
  // Step 4: Business Hours (if applicable)
  businessHours: BusinessHours[];
  
  // Step 5: Services (if applicable)
  services: Service[];
  
  // Step 6: Property Details (if applicable)
  propertyDetails: PropertyDetails | null;
  
  // Step 7: Auto Dealership Details (if applicable)
  autoDealershipDetails: AutoDealershipDetails | null;
  
  // Step 8: Images
  images: ListingImage[];
  
  // Metadata
  isPublished: boolean;
  currentStep: number;
}

export interface WizardContextType {
  formState: ListingFormState;
  updateFormField: <K extends keyof ListingFormState>(
    field: K, 
    value: ListingFormState[K]
  ) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  resetForm: () => void;
  saveListing: (publish?: boolean) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}