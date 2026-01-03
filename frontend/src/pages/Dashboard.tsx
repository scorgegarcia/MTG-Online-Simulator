import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import uiHoverSfx from '../assets/sfx/ui_hover.mp3';
import selectSfx from '../assets/sfx/select.mp3';
import { 
  Swords, 
  Scroll, 
  Skull, 
  PlusCircle, 
  Trash2, 
  LogOut, 
  BookOpen, 
  Dice5,
  Crown,
  Sparkles
} from 'lucide-react';
import Changelog from '../components/dashboard/Changelog';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [gameCode, setGameCode] = useState('');
  const navigate = useNavigate();
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/decks`).then(res => setDecks(res.data));
  }, []);

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

  const createGame = async () => {
    try {
        const res = await axios.post(`${API_BASE_URL}/games`);
        navigate(`/game/${res.data.id}`);
    } catch(e) { alert('Error creating game'); }
  };

  const joinGame = async () => {
    try {
        const res = await axios.post(`${API_BASE_URL}/games/join`, { code: gameCode });
        navigate(`/game/${res.data.gameId}`);
    } catch(e) { alert('Error joining game'); }
  };

  const deleteDeck = async (id: string) => {
      if(!confirm('Delete deck?')) return;
      await axios.delete(`${API_BASE_URL}/decks/${id}`);
      setDecks(decks.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 relative overflow-hidden">
      
      {/* --- Fondo Ambiental --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
      </div>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        
        {/* --- Header: El Santuario del Jugador --- */}
        <header className="flex flex-col md:flex-row justify-between items-end border-b border-amber-500/20 pb-6 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 text-amber-500 mb-1">
              <Crown size={20} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Planeswalker Sanctum</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-100 drop-shadow-md">
              Welcome, <Link to="/profile" className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 underline decoration-amber-500/30 hover:decoration-amber-500 transition-all underline-offset-4">{user?.username}</Link>
            </h1>
          </div>
          
          <button 
            onMouseEnter={playHover}
            onClick={() => {
              playSelect();
              logout();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-red-200 rounded transition-all duration-300 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif tracking-wider text-sm">Seal Gate (Logout)</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* --- Section 1: The Arena (Play) --- */}
          <div className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-500/50 rounded-xl p-1 transition-all duration-500">
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
            
            <div className="bg-slate-900 rounded-lg p-6 h-full relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-950 rounded-lg border border-indigo-500/30">
                  <Swords className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-100">The Arena</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Battlegrounds</p>
                </div>
              </div>

              {/* Host Game Button */}
              <button 
                onMouseEnter={playHover}
                onClick={() => {
                  playSelect();
                  createGame();
                }}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-900 to-blue-900 hover:from-indigo-800 hover:to-blue-800 border border-indigo-700 py-4 rounded-lg mb-6 group/btn transition-all shadow-lg shadow-indigo-900/20"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="flex items-center justify-center gap-3 relative z-10 text-indigo-100 font-serif font-bold text-lg tracking-wide">
                  <Dice5 size={20} />
                  <span>Manifest New Battlefield</span>
                </div>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-serif">Or Join Existing Realm</span>
                </div>
              </div>

              {/* Join Game Inputs */}
              <div className="flex gap-2 mt-6">
                <input 
                  value={gameCode}
                  onChange={e => setGameCode(e.target.value.toUpperCase())}
                  onMouseEnter={playHover}
                  onFocus={playSelect}
                  placeholder="RUNE CODE"
                  className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 p-3 rounded font-mono text-center uppercase tracking-[0.2em] focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-700 shadow-inner"
                />
                <button 
                  onMouseEnter={playHover}
                  onClick={() => {
                    playSelect();
                    joinGame();
                  }}
                  className="bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/50 hover:border-emerald-500 text-emerald-100 px-6 rounded font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>

          {/* --- Section 2: The Library (Decks) --- */}
          <div className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-500/50 rounded-xl p-1 transition-all duration-500">
            <div className="bg-slate-900 rounded-lg p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-500/30">
                    <BookOpen className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-100">Grimoires</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Your Decks</p>
                  </div>
                </div>
                <Link 
                  to="/decks/new" 
                  onMouseEnter={playHover}
                  onClick={playSelect}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/20 hover:border-amber-500/50 px-3 py-2 rounded text-sm transition-all"
                >
                  <PlusCircle size={16} />
                  <span className="font-serif">Inscribe New</span>
                </Link>
              </div>

              {/* Deck List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {decks.map(deck => (
                  <div
                    key={deck.id}
                    onMouseEnter={playHover}
                    className="group/item flex justify-between items-center bg-slate-950 border border-slate-800 hover:border-amber-500/30 p-3 rounded transition-colors relative overflow-hidden"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    
                    <Link
                      to={`/decks/${deck.id}`}
                      onClick={playSelect}
                      className="flex items-center gap-3 hover:text-amber-400 font-medium truncate flex-1 transition-colors pl-2"
                    >
                      <Scroll size={16} className="text-slate-600 group-hover/item:text-amber-500 transition-colors" />
                      <span className="font-serif tracking-wide text-slate-300 group-hover/item:text-amber-100">{deck.name}</span>
                    </Link>
                    
                    <button 
                      onMouseEnter={playHover}
                      onClick={() => {
                        playSelect();
                        deleteDeck(deck.id);
                      }}
                      className="text-slate-600 hover:text-red-400 p-2 rounded hover:bg-red-950/30 transition-all opacity-0 group-hover/item:opacity-100"
                      title="Burn Grimoire"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                {decks.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-lg">
                    <Skull className="mx-auto text-slate-700 mb-2" size={32} />
                    <p className="text-slate-500 font-serif italic">The library is empty.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="group relative bg-slate-900/50 border border-slate-700 hover:border-amber-500/50 rounded-xl p-1 transition-all duration-500 md:col-span-2">
            <div className="bg-slate-900 rounded-lg p-6 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
              <div className="flex items-center justify-between gap-4 relative z-10 flex-col md:flex-row">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-fuchsia-950/30 rounded-lg border border-fuchsia-500/30">
                    <Sparkles className="text-fuchsia-300" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-100">The Spellforge</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Card Builder</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <button
                    onMouseEnter={playHover}
                    onClick={() => {
                      playSelect();
                      navigate('/card-builder');
                    }}
                    className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-fuchsia-950 to-indigo-950 hover:from-fuchsia-900 hover:to-indigo-900 border border-fuchsia-700/50 hover:border-amber-500/40 px-6 py-3 rounded-lg transition-all shadow-[0_0_25px_rgba(217,70,239,0.12)] hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]"
                  >
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <div className="relative z-10 flex items-center justify-center gap-3 text-fuchsia-100 font-serif font-bold tracking-wide">
                      <Sparkles size={18} />
                      <span>Open Card Builder</span>
                    </div>
                  </button>

                  <button
                    onMouseEnter={playHover}
                    onClick={() => {
                      playSelect();
                      navigate('/card-manager');
                    }}
                    className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-amber-950 to-orange-950 hover:from-amber-900 hover:to-orange-900 border border-amber-700/50 hover:border-amber-500/40 px-6 py-3 rounded-lg transition-all shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]"
                  >
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <div className="relative z-10 flex items-center justify-center gap-3 text-amber-100 font-serif font-bold tracking-wide">
                      <Scroll size={18} />
                      <span>Open Card Manager</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- Section 3: The Chronicles (Changelog) --- */}
        <Changelog />
      </div>
    </div>
  );
}
