import React from 'react';

interface LeftSideToolbarProps {
    gameState: any;
    mySeat: number;
    setCommanderModalOpen: (open: boolean) => void;
    setDiceRollModalOpen: (open: boolean) => void;
    sendAction: (action: string, payload: any) => void;
}

export const LeftSideToolbar: React.FC<LeftSideToolbarProps> = ({
    gameState,
    mySeat,
    setCommanderModalOpen,
    setDiceRollModalOpen,
    sendAction
}) => {
    return (
        <div className="w-24 flex flex-col gap-2 py-0 items-center bg-gray-800/50 rounded border border-gray-700 overflow-y-auto no-scrollbar">
            <button 
                className="w-full h-fit py-1 rounded bg-indigo-900/80 hover:bg-indigo-800 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors shrink-0 mt-1"
                title="Tirar Dado"
                onClick={() => setDiceRollModalOpen(true)}
            >
                <span className="text-xl">🎲</span>
                <span className="text-[10px] uppercase text-center leading-3">Tirar<br/>Dado</span>
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
    );
};
