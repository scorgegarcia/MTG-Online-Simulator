import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CardDraft, ManaSymbol } from './cardBuilder/types';

import forestIcon from '../assets/img/land_forest_icon.png';
import islandIcon from '../assets/img/land_island_icon.png';
import mountainIcon from '../assets/img/land_mountain_icon.png';
import plainsIcon from '../assets/img/land_planes_icon.png';
import swampIcon from '../assets/img/land_swamp_icon.png';

const symbolToIcon: Record<string, string> = {
  W: plainsIcon,
  U: islandIcon,
  B: swampIcon,
  R: mountainIcon,
  G: forestIcon,
};

const DEFAULT_BACK_URL = 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

const symbolToClasses: Record<ManaSymbol, string> = {
  W: 'bg-amber-100 text-amber-900 ring-amber-300/70',
  U: 'bg-sky-200 text-sky-900 ring-sky-400/60',
  B: 'bg-slate-800 text-slate-100 ring-slate-500/60',
  R: 'bg-rose-200 text-rose-900 ring-rose-400/60',
  G: 'bg-emerald-200 text-emerald-900 ring-emerald-400/60',
  C: 'bg-stone-200 text-stone-900 ring-stone-400/60',
  X: 'bg-fuchsia-200 text-fuchsia-900 ring-fuchsia-400/60',
};

const landColorStops: Record<'W' | 'U' | 'B' | 'R' | 'G', [string, string]> = {
  W: ['#f7f2de', '#d9cba1'],
  U: ['#6fc6ff', '#1f6aa5'],
  B: ['#2b2a35', '#0b0a0f'],
  R: ['#ff9a8a', '#b3261e'],
  G: ['#87f2b9', '#1f7a3a'],
};

