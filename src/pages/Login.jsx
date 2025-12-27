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
            window.location.href = '/'; // Refresh to trigger layout change
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
            {/* Soft decorative gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-primary/10 border border-slate-100 mb-6">
                        <ShoppingBag className="text-primary w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-500 font-medium">Supermarket Billing System Admin Portal</p>
                </div>

                <div className="glass-card p-8 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl text-center font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="admin@superbill.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 font-medium"
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

                <p className="text-center mt-8 text-slate-500 text-sm font-medium">
                    Don't have an account? <span className="text-primary font-black cursor-pointer hover:underline">Contact System Admin</span>
                </p>
            </div>
        </div>
    );
};

export default Login;

