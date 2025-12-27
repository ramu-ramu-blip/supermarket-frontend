import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, MapPin, Phone, Building2, TicketCheck, Save, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        supermarketName: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setFormData({
            name: userInfo.name || '',
            email: userInfo.email || '',
            address: userInfo.address || '',
            phone: userInfo.phone || '',
            supermarketName: userInfo.supermarketName || '',
            password: '',
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.put('/auth/profile', formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Profile Updated Successfully');
            if (onUpdate) onUpdate(data);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-primary/10 text-primary rounded-xl"><User size={20} /></span>
                        Edit Profile
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                name="supermarketName"
                                value={formData.supermarketName}
                                onChange={handleChange}
                                placeholder="Enter Store Name"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <TicketCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Contact No"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Store Address"
                                rows="2"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 uppercase tracking-widest text-xs"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ProfileModal;
