// Çalışma bölümünün temel alıştırmaları: Parmak testi, Uzun ton, Dizi (makam), Taklit, Kayıt ve İlerleme sekmeleri.
// Mantık learn.js ve skills.js'te; practice.js her sekmeyi kendi yardımcılarıyla (ctx) kurar.

// ======== Parmak ezberi testi ========
TRAINERS.quiz = function(ctx){
  const { SK, $, store, nn, num, needMic, holder, perdeOf, staffSvg, miniChart, paintMini } = ctx;
  const P = $("pp-quiz");
  P.innerHTML = `
    <p class="pdesc">${L("Ezberini sına: <strong>Çal</strong> modunda istenen notayı klarnette çal, <strong>Bul</strong> modunda şemadaki parmağın hangi nota olduğunu seç (ya da çal), <strong>Oku</strong> modunda dizekteki notayı adını görmeden çal. Zorlandığın notalar daha sık gelir. Bir bölgede son 20 cevabın %80'i doğruysa sonraki bölge açılır.",
      "Test your memory: in <strong>Play</strong> mode play the requested note, in <strong>Identify</strong> mode pick the note shown by the fingering chart (or play it), in <strong>Read</strong> mode play the note on the staff without seeing its name. Notes you struggle with come up more often. A region unlocks the next one when 80% of your last 20 answers there are correct.")}</p>
    <div class="pbar">
      <div class="seg" role="radiogroup" aria-label="Test modu" id="qmode">
        <button type="button" role="radio" data-m="play">Çal</button>
        <button type="button" role="radio" data-m="find">Bul</button>
        <button type="button" role="radio" data-m="staff">${L("Oku", "Read")}</button>
      </div>
      <select id="qlevel" aria-label="Bölge"></select>
      <label class="chk" id="qaltwrap"><input type="checkbox" id="qalt"> alternatif parmaklar da</label>
      <button class="primary small" id="qstart" type="button">20 soruluk tur başlat</button>
    </div>
    <div class="stage" id="qstage"><div class="muted">Mod ve bölge seç, sonra turu başlat.</div></div>`;
  const stage = $("qstage");
  let mode = store.get("quiz.mode", "play");
  const stats = store.get("quiz.stats", {});
  const recent = store.get("quiz.recent", {});
  let round = null;
  const hold = holder();

  function levels(){
    const n = unlockedLevels(recent), sel = $("qlevel"), keep = sel.value || store.get("quiz.level", "chalumeau");
    sel.innerHTML = LEVELS.map((lv, i) => `<option value="${lv.id}"${i>=n ? " disabled" : ""}>${lv.name} (${nn(lv.lo)}–${nn(lv.hi)})${i>=n ? " — kilitli" : ""}</option>`).join("") +
      (n > 1 ? `<option value="all">Açık bölgelerin hepsi</option>` : "");
    sel.value = [...sel.options].some(o => o.value === keep && !o.disabled) ? keep : "chalumeau";
  }
  function setMode(m){
    mode = m; store.set("quiz.mode", m);
    $("qmode").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.m===m ? "true" : "false"));
    $("qaltwrap").hidden = m !== "find";
  }
  $("qmode").addEventListener("click", e => { const b = e.target.closest("button"); if(b) setMode(b.dataset.m); });
  $("qlevel").addEventListener("change", () => store.set("quiz.level", $("qlevel").value));
  $("qalt").checked = store.get("quiz.alt", false);
  $("qalt").addEventListener("change", () => store.set("quiz.alt", $("qalt").checked));
  setMode(mode); levels();

  const chosenLevels = () => {
    const v = $("qlevel").value, n = unlockedLevels(recent);
    return v === "all" ? LEVELS.slice(0, n) : [LEVELS.find(l => l.id === v)];
  };
  $("qstart").addEventListener("click", async () => {
    if((mode === "play" || mode === "staff") && !(await needMic())) return;
    round = { i:0, right:0, total:20, levels:chosenLevels(), mode, wrongs:{}, last:null };
    ask();
  });

  function levelOf(w){ return LEVELS.find(l => w >= l.lo && w <= l.hi); }
  function ask(){
    if(round.i >= round.total) return finish();
    const w = quizPick(round.levels, stats, Math.random, round.last);
    round.last = w; round.q = { w, t0: performance.now(), done:false };
    hold.reset();
    stage.innerHTML = `<div class="qcount">Soru ${round.i+1}/${round.total} · ${round.right} doğru</div>`;
    if(round.mode === "play" || round.mode === "staff"){
      const box = document.createElement("div"); box.className = "qplay";
      const st = staffSvg(); SK.drawStaffInto(st, w);
      // Oku modunda nota adı gizli: dizekten okuyup çal
      box.innerHTML = round.mode === "staff" ? `<div><div class="label">${L("Dizekteki notayı çal", "Play the note on the staff")}</div><div class="qname">?</div></div>`
        : `<div><div class="label">Bu notayı çal</div><div class="qname">${nn(w)} <em>yazılı</em></div><div class="muted">${perdeOf(w)}</div></div>`;
      box.appendChild(st);
      stage.appendChild(box);
    }else{
      const list = fingeringsFor(w);
      const pickAlt = $("qalt").checked && list.length > 1 && Math.random() < 0.5;
      const fi = pickAlt ? 1 + Math.floor(Math.random()*(list.length-1)) : 0;
      const box = document.createElement("div"); box.className = "qfind";
      const ch = miniChart(); paintMini(ch, list[fi].code);
      box.appendChild(ch);
      const right = document.createElement("div");
      right.innerHTML = `<div class="label">Bu parmak hangi nota?${fi ? " (alternatif parmak)" : ""}</div>`;
      const opts = document.createElement("div"); opts.className = "qopts";
      quizChoices(w, levelOf(w)).forEach(c => {
        const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.dataset.w = c;
        b.textContent = nn(c); b.addEventListener("click", () => answer(c));
        opts.appendChild(b);
      });
      right.appendChild(opts);
      right.insertAdjacentHTML("beforeend", `<div class="muted">Mikrofon açıksa çalarak da cevaplayabilirsin.</div>`);
      box.appendChild(right);
      stage.appendChild(box);
    }
    stage.insertAdjacentHTML("beforeend", `<div class="fb" id="qfb" aria-live="polite"></div>`);
  }
  function answer(played){
    const q = round && round.q;
    if(!q || q.done) return;
    q.done = true;
    const res = compareNote(q.w, played), ok = res === "ok", ms = performance.now() - q.t0;
    quizRecord(stats, q.w, ok, ms);
    const lv = levelOf(q.w).id;
    (recent[lv] = recent[lv] || []).push(ok);
    if(recent[lv].length > UNLOCK_WINDOW) recent[lv].shift();
    store.set("quiz.stats", stats); store.set("quiz.recent", recent);
    if(ok) round.right++; else round.wrongs[q.w] = (round.wrongs[q.w] || 0) + 1;
    stage.querySelectorAll(".opt").forEach(b => {
      if(+b.dataset.w === q.w) b.classList.add("right");
      else if(+b.dataset.w === played) b.classList.add("wrong");
    });
    const fb = $("qfb");
    fb.className = "fb " + (ok ? "good" : "bad");
    fb.textContent = ok ? "Doğru! (" + num(ms/1000) + " sn)"
      : res === "octave" ? "Oktav hatası: " + nn(played) + " çaldın, istenen " + nn(q.w) + ". Doğru parmak yukarıdaki şemada."
      : "Yanlış: " + nn(played) + ". Doğrusu " + nn(q.w) + " — parmağı yukarıdaki şemada.";
    if(!ok) SK.showNote(q.w);
    round.i++;
    setTimeout(() => { if(round && round.q === q) ask(); }, ok ? 1100 : 2600);
  }
  function finish(){
    const hard = Object.entries(round.wrongs).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([w]) => nn(+w));
    const rounds = store.get("quiz.rounds", []);
    rounds.push({ d: dayKey(new Date()), mode: round.mode, right: round.right, total: round.total });
    store.set("quiz.rounds", rounds.slice(-50));
    stage.innerHTML = `<div class="result"><div class="big">${round.right}/${round.total}</div>
      <div>doğru${hard.length ? " · zorlandıkların: <strong>" + hard.join(", ") + "</strong>" : ""}</div></div>`;
    round = null; levels();
  }
  return {
    note(r, t){
      if(!round || !round.q || round.q.done || !r.inRange) return;
      const h = hold.push(r.written, t);
      if(!h.fired && h.ms >= 500){ hold.fire(); answer(r.written); }
    },
    silence(){ hold.reset(); },
    leave(){ round = null; stage.innerHTML = `<div class="muted">Mod ve bölge seç, sonra turu başlat.</div>`; },
    enter(){ levels(); }
  };
};

