import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes/route';

function App() {
    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#0f172a',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
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
