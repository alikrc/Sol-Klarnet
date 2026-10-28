// Uygulama geneli arama: üst çubuktaki büyüteç (ya da Ctrl/⌘+K) bir arama penceresi açar. Sayfalar, alıştırmalar,
// dersler, makamlar, notalar ve perdeler (parmak pozisyonu), ayarlar, videolar ve nota arşivindeki eserler tek kutudan
// aranır; sonuca dokununca ilgili yer açılır. Türkçe harfler ve şapkalar aramada fark etmez (ş = s, â = a, ı = i).
// Modüller açma işlevlerini window.SK üzerinden verir (practice.js, lessonview.js, drills.js, archive.js).
(function(){
  const SK = window.SK;
  if(!SK) return;
  const $ = id => document.getElementById(id);
  const store = SK.store;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const fold = s => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
  const tx = x => pick(x, LANG);
  const nn = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
  const PIECE_MAX = 8, GROUP_MAX = 6;

  const root = $("gsearch"), input = $("gsq"), list = $("gsres"), openBtn = $("gsbtn");
  // Sabit metinler burada (sözlükte "Kapat" başka anlamda çevrilir)
  openBtn.setAttribute("aria-label", L("Ara", "Search")); openBtn.title = L("Ara (Ctrl+K)", "Search (Ctrl+K)");
  root.setAttribute("aria-label", L("Uygulamada ara", "Search the app")); input.setAttribute("aria-label", L("Uygulamada ara", "Search the app"));
  input.placeholder = L("Alıştırma, ders, makam, nota, eser, ayar ara…", "Search exercises, lessons, makams, notes, pieces, settings…");
  list.setAttribute("aria-label", L("Arama sonuçları", "Search results"));
  $("gsclose").textContent = L("Kapat", "Close");

  // ---- Dizin ----
  // Her kayıt: { key, kind, title, sub, hay, go() } ya da bağlantı için href. Ayar etiketleri sayfadan okunur
  // (İngilizcede çevrilmiş haliyle), bu yüzden dizin her açılışta yeniden kurulur; arşiv bir kez yüklenir.
  const KINDS = [["page", L("Sayfalar", "Pages")], ["tab", L("Alıştırmalar", "Exercises")], ["lesson", L("Dersler", "Lessons")],
    ["makam", "Makam"], ["note", L("Notalar ve perdeler", "Notes and perdes")], ["setting", L("Ayarlar", "Settings")],
    ["video", L("Videolar", "Videos")], ["piece", L("Nota arşivi", "Score archive")]];
  let items = [], pieces = null, piecesLoading = null;

  const view = v => () => SK.go(v);
  function buildIndex(){
    const out = [];
    const add = (kind, id, title, sub, extra, go, href) => out.push({ key: kind + ":" + id, kind, title, sub, hay: fold([title, sub, extra].join(" ")), go, href });

    add("page", "tune", L("Akort", "Tuner"), L("Perde, koma sapması, entonasyon izi", "Perde, comma deviation, intonation trace"), "akort tuner mikrofon", view("tune"));
    add("page", "finger", L("Parmak", "Fingering"), L("Albert sistem parmak şeması", "Albert system fingering chart"), "parmak pozisyon şema fingering", view("finger"));
    add("page", "practice", L("Çalışma", "Practice"), L("Bütün alıştırmalar", "All exercises"), "calisma practice alistirma", view("practice"));
    add("page", "notes", L("Notalar", "Scores"), L("Nota arşivi · 2200 eser", "Score archive · 2200 pieces"), "nota arsiv eser", () => SK.openTab("archive"));
    add("page", "settings", L("Ayarlar", "Settings"), L("Akort, çalışma, verilerim, görünüm", "Tuning, practice, my data, appearance"), "ayarlar settings", view("settings"));
    add("page", "review", L("Uzman kontrolü", "Expert review"), L("Parmak ve makam verisini işaretle", "Mark the fingering and makam data"), "uzman hoca rapor", view("review"));

    if(SK.practiceTabs) SK.practiceTabs().forEach(t => add("tab", t.id, t.name, t.blurb, t.group, () => SK.openTab(t.id)));

    if(typeof LESSONS !== "undefined" && SK.openLesson) LESSONS.forEach(l => {
      const u = UNITS.find(x => x.id === l.unit), mk = l.makam && makamById(l.makam);
      const sub = [u ? tx(u.name) : "", SK.lessonOpen(l.id) ? "" : L("kilitli", "locked")].filter(Boolean).join(" · ");
      add("lesson", l.id, tx(l.title), sub, (mk ? mk.name : "") + " ders lesson", () => SK.openLesson(l.id));
    });

    if(SK.openMakam) MAKAMS.forEach(m => add("makam", m.id, m.name, L("Dizi, durak ve güçlü", "Scale, tonic and dominant") + " · " + perdeName(m.durak),
      "makam dizi " + m.id, () => SK.openMakam(m.id)));

    // Notalar: yazılı Mi3–Mi♭7; perde adları da o notanın kaydına yazılır (Hicaz → Sol♯4 gibi)
    const perdesOf = {};
    PERDES.forEach(([c, name]) => { const w = Math.round(67 + c*12/53); (perdesOf[w] = perdesOf[w] || []).push(name); });
    for(let w = LOW_NOTE; w <= HIGH_NOTE; w++){
      const n = noteName(w), ps = perdesOf[w] || [];
      const plain = (n.tr + " " + n.en).replace(/♯/g, "#").replace(/♭/g, "b") + (/♯/.test(n.tr) ? " diyez" : /♭/.test(n.tr) ? " bemol" : "");
      add("note", w, nn(w) + " " + L("parmak pozisyonu", "fingering"), ps.join(" · "), plain + " nota note",
        () => { SK.go("finger"); SK.showNote(w); });
    }

    // Ayarlar: her satırın etiketi ve açıklaması; açınca satıra kaydırılır ve kısa süre vurgulanır
    document.querySelectorAll("#settingsview .srow").forEach((row, i) => {
      const lab = row.querySelector(".label"), hint = row.querySelector(".hint");
      const group = row.closest(".sgroup") && row.closest(".sgroup").querySelector(":scope > .label");
      if(!lab) return;
      add("setting", i, lab.textContent.trim(), group ? group.textContent.trim() : "", hint ? hint.textContent : "", () => {
        SK.go("settings");
        row.scrollIntoView({ block:"center" });
        row.classList.remove("gsflash"); void row.offsetWidth; row.classList.add("gsflash");
        const f = row.querySelector("input, select, button"); if(f) f.focus({ preventScroll:true });
      });
    });

    if(typeof VIDEOS !== "undefined") VIDEOS.forEach(v => {
      const cat = VIDEO_CATS.find(c => c.id === v.cat);
      add("video", v.id, v.title, [VIDEO_BY[v.by], v.dur, "YouTube"].filter(Boolean).join(" · "), (cat ? tx(cat.name) : "") + " video", null, videoUrl(v.id));
    });
    return out;
  }
  function loadPieces(){
    if(pieces || piecesLoading || !SK.archiveIndex) return;
    piecesLoading = SK.archiveIndex().then(l => { pieces = l; piecesLoading = null; if(!root.hidden) render(); }).catch(() => { piecesLoading = null; });
  }

  // ---- Eşleştirme ----
  // Bütün kelimeler geçmeli; başlığın başında geçen öne çıkar, sonra başlıkta, sonra açıklamada geçen
  function score(it, words, q){
    if(!words.every(w => it.hay.includes(w))) return -1;
    const t = fold(it.title);
    // Açıklamadaki ad tam eşleşirse (perde adı: Hicaz → Do♯5) başlıktaki gibi öne çıkar
    const exactSub = it.sub && it.sub.split(" · ").some(s => fold(s) === q);
    return t === q ? 4 : t.startsWith(q) || exactSub ? 3 : words.every(w => t.includes(w)) ? 2 : 1;
  }
  let flat = [], sel = -1;
  function results(){
    const q = fold(input.value).trim(), words = q.split(/\s+/).filter(Boolean);
    if(!words.length){
      // Boş arama: son seçilenler, yoksa sayfalar
      const rec = store.get("search.recent", []).map(k => items.find(it => it.key === k)).filter(Boolean);
      return rec.length ? [[L("Son aramalar", "Recent"), rec, 0]] : [[KINDS[0][1], items.filter(it => it.kind === "page"), 0]];
    }
    const groups = [];
    for(const [kind, name] of KINDS){
      let r;
      if(kind === "piece"){
        if(!pieces){ if(piecesLoading) groups.push([name, [], 0, true]); continue; }
        r = pieces.filter(e => words.every(w => e.hay.includes(w)))
          .map(e => ({ key: "piece:" + e.id, kind, title: e.t, sub: [e.b, e.mkn, e.fn, e.un].filter(Boolean).join(" · "), id: e.id,
            s: fold(e.t).startsWith(q) ? 2 : words.every(w => fold(e.t).includes(w)) ? 1 : 0 }))
          .sort((a, b) => b.s - a.s || a.title.localeCompare(b.title, "tr"));
        if(r.length) groups.push([name, r.slice(0, PIECE_MAX), r.length]);
        continue;
      }
      r = items.filter(it => it.kind === kind).map(it => [it, score(it, words, q)]).filter(x => x[1] >= 0)
        .sort((a, b) => b[1] - a[1]).map(x => x[0]);
      if(r.length) groups.push([name, r.slice(0, GROUP_MAX), r.length]);
    }
    return groups;
  }
  function render(){
    const groups = results(), q = input.value.trim();
    flat = [];
    let html = "";
    for(const [name, rs, total, wait] of groups){
      html += `<div class="gsgroup" role="presentation"><div class="label">${esc(name)}</div>`;
      if(wait) html += `<div class="muted small gswait">${L("Arşiv yükleniyor…", "Loading the archive…")}</div>`;
      for(const it of rs){
        const i = flat.push(it) - 1, tag = it.href ? "a" : "button";
        html += `<${tag} class="gsitem" id="gsi${i}" role="option" aria-selected="false" data-i="${i}" tabindex="-1"${it.href ? ` href="${esc(it.href)}" target="_blank" rel="noopener"` : ` type="button"`}>
          <b>${esc(it.title)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ""}</${tag}>`;
      }
      if(rs[0] && rs[0].kind === "piece" && total > rs.length)
        html += `<button type="button" class="linkbtn gsall" data-all="1">${L("Arşivde " + total + " sonucun hepsini gör", "See all " + total + " results in the archive")}</button>`;
      html += `</div>`;
    }
    if(!flat.length && !groups.some(g => g[3])) html = `<p class="muted gsnone">${q ? L("“" + esc(q) + "” için sonuç yok.", "No results for “" + esc(q) + "”.") : ""}</p>`;
    list.innerHTML = html;
    input.setAttribute("aria-expanded", flat.length ? "true" : "false");
    setSel(flat.length ? 0 : -1);
  }
  function setSel(i){
    if(sel >= 0 && $("gsi" + sel)) $("gsi" + sel).setAttribute("aria-selected", "false");
    sel = i;
    const el = sel >= 0 && $("gsi" + sel);
    if(el){ el.setAttribute("aria-selected", "true"); el.scrollIntoView({ block:"nearest" }); input.setAttribute("aria-activedescendant", el.id); }
    else input.removeAttribute("aria-activedescendant");
  }

  // ---- Açma, kapama, seçme ----
  // Açıkken geçmişe bir kayıt eklenir: telefonun geri tuşu pencereyi kapatır. Sonuç seçilince önce bu kayıt
  // geri alınır, iş ondan sonra yapılır (görünüm geçişi kendi kaydını doğru yere eklesin diye).
  let pending = null, pushed = false;
  function open(){
    if(!root.hidden) return;
    items = buildIndex();
    root.hidden = false; document.body.classList.add("modal");
    history.pushState({ ...(history.state || {}), gs:1 }, ""); pushed = true;
    input.value = ""; render(); input.focus();
    loadPieces();
  }
  function hide(){
    root.hidden = true; document.body.classList.remove("modal");
    const fn = pending; pending = null;
    if(fn) fn(); else openBtn.focus();
  }
  function close(then){
    pending = then || null;
    if(pushed && history.state && history.state.gs){ pushed = false; history.back(); }
    else hide();
  }
  window.addEventListener("popstate", () => { pushed = false; if(!root.hidden) hide(); });
  function remember(key){
    store.set("search.recent", [key, ...store.get("search.recent", []).filter(k => k !== key)].slice(0, 6));
  }
  function choose(it){
    if(!it) return;
    if(it.kind !== "piece") remember(it.key);
    if(it.href){ close(); return; }          // bağlantı kendisi açılır (YouTube)
    close(it.kind === "piece" ? () => { SK.go("practice"); SK.openArchive(it.id); } : it.go);
  }

  openBtn.addEventListener("click", open);
  window.addEventListener("keydown", e => {
    if((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k"){ e.preventDefault(); root.hidden ? open() : close(); }
  });
  root.addEventListener("click", e => { if(e.target === root || e.target.closest("#gsclose")) close(); });
  let qTimer = null;
  input.addEventListener("input", () => { clearTimeout(qTimer); qTimer = setTimeout(render, 80); });
  input.addEventListener("keydown", e => {
    if(e.key === "ArrowDown" || e.key === "ArrowUp"){
      e.preventDefault();
      if(flat.length) setSel((sel + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % flat.length);
    }else if(e.key === "Enter"){
      e.preventDefault();
      const it = flat[sel];
      if(it && it.href) $("gsi" + sel).click(); else choose(it);
    }
  });
  root.addEventListener("keydown", e => { if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); close(); } });
  list.addEventListener("click", e => {
    if(e.target.closest("[data-all]")){ const q = input.value.trim(); close(() => SK.searchArchive(q)); return; }
    const b = e.target.closest("[data-i]");
    if(b){ if(!b.href) e.preventDefault(); choose(flat[+b.dataset.i]); }
  });
  list.addEventListener("mousemove", e => { const b = e.target.closest("[data-i]"); if(b && +b.dataset.i !== sel) setSel(+b.dataset.i); });
})();
