import { Server, Socket } from 'socket.io';
import prisma from '../utils/prisma';
import { randomUUID } from 'crypto';

// Types
interface GameState {
  version: number;
  initialLife?: number;
  players: Record<number, PlayerState>; // seat -> player
  objects: Record<string, GameObject>; // objectId -> object
  zoneIndex: Record<number, Record<string, string[]>>; // seat -> zone -> [objectIds] (ordered)
  battlefieldLayout: Record<number, any[]>; // seat -> layout info
  chat: any[];
  trade?: TradeSession;
  reveal?: RevealSession;
}

interface RevealSession {
    sourceSeat: number;
    targetSeat: number | 'ALL';
    highlightedCards: string[];
}

interface TradeSession {
    initiatorSeat: number;
    targetSeat: number;
    initiatorLocked: boolean;
    targetLocked: boolean;
    initiatorConfirmed: boolean;
    targetConfirmed: boolean;
}

interface PlayerState {
  seat: number;
  userId: string;
  username: string;
  life: number;
  counters: Record<string, number>;
  commanderDamageReceived: Record<number, number>; // sourceSeat -> damage
}

interface GameObject {
  id: string;
  scryfall_id: string | null; // null if token
  owner_seat: number;
  controller_seat: number;
  zone: string; // LIBRARY, HAND, BATTLEFIELD, GRAVEYARD, EXILE, COMMAND
  face_state: string; // NORMAL, FACEDOWN
  tapped: boolean;
  counters: Record<string, number>;
  note: string;
  image_url?: string; // for tokens
  power?: string;
  toughness?: string;
  trade_origin_zone?: string; // Where this card came from before joining a trade offer
}

// Helpers
const getGameRoom = (gameId: string) => `game:${gameId}`;

export const handleJoinGame = async (io: Server, socket: Socket, gameId: string, userId: string) => {
  console.log('[handleJoinGame] start', { gameId, userId });
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { players: true }
  });

  if (!game) {
    console.log('[handleJoinGame] game not found', { gameId });
    socket.emit('game:error', { message: 'Game not found' });
    return;
  }

  // Verify player is in game
  const player = game.players.find(p => p.user_id === userId);
  if (!player) {
    console.log('[handleJoinGame] user not in game', { gameId, userId });
    socket.emit('game:error', { message: 'You are not in this game' });
    return;
  }

  socket.join(getGameRoom(gameId));
  console.log('[handleJoinGame] joined room', { room: getGameRoom(gameId) });
  
  // Update connection status
  await prisma.gamePlayer.updateMany({
      where: { game_id: gameId, user_id: userId },
      data: { connected: true }
  });

  // Send current state (query gameState by game_id)
  try {
    const gs = await prisma.gameState.findUnique({ where: { game_id: gameId } });
    if (gs) {
      console.log('[handleJoinGame] emit snapshot', { version: (gs.snapshot as any)?.version });
      socket.emit('game:snapshot', { gameId, state: gs.snapshot });
    } else {
      console.log('[handleJoinGame] emit status', { status: game.status });
      socket.emit('game:status', { status: game.status });
    }
  } catch {
    console.log('[handleJoinGame] status fallback', { status: game.status });
    socket.emit('game:status', { status: game.status });
  }
};

export const handleRejoinGame = handleJoinGame;

