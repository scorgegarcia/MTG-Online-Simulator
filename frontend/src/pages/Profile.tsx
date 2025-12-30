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
  CheckCircle2,
  XCircle,
  Swords,
  Camera,
  X,
  ChevronLeft,
  ChevronRight
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
  const { user, updateUser } = useAuth();
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);
  const [games, setGames] = useState<GameListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [deckCount, setDeckCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [outcomesByGameId, setOutcomesByGameId] = useState<Record<string, 'WON' | 'LOST' | undefined>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user?.avatar_url || '');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

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
        // Sort games by created_at descending
        nextGames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return games.slice(start, start + ITEMS_PER_PAGE);
  }, [games, currentPage]);

  const handleUpdateAvatar = async () => {
    setIsUpdatingAvatar(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/auth/avatar`, { avatar_url: newAvatarUrl || null });
      updateUser(res.data.user);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

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
                <div className="relative w-32 h-32 mx-auto mb-4 group/avatar">
                  <div className="w-full h-full bg-slate-950 rounded-full border-2 border-amber-500/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-amber-500/10 transition-transform duration-500 group-hover/avatar:scale-105">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-amber-500/50" />
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      playSelect();
                      setIsModalOpen(true);
                    }}
                    onMouseEnter={playHover}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 transition-all transform hover:scale-110 active:scale-95 z-20"
                    title="Change Avatar"
                  >
                    <Camera size={20} />
                  </button>
                </div>
                <h1 className="text-2xl font-serif font-bold text-slate-100 mb-1">{user?.username}</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Master Summoner</p>
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

                {!isLoading && paginatedGames.length === 0 && (
                  <div className="p-6 text-center text-slate-500 font-serif italic">
                    No battles recorded yet.
                  </div>
                )}

                {!isLoading && paginatedGames.map((g) => {
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

                {/* Pagination Controls */}
                {!isLoading && totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50 mt-2">
                    <button
                      onClick={() => {
                        playSelect();
                        setCurrentPage(prev => Math.max(1, prev - 1));
                      }}
                      disabled={currentPage === 1}
                      onMouseEnter={playHover}
                      className="p-1 rounded-md text-slate-500 hover:text-amber-500 hover:bg-slate-800/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            playSelect();
                            setCurrentPage(page);
                          }}
                          onMouseEnter={playHover}
                          className={`w-7 h-7 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                            currentPage === page
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        playSelect();
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      }}
                      disabled={currentPage === totalPages}
                      onMouseEnter={playHover}
                      className="p-1 rounded-md text-slate-500 hover:text-amber-500 hover:bg-slate-800/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
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

      {/* Avatar Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-amber-900/40 to-slate-900 p-6 border-b border-amber-500/20 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-amber-500 flex items-center gap-2">
                <Camera size={24} />
                Update Avatar
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Image URL
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg px-4 py-3 text-slate-200 outline-none transition-all placeholder:text-slate-700"
                  />
                  <div className="absolute inset-0 rounded-lg bg-amber-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Paste the URL of an image that reflects your planeswalker essence.
                </p>
              </div>

              {newAvatarUrl && (
                <div className="space-y-2 text-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Preview
                  </label>
                  <div className="w-24 h-24 mx-auto rounded-full border-2 border-amber-500/30 overflow-hidden bg-slate-950 shadow-xl">
                    <img 
                      src={newAvatarUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://www.transparenttextures.com/patterns/dark-matter.png';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 p-6 border-t border-slate-800 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all border border-slate-700"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateAvatar}
                disabled={isUpdatingAvatar}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingAvatar ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
