export type Airport = {
  iata: string;
  code?: string;
  city: string;
  name: string;
  country: string;
};

export type RegionKey =
  | "VIETNAM"
  | "DONG_BAC_A"
  | "DONG_NAM_A"
  | "DONG_DUONG"
  | "NAM_A"
  | "CHAU_AU"
  | "CHAU_UC"
  | "BAC_MY";

export const REGION_LABEL: Record<RegionKey, string> = {
  VIETNAM: "VIỆT NAM",
  DONG_BAC_A: "ĐÔNG BẮC Á",
  DONG_NAM_A: "ĐÔNG NAM Á",
  DONG_DUONG: "ĐÔNG DƯƠNG",
  NAM_A: "NAM Á",
  CHAU_AU: "CHÂU ÂU",
  CHAU_UC: "CHÂU ÚC",
  BAC_MY: "BẮC MỸ",
};

const COUNTRY_TO_REGION: Record<string, RegionKey> = {
  Vietnam: "VIETNAM",
  "South Korea": "DONG_BAC_A",
  Japan: "DONG_BAC_A",
  "Hong Kong": "DONG_BAC_A",
  Taiwan: "DONG_BAC_A",
  China: "DONG_BAC_A",
  Singapore: "DONG_NAM_A",
  Malaysia: "DONG_NAM_A",
  Thailand: "DONG_NAM_A",
  Laos: "DONG_DUONG",
  Cambodia: "DONG_DUONG",
  India: "NAM_A",
  "United Kingdom": "CHAU_AU",
  France: "CHAU_AU",
  Netherlands: "CHAU_AU",
  Germany: "CHAU_AU",
  Switzerland: "CHAU_AU",
  Spain: "CHAU_AU",
  Italy: "CHAU_AU",
  Australia: "CHAU_UC",
  "New Zealand": "CHAU_UC",
  "United States": "BAC_MY",
  Canada: "BAC_MY",
  Mexico: "BAC_MY",
};

export const regionOf = (country: string): RegionKey =>
  COUNTRY_TO_REGION[country] ?? "CHAU_AU";

export const AIRPORTS: Airport[] = [
  { iata: "HAN", city: "Hà Nội", name: "Nội Bài", country: "Vietnam" },
  { iata: "SGN", city: "TP. Hồ Chí Minh", name: "Tân Sơn Nhất", country: "Vietnam" },
  { iata: "DAD", city: "Đà Nẵng", name: "Đà Nẵng", country: "Vietnam" },
  { iata: "PQC", city: "Phú Quốc", name: "Phú Quốc", country: "Vietnam" },
  { iata: "CXR", city: "Nha Trang", name: "Cam Ranh", country: "Vietnam" },
  { iata: "ICN", city: "Seoul", name: "Incheon", country: "South Korea" },
  { iata: "NRT", city: "Tokyo", name: "Narita", country: "Japan" },
  { iata: "SIN", city: "Singapore", name: "Changi", country: "Singapore" },
  { iata: "KUL", city: "Kuala Lumpur", name: "KUL Intl", country: "Malaysia" },
  { iata: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Thailand" },
  { iata: "DEL", city: "New Delhi", name: "Indira Gandhi", country: "India" },
  { iata: "LHR", city: "London", name: "Heathrow", country: "United Kingdom" },
  { iata: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France" },
  { iata: "AMS", city: "Amsterdam", name: "Schiphol", country: "Netherlands" },
  { iata: "FRA", city: "Frankfurt", name: "Frankfurt Main", country: "Germany" },
  { iata: "ZRH", city: "Zurich", name: "Zurich", country: "Switzerland" },
  { iata: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Australia" },
  { iata: "JFK", city: "New York", name: "John F. Kennedy", country: "United States" },
  { iata: "LAX", city: "Los Angeles", name: "Los Angeles Intl", country: "United States" },
  { iata: "YYZ", city: "Toronto", name: "Pearson", country: "Canada" },
];

export const groupAirportsByRegion = (list: Airport[]) => {
  const map: Record<RegionKey, Airport[]> = {
    VIETNAM: [], DONG_BAC_A: [], DONG_NAM_A: [], DONG_DUONG: [],
    NAM_A: [], CHAU_AU: [], CHAU_UC: [], BAC_MY: [],
  };
  list.forEach((a) => {
    const region = regionOf(a.country);
    map[region].push(a);
  });
  return map;
};
