import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center space-y-6">
                    <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center ${isDangerous ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-4 font-black rounded-2xl text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isDangerous
                                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                                    : 'bg-primary hover:bg-primary/90 shadow-primary/30'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
