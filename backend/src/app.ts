import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import deckRoutes from './routes/deck';
import gameRoutes from './routes/game';
import { setupSocket } from './socket';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string) => {
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  if (allowedOrigins.length === 0) return false;
  return allowedOrigins.includes(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

setupSocket(io);

// Middleware to inject io BEFORE routes so controllers can emit
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/decks', deckRoutes);
app.use('/games', gameRoutes);

export { app, httpServer };
