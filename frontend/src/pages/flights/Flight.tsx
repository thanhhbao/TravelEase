import { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  Plane,
  Calendar,
  Minus,
  Plus,
  SlidersHorizontal,
  X,
  ArrowLeftRight,
  Users,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AIRPORTS,
  groupAirportsByRegion,
  REGION_LABEL,
  type Airport,
  type RegionKey,
} from "../../data/airports";

/* ===================== Types (demo) ===================== */
type Flight = {
  id: number;
  airline: string;
  flightNumber: string;
  logo: string;
  from: string;
  to: string;
  departureTime: string; // "07:30 PM"
  arrivalTime: string; // "11:00 PM"
  duration: string; // "2h 40m"
  stops: string; // "Non Stop" | "1 Stop" | "2 Stops"
  price: number;
  class: string; // "Economy" | "Business"...
};

type SortKey = "cheapest" | "non-stop" | "earliest" | "latest";
type TripType = "round" | "oneway";
type CabinClass = "Economy" | "Premium Economy" | "Business" | "First";

type Filters = {
  stops: number[];
  airlines: string[];
  budget: [number, number];
};

const PAGE_SIZE = 8;

/* ===================== Mock demo ===================== */
const mockFlights: Flight[] = [
  {
    id: 1,
    airline: "Garuda Indonesia",
    flightNumber: "GI 2112 · 14h30m",
    logo:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop",
    from: "Hà Nội (HAN)",
    to: "Zurich (ZRH)",
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
    flightNumber: "QA 1444 · 14h30m",
    logo:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop",
    from: "TP. Hồ Chí Minh (SGN)",
    to: "Zurich (ZRH)",
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
    flightNumber: "EK 882 · 15h10m",
    logo:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop",
    from: "Đà Nẵng (DAD)",
    to: "Zurich (ZRH)",
    departureTime: "07:30 PM",
    arrivalTime: "11:00 PM",
    duration: "2h 40m",
    stops: "2 Stops",
    price: 499,
    class: "Economy",
  },
];

/* ===================== Helpers ===================== */
const parseStopsCount = (s: string) => {
  if (/non\s*stop/i.test(s)) return 0;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 99;
};
const timeToMinutes = (t: string) => {
  // "07:30 PM" -> minutes since 00:00 (naive)
  const [hhmm, ap] = t.split(" ");
  const [hh, mm] = hhmm.split(":").map(Number);
  let h = hh % 12;
  if (ap?.toUpperCase() === "PM") h += 12;
  return h * 60 + (mm || 0);
};

