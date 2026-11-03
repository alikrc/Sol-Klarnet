// Nota okuyucunun (omr.js) değiştirici karışıklık tablosu. Bravura ve Leland'dan (testdata/fonts) çizilen sentetik
// sayfalarda her değiştirici 12 notanın önünde yer alır; sayfa okunur, her notanın okunan koma farkı (Türk notası)
// değiştirici sınıfına geri çevrilir ve beklenenle karşılaştırılır. Satır: çizilen işaret, sütun: okunan.
// "♮/yok": koma farkı 0 (♮ okundu ya da işaret hiç okunmadı; ikisi aynı perdeyi verir), "?": nota bulunamadı ya da
// perdesi başka.
// Leland'da koma ±1 (U+E443, U+E444) yok; o sınıflar Leland sayfasında da Bravura'dan çizilir (omr-templates gibi).
// Ölçekler dizek aralığıdır: 20 px ≈ 300 dpi basılı nota, 14 ≈ 200 dpi, 11 ≈ 150 dpi ya da uzaktan telefon fotoğrafı.
// "bulanik": aynı sayfa 0,8 px bulanıklaştırılıp JPEG kalite 60 ile sıkıştırılır (telefon fotoğrafı benzetimi).
// Sayfalar sentetiktir: gerçek basılı notadaki mürekkep yayılması, kâğıt dokusu ve eğik çekim bu tabloda yok.
//
// Kullanım: node scripts/omr-acc-check.js [--font bravura,leland] [--sp 20,14,11] [--bulanik] [--png <klasör>]
const fs = require("fs"), path = require("path");
const sharp = require("sharp"), opentype = require("opentype.js");
const OMR = require("../omr.js"), R = require("../repertoire.js");
const { CLASS_GLYPHS } = require("./omr-templates.js");

const ROOT = path.join(__dirname, "..");
const FONTS = { bravura:"Bravura.otf", leland:"Leland.otf" };
const fontCache = {};
const font = n => fontCache[n] || (fontCache[n] = opentype.loadSync(path.join(ROOT, "testdata", "fonts", FONTS[n])));
const ACCS = Object.keys(OMR.ACC_K);                       // 9 değiştirici
const K2CLS = Object.fromEntries(ACCS.map(c => [OMR.ACC_K[c], c]));
const N_NOTES = 12;
// Dizekteki yer (0 = alt çizgi Mi4) → yazılı doğal nota
const STEP_W = [64, 65, 67, 69, 71, 72, 74, 76, 77];
const STEPS = [1, 3, 5, 7, 2, 4, 6, 0, 8, 3, 5, 1];       // çizgi ve aralıklar karışık; ölçü içinde tekrar yok

// Glifin SVG yolu: (x, y) taban noktası, sp dizek aralığı; yazı tipinde yoksa Bravura'dan
function glyph(fontName, cp, x, y, sp){
  let f = font(fontName), g = f.charToGlyph(String.fromCodePoint(cp));
  if(g.index === 0){ f = font("bravura"); g = f.charToGlyph(String.fromCodePoint(cp)); }
  return { d:g.getPath(x, y, 4*sp).toPathData(2), w:g.advanceWidth*4*sp/f.unitsPerEm };
}

