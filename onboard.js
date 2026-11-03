// İlk açılış: karşılama, dil, çalgı, seviye (nereden başlanacağı), mikrofon ve ortam gürültüsü, çalma sınaması
// (biraz çalabilenler için, isteğe bağlı), günlük hedef.
// Bitince seçimler kaydedilir ve sayfa yeniden yüklenir (dersler ve ayarlar yeni değerlerle açılır).
// Ayarlar'daki "Karşılamayı yeniden aç" ile tekrar gösterilebilir.
(function(){
  const SK = window.SK;
  if(!SK) return;
  const store = SK.store;
  const root = document.getElementById("onboard");
  // Çalma sınaması yalnızca başlangıcı geçenlere (biraz çalabiliyorum / makam çalışıyorum) sorulur
  const stepList = () => pickd.level && pickd.level !== "new" ? ["hello", "inst", "level", "mic", "check", "goal"] : ["hello", "inst", "level", "mic", "goal"];
  const pickd = { lang: LANG, inst: store.get("inst", "sol"), level: null, goal: store.get("goal.min", 15), sens: null };
  let i = 0, steps = stepList();

  // ---- Çalma sınaması ----
  // Notalar gruplar hâlinde sırayla gösterilir; her biri toplam 1,2 sn tutulunca geçilir. "Çalamıyorum" sınamayı
  // bitirir. Baştan itibaren eksiksiz geçilen grupların dersleri bitmiş sayılır. Yalnızca notanın çıkıp çıkmadığı
  // ölçülür; ses kalitesi ve akort ölçülmez (dersler ölçer).
  const CHECK = [
    { name: () => L("Pes ve orta ses", "Low and middle register"), notes: [67, 62, 60, 55, 52], lessons: ["sol-el-1", "sol-el-2", "sag-el", "pes"] },
    { name: () => L("Boğaz notaları", "Throat tones"), notes: [69, 70], lessons: ["bogaz"] },
    { name: () => L("Register geçişi", "Crossing the break"), notes: [71, 72, 74], lessons: ["register"] },
    { name: () => L("Klarino", "Clarion"), notes: [79, 84], lessons: ["klarino"] }
  ];
  const CHECK_NOTES = CHECK.flatMap((g, gi) => g.notes.map(w => ({ w, gi })));
  const HOLD_MS = 1200;
  // state: intro | run | done; k: sıradaki nota; held: tutulan süre (ms); passed: geçilen grup sayısı
  const chk = { state: "intro", k: 0, held: 0, lastT: 0, passed: 0, heard: null };
  const chkReset = () => Object.assign(chk, { state: "intro", k: 0, held: 0, lastT: 0, passed: 0, heard: null });
  const nm = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
  const instT = () => (INSTRUMENTS.find(x => x.id === pickd.inst) || { t: SK.T }).t;
  function chkAdvance(ok){
    const cur = CHECK_NOTES[chk.k];
    if(!ok){ chk.state = "done"; render(); return; }
    chk.k++; chk.held = 0; chk.lastT = 0; chk.heard = null;
    const next = CHECK_NOTES[chk.k];
    if(!next || next.gi !== cur.gi) chk.passed = cur.gi + 1;
    if(!next) chk.state = "done";
    render();
  }
  // Kararlı nota olayları (app.js): yazılı nota seçilen klarnete göre yeniden hesaplanır (çalgı henüz kaydedilmedi)
  SK.on("note", ({ t, r }) => {
    if(root.hidden || steps[i] !== "check" || chk.state !== "run") return;
    const w = r.written - SK.T + instT(), want = CHECK_NOTES[chk.k].w;
    chk.heard = w;
    if(w === want){ if(chk.lastT) chk.held += Math.min(120, t - chk.lastT); chk.lastT = t; }
    else chk.lastT = 0;
    const bar = root.querySelector("#obhold"), heard = root.querySelector("#obheard");
    if(bar) bar.style.width = Math.min(100, chk.held/HOLD_MS*100) + "%";
    if(heard) heard.textContent = L("Duyulan: ", "Heard: ") + nm(w) + (w === want ? " ✓" : "");
    if(chk.held >= HOLD_MS) chkAdvance(true);
  });
  SK.on("silence", () => { chk.lastT = 0; });
  function checkBody(){
    if(chk.state === "intro") return `<div class="obemo" aria-hidden="true">🎶</div>
      <h2 class="obtitle">${L("Kısa çalma sınaması", "A short playing check")}</h2>
      <p>${L("Sırayla en çok " + CHECK_NOTES.length + " nota göstereceğiz, pesten tize. Her birini 1–2 saniye düz tut. Çalamadığın notada \"Çalamıyorum\"a bas: sınama orada biter, o noktaya kadarki dersler bitmiş sayılır, gerisini derslerle adım adım çalışırsın.",
        "We'll show up to " + CHECK_NOTES.length + " notes, low to high. Hold each one steadily for 1–2 seconds. Tap \"I can't play it\" on a note you can't play: the check stops there, the lessons up to that point count as done, and you work through the rest step by step.")}</p>
      <p class="muted">${L("Yalnızca notanın çıkıp çıkmadığına bakılır; ses kalitesi ve akort burada ölçülmez, derslerde ölçülür. İstemezsen geçebilirsin.", "This only checks whether the note sounds; tone and tuning aren't measured here but in the lessons. You can skip it.")}</p>
      <div class="pbar"><button class="primary small" type="button" data-ob="chkstart">${L("Sınamayı başlat", "Start the check")}</button></div>
      <div class="muted" id="obcal"></div>`;
    if(chk.state === "run"){
      const cur = CHECK_NOTES[chk.k], g = CHECK[cur.gi];
      return `<div class="eyebrow">${g.name()} · ${chk.k + 1}/${CHECK_NOTES.length}</div>
        <h2 class="obtitle">${L("Bu notayı tut: ", "Hold this note: ")}${nm(cur.w)}</h2>
        <div class="obstaff"></div>
        <div class="obholdbar" aria-hidden="true"><i id="obhold" style="width:${Math.min(100, chk.held/HOLD_MS*100)}%"></i></div>
        <div class="muted" id="obheard" aria-live="polite">${chk.heard != null ? L("Duyulan: ", "Heard: ") + nm(chk.heard) : L("Dinliyor…", "Listening…")}</div>
        <div class="pbar"><button class="stopbtn" type="button" data-ob="chkplay">${L("Dinle", "Listen")}</button>
          <button class="stopbtn" type="button" data-ob="chkfail">${L("Çalamıyorum", "I can't play it")}</button></div>`;
    }
    const res = CHECK.map((g, gi) => `<li>${gi < chk.passed ? "✓" : "–"} ${g.name()}</li>`).join("");
    let advice;
    if(chk.passed === CHECK.length) advice = L("Temeller ve klarino derslerini bitmiş saydık. Teknik ve üslup ile makam dersleri açık; yol haritası seni oradan götürür.", "We've marked the basics and clarion lessons as done. Technique and style and the makam lessons are open; the roadmap takes you on from there.");
    else if(chk.passed > 0) advice = L("Geçtiğin grupların derslerini bitmiş saydık. \"" + CHECK[chk.passed].name() + "\" dersinden başlayacaksın.", "We've marked the lessons for the groups you passed as done. You'll start with \"" + CHECK[chk.passed].name() + "\".");
    else if(chk.k <= 1) advice = L("İlk notalarda zorlandın: Başlarken ünitesinden (kamış, ağızlık, ilk ses) başlamanı öneririz.", "The first notes were hard: we suggest starting with the Getting started unit (reed, embouchure, first sound).");
    else advice = L("Temeller ünitesinden başlayacaksın; çalabildiğin notaları orada hızla geçersin.", "You'll start with the Basics unit and get through the notes you can already play quickly.");
    return `<div class="obemo" aria-hidden="true">🧭</div>
      <h2 class="obtitle">${L("Sınama bitti", "Check finished")}</h2>
      <ul class="obres">${res}</ul>
      <p>${advice}</p>
      ${chk.passed === 0 && chk.k <= 1 ? `<div class="pbar"><button class="stopbtn" type="button" data-ob="chknew">${L("Başlarken'den başla", "Start from Getting started")}</button></div>` : ""}
      <p class="muted">${L("Sınamayı Ayarlar'daki \"Karşılamayı yeniden aç\" ile tekrarlayabilirsin.", "You can redo the check from Settings by reopening the welcome.")}</p>`;
  }

  function open(){ i = 0; chkReset(); root.hidden = false; document.body.classList.add("modal"); render(); root.querySelector("button").focus(); }
  function close(){ root.hidden = true; document.body.classList.remove("modal"); }

  const dots = () => `<div class="obdots" aria-hidden="true">${steps.map((_, k) => `<i class="${k === i ? "on" : k < i ? "done" : ""}"></i>`).join("")}</div>`;
  // later: ileri düğmesi "Şimdilik geç" olarak ikincil görünür (mikrofon ölçülmeden geçilirken)
  const nav = (next = L("Devam", "Next"), later = false) => `<div class="obnav">${i ? `<button class="stopbtn" type="button" data-ob="back">${L("Geri", "Back")}</button>` : "<span></span>"}
    <button class="${later ? "stopbtn" : "primary small"}" type="button" data-ob="next" ${steps[i] === "level" && !pickd.level ? "disabled" : ""}>${later ? L("Şimdilik geç", "Not now") : next}</button></div>`;

  function render(){
    const s = steps[i];
    let body = "";
    const emo = e => `<div class="obemo" aria-hidden="true">${e}</div>`;
    if(s === "hello") body = `
      <div class="obhero">${ART.photo("klarnet", "obphoto")}</div>
      <div class="eyebrow">${L("Hoş geldin", "Welcome")}</div>
      <h2 class="obtitle">${L("Sol klarneti sıfırdan ustalığa", "The G clarinet, from zero to mastery")}</h2>
      <p>${L("Bu uygulama çaldığını mikrofondan dinler: perdeni koma koma ölçer, parmak pozisyonunu gösterir, ritmini, ses kaliteni ve makam seyrini değerlendirir. " + LESSONS.length + " derslik müfredat klarneti ilk kez eline alan birini taksim yapabilecek seviyeye kadar götürür.",
        "This app listens to you through the microphone: it measures your pitch comma by comma, shows the fingering, and assesses your rhythm, tone and makam seyir. The " + LESSONS.length + "-lesson course takes someone who has never held a clarinet all the way to playing a taksim.")}</p>
      <p class="muted">${L("Ses yalnızca cihazında işlenir, hiçbir yere gönderilmez.", "Audio is processed only on your device and never sent anywhere.")}</p>
      <div class="seg" role="radiogroup" aria-label="${L("Dil", "Language")}">
        <button type="button" role="radio" data-lang="tr" aria-checked="${pickd.lang === "tr"}">Türkçe</button>
        <button type="button" role="radio" data-lang="en" aria-checked="${pickd.lang === "en"}">English</button>
      </div>`;
    if(s === "inst") body = `<div class="obemo obemo-photo" aria-hidden="true">${ART.photo("agizlik", "")}</div>
      <h2 class="obtitle">${L("Hangi klarneti çalıyorsun?", "Which clarinet do you play?")}</h2>
      <p>${L("Türk müziğinde en yaygını Sol klarnettir. Yazılı nota ve perde adları seçtiğin klarnete göre hesaplanır.", "The G clarinet is the most common in Turkish music. Written notes and perde names are computed for the clarinet you choose.")}</p>
      <div class="oblist">${INSTRUMENTS.map(x => `<button type="button" class="obopt" data-inst="${x.id}" aria-pressed="${pickd.inst === x.id}"><strong>${x.name}</strong><span>${x.t ? L("yazılı nota duyulan sesin ", "written note is ") + Math.abs(x.t) + L(" yarım ses " + (x.t > 0 ? "üstü" : "altı"), " semitones " + (x.t > 0 ? "above" : "below") + " the sound") : L("yazıldığı gibi duyulur", "sounds as written")}</span></button>`).join("")}</div>`;
    if(s === "level") body = `${emo("🧭")}
      <h2 class="obtitle">${L("Nereden başlayalım?", "Where should we start?")}</h2>
      <div class="oblist">
        <button type="button" class="obopt" data-level="new" aria-pressed="${pickd.level === "new"}"><i class="obicon" aria-hidden="true">🌱</i><strong>${L("Hiç çalmadım", "I've never played")}</strong><span>${L("Klarneti tanıma, duruş, nefes, nota okuma ve ritimle başla.", "Start with the instrument, posture, breathing, reading music and rhythm.")}</span></button>
        <button type="button" class="obopt" data-level="some" aria-pressed="${pickd.level === "some"}"><i class="obicon" aria-hidden="true">🎵</i><strong>${L("Biraz çalabiliyorum", "I can play a little")}</strong><span>${L("Başlangıç bilgilerini geç, ilk notalardan başla; bildiğin dersleri hızla geçersin.", "Skip the introduction and start with the first notes; you'll get through what you know quickly.")}</span></button>
        <button type="button" class="obopt" data-level="makam" aria-pressed="${pickd.level === "makam"}"><i class="obicon" aria-hidden="true">🎼</i><strong>${L("Makam çalışıyorum", "I already play makams")}</strong><span>${L("Bütün dersler açılır; akort ekranında makam seçip icra akordunu kullanabilirsin.", "All lessons are unlocked; pick a makam on the tuner and use practice tuning.")}</span></button>
      </div>`;
    if(s === "mic") body = `${emo("🎤")}
      <h2 class="obtitle">${L("Mikrofon ve oda", "Microphone and room")}</h2>
      <p>${L("Mikrofon iznini ver; sonra 3 saniye sessiz kal, oda gürültüsü ölçülsün ve hassasiyet ona göre ayarlansın.", "Allow the microphone; then stay quiet for 3 seconds so the room noise can be measured and the sensitivity set.")}</p>
      <div class="pbar"><button class="primary small" type="button" data-ob="calib">${L("İzin ver ve ölç", "Allow and measure")}</button></div>
      <div class="muted" id="obcal">${pickd.sens ? L("Hassasiyet ", "Sensitivity ") + pickd.sens + L(" olarak ayarlandı.", " set.") : ""}</div>
      <p class="muted">${L("İpucu: telefonu nota sehpasına, klarnetin çanına 50 cm–1 m uzağa koy. Uygulamanın çaldığı sesleri (metronom, örnek ezgiler) kulaklıkla dinlersen ölçüm daha temiz olur. Mikrofonu sonra da açabilirsin.", "Tip: put the phone on a music stand 50 cm–1 m from the bell. Listening to the app's sounds (metronome, examples) on headphones gives cleaner measurements. You can turn the microphone on later too.")}</p>`;
    if(s === "goal") body = `${emo("🎯")}
      <h2 class="obtitle">${L("Günlük hedefin", "Your daily goal")}</h2>
      <p>${L("Kısa ama her gün çalışmak, seyrek uzun çalışmaktan çok daha etkilidir. Seri, en az 1 dakika çaldığın her gün artar.", "Short daily practice beats long, rare sessions. Your streak grows every day you play at least a minute.")}</p>
      <div class="seg" role="radiogroup" aria-label="${L("Günlük hedef", "Daily goal")}">${[10, 15, 20, 30, 45].map(m => `<button type="button" role="radio" data-goal="${m}" aria-checked="${pickd.goal === m}">${m} ${L("dk", "min")}</button>`).join("")}</div>`;
    if(s === "check") body = checkBody();
    const later = (s === "mic" && !pickd.sens) || (s === "check" && chk.state !== "done");
    root.querySelector(".obcard").innerHTML = dots() + body + nav(i === steps.length - 1 ? L("Başla", "Start") : L("Devam", "Next"), later);
    const st = root.querySelector(".obstaff");
    if(st){
      const sv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      sv.setAttribute("viewBox", "0 0 150 108"); sv.setAttribute("class", "staff"); sv.setAttribute("role", "img");
      SK.drawStaffInto(sv, CHECK_NOTES[chk.k].w); st.appendChild(sv);
    }
  }

  root.addEventListener("click", async e => {
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.lang){ pickd.lang = b.dataset.lang; if(b.dataset.lang !== LANG){ store.set("lang", b.dataset.lang); store.set("onboard.resume", true); location.reload(); } return; }
    if(b.dataset.inst){ pickd.inst = b.dataset.inst; render(); return; }
    if(b.dataset.level){ pickd.level = b.dataset.level; steps = stepList(); render(); return; }
    if(b.dataset.goal){ pickd.goal = +b.dataset.goal; render(); return; }
    const act = b.dataset.ob;
    if(act === "back"){ if(steps[i] === "check") chkReset(); i = Math.max(0, i - 1); render(); return; }
    if(act === "chkstart"){
      if(!SK.isListening()) await SK.startMic();
      if(!SK.isListening()){ root.querySelector("#obcal").textContent = L("Mikrofon açılamadı. İzin verip yeniden dene ya da sınamayı geç.", "Couldn't open the microphone. Allow it and try again, or skip the check."); return; }
      chk.state = "run"; render(); return;
    }
    if(act === "chkplay"){ SK.play(CHECK_NOTES[chk.k].w); return; }
    if(act === "chkfail"){ chkAdvance(false); return; }
    if(act === "chknew"){ pickd.level = "new"; chkReset(); steps = stepList(); i = steps.indexOf("goal"); render(); return; }
    if(act === "calib"){
      const msg = root.querySelector("#obcal");
      await SK.startMic();
      if(!SK.isListening()){ msg.textContent = L("Mikrofon açılamadı. Tarayıcı ya da telefon ayarlarından izin verip yeniden dene.", "Couldn't open the microphone. Allow it in the browser or phone settings and try again."); return; }
      msg.textContent = L("Ölçülüyor… sessiz kal.", "Measuring… stay quiet.");
      const vals = []; const off = SK.level(f => vals.push(f.rms));
      await new Promise(r => setTimeout(r, 3000)); off();
      vals.sort((a, c) => a - c);
      const noise = vals.length ? vals[Math.floor(vals.length*0.9)] : 0.002, thr = Math.max(0.0015, noise*2.5);
      pickd.sens = Math.round(Math.min(10, Math.max(1, 1 + 9*Math.log(thr/0.03)/Math.log(0.002/0.03))));
      const done = L("Hazır. Hassasiyet ", "Done. Sensitivity ") + pickd.sens + (pickd.sens <= 2 ? L(" (oda gürültülü; daha sessiz bir yer daha iyi olur).", " (noisy room; a quieter place would help).") : ".");
      render(); root.querySelector("#obcal").textContent = done;          // "Şimdilik geç" yerine "Devam"
      return;
    }
    if(act === "next"){
      if(i < steps.length - 1){ i++; render(); return; }
      finish();
    }
  });

  // Dersin bütün adımlarını geçilmiş say (okuma adımları 1, ölçülenler geçme eşiğiyle). Okuma dışındaki adımlar da
  // geçilmiş sayılır: bilen biri bunlarda takılmasın. placed: çalınmadan geçildi (karşılamada atlandı ya da sınamayla)
  function markDone(prog, l, placed){
    const p = prog[l.id] || (prog[l.id] = { s:{} });
    l.steps.forEach((st, k) => { if(!(p.s[k] && p.s[k].ok)) p.s[k] = { v: st.type === "read" ? 1 : st.type === "notes" ? 0 : (st.min || st.n || 1), ok:true }; });
    p.d = p.d || dayKey(new Date());
    if(placed) p.placed = true;
  }
  // Seviyeye göre ders ilerlemesini kur: başlangıç ünitesi (ve isteğe göre her şey) açılır
  function finish(){
    store.set("inst", pickd.inst);
    store.set("goal.min", pickd.goal);
    if(pickd.sens) store.set("sens", pickd.sens);
    const prog = store.get("lesson.prog", {});
    if(pickd.level === "some" || pickd.level === "makam"){
      for(const l of LESSONS.filter(x => x.unit === "baslangic")){
        markDone(prog, l, true);
      }
      // Çalma sınamasında baştan eksiksiz geçilen grupların dersleri
      CHECK.slice(0, chk.passed).forEach(g => g.lessons.forEach(id => { const l = lessonById(id); if(l) markDone(prog, l, true); }));
      // Dersleri bütünüyle geçilen ünitenin sınavı da geçilmiş sayılır (rehberli ilerlemede sonraki ünite açılsın)
      for(const u of UNITS){ const ex = examFor(u.id);
        if(ex && LESSONS.filter(l => l.unit === u.id).every(l => lessonDone(l, prog))) markDone(prog, ex, true); }
      store.set("lesson.prog", prog);
      if(chk.state === "done") store.set("onboard.check", { passed: chk.passed, of: CHECK.length, d: dayKey(new Date()) });
    }
    if(pickd.level === "makam") store.set("lesson.all", true);
    store.set("lesson.cur", "");
    store.set("nav.sec", "lessons");
    store.set("nav.lroot", "lessons");
    store.set("onboard.done", true);
    store.set("onboard.resume", false);
    window.SK_RESETTING = true;
    location.reload();
  }

  // Ayarlar'dan yeniden açma
  const again = document.getElementById("obagain");
  if(again) again.addEventListener("click", () => { store.set("onboard.done", false); open(); });
  root.addEventListener("keydown", e => { if(e.key === "Escape" && store.get("onboard.done", false)) close(); });

  // İlk açılışta (ya da dil değişince kaldığı yerden) göster. Eski kullanıcılar (ilerlemesi olan) atlanır.
  const played = Object.values(store.get("days", {})).reduce((a, b) => a + b, 0);
  const hasHistory = Object.keys(store.get("lesson.prog", {})).length > 0 || played > 120;
  if(store.get("onboard.resume", false)){ open(); i = 1; render(); }
  else if(!store.get("onboard.done", false) && !hasHistory) open();
  else if(!store.get("onboard.done", false)) store.set("onboard.done", true);
})();