/* ===================== Page ===================== */
export default function Flights() {
  /** Core state */
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const navigate = useNavigate();

  /** Search state */
  const [tripType, setTripType] = useState<TripType>("round");
  const [fromCity, setFromCity] = useState("Hà Nội (HAN)");
  const [toCity, setToCity] = useState("Zurich (ZRH)");
  const [depart, setDepart] = useState("2024-12-28");
  const [ret, setRet] = useState("2024-12-31");
  const [pax, setPax] = useState(2);
  const [cabin, setCabin] = useState<CabinClass>("Economy");

  /** Sort & Filters */
  const [sortBy, setSortBy] = useState<SortKey>("cheapest");
  const [filters, setFilters] = useState<Filters>({
    stops: [0, 1, 2],
    airlines: [],
    budget: [200, 600],
  });

  /** LocationPicker (popup) */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<"from" | "to">("from");

  const openPicker = (field: "from" | "to") => {
    setPickerField(field);
    setPickerOpen(true);
  };
  const closePicker = () => setPickerOpen(false);
  const handleSelectAirport = (a: Airport) => {
    const label = `${a.city} (${a.iata})`;
    if (pickerField === "from") setFromCity(label);
    else setToCity(label);
    setPickerOpen(false);
  };

  /** Fetch demo */
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      setFlights(mockFlights);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  /** Derived list with filters + sort */
  const visible = useMemo(() => {
    const list = flights.filter((f) => {
      const priceOK = f.price >= filters.budget[0] && f.price <= filters.budget[1];
      const stopOK = filters.stops.includes(parseStopsCount(f.stops));
      const airlineOK = filters.airlines.length === 0 || filters.airlines.includes(f.airline);
      const cabinOK = cabin === "Economy" ? true : f.class === cabin;
      return priceOK && stopOK && airlineOK && cabinOK;
    });

    switch (sortBy) {
      case "cheapest":
        list.sort((a, b) => a.price - b.price);
        break;
      case "non-stop":
        list.sort(
          (a, b) => parseStopsCount(a.stops) - parseStopsCount(b.stops) || a.price - b.price
        );
        break;
      case "earliest":
        list.sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime));
        break;
      case "latest":
        list.sort((a, b) => timeToMinutes(b.departureTime) - timeToMinutes(a.departureTime));
        break;
    }
    return list;
  }, [flights, filters, sortBy, cabin]);

  /** Pagination */
  const [page, setPage] = useState(1);
  const total = visible.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageList = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return visible.slice(s, s + PAGE_SIZE);
  }, [visible, page]);
  useEffect(() => setPage(1), [visible]);

  /** Events */
  const swapRoute = () => {
    setFromCity((prev) => {
      const a = toCity;
      setToCity(prev);
      return a;
    });
  };
  const runSearch = () => {
    setIsLoading(true);
    const t = setTimeout(() => {
      setFlights(mockFlights);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  };
const toggleStop = (n: number) =>
  setFilters((p) => {
    const has = p.stops.includes(n);
    return { ...p, stops: has ? p.stops.filter((x) => x !== n) : [...p.stops, n] };
  });

/* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      {/* ===== Top Search (sticky) ===== */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-sky-50/90 backdrop-blur supports-[backdrop-filter]:bg-sky-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          {/* Row 1: trip & route */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Trip type */}
            <div className="md:col-span-2 flex h-11 rounded-xl border border-sky-200 bg-white overflow-hidden">
              <button
                className={`flex-1 text-sm font-semibold ${
                  tripType === "round"
                    ? "bg-sky-600 text-white"
                    : "text-slate-700 hover:bg-sky-50"
                }`}
                onClick={() => setTripType("round")}
              >
                Round trip
              </button>
              <button
                className={`flex-1 text-sm font-semibold ${
                  tripType === "oneway"
                    ? "bg-sky-600 text-white"
                    : "text-slate-700 hover:bg-sky-50"
                }`}
                onClick={() => setTripType("oneway")}
              >
                One way
              </button>
            </div>

            {/* From (readOnly + icon để gợi ý click) */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">From</label>
              <div className="relative mt-1">
                <input
                  className="w-full h-11 rounded-xl border border-sky-200 bg-white pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200 cursor-pointer"
                  value={fromCity}
                  readOnly
                  onClick={() => openPicker("from")}
                  placeholder="City or airport"
                />
                <MapPin className="h-4 w-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  onClick={() => openPicker("from")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-label="open from picker"
                >
                  ▾
                </button>
              </div>
            </div>

            {/* Swap */}
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={swapRoute}
                className="w-full h-11 rounded-xl border border-sky-200 bg-white text-slate-800 font-semibold hover:bg-sky-50 inline-flex items-center justify-center gap-2"
                title="Swap"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Swap
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">To</label>
              <div className="relative mt-1">
                <input
                  className="w-full h-11 rounded-xl border border-sky-200 bg-white pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-200 cursor-pointer"
                  value={toCity}
                  readOnly
                  onClick={() => openPicker("to")}
                  placeholder="City or airport"
                />
                <MapPin className="h-4 w-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  onClick={() => openPicker("to")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-label="open to picker"
                >
                  ▾
                </button>
              </div>
            </div>

            {/* Pax & cabin */}
            <div className="md:col-span-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">Passengers</label>
                <div className="mt-1 h-11 rounded-xl border border-sky-200 bg-white px-2 flex items-center justify-between">
                  <button
                    onClick={() => setPax((n) => Math.max(1, n - 1))}
                    className="p-2 rounded-lg hover:bg-sky-50"
                    aria-label="decrease passengers"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold inline-flex items-center gap-1">
                    <Users className="h-4 w-4" /> {pax}
                  </span>
                  <button
                    onClick={() => setPax((n) => n + 1)}
                    className="p-2 rounded-lg hover:bg-sky-50"
                    aria-label="increase passengers"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Cabin</label>
                <select
                  className="mt-1 w-full h-11 rounded-xl border border-sky-200 bg-white px-3"
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value as CabinClass)}
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: dates & actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Dates */}
            <div className="md:col-span-6 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">Depart</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    className="w-full h-11 rounded-xl border border-sky-200 bg-white px-3 pr-8"
                    value={depart}
                    onChange={(e) => setDepart(e.target.value)}
                  />
                  <Calendar className="h-4 w-4 text-sky-500 absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Return</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    className="w-full h-11 rounded-xl border border-sky-200 bg-white px-3 pr-8 disabled:opacity-50"
                    value={ret}
                    onChange={(e) => setRet(e.target.value)}
                    disabled={tripType === "oneway"}
                  />
                  <Calendar className="h-4 w-4 text-sky-500 absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Quick filters (Stops) */}
            <div className="md:col-span-3 flex items-end gap-2">
              {[0, 1, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => toggleStop(n)}
                  className={[
                    "h-11 flex-1 rounded-xl border text-sm font-semibold",
                    filters.stops.includes(n)
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-sky-200 bg-white text-slate-700 hover:bg-sky-50",
                  ].join(" ")}
                  title={n === 0 ? "Non-stop" : n === 1 ? "1 Stop" : "2+ Stops"}
                >
                  {n === 0 ? "Non-stop" : n === 1 ? "1 Stop" : "2+ Stops"}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="md:col-span-3 flex gap-2 items-end">
              <button
                className="h-11 flex-1 rounded-xl border border-sky-200 bg-white text-slate-800 font-semibold hover:bg-sky-50 inline-flex items-center justify-center gap-2"
                onClick={() => alert("Open advanced filters panel")}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <button
                onClick={runSearch}
                className="h-11 flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600 inline-flex items-center justify-center gap-2"
              >
                <SearchIcon className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>

          {/* Sort & route summary */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <SortChip
              label="Cheapest"
              active={sortBy === "cheapest"}
              onClick={() => setSortBy("cheapest")}
            />
            <SortChip
              label="Non-stop first"
              active={sortBy === "non-stop"}
              onClick={() => setSortBy("non-stop")}
            />
            <SortChip
              label="Earliest"
              active={sortBy === "earliest"}
              onClick={() => setSortBy("earliest")}
            />
            <SortChip
              label="Latest"
              active={sortBy === "latest"}
              onClick={() => setSortBy("latest")}
            />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-slate-500">
                {fromCity} → {toCity} • {pax} pax •{" "}
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {cabin}
                </span>
              </span>
              <select
                className="h-9 rounded-lg border border-sky-200 bg-white px-2 text-slate-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                aria-label="Sort results"
              >
                <option value="cheapest">Sort: Cheapest</option>
                <option value="non-stop">Sort: Non-stop first</option>
                <option value="earliest">Sort: Earliest</option>
                <option value="latest">Sort: Latest</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Content ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <ResultsSkeleton />
        ) : total === 0 ? (
          <EmptyState onReset={runSearch} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-600">
                Found <span className="font-semibold text-slate-900">{total}</span> flights
              </div>
              <div className="text-sm text-slate-500">
                Budget: ${filters.budget[0]}–${filters.budget[1]}
              </div>
            </div>

            {pageList.map((f) => (
              <FlightCard
                key={f.id}
                f={f}
                expanded={expanded === f.id}
                onToggle={() => setExpanded((id) => (id === f.id ? null : f.id))}
                onBook={() =>
                  navigate(`/flights/${f.id}`, {
                    state: {
                      flight: f,
                      search: { fromCity, toCity, depart, ret, pax, cabin, tripType },
                    },
                  })
                }
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 px-4 rounded-xl border border-sky-200 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-sky-50"
                >
                  Previous
                </button>
                <div className="text-sm">
                  Page <span className="font-semibold">{page}</span> / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-10 px-4 rounded-xl border border-sky-200 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-sky-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== Location Picker (popup) ===== */}
      <LocationPicker
        open={pickerOpen}
        field={pickerField}
        onClose={closePicker}
        onSelect={handleSelectAirport}
      />
    </div>
  );
}

/* ===================== Subcomponents ===================== */

function SortChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm border transition-all",
        active
          ? "bg-sky-600 text-white border-sky-600 shadow"
          : "bg-white text-slate-700 border-sky-200 hover:bg-sky-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FlightCard({
  f,
  expanded,
  onToggle,
  onBook,
}: {
  f: Flight;
  expanded: boolean;
  onToggle: () => void;
  onBook: () => void;
}) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 overflow-hidden grid place-items-center">
              <img
                src={f.logo}
                alt={`${f.airline} logo`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&auto=format&fit=crop";
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{f.airline}</div>
              <div className="text-slate-500 text-sm">{f.flightNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{f.class}</Badge>
            <Badge>{parseStopsCount(f.stops) === 0 ? "Direct" : f.stops}</Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5 flex items-center justify-between text-slate-700">
          <div>
            <div className="text-xs text-slate-500 mb-1">Depart</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{f.departureTime}</span>
              <span className="text-slate-600">{f.from}</span>
            </div>
          </div>
        <div className="hidden md:flex items-center gap-2 flex-1 px-6">
            <div className="h-px w-full border-t border-dotted border-slate-300" />
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white grid place-items-center shadow">
              <Plane className="h-5 w-5 -rotate-90" />
            </div>
            <div className="h-px w-full border-t border-dotted border-slate-300" />
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Arrive</div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-bold">{f.arrivalTime}</span>
              <span className="text-slate-600">{f.to}</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-3xl font-extrabold text-slate-900">
            USD {f.price.toFixed(2)}
            <span className="text-sm text-slate-500 font-normal"> /person</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="px-5 h-11 rounded-xl border-2 border-sky-200 text-sky-700 font-bold hover:bg-sky-50"
            >
              {expanded ? "Hide details" : "Select flight"}
            </button>
            <button
              onClick={onBook}
              className="px-5 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-sky-100 bg-sky-50/60 px-5 py-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-slate-500">Baggage</div>
              <div className="font-medium">1 x 23kg checked</div>
            </div>
            <div>
              <div className="text-slate-500">Estimated</div>
              <div className="font-medium">{f.duration}</div>
            </div>
            <div>
              <div className="text-slate-500">Fare breakdown</div>
              <div className="font-medium">
                Base ${Math.round(f.price * 0.85)} + Tax ${Math.round(f.price * 0.15)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-sm font-medium">
      {children}
    </span>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-12 text-center">
      <Plane className="h-16 w-16 text-sky-300 mx-auto mb-4" />
      <h3 className="text-2xl font-bold">No flights found</h3>
      <p className="text-slate-600 mt-2">Change dates/airports or relax filters to see more.</p>
      <button
        onClick={onReset}
        className="mt-6 px-6 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
      >
        Try again
      </button>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-sky-100 bg-white p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-32 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===================== LocationPicker ===================== */

function LocationPicker({
  open,
  field,
  onClose,
  onSelect,
}: {
  open: boolean;
  field: "from" | "to";
  onClose: () => void;
  onSelect: (a: Airport) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<RegionKey>("VIETNAM");

  const grouped = useMemo(() => groupAirportsByRegion(AIRPORTS), []);
  const regions = Object.keys(grouped) as RegionKey[];

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  const list = useMemo(() => {
    const base = grouped[activeRegion] || [];
    if (!query.trim()) return base;
    const q = normalize(query);
    return base.filter((a) =>
      [a.iata, a.city, a.name, a.country].map(normalize).some((v) => v.includes(q))
    );
  }, [grouped, activeRegion, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[min(960px,95vw)] h-[70vh] bg-white rounded-2xl shadow-xl grid grid-rows-[48px_1fr]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5">
          <div className="font-semibold text-slate-800 py-3">
            {field === "from" ? "Chọn điểm đi" : "Chọn điểm đến"}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[220px_1fr] overflow-hidden">
          {/* Left region list */}
          <aside className="border-r border-slate-200 overflow-y-auto">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`w-full px-4 py-3 border-b text-left font-semibold ${
                  activeRegion === r ? "bg-sky-600 text-white" : "hover:bg-sky-50 text-slate-800"
                }`}
              >
                {REGION_LABEL[r]}
              </button>
            ))}
          </aside>

          {/* Right airport list */}
          <section className="p-5 flex flex-col overflow-hidden">
            <div className="relative mb-3">
              <input
                className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 outline-none focus:ring-2 focus:ring-sky-200"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên thành phố hoặc mã sân bay..."
              />
              <SearchIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex-1 overflow-auto">
              {list.map((a) => (
                <button
                  key={a.iata + a.city}
                  onClick={() => onSelect(a)}
                  className="w-full px-3 py-2 text-left hover:bg-sky-50 border-b border-slate-100"
                >
                  <div className="font-semibold text-slate-900">
                    {a.city} ({a.iata})
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.name}, {a.country}
                  </div>
                </button>
              ))}
              {list.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-6">
                  Không có kết quả phù hợp.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
