import React, { useState, useRef, useEffect } from 'react';
import arrowIcon from '../../assets/img/arrow_green_icon.png';

interface LeftSideToolbarProps {
    gameState: any;
    mySeat: number;
    setCommanderModalOpen: (open: boolean) => void;
    setDiceRollModalOpen: (open: boolean) => void;
    sendAction: (action: string, payload: any) => void;
    isThinkingCooldown: boolean;
    setIsThinkingCooldown: (cooldown: boolean) => void;
    showCommanderDamage: boolean;
    setShowCommanderDamage: (show: boolean) => void;
    isArrowMode: boolean;
    setIsArrowMode: (active: boolean) => void;
}

export const LeftSideToolbar: React.FC<LeftSideToolbarProps> = ({
    gameState,
    mySeat,
    setCommanderModalOpen,
    setDiceRollModalOpen,
    sendAction,
    isThinkingCooldown,
    setIsThinkingCooldown,
    showCommanderDamage,
    setShowCommanderDamage,
    isArrowMode,
    setIsArrowMode
}) => {
    const [isInteractionsOpen, setIsInteractionsOpen] = useState(false);
    const interactionsRef = useRef<HTMLDivElement>(null);

    // Close submenu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (interactionsRef.current && !interactionsRef.current.contains(event.target as Node)) {
                setIsInteractionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-24 flex flex-col gap-2 h-full">
            {/* Fila 1: Contenido original */}
            <div className="flex flex-col gap-2 py-0 items-center bg-gray-800/50 rounded border border-gray-700 overflow-y-auto no-scrollbar flex-1">
                <button 
                    className="w-full h-fit py-1 rounded bg-indigo-900/80 hover:bg-indigo-800 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors shrink-0 mt-1"
                    title="Tirar Dado"
                    onClick={() => setDiceRollModalOpen(true)}
                >
                    <span className="text-xl">🎲</span>
                    <span className="text-[10px] uppercase text-center leading-3">Tirar<br/>Dado</span>
                </button>

                <button 
                    className={`w-full h-fit py-1 rounded flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors shrink-0 ${showCommanderDamage ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-red-950/80 hover:bg-red-900 text-gray-300'}`}
                    title="Toggle Damage Display"
                    onClick={() => setShowCommanderDamage(!showCommanderDamage)}
                >
                    <span className="text-xl">👁️</span>
                    <span className="text-[10px] uppercase text-center leading-3">Ver<br/>Daño</span>
                </button>

                <button 
                    className="w-full h-fit py-1 rounded bg-red-900/80 hover:bg-red-800 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors shrink-0"
                    title="Commander Damage"
                    onClick={() => setCommanderModalOpen(true)}
                >
                    <span className="text-xl">🛡️</span>
                    <span className="text-[10px] uppercase text-center leading-3">Cmdr<br/>Dmg</span>
                </button>

                {[
                    { key: 'commanderTax', label: 'Tax', icon: '💸' },
                    { key: 'poison', label: 'Poison', icon: '☠️' },
                    { key: 'energy', label: 'Energy', icon: '⚡' },
                    { key: 'experience', label: 'Exp', icon: '🎓' },
                    { key: 'storm', label: 'Storm', icon: '⛈️' },
                    { key: 'charge', label: 'Charge', icon: '🔋' },
                ].map(({ key, label }) => {
                    const count = gameState.players[mySeat]?.counters?.[key] || 0;
                    return (
                        <div key={key} className="w-full flex flex-col items-center gap-1 bg-slate-800/50 rounded p-1 shrink-0 border border-slate-700/50">
                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold">{label}</div>
                            <div className="flex items-center justify-between w-full gap-1">
                            <button 
                                className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold"
                                onClick={() => sendAction('PLAYER_COUNTER', { seat: mySeat, type: key, delta: -1 })}
                            >-</button>
                            <span className={`font-bold text-sm ${count > 0 ? 'text-white' : 'text-gray-500'}`}>{count}</span>
                            <button 
                                className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-xs text-white font-bold"
                                onClick={() => sendAction('PLAYER_COUNTER', { seat: mySeat, type: key, delta: 1 })}
                            >+</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fila 2: Nuevos botones (estilo RightSideToolbar) */}
            <div className="flex flex-col gap-1 py-0 items-center bg-gray-800/50 rounded border border-gray-700 shrink-0 relative" ref={interactionsRef}>
                <style>{`
                    @keyframes magic-pulse {
                        0%, 100% { box-shadow: 0 0 5px #fff, 0 0 10px #00d4ff, inset 0 0 5px #fff; }
                        50% { box-shadow: 0 0 15px #fff, 0 0 25px #00d4ff, inset 0 0 10px #fff; }
                    }
                    @keyframes particle-flow {
                        0% { background-position: 0% 0%; }
                        100% { background-position: 40px 40px; }
                    }
                `}</style>
                <button 
                    className={`w-full h-fit py-1 rounded flex flex-col items-center justify-center gap-0 text-xs font-bold transition-all duration-300 relative overflow-hidden ${
                        isArrowMode 
                        ? 'bg-cyan-500/80 text-white border-white/50' 
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300 border-transparent'
                    } border`}
                    style={isArrowMode ? {
                        animation: 'magic-pulse 2s infinite ease-in-out',
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                        backgroundSize: '10px 10px',
                    } : {}}
                    title="Arrow Tool"
                    onClick={() => {
                        const newMode = !isArrowMode;
                        setIsArrowMode(newMode);
                        if (!newMode) {
                            sendAction('CLEAR_ARROWS', { creatorSeat: mySeat });
                        }
                    }}
                >
                    {isArrowMode && (
                        <div className="absolute inset-0 pointer-events-none opacity-50" style={{
                            background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.4) 50%, transparent 55%)',
                            backgroundSize: '200% 200%',
                            animation: 'particle-flow 3s linear infinite'
                        }} />
                    )}
                    <img 
                        src={arrowIcon} 
                        alt="Arrow" 
                        className={`w-6 h-6 object-contain mb-1 ${isArrowMode ? 'drop-shadow-[0_0_5px_#fff]' : 'opacity-70'}`}
                    />
                    <span className={`writing-vertical-rl text-[10px] tracking-wider uppercase ${isArrowMode ? 'text-white' : 'text-gray-400'}`}>Arrow</span>
                </button>

                <button 
                    className="w-full h-fit py-1 rounded bg-slate-700 hover:bg-slate-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                    title="Interacciones"
                    onClick={() => setIsInteractionsOpen(!isInteractionsOpen)}
                >
                    <span className="text-xl">🤝</span>
                    <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Interacciones</span>
                </button>

                {/* Submenú de Interacciones */}
                {isInteractionsOpen && (
                    <div className="absolute left-full ml-2 bottom-0 w-24 bg-gray-900/95 border border-gray-700 rounded shadow-xl flex flex-col gap-1 p-1 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                        <button 
                            className={`w-full h-fit py-0 rounded flex flex-col items-center justify-center gap-0 text-xs font-bold transition-colors ${isThinkingCooldown ? 'bg-slate-800 text-gray-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}
                            title="Notify Thinking"
                            disabled={isThinkingCooldown}
                            onClick={() => {
                                setIsThinkingCooldown(true);
                                sendAction('THINKING', { seat: mySeat });
                                setIsInteractionsOpen(false); // Close submenu after action
                            }}
                        >
                            <span className="text-xl">💬</span>
                            <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Thinking...</span>
                        </button>

                        <button 
                            className="w-full h-fit py-0 rounded bg-amber-700/80 hover:bg-amber-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-200 transition-colors"
                            title="Pass Turn"
                            onClick={() => {
                                sendAction('PASS_TURN', { seat: mySeat });
                                setIsInteractionsOpen(false); // Close submenu after action
                            }}
                        >
                            <span className="text-xl">⏩</span>
                            <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Pass</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
