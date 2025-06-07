import React, { useState, useRef, useEffect } from 'react';
import { useWizard } from '../WizardContext';
import { useImageUpload } from '../../../hooks/useImageUpload';
import { updateListing } from '../../../services/listingService';

const ImagesStep: React.FC = () => {
  const { formState, updateFormField, saveListing, isLoading } = useWizard();
  const { images } = formState;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploadImage,
    deleteImage,
    isUploading,
    uploadError,
    setUploadError,
    validateFile
  } = useImageUpload();

  const [dragActive, setDragActive] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<{id: string, url: string, isPrimary: boolean}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process files for local storage (not uploading yet)
  const handleFiles = (files: FileList) => {
    setUploadError(null);
    setSubmissionError(null);
    
    // Check if we're at the maximum number of images (10)
    if (pendingPreviews.length + images.length + files.length > 10) {
      setUploadError('Maximum of 10 images allowed');
      return;
    }
    
    // Store files for later upload and create local previews
    const newFiles: File[] = [];
    const newPreviews: {id: string, url: string, isPrimary: boolean}[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type and size
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file');
        continue;
      }
      
      // Generate a temporary ID
      const tempId = `temp-${Date.now()}-${i}`;
      
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Don't automatically set as primary - let user choose
      const isPrimary = false;
      
      newFiles.push(file);
      newPreviews.push({
        id: tempId,
        url: previewUrl,
        isPrimary
      });
    }
    
    // Update state with new files and previews
    setPendingFiles(prev => [...prev, ...newFiles]);
    setPendingPreviews(prev => [...prev, ...newPreviews]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image removal
  const handleRemoveImage = async (imageUrl: string | undefined) => {
    if (!imageUrl) return;
    
    try {
      // Check if it's a pending image (local preview)
      const pendingImageIndex = pendingPreviews.findIndex(img => img.url === imageUrl);
      
      if (pendingImageIndex >= 0) {
        // For pending images, confirm deletion
        if (window.confirm('Are you sure you want to remove this image?')) {
          // Remove from pending previews
          const updatedPreviews = [...pendingPreviews];
          const removedPreview = updatedPreviews.splice(pendingImageIndex, 1)[0];
          
          // Revoke the object URL to prevent memory leaks
          URL.revokeObjectURL(removedPreview.url);
          
          // Remove corresponding file
          const updatedFiles = [...pendingFiles];
          updatedFiles.splice(pendingImageIndex, 1);
          
          setPendingPreviews(updatedPreviews);
          setPendingFiles(updatedFiles);
          
          // If the removed image was primary, set a new one if available
          if (removedPreview.isPrimary) {
            if (updatedPreviews.length > 0) {
              // Set the first pending image as primary
              const newPrimaryPreviews = updatedPreviews.map((img, idx) => ({
                ...img,
                isPrimary: idx === 0
              }));
              setPendingPreviews(newPrimaryPreviews);
              
              // Make sure no uploaded images are primary
              if (images.length > 0) {
                updateFormField('images', images.map(img => ({ ...img, isPrimary: false })));
              }
            } else if (images.length > 0) {
              // Set the first uploaded image as primary
              const newPrimaryImages = images.map((img, idx) => ({
                ...img,
                isPrimary: idx === 0
              }));
              updateFormField('images', newPrimaryImages);
            }
          }
        }
      } else {
        // It's an already uploaded image
        const imageToDelete = images.find(img => img.url === imageUrl);
        
        if (imageToDelete && imageToDelete.id) {
          // For uploaded images, confirm deletion
          if (window.confirm('Are you sure you want to remove this image? This cannot be undone.')) {
            // Show loading state
            setUploadError('Deleting image...');
            
            // Try to delete the image
            const success = await deleteImage(imageToDelete.id);
            
            if (success) {
              // Clear error message
              setUploadError(null);
              
              // Update images list
              const updatedImages = images.filter(img => img.url !== imageUrl);
              updateFormField('images', updatedImages);
              
              // If the removed image was primary, set a new one if available
              if (imageToDelete.isPrimary) {
                if (updatedImages.length > 0) {
                  // Set the first remaining image as primary
                  const newPrimaryImages = updatedImages.map((img, idx) => ({
                    ...img,
                    isPrimary: idx === 0
                  }));
                  updateFormField('images', newPrimaryImages);
                  
                  // Make sure no pending images are primary
                  if (pendingPreviews.length > 0) {
                    setPendingPreviews(pendingPreviews.map(img => ({ ...img, isPrimary: false })));
                  }
                } else if (pendingPreviews.length > 0) {
                  // Set the first pending image as primary
                  const newPrimaryPreviews = pendingPreviews.map((img, idx) => ({
                    ...img,
                    isPrimary: idx === 0
                  }));
                  setPendingPreviews(newPrimaryPreviews);
                }
              }
            } else {
              setUploadError('Failed to delete image. Please try again.');
            }
          }
        } else {
          setUploadError('Cannot delete image: Image ID not found.');
        }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      setUploadError('Failed to remove image. Please try again.');
    }
  };

  // Set image as primary (featured)
  const handleSetPrimary = (imageUrl: string | undefined) => {
    if (!imageUrl) return;
    
    try {
      // Check if it's a pending image
      const isPendingImage = pendingPreviews.some(img => img.url === imageUrl);
      
      if (isPendingImage) {
        // Update pending previews - only one can be primary
        const updatedPreviews = pendingPreviews.map(img => ({
          ...img,
          isPrimary: img.url === imageUrl
        }));
        
        // Make sure no uploaded images are primary
        const updatedImages = images.map(img => ({
          ...img,
          isPrimary: false
        }));
        
        setPendingPreviews(updatedPreviews);
        updateFormField('images', updatedImages);
      } else {
        // It's an already uploaded image
        // Update uploaded images - only one can be primary
        const updatedImages = images.map(img => ({
          ...img,
          isPrimary: img.url === imageUrl
        }));
        
        // Make sure no pending images are primary
        const updatedPreviews = pendingPreviews.map(img => ({
          ...img,
          isPrimary: false
        }));
        
        updateFormField('images', updatedImages);
        setPendingPreviews(updatedPreviews);
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      setUploadError('Failed to set featured image. Please try again.');
    }
  };

  // Function to upload all pending images and save the listing
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);
    
    try {
      // If there are no images at all, show an error
      if (images.length === 0 && pendingPreviews.length === 0) {
        setSubmissionError('Please add at least one image');
        setIsSubmitting(false);
        return;
      }
      
      // Make sure at least one image is marked as primary/featured
      let hasPrimary = images.some(img => img.isPrimary) || pendingPreviews.some(prev => prev.isPrimary);
      console.log('Has primary image:', hasPrimary);
      console.log('Current form state:', formState);
      
      if (!hasPrimary) {
        console.log('No primary image found, setting one automatically');
        // If no primary image is selected, set the first one as primary
        if (pendingPreviews.length > 0) {
          const updatedPreviews = pendingPreviews.map((img, idx) => ({
            ...img,
            isPrimary: idx === 0
          }));
          setPendingPreviews(updatedPreviews);
          console.log('Set first pending image as primary');
        } else if (images.length > 0) {
          const updatedImages = images.map((img, idx) => ({
            ...img,
            isPrimary: idx === 0
          }));
          updateFormField('images', updatedImages);
          console.log('Set first uploaded image as primary');
        }
      }
      
      // We'll use the listingId returned from saveListing for any subsequent operations
      
      console.log('Saving listing as draft...');
      // Save the listing - for existing listings, this will update it
      const listingId = await saveListing(false); // Save as draft initially
      console.log('Listing saved with ID:', listingId);
      
      if (!listingId) {
        console.error('Failed to create listing - no ID returned');
        setSubmissionError('Failed to create listing');
        setIsSubmitting(false);
        return;
      }
      
      // If there are pending images, upload them using the real listing ID
      if (pendingFiles.length > 0) {
        console.log(`Uploading ${pendingFiles.length} pending images for listing ID: ${listingId}`);
        let successCount = 0;
        let failCount = 0;
        
        // Find the primary image
        const primaryPendingIndex = pendingPreviews.findIndex(img => img.isPrimary);
        console.log('Primary image index:', primaryPendingIndex);
        
        // Track the uploaded images
        const uploadedImages = [...images];
        console.log('Starting with existing images:', uploadedImages.length);
        
        // Upload all pending images
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          const isPrimary = i === primaryPendingIndex;
          console.log(`Uploading image ${i+1}/${pendingFiles.length}: ${file.name}, isPrimary: ${isPrimary}`);
          
          try {
            // Upload the image with the real listing ID
            const uploadedImage = await uploadImage(file, listingId, isPrimary);
            
            if (uploadedImage) {
              console.log('Image uploaded successfully:', uploadedImage.id);
              // Add to our tracking array
              uploadedImages.push(uploadedImage);
              successCount++;
            } else {
              console.error('Failed to upload image:', file.name);
              failCount++;
            }
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            console.error('Error details:', JSON.stringify(uploadError));
            failCount++;
          }
        }
        
        // Update the form state with all successfully uploaded images
        updateFormField('images', uploadedImages);
        
        // Clean up the object URLs to prevent memory leaks
        pendingPreviews.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });
        
        // Clear pending files and previews
        setPendingFiles([]);
        setPendingPreviews([]);
        
        // Show a message if some uploads failed
        if (failCount > 0) {
          setSubmissionError(`${successCount} images uploaded, ${failCount} failed. The listing was saved.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      setSubmissionSuccess('Your listing has been submitted for review. You will be notified once it is approved.');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      pendingPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [pendingPreviews]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
        <p className="text-gray-600 mb-6">
          Add photos of your listing. High-quality images increase interest and engagement.
        </p>
      </div>

      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2">Drag and drop images here, or click to select files</p>
            <p className="text-sm mt-1">PNG, JPG, JPEG up to 5MB</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-amber-500 hover:bg-black hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Select Files'}
          </button>
        </div>
      </div>

      {/* Error messages */}
      {uploadError && (
        <div className="text-red-600 text-sm mt-2">
          {uploadError}
        </div>
      )}
      
      {submissionError && (
        <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-md">
          {submissionError}
        </div>
      )}
      
      {submissionSuccess && (
        <div className="text-green-600 text-sm mt-2 p-3 bg-green-50 rounded-md">
          {submissionSuccess}
        </div>
      )}

      {/* Image preview */}
      {(images.length > 0 || pendingPreviews.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Images</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select one image as featured. This will be the main image shown in search results.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Render uploaded images */}
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative group rounded-lg overflow-hidden border ${
                  image.isPrimary ? 'border-amber-500 ring-2 ring-amber-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Listing image ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(image.url)}
                        className="p-2 bg-amber-500 rounded-full text-black hover:bg-amber-600"
                        title="Set as primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.url)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded-full">
                    Featured
                  </div>
                )}
              </div>
            ))}
            
            {/* Render pending images (local previews) */}
            {pendingPreviews.map((preview, index) => (
              <div
                key={`pending-${index}`}
                className={`relative group rounded-lg overflow-hidden border ${
                  preview.isPrimary ? 'border-amber-500 ring-2 ring-amber-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={preview.url}
                  alt={`Pending image ${index + 1}`}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    // Handle image loading errors
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                  }}
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    {!preview.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(preview.url)}
                        className="p-2 bg-amber-500 rounded-full text-black hover:bg-amber-600"
                        title="Set as featured"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(preview.url)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {preview.isPrimary && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded-full">
                    Featured
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  Pending Upload
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-md mt-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for great listing photos:</h3>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Use good lighting - natural daylight works best</li>
          <li>Take photos from multiple angles</li>
          <li>Keep the background clean and uncluttered</li>
          <li>Include both interior and exterior shots</li>
          <li>Highlight unique features or selling points</li>
        </ul>
      </div>
      
      {/* Admin approval notice */}
      <div className="bg-yellow-50 p-4 rounded-md mt-4 border border-yellow-200">
        <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Admin Approval Required
        </h3>
        <p className="text-sm text-yellow-700">
          Your listing will be reviewed by an administrator before it appears on the platform. 
          This process typically takes 24-48 hours. You'll receive a notification once your listing is approved.
        </p>
      </div>
      
      {/* Submission buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="px-6 py-2 bg-amber-500 text-black rounded-md hover:bg-black hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Submit for Review'}
        </button>
      </div>
    </div>
  );
};

export default ImagesStep;