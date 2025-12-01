import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar,
  Search,
  Filter,
  Hotel,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  AlertTriangle,
  // Bỏ các icon liên quan đến Flight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../store/auth';
import {
  bookingsService,
  type Booking,
  type BookingsResponse,
} from '../../services/bookings';
import SafeImage from '../../components/common/SafeImage'; // Thêm import SafeImage để fix lỗi không tìm thấy tên SafeImage
// Sẽ thay thế BookingCard cũ bằng UI mới ngay trong component này
// import BookingCard from '../../components/cards/BookingCard';
import Pagination from '../../components/common/Pagination';
import { getBookingPreview } from '../../utils/bookingPreview';
// FilterPanel intentionally unused in this trimmed dashboard view

type BookingDetailState = {
  open: boolean;
  loading: boolean;
  booking: Booking | null;
};

// --- Component BookingCard inline (UI mới cho Hotel Booking) ---

// Hàm trợ giúp để lấy màu và icon trạng thái
const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

// Component BookingCard mới (Chỉ hiển thị logic cho Hotel Booking)
// Giả định `Booking` type có đủ các trường cần thiết (name, location, checkIn, checkOut, rooms, totalPrice)
// và trường `type` để lọc ra loại 'hotel' (nếu cần).
// Tạm thời tôi sẽ chỉ hiển thị các Booking có type là 'hotel' để đồng bộ với yêu cầu.
type BookingCardProps = {
  booking: Booking;
  onCancel: (id: number) => void;
  onViewDetail: (id: number) => void;
};

// Hàm định dạng tiền tệ (cho phép override currency)
const formatCurrency = (amount: number, currencyCode = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch (e) {
    return `${amount} ${currencyCode || 'USD'}`;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatTime = (dateString?: string) => {
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

const calculateNights = (checkIn?: string, checkOut?: string) => {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff)) return null;
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const extractUrlFromObject = (item: Record<string, unknown>): string | undefined => {
  const candidates = ['url', 'path', 'src', 'image', 'thumbnail'];
  for (const key of candidates) {
    const maybe = item[key];
    if (isNonEmptyString(maybe)) return maybe;
  }
  return undefined;
};

const parseImages = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (isNonEmptyString(item)) return item;
        if (item && typeof item === 'object') {
          return extractUrlFromObject(item as Record<string, unknown>);
        }
        return undefined;
      })
      .filter(isNonEmptyString);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(isNonEmptyString);
      }
    } catch {
      // fall through to CSV fallback
    }

    return trimmed
      .split(',')
      .map((item) => item.trim().replace(/^"(.*)"$/, '$1'))
      .filter((item) => item.length > 0);
  }

  return [];
};

const normalizeHotelMedia = (raw: Booking['hotel'] | undefined) => {
  if (!raw) return undefined;

  const images = parseImages(raw.images);
  const fallbackImage = isNonEmptyString(raw.image) ? raw.image : undefined;
  const thumbnail = isNonEmptyString(raw.thumbnail)
    ? raw.thumbnail
    : images[0] ?? fallbackImage;

  return {
    ...raw,
    images,
    thumbnail,
  };
};

const normalizeRoomMedia = (raw: Booking['room'] | undefined) => {
  if (!raw) return undefined;

  const images = parseImages(raw.images);
  const fromImageField = isNonEmptyString(raw.image) ? raw.image : undefined;
  const fromThumbnailField = isNonEmptyString(raw.thumbnail) ? raw.thumbnail : undefined;
  const previewImage = fromImageField ?? fromThumbnailField ?? images[0];

  return {
    ...raw,
    images,
    previewImage,
  };
};

const Chip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);


