import { useMemo, useState, useEffect, useRef, type FormEvent, type KeyboardEvent, type ChangeEvent } from "react";
import { Building2, PlusCircle, AlertTriangle, Clock4, Upload, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { fetchHostListings, createHostListing, updateHostListing, deleteHostListing } from "../../lib/api";

type HostListing = {
  id: number;
  title: string;
  city: string;
  nightly_rate: number;
  occupancy: number;
  status: "pending_review" | "published" | "rejected";
  images: string[];
  description?: string | null;
  inquiries?: number;
  monthlyRevenue?: number;
  activeTenants?: number;
  bookingsCount?: number;
};

const statusBadge: Record<HostListing["status"], string> = {
  published: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-blue-50 text-blue-600",
  rejected: "bg-rose-100 text-rose-700",
};


const formatCash = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function HostWorkspace() {
  const { user } = useAuthStore();
  const [myListings, setMyListings] = useState<HostListing[]>([]);
  const [isListingLoading, setIsListingLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<HostListing | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  const loadListings = async () => {
    try {
      setIsListingLoading(true);
      const { data } = await fetchHostListings();
      setMyListings(data?.data ?? data ?? []);
    } catch (error) {
      console.error("Failed to load host listings", error);
    } finally {
      setIsListingLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const hostMetrics = useMemo(() => {
    const published = myListings.filter((listing) => listing.status === "published").length;
    const pending = myListings.filter((listing) => listing.status === "pending_review").length;
    const rejected = myListings.filter((listing) => listing.status === "rejected").length;

    const estimatedMonthly = myListings
      .filter((listing) => listing.status === "published")
      .reduce((acc, listing) => acc + listing.nightly_rate * listing.occupancy * 6, 0);

    return {
      total: myListings.length,
      published,
      pending,
      rejected,
      estimatedMonthly,
    };
  }, [myListings]);

  const avgNightlyRate = useMemo(() => {
    const published = myListings.filter((listing) => listing.status === "published");
    if (!published.length) return 0;
    return published.reduce((total, listing) => total + listing.nightly_rate, 0) / published.length;
  }, [myListings]);

  const avgCapacity = useMemo(() => {
    const published = myListings.filter((listing) => listing.status === "published");
    if (!published.length) return 0;
    return published.reduce((total, listing) => total + listing.occupancy, 0) / published.length;
  }, [myListings]);

  const revenueInsights = useMemo(() => {
    const published = myListings.filter((listing) => listing.status === "published");
    const pending = myListings.filter((listing) => listing.status === "pending_review");

    const computeRevenue = (listing: HostListing) =>
      listing.monthlyRevenue ?? Math.round(listing.nightly_rate * Math.max(listing.occupancy, 1) * 6);

    const realizedRevenue = published.reduce((acc, listing) => acc + computeRevenue(listing), 0);
    const pendingRevenue = pending.reduce((acc, listing) => acc + computeRevenue(listing), 0);
    const bookingVolume = published.reduce(
      (acc, listing) =>
        acc + (listing.bookingsCount ?? Math.max(1, Math.round(computeRevenue(listing) / Math.max(listing.nightly_rate, 1)))),
      0
    );
    const topListings = published
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        city: listing.city,
        revenue: computeRevenue(listing),
        status: listing.status,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return {
      realizedRevenue,
      pendingRevenue,
      bookingVolume,
      topListings,
    };
  }, [myListings]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<null | { type: "success" | "error"; text: string }>(null);
  const [imageError, setImageError] = useState("");
  const blankForm = {
    title: "",
    city: "",
    nightlyRate: "",
    occupancy: "",
    images: [] as string[],
    imageInput: "",
  };
  const [listingForm, setListingForm] = useState(blankForm);
  const blobUrlsRef = useRef<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState({
    nightlyRate: "",
    occupancy: "",
  });

  const MIN_PRICE = 50000;
  const MAX_PRICE = 1000000000;
  const MIN_OCCUPANCY = 1;
  const MAX_OCCUPANCY = 20;

  const canCreateListing = (user?.hostStatus === "approved" || user?.role === "admin") && user?.hostStatus !== "pending";

  const handleListingInput = (field: keyof typeof listingForm, value: string) => {
    if (field === "nightlyRate") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      setListingForm((prev) => ({ ...prev, nightlyRate: digitsOnly }));

      if (!digitsOnly) {
        setFieldErrors((prev) => ({ ...prev, nightlyRate: "Only numbers are allowed." }));
      } else {
        const parsed = Number(digitsOnly);
        if (parsed < MIN_PRICE) {
          setFieldErrors((prev) => ({
            ...prev,
            nightlyRate: `Minimum ${MIN_PRICE.toLocaleString("vi-VN")} VND`,
          }));
        } else if (parsed > MAX_PRICE) {
          setFieldErrors((prev) => ({
            ...prev,
            nightlyRate: `Maximum ${MAX_PRICE.toLocaleString("vi-VN")} VND`,
          }));
        } else {
          setFieldErrors((prev) => ({ ...prev, nightlyRate: "" }));
        }
      }
      return;
    }

    if (field === "occupancy") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      setListingForm((prev) => ({ ...prev, occupancy: digitsOnly }));

      if (!digitsOnly) {
        setFieldErrors((prev) => ({ ...prev, occupancy: "Only numbers are allowed." }));
      } else {
        const parsed = Number(digitsOnly);
        if (parsed < MIN_OCCUPANCY) {
          setFieldErrors((prev) => ({ ...prev, occupancy: `Min ${MIN_OCCUPANCY} guest` }));
        } else if (parsed > MAX_OCCUPANCY) {
          setFieldErrors((prev) => ({ ...prev, occupancy: `Max ${MAX_OCCUPANCY} guests` }));
        } else {
          setFieldErrors((prev) => ({ ...prev, occupancy: "" }));
        }
      }
      return;
    }

    setListingForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleImageAdd = () => {
    const url = listingForm.imageInput.trim();
    if (!url) {
      setImageError("Please enter an image link.");
      return;
    }
    if (!isValidUrl(url)) {
      setImageError("Image link must start with http or https.");
      return;
    }
    setImageError("");
    setListingForm((prev) => ({
      ...prev,
      images: prev.images.concat(url),
      imageInput: "",
    }));
  };

  const handleImageInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleImageAdd();
    }
  };

  const validateListingForm = () => {
    if (!listingForm.title.trim() || !listingForm.city.trim()) {
      setFormFeedback({ type: "error", text: "Please provide the listing title and city." });
      return false;
    }

    const nightly = Number(listingForm.nightlyRate);
    if (!Number.isFinite(nightly) || nightly < MIN_PRICE || nightly > MAX_PRICE) {
      setFormFeedback({
        type: "error",
        text: `Nightly rate must be between ${MIN_PRICE.toLocaleString("vi-VN")} VND and ${MAX_PRICE.toLocaleString("vi-VN")} VND.`,
      });
      return false;
    }

    const capacity = Number(listingForm.occupancy);
    if (!Number.isFinite(capacity) || capacity < MIN_OCCUPANCY || capacity > MAX_OCCUPANCY) {
      setFormFeedback({
        type: "error",
        text: `Guest capacity must fall between ${MIN_OCCUPANCY} and ${MAX_OCCUPANCY}.`,
      });
      return false;
    }

    if (listingForm.images.length === 0) {
      setFormFeedback({ type: "error", text: "Please attach at least one image." });
      return false;
    }

    return true;
  };

  const revokeIfBlob = (url: string) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current = blobUrlsRef.current.filter((item) => item !== url);
    }
  };

  const handleLocalImage = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    blobUrlsRef.current.push(objectUrl);
    setImageError("");
    setListingForm((prev) => ({
      ...prev,
      images: prev.images.concat(objectUrl),
    }));
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setListingForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      revokeIfBlob(prev.images[index]);
      return { ...prev, images: next };
    });
  };

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const resetFormState = () => {
    setListingForm(blankForm);
    setEditingListing(null);
    setFieldErrors({ nightlyRate: "", occupancy: "" });
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
  };

  const handleListingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !canCreateListing || isSubmitting) return;
    setFormFeedback(null);
    setImageError("");

    if (!validateListingForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        title: listingForm.title.trim(),
        city: listingForm.city.trim(),
        nightly_rate: Number(listingForm.nightlyRate),
        occupancy: Number(listingForm.occupancy),
        images: listingForm.images,
      };

      if (editingListing) {
        await updateHostListing(editingListing.id, payload);
        setFormFeedback({
          type: "success",
          text: "Listing updated successfully.",
        });
      } else {
        await createHostListing(payload);
        setFormFeedback({
          type: "success",
          text: "Listing submitted successfully. It will be reviewed shortly.",
        });
      }

      resetFormState();
      setIsFormOpen(false);
      await loadListings();
    } catch (error) {
      console.error(error);
      setFormFeedback({
        type: "error",
        text: "Unable to save the listing right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditListing = (listing: HostListing) => {
    setFormFeedback(null);
    setImageError("");
    setIsFormOpen(true);
    setEditingListing(listing);
    setListingForm({
      title: listing.title,
      city: listing.city,
      nightlyRate: String(listing.nightly_rate),
      occupancy: String(listing.occupancy),
      images: listing.images ?? [],
      imageInput: "",
    });
  };

  const handleDeleteListing = async (listing: HostListing) => {
    if (!window.confirm(`Xóa tin "${listing.title}"?`)) return;
    setDeleteLoadingId(listing.id);
    setFormFeedback(null);
    try {
      await deleteHostListing(listing.id);
      if (editingListing?.id === listing.id) {
        resetFormState();
        setIsFormOpen(false);
      }
      await loadListings();
    } catch (error) {
      console.error(error);
      setFormFeedback({
        type: "error",
        text: "Không thể xóa tin này. Vui lòng thử lại.",
      });
    } finally {
      setDeleteLoadingId(null);
    }
  };

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
                Hello, {user?.name ?? "Host"}!
              </h1>
              <p className="mt-2 text-slate-200">
                Monitor listings, booking signals, and approval progress in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                <Building2 className="h-4 w-4" />
                {user?.hostStatus === "approved"
                  ? "Active host"
                  : user?.hostStatus === "pending"
                    ? "Pending approval"
                    : user?.hostStatus === "rejected"
                      ? "Rejected"
                      : "Not registered"}
              </span>
              <a
                href="/my/profile"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30"
              >
                Update host profile
              </a>
            </div>
          </div>
        </header>

        {user?.hostStatus === "pending" && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-800">
            <div className="flex flex-wrap items-center gap-2">
              <Clock4 className="h-4 w-4" />
              Your host application is currently under review. We will notify you via email once approved.
            </div>
          </div>
        )}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total listings</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{hostMetrics.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Published</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">{hostMetrics.published}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending review</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{hostMetrics.pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Potential revenue</p>
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
                  Doanh số host
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Thống kê doanh số</h2>
                <p className="text-sm text-slate-500">
                  Tổng hợp từ các tin đang hiển thị và dữ liệu booking gần nhất.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 p-3 text-slate-600">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Thực thu tháng này</p>
                <p className="text-lg font-semibold text-slate-900">{formatCash(revenueInsights.realizedRevenue)}</p>
                <p className="text-xs text-slate-500">Từ các tin đã phê duyệt</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Lượt đặt</p>
                <p className="text-lg font-semibold text-slate-900">
                  {revenueInsights.bookingVolume.toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-slate-500">Trong tháng gần nhất</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Đang chờ duyệt</p>
                <p className="text-lg font-semibold text-slate-900">{formatCash(revenueInsights.pendingRevenue)}</p>
                <p className="text-xs text-slate-500">Sẽ mở khóa sau khi duyệt</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Giá/đêm trung bình</p>
                <p className="text-lg font-semibold text-slate-900">{formatCash(avgNightlyRate || 0)}</p>
                <p className="text-xs text-slate-500">Trên các tin đã live</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Sức chứa TB</p>
                <p className="text-lg font-semibold text-slate-900">{avgCapacity ? avgCapacity.toFixed(1) : "0"} khách</p>
                <p className="text-xs text-slate-500">Mỗi lượt đặt</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Tin đang xử lý</p>
                <p className="text-lg font-semibold text-slate-900">
                  {myListings.filter((listing) => listing.status === "pending_review").length} tin
                </p>
                <p className="text-xs text-slate-500">Cần hoàn tất để tăng trưởng</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {revenueInsights.topListings.length === 0 && (
                <p className="text-sm text-slate-500">Thêm tin mới hoặc đợi tin được duyệt để xem biểu đồ doanh số.</p>
              )}
              {revenueInsights.topListings.map((item, index) => {
                const max = revenueInsights.topListings[0]?.revenue ?? 1;
                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-semibold text-slate-800">
                        {index + 1}. {item.title}
                      </p>
                      <p className="text-slate-600">{formatCash(item.revenue)}</p>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-slate-500 via-slate-600 to-slate-800"
                        style={{ width: `${(item.revenue / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Listing portfolio
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Your properties</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormFeedback(null);
                  if (isFormOpen && editingListing) {
                    resetFormState();
                  }
                  setIsFormOpen((prev) => {
                    const next = !prev;
                    if (!next) {
                      resetFormState();
                    }
                    return next;
                  });
                }}
                disabled={!canCreateListing}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <PlusCircle className="h-4 w-4" />
                {isFormOpen ? "Đóng biểu mẫu" : editingListing ? "Chỉnh sửa tin" : "Add new listing"}
              </button>
            </div>

            {!canCreateListing && (
              <p className="mt-3 text-sm text-amber-600">
                Only approved hosts can create new listings.
              </p>
            )}

            {formFeedback && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  formFeedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {formFeedback.text}
              </div>
            )}

            {editingListing && isFormOpen && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                Đang chỉnh sửa: <span className="text-slate-900">{editingListing.title}</span>
              </div>
            )}

            {isFormOpen && (
              <form onSubmit={handleListingSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Listing title
                  </label>
                  <input
                    type="text"
                    value={listingForm.title}
                    onChange={(e) => handleListingInput("title", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-slate-200 outline-none"
                    placeholder="Eg: Riverside loft"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={listingForm.city}
                    onChange={(e) => handleListingInput("city", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-slate-200 outline-none"
                    placeholder="Ho Chi Minh City, Da Nang..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nightly rate</label>
                  <input
                    type="number"
                    min={100000}
                    inputMode="decimal"
                    value={listingForm.nightlyRate}
                    onChange={(e) => handleListingInput("nightlyRate", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-slate-200 outline-none"
                    placeholder="e.g. 1200000"
                  />
                  {fieldErrors.nightlyRate && <p className="mt-1 text-xs text-rose-600">{fieldErrors.nightlyRate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Maximum capacity</label>
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={listingForm.occupancy}
                    onChange={(e) => handleListingInput("occupancy", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-slate-200 outline-none"
                    placeholder="Total guests"
                  />
                  {fieldErrors.occupancy && <p className="mt-1 text-xs text-rose-600">{fieldErrors.occupancy}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Images
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={listingForm.imageInput}
                        onChange={(e) => handleListingInput("imageInput", e.target.value)}
                        onKeyDown={handleImageInputKeyDown}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-slate-200 outline-none"
                        placeholder="Paste image link (https://...)"
                      />
                      <button
                        type="button"
                        onClick={handleImageAdd}
                        disabled={!listingForm.imageInput.trim()}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Upload className="h-4 w-4" />
                        Add link
                      </button>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <Upload className="h-4 w-4" />
                      Upload from device
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLocalImage(e)}
                      />
                    </label>
                  </div>
                  {imageError && <p className="mt-2 text-xs text-rose-600">{imageError}</p>}
                  {listingForm.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {listingForm.images.map((img, index) => (
                        <div key={img} className="relative">
                          <img src={img} alt={`Image ${index + 1}`} className="h-24 w-full rounded-xl object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetFormState();
                    }}
                    className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {isSubmitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    {editingListing ? "Cập nhật tin" : "Submit listing"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 space-y-4">
              {isListingLoading && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Loading your listings...
                </div>
              )}
              {!isListingLoading && myListings.length === 0 && (
                <p className="text-sm text-slate-500">
                  You do not have any listings yet. Start by clicking “Add new listing”.
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
                        ? "Live"
                        : listing.status === "pending_review"
                          ? "Pending review"
                          : "Rejected"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditListing(listing)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteListing(listing)}
                      disabled={deleteLoadingId === listing.id}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleteLoadingId === listing.id ? "Đang xóa..." : "Xóa tin"}
                    </button>
                  </div>
                  {listing.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {listing.images.map((img) => (
                        <img
                          key={img}
                          src={img}
                          alt={listing.title}
                          className="h-28 w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                    <span>Nightly rate: {formatCash(listing.nightly_rate)}</span>
                    <span>Capacity: {listing.occupancy} guests</span>
                    <span>Inquiries: {listing.inquiries ?? 0}</span>
                    <span>Monthly revenue: {formatCash(listing.monthlyRevenue ?? 0)}</span>
                    <span>Active tenants: {listing.activeTenants ?? 0}</span>
                    <span>Total bookings: {listing.bookingsCount ?? 0}</span>
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
                <p className="font-semibold text-rose-900">Rejected listings detected</p>
                <p className="mt-1">
                  Some listings need adjustments. Check the review notes in your email or reach out to support for clarification.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
