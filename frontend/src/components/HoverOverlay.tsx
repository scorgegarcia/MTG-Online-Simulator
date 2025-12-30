import React, { useState, useLayoutEffect } from 'react';
import { CardCounters } from './CardCounters';

interface HoverOverlayProps {
    hoveredCard: {obj: any, rect: DOMRect, img: string, isPlayerPanel?: boolean} | null;
    setHoveredCard: (card: {obj: any, rect: DOMRect, img: string, isPlayerPanel?: boolean} | null) => void;
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
    const lastTapRef = React.useRef(0);
    const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const ignoreClickRef = React.useRef(false);
    
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
            zIndex: 125,
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
                zIndex: 125,
                position: 'fixed',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            });
        });
        
    }, [hoveredCard, hoverScale]);

    if (!hoveredCard || !style) return null;
    
    const { obj, img } = hoveredCard;
    const counters = obj?.counters ?? {};

    return (
        <div 
          className="rounded-xl cursor-pointer select-none border border-yellow-500/50 bg-black"
          style={{
              ...style,
              transition: isExpanded ? 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none'
          }}
          onTouchEnd={(e) => {
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
                      if (gameState.zoneIndex[mySeat]['BATTLEFIELD'].includes(obj.id)) {
                          sendAction('TAP', { objectId: obj.id });
                      } else {
                          sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'BATTLEFIELD', toOwner: mySeat });
                      }
                  }
              }
              lastTapRef.current = now;
          }}
          onMouseMove={(e) => {
              const elements = document.elementsFromPoint(e.clientX, e.clientY);
              
              // If hovering over a scroll button (even if behind overlay), close overlay
              if (elements.some(el => el.hasAttribute('data-scroll-button'))) {
                  setHoveredCard(null);
                  return;
              }

              const topCardEl = elements.find(el => el.hasAttribute('data-card-id'));

              // If not hovering over any card (original or new), close overlay
              if (!topCardEl) {
                  setHoveredCard(null);
                  return;
              }

              // If hovering over a DIFFERENT card, switch to it
              const newId = topCardEl.getAttribute('data-card-id');
              if (newId && newId !== obj.id) {
                  const newImg = topCardEl.getAttribute('data-img-url');
                  const isPlayerPanelAttr = topCardEl.getAttribute('data-is-player-panel');
                  if (gameState.objects[newId]) {
                       setHoveredCard({
                           obj: gameState.objects[newId],
                           rect: topCardEl.getBoundingClientRect(),
                           img: newImg || '',
                           isPlayerPanel: isPlayerPanelAttr === 'true'
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
                  if (gameState.zoneIndex[mySeat]['BATTLEFIELD'].includes(obj.id)) {
                      sendAction('TAP', { objectId: obj.id });
                  } else {
                      sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'BATTLEFIELD', toOwner: mySeat });
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
              setTimeout(() => {
                  setHoveredCard(null);
                  window.dispatchEvent(new CustomEvent('ui:card-drag-start'));
              }, 10);

              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", obj.id);
          }}
          onDragEnd={() => {
              window.dispatchEvent(new CustomEvent('ui:card-drag-end'));
          }}
        >
            {img ? <img src={img} className="w-full h-full object-cover rounded-xl" draggable={false} /> : <div className="text-xs p-1 bg-black text-white w-full h-full">{obj.scryfall_id}</div>}
            <CardCounters counters={counters} className="scale-150 origin-top-left" />
        </div>
    );
};
