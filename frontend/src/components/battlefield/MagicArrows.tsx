import React, { useEffect, useState } from 'react';

interface Arrow {
    id: string;
    fromId: string;
    toId: string;
    creatorSeat: number;
}

interface MagicArrowsProps {
    arrows: Arrow[];
    mySeat: number;
    previewArrow?: { fromId: string, toPos: { x: number, y: number } } | null;
    onDeleteArrow?: (arrowId: string) => void;
}

export const MagicArrows: React.FC<MagicArrowsProps> = ({ arrows, mySeat, previewArrow, onDeleteArrow }) => {
    const [cardPositions, setCardPositions] = useState<Record<string, { x: number, y: number }>>({});

    useEffect(() => {
        const updatePositions = () => {
            const positions: Record<string, { x: number, y: number }> = {};
            const cardElements = document.querySelectorAll('[data-card-id]');
            cardElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const cardId = el.getAttribute('data-card-id');
                if (cardId) {
                    positions[cardId] = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    };
                }
            });
            setCardPositions(positions);
        };

        updatePositions();
        const interval = setInterval(updatePositions, 100); // Poll for positions as cards move
        window.addEventListener('resize', updatePositions);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePositions);
        };
    }, []);

    const renderArrow = (from: { x: number, y: number }, to: { x: number, y: number }, color: string, isMagic: boolean, id?: string) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 10) return null;

        return (
            <g 
                key={id || `${from.x}-${from.y}-${to.x}-${to.y}`} 
                className={isMagic ? "magic-arrow-group" : ""}
                onClick={(e) => {
                    if (id && onDeleteArrow) {
                        e.stopPropagation();
                        onDeleteArrow(id);
                    }
                }}
                style={{ pointerEvents: id ? 'auto' : 'none', cursor: id ? 'pointer' : 'default' }}
            >
                <defs>
                    <filter id="magic-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="magic-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                
                {/* Click area - wider invisible stroke */}
                {id && (
                    <line 
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                        stroke="transparent" 
                        strokeWidth="40" 
                        strokeLinecap="round"
                    />
                )}

                {/* Glow/Aura */}
                <line 
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                    stroke={color} 
                    strokeWidth="16" 
                    strokeLinecap="round"
                    className="opacity-20 blur-md"
                />

                {/* Outline for the body */}
                <line 
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                    stroke="black" 
                    strokeWidth="14" 
                    strokeLinecap="round"
                />

                {/* Main line body */}
                <line 
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                    stroke={isMagic ? "url(#magic-gradient)" : color} 
                    strokeWidth="10" 
                    strokeLinecap="round"
                    strokeDasharray={isMagic ? "12,6" : "none"}
                    className={isMagic ? "magic-line-anim" : ""}
                />

                {/* Outline for the head */}
                <path 
                    d={`M ${to.x} ${to.y} l -20 -11 l 0 22 z`}
                    fill="black"
                    transform={`rotate(${angle} ${to.x} ${to.y})`}
                />

                {/* Arrow head */}
                <path 
                    d={`M ${to.x} ${to.y} l -18 -9 l 0 18 z`}
                    fill={isMagic ? "#fff" : color}
                    transform={`rotate(${angle} ${to.x} ${to.y})`}
                    className={isMagic ? "magic-head-glow" : ""}
                />

                {isMagic && (
                    <circle cx={to.x} cy={to.y} r="5" fill="#fff">
                        <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                )}
            </g>
        );
    };

    return (
        <svg className="fixed inset-0 pointer-events-none z-[200] w-full h-full">
            <style>{`
                @keyframes magic-dash {
                    to { stroke-dashoffset: -50; }
                }
                .magic-line-anim {
                    animation: magic-dash 2s linear infinite;
                    filter: drop-shadow(0 0 5px #4ade80);
                }
                .magic-head-glow {
                    filter: drop-shadow(0 0 8px #fff);
                }
                @keyframes magic-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .magic-arrow-group {
                    animation: magic-float 3s ease-in-out infinite;
                }
            `}</style>
            
            {/* Completed Arrows */}
            {arrows.map(arrow => {
                const from = cardPositions[arrow.fromId];
                const to = cardPositions[arrow.toId];
                if (!from || !to) return null;
                
                const isMine = arrow.creatorSeat === mySeat;
                const color = isMine ? "#4ade80" : "#ef4444"; // Green for me, Red for others
                
                return renderArrow(from, to, color, isMine, isMine ? arrow.id : undefined);
            })}

            {/* Preview Arrow (only for me) */}
            {previewArrow && cardPositions[previewArrow.fromId] && (
                renderArrow(cardPositions[previewArrow.fromId], previewArrow.toPos, "#4ade80", true)
            )}
        </svg>
    );
};
