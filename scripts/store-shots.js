// Mağaza malzemeleri: telefon ekran görüntüleri (store/screens/, 1080×2160 civarı, Play'in 2:1 sınırında) ve
// 1024×500 tanıtım görseli (store/feature-graphic.png). Uygulama yerel bir sunucudan açılır, gösterim için örnek
// ilerleme yüklenir; Akort ve Kayıt ekranları sahte mikrofona verilen sentetik klarnet sesiyle çekilir.
// Çalıştırma: npm run store-shots  (Playwright ve Chromium gerekir: npm i -D playwright && npx playwright install chromium)
const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");

let chromium;
try{ ({ chromium } = require("playwright")); }
catch(e){ console.error("Playwright bulunamadı: npm i -D playwright && npx playwright install chromium"); process.exit(1); }

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "store", "screens");
const TYPES = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml",
  ".png":"image/png", ".woff2":"font/woff2", ".webmanifest":"application/manifest+json" };

// Sentetik klarnet sesi (WAV): yazılı notalar [w, sn], Sol klarnet tam dörtlü pes duyulur; hafif vibrato
function toneWav(file, seq){
  const sr = 48000, xs = [];
  for(const [w, sec] of seq){
    const n = Math.round(sr*sec), f = w == null ? 0 : 440*Math.pow(2, (w - 5 - 69 + 0.04)/12);
    let ph = 0;
    for(let k=0;k<n;k++){
      if(!f){ xs.push(0); continue; }
      ph += 2*Math.PI*f*(1 + 0.004*Math.sin(2*Math.PI*5.5*k/sr))/sr;
      const env = Math.min(1, k/900, (n - k)/900);
      xs.push(0.3*env*(Math.sin(ph) + Math.sin(3*ph)/3 + Math.sin(5*ph)/5));
    }
  }
  const b = Buffer.alloc(44 + xs.length*2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + xs.length*2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr*2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(xs.length*2, 40);
  xs.forEach((x, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x))*30000), 44 + i*2));
  fs.writeFileSync(file, b);
}

// Gösterim için örnek ilerleme: ilk 30 ders bitmiş, 12 günlük seri, birkaç rekor
function seedScript(){
  return `(() => {
    const day = d => { const x = new Date(); x.setDate(x.getDate() - d); return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0"); };
    const prog = {};
    LESSONS.slice(0, 30).forEach((l, i) => { prog[l.id] = { s:{}, d: day(40 - i) }; l.steps.forEach((s, k) => prog[l.id].s[k] = { v:1, ok:true }); });
    for(const u of ["baslangic", "temel", "klarino"]){ const ex = examFor(u); prog[ex.id] = { s:{}, d: day(20) }; ex.steps.forEach((s, k) => prog[ex.id].s[k] = { v:1, ok:true }); }
    const days = {}; for(let i=0;i<40;i++) if(i < 12 || i % 3) days[day(i)] = 900 + (i*137 % 900);
    const set = (k, v) => localStorage.setItem("sk." + k, JSON.stringify(v));
    set("lesson.prog", prog); set("days", days); set("onboard.done", true); set("goal.min", 15);
    set("lesson.dailyDone", Array.from({ length:18 }, (_, i) => day(i)));
    set("long.best", { 67:{ score:72 }, 69:{ score:68 }, 74:{ score:64 } }); set("rhythm.best", 78); set("ear.best", { pitch:1.5, makam:4 });
    set("lesson.cur", "daily"); set("band.usul", "roman"); set("band.mk", "hicaz");
  })()`;
}

