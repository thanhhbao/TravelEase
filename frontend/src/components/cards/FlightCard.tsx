import { Clock, Plane, Users, ArrowRight } from 'lucide-react';
import type { Flight } from '../../services/flights';

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  className?: string;
}

export default function FlightCard({ flight, onSelect, className = '' }: FlightCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`card hover-lift group ${className}`}>
      <div className="flex items-center justify-between">
        {/* Flight Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors duration-300">
                <Plane className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <span className="font-bold text-secondary-900 text-lg">{flight.airline}</span>
                <div className="text-sm text-secondary-500 font-medium">{flight.flightNumber}</div>
              </div>
            </div>
          </div>

          {/* Route and Times */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                {formatTime(flight.departureTime)}
              </div>
              <div className="text-sm text-secondary-600 font-medium">{flight.fromAirport}</div>
            </div>

            <div className="flex-1 mx-8">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-200 to-primary-300 rounded-full"></div>
                <div className="p-2 bg-primary-100 rounded-full">
                  <Clock className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-300 to-primary-200 rounded-full"></div>
              </div>
              <div className="text-center text-sm text-primary-600 font-semibold">
                {formatDuration(flight.durationMin)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                {formatTime(flight.arrivalTime)}
              </div>
              <div className="text-sm text-secondary-600 font-medium">{flight.toAirport}</div>
            </div>
          </div>

          {/* Seats Available */}
          <div className="flex items-center space-x-2 text-sm text-secondary-600 mb-4">
            <Users className="h-4 w-4 text-primary-500" />
            <span className="font-medium">{flight.seatsAvailable} seats available</span>
          </div>
        </div>

        {/* Price and Select Button */}
        <div className="ml-8 text-right">
          <div className="text-4xl font-bold gradient-text mb-2">
            {formatPrice(flight.price)}
          </div>
          <div className="text-sm text-secondary-500 mb-6 font-medium">per person</div>
          {onSelect && (
            <button
              onClick={() => onSelect(flight)}
              className="btn-primary w-full group"
            >
              <span>Select Flight</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
