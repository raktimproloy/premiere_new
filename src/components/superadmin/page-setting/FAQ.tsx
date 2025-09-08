import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: 'property' | 'booking';
}

export default function FAQ() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Load data on component mount
    useEffect(() => {
        loadFAQsSettings();
    }, []);

    const loadFAQsSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/faqs');
            const result = await response.json();
            
            if (result.success) {
                setFaqs(result.data.faqs || []);
            }
        } catch (error) {
            console.error('Error loading FAQs settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveFAQsSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/faqs', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    faqs
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('FAQs saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving FAQs');
            }
        } catch (error) {
            console.error('Error saving FAQs settings:', error);
            setMessage('Error saving FAQs');
        } finally {
            setSaving(false);
        }
    };

    const addFAQ = () => {
        const newFAQ: FAQ = {
            id: Date.now().toString(),
            question: '',
            answer: '',
            category: 'property'
        };
        setFaqs([...faqs, newFAQ]);
    };
    
    const updateFAQ = (id: string, field: keyof FAQ, value: string) => {
        setFaqs(faqs.map(faq => 
            faq.id === id ? { ...faq, [field]: value } : faq
        ));
    };
    
    const removeFAQ = (id: string) => {
        setFaqs(faqs.filter(faq => faq.id !== id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading FAQs...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">FAQ Management</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveFAQsSettings}
                        disabled={saving}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save All FAQs'
                        )}
                    </button>
                    <button
                        onClick={addFAQ}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add FAQ
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
                {faqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <select
                                    value={faq.category}
                                    onChange={(e) => updateFAQ(faq.id, 'category', e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    <option value="property">Property Management</option>
                                    <option value="booking">Booking</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Question"
                                    value={faq.question}
                                    onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                                    className="w-96 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => removeFAQ(faq.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Answer
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Enter FAQ answer..."
                                value={faq.answer}
                                onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-vertical"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {faqs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No FAQs added yet</p>
                    <p className="text-sm">Click "Add FAQ" to create your first FAQ</p>
                </div>
            )}
        </div>
    )
}
