import { supabase } from '../lib/supabaseClient';
import type { ListingImage } from '../types/listings';

/**
 * Get a list of available buckets in Supabase storage
 * This is useful for debugging purposes
 */
export const listBuckets = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return [];
    }
    return data.map(bucket => bucket.name);
  } catch (error) {
    console.error('Error listing buckets:', error);
    return [];
  }
};

/**
 * Get a properly formatted public URL for an image stored in Supabase
 * @param storagePath The storage path of the image in Supabase
 * @param bucket The storage bucket name (defaults to 'listing_images')
 * @returns The complete public URL to the image
 */
export const getImageUrl = (rawStoragePath: string, bucket = 'listing_images'): string => {
  try {
    if (!rawStoragePath) {
      return getPlaceholderImage();
    }

    // Normalize the path: first, extract the actual filename by stripping all leading bucket prefixes.
    let filename = rawStoragePath;
    const bucketPrefix = `${bucket}/`; // e.g., "listing_images/"

    // Repeatedly strip the bucket prefix if it exists at the start of the current filename string
    while (filename.startsWith(bucketPrefix)) {
      filename = filename.substring(bucketPrefix.length);
    }

    // Construct the path that Supabase needs for getPublicUrl.
    const pathForSupabase = filename;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(pathForSupabase);

    if (!data || !data.publicUrl) {
      return getPlaceholderImage();
    }

    return data.publicUrl;

  } catch (error: any) {
    console.error('[getImageUrl] Exception generating image URL:', error.message || error, {
      rawStoragePath,
      bucket,
    });
    return getPlaceholderImage();
  }
};

/**
 * Get a placeholder image URL
 * @param width Width of the placeholder image
 * @param height Height of the placeholder image
 * @returns A placeholder image URL
 */
export const getPlaceholderImage = (width = 800, height = 600): string => {
  return `https://placehold.co/${width}x${height}/CCCCCC/333333?text=No+Image`;
};

/**
 * Process a single listing image to ensure it has a valid URL
 * @param image The listing image to process
 * @param bucket The storage bucket name (defaults to 'listing_images')
 * @returns The processed image with a valid URL
 */
export const processListingImage = (image: ListingImage, bucket = 'listing_images'): ListingImage => {
  if (!image) return image;
  
  try {
    // If URL is already a complete URL, use it
    if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
      return image;
    }
    
    // If we have a storagePath, generate URL from it
    if (image.storagePath || image.path) {
      const storagePath = image.storagePath || image.path;
      const url = getImageUrl(storagePath, bucket);
      
      return {
        ...image,
        url
      };
    }
    
    // If we have neither URL nor storagePath, use placeholder
    return {
      ...image,
      url: getPlaceholderImage()
    };
  } catch (error) {
    console.error('Error processing listing image:', error);
    return {
      ...image,
      url: getPlaceholderImage()
    };
  }
};

/**
 * Process an array of listing images to ensure they all have valid URLs
 * @param images The array of listing images to process
 * @param bucket The storage bucket name (defaults to 'listings')
 * @returns The processed images with valid URLs
 */
export const processListingImages = (images: ListingImage[], bucket = 'listing_images'): ListingImage[] => {
  if (!images || !Array.isArray(images) || images.length === 0) return [];
  return images.map(image => processListingImage(image, bucket));
};