import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagicParticles from './cardBuilder/MagicParticles';
import PersonalizedCard from './PersonalizedCard';
import type { CardDraft, ManaSymbol } from './cardBuilder/types';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';
const DEFAULT_BACK_URL = 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';

type CustomCard = {
  id: string;
  source: 'EDITOR' | 'URLS';
  name: string;
  kind: 'Creature' | 'Land' | 'Non-creature';
  front_image_url: string | null;
  back_image_url: string | null;
  art_url: string | null;
  mana_cost_generic: number;
  mana_cost_symbols: ManaSymbol[];
  type_line: string | null;
  rules_text: string | null;
  power: string | null;
  toughness: string | null;
  created_at: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: CustomCard, board: 'main' | 'side' | 'commander') => void;
};

export default function CustomCardsModal({ isOpen, onClose, onAddCard }: Props) {
  const [cards, setCards] = useState<CustomCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);

  const selected = useMemo(() => cards.find((c) => c.id === selectedId) || null, [cards, selectedId]);

  const selectedDraft = useMemo<CardDraft | null>(() => {
    if (!selected) return null;
    if (selected.source === 'URLS') return null;
    return {
      name: selected.name,
      kind: selected.kind,
      typeLine: selected.type_line || '',
      rulesText: selected.rules_text || '',
      power: selected.power || '',
      toughness: selected.toughness || '',
      manaCost: { generic: selected.mana_cost_generic || 0, symbols: selected.mana_cost_symbols || [] },
      artUrl: selected.art_url || selected.front_image_url || '',
      backUrl: selected.back_image_url || '',
    };
  }, [selected]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setErrorMsg(null);
    axios
      .get(`${API_BASE_URL}/custom-cards`)
      .then((res) => {
        const raw = (Array.isArray(res.data) ? res.data : []) as CustomCard[];
        setCards(raw);
        setSelectedId((prev) => prev || (raw[0]?.id ?? null));
        setShowBack(false);
      })
      .catch(() => setErrorMsg('No se pudieron cargar tus cartas personalizadas.'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-amber-500/20 shadow-2xl bg-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-black" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          <MagicParticles count={28} className="opacity-50" />
        </div>

        <div className="relative z-10 flex items-center justify-between p-5 border-b border-amber-500/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 via-indigo-500/15 to-amber-500/10 border border-white/10 flex items-center justify-center">
              <Sparkles className="text-amber-300" size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300/70 font-bold">Spellforge</div>
              <div className="text-xl font-serif font-bold text-slate-100">Cartas personalizadas</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors rounded-lg p-2 hover:bg-slate-900/50 border border-transparent hover:border-slate-700/60"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
          <div className="p-5 border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Tu grimorio</div>
              <div className="text-xs font-mono text-slate-400">{cards.length} cartas</div>
            </div>

            {loading && (
              <div className="py-16 text-center text-slate-400 font-serif animate-pulse">Invocando tu colección...</div>
            )}

            {!loading && errorMsg && (
              <div className="py-10">
                <div className="bg-red-950/30 border border-red-800/40 text-red-200 rounded-xl p-4 font-serif">{errorMsg}</div>
              </div>
            )}

            {!loading && !errorMsg && cards.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-slate-400 font-serif mb-4">Aún no has creado cartas personalizadas.</div>
                <Link
                  to="/card-builder"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors"
                >
                  <Sparkles size={16} /> Ir a Spellforge
                </Link>
              </div>
            )}

            {!loading && !errorMsg && cards.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto max-h-[56vh] pr-1 custom-scrollbar">
                {cards.map((c) => {
                  const isSelected = c.id === selectedId;
                  const draft: CardDraft | null =
                    c.source === 'EDITOR'
                      ? {
                          name: c.name,
                          kind: c.kind,
                          typeLine: c.type_line || '',
                          rulesText: c.rules_text || '',
                          power: c.power || '',
                          toughness: c.toughness || '',
                          manaCost: { generic: c.mana_cost_generic || 0, symbols: c.mana_cost_symbols || [] },
                          artUrl: c.art_url || '',
                          backUrl: c.back_image_url || '',
                        }
                      : null;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(c.id);
                        setShowBack(false);
                      }}
                      className={`group text-left rounded-xl border transition-all overflow-hidden bg-slate-950/70 hover:bg-slate-900/60 ${
                        isSelected ? 'border-amber-500/50 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]' : 'border-slate-800/70 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="relative">
                        <div className="p-2">
                          <div className="relative">
                            <div className="absolute -inset-3 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-amber-500/10 blur-xl opacity-0 group-hover:opacity-80 transition-opacity" />
                            {draft ? (
                              <PersonalizedCard card={draft} className="w-full" />
                            ) : c.front_image_url ? (
                              <div className="w-full aspect-[2.5/3.5] rounded-[16px] overflow-hidden border border-slate-700 bg-black">
                                <img src={c.front_image_url} className="w-full h-full object-contain" draggable={false} />
                              </div>
                            ) : (
                              <div className="w-full aspect-[2.5/3.5] rounded-[16px] grid place-items-center border border-slate-700 bg-slate-900 text-slate-500 font-serif italic">
                                Sin imagen
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Vista</div>
              {selected && (
                <div className="flex items-center gap-2">
                  {selected.back_image_url && (
                    <button
                      type="button"
                      onClick={() => setShowBack((v) => !v)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700/60 text-slate-200 bg-slate-900/40 hover:bg-slate-800/60 hover:border-amber-500/40 transition-all"
                    >
                      {showBack ? 'Ver frente' : 'Ver reverso'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {!selected && (
              <div className="py-16 text-center text-slate-500 font-serif">Selecciona una carta.</div>
            )}

            {selected && (
              <div className="grid grid-cols-1 gap-4">
                <div className="relative rounded-2xl border border-amber-500/20 bg-slate-950/50 overflow-hidden">
                  <div className="absolute -inset-6 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-amber-500/10 blur-2xl opacity-70" />
                  <div className="relative p-4">
                    {selected?.source === 'URLS' ? (
                      <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
                        <div className="w-full aspect-[2.5/3.5] rounded-[16px] overflow-hidden border border-slate-700 bg-black">
                          {showBack ? (
                            <img
                              src={selected.back_image_url || DEFAULT_BACK_URL}
                              className="w-full h-full object-contain bg-black"
                              draggable={false}
                            />
                          ) : selected.front_image_url ? (
                            <img src={selected.front_image_url} className="w-full h-full object-contain bg-black" draggable={false} />
                          ) : (
                            <div className="w-full h-full grid place-items-center bg-slate-900 text-slate-500 font-serif italic">Arte no disponible</div>
                          )}
                        </div>
                      </div>
                    ) : selectedDraft ? (
                      <div className="w-full max-w-sm mx-auto animate-in fade-in duration-300">
                        <PersonalizedCard card={selectedDraft} showBack={showBack} />
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Quick Actions overlay */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    <button 
                      onClick={() => onAddCard(selected, 'main')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg shadow-lg transition-all hover:scale-105"
                    >
                      + Main
                    </button>
                    <button 
                      onClick={() => onAddCard(selected, 'side')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg shadow-lg transition-all hover:scale-105"
                    >
                      + Side
                    </button>
                    <button 
                      onClick={() => onAddCard(selected, 'commander')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg shadow-lg transition-all hover:scale-105"
                    >
                      + Cmd
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/70 rounded-2xl p-4 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="font-serif font-bold text-slate-100 truncate">{selected.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{new Date(selected.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Tipo</div>
                      <div className="text-slate-200 font-serif">{selected.kind}</div>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Origen</div>
                      <div className="text-slate-200 font-mono">{selected.source}</div>
                    </div>
                  </div>

                  {(selected.type_line || selected.rules_text) && (
                    <div className="mt-3 bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2">
                      {selected.type_line && <div className="text-slate-200 font-serif text-sm">{selected.type_line}</div>}
                      {selected.rules_text && (
                        <div className="text-slate-300 font-serif text-sm whitespace-pre-wrap mt-2 leading-relaxed">
                          {selected.rules_text}
                        </div>
                      )}
                    </div>
                  )}

                  {selected.kind === 'Creature' && (selected.power || selected.toughness) && (
                    <div className="mt-3 flex items-center justify-end">
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-2 font-mono text-slate-200">
                        {(selected.power || '0')}/{(selected.toughness || '0')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

