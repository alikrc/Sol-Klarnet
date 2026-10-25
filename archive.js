// Nota arşivi: SymbTr koleksiyonundan 2200 eser (notalar/, scripts/symbtr.js üretir). Arama ve süzgeçler; eser ekranında
// satırlara bölünmüş nota, çalma (tempo, A–B ölçü döngüsü, bölüm ve cümle döngüsü, dem, usul eşliği, melodiyi kapat),
// mikrofonla takip ve tempolu çalma (pieces.js piecePlayer), transpoze, yakınlaştırma, tam ekran, yazdırma,
// "Eseri öğren" adımları ve benzer eserler. Arşiv uygulamanın içindedir, internet istemez.

// SymbTr makam adı → uygulamanın makamı (perde hedefleri ve icra akordu için); listede olmayanlar perdesiz değerlendirilir
const ARCH_MAKAM = { nihavent:"nihavend", beyati:"bayati", hicaz_zirgule:"zirguleli", hicaz_humayun:"humayun", hicaz_uzzal:"uzzal" };
const archMakam = mk => { const id = ARCH_MAKAM[mk] || mk; return typeof makamById === "function" && MAKAMS.some(m => m.id === id) ? id : null; };
// Usul eşliği: uygulamanın düm-tek kalıbı olan usuller (learn.js USULS, ölçüsü tutuyorsa); diğerlerinde ölçünün
// vuruş grupları (ilk grup düm, diğerleri tek). Kalıp birimi ölçünün paydasıdır.
const ARCH_GROUPS = { "2/4":[1,1], "3/4":[1,1,1], "4/4":[2,1,1], "3/8":[1,1,1], "5/8":[2,3], "6/8":[3,3], "6/4":[3,3], "7/8":[3,2,2],
  "8/8":[3,3,2], "9/8":[2,2,2,3], "10/8":[3,2,2,3], "12/8":[3,3,3,3], "5/4":[2,3], "7/4":[3,2,2], "9/4":[2,2,2,3], "8/4":[2,2,2,2] };
function archUsul(slug, num, den){
  const id = (slug || "").replace(/_ii$/, "");
  const u = USULS.find(x => x.id === id && x.meter === num + "/" + den);
  if(u) return u.strokes;
  const g = ARCH_GROUPS[num + "/" + den] || Array(num).fill(1);
  return g.map((v, i) => [i === 0 ? "D" : "T", v]);
}
const archFold = s => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
const ARCH_LV = { 1: L("Başlangıç", "Beginner"), 2: L("Orta", "Intermediate"), 3: L("İleri", "Advanced") };
const archDur = s => Math.floor(s/60) + ":" + String(s % 60).padStart(2, "0");
// Eser dosyasındaki nota [c, d, süs?, hece?] → { w, c, d, rest, orn?, syl? }
const ARCH_ORN = { "tr":{ kind:"tril", dir:"up" }, "m+":{ kind:"mordan", dir:"up" }, "m-":{ kind:"mordan", dir:"down" },
  "ç+":{ kind:"carpma", dir:"up" }, "ç-":{ kind:"carpma", dir:"down" } };
function archNote(a){
  if(a[0] === null) return { w:null, c:null, d:a[1], rest:true };
  const n = { w: Math.round(67 + a[0]*12/53), c:a[0], d:a[1], rest:false };
  if(a[2]) n.orn = { ...ARCH_ORN[a[2]] };
  if(a[3]) n.syl = a[3];
  return n;
}
// Ölçüler: usul değişimlerine göre ölçü sınırları; notalar ölçü sınırına göre bölünür
function archMeasures(notes, meters){
  const ms = []; let from = 0, acc = 0, mi = 0;
  let cur = meters[0] || [0, 4, 4, ""];
  for(let i = 0; i < notes.length; i++){
    while(mi + 1 < meters.length && meters[mi + 1][0] <= i){ mi++; if(i > from){ ms.push({ from, to:i, meter:cur }); from = i; acc = 0; } cur = meters[mi]; }
    const bar = cur[1]*4/cur[2];
    acc += notes[i].d;
    if(acc >= bar - 1e-6){ ms.push({ from, to:i + 1, meter:cur }); from = i + 1; acc = Math.max(0, acc - bar); if(acc < 1e-6) acc = 0; }
  }
  if(from < notes.length) ms.push({ from, to:notes.length, meter:cur });
  return ms;
}

