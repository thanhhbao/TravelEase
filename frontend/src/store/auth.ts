import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken } from '../lib/api';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  bootstrap: () => Promise<void>;
  updateProfile: (data: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      async login(token) {
        localStorage.setItem('auth_token', token);
        setAuthToken(token);
        try {
          const res = await api.get('/user');
          set({
            user: res.data,
            token,
            isAuthenticated: true,
          });
        } catch (err) {
          console.error('Login bootstrap failed', err);
        }
      },

      logout() {
        localStorage.removeItem('auth_token');
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      async bootstrap() {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        setAuthToken(token);
        try {
          const res = await api.get('/user');
          set({
            user: res.data,
            token,
            isAuthenticated: true,
          });
        } catch (err) {
          console.error('❌ Bootstrap failed:', err);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateProfile(data) {
        set(state => ({
          user: { ...state.user, ...data }
        }));
      },
    }),
    {
      name: 'auth-storage', // key trong localStorage
    }
  )
);