// ======== Uzun ton ========
TRAINERS.long = function(ctx){
  const { SK, $, store, T, num, sgn, sleep, label, needMic, toneKv, toneTips } = ctx;
  const P = $("pp-long");
  const opts = []; for(let w = LOW_NOTE; w <= HIGH_NOTE; w++) opts.push(`<option value="${w}">${label(w)}</option>`);
  P.innerHTML = `
    <p class="pdesc">Bir notayı hedef süre boyunca sabit tut. Puan; sapmanın ne kadar dağıldığına (%40), perdeye ne kadar yakın olduğuna (%35) ve süreyi tamamlamaya (%25) göre hesaplanır.</p>
    <div class="pbar">
      <select id="ltnote" aria-label="Hedef nota"><option value="auto">İlk çaldığım nota</option>${opts.join("")}</select>
      <div class="seg" role="radiogroup" aria-label="Hedef süre" id="ltdur">
        ${[4,8,12,16].map(s => `<button type="button" role="radio" data-s="${s}">${s} sn</button>`).join("")}
      </div>
      <button class="stopbtn" id="ltlisten" type="button">Dinle</button>
      <button class="primary small" id="ltstart" type="button">Başlat</button>
    </div>
    <div class="stage" id="ltstage"><div class="muted">Notayı seç (ya da “ilk çaldığım nota”), süreyi seç ve başlat.</div></div>`;
  const stage = $("ltstage");
  let dur = store.get("long.dur", 8), run = null;
  const best = store.get("long.best", {});
  $("ltnote").value = store.get("long.note", "auto");
  $("ltnote").addEventListener("change", () => store.set("long.note", $("ltnote").value));
  function setDur(s){ dur = s; store.set("long.dur", s); $("ltdur").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", +b.dataset.s===s ? "true" : "false")); }
  $("ltdur").addEventListener("click", e => { const b = e.target.closest("button"); if(b) setDur(+b.dataset.s); });
  setDur(dur);
  $("ltlisten").addEventListener("click", async () => {
    const v = $("ltnote").value; if(v === "auto") return;
    SK.play(+v); await sleep(1500); if(SK.playing() === +v) SK.stopSound();
  });
  $("ltstart").addEventListener("click", async () => {
    if(!(await needMic())) return;
    const v = $("ltnote").value;
    run = { w: v === "auto" ? null : +v, start:null, devs:[], lastOk:0, tq:[] };
    stage.innerHTML = `<div class="ltlive">
      <div class="label" id="ltwhat">${run.w ? "Çal: " + label(run.w) : "Bir nota çal ve tut"}</div>
      <div class="ltclock" id="ltclock">0,0 <em>/ ${dur} sn</em></div>
      <div class="pbarfill"><i id="ltfill"></i></div>
      <div class="muted" id="ltdev">sapma: —</div></div>`;
  });
  function end(t){
    const durMs = run.start ? t - run.start : 0;
    const w = run.w;
    if(!run.start || run.devs.length < 5){ run = null; stage.innerHTML = `<div class="muted">Nota tutulamadı, yeniden dene.</div>`; return; }
    const s = longToneScore(run.devs, durMs, dur*1000), tq = toneQuality(run.tq);
    const prev = best[w];
    if(!prev || s.score > prev.score) best[w] = { score:s.score, d: dayKey(new Date()) };
    store.set("long.best", best);
    const hist = store.get("long.hist", []); hist.push({ d: dayKey(new Date()), w, score:s.score }); store.set("long.hist", hist.slice(-100));
    stage.innerHTML = `<div class="result"><div class="big">${s.score}</div><div>puan · ${label(w)}${prev && s.score > prev.score ? " · <strong>yeni rekor</strong>" : prev ? " · rekor " + prev.score : ""}</div></div>
      <div class="kv"><div><span class="label">Süre</span>${num(durMs/1000)} sn</div>
      <div><span class="label">Ortalama sapma</span>${sgn(s.mean)} koma</div>
      <div><span class="label">Yayılım</span>${num(s.sd, 2)} koma</div>${toneKv(tq)}</div>
      <div class="muted">${Math.abs(s.mean) > 0.5 ? (s.mean > 0 ? "Tiz çalıyorsun; dudak baskısını azalt ya da biraz daha pes düşün." : "Pes çalıyorsun; hava desteğini artır.") : "Perdeye yakın."} ${s.sd > 0.5 ? "Ses dalgalanıyor: hava akışını sabitle." : ""} ${toneTips(tq)}</div>`;
    run = null;
  }
  return {
    note(r, t){
      if(!run || !r.inRange) return;
      if(run.w === null) run.w = r.written;
      if(r.written !== run.w){ if(run.start && t - run.lastOk > 400) end(t); return; }
      if(!run.start){
        run.start = t; $("ltwhat").textContent = "Tut: " + label(run.w);
        // Hedef akort bağlamına göre (Akort ekranında makam seçiliyse o makamın perdesi)
        const p = analyze(perdeFreq(run.w, T), T).perde; run.target = p ? p.comma : (run.w-67)*53/12;
      }
      run.lastOk = t;
      const dev = r.comma - run.target;
      run.devs.push(dev);
      const el = (t - run.start)/1000;
      $("ltclock").innerHTML = num(el) + ` <em>/ ${dur} sn</em>`;
      $("ltfill").style.width = Math.min(100, el/dur*100) + "%";
      $("ltdev").textContent = "sapma: " + sgn(dev) + " koma";
      if(el >= dur) end(t);
    },
    raw(d){ if(run && run.start) run.tq.push({ rms:d.rms, clarity:d.clarity }); },
    silence(t){ if(run && run.start && t - run.lastOk > 400) end(t); },
    leave(){ run = null; }
  };
};

// ======== Dizi (makam) ========
TRAINERS.makam = function(ctx){
  const { SK, $, store, nn, num, sgn, esc, sleep, needMic, holder, tgt, mkFreq, markScale, droneOn, makamState: ms } = ctx;
  const P = $("pp-makam");
  P.innerHTML = `
    <p class="pdesc">Makamı seç; dizisi nota şeridinde işaretlenir (çerçeveli: dizi, dolu: durak, noktalı: güçlü). Alıştırmada diziyi önce çık sonra in; her perdenin koma sapması gösterilir.</p>
    <div class="mklist" id="mklist" role="radiogroup" aria-label="Makam">${MAKAMS.map(m => `<button type="button" role="radio" data-id="${m.id}">${m.name}</button>`).join("")}</div>
    <div id="mkinfo"></div>
    <div class="pbar">
      <button class="stopbtn" id="mklisten" type="button">Diziyi dinle</button>
      <button class="stopbtn" id="mkdrone" type="button">Durağı dron yap</button>
      <button class="primary small" id="mkstart" type="button">Alıştırma: çık ve in</button>
    </div>
    <div class="stage" id="mkstage"></div>
    <div class="muted small">Diziler AEU çeşni tanımlarından kuruldu; bir hocaya ya da Sol klarnetçiye kontrol ettirilmeli.</div>`;
  const stage = $("mkstage");
  let ex = null;
  const hold = holder();
  const seq = mk => [...mk.asc, ...[...mk.desc].reverse().slice(1)];
  function chips(list, idPrefix){
    return list.map((c, i) => `<span class="pchip${c===ms.cur.durak ? " durak" : ""}${c===ms.cur.guclu ? " guclu" : ""}" id="${idPrefix}${i}">
      <b>${perdeName(c)}</b><small>${nn(commaToWritten(c))} · ${c} k</small><i></i></span>`).join("");
  }
  function render(){
    const mk = ms.cur;
    $("mklist").querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.id===mk.id ? "true" : "false"));
    $("mkinfo").innerHTML = `
      <div class="kv"><div><span class="label">Durak</span>${perdeName(mk.durak)}</div>
      <div><span class="label">Güçlü</span>${perdeName(mk.guclu)}</div>
      <div><span class="label">Yeden</span>${perdeName(mk.yeden)}</div>
      <div><span class="label">Çalışıldı</span>${ms.done[mk.id] ? ms.done[mk.id].n + " kez · en iyi ort. " + num(ms.done[mk.id].best) + " k" : "henüz yok"}</div></div>
      <p class="seyir">${esc(seyirText(mk, LANG))}</p>
      <div class="label">Çıkış</div><div class="chiprow">${chips(mk.asc, "mka")}</div>
      <div class="label">İniş</div><div class="chiprow">${chips([...mk.desc].reverse(), "mkd")}</div>`;
    markScale(mk);
  }
  $("mklist").addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b) return;
    ms.cur = makamById(b.dataset.id); store.set("makam", ms.cur.id);
    ex = null; stage.innerHTML = ""; SK.setTempContext(ms.cur.id); render();
  });
  $("mklisten").addEventListener("click", async () => {
    const mk = ms.cur, token = {}; listenToken = token;
    for(const c of seq(mk)){
      if(listenToken !== token) return;
      SK.play(commaToWritten(c), mkFreq(mk, c)); await sleep(520);
    }
    if(listenToken === token) SK.stopSound();
  });
  let listenToken = null;
  $("mkdrone").addEventListener("click", () => { droneOn(ms.cur.durak); });
  $("mkstart").addEventListener("click", async () => {
    if(!(await needMic())) return;
    listenToken = null; SK.stopSound();
    const mk = ms.cur, s = seq(mk);
    ex = { mk, s, i:0, res:[], frames:[] };
    render();
    stage.innerHTML = `<div class="label">Sıradaki perde</div><div class="qname" id="mknext"></div><div class="fb" id="mkfb" aria-live="polite"></div>`;
    next();
  });
  function chipFor(i){
    const n = ex.mk.asc.length;
    return i < n ? $("mka"+i) : $("mkd"+(i - n + 1));
  }
  function next(){
    hold.reset(); ex.frames = [];
    const c = ex.s[ex.i];
    document.querySelectorAll("#mkinfo .pchip").forEach(el => el.classList.remove("cur"));
    const el = chipFor(ex.i); if(el) el.classList.add("cur");
    $("mknext").innerHTML = perdeName(c) + ` <em>yazılı ${nn(commaToWritten(c))} · ${ex.i < ex.mk.asc.length ? "çıkış" : "iniş"}</em>`;
  }
  function judge(t){
    const c = ex.s[ex.i], played = mean(ex.frames);
    const j = judgePerde(played, tgt(ex.mk, c), [...ex.mk.asc, ...ex.mk.desc]);
    ex.res.push(j);
    const el = chipFor(ex.i);
    if(el){ el.classList.remove("cur"); el.classList.add(j.ok ? "good" : "off"); el.querySelector("i").textContent = sgn(j.dev); }
    $("mkfb").className = "fb " + (j.ok ? "good" : "bad");
    $("mkfb").textContent = perdeName(c) + ": " + sgn(j.dev) + " koma" + (j.ok ? " — temiz" : j.dev > 0 ? " — tiz" : " — pes") +
      (j.other ? ". " + j.other + " perdesine daha yakın çaldın." : "");
    ex.i++;
    if(ex.i >= ex.s.length) return finish();
    next();
  }
  function finish(){
    const avg = mean(ex.res.map(r => Math.abs(r.dev))), clean = ex.res.filter(r => r.ok).length;
    const d = ms.done[ex.mk.id] || { n:0, best: 99 };
    d.n++; d.best = Math.min(d.best, avg); ms.done[ex.mk.id] = d; store.set("makam.done", ms.done);
    stage.innerHTML = `<div class="result"><div class="big">${clean}/${ex.res.length}</div><div>perde temiz (±1 koma) · ortalama sapma ${num(avg)} koma</div></div>`;
    ex = null;
    setTimeout(render, 0);
  }
  return {
    enter(){ SK.setTempContext(ms.cur.id); render(); },
    leave(){ SK.setTempContext(null); },
    note(r, t){
      if(!ex) return;
      const want = commaToWritten(ex.s[ex.i]);
      const h = hold.push(r.written, t);
      if(r.written === want){
        ex.frames.push(r.comma);
        if(!h.fired && h.ms >= 400){ hold.fire(); judge(t); }
      }else if(!h.fired && h.ms >= 700){
        hold.fire();
        $("mkfb").className = "fb bad";
        $("mkfb").textContent = nn(r.written) + " çalıyorsun; beklenen " + perdeName(ex.s[ex.i]) + " (yazılı " + nn(want) + ").";
      }
    },
    silence(){ hold.reset(); if(ex) ex.frames = []; }
  };
};

