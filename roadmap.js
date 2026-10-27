// Yol haritası: sıfırdan ustalığa altı aşama. Her aşama bazı ünitelerin dersleri ve ölçülen kilometre taşlarından oluşur
// (uzun ton puanı, ritim, kulak eşiği, hız, tril, seyir, deşifre, dikte, eserler, eşlikle çalma). Son 4 haftanın çalışma
// hızından kalan sürenin tahmini ve haftalık görünüm. Hedef tarz seçilirse (oyun havaları / klasik) aşamaların sırası değişir.
// Mantık tarayıcıda ve Node'da (require("./roadmap.js")); sekme dosyanın sonunda.

const RMLESSONS = typeof module !== "undefined" ? require("./lessons.js") : { LESSONS, UNITS, lessonDone, nextLesson, examFor };
const RMLEARN = typeof module !== "undefined" ? require("./learn.js") : { dayKey, unlockedLevels };

// Kilometre taşı: { id, title, tab (açılacak alıştırma), get(st) → ölçülen değer (null: henüz yok), target, lower (küçük iyi) }
// st: roadmapStats'ın topladığı değerler
const RM_STAGES = [
  { id:"baslangic", units:["baslangic","temel"], title:{ tr:"Başlangıç: ilk sesler", en:"Beginner: first sounds" },
    goal:{ tr:"Klarneti kurar, nefesle temiz ses çıkarır, iki elle Mi3–Sol4 arasını çalarsın.", en:"You assemble the clarinet, make a clean sound and play E3–G4 with both hands." },
    miles:[
      { id:"long67", tab:"long", title:{ tr:"Açık Sol'da uzun ton", en:"Long tone on open G" }, unit:{ tr:" puan", en:" pts" }, target:60, get: st => st.longBest[67] || null },
      { id:"quiz1", tab:"quiz", title:{ tr:"Parmak testi: klarino bölgesi açıldı", en:"Fingering quiz: clarion region unlocked" }, unit:{ tr:" bölge", en:" regions" }, target:2, get: st => st.quizRegions }
    ] },
  { id:"temel", units:["klarino","teknik"], title:{ tr:"Temel çalgıcı: register, ritim, okuma", en:"Core player: register, rhythm, reading" },
    goal:{ tr:"Klarino bölgesi, dil vuruşu, dinamik, usuller; notayı ilk görüşte okur ve koma farkını duyarsın.", en:"The clarion register, tonguing, dynamics, usuls; you sight-read and hear comma differences." },
    miles:[
      { id:"rhythm", tab:"rhythm", title:{ tr:"Ritim puanı", en:"Rhythm score" }, unit:{ tr:" puan", en:" pts" }, target:75, get: st => st.rhythmBest || null },
      { id:"ear", tab:"ear", title:{ tr:"Kulak eşiği (tiz mi pes mi)", en:"Ear threshold (higher or lower)" }, unit:{ tr:" koma", en:" commas" }, target:2, lower:true, get: st => st.earPitch },
      { id:"sight2", tab:"desifre", title:{ tr:"Deşifre seviye 2", en:"Sight-reading level 2" }, unit:{ tr:"%", en:"%" }, target:70, get: st => st.sightBest[2] || null },
      { id:"dictr", tab:"dikte", title:{ tr:"Ritim diktesi seviye 2 (10 soruda)", en:"Rhythm dictation level 2 (of 10)" }, unit:{ tr:" doğru", en:" right" }, target:7, get: st => st.dictBest.rhythm2 || null }
    ] },
  { id:"orta", units:["hiz","susleme"], title:{ tr:"Orta: hız ve süsleme", en:"Intermediate: speed and ornaments" },
    goal:{ tr:"Gam ve arpejleri metronomla hızlanarak, çarpma, mordan, tril ve kayışları ölçülü çalarsın.", en:"Scales and arpeggios speeding up with the metronome; grace notes, mordents, trills and slides, measured." },
    miles:[
      { id:"tech", tab:"hiz", title:{ tr:"Hız: en iyi temiz tempo", en:"Speed: best clean tempo" }, unit:{ tr:" ♩", en:" ♩" }, target:100, get: st => st.techBest || null },
      { id:"tril", tab:"susleme", title:{ tr:"Tril hızı", en:"Trill speed" }, unit:{ tr:" dönüş/sn", en:" turns/s" }, target:6, get: st => st.trilBest || null },
      { id:"carpma", tab:"susleme", title:{ tr:"Çarpma başarısı (son 20)", en:"Grace notes (last 20)" }, unit:{ tr:"%", en:"%" }, target:70, get: st => st.carpmaRate }
    ] },
  { id:"makam", units:["makam"], title:{ tr:"Makamlar", en:"Makams" },
    goal:{ tr:"Dokuz temel ve on genişletilmiş makamın dizisini, seyrini ve icra akordunu oturtursun.", en:"You settle the scale, seyir and practice tuning of nine basic and ten extended makams." },
    miles:[
      { id:"seyir", tab:"seyir", title:{ tr:"Seyir puanı", en:"Seyir score" }, unit:{ tr:" puan", en:" pts" }, target:65, get: st => st.seyirBest || null },
      { id:"makamid", tab:"ear", title:{ tr:"Makam tanıma rekoru", en:"Makam ID record" }, unit:{ tr:" art arda", en:" in a row" }, target:5, get: st => st.earMakam || null },
      { id:"dictm", tab:"dikte", title:{ tr:"Ezgi diktesi seviye 2 (10 soruda)", en:"Melodic dictation level 2 (of 10)" }, unit:{ tr:" doğru", en:" right" }, target:6, get: st => st.dictBest.melody2 || null }
    ] },
  { id:"trakya", units:["trakya"], title:{ tr:"Oyun havaları: Trakya ve Roman", en:"Dance tunes: Thracian and Roman" },
    goal:{ tr:"Kasap, karşılama, Roman havası, çiftetelli ve Rumeli havalarını usule oturarak, üslubuyla ve eşlikle çalarsın.", en:"You play kasap, karşılama, Roman havası, çiftetelli and Rumeli tunes in the groove, in style and with a band." },
    miles:[
      { id:"roman", tab:"piece", title:{ tr:"Roman havası etüdü (tempolu)", en:"Roman havası étude (in tempo)" }, unit:{ tr:"%", en:"%" }, target:80, get: st => st.pieceBest["e-roman"] || null },
      { id:"karsilama", tab:"piece", title:{ tr:"Karşılama etüdü (tempolu)", en:"Karşılama étude (in tempo)" }, unit:{ tr:"%", en:"%" }, target:80, get: st => st.pieceBest["e-karsilama"] || null },
      { id:"groove", tab:"band", title:{ tr:"Eşlikle çalarken usule oturma", en:"In the groove with the band" }, unit:{ tr:"%", en:"%" }, target:75, get: st => st.bandGrid }
    ] },
  { id:"ileri", units:["ileri"], title:{ tr:"İleri: taksim ve ustalık", en:"Advanced: taksim and mastery" },
    goal:{ tr:"Taksim yapar, bir komayı duyar, metronomsuz tempoyu korur, makam perdeli notayı ilk görüşte okursun.", en:"You play a taksim, hear a single comma, keep tempo without a click and sight-read makam scores." },
    miles:[
      { id:"ear1", tab:"ear", title:{ tr:"Kulak eşiği 1 koma", en:"Ear threshold 1 comma" }, unit:{ tr:" koma", en:" commas" }, target:1, lower:true, get: st => st.earPitch },
      { id:"seyir3", tab:"seyir", title:{ tr:"Üç makamda seyir puanı 75", en:"Seyir 75 in three makams" }, unit:{ tr:" makam", en:" makams" }, target:3, get: st => st.seyirMakams75 },
      { id:"sight4", tab:"desifre", title:{ tr:"Deşifre seviye 4", en:"Sight-reading level 4" }, unit:{ tr:"%", en:"%" }, target:70, get: st => st.sightBest[4] || null }
    ] }
];
// Hedef tarz: "dance" oyun havalarını makam aşamasından önceye alır
function stageOrder(style){
  const ids = RM_STAGES.map(s => s.id);
  if(style === "dance"){ const i = ids.indexOf("trakya"); ids.splice(i, 1); ids.splice(ids.indexOf("makam"), 0, "trakya"); }
  return ids.map(id => RM_STAGES.find(s => s.id === id));
}
const milestoneMet = (m, v) => v != null && (m.lower ? v <= m.target : v >= m.target);

