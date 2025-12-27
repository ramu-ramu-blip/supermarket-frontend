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

import Landing from '../pages/Landing';

const MainLayout = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden selection:bg-primary/20 selection:text-primary">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
                    <Navbar onToggleTheme={toggleTheme} theme={theme} />
                </div>
                <main className="flex-1 p-8 overflow-hidden flex flex-col min-h-0 bg-[var(--background)]">
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
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);

export default router;