export const startGame = async (gameId: string, initialLifeParam?: number) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { 
        players: { include: { user: true, deck: { include: { cards: true } } } } 
    }
  });

  if (!game || game.status !== 'LOBBY') throw new Error('Cannot start game');
  if (game.players.length < 1) throw new Error('Not enough players'); // Allow 1 for testing

  const initialLife = initialLifeParam ?? 40;
  console.log('[startGame]', { gameId, initialLife });

  const initialState: GameState = {
    version: 1,
    initialLife,
    players: {},
    objects: {},
    zoneIndex: {},
    battlefieldLayout: {},
    chat: []
  };

  // Initialize players
  for (const p of game.players) {
    initialState.players[p.seat] = {
      seat: p.seat,
      userId: p.user_id,
      username: p.user.username,
      life: initialLife,
      counters: {},
      commanderDamageReceived: {}
    };
    initialState.zoneIndex[p.seat] = {
      LIBRARY: [],
      HAND: [],
      BATTLEFIELD: [],
      GRAVEYARD: [],
      EXILE: [],
      COMMAND: [],
      SIDEBOARD: []
    };
    initialState.battlefieldLayout[p.seat] = [];

    // Load Deck
    if (p.deck) {
      const mainboard = p.deck.cards.filter(c => c.board === 'main');
      const commander = p.deck.cards.filter(c => c.board === 'commander');
      const sideboard = p.deck.cards.filter(c => c.board === 'side');
      const libraryIds: string[] = [];
      
      // Load Mainboard to Library
      for (const card of mainboard) {
        for (let i = 0; i < card.qty; i++) {
          const objId = randomUUID();
          const obj: GameObject = {
            id: objId,
            scryfall_id: card.scryfall_id,
            owner_seat: p.seat,
            controller_seat: p.seat,
            zone: 'LIBRARY',
            face_state: 'NORMAL',
            tapped: false,
            counters: {},
            note: '',
          };
          initialState.objects[objId] = obj;
          libraryIds.push(objId);
        }
      }

      // Load Commander(s)
      for (const card of commander) {
          for (let i = 0; i < card.qty; i++) {
            const objId = randomUUID();
            const obj: GameObject = {
              id: objId,
              scryfall_id: card.scryfall_id,
              owner_seat: p.seat,
              controller_seat: p.seat,
              zone: 'COMMAND',
              face_state: 'NORMAL',
              tapped: false,
              counters: {},
              note: '',
            };
            initialState.objects[objId] = obj;
            initialState.zoneIndex[p.seat].COMMAND.push(objId);
          }
      }

      // Load Sideboard
      for (const card of sideboard) {
          for (let i = 0; i < card.qty; i++) {
            const objId = randomUUID();
            const obj: GameObject = {
              id: objId,
              scryfall_id: card.scryfall_id,
              owner_seat: p.seat,
              controller_seat: p.seat,
              zone: 'SIDEBOARD',
              face_state: 'NORMAL',
              tapped: false,
              counters: {},
              note: '',
            };
            initialState.objects[objId] = obj;
            initialState.zoneIndex[p.seat].SIDEBOARD.push(objId);
          }
      }

      // Shuffle Library
      for (let i = libraryIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [libraryIds[i], libraryIds[j]] = [libraryIds[j], libraryIds[i]];
      }
      
      initialState.zoneIndex[p.seat].LIBRARY = libraryIds;

      // Draw 7
      const drawCount = Math.min(7, libraryIds.length);
      const drawn = libraryIds.splice(0, drawCount);
      initialState.zoneIndex[p.seat].HAND = drawn;
      drawn.forEach(id => {
          initialState.objects[id].zone = 'HAND';
      });
    }
  }

  // Save State
  await prisma.$transaction([
    prisma.game.update({
      where: { id: gameId },
      data: { status: 'ACTIVE', started_at: new Date() }
    }),
    prisma.gameState.create({
      data: {
        game_id: gameId,
        state_version: 1,
        snapshot: initialState as any
      }
    })
  ]);

  return initialState;
};

