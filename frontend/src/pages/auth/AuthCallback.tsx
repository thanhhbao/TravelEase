import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthToken } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAuthStore } from "../../store/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useAuth();
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const login = searchParams.get("login");
      const error = searchParams.get("error");

      if (error) {
        console.error("Google auth failed:", error);
        navigate("/login?error=google_auth_failed");
        return;
      }

      if (token) {
        setAuthToken(token);
        await Promise.all([
          refresh(),
          bootstrap(),
        ]);
        navigate("/my/bookings", { replace: true });
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, refresh, bootstrap]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
