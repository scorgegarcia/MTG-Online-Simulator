import React from 'react';
import { Card } from './Card';
import { Eye, X } from 'lucide-react';
import clsx from 'clsx';

interface RevealTrayProps {
    gameState: any;
    mySeat: number;
    sendAction: (type: string, payload: any) => void;
    cardScale: number;
    hoverBlockedRef: any;
    isDraggingRef: any;
    setHoveredCard: any;
    menuOpen: any;
    setMenuOpen: any;
}

export const RevealTray = ({
    gameState,
    mySeat,
    sendAction,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen
}: RevealTrayProps) => {
    const reveal = gameState.reveal;
    if (!reveal) return null;

    const { sourceSeat, targetSeat, highlightedCards } = reveal;
    const isSource = sourceSeat === mySeat;
    const isTarget = targetSeat === 'ALL' || targetSeat === mySeat || (Array.isArray(targetSeat) && targetSeat.includes(mySeat));

    if (!isSource && !isTarget) return null;

    const sourcePlayer = gameState.players[sourceSeat];
    const handIds = gameState.zoneIndex[sourceSeat]?.['HAND'] || [];
    const handObjects = handIds.map((id: string) => gameState.objects[id]).filter(Boolean);

    const handleCardClick = (e: React.MouseEvent, obj: any) => {
        e.preventDefault();
        e.stopPropagation();
        sendAction('REVEAL_TOGGLE_CARD', { cardId: obj.id });
    };

    const cardProps = { 
        mySeat, 
        cardScale, 
        hoverBlockedRef, 
        isDraggingRef, 
        setHoveredCard, 
        menuOpen, 
        setMenuOpen, 
        sendAction,
        inBattlefield: false,
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900/95 border-2 border-amber-500/50 rounded-lg shadow-2xl overflow-hidden relative backdrop-blur-md z-50">
            <div className="bg-slate-950 p-2 text-center border-b border-amber-500/30 flex justify-between items-center px-4">
                <div className="flex items-center gap-2 text-amber-500 font-serif font-bold text-xl tracking-widest">
                    <Eye size={24} /> 
                    <span>
                        {isSource ? 'REVEALING HAND' : `${sourcePlayer?.username?.toUpperCase()}'S HAND`}
                    </span>
                </div>
                
                {isSource && (
                    <button 
                        onClick={() => sendAction('REVEAL_CLOSE', {})}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-4 justify-center content-start custom-scrollbar bg-black/20">
                {handObjects.length === 0 && (
                    <div className="text-slate-500 italic text-lg mt-10">Hand is empty</div>
                )}
                {handObjects.map((obj: any) => {
                    const isHighlighted = highlightedCards.includes(obj.id);
                    return (
                        <div 
                            key={obj.id} 
                            onClickCapture={(e) => handleCardClick(e, obj)}
                            className={clsx(
                                "relative transition-all duration-300 rounded-lg cursor-pointer transform hover:scale-105",
                                isHighlighted && "ring-4 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse scale-105"
                            )}
                        >
                            <div className="pointer-events-none">
                                <Card obj={obj} {...cardProps} />
                            </div>
                            
                            {isHighlighted && (
                                <div className="absolute -top-3 -right-3 bg-orange-500 text-white rounded-full p-1 shadow-lg z-20 animate-bounce">
                                    <Eye size={16} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="bg-slate-950 p-2 text-center text-xs text-slate-500 italic">
                Click cards to highlight them for everyone
            </div>
        </div>
    );
};
