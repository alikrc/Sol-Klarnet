// Çalışma bölümünün Dersler sekmesi: ders listesi, ders sayfası, örnek çalma ve adım çalıştırıcıları.
// Ders verisi lessons.js'te, ilerleme mantığı learn.js'te; trainers.js ve pieces.js'teki adımlar TRAINER_STEPS'ten gelir.

TRAINERS.lessons = function(ctx){
  const { SK, $, store, nn, num, sgn, esc, sleep, needMic, holder, perdeOf, tgt, mkFreq, markScale, droneOn, staffSvg, miniChart, paintMini, toneKv, toneTips, days, intStats, makamState: ms } = ctx;
  const P = $("pp-lessons");
  P.innerHTML = `
    <p class="pdesc">Adım adım ilerleyen dersler: her derste kısa bir anlatım ve mikrofonla değerlendirilen alıştırmalar var. Bir dersin bütün adımlarını geçince sonraki ders açılır; rehberli ilerlemede yeni ünite, öncekinin sınavı geçilince açılır. En üstteki kart her gün sıradaki adımı ve nedenini söyler. Bugünün çalışması, bitirdiğin derslerden her gün yeniden kurulur.</p>
    <div class="lsgrid">
      <div class="lsside">
        <section class="lscoach" id="lscoach" aria-live="polite"></section>
        <nav class="lslist" id="lslist" aria-label="Dersler"></nav>
        <label class="chk small"><input type="checkbox" id="lsguided"> ${L("rehberli ilerleme (yeni ünite, öncekinin sınavı geçilince açılır)", "guided progress (a new unit opens after the previous unit's test)")}</label>
        <label class="chk small"><input type="checkbox" id="lsall"> tüm dersleri aç</label>
        <button class="stopbtn small" type="button" id="lslevel">${L("Seviyemi yeniden ölç", "Measure my level again")}</button>
      </div>
      <div class="lsbody" id="lsbody"></div>
    </div>`;
  const tx = x => pick(x, LANG);
  const prog = store.get("lesson.prog", {});
  let daily = store.get("lesson.daily", null);   // { day, plan, p:{s, d} } — plan gün içinde sabit kalır
  let allOpen = store.get("lesson.all", false);
  let cur = null, run = null;

  function dailyLesson(){
    const day = dayKey(new Date());
    // Gün içinde hiçbir adıma başlanmadıysa plan yeniden kurulur (o arada bitirilen dersler de girsin)
    if(!daily || daily.day !== day || !Object.keys(daily.p.s).length){
      const srs = srsSync(store.get("lesson.srs", {}), prog, day); store.set("lesson.srs", srs);
      const plan = dailyPlan({ prog, intStats, quizStats: store.get("quiz.stats", {}), day, srs, techBest: techBestMap(store), goalMin: store.get("goal.min", 15) });
      daily = { day, plan: plan.steps, p:{ s:{} } };
      store.set("lesson.daily", daily);
    }
    const l = dailyPlan({ prog:{}, intStats:{}, quizStats:{}, day });
    l.steps = daily.plan;
    return l;
  }
  const progFor = l => l.daily ? { daily: daily.p } : prog;
  const save = () => { store.set("lesson.prog", prog); store.set("lesson.daily", daily); };

  // ---- Liste ----
  function renderList(){
    const dl = dailyLesson(), dp = lessonProgress(dl, progFor(dl));
    let html = `<button type="button" class="lsitem daily${cur && cur.daily ? " cur" : ""}" data-id="daily">
      <span><i class="lsemo" aria-hidden="true">☀️</i>${esc(tx(dl.title))}</span><small>${dp.done === dp.total ? "✓" : dp.done + "/" + dp.total}</small></button>`;
    // Rehberli ilerlemede yalnız üzerinde çalışılan üniteler açık durur: bitmiş (dersleri ve sınavı) ve henüz hiç dersi
    // açılmamış üniteler katlanır, başlıkta durumu yazar (açık ders içindeyse katlanmaz)
    const fold = store.get("lesson.guided", true) && !allOpen;
    for(const u of UNITS){
      const ls = LESSONS.filter(x => x.unit === u.id), ex = examFor(u.id);
      let items = "";
      for(const l of ls){
        const open = unlocked(l, prog, allOpen), done = lessonDone(l, prog), lp = lessonProgress(l, prog);
        items += `<button type="button" class="lsitem${done ? " done" : ""}${cur === l ? " cur" : ""}" data-id="${l.id}"${open ? "" : ' data-locked aria-disabled="true"'}>
          <span>${esc(tx(l.title))}</span><small>${!open ? "kilitli" : done ? "✓" : lp.done ? lp.done + "/" + lp.total : ""}</small></button>`;
      }
      if(ex){
        const open = unlocked(ex, prog, allOpen), done = lessonDone(ex, prog), lp = lessonProgress(ex, prog);
        items += `<button type="button" class="lsitem exam${done ? " done" : ""}${cur === ex ? " cur" : ""}" data-id="${ex.id}"${open ? "" : ' data-locked aria-disabled="true"'}>
          <span><i class="lsemo" aria-hidden="true">🏅</i>${L("Ünite sınavı", "Unit test")}${done ? " · " + esc(tx(u.badge)) : ""}</span><small>${!open ? L("dersler bitince", "after the lessons") : done ? "★" : lp.done ? lp.done + "/" + lp.total : ""}</small></button>`;
      }
      const head = `<i class="lsemo" aria-hidden="true">${ART.UNIT_EMOJI[u.id] || ""}</i>${esc(tx(u.name))}`;
      const finished = ls.every(l => lessonDone(l, prog)) && (!ex || lessonDone(ex, prog));
      const closed = !ls.some(l => unlocked(l, prog, allOpen));
      const here = cur && cur.unit === u.id && !cur.daily;
      if(fold && !here && (finished || closed)){
        const gate = gateFor(u.id, prog), why = finished ? "✓ " + ls.length + L(" ders", " lessons")
          : premiumUnit(u.id) ? "★ Premium" : gate.length ? "🔒 " + gate.map(e => tx(UNITS.find(x => x.id === e.unit).name)).join(", ") + L(" sınavından sonra", " test first") : "🔒 " + L("önceki dersler bitince", "after the earlier lessons");
        html += `<details class="lsfold${finished ? " done" : ""}"><summary class="lsunit">${head}<small>${esc(why)}</small></summary>${items}</details>`;
      }
      else html += `<div class="lsunit">${head}</div>${items}`;
    }
    $("lslist").innerHTML = html;
    renderCoach();
  }
  // ---- Hoca kartı: bugün sıradaki tek adım ve nedeni (roadmap.js coachNext) ----
  let coach = null;
  const coachSt = () => ({ ...roadmapStats((k, d) => store.get(k, d)), prog });
  const coachOpts = () => ({ style: store.get("goal.style", "both"), all: allOpen, guided: store.get("lesson.guided", true) });
  // Sıradaki ders: kartın dersi ya da sınavı (ders sonu düğmesi, kilitli ders notu ve ilk açılış kartla aynı şeyi göstersin)
  const nextUp = () => { const id = coachLesson(coachSt(), coachOpts()); return id ? lessonById(id) : nextLesson(prog, allOpen); };
  function renderCoach(){
    const day = dayKey(new Date());
    coach = coachNext(coachSt(), { ...coachOpts(), dailyDone: store.get("lesson.dailyDone", []).includes(day) || dailySettled(daily, day),
      due: srsDue(store.get("lesson.srs", {}), day).length, reported: store.get("rm.reported", []) });
    const c = coach, names = xs => xs.map(tx).join(", ");
    const mileNow = m => (m.v == null ? L("henüz ölçülmedi", "not measured yet") : L("şu an ", "now ") + num(m.v, Number.isInteger(m.v) ? 0 : 1) + tx(m.unit)) + ", " + L("hedef ", "goal ") + (m.lower ? "≤ " : "") + m.target + tx(m.unit);
    let head, why, btn;
    switch(c.why){
      case "resume": head = tx(c.title); btn = L("Devam et", "Continue");
        why = L(`Yarım kaldı: ${c.done}/${c.total} adım. Yeni konuya geçmeden önce bunu bitir.`, `Unfinished: ${c.done}/${c.total} steps. Finish it before moving on.`); break;
      case "daily": head = L("Bugünün çalışması", "Today's practice"); btn = L("Isınmaya başla", "Start warming up");
        why = c.due ? L(`Önce ısın ve tekrar et: ${c.due} dersin tekrarı geldi. Bugünün çalışması bunlardan ve zorlandığın notalardan kuruldu.`, `Warm up and review first: ${c.due} lessons are due. Today's practice is built from them and the notes you find hard.`)
                    : L("Önce ısın: bugünün çalışması bildiğin notalardan ve zorlandığın yerlerden kuruldu.", "Warm up first: today's practice is built from the notes you know and the places you find hard."); break;
      case "exam": head = tx(c.title); btn = L("Sınava gir", "Take the test");
        why = c.gates.length ? L(`${tx(c.unit)} ünitesini bitirdin. Sınavı geçince ${names(c.gates)} açılır: sonraki kademeye geçmeden bildiklerini yoklayalım.`, `You've finished ${tx(c.unit)}. Passing the test opens ${names(c.gates)}: let's check what you know before the next stage.`)
                             : L(`${tx(c.unit)} ünitesini bitirdin; sınavla pekiştir.`, `You've finished ${tx(c.unit)}; consolidate it with the test.`); break;
      case "mile": head = tx(c.title); btn = L("Alıştırmaya git", "Go to the exercise");
        why = L(`"${tx(c.stage)}" kademesinin dersleri bitti. Kademeyi tamamlamak için bu ölçüm hedefe ulaşmalı: `, `The lessons of "${tx(c.stage)}" are done. To complete the stage this measurement must reach its goal: `) +
          mileNow(c) + "."; break;
      case "weak": head = tx(c.title); btn = L("Alıştırmaya git", "Go to the exercise");
        { const f = v => num(v, c.low ? 2 : 0) + tx(c.unit);
          why = L(`Önce bunu toparlayalım: önceki 4 haftada ortalama ${f(c.before)} iken son 4 haftada ${f(c.recent)}. Yeni konudan önce kısa bir tur iyi gelir.`,
                  `Let's fix this first: it averaged ${f(c.before)} in the previous 4 weeks and ${f(c.recent)} in the last 4. A short round before new material will help.`); } break;
      case "premium": head = L("Ücretsiz bölüm tamam", "The free part is done"); btn = L("Premium hakkında", "About Premium");
        why = L(`Sıradaki ünite (${tx(c.unit)}) ve sonrası premium. Başlarken, Temeller ve Register ücretsiz; akort, parmak şeması ve günlük çalışma her zaman açık.`,
                `The next unit (${tx(c.unit)}) and beyond are Premium. Getting started, Basics and Register are free; the tuner, fingering chart and daily practice stay open.`); break;
      case "report": head = L("Kademe tamam: ", "Stage complete: ") + tx(c.stage.title); btn = L("Sıradaki adım", "Next step");
        { const f = m => (m.v == null ? "—" : num(m.v, Number.isInteger(m.v) ? 0 : 1)) + tx(m.unit);
          why = (c.days ? L(`${c.days} günde tamamladın. `, `You completed it in ${c.days} days. `) : "") +
            L("Ölçülenler: ", "Measured: ") + c.miles.map(m => tx(m.title) + " " + f(m)).join(" · ") + ". " +
            (c.growth && c.growth.length ? L("Kademe başından sonuna: ", "From the start of the stage to its end: ") +
              c.growth.map(g => tx(g.title) + " " + num(g.from, g.low ? 2 : 0) + " → " + num(g.to, g.low ? 2 : 0) + tx(g.unit)).join(" · ") + ". " : "") +
            (c.next ? L("Sıradaki kademe, ", "Next stage, ") + tx(c.next.title) + ": " + tx(c.next.goal) : L("Bütün kademeleri bitirdin.", "You've finished every stage.")); } break;
      case "newUnit": head = tx(c.title); btn = L("Derse başla", "Start the lesson");
        why = L(`Yeni ünite: ${tx(c.unit)}. Buradan adım adım gideceğiz.`, `New unit: ${tx(c.unit)}. We'll go step by step from here.`); break;
      case "next": head = tx(c.title); btn = L("Derse başla", "Start the lesson");
        why = L(`Sıradaki ders (${tx(c.unit)}).`, `Next lesson (${tx(c.unit)}).`); break;
      default: head = L("Hepsi tamam", "All done"); btn = L("Nota arşivine git", "Open the score archive");
        why = L("Bütün dersler ve kademeler tamam. Artık eserler, eşlik ve taksimle serbest çalış.", "Every lesson and stage is done. Now play freely: pieces, the band and taksim.");
    }
    $("lscoach").innerHTML = `<div class="eyebrow">${L("Hocan diyor ki", "Your teacher says")}</div>
      <strong class="lscoachh">${esc(head)}</strong><p>${esc(why)}</p>
      <button class="primary small" type="button" data-coach="go">${esc(btn)} →</button>
      ${c.side ? `<p>${esc(L("Yan öneri: ", "On the side: ") + tx(c.side.title) + " (" + mileNow(c.side) + "). " + L("Bu ölçüm henüz tutmadı; dersler onu beklemez, araya kısa turlar koy.", "This measurement hasn't reached its goal yet; the lessons won't wait for it, so fit in short rounds."))}</p>
      <button class="stopbtn small" type="button" data-coach="side">${esc(L("Alıştırmaya git", "Go to the exercise"))}</button>` : ""}`;
  }
  $("lscoach").addEventListener("click", e => {
    const b = e.target.closest("[data-coach]"); if(!b || !coach) return;
    if(b.dataset.coach === "side"){ ctx.selectTab(coach.side.tab); return; }
    // Eski kayıtlar korunur: yeniden ölçmede geri açılıp tekrar biten kademenin raporu ikinci kez gelmesin
    if(coach.kind === "report"){ store.set("rm.reported", [...new Set([...store.get("rm.reported", []), ...coach.all])]); renderCoach(); return; }
    if(coach.kind === "lesson") openSub(lessonById(coach.id));
    else if(coach.kind === "daily") openSub(dailyLesson());
    else if(coach.kind === "mile") ctx.selectTab(coach.tab);
    else if(coach.kind === "premium") premiumNote();
    else ctx.selectTab("archive");
  });
  $("lslist").addEventListener("click", e => {
    const b = e.target.closest("[data-id]"); if(!b) return;
    if(b.hasAttribute("data-locked")){ lockedNote(lessonById(b.dataset.id)); return; }
    openSub(b.dataset.id === "daily" ? dailyLesson() : lessonById(b.dataset.id));
  });
  // Kilitli derse dokununca neden kilitli olduğu ve sıradaki ders
  // Premium (premium.js): satın alma henüz yok, yalnız bilgi
  function premiumNote(){
    SK.notice(L("Premium ünitelerde teknik, hız, süsleme, makam, Trakya ve ileri dersler; eşlik, kulaktan çıkarma, nota çevirme, kayıt karşılaştırma ve taksim değerlendirmesi var. Satın alma yakında.",
                "Premium covers the technique, speed, ornament, makam, Thracian and advanced lessons, plus the band, learn-by-ear, score conversion, recording comparison and taksim assessment. Purchase is coming soon."));
  }
  function lockedNote(l){
    if(l && premiumUnit(l.unit)){ premiumNote(); return; }
    const gate = l && !l.exam ? gateFor(l.unit, prog) : [];
    const nx = gate.length && unlocked(gate[0], prog, allOpen) ? gate[0] : nextUp();
    const msg = l && l.exam ? L("Ünite sınavı, ünitenin bütün dersleri bitince açılır.", "The unit test opens once every lesson in the unit is finished.")
              : gate.length ? L("Rehberli ilerleme: bu ünite, ", "Guided progress: this unit opens after ") + gate.map(e => tx(e.title)).join(", ") + L(" geçilince açılır.", " is passed.")
                            : L("Bu ders, önceki dersler bitince açılır.", "This lesson opens once the earlier lessons are finished.");
    SK.notice(msg + " " + L("Hepsini hemen açmak için listenin altındaki “tüm dersleri aç” kutusunu işaretle.",
                            "To open them all now, tick “unlock all lessons” below the list."),
      nx ? { label: L("Sıradaki ders: ", "Next lesson: ") + tx(nx.title), run: () => openSub(nx) } : null);
  }
  // Ders, Dersler'in alt sayfasıdır: üst çubukta adı ve ←. Telefonda ders açıkken liste gizlenir; geniş ekranda yan yana kalır.
  // Geri tuşu dersi bırakır (adım durur), son açılan ders geniş ekranda gösterilmeye devam eder.
  const grid = P.querySelector(".lsgrid");
  function openSub(l){
    const t = SK.nav.top(), sub = "ders:" + l.id;
    open(l);
    (t && t.sub ? SK.nav.replaceSub : SK.nav.pushSub)(sub, tx(l.title), closeSub);
    grid.classList.add("open"); P.classList.add("lsopen");
  }
  function closeSub(){ stopRun(); grid.classList.remove("open"); P.classList.remove("lsopen"); SK.setRoute({ ders:null }); }
  // Arama: SK.lessonOpen(id) ders açık mı; SK.openLesson(id) Dersler'i açar, ders açıksa dersi gösterir
  SK.lessonOpen = id => { const l = lessonById(id); return !!l && unlocked(l, prog, allOpen); };
  SK.openLesson = id => {
    ctx.selectTab("lessons");
    if(SK.lessonOpen(id)) openSub(lessonById(id));
  };
  $("lslevel").addEventListener("click", () => SK.levelCheck && SK.levelCheck());
  $("lsguided").checked = store.get("lesson.guided", true);
  $("lsguided").addEventListener("change", () => { store.set("lesson.guided", $("lsguided").checked); setGuided($("lsguided").checked); renderList(); renderNext(); });
  $("lsall").checked = allOpen;
  $("lsall").addEventListener("change", () => { allOpen = $("lsall").checked; store.set("lesson.all", allOpen); renderList(); renderNext(); });

  // ---- Ders sayfası ----
  function resText(st, r){
    switch(st.type){
      case "listen": return "dinlendi";
      case "hold": return r.v + " puan";
      case "notes": return r.v + " hata";
      case "quiz": case "glide": return r.v + "/" + st.n;
      case "scale": return "%" + Math.round(r.v*100);
      case "mimic": return r.v + " nota";
      case "vibrato": return num(r.v) + " sn";
      case "read": return L("okundu", "read");
      case "rhythm": case "seyir": return r.v + L(" puan", " points");
      case "dynamics": return r.v ? L("geçti", "passed") : L("tekrar", "retry");
      case "ear": case "dictation": return r.v + "/" + st.n;
      case "sight": return "%" + r.v;
      case "piece": return st.mode === "free" ? r.v + L(" hata", " mistakes") : st.mode === "ladder" ? "%" + r.v + L(" tempo", " tempo") : "%" + r.v;
      case "tech": return "♩=" + r.v;
      case "ornament": return st.kind === "tril" ? num(r.v) + L(" dönüş/sn", " turns/s") : r.v + "/" + st.n;
    }
    return "";
  }
  const canHear = st => ["notes", "scale", "hold", "vibrato", "ornament", "tech"].includes(st.type);
  function stepHead(st, i, r){
    return `<span class="lsnum">${r && r.ok ? "✓" : i+1}</span><span class="lsname">${esc(stepTitle(st, LANG))}</span>` +
      (r ? `<span class="lsres">${r.ok ? resText(st, r) : "en iyi: " + resText(st, r)}</span>` : "");
  }
  function stepButtons(st, i, r, running){
    // Örnek sesler Iowa'nın Boehm Si♭ klarnet kaydından perde ayarlanarak çalınır (sampler.js): Sol klarnet tınısı değil
    if(st.type === "listen") return `<button class="primary small" type="button" data-act="start" data-i="${i}">${running ? "Durdur" : "Dinle"}</button>` +
      `<span class="muted small lssrc">${L("Örnek ses: Si♭ klarnet kaydı, perdesi ayarlı; Sol klarnetin tınısı değil.", "Sample: a B♭ clarinet recording, pitch-adjusted; not the sound of a G clarinet.")}</span>`;
    return (canHear(st) ? `<button class="stopbtn" type="button" data-act="hear" data-i="${i}">Örneği dinle</button>` : "") +
      `<button class="primary small" type="button" data-act="start" data-i="${i}">${running ? "Durdur" : r ? "Tekrar" : "Başla"}</button>`;
  }
  function refreshStep(i){
    const st = cur.steps[i], p = progFor(cur)[cur.id], r = p && p.s[i], li = $("lst"+i);
    if(!li) return;
    li.classList.toggle("ok", !!(r && r.ok));
    li.classList.toggle("active", !!(run && run.i === i));
    li.querySelector(".lshead").innerHTML = stepHead(st, i, r);
    li.querySelector(".lsbtns").innerHTML = stepButtons(st, i, r, run && run.i === i);
  }
  function open(l){
    stopRun();
    cur = l; store.set("lesson.cur", l.id); SK.setRoute({ ders: l.id });
    const p = progFor(l), u = UNITS.find(x => x.id === l.unit), vids = l.daily ? [] : videosForLesson(l.id);
    $("lsbody").innerHTML = `
      <div class="eyebrow">${u ? (ART.UNIT_EMOJI[u.id] || "") + " " + esc(tx(u.name)) : "☀️ " + esc(dayKey(new Date()))}</div>
      <h3 class="lstitle">${esc(tx(l.title))}</h3>
      ${l.text.map(t => `<p>${esc(tx(t))}</p>`).join("")}
      ${l.tips.length ? `<ul class="lstips">${l.tips.map(t => `<li>${esc(tx(t))}</li>`).join("")}</ul>` : ""}
      ${vids.length ? `<details class="lsvids" open><summary>${L("Videolar", "Videos")} <small>${vids.length}</small></summary>
        ${videoRowsHtml(vids)}<p class="muted small">${L("Çorlu Klarnet Üstatları kanalından, YouTube'da açılır.", "From the Çorlu Klarnet Üstatları channel, in Turkish; opens on YouTube.")}</p></details>` : ""}
      ${l.makam ? `<div class="pbar"><button class="stopbtn" type="button" data-act="drone">Durağı dron yap</button></div>` : ""}
      <ol class="lssteps">${l.steps.map((st, i) => { const r = p[l.id] && p[l.id].s[i]; return `
        <li class="lsstep${r && r.ok ? " ok" : ""}" id="lst${i}">
          <div class="lshead">${stepHead(st, i, r)}</div>
          <div class="pbar lsbtns">${stepButtons(st, i, r, false)}</div>
          <div class="stage lsstage" id="lss${i}" hidden></div>
        </li>`; }).join("")}</ol>
      <div id="lsnext"></div>`;
    SK.setTempContext(l.makam || null);
    markScale(l.makam ? makamById(l.makam) : null);
    renderList(); renderNext();
  }
  function renderNext(){
    const el = $("lsnext"); if(!el || !cur) return;
    if(!lessonDone(cur, progFor(cur))){ el.innerHTML = ""; return; }
    if(cur.daily){ el.innerHTML = `<div class="lsdone"><strong><i class="lsemo" aria-hidden="true">🎉</i>Bugünün çalışması tamam.</strong> <i class="lsemo" aria-hidden="true">🔥</i>Seri: ${streak(days)} gün.</div>`; return; }
    if(cur.exam){
      const u = UNITS.find(x => x.id === cur.unit);
      el.innerHTML = `<div class="lsdone"><strong><i class="lsemo" aria-hidden="true">🏆</i>${L("Sınavı geçtin!", "Test passed!")}</strong> ${L("Rozet", "Badge")}: ★ ${esc(tx(u.badge))} <button class="stopbtn small" type="button" data-act="tab" data-tab="roadmap">${L("Rozetlerim", "My badges")}</button></div>`;
      return;
    }
    const nx = nextUp();
    el.innerHTML = `<div class="lsdone"><strong><i class="lsemo" aria-hidden="true">🎉</i>Ders tamamlandı.</strong> ${nx ? `<button class="primary small" type="button" data-act="goto" data-id="${nx.id}">Sonraki ders: ${esc(tx(nx.title))} →</button>` : "Bütün dersleri bitirdin!"}</div>` + summaryHtml(cur);
  }
  // Ders sonu özeti: her ölçülen adımın en iyi sonucu ve geçme koşulu. Koşulu en az farkla geçilen adım tekrar için
  // önerilir (oran: sonucun hedefe göre fazlası; hata sayısında azı iyidir)
  function stepGoal(st){
    switch(st.type){
      case "notes": return { goal:st.maxMiss, low:true, unit:L(" hata", " mistakes") };
      case "piece": return st.mode === "free" ? { goal:st.min, low:true, unit:L(" hata", " mistakes") } : { goal:st.min, unit:"%" };
      case "scale": return { goal:st.min, pct:true };
      case "mimic": return { goal:st.len, unit:L(" nota", " notes") };
      case "vibrato": return { goal:st.sec, unit:L(" sn", " s") };
      case "glide": return { goal:st.n };
      case "tech": return { goal:st.target, unit:" ♩" };
      case "ornament": return { goal:st.kind === "tril" ? st.rate : st.n };
      case "hold": case "rhythm": case "seyir": return { goal:st.min, unit:L(" puan", " points") };
      case "ear": case "sight": case "dictation": case "quiz": return { goal:st.min, unit: st.type === "sight" ? "%" : "/" + st.n };
    }
    return null;
  }
  function summaryHtml(l){
    const p = (progFor(l)[l.id] || { s:{} }).s, rows = [];
    l.steps.forEach((st, i) => {
      const g = stepGoal(st), r = p[i]; if(!g || !r || r.v == null) return;
      const f = x => g.pct ? Math.round(x*100) + "%" : num(x, Number.isInteger(x) ? 0 : 1) + (g.unit || "");
      const margin = g.low ? (g.goal - r.v)/Math.max(1, g.goal) : (r.v - g.goal)/Math.max(g.pct ? 0.01 : 1, g.goal);
      rows.push({ i, st, txt: f(r.v), goal: f(g.goal), margin });
    });
    if(!rows.length) return "";
    const weak = rows.reduce((a, b) => b.margin < a.margin ? b : a);
    return `<div class="lssum"><div class="label">${L("Ders özeti", "Lesson summary")}</div>
      <ol>${rows.map(x => `<li value="${x.i + 1}"><span>${esc(stepTitle(x.st, LANG).split(" · ")[0])}</span> <b>${x.txt}</b> <small>${L("hedef ", "goal ")}${g0(x)}</small></li>`).join("")}</ol>
      ${rows.length > 1 ? `<p class="muted small">${L("En az farkla geçtiğin adım: ", "The step you passed by the smallest margin: ")}${weak.i + 1}. ${L("Yarın bir kez daha çalmak iyi olur. Ses kararlılığı, ritim ve taksim puanlarının haftalara göre değişimi İlerleme'de.", "Playing it once more tomorrow is a good idea. Weekly changes in tone stability, rhythm and taksim scores are in Progress.")}</p>` : ""}
      <button class="stopbtn small" type="button" data-act="tab" data-tab="progress">${L("Gelişimimi gör", "See my progress")}</button></div>`;
    function g0(x){ return (stepGoal(x.st).low ? L("en çok ", "at most ") : L("en az ", "at least ")) + x.goal; }
  }
  $("lsbody").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if(!b) return;
    const act = b.dataset.act, i = +b.dataset.i;
    if(act === "goto") return openSub(lessonById(b.dataset.id));
    if(act === "tab") return ctx.selectTab(b.dataset.tab);
    if(act === "drone"){ droneOn(makamById(cur.makam).durak); return; }
    if(act === "hear") return hear(cur.steps[i]);
    if(act === "start"){ if(run && run.i === i) stopRun(); else startStep(i); }
  });

  // ---- Örnek çalma ----
  let playToken = null;
  async function playSeq(items, onIdx){
    const token = {}; playToken = token;
    for(let k=0;k<items.length;k++){
      if(playToken !== token) return false;
      const [w, f] = items[k];
      if(onIdx) onIdx(k);
      SK.play(w, f); await sleep(560);
    }
    if(playToken !== token) return false;
    SK.stopSound(); await sleep(300);
    return playToken === token;
  }
  const fromNotes = ws => ws.map(w => [w, undefined]);
  // Ders ya da adım bir makama aitse perde sesleri seçili akorda (AEU / icra) göre çalar
  const lessonMk = st => makamById((st && st.makam) || (cur && cur.makam) || "");
  const fromCommas = (cs, st) => cs.map(c => [commaToWritten(c), mkFreq(lessonMk(st), c)]);
  function itemsOf(st){
    if(st.type === "scale"){ const mk = makamById(st.makam); return fromCommas([...mk.asc, ...[...mk.desc].reverse().slice(1)], st); }
    if(st.type === "hold" || st.type === "vibrato") return st.comma != null ? [[st.note, mkFreq(lessonMk(st), st.comma)]] : fromNotes([st.note]);
    return st.commas ? fromCommas(st.commas, st) : fromNotes(st.notes);
  }
  // Süsleme örneği: ornament adımı ya da orn alanlı dinleme adımı
  function ornSpec(st){
    if(st.type === "ornament") return st;
    return { ...st.orn, note: st.notes ? st.notes[0] : commaToWritten(st.commas[0]), comma: st.commas ? st.commas[0] : undefined, makam: st.makam };
  }
  const playOrn = st => ornamentPlay(ctx, ornSpec(st));
  // Teknik kalıbı tempoda çalar (dinleme adımı ve "Örneği dinle")
  async function playPattern(st, onIdx){
    const spec = st.pattern, pat = techPattern(spec), mk = spec.makam ? makamById(spec.makam) : null, tempo = st.tempo || st.target;
    const token = {}; playToken = token;
    for(let k=0;k<pat.notes.length;k++){
      if(playToken !== token) return false;
      const n = pat.notes[k]; if(onIdx) onIdx(k);
      SK.play(n.w, n.c != null && mk ? mkFreq(mk, n.c) : undefined);
      await sleep(n.d*60000/tempo*0.92);
      if(playToken !== token) return false;
      SK.stopSound(); await sleep(n.d*60000/tempo*0.08);
    }
    SK.stopSound();
    return playToken === token;
  }
  async function hear(st){
    if(st.pattern) return playPattern(st);
    if(st.type === "ornament" || st.orn){ playToken = null; return playOrn(st); }
    const items = itemsOf(st);
    if(items.length > 1) return playSeq(items);
    const token = {}; playToken = token;
    SK.play(items[0][0], items[0][1]); await sleep(1500);
    if(playToken === token) SK.stopSound();
  }

  // ---- Adım çalıştırma ----
  const NO_MIC = new Set(["read", "listen", "ear"]);
  async function startStep(i){
    stopRun();
    const st = cur.steps[i], lesson = cur;
    // Okuma, dinleme ve kulak adımları mikrofonsuz; Bul modu ve dikte tıklayarak da cevaplanır
    if((st.type === "quiz" && st.mode === "find") || st.type === "dictation") needMic();
    else if(!NO_MIC.has(st.type) && !(await needMic())) return;
    if(cur !== lesson) return;
    const stage = $("lss"+i); stage.hidden = false; stage.innerHTML = "";
    if(st.makam) SK.setTempContext(st.makam);           // günlük plandaki makam adımları
    const me = run = { i, lesson };
    me.h = RUN[st.type](st, stage, res => { if(run === me) finish(me, res); });
    refreshStep(i);
  }
  function stopRun(){
    if(!run) return;
    const r = run; run = null;
    playToken = null;
    if(r.h && r.h.stop) r.h.stop();
    if(cur === r.lesson) refreshStep(r.i);
  }
  function finish(me, res){
    const { i, lesson, h } = me;
    run = null;
    if(h && h.stop) h.stop();
    const p = progFor(lesson), wasDone = lessonDone(lesson, p);
    const r = recordStep(p, lesson, i, res, dayKey(new Date()));
    // Tekrar adımı: günün ilk denemesi aralığı uzatır ya da kısaltır
    if(lesson.daily && lesson.steps[i].rev){
      const srs = store.get("lesson.srs", {}); srsUpdate(srs, lesson.steps[i].rev, r.ok, dayKey(new Date())); store.set("lesson.srs", srs);
    }
    if(lesson.daily && !wasDone && r.done){
      const dd = store.get("lesson.dailyDone", []);
      if(!dd.includes(daily.day)){ dd.push(daily.day); store.set("lesson.dailyDone", dd.slice(-400)); }
    }
    save();
    if(lesson.steps[i].type !== "listen")
      $("lss"+i).insertAdjacentHTML("beforeend", `<div class="fb ${r.ok ? "good" : "bad"}">${r.ok ? "Geçtin!" : "Geçme koşulu sağlanmadı; tekrar dene."}</div>`);
    if(cur === lesson){ refreshStep(i); renderList(); renderNext(); }
  }

  const q = (stage, s) => stage.querySelector(s);
  const RUN = {
    ...Object.fromEntries(Object.entries(TRAINER_STEPS).map(([k, fn]) => [k, (st, stage, done) => fn(st, stage, done, ctx)])),
    listen(st, stage, done){
      if(st.pattern){
        stage.innerHTML = `<div class="label">${esc(stepTitle(st, LANG))}</div><div class="scorewrap"></div>`;
        const wrap = stage.querySelector(".scorewrap"), sc = drawScore(wrap, techPattern(st.pattern).notes, { meter:[4,4] });
        playPattern(st, k => curScore(sc.svg, k, wrap)).then(ok => { if(ok) done({ v:1 }); });
        return { stop(){ playToken = null; SK.stopSound(); } };
      }
      if(st.orn){
        const token = {}; playToken = token;
        stage.innerHTML = `<div class="label">${esc(stepTitle(st, LANG))}</div>`;
        SK.showNote(ornSpec(st).note);
        playOrn(st).then(() => { if(playToken === token) done({ v:1 }); });
        return { stop(){ playToken = null; SK.stopSound(); } };
      }
      const items = itemsOf(st);
      stage.innerHTML = `<div class="chiprow">${items.map(([w], k) => `<span class="pchip"><b>${st.commas ? perdeName(st.commas[k]) : nn(w)}</b><small>${st.commas ? nn(w) : perdeOf(w)}</small></span>`).join("")}</div>`;
      const chips = stage.querySelectorAll(".pchip");
      playSeq(items, k => chips.forEach((c, j) => { c.classList.toggle("cur", j === k); c.classList.toggle("good", j < k); }))
        .then(ok => { if(ok){ chips.forEach(c => { c.classList.remove("cur"); c.classList.add("good"); }); done({ v:1 }); } });
      return { stop(){ playToken = null; SK.stopSound(); } };
    },

    hold(st, stage, done){
      const w = st.note, tp = nearestPerde((w-67)*53/12);
      const target = st.comma != null ? tgt(lessonMk(st), st.comma) : tp ? tp.comma : (w-67)*53/12;
      const name = nn(w) + " · " + perdeName(target);
      let start = null, devs = [], lastOk = 0, tqf = [];
      stage.innerHTML = `<div class="label">Çal ve tut: ${esc(name)}</div>
        <div class="ltclock lhc">0,0 <em>/ ${st.sec} sn</em></div>
        <div class="pbarfill"><i class="lhf"></i></div><div class="muted lhd">sapma: —</div>`;
      SK.showNote(w);
      function end(t){
        const durMs = start ? t - start : 0;
        if(!start || devs.length < 5){ start = null; devs = []; tqf = []; q(stage, ".lhd").textContent = "Nota tutulamadı, yeniden dene."; return; }
        const s = longToneScore(devs, durMs, st.sec*1000), tq = toneQuality(tqf);
        stage.innerHTML = `<div class="result"><div class="big">${s.score}</div><div>puan · ${esc(name)}</div></div>
          <div class="kv"><div><span class="label">Süre</span>${num(durMs/1000)} sn</div>
          <div><span class="label">Ortalama sapma</span>${sgn(s.mean)} koma</div>
          <div><span class="label">Yayılım</span>${num(s.sd, 2)} koma</div>${toneKv(tq)}</div>
          <div class="muted">${Math.abs(s.mean) > 0.5 ? (s.mean > 0 ? "Tiz çalıyorsun; dudak baskısını azalt ya da biraz daha pes düşün." : "Pes çalıyorsun; hava desteğini artır.") : "Perdeye yakın."} ${s.sd > 0.5 ? "Ses dalgalanıyor: hava akışını sabitle." : ""} ${toneTips(tq)}</div>
          ${st.quality && tq && tq.clarity < st.quality ? `<div class="fb bad">${L("Ses temizliği en az %", "Tone clarity must be at least ")}${st.quality}${L(" olmalı.", "%.")}</div>` : ""}`;
        const lh = store.get("long.hist", []); lh.push({ d: dayKey(new Date()), w, score:s.score, sd:+s.sd.toFixed(2), src:"ders" }); store.set("long.hist", lh.slice(-100));
        done({ v:s.score, q: tq ? tq.clarity : 0 });
      }
      return {
        note(r, t){
          if(!r.inRange) return;
          if(r.written !== w){ if(start && t - lastOk > 400) end(t); return; }
          if(!start){ start = t; devs = []; tqf = []; }
          lastOk = t;
          const dev = r.comma - target; devs.push(dev);
          const el = (t - start)/1000;
          q(stage, ".lhc").innerHTML = num(el) + ` <em>/ ${st.sec} sn</em>`;
          q(stage, ".lhf").style.width = Math.min(100, el/st.sec*100) + "%";
          q(stage, ".lhd").textContent = "sapma: " + sgn(dev) + " koma";
          if(el >= st.sec) end(t);
        },
        raw(d){ if(start) tqf.push({ rms:d.rms, clarity:d.clarity }); },
        silence(t){ if(start && t - lastOk > 400) end(t); }
      };
    },

    notes(st, stage, done){
      const seq = stepNotes(st), tg = st.commas || null, hold = holder(), devs = [];
      let i = 0, miss = 0, release = false, frames = [];
      stage.innerHTML = `<div class="qcount lnc"></div><div class="chiprow scroll">${seq.map((w, k) =>
        `<span class="pchip"><b>${tg ? perdeName(tg[k]) : nn(w)}</b><small>${tg ? nn(w) : perdeOf(w)}</small><i></i></span>`).join("")}</div>
        <div class="fb lnf" aria-live="polite"></div>`;
      const chips = stage.querySelectorAll(".pchip"), fb = q(stage, ".lnf");
      function focus(){
        chips.forEach((c, k) => { c.classList.toggle("cur", k === i); if(k < i && !c.classList.contains("off")) c.classList.add("good"); });
        if(chips[i]) chips[i].scrollIntoView({ block:"nearest", inline:"center" });
        q(stage, ".lnc").textContent = "Nota " + Math.min(i+1, seq.length) + "/" + seq.length + " · " + miss + " hata";
        if(i < seq.length && !SK.playing()) SK.showNote(seq[i]);
      }
      focus();
      return {
        note(r, t){
          if(i >= seq.length || !r.inRange) return;
          const h = hold.push(r.written, t), want = seq[i];
          // Aynı nota tekrar ediyorsa önce bırakılması (sessizlik ya da başka nota) beklenir
          if(release){ if(r.written !== seq[i-1]) release = false; else return; }
          if(r.written === want) frames.push(r.comma);
          if(h.fired) return;
          if(r.written === want && h.ms >= 200){
            hold.fire();
            if(tg){
              const dev = mean(frames) - tgt(lessonMk(st), tg[i]); devs.push(dev);
              chips[i].querySelector("i").textContent = sgn(dev);
              if(Math.abs(dev) > 1) chips[i].classList.add("off");
            }
            frames = []; i++;
            release = i < seq.length && seq[i] === want;
            fb.className = "fb lnf"; fb.textContent = "";
            focus();
            if(i >= seq.length){
              fb.className = "fb lnf good";
              fb.textContent = "Bitti! " + miss + " hata" + (devs.length ? " · ortalama sapma " + num(mean(devs.map(Math.abs))) + " koma" : "");
              done({ v:miss });
            }
          }else if(r.written !== want && h.ms >= 400){
            hold.fire(); miss++; frames = [];
            fb.className = "fb lnf bad"; fb.textContent = nn(r.written) + " çaldın; sıradaki " + nn(want) + ".";
            focus();
          }
        },
        silence(){ hold.reset(); release = false; frames = []; }
      };
    },

    quiz(st, stage, done){
      const stats = store.get("quiz.stats", {}), hold = holder();
      let k = 0, right = 0, last = null, cq = null, timer = null;
      function ask(){
        if(k >= st.n){
          stage.innerHTML = `<div class="result"><div class="big">${right}/${st.n}</div><div>doğru</div></div>`;
          cq = null;
          return done({ v:right });
        }
        const w = quizPickFrom(st.notes, stats, Math.random, last);
        last = w; cq = { w, t0: performance.now(), done:false }; hold.reset();
        stage.innerHTML = `<div class="qcount">Soru ${k+1}/${st.n} · ${right} doğru</div>`;
        if(st.mode === "play" || st.mode === "staff"){
          const box = document.createElement("div"); box.className = "qplay";
          const sv = staffSvg(); SK.drawStaffInto(sv, w);
          box.innerHTML = st.mode === "staff" ? `<div><div class="label">${L("Dizekteki notayı çal", "Play the note on the staff")}</div><div class="qname">?</div></div>`
            : `<div><div class="label">Bu notayı çal</div><div class="qname">${nn(w)} <em>yazılı</em></div><div class="muted">${perdeOf(w)}</div></div>`;
          box.appendChild(sv); stage.appendChild(box);
        }else{
          const box = document.createElement("div"); box.className = "qfind";
          const ch = miniChart(); paintMini(ch, fingeringsFor(w)[0].code); box.appendChild(ch);
          const side = document.createElement("div");
          side.innerHTML = `<div class="label">Bu parmak hangi nota?</div>`;
          const opts = document.createElement("div"); opts.className = "qopts";
          choicesFrom(st.notes, w).forEach(c => {
            const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.dataset.w = c;
            b.textContent = nn(c); b.addEventListener("click", () => answer(c)); opts.appendChild(b);
          });
          side.appendChild(opts);
          side.insertAdjacentHTML("beforeend", `<div class="muted">Mikrofon açıksa çalarak da cevaplayabilirsin.</div>`);
          box.appendChild(side); stage.appendChild(box);
        }
        stage.insertAdjacentHTML("beforeend", `<div class="fb lqf" aria-live="polite"></div>`);
      }
      function answer(played){
        if(!cq || cq.done) return;
        cq.done = true;
        const res = compareNote(cq.w, played), ok = res === "ok", ms = performance.now() - cq.t0;
        quizRecord(stats, cq.w, ok, ms); store.set("quiz.stats", stats);
        if(ok) right++;
        stage.querySelectorAll(".opt").forEach(b => {
          if(+b.dataset.w === cq.w) b.classList.add("right"); else if(+b.dataset.w === played) b.classList.add("wrong");
        });
        const fb = q(stage, ".lqf");
        fb.className = "fb lqf " + (ok ? "good" : "bad");
        fb.textContent = ok ? "Doğru! (" + num(ms/1000) + " sn)"
          : res === "octave" ? "Oktav hatası: " + nn(played) + " çaldın, istenen " + nn(cq.w) + ". Doğru parmak yukarıdaki şemada."
          : "Yanlış: " + nn(played) + ". Doğrusu " + nn(cq.w) + " — parmağı yukarıdaki şemada.";
        if(!ok) SK.showNote(cq.w);
        k++;
        timer = setTimeout(ask, ok ? 1000 : 2400);
      }
      ask();
      return {
        note(r, t){
          if(!cq || cq.done || !r.inRange) return;
          const h = hold.push(r.written, t);
          if(!h.fired && h.ms >= 500){ hold.fire(); answer(r.written); }
        },
        silence(){ hold.reset(); },
        stop(){ clearTimeout(timer); cq = null; }
      };
    },

    scale(st, stage, done){
      const mk = makamById(st.makam), s = [...mk.asc, ...[...mk.desc].reverse().slice(1)], all = [...mk.asc, ...mk.desc];
      const hold = holder(), res = [];
      let i = 0, frames = [];
      markScale(mk);
      stage.innerHTML = `<div class="chiprow">${s.map(c => `<span class="pchip${c===mk.durak ? " durak" : ""}${c===mk.guclu ? " guclu" : ""}">
          <b>${perdeName(c)}</b><small>${nn(commaToWritten(c))}</small><i></i></span>`).join("")}</div>
        <div class="label">${L("Sıradaki perde", "Next perde")}</div><div class="qname lsn"></div><div class="fb lsf" aria-live="polite"></div>`;
      const chips = stage.querySelectorAll(".pchip"), fb = q(stage, ".lsf");
      function next(){
        hold.reset(); frames = [];
        chips.forEach((c, k) => c.classList.toggle("cur", k === i));
        q(stage, ".lsn").innerHTML = perdeName(s[i]) + ` <em>${L("yazılı", "written")} ${nn(commaToWritten(s[i]))} · ${i < mk.asc.length ? L("çıkış", "going up") : L("iniş", "coming down")}</em>`;
      }
      function judge(){
        const c = s[i], j = judgePerde(mean(frames), tgt(mk, c), all);
        res.push(j);
        chips[i].classList.remove("cur"); chips[i].classList.add(j.ok ? "good" : "off");
        chips[i].querySelector("i").textContent = sgn(j.dev);
        fb.className = "fb lsf " + (j.ok ? "good" : "bad");
        fb.textContent = perdeName(c) + ": " + sgn(j.dev) + L(" koma", " commas") + (j.ok ? L(" — temiz", " — clean") : j.dev > 0 ? L(" — tiz", " — sharp") : L(" — pes", " — flat")) +
          (j.other ? ". " + L(j.other + " perdesine daha yakın çaldın.", "That was closer to " + j.other + ".") : "");
        i++;
        if(i < s.length) return next();
        const avg = mean(res.map(r => Math.abs(r.dev))), clean = res.filter(r => r.ok).length;
        const d = ms.done[mk.id] || { n:0, best:99 };
        d.n++; d.best = Math.min(d.best, avg); ms.done[mk.id] = d; store.set("makam.done", ms.done);
        q(stage, ".lsn").innerHTML = `${clean}/${res.length} <em>${L("perde temiz (±1 koma) · ortalama sapma " + num(avg) + " koma", "perdes clean (±1 comma) · average deviation " + num(avg) + " commas")}</em>`;
        done({ v: clean / res.length });
      }
      next();
      return {
        note(r, t){
          if(i >= s.length) return;
          const want = commaToWritten(s[i]), h = hold.push(r.written, t);
          if(r.written === want){
            frames.push(r.comma);
            if(!h.fired && h.ms >= 400){ hold.fire(); judge(); }
          }else if(!h.fired && h.ms >= 700){
            hold.fire();
            fb.className = "fb lsf bad";
            fb.textContent = L(nn(r.written) + " çalıyorsun; beklenen " + perdeName(s[i]) + " (yazılı " + nn(want) + ").", "You're playing " + nn(r.written) + "; expected " + perdeName(s[i]) + " (written " + nn(want) + ").");
          }
        },
        silence(){ hold.reset(); frames = []; }
      };
    },

    mimic(st, stage, done){
      const pool = st.makam ? [...makamById(st.makam).asc] : st.commas, hold = holder();
      let len = 3, motif = null, idx = 0, listening = false, alive = true, timer = null;
      function draw(){
        stage.innerHTML = `<div class="qcount">Uzunluk ${len} · hedef ${st.len}</div>
          <div class="chiprow">${motif.map(() => `<span class="pchip blank"><b>?</b></span>`).join("")}</div>
          <div class="pbar"><button class="stopbtn lma" type="button">Tekrar dinle</button></div>
          <div class="fb lmf" aria-live="polite">Dinle…</div>`;
        q(stage, ".lma").addEventListener("click", () => { if(alive && motif){ draw(); playMotif(); } });
      }
      async function playMotif(){
        listening = false;
        const ok = await playSeq(fromCommas(motif, st));
        if(!ok || !alive) return;
        listening = true; idx = 0; hold.reset();
        const fb = q(stage, ".lmf"); fb.className = "fb lmf"; fb.textContent = "Şimdi sen çal.";
      }
      function round(){
        if(!alive) return;
        motif = makeMotif(pool, len); draw(); playMotif();
      }
      function reveal(k, ok){
        const el = stage.querySelectorAll(".pchip")[k]; if(!el) return;
        el.classList.remove("blank"); el.classList.add(ok ? "good" : "off");
        el.querySelector("b").textContent = perdeName(motif[k]);
      }
      round();
      return {
        note(r, t){
          if(!listening || !r.inRange) return;
          const h = hold.push(r.written, t);
          if(h.fired || h.ms < 150) return;
          hold.fire();
          const want = commaToWritten(motif[idx]), fb = q(stage, ".lmf");
          if(r.written === want){
            reveal(idx, true); idx++;
            if(idx < motif.length) return;
            listening = false;
            fb.className = "fb lmf good";
            if(len >= st.len){ fb.textContent = len + " notalık ezgiyi doğru çaldın!"; return done({ v:len }); }
            fb.textContent = "Doğru! Bir nota daha ekleniyor.";
            len++; timer = setTimeout(round, 1300);
          }else{
            listening = false;
            motif.forEach((_, k) => { if(k > idx) reveal(k, true); });
            reveal(idx, false);
            fb.className = "fb lmf bad";
            fb.textContent = nn(r.written) + " çaldın; beklenen " + perdeName(motif[idx]) + " (yazılı " + nn(want) + "). Yeni ezgi geliyor.";
            len = Math.max(3, len-1); timer = setTimeout(round, 2600);
          }
        },
        silence(){ hold.reset(); },
        stop(){ alive = false; listening = false; clearTimeout(timer); }
      };
    },

    vibrato(st, stage, done){
      let on = false, frames = [], acc = 0, lastEval = 0, best = null;
      stage.innerHTML = `<div class="label">Çal: ${nn(st.note)} · vibrato yap</div>
        <div class="ltclock lvc">0,0 <em>/ ${st.sec} sn</em></div>
        <div class="pbarfill"><i class="lvf"></i></div><div class="muted lvd">vibrato: —</div>`;
      SK.showNote(st.note);
      return {
        note(r){ const was = on; on = r.written === st.note; if(!on || !was){ frames = []; lastEval = 0; } },
        raw(d){
          if(!on) return;
          frames.push({ t:d.t, comma:d.comma });
          while(frames.length && d.t - frames[0].t > 1500) frames.shift();
          if(lastEval && d.t - lastEval < 200) return;
          const dt = lastEval ? d.t - lastEval : 0; lastEval = d.t;
          const v = vibrato(frames, SK.windowSec());
          const good = v && v.rate >= 4 && v.rate <= 8;
          if(good){ acc += dt; best = v; }
          q(stage, ".lvd").innerHTML = v ? num(v.rate) + " Hz ±" + num(v.depth) + " koma" + (good ? "" : " — 4–8 Hz arası olmalı") : "vibrato: — <em>düz</em>";
          q(stage, ".lvc").innerHTML = num(acc/1000) + ` <em>/ ${st.sec} sn</em>`;
          q(stage, ".lvf").style.width = Math.min(100, acc/(st.sec*10)) + "%";
          if(acc >= st.sec*1000){
            on = false;
            q(stage, ".lvd").textContent = "Düzenli vibrato: " + num(best.rate) + " Hz ±" + num(best.depth) + " koma";
            done({ v:st.sec });
          }
        },
        silence(){ on = false; frames = []; lastEval = 0; }
      };
    },

    glide(st, stage, done){
      // Kalkış notasında son görülen an (anchor) ile varış notası arasındaki ham ölçümler sürekli kayıyorsa sayılır;
      // aradaki kısa duraklar (ara notalar) kaymayı bozmaz.
      let count = 0, anchor = null, path = [];
      stage.innerHTML = `<div class="label">${nn(st.from)} → ${nn(st.to)}: parmakları kaydırarak çık</div>
        <div class="ltclock lgc">0 <em>/ ${st.n}</em></div><div class="fb lgf" aria-live="polite"></div>`;
      SK.showNote(st.from);
      return {
        raw(d){ if(anchor) path.push({ t:d.t, comma:d.comma }); },
        note(r, t){
          if(r.written === st.from){ anchor = { t, comma:r.comma }; path = []; return; }
          if(!anchor) return;
          if(t - anchor.t > 3000){ anchor = null; path = []; return; }
          if(r.written !== st.to) return;
          const fb = q(stage, ".lgf");
          if(glideBetween([anchor, ...path, { t, comma:r.comma }])){
            count++; SK.markGlide(t);
            q(stage, ".lgc").innerHTML = count + ` <em>/ ${st.n}</em>`;
            fb.className = "fb lgf good"; fb.textContent = "Güzel kayış!";
            if(count >= st.n){ anchor = null; return done({ v:count }); }
          }else{
            fb.className = "fb lgf bad"; fb.textContent = "Atladın; parmakları deliklerden yavaşça sıyırarak kaydır.";
          }
          anchor = null; path = [];
        },
        silence(){ anchor = null; path = []; }
      };
    }
  };

  // Seviye sınamasının makam turları (onboard.js): bir ders adımını ders ilerlemesine yazmadan çalıştırır. Notaları çağıran
  // iletir (note, silence). Adım bitince ya da stop() ile akort bağlamı açık dersinkine döner; stop() onDone çağırmaz.
  SK.stepTry = (st, stage, onDone) => {
    let h = null, over = false;
    const end = () => {
      if(over) return; over = true;
      if(h && h.stop) h.stop();
      const mk = cur && cur.makam || null;
      SK.setTempContext(mk); markScale(mk ? makamById(mk) : null);
    };
    if(st.makam) SK.setTempContext(st.makam);
    h = RUN[st.type](st, stage, res => { if(over) return; end(); onDone(res); });
    return { note(r, t){ if(!over && h.note) h.note(r, t); }, silence(t){ if(!over && h.silence) h.silence(t); }, stop: end };
  };

  // Bağlantıdaki ders (?ders=<id>) kayıtlı dersten önce gelir; kilitliyse sıradaki ders açılır
  const saved = new URLSearchParams(location.search).get("ders") || store.get("lesson.cur", ""), savedL = lessonById(saved);
  open(saved === "daily" ? dailyLesson() : savedL && unlocked(savedL, prog, allOpen) ? savedL : (nextUp() || LESSONS[0]));
  return {
    enter(){ renderList(); if(cur){ SK.setTempContext(cur.makam || null); markScale(cur.makam ? makamById(cur.makam) : null); } },
    nowTitle: () => cur ? tx(cur.title) : "",
    stop(){ playToken = null; stopRun(); },
    leave(){ stopRun(); SK.setTempContext(null); },
    note(r, t){ if(run && run.h && run.h.note) run.h.note(r, t); },
    silence(t){ if(run && run.h && run.h.silence) run.h.silence(t); },
    raw(d){ if(run && run.h && run.h.raw) run.h.raw(d); }
  };
};