const NewBookingCard = ({ booking, onCancel, onViewDetail }: BookingCardProps) => {
  if (booking.type !== 'hotel') return null;

  const hotel = booking.hotel;
  const room = booking.room;
  const status = booking.status;
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);

  const mockImage =
    booking.previewImage ||
    room?.previewImage ||
    room?.images?.[0] ||
    hotel?.thumbnail ||
    hotel?.images?.[0] ||
    (isNonEmptyString(hotel?.image) ? hotel?.image : undefined) ||
    '/placeholder-hotel.jpg';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-2/5 h-72 lg:h-auto relative overflow-hidden">
          <SafeImage
            src={mockImage}
            alt={hotel?.name || `Hotel #${booking.hotel_id ?? 'N/A'}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow border border-slate-200">
            {statusIcon}
            <span className="text-xs font-semibold text-slate-700">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 bg-white/90 text-slate-800 px-3 py-1 rounded-full shadow border border-slate-200">
              <MapPin className="h-3.5 w-3.5 text-sky-600" /> {hotel?.city}, {hotel?.country}
            </span>
          </div>
        </div>

        <div className="lg:w-3/5 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-semibold border border-sky-100">
                <Hotel className="h-4 w-4" />
                Hotel booking
              </div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {hotel?.name || `Hotel #${booking.hotel_id ?? 'N/A'}`}
              </h3>
              <p className="text-xs uppercase tracking-wide text-slate-400">Booking #{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold text-sky-700">
                {formatCurrency(booking.total_price, booking.currency || 'USD')}
              </p>
              <span className={`mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                {booking.payment_status || 'unpaid'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Chip label="Check-in" value={formatDate(booking.check_in)} />
            <Chip label="Check-out" value={formatDate(booking.check_out)} />
            <Chip label="Guests" value={`${booking.guests} guests`} />
          </div>

          {room && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Room: {room.name}</div>
                <p className="text-sm text-slate-500">
                  {room.beds || 'Room'} • {room.price_per_night ? `$${room.price_per_night}/night` : 'Rate on request'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs bg-white px-3 py-1 rounded-full border border-slate-200">
                Nightly · {room.price_per_night ? `$${room.price_per_night}` : 'N/A'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            {status === 'pending' && (
              <button
                onClick={() => onCancel(booking.id)}
                className="px-5 py-2 border border-amber-200 text-amber-600 rounded-full hover:bg-amber-50 transition-all duration-200 text-sm font-semibold"
              >
                Cancel request
              </button>
            )}
            <button
              onClick={() => onViewDetail(booking.id)}
              className="px-5 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-full hover:shadow-md transition-all duration-200 text-sm font-semibold"
            >
              View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component Bookings ---

export default function Bookings() {
  const { user } = useAuthStore();
  const [bookingsData, setBookingsData] = useState<BookingsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    // BỎ type filter vì chỉ giữ lại Hotel
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [detailState, setDetailState] = useState<BookingDetailState>({
    open: false,
    loading: false,
    booking: null,
  });

  // Load Bookings function
  const loadBookings = useCallback(
    async (page = 1) => {
      if (!user) return;

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const params = {
          page,
          per_page: 10,
          type: 'hotel', // Gửi mặc định type=hotel để chỉ lấy hotel bookings
          ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== ''),
          ),
        };

        const data = await bookingsService.getMyBookings(params);
  // Normalize bookings: ensure `type`, `currency` and `payment_status` exist so
  // the UI doesn't accidentally filter out valid hotel bookings when backend
  // doesn't include the computed `type` attribute or optional fields.
        const normalizedItems = data.data.map((raw) => {
          const fallbackHotel = raw.hotel_id
            ? {
                id: raw.hotel_id,
                name: `Hotel #${raw.hotel_id}`,
                city: '',
                country: '',
                image: undefined,
                images: [] as string[],
                thumbnail: undefined,
              }
            : undefined;

          const fallbackRoom = raw.room_id
            ? {
                id: raw.room_id,
                name: 'Standard',
                price_per_night: undefined,
                images: [] as string[],
                previewImage: undefined,
                image: undefined,
                thumbnail: undefined,
              }
            : undefined;

          const hotel = normalizeHotelMedia(raw.hotel ?? fallbackHotel);
          const room = normalizeRoomMedia(raw.room ?? fallbackRoom);

          const type = raw.type || (raw.hotel_id ? 'hotel' : raw.flight_id ? 'flight' : 'unknown');
          const status = raw.status || 'pending';
          const currency = raw.currency || 'USD';
          const paymentStatus =
            raw.payment_status || (raw.stripe_payment_intent_id ? 'succeeded' : 'unpaid');

          const cachedPreview = getBookingPreview(raw.id);

          const rawPreview = (() => {
            if (isNonEmptyString(raw.previewImage)) return raw.previewImage;
            if ('preview_image' in raw) {
              const snake = (raw as { preview_image?: unknown }).preview_image;
              return isNonEmptyString(snake) ? snake : undefined;
            }
            return undefined;
          })();

          const hotelImageFallback = (() => {
            const value = hotel?.image;
            return isNonEmptyString(value) ? value : undefined;
          })();

          const previewImage =
            rawPreview ??
            cachedPreview ??
            room?.previewImage ??
            hotel?.thumbnail ??
            hotel?.images?.[0] ??
            hotelImageFallback;

          return {
            ...raw,
            type,
            status,
            currency,
            payment_status: paymentStatus,
            hotel,
            room,
            previewImage,
          };
        });

        const hotelBookingsData = {
          ...data,
          data: normalizedItems.filter((b) => b.type === 'hotel'),
        };

        setBookingsData(hotelBookingsData);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        toast.error('Failed to load bookings');
        setErrorMessage(
          'Unable to load your bookings. Please confirm the backend is running and the database is migrated.',
        );
        setBookingsData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [user, filters],
  );

  useEffect(() => {
    if (user) {
      loadBookings(currentPage);
    }
  }, [user, currentPage, loadBookings]);

  // Handler Hủy Booking
  const handleCancelBooking = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsService.cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        await loadBookings(currentPage); // Reload current page
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        toast.error('Failed to cancel booking');
      }
    }
  };

  // Handler xem chi tiết
  const handleViewDetail = async (bookingId: number) => {
    setDetailState({ open: true, loading: true, booking: null });
    try {
      const booking = await bookingsService.getBookingDetail(bookingId);
      setDetailState({ open: true, loading: false, booking });
    } catch (error) {
      console.error('Failed to load booking detail:', error);
      toast.error('Unable to load booking details.');
      setDetailState({ open: false, loading: false, booking: null });
    }
  };

  const closeDetail = () =>
    setDetailState({
      open: false,
      loading: false,
      booking: null,
    });

  // Handler chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler thay đổi filter
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Xóa tất cả filters
  const clearFilters = () => {
    setFilters({ status: '', search: '' });
    setCurrentPage(1);
  };

  const bookings = bookingsData?.data ?? [];
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.total_price ?? 0), 0);
  const currencySymbol = bookings[0]?.currency || 'USD';

  // Tính số lượng filter đang áp dụng (BỎ type)
  const activeFiltersCount = Object.values(filters).filter((v) => v !== '')
    .length;

  // Xử lý Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-600"></div>
      </div>
    );
  }

  // --- Render UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50">
      <Toaster position="top-right" />

      {/* Header Section (Design mới) */}
      {/* <div className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">My Hotel Bookings</h1>
              <p className="text-sky-100 text-lg">Manage your hotel reservations</p>
            </div>
          </div>
        </div>
      </div> */}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <SummaryTile title="Bookings" value={totalBookings} tone="sky" />
          <SummaryTile title="Confirmed" value={confirmedCount} tone="emerald" />
          <SummaryTile title="Pending" value={pendingCount} tone="amber" />
          <SummaryTile title="Cancelled" value={cancelledCount} tone="rose" />
        </div>

        <div className="mb-8 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Total spent:</span>
          <span className="text-sky-700 font-bold">
            {formatCurrency(totalSpent, currencySymbol)}
          </span>
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

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-400" />
              <input
                type="text"
                placeholder="Search hotel name..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-sky-100 rounded-xl hover:border-sky-300 hover:shadow-md transition-all duration-200"
            >
              <Filter className="h-5 w-5 text-sky-600" />
              <span className="font-medium text-gray-700">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel (Custom UI) */}
          {showFilters && (
            <div className="mt-6 bg-white rounded-2xl shadow-lg border-2 border-sky-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filter Bookings</h3>
                <button
                  onClick={clearFilters}
                  className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                  <div className="flex flex-wrap gap-4">
                    {['', 'pending', 'confirmed', 'cancelled'].map((status) => (
                      <label key={status} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          checked={filters.status === status}
                          onChange={() => handleFilterChange({ status })}
                          className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-gray-700 group-hover:text-sky-600 transition-colors">
                          {status === '' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {errorMessage ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-rose-100">
            <div className="bg-rose-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
              <XCircle className="h-12 w-12 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              We couldn&apos;t load your bookings
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {errorMessage}
            </p>
            <button
              onClick={() => loadBookings(currentPage)}
              className="px-8 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : bookingsData && bookingsData.data.length > 0 ? (
          <>
            <div className="space-y-6 mb-8">
              {bookingsData.data.map((booking) => (
                // Chỉ hiển thị NewBookingCard nếu booking là 'hotel'
                <NewBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={bookingsData.current_page}
              totalPages={bookingsData.last_page}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-sky-100">
            <div className="bg-gradient-to-r from-sky-100 to-cyan-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-sky-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Hotel Bookings yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start planning your next trip by booking a hotel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/hotels" // Giữ nguyên Link
                className="px-8 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                Browse Hotels
              </Link>
              {/* Bỏ Browse Flights */}
            </div>
          </div>
        )}
      </div>

      <BookingDetailOverlay
        detailState={detailState}
        onClose={closeDetail}
        onCancel={handleCancelBooking}
      />
    </div>
  );
}

function BookingDetailOverlay({
  detailState,
  onClose,
  onCancel,
}: {
  detailState: BookingDetailState;
  onClose: () => void;
  onCancel: (id: number) => void;
}) {
  const booking = detailState.booking;
  const hotel = booking?.hotel;
  const room = booking?.room;
  const nights = calculateNights(booking?.check_in, booking?.check_out);
  const statusIcon = booking ? getStatusIcon(booking.status) : null;
  const statusColor = booking ? getStatusColor(booking.status) : 'bg-slate-100 text-slate-700 border-slate-200';
  const [quickRating, setQuickRating] = useState<number | null>(null);
  const [quickFeedback, setQuickFeedback] = useState('');

  useEffect(() => {
    setQuickRating(null);
    setQuickFeedback('');
  }, [booking?.id, detailState.open]);

  const heroImage =
    booking?.previewImage ||
    room?.previewImage ||
    room?.images?.[0] ||
    hotel?.thumbnail ||
    hotel?.images?.[0] ||
    (isNonEmptyString(hotel?.image) ? hotel?.image : undefined) ||
    '/placeholder-hotel.jpg';

  return (
    <AnimatePresence>
      {detailState.open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="h-52 w-full overflow-hidden bg-slate-100 flex-shrink-0">
              <SafeImage
                src={heroImage}
                alt={hotel?.name || 'Booking cover'}
                className="h-full w-full object-cover"
              />
            </div>

            <motion.div
              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-sm font-semibold shadow-lg border border-slate-200/80"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {statusIcon}
              </div>
              <span className={`inline-flex items-center gap-1 ${statusColor}`}>
                {booking?.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : '—'}
              </span>
            </motion.div>

            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow">
              Booking #{booking?.id ?? '...'}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Hotel</p>
                  <h3 className="text-2xl font-bold text-slate-900">{hotel?.name || 'Hotel booking'}</h3>
                  <div className="text-sm text-slate-600">
                    {hotel?.city} {hotel?.country ? `• ${hotel.country}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total amount</p>
                  <div className="text-3xl font-bold text-sky-700">
                    {booking
                      ? formatCurrency(booking.total_price, booking.currency || 'USD')
                      : '—'}
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {booking?.payment_status || 'unpaid'}
                  </div>
                </div>
              </div>

              {detailState.loading && (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  Loading booking details...
                </div>
              )}

              {!detailState.loading && booking && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Chip label="Check-in" value={formatDate(booking.check_in)} />
                    <Chip label="Check-out" value={formatDate(booking.check_out)} />
                    <Chip
                      label="Guests"
                      value={`${booking.guests} guest${booking.guests > 1 ? 's' : ''}`}
                    />
                    <Chip label="Nights" value={nights ? `${nights} night${nights > 1 ? 's' : ''}` : '—'} />
                    <Chip label="Payment" value={booking.payment_status || 'unpaid'} />
                    <Chip label="Created" value={formatDate(booking.created_at)} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Room</p>
                          <h4 className="text-lg font-semibold text-slate-900">
                            {room?.name || 'Room details'}
                          </h4>
                        </div>
                        {room?.price_per_night && (
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 border border-slate-200">
                            ${room.price_per_night}/night
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        {room?.beds ? `${room.beds} beds` : 'Comfortable space'} •
                        &nbsp;Perfect for {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </div>
                      {room?.images && room.images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                          {room.images.slice(0, 6).map((img, idx) => (
                            <SafeImage
                              key={idx}
                              src={img}
                              alt={`Room preview ${idx + 1}`}
                              className="h-20 w-28 flex-shrink-0 rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Reference</p>
                        <p className="text-sm font-semibold text-slate-900">#{booking.id}</p>
                        <p className="text-xs text-slate-500">Updated {formatDate(booking.updated_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Check-in time</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatTime(booking.check_in)} — {formatTime(booking.check_out)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        Need changes? Use actions below to rebook or contact host.
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Quick review</p>
                        {quickRating && (
                          <span className="text-xs font-semibold text-emerald-600">Thanks for rating!</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            onClick={() => {
                              setQuickRating(score);
                              toast.success(`Rated ${score}/5 for Booking #${booking.id}`);
                            }}
                            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              quickRating && quickRating >= score
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:bg-sky-50'
                            }`}
                          >
                            {score} ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={quickFeedback}
                        onChange={(e) => setQuickFeedback(e.target.value)}
                        placeholder="Share quick feedback with the host..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-sky-300 focus:ring-2 focus:ring-sky-200"
                        rows={2}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            toast.success('Feedback sent to host');
                            setQuickFeedback('');
                          }}
                          className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition"
                        >
                          Send feedback
                        </button>
                        {hotel?.id && (
                          <Link
                            to={`/hotels/${hotel.id}#reviews`}
                            className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                          >
                            Go to full review
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Actions</p>
                      <div className="space-y-3">
                        <Link
                          to={hotel?.id ? `/hotels/${hotel.id}` : '/hotels'}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:shadow-md transition"
                        >
                          <Hotel className="h-4 w-4" />
                          Rebook this stay
                        </Link>
                        <a
                          href={`mailto:support@travelease.local?subject=Booking%20#${booking.id}%20-%20Question&body=Hi,%20I%20need%20help%20with%20booking%20#${booking.id}.`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                        >
                          <Phone className="h-4 w-4" />
                          Contact host
                        </a>
                        <a
                          href={`mailto:support@travelease.local?subject=Booking%20#${booking.id}%20-%20Issue/Complaint&body=Hi,%20I%20had%20an%20issue%20with%20booking%20#${booking.id}%20(e.g.%20forgotten%20item,%20problem%20on%20site).`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Report issue / forgot item
                        </a>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => onCancel(booking.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/90 to-white/30 px-6 pb-4 pt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-white border border-slate-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SummaryTile({
  title,
  value,
  tone = 'sky',
}: {
  title: string;
  value: number | string;
  tone?: 'sky' | 'emerald' | 'amber' | 'rose';
}) {
  const toneMap: Record<typeof tone, string> = {
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-2xl border ${toneMap[tone]} px-4 py-3 shadow-sm`}>
      <div className="text-xs uppercase tracking-wide">{title}</div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
    </div>
  );
}
