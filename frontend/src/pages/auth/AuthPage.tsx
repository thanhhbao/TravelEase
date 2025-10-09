import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/auth";

type Mode = "login" | "register";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuthStore();

  // /register => "register", còn lại => "login"
  const urlMode: Mode = useMemo(
    () => (location.pathname.includes("register") ? "register" : "login"),
    [location.pathname]
  );
  const [mode, setMode] = useState<Mode>(urlMode);
  useEffect(() => setMode(urlMode), [urlMode]);

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (k: string, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (err) setErr("");
  };

  const isLogin = mode === "login";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErr("");
    setLoading(true);

    try {
      const email = form.email.trim();
      if (isLogin) {
        await login(email, form.password);
      } else {
        if (form.password !== form.password_confirmation) {
          setErr("Password confirmation does not match.");
          return;
        }
        await register(form.name, email, form.password);
      }

      const redirectTo = searchParams.get("redirect") || "/my/bookings";
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      let message = "Something went wrong. Please try again.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data: any = error.response?.data;

        // Ưu tiên lỗi chi tiết từ backend
        if (status === 401) {
          message = data?.message ?? "Invalid email or password.";
        } else if (status === 422) {
          message =
            data?.errors?.email?.[0] ||
            data?.errors?.password?.[0] ||
            data?.errors?.name?.[0] ||
            data?.message ||
            "Please check your input and try again.";
        } else if (data?.message) {
          message = data.message;
        }
      }

      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <Link to="/register" className="font-medium text-gray-900 hover:text-gray-700">
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have one?{" "}
                <Link to="/login" className="font-medium text-gray-900 hover:text-gray-700">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="input-field pl-10"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                className="input-field pl-10 pr-10"
                placeholder="Enter password"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPwd2 ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={(e) => handleChange("password_confirmation", e.target.value)}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {err && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>{isLogin ? "Sign in" : "Create account"}</>
            )}
          </button>

          {isLogin && (
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                Forgot your password?
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
