// Artikülasyon eşiklerinin denetimi (skills.js ARTIK, artikEval). Iowa Si♭ klarnet kayıtlarındaki tek notalardan yapay
// diziler kurulur: bağlı (notalar 15 ms örtüşerek birbirine geçer), tenuto (her nota dille ayrılır: d ms sessizlik),
// kesik (notanın yalnız f oranı çalar). Her dizi audio-check'in koşullarıyla (yankı, gürültü, telefon, nefes) bozulur,
// uygulamadaki iz (ornamentTrack, 5 ms) ve artikEval ile değerlendirilir. Gerçek çalış değil, benzetim: dilin ve
// parmak geçişinin gerçek sesi yok; sonuçlar Sol klarnet kaydıyla ayrıca denenmeli.
//
// Kullanım: node scripts/artik-check.js [--tempo 60,90] [--kosul temiz,yanki,...] [--ayrinti]
const fs = require("fs");
const path = require("path");
const S = require("../skills.js");
const A = require("./audio-check.js");

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i+1] : d; };
const TEMPOS = arg("--tempo", "60,90").split(",").map(Number);
const CONDS = arg("--kosul", "temiz,yanki,gurultu20,gurultu10,telefon,nefes,sol+telefon+gurultu20").split(",");
const DETAIL = args.includes("--ayrinti");

const DIR = path.join(__dirname, "..", "testdata", "iowa");
// Duyulan sesle Sol majör dizisi Sol4–Re5 (Iowa adları duyulan ses); dersteki 67–74 dizisi gibi çıkıp iner
const SEQ = [67, 69, 71, 72, 74, 72, 71, 69, 67];
const notes = {};
const rms = x => { let s = 0; for(let i=0;i<x.length;i++) s += x[i]*x[i]; return Math.sqrt(s/x.length); };
for(const f of ["BbClar.mf.C4B4.aiff", "BbClar.mf.C5B5.aiff"]){
  const { x, sr } = A.readAudio(path.join(DIR, f)), r = A.chromaticRange(f), segs = A.segments(x, sr);
  // Kesitlerin başında 0,5 sn'ye varan sessizlik var: nota, sesin gövdenin −20 dB'sine çıktığı yerden 10 ms önce başlar
  segs.forEach((s, i) => {
    const hop = Math.round(0.01*sr), body = rms(s.subarray(Math.round(0.8*sr), Math.round(1.3*sr)));
    let k = 0; while(k + hop < s.length && rms(s.subarray(k, k + hop)) < 0.1*body) k += hop;
    notes[r[0] + i] = { x: s.subarray(Math.max(0, k - hop)), sr };
  });
}
const SR = notes[67].sr;
// Notanın ortası (atak sonrası) aynı güce getirilir; from: atak dahil mi
function piece(w, ms, withAttack){
  const src = notes[w].x, a = withAttack ? 0 : Math.round(0.15*SR), n = Math.round(ms/1000*SR);
  const body = src.subarray(Math.round(0.3*SR), Math.round(0.8*SR)), g = 0.1/rms(body);
  const out = new Float32Array(n);
  for(let i=0;i<n;i++) out[i] = (src[a + i] || 0)*g;
  return out;
}
const fadeOut = (x, ms) => { const n = Math.min(x.length, Math.round(ms/1000*SR)); for(let i=0;i<n;i++) x[x.length - n + i] *= 1 - (i+1)/n; return x; };
const fadeIn = (x, ms) => { const n = Math.min(x.length, Math.round(ms/1000*SR)); for(let i=0;i<n;i++) x[i] *= i/n; return x; };
// Dizi: ilk nota 500 ms sessizlikten sonra; her nota bir vuruş
function build(kind, beatMs, p){
  const lead = Math.round(0.5*SR), beat = beatMs/1000*SR, total = lead + Math.round(beat*SEQ.length) + Math.round(0.8*SR);
  const y = new Float32Array(total);
  SEQ.forEach((w, k) => {
    const at = lead + Math.round(k*beat);
    let x;
    if(kind === "legato"){ x = fadeIn(fadeOut(piece(w, beatMs + 15, k > 0 ? false : true), 15), k ? 15 : 0); }
    else if(kind === "tenuto"){ x = fadeOut(piece(w, beatMs - p, true), 8); }
    else { x = fadeOut(piece(w, beatMs*p, true), 15); }
    for(let i=0;i<x.length && at + i < y.length;i++) y[at + i] += x[i];
  });
  return { y, lead: lead/SR*1000 };
}
const CASES = [
  { name:"bağlı", kind:"legato" },
  { name:"tenuto 20 ms", kind:"tenuto", p:20 }, { name:"tenuto 40 ms", kind:"tenuto", p:40 }, { name:"tenuto 70 ms", kind:"tenuto", p:70 },
  { name:"kesik %30", kind:"staccato", p:0.3 }, { name:"kesik %45", kind:"staccato", p:0.45 }, { name:"kesik %60", kind:"staccato", p:0.6 },
  { name:"uzun %75", kind:"staccato", p:0.75 }
];
const STYLES = ["legato", "tenuto", "staccato"];
const pct = v => Math.round(v*100);

