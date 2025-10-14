import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plane,
  Calendar,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Filter,
} from "lucide-react";


/* ===================== Types ===================== */
type Flight = {
  id: number;
  airline: string;
  flightNumber: string;
  logo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string; // "Non Stop" | "1 Stop" | "2 Stops"...
  price: number;
  class: string;
};

type SortKey = "cheapest" | "non-stop" | "prefer" | "other";

type Filters = {
  freeCancellation: boolean;
  hotels: boolean;
  noPrepayment: boolean;
  breakfastIncluded: boolean;
};
type FilterKey = keyof Filters;

/* ===================== Mock data ===================== */
const mockFlights: Flight[] = [
  {
    id: 1,
    airline: "Garuda Indonesia",
    flightNumber: "GI 2112 | 14 h 30 min",
    logo:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop",
    from: "Indonesia (CGK)",
    to: "Switzerland (ZRH)",
    departureTime: "10:00 PM",
    arrivalTime: "1:30 AM",
    duration: "2h 30m",
    stops: "Non Stop",
    price: 540,
    class: "Economy",
  },
  {
    id: 2,
    airline: "Qatar Airways",
    flightNumber: "QA 1444 | 14 h 30 min",
    logo:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop",
    from: "Indonesia (CGK)",
    to: "Switzerland (ZRH)",
    departureTime: "09:15 PM",
    arrivalTime: "12:45 AM",
    duration: "3h 05m",
    stops: "1 Stop",
    price: 575,
    class: "Economy",
  },
  {
    id: 3,
    airline: "Emirates",
    flightNumber: "EK 882 | 15 h 10 min",
    logo:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop",
    from: "Indonesia (CGK)",
    to: "Switzerland (ZRH)",
    departureTime: "07:30 PM",
    arrivalTime: "11:00 PM",
    duration: "2h 40m",
    stops: "2 Stops",
    price: 499,
    class: "Economy",
  },
];

/* ===================== Component ===================== */
export default function Flights() {
  /* ---- core state ---- */
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedFlight, setExpandedFlight] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("cheapest");

  /* ---- search params ---- */
  const [fromCity, setFromCity] = useState<string>("Soekarno Hatta Airport — CGK");
  const [toCity, setToCity] = useState<string>("Switzerland — ZRH");
  const [dateFrom, setDateFrom] = useState<string>("2024-12-28");
  const [dateTo, setDateTo] = useState<string>("2024-12-31");
  const [persons, setPersons] = useState<number>(2);

  /* ---- filters ---- */
  const [budgetRange, setBudgetRange] = useState<[number, number]>([200, 500]);
  const [showBudgetFilter, setShowBudgetFilter] = useState<boolean>(true);
  const [showPopularFilter, setShowPopularFilter] = useState<boolean>(true);
  const [showFunThings, setShowFunThings] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    freeCancellation: false,
    hotels: false,
    noPrepayment: false,
    breakfastIncluded: false,
  });

 // thay thế useEffect hiện tại trong FlightDetail
