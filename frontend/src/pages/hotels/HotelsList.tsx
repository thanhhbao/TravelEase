import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Grid, List, Star, MapPin, ChevronDown } from "lucide-react";
import { hotelsService, type HotelFull } from "../../services/hotels";

type ViewMode = "grid" | "list";

function getPageNumbers(current: number, total: number): (number | "...")[] {
  const MAX = 5;
  if (total <= MAX) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);
  const need = 3 - (end - start + 1);
  if (need > 0) {
    if (start > 2) start = Math.max(2, start - need);
    else end = Math.min(total - 1, end + need);
  }
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export default function HotelsList() {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState<HotelFull[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<HotelFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 9;

  const [filters, setFilters] = useState({
    location: (searchParams.get("location") || "").toLowerCase(),
    minPrice: 0,
    maxPrice: 1000,
    stars: 0,
    sortBy: "recommended" as "recommended" | "price-low" | "price-high" | "rating",
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await hotelsService.listHotels();
        setHotels(data);
        setFilteredHotels(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let list = [...hotels];

    if (filters.location) {
      list = list.filter(
        (h) =>
          h.city.toLowerCase().includes(filters.location) ||
          h.country.toLowerCase().includes(filters.location)
      );
    }

    list = list.filter(
      (h) =>
        (h.pricePerNight ?? 0) >= filters.minPrice &&
        (h.pricePerNight ?? 0) <= filters.maxPrice
    );

    if (filters.stars > 0) {
      list = list.filter((h) => (h.stars ?? 0) >= filters.stars);
    }

    if (filters.sortBy === "price-low") {
      list.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
    } else if (filters.sortBy === "price-high") {
      list.sort((a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0));
    } else if (filters.sortBy === "rating") {
      list.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    }

    setFilteredHotels(list);
    setCurrentPage(1);
  }, [hotels, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearAllFilters = () =>
    setFilters({ location: "", minPrice: 0, maxPrice: 1000, stars: 0, sortBy: "recommended" });

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHotels = useMemo(
    () => filteredHotels.slice(startIndex, startIndex + itemsPerPage),
    [filteredHotels, startIndex]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200">
      {/* Glassy hero */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            className="w-full h-72 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/1 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-16">
          <div className="max-w-3xl bg-white/15 backdrop-blur-lg border border-white/25 rounded-3xl p-6 md:p-8 text-white shadow-xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
              Discover Premium Hotels
            </h1>
            <p className="text-white/90 text-lg md:text-xl">
              Find your perfect stay from our curated collection of luxury accommodations worldwide.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters (glass) */}
          <aside className="lg:w-80">
            <div className="lg:sticky lg:top-8">
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="flex items-center justify-between w-full bg-white/60 backdrop-blur-md border border-white/40 px-5 py-3 rounded-2xl shadow hover:bg-white/70 transition"
                >
                  <span className="flex items-center gap-2 font-semibold text-slate-900">
                    <Filter className="h-5 w-5" /> Filters
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div className={`${showFilters ? "block" : "hidden"} lg:block space-y-6`}>
                {/* Location */}
                <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Location</h3>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value.toLowerCase())
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">All Locations</option>
                    <option value="new york">New York</option>
                    <option value="miami">Miami</option>
                    <option value="aspen">Aspen</option>
                    <option value="san francisco">San Francisco</option>
                    <option value="phoenix">Phoenix</option>
                  </select>
                </div>

                {/* Price */}
                <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Price Range</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">
                        Min Price: ${filters.minPrice}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        step={50}
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", parseInt(e.target.value, 10))
                        }
                        className="w-full accent-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-2 block">
                        Max Price: ${filters.maxPrice}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        step={50}
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", parseInt(e.target.value, 10))
                        }
                        className="w-full accent-slate-900"
                      />
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900">${filters.minPrice}</span>
                        <span className="text-slate-500">—</span>
                        <span className="font-semibold text-slate-900">${filters.maxPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">Star Rating</h3>
                  <div className="space-y-2">
                    {[0, 5, 4, 3].map((v) => (
                      <label key={v} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="stars"
                          value={v}
                          checked={filters.stars === v}
                          onChange={(e) =>
                            handleFilterChange("stars", parseInt(e.target.value, 10))
                          }
                          className="w-5 h-5 text-slate-900 focus:ring-2 focus:ring-slate-900/20"
                        />
                        <span className="text-slate-700 group-hover:text-slate-900">
                          {v === 0 ? "All Ratings" : `${v} Stars`}
                        </span>
                        {v > 0 && (
                          <span className="flex">
                            {Array.from({ length: v }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={clearAllFilters}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Header strip */}
            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {filteredHotels.length} Hotels Found
                  </h2>
                  <p className="text-slate-600">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + itemsPerPage, filteredHotels.length)} of{" "}
                    {filteredHotels.length} results
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value as any)
                    }
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Stars</option>
                  </select>

                  <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition ${
                        viewMode === "grid"
                          ? "bg-white shadow text-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition ${
                        viewMode === "list"
                          ? "bg-white shadow text-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            {currentHotels.length ? (
              <>
                <div
                  className={`grid gap-6 mb-8 ${
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  }`}
                >
                  {currentHotels.map((hotel) => (
                    <div key={hotel.id} className="group">
                      {viewMode === "grid" ? (
                        <div className="relative h-full flex flex-col bg-white/65 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition">
                          <Link to={`/hotels/${hotel.slug}`} className="absolute inset-0 z-10" />
                          <div className="relative h-64">
                            <img
                              src={hotel.thumbnail}
                              alt={hotel.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-slate-900 shadow">
                              ${hotel.pricePerNight}/night
                            </div>
                            <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{hotel.stars} Star</span>
                            </div>
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center text-slate-600 mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {hotel.city}, {hotel.country}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {(hotel.amenities ?? []).slice(0, 3).map((a, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-full text-sm bg-white/70 border border-white/60 backdrop-blur"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                            <div className="mt-auto">
                              <div className="w-full text-center bg-slate-900 text-white py-3 rounded-xl font-medium">
                                View Details
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative bg-white/65 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col md:flex-row">
                          <Link to={`/hotels/${hotel.slug}`} className="absolute inset-0 z-10" />
                          <div className="relative md:w-80 h-64 md:h-auto">
                            <img
                              src={hotel.thumbnail}
                              alt={hotel.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span>{hotel.stars} Star</span>
                            </div>
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                                {hotel.name}
                              </h3>
                              <div className="text-right ml-4">
                                <div className="text-3xl font-bold text-slate-900">
                                  ${hotel.pricePerNight}
                                </div>
                                <div className="text-slate-600 text-sm">per night</div>
                              </div>
                            </div>
                            <div className="flex items-center text-slate-600 mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {hotel.city}, {hotel.country}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(hotel.amenities ?? []).map((a, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-full text-sm bg-white/70 border border-white/60 backdrop-blur"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                            <div className="mt-4 bg-slate-900 text-white py-3 rounded-xl font-medium w-full">
                              View Details
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Compact pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl border border-white/50 bg-white/60 backdrop-blur hover:bg-white/80 disabled:opacity-50 transition"
                    >
                      Previous
                    </button>

                    {getPageNumbers(currentPage, totalPages).map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} className="px-2 select-none text-slate-500">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-10 h-10 rounded-xl font-medium transition ${
                            currentPage === p
                              ? "bg-slate-900 text-white"
                              : "border border-white/50 bg-white/60 backdrop-blur hover:bg-white/80"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl border border-white/50 bg-white/60 backdrop-blur hover:bg-white/80 disabled:opacity-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-12 text-center shadow-sm">
                <div className="text-slate-400 mb-4">
                  <Filter className="h-20 w-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No hotels found</h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
