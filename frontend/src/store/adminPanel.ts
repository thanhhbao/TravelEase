import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore, type HostStatus, type UserRole } from "./auth";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const uniqueRoles = (roles: UserRole[]) => Array.from(new Set(roles));

export type ListingStatus = "pending_review" | "published" | "rejected";
export type HostApplicationDecision = "pending" | "approved" | "rejected";

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  roles: UserRole[];
  hostStatus: HostStatus;
  totalListings: number;
  lastActive: string;
  tier?: string;
  pendingPayout?: number;
};

export type PropertyListing = {
  id: string;
  title: string;
  city: string;
  hostId: number;
  hostName: string;
  status: ListingStatus;
  nightlyRate: number;
  occupancy: number;
  lastUpdated: string;
  views: number;
  inquiries: number;
};

export type HostApplication = {
  id: string;
  userId: number;
  userName: string;
  email: string;
  phone?: string;
  city?: string;
  experience: string;
  message: string;
  preferredContact?: string;
  status: HostApplicationDecision;
  submittedAt: string;
};

export type ActivityLogEntry = {
  id: string;
  type: "role_update" | "listing" | "host_application";
  title: string;
  description: string;
  actor: string;
  createdAt: string;
};

type HostApplicationPayload = {
  userId: number;
  userName: string;
  email: string;
  phone?: string;
  city?: string;
  experience: string;
  message: string;
  preferredContact?: string;
};

type HostApplicationResult =
  | { status: "created"; application: HostApplication }
  | { status: "already_pending"; application: HostApplication };

type AdminPanelState = {
  managedUsers: ManagedUser[];
  propertyListings: PropertyListing[];
  hostApplications: HostApplication[];
  activityLog: ActivityLogEntry[];
  assignUserRole: (userId: number, role: UserRole) => void;
  updateListingStatus: (listingId: string, status: ListingStatus) => void;
  updateHostApplication: (id: string, status: HostApplicationDecision) => void;
  registerHostApplication: (payload: HostApplicationPayload) => HostApplicationResult;
};

const initialManagedUsers: ManagedUser[] = [
  {
    id: 1,
    name: "Hà Minh",
    email: "minh@travelease.com",
    role: "admin",
    roles: ["admin"],
    hostStatus: "approved",
    totalListings: 12,
    lastActive: "5 phút trước",
    tier: "Diamond",
  },
  {
    id: 2,
    name: "Lan Anh",
    email: "lananh@journey.me",
    role: "traveler",
    roles: ["traveler"],
    hostStatus: "not_registered",
    totalListings: 0,
    lastActive: "1 giờ trước",
    tier: "Gold",
  },
  {
    id: 3,
    name: "Trần Khoa",
    email: "khoa.host@homestay.vn",
    role: "host",
    roles: ["host"],
    hostStatus: "approved",
    totalListings: 5,
    lastActive: "10 phút trước",
    pendingPayout: 4200000,
  },
  {
    id: 4,
    name: "Mỹ Duyên",
    email: "duyenflat@gmail.com",
    role: "host",
    roles: ["host"],
    hostStatus: "approved",
    totalListings: 3,
    lastActive: "25 phút trước",
    pendingPayout: 2100000,
  },
  {
    id: 5,
    name: "Minh Hằng",
    email: "hang@travelmail.com",
    role: "traveler",
    roles: ["traveler"],
    hostStatus: "not_registered",
    totalListings: 0,
    lastActive: "Hôm qua",
  },
  {
    id: 6,
    name: "Đỗ Hải Yến",
    email: "yen.renter@gmail.com",
    role: "traveler",
    roles: ["traveler"],
    hostStatus: "pending",
    totalListings: 0,
    lastActive: "2 ngày trước",
  },
];

