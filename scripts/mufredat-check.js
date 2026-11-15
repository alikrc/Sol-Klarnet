// Müfredat denetimi (npm run mufredat): ders verisinin tutarlılığını ölçer, ünite başına envanter tablosu basar.
// Test değil; hata bulursa listeler ve 1 ile çıkar. Denetlenenler (docs/BACKLOG.md S0.4):
//   ders kimlikleri tekil; her piece.id ETUDES'te, her piece.arsiv notalar/'da; makam, usul, ritim kalıbı ve hız kalıbı
//   kimlikleri veride; etüt yalnız o derse kadar öğretilmiş notaları kullanır (makamsız etütler); makam etüdü yalnız
//   makamın perdelerini kullanır; her { tr, en } metninin iki dili dolu; her ünitenin sınavı var; RM_STAGES bütün
//   üniteleri kapsar; GATE_AFTER döngüsüz; since alanı CURRICULUM_VER'i aşmaz; soru adımının cevap indeksi geçerli.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const req = f => require(path.join(ROOT, f));
const LS = req("lessons.js"), REP = req("repertoire.js"), LEARN = req("learn.js"), SK = req("skills.js"), RM = req("roadmap.js");
const { noteName } = req("core.js");

const errors = [], warns = [];
const err = (where, msg) => errors.push(where + ": " + msg);
const warn = (where, msg) => warns.push(where + ": " + msg);

// ---- Kimlikler ----
const ids = new Map();
for(const l of [...LS.LESSONS, ...LS.EXAMS]){ if(ids.has(l.id)) err(l.id, "ders kimliği tekrar ediyor"); ids.set(l.id, l); }
const units = new Set(LS.UNITS.map(u => u.id));
for(const l of LS.LESSONS) if(!units.has(l.unit)) err(l.id, "bilinmeyen ünite " + l.unit);

// ---- İki dil ----
function walkText(x, where){
  if(Array.isArray(x)) return x.forEach((y, i) => walkText(y, where + "[" + i + "]"));
  if(!x || typeof x !== "object") return;
  if("tr" in x || "en" in x){
    const empty = k => typeof x[k] !== "string" || !x[k].trim();
    if(empty("tr") || empty("en")) err(where, "metnin " + (empty("tr") ? "tr" : "en") + " dili boş");
    return;
  }
  for(const [k, v] of Object.entries(x)) walkText(v, where + "." + k);
}
for(const l of LS.LESSONS) walkText({ title:l.title, text:l.text, tips:l.tips, steps:l.steps }, l.id);
for(const u of LS.UNITS) walkText({ name:u.name, badge:u.badge }, "ünite " + u.id);

