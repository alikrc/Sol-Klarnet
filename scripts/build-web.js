// Android paketi için web dosyalarını www/ klasörüne kopyalar (Capacitor webDir).
// Depo kökünde node_modules ve android/ olduğundan kök doğrudan webDir yapılamaz.
//
// Lisans derlemesi (isteğe bağlı; depodaki notalar/ değişmez, yalnız www/ etkilenir):
//   --lisans-temiz     docs/lisans-disla.csv'deki eserler www/notalar'a konmaz, www/notalar/index.json'dan çıkarılır
//   --lisans-belirsiz  docs/lisans-belirsiz.csv için aynısı (ikisi birlikte verilebilir)
// Listeler her derlemede yeniden okunur. Hatalı seçenek, boş liste ya da arşivde olmayan kimlik derlemeyi durdurur: telifli
// bir eserin sessizce pakete girmesindense derlemenin durması yeğdir.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "www");
const FILES = ["index.html", "app.css", "app.js", "nav.js", "i18n.js", "art.js", "core.js", "learn.js", "sources.js", "premium.js", "lessons.js", "videos.js", "skills.js", "repertoire.js", "trainers.js", "usuller.js", "sampler.js", "pieces.js", "band.js", "follow.js", "transcribe.js", "reading.js", "roadmap.js", "archive.js", "omrtemplates.js", "omr.js", "omrworker.js", "convert.js", "drills.js", "chartsheet.js", "lessonview.js", "teori.js", "sorunlar.js", "practice.js", "equip.js", "review.js", "onboard.js", "search.js", "nowplaying.js", "pcmring.js",
  "sw.js", "manifest.webmanifest", "icon.svg", "privacy.html"];
const DIRS = ["icons", "img", "fonts", "notalar", "vendor", "sounds"];
const LISTS = { "--lisans-temiz": "lisans-disla.csv", "--lisans-belirsiz": "lisans-belirsiz.csv" };

const args = process.argv.slice(2);
const bad = args.filter(a => !LISTS[a]);
if(bad.length){ console.error(`Bilinmeyen seçenek: ${bad.join(" ")} (geçerli: ${Object.keys(LISTS).join(", ")})`); process.exit(1); }

// CSV'nin ilk sütunu id'dir ve her satırda tırnaklıdır (scripts/lisans-disla.js böyle yazar)
function readIds(file){
  const lines = fs.readFileSync(path.join(ROOT, "docs", file), "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  if(lines[0].split(",")[0] !== "id") throw new Error(`${file}: ilk sütun id değil`);
  const ids = lines.slice(1).map(l => {
    const m = /^"([^"]+)",/.exec(l);
    if(!m) throw new Error(`${file}: okunamayan satır: ${l.slice(0, 80)}`);
    return m[1];
  });
  if(!ids.length) throw new Error(`${file}: liste boş`);
  return ids;
}

// Çıkarılacaklar www/ silinmeden önce denetlenir
const drop = new Set(), counts = [];
const index = JSON.parse(fs.readFileSync(path.join(ROOT, "notalar", "index.json"), "utf8"));
for(const a of new Set(args)){
  const ids = readIds(LISTS[a]), known = new Set(index.pieces.map(e => e.id));
  const lost = ids.filter(id => !known.has(id));
  if(lost.length) throw new Error(`${LISTS[a]}: arşivde olmayan ${lost.length} kimlik, ilki ${lost[0]}. Liste güncel değil: node scripts/lisans-disla.js`);
  ids.forEach(id => drop.add(id));
  counts.push(`${LISTS[a]} ${ids.length}`);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for(const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
const keep = src => !(drop.size && path.dirname(src) === path.join(ROOT, "notalar") && drop.has(path.basename(src, ".json")));
for(const d of DIRS) fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true, filter: keep });
console.log(`www/: ${FILES.length} dosya, ${DIRS.length} klasör`);

if(drop.size){
  const pieces = index.pieces.filter(e => !drop.has(e.id));
  fs.writeFileSync(path.join(OUT, "notalar", "index.json"), JSON.stringify({ ...index, pieces }));
  // Web sürümünde açılmış eserler önbellekte durur: önbellek adı listeye bağlanır ki eski önbellek silinsin (sw.js activate)
  const sw = path.join(OUT, "sw.js"), tag = crypto.createHash("sha1").update([...drop].sort().join("\n")).digest("hex").slice(0, 8);
  const text = fs.readFileSync(sw, "utf8"), next = text.replace(/const CACHE = "([^"]+)";/, `const CACHE = "$1-${tag}";`);
  if(next === text) throw new Error("sw.js: önbellek adı bulunamadı");
  fs.writeFileSync(sw, next);
  console.log(`Lisans derlemesi: ${counts.join(", ")}; ${drop.size} eser çıkarıldı, ${pieces.length} eser kaldı`);
}
