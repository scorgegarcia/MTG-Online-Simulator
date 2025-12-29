import { useState } from 'react';
import { useCardData } from '../hooks/useCardData';
import { RefreshCw, Check, Layers } from 'lucide-react';
import clsx from 'clsx';

interface MulliganModalProps {
    isOpen: boolean;
    hand: any[]; // Array of card objects
    onMulligan: (count: number) => void;
    onKeep: () => void;
    initialMulliganCount?: number;
}

const getColorGlow = (colors?: string[]) => {
    if (!colors || colors.length === 0) return 'shadow-[0_0_20px_rgba(200,200,200,0.5)] border-slate-400'; // Colorless
    if (colors.length > 1) return 'shadow-[0_0_20px_rgba(212,175,55,0.6)] border-yellow-500'; // Gold

    const map: Record<string, string> = {
        'W': 'shadow-[0_0_20px_rgba(255,255,240,0.6)] border-yellow-100',
        'U': 'shadow-[0_0_20px_rgba(59,130,246,0.6)] border-blue-500',
        'B': 'shadow-[0_0_20px_rgba(100,100,100,0.8)] border-gray-800',
        'R': 'shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-500',
        'G': 'shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-500',
    };
    return map[colors[0]] || 'shadow-none border-gray-600';
};

const MulliganCard = ({ obj }: { obj: any }) => {
    const { img, colors } = useCardData(obj.scryfall_id);
    const glowClass = getColorGlow(colors);

    return (
        <div 
            className={clsx(
                "relative rounded-xl overflow-hidden transition-all duration-500 transform hover:scale-110 hover:z-50",
                "w-48 h-[17rem] bg-black", // Fixed size large cards
                "border-2",
                glowClass
            )}
        >
            {img ? (
                <img src={img} alt="Card" className="w-full h-full object-cover" />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
                    <Layers size={32} />
                </div>
            )}
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundSize: '200% 200%' }} />
        </div>
    );
};

export const MulliganModal = ({ isOpen, hand, onMulligan, onKeep, initialMulliganCount = 7 }: MulliganModalProps) => {
    const [mulliganCount, setMulliganCount] = useState(initialMulliganCount);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[15px]" />
            
            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center p-8 animate-in fade-in zoom-in duration-500">
                <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 mb-2 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                    Mano inicial
                </h2>
                <p className="text-slate-300 mb-12 font-serif italic text-lg tracking-wide">
                    Elige tu destino con sabiduría, planeswalker.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-16 perspective-[1000px]">
                    {hand.map((card, idx) => (
                        <div 
                            key={card.id} 
                            style={{ 
                                animationDelay: `${idx * 100}ms`,
                                transform: `rotate(${(idx - (hand.length-1)/2) * 2}deg) translateY(${Math.abs(idx - (hand.length-1)/2) * 5}px)`
                            }}
                            className="animate-in slide-in-from-bottom-20 fade-in duration-700 fill-mode-backwards"
                        >
                            <MulliganCard obj={card} />
                        </div>
                    ))}
                    {hand.length === 0 && (
                        <div className="text-slate-500 italic text-xl">Tu mano está vacía...</div>
                    )}
                </div>

                <div className="flex items-center gap-8 bg-slate-900/80 p-6 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Cartas</span>
                            <input 
                                type="number" 
                                min={1}
                                max={7}
                                value={mulliganCount}
                                onChange={(e) => {
                                    const raw = Number(e.target.value);
                                    const next = Number.isFinite(raw) ? raw : 7;
                                    setMulliganCount(Math.max(1, Math.min(7, Math.trunc(next))));
                                }}
                                className="w-16 bg-slate-950 border border-slate-700 text-amber-500 text-2xl font-bold text-center rounded p-2 focus:outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>
                        <button 
                            onClick={() => {
                                const n = Math.max(1, Math.min(7, mulliganCount));
                                onMulligan(n);
                                setMulliganCount(prev => Math.max(1, prev - 1));
                            }}
                            className="group relative px-8 py-4 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/50 hover:border-indigo-400 rounded-lg text-indigo-200 font-serif font-bold text-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-3">
                                <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" />
                                <span>Mulligan de {mulliganCount}</span>
                            </div>
                        </button>
                    </div>

                    <div className="w-px h-16 bg-slate-700/50" />

                    <button 
                        onClick={onKeep}
                        className="group relative px-10 py-4 bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/50 hover:border-emerald-400 rounded-lg text-emerald-200 font-serif font-bold text-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="flex items-center gap-3">
                            <Check className="group-hover:scale-125 transition-transform" />
                            <span>Conservar</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
