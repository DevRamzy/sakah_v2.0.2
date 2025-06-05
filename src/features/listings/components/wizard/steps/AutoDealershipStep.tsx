import React, { useState } from 'react';
import { useWizard } from '../WizardContext';

const VEHICLE_TYPES = [
  'New Cars',
  'Used Cars',
  'Commercial Vehicles',
  'Motorcycles',
  'RVs',
  'Boats',
  'Heavy Equipment',
  'Parts & Accessories',
  'Other'
];

const COMMON_SERVICES = [
  'Financing',
  'Insurance',
  'Test Drives',
  'Vehicle Inspection',
  'Warranty',
  'Trade-Ins',
  'Maintenance',
  'Repairs',
  'Detailing',
  'Custom Modifications'
];

const AutoDealershipStep: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { autoDealershipDetails } = formState;

  // Initialize auto dealership details if not already set
  const initializeAutoDealershipDetails = () => {
    return {
      vehicleTypes: [],
      brands: [],
      services: [],
      yearEstablished: undefined,
      specialties: [],
      financingAvailable: false
    };
  };

  if (!autoDealershipDetails) {
    updateFormField('autoDealershipDetails', initializeAutoDealershipDetails());
  }

  const [newBrand, setNewBrand] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // Handle vehicle type toggle
  const handleVehicleTypeToggle = (type: string) => {
    const currentTypes = formState.autoDealershipDetails?.vehicleTypes || [];
    let updatedTypes;

    if (currentTypes.includes(type)) {
      updatedTypes = currentTypes.filter(t => t !== type);
    } else {
      updatedTypes = [...currentTypes, type];
    }

    updateFormField('autoDealershipDetails', {
      ...formState.autoDealershipDetails!,
      vehicleTypes: updatedTypes
    });
  };

  // Handle service toggle
  const handleServiceToggle = (service: string) => {
    const currentServices = formState.autoDealershipDetails?.services || [];
    let updatedServices;

    if (currentServices.includes(service)) {
      updatedServices = currentServices.filter(s => s !== service);
    } else {
      updatedServices = [...currentServices, service];
    }

    updateFormField('autoDealershipDetails', {
      ...formState.autoDealershipDetails!,
      services: updatedServices
    });
  };

  // Add brand
  const handleAddBrand = () => {
    if (!newBrand.trim()) return;
    
    const currentBrands = formState.autoDealershipDetails?.brands || [];
    if (!currentBrands.includes(newBrand)) {
      updateFormField('autoDealershipDetails', {
        ...formState.autoDealershipDetails!,
        brands: [...currentBrands, newBrand]
      });
    }
    setNewBrand('');
  };

  // Remove brand
  const handleRemoveBrand = (brand: string) => {
    const currentBrands = formState.autoDealershipDetails?.brands || [];
    updateFormField('autoDealershipDetails', {
      ...formState.autoDealershipDetails!,
      brands: currentBrands.filter(b => b !== brand)
    });
  };

  // Add specialty
  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    
    const currentSpecialties = formState.autoDealershipDetails?.specialties || [];
    if (!currentSpecialties.includes(newSpecialty)) {
      updateFormField('autoDealershipDetails', {
        ...formState.autoDealershipDetails!,
        specialties: [...currentSpecialties, newSpecialty]
      });
    }
    setNewSpecialty('');
  };

  // Remove specialty
  const handleRemoveSpecialty = (specialty: string) => {
    const currentSpecialties = formState.autoDealershipDetails?.specialties || [];
    updateFormField('autoDealershipDetails', {
      ...formState.autoDealershipDetails!,
      specialties: currentSpecialties.filter(s => s !== specialty)
    });
  };

  // Handle year established change
  const handleYearChange = (value: string) => {
    const year = value === '' ? undefined : parseInt(value);
    updateFormField('autoDealershipDetails', {
      ...formState.autoDealershipDetails!,
      yearEstablished: year
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Auto Dealership Details</h2>
        <p className="text-gray-600 mb-6">
          Provide specific details about your auto dealership to help customers find the right vehicles.
        </p>
      </div>

      {/* Vehicle Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Types <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {VEHICLE_TYPES.map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="checkbox"
                id={`vehicle-type-${type}`}
                checked={formState.autoDealershipDetails?.vehicleTypes?.includes(type) || false}
                onChange={() => handleVehicleTypeToggle(type)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor={`vehicle-type-${type}`} className="ml-2 block text-sm text-gray-900">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brands
        </label>
        <div className="flex">
          <input
            type="text"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="Add a brand (e.g., Toyota, Ford)"
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddBrand}
            className="px-4 py-2 bg-amber-500 text-black rounded-r-md hover:bg-black hover:text-amber-500"
          >
            Add
          </button>
        </div>

        {/* Brand tags */}
        {formState.autoDealershipDetails?.brands && formState.autoDealershipDetails.brands.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {formState.autoDealershipDetails.brands.map((brand) => (
                <div
                  key={brand}
                  className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => handleRemoveBrand(brand)}
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

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Offered
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {COMMON_SERVICES.map((service) => (
            <div key={service} className="flex items-center">
              <input
                type="checkbox"
                id={`service-${service}`}
                checked={formState.autoDealershipDetails?.services?.includes(service) || false}
                onChange={() => handleServiceToggle(service)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor={`service-${service}`} className="ml-2 block text-sm text-gray-900">
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Year Established */}
      <div className="mb-4">
        <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700 mb-1">
          Year Established
        </label>
        <input
          type="number"
          id="yearEstablished"
          value={formState.autoDealershipDetails?.yearEstablished || ''}
          onChange={(e) => handleYearChange(e.target.value)}
          min="1900"
          max={new Date().getFullYear()}
          placeholder="e.g., 1995"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Financing Available */}
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="financingAvailable"
            checked={formState.autoDealershipDetails?.financingAvailable || false}
            onChange={(e) => {
              updateFormField('autoDealershipDetails', {
                ...formState.autoDealershipDetails!,
                financingAvailable: e.target.checked
              });
            }}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="financingAvailable" className="ml-2 block text-sm font-medium text-gray-700">
            Financing Available
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Check this if your dealership offers financing options for customers.
        </p>
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties
        </label>
        <div className="flex">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add a specialty (e.g., Luxury Cars, Hybrids)"
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddSpecialty}
            className="px-4 py-2 bg-amber-500 text-black rounded-r-md hover:bg-black hover:text-amber-500"
          >
            Add
          </button>
        </div>

        {/* Specialty tags */}
        {formState.autoDealershipDetails?.specialties && formState.autoDealershipDetails.specialties.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {formState.autoDealershipDetails.specialties.map((specialty) => (
                <div
                  key={specialty}
                  className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialty(specialty)}
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
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for auto dealership listings:</h3>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Highlight your dealership's unique selling points</li>
          <li>Mention any certifications or awards</li>
          <li>Include information about financing options</li>
          <li>Describe your customer service approach</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoDealershipStep;
