import { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Billing from '../pages/Billing';
import Analytics from '../pages/Analytics';
import Transactions from '../pages/Transactions';
import Login from '../pages/Login';
import Suppliers from '../pages/Suppliers';

import Landing from '../pages/Landing';

const MainLayout = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    // theme state removed
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Theme effect removed

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden selection:bg-primary/20 selection:text-primary bg-[var(--background)]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0 relative">
                <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
                    <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                </div>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[var(--background)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Landing />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />,
            },
            {
                path: '/products',
                element: <Products />,
            },
            {
                path: '/billing',
                element: <Billing />,
            },
            {
                path: '/analytics',
                element: <Analytics />,
            },
            {
                path: '/transactions',
                element: <Transactions />,
            },
            {
                path: '/suppliers',
                element: <Suppliers />,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);

export default router;
