// Okuma ve kulak: deşifre (ilk görüşte okuma) için ezgi üretimi, ezgi ve ritim diktesi, aralık tanıma.
// Ezgiler her seferinde yeniden üretilir (ezberlenemesin); seviye arttıkça aralık, nota değerleri, ölçüler ve makam
// perdeleri genişler. Mantık tarayıcıda ve Node'da (require("./reading.js")); sekmeler ve ders adımları dosyanın sonunda.

const RDLEARN = typeof module !== "undefined" ? require("./learn.js") : { MAKAMS, makamById, USULS };
const RDCORE = typeof module !== "undefined" ? require("./core.js") : { nearestPerde, PERDES };

// ---- Ritim ----
// Ölçü vuruş grupları (dörtlük cinsinden): 4/4 dört dörtlük, 3/4 üç, 2/4 iki; 9/8 2+2+2+3, 7/8 2+2+3 sekizlik
const RD_GROUPS = { "4/4":[1,1,1,1], "3/4":[1,1,1], "2/4":[1,1], "9/8":[1,1,1,1.5], "7/8":[1,1,1.5] };
// Bir grubun bölünüşleri (seviyeye göre); her dizi toplamı grubun uzunluğu
const RD_SPLITS = {
  1:   [[1],[1],[0.5,0.5]],
  1.5: [[1.5],[1,0.5],[0.5,1],[0.5,0.5,0.5]]
};
// Bir ölçünün nota değerleri. lv 1: dörtlük ve ikilik; 2: + sekizlik ve noktalı dörtlük; 3+: aksak gruplar
function rhythmBar(meter, lv, rng = Math.random){
  const groups = RD_GROUPS[meter.join("/")] || RD_GROUPS["4/4"], out = [];
  for(let i=0;i<groups.length;i++){
    const g = groups[i];
    // İkilik: art arda iki dörtlük grup birleşir; noktalı dörtlük + sekizlik iki grubu kaplar
    if(g === 1 && groups[i + 1] === 1 && rng() < (lv <= 1 ? 0.35 : 0.2)){
      if(lv >= 2 && rng() < 0.4) out.push(1.5, 0.5); else out.push(2);
      i++; continue;
    }
    if(lv <= 1){ out.push(1); continue; }
    const opts = RD_SPLITS[g] || [[g]];
    out.push(...opts[Math.floor(rng()*opts.length)]);
  }
  return out;
}

