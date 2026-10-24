// Beceri ölçümleri (saf mantık, Node'da test edilir): nota başı (onset) bulma ve ritim değerlendirmesi,
// ses kalitesi, dinamik (crescendo/decrescendo), seyir analizi ve kulak eğitimi soru üreticileri.
// Tarayıcıda lessons.js'ten sonra <script src="skills.js"> ile, Node'da require("./skills.js") ile yüklenir.

const SCORE = typeof module !== "undefined" ? require("./core.js") : { PERDES, nearestPerde, perdeNameAt, detectPitch, freqToMidi, noteName, contextPerde };
const SLEARN = typeof module !== "undefined" ? require("./learn.js") : { MAKAMS, makamById, tuningCtx, mean, sd, commaToWritten, perdeName, vibrato };

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
    // Karşılaştırma son 32 ölçümün ortancasıyla: uzun sabit seste her adımda bütün geçmiş sıralanmasın
    if(cur && Math.abs(f.comma - median(cur.cs.length > 32 ? cur.cs.slice(-32) : cur.cs)) <= tol){ cur.cs.push(f.comma); cur.end = f.t; continue; }
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
// ---- Hız ve teknik ----
// Teknik kalıpları kurallarla üretilir: makam dizisi ya da Batı gamı, arpej, üçlü atlama, dörtlü grup, register geçişi.
// spec: { type, makam?, base? (yazılı), mode?: "major"|"minor", octaves?: 1|2, sub: 2|3|4, art: "legato"|"tongue", pair?: [w,w] }
// Dönen: { notes:[{ w, c, d }], meter, label:{ tr, en } } ya da kalıp yazılı Mi3–Do6 dışına taşarsa null.
const TECH_LOW = 52, TECH_HIGH = 84;
const SCALE_STEPS = { major:[2,2,1,2,2,2,1], minor:[2,1,2,2,1,2,2] };
const SUB_NAMES = { 2:{ tr:"sekizlik", en:"eighths" }, 3:{ tr:"triole", en:"triplets" }, 4:{ tr:"on altılık", en:"sixteenths" } };
function techPattern(spec){
  const oct = spec.octaves || 1, d = 1/spec.sub;
  const mk = spec.makam ? SLEARN.makamById(spec.makam) : null;
  const W = w => ({ w, c:null }), C = c => ({ w: SLEARN.commaToWritten(c), c });
  // Dizi basamakları (artan sırada): çıkış ve iniş ayrı (makamlarda inişte farklı perde olabilir)
  const stepsOf = list => { const out = [...list]; for(let k=1;k<oct;k++) out.push(...list.slice(1).map(c => c + 53*k)); return out; };
  let up, dn;
  if(mk){ up = stepsOf(mk.asc).map(C); dn = stepsOf(mk.desc).map(C); }
  else if(spec.base != null){
    const st = SCALE_STEPS[spec.mode || "major"], ws = [spec.base];
    for(let k=0;k<7*oct;k++) ws.push(ws[ws.length-1] + st[k % 7]);
    up = dn = ws.map(W);
  }
  if(!up && spec.type !== "arp" && spec.type !== "break") return null;   // dizi kaynağı yok (makam ya da ton verilmemiş)
  const rev = a => [...a].reverse();
  let seq = [];
  switch(spec.type){
    case "scale": seq = [...up, ...rev(dn).slice(1)]; break;
    case "arp": {
      const iv = spec.mode === "minor" ? [0,3,7,12] : [0,4,7,12];
      const all = oct === 2 ? [...iv, ...iv.slice(1).map(x => x + 12)] : iv;
      seq = [...all, ...rev(all).slice(1)].map(x => W(spec.base + x));
      break;
    }
    case "thirds":
      for(let i=0;i+2<up.length;i++) seq.push(up[i], up[i+2]);
      for(let i=dn.length-1;i-2>=0;i--) seq.push(dn[i], dn[i-2]);
      break;
    case "groups":
      for(let i=0;i+3<up.length;i++) seq.push(...up.slice(i, i+4));   // son grup tepede biter
      break;
    case "break":
      for(let k=0;k<4;k++) seq.push(W(spec.pair[0]), W(spec.pair[1]));
      seq.push(W(spec.pair[0]));
      break;
  }
  if(!seq.length || seq.some(n => !(n.w >= TECH_LOW && n.w <= TECH_HIGH))) return null;
  const tone = lang => SCORE.noteName(spec.base)[lang].replace(/-?\d+$/, "");
  const key = { major:{ tr:"majör", en:"major" }, minor:{ tr:"minör", en:"minor" } }[spec.mode || "major"];
  const what = {
    scale: () => mk ? { tr: mk.name + " dizisi", en: mk.name + " scale" } : { tr: tone("tr") + " " + key.tr + " gamı", en: tone("en") + " " + key.en + " scale" },
    arp: () => ({ tr: tone("tr") + " " + key.tr + " arpej", en: tone("en") + " " + key.en + " arpeggio" }),
    thirds: () => mk ? { tr: mk.name + " üçlü atlamalar", en: mk.name + " in thirds" } : { tr: tone("tr") + " " + key.tr + " üçlü atlamalar", en: tone("en") + " " + key.en + " in thirds" },
    groups: () => mk ? { tr: mk.name + " dörtlü gruplar", en: mk.name + " four-note groups" } : { tr: tone("tr") + " " + key.tr + " dörtlü gruplar", en: tone("en") + " " + key.en + " four-note groups" },
    break: () => spec.pair ? { tr: "Register geçişi " + SCORE.noteName(spec.pair[0]).tr + "–" + SCORE.noteName(spec.pair[1]).tr, en: "Register crossing " + SCORE.noteName(spec.pair[0]).en + "–" + SCORE.noteName(spec.pair[1]).en } : null
  }[spec.type]();
  const extra = lang => (oct === 2 ? (lang === "tr" ? " · 2 oktav" : " · 2 octaves") : "") + (spec.art === "tongue" ? (lang === "tr" ? " · dille" : " · tongued") : "");
  return { notes: seq.map(n => ({ ...n, d })), meter:[4,4],
           label:{ tr: what.tr + " · " + SUB_NAMES[spec.sub].tr + extra("tr"), en: what.en + " · " + SUB_NAMES[spec.sub].en + extra("en") } };
}
// Çalıştaki notalar (5 ms'lik iz): bağlı çalışta perde değişimi, dille çalışta perdesiz ya da sesi düşen aralık nota
// sınırıdır. Aynı perdeye, sesi düşmeden kısa bir kesintiyle dönen parçalar (metronom tıkı) birleştirilir.
// Dönen: [{ t (nota başı, iz zamanı ms), end, comma }]
function runNotes(track){
  if(!track.length) return [];
  const hop = track.length > 1 ? track[1].t - track[0].t : 5, fix = track.winMs ? Math.max(0, (track.winMs - hop)/2) : 0;
  const rmsIn = (a, b) => track.filter(f => f.t >= a && f.t <= b).map(f => f.rms);
  const out = [];
  for(const p of microNotes(track, ORN.near, 30)){
    const q = out[out.length-1];
    if(q && Math.abs(p.comma - q.comma) <= 1.5 && p.start - q.end <= 50){
      const peak = Math.max(...rmsIn(q.start, q.end)), gap = rmsIn(q.end + hop/2, p.start - hop/2);
      if(!gap.length || Math.min(...gap) >= 0.45*peak){ q.end = p.end; continue; }
    }
    out.push({ start:p.start, end:p.end, comma:p.comma });
  }
  return out.filter(p => partMs(track, p.start, p.end) >= 40).map(p => ({ t: p.start - fix, end: p.end, comma: p.comma }));
}
// ---- Sesten ölçülü nota ----
// Kayıt (PCM) → ham notalar: 10 ms'lik iz, runNotes ile nota sınırları. Dönen: [{ t, end, comma }] (ms)
function audioNotes(pcm, sampleRate, opts = {}){
  return runNotes(ornamentTrack(pcm, sampleRate, { T: opts.T == null ? 5 : opts.T, hopMs:10, expectHz:300 }));
}
// Uzun kayıt parça parça çözülür (arayüz donmasın); parçalar ov ms örtüşür. prev: şimdiye kadarki notalar (mutlak ms),
// next: yeni parçanın audioNotes'u (parça başına göre), off: parçanın başı (ms). Tamamı örtüşmede kalan nota önceki
// parçada zaten var, atılır; sınırda biten notayla aynı perdede (≤1,5 koma) sınırda başlayan nota onunla birleşir.
function joinAudioChunk(prev, next, off, ov){
  const out = prev.map(n => ({ ...n })), B = off + ov;
  for(const x of next){
    const q = { ...x, t: x.t + off, end: x.end + off }, p = out[out.length-1];
    if(ov > 0 && q.end <= B) continue;
    if(p && ov > 0 && q.t <= B + 30 && p.end >= B - 60 && Math.abs(p.comma - q.comma) <= 1.5){ p.end = Math.max(p.end, q.end); continue; }
    out.push(q);
  }
  return out;
}
// Kaydın akordu: notaların AEU perdelerinden sapmalarının ortancası (en çok ±26 koma). Üç nota yetmez → 0.
// AEU'da perdeler sıktır (0, 4, 5, 8, 9...): yalnızca "en yakın perde"ye bakılırsa +3 kayık kayıt -1 kayık gibi görünür.
// Bu yüzden 0,25 koma adımla bütün kaymalar denenir; az kullanılan perdeye (PERDE_USE) oturan not en çok 1 koma ceza alır,
// küçük kayma da hafif öncelikli. Seçilen kaymanın çevresinde sapmaların ortancasıyla ince ayar yapılır.
// Perde ağırlığı makam verisinden (learn.js MAKAMS): bir perde ne kadar çok makamın dizisinde geçiyorsa o kadar "ana"dır.
// 5 ve üstü makamda geçen perde cezasız (Rast, Dügâh, Segâh, Çargâh, Nevâ, Hüseynî, Evç...), her eksik makam 0,2 ceza,
// hiçbirinde geçmeyen 1 koma ceza. 5 eşiği: 19 makamın yaklaşık dörtte biri.
const PERDE_USE = (() => {
  const use = {};
  for(const m of SLEARN.MAKAMS) for(const c of new Set([...m.asc, ...m.desc].map(x => ((x % 53) + 53) % 53))) use[c] = (use[c] || 0) + 1;
  return use;
})();
function tuningOffset(notes){
  if(!notes || notes.length < 3) return 0;
  const ps = SCORE.PERDES.map(p => ({ c:p[0], pen: 1 - Math.min(1, (PERDE_USE[((p[0] % 53) + 53) % 53] || 0)/5) }));
  const fit = x => { let best = null; for(const p of ps){ const v = Math.abs(x - p.c) + p.pen; if(!best || v < best.v) best = { v, d: x - p.c }; } return best; };
  let bo = 0, bv = 1e9;
  for(let o=-26;o<=26;o+=0.25){
    let s = 0; for(const n of notes) s += fit(n.comma - o).v;
    s = s/notes.length + 0.05*Math.abs(o);
    if(s < bv){ bv = s; bo = o; }
  }
  return Math.max(-26, Math.min(26, bo + median(notes.map(n => fit(n.comma - bo).d))));
}
// Ezgiyi vuruş ızgarasına oturtur. opts: { tempo? (verilirse tahmin edilmez), makam? (id), mode? ("aeu"|"icra"),
// offset? (yoksa tuningOffset) }. Dönen: { notes:[{ w, c, d (vuruş), rest, conf }], tempo, meter, offset }
function quantizeRun(notes, opts = {}){
  const mode = opts.mode || "aeu";
  const offset = opts.offset != null ? opts.offset : tuningOffset(notes);
  if(!notes || !notes.length) return { notes:[], tempo: opts.tempo || 90, meter:[4,4], offset };
  // Çok kısa notalar (süs) sonrakine katılır: başlangıç öne alınır, perde sonrakinin kalır
  const mergeShort = (arr, thr) => {
    const out = [];
    for(let i=0;i<arr.length;i++){
      const n = arr[i], next = arr[i+1];
      if(next && next.t - n.t < thr){ arr[i+1] = { ...next, t: n.t }; continue; }
      out.push(n);
    }
    return out;
  };
  let run = mergeShort(notes.map(n => ({ ...n })), 70);
  // Tempo: aday vuruş süresi için nota başlarının b/4 ve b/3 ızgarasına uzaklığının (vuruş cinsinden) kareler ortalaması
  const t0 = run[0].t;
  const gridCost = (b, g) => {
    let s = 0;
    for(const n of run){ const x = (n.t - t0)/b*g; s += ((x - Math.round(x))/g)**2; }
    return s/run.length;
  };
  let beat, grid;
  if(opts.tempo){
    beat = 60000/opts.tempo;
    grid = gridCost(beat, 3) < gridCost(beat, 4) ? 3 : 4;
  }else{
    const cands = [];
    for(let b=300;b<=1200;b+=2){
      const c4 = gridCost(b, 4), c3 = gridCost(b, 3), bpm = 60000/b;
      cands.push({ b, g: c3 < c4 ? 3 : 4, cost: Math.min(c3, c4)*(bpm < 60 || bpm > 120 ? 1.15 : 1) });
    }
    // Eşit sığan adaylar arasında (tek biçimli dizide b, b/2, 4b/3... hepsi sığar) sırayla: 60–120 içinde olan; süreleri
    // yalın olan (yarım vuruşun katı: 0; 0,25 ve 0,75: yarım ceza; 1,25 ya da üçlü: tam ceza); büyük nota değerli olan (az bölünme).
    // Üçlü ızgara, 4/3 tempoda dörtlü ızgarayla aynı başlangıçları verir; üçlü süreler tam ceza alır (0,7 de değeri kısar): düz sekizlikler
    // üçleme sayılmasın. Eşik 4e-4 vuruş² ≈ 0,02 vuruş (90'da ~13 ms) ölçüm gürültüsü payı.
    const best = Math.min(...cands.map(c => c.cost)), spans = run.map((n, i) => i < run.length-1 ? run[i+1].t - n.t : n.end - n.t + 10);
    const oddness = d => Math.abs(d*2 - Math.round(d*2)) < 1e-9 ? 0 : d < 1 && Math.abs(d*4 - Math.round(d*4)) < 1e-9 ? 0.5 : 1;
    const near = cands.filter(c => c.cost <= best + 4e-4).map(c => {
      const ds = spans.map(x => Math.max(1, Math.round(x/c.b*c.g))/c.g), bpm = 60000/c.b;
      return { c, inRange: bpm >= 60 && bpm <= 120, odd: SLEARN.mean(ds.map(oddness)),
               value: SLEARN.mean(ds)*(c.g === 3 ? 0.7 : 1) };
    }).sort((x, y) => (y.inRange - x.inRange) || (Math.abs(x.odd - y.odd) > 0.05 ? x.odd - y.odd : 0) || (y.value - x.value) || (y.c.b - x.c.b))
      .map(x => x.c);
    let pick = near[0];
    for(const c of cands) if(Math.abs(c.b - pick.b) <= 8 && c.g === pick.g && c.cost < pick.cost) pick = c;   // ince ayar
    beat = pick.b; grid = pick.g;
  }
  run = mergeShort(run, beat/8);
  const t1 = run[0].t, out = [];
  const mk = opts.makam ? SLEARN.makamById(opts.makam) : null, ctx = mk ? SLEARN.tuningCtx(mk, mode) : null;
  run.forEach((n, i) => {
    const next = run[i+1], span = next ? next.t - n.t : n.end - n.t + 10;   // son nota kendi end'ine göre
    const gx = (n.t - t1)/beat*grid, gdist = Math.abs(gx - Math.round(gx))/grid;
    const q = ms => Math.max(1, Math.round(ms/beat*grid))/grid;
    let d = q(span), rest = 0;
    if(next && next.t - n.end > beat/2){ rest = q(next.t - n.end); d = Math.max(1/grid, q(span) - rest); }
    // Perde: akort kayması çıkarıldıktan sonra makam dizisine ya da 1,5 komadan yakınsa AEU perdesine
    const c0 = n.comma - offset;
    const p = mk ? SCORE.contextPerde(c0, ctx) : SCORE.nearestPerde(c0);
    const ok = p && (mk || Math.abs(p.delta) <= 1.5);
    const c = ok ? (p.base != null ? p.base : p.comma) : null, pdev = ok ? Math.abs(p.delta) : 0;
    out.push({ w: Math.round(67 + (c != null ? c : c0)*12/53), c, d, rest:false,
               conf: Math.max(0, 1 - pdev/3) * Math.max(0, 1 - gdist*2) });
    if(rest) out.push({ w:null, c:null, d: rest, rest:true, conf:1 });
  });
  return { notes: out, tempo: Math.round(60000/beat*10)/10, meter:[4,4], offset };
}
// runNotes çıktısını perf zaman çizgisine (t0) ve en yakın yazılı notaya çevirir
const runPlayed = (notes, t0) => notes.map(n => ({ t: t0 + n.t, w: Math.round(67 + n.comma*12/53) }));
// Beklenen notalarla çalınanların hizalanması (dinamik programlama). expected: [{ t, w, ms }], played: [{ t, w }],
// opts.busy: [[b,e]] — bu aralıktaki beklenen notalar "skip", çalınanlar yok sayılır.
// Eşleşme maliyeti: (perde farklı ? 1 : 0) + 0,5·min(1, |dt|/tol), yalnızca |dt| ≤ max(400, 4 nota); kaçan ya da fazla
// nota 1. Zaman toleransı geniş: tempo kaçsa da (acele) notalar sırasıyla eşleşir, kayma ayrıca ölçülür (drift).
function alignRun(expected, played, opts = {}){
  const inBusy = t => (opts.busy || []).some(([b, e]) => t >= b && t <= e);
  const E = expected.map((e, i) => ({ ...e, i })).filter(e => !inBusy(e.t)), Pl = played.filter(p => !inBusy(p.t));
  const n = E.length, m = Pl.length, tolOf = e => Math.max(400, 4*e.ms);
  const D = Array.from({ length:n+1 }, () => new Float64Array(m+1)), B = Array.from({ length:n+1 }, () => new Uint8Array(m+1));
  for(let i=1;i<=n;i++){ D[i][0] = i; B[i][0] = 1; }
  for(let j=1;j<=m;j++){ D[0][j] = j; B[0][j] = 2; }
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++){
    let best = D[i-1][j] + 1, how = 1;                               // kaçan
    if(D[i][j-1] + 1 < best){ best = D[i][j-1] + 1; how = 2; }       // fazla
    const e = E[i-1], p = Pl[j-1], dt = Math.abs(p.t - e.t), tol = tolOf(e);
    if(dt <= tol){ const c = D[i-1][j-1] + (p.w === e.w ? 0 : 1) + 0.5*dt/tol; if(c < best){ best = c; how = 3; } }
    D[i][j] = best; B[i][j] = how;
  }
  const res = expected.map((e, i) => ({ i, w: e.w, state: "skip" }));
  let extra = 0;
  for(let i=n, j=m; i>0 || j>0; ){
    const how = B[i][j];
    if(how === 3){ const e = E[i-1], p = Pl[j-1]; res[e.i] = { i:e.i, w:e.w, state: p.w === e.w ? "ok" : "pitch", dev: p.t - e.t, got: p.t, gotW: p.w }; i--; j--; }
    else if(how === 1){ res[E[i-1].i] = { i:E[i-1].i, w:E[i-1].w, state:"miss" }; i--; }
    else { extra++; j--; }
  }
  const ok = res.filter(r => r.state === "ok"), devs = ok.map(r => r.dev), mean = SLEARN.mean(devs), sd = SLEARN.sd(devs);
  const ratios = [];
  for(let k=1;k<res.length;k++) if(res[k].state === "ok" && res[k-1].state === "ok")
    ratios.push((res[k].got - res[k-1].got)/(expected[k].t - expected[k-1].t));
  // Tempo kayması: sapmanın zamana göre doğrusal eğimi × süre (ms); eksi = hızlanıyor
  let drift = 0;
  if(ok.length > 2){
    const xs = ok.map(r => expected[r.i].t), mx = SLEARN.mean(xs);
    let num = 0, den = 0; ok.forEach((r, k) => { num += (xs[k] - mx)*(r.dev - mean); den += (xs[k] - mx)**2; });
    drift = den ? num/den*(xs[xs.length-1] - xs[0]) : 0;
  }
  return { notes: res, extra, correct: n ? ok.length/n : 0, mean, sd, drift,
           evenness: ratios.length > 1 ? SLEARN.sd(ratios)/SLEARN.mean(ratios) : 0 };
}
// Çalış temiz mi; ipuçları en büyük sorundan başlar
function runVerdict(al, noteMs, voicedRatio){
  // Notaların yarısından fazlası dron ya da örnek ses sırasına düştüyse çalış değerlendirilmez
  if(al.notes.length && al.notes.filter(r => r.state === "skip").length > al.notes.length/2) return { clean:false, measured:false,
    tips:[otip("Dron ya da örnek ses çalarken çalışı değerlendiremiyorum: merdivende dronu kapat.", "I can't judge a run while the drone or an example is playing: turn the drone off for the ladder.")] };
  if(!(voicedRatio >= 0.5)) return { clean:false, measured:false,
    tips:[otip("Duyamadım: biraz daha güçlü ya da mikrofona yakın çal.", "I couldn't hear it: play a little louder or closer to the microphone.")] };
  const tips = [], nm = w => SCORE.noteName(w);
  const bad = al.notes.filter(r => r.state === "pitch" || r.state === "miss");
  if(bad.length){
    const idx = bad.slice(0, 3).map(r => r.i + 1);
    tips.push(otip(idx.map(i => i + ".").join(", ") + (bad.length > 3 ? " …" : "") + (bad.length > 1 ? " notalar" : " nota") + " yanlış ya da eksik.",
                   "Wrong or missing: note " + idx.join(", ") + (bad.length > 3 ? " …" : "") + "."));
    // Hatalar art arda üç nota içinde toplanıyorsa o geçiş zor
    for(let k=0;k+1<bad.length;k++) if(bad[k+1].i - bad[k].i <= 2){
      const a = al.notes[bad[k].i], b = al.notes[Math.min(al.notes.length - 1, bad[k].i + 1)];
      tips.push(otip(nm(a.w).tr + "–" + nm(b.w).tr + " geçişinde takılıyorsun: o iki notayı yavaşça tekrar et.",
                     "You stumble on " + nm(a.w).en + "–" + nm(b.w).en + ": repeat those two notes slowly."));
      break;
    }
  }
  if(Math.abs(al.drift || 0) > 0.5*noteMs)
    tips.push(al.drift < 0 ? otip("Hızlanıyorsun: notalar giderek erken geliyor (sonda " + Math.round(-al.drift) + " ms erken).", "You're speeding up: the notes come earlier and earlier (" + Math.round(-al.drift) + " ms early by the end).")
                           : otip("Yavaşlıyorsun: notalar giderek geç geliyor (sonda " + Math.round(al.drift) + " ms geç).", "You're slowing down: the notes come later and later (" + Math.round(al.drift) + " ms late by the end)."));
  else if(Math.abs(al.mean) > 0.25*noteMs)
    tips.push(al.mean < 0 ? otip("Acele ediyorsun (ortalama " + Math.round(-al.mean) + " ms erken): metronomu dinle.", "You're rushing (" + Math.round(-al.mean) + " ms early on average): listen to the click.")
                          : otip("Geride kalıyorsun (ortalama " + Math.round(al.mean) + " ms geç).", "You're dragging (" + Math.round(al.mean) + " ms late on average)."));
  if(al.sd > 0.2*noteMs || al.evenness > 0.2)
    tips.push(otip("Notalar eşit değil: her notaya aynı süreyi ver, gerekirse tempoyu düşür.", "The notes are uneven: give every note the same length; slow down if needed."));
  const clean = al.correct >= 0.9 && Math.abs(al.mean) <= 0.25*noteMs && al.sd <= 0.2*noteMs && al.evenness <= 0.2;
  return { clean, measured:true, tips };
}
// Tempo merdiveni: temiz çalış → tempo bir basamak artar; üst üste iki temiz olmayan çalış → bir basamak iner; tek hata
// tempoyu değiştirmez; ölçülemeyen çalış sayılmaz. Art arda üç temiz olmayan çalış → dinlen. Eser yüzdesi için de
// kullanılır (stepFn: () => 5, max: 120).
class TempoLadder{
  constructor(start, opts = {}){
    this.tempo = start; this.best = 0; this.target = opts.target != null ? opts.target : null;
    this.max = opts.max || 220; this.floor = Math.round(start*0.7);
    this.stepFn = opts.stepFn || (t => t > 120 ? 6 : 4);
    this.dirty = 0; this.streak = 0;
  }
  record(kind){
    let done = false;
    if(kind === "clean"){
      this.best = Math.max(this.best, this.tempo); this.dirty = 0; this.streak = 0;
      done = this.target != null && this.best >= this.target;
      if(!done) this.tempo = Math.min(this.max, this.tempo + this.stepFn(this.tempo));
    }else if(kind === "dirty"){
      this.dirty++; this.streak++;
      if(this.dirty >= 2){ this.tempo = Math.max(this.floor, this.tempo - this.stepFn(this.tempo)); this.dirty = 0; }
    }
    return { tempo: this.tempo, best: this.best, done, rest: this.streak >= 3 };
  }
}
// Çalış aralığında (ilk notanın başı – son notanın sonu, iz zamanı) perde bulunan ölçümlerin oranı; sayım ve
// kuyruk sessizliği kısa kalıplarda oranı düşürmesin
function runVoicedRatio(track, fromMs, toMs){
  const fr = track.filter(f => f.t >= fromMs && f.t <= toMs);
  return fr.length ? fr.filter(f => f.comma !== null).length/fr.length : 0;
}
// Gecikme kalibrasyonu (ham ses yolu): 2,5 ms'lik bloklarda ses düzeyi taban gürültünün 6 katını aşınca bir başlangıç;
// iki başlangıç arası en az minGapMs. t0: ilk örneğin performance.now() zamanı. Dönen: başlangıç zamanları (ms).
function pcmRises(data, sampleRate, t0, minGapMs = 300){
  const blk = Math.max(1, Math.round(sampleRate*0.0025)), out = [];
  let floor = 1, last = -1e9;
  for(let o=0; o+blk<=data.length; o+=blk){
    let s = 0; for(let i=0;i<blk;i++) s += data[o+i]*data[o+i];
    const rms = Math.sqrt(s/blk), t = t0 + o/sampleRate*1000;
    floor = Math.min(floor, rms + 1e-5);
    if(rms > floor*6 && t - last > minGapMs){ out.push(t); last = t; }
  }
  return out;
}
// Merdiven döngüsü: play(tempo, cb) bir çalış yapar, judge(sonuç) "clean"|"dirty"|"unmeasured" verir; hedefte ya da
// dinlenme gerekince onEnd. wait(fn) sonraki çalışı bekletir. stop() döngüyü keser.
function ladderLoop(ladder, play, judge, opts = {}){
  const ctl = { active:true, stop(){ ctl.active = false; } };
  const once = () => {
    if(!ctl.active) return;
    play(ladder.tempo, res => {
      if(!ctl.active) return;
      const r = ladder.record(judge(res));
      if(opts.onRun) opts.onRun(r, res);
      if(r.done || r.rest){ ctl.active = false; if(opts.onEnd) opts.onEnd(r); return; }
      (opts.wait || (f => setTimeout(f, 2000)))(once);
    });
  };
  once();
  return ctl;
}
// patternKey'in tersi (İlerleme satırı kalıbın adını gösterebilsin)
function patternFromKey(key){
  const [type, who, mode, oct, sub, art] = String(key).split(":");
  const spec = { type, sub:+sub, art, octaves:+oct || 1 };
  if(mode) spec.mode = mode;
  if(type === "break") spec.pair = who.split("-").map(Number);
  else if(/^\d+$/.test(who)) spec.base = +who;
  else spec.makam = who;
  return spec;
}
const patternKey = spec => [spec.type, spec.makam || (spec.pair ? spec.pair.join("-") : spec.base), spec.mode || "", spec.octaves || 1, spec.sub, spec.art].join(":");

