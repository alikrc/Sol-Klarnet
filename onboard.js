// İlk açılış: karşılama, dil, çalgı, seviye (nereden başlanacağı), mikrofon ve ortam gürültüsü, çalma sınaması
// (biraz çalabilenler için, isteğe bağlı; makam çalışana sonunda makam turları), günlük hedef.
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
  let i = 0, steps = stepList(), remeasure = false;      // remeasure: "Seviyemi yeniden ölç" ile açıldı

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
  // Önce nota okuma: dizekte 4 nota, adı seçilir (mikrofonsuz). 3'ten azı doğruysa Başlarken'in "Nota okuma" dersi
  // bitmiş sayılmaz (kulaktan çalan ama okuyamayan biri o dersi atlamasın)
  const READ = [64, 69, 72, 77], SYL = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"], READ_OK = 3;
  const sylOf = w => noteName(w).tr.replace(/[♯♭\d]/g, "");
  const readChoices = (w, k) => { const c = sylOf(w), o = SYL.filter(x => x !== c); return [c, o[(k*2) % 6], o[(k*2 + 3) % 6], o[(k*2 + 5) % 6]].sort((a, b) => ((a.length*7 + k) % 5) - ((b.length*7 + k) % 5) || a.localeCompare(b)); };
  // Notalardan sonra ritim: metronomla iki kısa tur, Başlarken'in "Ritim" dersinin ilk ve son adımıyla aynı tempo ve
  // geçme eşiği. Ölçülen bir tur eşiğin altındaysa o ders bitmiş sayılmaz (kart onu önerir); geçilmeyen tur karar vermez
  const RT = [{ pattern: "quarter", tempo: 60, bars: 4, min: 55 }, { pattern: "eighth", tempo: 60, bars: 4, min: 50 }];
  // Ritimden sonra makam, yalnız "Makam çalışıyorum" diyene ve notaları hiç çıkmamış olmayana: iki dizi ve kısa bir seyir.
  // Adımlar derslerin kendi değerlendiricileridir (SK.stepTry); dizi eşiği dersten gelir, seyir eşiği Taksim 2'nin Hicaz
  // adımıyla aynı, süresi kısa. Kural (Uzman görmeli, docs/BACKLOG.md 1.A): turlar sırayla gider, eşiğin altında kalan tur
  // bölümü bitirir, baştan geçilen turların dersleri bitmiş sayılır. Rast dizisi: Rast beşlisi ve Rast. Uşşak dizisi: Uşşak.
  // Hicaz seyri (iki dizi de geçildiyse): Hicaz ve zincirde ondan önceki Hüseynî; Hüseynî ayrıca ölçülmüyor, dizisi Uşşak'a
  // yakın diye sayılıyor. Geçilmeyen tur karar vermez; ölçülüp tutmayan turun önceki sınamadan kalan (placed) kaydı silinir.
  // Bu dersler Makamlar ünitesinin tamamı değil: ünite sınavı geçilmiş sayılmaz, İleri'nin kapısı (Makam sınavı) açılmaz
  const scaleOf = id => lessonById(id).steps.find(s => s.type === "scale");
  const MK = [
    { name: () => L("Rast dizisi", "Rast scale"), step: () => scaleOf("rast"), lessons: ["rast-giris", "rast"] },
    { name: () => L("Uşşak dizisi", "Uşşak scale"), step: () => scaleOf("ussak"), lessons: ["ussak"] },
    { name: () => L("Hicaz seyri", "Hicaz seyir"), step: () => ({ type: "seyir", makam: "hicaz", sec: 40, min: 60 }), lessons: ["huseyni", "hicaz"] }
  ];
  // state: intro | read | run | rhythm | rtrun | makam | mkrun | done; rq/rok: okuma sorusu ve doğru sayısı; rts: ritim
  // turlarının puanı; rtFresh: sıradaki turun giriş ekranı gösterilsin (önceki turun puanı yerine); mks: makam turlarının
  // sonucu (dizide 0–1, seyirde 0–100); mkStage: adımın ekranı, render'lar arasında korunur (sonuç ve öneriler orada kalır)
  const chk = { state: "intro", k: 0, held: 0, lastT: 0, passed: 0, heard: null, rq: 0, rok: 0, rts: [], rtBeat: null, rtRun: null, rtFresh: false, mks: [], mkRun: null, mkFresh: false, mkStage: null };
  const rtStop = () => { if(chk.rtRun){ chk.rtRun.stop(); chk.rtRun = null; } };
  const mkStop = () => { if(chk.mkRun){ chk.mkRun.stop(); chk.mkRun = null; } };
  const chkReset = () => { rtStop(); mkStop(); Object.assign(chk, { state: "intro", k: 0, held: 0, lastT: 0, passed: 0, heard: null, rq: 0, rok: 0, rts: [], rtBeat: null, rtFresh: false, micErr: false, mks: [], mkFresh: false, mkStage: null }); };
  const readOk = () => chk.rq < READ.length || chk.rok >= READ_OK;   // okuma bölümü bitmediyse karar yok
  const rhythmOk = () => chk.rts.every((v, k) => v >= RT[k].min);   // çalınmayan tur karar vermez
  const mkWanted = () => pickd.level === "makam" && chk.passed > 0;
  const mkOk = k => chk.mks[k] >= MK[k].step().min;
  const mkPassed = () => { let n = 0; while(n < chk.mks.length && mkOk(n)) n++; return n; };
  const mkShow = k => MK[k].step().type === "scale" ? "%" + Math.round(chk.mks[k]*100) : chk.mks[k];
  const nm = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
  const instT = () => (INSTRUMENTS.find(x => x.id === pickd.inst) || { t: SK.T }).t;
  async function runMic(){
    if(!SK.isListening()) await SK.startMic();
    chk.micErr = !SK.isListening();
    render();
  }
  function chkAdvance(ok){
    const cur = CHECK_NOTES[chk.k];
    if(!ok){ chk.state = "rhythm"; render(); return; }
    chk.k++; chk.held = 0; chk.lastT = 0; chk.heard = null;
    const next = CHECK_NOTES[chk.k];
    if(!next || next.gi !== cur.gi) chk.passed = cur.gi + 1;
    if(!next) chk.state = "rhythm";
    render();
  }
  // Kararlı nota olayları (app.js): yazılı nota seçilen klarnete göre yeniden hesaplanır (çalgı henüz kaydedilmedi)
  SK.on("note", ({ t, r }) => {
    if(chk.mkRun){ const d = instT() - SK.T; chk.mkRun.note(d ? { ...r, written: r.written + d, comma: r.comma + d*53/12 } : r, t); return; }
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
  SK.on("silence", ({ t }) => { chk.lastT = 0; if(chk.mkRun) chk.mkRun.silence(t); });
  function checkBody(){
    if(chk.state === "intro") return `<div class="obemo" aria-hidden="true">🎶</div>
      <h2 class="obtitle">${L("Kısa çalma sınaması", "A short playing check")}</h2>
      <p>${L("Önce dizekte 4 notanın adını soracağız. Sonra sırayla en çok " + CHECK_NOTES.length + " nota göstereceğiz, pesten tize. Her birini 1–2 saniye düz tut. Çalamadığın notada \"Çalamıyorum\"a bas: notalar orada biter, o noktaya kadarki dersler bitmiş sayılır, gerisini derslerle adım adım çalışırsın.",
        "First we'll ask the names of 4 notes on the staff. Then we'll show up to " + CHECK_NOTES.length + " notes, low to high. Hold each one steadily for 1–2 seconds. Tap \"I can't play it\" on a note you can't play: the notes stop there, the lessons up to that point count as done, and you work through the rest step by step.")}</p>
      <p>${L("En sonda metronomla iki kısa ritim turu çalacaksın (yaklaşık 20'şer saniye).", "Finally you'll play two short rhythm rounds with the metronome (about 20 seconds each).")}</p>
      ${pickd.level === "makam" ? `<p>${L("Makam çalıştığın için sonunda Rast ve Uşşak dizilerini ve kısa bir Hicaz seyrini de soracağız.", "Since you play makams, at the end we'll also ask for the Rast and Uşşak scales and a short Hicaz seyir.")}</p>` : ""}
      <p class="muted">${L("Yalnızca notanın çıkıp çıkmadığına bakılır; ses kalitesi ve akort burada ölçülmez, derslerde ölçülür. İstemezsen geçebilirsin.", "This only checks whether the note sounds; tone and tuning aren't measured here but in the lessons. You can skip it.")}</p>
      <div class="pbar"><button class="primary small" type="button" data-ob="chkstart">${L("Sınamayı başlat", "Start the check")}</button></div>`;
    if(chk.state === "read"){
      const w = READ[chk.rq];
      return `<div class="eyebrow">${L("Nota okuma", "Reading")} · ${chk.rq + 1}/${READ.length}</div>
        <h2 class="obtitle">${L("Bu nota hangisi?", "Which note is this?")}</h2>
        <div class="obstaff"></div>
        <div class="seg obread" role="group" aria-label="${L("Nota adı", "Note name")}">${readChoices(w, chk.rq).map(c => `<button type="button" data-read="${c}">${c}</button>`).join("")}</div>`;
    }
    if(chk.state === "run"){
      const cur = CHECK_NOTES[chk.k], g = CHECK[cur.gi];
      return `<div class="eyebrow">${g.name()} · ${chk.k + 1}/${CHECK_NOTES.length}</div>
        <h2 class="obtitle">${L("Bu notayı tut: ", "Hold this note: ")}${nm(cur.w)}</h2>
        <div class="obstaff"></div>
        <div class="obholdbar" aria-hidden="true"><i id="obhold" style="width:${Math.min(100, chk.held/HOLD_MS*100)}%"></i></div>
        <div class="muted" id="obheard" aria-live="polite">${chk.micErr ? L("Mikrofon açılamadı. İzin verip yeniden dene ya da sınamayı geç.", "Couldn't open the microphone. Allow it and try again, or skip the check.") + ` <button class="stopbtn small" type="button" data-ob="chkmic">${L("Yeniden dene", "Try again")}</button>`
          : chk.heard != null ? L("Duyulan: ", "Heard: ") + nm(chk.heard) : L("Dinliyor…", "Listening…")}</div>
        <div class="pbar"><button class="stopbtn" type="button" data-ob="chkplay">${L("Dinle", "Listen")}</button>
          <button class="stopbtn" type="button" data-ob="chkfail">${L("Çalamıyorum", "I can't play it")}</button></div>`;
    }
    if(chk.state === "rhythm" || chk.state === "rtrun"){
      const n = chk.rts.length, head = `<div class="eyebrow">${L("Ritim", "Rhythm")} · ${Math.min(n + (chk.state === "rtrun" || !n || chk.rtFresh ? 1 : 0), RT.length)}/${RT.length}</div>`;
      if(chk.state === "rtrun"){
        const pat = RHYTHM_PATTERNS.find(p => p.id === RT[n].pattern);
        return head + `<h2 class="obtitle">${pick(pat.name, LANG)}</h2>
          <div class="qname obbeat">${chk.rtBeat == null ? "…" : chk.rtBeat}</div>
          <p class="muted">${L("İlk ölçü sayım: dinle, ikinci ölçüde çalmaya başla.", "The first bar is a count-in: listen, start playing on the second bar.")}</p>`;
      }
      if(!n || chk.rtFresh){
        const r = RT[n], pat = RHYTHM_PATTERNS.find(p => p.id === r.pattern);
        return head + `<h2 class="obtitle">${L("Metronomla çal", "Play with the metronome")}</h2>
          <p>${L("Açık Sol'u (ya da rahat bir notayı) metronomla birlikte kısa kısa çal: ", "Play open G (or any comfortable note) in short notes with the metronome: ")}<strong>${pick(pat.name, LANG)}</strong>, ${r.tempo} ${L("vuruş/dk", "bpm")}, ${r.bars} ${L("ölçü", "bars")}. ${L("İlk ölçü sayımdır.", "The first bar is a count-in.")}</p>
          <p class="muted">${L("Mümkünse kulaklık tak: hoparlördeki metronom sesi nota sanılabilir.", "Use headphones if you can: the metronome from the speaker can be mistaken for your notes.")}</p>
          ${chk.micErr ? `<p class="muted">${L("Mikrofon açılamadı. İzin verip yeniden dene ya da ritmi geç.", "Couldn't open the microphone. Allow it and try again, or skip the rhythm.")}</p>` : ""}
          <div class="pbar"><button class="primary small" type="button" data-ob="rtgo">${L("Başlat", "Start")}</button>
            <button class="stopbtn" type="button" data-ob="rtskip">${L("Ritmi geç", "Skip the rhythm")}</button></div>`;
      }
      const last = chk.rts[n - 1], min = RT[n - 1].min, more = n < RT.length;
      return head + `<h2 class="obtitle">${L("Puan: ", "Score: ")}${last}</h2>
        <p>${last >= min ? L("Güzel, bu tur tamam.", "Good, this round is done.") : L("Geçme puanı " + min + ". İstersen bir kez daha dene.", "The pass mark is " + min + ". Try once more if you like.")}</p>
        <div class="pbar"><button class="primary small" type="button" data-ob="${more ? "rtnext" : "rtend"}">${more ? L("Sonraki tur", "Next round") : mkWanted() ? L("Makama geç", "On to makam") : L("Sonucu gör", "See the result")}</button>
          <button class="stopbtn" type="button" data-ob="rtagain">${L("Yeniden dene", "Try again")}</button></div>`;
    }
    if(chk.state === "makam" || chk.state === "mkrun"){
      const n = chk.mks.length, fresh = !n || chk.mkFresh, run = chk.state === "mkrun";
      const head = `<div class="eyebrow">${L("Makam", "Makam")} · ${Math.min(n + (run || fresh ? 1 : 0), MK.length)}/${MK.length}</div>`;
      if(run) return head + `<h2 class="obtitle">${MK[n].name()}</h2>
        <div class="obmkslot"></div>
        <div class="pbar"><button class="stopbtn" type="button" data-ob="mkfail">${L("Çalamıyorum", "I can't play it")}</button></div>`;
      if(fresh){
        const st = MK[n].step();
        return head + `<h2 class="obtitle">${MK[n].name()}</h2>
          <p>${st.type === "scale" ? L("Diziyi çık ve in: ekranda sıradaki perdeyi yarım saniye kadar tut, sonra diğerine geç. ±1 koma içindeki perdeler sayılır, geçme oranı %" + Math.round(st.min*100) + ".", "Play the scale up and down: hold the next perde on screen for about half a second, then move on. Perdes within ±1 comma count; the pass rate is " + Math.round(st.min*100) + "%.")
            : L("Hicaz makamında en çok " + st.sec + " saniyelik kısa bir seyir çal ve durakta bitir; erken bitirdiysen \"Bitir\"e bas. Geçme puanı " + st.min + ".", "Play a short seyir in makam Hicaz of up to " + st.sec + " seconds and end on the final; tap \"Finish\" if you end early. The pass mark is " + st.min + ".")}</p>
          <p class="muted">${st.type === "scale" ? L("Perdeler Akort ekranında seçili akorda (AEU ya da icra) göre ölçülür.", "Perdes are measured against the tuning set on the Tuner (AEU or practice tuning).")
            : L("Yalnızca dizide kalmaya, güçlüye, açılışa ve durakta bitişe bakılır; ezginin güzelliği ölçülmez.", "Only staying in the scale, the dominant, the opening and ending on the final are checked, not how beautiful the melody is.")}</p>
          ${chk.micErr ? `<p class="muted">${L("Mikrofon açılamadı. İzin verip yeniden dene ya da makamı geç.", "Couldn't open the microphone. Allow it and try again, or skip the makam part.")}</p>` : ""}
          <div class="pbar"><button class="primary small" type="button" data-ob="mkgo">${L("Başlat", "Start")}</button>
            <button class="stopbtn" type="button" data-ob="mkskip">${L("Makamı geç", "Skip the makam part")}</button></div>`;
      }
      const ok = mkOk(n - 1), more = ok && n < MK.length;
      return head + `<h2 class="obtitle">${L("Puan: ", "Score: ")}${mkShow(n - 1)}</h2>
        <div class="obmkslot"></div>
        <p>${ok ? L("Güzel, bu tur tamam.", "Good, this round is done.") : L("Bu tur tutmadı; istersen bir kez daha dene.", "This round didn't pass; try once more if you like.")}</p>
        <div class="pbar"><button class="primary small" type="button" data-ob="${more ? "mknext" : "mkend"}">${more ? L("Sonraki tur", "Next round") : L("Sonucu gör", "See the result")}</button>
          <button class="stopbtn" type="button" data-ob="mkagain">${L("Yeniden dene", "Try again")}</button></div>`;
    }
    const res = (chk.rq >= READ.length ? `<li>${readOk() ? "✓" : "–"} ${L("Nota okuma", "Reading")} (${chk.rok}/${READ.length})</li>` : "") +
      CHECK.map((g, gi) => `<li>${gi < chk.passed ? "✓" : "–"} ${g.name()}</li>`).join("") +
      (chk.rts.length ? `<li>${rhythmOk() ? "✓" : "–"} ${L("Ritim", "Rhythm")} (${chk.rts.join(", ")})</li>` : "") +
      chk.mks.map((_, k) => `<li>${k < mkPassed() ? "✓" : "–"} ${MK[k].name()} (${mkShow(k)})</li>`).join("");
    const mp = mkPassed(), mkDone = MK.slice(0, mp).flatMap(m => m.lessons).map(id => pick(lessonById(id).title, LANG)).join(", ");
    let advice;
    if(chk.passed === CHECK.length) advice = L("Temeller ve klarino derslerini bitmiş saydık. Teknik ve üslup ile makam dersleri açık; yol haritası seni oradan götürür.", "We've marked the basics and clarion lessons as done. Technique and style and the makam lessons are open; the roadmap takes you on from there.");
    else if(chk.passed > 0) advice = L("Geçtiğin grupların derslerini bitmiş saydık. \"" + CHECK[chk.passed].name() + "\" dersinden başlayacaksın.", "We've marked the lessons for the groups you passed as done. You'll start with \"" + CHECK[chk.passed].name() + "\".");
    else if(chk.k <= 1) advice = L("İlk notalarda zorlandın: Başlarken ünitesinden (kamış, ağızlık, ilk ses) başlamanı öneririz.", "The first notes were hard: we suggest starting with the Getting started unit (reed, embouchure, first sound).");
    else advice = L("Temeller ünitesinden başlayacaksın; çalabildiğin notaları orada hızla geçersin.", "You'll start with the Basics unit and get through the notes you can already play quickly.");
    return `<div class="obemo" aria-hidden="true">🧭</div>
      <h2 class="obtitle">${L("Sınama bitti", "Check finished")}</h2>
      <ul class="obres">${res}</ul>
      <p>${advice}</p>
      ${!readOk() ? `<p>${L("Nota okumada zorlandın: Başlarken'deki \"Nota okuma\" dersini açık bıraktık, önce onu çalış.", "Reading was hard: we left the \"Reading music\" lesson in Getting started open; work on it first.")}</p>` : ""}
      ${!rhythmOk() ? `<p>${L("Ritimde zorlandın: Başlarken'deki \"Ritim: vuruş ve nota değerleri\" dersini açık bıraktık.", "Rhythm was hard: we left the \"Rhythm: the beat and note values\" lesson in Getting started open.")}</p>` : ""}
      ${mp ? `<p>${L("Bitmiş saydığımız makam dersleri: " + mkDone + ". Sınama yalnızca dizi perdelerini ve seyrin ana çizgisini yokladı; makam bilgini bütünüyle ölçmedi.", "Makam lessons we've marked as done: " + mkDone + ". The check only tried the scale perdes and the outline of a seyir; it doesn't measure your makam knowledge as a whole.")}</p>` : ""}
      ${mp && remeasure && store.get("lesson.guided", true) && !store.get("lesson.all", false) ? `<p>${L("İleri ünitesi için Makamlar sınavı gerekir; sınav, ünitenin bütün dersleri bitince gelir ve hoca kartı seni oraya götürür.", "The Advanced unit needs the Makams test; the test comes once every lesson in the unit is finished, and the teacher card takes you there.")}</p>` : ""}
      ${mp < chk.mks.length ? `<p>${L("\"" + MK[mp].name() + "\" tutmadı: o turun derslerini açık bıraktık.", "\"" + MK[mp].name() + "\" didn't pass: we left that round's lessons open.")}</p>` : ""}
      ${chk.passed === 0 && chk.k <= 1 ? `<div class="pbar"><button class="stopbtn" type="button" data-ob="chknew">${L("Başlarken'den başla", "Start from Getting started")}</button></div>` : ""}
      <p class="muted">${L("Sınamayı Dersler listesinin altındaki \"Seviyemi yeniden ölç\" ile tekrarlayabilirsin.", "You can redo the check with \"Measure my level again\" below the lesson list.")}</p>`;
  }

  function open(){ i = 0; remeasure = false; chkReset(); root.hidden = false; document.body.classList.add("modal"); render(); root.querySelector("button").focus(); }
  function close(){ rtStop(); mkStop(); root.hidden = true; document.body.classList.remove("modal"); }

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
    const slot = root.querySelector(".obmkslot");
    if(slot && chk.mkStage) slot.appendChild(chk.mkStage);
    const st = root.querySelector(".obstaff");
    if(st){
      const sv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      sv.setAttribute("viewBox", "0 0 150 108"); sv.setAttribute("class", "staff"); sv.setAttribute("role", "img");
      SK.drawStaffInto(sv, chk.state === "read" ? READ[chk.rq] : CHECK_NOTES[chk.k].w); st.appendChild(sv);
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
    if(act === "chkstart"){ chk.state = "read"; render(); return; }
    // Çalma bölümü: mikrofon gerekir (açılamazsa uyarı ve yeniden dene)
    if(act === "chkmic"){ await runMic(); return; }
    if(b.dataset.read){
      if(b.dataset.read === sylOf(READ[chk.rq])) chk.rok++;
      chk.rq++;
      if(chk.rq >= READ.length){ chk.state = "run"; render(); await runMic(); return; }
      render(); return;
    }
    if(act === "chkplay"){ SK.play(CHECK_NOTES[chk.k].w); return; }
    if(act === "chkfail"){ chkAdvance(false); return; }
    // Ritim turları: rtgo turu başlatır (yeni tur ya da yeniden deneme), rtskip/rtend sonuca geçer
    if(act === "rtnext"){ chk.rtFresh = true; render(); return; }
    if(act === "rtagain"){ chk.rts.pop(); chk.rtFresh = true; render(); return; }
    if(act === "rtskip" || act === "rtend"){ rtStop(); chk.state = mkWanted() ? "makam" : "done"; render(); return; }
    if(act === "rtgo"){
      await runMic(); if(chk.micErr) return;
      const r = RT[chk.rts.length], beats = RHYTHM_PATTERNS.find(p => p.id === r.pattern).beats;
      chk.state = "rtrun"; chk.rtBeat = null; chk.rtFresh = false; render();
      chk.rtRun = SK.rhythmTry(r.pattern, r.tempo, r.bars, res => {
        chk.rtRun = null; if(chk.state !== "rtrun") return;
        chk.rts.push(res.score); chk.state = "rhythm"; render();
      }, (k, counting) => {
        chk.rtBeat = (counting ? L("Sayım ", "Count ") : "") + (k % beats + 1);
        const el = root.querySelector(".obbeat"); if(el) el.textContent = chk.rtBeat;
      });
      return;
    }
    // Makam turları: mkgo turu başlatır, mkfail "Çalamıyorum"la turu 0 sayar, mkskip/mkend sonuca geçer
    if(act === "mknext"){ chk.mkFresh = true; chk.mkStage = null; render(); return; }
    if(act === "mkagain"){ chk.mks.pop(); chk.mkFresh = true; chk.mkStage = null; render(); return; }
    if(act === "mkskip" || act === "mkend"){ chk.state = "done"; render(); return; }
    if(act === "mkfail"){ mkStop(); chk.mks.push(0); chk.state = "makam"; render(); return; }
    if(act === "mkgo"){
      await runMic(); if(chk.micErr) return;
      const st = MK[chk.mks.length].step();
      chk.mkStage = Object.assign(document.createElement("div"), { className: "stage lsstage" });
      chk.state = "mkrun"; chk.mkFresh = false; render();
      chk.mkRun = SK.stepTry(st, chk.mkStage, res => {
        chk.mkRun = null; if(chk.state !== "mkrun") return;
        const fin = chk.mkStage.querySelector("[data-fin]");    // seyir adımının "Bitir"i sonuç ekranında kalmasın
        if(fin) fin.parentNode.remove();
        chk.mks.push(res.v); chk.state = "makam"; render();
      });
      return;
    }
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
      if(steps[i] === "check"){ rtStop(); mkStop(); }
      if(i < steps.length - 1){ i++; render(); return; }
      finish();
    }
  });

  // Dersin bütün adımlarını geçilmiş say (okuma adımları 1, ölçülenler geçme eşiğiyle). Okuma dışındaki adımlar da
  // geçilmiş sayılır: bilen biri bunlarda takılmasın. placed: çalınmadan geçildi (karşılamada atlandı ya da sınamayla);
  // gerçekten çalınıp bitmiş ders placed olmaz (yoksa sonraki ölçme onu silebilir, kart çalınmamış sanır)
  function markDone(prog, l, placed){
    const was = lessonDone(l, prog), p = prog[l.id] || (prog[l.id] = { s:{} });
    l.steps.forEach((st, k) => { if(!(p.s[k] && p.s[k].ok)) p.s[k] = { v: st.type === "read" ? 1 : st.type === "notes" ? 0 : (st.min || st.n || 1), ok:true }; });
    p.d = p.d || dayKey(new Date());
    if(placed && !was) p.placed = true;
  }
  // Sınamanın kapsadığı ünitenin dersleri bütünüyle bitmişse sınavı da geçilmiş sayılır (rehberli ilerlemede sonraki ünite
  // açılsın); ders yeniden açıldıysa sınavın placed kaydı da kalkar. Dersleri hep gerçekten çalınmış ünitenin sınavı atlanmaz.
  // Makamlar sınamayla bütünüyle ölçülmediği için sınavı hiç atlanmaz (kural: MK)
  function syncExams(prog){
    for(const u of UNITS){ const ex = examFor(u.id), ls = LESSONS.filter(l => l.unit === u.id);
      if(!ex) continue;
      if(ls.every(l => lessonDone(l, prog))){ if(u.id !== "makam" && ls.some(l => prog[l.id].placed)) markDone(prog, ex, true); }
      else if(prog[ex.id] && prog[ex.id].placed) delete prog[ex.id]; }
  }
  // Seviyeye göre ders ilerlemesini kur: başlangıç ünitesi (ve isteğe göre her şey) açılır
  function finish(){
    store.set("inst", pickd.inst);
    store.set("goal.min", pickd.goal);
    if(pickd.sens) store.set("sens", pickd.sens);
    const prog = store.get("lesson.prog", {});
    if(pickd.level === "some" || pickd.level === "makam"){
      for(const l of LESSONS.filter(x => x.unit === "baslangic")){
        // Klarnetsiz ritim dersleri (usul vurma, hece) çalma düzeyine bağlı değil: herkes yapar
        if(l.id === "usul-giris" || l.id === "ritim-hece") continue;
        // Okumada ya da ritimde zorlanana o ders açık kalır; önceki bir sınamanın bitmiş saydığı (placed) kayıt da
        // silinir (yeniden ölçmede). Gerçekten çalınmış ders bitmiş kalır
        if(l.id === "nota-okuma" && !readOk() || l.id === "ritim-temel" && !rhythmOk()){
          if(prog[l.id] && prog[l.id].placed) delete prog[l.id];
          continue;
        }
        // Yeniden ölçmede ölçülmeyen bölüm karar vermez: geçilen okuma ya da ritim, ilk notaları çıkmamış Başlarken dersi
        // bitmiş sayılmaz (karşılamada "biraz çalabiliyorum" Başlarken'i baştan geçer)
        if(remeasure && !(l.id === "nota-okuma" ? chk.rq >= READ.length : l.id === "ritim-temel" ? chk.rts.length > 0 : chk.k > 1)) continue;
        markDone(prog, l, true);
      }
      // Çalma sınamasında baştan eksiksiz geçilen grupların dersleri. Notalar "Çalamıyorum"la bittiyse tutmayan grubun önceki
      // sınamadan kalan (placed) kaydı silinir; sonraki gruplar çalınmadığı için karar vermez, eski ölçümleri durur (makam turlarıyla aynı kural, gerekçe docs/BACKLOG.md)
      const noteEnd = !["intro", "read", "run"].includes(chk.state);
      CHECK.forEach((g, gi) => g.lessons.forEach(id => {
        const l = lessonById(id);
        if(l && gi < chk.passed) markDone(prog, l, true);
        else if(gi === chk.passed && noteEnd && prog[id] && prog[id].placed) delete prog[id];
      }));
      // Makam turları: baştan geçilenlerin dersleri bitmiş sayılır, ölçülüp tutmayan turun placed kaydı silinir (kural: MK)
      const mp = mkPassed();
      MK.forEach((m, k) => m.lessons.forEach(id => {
        const l = lessonById(id);
        if(l && k < mp) markDone(prog, l, true);
        else if(k < chk.mks.length && prog[id] && prog[id].placed) delete prog[id];
      }));
      syncExams(prog);
      store.set("lesson.prog", prog);
      if(chk.state === "done") store.set("onboard.check", { passed: chk.passed, of: CHECK.length, read: chk.rq >= READ.length ? chk.rok : null, rhythm: chk.rts.length ? chk.rts : null, makam: chk.mks.length ? chk.mks.map(v => Math.round(v*100)/100) : null, d: dayKey(new Date()) });
    }
    // Yeniden ölçmede "Başlarken'den başla": çalınmadan bitmiş sayılan bütün dersler yeniden açılır
    else if(remeasure){
      for(const l of LESSONS) if(prog[l.id] && prog[l.id].placed) delete prog[l.id];
      syncExams(prog);
      store.set("lesson.prog", prog);
    }
    // Yeniden açılan derslerin aralıklı tekrar kaydı kalmasın (hoca kartının tekrar sayısı da)
    store.set("lesson.srs", srsSync(store.get("lesson.srs", {}), prog, dayKey(new Date())));
    // Yeniden ölçme seviyeyi ve "bütün dersler açık" ayarını değiştirmez
    if(!remeasure){
      store.set("onboard.level", pickd.level);
      if(pickd.level === "makam") store.set("lesson.all", true);
    }
    store.set("lesson.cur", "");
    store.set("nav.sec", "lessons");
    store.set("nav.lroot", "lessons");
    store.set("onboard.done", true);
    store.set("onboard.resume", false);
    window.SK_RESETTING = true;
    location.reload();
  }

  // Dersler'den seviyeyi yeniden ölçme: karşılama doğrudan çalma sınamasında açılır. Karşılamada makam seçildiyse makam
  // turları da gelir (bu kayıttan önce seçenlerde onboard.level yok: onlarda "bütün dersler açık" ayarına bakılır)
  SK.levelCheck = () => {
    open(); remeasure = true;
    pickd.level = store.get("onboard.level", store.get("lesson.all", false) ? "makam" : "some") === "makam" ? "makam" : "some";
    steps = stepList(); i = steps.indexOf("check"); render();
  };
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
