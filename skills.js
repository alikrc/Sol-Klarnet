// Beceri ölçümleri (saf mantık, Node'da test edilir): nota başı (onset) bulma ve ritim değerlendirmesi,
// ses kalitesi, dinamik (crescendo/decrescendo), seyir analizi ve kulak eğitimi soru üreticileri.
// Tarayıcıda lessons.js'ten sonra <script src="skills.js"> ile, Node'da require("./skills.js") ile yüklenir.

const SCORE = typeof module !== "undefined" ? require("./core.js") : { PERDES, nearestPerde, perdeNameAt, detectPitch, freqToMidi };
const SLEARN = typeof module !== "undefined" ? require("./learn.js") : { MAKAMS, makamById, mean, sd, commaToWritten, perdeName };

// ---- Nota başı (onset) bulma ----
// Her ölçümde { t (ms), rms, on (perde bulundu mu), tOn? (pencere içinde enerjinin yükseldiği an) } gelir.
// İki tür nota başı: sessizlikten sese geçiş ve ses sürerken dil vuruşu (seviye tepe değerin yarısının
// altına düşüp yeniden yükselir). Aynı notayı dille tekrarlamak da sayılır.
class OnsetDetector{
  constructor(opts = {}){
    this.minGap = opts.minGap || 90;        // iki nota başı arası en az (ms)
    this.dip = opts.dip || 0.45;            // tepe değerin bu oranının altı "dil vuruşu boşluğu"
    this.rise = opts.rise || 0.7;           // yeniden bu orana çıkınca yeni nota başı
    this.reset();
  }
  reset(){ this.sounding = false; this.peak = 0; this.dipped = false; this.last = -1e9; }
  // Bir ölçüm işler; nota başı varsa zamanını (ms) döndürür
  push(f){
    let onset = null;
    if(!f.on){
      if(this.sounding){ this.sounding = false; this.peak = 0; this.dipped = false; }
      return null;
    }
    const t = f.tOn != null ? f.tOn : f.t;
    if(!this.sounding){
      this.sounding = true; this.peak = f.rms; this.dipped = false;
      if(t - this.last >= this.minGap) onset = t;
    }else{
      if(f.rms < this.peak*this.dip) this.dipped = true;
      else if(this.dipped && f.rms >= this.peak*this.rise){
        this.dipped = false;
        if(t - this.last >= this.minGap) onset = t;
        this.peak = f.rms;
      }
      // tepe yavaşça izlenir (uzun notada ses azalınca yeni vuruş yine yakalansın)
      this.peak = Math.max(f.rms, this.peak*0.97);
    }
    if(onset !== null) this.last = onset;
    return onset;
  }
}

// Beklenen vuruş zamanlarıyla çalınan nota başlarını eşler. tol: en çok sapma (ms).
// Dönen: { hits:[{exp, got, dev}], missed:[exp], extra:[got], mean, sd, absMean }
function matchOnsets(expected, played, tol){
  const used = new Set(), hits = [], missed = [];
  for(const e of expected){
    let best = -1, bd = Infinity;
    played.forEach((p, i) => { if(!used.has(i) && Math.abs(p - e) < bd){ bd = Math.abs(p - e); best = i; } });
    if(best >= 0 && bd <= tol){ used.add(best); hits.push({ exp:e, got:played[best], dev:played[best] - e }); }
    else missed.push(e);
  }
  const extra = played.filter((_, i) => !used.has(i));
  const devs = hits.map(h => h.dev);
  return { hits, missed, extra, mean: SLEARN.mean(devs), sd: SLEARN.sd(devs), absMean: SLEARN.mean(devs.map(Math.abs)) };
}
// Ritim puanı (0–100): isabet oranı %50, zamanlama tutarlılığı (yayılım) %30, ortalama erken/geç %20.
// Sapma ölçütleri vuruş aralığına göre ölçeklenir (yavaş tempoda aynı ms daha az hatadır).
function rhythmScore(m, beatMs, expectedN){
  const hitRate = expectedN ? m.hits.length / expectedN : 0;
  const extraPen = Math.min(0.3, m.extra.length / Math.max(1, expectedN) * 0.5);
  const rel = x => Math.min(1, x / (beatMs*0.25));
  const consistency = m.hits.length > 1 ? 1 - rel(m.sd) : hitRate;
  const center = m.hits.length ? 1 - rel(Math.abs(m.mean)) : 0;
  return Math.max(0, Math.round(100*(0.5*hitRate + 0.3*consistency + 0.2*center - extraPen)));
}
// Ritim kalıpları: her biri bir ölçüdeki vuruş noktaları (vuruş birimi cinsinden)
const RHYTHM_PATTERNS = [
  { id:"quarter", name:{ tr:"Her vuruşta bir nota", en:"One note per beat" }, beats:4, at:[0,1,2,3] },
  { id:"half",    name:{ tr:"İki vuruşta bir (ikilik)", en:"Every other beat (half notes)" }, beats:4, at:[0,2] },
  { id:"eighth",  name:{ tr:"Vuruş başına iki (sekizlik)", en:"Two per beat (eighths)" }, beats:4, at:[0,0.5,1,1.5,2,2.5,3,3.5] },
  { id:"dotted",  name:{ tr:"Noktalı dörtlük + sekizlik", en:"Dotted quarter + eighth" }, beats:4, at:[0,1.5,2,3.5] },
  { id:"offbeat", name:{ tr:"Vuruş arası (ters vuruş)", en:"Off-beats" }, beats:4, at:[0.5,1.5,2.5,3.5] }
];
// Usulün düm ve tek vuruşları (usulSlots dilimlerinden)
function usulStrokeTimes(slots){ return slots.map((s, i) => s ? i : null).filter(x => x !== null); }
// count-in sonrası beklenen zamanlar: start (ms), beatMs, ölçü sayısı, kalıp
function expectedTimes(start, beatMs, bars, pattern){
  const out = [];
  for(let b=0;b<bars;b++) for(const x of pattern.at) out.push(start + (b*pattern.beats + x)*beatMs);
  return out;
}

