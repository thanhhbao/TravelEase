import { useState, type SyntheticEvent } from "react";

const DEFAULT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop";

type Props = {
  src: string;
  alt: string;
  className?: string;
  // ảnh dự phòng local (nên để trong public/)
  fallback?: string;
};

/**
 * SafeImage: - lazy loads image, falls back to a local placeholder on error,
 * - prefixes relative/relative-to-storage URLs with VITE_API_BASE_URL when configured
 * so that backend-relative paths (e.g. "storage/rooms/1.jpg" or "/storage/rooms/1.jpg")
 * are requested from the API server instead of the frontend dev server.
 */
export default function SafeImage({
  src,
  alt,
  className,
  fallback = DEFAULT_PLACEHOLDER,
}: Props) {
  const [err, setErr] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";

  const prefixIfNeeded = (value: string) => {
    if (!value) return value;

    // already absolute URL
    if (/^https?:\/\//i.test(value)) return value;

    // If value is an absolute path (starts with '/') and API_BASE is set,
    // prefix with API_BASE. If API_BASE is empty, leave it as-is (served by frontend public/).
    if (value.startsWith('/')) {
      if (API_BASE) return API_BASE.replace(/\/+$/, '') + value;
      return value; // keep as-is
    }

    // value is relative (no leading slash). If API_BASE set, prefix with it,
    // otherwise treat as local public asset (keep as-is).
    if (API_BASE) return API_BASE.replace(/\/+$/, '') + '/' + value;
    return value;
  };

  const resolvedFallback = prefixIfNeeded(fallback);
  const resolvedSrcRaw = prefixIfNeeded(src);
  const resolvedSrc =
    resolvedSrcRaw && resolvedSrcRaw.trim().length > 0
      ? resolvedSrcRaw
      : resolvedFallback;

  // tránh vòng lặp onError nếu fallback cũng lỗi
  const onError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!err) {
      setErr(true);
      (e.target as HTMLImageElement).src = resolvedFallback;
    }
  };

  return (
    <img
      src={err ? resolvedFallback : resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={onError}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}
