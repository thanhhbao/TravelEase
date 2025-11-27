import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore, type HostStatus, type UserRole } from "./auth";
import { assignUserRole as assignUserRoleApi, requestHostAccess as requestHostAccessApi, updateHostApplicationStatus, fetchAdminHostApplications, fetchAdminActivity, fetchAdminBookings, updateAdminBookingStatus } from "../lib/api";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const uniqueRoles = (roles: UserRole[]) => Array.from(new Set(roles));

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type BookingType = "hotel" | "flight" | "unknown";

export type Booking = {
  id: number;
  user_id: number;
  hotel_id?: number;
  room_id?: number;
  flight_id?: number;
  check_in?: string; // ISO date string
  check_out?: string; // ISO date string
  guests: number;
  total_price: number;
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  type: BookingType;
  // Eager-loaded relationships
  user?: ManagedUser;
  hotel?: PropertyListing;
  room?: RoomDetails;
  flight?: FlightDetails;
};

export type RoomDetails = {
  id: number;
  name: string;
  price: number;
  capacity: number;
};

export type FlightDetails = {
  id: number;
  airline: string;
  flight_number: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  class: string;
};

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
  monthlyRevenue: number;
  activeTenants: number;
  bookingsCount: number;
  images: string[];
};

export type HostApplication = {
  id: string;
  userId: number;
  userName: string;
  email: string;
  phone?: string;
  city?: string;
  inventory?: string;
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
  inventory?: string;
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
  adminBookings: Booking[];
  assignUserRole: (userId: number, role: UserRole, options?: { hostStatus?: HostStatus }) => Promise<void>;
  updateListingStatus: (listingId: string, status: ListingStatus) => void;
  updateHostApplication: (id: string, status: "approved" | "rejected") => Promise<void>;
  registerHostApplication: (payload: HostApplicationPayload) => Promise<HostApplicationResult>;
  createListing: (payload: {
    title: string;
    city: string;
    nightlyRate: number;
    occupancy: number;
    hostId: number;
    hostName: string;
    images?: string[];
  }) => Promise<PropertyListing>;
  loadHostApplications: (params?: {status?: string; search?: string; page?: number; per_page?: number}) => Promise<void>;
  loadActivityLogs: (params?: { page?: number; per_page?: number }) => Promise<void>;
  loadAdminBookings: (params?: { status?: string; user_id?: number; hotel_id?: number; type?: string; page?: number; per_page?: number }) => Promise<void>;
  updateBookingStatus: (id: number, status: BookingStatus) => Promise<void>;
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
    monthlyRevenue: 21000000,
    activeTenants: 6,
    bookingsCount: 18,
    images: [
      "https://images.unsplash.com/photo-1505692794400-5e0fd9c75a53?w=600",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600",
    ],
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
    monthlyRevenue: 0,
    activeTenants: 0,
    bookingsCount: 0,
    images: [
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=600",
    ],
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
    monthlyRevenue: 8400000,
    activeTenants: 2,
    bookingsCount: 11,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600",
    ],
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
    monthlyRevenue: 0,
    activeTenants: 0,
    bookingsCount: 0,
    images: [
      "https://images.unsplash.com/photo-1505692989986-c88027ec8afb?w=600",
    ],
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
    inventory: "3 - 5 listings",
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
    inventory: "1 - 2 listings",
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
    (set, get) => ({
      managedUsers: initialManagedUsers,
      propertyListings: initialListings,
      hostApplications: initialHostApplications,
      activityLog: initialActivity,
      adminBookings: [],

      assignUserRole: async (userId, role, options) => {
        const payload: { role: UserRole; host_status?: HostStatus | null } = { role };

        if (role === "host") {
          payload.host_status = options?.hostStatus === undefined ? null : options.hostStatus;
        }

        await assignUserRoleApi(userId, payload);

        set((state) => {
          const nextUsers = state.managedUsers.map((user) => {
            if (user.id !== userId) return user;
            const roles = uniqueRoles([role, ...user.roles]);
            const resolvedHostStatus: HostStatus =
              options?.hostStatus ??
              (role === "host"
                ? "approved"
                : user.hostStatus === "approved"
                  ? "not_registered"
                  : user.hostStatus);
            const updatedUser: ManagedUser = { ...user, role, roles, hostStatus: resolvedHostStatus };
            syncAuthUser(userId, { role, roles, hostStatus: resolvedHostStatus });
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

      updateHostApplication: async (id, status) => {
        // call admin API to update application status
        try {
          await updateHostApplicationStatus(id, { status });
        } catch (err) {
          console.error('Failed to update application status', err);
          throw err;
        }

        const target = get().hostApplications.find((app) => app.id === id);

        set((state) => {
          const applications = state.hostApplications.map((app) =>
            app.id === id ? { ...app, status } : app
          );

          const nextUsers = target
            ? state.managedUsers.map((user) => {
                if (user.id !== target.userId) return user;
                const hostStatus: HostStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';
                const updatedUser: ManagedUser = {
                  ...user,
                  role: status === 'approved' ? 'host' : user.role,
                  roles: status === 'approved' ? uniqueRoles([...user.roles, 'host']) : user.roles,
                  hostStatus,
                };
                syncAuthUser(user.id, { role: updatedUser.role, roles: updatedUser.roles, hostStatus });
                return updatedUser;
              })
            : state.managedUsers;

          const entry: ActivityLogEntry = {
            id: createId(),
            type: 'host_application',
            title: 'Xử lý đơn đăng ký host',
            description: `Đơn của ${target?.userName ?? 'người dùng'} đã ${status}.`,
            actor: useAuthStore.getState().user?.name ?? 'Admin',
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

      registerHostApplication: async (payload) => {
        const existingPending = get().hostApplications.find(
          (app) => app.userId === payload.userId && app.status === 'pending'
        );

        if (existingPending) {
          return { status: 'already_pending', application: existingPending };
        }

        // Call backend to create application and set user host_status
        const res = await requestHostAccessApi({
          phone: payload.phone,
          city: payload.city,
          experience: payload.experience,
          inventory: payload.inventory,
          message: payload.message,
        }).then((r) => r.data);

        let application = null;
        if (res?.application) {
          application = res.application;
        }

        // fallback to local creation if backend didn't return application
        const newApplication =
          application ?? {
            id: createId(),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            ...payload,
          };

        set((state) => {
          const existing = state.managedUsers.find((user) => user.id === payload.userId);
          const updatedUser: ManagedUser = existing
            ? { ...existing, hostStatus: 'pending' }
            : {
                id: payload.userId,
                name: payload.userName,
                email: payload.email,
                role: 'traveler',
                roles: ['traveler'],
                hostStatus: 'pending',
                totalListings: 0,
                lastActive: 'Just applied',
              };

          const users = existing
            ? state.managedUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
            : [...state.managedUsers, updatedUser];

          syncAuthUser(payload.userId, { hostStatus: 'pending' });

          const entry: ActivityLogEntry = {
            id: createId(),
            type: 'host_application',
            title: 'Đơn đăng ký host mới',
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

          return { status: application ? 'created' : 'created_local', application: newApplication } as HostApplicationResult;
      },
      loadHostApplications: async (params?: {status?: string; search?: string; page?: number; per_page?: number}) => {
        try {
          const p = params ?? { per_page: 20 };
          const { data } = await fetchAdminHostApplications(p).then((r) => r.data);
          const apps = data.data ?? data;
          set((state) => ({ ...state, hostApplications: apps }));
        } catch (err) {
          console.error('Failed to load host applications', err);
        }
      },
      loadActivityLogs: async (params?: { page?: number; per_page?: number }) => {
        try {
          const p = params ?? { per_page: 30 };
          const { data } = await fetchAdminActivity(p).then((r) => r.data);
          const items = data.data ?? data;
          set((state) => ({ ...state, activityLog: items }));
        } catch (err) {
          console.error('Failed to load activity logs', err);
        }
      },
      createListing: async ({ title, city, nightlyRate, occupancy, hostId, hostName, images }) => {
        const newListing: PropertyListing = {
          id: createId(),
          title,
          city,
          nightlyRate,
          occupancy,
          hostId,
          hostName,
          status: "pending_review",
          lastUpdated: new Date().toISOString(),
          views: 0,
          inquiries: 0,
          monthlyRevenue: 0,
          activeTenants: 0,
          bookingsCount: 0,
          images: images?.length ? images : [],
        };

        set((state) => {
          const entry: ActivityLogEntry = {
            id: createId(),
            type: "listing",
            title: "Tin mới chờ duyệt",
            description: `${hostName} vừa tạo tin "${title}".`,
            actor: hostName,
            createdAt: new Date().toISOString(),
          };

          return {
            ...state,
            propertyListings: [newListing, ...state.propertyListings],
            activityLog: [entry, ...state.activityLog],
          };
        });

        return newListing;
      },
      loadAdminBookings: async (params?: { status?: string; user_id?: number; hotel_id?: number; type?: string; page?: number; per_page?: number }) => {
        try {
          const p = params ?? { per_page: 10 };
          const { data } = await fetchAdminBookings(p).then((r) => r.data);
          const bookings = data.data ?? data;
          set((state) => ({ ...state, adminBookings: bookings }));
        } catch (err) {
          console.error('Failed to load admin bookings', err);
        }
      },
      updateBookingStatus: async (id: number, status: BookingStatus) => {
        try {
          await updateAdminBookingStatus(id, { status });
          set((state) => ({
            ...state,
            adminBookings: state.adminBookings.map((booking) =>
              booking.id === id ? { ...booking, status, updated_at: new Date().toISOString() } : booking
            ),
          }));
          const actor = useAuthStore.getState().user?.name ?? "Admin";
          const logEntry: ActivityLogEntry = {
            id: createId(),
            type: "listing", // or a new type for booking updates if desired
            title: "Cập nhật trạng thái đặt phòng",
            description: `Đặt phòng #${id} đã chuyển sang trạng thái ${status}.`,
            actor,
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ ...state, activityLog: [logEntry, ...state.activityLog] }));
        } catch (err) {
          console.error('Failed to update booking status', err);
          throw err;
        }
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
