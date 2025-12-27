import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, CreditCard, Calendar, Filter, IndianRupee, Layers, ArrowUpRight, Package } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        groupBy: 'Daily'
    });

    const fetchAnalytics = async () => {
        try {
            const { data } = await api.get('/analytics', { params: filters });
            setData(data);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    if (!data) return <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Business Metrics...</div>;

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

    // Helper to get payment total safely
    const getPaymentTotal = (mode) => {
        const found = data.dayReport.breakdown.find(b => b._id === mode);
        return found ? found.total : 0;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sales Reports</h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest opacity-70">Analyze your business performance</p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group By</label>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={filters.groupBy}
                            onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', val: `₹${data.range.total.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-500' },
                    { label: 'Total Invoices', val: data.range.count, icon: TrendingUp, color: 'bg-blue-500' },
                    { label: 'Average Sale', val: `₹${data.range.count ? (data.range.total / data.range.count).toFixed(2) : '0'}`, icon: Calendar, color: 'bg-violet-500' },
                    { label: 'Total Tax', val: `₹${data.range.gst.toLocaleString()}`, icon: Package, color: 'bg-orange-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Report Breakdown */}
            <div className="bg-white rounded-[32px] border-2 border-primary/20 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Day Sales Report ({new Date(data.dayReport.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Sales', val: `₹${data.dayReport.total.toLocaleString()}`, color: 'bg-slate-50 text-slate-600' },
                        { label: 'Cash', val: `₹${getPaymentTotal('Cash').toLocaleString()}`, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'UPI', val: `₹${getPaymentTotal('UPI').toLocaleString()}`, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Card', val: `₹${getPaymentTotal('Card').toLocaleString()}`, color: 'bg-violet-50 text-violet-600' },
                        { label: 'Other', val: `₹${getPaymentTotal('Other').toLocaleString()}`, color: 'bg-amber-50 text-amber-600' },
                    ].map((item, i) => (
                        <div key={i} className={`${item.color} p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 border border-transparent hover:border-current/10 transition-all`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.label}</p>
                            <p className="text-xl font-black">{item.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Sales Trend</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Revenue performance over time</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Revenue
                        </div>
                    </div>
                </div>
                <div className="h-[300px] -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="val" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
