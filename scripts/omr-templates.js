// Nota okuyucu (omr.js) simge kalıplarını üretir: omrtemplates.js.
// 1) Serbest lisanslı SMuFL yazı tiplerinden (Bravura, Leland; testdata/fonts, OFL) her sınıfın glifi sp = 14'te
//    çizilir, en büyük bağlı bileşeni G×G ızgaraya normalleştirilir (doluluk 0..255) ve boyu sp cinsinden saklanır.
//    Leland'da AEU koma işaretlerinin bir kısmı (U+E443, U+E444) yok; bu sınıflar için yalnızca Bravura kalıbı vardır
//    (sentetik sayfalar da onları Bravura'dan çizer). Değiştiricilerin ayrıca bozuk kalıbı da çıkar (bulanık, 0,6
//    oranında küçültülmüş glif): düşük çözünürlükte ♯ ile büyük mücenneb diyez gibi yakın çizimler karışmasın.
// 2) Gerçek örnekler: testdata/omr/ içinde PNG/JPG varsa omr.js ile okunur, bulunan simgeler sınıflarına göre
//    PNG olarak dökülür (varsayılan: işletim sisteminin geçici klasöründe omr-ornekler/, ya da --out <klasör>) ve
//    liste.txt yazılır. Kurucu yanlış satırları siler ya da sınıfını düzeltir, sonra
//    `npm run omr-templates -- --accept <liste.txt>` ile kalan kırpıntılar scripts/omr-samples.json'a eklenir;
//    her üretimde bu örnekler de kalıplara katılır. Kırpıntı adındaki _sp<sayı> sayfanın dizek aralığıdır.
// Kullanım: npm run omr-templates [-- --out <klasör>] [-- --accept <liste.txt>]
const fs = require("fs"), path = require("path"), os = require("os");
const opentype = require("opentype.js"), sharp = require("sharp");
const OMR = require("../omr.js");

const ROOT = path.join(__dirname, ".."), SP = 14;
const SAMPLES = path.join(__dirname, "omr-samples.json");
// Sınıf → SMuFL kod noktası, AEU işaretleri SMuFL adlarına göre: yalın ♯ bakiye diyez (+4, E445 = ♯ çizimi),
// yalın ♭ küçük mücenneb bemol (−5, E441 = ♭ çizimi); çizikli ♭ bakiye bemol (−4, E442), küçük mücenneb diyez
// (+5, E446), koma ±1 (E443/E444), büyük mücenneb ±8 (E440/E447). Koma değerleri omr.js'te OMR.ACC_K.
const CLASS_GLYPHS = {
  head_black:0xE0A4, head_half:0xE0A3, head_whole:0xE0A2,
  rest_1:0xE4E3, rest_2:0xE4E4, rest_4:0xE4E5, rest_8:0xE4E6, rest_16:0xE4E7, clef_g:0xE050,
  sharp:0xE262, flat:0xE260, natural:0xE261,
  aeu_koma_sharp:0xE444, aeu_kucuk_sharp:0xE446, aeu_buyuk_sharp:0xE447,
  aeu_koma_flat:0xE443, aeu_bakiye_flat:0xE442, aeu_buyuk_flat:0xE440,
  segno:0xE047, measure_repeat:0xE500, dot:0xE1E7
};
for(let d = 0; d <= 9; d++) CLASS_GLYPHS["digit_" + d] = 0xE080 + d;
const FONTS = { bravura:"Bravura.otf", leland:"Leland.otf" };
// Bozuk kalıbı da üretilen sınıflar: değiştiriciler (küçük çizim farkları bulanıkta karışır)
const DEGRADED_CLS = new Set(["sharp", "flat", "natural", "aeu_koma_sharp", "aeu_kucuk_sharp", "aeu_buyuk_sharp", "aeu_koma_flat",
  "aeu_bakiye_flat", "aeu_buyuk_flat"]);

const fontCache = {};
const font = n => fontCache[n] || (fontCache[n] = opentype.loadSync(path.join(ROOT, "testdata", "fonts", FONTS[n])));

