import React, { useEffect, useState } from 'react';

interface PassTurnAnimationProps {
    onComplete?: () => void;
}

export const PassTurnAnimation: React.FC<PassTurnAnimationProps> = ({ onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) {
                setTimeout(onComplete, 500); // Wait for fade-out
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) {
        return (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100] animate-out fade-out duration-500 fill-mode-forwards">
                <div className="bg-amber-500/20 border-4 border-amber-500/50 px-12 py-6 rounded-full transform scale-110 shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                    <span className="text-6xl font-black text-amber-400 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                        PASS
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100]">
            <div className="bg-amber-500/20 border-4 border-amber-500/50 px-12 py-6 rounded-full transform shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                <span className="text-6xl font-black text-amber-400 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                    PASS
                </span>
            </div>
        </div>
    );
};
