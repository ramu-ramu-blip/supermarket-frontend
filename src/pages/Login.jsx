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
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--background)] transition-colors duration-300">

            {/* Theme Toggle — Floating */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--secondary)] hover:text-primary hover:border-primary transition-all active:scale-95 shadow-lg"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                </button>
            </div>

            {/* LEFT — IMAGE + PROMO (DESKTOP ONLY) */}
            <div className="relative hidden lg:block overflow-hidden">
                <img
                    src="/super1.jpeg"
                    alt="Supermarket"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />

                {/* Green overlay */}


                {/* Content */}
                <div className="relative z-10 p-12 text-white h-full flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="/logo.png" alt="Logo" className="h-20 w-auto object-contain drop-shadow-xl" />
                        <p className="text-2xl font-black tracking-tighter uppercase">Fresh<span className="text-white/70">Mart</span></p>
                    </div>

                    <h1 className="text-6xl font-black leading-tight mb-6 tracking-tighter">
                        SMART RETAIL <br />
                        <span className="text-white/60">MANAGEMENT</span>
                    </h1>

                    <p className="text-xl text-white/80 mb-10 max-w-md font-medium leading-relaxed">
                        Effortless inventory, lightning-fast billing, and insightful analytics for your modern supermarket.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-fit">
                            <div className="bg-white/20 p-2 rounded-lg">%</div>
                            <span className="font-bold tracking-wide uppercase text-sm">Real-time Performance Metrics</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-fit">
                            <div className="bg-white/20 p-2 rounded-lg">⚡</div>
                            <span className="font-bold tracking-wide uppercase text-sm">One-Click Invoice Generation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT — LOGIN CARD */}
            <div className="flex items-center justify-center p-8 bg-gradient-to-br from-[var(--background)] to-[var(--input)]/20">
                <div className="w-full max-w-md bg-[var(--card)] rounded-[40px] shadow-2xl shadow-black/5 p-12 border border-[var(--border)] transition-all duration-500">

                    {/* Branding for Mobile */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                                <ShoppingBag className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-[var(--foreground)] uppercase italic">Super<span className="text-primary not-italic">Pro</span></span>
                        </div>
                    </div>

                    <div className="flex flex-col mb-10 ">
                        <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-[var(--muted)] font-bold text-sm uppercase tracking-widest">
                            Authorized Access Only
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-4 rounded-2xl text-center font-bold uppercase tracking-widest animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        {/* EMAIL */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors duration-300" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-[20px] border border-[var(--border)] bg-[var(--input)] py-4 pl-14 pr-4 font-bold text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all placeholder:text-[var(--muted)]/50 text-sm"
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">
                                Secure Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors duration-300" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-[20px] border border-[var(--border)] bg-[var(--input)] py-4 pl-14 pr-14 font-bold text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all placeholder:text-[var(--muted)]/50 text-sm"
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
                            className="w-full bg-primary text-white font-black py-4 rounded-[22px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/25 hover:shadow-primary/35 disabled:opacity-50 disabled:scale-100 mt-4 uppercase tracking-[0.2em] text-xs"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign In to Terminal</span>
                                    <ArrowRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default Login;