// ---- Ses kalitesi ----
// frames: [{ rms, clarity }] tutulan nota boyunca. Netlik (NSDF tepe değeri) havalı/gürültülü sesi ayırır;
// ses gücü dengesi seviyenin oynaklığıdır (değişim katsayısı).
function toneQuality(frames){
  if(frames.length < 5) return null;
  const cl = SLEARN.mean(frames.map(f => f.clarity));
  const rms = frames.map(f => f.rms), m = SLEARN.mean(rms), cv = m > 0 ? SLEARN.sd(rms)/m : 1;
  const clarity = Math.round(100*Math.max(0, Math.min(1, (cl - 0.80)/0.18)));
  const steadiness = Math.round(100*Math.max(0, Math.min(1, 1 - cv/0.25)));
  const tips = [];
  if(clarity < 60) tips.push({ tr:"Ses havalı ya da cızırtılı: ağızlığı biraz daha az al, dudak köşelerini sar, kamışı kontrol et.",
                               en:"The tone is airy or buzzy: take a little less mouthpiece, seal the corners, check the reed." });
  if(steadiness < 60) tips.push({ tr:"Ses gücü dalgalanıyor: karından sabit bir hava akışı ver, nefesin sonuna kadar desteği bırakma.",
                                  en:"The volume wavers: keep a steady air stream from the belly and support to the end of the breath." });
  return { clarity, steadiness, cv, meanClarity: cl, tips };
}

// ---- Dinamik ----
// frames: [{ t, rms, comma }]. shape: "cresc" (artan), "dim" (azalan), "messa" (artıp azalan).
// Ses düzeyi dB'ye çevrilir; aralık (dB), şekle uyum (korelasyon) ve perdenin kayması (koma) ölçülür.
function dynamicsEval(frames, shape){
  if(frames.length < 10) return null;
  const db = frames.map(f => 20*Math.log10(Math.max(f.rms, 1e-6)));
  const t0 = frames[0].t, T = frames[frames.length-1].t - t0 || 1;
  const x = frames.map(f => (f.t - t0)/T);
  const ideal = x.map(v => shape === "cresc" ? v : shape === "dim" ? 1 - v : 1 - Math.abs(2*v - 1));
  const corr = (a, b) => {
    const ma = SLEARN.mean(a), mb = SLEARN.mean(b);
    let n = 0, da = 0, dbb = 0;
    for(let i=0;i<a.length;i++){ n += (a[i]-ma)*(b[i]-mb); da += (a[i]-ma)**2; dbb += (b[i]-mb)**2; }
    return da && dbb ? n/Math.sqrt(da*dbb) : 0;
  };
  const sorted = [...db].sort((a,b) => a-b);
  const range = sorted[Math.floor(sorted.length*0.95)] - sorted[Math.floor(sorted.length*0.05)];
  const commas = frames.map(f => f.comma).filter(c => c != null);
  const drift = commas.length ? Math.max(...commas) - Math.min(...commas) : 0;
  const fit = corr(db, ideal);
  // Perdenin ses gücüyle birlikte kayması (klarnette ses açılınca perde tizleşir/pesleşir)
  const pitchCorr = commas.length === db.length ? corr(db, commas) : 0;
  return { range, fit, drift, pitchCorr, ok: range >= 10 && fit >= 0.7 && drift <= 2 };
}

