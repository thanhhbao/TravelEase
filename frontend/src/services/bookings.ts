// src/services/bookings.ts
import { api } from "../lib/api";

/* ========= Types ========= */
export interface Booking {
  id: number;
  userId: number;
  hotelId: number;
  roomId: number;
  checkIn: string;   // ISO string
  checkOut: string;  // ISO string
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string; // ISO
  hotel?: { name: string; city: string; country: string };
  room?: { name: string };
}

export interface CreateBookingPayload {
  hotelId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

/* ========= In-memory fallback store ========= */
let memory: Booking[] = [];

/* ========= Helpers ========= */
const uniqById = (items: Booking[]) => {
  const map = new Map<number, Booking>();
  for (const it of items) map.set(it.id, it);
  return Array.from(map.values());
};

async function loadMockJSON<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Mock not found: ${path}`);
  return res.json();
}

/* ========= Service ========= */
export const bookingsService = {
  /**
   * Tạo booking:
   * - Ưu tiên API thật: POST /api/bookings
   * - Nếu lỗi (chưa có backend): fallback tạo object tại chỗ + đẩy vào memory
   */
  async createBooking(
    payload: CreateBookingPayload & { userId?: number }
  ): Promise<Booking> {
    try {
      const { data } = await api.post<Booking>("/api/bookings", payload);
      memory = uniqById([...memory, data]);
      return data;
    } catch {
      const now = new Date().toISOString();
      const fake: Booking = {
        id: Date.now(),
        userId: payload.userId ?? 1,
        hotelId: payload.hotelId,
        roomId: payload.roomId,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        guests: payload.guests,
        totalPrice: payload.totalPrice,
        status: "pending",
        createdAt: now,
      };
      memory.push(fake);
      return fake;
    }
  },

  /**
   * Lấy booking của user:
   * - Thử GET /api/bookings?userId=...
   * - Nếu lỗi → thử đọc mock: /mock/bookings.json
   * - Luôn merge với memory
   */
  async getMyBookings(userId: number): Promise<Booking[]> {
    try {
      const { data } = await api.get<Booking[]>(
        `/api/bookings?userId=${userId}`
      );
      return uniqById([...data, ...memory]).filter((b) => b.userId === userId);
    } catch {
      try {
        const mock = await loadMockJSON<Booking[]>("/mock/bookings.json");
        return uniqById([...mock, ...memory]).filter(
          (b) => b.userId === userId
        );
      } catch {
        return memory.filter((b) => b.userId === userId);
      }
    }
  },

  /**
   * Huỷ booking:
   * - Thử POST /api/bookings/:id/cancel
   * - Nếu lỗi → update memory
   */
  async cancelBooking(bookingId: number): Promise<void> {
    try {
      await api.post(`/api/bookings/${bookingId}/cancel`, {});
      const idx = memory.findIndex((b) => b.id === bookingId);
      if (idx >= 0) memory[idx] = { ...memory[idx], status: "cancelled" };
    } catch {
      const bk = memory.find((b) => b.id === bookingId);
      if (bk) bk.status = "cancelled";
    }
  },

  /**
   * Chi tiết 1 booking:
   * - Thử GET /api/bookings/:id
   * - Fallback tìm trong memory
   */
  async getBookingById(bookingId: number): Promise<Booking | null> {
    try {
      const { data } = await api.get<Booking>(`/api/bookings/${bookingId}`);
      return data;
    } catch {
      return memory.find((b) => b.id === bookingId) ?? null;
    }
  },
};