// ======== Taklit oyunu ========
TRAINERS.mimic = function(ctx){
  const { SK, $, store, nn, sleep, needMic, holder, mkFreq, selectTab, makamState: ms } = ctx;
  const P = $("pp-mimic");
  P.innerHTML = `
    <p class="pdesc">Uygulama seçili makamın dizisinden kısa bir ezgi çalar; sen klarnetle aynısını çal. Doğru çalınca ezgi bir nota uzar, yanlışta kısalır.</p>
    <div class="pbar">
      <span class="muted" id="mmmk"></span>
      <button class="linkbtn" id="mmchange" type="button">${L("değiştir", "change")}</button>
      <button class="primary small" id="mmstart" type="button">Başlat</button>
      <button class="stopbtn" id="mmagain" type="button" disabled>Tekrar dinle</button>
    </div>
    <div class="stage" id="mmstage"><div class="muted">Başlat'a bas, ezgiyi dinle, sonra çal.</div></div>`;
  const stage = $("mmstage");
  let len = 3, motif = null, idx = 0, listening = false, best = store.get("mimic.best", 0), score = 0;
  const hold = holder();
  async function playMotif(){
    listening = false;
    for(const c of motif){ SK.play(commaToWritten(c), mkFreq(ms.cur, c)); await sleep(560); }
    SK.stopSound(); await sleep(350);
    listening = true; idx = 0; hold.reset();
    $("mmfb").className = "fb"; $("mmfb").textContent = "Şimdi sen çal.";
  }
  function draw(){
    stage.innerHTML = `<div class="qcount">Uzunluk ${len} · seri ${score} · rekor ${best}</div>
      <div class="chiprow">${motif.map((c, i) => `<span class="pchip blank" id="mm${i}"><b>?</b></span>`).join("")}</div>
      <div class="fb" id="mmfb" aria-live="polite">Dinle…</div>`;
  }
  async function round(){
    motif = makeMotif([...ms.cur.asc], len);
    draw(); $("mmagain").disabled = false;
    await playMotif();
  }
  $("mmstart").addEventListener("click", async () => { if(!(await needMic())) return; len = 3; score = 0; round(); });
  $("mmchange").addEventListener("click", () => selectTab("makam"));
  $("mmagain").addEventListener("click", () => { if(motif){ draw(); playMotif(); } });
  function reveal(i, ok){
    const el = $("mm"+i); if(!el) return;
    el.classList.remove("blank"); el.classList.add(ok ? "good" : "off");
    el.querySelector("b").textContent = perdeName(motif[i]);
  }
  return {
    enter(){ SK.setTempContext(ms.cur.id); $("mmmk").textContent = "Makam: " + ms.cur.name; },
    note(r, t){
      if(!listening || !r.inRange) return;
      const h = hold.push(r.written, t);
      if(h.fired || h.ms < 150) return;
      hold.fire();
      const want = commaToWritten(motif[idx]);
      if(r.written === want){
        reveal(idx, true); idx++;
        if(idx >= motif.length){
          listening = false; score++; best = Math.max(best, score); store.set("mimic.best", best);
          $("mmfb").className = "fb good"; $("mmfb").textContent = "Doğru! Bir nota daha ekleniyor.";
          len = Math.min(10, len+1);
          setTimeout(round, 1300);
        }
      }else{
        listening = false;
        motif.forEach((_, i) => { if(i >= idx) reveal(i, i !== idx); });
        reveal(idx, false);
        $("mmfb").className = "fb bad";
        $("mmfb").textContent = nn(r.written) + " çaldın; beklenen " + perdeName(motif[idx]) + " (yazılı " + nn(want) + "). Yeni ezgi geliyor.";
        score = 0; len = Math.max(3, len-1);
        setTimeout(round, 2600);
      }
    },
    silence(){ hold.reset(); },
    leave(){ SK.setTempContext(null); listening = false; motif = null; stage.innerHTML = `<div class="muted">Başlat'a bas, ezgiyi dinle, sonra çal.</div>`; $("mmagain").disabled = true; }
  };
};

