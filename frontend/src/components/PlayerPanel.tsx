import React, { useRef } from 'react';
import clsx from 'clsx';
import { Card } from './Card';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { ZONE_LABELS } from '../utils/gameUtils';

interface PlayerPanelProps {
    gameState: any;
    mySeat: number;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sendAction: (action: string, payload: any) => void;
    panelHeight: number;
    commonProps: any;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
    gameState,
    mySeat,
    activeTab,
    setActiveTab,
    sendAction,
    panelHeight,
    commonProps
}) => {
    const libraryScrollRef = useRef<HTMLDivElement>(null);

    const getZoneObjects = (seat: number, zone: string) => {
        const ids = gameState.zoneIndex[seat]?.[zone] || [];
        return ids.map((oid: string) => gameState.objects[oid]).filter(Boolean);
    };

    const scrollLibrary = (direction: 'left' | 'right') => {
        if (libraryScrollRef.current) {
            const scrollAmount = 300;
            libraryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-slate-900 z-20 flex shadow-[0_-5px_15px_rgba(0,0,0,0.5)] relative" style={{ height: panelHeight }}>
            {/* Left Column: Zones */}
            <div className="flex-1 flex min-w-0 bg-slate-900">
                <div className="flex flex-col bg-slate-950 border-r border-slate-800 w-28 shrink-0">
                    {['HAND', 'LIBRARY', 'GRAVEYARD', 'EXILE', 'COMMAND', 'SIDEBOARD'].map(zone => {
                        const isActive = activeTab === zone;
                        const count = getZoneObjects(mySeat, zone).length;
                        return (
                            <button
                                key={zone}
                                onClick={() => {
                                    setActiveTab(zone);
                                    if(zone === 'LIBRARY') {
                                        sendAction('PEEK_LIBRARY', {});
                                    } else {
                                        sendAction('PEEK_ZONE', { zone });
                                    }
                                }}
                                className={clsx(
                                    "w-full px-1 py-1 text-[11px] font-bold tracking-widest border-b border-slate-800 transition-all relative overflow-hidden group",
                                    isActive 
                                        ? "bg-slate-900 text-amber-500 shadow-[inset_3px_0_0_0_#f59e0b]" 
                                        : "bg-slate-950 text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                                )}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const cardId = e.dataTransfer.getData("text/plain");
                                    if (!cardId) return;
                                    const obj = gameState.objects[cardId];
                                    if (obj && obj.controller_seat === mySeat && obj.zone !== zone) {
                                        sendAction('MOVE', { 
                                            objectId: cardId, 
                                            fromZone: obj.zone, 
                                            toZone: zone, 
                                            toOwner: mySeat,
                                            position: zone === 'LIBRARY' ? 'top' : undefined
                                        });
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <span className="relative z-10 flex items-center justify-between gap-2">
                                    <span className="truncate">{ZONE_LABELS[zone]}</span>
                                    <span className={clsx("px-1.5 py-0.5 rounded text-[10px] shrink-0", isActive ? "bg-amber-950/50 text-amber-400 border border-amber-900" : "bg-slate-800 text-slate-400")}>
                                        {count}
                                    </span>
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div 
                    className={clsx(
                        "flex-1 min-w-0 px-1 py-1 flex gap-1 items-stretch bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-slate-900 shadow-inner relative transition-colors",
                        activeTab === 'LIBRARY' ? "overflow-hidden" : "overflow-x-auto custom-scrollbar"
                    )}
                    onDrop={(e) => {
                        e.preventDefault();
                        const cardId = e.dataTransfer.getData("text/plain");
                        if (!cardId) return;
                        const obj = gameState.objects[cardId];
                        if (obj && obj.controller_seat === mySeat) {
                             if (obj.zone !== activeTab || activeTab === 'HAND' || activeTab === 'LIBRARY') {
                                sendAction('MOVE', { 
                                    objectId: cardId, 
                                    fromZone: obj.zone, 
                                    toZone: activeTab, 
                                    toOwner: mySeat,
                                    position: activeTab === 'LIBRARY' ? 'top' : undefined
                                });
                             }
                        }
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                    }}
                >
                    <div className="absolute inset-0 bg-black/20 pointer-events-none z-0"></div>

                    {activeTab === 'HAND' && getZoneObjects(mySeat, 'HAND').map((obj: any, index: number) => (
                        <div 
                            key={obj.id} 
                            className="relative z-10 h-full flex items-stretch"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const cardId = e.dataTransfer.getData("text/plain");
                                if (!cardId) return;
                                const draggedObj = gameState.objects[cardId];
                                if (draggedObj && draggedObj.controller_seat === mySeat) {
                                    sendAction('MOVE', { 
                                        objectId: cardId, 
                                        fromZone: draggedObj.zone, 
                                        toZone: 'HAND', 
                                        toOwner: mySeat, 
                                        index: index 
                                    });
                                }
                            }}
                        >
                            <Card obj={obj} size="normal" inHand={true} fitHeight={true} {...commonProps} />
                        </div>
                    ))}

                    {activeTab === 'LIBRARY' && (
                        <div className="flex-1 min-w-0 w-full h-full relative group z-10">
                            <button 
                                data-scroll-button="true"
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm transform hover:scale-110"
                                onClick={(e) => { e.stopPropagation(); scrollLibrary('left'); }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div ref={libraryScrollRef} className="flex gap-2 overflow-x-auto py-0 scroll-smooth no-scrollbar px-12 w-full h-full items-stretch">
                                {getZoneObjects(mySeat, 'LIBRARY').map((obj: any, i: number) => (
                                    <div key={obj.id} className="relative group min-w-max h-full flex items-stretch transform hover:-translate-y-2 transition-transform duration-200">
                                        <Card obj={obj} size="small" fitHeight={true} {...commonProps} />
                                        <div className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 shadow-sm z-20">{i+1}</div>
                                    </div>
                                ))}
                                {getZoneObjects(mySeat, 'LIBRARY').length === 0 && (
                                    <div className="text-slate-500 italic p-4 w-full text-center border-2 border-dashed border-slate-800 rounded-lg">
                                        Grimoire is empty
                                    </div>
                                )}
                            </div>
                            <button 
                                data-scroll-button="true"
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm transform hover:scale-110"
                                onClick={(e) => { e.stopPropagation(); scrollLibrary('right'); }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {(activeTab === 'GRAVEYARD' || activeTab === 'EXILE' || activeTab === 'COMMAND' || activeTab === 'SIDEBOARD') && getZoneObjects(mySeat, activeTab).map((obj: any) => (
                        <div key={obj.id} className="relative z-10 opacity-90 hover:opacity-100 transition-opacity h-full flex items-stretch">
                            <Card obj={obj} size="small" fitHeight={true} {...commonProps} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Deck Draw */}
            <div className="w-36 bg-slate-950 border-l border-amber-500/20 flex flex-col items-center justify-center p-3 relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20"></div>
                <div 
                        className="w-24 h-36 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl relative bg-slate-900 border-2 border-slate-700 group ring-4 ring-transparent hover:ring-amber-500/20 z-10"
                        onClick={() => sendAction('DRAW', { seat: mySeat, n: 1 })}
                >
                        {(gameState.zoneIndex[mySeat]?.['LIBRARY']?.length || 0) > 0 ? (
                            <>
                                <img 
                                    src="https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg" 
                                    className="w-full h-full object-cover rounded-md opacity-90 group-hover:opacity-100 transition-opacity"
                                    alt="Library"
                                />
                                {/* Deck Thickness effect */}
                                <div className="absolute top-0.5 left-0.5 w-full h-full border-r-2 border-b-2 border-black/50 rounded-md pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 border-2 border-dashed border-slate-800 rounded-md">
                                <Layers size={24} />
                                <span className="text-[10px] font-bold uppercase">Empty</span>
                            </div>
                        )}
                        
                        <div className="absolute -bottom-3 -right-3 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-slate-900 shadow-lg z-20 group-hover:scale-110 transition-transform">
                            {gameState.zoneIndex[mySeat]?.['LIBRARY']?.length || 0}
                        </div>
                </div>
                <div className="text-[10px] text-amber-500/60 font-bold mt-0 uppercase tracking-[0.2em] relative z-10">DRAW CARD</div>
            </div>
        </div>
    );
};