// ---- Adımlar ----
const makamIds = new Set(LEARN.MAKAMS.map(m => m.id)), usulIds = new Set(LEARN.USULS.map(u => u.id));
const rhythmIds = new Set(SK.RHYTHM_PATTERNS.map(p => p.id));
const notalar = new Set(fs.readdirSync(path.join(ROOT, "notalar")).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5)));
const okMakam = (where, id) => { if(id != null && !makamIds.has(id)) err(where, "bilinmeyen makam " + id); };
const known = new Set();                      // o derse kadar (dahil) öğretilmiş yazılı notalar, ders sırasıyla
const maxVer = LS.CURRICULUM_VER;
for(const l of LS.LESSONS){
  l.notes.forEach(w => known.add(w));
  okMakam(l.id, l.makam);
  if(l.since != null && !(l.since >= 2 && l.since <= maxVer)) err(l.id, "since " + l.since + " geçersiz (CURRICULUM_VER " + maxVer + ")");
  l.steps.forEach((st, k) => {
    const w = l.id + " adım " + (k + 1) + " (" + st.type + ")";
    okMakam(w, st.makam);
    if(st.usul != null && !usulIds.has(st.usul)) err(w, "bilinmeyen usul " + st.usul);
    if(st.type === "rhythm" && st.pattern && !rhythmIds.has(st.pattern)) err(w, "bilinmeyen ritim kalıbı " + st.pattern);
    if((st.type === "tech" || (st.type === "listen" && st.pattern)) && !SK.techPattern(st.pattern)) err(w, "hız kalıbı üretilemedi " + JSON.stringify(st.pattern));
    if(st.type === "ear" && Array.isArray(st.pool)) st.pool.forEach(m => okMakam(w, m));
    if(st.type === "soru"){
      const items = LS.soruItems(st);
      items.forEach((it, j) => {
        if(!Array.isArray(it.opts) || it.opts.length < 2) err(w, "soru " + (j + 1) + ": en az iki seçenek gerekir");
        else if(!(Number.isInteger(it.ok) && it.ok >= 0 && it.ok < it.opts.length)) err(w, "soru " + (j + 1) + ": ok indeksi geçersiz");
        if(it.score){ const r = REP.parseScoreText(it.score); if(r.errors.length) err(w, "soru " + (j + 1) + ": nota metni okunamadı: " + r.errors.join(" ")); }
      });
      if(LS.soruMin(st) > items.length) err(w, "min soru sayısından büyük");
    }
    if(st.type === "piece"){
      if(st.arsiv != null){ if(!notalar.has(st.arsiv)) err(w, "arşivde yok: " + st.arsiv); return; }
      const e = REP.etudeById(st.id);
      if(!e){ err(w, "etüt yok: " + st.id); return; }
      const ns = REP.etudeNotes(e).filter(n => !n.rest);
      if(e.makam){
        const m = LEARN.makamById(e.makam);
        if(!m){ err(e.id, "etüdün makamı yok: " + e.makam); return; }
        const mod = c => ((c % 53) + 53) % 53, pc = new Set([...m.asc, ...m.desc].map(mod));
        const bad = [...new Set(ns.filter(n => n.c != null && !pc.has(mod(n.c))).map(n => LEARN.perdeName(n.c)))];
        if(bad.length) err(w, e.id + " makamın dışında perde: " + bad.join(", "));
      }else{
        const bad = [...new Set(ns.filter(n => !known.has(n.w)).map(n => n.w))].sort((a, b) => a - b);
        if(bad.length) err(w, e.id + " öğretilmemiş nota: " + bad.map(x => noteName(x).tr).join(", "));
      }
    }
  });
}
// Etütlerin ölçüleri
for(const e of REP.ETUDES){
  const bars = REP.barCheck(REP.etudeNotes(e), e.meter || [4, 4]), bad = bars.filter(b => !b.ok);
  if(bad.length) err(e.id, bad.length + " ölçü tutmuyor (" + bars.indexOf(bad[0]) + ". ölçüden)");
}

// ---- Üniteler, sınavlar, yol haritası, kapılar ----
for(const u of LS.UNITS) if(!LS.examFor(u.id)) err("ünite " + u.id, "sınavı yok");
const staged = new Set(RM.RM_STAGES.flatMap(s => s.units));
for(const u of LS.UNITS) if(!staged.has(u.id)) err("ünite " + u.id, "RM_STAGES'te yok");
for(const s of RM.RM_STAGES) for(const u of s.units) if(!units.has(u)) err("RM_STAGES " + s.id, "bilinmeyen ünite " + u);
{
  const G = LS.GATE_AFTER, state = {};
  const visit = (u, trail) => {
    if(state[u] === 2) return;
    if(state[u] === 1){ err("GATE_AFTER", "döngü: " + [...trail, u].join(" → ")); return; }
    state[u] = 1; (G[u] || []).forEach(v => { if(!units.has(v)) err("GATE_AFTER " + u, "bilinmeyen ünite " + v); visit(v, [...trail, u]); }); state[u] = 2;
  };
  Object.keys(G).forEach(u => visit(u, []));
}

