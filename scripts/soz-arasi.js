// Sözlü eserde söz arası (docs/BACKLOG.md S4.3, sarki-eslik dersi): SymbTr notasındaki hecelere (nota dizisinin 4. alanı)
// göre her ölçünün sözlü mü, saz mı olduğunu bulur. Hecesi olmayan ya da yalnız "Saz" hecesi taşıyan ölçü saz arasıdır.
// Ölçüler archive.js archMeasures ile aynı bölünür (ders adımlarının from/to numaraları). Arşive dokunmaz.
//
// Kullanım: node scripts/soz-arasi.js <eser kimliği>…      ölçü ölçü sözlü/saz, sonra aralıklar
//           node scripts/soz-arasi.js --ara [--form sarki] [--en-az 3] [--olcu 60]
//             telifsiz (scripts/eser-sec.js ile aynı süzgeç) sözlü eserlerden içeride en az N söz arası olanlar
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), doc = f => path.join(root, "docs", f);
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };

function measures(raw){
  const notes = raw.notes.map(a => ({ d:a[1], syl:a[3] })), meters = raw.meters && raw.meters.length ? raw.meters : [[0, 4, 4, ""]];
  const ms = []; let from = 0, acc = 0, mi = 0, cur = meters[0];
  for(let i = 0; i < notes.length; i++){
    while(mi + 1 < meters.length && meters[mi + 1][0] <= i){ mi++; if(i > from){ ms.push({ from, to:i }); from = i; acc = 0; } cur = meters[mi]; }
    const bar = cur[1]*4/cur[2];
    acc += notes[i].d;
    if(acc >= bar - 1e-6){ ms.push({ from, to:i + 1 }); from = i + 1; acc = Math.max(0, acc - bar); if(acc < 1e-6) acc = 0; }
  }
  if(from < notes.length) ms.push({ from, to:notes.length });
  return ms.map(m => notes.slice(m.from, m.to).map(n => n.syl).filter(s => s && !/^saz/i.test(s.trim())));
}
const read = id => JSON.parse(fs.readFileSync(path.join(root, "notalar", id + ".json"), "utf8"));
// Ardışık aynı türden ölçüler: [{ soz:bool, from, to }] (1 tabanlı, dahil)
function runs(ms){
  const out = [];
  ms.forEach((s, i) => { const soz = s.length > 0, last = out[out.length - 1];
    if(last && last.soz === soz) last.to = i + 1; else out.push({ soz, from:i + 1, to:i + 1 }); });
  return out;
}
const fmt = r => r.from === r.to ? String(r.from) : r.from + "–" + r.to;

if(!process.argv.includes("--ara")){
  const ids = process.argv.slice(2).filter(x => !x.startsWith("--"));
  if(!ids.length){ console.error("Kullanım: node scripts/soz-arasi.js <eser kimliği>… | --ara"); process.exit(1); }
  for(const id of ids){
    const ms = measures(read(id)), rs = runs(ms);
    console.log(id + " · " + ms.length + " ölçü");
    ms.forEach((s, i) => console.log(String(i + 1).padStart(4) + "  " + (s.length ? s.join(" ") : "— saz")));
    console.log("sözlü: " + rs.filter(r => r.soz).map(fmt).join(", "));
    console.log("söz arası: " + rs.filter(r => !r.soz).map(fmt).join(", ") + "\n");
  }
}else{
  const ids = f => new Set(fs.readFileSync(doc(f), "utf8").split("\n").slice(1).map(l => (l.match(/^﻿?"([^"]+)"/) || [])[1]).filter(Boolean));
  const telifli = ids("lisans-disla.csv"), belirsiz = ids("lisans-belirsiz.csv");
  const guftesiz = new Map(fs.readFileSync(doc("lisans-guftesiz.csv"), "utf8").split("\n").slice(1).filter(Boolean)
    .map(l => { const c = l.match(/"([^"]*)"|[^,]+/g).map(x => x.replace(/^"|"$/g, "")); return [c[0], c[7]]; }));
  const free = e => !telifli.has(e.id) && !belirsiz.has(e.id) && (!guftesiz.has(e.id) || guftesiz.get(e.id) === "kamu");
  const forms = arg("form", "sarki").split(","), enAz = +arg("en-az", 3), maxBar = +arg("olcu", 60);
  const { pieces } = JSON.parse(fs.readFileSync(path.join(root, "notalar", "index.json"), "utf8"));
  const out = [];
  for(const e of pieces){
    if(!forms.includes(e.f) || !e.lyr || !free(e)) continue;
    const ms = measures(read(e.id)); if(ms.length > maxBar) continue;
    const rs = runs(ms), inner = rs.filter((r, i) => !r.soz && i > 0 && i < rs.length - 1).length;
    if(inner >= enAz) out.push({ e, n:ms.length, inner, map: ms.map(s => s.length ? "S" : "-").join("") });
  }
  out.sort((a, b) => b.inner - a.inner || a.n - b.n);
  console.log(`Telifsiz ${forms.join(",")}: içeride en az ${enAz} söz arası olan ${out.length} eser (S sözlü, - saz)\n`);
  for(const r of out) console.log(`${r.e.id}\n   ${r.e.t} · ${r.e.mkn} · ${r.e.un} · ${r.n} ölçü · ${r.inner} söz arası · ${r.e.b || "Anonim"}\n   ${r.map}`);
}
