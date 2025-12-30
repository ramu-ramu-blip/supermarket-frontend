import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes/route';

function App() {
    // Theme logic removed
    
    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#283618',
                        borderRadius: '16px',
                        border: '1px solid #dda15e',
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
