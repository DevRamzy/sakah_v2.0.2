import React from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';
import type { ProcessedImage } from '../../types/images';

interface GalleryTabContentProps {
  images: ProcessedImage[];
}

const GalleryTabContent: React.FC<GalleryTabContentProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
          <ImageIcon className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Gallery
        </h2>
        
        <div className="text-center py-10 bg-neutral-50 rounded-lg">
          <Camera className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-500">No images available</h3>
          <p className="text-neutral-400 mt-2">This listing hasn't added any photos yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
        <ImageIcon className="w-6 h-6 mr-2.5 text-yellow-500 flex-shrink-0" /> Gallery
      </h2>
      
      {/* Featured Image */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
            <img 
              src={images.find(img => img.isPrimary)?.url || images[0].url} 
              alt="Featured" 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-neutral-500 mt-2">Featured Image</p>
        </div>
      )}
      
      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="group relative">
            <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-neutral-100">
              <img 
                src={image.url} 
                alt={`Gallery image ${index + 1}`} 
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>
            {image.isPrimary && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-xs text-black px-2 py-1 rounded-full">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Download All Button */}
      <div className="mt-8 text-center">
        <button className="bg-neutral-100 text-neutral-700 font-medium px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center mx-auto">
          <ImageIcon className="w-5 h-5 mr-2" />
          Download All Images
        </button>
      </div>
    </div>
  );
};

export default GalleryTabContent;
