import { Card } from './Card';

interface ReadOnlyZoneModalProps {
    gameState: any;
    seat: number;
    zone: 'GRAVEYARD' | 'EXILE';
    onClose: () => void;
    mySeat: number;
    hoverBlockedRef: any;
    setHoveredCard: any;
}

export const ReadOnlyZoneModal = ({
    gameState,
    seat,
    zone,
    onClose,
    mySeat,
    hoverBlockedRef,
    setHoveredCard
}: ReadOnlyZoneModalProps) => {
    const player = gameState.players[seat];
    const zoneIds = gameState.zoneIndex[seat]?.[zone] || [];
    const objects = zoneIds.map((id: string) => gameState.objects[id]).filter(Boolean);

    const title = zone === 'GRAVEYARD' ? `${player.username}'s Graveyard` : `${player.username}'s Exile`;
    const icon = zone === 'GRAVEYARD' ? '🪦' : '🌀';

    // Dummy props for Card to prevent interaction
    const cardProps = {
        mySeat,
        cardScale: 1, // Fixed scale for modal
        hoverBlockedRef,
        isDraggingRef: { current: false } as any,
        setHoveredCard,
        menuOpen: null,
        setMenuOpen: () => {},
        sendAction: () => {},
        inBattlefield: false,
        size: 'normal' as const
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg" onClick={onClose}>
            <div 
                className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-2xl w-full h-full flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                    <h3 className="text-gray-200 font-serif font-bold text-lg flex items-center gap-2">
                        <span>{icon}</span> {title}
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-bold text-sm">{objects.length} cards</span>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-lg font-bold px-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 bg-gray-900/50 rounded inner-shadow">
                    {objects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                            <span className="text-2xl mb-1 opacity-30">{icon}</span>
                            <span className="text-sm">Empty</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {objects.map((obj: any) => (
                                <div key={obj.id} className="relative group">
                                    <Card obj={obj} {...cardProps} size="small" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
