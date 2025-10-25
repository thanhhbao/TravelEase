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
  userId: number;
  flightId: number;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  flight?: {
    id: number; // THÊM: Cần cho Link chi tiết chuyến bay
    airline: string;
    flightNumber: string;
    fromAirport: string;
    toAirport: string;

    // THÊM CÁC TRƯỜNG CITY
    departure_city: string; // THÊM
    arrival_city: string;   // THÊM

    // SỬA: Đổi tên thuộc tính thời gian (từ camelCase sang snake_case) để khớp với lỗi bạn báo
    departure_time: string; // ISO
    arrival_time: string;   // ISO
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
        userId: payload.userId ?? 1, // hoặc lấy từ auth store
        flightId: payload.flightId,
        passengers: payload.passengers,
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        totalPrice: payload.totalPrice,
        status: "pending",
        createdAt: now,
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
        .get<Ticket[]>("/api/tickets", { params: { userId } })
        .then((r) => r.data);

      return uniqById([...server, ...memory]).filter((t) => t.userId === userId);
    } catch {
      try {
        // mock file không nhận query → đọc toàn bộ rồi filter
        const res = await fetch("/mock/tickets.json");
        if (!res.ok) throw new Error("mock not found");
        const mock = (await res.json()) as Ticket[];
        return uniqById([...mock, ...memory]).filter((t) => t.userId === userId);
      } catch {
        return memory.filter((t) => t.userId === userId);
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