// Bir değiştiricinin sayfası: sol anahtarı, 12 siyah nota (her birinin önünde aynı işaret), iki notada bir ölçü çizgisi
async function page(fontName, acc, sp, blurred){
  const left = 2*sp, top = 5*sp, slot = 5*sp, W = Math.ceil(left + 5*sp + N_NOTES*slot + N_NOTES/2*sp + 2*sp), H = Math.ceil(top + 9*sp);
  const parts = [], line = 0.13*sp, y0 = top;
  for(let i = 0; i < 5; i++) parts.push(`<rect x="${left}" y="${(y0 + i*sp - line/2).toFixed(2)}" width="${W - 2*left + sp}" height="${line.toFixed(2)}"/>`);
  parts.push(`<path d="${glyph(fontName, CLASS_GLYPHS.clef_g, left + 0.5*sp, y0 + 3*sp, sp).d}"/>`);
  let x = left + 5*sp;
  STEPS.forEach((st, i) => {
    const y = y0 + 4*sp - st*sp/2, a = glyph(fontName, CLASS_GLYPHS[acc], 0, 0, sp);
    parts.push(`<path d="${glyph(fontName, CLASS_GLYPHS[acc], x, y, sp).d}"/>`);
    const hx = x + a.w + 0.4*sp, h = glyph(fontName, CLASS_GLYPHS.head_black, hx, y, sp);
    parts.push(`<path d="${h.d}"/>`);
    const stem = 0.12*sp;
    parts.push(`<rect x="${(hx + h.w - stem).toFixed(2)}" y="${(y - 3.5*sp).toFixed(2)}" width="${stem.toFixed(2)}" height="${(3.3*sp).toFixed(2)}"/>`);
    x += slot;
    if(i % 2 === 1){ parts.push(`<rect x="${(x - 0.8*sp).toFixed(2)}" y="${y0}" width="${(0.16*sp).toFixed(2)}" height="${4*sp}"/>`); x += sp; }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${parts.join("")}</svg>`;
  let img = sharp(Buffer.from(svg), { density:72 }).greyscale();
  if(blurred) img = sharp(await img.blur(0.8).jpeg({ quality:60 }).toBuffer()).greyscale();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject:true });
  return { data:new Uint8Array(data), width:info.width, height:info.height, channels:1, svg };
}

// Okunan notalar → okunan sınıf listesi (12 öğe)
function readClasses(img){
  const r = OMR.readPage(img, { turkish:true }), notes = r.notes.filter(n => !n.rest);
  return STEPS.map((st, i) => {
    const n = notes[i], natW = STEP_W[st];
    if(!n || notes.length !== N_NOTES) return "?";
    return K2CLS[n.c - R.naturalOf({ w:natW }).c] || "?";
  });
}

const SHORT = { sharp:"♯ +4", flat:"♭ −5", natural:"♮/yok 0", aeu_koma_sharp:"koma♯ +1", aeu_kucuk_sharp:"küç♯ +5",
  aeu_buyuk_sharp:"büy♯ +8", aeu_koma_flat:"koma♭ −1", aeu_bakiye_flat:"bak♭ −4", aeu_buyuk_flat:"büy♭ −8", "?":"?" };

async function main(){
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const fonts = arg("--font", "bravura,leland").split(","), sps = arg("--sp", "20,14,11").split(",").map(Number);
  const blurModes = a.includes("--bulanik") ? [false, true] : [false], pngDir = arg("--png", null);
  if(pngDir) fs.mkdirSync(pngDir, { recursive:true });
  console.log(`Değiştirici karışıklık tablosu: sentetik sayfalar, işaret başına ${N_NOTES} nota (Türk notası okuması).\n`);
  const cols = [...ACCS, "?"], total = Object.fromEntries(ACCS.map(c => [c, 0])), totalN = Object.fromEntries(ACCS.map(c => [c, 0]));
  for(const blurred of blurModes) for(const fn of fonts) for(const sp of sps){
    const M = {};
    for(const acc of ACCS){
      const img = await page(fn, acc, sp, blurred);
      if(pngDir) await sharp(Buffer.from(img.data), { raw:{ width:img.width, height:img.height, channels:1 } }).png()
        .toFile(path.join(pngDir, `${fn}_${sp}${blurred ? "_bulanik" : ""}_${acc}.png`));
      const got = readClasses(img);
      M[acc] = Object.fromEntries(cols.map(c => [c, 0]));
      got.forEach(g => M[acc][g]++);
      total[acc] += M[acc][acc]; totalN[acc] += N_NOTES;
    }
    const ok = ACCS.reduce((s, c) => s + M[c][c], 0);
    console.log(`${fn} · sp ${sp}${blurred ? " · bulanık+JPEG" : ""}: ${ok}/${ACCS.length*N_NOTES} doğru`);
    console.log("  " + "çizilen \\ okunan".padEnd(16) + cols.map(c => SHORT[c].padStart(10)).join(""));
    for(const acc of ACCS) console.log("  " + SHORT[acc].padEnd(16) + cols.map(c => String(M[acc][c] || "·").padStart(10)).join(""));
    console.log("");
  }
  console.log("İşaret başına toplam doğru: " + ACCS.map(c => `${SHORT[c]} ${total[c]}/${totalN[c]}`).join(" · "));
}
main().catch(e => { console.error(e); process.exit(1); });
