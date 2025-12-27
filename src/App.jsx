import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes/route';

function App() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);

        // Dispatch a custom event so other components (like those in RouterProvider) can listen if needed
        // Though passing via context or props is better. 
        // For now, MainLayout will still manage its own state but we'll try to sync or just rely on localStorage.
    }, [theme]);

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: theme === 'dark' ? '#1e293b' : '#ffffff',
                        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        borderRadius: '16px',
                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontWeight: '600',
                    },
                }}
            />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
