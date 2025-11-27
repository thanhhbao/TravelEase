import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Inbox,
  CalendarClock,
  ExternalLink,
  Globe,
  MapPin,
  Plane,
} from "lucide-react";
import { useAuthStore, type UserRole } from "../../store/auth";
import {
  useAdminPanelStore,
  type HostApplicationDecision,
  type ListingStatus,
  type ManagedUser,
  type HostApplication,
  type Booking,
  type BookingStatus,
} from "../../store/adminPanel";
import { fetchAdminListings, updateListingStatus as updateListingStatusApi, fetchAdminAnalytics } from "../../lib/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

type AdminAnalytics = {
  totalRoomRevenue: number;
  totalTicketRevenue: number;
  totalRoomOrders: number;
  totalTicketOrders: number;
  totalRevenue: number;
};

type RevenueSeriesPoint = {
  label: string;
  bookings: number;
  tickets: number;
  total: number;
  roomOrders: number;
  ticketOrders: number;
};

type RevenueHistoryPoint = {
  date: Date;
  bookings: number;
  tickets: number;
  total: number;
  roomOrders: number;
  ticketOrders: number;
};

type AdminListing = {
  id: number;
  title: string;
  city: string;
  hostId: string;
  hostName?: string;
  status: ListingStatus;
  nightly_rate: number;
  occupancy: number;
  bookingsCount?: number;
  monthlyRevenue?: number;
  created_at: string;
  images: string[];
  user?: { name: string; email: string };
};

type RevenueRange = "monthly" | "quarterly" | "yearly";

const AdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const {
    managedUsers,
    propertyListings,
    hostApplications,
    activityLog,
    assignUserRole,
    updateHostApplication,
    loadHostApplications,
    loadActivityLogs,
    loadAdminBookings,
    updateBookingStatus,
    adminBookings,
  } = useAdminPanelStore();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<HostApplicationDecision | "all">("pending");
  const [listingStatusFilter, setListingStatusFilter] = useState<ListingStatus | "all">("pending_review");
  const [previewListing, setPreviewListing] = useState<AdminListing | null>(null);
  const [listingSnapshot, setListingSnapshot] = useState<AdminListing[]>([]);
  const [revenueRange, setRevenueRange] = useState<RevenueRange>("monthly");
  const [chartView, setChartView] = useState<RevenueRange | null>(null);
  const [updatingListingId, setUpdatingListingId] = useState<number | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);
  const [previewBooking, setPreviewBooking] = useState<Booking | null>(null);

  const rangeLabelMap: Record<RevenueRange, string> = {
    monthly: "Tháng",
    quarterly: "Quý",
    yearly: "Năm",
  };
  const revenueRanges: RevenueRange[] = ["monthly", "quarterly", "yearly"];

  const statusStyles: Record<ListingStatus, string> = {
    pending_review: "bg-amber-50 text-amber-700",
    published: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  const loadAdminListings = useCallback(async () => {
    try {
      const { data } = await fetchAdminListings({ status: "all" });
      setListingSnapshot(data?.data ?? data ?? []);
    } catch (error) {
      console.error("Failed to load admin listings", error);
    }
  }, []);

  useEffect(() => {
    loadAdminListings();
    fetchAdminAnalytics()
      .then((res) => {
        setAnalytics({
          ...res.data,
          totalRoomRevenue: parseFloat(res.data.totalRoomRevenue),
          totalTicketRevenue: parseFloat(res.data.totalTicketRevenue),
        });
      })
      .catch((err) => console.error("Failed to load analytics", err));

    loadHostApplications?.();
    loadActivityLogs?.();
    loadAdminBookings?.();
  }, [loadActivityLogs, loadHostApplications, loadAdminListings]);

  const analyticsSnapshot = useMemo(() => {
    const currentAnalytics = analytics ?? { totalRoomRevenue: 0, totalTicketRevenue: 0, totalRoomOrders: 0, totalTicketOrders: 0, totalRevenue: 0 };

    const publishedListings = propertyListings.filter((listing) => listing.status === "published");

    const assumedStayLength = 2.4; // trung bình 2.4 đêm/đơn dùng để quy đổi doanh thu

    const avgGroupSize =
      publishedListings.length === 0
        ? 0
        : Math.round(
            publishedListings.reduce((acc, listing) => acc + (listing.occupancy ?? 0), 0) / publishedListings.length
          );

    const cityDemand = publishedListings.reduce<Record<string, number>>((acc, listing) => {
      const key = listing.city ?? "Chưa rõ";
      acc[key] = (acc[key] ?? 0) + (listing.bookingsCount ?? 0);
      return acc;
    }, {});

    const topLocations = Object.entries(cityDemand)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([city, orders]) => ({ city, orders }));

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const msPerDay = 86_400_000;
    const daysToPayout = Math.max(0, Math.ceil((endOfMonth.getTime() - now.getTime()) / msPerDay));
    const payoutProgress = Math.min(100, Math.round((now.getDate() / endOfMonth.getDate()) * 100));

    const totalMonthsHistory = 1; // Chỉ tạo dữ liệu cho tháng hiện tại
    const monthHistory: RevenueHistoryPoint[] = Array.from({ length: totalMonthsHistory }, (_, index) => {
      const monthsAgo = totalMonthsHistory - index - 1; // monthsAgo sẽ là 0 cho tháng hiện tại
      const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);

      const bookings = currentAnalytics.totalRoomRevenue;
      const tickets = currentAnalytics.totalTicketRevenue;
      const roomOrders = currentAnalytics.totalRoomOrders;
      const ticketOrders = currentAnalytics.totalTicketOrders;
      
      return {
        date,
        bookings,
        tickets,
        total: bookings + tickets,
        roomOrders,
        ticketOrders,
      };
    });

    const formatMonthLabel = (date: Date) => `Tháng ${date.getMonth() + 1}`;
    const formatQuarterLabel = (date: Date) => {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter}/${date.getFullYear().toString().slice(-2)}`;
    };
    const formatYearLabel = (date: Date) => `${date.getFullYear()}`;

    const chunkSeries = (
      source: RevenueHistoryPoint[],
      labelFormatter: (start: Date, end: Date) => string
    ): RevenueSeriesPoint[] => {
      const chunks: RevenueSeriesPoint[] = [];

      if (source.length === 0) return [];

      const lastEntry = source[source.length - 1];

      const bookings = lastEntry.bookings;
      const tickets = lastEntry.tickets;
      const roomOrders = lastEntry.roomOrders;
      const ticketOrders = lastEntry.ticketOrders;

      const startDate = lastEntry.date;
      const endDate = lastEntry.date;

      chunks.push({
        label: labelFormatter(startDate, endDate),
        bookings,
        tickets,
        total: bookings + tickets,
        roomOrders,
        ticketOrders,
      });
      return chunks;
    };

    const monthlySeries: RevenueSeriesPoint[] = monthHistory.map((entry) => ({
      label: formatMonthLabel(entry.date),
      bookings: entry.bookings,
      tickets: entry.tickets,
      total: entry.total,
      roomOrders: entry.roomOrders,
      ticketOrders: entry.ticketOrders,
    }));

    const quarterlySeries: RevenueSeriesPoint[] = monthHistory.length > 0 ? chunkSeries(monthHistory, (_start, end) => formatQuarterLabel(end)) : [];

    const yearlySeries: RevenueSeriesPoint[] = monthHistory.length > 0 ? chunkSeries(monthHistory, (_start, end) => formatYearLabel(end)) : [];

    return {
      webTraffic: {
        visits: 182000,
        returningRate: 0.62,
        trend: 9.4,
      },
      customerBehavior: {
        topLocations: topLocations.length > 0 ? topLocations : [{ city: "Chưa có dữ liệu", orders: 0 }],
        avgGroupSize,
      },
      bookingRevenue: {
        totalOrders: currentAnalytics.totalRoomOrders,
        revenue: currentAnalytics.totalRoomRevenue,
        assumedStayLength,
      },
      ticketRevenue: {
        totalTickets: currentAnalytics.totalTicketOrders,
        revenue: currentAnalytics.totalTicketRevenue,
      },
      deposit: {
        amount: 0, // Không có dữ liệu tiền cọc thực tế từ API
        daysToPayout,
        dueDate: endOfMonth.toISOString(),
        progress: payoutProgress,
        monthlyBookings: currentAnalytics.totalRoomOrders, // Sử dụng tổng số đơn đặt phòng thực tế
        hostBreakdown: [], // Không có dữ liệu host breakdown thực tế từ API
      },
      revenueSeries: {
        monthly: monthlySeries,
        quarterly: quarterlySeries,
        yearly: yearlySeries,
      },
      revenueTotals: {
        bookings: currentAnalytics.totalRoomRevenue,
        tickets: currentAnalytics.totalTicketRevenue,
        total: currentAnalytics.totalRevenue,
      },
      chartMax: Math.max(...monthlySeries.map((item) => item.total), 1), // Using monthlySeries as a base for chartMax
      detailSeries: chartView ? monthlySeries : [], // Simplified for now, will use actual revenueSeries[chartView] once available
      detailChartMax: 1, // Will be calculated dynamically based on detailSeries if chartView is active
    };
  }, [propertyListings, analytics, chartView]);

  const topHosts = useMemo(() => {
    return managedUsers
      .filter((user) => user.roles.includes("host"))
      .sort((a, b) => (b.totalListings ?? 0) - (a.totalListings ?? 0))
      .slice(0, 3);
  }, [managedUsers]);

  const recentMembers = useMemo(() => managedUsers.slice(0, 4), [managedUsers]);

  const filteredApplications = useMemo(() => {
    return hostApplications
      .filter((app) => (applicationStatusFilter === "all" ? true : app.status === applicationStatusFilter))
      .slice(0, 4);
  }, [hostApplications, applicationStatusFilter]);

  const filteredListings = useMemo(() => {
    const base =
      listingStatusFilter === "all"
        ? listingSnapshot
        : listingSnapshot.filter((listing) => listing.status === listingStatusFilter);
    return base.slice(0, 4);
  }, [listingSnapshot, listingStatusFilter]);

  const getTooltipStyle = (value: number, max: number) => {
    const percentage = max === 0 ? 0 : (value / max) * 100;
    const clamped = Math.max(0, Math.min(percentage, 100));
    return { left: `calc(${clamped}% - 40px)` };
  };

  const handleRoleChange = async (managedUser: ManagedUser, nextRole: UserRole) => {
    if (nextRole === managedUser.role) return;
    setPanelError(null);
    setRoleUpdatingId(String(managedUser.id));
    try {
      await assignUserRole(
        managedUser.id,
        nextRole,
        nextRole === "host" ? { hostStatus: "pending" } : undefined
      );
    } catch (error) {
      console.error(error);
      setPanelError("Unable to update this member's role. Please try again.");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleApplicationAction = async (
    application: HostApplication,
    decision: HostApplicationDecision
  ) => {
    if (decision === "pending") return;
    if (application.status !== "pending") return;
    setPanelError(null);
    setProcessingApplicationId(application.id);
    try {
      await updateHostApplication(application.id, decision);
    } catch (error) {
      console.error(error);
      setPanelError("Unable to update the application right now. Please retry.");
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleListingAction = async (listing: AdminListing, status: ListingStatus) => {
    if (listing.status === status || updatingListingId === listing.id) return;
    setPanelError(null);
    setUpdatingListingId(listing.id);
    try {
      await updateListingStatusApi(listing.id, { status });
      setListingSnapshot((prev) => prev.map((item) => (item.id === listing.id ? { ...item, status } : item)));
      await loadAdminListings();
    } catch (error) {
      console.error(error);
      setPanelError("Unable to update listing status. Please try again.");
    } finally {
      setUpdatingListingId(null);
    }
  };

  const handleToggleAutoPayout = () => {
    setAutoPayoutEnabled((prev) => !prev);
  };

  const handleBookingAction = async (booking: Booking, status: BookingStatus) => {
    if (booking.status === status) return;
    setPanelError(null);
    // Assuming you have an updatingBookingId state similar to updatingListingId if you want to show loading states
    // setUpdatingBookingId(booking.id);
    try {
      await updateBookingStatus(booking.id, status);
    } catch (error) {
      console.error(error);
      setPanelError("Unable to update booking status. Please try again.");
    } finally {
      // setUpdatingBookingId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            Control Center
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name ?? "Admin"}
              </h1>
              <p className="text-slate-600">
                Manage users, host requests, and rental listings from a single, unified dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
                {user?.email}
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <Shield className="h-4 w-4" />
                Admin mode
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Lượt truy cập web</div>
              <Globe className="h-10 w-10 rounded-xl bg-sky-50 p-2 text-sky-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {analyticsSnapshot.webTraffic.visits.toLocaleString("vi-VN")}
            </p>
            <p className="text-xs text-slate-500">Phiên/tuần</p>
            <div className="mt-4 flex flex-col gap-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">
                +{analyticsSnapshot.webTraffic.trend}% so với tuần trước
              </span>
              <span>Khách quay lại: {(analyticsSnapshot.webTraffic.returningRate * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Thống kê</div>
              <MapPin className="h-10 w-10 rounded-xl bg-indigo-50 p-2 text-indigo-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {analyticsSnapshot.customerBehavior.topLocations[0]?.city ?? "Đang cập nhật"}
            </p>
            <p className="text-xs text-slate-500">Điểm đến đặt nhiều nhất tuần này</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              {analyticsSnapshot.customerBehavior.topLocations.map((location) => (
                <span
                  key={location.city}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 font-medium"
                >
                  {location.city}
                  {location.orders > 0 && <span className="text-slate-400">({location.orders} đơn)</span>}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Quy mô nhóm TB:{" "}
              {analyticsSnapshot.customerBehavior.avgGroupSize
                ? `${analyticsSnapshot.customerBehavior.avgGroupSize} khách`
                : "Chưa có dữ liệu"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Doanh thu đặt phòng</div>
              <TrendingUp className="h-10 w-10 rounded-xl bg-emerald-50 p-2 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {formatCurrency(analyticsSnapshot.bookingRevenue.revenue)}
            </p>
            <p className="text-xs text-slate-500">
              {analyticsSnapshot.bookingRevenue.totalOrders.toLocaleString("vi-VN")} đơn · giả định{" "}
              {analyticsSnapshot.bookingRevenue.assumedStayLength.toFixed(1)} đêm/đơn
            </p>
            <p className="mt-3 text-xs text-slate-500">Không hiển thị payout từ người đăng tin</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Doanh thu đặt vé</div>
              <Plane className="h-10 w-10 rounded-xl bg-slate-100 p-2 text-slate-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {formatCurrency(analyticsSnapshot.ticketRevenue.revenue)}
            </p>
            <p className="text-xs text-slate-500">
              {analyticsSnapshot.ticketRevenue.totalTickets.toLocaleString("vi-VN")} vé đã phát hành
            </p>
            <p className="mt-3 text-xs text-slate-500">Bao gồm phí dịch vụ & thuế hàng không</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Kết toán cuối tháng
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Tiền cọc</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {analyticsSnapshot.deposit.progress}% chu kỳ
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {formatCurrency(analyticsSnapshot.deposit.amount)}
            </p>
            <p className="text-sm text-slate-500">
              Thanh toán vào {new Date(analyticsSnapshot.deposit.dueDate).toLocaleDateString("vi-VN")} (
              {analyticsSnapshot.deposit.daysToPayout} ngày nữa)
            </p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tổng đặt phòng tháng này</span>
                <span>{formatCurrency(analyticsSnapshot.deposit.monthlyBookings)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${analyticsSnapshot.deposit.progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Tiền cọc được giữ để đảm bảo thanh toán cho host khi kỳ kết toán kết thúc.
              </p>
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  {analyticsSnapshot.deposit.hostBreakdown.length} host cần đối soát.{" "}
                  {autoPayoutEnabled
                    ? "Đang bật tự động chi trả khi không phát sinh tranh chấp."
                    : "Bạn hiện đang chi trả thủ công cho từng host."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Xem chi tiết kết toán
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleAutoPayout}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                      autoPayoutEnabled
                        ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                        : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {autoPayoutEnabled ? "Tắt tự động thanh toán" : "Bật tự động thanh toán"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Tổng doanh số
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Doanh thu đặt phòng & vé theo {rangeLabelMap[revenueRange]}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {revenueRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setRevenueRange(range)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                      revenueRange === range
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {range === "monthly" ? "Tháng" : range === "quarterly" ? "Quý" : "Năm"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Đặt phòng</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {formatCurrency(analyticsSnapshot.revenueTotals.bookings)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Đặt vé</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {formatCurrency(analyticsSnapshot.revenueTotals.tickets)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Tổng cộng</p>
                <p className="text-2xl font-semibold text-emerald-600">
                  {formatCurrency(analyticsSnapshot.revenueTotals.total)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {analyticsSnapshot.revenueSeries[revenueRange].map((entry) => (
                <div key={`${entry.label}-${revenueRange}`}>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{entry.label}</span>
                    <span>{formatCurrency(entry.total)}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="group relative h-2 rounded-full bg-emerald-100">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${(entry.bookings / analyticsSnapshot.chartMax) * 100}%` }}
                      />
                      <span
                        className="pointer-events-none absolute -top-7 inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
                        style={getTooltipStyle(entry.bookings, analyticsSnapshot.chartMax)}
                      >
                        {formatCurrency(entry.bookings)}
                      </span>
                    </div>
                    <div className="group relative h-2 rounded-full bg-sky-100">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: `${(entry.tickets / analyticsSnapshot.chartMax) * 100}%` }}
                      />
                      <span
                        className="pointer-events-none absolute -top-7 inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
                        style={getTooltipStyle(entry.tickets, analyticsSnapshot.chartMax)}
                      >
                        {formatCurrency(entry.tickets)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Doanh thu đặt phòng
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                Doanh thu vé máy bay
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Số liệu dựa trên đơn đã xác nhận, không bao gồm payout trực tiếp từ host.
              </p>
              <button
                type="button"
                onClick={() => setChartView(revenueRange)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Xem biểu đồ chi tiết
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Bookings
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Đặt phòng gần đây</h2>
              </div>
              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Quản lý <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            {adminBookings.length === 0 && (
              <p className="text-sm text-slate-500">Không có đặt phòng nào.</p>
            )}
            <div className="space-y-4">
              {adminBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {booking.type === "hotel" ? booking.hotel?.title : booking.flight?.flight_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.user?.name ?? "Unknown User"} · {new Date(booking.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : booking.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}>
                      {booking.status === "pending"
                        ? "Chờ xác nhận"
                        : booking.status === "confirmed"
                          ? "Đã xác nhận"
                          : "Đã hủy"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <span>Tổng tiền: {formatCurrency(booking.total_price)}</span>
                    {booking.type === "hotel" && (
                      <>
                        <span>Nhận phòng: {new Date(booking.check_in!).toLocaleDateString("vi-VN")}</span>
                        <span>Trả phòng: {new Date(booking.check_out!).toLocaleDateString("vi-VN")}</span>
                      </>
                    )}
                    {booking.type === "flight" && booking.flight && (
                      <>
                        <span>Khởi hành: {new Date(booking.flight.departure_time).toLocaleString("vi-VN")}</span>
                        <span>Đến: {new Date(booking.flight.arrival_time).toLocaleString("vi-VN")}</span>
                      </>
                    )}
                    <span>Khách: {booking.guests}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBooking(booking)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Xem chi tiết
                    </button>
                    {booking.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleBookingAction(booking, "confirmed")}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Xác nhận
                      </button>
                    )}
                    {booking.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleBookingAction(booking, "cancelled")}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Top hosts
                </p>
                <h2 className="text-lg font-semibold text-slate-900">Hiệu suất nổi bật</h2>
              </div>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Xem tất cả <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {topHosts.length === 0 && <p className="text-sm text-slate-500">Chưa có host nào.</p>}
              {topHosts.map((host) => (
                <div key={host.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{host.name}</p>
                      <p className="text-xs text-slate-500">{host.email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {host.totalListings} listings
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span>Pending payout: {host.pendingPayout ? formatCurrency(host.pendingPayout) : "—"}</span>
                    <span>Host status: {host.hostStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Recent members
                </p>
                <h2 className="text-lg font-semibold text-slate-900">Thành viên mới</h2>
              </div>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Xem tất cả <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div key={member.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <select
                      value={member.role}
                      onChange={(event) => handleRoleChange(member, event.target.value as UserRole)}
                      disabled={roleUpdatingId === String(member.id)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:opacity-60"
                    >
                      <option key="admin" value="admin">Admin</option>
                      <option key="host" value="host">Host</option>
                      <option key="member" value="member">Member</option>
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Host status: {member.hostStatus}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Thông báo
                </p>
                <h2 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h2>
              </div>
            </div>
            {filteredApplications.length === 0 && (
              <p className="text-sm text-slate-500">Không có đơn nào trong bộ lọc hiện tại.</p>
            )}
            <div className="space-y-4">
              {activityLog.slice(0, 5).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{entry.title}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{entry.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-600">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {entry.actor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Host onboarding
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Đơn đăng ký</h2>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={applicationStatusFilter}
                  onChange={(e) => setApplicationStatusFilter(e.target.value as HostApplicationDecision | "all")}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
                <Link
                  to="/admin/listings"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Xem tất cả <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            {filteredApplications.map((application) => (
              <div key={application.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{application.userName}</p>
                    <p className="text-xs text-slate-500">{application.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      application.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : application.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {application.status === "pending"
                      ? "Đang chờ"
                      : application.status === "approved"
                        ? "Đã duyệt"
                        : "Đã từ chối"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{application.message}</p>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <span>SĐT: {application.phone ?? "Chưa cung cấp"}</span>
                  <span>Kinh nghiệm: {application.experience}</span>
                  <span className="sm:col-span-2">
                    Số lượng phòng/căn hộ: {application.inventory ?? "Chưa rõ"}
                  </span>
                </div>
                {application.status === "pending" && (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleApplicationAction(application, "approved")}
                      disabled={processingApplicationId === application.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Duyệt host
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplicationAction(application, "rejected")}
                      disabled={processingApplicationId === application.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
            {hostApplications.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có đơn đăng ký nào.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Listings
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Tin đăng</h2>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value as ListingStatus | "all")}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600"
                >
                  <option value="pending_review">Chờ duyệt</option>
                  <option value="published">Đang hiển thị</option>
                  <option value="rejected">Từ chối</option>
                  <option value="all">Tất cả</option>
                </select>
                <Link
                  to="/admin/listings"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Quản lý <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            {filteredListings.length === 0 && (
              <p className="text-sm text-slate-500">Không có tin phù hợp bộ lọc.</p>
            )}
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{listing.title}</p>
                      <p className="text-xs text-slate-500">
                        {listing.city} · {listing.user?.name ?? "Unknown host"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[listing.status]}`}>
                      {listing.status === "pending_review"
                        ? "Chờ duyệt"
                        : listing.status === "published"
                          ? "Đang hiển thị"
                          : "Bị từ chối"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <span>Giá/đêm: {formatCurrency(listing.nightly_rate)}</span>
                    <span>Sức chứa: {listing.occupancy} khách</span>
                    <span>Cập nhật: {new Date(listing.created_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleListingAction(listing, "published")}
                      disabled={updatingListingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleListingAction(listing, "pending_review")}
                      disabled={updatingListingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Inbox className="h-4 w-4" />
                      Đợi thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleListingAction(listing, "rejected")}
                      disabled={updatingListingId === listing.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewListing(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Kết toán cuối tháng
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-900">Chi tiết tiền cọc & thanh toán host</h3>
                  <p className="text-sm text-slate-600">
                    Duyệt từng khoản cọc hoặc bật tự động thanh toán nếu kỳ này không có tranh chấp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:mt-0"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <span>
                  Tổng giữ hộ: {formatCurrency(analyticsSnapshot.deposit.amount)} · Thanh toán vào{" "}
                  {new Date(analyticsSnapshot.deposit.dueDate).toLocaleDateString("vi-VN")}
                </span>
                <button
                  type="button"
                  onClick={handleToggleAutoPayout}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition ${
                    autoPayoutEnabled
                      ? "border-emerald-600 bg-emerald-600/10 text-emerald-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {autoPayoutEnabled ? "Tự động thanh toán đang bật" : "Bật tự động thanh toán"}
                </button>
              </div>

              <div className="mt-6 max-h-[500px] space-y-4 overflow-y-auto pr-2">
                {analyticsSnapshot.deposit.hostBreakdown.length === 0 && (
                  <p className="text-sm text-slate-500">Chưa có host nào cần đối soát.</p>
                )}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Ghi chú: Khi bật tự động thanh toán, hệ thống sẽ giải ngân toàn bộ khoản cọc còn lại vào ngày kết toán nếu không có tranh chấp.
              </p>
            </div>
          </div>
        )}

        {chartView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Biểu đồ trực quan
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Doanh thu theo {rangeLabelMap[chartView]}
                  </h3>
                  <p className="text-sm text-slate-600">
                    So sánh doanh số đặt phòng và đặt vé cho từng giai đoạn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChartView(null)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:mt-0"
                >
                  Đóng
                </button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                {analyticsSnapshot.detailSeries.map((entry) => (
                  <div key={`${chartView}-${entry.label}`} className="flex flex-col items-center gap-3">
                    <div className="flex h-48 w-full items-end justify-center gap-2">
                      <div className="group relative flex items-end">
                        <div
                          className="w-6 rounded-full bg-emerald-400"
                          style={{ height: `${(entry.bookings / analyticsSnapshot.detailChartMax) * 100}%` }}
                        />
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                          {formatCurrency(entry.bookings)}
                        </span>
                      </div>
                      <div className="group relative flex items-end">
                        <div
                          className="w-6 rounded-full bg-sky-400"
                          style={{ height: `${(entry.tickets / analyticsSnapshot.detailChartMax) * 100}%` }}
                        />
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                          {formatCurrency(entry.tickets)}
                        </span>
                      </div>
                    </div>
                    <div className="text-center text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">{entry.label}</p>
                      <p>{formatCurrency(entry.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Doanh thu đặt phòng
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                  Doanh thu vé máy bay
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Hiển thị doanh thu đã xác nhận. Sau khi kết toán, hệ thống mới chuyển khoản cho người đăng phòng.
              </p>
            </div>
          </div>
        )}

        {previewListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Preview
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">{previewListing.title}</h3>
                  <p className="text-sm text-slate-500">{previewListing.city}</p>
                </div>
                <button
                  onClick={() => setPreviewListing(null)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
              {previewListing.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {previewListing.images.map((img) => (
                    <img key={img} src={img} alt={previewListing.title} className="h-32 w-full rounded-xl object-cover" />
                  ))}
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                <span>Nightly rate: {formatCurrency(previewListing.nightly_rate)}</span>
                <span>Capacity: {previewListing.occupancy} guests</span>
                <span>Status: {previewListing.status}</span>
                <span>Host: {previewListing.user?.name ?? "Unknown"}</span>
              </div>
            </div>
          </div>
        )}

        {previewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Chi tiết đặt phòng
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {previewBooking.type === "hotel" ? previewBooking.hotel?.title : previewBooking.flight?.flight_number}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {previewBooking.user?.name ?? "Unknown User"} · {new Date(previewBooking.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewBooking(null)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-slate-600">
                <span>Loại: {previewBooking.type === "hotel" ? "Khách sạn" : "Chuyến bay"}</span>
                <span>Tổng tiền: {formatCurrency(previewBooking.total_price)}</span>
                <span>Trạng thái thanh toán: {previewBooking.payment_status}</span>
                <span>Số lượng khách: {previewBooking.guests}</span>
                {previewBooking.type === "hotel" && (
                  <>
                    <span>Khách sạn: {previewBooking.hotel?.title}</span>
                    <span>Phòng: {previewBooking.room?.name}</span>
                    <span>Nhận phòng: {new Date(previewBooking.check_in!).toLocaleDateString("vi-VN")}</span>
                    <span>Trả phòng: {new Date(previewBooking.check_out!).toLocaleDateString("vi-VN")}</span>
                  </>
                )}
                {previewBooking.type === "flight" && previewBooking.flight && (
                  <>
                    <span>Thời gian khởi hành: {new Date(previewBooking.flight.departure_time).toLocaleString("vi-VN")}</span>
                    <span>Thời gian đến: {new Date(previewBooking.flight.arrival_time).toLocaleString("vi-VN")}</span>
                  </>
                )}
                <span>Người đặt: {previewBooking.user?.name} ({previewBooking.user?.email})</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewBooking.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleBookingAction(previewBooking, "confirmed")}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Xác nhận
                  </button>
                )}
                {previewBooking.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleBookingAction(previewBooking, "cancelled")}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {panelError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
            {panelError}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;