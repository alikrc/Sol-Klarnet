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

const sharp = require("sharp"), opentype = require("opentype.js");

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

// Çevir ekranının kaynak sayfası: eserin ilk ölçüleri Bravura ile dizilir (okuyucunun kalıpları da Bravura ve Leland'dandır).
// Sol anahtarı, ölçü rakamı, kirişli notalar, değiştirici, nokta, sus. Dönen: PNG Buffer
function engrave(file, { bars:nBars = 8, perRow = 2, title = "", sp = 20, width = 1500 } = {}){
  const f = opentype.loadSync(path.join(SRC, "testdata", "fonts", "Bravura.otf")), EM = 4*sp/f.unitsPerEm;
  const g = (cp, x, y) => { const q = f.charToGlyph(String.fromCodePoint(cp)); return `<path d="${q.getPath(x, y, 4*sp).toPathData(2)}"/>`; };
  const gw = cp => f.charToGlyph(String.fromCodePoint(cp)).advanceWidth*EM;
  const rect = (x, y, w, h) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
  const piece = JSON.parse(fs.readFileSync(path.join(SRC, "notalar", file + ".json"), "utf8")), [, num, den] = piece.meters[0], L = num*4/den;
  // Komadan dizekteki yer (0 = alt çizgi Mi4) ve değiştirici: en yakın doğal nota; karşılığı olmayan fark en yakın işarete yuvarlanır
  const NAT = [[-13, 0], [-9, 1], [0, 2], [9, 3], [18, 4], [22, 5], [31, 6]], ACC = { 1:0xE444, 4:0xE262, 5:0xE446, 8:0xE447, "-1":0xE443, "-4":0xE442, "-5":0xE260, "-8":0xE440 };
  const place = c => {
    let best = null;
    for(let o = -1; o <= 2; o++) for(const [nc, st] of NAT){
      let k = c - (nc + 53*o); if(k === -2) k = -1;
      if((k === 0 || ACC[k]) && (!best || Math.abs(k) < Math.abs(best.k))) best = { k, step: st + 7*o };
    }
    return best;
  };
  const bars = []; let cur = [], sum = 0;
  for(const [c, d] of piece.notes){
    cur.push({ c, d, pos:sum, ...(c === null ? { rest:true, step:4 } : place(c)) }); sum += d;
    if(sum >= L - 1e-6){ bars.push(cur); cur = []; sum = 0; if(bars.length === nBars) break; }
  }
  const left = 2*sp, rowH = 10*sp, top = (title ? 7 : 4)*sp, rows = Math.ceil(bars.length/perRow), H = Math.round(top + rows*rowH), parts = [];
  for(let r = 0; r < rows; r++){
    const y0 = top + r*rowH, line = 0.13*sp, right = width - 2*sp;
    for(let i = 0; i < 5; i++) parts.push(rect(left, y0 + i*sp - line/2, right - left, line));
    parts.push(rect(left, y0, 0.16*sp, 4*sp), rect(right - 0.16*sp, y0, 0.16*sp, 4*sp), g(0xE050, left + 0.5*sp, y0 + 3*sp));
    let x0 = left + 4*sp;
    if(r === 0){
      [String(num), String(den)].forEach((t, i) => [...t].forEach((ch, k) => parts.push(g(0xE080 + +ch, x0 + k*1.7*sp + (i ? 0.85*sp : 0), y0 + (i ? 3 : 1)*sp))));
      x0 += 4.2*sp;
    }
    const rowBars = bars.slice(r*perRow, (r + 1)*perRow), wt = n => 3.2 + n.d*1.3 + (n.k ? 1.4 : 0), tot = rowBars.flat().reduce((a, n) => a + wt(n), 0), k = (right - x0 - rowBars.length*sp)/tot;
    let x = x0;
    for(const bar of rowBars){
      bar.forEach(n => { n.x = x + (n.k ? 1.9 : 0.7)*sp; x += wt(n)*k; });
      // Vuruş içindeki kısa notalar kirişlenir; vuruşu aşan ya da tek kalan nota bayrak alır
      const groups = []; let grp = [];
      const close = () => { if(grp.length) groups.push(grp); grp = []; };
      for(const n of bar){
        if(n.rest || n.d >= 1){ close(); if(!n.rest) groups.push([n]); continue; }
        if(grp.length && Math.floor(n.pos + 1e-6) !== Math.floor(grp[0].pos + 1e-6)) close();
        grp.push(n);
      }
      close();
      for(const n of bar){
        const y = y0 + 4*sp - n.step*sp/2;
        if(n.rest){ parts.push(g(n.d >= 1 ? 0xE4E5 : n.d >= 0.5 ? 0xE4E6 : 0xE4E7, n.x, y0 + 2*sp)); continue; }
        for(let s = -2; s >= n.step; s -= 2) parts.push(rect(n.x - 0.4*sp, y0 + 4*sp - s*sp/2 - 0.06*sp, 2.1*sp, 0.13*sp));
        for(let s = 10; s <= n.step; s += 2) parts.push(rect(n.x - 0.4*sp, y0 + 4*sp - s*sp/2 - 0.06*sp, 2.1*sp, 0.13*sp));
        parts.push(g(0xE0A4, n.x, y));
        if(n.k) parts.push(g(ACC[n.k], n.x - gw(ACC[n.k]) - 0.35*sp, y));
        if(n.d === 0.75 || n.d === 1.5) parts.push(g(0xE1E7, n.x + gw(0xE0A4) + 0.35*sp, y - (n.step % 2 === 0 ? 0.5*sp : 0)));
      }
      const hw = gw(0xE0A4), st = 0.12*sp;
      for(const grp2 of groups){
        const up = grp2.reduce((a, n) => a + n.step, 0)/grp2.length < 4;
        const ys = grp2.map(n => y0 + 4*sp - n.step*sp/2), end = up ? Math.min(...ys) - 3.5*sp : Math.max(...ys) + 3.5*sp;
        const sx = n => up ? n.x + hw - st : n.x;
        grp2.forEach((n, i) => parts.push(rect(sx(n), Math.min(ys[i], end), st, Math.abs(ys[i] - end))));
        const beams = n => n.d <= 0.25 || n.d === 0.375 ? 2 : n.d < 1 ? 1 : 0, by = lv => up ? end + lv*0.75*sp : end - lv*0.75*sp - 0.5*sp;
        if(grp2.length === 1){
          const n = grp2[0], b = beams(n);
          if(b) parts.push(g(up ? (b === 2 ? 0xE242 : 0xE240) : (b === 2 ? 0xE243 : 0xE241), sx(n), end));
          continue;
        }
        parts.push(rect(sx(grp2[0]), by(0), sx(grp2[grp2.length - 1]) + st - sx(grp2[0]), 0.5*sp));
        grp2.forEach((n, i) => {
          if(beams(n) < 2) return;
          const nx = grp2[i + 1], pv = grp2[i - 1];
          if(nx && beams(nx) >= 2) parts.push(rect(sx(n), by(1), sx(nx) + st - sx(n), 0.5*sp));
          else if(!(pv && beams(pv) >= 2)) parts.push(nx ? rect(sx(n), by(1), 1.1*sp, 0.5*sp) : rect(sx(n) - 1.1*sp + st, by(1), 1.1*sp, 0.5*sp));
        });
      }
      x += sp;
      if(bar !== rowBars[rowBars.length - 1]) parts.push(rect(x - 0.9*sp, y0, 0.16*sp, 4*sp));
    }
  }
  const head = title ? `<text x="${width/2}" y="${3.4*sp}" text-anchor="middle" font-family="Georgia, serif" font-size="${1.9*sp}">${title}</text>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}"><rect width="${width}" height="${H}" fill="#fff"/>${head}${parts.join("")}</svg>`;
  return sharp(Buffer.from(svg), { density:72 }).flatten({ background:"#fff" }).png().toBuffer();
}

