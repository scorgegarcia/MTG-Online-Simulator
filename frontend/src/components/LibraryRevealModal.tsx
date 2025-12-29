import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import clsx from 'clsx';

interface LibraryRevealModalProps {
    isOpen: boolean;
    onClose: () => void;
    mySeat: number;
    opponents: any[];
    sendAction: (type: string, payload: any) => void;
}

export const LibraryRevealModal: React.FC<LibraryRevealModalProps> = ({
    isOpen,
    onClose,
    mySeat,
    opponents,
    sendAction
}) => {
    const [amount, setAmount] = useState(1);
    const [selectedTargets, setSelectedTargets] = useState<Set<number>>(new Set());

    if (!isOpen) return null;

    const opponentSeats = opponents.map((p: any) => p.seat);
    const allOpponentsSelected = opponentSeats.length > 0 && opponentSeats.every(seat => selectedTargets.has(seat));

    const toggleTarget = (seat: number) => {
        const newTargets = new Set(selectedTargets);
        if (newTargets.has(seat)) {
            newTargets.delete(seat);
        } else {
            newTargets.add(seat);
        }
        setSelectedTargets(newTargets);
    };

    const toggleAll = () => {
        const newTargets = new Set(selectedTargets);
        if (allOpponentsSelected) {
            opponentSeats.forEach(seat => newTargets.delete(seat));
        } else {
            opponentSeats.forEach(seat => newTargets.add(seat));
        }
        setSelectedTargets(newTargets);
    };

    const handleConfirm = () => {
        if (selectedTargets.size === 0) {
            onClose();
            return;
        }

        const target = selectedTargets.size === 1
            ? Array.from(selectedTargets)[0]
            : Array.from(selectedTargets);

        sendAction('REVEAL_LIBRARY_START', {
            seat: mySeat,
            amount: Math.max(1, amount),
            target
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-6 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2 font-serif tracking-wide">
                    <Eye className="text-amber-500" /> Show Next X Cards
                </h3>
                
                <div className="space-y-6">
                    <div className="flex items-center gap-3 bg-slate-950/50 p-4 rounded border border-slate-800">
                        <span className="text-slate-300 font-bold whitespace-nowrap">Show Next</span>
                        <input 
                            type="number" 
                            min="1"
                            max="100"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            className="w-20 bg-slate-800 border border-slate-700 rounded p-2 text-center text-amber-500 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-slate-300 font-bold whitespace-nowrap">cards of the library</span>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Show To:</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => toggleTarget(mySeat)}
                                className={clsx(
                                    "p-3 rounded border font-bold transition-all relative overflow-hidden group",
                                    selectedTargets.has(mySeat) 
                                        ? "bg-amber-900/40 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                )}
                            >
                                Me
                            </button>

                            {opponents.map((p: any) => (
                                <button
                                    key={p.seat}
                                    onClick={() => toggleTarget(p.seat)}
                                    className={clsx(
                                        "p-3 rounded border font-bold transition-all relative overflow-hidden group",
                                        selectedTargets.has(p.seat) 
                                            ? "bg-amber-900/40 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                    )}
                                >
                                    {p.username}
                                </button>
                            ))}

                            <button
                                onClick={toggleAll}
                                className={clsx(
                                    "p-3 rounded border font-bold transition-all relative overflow-hidden group col-span-2",
                                    allOpponentsSelected
                                        ? "bg-amber-900/40 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                )}
                            >
                                All Players
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-400 hover:text-slate-200 font-bold transition-colors bg-slate-800 hover:bg-slate-700 rounded"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded shadow-lg transition-all transform active:scale-[0.98]"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
