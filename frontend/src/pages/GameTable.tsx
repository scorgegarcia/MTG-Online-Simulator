import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import clsx from 'clsx';
import { Card } from '../components/Card';
import { HoverOverlay } from '../components/HoverOverlay';
import { MyBattlefield, OpponentBattlefield } from '../components/Battlefield';
import { ContextMenu } from '../components/ContextMenu';
import { SettingsModal } from '../components/SettingsModal';
import { GameLog } from '../components/GameLog';
import { ZONE_LABELS } from '../utils/gameUtils';
import { 
  Settings, 
  Heart, 
  Layers, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Crown,
  User,
  Swords,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

import { useGameSound } from '../hooks/useGameSound';

export default function GameTable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(id!);
  const [gameState, setGameState] = useState<any>(null);
  const { handleGameAction } = useGameSound();
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [myDecks, setMyDecks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('HAND'); // HAND, GRAVEYARD, EXILE, LIBRARY
  const [menuOpen, setMenuOpen] = useState<{id: string, x: number, y: number} | null>(null);
  
  // Load settings from localStorage or default
  const [cardScale, setCardScale] = useState(() => parseFloat(localStorage.getItem('setting_cardScale') || '1'));
  const [previewScale, setPreviewScale] = useState(() => parseFloat(localStorage.getItem('setting_previewScale') || '1'));
  const [hoverScale, setHoverScale] = useState(() => {
      const val = parseFloat(localStorage.getItem('setting_hoverScale') || '300');
      return val < 10 ? 300 : val;
  });
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('setting_uiScale') || '1'));

  const [panelHeight, setPanelHeight] = useState(() => parseFloat(localStorage.getItem('setting_panelHeight') || '280'));
  const isResizingPanel = useRef(false);

  const battlefieldsContainerRef = useRef<HTMLDivElement>(null);
  const [opponentsBattlefieldHeight, setOpponentsBattlefieldHeight] = useState(() => {
    const stored = parseFloat(localStorage.getItem('setting_opponentsBattlefieldHeight') || '');
    if (Number.isFinite(stored) && stored > 0) return stored;
    return Math.floor(window.innerHeight * 0.35);
  });
  const isResizingBattlefields = useRef(false);
  const battlefieldsResizeStartY = useRef(0);
  const battlefieldsResizeStartHeight = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingPanel.current) {
        setPanelHeight(prev => {
           const newHeight = prev - e.movementY;
           return Math.max(150, Math.min(window.innerHeight * 0.8, newHeight));
        });
      }
    };
    const handleMouseUp = () => {
        if (isResizingPanel.current) {
            isResizingPanel.current = false;
            document.body.style.cursor = 'default';
            localStorage.setItem('setting_panelHeight', panelHeight.toString());
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panelHeight]);

  useEffect(() => {
      if (!isResizingPanel.current) {
        localStorage.setItem('setting_panelHeight', panelHeight.toString());
      }
  }, [panelHeight]);

  useEffect(() => {
    const containerHeight = battlefieldsContainerRef.current?.clientHeight || 0;
    if (containerHeight <= 0) return;
    const minSectionHeight = 140;
    const dividerHeight = 8;
    const maxHeight = Math.max(minSectionHeight, containerHeight - minSectionHeight - dividerHeight);
    const next = Math.max(minSectionHeight, Math.min(maxHeight, opponentsBattlefieldHeight));
    if (next !== opponentsBattlefieldHeight) setOpponentsBattlefieldHeight(next);
  }, [opponentsBattlefieldHeight]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isResizingBattlefields.current) return;
      const containerHeight = battlefieldsContainerRef.current?.clientHeight || window.innerHeight;
      const minSectionHeight = 140;
      const dividerHeight = 8;
      const maxHeight = Math.max(minSectionHeight, containerHeight - minSectionHeight - dividerHeight);
      const next = battlefieldsResizeStartHeight.current + (e.clientY - battlefieldsResizeStartY.current);
      setOpponentsBattlefieldHeight(Math.max(minSectionHeight, Math.min(maxHeight, next)));
    };

    const handlePointerUp = () => {
      if (!isResizingBattlefields.current) return;
      isResizingBattlefields.current = false;
      document.body.style.cursor = 'default';
      localStorage.setItem('setting_opponentsBattlefieldHeight', opponentsBattlefieldHeight.toString());
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [opponentsBattlefieldHeight]);

  useEffect(() => {
    if (!isResizingBattlefields.current && opponentsBattlefieldHeight > 0) {
      localStorage.setItem('setting_opponentsBattlefieldHeight', opponentsBattlefieldHeight.toString());
    }
  }, [opponentsBattlefieldHeight]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<{obj: any, rect: DOMRect, img: string} | null>(null);
  
  const hoverBlockedRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const libraryScrollRef = useRef<HTMLDivElement>(null);

  const scrollLibrary = (direction: 'left' | 'right') => {
      if (libraryScrollRef.current) {
          const scrollAmount = 300;
          libraryScrollRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
      }
  };

  // Global drag listeners to track drag state even if components unmount (like HoverOverlay)
  useEffect(() => {
      const handleDragStart = () => { isDraggingRef.current = true; };
      const handleDragEnd = () => { isDraggingRef.current = false; };
      
      // Safety: If mouse moves without buttons, we are definitely not dragging
      const handleMouseMove = (e: MouseEvent) => {
          if (isDraggingRef.current && e.buttons === 0) {
              isDraggingRef.current = false;
          }
      };
      
      window.addEventListener('dragstart', handleDragStart);
      window.addEventListener('dragend', handleDragEnd);
      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
          window.removeEventListener('dragstart', handleDragStart);
          window.removeEventListener('dragend', handleDragEnd);
          window.removeEventListener('mousemove', handleMouseMove);
      };
  }, []);

  // Save settings when changed
  useEffect(() => { localStorage.setItem('setting_cardScale', cardScale.toString()); }, [cardScale]);
  useEffect(() => { localStorage.setItem('setting_previewScale', previewScale.toString()); }, [previewScale]);
  useEffect(() => { localStorage.setItem('setting_hoverScale', hoverScale.toString()); }, [hoverScale]);
  useEffect(() => { localStorage.setItem('setting_uiScale', uiScale.toString()); }, [uiScale]);

  // Initial Data Fetch
  const fetchGameInfo = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/games/${id}`);
          setGameInfo(res.data);
      } catch (e) {
          console.error("Failed to fetch game info", e);
      }
  };

  useEffect(() => {
    console.log('[GameTable] mount', { id });
    fetchGameInfo().then(() => console.log('[GameTable] gameInfo fetched')).catch(() => console.log('[GameTable] gameInfo fetch failed'));
    axios.get(`${API_BASE_URL}/decks`).then(res => { setMyDecks(res.data); console.log('[GameTable] decks fetched', { count: res.data.length }); });
  }, [id]);

  // Socket Listeners
  useEffect(() => {
    console.log('[GameTable] socket effect', { hasSocket: !!socket, isConnected, id });
    if (!socket) return;
    
    if (isConnected) {
        console.log('[GameTable] emit immediate game:join');
        socket.emit('game:join', { gameId: id });
    }

    socket.on('game:snapshot', (data) => {
        console.log('[GameTable] game:snapshot', { version: data?.state?.version });
        setGameState(data.state);
    });
    
    socket.on('game:updated', (data) => {
        console.log('[GameTable] game:updated', { version: data?.state?.version });
        setGameState(data.state);
        if (data.lastAction) {
            handleGameAction(data.lastAction, data.state);
        }
    });

    socket.on('lobby:updated', () => {
        console.log('Lobby updated event received');
        fetchGameInfo();
    });

    socket.on('game:started', () => {
        console.log('Game started event received');
        fetchGameInfo();
        socket.emit('game:join', { gameId: id });
    });

    socket.on('game:status', () => {
        console.log('[GameTable] game:status');
        fetchGameInfo();
    });

    socket.on('game:error', (err: any) => {
        alert(err.message || 'Error');
        if (err.state) setGameState(err.state);
    });

    return () => {
        console.log('[GameTable] socket cleanup');
        socket.off('game:snapshot');
        socket.off('game:updated');
        socket.off('lobby:updated');
        socket.off('game:started');
        socket.off('game:status');
        socket.off('game:error');
    };
  }, [socket, id, isConnected]);

  useEffect(() => {
    if (!socket) return;
    if (!isConnected) return;
    if (gameState) return;
    if (gameInfo?.status !== 'ACTIVE') return;
    console.log('[GameTable] rejoin fallback scheduled');
    const t = setTimeout(() => {
        console.log('[GameTable] emit game:rejoin');
        socket.emit('game:rejoin', { gameId: id });
    }, 1500);
    return () => clearTimeout(t);
  }, [socket, isConnected, gameState, gameInfo?.status, id]);

  const sendAction = useCallback((type: string, payload: any) => {
      if(!gameState) return;
      socket?.emit('game:action', {
          gameId: id,
          expectedVersion: gameState.version,
          action: { type, payload }
      });
      setMenuOpen(null);
  }, [gameState, id, socket]);

  // Derived state (moved up to allow safe hook usage)
  const myPlayer = gameState?.players ? Object.values(gameState.players).find((p: any) => p.userId === user?.id) : null;
  const mySeat = (myPlayer as any)?.seat;

  const commonProps = useMemo(() => ({
      mySeat,
      cardScale,
      hoverBlockedRef,
      isDraggingRef,
      setHoveredCard,
      menuOpen,
      setMenuOpen,
      sendAction
  }), [mySeat, cardScale, menuOpen, sendAction]);

  const selectDeck = async () => {
      await axios.post(`${API_BASE_URL}/games/${id}/select-deck`, { deckId: selectedDeck });
      const res = await axios.get(`${API_BASE_URL}/games/${id}`);
      setGameInfo(res.data);
  };

  const startGame = async () => {
      try {
          await axios.post(`${API_BASE_URL}/games/${id}/start`);
          const res = await axios.get(`${API_BASE_URL}/games/${id}`);
          setGameInfo(res.data);
      } catch (e: any) {
          alert(e?.response?.data?.error || 'No se pudo iniciar la partida');
      }
  };

  const leaveLobby = async () => {
      await axios.post(`${API_BASE_URL}/games/${id}/leave`);
      navigate('/');
  };

  if (!gameInfo) return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400 font-serif animate-pulse">
        <Layers className="mr-2 animate-spin" /> Summoning Battlefield...
    </div>
  );

  // LOBBY VIEW
  if (!gameState && gameInfo.status === 'LOBBY') {
      return (
          <div className="min-h-screen bg-slate-950 text-slate-200 p-4 flex flex-col items-center justify-center relative overflow-hidden font-sans">
              {/* Background Ambience */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 z-0"></div>
              
              <div className="relative z-10 w-full max-w-2xl">
                  <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
                          <Crown size={32} />
                      </div>
                      <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 tracking-wide">
                          LOBBY: {gameInfo.code}
                      </h1>
                      <p className="text-slate-500 font-serif italic">Gather your allies</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 backdrop-blur-md p-8 rounded-xl shadow-2xl relative">
                      {/* Decorative border glow */}
                      <div className="absolute inset-0 rounded-xl border border-amber-500/10 pointer-events-none"></div>

                      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                          <h2 className="text-xl font-serif font-bold text-slate-200 flex items-center gap-2">
                              <User className="text-indigo-400" /> Players
                          </h2>
                          <button onClick={leaveLobby} className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors group">
                              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Leave Hall
                          </button>
                      </div>
                      
                      <div className="space-y-3 mb-8">
                          {gameInfo.players.map((p: any) => (
                              <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                                  <div className="flex items-center gap-3">
                                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-amber-500 font-bold border border-slate-700">
                                          {p.seat}
                                      </span>
                                      <span className="font-medium text-slate-200">{p.user.username}</span>
                                  </div>
                                  <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", p.deck ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900" : "bg-amber-950/50 text-amber-500 border border-amber-900 animate-pulse")}>
                                      {p.deck ? "Ready for Battle" : "Selecting Grimoire..."}
                                  </span>
                              </div>
                          ))}
                      </div>
                      
                      <div className="bg-slate-950/30 p-4 rounded-lg border border-slate-800/50">
                          <label className="block mb-2 text-xs uppercase tracking-widest text-slate-500 font-bold">Select your deck</label>
                          <div className="flex gap-2">
                              <select 
                                className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-amber-500 transition-colors font-serif"
                                value={selectedDeck}
                                onChange={e => setSelectedDeck(e.target.value)}
                              >
                                  <option value="">-- Choose a Grimoire --</option>
                                  {myDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                              <button 
                                onClick={selectDeck} 
                                disabled={!selectedDeck} 
                                className="px-6 bg-indigo-900 hover:bg-indigo-800 border border-indigo-700 text-indigo-100 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                              >
                                  Confirm
                              </button>
                          </div>
                      </div>

                      {gameInfo.host_id === user?.id && (
                          <button 
                            onClick={startGame} 
                            className="w-full mt-6 bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-800 hover:to-teal-800 border border-emerald-700 py-4 rounded-lg font-bold text-lg text-emerald-100 shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
                          >
                              <Swords size={24} /> BEGIN THE DUEL
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  if (!gameState) return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400 font-serif animate-pulse">
        <Layers className="mr-2 animate-spin" /> Connecting to Plane...
    </div>
  );

  const getZoneObjects = (seat: number, zone: string) => {
      const ids = gameState.zoneIndex[seat]?.[zone] || [];
      return ids.map((oid: string) => gameState.objects[oid]).filter(Boolean);
  };
  
  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden font-sans selection:bg-amber-500/30">
      <SettingsModal 
          settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen}
          cardScale={cardScale} setCardScale={setCardScale}
          previewScale={previewScale} setPreviewScale={setPreviewScale}
          hoverScale={hoverScale} setHoverScale={setHoverScale}
          uiScale={uiScale} setUiScale={setUiScale}
      />
      <HoverOverlay 
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
          hoverScale={hoverScale}
          gameState={gameState}
          mySeat={mySeat}
          sendAction={sendAction}
          hoverBlockedRef={hoverBlockedRef}
          setMenuOpen={setMenuOpen}
      />
      <ContextMenu 
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          gameState={gameState}
          mySeat={mySeat}
          previewScale={previewScale}
          uiScale={uiScale}
          sendAction={sendAction}
      />
      
      {/* Top Bar (HUD) */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-1 flex justify-between items-center shadow-lg z-30 backdrop-blur-sm relative">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {Object.values(gameState.players).map((p: any) => (
                  <div 
                    key={p.seat} 
                    className={clsx(
                        "flex flex-col items-center px-1 py-1 rounded-lg border transition-all min-w-[120px]", 
                        p.seat === mySeat 
                            ? "bg-indigo-950/50 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
                            : "bg-slate-800/50 border-slate-700"
                    )}
                  >
                      <span className={clsx("font-serif font-bold text-sm tracking-wide truncate max-w-[100px]", p.seat === mySeat ? "text-indigo-200" : "text-slate-400")}>
                        {p.username}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-red-500 drop-shadow-sm">
                            <Heart size={14} fill="currentColor" /> 
                            <span className="font-bold text-lg font-mono leading-none">{p.life}</span>
                        </div>
                        {p.seat === mySeat && (
                            <div className="flex gap-0.5 ml-1">
                                <button onClick={() => sendAction('LIFE_SET', { seat: mySeat, delta: 1 })} className="text-[10px] bg-slate-700 hover:bg-emerald-700 hover:text-white w-5 h-5 rounded flex items-center justify-center transition-colors">+</button>
                                <button onClick={() => sendAction('LIFE_SET', { seat: mySeat, delta: -1 })} className="text-[10px] bg-slate-700 hover:bg-red-700 hover:text-white w-5 h-5 rounded flex items-center justify-center transition-colors">-</button>
                            </div>
                        )}
                      </div>
                  </div>
              ))}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-4 px-2">
              <span className="font-mono tracking-widest border border-slate-800 px-2 py-1 rounded bg-slate-950/50">
                  ID: {gameInfo.code}
              </span>
              <button 
                onClick={() => setSettingsOpen(true)} 
                className="text-slate-400 hover:text-amber-400 transition-colors p-1 hover:bg-slate-800 rounded-full"
                title="Settings"
              >
                  <Settings size={20} />
              </button>
          </div>
      </div>

      {/* Main Area: Battlefields */}
      <div ref={battlefieldsContainerRef} className="flex-1 overflow-hidden relative flex flex-col">
          {/* Background Texture */}
          <div className="absolute inset-0 z-0 bg-slate-950">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
          </div>

          {/* Opponents Battlefields (Top 50%) */}
          <div
            className="overflow-hidden p-0 bg-black/30 flex flex-col relative z-10"
            style={{ height: opponentsBattlefieldHeight > 0 ? `${opponentsBattlefieldHeight}px` : undefined }}
          >
             <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                <Swords size={100} />
             </div>
             <div className="flex flex-wrap gap-2 justify-center w-full h-full items-stretch">
                {Object.values(gameState.players).filter((p: any) => p.seat !== mySeat).map((p: any) => (
                    <div key={p.seat} className="flex-1 min-w-[300px] h-full rounded-lg border border-red-900/10 bg-gradient-to-b from-red-950/5 to-transparent">
                        <OpponentBattlefield player={p} gameState={gameState} {...commonProps} />
                    </div>
                ))}
             </div>
          </div>

          <div
            className="h-2 bg-gradient-to-r from-slate-900 via-amber-700/50 to-slate-900 hover:via-amber-500 cursor-row-resize transition-colors z-20 border-y border-slate-950 shadow-[0_0_10px_rgba(0,0,0,0.6)]"
            onPointerDown={(e) => {
              e.preventDefault();
              isResizingBattlefields.current = true;
              battlefieldsResizeStartY.current = e.clientY;
              const fallback = battlefieldsContainerRef.current ? Math.floor(battlefieldsContainerRef.current.clientHeight / 2) : 0;
              battlefieldsResizeStartHeight.current = opponentsBattlefieldHeight > 0 ? opponentsBattlefieldHeight : fallback;
              document.body.style.cursor = 'row-resize';
            }}
          />

          {/* My Battlefield (Bottom 50%) */}
          <div className="flex-1 overflow-auto p-0 bg-gradient-to-t from-indigo-950/10 to-transparent relative z-10">
              <div className="h-full rounded-lg border border-indigo-900/10">
                  <MyBattlefield gameState={gameState} seat={mySeat} {...commonProps} />
              </div>
          </div>
      </div>

      {/* Resizer Handle */}
      <div 
        className="h-1.5 bg-gradient-to-r from-slate-900 via-amber-700/50 to-slate-900 hover:via-amber-500 hover:h-2 cursor-row-resize transition-all z-20 shadow-[0_-1px_5px_rgba(0,0,0,0.5)] border-y border-slate-950"
        onMouseDown={(e) => {
            e.preventDefault(); 
            isResizingPanel.current = true;
            document.body.style.cursor = 'row-resize';
        }}
      />

      {/* Bottom Area: My Zones Tabs & Deck Button */}
      <div className="bg-slate-900 z-20 flex shadow-[0_-5px_15px_rgba(0,0,0,0.5)] relative" style={{ height: panelHeight }}>
          
          {/* Left Column: Zones */}
          <div className="flex-1 flex min-w-0 bg-slate-900">
            <div className="flex flex-col bg-slate-950 border-r border-slate-800 w-28 shrink-0">
                {['HAND', 'LIBRARY', 'GRAVEYARD', 'EXILE', 'COMMAND', 'SIDEBOARD'].map(zone => {
                    const isActive = activeTab === zone;
                    const count = getZoneObjects(mySeat, zone).length;
                    return (
                        <button
                            key={zone}
                            onClick={() => {
                                setActiveTab(zone);
                                if(zone === 'LIBRARY') {
                                    sendAction('PEEK_LIBRARY', {});
                                } else {
                                    sendAction('PEEK_ZONE', { zone });
                                }
                            }}
                            className={clsx(
                                "w-full px-1 py-1 text-[11px] font-bold tracking-widest border-b border-slate-800 transition-all relative overflow-hidden group",
                                isActive 
                                    ? "bg-slate-900 text-amber-500 shadow-[inset_3px_0_0_0_#f59e0b]" 
                                    : "bg-slate-950 text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                            )}
                            onDrop={(e) => {
                                e.preventDefault();
                                const cardId = e.dataTransfer.getData("text/plain");
                                if (!cardId) return;
                                const obj = gameState.objects[cardId];
                                if (obj && obj.controller_seat === mySeat && obj.zone !== zone) {
                                    sendAction('MOVE', { objectId: cardId, fromZone: obj.zone, toZone: zone, toOwner: mySeat });
                                }
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setActiveTab(zone);
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-between gap-2">
                                <span className="truncate">{ZONE_LABELS[zone]}</span>
                                <span className={clsx("px-1.5 py-0.5 rounded text-[10px] shrink-0", isActive ? "bg-amber-950/50 text-amber-400 border border-amber-900" : "bg-slate-800 text-slate-400")}>
                                    {count}
                                </span>
                            </span>
                        </button>
                    )
                })}
            </div>

            <div 
                className={clsx(
                    "flex-1 min-w-0 px-1 py-1 flex gap-1 items-stretch bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-slate-900 shadow-inner relative transition-colors",
                    activeTab === 'LIBRARY' ? "overflow-hidden" : "overflow-x-auto custom-scrollbar"
                )}
                onDrop={(e) => {
                    e.preventDefault();
                    const cardId = e.dataTransfer.getData("text/plain");
                    if (!cardId) return;
                    const obj = gameState.objects[cardId];
                    if (obj && obj.controller_seat === mySeat && obj.zone !== activeTab) {
                        sendAction('MOVE', { objectId: cardId, fromZone: obj.zone, toZone: activeTab, toOwner: mySeat });
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                }}
            >
                <div className="absolute inset-0 bg-black/20 pointer-events-none z-0"></div>

                {activeTab === 'HAND' && getZoneObjects(mySeat, 'HAND').map((obj: any) => (
                    <div key={obj.id} className="relative z-10 h-full flex items-stretch">
                        <Card obj={obj} size="normal" inHand={true} fitHeight={true} {...commonProps} />
                    </div>
                ))}

                {activeTab === 'LIBRARY' && (
                    <div className="flex-1 min-w-0 w-full h-full relative group z-10">
                        <button 
                            data-scroll-button="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onClick={(e) => { e.stopPropagation(); scrollLibrary('left'); }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div ref={libraryScrollRef} className="flex gap-2 overflow-x-auto py-0 scroll-smooth no-scrollbar px-12 w-full h-full items-stretch">
                            {getZoneObjects(mySeat, 'LIBRARY').map((obj: any, i: number) => (
                                <div key={obj.id} className="relative group min-w-max h-full flex items-stretch transform hover:-translate-y-2 transition-transform duration-200">
                                    <Card obj={obj} size="small" fitHeight={true} {...commonProps} />
                                    <div className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 shadow-sm z-20">{i+1}</div>
                                </div>
                            ))}
                            {getZoneObjects(mySeat, 'LIBRARY').length === 0 && (
                                <div className="text-slate-500 italic p-4 w-full text-center border-2 border-dashed border-slate-800 rounded-lg">
                                    Grimoire is empty
                                </div>
                            )}
                        </div>
                        <button 
                            data-scroll-button="true"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-slate-900/80 hover:bg-amber-600/80 text-white p-2 rounded-full shadow-lg border border-slate-700 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm transform hover:scale-110"
                            onClick={(e) => { e.stopPropagation(); scrollLibrary('right'); }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {(activeTab === 'GRAVEYARD' || activeTab === 'EXILE' || activeTab === 'COMMAND' || activeTab === 'SIDEBOARD') && getZoneObjects(mySeat, activeTab).map((obj: any) => (
                    <div key={obj.id} className="relative z-10 opacity-90 hover:opacity-100 transition-opacity h-full flex items-stretch">
                        <Card obj={obj} size="small" fitHeight={true} {...commonProps} />
                    </div>
                ))}
            </div>
          </div>

          {/* Right Column: Deck Draw */}
          <div className="w-36 bg-slate-950 border-l border-amber-500/20 flex flex-col items-center justify-center p-3 relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20"></div>
                <div 
                     className="w-24 h-36 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl relative bg-slate-900 border-2 border-slate-700 group ring-4 ring-transparent hover:ring-amber-500/20 z-10"
                     onClick={() => sendAction('DRAW', { seat: mySeat, n: 1 })}
                >
                     {(gameState.zoneIndex[mySeat]?.['LIBRARY']?.length || 0) > 0 ? (
                         <>
                             <img 
                                 src="https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg" 
                                 className="w-full h-full object-cover rounded-md opacity-90 group-hover:opacity-100 transition-opacity"
                                 alt="Library"
                             />
                             {/* Deck Thickness effect */}
                             <div className="absolute top-0.5 left-0.5 w-full h-full border-r-2 border-b-2 border-black/50 rounded-md pointer-events-none"></div>
                         </>
                     ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 border-2 border-dashed border-slate-800 rounded-md">
                             <Layers size={24} />
                             <span className="text-[10px] font-bold uppercase">Empty</span>
                         </div>
                     )}
                     
                     <div className="absolute -bottom-3 -right-3 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 border-slate-900 shadow-lg z-20 group-hover:scale-110 transition-transform">
                         {gameState.zoneIndex[mySeat]?.['LIBRARY']?.length || 0}
                     </div>
                </div>
                <div className="text-[10px] text-amber-500/60 font-bold mt-4 uppercase tracking-[0.2em] relative z-10">DRAW CARD</div>
          </div>
      </div>
      <GameLog gameState={gameState} />
    </div>
  );
}
