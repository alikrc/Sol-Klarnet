// Eşlik grubu: darbuka, bas ve ud (Web Audio ile sentez). Her usul için bir çalış kalıbı vardır; Trakya ve Roman usullerinin
// kalıpları elle yazıldı, diğerleri usulün düm-tek vuruşlarından üretilir. Bas ve ud makamın durak perdesinde (isteğe göre
// güçlüye geçerek) çalar. Eşlik sekmesi (serbest çalma, doğaçlama değerlendirmesi) bu dosyada; nota arşivi ve
// "Etüt ve eserler" aynı olayları kendi zaman çizgilerine kurar.
// Kalıp ve olay mantığı tarayıcıda ve Node'da çalışır (require("./band.js")); ses kısmı yalnızca tarayıcıda.

const BLEARN = typeof module !== "undefined" ? require("./learn.js") : { USULS, makamById, MAKAMS, usulSlots };

// ---- Kalıplar ----
// Hücre: usul biriminin yarısı ya da çeyreği (x/8 usullerde on altılık; x/4 usullerde kalıp uzunluğuna göre sekizlik ya da on altılık). drum: D düm, T tek, k hafif tek (ka), . boş;
// bass: 1 kök, 5 kökün beşlisi (dizideki en yakın perde), 8 kökün oktavı, . boş (önceki nota sürer);
// chord: x ud vuruşu (kök + beşli), . boş. Üç dizinin uzunluğu aynı ve usul biriminin 2 ya da 4 katı olmalı.
const BAND_STYLES = {
  kasap:      { drum:"D.kTD.Tk",                 bass:"1...5...",              chord:"..x...x." },
  ciftetelli: { drum:"D.T.k.T.D.D.T.k.",         bass:"1.......5.1.....",      chord:"..x...x.....x..." },
  karsilama:  { drum:"D.k.T.k.D.k.T.k.k.",       bass:"1.......5.........",    chord:"....x.......x....." },
  roman:      { drum:"D.k.T.k.T.k.D.T.k.",       bass:"1...........5.....",    chord:"....x...x.....x..." },
  rumeli:     { drum:"D.k.T.k.T.k.k.",           bass:"1.......5.....",        chord:"....x...x....." },
  sofyan:     { drum:"D...k.T.T...k.k.",         bass:"1.......5.......",      chord:"....x...x...x..." },
  semai:      { drum:"D...T.k.T.k.",             bass:"1.......5...",          chord:"....x...x..." },
  aksak:      { drum:"D.k.T.T.D.k.T.k.k.",       bass:"1.......5.........",    chord:"....x.x.....x....." },
  duyek:      { drum:"T.D...T.D...T.k.",         bass:"..1.....5.......",      chord:"x.....x.....x..." }
};
// Ölçü vuruş grupları (usulü bilinmeyen eserler için; nota arşivindeki ARCH_GROUPS ile aynı)
const BAND_GROUPS = { "2/4":[1,1], "3/4":[1,1,1], "4/4":[2,1,1], "3/8":[1,1,1], "5/8":[2,3], "6/8":[3,3], "6/4":[3,3], "7/8":[3,2,2],
  "8/8":[3,3,2], "9/8":[2,2,2,3], "10/8":[3,2,2,3], "12/8":[3,3,3,3], "5/4":[2,3], "7/4":[3,2,2], "9/4":[2,2,2,3], "8/4":[2,2,2,2] };
