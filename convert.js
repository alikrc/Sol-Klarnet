// Çevir: PDF, resim ya da sesten esere. Okunan notalar düzeltme ekranında çip şeridi, metin ve dizek olarak görünür;
// öğrenci düzeltir, dinler ve "Kendi eserlerim"e kaydeder. Ses: dosya ya da "Dinleyerek yaz" (mikrofon, en çok 3 dk);
// 22 050 Hz tek kanala indirilir, 5 sn'lik parçalarla çözülür (her parça ~0,1 sn; arada ara verilir, arayüz donmaz).
// Mantık skills.js (audioNotes, joinAudioChunk, tuningOffset, quantizeRun) ve repertoire.js'te (düzeltme işlemleri).
// Dışa: SK.openConvert(job) — job: { notes, tempo?, meter?, name?, makam?, kind:"audio"|"image", turkish?, pages?, marks?,
// flags?, source?, raw?, offset?, manual? } (raw/offset: ses işinde tempo değişince yeniden ızgaraya oturtmak için;
// pages: [{ url, width, height }] kaynak görünümü; manual: okunamadı, resme bakarak yaz). imagesToPages / pdfToPages / filesToPages: dosya → okuyucu sayfaları.
// Resim okuma omrworker.js'te (omr.js), Worker yalnızca resim seçilince açılır.
// Nota bul (en üstte): neyzen.com dizini ve projetsm.com araması (sources.js); ağa yalnızca httpGet çıkar.

// Kaydedilmemiş iş oturum boyunca burada durur: sekmeye dönünce yerinde
let cvState = null, cvJobSeq = 0;
const CV_SR = 22050, CV_MAX_SEC = 180, CV_CHUNK_SEC = 5, CV_OV_MS = 50, CV_MAX_MB = 60;
const CV_METERS = [[2,4],[3,4],[4,4],[5,8],[6,8],[7,8],[9,8],[10,8],[12,8]];
const CV_MAX_PX = 3000, CV_PREVIEW_PX = 2000, CV_MANUAL_CONF = 0.5;

// Tuval → okuyucu sayfası: gri ton (Uint8, 1 kanal) ve küçültülmüş önizleme (objectURL). PDF de bunu kullanır.
async function canvasToPage(cv){
  const { width, height } = cv, rgba = cv.getContext("2d").getImageData(0, 0, width, height).data, data = new Uint8Array(width*height);
  for(let i=0, j=0; i<data.length; i++, j+=4) data[i] = (rgba[j]*77 + rgba[j+1]*150 + rgba[j+2]*29) >> 8;
  const k = Math.min(1, CV_PREVIEW_PX/Math.max(width, height)), pv = document.createElement("canvas");
  pv.width = Math.max(1, Math.round(width*k)); pv.height = Math.max(1, Math.round(height*k));
  pv.getContext("2d").drawImage(cv, 0, 0, pv.width, pv.height);
  const blob = await new Promise(r => pv.toBlob(r, "image/jpeg", 0.85));
  return { data, width, height, url: blob ? URL.createObjectURL(blob) : pv.toDataURL("image/jpeg", 0.85) };
}
// Resim dosyaları → [{ data, width, height, url }]; en uzun kenar 3000 px'e sınırlanır, saydam yer beyaz sayılır.
// Hata olursa o ana kadar açılan önizleme adresleri bırakılır (sızmaz)
async function imagesToPages(files, out = []){
  const first = out.length;
  try{
    for(const f of files){
      const src = URL.createObjectURL(f);
      try{
        const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error(f.name)); im.src = src; });
        const k = Math.min(1, CV_MAX_PX/Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement("canvas");
        cv.width = Math.max(1, Math.round(img.naturalWidth*k)); cv.height = Math.max(1, Math.round(img.naturalHeight*k));
        const g = cv.getContext("2d", { willReadFrequently: true });
        g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
        g.drawImage(img, 0, 0, cv.width, cv.height);
        out.push(await canvasToPage(cv));
      } finally { URL.revokeObjectURL(src); }
    }
  }catch(e){ out.splice(first).forEach(p => URL.revokeObjectURL(p.url)); throw e; }
  return out;
}
// PDF → sayfalar: pdf.js yalnızca burada import() ile yüklenir (açılış süresi değişmez). Sayfa 2480 px genişliğe
// (A4, 300 dpi) çizilir. Boş parolayla şifreli PDF sorunsuz açılır; parolalı olanda e.password = true.
// opts: { ask(n) → Promise<[from,to]|null> (range verilmemişse ve n > 1 ise), isStale(), out }; sayfa arasında isStale
// bakılır, iptalde "iptal" fırlatılır ve o ana kadarki önizlemeler bırakılır
const CV_PDF_W = 2480;
async function pdfToPages(file, range, opts = {}){
  const out = opts.out || [], first = out.length, stale = opts.isStale || (() => false);
  let pdf = null;
  try{
    const pdfjs = await import("./vendor/pdfjs/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", location.href).href;
    try{ pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; }
    catch(e){ if(e && e.name === "PasswordException"){ const pe = new Error("parola"); pe.password = true; throw pe; } throw e; }
    if(stale()) throw new Error("iptal");
    let from = 1, to = pdf.numPages;
    if(range) { from = Math.max(1, Math.min(range[0], to)); to = Math.max(from, Math.min(range[1], to)); }
    else if(to > 1 && opts.ask){
      const r = await opts.ask(to);
      if(!r || stale()) throw new Error("iptal");
      from = r[0]; to = r[1];
    }
    for(let n=from; n<=to; n++){
      if(stale()) throw new Error("iptal");
      if(opts.onPage) opts.onPage(n - from + 1, to - from + 1);
      const pg = await pdf.getPage(n), v0 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: CV_PDF_W/v0.width });
      const cv = document.createElement("canvas");
      cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      const g = cv.getContext("2d", { willReadFrequently: true });
      g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
      // intent "print": requestAnimationFrame beklemez (arka plandaki sekmede de ilerler), açıklama/form katmanı çizmez
      await pg.render({ canvasContext: g, viewport: vp, intent: "print" }).promise;
      pg.cleanup();
      if(stale()) throw new Error("iptal");
      out.push(await canvasToPage(cv));
      cv.width = cv.height = 0;   // bellek hemen serbest
    }
  }catch(e){ out.splice(first).forEach(p => URL.revokeObjectURL(p.url)); throw e; }
  finally{ if(pdf) pdf.destroy(); }
  return out;
}
// Karışık seçim (PDF + resim): seçilen sırayla tek sayfa listesine; bitişik resimler birlikte açılır
async function filesToPages(files, opts = {}){
  const out = [];
  try{
    for(let i=0; i<files.length;){
      if(opts.isStale && opts.isStale()) throw new Error("iptal");
      const f = files[i];
      if(f.type === "application/pdf" || /.pdf$/i.test(f.name)){ await pdfToPages(f, null, Object.assign({}, opts, { out })); i++; }
      else { let j = i; while(j < files.length && !(files[j].type === "application/pdf" || /.pdf$/i.test(files[j].name))) j++; await imagesToPages(files.slice(i, j), out); i = j; }
    }
  }catch(e){ out.forEach(p => URL.revokeObjectURL(p.url)); throw e; }
  return out;
}
// ---- Ağ: dışarıya giden bütün http(s) istekleri buradan çıkar (yalnızca Nota bul; arama sözcüğü ve dosya adresi gider) ----
// Yerelde CapacitorHttp (tarayıcının CORS sınırına takılmaz); web sürümünde yok (e.web). 2xx dışı yanıt hata fırlatır
// (e.status), bağlantı kurulamazsa e.net. Tarayıcı panelinde denemek için ?debug ile SKDEBUG.httpGet sahteyle değiştirilir.
const httpNative = () => { const C = window.Capacitor; return (C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.CapacitorHttp) || null; };
const httpReady = () => !!((window.SKDEBUG && window.SKDEBUG.httpGet) || httpNative());
async function httpGet(url, opts = {}){
  const fake = window.SKDEBUG && window.SKDEBUG.httpGet;
  if(fake) return fake(url, opts);
  const H = httpNative();
  if(!H){ const e = new Error("web"); e.web = true; throw e; }
  let r;
  try{ r = await H.get({ url, headers: opts.headers || {}, responseType: opts.binary ? "blob" : "text", connectTimeout: 15000, readTimeout: 30000 }); }
  catch(e){ const x = new Error((e && e.message) || "ağ"); x.net = true; throw x; }
  if(!(r.status >= 200 && r.status < 300)){ const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  if(!opts.binary) return typeof r.data === "string" ? r.data : JSON.stringify(r.data);
  if(r.data instanceof Blob) return r.data;
  // Yerel katman ikili yanıtı base64 metin olarak verir
  const h = r.headers || {}, ck = Object.keys(h).find(k => k.toLowerCase() === "content-type");
  const bin = atob(String(r.data || "")), u8 = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: ck ? String(h[ck]).split(";")[0].trim() : "" });
}
// Nota bul neyzen dizini: ayrı IndexedDB veritabanı (yedeğe girmez, localStorage kotasını kullanmaz). get/set anahtar → değer
const NZDB = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open("sol-klarnet-notabul", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result); r.onerror = () => { dbp = null; rej(r.error); };
  }));
  const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => {
    const t = db.transaction("kv", mode), r = fn(t.objectStore("kv"));
    t.oncomplete = () => res(r.result); t.onerror = t.onabort = () => rej(t.error || new Error("IndexedDB"));
  }); };
  return { get: k => tx("readonly", s => s.get(k)), set: (k, v) => tx("readwrite", s => s.put(v, k)) };
})();
// Blob → telefona kaydet / paylaş (drills.js kayıt paylaşımıyla aynı yol); birden çok dosya tek paylaşımda
async function cvSaveBlobs(items, title){
  const P = window.Capacitor && window.Capacitor.Plugins;
  if(P && P.Filesystem && P.Share){
    const uris = [];
    for(const { blob, name } of items){
      const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
      uris.push((await P.Filesystem.writeFile({ path:name, data:b64, directory:"CACHE" })).uri);
    }
    await P.Share.share(uris.length === 1 ? { title, url:uris[0], dialogTitle:title } : { title, files:uris, dialogTitle:title });
    return;
  }
  for(const { blob, name } of items){
    const u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 10000);
  }
}

