// Çevir: PDF, resim ya da sesten esere. Okunan notalar düzeltme ekranında çip şeridi, metin ve dizek olarak görünür;
// öğrenci düzeltir, dinler ve "Kendi eserlerim"e kaydeder. Ses: dosya ya da "Dinleyerek yaz" (mikrofon, en çok 3 dk);
// 22 050 Hz tek kanala indirilir, 30 sn'lik parçalarla çözülür (arada ara verilir, arayüz donmaz).
// Mantık skills.js (audioNotes, joinAudioChunk, tuningOffset, quantizeRun) ve repertoire.js'te (düzeltme işlemleri).
// Dışa: SK.openConvert(job) — job: { notes, tempo?, meter?, name?, makam?, kind:"audio"|"image", turkish?, pages?, marks?,
// flags?, source?, raw?, offset? } (raw/offset: ses işinde tempo değişince yeniden ızgaraya oturtmak için).

// Kaydedilmemiş iş oturum boyunca burada durur: sekmeye dönünce yerinde
let cvState = null, cvJobSeq = 0;
const CV_SR = 22050, CV_MAX_SEC = 180, CV_CHUNK_SEC = 30, CV_OV_MS = 50;
const CV_METERS = [[2,4],[3,4],[4,4],[5,8],[6,8],[7,8],[9,8],[10,8],[12,8]];

