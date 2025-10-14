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
  amenities: any;
  id: number;
  slug: string;
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

// Load toàn bộ hotels (mock từ /public/mock/hotels.json) + filter cơ bản
export async function listHotels(params: ListParams = {}): Promise<HotelFull[]> {
  const res = await fetch("/mock/hotels.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: HotelFull[] = await res.json();

  const { q, city, min, max, stars } = params;
  return data.filter((h) => {
    const okQ =
      !q ||
      (h.name + h.city + h.country + (h.description || ""))
        .toLowerCase()
        .includes(q.toLowerCase());
    const okCity = !city || h.city.toLowerCase().includes(city.toLowerCase());
    const okMin = min == null || h.pricePerNight >= min;
    const okMax = max == null || h.pricePerNight <= max;
    const okStars = !stars || h.stars >= stars; // “từ X sao trở lên”
    return okQ && okCity && okMin && okMax && okStars;
  });
}

// Lấy 1 hotel theo slug hoặc id; trả về null nếu không thấy
async function getHotel(idOrSlug: string | number): Promise<HotelFull | null> {
  const all = await listHotels();
  const key = String(idOrSlug).toLowerCase();
  const found =
    all.find((h) => String(h.slug).toLowerCase() === key) ||
    all.find((h) => String(h.id) === key);
  return found ?? null;
}

// (tuỳ dùng) trả danh sách phòng theo hotelId
async function listRooms(hotelId: number): Promise<Room[]> {
  const h = await getHotel(hotelId);
  return h?.rooms ?? [];
}

export const hotelsService = { listHotels, getHotel, listRooms };
export type { ListParams };
