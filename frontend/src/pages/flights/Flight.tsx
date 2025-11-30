import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, ArrowLeftRight, Calendar, Users, Luggage, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  logo?: string;
}

const FlightBookingUI: React.FC = () => {
  const [passengers, setPassengers] = useState(2);
  const [selectedTransit, setSelectedTransit] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(600);
  const [selectedClass, setSelectedClass] = useState('economy');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [departureTimeRange, setDepartureTimeRange] = useState<[number, number]>([0, 23]);
  const [arrivalTimeRange, setArrivalTimeRange] = useState<[number, number]>([0, 23]);
  const [filterFromLocation, setFilterFromLocation] = useState('');
  const [filterToLocation, setFilterToLocation] = useState('');
  const [searchedFromLocation, setSearchedFromLocation] = useState('');
  const [searchedToLocation, setSearchedToLocation] = useState('');
  const [searchedDepartureDate, setSearchedDepartureDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'lowest' | 'highest'>('lowest');
  const [showSortMenu, setShowSortMenu] = useState(false);

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

  const navigate = useNavigate();

  // UI state: expanded card and additional filters (airline, from/to)
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);

  const toggleAirline = (name: string) => {
    setSelectedAirlines((prev: string[]) => {
      if (prev.includes(name)) {
        return prev.filter((airline: string) => airline !== name);
      }
      return [...prev, name];
    });
  };

  // Get ticket class styling
  const getTicketClassStyle = (flightClass: string) => {
    const classLower = flightClass.toLowerCase();
    const styles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      economy: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        glow: ''
      },
      business: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        glow: 'shadow-lg shadow-purple-200'
      },
      'first class': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        glow: 'shadow-lg shadow-amber-300 animate-pulse'
      },
      private: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-300',
        glow: 'shadow-xl shadow-rose-400 animate-pulse'
      }
    };
    return styles[classLower] || styles.economy;
  };

  const handleSelectFlight = (flight: Flight) => {
    const detailFlight = {
      id: Number(flight.id),
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      logo:
        flight.logo ||
        `https://logo.clearbit.com/${flight.airline
          .toLowerCase()
          .replace(/\s+/g, '')}.com`,
      from: `${flight.departureLocation} (${flight.departureCode})`,
      to: `${flight.arrivalLocation} (${flight.arrivalCode})`,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      stops: flight.isDirect ? 'Non-stop' : '1 stop',
      price: flight.price,
      class: flight.flightClass,
    };

    navigate(`/flights/${flight.id}`, {
      state: {
        flight: detailFlight,
        search: {
          pax: passengers,
          isRoundTrip,
          departureDate,
          returnDate: isRoundTrip ? returnDate : null,
          from: fromAirport,
          to: toAirport,
        },
      },
    });
  };

  const initialFlights: Flight[] = [
    // From user's CSV (prices converted to USD for UI demo)
    {
      id: '1',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN101',
      duration: '1h 40m',
      price: 54.35,
      departureTime: '06:30',
      arrivalTime: '08:10',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Hanoi',
      departureCode: 'SGN',
      arrivalCode: 'HAN',
      estimatedTime: '1h 40m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    {
      id: '2',
      airline: 'VietJet Air',
      flightNumber: 'VJ223',
      duration: '1h 10m',
      price: 32.61,
      departureTime: '07:15',
      arrivalTime: '08:25',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Da Nang',
      departureCode: 'SGN',
      arrivalCode: 'DAD',
      estimatedTime: '1h 10m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietjetair.com',
    },
    {
      id: '3',
      airline: 'Bamboo Airways',
      flightNumber: 'QH305',
      duration: '1h 10m',
      price: 35.65,
      departureTime: '09:00',
      arrivalTime: '10:10',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Da Nang',
      arrivalLocation: 'Ho Chi Minh City',
      departureCode: 'DAD',
      arrivalCode: 'SGN',
      estimatedTime: '1h 10m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
    {
      id: '4',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN257',
      duration: '1h 30m',
      price: 42.61,
      departureTime: '11:20',
      arrivalTime: '12:50',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Hanoi',
      arrivalLocation: 'Da Nang',
      departureCode: 'HAN',
      arrivalCode: 'DAD',
      estimatedTime: '1h 30m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    {
      id: '5',
      airline: 'VietJet Air',
      flightNumber: 'VJ770',
      duration: '1h 10m',
      price: 28.50,
      departureTime: '13:30',
      arrivalTime: '14:40',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Con Dao',
      departureCode: 'SGN',
      arrivalCode: 'CXR',
      estimatedTime: '1h 10m',
      checkedBaggage: '0 Kg',
      cabinBaggage: '7 Kg',
      isDirect: false,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietjetair.com',
    },
    {
      id: '6',
      airline: 'Bamboo Airways',
      flightNumber: 'QH112',
      duration: '1h 15m',
      price: 23.48,
      departureTime: '15:00',
      arrivalTime: '16:15',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Hanoi',
      arrivalLocation: 'Phu Cat',
      departureCode: 'HAN',
      arrivalCode: 'UIH',
      estimatedTime: '1h 15m',
      checkedBaggage: '15 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
    {
      id: '7',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN605',
      duration: '1h 5m',
      price: 30.43,
      departureTime: '06:00',
      arrivalTime: '07:05',
      departureDate: 'Sat, 06 Dec',
      arrivalDate: 'Sat, 06 Dec',
      departureLocation: 'Phu Cat',
      arrivalLocation: 'Da Nang',
      departureCode: 'UIH',
      arrivalCode: 'DAD',
      estimatedTime: '1h 5m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    {
      id: '8',
      airline: 'VietJet Air',
      flightNumber: 'VJ990',
      duration: '1h 40m',
      price: 50.00,
      departureTime: '18:45',
      arrivalTime: '20:25',
      departureDate: 'Sat, 06 Dec',
      arrivalDate: 'Sat, 06 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Hanoi',
      departureCode: 'SGN',
      arrivalCode: 'HAN',
      estimatedTime: '1h 40m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietjetair.com',
    },
    {
      id: '9',
      airline: 'Bamboo Airways',
      flightNumber: 'QH420',
      duration: '1h 10m',
      price: 33.91,
      departureTime: '20:00',
      arrivalTime: '21:10',
      departureDate: 'Sat, 06 Dec',
      arrivalDate: 'Sat, 06 Dec',
      departureLocation: 'Con Dao',
      arrivalLocation: 'Ho Chi Minh City',
      departureCode: 'CXR',
      arrivalCode: 'SGN',
      estimatedTime: '1h 10m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
    {
      id: '10',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN333',
      duration: '55m',
      price: 27.83,
      departureTime: '06:15',
      arrivalTime: '07:10',
      departureDate: 'Sun, 07 Dec',
      arrivalDate: 'Sun, 07 Dec',
      departureLocation: 'Hanoi',
      arrivalLocation: 'Haiphong',
      departureCode: 'HAN',
      arrivalCode: 'HPH',
      estimatedTime: '55m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    // Additional demo flights
    {
      id: '11',
      airline: 'VietJet Air',
      flightNumber: 'VJ555',
      duration: '1h 40m',
      price: 36.96,
      departureTime: '09:00',
      arrivalTime: '10:40',
      departureDate: 'Sat, 06 Dec',
      arrivalDate: 'Sat, 06 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Hanoi',
      departureCode: 'SGN',
      arrivalCode: 'HAN',
      estimatedTime: '1h 40m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietjetair.com',
    },
    {
      id: '12',
      airline: 'Bamboo Airways',
      flightNumber: 'QH777',
      duration: '1h 30m',
      price: 26.09,
      departureTime: '14:00',
      arrivalTime: '15:30',
      departureDate: 'Sat, 06 Dec',
      arrivalDate: 'Sat, 06 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Con Dao',
      departureCode: 'SGN',
      arrivalCode: 'CXR',
      estimatedTime: '1h 30m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
    {
      id: '13',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN888',
      duration: '1h 50m',
      price: 47.83,
      departureTime: '18:00',
      arrivalTime: '19:50',
      departureDate: 'Sun, 07 Dec',
      arrivalDate: 'Sun, 07 Dec',
      departureLocation: 'Hanoi',
      arrivalLocation: 'Ho Chi Minh City',
      departureCode: 'HAN',
      arrivalCode: 'SGN',
      estimatedTime: '1h 50m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    // Business Class flights
    {
      id: 'b1',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN102',
      duration: '1h 40m',
      price: 128.50,
      departureTime: '08:00',
      arrivalTime: '09:40',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Hanoi',
      departureCode: 'SGN',
      arrivalCode: 'HAN',
      estimatedTime: '1h 40m',
      checkedBaggage: '35 Kg',
      cabinBaggage: '14 Kg',
      isDirect: true,
      flightClass: 'Business',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    {
      id: 'b2',
      airline: 'Bamboo Airways',
      flightNumber: 'QH306',
      duration: '1h 10m',
      price: 95.75,
      departureTime: '11:30',
      arrivalTime: '12:40',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Da Nang',
      arrivalLocation: 'Ho Chi Minh City',
      departureCode: 'DAD',
      arrivalCode: 'SGN',
      estimatedTime: '1h 10m',
      checkedBaggage: '35 Kg',
      cabinBaggage: '14 Kg',
      isDirect: true,
      flightClass: 'Business',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
    // First Class flights
    {
      id: 'f1',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN103',
      duration: '1h 40m',
      price: 245.80,
      departureTime: '10:15',
      arrivalTime: '11:55',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Hanoi',
      departureCode: 'SGN',
      arrivalCode: 'HAN',
      estimatedTime: '1h 40m',
      checkedBaggage: '50 Kg',
      cabinBaggage: '20 Kg',
      isDirect: true,
      flightClass: 'First Class',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    {
      id: 'f2',
      airline: 'VietJet Air',
      flightNumber: 'VJ225',
      duration: '1h 10m',
      price: 189.45,
      departureTime: '15:45',
      arrivalTime: '16:55',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Da Nang',
      departureCode: 'SGN',
      arrivalCode: 'DAD',
      estimatedTime: '1h 10m',
      checkedBaggage: '50 Kg',
      cabinBaggage: '20 Kg',
      isDirect: true,
      flightClass: 'First Class',
      logo: 'https://logo.clearbit.com/vietjetair.com',
    },
    // Private Jet flights
    {
      id: 'p1',
      airline: 'Bamboo Airways Premium',
      flightNumber: 'QH888',
      duration: '1h 30m',
      price: 499.99,
      departureTime: '07:00',
      arrivalTime: '08:30',
      departureDate: 'Fri, 05 Dec',
      arrivalDate: 'Fri, 05 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Hanoi',
      departureCode: 'SGN',
      arrivalCode: 'HAN',
      estimatedTime: '1h 30m',
      checkedBaggage: '100 Kg',
      cabinBaggage: '25 Kg',
      isDirect: true,
      flightClass: 'Private',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
    {
      id: 'p2',
      airline: 'Vietnam Airlines Executive',
      flightNumber: 'VN999',
      duration: '55m',
      price: 599.50,
      departureTime: '19:00',
      arrivalTime: '19:55',
      departureDate: 'Sat, 06 Dec',
      arrivalDate: 'Sat, 06 Dec',
      departureLocation: 'Hanoi',
      arrivalLocation: 'Da Nang',
      departureCode: 'HAN',
      arrivalCode: 'DAD',
      estimatedTime: '55m',
      checkedBaggage: '100 Kg',
      cabinBaggage: '30 Kg',
      isDirect: true,
      flightClass: 'Private',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    }
  ];

  // Add some extra domestic flights to ensure good coverage
  const domesticExtras: Flight[] = [
    {
      id: 'd1',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN200',
      duration: '1h 05m',
      price: 28.0,
      departureTime: '09:30',
      arrivalTime: '10:35',
      departureDate: 'Mon, 08 Dec',
      arrivalDate: 'Mon, 08 Dec',
      departureLocation: 'Hanoi',
      arrivalLocation: 'Da Nang',
      departureCode: 'HAN',
      arrivalCode: 'DAD',
      estimatedTime: '1h 05m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietnamairlines.com',
    },
    {
      id: 'd2',
      airline: 'VietJet Air',
      flightNumber: 'VJ310',
      duration: '50m',
      price: 18.5,
      departureTime: '12:00',
      arrivalTime: '12:50',
      departureDate: 'Mon, 08 Dec',
      arrivalDate: 'Mon, 08 Dec',
      departureLocation: 'Ho Chi Minh City',
      arrivalLocation: 'Can Tho',
      departureCode: 'SGN',
      arrivalCode: 'VCA',
      estimatedTime: '50m',
      checkedBaggage: '15 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/vietjetair.com',
    },
    {
      id: 'd3',
      airline: 'Bamboo Airways',
      flightNumber: 'QH900',
      duration: '1h 20m',
      price: 29.0,
      departureTime: '14:30',
      arrivalTime: '15:50',
      departureDate: 'Mon, 08 Dec',
      arrivalDate: 'Mon, 08 Dec',
      departureLocation: 'Da Nang',
      arrivalLocation: 'Nha Trang',
      departureCode: 'DAD',
      arrivalCode: 'CXR',
      estimatedTime: '1h 20m',
      checkedBaggage: '20 Kg',
      cabinBaggage: '7 Kg',
      isDirect: true,
      flightClass: 'Economy',
      logo: 'https://logo.clearbit.com/bambooairways.com',
    },
  ];

  const [flights, setFlights] = useState<Flight[]>([...initialFlights, ...domesticExtras]);

  // Get unique departure and arrival locations from flights data
  const departureLocations = useMemo(() => {
    const locations = Array.from(new Set(flights.map((f) => f.departureLocation)));
    return locations.map((location) => ({
      city: location,
      code: flights.find((f) => f.departureLocation === location)?.departureCode || '',
      airport: location,
      country: ''
    }));
  }, [flights]);

  const arrivalLocations = useMemo(() => {
    const locations = Array.from(new Set(flights.map((f) => f.arrivalLocation)));
    return locations.map((location) => ({
      city: location,
      code: flights.find((f) => f.arrivalLocation === location)?.arrivalCode || '',
      airport: location,
      country: ''
    }));
  }, [flights]);

  const filteredFromAirports = useMemo(
    () => {
      const query = fromQuery.toLowerCase();
      // First try to match from flights data
      let result = departureLocations.filter((airport) => {
        const searchable = `${airport.airport} ${airport.city} ${airport.code}`.toLowerCase();
        return searchable.includes(query);
      });
      // If no results from flights, fall back to AIRPORT_OPTIONS
      if (result.length === 0 && fromQuery) {
        result = AIRPORT_OPTIONS.filter((airport) => {
          const searchable = `${airport.airport} ${airport.city} ${airport.code} ${airport.country}`.toLowerCase();
          return searchable.includes(query);
        });
      }
      return result.length > 0 || !fromQuery ? result : departureLocations;
    },
    [fromQuery, departureLocations, AIRPORT_OPTIONS]
  );

  const filteredToAirports = useMemo(
    () => {
      const query = toQuery.toLowerCase();
      // First try to match from flights data
      let result = arrivalLocations.filter((airport) => {
        const searchable = `${airport.airport} ${airport.city} ${airport.code}`.toLowerCase();
        return searchable.includes(query);
      });
      // If no results from flights, fall back to AIRPORT_OPTIONS
      if (result.length === 0 && toQuery) {
        result = AIRPORT_OPTIONS.filter((airport) => {
          const searchable = `${airport.airport} ${airport.city} ${airport.code} ${airport.country}`.toLowerCase();
          return searchable.includes(query);
        });
      }
      return result.length > 0 || !toQuery ? result : arrivalLocations;
    },
    [toQuery, arrivalLocations, AIRPORT_OPTIONS]
  );

  useEffect(() => {
    // Try to load additional flights from the public mock JSON and merge them
    return;
    fetch('/mock/flights.json')
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped: Flight[] = (data || [])
          .map((it, idx) => {
            // permissive origin/destination detection
            const origin = it.origin_iata || it.origin || it.originCode || it.from || it.departure;
            const dest = it.dest_iata || it.dest || it.destCode || it.to || it.arrival;
            if (!origin || !dest) return null;

            // price detection: check USD, then VND, then generic price
            let priceUsd = 0;
            if (it.price_usd || it.priceUSD) priceUsd = Number(it.price_usd || it.priceUSD) || 0;
            else if (it.price_vnd || it.priceVND) {
              const v = Number(it.price_vnd || it.priceVND) || 0;
              priceUsd = v ? Number((v / 33000).toFixed(2)) : 0;
            } else if (it.price) {
              const p = Number(it.price) || 0;
              // heuristics: if value looks large assume VND
              priceUsd = p > 1000 ? Number((p / 33000).toFixed(2)) : p;
            }

            // final fallback: random small price so flight shows in demo
            if (!priceUsd || Number.isNaN(priceUsd)) priceUsd = Number((20 + (idx % 180)).toFixed(2));

            const dep = it.dep_datetime || it.dep_time || it.departure_time || it.departure_datetime || '';
            const arr = it.arr_datetime || it.arr_time || it.arrival_time || it.arrival_datetime || '';
            let depTime = it.dep_time || it.departure_time || '';
            let arrTime = it.arr_time || it.arrival_time || '';
            let depDate = '';
            let arrDate = '';
            try {
              if (dep) {
                const d = new Date(dep);
                if (!Number.isNaN(d.getTime())) {
                  depTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  depDate = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                }
              }
              if (arr) {
                const a = new Date(arr);
                if (!Number.isNaN(a.getTime())) {
                  arrTime = a.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  arrDate = a.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                }
              }
            } catch (e) {}

            const airlineName = (it.airline || it.operator || it.carrier || it.brand || it.airlineName || 'External').toString();

            return {
              id: `ext-${Date.now()}-${idx}`,
              airline: airlineName,
              flightNumber: it.flight_no || it.flightNumber || (`EXT${idx}`),
              duration: it.duration_min ? `${Math.floor(it.duration_min / 60)}h ${it.duration_min % 60}m` : (it.duration || it.flight_time || ''),
              price: Number(priceUsd),
              departureTime: depTime || it.departure_time || '',
              arrivalTime: arrTime || it.arrival_time || '',
              departureDate: depDate,
              arrivalDate: arrDate,
              departureLocation: it.origin_name || it.origin_name_full || it.origin || origin,
              arrivalLocation: it.dest_name || it.dest_name_full || it.dest || dest,
              departureCode: origin,
              arrivalCode: dest,
              estimatedTime: it.duration_min ? `${Math.floor(it.duration_min / 60)}h ${it.duration_min % 60}m` : '',
              checkedBaggage: it.baggage || it.baggage_allowance || '20 Kg',
              cabinBaggage: it.cabin || it.cabin_allowance || '7 Kg',
              isDirect: typeof it.stops !== 'undefined' ? Number(it.stops) === 0 : true,
              flightClass: it.cabin_class || it.class || 'Economy',
              logo: it.logo || it.logoAlt || `https://logo.clearbit.com/${airlineName.toLowerCase().replace(/\s+/g, '')}.com`,
            } as Flight;
          })
          .filter(Boolean) as Flight[];

        if (mapped.length) setFlights((prev) => [...prev, ...mapped]);
      })
      .catch(() => {
        // ignore fetch errors in demo
      });
  }, []);

  const priceData = [40, 80, 120, 60, 180, 220, 90, 200, 140, 320, 180];
  const maxBarHeight = Math.max(...priceData);
  // Display bars from lowest to highest
  const sortedPriceData = [...priceData].sort((a, b) => a - b);

  const airlines = useMemo(() => Array.from(new Set(flights.map((f) => f.airline))), [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      // Filter by price range
      if (f.price < minPrice || f.price > maxPrice) return false;
      
      // Filter by selected airlines
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(f.airline)) return false;
      
      // Filter by searched departure location (from search bar)
      if (searchedFromLocation && !f.departureLocation.toLowerCase().includes(searchedFromLocation.toLowerCase())) return false;
      
      // Filter by searched arrival location (from search bar)
      if (searchedToLocation && !f.arrivalLocation.toLowerCase().includes(searchedToLocation.toLowerCase())) return false;
      
      // Filter by searched departure date
      if (searchedDepartureDate && f.departureDate) {
        // Convert YYYY-MM-DD to match with flight date format
        const dateObj = new Date(searchedDepartureDate);
        const flightDateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).slice(0, 11);
        if (!f.departureDate.includes(flightDateStr.slice(5)) && !f.departureDate.includes(dateObj.getDate().toString())) {
          return false;
        }
      }
      
      // Filter by transit type
      if (selectedTransit === 'direct' && !f.isDirect) return false;
      if (selectedTransit === '1-stop' && f.isDirect) return false;
      
      // Filter by flight class
      if (selectedClass && selectedClass !== 'all' && f.flightClass.toLowerCase() !== selectedClass.toLowerCase()) return false;
      
      return true;
    });
  }, [flights, minPrice, maxPrice, selectedAirlines, searchedFromLocation, searchedToLocation, searchedDepartureDate, selectedTransit, selectedClass]);
  
  // Pagination / infinite scroll: show a subset of filtered flights and load more on scroll
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  const sortedFilteredFlights = useMemo(() => {
    const sorted = [...filteredFlights];
    if (sortOrder === 'lowest') {
      sorted.sort((a, b) => a.price - b.price);
    } else {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  }, [filteredFlights, sortOrder]);
  
  const visibleFlights = useMemo(() => sortedFilteredFlights.slice(0, visibleCount), [sortedFilteredFlights, visibleCount]);
  
  useEffect(() => {
    // reset visible count when filters change
    setVisibleCount(PAGE_SIZE);
  }, [sortedFilteredFlights]);
  
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;
        if (nearBottom && visibleCount < filteredFlights.length) {
          setVisibleCount((v) => Math.min(filteredFlights.length, v + PAGE_SIZE));
        }
        ticking = false;
      });
    };
  
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [visibleCount, filteredFlights]);

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
              <div className={baseFieldClass}>
                <Calendar className="h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={departureDate}
                  onChange={(event) => setDepartureDate(event.target.value)}
                  className="w-24 bg-transparent border-none outline-none font-semibold text-slate-900 cursor-pointer text-sm"
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
                className={`${baseFieldClass} ${
                  isRoundTrip ? '' : 'pointer-events-none text-slate-400'
                }`}
              >
                <Calendar className="h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  value={returnDate}
                  disabled={!isRoundTrip}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="w-24 bg-transparent border-none outline-none font-semibold text-slate-900 cursor-pointer disabled:text-slate-400 text-sm"
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
            <div className="col-span-full md:col-span-2 xl:col-span-2 flex items-end gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSearchedFromLocation(fromAirport.city);
                  setSearchedToLocation(toAirport.city);
                  setSearchedDepartureDate(departureDate);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="flex-1 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
              >
                Search Ticket
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setFromAirport(AIRPORT_OPTIONS[0]);
                  setToAirport(AIRPORT_OPTIONS[5]);
                  setDepartureDate('');
                  setReturnDate('');
                  setPassengers(1);
                  setIsRoundTrip(false);
                  setSelectedTransit('all');
                  setMinPrice(0);
                  setMaxPrice(600);
                  setSelectedClass('all');
                  setSelectedAirlines([]);
                  setSearchedFromLocation('');
                  setSearchedToLocation('');
                  setSearchedDepartureDate('');
                  setVisibleCount(PAGE_SIZE);
                }}
                className="flex-1 rounded-xl bg-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-300"
              >
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button className="text-blue-600 text-sm hover:underline font-medium">Reset</button>
              </div>

              {/* Transit Amount */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Transit</h4>
                <div className="flex gap-2">
                  {['Direct', '1 Stop', 'All'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedTransit(option.toLowerCase())}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                        selectedTransit === option.toLowerCase()
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-900">Price Range</h4>
                
                {/* Bar Chart */}
                <div className="mb-4 h-24 flex items-end justify-between gap-1 px-1">
                  {sortedPriceData.map((value, index) => {
                      const height = (value / maxBarHeight) * 100;
                      // Use the actual bar value to check against price slider
                      const isInRange = value >= minPrice && value <= maxPrice;
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
                        left: `${(minPrice / 600) * 100}%`,
                        right: `${100 - (maxPrice / 600) * 100}%`
                      }}
                    />
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="600"
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
                    max="600"
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

              {/* From / To quick filters */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-900">From / To</h4>
                <div className="space-y-2">
                  <input
                    placeholder="From city or country"
                    value={filterFromLocation}
                    onChange={(e) => setFilterFromLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  />
                  <input
                    placeholder="To city or country"
                    value={filterToLocation}
                    onChange={(e) => setFilterToLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  />
                </div>
              </div>

              {/* Airlines */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-900">Airlines</h4>
                <div className="space-y-2">
                  {airlines.map((a) => (
                    <label key={a} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAirlines.includes(a)}
                        onChange={() => toggleAirline(a)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">{a}</span>
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
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50 py-2 z-10">
              <h2 className="text-2xl font-bold">Result</h2>
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <button 
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    {sortOrder === 'lowest' ? 'Lowest' : 'Highest'} <ChevronDown className="w-4 h-4" />
                  </button>
                  {showSortMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-20">
                      <button
                        onClick={() => {
                          setSortOrder('lowest');
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-all font-medium ${sortOrder === 'lowest' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                      >
                        Lowest Price
                      </button>
                      <button
                        onClick={() => {
                          setSortOrder('highest');
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-all font-medium border-t border-gray-200 ${sortOrder === 'highest' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                      >
                        Highest Price
                      </button>
                    </div>
                  )}
                </div>
                <button className="lg:hidden p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4">
              {visibleFlights.map((flight) => (
                <div
                  key={flight.id}
                  onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                >
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
                        {(() => {
                          const style = getTicketClassStyle(flight.flightClass);
                          return (
                            <>
                              <span className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${style.bg} ${style.text} ${style.border} ${style.glow}`}>
                                {flight.flightClass}
                              </span>
                              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {flight.isDirect ? 'Direct Flight' : '1 Stop'}
                              </span>
                              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110">
                                <ChevronUp className="w-5 h-5" />
                              </button>
                            </>
                          );
                        })()}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFlight(flight);
                        }}
                        className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        Select Flight
                      </button>
                    </div>
                  </div>

                  {/* Inline expanded details */}
                  {expandedFlight === flight.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-start gap-6">
                        <img src={flight.logo} alt="logo" className="w-16 h-16 rounded-lg object-contain bg-white p-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{flight.airline} — {flight.flightNumber}</h4>
                              <p className="text-sm text-gray-600">{flight.duration} · {flight.isDirect ? 'Non-stop' : '1 stop'}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">${flight.price.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">Per person</div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                              <div className="font-semibold">Departure</div>
                              <div>{flight.departureTime} — {flight.departureLocation} ({flight.departureCode})</div>
                            </div>
                            <div>
                              <div className="font-semibold">Arrival</div>
                              <div>{flight.arrivalTime} — {flight.arrivalLocation} ({flight.arrivalCode})</div>
                            </div>
                            <div>
                              <div className="font-semibold">Baggage</div>
                              <div>{flight.checkedBaggage} checked · {flight.cabinBaggage} cabin</div>
                            </div>
                            <div>
                              <div className="font-semibold">Class</div>
                              <div>{flight.flightClass}</div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm font-semibold">Promo</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">Flexible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filteredFlights.length > visibleFlights.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisibleCount((v) => Math.min(filteredFlights.length, v + PAGE_SIZE));
                    }}
                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 font-semibold"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingUI;
