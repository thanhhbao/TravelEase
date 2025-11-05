const STORAGE_KEY = 'travelease.booking-previews';

type PreviewCache = Record<string, string>;

const hasWindow = typeof window !== 'undefined';

const readCache = (): PreviewCache => {
  if (!hasWindow) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as PreviewCache;
    }
  } catch {
    // ignore parse errors and fall back to empty cache
  }

  return {};
};

const writeCache = (cache: PreviewCache) => {
  if (!hasWindow) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
};

export const rememberBookingPreview = (bookingId: number, image: string) => {
  if (!hasWindow) return;
  if (!image || typeof image !== 'string' || image.trim().length === 0) return;

  const cache = readCache();
  cache[String(bookingId)] = image;
  writeCache(cache);
};

export const getBookingPreview = (bookingId: number): string | undefined => {
  const cache = readCache();
  return cache[String(bookingId)];
};

export const forgetBookingPreview = (bookingId: number) => {
  if (!hasWindow) return;
  const cache = readCache();
  if (cache[String(bookingId)] !== undefined) {
    delete cache[String(bookingId)];
    writeCache(cache);
  }
};
