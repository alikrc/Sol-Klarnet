// Usuller: Türk müziğinin ritim kalıplarını (usul) tanıma ve öğrenme sayfası. Her usulün düm-tek dizisi, sayılışı ve
// nerede çalındığı; dört adım: dinle ve say, elle vur (Düm ve Tek düğmeleri), ezberden vur (sayımdan sonra yalnız ölçü
// başında hafif tık), klarnetle çal (mikrofon; trainers.js rhythmRun). "Hangi usul?" duyulan usulü sorar.
// Vuruş kalıpları learn.js USULS'ta; burada öğretim metinleri, öğrenme sırası ve öğrenme temposu (usul birimi/dk).

const USUL_INFO = {
  semai:      { lv:1, tempo:90,  tr:"En kısa klasik usullerden: üç vuruş, düm tek tek. Vals gibi döner; şarkılarda sık.",
                en:"One of the shortest classical usuls: three beats, düm tek tek. It turns like a waltz; common in şarkıs." },
  sofyan:     { lv:1, tempo:90,  tr:"Dört vuruş: düm iki vuruş sürer, ardından iki tek. İlâhî ve şarkılarda çok sık; Batı müziğinin 4/4'üne benzer.",
                en:"Four beats: the düm lasts two, then two teks. Very common in ilahis and şarkıs; close to Western 4/4." },
  kasap:      { lv:1, tempo:100, tr:"İki vuruş, düm tek. Düz ve hızlı yürüyen oyun havası: kasap havası, hora.",
                en:"Two beats, düm tek. A straight, fast-walking dance: kasap havası, hora." },
  sirto:      { lv:1, tempo:96,  tr:"Kasap havası gibi düm tek, ama hafif ve zıplayarak çalınır. Fasıl sonlarında ve Rumeli'de çalınan sirtolar.",
                en:"Düm tek like kasap havası, but played light and bouncing. The sirtos that close a fasıl, and Rumelian ones." },
  duyek:      { lv:2, tempo:150, tr:"Sekiz sekizlik. Baştaki hafif “te” düme bağlanır: te-düm, tek, düm, tek. Şarkı, ilâhî ve peşrevlerde en çok çalınan usullerden.",
                en:"Eight eighths. A light “te” leads into the düm: te-düm, tek, düm, tek. One of the most played usuls in şarkıs, ilahis and peşrevs." },
  ciftetelli: { lv:2, tempo:140, tr:"Göbek havası ve oyunlar. Düm, tek, tek, sonra art arda iki düm ve tek: ortadaki iki düm onu hemen tanıtır.",
                en:"Belly-dance tunes and dances. Düm, tek, tek, then two düms in a row and a tek: those two düms give it away." },
  turkaksagi: { lv:2, tempo:150, tr:"Beş sekizlik (2+3): kısa bir düm, sonra tek tek. Topal yürüyüşü buradan gelir; şarkı ve türkülerde.",
                en:"Five eighths (2+3): a short düm, then tek tek. That's where the limp comes from; in şarkıs and türküs." },
  yuruksemai: { lv:2, tempo:160, tr:"Altı sekizlik, iki üçlük (3+3): düm tek tek, düm tek. Hızlı semâî; fasılda ve şarkılarda.",
                en:"Six eighths in two threes (3+3): düm tek tek, düm tek. The quick semai; in fasıl and şarkıs." },
  aksak:      { lv:2, tempo:160, tr:"Dokuz sekizlik (2+2+2+3): son vuruş uzun kalır, “aksak” (topal) adı buradan. Türkü ve şarkılarda en sevilen usullerden.",
                en:"Nine eighths (2+2+2+3): the last beat is long, hence “aksak” (limping). One of the best-loved usuls in türküs and şarkıs." },
  karsilama:  { lv:2, tempo:160, tr:"Trakya karşılaması, dokuz sekizlik (2+2+2+3): düm tek düm tek. Aksak'ta ikinci kısımdaki tek ikiye bölünür, karşılamada tek vuruştur.",
                en:"The Thracian karşılama, nine eighths (2+2+2+3): düm tek düm tek. In aksak the second part splits into tek tek; here it is a single tek." },
  roman:      { lv:3, tempo:160, tr:"Roman havası, dokuz sekizlik: düm tek tek, sonra kısa bir düm ve tek. Sondaki kısa düm oyunu sıçratır.",
                en:"Roman havası, nine eighths: düm tek tek, then a short düm and a tek. That short düm near the end makes the dance jump." },
  rumeli:     { lv:3, tempo:170, tr:"Yedi sekizlik (2+2+3): düm, tek, uzun tek. Rumeli ve Balkan oyunlarında.",
                en:"Seven eighths (2+2+3): düm, tek, long tek. In Rumelian and Balkan dances." },
  curcuna:    { lv:3, tempo:160, tr:"On sekizlik: düm tek tek, düm tek tek. Aksak'a bir sekizlik eklenmiş gibidir; oynak şarkılarda ve saz eserlerinde.",
                en:"Ten eighths: düm tek tek, düm tek tek. Like aksak with one more eighth; in lively şarkıs and instrumental pieces." },
  zeybek:     { lv:3, tempo:80,  tr:"Ege'nin ağır ve vakur zeybekleri: Aksak'ın vuruşları dörtlüklerle, çok ağır.",
                en:"The slow, proud zeybeks of the Aegean: aksak's strokes in quarters, very slow." },
  agiraksak:  { lv:3, tempo:80,  tr:"Aksak'ın ağırı (dokuz dörtlük); ağır şarkılarda. Zeybekle aynı vuruşlar, klasik çalışla.",
                en:"Slow aksak (nine quarters); in slow şarkıs. The same strokes as zeybek, in the classical style." }
};
const USUL_LV = { 1: L("Başlangıç", "Beginner"), 2: L("Orta", "Intermediate"), 3: L("İleri", "Advanced") };
// Adımlar ve geçme sınırları (puan)
const USUL_STEPS = [
  { id:"listen", name:L("Dinle ve say", "Listen and count"), pass:1 },
  { id:"tap",    name:L("Elle vur", "Tap along"), pass:70 },
  { id:"mem",    name:L("Ezberden vur", "Tap from memory"), pass:70 },
  { id:"play",   name:L("Klarnetle çal", "Play it"), pass:60 }
];
// Hece: düm, tek ya da vuruşun devamı
const usulSyl = s => s === "D" ? "Düm" : s === "T" ? "tek" : "·";

