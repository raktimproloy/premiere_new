import { useState, useEffect } from 'react';

interface MainSettings {
    phone: string;
    email: string;
    address: string;
    facebook: string;
    x: string;
    instagram: string;
    youtube: string;
}

export const useMainSettings = () => {
    const [settings, setSettings] = useState<MainSettings>({
        phone: '',
        email: '',
        address: '',
        facebook: '',
        x: '',
        instagram: '',
        youtube: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('/api/page-settings/main/public');
                if (!response.ok) {
                    throw new Error('Failed to fetch main settings');
                }
                
                const result = await response.json();
                if (result.success) {
                    setSettings(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch main settings');
                }
            } catch (err) {
                console.error('Error fetching main settings:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch main settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
};
