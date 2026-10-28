// Seni izleyen eşlik: grup senin temponu ve eserde nerede olduğunu dinleyerek çalar.
// Eserde (nota arşivi, etüt ve eserler): çaldığın notalar eserin notalarıyla eşlenir (ScoreFollower), eşleşmelerden tempo ve
// konum çıkar (TempoMap); grup bu haritaya göre çalar, sen durunca bekler, yeniden girdiğin notadan devam eder.
// Eşlik sekmesinde (nota yok): nota başları usulün en yakın hücresine eşlenip aynı tempo haritası (daha yumuşak kazançla)
// düzeltilir; taksimden sonra grup, durakta biten taksimin ardından gelen ilk notayla girer (band.js).
// Mantık tarayıcıda ve Node'da çalışır (require("./follow.js")); FollowBand yalnızca tarayıcıda.

// ---- Nota başları ----
// Perde bulucunun kararlı nota olayları (note) gecikmeli gelir; başlangıç ham ölçümlerden (raw) geriye bakılarak ve yakındaki
// nota başı (onset) ile bulunur. Aynı perdede dille yeniden vuruş, onset'ten en az reMs sonra perde değişmediyse sayılır
// (perde değişimi de bir onset üretir; o onset yeni perdeye ait olmalı).
class NoteStarts{
  constructor(o = {}){ this.reMs = o.reMs || 120; this.reset(); }
  reset(){ this.rawF = []; this.ons = []; this.cur = null; this.last = -1e9; }
  raw(t, comma){
    this.rawF.push({ t, w: Math.round(comma*12/53 + 67) });
    while(this.rawF.length && t - this.rawF[0].t > 1500) this.rawF.shift();
  }
  onset(t){ this.ons.push(t); while(this.ons.length && t - this.ons[0] > 1500) this.ons.shift(); }
  silence(){ this.cur = null; }
  // Kararlı nota; yeni bir nota başlıyorsa { t, w } döner
  note(t, w){
    if(w === this.cur){
      const o = this.ons.find(x => x > this.last + 90 && t - x >= this.reMs && t - x < 600);
      if(o == null) return null;
      this.last = o; this.ons = this.ons.filter(x => x > o);
      return { t: o, w };
    }
    this.cur = w;
    // Ham ölçümlerde bu perdenin kesintisiz (en çok bir sapan ölçüyle, sessizlik boşluğu olmadan) sürdüğü en erken an
    let tp = t, miss = 0, prev = t;
    for(let i = this.rawF.length - 1; i >= 0; i--){
      const f = this.rawF[i];
      if(f.t > t) continue;
      if(prev - f.t > 70 || f.t <= this.last) break;
      prev = f.t;
      if(f.w === w){ tp = f.t; miss = 0; }
      else if(++miss > 1) break;
    }
    const o = this.ons.filter(x => x > this.last + 90 && x >= tp - 150 && x <= tp + 40).pop();
    const st = o != null ? o : tp;
    if(o != null) this.ons = this.ons.filter(x => x > o);
    this.last = st;
    return { t: st, w };
  }
}

// ---- Tempo haritası ----
// Vuruş (dörtlük) ↔ zaman (ms). observe(t, b): b vuruşundaki nota t anında çalındı. Tempo son eşleşmelerin doğrusal
// uydurmasına yavaşça yaklaşır; konum hatanın bir kısmı kadar düzeltilir (grup sıçramadan sana yaklaşır).
// g: kazançlar (FOLLOW'u ezer); nota başı ölçümü oynak olan yerde (Eşlik sekmesi) daha küçük kazanç ve uzun geçmiş
const FOLLOW = { phase:0.5, tempo:0.35, histBeats:4, minSpan:1, lo:0.55, hi:1.6 };
class TempoMap{
  constructor(beatMs, t0 = 0, b0 = 0, g = {}){ this.base = beatMs; this.beatMs = beatMs; this.t0 = t0; this.b0 = b0; this.hist = []; this.g = { ...FOLLOW, ...g }; }
  beatAt(t){ return this.b0 + (t - this.t0)/this.beatMs; }
  timeAt(b){ return this.t0 + (b - this.b0)*this.beatMs; }
  anchor(t, b, beatMs = this.beatMs){ this.t0 = t; this.b0 = b; this.beatMs = beatMs; }
  clearHist(){ this.hist = []; }
  observe(t, b){
    this.hist.push({ t, b });
    const g = this.g;
    while(this.hist.length > 2 && b - this.hist[0].b > g.histBeats) this.hist.shift();
    let bm = this.beatMs;
    const h = this.hist, span = h.length > 1 ? h[h.length-1].b - h[0].b : 0;
    if(h.length >= 3 && span >= g.minSpan){
      const mb = h.reduce((s, x) => s + x.b, 0)/h.length, mt = h.reduce((s, x) => s + x.t, 0)/h.length;
      let num = 0, den = 0;
      for(const x of h){ num += (x.b - mb)*(x.t - mt); den += (x.b - mb)**2; }
      if(den > 0){
        const est = Math.max(this.base*g.lo, Math.min(this.base*g.hi, num/den));
        bm += g.tempo*(est - bm);
      }
    }
    const now = this.beatAt(t);
    this.anchor(t, now + g.phase*(b - now), bm);
  }
  pct(){ return Math.round(this.base/this.beatMs*100); }
}

