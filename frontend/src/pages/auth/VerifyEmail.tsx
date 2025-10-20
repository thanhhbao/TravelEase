import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../store/auth";

export default function VerifyEmail() {
  const { user, verifyEmail, resendEmailVerification } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailFromQuery = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams]
  );

  const [email, setEmail] = useState(user?.email ?? emailFromQuery);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const canResend = Boolean(user);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const verified = await verifyEmail(email.trim(), code.trim());
      setMessage("Your email has been verified successfully.");

      if (verified?.email_verified_at) {
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "The verification code is invalid or has expired."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setMessage("");
    setError("");
    setIsResending(true);

    try {
      await resendEmailVerification();
      setMessage("A new verification code has been sent to your email.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Unable to send verification code right now."
        );
      } else {
        setError("Unable to send verification code right now.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the 6-digit code we sent to your inbox to activate your
            account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="input-field tracking-widest text-lg text-center"
              placeholder="123456"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {isSubmitting && (
              <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            )}
            <span>Verify email</span>
          </button>
        </form>

        <div className="text-sm text-gray-600 text-center">
          Didn’t receive a code?{" "}
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-gray-900 font-semibold hover:text-gray-700 disabled:opacity-60"
            >
              {isResending ? "Sending..." : "Send again"}
            </button>
          ) : (
            <span className="text-gray-500">
              Log in to request a new code.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
