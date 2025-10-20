import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Calendar, Users, X, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { ticketsService, type Ticket } from '../../services/tickets';

export default function Tickets() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const ticketData = await ticketsService.getMyTickets(user.id);
      setTickets(ticketData);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user, loadTickets]);

  const handleCancelTicket = async (ticketId: number) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      try {
        await ticketsService.cancelTicket(ticketId);
        await loadTickets(); // Reload tickets
      } catch (error) {
        console.error('Failed to cancel ticket:', error);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
        <p className="text-gray-600">Manage your flight reservations</p>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {ticket.flight?.airline} - {ticket.flight?.flightNumber}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Plane className="h-4 w-4" />
                          <span>{ticket.flight?.fromAirport} → {ticket.flight?.toAirport}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{ticket.passengers.length} {ticket.passengers.length === 1 ? 'Passenger' : 'Passengers'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(ticket.status)}
                      <div className="text-2xl font-bold text-gray-900 mt-2">
                        {formatPrice(ticket.totalPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Departure</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(ticket.flight?.departureTime || '')} at {formatTime(ticket.flight?.departureTime || '')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Arrival</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(ticket.flight?.arrivalTime || '')} at {formatTime(ticket.flight?.arrivalTime || '')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">Passengers</div>
                    <div className="space-y-1">
                      {ticket.passengers.map((passenger, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          {passenger.name} • Passport: {passenger.passportNumber}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Ticket ID: #{ticket.id} • Created on {formatDate(ticket.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-4 lg:mt-0 lg:ml-6">
                  <Link
                    to={`/flights/${ticket.flightId}`}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Flight</span>
                  </Link>
                  
                  {ticket.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelTicket(ticket.id)}
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
            <Plane className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-600 mb-6">
            Start planning your next trip by booking a flight.
          </p>
          <Link
            to="/flights"
            className="btn-primary"
          >
            Browse Flights
          </Link>
        </div>
      )}
    </div>
  );
}
