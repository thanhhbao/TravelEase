import { api } from "../lib/api";
// src/services/hotels.ts

export type Room = {
  id: number;
  name: string;
  beds: string;
  maxGuests: number;
  price: number;
  images: string[];
};

export type Hotel = {
  amenities?: string[];
  id: number;
  slug?: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  pricePerNight: number;
  thumbnail: string;
  description: string;
  images?: string[]; 
};

export type HotelFull = Hotel & {
  amenities?: string[];
  rooms: Room[];
};

type ListParams = {
  q?: string;
  city?: string;
  min?: number;
  max?: number;
  stars?: number;
};

// Load hotels từ API (DB)
export async function listHotels(params: ListParams = {}): Promise<HotelFull[]> {
  const { q, city, min, max, stars } = params;
  const query = {
    name: q,
    city,
    min_price: min,
    max_price: max,
    stars,
    per_page: 200,
  };
  const { data } = await api.get("/api/hotels", { params: query });
  const rows = Array.isArray(data) ? data : data?.data ?? [];
  return (rows as any[]).map((raw) => ({
    ...raw,
    slug: raw.slug ?? undefined,
    pricePerNight: raw.pricePerNight ?? raw.price_per_night ?? 0,
    thumbnail: raw.thumbnail ?? raw.images?.[0] ?? "",
  })) as HotelFull[];
}

// Lấy 1 hotel theo slug hoặc id; trả về null nếu không thấy
async function getHotel(idOrSlug: string | number): Promise<HotelFull | null> {
  const key = String(idOrSlug);
  // Nếu là số -> gọi thẳng /api/hotels/{id}
  if (!Number.isNaN(Number(key))) {
    try {
      const { data } = await api.get(`/api/hotels/${key}`);
      return data as HotelFull;
    } catch {
      return null;
    }
  }

  // Nếu là slug -> thử tìm theo name chứa slug
  try {
    const { data } = await api.get("/api/hotels", { params: { name: key, per_page: 1 } });
    const rows = Array.isArray(data) ? data : data?.data ?? [];
    return (rows as HotelFull[])[0] ?? null;
  } catch {
    return null;
  }
}

// (tuỳ dùng) trả danh sách phòng theo hotelId
async function listRooms(hotelId: number): Promise<Room[]> {
  const h = await getHotel(hotelId);
  return h?.rooms ?? [];
}

export const hotelsService = { listHotels, getHotel, listRooms };
export type { ListParams };
