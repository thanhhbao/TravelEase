// src/lib/api.ts
import axios, { AxiosHeaders, AxiosError } from "axios";

/** -------- Base URL -------- */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/** -------- Axios instance -------- */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: new AxiosHeaders({
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
});

const TOKEN_KEY = "auth_token";
let authToken: string | null = null;

/** -------- Token helpers -------- */
export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
  }
}

export function getAuthToken() {
  return authToken;
}

/** -------- Interceptors -------- */
api.interceptors.request.use((cfg) => {
  const token = getAuthToken() || localStorage.getItem(TOKEN_KEY);
  if (token) {
    cfg.headers = cfg.headers || {};
    (cfg.headers as any).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(err);
  }
);

/** -------- API AUTH -------- */
export const me = () => api.get("/api/user");

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  const { data } = await api.post("/api/register", payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post("/api/login", payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const logout = async () => {
  try {
    await api.post("/api/logout");
  } finally {
    setAuthToken(null);
  }
};

export const forgotPassword = (email: string) =>
  api.post("/api/forgot-password", { email });

export const resetPassword = (payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => api.post("/api/reset-password", payload);

export const resendEmailVerification = () =>
  api.post("/api/email/verification-notification");

/** -------- Init on app load -------- */
(() => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      authToken = token;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Init token error", e);
  }
})();
