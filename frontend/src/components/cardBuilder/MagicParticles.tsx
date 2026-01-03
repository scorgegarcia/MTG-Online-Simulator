import { useMemo } from 'react';
import clsx from 'clsx';

type MagicParticlesProps = {
  count?: number;
  className?: string;
};

type Particle = {
  leftPct: number;
  topPct: number;
  sizePx: number;
  delayS: number;
  durationS: number;
  hue: number;
  blurPx: number;
  driftPx: number;
};

export default function MagicParticles({ count = 26, className }: MagicParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    const next: Particle[] = [];
    for (let i = 0; i < count; i += 1) {
      next.push({
        leftPct: Math.random() * 100,
        topPct: Math.random() * 100,
        sizePx: 2 + Math.random() * 5,
        delayS: Math.random() * 3.5,
        durationS: 5 + Math.random() * 7,
        hue: 260 + Math.random() * 80,
        blurPx: Math.random() * 1.8,
        driftPx: 12 + Math.random() * 20,
      });
    }
    return next;
  }, [count]);

  return (
    <div className={clsx('absolute inset-0 pointer-events-none overflow-hidden', className)} aria-hidden="true">
      <style>{`
        @keyframes spellforgeFloat {
          0% { transform: translate3d(0, 0, 0) scale(0.95); opacity: 0.0; }
          15% { opacity: 0.9; }
          50% { transform: translate3d(0, -18px, 0) scale(1.05); opacity: 0.75; }
          85% { opacity: 0.9; }
          100% { transform: translate3d(0, -36px, 0) scale(0.95); opacity: 0.0; }
        }
        @keyframes spellforgeDrift {
          0% { margin-left: 0px; }
          50% { margin-left: 16px; }
          100% { margin-left: 0px; }
        }
      `}</style>

      {particles.map((p, idx) => (
        <span
          key={idx}
          className="absolute rounded-full"
          style={{
            left: `${p.leftPct}%`,
            top: `${p.topPct}%`,
            width: `${p.sizePx}px`,
            height: `${p.sizePx}px`,
            filter: `blur(${p.blurPx}px)`,
            background: `radial-gradient(circle, hsla(${p.hue}, 95%, 75%, 0.95) 0%, hsla(${p.hue}, 95%, 65%, 0.15) 60%, transparent 70%)`,
            boxShadow: `0 0 16px hsla(${p.hue}, 95%, 70%, 0.25), 0 0 28px hsla(${p.hue}, 95%, 70%, 0.12)`,
            animation: `spellforgeFloat ${p.durationS}s ease-in-out ${p.delayS}s infinite, spellforgeDrift ${Math.max(
              6,
              p.durationS - 1
            )}s ease-in-out ${p.delayS}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

