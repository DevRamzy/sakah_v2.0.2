import React from 'react';
import { useWizard } from '../WizardContext';
import type { BusinessHours as BusinessHoursType } from '../../../../../types/listings';

const BusinessHours: React.FC = () => {
  const { formState, updateFormField } = useWizard();
  const { businessHours } = formState;

  const handleHoursChange = (index: number, field: keyof BusinessHoursType, value: any) => {
    const updatedHours = [...businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };

    // If marked as closed, clear the times
    if (field === 'isClosed' && value === true) {
      updatedHours[index].openTime = null;
      updatedHours[index].closeTime = null;
    }

    updateFormField('businessHours', updatedHours);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
        <p className="text-gray-600 mb-6">
          Set your regular operating hours. This helps customers know when they can visit or contact you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessHours.map((hours, index) => (
                <tr key={hours.day}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {hours.day}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="time"
                      value={hours.openTime || ''}
                      onChange={(e) => handleHoursChange(index, 'openTime', e.target.value)}
                      disabled={hours.isClosed}
                      className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        hours.isClosed ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="time"
                      value={hours.closeTime || ''}
                      onChange={(e) => handleHoursChange(index, 'closeTime', e.target.value)}
                      disabled={hours.isClosed}
                      className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                        hours.isClosed ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`closed-${hours.day}`}
                        checked={hours.isClosed}
                        onChange={(e) => handleHoursChange(index, 'isClosed', e.target.checked)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`closed-${hours.day}`} className="ml-2 block text-sm text-gray-900">
                        Closed
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              const updatedHours = businessHours.map(day => ({
                ...day,
                openTime: '09:00',
                closeTime: '17:00',
                isClosed: false
              }));
              // Keep Sunday closed
              updatedHours[6] = { ...updatedHours[6], isClosed: true, openTime: '', closeTime: '' };
              updateFormField('businessHours', updatedHours);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Set 9-5 Weekdays
          </button>
          <button
            type="button"
            onClick={() => {
              const updatedHours = businessHours.map(day => ({
                ...day,
                isClosed: true,
                openTime: null,
                closeTime: null
              }));
              updateFormField('businessHours', updatedHours);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close All Days
          </button>
          <button
            type="button"
            onClick={() => {
              const updatedHours = businessHours.map(day => ({
                ...day,
                openTime: '00:00',
                closeTime: '23:59',
                isClosed: false
              }));
              updateFormField('businessHours', updatedHours);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Open 24/7
          </button>
        </div>

        {/* Validation message */}
        {businessHours.some(hour => !hour.isClosed && (!hour.openTime || !hour.closeTime)) && (
          <p className="mt-2 text-sm text-amber-600">
            Please set both open and close times for all open days.
          </p>
        )}

        {/* Note */}
        <div className="bg-gray-50 p-4 rounded-md mt-4">
          <p className="text-sm text-gray-600">
            Tip: If your business has irregular hours or seasonal changes, you can mention this in your business description.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessHours;
