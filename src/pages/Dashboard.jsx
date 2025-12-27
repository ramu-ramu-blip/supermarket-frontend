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
    Package
} from 'lucide-react';
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
        { title: 'Total Revenue', value: `₹${stats.today?.total || 0}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Total Invoices', value: stats.today?.count || 0, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Average Sale', value: `₹${stats.today?.count ? (stats.today.total / stats.today.count).toFixed(2) : 0}`, icon: ArrowUpRight, color: 'text-violet-600', bg: 'bg-violet-50' },
        { title: 'Total Tax', value: `₹${stats.today?.gst || 0}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-8 animate-in fade-in duration-500 selection:bg-primary/20 selection:text-primary">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Dashboard</h2>
                    <p className="text-[var(--secondary)] mt-1 font-bold uppercase text-[10px] tracking-widest">Welcome back, here's what's happening today.</p>
                </div>
                <button
                    onClick={() => setShowExpiryModal(true)}
                    className="px-6 py-2.5 bg-rose-500 text-white font-black rounded-xl hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 uppercase text-[10px] tracking-widest"
                >
                    <div className="relative">
                        <AlertCircle size={20} />
                        {expiringProducts.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-white text-rose-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-rose-500 shadow-sm">
                                {expiringProducts.length}
                            </span>
                        )}
                    </div>
                    Expiry Alerts
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-card p-6 flex items-start justify-between group hover:border-primary transition-all duration-300 cursor-default">
                        <div>
                            <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">{card.title}</p>
                            <h3 className="text-2xl font-black mt-2 text-[var(--foreground)]">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                    <h3 className="text-lg font-black text-[var(--foreground)] mb-8 uppercase tracking-tight font-sans">Today's Sales Breakdown</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Cash', icon: Wallet, color: 'bg-emerald-500' },
                            { label: 'UPI', icon: Smartphone, color: 'bg-sky-500' },
                            { label: 'Card', icon: CreditCard, color: 'bg-blue-500' },
                            { label: 'Other', icon: ShoppingCart, color: 'bg-slate-500' },
                        ].map((item, idx) => {
                            const modeData = stats.dayReport?.breakdown?.find(b => b._id === item.label);
                            const value = modeData ? modeData.total : 0;
                            return (
                                <div key={idx} className="flex items-center justify-between p-5 bg-[var(--input)] rounded-2xl border border-[var(--border)] hover:border-primary/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${item.color} text-white shadow-sm transition-transform group-hover:rotate-6`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="font-black text-[var(--foreground)] uppercase text-xs tracking-wider">{item.label}</span>
                                    </div>
                                    <span className="font-black text-primary text-lg">₹{value.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h3 className="text-lg font-black text-[var(--foreground)] mb-8 uppercase tracking-tight font-sans">Top Selling Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 border-b border-[var(--border)]">Product Name</th>
                                    <th className="pb-4 border-b border-[var(--border)] px-4">Qty Sold</th>
                                    <th className="pb-4 border-b border-[var(--border)] text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold">
                                {stats.topProducts?.map((product, idx) => (
                                    <tr key={idx} className="group hover:bg-[var(--input)] transition-all">
                                        <td className="py-5 text-[var(--foreground)] text-sm">{product._id}</td>
                                        <td className="py-5 text-[var(--secondary)] text-sm px-4">{product.totalQty}</td>
                                        <td className="py-5 font-black text-emerald-500 text-right text-sm">₹{product.totalRev.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(!stats.topProducts || stats.topProducts.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="py-16 text-center text-[var(--muted)] italic text-sm">No sales recorded yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Expiry Modal */}
            {showExpiryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                        <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)] z-10 transition-colors duration-300">
                            <div>
                                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2 transition-colors duration-300">
                                    <AlertCircle className="text-rose-500" />
                                    Expiry Alerts
                                </h3>
                                <p className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest mt-1 transition-colors duration-300">
                                    Products expiring within 30 days
                                </p>
                            </div>
                            <button onClick={() => setShowExpiryModal(false)} className="p-2 hover:bg-[var(--input)] rounded-full transition-all text-[var(--muted)] hover:text-rose-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 bg-[var(--background)] transition-colors duration-300">
                            {expiringProducts.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="inline-flex p-6 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 border border-emerald-500/20">
                                        <Package size={40} />
                                    </div>
                                    <h4 className="text-lg font-bold text-[var(--foreground)]">Good News!</h4>
                                    <p className="text-[var(--muted)] font-medium">No products are expiring soon.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {expiringProducts.map(product => (
                                        <div key={product._id} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm flex items-center justify-between group hover:border-rose-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[var(--foreground)] text-lg transition-colors duration-300">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 rounded-md bg-[var(--input)] text-[var(--muted)] text-[10px] font-bold uppercase tracking-wider border border-[var(--border)] transition-colors duration-300">
                                                            {product.category}
                                                        </span>
                                                        <span className="text-xs font-medium text-[var(--muted)] transition-colors duration-300">
                                                            Stock: <span className="text-[var(--foreground)] font-bold">{product.stockQuantity}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-rose-500 font-black text-sm uppercase tracking-wide">Expiring On</div>
                                                <div className="text-[var(--foreground)] font-bold text-lg transition-colors duration-300">
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
