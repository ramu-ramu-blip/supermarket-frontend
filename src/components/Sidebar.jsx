import { NavLink, useNavigate } from 'react-router-dom';
import {
    LogOut,
    ShoppingBag,
    LayoutDashboard,
    Package,
    ReceiptText,
    BarChart3,
    History
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { useState } from 'react';

const Sidebar = () => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Products', icon: Package, path: '/products' },
        { name: 'Billing', icon: ReceiptText, path: '/billing' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
        { name: 'Transactions', icon: History, path: '/transactions' },
    ];

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
            <div className="p-8 flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl shadow-md shadow-primary/20">
                    <ShoppingBag className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                    SuperMarket
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                    >
                        <div className={`
                            w-6 h-6 flex items-center justify-center transition-all duration-200
                            ${({ isActive }) => isActive ? 'scale-110' : 'group-hover:scale-110'}
                        `}>
                            <item.icon size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 font-medium"
                >
                    <span>Logout</span>
                </button>
            </div>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
                title="Logout"
                message="Are you sure you want to log out of the admin portal?"
                confirmText="Logout"
                isDangerous={true}
            />
        </aside >
    );
};

export default Sidebar;
