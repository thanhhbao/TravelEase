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

const updateAuthHeader = (headers: unknown, value: string | null) => {
  if (!headers) return;

  const maybeHeaders = headers as AxiosHeaders & Record<string, unknown> & {
    delete?: (name: string) => void;
  };

  if (typeof maybeHeaders.set === "function") {
    if (value) {
      maybeHeaders.set("Authorization", value);
    } else {
      maybeHeaders.delete?.("Authorization");
    }
    return;
  }

  if (typeof maybeHeaders === "object") {
    if (value) {
      (maybeHeaders as Record<string, string>)["Authorization"] = value;
    } else {
      delete (maybeHeaders as Record<string, string>)["Authorization"];
    }
  }
};

export function setAuthToken(token: string | null) {
  authToken = token;

  if (token) {
    if (storage) storage.setItem(TOKEN_KEY, token);
    const bearer = `Bearer ${token}`;
    updateAuthHeader(api.defaults.headers, bearer);
    updateAuthHeader(api.defaults.headers.common, bearer);
  } else {
    if (storage) storage.removeItem(TOKEN_KEY);
    updateAuthHeader(api.defaults.headers, null);
    updateAuthHeader(api.defaults.headers.common, null);
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
    const bearer = `Bearer ${token}`;
    const headers = cfg.headers ?? new AxiosHeaders();
    updateAuthHeader(headers, bearer);
    cfg.headers = headers;
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
  code: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => api.post("/api/reset-password", payload);

export const resendEmailVerification = () =>
  api.post("/api/email/verification-notification");

export const verifyEmailCode = (payload: { email: string; code: string }) =>
  api.post("/api/email/verify-code", payload);

export const updateProfileApi = (payload: FormData) =>
  api.postForm("/api/user/profile?_method=PUT", payload);

export const requestPasswordChangeCode = () =>
  api.post("/api/user/password/code");

export const changePassword = (payload: {
  code: string;
  password: string;
  password_confirmation: string;
}) => api.post("/api/user/password", payload);

export const requestAccountDeletionCode = () =>
  api.post("/api/user/delete/code");

export const deleteAccount = (payload: { code: string }) =>
  api.post("/api/user/delete", payload);

/* =====================================================
 * ================ CONTACT SUPPORT ===================
 * ===================================================== */

export const contactSupport = (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => api.post("/api/contact", payload);

/* =====================================================
 * ==================== BOOKINGS ======================
 * ===================================================== */

export const getMyBookings = (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  type?: string;
  search?: string;
}) => api.get("/api/my-bookings", { params });

export const getBookingDetail = (id: number) => api.get(`/api/my-bookings/${id}`);

export const createBooking = (payload: {
  hotel_id?: number;
  room_id?: number;
  flight_id?: number;
  check_in?: string;
  check_out?: string;
  guests: number;
  total_price: number;
  currency?: string;
  payment_intent_id?: string;
}) => api.post("/api/my-bookings", payload);

export const cancelBooking = (id: number) => api.post(`/api/my-bookings/${id}/cancel`);

export const createPaymentIntent = (payload: {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  amount_in_minor?: boolean;
}) => api.post("/api/payments/intent", payload);

/** Khởi động: nếu trong localStorage đã có token thì gắn vào header ngay */
(() => {
  const token = getAuthToken();
  if (token) {
    const bearer = `Bearer ${token}`;
    updateAuthHeader(api.defaults.headers, bearer);
    updateAuthHeader(api.defaults.headers.common, bearer);
  }
})();