// ======== Kayıt ve nota dökümü ========
TRAINERS.rec = function(ctx){
  const { SK, $, nn, num, sgn, needMic, setPlaybackMute, selectTab } = ctx;
  const P = $("pp-rec");
  P.innerHTML = `
    <p class="pdesc">${L("Çaldığını kaydet; sonra dinle ve çalınan notaları koma sapmalarıyla gör. Kayıt cihazda tutulur ve sayfa kapanınca silinir; saklamak ya da hocana göndermek için “Kaydı kaydet / paylaş”ı kullan.", "Record your playing, then listen and see the notes with their comma deviations. The recording stays on the device and is discarded when the page closes; use “Save / share the recording” to keep it or send it to your teacher.")}</p>
    <div class="pbar">
      <button class="primary small" id="rcbtn" type="button">Kaydı başlat</button>
      <span class="ltclock small" id="rctime"></span>
    </div>
    <div class="stage" id="rcstage"><div class="muted">Kayıt yok.</div></div>`;
  const stage = $("rcstage");
  let rec = null, notes = [], url = null;
  // Not sütunundaki kısa adlar; hata türleri kalın, bilgi türleri soluk
  const KIND_LABEL = { pes:L("pes", "flat"), tiz:L("tiz", "sharp"), kayma:L("kayıyor", "drifts"), titrek:L("titrek", "unsteady"),
    alttan:L("alttan", "from below"), ustten:L("üstten", "from above"), vibrato:"vib.", disi:L("dizi dışı", "out of scale") };
  const kindsHtml = x => x.short ? "—" : x.kinds.map(k => INTON_ERRORS.includes(k) ? `<b>${KIND_LABEL[k]}</b>` : `<span class="muted">${KIND_LABEL[k]}</span>`).join(" · ");
  $("rcbtn").addEventListener("click", async () => rec ? stopRec() : startRec());
  async function startRec(){
    if(!(await needMic())) return;
    const stream = SK.getStream(); if(!stream) return;
    if(url){ URL.revokeObjectURL(url); url = null; }
    const chunks = [];
    let mr = null;
    try{ mr = new MediaRecorder(stream); }catch(e){ mr = null; }
    rec = { mr, chunks, frames:[], raw:[], glides:[], t0: performance.now(), timer: setInterval(() => {
      $("rctime").textContent = num((performance.now() - rec.t0)/1000) + " sn";
    }, 200) };
    if(mr){
      mr.ondataavailable = e => chunks.push(e.data);
      try{ mr.start(); }catch(e){ rec.mr = null; }   // kayıt başlamazsa yalnızca notalar listelenir
    }
    $("rcbtn").textContent = "Kaydı durdur";
    stage.innerHTML = `<div class="muted">Kaydediliyor… çal.</div>`;
  }
  function stopRec(){
    const r = rec; rec = null;
    clearInterval(r.timer);
    $("rcbtn").textContent = "Kaydı başlat";
    r.dur = performance.now() - r.t0;
    r.ctx = getTuningContext();   // çözüm, durdurulduğu andaki makam bağlamıyla yapılır
    if(r.mr && r.mr.state !== "inactive"){
      r.mr.onstop = () => present(r, URL.createObjectURL(new Blob(r.chunks, { type: r.mr.mimeType || "audio/webm" })));
      r.mr.stop();
    }else present(r, null);
  }
  // Kaydı o ana sarar ve çalar
  function seek(ms){
    const audio = $("rcaudio");
    if(!audio) return;
    try{ audio.currentTime = Math.max(0, ms)/1000; audio.play().catch(() => {}); }catch(e){}
  }
  // Çözüm ve gösterim. r = { frames, raw, glides, t0, dur?, ctx? } (frames ve raw mutlak t ile)
  function present(r, u){
    url = u;
    notes = segmentNotes(r.frames, 150).map(n => ({ ...n, start: n.start - r.t0, end: n.end - r.t0 }));
    const tctx = r.ctx !== undefined ? r.ctx : getTuningContext();
    const trace = cleanTrace(r.raw.map(f => ({ t:f.t - r.t0, comma:f.comma })));
    const issues = intonationIssues(notes, trace, { ctx:tctx }), summary = intonationSummary(issues);
    const dur = r.dur != null ? r.dur : Math.max(0, ...notes.map(n => n.end), ...trace.map(f => f.t));
    const glideN = r.glides.length, shortN = summary.total - summary.measured;
    const errKinds = new Set(issues.flatMap(x => x.kinds.filter(k => INTON_ERRORS.includes(k))));
    const sumLine = summary.measured === 0 ? L("Ölçülecek kadar uzun nota yok.", "No notes long enough to measure.")
      : summary.ok === summary.measured ? L("Bütün notalar yerinde.", "All notes on pitch.")
      : L(`${summary.measured} notadan ${summary.ok} tanesi yerinde`, `${summary.ok} of ${summary.measured} notes on pitch`);
    const shortLine = shortN && summary.measured ? " · " + L(`${shortN} kısa nota ölçülmedi`, `${shortN} short notes not measured`) : "";
    const tip = dir => dir === "pes" ? L("Dudak baskısını biraz artır, ağızlığı biraz daha az al.", "Firm up the embouchure a little and take a bit less mouthpiece.")
      : L("Dudağı biraz gevşet, ağızlığı biraz daha çok al.", "Relax the embouchure a little and take a bit more mouthpiece.");
    const perdesHtml = summary.perdes.length ? `<div class="inton"><div class="small muted">${L("En çok kaçan perdeler", "Pitches most often off")}</div><ul>
      ${summary.perdes.map(p => `<li><b>${p.perde}</b> (${L("yazılı", "written")} ${nn(p.written)}) · ${p.n} ${L("kez", "times")} · ${L("ortalama", "average")} ${num(Math.abs(p.mean), 1)} ${L("koma", "commas")} ${p.dir === "pes" ? L("pes", "flat") : L("tiz", "sharp")}
        <span class="muted">${tip(p.dir)}</span> <button class="stopbtn small" type="button" data-goto="tune" data-note="${p.written}">${L("Parmağa bak", "See fingering")}</button></li>`).join("")}</ul></div>` : "";
    const extra = (errKinds.has("kayma") ? `<p class="small muted">${L("Kayan notalarda nefesi notanın sonuna kadar aynı tut.", "On drifting notes keep the air steady to the end.")}</p>` : "")
      + (errKinds.has("titrek") ? `<p class="small muted">${L("Titrek notalar için uzun ton çalış.", "Practise long tones for unsteady notes.")} <button class="stopbtn small" type="button" id="rclong">${L("Uzun ton", "Long tone")}</button></p>` : "")
      + (!tctx && summary.measured ? `<p class="small muted">${L("Pes ve tiz, seçili makamın perdelerine göre ölçülür; Akort'ta bir makam seçersen ölçüm daha doğru olur.", "Flat and sharp are judged against the chosen makam; pick one in the Tuner for a better reading.")}</p>` : "");
    stage.innerHTML = (url ? `<audio controls src="${url}" id="rcaudio"></audio>` : `<div class="muted">Bu tarayıcı ses kaydını desteklemiyor; yalnızca notalar listelendi.</div>`) +
      `<div class="qcount">${notes.length} nota · ${glideN} glissando · ${num(dur/1000, 0)} sn</div>
      <div class="curvebar"><button class="stopbtn small" id="rcall" type="button">${L("Tümü", "All")}</button><span class="muted small" id="rcwin"></span></div>
      <canvas class="trace curve" id="rccurve" aria-label="${L("Perde eğrisi", "Pitch curve")}"></canvas>
      <div class="inton"><b>${sumLine}</b><span class="muted">${shortLine}</span></div>
      ${perdesHtml}${extra}
      <div class="tablewrap"><table class="rtable"><thead><tr><th>Zaman</th><th>Perde</th><th>Yazılı</th><th>Süre</th><th>Sapma</th><th>${L("Not", "Note")}</th></tr></thead><tbody>
      ${notes.map((n, i) => { const x = issues[i], p = x.short ? contextPerde(n.comma, tctx) : { name:x.perde, delta:x.delta };
        return `<tr id="rn${i}" data-i="${i}"><td>${num(n.start/1000)}</td><td>${p ? p.name : "—"}</td><td>${nn(n.written)}</td><td>${num((n.end-n.start)/1000)} sn</td><td>${p ? sgn(p.delta) + " k" : "—"}</td><td>${kindsHtml(x)}</td></tr>`; }).join("")}
      </tbody></table></div>
      <div class="pbar">${url ? `<button class="primary small" id="rcsave" type="button">${L("Kaydı kaydet / paylaş", "Save / share the recording")}</button>` : ""}
      <button class="stopbtn" id="rccopy" type="button">Notaları kopyala</button>
      <button class="stopbtn" id="rcpiece" type="button">${L("Eserlere ekle", "Add to pieces")}</button><span class="muted" id="rcmsg"></span></div>`;
    if(curve) curve.stop();
    curve = curveView($("rccurve"), { trace, issues, ctx:tctx, dur });
    stage.querySelectorAll("[data-note]").forEach(b => b.addEventListener("click", () => SK.showNote(+b.dataset.note)));   // data-goto Akort'u açar
    if($("rclong")) $("rclong").addEventListener("click", () => selectTab("long"));
    stage.querySelector(".rtable tbody").addEventListener("click", e => { const tr = e.target.closest("tr[data-i]"); if(tr){ const t = notes[+tr.dataset.i].start; curve.show(t); seek(t); } });
    // Kaydı dosya olarak kaydet ya da paylaş (ör. hocaya göndermek için)
    if(url) $("rcsave").addEventListener("click", async () => {
      const blob = await (await fetch(url)).blob(), ext = /mp4|aac|m4a/.test(blob.type) ? "m4a" : /ogg/.test(blob.type) ? "ogg" : "webm";
      const name = "sol-klarnet-kayit-" + dayKey(new Date()) + "-" + new Date().toTimeString().slice(0, 5).replace(":", "") + "." + ext;
      const P = window.Capacitor && window.Capacitor.Plugins;
      try{
        if(P && P.Filesystem && P.Share){
          const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
          const w = await P.Filesystem.writeFile({ path:name, data:b64, directory:"CACHE" });
          await P.Share.share({ title:name, url:w.uri, dialogTitle:L("Kaydı paylaş", "Share the recording") });
        }else{
          const file = new File([blob], name, { type: blob.type });
          if(navigator.canShare && navigator.canShare({ files:[file] }) && matchMedia("(pointer:coarse)").matches) await navigator.share({ files:[file], title:name });
          else { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
        }
        $("rcmsg").textContent = name;
      }catch(e){ if(!e || e.name !== "AbortError") $("rcmsg").textContent = L("Kaydedilemedi: ", "Couldn't save: ") + (e && e.message || e); }
    });
    const audio = $("rcaudio");
    if(audio){
      audio.addEventListener("play", () => { setPlaybackMute(true); });
      audio.addEventListener("pause", () => { setPlaybackMute(false); });
      audio.addEventListener("ended", () => { setPlaybackMute(false); });
      audio.addEventListener("timeupdate", () => {
        const ms = audio.currentTime*1000;
        notes.forEach((n, i) => $("rn"+i).classList.toggle("now", ms >= n.start && ms < n.end + 80));
      });
    }
    const text = notes.map(n => nn(n.written)).join(" ");
    $("rccopy").addEventListener("click", async () => {
      try{ await navigator.clipboard.writeText(text); $("rcmsg").textContent = "Kopyalandı."; }
      catch(e){ $("rcmsg").textContent = text; }
    });
    $("rcpiece").addEventListener("click", () => {
      const inRange = notes.map(n => n.written).filter(w => w >= LOW_NOTE && w <= HIGH_NOTE);
      if(!inRange.length){ $("rcmsg").textContent = "Eklenecek nota yok."; return; }
      SK.addPiece(_t("Kayıt " + new Date().toLocaleTimeString("tr", { hour:"2-digit", minute:"2-digit" })), inRange);
      $("rcmsg").textContent = L("Eserlere eklendi.", "Added to pieces.");
    });
  }
  // ---- Perde eğrisi: zaman–koma grafiği ----
  // Görünür pencere 8 sn (ya da kaydın tamamı); sürükleyerek kaydırılır, dokununca kayıt o ana sarılır.
  let curve = null;
  function curveView(canvas, an){
    const { trace, issues, ctx:tctx, dur } = an, LEFT = 92, SPAN = 8000;
    const st = { from:0, span:SPAN, full:false, playMs:null, manualUntil:0, raf:0 };
    const total = Math.max(dur, 1000);
    const clamp = f => Math.max(0, Math.min(f, Math.max(0, total - st.span)));
    // Kareler zamana göre sıralı: nota indeksi her çizimde baştan ilerleyen bir imleçle bulunur
    let ni = 0;
    const noteAt = t => { while(ni < notes.length && notes[ni].end < t) ni++; return ni < notes.length && t >= notes[ni].start ? ni : -1; };
    const scaleSet = tctx ? new Set(tctx.scale.map(mod53)) : null;
    function draw(){
      const dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
      if(!W || !H) return;
      if(canvas.width !== Math.round(W*dpr) || canvas.height !== Math.round(H*dpr)){ canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr); }
      const g = canvas.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const cs = getComputedStyle(document.documentElement), col = n => cs.getPropertyValue(n).trim();
      const BOT = 16, plotW = W - LEFT, from = st.from, to = from + st.span;
      const x = t => LEFT + (t - from)/st.span*plotW;
      // Perde aralığı: görünür notaların hedefleri ± 3 koma, en az 12 koma
      const vis = issues.filter((it, i) => !it.short && notes[i].end >= from && notes[i].start <= to);
      let lo, hi;
      if(vis.length){ lo = Math.min(...vis.map(v => v.target)) - 3; hi = Math.max(...vis.map(v => v.target)) + 3; }
      else{
        const fr = trace.slice(firstIndexAt(trace, from), firstIndexAt(trace, to)).filter(f => f.comma != null);
        const c = fr.length ? fr[fr.length - 1].comma : 0; lo = c - 6; hi = c + 6;
      }
      if(hi - lo < 12){ const m = (hi + lo)/2; lo = m - 6; hi = m + 6; }
      const y = c => 6 + (hi - c)/(hi - lo)*(H - BOT - 12);
      g.font = "500 10px " + col("--ui"); g.textBaseline = "middle";
      let lastLabelY = -1e9;
      for(const [c, name] of [...PERDES].reverse()){
        if(c < lo || c > hi) continue;
        const inS = !scaleSet || scaleSet.has(mod53(c)), yy = y(c);
        g.globalAlpha = inS ? 1 : 0.4; g.strokeStyle = col("--line"); g.lineWidth = 1;
        g.beginPath(); g.moveTo(LEFT, yy); g.lineTo(W, yy); g.stroke(); g.globalAlpha = 1;
        if(!inS || yy - lastLabelY < 13) continue;
        g.fillStyle = col("--muted"); g.fillText(name, 8, yy); lastLabelY = yy;
      }
      const colorOf = i => i < 0 || issues[i].short ? col("--muted") : issues[i].kinds.some(k => INTON_ERRORS.includes(k)) ? col("--accent") : col("--ok");
      // Nota şeritleri: hedef perde, nota süresince
      g.globalAlpha = 0.25; g.lineWidth = 6; g.lineCap = "butt";
      issues.forEach((it, i) => {
        if(it.short || notes[i].end < from || notes[i].start > to) return;
        g.strokeStyle = colorOf(i); g.beginPath(); g.moveTo(x(notes[i].start), y(it.target)); g.lineTo(x(notes[i].end), y(it.target)); g.stroke();
      });
      g.globalAlpha = 1;
      // Eğri: renk notaya göre; sessizlikte kopar
      g.lineWidth = 2; g.lineJoin = "round";
      let pen = false, cur = null; ni = 0;
      const j0 = Math.max(0, firstIndexAt(trace, from) - 1), j1 = Math.min(trace.length, firstIndexAt(trace, to) + 1);
      for(let j = j0; j < j1; j++){
        const f = trace[j];
        if(f.comma == null){ if(pen) g.stroke(); pen = false; continue; }
        const xx = x(f.t), yy = Math.max(2, Math.min(H - BOT, y(f.comma))), c = colorOf(noteAt(f.t));
        if(pen && c !== cur){ g.lineTo(xx, yy); g.stroke(); pen = false; }
        if(!pen){ g.strokeStyle = cur = c; g.beginPath(); g.moveTo(xx, yy); pen = true; }
        else g.lineTo(xx, yy);
      }
      if(pen) g.stroke();
      // Etiketler: hatalı notada ilk hata (pes/tiz için miktarıyla), bilgi işaretleri soluk
      g.textBaseline = "alphabetic"; g.font = "600 10px " + col("--ui");
      let lastRight = -1e9;
      issues.forEach((it, i) => {
        if(it.short || !it.kinds.length || notes[i].end < from || notes[i].start > to) return;
        const err = it.kinds.find(k => INTON_ERRORS.includes(k)), k = err || it.kinds[0];
        const txt = KIND_LABEL[k] + (k === "pes" || k === "tiz" ? " " + num(Math.abs(it.delta), 1) : "");
        const xx = Math.max(LEFT, x(notes[i].start)), w = g.measureText(txt).width;
        if(xx < lastRight + 4) return;
        g.fillStyle = err ? col("--accent") : col("--muted");
        g.fillText(txt, xx, Math.max(10, y(it.target) - 7)); lastRight = xx + w;
      });
      // Zaman ekseni
      // Etiketler arasında en az 36 px kalsın
      const step = [1, 2, 5, 10, 15, 30, 60, 120, 300].map(s => s*1000).find(s => s/st.span*plotW >= 36) || 600000;
      g.fillStyle = col("--muted"); g.strokeStyle = col("--line"); g.font = "500 10px " + col("--mono"); g.textBaseline = "bottom";
      for(let s = Math.ceil(from/step)*step; s <= to; s += step){
        const xx = x(s); g.beginPath(); g.moveTo(xx, H - BOT); g.lineTo(xx, H - BOT + 4); g.stroke();
        g.fillText(num(s/1000, 0), xx + 2, H);
      }
      // Çalma çizgisi
      if(st.playMs != null && st.playMs >= from && st.playMs <= to){
        g.strokeStyle = col("--ink"); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x(st.playMs), 0); g.lineTo(x(st.playMs), H - BOT); g.stroke();
      }
      const wl = $("rcwin"); if(wl) wl.textContent = `${num(from/1000)}–${num(Math.min(to, total)/1000)} sn`;
    }
    // Sürükleme kaydırır; sürüklemeden bırakılan dokunuş kaydı o ana sarar
    let drag = null;
    canvas.addEventListener("pointerdown", e => { drag = { x0:e.clientX, from0:st.from, moved:false }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", e => {
      if(!drag) return;
      const dx = e.clientX - drag.x0;
      if(!drag.moved && Math.abs(dx) <= 8) return;
      drag.moved = true;
      st.from = clamp(drag.from0 - dx*st.span/(canvas.clientWidth - LEFT));
      st.manualUntil = performance.now() + 3000; draw();
    });
    canvas.addEventListener("pointerup", e => {
      const d = drag; drag = null;
      if(!d || d.moved) return;
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left;
      if(px < LEFT) return;
      const t = st.from + (px - LEFT)/(canvas.clientWidth - LEFT)*st.span;
      st.playMs = t; draw(); seek(t);
    });
    canvas.addEventListener("pointercancel", () => { drag = null; });
    const allBtn = $("rcall");
    allBtn.addEventListener("click", () => {
      st.full = !st.full;
      st.span = st.full ? total : SPAN;
      st.from = st.full ? 0 : clamp((st.playMs || 0) - 2000);
      allBtn.textContent = st.full ? L("8 sn", "8 s") : L("Tümü", "All");
      draw();
    });
    const audio = $("rcaudio");
    const tick = () => {
      st.playMs = audio.currentTime*1000;
      if(!st.full && performance.now() > st.manualUntil && (st.playMs < st.from || st.playMs > st.from + st.span*0.85)) st.from = clamp(st.playMs - st.span*0.2);
      draw();
      st.raf = audio.paused || audio.ended ? 0 : requestAnimationFrame(tick);
    };
    if(audio){
      audio.addEventListener("play", () => { if(!st.raf) st.raf = requestAnimationFrame(tick); });
      audio.addEventListener("seeked", () => { if(!st.raf) tick(); });
    }
    draw();
    return {
      draw,
      show(ms){ if(!st.full) st.from = clamp(ms - 1000); st.playMs = ms; st.manualUntil = performance.now() + 3000; draw(); },
      stop(){ if(st.raf) cancelAnimationFrame(st.raf); st.raf = 0; }
    };
  }
  window.addEventListener("resize", () => { if(curve) curve.draw(); });
  // Tarayıcı panelinde mikrofon olmadan denemek için
  window.SKDEBUG = Object.assign(window.SKDEBUG || {}, { recPresent: present });
  let prevW = null, gap = [];
  SK.on("raw", d => { if(rec){ gap.push({ t:d.t, comma:d.comma }); rec.raw.push({ t:d.t, comma:d.comma }); } });
  SK.on("note", d => {
    if(!rec) return;
    rec.frames.push({ t:d.t, written:d.r.written, comma:d.r.comma });
    if(prevW !== null && prevW.written !== d.r.written && isGlide([prevW, ...gap])) rec.glides.push(d.t);
    prevW = { t:d.t, comma:d.r.comma, written:d.r.written }; gap = [];
  });
  SK.on("silence", d => { if(rec){ rec.frames.push({ t:d.t, written:null }); rec.raw.push({ t:d.t, comma:null }); prevW = null; gap = []; } });
  // Başka sekmeye geçilince kayıt arka planda sürmesin; döküm hazır olur
  return { leave(){ if(rec) stopRec(); if(curve) curve.stop(); } };
};

