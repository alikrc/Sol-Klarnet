#!/usr/bin/env node
// Geçki dersine eser adayı (docs/BACKLOG.md S3.4): arızaların ölçü ölçü değiştiği eserleri bulur. Arşive dokunmaz.
// Ölçüt yalnız uygulamadaki dizilerden hesaplanır (learn.js MAKAMS, similarMakams): eser, makamının dizisiyle başlar;
// bir ölçüde makamın dizisinde olmayan perdeler girer ve bu perdelerin hepsi aynı durakta karar veren, dizisi en çok
// --fark perdeyle ayrılan bir makamın (geçilen makam) ayıran perdeleridir; sonra eser yeniden kendi dizisine döner
// (ana makamın ayıran perdesi yeniden çalınır) ve durakta biter. Süslemeli ve çok kısa (--kisa vuruştan kısa) notalar
// sayılmaz: geçici bir geçiş notası renk değiştirmez.
// Telif süzgeci scripts/eser-sec.js ile aynı (lisans-disla, lisans-belirsiz, lisans-guftesiz).
//
// Kullanım: node scripts/gecki-sec.js [--makam rast,ussak|hepsi] [--aralik 52-84] [--sn 300] [--ilk 16] [--fark 3]
//           [--kisa 0.5] [--sure 2] [--n 30]
//   --ilk: geçkinin en geç başladığı ölçü (dinleme adımı kısa kalsın)
//   --sure: geçilen makamın perdelerinin geçkideki toplam süresi en az bu kadar vuruş (tek bir geçiş notası sayılmaz)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), doc = f => path.join(root, "docs", f);
const { MAKAMS, makamById, similarMakams, perdeName } = require(path.join(root, "learn.js"));

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const mkArg = arg("makam", "hepsi");
const o = {
  makam: mkArg === "hepsi" ? null : mkArg.split(","), aralik: arg("aralik", "52-84").split("-").map(Number), sn: +arg("sn", 300),
  ilk: +arg("ilk", 16), fark: +arg("fark", 3), kisa: +arg("kisa", 0.5), sure: +arg("sure", 2), n: +arg("n", 30)
};

