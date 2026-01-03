import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import clsx from 'clsx';
import { HoverOverlay } from '../components/HoverOverlay';
import { MyBattlefield, OpponentBattlefield } from '../components/Battlefield';
import { LeftSideToolbar } from '../components/battlefield/LeftSideToolbar';
import { RightSideToolbar } from '../components/battlefield/RightSideToolbar';
import { PlayerPanel } from '../components/PlayerPanel';
import { CommanderDamageModal } from '../components/CommanderDamageModal';
import { CreateTokenModal } from '../components/CreateTokenModal';
import { TradeTray } from '../components/TradeTray';
import { RevealTray } from '../components/RevealTray';
import { LibraryRevealTray } from '../components/LibraryRevealTray';
import { LibraryRevealModal } from '../components/LibraryRevealModal';
import { LibraryViewModal } from '../components/LibraryViewModal';
import { ContextMenu } from '../components/ContextMenu';
import { SettingsModal } from '../components/SettingsModal';
import { LifeTotalModal } from '../components/LifeTotalModal';
import { GameLog } from '../components/GameLog';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { MulliganModal } from '../components/MulliganModal';
import { DiceRollModal } from '../components/DiceRollModal';
import uiHoverSfx from '../assets/sfx/ui_hover.mp3';
import readyButtonSfx from '../assets/sfx/ready_button.mp3';
import startGameSfx from '../assets/sfx/start_game.mp3';
import { 
  Settings, 
  Heart, 
  Layers, 
  LogOut, 
  Crown,
  User,
  Swords,
  Eye,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

import { useGameSound } from '../hooks/useGameSound';

import { MagicArrows } from '../components/battlefield/MagicArrows';

import { UserProfileModal } from '../components/UserProfileModal';

export default function GameTable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(id!);
  const [gameState, setGameState] = useState<any>(null);
  const { handleGameAction, playUiSound } = useGameSound();
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const lobbyHoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const lobbyReadyAudioRef = useRef<HTMLAudioElement | null>(null);
  const lobbyStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [isDeckConfirmed, setIsDeckConfirmed] = useState(false);
  const [myDecks, setMyDecks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('HAND'); // HAND, GRAVEYARD, EXILE, LIBRARY
  const [menuOpen, setMenuOpen] = useState<{id: string, x: number, y: number} | null>(null);
  const [equipSelection, setEquipSelection] = useState<{ equipmentId: string } | null>(null);
  const [enchantSelection, setEnchantSelection] = useState<{ enchantmentId: string } | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [openingHandKeptLocal, setOpeningHandKeptLocal] = useState(false);
  const [thinkingSeats, setThinkingSeats] = useState<number[]>([]);
  const [initialLife, setInitialLife] = useState(40);
  const [showDamageVignette, setShowDamageVignette] = useState(false);
  const [passingSeats, setPassingSeats] = useState<number[]>([]);
  const bgmIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [bgmMuted, setBgmMuted] = useState(() => localStorage.getItem('setting_bgmMuted') === 'true');
  const [bgmVolume, setBgmVolume] = useState(() => {
    const saved = localStorage.getItem('setting_bgmVolume');
    return saved ? parseFloat(saved) : 10;
  });

  // Arrow tool state
  const [isArrowMode, setIsArrowMode] = useState(false);
  const [arrowSourceId, setArrowSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const prevArrowModeRef = useRef(isArrowMode);

  const sendAction = useCallback((type: string, payload: any, options?: { closeMenu?: boolean }) => {
      if(!gameState) return;
      socket?.emit('game:action', {
          gameId: id,
          expectedVersion: gameState.version,
          action: { type, payload }
      });
      if (options?.closeMenu !== false) setMenuOpen(null);
  }, [gameState, id, socket]);

  useEffect(() => {
    localStorage.setItem('setting_bgmMuted', bgmMuted.toString());
  }, [bgmMuted]);

  useEffect(() => {
    localStorage.setItem('setting_bgmVolume', bgmVolume.toString());
  }, [bgmVolume]);

  // Mapping functions for precise low volume control
  // 0-60 on slider -> 0-10 volume
  // 60-100 on slider -> 10-100 volume
  const sliderToVolume = useCallback((sliderVal: number) => {
    if (sliderVal <= 60) return (sliderVal / 60) * 10;
    return 10 + ((sliderVal - 60) / 40) * 90;
  }, []);

  const volumeToSlider = useCallback((vol: number) => {
    if (vol <= 10) return (vol / 10) * 60;
    return 60 + ((vol - 10) / 90) * 40;
  }, []);
  const bgmVideoId = 'B6Zsr7m1GFI';
  const bgmEmbedSrc = `https://www.youtube.com/embed/${bgmVideoId}?autoplay=1&controls=0&disablekb=1&fs=0&loop=1&playlist=${bgmVideoId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&mute=0`;
  
  // Toolbar states
  const [commanderModalOpen, setCommanderModalOpen] = useState(false);
  const [diceRollModalOpen, setDiceRollModalOpen] = useState(false);
  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [libraryRevealModalOpen, setLibraryRevealModalOpen] = useState(false);
  const [viewLibraryModalOpen, setViewLibraryModalOpen] = useState(false);
  const [lifeModalOpen, setLifeModalOpen] = useState(false);
  const [lifeModalTarget, setLifeModalTarget] = useState<any>(null);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [userProfileModalPlayer, setUserProfileModalPlayer] = useState<any>(null);
  const [isThinkingCooldown, setIsThinkingCooldown] = useState(false);
  const [isPassCooldown, setIsPassCooldown] = useState(false);
  const [showCommanderDamage, setShowCommanderDamage] = useState(false);

  // Arrow tool effects
  useEffect(() => {
    if (prevArrowModeRef.current !== isArrowMode) {
      playUiSound(isArrowMode ? 'ARROW_ON' : 'ARROW_OFF');
      prevArrowModeRef.current = isArrowMode;
    }
    if (!isArrowMode) {
      setArrowSourceId(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalClick = (e: MouseEvent) => {
      if (!isArrowMode) return;

      const target = e.target as HTMLElement;
      const cardEl = target.closest('[data-card-id]');
      
      if (cardEl) {
        const cardId = cardEl.getAttribute('data-card-id');
        if (!cardId) return;

        // Cerrar cualquier hover activo al hacer clic en modo flecha
        setHoveredCard(null);
        // Bloquear que se vuelva a abrir el hover de esta carta hasta que el mouse salga de ella
        hoverBlockedRef.current = cardId;

        e.preventDefault();
        e.stopPropagation();

        if (!arrowSourceId) {
          // First card selected
          setArrowSourceId(cardId);
          playUiSound('SELECT');
        } else {
          // Second card selected
          if (cardId !== arrowSourceId) {
            sendAction('CREATE_ARROW', { 
              fromId: arrowSourceId, 
              toId: cardId, 
              creatorSeat: mySeatRef.current 
            });
            playUiSound('SELECT');
          }
          setArrowSourceId(null);
        }
      } else {
        // Clicked outside a card
        if (arrowSourceId) {
          setArrowSourceId(null);
        }
      }
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      if (isArrowMode) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleGlobalClick, true); // Capture phase to intercept card clicks
    window.addEventListener('contextmenu', handleGlobalContextMenu, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('contextmenu', handleGlobalContextMenu, true);
    };
  }, [isArrowMode, arrowSourceId, sendAction, playUiSound]);

  // Cooldown timer
  useEffect(() => {
      if (isThinkingCooldown) {
          const timer = setTimeout(() => setIsThinkingCooldown(false), 1000);
          return () => clearTimeout(timer);
      }
  }, [isThinkingCooldown]);

  useEffect(() => {
      if (isPassCooldown) {
          const timer = setTimeout(() => setIsPassCooldown(false), 1000);
          return () => clearTimeout(timer);
      }
  }, [isPassCooldown]);

  useEffect(() => {
      if (!equipSelection && !enchantSelection) return;
      const onKeyDown = (e: KeyboardEvent) => {
          if (e.key !== 'Escape') return;
          setEquipSelection(null);
          setEnchantSelection(null);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
  }, [equipSelection, enchantSelection]);

  // Derived state (moved up to allow safe hook usage)
  const myPlayer = gameState?.players ? Object.values(gameState.players).find((p: any) => p.userId === user?.id) : null;
  const mySeat = (myPlayer as any)?.seat;
  const mySeatRef = useRef(mySeat);
  const openingHandKeptServer = mySeat !== undefined ? ((gameState?.players?.[mySeat] as any)?.openingHandKept ?? true) : true;
  const showMulliganModal = mySeat !== undefined && gameState && openingHandKeptServer === false && openingHandKeptLocal === false;

  useEffect(() => {
      mySeatRef.current = mySeat;
  }, [mySeat]);

  useEffect(() => {
      setOpeningHandKeptLocal(false);
  }, [id]);

  useEffect(() => {
      if (openingHandKeptServer === false) {
          setOpeningHandKeptLocal(false);
      }
  }, [openingHandKeptServer]);

  const setBgmYoutubeMuted = useCallback((muted: boolean) => {
    const iframe = bgmIframeRef.current;
    if (!iframe?.contentWindow) return;
    const func = muted ? 'mute' : 'unMute';
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  }, []);

  const setBgmYoutubeVolume = useCallback((volume: number) => {
    const iframe = bgmIframeRef.current;
    if (!iframe?.contentWindow) return;
    const vol = Math.max(0, Math.min(100, Math.round(volume)));
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }), '*');
  }, []);

  const toggleBgmMuted = useCallback(() => {
    setBgmMuted(prev => {
      const next = !prev;
      setBgmYoutubeMuted(next);
      return next;
    });
  }, [setBgmYoutubeMuted]);

  useEffect(() => {
    const hoverAudio = new Audio(uiHoverSfx);
    hoverAudio.volume = 0.35;
    lobbyHoverAudioRef.current = hoverAudio;

    const readyAudio = new Audio(readyButtonSfx);
    readyAudio.volume = 0.55;
    lobbyReadyAudioRef.current = readyAudio;

    const startAudio = new Audio(startGameSfx);
    startAudio.volume = 0.55;
    lobbyStartAudioRef.current = startAudio;

    return () => {
      lobbyHoverAudioRef.current = null;
      lobbyReadyAudioRef.current = null;
      lobbyStartAudioRef.current = null;
    };
  }, []);

  const playLobbyHover = useCallback(() => {
    const audio = lobbyHoverAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const playLobbyReady = useCallback(() => {
    const audio = lobbyReadyAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const playLobbyStart = useCallback(() => {
    const audio = lobbyStartAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const handleRestart = async () => {
      try {
          await axios.post(`${API_BASE_URL}/games/${id}/restart`);
      } catch (e: any) {
          alert(e?.response?.data?.error || 'Failed to restart');
      }
  };
  
  // Load settings from localStorage or default
  const [cardScale] = useState(() => parseFloat(localStorage.getItem('setting_cardScale') || '1'));
  const [previewScale, setPreviewScale] = useState(() => {
      const stored = parseFloat(localStorage.getItem('setting_previewScale') || '');
      const val = Number.isFinite(stored) ? stored : 3;
      return Math.min(3, Math.max(0.5, val));
  });
  const [hoverScale, setHoverScale] = useState(() => {
      const val = parseFloat(localStorage.getItem('setting_hoverScale') || '300');
      return val < 10 ? 300 : val;
  });
  const [uiScale, setUiScale] = useState(() => parseFloat(localStorage.getItem('setting_uiScale') || '1'));
  const [showOriginalPlaymats, setShowOriginalPlaymats] = useState(() => localStorage.getItem('setting_showOriginalPlaymats') === 'true');

  useEffect(() => {
    localStorage.setItem('setting_showOriginalPlaymats', showOriginalPlaymats.toString());
  }, [showOriginalPlaymats]);

  // Hotkeys state
  const [hotkeys, setHotkeys] = useState(() => {
    const defaultHotkeys = {
      draw: 'd',
      viewLibrary: 'l',
      untapAll: 'u',
      createToken: 't',
      tapUntap: ' ',
      arrowToggle: 'a',
      thinking: '.',
      passTurn: 'p'
    };

    const saved = localStorage.getItem('setting_hotkeys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultHotkeys, ...parsed };
      } catch (e) {
        console.error('Failed to parse hotkeys', e);
      }
    }
    return defaultHotkeys;
  });

  useEffect(() => {
    localStorage.setItem('setting_hotkeys', JSON.stringify(hotkeys));
  }, [hotkeys]);

  const [panelHeight, setPanelHeight] = useState(() => parseFloat(localStorage.getItem('setting_panelHeight') || '280'));
  const isResizingPanel = useRef(false);
  const panelResizeStartY = useRef(0);
  const panelResizeStartHeight = useRef(0);

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
    const handlePointerMove = (e: PointerEvent) => {
      if (isResizingPanel.current) {
        const deltaY = e.clientY - panelResizeStartY.current;
        const newHeight = panelResizeStartHeight.current - deltaY;
        const boundedHeight = Math.max(150, Math.min(window.innerHeight * 0.8, newHeight));
        setPanelHeight(boundedHeight);
      }
    };
    const handlePointerUp = () => {
        if (isResizingPanel.current) {
            isResizingPanel.current = false;
            document.body.style.cursor = 'default';
        }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

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
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (!isResizingBattlefields.current && opponentsBattlefieldHeight > 0) {
      localStorage.setItem('setting_opponentsBattlefieldHeight', opponentsBattlefieldHeight.toString());
    }
  }, [opponentsBattlefieldHeight]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<{obj: any, rect: DOMRect, img: string, isPlayerPanel?: boolean} | null>(null);
  
  const hoverBlockedRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const isCardDraggingRef = useRef(false);
  const dragSoundPlayedRef = useRef(false);
  const dropSoundPlayedRef = useRef(false);

  // Global drag listeners to track drag state even if components unmount (like HoverOverlay)
  useEffect(() => {
      const isCardDragEvent = (e: DragEvent) => {
          const target = e.target as HTMLElement | null;
          if (!target || typeof (target as any).closest !== 'function') return false;
          return !!target.closest('[data-card-id]');
      };

      const startCardDrag = () => {
          isCardDraggingRef.current = true;
          dropSoundPlayedRef.current = false;
          if (dragSoundPlayedRef.current) return;
          dragSoundPlayedRef.current = true;
          playUiSound('DRAG_CARD');
      };

      const handleDragStart = (e: DragEvent) => {
          isDraggingRef.current = true;
          if (!isCardDragEvent(e)) return;
          dragSoundPlayedRef.current = false;
          dropSoundPlayedRef.current = false;
          startCardDrag();
      };

      const handleDragEnd = (_e: DragEvent) => {
          isDraggingRef.current = false;
          if (!isCardDraggingRef.current) return;
          isCardDraggingRef.current = false;
          dragSoundPlayedRef.current = false;
          if (dropSoundPlayedRef.current) return;
          dropSoundPlayedRef.current = true;
          playUiSound('DROP_CARD');
      };
      
      // Safety: If mouse moves without buttons, we are definitely not dragging
      const handleMouseMove = (e: MouseEvent) => {
          if (isDraggingRef.current && e.buttons === 0) {
              isDraggingRef.current = false;
              if (isCardDraggingRef.current) {
                  isCardDraggingRef.current = false;
                  dragSoundPlayedRef.current = false;
                  if (!dropSoundPlayedRef.current) {
                      dropSoundPlayedRef.current = true;
                      playUiSound('DROP_CARD');
                  }
              }
          }
      };

      const handleDrop = (_e: DragEvent) => {
          if (!isCardDraggingRef.current) return;
          isCardDraggingRef.current = false;
          dragSoundPlayedRef.current = false;
          if (dropSoundPlayedRef.current) return;
          dropSoundPlayedRef.current = true;
          playUiSound('DROP_CARD');
      };
      
      document.addEventListener('dragstart', handleDragStart, true);
      document.addEventListener('dragend', handleDragEnd, true);
      document.addEventListener('drop', handleDrop, true);
      document.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('ui:card-drag-start', startCardDrag as EventListener);
      window.addEventListener('ui:card-drag-end', handleDragEnd as EventListener);
      
      return () => {
          document.removeEventListener('dragstart', handleDragStart, true);
          document.removeEventListener('dragend', handleDragEnd, true);
          document.removeEventListener('drop', handleDrop, true);
          document.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('ui:card-drag-start', startCardDrag as EventListener);
          window.removeEventListener('ui:card-drag-end', handleDragEnd as EventListener);
      };
  }, [playUiSound]);

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
          
          // Sync confirmed state from server data
          if (user?.id && res.data.players) {
              const me = res.data.players.find((p: any) => p.user_id === user.id);
              if (me?.deck_id) {
                  setSelectedDeck(me.deck_id);
                  setIsDeckConfirmed(true);
              } else {
                  setIsDeckConfirmed(false);
              }
          }
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
        
        const currentSeat = mySeatRef.current;
        if (data.lastAction) {
            handleGameAction(data.lastAction, data.state, currentSeat);
            
            // Visual Damage Effect
            const { type, payload } = data.lastAction;
            if (currentSeat !== undefined) {
                 if ((type === 'LIFE_SET' && payload.seat === currentSeat && payload.delta < 0) ||
                     (type === 'COMMANDER_DAMAGE' && payload.seat === currentSeat && payload.delta > 0)) {
                     setShowDamageVignette(true);
                     setTimeout(() => setShowDamageVignette(false), 500);
                 }
            }

            if (data.lastAction.type === 'THINKING') {
                const seat = data.lastAction.payload.seat;
                setThinkingSeats(prev => [...prev, seat]);
                setTimeout(() => {
                    setThinkingSeats(prev => prev.filter(s => s !== seat));
                }, 1000);
            }

            if (data.lastAction.type === 'PASS_TURN') {
                const seat = data.lastAction.payload.seat;
                setPassingSeats(prev => [...prev, seat]);
                setTimeout(() => {
                    setPassingSeats(prev => prev.filter(s => s !== seat));
                }, 2000); // 1.5s animation + 0.5s fade-out
            }
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
        if (err?.code === 'OUT_OF_SYNC') {
            if (err.state) setGameState(err.state);
            return;
        }
        alert(err?.message || 'Error');
        if (err?.state) setGameState(err.state);
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

  // Keyboard events for hotkeys
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      if (key === hotkeys.draw) {
        e.preventDefault();
        sendAction('DRAW', { seat: mySeatRef.current, n: 1 });
      } else if (key === hotkeys.viewLibrary) {
        e.preventDefault();
        setViewLibraryModalOpen(true);
      } else if (key === hotkeys.untapAll) {
        e.preventDefault();
        sendAction('UNTAP_ALL', { seat: mySeatRef.current });
      } else if (key === hotkeys.createToken) {
        e.preventDefault();
        setCreateTokenModalOpen(true);
      } else if (key === hotkeys.arrowToggle) {
        e.preventDefault();
        setIsArrowMode(prev => {
          const next = !prev;
          if (!next) {
            sendAction('CLEAR_ARROWS', { creatorSeat: mySeatRef.current });
          }
          return next;
        });
      } else if (key === hotkeys.passTurn) {
        e.preventDefault();
        if (isPassCooldown) return;
        setIsPassCooldown(true);
        sendAction('PASS_TURN', { seat: mySeatRef.current });
      } else if (key === hotkeys.thinking) {
        e.preventDefault();
        if (isThinkingCooldown) return;
        setIsThinkingCooldown(true);
        sendAction('THINKING', { seat: mySeatRef.current });
      } else if (key === hotkeys.tapUntap) {
        e.preventDefault();
        if (hoveredCard?.obj && hoveredCard.obj.controller_seat === mySeatRef.current) {
          const objectId = hoveredCard.obj.id;
          const currentZone = hoveredCard.obj.zone;
          
          // Verificar si está en el campo de batalla
          const isOnBattlefield = gameState?.zoneIndex?.[mySeatRef.current]?.['BATTLEFIELD']?.includes(objectId);
          
          if (isOnBattlefield) {
            sendAction('TAP', { objectId });
          } else {
            // Verificar si el hover proviene del PlayerPanel
            if (hoveredCard.isPlayerPanel) {
              const playerPanelZones = ['HAND', 'LIBRARY', 'GRAVEYARD', 'EXILE', 'COMMAND', 'SIDEBOARD'];
              if (playerPanelZones.includes(currentZone)) {
                sendAction('MOVE', { 
                  objectId, 
                  fromZone: currentZone, 
                  toZone: 'BATTLEFIELD', 
                  toOwner: mySeatRef.current 
                });
                setHoveredCard(null); // Cerrar el hover al mover
              }
            }
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkeys, isPassCooldown, isThinkingCooldown, sendAction, setViewLibraryModalOpen, setCreateTokenModalOpen, hoveredCard, gameState, panelHeight, setHoveredCard]);

  const startEquipSelection = useCallback((equipmentId: string) => {
      setEquipSelection({ equipmentId });
      setEnchantSelection(null);
      setMenuOpen(null);
      setHoveredCard(null);
  }, []);

  const startEnchantSelection = useCallback((enchantmentId: string) => {
      setEnchantSelection({ enchantmentId });
      setEquipSelection(null);
      setMenuOpen(null);
      setHoveredCard(null);
  }, []);

  const activeTrade = gameState?.trade;
  const amITrading = activeTrade && (activeTrade.initiatorSeat === mySeat || activeTrade.targetSeat === mySeat);

  const activeReveal = gameState?.reveal;
  const amIRevealing = activeReveal && (
      activeReveal.sourceSeat === mySeat || 
      activeReveal.targetSeat === mySeat || 
      activeReveal.targetSeat === 'ALL' ||
      (Array.isArray(activeReveal.targetSeat) && activeReveal.targetSeat.includes(mySeat))
  );

  const opponents = gameState?.players ? Object.values(gameState.players).filter((p: any) => p.seat !== mySeat) : [];

  const commonProps = useMemo(() => ({
      mySeat,
      cardScale,
      hoverBlockedRef,
      isDraggingRef,
      setHoveredCard,
      menuOpen,
      setMenuOpen,
      sendAction,
      equipSelection,
      setEquipSelection,
      enchantSelection,
      setEnchantSelection,
      thinkingSeats,
      passingSeats,
      showCommanderDamage,
      showOriginalPlaymats
  }), [mySeat, cardScale, menuOpen, sendAction, thinkingSeats, passingSeats, equipSelection, enchantSelection, showCommanderDamage, showOriginalPlaymats]);

  const selectDeck = async () => {
      await axios.post(`${API_BASE_URL}/games/${id}/select-deck`, { deckId: selectedDeck });
      setIsDeckConfirmed(true);
      const res = await axios.get(`${API_BASE_URL}/games/${id}`);
      setGameInfo(res.data);
  };

  const unselectDeck = async () => {
    await axios.post(`${API_BASE_URL}/games/${id}/select-deck`, { deckId: null });
    setIsDeckConfirmed(false);
    const res = await axios.get(`${API_BASE_URL}/games/${id}`);
    setGameInfo(res.data);
  };

  const startGame = async () => {
      try {
          await axios.post(`${API_BASE_URL}/games/${id}/start`, { initialLife });
          const res = await axios.get(`${API_BASE_URL}/games/${id}`);
          setGameInfo(res.data);
      } catch (e: any) {
          alert(e?.response?.data?.error || 'No se pudo iniciar la partida');
      }
  };

  const canStartDuel = useCallback(() => {
    if (!gameInfo || !gameInfo.players) return false;
    // Todos los jugadores deben tener un deck seleccionado
    return gameInfo.players.every((p: any) => !!p.deck);
  }, [gameInfo]);

  const leaveLobby = async () => {
      await axios.post(`${API_BASE_URL}/games/${id}/leave`);
      navigate('/');
  };

  if (!gameInfo) return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400 font-serif animate-pulse select-none">
        <Layers className="mr-2 animate-spin" /> Summoning Battlefield...
    </div>
  );

  // LOBBY VIEW
  if (!gameState && gameInfo.status === 'LOBBY') {
      return (
          <div className="min-h-screen bg-slate-950 text-slate-200 p-4 flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
              {/* Background Ambience */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 z-0"></div>
              
              <div className="relative z-10 w-full max-w-2xl">
                  <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
                          <Crown size={32} />
                      </div>
                      <div className="flex items-center justify-center gap-4">
                          <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 tracking-wide">
                              LOBBY: {gameInfo.code}
                          </h1>
                          <button
                            onClick={() => {
                                navigator.clipboard.writeText(gameInfo.code);
                                setCopied(true);
                                playLobbyHover();
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            onMouseEnter={playLobbyHover}
                            className={clsx(
                                "p-2 rounded-lg border transition-all duration-300 flex items-center gap-2",
                                copied 
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                                    : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-500"
                            )}
                            title="Copy Lobby Code"
                          >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied && <span className="text-xs font-bold uppercase tracking-tighter">Copied</span>}
                          </button>
                      </div>
                      <p className="text-slate-500 font-serif italic">Gather your allies</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 backdrop-blur-md p-8 rounded-xl shadow-2xl relative">
                      {/* Decorative border glow */}
                      <div className="absolute inset-0 rounded-xl border border-amber-500/10 pointer-events-none"></div>

                      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                          <h2 className="text-xl font-serif font-bold text-slate-200 flex items-center gap-2">
                              <User className="text-indigo-400" /> Players
                          </h2>
                          <button
                            onMouseEnter={playLobbyHover}
                            onClick={leaveLobby}
                            className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors group"
                          >
                              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Leave Hall
                          </button>
                      </div>
                      
                      <div className="space-y-3 mb-8">
                          {gameInfo.players.map((p: any) => (
                              <div
                                key={p.id}
                                onMouseEnter={playLobbyHover}
                                className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-slate-800 hover:border-slate-600 transition-colors"
                              >
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
                                className={clsx(
                                    "flex-1 p-3 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-amber-500 transition-colors font-serif",
                                    isDeckConfirmed && "opacity-50 cursor-not-allowed bg-slate-950"
                                )}
                                value={selectedDeck}
                                onChange={e => setSelectedDeck(e.target.value)}
                                onMouseEnter={playLobbyHover}
                                disabled={isDeckConfirmed}
                              >
                                  <option value="">-- Choose a Grimoire --</option>
                                  {myDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                              <button 
                                onMouseEnter={playLobbyHover}
                                onClick={() => {
                                  if (isDeckConfirmed) {
                                      playLobbyHover();
                                      unselectDeck();
                                  } else {
                                      playLobbyReady();
                                      selectDeck();
                                  }
                                }}
                                disabled={!selectedDeck && !isDeckConfirmed} 
                                className={clsx(
                                    "px-6 rounded font-bold transition-all border",
                                    isDeckConfirmed 
                                        ? "bg-red-900 hover:bg-red-800 border-red-700 text-red-100 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                                        : "bg-indigo-900 hover:bg-indigo-800 border-indigo-700 text-indigo-100 hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]",
                                    !selectedDeck && !isDeckConfirmed && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                  {isDeckConfirmed ? "Unconfirm" : "Confirm"}
                              </button>
                          </div>
                      </div>

                      {gameInfo.host_id === user?.id && (
                          <div className="bg-slate-950/30 p-4 rounded-lg border border-slate-800/50 mt-4">
                              <label className="block mb-2 text-xs uppercase tracking-widest text-slate-500 font-bold">Game Options</label>
                              <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                      <label className="block text-sm text-slate-400 mb-1">Initial Life</label>
                                      <input 
                                          type="number" 
                                          value={initialLife}
                                          onChange={e => setInitialLife(parseInt(e.target.value) || 0)}
                                          onMouseEnter={playLobbyHover}
                                          className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                      />
                                  </div>
                              </div>
                          </div>
                      )}

                      {gameInfo.host_id === user?.id && (
                          <div className="relative group">
                            <button 
                                onMouseEnter={playLobbyHover}
                                onClick={() => {
                                    if (!canStartDuel()) return;
                                    playLobbyStart();
                                    startGame();
                                }}
                                disabled={!canStartDuel()}
                                className={clsx(
                                    "w-full mt-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform flex items-center justify-center gap-3 border",
                                    canStartDuel() 
                                        ? "bg-gradient-to-r from-emerald-900 to-teal-900 hover:from-emerald-800 hover:to-teal-800 border-emerald-700 text-emerald-100 active:scale-[0.99]" 
                                        : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-60"
                                )}
                            >
                                <Swords size={24} /> BEGIN THE DUEL
                            </button>
                            {!canStartDuel() && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-xs py-2 px-4 rounded border border-slate-700 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                    <span className="text-amber-500 font-bold">Wait!</span> All planeswalkers must select their grimoires first.
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
                                </div>
                            )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  if (!gameState) return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400 font-serif animate-pulse select-none">
        <Layers className="mr-2 animate-spin" /> Connecting to Plane...
    </div>
  );
  
  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden font-sans select-none">
      <iframe
        ref={bgmIframeRef}
        className="absolute w-px h-px opacity-0 pointer-events-none"
        src={bgmEmbedSrc}
        title="game-bgm"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => {
          setBgmYoutubeVolume(bgmVolume);
          setBgmYoutubeMuted(bgmMuted);
        }}
      />
      <SettingsModal 
          settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen}
          previewScale={previewScale} setPreviewScale={setPreviewScale}
          hoverScale={hoverScale} setHoverScale={setHoverScale}
          uiScale={uiScale} setUiScale={setUiScale}
          hotkeys={hotkeys} setHotkeys={setHotkeys}
          showOriginalPlaymats={showOriginalPlaymats} setShowOriginalPlaymats={setShowOriginalPlaymats}
      />
      {/* Damage Vignette */}
      <div 
          className={clsx(
              "fixed inset-0 pointer-events-none z-[100] transition-opacity ease-out",
              showDamageVignette ? "opacity-100 duration-0" : "opacity-0 duration-500"
          )}
          style={{
              boxShadow: "inset 0 0 150px rgba(220, 38, 38, 0.6)"
          }}
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
          isArrowMode={isArrowMode}
      />
      <ContextMenu 
          menuOpen={isArrowMode ? null : menuOpen}
          setMenuOpen={setMenuOpen}
          gameState={gameState}
          mySeat={mySeat}
          previewScale={previewScale}
          uiScale={uiScale}
          sendAction={sendAction}
          startEquipSelection={startEquipSelection}
          startEnchantSelection={startEnchantSelection}
      />
      
      <MagicArrows 
          arrows={gameState?.arrows || []} 
          mySeat={mySeat} 
          previewArrow={arrowSourceId ? { fromId: arrowSourceId, toPos: mousePos } : null}
          onDeleteArrow={(arrowId) => sendAction('DELETE_ARROW', { arrowId })}
      />
      
      {showRevealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRevealModal(false)}>
              <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Eye className="text-amber-500" /> Reveal Hand To...
                  </h3>
                  <div className="grid gap-2">
                      <button 
                          onClick={() => {
                              sendAction('REVEAL_START', { seat: mySeat, target: 'ALL' });
                              setShowRevealModal(false);
                          }}
                          className="p-3 bg-slate-800 hover:bg-amber-900/40 border border-slate-700 hover:border-amber-500/50 rounded flex items-center justify-between group transition-all"
                      >
                          <span className="font-bold text-slate-300 group-hover:text-amber-400">Everyone</span>
                          <span className="text-xs bg-slate-950 px-2 py-1 rounded text-slate-500">All Players</span>
                      </button>
                      
                      {Object.values(gameState.players).filter((p: any) => p.seat !== mySeat).map((p: any) => (
                          <button 
                              key={p.seat}
                              onClick={() => {
                                  sendAction('REVEAL_START', { seat: mySeat, target: p.seat });
                                  setShowRevealModal(false);
                              }}
                              className="p-3 bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/50 rounded flex items-center justify-between group transition-all"
                          >
                              <span className="font-bold text-slate-300 group-hover:text-indigo-400">{p.username}</span>
                              <span className="text-xs bg-slate-950 px-2 py-1 rounded text-slate-500">Seat {p.seat}</span>
                          </button>
                      ))}
                  </div>
                  <button 
                      onClick={() => setShowRevealModal(false)}
                      className="mt-6 w-full py-2 text-slate-500 hover:text-slate-300 text-sm font-bold uppercase tracking-wider"
                  >
                      Cancel
                  </button>
              </div>
          </div>
      )}

      {tradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setTradeModalOpen(false)}>
            <div className="bg-slate-900 border border-amber-500 rounded-lg p-6 shadow-2xl min-w-[300px]" onClick={e => e.stopPropagation()}>
                <h3 className="text-amber-500 font-serif font-bold text-xl mb-6 text-center">Select Trading Partner</h3>
                <div className="flex flex-col gap-3">
                    {opponents.length === 0 && <div className="text-slate-500 text-center italic">No opponents available</div>}
                    {opponents.map((p: any) => (
                        <button 
                            key={p.seat}
                            className="p-3 bg-slate-800 hover:bg-amber-900/50 hover:border-amber-500 border border-slate-700 rounded text-slate-200 transition-all font-bold flex justify-between items-center group"
                            onClick={() => {
                                sendAction('TRADE_INIT', { initiatorSeat: mySeat, targetSeat: p.seat });
                                setTradeModalOpen(false);
                            }}
                        >
                            <span>{p.username}</span>
                            <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        </button>
                    ))}
                    <button 
                        onClick={() => setTradeModalOpen(false)} 
                        className="mt-4 py-2 text-slate-500 hover:text-white border-t border-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {revealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRevealModalOpen(false)}>
            <div className="bg-slate-900 border border-indigo-500 rounded-lg p-6 shadow-2xl min-w-[320px]" onClick={e => e.stopPropagation()}>
                <h3 className="text-indigo-300 font-serif font-bold text-xl mb-6 text-center">Reveal Hand To...</h3>
                <div className="flex flex-col gap-3">
                    <button 
                        className="p-3 bg-slate-800 hover:bg-indigo-900/50 hover:border-indigo-400 border border-slate-700 rounded text-slate-200 transition-all font-bold flex justify-between items-center group"
                        onClick={() => {
                            sendAction('REVEAL_START', { seat: mySeat, target: 'ALL' });
                            setRevealModalOpen(false);
                        }}
                    >
                        <span>Everyone</span>
                        <span className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    </button>
                    {opponents.length === 0 && <div className="text-slate-500 text-center italic">No opponents available</div>}
                    {opponents.map((p: any) => (
                        <button 
                            key={p.seat}
                            className="p-3 bg-slate-800 hover:bg-indigo-900/50 hover:border-indigo-400 border border-slate-700 rounded text-slate-200 transition-all font-bold flex justify-between items-center group"
                            onClick={() => {
                                sendAction('REVEAL_START', { seat: mySeat, target: p.seat });
                                setRevealModalOpen(false);
                            }}
                        >
                            <span>{p.username}</span>
                            <span className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        </button>
                    ))}
                    <button 
                        onClick={() => setRevealModalOpen(false)} 
                        className="mt-4 py-2 text-slate-500 hover:text-white border-t border-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {commanderModalOpen && (
          <CommanderDamageModal 
              gameState={gameState}
              mySeat={mySeat}
              onClose={() => setCommanderModalOpen(false)}
              sendAction={sendAction}
          />
      )}

      <LifeTotalModal 
          isOpen={lifeModalOpen}
          onClose={() => {
              setLifeModalOpen(false);
              setLifeModalTarget(null);
          }}
          currentLife={lifeModalTarget?.life || 0}
          username={lifeModalTarget?.username || ''}
          onApply={(newLife) => {
              if (lifeModalTarget) {
                  sendAction('LIFE_SET', { seat: lifeModalTarget.seat, value: newLife });
              }
          }}
      />

      <DiceRollModal 
          isOpen={diceRollModalOpen}
          onClose={() => setDiceRollModalOpen(false)}
          sendAction={sendAction}
      />

      <CreateTokenModal 
          isOpen={createTokenModalOpen}
          onClose={() => setCreateTokenModalOpen(false)}
          onCreate={(token, quantity) => sendAction('CREATE_TOKENS', { seat: mySeat, zone: 'BATTLEFIELD', token, quantity })}
      />

      <LibraryRevealModal 
          isOpen={libraryRevealModalOpen}
          onClose={() => setLibraryRevealModalOpen(false)}
          mySeat={mySeat}
          opponents={opponents}
          sendAction={sendAction}
      />

      <LibraryViewModal
          isOpen={viewLibraryModalOpen}
          onClose={() => setViewLibraryModalOpen(false)}
          gameState={gameState}
          mySeat={mySeat}
          sendAction={sendAction}
      />

      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => navigate('/')}
        title="Abandonar Partida"
        confirmText="Salir"
        isDanger={true}
      >
          <div className="flex flex-col gap-4">
              <p>¿Estás seguro de que quieres salir de la partida?</p>
              <div className="bg-slate-950 p-4 rounded border border-slate-700 flex flex-col gap-2">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Game ID (Para regresar)</span>
                  <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-900 p-2 rounded text-amber-500 font-mono text-sm border border-slate-800 select-all">
                          {id}
                      </code>
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText(id!);
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 transition-colors"
                        title="Copiar ID"
                      >
                          <Copy size={16} />
                      </button>
                  </div>
              </div>
          </div>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        onConfirm={handleRestart}
        title="Reiniciar Partida"
        confirmText="Reiniciar"
        isDanger={true}
      >
          <p>¿Estás seguro de que quieres reiniciar la partida?</p>
          <p className="text-sm text-slate-400 mt-2">
              Esto barajará las bibliotecas, reiniciará las vidas y repartirá nuevas manos para todos los jugadores. Esta acción no se puede deshacer.
          </p>
      </ConfirmationModal>

      <UserProfileModal 
          isOpen={userProfileModalOpen}
          onClose={() => setUserProfileModalOpen(false)}
          player={userProfileModalPlayer}
      />

      <MulliganModal 
          isOpen={showMulliganModal}
          hand={gameState?.zoneIndex?.[mySeat]?.HAND?.map((id: string) => gameState.objects[id]) || []}
          onMulligan={(n) => sendAction('MULLIGAN', { seat: mySeat, n })}
          onKeep={() => {
              setOpeningHandKeptLocal(true);
              sendAction('KEEP_HAND', { seat: mySeat });
          }}
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
                      <div 
                        className="flex items-center gap-2 mb-1 cursor-pointer hover:opacity-80 transition-opacity group/user"
                        onClick={() => {
                            setUserProfileModalPlayer(p);
                            setUserProfileModalOpen(true);
                        }}
                      >
                          <div className="w-6 h-6 rounded-full border border-slate-700 overflow-hidden bg-slate-900 flex-shrink-0 group-hover/user:border-indigo-500/50 transition-colors">
                              {p.avatar_url ? (
                                  <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                                      <User size={12} />
                                  </div>
                              )}
                          </div>
                          <span className={clsx("font-serif font-bold text-sm tracking-wide truncate max-w-[80px] group-hover/user:text-white transition-colors", p.seat === mySeat ? "text-indigo-200" : "text-slate-400")}>
                            {p.username}
                          </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <button 
                            onClick={() => {
                                setLifeModalTarget(p);
                                setLifeModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-red-500 drop-shadow-sm hover:scale-110 transition-transform cursor-pointer group"
                            title="Cambiar vida"
                        >
                            <Heart size={14} className="group-hover:fill-red-500 transition-colors" fill="currentColor" /> 
                            <span className="font-bold text-lg font-mono leading-none">{p.life}</span>
                        </button>
                        {p.seat === mySeat && (
                            <div className="flex gap-0.5 ml-1">
                                <button onClick={(e) => { e.stopPropagation(); sendAction('LIFE_SET', { seat: mySeat, delta: 1 }); }} className="text-[10px] bg-slate-700 hover:bg-emerald-700 hover:text-white w-5 h-5 rounded flex items-center justify-center transition-colors">+</button>
                                <button onClick={(e) => { e.stopPropagation(); sendAction('LIFE_SET', { seat: mySeat, delta: -1 }); }} className="text-[10px] bg-slate-700 hover:bg-red-700 hover:text-white w-5 h-5 rounded flex items-center justify-center transition-colors">-</button>
                            </div>
                        )}
                      </div>
                  </div>
              ))}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 px-2">
              <span className="font-mono tracking-widest border border-slate-800 px-2 py-1 rounded bg-slate-950/50 mr-2 hidden sm:block">
                  ID: {gameInfo.code}
              </span>

              <button
                onClick={toggleBgmMuted}
                className="text-slate-400 hover:text-amber-300 transition-colors p-1.5 hover:bg-slate-800 rounded-full"
                title={bgmMuted ? 'Unmute' : 'Mute'}
              >
                {bgmMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={volumeToSlider(bgmVolume)}
                onChange={(e) => {
                  const sliderVal = Number(e.target.value);
                  const vol = sliderToVolume(sliderVal);
                  setBgmVolume(vol);
                  setBgmYoutubeVolume(vol);
                }}
                className="w-24 accent-amber-500 hidden md:block"
                title={`Volumen: ${Math.round(bgmVolume)}%`}
              />
              
              {gameInfo.host_id === user?.id && (
                  <button 
                    onClick={() => setShowRestartModal(true)} 
                    className="text-slate-400 hover:text-amber-400 transition-colors p-1.5 hover:bg-slate-800 rounded-full"
                    title="Reiniciar Partida"
                  >
                      <RotateCcw size={18} />
                  </button>
              )}

              <button 
                onClick={() => setSettingsOpen(true)} 
                className="text-slate-400 hover:text-indigo-400 transition-colors p-1.5 hover:bg-slate-800 rounded-full"
                title="Configuración"
              >
                  <Settings size={18} />
              </button>

              <button 
                onClick={() => setShowExitModal(true)} 
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-full"
                title="Salir de la Partida"
              >
                  <LogOut size={18} />
              </button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
          {/* Left Toolbar */}
          <LeftSideToolbar 
              gameState={gameState} 
              mySeat={mySeat} 
              setCommanderModalOpen={setCommanderModalOpen} 
              setDiceRollModalOpen={setDiceRollModalOpen}
              sendAction={sendAction}
                isThinkingCooldown={isThinkingCooldown}
                setIsThinkingCooldown={setIsThinkingCooldown}
                isPassCooldown={isPassCooldown}
                setIsPassCooldown={setIsPassCooldown}
                showCommanderDamage={showCommanderDamage}
                setShowCommanderDamage={setShowCommanderDamage}
                isArrowMode={isArrowMode}
                setIsArrowMode={setIsArrowMode}
              />

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
                 <div className="flex flex-wrap gap-1 justify-center w-full h-full items-stretch">
                    {amIRevealing ? (
                        gameState.reveal?.type === 'LIBRARY' ? (
                            <div className="w-full h-full p-1">
                                <LibraryRevealTray gameState={gameState} {...commonProps} />
                            </div>
                        ) : (
                            <div className="w-full h-full p-1">
                                <RevealTray gameState={gameState} {...commonProps} />
                            </div>
                        )
                    ) : amITrading ? (
                        <div className="w-full h-full p-1">
                            <TradeTray gameState={gameState} {...commonProps} />
                        </div>
                    ) : (
                        Object.values(gameState.players).filter((p: any) => p.seat !== mySeat).map((p: any) => (
                            <div key={p.seat} className="flex-1 min-w-[300px] h-full rounded-lg border border-red-900/10 bg-gradient-to-b from-red-950/5 to-transparent">
                                <OpponentBattlefield player={p} gameState={gameState} {...commonProps} />
                            </div>
                        ))
                    )}
                 </div>
              </div>

              <div
                className="h-2 bg-gradient-to-r from-slate-900 via-amber-700/50 to-slate-900 hover:via-amber-500 cursor-row-resize transition-colors z-0 border-y border-slate-950 shadow-[0_0_10px_rgba(0,0,0,0.6)] touch-action-none"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  isResizingBattlefields.current = true;
                  battlefieldsResizeStartY.current = e.clientY;
                  const fallback = battlefieldsContainerRef.current ? Math.floor(battlefieldsContainerRef.current.clientHeight / 2) : 0;
                  battlefieldsResizeStartHeight.current = opponentsBattlefieldHeight > 0 ? opponentsBattlefieldHeight : fallback;
                  document.body.style.cursor = 'row-resize';
                }}
              />

              {/* My Battlefield (Bottom 50%) */}
              <div 
                className="flex-1 overflow-auto p-0 bg-gradient-to-t from-indigo-950/10 to-transparent relative z-10 overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                  <div className="h-full rounded-lg border border-indigo-900/10">
                      <MyBattlefield gameState={gameState} seat={mySeat} {...commonProps} />
                  </div>
              </div>
          </div>

          {/* Right Toolbar */}
          <RightSideToolbar 
              mySeat={mySeat}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sendAction={sendAction}
              setTradeModalOpen={setTradeModalOpen}
              setRevealModalOpen={setRevealModalOpen}
              setCreateTokenModalOpen={setCreateTokenModalOpen}
              setLibraryRevealModalOpen={setLibraryRevealModalOpen}
              setViewLibraryModalOpen={setViewLibraryModalOpen}
          />
      </div>

      {/* Resizer Handle */}
      <div 
        className="h-1.5 bg-gradient-to-r from-slate-900 via-amber-700/50 to-slate-900 hover:via-amber-500 hover:h-2 cursor-row-resize transition-all z-20 shadow-[0_-1px_5px_rgba(0,0,0,0.5)] border-y border-slate-950 touch-action-none"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
            e.preventDefault(); 
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            isResizingPanel.current = true;
            panelResizeStartY.current = e.clientY;
            panelResizeStartHeight.current = panelHeight;
            document.body.style.cursor = 'row-resize';
        }}
      />

      {/* Bottom Area: My Zones Tabs & Deck Button */}
      <PlayerPanel 
          gameState={gameState}
          mySeat={mySeat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sendAction={sendAction}
          panelHeight={panelHeight}
          commonProps={commonProps}
      />

      <GameLog gameState={gameState} />
    </div>
  );
}
