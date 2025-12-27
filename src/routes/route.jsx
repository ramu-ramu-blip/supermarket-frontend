import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Billing from '../pages/Billing';
import Analytics from '../pages/Analytics';
import Transactions from '../pages/Transactions';
import Login from '../pages/Login';

const MainLayout = () => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
                    <Navbar />
                </div>
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'products',
                element: <Products />,
            },
            {
                path: 'billing',
                element: <Billing />,
            },
            {
                path: 'analytics',
                element: <Analytics />,
            },
            {
                path: 'transactions',
                element: <Transactions />,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);

export default router;