// ---- Eser takipçisi ----
// notes: [{ i (eserdeki sıra), beat, w }] (yalnızca çalınan notalar). push(start, map) eşleşmeyi döndürür:
// { j (notes içindeki sıra), i, beat, t, ok (perde doğru mu), skip (atlanan nota sayısı) } ya da null (fazla nota, süsleme).
// paused: grup bekliyor; o zaman zamana bakılmaz, perdesi tutan en yakın nota alınır.
class ScoreFollower{
  constructor(notes, o = {}){ this.notes = notes; this.look = o.look || 2; this.maxSkip = o.maxSkip || 4; this.k = 0; this.started = false; }
  get done(){ return this.k >= this.notes.length; }
  get next(){ return this.notes[this.k]; }
  push(s, map, paused = false){
    if(this.done) return null;
    const N = this.notes, k = this.k;
    const cands = [];
    for(let j = k; j < N.length && j - k <= this.maxSkip && (j === k || N[j].beat - N[k].beat <= this.look || paused); j++) cands.push(j);
    let best = null, bc = Infinity;
    for(const j of cands){
      if(N[j].w !== s.w) continue;
      const c = !this.started || paused ? (j - k) : Math.abs(s.t - map.timeAt(N[j].beat))/map.beatMs + 0.5*(j - k);
      if(c < bc){ bc = c; best = j; }
    }
    let ok = true;
    if(best !== null && this.started && !paused && bc > 1.2) best = null;
    if(best === null){
      // Yanlış perde ama zamanında: sıradaki nota sayılır (takip kopmasın)
      // (süsleme ya da fazla nota önceki notaya yakın düşer; ona sıradaki nota denmez)
      if(!this.started || paused) return null;
      const d = (s.t - map.timeAt(N[k].beat))/map.beatMs;
      if(d < -0.3 || d > 0.3) return null;
      if(this.lastT != null && s.t - this.lastT < 0.6*(N[k].beat - this.lastBeat)*map.beatMs) return null;
      best = k; ok = false;
    }
    this.started = true; this.k = best + 1; this.lastT = s.t; this.lastBeat = N[best].beat;
    return { j: best, i: N[best].i, beat: N[best].beat, t: s.t, ok, skip: best - k };
  }
  // Aynı perdenin dille tekrarı duyulmadıysa (perde sürüyor, sıradaki nota da aynı perde) sıradaki nota çalınmış sayılır;
  // zamanı bilinmediği için tempoya katılmaz
  repeatDue(now, map, sounding){
    if(this.done || !this.started || this.k === 0) return false;
    const nx = this.next, pv = this.notes[this.k - 1];
    return sounding === nx.w && pv.w === nx.w && now - map.timeAt(nx.beat) > 0.3*map.beatMs;
  }
  assume(){ const j = this.k++, n = this.notes[j]; this.lastBeat = n.beat; return { j, i: n.i, beat: n.beat, ok: true, skip: 0 }; }
  // Sıradaki nota beklenenden ne kadar geç (ms); grup bunu aşınca bekler
  late(now, map){ return this.done || !this.started ? 0 : now - map.timeAt(this.next.beat); }
}
// Bekleme eşiği (ms): sıradaki nota bu kadar gecikirse grup durur
const followWait = beatMs => Math.max(550, beatMs*0.85);

