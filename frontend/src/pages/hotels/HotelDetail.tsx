import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Waves,
  Dumbbell,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ---------------- Fallback mock (dev offline) ---------------- */
const mockHotelData = {
  id: 1,
  name: "Grand Luxury Resort & Spa",
  slug: "grand-luxury-resort",
  city: "New York",
  country: "USA",
  stars: 5,
  rating: 4.8,
  reviews: 342,
  pricePerNight: 299,
  thumbnail:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop",
  description:
    "Experience unparalleled luxury at the Grand Luxury Resort & Spa. Nestled in the heart of New York, our resort offers breathtaking views, world-class amenities, and exceptional service.",
  amenities: ["WiFi", "Parking", "Restaurant", "Pool", "Gym", "Room Service"],
  images: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop",
  ],
  rooms: [
    {
      id: 1,
      name: "Deluxe King Room",
      beds: "1 King Bed",
      maxGuests: 2,
      price: 299,
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&auto=format&fit=crop",
      ],
      amenities: ["King Bed", "City View", "WiFi", "Mini Bar"],
    },
    {
      id: 2,
      name: "Executive Suite",
      beds: "1 King Bed + Sofa Bed",
      maxGuests: 4,
      price: 499,
      images: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&auto=format&fit=crop",
      ],
      amenities: ["King Bed", "Living Room", "Ocean View", "Balcony"],
    },
    {
      id: 3,
      name: "Presidential Suite",
      beds: "2 King Beds + Living Area",
      maxGuests: 6,
      price: 899,
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&auto=format&fit=crop",
      ],
      amenities: ["2 King Beds", "Panoramic View", "Private Terrace", "Butler Service"],
    },
  ],
} as const;

/* ---------------- Kiểu dữ liệu (khớp hotels.json) ---------------- */
type Room = {
  id: number;
  name: string;
  beds: string;
  maxGuests: number;
  price: number;
  images: string[];
  amenities?: string[];
};
type Hotel = {
  id: number;
  slug: string;
  name: string;
  city: string;
  country: string;
  stars: number;
  pricePerNight: number;
  thumbnail: string;
  description: string;
  amenities: string[];
  images?: string[];
  rating?: number;
  reviews?: number;
  rooms: Room[];
};

/* ---------------- Icon map cho amenities ---------------- */
const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  Parking: Car,
  Restaurant: Utensils,
  Pool: Waves,
  Gym: Dumbbell,
  "Room Service": Coffee,
};

