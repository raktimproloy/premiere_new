import React from 'react';

interface ServicePreferencesTooltipProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
}

const serviceOptions = [
  {
    id: 'full-management',
    label: 'Full Management',
    description: 'Complete property management including guest communication, cleaning coordination, maintenance, and 24/7 support.'
  },
  {
    id: 'stage-and-manage',
    label: 'Stage and Manage',
    description: 'Property staging for optimal presentation followed by ongoing management services.'
  },
  {
    id: 'custom-manage',
    label: 'Custom Manage',
    description: 'Tailored management services based on your specific needs and requirements.'
  }
];

export default function ServicePreferencesTooltip({ selectedServices, onChange }: ServicePreferencesTooltipProps) {
  const handleServiceToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      onChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onChange([...selectedServices, serviceId]);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Desired Services *</h4>
      <div className="space-y-3">
        {serviceOptions.map((service) => (
          <div key={service.id} className="relative group">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => handleServiceToggle(service.id)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-700">{service.label}</span>
              
              {/* Info icon */}
              <div className="relative">
                <svg 
                  className="w-4 h-4 text-gray-400 cursor-help" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                  {service.description}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
      
      {selectedServices.length === 0 && (
        <p className="text-sm text-red-500">Please select at least one service</p>
      )}
    </div>
  );
}

