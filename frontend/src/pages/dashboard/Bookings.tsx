import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, X, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { bookingsService, type Booking } from '../../services/bookings';

export default function Bookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const bookingData = await bookingsService.getMyBookings(user.id);
      setBookings(bookingData);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsService.cancelBooking(bookingId);
        loadBookings(); // Reload bookings
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your hotel reservations</p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.hotel?.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.hotel?.city}, {booking.hotel?.country}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <div className="text-2xl font-bold text-gray-900 mt-2">
                        {formatPrice(booking.totalPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Check-in</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(booking.checkIn)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Check-out</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(booking.checkOut)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Room</div>
                      <div className="font-medium text-gray-900">
                        {booking.room?.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Booking ID: #{booking.id} • Created on {formatDate(booking.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-4 lg:mt-0 lg:ml-6">
                  <Link
                    to={`/hotels/${booking.hotelId}`}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Hotel</span>
                  </Link>
                  
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">
            Start planning your next trip by booking a hotel.
          </p>
          <Link
            to="/hotels"
            className="btn-primary"
          >
            Browse Hotels
          </Link>
        </div>
      )}
    </div>
  );
}