/* ============================== Component ============================== */
export default function HotelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Booking form
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Comments
  type Comment = { id: string; name: string; date: string; rating: number; text: string };
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      name: "Minh Anh",
      date: "2025-03-02",
      rating: 5,
      text: "Phòng rộng, sạch và dịch vụ thân thiện. Sẽ quay lại!",
    },
    {
      id: "c2",
      name: "Hoàng Nam",
      date: "2025-02-18",
      rating: 4,
      text: "Vị trí tuyệt vời, bữa sáng ngon. Check-in hơi đông.",
    },
  ]);
  const [newComment, setNewComment] = useState({ name: "", rating: 5, text: "" });

  /* ---------------- Load theo slug (fallback về mock) ---------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        if (slug) {
          const res = await fetch("/mock/hotels.json", { cache: "no-store" });
          const list: Hotel[] = res.ok ? await res.json() : [];
          const found = list.find((h) => h.slug === slug);
          if (mounted && found) {
            const gallery = found.images?.length ? found.images : [found.thumbnail];
            const withImages = { ...found, images: gallery };
            setHotel(withImages);
            setSelectedRoom(withImages.rooms?.[0] || null);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        /* noop -> dùng fallback */
      }
      if (mounted) {
        const fallback = mockHotelData as unknown as Hotel;
        setHotel(fallback);
        setSelectedRoom(fallback.rooms?.[0] ?? null);
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  /* ---------------- Helpers ---------------- */
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const gallery = hotel?.images?.length ? hotel.images : hotel ? [hotel.thumbnail] : [];

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(1, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = selectedRoom ? selectedRoom.price * nights : hotel?.pricePerNight ?? 0;

  const goCheckout = () => {
    if (!hotel || !selectedRoom) return;
    // điều hướng tới /checkout, mang theo dữ liệu
    navigate("/checkout", {
      state: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelSlug: hotel.slug,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        checkIn: checkIn || getTodayDate(),
        checkOut: checkOut || getTomorrowDate(),
        guests,
        nights,
        pricePerNight: selectedRoom.price,
        totalPrice,
        thumbnail: selectedRoom.images?.[0] ?? hotel.images?.[0] ?? hotel.thumbnail,
        city: hotel.city,
        country: hotel.country,
      },
    });
  };

  const addComment = () => {
    if (!newComment.name.trim() || !newComment.text.trim()) return;
    const c: Comment = {
      id: crypto.randomUUID(),
      name: newComment.name.trim(),
      date: new Date().toISOString().slice(0, 10),
      rating: newComment.rating,
      text: newComment.text.trim(),
    };
    setComments((prev) => [c, ...prev]);
    setNewComment({ name: "", rating: 5, text: "" });
  };

  /* ---------------- Loading ---------------- */
  if (isLoading || !hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black/80 border-t-transparent" />
      </div>
    );
  }

  /* ============================== UI ============================== */
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <nav className="text-sm text-slate-500 flex items-center gap-2">
          <Link to="/hotels" className="hover:text-slate-800 transition-colors">
            Search
          </Link>
          <span>›</span>
          <span className="text-slate-800 font-medium">Details</span>
        </nav>
      </div>

      {/* Title row */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-4 mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          {hotel.name}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-slate-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>
              {hotel.city}, {hotel.country}
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
            {hotel.stars}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main image + thumbnails */}
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200">
              {gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${hotel.name} ${i + 1}`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = hotel.thumbnail;
                  }}
                  className={`w-full h-[420px] md:h-[460px] object-cover transition-opacity duration-300 ${
                    i === currentImageIndex ? "opacity-100" : "opacity-0 absolute inset-0"
                  }`}
                />
              ))}

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((p) => (p === 0 ? gallery.length - 1 : p - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((p) => (p === gallery.length - 1 ? 0 : p + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <button className="absolute bottom-4 right-4 bg-white/90 text-slate-900 text-sm px-4 py-1.5 rounded-full shadow">
                360° View
              </button>
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`rounded-2xl overflow-hidden border transition ${
                      i === currentImageIndex ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`thumb ${i + 1}`}
                      className="h-24 w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = hotel.thumbnail;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Location</label>
                  <div className="mt-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900">
                    {hotel.city}, {hotel.country}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">Person</label>
                  <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-2xl border border-slate-200">
                    <span className="px-1 py-1 rounded-lg text-slate-900">
                      {guests} {guests > 1 ? "Persons" : "Person"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200"
                      >
                        –
                      </button>
                      <button
                        onClick={() => setGuests((g) => Math.min(10, g + 1))}
                        className="w-8 h-8 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">Check-in</label>
                  <input
                    type="date"
                    min={getTodayDate()}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">Check-out</label>
                  <input
                    type="date"
                    min={checkIn || getTomorrowDate()}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-slate-500">Pricing per night</span>
                  <span className="text-lg font-semibold">${selectedRoom?.price ?? hotel.pricePerNight}/night</span>
                </div>

                <button
                  onClick={goCheckout}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-semibold hover:bg-slate-800 transition"
                >
                  Check availability
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* About */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">About</h2>
            <p className="text-slate-600 leading-relaxed">
              {hotel.description}
            </p>
          </div>
        </section>

        {/* Facilities */}
        <section className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Facilities</h3>
          <div className="flex flex-wrap gap-3">
            {hotel.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Star;
              return (
                <div
                  key={amenity}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-800"
                >
                  <Icon className="h-4 w-4" />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rooms (quick choose) */}
        <section className="mt-10">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Available Rooms</h3>
          <div className="grid gap-4">
            {hotel.rooms.map((room) => (
              <div
                key={room.id}
                className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4"
              >
                <img
                  src={room.images[0] || hotel.thumbnail}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = hotel.thumbnail;
                  }}
                  alt={room.name}
                  className="w-full md:w-64 h-40 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{room.name}</h4>
                      <p className="text-slate-600">{room.beds} • Up to {room.maxGuests} guests</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">${room.price}</div>
                      <div className="text-sm text-slate-500">per night</div>
                    </div>
                  </div>
                  {room.amenities?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {room.amenities.map((a, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-sm bg-slate-100">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        goCheckout();
                      }}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comments */}
        <section className="mt-12">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Comments</h3>

          {/* Add comment */}
          <div className="rounded-2xl border border-slate-200 p-4 mb-6">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Your name"
                value={newComment.name}
                onChange={(e) => setNewComment((v) => ({ ...v, name: e.target.value }))}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <select
                value={newComment.rating}
                onChange={(e) =>
                  setNewComment((v) => ({ ...v, rating: parseInt(e.target.value, 10) }))
                }
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Write your comment…"
              value={newComment.text}
              onChange={(e) => setNewComment((v) => ({ ...v, text: e.target.value }))}
              className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              rows={3}
            />
            <div className="mt-3">
              <button
                onClick={addComment}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800"
              >
                Post comment
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-500">{c.date}</div>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < c.rating ? "text-yellow-500 fill-yellow-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-slate-700">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
