import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  MapPin,
  Calendar,
  User,
  Star,
  ArrowRight,
  Plane,
  Anchor,
  Ship,
  Sparkles,
  Gift,
  CreditCard,
  Flame,
  Sun,
  AlarmClock,
  Globe2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AIRPORTS } from "../data/airports";

// --- Types ---
type FeaturedHotel = {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  amenities: string[];
};

type Testimonial = {
  id: number;
  name: string;
  rating: number;
  text: string;
  image: string;
};

type Destination = {
  city: string;
  country: string;
  description?: string;
};

type SuggestionItem =
  | { kind: "destination"; label: string; value: string; secondary?: string }
  | { kind: "airport"; label: string; value: string; secondary?: string; code: string };

type HotDeal = {
  id: number;
  title: string;
  discount: number;
  copy: string;
  gradient: string;
  icon: LucideIcon;
  perks: string[];
};

type PaymentBanner = {
  id: string;
  badge: string;
  title: string;
  description: string;
  stat: string;
  gradient: string;
  icon: LucideIcon;
};

// --- Mock Data ---
const mockHotels: FeaturedHotel[] = [
  {
    id: 1,
    name: "Grand Luxury Resort",
    location: "Bali, Indonesia",
    rating: 4.8,
    reviews: 342,
    price: 299,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop",
    amenities: ["Pool", "Spa", "Restaurant"],
  },
  {
    id: 2,
    name: "Ocean View Paradise",
    location: "Maldives",
    rating: 4.9,
    reviews: 521,
    price: 450,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop",
    amenities: ["Beach", "Diving", "Spa"],
  },
  {
    id: 3,
    name: "Mountain Peak Lodge",
    location: "Swiss Alps",
    rating: 4.7,
    reviews: 287,
    price: 380,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop",
    amenities: ["Ski", "Sauna", "Restaurant"],
  },
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Caesar Marcio",
    rating: 4.5,
    text: "Outstanding service and beautiful accommodations. Highly recommend!",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Luis Many",
    rating: 4.7,
    text: "The best booking experience I've ever had. Everything was perfect!",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
  },
];

const POPULAR_DESTINATIONS: Destination[] = [
  {
    city: "Da Nang",
    country: "Vietnam",
    description: "Beachfront city with easy access to Hoi An",
  },
  {
    city: "Nha Trang",
    country: "Vietnam",
    description: "Coastal escape known for diving and island tours",
  },
  {
    city: "Phuket",
    country: "Thailand",
    description: "Vibrant nightlife and turquoise bays",
  },
  {
    city: "Bali",
    country: "Indonesia",
    description: "Clifftop resorts and cultural temples",
  },
  {
    city: "Maldives",
    country: "Maldives",
    description: "Overwater villas and private lagoons",
  },
  {
    city: "Santorini",
    country: "Greece",
    description: "Iconic caldera sunsets and whitewashed towns",
  },
  {
    city: "Honolulu",
    country: "United States",
    description: "Gateway to the Hawaiian islands",
  },
  {
    city: "Gold Coast",
    country: "Australia",
    description: "Surf beaches and coastal hinterland",
  },
];

const TRENDING_DESTINATIONS = [
  {
    id: 1,
    title: "Kyoto, Japan",
    description: "Maple foliage, serene temples, and traditional ryokans",
    image:
"https://images.unsplash.com/photo-1669612803668-2b2a770f9890?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774"  },
  {
    id: 2,
    title: "Amalfi Coast, Italy",
    description: "Cliffside villas, lemon groves, and Mediterranean sunsets",
    image:
"https://images.unsplash.com/photo-1561956021-947f09ae0101?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774"  },
  {
    id: 3,
    title: "Queenstown, New Zealand",
    description: "Adventure capital with alpine lakes and starry skies",
    image:
"https://plus.unsplash.com/premium_photo-1661882021629-2b0888d93c94?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2064"  },
];

