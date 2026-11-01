// Ekipmanım (Ayarlar): bek ve kamışlar. Etkin kamışla çalınan süre sayılır (mikrofon açıkken perdesi duyulan ses);
// kamış belirlenen ömrü geçince bir kez hatırlatılır. Veri sk.equip anahtarında, yedeğe kendiliğinden girer.
(function(){
  const $ = id => document.getElementById(id);
  const store = SK.store;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c]);
  const eq = Object.assign({ reeds:[], active:null, mouth:"", limitH:25, warned:{} }, store.get("equip", {}));
  if(!(eq.limitH >= 5 && eq.limitH <= 200)) eq.limitH = 25;
  const save = () => store.set("equip", eq);
  const activeReed = () => eq.reeds.find(r => r.id === eq.active) || null;

  const grp = document.createElement("div");
  grp.className = "sgroup"; grp.id = "equipgrp";
  grp.innerHTML = `
    <span class="label"><i class="semo" aria-hidden="true">🎷</i>${L("Ekipmanım", "My gear")}</span>
    <div class="settings">
      <div class="srow">
        <label class="label" for="eqmouth">${L("Bek", "Mouthpiece")}</label>
        <input id="eqmouth" type="text" maxlength="60" placeholder="${L("ör. Remsey Star Player", "e.g. Remsey Star Player")}">
      </div>
      <div class="srow block">
        <span class="label">${L("Kamışlar", "Reeds")}</span>
        <div class="eqlist" id="eqlist"></div>
        <span class="trow eqadd">
          <input id="eqname" type="text" maxlength="40" placeholder="${L("ör. Blue 1,5", "e.g. Blue 1.5")}" aria-label="${L("Yeni kamışın adı ya da numarası", "New reed's name or strength")}">
          <button class="stopbtn" id="eqaddbtn" type="button">${L("Kamış ekle", "Add reed")}</button>
        </span>
        <div class="hint">${L("Seçili kamışla çalınan süre sayılır (mikrofon açıkken perdesi duyulan her an). Tını matlaşınca, ses zor çıkınca ya da tizler kapanınca kamışın notuna yaz; hangi kamışın iyi gittiğini sonra karşılaştırırsın.", "Time played on the selected reed is counted (every moment with a pitch while the microphone is on). When the tone goes dull, notes get hard to start or the high register closes up, write it in the reed's note so you can compare reeds later.")}</div>
      </div>
      <div class="srow">
        <label class="label" for="eqlimit">${L("Kamış ömrü", "Reed life")}</label>
        <span class="tnum"><input id="eqlimit" type="number" min="5" max="200" step="5" inputmode="numeric"> <em>${L("saat", "hours")}</em></span>
        <div class="hint">${L("Seçili kamış bu süreyi geçince bir kez hatırlatılır. Kamış ömrü çalış biçimine ve kamışa göre çok değişir; kendi kamışlarının sürelerine bakıp ayarla.", "You get one reminder when the selected reed passes this time. Reed life varies a lot with the reed and how you play; adjust it from your own reeds' times.")}</div>
      </div>
    </div>`;
  const after = $("goalmin").closest(".sgroup");
  after.parentNode.insertBefore(grp, after.nextSibling);

  const fmtT = sec => { const m = Math.floor(sec/60); return m < 60 ? m + L(" dk", " min") : Math.floor(m/60) + L(" sa ", " h ") + (m % 60) + L(" dk", " min"); };
  const daysSince = d => Math.max(0, Math.floor((Date.now() - new Date(d + "T00:00:00").getTime())/864e5));
  function paint(){
    const list = $("eqlist");
    if(!eq.reeds.length){ list.innerHTML = `<p class="muted small">${L("Henüz kamış eklenmedi.", "No reeds added yet.")}</p>`; return; }
    list.innerHTML = eq.reeds.map(r => {
      const old = r.sec >= eq.limitH*3600;
      return `<div class="eqreed${r.id === eq.active ? " on" : ""}${old ? " old" : ""}" data-id="${r.id}">
        <label class="eqpick"><input type="radio" name="eqreed" value="${r.id}"${r.id === eq.active ? " checked" : ""}>
          <b>${esc(r.name)}</b></label>
        <span class="eqstat">${fmtT(r.sec)} · ${L(daysSince(r.start) + " gündür", daysSince(r.start) + " days")}${old ? " · " + L("ömrünü doldurdu", "past its life") : ""}</span>
        <button type="button" class="linkbtn eqdel" aria-label="${L("Kamışı sil: ", "Delete reed: ") + esc(r.name)}">${L("Sil", "Delete")}</button>
        <input type="text" class="eqnote" maxlength="120" value="${esc(r.note || "")}" placeholder="${L("Not: tını, sertlik, nasıl gidiyor…", "Note: tone, resistance, how it plays…")}" aria-label="${L("Kamış notu", "Reed note")}">
      </div>`;
    }).join("");
  }
  $("eqmouth").value = eq.mouth || "";
  $("eqmouth").addEventListener("change", () => { eq.mouth = $("eqmouth").value.trim(); save(); });
  $("eqlimit").value = eq.limitH;
  $("eqlimit").addEventListener("change", () => {
    const v = Math.round(+$("eqlimit").value);
    eq.limitH = v >= 5 && v <= 200 ? v : 25; $("eqlimit").value = eq.limitH; eq.warned = {}; save(); paint();
  });
  function addReed(){
    const name = $("eqname").value.trim();
    if(!name){ $("eqname").focus(); return; }
    const r = { id: Date.now().toString(36), name, start: dayKey(new Date()), sec: 0, note: "" };
    eq.reeds.unshift(r); eq.active = r.id; $("eqname").value = ""; save(); paint();
  }
  $("eqaddbtn").addEventListener("click", addReed);
  $("eqname").addEventListener("keydown", e => { if(e.key === "Enter") addReed(); });
  $("eqlist").addEventListener("change", e => {
    const row = e.target.closest(".eqreed"); if(!row) return;
    const r = eq.reeds.find(x => x.id === row.dataset.id); if(!r) return;
    if(e.target.name === "eqreed"){ eq.active = r.id; save(); paint(); }
    else if(e.target.classList.contains("eqnote")){ r.note = e.target.value.trim(); save(); }
  });
  $("eqlist").addEventListener("click", e => {
    if(!e.target.classList.contains("eqdel")) return;
    const row = e.target.closest(".eqreed"), r = eq.reeds.find(x => x.id === row.dataset.id);
    if(!r || !confirm(L("“" + r.name + "” silinsin mi?", "Delete “" + r.name + "”?"))) return;
    eq.reeds = eq.reeds.filter(x => x !== r);
    if(eq.active === r.id) eq.active = eq.reeds.length ? eq.reeds[0].id : null;
    save(); paint();
  });
  paint();

  // Süre sayımı: ölçümler 40 ms arayla gelir; perdesi duyulan aralıklar eklenir (uzun boşluklar sayılmaz)
  let lastT = 0, unsaved = 0;
  SK.level(d => {
    const dt = d.t - lastT; lastT = d.t;
    const r = activeReed();
    if(!r || !d.on || !(dt > 0 && dt < 200)) return;
    r.sec += dt/1000; unsaved += dt;
    if(unsaved > 10000){ unsaved = 0; save(); }
    if(r.sec >= eq.limitH*3600 && !eq.warned[r.id]){
      eq.warned[r.id] = true; save();
      SK.notice(L("“" + r.name + "” kamışıyla " + eq.limitH + " saati geçtin. Tını matlaştıysa değiştirme vakti gelmiş olabilir.",
        "You've played “" + r.name + "” for over " + eq.limitH + " hours. If the tone has gone dull it may be time to change it."));
    }
  });
  window.addEventListener("pagehide", () => { if(unsaved && !window.SK_RESETTING) save(); });
  document.addEventListener("visibilitychange", () => { if(document.hidden && !window.SK_RESETTING){ save(); paint(); } });
  // Ayarlar her açıldığında süreler güncel görünsün
  SK.on("view", e => { if(e.v === "settings") paint(); });
})();