// ---- Deşifre ----
// Notalar: lv 1 do majör Do4–Do5 (yalnızca adım ve üçlü), lv 2 Sol3–Fa5 (Fa♯, Si♭ dahil, dörtlü atlama),
// lv 3 makam perdeleri (temel makamlar, 4/4 ve 3/4), lv 4 bütün makamlar ve 2/4, 9/8, 7/8.
const SIGHT = {
  1: { notes:[60,62,64,65,67,69,71,72], meters:[[4,4]], bars:4, tempo:66, leap:2 },
  2: { notes:[55,57,59,60,62,64,65,66,67,69,70,71,72,74,76,77], meters:[[4,4],[3,4]], bars:4, tempo:72, leap:3 },
  3: { makams:["rast","ussak","huseyni","hicaz","nihavend","kurdi","segah"], meters:[[4,4],[3,4]], bars:4, tempo:72, leap:2 },
  4: { makams:["rast","ussak","huseyni","hicaz","nihavend","kurdi","segah","saba","huzzam","karcigar","nikriz"], meters:[[4,4],[2,4],[9,8],[7,8]], bars:4, tempo:84, leap:3 }
};
// Makamın dizisi (komalar), çalgıya sığan iki oktava kadar: durağın bir alt dörtlüsünden üstteki güçlünün bir dörtlü üstüne
function makamPool(mk){
  const set = new Set();
  for(const c of [...mk.asc, ...mk.desc]) for(const o of [-53, 0, 53]) set.add(c + o);
  return [...set].filter(c => c >= mk.durak - 9 && c <= mk.durak + 62 && c >= -26 && c <= 75).sort((a, b) => a - b);
}
const RD_USUL = { "9/8":"aksak", "7/8":"rumeli", "2/4":"kasap", "3/4":"semai", "4/4":"sofyan" };
// Dönen: { notes:[{ w, c, d, rest:false }], meter, tempo, makam (id|null), usul, level }
function sightMelody(lv, rng = Math.random){
  const L0 = SIGHT[Math.max(1, Math.min(4, lv))];
  const meter = L0.meters[Math.floor(rng()*L0.meters.length)];
  const mk = L0.makams ? RDLEARN.makamById(L0.makams[Math.floor(rng()*L0.makams.length)]) : null;
  // Perde havuzu: makamda komalar, değilse yazılı notalar (c = null, tampere)
  const pool = mk ? makamPool(mk) : L0.notes;
  const home = mk ? pool.indexOf(mk.durak) : pool.indexOf(L0.notes.includes(67) ? 67 : 60);
  const durs = [];
  for(let b=0;b<L0.bars;b++) durs.push(...rhythmBar(meter, lv <= 1 ? 1 : lv === 2 ? 2 : 3, rng));
  // Son nota durakta ve uzun: son ölçünün son grubu tek nota olur
  const bar = meter[0]*4/meter[1];
  let acc = 0, lastBarStart = 0;
  durs.forEach((d, i) => { if(acc < bar*(L0.bars - 1) - 1e-6) lastBarStart = i + 1; acc += d; });
  const tail = durs.splice(lastBarStart), groups = RD_GROUPS[meter.join("/")] || [1,1,1,1], gl = groups[groups.length - 1];
  let keep = 0, sum = 0; for(const d of tail){ if(sum + d > bar - gl - 1e-6) break; keep++; sum += d; }
  durs.push(...tail.slice(0, keep), bar - sum);
  // Yürüyüş: çoğunlukla adım, ara sıra atlama; havuzun dışına çıkmaz; son nota durak
  let i = home >= 0 ? home : Math.floor(pool.length/2);
  if(rng() < 0.5) i = Math.min(pool.length - 1, i + 2);
  const idx = [];
  for(let k=0;k<durs.length;k++){
    if(k === durs.length - 1){ idx.push(home >= 0 ? home : i); break; }
    idx.push(i);
    const r = rng(), step = r < 0.65 ? (rng() < 0.5 ? 1 : -1) : (rng() < 0.5 ? 1 : -1)*(2 + Math.floor(rng()*(L0.leap - 1)));
    let j = i + step;
    // Duraktan çok uzaklaşma (en çok bir oktav), sınıra gelince geri dön
    if(j < 0 || j >= pool.length || Math.abs(j - home) > 7) j = i - step;
    i = Math.max(0, Math.min(pool.length - 1, j));
  }
  // Sondan önceki nota durağa adımla bağlansın
  if(idx.length > 2){ const h = idx[idx.length - 1], p = idx[idx.length - 2]; if(Math.abs(p - h) > 2) idx[idx.length - 2] = h + (p > h ? 1 : -1); }
  const notes = durs.map((d, k) => {
    const v = pool[Math.max(0, Math.min(pool.length - 1, idx[k]))];
    return mk ? { w: Math.round(67 + v*12/53), c: v, d, rest:false } : { w: v, c: null, d, rest:false };
  });
  return { notes, meter, tempo: L0.tempo, makam: mk ? mk.id : null, usul: RD_USUL[meter.join("/")], level: lv };
}

