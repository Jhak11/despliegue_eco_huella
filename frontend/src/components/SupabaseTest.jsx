import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

const SupabaseTest = () => {
    const [status, setStatus] = useState('Checking connection...');
    const [error, setError] = useState(null);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Check if variables are loaded
                const url = import.meta.env.VITE_SUPABASE_URL;
                const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

                setConfig({
                    url: url ? 'Loaded (Hidden)' : 'Missing',
                    key: key ? 'Loaded (Hidden)' : 'Missing'
                });

                if (!url || !key) {
                    throw new Error('Environment variables missing.');
                }

                // Try to reach Supabase Auth (does not require login, just checks connectivity)
                const { data, error } = await supabase.auth.getSession();

                if (error) throw error;

                setStatus('✅ Connected to Supabase successfully!');
            } catch (err) {
                console.error('Supabase Connection Error:', err);
                setStatus('❌ Connection Failed');
                setError(err.message);
            }
        };

        checkConnection();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#1e1e1e', color: 'white', minHeight: '100vh' }}>
            <h1>Supabase Connection Status</h1>

            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
                <h2>Status: {status}</h2>
                {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Configuration Check:</h3>
                <pre style={{ background: '#333', padding: '10px', borderRadius: '5px' }}>
                    {JSON.stringify(config, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '20px' }}>
                <p>If you see "Connected", your frontend is ready to use Supabase.</p>
                <a href="/" style={{ color: '#4dabf7' }}>Return to Home</a>
            </div>
        </div>
    );
};

export default SupabaseTest;
