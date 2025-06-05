import React from 'react';
import { useWizard } from '../WizardContext';

const BasicInfo: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { businessName, description } = formState;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <p className="text-gray-600 mb-6">
          Provide the essential details about your listing.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => updateFormField('businessName', e.target.value)}
            placeholder="Enter your business name"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          {businessName && businessName.length < 3 && (
            <p className="mt-1 text-sm text-red-600">
              Business name must be at least 3 characters
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => updateFormField('description', e.target.value)}
            placeholder="Describe your business, property, or service"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          <div className="mt-1 flex justify-between">
            <p className={`text-sm ${description.length < 10 ? 'text-red-600' : 'text-gray-500'}`}>
              {description.length < 10 ? 'Description must be at least 10 characters' : 'Good description!'}
            </p>
            <p className="text-sm text-gray-500">
              {description.length}/500 characters
            </p>
          </div>
        </div>

        {/* Tips for good descriptions */}
        <div className="bg-blue-50 p-4 rounded-md mt-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Tips for a great description:</h3>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Be clear and concise about what you offer</li>
            <li>Highlight what makes your business unique</li>
            <li>Include important details that customers would want to know</li>
            <li>Avoid using all caps, excessive punctuation, or misleading information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
