import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--card)] w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--border)] transition-colors duration-300">
                <div className="p-8 text-center space-y-6">
                    <div className={`mx-auto w-16 h-16 rounded-3xl flex items-center justify-center transition-colors duration-300 ${isDangerous ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight transition-colors duration-300">{title}</h3>
                        <p className="text-[var(--muted)] font-medium leading-relaxed transition-colors duration-300">{message}</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] font-black rounded-2xl hover:bg-[var(--card)] transition-all active:scale-95 shadow-sm"
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
        </div>,
        document.body
    );
};

export default ConfirmationModal;