// Eserde işaretli süslemelerden kaçı duyuldu; ölçülemeyenler paydadan düşer
function ornamentScore(results){
  const m = results.filter(r => r.measured), found = m.filter(r => r.ok).length;
  return { n: m.length, found, pct: m.length ? Math.round(found/m.length*100) : null };
}

// ---- Perde eğrisi ----
// Kayıttaki perde izinden nota başına entonasyon işaretleri. Emin olunmayan yerde işaret konmaz.
// Eşikler yalnızca sentetik seslerle seçildi; gerçek kayıtlarla gözden geçirilmeli.
const INTON = { offKoma:1.5, driftKoma:1.5, scoopKoma:2, wobbleKoma:0.8, headMs:120, tailMs:80, minStableMs:150, minFrames:4, driftMinMs:400, spikeKoma:20, vibMinMs:700 };
const INTON_ERRORS = ["pes", "tiz", "kayma", "titrek"];   // diğerleri (alttan, ustten, vibrato, disi) bilgi işareti

// t'den küçük olmayan ilk karenin indeksi (ikili arama)
function firstIndexAt(trace, t){
  let lo = 0, hi = trace.length;
  while(lo < hi){ const mid = (lo + hi) >> 1; if(trace[mid].t < t) lo = mid + 1; else hi = mid; }
  return lo;
}