// ---- Dikte ----
// Ezgi: lv 1 Rast beşlisi (Rast–Nevâ), 4 nota, adım adım; lv 2 Rast ya da Uşşak dizisi, 5 nota, üçlü atlamalı;
// lv 3 temel makamlardan biri, 6 nota. İlk nota verilir. Dönen { makam, pool (seçenek komaları), notes (komalar) }
const DICT_MEL = {
  1: { makams:["rast"], len:4, leap:1, span:[0, 31] },
  2: { makams:["rast","ussak"], len:5, leap:2, span:null },
  3: { makams:["rast","ussak","huseyni","hicaz","kurdi","nihavend","segah","saba","nikriz"], len:6, leap:2, span:null }
};
function dictMelody(lv, rng = Math.random){
  const D = DICT_MEL[Math.max(1, Math.min(3, lv))], mk = RDLEARN.makamById(D.makams[Math.floor(rng()*D.makams.length)]);
  let pool = [...new Set([...mk.asc, ...mk.desc])].sort((a, b) => a - b);
  if(D.span) pool = pool.filter(c => c >= D.span[0] && c <= D.span[1]);
  let i = pool.indexOf(mk.durak); if(i < 0) i = 0;
  if(rng() < 0.5) i = Math.min(pool.length - 1, i + Math.floor(rng()*3));
  const idx = [i];
  while(idx.length < D.len){
    let st = (rng() < 0.5 ? 1 : -1)*(1 + Math.floor(rng()*D.leap)), j = i + st;
    if(j < 0 || j >= pool.length) j = i - st;
    j = Math.max(0, Math.min(pool.length - 1, j));
    if(j === i) j = i > 0 ? i - 1 : i + 1;
    idx.push(j); i = j;
  }
  return { makam: mk.id, pool, notes: idx.map(k => pool[k]) };
}
// Ritim: aynı ölçüde dört ayrı seçenek (biri doğru). lv 1: 4/4 dörtlük ve ikilik, 2: + sekizlik ve noktalı, 3: 9/8 ve 7/8
function dictRhythm(lv, rng = Math.random){
  const meter = lv >= 3 ? (rng() < 0.6 ? [9,8] : [7,8]) : lv === 2 && rng() < 0.3 ? [3,4] : [4,4];
  const rl = Math.min(3, lv), seen = new Set(), opts = [];
  for(let tries = 0; opts.length < 4 && tries < 200; tries++){
    const r = rhythmBar(meter, rl, rng), k = r.join(",");
    if(r.length < 2 || seen.has(k)) continue;
    seen.add(k); opts.push(r);
  }
  return { meter, options: opts, answer: Math.floor(rng()*opts.length) };
}

// ---- Aralıklar ----
// Batı: yarım ses; makam: koma (AEU aralık adları)
const INTERVALS = {
  bati: [[1,{ tr:"küçük ikili", en:"minor 2nd" }],[2,{ tr:"büyük ikili", en:"major 2nd" }],[3,{ tr:"küçük üçlü", en:"minor 3rd" }],[4,{ tr:"büyük üçlü", en:"major 3rd" }],
         [5,{ tr:"tam dörtlü", en:"perfect 4th" }],[7,{ tr:"tam beşli", en:"perfect 5th" }],[12,{ tr:"oktav", en:"octave" }]],
  makam: [[4,{ tr:"bakiye (4 koma)", en:"bakiye (4 commas)" }],[5,{ tr:"küçük mücenneb (5)", en:"small mücenneb (5)" }],[8,{ tr:"büyük mücenneb (8)", en:"large mücenneb (8)" }],
          [9,{ tr:"tanini (9)", en:"tanini (9)" }],[13,{ tr:"artık ikili (13)", en:"augmented 2nd (13)" }]]
};
// Soru: { a, b (komalar), answer (aralık sayısı), choices:[[sayı, ad]] } — Batı'da komalar yarım sesten (tampere)
function intervalQuestion(pool, rng = Math.random){
  const list = INTERVALS[pool] || INTERVALS.bati, [n] = list[Math.floor(rng()*list.length)];
  const span = pool === "makam" ? n : n*53/12, a = Math.round((rng()*30 - 4)*10)/10;
  const down = pool === "bati" && rng() < 0.25;
  return { a: down ? a + span : a, b: down ? a : a + span, answer: n, choices: list };
}

