import { supabase } from '../../../lib/supabaseClient';
import { ListingCategory } from '../../../types/listings';
import type { 
  Listing,
  BaseListing, 
  ServiceListing, 
  PropertyListing, 
  StoreListing, 
  AutoDealershipListing,
  BusinessHours,
  Service,
  PropertyDetails,
  AutoDealershipDetails,
  ListingImage
} from '../../../types/listings';

// Create a new listing
export const createListing = async (listing: Omit<BaseListing, 'id' | 'createdAt' | 'updatedAt'> & {
  images?: ListingImage[];
  businessHours?: BusinessHours[];
  services?: Service[];
  propertyDetails?: PropertyDetails;
  autoDealershipDetails?: AutoDealershipDetails;
  storeDetails?: any; // Add store details type later
}): Promise<string | null> => {
  try {
    console.log('Creating listing with category:', listing.category);
    
    // Insert into main listings table
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: listing.userId,
        category: listing.category,
        subcategory: listing.subcategory,
        business_name: listing.businessName,
        description: listing.description,
        location: listing.location,
        phone: listing.phone || null,
        email: listing.email || null,
        website: listing.website || null,
        is_published: listing.isPublished
      })
      .select('id')
      .single();

    if (listingError) {
      console.error('Error creating main listing:', listingError);
      throw listingError;
    }
    if (!listingData) throw new Error('Failed to create listing');

    const listingId = listingData.id;
    console.log('Created listing with ID:', listingId);

    // Handle business hours if provided
    if (listing.businessHours && listing.businessHours.length > 0) {
      console.log('Adding business hours');
      const businessHoursData = listing.businessHours.map(hour => ({
        listing_id: listingId,
        day: hour.day,
        open_time: hour.openTime,
        close_time: hour.closeTime,
        is_closed: hour.isClosed
      }));

      const { error: hoursError } = await supabase
        .from('business_hours')
        .insert(businessHoursData);

      if (hoursError) {
        console.error('Error adding business hours:', hoursError);
        throw hoursError;
      }
    }

    // Handle services if provided
    if (listing.services && listing.services.length > 0) {
      console.log('Adding services');
      const servicesData = listing.services.map(service => ({
        listing_id: listingId,
        name: service.name,
        description: service.description || null,
        price: service.price || null
        // duration is not in the Service type yet, we'll add it later
      }));

      const { error: servicesError } = await supabase
        .from('services')
        .insert(servicesData);

      if (servicesError) {
        console.error('Error adding services:', servicesError);
        throw servicesError;
      }
    }

    // Handle category-specific details
    switch (listing.category) {
      case ListingCategory.PROPERTY:
        if ((listing as PropertyListing).propertyDetails) {
          console.log('Adding property details');
          const propertyDetails = (listing as PropertyListing).propertyDetails;
          const { error: propertyError } = await supabase
            .from('property_details')
            .insert({
              listing_id: listingId,
              property_type: propertyDetails.propertyType,
              size: propertyDetails.size || null,
              bedrooms: propertyDetails.bedrooms || null,
              bathrooms: propertyDetails.bathrooms || null,
              amenities: propertyDetails.amenities || []
            });

          if (propertyError) {
            console.error('Error adding property details:', propertyError);
            throw propertyError;
          }
        }
        break;

      case ListingCategory.SERVICES:
        if ((listing as ServiceListing).services) {
          console.log('Adding service details');
          const { error: serviceDetailsError } = await supabase
            .from('service_details')
            .insert({
              listing_id: listingId,
              service_types: (listing as ServiceListing).services?.map(s => s.name) || [],
              pricing_model: 'hourly', // Default value, update as needed
              specialties: []
            });

          if (serviceDetailsError) {
            console.error('Error adding service details:', serviceDetailsError);
            throw serviceDetailsError;
          }
        }
        break;

      case ListingCategory.STORE:
        // For now, we'll just log that we're adding store details
        // We'll need to update the types to include storeDetails
        console.log('Adding store details');
        break;

      case ListingCategory.AUTO_DEALERSHIP:
        if ((listing as AutoDealershipListing).autoDealershipDetails) {
          console.log('Adding auto dealership details');
          const autoDetails = (listing as AutoDealershipListing).autoDealershipDetails;
          const { error: autoError } = await supabase
            .from('auto_dealership_details')
            .insert({
              listing_id: listingId,
              vehicle_types: autoDetails.vehicleTypes || [],
              brands: autoDetails.brands || [],
              services: autoDetails.services || [],
              year_established: autoDetails.yearEstablished || null,
              financing_available: autoDetails.financingAvailable || false
            });

          if (autoError) {
            console.error('Error adding auto dealership details:', autoError);
            throw autoError;
          }
        }
        break;
    }
    
    // Handle images if provided
    if (listing.images && listing.images.length > 0) {
      const imagesData = listing.images.map(image => ({
        listing_id: listingId,
        storage_path: image.path || image.storagePath,
        is_primary: image.isPrimary
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imagesData);

      if (imagesError) {
        console.error('Error inserting images:', imagesError);
        // Continue anyway since the listing was created successfully
      }
    }

    return listingId;
  } catch (error) {
    console.error('Error creating listing:', error);
    return null;
  }
};