TRAINERS.archive = function(ctx){
  const { SK, $, store, esc } = ctx;
  const P = $("pp-archive");
  P.innerHTML = `
    <p class="pdesc">${L("SymbTr koleksiyonundan 2200 eser, AEU koma işaretleriyle. Ara, süz, aç: dinle, yavaşlat, zor ölçüyü döngüye al, usul ve demle birlikte çal; mikrofonla takip ettir ya da tempolu çalıp değerlendirt. Arşiv uygulamanın içindedir, internet istemez.",
      "2200 pieces from the SymbTr collection, with AEU accidentals. Search, filter, open: listen, slow down, loop a hard bar, play along with the usul and the drone; let it follow you with the microphone or play in tempo and get scored. The archive is built in and works offline.")}</p>
    <div class="arlist" id="arlist">
      <div class="arsearch"><input id="arq" type="search" placeholder="${L("Eser, bestekâr, makam, usul ara…", "Search pieces, composers, makams, usuls…")}" aria-label="${L("Eser ara", "Search pieces")}" autocomplete="off"></div>
      <div class="arquick" id="arquick"></div>
      <details class="arfilt" id="arfilt"><summary>${L("Süzgeçler ve sıralama", "Filters and sorting")}</summary>
        <div class="arfgrid">
          <label>${L("Makam", "Makam")}<select id="arfmk"></select></label>
          <label>${L("Form", "Form")}<select id="arff"></select></label>
          <label>${L("Usul", "Usul")}<select id="arfu"></select></label>
          <label>${L("Bestekâr", "Composer")}<select id="arfb"></select></label>
          <label>${L("Seviye", "Level")}<select id="arflv"><option value="">${L("Hepsi", "All")}</option>${[1,2,3].map(v => `<option value="${v}">${ARCH_LV[v]}</option>`).join("")}</select></label>
          <label>${L("Sırala", "Sort")}<select id="arsort">
            <option value="name">${L("Ada göre", "By name")}</option><option value="makam">${L("Makama göre", "By makam")}</option>
            <option value="easy">${L("Kolaydan zora", "Easiest first")}</option><option value="short">${L("Kısadan uzuna", "Shortest first")}</option></select></label>
        </div>
        <div class="pbar"><label class="chk"><input type="checkbox" id="arflyr"> ${L("yalnız sözlüler", "with lyrics only")}</label>
          <label class="chk"><input type="checkbox" id="arffav"> ${L("yalnız favoriler", "favourites only")}</label>
          <button class="linkbtn" type="button" id="arfclr">${L("Temizle", "Clear")}</button></div>
      </details>
      <div class="muted arcount" id="arcount" aria-live="polite"></div>
      <div class="arrows" id="arrows"></div>
      <button class="stopbtn armore" type="button" id="armore" hidden>${L("Daha fazla göster", "Show more")}</button>
      <p class="muted arsrcnote">${L("Notalar: SymbTr (M. K. Karaosmanoğlu; Music Technology Group, Universitat Pompeu Fabra), CC BY-NC-SA 4.0.", "Scores: SymbTr (M. K. Karaosmanoğlu; Music Technology Group, Universitat Pompeu Fabra), CC BY-NC-SA 4.0.")}</p>
    </div>
    <div class="arpiece" id="arpiece" hidden></div>`;

  // ======== Arşiv listesi ========
  let INDEX = null, loading = null, shown = 40, quick = "all";
  const byId = id => INDEX && INDEX.map.get(id);
  const favs = () => new Set(store.get("arch.fav", []));
  function loadIndex(){
    if(INDEX) return Promise.resolve(INDEX);
    if(!loading) loading = fetch("notalar/index.json").then(r => r.json()).then(j => {
      const list = j.pieces;
      list.forEach(e => { e.hay = archFold([e.t, e.b, e.g, e.mkn, e.fn, e.un].join(" ")); });
      INDEX = { list, map: new Map(list.map(e => [e.id, e])), source: j.source };
      fillFilters(); return INDEX;
    }).catch(e => { loading = null; throw e; });
    return loading;
  }
  function opts(sel, pairs, all){
    sel.innerHTML = `<option value="">${all}</option>` + pairs.map(([v, t, n]) => `<option value="${esc(v)}">${esc(t)} (${n})</option>`).join("");
  }
  function fillFilters(){
    const group = (key, name) => {
      const m = new Map();
      INDEX.list.forEach(e => { const k = e[key]; if(!k) return; const x = m.get(k) || [k, e[name] || k, 0]; x[2]++; m.set(k, x); });
      return [...m.values()].sort((a, b) => a[1].localeCompare(b[1], "tr"));
    };
    opts($("arfmk"), group("mk", "mkn"), L("Hepsi", "All"));
    opts($("arff"), group("f", "fn"), L("Hepsi", "All"));
    opts($("arfu"), group("u", "un"), L("Hepsi", "All"));
    opts($("arfb"), group("b", "b"), L("Hepsi", "All"));
    const f = store.get("arch.filter", {});
    [["arfmk","mk"],["arff","f"],["arfu","u"],["arfb","b"],["arflv","lv"],["arsort","sort"]].forEach(([id, k]) => { if(f[k] != null) $(id).value = f[k]; });
    $("arflyr").checked = !!f.lyr; $("arffav").checked = !!f.fav; $("arq").value = f.q || "";
  }
  const filt = () => ({ q: $("arq").value, mk: $("arfmk").value, f: $("arff").value, u: $("arfu").value, b: $("arfb").value,
    lv: $("arflv").value, sort: $("arsort").value, lyr: $("arflyr").checked, fav: $("arffav").checked });
  function results(){
    const f = filt(), fv = favs(), words = archFold(f.q).split(/\s+/).filter(Boolean);
    let r = INDEX.list.filter(e => (!f.mk || e.mk === f.mk) && (!f.f || e.f === f.f) && (!f.u || e.u === f.u) && (!f.b || e.b === f.b) &&
      (!f.lv || e.lv === +f.lv) && (!f.lyr || e.lyr) && (!f.fav || fv.has(e.id)) && words.every(w => e.hay.includes(w)));
    if(quick === "recent"){ const rec = store.get("arch.recent", []); r = rec.map(byId).filter(e => e && r.includes(e)); return r; }
    const cmp = { name: (a, b) => a.t.localeCompare(b.t, "tr"), makam: (a, b) => a.mkn.localeCompare(b.mkn, "tr") || a.t.localeCompare(b.t, "tr"),
                  easy: (a, b) => a.lv - b.lv || a.n - b.n, short: (a, b) => a.s - b.s }[f.sort] || ((a, b) => a.t.localeCompare(b.t, "tr"));
    return r.sort(cmp);
  }
  function row(e, fv){
    return `<button type="button" class="arrow" data-id="${esc(e.id)}">
      <span class="arrt"><b>${esc(e.t)}</b>${fv.has(e.id) ? `<i class="arstar" aria-label="${L("favori", "favourite")}">★</i>` : ""}</span>
      <span class="arrb">${esc(e.b || L("Anonim", "Anonymous"))}</span>
      <span class="arrm">${esc(e.mkn)} · ${esc(e.fn)} · ${esc(e.un)} · ${archDur(e.s)} · <em class="arlv lv${e.lv}">${ARCH_LV[e.lv]}</em></span></button>`;
  }
  function renderList(){
    if(!INDEX) return;
    store.set("arch.filter", filt());
    const r = results(), fv = favs();
    $("arquick").innerHTML = [["all", L("Bütün eserler", "All pieces")], ["recent", L("Son açtıklarım", "Recently opened")], ["fav", L("Favorilerim", "My favourites") + " (" + fv.size + ")"]]
      .map(([k, t]) => `<button type="button" class="chipbtn" data-quick="${k}" aria-pressed="${quick === k || (k === "fav" && quick === "all" && $("arffav").checked) ? "true" : "false"}">${t}</button>`).join("");
    $("arcount").textContent = r.length + L(" eser", " pieces") + (r.length !== INDEX.list.length ? L(" bulundu", " found") : "");
    $("arrows").innerHTML = r.length ? r.slice(0, shown).map(e => row(e, fv)).join("") :
      `<p class="muted">${quick === "recent" ? L("Henüz eser açmadın.", "You haven't opened a piece yet.") : L("Bu aramaya uyan eser yok. Süzgeçleri temizlemeyi dene.", "No piece matches. Try clearing the filters.")}</p>`;
    $("armore").hidden = r.length <= shown;
  }
  let qTimer = null;
  $("arq").addEventListener("input", () => { clearTimeout(qTimer); qTimer = setTimeout(() => { shown = 40; quick = "all"; renderList(); }, 150); });
  ["arfmk","arff","arfu","arfb","arflv","arsort","arflyr","arffav"].forEach(id => $(id).addEventListener("change", () => { shown = 40; quick = "all"; renderList(); }));
  $("arfclr").addEventListener("click", () => {
    ["arfmk","arff","arfu","arfb","arflv"].forEach(id => { $(id).value = ""; });
    $("arsort").value = "name"; $("arflyr").checked = $("arffav").checked = false; $("arq").value = ""; shown = 40; quick = "all"; renderList();
  });
  $("armore").addEventListener("click", () => { shown += 40; renderList(); });
  $("arquick").addEventListener("click", e => {
    const b = e.target.closest("[data-quick]"); if(!b) return;
    quick = b.dataset.quick === "recent" ? "recent" : "all";
    $("arffav").checked = b.dataset.quick === "fav";
    shown = 40; renderList();
  });
  $("arrows").addEventListener("click", e => { const b = e.target.closest("[data-id]"); if(b) openPiece(b.dataset.id); });
  // Benzer eserler düğmesinden: tek süzgeçle liste
  function listBy(key, value){
    ["arfmk","arff","arfu","arfb","arflv"].forEach(id => { $(id).value = ""; });
    $({ mk:"arfmk", f:"arff", u:"arfu", b:"arfb" }[key]).value = value;
    $("arq").value = ""; $("arffav").checked = false; quick = "all"; shown = 40;
    showList(); $("arfilt").open = true;
  }
  function showList(){
    closePiece();
    $("arlist").hidden = false; $("arpiece").hidden = true;
    renderList();
  }

  // ======== Eser ekranı ========
  const S = {                                                     // görünüm ayarları (kalıcı)
    zoom: store.get("arch.zoom", 1), layout: store.get("arch.layout", "page"), follow: store.get("arch.follow", true),
    lyr: store.get("arch.lyr", true), phr: store.get("arch.phr", false), acc: store.get("arch.acc", "off"), mute: false, dem: false };
  let cur = null;          // { e (dizin), raw (dosya), base (asıl notalar), notes, ms (ölçüler), measOf, beatAt, player, ... }
  const save = (k, v) => { S[k] = v; store.set("arch." + k, v); };

  async function openPiece(id){
    const e = byId(id);
    if(!e) return;
    closePiece();
    $("arlist").hidden = true;
    const box = $("arpiece"); box.hidden = false;
    box.innerHTML = `<p class="muted">${L("Nota açılıyor…", "Opening the score…")}</p>`;
    let raw;
    try{ raw = await fetch("notalar/" + encodeURIComponent(id) + ".json").then(r => r.json()); }
    catch(err){ box.innerHTML = `<p class="fb bad">${L("Nota açılamadı.", "Couldn't open the score.")}</p>`; return; }
    store.set("arch.recent", [id, ...store.get("arch.recent", []).filter(x => x !== id)].slice(0, 30));
    store.set("arch.last", id);
    const meters = raw.meters.length ? raw.meters : [[0, 4, 4, ""]];
    cur = { e, raw, meters, base: raw.notes.map(archNote), startAt: 0, loop: null, pick: null, learnStep: null };
    const tr = store.get("arch.tr", {})[id] || { steps:0, oct:0 };
    cur.tr = tr;
    buildPiece();
    applyTranspose();
    window.scrollTo(0, P.getBoundingClientRect().top + window.scrollY - 70);
  }
  function closePiece(){
    if(!cur) return;
    stopAll();
    if(cur.io) cur.io.disconnect();
    document.body.classList.remove("arfullbody");
    cur = null;
  }

  function buildPiece(){
    const e = cur.e, fv = favs(), mkId = archMakam(e.mk);
    const git = "https://github.com/MTG/SymbTr/blob/master/MusicXML/" + encodeURIComponent(e.id) + ".xml";
    const yt = "https://www.youtube.com/results?search_query=" + encodeURIComponent([e.t, e.b].filter(Boolean).join(" "));
    $("arpiece").innerHTML = `
      <div class="pbar arhead">
        <button type="button" class="pback" id="arback">${L("‹ Arşiv", "‹ Archive")}</button>
        <button type="button" class="stopbtn" id="arfav" aria-pressed="${fv.has(e.id)}">${fv.has(e.id) ? "★ " + L("Favoride", "Favourite") : "☆ " + L("Favorilere ekle", "Add to favourites")}</button>
        <button type="button" class="stopbtn" id="aradd">${L("Eserlerime ekle", "Add to my pieces")}</button>
      </div>
      <h2 class="artitle">${esc(e.t)}</h2>
      <p class="arby">${esc(e.b || L("Anonim", "Anonymous"))}${e.g ? " · " + L("Güfte: ", "Lyrics: ") + esc(e.g) : ""}</p>
      <div class="armeta">
        <button type="button" class="chipbtn" data-like="mk">${esc(e.mkn)}</button>
        <button type="button" class="chipbtn" data-like="f">${esc(e.fn)}</button>
        <button type="button" class="chipbtn" data-like="u">${esc(e.un)}</button>
        <span>♩ = ${e.tp}</span><span>${archDur(e.s)}</span><span>${e.n + L(" nota", " notes")}</span>
        <em class="arlv lv${e.lv}">${ARCH_LV[e.lv]}</em>
      </div>
      ${mkId ? "" : `<p class="muted arnote">${L("Bu makam uygulamanın makam listesinde yok; perdeler AEU'ya göre değerlendirilir.", "This makam isn't in the app's makam list; perdes are judged by AEU.")}</p>`}
      <div class="arctl" id="arctl">
        <div class="pbar">
          <button type="button" class="primary small" id="arplay">${L("▶ Çal", "▶ Play")}</button>
          <button type="button" class="stopbtn" id="arfrom0" aria-label="${L("Baştan çal", "Play from the start")}">⏮</button>
          <label class="tnum artempo">${L("Tempo", "Tempo")} <input id="arpct" type="range" min="25" max="150" step="5" value="100" aria-label="${L("Tempo yüzdesi", "Tempo percent")}"> <em id="arpctv">%100</em></label>
          <button type="button" class="linkbtn" id="arpct100">%100</button>
        </div>
        <div class="pbar">
          <button type="button" class="stopbtn" id="arab" aria-pressed="false">A–B</button>
          <button type="button" class="stopbtn" id="ardem" aria-pressed="false">${L("Dem", "Drone")}</button>
          <label class="arsel">${L("Eşlik", "Accomp.")} <select id="aracc" aria-label="${L("Eşlik", "Accompaniment")}">
            <option value="off">${L("Sessiz", "None")}</option><option value="met">${L("Metronom", "Metronome")}</option><option value="usul">${L("Usul (düm-tek)", "Usul (düm-tek)")}</option></select></label>
          <button type="button" class="stopbtn" id="armute" aria-pressed="false">${L("Melodiyi kapat", "Mute melody")}</button>
        </div>
        <div class="pbar">
          <button type="button" class="stopbtn" id="arfollow">${L("🎤 Beni takip et", "🎤 Follow me")}</button>
          <button type="button" class="stopbtn" id="artempo">${L("🎤 Tempolu çal", "🎤 Play in tempo")}</button>
          <button type="button" class="stopbtn" id="arladder">${L("🎤 Merdiven", "🎤 Ladder")}</button>
          <button type="button" class="stopbtn" id="arfull" aria-pressed="false">${L("⛶ Tam ekran", "⛶ Full screen")}</button>
        </div>
      </div>
      <details class="arset" id="arset"><summary>${L("Görünüm ve transpoze", "View and transpose")}</summary>
        <div class="arfgrid">
          <label>${L("Transpoze", "Transpose")}<select id="artr">${Array.from({ length:15 }, (_, i) => i - 7).map(v =>
            `<option value="${v}">${v === 0 ? L("Asıl yeri", "Original") : (v > 0 ? "+" : "−") + Math.abs(v) + L(" perde", " perde")}</option>`).join("")}</select></label>
          <label>${L("Oktav", "Octave")}<select id="aroct"><option value="auto">${L("Klarnete sığdır", "Fit the clarinet")}</option>
            <option value="-1">−1</option><option value="0">0</option><option value="1">+1</option></select></label>
          <label>${L("Görünüm", "Layout")}<select id="arlayout"><option value="page">${L("Sayfa (satırlar)", "Page (lines)")}</option><option value="strip">${L("Şerit (tek satır)", "Strip (one line)")}</option></select></label>
          <div class="arzoom"><span>${L("Nota boyutu", "Score size")}</span>
            <button type="button" class="stopbtn" id="arzm" aria-label="${L("Notayı küçült", "Smaller")}">−</button>
            <em id="arzv">%100</em>
            <button type="button" class="stopbtn" id="arzp" aria-label="${L("Notayı büyüt", "Larger")}">+</button></div>
        </div>
        <div class="pbar">
          <label class="chk"><input type="checkbox" id="arfol"> ${L("notayı izle", "follow the score")}</label>
          <label class="chk"><input type="checkbox" id="arlyr"> ${L("sözler", "lyrics")}</label>
          <label class="chk"><input type="checkbox" id="arnames"> ${L("perde adları", "perde names")}</label>
          <label class="chk"><input type="checkbox" id="arfing"> ${L("parmağı göster", "show fingering")}</label>
          <label class="chk"><input type="checkbox" id="arphr"> ${L("cümleler", "phrases")}</label>
          <button type="button" class="linkbtn" id="arprint">${L("Yazdır", "Print")}</button>
        </div>
        <p class="muted" id="artrinfo"></p>
      </details>
      <nav class="arsecs" id="arsecs" aria-label="${L("Bölümler", "Sections")}"></nav>
      <div class="fb" id="arfb" aria-live="polite"></div>
      <div class="arscore" id="arscore"></div>
      <button type="button" class="arfab" id="arfab" hidden>${L("▶ Çal", "▶ Play")}</button>
      <details class="arlearn" id="arlearn"><summary id="arlearnsum"></summary><ol class="arsteps" id="arsteps"></ol></details>
      <div class="arlike"><span class="label">${L("Benzer eserler", "Similar pieces")}</span><div class="pbar" id="arlikes"></div></div>
      <p class="muted arsrc">${L("Kaynak: ", "Source: ")}SymbTr (M. K. Karaosmanoğlu; MTG, Universitat Pompeu Fabra), CC BY-NC-SA 4.0 ·
        <a href="${git}" target="_blank" rel="noopener">MusicXML</a>
        ${e.mb ? ` · <a href="https://musicbrainz.org/work/${esc(e.mb)}" target="_blank" rel="noopener">MusicBrainz</a>` : ""}
        · <a href="${yt}" target="_blank" rel="noopener">${L("YouTube'da dinle", "Listen on YouTube")}</a></p>`;

    $("arback").addEventListener("click", showList);
    $("arfav").addEventListener("click", () => {
      const f = favs(); f.has(e.id) ? f.delete(e.id) : f.add(e.id); store.set("arch.fav", [...f]);
      const on = f.has(e.id);
      $("arfav").setAttribute("aria-pressed", on); $("arfav").textContent = on ? "★ " + L("Favoride", "Favourite") : "☆ " + L("Favorilere ekle", "Add to favourites");
    });
    $("aradd").addEventListener("click", () => {
      stopAll();
      SK.addPieceFull({ name: e.t, notes: cur.notes.map(({ syl, ...n }) => n), tempo: e.tp, meter: [cur.meters[0][1], cur.meters[0][2]],
        makam: cur.tr.steps ? null : mkId, source: { site: "SymbTr", url: git } });
    });
    $("arpiece").querySelectorAll("[data-like]").forEach(b => b.addEventListener("click", () => listBy(b.dataset.like, e[b.dataset.like])));
    const likes = [["mk", e.mk, L("Bu makamda", "In this makam")], ["u", e.u, L("Bu usulde", "In this usul")], ["f", e.f, L("Bu formda", "In this form")], ["b", e.b, L("Bu bestekârdan", "By this composer")]]
      .filter(([, v]) => v).map(([k, v, t]) => [k, v, t, INDEX.list.filter(x => x[k] === v && x.id !== e.id).length]).filter(x => x[3]);
    $("arlikes").innerHTML = likes.map(([k, v, t, n]) => `<button type="button" class="chipbtn" data-k="${k}">${t} (${n})</button>`).join("");
    $("arlikes").addEventListener("click", ev => { const b = ev.target.closest("[data-k]"); if(b) listBy(b.dataset.k, e[b.dataset.k]); });

    // Çalma denetimleri
    $("arplay").addEventListener("click", () => cur.player && cur.player.playing() ? stopAll() : play());
    // Denetimler ekrandan çıkınca sağ altta Çal/Durdur düğmesi
    $("arfab").addEventListener("click", () => cur.player && cur.player.playing() ? stopAll() : play());
    if(cur.io) cur.io.disconnect();
    if("IntersectionObserver" in window){
      cur.io = new IntersectionObserver(([en]) => { const f = $("arfab"); if(f) f.hidden = en.isIntersecting || !cur; });
      cur.io.observe($("arctl"));
    }
    $("arfrom0").addEventListener("click", () => { cur.startAt = 0; cur.loop = null; abInfo(); play(); });
    const pctLabel = () => { $("arpctv").textContent = "%" + $("arpct").value; };
    $("arpct").addEventListener("input", pctLabel);
    $("arpct").addEventListener("change", () => { if(listening) play(); });
    $("arpct100").addEventListener("click", () => { $("arpct").value = 100; pctLabel(); if(listening) play(); });
    $("arab").addEventListener("click", () => {
      if(cur.loop || cur.pick){ cur.loop = null; cur.pick = null; abInfo(); return; }
      cur.pick = "A"; abInfo();
    });
    $("ardem").addEventListener("click", () => setDem(!S.dem));
    $("aracc").value = S.acc;
    $("aracc").addEventListener("change", () => { save("acc", $("aracc").value); if(listening) play(); });
    $("armute").addEventListener("click", () => { S.mute = !S.mute; $("armute").setAttribute("aria-pressed", S.mute); if(S.mute && S.acc === "off"){ save("acc", "usul"); $("aracc").value = "usul"; } if(listening) play(); });
    $("arfollow").addEventListener("click", async () => { stopAll(); if(await ctx.needMic()){ cur.player.startFree(); playLabel(true); } });
    $("artempo").addEventListener("click", () => { stopAll(); cur.player.startTempo(pct()); playLabel(true); });
    $("arladder").addEventListener("click", () => { stopAll(); cur.player.startLadder(120, p => { $("arpct").value = p; pctLabel(); }); playLabel(true); });
    $("arfull").addEventListener("click", () => setFull(!document.body.classList.contains("arfullbody")));

    // Görünüm ayarları
    $("artr").value = cur.tr.steps; $("aroct").value = cur.tr.oct === "auto" || cur.tr.oct == null ? "auto" : String(cur.tr.oct);
    const trChange = () => {
      cur.tr = { steps: +$("artr").value, oct: $("aroct").value === "auto" ? "auto" : +$("aroct").value };
      const all = store.get("arch.tr", {}); all[e.id] = cur.tr; store.set("arch.tr", all);
      stopAll(); applyTranspose();
    };
    $("artr").addEventListener("change", trChange); $("aroct").addEventListener("change", trChange);
    $("arlayout").value = S.layout;
    $("arlayout").addEventListener("change", () => { save("layout", $("arlayout").value); render(); });
    const zoomTo = z => { save("zoom", Math.round(Math.max(0.6, Math.min(2.2, z))*10)/10); $("arzv").textContent = "%" + Math.round(S.zoom*100); render(); };
    $("arzv").textContent = "%" + Math.round(S.zoom*100);
    $("arzm").addEventListener("click", () => zoomTo(S.zoom - 0.1)); $("arzp").addEventListener("click", () => zoomTo(S.zoom + 0.1));
    const chk = (id, key, fn) => { $(id).checked = S[key]; $(id).addEventListener("change", () => { save(key, $(id).checked); fn && fn(); }); };
    chk("arfol", "follow"); chk("arlyr", "lyr", render); chk("arphr", "phr", renderSecs);
    $("arnames").checked = store.get("piece.names", true);
    $("arnames").addEventListener("change", () => cur.player && cur.player.toggleNames());
    $("arfing").checked = store.get("piece.fing", true);
    $("arfing").addEventListener("change", () => store.set("piece.fing", $("arfing").checked));
    $("arprint").addEventListener("click", () => { document.body.classList.add("arprinting"); window.print(); setTimeout(() => document.body.classList.remove("arprinting"), 500); });

    // Notaya dokunma: A–B seçimi ya da çalma başlangıcı
    $("arscore").addEventListener("click", ev => {
      const g = ev.target.closest(".sn"); if(!g) return;
      const i = +g.dataset.i, m = cur.ms[cur.measOf[i]];
      if(cur.pick === "A"){ cur.pick = "B"; cur.loop = { from: m.from, to: m.to }; abInfo(); return; }
      if(cur.pick === "B"){ cur.pick = null; cur.loop = { from: Math.min(cur.loop.from, m.from), to: Math.max(cur.loop.to, m.to) }; abInfo(); play(); return; }
      cur.startAt = i; cur.loop = null; abInfo();
      if(listening) play(); else { cur.view.cur(i); say("", L("Çal'a basınca buradan başlar (ölçü ", "Play starts here (bar ") + (cur.measOf[i] + 1) + ")."); }
    });
    $("arsecs").addEventListener("click", ev => {
      const b = ev.target.closest("[data-from]"); if(!b) return;
      cur.loop = { from: +b.dataset.from, to: +b.dataset.to }; cur.pick = null; abInfo(); play();
    });
    buildLearn();
  }

  const say = (cls, t) => { const f = $("arfb"); if(f){ f.className = "fb " + cls; f.textContent = t; } };
  const pct = () => +$("arpct").value/100;
  function abInfo(){
    $("arab").setAttribute("aria-pressed", !!(cur.loop || cur.pick));
    $("arab").textContent = cur.loop && !cur.pick ? `A–B: ${cur.measOf[cur.loop.from] + 1}–${cur.measOf[cur.loop.to - 1] + 1} ✕` : "A–B";
    if(cur.pick === "A") say("", L("Döngünün ilk ölçüsündeki bir notaya dokun.", "Tap a note in the first bar of the loop."));
    else if(cur.pick === "B") say("", L("Şimdi son ölçüdeki bir notaya dokun.", "Now tap a note in the last bar."));
    else if(cur.loop) say("", L("Ölçü ", "Bars ") + (cur.measOf[cur.loop.from] + 1) + "–" + (cur.measOf[cur.loop.to - 1] + 1) + L(" tekrar tekrar çalar.", " will loop."));
    else say("", "");
    markLoop();
  }
  function markLoop(){
    $("arscore").querySelectorAll(".sn.inloop").forEach(g => g.classList.remove("inloop"));
    if(!cur.loop) return;
    for(let i = cur.loop.from; i < cur.loop.to; i++){ const g = cur.view.el(i); if(g) g.classList.add("inloop"); }
  }

  // Transpoze: perde perde (AEU Rast dizisinde) ve oktav; "klarnete sığdır" en çok notayı aralığa sokan oktavı seçer
  function applyTranspose(){
    let ns = cur.tr.steps ? transposeAll(cur.base, cur.tr.steps, "perde") : cur.base.map(n => ({ ...n }));
    const all = ns.map((_, i) => i), fit = x => x.filter(n => !n.rest && n.w >= LOW_NOTE && n.w <= HIGH_NOTE).length;
    let oct = cur.tr.oct;
    if(oct === "auto" || oct == null){ const c = [0, -1, 1].map(o => [o, fit(o ? shiftOctave(ns, all, o) : ns)]); oct = c.reduce((a, b) => b[1] > a[1] ? b : a)[0]; }
    if(oct) ns = shiftOctave(ns, all, oct);
    ns.forEach((n, i) => { if(cur.base[i].syl) n.syl = cur.base[i].syl; });
    cur.notes = ns; cur.oct = oct;
    const out = ns.filter(n => !n.rest && (n.w < LOW_NOTE || n.w > HIGH_NOTE)).length;
    const last = [...ns].reverse().find(n => !n.rest);
    cur.karar = last ? last.c : 0;
    $("artrinfo").textContent = (cur.tr.steps || oct ? L("Aktarıldı: ", "Transposed: ") + (cur.tr.steps ? (cur.tr.steps > 0 ? "+" : "−") + Math.abs(cur.tr.steps) + L(" perde", " perde") : "") + (oct ? (cur.tr.steps ? ", " : "") + (oct > 0 ? "+" : "−") + "1 " + L("oktav", "octave") : "") + ". " : "") +
      L("Karar perdesi: ", "Tonic: ") + perdeName(cur.karar) + (out ? L(" · aralık dışında " + out + " nota", " · " + out + " notes out of range") : "");
    // Ölçüler ve her notanın vuruş konumu (eşlik zamanlaması için)
    cur.ms = archMeasures(ns, cur.meters);
    cur.measOf = new Array(ns.length);
    cur.ms.forEach((m, k) => { for(let i = m.from; i < m.to; i++) cur.measOf[i] = k; });
    cur.beatAt = []; let b = 0; ns.forEach((n, i) => { cur.beatAt[i] = b; b += n.d; }); cur.beatAt[ns.length] = b;
    const piece = { id: "symbtr:" + cur.e.id, name: cur.e.t, notes: ns, tempo: cur.e.tp, meter: [cur.meters[0][1], cur.meters[0][2]],
                    makam: cur.tr.steps ? null : archMakam(cur.e.mk) };
    SK.setTempContext(piece.makam);
    cur.view = makeView();
    cur.player = piecePlayer(ctx, piece, $("arscore"), $("arfb"), res => { playLabel(false); learnResult(res); }, cur.view);
    renderSecs(); abInfo();
    if(S.dem) setDem(true);
  }
  const perdeName = c => { const p = nearestPerde(c); return p ? p.name : ""; };

  // Satırlı nota görünümü. Satırlar ölçü ölçü doldurulur, bölüm başında yeni satır başlar.
  function makeView(){
    let names = store.get("piece.names", true), curLine = null;
    const v = {
      draw(nm){ names = nm; render(); },
      cur(i){
        const box = $("arscore");
        box.querySelectorAll(".sn.cur").forEach(g => g.classList.remove("cur"));
        const g = v.el(i); if(!g) return;
        g.classList.add("cur");
        if(!S.follow) return;
        if(S.layout === "strip"){
          const xs = box.firstChild && box.firstChild._xs;
          if(xs) box.scrollTo({ left: Math.max(0, xs[i]*S.zoom - box.clientWidth/3), behavior:"smooth" });
        }else{
          const line = g.closest(".arline");
          if(line && line !== curLine){
            curLine = line;
            const r = line.getBoundingClientRect(), full = document.body.classList.contains("arfullbody");
            const pn = document.querySelector("#practice .pnav"), top = full || !pn ? 0 : Math.max(0, pn.getBoundingClientRect().bottom), bottom = full ? innerHeight : innerHeight - 90;
            if(r.top < top + 8 || r.bottom > bottom - 8) line.scrollIntoView({ block:"center", behavior:"smooth" });
          }
        }
      },
      mark(i, cls){ const g = v.el(i); if(g) g.classList.add(cls); },
      el: i => $("arscore").querySelector(`.sn[data-i="${i}"]`)
    };
    v.names = () => names;
    return v;
  }
  function render(){
    if(!cur || !cur.view) return;
    const box = $("arscore"), ns = cur.notes, names = cur.view.names(), lyr = S.lyr && cur.e.lyr;
    box.className = "arscore ar" + S.layout;
    const secAt = new Map(cur.raw.sections.map(([i, t]) => [i, t]));
    const meterAt = new Map(cur.meters.map(m => [m[0], m]));
    const common = { names, lyrics: lyr, zoom: S.zoom, base: 0 };
    const barSet = (from, to) => { const s = new Set(); cur.ms.forEach(m => { if(m.to > from && m.to <= to) s.add(m.to - 1 - from); }); return s; };
    if(S.layout === "strip"){
      const d = document.createElement("div"); d.className = "arline";
      const m0 = cur.meters[0];
      drawScore(d, ns, { ...common, meter: [m0[1], m0[2]], barAfter: barSet(0, ns.length) });
      box.replaceChildren(d);
    }else{
      const avail = Math.max(200, (box.clientWidth || P.clientWidth || 360) - 8)/S.zoom;
      const lines = []; let line = null, w = 0;
      cur.ms.forEach(m => {
        const ly = scoreLayout(ns.slice(m.from, m.to), { names, lyrics: lyr, base: 0, showMeter: false, barAfter: new Set() });
        const mw = ly.end - ly.start + 6;
        const newMeter = meterAt.has(m.from), sec = [...secAt.keys()].some(k => k >= m.from && k < m.to);
        const head = (newMeter || !line ? 46 : 34) + 14;
        if(!line || sec || newMeter || w + mw > avail){
          line = { from: m.from, to: m.to, meter: newMeter || !line ? m.meter : null }; lines.push(line); w = head + mw;
        }else{ line.to = m.to; w += mw; }
      });
      const frag = document.createDocumentFragment();
      lines.forEach((ln, k) => {
        const d = document.createElement("div"); d.className = "arline";
        const labels = [...secAt.entries()].filter(([i]) => i >= ln.from && i < ln.to).map(([, t]) => t);
        const slice = ns.slice(ln.from, ln.to);
        drawScore(d, slice, { ...common, lyrics: lyr && slice.some(n => n.syl), base: ln.from, barAfter: barSet(ln.from, ln.to), meter: ln.meter ? [ln.meter[1], ln.meter[2]] : [4, 4],
          showMeter: !!ln.meter, label: labels.join(" · ") || null, width: avail, fit: true, stretch: k < lines.length - 1, open: k < lines.length - 1 });
        frag.appendChild(d);
      });
      box.replaceChildren(frag);
    }
    markLoop();
  }
  // Bölüm ve cümle düğmeleri: dokununca o kısım tekrar tekrar çalar
  function renderSecs(){
    const secs = cur.raw.sections, N = cur.notes.length;
    let h = secs.map(([i, t], k) => `<button type="button" class="chipbtn" data-from="${i}" data-to="${k + 1 < secs.length ? secs[k + 1][0] : N}">${esc(t.toLocaleLowerCase("tr").replace(/(^|\s)\S/g, c => c.toLocaleUpperCase("tr")))}</button>`).join("");
    if(S.phr && cur.raw.phrases.length){
      const ph = [0, ...cur.raw.phrases.filter(i => i > 0 && i < N)];
      h += `<span class="arphl">${L("Cümleler:", "Phrases:")}</span>` + ph.map((i, k) => `<button type="button" class="chipbtn small" data-from="${i}" data-to="${k + 1 < ph.length ? ph[k + 1] : N}">${k + 1}</button>`).join("");
    }
    $("arphr").parentElement.hidden = !cur.raw.phrases.length;
    $("arsecs").innerHTML = h;
    $("arsecs").hidden = !h;
  }

  // ---- Çalma ve eşlik ----
  let listening = false, accTimer = null;
  function play(o = {}){
    if(!cur) return;
    stopAll();
    const from = cur.loop ? cur.loop.from : (o.from != null ? o.from : cur.startAt), to = cur.loop ? cur.loop.to : (o.to != null ? o.to : cur.notes.length);
    const p = o.pct || pct(), acc = o.acc || S.acc, mute = o.mute != null ? o.mute : S.mute;
    listening = true; playLabel(true);
    cur.player.listen(p, { from, to, loop: o.loop != null ? o.loop : !!cur.loop, mute,
      onStart: (t0, beatMs) => startAcc(acc, t0, beatMs, from, to),
      onEnd: () => { listening = false; stopAcc(); playLabel(false); if(o.onEnd) o.onEnd(); } });
  }
  function stopAll(){
    listening = false; stopAcc();
    if(cur) cur.stepToken = null;
    if(cur && cur.player) cur.player.stop();
    SK.stopSound();
    playLabel(false);
  }
  function playLabel(on){
    const t = on ? L("■ Durdur", "■ Stop") : L("▶ Çal", "▶ Play");
    ["arplay", "arfab"].forEach(id => { const b = $(id); if(b) b.textContent = t; });
  }
  // Eşlik vuruşları ses saatine kurulur (25 ms'de bir, 150 ms ileriye)
  function startAcc(kind, t0, beatMs, from, to){
    stopAcc();
    if(kind === "off") return;
    const a = SK.audioCtx(), strokes = [], b0 = cur.beatAt[from], b1 = cur.beatAt[to];
    cur.ms.forEach(m => {
      const mb = cur.beatAt[m.from], me = cur.beatAt[m.to];
      if(me <= b0 || mb >= b1) return;
      const [, num, den, uname] = m.meter;
      const pat = kind === "usul" ? archUsul(archFold(uname).replace(/[^a-z]/g, "") || cur.e.u, num, den) : Array.from({ length: num }, (_, i) => [i === 0 ? "D" : "T", 1]);
      let pos = mb;
      pat.forEach(([k, u]) => { if(pos >= b0 - 1e-6 && pos < b1 - 1e-6) strokes.push({ t: (pos - b0)*beatMs, k, v: k === "D" ? 1 : 0.6 }); pos += u*4/den; });
    });
    let next = 0;
    accTimer = setInterval(() => {
      const now = performance.now();
      while(next < strokes.length && t0 + strokes[next].t < now + 150){
        const s = strokes[next++], at = a.currentTime + Math.max(0, (t0 + s.t - now)/1000);
        ctx.hit(a, s.k, at, s.v*0.8);
      }
      if(next >= strokes.length){ clearInterval(accTimer); accTimer = null; }
    }, 25);
  }
  function stopAcc(){ if(accTimer){ clearInterval(accTimer); accTimer = null; } }
  // Dem: karar perdesinde dron (dron aralığına oktavla taşınır)
  function setDem(on){
    S.dem = on;
    const b = $("ardem"); if(b) b.setAttribute("aria-pressed", on);
    if(on){ let c = cur.karar; while(c > 62) c -= 53; while(c < -22) c += 53; const p = nearestPerde(c); ctx.droneOn(p ? p.comma : c); }
    else ctx.droneOff();
  }
  function setFull(on){
    document.body.classList.toggle("arfullbody", on);
    $("arfull").setAttribute("aria-pressed", on);
    $("arfull").textContent = on ? L("✕ Tam ekrandan çık", "✕ Exit full screen") : L("⛶ Tam ekran", "⛶ Full screen");
    render();
  }
  document.addEventListener("keydown", ev => {
    if(!cur || $("arpiece").hidden || P.hidden || document.body.dataset.view !== "practice") return;
    if(ev.key === "Escape" && document.body.classList.contains("arfullbody")){ setFull(false); return; }
    if(ev.key === " " && !ev.target.closest("input, select, textarea, button, a, summary")){ ev.preventDefault(); listening ? stopAll() : play(); }
  });
  let rz = null;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if(cur && !$("arpiece").hidden && S.layout === "page") render(); }, 200); });

  // ---- Eseri öğren: yedi adım ----
  const STEPS = [
    [L("Dinle", "Listen"), L("Eseri baştan sona asıl temposunda dinle.", "Listen to the whole piece at its own tempo.")],
    [L("Yavaş dinle", "Listen slowly"), L("Yarı hızda dinle; ezgiyi ve süslemeleri ayırt et.", "Listen at half speed; pick out the melody and ornaments.")],
    [L("Usulü dinle", "Hear the usul"), L("Melodi susar, ilk dört ölçüde yalnız usul vurulur; düm ve tekleri say.", "The melody is silent; the usul plays for four bars. Count the düms and teks.")],
    [L("Diziyi dinle", "Hear the scale"), L("Eserde geçen perdeler kararından çıkıcı ve inici çalınır.", "The perdes of the piece are played up and down from the tonic.")],
    [L("Karar sesi", "The tonic"), L("Dem açılır, eserin bittiği perde üç kez çalar.", "The drone starts and the final perde plays three times.")],
    [L("Notayı takip et", "Follow the score"), L("%75 hızda çalar; imleci notada izle. Zor ölçüyü A–B ile tekrarla.", "Plays at 75%; follow the cursor. Loop a hard bar with A–B.")],
    [L("Kendin çal", "Play it yourself"), L("Mikrofonu aç, %75 tempoda metronomla çal; doğru nota %60'ı geçince adım tamam.", "Turn on the mic and play at 75% with the metronome; done at 60% correct notes.")]
  ];
  const learnDone = () => new Set((store.get("arch.learn", {})[cur.e.id]) || []);
  function markStep(k){
    const all = store.get("arch.learn", {}), s = new Set(all[cur.e.id] || []); s.add(k); all[cur.e.id] = [...s]; store.set("arch.learn", all);
    buildLearn(true);
  }
  function buildLearn(keepOpen){
    const done = learnDone();
    $("arlearnsum").textContent = L("Eseri öğren · ", "Learn the piece · ") + done.size + "/7 " + L("adım", "steps");
    $("arsteps").innerHTML = STEPS.map(([t, d], k) => `<li class="${done.has(k) ? "done" : ""}"><span><b>${t}</b><small>${d}</small></span>
      <button type="button" class="stopbtn small" data-step="${k}">${done.has(k) ? "✓ " : ""}${L("Başla", "Start")}</button></li>`).join("");
    if(!keepOpen) $("arsteps").onclick = ev => { const b = ev.target.closest("[data-step]"); if(b) runStep(+b.dataset.step); };
  }
  async function runStep(k){
    stopAll(); cur.loop = null; abInfo();
    const N = cur.notes.length;
    if(k === 0) play({ from:0, to:N, pct:1, loop:false, onEnd: () => markStep(0) });
    else if(k === 1) play({ from:0, to:N, pct:0.5, loop:false, onEnd: () => markStep(1) });
    else if(k === 2){ const to = cur.ms[Math.min(3, cur.ms.length - 1)].to; play({ from:0, to, pct:1, loop:false, mute:true, acc:"usul", onEnd: () => markStep(2) }); }
    else if(k === 3){
      // Eserdeki perdeler, kararın oktavında, sıralı
      const k0 = cur.karar, set = new Set();
      cur.notes.forEach(n => { if(!n.rest && n.c !== null){ let c = n.c; while(c < k0) c += 53; while(c >= k0 + 53) c -= 53; set.add(c); } });
      const up = [...set].sort((a, b) => a - b).concat(k0 + 53), seq = up.concat(up.slice(0, -1).reverse());
      say("", seq.map(perdeName).join(" · "));
      const token = cur.stepToken = {};
      for(const c of seq){ if(cur.stepToken !== token) return; SK.play(Math.round(67 + c*12/53), ctx.commaFreq(c)); await ctx.sleep(420); SK.stopSound(); await ctx.sleep(60); }
      markStep(3);
    }else if(k === 4){
      setDem(true);
      const token = cur.stepToken = {};
      for(let r = 0; r < 3; r++){ if(cur.stepToken !== token) return; SK.play(Math.round(67 + cur.karar*12/53), ctx.commaFreq(cur.karar)); await ctx.sleep(900); SK.stopSound(); await ctx.sleep(300); }
      say("", L("Karar perdesi: ", "Tonic: ") + perdeName(cur.karar)); markStep(4);
    }else if(k === 5){ if(!S.follow){ save("follow", true); $("arfol").checked = true; } play({ from:0, to:N, pct:0.75, loop:false, onEnd: () => markStep(5) }); }
    else if(k === 6){ cur.learnStep = 6; $("arpct").value = 75; $("arpctv").textContent = "%75"; cur.player.startTempo(0.75); playLabel(true); }
  }
  function learnResult(res){
    if(cur && cur.learnStep === 6 && res.mode === "tempo"){ cur.learnStep = null; if(res.v >= 60) markStep(6); }
  }

  // Alt menüdeki Notalar düğmesi ve dışarıdan açma: SK.openArchive(id?)
  SK.openArchive = id => { ctx.selectTab("archive"); if(id) loadIndex().then(() => openPiece(id)); };
  return {
    enter(){
      loadIndex().then(() => { if(!cur) renderList(); }).catch(() => { $("arcount").textContent = L("Arşiv açılamadı.", "Couldn't open the archive."); });
      if(cur) SK.setTempContext(cur.tr.steps ? null : archMakam(cur.e.mk));
    },
    leave(){ stopAll(); if(cur && cur.stepToken) cur.stepToken = null; if(S.dem) setDem(false); document.body.classList.remove("arfullbody"); SK.setTempContext(null); },
    note(r, t){ if(cur && cur.player) cur.player.note(r, t); },
    silence(t){ if(cur && cur.player) cur.player.silence(t); }
  };
};
