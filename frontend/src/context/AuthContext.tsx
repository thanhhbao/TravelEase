import React, { createContext, useContext, useEffect, useState } from "react";
import { me, login as apiLogin, logout as apiLogout, register as apiRegister, getAuthToken, setAuthToken } from "../lib/api";

type User = { id: number; name: string; email: string; email_verified_at: string | null };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    // If there is no stored token, avoid calling the /api/user endpoint
    // to prevent noisy 401 responses from the backend.
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const login = async (email: string, password: string) => {
    await apiLogin({ email, password });
    await refresh();
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    await apiRegister({ name, email, password, password_confirmation });
    await refresh();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
