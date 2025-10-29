// src/services/tickets.ts
import { api } from "../lib/api"; 
/* ========= Types ========= */
export interface Passenger {
  name: string;
  dateOfBirth: string;
  passportNumber: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  flight_id: number;
  passengers: Passenger[];
  contact_email: string;
  contact_phone: string;
  total_price: number | string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  flight?: {
    id: number; // THÊM: Cần cho Link chi tiết chuyến bay
    airline: string;
    flight_number: string;
    fromAirport: string;
    toAirport: string;

    // THÊM CÁC TRƯỜNG CITY
    departureCity: string; // THÊM
    arrivalCity: string;   // THÊM

    // SỬA: Đổi tên thuộc tính thời gian (từ camelCase sang snake_case) để khớp với lỗi bạn báo
    departure_time: string; // ISO
    arrival_time: string;   // ISO

    // THÊM: duration và class từ backend
    duration?: string;
    class?: string;
  };
}

export interface CreateTicketPayload {
  flightId: number;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  totalPrice: number;
}

/* ========= In-memory fallback store ========= */
let memory: Ticket[] = [];

const uniqById = (arr: Ticket[]) => {
  const m = new Map<number, Ticket>();
  arr.forEach((x) => m.set(x.id, x));
  return Array.from(m.values());
};

/* ========= Service ========= */
export const ticketsService = {
  /**
   * Tạo vé:
   * - Ưu tiên gọi API thật: POST /api/tickets
   * - Nếu lỗi (chưa có BE, 404, 419…): tạo bản ghi tạm trong memory
   */
  async createTicket(
    payload: CreateTicketPayload & { userId?: number }
  ): Promise<Ticket> {
    try {
      const created = await api
        .post<Ticket>("/api/tickets", payload)
        .then((r) => r.data);

      memory = uniqById([...memory, created]);
      return created;
    } catch {
      const now = new Date().toISOString();
      const fake: Ticket = {
        id: Date.now(),
        user_id: payload.userId ?? 1, // hoặc lấy từ auth store
        flight_id: payload.flightId,
        passengers: payload.passengers,
        contact_email: payload.contactEmail,
        contact_phone: payload.contactPhone,
        total_price: payload.totalPrice,
        status: "pending",
        created_at: now,
      };
      memory.push(fake);
      return fake;
    }
  },

  /**
   * Lấy vé của user:
   * - Thử GET /api/tickets?userId=...
   * - Nếu lỗi → đọc mock /public/mock/tickets.json → gộp với memory
   */
  async getMyTickets(userId: number): Promise<Ticket[]> {
    try {
      const server = await api
        .get<Ticket[]>("/api/tickets")
        .then((r) => r.data);

      console.log('API Response:', server); // Debug log
      return uniqById([...server, ...memory]).filter((t) => t.user_id === userId);
    } catch (error) {
      console.error('API Error:', error); // Debug log
      try {
        // mock file không nhận query → đọc toàn bộ rồi filter
        const res = await fetch("/mock/tickets.json");
        if (!res.ok) throw new Error("mock not found");
        const mock = (await res.json()) as Ticket[];
        return uniqById([...mock, ...memory]).filter((t) => t.user_id === userId);
      } catch {
        return memory.filter((t) => t.user_id === userId);
      }
    }
  },

  /**
   * Huỷ vé:
   * - Thử POST /api/tickets/:id/cancel
   * - Nếu lỗi → cập nhật memory
   */
  async cancelTicket(ticketId: number): Promise<void> {
    try {
      await api.post(`/api/tickets/${ticketId}/cancel`, {});
      const idx = memory.findIndex((t) => t.id === ticketId);
      if (idx >= 0) memory[idx] = { ...memory[idx], status: "cancelled" };
    } catch {
      const t = memory.find((x) => x.id === ticketId);
      if (t) t.status = "cancelled";
    }
  },

  /**
   * (Tuỳ chọn) Chi tiết 1 vé:
   * - GET /api/tickets/:id
   * - Fallback: tìm trong memory
   */
  async getTicketById(ticketId: number): Promise<Ticket | null> {
    try {
      const data = await api
        .get<Ticket>(`/api/tickets/${ticketId}`)
        .then((r) => r.data);
      return data;
    } catch {
      return memory.find((t) => t.id === ticketId) ?? null;
    }
  },
};
