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
    inHand = false,
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

    return (
        <div 
          className={clsx(
              "relative bg-black rounded transition-transform cursor-pointer select-none", 
              !inBattlefield && obj.tapped && "rotate-90",
              "shadow-lg border border-gray-700 flex-shrink-0"
          )}
          style={style}
          data-card-id={obj.id}
          data-img-url={imgUrl || ''}
          draggable={obj.controller_seat === mySeat}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
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
                      img: imgUrl // Pass the already resolved image URL
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
              let x = e.clientX;
              let y = e.clientY;
              if (x + 200 > window.innerWidth) x = window.innerWidth - 220;
              if (y + 400 > window.innerHeight) y = window.innerHeight - 420;
              
              setMenuOpen({ id: obj.id, x, y });
              setHoveredCard(null);
          }}
          onDoubleClick={(e) => {
              e.stopPropagation();
              setHoveredCard(null);
              if(inBattlefield && obj.controller_seat === mySeat) {
                  sendAction('TAP', { objectId: obj.id });
              } else if(inHand && obj.controller_seat === mySeat) {
                  sendAction('MOVE', { objectId: obj.id, fromZone: 'HAND', toZone: 'BATTLEFIELD', toOwner: mySeat });
              }
          }}
        >
            {imgUrl ? <img src={imgUrl} className="w-full h-full object-cover rounded" draggable={false} /> : <div className="text-xs p-1">{obj.scryfall_id}</div>}
            {Object.keys(obj.counters).length > 0 && (
                <div className="absolute scale-150 top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                    {Object.entries(obj.counters).map(([k,v]) => `${k}:${v}`).join(',')}
                </div>
            )}
            {inBattlefield && power !== undefined && toughness !== undefined && (
                <div className="absolute scale-150 bottom-1 right-1 bg-gray-200 text-black text-xs font-bold px-1 rounded border border-gray-400 shadow-sm z-10">
                    {power}/{toughness}
                </div>
            )}
        </div>
    );
});
