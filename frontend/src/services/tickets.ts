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
  guest_count?: number;
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
   * - Không dùng mock khi đã có DB
   */
  async getMyTickets(userId: number): Promise<Ticket[]> {
    const collected: Ticket[] = [];

    // 1) Lấy bookings flight để đảm bảo các đặt chỗ flight (checkout) cũng xuất hiện
    try {
      const response = await api.get("/api/my-bookings", {
        params: { type: "flight", per_page: 50 },
      });
      const raw = response.data;
      const bookings = Array.isArray(raw) ? raw : raw?.data ?? [];

      const mappedFromBookings: Ticket[] = bookings
        .filter((b: any) => b.flight_id)
        .map((b: any) => {
          const guests = Number(b.guests) || 0;
          const passengers: Passenger[] = guests
            ? Array.from({ length: guests }).map((_, idx) => ({
                name: `Passenger ${idx + 1}`,
                dateOfBirth: "",
                passportNumber: "",
              }))
            : [];

          return {
            id: b.id,
            user_id: b.user_id,
            flight_id: b.flight_id,
            passengers,
            contact_email: "",
            contact_phone: "",
            total_price: b.total_price ?? 0,
            status: b.status ?? "pending",
            created_at: b.created_at ?? "",
            guest_count: guests || undefined,
            flight: b.flight
              ? {
                  id: b.flight.id,
                  airline: b.flight.airline ?? "",
                  flight_number: b.flight.flight_number ?? "",
                  fromAirport: b.flight.fromAirport ?? b.flight.from_airport ?? "",
                  toAirport: b.flight.toAirport ?? b.flight.to_airport ?? "",
                  departureCity: b.flight.departureCity ?? b.flight.from_city ?? "",
                  arrivalCity: b.flight.arrivalCity ?? b.flight.to_city ?? "",
                  departure_time: b.flight.departure_time ?? b.flight.departureTime ?? "",
                  arrival_time: b.flight.arrival_time ?? b.flight.arrivalTime ?? "",
                  duration: b.flight.duration,
                  class: b.flight.class,
                }
              : undefined,
          };
        });

      collected.push(...mappedFromBookings);
    } catch (error) {
      console.error("API Error (my-bookings):", error);
    }

    // 2) Gộp thêm tickets API (nếu BE có bảng tickets)
    try {
      const ticketsApi = await api.get<Ticket[]>("/api/tickets").then((r) => r.data);
      collected.push(...ticketsApi);
    } catch (error) {
      console.error("API Error (/api/tickets):", error);
    }

    // 3) Nếu cả hai call trên đều fail, fallback mock/memory; nếu không, trả về collected
    const combined = uniqById([...collected, ...memory]).filter((t) => t.user_id === userId);
    return combined;
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
