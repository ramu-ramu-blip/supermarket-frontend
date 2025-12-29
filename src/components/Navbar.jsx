import { useState, useEffect } from 'react';
import { Bell, User, Sun, Moon, Menu, X, Zap } from 'lucide-react';


import { Link } from 'react-router-dom';

import ProfileModal from './ProfileModal';

const Navbar = ({ onToggleTheme, theme, onToggleSidebar, isSidebarOpen }) => {
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
                    className="p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--secondary)] hover:text-primary hover:border-primary transition-all active:scale-95 lg:hidden"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>


            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Quick Billing Button */}
                <Link
                    to="/billing"
                    className="flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 font-bold text-sm"
                >
                    <Zap size={18} fill="currentColor" />
                    <span className="hidden lg:block whitespace-nowrap uppercase tracking-wider">Quick Billing</span>
                </Link>

                {/* Theme Toggle */}

                <button
                    onClick={onToggleTheme}
                    className="p-2.5 rounded-xl bg-[var(--input)] border border-[var(--border)] text-[var(--secondary)] hover:text-primary hover:border-primary transition-all active:scale-95"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-3 md:gap-4 pl-3 md:pl-6 border-l border-[var(--border)] hover:bg-[var(--input)] transition-all rounded-r-xl md:rounded-l-xl p-2 cursor-pointer"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-[var(--foreground)] leading-none">{userInfo?.name || 'Admin User'}</p>
                        <p className="text-xs text-[var(--muted)] font-medium mt-1 uppercase tracking-wide">{userInfo?.supermarketName || 'Store Manager'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--input)] flex items-center justify-center border border-[var(--border)] text-[var(--secondary)] shadow-sm">
                        <User size={20} />
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
