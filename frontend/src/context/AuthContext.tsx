import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  playmat_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
        await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch(e){}
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token or check local storage
        // Since we store access token in memory (recommended), on refresh we need to hit /refresh endpoint
        // But for MVP we might store in localStorage for persistence across reloads if refresh fails?
        // Requirement says: "Refresh token en cookie httpOnly". So we call /refresh to get new access token.
        
        // However, we don't have the access token yet.
        // We call /auth/refresh endpoint which uses cookie.
        const res = await axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
        const { accessToken } = res.data;
        if (accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            // Get user info
            const meRes = await axios.get(`${API_BASE_URL}/auth/me`);
            setUser(meRes.data.user);
            
            // Setup silent refresh (every 14 mins)
            setInterval(async () => {
                try {
                    const r = await axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
                    axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.accessToken}`;
                } catch (e) {
                    logout();
                }
            }, 14 * 60 * 1000);
        }
      } catch (error) {
        // Not logged in
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [logout]);

  const login = (token: string, user: User) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