const rows = [];
for(const tempo of TEMPOS) for(const cname of CONDS){
  const cond = A.CONDITIONS[cname]; if(!cond){ console.error("koşul yok: " + cname); continue; }
  for(const c of CASES){
    const beatMs = 60000/tempo, { y: clean, lead } = build(c.kind, beatMs, c.p);
    const { y, minRms } = cond.apply(clean, SR, 7);
    const tr = S.ornamentTrack(y, SR, { T:0, expectHz:400, minRms: minRms || 0.008, minHz:100, maxHz:2100 });
    const shift = cond.shift || 0;
    const expected = SEQ.map((w, k) => ({ t: lead + k*beatMs, w: w + shift, ms: beatMs }));
    const res = Object.fromEntries(STYLES.map(s => [s, S.artikEval(tr, expected, s)]));
    const r0 = res.legato, fills = r0.notes.map(x => x.fill), gaps = r0.notes.slice(0, -1).map(x => x.gap), dips = r0.notes.slice(0, -1).map(x => x.dip);
    rows.push({ tempo, cname, c, res, fills, gaps });
    const fmt = s => res[s].measured ? `${s.slice(0,4)} ${String(res[s].score).padStart(3)}` : `${s.slice(0,4)}   —`;
    console.log(`♩=${tempo} ${cname.padEnd(24)} ${c.name.padEnd(13)} doluluk %${pct(Math.min(...fills))}–${pct(Math.max(...fills))}` +
      `  boşluk ${Math.min(...gaps)}–${Math.max(...gaps)} ms  çukur %${pct(Math.min(...dips))}–${pct(Math.max(...dips))}  nota %${pct(r0.pitch)}  ${STYLES.map(fmt).join("  ")}`);
    if(DETAIL) console.log("   " + r0.notes.map(x => pct(x.fill) + "/" + x.gap + "/" + pct(x.dip)).join(" "));
  }
}
// Özet: her durum hangi çalış olarak geçer (puan ≥ 70). Kesik %60 ve uzun %75 sınır durumlar: yalnız dökülür
const want = c => c.kind === "legato" ? "legato" : c.kind === "tenuto" ? "tenuto" : c.p <= 0.45 ? "staccato" : null;
let good = 0, all = 0;
const border = {};
for(const r of rows){
  const passes = STYLES.filter(s => r.res[s].measured && r.res[s].score >= 70), w = want(r.c);
  if(!w){ const k = r.c.name + ": " + (passes.join(", ") || "yok"); border[k] = (border[k] || 0) + 1; continue; }
  const ok = passes.length === 1 && passes[0] === w;
  all++; if(ok) good++;
  else console.log(`AYRIŞMADI ♩=${r.tempo} ${r.cname} ${r.c.name}: geçen ${passes.join(", ") || "yok"}`);
}
console.log(`
${good}/${all} durumda yalnız istenen çalış geçti.`);
console.log("Sınır durumlar (geçen çalış: kaç koşulda): " + Object.entries(border).map(([k, v]) => k + " ×" + v).join("; "));
