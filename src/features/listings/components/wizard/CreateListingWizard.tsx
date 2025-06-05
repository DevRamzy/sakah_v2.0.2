import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardProvider, useWizard } from './WizardContext';
import { ListingCategory } from '../../../../types/listings';

// Import step components
import {
  CategorySelection,
  BasicInfo,
  ContactInfo,
  BusinessHours,
  ServicesStep,
  PropertyStep,
  AutoDealershipStep,
  ImagesStep
} from './steps';

interface CreateListingWizardProps {
  existingListingId?: string;
}

// Wrapper component that provides the WizardContext
const CreateListingWizard: React.FC<CreateListingWizardProps> = ({ existingListingId }) => {
  return (
    <WizardProvider existingListingId={existingListingId}>
      <WizardContent />
    </WizardProvider>
  );
};

// The actual wizard content that uses the context
const WizardContent: React.FC = () => {
  const { 
    formState, 
    nextStep, 
    prevStep, 
    isStepComplete,
    isLoading,
    error
  } = useWizard();
  
  const navigate = useNavigate();
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Handle exit confirmation
  const handleExit = () => {
    if (formState.currentStep > 0) {
      setShowExitConfirmation(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
    navigate('/dashboard');
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  // Determine which steps to show based on the selected category
  const getSteps = () => {
    const steps = [
      { name: 'Category', component: <CategorySelection /> },
      { name: 'Basic Info', component: <BasicInfo /> },
      { name: 'Contact', component: <ContactInfo /> }
    ];

    // Only add business hours for services, stores, and auto dealerships
    if (formState.category !== ListingCategory.PROPERTY && formState.category !== '') {
      steps.push({ name: 'Hours', component: <BusinessHours /> });
    }

    // Determine if services step should be shown based on category
    const shouldShowServicesStep = () => {
      return formState.category === ListingCategory.SERVICES;
    };

    // Only add services step for services
    if (shouldShowServicesStep() && formState.category !== '') {
      steps.push({ name: 'Services', component: <ServicesStep /> });
    }

    // Add property details step for property listings
    if (formState.category === ListingCategory.PROPERTY) {
      steps.push({ name: 'Property Details', component: <PropertyStep /> });
    }

    // Add auto dealership details step for auto dealership listings
    if (formState.category === ListingCategory.AUTO_DEALERSHIP) {
      steps.push({ name: 'Dealership Details', component: <AutoDealershipStep /> });
    }

    // Always add images as the last step
    steps.push({ name: 'Images', component: <ImagesStep /> });

    return steps;
  };

  const steps = getSteps();

  // Ensure currentStep is within bounds
  const safeCurrentStep = Math.min(Math.max(0, formState.currentStep), steps.length - 1);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-amber-500 text-black px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Create Listing</h1>
          <button 
            onClick={handleExit}
            className="text-black hover:text-amber-700"
          >
            Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    safeCurrentStep === index 
                      ? 'bg-amber-500 text-black' 
                      : safeCurrentStep > index || isStepComplete(index)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {safeCurrentStep > index || isStepComplete(index) ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1">{step.name}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1 mb-6">
            <div 
              className="bg-amber-500 h-1" 
              style={{ width: `${((safeCurrentStep) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Current step content */}
        <div className="px-6 pb-6">
          {steps[safeCurrentStep] && steps[safeCurrentStep].component}  
        </div>

        {/* Navigation buttons */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <button
            onClick={prevStep}
            disabled={safeCurrentStep === 0}
            className={`px-4 py-2 rounded-md ${
              safeCurrentStep === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          {/* Only show Next/Finish button if not on the final Images step */}
          {safeCurrentStep < steps.length - 1 && (
            <button
              onClick={nextStep}
              disabled={!isStepComplete(safeCurrentStep) || isLoading}
              className={`px-4 py-2 rounded-md ${
                !isStepComplete(safeCurrentStep) || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 text-black hover:bg-black hover:text-amber-500'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Next'}
            </button>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Exit Wizard?</h3>
            <p className="text-gray-600 mb-6">
              Your progress will be lost if you exit now. Are you sure you want to cancel?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={handleCancelExit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                onClick={handleConfirmExit}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListingWizard;