// ---- Seyir analizi ----
// notes: segmentNotes çıktısı [{ written, start, end, comma }]. Her nota makamın en yakın perdesine (oktavlar dahil)
// eşlenir; perdelerde geçen süre, dizi dışı süre, karar perdesi, güçlüye uğrama ve açılış bölgesi bulunur.
function mapToScale(comma, mk){
  const scale = [...new Set([...mk.asc, ...mk.desc].map(c => ((c % 53) + 53) % 53))];
  let best = null, bd = 1e9;
  for(const c of scale) for(let k=-2;k<=3;k++){
    const v = c + 53*k, d = Math.abs(comma - v);
    if(d < bd){ bd = d; best = v; }
  }
  return bd <= 2 ? best : null;
}
function seyirAnalysis(notes, mk){
  const long = notes.filter(n => n.end - n.start >= 120);
  if(long.length < 4) return null;
  const time = {}; let total = 0, outT = 0;
  const mapped = long.map(n => ({ ...n, p: mapToScale(n.comma, mk), dur: n.end - n.start }));
  for(const n of mapped){
    total += n.dur;
    if(n.p === null){ outT += n.dur; continue; }
    time[n.p] = (time[n.p] || 0) + n.dur;
  }
  const same = (a, b) => a !== null && ((a - b) % 53 + 53) % 53 === 0;
  // Karar: son uzun nota (en az 400 ms ya da son nota) durak perdesinde mi
  const lastLong = [...mapped].reverse().find(n => n.dur >= 400) || mapped[mapped.length-1];
  const finalOk = same(lastLong.p, mk.durak);
  const durakTime = Object.entries(time).filter(([p]) => same(+p, mk.durak)).reduce((a, [, v]) => a + v, 0);
  const gucluTime = Object.entries(time).filter(([p]) => same(+p, mk.guclu)).reduce((a, [, v]) => a + v, 0);
  const ranked = Object.entries(time).sort((a, b) => b[1] - a[1]).map(([p]) => +p);
  const gucluRank = ranked.findIndex(p => same(p, mk.guclu));
  // Açılış: ilk %25'lik bölümün ortalama perdesi; durak ile tiz durak arasında nerede?
  const head = mapped.slice(0, Math.max(2, Math.ceil(mapped.length*0.25)));
  const headMean = SLEARN.mean(head.map(n => n.comma));
  const pos = (headMean - mk.durak) / 53;           // 0: durak, 1: tiz durak
  const opening = pos < 0.3 ? "low" : pos > 0.6 ? "high" : "mid";
  const want = { cikici:"low", inici:"high", "inici-cikici":"mid" }[mk.seyirType];
  const commas = mapped.map(n => n.comma);
  const res = {
    total, inScale: total ? 1 - outT/total : 0, finalOk, finalPerde: lastLong.p, durakShare: total ? durakTime/total : 0,
    gucluShare: total ? gucluTime/total : 0, gucluRank, opening, openingOk: opening === want || (want === "mid" && opening !== "low"),
    low: Math.min(...commas), high: Math.max(...commas), time
  };
  res.score = Math.round(100*(0.3*res.inScale + 0.3*(finalOk ? 1 : 0) + 0.2*(gucluRank >= 0 && gucluRank <= 2 ? 1 : gucluRank >= 0 ? 0.5 : 0) + 0.2*(res.openingOk ? 1 : 0)));
  res.ok = res.inScale >= 0.8 && finalOk && gucluRank >= 0;
  return res;
}
// Seyir analizinin okunur geri bildirimi
function seyirFeedback(res, mk, lang = "tr"){
  const en = lang === "en", out = [];
  const pn = c => SLEARN.perdeName(c) || "?";
  out.push(res.finalOk ? (en ? "You resolved on the final (" + pn(mk.durak) + ")." : "Durakta (" + pn(mk.durak) + ") karar verdin.")
    : (en ? "The last long note was " + (res.finalPerde !== null ? pn(res.finalPerde) : "outside the scale") + "; resolve on " + pn(mk.durak) + "."
          : "Son uzun nota " + (res.finalPerde !== null ? pn(res.finalPerde) : "dizi dışı") + "; kararı " + pn(mk.durak) + " perdesinde ver."));
  out.push(res.gucluRank >= 0 && res.gucluRank <= 2 ? (en ? "The dominant (" + pn(mk.guclu) + ") was emphasised." : "Güçlü (" + pn(mk.guclu) + ") vurgulandı.")
    : (en ? "Linger more on the dominant (" + pn(mk.guclu) + "); it shapes the makam." : "Güçlüde (" + pn(mk.guclu) + ") daha çok dur; makamın rengini o verir."));
  const inPct = Math.round(res.inScale*100);
  out.push(inPct >= 90 ? (en ? "Almost everything stayed in the scale (" + inPct + "%)." : "Neredeyse her şey dizide kaldı (%" + inPct + ").")
    : (en ? inPct + "% in the scale; notes outside may be a modulation or a mistake." : "Sürenin %" + inPct + "'i dizide; dışarıdaki notalar geçki ya da hata olabilir."));
  const typeTr = { cikici:"çıkıcı", inici:"inici", "inici-cikici":"inici-çıkıcı" }[mk.seyirType];
  const typeEn = { cikici:"ascending", inici:"descending", "inici-cikici":"descending-ascending" }[mk.seyirType];
  if(!res.openingOk) out.push(en ? mk.name + " has a " + typeEn + " seyir: " + (mk.seyirType === "cikici" ? "start around the final and climb." : mk.seyirType === "inici" ? "start in the upper register and come down." : "start around the dominant.")
                               : mk.name + " " + typeTr + " bir makam: " + (mk.seyirType === "cikici" ? "durak civarından başlayıp yüksel." : mk.seyirType === "inici" ? "tiz bölgeden başlayıp in." : "güçlü civarından başla."));
  else out.push(en ? "The opening fits the " + typeEn + " seyir." : "Açılış " + typeTr + " seyre uygun.");
  return out;
}