async function main(){
  fs.mkdirSync(OUT, { recursive: true });
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]), f = path.join(ROOT, u === "/" ? "index.html" : u);
    if(!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
  }).listen(0);
  const base = "http://localhost:" + srv.address().port + "/";
  const wav = path.join(os.tmpdir(), "sol-klarnet-shots.wav");
  toneWav(wav, [[74, 2.5], [null, 0.3], [72, 0.6], [74, 0.6], [76, 0.6], [77, 0.6], [79, 1.2], [null, 0.3], [77, 0.6], [76, 0.6], [74, 1.5], [null, 0.4]]);
  const browser = await chromium.launch({ args:["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
    "--use-file-for-fake-audio-capture=" + wav, "--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport:{ width:411, height:822 }, deviceScaleFactor:2.625, isMobile:true, hasTouch:true,
    permissions:["microphone"], colorScheme:"light", locale:"tr-TR" });
  const page = await ctx.newPage();
  page.on("pageerror", e => console.error("sayfa hatası:", e.message));
  await page.goto(base + "index.html");
  await page.evaluate(seedScript());
  const shot = async (name, url, prep) => {
    await page.goto(base + url); await page.waitForTimeout(1200);
    if(prep) await prep();
    await page.screenshot({ path: path.join(OUT, name + ".png") });
    console.log("store/screens/" + name + ".png");
  };
  await shot("1-akort", "index.html?view=tune", async () => {
    await page.click("#btn");
    await page.waitForTimeout(1800);
  });
  await shot("2-dersler", "index.html?view=practice&tab=lessons", async () => { await page.evaluate(() => { const b = document.getElementById("lsbody"); if(b) b.scrollIntoView(); }); });
  await shot("3-yol-haritasi", "index.html?view=practice&tab=roadmap", async () => { await page.evaluate(() => document.querySelector(".rmbadges").scrollIntoView({ block:"start" })); });
  await shot("4-nota-arsivi", "index.html?view=practice&tab=archive", async () => {
    const r = await page.$("#pp-archive [data-id]"); if(r){ await r.click(); await page.waitForTimeout(1200); }
  });
  await shot("5-eslik", "index.html?view=practice&tab=band", async () => {
    await page.click("#bdgo"); await page.waitForTimeout(2500);
    await page.evaluate(() => document.getElementById("bdslots").scrollIntoView({ block:"center" }));
  });
  await shot("6-kayit", "index.html?view=practice&tab=rec", async () => {
    for(let k=0;k<2;k++){ await page.click("#rcbtn"); await page.waitForTimeout(5000); await page.click("#rcbtn"); await page.waitForTimeout(2000); }
    await page.evaluate(async () => { const all = (await RECDB.list()).sort((a, b) => a.ts - b.ts); all[0].ts -= 31*864e5; all[0].sum = { ...all[0].sum, pct: Math.max(0, (all[0].sum.pct || 60) - 25), dev: (all[0].sum.dev || 0.6) + 0.9 }; await RECDB.put(all[0], null); });
    await page.goto(base + "index.html?view=practice&tab=rec"); await page.waitForTimeout(1200);
    await page.click("#rchist .primary"); await page.waitForTimeout(800);
    await page.evaluate(() => document.getElementById("rccmp").scrollIntoView({ block:"start" }));
  });
  await page.evaluate(async () => { for(const m of await RECDB.list()) await RECDB.del(m.id); });

  // Tanıtım görseli: 1024×500
  const fg = await browser.newPage({ viewport:{ width:1024, height:500 }, deviceScaleFactor:1 });
  await fg.goto(base + "index.html");
  const icon = fs.readFileSync(path.join(ROOT, "icon.svg"), "utf8");
  await fg.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${base}fonts/fonts.css"><style>
    body{margin:0;width:1024px;height:500px;background:#1C5B59;color:#F4F1EA;font-family:Fraunces,serif;display:flex;align-items:center;gap:48px;padding:0 72px;box-sizing:border-box;overflow:hidden;position:relative}
    .ic{width:200px;height:200px;flex:0 0 auto;border-radius:44px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.25)}
    .ic svg{width:100%;height:100%}
    h1{font-size:76px;margin:0 0 12px;font-weight:600;letter-spacing:-1px}
    p{font:500 26px/1.35 Commissioner,sans-serif;margin:0;color:#D9E6E3;max-width:600px}
    .st{position:absolute;right:-40px;bottom:36px;width:560px;opacity:.13}
  </style></head><body><div class="ic">${icon}</div><div><h1>Sol Klarnet</h1>
    <p>Akort, parmak, makam ve oyun havaları: sıfırdan taksime 76 ders</p></div>
    <svg class="st" viewBox="0 0 560 80"><g stroke="#fff" stroke-width="2">${[0,1,2,3,4].map(i => `<line x1="0" x2="560" y1="${10+i*15}" y2="${10+i*15}"/>`).join("")}</g>
    <g fill="#fff">${[40,110,180,250,320,390,460,530].map((x, i) => `<ellipse cx="${x}" cy="${70 - [0,2,4,5,7,5,4,2][i]*7.5}" rx="9" ry="7"/>`).join("")}</g></svg></body></html>`);
  await fg.waitForTimeout(600);
  await fg.screenshot({ path: path.join(ROOT, "store", "feature-graphic.png") });
  console.log("store/feature-graphic.png");
  await browser.close(); srv.close();
}
main().catch(e => { console.error(e); process.exit(1); });
