import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';
import { User } from '../services/types';
import { loginAPI, registerAPI, logoutAPI, getMeAPI } from '../services/auth';

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
      const userProfile = await loginAPI(username, password);
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
      const userProfile = await registerAPI(username, password);
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
      await logoutAPI();
    } catch (err) {
      console.error('Logout failed on backend:', err);
    }
    set({ user: null });
    toast.success('Signed out successfully');
  },

  loadUser: async () => {
    try {
      const userProfile = await getMeAPI();
      set({ user: userProfile });
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
