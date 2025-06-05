import React from 'react';
import { useWizard } from '../WizardContext';

const ContactInfo: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { location, phone, email, website } = formState;

  // Simple validation functions
  const isValidEmail = (email: string) => {
    return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return phone === '' || /^[\d\s+()-]{7,15}$/.test(phone);
  };

  const isValidWebsite = (website: string) => {
    return website === '' || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(website);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <p className="text-gray-600 mb-6">
          Provide contact details for your listing. Location is required, other fields are optional.
        </p>
      </div>

      <div className="space-y-4">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => updateFormField('location', e.target.value)}
            placeholder="Enter your business address or location"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
          {!location && (
            <p className="mt-1 text-sm text-red-600">
              Location is required
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => updateFormField('phone', e.target.value)}
            placeholder="Enter your phone number (optional)"
            className={`w-full p-3 border ${!isValidPhone(phone) ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
          />
          {!isValidPhone(phone) && phone !== '' && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid phone number
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => updateFormField('email', e.target.value)}
            placeholder="Enter your email address (optional)"
            className={`w-full p-3 border ${!isValidEmail(email) ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
          />
          {!isValidEmail(email) && email !== '' && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => updateFormField('website', e.target.value)}
            placeholder="Enter your website URL (optional)"
            className={`w-full p-3 border ${!isValidWebsite(website) ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
          />
          {!isValidWebsite(website) && website !== '' && (
            <p className="mt-1 text-sm text-red-600">
              Please enter a valid website URL
            </p>
          )}
        </div>

        {/* Privacy note */}
        <div className="bg-gray-50 p-4 rounded-md mt-4">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Privacy Note:</h3>
          <p className="text-sm text-gray-600">
            Your contact information will be visible to users browsing your listing. 
            Only provide information you're comfortable sharing publicly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
