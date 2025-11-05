import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  Hotel,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
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


const NewBookingCard = ({ booking, onCancel, onViewDetail }: BookingCardProps) => {
  // Only render hotel bookings in this card
  if (booking.type !== 'hotel') return null;

  // Access hotel and room; normalized data provides placeholders if missing
  const hotel = booking.hotel;
  const room = booking.room;

  const status = booking.status;
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);

  // Select image: prefer room image, then hotel's thumbnail, then hotel's first image, then fallback
  const mockImage =
    booking.previewImage ||
    room?.previewImage ||
    room?.images?.[0] ||
    hotel?.thumbnail ||
    hotel?.images?.[0] ||
    (isNonEmptyString(hotel?.image) ? hotel?.image : undefined) ||
    '/placeholder-hotel.jpg';

  const formatDate = (dateString?: string) => { // Chấp nhận string | undefined
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border-2 border-sky-100 overflow-hidden hover:shadow-xl hover:border-sky-200 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row">
          {/* Hotel Image */}
          <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden">
            <SafeImage
              src={mockImage}
              alt={hotel?.name || `Hotel #${booking.hotel_id ?? 'N/A'}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor} backdrop-blur-sm`}>
                {statusIcon}
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </span>
            </div>
          </div>

        {/* Hotel Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Hotel className="h-5 w-5 text-sky-600" />
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">Hotel</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{hotel?.name || `Hotel #${booking.hotel_id ?? 'N/A'}`}</h3>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {/* Sử dụng city và country từ hotel */}
                <span>{hotel?.city || 'Unknown'}, {hotel?.country || ''}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Check-in</p>
              {/* Sử dụng check_in từ booking */}
              <p className="font-semibold text-gray-900">{formatDate(booking.check_in)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Check-out</p>
              {/* Sử dụng check_out từ booking */}
              <p className="font-semibold text-gray-900">{formatDate(booking.check_out)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Guests</p>
              {/* Sử dụng guests từ booking */}
              <p className="font-semibold text-gray-900">{booking.guests} guests</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Room Type</p>
              {/* Sử dụng tên phòng từ room */}
              <p className="font-semibold text-gray-900">{room?.name || 'Standard'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Price</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                {formatCurrency(booking.total_price, booking.currency || 'USD')}
              </p>

              {/* Payment status */}
              <div className="mt-2">
                <span className="text-xs text-gray-500 mr-2">Payment</span>
                {(() => {
                  const ps = booking.payment_status || 'unpaid';
                  const label = ps === 'succeeded' ? 'Paid' : ps === 'unpaid' ? 'Unpaid' : ps.charAt(0).toUpperCase() + ps.slice(1);
                  const color = ps === 'succeeded' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ps === 'unpaid' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200';
                  return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
                      {label}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onViewDetail(booking.id)}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                View Details
              </button>
              {status !== 'cancelled' && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="px-6 py-2.5 border-2 border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
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
  const handleViewDetail = (bookingId: number) => {
    // In a real app, this would open a modal or navigate to detail page
    toast(`Viewing details for booking #${bookingId}`);
  };

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
    </div>
  );
}
