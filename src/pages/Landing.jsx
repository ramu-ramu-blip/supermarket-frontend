import { Link } from 'react-router-dom';
import {
    ShoppingBag, Zap, Shield, BarChart3, ArrowRight,
    CheckCircle2, Package, Users, ReceiptText,
    Smartphone, Globe, LayoutDashboard, HelpCircle,
    Star, Quote, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

import Footer from '../components/Footer';

const Landing = () => {
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden transition-colors duration-300">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                            <ShoppingBag className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-[var(--foreground)] uppercase">SuperMarket<span className="text-primary">Pro</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-40 pb-24 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-50 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--input)] border border-[var(--border)] rounded-full mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Trusted by 500+ Local Businesses</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black text-[var(--foreground)] tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Smart Billing.<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Pure Growth.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-2xl text-[var(--muted)] font-medium mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        The all-in-one POS and inventory system designed to make your supermarket faster, smarter, and more profitable.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                        <Link to="/login" className="px-12 py-6 bg-primary text-white font-black rounded-[28px] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 uppercase text-sm tracking-widest active:scale-95">
                            Start Free Trial
                            <ArrowRight size={20} />
                        </Link>
                        <button className="px-12 py-6 bg-[var(--card)] text-[var(--foreground)] font-black rounded-[28px] border border-[var(--border)] hover:bg-[var(--input)] transition-all flex items-center gap-3 uppercase text-sm tracking-widest active:scale-95">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="py-32 px-6 bg-[var(--background)]/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight uppercase mb-4">How it works</h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border)] -z-0 -translate-y-1/2"></div>
                        {[
                            { step: "01", title: "Setup Products", desc: "Easily upload or bulk import your product catalog with barcodes and expiry dates.", icon: Package },
                            { step: "02", title: "Instant Billing", desc: "Start scanning items and generating professional GST-ready receipts in seconds.", icon: ReceiptText },
                            { step: "03", title: "Track Growth", desc: "Monitor sales trends, manage expenses, and see your net profit in real-time.", icon: BarChart3 }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 bg-[var(--card)] p-10 rounded-[40px] border border-[var(--border)] shadow-xl shadow-black/5 text-center group hover:-translate-y-2 transition-transform duration-500">
                                <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20 group-hover:rotate-6 transition-all">
                                    <item.icon size={36} />
                                </div>
                                <span className="text-5xl font-black text-[var(--foreground)] opacity-[0.03] absolute top-6 right-10 group-hover:text-primary/10 transition-colors">{item.step}</span>
                                <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 uppercase">{item.title}</h3>
                                <p className="text-[var(--muted)] font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Showcase */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <img
                                src="https://images.unsplash.com/photo-1540340061722-9293d5163008?q=80&w=2671&auto=format&fit=crop"
                                alt="Dashboard Preview"
                                className="rounded-[40px] shadow-2xl border border-slate-100 hover:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 text-primary">
                                <Zap size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Powerful Dashboard</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-[var(--foreground)] tracking-tight leading-[0.95] mb-8 uppercase">
                                Take Full Command <br /> of Your Business
                            </h2>
                            <ul className="space-y-6">
                                {[
                                    { title: "Real-time Inventory", desc: "Automated alerts when stock is low or near expiry.", icon: Smartphone },
                                    { title: "Cloud Powered", desc: "Access your billing system from any device, anywhere.", icon: Globe },
                                    { title: "Multi-Admin Support", desc: "Secure access control for managers and staff.", icon: Shield },
                                    { title: "Data Driven", desc: "Advanced filtering for sales, payments, and expenses.", icon: LayoutDashboard }
                                ].map((feature, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-12 h-12 bg-[var(--input)] rounded-2xl flex items-center justify-center text-primary shrink-0 border border-[var(--border)]">
                                            <feature.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight">{feature.title}</h4>
                                            <p className="text-[var(--muted)] font-medium text-sm">{feature.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-6 bg-[var(--foreground)] text-[var(--background)] relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary blur-[100px] rounded-full -translate-x-1/2"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-16">Loved by Business Owners</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Rahul Sharma", role: "Supermarket Owner", text: "SuperMarket Pro transformed our billing. It's 10x faster than our old system.", stars: 5 },
                            { name: "Anita Desai", role: "Store Manager", text: "The expiry alerts saved us thousands in potential losses last month alone.", stars: 5 },
                            { name: "Vikram Singh", role: "Operations Head", text: "Analytics and expense tracking give me peace of mind about our margins.", stars: 5 }
                        ].map((testimonial, i) => (
                            <div key={i} className="p-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[40px] text-left group hover:bg-white/10 transition-all duration-500">
                                <Quote className="text-primary mb-6" size={40} />
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.stars)].map((_, i) => <Star key={i} size={16} className="fill-primary text-primary" />)}
                                </div>
                                <p className="text-[var(--muted)] font-medium italic mb-8 leading-relaxed opacity-80">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary uppercase border border-primary/30">{testimonial.name[0]}</div>
                                    <div>
                                        <h4 className="font-bold text-[var(--background)]">{testimonial.name}</h4>
                                        <p className="text-[var(--muted)] text-sm opacity-60">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-20">
                        <HelpCircle className="text-primary mx-auto mb-4" size={48} />
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight uppercase mb-4">Frequently Asked</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Is it easy to migrate from my old software?", a: "Yes! You can bulk import your entire inventory using our simple CSV template in under a minute." },
                            { q: "Do I need a high-end PC to run this?", a: "Not at all. SuperMarket Pro is cloud-based and optimized to run smoothly on any modern web browser or low-end POS terminal." },
                            { q: "How secure is my data?", a: "We use banking-grade encryption and secure access controls to ensure your business data is always protected." },
                            { q: "Can I use it offline?", a: "The system requires an internet connection for real-time cloud sync, ensuring your records are never lost and accessible from anywhere." }
                        ].map((faq, i) => (
                            <div key={i} className="border border-[var(--border)] rounded-[28px] overflow-hidden transition-all bg-[var(--card)]/50">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full p-8 flex items-center justify-between text-left hover:bg-[var(--input)] transition-all"
                                >
                                    <span className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight">{faq.q}</span>
                                    <div className={`text-primary transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={24} />
                                    </div>
                                </button>
                                <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 py-8 border-t border-[var(--border)]' : 'max-h-0'}`}>
                                    <p className="text-[var(--muted)] font-medium leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-primary rounded-[60px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/40">
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                            <div className="absolute top-0 right-0 w-[40%] h-full bg-white/10 -skew-x-12 translate-x-1/2"></div>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-10 relative z-10 uppercase">
                            Ready to Scale <br /> Your Supermarket?
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                            <Link to="/login" className="px-14 py-6 bg-slate-900 text-white font-black rounded-[28px] hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3 uppercase text-sm tracking-widest active:scale-95">
                                Start Your Journey
                                <ArrowRight size={20} />
                            </Link>
                            <span className="text-white/60 font-medium">No credit card required. Cancel anytime.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comprehensive Footer */}
            <Footer />
        </div>
    );
};

export default Landing;
