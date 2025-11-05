import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ArrowLeftRight, Calendar, Users, Luggage, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  duration: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  departureLocation: string;
  arrivalLocation: string;
  departureCode: string;
  arrivalCode: string;
  estimatedTime: string;
  checkedBaggage: string;
  cabinBaggage: string;
  isDirect: boolean;
  flightClass: string;
}

const FlightBookingUI: React.FC = () => {
  const [passengers, setPassengers] = useState(2);
  const [selectedTransit, setSelectedTransit] = useState('all');
  const [minPrice, setMinPrice] = useState(200);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedClass, setSelectedClass] = useState('economy');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const baseFieldClass =
    'group flex h-[56px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 transition-all duration-200 shadow-sm hover:border-sky-400 hover:shadow-md/40 focus-within:border-sky-500 focus-within:shadow-md/40';
  const labelClass = 'mb-2 text-sm font-semibold text-slate-600';

  const AIRPORT_OPTIONS = useMemo(
    () => [
      { city: 'Jakarta', airport: 'Soekarno Hatta Airport', code: 'CGK', country: 'Indonesia' },
      { city: 'Singapore', airport: 'Changi Airport', code: 'SIN', country: 'Singapore' },
      { city: 'Bangkok', airport: 'Suvarnabhumi Airport', code: 'BKK', country: 'Thailand' },
      { city: 'Kuala Lumpur', airport: 'KLIA', code: 'KUL', country: 'Malaysia' },
      { city: 'Tokyo', airport: 'Haneda Airport', code: 'HND', country: 'Japan' },
      { city: 'Zurich', airport: 'Zurich Airport', code: 'ZRH', country: 'Switzerland' },
      { city: 'Sydney', airport: 'Kingsford Smith Airport', code: 'SYD', country: 'Australia' },
      { city: 'London', airport: 'Heathrow Airport', code: 'LHR', country: 'United Kingdom' },
      { city: 'Paris', airport: 'Charles de Gaulle', code: 'CDG', country: 'France' },
      { city: 'New York', airport: 'JFK International', code: 'JFK', country: 'United States' }
    ],
    []
  );

  const [fromAirport, setFromAirport] = useState(AIRPORT_OPTIONS[0]);
  const [toAirport, setToAirport] = useState(AIRPORT_OPTIONS[5]);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [showFromMenu, setShowFromMenu] = useState(false);
  const [showToMenu, setShowToMenu] = useState(false);

  const today = useMemo(() => new Date(), []);
  const plusDays = (days: number) => {
    const copy = new Date(today);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().slice(0, 10);
  };

  const [departureDate, setDepartureDate] = useState(plusDays(0));
  const [returnDate, setReturnDate] = useState(plusDays(3));

  const fromFieldRef = useRef<HTMLDivElement | null>(null);
  const toFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showFromMenu && fromFieldRef.current && !fromFieldRef.current.contains(target)) {
        setShowFromMenu(false);
      }
      if (showToMenu && toFieldRef.current && !toFieldRef.current.contains(target)) {
        setShowToMenu(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showFromMenu, showToMenu]);

  const formatDisplayDate = (value: string) => {
    if (!value) {
      return 'Select date';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Select date';
    }
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredFromAirports = useMemo(
    () =>
      AIRPORT_OPTIONS.filter((airport) => {
        const searchable = `${airport.airport} ${airport.city} ${airport.code} ${airport.country}`.toLowerCase();
        return searchable.includes(fromQuery.toLowerCase());
      }),
    [AIRPORT_OPTIONS, fromQuery]
  );

  const filteredToAirports = useMemo(
    () =>
      AIRPORT_OPTIONS.filter((airport) => {
        const searchable = `${airport.airport} ${airport.city} ${airport.code} ${airport.country}`.toLowerCase();
        return searchable.includes(toQuery.toLowerCase());
      }),
    [AIRPORT_OPTIONS, toQuery]
  );

  const flights: Flight[] = [
    {
      id: '1',
      airline: 'Garuda Indonesia',
      flightNumber: 'GI 2112',
      duration: '14 h 30 min',
      price: 540.45,
      departureTime: '10:00 PM',
      arrivalTime: '1:30 AM',
      departureDate: 'Wed, 21 Jun',
      arrivalDate: 'Thu, 22 Jun',
      departureLocation: 'Indonesia',
      arrivalLocation: 'Switzerland',
      departureCode: 'CGK',
      arrivalCode: 'ZRH',
      estimatedTime: '2h 30m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy Class'
    },
    {
      id: '2',
      airline: 'Qatar Airways',
      flightNumber: 'QA 1444',
      duration: '14 h 30 min',
      price: 620.30,
      departureTime: '10:00 PM',
      arrivalTime: '1:30 AM',
      departureDate: 'Wed, 21 Jun',
      arrivalDate: 'Thu, 22 Jun',
      departureLocation: 'Indonesia',
      arrivalLocation: 'Switzerland',
      departureCode: 'CGK',
      arrivalCode: 'ZRH',
      estimatedTime: '2h 30m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy Class'
    }
  ];

  const priceData = [40, 80, 120, 60, 180, 220, 90, 200, 140, 320, 180];
  const maxBarHeight = Math.max(...priceData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Trip Type Selector */}
          <div className="mb-6">
            <div className="relative inline-flex rounded-full bg-slate-100 p-1">
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="absolute inset-y-1 w-[calc(50%-8px)] rounded-full bg-white shadow-sm"
                style={{
                  left: isRoundTrip ? '4px' : 'calc(50% + 4px)'
                }}
              />
              {[
                { label: 'Round Trip', value: true },
                { label: 'One Way', value: false }
              ].map((option) => {
                const isActive = isRoundTrip === option.value;
                return (
                  <button
                    key={option.label}
                    onClick={() => setIsRoundTrip(option.value)}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'text-sky-600' : 'text-slate-500'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Form */}
          <div className="grid items-end gap-3 xl:grid-cols-[minmax(0,1.5fr)_64px_minmax(0,1.5fr)_repeat(2,minmax(0,1fr))_minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* From */}
            <div className="col-span-full xl:col-span-1" ref={fromFieldRef}>
              <label className={labelClass}>From</label>
              <div
                className={`${baseFieldClass} cursor-pointer relative`}
                onClick={() => {
                  setShowFromMenu(true);
                  setShowToMenu(false);
                  setFromQuery('');
                }}
              >
                <Plane className="h-5 w-5 text-slate-400 transition-colors group-hover:text-sky-500" />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{fromAirport.airport}</div>
                  <div className="text-sm text-slate-500">
                    {fromAirport.city} · {fromAirport.code}
                  </div>
                </div>
                {showFromMenu && (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 w-[360px] max-w-[min(360px,calc(100vw-4rem))] rounded-xl border border-slate-200 bg-white shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="p-3 border-b border-slate-100">
                      <input
                        autoFocus
                        value={fromQuery}
                        onChange={(event) => setFromQuery(event.target.value)}
                        placeholder="Search airport or city"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredFromAirports.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400">No airports found.</p>
                      ) : (
                        filteredFromAirports.map((airport) => (
                          <button
                            key={airport.code}
                            type="button"
                            onClick={() => {
                              setFromAirport(airport);
                              setShowFromMenu(false);
                              setFromQuery('');
                            }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-sky-50"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{airport.airport}</div>
                              <div className="text-xs text-slate-500">
                                {airport.city}, {airport.country}
                              </div>
                            </div>
                            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-600">
                              {airport.code}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="col-span-full sm:col-span-1 xl:col-span-1 flex items-end justify-center">
              <motion.button
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-[56px] w-full max-w-[56px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-sky-400 hover:bg-sky-50"
                onClick={() => {
                  setFromAirport(toAirport);
                  setToAirport(fromAirport);
                  setShowFromMenu(false);
                  setShowToMenu(false);
                }}
              >
                <ArrowLeftRight className="h-5 w-5" />
              </motion.button>
            </div>

            {/* To */}
            <div className="col-span-full xl:col-span-1" ref={toFieldRef}>
              <label className={labelClass}>To</label>
              <div
                className={`${baseFieldClass} cursor-pointer relative`}
                onClick={() => {
                  setShowToMenu(true);
                  setShowFromMenu(false);
                  setToQuery('');
                }}
              >
                <Plane className="h-5 w-5 text-slate-400 transition-colors group-hover:text-sky-500" />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{toAirport.airport}</div>
                  <div className="text-sm text-slate-500">
                    {toAirport.city} · {toAirport.code}
                  </div>
                </div>
                {showToMenu && (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 w-[360px] max-w-[min(360px,calc(100vw-4rem))] rounded-xl border border-slate-200 bg-white shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="p-3 border-b border-slate-100">
                      <input
                        autoFocus
                        value={toQuery}
                        onChange={(event) => setToQuery(event.target.value)}
                        placeholder="Search airport or city"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredToAirports.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400">No airports found.</p>
                      ) : (
                        filteredToAirports.map((airport) => (
                          <button
                            key={airport.code}
                            type="button"
                            onClick={() => {
                              setToAirport(airport);
                              setShowToMenu(false);
                              setToQuery('');
                            }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-sky-50"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{airport.airport}</div>
                              <div className="text-xs text-slate-500">
                                {airport.city}, {airport.country}
                              </div>
                            </div>
                            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-600">
                              {airport.code}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Departure Date */}
            <div className="col-span-full md:col-span-1 xl:col-span-1">
              <label className={labelClass}>Departure Date</label>
              <div className={`${baseFieldClass} relative cursor-pointer`}>
                <Calendar className="h-5 w-5 text-slate-400 transition-colors group-hover:text-sky-500" />
                <div className="font-semibold text-slate-900">{formatDisplayDate(departureDate)}</div>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Return Date */}
            <motion.div
              className="col-span-full md:col-span-1 xl:col-span-1"
              animate={{ opacity: isRoundTrip ? 1 : 0.4 }}
              transition={{ duration: 0.18 }}
            >
              <label className={labelClass}>Return Date</label>
              <div
                className={`${baseFieldClass} relative ${
                  isRoundTrip ? 'cursor-pointer' : 'pointer-events-none text-slate-400'
                }`}
              >
                <Calendar className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-sky-500" />
                <div className={`font-semibold ${isRoundTrip ? 'text-slate-900' : 'text-slate-400'}`}>
                  {formatDisplayDate(returnDate)}
                </div>
                <input
                  type="date"
                  value={returnDate}
                  disabled={!isRoundTrip}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 focus-visible:outline-none disabled:cursor-not-allowed"
                />
              </div>
            </motion.div>

            {/* Passengers */}
            <div className="col-span-full md:col-span-1 xl:col-span-1">
              <label className={labelClass}>Passengers</label>
              <div className={`${baseFieldClass} justify-between`}>
                <Users className="h-5 w-5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-sky-500" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 transition-colors hover:border-sky-400 hover:bg-sky-50"
                  >
                    −
                  </button>
                  <span className="min-w-[24px] text-center text-lg font-semibold text-slate-900">{passengers}</span>
                  <button
                    onClick={() => setPassengers(passengers + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg font-semibold text-slate-700 transition-colors hover:border-sky-400 hover:bg-sky-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="col-span-full md:col-span-1 xl:col-span-1 flex items-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
              >
                Search Ticket
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button className="text-blue-600 text-sm hover:underline font-medium">Reset</button>
              </div>

              {/* Transit Amount */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Transit Amount</h4>
                <div className="space-y-3">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'non-transit', label: 'Non-Transit' },
                    { value: '1-stop', label: '1 stop' },
                    { value: '2-stop', label: '2 stop' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="transit"
                          checked={selectedTransit === option.value}
                          onChange={() => setSelectedTransit(option.value)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-600 peer-checked:border-[6px] transition-all"></div>
                      </div>
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Price Range</h4>
                
                {/* Bar Chart */}
                <div className="mb-4 h-24 flex items-end justify-between gap-1 px-1">
                  {priceData.map((value, index) => {
                    const height = (value / maxBarHeight) * 100;
                    const isInRange = (index / priceData.length) * 1000 >= minPrice && (index / priceData.length) * 1000 <= maxPrice;
                    return (
                      <div 
                        key={index} 
                        className="flex-1 rounded-t-md transition-all duration-300"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: isInRange ? '#3B82F6' : '#E5E7EB'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Dual Range Slider */}
                <div className="relative pt-6 pb-4">
                  <div className="relative h-1 bg-gray-200 rounded-full">
                    <div 
                      className="absolute h-1 bg-blue-600 rounded-full transition-all duration-300"
                      style={{
                        left: `${(minPrice / 1000) * 100}%`,
                        right: `${100 - (maxPrice / 1000) * 100}%`
                      }}
                    />
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={minPrice}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < maxPrice - 50) setMinPrice(value);
                    }}
                    className="absolute w-full h-1 top-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                  
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > minPrice + 50) setMaxPrice(value);
                    }}
                    className="absolute w-full h-1 top-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                </div>

                <div className="flex justify-between mt-3">
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">{minPrice} $</span>
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">{maxPrice} $</span>
                </div>
              </div>

              {/* Flight Class */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-900">Flight Class</h4>
                <div className="space-y-3">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'economy', label: 'Economy' },
                    { value: 'business', label: 'Business' },
                    { value: 'first-class', label: 'First Class' },
                    { value: 'private', label: 'Private' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="class"
                          checked={selectedClass === option.value}
                          onChange={() => setSelectedClass(option.value)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-600 peer-checked:border-[6px] transition-all"></div>
                      </div>
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Result</h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium">
                  Lowest <ChevronDown className="w-4 h-4" />
                </button>
                <button className="lg:hidden p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4">
              {flights.map((flight) => (
                <div key={flight.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="p-6">
                    {/* Airline Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Plane className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{flight.airline}</h3>
                          <p className="text-sm text-gray-500">{flight.flightNumber} | {flight.duration}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {flight.flightClass}
                        </span>
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Direct Flight
                        </span>
                        <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110">
                          <ChevronUp className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Baggage Info */}
                    <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                      <span>Include free Baggage & Cabin in capacity</span>
                      <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-2">
                          <Luggage className="w-4 h-4" />
                          <span>{flight.checkedBaggage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Luggage className="w-4 h-4" />
                          <span>{flight.cabinBaggage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Flight Route */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-left">
                        <p className="text-sm text-gray-500 mb-1">{flight.departureDate}</p>
                        <p className="text-3xl font-bold">{flight.departureTime}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Plane className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{flight.departureLocation} ({flight.departureCode})</span>
                        </div>
                      </div>

                      <div className="flex-1 px-8">
                        <div className="relative">
                          <div className="flex items-center justify-center">
                            {Array(15).fill(0).map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${i === 7 ? 'bg-blue-600 scale-125' : 'bg-gray-300'}`}></div>
                            ))}
                          </div>
                          <div className="flex justify-center mt-2">
                            <div className="bg-blue-600 p-2 rounded-full animate-pulse">
                              <Plane className="w-5 h-5 text-white transform rotate-90" />
                            </div>
                          </div>
                          <p className="text-center text-sm text-gray-500 mt-2">Estimate: {flight.estimatedTime}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">{flight.arrivalDate}</p>
                        <p className="text-3xl font-bold">{flight.arrivalTime}</p>
                        <div className="flex items-center gap-2 mt-2 justify-end">
                          <Plane className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{flight.arrivalLocation} ({flight.arrivalCode})</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Select */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div>
                        <span className="text-gray-500 text-sm">USD </span>
                        <span className="text-4xl font-bold text-gray-900">{flight.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-sm"> / person</span>
                      </div>
                      <button className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        Select Flight
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingUI;
