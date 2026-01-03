import { useState } from 'react';
import { useCardData } from '../hooks/useCardData';
import { useGameSound } from '../hooks/useGameSound';
import { RefreshCw, Check, Layers } from 'lucide-react';
import clsx from 'clsx';
import PersonalizedCard from './PersonalizedCard';
import type { CardDraft, ManaSymbol } from './cardBuilder/types';

// --- CONFIGURACIÓN DE TAMAÑO Y APARIENCIA ---
const MULLIGAN_CARD_WIDTH = 'clamp(8rem, 12vw, 13rem)'; // Ancho base de las cartas
const MULLIGAN_HOVER_SCALE = '1.3';                    // Escala al pasar el ratón (1.2 = 120%)
const MULLIGAN_ANIMATION_DELAY = 100;                  // Milisegundos entre cada carta al aparecer
// --------------------------------------------

const MULLIGAN_HOVER_SCALE_CLASS = `group-hover:scale-[${MULLIGAN_HOVER_SCALE}]`;

interface MulliganModalProps {
    isOpen: boolean;
    hand: any[];
    onMulligan: (count: number) => void;
    onKeep: () => void;
    initialMulliganCount?: number;
}

const getColorGlow = (colors?: string[]) => {
    if (!colors || colors.length === 0) return 'shadow-[0_0_20px_rgba(200,200,200,0.5)] border-slate-400';
    if (colors.length > 1) return 'shadow-[0_0_20px_rgba(212,175,55,0.6)] border-yellow-500';

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

    const custom = obj?.custom_card;
    const customDraft = (custom && custom.source !== 'URLS')
        ? ({
              name: String(custom.name || obj.name || ''),
              kind: (custom.kind || 'Non-creature') as any,
              typeLine: String(custom.type_line || ''),
              rulesText: String(custom.rules_text || ''),
              power: custom.power ? String(custom.power) : '',
              toughness: custom.toughness ? String(custom.toughness) : '',
              manaCost: {
                  generic: Number.isFinite(Number(custom.mana_cost_generic)) ? Number(custom.mana_cost_generic) : 0,
                  symbols: (Array.isArray(custom.mana_cost_symbols) ? custom.mana_cost_symbols : []) as ManaSymbol[]
              },
              artUrl: String(custom.art_url || custom.front_image_url || ''),
              backUrl: String(custom.back_image_url || '')
          } satisfies CardDraft)
        : null;

    const finalImg = obj.scryfall_id ? img : (obj.image_url || img);

    return (
        <div 
            className={clsx(
                "relative rounded-xl overflow-hidden transition-all duration-500 transform",
                "bg-black shadow-2xl",
                "border-2",
                glowClass
            )}
            style={{ width: MULLIGAN_CARD_WIDTH, aspectRatio: '2.5/3.5' }}
        >
            {customDraft ? (
                <PersonalizedCard card={customDraft} className="w-full h-full" />
            ) : finalImg ? (
                <img src={finalImg} alt="Card" className="w-full h-full object-cover" />
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
                    <Layers size={32} />
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundSize: '200% 200%' }} />
        </div>
    );
};

export const MulliganModal = ({ isOpen, hand, onMulligan, onKeep, initialMulliganCount = 7 }: MulliganModalProps) => {
    const [mulliganCount, setMulliganCount] = useState(initialMulliganCount);
    const { playSound } = useGameSound();

    if (!isOpen) return null;

    const handleKeep = () => {
        playSound('CONFIRM_HAND');
        onKeep();
    };

    const handleMulligan = () => {
        const n = Math.max(1, Math.min(7, mulliganCount));
        playSound('RETRY_MULLIGAN');
        onMulligan(n);
        setMulliganCount(prev => Math.max(1, prev - 1));
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[15px]" />
            
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-[clamp(1rem,3vw,3rem)] animate-in fade-in zoom-in duration-500 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col items-center text-center mt-4 relative z-[30]">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 mb-2 drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]">
                        Mano inicial
                    </h2>
                    <p className="text-slate-300 font-serif italic text-lg tracking-wide drop-shadow-lg">
                        Elige tu destino con sabiduría, planeswalker.
                    </p>
                </div>

                {/* Contenedor de cartas - Flex-1 para ocupar el centro y permitir scroll si es necesario */}
                <div className="w-full max-w-[65rem] flex-1 flex flex-wrap justify-center content-center gap-6 md:gap-8 px-8 py-4 overflow-visible perspective-[1200px] relative z-[10] min-h-0">
                    {hand.map((card, idx) => (
                        <div 
                            key={card.id} 
                            style={{ 
                                animationDelay: `${idx * MULLIGAN_ANIMATION_DELAY}ms`,
                                transform: `rotate(${(idx - (hand.length-1)/2) * 2}deg) translateY(${Math.abs(idx - (hand.length-1)/2) * 5}px)`
                            }}
                            className="group relative z-[1] hover:z-[50] animate-in slide-in-from-bottom-20 fade-in duration-700 fill-mode-backwards"
                        >
                            <div className={clsx("transition-transform duration-500", MULLIGAN_HOVER_SCALE_CLASS)}>
                                <MulliganCard obj={card} />
                            </div>
                        </div>
                    ))}
                    {hand.length === 0 && (
                        <div className="text-slate-500 italic text-xl">Tu mano está vacía...</div>
                    )}
                </div>

                {/* Footer */}
                <div className="mb-4 relative z-[30] px-4">
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 bg-slate-900/90 p-5 md:p-6 rounded-2xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
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
                                onClick={handleMulligan}
                                className="group relative px-10 py-4 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border border-rose-500/50 hover:border-rose-400 rounded-lg text-rose-200 font-serif font-bold text-xl transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] overflow-hidden"
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
                            onClick={handleKeep}
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
        </div>
    );
};
