import React, { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import the rich text editor dynamically to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/common/Editor'), { ssr: false });

export default function Terms() {
    const [termsContent, setTermsContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [initialContentSet, setInitialContentSet] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    // Load data on component mount
    useEffect(() => {
        loadTermsSettings();
    }, []);

    const loadTermsSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/page-settings/terms');
            const result = await response.json();
            
            if (result.success) {
                setTermsContent(result.data.termsContent || '');
            }
        } catch (error) {
            console.error('Error loading terms settings:', error);
            setMessage('Error loading settings');
        } finally {
            setLoading(false);
        }
    };

    const saveTermsSettings = async () => {
        try {
            setSaving(true);
            setMessage('');
            
            const response = await fetch('/api/page-settings/terms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    termsContent
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setMessage('Terms & Conditions saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.message || 'Error saving terms & conditions');
            }
        } catch (error) {
            console.error('Error saving terms settings:', error);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleEditorChange = (value: string) => {
        setTermsContent(value);
    };

    // Set initial content in the editor when it's ready
    useEffect(() => {
        if (!initialContentSet && termsContent && editorRef.current) {
            // Find the Quill editor instance within the editor ref
            const quillEditor = editorRef.current.querySelector('.ql-editor');
            if (quillEditor) {
                quillEditor.innerHTML = termsContent;
                setInitialContentSet(true);
            }
        }
    }, [termsContent, initialContentSet]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading terms & conditions...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">Terms & Conditions</h2>
                <button 
                    onClick={saveTermsSettings}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Terms & Conditions'
                    )}
                </button>
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
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Terms & Conditions Content
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                        Use the rich text editor below to create and edit your terms & conditions. 
                        You can format text, add links, and structure your content as needed.
                    </p>
                </div>
                
                <div className="min-h-[500px]" ref={editorRef}>
                    <RichTextEditor 
                        onChange={handleEditorChange}
                    />
                </div>
            </div>
        </div>
    )
}