// Düm-tek vuruşu puanı. expected/taps: [{ t (ms), k "D"|"T" }]. Zamanında (±60 ms) 1, ±120 ms 0,75, daha geç 0,5;
// yanlış vuruş türü yarısı; fazla vuruş başına 0,5 düşer.
function usulTapScore(expected, taps, unitMs){
  const tol = Math.min(unitMs*0.45, 180), used = new Set(), hits = [];
  let sum = 0, wrong = 0, missed = 0;
  for(const e of expected){
    let best = -1, bd = Infinity;
    taps.forEach((p, i) => { if(!used.has(i) && Math.abs(p.t - e.t) < bd){ bd = Math.abs(p.t - e.t); best = i; } });
    if(best < 0 || bd > tol){ missed++; continue; }
    used.add(best);
    const p = taps[best], dev = p.t - e.t, ok = p.k === e.k;
    let v = Math.abs(dev) <= 60 ? 1 : Math.abs(dev) <= 120 ? 0.75 : 0.5;
    if(!ok){ v *= 0.5; wrong++; }
    sum += v; hits.push({ e, p, dev, ok });
  }
  const extras = taps.filter((_, i) => !used.has(i)), extra = extras.length;
  const score = expected.length ? Math.max(0, Math.round(100*(sum - 0.5*extra)/expected.length)) : 0;
  const devs = hits.map(h => h.dev), mean = devs.length ? devs.reduce((a, b) => a + b, 0)/devs.length : 0;
  return { score, hits, wrong, missed, extra, extras, all: expected, mean, n: expected.length };
}