const HOT_DEALS: HotDeal[] = [
  {
    id: 1,
    title: "Summer Sale",
    discount: 30,
    copy: "Stay 4 nights and save on tropical beachfront resorts.",
    gradient: "from-orange-400 via-pink-400 to-rose-500",
    icon: Sun,
    perks: ["Sunset cruise credits", "Complimentary beach cabana"],
  },
  {
    id: 2,
    title: "Early Bird",
    discount: 25,
    copy: "Book 60 days in advance for exclusive perks.",
    gradient: "from-sky-500 via-indigo-500 to-purple-500",
    icon: AlarmClock,
    perks: ["Flexible rebooking", "VIP welcome amenity"],
  },
  {
    id: 3,
    title: "Last Minute",
    discount: 40,
    copy: "Weekend escapes ready to go within 7 days.",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    icon: Flame,
    perks: ["Free airport transfer", "Late checkout guarantee"],
  },
];

const PAYMENT_BANNERS: PaymentBanner[] = [
  {
    id: "visa",
    badge: "Global Shores",
    title: "Visa Marine Miles",
    description: "Tap-to-pay at overwater villas, reef dives, and beach clubs in 200+ destinations.",
    stat: "0% FX for 48h",
    gradient: "from-sky-400 via-cyan-500 to-indigo-600",
    icon: Globe2,
  },
  {
    id: "mastercard",
    badge: "City Breaks",
    title: "Mastercard Priceless Cities",
    description: "Unlock fast-track airport lanes and hotel upgrades across iconic urban escapes.",
    stat: "Lounge access",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    icon: MapPin,
  },
  {
    id: "paypal",
    badge: "Digital Nomads",
    title: "PayPal Voyage",
    description: "Secure wallet for extended stays, co-working passes, and flexible monthly rentals.",
    stat: "Buyer protection",
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    icon: ShieldCheck,
  },
  {
    id: "stripe",
    badge: "Boutique Cruises",
    title: "Stripe Atlas Travel",
    description: "Handle multi-currency yacht charters and expedition bookings with instant payouts.",
    stat: "140+ currencies",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    icon: Ship,
  },
  {
    id: "apple",
    badge: "Weekend Skips",
    title: "Apple Pay Express",
    description: "Board faster with Face ID authentication and digital boarding passes synced.",
    stat: "Face ID ready",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    icon: AlarmClock,
  },
  {
    id: "google",
    badge: "Road Trips",
    title: "Google Pay Journeys",
    description: "Keep rental cars, passes, and trip budgets in one tap-friendly travel wallet.",
    stat: "Trip budgeting",
    gradient: "from-lime-400 via-green-500 to-emerald-500",
    icon: Wallet,
  },
];

// Hook: simple scrollY value for parallax
const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return scrollY;
};

// Scroll reveal wrapper
const ScrollReveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.12 }
    );

    obs.observe(element);
    return () => {
      obs.unobserve(element);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 42 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 42 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Decorative wave divider
const WaveDivider = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 120"
    className="w-full h-[120px] text-sky-50"
    preserveAspectRatio="none"
  >
    <path
      fill="currentColor"
      d="M0,32L80,53.3C160,75,320,117,480,106.7C640,96,800,32,960,21.3C1120,11,1280,53,1360,74.7L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
    ></path>
  </svg>
);