function manaFrameGradient(symbols: ManaSymbol[], generic: number) {
  const colors = Array.from(new Set(symbols.filter((s): s is 'W' | 'U' | 'B' | 'R' | 'G' => ['W', 'U', 'B', 'R', 'G'].includes(s))));
  const hasOnlyColorless = colors.length === 0 && (generic > 0 || symbols.some((s) => s === 'C' || s === 'X') || symbols.length === 0);

  if (hasOnlyColorless) {
    return {
      backgroundImage: 'linear-gradient(135deg, rgba(148,163,184,0.38), rgba(30,41,59,0.96))',
    } as const;
  }

  if (colors.length === 1) {
    const [a, b] = landColorStops[colors[0]];
    return {
      backgroundImage: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
    } as const;
  }

  const stops: string[] = [];
  for (const c of colors.slice(0, 4)) {
    const [a, b] = landColorStops[c];
    stops.push(a, b);
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${stops.join(', ')})`,
  } as const;
}

type Props = {
  card: CardDraft;
  showBack?: boolean;
  className?: string;
};

export default function PersonalizedCard({ card, showBack = false, className }: Props) {
  const [frontErrored, setFrontErrored] = useState(false);
  const [backErrored, setBackErrored] = useState(false);

  const frameStyle = useMemo(() => manaFrameGradient(card.manaCost.symbols, card.manaCost.generic), [
    card.manaCost.generic,
    card.manaCost.symbols,
  ]);

  const mana = useMemo(() => {
    const parts: { type: 'generic' | 'symbol'; value: string }[] = [];
    if (card.manaCost.generic > 0) parts.push({ type: 'generic', value: String(card.manaCost.generic) });
    for (const s of card.manaCost.symbols) parts.push({ type: 'symbol', value: s });
    return parts;
  }, [card.manaCost.generic, card.manaCost.symbols]);

  const backUrl = card.backUrl.trim().length > 0 ? card.backUrl.trim() : DEFAULT_BACK_URL;

  if (showBack) {
    return (
      <div className={clsx('relative w-full aspect-[2.5/3.5] rounded-[16px] overflow-hidden', className)}>
        <div className="absolute inset-0 rounded-[16px]" style={frameStyle} />
        <div className="absolute inset-[3%] rounded-[12px] bg-slate-950 border border-slate-700 shadow-[0_0_35px_rgba(245,158,11,0.08)] overflow-hidden">
          {!backErrored ? (
            <img
              src={backUrl}
              alt="Card back"
              className="w-full h-full object-contain bg-black"
              onError={() => setBackErrored(true)}
            />
          ) : (
            <div className="w-full h-full grid place-items-center bg-slate-900 text-slate-500 font-serif italic">Reverso no disponible</div>
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('relative w-full aspect-[2.5/3.5] rounded-[16px]', className)}>
      <div className="absolute inset-0 rounded-[16px]" style={frameStyle} />
      <div className="absolute inset-[3%] rounded-[12px] bg-slate-950 border border-slate-700 shadow-[0_0_35px_rgba(245,158,11,0.08)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-70" />

        <div className="relative z-10 p-2 flex flex-col h-full text-[0.9em]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-serif font-bold text-slate-100 truncate leading-tight text-sm">{card.name.trim() || 'Untitled Spell'}</div>
            </div>

            {card.kind !== 'Land' && (
              <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
                {mana.map((m, idx) =>
                    m.type === 'generic' ? (
                      <span
                        key={`g-${idx}`}
                        className="w-3.5 h-3.5 rounded-full bg-stone-200 text-stone-900 ring-1 ring-stone-400/60 grid place-items-center font-mono text-[10px] font-bold shadow-inner"
                      >
                        {m.value}
                      </span>
                    ) : symbolToIcon[m.value] ? (
                      <img
                        key={`s-${idx}`}
                        src={symbolToIcon[m.value]}
                        alt={m.value}
                        className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20 shadow-sm object-cover"
                      />
                    ) : (
                      <span
                        key={`s-${idx}`}
                        className={clsx(
                          'w-3.5 h-3.5 rounded-full ring-1 grid place-items-center font-mono text-[10px] font-bold shadow-inner',
                          symbolToClasses[m.value as ManaSymbol]
                        )}
                      >
                        {m.value}
                      </span>
                    )
                )}
              </div>
            )}
          </div>

          <div className="mt-0 max-h-[40%] rounded-lg border border-slate-700/80 bg-slate-900/50 overflow-hidden relative flex-shrink-0">
            {card.artUrl.trim().length > 0 && !frontErrored ? (
              <img
                src={card.artUrl.trim()}
                alt="Card art"
                className="w-full max-h-[100%] sm:h-32 md:h-40 object-cover"
                onError={() => setFrontErrored(true)}
              />
            ) : (
              <div className="w-full h-24 sm:h-32 md:h-40 grid place-items-center bg-slate-900 text-slate-500 font-serif italic text-xs">Arte no disponible</div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>

          <div className="mt-0 flex items-center justify-between gap-2 rounded border border-slate-700/80 bg-slate-900/40 px-1 py-0.5 flex-shrink-0">
            <div className="text-[10px] text-slate-200 font-serif truncate">{card.typeLine.trim() || 'Spell'}</div>
            <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold shrink-0">{card.kind}</div>
          </div>

          <div className="mt-0 flex-1 rounded border border-slate-700/80 bg-slate-950/50 p-1 text-[11px] text-slate-200 leading-snug font-serif whitespace-pre-wrap overflow-y-auto">
            {card.rulesText.trim().length > 0 ? card.rulesText : '...'}
          </div>

          {card.kind === 'Creature' && (
            <div className="mt-0 flex justify-end shrink-0">
              <div className="rounded border border-slate-700/80 bg-slate-900/60 px-2 py-1 font-mono text-[10px] text-slate-100 shadow-inner">
                {(card.power || '0').trim()}/{(card.toughness || '0').trim()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 rounded-[16px] ring-1 ring-inset ring-white/10 pointer-events-none" />
    </div>
  );
}