TRAINERS.usul = function(ctx){
  const { SK, $, store, esc, hit, needMic } = ctx;
  const P = $("pp-usul");
  const list = Object.keys(USUL_INFO).map(id => USULS.find(u => u.id === id)).filter(Boolean);
  const prog = store.get("usul.prog", {});
  let cur = list.find(u => u.id === store.get("usul.cur", "semai")) || list[0];
  let mode = "learn", run = null, raf = 0, keyOff = null;

  P.innerHTML = `
    <p class="pdesc">${L("Türk müziğinde ritim kalıbına usul denir: ölçünün içinde kalın “düm” ve ince “tek” vuruşlarının sırası. Bir usulü dört adımda öğren: dinle ve say, Düm ve Tek düğmeleriyle elle vur, ezberden vur, sonra klarnetle çal. “Hangi usul?” duyduğunu tanımayı sınar.",
      "In Turkish music a rhythmic pattern is called an usul: the order of deep “düm” and light “tek” strokes in a bar. Learn each usul in four steps: listen and count, tap along with the Düm and Tek buttons, tap from memory, then play it. “Which usul?” tests whether you can recognise one by ear.")}</p>
    <div class="pbar"><div class="seg" role="radiogroup" aria-label="${L("Kip", "Mode")}" id="usmode">
      <button type="button" role="radio" data-m="learn">${L("Öğren", "Learn")}</button>
      <button type="button" role="radio" data-m="quiz">${L("Hangi usul?", "Which usul?")}</button></div></div>
    <div id="uslearn">
      <div class="uslist" id="uslist"></div>
      <div class="usbox">
        <div class="ushead"><h3 id="usname"></h3><span class="usmeter" id="usmeter"></span><span class="chip" id="uslv"></span></div>
        <p class="usdesc" id="usdesc"></p>
        <div class="usgrid" id="usgrid" aria-hidden="true"></div>
        <p class="ussay" id="ussay"></p>
        <div class="pbar">
          <button class="primary small" id="uslisten" type="button">${L("Dinle", "Listen")}</button>
          <div class="stepper"><button class="mini" type="button" data-ust="-8" aria-label="${L("Yavaşlat", "Slower")}">−</button>
            <input id="ustempo" type="number" min="40" max="260" step="4" aria-label="Tempo">
            <button class="mini" type="button" data-ust="8" aria-label="${L("Hızlandır", "Faster")}">+</button><em id="usunit"></em></div>
          <button class="linkbtn" id="usarch" type="button">${L("Bu usulde eserler", "Pieces in this usul")}</button>
        </div>
        <ol class="ussteps" id="ussteps"></ol>
        <div class="stage" id="usstage"></div>
      </div>
    </div>
    <div id="usquiz" hidden>
      <div class="stage" id="usqstage"></div>
    </div>`;

  const unitName = u => u.meter.split("/")[1] === "8" ? L("sekizlik/dk", "eighths/min") : L("dörtlük/dk", "quarters/min");
  const tempoKey = () => "usul.tempo." + cur.id;
  const tempo = () => Math.max(40, Math.min(260, +$("ustempo").value || USUL_INFO[cur.id].tempo));
  const pg = id => prog[id] || (prog[id] = {});
  const passed = (id, st) => { const v = (prog[id] || {})[st.id]; return v != null && v >= st.pass; };
  const nDone = id => USUL_STEPS.filter(st => passed(id, st)).length;
  const record = (st, v) => { const p = pg(cur.id); if(p[st.id] == null || v > p[st.id]) p[st.id] = v; store.set("usul.prog", prog); paintList(); paintSteps(); };

  // ---- Çizim ----
  function paintList(){
    let lv = 0, h = "";
    for(const u of list){
      const i = USUL_INFO[u.id];
      if(i.lv !== lv){ lv = i.lv; h += `<div class="label usgl">${USUL_LV[lv]}</div>`; }
      const n = nDone(u.id);
      h += `<button type="button" class="usitem" data-u="${u.id}" aria-pressed="${u === cur}"><b>${esc(u.name)}</b><small>${u.meter}</small>
        <span class="usdots" aria-label="${n}/4 ${L("adım", "steps")}">${USUL_STEPS.map((_, k) => `<i${k < n ? ' class="on"' : ""}></i>`).join("")}</span></button>`;
    }
    $("uslist").innerHTML = h;
  }
  function gridHtml(u, hide){
    const slots = usulSlots(u);
    return `<div class="usrow" style="--n:${slots.length}">${slots.map((s, k) =>
      `<span class="uscell ${hide ? "x" : s || "c"}" data-k="${k}"><b>${hide ? "" : usulSyl(s)}</b><i>${k + 1}</i></span>`).join("")}</div>`;
  }
  function paintGrid(hide){ $("usgrid").innerHTML = gridHtml(cur, hide); }
  function paintSteps(){
    const next = USUL_STEPS.findIndex(st => !passed(cur.id, st));
    $("ussteps").innerHTML = USUL_STEPS.map((st, k) => {
      const v = (prog[cur.id] || {})[st.id], ok = passed(cur.id, st);
      const res = st.id === "listen" ? (ok ? L("dinlendi", "done") : "") : v != null ? v + L(" puan", " pts") : "";
      return `<li class="${ok ? "ok" : k === next ? "next" : ""}"><button type="button" class="usstep" data-st="${st.id}">
        <span>${k + 1}. ${st.name}</span><small>${res}</small></button></li>`;
    }).join("");
  }
  function paint(){
    const i = USUL_INFO[cur.id];
    $("usname").textContent = cur.name; $("usmeter").textContent = cur.meter; $("uslv").textContent = USUL_LV[i.lv];
    $("usdesc").textContent = pick(i, LANG);
    $("ussay").textContent = cur.strokes.map(([s, d]) => usulSyl(s) + " –".repeat(d - 1)).join("  ");
    $("ustempo").value = store.get(tempoKey(), i.tempo); $("usunit").textContent = unitName(cur);
    paintGrid(false); paintList(); paintSteps(); idleStage();
  }
  function idleStage(){
    const next = USUL_STEPS.find(st => !passed(cur.id, st));
    $("usstage").innerHTML = `<div class="muted">${next ? L("Sıradaki adım: ", "Next step: ") + "<b>" + next.name + "</b>. " + L("Adıma dokun.", "Tap the step.")
      : L("Bu usulün dört adımını da geçtin. Tempoyu artırıp yeniden dene ya da sıradaki usule geç.", "You've passed all four steps for this usul. Raise the tempo and try again, or move on to the next usul.")}</div>`;
  }
  const mark = k => {
    $("usgrid").querySelectorAll(".uscell").forEach(c => c.classList.toggle("now", +c.dataset.k === k));
  };

  // ---- Ses: usul döngüsü ----
  // opts: { bars (Infinity: durdurulana kadar), countIn (ilk ölçü sayım), guide "full" | "bar" (yalnız ölçü başı tık),
  //         onSlot(k, bar), onEnd, u (varsayılan seçili usul), bpm }. Dönen t0Perf: ilk dilimin duyulduğu an (performance.now zamanı).
  function loop(opts){
    const a = SK.audioCtx(), slots = usulSlots(opts.u || cur), n = slots.length, unit = 60/(opts.bpm || tempo());
    const t0 = a.currentTime + 0.2, lat = (a.outputLatency || 0) + (a.baseLatency || 0);
    const total = opts.bars === Infinity ? Infinity : (opts.bars + (opts.countIn ? 1 : 0))*n;
    let i = 0, shown = -1, ended = false;
    const sched = () => {
      while(i < total && t0 + i*unit < a.currentTime + 0.15){
        const k = i % n, at = t0 + i*unit, counting = opts.countIn && i < n;
        if(counting || opts.guide === "full"){ if(slots[k]) hit(a, slots[k], at, counting ? 1 : 0.8); }
        else if(k === 0) hit(a, "T", at, 0.3);
        i++;
      }
    };
    const iv = setInterval(sched, 40); sched();
    const frame = () => {
      const pos = Math.floor((a.currentTime - lat - t0)/unit);
      if(pos >= 0 && pos !== shown && pos < total){ shown = pos; if(opts.onSlot) opts.onSlot(pos % n, Math.floor(pos/n)); }
      if(pos >= total && !ended){ ended = true; stopLoop(); if(opts.onEnd) opts.onEnd(); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    function stopLoop(){ clearInterval(iv); cancelAnimationFrame(raf); }
    return { t0Perf: ctxToPerf(a, t0), unitMs: unit*1000, n, slots, stop: stopLoop };
  }
  function halt(){
    if(run){ run.stop(); run = null; }
    if(keyOff){ keyOff(); keyOff = null; }
    cancelAnimationFrame(raf); mark(-1);
    $("uslisten").textContent = L("Dinle", "Listen");
    if(mode === "learn") paintGrid(false);
  }

  // ---- Adımlar ----
  function listen(step){
    if(run){ const was = run.kind; halt(); if(was === "listen"){ idleStage(); return; } }
    $("uslisten").textContent = L("Durdur", "Stop");
    $("usstage").innerHTML = `<div class="usbig" id="uscount"></div><div class="muted">${L("Vuruşlarla birlikte sesli say: “Düm” kalın, “tek” ince. Noktalı yerlerde ses sürer.", "Count aloud with the strokes: “Düm” deep, “tek” light. On the dots the sound carries on.")}</div>`;
    const l = loop({ bars: Infinity, guide:"full", onSlot: (k, bar) => {
      mark(k);
      const s = l.slots[k], el = $("uscount"); if(el) el.textContent = usulSyl(s) === "·" ? "" : usulSyl(s);
      if(bar >= 2 && !passed(cur.id, USUL_STEPS[0])) record(USUL_STEPS[0], 1);
    } });
    run = { kind:"listen", stop: l.stop };
  }
  function tapStep(st){
    halt();
    const mem = st.id === "mem", u = cur, slots = usulSlots(u), unitMs = 60000/tempo(), barMs = unitMs*slots.length;
    const bars = barMs > 4000 ? 2 : barMs > 2500 ? 3 : 4;
    $("usstage").innerHTML = `<div class="muted" id="ustell">${mem
      ? L("Bir ölçü sayım çalar, sonra yalnız ölçü başında hafif bir tık duyulur. Düm ve tekleri ezberden vur.", "One bar of count-in, then only a light click on each downbeat. Tap the düms and teks from memory.")
      : L("Bir ölçü sayımı dinle, sonra usulle birlikte vur.", "Listen to one bar of count-in, then tap along with the usul.")} ${L("Klavyede F = düm, J = tek.", "On a keyboard F = düm, J = tek.")}</div>
      <div class="usbig" id="uscount">${L("Sayım", "Count-in")}</div>
      <div class="uspad"><button type="button" class="uspadD" data-k="D">Düm</button><button type="button" class="uspadT" data-k="T">Tek</button></div>`;
    const taps = [];
    const press = (k, t, btn) => {
      if(!run || run.kind !== "tap") return;
      taps.push({ k, t });
      if(btn){ btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit"); }
    };
    $("usstage").querySelector(".uspad").addEventListener("pointerdown", e => {
      const b = e.target.closest("[data-k]"); if(!b) return;
      e.preventDefault(); press(b.dataset.k, e.timeStamp || performance.now(), b);
    });
    const onKey = e => {
      if(e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = /^[fds]$/i.test(e.key) ? "D" : /^[jkl]$/i.test(e.key) ? "T" : null;
      if(!k) return;
      e.preventDefault(); press(k, e.timeStamp || performance.now(), $("usstage").querySelector(k === "D" ? ".uspadD" : ".uspadT"));
    };
    document.addEventListener("keydown", onKey); keyOff = () => document.removeEventListener("keydown", onKey);
    if(mem) paintGrid(true);
    const l = loop({ bars, countIn:true, guide: mem ? "bar" : "full",
      onSlot: (k, bar) => {
        mark(k);
        const el = $("uscount"); if(!el) return;
        el.textContent = bar === 0 ? L("Sayım ", "Count ") + (k + 1) : (mem ? "" : usulSyl(slots[k]) === "·" ? "" : usulSyl(slots[k])) || (bar + " / " + bars);
      },
      onEnd: () => {
        if(keyOff){ keyOff(); keyOff = null; }
        run = null; mark(-1); paintGrid(false);
        const expected = [];
        for(let b = 1; b <= bars; b++) slots.forEach((s, k) => { if(s) expected.push({ t: l.t0Perf + (b*slots.length + k)*unitMs, k:s }); });
        const r = usulTapScore(expected, taps.filter(p => p.t > l.t0Perf + (slots.length - 0.5)*unitMs), unitMs);
        record(st, r.score);
        showTapResult(r, st, expected[0] ? expected[0].t : 0, l.t0Perf + (bars + 1)*slots.length*unitMs);
      } });
    run = { kind:"tap", stop: l.stop };
  }
  function showTapResult(r, st, from, to){
    const ms = v => Math.round(Math.abs(v));
    const where = !r.hits.length ? "—" : Math.abs(r.mean) < 20 ? L("vuruşun üstünde", "on the beat") : r.mean < 0 ? ms(r.mean) + L(" ms erken", " ms early") : ms(r.mean) + L(" ms geç", " ms late");
    const tips = [];
    if(r.missed > r.n*0.3) tips.push(L("Birçok vuruş kaçtı: tempoyu düşür, önce Dinle ile sesli say.", "Many strokes were missed: lower the tempo and count aloud with Listen first."));
    if(r.wrong) tips.push(L("Düm ve teki karıştırdığın yerler var: hecelerle say (Düm kalın, tek ince).", "Some düms and teks were swapped: say the syllables (Düm deep, tek light)."));
    if(r.extra > 2) tips.push(L("Fazla vuruş var: noktalı yerlerde ses sürer, vurma.", "Extra taps: on the dots the sound carries on, don't tap."));
    if(Math.abs(r.mean) > 60) tips.push(r.mean < 0 ? L("Acele ediyorsun: vuruşu bekle.", "You're rushing: wait for the stroke.") : L("Geride kalıyorsun: vuruşu önceden hisset.", "You're dragging: feel the stroke coming."));
    $("usstage").innerHTML = `<div class="result"><div class="big">${r.score}</div><div>${L("puan", "points")} · ${r.hits.length}/${r.n} ${L("vuruş", "strokes")}${r.score >= st.pass ? " · <strong>" + L("geçtin", "passed") + "</strong>" : " · " + L("geçmek için ", "pass at ") + st.pass}</div></div>
      <div class="kv"><div><span class="label">${L("Zamanlama", "Timing")}</span>${where}</div>
        <div><span class="label">${L("Düm/tek karışan", "Düm/tek swapped")}</span>${r.wrong}</div>
        <div><span class="label">${L("Kaçan · fazla", "Missed · extra")}</span>${r.missed} · ${r.extra}</div></div>
      ${tapSvg(r, from, to)}
      ${tips.length ? `<div class="muted">${tips.join(" ")}</div>` : ""}
      <div class="pbar"><button class="primary small" type="button" data-again="${st.id}">${L("Yeniden", "Again")}</button></div>`;
  }
  // Sonuç görseli: beklenen vuruşlar çizgi (düm kalın), vurulanlar nokta (sapmaya göre renk, yanlış türse içi boş)
  function tapSvg(r, from, to){
    const W = 600, t0 = from - 250, t1 = to, x = t => (((t - t0)/(t1 - t0))*W).toFixed(1);
    let s = `<svg class="rhsvg" viewBox="0 0 ${W} 60" role="img" aria-label="${L("Vuruşlar ve vurdukların", "Strokes and your taps")}"><line x1="0" x2="${W}" y1="30" y2="30" class="rhaxis"/>`;
    r.all.forEach(e => s += `<line x1="${x(e.t)}" x2="${x(e.t)}" y1="${e.k === "D" ? 8 : 16}" y2="${e.k === "D" ? 52 : 44}" class="rhexp${e.k === "D" ? " usd" : ""}"/>`);
    r.hits.forEach(h => { const c = Math.abs(h.dev) <= 60 ? "good" : Math.abs(h.dev) <= 120 ? "mid" : "bad";
      s += `<circle cx="${x(h.p.t)}" cy="30" r="5" class="rh${c}${h.ok ? "" : " uswrong"}"/>`; });
    r.extras.forEach(p => s += `<circle cx="${x(p.t)}" cy="30" r="4" class="rhextra"/>`);
    return s + "</svg>";
  }
  async function playStep(st){
    halt();
    if(!(await needMic())) return;
    const slots = usulSlots(cur), unitMs = 60000/tempo(), barMs = unitMs*slots.length;
    const bars = barMs > 4000 ? 2 : barMs > 2500 ? 3 : 4;
    const pattern = { beats: slots.length, at: usulStrokeTimes(slots), accents: slots };
    $("usstage").innerHTML = `<div class="muted">${L("Bir ölçü sayımdan sonra düm ve tek vuruşlarında kısa notalar çal (hangi nota olduğu önemli değil). Düm'leri biraz daha güçlü çalabilirsin.", "After a one-bar count-in, play short notes on the düm and tek strokes (any note). You can play the düms a little stronger.")}</div>
      <div class="usbig" id="uscount">${L("Sayım", "Count-in")}</div>`;
    const r = rhythmRun(ctx, { beatMs: unitMs, pattern, bars, silent:false, accents: slots }, res => {
      run = null; mark(-1);
      const ev = rhythmEval(ctx, res, unitMs, pattern);
      record(st, ev.score);
      $("usstage").innerHTML = rhythmText(ev) + rhythmSvg(res, ev) +
        `<div class="muted small">${L("Puan, çalışının vuruşlara oturmasıdır; düm ve tek ayrımını mikrofon ölçmez. Sonuçlar hep kayıksa Ritim sayfasında gecikme ayarını yap.", "The score is how well your notes sit on the strokes; the microphone doesn't tell düm from tek. If results are always off, run the latency setup on the Rhythm page.")}</div>
        <div class="pbar"><button class="primary small" type="button" data-again="play">${L("Yeniden", "Again")}</button>
        <span class="muted small">${ev.score >= st.pass ? "" : L("Geçmek için ", "Pass at ") + st.pass}</span></div>`;
    }, (i, counting) => {
      const k = i % slots.length; mark(k);
      const el = $("uscount"); if(el) el.textContent = counting ? L("Sayım ", "Count ") + (k + 1) : usulSyl(slots[k]) === "·" ? "" : usulSyl(slots[k]);
    });
    run = { kind:"play", stop: r.stop };
  }
  function startStep(id){
    const st = USUL_STEPS.find(s => s.id === id);
    if(id === "listen") listen(st); else if(id === "play") playStep(st); else tapStep(st);
  }

  // ---- Hangi usul? ----
  // Aynı vuruşları olan usullerden yalnız ilki sorulur (kasap = sirto, aksak = zeybek = ağır aksak)
  const quizPool = (() => { const seen = new Set(); return list.filter(u => { const k = JSON.stringify(u.strokes); if(seen.has(k)) return false; seen.add(k); return true; }); })();
  const QN = 8;
  let quiz = null;
  function quizStart(){
    halt();
    quiz = { i:0, right:0, q:null };
    quizNext();
  }
  function quizNext(){
    if(quiz.i >= QN) return quizEnd();
    const pick1 = arr => arr[Math.floor(Math.random()*arr.length)];
    const u = pick1(quiz.q ? quizPool.filter(x => x !== quiz.q.u) : quizPool);
    const others = quizPool.filter(x => x !== u).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [u, ...others].sort(() => Math.random() - 0.5);
    quiz.q = { u, opts, tempo: Math.round(USUL_INFO[u.id].tempo*(0.92 + Math.random()*0.16)), done:false };
    $("usqstage").innerHTML = `<div class="label">${L("Soru ", "Question ")}${quiz.i + 1} / ${QN}</div>
      <p>${L("Dinle: bu hangi usul?", "Listen: which usul is this?")}</p>
      <div class="qopts usqopts">${opts.map(o => `<button type="button" class="opt" data-q="${o.id}">${esc(o.name)}</button>`).join("")}</div>
      <div class="pbar"><button class="stopbtn" type="button" id="usqagain">${L("Tekrar dinle", "Hear again")}</button></div>
      <div id="usqfb"></div>`;
    quizPlay();
  }
  function quizPlay(){
    if(run){ run.stop(); run = null; }
    const l = loop({ u: quiz.q.u, bpm: quiz.q.tempo, bars:2, guide:"full", onEnd: () => { run = null; } });
    run = { kind:"quiz", stop: l.stop };
  }
  function quizAnswer(id){
    const q = quiz.q; if(q.done) return; q.done = true;
    const ok = id === q.u.id; if(ok) quiz.right++;
    $("usqstage").querySelectorAll("[data-q]").forEach(b => { b.disabled = true; if(b.dataset.q === q.u.id) b.classList.add("right"); else if(b.dataset.q === id) b.classList.add("wrong"); });
    $("usqfb").innerHTML = `<p><b>${ok ? L("Doğru.", "Right.") : L("Bu ", "This was ") + esc(q.u.name) + "."}</b> ${q.u.meter} · ${esc(q.u.strokes.map(([s, d]) => usulSyl(s) + " –".repeat(d - 1)).join("  "))}</p>
      ${gridHtml(q.u, false)}
      <div class="pbar"><button class="primary small" type="button" id="usqnext">${quiz.i + 1 < QN ? L("Sonraki", "Next") : L("Sonuç", "Result")}</button></div>`;
    quiz.i++;
  }
  function quizEnd(){
    halt();
    const best = store.get("usul.quiz.best", 0);
    if(quiz.right > best) store.set("usul.quiz.best", quiz.right);
    $("usqstage").innerHTML = `<div class="result"><div class="big">${quiz.right}/${QN}</div><div>${quiz.right > best ? "<strong>" + L("yeni rekor", "new record") + "</strong>" : L("rekor ", "record ") + best + "/" + QN}</div></div>
      <div class="muted">${quiz.right >= QN - 1 ? L("Usulleri kulaktan tanıyorsun.", "You recognise usuls by ear.") : L("Karıştırdıklarını Öğren'de yan yana dinle: düm'lerin yerine dikkat et.", "Listen to the ones you mixed up side by side in Learn: notice where the düms fall.")}</div>
      <div class="pbar"><button class="primary small" type="button" id="usqgo">${L("Yeniden başla", "Start again")}</button></div>`;
    quiz = null;
  }
  function quizIdle(){
    const best = store.get("usul.quiz.best", 0);
    $("usqstage").innerHTML = `<p>${L("Bir usul iki ölçü çalar; dört seçenekten hangisi olduğunu bul. ", "An usul plays for two bars; pick it from four choices. ")}${QN}${L(" soru.", " questions.")}${best ? " " + L("Rekor ", "Record ") + best + "/" + QN + "." : ""}</p>
      <div class="pbar"><button class="primary small" type="button" id="usqgo">${L("Başla", "Start")}</button></div>`;
  }
  $("usqstage").addEventListener("click", e => {
    const t = e.target;
    if(t.closest("#usqgo")) quizStart();
    else if(t.closest("#usqagain")) quizPlay();
    else if(t.closest("#usqnext")) quizNext();
    else { const b = t.closest("[data-q]"); if(b && quiz) quizAnswer(b.dataset.q); }
  });

  // ---- Olaylar ----
  function setMode(m){
    halt(); mode = m; quiz = null;
    $("usmode").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.m === m ? "true" : "false"));
    $("uslearn").hidden = m !== "learn"; $("usquiz").hidden = m !== "quiz";
    if(m === "quiz") quizIdle(); else idleStage();
  }
  $("usmode").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if(b && b.dataset.m !== mode) setMode(b.dataset.m); });
  $("uslist").addEventListener("click", e => {
    const b = e.target.closest("[data-u]"); if(!b) return;
    halt(); cur = list.find(u => u.id === b.dataset.u); store.set("usul.cur", cur.id); paint(); showCur();
  });
  // Telefonda liste yatay kayar: seçili usul görünür kalsın
  const showCur = () => { const el = $("uslist"), it = el.querySelector('[aria-pressed="true"]'); if(it) el.scrollLeft = it.offsetLeft - el.offsetLeft - 60; };
  $("uslisten").addEventListener("click", () => listen(USUL_STEPS[0]));
  $("ussteps").addEventListener("click", e => { const b = e.target.closest("[data-st]"); if(b) startStep(b.dataset.st); });
  $("usstage").addEventListener("click", e => { const b = e.target.closest("[data-again]"); if(b) startStep(b.dataset.again); });
  const setTempo = v => {
    $("ustempo").value = Math.max(40, Math.min(260, v)); store.set(tempoKey(), +$("ustempo").value);
    if(run && run.kind === "listen"){ halt(); listen(USUL_STEPS[0]); }
  };
  P.querySelectorAll("[data-ust]").forEach(b => b.addEventListener("click", () => setTempo(tempo() + +b.dataset.ust)));
  $("ustempo").addEventListener("change", () => setTempo(tempo()));
  $("usarch").addEventListener("click", () => { halt(); if(SK.archiveByUsul) SK.archiveByUsul(cur.id); });

  paint(); setMode("learn");
  return {
    enter(){ showCur(); },
    nowTitle: () => mode === "quiz" ? L("Hangi usul?", "Which usul?") : cur.name,
    stop(){ halt(); if(mode === "learn") idleStage(); else quizIdle(); quiz = null; },
    leave(){ halt(); quiz = null; if(mode === "quiz") quizIdle(); }
  };
};