// Glifi tek başına gri resim olarak çizer (null: yazı tipinde yok)
async function renderGlyph(fontName, cp, sp){
  const f = font(fontName), g = f.charToGlyph(String.fromCodePoint(cp));
  if(g.index === 0) return null;
  const s = 4*sp/f.unitsPerEm, b = g.getBoundingBox(), pad = Math.ceil(sp);
  const W = Math.ceil((b.x2 - b.x1)*s + 2*pad), H = Math.ceil((b.y2 - b.y1)*s + 2*pad);
  const d = g.getPath(pad - b.x1*s, pad + b.y2*s, 4*sp).toPathData(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${d}"/></svg>`;
  const { data, info } = await sharp(Buffer.from(svg), { density:72 }).greyscale().raw().toBuffer({ resolveWithObject:true });
  return { data:new Uint8Array(data), width:info.width, height:info.height };
}
// Resmin en büyük bileşeninden kalıp: { g:base64, dim:[w/sp, h/sp] }
function templateOf(img, sp){
  const bin = OMR.binarize(img, "otsu"), comps = OMR.components(bin);
  if(!comps.length) return null;
  const c = comps.reduce((a, x) => x.area > a.area ? x : a), g = OMR.gridOf(c, bin), u = new Uint8Array(g.length);
  for(let i = 0; i < g.length; i++) u[i] = Math.round(g[i]*255);
  return { g:OMR.toB64(u), dim:[+(c.w/sp).toFixed(3), +(c.h/sp).toFixed(3)] };
}

// Bozuk örnek: bulanıklaştırılıp küçültülmüş glif (düşük çözünürlüklü tarama, fotoğraf); kalın çizgiler birbirine
// yaklaşır, değiştiricilerin ince farkları silikleşir
const DEGRADED = { blur:1, scale:0.6 };
async function degraded(img){
  const w = Math.round(img.width*DEGRADED.scale), h = Math.round(img.height*DEGRADED.scale);
  const { data, info } = await sharp(Buffer.from(img.data), { raw:{ width:img.width, height:img.height, channels:1 } })
    .blur(DEGRADED.blur).resize(w, h).greyscale().raw().toBuffer({ resolveWithObject:true });
  return { data:new Uint8Array(data), width:info.width, height:info.height };
}
async function fontTemplates(){
  const out = {};
  for(const cls of Object.keys(CLASS_GLYPHS)){
    out[cls] = [];
    for(const fn of Object.keys(FONTS)){
      const img = await renderGlyph(fn, CLASS_GLYPHS[cls], SP);
      if(!img) continue;                             // Leland'da olmayan AEU işaretleri
      out[cls].push(templateOf(img, SP));
      if(DEGRADED_CLS.has(cls)){ const t = templateOf(await degraded(img), SP*DEGRADED.scale); if(t) out[cls].push(t); }
    }
  }
  return out;
}

// Gerçek sayfalardaki simgeleri sınıflarına göre döker
async function dumpSamples(outDir){
  const dir = path.join(ROOT, "testdata", "omr"), files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f)) : [];
  if(!files.length){ console.log("testdata/omr/ içinde PNG/JPG örnek yok; yalnızca yazı tipi kalıpları."); return; }
  fs.mkdirSync(outDir, { recursive:true });
  const list = [];
  for(const f of files){
    const { data, info } = await sharp(path.join(dir, f)).greyscale().raw().toBuffer({ resolveWithObject:true });
    const d = OMR.deskew(OMR.binarize({ data:new Uint8Array(data), width:info.width, height:info.height, channels:1 }, "auto"));
    const st = OMR.findStaves(d.bin);
    if(!st.staves.length){ console.log(f + ": dizek bulunamadı"); continue; }
    const clean = OMR.removeStaffLines(d.bin, st.staves, st), syms = OMR.symbols(clean, st.sp, st.staves);
    let n = 0;
    for(const s of syms){
      if(!s.pixels || s.cls === "stem") continue;
      const pad = 2, W = s.w + 2*pad, H = s.h + 2*pad, px = new Uint8Array(W*H).fill(255);
      for(const p of s.pixels){ const x = p % clean.width, y = (p - x)/clean.width; px[(y - s.y + pad)*W + x - s.x + pad] = 0; }
      const cdir = path.join(outDir, s.cls); fs.mkdirSync(cdir, { recursive:true });
      const file = path.join(cdir, `${path.parse(f).name}_${n++}_sp${st.sp.toFixed(2)}.png`);
      await sharp(Buffer.from(px), { raw:{ width:W, height:H, channels:1 } }).png().toFile(file);
      list.push(s.cls + "\t" + file);
    }
    console.log(`${f}: ${st.staves.length} dizek, sp ${st.sp.toFixed(2)}, ${n} simge`);
  }
  fs.writeFileSync(path.join(outDir, "liste.txt"), list.join("\n") + "\n");
  console.log("Dökülen simgeler: " + outDir + " (liste.txt'i ayıklayıp --accept ile verin)");
}

