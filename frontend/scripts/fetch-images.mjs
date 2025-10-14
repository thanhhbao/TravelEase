// scripts/fetch-images.mjs
// Chạy: node scripts/fetch-images.mjs
import fs from "fs";
import path from "path";
import https from "https";

const EXTERIORS = 80;   // số ảnh mặt ngoài
const ROOMS = 150;      // số ảnh phòng
const OUT_DIR_EXT = path.resolve(process.cwd(), "public/images/exteriors");
const OUT_DIR_ROOM = path.resolve(process.cwd(), "public/images/rooms");

// Tạo URL ổn định cho từng seed (Picsum luôn trả 200)
function picsumUrl(seed, w=1600, h=1067) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}.jpg`;
}

function fetchToFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve(dest)));
      file.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadBatch(count, outDir, prefix) {
  fs.mkdirSync(outDir, { recursive: true });
  let saved = 0;
  for (let i = 1; i <= count; i++) {
    const seed = `${prefix}-${i}`;
    const url = picsumUrl(seed, 1600, 1067);
    const fp = path.join(outDir, `${prefix}-${i}.jpg`);
    try {
      await fetchToFile(url, fp);
      console.log(`✓ ${prefix} ${i}/${count}`);
      saved++;
    } catch (e) {
      console.warn(`× ${prefix} ${i}: ${e.message}`);
    }
  }
  console.log(`Done: ${saved} files at ${outDir}`);
}

(async () => {
  await downloadBatch(EXTERIORS, OUT_DIR_EXT, "ext");
  await downloadBatch(ROOMS, OUT_DIR_ROOM, "room");
  console.log("All images fetched (Picsum).");
})();
