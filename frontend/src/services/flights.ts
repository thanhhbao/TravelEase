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
  try {
    // Ưu tiên BE thật: GET /api/flights (có thể truyền query ở ngoài)
    const { data } = await api.get<Flight[]>("/api/flights");
    cacheAll = data;
    return data;
  } catch {
    // Fallback mock: /public/mock/flights.json
    const res = await fetch("/mock/flights.json");
    if (!res.ok) throw new Error("Cannot load flights mock");
    const mock = (await res.json()) as Flight[];
    cacheAll = mock;
    return mock;
  }
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
    // thử gọi BE với params trước
    try {
      const { data } = await api.get<Flight[]>("/api/flights", { params });
      cacheAll = data;
      return data;
    } catch {
      // fallback: mock + lọc client
      const flights = cacheAll ?? (await fetchAllFlights());

      return flights.filter((f) => {
        if (params.from && !f.fromAirport.toLowerCase().includes(params.from.toLowerCase())) {
          return false;
        }
        if (params.to && !f.toAirport.toLowerCase().includes(params.to.toLowerCase())) {
          return false;
        }
        if (params.airline && !f.airline.toLowerCase().includes(params.airline.toLowerCase())) {
          return false;
        }
        if (params.departure && !sameDay(f.departureTime, params.departure)) {
          return false;
        }
        // params.return: tuỳ bạn implement round-trip, ở đây bỏ qua
        return true;
      });
    }
  },

  /**
   * Lấy chi tiết 1 chuyến bay.
   * - Gọi /api/flights/:id trước
   * - Fallback: tìm trong cache/mock
   */
  async getFlight(id: number): Promise<Flight> {
    try {
      const { data } = await api.get<Flight>(`/api/flights/${id}`);
      return data;
    } catch {
      const flights = cacheAll ?? (await fetchAllFlights());
      const found = flights.find((f) => f.id === id);
      if (!found) throw new Error("Flight not found");
      return found;
    }
  },
};
