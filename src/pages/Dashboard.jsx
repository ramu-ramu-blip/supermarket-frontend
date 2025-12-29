import { useState, useEffect } from 'react';
import {
    IndianRupee,
    Layers,
    ArrowUpRight,
    AlertCircle,
    ShoppingCart,
    CreditCard,
    Smartphone,
    Wallet,
    X,
    Calendar,
    Package,
    ChevronRight,
    ArrowRight,
    History
} from 'lucide-react';

import { Link } from 'react-router-dom';
import api from '../services/api';


const Dashboard = () => {
    const [stats, setStats] = useState({
        today: { total: 0, count: 0, gst: 0 },
        topProducts: []
    });
    const [showExpiryModal, setShowExpiryModal] = useState(false);
    const [expiringProducts, setExpiringProducts] = useState([]);

    const fetchExpiringProducts = async () => {
        try {
            const { data } = await api.get('/products/expiring');
            setExpiringProducts(data);
            setShowExpiryModal(true);
        } catch (error) {
            console.error('Error fetching expiring products:', error);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, expiryRes] = await Promise.all([
                    api.get('/analytics'),
                    api.get('/products/expiring')
                ]);
                setStats(statsRes.data);
                setExpiringProducts(expiryRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
        fetchDashboardData();
    }, []);

    const cards = [
        { title: 'Today Revenue', value: `₹${stats.today?.total || 0}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },

        { title: 'Average Sale', value: `₹${stats.today?.count ? (stats.today.total / stats.today.count).toFixed(2) : 0}`, icon: ArrowUpRight, color: 'text-violet-600', bg: 'bg-violet-50' },
        { title: 'Total Tax', value: `₹${stats.today?.gst || 0}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="h-full overflow-y-auto pr-0 md:pr-2 custom-scrollbar space-y-6 md:space-y-8 animate-in fade-in duration-500 selection:bg-primary/20 selection:text-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[14px] md:text-[14px] font-black text-[var(--foreground)] uppercase tracking-tight">Dashboard</h2>
                    <p className="text-[var(--secondary)] mt-1 font-bold uppercase text-[9px] md:text-[10px] tracking-widest hidden sm:block">Welcome back, here's what's happening today.</p>
                </div>
                <button
                    onClick={() => setShowExpiryModal(true)}
                    className="w-full sm:w-auto px-4 md:px-6 py-2.5 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 uppercase text-[9px] md:text-[10px] tracking-widest"
                >
                    <div className="relative">
                        <AlertCircle size={18} md:size={20} />
                        {expiringProducts.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-white text-rose-600 text-[8px] md:text-[10px] font-black w-4 md:h-5 md:w-5 h-4 rounded-full flex items-center justify-center border-2 border-rose-500 shadow-sm">
                                {expiringProducts.length}
                            </span>
                        )}
                    </div>
                    Expiry Alerts
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-card p-5 md:p-6 flex items-start justify-between group hover:border-primary transition-all duration-300 cursor-default">
                        <div>
                            <p className="text-[var(--muted)] text-[9px] md:text-[10px] font-black uppercase tracking-widest">{card.title}</p>
                            <h3 className="text-xl md:text-2xl font-black mt-2 text-[var(--foreground)]">{card.value}</h3>
                        </div>
                        <div className={`p-2.5 md:p-3 rounded-[10px] ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                            <card.icon size={22} md:size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="glass-card p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h3 className="text-base md:text-lg font-black text-[var(--foreground)] uppercase tracking-tight font-sans flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            Expiry Alerts
                        </h3>
                        <Link to="/products" className="text-[var(--secondary)] hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto -mx-2 px-2 custom-scrollbar">
                        <table className="w-full text-left min-w-[400px]">
                            <thead className="text-[var(--muted)] text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 border-b border-[var(--border)]">Product</th>
                                    <th className="pb-4 border-b border-[var(--border)]">Category</th>
                                    <th className="pb-4 border-b border-[var(--border)] text-right">Expiry</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {expiringProducts.slice(0, 5).map((product, idx) => (
                                    <tr key={idx} className="group hover:bg-[var(--input)] transition-all">
                                        <td className="py-4 md:py-5">
                                            <div className="text-[var(--foreground)] text-xs md:text-sm">{product.name}</div>
                                            <div className="text-[var(--muted)] text-[10px] font-medium">Stock: {product.stockQuantity}</div>
                                        </td>
                                        <td className="py-4 md:py-5">
                                            <span className="px-2 py-0.5 rounded-md bg-[var(--input)] text-[var(--muted)] text-[8px] md:text-[10px] font-black uppercase tracking-wider border border-[var(--border)]">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="py-4 md:py-5 text-rose-500 text-right text-xs md:text-sm">
                                            {new Date(product.expiryDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!expiringProducts || expiringProducts.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="py-12 md:py-16 text-center text-[var(--muted)] italic text-sm">No expiry alerts</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div className="glass-card p-6 rounded-[8px] md:p-8">
                    <h3 className="text-base md:text-lg font-black text-[var(--foreground)] mb-6 md:mb-8 uppercase tracking-tight font-sans">Top Selling Items</h3>
                    <div className="overflow-x-auto -mx-2 px-2 custom-scrollbar">
                        <table className="w-full text-left min-w-[400px]">
                            <thead className="text-[var(--muted)] text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 border-b border-[var(--border)]">Product Name</th>
                                    <th className="pb-4 border-b border-[var(--border)] px-4">Qty Sold</th>
                                    <th className="pb-4 border-b border-[var(--border)] text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {stats.topProducts?.map((product, idx) => (
                                    <tr key={idx} className="group hover:bg-[var(--input)] transition-all">
                                        <td className="py-4 md:py-5 text-[var(--foreground)] text-xs md:text-sm">{product._id}</td>
                                        <td className="py-4 md:py-5 text-[var(--secondary)] text-xs md:text-sm px-4">{product.totalQty}</td>
                                        <td className="py-4 md:py-5 font-black text-emerald-500 text-right text-xs md:text-sm">₹{product.totalRev.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(!stats.topProducts || stats.topProducts.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="py-12 md:py-16 text-center text-[var(--muted)] italic text-sm">No sales recorded yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Buttons Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/products"
                    className="glass-card p-6 flex items-center justify-between group hover:border-primary transition-all duration-300 bg-gradient-to-r from-[var(--card)] to-[var(--input)]"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                            <Package size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-[var(--foreground)] uppercase tracking-tight">products</h4>
                            <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest mt-0.5">Add, edit and track all products</p>
                        </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--input)] text-[var(--muted)] transition-all group-hover:bg-primary group-hover:text-white group-hover:translate-x-1">
                        <ArrowRight size={20} />
                    </div>
                </Link>

                <Link
                    to="/analytics"
                    className="glass-card p-6 flex items-center justify-between group hover:border-violet-500 transition-all duration-300 bg-gradient-to-r from-[var(--card)] to-[var(--input)]"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500 transition-transform group-hover:scale-110">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-[var(--foreground)] uppercase tracking-tight">Detailed Analytics</h4>
                            <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest mt-0.5">Explore sales trends and reports</p>
                        </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--input)] text-[var(--muted)] transition-all group-hover:bg-violet-500 group-hover:text-white group-hover:translate-x-1">
                        <ArrowRight size={20} />
                    </div>
                </Link>

                <Link
                    to="/transactions"
                    className="glass-card p-6 flex items-center justify-between group hover:border-emerald-500 transition-all duration-300 bg-gradient-to-r from-[var(--card)] to-[var(--input)]"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                            <History size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-[var(--foreground)] uppercase tracking-tight">Recent Transactions</h4>
                            <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest mt-0.5">View and manage past invoices</p>
                        </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--input)] text-[var(--muted)] transition-all group-hover:bg-emerald-500 group-hover:text-white group-hover:translate-x-1">
                        <ArrowRight size={20} />
                    </div>
                </Link>
            </div>



            {/* Expiry Modal */}
            {showExpiryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-2xl rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)] z-10 transition-colors duration-300">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2 transition-colors duration-300">
                                    <AlertCircle className="text-rose-500" size={20} md:size={24} />
                                    Expiry Alerts
                                </h3>
                                <p className="text-[var(--muted)] text-[9px] md:text-xs font-black uppercase tracking-widest mt-1 transition-colors duration-300">
                                    Products expiring within 30 days
                                </p>
                            </div>
                            <button onClick={() => setShowExpiryModal(false)} className="p-2 hover:bg-[var(--input)] rounded-full transition-all text-[var(--muted)] hover:text-rose-500">
                                <X size={20} md:size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 md:p-6 bg-[var(--background)] transition-colors duration-300 custom-scrollbar">
                            {expiringProducts.length === 0 ? (
                                <div className="text-center py-16 md:py-20">
                                    <div className="inline-flex p-4 md:p-6 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 border border-emerald-500/20">
                                        <Package size={32} md:size={40} />
                                    </div>
                                    <h4 className="text-base md:text-lg font-bold text-[var(--foreground)]">Good News!</h4>
                                    <p className="text-[var(--muted)] text-sm font-medium">No products are expiring soon.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 md:gap-4">
                                    {expiringProducts.map(product => (
                                        <div key={product._id} className="bg-[var(--card)] p-4 md:p-5 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-rose-500/50 transition-all">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20 shrink-0">
                                                    <Calendar size={18} md:size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-[var(--foreground)] text-base md:text-lg truncate transition-colors duration-300">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 rounded-md bg-[var(--input)] text-[var(--muted)] text-[8px] md:text-[10px] font-black uppercase tracking-wider border border-[var(--border)] transition-colors duration-300">
                                                            {product.category}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs font-medium text-[var(--muted)] transition-colors duration-300">
                                                            Stock: <span className="text-[var(--foreground)] font-bold">{product.stockQuantity}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border)] flex sm:flex-col justify-between items-center sm:items-end">
                                                <div className="text-rose-500 font-black text-[10px] md:text-sm uppercase tracking-wide">Expiring On</div>
                                                <div className="text-[var(--foreground)] font-bold text-sm md:text-lg transition-colors duration-300">
                                                    {new Date(product.expiryDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