// ======== İlerleme ========
TRAINERS.progress = function(ctx){
  const { $, store, num, sgn, label, days, intStats, paintHeat, goalText, markResetting, makamState: ms } = ctx;
  // Hız: en çok çalışılan üç kalıbın en iyi temposu ve son 14 gündeki artışı
  function techLine(){
    const all = store.get("tech.best", {}), since = (() => { const x = new Date(); x.setDate(x.getDate() - 14); return dayKey(x); })();
    const rows = Object.entries(all).filter(([, l]) => l.length).sort((a, b) => b[1].length - a[1].length).slice(0, 3).map(([k, l]) => {
      const pat = techPattern(patternFromKey(k)), best = Math.max(...l.map(x => x.tempo)), old = l.filter(x => x.day < since), was = old.length ? old[old.length-1].tempo : l[0].tempo;
      return (pat ? pick(pat.label, LANG) : k) + " <strong>♩=" + best + "</strong>" + (best > was ? " (+" + (best - was) + ")" : "");
    });
    return rows.join(" · ") || "—";
  }
  // Süsleme: en iyi tril hızı (düzenli olanlardan) ve son 20 çarpma denemesinde başarı
  function ornLine(){
    const best = store.get("orn.trilBest", 0), c = store.get("orn.hist", []).filter(h => h.kind === "carpma").slice(-20);
    const parts = [];
    if(best) parts.push(L("en iyi tril ", "best trill ") + "<strong>" + num(best) + L(" dönüş/sn</strong>", " turns/s</strong>"));
    const pct = c.length ? Math.round(c.filter(h => h.ok).length/c.length*100) : 0;
    if(c.length) parts.push(L("son " + c.length + " çarpmada başarı %" + pct, "grace notes, last " + c.length + ": " + pct + "%"));
    return parts.join(" · ") || "—";
  }
  // İlerleme sayfası: ritim, kulak, seyir ve eser sonuçları
  function moreStats(){
    const rh = store.get("rhythm.hist", []), ear = store.get("ear.best", {}), sy = store.get("seyir.hist", []), pb = store.get("piece.best", {});
    const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0)/a.length) : null;
    const last10 = rh.slice(-10).map(x => x.score), sy10 = sy.slice(-10).map(x => x.score);
    const syBy = {}; sy.forEach(x => { syBy[x.mk] = Math.max(syBy[x.mk] || 0, x.score); });
    const goal = store.get("goal.min", 15);
    const week = (() => { let n = 0; for(let k=0;k<7;k++){ const d = new Date(); d.setDate(d.getDate()-k); if((days[dayKey(d)] || 0) >= goal*60) n++; } return n; })();
    return `<div class="label">${L("Günlük hedef", "Daily goal")}</div>
      <p>${goal} ${L("dk · son 7 günün ", "min · reached on ")}${week}${L("'sinde tuttu", " of the last 7 days")} <button class="stopbtn" type="button" id="pggoal">${L("Değiştir", "Change")}</button></p>
      <div class="label">${L("Ritim", "Rhythm")}</div><p>${rh.length ? L("son 10 tur ortalaması ", "last 10 rounds average ") + "<strong>" + avg(last10) + "</strong> · " + L("en iyi ", "best ") + store.get("rhythm.best", 0) + " · " + rh.length + L(" tur", " rounds") : "—"}</p>
      <div class="label">${L("Kulak", "Ear")}</div><p>${ear.pitch != null ? L("ayırt edebildiğin en küçük fark ", "smallest difference you can hear ") + "<strong>" + num(ear.pitch) + L(" koma</strong>", " commas</strong>") : "—"}${ear.makam ? " · " + L("makam tanıma rekoru ", "makam ID record ") + ear.makam : ""}</p>
      <div class="label">${L("Seyir (taksim)", "Seyir (taksim)")}</div><p>${sy.length ? L("son 10 ortalama ", "last 10 average ") + "<strong>" + avg(sy10) + "</strong> · " + Object.entries(syBy).map(([id, v]) => makamById(id).name + " " + v).join(" · ") : "—"}</p>
      <div class="label">${L("Hız", "Speed")}</div><p>${techLine()}</p>
      <div class="label">${L("Süsleme", "Ornaments")}</div><p>${ornLine()}</p>
      <div class="label">${L("Eserler (tempolu, en iyi)", "Pieces (in tempo, best)")}</div><p>${Object.entries(pb).map(([id, v]) => { const e = etudeById(id); return (e ? pick(e.name, LANG) : id) + " %" + v; }).join(" · ") || "—"}</p>`;
  }
  const P = $("pp-progress");
  function render(){
    store.set("days", days);
    const today = dayKey(new Date());
    const last = [];
    for(let i=13;i>=0;i--){ const d = new Date(); d.setDate(d.getDate()-i); last.push([dayKey(d), days[dayKey(d)] || 0, d]); }
    const maxS = Math.max(600, ...last.map(x => x[1]));
    const total = Object.values(days).reduce((a,b) => a+b, 0);
    const qs = store.get("quiz.stats", {}), rec = store.get("quiz.recent", {}), unl = unlockedLevels(rec);
    const lvRows = LEVELS.map((lv, i) => {
      let n = 0, wr = 0; for(let w = lv.lo; w <= lv.hi; w++) if(qs[w]){ n += qs[w].n; wr += qs[w].wrong; }
      const r = rec[lv.id] || [];
      return `<tr><td>${lv.name}</td><td>${i < unl ? "açık" : "kilitli"}</td><td>${n}</td><td>${n ? Math.round((n-wr)/n*100) + "%" : "—"}</td><td>${r.length ? r.filter(Boolean).length + "/" + r.length : "—"}</td></tr>`;
    }).join("");
    const lb = store.get("long.best", {});
    const longTop = Object.entries(lb).sort((a,b) => b[1].score - a[1].score).slice(0, 6).map(([w, b]) => `${label(+w)}: <strong>${b.score}</strong>`);
    const ints = Object.entries(intStats).filter(([, s]) => s.n >= 3).map(([w, s]) => [+w, s.sum/s.n, s.n]);
    const sharp = ints.filter(x => x[1] > 0.5).sort((a,b) => b[1]-a[1]).slice(0, 5);
    const flat = ints.filter(x => x[1] < -0.5).sort((a,b) => a[1]-b[1]).slice(0, 5);
    const fmtI = l => l.length ? l.map(([w, m, n]) => `${label(w)} <strong>${sgn(m)}</strong> <em>(${n})</em>`).join(" · ") : "—";
    const mk = MAKAMS.filter(m => ms.done[m.id]).map(m => `${m.name}: ${ms.done[m.id].n} kez, en iyi ort. ${num(ms.done[m.id].best)} k`);
    P.innerHTML = `
      <div class="kv">
        <div><span class="label">Seri</span><span class="big2">${streak(days)}</span> gün</div>
        <div><span class="label">Bugün</span><span class="big2">${Math.round((days[today]||0)/60)}</span> dk</div>
        <div><span class="label">Toplam</span><span class="big2">${num(total/3600)}</span> saat</div>
        <div><span class="label">Taklit rekoru</span><span class="big2">${store.get("mimic.best", 0)}</span></div>
        <div><span class="label">Biten ezgi</span><span class="big2">${store.get("piece.done", 0)}</span></div>
        <div><span class="label">Biten ders</span><span class="big2">${LESSONS.filter(l => lessonDone(l, store.get("lesson.prog", {}))).length}</span>/ ${LESSONS.length}</div>
        <div><span class="label">Günlük çalışma</span><span class="big2">${store.get("lesson.dailyDone", []).length}</span> gün</div>
      </div>
      <div class="label">Son 14 gün (sesli çalma süresi, dakika)</div>
      <div class="bars" role="img" aria-label="Son 14 günün çalışma süreleri">${last.map(([k, s, d]) =>
        `<div class="barcol" title="${k}: ${Math.round(s/60)} dk"><i style="height:${Math.round(s/maxS*100)}%"></i><small>${d.getDate()}</small></div>`).join("")}</div>
      <div class="muted small">Seri için günde en az 1 dakika ses algılanmalı.</div>
      <div class="label">Parmak testi</div>
      <div class="tablewrap"><table class="rtable"><thead><tr><th>Bölge</th><th>Durum</th><th>Soru</th><th>Doğru</th><th>Son 20</th></tr></thead><tbody>${lvRows}</tbody></table></div>
      <div class="label">Uzun ton rekorları</div><p>${longTop.join(" · ") || "—"}</p>
      <div class="label">Entonasyon (en az 0,3 sn tutulan notalar)</div>
      <p>Tiz çaldıkların: ${fmtI(sharp)}</p><p>Pes çaldıkların: ${fmtI(flat)}</p>
      <div class="label">Makam alıştırmaları</div><p>${mk.join(" · ") || "—"}</p>
      ${moreStats()}
      <div class="pbar"><button class="stopbtn" id="rsint" type="button">Entonasyon istatistiğini sıfırla</button>
      <button class="stopbtn" id="rsall" type="button">Tüm ilerlemeyi sıfırla</button></div>
      <div class="muted small">Tüm veriler yalnızca bu cihazda, tarayıcıda saklanır.</div>`;
    $("rsint").addEventListener("click", () => {
      if(!confirm(_t("Entonasyon istatistiği silinsin mi?"))) return;
      for(const k in intStats) delete intStats[k];
      store.set("int.stats", intStats); paintHeat(); render();
    });
    $("rsall").addEventListener("click", () => {
      if(!confirm(_t("Seri, ders, test, uzun ton, makam, taklit ve entonasyon verilerinin hepsi silinsin mi? Kendi ezgilerin kalır."))) return;
      ["lesson.prog","lesson.daily","lesson.dailyDone","lesson.cur","quiz.stats","quiz.recent","quiz.rounds","long.best","long.hist","makam.done","mimic.best","piece.done","days","int.stats"]
        .forEach(k => { try{ localStorage.removeItem("sk." + k); }catch(e){} });
      markResetting();
      location.reload();
    });
  }
  P.addEventListener("click", e => {
    if(!e.target.closest("#pggoal")) return;
    const v = prompt(L("Günlük hedef (dakika):", "Daily goal (minutes):"), store.get("goal.min", 15));
    const n = Math.round(+v); if(n >= 1 && n <= 240){ store.set("goal.min", n); render(); goalText(); }
  });
  return { enter: render };
};

