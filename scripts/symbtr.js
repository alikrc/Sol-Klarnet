// SymbTr koleksiyonunu uygulamanın nota arşivine çevirir.
//   v3.0 (2025, Zenodo 15470412, M. K. Karaosmanoğlu, CC BY 4.0, 3000 eser) ana kaynaktır.
//   v2.4 (GitHub MTG/SymbTr, CC BY-NC-SA 4.0, 2200 eser) yalnız iki iş için okunur: v3'te olmayan eserler (src: "v2")
//   ve v2'de de bulunan eserlerin başlık, makam, bestekâr adları (lisans tabloları bu adlarla tutulur).
// Kullanım: node scripts/symbtr.js <v3 klasörü> <v2 deposu>
//   v3 klasörü: Zenodo'daki txt_v3.zip ve xml_v3.zip, txt/ ve xml/ adlı alt klasörlere açılmış olmalı.
//   v2 deposu: github.com/MTG/SymbTr; txt/, MusicXML/ ve symbTr_mbid.json okunur.
// v3'te adı değişen v2 eserleri scripts/symbtr-adlar.json'da (eski kimlik → v3 kimliği); bunlar eski kimlikle yazılır,
// böylece kullanıcının o esere bağlı kayıtları (son çalınan, ilerleme) kaybolmaz.
// Çıktı: notalar/index.json (arşiv dizini) ve notalar/<id>.json (her eser).
//
// Eser dosyası: { id, notes:[[c, d, süs?, hece?]], sections:[[i, ad]], phrases:[i], meters:[[i, pay, payda, usul]], tempo }
//   c: Rast'a (yazılı Sol4) göre koma, sus için null; d: dörtlük cinsinden süre; süs: "tr" "m+" "m-" "ç+" "ç-".
// SymbTr txt sütunları: Sira Kod Nota53 NotaAE Koma53 KomaAE Pay Payda Ms LNS Bas Soz1 Offset.
// Kod: 9 nota/sus, 8 çarpma (süresiz), 1 küçük nota, 11 sessiz çarpma, 12/13 tril, 32 aşağı tril, 23 mordan,
//   24 aşağı mordan, 43/44 ters mordan, 51 usul, 52 tempo, 53 cümle sınırı (code_explanations.xlsx).
// v3 txt dosyalarının çoğu Windows-1254 (Türkçe) kodlamalı; usul satırı (51) yalnız ölçüsü değişen eserlerde var,
// geri kalanında ölçü MusicXML'deki ilk <time>'dan alınır.
const fs = require("fs");
const path = require("path");
const { LOW_NOTE, HIGH_NOTE } = require("../core.js");
const { fixEntry } = require("./basliklar.js");

const [V3, V2] = process.argv.slice(2);
if(!V3 || !V2 || !fs.existsSync(path.join(V3, "txt")) || !fs.existsSync(path.join(V2, "txt"))){
  console.error("Kullanım: node scripts/symbtr.js <v3 klasörü (txt/, xml/)> <v2 deposu (txt/, MusicXML/)>"); process.exit(1);
}
const OUT = path.join(__dirname, "..", "notalar");
const RAST = 296;                                  // SymbTr Koma53'te Sol4

const GRACE = new Set([1, 8, 11, 17]);
const ORN = { 12:"tr", 13:"tr", 32:"tr", 23:"m+", 43:"m+", 24:"m-", 44:"m-" };
const SECTION = /^[A-ZÇĞİÖŞÜÂÎÛ0-9 .\-]+$/;

