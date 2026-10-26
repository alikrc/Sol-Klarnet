// Kulaktan çıkar: bir usta kaydını (ses ya da video dosyası) perdesini bozmadan yavaşlatıp bölüm bölüm döngüye almak.
// Zaman uzatma WSOLA ile (dalga biçimi benzerliğiyle örtüşen pencereler), perde kaydırma uzatma + yeniden örnekleme ile.
// Dosyanın perde izi (core.js detectPitch) çalma çizgisinin altında perde adlarıyla görünür; seçili bölge Çevir'e
// gönderilip notaya dökülebilir. Saf ses işleme Node'da da çalışır (require("./transcribe.js")).

// ---- WSOLA ----
// x: tek kanal; speed: 0,25–1,5 (0,5 = yarı hız, çıkış iki kat uzun). Pencere ≈ 46 ms, örtüşme %50; her yeni pencere,
// önceki pencerenin doğal devamına en çok benzeyen yerden (±12 ms içinde) alınır. Benzerlik 4'te bir örnekle kabaca
// aranıp tam örnekle ±4 inceltilir. Üreteç: her 400 pencerede ilerlemeyi (0–1) verir, sonunda çıkışı döndürür.
function* wsolaGen(x, speed, sr){
  const N = 1 << Math.round(Math.log2(sr*0.046)), Ha = N >> 1, Hs = Ha*speed;
  const delta = Math.round(sr*0.012), D = 4, cl = N >> 1;
  const win = new Float32Array(N);
  for(let i=0;i<N;i++) win[i] = 0.5 - 0.5*Math.cos(2*Math.PI*i/N);
  const frames = Math.max(1, Math.ceil((x.length - N)/Hs) + 1), outLen = (frames - 1)*Ha + N;
  const y = new Float32Array(outLen), w = new Float32Array(outLen);
  const at = i => i >= 0 && i < x.length ? x[i] : 0;
  const corr = (a, b, len, step) => {
    let s = 0;
    if(a >= 0 && b >= 0 && a + len <= x.length && b + len <= x.length){ for(let i=0;i<len;i+=step) s += x[a + i]*x[b + i]; return s; }
    for(let i=0;i<len;i+=step) s += at(a + i)*at(b + i);
    return s;
  };
  let prev = 0;
  for(let k=0;k<frames;k++){
    const ideal = Math.round(k*Hs);
    let best = ideal;
    if(k > 0){
      const nat = prev + Ha;                       // önceki pencerenin doğal devamı
      let bc = -Infinity;
      for(let d=-delta; d<=delta; d+=D){ const c = corr(ideal + d, nat, cl, D); if(c > bc){ bc = c; best = ideal + d; } }
      const coarse = best; bc = -Infinity;
      for(let d=-D; d<=D; d++){ const c = corr(coarse + d, nat, cl, 1); if(c > bc){ bc = c; best = coarse + d; } }
    }
    const o = k*Ha;
    for(let i=0;i<N;i++){ y[o + i] += at(best + i)*win[i]; w[o + i] += win[i]; }
    prev = best;
    if(k % 400 === 399) yield k/frames;
  }
  for(let i=0;i<outLen;i++) if(w[i] > 1e-3) y[i] /= w[i];
  // Uzunluk tam x.length / speed olsun
  return y.subarray(0, Math.min(outLen, Math.round(x.length/speed)));
}
function wsola(x, speed, sr){
  const g = wsolaGen(x, speed, sr);
  let r = g.next(); while(!r.done) r = g.next();
  return r.value;
}
// Doğrusal yeniden örnekleme: ratio > 1 kısaltır (perde ratio kadar tizleşir)
function resampleLinear(x, ratio){
  const n = Math.max(1, Math.floor(x.length/ratio)), y = new Float32Array(n);
  for(let i=0;i<n;i++){ const p = i*ratio, j = Math.floor(p), f = p - j; y[i] = (x[j] || 0)*(1 - f) + (x[j + 1] || 0)*f; }
  return y;
}
// Hız ve perde birlikte: önce speed/p ile uzat, sonra p ile yeniden örnekle (p = 2^(sent/1200)). Üreteç (ilerleme 0–1).
function* stretchShiftGen(x, sr, speed, cents){
  const p = Math.pow(2, cents/1200);
  if(Math.abs(speed - 1) < 1e-6 && Math.abs(cents) < 0.5) return x.slice();
  const st = yield* wsolaGen(x, speed/p, sr);
  return Math.abs(p - 1) < 1e-6 ? st : resampleLinear(st, p);
}
// Perde izi: hop ms'de bir detectPitch; dönen [{ t (sn), comma (Rast'a göre, yazılı) | null, rms }]
function* pitchTraceGen(x, sr, opts = {}){
  const T = opts.T == null ? 5 : opts.T, hop = Math.round(sr*(opts.hopMs || 20)/1000), win = 2048;
  const det = typeof detectPitch === "function" ? detectPitch : require("./core.js").detectPitch;
  const f2m = typeof freqToMidi === "function" ? freqToMidi : require("./core.js").freqToMidi;
  const out = [];
  for(let s=0, k=0; s + win <= x.length; s += hop, k++){
    const d = det(x.subarray(s, s + win), sr, opts.minHz || 90, opts.maxHz || 2100, opts.minRms || 0.006);
    out.push({ t: (s + win/2)/sr, comma: d.freq > 0 && d.clarity > 0.8 ? (f2m(d.freq) + T - 67)*53/12 : null, rms: d.rms });
    if(k % 500 === 499) yield s/x.length;
  }
  return out;
}
const runGen = g => { let r = g.next(); while(!r.done) r = g.next(); return r.value; };