// ---- Eşlik sekmesi: notasız tempo izleme ----
// Nota yokken her nota başını en yakın hücreye yuvarlayıp tempo çıkarmak, tempo değişince bir hücre kayıp yanlış tempoya
// kilitlenebiliyor. Tempo bunun yerine ardışık nota başlarının aralığından (hücrenin 1–4 katı) bulunur: aralık/kat örneklerinin
// ortancası (en az minQ hücrelik aralıklardan); evre ayrıca, en yakın hücreye uzaklığın küçük bir kısmı kadar düzeltilir. map: TempoMap (vuruş = usul birimi),
// cellU: hücre (vuruş cinsinden). GROOVE: tempo kazancı, evre kazancı, örnek sayısı, aralık toleransı (hücre oranı), evre penceresi.
const GROOVE = { tempo:0.35, phase:0.3, keep:8, minN:3, tol:0.3, win:0.45, lo:0.55, hi:1.6, minQ:2 };
class GrooveTracker{
  constructor(map, cellU, g = {}){ this.map = map; this.cellU = cellU; this.g = { ...GROOVE, ...g }; this.last = null; this.samples = []; }
  push(t){
    const g = this.g, map = this.map, cellMs = map.beatMs*this.cellU;
    let bm = map.beatMs;
    if(this.last != null){
      const d = t - this.last, q = Math.round(d/cellMs);
      // Tek hücrelik kısa aralıklar (nota başı ±50 ms oynayınca katı karışır) tempoya katılmaz
      if(q >= g.minQ && q <= 4 && Math.abs(d/q - cellMs) <= g.tol*cellMs){
        this.samples.push(d/q); if(this.samples.length > g.keep) this.samples.shift();
        if(this.samples.length >= g.minN){
          const s = [...this.samples].sort((a, b) => a - b), med = s[Math.floor(s.length/2)]/this.cellU;
          bm += g.tempo*(Math.max(map.base*g.lo, Math.min(map.base*g.hi, med)) - bm);
        }
      }
    }
    this.last = t;
    const ub = map.beatAt(t), err = ub - Math.round(ub/this.cellU)*this.cellU;
    map.anchor(t, Math.abs(err) <= g.win*this.cellU ? ub - g.phase*err : ub, bm);
  }
  reset(){ this.last = null; }
}

if(typeof module !== "undefined") module.exports = { NoteStarts, TempoMap, ScoreFollower, FOLLOW, followWait, GrooveTracker, GROOVE };

// ======== Tarayıcı: eseri izleyen grup ========
// Ses saati ↔ performance.now(): ctxToPerf (trainers.js) duyulma anını verir; tersini kurmak için
function perfToCtx(a, perfT){ return a.currentTime + (perfT - ctxToPerf(a, a.currentTime))/1000; }

// evs: vuruş cinsinden olaylar ({ t (vuruş), dur (vuruş), ... } bandEventsFor ile beatMs = 1). map: TempoMap.
// Grup 25 ms'de bir 150 ms ilerisini kurar; konum geriye kayarsa çalınmış olaylar yinelenmez, ileri sıçrarsa
// 120 ms'den eski olaylar atlanır. hold(true): bekle (yeni olay kurulmaz).
function FollowBand(a, evs, map, o){
  const out = a.createGain(); out.gain.value = o.gain != null ? o.gain : 0.8; out.connect(a.destination);
  let k = 0, held = true, sched = -Infinity, timer = null;
  const end = evs.length ? Math.max(...evs.map(e => e.t + (e.dur || 0))) : 0;
  function tick(){
    if(held) return;
    const now = performance.now(), horizon = map.beatAt(now + 150);
    while(k < evs.length && evs[k].t <= horizon){
      const ev = evs[k++];
      if(ev.t <= sched) continue;
      const at = map.timeAt(ev.t);
      if(at < now - 120) continue;
      bandPlay(a, out, { ...ev, t:0, dur: (ev.dur || 0)*map.beatMs }, Math.max(a.currentTime, perfToCtx(a, at)), o);
    }
    sched = Math.max(sched, horizon);
    if(k >= evs.length && now > map.timeAt(end) + 300 && o.onEnd){ const f = o.onEnd; o.onEnd = null; f(); }
  }
  timer = setInterval(tick, 25);
  return {
    out, end,
    hold(v){
      held = v;
      if(v){ const t = a.currentTime; out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(0.0001, t, 0.08); }
      else{ const t = a.currentTime; out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(o.gain != null ? o.gain : 0.8, t, 0.01); tick(); }
    },
    // b vuruşundan devam (beklemeden sonra): önceki olaylar atlanır
    seek(b){ k = 0; while(k < evs.length && evs[k].t < b - 1e-6) k++; sched = b - 1e-6; },
    held: () => held,
    stop(){ clearInterval(timer); const t = a.currentTime; out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(0, t, 0.03); setTimeout(() => out.disconnect(), 400); }
  };
}
