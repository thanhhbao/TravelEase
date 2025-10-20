import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plane,
  Calendar,
  Minus,
  Plus,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
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
type SortKey = "cheapest" | "non-stop" | "earliest" | "latest";
type Filters = {
  freeCancellation: boolean;
  noPrepayment: boolean;
  breakfastIncluded: boolean;
  hotels: boolean;
};
type FilterKey = keyof Filters;

/* ===================== Mock demo ===================== */
const mockFlights: Flight[] = [
  {
    id: 1,
    airline: "Garuda Indonesia",
    flightNumber: "GI 2112 · 14h30m",
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
    flightNumber: "QA 1444 · 14h30m",
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
    flightNumber: "EK 882 · 15h10m",
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

const PAGE_SIZE = 8;

/* ===================== Page ===================== */
export default function FlightsNew() {
  /** Core state (giản lược, dễ thay API sau) */
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  /** Search state */
  const [fromCity, setFromCity] = useState("Soekarno Hatta (CGK)");
  const [toCity, setToCity] = useState("Zurich (ZRH)");
  const [depart, setDepart] = useState("2024-12-28");
  const [ret, setRet] = useState("2024-12-31");
  const [pax, setPax] = useState(2);

  /** Filters & sort */
  const [sortBy, setSortBy] = useState<SortKey>("cheapest");
  const [budget, setBudget] = useState<[number, number]>([200, 600]);
  const [filters, setFilters] = useState<Filters>({
    freeCancellation: false,
    noPrepayment: false,
    breakfastIncluded: false,
    hotels: false,
  });

  /** UI filter panel (mobile) */
  const [filterOpen, setFilterOpen] = useState(false);

  /** Fetch demo */
  useEffect(() => {
    setIsLoading(true);
    // giả lập fetch
    const t = setTimeout(() => {
      setFlights(mockFlights);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const parseStops = (s: string) => {
    if (/non\s*stop/i.test(s)) return 0;
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 99;
  };

  /** Derived list */
  const visible = useMemo(() => {
    const list = [...flights].filter((f) => f.price >= budget[0] && f.price <= budget[1]);

    switch (sortBy) {
      case "cheapest":
        list.sort((a, b) => a.price - b.price);
        break;
      case "non-stop":
        list.sort((a, b) => parseStops(a.stops) - parseStops(b.stops) || a.price - b.price);
        break;
      case "earliest":
        list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case "latest":
        list.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
        break;
    }
    return list;
  }, [flights, budget, sortBy]);

  /** Pagination (nếu sau này nhiều dữ liệu) */
  const [page, setPage] = useState(1);
  const total = visible.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageList = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return visible.slice(s, s + PAGE_SIZE);
  }, [visible, page]);
  useEffect(() => setPage(1), [visible]);

  /** Events */
  const toggleFilter = (k: FilterKey) => setFilters((p) => ({ ...p, [k]: !p[k] }));
  const resetFilters = () => {
    setBudget([200, 600]);
    setFilters({
      freeCancellation: false,
      noPrepayment: false,
      breakfastIncluded: false,
      hotels: false,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      {/* Top bar (sticky) */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* From */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">From</label>
              <input
                className="mt-1 w-full h-11 rounded-xl border border-sky-200 bg-white px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="City or airport"
              />
            </div>
            {/* To */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">To</label>
              <input
                className="mt-1 w-full h-11 rounded-xl border border-sky-200 bg-white px-3"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="City or airport"
              />
            </div>
            {/* Dates */}
            <div className="md:col-span-3 grid grid-cols-2 gap-2">
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
                    className="w-full h-11 rounded-xl border border-sky-200 bg-white px-3 pr-8"
                    value={ret}
                    onChange={(e) => setRet(e.target.value)}
                  />
                  <Calendar className="h-4 w-4 text-sky-500 absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
            {/* Pax */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Passengers</label>
              <div className="mt-1 h-11 rounded-xl border border-sky-200 bg-white px-2 flex items-center justify-between">
                <button onClick={() => setPax((n) => Math.max(1, n - 1))} className="p-2 rounded-lg hover:bg-sky-50">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold">{pax}</span>
                <button onClick={() => setPax((n) => n + 1)} className="p-2 rounded-lg hover:bg-sky-50">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Actions */}
            <div className="md:col-span-1 flex gap-2 items-end">
              <button
                onClick={() => setFilterOpen(true)}
                className="h-11 flex-1 rounded-xl border border-sky-200 bg-white text-slate-800 font-semibold hover:bg-sky-50 inline-flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <button
                onClick={runSearch}
                className="h-11 flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600 inline-flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>

          {/* Chips row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <SortChip label="Cheapest" active={sortBy === "cheapest"} onClick={() => setSortBy("cheapest")} />
            <SortChip label="Non-stop first" active={sortBy === "non-stop"} onClick={() => setSortBy("non-stop")} />
            <SortChip label="Earliest" active={sortBy === "earliest"} onClick={() => setSortBy("earliest")} />
            <SortChip label="Latest" active={sortBy === "latest"} onClick={() => setSortBy("latest")} />
            <div className="ml-auto text-slate-500">
              {fromCity} → {toCity}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <FilterPanel
              budget={budget}
              setBudget={setBudget}
              filters={filters}
              toggleFilter={toggleFilter}
              reset={resetFilters}
            />
          </aside>

          {/* Results */}
          <section className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-600">
                Found <span className="font-semibold text-slate-900">{total}</span> flights
              </div>
              <div className="text-sm text-slate-500">Budget: ${budget[0]}–${budget[1]}</div>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-sky-100 bg-white/70 p-10 grid place-items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600" />
              </div>
            ) : total === 0 ? (
              <EmptyState onReset={runSearch} />
            ) : (
              <>
                {pageList.map((f) => (
                  <FlightCard
                    key={f.id}
                    f={f}
                    expanded={expanded === f.id}
                    onToggle={() => setExpanded((id) => (id === f.id ? null : f.id))}
                    parseStops={parseStops}
                  />
                ))}

                {/* Pagination */}
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
              </>
            )}
          </section>
        </div>
      </main>

      {/* Filter Drawer (mobile & tablet) */}
      {filterOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-64px-64px)]">
              <FilterPanel
                budget={budget}
                setBudget={setBudget}
                filters={filters}
                toggleFilter={toggleFilter}
                reset={resetFilters}
              />
            </div>
            <div className="p-4 border-t border-slate-200">
              <button
                className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600"
                onClick={() => setFilterOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
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

function FilterPanel({
  budget,
  setBudget,
  filters,
  toggleFilter,
  reset,
}: {
  budget: [number, number];
  setBudget: (v: [number, number]) => void;
  filters: Filters;
  toggleFilter: (k: FilterKey) => void;
  reset: () => void;
}) {
  const [openBudget, setOpenBudget] = useState(true);
  const [openPopular, setOpenPopular] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold">Refine</h4>
        <button onClick={reset} className="text-sm text-sky-700 hover:text-sky-900 font-medium">
          Reset
        </button>
      </div>

      {/* Budget */}
      <div className="rounded-2xl border border-sky-100 bg-white p-5">
        <button
          onClick={() => setOpenBudget((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <span className="font-semibold text-slate-900">Budget</span>
          {openBudget ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {openBudget && (
          <div className="mt-4">
            <input
              type="range"
              min={100}
              max={1000}
              value={budget[1]}
              onChange={(e) => setBudget([budget[0], parseInt(e.target.value, 10)])}
              className="w-full accent-sky-600"
            />
            <div className="mt-2 flex justify-between text-sm font-medium text-slate-900">
              <span>${budget[0]}</span>
              <span>${budget[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Popular */}
      <div className="rounded-2xl border border-sky-100 bg-white p-5">
        <button
          onClick={() => setOpenPopular((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <span className="font-semibold text-slate-900">Popular</span>
          {openPopular ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {openPopular && (
          <div className="mt-4 space-y-3 text-sm">
            {([
              { k: "freeCancellation", label: "Free cancellation" },
              { k: "noPrepayment", label: "No prepayment" },
              { k: "breakfastIncluded", label: "Breakfast included" },
              { k: "hotels", label: "Show hotels" },
            ] as { k: FilterKey; label: string }[]).map(({ k, label }) => (
              <label key={k} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                  checked={filters[k]}
                  onChange={() => toggleFilter(k)}
                />
                <span className="text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-5">
        <div className="font-semibold text-slate-900">Travel tip</div>
        <p className="text-sm text-slate-600 mt-1">
          Flying before 9:00 can save on average 10–15% on popular routes.
        </p>
      </div>
    </div>
  );
}

function FlightCard({
  f,
  expanded,
  onToggle,
  parseStops,
}: {
  f: Flight;
  expanded: boolean;
  onToggle: () => void;
  parseStops: (s: string) => number;
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
            <Badge>{parseStops(f.stops) === 0 ? "Direct" : f.stops}</Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5 flex items-center justify-between text-slate-700">
          <div>
            <div className="text-xs text-slate-500 mb-1">Wed, 21 Jun</div>
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
            <div className="text-xs text-slate-500 mb-1">Thu, 22 Jun</div>
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
            <button className="px-5 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold hover:from-sky-600 hover:to-cyan-600">
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