export const restartGame = async (gameId: string) => {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { 
        players: { include: { user: true, deck: { include: { cards: true } } } },
        gameState: true
    }
  });

  if (!game) throw new Error('Game not found');
  if (game.players.length < 1) throw new Error('Not enough players');

  const oldVersion = (game.gameState?.snapshot as any)?.version || 0;
  const initialLife = (game.gameState?.snapshot as any)?.initialLife || 40;
  const initialState: GameState = {
    version: oldVersion + 1,
    initialLife,
    players: {},
    objects: {},
    zoneIndex: {},
    battlefieldLayout: {},
    chat: [{
        id: randomUUID(),
        timestamp: Date.now(),
        text: `🔄 La partida ha sido reiniciada por el Host.`
    }]
  };

  // Initialize players
  for (const p of game.players) {
    initialState.players[p.seat] = {
      seat: p.seat,
      userId: p.user_id,
      username: p.user.username,
      life: initialLife,
      counters: {},
      commanderDamageReceived: {}
    };
    initialState.zoneIndex[p.seat] = {
      LIBRARY: [],
      HAND: [],
      BATTLEFIELD: [],
      GRAVEYARD: [],
      EXILE: [],
      COMMAND: [],
      SIDEBOARD: []
    };
    initialState.battlefieldLayout[p.seat] = [];

    // Load Deck
    if (p.deck) {
      const mainboard = p.deck.cards.filter(c => c.board === 'main');
      const commander = p.deck.cards.filter(c => c.board === 'commander');
      const sideboard = p.deck.cards.filter(c => c.board === 'side');
      const libraryIds: string[] = [];
      
      // Load Mainboard to Library
      for (const card of mainboard) {
        for (let i = 0; i < card.qty; i++) {
          const objId = randomUUID();
          const obj: GameObject = {
            id: objId,
            scryfall_id: card.scryfall_id,
            owner_seat: p.seat,
            controller_seat: p.seat,
            zone: 'LIBRARY',
            face_state: 'NORMAL',
            tapped: false,
            counters: {},
            note: '',
          };
          initialState.objects[objId] = obj;
          libraryIds.push(objId);
        }
      }

      // Load Commander(s)
      for (const card of commander) {
          for (let i = 0; i < card.qty; i++) {
            const objId = randomUUID();
            const obj: GameObject = {
              id: objId,
              scryfall_id: card.scryfall_id,
              owner_seat: p.seat,
              controller_seat: p.seat,
              zone: 'COMMAND',
              face_state: 'NORMAL',
              tapped: false,
              counters: {},
              note: '',
            };
            initialState.objects[objId] = obj;
            initialState.zoneIndex[p.seat].COMMAND.push(objId);
          }
      }

      // Load Sideboard
      for (const card of sideboard) {
          for (let i = 0; i < card.qty; i++) {
            const objId = randomUUID();
            const obj: GameObject = {
              id: objId,
              scryfall_id: card.scryfall_id,
              owner_seat: p.seat,
              controller_seat: p.seat,
              zone: 'SIDEBOARD',
              face_state: 'NORMAL',
              tapped: false,
              counters: {},
              note: '',
            };
            initialState.objects[objId] = obj;
            initialState.zoneIndex[p.seat].SIDEBOARD.push(objId);
          }
      }

      // Shuffle Library
      for (let i = libraryIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [libraryIds[i], libraryIds[j]] = [libraryIds[j], libraryIds[i]];
      }
      
      initialState.zoneIndex[p.seat].LIBRARY = libraryIds;

      // Draw 7
      const drawCount = Math.min(7, libraryIds.length);
      const drawn = libraryIds.splice(0, drawCount);
      initialState.zoneIndex[p.seat].HAND = drawn;
      drawn.forEach(id => {
          initialState.objects[id].zone = 'HAND';
      });
    }
  }

  // Save State
  await prisma.$transaction([
    prisma.game.update({
      where: { id: gameId },
      data: { status: 'ACTIVE', started_at: new Date() }
    }),
    prisma.gameState.upsert({
      where: { game_id: gameId },
      create: {
        game_id: gameId,
        state_version: initialState.version,
        snapshot: initialState as any
      },
      update: {
        state_version: initialState.version,
        snapshot: initialState as any
      }
    })
  ]);

  return initialState;
};