// ---- Kulak eğitimi ----
// Tiz mi pes mi: iki ses arasındaki fark (koma) uyarlanır; 2 doğru arka arkaya → fark küçülür, yanlış → büyür.
// Eşik ≈ %70,7 doğru oranına yakınsar (2-yukarı 1-aşağı merdiven).
class Staircase{
  constructor(start = 6, min = 0.25, max = 12){ this.d = start; this.min = min; this.max = max; this.streak = 0; this.reversals = []; this.dir = 0; }
  answer(right){
    let nd = this.d;
    if(right){ this.streak++; if(this.streak >= 2){ this.streak = 0; nd = Math.max(this.min, this.d/1.4); } }
    else { this.streak = 0; nd = Math.min(this.max, this.d*1.4); }
    const dir = Math.sign(nd - this.d);
    if(dir && this.dir && dir !== this.dir) this.reversals.push(this.d);
    if(dir) this.dir = dir;
    this.d = nd;
    return nd;
  }
  // Son 6 dönüşün ortalaması: ayırt edebildiğin en küçük fark (koma)
  threshold(){ const r = this.reversals.slice(-6); return r.length >= 2 ? SLEARN.mean(r) : null; }
}
// Perde ayırt: aynı yazılı notaya düşen iki AEU perdesi (ör. Segâh / Bûselik, Kürdî / Dik Kürdî) ya da
// verilen en küçük farka göre perde çiftleri. level: 1 (≥4 koma), 2 (≥2), 3 (1 koma)
function perdePairs(level){
  const P = SCORE.PERDES.filter(([c]) => c >= -22 && c <= 62);
  const minD = level >= 3 ? 1 : level === 2 ? 2 : 4, maxD = level >= 3 ? 1 : level === 2 ? 3 : 5;
  const out = [];
  for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){
    const d = P[j][0] - P[i][0];
    if(d >= minD && d <= maxD) out.push([P[i], P[j]]);
  }
  return out;
}
// Makam tanı: çalınacak makam ve seçenekler (doğru + rastgele 3)
function makamChoices(pool, rng = Math.random){
  const ids = [...pool];
  const pick = ids[Math.floor(rng()*ids.length)];
  const others = ids.filter(x => x !== pick);
  const ch = [pick];
  while(ch.length < Math.min(4, ids.length) && others.length) ch.push(others.splice(Math.floor(rng()*others.length), 1)[0]);
  return { answer: pick, choices: ch.sort() };
}
// Makamı tanıtan kısa ezgi: durakta başlar, güçlüye uğrar, makamın renk perdeleriyle durakta biter
function makamPhrase(mk, rng = Math.random){
  const s = [...mk.asc];
  const gi = s.indexOf(mk.guclu) >= 0 ? s.indexOf(mk.guclu) : 4;
  const up = s.slice(0, gi + 1), down = [...s.slice(0, gi)].reverse();
  const mid = rng() < 0.5 ? [s[Math.min(s.length-1, gi+1)], mk.guclu] : [mk.guclu];
  return [...up, ...mid, ...down];
}

