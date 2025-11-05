import { Calendar, MapPin, Users, X, Eye, Plane, Building } from 'lucide-react';
import SafeImage from '../common/SafeImage';
import type { Booking } from '../../services/bookings';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: number) => void;
  onViewDetail?: (id: number) => void;
}

export default function BookingCard({ booking, onCancel, onViewDetail }: BookingCardProps) {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const isHotelBooking = !!booking.hotel_id;
  const isFlightBooking = !!booking.flight_id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-1/3">
          <div className="h-48 md:h-full">
            <SafeImage
              src={
                booking.previewImage ||
                booking.room?.previewImage ||
                (booking.room?.images && booking.room.images.length ? booking.room.images[0] : undefined) ||
                booking.hotel?.thumbnail ||
                (booking.hotel?.images && booking.hotel.images.length ? booking.hotel.images[0] : undefined) ||
                booking.hotel?.image ||
                (booking.flight ? `/airplane.png` : '/placeholder-hotel.jpg')
              }
              alt={booking.room?.name || booking.hotel?.name || booking.flight?.flight_number || 'Booking'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {isHotelBooking && <Building className="h-5 w-5 text-blue-600" />}
                {isFlightBooking && <Plane className="h-5 w-5 text-blue-600" />}
                <h3 className="text-xl font-semibold text-gray-900">
                  {booking.hotel?.name || `${booking.flight?.airline} ${booking.flight?.flight_number}`}
                </h3>
              </div>
              {booking.hotel && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{booking.hotel.city}, {booking.hotel.country}</span>
                </div>
              )}
              {booking.flight && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{booking.flight.departure_city} → {booking.flight.arrival_city}</span>
                </div>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {booking.check_in ? formatDate(booking.check_in) : formatDate(booking.flight?.departure_time || booking.created_at)}
                    {booking.check_out && ` - ${formatDate(booking.check_out)}`}
                    {booking.flight?.arrival_time && ` - ${formatDate(booking.flight.arrival_time)}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(booking.status)}
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatPrice(booking.total_price)}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Room/Flight Details */}
          {booking.room && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <strong>Room:</strong> {booking.room.name}
              </div>
            </div>
          )}

          {/* Booking Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>Booking ID: #{booking.id}</span>
            <span>Created: {formatDate(booking.created_at)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewDetail?.(booking.id)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </button>

            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onCancel?.(booking.id)}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