// Sessizlikle (comma:null) ayrılmış her bölümde tek karelik sıçramalar (oktav, alt harmonik) atılır,
// kalanlara 3'lü kayan medyan uygulanır.
function cleanTrace(raw){
  const out = [];
  let seg = [];
  const flush = () => {
    const keep = seg.filter((f, i) => {
      const nb = seg.slice(Math.max(0, i-2), i).concat(seg.slice(i+1, i+3)).map(x => x.comma);
      return nb.length < 2 || Math.abs(f.comma - median(nb)) <= INTON.spikeKoma;
    });
    keep.forEach((f, i) => out.push({ t:f.t, comma: median(keep.slice(Math.max(0, i-1), i+2).map(x => x.comma)) }));
    seg = [];
  };
  for(const f of raw){
    if(f.comma == null){ flush(); out.push({ t:f.t, comma:null }); }
    else seg.push(f);
  }
  flush();
  return out;
}

// Notanın perdesi: bağlam varsa önce 2,5 koma içindeki dizi perdesi (icra düzeltmesiyle). contextPerde'nin
// 1,5 koma kuralı burada kullanılmaz: 2 koma pes bir Rast komşu AEU perdesi (Dik Geveşt) sayılır ve pes
// diye işaretlenemezdi. Bağlam yoksa ya da dizide yakın perde yoksa AEU'nun en yakın perdesi (dizi dışı).
function notePerde(comma, ctx){
  if(ctx && ctx.scale && ctx.scale.length){
    let best = null, bd = 1e9;
    for(const c of new Set(ctx.scale.map(x => ((Math.round(x) % 53) + 53) % 53))){
      for(let k = -2; k <= 3; k++){
        const base = c + 53*k, name = SCORE.perdeNameAt(base);
        if(!name) continue;
        // ctx.icra verilmişse hem AEU hem icra perdesi doğru sayılır (AEU modunda geleneksel icra pes denmesin)
        const offs = new Set([(ctx.offsets && ctx.offsets[c]) || 0, ...(ctx.icra && ctx.icra[c] ? [0, ctx.icra[c]] : [])]);
        for(const off of offs){
          const target = base + off, d = Math.abs(comma - target);
          if(d < bd){ bd = d; best = { name, comma:target, inScale:true }; }
        }
      }
    }
    if(best && bd <= 2.5) return best;
  }
  const g = SCORE.nearestPerde(comma);
  return g ? { name:g.name, comma:g.comma, inScale:!ctx } : null;
}
// 3–9 Hz'lik düzenli salınım var mı: artık bir periyot kaydırılınca kendine benzer, yarım periyot
// kaydırılınca tersine döner (düzenli salınımda puan ≈ 1, gürültüde ≈ 0). vibrato() 40 ms karelerde ve
// kısa notada çoğu zaman sonuç vermez.
function oscillates(rs, dt){
  const ac = L => { let a = 0, b = 0; for(let i = 0; i + L < rs.length; i++){ a += rs[i]*rs[i+L]; b += rs[i]*rs[i]; } return b > 0 ? a/b : 0; };
  let best = 0;
  for(let L = Math.max(2, Math.round(111/dt)); L <= Math.round(333/dt) && L < rs.length/2; L++)
    best = Math.max(best, (ac(L) - ac(Math.round(L/2)))/2);
  return best > 0.6;
}

