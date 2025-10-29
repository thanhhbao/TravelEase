import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Calendar,
  Users,
  X,
  Eye,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { ticketsService, type Ticket } from '../../services/tickets';
import toast, { Toaster } from 'react-hot-toast'; 

// --- Helper Functions ---

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed':
      return {
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Confirmed',
      };
    case 'pending':
      return {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Pending',
      };
    case 'cancelled':
      return {
        color: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Cancelled',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: null,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      };
  }
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString.split('T')[0] || dateString;
  }
};

const formatTime = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// --- Main Component Tickets ---

export default function Tickets() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // LOGIC GỐC: Load Tickets
  const loadTickets = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Loading tickets for user:', user.id); // Debug log
      const ticketData = await ticketsService.getMyTickets(user.id);
      console.log('Loaded tickets:', ticketData); // Debug log
      setTickets(ticketData);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load flight tickets');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user, loadTickets]);

  // LOGIC GỐC: Cancel Ticket
  const handleCancelTicket = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      try {
        await ticketsService.cancelTicket(ticketId);
        toast.success('Ticket cancelled successfully'); 
        await loadTickets(); 
      } catch (error) {
        console.error('Failed to cancel ticket:', error);
        toast.error('Failed to cancel ticket'); 
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50">
      <Toaster position="top-right" />

      {/* Header Section (Design mới) */}
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const statusConfig = getStatusConfig(ticket.status);
              const flight = ticket.flight;
              
              if (!flight) return null;

              // Sử dụng duration/class từ flight data
              const mockDuration = flight.duration || "N/A";
              const mockClass = flight.class || "Economy";

              // Format totalPrice properly
              const formattedPrice = typeof ticket.total_price === 'string'
                ? parseFloat(ticket.total_price)
                : ticket.total_price;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-sky-100 overflow-hidden hover:shadow-xl hover:border-sky-200 transition-all duration-300"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-sky-50 to-cyan-50 px-6 py-4 border-b border-sky-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-2 rounded-lg">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {flight.airline}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Flight {flight.flight_number} • {mockClass} Class
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </span>
                        <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                          {formatPrice(formattedPrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Route */}
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                      {/* Departure */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-5 w-5 text-sky-600" />
                          <span className="text-sm font-medium text-gray-500">Departure</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {flight.fromAirport}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{flight.departureCity}</div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {/* SỬA LỖI: Dùng departure_time */}
                            {formatDate(flight.departure_time)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {/* SỬA LỖI: Dùng departure_time */}
                            {formatTime(flight.departure_time)}
                          </span>
                        </div>
                      </div>

                      {/* Duration Arrow */}
                      <div className="flex flex-col items-center px-6">
                        <div className="bg-gradient-to-r from-sky-100 to-cyan-100 px-4 py-2 rounded-full mb-2">
                          <span className="text-sm font-semibold text-sky-700">
                            {mockDuration}
                          </span>
                        </div>
                        <div className="relative w-24">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-dashed border-sky-300"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <ArrowRight className="h-6 w-6 text-sky-600 bg-white" />
                          </div>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">Arrival</span>
                          <MapPin className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {flight.toAirport}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{flight.arrivalCity}</div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {/* SỬA LỖI: Dùng arrival_time */}
                            {formatDate(flight.arrival_time)}
                          </span>
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className="text-sm font-medium text-gray-700">
                            {/* SỬA LỖI: Dùng arrival_time */}
                            {formatTime(flight.arrival_time)}
                          </span>
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Passenger Info */}
                    <div className="bg-gradient-to-r from-sky-50/50 to-cyan-50/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="h-5 w-5 text-sky-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Passengers ({ticket.passengers.length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {ticket.passengers.map((passenger, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-white rounded-lg px-4 py-2">
                            <div>
                              <span className="font-medium text-gray-900">{passenger.name}</span>
                            </div>
                            <div className="text-gray-600">
                              <span className="text-xs">Passport:</span> {passenger.passportNumber}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ticket Footer (Actions) */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">Ticket ID:</span> #{ticket.id}
                        <span className="mx-2">•</span>
                        <span>Booked on {formatDate(ticket.created_at)}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/flights/${flight.id}`}
                          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                        
                        {ticket.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="flex items-center space-x-2 px-5 py-2.5 border-2 border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 font-medium"
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
            })}
          </div>
        ) : (
          /* Empty State (Design mới) */
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-sky-100">
            <div className="bg-gradient-to-r from-sky-100 to-cyan-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plane className="h-12 w-12 text-sky-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No flights yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start planning your next trip by booking a flight.
            </p>
            <Link
              to="/flights"
              className="px-8 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              Browse Flights
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}