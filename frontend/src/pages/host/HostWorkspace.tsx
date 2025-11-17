import { useMemo } from "react";
import {
  Building2,
  PlusCircle,
  AlertTriangle,
  Clock4,
  Coins,
  CalendarDays,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useAdminPanelStore, type ListingStatus } from "../../store/adminPanel";

type Reservation = {
  id: string;
  guest: string;
  listingTitle: string;
  checkIn: string;
  nights: number;
  payout: number;
  status: "confirmed" | "pending" | "cancelled";
};

const statusBadge: Record<ListingStatus, string> = {
  published: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-blue-50 text-blue-600",
  rejected: "bg-rose-100 text-rose-700",
};

const reservationBadge: Record<Reservation["status"], string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCash = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function HostWorkspace() {
  const { user } = useAuthStore();
  const { propertyListings, hostApplications } = useAdminPanelStore();

  const myListings = useMemo(
    () => propertyListings.filter((listing) => listing.hostId === user?.id),
    [propertyListings, user?.id]
  );

  const hostMetrics = useMemo(() => {
    const published = myListings.filter((listing) => listing.status === "published").length;
    const pending = myListings.filter((listing) => listing.status === "pending_review").length;
    const rejected = myListings.filter((listing) => listing.status === "rejected").length;

    const estimatedMonthly = myListings
      .filter((listing) => listing.status === "published")
      .reduce((acc, listing) => acc + listing.nightlyRate * listing.occupancy * 6, 0);

    return {
      total: myListings.length,
      published,
      pending,
      rejected,
      estimatedMonthly,
    };
  }, [myListings]);

  const reservations: Reservation[] = [
    {
      id: "RES-101",
      guest: "Linh Trần",
      listingTitle: "Căn hộ The MarQ quận 1",
      checkIn: "2024-12-20T13:00:00.000Z",
      nights: 3,
      payout: 5400000,
      status: "confirmed",
    },
    {
      id: "RES-102",
      guest: "Yến Nguyễn",
      listingTitle: "Villa sông Hàn Đà Nẵng",
      checkIn: "2024-12-25T14:00:00.000Z",
      nights: 2,
      payout: 6200000,
      status: "pending",
    },
  ];

  const pendingApplication = hostApplications.find(
    (application) => application.userId === user?.id && application.status === "pending"
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-300">
                Host workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                Xin chào, {user?.name ?? "Host"}!
              </h1>
              <p className="mt-2 text-slate-200">
                Theo dõi tin đăng, lịch đặt phòng và tiến độ xét duyệt ngay tại đây.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                <Building2 className="h-4 w-4" />
                {user?.hostStatus === "approved"
                  ? "Đang hoạt động"
                  : user?.hostStatus === "pending"
                    ? "Chờ duyệt"
                    : user?.hostStatus === "rejected"
                      ? "Bị từ chối"
                      : "Chưa đăng ký"}
              </span>
              <a
                href="/my/profile"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30"
              >
                Cập nhật hồ sơ host
              </a>
            </div>
          </div>
        </header>

        {pendingApplication && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
            <div className="flex flex-wrap items-center gap-2">
              <Clock4 className="h-4 w-4" />
              Đơn đăng ký ngày {formatDate(pendingApplication.submittedAt)} đang được đội ngũ admin xử lý.
            </div>
          </div>
        )}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tin đăng</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{hostMetrics.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Đang hiển thị</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">{hostMetrics.published}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Chờ duyệt</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{hostMetrics.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Doanh thu tiềm năng</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatCash(hostMetrics.estimatedMonthly)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Danh sách
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Tin đăng của bạn</h2>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <PlusCircle className="h-4 w-4" />
                Đăng tin mới
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {myListings.length === 0 && (
                <p className="text-sm text-slate-500">
                  Bạn chưa có tin đăng nào. Hãy bắt đầu bằng việc nhấn &quot;Đăng tin mới&quot;.
                </p>
              )}
              {myListings.map((listing) => (
                <div key={listing.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{listing.title}</p>
                      <p className="text-xs text-slate-500">{listing.city}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[listing.status]}`}
                    >
                      {listing.status === "published"
                        ? "Đang hiển thị"
                        : listing.status === "pending_review"
                          ? "Chờ duyệt"
                          : "Bị từ chối"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <span>Giá/đêm: {formatCash(listing.nightlyRate)}</span>
                    <span>Sức chứa: {listing.occupancy} khách</span>
                    <span>Lượt hỏi: {listing.inquiries}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Đặt phòng
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Lịch sắp tới</h2>
              </div>
              <a
                href="/my/bookings"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Xem tất cả
              </a>
            </div>

            <div className="mt-4 space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{reservation.guest}</p>
                      <p className="text-xs text-slate-500">{reservation.listingTitle}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${reservationBadge[reservation.status]}`}
                    >
                      {reservation.status === "confirmed"
                        ? "Đã xác nhận"
                        : reservation.status === "pending"
                          ? "Đang chờ"
                          : "Đã hủy"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(reservation.checkIn)}
                    </span>
                    <span>{reservation.nights} đêm</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <Coins className="h-3.5 w-3.5" />
                      {formatCash(reservation.payout)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {hostMetrics.rejected > 0 && (
          <section className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6 text-sm text-rose-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <div>
                <p className="font-semibold text-rose-900">Tin đăng bị từ chối</p>
                <p className="mt-1">
                  Một vài tin đăng chưa đạt yêu cầu. Vui lòng kiểm tra email để nhận chi tiết góp ý
                  hoặc liên hệ đội ngũ hỗ trợ.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