// notes: [{ start, end, written }] (ms), trace: cleanTrace sonucu (aynı zaman ekseninde), opts.ctx: makam bağlamı
function intonationIssues(notes, trace, opts = {}){
  const ctx = opts.ctx || null, K = INTON;
  return notes.map((n, i) => {
    const res = { i, written:n.written, perde:null, target:null, delta:null, inScale:true, drift:null, kinds:[], short:true };
    const fr = [];
    for(let j = firstIndexAt(trace, n.start); j < trace.length && trace[j].t <= n.end; j++) if(trace[j].comma != null) fr.push(trace[j]);
    const a = n.start + K.headMs, b = n.end - K.tailMs;
    const st0 = fr.filter(f => f.t >= a && f.t <= b);
    if(b - a < K.minStableMs || st0.length < K.minFrames) return res;
    const med = median(st0.map(f => f.comma)), p = notePerde(med, ctx);
    // Süzgeçten kaçan birkaç karelik perde bulucu hatası (oktav, on ikili) kayma ve titreklik hesabına girmesin
    const st = st0.filter(f => Math.abs(f.comma - med) <= K.spikeKoma);
    if(!p) return res;
    Object.assign(res, { short:false, perde:p.name, target:p.comma, delta:med - p.comma, inScale:p.inScale !== false });
    const k = res.kinds;
    // Dizi dışı notada hedef belirsiz: pes/tiz denmez
    if(!(ctx && !res.inScale)){
      if(res.delta < -K.offKoma) k.push("pes");
      else if(res.delta > K.offKoma) k.push("tiz");
    }
    if(n.end - n.start >= K.driftMinMs){
      const m = Math.floor(st.length/3);
      if(m >= 2){
        res.drift = SLEARN.mean(st.slice(-m).map(f => f.comma)) - SLEARN.mean(st.slice(0, m).map(f => f.comma));
        if(Math.abs(res.drift) > K.driftKoma) k.push("kayma");
      }
    }
    // Giriş: notanın ilk headMs'i ve nota başından önceki kareler (kararlı nota bulucusu notayı ≈ 80 ms geç
    // başlatır). Geriye doğru sessizliğe, önceki notanın sonuna ya da headMs'e kadar gidilir.
    const head = fr.filter(f => f.t < a), lim = Math.max(n.start - K.headMs, i ? notes[i-1].end : -Infinity);
    for(let j = firstIndexAt(trace, n.start) - 1; j >= 0 && trace[j].t > lim && trace[j].comma != null; j--) head.unshift(trace[j]);
    if(head.length && Math.abs(res.delta) <= K.offKoma){
      const h = SLEARN.mean(head.map(f => f.comma)) - p.comma;
      if(h < -K.scoopKoma) k.push("alttan"); else if(h > K.scoopKoma) k.push("ustten");
    }
    // Doğrusal eğilim çıkarıldıktan sonra kalan dalgalanma
    const xs = st.map(f => f.t), ys = st.map(f => f.comma), mx = SLEARN.mean(xs), my = SLEARN.mean(ys);
    let nu = 0, de = 0;
    for(let j = 0; j < xs.length; j++){ nu += (xs[j]-mx)*(ys[j]-my); de += (xs[j]-mx)**2; }
    const sl = de ? nu/de : 0, rs = ys.map((y, j) => y - (my + sl*(xs[j]-mx)));
    const dt = (xs[xs.length-1] - xs[0])/Math.max(1, xs.length - 1), spread = SLEARN.sd(rs);
    if(spread > 0.15 && oscillates(rs, dt)) k.push("vibrato");
    // Titreklik ancak vibratonun ayırt edilebileceği uzunlukta (kararlı bölüm ≥ 700 ms) söylenir
    else if(b - a >= K.vibMinMs && spread > K.wobbleKoma) k.push("titrek");
    if(ctx && !res.inScale) k.push("disi");
    return res;
  });
}

