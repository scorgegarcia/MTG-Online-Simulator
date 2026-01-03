import React from 'react';
import viewLibraryIcon from '../../assets/img/view_library.png';

interface RightSideToolbarProps {
    mySeat: number;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sendAction: (action: string, payload: any) => void;
    setTradeModalOpen: (open: boolean) => void;
    setRevealModalOpen: (open: boolean) => void;
    setCreateTokenModalOpen: (open: boolean) => void;
    setLibraryRevealModalOpen: (open: boolean) => void;
    setViewLibraryModalOpen: (open: boolean) => void;
    setGlossaryModalOpen: (open: boolean) => void;
}

export const RightSideToolbar: React.FC<RightSideToolbarProps> = ({
    mySeat,
    activeTab,
    setActiveTab,
    sendAction,
    setTradeModalOpen,
    setRevealModalOpen,
    setCreateTokenModalOpen,
    setLibraryRevealModalOpen,
    setViewLibraryModalOpen,
    setGlossaryModalOpen
}) => {
    return (
        <div className="w-24 flex flex-col gap-1 py-0 items-center bg-gray-800/50 rounded border border-gray-700 overflow-auto [scrollbar-width:none]">
            <button 
                className="w-full h-fit py-0 rounded bg-emerald-700 hover:bg-emerald-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Now Is My Turn"
                onClick={() => {
                    sendAction('START_TURN', { seat: mySeat });
                }}
            >
                <span className="text-xl">🏁</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Now Is My Turn</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-blue-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Untap All Permanents"
                onClick={() => sendAction('UNTAP_ALL', { seat: mySeat })}
            >
                <span className="text-xl">🔄</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Untap All</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-yellow-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Shuffle Library"
                onClick={() => sendAction('SHUFFLE', { seat: mySeat })}
            >
                <span className="text-xl">🔀</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Shuffle Lib</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-purple-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Show Next X Cards"
                onClick={() => setLibraryRevealModalOpen(true)}
            >
                <span className="text-xl">📚</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Peek Lib</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-amber-700 hover:bg-amber-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Trade Cards"
                onClick={() => setTradeModalOpen(true)}
            >
                <span className="text-xl">⚖️</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Trade</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-indigo-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Show Hand"
                onClick={() => setRevealModalOpen(true)}
            >
                <span className="text-xl">👁️</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Show Hand</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-green-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Create Token"
                onClick={() => setCreateTokenModalOpen(true)}
            >
                <span className="text-xl">🪙</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Token</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-teal-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="Ver Sideboard"
                onClick={() => setActiveTab(activeTab === 'SIDEBOARD' ? 'HAND' : 'SIDEBOARD')}
            >
                <span className="text-xl">🛡️</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Sideboard</span>
            </button>

            <button 
                className="w-full h-fit py-0 rounded bg-slate-900 hover:bg-gray-600 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-colors"
                title="View Library"
                onClick={() => {
                    sendAction('PEEK_LIBRARY', { seat: mySeat });
                    setViewLibraryModalOpen(true);
                }}
            >
                <img src={viewLibraryIcon} alt="View Library" className="w-6 h-6 object-contain" draggable={false} />
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">VIEW LIBRARY</span>
            </button>

            <button 
                className="w-full h-fit py-1 rounded bg-gradient-to-b from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 flex flex-col items-center justify-center gap-0 text-xs font-bold text-gray-300 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                title="Glossary / Glosario"
                onClick={() => setGlossaryModalOpen(true)}
            >
                <span className="text-xl animate-pulse">✨</span>
                <span className="writing-vertical-rl text-[10px] tracking-wider uppercase">Glossary</span>
            </button>
        </div>
    );
};
