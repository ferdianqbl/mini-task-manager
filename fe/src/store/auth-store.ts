import { create } from 'zustand';
import axios from 'axios';
import api from '../lib/api';
import { toast } from 'sonner';

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const { user: userProfile } = res.data.data;
      set({ user: userProfile });
      toast.success('Welcome back!', {
        description: `Signed in as ${userProfile.username}`,
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message || 'Failed to sign in. Please check your credentials.'
        : 'Failed to sign in. Please check your credentials.';
      toast.error('Login failed', { description: msg });
      throw new Error(msg);
    }
  },

  register: async (username, password) => {
    try {
      const res = await api.post('/api/auth/register', { username, password });
      const { user: userProfile } = res.data.data;
      set({ user: userProfile });
      toast.success('Account created!', {
        description: 'Welcome to Mini Task Manager. Start managing your tasks!',
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message || 'Registration failed. Username might already be taken.'
        : 'Registration failed. Username might already be taken.';
      toast.error('Registration failed', { description: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed on backend:', err);
    }
    set({ user: null });
    toast.success('Signed out successfully');
  },

  loadUser: async () => {
    try {
      const res = await api.get('/api/users/me');
      set({ user: res.data.data.user });
    } catch (err) {
      console.error('Session verification failed:', err);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Backward-compatible custom hook
export function useAuth() {
  return useAuthStore();
}
