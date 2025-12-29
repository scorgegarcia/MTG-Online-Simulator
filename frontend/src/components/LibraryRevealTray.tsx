import React from 'react';
import { Card } from './Card';
import { Eye, X } from 'lucide-react';
import deckOnTopImg from '../assets/img/deck_on_top.png';
import deckOnBottomImg from '../assets/img/deck_on_bottom.png';

interface LibraryRevealTrayProps {
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

export const LibraryRevealTray = ({
    gameState,
    mySeat,
    sendAction,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen
}: LibraryRevealTrayProps) => {
    const reveal = gameState.reveal;
    if (!reveal || reveal.type !== 'LIBRARY') return null;

    const { sourceSeat, targetSeat, revealedCardIds } = reveal;
    const isRequester = sourceSeat === mySeat;
    const isIncluded = targetSeat === 'ALL'
        ? true
        : Array.isArray(targetSeat)
            ? targetSeat.includes(mySeat)
            : targetSeat === mySeat;

    if (!isRequester && !isIncluded) return null;

    const sourcePlayer = gameState.players[sourceSeat];
    const sourceLibrary: string[] = gameState.zoneIndex?.[sourceSeat]?.LIBRARY || [];
    const visibleIds = isIncluded ? (revealedCardIds || []).filter((id: string) => sourceLibrary.includes(id)) : [];
    const cards = visibleIds.map((id: string) => gameState.objects[id]).filter(Boolean);

    const handleDrop = (e: React.DragEvent, position: 'top' | 'bottom') => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/plain");
        if (!cardId) return;

        sendAction('MOVE', {
            objectId: cardId,
            fromZone: 'LIBRARY',
            toZone: 'LIBRARY',
            position: position,
            toOwner: mySeat
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
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
                        {isRequester ? 'REVEALING LIBRARY' : `${sourcePlayer?.username?.toUpperCase()}'S LIBRARY REVEAL`}
                    </span>
                </div>
                
                {isRequester && (
                    <button 
                        onClick={() => sendAction('REVEAL_CLOSE', {})}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Cards Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-wrap gap-4 justify-center content-start custom-scrollbar bg-black/20">
                    {cards.length === 0 && (
                        <div className="text-slate-500 italic text-lg mt-10">
                            {isIncluded ? 'No cards revealed' : 'You are not included in this reveal'}
                        </div>
                    )}
                    {cards.map((obj: any) => (
                         <div key={obj.id} className="relative transition-all duration-300 rounded-lg cursor-pointer transform hover:scale-105">
                             <Card obj={obj} {...cardProps} />
                         </div>
                    ))}
                </div>

                {isRequester && isIncluded && (
                    <div className="w-32 bg-slate-950/50 border-l border-slate-800 flex flex-col p-2 gap-2">
                        <div 
                            onDrop={(e) => handleDrop(e, 'top')}
                            onDragOver={handleDragOver}
                            className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-900/20 transition-colors cursor-pointer group"
                        >
                            <img src={deckOnTopImg} alt="Top" className="w-12 h-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-500 text-center uppercase">Top of Library</span>
                        </div>

                        <div 
                            onDrop={(e) => handleDrop(e, 'bottom')}
                            onDragOver={handleDragOver}
                            className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-900/20 transition-colors cursor-pointer group"
                        >
                            <img src={deckOnBottomImg} alt="Bottom" className="w-12 h-12 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-500 text-center uppercase">Bottom of Library</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