// ---- Tarayıcı yükleme sırası ----
// Node'da her dosya require ile istendiği an yüklenir; tarayıcıda index.html sırasıyla. lessons.js yüklenirken sonra
// gelen dosyaların (repertoire.js, skills.js) işlevini çağıran ders verisi Node'da çalışır, tarayıcıda uygulamayı durdurur.
// Bu yüzden dosyalar index.html sırasıyla, modül sistemi olmadan, archive.js'e kadar bir kez daha yüklenir (aynı bağlam
// arşiv adımlarının ölçü aralığını denetlemekte de kullanılır: archive.js archSlice)
const vm = require("vm"), NL = String.fromCharCode(10);
const bctx = (() => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const order = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  const upto = order.slice(0, order.indexOf("archive.js") + 1);
  const noop = () => {}, any = new Proxy(function(){}, { get: (t, k) => k === Symbol.toPrimitive ? () => "" : any, apply: () => any, construct: () => any });
  const ctx = { console, setTimeout, clearTimeout, navigator:{ language:"tr" }, document:any, location:{ search:"", protocol:"http:" },
    localStorage:{ getItem: () => null, setItem:noop, removeItem:noop, key: () => null, length:0 }, addEventListener:noop,
    matchMedia: () => ({ matches:false, addEventListener:noop }), performance:{ now: () => 0 } };
  ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
  for(const f of upto){
    let code = fs.readFileSync(path.join(ROOT, f), "utf8");
    // Denetimin kendisini sınamak için: MUFREDAT_INJECT='LREP().parseScoreText("Do4");' hatayı yakalamalı
    if(f === "lessons.js" && process.env.MUFREDAT_INJECT) code = code.replace("const pick = (x, lang)", process.env.MUFREDAT_INJECT + NL + "const pick = (x, lang)");
    try{ vm.runInContext(code, ctx, { filename:f }); }
    catch(e){ err("tarayıcı yükleme sırası (" + f + ")", e.message); return null; }
  }
  return ctx;
})();

// ---- Arşiv eserli adımlar ----
// Ölçü aralığı eserin içinde mi;
// eserin (oktav kaydırılmış) notaları o derse kadar öğretilmiş mi (koma perdeleri yakın yazılı notayla sayılır)
{
  const taught = new Set();
  for(const l of LS.LESSONS){
    l.notes.forEach(x => taught.add(x));
    l.steps.forEach((st, k) => {
      if(!st.arsiv || !notalar.has(st.arsiv)) return;
      const w = l.id + " adım " + (k + 1) + " (" + st.type + ")";
      if(!st.name) err(w, "arşiv adımında name yok");
      if(!bctx) return;
      const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "notalar", st.arsiv + ".json"), "utf8"));
      const s = bctx.archSlice(raw, st.from, st.to, st.oct || 0);
      if((st.from != null || st.to != null) && ((st.from || 1) !== s.from || (st.to != null && st.to !== s.to)))
        err(w, "ölçü aralığı " + (st.from || 1) + "–" + st.to + " eserde yok (" + s.bars + " ölçü)");
      if(st.type === "piece"){
        const bad = [...new Set(s.notes.filter(n => !n.rest && !taught.has(n.w)).map(n => n.w))].sort((a, b) => a - b);
        if(bad.length) err(w, "öğretilmemiş nota: " + bad.map(x => noteName(x).tr).join(", "));
      }
    });
  }
}

// ---- Envanter ----
const rows = [], seen = new Set();
let tot = { l:0, e:0, n:0 };
for(const u of LS.UNITS){
  const ls = LS.LESSONS.filter(l => l.unit === u.id), et = new Set(), fresh = new Set();
  for(const l of ls){
    l.steps.forEach(st => { if(st.type === "piece") et.add(st.arsiv ? "arsiv:" + st.arsiv : st.id); });
    l.notes.forEach(w => { if(!seen.has(w)){ seen.add(w); fresh.add(w); } });
  }
  rows.push([u.name.tr, ls.length, et.size, fresh.size, ls.filter(l => l.since).length]);
  tot.l += ls.length; tot.e += et.size; tot.n += fresh.size;
}
const pad = (s, n) => String(s) + " ".repeat(Math.max(0, n - String(s).length));
console.log(pad("Ünite", 22) + pad("Ders", 6) + pad("Etüt", 6) + pad("Yeni nota", 11) + "Sonradan eklenen");
for(const r of rows) console.log(pad(r[0], 22) + pad(r[1], 6) + pad(r[2], 6) + pad(r[3], 11) + r[4]);
console.log(pad("Toplam", 22) + pad(tot.l, 6) + pad(tot.e, 6) + pad(tot.n, 11) + "· " + LS.EXAMS.length + " sınav · " + REP.ETUDES.length + " etüt verisi · müfredat sürümü " + maxVer);

if(warns.length){ console.log("\nUyarılar (" + warns.length + "):"); warns.forEach(x => console.log("  " + x)); }
if(errors.length){ console.log("\nHatalar (" + errors.length + "):"); errors.forEach(x => console.log("  " + x)); process.exit(1); }
console.log("\nHata yok.");