export const handleGameAction = async (io: Server, socket: Socket, gameId: string, userId: string, action: any, expectedVersion: number) => {
  console.log('[handleGameAction] start', { gameId, userId, type: action?.type, expectedVersion });
  // Concurrency check and Apply
  // 1. Lock/Transaction
  // For simplicity in MVP, we might just read-modify-write in a transaction or strict sequence.
  // Prisma doesn't support pessimistic locking easily on all DBs, but we can check version.

  try {
    const result = await prisma.$transaction(async (tx) => {
      const gameStateDb = await tx.gameState.findUnique({ where: { game_id: gameId } });
      if (!gameStateDb) throw new Error('Game not started');

      if (gameStateDb.state_version !== expectedVersion) {
        throw new Error('OUT_OF_SYNC');
      }

      const currentState = gameStateDb.snapshot as unknown as GameState;
      const newState = applyAction(currentState, action, userId); // Mutates or returns new
      
      newState.version = currentState.version + 1;

      // Save event
      await tx.gameEvent.create({
        data: {
          game_id: gameId,
          user_id: userId,
          type: action.type,
          payload: action,
        }
      });

      // Update State
      await tx.gameState.update({
        where: { id: gameStateDb.id },
        data: {
          state_version: newState.version,
          snapshot: newState as any
        }
      });

      return newState;
    });

    // Emit update
    console.log('[handleGameAction] emit update', { version: (result as any)?.version });
    io.to(getGameRoom(gameId)).emit('game:updated', { 
        gameId, 
        state: result,
        lastAction: action // Send action to clients for SFX/Animation triggers
    });

  } catch (error: any) {
    if (error.message === 'OUT_OF_SYNC') {
      // Fetch latest and send
      const latest = await prisma.gameState.findUnique({ where: { game_id: gameId } });
      console.log('[handleGameAction] out_of_sync', { latestVersion: latest?.state_version });
      socket.emit('game:error', { code: 'OUT_OF_SYNC', state: latest?.snapshot });
    } else {
      console.error(error);
      socket.emit('game:error', { message: 'Action failed' });
    }
  }
};

