import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = false
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-slate-900 border-2 border-amber-600/50 p-6 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.2)] max-w-md w-full relative transform transition-all animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500 rounded-br"></div>

                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                    <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-wide drop-shadow-sm">
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-amber-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="text-slate-200 mb-8 font-sans leading-relaxed">
                    {children}
                </div>

                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold border border-slate-600 transition-colors uppercase text-sm tracking-wider"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className={`px-6 py-2 rounded font-bold text-white shadow-lg transition-all transform active:scale-95 uppercase text-sm tracking-wider ${
                            isDanger 
                            ? 'bg-red-900/80 hover:bg-red-800 border border-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                            : 'bg-indigo-700 hover:bg-indigo-600 border border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
