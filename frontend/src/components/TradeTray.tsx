import React from 'react';
import { Card } from './Card';
import { Lock, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface TradeTrayProps {
    gameState: any;
    mySeat: number;
    sendAction: (type: string, payload: any) => void;
    cardScale: number;
    // other props passed down
    hoverBlockedRef: any;
    isDraggingRef: any;
    setHoveredCard: any;
    menuOpen: any;
    setMenuOpen: any;
}

export const TradeTray = ({
    gameState,
    mySeat,
    sendAction,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen
}: TradeTrayProps) => {
    const trade = gameState.trade;
    if (!trade) return null;

    const isInitiator = trade.initiatorSeat === mySeat;
    const opponentSeat = isInitiator ? trade.targetSeat : trade.initiatorSeat;
    
    const myLocked = isInitiator ? trade.initiatorLocked : trade.targetLocked;
    const opponentLocked = isInitiator ? trade.targetLocked : trade.initiatorLocked;
    
    const myConfirmed = isInitiator ? trade.initiatorConfirmed : trade.targetConfirmed;
    
    const myOfferIds = gameState.zoneIndex[mySeat]?.['TRADE_OFFER'] || [];
    const opponentOfferIds = gameState.zoneIndex[opponentSeat]?.['TRADE_OFFER'] || [];

    const myOffer = myOfferIds.map((id: string) => gameState.objects[id]).filter(Boolean);
    const opponentOffer = opponentOfferIds.map((id: string) => gameState.objects[id]).filter(Boolean);

    const opponent = gameState.players[opponentSeat];

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/plain");
        if (!cardId) return;
        
        // Only allow adding if not locked
        if (myLocked) return;

        const obj = gameState.objects[cardId];
        // Can add from Hand or Battlefield
        if (obj && obj.controller_seat === mySeat && obj.zone !== 'TRADE_OFFER') {
            sendAction('MOVE', { objectId: cardId, fromZone: obj.zone, toZone: 'TRADE_OFFER', toOwner: mySeat });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!myLocked) {
            e.dataTransfer.dropEffect = "move";
        }
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
        inBattlefield: false 
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900/90 border-2 border-amber-500/50 rounded-lg shadow-2xl overflow-hidden relative backdrop-blur-md">
            {/* Header */}
            <div className="bg-slate-950 p-1 text-center border-b border-amber-500/30">
                <h2 className="text-amber-500 font-serif font-bold text-xl tracking-widest flex items-center justify-center gap-2">
                    <span className="text-2xl">⚖️</span> TRADE NEGOTIATION <span className="text-2xl">⚖️</span>
                </h2>
                <div className="text-slate-400 text-xs">Trading with {opponent?.username || `Player ${opponentSeat}`}</div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col p-1 gap-1 overflow-hidden">
                
                {/* Top Row: Opponent Offer */}
                <div className="flex-1 bg-red-950/20 border border-red-900/30 rounded-lg p-1 flex flex-col relative">
                    <div className="absolute top-0 left-2 text-xs text-red-400 font-bold uppercase tracking-wider bg-slate-900 px-2 -translate-y-1/2">
                        {opponent?.username}'s Offer
                    </div>
                    {opponentLocked && (
                        <div className="absolute top-2 right-2 text-amber-500 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-amber-500/50">
                            <Lock size={12} /> Locked
                        </div>
                    )}
                    <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto custom-scrollbar p-2">
                        {opponentOffer.length === 0 && (
                            <div className="text-slate-600 italic">No items offered</div>
                        )}
                        {opponentOffer.map((obj: any) => (
                            <Card key={obj.id} obj={obj} {...cardProps} />
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent shrink-0"></div>

                {/* Bottom Row: My Offer */}
                <div 
                    className={clsx(
                        "flex-1 bg-indigo-950/20 border rounded-lg p-1 flex flex-col relative transition-colors",
                        myLocked ? "border-slate-700 opacity-80" : "border-indigo-500/30 hover:bg-indigo-900/10"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <div className="absolute top-0 left-2 text-xs text-indigo-400 font-bold uppercase tracking-wider bg-slate-900 px-2 -translate-y-1/2">
                        Your Offer
                    </div>
                    {myLocked && (
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-slate-950/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg cursor-not-allowed">
                            <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded shadow-lg flex items-center gap-2 text-slate-300">
                                <Lock size={16} /> Offer Locked
                            </div>
                        </div>
                    )}
                    <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto custom-scrollbar p-2 relative z-0">
                        {myOffer.length === 0 && !myLocked && (
                            <div className="text-slate-500/50 border-2 border-dashed border-slate-700/50 rounded-lg p-4 text-center text-sm">
                                Drag cards here to offer
                            </div>
                        )}
                        {myOffer.map((obj: any) => (
                            <Card key={obj.id} obj={obj} {...cardProps} />
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer Controls */}
            <div className="bg-slate-950 p-1 border-t border-slate-800 flex justify-between items-center gap-4">
                
                {/* Status Lights */}
                <div className="flex gap-1 items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <div className="flex flex-col items-center gap-1 p-1">
                        <div className={clsx("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors", opponentLocked ? "bg-green-500 text-green-500" : "bg-red-900 text-red-900")}></div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{opponent?.username}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-800"></div>
                    <div className="flex flex-col items-center gap-1 p-1">
                        <div className={clsx("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors", myLocked ? "bg-green-500 text-green-500" : "bg-red-900 text-red-900")}></div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">You</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-1">
                    <button
                        onClick={() => sendAction('TRADE_CANCEL', { seat: mySeat })}
                        className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded flex items-center gap-2 transition-colors font-bold text-sm uppercase"
                    >
                        <X size={16} /> Cancel
                    </button>

                    {!myLocked ? (
                        <button
                            onClick={() => sendAction('TRADE_LOCK', { seat: mySeat })}
                            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded shadow-lg shadow-amber-900/20 flex items-center gap-2 transition-all font-bold text-sm uppercase tracking-wide transform active:scale-95"
                        >
                            <Lock size={16} /> Lock Offer
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                // Implicit unlock by modifying? Or explicit unlock?
                                // Requirement: "si el oponente hace cambios... se desbloquea". 
                                // Doesn't say we can unlock manually, but usually we can by trying to move a card.
                                // For better UX, let's allow "Unlock" if user wants to change mind without drag.
                                // But backend logic only unlocks on MOVE. Let's send a move or add TRADE_UNLOCK?
                                // Actually, I can just use a specific action or rely on drag. 
                                // Let's stick to drag-to-unlock or add a "Unlock" button that just moves a dummy or similar? 
                                // No, let's implement TRADE_UNLOCK or just rely on drag.
                                // User said: "un botón para bloquear... cuando se bloquea, nosotros ya no podemos agregar mas cartas".
                                // So maybe we CAN'T unlock manually unless opponent changes?
                                // "pero si el oponente hace cambios en su lado de la bandeja se desbloquea la bandeja"
                                // Usually you can unlock yourself. I'll assume drag-out unlocks it, or I can add an Unlock button.
                                // For now, let's assume once locked, you wait. But that's bad UX. 
                                // Let's Assume "Cancel" is the escape. 
                                // Or maybe clicking Lock again unlocks?
                                // Let's make the button disabled if locked, or change to "Locked".
                            }}
                            disabled
                            className="px-6 py-2 bg-slate-700 text-slate-400 rounded flex items-center gap-2 cursor-not-allowed font-bold text-sm uppercase tracking-wide border border-slate-600"
                        >
                            <Lock size={16} /> Locked
                        </button>
                    )}

                    <button
                        onClick={() => sendAction('TRADE_CONFIRM', { seat: mySeat })}
                        disabled={!myLocked || !opponentLocked || myConfirmed}
                        className={clsx(
                            "px-6 py-2 rounded flex items-center gap-2 transition-all font-bold text-sm uppercase tracking-wide shadow-lg",
                            (!myLocked || !opponentLocked) 
                                ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700" 
                                : myConfirmed
                                    ? "bg-green-900/50 text-green-400 border border-green-700 cursor-wait"
                                    : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 transform active:scale-95"
                        )}
                    >
                        {myConfirmed ? <Check size={16} /> : <Check size={16} />} 
                        {myConfirmed ? 'Waiting...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};
