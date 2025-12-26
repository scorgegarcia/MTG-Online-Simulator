import React, { useState, useLayoutEffect } from 'react';

interface HoverOverlayProps {
    hoveredCard: {obj: any, rect: DOMRect, img: string} | null;
    setHoveredCard: (card: {obj: any, rect: DOMRect, img: string} | null) => void;
    hoverScale: number;
    gameState: any;
    mySeat: number;
    sendAction: (type: string, payload: any) => void;
    hoverBlockedRef: React.MutableRefObject<string | null>;
    setMenuOpen: (menu: any) => void;
}

export const HoverOverlay = ({
    hoveredCard,
    setHoveredCard,
    hoverScale,
    gameState,
    mySeat,
    sendAction,
    hoverBlockedRef,
    setMenuOpen
}: HoverOverlayProps) => {
    const [style, setStyle] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Use useLayoutEffect to calculate position BEFORE paint
    useLayoutEffect(() => {
        if(!hoveredCard) {
            setIsExpanded(false);
            setStyle(null);
            return;
        }

        const { rect } = hoveredCard;
        
        // Initial position: Match the source card EXACTLY
        const initialStyle = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            zIndex: 60,
            position: 'fixed' as const,
            transition: 'none' 
        };
        
        // Set initial style immediately
        setStyle(initialStyle);

        // Calculate target
        const targetWidth = hoverScale;
        const targetHeight = targetWidth * (3.5 / 2.5);
        
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        let targetLeft = cx - targetWidth / 2;
        let targetTop = cy - targetHeight / 2;
        
        const padding = 10;
        if (targetLeft < padding) targetLeft = padding;
        if (targetLeft + targetWidth > window.innerWidth - padding) targetLeft = window.innerWidth - targetWidth - padding;
        
        if (targetTop < padding) targetTop = padding;
        if (targetTop + targetHeight > window.innerHeight - padding) targetTop = window.innerHeight - targetHeight - padding;

        // Animate to target in next frame
        requestAnimationFrame(() => {
            setIsExpanded(true);
            setStyle({
                top: targetTop,
                left: targetLeft,
                width: targetWidth,
                height: targetHeight,
                zIndex: 60,
                position: 'fixed',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            });
        });
        
    }, [hoveredCard, hoverScale]);

    if (!hoveredCard || !style) return null;
    
    const { obj, img } = hoveredCard;

    return (
        <div 
          className="rounded-xl cursor-pointer select-none border border-yellow-500/50 bg-black"
          style={{
              ...style,
              transition: isExpanded ? 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none'
          }}
          onMouseMove={(e) => {
              const elements = document.elementsFromPoint(e.clientX, e.clientY);
              
              // If hovering over a scroll button (even if behind overlay), close overlay
              if (elements.some(el => el.hasAttribute('data-scroll-button'))) {
                  setHoveredCard(null);
                  return;
              }

              const cardEl = elements.find(el => el.hasAttribute('data-card-id') && el.getAttribute('data-card-id') !== obj.id);
              
              if (cardEl) {
                  const newId = cardEl.getAttribute('data-card-id');
                  const newImg = cardEl.getAttribute('data-img-url');
                  if (newId && gameState.objects[newId]) {
                       setHoveredCard({
                           obj: gameState.objects[newId],
                           rect: cardEl.getBoundingClientRect(),
                           img: newImg || ''
                       });
                  }
              }
          }}
          onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if(obj.controller_seat === mySeat) {
                  if (gameState.zoneIndex[mySeat]['BATTLEFIELD'].includes(obj.id)) {
                      hoverBlockedRef.current = obj.id;
                      setHoveredCard(null); 
                      setTimeout(() => {
                          sendAction('TAP', { objectId: obj.id });
                      }, 50);
                  }
              }
          }}
          onMouseLeave={() => {
              setHoveredCard(null);
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
              if(obj.controller_seat === mySeat) {
                  if (gameState.zoneIndex[mySeat]['BATTLEFIELD'].includes(obj.id)) {
                      sendAction('TAP', { objectId: obj.id });
                  } else if (gameState.zoneIndex[mySeat]['HAND'].includes(obj.id)) {
                      sendAction('MOVE', { objectId: obj.id, fromZone: 'HAND', toZone: 'BATTLEFIELD', toOwner: mySeat });
                  }
              }
          }}
          draggable={obj.controller_seat === mySeat}
          onDragStart={(e) => {
              // Same logic as Card.tsx
              if (obj.controller_seat !== mySeat) {
                  e.preventDefault();
                  return;
              }

              // Use the original small card as the drag ghost image instead of this large overlay
              const originalCard = document.querySelector(`div[data-card-id="${obj.id}"]`);
              if (originalCard) {
                  const rect = originalCard.getBoundingClientRect();
                  // Center the drag image on the cursor
                  e.dataTransfer.setDragImage(originalCard, rect.width / 2, rect.height / 2);
              }

              // Force close hover when dragging starts
              // We use setTimeout to ensure the drag operation starts before the element is unmounted
              setTimeout(() => setHoveredCard(null), 10);

              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", obj.id);
          }}
        >
            {img ? <img src={img} className="w-full h-full object-cover rounded-xl" draggable={false} /> : <div className="text-xs p-1 bg-black text-white w-full h-full">{obj.scryfall_id}</div>}
            {Object.keys(obj.counters).length > 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 transform scale-150 origin-top-right">
                    {Object.entries(obj.counters).map(([k,v]) => `${k}:${v}`).join(',')}
                </div>
            )}
        </div>
    );
};
