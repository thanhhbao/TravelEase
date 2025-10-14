import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, User, Star, ArrowRight, Plane, Anchor, Ship, Waves } from "lucide-react";

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
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.12 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => {
      if (ref.current) obs.unobserve(ref.current);
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

  const scrollY = useScrollAnimation();

  useEffect(() => {
    setFeaturedHotels(mockHotels);
  }, []);

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
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0" style={{ y: scrollY * 0.35 }}>
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop"
            alt="Ocean horizon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-sky-800/40 to-sky-700/30" />
        </motion.div>

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
                        <input
                          type="text"
                          placeholder="Where to? (e.g., Nha Trang)"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
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
                        <input
                          type="text"
                          placeholder="Departure city"
                          value={fromCity}
                          onChange={(e) => setFromCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sky-50 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" /> To
                        </label>
                        <input
                          type="text"
                          placeholder="Arrival city"
                          value={toCity}
                          onChange={(e) => setToCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                        />
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
                  <Search className="" /> Search Now
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
                Why TravelEase
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
