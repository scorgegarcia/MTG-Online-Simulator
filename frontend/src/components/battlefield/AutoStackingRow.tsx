import React, { useRef, useState, useEffect } from 'react';
import { Card } from '../Card';

interface AutoStackingRowProps {
    objects: any[];
    cardProps: any;
    className?: string;
}

export const AutoStackingRow: React.FC<AutoStackingRowProps> = ({
    objects,
    cardProps,
    className
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [overlap, setOverlap] = useState(0);

    const updateOverlap = () => {
        if (!containerRef.current || objects.length === 0) {
            setOverlap(0);
            return;
        }

        const containerWidth = containerRef.current.offsetWidth;
        
        // Calculate card width based on props
        const size = cardProps.size || (cardProps.inBattlefield ? 'normal' : 'normal'); // Card logic
        const baseWidth = size === 'small' ? 64 : 128;
        
        // If inBattlefield, the width is calculated differently in Card.tsx (auto width based on height),
        // but for overlap calculation we need an approximation or the exact rendered width.
        // Since Card.tsx uses aspect ratio 2.5/3.5 and height 100%, width depends on height.
        // However, we can measure the first card if it exists, or estimate.
        
        // Let's assume we can get the width from the first child if rendered
        let cardWidth = baseWidth * (cardProps.cardScale || 1);
        
        const firstCard = containerRef.current.firstElementChild as HTMLElement;
        if (firstCard && firstCard.offsetWidth > 0) {
            cardWidth = firstCard.offsetWidth;
        }

        const totalWidthNeeded = objects.length * cardWidth;
        // Add a small gap if they fit (e.g. 8px) or 0 if we want them tight
        const gap = 4; 
        const totalWidthWithGap = totalWidthNeeded + (objects.length - 1) * gap;

        if (totalWidthWithGap > containerWidth) {
            // Calculate overlap needed
            // Formula: (n * w) - (n-1)*overlap = containerWidth
            // (n-1)*overlap = (n*w) - containerWidth
            // overlap = ((n*w) - containerWidth) / (n-1)
            
            // Add a bit of buffer (padding)
            const padding = 16;
            const availableWidth = containerWidth - padding;
            
            const excess = totalWidthNeeded - availableWidth;
            const newOverlap = excess / (objects.length - 1);
            setOverlap(Math.max(0, newOverlap));
        } else {
            setOverlap(0);
        }
    };

    // Deep check for objects changes (ids, zone changes, etc)
    const objectsHash = objects.map(o => `${o.id}-${o.zone}-${o.tapped}`).join('|');

    useEffect(() => {
        // Force update overlap immediately and after a small delay to allow DOM to settle
        updateOverlap();
        const t = setTimeout(updateOverlap, 50); 
        
        window.addEventListener('resize', updateOverlap);
        
        // Use ResizeObserver to detect container size changes
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current) {
            resizeObserver = new ResizeObserver(() => {
                updateOverlap();
            });
            resizeObserver.observe(containerRef.current);
        }
        
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', updateOverlap);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [objects.length, cardProps.cardScale, objectsHash]); // Recalculate when objects change deeply

    return (
        <div 
            ref={containerRef} 
            className={`flex items-center h-full w-full px-2 overflow-hidden ${className || ''}`}
        >
            {objects.map((obj, index) => (
                <div 
                    key={obj.id}
                    style={{ 
                        marginLeft: index === 0 ? 0 : `-${overlap}px`, 
                        zIndex: index,
                        transition: 'margin-left 0.3s ease'
                    }}
                    className="flex-shrink-0 h-full flex items-center"
                >
                    <Card
                        obj={obj}
                        {...cardProps}
                        attachedObjects={(cardProps?.attachmentsByHost?.[obj.id] || [])}
                        hasAttachedEquipment={(cardProps?.attachmentsByHost?.[obj.id] || []).length > 0}
                    />
                </div>
            ))}
        </div>
    );
};
