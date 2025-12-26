import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export const useSocket = (gameId: string | null) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [sock, setSock] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !gameId) return;
    console.log('[useSocket] init', { gameId, userId: user.id });

    // Get current access token
    let token = axios.defaults.headers.common['Authorization']?.toString().split(' ')[1];
    const ensureToken = async () => {
      if (!token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
          if (res.data?.accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
            token = res.data.accessToken;
          }
        } catch {}
      }
    };

    (async () => {
      await ensureToken();
      console.log('[useSocket] token ready?', { hasToken: !!token });
      if (!token) return;

      const primaryUrl = (import.meta.env as any).VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
      let urlToUse = primaryUrl;
      console.log('[useSocket] connecting', { url: urlToUse, gameId });
      let socket = urlToUse ? io(urlToUse, { auth: { token }, withCredentials: true }) : io({ auth: { token }, withCredentials: true });

      socket.on('connect', () => {
        console.log('[useSocket] connected', { socketId: socket.id, gameId });
        setIsConnected(true);
        console.log('[useSocket] emit game:join');
        socket.emit('game:join', { gameId });
      });

      socket.on('disconnect', (reason) => {
        console.log('[useSocket] disconnected', { reason });
        setIsConnected(false);
      });
      socket.on('connect_error', (err) => {
        console.log('[useSocket] connect_error', { message: err.message });
        // Fallback: if URL es relativo, intenta backend por defecto
        if (urlToUse?.startsWith('/')) {
          const fallback = 'http://localhost:30007';
          console.log('[useSocket] retry with fallback url', { fallback });
          socket.disconnect();
          socket = io(fallback, { auth: { token }, withCredentials: true });
          socket.on('connect', () => {
            console.log('[useSocket] connected (fallback)', { socketId: socket.id });
            setIsConnected(true);
            console.log('[useSocket] emit game:join (fallback)');
            socket.emit('game:join', { gameId });
          });
          socket.on('disconnect', (reason) => {
            console.log('[useSocket] disconnected (fallback)', { reason });
            setIsConnected(false);
          });
          socket.on('connect_error', (e2) => {
            console.log('[useSocket] connect_error (fallback)', { message: e2.message });
          });
          socketRef.current = socket;
          setSock(socket);
        }
      });

      socketRef.current = socket;
      setSock(socket);

      return () => {
        console.log('[useSocket] cleanup, disconnect');
        socket.disconnect();
        setSock(null);
      };
    })();
  }, [gameId, user]);

  return { socket: sock, isConnected };
};
