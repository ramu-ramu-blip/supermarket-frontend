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
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/analytics');
                setStats(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Revenue', value: `₹${stats.today?.total || 0}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Total Invoices', value: stats.today?.count || 0, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Average Sale', value: `₹${stats.today?.count ? (stats.today.total / stats.today.count).toFixed(2) : 0}`, icon: ArrowUpRight, color: 'text-violet-600', bg: 'bg-violet-50' },
        { title: 'Total Tax', value: `₹${stats.today?.gst || 0}`, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
                    <p className="text-slate-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchExpiringProducts}
                    className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95"
                >
                    <AlertCircle size={20} />
                    Expiry Alerts
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-card p-6 flex items-start justify-between group hover:border-primary transition-all duration-300">
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-2xl font-bold mt-2 text-slate-900">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Today's Sales Breakdown</h3>
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
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${item.color} text-white shadow-sm`}>
                                            <item.icon size={18} />
                                        </div>
                                        <span className="font-semibold text-slate-700">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">₹{value}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Top Selling Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 border-b border-slate-100">Product Name</th>
                                    <th className="pb-4 border-b border-slate-100">Qty Sold</th>
                                    <th className="pb-4 border-b border-slate-100">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {stats.topProducts?.map((product, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50 transition-all">
                                        <td className="py-4 text-slate-900">{product._id}</td>
                                        <td className="py-4 text-slate-500">{product.totalQty}</td>
                                        <td className="py-4 font-bold text-emerald-600">₹{product.totalRev}</td>
                                    </tr>
                                ))}
                                {(!stats.topProducts || stats.topProducts.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="py-12 text-center text-slate-400 italic">No sales recorded yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Expiry Modal */}
            {showExpiryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <AlertCircle className="text-rose-500" />
                                    Expiry Alerts
                                </h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    Products expiring within 30 days
                                </p>
                            </div>
                            <button onClick={() => setShowExpiryModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-rose-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 bg-slate-50/50">
                            {expiringProducts.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="inline-flex p-6 bg-emerald-50 rounded-full text-emerald-500 mb-4">
                                        <Package size={40} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900">Good News!</h4>
                                    <p className="text-slate-500 font-medium">No products are expiring soon.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {expiringProducts.map(product => (
                                        <div key={product._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-bold border border-rose-100">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                                            {product.category}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-400">
                                                            Stock: <span className="text-slate-900 font-bold">{product.stockQuantity}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-rose-600 font-black text-sm uppercase tracking-wide">Expiring On</div>
                                                <div className="text-slate-900 font-bold text-lg">
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
