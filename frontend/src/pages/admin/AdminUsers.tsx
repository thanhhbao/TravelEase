import { useMemo, useState } from "react";
import { Search, Users, Building2 } from "lucide-react";
import { useAdminPanelStore } from "../../store/adminPanel";
import { type UserRole } from "../../store/auth";

const roleOptions: { label: string; value: "all" | UserRole }[] = [
  { label: "Tất cả vai trò", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Host", value: "host" },
  { label: "Traveler", value: "traveler" },
];

const hostStatusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chưa đăng ký", value: "not_registered" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đang hoạt động", value: "approved" },
  { label: "Bị từ chối", value: "rejected" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminUsers() {
  const { managedUsers } = useAdminPanelStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [hostFilter, setHostFilter] = useState<"all" | "not_registered" | "pending" | "approved" | "rejected">("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    return managedUsers.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" ? true : user.role === roleFilter;
      const matchHost = hostFilter === "all" ? true : user.hostStatus === hostFilter;
      return matchSearch && matchRole && matchHost;
    });
  }, [managedUsers, search, roleFilter, hostFilter]);

  const visibleUsers = filtered.slice(0, visibleCount);

  return (
    <div className="bg-slate-50 min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Directory</p>
            <h1 className="text-3xl font-bold text-slate-900">Member management</h1>
            <p className="text-slate-600">Search and filter every user across the platform.</p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full border-none bg-transparent py-2 text-sm outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as "all" | UserRole);
                setVisibleCount(8);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={hostFilter}
              onChange={(e) => {
                setHostFilter(e.target.value as typeof hostFilter);
                setVisibleCount(8);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
            >
              {hostStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="grid gap-4">
          {visibleUsers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
              Không tìm thấy thành viên phù hợp.
            </div>
          )}
          {visibleUsers.map((user) => (
            <div key={user.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    <Users className="h-3.5 w-3.5" />
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${
                      user.hostStatus === "approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : user.hostStatus === "pending"
                          ? "bg-blue-50 text-blue-600"
                          : user.hostStatus === "rejected"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {user.hostStatus}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                <span>Tổng tin đăng: {user.totalListings}</span>
                <span>Pending payout: {user.pendingPayout ? formatCurrency(user.pendingPayout) : "—"}</span>
                <span>Last active: {user.lastActive}</span>
              </div>
            </div>
          ))}
        </section>

        {visibleCount < filtered.length && (
          <div className="flex justify-center">
            <button
              onClick={() => setVisibleCount((count) => count + 6)}
              className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
