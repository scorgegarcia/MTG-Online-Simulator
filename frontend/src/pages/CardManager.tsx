import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import uiHoverSfx from '../assets/sfx/ui_hover.mp3';
import selectSfx from '../assets/sfx/select.mp3';
import { ArrowLeft, FileText, Sparkles, Trash2 } from 'lucide-react';
import PersonalizedCard from '../components/PersonalizedCard';
import type { CardDraft, ManaSymbol } from '../components/cardBuilder/types';
import { DeleteCustomCardModal } from '../components/DeleteCustomCardModal';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

type CustomCard = {
  id: string;
  source: 'EDITOR' | 'URLS';
  name: string;
  kind: 'Creature' | 'Land' | 'Non-creature';
  front_image_url: string | null;
  back_image_url: string | null;
  art_url: string | null;
  mana_cost_generic: number;
  mana_cost_symbols: ManaSymbol[] | any;
  type_line: string | null;
  rules_text: string | null;
  power: string | null;
  toughness: string | null;
  created_at: string;
};

export default function CardManager() {
  const navigate = useNavigate();
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);

  const [cards, setCards] = useState<CustomCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CustomCard | null>(null);

  useEffect(() => {
    const hoverAudio = new Audio(uiHoverSfx);
    hoverAudio.volume = 0.35;
    hoverAudioRef.current = hoverAudio;

    const selectAudio = new Audio(selectSfx);
    selectAudio.volume = 0.45;
    selectAudioRef.current = selectAudio;

    return () => {
      hoverAudioRef.current = null;
      selectAudioRef.current = null;
    };
  }, []);

  const playHover = useCallback(() => {
    const audio = hoverAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const playSelect = useCallback(() => {
    const audio = selectAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/custom-cards`);
      setCards(Array.isArray(res.data) ? res.data : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards().catch(() => {});
  }, [fetchCards]);

  const cardsCountLabel = useMemo(() => {
    if (isLoading) return 'Cargando...';
    return `${cards.length} cartas`;
  }, [cards.length, isLoading]);

  const toDraft = useCallback((c: CustomCard): CardDraft => {
    return {
      name: String(c.name || ''),
      kind: (c.kind || 'Non-creature') as any,
      typeLine: String(c.type_line || ''),
      rulesText: String(c.rules_text || ''),
      power: String(c.power || '1'),
      toughness: String(c.toughness || '1'),
      manaCost: {
        generic: Number.isFinite(Number(c.mana_cost_generic)) ? Number(c.mana_cost_generic) : 0,
        symbols: (Array.isArray(c.mana_cost_symbols) ? c.mana_cost_symbols : []) as ManaSymbol[],
      },
      artUrl: String(c.art_url || c.front_image_url || ''),
      backUrl: String(c.back_image_url || ''),
    };
  }, []);

  const deleteCard = useCallback(
    async (c: CustomCard) => {
      setCardToDelete(c);
      setDeleteModalOpen(true);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!cardToDelete) return;
    playSelect();
    await axios.delete(`${API_BASE_URL}/custom-cards/${cardToDelete.id}`);
    setCards((prev) => prev.filter((x) => x.id !== cardToDelete.id));
    setDeleteModalOpen(false);
    setCardToDelete(null);
  }, [cardToDelete, playSelect]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      </div>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end border-b border-amber-500/20 pb-6 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 text-amber-500 mb-1">
              <Sparkles size={20} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Card Manager</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-100 drop-shadow-md">Your Cards</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onMouseEnter={playHover}
              onClick={() => {
                playSelect();
                fetchCards().catch(() => {});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-700 hover:border-amber-500/50 text-slate-200 rounded transition-all duration-300"
            >
              <span className="font-serif tracking-wider text-sm">{cardsCountLabel}</span>
            </button>
            <Link
              to="/"
              onMouseEnter={playHover}
              onClick={playSelect}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-700 hover:border-amber-500/50 text-slate-200 rounded transition-all duration-300 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-serif tracking-wider text-sm">Back to Sanctum</span>
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="text-slate-500 font-serif italic">Cargando tus cartas...</div>
        ) : cards.length === 0 ? (
          <div className="text-slate-500 font-serif italic">No tienes cartas aún.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((c) => (
              <div key={c.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-serif font-bold text-slate-100 truncate">{c.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">
                      {c.source} · {c.kind}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onMouseEnter={playHover}
                      onClick={() => {
                        playSelect();
                        navigate(`/card-builder/${c.id}`);
                      }}
                      className="p-2 rounded bg-indigo-900/40 border border-indigo-700/40 hover:border-amber-500/40 text-indigo-100 transition-all"
                      title="Editar"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onMouseEnter={playHover}
                      onClick={() => deleteCard(c)}
                      className="p-2 rounded bg-red-950/40 border border-red-900/50 hover:border-red-500/50 text-red-200 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="w-full max-w-[240px] mx-auto">
                  {c.source === 'URLS' ? (
                    <div className="w-full aspect-[2.5/3.5] rounded-[16px] overflow-hidden border border-slate-700 bg-black">
                      <img
                        src={(c.front_image_url || '').trim()}
                        className="w-full h-full object-contain bg-black"
                        draggable={false}
                      />
                    </div>
                  ) : (
                    <PersonalizedCard card={toDraft(c)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-300 font-serif">
            Para crear una carta nueva, ve al{' '}
            <button
              onMouseEnter={playHover}
              onClick={() => {
                playSelect();
                navigate('/card-builder');
              }}
              className="text-amber-300 hover:text-amber-200 underline decoration-amber-500/30 hover:decoration-amber-500 transition-all underline-offset-4"
            >
              Card Builder
            </button>
            .
          </div>
        </div>
      </div>

      <DeleteCustomCardModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCardToDelete(null);
        }}
        onConfirm={confirmDelete}
        cardId={cardToDelete?.id || ''}
        cardName={cardToDelete?.name || ''}
      />
    </div>
  );
}

