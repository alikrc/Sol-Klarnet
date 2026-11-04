// Mağaza malzemeleri: telefon ekran görüntüleri (Play için store/screens/ 1080×2160, App Store için store/screens/ios/
// 1320×2868) ve 1024×500 tanıtım görseli (store/feature-graphic.png). Uygulama yerel bir sunucudan açılır, gösterim için
// örnek ilerleme yüklenir; Akort ve Seviye sınaması sahte mikrofona verilen sentetik klarnet sesiyle çekilir.
// Çalıştırma: npm run store-shots  (Playwright ve Chromium gerekir: npm i -D playwright && npx playwright install chromium;
// genel kuruluysa NODE_PATH="$(npm root -g)"). ONLY=play ya da ONLY=ios yalnız o takımı çeker. SHOT_SRC=klasör uygulamayı o
// kopyadan sunar (git archive HEAD ile çıkarılmış temiz kopya: başka oturumların yarım değişiklikleri görüntüye girmesin).
const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");

let chromium;
try{ ({ chromium } = require("playwright")); }
catch(e){ console.error("Playwright bulunamadı: npm i -D playwright && npx playwright install chromium"); process.exit(1); }

const ROOT = path.join(__dirname, "..");
const SRC = path.resolve(process.env.SHOT_SRC || ROOT);
const { LESSONS } = require(path.join(SRC, "lessons.js"));
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

// Gösterim için örnek ilerleme: üç ünite ve sınavları bitmiş, Teknik ve üslup yarıda, iki dersin tekrarı gelmiş, bugünkü
// çalışma daha yapılmamış (hoca kartı Bugünün çalışması'nı söyler). Kademe raporu görülmüş sayılır
function seedScript(){
  return `(() => {
    const day = d => { const x = new Date(); x.setDate(x.getDate() - d); return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2,"0") + "-" + String(x.getDate()).padStart(2,"0"); };
    const units = ["baslangic", "temel", "klarino"], prog = {};
    const finish = (l, d) => { prog[l.id] = { s:{}, d: day(d) }; l.steps.forEach((s, k) => prog[l.id].s[k] = { v:1, ok:true }); };
    LESSONS.filter(l => units.includes(l.unit) || ["uzun-ton", "glissando", "vibrato", "register-gecisi", "artikulasyon"].includes(l.id)).forEach((l, i) => finish(l, 34 - i));
    units.forEach((u, i) => finish(examFor(u), 22 - i*5));
    const days = {}; for(let i=1;i<40;i++) if(i < 12 || i % 3) days[day(i)] = 900 + (i*137 % 900);
    const set = (k, v) => localStorage.setItem("sk." + k, JSON.stringify(v));
    set("lesson.prog", prog); set("days", days); set("onboard.done", true); set("onboard.level", "makam"); set("goal.min", 15);
    set("lesson.dailyDone", Array.from({ length:11 }, (_, i) => day(i + 1)));
    set("long.best", { 67:{ score:72 }, 69:{ score:68 }, 74:{ score:64 } }); set("rhythm.best", 78); set("ear.best", { pitch:1.5, makam:4 });
    set("rm.reported", ["baslangic"]); set("band.usul", "roman"); set("band.mk", "hicaz"); set("lesson.cur", "dinamik"); set("arch.zoom", 0.8);
    window.SK_RESETTING = true;      // sayfa kapanırken bellekteki boş sayaçlar örnek günlerin üstüne yazılmasın
  })()`;
}

// Seviye sınamasının nota turundaki sıra (onboard.js CHECK); sahte mikrofon notaları bu sırayla döngüde çalar
const CHECK_SEQ = [67, 62, 60, 55, 52, 69, 70, 71, 72, 74, 79, 84].map(w => [w, 1.8]);
// Arşiv ve Çevir ekranlarındaki eser: Kantemiroğlu (ö. 1723), Uşşak saz semâîsi; besteci kamu malı, sözsüz, docs/lisans-disla.csv
// ve docs/lisans-belirsiz.csv listelerinde yok. Eser değişirse bu listelerden yeniden bakılmalı
const PIECE = "ussak--sazsemaisi--aksaksemai----kantemiroglu";
// Akort ekranındaki ses: Uşşak'ta icra Segâh'ı (AEU'dan 1,5 koma pes), hedefin hemen altında. Yazılı nota kesirli olabilir
const SEGAH_ICRA = 67 + (17 - 1.5 - 0.2)*12/53 - 0.04;

