// src/store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  me,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  resendEmailVerification as apiResendVerify,
  setAuthToken,
} from "../lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone?: string | null;
  avatar?: string | null;
}

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  updateProfile: (updates: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (p: { email: string; token: string; password: string }) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isBootstrapping: true,

      bootstrap: async () => {
        try {
          const token = localStorage.getItem("auth_token");
          if (token) {
            setAuthToken(token);
            const { data } = await me();
            set({ user: data as User, token, isAuthenticated: true, isBootstrapping: false });
          } else {
            set({ isBootstrapping: false });
          }
        } catch {
          setAuthToken(null);
          set({ user: null, token: null, isAuthenticated: false, isBootstrapping: false });
        }
      },

      login: async (email, password) => {
        const { user, token } = await apiLogin({ email, password });
        setAuthToken(token);
        set({ user, token, isAuthenticated: true });
      },

      register: async (name, email, password) => {
        const { user, token } = await apiRegister({
          name,
          email,
          password,
          password_confirmation: password,
        });
        setAuthToken(token);
        set({ user, token, isAuthenticated: true });
      },

      logout: async () => {
        await apiLogout();
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },

      forgotPassword: async (email) => {
        await apiForgotPassword(email);
      },
      resetPassword: async ({ email, token, password }) => {
        await apiResetPassword({
          token,
          email,
          password,
          password_confirmation: password,
        });
      },
      resendEmailVerification: async () => {
        await apiResendVerify();
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
