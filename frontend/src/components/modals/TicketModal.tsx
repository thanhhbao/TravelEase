import { useState } from 'react';
import { X, Plus, Minus, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { ticketsService, type CreateTicketPayload, type Passenger } from '../../services/tickets';
import type { Flight } from '../../services/flights';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight;
  onSuccess?: () => void;
}

export default function TicketModal({
  isOpen,
  onClose,
  flight,
  onSuccess
}: TicketModalProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', dateOfBirth: '', passportNumber: '' }
  ]);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const addPassenger = () => {
    if (passengers.length < 9) { // Max 9 passengers
      setPassengers([...passengers, { name: '', dateOfBirth: '', passportNumber: '' }]);
    }
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = passengers.map((passenger, i) =>
      i === index ? { ...passenger, [field]: value } : passenger
    );
    setPassengers(updatedPassengers);
  };

  const calculateTotalPrice = () => {
    return flight.price * passengers.length;
  };

  const validateForm = () => {
    for (const passenger of passengers) {
      if (!passenger.name.trim() || !passenger.dateOfBirth || !passenger.passportNumber.trim()) {
        return 'Please fill in all passenger details.';
      }
    }
    if (!contactEmail.trim() || !contactPhone.trim()) {
      return 'Please provide contact information.';
    }
    return null;
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

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const ticketPayload: CreateTicketPayload = {
        flightId: flight.id,
        passengers,
        contactEmail,
        contactPhone,
        totalPrice: calculateTotalPrice()
      };

      await ticketsService.createTicket(ticketPayload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch {
      setError('Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = calculateTotalPrice();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Book Flight</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Flight Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {flight.airline} - {flight.flightNumber}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{flight.fromAirport} → {flight.toAirport}</span>
              <span>{new Date(flight.departureTime).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Passengers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Passengers</h4>
              <button
                onClick={addPassenger}
                disabled={passengers.length >= 9}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Add Passenger</span>
              </button>
            </div>

            {passengers.map((passenger, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">
                    Passenger {index + 1}
                  </h5>
                  {passengers.length > 1 && (
                    <button
                      onClick={() => removePassenger(index)}
                      className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                      className="input-field"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      value={passenger.passportNumber}
                      onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                      className="input-field"
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Price Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>${flight.price} × {passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'}</span>
                <span>${flight.price * passengers.length}</span>
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