// Her ekran bir kez Play için, bir kez App Store için çekilir (boyutlar tam bu olmalı)
const TARGETS = [
  { id:"play", dir: OUT, label: "store/screens/", viewport:{ width:432, height:864 }, dpr:2.5 },                     // 1080×2160, Play'in 2:1 sınırı
  { id:"ios", dir: path.join(OUT, "ios"), label: "store/screens/ios/", viewport:{ width:440, height:956 }, dpr:3 }   // 1320×2868, iPhone 6,9"
];

async function shootAll(t, base, wavs){
  fs.mkdirSync(t.dir, { recursive: true });
  const open = async wav => {
    const browser = await chromium.launch({ args:["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
      "--use-file-for-fake-audio-capture=" + wav, "--autoplay-policy=no-user-gesture-required"] });
    const ctx = await browser.newContext({ viewport:t.viewport, deviceScaleFactor:t.dpr, isMobile:true, hasTouch:true,
      permissions:["microphone"], colorScheme:"light", locale:"tr-TR" });
    // Üst çubuk yarı saydam: kaydırılmış sayfada alttaki yazı içinden hayalet gibi görünmesin
    await ctx.addInitScript(() => addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = ".appbar{background:var(--paper)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"; document.head.append(st); }));
    const page = await ctx.newPage();
    page.on("pageerror", e => console.error("sayfa hatası:", e.message));
    await page.goto(base + "index.html");
    await page.evaluate(seedScript());
    return { browser, page };
  };
  const save = async (page, name) => { await page.screenshot({ path: path.join(t.dir, name + ".png") }); console.log(t.label + name + ".png"); };
  // Üst çubuk yapışkan: öğe çubuğun altında kalmasın (gap: çubuktan uzaklık)
  const toTop = (page, sel, gap = 84) => page.evaluate(([s, g]) => window.scrollTo(0, window.scrollY + document.querySelector(s).getBoundingClientRect().top - g), [sel, gap]);

  // Seviye sınaması: nota okuma soruları geçilir, gerçek ses izleme altıncı notaya kadar sürer
  const lv = await open(wavs.check);
  { const page = lv.page;
    await page.goto(base + "index.html?tab=lessons"); await page.waitForTimeout(1200);
    await page.click("#lslevel"); await page.waitForTimeout(400);
    await page.click('[data-ob="chkstart"]'); await page.waitForTimeout(400);
    for(const a of ["Mi", "La", "Do", "Fa"]){ await page.click(`[data-read="${a}"]`); await page.waitForTimeout(500); }
    await page.waitForFunction(() => /6\/12/.test(document.querySelector("#onboard .eyebrow")?.textContent || "") && parseFloat(document.getElementById("obhold")?.style.width) > 35, null, { timeout:90000 });
    await save(page, "2-seviye-sinamasi");
  }
  await lv.browser.close();

  const { browser, page } = await open(wavs.play);
  const shot = async (name, url, prep) => {
    await page.goto(base + url); await page.waitForTimeout(1300);
    if(prep) await prep();
    await page.waitForTimeout(300);
    await save(page, name);
  };
  await shot("1-hoca-karti", "index.html?tab=lessons");
  await shot("3-akort", "index.html?view=tune", async () => {
    await page.selectOption("#tmakam", "ussak"); await page.click('[data-tune="icra"]');
    await page.click("#btn"); await page.waitForTimeout(1800);
  });
  await shot("4-parmak", "index.html?view=finger", async () => {
    await page.click('#rail [aria-label*="yazılı Re4 "]'); await page.waitForTimeout(500);
    await page.evaluate(() => { SK.stopAll(); window.scrollTo(0, 225); });
  });
  await shot("5-cesniler", "index.html?tab=teori", async () => {
    await page.click('[data-t="cesni"]'); await page.waitForTimeout(700);
    await toTop(page, '[data-ce="0"]', 68);
  });
  await shot("6-nota-arsivi", "index.html?eser=" + PIECE, async () => { await page.click("#arfull"); await page.waitForTimeout(800); });
  // Çevir: arşivdeki aynı eserin notası resim olarak verilir, gerçek okuyucu okur
  const clip = await page.evaluate(() => { const r = [...document.querySelectorAll("#pp-archive svg.score")].slice(0, 4).map(e => e.getBoundingClientRect()); return { x:r[0].x + scrollX, y:r[0].y + scrollY, width:r[0].width, height:r[3].bottom - r[0].top }; });
  const pic = await page.screenshot({ clip, fullPage:true });
  await page.evaluate(() => document.body.classList.remove("arfullbody"));
  await shot("7-cevir", "index.html?tab=convert", async () => {
    await page.setInputFiles("#cvpic", { name:"ussak-saz-semaisi.png", mimeType:"image/png", buffer:pic });
    await page.waitForSelector("#cvchips button", { timeout:30000 }); await page.waitForTimeout(800);
    await toTop(page, "#cvkind", 66);
  });
  await shot("8-eslik", "index.html?tab=band", async () => {
    await page.click("#bdgo"); await page.waitForTimeout(7000); await page.click("#bdgo"); await page.waitForTimeout(800);
  });
  await browser.close();
}

