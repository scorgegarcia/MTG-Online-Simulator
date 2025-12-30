import React, { memo } from 'react';
import clsx from 'clsx';
import { useCardData } from '../hooks/useCardData';
import { CardCounters } from './CardCounters';

const glowStyles = `
@keyframes equip_glow {
  0% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(245,158,11,0.20), 0 0 22px rgba(245,158,11,0.22); }
  50% { opacity: 1; filter: brightness(1.08); box-shadow: 0 0 14px rgba(245,158,11,0.40), 0 0 34px rgba(245,158,11,0.46); }
  100% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(245,158,11,0.20), 0 0 22px rgba(245,158,11,0.22); }
}
@keyframes select_glow {
  0% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(245,158,11,0.25), 0 0 26px rgba(245,158,11,0.30); }
  50% { opacity: 1; filter: brightness(1.12); box-shadow: 0 0 16px rgba(245,158,11,0.48), 0 0 40px rgba(245,158,11,0.56); }
  100% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(245,158,11,0.25), 0 0 26px rgba(245,158,11,0.30); }
}
@keyframes enchant_glow {
  0% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(34,197,94,0.20), 0 0 22px rgba(34,197,94,0.22); }
  50% { opacity: 1; filter: brightness(1.08); box-shadow: 0 0 14px rgba(34,197,94,0.40), 0 0 34px rgba(34,197,94,0.46); }
  100% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(34,197,94,0.20), 0 0 22px rgba(34,197,94,0.22); }
}
@keyframes enchant_select_glow {
  0% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(34,197,94,0.25), 0 0 26px rgba(34,197,94,0.30); }
  50% { opacity: 1; filter: brightness(1.12); box-shadow: 0 0 16px rgba(34,197,94,0.48), 0 0 40px rgba(34,197,94,0.56); }
  100% { opacity: 0.55; filter: brightness(1); box-shadow: 0 0 10px rgba(34,197,94,0.25), 0 0 26px rgba(34,197,94,0.30); }
}
`;

interface CardProps {
    obj: any;
    size?: 'small' | 'normal';
    inBattlefield?: boolean;
    inHand?: boolean;
    fitHeight?: boolean;
    applyTapTransform?: boolean;
    hasAttachedEquipment?: boolean;
    attachedObjects?: any[];
    mySeat: number;
    cardScale: number;
    hoverBlockedRef: React.MutableRefObject<string | null>;
    isDraggingRef?: React.MutableRefObject<boolean>;
    setHoveredCard: (card: {obj: any, rect: DOMRect, img: string} | null) => void;
    menuOpen: any;
    setMenuOpen: (menu: any) => void;
    sendAction: (type: string, payload: any) => void;
    equipSelection?: { equipmentId: string } | null;
    setEquipSelection?: (selection: { equipmentId: string } | null) => void;
    enchantSelection?: { enchantmentId: string } | null;
    setEnchantSelection?: (selection: { enchantmentId: string } | null) => void;
}