// ---- Süsleme ----
// Canlı ölçüm 40 ms'de bir yapılır; çarpma ve tril notaları bundan kısadır. Deneme bitince ham ses (PCM) 5 ms adımla,
// kısa pencereyle yeniden çözülür. Komalar canlı "raw" olayıyla aynı ölçekte: Rast'a (yazılı Sol4) göre.
// opts: { T (aktarım), minHz, maxHz, minRms, hopMs, expectHz (160 Hz üstünde 1024 örneklik pencere: süsleme aralığında, Sol klarnette en pes 247 Hz, kısa notalar ayrışsın) }
function ornamentTrack(pcm, sampleRate, opts = {}){
  const T = opts.T == null ? 5 : opts.T, hopMs = opts.hopMs || 5;
  const win = (opts.expectHz || 0) > 160 ? 1024 : 2048, hop = sampleRate*hopMs/1000;
  const out = [];
  for(let k=0; Math.round(k*hop) + win <= pcm.length; k++){
    const s = Math.round(k*hop);
    const d = SCORE.detectPitch(pcm.subarray(s, s + win), sampleRate, opts.minHz || 100, opts.maxHz || 2100, opts.minRms || 0.008);
    out.push({ t: k*hopMs + win/2/sampleRate*1000, freq: d.freq, rms: d.rms, clarity: d.clarity,
               comma: d.freq > 0 ? (SCORE.freqToMidi(d.freq) + T - 67)*53/12 : null });
  }
  out.winMs = win/sampleRate*1000;
  return out;
}
// Parça süresi: ilk ve son ölçüm arası + bir adım; pencere geçişte iki perdeyi birden gördüğü için her parça
// yaklaşık (pencere − adım)/2 kısa görünür, o kadar eklenir.
const partMs = (track, start, end) => {
  const hop = track.length > 1 ? track[1].t - track[0].t : 5;
  return end - start + hop + (track.winMs ? Math.max(0, (track.winMs - hop)/2) : 0);
};
const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length/2)]; };
// İzi aynı perdeye oturan parçalara böler: ölçüm parçanın ortancasından tol komadan fazla uzaklaşınca ya da perde
// kaybolunca yeni parça başlar; minMs'den kısa parçalar atılır.
function microNotes(track, tol = 2, minMs = 15){
  const out = [];
  let cur = null;
  const close = () => {
    if(cur){ const ms = partMs(track, cur.start, cur.end); if(ms >= minMs) out.push({ start:cur.start, end:cur.end, ms, comma: median(cur.cs) }); }
    cur = null;
  };
  for(const f of track){
    if(f.comma === null){ close(); continue; }
    if(cur && Math.abs(f.comma - median(cur.cs)) <= tol){ cur.cs.push(f.comma); cur.end = f.t; continue; }
    close();
    cur = { start:f.t, end:f.t, cs:[f.comma] };
  }
  close();
  return out;
}

