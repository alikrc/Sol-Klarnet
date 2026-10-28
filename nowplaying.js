// "Şu an çalıyor" çubuğu: başka sayfaya geçince süren ses (alıştırma, metronom, dron, şeritteki nota) alt menünün
// üstünde bir satır olarak görünür. Satıra dokununca çalan yere dönülür, ■ yalnız o sesi durdurur. Kaynak ekranda
// açıksa satır gösterilmez. Üst çubuktaki Durdur düğmesi bir şey çaldığı sürece görünür ve hepsini durdurur.
// Kaynaklar SK.addSource ile app.js ve practice.js'ten gelir.
(function(){
  const SK = window.SK;
  if(!SK) return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const bar = $("npbar"), stopAllBtn = $("stopall");
  stopAllBtn.setAttribute("aria-label", L("Bütün sesleri durdur", "Stop all sound"));
  stopAllBtn.title = L("Bütün sesleri durdur (Esc)", "Stop all sound (Esc)");
  bar.setAttribute("aria-label", L("Şu an çalıyor", "Now playing"));
  stopAllBtn.addEventListener("click", () => { SK.stopAll(); tick(); });

  let shown = [], sig = "";
  function tick(){
    const all = SK.sources();
    stopAllBtn.hidden = !all.length;
    shown = all.filter(s => !s.here);
    const next = shown.map(s => s.key + "|" + s.title + "|" + s.sub).join("\n");
    if(next === sig) return;
    sig = next;
    bar.hidden = !shown.length;
    document.body.classList.toggle("npon", shown.length > 0);
    bar.innerHTML = shown.map((s, i) => `<div class="nprow">
      <button type="button" class="npgo" data-go="${i}" aria-label="${esc(s.title + (s.sub ? ", " + s.sub : "") + " — " + L("çalan yere git", "go to what's playing"))}">
        <span class="npeq" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="nptx"><b>${esc(s.title)}</b>${s.sub ? `<small>${esc(s.sub)}</small>` : ""}</span>
        <span class="npto" aria-hidden="true">${L("Git", "Open")} ›</span>
      </button>
      <button type="button" class="npstop" data-stop="${i}" aria-label="${esc(L("Durdur: ", "Stop: ") + s.title)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg></button>
    </div>`).join("");
  }
  bar.addEventListener("click", e => {
    const g = e.target.closest("[data-go]"), s = e.target.closest("[data-stop]");
    if(g && shown[+g.dataset.go]) shown[+g.dataset.go].go();
    else if(s && shown[+s.dataset.stop]) shown[+s.dataset.stop].stop();
    else return;
    tick();
  });
  setInterval(tick, 250);
})();