function meterStrokes(num, den){
  const g = BAND_GROUPS[num + "/" + den] || Array(num).fill(1);
  return g.map((v, i) => [i === 0 ? "D" : "T", v]);
}
// Düm-tek vuruşlarından kalıp: düm → düm + bas (ilki kök, sonrakiler beşli), tek → tek + ud; uzun vuruşların ortasına ka
function stylesFromStrokes(strokes){
  let drum = "", bass = "", chord = "", d = 0;
  for(const [k, u] of strokes){
    const n = u*2;
    drum += k + (n > 2 ? ".k".padEnd(n - 1, ".").slice(0, n - 1) : ".".repeat(n - 1));
    bass += (k === "D" ? (d++ ? "5" : "1") : ".") + ".".repeat(n - 1);
    chord += (k === "T" ? "x" : ".") + ".".repeat(n - 1);
  }
  return { drum, bass, chord };
}
// Usul kimliği ve (bilinmiyorsa) ölçüden kalıp: { drum, bass, chord, cells, res (birim başına hücre) } — strokes verilirse
// onunla; ölçüsü uymayan elle yazılmış kalıp kullanılmaz
function bandStyle(usulId, strokes){
  const u = usulId ? BLEARN.USULS.find(x => x.id === usulId) : null;
  const st = strokes || (u ? u.strokes : [["D",1],["T",1],["T",1],["T",1]]);
  const units = st.reduce((a, s) => a + s[1], 0), hand = usulId && BAND_STYLES[usulId];
  const res = hand ? hand.drum.length/units : 0;
  if(hand && (res === 2 || res === 4)) return { ...hand, cells: hand.drum.length, res };
  const g = stylesFromStrokes(st);
  return { ...g, cells: g.drum.length, res: 2 };
}

// Kökün beşlisi: makam dizisinde kök + 31 komaya en yakın perde (3 komadan uzaksa tam beşli)
function fifthOf(mk, root){
  if(!mk) return root + 31;
  const want = root + 31, sc = [...new Set([...mk.asc, ...mk.desc])];
  let best = want, bd = 4;
  for(const c of sc) for(const o of [-106, -53, 0, 53, 106]){ const d = Math.abs(c + o - want); if(d < bd){ bd = d; best = c + o; } }
  return best;
}
// Akor ilerleyişi: dört ölçülük döngüde üçüncü ölçü güçlüde (prog kapalıysa hep durak). Kısa ölçülerde (en çok 2 birim) döngü sekiz ölçü.
function bandRoot(mk, bar, units, prog){
  if(!mk) return 0;
  if(!prog) return mk.durak;
  const cyc = units <= 2 ? ["d","d","d","g","d","d","g","d"] : ["d","d","g","d"];
  return cyc[((bar % cyc.length) + cyc.length) % cyc.length] === "g" ? mk.guclu : mk.durak;
}
// Bir ölçünün olayları: [{ t (ms, ölçü başından), part: "drum"|"bass"|"chord", k (D/T/k), c (koma), c2 (beşli), dur (ms) }]
// unitMs: usul biriminin süresi. parts: { drum, bass, chord } (varsayılan hepsi açık)
function bandBarEvents(style, unitMs, root, fifth, parts = {}){
  const cellMs = unitMs/(style.res || 2), out = [], on = p => parts[p] !== false;
  const n = style.cells;
  for(let i=0;i<n;i++){
    const t = i*cellMs, dc = style.drum[i], bc = style.bass[i], cc = style.chord[i];
    if(on("drum") && dc && dc !== ".") out.push({ t, part:"drum", k: dc });
    if(on("bass") && bc && bc !== "."){
      let j = i + 1; while(j < n && style.bass[j] === ".") j++;
      const c = bc === "5" ? fifth : bc === "8" ? root + 53 : root;
      out.push({ t, part:"bass", c, dur: (j - i)*cellMs });
    }
    if(on("chord") && cc === "x") out.push({ t, part:"chord", c: root, c2: fifth, dur: Math.min(700, cellMs*3) });
  }
  return out;
}
// Tempo önerisi (usul birimi/dk): oyun havalarında yaygın hız, öğrenmek için biraz yavaş
const BAND_TEMPO = { kasap:112, ciftetelli:176, karsilama:208, roman:216, rumeli:224, sofyan:96, semai:132, aksak:200, duyek:160, curcuna:200, agiraksak:110 };

if(typeof module !== "undefined") module.exports = { BAND_STYLES, BAND_GROUPS, BAND_TEMPO, meterStrokes, stylesFromStrokes, bandStyle, fifthOf, bandRoot, bandBarEvents, bandEventsFor };

