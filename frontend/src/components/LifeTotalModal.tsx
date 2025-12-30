import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';

interface LifeTotalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLife: number;
    onApply: (newLife: number) => void;
    username: string;
}

export const LifeTotalModal: React.FC<LifeTotalModalProps> = ({ 
    isOpen, 
    onClose, 
    currentLife, 
    onApply,
    username 
}) => {
    const [lifeValue, setLifeValue] = useState<number>(currentLife);

    useEffect(() => {
        if (isOpen) {
            setLifeValue(currentLife);
        }
    }, [isOpen, currentLife]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(lifeValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md" onClick={onClose}>
            <div 
                className="bg-slate-900 border-2 border-red-600/50 p-8 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.25)] max-w-sm w-full relative transform transition-all animate-in fade-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500/70 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500/70 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500/70 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500/70 rounded-br-lg"></div>

                <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                    <div className="flex items-center gap-3">
                        <Heart className="text-red-500 fill-red-500/20" size={28} />
                        <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-red-400 to-red-600 tracking-wider">
                            Vidas de {username}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-400 transition-colors p-1 hover:bg-slate-800 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative h-40 flex flex-col items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 mb-8 overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)] opacity-50"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <input 
                            type="number" 
                            value={lifeValue}
                            onChange={(e) => setLifeValue(parseInt(e.target.value) || 0)}
                            autoFocus
                            className="w-32 bg-transparent text-6xl font-serif font-black text-red-500 text-center focus:outline-none drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        />
                        <div className="text-red-200/40 font-serif italic text-sm mt-2">
                            Total de Vidas
                        </div>
                    </div>
                    
                    <Heart 
                        size={120} 
                        className="absolute text-red-500/5 pointer-events-none transition-transform group-hover:scale-110 duration-700" 
                        fill="currentColor"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={onClose}
                        className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 hover:border-slate-700 transition-all font-bold uppercase text-xs tracking-widest"
                    >
                        Cerrar
                    </button>
                    <button 
                        onClick={handleApply}
                        className="py-3 bg-red-900/40 hover:bg-red-800/60 text-red-200 rounded-lg border border-red-500/30 hover:border-red-400 transition-all font-bold uppercase text-xs tracking-widest shadow-lg shadow-red-900/20"
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};
