// src/lib/api.ts
import axios, { AxiosError, AxiosHeaders } from "axios";

/** -------- Base URL -------- */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/** -------- Axios instance (Bearer token) -------- */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: new AxiosHeaders({
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  }),
  // withCredentials: false  // KHÔNG dùng cookie, ta dùng Bearer token
});

/** -------- Token helpers -------- */
const TOKEN_KEY = "auth_token";
const hasWindow = typeof window !== "undefined";
const storage = hasWindow ? window.localStorage : null;

let authToken: string | null = null;

const readStoredToken = () => (storage ? storage.getItem(TOKEN_KEY) : null);

export function setAuthToken(token: string | null) {
  authToken = token;

  if (token) {
    if (storage) storage.setItem(TOKEN_KEY, token);
    (api.defaults.headers as AxiosHeaders).set(
      "Authorization",
      `Bearer ${token}`
    );
  } else {
    if (storage) storage.removeItem(TOKEN_KEY);
    (api.defaults.headers as AxiosHeaders).delete("Authorization");
  }
}

export function getAuthToken() {
  if (authToken) return authToken;
  authToken = readStoredToken();
  return authToken;
}

/** Gắn Authorization trước mỗi request */
api.interceptors.request.use((cfg) => {
  const token = getAuthToken();
  if (token) {
    if (!cfg.headers) cfg.headers = new AxiosHeaders();
    (cfg.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return cfg;
});

/** Nếu 401 → xoá token phía client để FE chuyển về login */
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(err);
  }
);

/* =====================================================
 * ================ AUTH (token-based) =================
 * ===================================================== */

/** Lấy user hiện tại (cần Bearer token) */
export const me = () => api.get("/api/user");

/** Đăng ký -> backend trả { user, token } */
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

/** Đăng nhập -> backend trả { user, token } */
export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post("/api/login", payload);

  if (data?.token) setAuthToken(data.token);
  return data;
};

/** Đăng xuất: best-effort; luôn xoá token local */
export const logout = async () => {
  try {
    await api.post("/api/logout");
  } finally {
    setAuthToken(null);
  }
};

/* =====================================================
 * ======= Password reset & Email verification =========
 * ===================================================== */

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

/** Khởi động: nếu trong localStorage đã có token thì gắn vào header ngay */
(() => {
  const token = getAuthToken();
  if (token) {
    (api.defaults.headers as AxiosHeaders).set(
      "Authorization",
      `Bearer ${token}`
    );
  }
})();
