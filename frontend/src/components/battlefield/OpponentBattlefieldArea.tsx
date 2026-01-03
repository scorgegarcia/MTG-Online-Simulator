import React from 'react';
import { AutoStackingRow } from './AutoStackingRow';

interface OpponentBattlefieldAreaProps {
    creatures: any[];
    others: any[];
    lands: any[];
    cardProps: any;
    opponentPlaymatUrl?: string | null;
    showOriginalPlaymat?: boolean;
}

export const OpponentBattlefieldArea: React.FC<OpponentBattlefieldAreaProps> = ({
    creatures,
    others,
    lands,
    cardProps,
    opponentPlaymatUrl,
    showOriginalPlaymat
}) => {
    return (
        <div className="flex flex-col h-full w-full relative group overflow-hidden">
            {/* Playmat Background */}
            {opponentPlaymatUrl && (
                <div 
                    className={`absolute inset-0 pointer-events-none transition-all duration-700 ${showOriginalPlaymat ? 'opacity-100' : 'opacity-40 group-hover:opacity-50'}`}
                    style={{
                        backgroundImage: `url(${opponentPlaymatUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: showOriginalPlaymat ? 'none' : 'brightness(0.6) saturate(1.2)'
                    }}
                />
            )}

            <div className="flex-1 flex flex-col min-h-0 relative z-10">
                {/* Row 1: Lands & Non-Creatures (50%) - 2 Columns */}
                <div className="flex-1 min-h-0 flex gap-0 w-full overflow-hidden">
                    {/* Col 1: Lands (50%) */}
                    <div className="flex-1 min-w-0 h-full flex gap-0 p-0 bg-red-900/20 rounded items-center overflow-hidden relative border-r border-red-900/30">
                        <div className="text-[10px] uppercase tracking-tighter text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10 font-bold opacity-60">Lands</div>
                        <AutoStackingRow objects={lands} cardProps={cardProps} className="h-full justify-center w-full" />
                    </div>

                    {/* Col 2: Non-Creatures (50%) */}
                    <div className="flex-1 min-w-0 h-full flex gap-0 p-0 bg-red-900/20 rounded items-center overflow-hidden relative">
                        <div className="text-[10px] uppercase tracking-tighter text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10 font-bold opacity-60">Non-Creatures</div>
                        <AutoStackingRow objects={others} cardProps={cardProps} className="h-full justify-center w-full" />
                    </div>
                </div>

                {/* Row 2: Creatures (Bottom for opponent - 50%) */}
                <div className="flex-1 min-h-0 flex gap-0 w-full p-0 bg-red-900/20 rounded items-center overflow-hidden relative border-t border-red-900/30">
                    <div className="text-[10px] uppercase tracking-tighter text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10 font-bold opacity-60">Creatures</div>
                    <AutoStackingRow objects={creatures} cardProps={cardProps} className="h-full justify-center w-full" />
                </div>
            </div>
        </div>
    );
};
