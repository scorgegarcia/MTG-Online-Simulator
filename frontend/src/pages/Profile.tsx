import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  History, 
  ArrowLeft,
  Medal,
  Calendar,
  Mail,
  Edit3,
  CheckCircle2,
  XCircle,
  Swords
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import uiHoverSfx from '../assets/sfx/ui_hover.mp3';
import selectSfx from '../assets/sfx/select.mp3';
import axios from 'axios';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

type GameListItem = {
  id: string;
  code: string;
  status: string;
  created_at: string;
  started_at: string | null;
  myOutcome?: 'WON' | 'LOST' | null;
  host: { id: string; username: string };
  players: { user: { id: string; username: string } }[];
};

export default function Profile() {
  const { user } = useAuth();
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);
  const [games, setGames] = useState<GameListItem[]>([]);
  const [deckCount, setDeckCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [outcomesByGameId, setOutcomesByGameId] = useState<Record<string, 'WON' | 'LOST' | undefined>>({});

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }), []);
  const dateTimeFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }), []);

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

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      axios.get(`${API_BASE_URL}/games`),
      axios.get(`${API_BASE_URL}/decks`),
    ])
      .then(([gamesRes, decksRes]) => {
        if (cancelled) return;
        const nextGames = Array.isArray(gamesRes.data) ? (gamesRes.data as GameListItem[]) : [];
        setGames(nextGames);
        setDeckCount(Array.isArray(decksRes.data) ? decksRes.data.length : 0);
        setOutcomesByGameId(() => {
          const next: Record<string, 'WON' | 'LOST' | undefined> = {};
          for (const g of nextGames) {
            if (g.myOutcome === 'WON' || g.myOutcome === 'LOST') next[g.id] = g.myOutcome;
          }
          return next;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setGames([]);
        setDeckCount(0);
        setOutcomesByGameId({});
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

  const setOutcome = useCallback((gameId: string, nextOutcome: 'WON' | 'LOST') => {
    setOutcomesByGameId(prev => {
      const currentOutcome = prev[gameId];
      const outcomeToSave = currentOutcome === nextOutcome ? undefined : nextOutcome;
      const payloadOutcome = currentOutcome === nextOutcome ? null : nextOutcome;

      axios
        .put(`${API_BASE_URL}/games/${gameId}/outcome`, { outcome: payloadOutcome })
        .catch(() => {
          setOutcomesByGameId(next => ({ ...next, [gameId]: currentOutcome }));
        });

      return { ...prev, [gameId]: outcomeToSave };
    });
  }, []);

  const { battlesWon, battlesLost } = useMemo(() => {
    let won = 0;
    let lost = 0;
    for (const g of games) {
      const o = outcomesByGameId[g.id];
      if (o === 'WON') won += 1;
      if (o === 'LOST') lost += 1;
    }
    return { battlesWon: won, battlesLost: lost };
  }, [games, outcomesByGameId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
      </div>

      <div className="max-w-4xl mx-auto p-6 relative z-10">
        
        <header className="flex justify-between items-center mb-10">
          <Link 
            to="/" 
            onMouseEnter={playHover}
            onClick={playSelect}
            className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif uppercase tracking-widest text-sm">Return to Sanctum</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-900/20 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold uppercase tracking-tighter">
            <Shield size={12} />
            <span>Authenticated Planeswalker</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-32 h-32 mx-auto bg-slate-950 rounded-full border-2 border-amber-500/30 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/10">
                  <User size={64} className="text-amber-500/50" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-slate-100 mb-1">{user?.username}</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Master Summoner</p>
                
                <button 
                  onMouseEnter={playHover}
                  onClick={playSelect}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-all"
                >
                  <Edit3 size={14} />
                  <span>Edit Identity</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail size={16} className="text-amber-500/50" />
                <span className="text-sm truncate">{user?.email || 'No email linked'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar size={16} className="text-amber-500/50" />
                <span className="text-sm">Joined Dec 2025</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold uppercase">Battles Won</span>
                </div>
                <div className="text-3xl font-serif font-bold text-slate-100">{battlesWon}</div>
              </div>
              <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <XCircle size={16} />
                  <span className="text-xs font-bold uppercase">Battles Lost</span>
                </div>
                <div className="text-3xl font-serif font-bold text-slate-100">{battlesLost}</div>
              </div>
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Medal size={16} />
                  <span className="text-xs font-bold uppercase">Total Decks</span>
                </div>
                <div className="text-3xl font-serif font-bold text-slate-100">{deckCount}</div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
                <History size={18} className="text-amber-500" />
                <h2 className="font-serif font-bold">Recent Battles</h2>
              </div>
              <div className="p-2">
                {isLoading && (
                  <div className="p-4 text-sm text-slate-500 font-serif italic">Scrying your recent battles...</div>
                )}

                {!isLoading && games.length === 0 && (
                  <div className="p-6 text-center text-slate-500 font-serif italic">
                    No battles recorded yet.
                  </div>
                )}

                {!isLoading && games.map((g) => {
                  const createdAt = new Date(g.created_at);
                  const createdLabel = Number.isNaN(createdAt.getTime()) ? g.created_at : dateTimeFormatter.format(createdAt);
                  const opponentNames = (g.players || [])
                    .map(p => p.user)
                    .filter(u => u && u.id !== user?.id)
                    .map(u => u.username);
                  const vsLabel = opponentNames.length ? `vs ${opponentNames.join(', ')}` : 'Solo realm';
                  const outcome = outcomesByGameId[g.id];

                  const statusTone =
                    g.status === 'ACTIVE'
                      ? 'bg-indigo-900/30 border-indigo-500/20 text-indigo-300'
                      : g.status === 'FINISHED'
                        ? 'bg-slate-900/50 border-slate-700/40 text-slate-300'
                        : 'bg-amber-900/20 border-amber-500/20 text-amber-300';

                  return (
                    <div key={g.id} className="p-3 rounded-lg hover:bg-slate-800/40 transition-colors w-full">
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                          <div className="mt-1 w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                            <Swords size={18} className="text-amber-500/70" />
                          </div>
                          <div className="min-w-0 flex-1 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-medium text-slate-200 truncate">Battle #{g.code}</span>
                              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusTone}`}>{g.status}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                              {(Number.isNaN(createdAt.getTime()) ? g.created_at : dateFormatter.format(createdAt))} • {vsLabel} • Hosted by {g.host?.username}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onMouseEnter={playHover}
                                onClick={() => {
                                  playSelect();
                                  setOutcome(g.id, 'WON');
                                }}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-bold tracking-wide transition-all ${
                                  outcome === 'WON'
                                    ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-200'
                                }`}
                              >
                                <CheckCircle2 size={14} />
                                WON
                              </button>
                              <button
                                onMouseEnter={playHover}
                                onClick={() => {
                                  playSelect();
                                  setOutcome(g.id, 'LOST');
                                }}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-bold tracking-wide transition-all ${
                                  outcome === 'LOST'
                                    ? 'bg-red-900/50 border-red-500/40 text-red-100 shadow-[0_0_16px_rgba(239,68,68,0.25)]'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-red-500/30 hover:text-red-200'
                                }`}
                              >
                                <XCircle size={14} />
                                LOST
                              </button>

                              <Link
                                to={`/game/${g.id}`}
                                onMouseEnter={playHover}
                                onClick={playSelect}
                                className="ml-auto text-xs font-mono text-slate-600 hover:text-amber-300 transition-colors"
                                title={createdLabel}
                              >
                                OPEN
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
              <Shield className="mx-auto text-slate-800 mb-4" size={48} />
              <h3 className="text-slate-500 font-serif italic">More achievements will be unveiled soon...</h3>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
