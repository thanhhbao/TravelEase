import React, { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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
  Plane,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useAdminPanelStore } from "../../store/adminPanel";

const hostStatusBadgeMap = {
  not_registered: "bg-slate-100 text-slate-700 border border-slate-200",
  pending: "bg-sky-50 text-sky-700 border border-sky-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
} as const;

const hostStatusCopy = {
  not_registered: "You have not joined the host program yet",
  pending: "Your request is under review",
  approved: "You are currently approved as a host",
  rejected: "Your previous request was rejected. Please update and try again",
} as const;

const UNIT_OPTIONS = [
  { value: "1-2 listings", label: "1 – 2 rooms/apartments" },
  { value: "3-5 listings", label: "3 – 5 rooms/apartments" },
  { value: "6+ listings", label: "6+ rooms/apartments" },
];

const EXPERIENCE_OPTIONS = [
  { value: "new_host", label: "This is my first time hosting" },
  { value: "1-3_years", label: "1 – 3 years of rental experience" },
  { value: "3+_years", label: "More than 3 years of rental experience" },
];

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
    units: "",
    experience: "",
    introduction: "",
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
      const result = await registerHostApplication({
        userId: user.id,
        userName: user.name ?? "Member",
        email: user.email ?? "",
        phone: hostForm.phone,
        city: hostForm.city,
        inventory: hostForm.units,
        experience: hostForm.experience,
        message: hostForm.introduction,
      });

      if (result.status === "created") {
        setHostFormStatus({
          type: "success",
          message: "Request sent. Our admin team will review it shortly.",
        });
        setHostFormOpen(false);
        setHostForm((prev) => ({
          ...prev,
          units: "",
          experience: "",
          introduction: "",
        }));
      } else {
        setHostFormStatus({
          type: "error",
          message: "You already have a pending request. Please wait for approval.",
        });
      }
    } catch {
      setHostFormStatus({
        type: "error",
        message: "We could not submit your request right now. Please retry later.",
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
  const travelPerks = [
    { title: "10% off next hotel", desc: "Use code TRAVEL10 before Dec 31.", icon: <Ticket className="h-4 w-4" />, tone: "text-sky-700 bg-sky-50 border-sky-200" },
    { title: "Airport lounge day-pass", desc: "Complimentary for premium users.", icon: <ShieldCheck className="h-4 w-4" />, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { title: "24/7 travel support", desc: "Priority chat for changes & delays.", icon: <Plane className="h-4 w-4" />, tone: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-sky-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-3">
              <SearchBarIcon />
              <input
                placeholder="Search settings..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <Crown className="h-4 w-4" /> {user.tier || "Member"}
            </div>
            <div className="flex items-center gap-3 rounded-full bg-white border border-slate-200 shadow-sm px-4 py-2">
              <div className="text-xs text-slate-500 leading-tight">
                <div className="font-semibold text-slate-900">{user.name}</div>
                <div>{user.email}</div>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-400/60">
                <img
                  src={avatarPreview || avatarOf(formData.name)}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = avatarOf(formData.name);
                  }}
                  alt={formData.name || user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200 shadow-lg p-6 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-100 shadow-lg">
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
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
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
            <div className="mt-4 space-y-1">
              <div className="text-2xl font-bold text-slate-900">{formData.name || user.name}</div>
              <div className="text-emerald-600 text-sm">Premium User</div>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
                <Mail className="h-3.5 w-3.5" /> {formData.email || user.email}
              </span>
              {(formData.phone || user.phone) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 border border-slate-200">
                  <Phone className="h-3.5 w-3.5" /> {formData.phone || user.phone}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 border border-emerald-200">
                <BadgeCheck className="h-3.5 w-3.5" /> {user.points ?? 0} pts
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 border border-sky-200">
                <Sparkles className="h-3.5 w-3.5" /> Active
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-sky-600 text-white px-4 py-2 font-semibold hover:bg-sky-500"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="rounded-full border border-slate-200 text-slate-700 px-4 py-2 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="rounded-full bg-emerald-500 text-white px-4 py-2 font-semibold hover:bg-emerald-400 disabled:opacity-60 flex items-center gap-2"
                  >
                    {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />}
                    <span>{isLoading ? "Saving..." : "Save"}</span>
                  </button>
                </>
              )}
            </div>
            {errorMessage && (
              <div className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mt-3 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 shadow-lg p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Location" value={user.location || "—"} />
              <InfoRow label="Host status" value={hostStatusCopy[hostStatusKey]} pill className={hostStatusBadgeMap[hostStatusKey]} />
              <InfoRow label="Availability" value="Available for collaboration" pill className="bg-emerald-500/15 text-emerald-200 border border-emerald-500/30" />
              <InfoRow label="Tier" value={user.tier || "Member"} />
              <InfoRow label="Points" value={`${user.points ?? 0} pts`} />
              <InfoRow label="Email" value={formData.email || user.email} />
              <InfoRow label="Phone" value={formData.phone || user.phone || "Not provided"} />
              <InfoRow label="Tags" value="#travel #hospitality" />
            </div>
          </div>
        </div>

        {/* Social + content */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-700 font-semibold">Travel perks</div>
              <p className="text-xs text-slate-500">Exclusive benefits for your next trips</p>
            </div>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-100 rounded-full px-3 py-1">
              Active
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {travelPerks.map((perk) => (
              <div
                key={perk.title}
                className={`rounded-2xl border ${perk.tone} px-3 py-3 flex flex-col gap-1`}
              >
                <div className="inline-flex items-center gap-2 font-semibold">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/60 border border-white/80 text-current">
                    {perk.icon}
                  </span>
                  <span>{perk.title}</span>
                </div>
                <p className="text-xs">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forms and settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Personal info form */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Personal information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <LabeledInput
                  icon={<UserIcon className="h-4 w-4 text-slate-400" />}
                  label="Full name"
                  value={formData.name}
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <LabeledInput
                  icon={<Mail className="h-4 w-4 text-slate-400" />}
                  label="Email"
                  value={formData.email}
                  placeholder="Enter your email"
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <LabeledInput
                  icon={<Phone className="h-4 w-4 text-slate-400" />}
                  label="Phone"
                  value={formData.phone}
                  placeholder="Enter your phone number"
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                <LabeledInput
                  icon={<MapPin className="h-4 w-4 text-slate-400" />}
                  label="City / Region"
                  value={user.location ?? ""}
                  placeholder="Add a city in profile settings"
                  disabled
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Security */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Account security</h3>
                  <p className="text-sm text-slate-500">Change your password with a verification code.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurity((v) => !v);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold bg-slate-50 hover:bg-white"
                >
                  {showSecurity ? "Close" : "Change"}
                </button>
              </div>

              {showSecurity && (
                <div className="space-y-4">
                  {passwordSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {passwordSuccess}
                    </div>
                  )}
                  {passwordError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {passwordError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendPasswordCode}
                      disabled={isSendingPasswordCode || resendCountdown > 0}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold bg-slate-50 hover:bg-white disabled:opacity-60"
                    >
                      {isSendingPasswordCode && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                      )}
                      <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Send code"}</span>
                    </button>
                    {codeSentAt && (
                      <p className="text-xs text-slate-500">
                        Code sent {codeSentAt.toLocaleTimeString()} to <strong>{user.email}</strong>
                      </p>
                    )}
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="grid md:grid-cols-2 gap-4">
                    <LabeledInput
                      icon={<KeyRound className="h-4 w-4 text-slate-400" />}
                      label="Verification code"
                      value={passwordForm.code}
                      onChange={(e) => handlePasswordInputChange("code", e.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      required
                    />
                    <LabeledInput
                      icon={<Lock className="h-4 w-4 text-slate-400" />}
                      label="New password"
                      value={passwordForm.password}
                      onChange={(e) => handlePasswordInputChange("password", e.target.value)}
                      type="password"
                      placeholder="Enter new password"
                      required
                    />
                    <LabeledInput
                      icon={<Lock className="h-4 w-4 text-slate-400" />}
                      label="Confirm new password"
                      value={passwordForm.password_confirmation}
                      onChange={(e) => handlePasswordInputChange("password_confirmation", e.target.value)}
                      type="password"
                      placeholder="Re-enter new password"
                      required
                    />
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-sky-500 disabled:opacity-60"
                      >
                        {isChangingPassword && (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        )}
                        Update password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Host card */}
            <div className="rounded-3xl bg-[#0f1421] border border-white/5 shadow-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Host program</h3>
                  <p className="text-sm text-slate-400">Promote your rooms and apartments.</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${hostStatusBadgeMap[hostStatusKey]}`}>
                  {hostStatusCopy[hostStatusKey]}
                </span>
              </div>

              {hostStatus === "approved" ? (
                <div className="space-y-3 text-sm text-slate-300">
                  <p>You already have full host access.</p>
                  <Link
                    to="/host/workspace"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-slate-950 px-4 py-2 font-semibold hover:bg-emerald-400"
                  >
                    <BadgeCheck className="h-4 w-4" /> Open Host Workspace
                  </Link>
                </div>
              ) : hostStatus === "pending" ? (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>We received your application {myHostApplication ? new Date(myHostApplication.submittedAt).toLocaleDateString() : "recently"}.</p>
                  <p className="text-xs text-slate-500">We will reply to <strong>{user.email}</strong>.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hostFormStatus && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        hostFormStatus.type === "success"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-100"
                      }`}
                    >
                      {hostFormStatus.message}
                    </div>
                  )}

                  {hostFormOpen ? (
                    <form className="space-y-3" onSubmit={handleHostApplicationSubmit}>
                      <LabeledInput
                        label="Phone number"
                        value={hostForm.phone}
                        onChange={(e) => handleHostInputChange("phone", e.target.value)}
                        required
                      />
                      <LabeledInput
                        label="City"
                        value={hostForm.city}
                        onChange={(e) => handleHostInputChange("city", e.target.value)}
                        required
                        placeholder="e.g. Da Nang"
                      />
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Number of rooms / apartments</label>
                        <select
                          value={hostForm.units}
                          onChange={(e) => handleHostInputChange("units", e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:outline-none"
                          required
                        >
                          <option value="">Select inventory</option>
                          {UNIT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 mb-1">Rental experience</p>
                        <div className="space-y-2">
                          {EXPERIENCE_OPTIONS.map((option, index) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
                            >
                              <input
                                type="radio"
                                name="host-experience"
                                value={option.value}
                                checked={hostForm.experience === option.value}
                                onChange={(e) => handleHostInputChange("experience", e.target.value)}
                                required={index === 0}
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Quick introduction (optional)</label>
                        <textarea
                          value={hostForm.introduction}
                          onChange={(e) => handleHostInputChange("introduction", e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 focus:outline-none"
                          placeholder="Share what makes your property special."
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setHostFormOpen(false)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingHost}
                          className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-60"
                        >
                          {isSubmittingHost && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                          )}
                          Submit request
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
                      className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500"
                    >
                      <Building2 className="h-4 w-4" />
                      Apply to become a host
                    </button>
                  )}

                  {hostStatus === "rejected" && (
                    <p className="text-xs text-rose-600">
                      Your previous request was not approved. Update the info above and apply again.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Email notifications</h3>
                  <p className="text-sm text-slate-500">Choose what you want to receive.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold bg-slate-50 hover:bg-white"
                >
                  {notifOpen ? "Close" : "Manage"}
                </button>
              </div>

              {notifOpen && (
                <div className="space-y-3">
                  <ToggleRow
                    label="Product updates"
                    checked={notifState.productUpdates}
                    onChange={(v) => setNotifState((s) => ({ ...s, productUpdates: v }))}
                  />
                  <ToggleRow
                    label="Trips & reminders"
                    checked={notifState.tripsReminders}
                    onChange={(v) => setNotifState((s) => ({ ...s, tripsReminders: v }))}
                  />
                  <ToggleRow
                    label="Marketing & promos"
                    checked={notifState.marketing}
                    onChange={(v) => setNotifState((s) => ({ ...s, marketing: v }))}
                  />

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={saveNotifications}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white px-5 py-2 text-sm font-bold hover:bg-sky-500"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Save preferences</span>
                    </button>
                    {notifSaved === "ok" && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                        <Check className="h-4 w-4" /> Saved
                      </span>
                    )}
                    {notifSaved === "err" && (
                      <span className="inline-flex items-center gap-1 text-rose-600 text-sm">
                        <X className="h-4 w-4" /> Failed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account */}
            <div className="rounded-3xl bg-white border border-rose-100 shadow-lg p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-rose-700">Delete account</h3>
                    <p className="text-sm text-rose-600">This action cannot be undone.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDelete((v) => !v);
                    setDeleteError("");
                    setDeleteSuccess("");
                  }}
                  className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-semibold bg-rose-50 hover:bg-rose-100"
                >
                  {showDelete ? "Close" : "Proceed"}
                </button>
              </div>

              {showDelete && (
                <div className="space-y-4">
                  {deleteSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {deleteSuccess}
                    </div>
                  )}
                  {deleteError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {deleteError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendDeleteCode}
                      disabled={isSendingDeleteCode || deleteResendCountdown > 0}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-60"
                    >
                      {isSendingDeleteCode && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-transparent" />
                      )}
                      <span>{deleteResendCountdown > 0 ? `Resend in ${deleteResendCountdown}s` : "Send verification code"}</span>
                    </button>
                    {deleteCodeSentAt && (
                      <p className="text-xs text-rose-600">
                        Code sent {deleteCodeSentAt.toLocaleTimeString()} to <strong>{user.email}</strong>
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleDeleteSubmit} className="space-y-3">
                    <LabeledInput
                      icon={<KeyRound className="h-4 w-4 text-rose-300" />}
                      label="Verification code"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      maxLength={6}
                      required
                    />
                    <label className="flex items-center gap-3 text-sm text-rose-700">
                      <input
                        type="checkbox"
                        checked={deleteAck}
                        onChange={(e) => setDeleteAck(e.target.checked)}
                      />
                      <span>I understand this will permanently delete my account and all data.</span>
                    </label>
                    <button
                      type="submit"
                      disabled={isDeleting || !deleteAck || deleteCode.trim().length < 6}
                      className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-rose-500 disabled:opacity-60"
                    >
                      {isDeleting && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      )}
                      <Trash2 className="h-4 w-4" />
                      <span>Delete account</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  disabled,
  required,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-wide text-slate-500">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 ${
            icon ? "pl-10" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}

function SocialDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold border border-slate-200 ${color}`}
    >
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function InfoRow({
  label,
  value,
  pill = false,
  className = "",
}: {
  label: string;
  value: string;
  pill?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      {pill ? (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${className}`}>{value}</span>
      ) : (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      )}
    </div>
  );
}

function SearchBarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4 text-slate-400"
    >
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  );
}
