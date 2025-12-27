import { useState, useEffect } from 'react';
import { Search, Bell, User, Sun, Moon } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Navbar = ({ onToggleTheme, theme }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        setUserInfo(JSON.parse(localStorage.getItem('userInfo') || '{}'));
    }, [showProfileModal]);

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-transparent">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
            </div>

            <div className="flex items-center gap-6">
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
                    className="flex items-center gap-4 pl-6 border-l border-[var(--border)] hover:bg-[var(--input)] transition-all rounded-l-xl p-2 cursor-pointer"
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