// Kaç nota yerinde ve kayıt boyunca en çok kaçan (en az 2 kez çalınmış) üç perde
function intonationSummary(issues){
  const m = issues.filter(x => !x.short);
  const ok = m.filter(x => !x.kinds.some(k => INTON_ERRORS.includes(k))).length;
  const g = new Map();
  for(const x of m){ if(!g.has(x.perde)) g.set(x.perde, { perde:x.perde, written:x.written, ds:[] }); g.get(x.perde).ds.push(x.delta); }
  const perdes = [...g.values()].map(p => ({ perde:p.perde, written:p.written, n:p.ds.length, mean:SLEARN.mean(p.ds) }))
    .filter(p => p.n >= 2 && Math.abs(p.mean) > 1)
    .sort((x, y) => Math.abs(y.mean) - Math.abs(x.mean)).slice(0, 3)
    .map(p => ({ ...p, dir: p.mean < 0 ? "pes" : "tiz" }));
  return { total:issues.length, measured:m.length, ok, perdes };
}

if(typeof module !== "undefined") module.exports = {
  INTON, INTON_ERRORS, firstIndexAt, cleanTrace, intonationIssues, intonationSummary,
  ornamentTrack, microNotes, ORN, ornamentNeighbor, ornamentEval, ornamentNotes, ornamentScore, ornamentUnmeasured, ornamentAmbiguous,
  techPattern, patternKey, runNotes, audioNotes, joinAudioChunk, tuningOffset, quantizeRun, runPlayed, alignRun, runVerdict, TempoLadder, patternFromKey, runVoicedRatio, ladderLoop, pcmRises,
  OnsetDetector, matchOnsets, rhythmScore, RHYTHM_PATTERNS, usulStrokeTimes, expectedTimes,
  toneQuality, dynamicsEval, mapToScale, seyirAnalysis, seyirFeedback, Staircase, perdePairs, makamChoices, makamPhrase
};
