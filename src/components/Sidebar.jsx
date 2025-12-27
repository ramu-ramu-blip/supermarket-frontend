import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    History,
    LogOut,
    ShoppingBag
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Products', icon: Package, path: '/products' },
        { name: 'Billing', icon: ShoppingCart, path: '/billing' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics' },
        { name: 'Transactions', icon: History, path: '/transactions' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
            <div className="p-8 flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl shadow-md shadow-primary/20">
                    <ShoppingBag className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    SUPERBILL
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                        `}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