const initialListings: PropertyListing[] = [
  {
    id: "listing-01",
    title: "Căn hộ The MarQ quận 1",
    city: "TP. HCM",
    hostId: 3,
    hostName: "Trần Khoa",
    status: "published",
    nightlyRate: 1800000,
    occupancy: 4,
    lastUpdated: "2024-12-10T09:00:00.000Z",
    views: 1340,
    inquiries: 32,
  },
  {
    id: "listing-02",
    title: "Villa sông Hàn Đà Nẵng",
    city: "Đà Nẵng",
    hostId: 4,
    hostName: "Mỹ Duyên",
    status: "pending_review",
    nightlyRate: 3500000,
    occupancy: 8,
    lastUpdated: "2024-12-11T05:45:00.000Z",
    views: 540,
    inquiries: 12,
  },
  {
    id: "listing-03",
    title: "Studio sát hồ Gươm",
    city: "Hà Nội",
    hostId: 4,
    hostName: "Mỹ Duyên",
    status: "published",
    nightlyRate: 950000,
    occupancy: 2,
    lastUpdated: "2024-12-09T12:15:00.000Z",
    views: 860,
    inquiries: 21,
  },
  {
    id: "listing-04",
    title: "Homestay ban công hoa giấy",
    city: "Đà Lạt",
    hostId: 3,
    hostName: "Trần Khoa",
    status: "rejected",
    nightlyRate: 1400000,
    occupancy: 3,
    lastUpdated: "2024-12-07T16:30:00.000Z",
    views: 410,
    inquiries: 5,
  },
];

const initialHostApplications: HostApplication[] = [
  {
    id: createId(),
    userId: 6,
    userName: "Đỗ Hải Yến",
    email: "yen.renter@gmail.com",
    phone: "0901 234 888",
    city: "Đà Nẵng",
    experience: "Đã quản lý homestay gia đình 2 năm",
    message: "Tôi đang chuẩn bị mở 2 căn hộ dịch vụ và muốn đăng tin nhanh chóng.",
    status: "pending",
    submittedAt: "2024-12-11T06:30:00.000Z",
  },
  {
    id: createId(),
    userId: 5,
    userName: "Minh Hằng",
    email: "hang@travelmail.com",
    phone: "0942 775 501",
    city: "Hà Nội",
    experience: "Sở hữu 2 căn shophouse, cần kênh cho thuê dài hạn",
    message: "Mong muốn hợp tác để quảng bá chuỗi lưu trú của gia đình.",
    status: "rejected",
    submittedAt: "2024-12-09T09:40:00.000Z",
  },
];

const initialActivity: ActivityLogEntry[] = [
  {
    id: createId(),
    type: "listing",
    title: "Duyệt căn hộ mới",
    description: "Căn hộ The MarQ đã được duyệt và công khai.",
    actor: "Hà Minh",
    createdAt: "2024-12-10T09:15:00.000Z",
  },
  {
    id: createId(),
    type: "host_application",
    title: "Yêu cầu trở thành host",
    description: "Đỗ Hải Yến gửi đơn đăng ký host.",
    actor: "Hệ thống",
    createdAt: "2024-12-11T06:30:00.000Z",
  },
];

const syncAuthUser = (userId: number, updates: Partial<ManagedUser>) => {
  const { user, patchUser } = useAuthStore.getState();
  if (!user || user.id !== userId) return;
  patchUser(updates);
};

