import { categorizeObjects } from '../utils/gameUtils';
import { ReadOnlyZoneModal } from './ReadOnlyZoneModal';
import React, { memo } from 'react';
import { MyBattlefieldArea } from './battlefield/MyBattlefieldArea';
import { OpponentBattlefieldArea } from './battlefield/OpponentBattlefieldArea';

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

          <MyBattlefieldArea 
            isDraggingOver={isDraggingOver}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            creatures={creatures}
            others={others}
            lands={lands}
            cardProps={cardProps}
          />
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

    const [viewZone, setViewZone] = React.useState<{zone: 'GRAVEYARD' | 'EXILE', seat: number} | null>(null);

    const cardProps = { mySeat, cardScale, hoverBlockedRef, isDraggingRef, setHoveredCard, menuOpen, setMenuOpen, sendAction, inBattlefield: true, size: 'small' as const };

    return (
        <div className="p-0 border border-red-900/50 rounded bg-red-900/10 w-full h-full flex flex-col gap-0 overflow-hidden relative">
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
            <div className="flex justify-between items-center text-s text-red-300 mb-1 flex-shrink-0">
                <div className="flex items-center gap-1 font-bold">
                    <span>{player.username}'s Battlefield</span>
                    <span title="Commander Damage Dealt to You" className="cursor-help ml-1">
                        - 🛡️({gameState.players[mySeat]?.commanderDamageReceived?.[player.seat] || 0})
                    </span>
                    {[
                        { key: 'commanderTax', label: 'Tax', icon: '💸' },
                        { key: 'poison', label: 'Poison', icon: '☠️' },
                        { key: 'energy', label: 'Energy', icon: '⚡' },
                        { key: 'experience', label: 'Exp', icon: '🎓' },
                        { key: 'storm', label: 'Storm', icon: '⛈️' },
                        { key: 'charge', label: 'Charge', icon: '🔋' },
                    ].map(({ key, label, icon }) => {
                        const count = player.counters?.[key] || 0;
                        if (count <= 0) return null;
                        return (
                            <span key={key} title={label} className="cursor-help ml-2 mb-10">
                                - {icon}({count})
                            </span>
                        );
                    })}
                </div>
                <div className="flex gap-3 mr-1">
                    <span title="Hand" className="flex items-center gap-1">✋ {handCount}</span>
                    <span title="Library" className="flex items-center gap-1">📚 {libraryCount}</span>
                    <button 
                        title="View Graveyard" 
                        className="flex items-center gap-1 hover:text-white hover:bg-red-800/50 rounded px-1 transition-colors"
                        onClick={() => setViewZone({ zone: 'GRAVEYARD', seat: player.seat })}
                    >
                        🪦 {graveyardCount}
                    </button>
                    <button 
                        title="View Exile" 
                        className="flex items-center gap-1 hover:text-white hover:bg-red-800/50 rounded px-1 transition-colors"
                        onClick={() => setViewZone({ zone: 'EXILE', seat: player.seat })}
                    >
                        🌀 {exileCount}
                    </button>
                </div>
            </div>
            
            <OpponentBattlefieldArea
                creatures={creatures}
                others={others}
                lands={lands}
                cardProps={cardProps}
            />

            {viewZone && (
                <div className="absolute inset-0 z-50">
                    <ReadOnlyZoneModal 
                        gameState={gameState}
                        seat={viewZone.seat}
                        zone={viewZone.zone}
                        onClose={() => setViewZone(null)}
                        mySeat={mySeat}
                        hoverBlockedRef={hoverBlockedRef}
                        setHoveredCard={setHoveredCard}
                    />
                </div>
            )}
        </div>
    );
});
