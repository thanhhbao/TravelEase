import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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

const SummaryTile = ({ title, value, tone }: { title: string; value: number | string; tone: 'sky' | 'emerald' | 'amber' | 'rose' }) => {
  const tones: Record<typeof tone, string> = {
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className={`rounded-2xl border ${tones[tone]} px-4 py-3 shadow-sm`}>
      <div className="text-xs uppercase tracking-wide">{title}</div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
    </div>
  );
};

const Chip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

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

type TicketDetailState = {
  open: boolean;
  loading: boolean;
  ticket: Ticket | null;
};

// --- Main Component Tickets ---

export default function Tickets() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailState, setDetailState] = useState<TicketDetailState>({
    open: false,
    loading: false,
    ticket: null,
  });

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

  const totalTickets = tickets.length;
  const confirmedCount = tickets.filter((t) => t.status === 'confirmed').length;
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const cancelledCount = tickets.filter((t) => t.status === 'cancelled').length;
  const totalPrice = tickets.reduce((sum, t) => sum + Number(t.total_price ?? 0), 0);

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

  const openTicketDetail = async (ticket: Ticket) => {
    setDetailState({ open: true, loading: true, ticket });
    try {
      const detail = await ticketsService.getTicketById(ticket.id);
      if (detail) {
        setDetailState({
          open: true,
          loading: false,
          ticket: {
            ...ticket,
            ...detail,
            flight: detail.flight ?? ticket.flight,
            passengers: detail.passengers?.length ? detail.passengers : ticket.passengers,
          },
        });
      } else {
        setDetailState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Failed to load ticket detail:', error);
      toast.error('Unable to load ticket detail');
      setDetailState((prev) => ({ ...prev, loading: false }));
    }
  };

  const closeTicketDetail = () =>
    setDetailState({
      open: false,
      loading: false,
      ticket: null,
    });

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryTile title="Tickets" value={totalTickets} tone="sky" />
          <SummaryTile title="Confirmed" value={confirmedCount} tone="emerald" />
          <SummaryTile title="Pending" value={pendingCount} tone="amber" />
          <SummaryTile title="Cancelled" value={cancelledCount} tone="rose" />
        </div>
        <div className="mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Total value:</span>
          <span className="text-sky-700 font-bold">{formatPrice(totalPrice)}</span>
          <span className="mx-2 text-slate-300">•</span>
          <span className="font-semibold text-slate-900">Status:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700">
            {confirmedCount} confirmed
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-700">
            {pendingCount} pending
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs text-rose-700">
            {cancelledCount} cancelled
          </span>
        </div>
        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const statusConfig = getStatusConfig(ticket.status);
              const fallbackFlight = {
                id: ticket.flight_id,
                airline: "Flight",
                flight_number: `#${ticket.flight_id}`,
                fromAirport: "TBD",
                toAirport: "TBD",
                departureCity: "",
                arrivalCity: "",
                departure_time: ticket.created_at,
                arrival_time: ticket.created_at,
                duration: undefined,
                class: undefined,
              };
              const flight = ticket.flight ?? fallbackFlight;

              // Sử dụng duration/class từ flight data
              const mockDuration = flight.duration || "N/A";
              const mockClass = flight.class || "Economy";
              const passengerCount = ticket.passengers?.length ?? ticket.guest_count ?? 0;

              // Format totalPrice properly
              const formattedPrice = typeof ticket.total_price === 'string'
                ? parseFloat(ticket.total_price)
                : ticket.total_price;

              return (
                <div
                  key={ticket.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="border-b border-slate-200/70 bg-white/70 px-6 py-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 grid place-items-center text-white shadow-lg">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                          Booking confirmation: {statusConfig.label}
                        </div>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{flight.airline}</h3>
                        <p className="text-sm text-slate-500">
                          Flight {flight.flight_number} • {mockClass}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center space-x-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </span>
                      <div className="mt-2 text-2xl font-bold text-sky-700">
                        {formatPrice(formattedPrice)}
                      </div>
                      <div className="text-xs text-slate-500">Record locator: pending</div>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>Departure</span>
                          <span className="text-slate-500">• Non-stop</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {mockDuration}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Departure</p>
                          <div className="text-xl font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                          <p className="text-sm text-slate-600">{flight.departureCity || flight.fromAirport}</p>
                          <p className="text-xs text-slate-500">{formatDate(flight.departure_time)}</p>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                            <span className="text-slate-400">·····</span>
                            <Plane className="h-4 w-4 text-sky-600" />
                            <span className="text-slate-400">·····</span>
                            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                          </div>
                          <div className="text-xs text-slate-500">Flight duration</div>
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {mockDuration}
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Arrival</p>
                          <div className="text-xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                          <p className="text-sm text-slate-600">{flight.arrivalCity || flight.toAirport}</p>
                          <p className="text-xs text-slate-500">{formatDate(flight.arrival_time)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Users className="h-5 w-5 text-sky-600" /> Passengers ({passengerCount || 1})
                        </div>
                        <div className="text-xs text-slate-500">
                          Ticket ID #{ticket.id} • Booked {formatDate(ticket.created_at)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {ticket.passengers && ticket.passengers.length > 0 ? (
                          ticket.passengers.map((passenger, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                            >
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{passenger.name || ticket.contact_email || `Passenger ${index + 1}`}</span>
                                {passenger.seat && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                    Seat {passenger.seat}
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600 text-xs">
                                Passport: {passenger.passportNumber || '—'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                            <div className="font-semibold text-slate-900">Guests</div>
                            <div className="text-slate-600">
                              {passengerCount || 1} {passengerCount === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-500">
                          <span className="font-medium text-slate-700">Alerts:</span> We will notify you for delays or gate changes.
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                          onClick={() => openTicketDetail(ticket)}
                          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          View details
                        </button>
                        {ticket.status === 'pending' && (
                          <button
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                            Cancel request
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
      <TicketDetailOverlay detailState={detailState} onClose={closeTicketDetail} />
    </div>
  );
}

function TicketDetailOverlay({
  detailState,
  onClose,
}: {
  detailState: TicketDetailState;
  onClose: () => void;
}) {
  const ticket = detailState.ticket;
  const fallbackFlight = ticket
    ? {
        id: ticket.flight_id,
        airline: 'Flight',
        flight_number: `#${ticket.flight_id}`,
        fromAirport: 'TBD',
        toAirport: 'TBD',
        departureCity: '',
        arrivalCity: '',
        departure_time: ticket.created_at,
        arrival_time: ticket.created_at,
        duration: undefined,
        class: undefined,
      }
    : null;

  const flight = ticket?.flight ?? fallbackFlight;
  const passengerCount = ticket?.passengers?.length ?? ticket?.guest_count ?? 0;
  const statusConfig = ticket ? getStatusConfig(ticket.status) : getStatusConfig('pending');

  return (
    <AnimatePresence>
      {detailState.open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-sky-100">Flight ticket</p>
                  <h3 className="text-2xl font-bold">
                    {flight?.airline || 'Your flight'}
                  </h3>
                  <p className="text-sm text-sky-100">
                    {flight?.fromAirport} <ArrowRight className="inline h-4 w-4" /> {flight?.toAirport}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center space-x-1.5 rounded-full border bg-white/20 px-3 py-1.5 text-xs font-semibold ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </span>
                  <div className="text-sm font-semibold">
                    Ticket #{ticket?.id ?? '—'}
                  </div>
                </div>
              </div>
            </div>

            {detailState.loading && (
              <div className="p-6 text-center text-slate-600">Loading ticket details...</div>
            )}

            {!detailState.loading && ticket && flight && (
              <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  <span>Booking confirmation: {ticket.status === 'pending' ? 'Pending' : 'Confirmed'}</span>
                  <span>Record locator: pending</span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Departure</p>
                    <div className="text-lg font-semibold text-slate-900">{flight.fromAirport}</div>
                    <p className="text-sm text-slate-600">{flight.departureCity}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" /> {formatDate(flight.departure_time)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" /> {formatTime(flight.departure_time)}
                    </div>
                  </div>

                  <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white p-4 text-center">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Duration</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {flight.duration || 'N/A'}
                    </div>
                    <div className="mt-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      {flight.class || 'Economy'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Arrival</p>
                    <div className="text-lg font-semibold text-slate-900">{flight.toAirport}</div>
                    <p className="text-sm text-slate-600">{flight.arrivalCity}</p>
                    <div className="mt-2 flex items-center justify-end gap-2 text-sm text-slate-600">
                      {formatDate(flight.arrival_time)} <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
                      {formatTime(flight.arrival_time)} <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Users className="h-5 w-5 text-sky-600" /> Passengers ({passengerCount || 1})
                    </div>
                    <div className="space-y-2">
                          {ticket.passengers && ticket.passengers.length > 0 ? (
                            ticket.passengers.map((passenger, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                              >
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span>{passenger.name || ticket.contact_email || `Passenger ${index + 1}`}</span>
                                  {passenger.seat && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                      Seat {passenger.seat}
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-600 text-xs">
                                  Passport: {passenger.passportNumber || '—'}
                                </div>
                              </div>
                            ))
                      ) : (
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                          <div className="font-semibold text-slate-900">Guests</div>
                          <div className="text-slate-600">
                            {passengerCount || 1} {passengerCount === 1 ? 'person' : 'people'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Ticket value</p>
                      <div className="text-2xl font-bold text-slate-900">
                        {formatPrice(
                          typeof ticket.total_price === 'string'
                            ? parseFloat(ticket.total_price)
                            : ticket.total_price,
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Booked on {formatDate(ticket.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Contact</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {ticket.contact_email || 'Email not provided'}
                      </p>
                      <p className="text-sm text-slate-600">{ticket.contact_phone || 'Phone not provided'}</p>
                    </div>
                    <div className="space-y-2">
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        onClick={() => toast.success('Airline contact request sent')}
                      >
                        Contact airline
                      </button>
                      <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Alerts & delays: we will notify you here if the airline reports changes.
                      </div>
                      <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:shadow-md transition-all duration-200"
                      >
                        Close detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
