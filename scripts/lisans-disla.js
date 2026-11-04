#!/usr/bin/env node
// Telif dışlama listesi: notalar/index.json'daki her eseri lisans tablolarıyla (docs/lisans-besteciler.csv,
// docs/lisans-guftekarlar.csv) eşleştirir. En az bir hak sahibi telifli olan eserler docs/lisans-disla.csv'ye, telifli
// hak sahibi olmayıp en az biri bilinmeyen eserler docs/lisans-belirsiz.csv'ye yazılır. Arşive dokunmaz.
// Kullanım: node scripts/lisans-disla.js [yıl]   (yıl verilmezse bugünün yılı; sınır: ölüm yılı ≤ yıl − 71, FSEK m. 27)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, ".."), doc = f => path.join(root, "docs", f);
const year = +process.argv[2] || new Date().getFullYear(), limit = year - 71;

function parseCsv(text){
  const rows = []; let row = [], cell = "", q = false;
  text = text.replace(/^﻿/, "");
  for(let i = 0; i < text.length; i++){
    const c = text[i];
    if(q){
      if(c !== '"') cell += c;
      else if(text[i+1] === '"'){ cell += '"'; i++; }
      else q = false;
    }
    else if(c === '"') q = true;
    else if(c === ","){ row.push(cell); cell = ""; }
    else if(c === "\n"){ row.push(cell); rows.push(row); row = []; cell = ""; }
    else if(c !== "\r") cell += c;
  }
  if(cell || row.length){ row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, k) => [h, r[k] ?? ""])));
}
const table = (file, key) => new Map(parseCsv(fs.readFileSync(doc(file), "utf8")).map(r => [r[key], r]));
const composers = table("lisans-besteciler.csv", "besteci"), poets = table("lisans-guftekarlar.csv", "guftekar");

// Satırın bu yılki durumu: yıl biliniyorsa sınırdan hesaplanır, yoksa tablodaki karar geçerlidir
function status(r){
  const y = /^\d+$/.test(r.olum_yili.trim()) ? +r.olum_yili : null;
  const s = y !== null ? (y <= limit ? "kamu" : "telifli") : r.telif_durumu.startsWith("kamu") ? "kamu" : r.telif_durumu;
  return { s, y, weak: /tek kaynak|ad eşleşmesi/.test(r.not) };
}
const { pieces } = JSON.parse(fs.readFileSync(path.join(root, "notalar", "index.json"), "utf8"));
const out = { telifli: [], belirsiz: [] }, count = { kamu: 0, anonim: 0 };
for(const e of pieces){
  const rb = composers.get(e.b || "(boş)"), rg = e.g ? poets.get(e.g) : null;
  if(!rb || (e.g && !rg)) throw new Error("tabloda yok: " + e.id);
  const b = status(rb), g = rg ? status(rg) : null, parts = g ? [b, g] : [b];
  const held = parts.filter(p => p.s === "telifli"), unknown = parts.filter(p => p.s === "bilinmiyor");
  const who = list => list.length === 2 ? "ikisi" : list[0] === b ? "besteci" : "güfte";
  const base = { id: e.id, eser: e.t, makam: e.mkn, form: e.fn, besteci: e.b || "", besteci_durum: b.s, besteci_olum: b.y ?? "",
    guftekar: e.g || "", guftekar_durum: g ? g.s : "", guftekar_olum: g && g.y !== null ? g.y : "", soz_gosteriliyor: e.lyr ? "evet" : "hayır" };
  if(held.length){
    // Kamu malı olacağı yıl: bütün hak sahipleri belliyse son ölenin ölüm yılı + 71 (1 Ocak)
    const free = !unknown.length && held.every(p => p.y !== null) ? Math.max(...held.map(p => p.y)) + 71 : "";
    out.telifli.push({ ...base, engel: who(held), kamu_mali_yili: free, zayif_kaynak: held.every(p => p.weak) ? "evet" : "" });
  }
  else if(unknown.length) out.belirsiz.push({ ...base, eksik: who(unknown) });
  else count[b.s === "anonim" ? "anonim" : "kamu"]++;
}
function write(file, rows){
  const cols = Object.keys(rows[0]), cell = v => typeof v === "number" ? v : `"${String(v).replace(/"/g, '""')}"`;
  fs.writeFileSync(doc(file), "﻿" + [cols.join(","), ...rows.map(r => cols.map(c => cell(r[c])).join(","))].join("\n") + "\n");
}
write("lisans-disla.csv", out.telifli);
write("lisans-belirsiz.csv", out.belirsiz);
console.log(`${year} (ölüm yılı ≤ ${limit}): ${pieces.length} eser; telifli ${out.telifli.length}, belirsiz ${out.belirsiz.length}, kamu malı ${count.kamu}, anonim ${count.anonim}`);
