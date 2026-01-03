import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import axios from 'axios';
import uiHoverSfx from '../assets/sfx/ui_hover.mp3';
import selectSfx from '../assets/sfx/select.mp3';
import EntryModal from '../components/cardBuilder/EntryModal';
import MagicParticles from '../components/cardBuilder/MagicParticles';
import ManaCostEditor from '../components/cardBuilder/ManaCostEditor';
import CardPreview from '../components/cardBuilder/CardPreview';
import type { CardDraft, CardKind } from '../components/cardBuilder/types';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

const defaultDraft: CardDraft = {
  name: '',
  kind: 'Non-creature',
  typeLine: '',
  rulesText: '',
  power: '1',
  toughness: '1',
  manaCost: { generic: 0, symbols: [] },
  artUrl: '',
  backUrl: '',
};

function defaultTypeLineFor(kind: CardKind) {
  if (kind === 'Creature') return 'Creature —';
  if (kind === 'Land') return 'Land';
  return 'Sorcery';
}

export default function CardBuilder() {
  const { id } = useParams();
  const editingCardId = typeof id === 'string' && id.trim().length > 0 ? id : null;
  const navigate = useNavigate();
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);

  const [entryOpen, setEntryOpen] = useState(() => !editingCardId);
  const [mode, setMode] = useState<'editor' | 'urls' | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(() => Boolean(editingCardId));
  const [saveState, setSaveState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({
    status: 'idle',
  });
  const [draft, setDraft] = useState<CardDraft>(() => ({
    ...defaultDraft,
    typeLine: defaultTypeLineFor(defaultDraft.kind),
  }));

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

  const title = useMemo(() => {
    if (editingCardId) return 'Card Builder — Editar carta';
    if (mode === 'urls') return 'Card Builder — Desde URLs';
    if (mode === 'editor') return 'Card Builder — Editor Completo';
    return 'Card Builder';
  }, [editingCardId, mode]);

  useEffect(() => {
    if (!editingCardId) return;
    setEntryOpen(false);
    setIsLoadingCard(true);
    axios
      .get(`${API_BASE_URL}/custom-cards/${editingCardId}`)
      .then((res) => {
        const c = res.data;
        const nextMode = c?.source === 'URLS' ? 'urls' : 'editor';
        setMode(nextMode);
        setDraft({
          name: String(c?.name || ''),
          kind: (c?.kind || 'Non-creature') as any,
          typeLine: String(c?.type_line || defaultTypeLineFor((c?.kind || 'Non-creature') as CardKind)),
          rulesText: String(c?.rules_text || ''),
          power: String(c?.power || '1'),
          toughness: String(c?.toughness || '1'),
          manaCost: {
            generic: Number.isFinite(Number(c?.mana_cost_generic)) ? Number(c?.mana_cost_generic) : 0,
            symbols: (Array.isArray(c?.mana_cost_symbols) ? c.mana_cost_symbols : []) as any,
          },
          artUrl: String((c?.source === 'URLS' ? c?.front_image_url : c?.art_url) || ''),
          backUrl: String(c?.back_image_url || ''),
        });
      })
      .catch(() => {
        navigate('/card-manager');
      })
      .finally(() => {
        setIsLoadingCard(false);
      });
  }, [editingCardId, navigate]);

  const saveToDb = useCallback(async () => {
    if (!mode) return;
    setSaveState({ status: 'saving' });
    try {
      if (mode === 'urls') {
        const payload = {
          source: 'URLS',
          name: draft.name.trim().length > 0 ? draft.name.trim() : 'Untitled',
          kind: draft.kind,
          front_image_url: draft.artUrl.trim(),
          back_image_url: draft.backUrl.trim().length > 0 ? draft.backUrl.trim() : null,
        };
        if (editingCardId) {
          await axios.put(`${API_BASE_URL}/custom-cards/${editingCardId}`, payload);
        } else {
          await axios.post(`${API_BASE_URL}/custom-cards`, payload);
        }
      } else {
        const payload = {
          source: 'EDITOR',
          name: draft.name.trim().length > 0 ? draft.name.trim() : 'Untitled',
          kind: draft.kind,
          type_line: draft.typeLine.trim().length > 0 ? draft.typeLine.trim() : null,
          rules_text: draft.rulesText.trim().length > 0 ? draft.rulesText.trim() : null,
          power: draft.kind === 'Creature' ? draft.power.trim() : null,
          toughness: draft.kind === 'Creature' ? draft.toughness.trim() : null,
          mana_cost_generic: draft.kind === 'Land' ? 0 : draft.manaCost.generic,
          mana_cost_symbols: draft.kind === 'Land' ? [] : draft.manaCost.symbols,
          art_url: draft.artUrl.trim().length > 0 ? draft.artUrl.trim() : null,
          back_image_url: draft.backUrl.trim().length > 0 ? draft.backUrl.trim() : null,
        };
        if (editingCardId) {
          await axios.put(`${API_BASE_URL}/custom-cards/${editingCardId}`, payload);
        } else {
          await axios.post(`${API_BASE_URL}/custom-cards`, payload);
        }
      }
      setSaveState({ status: 'saved', message: 'Guardada en tu grimorio.' });
      window.setTimeout(() => {
        setSaveState({ status: 'idle' });
        navigate('/');
      }, 0);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo guardar.';
      setSaveState({ status: 'error', message: msg });
      window.setTimeout(() => setSaveState({ status: 'idle' }), 3500);
    }
  }, [draft, editingCardId, mode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        <MagicParticles count={34} className="opacity-40" />
      </div>

      <EntryModal
        isOpen={entryOpen}
        onClose={() => navigate('/')}
        onSelect={(nextMode) => {
          playSelect();
          setMode(nextMode);
          setEntryOpen(false);
        }}
      />

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end border-b border-amber-500/20 pb-6 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 text-amber-500 mb-1">
              <Sparkles size={20} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">{title}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-100 drop-shadow-md">The Spellforge</h1>
          </div>

          <div className="flex items-center gap-3">
            {mode && !entryOpen && (
              <button
                type="button"
                onMouseEnter={playHover}
                onClick={() => {
                  playSelect();
                  saveToDb();
                }}
                disabled={
                  isLoadingCard || saveState.status === 'saving' || (mode === 'urls' && draft.artUrl.trim().length === 0)
                }
                className="flex items-center gap-2 px-4 py-2 bg-emerald-900/40 border border-emerald-700/50 hover:border-amber-500/50 text-emerald-100 rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span className="font-serif tracking-wider text-sm">
                  {saveState.status === 'saving' ? 'Guardando...' : 'Guardar'}
                </span>
              </button>
            )}

            <Link
              to={editingCardId ? '/card-manager' : '/'}
              onMouseEnter={playHover}
              onClick={playSelect}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-700 hover:border-amber-500/50 text-slate-200 rounded transition-all duration-300 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-serif tracking-wider text-sm">{editingCardId ? 'Back to Card Manager' : 'Back to Sanctum'}</span>
            </Link>
          </div>
        </header>

        {saveState.status !== 'idle' && (
          <div className="mb-6">
            <div
              className={`border rounded-xl px-4 py-3 font-serif transition-all ${
                saveState.status === 'saved'
                  ? 'bg-emerald-950/40 border-emerald-700/40 text-emerald-200'
                  : saveState.status === 'error'
                    ? 'bg-red-950/40 border-red-700/40 text-red-200'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-200'
              }`}
            >
              {saveState.message || (saveState.status === 'saving' ? 'Guardando...' : '')}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-500/50 rounded-xl p-1 transition-all duration-500">
            <div className="bg-slate-900 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />

              {isLoadingCard && (
                <div className="text-slate-500 font-serif italic animate-in fade-in duration-300">Cargando carta...</div>
              )}

              {mode === 'urls' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Creación rápida</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Nombre</div>
                      <input
                        value={draft.name}
                        onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                        onMouseEnter={playHover}
                        onFocus={playSelect}
                        placeholder="Nombre de la carta"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-serif"
                      />
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Tipo</div>
                      <select
                        value={draft.kind}
                        onChange={(e) => {
                          const nextKind = e.target.value as CardKind;
                          setDraft((prev) => ({
                            ...prev,
                            kind: nextKind,
                            typeLine: defaultTypeLineFor(nextKind),
                            manaCost: nextKind === 'Land' ? { generic: 0, symbols: [] } : prev.manaCost,
                          }));
                        }}
                        onMouseEnter={playHover}
                        onFocus={playSelect}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                      >
                        <option value="Creature">Criatura</option>
                        <option value="Land">Land</option>
                        <option value="Non-creature">Non-creature</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">URL de imagen (frente)</div>
                    <input
                      value={draft.artUrl}
                      onChange={(e) => setDraft((prev) => ({ ...prev, artUrl: e.target.value }))}
                      onMouseEnter={playHover}
                      onFocus={playSelect}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                    />
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">URL de imagen (reverso opcional)</div>
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, backUrl: '' }))}
                        className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
                      >
                        Usar reverso estándar
                      </button>
                    </div>
                    <input
                      value={draft.backUrl}
                      onChange={(e) => setDraft((prev) => ({ ...prev, backUrl: e.target.value }))}
                      onMouseEnter={playHover}
                      onFocus={playSelect}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                    />
                  </div>
                </div>
              )}

              {mode === 'editor' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Editor completo</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Nombre</div>
                      <input
                        value={draft.name}
                        onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                        onMouseEnter={playHover}
                        onFocus={playSelect}
                        placeholder="Nombre de la carta"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-serif"
                      />
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Tipo</div>
                      <select
                        value={draft.kind}
                        onChange={(e) => {
                          const nextKind = e.target.value as CardKind;
                          setDraft((prev) => ({
                            ...prev,
                            kind: nextKind,
                            manaCost: nextKind === 'Land' ? { generic: 0, symbols: [] } : prev.manaCost,
                          }));
                        }}
                        onMouseEnter={playHover}
                        onFocus={playSelect}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                      >
                        <option value="Creature">Criatura</option>
                        <option value="Land">Land</option>
                        <option value="Non-creature">Non-creature</option>
                      </select>
                    </div>
                  </div>

                  {draft.kind !== 'Land' && (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Coste de maná</div>
                      <ManaCostEditor
                        value={draft.manaCost}
                        onChange={(next) => setDraft((prev) => ({ ...prev, manaCost: next }))}
                      />
                    </div>
                  )}

                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">URL del arte</div>
                    <input
                      value={draft.artUrl}
                      onChange={(e) => setDraft((prev) => ({ ...prev, artUrl: e.target.value }))}
                      onMouseEnter={playHover}
                      onFocus={playSelect}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                    />
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Texto de tipo</div>
                    <input
                      value={draft.typeLine}
                      onChange={(e) => setDraft((prev) => ({ ...prev, typeLine: e.target.value }))}
                      onMouseEnter={playHover}
                      onFocus={playSelect}
                      placeholder="Legendary Creature — ..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-serif"
                    />
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Reglas</div>
                    <textarea
                      value={draft.rulesText}
                      onChange={(e) => setDraft((prev) => ({ ...prev, rulesText: e.target.value }))}
                      onMouseEnter={playHover}
                      onFocus={playSelect}
                      placeholder="Escribe aquí el texto de reglas..."
                      rows={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-serif resize-none"
                    />
                  </div>

                  {draft.kind === 'Creature' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Poder</div>
                        <input
                          value={draft.power}
                          onChange={(e) => setDraft((prev) => ({ ...prev, power: e.target.value }))}
                          onMouseEnter={playHover}
                          onFocus={playSelect}
                          placeholder="1"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono text-center"
                        />
                      </div>
                      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Resistencia</div>
                        <input
                          value={draft.toughness}
                          onChange={(e) => setDraft((prev) => ({ ...prev, toughness: e.target.value }))}
                          onMouseEnter={playHover}
                          onFocus={playSelect}
                          placeholder="1"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono text-center"
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">URL de reverso (opcional)</div>
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, backUrl: '' }))}
                        className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
                      >
                        Usar reverso estándar
                      </button>
                    </div>
                    <input
                      value={draft.backUrl}
                      onChange={(e) => setDraft((prev) => ({ ...prev, backUrl: e.target.value }))}
                      onMouseEnter={playHover}
                      onFocus={playSelect}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                    />
                  </div>
                </div>
              )}

              {mode === null && !isLoadingCard && (
                <div className="text-slate-500 font-serif italic animate-in fade-in duration-300">
                  Abre el ritual inicial para escoger un modo.
                  <button
                    type="button"
                    onClick={() => {
                      playSelect();
                      setEntryOpen(true);
                    }}
                    className="ml-2 text-amber-300 hover:text-amber-200 underline decoration-amber-500/30"
                  >
                    Invocar
                  </button>
                </div>
              )}

              {!entryOpen && (
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onMouseEnter={playHover}
                    onClick={() => {
                      playSelect();
                      saveToDb();
                    }}
                    disabled={
                      isLoadingCard || saveState.status === 'saving' || (mode === 'urls' && draft.artUrl.trim().length === 0)
                    }
                    className="flex items-center gap-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-100 border border-emerald-700/50 hover:border-amber-500/50 px-4 py-2 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    <span className="font-serif tracking-wider">
                      {saveState.status === 'saving' ? 'Guardando...' : 'Guardar'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onMouseEnter={playHover}
                    onClick={() => {
                      playSelect();
                      setShowBack((v) => !v);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40 px-3 py-2 rounded text-sm transition-all font-serif"
                  >
                    {showBack ? 'Ver frente' : 'Ver reverso'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-500/50 rounded-xl p-1 transition-all duration-500">
            <div className="bg-slate-900 rounded-lg p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              <CardPreview
                card={draft}
                showBack={showBack}
                onToggleFace={() => setShowBack((v) => !v)}
                variant={mode === 'urls' ? 'imageOnly' : 'constructed'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
