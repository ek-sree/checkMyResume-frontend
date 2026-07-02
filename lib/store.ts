import { create } from 'zustand';
import { api } from './api';
import type { User } from './types';


interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ needsVerification: boolean; email: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  bootstrap: async () => {
    try {
      const { user } = await api.me();
      set({ user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      const { user } = await api.me();
      set({ user });
    } catch {
      set({ user: null });
    }
  },

  login: async (email, password) => {
    const { user } = await api.login({ email, password });
    set({ user });
  },

  register: async (name, email, password) => {
    return api.register({ name, email, password });
  },

  verifyOtp: async (email, code) => {
    const { user } = await api.verifyOtp(email, code);
    set({ user });
  },

  loginWithGoogle: async (idToken) => {
    const { user } = await api.google(idToken);
    set({ user });
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    set({ user: null });
  },
}));
