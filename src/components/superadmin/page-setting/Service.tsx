import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Service {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export default function Service() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Load data on component mount
    useEffect(() => {
        loadServicesSettings();
    }, []);

    const loadServicesSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/services');
            const result = await response.json();
            
            if (result.success) {
                setServices(result.data.services || []);
            }
        } catch (error) {
            console.error('Error loading services settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveServicesSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/services', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    services
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Services saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving services');
            }
        } catch (error) {
            console.error('Error saving services settings:', error);
            setMessage('Error saving services');
        } finally {
            setSaving(false);
        }
    };

    const addService = () => {
        const newService: Service = {
          id: Date.now().toString(),
          icon: '',
          title: '',
          description: ''
        };
        setServices([...services, newService]);
    };
    
    const updateService = (id: string, field: keyof Service, value: string) => {
        setServices(services.map(service => 
          service.id === id ? { ...service, [field]: value } : service
        ));
    };
    
    const removeService = (id: string) => {
        setServices(services.filter(service => service.id !== id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading services...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">Services</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveServicesSettings}
                        disabled={saving}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save All Services'
                        )}
                    </button>
                    <button
                        onClick={addService}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Service
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-md ${
                    message.includes('successfully') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message}
                </div>
            )}
            
            <div className="grid gap-6">
                {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Icon text (e.g., hotel, restaurant)"
                                    value={service.icon}
                                    onChange={(e) => updateService(service.id, 'icon', e.target.value)}
                                    className="w-32 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Service Title"
                                    value={service.title}
                                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                                    className="w-64 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => removeService(service.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Enter service description..."
                                value={service.description}
                                onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-vertical"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
