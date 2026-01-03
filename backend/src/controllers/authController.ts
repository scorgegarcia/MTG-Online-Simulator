import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/auth';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const password_hash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, username, password_hash },
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input or server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const tokenHash = await hashPassword(refreshToken); // Hash refresh token before storing

    await prisma.refreshToken.create({
      data: {
        token_hash: tokenHash,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('Login successful, setting cookie for user:', user.email);
    setRefreshTokenCookie(res, refreshToken);
    // Explicitly send user data and a flag that cookie was set
    res.json({ 
        accessToken, 
        user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, playmat_url: user.playmat_url },
        cookieSet: true 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.magic_rt;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    
    // Find valid refresh token in DB. Since we hash it, we need to iterate or look up by user and compare.
    // Optimization: We can store a token ID in the JWT payload, but requirements said "token_hash".
    // Better approach for performance: Look up all tokens for user and compare.
    // Or just store the token plain text? Requirement: "almacenado hasheado en DB".
    // To make this efficient, we can't easily query by hash.
    // WE WILL iterate user's tokens. Not efficient for millions, but fine for 4 players.
    
    const tokens = await prisma.refreshToken.findMany({
      where: { user_id: decoded.userId },
    });

    let validTokenDb = null;
    for (const t of tokens) {
      if (await comparePassword(refreshToken, t.token_hash)) {
        validTokenDb = t;
        break;
      }
    }

    if (!validTokenDb) {
        // Reuse detection could go here (delete all tokens if reuse detected)
        return res.status(403).json({ error: 'Invalid refresh token' });
    }
    
    // Rotate token
    await prisma.refreshToken.delete({ where: { id: validTokenDb.id } });

    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    const newTokenHash = await hashPassword(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        token_hash: newTokenHash,
        user_id: decoded.userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshTokenCookie(res, newRefreshToken);
    res.json({ accessToken: newAccessToken });

  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.magic_rt;
  if (refreshToken) {
      // Best effort to delete
      try {
        const decoded = jwt.decode(refreshToken) as { userId: string };
        if (decoded && decoded.userId) {
             const tokens = await prisma.refreshToken.findMany({ where: { user_id: decoded.userId } });
             for (const t of tokens) {
                 if (await comparePassword(refreshToken, t.token_hash)) {
                     await prisma.refreshToken.delete({ where: { id: t.id } });
                     break;
                 }
             }
        }
      } catch (e) {}
  }
  
  res.clearCookie('magic_rt');
  res.json({ message: 'Logged out' });
};

export const me = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, avatar_url: true, playmat_url: true },
  });
  res.json({ user });
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { avatar_url } = z.object({ avatar_url: z.string().url().nullable() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar_url },
      select: { id: true, username: true, email: true, avatar_url: true, playmat_url: true },
    });
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL or server error' });
  }
};

export const updatePlaymat = async (req: AuthRequest, res: Response) => {
  try {
    const { playmat_url } = z.object({ playmat_url: z.string().url().nullable() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { playmat_url },
      select: { id: true, username: true, email: true, avatar_url: true, playmat_url: true },
    });
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL or server error' });
  }
};
