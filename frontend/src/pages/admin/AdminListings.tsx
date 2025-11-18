import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Filter,
  Search,
} from "lucide-react";
import { useAdminPanelStore, type ListingStatus } from "../../store/adminPanel";
import { type HostApplicationDecision } from "../../store/adminPanel";

const listingStatusOptions: { value: ListingStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending_review", label: "Chờ duyệt" },
  { value: "published", label: "Đang hiển thị" },
  { value: "rejected", label: "Từ chối" },
];

const applicationFilters: { value: HostApplicationDecision | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminListings() {
  const { propertyListings, hostApplications, updateListingStatus, updateHostApplication } = useAdminPanelStore();
  const [tab, setTab] = useState<"listings" | "applications">("listings");
  const [listingStatusFilter, setListingStatusFilter] = useState<ListingStatus | "all">("pending_review");
  const [applicationFilter, setApplicationFilter] = useState<HostApplicationDecision | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    return propertyListings.filter((listing) => {
      const matchStatus = listingStatusFilter === "all" ? true : listing.status === listingStatusFilter;
      const matchSearch =
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [propertyListings, listingStatusFilter, searchTerm]);

  const filteredApplications = useMemo(() => {
    return hostApplications.filter((application) => {
      const matchStatus = applicationFilter === "all" ? true : application.status === applicationFilter;
      const matchSearch =
        application.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [hostApplications, applicationFilter, searchTerm]);

  const handleUpdateListing = async (listingId: string, status: ListingStatus) => {
    setProcessingId(listingId);
    try {
      updateListingStatus(listingId, status);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApplicationDecision = async (applicationId: string, decision: HostApplicationDecision) => {
    setProcessingId(applicationId);
    try {
      await updateHostApplication(applicationId, decision);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Operations</p>
            <h1 className="text-3xl font-bold text-slate-900">Listings & Host onboarding</h1>
            <p className="text-slate-600">
              Duyệt tin nhanh chóng và nắm bắt mọi yêu cầu trở thành host từ cộng đồng.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, city, host name..."
                  className="w-full border-none bg-transparent py-2 text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                {tab === "listings" ? "Filter by status" : "Filter by decision"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTab("listings")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === "listings" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              Tin đăng ({filteredListings.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("applications")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === "applications" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              Đơn đăng ký ({filteredApplications.length})
            </button>
          </div>
        </header>

        {tab === "listings" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {listingStatusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setListingStatusFilter(option.value)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    listingStatusFilter === option.value
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {filteredListings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                Không có tin đăng nào trong bộ lọc hiện tại.
              </div>
            )}
            {filteredListings.map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{listing.title}</p>
                    <p className="text-sm text-slate-500">
                      {listing.city} • {listing.hostName}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {listing.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-4">
                  <span>Giá/đêm: {formatCurrency(listing.nightlyRate)}</span>
                  <span>Sức chứa: {listing.occupancy}</span>
                  <span>Lượt hỏi: {listing.inquiries}</span>
                  <span>Cập nhật: {new Date(listing.lastUpdated).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateListing(listing.id, "published")}
                    disabled={processingId === listing.id}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Duyệt tin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateListing(listing.id, "pending_review")}
                    disabled={processingId === listing.id}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                  >
                    <Inbox className="h-4 w-4" />
                    Đợi thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateListing(listing.id, "rejected")}
                    disabled={processingId === listing.id}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === "applications" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {applicationFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setApplicationFilter(option.value)}
                  className={`rounded-full px-4 py-1.5 text-sm ${
                    applicationFilter === option.value
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {filteredApplications.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                Không có đơn phù hợp bộ lọc.
              </div>
            )}
            {filteredApplications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{application.userName}</p>
                    <p className="text-sm text-slate-500">{application.email}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {application.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <span>SĐT: {application.phone ?? "—"}</span>
                  <span>Thành phố: {application.city ?? "—"}</span>
                  <span>Kinh nghiệm: {application.experience}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{application.message}</p>
                {application.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplicationDecision(application.id, "approved")}
                      disabled={processingId === application.id}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Duyệt host
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplicationDecision(application.id, "rejected")}
                      disabled={processingId === application.id}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