// ======== Ses (yalnızca tarayıcı) ========
// Ses düğümleri: darbuka düm (perde bulucunun alt sınırının altında, nota sanılmaz), tek ve ka (süzülmüş gürültü),
// bas (mikrofon güvenliyse yalnızca sinüs ve perde bulucunun altında), ud (Karplus-Strong telli ses).
const BAND_PLUCK = new Map();
function bandPluckBuffer(a, f){
  // Gecikme hattı tam sayı örnek; doğru perde playbackRate ile verilir
  const N = Math.max(8, Math.round(a.sampleRate/f)), key = a.sampleRate + ":" + N;
  if(BAND_PLUCK.has(key)) return { buf: BAND_PLUCK.get(key), rate: f*N/a.sampleRate };
  const n = Math.round(a.sampleRate*1.3), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  const line = new Float32Array(N);
  for(let i=0;i<N;i++) line[i] = Math.random()*2 - 1;
  let p = 0;
  for(let i=0;i<n;i++){
    const q = (p + 1) % N, v = (line[p] + line[q])*0.5*0.997;
    d[i] = line[p]; line[p] = v; p = q;
  }
  BAND_PLUCK.set(key, buf);
  return { buf, rate: f*N/a.sampleRate };
}
let BAND_NOISE = null;
function bandNoise(a){
  if(BAND_NOISE && BAND_NOISE.sampleRate === a.sampleRate) return BAND_NOISE;
  const n = Math.round(a.sampleRate*0.2), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for(let i=0;i<n;i++) d[i] = Math.random()*2 - 1;
  return (BAND_NOISE = b);
}
// Tek olayı çalar. at: ses saati (sn). o: { freq(c) → Hz (duyulan), micSafe, minHz (perde bulucunun alt sınırı), vol: { drum, bass, chord } }
function bandPlay(a, dest, ev, at, o){
  const vol = (o.vol && o.vol[ev.part] != null ? o.vol[ev.part] : 1);
  if(vol <= 0) return;
  const g = a.createGain(); g.connect(dest);
  if(ev.part === "drum"){
    if(ev.k === "D"){
      const os = a.createOscillator();
      os.frequency.setValueAtTime(92, at); os.frequency.exponentialRampToValueAtTime(52, at + 0.12);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.85*vol, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.42);
      os.connect(g); os.start(at); os.stop(at + 0.45);
    }else{
      const src = a.createBufferSource(), f = a.createBiquadFilter(), soft = ev.k === "k";
      src.buffer = bandNoise(a);
      f.type = "bandpass"; f.frequency.value = soft ? 2600 : 3800; f.Q.value = 1.4;
      g.gain.setValueAtTime((soft ? 0.28 : 0.55)*vol, at); g.gain.exponentialRampToValueAtTime(0.001, at + (soft ? 0.05 : 0.08));
      src.connect(f).connect(g); src.start(at); src.stop(at + 0.1);
    }
    return;
  }
  if(ev.part === "bass"){
    // Kök iki oktav pese: mikrofon güvenli modda perde bulucunun altına (yalnızca sinüs, harmoniksiz) iner
    let f = o.freq(ev.c);
    const top = o.micSafe ? (o.minHz || 100)*0.92 : 130;
    while(f >= top) f /= 2;
    const os = a.createOscillator(), dur = Math.max(0.12, ev.dur/1000*0.92);
    os.type = o.micSafe ? "sine" : "triangle"; os.frequency.value = f;
    let out = os;
    if(!o.micSafe){ const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420; os.connect(lp); out = lp; }
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.5*vol, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.28*vol, at + 0.18);
    g.gain.setValueAtTime(0.28*vol, at + Math.max(0.19, dur - 0.06));
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    out.connect(g); os.start(at); os.stop(at + dur + 0.02);
    return;
  }
  if(ev.part === "chord"){
    // Ud vuruşu: kök ve beşli, kök duyulan 130–260 Hz aralığında; telleri 12 ms arayla
    let f = o.freq(ev.c);
    while(f >= 260) f /= 2; while(f < 130) f *= 2;
    const f2 = f*Math.pow(2, (ev.c2 - ev.c)/53);
    [f, f2, f*2].forEach((fr, i) => {
      const { buf, rate } = bandPluckBuffer(a, fr), src = a.createBufferSource(), gg = a.createGain();
      src.buffer = buf; src.playbackRate.value = rate;
      const t = at + i*0.012, dur = Math.max(0.15, ev.dur/1000);
      gg.gain.setValueAtTime((i === 2 ? 0.12 : 0.2)*vol, t); gg.gain.setValueAtTime((i === 2 ? 0.12 : 0.2)*vol, t + dur*0.8);
      gg.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(gg).connect(g); src.start(t); src.stop(t + dur + 0.02);
    });
    g.gain.value = 1;
  }
}
// Çalan ud ve bas perdelerinin duyulan frekansları (mikrofon bunları nota saymasın)
function bandChordFreqs(o, root, fifth){
  let f = o.freq(root); while(f >= 260) f /= 2; while(f < 130) f *= 2;
  return [f, f*Math.pow(2, (fifth - root)/53)];
}

