import React, { useState } from 'react';
import { useWizard } from '../WizardContext';
import type { Service } from '../../../../../types/listings';

const ServicesStep: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { services } = formState;

  // Local state for new service form
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    description: '',
    price: undefined
  });
  const [error, setError] = useState<string | null>(null);

  // Handle adding a new service
  const handleAddService = () => {
    if (!newService.name.trim()) {
      setError('Service name is required');
      return;
    }

    // Add the new service to the list
    const updatedServices = [...services, { ...newService }];
    updateFormField('services', updatedServices);

    // Reset the form
    setNewService({
      name: '',
      description: '',
      price: undefined
    });
    setError(null);
  };

  // Handle removing a service
  const handleRemoveService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    updateFormField('services', updatedServices);
  };

  // Handle editing a service
  const handleEditService = (index: number, field: keyof Service, value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    updateFormField('services', updatedServices);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
        <p className="text-gray-600 mb-6">
          Add the services you offer. Include a name, optional description, and optional price for each service.
        </p>
      </div>

      {/* Add new service form */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium mb-3">Add a Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="serviceName"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              placeholder="e.g., Haircut, Consultation"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              id="serviceDescription"
              value={newService.description || ''}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="Brief description"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Price (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="servicePrice"
                value={newService.price || ''}
                onChange={(e) => setNewService({ ...newService, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddService}
            className="px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-black hover:text-amber-500"
          >
            Add Service
          </button>
        </div>
      </div>

      {/* Services list */}
      {services.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Your Services</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleEditService(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={service.description || ''}
                        onChange={(e) => handleEditService(index, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={service.price || ''}
                          onChange={(e) => handleEditService(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                          min="0"
                          step="0.01"
                          className="w-full p-2 pl-7 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-md text-center">
          <p className="text-gray-500">No services added yet. Add your first service above.</p>
        </div>
      )}

      {/* Tip */}
      <div className="bg-blue-50 p-4 rounded-md mt-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips:</h3>
        <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Be specific about what each service includes</li>
          <li>If prices vary, you can mention "Starting at $X" in the description</li>
          <li>Consider grouping related services together</li>
        </ul>
      </div>
    </div>
  );
};

export default ServicesStep;
