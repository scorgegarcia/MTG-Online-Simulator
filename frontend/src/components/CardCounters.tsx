import React from 'react';
import clsx from 'clsx';

interface CardCountersProps {
    counters: Record<string, any>;
    className?: string;
    size?: 'small' | 'normal' | 'large';
}

export const CardCounters: React.FC<CardCountersProps> = ({ counters, className, size = 'normal' }) => {
    if (!counters || Object.keys(counters).length === 0) return null;

    const formatSigned = (n: number) => (n > 0 ? `+${n}` : `${n}`);
    const counterParts: string[] = [];
    
    const p1p1 = typeof counters.P1P1 === 'number' ? counters.P1P1 : 0;
    const powerDelta = typeof counters.POWER === 'number' ? counters.POWER : 0;
    const toughnessDelta = typeof counters.TOUGHNESS === 'number' ? counters.TOUGHNESS : 0;
    
    const totalPowerDelta = p1p1 + powerDelta;
    const totalToughnessDelta = p1p1 + toughnessDelta;

    if (totalPowerDelta !== 0 || totalToughnessDelta !== 0) {
        counterParts.push(`${formatSigned(totalPowerDelta)}/${formatSigned(totalToughnessDelta)}`);
    }

    Object.entries(counters).forEach(([k, v]) => {
        if (k === 'P1P1' || k === 'POWER' || k === 'TOUGHNESS') return;
        if (typeof v === 'number') {
            if (v === 0) return;
            counterParts.push(`${k}${v > 0 ? `+${v}` : `${v}`}`);
            return;
        }
        if (v === undefined || v === null) return;
        counterParts.push(String(k));
    });

    const countersText = counterParts.join(',');
    if (!countersText) return null;

    const sizeClasses = {
        small: "text-[10px] px-1 py-0",
        normal: "text-xs px-2 py-0.5",
        large: "text-sm px-3 py-1"
    };

    return (
        <>
            <style>{`
                @keyframes magic_flame {
                    0% { box-shadow: 0 0 5px #3b82f6, 0 0 10px #2563eb, 0 0 15px #1d4ed8; }
                    50% { box-shadow: 0 0 10px #60a5fa, 0 0 20px #3b82f6, 0 0 30px #2563eb; }
                    100% { box-shadow: 0 0 5px #3b82f6, 0 0 10px #2563eb, 0 0 15px #1d4ed8; }
                }
                .magic-blue-flame {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
                    animation: magic_flame 2s infinite ease-in-out;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    text-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
                }
            `}</style>
            <div className={clsx(
                "absolute top-[1px] left-[1px] z-50 rounded-full text-white font-bold magic-blue-flame pointer-events-none select-none",
                sizeClasses[size],
                className
            )}>
                {countersText}
            </div>
        </>
    );
};