// Dosya adından eser adı önerisi: uzantı ve "_" atılır, ilk iki sözcük büyük harfle ("hicaz_longa_aydin…" → "Hicaz Longa")
const cvNameOf = file => file.replace(/\.[^.]+$/, "").replace(/[_\-.]+/g, " ").trim().split(/\s+/).slice(0, 2)
  .map(w => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1)).join(" ");

TRAINERS.convert = function(ctx){
  const { SK, $, store, esc, nn, sleep } = ctx;
  const P = $("pp-convert");
  P.innerHTML = `
    <p class="pdesc">${L("Bir notayı ya da kaydı esere çevir. Okunan notalar aşağıda çip olarak görünür; dokunup düzelt, Dinle ile kontrol et ve kaydet. Okuma telefonda yapılır, dosyalar ve ses cihazdan çıkmaz.",
      "Turn a score or a recording into a piece. The notes read appear below as chips; tap to correct them, check with Listen and save. Reading happens on the phone; files and audio never leave the device.")}</p>
    <div class="cvfind" id="cvfind">
      <div class="pbar">
        <input id="cvq" type="search" placeholder="${L("Nota bul: eser, besteci, makam…", "Find a score: piece, composer, makam…")}" aria-label="${L("Nota bul", "Find a score")}" autocomplete="off" enterkeyhint="search">
        <button class="primary small" id="cvqgo" type="button">${L("Ara", "Search")}</button>
      </div>
      <div class="pbar">
        <select id="cvqsrc" aria-label="${L("Kaynak", "Source")}"><option value="">${L("Bütün kaynaklar", "All sources")}</option>${Object.keys(SOURCES).filter(k => SOURCES[k].enabled).map(k => `<option value="${k}">${k}.com</option>`).join("")}</select>
        <select id="cvqmk" aria-label="Makam"><option value="">${L("Bütün makamlar", "All makams")}</option>${MAKAMS.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}</select>
        ${SOURCES.neyzen.enabled ? `<button class="stopbtn" id="cvqidx" type="button">${L("Dizini yenile", "Refresh the index")}</button>` : ""}
      </div>
      <div class="fb" id="cvqmsg" aria-live="polite"></div>
      <div class="cvres" id="cvres"></div>
      <div class="cvprev" id="cvprev" hidden>
        <div class="cvprevhead" id="cvprevhead"></div>
        <div class="fb" id="cvprevmsg" aria-live="polite"></div>
        <div class="cvprevpages" id="cvprevpages"></div>
        <div class="pbar">
          <button class="primary small" id="cvpconv" type="button" disabled>${L("Çevir", "Convert")}</button>
          <button class="stopbtn" id="cvpsave" type="button" disabled>${L("Dosyayı kaydet", "Save the file")}</button>
          <button class="stopbtn" id="cvpclose" type="button">${L("Kapat", "Close")}</button>
        </div>
      </div>
    </div>
    <div class="pbar">
      <button class="stopbtn" id="cvimg" type="button">${L("PDF ya da resim seç", "Choose a PDF or picture")}</button>
      <button class="stopbtn" id="cvaud" type="button">${L("Ses dosyası seç", "Choose an audio file")}</button>
      <input type="file" id="cvfile" accept="audio/*" hidden>
      <input type="file" id="cvpic" accept="image/*,application/pdf" multiple hidden>
      <button class="primary small" id="cvlisten" type="button">${L("Dinleyerek yaz", "Write by ear")}</button>
      <span class="ltclock small" id="cvclock"></span>
    </div>
    <div class="fb" id="cvprog" aria-live="polite"></div>
    <div class="pbar" id="cvrange" hidden></div>
    <div class="cvedit" id="cvedit" hidden>
      <div class="pbar">
        <select id="cvkind" aria-label="${L("Nota türü", "Score type")}">
          <option value="tr">${L("Türk müziği notası (olduğu gibi)", "Turkish music score (as is)")}</option>
          <option value="concert">${L("Piyano / konser notası (", "Piano / concert score (transpose for ") + esc(SK.inst.name) + L(" için çevir)", ")")}</option></select>
        <select id="cvmk" aria-label="Makam"><option value="">${L("Makam yok", "No makam")}</option>${MAKAMS.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}</select>
        <label class="tnum">♩ <input id="cvtempo" type="number" min="30" max="240" aria-label="Tempo"></label>
        <select id="cvmeter" aria-label="${L("Ölçü", "Time signature")}"></select>
        <label class="chk"><input type="checkbox" id="cvexpand"> ${L("Tekrarları aç", "Expand repeats")}</label>
      </div>
      <div class="cvsrcwrap" id="cvsrcwrap" hidden>
        <div class="cvsrc" id="cvsrc"><div class="cvpages" id="cvpages"></div></div>
        <div class="cvzoom">
          <button class="stopbtn" type="button" data-z="-1" aria-label="${L("Uzaklaştır", "Zoom out")}">−</button>
          <button class="stopbtn" type="button" data-z="1" aria-label="${L("Yakınlaştır", "Zoom in")}">+</button>
        </div>
      </div>
      <div class="muted small" id="cvinfo"></div>
      <div class="pbar cvadd" id="cvadd" hidden>
        <span class="muted small">${L("Yeni nota:", "New note:")}</span>
        <button class="stopbtn" type="button" data-add="1" aria-label="${L("Bir basamak yukarısını ekle", "Add one step higher")}">+ ▲</button>
        <button class="stopbtn" type="button" data-add="0" aria-label="${L("Aynısını ekle", "Add the same")}">+ =</button>
        <button class="stopbtn" type="button" data-add="-1" aria-label="${L("Bir basamak aşağısını ekle", "Add one step lower")}">+ ▼</button>
        <button class="stopbtn" type="button" data-adur="0.5" aria-label="${L("Süreyi yarıya indir", "Halve the duration")}">½×</button>
        <button class="stopbtn" type="button" data-adur="2" aria-label="${L("Süreyi iki katına çıkar", "Double the duration")}">2×</button>
      </div>
      <div class="cvchips" id="cvchips" aria-label="${L("Okunan notalar", "Notes read")}"></div>
      <div class="pbar cvtools" id="cvtools">
        <button class="stopbtn" type="button" data-op="up" aria-label="${L("Bir basamak yukarı", "One step up")}">▲</button>
        <button class="stopbtn" type="button" data-op="down" aria-label="${L("Bir basamak aşağı", "One step down")}">▼</button>
        <button class="stopbtn" type="button" data-op="acc" aria-label="${L("Değiştirici işaret", "Accidental")}">♯ ♭</button>
        <button class="stopbtn" type="button" data-op="half" aria-label="${L("Süreyi yarıya indir", "Halve the duration")}">½×</button>
        <button class="stopbtn" type="button" data-op="double" aria-label="${L("Süreyi iki katına çıkar", "Double the duration")}">2×</button>
        <button class="stopbtn" type="button" data-op="dot">${L("nokta", "dot")}</button>
        <button class="stopbtn" type="button" data-op="rest">${L("sus", "rest")}</button>
        <button class="stopbtn" type="button" data-op="del">${L("sil", "delete")}</button>
        <button class="stopbtn" type="button" data-op="ins">${L("önüne ekle", "insert before")}</button>
        <button class="stopbtn" type="button" data-op="merge">${L("sonrakiyle birleştir", "merge with next")}</button>
        <button class="stopbtn" type="button" data-op="octup" aria-label="${L("Bir oktav yukarı", "One octave up")}">${L("oktav ▲", "octave ▲")}</button>
        <button class="stopbtn" type="button" data-op="octdown" aria-label="${L("Bir oktav aşağı", "One octave down")}">${L("oktav ▼", "octave ▼")}</button>
      </div>
      <div class="pbar cvall">
        <span class="muted small">${L("Hepsini aktar:", "Transpose all:")}</span>
        <button class="stopbtn" type="button" data-tr="perde" data-dir="1">${L("perde ▲", "perde ▲")}</button>
        <button class="stopbtn" type="button" data-tr="perde" data-dir="-1">${L("perde ▼", "perde ▼")}</button>
        <button class="stopbtn" type="button" data-tr="semitone" data-dir="1">${L("yarım ses ▲", "semitone ▲")}</button>
        <button class="stopbtn" type="button" data-tr="semitone" data-dir="-1">${L("yarım ses ▼", "semitone ▼")}</button>
      </div>
      <textarea id="cvtext" rows="3" aria-label="${L("Notalar (metin)", "Notes (text)")}"></textarea>
      <div class="cverr small" id="cvterr" aria-live="polite"></div>
      <div class="scorewrap" id="cvscore"></div>
      <div class="pbar">
        <button class="stopbtn" id="cvplay" type="button">${L("Dinle", "Listen")}</button>
        <button class="stopbtn" id="cvstop" type="button">${L("Durdur", "Stop")}</button>
        <input id="cvname" type="text" placeholder="${L("Eserin adı", "Name of the piece")}" aria-label="${L("Eserin adı", "Name of the piece")}">
        <button class="primary small" id="cvsave" type="button">${L("Kaydet", "Save")}</button>
      </div>
      <div class="fb" id="cvmsg" aria-live="polite"></div>
      <div class="pbar" id="cvfix" hidden>
        <button class="stopbtn" id="cvfixout" type="button">${L("Taşanları bir oktav kaydır", "Shift the notes outside by an octave")}</button>
        <button class="stopbtn" id="cvfixall" type="button">${L("Hepsini bir oktav kaydır", "Shift everything by an octave")}</button>
      </div>
    </div>`;

  // ---- İş belirteci: her okuma yeni bir jobId alır; sonuç geldiğinde jobId eskiyse ekrana yazılmaz ----
  let curJob = 0, listening = null, playTok = null, accBase = null;   // accBase: değiştirici döngüsünün sürdüğü nota
  let rangeAbort = null;                                              // açık sayfa aralığı sorusunu kapatır (yeni iş gelince)
  let omrW = null, omrRej = null;                                     // resim okuma Worker'ı; süren işin reddi
  // Yeni iş eskisini iptal eder: süren resim okuması Worker kapatılarak durdurulur (yeniden açılınca kalıplar yeniden
  // yüklenir); bekleyen okuma reddedilir ki önizlemeleri bırakılsın
  function omrStop(){ const r = omrRej; omrRej = null; if(omrW){ omrW.terminate(); omrW = null; } if(r) r(new Error("iptal")); }
  const newJob = () => { if(omrRej) omrStop(); if(rangeAbort) rangeAbort(); return (curJob = ++cvJobSeq); };
  const stale = id => id !== curJob;
  const prog = (t, cls = "") => { $("cvprog").className = "fb " + cls; $("cvprog").textContent = t; };
  const msg = (t, cls = "") => { $("cvmsg").className = "fb " + cls; $("cvmsg").textContent = t; };

  // ---- Ses: yeniden örnekleme ve parça parça çözüm ----
  async function to22k(data, sr){
    if(sr === CV_SR) return data;
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OAC(1, Math.max(1, Math.ceil(data.length*CV_SR/sr)), CV_SR);
    const b = oc.createBuffer(1, data.length, sr); b.copyToChannel(data, 0);
    const src = oc.createBufferSource(); src.buffer = b; src.connect(oc.destination); src.start();
    return (await oc.startRendering()).getChannelData(0);
  }
  // data: tek kanal; dönen { raw, offset, q } ya da iş eskidiyse null. onProgress(%), isStale()
  async function analyzePcm(data, sr, { makam, onProgress, isStale }){
    const pcm = await to22k(data, sr);
    if(isStale()) return null;
    const C = CV_CHUNK_SEC*CV_SR, OV = Math.round(CV_OV_MS/1000*CV_SR), parts = Math.max(1, Math.ceil(pcm.length/C));
    let raw = [];
    for(let k=0;k<parts;k++){
      onProgress(Math.round(k/parts*100));
      await sleep(0);
      if(isStale()) return null;
      const s = Math.max(0, k*C - OV), e = Math.min(pcm.length, (k+1)*C);
      raw = joinAudioChunk(raw, audioNotes(pcm.subarray(s, e), CV_SR, { T: SK.T }), s/CV_SR*1000, (k*C - s)/CV_SR*1000);
    }
    onProgress(100);
    if(!raw.length) return { raw, offset:0, q:null };
    await sleep(0);
    if(isStale()) return null;
    const offset = tuningOffset(raw);
    await sleep(0);
    if(isStale()) return null;
    return { raw, offset, q: quantizeRun(raw, { makam: makam || null, mode: SK.tuningMode(), offset }) };
  }
  const tuneMakam = () => (SK.tuningMakam && SK.tuningMakam()) || null;
  // Bu sekmenin ses işi: ilerleme satırı, sonuç düzeltme ekranına
  async function runPcm(id, data, sr, meta){
    prog(L("Ezgi çözümleniyor…", "Analysing the melody…"));
    const makam = meta.makam !== undefined ? meta.makam : tuneMakam();
    let r;
    try{
      r = await analyzePcm(data, sr, { makam, isStale: () => stale(id),
        onProgress: p => { if(!stale(id)) prog(L("Ezgi çözümleniyor… %", "Analysing the melody… ") + p + (LANG === "en" ? "%" : "")); } });
    }catch(e){ if(!stale(id)) prog(L("Ses çözümlenemedi: ", "Couldn't analyse the audio: ") + (e.message || e), "bad"); return; }
    if(!r || stale(id)) return;
    if(!r.q || !r.q.notes.some(n => !n.rest)){ prog(L("Ezgi bulunamadı. Daha yakından ya da daha yüksek sesle dene.", "No melody found. Try closer or louder."), "bad"); return; }
    prog("");
    open({ kind:"audio", notes: r.q.notes, tempo: r.q.tempo, meter: r.q.meter, raw: r.raw, offset: r.offset, makam, name: meta.name, cut: meta.cut }, id);
  }
  // Ses dosyası: çöz → kanalların ortalaması → 180 sn'den uzunsa kes → 22 050 Hz
  async function readFile(f){
    const id = newJob();
    // Çok büyük dosya çözülürken telefonun belleği yetmeyebilir (3 dk'lık sıkıştırılmış ses birkaç MB'tır)
    if(f.size > CV_MAX_MB*1024*1024){ prog(L("Dosya çok büyük (en çok " + CV_MAX_MB + " MB). Kısa bir parçasını kesip seç.", "The file is too large (" + CV_MAX_MB + " MB at most). Cut a shorter part and choose that."), "bad"); return; }
    prog(L("Ses dosyası açılıyor…", "Opening the audio file…"));
    let buf;
    try{
      const ab = await f.arrayBuffer();
      if(stale(id)) return;
      const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      buf = await new OAC(1, 1, 44100).decodeAudioData(ab);
    }catch(e){ if(!stale(id)) prog(L("Ses dosyası açılamadı.", "Couldn't open the audio file."), "bad"); return; }
    if(stale(id)) return;
    const sr = buf.sampleRate, n = Math.min(buf.length, CV_MAX_SEC*sr), nch = buf.numberOfChannels, mono = new Float32Array(n);
    for(let ch=0;ch<nch;ch++){ const d = buf.getChannelData(ch); for(let i=0;i<n;i++) mono[i] += d[i]/nch; }
    await runPcm(id, mono, sr, { name: f.name.replace(/\.[^.]+$/, ""), cut: buf.length > n });
  }
  $("cvaud").addEventListener("click", () => $("cvfile").click());
  $("cvfile").addEventListener("change", () => {
    const f = $("cvfile").files[0]; $("cvfile").value = "";
    if(f) readFile(f);
  });

  // ---- Resim: Worker'da okuma (omrworker.js → OMR.readPages) ----
  function omrRun(id, pages){
    return new Promise((res, rej) => {
      if(!omrW) omrW = new Worker("omrworker.js");
      omrRej = rej;
      omrW.onmessage = e => {
        const m = e.data;
        if(m.jobId !== id || stale(id)) return;
        if(m.progress !== undefined){ prog(L("Notalar okunuyor… %", "Reading the notes… ") + Math.round(m.progress*100) + (LANG === "en" ? "%" : "")); return; }
        omrRej = null;
        if(m.error) rej(new Error(m.error)); else res(m.result);
      };
      // Worker açılamadı (dosya yok, betik hatası): kapatılır, sonraki seçimde yeniden denenir
      omrW.onerror = e => { e.preventDefault(); omrRej = null; if(omrW){ omrW.terminate(); omrW = null; } rej(new Error(e.message || "Worker")); };
      // Gri baytlar Worker'a aktarılır (kopyalanmaz); önizleme adresleri burada kalır
      omrW.postMessage({ jobId: id, pages: pages.map(p => ({ data: p.data, width: p.width, height: p.height })) }, pages.map(p => p.data.buffer));
    });
  }
  // PDF çok sayfalıysa sayfa aralığı sorusu: iki sayı alanı, varsayılan hepsi. Yeni iş gelirse (newJob → rangeAbort) null döner
  function askRange(n){
    return new Promise(res => {
      const box = $("cvrange");
      const done = v => { box.hidden = true; box.innerHTML = ""; rangeAbort = null; res(v); };
      rangeAbort = () => done(null);
      prog(L("Bu PDF " + n + " sayfa. Hangi sayfaları okuyayım?", "This PDF has " + n + " pages. Which pages should I read?"));
      box.innerHTML = `<label class="tnum">${L("İlk sayfa", "From")} <input id="cvrfrom" type="number" min="1" max="${n}" value="1" aria-label="${L("İlk sayfa", "First page")}"></label>
        <label class="tnum">${L("Son sayfa", "To")} <input id="cvrto" type="number" min="1" max="${n}" value="${n}" aria-label="${L("Son sayfa", "Last page")}"></label>
        <button class="primary small" id="cvrok" type="button">${L("Oku", "Read")}</button>
        <button class="stopbtn" id="cvrno" type="button">${L("Vazgeç", "Cancel")}</button>`;
      box.hidden = false;
      const num = (id, d) => { const v = parseInt($(id).value, 10); return Number.isFinite(v) ? Math.max(1, Math.min(n, v)) : d; };
      $("cvrok").addEventListener("click", () => { const a = num("cvrfrom", 1), b = num("cvrto", n); done([Math.min(a, b), Math.max(a, b)]); });
      $("cvrno").addEventListener("click", () => { prog(""); done(null); });
    });
  }
  // meta: Nota bul'dan gelince { name, makam, source } düzeltme ekranına dolu gelir
  async function readImages(files, meta = {}){
    const id = newJob();
    prog(L("Dosya açılıyor…", "Opening the file…"));
    let pages;
    try{
      pages = await filesToPages(files, { isStale: () => stale(id), ask: askRange,
        onPage: (k, m) => prog(L("PDF sayfası okunuyor… ", "Opening PDF page ") + k + "/" + m) });
    }catch(e){
      if(stale(id)) return;
      if(e.password) prog(L("Bu PDF parolalı. Parolasız bir kopyasını seç.", "This PDF is password-protected. Choose a copy without a password."), "bad");
      else if(e.message === "iptal") prog("");
      else prog(L("Dosya açılamadı: ", "Couldn't open the file: ") + (e.message || e), "bad");
      return;
    }
    const drop = () => pages.forEach(p => URL.revokeObjectURL(p.url));
    if(stale(id)){ drop(); return; }
    prog(L("Notalar okunuyor…", "Reading the notes…"));
    let r;
    try{ r = await omrRun(id, pages); }
    catch(e){ drop(); if(!stale(id)) prog(L("Notalar okunamadı: ", "Couldn't read the notes: ") + (e.message || e), "bad"); return; }
    if(stale(id)){ drop(); return; }
    prog("");
    // Dizek yoksa ya da okuma çok güvensizse sonuç atılır: boş şerit, resme bakarak yaz
    const conf = r.notes.length ? r.notes.reduce((a, n) => a + n.conf, 0)/r.notes.length : 0;
    const manual = r.flags.includes("nostaff") || conf < CV_MANUAL_CONF;
    const flags = r.flags.filter(f => f !== "nostaff" || manual);
    if(!manual && r.nostaffPages.length && pages.length > 1) flags.push({ tr: "Dizek bulunamayan sayfa atlandı: " + r.nostaffPages.map(p => p + 1).join(", ") + ".",
      en: "Skipped page(s) without staves: " + r.nostaffPages.map(p => p + 1).join(", ") + "." });
    open({ kind:"image", pages: pages.map(({ url, width, height }) => ({ url, width, height })), notes: manual ? [] : r.notes, marks: manual ? [] : r.marks,
      meter: r.meter, turkish: manual ? undefined : r.turkish, flags, manual, name: meta.name || cvNameOf(files[0].name), makam: meta.makam, source: meta.source }, id);
  }
  $("cvimg").addEventListener("click", () => $("cvpic").click());
  $("cvpic").addEventListener("change", () => {
    const fs = [...$("cvpic").files]; $("cvpic").value = "";
    if(fs.length) readImages(fs);
  });

  // ---- Nota bul: neyzen.com dizini (cihazda, 30 günde bir yenilenir) ve projetsm.com araması (canlı) ----
  // Arama ve önizleme kendi belirteciyle (findSeq) eskir: yeni arama, yeni önizleme ya da sekmeden çıkış eskiyi atar.
  // "Çevir" okumayı newJob ile başlatır, yani dosya seçimi ve sekmeden çıkış onu da iptal eder.
  let findSeq = 0, hits = [], psLast = null, pv = null;   // psLast: { q, rows } son projetsm araması; pv: açık önizleme
  const NZ_DAYS = 30, NZ_B = SOURCES.neyzen.base, SHOW_MAX = 100;
  const SITE = { neyzen: "neyzen.com", projetsm: "projetsm.com" };
  const PS_HTML = { headers: { Accept: "text/html" } };   // projetsm başlıksız istekte HTML yerine JSON/JS döndürüyor
  const qmsg = (t, cls = "") => { $("cvqmsg").className = "fb " + cls; $("cvqmsg").textContent = t; };
  const WEB_ONLY = () => L("Nota bul yalnızca telefon uygulamasında çalışır.", "Find a score only works in the phone app.");
  // Hata → ileti: internet yok, site yanıt vermiyor, ayrıştırıcı boş döndü ("parse")
  const netErr = (site, e) => site + ": " + (e === "parse" ? L("bu kaynak şu an okunamıyor.", "this source can't be read right now.")
    : e && e.web ? WEB_ONLY()
    : !(e && e.status) && navigator.onLine === false ? L("internet bağlantısı yok.", "no internet connection.")
    : L("site yanıt vermiyor.", "the site isn't responding."));

  // Dizin IndexedDB'de (NZDB) sıkıştırılmış saklanır (adresin ortak başı ve kaynak adı atılır): ~8 700 eser ≈ 1,6 milyon
  // karakter. localStorage'a yazılmaz: kotayı doldurmasın, yedeğe girmesin. Önceki sürümün anahtarı silinir.
  let nzMem, nzBusy = null, nzStop = false;
  try{ localStorage.removeItem("sk.convert.neyzen"); }catch(e){}
  const nzPack = r => ({ v:1, date: r.date, complete: r.complete, pagesDone: r.pagesDone.map(u => u.replace(NZ_B, "")),
    rows: r.entries.map(e => [e.title, e.form, e.composer, e.makam, e.makamId, e.url.replace(NZ_B, "")]) });
  // neyzen adresleri hep https (Android'de cleartext yalnızca projetsm.com'a açık)
  const nzFull = u => /^https?:/i.test(u) ? u.replace(/^http:\/\/(www\.)?neyzen\.com\//i, NZ_B) : NZ_B + u;
  const nzUnpack = s => s && s.v === 1 && Array.isArray(s.rows) ? { date: s.date, complete: !!s.complete, pagesDone: (s.pagesDone || []).map(nzFull),
    entries: s.rows.map(([title, form, composer, makam, makamId, u]) => ({ title, form, composer, makam, makamId, url: nzFull(u), source:"neyzen" })) } : null;
  const nzLoad = async () => { if(nzMem === undefined){ try{ nzMem = nzUnpack(await NZDB.get("neyzen")); }catch(e){ nzMem = null; } } return nzMem; };
  const nzFresh = x => x && x.complete && Date.now() - Date.parse(x.date) < NZ_DAYS*864e5;
  // Dizin gerekiyorsa çıkarılır (yoksa, yarımsa ya da eskiyse; force: Dizini yenile). Yarım dizin saklanır, sonraki aramada
  // eksik sayfalar tamamlanır. Tam dizin yenilenirken yarıda kalırsa eskisi kalır. → { idx, err, saveFail } (err: hata ya da
  // "parse"; saveFail: cihaza yazılamadı, bu oturumda bellekten kullanılır)
  function nzEnsure(force){
    if(nzBusy) return nzBusy;
    nzBusy = (async () => {
      try{
        const old = await nzLoad();
        if(!force && nzFresh(old)) return { idx: old, err: null };
        nzStop = false;
        let lastErr = null, saveFail = false;
        // buildNeyzenIndex sözleşmesi: 2xx dışı yanıtta hata fırlatmalı (httpGet fırlatır); sekmeden çıkınca kalan istekler kesilir
        const fetchText = async u => {
          if(nzStop){ lastErr = new Error("iptal"); throw lastErr; }
          try{ return await httpGet(u); }
          catch(e){ lastErr = e; throw e; }
        };
        const prev = !force && old && !old.complete ? old : null;
        const r = await buildNeyzenIndex(fetchText, prev, (k, n) => { if(!nzStop) qmsg(L("Dizin hazırlanıyor ", "Preparing the index ") + k + "/" + n); });
        let idx = r;
        if(!r.complete && old && old.complete) idx = old;
        else if(r.entries.length || r.pagesDone.length){
          nzMem = r;
          try{ await NZDB.set("neyzen", nzPack(r)); }catch(e){ saveFail = true; }
        }
        const err = r.complete ? (r.entries.length ? null : "parse") : lastErr || "parse";   // hatasız yarım: liste boş çıktı
        return { idx: idx && idx.entries.length ? idx : null, err, saveFail };
      } finally { nzBusy = null; }
    })();
    return nzBusy;
  }
  // projetsm: sunucuda arama. Hiç satır çıkmadı ve "bulunamadı" da yazmıyorsa sayfa yapısı değişmiş sayılır
  async function psSearch(q){
    if(psLast && psLast.q === q) return { rows: psLast.rows, err: null };
    try{
      const html = await httpGet(SOURCES.projetsm.base + "search?search=" + encodeURIComponent(q), PS_HTML);
      const rows = parseProjetsmSearch(html);
      if(!rows.length && !/bulunamad/i.test(html)) return { rows, err: "parse" };
      psLast = { q, rows };
      return { rows, err: null };
    }catch(e){ return { rows: [], err: e }; }
  }
  // force: Dizini yenile (sözcük olmadan da çalışır)
  async function doSearch(force){
    const q = $("cvq").value.trim(), id = ++findSeq;
    closePreview();
    if(!httpReady()){ hits = []; renderHits(); qmsg(WEB_ONLY(), "bad"); return; }
    if(!q && !force){ qmsg(L("Aranacak bir sözcük yaz.", "Type a word to search for."), "bad"); return; }
    const src = $("cvqsrc").value, makamId = $("cvqmk").value || null;
    const useNz = SOURCES.neyzen.enabled && src !== "projetsm", usePs = SOURCES.projetsm.enabled && src !== "neyzen" && !!q;
    qmsg(L("Aranıyor…", "Searching…"));
    const [nz, ps] = await Promise.all([useNz || force ? nzEnsure(force) : null, usePs ? psSearch(q) : null]);
    if(id !== findSeq) return;
    const errs = [];
    let out = [];
    if(nz){
      if(nz.idx && useNz && q) out = searchIndex(nz.idx.entries, q, { makamId });
      // Dizin varsa (yarım ya da eski de olsa) arama yine yapılır; hata ayrıca söylenir
      if(nz.saveFail) errs.push(L("Dizin cihaza kaydedilemedi; bu oturumda bellekten kullanılıyor.", "The index couldn't be saved on the device; it is used from memory for this session."));
      if(nz.err && nz.err.message !== "iptal") errs.push(netErr(SITE.neyzen, nz.err) + (nz.idx ? " " + L("Eldeki dizinde arandı.", "Searched the index on hand.") : ""));
    }
    if(ps){
      out = out.concat(ps.rows.filter(r => !makamId || r.makamId === makamId));
      if(ps.err) errs.push(netErr(SITE.projetsm, ps.err));
    }
    hits = out; renderHits();
    const n = out.length;
    const head = !q ? L("Dizin hazır.", "The index is ready.") : n ? (n + L(" sonuç", n === 1 ? " result" : " results") + (n > SHOW_MAX ? L(" (ilk " + SHOW_MAX + " gösteriliyor)", " (showing the first " + SHOW_MAX + ")") : "") + ".")
      : L("Sonuç yok.", "No results.");
    qmsg([head, ...errs].join(" "), errs.length && !n ? "bad" : "");
  }
  function renderHits(){
    $("cvres").innerHTML = hits.slice(0, SHOW_MAX).map((h, i) => `<button type="button" class="cvhit" data-h="${i}">${esc(h.title)}
      <small>${[h.form, h.composer, h.makam].filter(Boolean).map(esc).join(" · ")} <span class="cvtag">${SITE[h.source]}</span></small></button>`).join("");
  }
  $("cvqgo").addEventListener("click", () => doSearch(false));
  $("cvq").addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); doSearch(false); } });
  // Süzgeç değişince arama yinelenir (projetsm yanıtı ve neyzen dizini bellekte, yeniden istenmez)
  $("cvqsrc").addEventListener("change", () => { if($("cvq").value.trim() && httpReady()) doSearch(false); });
  $("cvqmk").addEventListener("change", () => { if($("cvq").value.trim() && httpReady()) doSearch(false); });
  if($("cvqidx")) $("cvqidx").addEventListener("click", () => doSearch(true));

  // Önizleme: neyzen PDF'inin ilk sayfası, projetsm GIF'leri. İndirilen dosyalar Çevir ve Dosyayı kaydet için tutulur.
  function closePreview(){
    if(pv) pv.urls.forEach(u => URL.revokeObjectURL(u));
    pv = null;
    $("cvprev").hidden = true; $("cvprevpages").replaceChildren();
    $("cvres").querySelectorAll(".cvhit.sel").forEach(b => b.classList.remove("sel"));
  }
  const pvMsg = (t, cls = "") => { $("cvprevmsg").className = "fb " + cls; $("cvprevmsg").textContent = t; };
  const fileName = u => { const f = String(u).split(/[?#]/)[0].split("/").pop() || "nota"; try{ return decodeURIComponent(f); }catch(e){ return f; } };
  async function preview(h, btn){
    closePreview();
    const id = ++findSeq, isStale = () => id !== findSeq;
    btn.classList.add("sel");
    const my = pv = { h, files: [], urls: [] };
    $("cvprev").hidden = false;
    $("cvprevhead").innerHTML = `<b>${esc(h.title)}</b> <span class="muted small">${[h.form, h.composer, h.makam].filter(Boolean).map(esc).join(" · ")} · ${SITE[h.source]}</span>`;
    $("cvpconv").disabled = $("cvpsave").disabled = true;
    pvMsg(L("Nota indiriliyor…", "Downloading the score…"));
    try{
      if(h.source === "neyzen"){
        const blob = await httpGet(h.url, { binary: true });
        if(isStale()) return;
        my.files = [new File([blob], fileName(h.url), { type: "application/pdf" })];
        pvMsg(L("İlk sayfa açılıyor…", "Opening the first page…"));
        const pages = await pdfToPages(my.files[0], [1, 1], { isStale });
        if(isStale()){ pages.forEach(p => URL.revokeObjectURL(p.url)); return; }
        pages.forEach(p => my.urls.push(p.url));
      }else{
        const r = parseProjetsmPiece(await httpGet(h.url, PS_HTML));
        if(isStale()) return;
        if(!r.hasScore){ pvMsg(L("Bu eserin notası yok.", "This piece has no score."), "bad"); return; }
        for(let k=0;k<r.pages.length;k++){
          pvMsg(L("Nota indiriliyor… ", "Downloading the score… ") + (k + 1) + "/" + r.pages.length);
          const blob = await httpGet(r.pages[k], { binary: true });
          if(isStale()) return;
          my.files.push(new File([blob], fileName(r.pages[k]), { type: blob.type || "image/gif" }));
          my.urls.push(URL.createObjectURL(blob));
        }
      }
    }catch(e){
      if(isStale() || (e && e.message === "iptal")) return;
      pvMsg(e && e.password ? L("Bu PDF parolalı.", "This PDF is password-protected.")
        : e && (e.web || e.net || e.status) ? netErr(SITE[h.source], e) : L("Nota açılamadı: ", "Couldn't open the score: ") + ((e && e.message) || e), "bad");
      // İndirilen dosya açılamasa da kaydedilebilir
      $("cvpsave").disabled = !my.files.length;
      return;
    }
    $("cvprevpages").innerHTML = my.urls.map((u, k) => `<img src="${u}" alt="${L("Sayfa ", "Page ")}${k + 1}">`).join("");
    pvMsg(h.source === "neyzen" ? L("İlk sayfa. Çevir bütün sayfaları okur.", "First page. Convert reads every page.") : "");
    $("cvpconv").disabled = $("cvpsave").disabled = false;
  }
  $("cvres").addEventListener("click", e => {
    const b = e.target.closest("[data-h]"); if(!b) return;
    const h = hits[+b.dataset.h]; if(h) preview(h, b);
  });
  $("cvpclose").addEventListener("click", () => { findSeq++; closePreview(); });
  // Çevir: indirilen dosya okuyucuya; düzeltme ekranı ad, makam ve kaynakla dolu açılır
  $("cvpconv").addEventListener("click", () => {
    if(!pv || !pv.files.length) return;
    const { h, files } = pv;
    findSeq++; closePreview();
    readImages(files, { name: h.title, makam: h.makamId || null, source: { site: SITE[h.source], url: h.url } });
  });
  $("cvpsave").addEventListener("click", async () => {
    if(!pv || !pv.files.length) return;
    const my = pv;
    try{
      await cvSaveBlobs(my.files.map(f => ({ blob: f, name: f.name })), my.h.title);
      if(pv === my) pvMsg(my.files.map(f => f.name).join(", "));
    }catch(e){ if(pv === my && (!e || e.name !== "AbortError")) pvMsg(L("Kaydedilemedi: ", "Couldn't save: ") + ((e && e.message) || e), "bad"); }
  });
  if(!httpReady()) qmsg(WEB_ONLY());

  // Dinleyerek yaz: mikrofondan en çok 3 dakika; durdurunca dosyayla aynı yol
  const clockName = () => L("Dinlenen ezgi ", "Melody by ear ") + new Date().toLocaleTimeString(LANG === "en" ? "en" : "tr", { hour:"2-digit", minute:"2-digit" });
  function listenUi(on){ $("cvlisten").textContent = on ? L("Durdur", "Stop") : L("Dinleyerek yaz", "Write by ear"); $("cvlisten").classList.toggle("listening", on); if(!on) $("cvclock").textContent = ""; }
  async function startListen(){
    const id = newJob();   // süren okuma varsa iptal
    // Dinlerken yankı giderme kapalı (kullanıcının Hoparlör modu ayarından bağımsız); her çıkışta ayar geri gelir
    const raw = () => SK.setRawMic ? SK.setRawMic(true) : null, restore = () => { if(SK.setRawMic) SK.setRawMic(false); };
    await raw();
    const ok = await ctx.needMic();
    if(listening) return;                                   // başka bir dinleme zaten sürüyor (ayar onda kalır)
    if(stale(id)){ restore(); return; }                     // izin beklenirken sekmeden çıkıldı
    if(!ok){ restore(); prog(L("Mikrofon açılamadı.", "Couldn't open the microphone."), "bad"); return; }
    const cap = SK.pcmCapture(CV_MAX_SEC), t0 = performance.now();
    listening = { cap, timer: setInterval(() => {
      const s = (performance.now() - t0)/1000;
      $("cvclock").textContent = Math.floor(s) + " / " + CV_MAX_SEC + L(" sn", " s");
      if(s >= CV_MAX_SEC) stopListen();
    }, 250) };
    listenUi(true);
    prog(L("Dinliyorum… ezgiyi çal ya da kaydı oynat, bitince Durdur.", "Listening… play the tune or the recording, then tap Stop."));
  }
  // Dinlemenin bütün bitişleri (Durdur, 3 dk dolması, sekmeden çıkış) buradan geçer: yankı giderme ayarı geri gelir
  function endListen(){
    const l = listening; listening = null; if(!l) return null;
    clearInterval(l.timer); listenUi(false);
    const r = l.cap.stop();
    if(SK.setRawMic) SK.setRawMic(false);
    return r;
  }
  function stopListen(){
    const r = endListen();
    if(!r || !r.data.length){ prog(L("Ses alınamadı.", "No audio was captured."), "bad"); return; }
    runPcm(newJob(), r.data, r.sampleRate, { name: clockName(), cut: r.full });
  }
  $("cvlisten").addEventListener("click", () => listening ? stopListen() : startListen());

  // ---- Düzeltme ekranı ----
  // state = { notes, marks, meter, tempo, makam, turkish, expand, sel, dirty, jobId, kind, raw, offset, name, source, flags, pages, cut, manual }
  // Önizleme adresleri iş bitince (kayıt ya da yeni iş) bırakılır
  const dropPages = st => { if(st && st.pages) st.pages.forEach(p => { if(/^blob:/.test(p.url)) URL.revokeObjectURL(p.url); }); };
  function open(job, id){
    if(id === undefined) id = newJob();
    playStop();
    if(cvState && cvState.pages !== job.pages) dropPages(cvState);
    const turkish = job.kind === "audio" ? true : job.turkish != null ? job.turkish : store.get("convert.turkish", true);
    cvState = { notes: job.notes.map(n => ({ ...n })), marks: (job.marks || []).map(m => ({ ...m })), meter: job.meter || [4,4],
      tempo: Math.max(30, Math.min(240, Math.round(job.tempo || 80))), makam: job.makam || null, turkish, expand: true, sel: null, dirty: false,
      jobId: id, kind: job.kind || "image", raw: job.raw || null, offset: job.offset || 0, name: job.name || "", source: job.source || null,
      flags: job.flags || [], pages: job.pages || null, cut: !!job.cut, manual: !!job.manual };
    msg(""); $("cvfix").hidden = true;
    srcZoom = 1;
    show(true);
  }
  const S = () => cvState;
  const perdeName = c => (PERDES.find(p => p[0] === c) || [, ""])[1];
  // Süre işareti: ♩ dörtlük, ♪ sekizlik…; noktalıda "." ve üçlemede "³"
  function durSym(d){
    const BASE = [[4,"𝅝"],[2,"𝅗𝅥"],[1,"♩"],[0.5,"♪"],[0.25,"𝅘𝅥𝅯"],[0.125,"𝅘𝅥𝅰"]], eq = (a, b) => Math.abs(a - b) < 1e-6;
    for(const [v, s] of BASE){ if(eq(d, v)) return s; if(eq(d, v*1.5)) return s + "."; if(eq(d, v*2/3)) return s + "³"; }
    return ctx.num(d, 2).replace(/,?0+$/, "");
  }
  const chipName = n => n.rest ? L("Sus", "Rest") : n.c !== null && n.c !== undefined && perdeName(n.c) ? perdeName(n.c) : nn(n.w);
  const MARK_SYM = { repStart:"‖:", repEnd:":‖", segno:"𝄋", toSegno:"D.S.", sectionEnd:"‖" };
  // Okuyucu uyarıları (omr.js flags)
  const FLAG_MSG = {
    nostaff: () => L("Dizek bulunamadı.", "No staves were found."),
    lowres: () => L("Resim küçük, okuma zayıf olabilir.", "The picture is small; the reading may be poor."),
    sparse: () => L("Sayfada çok az nota okundu; el yazısı ya da silik olabilir.", "Very few notes were read on this page; it may be handwritten or faint."),
    pianoLowerSkipped: () => L("Piyano notası: yalnızca üst dizek okundu.", "Piano score: only the upper staff was read."),
    repeat: () => L("Tekrarlar bulundu, 'Tekrarları aç' açık.", "Repeats were found; 'Expand repeats' is on.")
  };
  const written = () => S().turkish ? S().notes : concertToWritten(S().notes, SK.T);
  function render(fromText){
    const st = S();
    $("cvedit").hidden = !st;
    if(!st) return;
    $("cvkind").value = st.turkish ? "tr" : "concert";
    $("cvkind").hidden = st.kind === "audio";
    $("cvmk").value = st.makam || "";
    $("cvtempo").value = st.tempo;
    const ms = CV_METERS.some(m => m.join() === st.meter.join()) ? CV_METERS : [...CV_METERS, st.meter];
    $("cvmeter").innerHTML = ms.map(m => `<option value="${m.join("/")}">${m.join("/")}</option>`).join("");
    $("cvmeter").value = st.meter.join("/");
    $("cvexpand").checked = st.expand;
    $("cvname").value = st.name;
    // Bilgi satırı: akort kayması, kesilen uzun kayıt, okuyucu uyarıları
    const off = Math.round(st.offset*10)/10, info = [];
    if(st.kind === "audio" && off !== 0) info.push(LANG === "en" ? "The recording is tuned " + Math.abs(off) + " commas " + (off < 0 ? "flat" : "sharp") + " (corrected)."
      : "Kayıt " + ctx.num(Math.abs(off), Number.isInteger(off) ? 0 : 1) + " koma " + (off < 0 ? "pes" : "tiz") + " akortlu (düzeltildi).");
    if(st.cut) info.push(L("Uzun kayıt: ilk 3 dakika okundu.", "Long recording: the first 3 minutes were read."));
    if(st.manual) info.push(L("Okuyamadım, notaları resme bakarak ekle.", "I couldn't read it; add the notes by looking at the picture."));
    info.push(...st.flags.map(f => typeof f !== "string" ? pick(f, LANG) : FLAG_MSG[f] ? FLAG_MSG[f]() : f));
    $("cvinfo").textContent = info.join(" ");
    // Çip şeridi: ölçü ayraçlı; sarı emin değil, turuncu ölçü tutmuyor, kırmızı aralık dışı (kaynaktaki kutular da aynı renkte)
    const bars = barCheck(st.notes, st.meter), bad = new Set(rangeIssues(written())), barOf = [];
    bars.forEach(b => { for(let i=b.from;i<b.to;i++) barOf[i] = b; });
    const tone = i => { const n = st.notes[i]; return [n.conf != null && n.conf < 0.6 ? "unsure" : "", barOf[i] && !barOf[i].ok ? "badbar" : "",
      bad.has(i) ? "outrange" : "", st.sel === i ? "sel" : ""].filter(Boolean).join(" "); };
    const marksAt = i => st.marks.filter(m => m.i === i).map(m => `<span class="cvmark">${MARK_SYM[m.kind] || ""}</span>`).join("");
    let html = "";
    st.notes.forEach((n, i) => {
      if(i > 0 && barOf[i] !== barOf[i-1]) html += `<span class="cvbar" aria-hidden="true"></span>`;
      html += marksAt(i);
      html += `<button type="button" class="cvchip ${tone(i)}" data-i="${i}" aria-pressed="${st.sel === i}">${esc(chipName(n))} <i>${durSym(n.d)}</i></button>`;
    });
    html += marksAt(st.notes.length);
    $("cvchips").innerHTML = html || `<span class="muted small">${L("Nota yok.", "No notes.")}</span>`;
    $("cvadd").hidden = !st.manual;
    $("cvadd").querySelectorAll("[data-adur]").forEach(b => { b.disabled = st.sel === null; });
    renderSrc(st, tone);
    $("cvtools").querySelectorAll("button").forEach(b => { b.disabled = st.sel === null; });
    if(!fromText){ $("cvtext").value = scoreToText(st.notes); $("cvterr").textContent = ""; }
    if(st.notes.length) drawScore($("cvscore"), written(), { meter: st.meter, names:true }); else $("cvscore").replaceChildren();
    if(!bad.size) $("cvfix").hidden = true;
  }
  function show(scroll){
    render();
    if(scroll) $("cvedit").scrollIntoView({ block:"nearest" });
  }

  // ---- Kaynak görünümü: sayfa resimleri alt alta, okunan notaların kutuları üstünde (çiplerle aynı renkler) ----
  // Yakınlaşma: iki parmakla (hareket sürerken CSS transform, bırakınca genişlik) ya da +/− düğmeleri, Ctrl+tekerlek.
  let srcZoom = 1, srcKey = null, pinch = null;
  const SRC_ZMAX = 6, clampZ = z => Math.max(1, Math.min(SRC_ZMAX, z));
  function renderSrc(st, tone){
    const wrap = $("cvsrcwrap"), pg = $("cvpages");
    wrap.hidden = !(st.pages && st.pages.length);
    if(wrap.hidden){ if(srcKey){ pg.replaceChildren(); srcKey = null; } return; }
    if(srcKey !== st.pages){
      srcKey = st.pages;
      pg.style.width = srcZoom*100 + "%";
      pg.innerHTML = st.pages.map((p, k) => `<div class="cvpage" style="aspect-ratio:${p.width}/${p.height}">
        <img src="${p.url}" alt="${L("Sayfa ", "Page ")}${k + 1}" draggable="false"><div class="cvboxes" data-page="${k}" aria-hidden="true"></div></div>`).join("");
    }
    // Kutu nota başından biraz geniş: parmakla dokunulabilsin
    const by = st.pages.map(() => []), pct = (v, of) => (v/of*100).toFixed(3) + "%";
    st.notes.forEach((n, i) => {
      const b = n.box, p = b && st.pages[b.page]; if(!p) return;
      const pad = Math.max(b.w, b.h)*0.25;
      by[b.page].push(`<button type="button" tabindex="-1" class="cvbox ${tone(i)}" data-i="${i}" style="left:${pct(b.x - pad, p.width)};top:${pct(b.y - pad, p.height)};width:${pct(b.w + 2*pad, p.width)};height:${pct(b.h + 2*pad, p.height)}"></button>`);
    });
    pg.querySelectorAll(".cvboxes").forEach(el => { el.innerHTML = by[+el.dataset.page].join(""); });
  }
  // (cx, cy): kaynak kutusuna göre sabit kalan nokta
  function setZoom(z, cx, cy){
    const sc = $("cvsrc"); z = clampZ(z);
    const r = z/srcZoom, x = sc.scrollLeft + cx, y = sc.scrollTop + cy;
    srcZoom = z; $("cvpages").style.width = z*100 + "%";
    sc.scrollLeft = x*r - cx; sc.scrollTop = y*r - cy;
  }
  // Seçili çipin kutusu kaynakta ortaya kaydırılır (yalnızca kaynak kutusu kayar, sayfa yerinde kalır)
  function scrollToBox(i){
    const sc = $("cvsrc"), b = sc.querySelector(`.cvbox[data-i="${i}"]`);
    if(!b || $("cvsrcwrap").hidden) return;
    const r = sc.getBoundingClientRect(), q = b.getBoundingClientRect();
    sc.scrollTo({ left: sc.scrollLeft + q.left - r.left - (r.width - q.width)/2, top: sc.scrollTop + q.top - r.top - (r.height - q.height)/2, behavior:"smooth" });
  }
  $("cvpages").addEventListener("click", e => {
    const b = e.target.closest(".cvbox"); if(!b || !S()) return;
    S().sel = +b.dataset.i; render();
  });
  P.querySelector(".cvzoom").addEventListener("click", e => {
    const b = e.target.closest("[data-z]"); if(!b) return;
    const sc = $("cvsrc");
    setZoom(srcZoom*(+b.dataset.z > 0 ? 1.5 : 1/1.5), sc.clientWidth/2, sc.clientHeight/2);
  });
  {
    const sc = $("cvsrc"), pg = $("cvpages");
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    sc.addEventListener("touchstart", e => {
      if(e.touches.length !== 2) return;
      const r = sc.getBoundingClientRect(), t = e.touches;
      pinch = { d0: dist(t) || 1, k: 1, cx: (t[0].clientX + t[1].clientX)/2 - r.left, cy: (t[0].clientY + t[1].clientY)/2 - r.top };
      pg.style.transformOrigin = (sc.scrollLeft + pinch.cx) + "px " + (sc.scrollTop + pinch.cy) + "px";
    }, { passive: true });
    sc.addEventListener("touchmove", e => {
      if(!pinch || e.touches.length !== 2) return;
      if(e.cancelable) e.preventDefault();
      pinch.k = clampZ(srcZoom*dist(e.touches)/pinch.d0)/srcZoom;
      pg.style.transform = "scale(" + pinch.k + ")";
    }, { passive: false });
    const end = e => {
      if(!pinch || e.touches.length >= 2) return;
      const p = pinch; pinch = null;
      pg.style.transform = "";
      setZoom(srcZoom*p.k, p.cx, p.cy);
    };
    sc.addEventListener("touchend", end); sc.addEventListener("touchcancel", end);
    sc.addEventListener("wheel", e => {
      if(!e.ctrlKey) return;
      e.preventDefault();
      const r = sc.getBoundingClientRect();
      setZoom(srcZoom*Math.exp(-e.deltaY/300), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
  }

  // Resme bakarak yaz: seçili (son eklenen) notanın bir basamak yukarısı / aynısı / aşağısı arkasına eklenir; ilk nota La4 ♩
  $("cvadd").addEventListener("click", e => {
    const st = S(), b = e.target.closest("[data-add],[data-adur]");
    if(!st || !b) return;
    if(b.dataset.adur){
      const i = st.sel; if(i === null) return;
      edit(st.notes.map((m, j) => j === i ? scaleDur(m, +b.dataset.adur) : m), i, [i]);
      return;
    }
    const at = st.sel === null ? st.notes.length - 1 : st.sel;
    let base = null;
    for(let j=at;j>=0;j--) if(!st.notes[j].rest){ base = st.notes[j]; break; }
    const d = at >= 0 ? st.notes[at].d : 1, dir = +b.dataset.add;
    let x = base ? { w: base.w, c: base.c, d, rest:false } : { ...naturalOf({ w:69 }), d, rest:false };
    if(base && dir) x = stepNote(x, dir);
    x.conf = 1;
    shiftMarks(at, 1);
    edit([...st.notes.slice(0, at + 1), x, ...st.notes.slice(at + 1)], at + 1, [at + 1]);
  });
  // Notalar değişti: elle düzeltme (dirty); düzeltilen nota artık "emin değil" sayılmaz
  function edit(notes, sel, touched){
    const st = S();
    st.notes = notes.map((n, i) => touched && touched.includes(i) && n.conf != null ? { ...n, conf:1 } : n);
    st.sel = sel === null || !st.notes.length ? null : Math.max(0, Math.min(sel, st.notes.length - 1));
    st.dirty = true;
    msg(""); render();
  }
  // Tekrar işaretleri nota eklenip silinince kayar
  const shiftMarks = (from, delta) => { S().marks.forEach(m => { if(m.i > from) m.i = Math.max(from, m.i + delta); }); };
  $("cvchips").addEventListener("click", e => {
    const b = e.target.closest("[data-i]"); if(!b) return;
    S().sel = +b.dataset.i; render(); scrollToBox(S().sel);
  });
  $("cvtools").addEventListener("click", e => {
    const b = e.target.closest("[data-op]"), st = S();
    if(!b || !st || st.sel === null) return;
    const i = st.sel, ns = st.notes, n = ns[i], set = x => ns.map((m, j) => j === i ? x : m);
    switch(b.dataset.op){
      case "up": edit(set(stepNote(n, 1)), i, [i]); break;
      case "down": edit(set(stepNote(n, -1)), i, [i]); break;
      case "acc": {
        if(n.rest) return;
        // Döngü notanın ilk harfinden sürer: işaretli nota komşu harfe yuvarlanabilir (Si + 5 koma → Do5), harf kaymasın
        const unit = st.turkish ? "koma" : "semitone", cyc = ACC_CYCLE[unit];
        if(!accBase || accBase.i !== i || accBase.w !== n.w || accBase.c !== n.c || accBase.unit !== unit){
          const nat = naturalOf(n);
          accBase = { i, unit, nat, k: unit === "koma" ? (n.c != null ? n.c - nat.c : Math.round((n.w - nat.w)*53/12)) : n.w - nat.w };
        }
        accBase.k = cyc[(cyc.indexOf(accBase.k) + 1) % cyc.length];
        const x = withAccidental({ ...n, w: accBase.nat.w, c: accBase.nat.c }, { k: accBase.k, unit });
        Object.assign(accBase, { w: x.w, c: x.c });
        edit(set(x), i, [i]);
        break;
      }
      case "half": edit(set(scaleDur(n, 0.5)), i, [i]); break;
      case "double": edit(set(scaleDur(n, 2)), i, [i]); break;
      case "dot": edit(set(toggleDot(n)), i, [i]); break;
      case "rest": edit(set(toRest(n)), i, [i]); break;
      case "del": shiftMarks(i, -1); edit(ns.filter((m, j) => j !== i), i, []); break;
      case "ins": {
        const x = { ...n, conf:1 }; delete x.box;
        shiftMarks(i, 1); edit([...ns.slice(0, i), x, ...ns.slice(i)], i, [i]);
        break;
      }
      case "merge": {
        const out = mergeNext(ns, i);
        if(out.length === ns.length){ msg(L("Yalnızca aynı perdedeki iki nota birleşir.", "Only two notes of the same pitch can be merged."), "bad"); return; }
        shiftMarks(i + 1, -1); edit(out, i, [i]);
        break;
      }
      case "octup": edit(shiftOctave(ns, [i], 1), i, [i]); break;
      case "octdown": edit(shiftOctave(ns, [i], -1), i, [i]); break;
    }
  });
  P.querySelector(".cvall").addEventListener("click", e => {
    const b = e.target.closest("[data-tr]"), st = S();
    if(!b || !st) return;
    edit(transposeAll(st.notes, +b.dataset.dir, b.dataset.tr), st.sel, []);
  });
  // Metin görünümü: yazdıkça çipler güncellenir; okunamayan parçalar kırmızı iletide. Değişmeyen parçalar eski notayı
  // (adsız koma, güven) korur.
  $("cvtext").addEventListener("input", () => {
    const st = S(); if(!st) return;
    const r = reparseKeeping($("cvtext").value, st.notes);
    st.notes = r.notes;
    st.marks = st.marks.filter(m => m.i <= st.notes.length);
    if(st.sel !== null && st.sel >= st.notes.length) st.sel = st.notes.length ? st.notes.length - 1 : null;
    st.dirty = true;
    render(true);
    $("cvterr").textContent = r.errors.length ? L("Okunamadı: ", "Could not read: ") + r.errors.join(" ") : "";
  });

  // Üst satır. Ses işinde tempo ya da makam değişince ham notalar yeniden ızgaraya oturtulur; elle düzeltme varsa önce sorulur.
  function requant(tempo, makam){
    const st = S();
    if(st.dirty && !confirm(L("Elle yaptığın düzeltmeler silinecek. Devam edilsin mi?", "Your manual corrections will be lost. Continue?"))) return false;
    const q = quantizeRun(st.raw, { tempo, makam, mode: SK.tuningMode(), offset: st.offset });
    Object.assign(st, { notes: q.notes, tempo: Math.round(tempo), makam, sel: null, dirty: false });
    return true;
  }
  $("cvtempo").addEventListener("change", () => {
    const st = S(); if(!st) return;
    const t = Math.max(30, Math.min(240, Math.round(+$("cvtempo").value) || st.tempo));
    if(t === st.tempo){ render(); return; }
    if(st.kind === "audio" && st.raw) requant(t, st.makam); else st.tempo = t;
    render();
  });
  $("cvmk").addEventListener("change", () => {
    const st = S(); if(!st) return;
    const mk = $("cvmk").value || null;
    if(st.kind === "audio" && st.raw) requant(st.tempo, mk); else st.makam = mk;
    render();
  });
  $("cvkind").addEventListener("change", () => { const st = S(); if(!st) return; st.turkish = $("cvkind").value === "tr"; store.set("convert.turkish", st.turkish); render(); });
  $("cvmeter").addEventListener("change", () => { const st = S(); if(!st) return; st.meter = $("cvmeter").value.split("/").map(Number); render(); });
  $("cvexpand").addEventListener("change", () => { if(S()) S().expand = $("cvexpand").checked; });
  $("cvname").addEventListener("input", () => { if(S()) S().name = $("cvname").value; });

  // Dinle: düzeltilmiş ezgi (yazılı) tempoda çalar; çalan çip vurgulanır
  function playStop(){ if(playTok){ playTok = null; SK.stopSound(); } P.querySelectorAll(".cvchip.cur,.cvbox.cur").forEach(c => c.classList.remove("cur")); }
  async function listen(){
    playStop();
    const st = S(); if(!st) return;
    const tok = {}; playTok = tok;
    const notes = written(), mk = st.makam ? makamById(st.makam) : null, beatMs = 60000/st.tempo;
    const freqOf = n => n.c != null ? (mk ? ctx.mkFreq(mk, n.c) : ctx.commaFreq(n.c)) : undefined;
    for(let i=0;i<notes.length;i++){
      if(playTok !== tok) return;
      P.querySelectorAll(".cvchip.cur,.cvbox.cur").forEach(c => c.classList.remove("cur"));
      P.querySelectorAll(`.cvchip[data-i="${i}"],.cvbox[data-i="${i}"]`).forEach(c => c.classList.add("cur"));
      const n = notes[i];
      if(n.rest) SK.stopSound(); else SK.play(n.w, freqOf(n));
      await sleep(n.d*beatMs*0.92);
      if(playTok !== tok) return;
      SK.stopSound(); await sleep(n.d*beatMs*0.08);
    }
    if(playTok === tok) playStop();
  }
  $("cvplay").addEventListener("click", listen);
  $("cvstop").addEventListener("click", playStop);

  // Kaydet: konser notası yazılıya çevrilir; aralık dışı nota varsa kayıt yok, kaydırma düğmeleri çıkar
  $("cvsave").addEventListener("click", () => {
    const st = S(); if(!st) return;
    playStop();
    let notes = written();
    const bad = rangeIssues(notes);
    if(bad.length){
      msg(L("Klarnet aralığı dışında ", "") + bad.length + L(" nota var (kırmızı, Mi3–Mi♭7). Düzelt ya da kaydır.", " notes are outside the clarinet's range (red, E3–E♭7). Fix or shift them."), "bad");
      render(); $("cvfix").hidden = false;
      return;
    }
    if(!notes.some(n => !n.rest)){ msg(L("Nota yok.", "No notes."), "bad"); return; }
    if(st.expand && st.marks.length) notes = expandRepeats(notes, st.marks);
    notes = notes.map(({ conf, box, ...n }) => n);
    const name = st.name.trim() || L("Çevrilen eser", "Converted piece");
    const piece = { name, notes, tempo: st.tempo, meter: st.meter, makam: st.makam };
    if(st.source) piece.source = st.source;
    dropPages(st); cvState = null; prog(""); render();
    SK.addPieceFull(piece);
  });
  // Taşanlar: pesler bir oktav yukarı, tizler bir oktav aşağı. Hepsi: taşanların çoğunluğunun yönüne.
  $("cvfixout").addEventListener("click", () => {
    const st = S(), w = written(), bad = rangeIssues(w);
    const lo = bad.filter(i => w[i].w < LOW_NOTE), hi = bad.filter(i => w[i].w > HIGH_NOTE);
    edit(shiftOctave(shiftOctave(st.notes, lo, 1), hi, -1), st.sel, bad);
    msg("");
  });
  $("cvfixall").addEventListener("click", () => {
    const st = S(), w = written(), bad = rangeIssues(w);
    const lo = bad.filter(i => w[i].w < LOW_NOTE).length;
    edit(shiftOctave(st.notes, st.notes.map((n, i) => i), lo >= bad.length - lo ? 1 : -1), st.sel, []);
    msg("");
  });

  SK.openConvert = job => { open(job); ctx.selectTab("convert"); };
  // Kayıt sekmesi (drills.js) için: ham ses → { raw, offset, q } (onProgress(%)), iş belirteci çağıranda
  SK.convertPcm = (data, sr, opts = {}) => analyzePcm(data, sr, { makam: opts.makam, onProgress: opts.onProgress || (() => {}), isStale: opts.isStale || (() => false) });
  // Tarayıcı panelinde mikrofon olmadan denemek için (adrese ?debug eklenince): dinleyerek yazın durdurma sonrası yolu
  if(/[?&]debug(=|&|$)/.test(location.search)) window.SKDEBUG = Object.assign(window.SKDEBUG || {}, {
    convertPcm: (data, sr) => runPcm(newJob(), data, sr, { name: clockName() }),
    convertState: () => cvState
  });
  return {
    enter(){ render(); },
    // Sekmeden çıkınca süren okuma ve dinleme iptal edilir; düzeltme ekranı yerinde kalır
    leave(){
      newJob();
      findSeq++; nzStop = true; closePreview();
      if(listening) endListen();
      playStop();
      if(!/bad/.test($("cvprog").className)) prog("");
    }
  };
};
