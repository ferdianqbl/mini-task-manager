'use client';

import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verify session on mount or route changes
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get('/api/users/me');
        setUser(res.data.data.user);
      } catch (err) {
        console.error('Session verification failed:', err);
        setUser(null);
        // Redirect to login if attempting to access a guarded page
        if (pathname !== '/login' && pathname !== '/register') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [pathname, router]);

  const login = async (username: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const { user: userProfile } = res.data.data;

      setUser(userProfile);

      toast.success('Welcome back!', {
        description: `Signed in as ${userProfile.username}`,
      });
      router.push('/');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message || 'Failed to sign in. Please check your credentials.'
        : 'Failed to sign in. Please check your credentials.';
      toast.error('Login failed', { description: msg });
      throw new Error(msg);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const res = await api.post('/api/auth/register', { username, password });
      const { user: userProfile } = res.data.data;

      setUser(userProfile);

      toast.success('Account created!', {
        description: 'Welcome to Mini Task Manager. Start managing your tasks!',
      });
      router.push('/');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message || 'Registration failed. Username might already be taken.'
        : 'Registration failed. Username might already be taken.';
      toast.error('Registration failed', { description: msg });
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed on backend:', err);
    }
    setUser(null);
    toast.success('Signed out successfully');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
