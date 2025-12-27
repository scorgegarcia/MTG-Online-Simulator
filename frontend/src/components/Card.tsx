import React, { memo } from 'react';
import clsx from 'clsx';
import { useCardData } from '../hooks/useCardData';

interface CardProps {
    obj: any;
    size?: 'small' | 'normal';
    inBattlefield?: boolean;
    inHand?: boolean;
    fitHeight?: boolean;
    mySeat: number;
    cardScale: number;
    hoverBlockedRef: React.MutableRefObject<string | null>;
    isDraggingRef?: React.MutableRefObject<boolean>;
    setHoveredCard: (card: {obj: any, rect: DOMRect, img: string} | null) => void;
    menuOpen: any;
    setMenuOpen: (menu: any) => void;
    sendAction: (type: string, payload: any) => void;
}

export const Card = memo(({ 
    obj, 
    size = 'normal', 
    inBattlefield = false, 
    inHand: _inHand = false,
    fitHeight = false,
    mySeat,
    cardScale,
    hoverBlockedRef,
    isDraggingRef,
    setHoveredCard,
    menuOpen,
    setMenuOpen,
    sendAction
}: CardProps) => {
    const { img: imgUrl, power, toughness } = useCardData(obj.scryfall_id);
    
    const isFacedown = obj.face_state === 'FACEDOWN';
    
    // Always show card back if it's face down, even for me
    const finalImgUrl = isFacedown
        ? 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg' 
        : imgUrl;

    const baseWidth = size === 'small' ? 64 : 128; // w-16 : w-32
    const baseHeight = size === 'small' ? 96 : 176; // h-24 : h-44
    
    const style = inBattlefield ? {
        height: '100%',
        aspectRatio: '2.5/3.5',
        width: 'auto',
        transform: obj.tapped ? 'rotate(90deg) scale(0.8)' : 'none'
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

        // Force close hover when dragging starts to avoid overlay blocking drop
        // Defer slightly to ensure drag starts smoothly
        setTimeout(() => setHoveredCard(null), 10);

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", obj.id);
    };

    const handleDragEnd = () => {
        if (isDraggingRef) isDraggingRef.current = false;
        setHoveredCard(null);
    };

    const lastTapRef = React.useRef(0);
    const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const ignoreClickRef = React.useRef(false);

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
            {finalImgUrl ? (
                <img src={finalImgUrl} className={clsx("w-full h-full object-cover rounded")} draggable={false} />
            ) : (
                <div className="text-xs p-1">{isFacedown ? '???' : obj.scryfall_id}</div>
            )}

            {Object.keys(obj.counters).length > 0 && (
                <div className="absolute scale-150 top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                    {Object.entries(obj.counters).map(([k,v]) => `${k}:${v}`).join(',')}
                </div>
            )}
            {inBattlefield && !isFacedown && power !== undefined && toughness !== undefined && (
                <div className="absolute scale-150 bottom-1 right-1 bg-gray-200 text-black text-xs font-bold px-1 rounded border border-gray-400 shadow-sm z-10">
                    {power}/{toughness}
                </div>
            )}
        </div>
    );
});