// ---- Dizek haritası: Mi3–Do7 arası doğal notaların sol anahtarlı dizekteki yeri ----
// Üç satır (Mi3–Si4, Do5–Do6, Re6–Do7) ki telefonda yatay kaydırmadan sığsın; tiz notalar 8va'sız, ek çizgileriyle.
// Notaya dokununca ses ve parmak; mikrofon açıkken çalınan nota haritada işaretlenir.
TRAINERS.staffmap = function(ctx){
  const { SK, $, nn, miniChart, paintMini } = ctx;
  const SVGNS = "http://www.w3.org/2000/svg";
  const NAT = [0,2,4,5,7,9,11];
  const notes = []; for(let w = LOW_NOTE; w <= 96; w++) if(NAT.includes(w % 12)) notes.push(w);
  const ROWS = [[L("Pes bölge", "Low register"), notes.filter(w => w < 72)], [L("Orta bölge", "Middle register"), notes.filter(w => w >= 72 && w <= 84)],
                [L("Tiz bölge", "High register"), notes.filter(w => w > 84)]];
  const stepOf = w => { const p = staffPos(w); return p.ottava ? p.step + 7 : p.step; };
  // Akılda tutulacak işaret noktaları
  const MARK = { 60: L("orta Do", "middle C"), 67: L("anahtarın çizgisi", "clef line"), 71: L("orta çizgi", "middle line"), 84: L("2 ek çizgi", "2 ledgers") };
  const P = $("pp-staffmap");
  P.innerHTML = `
    <p class="pdesc">${L("Yazılı notaların dizekteki yeri. Sayı oktavı gösterir ve her Do'da bir artar (Si4'ten sonra Do5 gelir). Bir notaya dokun: sesini duy, parmağını gör. Mikrofon açıkken çaldığın nota haritada yanar.",
      "Where written notes sit on the staff. The number is the octave and goes up at every C (B4 is followed by C5). Tap a note to hear it and see its fingering. With the microphone on, the note you play lights up.")}</p>
    <div class="smhint"><span><b>${L("Çizgiler", "Lines")}</b> Mi · Sol · Si · Re · Fa</span><span><b>${L("Aralıklar", "Spaces")}</b> Fa · La · Do · Mi</span>
      <span>${L("Bir oktav yukarısı çizgiden aralığa (ya da tersine) geçer.", "An octave up always flips line ↔ space.")}</span></div>
    ${ROWS.map(([name], i) => `<div class="label">${name}</div><div class="smrow" id="smrow${i}"></div>`).join("")}
    <div class="smpick" id="smpick" hidden><div class="smname" id="smname"></div><div id="smchart"></div></div>`;
  const svgEl = (tag, attrs, text) => { const e = document.createElementNS(SVGNS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(text) e.textContent = text; return e; };
  const HS = 4, DX = 26, X0 = 40;
  const heads = new Map();
  ROWS.forEach(([, ws], ri) => {
    const steps = ws.map(stepOf);
    const top = Math.max(10, ...steps) + 2, bot = Math.min(0, ...steps) - 3;
    const sy = s => (top - s)*HS + 4, H = sy(bot) + 26, W = X0 + ws.length*DX;
    const svg = svgEl("svg", { viewBox:`0 0 ${W} ${H}`, class:"smap", role:"group", "aria-label":ROWS[ri][0] });
    svg.style.width = (W / (X0 + ROWS[0][1].length*DX) * 100) + "%";        // her satırda nota boyu aynı
    for(let s = 0; s <= 8; s += 2) svg.appendChild(svgEl("line", { class:"sl", x1:2, x2:W-2, y1:sy(s), y2:sy(s) }));
    svg.appendChild(svgEl("text", { class:"clef", x:4, y:sy(-1.5) }, "𝄞"));
    ws.forEach((w, i) => {
      const x = X0 + i*DX + DX/2, st = stepOf(w), name = noteName(w)[LANG === "en" ? "en" : "tr"];
      const g = svgEl("g", { class:"smn" + (MARK[w] ? " mark" : ""), tabindex:0, role:"button", "aria-label":name + (MARK[w] ? ", " + MARK[w] : "") });
      g.appendChild(svgEl("rect", { class:"hit", x:x-DX/2, y:0, width:DX, height:H }));
      for(let s = -2; s >= st; s -= 2) g.appendChild(svgEl("line", { class:"ledger", x1:x-9, x2:x+9, y1:sy(s), y2:sy(s) }));
      for(let s = 10; s <= st; s += 2) g.appendChild(svgEl("line", { class:"ledger", x1:x-9, x2:x+9, y1:sy(s), y2:sy(s) }));
      g.appendChild(svgEl("ellipse", { class:"head", cx:x, cy:sy(st), rx:5.4, ry:3.9, transform:`rotate(-20 ${x} ${sy(st)})` }));
      const t = svgEl("text", { class:"nl", x, y:sy(bot) + 12 });
      t.appendChild(svgEl("tspan", { x }, name.replace(/\d+$/, "")));
      t.appendChild(svgEl("tspan", { x, dy:10, class:"oct" }, name.match(/\d+$/)[0]));
      g.appendChild(t);
      g.addEventListener("click", () => pick(w));
      g.addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); pick(w); } });
      heads.set(w, g); svg.appendChild(g);
    });
    $("smrow" + ri).appendChild(svg);
  });
  const chart = miniChart(); $("smchart").appendChild(chart);
  function mark(w, cls){ heads.forEach((g, k) => g.classList.toggle(cls, k === w)); }
  function pick(w){
    mark(w, "sel");
    $("smpick").hidden = false;
    $("smname").innerHTML = `<b>${nn(w)}</b>${MARK[w] ? ` <em>${MARK[w]}</em>` : ""}`;
    paintMini(chart, FINGERINGS[w]);
    SK.play(w);
    setTimeout(() => { if(SK.playing() === w) SK.stopSound(); }, 1200);
  }
  return {
    note(r){ mark(r.inRange ? r.written : null, "live"); },
    silence(){ mark(null, "live"); },
    leave(){ mark(null, "live"); }
  };
};
