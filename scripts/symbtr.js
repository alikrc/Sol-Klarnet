// SymbTr (MTG, Universitat Pompeu Fabra, CC BY-NC-SA 4.0) koleksiyonunu uygulamanın nota arşivine çevirir.
// Kullanım: node scripts/symbtr.js <SymbTr deposu> [--cache <klasör>]
//   Depoda txt/ ve symbTr_mbid.json olmalı. Eserin adı, bestekârı, makam/form/usul adları MusicXML dosyasının
//   başından okunur (GitHub'dan ilk 6 KB, --cache klasöründe saklanır; yeniden çalıştırınca ağa çıkmaz).
// Çıktı: notalar/index.json (arşiv dizini) ve notalar/<id>.json (her eser).
//
// Eser dosyası: { id, notes:[[c, d, süs?, hece?]], sections:[[i, ad]], phrases:[i], meters:[[i, pay, payda, usul]], tempo }
//   c: Rast'a (yazılı Sol4) göre koma, sus için null; d: dörtlük cinsinden süre; süs: "tr" "m+" "m-" "ç+" "ç-".
// SymbTr txt sütunları: Sira Kod Nota53 NotaAE Koma53 KomaAE Pay Payda Ms LNS Bas Soz1 Offset.
// Kod: 9 nota/sus, 8 çarpma (süresiz), 1 küçük nota, 11 sessiz çarpma, 12/13 tril, 32 aşağı tril, 23 mordan,
//   24 aşağı mordan, 43/44 ters mordan, 51 usul, 52 tempo, 53 cümle sınırı (code_explanations.xlsx).
const fs = require("fs");
const path = require("path");
const https = require("https");
const { LOW_NOTE, HIGH_NOTE } = require("../core.js");

const args = process.argv.slice(2);
const repo = args[0];
if(!repo || !fs.existsSync(path.join(repo, "txt"))){ console.error("Kullanım: node scripts/symbtr.js <SymbTr deposu> [--cache <klasör>]"); process.exit(1); }
const ci = args.indexOf("--cache");
const CACHE = ci > 0 ? args[ci+1] : path.join(repo, ".baslik");
const OUT = path.join(__dirname, "..", "notalar");
const RAST = 296;                                  // SymbTr Koma53'te Sol4

const GRACE = new Set([1, 8, 11, 17]);
const ORN = { 12:"tr", 13:"tr", 32:"tr", 23:"m+", 43:"m+", 24:"m-", 44:"m-" };
const SECTION = /^[A-ZÇĞİÖŞÜÂÎÛ0-9 .\-]+$/;

