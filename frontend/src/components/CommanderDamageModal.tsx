interface CommanderDamageModalProps {
    gameState: any;
    mySeat: number;
    onClose: () => void;
    sendAction: (type: string, payload: any) => void;
}

export const CommanderDamageModal = ({ gameState, mySeat, onClose, sendAction }: CommanderDamageModalProps) => {
    const opponents = Object.values(gameState.players).filter((p: any) => p.seat !== mySeat);
    const myPlayer = gameState.players[mySeat];
    const damageReceived = myPlayer.commanderDamageReceived || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-900 border border-red-500 rounded-lg p-6 shadow-2xl min-w-[320px]" onClick={e => e.stopPropagation()}>
                <h3 className="text-red-500 font-serif font-bold text-xl mb-6 text-center">Commander Damage Received</h3>
                <div className="flex flex-col gap-4">
                    {opponents.length === 0 && <div className="text-slate-500 text-center italic">No opponents available</div>}
                    {opponents.map((p: any) => {
                        const damage = damageReceived[p.seat] || 0;
                        return (
                            <div key={p.seat} className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                                <span className="text-slate-200 font-bold truncate max-w-[120px]">{p.username}</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-red-900 text-red-200 rounded font-bold transition-colors"
                                        onClick={() => sendAction('COMMANDER_DAMAGE', { seat: mySeat, sourceSeat: p.seat, delta: -1 })}
                                    >
                                        -
                                    </button>
                                    <span className={`text-xl font-bold w-8 text-center ${damage >= 21 ? 'text-red-500' : 'text-white'}`}>
                                        {damage}
                                    </span>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-green-900 text-green-200 rounded font-bold transition-colors"
                                        onClick={() => sendAction('COMMANDER_DAMAGE', { seat: mySeat, sourceSeat: p.seat, delta: 1 })}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    <button 
                        onClick={onClose} 
                        className="mt-4 py-2 text-slate-500 hover:text-white border-t border-slate-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
