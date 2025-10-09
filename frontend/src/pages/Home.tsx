import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, User, Star, ArrowRight, Plane } from 'lucide-react';

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

const mockHotels: FeaturedHotel[] = [
  {
    id: 1,
    name: "Grand Luxury Resort",
    location: "Bali, Indonesia",
    rating: 4.8,
    reviews: 342,
    price: 299,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    amenities: ["Pool", "Spa", "Restaurant"],
  },
  {
    id: 2,
    name: "Ocean View Paradise",
    location: "Maldives",
    rating: 4.9,
    reviews: 521,
    price: 450,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
    amenities: ["Beach", "Diving", "Spa"],
  },
  {
    id: 3,
    name: "Mountain Peak Lodge",
    location: "Swiss Alps",
    rating: 4.7,
    reviews: 287,
    price: 380,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop",
    amenities: ["Ski", "Sauna", "Restaurant"],
  },
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Caesar Marcio",
    rating: 4.5,
    text: "Outstanding service and beautiful accommodations. Highly recommend!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Luis Many",
    rating: 4.7,
    text: "The best booking experience I've ever had. Everything was perfect!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop",
  },
];

// Hook để detect scroll
const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

// Component cho các phần tử fade in khi scroll
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [searchType, setSearchType] = useState<"hotels" | "flights">("hotels");
  const [location, setLocation] = useState<string>("");
  const [persons, setPersons] = useState<string>("1");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [fromCity, setFromCity] = useState<string>("");
  const [toCity, setToCity] = useState<string>("");
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
      title: "We offer the premier selection of lodgings for your stay.",
      description: "We invariably prioritize client ease and contentment. Hence, we exclusively approve the finest lodgings.",
    },
    {
      number: "02",
      title: "Excellent value, top-tier quality.",
      description: "Though the cost may be lower, it won't impact service quality, and we strive to provide",
    },
    {
      number: "03",
      title: "Eligible for full reimbursement.",
      description: "Fear not if an issue arises and you wish to withdraw.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background with Parallax */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: scrollY * 0.5 }}
        >
          <img
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1740&auto=format&fit=crop"
            alt="Luxury hotel view"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mb-12"
          >
            <h1 className="text-white text-6xl md:text-7xl font-bold leading-tight mb-6">
              Experience The Grand
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Escape At TravelEase
              </span>
            </h1>
            <p className="text-white/90 text-lg leading-relaxed">
              We've been in the ideal lodging where your fantasy getaway becomes reality, and we assist you in discovering the finest rates everywhere.
            </p>
          </motion.div>

          {/* Glass Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-30" />
            
            {/* Main glass card */}
            <div className="relative bg-gray-800 rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              
              <div className="relative">
                {/* Tab Switcher */}
                <div className="inline-flex bg-white/20 backdrop-blur-xl rounded-3xl p-1.5 mb-8 border border-white/30">
                  {(["hotels", "flights"] as const).map((tab) => {
                    const active = searchType === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSearchType(tab)}
                        className="relative px-8 py-3 rounded-3xl font-semibold transition-all duration-300"
                      >
                        {active && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-white rounded-3xl shadow-lg"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className={`relative z-10 flex items-center gap-2 ${active ? 'text-gray-900' : 'text-white'}`}>
                          {tab === "hotels" ? <MapPin className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
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
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="Where to?"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <User className="w-4 h-4 mr-2" />
                          Guests
                        </label>
                        <select
                          value={persons}
                          onChange={(e) => setPersons(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 Persons</option>
                          <option value="3">3 Persons</option>
                          <option value="4">4+ Persons</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="flights"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-5 gap-6"
                    >
                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          From
                        </label>
                        <input
                          type="text"
                          placeholder="Departure"
                          value={fromCity}
                          onChange={(e) => setFromCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          To
                        </label>
                        <input
                          type="text"
                          placeholder="Arrival"
                          value={toCity}
                          onChange={(e) => setToCity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Departure
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Return
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-white/90 font-medium text-sm">
                          <User className="w-4 h-4 mr-2" />
                          Passengers
                        </label>
                        <select
                          value={persons}
                          onChange={(e) => setPersons(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="mt-8 w-full md:w-auto bg-white text-grey px-10 py-4 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all group"
                >
                  <Search className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 " />
                  Search Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block"
              >
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Why Choose Us
                </h2>
                <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6" />
              </motion.div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                You should choose us because we provide the best accommodation and we have worked all over the world
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Gallery */}
            <ScrollReveal delay={0.2}>
              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="col-span-2 relative rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop"
                      alt="Luxury villa"
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute top-6 left-6 backdrop-blur-xl bg-white/90 rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonials[0].image}
                          alt={testimonials[0].name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{testimonials[0].name}</div>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-gray-600 text-sm">{testimonials[0].rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop"
                      alt="Pool view"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="relative rounded-3xl overflow-hidden shadow-xl"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop"
                      alt="Hotel exterior"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Features */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={0.1 * (index + 3)}>
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all">
                        {feature.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Featured Luxury Hotels
              </h2>
              <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6" />
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Discover our handpicked selection of premium accommodations
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredHotels.map((hotel, index) => (
              <ScrollReveal key={hotel.id} delay={0.1 * index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-xl mb-6 group-hover:shadow-2xl transition-all">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4 backdrop-blur-xl bg-white/90 px-5 py-3 rounded-full font-bold text-gray-900 shadow-lg">
                      ${hotel.price}/night
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{hotel.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{hotel.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-3 shadow-xl group"
              >
                View All Hotels
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                Ready to Start Your
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                  Journey?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
                Join over 50,000 satisfied travelers who trust TravelEase for their premium booking experience
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-gray-900 px-10 py-5 rounded-full font-bold hover:bg-gray-100 transition-all shadow-2xl group"
                >
                  <span className="flex items-center gap-3">
                    Book Premium Hotels
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-10 py-5 rounded-full font-bold hover:bg-white hover:text-gray-900 transition-all shadow-2xl backdrop-blur-sm group"
                >
                  <span className="flex items-center gap-3">
                    Find Best Flights
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto pt-16 border-t border-white/20">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="space-y-2"
                >
                  <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                    4.9/5
                  </div>
                  <div className="text-gray-400 text-lg">Customer Rating</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="space-y-2"
                >
                  <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                    50K+
                  </div>
                  <div className="text-gray-400 text-lg">Happy Travelers</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="space-y-2"
                >
                  <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                    24/7
                  </div>
                  <div className="text-gray-400 text-lg">Premium Support</div>
                </motion.div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}