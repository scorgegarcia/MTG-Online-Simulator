import React from 'react';

interface CommanderDamageOverlayProps {
    gameState: any;
    seat: number;
}

export const CommanderDamageOverlay: React.FC<CommanderDamageOverlayProps> = ({ gameState, seat }) => {
    const player = gameState.players[seat];
    if (!player) return null;

    const damageReceived = player.commanderDamageReceived || {};
    const attackers = Object.entries(damageReceived).filter(([_, damage]) => (damage as number) > 0);

    if (attackers.length === 0) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-40 rounded-lg border-2 border-red-900/50 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-red-950 to-black p-6 rounded-xl border border-red-500/30 shadow-2xl flex flex-col items-center gap-2">
                    <span className="text-4xl">🛡️</span>
                    <span className="text-red-200 font-bold uppercase tracking-widest text-sm">No Commander Damage</span>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] z-40 rounded-lg animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-red-900 via-red-950 to-black p-5 rounded-xl border-2 border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.3)] min-w-[200px] flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 border-b border-red-500/30 pb-2">
                    <span className="text-2xl">⚔️</span>
                    <h3 className="text-red-100 font-black uppercase tracking-tighter text-lg">Commander Damage</h3>
                    <span className="text-2xl">⚔️</span>
                </div>
                
                <div className="flex flex-col gap-3">
                    {attackers.map(([attackerSeat, damage]) => {
                        const attacker = gameState.players[attackerSeat];
                        const damageNum = damage as number;
                        const isLethal = damageNum >= 21;
                        
                        return (
                            <div key={attackerSeat} className="flex items-center justify-between gap-4 bg-red-500/10 p-2 rounded border border-red-500/20">
                                <div className="flex flex-col">
                                    <span className="text-xs text-red-400 font-bold uppercase tracking-tight">From</span>
                                    <span className="text-white font-bold">{attacker?.username || `Seat ${attackerSeat}`}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-3xl font-black ${isLethal ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>
                                        {damageNum}
                                    </span>
                                    <span className="text-red-600/50 text-xl">/ 21</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-2 text-center">
                    <span className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest">Received by {player.username}</span>
                </div>
            </div>
        </div>
    );
};
