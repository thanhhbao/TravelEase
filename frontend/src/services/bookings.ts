// src/services/bookings.ts
import { getMyBookings, getBookingDetail, createBooking, cancelBooking } from "../lib/api";

/* ========= Types ========= */
export interface Booking {
  id: number;
  user_id: number;
  hotel_id?: number;
  room_id?: number;
  flight_id?: number;
  check_in?: string;
  check_out?: string;
  guests: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  type: 'hotel' | 'flight';
  created_at: string;
  updated_at: string;
  hotel?: { id: number; name: string; city: string; country: string; image?: string };
  room?: { id: number; name: string; price_per_night?: number };
  flight?: { id: number; airline: string; flight_number: string; departure_city: string; arrival_city: string; departure_time: string; arrival_time: string; price: number };
}

export interface CreateBookingPayload {
  hotel_id?: number;
  room_id?: number;
  flight_id?: number;
  check_in?: string;
  check_out?: string;
  guests: number;
  total_price: number;
}

export interface BookingsResponse {
  data: Booking[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/* ========= Service ========= */
export const bookingsService = {
  /**
   * Get user's bookings with pagination and filters
   */
  async getMyBookings(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<BookingsResponse> {
    const { data } = await getMyBookings(params);
    return data;
  },

  /**
   * Get booking detail by ID
   */
  async getBookingDetail(id: number): Promise<Booking> {
    const { data } = await getBookingDetail(id);
    return data;
  },

  /**
   * Create a new booking
   */
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const { data } = await createBooking(payload);
    return data.booking;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: number): Promise<{ message: string }> {
    const { data } = await cancelBooking(id);
    return data;
  },
};
