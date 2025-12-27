import { Card } from './Card';
import { categorizeObjects } from '../utils/gameUtils';
import React, { memo } from 'react';

interface BattlefieldSharedProps {
    gameState: any;
    mySeat: number; // The seat of the current user
    cardScale: number;
    hoverBlockedRef: any;
    isDraggingRef?: any;
    setHoveredCard: any;
    menuOpen: any;
    setMenuOpen: any;
    sendAction: any;
    thinkingSeats?: number[];
}

export const MyBattlefield = memo(({
    gameState,
    seat,
    mySeat,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen,
    sendAction,
    thinkingSeats
}: BattlefieldSharedProps & { seat: number }) => {
    const battlefieldIds = gameState.zoneIndex[seat]?.['BATTLEFIELD'] || [];
    const battlefield = battlefieldIds.map((oid: string) => gameState.objects[oid]).filter(Boolean);
    const { lands, creatures, others } = categorizeObjects(battlefield);
    
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const [tradeModalOpen, setTradeModalOpen] = React.useState(false);
    const [revealModalOpen, setRevealModalOpen] = React.useState(false);
    const [isThinkingCooldown, setIsThinkingCooldown] = React.useState(false);

    // Cooldown timer
    React.useEffect(() => {
        if (isThinkingCooldown) {
            const timer = setTimeout(() => setIsThinkingCooldown(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [isThinkingCooldown]);

    const opponents = Object.values(gameState.players).filter((p: any) => p.seat !== mySeat);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const cardId = e.dataTransfer.getData("text/plain");
        if (!cardId) return;
        
        const obj = gameState.objects[cardId];
        console.log('Drop:', cardId, obj);

        if (obj && obj.controller_seat == mySeat && obj.zone !== 'BATTLEFIELD') {
            sendAction('MOVE', { objectId: cardId, fromZone: obj.zone, toZone: 'BATTLEFIELD', toOwner: mySeat });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isDraggingOver) setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };
    
    const cardProps = { mySeat, cardScale, hoverBlockedRef, isDraggingRef, setHoveredCard, menuOpen, setMenuOpen, sendAction, inBattlefield: true };

    return (
        <div className="flex h-full w-full gap-1 relative">
          <style>{`
            @keyframes fadeOut {
              0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
            }
          `}</style>
          {thinkingSeats?.includes(mySeat) && (
              <div 
                className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
                style={{ animation: 'fadeOut 1s ease-out forwards' }}
              >
                  <div className="bg-white/90 text-black px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 border-slate-900 font-bold text-2xl flex items-center gap-3 backdrop-blur-sm">
                      <span className="text-3xl">💬</span> Thinking...
                  </div>
              </div>
          )}

          <div 
              className={`flex flex-col gap-0 p-0 bg-blue-900/10 rounded border ${isDraggingOver ? 'border-yellow-400 bg-blue-900/30' : 'border-blue-500/30'} h-full flex-1 transition-colors`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
          >
            <div className="text-xs text-blue-300 mb-0 flex-shrink-0">My Battlefield</div>
            
            {/* Row 1: Creatures (40%) */}
            <div className="flex gap-0 h-[33.3%] p-0 bg-gray-800/50 rounded items-center overflow-x-auto overflow-y-hidden relative no-scrollbar">
                <div className="text-xs text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10">Creatures</div>
                <div className="flex gap-0 h-full items-center pt-0 px-2 min-w-full w-max justify-center">
                    {creatures.map(obj => <Card key={obj.id} obj={obj} {...cardProps} />)}
                </div>
            </div>

            {/* Row 2: Others (40%) */}
            <div className="flex gap-0 h-[33.3%] p-0 bg-gray-800/50 rounded items-center overflow-x-auto overflow-y-hidden relative no-scrollbar">
                <div className="text-xs text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10">Non-Creatures</div>
                <div className="flex gap-0 h-full items-center pt-0 px-2 min-w-full w-max justify-center">
                    {others.map(obj => <Card key={obj.id} obj={obj} {...cardProps} />)}
                </div>
            </div>

            {/* Row 3: Lands (20%) */}
            <div className="flex gap-0 h-[33.3%] p-0 bg-gray-800/50 rounded items-center overflow-x-auto overflow-y-hidden relative no-scrollbar">
                <div className="text-xs text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10">Lands</div>
                <div className="flex gap-0 h-full items-center pt-0 px-2 min-w-full w-max justify-center">
                    {lands.map(obj => <Card key={obj.id} obj={obj} {...cardProps} />)}
                </div>
            </div>
          </div>

          {/* Side Toolbar */}
          <div className="w-24 flex flex-col gap-2 py-0 items-center bg-gray-800/50 rounded border border-gray-700">
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
          </div>
          
          {tradeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setTradeModalOpen(false)}>
                <div className="bg-slate-900 border border-amber-500 rounded-lg p-6 shadow-2xl min-w-[300px]" onClick={e => e.stopPropagation()}>
                    <h3 className="text-amber-500 font-serif font-bold text-xl mb-6 text-center">Select Trading Partner</h3>
                    <div className="flex flex-col gap-3">
                        {opponents.length === 0 && <div className="text-slate-500 text-center italic">No opponents available</div>}
                        {opponents.map((p: any) => (
                            <button 
                                key={p.seat}
                                className="p-3 bg-slate-800 hover:bg-amber-900/50 hover:border-amber-500 border border-slate-700 rounded text-slate-200 transition-all font-bold flex justify-between items-center group"
                                onClick={() => {
                                    sendAction('TRADE_INIT', { initiatorSeat: mySeat, targetSeat: p.seat });
                                    setTradeModalOpen(false);
                                }}
                            >
                                <span>{p.username}</span>
                                <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                            </button>
                        ))}
                        <button 
                            onClick={() => setTradeModalOpen(false)} 
                            className="mt-4 py-2 text-slate-500 hover:text-white border-t border-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
          )}

          {revealModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRevealModalOpen(false)}>
                <div className="bg-slate-900 border border-indigo-500 rounded-lg p-6 shadow-2xl min-w-[320px]" onClick={e => e.stopPropagation()}>
                    <h3 className="text-indigo-300 font-serif font-bold text-xl mb-6 text-center">Reveal Hand To...</h3>
                    <div className="flex flex-col gap-3">
                        <button 
                            className="p-3 bg-slate-800 hover:bg-indigo-900/50 hover:border-indigo-400 border border-slate-700 rounded text-slate-200 transition-all font-bold flex justify-between items-center group"
                            onClick={() => {
                                sendAction('REVEAL_START', { seat: mySeat, target: 'ALL' });
                                setRevealModalOpen(false);
                            }}
                        >
                            <span>Everyone</span>
                            <span className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        </button>
                        {opponents.length === 0 && <div className="text-slate-500 text-center italic">No opponents available</div>}
                        {opponents.map((p: any) => (
                            <button 
                                key={p.seat}
                                className="p-3 bg-slate-800 hover:bg-indigo-900/50 hover:border-indigo-400 border border-slate-700 rounded text-slate-200 transition-all font-bold flex justify-between items-center group"
                                onClick={() => {
                                    sendAction('REVEAL_START', { seat: mySeat, target: p.seat });
                                    setRevealModalOpen(false);
                                }}
                            >
                                <span>{p.username}</span>
                                <span className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                            </button>
                        ))}
                        <button 
                            onClick={() => setRevealModalOpen(false)} 
                            className="mt-4 py-2 text-slate-500 hover:text-white border-t border-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
    );
});

export const OpponentBattlefield = memo(({
    gameState,
    player,
    mySeat,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen,
    sendAction,
    thinkingSeats
}: { player: any } & BattlefieldSharedProps) => {
    const battlefieldIds = gameState.zoneIndex[player.seat]?.['BATTLEFIELD'] || [];
    const battlefield = battlefieldIds.map((oid: string) => gameState.objects[oid]).filter(Boolean);
    const { lands, creatures, others } = categorizeObjects(battlefield);
    
    const handCount = gameState.zoneIndex[player.seat]?.['HAND']?.length || 0;
    const libraryCount = gameState.zoneIndex[player.seat]?.['LIBRARY']?.length || 0;
    const graveyardCount = gameState.zoneIndex[player.seat]?.['GRAVEYARD']?.length || 0;
    const exileCount = gameState.zoneIndex[player.seat]?.['EXILE']?.length || 0;

    const cardProps = { mySeat, cardScale, hoverBlockedRef, isDraggingRef, setHoveredCard, menuOpen, setMenuOpen, sendAction, inBattlefield: true, size: 'small' as const };

    return (
        <div className="p-1 border border-red-900/50 rounded bg-red-900/10 w-full h-full flex flex-col gap-0 overflow-hidden relative">
            <style>{`
                @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
                }
            `}</style>
            {thinkingSeats?.includes(player.seat) && (
                <div 
                    className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
                    style={{ animation: 'fadeOut 1s ease-out forwards' }}
                >
                    <div className="bg-white/90 text-black px-5 py-2 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 border-red-900 font-bold text-xl flex items-center gap-2 backdrop-blur-sm">
                        <span className="text-2xl">💬</span> Thinking...
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center text-xs text-red-300 mb-1 flex-shrink-0">
                <span className="font-bold">{player.username}'s Battlefield</span>
                <div className="flex gap-3 mr-1">
                    <span title="Hand" className="flex items-center gap-1">✋ {handCount}</span>
                    <span title="Library" className="flex items-center gap-1">📚 {libraryCount}</span>
                    <span title="Graveyard" className="flex items-center gap-1">🪦 {graveyardCount}</span>
                    <span title="Exile" className="flex items-center gap-1">🌀 {exileCount}</span>
                </div>
            </div>
            
             {/* Row 1: Lands (Top for opponent - 20%) */}
             <div className="flex gap-0 h-[20%] p-0 bg-red-900/20 rounded items-center overflow-x-auto overflow-y-hidden no-scrollbar">
                 <div className="flex gap-2 h-full items-center px-2 min-w-full w-max justify-center">
                     {lands.map(obj => <Card key={obj.id} obj={obj} {...cardProps} />)}
                 </div>
             </div>

             {/* Row 2: Others (40%) */}
             <div className="flex gap-0 h-[40%] p-0 bg-red-900/20 rounded items-center overflow-x-auto overflow-y-hidden no-scrollbar">
                 <div className="flex gap-2 h-full items-center px-2 min-w-full w-max justify-center">
                     {others.map(obj => <Card key={obj.id} obj={obj} {...cardProps} />)}
                 </div>
             </div>

             {/* Row 3: Creatures (Bottom for opponent - 40%) */}
             <div className="flex gap-0 h-[40%] p-0 bg-red-900/20 rounded items-center overflow-x-auto overflow-y-hidden no-scrollbar">
                 <div className="flex gap-2 h-full items-center px-2 min-w-full w-max justify-center">
                     {creatures.map(obj => <Card key={obj.id} obj={obj} {...cardProps} />)}
                 </div>
             </div>
        </div>
    );
});