// Eşikler (ms ve koma); gerçek kayıtlarla ayarlanacak
const ORN = {
  measuredMin: 0.6,            // denemenin en az bu oranında perde bulunmalı
  near: 2,                     // bir parça ana notaya ya da komşuya bu kadar komaya oturmuşsa onun sayılır
  grace: [20, 120], graceIdeal: [40, 80], gapMax: 30, mainMin: 300, mainTol: 1.5,
  tekrar: [20, 80], tekrarDip: 0.3, tekrarMin: 3,
  mordanTotal: 300,
  trilSwitch: 6, trilSpan: 3, trilTwoLevel: 0.7, trilEven: 0.2,
  giris: [80, 400], girisDepth: 3, dusus: [100, 500], dususDepth: 5, along: 0.6
};
// Komşu perdenin koması: makam verilmişse makam dizisinde ana perdenin hemen üstü/altı, yoksa yazılı komşu nota
function ornamentNeighbor(spec){
  const up = spec.dir !== "down";
  if(spec.makam){
    const mk = SLEARN.makamById(spec.makam), main = spec.comma != null ? spec.comma : (spec.note - 67)*53/12;
    const base = [...new Set([...mk.asc, ...mk.desc].map(c => ((c % 53) + 53) % 53))];
    const all = []; for(let k=-2;k<=3;k++) for(const c of base) all.push(c + 53*k);
    all.sort((a, b) => a - b);
    return up ? all.find(c => c > main + 0.5) : [...all].reverse().find(c => c < main - 0.5);
  }
  const pc = spec.note % 12;
  const w = up ? spec.note + (pc === 4 || pc === 11 ? 1 : 2) : spec.note - (pc === 0 || pc === 5 ? 1 : 2);
  return (w - 67)*53/12;
}
// Mikro notaları ana / komşu / başka diye etiketler; aradaki kısa geçiş parçalarını atar, aynı etiketli
// ardışık parçaları birleştirir (geçişte pencere iki perdeyi birden görür).
function ornamentParts(track, mainC, nbC){
  const hop = track.length > 1 ? track[1].t - track[0].t : 5;
  const ps = microNotes(track, ORN.near).map(p => ({ ...p,
    lab: Math.abs(p.comma - mainC) <= ORN.near ? "main" : nbC != null && Math.abs(p.comma - nbC) <= ORN.near ? "nb" : "other" }))
    .filter(p => p.lab !== "other" || p.end - p.start + hop >= 25);   // ham süreye göre: pencere düzeltmesi geçiş kırıntılarını büyütmesin
  const out = [];
  for(const p of ps){
    const q = out[out.length-1];
    if(q && q.lab === p.lab && p.start - q.end - hop <= 40){
      const n1 = q.ms, n2 = p.ms;
      q.comma = (q.comma*n1 + p.comma*n2)/(n1 + n2); q.end = p.end; q.ms = partMs(track, q.start, q.end);
    }else out.push({ ...p });
  }
  return out;
}
const otip = (tr, en) => ({ tr, en });
// Bir süsleme denemesini değerlendirir. spec: { kind, note, comma?, makam?, dir?, rate?, sec? }
function ornamentEval(track, spec){
  const res = { ok:false, measured:false, kind:spec.kind, found:false, durMs:null, intervalErr:null, rate:null,
                evenness:null, mainErr:null, count:0, tips:[] };
  const voiced = track.filter(f => f.comma !== null).length;
  if(!track.length || voiced/track.length < ORN.measuredMin){
    res.tips.push(otip("Duyamadım: biraz daha güçlü ya da mikrofona yakın çal.", "I couldn't hear it: play a little louder or closer to the microphone."));
    return res;
  }
  res.measured = true;
  const hop = track.length > 1 ? track[1].t - track[0].t : 5;
  const mainC = spec.comma != null ? spec.comma : (spec.note - 67)*53/12;
  const nbC = ["carpma", "tekrar", "mordan", "tril"].includes(spec.kind) ? ornamentNeighbor(spec) : null;
  const parts = ornamentParts(track, mainC, nbC);
  const mainMin = spec.mainMin != null ? spec.mainMin : ORN.mainMin;     // eserde kısa notalar için düşürülür
  const upW = spec.dir === "down" ? "alttaki" : "üstteki", upE = spec.dir === "down" ? "lower" : "upper";
  const mainCheck = m => {
    res.mainErr = m.comma - mainC;
    if(Math.abs(res.mainErr) > ORN.mainTol){
      res.tips.push(res.mainErr > 0 ? otip("Ana nota tiz: dudağı biraz gevşet.", "The main note is sharp: relax the lips a little.")
                                    : otip("Ana nota pes: havayı biraz hızlandır.", "The main note is flat: speed up the air a little."));
      return false;
    }
    return true;
  };
  switch(spec.kind){
    case "carpma": {
      const i = parts.findIndex((p, k) => p.lab === "nb" && p.ms >= ORN.grace[0] && parts[k+1] && parts[k+1].lab === "main" &&
                                          parts[k+1].start - p.end - hop <= ORN.gapMax);
      if(i < 0){ res.tips.push(otip("Çarpma duyulmadı: ana notadan hemen önce " + upW + " notaya parmağı kısaca vur.",
                                    "No grace note heard: tap the " + upE + " note briefly just before the main note.")); break; }
      const g = parts[i], m = parts[i+1];
      res.found = true; res.durMs = g.ms; res.intervalErr = g.comma - nbC;
      if(g.ms > ORN.grace[1]){ res.tips.push(otip("Çarpma uzun, appoggiatura gibi oldu: parmağı vurup hemen kaldır.",
                                                  "The grace note is too long, it sounds like an appoggiatura: tap the finger and lift it at once.")); break; }
      if(m.ms < mainMin){ res.tips.push(otip("Ana notayı daha uzun tut.", "Hold the main note longer.")); break; }
      if(!mainCheck(m)) break;
      res.ok = true;
      if(g.ms < ORN.graceIdeal[0] || g.ms > ORN.graceIdeal[1])
        res.tips.push(otip("Güzel. Çarpma biraz " + (g.ms < ORN.graceIdeal[0] ? "kısa" : "uzun") + "; 40–80 ms arası en doğal duyulur.",
                           "Good. The grace note is a little " + (g.ms < ORN.graceIdeal[0] ? "short" : "long") + "; 40–80 ms sounds most natural."));
      break;
    }
    case "tekrar": {
      const first = parts.findIndex(p => p.lab === "main");
      let last = -1; parts.forEach((p, k) => { if(p.lab === "main") last = k; });
      const cuts = first < 0 ? [] : parts.slice(first, last + 1).filter((p, k, a) => p.lab === "nb" && p.ms >= ORN.tekrar[0] && p.ms <= ORN.tekrar[1] &&
                                                                         a[k-1] && a[k-1].lab === "main" && a[k+1] && a[k+1].lab === "main");
      res.count = cuts.length; res.found = cuts.length > 0;
      if(cuts.length) res.durMs = SLEARN.mean(cuts.map(c => c.ms));
      const sounding = first < 0 ? [] : track.filter(f => f.t >= parts[first].start && f.t <= parts[last].end);
      const peak = Math.max(0, ...sounding.map(f => f.rms));
      const dipped = sounding.some(f => f.rms < ORN.tekrarDip*peak);
      if(dipped) res.tips.push(otip("Dille böldün; burada notayı parmakla, kısa bir çarpmayla bölmen gerekiyor.",
                                    "You split the note with the tongue; here split it with the finger, using a quick grace note."));
      if(cuts.length < ORN.tekrarMin){ if(!dipped) res.tips.push(otip("Ana notayı tutarken " + upW + " notaya kısa kısa vurarak en az " + ORN.tekrarMin + " kez böl.",
                                     "While holding the main note, split it at least " + ORN.tekrarMin + " times with quick taps on the " + upE + " note.")); break; }
      res.ok = !dipped;
      break;
    }
    case "mordan": {
      const i = parts.findIndex((p, k) => p.lab === "main" && parts[k+1] && parts[k+1].lab === "nb" && parts[k+2] && parts[k+2].lab === "main");
      if(i < 0){ res.tips.push(otip("Mordan duyulmadı: ana nota, " + upW + " nota, yine ana nota; hepsi tek nefeste ve hızlı.",
                                    "No mordent heard: main note, " + upE + " note, main note again; all quick and in one breath.")); break; }
      const a = parts[i], n = parts[i+1], b = parts[i+2];
      res.found = true; res.durMs = n.ms; res.intervalErr = n.comma - nbC;
      if(n.ms > ORN.grace[1] || b.start - a.start > ORN.mordanTotal){ res.tips.push(otip("Mordan yavaş: üç notayı daha hızlı bağla.", "The mordent is slow: join the three notes faster.")); break; }
      if(b.ms < mainMin){ res.tips.push(otip("Son notayı daha uzun tut.", "Hold the last note longer.")); break; }
      if(!mainCheck(b)) break;
      res.ok = true;
      break;
    }
    case "tril": {
      // En uzun ana–komşu almaşık dizisi; her parçanın başı yarım dönüş
      let best = [], run = [];
      for(const p of parts){
        const q = run[run.length-1];
        if(p.lab !== "other" && q && q.lab !== p.lab && p.start - q.end - hop <= 40) run.push(p);
        else run = p.lab === "other" ? [] : [p];
        if(run.length > best.length) best = [...run];
      }
      const span = Math.abs(nbC - mainC);
      const inRun = best.length ? track.filter(f => f.comma !== null && f.t >= best[0].start && f.t <= best[best.length-1].end) : [];
      const two = inRun.length ? inRun.filter(f => Math.abs(f.comma - mainC) <= ORN.near || Math.abs(f.comma - nbC) <= ORN.near).length/inRun.length : 0;
      if(best.length - 1 < ORN.trilSwitch || span < ORN.trilSpan || two < ORN.trilTwoLevel){
        res.tips.push(otip("Tril duyulmadı: ana nota ile " + upW + " nota arasında tek parmakla hızlı ve düzenli git gel.",
                           "No trill heard: move quickly and evenly between the main note and the " + upE + " note with one finger."));
        break;
      }
      // Trilden önce tutulan ve sonda bekletilen nota tril değildir: ortanca parçanın iki katından uzun baş/son parçalar atılır
      const med = median(best.map(p => p.ms));
      while(best.length > ORN.trilSwitch + 1 && best[0].ms > 2*med) best.shift();
      while(best.length > ORN.trilSwitch + 1 && best[best.length-1].ms > 2*med) best.pop();
      const a = best[0], z = best[best.length-1], body = best.slice(0, -1).map(p => p.ms);
      res.found = true;
      res.rate = (best.length - 1)/2/((z.start - a.start)/1000);
      res.evenness = SLEARN.sd(body)/SLEARN.mean(body);
      res.durMs = partMs(track, a.start, z.end);
      res.count = best.length - 1;
      const nbs = best.filter(p => p.lab === "nb");
      res.intervalErr = SLEARN.mean(nbs.map(p => p.comma)) - nbC;
      const fail = [];
      if(res.evenness > ORN.trilEven) fail.push(otip("Tril düzensiz: iki notada eşit süre kal, önce yavaş ama düzenli çal.", "The trill is uneven: stay equally long on both notes; play slower but even first."));
      if(Math.abs(res.intervalErr) > ORN.near) fail.push(res.intervalErr < 0 ? otip("Üst nota pes.", "The upper note is flat.") : otip("Üst nota tiz.", "The upper note is sharp."));
      if(spec.rate && res.rate < spec.rate) fail.push(otip("Biraz daha hızlı: hedef saniyede " + spec.rate + " dönüş.", "A little faster: the target is " + spec.rate + " turns per second."));
      if(spec.sec && res.durMs < spec.sec*1000) fail.push(otip("Trili daha uzun sürdür: en az " + spec.sec + " sn.", "Keep the trill going longer: at least " + spec.sec + " s."));
      res.tips.push(...fail);
      res.ok = !fail.length;
      break;
    }
    case "giris": case "dusus": {
      const mains = parts.filter(p => p.lab === "main");
      const m = mains.length ? mains.reduce((a, b) => b.ms > a.ms ? b : a) : null;
      if(!m){ res.tips.push(otip("Hedef notayı duyamadım.", "I couldn't hear the target note.")); break; }
      // Ana parçanın hemen öncesindeki (giriş) ya da sonrasındaki (düşüş) kesintisiz perdeli ölçümler
      const iA = track.findIndex(f => f.t >= m.start), iB = track.findIndex(f => f.t > m.end);
      const seg = [];
      if(spec.kind === "giris") for(let i=iA-1; i>=0 && track[i].comma !== null; i--) seg.unshift(track[i]);
      else if(iB >= 0) for(let i=iB; i<track.length && track[i].comma !== null; i++) seg.push(track[i]);
      const along = seg.length > 1 ? seg.slice(1).filter((f, k) => spec.kind === "giris" ? f.comma > seg[k].comma : f.comma < seg[k].comma).length/(seg.length - 1) : 0;
      if(spec.kind === "giris"){
        const depth = seg.length ? mainC - seg[0].comma : 0, dur = seg.length ? m.start - seg[0].t : 0;
        if(depth < ORN.girisDepth || along < ORN.along || dur < ORN.giris[0]){
          res.tips.push(otip("Kayış duyulmadı: notaya birkaç koma pesten başla, parmağı ve dudağı bırakarak yukarı kay.",
                             "No slide heard: start a few commas below the note and slide up by releasing finger and lips."));
          break;
        }
        res.found = true; res.durMs = dur; res.intervalErr = -depth;
        if(dur > ORN.giris[1]){ res.tips.push(otip("Kayış çok yavaş: notaya daha çabuk otur.", "The slide is too slow: settle on the note sooner.")); break; }
      }else{
        const last = seg[seg.length-1], depth = seg.length ? mainC - last.comma : 0, dur = seg.length ? last.t - m.end : 0;
        if(depth < ORN.dususDepth || along < ORN.along || dur < ORN.dusus[0]){
          res.tips.push(otip("Düşüş duyulmadı: notanın sonunda sesi kesmeden aşağı bırak.",
                             "No fall heard: at the end of the note let the pitch drop without stopping the sound."));
          break;
        }
        res.found = true; res.durMs = dur; res.intervalErr = -depth;
        if(dur > ORN.dusus[1]){ res.tips.push(otip("Düşüş çok uzun: daha kısa ve kararlı bırak.", "The fall is too long: make it shorter and firmer.")); break; }
      }
      if(m.ms < mainMin){ res.tips.push(otip("Ana notayı daha uzun tut.", "Hold the main note longer.")); break; }
      if(!mainCheck(m)) break;
      res.ok = true;
      break;
    }
    default:
      res.measured = false;
  }
  return res;
}

