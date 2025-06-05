import { useState } from 'react';
import type { ListingImage } from '../../../types/listings';
import { uploadListingImage, deleteListingImage } from '../services/listingService';

interface UseImageUploadProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export interface UseImageUploadReturn {
  images: ListingImage[];
  uploading: boolean;
  error: string | null;
  uploadError: string | null;
  setUploadError: React.Dispatch<React.SetStateAction<string | null>>;
  isUploading: boolean;
  uploadImage: (file: File, listingId: string, isPrimary?: boolean) => Promise<ListingImage | null>;
  deleteImage: (imageId: string) => Promise<boolean>;
  setImages: React.Dispatch<React.SetStateAction<ListingImage[]>>;
  validateFile: (file: File) => { valid: boolean; error?: string };
  setPrimaryImage: (imageId: string) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE_MB = 5; // 5MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const useImageUpload = ({
  maxFiles = 10,
  maxSizeInMB = DEFAULT_MAX_SIZE_MB,
  allowedTypes = DEFAULT_ALLOWED_TYPES
}: UseImageUploadProps = {}): UseImageUploadReturn => {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Validate file before upload
  const validateFile = (file: File) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeInMB}MB limit`
      };
    }

    // Check max files
    if (images.length >= maxFiles) {
      return {
        valid: false,
        error: `Maximum of ${maxFiles} images allowed`
      };
    }

    return { valid: true };
  };

  // Upload image
  const uploadImage = async (file: File, listingId: string, isPrimary: boolean = false): Promise<ListingImage | null> => {
    if (!listingId) {
      setError('Listing ID is required for image upload');
      return null;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return null;
    }

    setUploading(true);
    setIsUploading(true);
    setError(null);
    setUploadError(null);

    try {
      // If this is the primary image, update all other images to not be primary
      if (isPrimary && images.length > 0) {
        setImages(prevImages => 
          prevImages.map(img => ({
            ...img,
            isPrimary: false
          }))
        );
      }

      // If this is the first image, make it primary by default
      if (images.length === 0) {
        isPrimary = true;
      }

      const uploadedImage = await uploadListingImage(file, listingId, isPrimary);
      
      if (uploadedImage) {
        setImages(prev => [...prev, uploadedImage]);
        return uploadedImage;
      }
      
      setError('Failed to upload image');
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during upload';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const deleteImage = async (imageId: string): Promise<boolean> => {
    setUploading(true);
    setError(null);

    try {
      const success = await deleteListingImage(imageId);
      
      if (success) {
        // Remove the image from state
        const deletedImage = images.find(img => img.id === imageId);
        setImages(prev => prev.filter(img => img.id !== imageId));
        
        // If the deleted image was primary, set a new primary image
        if (deletedImage?.isPrimary && images.length > 1) {
          const remainingImages = images.filter(img => img.id !== imageId);
          if (remainingImages.length > 0) {
            setPrimaryImage(remainingImages[0].id!);
          }
        }
        
        return true;
      }
      
      setError('Failed to delete image');
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during deletion';
      setError(errorMessage);
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Set primary image
  const setPrimaryImage = (imageId: string) => {
    setImages(prevImages => 
      prevImages.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    );
  };

  return {
    images,
    uploading,
    error,
    uploadError,
    setUploadError,
    isUploading,
    uploadImage,
    deleteImage,
    setImages,
    validateFile,
    setPrimaryImage
  };
};
