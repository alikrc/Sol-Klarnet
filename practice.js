// Çalışma bölümünün kabuğu: sekme menüsü, usullü metronom ve durak sesi (dron), her zaman çalışan ölçümler
// (entonasyon, pratik süresi, vibrato, glissando) ve sekmelere verilen ortak yardımcılar (ctx).
// Sekmeler drills.js, trainers.js, pieces.js ve lessonview.js'te; mikrofon ve ses index.html'deki window.SK üzerinden.
(function(){
  const SK = window.SK;
  if(!SK) return;
  const $ = id => document.getElementById(id);
  const store = SK.store, T = SK.T;
  const nn = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
  const num = (v, d=1) => v.toFixed(d).replace(".", ",");
  const sgn = (v, d=1) => { const r = Math.round(v*10**d)/10**d; return (r>0 ? "+" : r<0 ? "−" : "±") + num(Math.abs(r), d); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const commaFreq = c => midiToFreq(commaToMidi(c) - T);
  // Seçili akortta (AEU / icra) bir makam perdesinin hedefi ve sesi
  const tgt = (mk, c) => perdeTarget(mk, c, SK.tuningMode());
  const mkFreq = (mk, c) => commaFreq(tgt(mk, c));
  const perdeOf = w => { const p = nearestPerde((w-67)*53/12); return p ? p.name : ""; };
  const label = w => nn(w) + (perdeOf(w) ? " · " + perdeOf(w) : "");
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ---- İskelet ----
  // On bir alıştırma beş gruba ayrılır. Çalışma bir ana sayfayla açılır: bütün alıştırmalar gruplu kartlar halinde,
  // tek dokunuşla açılır. Alıştırma ekranında üstte geri düğmesi ve grubun diğer alıştırmaları (alt sekmeler) durur.
  // Dersler ilk sekmedir; mantığı ve verisi lessons.js'te
  const TABS = [["lessons","Dersler"],["quiz","Parmak testi"],["staffmap",L("Dizek haritası", "Staff map")],["long","Uzun ton"],["rhythm",L("Ritim", "Rhythm")],["hiz",L("Hız", "Speed")],["susleme",L("Süsleme", "Ornaments")],
                ["makam",L("Dizi", "Scale")],["mimic","Taklit"],["seyir",L("Seyir", "Seyir")],["ear",L("Kulak", "Ear")],
                ["piece",L("Etüt ve eserler", "Études & pieces")],["rec","Kayıt"],["progress","İlerleme"]];
  const GROUPS = [["lessons","Dersler",["lessons"]],
                  ["tech",L("Teknik", "Skills"),["quiz","staffmap","long","rhythm","hiz","susleme"]],
                  ["makam","Makam",["makam","mimic","seyir","ear"]],
                  ["pieces",L("Eserler", "Pieces"),["piece","rec"]],
                  ["progress","İlerleme",["progress"]]];
  const groupOf = id => GROUPS.find(g => g[2].includes(id));
  const tabName = id => TABS.find(t => t[0] === id)[1];
  // Ana sayfa kartlarındaki kısa açıklamalar
  const BLURB = {
    lessons: L("Adım adım dersler, mikrofonla değerlendirilir", "Step-by-step lessons, checked with the microphone"),
    quiz: L("Notaları ve parmakları ezberle: çal, bul, oku", "Memorise notes and fingerings: play, find, read"),
    staffmap: L("Hangi nota dizekte nerede: Si4 mü, Si5 mi?", "Where each note sits: B4 or B5?"),
    long: L("Bir notayı düz ve temiz tut", "Hold a note steady and clean"),
    rhythm: L("Metronomla zamanında çal", "Play in time with the metronome"),
    hiz: L("Gam, arpej, dizi: tempo merdiveniyle hızlan", "Scales, arpeggios: speed up with the tempo ladder"),
    susleme: L("Çarpma, mordan, tril, kayış: ölçülerek", "Grace notes, mordents, trills, slides: measured"),
    makam: L("Makam dizisini çık ve in", "Play the makam scale up and down"),
    mimic: L("Duyduğun ezgiyi tekrar çal", "Play back the phrase you hear"),
    seyir: L("Serbest çal, seyrini gör", "Play freely, see your seyir"),
    ear: L("Koma farklarını duymayı öğren", "Learn to hear comma differences"),
    piece: L("Etütleri ve kendi eserlerini çal", "Play études and your own pieces"),
    rec: L("Kaydet, dinle, sapmaları gör", "Record, listen, see deviations"),
    progress: L("Çalışma süren ve gelişimin", "Your practice time and progress")
  };
  const ICON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>`,
    stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>`,
    chev: `<svg class="tchev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
    go: `<svg class="hgo" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`
  };
  const card = id => `<button type="button" class="hcard" data-open="${id}"><span><b>${tabName(id)}</b><small>${BLURB[id]}</small></span>${ICON.go}</button>`;
  const root = $("practice");
  root.innerHTML = `
    <div class="phead">
      <div class="label">Çalışma</div>
      <div class="pstat">
        <span class="pmic" id="pmic"></span>
        <button class="pgoal" id="pgoal" type="button">
          <span id="pgoaltx"></span><i aria-hidden="true"><b id="pgoalbar"></b></i></button>
      </div>
    </div>
    <div class="phub" id="phub">
      <button type="button" class="hresume" id="hresume"></button>
      ${GROUPS.map(([g, name, members]) => `<section class="hgroup" aria-label="${name}">
        ${members.length > 1 ? `<h3 class="label">${name}</h3>` : ""}
        <div class="hcards">${members.map(card).join("")}</div></section>`).join("")}
    </div>
    <div class="pex" id="pex" hidden>
    <nav class="pnav" aria-label="Çalışma türü">
      <div class="pbar">
        <button type="button" class="pback" id="pback">${ICON.back}<span>${L("Çalışma", "Practice")}</span></button>
        <h2 class="ptitle" id="ptitle"></h2>
      </div>
      <div class="psubs" role="tablist" aria-label="Çalışma türü">
        ${TABS.map(([id, name]) => `<button type="button" role="tab" id="tab-${id}" aria-controls="pp-${id}" data-tab="${id}">${name}</button>`).join("")}
      </div>
    </nav>
    <div class="tools">
      <div class="tool" id="tmet">
        <div class="thead">
          <button class="tplay" id="metbtn" type="button"></button>
          <button class="tsum" type="button" aria-expanded="false" aria-controls="tmetbody">
            <span><span class="tname">${L("Metronom", "Metronome")}</span><span class="tval" id="metsum"></span></span>${ICON.chev}</button>
        </div>
        <div class="slots" id="slots" aria-hidden="true"></div>
        <div class="tbody" id="tmetbody" hidden>
          <label class="tfield"><span class="label">Usul</span>
            <select id="usul" aria-label="Usul">${USULS.map(u => `<option value="${u.id}">${u.name} ${u.meter}</option>`).join("")}</select></label>
          <div class="tfield"><span class="label">Tempo</span>
            <div class="stepper">
              <button class="mini" type="button" data-tempo="-4" aria-label="${L("Yavaşlat", "Slower")}">−</button>
              <input id="tempo" type="number" min="30" max="300" step="2" value="120" aria-label="Tempo">
              <button class="mini" type="button" data-tempo="4" aria-label="${L("Hızlandır", "Faster")}">+</button>
              <em>vuruş/dk</em>
            </div></div>
        </div>
      </div>
      <div class="tool" id="tdrone">
        <div class="thead">
          <button class="tplay" id="dronebtn" type="button"></button>
          <button class="tsum" type="button" aria-expanded="false" aria-controls="tdronebody">
            <span><span class="tname">${L("Dron", "Drone")}</span><span class="tval" id="dronesum"></span></span>${ICON.chev}</button>
        </div>
        <div class="tbody" id="tdronebody" hidden>
          <label class="tfield"><span class="label">${L("Durak perdesi", "Tonic perde")}</span><select id="dronep" aria-label="Dron perdesi"></select></label>
          <label class="tfield"><span class="label">${L("Ses düzeyi", "Volume")}</span>
            <input id="dronevol" type="range" min="1" max="10" value="4" aria-label="Dron ses düzeyi"></label>
          <div class="reg">Kulaklık önerilir. Dron açıkken dron perdesiyle aynı ses (oktavı dahil) algılanmaz.</div>
        </div>
      </div>
    </div>
    ${TABS.map(([id]) => `<div class="ppanel" role="tabpanel" id="pp-${id}" aria-labelledby="tab-${id}" hidden></div>`).join("")}
    </div>
  `;

  const micNote = $("pmic");
  function micHint(){ micNote.hidden = SK.isListening(); micNote.textContent = "çoğu alıştırma mikrofon ister"; }
  SK.on("mic", micHint); micHint();
  async function needMic(){ if(!SK.isListening()) await SK.startMic(); return SK.isListening(); }

  // Araçlar (metronom, dron): başlıkta aç/kapat ve özet; ayarlar katlanır. Alıştırmayı kapatmasın diye
  // ayarlar her alıştırmada kapalı açılır.
  function setToolOpen(tool, open){
    const sum = tool.querySelector(".tsum");
    tool.classList.toggle("open", open);
    sum.setAttribute("aria-expanded", open ? "true" : "false");
    $(sum.getAttribute("aria-controls")).hidden = !open;
  }
  const closeTools = () => root.querySelectorAll(".tool").forEach(tool => setToolOpen(tool, false));
  root.querySelectorAll(".tool").forEach(tool => {
    setToolOpen(tool, false);
    tool.querySelector(".tsum").addEventListener("click", () => setToolOpen(tool, !tool.classList.contains("open")));
  });
  const PLAY_LABELS = {
    metbtn: [L("Metronomu başlat", "Start the metronome"), L("Metronomu durdur", "Stop the metronome")],
    dronebtn: [L("Dronu aç", "Turn the drone on"), L("Dronu kapat", "Turn the drone off")]
  };
  function setPlay(btn, on){
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", PLAY_LABELS[btn.id][on ? 1 : 0]);
    btn.innerHTML = on ? ICON.stop : ICON.play;
    btn.closest(".tool").classList.toggle("on", on);
  }

  // Etkin modül kararlı nota/sessizlik olaylarını alır
  const modules = {};
  let active = null;
  const pnav = root.querySelector(".pnav");
  const descs = [];   // telefonda iki satıra kısalan açıklamalar
  // Ana sayfadan açılan alıştırma tarayıcı geçmişine eklenir: telefonun geri tuşu ana sayfaya döner
  let pushed = false;
  function selectTab(id, user){
    if(active && active !== id && modules[active].leave) modules[active].leave();
    const fromHub = active === null;
    active = id; store.set("ptab", id);
    const members = groupOf(id)[2];
    $("phub").hidden = true; $("pex").hidden = false;
    $("ptitle").textContent = tabName(id);
    TABS.forEach(([t]) => {
      $("tab-"+t).hidden = !members.includes(t);
      $("tab-"+t).setAttribute("aria-selected", t===id ? "true" : "false");
      $("tab-"+t).tabIndex = t===id ? 0 : -1;
      $("pp-"+t).hidden = t!==id;
    });
    pnav.classList.toggle("single", members.length < 2);
    closeTools();
    if(modules[id].enter) modules[id].enter();
    fitDescs();
    if(user){
      const st = history.state || {};
      if(fromHub && st.view === "practice" && !st.ex){ history.pushState({ view:"practice", ex:id }, ""); pushed = true; }
      else if(st.view === "practice") history.replaceState({ ...st, ex:id }, "");
      // Yeni alıştırma baştan görünsün
      if(fromHub) window.scrollTo(0, 0);
      else{
        const top = pnav.getBoundingClientRect().bottom, p = $("pp-"+id).getBoundingClientRect().top;
        if(p < top) window.scrollBy(0, p - top - 8);
      }
    }
  }
  function showHub(){
    if(active && modules[active].leave) modules[active].leave();
    active = null; pushed = false;
    TABS.forEach(([t]) => { $("pp-"+t).hidden = true; });
    $("pex").hidden = true; $("phub").hidden = false;
    const last = store.get("ptab", "lessons"), r = $("hresume");
    r.dataset.open = TABS.some(([t]) => t === last) ? last : "lessons";
    r.innerHTML = `<span><small>${L("Kaldığın yerden devam et", "Pick up where you left off")}</small><b>${tabName(r.dataset.open)}</b></span>${ICON.go}`;
    window.scrollTo(0, 0);
  }
  function back(){
    if(pushed && history.state && history.state.ex) history.back();
    else{ if(history.state && history.state.ex){ const { ex, ...st } = history.state; history.replaceState(st, ""); } showHub(); }
  }
  $("pback").addEventListener("click", back);
  $("phub").addEventListener("click", e => { const c = e.target.closest("[data-open]"); if(c) selectTab(c.dataset.open, true); });
  window.addEventListener("popstate", e => {
    const st = e.state || {};
    if(st.view !== "practice") return;
    if(st.ex && TABS.some(([t]) => t === st.ex)){ if(active !== st.ex) selectTab(st.ex); }
    else if(active) showHub();
  });
  // Alt menüde açıkken Çalışma'ya yeniden dokunmak ana sayfaya döndürür
  const navBtn = document.querySelector('.nav [data-view="practice"]');
  if(navBtn) navBtn.addEventListener("click", () => { if(document.body.dataset.view === "practice" && active) back(); }, true);
  pnav.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if(b) selectTab(b.dataset.tab, true); });
  pnav.addEventListener("keydown", e => {
    const step = {ArrowRight:1, ArrowLeft:-1}[e.key];
    if(!step || !e.target.closest(".psubs")) return;
    e.preventDefault();
    const m = groupOf(active)[2], i = (m.indexOf(active) + step + m.length) % m.length;
    selectTab(m[i], true); $("tab-"+m[i]).focus();
  });
  $("pgoal").addEventListener("click", () => selectTab("progress", true));

  // Uzun açıklamalar telefonda iki satır; taşıyorsa "devamı" düğmesi
  function fitDescs(){
    descs.forEach(([p, b]) => {
      if(p.closest("[hidden]")) return;
      if(p.classList.contains("open")){ b.hidden = false; return; }
      b.hidden = p.scrollHeight <= p.clientHeight + 2;
    });
  }
  window.addEventListener("resize", fitDescs);
  SK.on("note", d => { const m = modules[active]; if(m && m.note) m.note(d.r, d.t); });
  SK.on("silence", d => { const m = modules[active]; if(m && m.silence) m.silence(d.t); });
  SK.on("raw", d => { const m = modules[active]; if(m && m.raw) m.raw(d); });

  // Aynı notanın ne kadar süredir tutulduğunu izler (yanlış notalar ve sessizlik sıfırlar)
  function holder(){
    let w = null, since = 0, fired = false;
    return {
      push(written, t){ if(written !== w){ w = written; since = t; fired = false; } return { w, ms: t - since, fired }; },
      fire(){ fired = true; },
      reset(){ w = null; fired = false; }
    };
  }

  // ---- Ses: metronom ve dron (ana sentezleyicinin ses bağlamı) ----
  const slotsEl = $("slots");
  let met = null;
  function drawSlots(u, cur = -1){
    slotsEl.innerHTML = usulSlots(u).map((s, i) =>
      `<i class="${s==="D" ? "dum" : s==="T" ? "tek" : "rest"}${i===cur ? " now" : ""}">${s==="D" ? "Düm" : s==="T" ? "Tek" : "·"}</i>`).join("");
  }
  function hit(a, kind, t, vol = 1){
    const g = a.createGain();
    g.connect(a.destination);
    if(kind === "D"){
      // Düm: perde bulucunun alt sınırının (100 Hz) altında kalır, nota sanılmaz
      const o = a.createOscillator();
      o.frequency.setValueAtTime(85, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
      g.gain.setValueAtTime(0.6*vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); o.start(t); o.stop(t + 0.32);
    }else{
      // Tek: süzülmüş gürültü, perdesiz
      const len = Math.round(a.sampleRate*0.06), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
      for(let i=0;i<len;i++) ch[i] = (Math.random()*2-1) * (1 - i/len);
      const src = a.createBufferSource(), f = a.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 2500; f.Q.value = 1.2;
      src.buffer = buf; src.connect(f).connect(g);
      g.gain.setValueAtTime(0.5*vol, t);
      src.start(t);
    }
  }
  function startMet(){
    const a = SK.audioCtx(), u = USULS.find(x => x.id === $("usul").value), slots = usulSlots(u);
    let i = 0, next = a.currentTime + 0.1;
    met = { timer: setInterval(() => {
      const per = 60 / tempo();
      while(next < a.currentTime + 0.12){
        const k = i % slots.length, at = next;
        if(slots[k]) hit(a, slots[k], at);
        setTimeout(() => { if(met) drawSlots(u, k); }, Math.max(0, (at - a.currentTime)*1000));
        next += per; i++;
      }
    }, 25) };
    setPlay($("metbtn"), true);
  }
  function stopMet(){
    if(met){ clearInterval(met.timer); met = null; }
    setPlay($("metbtn"), false);
    drawSlots(USULS.find(x => x.id === $("usul").value));
    metSum();
  }
  // Tempo kutusu boş ya da sınır dışıysa 30–300 aralığına çekilir
  const clampTempo = v => Math.max(30, Math.min(300, Math.round(+v) || 120));
  const tempo = () => clampTempo($("tempo").value);
  function setTempo(v){ $("tempo").value = clampTempo(v); store.set("tempo", tempo()); metSum(); }
  function metSum(){ $("metsum").textContent = USULS.find(x => x.id === $("usul").value).name + " · " + tempo(); }
  $("usul").value = store.get("usul", "sofyan");
  $("tempo").value = store.get("tempo", 120);
  $("usul").addEventListener("change", () => { store.set("usul", $("usul").value); if(met){ stopMet(); startMet(); } else stopMet(); });
  $("tempo").addEventListener("change", () => setTempo($("tempo").value));
  $("tmetbody").addEventListener("click", e => { const b = e.target.closest("[data-tempo]"); if(b) setTempo(tempo() + +b.dataset.tempo); });
  $("metbtn").addEventListener("click", () => met ? stopMet() : startMet());
  stopMet();

  const dronSel = $("dronep");
  PERDES.filter(([c]) => c >= -22 && c <= 62).forEach(([c, n]) => {
    const o = document.createElement("option"); o.value = c; o.textContent = n + " (yazılı " + nn(commaToWritten(c)) + ")";
    dronSel.appendChild(o);
  });
  dronSel.value = store.get("drone", 0);
  let drone = null;
  function startDrone(){
    const a = SK.audioCtx(), c = +dronSel.value, f = commaFreq(c);
    const g = a.createGain(), lp = a.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1200;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.02 * +$("dronevol").value, a.currentTime + 0.4);
    const oscs = [f, f/2].map(fr => { const o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr; o.connect(lp); o.start(); return o; });
    lp.connect(g).connect(a.destination);
    drone = { g, oscs, f }; droneLv = []; SK.droneActive = true;
    setPlay($("dronebtn"), true);
  }
  function stopDrone(){
    if(drone){
      const a = SK.audioCtx(), t = a.currentTime;
      drone.g.gain.cancelScheduledValues(t);
      drone.g.gain.setValueAtTime(Math.max(drone.g.gain.value, 0.0001), t);
      drone.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      drone.oscs.forEach(o => o.stop(t + 0.35));
      drone = null; SK.droneActive = false;
    }
    setPlay($("dronebtn"), false);
    droneSum();
  }
  function droneSum(){ const p = PERDES.find(([c]) => c === +dronSel.value); $("dronesum").textContent = p ? p[1] : ""; }
  function setDrone(c){ dronSel.value = c; store.set("drone", c); droneSum(); if(drone){ stopDrone(); startDrone(); } }
  dronSel.addEventListener("change", () => setDrone(+dronSel.value));
  $("dronevol").addEventListener("input", () => { if(drone) drone.g.gain.setTargetAtTime(0.02 * +$("dronevol").value, SK.audioCtx().currentTime, 0.05); });
  $("dronebtn").addEventListener("click", () => drone ? stopDrone() : startDrone());
  stopDrone();

  // Kayıt dinletilirken ya da dron çalarken mikrofon o sesi nota saymasın.
  // Dronun hoparlörden mikrofona sızan seviyesi son 10 saniyenin alt %10'luk dilimiyle (nefes aralarından) izlenir; bunun iki katından
  // güçlü ses öğrencinin sesidir (durağı dronla birlikte çalmak da ölçülür). Sızıntı düzeyindeki her ölçüm yok sayılır.
  let playbackMute = false, droneLv = [];
  SK.on("level", d => {
    if(!drone) return;
    droneLv.push(d.rms); if(droneLv.length > 220) droneLv.shift();
  });
  const droneFloor = () => droneLv.length < 10 ? Infinity : [...droneLv].sort((a,b) => a-b)[Math.floor(droneLv.length*0.1)];
  SK.ignore = (f, rms) => {
    if(playbackMute) return true;
    if(!drone) return false;
    const floor = droneFloor();
    if(rms < floor*1.3) return true;
    const c = 1200*Math.log2(f/drone.f), r = ((c % 1200) + 1200) % 1200;
    return Math.min(r, 1200 - r) < 25 && !(rms > floor*2);
  };
  document.addEventListener("visibilitychange", () => { if(document.hidden){ stopMet(); stopDrone(); } });

  // Günlük hedef: bugünkü sesli çalma süresi / hedef (dakika)
  function goalText(){
    const goal = store.get("goal.min", 15), today = Math.floor((days[dayKey(new Date())] || 0)/60);
    const el = $("pgoal"); if(!el) return;
    const tx = L("Bugün ", "Today ") + today + "/" + goal + L(" dk", " min") + (today >= goal ? " ✓" : "");
    $("pgoaltx").textContent = tx;
    $("pgoalbar").style.width = Math.min(100, today/goal*100) + "%";
    el.setAttribute("aria-label", tx + L(" — İlerleme'yi aç", " — open Progress"));
    el.classList.toggle("goalok", today >= goal);
  }
  // Yalnızca Çalışma ekranı görünürken yenilenir; ekrana dönülünce (hedef Ayarlar'da değişmiş olabilir) hemen güncellenir
  setInterval(() => { if(document.body.dataset.view === "practice" && !document.hidden) goalText(); }, 5000);
  SK.on("view", d => { if(d.v === "practice") goalText(); });

  // ---- Her zaman çalışanlar: entonasyon istatistiği, pratik süresi, vibrato, glissando ----
  const intStats = store.get("int.stats", {});
  let intDirty = false;
  const collector = new NoteStatCollector((w, m) => { statAdd(intStats, w, m); intDirty = true; paintHeat(); });
  SK.on("note", d => { if(d.r.inRange && d.r.perde) collector.push(d.r.written, d.r.perde.delta, d.t); });
  SK.on("silence", () => collector.flush());

  const days = store.get("days", {});
  goalText();
  let lastRaw = 0, unsaved = 0;
  SK.on("raw", d => {
    const dt = d.t - lastRaw; lastRaw = d.t;
    if(dt > 0 && dt < 250){
      const k = dayKey(new Date());
      days[k] = (days[k] || 0) + dt/1000; unsaved += dt;
    }
    if(unsaved > 5000){ unsaved = 0; store.set("days", days); }
    if(intDirty){ intDirty = false; store.set("int.stats", intStats); }
  });
  let resetting = false;
  window.addEventListener("pagehide", () => { if(!resetting && !window.SK_RESETTING){ store.set("days", days); store.set("int.stats", intStats); } });

  // Vibrato: kararlı notanın son 1,5 saniyesindeki ham ölçümler
  const vibEl = $("vib");
  let vibFrames = [], vibNote = null, vibT = 0;
  SK.on("raw", d => {
    if(vibNote === null) return;
    vibFrames.push({ t:d.t, comma:d.comma });
    while(vibFrames.length && d.t - vibFrames[0].t > 1500) vibFrames.shift();
    if(d.t - vibT > 250){
      vibT = d.t;
      const v = vibrato(vibFrames, SK.windowSec());
      vibEl.innerHTML = v ? num(v.rate) + " <em>Hz</em> ±" + num(v.depth) + " <em>koma</em>" : "— <em>düz</em>";
    }
  });
  // Glissando: iki kararlı nota arasındaki geçiş kareleri
  let lastStable = null, between = [];
  SK.on("raw", d => between.push({ t:d.t, comma:d.comma }));
  SK.on("note", d => {
    if(d.r.written !== vibNote){ vibNote = d.r.written; vibFrames = []; }
    if(lastStable && lastStable.written !== d.r.written && isGlide([lastStable, ...between])) SK.markGlide(d.t);
    lastStable = { t:d.t, comma:d.r.comma, written:d.r.written };
    between = [];
  });
  SK.on("silence", () => {
    lastStable = null; between = []; vibNote = null; vibFrames = [];
    vibEl.innerHTML = "—";
  });

  // ---- Nota şeridi: entonasyon ısı haritası ve makam işaretleri ----
  const heatBtn = $("heatbtn");
  let heatOn = store.get("heat", false);
  function paintHeat(){
    SK.cells.forEach((el, w) => {
      const cls = heatOn ? heatClass(intStats[w]) : null;
      el.classList.remove("heat-sharp", "heat-flat", "heat-clean");
      if(cls) el.classList.add("heat-" + cls);
      const s = intStats[w];
      el.title = heatOn && s && s.n >= 3 ? "ortalama " + sgn(s.sum/s.n) + " koma (" + s.n + " ölçüm)" : "";
    });
    heatBtn.setAttribute("aria-pressed", heatOn ? "true" : "false");
    $("heatlg").hidden = !heatOn;
  }
  heatBtn.addEventListener("click", () => { heatOn = !heatOn; store.set("heat", heatOn); paintHeat(); });
  paintHeat();
  const markScale = mk => SK.markScale(mk);

  // Parmak şemasının küçük kopyası (test için; notanın adı gizli kalır)
  function miniChart(){
    const c = document.querySelector("svg.chart").cloneNode(true);
    c.querySelectorAll("[id]").forEach(n => { n.id = "q-" + n.id; n.removeAttribute("tabindex"); n.removeAttribute("role"); n.removeAttribute("aria-label"); n.removeAttribute("aria-pressed"); });
    c.classList.add("minichart"); c.setAttribute("aria-label", "Sorulan parmak pozisyonu");
    return c;
  }
  function paintMini(svg, code){
    const on = new Set(fingeringIds(code).map(i => "q-" + i));
    svg.querySelectorAll(".hole, .key").forEach(n => n.classList.toggle("on", on.has(n.id)));
  }
  const SVGNS = "http://www.w3.org/2000/svg";
  function staffSvg(){ const s = document.createElementNS(SVGNS, "svg"); s.setAttribute("viewBox", "0 0 150 108"); s.setAttribute("class", "staff"); s.setAttribute("role", "img"); return s; }

  // Ses kalitesi: netlik ve ses gücü dengesi (skills.js toneQuality)
  const toneKv = tq => tq ? `<div><span class="label">${L("Ses temizliği", "Tone clarity")}</span>%${tq.clarity}</div><div><span class="label">${L("Ses gücü dengesi", "Volume steadiness")}</span>%${tq.steadiness}</div>` : "";
  const toneTips = tq => tq ? tq.tips.map(t => pick(t, LANG)).join(" ") : "";

  // ======== Sekmeler: drills.js, trainers.js, pieces.js, lessonview.js ========
  // Dizi ve Taklit aynı makamı, Dizi ile derslerin makam adımları aynı "çalışıldı" kaydını paylaşır
  const makamState = { cur: makamById(store.get("makam", "rast")) || MAKAMS[0], done: store.get("makam.done", {}) };
  const ctx = { SK, $, store, T, nn, num, sgn, esc, sleep, label, perdeOf, tgt, mkFreq, commaFreq, hit, needMic, holder,
    miniChart, paintMini, staffSvg, toneKv, toneTips, markScale, days, intStats, paintHeat, goalText, makamState,
    droneOn: c => { setDrone(c); if(!drone) startDrone(); },
    selectTab: id => selectTab(id, true),
    setPlaybackMute: v => { playbackMute = v; },
    markResetting: () => { resetting = true; } };
  TABS.forEach(([id]) => { modules[id] = TRAINERS[id](ctx); });

  // Açıklamalar telefonda kısalır; "devamı" ile açılır
  root.querySelectorAll(".ppanel > .pdesc").forEach(p => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "linkbtn pmore"; b.hidden = true;
    b.textContent = L("devamı", "more");
    b.addEventListener("click", () => {
      const open = p.classList.toggle("open");
      b.textContent = open ? L("kısalt", "less") : L("devamı", "more");
    });
    p.after(b); descs.push([p, b]);
  });

  // Ana ekran kısayolu (?tab=rhythm) alıştırmayı doğrudan açar; yoksa ana sayfa
  const qtab = new URLSearchParams(location.search).get("tab");
  if(TABS.some(([t]) => t === qtab)){
    selectTab(qtab);
    if(history.state && history.state.view === "practice") history.replaceState({ ...history.state, ex:qtab }, "");
  }else showHub();
})();