// Kayıtlı ilerlemeden kilometre taşlarının ham değerleri. get(key, def): store okuyucu
function roadmapStats(get){
  const longBest = {}; for(const [w, b] of Object.entries(get("long.best", {}))) longBest[w] = b.score;
  const tb = get("tech.best", {}); let techBest = 0;
  for(const l of Object.values(tb)) for(const x of l) techBest = Math.max(techBest, x.tempo);
  const c = get("orn.hist", []).filter(h => h.kind === "carpma").slice(-20);
  const sy = get("seyir.hist", []), syBy = {};
  sy.forEach(x => { syBy[x.mk] = Math.max(syBy[x.mk] || 0, x.score); });
  const ear = get("ear.best", {}), band = get("band.hist", []).filter(x => x.grid != null && x.bars >= 8);
  return {
    prog: get("lesson.prog", {}), days: get("days", {}), goalMin: get("goal.min", 15), dailyDone: get("lesson.dailyDone", []),
    longBest, quizRegions: RMLEARN.unlockedLevels(get("quiz.recent", {})),
    rhythmBest: get("rhythm.best", 0), earPitch: ear.pitch != null ? ear.pitch : null, earMakam: ear.makam || 0,
    sightBest: get("sight.best", {}), dictBest: get("dict.best", {}),
    techBest, trilBest: get("orn.trilBest", 0), carpmaRate: c.length >= 5 ? Math.round(c.filter(h => h.ok).length/c.length*100) : null,
    seyirBest: sy.reduce((a, x) => Math.max(a, x.score), 0), seyirMakams75: Object.values(syBy).filter(v => v >= 75).length,
    pieceBest: get("piece.best", {}), bandGrid: band.length ? Math.max(...band.map(x => x.grid)) : null
  };
}
// Aşamaların durumu: { stage, lessons:{done,total}, miles:[{m, v, ok}], done, pct }; ilk bitmemiş aşama current
function roadmapStatus(st, style){
  const out = stageOrder(style).map(stage => {
    const ls = RMLESSONS.LESSONS.filter(l => stage.units.includes(l.unit));
    const done = ls.filter(l => RMLESSONS.lessonDone(l, st.prog)).length;
    const miles = stage.miles.map(m => { const v = m.get(st); return { m, v, ok: milestoneMet(m, v) }; });
    const parts = ls.length + miles.length, got = done + miles.filter(x => x.ok).length;
    return { stage, lessons:{ done, total: ls.length }, miles, done: got === parts, pct: parts ? Math.round(got/parts*100) : 100 };
  });
  const cur = out.find(s => !s.done);
  out.forEach(s => { s.current = s === cur; });
  return out;
}
// Çalışma hızı: son 28 günde bitirilen ders sayısı. Yeterli veri yoksa (2'den az ders ve 5'ten az çalışılan gün) plan
// hızı: haftada 5 gün günlük hedef kadar, her ders ≈ 3 günlük çalışma. Dönen: { perWeek, basis: "actual"|"plan",
// minPerDay, activeDays, weeks: [aşama başına kalan hafta], total }
function roadmapPace(st, status, today = new Date()){
  const from = new Date(today); from.setDate(from.getDate() - 28);
  const fk = RMLEARN.dayKey(from);
  const recent = Object.values(st.prog).filter(p => p.d && p.d > fk).length;
  let mins = 0, active = 0;
  for(let k=0;k<28;k++){ const d = new Date(today); d.setDate(d.getDate() - k); const s = st.days[RMLEARN.dayKey(d)] || 0; mins += s/60; if(s >= 60) active++; }
  const minPerDay = mins/28;
  const plan = 5/3, actual = recent >= 2 || active >= 5;
  const perWeek = actual ? Math.max(recent/4, minPerDay*7/(st.goalMin*3), 0.25) : plan;
  // Kilometre taşı başına bir derslik çalışma sayılır
  const weeks = status.map(s => s.done ? 0 : ((s.lessons.total - s.lessons.done) + s.miles.filter(x => !x.ok).length)/perWeek);
  return { perWeek, basis: actual ? "actual" : "plan", minPerDay, activeDays: active, weeks, total: weeks.reduce((a, b) => a + b, 0) };
}
// Bu hafta (pazartesiden): her gün { key, sec, state: "goal"|"some"|"none"|"future" }
function weekView(days, goalMin, today = new Date()){
  const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d0.setDate(d0.getDate() - ((d0.getDay() + 6) % 7));
  const out = [];
  for(let i=0;i<7;i++){
    const d = new Date(d0); d.setDate(d0.getDate() + i);
    const k = RMLEARN.dayKey(d), s = days[k] || 0, fut = d > today;
    out.push({ key:k, day:d.getDay(), sec:s, state: fut ? "future" : s >= goalMin*60 ? "goal" : s >= 60 ? "some" : "none" });
  }
  return out;
}