async function main(){
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]), f = path.join(SRC, u === "/" ? "index.html" : u);
    if(!f.startsWith(SRC) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
  }).listen(0);
  const base = "http://localhost:" + srv.address().port + "/";
  const wavs = { play: path.join(os.tmpdir(), "sol-klarnet-shots.wav"), check: path.join(os.tmpdir(), "sol-klarnet-check.wav") };
  toneWav(wavs.play, [[SEGAH_ICRA, 8], [null, 0.3]]);
  toneWav(wavs.check, CHECK_SEQ);
  for(const t of TARGETS) if(!process.env.ONLY || t.id === process.env.ONLY) await shootAll(t, base, wavs);

  // Tanıtım görseli: 1024×500
  const browser = await chromium.launch();
  const fg = await browser.newPage({ viewport:{ width:1024, height:500 }, deviceScaleFactor:1 });
  await fg.goto(base + "index.html");
  const icon = fs.readFileSync(path.join(SRC, "icon.svg"), "utf8");
  await fg.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${base}fonts/fonts.css"><style>
    body{margin:0;width:1024px;height:500px;background:#1C5B59;color:#F4F1EA;font-family:Fraunces,serif;display:flex;align-items:center;gap:48px;padding:0 72px;box-sizing:border-box;overflow:hidden;position:relative}
    .ic{width:200px;height:200px;flex:0 0 auto;border-radius:44px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.25)}
    .ic svg{width:100%;height:100%}
    h1{font-size:76px;margin:0 0 12px;font-weight:600;letter-spacing:-1px}
    p{font:500 26px/1.35 Commissioner,sans-serif;margin:0;color:#D9E6E3;max-width:600px}
    .st{position:absolute;right:-40px;bottom:36px;width:560px;opacity:.13}
  </style></head><body><div class="ic">${icon}</div><div><h1>Sol Klarnet</h1>
    <p>Akort, parmak, makam ve oyun havaları: sıfırdan taksime ${LESSONS.length} ders</p></div>
    <svg class="st" viewBox="0 0 560 80"><g stroke="#fff" stroke-width="2">${[0,1,2,3,4].map(i => `<line x1="0" x2="560" y1="${10+i*15}" y2="${10+i*15}"/>`).join("")}</g>
    <g fill="#fff">${[40,110,180,250,320,390,460,530].map((x, i) => `<ellipse cx="${x}" cy="${70 - [0,2,4,5,7,5,4,2][i]*7.5}" rx="9" ry="7"/>`).join("")}</g></svg></body></html>`);
  await fg.waitForTimeout(600);
  await fg.screenshot({ path: path.join(ROOT, "store", "feature-graphic.png") });
  console.log("store/feature-graphic.png");
  await browser.close(); srv.close();
}
main().catch(e => { console.error(e); process.exit(1); });