useEffect(() => {
  setIsLoading(true);

  fetch("/mock/flights.json")
    .then((r) => r.json())
    .then((rows: any[]) => {
      // map JSON -> schema FlightDetail đang dùng
      const mapped = rows.map((r, i) => {
        const fmt = (s: string) =>
          new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        return {
          id: r.id ?? i + 1,
          airline: r.airline,
          flightNumber: r.flightNumber,
          from: r.fromAirport,      // map field
          to: r.toAirport,          // map field
          departureTime: fmt(r.departureTime),
          arrivalTime: fmt(r.arrivalTime),
          duration: `${Math.floor(r.durationMin / 60)}h ${r.durationMin % 60}m`,
          stops: "Non Stop",        // dữ liệu generator là chuyến thẳng; bạn có thể tính khác nếu muốn
          price: r.price,
          class: "Economy",
          logo: r.logo || "",
        };
      });

      setFlights(mapped);
    })
    .catch((e) => {
      console.error("Load flights failed:", e);
      setFlights([]); // fallback
    })
    .finally(() => setIsLoading(false));
}, []);


  const handleSearch = () => {
    setIsLoading(true);
    const t = setTimeout(() => {
      // giữ nguyên logic demo
      setFlights(mockFlights);
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(t);
  };

  const toggleFilter = (key: FilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const parseStops = (s: string) => {
    if (/non\s*stop/i.test(s)) return 0;
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 99;
    // 99 để luôn đứng sau các tuỳ chọn có dữ liệu
  };

  /* ---- derived list ---- */
  const visibleFlights: Flight[] = useMemo(
    () =>
      [...flights]
        .filter((f) => f.price >= budgetRange[0] && f.price <= budgetRange[1])
        .sort((a, b) => {
          if (sortBy === "cheapest") return a.price - b.price;
          if (sortBy === "non-stop")
            return parseStops(a.stops) - parseStops(b.stops) || a.price - b.price;
          return 0;
        }),
    [flights, budgetRange, sortBy]
  );

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Top Controls ===== */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          {/* Pills row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* From */}
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-600 mb-1 block">From</label>
              <div className="relative group">
                <input
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="From"
                  className="w-full h-[52px] rounded-xl border border-gray-200 bg-white px-4 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/70"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDown className="h-5 w-5" />
                </span>
              </div>
            </div>

            {/* To */}
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-600 mb-1 block">To</label>
              <div className="relative">
                <input
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="To"
                  className="w-full h-[52px] rounded-xl border border-gray-200 bg-white px-4 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/70"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDown className="h-5 w-5" />
                </span>
              </div>
            </div>

            {/* Date range */}
            <div className="md:col-span-3">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Departure Date
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full h-[52px] rounded-xl border border-gray-200 bg-white px-4 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/70"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full h-[52px] rounded-xl border border-gray-200 bg-white px-4 pr-9 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/70"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Passengers
              </label>
              <div className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-2 flex items-center justify-between">
                <button
                  onClick={() => setPersons((n) => Math.max(1, n - 1))}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Decrease passengers"
                >
                  <Minus className="h-5 w-5 text-gray-700" />
                </button>
                <div className="px-3 text-gray-900 font-medium select-none">
                  {persons} {persons > 1 ? "People" : "Person"}
                </div>
                <button
                  onClick={() => setPersons((n) => n + 1)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Increase passengers"
                >
                  <Plus className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleSearch}
                className="inline-flex w-full md:w-auto items-center justify-center gap-2 h-[52px] px-5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span className="hidden md:inline">Search Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main ===== */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button className="text-sm text-gray-500 hover:text-gray-900">
                  Reset
                </button>
              </div>

              {/* Transit Amount */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <p className="font-semibold text-gray-900 mb-4">Transit Amount</p>
                <div className="space-y-3 text-sm">
                  {["All", "Non-Transit", "1 stop", "2 stop"].map((x) => (
                    <label key={x} className="flex items-center gap-3">
                      <input type="radio" name="transit" className="accent-gray-900" />
                      <span className="text-gray-700">{x}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <button
                  onClick={() => setShowBudgetFilter((v) => !v)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <span className="font-semibold text-gray-900">Price Range</span>
                  {showBudgetFilter ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {showBudgetFilter && (
                  <>
                    <input
                      type="range"
                      min={100}
                      max={1000}
                      value={budgetRange[1]}
                      onChange={(e) =>
                        setBudgetRange([budgetRange[0], parseInt(e.target.value, 10)])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm font-medium text-gray-900 mt-2">
                      <span>${budgetRange[0]}</span>
                      <span>${budgetRange[1]}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Popular */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <button
                  onClick={() => setShowPopularFilter((v) => !v)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <span className="font-semibold text-gray-900">Popular Filter</span>
                  {showPopularFilter ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {showPopularFilter && (
                  <div className="space-y-3">
                    {([
                      { key: "freeCancellation", label: "Free Cancellation", count: 305 },
                      { key: "hotels", label: "Hotels", count: 214 },
                      { key: "noPrepayment", label: "No Prepayment", count: 325 },
                      { key: "breakfastIncluded", label: "Breakfast Included", count: 106 },
                    ] as { key: FilterKey; label: string; count: number }[]).map((f) => (
                      <label
                        key={f.key}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters[f.key]}
                            onChange={() => toggleFilter(f.key)}
                            className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-gray-700 group-hover:text-gray-900">
                            {f.label}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">{f.count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Filter apply */}
              <button className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white h-12 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                <Filter className="h-5 w-5" />
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-9">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-200 px-4 md:px-6 py-3 mb-4 flex items-center justify-between">
              <div className="text-sm md:text-base text-gray-700">
                Result • <span className="font-semibold">{visibleFlights.length}</span>{" "}
                flights found
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm hidden md:block">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/70"
                >
                  <option value="cheapest">Cheapest</option>
                  <option value="non-stop">Non Stop First</option>
                  <option value="prefer">You May Prefer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-900" />
              </div>
            ) : visibleFlights.length > 0 ? (
              <div className="space-y-5">
                {visibleFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-5 md:p-6">
                      {/* Top row */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Airline */}
                        <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
  <img
    src={flight.logo}                         // URL Clearbit từ JSON
    alt={`${flight.airline} logo`}
    className="max-w-full max-h-full object-contain"
    loading="lazy"
    referrerPolicy="no-referrer"
    onError={(e) => {
      const img = e.currentTarget as HTMLImageElement;
      // Nếu Clearbit bị chặn, thử logoAlt (Google favicon) từ JSON
      if (!img.dataset.fallbackTried && (flight as any).logoAlt) {
        img.dataset.fallbackTried = "1";
        img.src = (flight as any).logoAlt;
      } else {
        // Fallback cuối cùng
        img.src =
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&auto=format&fit=crop";
      }
    }}
  />
</div>

                          <div>
                            <div className="font-semibold text-gray-900">
                              {flight.airline}
                            </div>
                            <div className="text-gray-500 text-sm">{flight.flightNumber}</div>
                          </div>
                        </div>

                        {/* Chips */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                            {flight.class} Class
                          </span>
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                            {parseStops(flight.stops) === 0 ? "Direct Flight" : flight.stops}
                          </span>
                          <button className="ml-1 h-8 w-8 rounded-full bg-gray-100 text-gray-600 grid place-items-center hover:bg-gray-200">
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-gray-700">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Wed, 21 Jun</div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-semibold">{flight.departureTime}</span>
                              <span className="text-gray-600">{flight.from}</span>
                            </div>
                          </div>

                          {/* dotted line + plane */}
                          <div className="hidden md:flex items-center gap-2 flex-1 px-6">
                            <div className="h-px w-full border-t border-dotted border-gray-300" />
                            <div className="shrink-0 grid place-items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-900 text-white grid place-items-center shadow">
                                <Plane className="h-5 w-5 -rotate-90" />
                              </div>
                              <div className="text-xs text-gray-500 mt-1 text-center">
                                Estimate: {flight.duration}
                              </div>
                            </div>
                            <div className="h-px w-full border-t border-dotted border-gray-300" />
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Thu, 22 Jun</div>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-2xl font-semibold">{flight.arrivalTime}</span>
                              <span className="text-gray-600">{flight.to}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="text-3xl font-bold text-gray-900">
                          USD {flight.price.toFixed(2)}
                          <span className="text-sm text-gray-500 font-normal"> /person</span>
                        </div>
                        <button
                          onClick={() =>
                            setExpandedFlight((cur) => (cur === flight.id ? null : flight.id))
                          }
                          className="inline-flex items-center justify-center px-6 h-11 rounded-xl font-semibold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                        >
                          {expandedFlight === flight.id ? "Hide" : "Select Flight"}
                        </button>
                      </div>
                    </div>

                    {/* Expand area */}
                    {expandedFlight === flight.id && (
                      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>Class: {flight.class}</div>
                          <div>
                            Base ${Math.round(flight.price * 0.85)} + Tax $
                            {Math.round(flight.price * 0.15)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tabs row (UI only) */}
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-6 px-6 py-3 text-sm font-medium text-gray-600">
                        <button className="hover:text-gray-900">Flight Details</button>
                        <button className="hover:text-gray-900">Price Details</button>
                        <button className="hover:text-gray-900">Policy</button>
                        <button className="hover:text-gray-900">Refund</button>
                        <button className="hover:text-gray-900">Reschedule</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                <Plane className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No flights found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria to find more flights.
                </p>
                <button
                  onClick={handleSearch}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
