import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { WizardContextType } from '../../../../types/listings';
import { useListingForm } from '../../hooks/useListingForm';

// Create the context
const WizardContext = createContext<WizardContextType | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
  existingListingId?: string;
}

// Provider component
export const WizardProvider: React.FC<WizardProviderProps> = ({ 
  children, 
  existingListingId 
}) => {
  const {
    formState,
    updateFormField,
    nextStep,
    prevStep,
    goToStep,
    isStepComplete,
    resetForm,
    saveListing,
    isLoading,
    error
  } = useListingForm({ existingListingId });

  // Context value
  const value: WizardContextType = {
    formState,
    updateFormField,
    nextStep,
    prevStep,
    goToStep,
    isStepComplete,
    resetForm,
    saveListing,
    isLoading,
    error
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};

// Hook to use the wizard context
export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  
  return context;
};
