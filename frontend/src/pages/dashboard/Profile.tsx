import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Camera,
  Crown,
  Gift,
  MapPin,
  Lock,
  KeyRound,
  Bell,
  Check,
  X,
  AlertTriangle,
  Trash2,
  User as UserIcon,
  Building2,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useAdminPanelStore } from "../../store/adminPanel";

// Optional wave divider reused from Home for visual continuity
const WaveDivider = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-[120px] text-sky-50" preserveAspectRatio="none">
    <path
      fill="currentColor"
      d="M0,32L80,53.3C160,75,320,117,480,106.7C640,96,800,32,960,21.3C1120,11,1280,53,1360,74.7L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
    />
  </svg>
);

const hostStatusBadgeMap = {
  not_registered: "bg-slate-100 text-slate-600",
  pending: "bg-blue-50 text-blue-600",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-600",
} as const;

const hostStatusCopy = {
  not_registered: "Chưa đăng ký làm người đăng tin",
  pending: "Đã gửi yêu cầu, chờ admin duyệt",
  approved: "Bạn đang là người đăng tin",
  rejected: "Cần bổ sung thông tin để xét duyệt lại",
} as const;

export default function Profile() {
  const {
    user,
    updateProfile,
    requestPasswordChangeCode,
    changePassword,
    requestAccountDeletionCode,
    deleteAccount,
    isBootstrapping,
  } = useAuthStore();
  const { registerHostApplication, hostApplications } = useAdminPanelStore();

  const avatarOf = (name?: string, url?: string | null) => {
    if (url) return url;
    const text = encodeURIComponent(name ?? "U");
    return `https://ui-avatars.com/api/?name=${text}&background=0D8ABC&color=fff&size=128&rounded=true`;
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state khớp DB
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  // Ảnh hiển thị
  const [avatarPreview, setAvatarPreview] = useState<string>(() =>
    (user?.avatar as string | null) ?? avatarOf(user?.name)
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [hostFormOpen, setHostFormOpen] = useState(false);
  const [hostForm, setHostForm] = useState({
    phone: user?.phone ?? "",
    city: "",
    experience: "",
    message: "",
  });
  const [hostFormStatus, setHostFormStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [isSubmittingHost, setIsSubmittingHost] = useState(false);
  const hostStatus = user?.hostStatus ?? "not_registered";
  const hostStatusKey = (hostStatus in hostStatusBadgeMap ? hostStatus : "not_registered") as keyof typeof hostStatusBadgeMap;
  const myHostApplication = user ? hostApplications.find((app) => app.userId === user.id) : undefined;

  const handleHostInputChange = (field: keyof typeof hostForm, value: string) => {
    setHostForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleHostApplicationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || isSubmittingHost) return;

    setHostFormStatus(null);
    setIsSubmittingHost(true);

    try {
      const result = registerHostApplication({
        userId: user.id,
        userName: user.name ?? "Người dùng",
        email: user.email ?? "",
        phone: hostForm.phone,
        city: hostForm.city,
        experience: hostForm.experience,
        message: hostForm.message,
      });

      if (result.status === "created") {
        setHostFormStatus({
          type: "success",
          message: "Đã gửi yêu cầu. Đội ngũ admin sẽ phản hồi trong vòng 24 giờ.",
        });
        setHostFormOpen(false);
      } else {
        setHostFormStatus({
          type: "error",
          message: "Bạn đang có một yêu cầu chờ duyệt. Vui lòng đợi phản hồi.",
        });
      }
    } catch {
      setHostFormStatus({
        type: "error",
        message: "Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmittingHost(false);
    }
  };

  // === Password states ===
  const [showSecurity, setShowSecurity] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    code: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSendingPasswordCode, setIsSendingPasswordCode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [codeSentAt, setCodeSentAt] = useState<Date | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // === Notifications demo ===
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifState, setNotifState] = useState({
    productUpdates: true,
    tripsReminders: true,
    marketing: false,
  });
  const [notifSaved, setNotifSaved] = useState<null | "ok" | "err">(null);

  // === Delete account states ===
  const [showDelete, setShowDelete] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteAck, setDeleteAck] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [isSendingDeleteCode, setIsSendingDeleteCode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCodeSentAt, setDeleteCodeSentAt] = useState<Date | null>(null);
  const [deleteResendCountdown, setDeleteResendCountdown] = useState(0);

  // Đồng bộ user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
      setAvatarPreview((user.avatar as string | null) ?? avatarOf(user.name));
      setAvatarFile(null);
      setHostForm((prev) => ({
        ...prev,
        phone: user.phone ?? prev.phone,
      }));
    }
  }, [user]);

  // Cleanup blob URL khi unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Resend timers
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => setResendCountdown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  useEffect(() => {
    if (deleteResendCountdown <= 0) return;
    const t = setInterval(() => setDeleteResendCountdown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [deleteResendCountdown]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!isEditing) setIsEditing(true);
  };

  // ===== Avatar handlers (chỉ cho phép khi đang Edit) =====
  const handleAvatarClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextUrl = URL.createObjectURL(file);
    setAvatarPreview(nextUrl);
    setAvatarFile(file);
    setPreviewUrl(nextUrl);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone ?? null,
        avatarFile,
      });

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setAvatarFile(null);

      setFormData({
        name: updated.name ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
      });
      setAvatarPreview(updated.avatar ?? avatarOf(updated.name));
      setSuccessMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };
        const firstError = data?.errors && Object.values(data.errors)[0]?.[0];
        setErrorMessage(firstError ?? data?.message ?? "Unable to update profile right now.");
      } else {
        setErrorMessage("Unable to update profile right now.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Password flows =====
  const handlePasswordInputChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendPasswordCode = async () => {
    if (isSendingPasswordCode || resendCountdown > 0) return;

    setPasswordError("");
    setPasswordSuccess("");
    setIsSendingPasswordCode(true);

    try {
      await requestPasswordChangeCode();
      setPasswordSuccess(`We sent a verification code to ${user?.email ?? "your email"}.`);
      setCodeSentAt(new Date());
      setResendCountdown(60);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setPasswordError(error.response?.data?.message ?? "Unable to send verification code.");
      } else {
        setPasswordError("Unable to send verification code.");
      }
    } finally {
      setIsSendingPasswordCode(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isChangingPassword) return;

    setPasswordError("");
    setPasswordSuccess("");
    setIsChangingPassword(true);

    try {
      await changePassword({
        code: passwordForm.code.trim(),
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });

      setPasswordSuccess("Your password has been updated successfully.");
      setPasswordForm({ code: "", password: "", password_confirmation: "" });
      setCodeSentAt(null);

      setTimeout(() => setShowSecurity(false), 1200);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setPasswordError(
          error.response?.data?.message ?? "Unable to update password right now."
        );
      } else {
        setPasswordError("Unable to update password right now.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ===== Notifications (demo) =====
  const saveNotifications = async () => {
    try {
      // TODO: POST prefs nếu có API
      setNotifSaved("ok");
      setTimeout(() => setNotifSaved(null), 1500);
      setNotifOpen(false);
    } catch {
      setNotifSaved("err");
      setTimeout(() => setNotifSaved(null), 2000);
    }
  };

  // ===== Delete account flows =====
  const handleSendDeleteCode = async () => {
    if (isSendingDeleteCode || deleteResendCountdown > 0) return;

    setDeleteError("");
    setDeleteSuccess("");
    setIsSendingDeleteCode(true);

    try {
      await requestAccountDeletionCode();
      setDeleteSuccess(`We sent a verification code to ${user?.email ?? "your email"}.`);
      setDeleteCodeSentAt(new Date());
      setDeleteResendCountdown(60);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setDeleteError(error.response?.data?.message ?? "Unable to send verification code.");
      } else {
        setDeleteError("Unable to send verification code.");
      }
    } finally {
      setIsSendingDeleteCode(false);
    }
  };

  const handleDeleteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isDeleting) return;

    setDeleteError("");
    setDeleteSuccess("");
    setIsDeleting(true);

    try {
      await deleteAccount({ code: deleteCode.trim() });
      // Suggestion: store nên clear auth state và điều hướng ra trang login/home
      setDeleteSuccess("Your account has been deleted.");
      // Tuỳ chọn: redirect ngay
      // window.location.href = "/";
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setDeleteError(error.response?.data?.message ?? "Unable to delete account right now.");
      } else {
        setDeleteError("Unable to delete account right now.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAvatarFile(null);

    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
    setAvatarPreview((user.avatar as string | null) ?? avatarOf(user.name));
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  if (isBootstrapping && !user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">User not found</h2>
          <p className="text-slate-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      {/* ===== Cover / Hero ===== */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop"
            alt="Ocean cover"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-sky-800/40 to-cyan-700/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pt-8">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-20">
              <div className="relative rounded-3xl border border-white/40 bg-white/20 backdrop-blur-xl p-3 shadow-2xl">
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ring-white shadow-xl">
                  <img
                    src={avatarPreview || avatarOf(formData.name)}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = avatarOf(formData.name);
                    }}
                    alt={formData.name || user.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={!isEditing}
                    className={`absolute bottom-2 right-2 rounded-full p-2 shadow ${
                      isEditing
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-white/60 text-slate-400 cursor-not-allowed"
                    }`}
                    title={isEditing ? "Change photo" : "Click Edit Profile first"}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex-1 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold">{formData.name || user.name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sky-100">
                    <Mail className="h-4 w-4" /> {formData.email || user.email}
                    {(formData.phone || user.phone) && (
                      <>
                        <span className="opacity-50">•</span>
                        <Phone className="h-4 w-4" /> {formData.phone || user.phone}
                      </>
                    )}
                    {user.location && (
                      <>
                        <span className="opacity-50">•</span>
                        <MapPin className="h-4 w-4" /> {user.location}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 md:ml-auto mt-2 md:mt-0">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-2.5 font-bold shadow hover:from-sky-600 hover:to-cyan-600"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="rounded-full border-2 border-sky-200 text-sky-700 px-5 py-2.5 font-bold hover:bg-sky-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-2.5 font-bold shadow hover:from-sky-600 hover:to-cyan-600 disabled:opacity-60 flex items-center gap-2"
                      >
                        {isLoading && (
                          <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        )}
                        <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full ring-1 ring-white/40">
                  <Crown className="h-4 w-4" /> {user.tier || "Member"}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full ring-1 ring-white/40">
                  <Gift className="h-4 w-4" /> {user.points ?? 0} pts
                </span>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-sm text-green-700 backdrop-blur">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <WaveDivider />
        </div>
      </section>

      {/* ===== Content ===== */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl border border-sky-100 bg-white/90 backdrop-blur p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h3>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full rounded-xl border border-sky-200 bg-white/95 px-4 py-3 pl-10 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 pl-10 text-slate-900">
                        {formData.name || user.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full rounded-xl border border-sky-200 bg-white/95 px-4 py-3 pl-10 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 pl-10 text-slate-900">
                        {formData.email || user.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full rounded-xl border border-sky-200 bg-white/95 px-4 py-3 pl-10 focus:ring-2 focus:ring-sky-200 outline-none"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 pl-10 text-slate-900">
                        {formData.phone || user.phone || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right: Settings column */}
          <div className="space-y-6">
            {/* Host registration */}
            <div className="relative rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Đăng tin cho thuê</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Trở thành đối tác host của TravelEase để quảng bá phòng và căn hộ của bạn.
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${hostStatusBadgeMap[hostStatusKey]}`}
                >
                  {hostStatusCopy[hostStatusKey]}
                </span>
              </div>

              {hostStatus === "approved" ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-slate-600">
                    Bạn đã có toàn quyền đăng tin. Quản lý lịch, giá và đơn đặt phòng trong không gian riêng dành cho host.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Ưu tiên duyệt tin
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Công cụ định giá
                    </span>
                  </div>
                  <Link
                    to="/host/workspace"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Quản lý Host Workspace
                  </Link>
                </div>
              ) : hostStatus === "pending" ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-blue-100 bg-white/70 p-4 text-sm text-slate-700">
                    <p>
                      Đã nhận đơn đăng ký {myHostApplication ? new Date(myHostApplication.submittedAt).toLocaleDateString("vi-VN") : "gần đây"}.
                    </p>
                    <p className="mt-1 text-slate-500">
                      Chúng tôi sẽ phản hồi qua email <strong>{user.email}</strong>.
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nếu cần cập nhật thông tin, hãy chỉnh sửa hồ sơ và liên hệ đội ngũ hỗ trợ.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-slate-600">
                    Nhận hỗ trợ định giá, công cụ quản lý và đội ngũ chăm sóc khách hàng 24/7 khi đăng ký làm người đăng tin.
                  </p>

                  {hostFormStatus && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        hostFormStatus.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {hostFormStatus.message}
                    </div>
                  )}

                  {hostFormOpen ? (
                    <form className="space-y-4" onSubmit={handleHostApplicationSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Số điện thoại</label>
                        <input
                          type="tel"
                          value={hostForm.phone}
                          onChange={(e) => handleHostInputChange("phone", e.target.value)}
                          className="w-full rounded-xl border border-amber-200 bg-white/90 px-4 py-2.5 focus:ring-2 focus:ring-amber-200 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Thành phố</label>
                        <input
                          type="text"
                          value={hostForm.city}
                          onChange={(e) => handleHostInputChange("city", e.target.value)}
                          className="w-full rounded-xl border border-amber-200 bg-white/90 px-4 py-2.5 focus:ring-2 focus:ring-amber-200 outline-none"
                          placeholder="Ví dụ: Đà Nẵng"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Kinh nghiệm / Tài sản</label>
                        <input
                          type="text"
                          value={hostForm.experience}
                          onChange={(e) => handleHostInputChange("experience", e.target.value)}
                          className="w-full rounded-xl border border-amber-200 bg-white/90 px-4 py-2.5 focus:ring-2 focus:ring-amber-200 outline-none"
                          placeholder="Số lượng phòng, kinh nghiệm quản lý..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Giới thiệu nhanh</label>
                        <textarea
                          value={hostForm.message}
                          onChange={(e) => handleHostInputChange("message", e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-amber-200 bg-white/90 px-4 py-2.5 focus:ring-2 focus:ring-amber-200 outline-none"
                          placeholder="Hãy chia sẻ kỳ vọng và điểm nổi bật của bất động sản."
                          required
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setHostFormOpen(false)}
                          className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
                        >
                          Huỷ
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingHost}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {isSubmittingHost && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          )}
                          Gửi yêu cầu
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setHostFormStatus(null);
                        setHostFormOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <Building2 className="h-4 w-4" />
                      Đăng ký làm người đăng tin
                    </button>
                  )}

                  {hostStatus === "rejected" && (
                    <p className="text-xs text-rose-600">
                      Đơn gần nhất chưa đạt yêu cầu. Bạn có thể bổ sung thông tin và gửi lại.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Security (collapsed by default) */}
            <div className="relative rounded-3xl border border-sky-100 bg-white/90 backdrop-blur p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Account Security</h3>
                  <p className="text-sm text-slate-600 mt-1">Change your password with a verification code.</p>
                </div>
                {!showSecurity ? (
                  <button
                    type="button"
                    onClick={() => { setShowSecurity(true); setPasswordError(""); setPasswordSuccess(""); }}
                    className="rounded-full border-2 border-sky-200 text-sky-700 px-4 py-2 font-semibold hover:bg-sky-50"
                  >
                    Change password
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowSecurity(false); setPasswordError(""); setPasswordSuccess(""); }}
                    className="rounded-full border-2 border-slate-200 text-slate-700 px-4 py-2 font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                )}
              </div>

              {showSecurity && (
                <div className="mt-5 space-y-4">
                  {passwordSuccess && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {passwordError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendPasswordCode}
                      disabled={isSendingPasswordCode || resendCountdown > 0}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingPasswordCode && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                      )}
                      <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Send verification code"}</span>
                    </button>

                    {codeSentAt && (
                      <p className="text-xs text-slate-500">
                        Code sent {codeSentAt.toLocaleTimeString()} • check <strong>{user?.email}</strong>.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Verification code</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={passwordForm.code}
                          onChange={(e) => handlePasswordInputChange("code", e.target.value)}
                          className="w-full rounded-xl border border-sky-200 bg-white/95 px-4 py-3 pl-10 tracking-widest focus:ring-2 focus:ring-sky-200 outline-none"
                          placeholder="Enter the 6-digit code"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">New password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="password"
                          value={passwordForm.password}
                          onChange={(e) => handlePasswordInputChange("password", e.target.value)}
                          className="w-full rounded-xl border border-sky-200 bg-white/95 px-4 py-3 pl-10 focus:ring-2 focus:ring-sky-200 outline-none"
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Confirm new password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="password"
                          value={passwordForm.password_confirmation}
                          onChange={(e) => handlePasswordInputChange("password_confirmation", e.target.value)}
                          className="w-full rounded-xl border border-sky-200 bg-white/95 px-4 py-3 pl-10 focus:ring-2 focus:ring-sky-200 outline-none"
                          placeholder="Re-enter new password"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isChangingPassword && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      <span>Update password</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative rounded-3xl border border-sky-100 bg-white/90 backdrop-blur p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Email Notifications</h3>
                  <p className="text-sm text-slate-600 mt-1">Manage what emails you want to receive.</p>
                </div>
                {!notifOpen ? (
                  <button
                    type="button"
                    onClick={() => setNotifOpen(true)}
                    className="rounded-full border-2 border-sky-200 text-sky-700 px-4 py-2 font-semibold hover:bg-sky-50"
                  >
                    Manage
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    className="rounded-full border-2 border-slate-200 text-slate-700 px-4 py-2 font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                )}
              </div>

              {notifOpen && (
                <div className="mt-5 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notifState.productUpdates}
                      onChange={(e) => setNotifState(s => ({ ...s, productUpdates: e.target.checked }))}
                    />
                    <span className="text-sm text-slate-700">Product updates</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notifState.tripsReminders}
                      onChange={(e) => setNotifState(s => ({ ...s, tripsReminders: e.target.checked }))}
                    />
                    <span className="text-sm text-slate-700">Trips & reminders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notifState.marketing}
                      onChange={(e) => setNotifState(s => ({ ...s, marketing: e.target.checked }))}
                    />
                    <span className="text-sm text-slate-700">Marketing & promos</span>
                  </label>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={saveNotifications}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:from-sky-600 hover:to-cyan-600"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Save preferences</span>
                    </button>
                    {notifSaved === "ok" && (
                      <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                        <Check className="h-4 w-4" /> Saved
                      </span>
                    )}
                    {notifSaved === "err" && (
                      <span className="inline-flex items-center gap-1 text-red-700 text-sm">
                        <X className="h-4 w-4" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account (collapsed by default) */}
            <div className="relative rounded-3xl border border-red-200 bg-red-50/60 backdrop-blur p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Permanently remove your account and all data. This action cannot be undone.
                    </p>
                  </div>
                </div>

                {!showDelete ? (
                  <button
                    type="button"
                    onClick={() => { setShowDelete(true); setDeleteError(""); setDeleteSuccess(""); }}
                    className="rounded-full border-2 border-red-300 text-red-700 px-4 py-2 font-semibold hover:bg-red-100"
                  >
                    Proceed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowDelete(false); setDeleteError(""); setDeleteSuccess(""); }}
                    className="rounded-full border-2 border-slate-200 text-slate-700 px-4 py-2 font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                )}
              </div>

              {showDelete && (
                <div className="mt-5 space-y-4">
                  {deleteSuccess && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {deleteSuccess}
                    </div>
                  )}
                  {deleteError && (
                    <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-800">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendDeleteCode}
                      disabled={isSendingDeleteCode || deleteResendCountdown > 0}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingDeleteCode && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      )}
                      <span>{deleteResendCountdown > 0 ? `Resend in ${deleteResendCountdown}s` : "Send verification code"}</span>
                    </button>

                    {deleteCodeSentAt && (
                      <p className="text-xs text-red-700">
                        Code sent {deleteCodeSentAt.toLocaleTimeString()} • check <strong>{user?.email}</strong>.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleDeleteSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-2">Verification code</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={deleteCode}
                          onChange={(e) => setDeleteCode(e.target.value)}
                          className="w-full rounded-xl border border-red-300 bg-white/95 px-4 py-3 pl-10 tracking-widest focus:ring-2 focus:ring-red-200 outline-none"
                          placeholder="Enter the 6-digit code"
                          required
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={deleteAck}
                        onChange={(e) => setDeleteAck(e.target.checked)}
                      />
                      <span className="text-sm text-red-800">
                        I understand this will permanently delete my account and all data.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isDeleting || !deleteAck || deleteCode.trim().length < 6}
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      <Trash2 className="h-4 w-4" />
                      <span>Delete account</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Loyalty snapshot (optional) */}
            {(user.tier || (user.points ?? 0) > 0) && (
              <div className="relative rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Loyalty</div>
                    <div className="font-bold text-slate-900">{user.tier || "Member"}</div>
                  </div>
                  {(user.points ?? 0) > 0 && (
                    <div className="text-slate-900 font-bold">{user.points} pts</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
