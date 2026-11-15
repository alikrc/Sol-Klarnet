#!/usr/bin/env node
// Derslere eser adayı (docs/BACKLOG.md S1.6, S3.3, S4.1): nota arşivini ölçütlere göre süzer, kısa olandan uzuna aday
// listesi basar. Kimlikler elle seçilip derse yazılır (lessons.js eserSteps). Arşive dokunmaz.
// Telif: yalnız telifli (docs/lisans-disla.csv) ve belirsiz (docs/lisans-belirsiz.csv) olmayan eserler; güfte yazarı
// SymbTr'de kayıtlı olmayan sözlü eserler (docs/lisans-guftesiz.csv) yazarı bulunup kamu malı değilse dışarıda kalır.
// Ölçütlerin hepsi dizinden ya da eser dosyasından ölçülür (yazılı nota: Sol klarnet).
//
// Kullanım: node scripts/eser-sec.js [--makam rast,ussak] [--usul sofyan,duyek] [--form turku,sarki] [--aralik 52-70]
//           [--en-kisa 0.25] [--ms 200] [--sn 90] [--koma 2] [--sus 8] [--oktav -1] [--n 30]
//   Varsayılan: S1.6 ilk eserler ölçütü (Rast, Uşşak, Hüseynî, Nihâvend, Kürdî; Sofyan, Düyek, Nîm-sofyan, Semâî;
//   yazılı 52–70; ≤ 90 sn; en kısa nota %100 tempoda en az 200 ms; en çok iki koma perdesi, sekiz süs), bir oktav pes
//   çalınarak: arşivde bu makam
//   ve usullerin hiçbir eseri Si♭4'ün altında kalmıyor, ezgiler Re5–Do6'ya çıkıyor
//   --oktav: aralık ölçütü eserin bu kadar oktav kaydırılmış hâline uygulanır (derste piece { oct }); 0: asıl yeri
//   --en-kisa: en kısa değer (dörtlük cinsinden; SymbTr kısa süsleri onaltılıkla yazar, bu yüzden asıl ölçüt --ms: en kısa
//   notanın eserin kendi temposundaki süresi; Temeller etütlerinde sekizlik ≈ 375–420 ms)
//   --koma: Batı yarım seslerinden ayrışan (≥ 0,1 yarım ses) en çok kaç farklı perde; --sus: en çok kaç süslemeli nota
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), doc = f => path.join(root, "docs", f);
const { noteName } = require(path.join(root, "core.js"));

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const list = (k, d) => { const v = arg(k, null); return v === null ? d : v === "hepsi" ? null : v.split(","); };
const o = {
  makam: list("makam", ["rast", "ussak", "huseyni", "nihavent", "kurdi"]),
  usul: list("usul", ["sofyan", "duyek", "nimsofyan", "semai"]),
  form: list("form", null),
  aralik: arg("aralik", "52-70").split("-").map(Number),
  enKisa: +arg("en-kisa", 0.25), ms: +arg("ms", 200), sn: +arg("sn", 90), koma: +arg("koma", 2), sus: +arg("sus", 8), n: +arg("n", 30), oktav: +arg("oktav", -1)
};

// Telif listeleri (scripts/lisans-disla.js üretir)
const ids = f => new Set(fs.readFileSync(doc(f), "utf8").split("\n").slice(1).map(l => (l.match(/^﻿?"([^"]+)"/) || [])[1]).filter(Boolean));
const telifli = ids("lisans-disla.csv"), belirsiz = ids("lisans-belirsiz.csv");
const guftesiz = new Map(fs.readFileSync(doc("lisans-guftesiz.csv"), "utf8").split("\n").slice(1).filter(Boolean)
  .map(l => { const c = l.match(/"([^"]*)"|[^,]+/g).map(x => x.replace(/^"|"$/g, "")); return [c[0], c[7]]; }));   // id → guftekar_durum
const free = e => !telifli.has(e.id) && !belirsiz.has(e.id) && (!guftesiz.has(e.id) || guftesiz.get(e.id) === "kamu");

const { pieces } = JSON.parse(fs.readFileSync(path.join(root, "notalar", "index.json"), "utf8"));
const out = [];
let n0 = 0;
for(const e of pieces){
  if(o.makam && !o.makam.includes(e.mk)) continue;
  if(o.usul && !o.usul.includes(e.u)) continue;
  if(o.form && !o.form.includes(e.f)) continue;
  if(!(e.lo + 12*o.oktav >= o.aralik[0] && e.hi + 12*o.oktav <= o.aralik[1]) || !(e.s <= o.sn)) continue;
  n0++;
  if(!free(e)) continue;
  const raw = JSON.parse(fs.readFileSync(path.join(root, "notalar", e.id + ".json"), "utf8"));
  const ns = raw.notes.filter(a => a[0] !== null);
  const shortest = Math.min(...ns.map(a => a[1]));
  if(shortest < o.enKisa - 1e-9 || shortest*60000/(e.tp || 80) < o.ms) continue;
  // Koma perdesi: Batı yarım sesinden 0,1 yarım sesten çok ayrışan perde (Segâh, Eviç, Hüzzam…)
  const koma = [...new Set(ns.map(a => a[0]).filter(c => { const s = c*12/53; return Math.abs(s - Math.round(s)) >= 0.1; }))];
  if(koma.length > o.koma) continue;
  const orn = ns.filter(a => a[2]).length;
  if(orn > o.sus) continue;
  const w = c => noteName(Math.round(67 + c*12/53)).tr;
  out.push({ id:e.id, t:e.t, mk:e.mkn, u:e.un, f:e.fn, s:e.s, lo:e.lo, hi:e.hi, kisa:shortest, koma: koma.map(w).join(" "), orn, b:e.b || "Anonim", lv:e.lv });
}
out.sort((a, b) => a.s - b.s);
const fmtD = d => ({ 0.5:"sekizlik", 1:"dörtlük", 0.25:"onaltılık", 0.75:"noktalı sekizlik", 0.375:"noktalı onaltılık", 2:"ikilik" })[d] || String(d);
console.log(`Ölçüt: makam ${o.makam ? o.makam.join(",") : "hepsi"} · usul ${o.usul ? o.usul.join(",") : "hepsi"} · form ${o.form ? o.form.join(",") : "hepsi"} · ` +
  `yazılı ${o.aralik.join("–")}${o.oktav ? " (" + o.oktav + " oktav kaydırarak)" : ""} · en kısa ≥ ${fmtD(o.enKisa)} ve ${o.ms} ms · ≤ ${o.sn} sn · koma perdesi ≤ ${o.koma} · süs ≤ ${o.sus}`);
console.log(`Ölçüte uyan ${n0} eser; telifsiz ve değer, koma ölçütünü geçen ${out.length}. İlk ${Math.min(o.n, out.length)}:\n`);
for(const r of out.slice(0, o.n))
  console.log(`${r.id}\n   ${r.t} · ${r.mk} · ${r.u} · ${r.f} · ${r.s} sn · ${noteName(r.lo + 12*o.oktav).tr}–${noteName(r.hi + 12*o.oktav).tr} · en kısa ${fmtD(r.kisa)}` +
    (r.koma ? ` · koma: ${r.koma}` : "") + (r.orn ? ` · ${r.orn} süs` : "") + ` · ${r.b} · seviye ${r.lv}`);