if(typeof module !== "undefined") module.exports = { wsolaGen, wsola, resampleLinear, stretchShiftGen, pitchTraceGen, runGen };

// ======== Sekme ========
if(typeof TRAINERS !== "undefined") TRAINERS.kulaktan = function(ctx){
  const { SK, $, store, esc, num } = ctx;
  const P = $("pp-kulaktan");
  P.innerHTML = `
    <p class="pdesc">${L("Ustaların kayıtlarından kulakla öğren. Ses ya da video dosyasını aç; zor yeri seç, perdesini bozmadan yavaşlat ve döngüye al. Çalan yerin perdesi altta yazar; seçili bölgeyi notaya da dökebilirsin. Dosya cihazından çıkmaz.",
      "Learn by ear from masters' recordings. Open an audio or video file; select a hard passage, slow it down without changing the pitch and loop it. The perde being played is shown below; you can also turn the selection into notes. The file never leaves your device.")}</p>
    <div class="pbar"><button class="primary small" id="kfopen" type="button">${L("Ses / video dosyası aç", "Open an audio / video file")}</button>
      <input type="file" id="kffile" accept="audio/*,video/*,.mp3,.m4a,.aac,.wav,.ogg,.opus,.flac,.mp4,.webm" hidden>
      <span class="muted" id="kfname"></span></div>
    <div class="kfwrap" id="kfwrap" hidden>
      <canvas class="kfwave" id="kfwave" height="96" aria-label="${L("Dalga biçimi: dokun, konum seç; sürükle, bölge seç", "Waveform: tap to seek, drag to select")}"></canvas>
      <canvas class="kfpitch" id="kfpitch" height="120" aria-hidden="true"></canvas>
      <div class="kfnow"><span id="kftime">0:00</span><b id="kfperde">—</b><span class="muted" id="kfsel"></span></div>
      <div class="pbar">
        <button class="primary small" id="kfplay" type="button">${L("▶ Çal", "▶ Play")}</button>
        <button class="stopbtn" id="kfback" type="button" aria-label="${L("2 saniye geri", "Back 2 seconds")}">−2 sn</button>
        <button class="stopbtn" id="kffwd" type="button" aria-label="${L("2 saniye ileri", "Forward 2 seconds")}">+2 sn</button>
        <button class="stopbtn" id="kfa" type="button">A</button><button class="stopbtn" id="kfb" type="button">B</button>
        <label class="chk"><input type="checkbox" id="kfloop"> ${L("döngü", "loop")}</label>
        <button class="linkbtn" id="kfclear" type="button">${L("seçimi kaldır", "clear selection")}</button>
      </div>
      <div class="pbar">
        <label class="tnum">${L("Hız", "Speed")} <input id="kfspeed" type="range" min="25" max="125" step="5" value="100" aria-label="${L("Hız yüzdesi", "Speed percent")}"> <em id="kfspeedv">%100</em></label>
        <label class="arsel">${L("Perde", "Pitch")} <select id="kfsemi" aria-label="${L("Yarım ses kaydır", "Shift in semitones")}">${Array.from({ length:25 }, (_, i) => i - 12).map(v => `<option value="${v}">${v === 0 ? L("asıl", "original") : (v > 0 ? "+" : "−") + Math.abs(v) + L(" yarım ses", " semitones")}</option>`).join("")}</select></label>
        <label class="arsel">${L("İnce ayar", "Fine")} <select id="kfkoma" aria-label="${L("Koma kaydır", "Shift in commas")}">${Array.from({ length:9 }, (_, i) => i - 4).map(v => `<option value="${v}">${v === 0 ? "0" : (v > 0 ? "+" : "−") + Math.abs(v) + L(" koma", " commas")}</option>`).join("")}</select></label>
        <button class="linkbtn" id="kfzoom" type="button">${L("bölgeye yakınlaş", "zoom to selection")}</button>
      </div>
      <div class="pbar"><button class="stopbtn" id="kfmark" type="button">${L("İşaret koy", "Add marker")}</button><span class="kfmarks" id="kfmarks"></span></div>
      <div class="pbar"><button class="stopbtn" id="kfnota" type="button">${L("Seçili bölgeyi notaya dök", "Turn the selection into notes")}</button><span class="muted" id="kfmsg"></span></div>
    </div>
    <div class="fb" id="kfprog" aria-live="polite"></div>`;

  const F = { buf:null, mono:null, sr:44100, dur:0, name:"", key:"", trace:null, peaks:null };
  let head = 0, sel = null, view = null, play = null, rendered = null, renderTok = 0, raf = 0;
  const fmt = s => Math.floor(s/60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") + (s < 60 ? "," + Math.floor((s*10) % 10) : "");
  const prog = (t, cls = "") => { $("kfprog").className = "fb " + cls; $("kfprog").textContent = t; };
  const speed = () => +$("kfspeed").value/100;
  const cents = () => +$("kfsemi").value*100 + +$("kfkoma").value*1200/53;
  const marks = () => (store.get("kf.marks", {})[F.key] || []);
  const setMarks = m => { const all = store.get("kf.marks", {}); all[F.key] = m; store.set("kf.marks", all); drawMarks(); };

  $("kfopen").addEventListener("click", () => $("kffile").click());
  $("kffile").addEventListener("change", async () => {
    const f = $("kffile").files[0]; $("kffile").value = "";
    if(!f) return;
    if(f.size > 120*1024*1024){ prog(L("Dosya çok büyük (en çok 120 MB).", "The file is too large (120 MB at most)."), "bad"); return; }
    stopPlay(); prog(L("Dosya açılıyor…", "Opening the file…"));
    try{
      const ab = await f.arrayBuffer(), a = SK.audioCtx();
      const buf = await a.decodeAudioData(ab);
      const n = buf.length, nch = buf.numberOfChannels, mono = new Float32Array(n);
      for(let ch=0;ch<nch;ch++){ const d = buf.getChannelData(ch); for(let i=0;i<n;i++) mono[i] += d[i]/nch; }
      Object.assign(F, { buf, mono, sr: buf.sampleRate, dur: buf.duration, name: f.name, key: f.name + "|" + Math.round(buf.duration), trace:null, peaks:null });
    }catch(e){ prog(L("Dosya açılamadı. MP3, M4A, WAV ya da MP4 dene.", "Couldn't open the file. Try MP3, M4A, WAV or MP4."), "bad"); return; }
    head = 0; sel = null; view = null; rendered = null;
    $("kfname").textContent = F.name + " · " + fmt(F.dur);
    $("kfwrap").hidden = false; prog("");
    draw(); drawMarks();
    traceAll();
  });
  // Perde izi: arayüz donmasın diye parça parça
  async function traceAll(){
    const key = F.key, g = pitchTraceGen(F.mono, F.sr, { T: SK.T, minHz: Math.min(90, SK.pitchRange().min) });
    let r = g.next();
    while(!r.done){ prog(L("Perde izi çıkarılıyor… %", "Tracing the pitch… ") + Math.round(r.value*100) + (LANG === "en" ? "%" : "")); await ctx.sleep(0); if(F.key !== key) return; r = g.next(); }
    F.trace = r.value; prog(""); draw();
  }

  // ---- Çizim ----
  const V = () => view || [0, F.dur];
  function draw(){
    const cv = $("kfwave"), W = cv.width = Math.max(300, cv.clientWidth*devicePixelRatio || 600), H = cv.height = 96*devicePixelRatio;
    const g = cv.getContext("2d"), [v0, v1] = V(), css = getComputedStyle(document.body);
    const ink = css.getPropertyValue("--ink") || "#222", teal = css.getPropertyValue("--teal") || "#0a8", muted = css.getPropertyValue("--muted") || "#888";
    g.clearRect(0, 0, W, H);
    const x = t => (t - v0)/(v1 - v0)*W;
    if(sel){ g.fillStyle = teal; g.globalAlpha = 0.18; g.fillRect(x(sel[0]), 0, x(sel[1]) - x(sel[0]), H); g.globalAlpha = 1; }
    g.fillStyle = muted;
    const s0 = Math.floor(v0*F.sr), per = Math.max(1, Math.floor((v1 - v0)*F.sr/W));
    for(let px=0; px<W; px++){
      let mn = 0, mx = 0; const a = s0 + px*per;
      for(let i=a; i<a + per && i < F.mono.length; i += Math.max(1, per >> 6)){ const v = F.mono[i]; if(v < mn) mn = v; if(v > mx) mx = v; }
      g.fillRect(px, H/2 - mx*H/2, 1, Math.max(1, (mx - mn)*H/2));
    }
    g.fillStyle = ink; marks().forEach(m => g.fillRect(x(m) - 1, 0, 2, 10*devicePixelRatio));
    g.fillStyle = teal; g.fillRect(x(head) - 1, 0, 2, H);
    drawPitch(); info();
  }
  function drawPitch(){
    const cv = $("kfpitch"), W = cv.width = Math.max(300, cv.clientWidth*devicePixelRatio || 600), H = cv.height = 120*devicePixelRatio;
    const g = cv.getContext("2d"), [v0, v1] = V(), css = getComputedStyle(document.body);
    g.clearRect(0, 0, W, H);
    if(!F.trace) return;
    const sh = cents()*53/1200, pts = F.trace.filter(p => p.t >= v0 && p.t <= v1 && p.comma !== null).map(p => [p.t, p.comma + sh]);
    if(!pts.length) return;
    const cs = pts.map(p => p[1]).sort((a, b) => a - b), lo = cs[Math.floor(cs.length*0.03)] - 6, hi = cs[Math.floor(cs.length*0.97)] + 6;
    const x = t => (t - v0)/(v1 - v0)*W, y = c => H - (c - lo)/(hi - lo)*H;
    g.font = (10*devicePixelRatio) + "px sans-serif"; g.fillStyle = css.getPropertyValue("--muted") || "#888"; g.strokeStyle = css.getPropertyValue("--line") || "#ddd";
    PERDES.filter(([c]) => c >= lo && c <= hi && [0, 9, 17, 22, 31, 40, 48].includes(((c % 53) + 53) % 53)).forEach(([c, n]) => {
      g.beginPath(); g.moveTo(0, y(c)); g.lineTo(W, y(c)); g.stroke(); g.fillText(n, 3, y(c) - 2);
    });
    g.fillStyle = css.getPropertyValue("--teal") || "#0a8";
    pts.forEach(([t, c]) => g.fillRect(x(t) - 1, y(c) - 1, 2*devicePixelRatio, 2*devicePixelRatio));
    g.fillStyle = css.getPropertyValue("--ink") || "#222"; g.fillRect(x(head) - 1, 0, 2, H);
  }
  // Çalan yerin perdesi (izin o anki ortancası, kaydırmayla)
  function info(){
    $("kftime").textContent = fmt(head) + " / " + fmt(F.dur);
    $("kfsel").textContent = sel ? L("Seçim ", "Selection ") + fmt(sel[0]) + "–" + fmt(sel[1]) : "";
    let txt = "—";
    if(F.trace){
      const i = Math.min(F.trace.length - 1, Math.max(0, Math.round(head/0.02))), w = F.trace.slice(Math.max(0, i - 3), i + 4).map(p => p.comma).filter(c => c !== null).sort((a, b) => a - b);
      if(w.length >= 3){
        const c = w[Math.floor(w.length/2)] + cents()*53/1200, p = nearestPerde(c), wr = Math.round(67 + c*12/53);
        txt = (p ? p.name + " · " : "") + ctx.nn(wr) + (p ? " " + ctx.sgn(c - p.comma) + L(" koma", " commas") : "");
      }
    }
    $("kfperde").textContent = txt;
  }

  // ---- Dokunma: konum seç, sürükleyerek bölge seç ----
  let drag = null;
  const tAt = ev => { const r = $("kfwave").getBoundingClientRect(), [v0, v1] = V(); return Math.max(0, Math.min(F.dur, v0 + (ev.clientX - r.left)/r.width*(v1 - v0))); };
  $("kfwave").addEventListener("pointerdown", ev => { if(!F.mono) return; drag = { t0: tAt(ev), moved:false }; $("kfwave").setPointerCapture(ev.pointerId); });
  $("kfwave").addEventListener("pointermove", ev => {
    if(!drag) return;
    const t = tAt(ev);
    if(Math.abs(t - drag.t0) > (V()[1] - V()[0])*0.01){ drag.moved = true; sel = [Math.min(drag.t0, t), Math.max(drag.t0, t)]; draw(); }
  });
  $("kfwave").addEventListener("pointerup", ev => {
    if(!drag) return;
    const d = drag; drag = null;
    if(d.moved){ head = sel[0]; $("kfloop").checked = true; rendered = null; if(play) startPlay(); else draw(); }
    else{ head = tAt(ev); if(play) startPlay(); else draw(); }
  });
  const seek = dt => { head = Math.max(0, Math.min(F.dur, curPos() + dt)); if(play) startPlay(); else draw(); };
  $("kfback").addEventListener("click", () => seek(-2));
  $("kffwd").addEventListener("click", () => seek(2));
  $("kfa").addEventListener("click", () => { const t = curPos(); sel = [t, sel && sel[1] > t ? sel[1] : Math.min(F.dur, t + 4)]; rendered = null; draw(); });
  $("kfb").addEventListener("click", () => { const t = curPos(); sel = [sel && sel[0] < t ? sel[0] : Math.max(0, t - 4), t]; $("kfloop").checked = true; rendered = null; draw(); });
  $("kfclear").addEventListener("click", () => { sel = null; view = null; rendered = null; draw(); });
  $("kfzoom").addEventListener("click", () => { if(view){ view = null; $("kfzoom").textContent = L("bölgeye yakınlaş", "zoom to selection"); } else if(sel){ const m = (sel[1] - sel[0])*0.15; view = [Math.max(0, sel[0] - m), Math.min(F.dur, sel[1] + m)]; $("kfzoom").textContent = L("tümünü göster", "show all"); } draw(); });
  $("kfspeed").addEventListener("input", () => { $("kfspeedv").textContent = "%" + $("kfspeed").value; });
  $("kfspeed").addEventListener("change", () => { store.set("kf.speed", +$("kfspeed").value); rendered = null; if(play) startPlay(); });
  ["kfsemi", "kfkoma"].forEach(id => $(id).addEventListener("change", () => { rendered = null; draw(); if(play) startPlay(); }));
  $("kfspeed").value = store.get("kf.speed", 100); $("kfspeedv").textContent = "%" + $("kfspeed").value;
  $("kfsemi").value = "0"; $("kfkoma").value = "0";
  $("kfloop").addEventListener("change", () => { if(play) startPlay(); });

  // İşaretler: dosya başına saklanır; dokununca oraya gider, × siler
  function drawMarks(){
    $("kfmarks").innerHTML = marks().map((m, i) => `<span class="chipbtn small kfmk"><button type="button" class="linkbtn" data-go="${i}">${fmt(m)}</button><button type="button" class="linkbtn" data-del="${i}" aria-label="${L("İşareti sil", "Delete marker")}">×</button></span>`).join("");
  }
  $("kfmark").addEventListener("click", () => { const m = [...marks(), curPos()].sort((a, b) => a - b); setMarks(m); draw(); });
  $("kfmarks").addEventListener("click", e => {
    const g = e.target.closest("[data-go]"), d = e.target.closest("[data-del]"), m = marks();
    if(g){ const i = +g.dataset.go; head = m[i]; if(m[i + 1] != null) sel = [m[i], m[i + 1]]; rendered = null; if(play) startPlay(); else draw(); }
    if(d){ m.splice(+d.dataset.del, 1); setMarks(m); draw(); }
  });

  // ---- Çalma ----
  // Hız ya da perde değişmişse çalınacak parça (seçim ya da başlangıçtan 60 sn) WSOLA ile işlenir; sonuç saklanır.
  const plainPlay = () => Math.abs(speed() - 1) < 1e-6 && Math.abs(cents()) < 0.5;
  async function renderSpan(a0, a1){
    const tok = ++renderTok, x = F.mono.subarray(Math.floor(a0*F.sr), Math.ceil(a1*F.sr));
    const g = stretchShiftGen(x, F.sr, speed(), cents());
    let r = g.next();
    while(!r.done){ prog(L("Yavaşlatılıyor… %", "Slowing down… ") + Math.round(r.value*100) + (LANG === "en" ? "%" : "")); await ctx.sleep(0); if(tok !== renderTok) return null; r = g.next(); }
    prog("");
    const a = SK.audioCtx(), b = a.createBuffer(1, r.value.length, F.sr); b.copyToChannel(r.value, 0);
    return { a0, a1, speed: speed(), cents: cents(), buf: b };
  }
  // Çalan yerin dosyadaki zamanı
  function curPos(){
    if(!play) return head;
    const el = (SK.audioCtx().currentTime - play.t0)*play.rate, len = play.a1 - play.a0;
    return play.a0 + (play.loop ? el % len : Math.min(el, len));
  }
  async function startPlay(){
    stopPlay();
    const loop = $("kfloop").checked && !!sel;
    let a0 = loop ? sel[0] : head, a1 = loop ? sel[1] : F.dur;
    if(!loop && head >= F.dur - 0.05) a0 = head = 0;
    const a = SK.audioCtx(), src = a.createBufferSource(), g = a.createGain();
    let rate = 1;
    if(plainPlay()){ src.buffer = F.buf; }
    else{
      // Döngüsüz çalmada başlangıçtan en çok 60 sn işlenir
      if(!loop) a1 = Math.min(F.dur, a0 + 60);
      if(!(rendered && rendered.a0 === a0 && rendered.a1 === a1 && rendered.speed === speed() && rendered.cents === cents())){
        $("kfplay").disabled = true;
        const r = await renderSpan(a0, a1);
        $("kfplay").disabled = false;
        if(!r) return;
        rendered = r;
      }
      src.buffer = rendered.buf; rate = speed();
    }
    const startIn = plainPlay() ? a0 : 0;
    src.loop = loop;
    if(loop){ src.loopStart = plainPlay() ? sel[0] : 0; src.loopEnd = plainPlay() ? sel[1] : src.buffer.duration; }
    src.connect(g).connect(a.destination);
    const t0 = a.currentTime + 0.03;
    src.start(t0, startIn, loop ? undefined : (plainPlay() ? F.dur - startIn : src.buffer.duration));
    play = { src, g, t0, a0, a1, loop, rate };
    ctx.setPlaybackMute(true);
    src.onended = () => { if(play && play.src === src){ head = loop ? sel[0] : a1; stopPlay(); draw(); } };
    $("kfplay").textContent = L("■ Durdur", "■ Stop");
    const tick = () => { if(!play) return; head = curPos(); draw(); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  function stopPlay(){
    if(play){ const p = play; play = null; try{ p.src.onended = null; p.src.stop(); }catch(e){} p.src.disconnect(); }
    cancelAnimationFrame(raf);
    ctx.setPlaybackMute(false);
    $("kfplay").textContent = L("▶ Çal", "▶ Play");
  }
  $("kfplay").addEventListener("click", () => { if(!F.mono) return; if(play){ head = curPos(); stopPlay(); draw(); } else startPlay(); });
  document.addEventListener("keydown", ev => {
    if(P.hidden || document.body.dataset.view !== "practice" || !F.mono || ev.target.closest("input, select, textarea, button")) return;
    if(ev.key === " "){ ev.preventDefault(); $("kfplay").click(); }
    else if(ev.key === "ArrowLeft"){ ev.preventDefault(); seek(-2); }
    else if(ev.key === "ArrowRight"){ ev.preventDefault(); seek(2); }
  });
  window.addEventListener("resize", () => { if(F.mono && !P.hidden) draw(); });

  // Seçili bölge → Çevir (notaya dökme ve düzeltme ekranı); en çok 3 dakika
  $("kfnota").addEventListener("click", async () => {
    if(!F.mono) return;
    const s = sel || [head, Math.min(F.dur, head + 30)], len = Math.min(180, s[1] - s[0]);
    const x = F.mono.slice(Math.floor(s[0]*F.sr), Math.floor((s[0] + len)*F.sr));
    // Kaydırma notaya da uygulanır (ör. başka ahenkte çalınmış kayıt)
    const data = Math.abs(cents()) < 0.5 ? x : runGen(stretchShiftGen(x, F.sr, 1, cents()));
    $("kfmsg").textContent = L("Notaya dökülüyor…", "Transcribing…");
    try{
      const r = await SK.convertPcm(data, F.sr, { makam: SK.tuningMakam && SK.tuningMakam(), onProgress: p => { $("kfmsg").textContent = L("Notaya dökülüyor… %", "Transcribing… ") + p + (LANG === "en" ? "%" : ""); } });
      if(!r || !r.q || !r.q.notes.some(n => !n.rest)){ $("kfmsg").textContent = L("Bu bölgede ezgi bulunamadı.", "No melody found in this part."); return; }
      $("kfmsg").textContent = "";
      stopPlay();
      SK.openConvert({ kind:"audio", notes: r.q.notes, tempo: r.q.tempo, meter: r.q.meter, raw: r.raw, offset: r.offset, makam: SK.tuningMakam && SK.tuningMakam(), name: F.name.replace(/\.[^.]+$/, "") + " " + fmt(s[0]), cut: s[1] - s[0] > 180 });
    }catch(e){ $("kfmsg").textContent = L("Notaya dökülemedi: ", "Couldn't transcribe: ") + (e.message || e); }
  });
  return { enter(){ if(F.mono) draw(); }, leave(){ if(play){ head = curPos(); stopPlay(); } } };
};