// ======== Eşlik sekmesi ========
// Usul, makam ve tempo seçilir; darbuka, bas ve ud döngü hâlinde çalar. Mikrofon açıksa "Değerlendir" doğaçlamayı
// ölçer: perdelerde süre ve seyir (skills.js seyirAnalysis), nota başlarının usulün hücrelerine oturması.
if(typeof TRAINERS !== "undefined") TRAINERS.band = function(ctx){
  const { SK, $, store, esc, num } = ctx;
  const P = $("pp-band");
  const halk = BLEARN.USULS.filter(u => u.halk), klasik = BLEARN.USULS.filter(u => !u.halk);
  const uopt = u => `<option value="${u.id}">${u.name} ${u.meter}</option>`;
  P.innerHTML = `
    <p class="pdesc">${L("Darbuka, bas ve udla birlikte çal. Usulü ve makamı seç, Başlat'a bas: grup döngü hâlinde çalar, sen üstüne ezgiyi, etüdü ya da doğaçlamanı çalarsın. Mikrofon açıkken “Değerlendir” seçiliyse bitince perdelerde ne kadar durduğun, seyrin ve usule ne kadar oturduğun gösterilir.",
      "Play with darbuka, bass and oud. Pick the usul and the makam and press Start: the band loops and you play the tune, an étude or your own improvisation on top. With the mic on and “Assess” ticked you see afterwards where you dwelt, your seyir and how well you sat in the usul.")}</p>
    <div class="pbar">
      <label class="arsel">Usul <select id="bdusul" aria-label="Usul"><optgroup label="${L("Oyun havaları", "Dance tunes")}">${halk.map(uopt).join("")}</optgroup>
        <optgroup label="${L("Klasik usuller", "Classical usuls")}">${klasik.map(uopt).join("")}</optgroup></select></label>
      <label class="arsel">Makam <select id="bdmk" aria-label="Makam">${BLEARN.MAKAMS.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}</select></label>
      <label class="tnum">Tempo <input id="bdtempo" type="number" min="40" max="320" step="4" aria-label="Tempo"> <em id="bdunit"></em></label>
    </div>
    <div class="pbar">
      <label class="chk"><input type="checkbox" id="bddrum"> darbuka</label>
      <label class="chk"><input type="checkbox" id="bdbass"> ${L("bas", "bass")}</label>
      <label class="chk"><input type="checkbox" id="bdchord"> ud</label>
      <label class="chk"><input type="checkbox" id="bdprog"> ${L("akor değişsin (durak ↔ güçlü)", "chord changes (tonic ↔ dominant)")}</label>
      <label class="chk"><input type="checkbox" id="bdeval"> ${L("değerlendir (mikrofon)", "assess (mic)")}</label>
      <label class="tnum">${L("Ses", "Volume")} <input id="bdvol" type="range" min="1" max="10" value="7" aria-label="${L("Eşlik ses düzeyi", "Band volume")}"></label>
    </div>
    <div class="pbar"><button class="primary small" id="bdgo" type="button">${L("Başlat", "Start")}</button>
      <button class="stopbtn" id="bdpiece" type="button">${L("Bu usulde etüt çal", "Play an étude in this usul")}</button></div>
    <div class="slots bdslots" id="bdslots" aria-hidden="true"></div>
    <div class="muted" id="bdinfo"></div>
    <div class="stage" id="bdstage"><div class="muted">${L("Kulaklık kullanırsan ya da Ayarlar'da Hoparlör modunu açarsan mikrofon grubu değil seni duyar.", "Use headphones or turn on Speaker mode in Settings so the mic hears you, not the band.")}</div></div>`;
  const usul = () => BLEARN.USULS.find(u => u.id === $("bdusul").value) || BLEARN.USULS[0];
  const mk = () => BLEARN.makamById($("bdmk").value) || BLEARN.MAKAMS[0];
  $("bdusul").value = store.get("band.usul", "roman");
  $("bdmk").value = store.get("band.mk", "hicaz");
  const tempoFor = id => (store.get("band.tempos", {})[id]) || BAND_TEMPO[id] || 120;
  const setUnit = () => { const den = usul().meter.split("/")[1]; $("bdunit").textContent = den === "8" ? L("sekizlik/dk", "eighths/min") : L("dörtlük/dk", "quarters/min"); };
  $("bdtempo").value = tempoFor($("bdusul").value); setUnit();
  const parts = store.get("band.parts", { drum:true, bass:true, chord:true });
  $("bddrum").checked = parts.drum; $("bdbass").checked = parts.bass; $("bdchord").checked = parts.chord;
  $("bdprog").checked = store.get("band.prog", true);
  $("bdeval").checked = store.get("band.eval", true);
  $("bdvol").value = store.get("band.vol", 7);
  function info(){
    const m = mk(), u = usul();
    $("bdinfo").textContent = u.name + " " + u.meter + " · " + m.name + " · " + L("durak ", "final ") + perdeName(m.durak) + " · " + L("güçlü ", "dominant ") + perdeName(m.guclu);
    const st = bandStyle(u.id);
    $("bdslots").innerHTML = BLEARN.usulSlots(u).map(s => `<i class="${s === "D" ? "dum" : s === "T" ? "tek" : "rest"}">${s === "D" ? "Düm" : s === "T" ? "Tek" : "·"}</i>`).join("");
    return st;
  }
  const saveParts = () => store.set("band.parts", { drum: $("bddrum").checked, bass: $("bdbass").checked, chord: $("bdchord").checked });
  ["bddrum","bdbass","bdchord"].forEach(id => $(id).addEventListener("change", () => { saveParts(); if(run) restart(); }));
  $("bdprog").addEventListener("change", () => store.set("band.prog", $("bdprog").checked));
  $("bdeval").addEventListener("change", () => store.set("band.eval", $("bdeval").checked));
  $("bdvol").addEventListener("input", () => { store.set("band.vol", +$("bdvol").value); if(run) run.out.gain.setTargetAtTime(+$("bdvol").value/10, SK.audioCtx().currentTime, 0.05); });
  $("bdusul").addEventListener("change", () => { store.set("band.usul", $("bdusul").value); $("bdtempo").value = tempoFor($("bdusul").value); setUnit(); info(); if(run) restart(); });
  $("bdmk").addEventListener("change", () => { store.set("band.mk", $("bdmk").value); info(); SK.setTempContext(mk().id); if(run) restart(); });
  $("bdtempo").addEventListener("change", () => {
    const v = Math.max(40, Math.min(320, Math.round(+$("bdtempo").value) || 120)); $("bdtempo").value = v;
    const all = store.get("band.tempos", {}); all[usul().id] = v; store.set("band.tempos", all);
    if(run) run.unitMs = 60000/v;
  });
  $("bdpiece").addEventListener("click", () => {
    const e = ETUDES.find(x => x.usul === usul().id);
    if(e){ store.set("piece.sel", e.id); store.set("piece.band", true); }
    ctx.selectTab("piece");
  });

  let run = null;
  function opts(){ return { freq: c => ctx.mkFreq(mk(), c), micSafe: false, minHz: SK.pitchRange().min, vol:{ drum:1, bass:1, chord:1 } }; }
  function start(){
    const a = SK.audioCtx(), u = usul(), m = mk(), st = info();
    const out = a.createGain(); out.gain.value = +$("bdvol").value/10; out.connect(a.destination);
    const parts = { drum: $("bddrum").checked, bass: $("bdbass").checked, chord: $("bdchord").checked };
    const r = { out, res: st.res, bar: 0, next: a.currentTime + 0.15, unitMs: 60000/(+$("bdtempo").value || 120), frames: [], onsets: [], grid: [], t0: performance.now() };
    const o = opts(), det = new OnsetDetector();
    r.off = SK.level(f => { const x = det.push(f); if(x !== null) r.onsets.push(x); });
    r.timer = setInterval(() => {
      while(r.next < a.currentTime + 0.3){
        const root = bandRoot(m, r.bar, st.cells/st.res, $("bdprog").checked), fifth = fifthOf(m, root);
        const at = r.next, unitS = r.unitMs/1000;
        for(const ev of bandBarEvents(st, r.unitMs, root, fifth, parts)) bandPlay(a, out, ev, at + ev.t/1000, o);
        // Hücre zamanları (performance.now() çizgisinde) değerlendirme için
        const p0 = ctxToPerf(a, at);
        for(let i=0;i<st.cells;i++) r.grid.push(p0 + i*r.unitMs/st.res);
        const k = r.bar;
        setTimeout(() => { if(run === r){ ctx.setBandFreqs(parts.chord ? bandChordFreqs(o, root, fifth) : []); paintSlot(-1, k); } }, Math.max(0, (at - a.currentTime)*1000));
        BLEARN.usulSlots(u).forEach((s, i) => setTimeout(() => { if(run === r) paintSlot(i, k); }, Math.max(0, (at + i*unitS - a.currentTime)*1000)));
        r.next += st.cells/st.res*unitS; r.bar++;
      }
    }, 40);
    run = r;
    $("bdgo").textContent = L("Durdur", "Stop");
    $("bdstage").innerHTML = `<div class="ltclock" id="bdclock">0 <em>${L("ölçü", "bars")}</em></div><div class="muted">${L("Çal! Durdurunca sonuç görünür.", "Play! The result appears when you stop.")}</div>`;
  }
  function paintSlot(i, bar){
    const els = $("bdslots").children;
    for(let k=0;k<els.length;k++) els[k].classList.toggle("now", k === i);
    const c = $("bdclock"); if(c) c.innerHTML = (bar + 1) + ` <em>${L("ölçü", "bars")}</em>`;
  }
  function stop(show = true){
    const r = run; if(!r) return;
    run = null; clearInterval(r.timer); r.off();
    const a = SK.audioCtx();
    r.out.gain.setTargetAtTime(0, a.currentTime, 0.03); setTimeout(() => r.out.disconnect(), 400);
    ctx.setBandFreqs([]);
    $("bdgo").textContent = L("Başlat", "Start");
    paintSlot(-1, r.bar - 1);
    if(show) result(r);
  }
  function restart(){ stop(false); start(); }
  function result(r){
    const stage = $("bdstage");
    if(!$("bdeval").checked || !SK.isListening()){ stage.innerHTML = `<div class="muted">${r.bar} ${L("ölçü çalındı.", "bars played.")}</div>`; return; }
    const notes = segmentNotes(r.frames, 150), m = mk(), res = notes.length >= 4 ? seyirAnalysis(notes, m) : null;
    // Usule oturma: nota başlarının en yakın hücreye uzaklığı (gecikme düzeltmesiyle)
    const lat = store.get("rhythm.lat", 0), cellMs = r.unitMs/r.res;
    const devs = r.onsets.map(o => o - lat).map(o => { let bd = Infinity; for(const g of r.grid){ const d = o - g; if(Math.abs(d) < Math.abs(bd)) bd = d; } return bd; }).filter(d => Math.abs(d) <= cellMs/2);
    const onGrid = devs.length ? Math.round(devs.filter(d => Math.abs(d) <= Math.min(60, cellMs*0.3)).length/devs.length*100) : null;
    if(!res && onGrid === null){ stage.innerHTML = `<div class="muted">${L("Yeterince nota duyulmadı; mikrofon açık mı?", "Not enough notes heard; is the mic on?")}</div>`; return; }
    const hist = store.get("band.hist", []); hist.push({ d: dayKey(new Date()), u: usul().id, mk: m.id, bars: r.bar, seyir: res ? res.score : null, grid: onGrid }); store.set("band.hist", hist.slice(-100));
    const perdes = res ? Object.entries(res.time).sort((x, y) => +x[0] - +y[0]) : [], max = Math.max(1, ...perdes.map(([, v]) => v));
    stage.innerHTML = `<div class="kv">
        <div><span class="label">${L("Usule oturma", "In the groove")}</span><span class="big2">${onGrid === null ? "—" : "%" + onGrid}</span></div>
        <div><span class="label">Seyir</span><span class="big2">${res ? res.score : "—"}</span></div>
        <div><span class="label">${L("Ölçü", "Bars")}</span><span class="big2">${r.bar}</span></div></div>
      ${onGrid !== null ? `<p class="muted">${onGrid >= 75 ? L("Nota başların usulün vuruşlarına oturuyor.", "Your note starts sit on the usul's strokes.") : L("Nota başlarının bir kısmı vuruşların arasında kaldı; tempoyu düşürüp darbukanın düm ve teklerine yaslan.", "Some of your note starts fell between the strokes; lower the tempo and lean on the darbuka's düm and tek.")}</p>` : ""}
      ${res ? `<ul class="lstips">${seyirFeedback(res, m, LANG).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="bars sybars">${perdes.map(([p, v]) => `<div class="barcol" title="${perdeName(+p)}: ${num(v/1000)} s"><i style="height:${Math.round(v/max*100)}%" class="${(+p - m.durak) % 53 === 0 ? "durak" : (+p - m.guclu) % 53 === 0 ? "guclu" : ""}"></i><small>${perdeName(+p)}</small></div>`).join("")}</div>` : ""}`;
  }
  $("bdgo").addEventListener("click", async () => {
    if(run){ stop(); return; }
    if($("bdeval").checked) await ctx.needMic();
    start();
  });
  SK.on("note", d => { if(run) run.frames.push({ t:d.t, written:d.r.written, comma:d.r.comma }); });
  SK.on("silence", d => { if(run) run.frames.push({ t:d.t, written:null }); });
  document.addEventListener("visibilitychange", () => { if(document.hidden && run) stop(false); });
  info();
  return { enter(){ SK.setTempContext(mk().id); info(); }, leave(){ if(run) stop(false); SK.setTempContext(null); } };
};

// ---- Eser çalarlar için: bir ölçü dizisinin eşlik olayları ----
// bars: [{ startMs (çalışın başından), unitMs, usul (kimlik ya da null), strokes (isteğe bağlı) }]; mk: makam (null → kök 0);
// karar: kök (koma; verilmezse makamın durağı). Dönen olaylar zamana göre sıralı, t ms.
function bandEventsFor(bars, mk, karar, parts, prog = false){
  const out = [];
  bars.forEach((b, i) => {
    const st = bandStyle(b.usul, b.strokes);
    const root = karar != null && !prog ? karar : bandRoot(mk, i, st.cells/st.res, prog);
    for(const ev of bandBarEvents(st, b.unitMs, root, fifthOf(mk, root), parts)) out.push({ ...ev, t: b.startMs + ev.t });
  });
  return out.sort((x, y) => x.t - y.t);
}
