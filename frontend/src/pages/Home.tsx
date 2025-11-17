import React, { useState, useEffect, useRef, useCallback } from "react";
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
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIRPORTS, type Airport } from "../data/airports";

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

const HOT_DEAL_FEATURES = [
  {
    id: "change-fees",
    title: "Zero change fees",
    caption: "Swap itineraries up to 24 hours before departure. Terms apply.",
  },
  {
    id: "upgrade",
    title: "Complimentary upgrades",
    caption: "Unlock suite-level perks at partner hotels and resorts. Subject to availability.",
  },
  {
    id: "availability",
    title: "Live availability",
    caption: "Tap into real-time seat maps and last-minute room releases as they drop.",
  },
  {
    id: "concierge",
    title: "Concierge chat",
    caption: "Message our travel stylists 24/7 from any device for instant help.",
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
    description: "Secure wallet passes, and flexible monthly rentals.",
    stat: "Buyer protection",
    gradient: "from-cyan-200 via-sky-200 to-blue-200",
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

const HotDealsCardSwap = ({ deals }: { deals: HotDeal[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);

  const handleAdvance = useCallback(
    (step: number) => {
      if (!deals.length) {
        return;
      }

      setActiveIndex((previous) => {
        const nextIndex = (previous + step + deals.length) % deals.length;
        setDirection(step >= 0 ? 1 : -1);
        return nextIndex;
      });
    },
    [deals.length]
  );

  const pauseWithResume = useCallback(() => {
    setIsPaused(true);

    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current);
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      setIsPaused(false);
      resumeTimeoutRef.current = null;
    }, 6000);
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      if (index === activeIndex || index < 0 || index >= deals.length) {
        return;
      }

      const isForward =
        index > activeIndex || (activeIndex === deals.length - 1 && index === 0);

      pauseWithResume();
      setDirection(isForward ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex, deals.length, pauseWithResume]
  );

  useEffect(() => {
    if (deals.length <= 1 || isPaused) {
      return;
    }

    autoAdvanceRef.current = window.setInterval(() => {
      handleAdvance(1);
    }, 5200);

    return () => {
      if (autoAdvanceRef.current !== null) {
        window.clearInterval(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    };
  }, [deals.length, handleAdvance, isPaused]);

  useEffect(
    () => () => {
      if (autoAdvanceRef.current !== null) {
        window.clearInterval(autoAdvanceRef.current);
      }

      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    },
    []
  );

  const activeDeal = deals[activeIndex];
  if (!activeDeal) {
    return null;
  }

  const cardVariants = {
    enter: (dir: 1 | -1) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.96,
      rotate: dir > 0 ? 2 : -2,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.62, ease: [0.18, 0.82, 0.25, 1] as const },
    },
    exit: (dir: 1 | -1) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.96,
      rotate: dir > 0 ? -2 : 2,
      transition: { duration: 0.5, ease: [0.24, 0.85, 0.32, 1] as const },
    }),
  } as const;

  return (
    <div className="relative flex w-full flex-col items-center gap-8">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[52px] border border-sky-100/80" />

      <div
        className="relative w-full max-w-[420px]"
        onMouseEnter={() => {
          setIsPaused(true);
          if (resumeTimeoutRef.current !== null) {
            window.clearTimeout(resumeTimeoutRef.current);
            resumeTimeoutRef.current = null;
          }
        }}
        onMouseLeave={() => {
          setIsPaused(false);
          if (resumeTimeoutRef.current !== null) {
            window.clearTimeout(resumeTimeoutRef.current);
            resumeTimeoutRef.current = null;
          }
        }}
        onFocusCapture={() => {
          setIsPaused(true);
          if (resumeTimeoutRef.current !== null) {
            window.clearTimeout(resumeTimeoutRef.current);
            resumeTimeoutRef.current = null;
          }
        }}
        onBlurCapture={() => {
          setIsPaused(false);
          if (resumeTimeoutRef.current !== null) {
            window.clearTimeout(resumeTimeoutRef.current);
            resumeTimeoutRef.current = null;
          }
        }}
      >
        <div className="pointer-events-none absolute -left-16 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-36 w-36 rounded-full bg-cyan-300/25 blur-3xl" />

        <div className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-white/80 p-6 shadow-[0_30px_90px_-45px_rgba(14,116,144,0.25)] backdrop-blur md:p-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeDeal.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative flex flex-col gap-7 overflow-hidden rounded-[24px] border border-sky-100 bg-white p-8 text-slate-900 shadow-[0_24px_70px_-40px_rgba(14,116,144,0.22)] sm:gap-8 sm:p-9"
            >
              <div className={`absolute inset-0 rounded-[24px] bg-gradient-to-br ${activeDeal.gradient} opacity-15`} />
              <div className="absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_55%)]" />
              <div className="absolute inset-0 rounded-[24px] border border-white/40" />
              <div className="pointer-events-none absolute -left-12 top-14 h-24 w-24 rounded-full bg-sky-200/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-18 right-12 h-28 w-28 rounded-full bg-cyan-200/45 blur-3xl" />

              <div className="relative flex flex-col gap-7">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-sky-700">
                  <span>Save {activeDeal.discount}%</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-sky-100 bg-sky-50 text-sky-600">
                    <activeDeal.icon className="h-6 w-6 opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-[1.9rem] font-semibold leading-tight text-slate-900 sm:text-[32px]">
                      {activeDeal.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm text-slate-600 sm:text-base">
                      {activeDeal.copy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative space-y-3">
                {activeDeal.perks.map((perk) => (
                  <div
                    key={perk}
                    className="flex items-center justify-between rounded-[18px] border border-sky-100 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_24px_-18px_rgba(14,116,144,0.22)] sm:px-5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-400/70" />
                      {perk}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.38em] text-slate-400">
                      •
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  pauseWithResume();
                  handleAdvance(1);
                }}
                className="relative mt-3 inline-flex items-center justify-center gap-2.5 self-start rounded-full border border-sky-200 bg-white px-7 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-slate-900 shadow-[0_18px_28px_-22px_rgba(14,116,144,0.2)]"
              >
                Unlock offer
                <ArrowRight className="h-4 w-4 text-sky-500" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-600">
        {deals.map((deal, index) => (
          <button
            key={deal.id}
            type="button"
            onClick={() => goToIndex(index)}
            className={`group relative inline-flex items-center gap-2 rounded-full border border-sky-200 px-4 py-2 transition ${
              activeIndex === index
                ? "bg-white text-slate-900 shadow-lg"
                : "bg-white/70 text-slate-600 hover:bg-white"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${activeIndex === index ? "bg-sky-500" : "bg-sky-400/60"}`} />
            {deal.title}
          </button>
        ))}
      </div>
    </div>
  );
};

const normalizeForSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getTimeValue = (value: string) => (value ? new Date(value).getTime() : null);

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
  const [searchAttempted, setSearchAttempted] = useState(false);

  const scrollY = useScrollAnimation();
  const navigate = useNavigate();

  const trimmedLocation = location.trim();
  const trimmedFromCity = fromCity.trim();
  const trimmedToCity = toCity.trim();
  const travelerCount = parseInt(persons, 10);
  const hasGuests = Number.isFinite(travelerCount) && travelerCount > 0;

  const checkInTime = getTimeValue(checkIn);
  const checkOutTime = getTimeValue(checkOut);

  const hotelDatesValid = Boolean(
    checkInTime !== null &&
      checkOutTime !== null &&
      checkOutTime > checkInTime
  );

  const flightDatesValid = Boolean(
    checkInTime !== null &&
      checkOutTime !== null &&
      checkOutTime >= checkInTime
  );

  const isHotelSearchReady = Boolean(
    trimmedLocation &&
      checkIn &&
      checkOut &&
      hasGuests &&
      hotelDatesValid
  );

  const flightRouteValid = Boolean(
    trimmedFromCity &&
      trimmedToCity &&
      normalizeForSearch(trimmedFromCity) !== normalizeForSearch(trimmedToCity)
  );

  const isFlightSearchReady = Boolean(
    trimmedFromCity &&
      trimmedToCity &&
      checkIn &&
      checkOut &&
      hasGuests &&
      flightDatesValid &&
      flightRouteValid
  );

  const isSearchReady =
    searchType === "hotels" ? isHotelSearchReady : isFlightSearchReady;

  let validationHint: string | null = null;

  if (searchAttempted && !isSearchReady) {
    if (
      searchType === "hotels" &&
      trimmedLocation &&
      checkIn &&
      checkOut &&
      hasGuests &&
      !hotelDatesValid
    ) {
      validationHint = "Check-out must be after check-in.";
    } else if (
      searchType === "flights" &&
      trimmedFromCity &&
      trimmedToCity &&
      checkIn &&
      checkOut &&
      hasGuests
    ) {
      if (!flightDatesValid) {
        validationHint = "Return date must be on or after the departure date.";
      } else if (!flightRouteValid) {
        validationHint = "Departure and arrival locations must be different.";
      }
    } else {
      validationHint =
        searchType === "hotels"
          ? "Please choose a destination, stay dates, and guests before searching."
          : "Please enter departure city, destination, travel dates, and passengers before searching.";
    }
  }

  const shouldShowValidationHint = Boolean(validationHint);

  useEffect(() => {
    setFeaturedHotels(mockHotels);
  }, []);

  useEffect(() => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setActiveField(null);
    setSearchAttempted(false);
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
      ? AIRPORTS.filter((airport: Airport) => {
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
      .map<SuggestionItem>((airport: Airport) => {
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
    setSearchAttempted(true);

    if (!isSearchReady) {
      return;
    }

    if (searchType === "hotels") {
      const params = new URLSearchParams();

      if (trimmedLocation) {
        params.set("location", normalizeForSearch(trimmedLocation));
      }

      if (persons.trim()) {
        params.set("guests", persons.trim());
      }

      console.log("Search hotels:", {
        location: trimmedLocation,
        persons,
        checkIn,
        checkOut,
      });

      navigate(`/hotels${params.toString() ? `?${params.toString()}` : ""}`);
    } else {
      console.log("Search flights:", {
        fromCity: trimmedFromCity,
        toCity: trimmedToCity,
        checkIn,
        checkOut,
        persons,
      });
      navigate("/flights");
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
                  type="button"
                  aria-disabled={!isSearchReady}
                  whileHover={isSearchReady ? { scale: 1.02, y: -1 } : undefined}
                  whileTap={isSearchReady ? { scale: 0.98 } : undefined}
                  onClick={handleSearch}
                  className={`btn-primary mt-6 w-full md:w-auto font-extrabold px-8 py-4 rounded-3xl shadow-xl focus:outline-none focus:ring-4 inline-flex items-center justify-center gap-3 transition ${
                    isSearchReady ? "hover:shadow-2xl" : "opacity-70 hover:shadow-xl"
                  }`}
                >
                  <Search className="" />
                  {(!showSuggestions || activeField === "to") && <span>Search Now</span>}
                </motion.button>
                {shouldShowValidationHint && validationHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 w-full md:w-auto"
                  >
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200/70 bg-gradient-to-r from-rose-50/90 via-rose-50/60 to-white/60 px-4 py-3 shadow-sm backdrop-blur">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500" />
                      <p className="text-sm font-medium text-rose-600">{validationHint}</p>
                    </div>
                  </motion.div>
                )}
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
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50 py-28 text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_75%)]" />
          <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-[120px]" />
          <div className="absolute right-[-20%] bottom-0 h-96 w-96 rounded-full bg-sky-200/25 blur-[140px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:px-8">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.38em] text-sky-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-sky-500" />
                Trending this week
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                  Trending Destinations
                </h2>
                <p className="text-base text-slate-600 md:text-lg">
                  Live booking sentiment plus curated editor picks—all blended into one weekly list.
                  Swipe through the stack to catch the vibe before everyone else does.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm text-slate-600">
                <motion.div whileHover={{ x: 6 }} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-ful text-sm font-semibold text-sky-700">
                    01
                  </div>
                  Coastline escapes with sunrise yoga decks and reef tours ready to reserve.
                </motion.div>
                <motion.div whileHover={{ x: 6 }} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-ful text-sm font-semibold text-sky-700">
                    02
                  </div>
                  Boutique stays hand-picked for wow-factor lobbies and rooftop pools.
                </motion.div>
                <motion.div whileHover={{ x: 6 }} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-ful text-sm font-semibold text-sky-700">
                    03
                  </div>
                  Flight-friendly hubs under 10 hours from major APAC cities.
                </motion.div>
              </div>

              <motion.a
                href="/destinations"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
              >
                Explore all Destinations
                <ArrowRight className="h-4 w-4 text-sky-500" />
              </motion.a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -top-14 right-16 h-28 w-28 rounded-full bg-sky-200/30 blur-3xl" />
              <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-cyan-200/35 blur-3xl" />

              <motion.div
                layout
                className="relative space-y-6"
                initial="rest"
                whileInView="inView"
                viewport={{ once: true, amount: 0.6 }}
              >
                {TRENDING_DESTINATIONS.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    layout
                    variants={{
                      rest: { opacity: 0, y: 40 },
                      inView: { opacity: 1, y: 0, transition: { delay: index * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="group relative overflow-hidden rounded-3xl border border-sky-100/70 bg-white/80 backdrop-blur px-6 py-6 shadow-[0_26px_70px_-28px_rgba(14,116,144,0.35)]"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={destination.image}
                        alt={destination.title}
                        className="h-full w-full rounded-3xl object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-950/75 via-slate-950/30 to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" />
                          Spotlight #{index + 1}
                        </span>
                        <span>{destination.title.split(",")[0]}</span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-semibold leading-tight text-white">
                            {destination.title}
                          </h3>
                          <p className="mt-2 text-sm text-white/75 leading-relaxed">
                            {destination.description}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================= HOT DEALS ================= */}
      <section id="hot-deals" className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-slate-100 py-28 text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_72%)]" />
          <div className="absolute -top-40 left-[-15%] h-[520px] w-[520px] rounded-full bg-sky-300/25 blur-[130px]" />
          <div className="absolute bottom-0 right-[-20%] h-[520px] w-[520px] rounded-full bg-cyan-300/20 blur-[150px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] md:px-8">
          <ScrollReveal>
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sky-700 shadow-sm">
                <Flame className="h-4 w-4 text-sky-500" />
                Hot deals live
              </div>

              <div className="space-y-5">
                <h2 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                  Live travel deals
                </h2>
                <p className="max-w-xl text-base text-slate-600 md:text-lg">
                 Every few seconds the front card rotates—revealing a fresh set of perks curated by the TravelEase concierge team. Hover or tap to pin your favorite offer.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {HOT_DEAL_FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    whileHover={{ x: 6, y: -6 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24, mass: 0.9 }}
                    className="group relative overflow-hidden rounded-[28px] border border-sky-100 bg-white px-6 py-5 text-left text-slate-700 shadow-[0_24px_60px_-38px_rgba(14,116,144,0.28)]"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute -right-12 top-10 h-24 w-24 rounded-full bg-sky-200/30 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                    <div className="relative flex items-start gap-4">
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-sky-200/40 blur-md" />
                        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sm font-semibold text-sky-700 shadow-[0_14px_32px_-16px_rgba(14,116,144,0.35)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold tracking-tight text-slate-900">{feature.title}</p>
                        {feature.caption ? (
                          <p className="text-[0.82rem] leading-relaxed text-slate-600">{feature.caption}</p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
    
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-sky-500" />
                  Flexible terms
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1">
                  <CreditCard className="h-4 w-4 text-sky-500" />
                  Secure checkout
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <HotDealsCardSwap deals={HOT_DEALS} />
          </ScrollReveal>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-[10%] h-64 w-64 rounded-full bg-sky-200/60 blur-[110px]" />
          <div className="absolute -bottom-32 right-[12%] h-72 w-72 rounded-full bg-cyan-200/60 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:px-8">
          <ScrollReveal>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
                <Gift className="h-4 w-4" />
                Members-only drops
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                  Unlock concierge tips every Thursday
                </h2>
                <p className="max-w-xl text-base text-slate-600 md:text-lg">
                  Early access to flash hotel sales, seat upgrades you can actually grab, and
                  48-hour alerts for bespoke ocean experiences curated by the TravelEase editors.
                </p>
              </div>

              <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                {["Weekly inspo, zero spam", "First dibs on new destinations", "Exclusive partner perks", "Cancel anytime online"].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ x: 6 }}
                    className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 shadow-sm"
                  >
                    <Sparkles className="h-4 w-4 text-sky-500" />
                    {item}
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-6 text-sm font-medium text-slate-500">
                <div className="flex flex-col">
                  <span className="text-3xl font-semibold text-slate-900">52k+</span>
                  Subscribers
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-semibold text-slate-900">93%</span>
                  Read-through rate
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <div className="relative">
              <div className="absolute -top-10 right-6 h-32 w-32 rounded-full bg-sky-200/50 blur-[90px]" />
              <div className="absolute -bottom-16 left-6 h-40 w-40 rounded-full bg-cyan-200/50 blur-[110px]" />

              <div className="relative overflow-hidden rounded-[32px] border border-sky-100/70 bg-white/90 p-8 shadow-[0_40px_120px_-40px_rgba(14,116,144,0.25)] backdrop-blur">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900">Join the TravelEase crew</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Drop your email and receive a welcome code for <span className="font-semibold text-sky-600">10% off</span> your first booking.
                    </p>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                    }}
                  >
                    <label className="block space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Email address
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-sky-200 bg-white px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </label>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-white shadow-lg"
                    >
                      Send me updates
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </form>

                  <p className="text-xs text-slate-400">
                    One-click unsubscribe. We never share your email.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================ TRUST & PAYMENTS ================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-sky-100/40 py-28 text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_78%)]" />
          <div className="absolute -top-24 left-[18%] h-56 w-56 rounded-full bg-sky-300/30 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[15%] h-72 w-72 rounded-full bg-cyan-200/35 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sky-700 shadow-sm">
                  <CreditCard className="h-4 w-4 text-sky-500" />
                  TravelEase payments
                </div>
                <h3 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                  Trusted payment partners from check-in to takeoff
                </h3>
                <p className="text-sm text-slate-600 md:text-base">
                  Tap, swipe, or scan anywhere you dock. Each partner card unlocks unique experiences,
                  pre-arrival upgrades, and concierge-protected transactions.
                </p>
              </div>

              <motion.div
                className="flex items-center gap-4 rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ShieldCheck className="h-4 w-4 text-sky-500" />
                PCI DSS compliant
              </motion.div>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PAYMENT_BANNERS.map((banner, index) => (
              <ScrollReveal key={banner.id} delay={0.06 * index}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="relative overflow-hidden rounded-[28px] border border-sky-100 bg-white px-6 py-6 shadow-[0_24px_72px_-34px_rgba(14,116,144,0.25)] min-h-[208px] md:min-h-[220px]"
                >
                  <div className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${banner.gradient} opacity-15`} />
                  <div className="absolute inset-0 rounded-[28px] opacity-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_68%)]" />

                  <div className="relative flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-700 shadow-sm">
                        {banner.badge}
                      </span>
                      <banner.icon className="h-5 w-5 text-sky-600" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold leading-snug tracking-tight text-slate-900">
                        {banner.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {banner.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500">
                      <span>{banner.stat}</span>
                      <ArrowRight className="h-4 w-4 text-sky-500" />
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
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
      <section className="relative overflow-hidden bg-[#01020b] py-28 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25),transparent_70%)]" />
          <div className="absolute -top-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/30 blur-[110px]" />
          <div className="absolute bottom-[-20%] right-1/4 h-72 w-72 rounded-full bg-sky-500/25 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:text-left">
              <div className="space-y-8">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
                  <Plane className="h-4 w-4" />
                  TravelEase concierge
                </p>
                <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Ready for your next ocean escape?
                </h2>
                <p className="max-w-2xl text-base text-white/70 md:text-lg">
                  Seamless planning from airport lounge to overwater villa. Our team watches fare drops,
                  unlocks local-only perks, and keeps itineraries flexible—so you can focus on the view.
                </p>

                <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-slate-900 shadow-[0_24px_60px_rgba(255,255,255,0.35)]"
                  >
                    Plan my stay
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/30 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[0.32em] text-white/80 backdrop-blur"
                  >
                    Talk to an expert
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-6 text-left shadow-[0_24px_80px_-30px_rgba(59,130,246,0.55)] backdrop-blur">
                {[{
                  label: "Customer rating",
                  value: "4.9",
                  suffix: "/5"
                }, {
                  label: "Travellers assisted",
                  value: "50K",
                  suffix: "+"
                }, {
                  label: "Support availability",
                  value: "24/7",
                  suffix: ""
                }].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-white">
                      {stat.value}
                      <span className="text-lg text-white/70">{stat.suffix}</span>
                    </p>
                  </motion.div>
                ))}
                <p className="text-xs text-white/60">
                  TravelEase operates with fully licensed tour partners and global insurance coverage.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
