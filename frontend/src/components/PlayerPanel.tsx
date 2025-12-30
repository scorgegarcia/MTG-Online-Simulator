import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Card } from './Card';
import { Layers, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';
import { ZONE_LABELS } from '../utils/gameUtils';
import handIcon from '../assets/img/hand_icon.png';

interface ZonePileProps {
    label: string;
    count: number;
    topCard: any | null;
    onClick: () => void;
    onDrop: (e: React.DragEvent) => void;
    isLibrary?: boolean;
    isHand?: boolean;
    iconSrc?: string;
    commonProps: any;
    sendAction: (action: string, payload: any) => void;
}

const ZonePile: React.FC<ZonePileProps> = ({
    label,
    count,
    topCard,
    onClick,
    onDrop,
    isLibrary = false,
    isHand = false,
    iconSrc,
    commonProps,
    sendAction
}) => {
    const isDraggable = isLibrary && count > 0;

    const handleDragStart = (e: React.DragEvent) => {
        if (!isDraggable || !topCard) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", topCard.id);
    };

    return (
        <div 
            className="flex flex-col items-center gap-1 relative group"
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            }}
            onDrop={onDrop}
        >
            <div 
                className={clsx(
                    "w-20 h-28 rounded cursor-pointer relative transition-all shadow-lg border border-slate-700 bg-slate-900 hover:ring-2 hover:ring-amber-500/50",
                    isLibrary && "hover:scale-105 active:scale-95"
                )}
                onClick={onClick}
                draggable={isDraggable}
                onDragStart={handleDragStart}
            >
                {isHand ? (
                    <img
                        src={iconSrc || handIcon}
                        className="w-full h-full object-contain p-3 opacity-90 group-hover:opacity-100 transition-opacity"
                        alt={label}
                        draggable={false}
                    />
                ) : count > 0 ? (
                    isLibrary ? (
                        <>
                            <img 
                                src="https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg" 
                                className="w-full h-full object-cover rounded opacity-90 group-hover:opacity-100 transition-opacity"
                                alt={label}
                            />
                            <div className="absolute top-0.5 left-0.5 w-full h-full border-r border-b border-black/50 rounded pointer-events-none"></div>
                        </>
                    ) : (
                         topCard ? (
                            <div className="w-full h-full pointer-events-none">
                                <Card 
                                    obj={topCard} 
                                    size="small" 
                                    fitHeight={true} 
                                    {...commonProps} 
                                    sendAction={sendAction}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded flex items-center justify-center">
                                <Layers size={16} className="text-slate-600" />
                            </div>
                        )
                    )
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-slate-800 rounded flex flex-col items-center justify-center text-slate-600 gap-1">
                        <span className="text-[10px] font-bold uppercase opacity-50">{label.substring(0, 3)}</span>
                    </div>
                )}

                <div className="absolute -bottom-2 -right-2 bg-slate-800 text-slate-200 border border-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-md z-20">
                    {count}
                </div>
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
        </div>
    );
};

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
    const handScrollRef = useRef<HTMLDivElement>(null);
    const zoneViewScrollRef = useRef<HTMLDivElement>(null);
    const prevTabRef = useRef<string | null>(null);

    const [zonesPanelWidth, setZonesPanelWidth] = useState(() => {
        const stored = parseFloat(localStorage.getItem('setting_zonesPanelWidth') || '');
        const base = Number.isFinite(stored) && stored > 0 ? stored : 340;
        return Math.max(340, base);
    });
    const isResizingZonesPanel = useRef(false);
    const zonesResizeStartX = useRef(0);
    const zonesResizeStartWidth = useRef(0);

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

    const scrollHand = (direction: 'left' | 'right') => {
        if (handScrollRef.current) {
            const scrollAmount = 300;
            handScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const scrollZoneView = (direction: 'left' | 'right') => {
        if (zoneViewScrollRef.current) {
            const scrollAmount = 300;
            zoneViewScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!isResizingZonesPanel.current) return;
            const dx = zonesResizeStartX.current - e.clientX;
            const minWidth = 340;
            const maxWidth = Math.max(minWidth, window.innerWidth - 240);
            const next = zonesResizeStartWidth.current + dx;
            setZonesPanelWidth(Math.max(minWidth, Math.min(maxWidth, next)));
        };

        const handlePointerUp = () => {
            if (!isResizingZonesPanel.current) return;
            isResizingZonesPanel.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = '';
            localStorage.setItem('setting_zonesPanelWidth', zonesPanelWidth.toString());
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [zonesPanelWidth]);

    const currentTab = activeTab || 'HAND';
    const isViewingHand = currentTab === 'HAND';

    useEffect(() => {
        if (prevTabRef.current === null) {
            prevTabRef.current = currentTab;
            return;
        }
        if (prevTabRef.current === currentTab) return;
        prevTabRef.current = currentTab;

        if (currentTab === 'LIBRARY') {
            sendAction('PEEK_LIBRARY', { seat: mySeat });
            return;
        }

        if (['HAND', 'GRAVEYARD', 'EXILE', 'COMMAND', 'SIDEBOARD'].includes(currentTab)) {
            sendAction('PEEK_ZONE', { seat: mySeat, zone: currentTab });
        }
    }, [currentTab, mySeat, sendAction]);

    const handleZoneDrop = (e: React.DragEvent, targetZone: string) => {
        e.preventDefault();
        e.stopPropagation();
        const cardId = e.dataTransfer.getData("text/plain");
        if (!cardId) return;
        const obj = gameState.objects[cardId];
        if (obj && obj.controller_seat === mySeat && obj.zone !== targetZone) {
            sendAction('MOVE', { 
                objectId: cardId, 
                fromZone: obj.zone, 
                toZone: targetZone, 
                toOwner: mySeat,
                position: targetZone === 'LIBRARY' ? 'top' : undefined
            });
        }
    };

    const getTopCard = (zone: string) => {
        const objs = getZoneObjects(mySeat, zone);
        if (objs.length === 0) return null;
        if (zone === 'LIBRARY') {
            return objs[0];
        }
        return objs[objs.length - 1];
    };

    return (
        <div className="bg-slate-900 z-[0] flex shadow-[0_-5px_15px_rgba(0,0,0,0.5)] relative" style={{ height: panelHeight }}>
            
            <div 
                className={clsx(
                    "flex-1 min-w-0 px-1 py-1 flex gap-1 items-stretch bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-slate-900 shadow-inner relative transition-colors",
                    isViewingHand || currentTab === 'LIBRARY' ? "overflow-hidden" : "overflow-x-auto custom-scrollbar"
                )}
                onDrop={(e) => {
                    e.preventDefault();
                    if (!isViewingHand && currentTab !== 'LIBRARY') return;
                    
                    const cardId = e.dataTransfer.getData("text/plain");
                    if (!cardId) return;
                    const obj = gameState.objects[cardId];
                    if (obj && obj.controller_seat === mySeat) {
                        const targetZone = currentTab;
                        if (obj.zone !== targetZone) {
                             sendAction('MOVE', { 
                                objectId: cardId, 
                                fromZone: obj.zone, 
                                toZone: targetZone, 
                                toOwner: mySeat,
                                position: targetZone === 'LIBRARY' ? 'top' : undefined
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

                {!isViewingHand && (
                    <button 
                        onClick={() => setActiveTab('HAND')}
                        className="absolute left-2 top-2 z-50 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md shadow-md flex items-center gap-2 text-xs font-bold border border-slate-600 transition-colors"
                    >
                        <Undo2 size={14} />
                        Back to Hand
                    </button>
                )}

                {!isViewingHand && (
                    <div className="absolute top-2 right-2 z-40 bg-black/40 px-3 py-1 rounded text-xs text-slate-300 font-bold tracking-widest pointer-events-none uppercase border border-white/10">
                        Viewing: {ZONE_LABELS[currentTab]}
                    </div>
                )}

                {isViewingHand && (
                    <div className="flex-1 min-w-0 w-full h-full relative group z-10">
                        <button
                            data-scroll-button="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-[130] bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onMouseEnter={() => commonProps?.setHoveredCard?.(null)}
                            onClick={(e) => { e.stopPropagation(); scrollHand('left'); }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div ref={handScrollRef} className="flex gap-1 overflow-x-auto scroll-smooth no-scrollbar px-12 w-full h-full items-stretch overscroll-x-contain touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {getZoneObjects(mySeat, 'HAND').map((obj: any, index: number) => (
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
                                    <Card obj={obj} size="normal" inHand={true} fitHeight={true} {...commonProps} sendAction={sendAction} />
                                </div>
                            ))}
                        </div>
                        <button
                            data-scroll-button="true"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-[130] bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onMouseEnter={() => commonProps?.setHoveredCard?.(null)}
                            onClick={(e) => { e.stopPropagation(); scrollHand('right'); }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {currentTab === 'LIBRARY' && (
                    <div className="flex-1 min-w-0 w-full h-full relative group z-10 pt-8">
                         <button 
                            data-scroll-button="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-[130] bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onMouseEnter={() => commonProps?.setHoveredCard?.(null)}
                            onClick={(e) => { e.stopPropagation(); scrollLibrary('left'); }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div ref={libraryScrollRef} className="flex gap-2 overflow-x-auto py-0 scroll-smooth no-scrollbar px-12 w-full h-full items-stretch overscroll-x-contain touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {getZoneObjects(mySeat, 'LIBRARY').map((obj: any, i: number) => (
                                <div key={obj.id} className="relative group min-w-max h-full flex items-stretch transform hover:-translate-y-2 transition-transform duration-200">
                                    <Card obj={obj} size="small" fitHeight={true} {...commonProps} sendAction={sendAction} />
                                    <div className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 shadow-sm z-20">{i+1}</div>
                                </div>
                            ))}
                        </div>
                         <button 
                            data-scroll-button="true"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-[130] bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onMouseEnter={() => commonProps?.setHoveredCard?.(null)}
                            onClick={(e) => { e.stopPropagation(); scrollLibrary('right'); }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {['GRAVEYARD', 'EXILE', 'COMMAND', 'SIDEBOARD'].includes(currentTab) && (
                    <div className="flex-1 min-w-0 w-full h-full relative group z-10 pt-12">
                        <button
                            data-scroll-button="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-[130] bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onMouseEnter={() => commonProps?.setHoveredCard?.(null)}
                            onClick={(e) => { e.stopPropagation(); scrollZoneView('left'); }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div ref={zoneViewScrollRef} className="flex gap-2 overflow-x-auto scroll-smooth no-scrollbar px-12 w-full h-full items-start overscroll-x-contain touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {getZoneObjects(mySeat, currentTab).map((obj: any) => (
                                <div key={obj.id} className="relative z-10 opacity-90 hover:opacity-100 transition-opacity h-full max-h-full aspect-[2.5/3.5]">
                                    <Card obj={obj} size="small" fitHeight={true} {...commonProps} sendAction={sendAction} />
                                </div>
                            ))}
                            {getZoneObjects(mySeat, currentTab).length === 0 && (
                                <div className="w-full text-center text-slate-500 italic mt-10">Zone is empty</div>
                            )}
                        </div>
                        <button
                            data-scroll-button="true"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-[130] bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onMouseEnter={() => commonProps?.setHoveredCard?.(null)}
                            onClick={(e) => { e.stopPropagation(); scrollZoneView('right'); }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div
                className="w-2 bg-gradient-to-b from-slate-900 via-amber-700/30 to-slate-900 hover:via-amber-500/40 cursor-col-resize transition-colors z-40 touch-action-none"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => {
                    e.preventDefault();
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    isResizingZonesPanel.current = true;
                    zonesResizeStartX.current = e.clientX;
                    zonesResizeStartWidth.current = zonesPanelWidth;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                }}
            />

            <div
                className="min-w-[340px] shrink-0 bg-slate-950 border-l border-amber-500/20 flex flex-col p-2 relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] z-30"
                style={{ width: `${zonesPanelWidth}px` }}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20 pointer-events-none"></div>
                
                <div className="flex gap-1 flex-nowrap h-full items-center justify-center z-10 px-1">
                    {(() => {
                        const isHandSlot = !isViewingHand && currentTab === 'LIBRARY';
                        return (
                    <ZonePile 
                        label={isHandSlot ? 'HAND' : 'Library'}
                        count={isHandSlot ? getZoneObjects(mySeat, 'HAND').length : getZoneObjects(mySeat, 'LIBRARY').length}
                        topCard={isHandSlot ? null : getTopCard('LIBRARY')}
                        onClick={() => (isHandSlot ? setActiveTab('HAND') : sendAction('DRAW', { seat: mySeat, n: 1 }))}
                        onDrop={(e) => handleZoneDrop(e, isHandSlot ? 'HAND' : 'LIBRARY')}
                        isLibrary={!isHandSlot}
                        isHand={isHandSlot}
                        commonProps={commonProps}
                        sendAction={sendAction}
                    />
                        );
                    })()}
                    {(() => {
                        const isHandSlot = !isViewingHand && currentTab === 'GRAVEYARD';
                        return (
                    <ZonePile 
                        label={isHandSlot ? 'HAND' : 'Graveyard'}
                        count={isHandSlot ? getZoneObjects(mySeat, 'HAND').length : getZoneObjects(mySeat, 'GRAVEYARD').length}
                        topCard={isHandSlot ? null : getTopCard('GRAVEYARD')}
                        onClick={() => (isHandSlot ? setActiveTab('HAND') : setActiveTab('GRAVEYARD'))}
                        onDrop={(e) => handleZoneDrop(e, isHandSlot ? 'HAND' : 'GRAVEYARD')}
                        isHand={isHandSlot}
                        iconSrc={handIcon}
                        commonProps={commonProps}
                        sendAction={sendAction}
                    />
                        );
                    })()}
                    {(() => {
                        const isHandSlot = !isViewingHand && currentTab === 'EXILE';
                        return (
                    <ZonePile 
                        label={isHandSlot ? 'HAND' : 'Exile'}
                        count={isHandSlot ? getZoneObjects(mySeat, 'HAND').length : getZoneObjects(mySeat, 'EXILE').length}
                        topCard={isHandSlot ? null : getTopCard('EXILE')}
                        onClick={() => (isHandSlot ? setActiveTab('HAND') : setActiveTab('EXILE'))}
                        onDrop={(e) => handleZoneDrop(e, isHandSlot ? 'HAND' : 'EXILE')}
                        isHand={isHandSlot}
                        iconSrc={handIcon}
                        commonProps={commonProps}
                        sendAction={sendAction}
                    />
                        );
                    })()}
                    {(() => {
                        const isHandSlot = !isViewingHand && currentTab === 'COMMAND';
                        return (
                    <ZonePile 
                        label={isHandSlot ? 'HAND' : 'Command'}
                        count={isHandSlot ? getZoneObjects(mySeat, 'HAND').length : getZoneObjects(mySeat, 'COMMAND').length}
                        topCard={isHandSlot ? null : getTopCard('COMMAND')}
                        onClick={() => (isHandSlot ? setActiveTab('HAND') : setActiveTab('COMMAND'))}
                        onDrop={(e) => handleZoneDrop(e, isHandSlot ? 'HAND' : 'COMMAND')}
                        isHand={isHandSlot}
                        iconSrc={handIcon}
                        commonProps={commonProps}
                        sendAction={sendAction}
                    />
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};