// Örnek ses: [{ comma, ms, to? }] (to: kayış hedefi). Makam yoksa ana nota ve komşu en yakın perdeye oturtulur.
function ornamentNotes(spec){
  const snap = c => { const p = SCORE.nearestPerde(c); return p ? p.comma : c; };
  const m = spec.comma != null ? spec.comma : snap((spec.note - 67)*53/12);
  const n = ["carpma", "tekrar", "mordan", "tril"].includes(spec.kind) ? (spec.makam ? ornamentNeighbor(spec) : snap(ornamentNeighbor(spec))) : null;
  const rep = (k, xs) => Array.from({ length:k }, () => xs).flat();
  switch(spec.kind){
    case "carpma": return [{ comma:n, ms:60 }, { comma:m, ms:900 }];
    case "mordan": return [{ comma:m, ms:80 }, { comma:n, ms:70 }, { comma:m, ms:900 }];
    case "tekrar": return [{ comma:m, ms:350 }, ...rep(3, [{ comma:n, ms:50 }, { comma:m, ms:350 }])];
    case "tril": return [...rep(14, [{ comma:m, ms:70 }, { comma:n, ms:70 }]), { comma:m, ms:400 }];
    case "giris": return [{ comma:m - 5, ms:250, to:m }, { comma:m, ms:700 }];
    case "dusus": return [{ comma:m, ms:700 }, { comma:m, ms:300, to:m - 8 }];
  }
  return [];
}