const read = f => { const b = fs.readFileSync(f), u = b.toString("utf8"); return u.includes("�") ? new TextDecoder("windows-1254").decode(b) : u; };
const tag = (s, re) => { const m = re.exec(s); return m ? unmoji(m[1].trim()).replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"') : null; };
const flat = s => (s || "").replace(/[_\-]/g, "");
// Birkaç v3 XML'i iki kez kodlanmış ("GÃ¶rdÃ¼"): Windows-1252 baytlarına geri çevirip UTF-8 olarak okunur
const CP1252 = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const unmoji = s => !s || !/[ÃÄÅ][-¿‘-›Œ-ƒˆ˜€™]/.test(s) ? s :
  Buffer.from([...s].map(c => { const i = CP1252.indexOf(c); return i >= 0 ? 0x80 + i : c.charCodeAt(0); })).toString("utf8");
// Kimlik ve kısa adlarda Türkçe harf ve ayraç olmasın (dosya adı, adres): "düyek" → "duyek", "(belirsiz)" → "belirsiz"
const ascii = s => s.replace(/[çğıöşü]/g, c => "cgiosu"["çğıöşü".indexOf(c)]).replace(/[()]/g, "");
// v2'de olmayan formların adları (v3 başlığındaki "Makam: X Form" bazen yanlış: Sedaraban taksimi "Şarkı" yazıyor)
const NEW_FORMS = { taksim: "Taksim", azeriturku: "Azerî türküsü", duet: "Düet", ezan: "Ezan", gazel: "Gazel", tango: "Tango",
  nakis_agirsemai: "Nakış ağır semâî" };

function parseTxt(text){
  const rows = text.split(/\r?\n/).slice(1).filter(Boolean).map(l => l.split("\t"));
  const notes = [], sections = [], phrases = [], meters = [];
  let grace = null, lastSec = null;
  const tempos = [];
  for(const r of rows){
    const kod = +r[1], koma = +r[4], pay = +r[6], payda = +r[7], ms = +r[8], soz = unmoji((r[11] || "").replace(/\s+$/, ""));
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

// v2 başlığı: <words>Makam: X, Form: Y, Usul: Z</words>, creator composer/poet
function headV2(id){
  const h = read(path.join(V2, "MusicXML", id + ".xml")).slice(0, 6144);
  const words = tag(h, /<words[^>]*>([^<]*Makam:[^<]*)<\/words>/) || "";
  const wpart = k => ((new RegExp(k + ":\\s*([^,]+)").exec(words) || [, null])[1] || "").trim() || null;
  return { t: tag(h, /<work-title>([^<]*)<\/work-title>/), b: tag(h, /<creator type="composer">([^<]*)<\//),
    g: tag(h, /<creator type="poet">([^<]*)<\//), mkn: wpart("Makam"), fn: wpart("Form"), un: wpart("Usul"),
    pm: +tag(h, /<per-minute>([\d.]+)<\/per-minute>/) || null };
}
// v3 başlığı: composer "Beste: X", lyricist, credit-words "Makam: <makam> <form>" ve "Usul: X"; ölçü ilk <time>'da
function headV3(id){
  const x = read(path.join(V3, "xml", id + ".xml"));
  const h = x.slice(0, 8192);
  const time = /<beats>(\d+)<\/beats>\s*<beat-type>(\d+)<\/beat-type>/.exec(x);
  return { t: tag(h, /<work-title>([^<]*)<\/work-title>/), b: (tag(h, /<creator type="composer">([^<]*)<\//) || "").replace(/^Beste:\s*/, ""),
    g: tag(h, /<creator type="(?:lyricist|poet)">([^<]*)<\//), mf: tag(h, />\s*Makam:\s*([^<]*)</), un: tag(h, />\s*Usul:\s*([^<]*)</),
    pm: +tag(x, /<sound tempo="([\d.]+)"/) || null, time: time ? [+time[1], +time[2]] : null };
}

(async () => {
  const renamed = JSON.parse(fs.readFileSync(path.join(__dirname, "symbtr-adlar.json"), "utf8"));
  const v3ToOld = new Map(Object.entries(renamed).map(([o, n]) => [n, o]));
  const mbid = new Map(JSON.parse(fs.readFileSync(path.join(V2, "symbTr_mbid.json"), "utf8"))
    .map(e => [e.name, (e.uuid || "").replace(/^https?:\/\/musicbrainz\.org\/work\//, "")]));
  const list = d => fs.readdirSync(d).filter(f => f.endsWith(".txt")).map(f => f.slice(0, -4)).sort();
  const v2ids = new Set(list(path.join(V2, "txt"))), v3ids = list(path.join(V3, "txt"));
  for(const [o, n] of Object.entries(renamed)) if(!v2ids.has(o) || !v3ids.includes(n)) throw new Error("symbtr-adlar.json: bulunamadı " + o);

  // v2 başlıkları: v2'de de olan eserlerin adları ve makam/form/usul ad sözlükleri
  const heads2 = new Map([...v2ids].map(id => [id, headV2(id)]));
  const cache2 = new Map(), txt2 = id => cache2.get(id) || cache2.set(id, parseTxt(read(path.join(V2, "txt", id + ".txt")))).get(id);
  const names = { mk: new Map(), f: new Map(), u: new Map() }, slugs = { mk: new Map(), f: new Map(), u: new Map() };
  for(const [id, h] of heads2){
    const [mk, f, u] = id.split("--");
    for(const [k, s, n] of [["mk", mk, h.mkn], ["f", f, h.fn], ["u", u, h.un]]){
      if(n && !names[k].has(s)) names[k].set(s, n);
      if(!slugs[k].has(flat(s))) slugs[k].set(flat(s), s);
    }
  }
  // Usulün v2'deki ölçüsü: o usulle yazılmış eserlerin en az %80'i aynı ölçüdeyse
  const usulMeter = new Map(), byUsul = new Map();
  for(const id of v2ids){
    const u = id.split("--")[2], m = txt2(id).meters[0];
    if(!m) continue;
    if(!byUsul.has(u)) byUsul.set(u, new Map());
    const c = byUsul.get(u), k = m[1] + "/" + m[2]; c.set(k, (c.get(k) || 0) + 1);
  }
  for(const [u, c] of byUsul){
    const [k, n] = [...c].sort((a, b) => b[1] - a[1])[0], all = [...c.values()].reduce((a, b) => a + b, 0);
    if(n >= all*0.8) usulMeter.set(u, k.split("/").map(Number));
  }
  // Kişi adları v2'deki yazımıyla (lisans tabloları bu adlarla): "Lem´i Atlı" → "Lemi Atlı", "Nev´eser" → "Neveser"
  const fold = s => (s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ´`'’()\s.\-]/g, "").replace(/ı/g, "i");
  const people = new Map();
  for(const h of heads2.values()) for(const n of [h.b, h.g]) if(n && !people.has(fold(n))) people.set(fold(n), n);
  const person = n => n && people.get(fold(n)) || n;
  // v3'te yazımı değişen kısa adlar (beyatiaraban, dugah-maye) v2'deki gibi yazılır; makam süzgeci tek grup görsün
  const slug = (k, s) => slugs[k].get(flat(s)) || s;

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT);
  const index = [], unknown = new Set();
  function add(id, src, p, h, slugs3){
    if(!p.notes.some(n => n[0] !== null)) return;
    const [mk, fm, us] = slugs3, ad = id.split("--")[3];
    p.tempo = Math.round(p.tempo || h.pm || 80);
    const ws = p.notes.filter(n => n[0] !== null).map(n => Math.round(67 + n[0]*12/53));
    const lo = Math.min(...ws), hi = Math.max(...ws);
    const last = [...p.notes].reverse().find(n => n[0] !== null)[0];
    fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify({ id, ...p }));
    const beats = p.notes.reduce((a, n) => a + n[1], 0);
    const who = s => s && s !== "?" && s !== "-?" ? s : null;
    index.push({ id, t: h.t || (ad || id).replace(/_/g, " "), mk, mkn: h.mkn || mk, f: fm, fn: h.fn || fm, u: us, un: h.un || us,
      b: who(h.b), g: who(h.g), n: ws.length, s: Math.round(beats*60/p.tempo), tp: p.tempo, lo, hi, k: last, lyr: p.notes.some(n => n[3]) ? 1 : 0,
      fit: lo >= LOW_NOTE && hi <= HIGH_NOTE ? 1 : lo + 12 >= LOW_NOTE && hi + 12 <= HIGH_NOTE || lo - 12 >= LOW_NOTE && hi - 12 <= HIGH_NOTE ? 2 : 0,
      mb: mbid.get(src === "v2" ? id : v3ToOld.get(id) || id) || null, x: difficulty(p), ...(src === "v2" ? { src } : {}) });
    fixEntry(index[index.length - 1]);                      // büyük harf hataları, bitişik form adları
  }

  for(const id3 of v3ids){
    const id = v3ToOld.get(id3) || ascii(id3), old = v2ids.has(id) ? id : null;
    const p = parseTxt(read(path.join(V3, "txt", id3 + ".txt"))), h3 = headV3(id3);
    let [mk, fm, us] = id3.split("--");
    mk = slug("mk", ascii(mk)); fm = slug("f", ascii(fm)); us = slug("u", ascii(us));
    // Ad: v2'de olan eserde v2 başlığı (lisans tabloları bu adlarla), yenide v3 başlığı
    let h;
    if(old){ const h2 = heads2.get(old); h = { ...h2, pm: h3.pm || h2.pm }; [mk, fm, us] = old.split("--"); }
    else{
      const fn = names.f.get(fm) || NEW_FORMS[fm], mkn = names.mk.get(mk), mf = h3.mf || "";
      // "Makam: Acemaşîrân Şarkı": bilinen form adı sondan, bilinen makam adı baştan ayrılır
      const rest = fn && mf.endsWith(fn) ? mf.slice(0, -fn.length).trim() : null;
      h = { t: h3.t, b: person(h3.b), g: person(h3.g), pm: h3.pm, un: names.u.get(us) || h3.un,
        mkn: mkn || rest || mf.split(" ").slice(0, -1).join(" ") || null,
        fn: fn || (mkn && mf.startsWith(mkn) ? mf.slice(mkn.length).trim() : mf.split(" ").slice(-1)[0]) || null };
      if(!mkn) unknown.add(`makam ${mk} → ${h.mkn}`);
      if(!fn) unknown.add(`form ${fm} → ${h.fn}`);
      if(!names.u.get(us)) unknown.add(`usul ${us} → ${h.un}`);
    }
    // Ölçü. v3 XML'i büyük usulleri (Devr-i Kebîr 28/4, Hâvî 64/4) 4/4'lük ölçülere bölüyor; uygulama ölçüyü usul devri
    // sayar. v2'de de olan eserde v2'nin usul satırları (ölçü sayıları; nota sayısı aynıysa yerleriyle birlikte), yeni eserde
    // v2'de bu usulle yazılmış eserlerin çoğunun ölçüsü, o da yoksa XML'deki ilk ölçü kullanılır.
    const p2 = old && txt2(old);
    const first = p2?.meters[0]?.slice(1, 3) || usulMeter.get(us) || h3.time;
    if(!p.meters.length){
      if(p2 && p2.meters.length > 1 && p2.notes.length === p.notes.length) p.meters = p2.meters.map(m => [...m]);
      else if(first) p.meters = [[0, ...first, h.un || ""]];
    }
    else if(p.meters[0][0] > 0 && first) p.meters.unshift([0, ...first, h.un || ""]);
    if(p.meters.length && !p.meters[0][3]) p.meters[0][3] = h.un || "";
    add(id, "v3", p, h, [mk, fm, us]);
  }
  // v3'te olmayan v2 eserleri (CC BY-NC-SA; ticari sürümde çıkarılmalı, bkz. docs/LISANSLAR.md)
  const inV3 = new Set([...v3ids, ...v3ToOld.values()]);
  let v2only = 0;
  for(const id of v2ids){
    if(inV3.has(id)) continue;
    v2only++;
    add(id, "v2", txt2(id), heads2.get(id), id.split("--").slice(0, 3));
  }
  // Seviye: zorluk puanının üçte birlik dilimleri (1 başlangıç, 2 orta, 3 ileri)
  const xs = index.map(e => e.x).sort((a, b) => a - b), q1 = xs[Math.floor(xs.length/3)], q2 = xs[Math.floor(xs.length*2/3)];
  index.forEach(e => { e.lv = e.x < q1 ? 1 : e.x < q2 ? 2 : 3; delete e.x; });
  index.sort((a, b) => a.id < b.id ? -1 : 1);
  fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({
    source: "SymbTr v3.0 (M. K. Karaosmanoğlu, 2025) · CC BY 4.0 · https://doi.org/10.5281/zenodo.15470412; " +
      "src:v2 işaretli eserler SymbTr v2.4 (MTG, Universitat Pompeu Fabra) · CC BY-NC-SA 4.0 · https://github.com/MTG/SymbTr",
    pieces: index }));
  const size = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
  if(unknown.size) console.log("v2'de adı olmayan kısa adlar (başlıktan çıkarıldı):\n  " + [...unknown].sort().join("\n  "));
  console.log(`${index.length} eser (v3 ${v3ids.length}, yalnız v2 ${v2only}), ${(size/1e6).toFixed(1)} MB → notalar/`);
})();
