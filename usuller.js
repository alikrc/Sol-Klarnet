// Usuller: Türk müziğinin ritim kalıplarını (usul) tanıma ve öğrenme sayfası. Her usulün düm-tek dizisi, sayılışı ve
// nerede çalındığı; dört adım: dinle ve say, elle vur (Düm ve Tek düğmeleri), ezberden vur (sayımdan sonra yalnız ölçü
// başında hafif tık), klarnetle çal (mikrofon; trainers.js rhythmRun). "Hangi usul?" duyulan usulü sorar.
// Vuruş kalıpları learn.js USULS'ta; burada öğretim metinleri, öğrenme sırası ve öğrenme temposu (usul birimi/dk).
// Dosyanın sonunda Ritim heceleri sayfası: nota değerlerini kelime heceleriyle (nar, el-ma, por-ta-kal…) öğretir.

const USUL_INFO = {
  semai:      { lv:1, tempo:90,  tr:"En kısa klasik usullerden: üç zaman, üç darb: düm tek tek. Vals gibi döner; şarkılarda sık.",
                en:"One of the shortest classical usuls: three beats (zaman), three strokes (darb): düm tek tek. It turns like a waltz; common in şarkıs." },
  sofyan:     { lv:1, tempo:90,  tr:"Dört zaman ama üç darb: düm iki zaman sürer, ardından iki tek (te-ke). Zaman sayısıyla darb sayısının farklı olabileceğinin en basit örneği. İlâhî ve şarkılarda çok sık; Batı müziğinin 4/4'üne benzer.",
                en:"Four beats (zaman) but three strokes (darb): the düm lasts two beats, then two teks (te-ke). The simplest case of beats and strokes differing. Very common in ilahis and şarkıs; close to Western 4/4." },
  kasap:      { lv:1, tempo:100, tr:"İki vuruş, düm tek. Düz ve hızlı yürüyen oyun havası.",
                en:"Two beats, düm tek. A straight, fast-walking dance tune." },
  sirto:      { lv:1, tempo:96,  tr:"Kasap havası gibi düm tek, ama hafif ve zıplayarak çalınır. Fasıl sonlarında ve Rumeli'de çalınan sirtolar.",
                en:"Düm tek like kasap havası, but played light and bouncing. The sirtos that close a fasıl, and Rumelian ones." },
  nimsofyan:  { lv:1, tempo:90,  tr:"İki zamanlı, iki darblı en küçük usullerden: düm tek. Dört zamanlı sofyanın yarısı olduğu için “yarım sofyan” denmiştir; en çok 2/4'lük mertebesiyle kullanılır. Sirto, longa gibi oyun havalarında, marşlarda ve bazı türkülerde.",
                en:"One of the smallest usuls, two beats and two strokes: düm tek. It is called “half sofyan” because it is half the length of the four-beat sofyan; mostly used in its 2/4 form. In sirto, longa and other dance tunes, marches and some türküs." },
  duyek:      { lv:2, tempo:150, tr:"Sekiz zaman (sekizlik), beş darb: düm, uzun tek, kısa tek, uzun düm, uzun tek. İki sofyanın birleşmesidir. Şarkı, ilâhî ve peşrevlerde en çok çalınan usullerden.",
                en:"Eight eighths, five strokes: düm, long tek, short tek, long düm, long tek. It joins two sofyans. One of the most played usuls in şarkıs, ilahis and peşrevs." },
  ciftetelli: { lv:2, tempo:140, tr:"Göbek havası ve oyunlar. Düm, tek, tek, sonra art arda iki düm ve tek: ortadaki iki düm onu hemen tanıtır.",
                en:"Belly-dance tunes and dances. Düm, tek, tek, then two düms in a row and a tek: those two düms give it away." },
  devrihindi: { lv:2, tempo:150, tr:"Yedi zaman, beş darb: üç zamanlık düm tek tek, ardından iki zamanlık düm ve iki zamanlık tek. Bir semâî ile bir sofyanın eklenmesinden oluşur. 7/8'lik ve 7/4'lük (ağır ya da sengin devr-i hindî) mertebeleri var; daha çok şarkılarda, ilâhi ve türkülerde, köçekçe ve mandıra oyun havalarında.",
                en:"Seven beats, five strokes: a three-beat düm tek tek, then a two-beat düm and a two-beat tek. It joins a semâî and a sofyan. Used in 7/8 and 7/4 (heavy, or sengin, devr-i hindî); mostly in şarkıs, ilahis and türküs, köçekçes and the mandıra dance tunes." },
  musemmen:   { lv:2, tempo:140, tr:"Sekiz zaman, üç darb: üç zamanlık düm, iki zamanlık tek, üç zamanlık tek (3+5). Bir semâî ile bir Türk aksağının eklenmesinden oluşur; yalnız 8/8'lik mertebesi kullanılır. Şarkı, türkü, oyun havası ve ilâhilerde. “Katakofti” adıyla da anılır.",
                en:"Eight beats, three strokes: a three-beat düm, a two-beat tek and a three-beat tek (3+5). It joins a semâî and a Türk aksağı; only its 8/8 form is used. In şarkıs, türküs, dance tunes and ilahis. Also called “katakofti”." },
  turkaksagi: { lv:2, tempo:150, tr:"Beş sekizlik (2+3): iki sekizlik bir düm, sonra uzun bir tek ve kısa bir tek. Topal yürüyüşü buradan gelir; şarkı, türkü, köçekçe ve oyun havalarında.",
                en:"Five eighths (2+3): a two-eighth düm, then a long tek and a short tek. That's where the limp comes from; in şarkıs, türküs, köçekçes and dance tunes." },
  yuruksemai: { lv:2, tempo:160, tr:"Altı sekizlik, iki üçlük (3+3): düm tek tek, düm tek. Hızlı semâî; fasılda ve şarkılarda.",
                en:"Six eighths in two threes (3+3): düm tek tek, düm tek. The quick semai; in fasıl and şarkıs." },
  senginsemai:{ lv:2, tempo:100, tr:"Altı zaman, beş darb: Yürük Semâî ile aynı vuruşlar, bir mertebe ağır (6/4). İki semâînin eklenmesidir ama ikinci semâînin son iki zamanı tek darbta birleşir. Ağır semâî formunun usulü; ilâhi, şarkı, türkü ve saz semâîlerinin dördüncü hânesinde çok kullanılır.",
                en:"Six beats, five strokes: the same strokes as Yürük Semâî, one level heavier (6/4). Two semâîs joined, but the last two beats of the second are one stroke. The usul of the ağır semâî form; common in ilahis, şarkıs, türküs and the fourth hâne of saz semâîs." },
  aksak:      { lv:2, tempo:160, tr:"Dokuz zaman (sekizlik), altı darb (2+2+2+3): düm, te ke, düm, tek, tek. Bir sofyanla bir Türk aksağının birleşmesidir; çift zamanlı olmayışı ve 2+1 diye bitişi ona “aksak” (topal) adını verir. Şarkı, türkü, oyun havası ve ilâhîlerde çok sık.",
                en:"Nine eighths, six strokes (2+2+2+3): düm, te ke, düm, tek, tek. It joins a sofyan and a Türk aksağı; its odd length and 2+1 ending give it the name “aksak” (limping). Very common in şarkıs, türküs, dance tunes and ilahis." },
  karsilama:  { lv:2, tempo:160, tr:"Trakya karşılaması, dokuz sekizlik (2+2+2+3): düm tek düm tek. Aksak'ta ikinci ve son gruplar ikiye bölünür, karşılamada her grup tek vuruştur.",
                en:"The Thracian karşılama, nine eighths (2+2+2+3): düm tek düm tek. In aksak the second and last groups split in two; here each group is a single stroke." },
  roman:      { lv:3, tempo:160, tr:"Roman havası, dokuz sekizlik: düm tek tek, sonra kısa bir düm ve tek. Sondaki kısa düm oyunu sıçratır.",
                en:"Roman havası, nine eighths: düm tek tek, then a short düm and a tek. That short düm near the end makes the dance jump." },
  rumeli:     { lv:3, tempo:170, tr:"Yedi sekizlik (2+2+3): düm, tek, uzun tek. Rumeli ve Balkan oyunlarında.",
                en:"Seven eighths (2+2+3): düm, tek, long tek. In Rumelian and Balkan dances." },
  curcuna:    { lv:3, tempo:160, tr:"On zaman (sekizlik), altı darb: düm, te, uzun ke, düm, tek, tek. Aksak Semâî'nin yürük mertebesidir; Aksak'ın üçüncü vuruşu bir sekizlik uzamış gibidir. Köçekçe, oyun havası ve şarkılarda.",
                en:"Ten eighths, six strokes: düm, te, long ke, düm, tek, tek. The quick form of Aksak Semâî; like aksak with its third stroke one eighth longer. In köçekçes, dance tunes and şarkıs." },
  zeybek:     { lv:3, tempo:80,  tr:"Ege'nin ağır ve vakur zeybekleri, dokuz dörtlük: Ağır Aksak'ın vuruşlarıyla, çok ağır.",
                en:"The slow, proud zeybeks of the Aegean, nine quarters: Ağır Aksak's strokes, very slow." },
  agiraksak:  { lv:3, tempo:80,  tr:"Aksak'ın bir mertebe ağırı (dokuz dörtlük); fasıl şarkılarında, ilâhî, türkü ve ağır oyun havalarında. Zeybek de bu vuruşlarla çalınır.",
                en:"Aksak one level slower (nine quarters); in fasıl şarkıs, ilahis, türküs and slow dance tunes. Zeybek uses the same strokes." }
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

// ---- Ortak parçalar: Usuller sayfası ve ders adımı (usultap) aynı döngüyü, ızgarayı ve sonuç ekranını kullanır ----
// Usul döngüsü sesi. opts: { u, bpm, bars (Infinity: durdurulana kadar), countIn, guide "full" | "bar", onSlot(k, bar), onEnd }.
// Dönen t0Perf: ilk dilimin duyulduğu an (performance.now zamanı).
function usulLoop(ctx, opts){
  const { SK, hit } = ctx, a = SK.audioCtx(), slots = usulSlots(opts.u), n = slots.length, unit = 60/opts.bpm;
  const t0 = a.currentTime + 0.2, lat = (a.outputLatency || 0) + (a.baseLatency || 0);
  const total = opts.bars === Infinity ? Infinity : (opts.bars + (opts.countIn ? 1 : 0))*n;
  let i = 0, shown = -1, ended = false, raf = 0;
  const sched = () => {
    while(i < total && t0 + i*unit < a.currentTime + 0.15){
      const k = i % n, at = t0 + i*unit, counting = opts.countIn && i < n;
      if(counting || opts.guide === "full"){ if(slots[k]) hit(a, slots[k], at, counting ? 1 : 0.8); }
      else if(k === 0) hit(a, "T", at, 0.3);
      i++;
    }
  };
  const iv = setInterval(sched, 40); sched();
  const stopLoop = () => { clearInterval(iv); cancelAnimationFrame(raf); };
  const frame = () => {
    const pos = Math.floor((a.currentTime - lat - t0)/unit);
    if(pos >= 0 && pos !== shown && pos < total){ shown = pos; if(opts.onSlot) opts.onSlot(pos % n, Math.floor(pos/n)); }
    if(pos >= total && !ended){ ended = true; stopLoop(); if(opts.onEnd) opts.onEnd(); return; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return { t0Perf: ctxToPerf(a, t0), unitMs: unit*1000, n, slots, stop: stopLoop };
}
// Usulün düm-tek ızgarası (hide: heceler gizli)
function usulGridHtml(u, hide){
  const slots = usulSlots(u);
  return `<div class="usrow" style="--n:${slots.length}">${slots.map((s, k) =>
    `<span class="uscell ${hide ? "x" : s || "c"}" data-k="${k}"><b>${hide ? "" : usulSyl(s)}</b><i>${k + 1}</i></span>`).join("")}</div>`;
}
// Ölçü sayısı: uzun ölçüde az tekrar
function usulBars(unitMs, n){ const barMs = unitMs*n; return barMs > 4000 ? 2 : barMs > 2500 ? 3 : 4; }
// Sonuç görseli: beklenen vuruşlar çizgi (düm kalın), vurulanlar nokta (sapmaya göre renk, yanlış türse içi boş)
function usulTapSvg(r, from, to){
  const W = 600, t0 = from - 250, t1 = to, x = t => (((t - t0)/(t1 - t0))*W).toFixed(1);
  let s = `<svg class="rhsvg" viewBox="0 0 ${W} 60" role="img" aria-label="${L("Vuruşlar ve vurdukların", "Strokes and your taps")}"><line x1="0" x2="${W}" y1="30" y2="30" class="rhaxis"/>`;
  r.all.forEach(e => s += `<line x1="${x(e.t)}" x2="${x(e.t)}" y1="${e.k === "D" ? 8 : 16}" y2="${e.k === "D" ? 52 : 44}" class="rhexp${e.k === "D" ? " usd" : ""}"/>`);
  r.hits.forEach(h => { const c = Math.abs(h.dev) <= 60 ? "good" : Math.abs(h.dev) <= 120 ? "mid" : "bad";
    s += `<circle cx="${x(h.p.t)}" cy="30" r="5" class="rh${c}${h.ok ? "" : " uswrong"}"/>`; });
  r.extras.forEach(p => s += `<circle cx="${x(p.t)}" cy="30" r="4" class="rhextra"/>`);
  return s + "</svg>";
}
// Vuruş sonucu: puan, zamanlama, ipuçları ve görsel. pass: geçme puanı
function usulTapResultHtml(r, pass, from, to){
  const ms = v => Math.round(Math.abs(v));
  const where = !r.hits.length ? "—" : Math.abs(r.mean) < 20 ? L("vuruşun üstünde", "on the beat") : r.mean < 0 ? ms(r.mean) + L(" ms erken", " ms early") : ms(r.mean) + L(" ms geç", " ms late");
  const tips = [];
  if(r.missed > r.n*0.3) tips.push(L("Birçok vuruş kaçtı: tempoyu düşür, önce Dinle ile sesli say.", "Many strokes were missed: lower the tempo and count aloud with Listen first."));
  if(r.wrong) tips.push(L("Düm ve teki karıştırdığın yerler var: hecelerle say (Düm kalın, tek ince).", "Some düms and teks were swapped: say the syllables (Düm deep, tek light)."));
  if(r.extra > 2) tips.push(L("Fazla vuruş var: noktalı yerlerde ses sürer, vurma.", "Extra taps: on the dots the sound carries on, don't tap."));
  if(Math.abs(r.mean) > 60) tips.push(r.mean < 0 ? L("Acele ediyorsun: vuruşu bekle.", "You're rushing: wait for the stroke.") : L("Geride kalıyorsun: vuruşu önceden hisset.", "You're dragging: feel the stroke coming."));
  return `<div class="result"><div class="big">${r.score}</div><div>${L("puan", "points")} · ${r.hits.length}/${r.n} ${L("vuruş", "strokes")}${r.score >= pass ? " · <strong>" + L("geçtin", "passed") + "</strong>" : " · " + L("geçmek için ", "pass at ") + pass}</div></div>
    <div class="kv"><div><span class="label">${L("Zamanlama", "Timing")}</span>${where}</div>
      <div><span class="label">${L("Düm/tek karışan", "Düm/tek swapped")}</span>${r.wrong}</div>
      <div><span class="label">${L("Kaçan · fazla", "Missed · extra")}</span>${r.missed} · ${r.extra}</div></div>
    ${usulTapSvg(r, from, to)}
    ${tips.length ? `<div class="muted">${tips.join(" ")}</div>` : ""}`;
}
// Düm ve Tek vuruş alanı + klavye (F/J). Dönen: { slots, stop } — vuruşlar taps dizisine yazılır.
// Düğmeler sahnenin altına yapışık büyük hedeflerdir (başparmakla vurulur).
function usulPadHtml(){ return `<div class="uspad"><button type="button" class="uspadD" data-k="D">Düm</button><button type="button" class="uspadT" data-k="T">Tek</button></div>`; }
function usulPadBind(stage, isLive, taps){
  const press = (k, t, btn) => {
    if(!isLive()) return;
    taps.push({ k, t });
    if(btn){ btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit"); }
  };
  stage.querySelector(".uspad").addEventListener("pointerdown", e => {
    const b = e.target.closest("[data-k]"); if(!b) return;
    e.preventDefault(); press(b.dataset.k, e.timeStamp || performance.now(), b);
  });
  const onKey = e => {
    if(e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = /^[fds]$/i.test(e.key) ? "D" : /^[jkl]$/i.test(e.key) ? "T" : null;
    if(!k) return;
    e.preventDefault(); press(k, e.timeStamp || performance.now(), stage.querySelector(k === "D" ? ".uspadD" : ".uspadT"));
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}
// Vuruş turu: sayım ölçüsü + bars ölçü; bitince beklenen ve vurulan vuruşlar puanlanır. Dönen: { stop }
function usulTapRun(ctx, o){
  const { u, bpm, mem, taps, onSlot, onEnd } = o, slots = usulSlots(u), unitMs = 60000/bpm, bars = usulBars(unitMs, slots.length);
  const l = usulLoop(ctx, { u, bpm, bars, countIn:true, guide: mem ? "bar" : "full", onSlot: (k, bar) => onSlot(k, bar, bars, slots),
    onEnd: () => {
      const expected = [];
      for(let b = 1; b <= bars; b++) slots.forEach((s, k) => { if(s) expected.push({ t: l.t0Perf + (b*slots.length + k)*unitMs, k:s }); });
      const r = usulTapScore(expected, taps.filter(p => p.t > l.t0Perf + (slots.length - 0.5)*unitMs), unitMs);
      onEnd(r, expected[0] ? expected[0].t : 0, l.t0Perf + (bars + 1)*slots.length*unitMs);
    } });
  return l;
}
// Usuller sayfası ile derslerin ortak ilerlemesi: { [usulId]: { listen, tap, mem, play } }
function usulRecord(store, id, step, v){
  const prog = store.get("usul.prog", {}), p = prog[id] || (prog[id] = {});
  if(p[step] == null || v > p[step]){ p[step] = v; store.set("usul.prog", prog); }
}

TRAINERS.usul = function(ctx){
  const { SK, $, store, esc, hit, needMic } = ctx;
  const P = $("pp-usul");
  const list = Object.keys(USUL_INFO).map(id => USULS.find(u => u.id === id)).filter(Boolean);
  let prog = store.get("usul.prog", {});
  const reload = () => { prog = store.get("usul.prog", {}); };
  let cur = list.find(u => u.id === store.get("usul.cur", "semai")) || list[0];
  let mode = "learn", run = null, raf = 0, keyOff = null;

  P.innerHTML = `
    <p class="pdesc">${L("Türk müziğinde ritim kalıbına usul denir: ölçünün içinde kalın “düm” ve ince “tek” vuruşlarının sırası. Bir usulü dört adımda öğren: dinle ve say, Düm ve Tek düğmeleriyle elle vur, ezberden vur, sonra klarnetle çal. “Hangi usul?” duyduğunu tanımayı sınar.",
      "In Turkish music a rhythmic pattern is called an usul: the order of deep “düm” and light “tek” strokes in a bar. Learn each usul in four steps: listen and count, tap along with the Düm and Tek buttons, tap from memory, then play it. “Which usul?” tests whether you can recognise one by ear.")}</p>
    <div class="pbar"><div class="seg" role="radiogroup" aria-label="${L("Kip", "Mode")}" id="usmode">
      <button type="button" role="radio" data-m="learn">${L("Öğren", "Learn")}</button>
      <button type="button" role="radio" data-m="quiz">${L("Hangi usul?", "Which usul?")}</button></div></div>
    <details class="phelp"><summary>${L("Kavramlar: zaman, darb, düm, tek, çevrim", "Terms: zaman, darb, düm, tek, cycle")}</summary><div class="phelpbody">
      <p>${L("Zaman: usulün saydığın eşit birimleri (ölçünün payı; 9/8'de dokuz sekizlik). Vuruş kelimesi gündelikte ikisi için de kullanılır; burada zaman sayılan birim, darb çalınan vuruştur.",
        "Zaman (beat): the equal units you count (the top number; nine eighths in 9/8). Darb (stroke): a stroke actually played on the drum.")}</p>
      <p>${L("Darb: usulü belirleyen vuruşlar. Düm kalın ve ağır (davulun ortası), tek ince ve hafif (kenarı); “te-ke” iki kısa tek. Bir darb birkaç zaman sürebilir, bu yüzden zaman ve darb sayısı farklı olabilir: Sofyan 4 zaman, 3 darbdır.",
        "Darb: the strokes that define the usul. Düm is deep and heavy (the centre of the drum), tek is light (the rim); “te-ke” is two short teks. A stroke can last several beats, so the counts can differ: Sofyan has 4 beats and 3 strokes.")}</p>
      <p>${L("Usul çevrimi: kalıbın bir kez baştan sona çalınması. Kısa usullerde bir çevrim bir ölçüdür; uzun usullerde (ör. Devr-i kebîr 28 zaman) bir çevrim birkaç ölçüye yazılır.",
        "Usul cycle: one full pass through the pattern. In short usuls a cycle is one bar; long usuls (e.g. Devr-i kebîr, 28 beats) are written over several bars.")}</p>
      <p>${L("Klasik usullerin kalıpları yazılı kaynaklardadır (TDV). Oyun havası ritimleri (kasap, çiftetelli, karşılama, Roman, Rumeli) yaşayan geleneklerdir; burada gösterilen yaygın bir çalıştır.",
        "Classical usul patterns are written in the sources (TDV). Dance rhythms (kasap, çiftetelli, karşılama, Roman, Rumeli) are living traditions; what you see here is one common way to play them.")}</p>
    </div></details>
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

  // Her yerde aynı birim: vuruş/dk; hangi notanın bir vuruş olduğu yanında (♪ sekizlik, ♩ dörtlük)
  const unitName = u => L("vuruş/dk", "beats/min") + (u.meter.split("/")[1] === "8" ? " (♪)" : " (♩)");
  const tempoKey = () => "usul.tempo." + cur.id;
  const tempo = () => Math.max(40, Math.min(260, +$("ustempo").value || USUL_INFO[cur.id].tempo));
  const pg = id => prog[id] || (prog[id] = {});
  const passed = (id, st) => { const v = (prog[id] || {})[st.id]; return v != null && v >= st.pass; };
  const nDone = id => USUL_STEPS.filter(st => passed(id, st)).length;
  const record = (st, v) => { const p = pg(cur.id); if(p[st.id] == null || v > p[st.id]) p[st.id] = v; usulRecord(store, cur.id, st.id, v); paintList(); paintSteps(); };

  // ---- Çizim ----
  function paintList(){
    reload();
    let lv = 0, h = "";
    for(const u of list){
      const i = USUL_INFO[u.id];
      if(i.lv !== lv){ lv = i.lv; h += `<div class="label usgl">${USUL_LV[lv]}</div>`; }
      const n = nDone(u.id);
      h += `<button type="button" class="usitem" data-u="${u.id}" aria-pressed="${u === cur}"><b>${esc(u.name)}</b><small>${u.meter}</small>
        <span class="usdots" aria-label="${n}/4 ${L("adım", "steps")}">${USUL_STEPS.map((_, k) => `<i${k < n ? ' class="on"' : ""}></i>`).join("")}<em class="${n === 4 ? "all" : ""}">${n}/4 ${L("adım", "steps")}</em></span></button>`;
    }
    $("uslist").innerHTML = h;
  }
  const gridHtml = usulGridHtml;
  function paintGrid(hide){ $("usgrid").innerHTML = gridHtml(cur, hide); }
  function paintSteps(){
    reload();
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
    // Zaman: usulün birim vuruş sayısı (ölçü payı); darb: düm ve tek vuruşlarının sayısı. İkisi farklı olabilir (Sofyan 4/3)
    const zaman = +cur.meter.split("/")[0], darb = cur.strokes.length;
    $("usname").textContent = cur.name; $("usmeter").textContent = cur.meter + " · " + zaman + L(" zaman · ", " beats · ") + darb + L(" darb", " strokes"); $("uslv").textContent = USUL_LV[i.lv];
    $("usdesc").textContent = pick(i, LANG) + (cur.halk ? " " + L("Burada yaygın bir darbuka çalışı var; oyun havası ritimleri yöreye, icracıya ve oyuna göre değişir, tek doğru kalıp yoktur. Hocanın ya da dinlediğin topluluğun çalışını esas al.",
      "This is one common darbuka pattern; dance rhythms vary by region, player and dance, and there is no single correct pattern. Follow your teacher's or your local group's version.") : "");
    $("ussay").textContent = cur.strokes.map(([s, d]) => usulSyl(s) + " –".repeat(d - 1)).join("  ");
    $("ustempo").value = store.get(tempoKey(), i.tempo); $("usunit").textContent = unitName(cur);
    paintGrid(false); paintList(); paintSteps(); idleStage(); paintArch();
  }
  // Arşivde bu usulde eser yoksa düğme yalan söylemesin: oyun havası usulünde "Oyun havası eserleri" (SK.archiveByUsul o listeyi açar), ötekinde gizli
  function paintArch(){
    const b = $("usarch"), id = cur.id, set = has => {
      if(cur.id !== id) return;
      b.textContent = has ? L("Bu usulde eserler", "Pieces in this usul") : L("Oyun havası eserleri", "Dance tunes in the archive");
      b.hidden = !has && !cur.halk;
    };
    set(true);
    if(SK.archiveIndex) SK.archiveIndex().then(list => set(list.some(e => e.u === id))).catch(() => {});
  }
  function idleStage(){
    const next = USUL_STEPS.find(st => !passed(cur.id, st));
    $("usstage").innerHTML = `<div class="muted">${next ? L("Sıradaki adım: ", "Next step: ") + "<b>" + next.name + "</b>. " + L("Adıma dokun.", "Tap the step.")
      : L("Bu usulün dört adımını da geçtin. Tempoyu artırıp yeniden dene ya da sıradaki usule geç.", "You've passed all four steps for this usul. Raise the tempo and try again, or move on to the next usul.")}</div>`;
  }
  const mark = k => {
    $("usgrid").querySelectorAll(".uscell").forEach(c => c.classList.toggle("now", +c.dataset.k === k));
  };

  // ---- Ses: usul döngüsü (ortak: usulLoop) ----
  const loop = opts => usulLoop(ctx, { u: cur, bpm: tempo(), ...opts });
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
    const mem = st.id === "mem", u = cur, slots = usulSlots(u);
    $("usstage").innerHTML = `<div class="muted" id="ustell">${mem
      ? L("Bir ölçü sayım çalar, sonra yalnız ölçü başında hafif bir tık duyulur. Düm ve tekleri ezberden vur.", "One bar of count-in, then only a light click on each downbeat. Tap the düms and teks from memory.")
      : L("Bir ölçü sayımı dinle, sonra usulle birlikte vur.", "Listen to one bar of count-in, then tap along with the usul.")} ${L("Klavyede F = düm, J = tek.", "On a keyboard F = düm, J = tek.")}</div>
      <div class="usbig" id="uscount">${L("Sayım", "Count-in")}</div>
      ${usulPadHtml()}`;
    const taps = [];
    keyOff = usulPadBind($("usstage"), () => !!run && run.kind === "tap", taps);
    if(mem) paintGrid(true);
    const l = usulTapRun(ctx, { u, bpm: tempo(), mem, taps,
      onSlot: (k, bar, bars) => {
        mark(k);
        const el = $("uscount"); if(!el) return;
        el.textContent = bar === 0 ? L("Sayım ", "Count ") + (k + 1) : (mem ? "" : usulSyl(slots[k]) === "·" ? "" : usulSyl(slots[k])) || (bar + " / " + bars);
      },
      onEnd: (r, from, to) => {
        if(keyOff){ keyOff(); keyOff = null; }
        run = null; mark(-1); paintGrid(false);
        record(st, r.score);
        $("usstage").innerHTML = usulTapResultHtml(r, st.pass, from, to) +
          `<div class="pbar"><button class="primary small" type="button" data-again="${st.id}">${L("Yeniden", "Again")}</button></div>`;
      } });
    run = { kind:"tap", stop: l.stop };
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
  // Adım seçilince sahne (talimat, Düm/Tek düğmeleri, sonuç) görünür alana gelir; alt menünün altında kalmaz
  function startStep(id){
    const st = USUL_STEPS.find(s => s.id === id);
    if(id === "listen") listen(st); else if(id === "play") playStep(st); else tapStep(st);
    showStage();
  }
  function showStage(){ const el = $("usstage"); if(el && el.scrollIntoView) el.scrollIntoView({ block:"center" }); }

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
  const showCur = () => {};
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
  // Eser sayfasından: seçili usulü değiştirir (sekme ayrıca açılır)
  SK.openUsul = id => { const u = list.find(x => x.id === id); if(!u) return; halt(); cur = u; store.set("usul.cur", u.id); setMode("learn"); paint(); };
  return {
    enter(){ paintList(); paintSteps(); showCur(); },
    nowTitle: () => mode === "quiz" ? L("Hangi usul?", "Which usul?") : cur.name,
    stop(){ halt(); if(mode === "learn") idleStage(); else quizIdle(); quiz = null; },
    leave(){ halt(); quiz = null; if(mode === "quiz") quizIdle(); }
  };
};

// Derslerde usul vurma: { type:"usultap", usul, mode:"listen"|"tap"|"mem", tempo?, min? }. Puan ve geçme sınırı Usuller
// sayfasındakiyle aynı, sonuç aynı kayda (usul.prog) yazılır: derste geçilen adım sayfada da geçilmiş görünür.
// Mikrofon gerekmez; ayrıca adım klarnetsiz yapılabildiği için ses çıkaramayan ilk günlerde de çalışır.
TRAINER_STEPS.usultap = function(st, stage, done, ctx){
  const { store, SK } = ctx, u = USULS.find(x => x.id === st.usul), slots = usulSlots(u);
  const bpm = st.tempo || (store.get("usul.tempo." + u.id, 0) || USUL_INFO[u.id].tempo), taps = [];
  let l = null, off = null, live = true;
  const grid = hide => stage.querySelector(".usgridl").innerHTML = usulGridHtml(u, hide);
  const mark = k => stage.querySelectorAll(".uscell").forEach(c => c.classList.toggle("now", +c.dataset.k === k));
  const say = u.strokes.map(([s, d]) => usulSyl(s) + " –".repeat(d - 1)).join("  ");
  const head = `<div class="label">${esc(u.name)} · ${u.meter} · ${bpm} ${L("vuruş/dk", "bpm")}</div><div class="usgrid usgridl" aria-hidden="true"></div><p class="ussay">${esc(say)}</p>`;
  function esc(t){ return ctx.esc(t); }
  const cleanup = () => { live = false; if(l){ l.stop(); l = null; } if(off){ off(); off = null; } mark(-1); };
  if(st.mode === "listen"){
    stage.innerHTML = head + `<div class="usbig" id="lsuscount"></div><div class="muted">${L("Vuruşlarla birlikte sesli say: “Düm” kalın, “tek” ince. Noktalı yerlerde ses sürer. Üç ölçü sonra adım biter.", "Count aloud with the strokes: “Düm” deep, “tek” light. On the dots the sound carries on. The step ends after three bars.")}</div>`;
    grid(false);
    l = usulLoop(ctx, { u, bpm, bars: 3, guide:"full", onSlot: (k, bar) => {
      mark(k); const el = stage.querySelector("#lsuscount"), s = slots[k]; if(el) el.textContent = usulSyl(s) === "·" ? "" : usulSyl(s);
    }, onEnd: () => { l = null; mark(-1); usulRecord(store, u.id, "listen", 1); done({ v:1 }); } });
    return { stop: cleanup };
  }
  const mem = st.mode === "mem";
  stage.innerHTML = head + `<div class="muted">${mem
    ? L("Bir ölçü sayım çalar, sonra yalnız ölçü başında hafif bir tık duyulur. Düm ve tekleri ezberden vur.", "One bar of count-in, then only a light click on each downbeat. Tap the düms and teks from memory.")
    : L("Bir ölçü sayımı dinle, sonra usulle birlikte vur.", "Listen to one bar of count-in, then tap along with the usul.")} ${L("Klavyede F = düm, J = tek.", "On a keyboard F = düm, J = tek.")}</div>
    <div class="usbig" id="lsuscount">${L("Sayım", "Count-in")}</div>${usulPadHtml()}`;
  grid(mem);
  off = usulPadBind(stage, () => live && !!l, taps);
  l = usulTapRun(ctx, { u, bpm, mem, taps,
    onSlot: (k, bar, bars) => {
      mark(k); const el = stage.querySelector("#lsuscount"); if(!el) return;
      el.textContent = bar === 0 ? L("Sayım ", "Count ") + (k + 1) : (mem ? "" : usulSyl(slots[k]) === "·" ? "" : usulSyl(slots[k])) || (bar + " / " + bars);
    },
    onEnd: (r, from, to) => {
      cleanup(); grid(false);
      const body = stage.querySelector(".usbig"); if(body) body.remove();
      const pad = stage.querySelector(".uspad"); if(pad) pad.remove();
      usulRecord(store, u.id, mem ? "mem" : "tap", r.score);
      stage.insertAdjacentHTML("beforeend", usulTapResultHtml(r, st.min || 70, from, to));
      done({ v: r.score });
    } });
  return { stop: cleanup };
};

// ======== Ritim heceleri ========
// Nota değerlerini kelime heceleriyle öğretme (İngilizcede "tea, cof-fee, co-co-nut, wa-ter-mel-on"). Her kalıp bir
// vuruşluk (ikilik iki vuruş) nota öbeğidir; at: vuruş içindeki nota başları (vuruş cinsinden). Üç hece sistemi:
// Türkçe meyveler, İngilizce yiyecekler ve okullardaki ta-ti (Kodály) heceleri.
const HECE_FIGS = [
  { id:"ta",   lv:1, beats:1, at:[0], name:L("Dörtlük", "Quarter note"),
    syl:{ tr:["nar"], en:["tea"], ta:["ta"] } },
  { id:"titi", lv:1, beats:1, at:[0, 0.5], name:L("İki sekizlik", "Two eighths"),
    syl:{ tr:["el","ma"], en:["cof","fee"], ta:["ti","ti"] } },
  { id:"sus",  lv:1, beats:1, at:[], name:L("Dörtlük sus", "Quarter rest"),
    syl:{ tr:["sus"], en:["shh"], ta:["sus"] } },
  { id:"taa",  lv:1, beats:2, at:[0], name:L("İkilik", "Half note"),
    syl:{ tr:["na-ar"], en:["te-ea"], ta:["ta-a"] } },
  { id:"tri",  lv:2, beats:1, at:[0, 1/3, 2/3], name:L("Triole (üç sekizlik)", "Triplet"),
    syl:{ tr:["por","ta","kal"], en:["co","co","nut"], ta:["tri","o","la"] } },
  { id:"tiri", lv:3, beats:1, at:[0, 0.25, 0.5, 0.75], name:L("Dört onaltılık", "Four sixteenths"),
    syl:{ tr:["man","da","li","na"], en:["wa","ter","mel","on"], ta:["ti","ri","ti","ri"] } }
];
const HECE_SYS = [["tr", L("Meyveler", "Fruits (Turkish)")], ["en", L("İngilizce", "English foods")], ["ta", "Ta-ti"]];
const HECE_LV = [[1, L("Kolay", "Easy")], [2, L("Orta", "Medium")], [3, L("Zor", "Hard")]];

// Dört vuruşluk rastgele ölçü: seviyenin kalıpları, başta ve art arda sus yok; seviyenin yeni kalıbı en az bir kez
function heceBar(lv){
  const pool = HECE_FIGS.filter(f => f.lv <= lv), rnd = a => a[Math.floor(Math.random()*a.length)];
  for(let tries = 0; tries < 50; tries++){
    const bar = []; let b = 0;
    while(b < 4){
      const prev = bar[bar.length - 1];
      bar.push(rnd(pool.filter(f => b + f.beats <= 4 && !(f.id === "sus" && (b === 0 || (prev && prev.id === "sus"))))));
      b += bar[bar.length - 1].beats;
    }
    if(lv > 1 && !bar.some(f => f.lv === lv)) continue;
    if(bar.filter(f => f.id === "ta").length > 2 || new Set(bar.map(f => f.id)).size < 2) continue;
    return bar;
  }
  return [HECE_FIGS[0], HECE_FIGS[1], HECE_FIGS[0], HECE_FIGS[1]];
}
// Ölçünün nota başları (vuruş cinsinden) ve her notanın hecesi
function heceEvents(bar, sys){
  const out = []; let b = 0;
  for(const f of bar){ f.at.forEach((x, j) => out.push({ at: b + x, syl: f.syl[sys][j] })); b += f.beats; }
  return out;
}
// Tek çizgili ritim notası (SVG). Notalar .hn, heceler .hs; data-n ölçüdeki nota sırası. card: tek kalıp kartı
// (ikilik de bir vuruş genişliğinde çizilir)
function heceSvg(bar, sys, cls = "", card = false){
  const P = 14, Y = 58, beats = bar.reduce((a, f) => a + f.beats, 0), BW = card ? 112/beats : 112, W = P*2 + beats*BW;
  let s = `<svg class="hcsvg ${cls}" viewBox="0 0 ${W} 100" role="img" aria-label="${bar.map(f => f.syl[sys].join("-")).join(", ")}">
    <line x1="${P - 6}" x2="${W - P + 6}" y1="${Y}" y2="${Y}" class="hcline"/><line x1="${W - P + 6}" x2="${W - P + 6}" y1="${Y - 14}" y2="${Y + 14}" class="hcline"/>`;
  let b = 0, n = 0;
  for(const f of bar){
    const x0 = P + b*BW, k = f.at.length, gap = k > 1 ? (BW - 30)/(k - 1) : 0;
    if(!k){
      const cx = x0 + BW/2 - 4;
      s += `<path class="hcrest" d="M${cx - 3},${Y - 18} l8,9 -6,7 8,9 c-7,-3 -11,1 -6,7 c-9,-4 -8,-12 0,-10 l-9,-9 6,-6 z"/>
        <text x="${cx + 1}" y="92" class="hs hsrest">${f.syl[sys][0]}</text>`;
    }else{
      const xs = f.at.map((_, j) => x0 + 14 + j*gap);
      xs.forEach((x, j) => {
        s += `<g class="hn" data-n="${n + j}"><ellipse cx="${x}" cy="${Y}" rx="7" ry="5" transform="rotate(-20 ${x} ${Y})"${f.id === "taa" ? ' class="hcopen"' : ""}/>
          <line x1="${x + 6.3}" x2="${x + 6.3}" y1="${Y - 2}" y2="${Y - 36}" class="hcstem"/></g>
          <text x="${x + 2}" y="92" class="hs" data-n="${n + j}">${f.syl[sys][j]}</text>`;
      });
      if(k > 1){
        const a = xs[0] + 5.3, z = xs[k - 1] + 7.3;
        s += `<rect x="${a}" y="${Y - 37}" width="${z - a}" height="5" class="hcbeam"/>`;
        if(f.id === "tiri") s += `<rect x="${a}" y="${Y - 29}" width="${z - a}" height="5" class="hcbeam"/>`;
        if(f.id === "tri") s += `<text x="${(a + z)/2}" y="${Y - 43}" class="hc3">3</text>`;
      }
      n += k;
    }
    b += f.beats;
  }
  return s + "</svg>";
}

// ---- Hece: ortak ses ve ders adımı ----
// Kısa, perdeli bir nota (heceyi duyurur); tıklardan ayrılsın diye üçgen dalga
function heceTone(a, t, dest){
  const o = a.createOscillator(), g = a.createGain();
  o.type = "triangle"; o.frequency.value = 523.25;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g).connect(dest); o.start(t); o.stop(t + 0.18);
}
// Ölçüyü çalar: countIn ölçü sayım, ardından bars ölçü; vuruşlarda tık, notes ise kalıbın notaları da.
// onCount(i) sayım vuruşu, onNote(n) o notanın duyulduğu an. startPerf: sayımdan sonraki ilk vuruş (performance.now)
function hecePlay(ctx, sys, b, o){
  const { SK, hit } = ctx, a = SK.audioCtx(), out = a.createGain(), beatS = 60/o.bpm, ev = heceEvents(b, sys), len = b.reduce((x, f) => x + f.beats, 0);
  out.connect(a.destination);
  const t0 = a.currentTime + 0.2, start = t0 + o.countIn*4*beatS, timers = [];
  const at = s => Math.max(0, (s - a.currentTime)*1000);
  for(let i = 0; i < o.countIn*4 + o.bars*len; i++) hit(a, (i < o.countIn*4 ? i % 4 : (i - o.countIn*4) % len) ? "T" : "D", t0 + i*beatS, i < o.countIn*4 ? 0.9 : 0.35, out);
  for(let bb = 0; bb < o.bars; bb++) ev.forEach((e, n) => {
    const t = start + (bb*len + e.at)*beatS;
    if(o.notes) heceTone(a, t, out);
    if(o.onNote) timers.push(setTimeout(() => o.onNote(n), at(t)));
  });
  if(o.onCount) for(let i = 0; i < o.countIn*4; i++) timers.push(setTimeout(() => o.onCount(i), at(t0 + i*beatS)));
  timers.push(setTimeout(() => { if(o.onEnd) o.onEnd(); }, at(start + o.bars*len*beatS) + 150));
  return { startPerf: ctxToPerf(a, start), beatMs: beatS*1000, ev, len,
    stop(){ timers.forEach(clearTimeout); try { out.disconnect(); } catch(e){} } };
}
// Derslerde ritim hecesi: { type:"hece", mode:"say"|"tap"|"quiz", lv, tempo?, n?, min? }
//   say  : ölçüyü dinle, heceleri sesli söyle (iki kez çalar, biter)
//   tap  : bir ölçü sayımdan sonra ölçüyü iki kez vur, puan en az min
//   quiz : çalan ölçüyü üç notadan bul, n soruda en az min doğru
// Mikrofonsuz. Alıştırma sayfasıyla ortak kayıt: hece.best (tap), hece.quiz.best (quiz).
TRAINER_STEPS.hece = function(st, stage, done, ctx){
  const { store, esc } = ctx, sys = store.get("hece.sys", LANG === "en" ? "en" : "tr"), bpm = st.tempo || 72, lv = st.lv || 1;
  let run = null, keyOff = null;
  const mark = n => stage.querySelectorAll(".hcbar [data-n]").forEach(x => x.classList.toggle("on", +x.dataset.n === n));
  const stop = () => { if(run){ run.stop(); run = null; } if(keyOff){ keyOff(); keyOff = null; } mark(-1); };
  const syl = b => b.map(f => f.syl[sys].join("-")).join("  ·  ");
  if(st.mode === "quiz"){
    const N = st.n || 5; let i = 0, right = 0, q = null;
    const play = () => { stop(); const r = hecePlay(ctx, sys, q.ans, { bpm, countIn:1, bars:2, notes:true, onEnd: () => { if(run === r) run = null; } }); run = r; };
    const next = () => {
      if(i >= N){
        stop(); stage.innerHTML = `<div class="result"><div class="big">${right}/${N}</div><div>${L("doğru", "correct")}</div></div>`;
        store.set("hece.quiz.best", Math.max(store.get("hece.quiz.best", 0), right)); return done({ v:right });
      }
      const key = b => b.map(f => f.id).join(), ans = heceBar(lv), opts = [ans];
      for(let t = 0; opts.length < 3 && t < 60; t++){ const b = heceBar(lv); if(!opts.some(o => key(o) === key(b))) opts.push(b); }
      opts.sort(() => Math.random() - 0.5); q = { ans, opts, done:false };
      stage.innerHTML = `<div class="label">${L("Soru ", "Question ")}${i + 1} / ${N}</div><p>${L("Dinle: hangi ölçü çalıyor?", "Listen: which bar is playing?")}</p>
        <div class="hcqopts">${opts.map((o, k) => `<button type="button" class="hcqopt" data-q="${k}">${heceSvg(o, sys)}</button>`).join("")}</div>
        <div class="pbar"><button class="stopbtn" type="button" data-hq="again">${L("Tekrar dinle", "Hear again")}</button></div><div class="hcqfb"></div>`;
      play();
    };
    stage.onclick = e => {
      const t = e.target;
      if(t.closest("[data-hq=again]")) return play();
      if(t.closest("[data-hq=next]")) return next();
      const b = t.closest("[data-q]"); if(!b || q.done) return;
      q.done = true; const k = +b.dataset.q, ok = q.opts[k] === q.ans; if(ok) right++; i++;
      stage.querySelectorAll("[data-q]").forEach(x => { x.disabled = true; if(q.opts[+x.dataset.q] === q.ans) x.classList.add("right"); else if(+x.dataset.q === k) x.classList.add("wrong"); });
      stage.querySelector(".hcqfb").innerHTML = `<p><b>${ok ? L("Doğru.", "Right.") : L("Çalan, yeşil ölçüydü.", "The green bar was playing.")}</b> ${esc(syl(q.ans))}</p>
        <div class="pbar"><button class="primary small" type="button" data-hq="next">${i < N ? L("Sonraki", "Next") : L("Sonuç", "Result")}</button></div>`;
    };
    next();
    return { stop: () => { stop(); stage.onclick = null; } };
  }
  const bar = heceBar(lv);
  stage.innerHTML = `<div class="hcbar">${heceSvg(bar, sys)}<div class="hcsay">${esc(syl(bar))}</div></div>`;
  if(st.mode === "say"){
    stage.insertAdjacentHTML("beforeend", `<div class="muted">${L("Notalarla birlikte heceleri sesli söyle. Kalın tık ölçü başı, ince tıklar vuruşlar. Ölçü iki kez çalar.", "Say the syllables aloud with the notes. The deep click is the downbeat, the light ones are the beats. The bar plays twice.")}</div>`);
    run = hecePlay(ctx, sys, bar, { bpm, countIn:1, bars:2, notes:true, onNote: mark, onEnd: () => { run = null; mark(-1); done({ v:1 }); } });
    return { stop };
  }
  stage.insertAdjacentHTML("beforeend", `<div class="muted">${L("Bir ölçü sayımdan sonra ölçüyü iki kez vur: her hecede bir kez. Klavyede boşluk ya da herhangi bir harf.", "After a one-bar count-in, tap the bar twice: once per syllable. On a keyboard: space or any letter.")}</div>
    <div class="usbig" id="hccountl">${L("Sayım", "Count-in")}</div><div class="hcpad"><button type="button" class="hcpadb">${L("Vur", "Tap")}</button></div>`);
  const taps = [], btn = stage.querySelector(".hcpadb"), bars = 2, cnt = stage.querySelector("#hccountl");
  const press = t => { if(!run) return; taps.push({ k:"T", t }); btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit"); };
  btn.addEventListener("pointerdown", e => { e.preventDefault(); press(e.timeStamp || performance.now()); });
  const onKey = e => { if(e.repeat || e.ctrlKey || e.metaKey || e.altKey || !(e.key === " " || /^[a-z]$/i.test(e.key))) return; e.preventDefault(); press(e.timeStamp || performance.now()); };
  document.addEventListener("keydown", onKey); keyOff = () => document.removeEventListener("keydown", onKey);
  const r = hecePlay(ctx, sys, bar, { bpm, countIn:1, bars, notes:false,
    onCount: i => { cnt.textContent = L("Sayım ", "Count ") + (i + 1); },
    onNote: n => { mark(n); cnt.textContent = r.ev[n].syl; },
    onEnd: () => {
      stop();
      const expected = [];
      for(let b = 0; b < bars; b++) r.ev.forEach(e => expected.push({ t: r.startPerf + (b*r.len + e.at)*r.beatMs, k:"T" }));
      const step = Math.min(1, ...r.ev.map((e, i) => i ? e.at - r.ev[i-1].at : 1))*r.beatMs;
      const res = usulTapScore(expected, taps.filter(p => p.t > r.startPerf - step*0.5), step);
      const best = store.get("hece.best", {}); if(res.score > (best[lv] || 0)){ best[lv] = res.score; store.set("hece.best", best); }
      cnt.remove(); const pad = stage.querySelector(".hcpad"); if(pad) pad.remove();
      stage.insertAdjacentHTML("beforeend", `<div class="result"><div class="big">${res.score}</div><div>${L("puan", "points")} · ${res.hits.length}/${res.n} ${L("nota", "notes")}${res.score >= (st.min || 70) ? " · <strong>" + L("geçtin", "passed") + "</strong>" : " · " + L("geçmek için ", "pass at ") + (st.min || 70)}</div></div>` +
        usulTapSvg(res, expected[0].t, r.startPerf + bars*r.len*r.beatMs));
      done({ v: res.score });
    } });
  run = r;
  return { stop };
};

TRAINERS.hece = function(ctx){
  const { SK, $, store, esc, hit, needMic } = ctx;
  const P = $("pp-hece");
  let sys = store.get("hece.sys", LANG === "en" ? "en" : "tr"), lv = store.get("hece.lv", 1);
  let mode = "learn", bar = heceBar(lv), run = null, keyOff = null, quiz = null;

  P.innerHTML = `
    <p class="pdesc">${L("Nota değerlerini kelime heceleriyle öğren: dörtlük “nar”, iki sekizlik “el-ma”, triole “por-ta-kal”, dört onaltılık “man-da-li-na”. Heceyi söylemek vuruşu doğru böler. Önce kalıpları tek tek dinle, sonra karışık ölçüleri hecelerle say, elle vur ve klarnetle çal.",
      "Learn note values with word syllables: a quarter is “tea”, two eighths “cof-fee”, a triplet “co-co-nut”, four sixteenths “wa-ter-mel-on”. Saying the word splits the beat correctly. Listen to each pattern first, then count mixed bars with the syllables, tap them and play them.")}</p>
    <div class="pbar">
      <div class="seg" role="radiogroup" aria-label="${L("Kip", "Mode")}" id="hcmode">
        <button type="button" role="radio" data-m="learn">${L("Kalıplar", "Patterns")}</button>
        <button type="button" role="radio" data-m="drill">${L("Alıştırma", "Practice")}</button>
        <button type="button" role="radio" data-m="quiz">${L("Hangi ölçü?", "Which bar?")}</button></div>
      <select id="hcsys" aria-label="${L("Heceler", "Syllables")}">${HECE_SYS.map(([id, n]) => `<option value="${id}">${n}</option>`).join("")}</select>
      <div class="stepper"><button class="mini" type="button" data-hct="-4" aria-label="${L("Yavaşlat", "Slower")}">−</button>
        <input id="hctempo" type="number" min="40" max="160" step="4" aria-label="Tempo">
        <button class="mini" type="button" data-hct="4" aria-label="${L("Hızlandır", "Faster")}">+</button><em>${L("vuruş/dk", "bpm")}</em></div>
    </div>
    <div id="hclearn"><div class="hcfigs" id="hcfigs"></div>
      <p class="muted small">${L("Bir kalıba dokun: dört vuruş boyunca çalar, sen heceleri sesli söyle.", "Tap a pattern: it plays for four beats; say the syllables aloud.")}</p></div>
    <div id="hcdrill" hidden>
      <div class="pbar"><div class="seg" role="radiogroup" aria-label="${L("Seviye", "Level")}" id="hclv">
        ${HECE_LV.map(([v, n]) => `<button type="button" role="radio" data-lv="${v}">${n}</button>`).join("")}</div>
        <button class="stopbtn" type="button" id="hcnew">${L("Yeni ölçü", "New bar")}</button></div>
      <div class="hcbar" id="hcbar"></div>
      <div class="pbar">
        <button class="primary small" type="button" id="hclisten">${L("Dinle", "Listen")}</button>
        <button class="stopbtn" type="button" id="hctap">${L("Elle vur", "Tap it")}</button>
        <button class="stopbtn" type="button" id="hcplay">${L("Klarnetle çal", "Play it")}</button></div>
      <div class="stage" id="hcstage"></div>
    </div>
    <div id="hcquiz" hidden><div class="stage" id="hcqstage"></div></div>`;

  const tempo = () => Math.max(40, Math.min(160, +$("hctempo").value || 72));
  const fig = id => HECE_FIGS.find(f => f.id === id);
  $("hctempo").value = store.get("hece.tempo", 72);
  $("hcsys").value = sys;

  // ---- Çizim ----
  function paintFigs(){
    $("hcfigs").innerHTML = HECE_FIGS.map(f => `<button type="button" class="hcfig" data-f="${f.id}">
      ${heceSvg([f], sys, "small", true)}<b>${f.syl[sys].join("-")}</b><small>${f.name}</small></button>`).join("");
  }
  function paintBar(){
    $("hcbar").innerHTML = heceSvg(bar, sys) + `<div class="hcsay">${bar.map(f => f.syl[sys].join("-")).join("  ·  ")}</div>`;
  }
  function paint(){
    paintFigs(); paintBar();
    $("hclv").querySelectorAll("[data-lv]").forEach(b => b.setAttribute("aria-checked", +b.dataset.lv === lv ? "true" : "false"));
  }
  // Çalan notayı vurgula (el: SVG'nin kabı; n < 0 temizler)
  const mark = (el, n) => el && el.querySelectorAll("[data-n]").forEach(x => x.classList.toggle("on", +x.dataset.n === n));

  // ---- Ses ----
  const playBar = (b, o) => hecePlay(ctx, sys, b, o);
  function halt(){
    if(run){ run.stop(); run = null; }
    if(keyOff){ keyOff(); keyOff = null; }
    P.querySelectorAll(".hcsvg [data-n].on").forEach(x => x.classList.remove("on"));
    P.querySelectorAll(".hcfig.now").forEach(x => x.classList.remove("now"));
    $("hclisten").textContent = L("Dinle", "Listen");
  }

  // ---- Kalıplar ----
  function playFig(id, btn){
    const was = run && run.fig === id; halt(); if(was) return;
    const f = fig(id), k = Math.max(1, f.at.length);
    btn.classList.add("now");
    const r = playBar(f.beats === 2 ? [f, f] : [f, f, f, f], { bpm: tempo(), countIn:0, bars:1, notes:true,
      onNote: n => mark(btn, n % k), onEnd: () => { if(run === r) halt(); } });
    run = r; r.fig = id;
  }

  // ---- Alıştırma ----
  function listen(){
    const was = run && run.kind === "listen"; halt(); if(was) return;
    $("hclisten").textContent = L("Durdur", "Stop");
    $("hcstage").innerHTML = `<div class="muted">${L("Notalarla birlikte heceleri sesli söyle. Kalın tık ölçü başı, ince tıklar vuruşlar.", "Say the syllables aloud with the notes. The deep click is the downbeat, the light ones are the beats.")}</div>`;
    const r = playBar(bar, { bpm: tempo(), countIn:1, bars:2, notes:true, onNote: n => mark($("hcbar"), n), onEnd: () => { if(run === r) halt(); } });
    run = r; r.kind = "listen";
  }
  function tapStep(){
    halt();
    $("hcstage").innerHTML = `<div class="muted">${L("Bir ölçü sayımdan sonra ölçüyü iki kez vur: her hecede bir kez. Metronom yalnız vuruşları çalar. Klavyede boşluk ya da herhangi bir harf.", "After a one-bar count-in, tap the bar twice: once per syllable. The metronome plays only the beats. On a keyboard: space or any letter.")}</div>
      <div class="usbig" id="hccount">${L("Sayım", "Count-in")}</div>
      <div class="hcpad"><button type="button" id="hcpadb">${L("Vur", "Tap")}</button></div>`;
    const taps = [], btn = $("hcpadb"), bars = 2;
    const press = t => {
      if(!run || run.kind !== "tap") return;
      taps.push({ k:"T", t }); btn.classList.remove("hit"); void btn.offsetWidth; btn.classList.add("hit");
    };
    btn.addEventListener("pointerdown", e => { e.preventDefault(); press(e.timeStamp || performance.now()); });
    const onKey = e => {
      if(e.repeat || e.ctrlKey || e.metaKey || e.altKey || !(e.key === " " || /^[a-z]$/i.test(e.key))) return;
      e.preventDefault(); press(e.timeStamp || performance.now());
    };
    document.addEventListener("keydown", onKey); keyOff = () => document.removeEventListener("keydown", onKey);
    const r = playBar(bar, { bpm: tempo(), countIn:1, bars, notes:false,
      onCount: i => { const el = $("hccount"); if(el) el.textContent = L("Sayım ", "Count ") + (i + 1); },
      onNote: n => { mark($("hcbar"), n); const el = $("hccount"); if(el) el.textContent = r.ev[n].syl; },
      onEnd: () => {
        if(keyOff){ keyOff(); keyOff = null; }
        run = null; mark($("hcbar"), -1);
        const expected = [];
        for(let b = 0; b < bars; b++) r.ev.forEach(e => expected.push({ t: r.startPerf + (b*r.len + e.at)*r.beatMs, k:"T" }));
        // Puanlama toleransı en kısa nota aralığına göre (onaltılıkta dar)
        const step = Math.min(1, ...r.ev.map((e, i) => i ? e.at - r.ev[i-1].at : 1))*r.beatMs;
        const res = usulTapScore(expected, taps.filter(p => p.t > r.startPerf - step*0.5), step);
        const best = store.get("hece.best", {}); if(res.score > (best[lv] || 0)){ best[lv] = res.score; store.set("hece.best", best); }
        showTap(res, expected[0].t, r.startPerf + bars*r.len*r.beatMs);
      } });
    run = r; r.kind = "tap";
  }
  function showTap(r, from, to){
    const ms = v => Math.round(Math.abs(v));
    const where = !r.hits.length ? "—" : Math.abs(r.mean) < 20 ? L("vuruşun üstünde", "on the beat") : r.mean < 0 ? ms(r.mean) + L(" ms erken", " ms early") : ms(r.mean) + L(" ms geç", " ms late");
    const tips = [];
    if(r.missed > r.n*0.3) tips.push(L("Birçok nota kaçtı: tempoyu düşür, önce Dinle ile heceleri söyle.", "Many notes were missed: lower the tempo and say the syllables with Listen first."));
    if(r.extra > 2) tips.push(L("Fazla vuruş var: hecede bir kez vur; ikilikte ve susta bekle.", "Extra taps: tap once per syllable; wait on half notes and rests."));
    if(Math.abs(r.mean) > 60) tips.push(r.mean < 0 ? L("Acele ediyorsun.", "You're rushing.") : L("Geride kalıyorsun.", "You're dragging."));
    if(!tips.length && r.score >= 80) tips.push(L("Güzel. Yeni ölçüye geç ya da tempoyu artır.", "Nice. Try a new bar or raise the tempo."));
    const best = store.get("hece.best", {})[lv] || 0;
    $("hcstage").innerHTML = `<div class="result"><div class="big">${r.score}</div><div>${L("puan", "points")} · ${r.hits.length}/${r.n} ${L("nota", "notes")} · ${L("bu seviyede en iyi ", "best at this level ")}${best}</div></div>
      <div class="kv"><div><span class="label">${L("Zamanlama", "Timing")}</span>${where}</div>
        <div><span class="label">${L("Kaçan · fazla", "Missed · extra")}</span>${r.missed} · ${r.extra}</div></div>
      ${tapSvg(r, from, to)}
      ${tips.length ? `<div class="muted">${tips.join(" ")}</div>` : ""}
      <div class="pbar"><button class="primary small" type="button" data-again="tap">${L("Yeniden", "Again")}</button>
        <button class="stopbtn" type="button" data-again="new">${L("Yeni ölçü", "New bar")}</button></div>`;
  }
  function tapSvg(r, from, to){
    const W = 600, t0 = from - 250, t1 = to, x = t => (((t - t0)/(t1 - t0))*W).toFixed(1);
    let s = `<svg class="rhsvg" viewBox="0 0 ${W} 60" role="img" aria-label="${L("Notalar ve vurdukların", "Notes and your taps")}"><line x1="0" x2="${W}" y1="30" y2="30" class="rhaxis"/>`;
    r.all.forEach(e => s += `<line x1="${x(e.t)}" x2="${x(e.t)}" y1="12" y2="48" class="rhexp"/>`);
    r.hits.forEach(h => s += `<circle cx="${x(h.p.t)}" cy="30" r="5" class="rh${Math.abs(h.dev) <= 60 ? "good" : Math.abs(h.dev) <= 120 ? "mid" : "bad"}"/>`);
    r.extras.forEach(p => s += `<circle cx="${x(p.t)}" cy="30" r="4" class="rhextra"/>`);
    return s + "</svg>";
  }
  async function playStep(){
    halt();
    if(!(await needMic())) return;
    const beatMs = 60000/tempo(), ev = heceEvents(bar, sys), pattern = { beats:4, at: ev.map(e => e.at) };
    $("hcstage").innerHTML = `<div class="muted">${L("Bir ölçü sayımdan sonra ölçüyü iki kez klarnetle çal: her hecede kısa bir nota (hangi nota olduğu önemli değil). Heceleri içinden söyle, her notayı dille ayır.", "After a one-bar count-in, play the bar twice: a short note on each syllable (any note). Say the syllables in your head and tongue each note.")}</div>
      <div class="usbig" id="hccount">${L("Sayım", "Count-in")}</div>`;
    const r = rhythmRun(ctx, { beatMs, pattern, bars:2, silent:false, accents:["D","T","T","T"] }, res => {
      run = null; mark($("hcbar"), -1);
      const e = rhythmEval(ctx, res, beatMs, pattern);
      $("hcstage").innerHTML = rhythmText(e) + rhythmSvg(res, e) +
        `<div class="muted small">${L("Sonuçlar hep kayıksa Ritim sayfasında gecikme ayarını yap.", "If results are always off, run the latency setup on the Rhythm page.")}</div>
        <div class="pbar"><button class="primary small" type="button" data-again="play">${L("Yeniden", "Again")}</button>
        <button class="stopbtn" type="button" data-again="new">${L("Yeni ölçü", "New bar")}</button></div>`;
    }, (i, counting) => {
      const el = $("hccount"); if(el) el.textContent = counting ? L("Sayım ", "Count ") + (i % 4 + 1) : "";
      if(!counting){ const beat = i % 4; mark($("hcbar"), ev.findIndex(x => x.at >= beat && x.at < beat + 1)); }
    });
    run = { kind:"play", stop: r.stop };
  }

  // ---- Hangi ölçü? ----
  const QN = 6;
  function quizIdle(){
    const best = store.get("hece.quiz.best", 0);
    $("hcqstage").innerHTML = `<p>${L("Bir ölçü iki kez çalar; üç notadan hangisi olduğunu bul. Zorluk Alıştırma'daki seviyedir. ", "A bar plays twice; pick it from three notations. The difficulty is the level set in Practice. ")}${QN}${L(" soru.", " questions.")}${best ? " " + L("Rekor ", "Record ") + best + "/" + QN + "." : ""}</p>
      <div class="pbar"><button class="primary small" type="button" id="hcqgo">${L("Başla", "Start")}</button></div>`;
  }
  function quizNext(){
    if(quiz.i >= QN) return quizEnd();
    const key = b => b.map(f => f.id).join(), ans = heceBar(lv), opts = [ans];
    for(let t = 0; opts.length < 3 && t < 60; t++){ const b = heceBar(lv); if(!opts.some(o => key(o) === key(b))) opts.push(b); }
    opts.sort(() => Math.random() - 0.5);
    quiz.q = { ans, opts, done:false };
    $("hcqstage").innerHTML = `<div class="label">${L("Soru ", "Question ")}${quiz.i + 1} / ${QN}</div>
      <p>${L("Dinle: hangi ölçü çalıyor?", "Listen: which bar is playing?")}</p>
      <div class="hcqopts">${opts.map((o, k) => `<button type="button" class="hcqopt" data-q="${k}">${heceSvg(o, sys)}</button>`).join("")}</div>
      <div class="pbar"><button class="stopbtn" type="button" id="hcqagain">${L("Tekrar dinle", "Hear again")}</button></div><div id="hcqfb"></div>`;
    quizPlay();
  }
  function quizPlay(){
    halt();
    const r = playBar(quiz.q.ans, { bpm: tempo(), countIn:1, bars:2, notes:true, onEnd: () => { if(run === r) run = null; } });
    run = r;
  }
  function quizAnswer(k){
    const q = quiz.q; if(q.done) return; q.done = true;
    const ok = q.opts[k] === q.ans; if(ok) quiz.right++;
    $("hcqstage").querySelectorAll("[data-q]").forEach(b => { b.disabled = true;
      if(q.opts[+b.dataset.q] === q.ans) b.classList.add("right"); else if(+b.dataset.q === k) b.classList.add("wrong"); });
    $("hcqfb").innerHTML = `<p><b>${ok ? L("Doğru.", "Right.") : L("Çalan, yeşil ölçüydü.", "The green bar was playing.")}</b> ${esc(q.ans.map(f => f.syl[sys].join("-")).join(" · "))}</p>
      <div class="pbar"><button class="primary small" type="button" id="hcqnext">${quiz.i + 1 < QN ? L("Sonraki", "Next") : L("Sonuç", "Result")}</button></div>`;
    quiz.i++;
  }
  function quizEnd(){
    halt();
    const best = store.get("hece.quiz.best", 0);
    if(quiz.right > best) store.set("hece.quiz.best", quiz.right);
    $("hcqstage").innerHTML = `<div class="result"><div class="big">${quiz.right}/${QN}</div><div>${quiz.right > best ? "<strong>" + L("yeni rekor", "new record") + "</strong>" : L("rekor ", "record ") + best + "/" + QN}</div></div>
      <div class="pbar"><button class="primary small" type="button" id="hcqgo">${L("Yeniden başla", "Start again")}</button></div>`;
    quiz = null;
  }
  $("hcqstage").addEventListener("click", e => {
    const t = e.target;
    if(t.closest("#hcqgo")){ halt(); quiz = { i:0, right:0, q:null }; quizNext(); }
    else if(t.closest("#hcqagain")) quizPlay();
    else if(t.closest("#hcqnext")) quizNext();
    else { const b = t.closest("[data-q]"); if(b && quiz) quizAnswer(+b.dataset.q); }
  });

  // ---- Olaylar ----
  function drillIdle(){
    $("hcstage").innerHTML = `<div class="muted">${L("Önce Dinle ile heceleri söyle, sonra Elle vur ya da Klarnetle çal.", "Say the syllables with Listen first, then Tap it or Play it.")}</div>`;
  }
  function setMode(m){
    halt(); mode = m; quiz = null;
    $("hcmode").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.m === m ? "true" : "false"));
    $("hclearn").hidden = m !== "learn"; $("hcdrill").hidden = m !== "drill"; $("hcquiz").hidden = m !== "quiz";
    if(m === "quiz") quizIdle(); else if(m === "drill") drillIdle();
  }
  const newBar = () => { halt(); bar = heceBar(lv); paintBar(); drillIdle(); };
  $("hcmode").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if(b && b.dataset.m !== mode) setMode(b.dataset.m); });
  $("hcsys").addEventListener("change", () => {
    halt(); sys = $("hcsys").value; store.set("hece.sys", sys); paint();
    if(mode === "quiz"){ quiz = null; quizIdle(); }
  });
  $("hclv").addEventListener("click", e => { const b = e.target.closest("[data-lv]"); if(!b) return; lv = +b.dataset.lv; store.set("hece.lv", lv); paint(); newBar(); });
  $("hcfigs").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if(b) playFig(b.dataset.f, b); });
  $("hcnew").addEventListener("click", newBar);
  $("hclisten").addEventListener("click", listen);
  $("hctap").addEventListener("click", tapStep);
  $("hcplay").addEventListener("click", playStep);
  $("hcstage").addEventListener("click", e => {
    const b = e.target.closest("[data-again]"); if(!b) return;
    if(b.dataset.again === "new") newBar(); else if(b.dataset.again === "tap") tapStep(); else playStep();
  });
  const setTempo = v => { $("hctempo").value = Math.max(40, Math.min(160, v)); store.set("hece.tempo", +$("hctempo").value); };
  P.querySelectorAll("[data-hct]").forEach(b => b.addEventListener("click", () => setTempo(tempo() + +b.dataset.hct)));
  $("hctempo").addEventListener("change", () => setTempo(tempo()));

  paint(); setMode("learn");
  return {
    nowTitle: () => mode === "quiz" ? L("Hangi ölçü?", "Which bar?") : L("Ritim heceleri", "Rhythm syllables"),
    stop(){ halt(); if(mode === "quiz"){ quiz = null; quizIdle(); } },
    leave(){ halt(); if(mode === "quiz"){ quiz = null; quizIdle(); } }
  };
};
