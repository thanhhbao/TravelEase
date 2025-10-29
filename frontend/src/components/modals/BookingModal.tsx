import { useState } from 'react';
import { X, Calendar, Users, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { bookingsService, type CreateBookingPayload } from '../../services/bookings';
import type { Hotel, Room } from '../../services/hotels';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel;
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  onSuccess?: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  onSuccess
}: BookingModalProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotalPrice = () => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return room.price * nights;
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to continue.');
      return;
    }

    if (!user) {
      setError('User not found. Please sign in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const bookingPayload: CreateBookingPayload = {
        hotel_id: hotel.id,
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        total_price: calculateTotalPrice()
      };

      await bookingsService.createBooking(bookingPayload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = calculateTotalPrice();
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hotel Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{hotel.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{room.name}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{checkIn} - {checkOut}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Booking Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </label>
                <div className="text-gray-900">{checkIn}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </label>
                <div className="text-gray-900">{checkOut}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <div className="text-gray-900">{guests} {guests === 1 ? 'Guest' : 'Guests'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <div className="text-gray-900">{room.name}</div>
              <div className="text-sm text-gray-600">{room.beds}</div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>${room.price} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span>${room.price * nights}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes and fees</span>
                <span>$0</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Auth Warning */}
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                Please sign in to complete your booking.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            By booking, you agree to our terms and conditions.
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={isLoading || !isAuthenticated}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
