// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean; // mặc định false
}

export default function ProtectedRoute({ children, requireVerified = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, isBootstrapping } = useAuthStore();

  // Đang bootstrapping (gọi /api/user) => hiển thị loading để tránh nháy
  if (isBootstrapping) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
      </div>
    );
  }

  // Chưa đăng nhập => chuyển tới /login và mang theo return url
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Yêu cầu email verified nhưng user chưa verify => chuyển tới /verify-email
  if (requireVerified && user && !user.email_verified_at) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}
