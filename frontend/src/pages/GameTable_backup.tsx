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

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function GameTable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(id!);
  const [gameState, setGameState] = useState<any>(null);
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

  if (!gameInfo) return <div className="p-4 text-white">Loading game info...</div>;

  // LOBBY VIEW
  if (!gameState && gameInfo.status === 'LOBBY') {
      return (
          <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
              <h1 className="text-3xl font-bold mb-4">Lobby: {gameInfo.code}</h1>
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl">Players</h2>
                      <button onClick={leaveLobby} className="text-red-400 text-sm hover:underline">Leave Lobby</button>
                  </div>
                  {gameInfo.players.map((p: any) => (
                      <div key={p.id} className="flex justify-between py-2 border-b border-gray-700">
                          <span>{p.seat}. {p.user.username}</span>
                          <span className={p.deck ? "text-green-400" : "text-yellow-400"}>
                              {p.deck ? "Ready" : "Selecting Deck..."}
                          </span>
                      </div>
                  ))}
                  
                  <div className="mt-6">
                      <label className="block mb-2">Select your deck:</label>
                      <select 
                        className="w-full p-2 bg-gray-700 rounded mb-2"
                        value={selectedDeck}
                        onChange={e => setSelectedDeck(e.target.value)}
                      >
                          <option value="">-- Choose Deck --</option>
                          {myDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <button onClick={selectDeck} disabled={!selectedDeck} className="w-full bg-blue-600 py-2 rounded disabled:opacity-50">
                          Confirm Deck
                      </button>
                  </div>

                  {gameInfo.host_id === user?.id && (
                      <button onClick={startGame} className="w-full mt-4 bg-green-600 py-3 rounded font-bold text-lg">
                          START GAME
                      </button>
                  )}
              </div>
          </div>
      );
  }

  if (!gameState) return <div className="text-white p-4">Connecting to game...</div>;

  const getZoneObjects = (seat: number, zone: string) => {
      const ids = gameState.zoneIndex[seat]?.[zone] || [];
      return ids.map((oid: string) => gameState.objects[oid]).filter(Boolean);
  };
  
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
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
      <GameLog gameState={gameState} />
      
      {/* Top Bar */}
      <div className="bg-gray-800 p-2 flex justify-between items-center shadow-md z-10">
          <div className="flex gap-4">
              {Object.values(gameState.players).map((p: any) => (
                  <div key={p.seat} className={clsx("flex flex-col items-center px-3 py-1 rounded", p.seat === mySeat ? "bg-blue-900" : "bg-gray-700")}>
                      <span className="font-bold text-sm">{p.username}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-bold">♥ {p.life}</span>
                        {p.seat === mySeat && (
                            <div className="flex gap-1">
                                <button onClick={() => sendAction('LIFE_SET', { seat: mySeat, delta: 1 })} className="text-xs bg-gray-600 px-1">+</button>
                                <button onClick={() => sendAction('LIFE_SET', { seat: mySeat, delta: -1 })} className="text-xs bg-gray-600 px-1">-</button>
                            </div>
                        )}
                      </div>
                  </div>
              ))}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-4">
              <button onClick={() => setSettingsOpen(true)} className="hover:text-white transition-colors text-4xl">
                  ⚙️
              </button>
              <span>Game: {gameInfo.code}</span>
          </div>
      </div>

      {/* Main Area: Battlefields */}
      <div className="flex-1 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] flex flex-col">
          {/* Opponents Battlefields (Top 50%) */}
          <div className="h-1/2 overflow-hidden p-1 border-b border-gray-700 bg-black/20 flex flex-col">
             <div className="flex flex-wrap gap-1 justify-center w-full h-full items-stretch">
                {Object.values(gameState.players).filter((p: any) => p.seat !== mySeat).map((p: any) => (
                    <div key={p.seat} className="flex-1 min-w-[300px] h-full">
                        <OpponentBattlefield player={p} gameState={gameState} {...commonProps} />
                    </div>
                ))}
             </div>
          </div>

          {/* My Battlefield (Bottom 50%) */}
          <div className="h-1/2 overflow-auto p-1 bg-blue-900/5">
              <MyBattlefield gameState={gameState} seat={mySeat} {...commonProps} />
          </div>
      </div>

      {/* Bottom Area: My Zones Tabs & Deck Button */}
      <div 
        className="h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition-colors z-20"
        onMouseDown={(e) => {
            e.preventDefault(); 
            isResizingPanel.current = true;
            document.body.style.cursor = 'row-resize';
        }}
      />
      <div className="bg-gray-800 z-20 flex" style={{ height: panelHeight }}>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex">
                {['HAND', 'LIBRARY', 'GRAVEYARD', 'EXILE'].map(zone => (
                    <button 
                        key={zone}
                        onClick={() => {
                            setActiveTab(zone);
                            if(zone === 'LIBRARY') sendAction('PEEK_LIBRARY', {});
                        }}
                        className={clsx("flex-1 py-2 text-sm font-bold", activeTab === zone ? "bg-gray-700 text-white border-t-2 border-blue-500" : "text-gray-400 hover:bg-gray-700")}
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
                        {ZONE_LABELS[zone]} ({getZoneObjects(mySeat, zone).length})
                    </button>
                ))}
            </div>
            
            <div 
                className={clsx(
                    "flex-1 p-4 flex gap-2 items-center bg-gray-900 transition-colors",
                    activeTab === 'LIBRARY' ? "overflow-hidden" : "overflow-x-auto"
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
                {activeTab === 'HAND' && getZoneObjects(mySeat, 'HAND').map((obj: any) => (
                    <Card key={obj.id} obj={obj} size="normal" inHand={true} {...commonProps} />
                ))}
                {activeTab === 'LIBRARY' && (
                    <div className="flex-1 min-w-0 w-full h-full relative group">
                        <button 
                            data-scroll-button="true"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-r transition-colors"
                            onClick={(e) => { e.stopPropagation(); scrollLibrary('left'); }}
                        >
                            ◀
                        </button>
                        <div ref={libraryScrollRef} className="flex gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar px-8 w-full h-full items-center">
                            {getZoneObjects(mySeat, 'LIBRARY').map((obj: any, i: number) => (
                                <div key={obj.id} className="relative group min-w-max">
                                    <Card obj={obj} size="small" {...commonProps} />
                                    <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1 rounded-br">{i+1}</div>
                                </div>
                            ))}
                            {getZoneObjects(mySeat, 'LIBRARY').length === 0 && <div className="text-gray-500 italic p-4">Biblioteca vacía</div>}
                        </div>
                        <button 
                            data-scroll-button="true"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-l transition-colors"
                            onClick={(e) => { e.stopPropagation(); scrollLibrary('right'); }}
                        >
                            ▶
                        </button>
                    </div>
                )}
                {activeTab === 'GRAVEYARD' && getZoneObjects(mySeat, 'GRAVEYARD').map((obj: any) => (
                    <Card key={obj.id} obj={obj} size="small" {...commonProps} />
                ))}
                {activeTab === 'EXILE' && getZoneObjects(mySeat, 'EXILE').map((obj: any) => (
                    <Card key={obj.id} obj={obj} size="small" {...commonProps} />
                ))}
            </div>
          </div>

          <div className="w-30 bg-gray-900 border-l border-gray-700 flex flex-col items-center justify-center p-2">
                <div 
                     className="w-20 h-28 rounded cursor-pointer hover:scale-105 transition-transform shadow-lg relative bg-gray-800 border border-gray-700"
                     onClick={() => sendAction('DRAW', { seat: mySeat, n: 1 })}
                 >
                     {(gameState.zoneIndex[mySeat]?.['LIBRARY']?.length || 0) > 0 ? (
                         <img 
                             src="https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg" 
                             className="w-full h-full object-cover rounded"
                             alt="Library"
                         />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Empty</div>
                     )}
                     <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border border-white">
                         {gameState.zoneIndex[mySeat]?.['LIBRARY']?.length || 0}
                     </div>
                 </div>
                 <div className="text-xs text-gray-400 font-bold mt-1">DECK</div>
          </div>
      </div>
    </div>
  );
}