export const Card = memo(({ 
    obj, 
    size = 'normal', 
    inBattlefield = false, 
    inHand: _inHand = false,
    fitHeight = false,
    applyTapTransform = true,
    hasAttachedEquipment = false,
    attachedObjects,
    mySeat,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen,
    sendAction,
    equipSelection,
    setEquipSelection,
    enchantSelection,
    setEnchantSelection
}: CardProps) => {
    const { img: imgUrlFromHook, power: powerFromHook, toughness: toughnessFromHook, type: typeLineFromHook } = useCardData(obj.scryfall_id);
    
    const imgUrl = obj.scryfall_id ? imgUrlFromHook : (obj.image_url || '');
    const power = obj.scryfall_id ? powerFromHook : obj.power;
    const toughness = obj.scryfall_id ? toughnessFromHook : obj.toughness;
    const typeLineOverride = obj?.type_line ?? '';
    const typeLine = String(typeLineOverride || typeLineFromHook || '');
    const lowerTypeLine = typeLine.toLowerCase();
    const isEquipment = lowerTypeLine.includes('equipment');
    const isEnchantment = lowerTypeLine.includes('enchantment');
    
    const isFacedown = obj.face_state === 'FACEDOWN';
    
    // Always show card back if it's face down, even for me
    const finalImgUrl = isFacedown
        ? (obj.back_image_url || 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg')
        : imgUrl;

    const counters = obj?.counters ?? {};

    const baseWidth = size === 'small' ? 64 : 128; // w-16 : w-32
    const baseHeight = size === 'small' ? 96 : 176; // h-24 : h-44
    
    const style = inBattlefield ? {
        height: '100%',
        aspectRatio: '2.5/3.5',
        width: 'auto',
        transform: applyTapTransform && obj.tapped ? 'rotate(90deg) scale(0.8)' : 'none'
    } : fitHeight ? {
        height: '100%',
        aspectRatio: '2.5/3.5',
        width: 'auto'
    } : {
        width: `${baseWidth * cardScale}px`,
        height: `${baseHeight * cardScale}px`
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (obj.controller_seat != mySeat) {
            e.preventDefault();
            return;
        }
        
        if (isDraggingRef) isDraggingRef.current = true;

        setTimeout(() => {
            setHoveredCard(null);
            window.dispatchEvent(new CustomEvent('ui:card-drag-start'));
        }, 10);

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", obj.id);
    };

    const handleDragEnd = () => {
        if (isDraggingRef) isDraggingRef.current = false;
        setHoveredCard(null);
        window.dispatchEvent(new CustomEvent('ui:card-drag-end'));
    };

    const lastTapRef = React.useRef(0);
    const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const ignoreClickRef = React.useRef(false);

    const resolvedAttachedObjects = Array.isArray(attachedObjects) ? attachedObjects : [];
    const getTypeLineForObj = (o: any) => {
        const direct = String(o?.type_line || '');
        if (direct) return direct;
        const sid = o?.scryfall_id;
        if (!sid) return '';
        const cached = localStorage.getItem(`card_data_v3_${sid}`);
        if (!cached) return '';
        try {
            return String(JSON.parse(cached)?.type || '');
        } catch {
            return '';
        }
    };
    const attachedEquipmentCount = resolvedAttachedObjects.filter((o: any) => getTypeLineForObj(o).toLowerCase().includes('equipment')).length;
    const attachedEnchantmentCount = resolvedAttachedObjects.filter((o: any) => getTypeLineForObj(o).toLowerCase().includes('enchantment')).length;
    const hasAnyAttachmentsFallback = hasAttachedEquipment || !!obj.attached_to;

    const hasGreenHalo = inBattlefield && (
        (attachedEnchantmentCount > 0) ||
        (isEnchantment && !!obj.attached_to)
    );
    const hasAmberHalo = inBattlefield && (
        !hasGreenHalo && (
            (attachedEquipmentCount > 0) ||
            (isEquipment && !!obj.attached_to) ||
            (hasAnyAttachmentsFallback && resolvedAttachedObjects.length === 0)
        )
    );

    const isEquipTarget =
        !!equipSelection &&
        inBattlefield &&
        obj.controller_seat === mySeat &&
        obj.id !== equipSelection.equipmentId;
    const isEquipSource = !!equipSelection && obj.id === equipSelection.equipmentId;

    const isEnchantTarget =
        !!enchantSelection &&
        inBattlefield &&
        obj.controller_seat === mySeat &&
        obj.id !== enchantSelection.enchantmentId;
    const isEnchantSource = !!enchantSelection && obj.id === enchantSelection.enchantmentId;

    const handleTouchEnd = (e: React.TouchEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 320;
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            e.preventDefault();
            e.stopPropagation();

            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
            ignoreClickRef.current = true;
            setTimeout(() => { ignoreClickRef.current = false; }, 450);

            setHoveredCard(null);
            if (obj.controller_seat === mySeat) {
                if (inBattlefield) {
                    sendAction('TAP', { objectId: obj.id });
                } else {
                    sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'BATTLEFIELD', toOwner: mySeat });
                }
            }
        }
        lastTapRef.current = now;
    };

    return (
        <div 
          className={clsx(
              "relative bg-black rounded transition-transform cursor-pointer select-none", 
              !inBattlefield && obj.tapped && "rotate-90",
              "shadow-lg border border-gray-700 flex-shrink-0"
          )}
          style={style}
          data-card-id={obj.id}
          data-img-url={finalImgUrl || ''}
          draggable={obj.controller_seat === mySeat}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if(obj.controller_seat === mySeat && inBattlefield) {
                  hoverBlockedRef.current = obj.id;
                  setHoveredCard(null);
                  setTimeout(() => {
                      sendAction('TAP', { objectId: obj.id });
                  }, 50);
              }
          }}
          onMouseEnter={(e) => {
              if (equipSelection || enchantSelection) return;
              if (!menuOpen && hoverBlockedRef.current !== obj.id && (!isDraggingRef || !isDraggingRef.current)) { 
                  setHoveredCard({
                      obj,
                      rect: e.currentTarget.getBoundingClientRect(),
                      img: finalImgUrl // Pass the already resolved image URL
                  });
              }
          }}
          onMouseLeave={() => {
              if (hoverBlockedRef.current === obj.id) {
                  hoverBlockedRef.current = null;
              }
          }}
          onClick={(e) => {
              e.stopPropagation();
              if (ignoreClickRef.current) return;

              if (equipSelection && inBattlefield) {
                  if (isEquipSource) {
                      if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                      }
                      setHoveredCard(null);
                      setMenuOpen(null);
                      setEquipSelection?.(null);
                      return;
                  }
                  if (!isEquipTarget) return;
                  if (clickTimeoutRef.current) {
                      clearTimeout(clickTimeoutRef.current);
                      clickTimeoutRef.current = null;
                  }
                  setHoveredCard(null);
                  setMenuOpen(null);
                  sendAction('EQUIP_ATTACH', { equipmentId: equipSelection.equipmentId, targetId: obj.id });
                  setEquipSelection?.(null);
                  return;
              }

              if (enchantSelection && inBattlefield) {
                  if (isEnchantSource) {
                      if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                      }
                      setHoveredCard(null);
                      setMenuOpen(null);
                      setEnchantSelection?.(null);
                      return;
                  }
                  if (!isEnchantTarget) return;
                  if (clickTimeoutRef.current) {
                      clearTimeout(clickTimeoutRef.current);
                      clickTimeoutRef.current = null;
                  }
                  setHoveredCard(null);
                  setMenuOpen(null);
                  sendAction('ENCHANT_ATTACH', { enchantmentId: enchantSelection.enchantmentId, targetId: obj.id });
                  setEnchantSelection?.(null);
                  return;
              }
              
              const x = e.clientX;
              const y = e.clientY;
              
              if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
               
              clickTimeoutRef.current = setTimeout(() => {
                  let finalX = x;
                  let finalY = y;
                  if (finalX + 200 > window.innerWidth) finalX = window.innerWidth - 220;
                  if (finalY + 400 > window.innerHeight) finalY = window.innerHeight - 420;
                  
                  setMenuOpen({ id: obj.id, x: finalX, y: finalY });
                  setHoveredCard(null);
                  clickTimeoutRef.current = null;
              }, 320);
          }}
          onDoubleClick={(e) => {
              e.stopPropagation();
              if (clickTimeoutRef.current) {
                  clearTimeout(clickTimeoutRef.current);
                  clickTimeoutRef.current = null;
              }
              setHoveredCard(null);
              if (obj.controller_seat === mySeat) {
                  if (inBattlefield) {
                      sendAction('TAP', { objectId: obj.id });
                  } else {
                      sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'BATTLEFIELD', toOwner: mySeat });
                  }
              }
          }}
        >
            <style>{glowStyles}</style>
            {finalImgUrl ? (
                <img src={finalImgUrl} className={clsx("w-full h-full object-cover rounded")} draggable={false} />
            ) : (
                <div className="text-xs p-1">{isFacedown ? '???' : obj.scryfall_id}</div>
            )}

            {equipSelection && inBattlefield && isEquipSource && (
                <button
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 px-2 py-1 rounded bg-black/80 text-amber-200 border border-amber-400/60 text-[10px] whitespace-nowrap shadow-[0_0_18px_rgba(245,158,11,0.25)]"
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        setEquipSelection?.(null);
                    }}
                >
                    haz clic aqui para cancelar, o presiona ESC
                </button>
            )}

            {enchantSelection && inBattlefield && isEnchantSource && (
                <button
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 px-2 py-1 rounded bg-black/80 text-emerald-200 border border-emerald-400/60 text-[10px] whitespace-nowrap shadow-[0_0_18px_rgba(34,197,94,0.25)]"
                    onClick={(ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        setEnchantSelection?.(null);
                    }}
                >
                    haz clic aqui para cancelar, o presiona ESC
                </button>
            )}

            {(hasAmberHalo || hasGreenHalo || isEquipTarget || isEnchantTarget) && (
                <div
                    className="absolute pointer-events-none rounded"
                    style={{
                        inset: '-3px',
                        border: `3px solid ${
                            isEnchantTarget
                                ? 'rgba(34,197,94,0.95)'
                                : isEquipTarget
                                    ? 'rgba(245,158,11,0.95)'
                                    : hasGreenHalo
                                        ? 'rgba(34,197,94,0.75)'
                                        : 'rgba(245,158,11,0.75)'
                        }`,
                        zIndex: 20,
                        animation: `${
                            isEnchantTarget
                                ? 'enchant_select_glow'
                                : isEquipTarget
                                    ? 'select_glow'
                                    : hasGreenHalo
                                        ? 'enchant_glow'
                                        : 'equip_glow'
                        } 1s ease-in-out infinite`,
                    }}
                />
            )}

            <CardCounters counters={counters} className="scale-150 origin-top-right" size="small" />
            {inBattlefield && !isFacedown && power !== undefined && toughness !== undefined && (
                <div className="absolute scale-150 bottom-1 right-1 bg-gray-200 text-black text-xs font-bold px-1 rounded border border-gray-400 shadow-sm z-30">
                    {power}/{toughness}
                </div>
            )}
        </div>
    );
});
