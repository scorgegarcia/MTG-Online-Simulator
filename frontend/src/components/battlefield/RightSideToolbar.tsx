import React from 'react';

interface RightSideToolbarProps {
    mySeat: number;
    isThinkingCooldown: boolean;
    setIsThinkingCooldown: (cooldown: boolean) => void;
    sendAction: (action: string, payload: any) => void;
    setTradeModalOpen: (open: boolean) => void;
    setRevealModalOpen: (open: boolean) => void;
    setCreateTokenModalOpen: (open: boolean) => void;
}

export const RightSideToolbar: React.FC<RightSideToolbarProps> = ({
    mySeat,
    isThinkingCooldown,
    setIsThinkingCooldown,
    sendAction,
    setTradeModalOpen,
    setRevealModalOpen,
    setCreateTokenModalOpen
}) => {
    return (
        <div className="w-24 flex flex-col gap-2 py-0 items-center bg-gray-800/50 rounded border border-gray-700 overflow-auto [scrollbar-width:none]">
            <button 
                className={`w-full h-fit py-1 rounded flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors ${isThinkingCooldown ? 'bg-slate-800 text-gray-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}
                title="Notify Thinking"
                disabled={isThinkingCooldown}
                onClick={() => {
                    setIsThinkingCooldown(true);
                    sendAction('THINKING', { seat: mySeat });
                }}
            >
                <span className="text-xl">💬</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Thinking...</span>
            </button>

            <button 
                className="w-full h-fit py-1 rounded bg-blue-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors"
                title="Untap All Permanents"
                onClick={() => sendAction('UNTAP_ALL', { seat: mySeat })}
            >
                <span className="text-xl">🔄</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Untap All</span>
            </button>

            <button 
                className="w-full h-fit py-1 rounded bg-yellow-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors"
                title="Shuffle Library"
                onClick={() => sendAction('SHUFFLE', { seat: mySeat })}
            >
                <span className="text-xl">🔀</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Shuffle Lib</span>
            </button>

            <button 
                className="w-full h-fit py-1 rounded bg-amber-700 hover:bg-amber-600 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors"
                title="Trade Cards"
                onClick={() => setTradeModalOpen(true)}
            >
                <span className="text-xl">⚖️</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Trade</span>
            </button>

            <button 
                className="w-full h-fit py-1 rounded bg-indigo-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors"
                title="Show Hand"
                onClick={() => setRevealModalOpen(true)}
            >
                <span className="text-xl">👁️</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Show Hand</span>
            </button>

            <button 
                className="w-full h-fit py-1 rounded bg-green-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-300 transition-colors"
                title="Create Token"
                onClick={() => setCreateTokenModalOpen(true)}
            >
                <span className="text-xl">🪙</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Token</span>
            </button>
        </div>
    );
};