// Ham ses alınamadıysa (dron ya da örnek ses çalıyordu, ya da tampon henüz dolmadı) nedeni söylenir
function ornamentUnmeasured(reason, kind){
  return { ok:false, measured:false, kind, found:false, durMs:null, intervalErr:null, rate:null, evenness:null, mainErr:null, count:0,
    tips:[reason === "busy" ? otip("Dron ya da örnek ses çalarken denemeyi değerlendiremiyorum: dronu kapat ya da örneğin bitmesini bekle.",
                                   "I can't judge an attempt while the drone or an example is playing: turn the drone off or wait for the example to end.")
                            : otip("Deneme tam kaydedilemedi: biraz bekleyip yeniden çal.", "The attempt wasn't fully recorded: wait a moment and play again.")] };
}
// Eserde önceki nota çarpmanın komşu perdesindeyse süs notası ondan ayırt edilemez
function ornamentAmbiguous(prevComma, spec){
  return spec.kind === "carpma" && prevComma != null && Math.abs(prevComma - ornamentNeighbor(spec)) <= ORN.near;
}
// Eserde işaretli süslemelerden kaçı duyuldu; ölçülemeyenler paydadan düşer
function ornamentScore(results){
  const m = results.filter(r => r.measured), found = m.filter(r => r.ok).length;
  return { n: m.length, found, pct: m.length ? Math.round(found/m.length*100) : null };
}

if(typeof module !== "undefined") module.exports = {
  ornamentTrack, microNotes, ORN, ornamentNeighbor, ornamentEval, ornamentNotes, ornamentScore, ornamentUnmeasured, ornamentAmbiguous,
  OnsetDetector, matchOnsets, rhythmScore, RHYTHM_PATTERNS, usulStrokeTimes, expectedTimes,
  toneQuality, dynamicsEval, mapToScale, seyirAnalysis, seyirFeedback, Staircase, perdePairs, makamChoices, makamPhrase
};
