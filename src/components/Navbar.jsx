import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        setUserInfo(JSON.parse(localStorage.getItem('userInfo') || '{}'));
    }, [showProfileModal]);
    return (
        <header className="h-20 flex items-center justify-between px-8 bg-transparent">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 placeholder:text-slate-500"
                />
            </div>

            <div className="flex items-center gap-6">


                <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-4 pl-6 border-l border-slate-200 hover:bg-slate-50 transition-all rounded-l-xl p-2 cursor-pointer"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-900 leading-none">{userInfo?.name || 'Admin User'}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">{userInfo?.supermarketName || 'Store Manager'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 shadow-sm">
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