if(typeof module !== "undefined") module.exports = { RD_GROUPS, rhythmBar, SIGHT, makamPool, sightMelody, DICT_MEL, dictMelody, dictRhythm, INTERVALS, intervalQuestion };

// ======== Tarayıcı: deşifre ve dikte ========
if(typeof TRAINERS !== "undefined"){

// Deşifre turu: ezgi üretilir, dizek gösterilir, istenirse birkaç saniye inceleme süresi, sonra sayımla tempolu çalma
// (pieces.js piecePlayer). onScore(pct) sonuçla çağrılır. holder: { score, fb, btns } öğeleri.
function sightRound(ctx, lv, els, onScore){
  const m = sightMelody(lv), piece = { id:"sight", name:"sight", noBest:true, notes: m.notes, tempo: m.tempo, meter: m.meter, makam: m.makam, usul: m.usul };
  const pl = piecePlayer(ctx, piece, els.score, els.fb, res => { if(res.mode === "tempo") onScore(res.v, m); });
  ctx.SK.setTempContext(m.makam);
  const desc = (m.makam ? RDLEARN.makamById(m.makam).name + " · " : "") + m.meter.join("/") + " · ♩ = " + m.tempo;
  return { pl, m, desc };
}

TRAINERS.desifre = function(ctx){
  const { SK, $, store } = ctx;
  const P = $("pp-desifre");
  P.innerHTML = `
    <p class="pdesc">${L("Daha önce görmediğin bir ezgiyi ilk seferde çal. Her turda yeni bir ezgi üretilir; inceleme süresinde notaya göz gezdir, sonra bir ölçü sayımdan sonra tempoda çal. Doğru nota oranı ölçülür; dinlemek turdan sonra açılır.",
      "Play a tune you have never seen, first time. A new tune is generated every round; look it over during the preview, then play in tempo after a one-bar count-in. The share of correct notes is measured; listening unlocks after the round.")}</p>
    <div class="pbar">
      <div class="seg" role="radiogroup" id="dslv" aria-label="${L("Seviye", "Level")}">${[1,2,3,4].map(l => `<button type="button" role="radio" data-l="${l}">${L("Seviye ", "Level ") + l}</button>`).join("")}</div>
      <label class="arsel">${L("İnceleme", "Preview")} <select id="dsprev" aria-label="${L("İnceleme süresi", "Preview time")}">${[0, 5, 10, 20].map(s => `<option value="${s}">${s ? s + L(" sn", " s") : L("yok", "none")}</option>`).join("")}</select></label>
      <button class="primary small" id="dsnew" type="button">${L("Yeni ezgi", "New tune")}</button>
    </div>
    <div class="muted" id="dsdesc"></div>
    <div class="scorewrap" id="dsscore"></div>
    <div class="fb" id="dsfb" aria-live="polite"></div>
    <div class="pbar"><button class="primary small" id="dsgo" type="button" disabled>${L("Sayımla çal", "Play with count-in")}</button>
      <button class="stopbtn" id="dslisten" type="button" disabled>${L("Doğrusunu dinle", "Hear it")}</button>
      <button class="stopbtn" id="dsstop" type="button">${L("Durdur", "Stop")}</button></div>
    <div class="muted small" id="dsstat"></div>`;
  let lv = store.get("sight.lv", 1), cur = null, timer = null, played = false;
  const LV = { 1: L("Do4–Do5, dörtlük ve ikilik", "C4–C5, quarters and halves"), 2: L("Sol3–Fa5, Fa♯ Si♭, sekizlik ve noktalı", "G3–F5, F♯ B♭, eighths and dotted"),
               3: L("makam perdeleri, 4/4 ve 3/4", "makam perdes, 4/4 and 3/4"), 4: L("bütün makamlar, 2/4 9/8 7/8", "all makams, 2/4 9/8 7/8") };
  function setLv(l){ lv = l; store.set("sight.lv", l); $("dslv").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", +b.dataset.l === l ? "true" : "false")); stat(); }
  function stat(){
    const h = store.get("sight.hist", []).filter(x => x.lv === lv), last = h.slice(-5);
    const avg = last.length ? Math.round(last.reduce((a, x) => a + x.v, 0)/last.length) : null;
    $("dsstat").textContent = LV[lv] + (avg !== null ? " · " + L("son " + last.length + " tur ortalaması %" + avg, "last " + last.length + " rounds average " + avg + "%") : "");
  }
  $("dslv").addEventListener("click", e => { const b = e.target.closest("[data-l]"); if(b) setLv(+b.dataset.l); });
  $("dsprev").value = store.get("sight.prev", 10);
  $("dsprev").addEventListener("change", () => store.set("sight.prev", +$("dsprev").value));
  setLv(lv);
  const fb = (t, c = "") => { $("dsfb").className = "fb " + c; $("dsfb").textContent = t; };
  function onScore(v){
    played = true; $("dslisten").disabled = false;
    const h = store.get("sight.hist", []); h.push({ d: dayKey(new Date()), lv, v }); store.set("sight.hist", h.slice(-200));
    const best = store.get("sight.best", {}); if(!best[lv] || v > best[lv]){ best[lv] = v; store.set("sight.best", best); }
    const last3 = h.filter(x => x.lv === lv).slice(-3);
    if(lv < 4 && last3.length === 3 && last3.every(x => x.v >= 80)) $("dsfb").textContent += L(" · Üç tur üst üste %80: Seviye " + (lv + 1) + "'e geçebilirsin.", " · 80% three times in a row: try level " + (lv + 1) + ".");
    stat();
  }
  function fresh(){
    clearInterval(timer); if(cur) cur.pl.stop();
    played = false;
    cur = sightRound(ctx, lv, { score: $("dsscore"), fb: $("dsfb") }, onScore);
    $("dsdesc").textContent = cur.desc; $("dslisten").disabled = true; $("dsgo").disabled = false;
    const sec = +$("dsprev").value;
    if(!sec){ fb(L("Hazır olunca Sayımla çal'a bas.", "Press Play with count-in when ready.")); return; }
    let left = sec; fb(L("İncele: ", "Look it over: ") + left + L(" sn", " s"));
    timer = setInterval(() => { left--; if(left > 0) fb(L("İncele: ", "Look it over: ") + left + L(" sn", " s")); else { clearInterval(timer); go(); } }, 1000);
  }
  async function go(){ clearInterval(timer); if(!cur) return; if(!(await ctx.needMic())) return; cur.pl.startTempo(1); }
  $("dsnew").addEventListener("click", fresh);
  $("dsgo").addEventListener("click", go);
  $("dslisten").addEventListener("click", () => { if(cur && played) cur.pl.listen(1); });
  $("dsstop").addEventListener("click", () => { clearInterval(timer); if(cur) cur.pl.stop(); SK.stopSound(); });
  return {
    enter(){ if(cur) SK.setTempContext(cur.m.makam); },
    leave(){ clearInterval(timer); if(cur) cur.pl.stop(); SK.setTempContext(null); },
    note(r, t){ if(cur) cur.pl.note(r, t); }, silence(t){ if(cur) cur.pl.silence(t); }
  };
};

// ---- Dikte oyunu: n soru, ezgi ya da ritim. stage içine çizer; bitince onEnd(doğru sayısı) ----
// Ezgide mikrofon açıksa çalınan notalar da sıradaki boşluğu doldurur (en az 250 ms tutulan, seçeneklerde olan perde).
function dictationGame(ctx, stage, o, onEnd){
  const { SK, sleep, esc } = ctx;
  let k = 0, right = 0, q = null, alive = true;
  const nameOf = c => (RDCORE.PERDES.find(p => p[0] === c) || [, ctx.nn(Math.round(67 + c*12/53))])[1];
  async function playMel(m){ const mk = RDLEARN.makamById(m.makam); for(const c of m.notes){ if(!alive || q.m !== m) return; SK.play(Math.round(67 + c*12/53), ctx.mkFreq(mk, c)); await sleep(560); SK.stopSound(); await sleep(70); } }
  async function playRh(r){
    const a = SK.audioCtx(), beatMs = 60000/(r.meter[1] === 8 ? 100 : 80), unitQ = 4/r.meter[1], per = r.meter[0];
    const clickMs = beatMs*unitQ, t0 = a.currentTime + 0.15;
    for(let i=0;i<per;i++) ctx.hit(a, i === 0 ? "D" : "T", t0 + i*clickMs/1000, 0.7);
    let t = per*clickMs;
    const ds = r.options[r.answer], c = 31, f = ctx.commaFreq(c);
    for(const d of ds){
      const at = t0*1000 + t, wait = at - a.currentTime*1000;
      await sleep(Math.max(0, wait)); if(!alive || q.r !== r) return;
      SK.play(Math.round(67 + c*12/53), f); await sleep(Math.min(d*beatMs*0.8, 600)); SK.stopSound();
      t += d*beatMs;
    }
  }
  function staffOf(ds, meter){
    const box = document.createElement("div"); box.className = "scorewrap dkopt";
    drawScore(box, ds.map(d => ({ w:74, c:31, d, rest:false })), { meter });
    return box;
  }
  async function ask(){
    if(!alive) return;
    if(k >= o.n){ stage.innerHTML = `<div class="result"><div class="big">${right}/${o.n}</div><div>${L("doğru", "correct")}</div></div>`; return onEnd(right); }
    if(o.mode === "rhythm"){
      const r = dictRhythm(o.level); q = { r, done:false };
      stage.innerHTML = `<div class="qcount">${L("Soru ", "Question ")}${k + 1}/${o.n} · ${r.meter.join("/")}</div>
        <div class="muted">${L("Bir ölçü sayımdan sonra ritim çalar. Duyduğun ritmi seç.", "After a one-bar count-in the rhythm plays. Pick the one you heard.")}</div>
        <div class="dkopts"></div><div class="pbar"><button class="stopbtn" type="button" data-again>${L("Tekrar dinle", "Listen again")}</button></div><div class="fb" aria-live="polite"></div>`;
      const box = stage.querySelector(".dkopts");
      r.options.forEach((ds, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "opt dkbtn"; b.dataset.a = i; b.appendChild(staffOf(ds, r.meter)); box.appendChild(b); });
      q.play = () => playRh(r);
    }else{
      const m = dictMelody(o.level); q = { m, got:[m.notes[0]], done:false };
      stage.innerHTML = `<div class="qcount">${L("Soru ", "Question ")}${k + 1}/${o.n} · ${RDLEARN.makamById(m.makam).name}</div>
        <div class="muted">${L("İlk nota verildi. Duyduğun notaları sırayla seç ya da klarnetle çal.", "The first note is given. Pick the notes you heard in order, or play them on the clarinet.")}</div>
        <div class="dkslots"></div>
        <div class="qopts dkpool">${m.pool.map(c => `<button class="opt small" type="button" data-c="${c}">${esc(nameOf(c))}<small>${ctx.nn(Math.round(67 + c*12/53))}</small></button>`).join("")}</div>
        <div class="pbar"><button class="stopbtn" type="button" data-again>${L("Tekrar dinle", "Listen again")}</button><button class="stopbtn" type="button" data-undo>${L("Geri al", "Undo")}</button></div>
        <div class="scorewrap dkans" hidden></div><div class="fb" aria-live="polite"></div>`;
      q.play = () => playMel(m);
      slots();
    }
    const my = q; await q.play();
    if(!alive || q !== my) return;
  }
  function slots(){
    const m = q.m;
    stage.querySelector(".dkslots").innerHTML = m.notes.map((_, i) => `<span class="dkslot${i < q.got.length ? " on" : ""}">${i < q.got.length ? esc(nameOf(q.got[i])) : "?"}</span>`).join("");
  }
  async function judge(){
    const m = q.m; q.done = true;
    const ok = q.got.every((c, i) => c === m.notes[i]);
    if(ok) right++;
    stage.querySelectorAll(".dkslot").forEach((s, i) => s.classList.add(q.got[i] === m.notes[i] ? "right" : "wrong"));
    const fb = stage.querySelector(".fb"); fb.className = "fb " + (ok ? "good" : "bad");
    fb.textContent = ok ? L("Doğru!", "Correct!") : L("Doğrusu: ", "It was: ") + m.notes.map(nameOf).join(" · ");
    if(!ok){ const ans = stage.querySelector(".dkans"); ans.hidden = false; drawScore(ans, m.notes.map(c => ({ w: Math.round(67 + c*12/53), c, d:1, rest:false })), { names:true }); }
    k++; await sleep(ok ? 900 : 2600); if(alive) ask();
  }
  function pickNote(c){
    if(!q || q.done || !q.m || q.got.length >= q.m.notes.length) return;
    q.got.push(c); slots();
    if(q.got.length === q.m.notes.length) judge();
  }
  stage.addEventListener("click", async e => {
    if(!q) return;
    if(e.target.closest("[data-again]")){ q.play(); return; }
    if(e.target.closest("[data-undo]")){ if(q.m && !q.done && q.got.length > 1){ q.got.pop(); slots(); } return; }
    const n = e.target.closest("[data-c]"); if(n){ pickNote(+n.dataset.c); return; }
    const b = e.target.closest(".dkbtn[data-a]"); if(!b || q.done || !q.r) return;
    q.done = true; const ok = +b.dataset.a === q.r.answer; if(ok) right++;
    b.classList.add(ok ? "right" : "wrong");
    if(!ok) stage.querySelector(`.dkbtn[data-a="${q.r.answer}"]`).classList.add("right");
    const fb = stage.querySelector(".fb"); fb.className = "fb " + (ok ? "good" : "bad"); fb.textContent = ok ? L("Doğru!", "Correct!") : L("Yanlış.", "Wrong.");
    k++; await sleep(ok ? 800 : 1800); if(alive) ask();
  });
  // Klarnetle cevap: kararlı nota (yazılı) en yakın seçeneğe (±2 koma) eşlenir
  let held = null;
  ask();
  return {
    note(r, t){
      if(!q || !q.m || q.done || SK.playing()) return;
      if(!held || held.w !== r.written){ held = { w: r.written, t, fired:false }; return; }
      if(held.fired || t - held.t < 250) return;
      const c = q.m.pool.find(x => Math.abs(x - r.comma) <= 2) ?? q.m.pool.find(x => Math.abs(x + 53 - r.comma) <= 2 || Math.abs(x - 53 - r.comma) <= 2);
      if(c === undefined) return;
      held.fired = true; pickNote(c);
    },
    silence(){ held = null; },
    stop(){ alive = false; SK.stopSound(); }
  };
}

TRAINERS.dikte = function(ctx){
  const { $, store } = ctx;
  const P = $("pp-dikte");
  P.innerHTML = `
    <p class="pdesc">${L("Duyduğunu yaz. Ritim diktesinde kısa bir ritim çalar, dört seçenekten doğrusunu seçersin. Ezgi diktesinde makamdan kısa bir ezgi çalar; ilk nota verilir, kalanları sırayla düğmelerden seçer ya da klarnetle çalarsın.",
      "Write what you hear. In rhythm dictation a short rhythm plays and you pick it from four options. In melodic dictation a short makam tune plays; the first note is given and you pick the rest in order from the buttons, or play them on the clarinet.")}</p>
    <div class="pbar">
      <div class="seg" role="radiogroup" id="dkmode" aria-label="${L("Dikte türü", "Dictation type")}">
        <button type="button" role="radio" data-m="rhythm">${L("Ritim", "Rhythm")}</button><button type="button" role="radio" data-m="melody">${L("Ezgi", "Melody")}</button></div>
      <select id="dklv" aria-label="${L("Seviye", "Level")}"><option value="1">${L("Seviye 1", "Level 1")}</option><option value="2">${L("Seviye 2", "Level 2")}</option><option value="3">${L("Seviye 3", "Level 3")}</option></select>
      <button class="primary small" id="dkgo" type="button">${L("Başlat (10 soru)", "Start (10 questions)")}</button>
    </div>
    <div class="stage" id="dkstage"><div class="muted">${L("Kulaklık önerilir.", "Headphones recommended.")}</div></div>`;
  let mode = store.get("dict.mode", "rhythm"), game = null;
  const setMode = m => { mode = m; store.set("dict.mode", m); $("dkmode").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.m === m ? "true" : "false")); };
  $("dkmode").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if(b) setMode(b.dataset.m); });
  setMode(mode);
  $("dklv").value = store.get("dict.lv", 1);
  $("dklv").addEventListener("change", () => store.set("dict.lv", +$("dklv").value));
  $("dkgo").addEventListener("click", () => {
    if(game) game.stop();
    const stage = $("dkstage"), fresh = stage.cloneNode(false); stage.replaceWith(fresh);
    const lv = +$("dklv").value, m = mode;
    game = dictationGame(ctx, fresh, { mode: m, level: lv, n:10 }, right => {
      const best = store.get("dict.best", {}), key = m + lv; if(!best[key] || right > best[key]){ best[key] = right; store.set("dict.best", best); }
      const h = store.get("dict.hist", []); h.push({ d: dayKey(new Date()), m, lv, v: right }); store.set("dict.hist", h.slice(-200));
      game = null;
    });
  });
  return { leave(){ if(game){ game.stop(); game = null; } }, note(r, t){ if(game) game.note(r, t); }, silence(t){ if(game) game.silence(t); } };
};

