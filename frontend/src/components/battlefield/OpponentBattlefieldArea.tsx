import React from 'react';
import { AutoStackingRow } from './AutoStackingRow';

interface OpponentBattlefieldAreaProps {
    creatures: any[];
    others: any[];
    lands: any[];
    cardProps: any;
}

export const OpponentBattlefieldArea: React.FC<OpponentBattlefieldAreaProps> = ({
    creatures,
    others,
    lands,
    cardProps
}) => {
    return (
        <>
            {/* Row 1: Lands & Non-Creatures (50%) - 2 Columns */}
            <div className="flex gap-0 h-[50%] w-full">
                {/* Col 1: Lands (50%) */}
                <div className="flex gap-0 w-1/2 h-full p-0 bg-red-900/20 rounded items-center overflow-hidden border-r border-red-900/30">
                     <AutoStackingRow objects={lands} cardProps={cardProps} className="justify-center" />
                </div>

                {/* Col 2: Others (50%) */}
                <div className="flex gap-0 w-1/2 h-full p-0 bg-red-900/20 rounded items-center overflow-hidden">
                    <AutoStackingRow objects={others} cardProps={cardProps} className="justify-center" />
                </div>
            </div>

            {/* Row 2: Creatures (Bottom for opponent - 50%) */}
            <div className="flex gap-0 h-[50%] p-0 bg-red-900/20 rounded items-center overflow-hidden">
                <AutoStackingRow objects={creatures} cardProps={cardProps} className="justify-center" />
            </div>
        </>
    );
};
