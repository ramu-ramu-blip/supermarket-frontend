import { ShoppingBag, Smartphone, Globe, LayoutDashboard, Users } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="pt-32 pb-12 px-6 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-primary rounded-lg">
                                <ShoppingBag className="text-white w-5 h-5" />
                            </div>
                            <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">SuperMarket<span className="text-primary">Pro</span></span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">Standardizing retail excellence with modern technology and seamless experiences.</p>
                        <div className="flex gap-4">
                            {[Smartphone, Globe, LayoutDashboard].map((I, i) => (
                                <div key={i} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer"><I size={18} /></div>
                            ))}
                        </div>
                    </div>
                    {[
                        { title: "Product", links: ["Features", "Pricing", "API Docs", "Release Notes"] },
                        { title: "Company", links: ["About Us", "Careers", "Contact", "Partners"] },
                        { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-6">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map(link => <li key={link}><a href="#" className="text-slate-500 font-medium hover:text-primary transition-colors text-sm">{link}</a></li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© 2025 Smart Retail Systems Private Limited.</p>
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-50 bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden"><Users size={12} /></div>)}
                        </div>
                        <span className="text-slate-500 text-xs font-bold font-mono">500+ Businesses onboarded</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
