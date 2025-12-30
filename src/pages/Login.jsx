import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    Eye,
    EyeOff,
    Sun,
    Moon
} from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/dashboard';
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--background)]">

            {/* LEFT — IMAGE + PROMO (DESKTOP ONLY) */}
            <div className="relative hidden lg:block overflow-hidden h-screen sticky top-0">
                <img
                    src="/super1.jpeg"
                    alt="Supermarket"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Dark Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

                {/* Content */}
                <div className="relative z-10 p-16 text-white h-full flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
                             <ShoppingBag className="text-[var(--primary-foreground)]" size={24} />
                        </div>
                        <p className="text-3xl font-black tracking-tighter uppercase">Fresh<span className="text-primary">Mart</span></p>
                    </div>

                    <h1 className="text-6xl font-black leading-tight mb-8 tracking-tighter">
                        SMART RETAIL <br />
                        <span className="text-primary">MANAGEMENT</span>
                    </h1>

                    <p className="text-xl text-white/90 mb-12 max-w-lg font-medium leading-relaxed">
                        Effortless inventory, lightning-fast billing, and insightful analytics for your modern supermarket.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-primary">
                                <span className="text-xl font-bold">%</span>
                            </div>
                            <span className="font-bold tracking-wide uppercase text-sm text-white/90">Real-time Performance Metrics</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-primary">
                                <span className="text-xl">⚡</span>
                            </div>
                            <span className="font-bold tracking-wide uppercase text-sm text-white/90">One-Click Invoice Generation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT — LOGIN FORM (FULL SIDE) */}
            <div className="flex items-center justify-center p-8 lg:p-24 bg-[var(--card)] h-full min-h-screen">
                <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-700 fade-in">
                    
                    {/* Branding for Mobile */}
                    <div className="lg:hidden flex justify-center mb-12">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                                <ShoppingBag className="text-[var(--primary-foreground)] w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-[var(--foreground)] uppercase">Fresh<span className="text-primary">Mart</span></span>
                        </div>
                    </div>

                    <div className="flex flex-col mb-12">
                        <h2 className="text-5xl font-black text-[var(--foreground)] tracking-tighter mb-3">
                            Welcome Back
                        </h2>
                        <p className="text-[var(--muted)] font-bold text-sm uppercase tracking-[0.2em]">
                            Login to your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-4 rounded-xl text-center font-bold uppercase tracking-widest animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        {/* EMAIL */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors duration-300" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@freshmart.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border-2 border-[var(--border)] bg-transparent py-4 pl-14 pr-4 font-bold text-[var(--foreground)] focus:outline-none focus:border-primary focus:bg-[var(--card)] transition-all placeholder:text-[var(--muted)]/50 text-sm"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-2">
                             <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
                                    Password
                                </label>
                                <a href="#" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</a>
                             </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors duration-300" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border-2 border-[var(--border)] bg-transparent py-4 pl-14 pr-14 font-bold text-[var(--foreground)] focus:outline-none focus:border-primary focus:bg-[var(--card)] transition-all placeholder:text-[var(--muted)]/50 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-primary transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-[var(--primary-foreground)] font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed mt-8 uppercase tracking-[0.2em] text-xs"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-12 text-center">
                        <p className="text-[var(--muted)] text-xs font-medium">
                            Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline">Contact Admin</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