// Telif listeleri (eser-sec.js ile aynı)
const ids = f => new Set(fs.readFileSync(doc(f), "utf8").split("\n").slice(1).map(l => (l.match(/^﻿?"([^"]+)"/) || [])[1]).filter(Boolean));
const telifli = ids("lisans-disla.csv"), belirsiz = ids("lisans-belirsiz.csv");
const guftesiz = new Map(fs.readFileSync(doc("lisans-guftesiz.csv"), "utf8").split("\n").slice(1).filter(Boolean)
  .map(l => { const c = l.match(/"([^"]*)"|[^,]+/g).map(x => x.replace(/^"|"$/g, "")); return [c[0], c[7]]; }));
const free = e => !telifli.has(e.id) && !belirsiz.has(e.id) && (!guftesiz.has(e.id) || guftesiz.get(e.id) === "kamu");

// Arşiv makam kimliği → uygulamanın makamı (archive.js ARCH_MAKAM)
const ARCH_MAKAM = { nihavent:"nihavend", beyati:"bayati", hicaz_zirgule:"zirguleli", hicaz_humayun:"humayun", hicaz_uzzal:"uzzal" };
const appMakam = mk => makamById(ARCH_MAKAM[mk] || mk);
// Ölçüler (archive.js archMeasures ile aynı bölme; ölçü numarası çalınış sırasıdır)
function measures(notes, meters){
  const ms = []; let from = 0, acc = 0, mi = 0, cur = meters[0] || [0, 4, 4, ""];
  for(let i = 0; i < notes.length; i++){
    while(mi + 1 < meters.length && meters[mi + 1][0] <= i){ mi++; if(i > from){ ms.push({ from, to:i }); from = i; acc = 0; } cur = meters[mi]; }
    const bar = cur[1]*4/cur[2];
    acc += notes[i][1];
    if(acc >= bar - 1e-6){ ms.push({ from, to:i + 1 }); from = i + 1; acc = Math.max(0, acc - bar); if(acc < 1e-6) acc = 0; }
  }
  if(from < notes.length) ms.push({ from, to:notes.length });
  return ms;
}
const m53 = c => ((c % 53) + 53) % 53;
const scaleSet = mk => new Set([...mk.asc, ...mk.desc].map(m53));

const { pieces } = JSON.parse(fs.readFileSync(path.join(root, "notalar", "index.json"), "utf8"));
const out = [];
for(const e of pieces){
  const mk = appMakam(e.mk);
  if(!mk || (o.makam && !o.makam.includes(e.mk) && !o.makam.includes(mk.id))) continue;
  if(!free(e) || !(e.lo >= o.aralik[0] && e.hi <= o.aralik[1]) || e.s > o.sn) continue;
  const raw = JSON.parse(fs.readFileSync(path.join(root, "notalar", e.id + ".json"), "utf8"));
  const ms = measures(raw.notes, raw.meters && raw.meters.length ? raw.meters : [[0, 4, 4, ""]]);
  const S = scaleSet(mk);
  // Ölçünün sayılan perdeleri (mod 53): süslemesiz ve en az --kisa vuruş
  const bars = ms.map(m => new Set(raw.notes.slice(m.from, m.to).filter(a => a[0] !== null && !a[2] && a[1] >= o.kisa - 1e-9).map(a => m53(a[0]))));
  const outOf = b => [...b].filter(k => !S.has(k));
  const first = bars.findIndex(b => outOf(b).length);
  if(first < 2 || first + 1 > o.ilk) continue;            // ilk iki ölçü makamın dizisinde
  const last = raw.notes.filter(a => a[0] !== null).pop();
  if(!last || m53(last[0]) !== m53(mk.durak)) continue;   // durakta biter
  // Geçki: ilk dizi dışı ölçüden başlayan, dizi dışı perde taşıyan ölçüler (arada dizide kalan bir ölçü olabilir)
  let end = first;
  for(let i = first + 1; i < bars.length && i <= end + 2; i++) if(outOf(bars[i]).length) end = i;
  const foreign = new Set(bars.slice(first, end + 1).flatMap(outOf));
  const beats = raw.notes.slice(ms[first].from, ms[end].to).filter(a => a[0] !== null && foreign.has(m53(a[0]))).reduce((t, a) => t + a[1], 0);
  if(beats < o.sure) continue;
  for(const x of similarMakams(mk, o.fark)){
    const oth = new Set(x.other.map(m53)), own = x.only.map(m53);
    if(![...foreign].every(k => oth.has(k))) continue;
    // Dönüş: geçkiden sonra ana makamın ayıran perdesi yeniden çalınır (dizisi aynı olanlarda dönüş ölçülemez)
    const back = own.length ? bars.findIndex((b, i) => i > end && own.some(k => b.has(k)) && !outOf(b).length) : -1;
    if(back < 0) continue;
    out.push({ e, mk, via:x.mk, beats, first:first + 1, end:end + 1, back:back + 1, bars:ms.length, foreign:[...foreign].map(k => perdeName(k + (k < mk.durak - 5 ? 53 : 0))) });
    break;
  }
}
out.sort((a, b) => (a.e.lv || 9) - (b.e.lv || 9) || a.e.s - b.e.s);
console.log(`Ölçüt: makam ${o.makam ? o.makam.join(",") : "hepsi"} · yazılı ${o.aralik.join("–")} · ≤ ${o.sn} sn · geçki en geç ${o.ilk}. ölçüde · ` +
  `geçilen makam aynı durakta, fark ≤ ${o.fark} perde · ${o.kisa} vuruştan kısa ve süslemeli notalar sayılmaz · geçki perdeleri ≥ ${o.sure} vuruş`);
console.log(`Telifsiz ve ölçütü geçen ${out.length} eser. İlk ${Math.min(o.n, out.length)} (seviye, sonra süre sırasıyla):\n`);
for(const r of out.slice(0, o.n)) console.log(`${r.e.id}\n   ${r.e.t} · ${r.mk.name} → ${r.via.name} (${r.foreign.join(", ")}, ${r.beats} vuruş) · geçki ${r.first}–${r.end}. ölçü, dönüş ${r.back}. ölçü / ${r.bars} · ` +
  `${r.e.un} · ${r.e.fn} · ${r.e.s} sn · ${r.e.b || "Anonim"} · seviye ${r.e.lv}`);
