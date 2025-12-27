// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ShoppingBag, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
// import api from '../services/api';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         try {
//             const { data } = await api.post('/auth/login', { email, password });
//             localStorage.setItem('token', data.token);
//             window.location.href = '/'; // Refresh to trigger layout change
//         } catch (err) {
//             setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
//             {/* Soft decorative gradients */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
//                 <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full"></div>
//             </div>

//             <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
//                 <div className="text-center mb-10">
//                     <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-primary/10 border border-slate-100 mb-6">
//                         <ShoppingBag className="text-primary w-10 h-10" />
//                     </div>
//                     <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Welcome Back</h1>
//                     <p className="text-slate-500 font-medium">Supermarket Billing System Admin Portal</p>
//                 </div>

//                 <div className="glass-card p-8 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {error && (
//                             <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center font-bold">
//                                 {error}
//                             </div>
//                         )}

//                         <div className="space-y-2">
//                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
//                             <div className="relative group">
//                                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
//                                 <input
//                                     type="email"
//                                     required
//                                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 font-medium"
//                                     placeholder="admin@superbill.com"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
//                             <div className="relative group">
//                                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
//                                 <input
//                                     type="password"
//                                     required
//                                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 font-medium"
//                                     placeholder="••••••••"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                 />
//                             </div>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/30"
//                         >
//                             {loading ? (
//                                 <Loader2 className="animate-spin" />
//                             ) : (
//                                 <>
//                                     Sign In
//                                     <ArrowRight size={20} />
//                                 </>
//                             )}
//                         </button>
//                     </form>
//                 </div>

//                 <p className="text-center mt-8 text-slate-500 text-sm font-medium">
//                     Don't have an account? <span className="text-primary font-black cursor-pointer hover:underline">Contact System Admin</span>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default Login;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard'; // Refresh to trigger layout change
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6 transition-colors duration-300">
            <div className="w-full max-w-6xl bg-[var(--card)] rounded-3xl shadow-2xl shadow-black/5 overflow-hidden border border-[var(--border)] transition-colors duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Left Card - Supermarket Photo */}
                    <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 min-h-[500px] lg:min-h-[600px]">
                        {/* Overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                        <ShoppingBag className="text-white w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">SuperMarket Pro</h2>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                                    Smart Billing, <br />
                                    <span className="text-emerald-200">Modern Retail</span>
                                </h1>

                                <p className="text-emerald-100/80 text-lg font-medium">
                                    Advanced inventory management and billing system for modern supermarkets
                                </p>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                                    <span className="text-white font-medium">Real-time Sales Analytics</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                                    <span className="text-white font-medium">Inventory Management</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                                    <span className="text-white font-medium">Fast Checkout System</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                                    <span className="text-white font-medium">Secure Admin Portal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Card - Login Form */}
                    <div className="p-10">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-10">
                                <div className="inline-flex p-4 bg-[var(--card)] rounded-3xl shadow-xl shadow-primary/10 border border-[var(--border)] mb-6">
                                    <ShoppingBag className="text-primary w-10 h-10" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] mb-2">Welcome Back</h1>
                                <p className="text-[var(--muted)] font-medium">Supermarket Billing System Admin Portal</p>
                            </div>

                            <div className="p-8 bg-[var(--card)] border border-[var(--border)] shadow-2xl shadow-black/5 rounded-3xl">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center font-bold">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[var(--muted)] font-medium"
                                                placeholder="admin@superbill.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[var(--muted)] uppercase tracking-widest ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[var(--muted)] font-medium"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/30"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <p className="text-center mt-8 text-[var(--muted)] text-sm font-medium">
                                Don't have an account? <span className="text-primary font-black cursor-pointer hover:underline">Contact System Admin</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;