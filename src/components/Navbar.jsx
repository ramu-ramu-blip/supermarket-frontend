import { useState, useEffect } from 'react';
import { Bell, User, Sun, Moon, Menu, X, Zap } from 'lucide-react';


import { Link } from 'react-router-dom';

import ProfileModal from './ProfileModal';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        setUserInfo(JSON.parse(localStorage.getItem('userInfo') || '{}'));
    }, [showProfileModal]);

    return (
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-transparent transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2.5 rounded-xl bg-(--input) border border-(--border) text-(--muted) hover:text-primary hover:border-primary transition-all active:scale-95 lg:hidden"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>


            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Quick Billing Button */}
                <Link
                    to="/billing"
                    className="flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-(--primary-foreground) hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 font-bold text-sm"
                >
                    <Zap size={18} fill="currentColor" />
                    <span className="hidden lg:block whitespace-nowrap uppercase tracking-wider">Quick Billing</span>
                </Link>

                {/* Theme Toggle Removed */}

                <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-3 pl-3 md:pl-4 pr-1.5 py-1.5 bg-(--card) border border-(--border) rounded-full hover:border-primary hover:shadow-md transition-all group ml-2"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-xs md:text-sm font-bold text-(--foreground) leading-none group-hover:text-primary transition-colors">{userInfo?.name || 'Admin User'}</p>
                        <p className="text-[10px] text-(--muted) font-bold mt-0.5 uppercase tracking-wider">{userInfo?.supermarketName || 'Store Manager'}</p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-(--input) flex items-center justify-center text-(--muted) group-hover:text-primary group-hover:bg-primary/10 transition-all">
                        <User size={18} />
                    </div>
                </button>
            </div>

            {
                showProfileModal && (
                    <ProfileModal
                        onClose={() => setShowProfileModal(false)}
                        onUpdate={(updatedUser) => setUserInfo(updatedUser)}
                    />
                )
            }
        </header >
    );
};

export default Navbar;