// ---- Rozetler ----
// En uzun seri: en az 60 sn çalışılan art arda günler
function bestStreak(days){
  const ks = Object.keys(days).filter(k => days[k] >= 60).sort();
  let best = 0, run = 0, prev = null;
  for(const k of ks){
    const [y, m, d] = k.split("-").map(Number), t = Date.UTC(y, m - 1, d)/864e5;
    run = prev !== null && t - prev === 1 ? run + 1 : 1; prev = t; best = Math.max(best, run);
  }
  return best;
}
const RM_TIERS = {
  streak: { days:[3, 7, 14, 30, 100], name: n => ({ tr: n + " gün seri", en: n + "-day streak" }) },
  daily:  { days:[7, 30, 100], name: n => ({ tr: n + " günlük çalışma", en: n + " daily routines" }) },
  hours:  { days:[5, 25, 100], name: n => ({ tr: n + " saat klarnet", en: n + " hours of clarinet" }) }
};
// Rozetler: ünite sınavları ve seri, günlük çalışma ve toplam süre basamakları.
// Dönen: [{ id, group: "unit"|"streak"|"daily"|"hours", name:{tr,en}, got, v (şu anki değer), target }]
function badgeList(st){
  const out = [];
  for(const u of RMLESSONS.UNITS){
    const ex = RMLESSONS.examFor(u.id); if(!ex) continue;
    const p = st.prog[ex.id];
    out.push({ id:"unit-" + u.id, group:"unit", name:u.badge, got: !!(p && p.d), v: p && p.d ? 1 : 0, target:1, unit:u.id });
  }
  const val = { streak: bestStreak(st.days), daily: (st.dailyDone || []).length,
                hours: Object.values(st.days).reduce((a, b) => a + b, 0)/3600 };
  for(const [g, t] of Object.entries(RM_TIERS)) for(const n of t.days)
    out.push({ id: g + n, group:g, name: t.name(n), got: val[g] >= n, v: val[g], target:n });
  return out;
}
// Haftalık özet: bu hafta (pazartesiden bugüne) ve geçen hafta. Her biri { min, active, lessons, daily, goalDays }
function weekSummary(st, today = new Date()){
  const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d0.setDate(d0.getDate() - ((d0.getDay() + 6) % 7));
  const span = (from, n) => {
    const keys = []; for(let i=0;i<n;i++){ const d = new Date(from); d.setDate(from.getDate() + i); keys.push(RMLEARN.dayKey(d)); }
    const set = new Set(keys), sec = keys.map(k => st.days[k] || 0);
    return { min: Math.round(sec.reduce((a, b) => a + b, 0)/60), active: sec.filter(s => s >= 60).length,
      goalDays: sec.filter(s => s >= st.goalMin*60).length,
      lessons: Object.values(st.prog).filter(p => p.d && set.has(p.d)).length,
      daily: (st.dailyDone || []).filter(k => set.has(k)).length };
  };
  const n = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - d0)/864e5) + 1;
  const prev = new Date(d0); prev.setDate(d0.getDate() - 7);
  return { cur: span(d0, n), prev: span(prev, 7), days: n };
}

