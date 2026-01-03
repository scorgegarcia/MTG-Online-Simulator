import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ManaCost, ManaSymbol } from './types';

import forestIcon from '../../assets/img/land_forest_icon.png';
import islandIcon from '../../assets/img/land_island_icon.png';
import mountainIcon from '../../assets/img/land_mountain_icon.png';
import plainsIcon from '../../assets/img/land_planes_icon.png';
import swampIcon from '../../assets/img/land_swamp_icon.png';

const symbolToIcon: Record<string, string> = {
  W: plainsIcon,
  U: islandIcon,
  B: swampIcon,
  R: mountainIcon,
  G: forestIcon,
};

const SYMBOLS: { symbol: ManaSymbol; label: string; className: string }[] = [
  { symbol: 'W', label: 'W', className: 'bg-amber-100 text-amber-900 border-amber-300' },
  { symbol: 'U', label: 'U', className: 'bg-sky-200 text-sky-900 border-sky-400' },
  { symbol: 'B', label: 'B', className: 'bg-slate-800 text-slate-100 border-slate-600' },
  { symbol: 'R', label: 'R', className: 'bg-rose-200 text-rose-900 border-rose-400' },
  { symbol: 'G', label: 'G', className: 'bg-emerald-200 text-emerald-900 border-emerald-400' },
  { symbol: 'C', label: 'C', className: 'bg-stone-200 text-stone-900 border-stone-400' },
  { symbol: 'X', label: 'X', className: 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-400' },
];

type ManaCostEditorProps = {
  value: ManaCost;
  onChange: (next: ManaCost) => void;
};

export default function ManaCostEditor({ value, onChange }: ManaCostEditorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Genérico</div>
          <input
            type="number"
            min={0}
            max={99}
            value={Number.isFinite(value.generic) ? value.generic : 0}
            onChange={(e) => {
              const nextGeneric = Math.max(0, Math.min(99, Number(e.target.value || 0)));
              onChange({ ...value, generic: nextGeneric });
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
          />
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Símbolos</div>
          <div className="flex flex-wrap gap-2">
            {SYMBOLS.map((s) => (
              <button
                key={s.symbol}
                type="button"
                onClick={() => onChange({ ...value, symbols: [...value.symbols, s.symbol] })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold transition-all hover:shadow-[0_0_14px_rgba(245,158,11,0.15)] ${s.className}`}
              >
                {symbolToIcon[s.symbol] ? (
                  <img src={symbolToIcon[s.symbol]} alt={s.label} className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-black/20" />
                ) : (
                  <span>+ {s.label}</span>
                )}
                {symbolToIcon[s.symbol] && <span>+ {s.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Orden</div>
          <button
            type="button"
            onClick={() => onChange({ generic: value.generic, symbols: [] })}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
          >
            Limpiar símbolos
          </button>
        </div>

        {value.symbols.length === 0 ? (
          <div className="text-sm text-slate-500 italic">Añade símbolos para construir el coste.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.symbols.map((sym, idx) => {
              const style = SYMBOLS.find((s) => s.symbol === sym);
              const chipClass = style?.className ?? 'bg-slate-800 text-slate-100 border-slate-700';
              const moveLeft = idx > 0;
              const moveRight = idx < value.symbols.length - 1;

              return (
                <div key={`${sym}-${idx}`} className={`flex items-center gap-1.5 rounded border px-2 py-1 ${chipClass}`}>
                  {symbolToIcon[sym] ? (
                    <img src={symbolToIcon[sym]} alt={sym} className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-black/20" />
                  ) : (
                    <span className="font-mono text-xs font-bold">{sym}</span>
                  )}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={!moveLeft}
                      onClick={() => {
                        if (!moveLeft) return;
                        const next = [...value.symbols];
                        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                        onChange({ ...value, symbols: next });
                      }}
                      className="p-1 disabled:opacity-30"
                      title="Mover izquierda"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={!moveRight}
                      onClick={() => {
                        if (!moveRight) return;
                        const next = [...value.symbols];
                        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                        onChange({ ...value, symbols: next });
                      }}
                      className="p-1 disabled:opacity-30"
                      title="Mover derecha"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = value.symbols.filter((_, i) => i !== idx);
                        onChange({ ...value, symbols: next });
                      }}
                      className="p-1 hover:text-red-600 transition-colors"
                      title="Quitar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
