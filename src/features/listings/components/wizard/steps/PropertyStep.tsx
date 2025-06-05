import React, { useState } from 'react';
import { useWizard } from '../WizardContext';

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Condo',
  'Townhouse',
  'Land',
  'Commercial Space',
  'Office',
  'Retail',
  'Industrial',
  'Mixed Use',
  'Other'
];

const COMMON_AMENITIES = [
  'Air Conditioning',
  'Heating',
  'Parking',
  'Swimming Pool',
  'Gym',
  'Elevator',
  'Security System',
  'Furnished',
  'Balcony',
  'Garden',
  'Pets Allowed',
  'Wheelchair Accessible',
  'Washer/Dryer',
  'Internet/WiFi',
  'Storage Space'
];

const PropertyStep: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { propertyDetails } = formState;

  // Initialize property details if not already set
  if (!propertyDetails) {
    updateFormField('propertyDetails', {
      propertyType: '',
      size: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      amenities: []
    });
  }

  const [newAmenity, setNewAmenity] = useState('');

  // Handle property type change
  const handlePropertyTypeChange = (type: string) => {
    updateFormField('propertyDetails', {
      ...formState.propertyDetails!,
      propertyType: type
    });
  };

  // Handle numeric input changes
  const handleNumericChange = (field: 'size' | 'bedrooms' | 'bathrooms', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    updateFormField('propertyDetails', {
      ...formState.propertyDetails!,
      [field]: numValue
    });
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formState.propertyDetails?.amenities || [];
    let updatedAmenities;

    if (currentAmenities.includes(amenity)) {
      updatedAmenities = currentAmenities.filter(a => a !== amenity);
    } else {
      updatedAmenities = [...currentAmenities, amenity];
    }

    updateFormField('propertyDetails', {
      ...formState.propertyDetails!,
      amenities: updatedAmenities
    });
  };

  // Add custom amenity
  const handleAddCustomAmenity = () => {
    if (!newAmenity.trim()) return;
    
    const currentAmenities = formState.propertyDetails?.amenities || [];
    if (!currentAmenities.includes(newAmenity)) {
      updateFormField('propertyDetails', {
        ...formState.propertyDetails!,
        amenities: [...currentAmenities, newAmenity]
      });
    }
    setNewAmenity('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>
        <p className="text-gray-600 mb-6">
          Provide specific details about your property to help potential buyers or renters.
        </p>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROPERTY_TYPES.map((type) => (
            <div
              key={type}
              onClick={() => handlePropertyTypeChange(type)}
              className={`border rounded-md p-3 cursor-pointer transition-all ${
                formState.propertyDetails?.propertyType === type
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Property Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Size */}
        <div>
          <label htmlFor="propertySize" className="block text-sm font-medium text-gray-700 mb-1">
            Size (sq ft)
          </label>
          <input
            type="number"
            id="propertySize"
            value={formState.propertyDetails?.size || ''}
            onChange={(e) => handleNumericChange('size', e.target.value)}
            min="0"
            placeholder="Property size"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Bedrooms
          </label>
          <input
            type="number"
            id="bedrooms"
            value={formState.propertyDetails?.bedrooms || ''}
            onChange={(e) => handleNumericChange('bedrooms', e.target.value)}
            min="0"
            placeholder="Number of bedrooms"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Bathrooms
          </label>
          <input
            type="number"
            id="bathrooms"
            value={formState.propertyDetails?.bathrooms || ''}
            onChange={(e) => handleNumericChange('bathrooms', e.target.value)}
            min="0"
            step="0.5"
            placeholder="Number of bathrooms"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {COMMON_AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <input
                type="checkbox"
                id={`amenity-${amenity}`}
                checked={formState.propertyDetails?.amenities?.includes(amenity) || false}
                onChange={() => handleAmenityToggle(amenity)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor={`amenity-${amenity}`} className="ml-2 block text-sm text-gray-900">
                {amenity}
              </label>
            </div>
          ))}
        </div>

        {/* Custom amenity */}
        <div className="flex mt-4">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="Add custom amenity"
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddCustomAmenity}
            className="px-4 py-2 bg-amber-500 text-black rounded-r-md hover:bg-black hover:text-amber-500"
          >
            Add
          </button>
        </div>

        {/* Selected custom amenities */}
        {formState.propertyDetails?.amenities && formState.propertyDetails.amenities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Amenities:</h4>
            <div className="flex flex-wrap gap-2">
              {formState.propertyDetails.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className="ml-2 text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-md mt-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for effective property listings:</h3>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Be accurate with property specifications</li>
          <li>Highlight unique features that make your property stand out</li>
          <li>Mention recent renovations or upgrades</li>
          <li>Include information about the neighborhood and nearby amenities</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertyStep;
