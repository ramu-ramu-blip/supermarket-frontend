import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, CreditCard, Calendar, Filter, IndianRupee, Layers, ArrowUpRight, Package, Plus, X, Receipt } from 'lucide-react';
import { endpoints } from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ reason: '', amount: '', date: new Date().toISOString().split('T')[0] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        groupBy: 'Daily'
    });

    const fetchAnalytics = async () => {
        try {
            const { data } = await endpoints.getAnalytics(filters);
            setData(data);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
            toast.error('Failed to load analytics data');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!expenseForm.reason || !expenseForm.amount) {
            return toast.error('Please fill all required fields');
        }

        setIsSubmitting(true);
        try {
            await endpoints.addExpense(expenseForm);
            toast.success('Expense added successfully');
            setShowExpenseModal(false);
            setExpenseForm({ reason: '', amount: '', date: new Date().toISOString().split('T')[0] });
            fetchAnalytics(); // Refresh data
        } catch (err) {
            toast.error('Failed to add expense');
        } finally {
            setIsSubmitting(false);
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
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[16px] md:text-[14px] font-black text-[var(--foreground)] tracking-tight">Sales Reports</h2>
                    <p className="text-[var(--muted)] font-bold mt-1 uppercase text-xs tracking-widest opacity-70">Analyze your business performance</p>
                </div>
                <button
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95 uppercase text-xs tracking-widest"
                >
                    <Plus size={18} />
                    Add Expense
                </button>
            </div>

            {/* Filters Row */}
            <div className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors duration-300">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Start Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">Group By</label>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                        <select
                            value={filters.groupBy}
                            onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                            className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
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
                    { label: 'Total Expenses', val: `₹${data.range.expenses?.toLocaleString() || '0'}`, icon: ShoppingBag, color: 'bg-rose-500' },
                    { label: 'Net Profit', val: `₹${data.range.netProfit?.toLocaleString() || '0'}`, icon: TrendingUp, color: 'bg-blue-500' },
                    { label: 'Total Invoices', val: data.range.count, icon: Calendar, color: 'bg-violet-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card)] p-6 rounded-[32px] border border-[var(--border)] shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-[var(--foreground)]">{stat.val}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Report Breakdown */}
            <div className="bg-[var(--card)] rounded-[32px] border-2 border-primary/20 p-8 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[14px] font-black text-[var(--foreground)] tracking-tight">Day Sales Report ({new Date(data.dayReport.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})</h3>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Day Expenses</p>
                            <p className="text-sm font-black text-rose-500">₹{data.dayReport.expenses?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Day Profit</p>
                            <p className="text-sm font-black text-emerald-500">₹{(data.dayReport.total - (data.dayReport.expenses || 0)).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Sales', val: `₹${data.dayReport.total.toLocaleString()}`, color: 'bg-[var(--input)] text-[var(--secondary)]' },
                        { label: 'Cash', val: `₹${getPaymentTotal('Cash').toLocaleString()}`, color: 'bg-emerald-500/10 text-emerald-500' },
                        { label: 'UPI', val: `₹${getPaymentTotal('UPI').toLocaleString()}`, color: 'bg-blue-500/10 text-blue-500' },
                        { label: 'Card', val: `₹${getPaymentTotal('Card').toLocaleString()}`, color: 'bg-violet-500/10 text-violet-500' },
                        { label: 'Other', val: `₹${getPaymentTotal('Other').toLocaleString()}`, color: 'bg-amber-500/10 text-amber-500' },
                    ].map((item, i) => (
                        <div key={i} className={`${item.color} p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 border border-transparent hover:border-current/10 transition-all`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.label}</p>
                            <p className="text-xl font-black">{item.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-[var(--card)] p-8 rounded-[40px] border border-[var(--border)] shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight">Financial Trends</h3>
                        <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Revenue vs Expenses over time</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Revenue
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div> Expenses
                        </div>
                    </div>
                </div>
                <div className="h-[300px] -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }} />
                            <Tooltip
                                cursor={{ fill: 'var(--input)' }}
                                contentStyle={{ borderRadius: '24px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px', fontWeight: 800 }}
                                itemStyle={{ padding: '4px 0' }}
                                labelStyle={{ color: 'var(--foreground)', marginBottom: '8px' }}
                            />
                            <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
                            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-[var(--card)] rounded-[40px] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight uppercase">Recent Expenses</h3>
                        <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1">Detailed list for the selected period</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--input)]">
                            <tr className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest border-b border-[var(--border)]">
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Description/Reason</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {data.expenses && data.expenses.length > 0 ? data.expenses.map((exp) => (
                                <tr key={exp._id} className="hover:bg-[var(--input)]/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-[var(--secondary)]">
                                            {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black text-[var(--foreground)]">{exp.reason}</div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="text-sm font-black text-rose-500">₹{exp.amount.toLocaleString()}</div>
                                    </td>
                                </tr>
                            )) : <tr>
                                <td colSpan="3" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Receipt size={40} className="mb-4 text-[var(--muted)]" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">No expenses recorded for this period</p>
                                    </div>
                                </td>
                            </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                        <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)] z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                                    <Receipt size={24} />
                                </div>
                                <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase">Record Expense</h3>
                            </div>
                            <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-[var(--input)] rounded-full transition-all text-[var(--muted)] hover:text-rose-500">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddExpense} className="p-8 space-y-6 bg-[var(--background)]/50">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Expense Reason</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. Electricity, Rent, Supplies"
                                        className="w-full px-5 py-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-[var(--foreground)] font-bold transition-all placeholder:text-[var(--muted)]"
                                        value={expenseForm.reason}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, reason: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Amount (₹)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-[var(--foreground)] font-bold transition-all placeholder:text-[var(--muted)]"
                                                value={expenseForm.amount}
                                                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-[var(--foreground)] font-bold transition-all"
                                            value={expenseForm.date}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="flex-1 py-4 text-[var(--secondary)] bg-[var(--input)] border border-[var(--border)] font-black rounded-2xl hover:bg-[var(--background)] transition-all uppercase text-xs tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-3 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 active:scale-95 uppercase text-xs tracking-widest disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Recording...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
