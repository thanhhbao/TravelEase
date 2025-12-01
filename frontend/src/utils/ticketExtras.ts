type PassengerExtra = {
  name: string;
  passport?: string;
  seat?: string;
};

type TicketExtras = {
  passengers: PassengerExtra[];
  seats?: string[];
};

const STORAGE_KEY = "travelease.ticket-extras";

const safeParse = (): Record<string, TicketExtras> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, TicketExtras>) : {};
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, TicketExtras>) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota errors
  }
};

export const rememberTicketExtras = (bookingId: number, extras: TicketExtras) => {
  const store = safeParse();
  store[String(bookingId)] = extras;
  writeStore(store);
};

export const readTicketExtras = (bookingId: number): TicketExtras | undefined => {
  const store = safeParse();
  return store[String(bookingId)];
};

export const readAllTicketExtras = (): Record<string, TicketExtras> => safeParse();