// The Reducer
const applyAction = (state: GameState, action: any, userId: string): GameState => {
  // Validate permissions (e.g. can only move own cards? Sandbox = anything goes mostly)
  // For MVP assume valid if logged in.
  
  // Helper to log
  const log = (msg: string) => {
      const player = Object.values(state.players).find(p => p.userId === userId);
      const name = player ? player.username : 'Desconocido';
      state.chat.push({
          id: randomUUID(),
          timestamp: Date.now(),
          text: `[${name}] ${msg}`
      });
  };
  const actorSeat = Object.values(state.players).find(p => p.userId === userId)?.seat;

  switch (action.type) {
    case 'DRAW': {
      const { seat, n } = action.payload; // seat to draw for
      const library = state.zoneIndex[seat].LIBRARY;
      const hand = state.zoneIndex[seat].HAND;
      const count = Math.min(n || 1, library.length);
      const drawn = library.splice(0, count);
      hand.push(...drawn);
      drawn.forEach(id => state.objects[id].zone = 'HAND');
      log(`Agarró ${count} carta(s)`);
      break;
    }
    case 'MOVE': {
        const { objectId, fromZone, toZone, toOwner, position, index } = action.payload; // toOwner for "steal" logic, position for ordering
        // Find object
        const obj = state.objects[objectId];
        if(!obj) break;

        // Trade Logic: If moving to/from TRADE_OFFER, unlock trade
        if (state.trade && (fromZone === 'TRADE_OFFER' || toZone === 'TRADE_OFFER')) {
            state.trade.initiatorLocked = false;
            state.trade.targetLocked = false;
            state.trade.initiatorConfirmed = false;
            state.trade.targetConfirmed = false;
        }

        const cardName = obj.scryfall_id ? 'Carta' : 'Token'; // Ideally fetch name from cache or store in object
        // We don't have card names in state objects currently (except note?), only scryfall_id.
        // Client resolves it. Server just logs "Card".
        
        // Remove from old zone
        const removeFromZone = (seat: number, zone: string, id: string) => {
            const list = state.zoneIndex[seat]?.[zone];
            if(list) {
                const idx = list.indexOf(id);
                if(idx > -1) list.splice(idx, 1);
            }
        };

        removeFromZone(obj.controller_seat, obj.zone, objectId);

        // Update object
        const oldZone = obj.zone;
        obj.zone = toZone;
        if (toOwner) obj.controller_seat = toOwner; // Change controller

        // Track trade origin if entering trade
        if (toZone === 'TRADE_OFFER') {
            obj.trade_origin_zone = fromZone;
        } else if (fromZone === 'TRADE_OFFER' && toZone !== 'TRADE_OFFER') {
            // If leaving trade manually, clear origin
            delete obj.trade_origin_zone;
        }
        
        // Add to new
        const destSeat = obj.controller_seat;
        if (!state.zoneIndex[destSeat][toZone]) state.zoneIndex[destSeat][toZone] = [];
        
        if (typeof index === 'number' && index >= 0 && index <= state.zoneIndex[destSeat][toZone].length) {
             state.zoneIndex[destSeat][toZone].splice(index, 0, objectId);
        } else if (toZone === 'LIBRARY' && position === 'top') {
            state.zoneIndex[destSeat][toZone].unshift(objectId);
        } else {
            state.zoneIndex[destSeat][toZone].push(objectId);
        }
        
        log(`Movió ${cardName} de ${oldZone} a ${toZone}${position ? ` (${position})` : ''}`);
        break;
    }
    case 'TAP': {
        const { objectId, value } = action.payload; // value boolean or toggle
        if (state.objects[objectId]) {
            const old = state.objects[objectId].tapped;
            state.objects[objectId].tapped = typeof value === 'boolean' ? value : !state.objects[objectId].tapped;
            log(`${state.objects[objectId].tapped ? 'Tapó' : 'DesTapó'} la carta`);
        }
        break;
    }
    case 'SHUFFLE': {
        const { seat } = action.payload;
        const library = state.zoneIndex[seat].LIBRARY;
        // Fisher-Yates
        for (let i = library.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [library[i], library[j]] = [library[j], library[i]];
        }
        log(`Barajó su biblioteca`);
        break;
    }
    case 'LIFE_SET': {
        const { seat, value, delta } = action.payload;
        if (state.players[seat]) {
            if (typeof value === 'number') {
                state.players[seat].life = value;
                log(`Cambio su vida a ${value}`);
            }
            if (typeof delta === 'number') {
                state.players[seat].life += delta;
                log(`Vida ${delta > 0 ? '+' : ''}${delta}`);
            }
        }
        break;
    }
    case 'CREATE_TOKEN': {
        const { seat, zone, token } = action.payload; // token: { name, imageUrl, power, toughness }
        const objId = randomUUID();
        const obj: GameObject = {
            id: objId,
            scryfall_id: null,
            owner_seat: seat,
            controller_seat: seat,
            zone: zone || 'BATTLEFIELD',
            face_state: 'NORMAL',
            tapped: false,
            counters: {},
            note: '',
            image_url: token.imageUrl, // Custom URL or Scryfall token URL
            power: token.power,
            toughness: token.toughness
        };
        state.objects[objId] = obj;
        if (!state.zoneIndex[seat][obj.zone]) state.zoneIndex[seat][obj.zone] = [];
        state.zoneIndex[seat][obj.zone].push(objId);
        log(`Creo un token en ${obj.zone}`);
        break;
    }
    // ... Add more actions (COUNTERS, NOTE, etc)
    case 'PLAYER_COUNTER': {
        const { seat, type, delta } = action.payload;
        if (state.players[seat]) {
            state.players[seat].counters[type] = (state.players[seat].counters[type] || 0) + delta;
            if (state.players[seat].counters[type] <= 0 && type !== 'commanderTax') {
                 // Commander Tax usually stays even if 0 (though technically starts at 0 and goes up). 
                 // Poison, etc should probably stay at 0 if decremented? 
                 // Magic rules: you can have 0 poison counters. But usually we just don't show it if 0.
                 // Let's delete if <= 0 to keep clean, unless it's a specific persistent one?
                 // User wants to "manage" them. Let's delete if 0 for UI cleanliness, 
                 // but for Commander Tax it might be useful to show 0? 
                 // Actually, let's just delete if <= 0 for now, except maybe Commander Tax?
                 // Simpler: Just delete if <= 0.
                 delete state.players[seat].counters[type];
            }
            log(`${delta > 0 ? 'Agregó' : 'Removió'} ${type} (${Math.abs(delta)})`);
        }
        break;
    }
    case 'COMMANDER_DAMAGE': {
        const { seat, sourceSeat, delta } = action.payload;
        if (state.players[seat]) {
             if (!state.players[seat].commanderDamageReceived) {
                 state.players[seat].commanderDamageReceived = {};
             }
             const current = state.players[seat].commanderDamageReceived[sourceSeat] || 0;
             const newVal = Math.max(0, current + delta);
             state.players[seat].commanderDamageReceived[sourceSeat] = newVal;
             log(`Recibió ${Math.abs(delta)} daño de comandante de Jugador ${sourceSeat} (Total: ${newVal})`);
        }
        break;
    }
    case 'COUNTERS': {
        const { objectId, type, delta } = action.payload;
        const obj = state.objects[objectId];
        if (obj) {
            obj.counters[type] = (obj.counters[type] || 0) + delta;
            if (obj.counters[type] <= 0) delete obj.counters[type];
            log(`${delta > 0 ? 'Agregó' : 'Removió'} ${type} contador`);
        }
        break;
    }
    case 'UNTAP_ALL': {
        const { seat } = action.payload;
        // Untap all objects controlled by this seat in BATTLEFIELD
        const battlefieldIds = state.zoneIndex[seat]?.['BATTLEFIELD'] || [];
        let count = 0;
        battlefieldIds.forEach(id => {
            if (state.objects[id] && state.objects[id].tapped) {
                state.objects[id].tapped = false;
                count++;
            }
        });
        log(`Destapeó todo (${count} permanentes) 🔄`);
        break;
    }
    case 'PEEK_LIBRARY': {
        log(`⚠️ Está viendo su biblioteca 👁️‼️`);
        break;
    }
    case 'PEEK_ZONE': {
        const { zone } = action.payload;
        const zoneNames: Record<string, string> = {
            'HAND': 'su Mano ✋',
            'GRAVEYARD': 'su Cementerio 🪦',
            'EXILE': 'su Exilio 🌀',
            'COMMAND': 'su Command Zone 👑',
            'SIDEBOARD': 'su Sideboard 🎒'
        };
        const name = zoneNames[zone] || zone;
        log(`👀 Está viendo ${name}`);
        break;
    }
    case 'TRADE_INIT': {
        const { initiatorSeat, targetSeat } = action.payload;
        if (state.trade) break; // Already trading
        state.trade = {
            initiatorSeat,
            targetSeat,
            initiatorLocked: false,
            targetLocked: false,
            initiatorConfirmed: false,
            targetConfirmed: false
        };
        // Initialize TRADE_OFFER zones if not exist
        if (!state.zoneIndex[initiatorSeat]['TRADE_OFFER']) state.zoneIndex[initiatorSeat]['TRADE_OFFER'] = [];
        if (!state.zoneIndex[targetSeat]['TRADE_OFFER']) state.zoneIndex[targetSeat]['TRADE_OFFER'] = [];
        
        log(`Inició un intercambio con Jugador ${targetSeat}`);
        break;
    }
    case 'TRADE_CANCEL': {
        if (!state.trade) break;
        // Return all cards in TRADE_OFFER to their original zone (or HAND fallback)
        [state.trade.initiatorSeat, state.trade.targetSeat].forEach(seat => {
            const offer = state.zoneIndex[seat]?.['TRADE_OFFER'] || [];
            if (offer.length > 0) {
                offer.forEach(id => {
                    const obj = state.objects[id];
                    if (obj) {
                        const targetZone = obj.trade_origin_zone || 'HAND';
                        obj.zone = targetZone;
                        delete obj.trade_origin_zone;
                        
                        // Add back to target zone array
                        if (!state.zoneIndex[seat][targetZone]) state.zoneIndex[seat][targetZone] = [];
                        state.zoneIndex[seat][targetZone].push(id);
                    }
                });
                state.zoneIndex[seat]['TRADE_OFFER'] = [];
            }
        });
        delete state.trade;
        log(`Canceló el intercambio`);
        break;
    }
    case 'TRADE_LOCK': {
        const { seat } = action.payload;
        if (!state.trade) break;
        if (seat === state.trade.initiatorSeat) state.trade.initiatorLocked = true;
        if (seat === state.trade.targetSeat) state.trade.targetLocked = true;
        log(`Bloqueó su oferta`);
        break;
    }
    case 'TRADE_CONFIRM': {
        const { seat } = action.payload;
        if (!state.trade) break;
        
        // Can only confirm if both locked
        if (!state.trade.initiatorLocked || !state.trade.targetLocked) break;

        if (seat === state.trade.initiatorSeat) state.trade.initiatorConfirmed = true;
        if (seat === state.trade.targetSeat) state.trade.targetConfirmed = true;
        
        log(`Confirmó el intercambio`);

        // Check completion
        if (state.trade.initiatorConfirmed && state.trade.targetConfirmed) {
            // EXECUTE TRADE
            const p1 = state.trade.initiatorSeat;
            const p2 = state.trade.targetSeat;
            const offer1 = state.zoneIndex[p1]['TRADE_OFFER'] || [];
            const offer2 = state.zoneIndex[p2]['TRADE_OFFER'] || [];

            // Move offer1 to p2's HAND
            offer1.forEach(id => {
                const obj = state.objects[id];
                if (obj) {
                    obj.zone = 'HAND';
                    obj.controller_seat = p2;
                    delete obj.trade_origin_zone; // Clear origin on successful trade
                    // obj.owner_seat = p2; // Optional: Change ownership too? Let's do it for "Trade"
                }
            });
            state.zoneIndex[p2]['HAND'].push(...offer1);
            state.zoneIndex[p1]['TRADE_OFFER'] = [];

            // Move offer2 to p1's HAND
            offer2.forEach(id => {
                const obj = state.objects[id];
                if (obj) {
                    obj.zone = 'HAND';
                    obj.controller_seat = p1;
                    delete obj.trade_origin_zone; // Clear origin on successful trade
                    // obj.owner_seat = p1;
                }
            });
            state.zoneIndex[p1]['HAND'].push(...offer2);
            state.zoneIndex[p2]['TRADE_OFFER'] = [];

            delete state.trade;
            log(`Intercambio completado exitosamente ✅`);
        }
        break;
    }
    case 'REVEAL_START': {
        const { seat, target } = action.payload;
        if (state.reveal) break;
        if (actorSeat === undefined || seat !== actorSeat) break;
        if (target !== 'ALL' && typeof target !== 'number') break;
        state.reveal = {
            sourceSeat: seat,
            targetSeat: target,
            highlightedCards: []
        };
        const targetName = target === 'ALL' ? 'Todos' : `Jugador ${target}`;
        log(`Mostró su mano a ${targetName}`);
        break;
    }
    case 'REVEAL_CLOSE': {
        if (!state.reveal) break;
        if (actorSeat === undefined || actorSeat !== state.reveal.sourceSeat) break;
        delete state.reveal;
        log(`Ocultó su mano`);
        break;
    }
    case 'REVEAL_TOGGLE_CARD': {
        const { cardId } = action.payload;
        if (!state.reveal) break;
        if (actorSeat === undefined) break;
        if (state.reveal.targetSeat !== 'ALL' && actorSeat !== state.reveal.sourceSeat && actorSeat !== state.reveal.targetSeat) break;
        if (!state.zoneIndex[state.reveal.sourceSeat]?.HAND?.includes(cardId)) break;
        
        const idx = state.reveal.highlightedCards.indexOf(cardId);
        if (idx > -1) {
            state.reveal.highlightedCards.splice(idx, 1);
        } else {
            state.reveal.highlightedCards.push(cardId);
        }
        break;
    }
    case 'THINKING': {
        const { seat } = action.payload;
        log(`está pensando... 💬`);
        break;
    }
  }
  return state;
};
