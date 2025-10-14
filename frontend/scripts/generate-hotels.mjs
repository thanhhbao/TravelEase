// scripts/generate-hotels.mjs
// Chạy: node scripts/generate-hotels.mjs
import fs from "fs";
import path from "path";

// ---- 1) ẢNH UNSPLASH: photo IDs cố định ----
// Có thể thêm/bớt tuỳ ý. Script sẽ xoay vòng theo modulo.
const UNSPLASH_EXTERIOR_IDS = [
  "1566073771259-6a8506099945", // khách sạn city view
  "1582719478250-c89cae4dc85b",
  "1551882547-ff40c63fe5fa",
  "1542314831-068cd1dbfeeb",
  "1571896349842-33c89424de2d",
  "1445019980597-93fa8acb246c",
  "1520250497591-112f2f40a3f4",
  "1564501049412-61c2a3083791",
  "1587061949409-02df41d5e562",
  "1613490493576-7fde63acd811", // facade
  "1631049307264-da0ec9d70304",
  "1582719478250-c89cae4dc85b", // lặp lại để đủ vòng
];

const UNSPLASH_ROOM_IDS = [
  "1631049307264-da0ec9d70304", // phòng 1
  "1582719478250-c89cae4dc85b",
  "1631049307264-da0ec9d70304",
  "1520250497591-112f2f40a3f4",
  "1566073771259-6a8506099945",
  "1551882547-ff40c63fe5fa",
  "1542314831-068cd1dbfeeb",
  "1571896349842-33c89424de2d",
  "1564501049412-61c2a3083791",
  "1587061949409-02df41d5e562",
  "1613490493576-7fde63acd811",
  "1445019980597-93fa8acb246c",
];

// Hàm tạo URL Unsplash ổn định theo ID
const unsplash = (id, w = 1600, h = 1067, q = 80) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;

// ---- 2) DATASET THÀNH PHỐ ----
const vnCities = [
  "Hồ Chí Minh","Hà Nội","Đà Nẵng","Hạ Long","Huế","Nha Trang","Phú Quốc",
  "Đà Lạt","Quy Nhơn","Vũng Tàu","Sa Pa","Ninh Bình","Cần Thơ","Hội An",
  "Pleiku","Buôn Ma Thuột","Tuy Hòa","Phan Thiết","Cam Ranh","Biên Hòa",
  "Thủ Dầu Một","Tây Ninh","Hải Phòng","Quảng Ninh","Thanh Hóa","Vinh",
  "Hà Tĩnh","Đồng Hới","Quảng Ngãi","Long Xuyên","Châu Đốc","Rạch Giá",
  "Cà Mau","Bạc Liêu","Sóc Trăng","Mỹ Tho","Bến Tre","Vĩnh Long","Trà Vinh",
  "Kon Tum","Sơn La","Điện Biên Phủ","Lạng Sơn","Cao Bằng","Bắc Ninh","Bắc Giang",
  "Hải Dương","Nam Định","Thái Bình"
];
const intl = [
  ["New York","USA"],["Miami","USA"],["San Francisco","USA"],["Los Angeles","USA"],
  ["London","UK"],["Paris","France"],["Rome","Italy"],["Barcelona","Spain"],
  ["Zurich","Switzerland"],["Vienna","Austria"],["Prague","Czechia"],
  ["Tokyo","Japan"],["Osaka","Japan"],["Seoul","South Korea"],
  ["Bangkok","Thailand"],["Phuket","Thailand"],["Singapore","Singapore"],
  ["Kuala Lumpur","Malaysia"],["Sydney","Australia"],["Dubai","UAE"]
];

// ---- 3) TIỆN ÍCH & TÊN ----
const namesA = ["Grand","Royal","Elite","Majestic","Premier","Signature","Aurora","Serenity","Regency","Crown"];
const namesB = ["Resort","Hotel","Suites","Palace","Retreat","Collection","Residences","Lodge","Villa","Boutique"];
const roomNames = ["Deluxe Room","Executive Room","Junior Suite","Family Suite","Panoramic Suite"];
const bedOpts = ["1 King Bed","2 Twin Beds","1 Queen Bed","1 King + Sofa Bed"];
const amenitiesPool = ["WiFi","Parking","Restaurant","Bar","Pool","Spa","Gym","Room Service","Concierge","Breakfast Included","Rooftop"];

const rand = (n) => Math.floor(Math.random() * n);
const choice = (a) => a[rand(a.length)];
const slugify = (s) => s
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

const priceBetween = (min, max) => {
  const step = 5;
  const raw = min + Math.random() * (max - min);
  return Math.max(min, Math.min(max, Math.round(raw / step) * step));
};

// ---- 4) BUILD HOTEL ----
function buildHotel(i, city, country) {
  const name = `${choice(namesA)} ${city} ${choice(namesB)}`;
  const s = slugify(`${name}-${city}-${country}`);
  const roomsCount = 3 + rand(3); // 3..5 phòng

  // chọn ID ảnh theo modulo để ổn định
  const extId = UNSPLASH_EXTERIOR_IDS[i % UNSPLASH_EXTERIOR_IDS.length];

  return {
    id: i + 1,
    slug: `${s}-${i+1}`,
    name,
    city,
    country,
    stars: 3 + rand(3),               // 3..5 sao
    pricePerNight: priceBetween(80, 520),
    thumbnail: unsplash(extId, 1600, 1067),
    images: [
      unsplash(UNSPLASH_EXTERIOR_IDS[(i) % UNSPLASH_EXTERIOR_IDS.length]),
      unsplash(UNSPLASH_EXTERIOR_IDS[(i+3) % UNSPLASH_EXTERIOR_IDS.length]),
      unsplash(UNSPLASH_EXTERIOR_IDS[(i+6) % UNSPLASH_EXTERIOR_IDS.length]),
    ],
    description: `Experience refined comfort at ${name} in ${city}, ${country}.`,
    amenities: amenitiesPool.sort(()=>0.5-Math.random()).slice(0, 5 + rand(3)),
    rooms: Array.from({ length: roomsCount }).map((_, r) => ({
      id: r + 1,
      name: choice(roomNames),
      beds: choice(bedOpts),
      maxGuests: 2 + rand(3),
      price: priceBetween(60, 560),
      images: [
        unsplash(UNSPLASH_ROOM_IDS[(i + r) % UNSPLASH_ROOM_IDS.length], 1400, 900),
        unsplash(UNSPLASH_ROOM_IDS[(i + r + 4) % UNSPLASH_ROOM_IDS.length], 1400, 900),
        unsplash(UNSPLASH_ROOM_IDS[(i + r + 8) % UNSPLASH_ROOM_IDS.length], 1400, 900),
      ]
    }))
  };
}

// ---- 5) TẠO 50 VN + 60 quốc tế ----
const hotels = [];
let idx = 0;
for (let c of vnCities.slice(0, 50)) hotels.push(buildHotel(idx++, c, "Vietnam"));
for (let k = 0; k < 60; k++) {
  const [c, country] = choice(intl);
  hotels.push(buildHotel(idx++, c, country));
}

// ---- 6) GHI JSON ----
const outFile = path.resolve(process.cwd(), "public/mock/hotels.json");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(hotels, null, 2), "utf-8");
console.log(`Generated ${hotels.length} hotels (Unsplash photo IDs, fixed) → ${outFile}
Note: Please add attribution to Unsplash in your footer (Photo credits recommended).`);
