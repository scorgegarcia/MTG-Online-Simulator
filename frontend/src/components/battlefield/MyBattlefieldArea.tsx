import React from 'react';
import { AutoStackingRow } from './AutoStackingRow';
import { useAuth } from '../../context/AuthContext';

interface MyBattlefieldAreaProps {
    isDraggingOver: boolean;
    handleDrop: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    creatures: any[];
    others: any[];
    lands: any[];
    cardProps: any;
    showOriginalPlaymat?: boolean;
    onReorder: (cardId: string, targetId?: string, side?: 'left' | 'right') => void;
}

export const MyBattlefieldArea: React.FC<MyBattlefieldAreaProps> = ({
    isDraggingOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    creatures,
    others,
    lands,
    cardProps,
    showOriginalPlaymat,
    onReorder
}) => {
    const { user } = useAuth();

    const handleReorderDrop = (e: React.DragEvent, targetId?: string, side?: 'left' | 'right') => {
        e.preventDefault();
        e.stopPropagation();
        const cardId = e.dataTransfer.getData("text/plain");
        if (!cardId) return;
        onReorder(cardId, targetId, side);
    };

    return (
        <div 
            className={`flex flex-col gap-0 p-0 bg-blue-900/10 rounded border ${isDraggingOver ? 'border-yellow-400 bg-blue-900/30' : 'border-blue-500/30'} h-full w-full flex-1 transition-colors overflow-hidden relative group`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {/* Playmat Background */}
            {user?.playmat_url && (
                <div 
                    className={`absolute inset-0 pointer-events-none transition-all duration-700 ${showOriginalPlaymat ? 'opacity-100' : 'opacity-40 group-hover:opacity-50'}`}
                    style={{
                        backgroundImage: `url(${user.playmat_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: showOriginalPlaymat ? 'none' : 'brightness(0.6) saturate(1.2)'
                    }}
                />
            )}

            <div className="text-xs text-blue-300 mb-0 flex-shrink-0 relative z-10 px-2 py-1 bg-slate-900/40 backdrop-blur-sm border-b border-blue-500/20">My Battlefield</div>
            
            <div className="flex-1 flex flex-col min-h-0 relative z-10">
                {/* Row 1: Creatures (50%) */}
                <div 
                    className="flex-1 min-h-0 flex gap-0 w-full p-0 bg-gray-800/20 rounded items-center overflow-hidden relative border-b border-gray-700/30"
                    onDrop={(e) => handleReorderDrop(e)}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                >
                    <div className="text-[10px] uppercase tracking-tighter text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10 font-bold opacity-60">Creatures</div>
                    <AutoStackingRow 
                        objects={creatures} 
                        cardProps={cardProps} 
                        className="h-full justify-center w-full" 
                        onCardDrop={(e, targetId) => handleReorderDrop(e, targetId)}
                    />
                </div>

                {/* Row 2: Lands & Non-Creatures (50%) - 2 Columns */}
                <div className="flex-1 min-h-0 flex gap-0 w-full overflow-hidden">
                    {/* Col 1: Lands (50%) */}
                    <div 
                        className="flex-1 min-w-0 h-full flex gap-0 p-0 bg-gray-800/20 rounded items-center overflow-hidden relative border-r border-gray-700/30"
                        onDrop={(e) => handleReorderDrop(e)}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                    >
                        <div className="text-[10px] uppercase tracking-tighter text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10 font-bold opacity-60">Lands</div>
                        <AutoStackingRow 
                            objects={lands} 
                            cardProps={cardProps} 
                            className="h-full justify-center w-full" 
                            onCardDrop={(e, targetId) => handleReorderDrop(e, targetId)}
                        />
                    </div>

                    {/* Col 2: Non-Creatures (50%) */}
                    <div 
                        className="flex-1 min-w-0 h-full flex gap-0 p-0 bg-gray-800/20 rounded items-center overflow-hidden relative"
                        onDrop={(e) => handleReorderDrop(e)}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                    >
                        <div className="text-[10px] uppercase tracking-tighter text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10 font-bold opacity-60">Non-Creatures</div>
                        <AutoStackingRow 
                            objects={others} 
                            cardProps={cardProps} 
                            className="h-full justify-center w-full" 
                            onCardDrop={(e, targetId) => handleReorderDrop(e, targetId)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
