import { NavLink, useNavigate } from 'react-router-dom';
import {
    LogOut,
    ShoppingBag,
    LayoutDashboard,
    Package,
    ReceiptText,
    BarChart3,
    History,
    X
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
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
        setIsOpen(false);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 w-64 h-screen bg-[var(--card)] border-r border-[var(--border)] 
                    flex flex-col transition-all duration-300 z-50
                    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl shadow-md shadow-primary/20">
                            <ShoppingBag className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-[var(--foreground)] uppercase">
                            Super<span className="text-primary tracking-tighter">Pro</span>
                        </h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-[var(--muted)] hover:text-primary lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'sidebar-link-active'
                                    : 'text-[var(--secondary)] hover:bg-[var(--input)] hover:text-[var(--foreground)]'}
                            `}
                        >
                            <div className="w-6 h-6 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                                <item.icon size={20} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--border)]">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all group"
                    >
                        <LogOut size={20} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                        <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

            {showLogoutModal && (
                <ConfirmationModal
                    isOpen={showLogoutModal}
                    title="Confirm Logout"
                    message="Are you sure you want to log out of your account?"
                    confirmText="Logout"
                    onConfirm={handleLogoutConfirm}
                    onClose={() => setShowLogoutModal(false)}
                    isDangerous={true}
                />
            )}
        </>
    );
};

export default Sidebar;
