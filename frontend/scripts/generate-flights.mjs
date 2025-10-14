// scripts/generate-flights.mjs
import { writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/** ====== Paths ====== */
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/mock");
const outPath = resolve(outDir, "flights.json");

/** ====== Config nhanh ====== */
const COUNT = Number(process.argv[2]) || 160;   // số chuyến tạo (có thể truyền qua CLI)
const DAY_SPAN = 21;                             // trong vòng X ngày tới

/** ====== Airline domain map (để build URL logo) ====== */
const AIRLINE_DOMAINS = {
  "American Airlines": "americanairlines.com",
  "Delta Air Lines": "delta.com",
  "United Airlines": "united.com",
  "JetBlue Airways": "jetblue.com",
  "Southwest Airlines": "southwest.com",
  "Alaska Airlines": "alaskaair.com",
  "Spirit Airlines": "spirit.com",
  "Frontier Airlines": "flyfrontier.com",
  "Hawaiian Airlines": "hawaiianairlines.com",
  "Allegiant Air": "allegiantair.com",
  "Air Canada": "aircanada.com",
  "British Airways": "britishairways.com",
  "Lufthansa": "lufthansa.com",
  "Emirates": "emirates.com",
  "Qatar Airways": "qatarairways.com",
};

const airlines = Object.keys(AIRLINE_DOMAINS);

/** ====== Sân bay phổ biến (IATA) ====== */
const airports = [
  "JFK","LGA","EWR","LAX","SFO","SAN","SEA","PDX","ORD","MDW","DFW","DAL",
  "IAH","AUS","DEN","PHX","LAS","SLC","ATL","MCO","MIA","FLL","TPA","BOS",
  "IAD","DCA","CLT","BWI","DTW","MSP","PHL","RDU","BNA","SJC","SMF","HNL"
];

/** ====== Utils ====== */
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function randomDifferentIndex(max, notIdx) {
  let i = rand(0, max);
  while (i === notIdx) i = rand(0, max);
  return i;
}

function isoAtLocalDate(localDate, hour, minute) {
  // Tạo ISO theo mốc giờ địa phương nhưng output là UTC ISO (Z)
  const d = new Date(localDate);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function localYMD(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // Lấy YYYY-MM-DD theo local
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function initials2(name) {
  // Lấy 2 ký tự đầu của 2 từ đầu tiên
  const parts = name.split(/\s+/).filter(Boolean);
  const a = (parts[0]?.[0] || "").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return (a + b).slice(0, 2) || "XX";
}

function buildLogos(airline) {
  const domain = AIRLINE_DOMAINS[airline];
  if (!domain) {
    return {
      logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&auto=format&fit=crop",
      logoAlt: "",
    };
  }
  return {
    // Đẹp nhưng có thể bị ad-block chặn
    logo: `https://logo.clearbit.com/${domain}?size=128`,
    // Fallback rất ít bị chặn
    logoAlt: `https://www.google.com/s2/favicons?sz=128&domain_url=${domain}`,
  };
}

/** ====== Gen 1 chuyến bay ====== */
function makeFlight(id) {
  const airline = airlines[rand(0, airlines.length - 1)];

  const fromIdx = rand(0, airports.length - 1);
  const toIdx = randomDifferentIndex(airports.length - 1, fromIdx);

  // Ngẫu nhiên trong N ngày tới
  const day = localYMD(rand(0, DAY_SPAN));
  // Slot giờ bay
  const depHour = rand(5, 22);
  const depMin = [0, 10, 15, 20, 30, 40, 45, 50][rand(0, 7)];
  // Duration ngẫu nhiên 80–420 phút
  const durationMin = rand(80, 420);

  const departureTime = isoAtLocalDate(day, depHour, depMin);
  const arrival = new Date(departureTime);
  arrival.setMinutes(arrival.getMinutes() + durationMin);
  const arrivalTime = arrival.toISOString();

  // Giá tuỳ biến nhẹ theo “khoảng cách” giả (khác vùng -> giá cao hơn)
  const longHaulHint =
    ["HNL","SEA","PDX","SFO","SAN","LAX"].includes(airports[fromIdx]) !==
    ["HNL","SEA","PDX","SFO","SAN","LAX"].includes(airports[toIdx]);
  const base = longHaulHint ? rand(199, 899) : rand(79, 399);
  const price = base - (base % 1); // integer USD

  const seatsAvailable = rand(5, 40);
  const code = initials2(airline);
  const flightNumber = `${code}${rand(100, 9999)}`;

  const { logo, logoAlt } = buildLogos(airline);

  return {
    id,
    airline,
    flightNumber,
    fromAirport: airports[fromIdx],
    toAirport: airports[toIdx],
    departureTime,
    arrivalTime,
    durationMin,
    price,
    seatsAvailable,
    logo,     // URL Clearbit (có thể bị chặn bởi ad-block)
    logoAlt,  // Fallback Google favicon (ít bị chặn)
  };
}

/** ====== Main ====== */
const rows = Array.from({ length: COUNT }, (_, i) => makeFlight(i + 1));

await mkdir(outDir, { recursive: true });
await writeFile(outPath, JSON.stringify(rows, null, 2), "utf8");

console.log(`✅ Generated ${rows.length} flights -> ${outPath}`);
console.log("   Hint: run with custom count, e.g. `node scripts/generate-flights.mjs 300`");
