import React from 'react';
import { AutoStackingRow } from './AutoStackingRow';

interface MyBattlefieldAreaProps {
    isDraggingOver: boolean;
    handleDrop: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    creatures: any[];
    others: any[];
    lands: any[];
    cardProps: any;
}

export const MyBattlefieldArea: React.FC<MyBattlefieldAreaProps> = ({
    isDraggingOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    creatures,
    others,
    lands,
    cardProps
}) => {
    return (
        <div 
            className={`flex flex-col gap-0 p-0 bg-blue-900/10 rounded border ${isDraggingOver ? 'border-yellow-400 bg-blue-900/30' : 'border-blue-500/30'} h-full flex-1 transition-colors`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
        <div className="text-xs text-blue-300 mb-0 flex-shrink-0">My Battlefield</div>
        
        {/* Row 1: Creatures (50%) */}
        <div className="flex gap-0 h-[50%] p-0 bg-gray-800/50 rounded items-center overflow-hidden relative">
            <div className="text-xs text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10">Creatures</div>
            <AutoStackingRow objects={creatures} cardProps={cardProps} className="pt-0 justify-center" />
        </div>

        {/* Row 2: Lands & Non-Creatures (50%) - 2 Columns */}
        <div className="flex gap-0 h-[50%] w-full">
             {/* Col 1: Lands (50%) */}
            <div className="flex gap-0 w-1/2 h-full p-0 bg-gray-800/50 rounded items-center overflow-hidden relative border-r border-gray-700/50">
                <div className="text-xs text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10">Lands</div>
                <AutoStackingRow objects={lands} cardProps={cardProps} className="pt-0 justify-center" />
            </div>

            {/* Col 2: Non-Creatures (50%) */}
            <div className="flex gap-0 w-1/2 h-full p-0 bg-gray-800/50 rounded items-center overflow-hidden relative">
                <div className="text-xs text-gray-500 w-full absolute top-1 left-2 pointer-events-none z-10">Non-Creatures</div>
                <AutoStackingRow objects={others} cardProps={cardProps} className="pt-0 justify-center" />
            </div>
        </div>
        </div>
    );
};
