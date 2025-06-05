import React from 'react';
import { useWizard } from '../WizardContext';
import { ListingCategory, SubcategoryMap } from '../../../../../types/listings';

const CategorySelection: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { category, subcategory } = formState;

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCategory = e.target.value as ListingCategory;
    updateFormField('category', selectedCategory);
    updateFormField('subcategory', '');
    console.log('Selected category:', selectedCategory); // Debug log
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormField('subcategory', e.target.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Listing Category</h2>
        <p className="text-gray-600 mb-6">
          Choose the category that best describes your business or property.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            category === ListingCategory.SERVICES 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-amber-300'
          }`}
          onClick={() => updateFormField('category', ListingCategory.SERVICES)}
        >
          <div className="flex items-start">
            <input
              type="radio"
              id="services"
              name="category"
              value={ListingCategory.SERVICES}
              checked={category === ListingCategory.SERVICES}
              onChange={handleCategoryChange}
              className="mt-1"
            />
            <label htmlFor="services" className="ml-3 cursor-pointer">
              <div className="font-medium">Services</div>
              <p className="text-sm text-gray-600 mt-1">
                Professional, home, health, education, or other services
              </p>
            </label>
          </div>
        </div>

        {/* Property */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            category === ListingCategory.PROPERTY 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-amber-300'
          }`}
          onClick={() => updateFormField('category', ListingCategory.PROPERTY)}
        >
          <div className="flex items-start">
            <input
              type="radio"
              id="property"
              name="category"
              value={ListingCategory.PROPERTY}
              checked={category === ListingCategory.PROPERTY}
              onChange={handleCategoryChange}
              className="mt-1"
            />
            <label htmlFor="property" className="ml-3 cursor-pointer">
              <div className="font-medium">Property</div>
              <p className="text-sm text-gray-600 mt-1">
                Residential, commercial, land, or industrial properties
              </p>
            </label>
          </div>
        </div>

        {/* Store */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            category === ListingCategory.STORE 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-amber-300'
          }`}
          onClick={() => updateFormField('category', ListingCategory.STORE)}
        >
          <div className="flex items-start">
            <input
              type="radio"
              id="store"
              name="category"
              value={ListingCategory.STORE}
              checked={category === ListingCategory.STORE}
              onChange={handleCategoryChange}
              className="mt-1"
            />
            <label htmlFor="store" className="ml-3 cursor-pointer">
              <div className="font-medium">Store</div>
              <p className="text-sm text-gray-600 mt-1">
                Retail, grocery, electronics, fashion, or other stores
              </p>
            </label>
          </div>
        </div>

        {/* Auto Dealership */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            category === ListingCategory.AUTO_DEALERSHIP 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-amber-300'
          }`}
          onClick={() => updateFormField('category', ListingCategory.AUTO_DEALERSHIP)}
        >
          <div className="flex items-start">
            <input
              type="radio"
              id="auto_dealership"
              name="category"
              value={ListingCategory.AUTO_DEALERSHIP}
              checked={category === ListingCategory.AUTO_DEALERSHIP}
              onChange={handleCategoryChange}
              className="mt-1"
            />
            <label htmlFor="auto_dealership" className="ml-3 cursor-pointer">
              <div className="font-medium">Auto Dealership</div>
              <p className="text-sm text-gray-600 mt-1">
                New or used vehicles, parts, or automotive services
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Subcategory selection */}
      {category && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Select Subcategory</h3>
          <select
            value={subcategory}
            onChange={handleSubcategoryChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select a subcategory</option>
            {SubcategoryMap[category as ListingCategory].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CategorySelection;
