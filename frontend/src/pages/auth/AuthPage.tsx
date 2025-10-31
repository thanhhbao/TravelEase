import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Plane, Palmtree, Ship } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/auth";
import { googleLogin } from "../../lib/api";

type Mode = "login" | "register";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuthStore();

  const urlMode: Mode = useMemo(
    () => (location.pathname.includes("register") ? "register" : "login"),
    [location.pathname]
  );
  const [mode, setMode] = useState<Mode>(urlMode);
  useEffect(() => setMode(urlMode), [urlMode]);

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

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "google_auth_failed") {
      setErr("Google authentication failed. Please try again or contact support if the issue persists.");
    }
  }, [searchParams]);

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
        const result = await register(form.name, email, form.password);
        if (result?.requiresVerification) {
          navigate(`/verify-email?email=${encodeURIComponent(result.email ?? email)}`, { replace: true });
          return;
        }
      }

      const redirectTo = searchParams.get("redirect") || "/my/bookings";
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      let message = "Something went wrong. Please try again.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as
          | {
              message?: string;
              errors?: Record<string, string[]>;
            }
          | undefined;

        if (status === 401) {
          message = data?.message ?? "Invalid email or password.";
        } else if (status === 422) {
          const errorMessages = data?.errors
            ? Object.values(data.errors).flat()
            : [];
          message =
            errorMessages[0] ||
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-blue-100 opacity-20 animate-float">
          <Plane className="w-32 h-32 transform rotate-45" />
        </div>
        <div className="absolute bottom-32 right-20 text-cyan-100 opacity-20 animate-float-delayed">
          <Palmtree className="w-40 h-40" />
        </div>
        <div className="absolute top-1/2 right-10 text-blue-100 opacity-15 animate-float-slow">
          <Ship className="w-28 h-28" />
        </div>
        
        {/* Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0 opacity-10">
          <svg viewBox="0 0 1440 320" className="w-full">
            <path fill="#0EA5E9" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg shadow-blue-200 animate-scale-in">
              <Plane className="w-10 h-10 text-white transform rotate-45" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              {isLogin ? "Welcome Back" : "Start Your Journey"}
            </h1>
            <p className="text-gray-600 text-lg">
              {isLogin ? "Sign in to explore amazing destinations" : "Create an account to begin your adventure"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-blue-100/50 p-8 border border-blue-100/50 animate-slide-up">
            <form onSubmit={onSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-slide-down">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 transition-colors duration-300 group-focus-within:text-blue-600 z-10" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      className="relative w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 hover:border-blue-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div className="animate-slide-down" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 transition-colors duration-300 group-focus-within:text-blue-600 z-10" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="relative w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 hover:border-blue-300"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="animate-slide-down" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 transition-colors duration-300 group-focus-within:text-blue-600 z-10" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    className="relative w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 hover:border-blue-300"
                    placeholder="Enter your password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-300 z-10"
                  >
                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="text-right animate-slide-down" style={{ animationDelay: '0.3s' }}>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-cyan-600 transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <div className="animate-slide-down" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 transition-colors duration-300 group-focus-within:text-blue-600 z-10" />
                    <input
                      type={showPwd2 ? "text" : "password"}
                      value={form.password_confirmation}
                      onChange={(e) => handleChange("password_confirmation", e.target.value)}
                      required
                      className="relative w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 hover:border-blue-300"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd2((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-300 z-10"
                    >
                      {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {err && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700 animate-shake">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <Plane className="w-5 h-5 transform rotate-45" />
                  </>
                )}
              </button>

              {/* Google Login Button */}
              {isLogin && (
                <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <button
                    onClick={googleLogin}
                    className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              )}
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Link
                  to={isLogin ? "/register" : "/login"}
                  className="font-semibold text-blue-600 hover:text-cyan-600 transition-colors duration-300"
                >
                  {isLogin ? "Sign up now" : "Sign in"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}