// ---- Videolar: Çorlu Klarnet Üstatları kanalından eğitim videoları (veri videos.js'te) ----
TRAINERS.videos = function(ctx){
  const { $ } = ctx;
  const P = $("pp-videos");
  const mks = MAKAMS.filter(m => VIDEOS.some(v => v.makam === m.id));
  P.innerHTML = `
    <p class="pdesc">${L("Sol klarnet hocaları İlhan Küçükcivan ve Ömür Küçükler'in eğitim videoları: makam anlatımları, etütler, teknik, süsleme, taksim ve örnek eserler. Dokununca YouTube'da açılır. Derslerin altında o derse uygun videolar da var.",
      "Teaching videos by Sol clarinet masters İlhan Küçükcivan and Ömür Küçükler: makams, études, technique, ornaments, taksim and example pieces. In Turkish; tap to open on YouTube. Each lesson also lists the videos that fit it.")}</p>
    <div class="vfilt">
      <select id="vcat" aria-label="${L("Konu", "Topic")}"><option value="">${L("Bütün konular", "All topics")}</option>${VIDEO_CATS.map(c => `<option value="${c.id}">${pick(c.name, LANG)}</option>`).join("")}</select>
      <select id="vmk" aria-label="Makam"><option value="">${L("Bütün makamlar", "All makams")}</option>${mks.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}</select>
      <input id="vq" type="search" placeholder="${L("Ara", "Search")}" aria-label="${L("Videolarda ara", "Search videos")}">
    </div>
    <details class="vstyle"><summary>${L("Üslup üzerine", "On playing styles")}</summary>
      <p>${L("Türk klarnet icrasında farklı tavırlar vardır: klasik Türk musikisi (fasıl, şarkı ve saz eserleri), Trakya ve Roman oyun havaları, modern ve karma icra. Bunlar doğru ya da yanlış değil, farklı üsluplardır: aynı makam farklı tavırlarda farklı süslenir, farklı perdelenir ve farklı cümlelenir.", "Turkish clarinet playing has several styles: classical Turkish music (fasıl, songs and instrumental pieces), Thracian and Romani dance music, and modern or mixed playing. None is right or wrong; they are styles. The same makam is ornamented, tuned and phrased differently in each.")}</p>
      <p>${L("Buradaki videoların hepsi Çorlu'dan iki Sol klarnet hocasınındır ve onların tavrını gösterir. Başka icracılardan ve üsluplardan örnekler henüz yok. Etiketler (eski tavır, oyun havası, yakın çekim) yalnızca video başlığında yazandan alındı.", "All videos here are by two Sol clarinet teachers from Çorlu and show their style. Examples from other players and styles are not here yet. Tags (old style, dance tune, close-up) come only from what the video title says.")}</p></details>
    <div id="vout"></div>
    <p class="muted small">${L("Kaynak:", "Source:")} <a href="${VIDEO_CHANNEL}" target="_blank" rel="noopener">Çorlu Klarnet Üstatları</a> (YouTube). ${L("Videolar kanal sahiplerine aittir.", "Videos belong to the channel's owners.")}</p>`;
  const fold = s => s.toLocaleLowerCase("tr").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i");
  function render(){
    const cat = $("vcat").value, mk = $("vmk").value, q = fold($("vq").value.trim());
    const list = VIDEOS.filter(v => (!cat || v.cat === cat) && (!mk || v.makam === mk) && (!q || fold(v.title + " " + (VIDEO_BY[v.by] || "")).includes(q)));
    $("vout").innerHTML = list.length ? VIDEO_CATS.map(c => {
      const vs = list.filter(v => v.cat === c.id);
      return vs.length ? `<div class="label">${pick(c.name, LANG)} <small>${vs.length}</small></div>${videoRowsHtml(vs)}` : "";
    }).join("") : `<p class="muted">${L("Bu seçimde video yok.", "No videos match.")}</p>`;
  }
  ["vcat", "vmk"].forEach(id => $(id).addEventListener("change", render));
  $("vq").addEventListener("input", render);
  render();
  return {};
};
