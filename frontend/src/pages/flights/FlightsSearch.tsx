import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plane, Calendar, ArrowRightLeft } from 'lucide-react';
import FlightCard from '../../components/cards/FlightCard';
import { flightsService, type Flight, type FlightSearchParams } from '../../services/flights';

export default function FlightsSearch() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    from: '',
    to: '',
    departure: '',
    return: '',
    airline: ''
  });

  useEffect(() => {
    // Load initial flights
    loadFlights();
  }, []);

  const loadFlights = async (params: FlightSearchParams = {}) => {
    setIsLoading(true);
    try {
      const flightData = await flightsService.searchFlights(params);
      setFlights(flightData);
    } catch (error) {
      console.error('Failed to load flights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadFlights(searchParams);
  };

  const handleInputChange = (field: keyof FlightSearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const swapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Flights</h1>
          <p className="text-xl text-gray-600">
            Search and compare flights from top airlines
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Departure city"
                  value={searchParams.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-end">
              <button
                onClick={swapLocations}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowRightLeft className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Destination city"
                  value={searchParams.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  min={getTodayDate()}
                  value={searchParams.departure}
                  onChange={(e) => handleInputChange('departure', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Return Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  min={searchParams.departure || getTodayDate()}
                  value={searchParams.return}
                  onChange={(e) => handleInputChange('return', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          {/* Airline Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Airline (Optional)
            </label>
            <select
              value={searchParams.airline}
              onChange={(e) => handleInputChange('airline', e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Airlines</option>
              <option value="American Airlines">American Airlines</option>
              <option value="Delta Air Lines">Delta Air Lines</option>
              <option value="United Airlines">United Airlines</option>
              <option value="JetBlue Airways">JetBlue Airways</option>
              <option value="Southwest Airlines">Southwest Airlines</option>
              <option value="Alaska Airlines">Alaska Airlines</option>
              <option value="Spirit Airlines">Spirit Airlines</option>
              <option value="Frontier Airlines">Frontier Airlines</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="mt-6">
            <button
              onClick={handleSearch}
              className="btn-primary flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Search Flights</span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : flights.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {flights.length} flights found
                </h2>
              </div>
              
              {flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={(flight) => navigate(`/flights/${flight.id}`)}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plane className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria to find more flights.
              </p>
              <button
                onClick={() => {
                  setSearchParams({
                    from: '',
                    to: '',
                    departure: '',
                    return: '',
                    airline: ''
                  });
                  loadFlights();
                }}
                className="btn-primary"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