if(typeof module !== "undefined") module.exports = { RM_STAGES, stageOrder, milestoneMet, roadmapStats, roadmapStatus, roadmapPace, weekView, bestStreak, badgeList, weekSummary };

// ======== Sekme ========
if(typeof TRAINERS !== "undefined") TRAINERS.roadmap = function(ctx){
  const { $, store, esc, num, days } = ctx;
  const P = $("pp-roadmap");
  const tx = x => pick(x, LANG);
  const DAYN = LANG === "en" ? ["Mo","Tu","We","Th","Fr","Sa","Su"] : ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];
  // Haftalık özet: bu hafta ve geçen haftanın aynı kalemleri, artış/azalış okuyla
  function weekHtml(){
    const st = roadmapStats((k, d) => store.get(k, d)), w = weekSummary(st);
    const row = (lab, a, b, unit = "") => `<div><span class="label">${lab}</span><b>${a}${unit}</b> <small class="muted">${L("geçen hafta ", "last week ")}${b}${unit}${a > b ? " ↑" : a < b && w.days === 7 ? " ↓" : ""}</small></div>`;
    return `<details class="rmsum" open><summary>${L("Haftalık özet", "Weekly summary")}</summary><div class="kv">
      ${row(L("Çalışma", "Practice"), w.cur.min, w.prev.min, L(" dk", " min"))}
      ${row(L("Çalışılan gün", "Days practised"), w.cur.active, w.prev.active)}
      ${row(L("Hedefe ulaşılan gün", "Goal days"), w.cur.goalDays, w.prev.goalDays)}
      ${row(L("Biten ders", "Lessons finished"), w.cur.lessons, w.prev.lessons)}
      ${row(L("Günlük çalışma", "Daily routines"), w.cur.daily, w.prev.daily)}</div></details>`;
  }
  // Rozetler: kazanılanlar renkli; yeni kazanılanlar bir kez "yeni" işaretiyle görünür
  function badgesHtml(st){
    const bs = badgeList(st), seen = new Set(store.get("badges.seen", [])), got = bs.filter(b => b.got);
    const html = `<details class="rmbadges" open><summary>${L("Rozetler", "Badges")} <small>${got.length}/${bs.length}</small></summary><div class="badges">
      ${bs.map(b => `<span class="badge ${b.group}${b.got ? " got" : ""}" title="${b.got ? "" : b.group === "unit" ? L("Ünite sınavını geç", "Pass the unit test") : (typeof b.v === "number" && b.v % 1 ? num(b.v) : b.v) + " / " + b.target}">
        <i>${b.group === "unit" ? "★" : b.group === "streak" ? "🔥" : b.group === "daily" ? "✓" : "♪"}</i>${esc(tx(b.name))}${b.got && !seen.has(b.id) ? ` <em>${L("yeni", "new")}</em>` : ""}</span>`).join("")}</div>
      <small class="muted">${L("Ünite rozetleri Dersler'deki ünite sınavlarıyla kazanılır; seri ve süre rozetleri günlük çalışmayla.", "Unit badges come from the unit tests in Lessons; streak and time badges from daily practice.")}</small></details>`;
    store.set("badges.seen", got.map(b => b.id));
    return html;
  }
  function render(){
    store.set("days", days);
    const style = store.get("goal.style", "both");
    const st = roadmapStats((k, d) => store.get(k, d)), status = roadmapStatus(st, style), pace = roadmapPace(st, status);
    const wk = weekView(days, st.goalMin), wkGoal = wk.filter(d => d.state === "goal").length, cur = status.find(s => s.current);
    const nx = nextLesson(st.prog, store.get("lesson.all", false));
    const miss = cur ? cur.miles.find(x => !x.ok) : null;
    const wks = w => w < 1 ? L("1 haftadan az", "under a week") : Math.round(w) + L(" hafta", " weeks");
    const months = w => w < 6 ? wks(w) : num(w/4.3, 0) + L(" ay", " months");
    P.innerHTML = `
      <p class="pdesc">${L("Sıfırdan ustalığa altı aşama. Her aşamanın dersleri ve ölçülen kilometre taşları var; taşlar alıştırmalardaki en iyi sonuçlarından hesaplanır. Tahmin son dört haftadaki çalışma hızına göre.",
        "Six stages from zero to mastery. Each stage has lessons and measured milestones, computed from your best results in the exercises. The estimate uses your pace over the last four weeks.")}</p>
      <div class="pbar"><span class="label">${L("Hedefin", "Your goal")}</span>
        <div class="seg" role="radiogroup" id="rmstyle" aria-label="${L("Hedef tarz", "Goal style")}">
          <button type="button" role="radio" data-s="dance" aria-checked="${style === "dance"}">${L("Oyun havaları (Trakya, Roman)", "Dance tunes (Thracian, Roman)")}</button>
          <button type="button" role="radio" data-s="classic" aria-checked="${style === "classic"}">${L("Fasıl ve makam", "Fasıl and makam")}</button>
          <button type="button" role="radio" data-s="both" aria-checked="${style === "both"}">${L("İkisi", "Both")}</button></div></div>
      <div class="rmweek">
        <div><span class="label">${L("Bu hafta", "This week")}</span>
          <div class="rmdays">${wk.map((d, i) => `<span class="rmday ${d.state}" title="${d.key}: ${Math.round(d.sec/60)} ${L("dk", "min")}"><i></i><small>${DAYN[i]}</small></span>`).join("")}</div>
          <small class="muted">${wkGoal}/5 ${L("gün hedefe ulaştı (hedef: haftada 5 gün, günde " + st.goalMin + " dk)", "days reached the goal (aim: 5 days a week, " + st.goalMin + " min a day)")}</small></div>
        <div><span class="label">${L("Bu haftanın odağı", "This week's focus")}</span>
          <div class="rmfocus">${nx ? `<button type="button" class="chipbtn" data-tab="lessons">${L("Ders: ", "Lesson: ") + esc(tx(nx.title))}</button>` : ""}
          ${miss ? `<button type="button" class="chipbtn" data-tab="${miss.m.tab}">${esc(tx(miss.m.title))} → ${miss.m.lower ? "≤ " : ""}${miss.m.target}${esc(tx(miss.m.unit))}</button>` : ""}
          ${!nx && !miss ? L("Hepsi tamam!", "All done!") : ""}</div></div>
        <div><span class="label">${L("Tahmin", "Estimate")}</span>
          <p class="rmest">${cur ? (pace.basis === "plan" ? L("Haftada 5 gün, günde " + st.goalMin + " dk çalışırsan şu anki aşama ", "Practising 5 days a week, " + st.goalMin + " min a day, the current stage takes ") : L("Bu hızla şu anki aşama ", "At this pace the current stage takes ")) + `<b>${wks(pace.weeks[status.indexOf(cur)])}</b>` + L(", hepsi ", ", everything ") + `<b>${months(pace.total)}</b>` + L(" sürer.", ".") : L("Bütün aşamalar tamam.", "All stages complete.")}
          <small class="muted">${L("Son 4 hafta: günde ort. ", "Last 4 weeks: avg ") + num(pace.minPerDay, 0) + L(" dk, ", " min a day, ") + pace.activeDays + L(" gün çalıştın.", " days practised.")}</small></p></div>
      </div>
      ${weekHtml()}
      ${badgesHtml(st)}
      <ol class="rmstages">${status.map((s, i) => `
        <li class="rmstage${s.done ? " done" : ""}${s.current ? " cur" : ""}">
          <div class="rmhead"><span class="rmnum">${s.done ? "✓" : i + 1}</span><div><b>${esc(tx(s.stage.title))}</b><small>${esc(tx(s.stage.goal))}</small></div><em>%${s.pct}</em></div>
          <div class="rmbar" role="img" aria-label="%${s.pct}"><i style="width:${s.pct}%"></i></div>
          <div class="rmdet"><span>${L("Dersler", "Lessons")} ${s.lessons.done}/${s.lessons.total}</span>
            ${s.miles.map(x => `<button type="button" class="rmmile${x.ok ? " ok" : ""}" data-tab="${x.m.tab}">${x.ok ? "✓" : "○"} ${esc(tx(x.m.title))}: <b>${x.v == null || x.v === 0 && !x.m.lower ? "—" : (typeof x.v === "number" && x.v % 1 ? num(x.v) : x.v)}</b> / ${x.m.lower ? "≤ " : ""}${x.m.target}${esc(tx(x.m.unit))}</button>`).join("")}</div>
        </li>`).join("")}</ol>
      <p class="muted small">${L("Kilometre taşına dokununca ilgili alıştırma açılır. Aşamalar birbirini beklemez: dersler kendi sırasıyla açılır, taşları istediğin sırada geçebilirsin.",
        "Tap a milestone to open its exercise. Stages don't wait for each other: lessons unlock in their own order and you can pass milestones in any order.")}</p>`;
  }
  P.addEventListener("click", e => {
    const s = e.target.closest("[data-s]"); if(s){ store.set("goal.style", s.dataset.s); render(); return; }
    const t = e.target.closest("[data-tab]"); if(t) ctx.selectTab(t.dataset.tab);
  });
  return { enter: render };
};