// ---- Ders adımları ----
TRAINER_STEPS.sight = function(st, stage, done, ctx){
  stage.innerHTML = `<div class="muted rdesc"></div><div class="scorewrap"></div><div class="fb"></div>
    <div class="pbar"><button class="primary small" type="button" data-go>${L("Sayımla başla", "Start with count-in")}</button><button class="stopbtn" type="button" data-new>${L("Yeni ezgi", "New tune")}</button></div>`;
  let cur = null;
  const fresh = () => {
    if(cur) cur.pl.stop();
    cur = sightRound(ctx, st.level, { score: stage.querySelector(".scorewrap"), fb: stage.querySelector(".fb") }, v => {
      const h = ctx.store.get("sight.hist", []); h.push({ d: dayKey(new Date()), lv: st.level, v }); ctx.store.set("sight.hist", h.slice(-200));
      done({ v });
    });
    stage.querySelector(".rdesc").textContent = cur.desc;
  };
  fresh();
  stage.querySelector("[data-go]").addEventListener("click", () => cur.pl.startTempo(1));
  stage.querySelector("[data-new]").addEventListener("click", fresh);
  return { note: (r, t) => cur && cur.pl.note(r, t), silence: t => cur && cur.pl.silence(t), stop(){ if(cur) cur.pl.stop(); } };
};
TRAINER_STEPS.dictation = function(st, stage, done, ctx){
  const g = dictationGame(ctx, stage, { mode: st.mode, level: st.level, n: st.n }, right => done({ v: right }));
  return { note: (r, t) => g.note(r, t), silence: t => g.silence(t), stop: () => g.stop() };
};
}
