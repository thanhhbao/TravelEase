// src/store/auth.ts
import axios from "axios";
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
  getAuthToken,
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
  isAuthenticated: boolean;
  isBootstrapping: boolean;

  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;

  updateProfile: (updates: Partial<User>) => Promise<void>;

  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (p: { email: string; token: string; password: string }) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
};


export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isBootstrapping: true,

      /* Load user bằng token khi app mở */
      bootstrap: async () => {
        const token = getAuthToken();
        if (!token) {
          set({ isBootstrapping: false });
          return;
        }

        try {
          const { data } = await me();
          set({ user: data as User, isAuthenticated: true, isBootstrapping: false });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            setAuthToken(null);
            set({ user: null, isAuthenticated: false, isBootstrapping: false });
          } else {
            set({ isBootstrapping: false });
          }
        }
      },

      /* Login: backend trả { user, token } */
      login: async (email, password) => {
        const { user } = await apiLogin({ email, password });
        set({ user, isAuthenticated: true });
      },

      /* Register: backend trả { user, token } */
      register: async (name, email, password) => {
        const { user } = await apiRegister({
          name,
          email,
          password,
          password_confirmation: password,
        });
        set({ user, isAuthenticated: true });
      },

      /* Logout */
      logout: async () => {
        try {
          await apiLogout();
        } finally {
          setAuthToken(null);
          set({ user: null, isAuthenticated: false });
        }
      },

      /* Update profile (local) */
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },

      /* Forgot / Reset / Resend verify */
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
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