// Seviye sınamasının nota turundaki sıra (onboard.js CHECK); sahte mikrofon notaları bu sırayla döngüde çalar
const CHECK_SEQ = [67, 62, 60, 55, 52, 69, 70, 71, 72, 74, 79, 84].map(w => [w, 1.8]);
// Görüntülerdeki eserler: arşivde Tanburî Cemil Bey'in Çeçen Kızı'sı (ö. 1916), Çevir'de Kantemiroğlu'nun Uşşak saz semâîsi
// (ö. 1723). İkisi de besteci kamu malı, sözsüz, docs/lisans-disla.csv ve docs/lisans-belirsiz.csv listelerinde yok. Eser
// değişirse bu listelerden yeniden bakılmalı
const PIECE = "huseyni--oyunhavasi--nimsofyan--cecen_kizi--tanburi_cemil_bey", READ_PIECE = "ussak--sazsemaisi--aksaksemai----kantemiroglu";
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

  // Alt çubuğun (tam ekranda ekranın) ortasından kesilen satır ve kutular gizlenir: görüntü yarım yazıyla bitmesin
  const trimBottom = page => page.evaluate(() => {
    const nav = document.querySelector(".nav"), nr = nav && nav.getBoundingClientRect(), limit = nr && nr.height ? nr.top : innerHeight;
    const walk = el => { for(const c of el.children){
      if(c === nav) continue;
      const r = c.getBoundingClientRect();
      if(!r.height || r.top >= limit || r.bottom <= limit) continue;
      if(r.height < 170 || !c.children.length) c.style.visibility = "hidden"; else walk(c);
    } };
    walk(document.body);
  });

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
    // Entonasyon izi ve nota şeridi ekranın altında yarım kalıyordu: görüntü Vibrato'da bitsin
    await page.evaluate(() => { document.querySelector(".tracewrap").style.display = "none"; document.querySelector(".card.strip").style.visibility = "hidden"; });
  });
  await shot("4-parmak", "index.html?view=finger", async () => {
    await page.click('#rail [aria-label*="yazılı Re4 "]'); await page.waitForTimeout(500);
    // Şema ve "Sesi durdur" düğmesi nota şeridinin hemen üstünde bitsin
    await page.evaluate(() => { SK.stopAll(); window.scrollBy(0, document.getElementById("stopbtn").getBoundingClientRect().bottom + 6 - document.querySelector(".card.strip").getBoundingClientRect().top); });
  });
  await shot("5-cesniler", "index.html?tab=teori", async () => {
    await page.click('[data-t="cesni"]'); await page.waitForTimeout(700);
    await toTop(page, '[data-ce="0"]', 68); await trimBottom(page);
  });
  await shot("6-nota-arsivi", "index.html?eser=" + PIECE, async () => {
    await page.click("#arfull"); await page.waitForTimeout(800);
    // Ekranın altından taşan dizek gizlenir (nota kutusu kendi içinde kaydığı için trimBottom bulamaz)
    await page.evaluate(() => document.querySelectorAll("#pp-archive .arline").forEach(l => { if(l.getBoundingClientRect().bottom > innerHeight) l.style.visibility = "hidden"; }));
  });
  // Çevir: aynı eserin ilk ölçüleri Bravura ile dizilir, sayfayı gerçek okuyucu okur (temiz, sentetik sayfa; basılı nota değil)
  const pic = await engrave(READ_PIECE, { title:"Uşşak Saz Semâîsi · Kantemiroğlu" });
  await shot("7-cevir", "index.html?tab=convert", async () => {
    await page.setInputFiles("#cvpic", { name:"ussak-saz-semaisi.png", mimeType:"image/png", buffer:pic });
    await page.waitForSelector("#cvchips button", { timeout:30000 }); await page.waitForTimeout(800);
    await page.selectOption("#cvmk", "ussak"); await page.waitForTimeout(400);
    await toTop(page, "#cvkind", 66); await trimBottom(page);
  });
  await shot("8-eslik", "index.html?tab=band", async () => {
    await page.click("#bdgo"); await page.waitForTimeout(10000); await page.click("#bdgo");   // ses döngüsü 8,3 sn: en az bir nota başı duyulsun
    await page.waitForTimeout(800);
    // Sentetik uzun ton üç ölçüde tek başlangıç verir, sonuç %100 çıkar: gösterimde on altı ölçülük olağan bir çalış yazılır
    await page.evaluate(() => { const b = document.querySelectorAll("#bdstage .big2"), st = document.getElementById("bdstage"); b[0].textContent = "%82"; b[2].textContent = "16";
      const p = st.querySelector("p.muted"); if(p) p.textContent = "Grubun temposu 208–220 arasında gezindi; seni 1 kez bekledi."; });
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
