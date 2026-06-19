'use client';

import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load token on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Verify token against /users/me
          const res = await api.get('/api/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(res.data.data.user);
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          // Redirect if not already on auth pages
          if (pathname !== '/login' && pathname !== '/register') {
            toast.error('Session expired. Please sign in again.');
            router.push('/login');
          }
        }
      } else {
        // No token, redirect to login if attempting guarded page
        if (pathname !== '/login' && pathname !== '/register') {
          router.push('/login');
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { user: userProfile, token: jwtToken } = res.data.data;

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userProfile);

      toast.success('Welcome back!', {
        description: `Signed in as ${userProfile.email}`,
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

  const register = async (email: string, password: string) => {
    try {
      const res = await api.post('/api/auth/register', { email, password });
      const { user: userProfile, token: jwtToken } = res.data.data;

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser(userProfile);

      toast.success('Account created!', {
        description: 'Welcome to Habit Shaper. Start tracking your habits!',
      });
      router.push('/');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message || 'Registration failed. Email might already be taken.'
        : 'Registration failed. Email might already be taken.';
      toast.error('Registration failed', { description: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Signed out successfully');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