// Get a listing by ID
export const getListingById = async (id: string): Promise<Listing | null> => {
  try {
    // Get the main listing data
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (listingError) throw listingError;
    if (!listingData) return null;

    // Create a base listing object
    const baseListing = {
      id: listingData.id,
      userId: listingData.user_id,
      category: listingData.category as ListingCategory,
      subcategory: listingData.subcategory,
      businessName: listingData.business_name,
      description: listingData.description,
      location: listingData.location,
      phone: listingData.phone || undefined,
      email: listingData.email || undefined,
      website: listingData.website || undefined,
      createdAt: new Date(listingData.created_at),
      updatedAt: new Date(listingData.updated_at),
      isPublished: listingData.is_published
    };

    // Get business hours from the new business_hours table
    const { data: hoursData, error: hoursError } = await supabase
      .from('business_hours')
      .select('*')
      .eq('listing_id', id);

    if (hoursError) throw hoursError;

    const businessHours: BusinessHours[] = hoursData?.map(hour => ({
      day: hour.day,
      openTime: hour.open_time,
      closeTime: hour.close_time,
      isClosed: hour.is_closed
    })) || [];

    // Get services from the new services table
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('listing_id', id);

    if (servicesError) throw servicesError;

    const services: Service[] = servicesData?.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price
      // duration is not in the Service type yet, we'll need to update it
    })) || [];

    // Get images for the listing
    const { data: imagesData, error: imagesError } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', id);

    if (imagesError) throw imagesError;

    const images: ListingImage[] = imagesData?.map(image => ({
      id: image.id,
      listingId: image.listing_id,
      storagePath: image.storage_path,
      path: image.storage_path, // Add path property for compatibility
      isPrimary: image.is_primary
      // url will be populated by imageUtils.ts on the client-side
    })) || [];

    // Create the appropriate listing type based on category
    let listing: Listing;

    switch (listingData.category) {
      case ListingCategory.PROPERTY:
        // Get property details from the new property_details table
        const { data: propertyData, error: propertyError } = await supabase
          .from('property_details')
          .select('*')
          .eq('listing_id', id)
          .maybeSingle();

        if (propertyError) throw propertyError;
        
        const propertyDetails = propertyData || {};
        listing = {
          ...baseListing,
          businessHours,
          images,
          propertyDetails: {
            propertyType: propertyDetails.property_type || '',
            size: propertyDetails.size,
            bedrooms: propertyDetails.bedrooms,
            bathrooms: propertyDetails.bathrooms,
            amenities: propertyDetails.amenities || []
          }
        } as PropertyListing;
        break;

      case ListingCategory.SERVICES:
        // Get service details from the new service_details table
        const { data: serviceDetailsData, error: serviceDetailsError } = await supabase
          .from('service_details')
          .select('*')
          .eq('listing_id', id)
          .maybeSingle();

        if (serviceDetailsError) throw serviceDetailsError;
        
        const serviceDetails = serviceDetailsData || {};
        listing = {
          ...baseListing,
          businessHours,
          services,
          images,
          serviceDetails: {
            serviceTypes: serviceDetails.service_types || [],
            pricingModel: serviceDetails.pricing_model || 'hourly',
            specialties: serviceDetails.specialties || []
          }
        } as ServiceListing;
        break;

      case ListingCategory.STORE:
        // Get store details from the new store_details table
        const { data: storeData, error: storeError } = await supabase
          .from('store_details')
          .select('*')
          .eq('listing_id', id)
          .maybeSingle();

        if (storeError) throw storeError;
        
        const storeDetails = storeData || {};
        listing = {
          ...baseListing,
          businessHours,
          images,
          storeDetails: {
            storeType: storeDetails.store_type || '',
            products: storeDetails.products || [],
            yearEstablished: storeDetails.year_established
          }
        } as StoreListing;
        break;

      case ListingCategory.AUTO_DEALERSHIP:
        // Get auto dealership details from the new auto_dealership_details table
        const { data: autoData, error: autoError } = await supabase
          .from('auto_dealership_details')
          .select('*')
          .eq('listing_id', id)
          .maybeSingle();

        if (autoError) throw autoError;
        
        const autoDetails = autoData || {};
        listing = {
          ...baseListing,
          businessHours,
          images,
          autoDealershipDetails: {
            brands: autoDetails.brands || [],
            vehicleTypes: autoDetails.vehicle_types || [],
            services: autoDetails.services || [],
            specialties: autoDetails.specialties || [],
            yearEstablished: autoDetails.year_established,
            financingAvailable: autoDetails.financing_available || false
          }
        } as AutoDealershipListing;
        break;

      default:
        // For unknown categories, we'll create a generic listing with common fields
        if (listingData.category === ListingCategory.AUTO_DEALERSHIP) {
          listing = {
            ...baseListing,
            businessHours,
            images,
            autoDealershipDetails: {
              brands: [],
              vehicleTypes: [],
              services: [],
              specialties: [],
              yearEstablished: undefined,
              financingAvailable: false
            }
          } as AutoDealershipListing;
        } else if (listingData.category === ListingCategory.PROPERTY) {
          listing = {
            ...baseListing,
            businessHours,
            images,
            propertyDetails: {
              propertyType: '',
              size: undefined,
              bedrooms: undefined,
              bathrooms: undefined,
              amenities: []
            }
          } as PropertyListing;
        } else if (listingData.category === ListingCategory.SERVICES) {
          listing = {
            ...baseListing,
            businessHours,
            services,
            images,
            serviceDetails: {
              serviceTypes: [],
              pricingModel: 'hourly',
              specialties: []
            }
          } as ServiceListing;
        } else if (listingData.category === ListingCategory.STORE) {
          listing = {
            ...baseListing,
            businessHours,
            images,
            storeDetails: {
              storeType: '',
              products: [],
              yearEstablished: undefined
            }
          } as StoreListing;
        } else {
          // For unknown categories, create a generic listing that satisfies the Listing type
          // We'll use AutoDealershipListing as a fallback since it's part of the Listing union type
          listing = {
            ...baseListing,
            businessHours,
            images,
            autoDealershipDetails: {
              brands: [],
              vehicleTypes: [],
              services: [],
              specialties: [],
              yearEstablished: undefined,
              financingAvailable: false
            },
            category: ListingCategory.AUTO_DEALERSHIP as any // Force category to be valid
          } as AutoDealershipListing;
        }
    }

    return listing;
  } catch (error) {
    console.error('Error getting listing:', error);
    return null;
  }
};

