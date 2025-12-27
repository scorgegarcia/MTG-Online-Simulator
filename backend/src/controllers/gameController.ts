import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { startGame, restartGame } from '../services/game';

// Schemas
const createGameSchema = z.object({}); // No params needed? Or format?
const joinGameSchema = z.object({ code: z.string() });
const selectDeckSchema = z.object({ deckId: z.string() });

// Helpers
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createGame = async (req: AuthRequest, res: Response) => {
  try {
    const code = generateCode();
    const game = await prisma.game.create({
      data: {
        code,
        host_id: req.userId!,
        status: 'LOBBY',
        players: {
            create: {
                user_id: req.userId!,
                seat: 1,
                connected: true
            }
        }
      },
      include: { players: { include: { user: true } } }
    });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
};

export const joinGame = async (req: AuthRequest, res: Response) => {
    const { code } = joinGameSchema.parse(req.body);
    
    const game = await prisma.game.findUnique({ where: { code } });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.status !== 'LOBBY') return res.status(400).json({ error: 'Game already started' });

    // Check if already joined
    const existing = await prisma.gamePlayer.findFirst({
        where: { game_id: game.id, user_id: req.userId }
    });
    if (existing) return res.json({ gameId: game.id }); // Already joined

    // Find next seat
    const players = await prisma.gamePlayer.findMany({ where: { game_id: game.id } });
    if (players.length >= 4) return res.status(400).json({ error: 'Game full' });
    
    const takenSeats = players.map(p => p.seat);
    let nextSeat = 1;
    while (takenSeats.includes(nextSeat)) nextSeat++;

    await prisma.gamePlayer.create({
        data: {
            game_id: game.id,
            user_id: req.userId!,
            seat: nextSeat
        }
    });

    // Notify lobby
    console.log(`Emitting lobby:updated to game:${game.id}`); // Debug
    (req as any).io?.to(`game:${game.id}`).emit('lobby:updated');

    res.json({ gameId: game.id });
};

export const leaveGame = async (req: AuthRequest, res: Response) => {
    const gameId = req.params.id;
    
    // Check if player is in game
    const player = await prisma.gamePlayer.findFirst({
        where: { game_id: gameId, user_id: req.userId }
    });
    
    if (!player) return res.status(404).json({ error: 'Player not in game' });

    // Remove player
    await prisma.gamePlayer.delete({
        where: { id: player.id }
    });

    // Notify lobby
    console.log(`Emitting lobby:updated to game:${gameId}`); // Debug
    (req as any).io?.to(`game:${gameId}`).emit('lobby:updated');

    res.json({ message: 'Left game' });
};

export const getGame = async (req: AuthRequest, res: Response) => {
    const game = await prisma.game.findUnique({
        where: { id: req.params.id },
        include: { players: { include: { user: { select: { id: true, username: true } }, deck: { select: { id: true, name: true } } } } }
    });
    if (!game) return res.status(404).json({ error: 'Not found' });
    res.json(game);
};

export const selectDeck = async (req: AuthRequest, res: Response) => {
    const { deckId } = selectDeckSchema.parse(req.body);
    // Verify deck ownership
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.user_id !== req.userId) return res.status(403).json({ error: 'Invalid deck' });

    await prisma.gamePlayer.updateMany({
        where: { game_id: req.params.id, user_id: req.userId },
        data: { deck_id: deckId }
    });
    
    // Notify lobby
    console.log(`Emitting lobby:updated to game:${req.params.id}`); // Debug
    (req as any).io?.to(`game:${req.params.id}`).emit('lobby:updated');

    res.json({ message: 'Deck selected' });
};

export const startGameEndpoint = async (req: AuthRequest, res: Response) => {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });
    if (!game || game.host_id !== req.userId) return res.status(403).json({ error: 'Only host can start' });
    
    try {
        const state = await startGame(game.id);
        
        // Notify start
        (req as any).io?.to(`game:${game.id}`).emit('game:started');
        
        res.json({ message: 'Started' });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

export const restartGameEndpoint = async (req: AuthRequest, res: Response) => {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });
    if (!game || game.host_id !== req.userId) return res.status(403).json({ error: 'Only host can restart' });
    
    try {
        const state = await restartGame(game.id);
        
        (req as any).io?.to(`game:${game.id}`).emit('game:updated', { 
            gameId: game.id, 
            state,
            lastAction: { type: 'RESTART', payload: {} } 
        });
        
        res.json({ message: 'Restarted' });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};
