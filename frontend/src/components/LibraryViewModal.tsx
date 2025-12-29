import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useCardData } from '../hooks/useCardData';

interface LibraryViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: any;
    mySeat: number;
    sendAction: (type: string, payload: any) => void;
}

export const LibraryViewModal: React.FC<LibraryViewModalProps> = ({
    isOpen,
    onClose,
    gameState,
    mySeat,
    sendAction
}) => {
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isOpen) return;
        setQuery('');
        setSelectedId(null);
        setHoveredId(null);
        setRemovedIds(new Set());
    }, [isOpen]);

    const visibleObjects = useMemo(() => {
        const q = query.trim().toLowerCase();
        const libraryIds: string[] = gameState?.zoneIndex?.[mySeat]?.LIBRARY || [];
        const ids = libraryIds.filter((id) => !removedIds.has(id));
        const objs = ids
            .map((id) => gameState?.objects?.[id])
            .filter(Boolean);

        const filtered = q
            ? objs.filter((obj: any) => {
                  const rawName =
                      obj?.face_state === 'FACEDOWN'
                          ? 'unknown'
                          : (obj?.name || obj?.note || '');
                  const name = String(rawName).toLowerCase();
                  return name.includes(q);
              })
            : objs;

        return filtered;
    }, [gameState, mySeat, query, removedIds]);

    useEffect(() => {
        if (!isOpen) return;
        if (selectedId && !visibleObjects.some((o: any) => o.id === selectedId)) {
            setSelectedId(null);
        }
    }, [isOpen, selectedId, visibleObjects]);

    const displayId = selectedId || hoveredId;
    const selectedObj = displayId ? gameState?.objects?.[displayId] : null;

    const { img: imgUrlFromHook } = useCardData(selectedObj?.scryfall_id || null);

    const finalImgUrl = useMemo(() => {
        if (!selectedObj) return '';
        const isFacedown = selectedObj.face_state === 'FACEDOWN';
        if (isFacedown) {
            return (
                selectedObj.back_image_url ||
                'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg'
            );
        }
        const imgUrl = selectedObj.scryfall_id ? imgUrlFromHook : selectedObj.image_url;
        return imgUrl || '';
    }, [imgUrlFromHook, selectedObj]);

    const moveSelected = (toZone: string, opts?: { position?: 'top' | 'bottom' }) => {
        if (!selectedObj) return;
        if (selectedObj.zone !== 'LIBRARY') {
            setRemovedIds((prev) => new Set(prev).add(selectedObj.id));
            setSelectedId(null);
            return;
        }

        sendAction('MOVE', {
            objectId: selectedObj.id,
            fromZone: 'LIBRARY',
            toZone,
            toOwner: mySeat,
            position: opts?.position
        });

        if (toZone !== 'LIBRARY') {
            setRemovedIds((prev) => new Set(prev).add(selectedObj.id));
            setSelectedId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[min(1100px,95vw)] h-[min(720px,90vh)] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="font-serif font-bold text-slate-200 text-xl tracking-wide">VIEW LIBRARY</div>
                        <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                            {visibleObjects.length} cards
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-lg font-bold px-2"
                        title="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-800">
                        <div className="p-4 border-b border-slate-800">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar carta..."
                                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex-1 min-h-0 overflow-auto">
                            {visibleObjects.length === 0 ? (
                                <div className="p-6 text-slate-500 italic">No hay cartas en la biblioteca</div>
                            ) : (
                                <div className="p-2">
                                    {visibleObjects.map((obj: any) => {
                                        const isSelected = obj.id === selectedId;
                                        const isHovered = obj.id === hoveredId;
                                        const name =
                                            obj?.face_state === 'FACEDOWN'
                                                ? 'Unknown Card'
                                                : (obj?.name || obj?.note || 'Unknown Card');
                                        return (
                                            <button
                                                key={obj.id}
                                                onClick={() => {
                                                    if (selectedId === obj.id) {
                                                        setSelectedId(null);
                                                    } else {
                                                        setSelectedId(obj.id);
                                                    }
                                                }}
                                                onMouseEnter={() => setHoveredId(obj.id)}
                                                onMouseLeave={() => setHoveredId(null)}
                                                className={clsx(
                                                    'w-full text-left px-3 py-2 rounded-lg border transition-colors flex items-center gap-2',
                                                    isSelected
                                                        ? 'bg-amber-900/25 border-amber-500/40 text-amber-200'
                                                        : isHovered && !selectedId
                                                            ? 'bg-slate-800 border-slate-600 text-slate-200'
                                                            : 'bg-slate-950/20 border-slate-800 text-slate-300 hover:bg-slate-950/40 hover:border-slate-700'
                                                )}
                                            >
                                                <span className="truncate font-semibold">{name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 p-4 flex items-center justify-center bg-black/20">
                            {selectedObj ? (
                                finalImgUrl ? (
                                    <div className="h-full max-h-full max-w-full w-auto aspect-[2.5/3.5] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                                        <img src={finalImgUrl} className="w-full h-full object-contain" draggable={false} />
                                    </div>
                                ) : (
                                    <div className="h-full max-h-full max-w-full w-auto aspect-[2.5/3.5] rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60">
                                        Sin imagen
                                    </div>
                                )
                            ) : (
                                <div className="text-slate-500 italic">Selecciona una carta</div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('HAND')}
                                >
                                    Mover a Mano
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('GRAVEYARD')}
                                >
                                    Mover a Cementerio
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('EXILE')}
                                >
                                    Mover a Exilio
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('COMMAND')}
                                >
                                    Mover a Command Zone
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('BATTLEFIELD')}
                                >
                                    Mover a Campo de batalla
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('LIBRARY', { position: 'top' })}
                                >
                                    Mover a Biblioteca Arriba
                                </button>
                                <button
                                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:col-span-2"
                                    disabled={!selectedObj}
                                    onClick={() => moveSelected('LIBRARY', { position: 'bottom' })}
                                >
                                    Mover a Biblioteca Abajo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/40">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => {
                            sendAction('SHUFFLE', { seat: mySeat });
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 border border-amber-500/50 text-amber-50 font-bold transition-colors"
                    >
                        Cerrar y Shuffle
                    </button>
                </div>
            </div>
        </div>
    );
};