// Get all listings for a user
export const getUserListings = async (userId: string): Promise<BaseListing[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      category: listing.category as ListingCategory,
      subcategory: listing.subcategory,
      businessName: listing.business_name,
      description: listing.description,
      location: listing.location,
      phone: listing.phone || undefined,
      email: listing.email || undefined,
      website: listing.website || undefined,
      createdAt: new Date(listing.created_at),
      updatedAt: new Date(listing.updated_at),
      isPublished: listing.is_published
    }));
  } catch (error) {
    console.error('Error getting user listings:', error);
    return [];
  }
};

// Get all published listings for the public listings page with pagination, search and filtering
interface GetPublishedListingsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: ListingCategory;
}

interface PublishedListingsResponse {
  listingsData: BaseListing[];
  totalCount: number;
}

export const getPublishedListings = async (params?: GetPublishedListingsParams): Promise<PublishedListingsResponse> => {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    
    // Build the query
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('is_published', true);
    
    // Apply search filter if provided
    if (params?.searchTerm) {
      const searchTerm = params.searchTerm.toLowerCase();
      query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%`);
    }
    
    // Apply category filter if provided
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    // Get total count first
    const { count, error: countError } = await query;
    
    if (countError) {
      console.error('Error counting published listings:', countError);
      throw countError;
    }
    
    const totalCount = count || 0;
    
    // Then get paginated data
    const { data: listingsRaw, error: listingsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (listingsError) {
      console.error('Error fetching published listings:', listingsError);
      throw listingsError;
    }
    if (!listingsRaw || listingsRaw.length === 0) return { listingsData: [], totalCount: 0 };

    const listingIds = listingsRaw.map(l => l.id);

    // Step 2: Fetch all images for these listings
    let imagesByListingId: Record<string, ListingImage[]> = {};
    const { data: allImagesData, error: allImagesError } = await supabase
      .from('listing_images')
      .select('*')
      .in('listing_id', listingIds);

    if (allImagesError) {
      console.error('Error fetching images for published listings:', allImagesError);
      // Continue without images if this step fails, but log the error
    } else if (allImagesData) {
      imagesByListingId = allImagesData.reduce((acc, img) => {
        const listingId = img.listing_id;
        if (!acc[listingId]) {
          acc[listingId] = [];
        }
        acc[listingId].push({
          id: img.id,
          listingId: img.listing_id,
          storagePath: img.storage_path,
          path: img.storage_path, // Assuming path is for display, maps from storage_path
          isPrimary: img.is_primary,
          url: getImageUrl(img.storage_path)
        } as ListingImage);
        return acc;
      }, {} as Record<string, ListingImage[]>);
    }

    // Step 3: Map to BaseListing[]
    const listingsData = listingsRaw.map(listing => ({
      id: listing.id,
      userId: listing.user_id,
      category: listing.category as ListingCategory,
      subcategory: listing.subcategory,
      businessName: listing.business_name,
      description: listing.description,
      location: listing.location,
      phone: listing.phone || undefined,
      email: listing.email || undefined,
      website: listing.website || undefined,
      createdAt: new Date(listing.created_at),
      updatedAt: new Date(listing.updated_at),
      isPublished: listing.is_published,
      images: imagesByListingId[listing.id] || []
      // businessHours and services are intentionally not fetched for this overview list
    }));
    
    return {
      listingsData,
      totalCount
    };

  } catch (error) {
    console.error('Error in getPublishedListings:', error);
    return { listingsData: [], totalCount: 0 }; // Return empty response on error
  }
};

// Update a listing
export const updateListing = async (
  id: string, 
  listing: Partial<Omit<BaseListing, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    // Update main listing table
    const updateData: any = {};
    
    if (listing.category) updateData.category = listing.category;
    if (listing.subcategory) updateData.subcategory = listing.subcategory;
    if (listing.businessName) updateData.business_name = listing.businessName;
    if (listing.description) updateData.description = listing.description;
    if (listing.location) updateData.location = listing.location;
    if (listing.phone !== undefined) updateData.phone = listing.phone;
    if (listing.email !== undefined) updateData.email = listing.email;
    if (listing.website !== undefined) updateData.website = listing.website;
    if (listing.isPublished !== undefined) updateData.is_published = listing.isPublished;

    if (Object.keys(updateData).length > 0) {
      const { error: listingError } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id);

      if (listingError) throw listingError;
    }

    return true;
  } catch (error) {
    console.error('Error updating listing:', error);
    return false;
  }
};

// Delete a listing
export const deleteListing = async (id: string): Promise<boolean> => {
  try {
    // Delete the listing (cascade will handle related tables)
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting listing:', error);
    return false;
  }
};

// Upload an image to Supabase Storage
export const uploadListingImage = async (
  file: File,
  listingId: string,
  isPrimary: boolean = false
): Promise<ListingImage | null> => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `listing_images/${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('listing_images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    
    // Generate a UUID for the image
    const imageId = crypto.randomUUID();
    
    // For temporary IDs (when creating a new listing), we'll attach the image to the listing later
    if (listingId.startsWith('temp-')) {
      // Just return the image info without creating a database record
      return {
        id: imageId,
        storagePath: filePath,
        path: filePath,
        isPrimary: isPrimary,
        url: getImageUrl(filePath)
      };
    }

    // If we have a real listing ID, add record to the listing_images table
    const { data, error: dbError } = await supabase
      .from('listing_images')
      .insert({
        id: imageId,
        listing_id: listingId,
        storage_path: filePath,
        is_primary: isPrimary
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Return the image data with URL
    return {
      id: data.id,
      storagePath: filePath,
      path: filePath, // Add path property for compatibility
      isPrimary: isPrimary,
      url: getImageUrl(filePath)
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Delete an image
export const deleteListingImage = async (imageId: string): Promise<boolean> => {
  try {
    // Get the image record to get the storage path
    const { data, error: getError } = await supabase
      .from('listing_images')
      .select('storage_path')
      .eq('id', imageId)
      .single();

    if (getError) throw getError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('listing_images')
      .remove([data.storage_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('listing_images')
      .delete()
      .eq('id', imageId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Helper function to get image URL
export const getImageUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('listing_images')
    .getPublicUrl(storagePath);
  
  return data.publicUrl;
};

// Update business hours for a listing
export const updateBusinessHours = async (
  listingId: string,
  hours: BusinessHours[]
): Promise<boolean> => {
  try {
    // Delete existing hours
    const { error: deleteError } = await supabase
      .from('business_hours')
      .delete()
      .eq('listing_id', listingId);

    if (deleteError) throw deleteError;

    // Insert new hours
    if (hours.length > 0) {
      const hoursData = hours.map(hour => ({
        listing_id: listingId,
        day: hour.day,
        open_time: hour.openTime,
        close_time: hour.closeTime,
        is_closed: hour.isClosed
      }));

      const { error: insertError } = await supabase
        .from('business_hours')
        .insert(hoursData);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error updating business hours:', error);
    return false;
  }
};

// Update services for a listing
export const updateServices = async (
  listingId: string,
  services: Service[]
): Promise<boolean> => {
  try {
    // Delete existing services
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('listing_id', listingId);

    if (deleteError) throw deleteError;

    // Insert new services
    if (services.length > 0) {
      const servicesData = services.map(service => ({
        listing_id: listingId,
        name: service.name,
        description: service.description || null,
        price: service.price || null
      }));

      const { error: insertError } = await supabase
        .from('services')
        .insert(servicesData);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error updating services:', error);
    return false;
  }
};

// Update property details
export const updatePropertyDetails = async (
  listingId: string,
  details: PropertyDetails
): Promise<boolean> => {
  try {
    // Check if property details exist
    const { data, error: checkError } = await supabase
      .from('property_details')
      .select('id')
      .eq('listing_id', listingId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('property_details')
        .update({
          property_type: details.propertyType,
          size: details.size || null,
          bedrooms: details.bedrooms || null,
          bathrooms: details.bathrooms || null,
          amenities: details.amenities || null
        })
        .eq('listing_id', listingId);

      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('property_details')
        .insert({
          listing_id: listingId,
          property_type: details.propertyType,
          size: details.size || null,
          bedrooms: details.bedrooms || null,
          bathrooms: details.bathrooms || null,
          amenities: details.amenities || null
        });

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error updating property details:', error);
    return false;
  }
};

// Update auto dealership details
export const updateAutoDealershipDetails = async (
  listingId: string,
  details: AutoDealershipDetails
): Promise<boolean> => {
  try {
    // Check if auto dealership details exist
    const { data, error: checkError } = await supabase
      .from('auto_dealership_details')
      .select('id')
      .eq('listing_id', listingId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('auto_dealership_details')
        .update({
          vehicle_types: details.vehicleTypes,
          brands: details.brands,
          services: details.services,
          year_established: details.yearEstablished || null,
          specialties: details.specialties,
          financing_available: details.financingAvailable
        })
        .eq('listing_id', listingId);

      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('auto_dealership_details')
        .insert({
          listing_id: listingId,
          vehicle_types: details.vehicleTypes,
          brands: details.brands,
          services: details.services,
          year_established: details.yearEstablished || null,
          specialties: details.specialties,
          financing_available: details.financingAvailable
        });

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error updating auto dealership details:', error);
    return false;
  }
};
