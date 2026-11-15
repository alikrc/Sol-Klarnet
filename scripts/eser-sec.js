#!/usr/bin/env node
// Derslere ve repertuvar merdivenine eser adayı (docs/BACKLOG.md S1.6, S3.3, S4.1): nota arşivini ölçütlere göre süzer,
// aday listesi basar. Arşive dokunmaz.
// Telif: yalnız telifli (docs/lisans-disla.csv) ve belirsiz (docs/lisans-belirsiz.csv) olmayan eserler; güfte yazarı
// SymbTr'de kayıtlı olmayan sözlü eserler (docs/lisans-guftesiz.csv) yazarı bulunup kamu malı değilse dışarıda kalır.
// Ölçütlerin hepsi dizinden ya da eser dosyasından ölçülür (yazılı nota: Sol klarnet).
//
// Kullanım: node scripts/eser-sec.js [--basamak 1..6] [--sec] [--makam rast,ussak|hepsi] [--usul sofyan,duyek|hepsi]
//           [--form turku,sarki] [--aralik 52-70] [--en-kisa 0.25] [--ms 200] [--sn 90] [--koma 2] [--sus 8] [--oktav -1]
//           [--haric id,id] [--n 30]
//   Varsayılan: S1.6 ilk eserler ölçütü (= --basamak 1). Tek tek verilen ölçüt, basamağın ayarını ezer.
//   --basamak: repertuvar merdiveninin basamak ölçütü (BASAMAK tablosu, S4.1)
//   --sec: form dengesiyle 10 eser seçer (4 şarkı, 2 türkü, 2 saz eseri, 2 oyun havası ya da ilâhî; eksik kalan form
//          ötekilerden tamamlanır; aynı makamdan en çok iki) ve repertuvar.js'e yapıştırılacak satırları basar
//   --oktav: aralık ölçütü eserin bu kadar oktav kaydırılmış hâline uygulanır (derste piece { oct }); 0: asıl yeri.
//          Basamak 1'de −1: arşivde ilk basamağın makam ve usullerinde hiçbir eser Si♭4'ün altında kalmıyor
//   --ms: en kısa notanın eserin kendi temposundaki süresi (SymbTr kısa süsleri onaltılıkla yazar; değer adından iyi ölçüt;
//          Temeller etütlerinde sekizlik ≈ 375–420 ms)
//   --koma: Batı yarım seslerinden ayrışan (≥ 0,1 yarım ses) en çok kaç farklı perde; --sus: en çok kaç süslemeli nota
//   --haric: bu eserler aday olmaz (alt basamaklarda ya da derslerde kullanılanlar)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), doc = f => path.join(root, "docs", f);
const { noteName } = require(path.join(root, "core.js"));

// Uygulamanın makamları arşiv kimlikleriyle (archive.js ARCH_MAKAM'ın tersi)
const TEMEL10 = ["rast", "ussak", "huseyni", "hicaz", "nihavent", "kurdi", "saba", "segah", "huzzam", "karcigar"];
const MAKAM20 = [...TEMEL10, "beyati", "hicaz_humayun", "hicaz_uzzal", "hicaz_zirgule", "suzinak", "hicazkar", "kurdilihicazkar", "mahur", "acemasiran", "nikriz"];
const U1 = ["sofyan", "duyek", "nimsofyan", "semai"], U2 = [...U1, "aksak", "curcuna", "turkaksagi"], U3 = [...U2, "yuruksemai", "devrihindi", "agiraksak"];
// Basamak ölçütleri (BACKLOG S4.1 tablosu; "en kısa değer" süreyle ölçülür, bkz. --ms)
const BASAMAK = {
  1: { makam:["rast", "ussak", "huseyni", "nihavent", "kurdi"], usul:U1, aralik:[52, 70], oktav:-1, sn:90, ms:200, koma:2, sus:8 },
  2: { makam:TEMEL10, usul:U2, aralik:[52, 79], oktav:0, sn:120, ms:180, koma:3, sus:15 },
  3: { makam:TEMEL10, usul:U3, aralik:[52, 84], oktav:0, sn:180, ms:130, koma:99, sus:99 },
  4: { makam:MAKAM20, usul:null, aralik:[52, 84], oktav:0, sn:300, ms:110, koma:99, sus:99 },
  5: { makam:null, usul:null, aralik:[52, 88], oktav:0, sn:420, ms:90, koma:99, sus:99 },
  6: { makam:null, usul:null, aralik:[52, 91], oktav:0, sn:480, ms:0, koma:99, sus:99 }
};

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const list = (k, d) => { const v = arg(k, null); return v === null ? d : v === "hepsi" ? null : v.split(","); };
const B = BASAMAK[+arg("basamak", 1)];
if(!B){ console.error("--basamak 1..6"); process.exit(1); }
const o = {
  makam: list("makam", B.makam), usul: list("usul", B.usul), form: list("form", null),
  aralik: arg("aralik", null) ? arg("aralik").split("-").map(Number) : B.aralik,
  enKisa: +arg("en-kisa", 0.125), ms: +arg("ms", B.ms), sn: +arg("sn", B.sn), koma: +arg("koma", B.koma), sus: +arg("sus", B.sus),
  oktav: +arg("oktav", B.oktav), n: +arg("n", 30), haric: new Set(list("haric", []) || []), sec: process.argv.includes("--sec")
};