export const useAdminPanelStore = create<AdminPanelState>()(
  persist(
    (set) => ({
      managedUsers: initialManagedUsers,
      propertyListings: initialListings,
      hostApplications: initialHostApplications,
      activityLog: initialActivity,

      assignUserRole: (userId, role) => {
        set((state) => {
          const nextUsers = state.managedUsers.map((user) => {
            if (user.id !== userId) return user;
            const roles = uniqueRoles([role, ...user.roles]);
            const hostStatus: HostStatus =
              role === "host"
                ? "approved"
                : roles.includes("host")
                  ? user.hostStatus
                  : user.hostStatus === "approved"
                    ? "not_registered"
                    : user.hostStatus;
            const updatedUser: ManagedUser = { ...user, role, roles, hostStatus };
            syncAuthUser(userId, updatedUser);
            return updatedUser;
          });

          const actor = useAuthStore.getState().user?.name ?? "Admin";
          const logEntry: ActivityLogEntry = {
            id: createId(),
            type: "role_update",
            title: "Cập nhật vai trò",
            description: `Đã chuyển người dùng #${userId} sang vai trò ${role}.`,
            actor,
            createdAt: new Date().toISOString(),
          };

          return {
            ...state,
            managedUsers: nextUsers,
            activityLog: [logEntry, ...state.activityLog],
          };
        });
      },

      updateListingStatus: (listingId, status) => {
        set((state) => {
          const listings = state.propertyListings.map((listing) =>
            listing.id === listingId ? { ...listing, status, lastUpdated: new Date().toISOString() } : listing
          );

          const entry: ActivityLogEntry = {
            id: createId(),
            type: "listing",
            title: "Cập nhật trạng thái tin",
            description: `Tin ${listingId} chuyển sang trạng thái ${status}.`,
            actor: useAuthStore.getState().user?.name ?? "Admin",
            createdAt: new Date().toISOString(),
          };

          return {
            ...state,
            propertyListings: listings,
            activityLog: [entry, ...state.activityLog],
          };
        });
      },

      updateHostApplication: (id, status) => {
        set((state) => {
          const applications = state.hostApplications.map((app) =>
            app.id === id ? { ...app, status } : app
          );
          const target = state.hostApplications.find((app) => app.id === id);
          const nextUsers = target
            ? state.managedUsers.map((user) => {
                if (user.id !== target.userId) return user;
                const hostStatus: HostStatus =
                  status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";
                const updatedUser: ManagedUser = {
                  ...user,
                  role: status === "approved" ? "host" : user.role,
                  roles: status === "approved" ? uniqueRoles([...user.roles, "host"]) : user.roles,
                  hostStatus,
                };
                syncAuthUser(user.id, updatedUser);
                return updatedUser;
              })
            : state.managedUsers;

          const entry: ActivityLogEntry = {
            id: createId(),
            type: "host_application",
            title: "Xử lý đơn đăng ký host",
            description: `Đơn của ${target?.userName ?? "người dùng"} đã ${status}.`,
            actor: useAuthStore.getState().user?.name ?? "Admin",
            createdAt: new Date().toISOString(),
          };

          return {
            ...state,
            hostApplications: applications,
            managedUsers: nextUsers,
            activityLog: [entry, ...state.activityLog],
          };
        });
      },

      registerHostApplication: (payload) => {
        let result: HostApplicationResult | null = null;

        set((state) => {
          const pending = state.hostApplications.find(
            (app) => app.userId === payload.userId && app.status === "pending"
          );

          if (pending) {
            result = { status: "already_pending", application: pending };
            return state;
          }

          const newApplication: HostApplication = {
            id: createId(),
            status: "pending",
            submittedAt: new Date().toISOString(),
            ...payload,
          };

          const existing = state.managedUsers.find((user) => user.id === payload.userId);
          const updatedUser: ManagedUser = existing
            ? { ...existing, hostStatus: "pending" }
            : {
                id: payload.userId,
                name: payload.userName,
                email: payload.email,
                role: "traveler",
                roles: ["traveler"],
                hostStatus: "pending",
                totalListings: 0,
                lastActive: "Vừa gửi đơn",
              };

          const users = existing
            ? state.managedUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
            : [...state.managedUsers, updatedUser];

          syncAuthUser(payload.userId, { hostStatus: "pending" });

          result = { status: "created", application: newApplication };

          const entry: ActivityLogEntry = {
            id: createId(),
            type: "host_application",
            title: "Đơn đăng ký host mới",
            description: `${payload.userName} gửi yêu cầu trở thành host.`,
            actor: payload.userName,
            createdAt: new Date().toISOString(),
          };

          return {
            ...state,
            hostApplications: [newApplication, ...state.hostApplications],
            managedUsers: users,
            activityLog: [entry, ...state.activityLog],
          };
        });

        return result!;
      },
    }),
    {
      name: "admin-panel-store",
      partialize: (state) => ({
        managedUsers: state.managedUsers,
        propertyListings: state.propertyListings,
        hostApplications: state.hostApplications,
        activityLog: state.activityLog,
      }),
    }
  )
);
