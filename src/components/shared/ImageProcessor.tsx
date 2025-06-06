import { useMemo } from 'react';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';
import type { ListingImage } from '../../types/listings';

export interface ProcessedImage {
  id: string;
  url: string;
  isPrimary: boolean;
  alt?: string;
}

export const useImageProcessor = (images?: ListingImage[]): ProcessedImage[] => {
  return useMemo(() => {
    if (!images || images.length === 0) return [];
    
    return images.map((image: any, index) => {
      // Handle string image paths
      if (typeof image === 'string') {
        return { 
          id: `img-${index}`,
          url: getImageUrl(image), 
          isPrimary: index === 0,
          alt: `Image ${index + 1}`
        };
      }
      
      // Handle image objects
      try {
        // If image already has a valid URL
        if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
          return {
            id: image.id || `img-${index}`,
            url: image.url,
            isPrimary: image.isPrimary || index === 0,
            alt: image.alt || `Image ${index + 1}`
          };
        }
        
        // Get URL from storage path
        const storagePath = image.storagePath || image.path;
        if (storagePath) {
          return {
            id: image.id || `img-${index}`,
            url: getImageUrl(storagePath, 'listing_images'),
            isPrimary: image.isPrimary || index === 0,
            alt: image.alt || `Image ${index + 1}`
          };
        }
        
        // Fallback
        return {
          id: image.id || `img-${index}`,
          url: getPlaceholderImage(),
          isPrimary: image.isPrimary || index === 0,
          alt: image.alt || `Image ${index + 1}`
        };
      } catch (error) {
        return {
          id: image.id || `img-${index}`,
          url: getPlaceholderImage(),
          isPrimary: image.isPrimary || index === 0,
          alt: image.alt || `Image ${index + 1}`
        };
      }
    });
  }, [images]);
};