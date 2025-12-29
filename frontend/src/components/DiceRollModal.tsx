import React, { useState, useEffect, useRef } from 'react';
import { X, Dices } from 'lucide-react';
import { useGameSound } from '../hooks/useGameSound';

interface DiceRollModalProps {
    isOpen: boolean;
    onClose: () => void;
    sendAction: (action: string, payload: any) => void;
}

export const DiceRollModal: React.FC<DiceRollModalProps> = ({ isOpen, onClose, sendAction }) => {
    const { playSound } = useGameSound();
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const [sides, setSides] = useState<number>(20);
    const [customSides, setCustomSides] = useState<number>(20);
    const [animationValue, setAnimationValue] = useState<number>(20);
    const rollIntervalRef = useRef<any>(null);

    useEffect(() => {
        if (!isOpen) {
            setResult(null);
            setIsRolling(false);
            if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        }
    }, [isOpen]);

    const handleRoll = (numSides: number) => {
        if (isRolling) return;

        setIsRolling(true);
        setResult(null);
        setSides(numSides);
        playSound('DICE_ROLL');

        // Start animation
        let count = 0;
        const maxCount = 20;
        rollIntervalRef.current = setInterval(() => {
            setAnimationValue(Math.floor(Math.random() * numSides) + 1);
            count++;
            if (count >= maxCount) {
                if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
                const finalResult = Math.floor(Math.random() * numSides) + 1;
                setResult(finalResult);
                setIsRolling(false);
                sendAction('ROLL_DICE', { sides: numSides, result: finalResult });
            }
        }, 80);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md" onClick={!isRolling ? onClose : undefined}>
            <div 
                className="bg-slate-900 border-2 border-amber-600/50 p-8 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.25)] max-w-md w-full relative transform transition-all animate-in fade-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-500/70 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500/70 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500/70 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-500/70 rounded-br-lg"></div>

                <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                    <div className="flex items-center gap-3">
                        <Dices className="text-amber-500" size={28} />
                        <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-wider">
                            Tirar Dados
                        </h2>
                    </div>
                    {!isRolling && (
                        <button onClick={onClose} className="text-slate-400 hover:text-amber-400 transition-colors p-1 hover:bg-slate-800 rounded-full">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Dice Display Area */}
                <div className="relative h-48 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 mb-8 overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)] opacity-50"></div>
                    
                    {/* MTG Planeswalker symbol watermark or similar style background could go here */}
                    
                    <div className={`text-7xl font-serif font-black transition-all duration-100 ${
                        isRolling ? 'scale-110 animate-pulse text-amber-400/80 rotate-12' : 
                        result !== null ? 'scale-125 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-slate-700'
                    }`}>
                        {isRolling ? animationValue : result || sides}
                    </div>
                    
                    {result !== null && !isRolling && (
                        <div className="absolute bottom-4 text-amber-200/60 font-serif italic text-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                            ¡Resultado!
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            disabled={isRolling}
                            onClick={() => handleRoll(6)}
                            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-100 rounded-lg border border-slate-600 hover:border-amber-500/50 transition-all font-bold uppercase text-xs tracking-widest shadow-lg"
                        >
                            <span>D6</span>
                            <span className="text-[10px] opacity-60">Sided</span>
                        </button>
                        <button 
                            disabled={isRolling}
                            onClick={() => handleRoll(20)}
                            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-100 rounded-lg border border-slate-600 hover:border-amber-500/50 transition-all font-bold uppercase text-xs tracking-widest shadow-lg"
                        >
                            <span>D20</span>
                            <span className="text-[10px] opacity-60">Sided</span>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                value={customSides}
                                onChange={(e) => setCustomSides(Math.max(1, parseInt(e.target.value) || 1))}
                                disabled={isRolling}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-4 pr-10 text-amber-100 focus:outline-none focus:border-amber-500/50 transition-colors font-bold disabled:opacity-50"
                                placeholder="Sides..."
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold uppercase pointer-events-none">Sides</span>
                        </div>
                        <button 
                            disabled={isRolling}
                            onClick={() => handleRoll(customSides)}
                            className="px-6 bg-indigo-900/40 hover:bg-indigo-800/60 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-200 rounded-lg border border-indigo-500/30 hover:border-indigo-400 transition-all font-bold uppercase text-xs tracking-widest shadow-lg"
                        >
                            Custom
                        </button>
                    </div>

                    <button 
                        onClick={onClose}
                        disabled={isRolling}
                        className="w-full mt-4 py-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 hover:border-slate-700 transition-all font-bold uppercase text-xs tracking-widest"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
