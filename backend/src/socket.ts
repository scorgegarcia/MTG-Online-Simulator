import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './utils/prisma';
import { handleGameAction, handleJoinGame, handleRejoinGame } from './services/game';

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocket = (io: Server) => {
  io.use(async (socket: AuthSocket, next) => {
    try {
      // Allow connection without auth for initial handshake, but validate later?
      // Or validate handshake query/headers.
      // For simplicity, we might require auth to connect or join.
      // Let's check handshake auth token
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log('[socket.io] connected', { userId: socket.userId });

    socket.on('game:join', async (data) => {
        if (!socket.userId) return;
        console.log('[socket.io] game:join', { gameId: data.gameId, userId: socket.userId });
        await handleJoinGame(io, socket, data.gameId, socket.userId);
    });

    socket.on('game:rejoin', async (data) => {
        if (!socket.userId) return;
        console.log('[socket.io] game:rejoin', { gameId: data.gameId, userId: socket.userId });
        await handleRejoinGame(io, socket, data.gameId, socket.userId);
    });

    socket.on('game:action', async (data) => {
        if (!socket.userId) return;
        console.log('[socket.io] game:action', { gameId: data.gameId, userId: socket.userId, type: data.action?.type });
        await handleGameAction(io, socket, data.gameId, socket.userId, data.action, data.expectedVersion);
    });

    socket.on('disconnect', () => {
      console.log('[socket.io] disconnected', { userId: socket.userId });
    });
  });
};
