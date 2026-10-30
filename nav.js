// Gezinme: alt menüdeki beş bölüm (Akort, Dersler, Çalış, Eserler, Ayarlar), her bölümün sayfa yığını,
// tarayıcı geçmişi ve adres. Tek kural: her "içeri gir" geçmişe bir kayıt ekler, geri tuşu (ekrandaki ←,
// Android ve tarayıcı geri) bir kayıt geri alır. Geçmiş her zaman yalnızca görünen bölümün yığınını yansıtır:
// en altta Akort kaydı (i:0, d:0), bölüm Akort değilse üstünde bölüm kökü, sonra yığındaki her sayfa.
// Bölüm değişince geçmiş tabana inip yeniden kurulur; böylece başka bölümün sayfaları geri tuşunun altında kalmaz.
// Dersler, Çalış ve Eserler aynı Çalışma kabuğunu (practice.js) gösterir: body[data-view="practice"],
// hangi bölüm olduğu body[data-sec]'te. practice.js Nav.register ile sayfaları çizer.
(function(){
  const SK = window.SK;
  if(!SK) return;
  const store = SK.store;
  const SECS = ["tune", "lessons", "practice", "pieces", "settings"];
  const SHELL = ["lessons", "practice", "pieces"];
  const LROOTS = ["lessons", "roadmap", "videos"];          // Dersler kökünün segmentleri (geçmişe yazılmaz)
  const PIECES = ["archive", "piece", "band", "kulaktan", "convert", "rec"];
  const secOf = p => p === "review" ? "settings" : LROOTS.includes(p) ? "lessons" : PIECES.includes(p) ? "pieces" : "practice";

  // Yığın girdisi: { page, sub?, title?, onPop?, y }
  const stacks = Object.fromEntries(SECS.map(s => [s, []]));
  const rootY = {};
  let sec = "tune", akort = "tune", lroot = store.get("nav.lroot", "lessons");
  let h = null, rebuilding = false, started = false;
  const route = { ders:null, eser:null };
  const depth = (s = sec) => (s === "tune" ? 0 : 1) + stacks[s].length;
  const top = (s = sec) => stacks[s][stacks[s].length - 1] || null;
  const curI = () => (history.state && history.state.i) || 0;

  function viewFor(s){
    if(s === "tune") return akort;
    if(s === "settings") return top(s) && top(s).page === "review" ? "review" : "settings";
    return "practice";
  }
  function saveY(){ const t = top(); if(t) t.y = window.scrollY; else rootY[sec] = window.scrollY; }
  // Yığını n girdiye indirir; alt sayfalar kendini kapatır
  function trim(s, n){ while(stacks[s].length > n){ const e = stacks[s].pop(); if(e.onPop) e.onPop(); } }

  const navBtns = document.querySelectorAll(".nav [data-sec]");
  // Üst çubuk: kökte bölüm adı, iç sayfada ← ve sayfanın adı
  const TITLES = { tune:"Sol Klarnet", lessons:L("Dersler", "Lessons"), practice:L("Çalış", "Practice"), pieces:L("Eserler", "Pieces"), settings:L("Ayarlar", "Settings") };
  const backBtn = document.getElementById("navback"), titleEl = document.getElementById("navtitle");
  function paintBar(){
    const t = top();
    document.body.classList.toggle("inner", !!t);
    // Yardım ve araç ikonlarını Çalışma kabuğu (practice.js) gösterir; başka bölümde gizli
    if(!SHELL.includes(sec)) ["navhelp", "navtools"].forEach(id => { document.getElementById(id).hidden = true; });
    backBtn.hidden = !t;
    titleEl.textContent = !t ? TITLES[sec] : t.title || (t.page === "review" ? L("Uzman kontrolü", "Expert review") : h ? h.title(t.page) : "");
  }
  backBtn.addEventListener("click", () => history.back());

  // Alttan açılan panel: açılınca geçmişe bir kayıt eklenir (sheet:1); geri tuşu, ✕, perdeye dokunma ve Esc kapatır
  const sheet = document.getElementById("sheet"), scrim = document.getElementById("scrim");
  const sheetBody = document.getElementById("sheetbody"), sheetTitle = document.getElementById("sheettitle");
  let sheetFrom = null, pendingSheet = null;
  function openSheet(title, el){
    if(rebuilding){ pendingSheet = [title, el]; return; }    // geçmiş kurulunca açılır
    if(el.parentNode !== sheetBody) sheetBody.appendChild(el);
    [...sheetBody.children].forEach(c => { c.hidden = c !== el; });
    sheetTitle.textContent = title;
    if(sheet.hidden){
      sheetFrom = document.activeElement;
      sheet.hidden = scrim.hidden = false;
      document.body.classList.add("modal");
      const st = history.state || {};
      history.pushState({ ...st, i:(st.i || 0) + 1, sheet:1 }, "");
    }
    sheet.scrollTop = 0; sheet.focus();
  }
  function hideSheet(){
    if(sheet.hidden) return;
    sheet.hidden = scrim.hidden = true;
    document.body.classList.remove("modal");
    if(sheetFrom && document.contains(sheetFrom)) sheetFrom.focus();
    sheetFrom = null;
  }
  function closeSheet(){
    if(sheet.hidden) return;
    if(history.state && history.state.sheet) history.back(); else hideSheet();
  }
  scrim.addEventListener("click", closeSheet);
  document.getElementById("sheetx").addEventListener("click", closeSheet);
  document.getElementById("sheetx").setAttribute("aria-label", L("Kapat", "Close"));
  sheet.addEventListener("keydown", e => { if(e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); closeSheet(); } });
  function render(why){
    document.body.dataset.sec = sec;
    SK.showView(viewFor(sec));
    navBtns.forEach(b => b.dataset.sec === sec ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
    if(h && SHELL.includes(sec)) h.show(sec, top(), why);
    paintBar();
    const t = top();
    window.scrollTo(0, (t ? t.y : rootY[sec]) || 0);
    if(started){
      if(sec !== "settings") store.set("nav.sec", sec);
      const tops = store.get("nav.top", {}); tops[sec] = t ? t.page : null; store.set("nav.top", tops);
    }
    syncUrl();
  }

  // Geçmişi tabana indirip görünen bölümün derinliği kadar yeniden kurar
  function rebuild(){
    if(rebuilding) return;               // süren kurulum en son derinliği kullanır
    const push = () => {
      const d = depth();
      for(let k = 1; k <= d; k++) history.pushState({ nav:1, i:k, d:k }, "");
      rebuilding = false; syncUrl();
      if(pendingSheet){ const p = pendingSheet; pendingSheet = null; openSheet(...p); }
    };
    const i = curI();
    hideSheet();                         // panelin kaydı da geri alınır
    rebuilding = true;
    if(i > 0){ window.addEventListener("popstate", push, { once:true }); history.go(-i); }
    else push();
  }
  function push(entry){
    saveY();
    stacks[sec].push(entry);
    // Panel açıkken sayfa açılırsa panelin kaydı sayfanın kaydı olur
    if(!sheet.hidden){ hideSheet(); if(history.state && history.state.sheet){ history.replaceState({ nav:1, i:curI(), d:depth() }, ""); render("push"); return; } }
    if(!rebuilding) history.pushState({ nav:1, i:curI() + 1, d:depth() }, "");
    render("push");
  }

  function switchTo(s){
    if(!SECS.includes(s)) s = "tune";
    if(s === sec && started){
      if(stacks[s].length){ saveY(); trim(s, 0); render("pop"); rebuild(); }
      else window.scrollTo({ top:0, behavior:"smooth" });   // kökteyken başa kaydır
      return;
    }
    saveY();
    sec = s;
    render("switch");
    rebuild();
  }
  function open(page){
    const s = secOf(page), moved = s !== sec;
    if(moved){ saveY(); sec = s; }
    if(s === "lessons" && LROOTS.includes(page)){
      if(stacks.lessons.length) trim("lessons", 0);
      lroot = page; store.set("nav.lroot", page);
      render(moved ? "switch" : "pop"); rebuild();
      return;
    }
    // Aynı sayfanın alt sayfaları açıksa sayfanın kendisine inilir
    const st = stacks[s];
    let n = st.length;
    while(n && st[n-1].page === page && st[n-1].sub) n--;
    if(n && st[n-1].page === page){
      if(n < st.length || moved){ trim(s, n); render(moved ? "switch" : "pop"); rebuild(); }
      return;
    }
    if(moved){ st.push({ page }); render("switch"); rebuild(); }
    else push({ page });
  }
  function pushSub(sub, title, onPop){
    const t = top();
    if(t && t.sub === sub) return;
    push({ page: t ? t.page : (sec === "lessons" ? lroot : null), sub, title, onPop });
  }
  // Açık alt sayfanın yerine başkası (sonraki ders, başka eser): geri adımı eklenmez
  function replaceSub(sub, title, onPop){
    const t = top();
    if(!t || !t.sub) return pushSub(sub, title, onPop);
    Object.assign(t, { sub, title, onPop });
    paintBar(); syncUrl();
  }
  function setRoot(tab){
    if(!LROOTS.includes(tab)) return;
    lroot = tab; store.set("nav.lroot", tab);
    if(sec === "lessons" && !top()) render("switch");
  }
  function setAkort(mode){
    akort = mode === "finger" ? "finger" : "tune";
    if(sec === "tune") render("switch"); else switchTo("tune");
  }

  window.addEventListener("popstate", e => {
    if(rebuilding) return;
    if(!(e.state && e.state.sheet)) hideSheet();
    const d = (e.state && e.state.d) || 0, cur = depth();
    if(d < cur){
      if(d === 0 && sec !== "tune"){ trim(sec, 0); sec = "tune"; render("switch"); }
      else{ trim(sec, d - (sec === "tune" ? 0 : 1)); render("pop"); }
    }else if(d > cur) history.go(cur - d);   // ileri tuşu: yığında olmayan kayda gidilmez
  });

  // Adres: her sayfanın paylaşılabilir bağlantısı (geçmişe kayıt eklemez). Eski biçim korunur.
  function syncUrl(){
    if(!started) return;
    const q = new URLSearchParams(), t = top();
    if(sec === "tune"){ if(akort === "finger") q.set("view", "finger"); }
    else if(sec === "settings") q.set("view", viewFor(sec));
    else if(sec === "lessons"){ q.set("tab", lroot); if(t && t.sub && route.ders) q.set("ders", route.ders); }
    else if(!t) q.set("view", sec);
    else{ q.set("tab", t.page); if(t.page === "archive" && t.sub && route.eser) q.set("eser", route.eser); }
    const url = location.pathname + (q.toString() ? "?" + q : "") + (sec === "tune" ? location.hash : "");
    if(url !== location.pathname + location.search + location.hash) history.replaceState(history.state, "", url);
  }

  // Eski anahtarlar (view, ptab, ptab.lesson) bir kez yeni anahtarlara çevrilir
  function migrate(){
    if(store.get("nav.sec", null) !== null) return;
    const v = store.get("view", "tune"), pt = store.get("ptab", ""), pl = store.get("ptab.lesson", "");
    const s = v === "practice" && pt ? secOf(pt) : v === "practice" ? "practice" : "tune";
    store.set("nav.sec", s);
    if(s !== "tune" && pt && !LROOTS.includes(pt)) store.set("nav.top", { [s]: pt });
    if(LROOTS.includes(pl)){ lroot = pl; store.set("nav.lroot", pl); }
  }

  // Açılış: bağlantı (?tab, ?ders, ?eser, ?view, #nota=) ya da son kullanılan bölüm ve sayfa
  function start(){
    // Adres ilk çizimde Akort'a göre yeniden yazılır; bağlantı ondan önce okunur
    const qs = new URLSearchParams(location.search), v = qs.get("view"), tab = qs.get("tab"), nota = /nota=/.test(location.hash);
    const known = p => p === "review" || (h && !!h.title(p));
    history.replaceState({ nav:1, i:0, d:0 }, "");
    migrate();
    const last = store.get("nav.sec", "tune"), lastTop = store.get("nav.top", {})[last];
    started = true;
    render("switch");
    if(nota) return;
    if(qs.get("eser")) SK.openArchive(qs.get("eser"));
    else if(qs.get("ders")){ open("lessons"); SK.openLesson(qs.get("ders")); }
    else if(tab && known(tab)) open(tab);
    else if(v === "finger") setAkort("finger");
    else if(v === "review") open("review");
    else if(SECS.includes(v)) switchTo(v);
    else if(!v){
      if(lastTop && known(lastTop) && secOf(lastTop) === last) open(lastTop); else switchTo(last);
    }
  }

  navBtns.forEach(b => b.addEventListener("click", () => switchTo(b.dataset.sec)));
  // data-goto: Akort / Parmak geçişi, Uzman kontrolü "Göster", "Parmağa bak" gibi bağlantılar
  document.addEventListener("click", e => { const g = e.target.closest("[data-goto]"); if(g) SK.go(g.dataset.goto); });

  const Nav = window.Nav = SK.nav = {
    SECS, secOf, start, switchTo, open, pushSub, replaceSub, setRoot, setAkort, openSheet, closeSheet,
    sheetOpen: () => !sheet.hidden,
    sec: () => sec, top, lroot: () => lroot,
    back: () => history.back(),
    register(hooks){ h = hooks; },
    setRoute(r){ Object.assign(route, r); syncUrl(); }
  };
  SK.setRoute = Nav.setRoute;
  // Eski çağrılar: SK.go("tune" | "finger" | "practice" | "settings" | "review")
  SK.go = v => {
    if(v === "finger" || v === "tune") setAkort(v);
    else if(v === "review") open("review");
    else switchTo(v);
  };
})();