TRAINERS.convert = function(ctx){
  const { SK, $, store, esc, nn, sleep } = ctx;
  const P = $("pp-convert");
  P.innerHTML = `
    <p class="pdesc">${L("Bir notayı ya da kaydı esere çevir. Okunan notalar aşağıda çip olarak görünür; dokunup düzelt, Dinle ile kontrol et ve kaydet. Okuma telefonda yapılır, dosyalar ve ses cihazdan çıkmaz.",
      "Turn a score or a recording into a piece. The notes read appear below as chips; tap to correct them, check with Listen and save. Reading happens on the phone; files and audio never leave the device.")}</p>
    <div id="cvfind" hidden></div>
    <div class="pbar">
      <button class="stopbtn" id="cvimg" type="button" hidden>${L("PDF ya da resim seç", "Choose a PDF or picture")}</button>
      <button class="stopbtn" id="cvaud" type="button">${L("Ses dosyası seç", "Choose an audio file")}</button>
      <input type="file" id="cvfile" accept="audio/*" hidden>
      <button class="primary small" id="cvlisten" type="button">${L("Dinleyerek yaz", "Write by ear")}</button>
      <span class="ltclock small" id="cvclock"></span>
    </div>
    <div class="fb" id="cvprog" aria-live="polite"></div>
    <div class="cvedit" id="cvedit" hidden>
      <div class="pbar">
        <select id="cvkind" aria-label="${L("Nota türü", "Score type")}">
          <option value="tr">${L("Türk müziği notası (olduğu gibi)", "Turkish music score (as is)")}</option>
          <option value="concert">${L("Piyano / konser notası (", "Piano / concert score (transpose for ") + esc(SK.inst.name) + L(" için çevir)", ")")}</option></select>
        <select id="cvmk" aria-label="Makam"><option value="">${L("Makam yok", "No makam")}</option>${MAKAMS.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}</select>
        <label class="tnum">♩ <input id="cvtempo" type="number" min="30" max="240" aria-label="Tempo"></label>
        <select id="cvmeter" aria-label="${L("Ölçü", "Time signature")}"></select>
        <label class="chk"><input type="checkbox" id="cvexpand"> ${L("Tekrarları aç", "Expand repeats")}</label>
      </div>
      <div class="cvsrc" id="cvsrc" hidden></div>
      <div class="muted small" id="cvinfo"></div>
      <div class="cvchips" id="cvchips" aria-label="${L("Okunan notalar", "Notes read")}"></div>
      <div class="pbar cvtools" id="cvtools">
        <button class="stopbtn" type="button" data-op="up" aria-label="${L("Bir basamak yukarı", "One step up")}">▲</button>
        <button class="stopbtn" type="button" data-op="down" aria-label="${L("Bir basamak aşağı", "One step down")}">▼</button>
        <button class="stopbtn" type="button" data-op="acc" aria-label="${L("Değiştirici işaret", "Accidental")}">♯ ♭</button>
        <button class="stopbtn" type="button" data-op="half" aria-label="${L("Süreyi yarıya indir", "Halve the duration")}">½×</button>
        <button class="stopbtn" type="button" data-op="double" aria-label="${L("Süreyi iki katına çıkar", "Double the duration")}">2×</button>
        <button class="stopbtn" type="button" data-op="dot">${L("nokta", "dot")}</button>
        <button class="stopbtn" type="button" data-op="rest">${L("sus", "rest")}</button>
        <button class="stopbtn" type="button" data-op="del">${L("sil", "delete")}</button>
        <button class="stopbtn" type="button" data-op="ins">${L("önüne ekle", "insert before")}</button>
        <button class="stopbtn" type="button" data-op="merge">${L("sonrakiyle birleştir", "merge with next")}</button>
        <button class="stopbtn" type="button" data-op="octup" aria-label="${L("Bir oktav yukarı", "One octave up")}">${L("oktav ▲", "octave ▲")}</button>
        <button class="stopbtn" type="button" data-op="octdown" aria-label="${L("Bir oktav aşağı", "One octave down")}">${L("oktav ▼", "octave ▼")}</button>
      </div>
      <div class="pbar cvall">
        <span class="muted small">${L("Hepsini aktar:", "Transpose all:")}</span>
        <button class="stopbtn" type="button" data-tr="perde" data-dir="1">${L("perde ▲", "perde ▲")}</button>
        <button class="stopbtn" type="button" data-tr="perde" data-dir="-1">${L("perde ▼", "perde ▼")}</button>
        <button class="stopbtn" type="button" data-tr="semitone" data-dir="1">${L("yarım ses ▲", "semitone ▲")}</button>
        <button class="stopbtn" type="button" data-tr="semitone" data-dir="-1">${L("yarım ses ▼", "semitone ▼")}</button>
      </div>
      <textarea id="cvtext" rows="3" aria-label="${L("Notalar (metin)", "Notes (text)")}"></textarea>
      <div class="cverr small" id="cvterr" aria-live="polite"></div>
      <div class="scorewrap" id="cvscore"></div>
      <div class="pbar">
        <button class="stopbtn" id="cvplay" type="button">${L("Dinle", "Listen")}</button>
        <button class="stopbtn" id="cvstop" type="button">${L("Durdur", "Stop")}</button>
        <input id="cvname" type="text" placeholder="${L("Eserin adı", "Name of the piece")}" aria-label="${L("Eserin adı", "Name of the piece")}">
        <button class="primary small" id="cvsave" type="button">${L("Kaydet", "Save")}</button>
      </div>
      <div class="fb" id="cvmsg" aria-live="polite"></div>
      <div class="pbar" id="cvfix" hidden>
        <button class="stopbtn" id="cvfixout" type="button">${L("Taşanları bir oktav kaydır", "Shift the notes outside by an octave")}</button>
        <button class="stopbtn" id="cvfixall" type="button">${L("Hepsini bir oktav kaydır", "Shift everything by an octave")}</button>
      </div>
    </div>`;

  // ---- İş belirteci: her okuma yeni bir jobId alır; sonuç geldiğinde jobId eskiyse ekrana yazılmaz ----
  let curJob = 0, listening = null, playTok = null, accBase = null;   // accBase: değiştirici döngüsünün sürdüğü nota
  const newJob = () => (curJob = ++cvJobSeq);
  const stale = id => id !== curJob;
  const prog = (t, cls = "") => { $("cvprog").className = "fb " + cls; $("cvprog").textContent = t; };
  const msg = (t, cls = "") => { $("cvmsg").className = "fb " + cls; $("cvmsg").textContent = t; };

  // ---- Ses: yeniden örnekleme ve parça parça çözüm ----
  async function to22k(data, sr){
    if(sr === CV_SR) return data;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OAC(1, Math.max(1, Math.ceil(data.length*CV_SR/sr)), CV_SR);
    const b = oc.createBuffer(1, data.length, sr); b.copyToChannel(data, 0);
    const src = oc.createBufferSource(); src.buffer = b; src.connect(oc.destination); src.start();
    return (await oc.startRendering()).getChannelData(0);
  }
  // data: tek kanal; dönen { raw, offset, q } ya da iş eskidiyse null. onProgress(%), isStale()
  async function analyzePcm(data, sr, { makam, onProgress, isStale }){
    const pcm = await to22k(data, sr);
    if(isStale()) return null;
    const C = CV_CHUNK_SEC*CV_SR, OV = Math.round(CV_OV_MS/1000*CV_SR), parts = Math.max(1, Math.ceil(pcm.length/C));
    let raw = [];
    for(let k=0;k<parts;k++){
      onProgress(Math.round(k/parts*100));
      await sleep(0);
      if(isStale()) return null;
      const s = Math.max(0, k*C - OV), e = Math.min(pcm.length, (k+1)*C);
      raw = joinAudioChunk(raw, audioNotes(pcm.subarray(s, e), CV_SR, { T: SK.T }), s/CV_SR*1000, (k*C - s)/CV_SR*1000);
    }
    onProgress(100);
    if(!raw.length) return { raw, offset:0, q:null };
    await sleep(0);
    if(isStale()) return null;
    const offset = tuningOffset(raw);
    await sleep(0);
    if(isStale()) return null;
    return { raw, offset, q: quantizeRun(raw, { makam: makam || null, mode: SK.tuningMode(), offset }) };
  }
  const tuneMakam = () => (SK.tuningMakam && SK.tuningMakam()) || null;
  // Bu sekmenin ses işi: ilerleme satırı, sonuç düzeltme ekranına
  async function runPcm(id, data, sr, meta){
    prog(L("Ezgi çözümleniyor…", "Analysing the melody…"));
    const makam = meta.makam !== undefined ? meta.makam : tuneMakam();
    let r;
    try{
      r = await analyzePcm(data, sr, { makam, isStale: () => stale(id),
        onProgress: p => { if(!stale(id)) prog(L("Ezgi çözümleniyor… %", "Analysing the melody… ") + p + (LANG === "en" ? "%" : "")); } });
    }catch(e){ if(!stale(id)) prog(L("Ses çözümlenemedi: ", "Couldn't analyse the audio: ") + (e.message || e), "bad"); return; }
    if(!r || stale(id)) return;
    if(!r.q || !r.q.notes.some(n => !n.rest)){ prog(L("Ezgi bulunamadı. Daha yakından ya da daha yüksek sesle dene.", "No melody found. Try closer or louder."), "bad"); return; }
    prog("");
    open({ kind:"audio", notes: r.q.notes, tempo: r.q.tempo, meter: r.q.meter, raw: r.raw, offset: r.offset, makam, name: meta.name, cut: meta.cut }, id);
  }
  // Ses dosyası: çöz → kanalların ortalaması → 180 sn'den uzunsa kes → 22 050 Hz
  async function readFile(f){
    const id = newJob();
    prog(L("Ses dosyası açılıyor…", "Opening the audio file…"));
    let buf;
    try{
      const ab = await f.arrayBuffer();
      if(stale(id)) return;
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      buf = await new OAC(1, 1, 44100).decodeAudioData(ab);
    }catch(e){ if(!stale(id)) prog(L("Ses dosyası açılamadı.", "Couldn't open the audio file."), "bad"); return; }
    if(stale(id)) return;
    const sr = buf.sampleRate, n = Math.min(buf.length, CV_MAX_SEC*sr), nch = buf.numberOfChannels, mono = new Float32Array(n);
    for(let ch=0;ch<nch;ch++){ const d = buf.getChannelData(ch); for(let i=0;i<n;i++) mono[i] += d[i]/nch; }
    await runPcm(id, mono, sr, { name: f.name.replace(/\.[^.]+$/, ""), cut: buf.length > n });
  }
  $("cvaud").addEventListener("click", () => $("cvfile").click());
  $("cvfile").addEventListener("change", () => {
    const f = $("cvfile").files[0]; $("cvfile").value = "";
    if(f) readFile(f);
  });

  // Dinleyerek yaz: mikrofondan en çok 3 dakika; durdurunca dosyayla aynı yol
  const clockName = () => L("Dinlenen ezgi ", "Melody by ear ") + new Date().toLocaleTimeString(LANG === "en" ? "en" : "tr", { hour:"2-digit", minute:"2-digit" });
  function listenUi(on){ $("cvlisten").textContent = on ? L("Durdur", "Stop") : L("Dinleyerek yaz", "Write by ear"); $("cvlisten").classList.toggle("listening", on); if(!on) $("cvclock").textContent = ""; }
  async function startListen(){
    const id = newJob();   // süren okuma varsa iptal
    const ok = await ctx.needMic();
    if(stale(id) || listening) return;   // izin beklenirken sekmeden çıkıldı
    if(!ok){ prog(L("Mikrofon açılamadı.", "Couldn't open the microphone."), "bad"); return; }
    const cap = SK.pcmCapture(CV_MAX_SEC), t0 = performance.now();
    listening = { cap, timer: setInterval(() => {
      const s = (performance.now() - t0)/1000;
      $("cvclock").textContent = Math.floor(s) + " / " + CV_MAX_SEC + L(" sn", " s");
      if(s >= CV_MAX_SEC) stopListen();
    }, 250) };
    listenUi(true);
    prog(L("Dinliyorum… ezgiyi çal ya da kaydı oynat, bitince Durdur.", "Listening… play the tune or the recording, then tap Stop."));
  }
  function endListen(){ const l = listening; listening = null; if(!l) return null; clearInterval(l.timer); listenUi(false); return l.cap.stop(); }
  function stopListen(){
    const r = endListen();
    if(!r || !r.data.length){ prog(L("Ses alınamadı.", "No audio was captured."), "bad"); return; }
    runPcm(newJob(), r.data, r.sampleRate, { name: clockName(), cut: r.full });
  }
  $("cvlisten").addEventListener("click", () => listening ? stopListen() : startListen());

  // ---- Düzeltme ekranı ----
  // state = { notes, marks, meter, tempo, makam, turkish, expand, sel, dirty, jobId, kind, raw, offset, name, source, flags, pages, cut }
  function open(job, id){
    if(id === undefined) id = newJob();
    playStop();
    const turkish = job.kind === "audio" ? true : job.turkish != null ? job.turkish : store.get("convert.turkish", true);
    cvState = { notes: job.notes.map(n => ({ ...n })), marks: (job.marks || []).map(m => ({ ...m })), meter: job.meter || [4,4],
      tempo: Math.max(30, Math.min(240, Math.round(job.tempo || 80))), makam: job.makam || null, turkish, expand: true, sel: null, dirty: false,
      jobId: id, kind: job.kind || "image", raw: job.raw || null, offset: job.offset || 0, name: job.name || "", source: job.source || null,
      flags: job.flags || [], pages: job.pages || null, cut: !!job.cut };
    msg(""); $("cvfix").hidden = true;
    show(true);
  }
  const S = () => cvState;
  const perdeName = c => (PERDES.find(p => p[0] === c) || [, ""])[1];
  // Süre işareti: ♩ dörtlük, ♪ sekizlik…; noktalıda "." ve üçlemede "³"
  function durSym(d){
    const BASE = [[4,"𝅝"],[2,"𝅗𝅥"],[1,"♩"],[0.5,"♪"],[0.25,"𝅘𝅥𝅯"],[0.125,"𝅘𝅥𝅰"]], eq = (a, b) => Math.abs(a - b) < 1e-6;
    for(const [v, s] of BASE){ if(eq(d, v)) return s; if(eq(d, v*1.5)) return s + "."; if(eq(d, v*2/3)) return s + "³"; }
    return ctx.num(d, 2).replace(/,?0+$/, "");
  }
  const chipName = n => n.rest ? L("Sus", "Rest") : n.c !== null && n.c !== undefined && perdeName(n.c) ? perdeName(n.c) : nn(n.w);
  const MARK_SYM = { repStart:"‖:", repEnd:":‖", segno:"𝄋", toSegno:"D.S.", sectionEnd:"‖" };
  const written = () => S().turkish ? S().notes : concertToWritten(S().notes, SK.T);
  function render(fromText){
    const st = S();
    $("cvedit").hidden = !st;
    if(!st) return;
    $("cvkind").value = st.turkish ? "tr" : "concert";
    $("cvkind").hidden = st.kind === "audio";
    $("cvmk").value = st.makam || "";
    $("cvtempo").value = st.tempo;
    const ms = CV_METERS.some(m => m.join() === st.meter.join()) ? CV_METERS : [...CV_METERS, st.meter];
    $("cvmeter").innerHTML = ms.map(m => `<option value="${m.join("/")}">${m.join("/")}</option>`).join("");
    $("cvmeter").value = st.meter.join("/");
    $("cvexpand").checked = st.expand;
    $("cvname").value = st.name;
    // Bilgi satırı: akort kayması, kesilen uzun kayıt, okuyucu uyarıları
    const off = Math.round(st.offset*10)/10, info = [];
    if(st.kind === "audio" && off !== 0) info.push(LANG === "en" ? "The recording is tuned " + Math.abs(off) + " commas " + (off < 0 ? "flat" : "sharp") + " (corrected)."
      : "Kayıt " + ctx.num(Math.abs(off), Number.isInteger(off) ? 0 : 1) + " koma " + (off < 0 ? "pes" : "tiz") + " akortlu (düzeltildi).");
    if(st.cut) info.push(L("Uzun kayıt: ilk 3 dakika okundu.", "Long recording: the first 3 minutes were read."));
    info.push(...st.flags.map(f => typeof f === "string" ? f : pick(f, LANG)));
    $("cvinfo").textContent = info.join(" ");
    // Çip şeridi: ölçü ayraçlı; sarı emin değil, turuncu ölçü tutmuyor, kırmızı aralık dışı
    const bars = barCheck(st.notes, st.meter), bad = new Set(rangeIssues(written())), barOf = [];
    bars.forEach(b => { for(let i=b.from;i<b.to;i++) barOf[i] = b; });
    const marksAt = i => st.marks.filter(m => m.i === i).map(m => `<span class="cvmark">${MARK_SYM[m.kind] || ""}</span>`).join("");
    let html = "";
    st.notes.forEach((n, i) => {
      if(i > 0 && barOf[i] !== barOf[i-1]) html += `<span class="cvbar" aria-hidden="true"></span>`;
      html += marksAt(i);
      const cls = ["cvchip", n.conf != null && n.conf < 0.6 ? "unsure" : "", barOf[i] && !barOf[i].ok ? "badbar" : "", bad.has(i) ? "outrange" : "", st.sel === i ? "sel" : ""].filter(Boolean).join(" ");
      html += `<button type="button" class="${cls}" data-i="${i}" aria-pressed="${st.sel === i}">${esc(chipName(n))} <i>${durSym(n.d)}</i></button>`;
    });
    html += marksAt(st.notes.length);
    $("cvchips").innerHTML = html || `<span class="muted small">${L("Nota yok.", "No notes.")}</span>`;
    $("cvtools").querySelectorAll("button").forEach(b => { b.disabled = st.sel === null; });
    if(!fromText){ $("cvtext").value = scoreToText(st.notes); $("cvterr").textContent = ""; }
    if(st.notes.length) drawScore($("cvscore"), written(), { meter: st.meter, names:true }); else $("cvscore").replaceChildren();
    if(!bad.size) $("cvfix").hidden = true;
  }
  function show(scroll){
    render();
    if(scroll) $("cvedit").scrollIntoView({ block:"nearest" });
  }
  // Notalar değişti: elle düzeltme (dirty); düzeltilen nota artık "emin değil" sayılmaz
  function edit(notes, sel, touched){
    const st = S();
    st.notes = notes.map((n, i) => touched && touched.includes(i) && n.conf != null ? { ...n, conf:1 } : n);
    st.sel = sel === null || !st.notes.length ? null : Math.max(0, Math.min(sel, st.notes.length - 1));
    st.dirty = true;
    msg(""); render();
  }
  // Tekrar işaretleri nota eklenip silinince kayar
  const shiftMarks = (from, delta) => { S().marks.forEach(m => { if(m.i > from) m.i = Math.max(from, m.i + delta); }); };
  $("cvchips").addEventListener("click", e => {
    const b = e.target.closest("[data-i]"); if(!b) return;
    S().sel = +b.dataset.i; render();
  });
  $("cvtools").addEventListener("click", e => {
    const b = e.target.closest("[data-op]"), st = S();
    if(!b || !st || st.sel === null) return;
    const i = st.sel, ns = st.notes, n = ns[i], set = x => ns.map((m, j) => j === i ? x : m);
    switch(b.dataset.op){
      case "up": edit(set(stepNote(n, 1)), i, [i]); break;
      case "down": edit(set(stepNote(n, -1)), i, [i]); break;
      case "acc": {
        if(n.rest) return;
        // Döngü notanın ilk harfinden sürer: işaretli nota komşu harfe yuvarlanabilir (Si + 5 koma → Do5), harf kaymasın
        const unit = st.turkish ? "koma" : "semitone", cyc = ACC_CYCLE[unit];
        if(!accBase || accBase.i !== i || accBase.w !== n.w || accBase.c !== n.c || accBase.unit !== unit){
          const nat = naturalOf(n);
          accBase = { i, unit, nat, k: unit === "koma" ? (n.c != null ? n.c - nat.c : Math.round((n.w - nat.w)*53/12)) : n.w - nat.w };
        }
        accBase.k = cyc[(cyc.indexOf(accBase.k) + 1) % cyc.length];
        const x = withAccidental({ ...n, w: accBase.nat.w, c: accBase.nat.c }, { k: accBase.k, unit });
        Object.assign(accBase, { w: x.w, c: x.c });
        edit(set(x), i, [i]);
        break;
      }
      case "half": edit(set(scaleDur(n, 0.5)), i, [i]); break;
      case "double": edit(set(scaleDur(n, 2)), i, [i]); break;
      case "dot": edit(set(toggleDot(n)), i, [i]); break;
      case "rest": edit(set(toRest(n)), i, [i]); break;
      case "del": shiftMarks(i, -1); edit(ns.filter((m, j) => j !== i), i, []); break;
      case "ins": {
        const x = { ...n, conf:1 }; delete x.box;
        shiftMarks(i, 1); edit([...ns.slice(0, i), x, ...ns.slice(i)], i, [i]);
        break;
      }
      case "merge": {
        const out = mergeNext(ns, i);
        if(out.length === ns.length){ msg(L("Yalnızca aynı perdedeki iki nota birleşir.", "Only two notes of the same pitch can be merged."), "bad"); return; }
        shiftMarks(i + 1, -1); edit(out, i, [i]);
        break;
      }
      case "octup": edit(shiftOctave(ns, [i], 1), i, [i]); break;
      case "octdown": edit(shiftOctave(ns, [i], -1), i, [i]); break;
    }
  });
  P.querySelector(".cvall").addEventListener("click", e => {
    const b = e.target.closest("[data-tr]"), st = S();
    if(!b || !st) return;
    edit(transposeAll(st.notes, +b.dataset.dir, b.dataset.tr), st.sel, []);
  });
  // Metin görünümü: yazdıkça çipler güncellenir; okunamayan parçalar kırmızı iletide. Aynı kalan notaların güveni korunur.
  $("cvtext").addEventListener("input", () => {
    const st = S(); if(!st) return;
    const r = parseScoreText($("cvtext").value);
    st.notes = r.notes.map((n, i) => { const o = st.notes[i]; return o && o.w === n.w && o.c === n.c && o.d === n.d && !!o.rest === !!n.rest ? { ...o, ...n } : n; });
    st.marks = st.marks.filter(m => m.i <= st.notes.length);
    if(st.sel !== null && st.sel >= st.notes.length) st.sel = st.notes.length ? st.notes.length - 1 : null;
    st.dirty = true;
    render(true);
    $("cvterr").textContent = r.errors.length ? L("Okunamadı: ", "Could not read: ") + r.errors.join(" ") : "";
  });

  // Üst satır. Ses işinde tempo ya da makam değişince ham notalar yeniden ızgaraya oturtulur; elle düzeltme varsa önce sorulur.
  function requant(tempo, makam){
    const st = S();
    if(st.dirty && !confirm(L("Elle yaptığın düzeltmeler silinecek. Devam edilsin mi?", "Your manual corrections will be lost. Continue?"))) return false;
    const q = quantizeRun(st.raw, { tempo, makam, mode: SK.tuningMode(), offset: st.offset });
    Object.assign(st, { notes: q.notes, tempo: Math.round(tempo), makam, sel: null, dirty: false });
    return true;
  }
  $("cvtempo").addEventListener("change", () => {
    const st = S(); if(!st) return;
    const t = Math.max(30, Math.min(240, Math.round(+$("cvtempo").value) || st.tempo));
    if(t === st.tempo){ render(); return; }
    if(st.kind === "audio" && st.raw) requant(t, st.makam); else st.tempo = t;
    render();
  });
  $("cvmk").addEventListener("change", () => {
    const st = S(); if(!st) return;
    const mk = $("cvmk").value || null;
    if(st.kind === "audio" && st.raw) requant(st.tempo, mk); else st.makam = mk;
    render();
  });
  $("cvkind").addEventListener("change", () => { const st = S(); if(!st) return; st.turkish = $("cvkind").value === "tr"; store.set("convert.turkish", st.turkish); render(); });
  $("cvmeter").addEventListener("change", () => { const st = S(); if(!st) return; st.meter = $("cvmeter").value.split("/").map(Number); render(); });
  $("cvexpand").addEventListener("change", () => { if(S()) S().expand = $("cvexpand").checked; });
  $("cvname").addEventListener("input", () => { if(S()) S().name = $("cvname").value; });

  // Dinle: düzeltilmiş ezgi (yazılı) tempoda çalar; çalan çip vurgulanır
  function playStop(){ if(playTok){ playTok = null; SK.stopSound(); } P.querySelectorAll(".cvchip.cur").forEach(c => c.classList.remove("cur")); }
  async function listen(){
    playStop();
    const st = S(); if(!st) return;
    const tok = {}; playTok = tok;
    const notes = written(), mk = st.makam ? makamById(st.makam) : null, beatMs = 60000/st.tempo;
    const freqOf = n => n.c != null ? (mk ? ctx.mkFreq(mk, n.c) : ctx.commaFreq(n.c)) : undefined;
    for(let i=0;i<notes.length;i++){
      if(playTok !== tok) return;
      P.querySelectorAll(".cvchip.cur").forEach(c => c.classList.remove("cur"));
      const chip = P.querySelector(`.cvchip[data-i="${i}"]`); if(chip) chip.classList.add("cur");
      const n = notes[i];
      if(n.rest) SK.stopSound(); else SK.play(n.w, freqOf(n));
      await sleep(n.d*beatMs*0.92);
      if(playTok !== tok) return;
      SK.stopSound(); await sleep(n.d*beatMs*0.08);
    }
    if(playTok === tok) playStop();
  }
  $("cvplay").addEventListener("click", listen);
  $("cvstop").addEventListener("click", playStop);

  // Kaydet: konser notası yazılıya çevrilir; aralık dışı nota varsa kayıt yok, kaydırma düğmeleri çıkar
  $("cvsave").addEventListener("click", () => {
    const st = S(); if(!st) return;
    playStop();
    let notes = written();
    const bad = rangeIssues(notes);
    if(bad.length){
      msg(L("Klarnet aralığı dışında ", "") + bad.length + L(" nota var (kırmızı, Mi3–Mi♭7). Düzelt ya da kaydır.", " notes are outside the clarinet's range (red, E3–E♭7). Fix or shift them."), "bad");
      render(); $("cvfix").hidden = false;
      return;
    }
    if(!notes.some(n => !n.rest)){ msg(L("Nota yok.", "No notes."), "bad"); return; }
    if(st.expand && st.marks.length) notes = expandRepeats(notes, st.marks);
    notes = notes.map(({ conf, box, ...n }) => n);
    const name = st.name.trim() || L("Çevrilen eser", "Converted piece");
    const piece = { name, notes, tempo: st.tempo, meter: st.meter, makam: st.makam };
    if(st.source) piece.source = st.source;
    cvState = null; prog(""); render();
    SK.addPieceFull(piece);
  });
  // Taşanlar: pesler bir oktav yukarı, tizler bir oktav aşağı. Hepsi: taşanların çoğunluğunun yönüne.
  $("cvfixout").addEventListener("click", () => {
    const st = S(), w = written(), bad = rangeIssues(w);
    const lo = bad.filter(i => w[i].w < LOW_NOTE), hi = bad.filter(i => w[i].w > HIGH_NOTE);
    edit(shiftOctave(shiftOctave(st.notes, lo, 1), hi, -1), st.sel, bad);
    msg("");
  });
  $("cvfixall").addEventListener("click", () => {
    const st = S(), w = written(), bad = rangeIssues(w);
    const lo = bad.filter(i => w[i].w < LOW_NOTE).length;
    edit(shiftOctave(st.notes, st.notes.map((n, i) => i), lo >= bad.length - lo ? 1 : -1), st.sel, []);
    msg("");
  });

  SK.openConvert = job => { open(job); ctx.selectTab("convert"); };
  // Kayıt sekmesi (drills.js) için: ham ses → { raw, offset, q } (onProgress(%)), iş belirteci çağıranda
  SK.convertPcm = (data, sr, opts = {}) => analyzePcm(data, sr, { makam: opts.makam, onProgress: opts.onProgress || (() => {}), isStale: opts.isStale || (() => false) });
  // Tarayıcı panelinde mikrofon olmadan denemek için (adrese ?debug eklenince): dinleyerek yazın durdurma sonrası yolu
  if(/[?&]debug(=|&|$)/.test(location.search)) window.SKDEBUG = Object.assign(window.SKDEBUG || {}, {
    convertPcm: (data, sr) => runPcm(newJob(), data, sr, { name: clockName() }),
    convertState: () => cvState
  });
  return {
    enter(){ render(); },
    // Sekmeden çıkınca süren okuma ve dinleme iptal edilir; düzeltme ekranı yerinde kalır
    leave(){
      newJob();
      if(listening) endListen();
      playStop();
      if(!/bad/.test($("cvprog").className)) prog("");
    }
  };
};