function get(url, range){
  return new Promise((res, rej) => {
    https.get(url, { headers: range ? { Range: "bytes=0-6143" } : {} }, r => {
      if(r.statusCode >= 300 && r.statusCode < 400 && r.headers.location){ r.resume(); return get(r.headers.location, range).then(res, rej); }
      if(r.statusCode >= 400){ r.resume(); return rej(new Error(url + " " + r.statusCode)); }
      const chunks = []; r.on("data", c => chunks.push(c)); r.on("end", () => res(Buffer.concat(chunks).toString("utf8")));
    }).on("error", rej);
  });
}
async function header(id){
  const f = path.join(CACHE, id + ".xml");
  if(fs.existsSync(f)) return fs.readFileSync(f, "utf8");
  const x = await get(`https://raw.githubusercontent.com/MTG/SymbTr/master/MusicXML/${encodeURIComponent(id)}.xml`, true);
  fs.writeFileSync(f, x);
  return x;
}
const tag = (s, re) => { const m = re.exec(s); return m ? m[1].trim().replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"') : null; };

function parseTxt(text){
  const rows = text.split(/\r?\n/).slice(1).filter(Boolean).map(l => l.split("\t"));
  const notes = [], sections = [], phrases = [], meters = [];
  let grace = null, lastSec = null;
  const tempos = [];
  for(const r of rows){
    const kod = +r[1], koma = +r[4], pay = +r[6], payda = +r[7], ms = +r[8], soz = (r[11] || "").replace(/\s+$/, "");
    if(kod === 51){ meters.push([notes.length, pay, payda, soz.trim()]); continue; }
    if(kod === 53){ if(notes.length && phrases[phrases.length-1] !== notes.length) phrases.push(notes.length); continue; }
    if(kod > 49) continue;
    if(GRACE.has(kod) || !(pay > 0)){ if(koma > 0) grace = koma - RAST; continue; }
    const d = Math.round(4*pay/payda*1e4)/1e4;
    if(ms > 0) tempos.push(60000/(ms/d));
    const t = soz.trim();
    if(t.length > 1 && SECTION.test(t) && /[A-ZÇĞİÖŞÜÂÎÛ].*[A-ZÇĞİÖŞÜÂÎÛ]/.test(t)){
      if(t !== lastSec){ sections.push([notes.length, t]); lastSec = t; }
    }
    if(koma < 0 || r[2] === "Es"){ notes.push([null, d]); grace = null; continue; }
    const c = koma - RAST;
    let orn = ORN[kod] || null;
    if(!orn && grace !== null && grace !== c) orn = grace > c ? "ç+" : "ç-";
    grace = null;
    const syl = t && !(t.length > 1 && SECTION.test(t)) && t !== "." ? soz : null;
    const n = [c, d];
    if(orn || syl) n.push(orn);
    if(syl) n.push(syl);
    notes.push(n);
  }
  // Tempo: notaların çoğunun temposu (ortanca); ritardando ya da tek tük bozuk süre etkilemesin
  tempos.sort((a, b) => a - b);
  const tempo = tempos.length ? Math.max(30, Math.min(300, Math.round(tempos[tempos.length >> 1]))) : null;
  return { notes, sections, phrases, meters, tempo };
}

// Seviye: ses alanı, hız, ritim çeşitliliği, kısa notalar, aksak usul, perde çeşitliliği ve uzunluktan bir puan
function difficulty(p){
  const ns = p.notes.filter(n => n[0] !== null);
  if(!ns.length) return 0;
  const cs = ns.map(n => n[0]), span = Math.max(...cs) - Math.min(...cs);
  const beats = p.notes.reduce((a, n) => a + n[1], 0), secs = beats*60/(p.tempo || 80);
  const nps = ns.length/Math.max(1, secs);
  const durs = new Set(p.notes.map(n => n[1])).size;
  const short = ns.filter(n => n[1] <= 0.25).length/ns.length;
  const odd = p.meters.some(m => [5, 7, 9, 10, 11, 13, 15].includes(m[1])) ? 1 : 0;
  const perdes = new Set(cs.map(c => ((c % 53) + 53) % 53)).size;
  const orns = ns.filter(n => n[2]).length/ns.length;
  return span/53*1.2 + nps*0.6 + durs*0.15 + short*2 + odd*0.5 + perdes*0.08 + orns*2 + Math.log10(ns.length)*0.4;
}

(async () => {
  fs.mkdirSync(CACHE, { recursive: true });
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT);
  const mbid = new Map(JSON.parse(fs.readFileSync(path.join(repo, "symbTr_mbid.json"), "utf8"))
    .map(e => [e.name, (e.uuid || "").replace(/^https?:\/\/musicbrainz\.org\/work\//, "")]));
  const ids = fs.readdirSync(path.join(repo, "txt")).filter(f => f.endsWith(".txt")).map(f => f.slice(0, -4)).sort();
  // Başlıklar sekizer sekizer
  const heads = new Map();
  for(let i = 0; i < ids.length; i += 8){
    await Promise.all(ids.slice(i, i+8).map(async id => {
      try{ heads.set(id, await header(id)); }catch(e){ console.warn("başlık yok:", id, e.message); heads.set(id, ""); }
    }));
    if(i % 400 === 0) console.log(`başlıklar ${i}/${ids.length}`);
  }
  const index = [];
  for(const id of ids){
    const p = parseTxt(fs.readFileSync(path.join(repo, "txt", id + ".txt"), "utf8"));
    if(!p.notes.some(n => n[0] !== null)) continue;
    const h = heads.get(id) || "", [mk, fm, us, ad, bs] = id.split("--");
    const words = tag(h, /<words[^>]*>([^<]*Makam:[^<]*)<\/words>/) || "";
    const wpart = k => (new RegExp(k + ":\\s*([^,]+)").exec(words) || [, null])[1];
    const title = tag(h, /<work-title>([^<]*)<\/work-title>/) || (ad || id).replace(/_/g, " ");
    const composer = tag(h, /<creator type="composer">([^<]*)<\//), poet = tag(h, /<creator type="poet">([^<]*)<\//);
    // Tempo dörtlük/dk: txt'deki ilk notanın süresinden (başlıktaki metronomun birimi sekizlik olabiliyor)
    p.tempo = Math.round(p.tempo || +tag(h, /<per-minute>([\d.]+)<\/per-minute>/) || 80);
    const ws = p.notes.filter(n => n[0] !== null).map(n => Math.round(67 + n[0]*12/53));
    const lo = Math.min(...ws), hi = Math.max(...ws);
    const last = [...p.notes].reverse().find(n => n[0] !== null)[0];
    fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify({ id, ...p }));
    const beats = p.notes.reduce((a, n) => a + n[1], 0);
    index.push({ id, t: title, mk, mkn: (wpart("Makam") || mk).trim(), f: fm, fn: (wpart("Form") || fm).trim(),
      u: us, un: (wpart("Usul") || us).trim(), b: composer && composer !== "?" ? composer : null, g: poet && poet !== "?" ? poet : null,
      n: ws.length, s: Math.round(beats*60/p.tempo), tp: p.tempo, lo, hi, k: last, lyr: p.notes.some(n => n[3]) ? 1 : 0,
      fit: lo >= LOW_NOTE && hi <= HIGH_NOTE ? 1 : lo + 12 >= LOW_NOTE && hi + 12 <= HIGH_NOTE || lo - 12 >= LOW_NOTE && hi - 12 <= HIGH_NOTE ? 2 : 0,
      mb: mbid.get(id) || null, x: difficulty(p) });
  }
  // Seviye: zorluk puanının üçte birlik dilimleri (1 başlangıç, 2 orta, 3 ileri)
  const xs = index.map(e => e.x).sort((a, b) => a - b), q1 = xs[Math.floor(xs.length/3)], q2 = xs[Math.floor(xs.length*2/3)];
  index.forEach(e => { e.lv = e.x < q1 ? 1 : e.x < q2 ? 2 : 3; delete e.x; });
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({
    source: "SymbTr (M. K. Karaosmanoğlu; Music Technology Group, Universitat Pompeu Fabra) · CC BY-NC-SA 4.0 · https://github.com/MTG/SymbTr",
    pieces: index }));
  const size = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
  console.log(`${index.length} eser, ${(size/1e6).toFixed(1)} MB → notalar/`);
})();