// Ayıklanmış listedeki kırpıntıları omr-samples.json'a ekler
async function accept(listFile){
  const samples = fs.existsSync(SAMPLES) ? JSON.parse(fs.readFileSync(SAMPLES, "utf8")) : {};
  let n = 0;
  for(const ln of fs.readFileSync(listFile, "utf8").split(/\r?\n/)){
    const m = /^(\w+)\s+(.+?)\s*$/.exec(ln); if(!m) continue;
    const [, cls, file] = m;
    if(!CLASS_GLYPHS[cls]){ console.log("bilinmeyen sınıf, atlandı: " + ln); continue; }
    const sp = +((/_sp(\d+(?:\.\d+)?)/.exec(file) || [])[1] || SP);
    const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject:true });
    const t = templateOf({ data:new Uint8Array(data), width:info.width, height:info.height, channels:1 }, sp);
    if(!t) continue;
    (samples[cls] || (samples[cls] = [])).push(t); n++;
  }
  fs.writeFileSync(SAMPLES, JSON.stringify(samples, null, 1) + "\n");
  console.log(n + " örnek eklendi: " + SAMPLES);
}

async function build(){
  const t = await fontTemplates(), extra = fs.existsSync(SAMPLES) ? JSON.parse(fs.readFileSync(SAMPLES, "utf8")) : {};
  for(const cls of Object.keys(extra)) if(t[cls]) t[cls].push(...extra[cls]);
  const lines = Object.keys(t).map(cls => `  ${cls}:[${t[cls].map(x => JSON.stringify(x.g)).join(",")}]`);
  const dims = Object.keys(t).map(cls => `  ${cls}:${JSON.stringify(t[cls].map(x => x.dim))}`);
  const src = `// npm run omr-templates ile üretildi; elle düzenlemeyin. Nota okuyucu (omr.js) simge kalıpları:
// her sınıf için ${OMR.GRID}×${OMR.GRID} doluluk ızgarası (Uint8, base64) ve boyu (sp cinsinden [en, boy]).
// Kaynak: Bravura ve Leland (SIL Open Font License, testdata/fonts/OFL.txt) ve ayıklanmış gerçek örnekler.
const OMR_TEMPLATES = {
 size:[${OMR.GRID},${OMR.GRID}],
 classes:{
${lines.join(",\n")}
 },
 dims:{
${dims.join(",\n")}
 }
};
if(typeof module !== "undefined") module.exports = OMR_TEMPLATES;
`;
  fs.writeFileSync(path.join(ROOT, "omrtemplates.js"), src);
  console.log(`omrtemplates.js: ${Object.keys(t).length} sınıf, ${Object.values(t).reduce((a, x) => a + x.length, 0)} kalıp, ${(src.length/1024).toFixed(1)} KB`);
}

module.exports = { CLASS_GLYPHS, renderGlyph, templateOf };

if(require.main === module){
  (async () => {
    const a = process.argv.slice(2), arg = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
    if(arg("--accept")) await accept(arg("--accept"));
    await build();
    if(!arg("--accept")) await dumpSamples(arg("--out") || path.join(os.tmpdir(), "omr-ornekler"));
  })().catch(e => { console.error(e); process.exit(1); });
}
