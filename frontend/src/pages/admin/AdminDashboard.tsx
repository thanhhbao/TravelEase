import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  ClipboardList,
  Inbox,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import { useAuthStore, type UserRole } from "../../store/auth";
import {
  useAdminPanelStore,
  type HostApplicationDecision,
  type ListingStatus,
  type ManagedUser,
  type PropertyListing,
  type HostApplication,
} from "../../store/adminPanel";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "host", label: "Người đăng tin" },
  { value: "traveler", label: "Người dùng" },
];

const statusStyles: Record<ListingStatus, string> = {
  pending_review: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const hostApplicationStyles: Record<HostApplicationDecision, string> = {
  pending: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const {
    managedUsers,
    propertyListings,
    hostApplications,
    activityLog,
    assignUserRole,
    updateHostApplication,
    updateListingStatus,
  } = useAdminPanelStore();
  const [roleUpdatingId, setRoleUpdatingId] = useState<number | null>(null);
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<HostApplicationDecision | "all">("pending");
  const [listingStatusFilter, setListingStatusFilter] = useState<ListingStatus | "all">("pending_review");
  const [previewListing, setPreviewListing] = useState<PropertyListing | null>(null);

  const dashboardStats = useMemo(() => {
    const hostCount = managedUsers.filter((u) => u.roles.includes("host")).length;
    const pendingListings = propertyListings.filter((l) => l.status === "pending_review").length;
    const pendingHostRequests = hostApplications.filter((app) => app.status === "pending").length;
    const revenue = propertyListings
      .filter((listing) => listing.status === "published")
      .reduce((acc, listing) => acc + listing.nightlyRate * listing.occupancy, 0);
    return {
      hostCount,
      pendingListings,
      pendingHostRequests,
      revenue,
    };
  }, [managedUsers, propertyListings, hostApplications]);

  const topHosts = useMemo(() => {
    return managedUsers
      .filter((user) => user.roles.includes("host"))
      .sort((a, b) => (b.totalListings ?? 0) - (a.totalListings ?? 0))
      .slice(0, 3);
  }, [managedUsers]);

  const recentMembers = useMemo(() => managedUsers.slice(0, 4), [managedUsers]);

  const pendingReviewListings = useMemo(
    () => propertyListings.filter((listing) => listing.status === "pending_review").slice(0, 3),
    [propertyListings]
  );

  const filteredApplications = useMemo(() => {
    return hostApplications
      .filter((app) => (applicationStatusFilter === "all" ? true : app.status === applicationStatusFilter))
      .slice(0, 4);
  }, [hostApplications, applicationStatusFilter]);

  const filteredListings = useMemo(() => {
    const base =
      listingStatusFilter === "all"
        ? propertyListings
        : propertyListings.filter((listing) => listing.status === listingStatusFilter);
    return base.slice(0, 4);
  }, [propertyListings, listingStatusFilter]);

  const handleRoleChange = async (managedUser: ManagedUser, nextRole: UserRole) => {
    if (nextRole === managedUser.role) return;
    setPanelError(null);
    setRoleUpdatingId(managedUser.id);
    try {
      await assignUserRole(managedUser.id, nextRole);
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

  const handleListingAction = (listing: PropertyListing, status: ListingStatus) => {
    if (listing.status === status) return;
    updateListingStatus(listing.id, status);
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
                Xin chào, {user?.name ?? "Admin"}
              </h1>
              <p className="text-slate-600">
                Quản lý người dùng, đơn đăng ký host và tin đăng trong một bảng điều khiển thống nhất.
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
              <div className="text-slate-500 text-sm">Người đăng tin</div>
              <Users className="h-10 w-10 rounded-xl bg-sky-50 p-2 text-sky-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{dashboardStats.hostCount}</p>
            <p className="text-xs text-slate-500">Đang hoạt động</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Tin đang chờ duyệt</div>
              <ClipboardList className="h-10 w-10 rounded-xl bg-amber-50 p-2 text-amber-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{dashboardStats.pendingListings}</p>
            <p className="text-xs text-slate-500">Cần phản hồi sớm</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Đơn đăng ký host</div>
              <Inbox className="h-10 w-10 rounded-xl bg-blue-50 p-2 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{dashboardStats.pendingHostRequests}</p>
            <p className="text-xs text-slate-500">Đang chờ xử lý</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-slate-500 text-sm">Doanh thu dự kiến</div>
              <TrendingUp className="h-10 w-10 rounded-xl bg-emerald-50 p-2 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{formatCurrency(dashboardStats.revenue)}</p>
            <p className="text-xs text-slate-500">Từ các tin đã duyệt</p>
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
                      disabled={roleUpdatingId === member.id}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 disabled:opacity-60"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{application.userName}</p>
                      <p className="text-xs text-slate-500">{application.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${hostApplicationStyles[application.status]}`}
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
                        {listing.city} · {listing.hostName}
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
                    <span>Giá/đêm: {formatCurrency(listing.nightlyRate)}</span>
                    <span>Sức chứa: {listing.occupancy} khách</span>
                    <span>Lượt xem: {listing.views}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleListingAction(listing, "published")}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleListingAction(listing, "pending_review")}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50"
                    >
                      <Inbox className="h-4 w-4" />
                      Đợi thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleListingAction(listing, "rejected")}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-50"
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
                  Đóng
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
                <span>Giá/đêm: {formatCurrency(previewListing.nightlyRate)}</span>
                <span>Sức chứa: {previewListing.occupancy} khách</span>
                <span>Trạng thái: {previewListing.status}</span>
                <span>Lượt hỏi: {previewListing.inquiries}</span>
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
