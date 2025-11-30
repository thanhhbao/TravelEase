// src/services/flights.ts
import { api } from "../lib/api";
export interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  fromAirport: string; // IATA
  toAirport: string;   // IATA
  departureTime: string; // ISO
  arrivalTime: string;   // ISO
  durationMin: number;
  price: number;
  seatsAvailable: number;
  logo?: string;       
}

export interface FlightSearchParams {
  from?: string;        // IATA hoặc text
  to?: string;
  departure?: string;   // YYYY-MM-DD
  return?: string;      // (nếu cần round-trip)
  airline?: string;
}

let cacheAll: Flight[] | null = null;

const fetchAllFlights = async (): Promise<Flight[]> => {
  const { data } = await api.get("/api/flights", { params: { per_page: 100 } });
  const rows = Array.isArray(data) ? data : data?.data ?? [];
  cacheAll = rows as Flight[];
  return cacheAll;
};

const sameDay = (iso: string, ymd: string) => {
  // so sánh theo local date "YYYY-MM-DD"
  const d = new Date(iso);
  const local = d.toISOString().slice(0, 10); // đủ dùng cho dev; nếu cần chính xác TZ, dùng lib dayjs
  return local === ymd;
};

export const flightsService = {
  /**
   * Tìm chuyến bay.
   * - Nếu BE support query: dùng params trong request.
   * - Nếu lỗi / chưa có BE: đọc mock rồi lọc client-side.
   */
  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    const { data } = await api.get("/api/flights", {
      params: {
        from_city: params.from,
        to_city: params.to,
        airline: params.airline,
        departure: params.departure,
        return: params.return,
        per_page: 100,
      },
    });
    const rows = Array.isArray(data) ? data : data?.data ?? [];
    const flights = rows as Flight[];
    cacheAll = flights;
    // Nếu backend chưa filter theo ngày, lọc nhẹ ở FE
    if (params.departure) {
      return flights.filter((f) => sameDay(f.departureTime, params.departure!));
    }
    return flights;
  },

  /**
   * Lấy chi tiết 1 chuyến bay.
   * - Gọi /api/flights/:id trước
   * - Fallback: tìm trong cache/mock
   */
  async getFlight(id: number): Promise<Flight> {
    const { data } = await api.get<Flight>(`/api/flights/${id}`);
    return data;
  },
};
