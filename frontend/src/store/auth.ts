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
  verifyEmailCode as apiVerifyEmailCode,
  updateProfileApi,
  requestPasswordChangeCode as apiRequestPasswordCode,
  changePassword as apiChangePassword,
  requestAccountDeletionCode as apiRequestAccountDeletionCode,
  deleteAccount as apiDeleteAccount,
  API_BASE_URL,
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
  location?: string | null;
  tier?: string | null;
  points?: number | null;
  stats?: {
    trips?: number;
    favorites?: number;
    reviews?: number;
  } | null;
  role?: UserRole;
  roles?: UserRole[];
  permissions?: string[];
  hostStatus?: HostStatus;
  capabilities?: UserCapabilities;
}

export type UserRole = "admin" | "traveler" | "host";
export type HostStatus = "not_registered" | "pending" | "approved" | "rejected";

export type UserCapabilities = {
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canPostListings: boolean;
  canPublishListings: boolean;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;

  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;

  updateProfile: (updates: {
    name?: string;
    email?: string;
    phone?: string | null;
    location?: string | null;
    avatarFile?: File | null;
  }) => Promise<User>;

  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (p: { email: string; code: string; password: string }) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<{ requiresVerification?: boolean; email?: string } | void>;
  requestPasswordChangeCode: () => Promise<void>;
  changePassword: (payload: {
    code: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  requestAccountDeletionCode: () => Promise<void>;
  deleteAccount: (payload: { code: string }) => Promise<void>;
  patchUser: (updates: Partial<User>) => void;
  setUserRole: (role: UserRole) => void;
  setHostStatus: (status: HostStatus) => void;
};

const resolveAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  let origin = API_BASE_URL;
  try {
    const parsed = new URL(API_BASE_URL);
    origin = parsed.origin;
  } catch {
    // fallback: strip trailing slash
    origin = API_BASE_URL.replace(/\/$/, "");
  }

  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
};

const withNormalizedAvatar = (user: User | null): User | null => {
  if (!user) return null;
  return { ...user, avatar: resolveAvatarUrl(user.avatar) ?? undefined };
};

const uniqueRoles = (roles: UserRole[]) => Array.from(new Set(roles));

const detectFallbackRole = (user: User): UserRole => {
  if (user.role) return user.role;
  if (user.roles?.length) return user.roles[0];
  const isAdminLike = user.email?.endsWith("@travelease.com");
  return isAdminLike ? "admin" : "traveler";
};

const buildPermissions = (roles: UserRole[], hostStatus: HostStatus) => {
  const perms = new Set<string>(["dashboard.view", "profile.update"]);

  if (roles.includes("admin")) {
    perms.add("admin.access");
    perms.add("users.manage");
    perms.add("listings.review");
    perms.add("listings.publish");
  }

  if (roles.includes("host") || hostStatus === "approved") {
    perms.add("listings.create");
    perms.add("listings.manage");
  }

  if (hostStatus === "pending") {
    perms.add("host.apply");
  }

  return Array.from(perms);
};

const buildCapabilities = (permissions: string[]): UserCapabilities => ({
  canAccessAdmin: permissions.includes("admin.access"),
  canManageUsers: permissions.includes("users.manage"),
  canPostListings: permissions.includes("listings.create"),
  canPublishListings: permissions.includes("listings.publish"),
});

const withUserMetadata = (user: User | null): User | null => {
  if (!user) return null;

  const avatarReady = withNormalizedAvatar(user);
  if (!avatarReady) return null;
  const role = detectFallbackRole(avatarReady);
  const roles = avatarReady.roles?.length
    ? uniqueRoles([role, ...avatarReady.roles])
    : [role];
  const hostStatus =
    avatarReady.hostStatus ?? (roles.includes("host") ? "approved" : "not_registered");
  const permissions =
    avatarReady.permissions?.length ?? false
      ? avatarReady.permissions!
      : buildPermissions(roles, hostStatus);
  const capabilities = avatarReady.capabilities ?? buildCapabilities(permissions);

  return {
    ...avatarReady,
    role,
    roles,
    hostStatus,
    permissions,
    capabilities,
  };
};

const normalizeUser = (user: User | null) => withUserMetadata(user);

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

        set({ isBootstrapping: true });

        try {
          const { data } = await me();
          const normalized = normalizeUser(data as User);
          set({ user: normalized, isAuthenticated: true, isBootstrapping: false });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            setAuthToken(null);
            set({ user: null, isAuthenticated: false, isBootstrapping: false });
          } else {
            set({ user: null, isAuthenticated: false, isBootstrapping: false });
          }
        }
      },

      /* Login: backend trả { user, token } */
      login: async (email, password) => {
        const { user, token } = await apiLogin({ email, password });
        if (token) setAuthToken(token);

        try {
          const { data } = await me();
          const normalized = normalizeUser(data as User);
          set({ user: normalized, isAuthenticated: true, isBootstrapping: false });
        } catch {
          const decorated = normalizeUser(user ?? null);
          set({ user: decorated, isAuthenticated: Boolean(decorated), isBootstrapping: false });
        }
      },

      /* Register: backend trả { user, token } */
      register: async (name, email, password) => {
        const response = await apiRegister({
          name,
          email,
          password,
          password_confirmation: password,
        });

        const token = (response as { token?: string }).token;
        if (token) {
          setAuthToken(token);

          try {
          const { data } = await me();
          const normalized = normalizeUser(data as User);
          set({ user: normalized, isAuthenticated: true, isBootstrapping: false });
        } catch {
          const fallbackUser = (response as { user?: User }).user ?? null;
          const normalizedFallback = normalizeUser(fallbackUser);
          set({ user: normalizedFallback, isAuthenticated: Boolean(normalizedFallback), isBootstrapping: false });
        }

          return;
        }

        set({ user: null, isAuthenticated: false, isBootstrapping: false });
        setAuthToken(null);

        const requiresVerification = Boolean((response as { requires_email_verification?: boolean }).requires_email_verification);
        const registeredEmail = (response as { email?: string }).email ?? email;

        return requiresVerification ? { requiresVerification: true, email: registeredEmail } : undefined;
      },

      /* Logout */
      logout: async () => {
        set({ user: null, isAuthenticated: false, isBootstrapping: false });

        const token = getAuthToken();
        if (!token) {
          setAuthToken(null);
          return;
        }

        try {
          await apiLogout();
        } catch (error) {
          if (
            axios.isAxiosError(error) &&
            error.response?.status !== 401
          ) {
            console.error("Failed to call logout endpoint", error);
          }
        } finally {
          setAuthToken(null);
        }
      },

      /* Update profile (via API) */
      updateProfile: async ({ avatarFile, ...updates }) => {
        const { user } = get();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const formData = new FormData();

        (["name", "email", "phone", "location"] as const).forEach((field) => {
          const value = updates[field];
          if (value !== undefined) {
            const normalized = typeof value === "string" ? value.trim() : value;
            formData.append(field, normalized ?? "");
          }
        });

        if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        const { data } = await updateProfileApi(formData);
        const updatedUser = normalizeUser(data?.user as User | null);
        if (!updatedUser) {
          throw new Error("Profile update did not return user data");
        }

        set({
          user: updatedUser,
          isAuthenticated: true,
        });

        return updatedUser;
      },

      /* Forgot / Reset / Resend verify */
      forgotPassword: async (email) => {
        await apiForgotPassword(email);
      },
      resetPassword: async ({ email, code, password }) => {
        await apiResetPassword({
          code,
          email,
          password,
          password_confirmation: password,
        });
      },
      resendEmailVerification: async () => {
        await apiResendVerify();
      },
      verifyEmail: async (email, code) => {
        const { data } = await apiVerifyEmailCode({ email, code });
        const verifiedUser = data?.user as User | undefined;

        if (verifiedUser) {
          const existingUser = get().user;
          const merged = existingUser
            ? { ...existingUser, ...verifiedUser }
            : verifiedUser;
          const decorated = normalizeUser(merged ?? null);
          set({
            user: decorated,
            isAuthenticated: true,
          });
          return decorated;
        }

        const existing = get().user;
        if (existing && existing.email === email) {
          const updated = normalizeUser({ ...existing, email_verified_at: new Date().toISOString() });
          set({ user: updated });
          return updated;
        }

        return null;
      },
      requestPasswordChangeCode: async () => {
        await apiRequestPasswordCode();
      },
      changePassword: async ({ code, password, password_confirmation }) => {
        await apiChangePassword({ code, password, password_confirmation });
      },
      requestAccountDeletionCode: async () => {
        await apiRequestAccountDeletionCode();
      },
      deleteAccount: async ({ code }) => {
        await apiDeleteAccount({ code });

        set({ user: null, isAuthenticated: false });
        setAuthToken(null);
      },
      patchUser: (updates) => {
        set((state) => {
          if (!state.user) return state;
          const merged = normalizeUser({ ...state.user, ...updates });
          return { ...state, user: merged };
        });
      },
      setUserRole: (role) => {
        set((state) => {
          if (!state.user) return state;
          const existingRoles = state.user.roles ?? [];
          const roles = uniqueRoles([role, ...existingRoles]);
          const hostStatus =
            role === "host" && state.user.hostStatus !== "approved"
              ? "approved"
              : state.user.hostStatus;
          const merged = normalizeUser({ ...state.user, role, roles, hostStatus });
          return { ...state, user: merged };
        });
      },
      setHostStatus: (status) => {
        set((state) => {
          if (!state.user) return state;
          const merged = normalizeUser({ ...state.user, hostStatus: status });
          return { ...state, user: merged };
        });
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
