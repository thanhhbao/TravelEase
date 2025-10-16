import axios, { AxiosError, AxiosHeaders } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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

api.interceptors.request.use((cfg) => {
  const token = getAuthToken() || localStorage.getItem(TOKEN_KEY);
  if (token) {
    cfg.headers = cfg.headers || new AxiosHeaders();
    cfg.headers.set("Authorization", `Bearer ${token}`);
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      setAuthToken(null);
      console.warn("Unauthorized request, token cleared");
    }
    return Promise.reject(err);
  }
);

export const me = () => api.get("/user");

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  const { data } = await api.post("/register", payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await api.post("/login", payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } finally {
    setAuthToken(null);
  }
};

export const forgotPassword = (email: string) =>
  api.post("/forgot-password", { email });

export const resetPassword = (payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => api.post("/reset-password", payload);

export const resendEmailVerification = () =>
  api.post("/email/verification-notification");

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

export default api;