export default function Home() {
  const [searchType, setSearchType] = useState<"hotels" | "flights">("hotels");
  const [location, setLocation] = useState("");
  const [persons, setPersons] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [featuredHotels, setFeaturedHotels] = useState<FeaturedHotel[]>([]);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);
  const [activeField, setActiveField] = useState<"location" | "from" | "to" | null>(null);

  const scrollY = useScrollAnimation();

  useEffect(() => {
    setFeaturedHotels(mockHotels);
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setActiveField(null);
  }, [searchType]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const suggestionEl = suggestionsRef.current;
      const inputElements = [
        locationInputRef.current,
        fromInputRef.current,
        toInputRef.current,
      ].filter((input): input is HTMLInputElement => input !== null);

      if (!(e.target instanceof Node)) {
        return;
      }

      const targetNode = e.target;
      const clickedSuggestion = suggestionEl?.contains(targetNode) ?? false;
      const clickedInput = inputElements.some((input) => input.contains(targetNode));

      if (!clickedSuggestion && !clickedInput) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setActiveField(null);
        setSuggestions([]);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const updateDestinationSuggestions = (value: string) => {
    const q = value.trim().toLowerCase();
    const filtered = (q
      ? POPULAR_DESTINATIONS.filter((destination) => {
          return (
            destination.city.toLowerCase().includes(q) ||
            destination.country.toLowerCase().includes(q) ||
            destination.description?.toLowerCase().includes(q)
          );
        })
      : POPULAR_DESTINATIONS
    )
      .slice(0, 8)
      .map<SuggestionItem>((destination) => {
        const label = `${destination.city}, ${destination.country}`;
        return {
          kind: "destination",
          label,
          value: label,
          secondary: destination.description,
        };
      });

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(filtered.length > 0 ? 0 : -1);
  };

  const updateAirportSuggestions = (value: string) => {
    const q = value.trim().toLowerCase();
    const filtered = (q
      ? AIRPORTS.filter((airport) => {
          return (
            airport.city.toLowerCase().includes(q) ||
            airport.name.toLowerCase().includes(q) ||
            airport.country.toLowerCase().includes(q) ||
            airport.iata.toLowerCase().includes(q)
          );
        })
      : AIRPORTS
    )
      .slice(0, 8)
      .map<SuggestionItem>((airport) => {
        const valueString = `${airport.city}${
          airport.name ? ` - ${airport.name}` : ""
        }, ${airport.country}`;
        return {
          kind: "airport",
          label: `${airport.city}, ${airport.country}`,
          value: valueString,
          secondary: airport.name,
          code: airport.iata,
        };
      });

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(filtered.length > 0 ? 0 : -1);
  };

  const commitSuggestion = (
    field: "location" | "from" | "to",
    suggestion: SuggestionItem
  ) => {
    if (suggestion.kind === "destination") {
      setLocation(suggestion.value);
    } else {
      if (field === "from") {
        setFromCity(suggestion.value);
      } else if (field === "to") {
        setToCity(suggestion.value);
      } else {
        setLocation(suggestion.value);
      }
    }

    setShowSuggestions(false);
    setSelectedIndex(-1);
    setActiveField(null);
    setSuggestions([]);
  };

  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "location" | "from" | "to"
  ) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const suggestion = suggestions[currentIndex];
      if (suggestion) {
        commitSuggestion(field, suggestion);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setActiveField(null);
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    if (searchType === "hotels") {
      console.log("Search hotels:", { location, persons, checkIn, checkOut });
      window.location.href = "/hotels";
    } else {
      console.log("Search flights:", { fromCity, toCity, checkIn, checkOut, persons });
      window.location.href = "/flights";
    }
  };

  const features = [
    {
      number: "01",
      title: "Curated seaside stays",
      description:
        "We approve only the finest beachside and waterfront lodgings for effortless escapes.",
    },
    {
      number: "02",
      title: "Great value, five‑star feel",
      description:
        "Lean pricing without sacrificing service quality. Your comfort always comes first.",
    },
    {
      number: "03",
      title: "Flexible & refundable",
      description:
        "Plans change. Eligible bookings can be modified or refunded with ease.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      {/* ================= HERO ================= */}
      <section className="relative isolate min-h-[92vh] flex items-center overflow-visible">
        {/* Parallax background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div className="absolute inset-0" style={{ y: scrollY * 0.30 }}>
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop"
              alt="Ocean horizon"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-sky-800/40 to-sky-700/30" />
          </motion.div>
        </div>

        {/* Floating icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div
            className="absolute top-[18%] left-[8%]"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Plane className="h-12 w-12 text-white" />
          </motion.div>
          <motion.div
            className="absolute bottom-[18%] right-[10%]"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
          >
            <Ship className="h-12 w-12 text-white" />
          </motion.div>
          <motion.div
            className="absolute top-[28%] right-[25%]"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.6 }}
          >
            <Anchor className="h-8 w-8 text-white" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mb-10"
          >
            
            <h1 className="mt-4 text-white text-5xl md:text-7xl font-extrabold leading-tight">
              Find Your Room
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-cyan-200">
                Enjoy Your Flight
              </span>
            </h1>
            <p className="mt-5 text-white/90 text-lg leading-relaxed">
              Discover dreamy coastlines, island getaways, and hidden coves. We help you book
              premium stays and flights 
            </p>
          </motion.div>

          {/* Glass Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            {/* Halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400/25 via-cyan-400/25 to-blue-400/25 rounded-3xl blur-2xl" />

            {/* Card */}
            <div className="relative rounded-3xl border border-white/30 bg-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
              <div className="relative">
                {/* Tabs */}
                <div className="inline-flex bg-white/10 backdrop-blur-xl rounded-3xl p-1.5 mb-6 border border-white/30">
                  {(["hotels", "flights"] as const).map((tab) => {
                    const active = searchType === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSearchType(tab)}
                        className="relative px-6 md:px-8 py-3 rounded-3xl font-semibold text-sm md:text-base transition-all"
                        aria-pressed={active}
                        aria-label={`Search ${tab}`}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-white rounded-3xl shadow"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span
                          className={`relative z-10 flex items-center gap-2 ${
                            active ? "text-slate-900" : "text-white"
                          }`}
                        >
                          {tab === "hotels" ? (
                            <MapPin className="w-4 h-4" />
                          ) : (
                            <Plane className="w-4 h-4" />
                          )}
                          {tab === "hotels" ? "Hotels" : "Flights"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {searchType === "hotels" ? (
                    <motion.div
                      key="hotels"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
                    >
                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" /> Location
                        </label>
                        <div className="relative">
                          <input
                            ref={locationInputRef}
                            type="text"
                            placeholder="Where to? (e.g., Nha Trang)"
                            value={location}
                            onChange={(e) => {
                              setLocation(e.target.value);
                              setActiveField("location");
                              updateDestinationSuggestions(e.target.value);
                            }}
                            onFocus={(e) => {
                              setActiveField("location");
                              updateDestinationSuggestions(e.currentTarget.value);
                            }}
                            onKeyDown={(e) => handleSuggestionKeyDown(e, "location")}
                            className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                          />

                          {/* Suggestions dropdown */}
                          {showSuggestions && activeField === "location" && (
                            <div
                              ref={suggestionsRef}
                              className="absolute z-50 left-0 mt-2 w-full max-w-full bg-white rounded-xl shadow-lg border border-sky-100 max-h-64 overflow-auto translate-y-0.5"
                              style={{ transformOrigin: "top left" }}
                            >
                              {suggestions.map((item, i) => {
                                if (item.kind !== "destination") {
                                  return null;
                                }
                                const active = i === selectedIndex;
                                return (
                                  <button
                                    key={`${item.value}-${i}`}
                                    onMouseDown={(ev) => {
                                      ev.preventDefault();
                                      commitSuggestion("location", item);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                    className={`w-full text-left px-4 py-3 hover:bg-sky-50 transition flex items-center gap-3 ${
                                      active ? "bg-sky-50" : ""
                                    }`}
                                  >
                                    <div className="w-10 flex justify-center text-slate-500">
                                      <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-slate-900">
                                        {item.label}
                                      </div>
                                      {item.secondary && (
                                        <div className="text-sm text-slate-500">
                                          {item.secondary}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <User className="w-4 h-4 mr-2" /> Guests
                        </label>
                        <select
                          value={persons}
                          onChange={(e) => setPersons(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 Persons</option>
                          <option value="3">3 Persons</option>
                          <option value="4">4+ Persons</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" /> Check‑in
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" /> Check‑out
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="flights"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6"
                    >
                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" /> From
                        </label>
                        <div className="relative">
                          <input
                            ref={fromInputRef}
                            type="text"
                            placeholder="Departure city"
                            value={fromCity}
                            onChange={(e) => {
                              setFromCity(e.target.value);
                              setActiveField("from");
                              updateAirportSuggestions(e.target.value);
                            }}
                            onFocus={(e) => {
                              setActiveField("from");
                              updateAirportSuggestions(e.currentTarget.value);
                            }}
                            onKeyDown={(e) => handleSuggestionKeyDown(e, "from")}
                            className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                          />
                          {/* Suggestions dropdown for From field */}
                          {showSuggestions && activeField === "from" && (
                            <div
                              ref={suggestionsRef}
                              className="absolute z-50 left-0 mt-2 w-full max-w-full bg-white rounded-xl shadow-lg border border-sky-100 max-h-64 overflow-auto translate-y-0.5"
                              style={{ transformOrigin: "top left" }}
                            >
                              {suggestions.map((item, i) => {
                                if (item.kind !== "airport") {
                                  return null;
                                }
                                const active = i === selectedIndex;
                                return (
                                  <button
                                    key={`${item.code}-${i}`}
                                    onMouseDown={(ev) => {
                                      ev.preventDefault();
                                      commitSuggestion("from", item);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                    className={`w-full text-left px-4 py-3 hover:bg-sky-50 transition flex items-center gap-3 ${
                                      active ? "bg-sky-50" : ""
                                    }`}
                                  >
                                    <div className="w-10 text-slate-700 font-semibold">
                                      {item.code}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-slate-900">
                                        {item.label}
                                      </div>
                                      {item.secondary && (
                                        <div className="text-sm text-slate-500">
                                          {item.secondary}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" /> To
                        </label>
                        <div className="relative">
                          <input
                            ref={toInputRef}
                            type="text"
                            placeholder="Arrival city"
                            value={toCity}
                            onChange={(e) => {
                              setToCity(e.target.value);
                              setActiveField("to");
                              updateAirportSuggestions(e.target.value);
                            }}
                            onFocus={(e) => {
                              setActiveField("to");
                              updateAirportSuggestions(e.currentTarget.value);
                            }}
                            onKeyDown={(e) => handleSuggestionKeyDown(e, "to")}
                            className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                          />
                          {/* Suggestions dropdown for To field */}
                          {showSuggestions && activeField === "to" && (
                            <div
                              ref={suggestionsRef}
                              className="absolute z-50 left-0 mt-2 w-full max-w-full bg-white rounded-xl shadow-lg border border-sky-100 max-h-64 overflow-auto translate-y-0.5"
                              style={{ transformOrigin: "top left" }}
                            >
                              {suggestions.map((item, i) => {
                                if (item.kind !== "airport") {
                                  return null;
                                }
                                const active = i === selectedIndex;
                                return (
                                  <button
                                    key={`${item.code}-${i}`}
                                    onMouseDown={(ev) => {
                                      ev.preventDefault();
                                      commitSuggestion("to", item);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                    className={`w-full text-left px-4 py-3 hover:bg-sky-50 transition flex items-center gap-3 ${
                                      active ? "bg-sky-50" : ""
                                    }`}
                                  >
                                    <div className="w-10 text-slate-700 font-semibold">
                                      {item.code}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-slate-900">
                                        {item.label}
                                      </div>
                                      {item.secondary && (
                                        <div className="text-sm text-slate-500">
                                          {item.secondary}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" /> Departure
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" /> Return
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <User className="w-4 h-4 mr-2" /> Passengers
                        </label>
                        <select
                          value={persons}
                          onChange={(e) => setPersons(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 Persons</option>
                          <option value="3">3 Persons</option>
                          <option value="4">4+ Persons</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className=" btn-primary mt-6 w-full md:w-auto font-extrabold px-8 py-4 rounded-3xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 inline-flex items-center justify-center gap-3"
                >
                  <Search className="" />
                  {(!showSuggestions || activeField === "to") && <span>Search Now</span>}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <WaveDivider />
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-24 bg-sky-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">
                Why Choose TravelEase
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Ocean‑breeze simplicity, curated quality, and flexible plans for every journey.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Gallery */}
            <ScrollReveal delay={0.15}>
              <div className="relative">
                <div className="grid grid-cols-2 gap-5">
                  <motion.div
                    whileHover={{ scale: 1.04, rotate: 1.5 }}
                    className="col-span-2 relative rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop"
                      alt="Beach villa"
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 to-transparent" />
                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow">
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonials[0].image}
                          alt={testimonials[0].name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {testimonials[0].name}
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-slate-600 text-sm">
                              {testimonials[0].rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.04, rotate: -1.5 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop"
                      alt="Pool"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.04, rotate: 1.5 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop"
                      alt="Resort exterior"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Features */}
            <div className="space-y-8">
              {features.map((f, i) => (
                <ScrollReveal key={i} delay={0.08 * (i + 1)}>
                  <motion.div
                    whileHover={{ x: 8 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-sky-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-lg">
                        {f.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {f.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">{f.description}</p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRENDING DESTINATIONS ================= */}
      <section className="relative py-26 bg-sky-50">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-cyan-100 opacity-90" />
          <div className="absolute -top-24 left-12 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute -bottom-24 right-16 h-48 w-48 rounded-full bg-cyan-200/50 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Trending this week
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  Trending Destinations
                </h2>
                <p className="text-slate-600 max-w-2xl">
                  Curated hot spots based on traveler bookings and search demand. Discover where
                  fellow explorers are heading right now.
                </p>
              </div>
              <motion.a
                href="/destinations"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 self-start md:self-end rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm hover:border-sky-300"
              >
                Explore all
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING_DESTINATIONS.map((destination, index) => (
              <ScrollReveal key={destination.id} delay={0.08 * (index + 1)}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-3xl bg-white shadow-xl border border-white/60"
                >
                  <div className="absolute inset-0">
                    <img
                      src={destination.image}
                      alt={destination.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                  </div>
                  <div className="relative flex flex-col justify-end p-6 md:p-7 space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
                      Hot pick #{index + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-white">{destination.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {destination.description}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOT DEALS ================= */}
      <section id="hot-deals" className="relative py-24 bg-sky-50 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-sky-100 to-transparent blur-3xl opacity-70" />
          <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute -bottom-32 left-16 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl p-8 overflow-hidden">
              {/* Ocean gradient background with wave animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 opacity-95"></div>
              
              {/* Animated water waves */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-400/50 to-transparent animate-[wave_8s_ease-in-out_infinite]" 
                     style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-cyan-300/40 to-transparent animate-[wave_6s_ease-in-out_infinite_0.5s]" 
                     style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-300/30 to-transparent animate-[wave_7s_ease-in-out_infinite_1s]" 
                     style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
              </div>

              {/* Bubbles animation */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 rounded-full bg-white/20"
                    style={{
                      left: `${15 + i * 15}%`,
                      width: `${10 + i * 3}px`,
                      height: `${10 + i * 3}px`,
                      animation: `bubble ${4 + i}s ease-in-out infinite`,
                      animationDelay: `${i * 0.7}s`
                    }}
                  ></div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-lg border border-white/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Hot deals live
                </div>
                <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                  Sizzling Discounts
                </h2>
                <p className="mt-3 text-white/95 max-w-2xl font-medium drop-shadow">
                  Choose a deal tailored to your travel style. Limited-time offers with free
                  breakfast, late checkout, and zero change fees.
                </p>
              </div>
              <div className="relative z-10 rounded-2xl bg-white/95 backdrop-blur-md text-blue-900 px-6 py-4 text-sm font-semibold shadow-2xl border border-white/50 flex items-center gap-2 hover:bg-white transition-all">
                <Flame className="h-4 w-4 text-red-500 animate-pulse" />
                Updated live • Tap a card to view inclusions
              </div>
            </div>

            <style>{`
              @keyframes wave {
                0%, 100% { transform: translateY(0px) scaleY(1); }
                50% { transform: translateY(-15px) scaleY(0.95); }
              }
              @keyframes bubble {
                0% { transform: translateY(0) scale(1); opacity: 0; }
                10% { opacity: 0.6; }
                90% { opacity: 0.6; }
                100% { transform: translateY(-500px) scale(1.5); opacity: 0; }
              }
            `}</style>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7">
            {HOT_DEALS.map((deal, index) => (
              <ScrollReveal key={deal.id} delay={0.1 * (index + 1)}>
                <motion.div
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="group relative h-full"
                >
                  <div
                    className={`absolute inset-0 rounded-[32px] bg-gradient-to-br ${deal.gradient} opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-90`}
                  />
                  <div className="relative flex h-full flex-col justify-between rounded-[32px] border border-white/30 bg-white/10 px-6 py-7 md:px-7 md:py-8 shadow-2xl backdrop-blur-xl text-white overflow-hidden">
                    <div className="absolute -top-20 -right-16 h-36 w-36 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute -bottom-24 left-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
                        <span>Save {deal.discount}%</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-white/15 p-3 text-white/90">
                          <deal.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{deal.title}</h3>
                          <p className="mt-2 text-sm text-white/80 leading-relaxed">
                            {deal.copy}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ul className="relative mt-6 space-y-2 text-sm text-white/80">
                      {deal.perks.map((perk, perkIndex) => (
                        <li
                          key={perkIndex}
                          className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur"
                        >
                          <span className="inline-flex h-2 w-2 rounded-full bg-white/70" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative mt-6 inline-flex items-center justify-between gap-3 rounded-2xl bg-white text-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] shadow-xl"
                    >
                      Unlock offer
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="relative py-24 bg-sky-50 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-cyan-100 opacity-90" />
          <div className="absolute -top-24 right-14 h-56 w-56 rounded-full bg-sky-200/70 blur-3xl" />
          <div className="absolute -bottom-28 left-16 h-60 w-60 rounded-full bg-cyan-200/70 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="rounded-[36px] border border-sky-100 bg-white/80 backdrop-blur-2xl shadow-2xl p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
                <Gift className="h-4 w-4" />
                Join the TravelEase crew
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
                Newsletter + Welcome Gift
              </h2>
              <p className="text-slate-600 max-w-3xl text-lg">
                Subscribe for weekly flash-sale alerts, destination guides, and concierge-only perks.
                New members receive a <span className="font-semibold text-sky-700">10% OFF</span> welcome
                voucher instantly.
              </p>

              <form
                className="flex flex-col md:flex-row gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  className="flex-1 rounded-2xl border border-sky-200 bg-white/90 px-5 py-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-4 font-semibold text-white shadow-xl"
                >
                  Get my 10% OFF
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </form>

              <p className="text-slate-500 text-sm">
                We respect your inbox. Expect curated inspiration once a week, and unsubscribe any
                time.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================ TRUST BADGES (COMPACT TRAVEL STYLE) ================ */}
<section
  aria-labelledby="trust-badges-title"
  className="relative py-12 md:py-16 overflow-hidden text-white"
>
  {/* BG gradient trời–biển gọn hơn */}
  <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-800" />
  {/* glow nhẹ, tránh rối */}
  <div className="absolute -top-24 left-[12%] h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
  <div className="absolute top-1/2 right-[18%] h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl" />

  {/* máy bay lướt qua (nhỏ hơn) */}
  <motion.div
    className="pointer-events-none hidden md:flex absolute top-14 left-1/2 -translate-x-1/2 text-white/30"
    animate={{ x: ["-35%", "35%"], rotate: [6, -3, 6] }}
    transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
  >
    <Plane className="h-10 w-10" aria-hidden="true" />
  </motion.div>

  <div className="relative max-w-6xl mx-auto px-6 md:px-8 space-y-8 md:space-y-10">
    <div className="text-center space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        TravelEase payments
      </div>
      <h3 id="trust-badges-title" className="text-2xl md:text-3xl font-extrabold leading-tight">
        Trusted travel payments from check-in to takeoff
      </h3>
      <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base">
        Tap, swipe, or scan at beach resorts, alpine lodges, and island airports—no currency or security worries.
      </p>
    </div>

    {/* ====== full-bleed compact marquee ====== */}
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden py-4 md:py-6"
      role="region"
      aria-label="Travel payment highlights"
    >
      {/* fade 2 bên cho chuyên nghiệp hơn */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-sky-950 via-sky-950/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-sky-950 via-sky-950/70 to-transparent" />

      <motion.div
        className="flex w-max gap-5 md:gap-6 will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...PAYMENT_BANNERS, ...PAYMENT_BANNERS].map((slide, idx) => (
          <article
            key={`${slide.id}-${idx}`}
            className="relative min-w-[240px] sm:min-w-[280px] lg:min-w-[320px] xl:min-w-[360px] aspect-[16/7]
                       rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur
                       shadow-[0_10px_30px_-12px_rgba(14,165,233,0.45)]"
            aria-label={slide.title}
          >
            {/* gradient theo slide, mờ hơn để dễ đọc */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-70`} />
            {/* highlight texture rất nhẹ */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.5),transparent_60%)]" />
            {/* đường tròn trang trí tinh tế */}
            <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full border border-white/20 opacity-30" />
            <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border border-white/20 opacity-30" />

            <div className="relative h-full px-5 py-4 md:px-6 md:py-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1
                                   text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-white/85">
                  {slide.badge}
                </span>
                <slide.icon className="h-5 w-5 text-white/85" aria-hidden="true" />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <h4 className="text-lg md:text-xl font-bold leading-snug tracking-tight">
                  {slide.title}
                </h4>
                <p className="text-xs md:text-sm text-white/85 leading-relaxed line-clamp-2 md:line-clamp-3">
                  {slide.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] md:text-xs uppercase tracking-[0.28em] text-white/80">
                <span>{slide.stat}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </div>
          </article>
        ))}
      </motion.div>
    </div>
  </div>
</section>

      {/* ================= FEATURED HOTELS ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4">
                Featured Seaside Stays
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Handpicked coastal accommodations for your next blue‑sky escape.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {featuredHotels.map((hotel, idx) => (
              <ScrollReveal key={hotel.id} delay={0.06 * idx}>
                <motion.div whileHover={{ y: -8 }} className="group cursor-pointer">
                  <div className="relative rounded-3xl overflow-hidden shadow-xl mb-5">
                    <motion.img
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.35 }}
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4 bg-white/95 px-4 py-2 rounded-full font-extrabold text-slate-900 shadow">
                      ${hotel.price}/night
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-slate-900">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{hotel.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-sm font-medium border border-sky-100"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-14">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-8 py-4 rounded-full font-extrabold hover:from-sky-600 hover:to-cyan-600 shadow-xl inline-flex items-center gap-3"
              >
                View All Hotels <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-24 bg-gradient-to-br from-sky-900 via-sky-800 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-sky-400 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-400 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Ready to Start Your
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-cyan-200">
                Ocean Journey?
              </span>
            </h2>
            <p className="text-lg text-sky-100/90 max-w-3xl mx-auto">
              Join over 50,000 travelers who trust TravelEase for calm, seamless bookings
              from flight to seaside stay.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-10">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-extrabold hover:bg-slate-100 shadow-2xl"
              >
                Book Premium Hotels
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-extrabold hover:bg-white hover:text-slate-900 transition"
              >
                Find Best Flights
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto pt-12 mt-12 border-t border-white/20">
              <motion.div whileHover={{ scale: 1.06 }} className="space-y-1">
                <div className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-cyan-200">
                  4.9/5
                </div>
                <div className="text-sky-100/90 text-lg">Customer Rating</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.06 }} className="space-y-1">
                <div className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-cyan-200">
                  50K+
                </div>
                <div className="text-sky-100/90 text-lg">Happy Travelers</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.06 }} className="space-y-1">
                <div className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-200 to-cyan-200">
                  24/7
                </div>
                <div className="text-sky-100/90 text-lg">Premium Support</div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