// Telif listeleri (scripts/lisans-disla.js üretir)
const ids = f => new Set(fs.readFileSync(doc(f), "utf8").split("\n").slice(1).map(l => (l.match(/^﻿?"([^"]+)"/) || [])[1]).filter(Boolean));
const telifli = ids("lisans-disla.csv"), belirsiz = ids("lisans-belirsiz.csv");
const guftesiz = new Map(fs.readFileSync(doc("lisans-guftesiz.csv"), "utf8").split("\n").slice(1).filter(Boolean)
  .map(l => { const c = l.match(/"([^"]*)"|[^,]+/g).map(x => x.replace(/^"|"$/g, "")); return [c[0], c[7]]; }));   // id → guftekar_durum
const free = e => !telifli.has(e.id) && !belirsiz.has(e.id) && (!guftesiz.has(e.id) || guftesiz.get(e.id) === "kamu");

// Form öbekleri (merdivenin form dengesi)
const DANCE = new Set(["oyunhavasi", "karsilama", "kocekce", "rumeliturkusu", "sirto", "longa", "zeybek", "tavsanca", "kasaphavasi", "ilahi"]);
const SAZ = new Set(["sazsemaisi", "pesrev", "sazeseri", "longa", "medhal", "etud"]);
const NOT_PIECE = new Set(["seyir", "ornek_oz", "etud", "taksim"]);
const group = f => f === "sarki" ? "sarki" : f === "turku" || f === "rumeliturkusu" ? "turku" : SAZ.has(f) ? "saz" : DANCE.has(f) ? "dans" : "diger";

const { pieces } = JSON.parse(fs.readFileSync(path.join(root, "notalar", "index.json"), "utf8"));
const fileCache = new Map();
const readPiece = id => fileCache.get(id) || (fileCache.set(id, JSON.parse(fs.readFileSync(path.join(root, "notalar", id + ".json"), "utf8"))), fileCache.get(id));
// Eser ölçütü geçerse kaydı, geçmezse null. c: ölçüt (o ya da bir basamağın ayarı); telif ve haric burada değil
function check(e, c){
  if(c.makam && !c.makam.includes(e.mk)) return null;
  if(c.usul && !c.usul.includes(e.u)) return null;
  if(c.form && !c.form.includes(e.f)) return null;
  if(!(e.lo + 12*c.oktav >= c.aralik[0] && e.hi + 12*c.oktav <= c.aralik[1]) || !(e.s <= c.sn)) return null;
  const ns = readPiece(e.id).notes.filter(a => a[0] !== null);
  const shortest = Math.min(...ns.map(a => a[1]));
  if(shortest < (c.enKisa || 0) - 1e-9 || shortest*60000/(e.tp || 80) < c.ms) return null;
  // Koma perdesi: Batı yarım sesinden 0,1 yarım sesten çok ayrışan perde (Segâh, Eviç, Hüzzam…)
  const koma = [...new Set(ns.map(a => a[0]).filter(x => { const s = x*12/53; return Math.abs(s - Math.round(s)) >= 0.1; }))];
  if(koma.length > c.koma) return null;
  const orn = ns.filter(a => a[2]).length;
  if(orn > c.sus) return null;
  const w = x => noteName(Math.round(67 + x*12/53)).tr;
  return { id:e.id, t:e.t, mk:e.mkn, mkId:e.mk, u:e.un, f:e.fn, fId:e.f, s:e.s, lo:e.lo, hi:e.hi, kisa:shortest, koma: koma.map(w).join(" "), orn, b:e.b || "Anonim", lv:e.lv };
}
const out = [];
let n0 = 0;
const N = +arg("basamak", 1), prev = N > 1 ? BASAMAK[N - 1] : null;
for(const e of pieces){
  if(o.haric.has(e.id) || (o.sec && NOT_PIECE.has(e.f))) continue;   // merdivende yalnız eser (seyir örneği, taksim, etüt değil)
  if(o.makam && !o.makam.includes(e.mk) || o.usul && !o.usul.includes(e.u)) continue;
  n0++;
  if(!free(e)) continue;
  const r = check(e, o);
  if(!r) continue;
  // Bir üst zorluk: alt basamağın ölçütünü geçemeyen eser önce gelir (merdiven dereceli kalsın)
  r.yeni = prev ? !check(e, { ...prev, enKisa:0 }) : true;
  out.push(r);
}
out.sort((a, b) => (b.yeni - a.yeni) || (a.lv || 9) - (b.lv || 9) || a.s - b.s);
const fmtD = d => ({ 0.5:"sekizlik", 1:"dörtlük", 0.25:"onaltılık", 0.75:"noktalı sekizlik", 0.375:"noktalı onaltılık", 2:"ikilik", 0.125:"otuzikilik" })[d] || String(d);
const line = r => `${r.id}\n   ${r.t} · ${r.mk} · ${r.u} · ${r.f} · ${r.s} sn · ${noteName(r.lo + 12*o.oktav).tr}–${noteName(r.hi + 12*o.oktav).tr} · en kısa ${fmtD(r.kisa)}` +
  (r.koma ? ` · koma: ${r.koma}` : "") + (r.orn ? ` · ${r.orn} süs` : "") + ` · ${r.b} · seviye ${r.lv}`;
console.log(`Ölçüt: makam ${o.makam ? o.makam.join(",") : "hepsi"} · usul ${o.usul ? o.usul.join(",") : "hepsi"} · form ${o.form ? o.form.join(",") : "hepsi"} · ` +
  `yazılı ${o.aralik.join("–")}${o.oktav ? " (" + o.oktav + " oktav kaydırarak)" : ""} · en kısa ≥ ${o.ms} ms · ≤ ${o.sn} sn · koma perdesi ≤ ${o.koma} · süs ≤ ${o.sus}`);
console.log(`Makam ve usulü uyan ${n0} eser; telifsiz ve bütün ölçütleri geçen ${out.length}` + (prev ? `, alt basamağın ölçütünü geçemeyen (bir üst zorluk) ${out.filter(r => r.yeni).length}.` : "."));

if(!o.sec){
  console.log(`İlk ${Math.min(o.n, out.length)} (seviye, sonra süre sırasıyla):\n`);
  for(const r of out.slice(0, o.n)) console.log(line(r));
}else{
  // Form kotası; aynı makamdan en çok iki; kota dolmazsa kalan yer öteki öbeklerden
  const QUOTA = { sarki:4, turku:2, saz:2, dans:2 }, pick = [], mk = {};
  const ok = r => !pick.includes(r) && (mk[r.mkId] || 0) < 2;
  const take = r => { pick.push(r); mk[r.mkId] = (mk[r.mkId] || 0) + 1; };
  for(const [g, n] of Object.entries(QUOTA)) for(const r of out) if(pick.filter(x => group(x.fId) === g).length < n && group(r.fId) === g && ok(r)) take(r);
  for(const r of out) if(pick.length < 10 && ok(r)) take(r);
  for(const r of out) if(pick.length < 10 && !pick.includes(r)) take(r);
  const forms = pick.reduce((m, r) => (m[group(r.fId)] = (m[group(r.fId)] || 0) + 1, m), {});
  console.log(`Seçilen ${pick.length}: ${Object.entries(forms).map(x => x.join(" ")).join(", ")}\n`);
  for(const r of pick) console.log(line(r));
  console.log("\n// repertuvar.js REP_LADDER için:");
  console.log(pick.map(r => `    ["${r.id}", ${JSON.stringify(r.t)}]`).join(",\n"));
}
