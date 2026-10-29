// Parmak tablosu: bütün notaların temel parmağı klarnet şeması üzerinde, bir arada.
// Ezber için tek sayfalık (A4) bir tablo da üretir: PDF ya da PNG olarak indirilir, yazdırılıp bakılarak çalışılır.
// Sayfa düz bir SVG'dir (fingerSheetSvg); fontları içine gömülür, tuvale çizilip PNG'ye, oradan JPEG'le PDF'e çevrilir.

// Sayfadaki küçük şemanın yerleşimi (100 × 190 birim). Kimlikler parmak şemasıyla (index.html svg.chart) aynı;
// görünüş de aynı: çalgıcının gözünden, başparmak deliği ve register arkada olduğu için solda kesik çizgili kutuda.
const SHEET_HOLES = { "h-T":[14,36], "h-lh1":[46,26], "h-lh2":[46,48], "h-lh3":[46,70], "h-rh1":[46,110], "h-rh2":[46,132], "h-rh3":[46,154] };
const SHEET_KEYS = {
  "k-R":[5,15,18,9], "k-A":[38,1,16,8], "k-Gs-side":[60,6,20,9], "k-Eb-sl":[58,57,12,5],
  "k-E-lp":[62,84,17,10], "k-Fs-lp":[81,84,17,10], "k-Cs-lp":[71,97,17,10],
  "k-s1":[17,100,15,8], "k-s3":[17,110,15,8], "k-s4":[17,120,15,8], "k-Bb-sl":[23,141,12,5],
  "k-Gs-rp":[10,166,19,10], "k-F-rp":[8,179,19,10]
};
const SHEET_RINGS = ["h-rh2", "h-rh3"];

// Küçük şema: on = basılı delik ve mandal kimlikleri
function sheetChart(on, x, y, k){
  const set = new Set(on), r = v => +(v).toFixed(2);
  let s = `<g transform="translate(${r(x)} ${r(y)}) scale(${k})">`;
  s += `<rect x="1" y="9" width="26" height="40" rx="5" fill="none" stroke="#9A9A9A" stroke-width="0.8" stroke-dasharray="2.5 2"/>`;
  s += `<rect x="37" y="0" width="18" height="190" rx="4" fill="#EFE7DC" stroke="#B5A38C" stroke-width="0.9"/>`;
  s += `<rect x="35" y="88" width="22" height="4" rx="1.5" fill="#C9CED0" stroke="#8E9A9C" stroke-width="0.6"/>`;
  for(const id of SHEET_RINGS){ const [cx, cy] = SHEET_HOLES[id]; s += `<circle cx="${cx}" cy="${cy}" r="10.5" fill="none" stroke="#8E9A9C" stroke-width="1.4"/>`; }
  for(const id in SHEET_HOLES){
    const [cx, cy] = SHEET_HOLES[id], c = set.has(id);
    s += `<circle cx="${cx}" cy="${cy}" r="7.5" fill="${c ? "#1A1C1E" : "#FFFFFF"}" stroke="${c ? "#1A1C1E" : "#6B6F72"}" stroke-width="1.5"/>`;
  }
  for(const id in SHEET_KEYS){
    const [kx, ky, w, h] = SHEET_KEYS[id], c = set.has(id);
    s += `<rect x="${kx}" y="${ky}" width="${w}" height="${h}" rx="${h/2}" fill="${c ? "#1A1C1E" : "#E4E7E8"}" stroke="${c ? "#1A1C1E" : "#9AA3A5"}" stroke-width="0.9"/>`;
  }
  return s + "</g>";
}

// Sayfadaki dizek: bütün hücrelerde aynı ölçek, nota yükseldikçe yukarı çıkar. Sol anahtarı yerine yalnızca çizgiler.
function sheetStaff(written, x, y, w, h){
  const p = staffPos(written), lo = -8, hi = 16, u = h/(hi - lo);
  const sy = s => +(y + (hi - s)*u).toFixed(2), cx = x + w*0.62;
  let s = "";
  for(let i = 0; i <= 8; i += 2) s += `<line x1="${x}" x2="${x+w}" y1="${sy(i)}" y2="${sy(i)}" stroke="#7A7E82" stroke-width="1.6"/>`;
  for(let i = -2; i >= p.step; i -= 2) s += `<line x1="${cx-15}" x2="${cx+15}" y1="${sy(i)}" y2="${sy(i)}" stroke="#1A1C1E" stroke-width="1.8"/>`;
  for(let i = 10; i <= p.step; i += 2) s += `<line x1="${cx-15}" x2="${cx+15}" y1="${sy(i)}" y2="${sy(i)}" stroke="#1A1C1E" stroke-width="1.8"/>`;
  s += `<ellipse cx="${cx}" cy="${sy(p.step)}" rx="${(u*1.25).toFixed(2)}" ry="${(u*0.9).toFixed(2)}" transform="rotate(-20 ${cx} ${sy(p.step)})" fill="#1A1C1E"/>`;
  if(p.acc) s += `<text x="${cx - u*2.9}" y="${sy(p.step) + u*1.1}" font-family="'Noto Music'" font-size="${(u*3.6).toFixed(1)}" text-anchor="middle" fill="#1A1C1E">${p.acc}</text>`;
  if(p.ottava) s += `<text x="${cx - u*1.6}" y="${Math.min(sy(p.step), sy(10)) - u*2.2}" font-size="${(u*2.6).toFixed(1)}" font-style="italic" font-weight="600" text-anchor="middle" fill="#1A1C1E">8va</text>`;
  return s;
}

const SHEET_W = 2100, SHEET_H = 2970;          // A4, 0,1 mm birim
const SHEET_REG = [[70, "Chalumeau", "#E3EEF7"], [84, "Klarino", "#FBEBD8"], [99, "Altissimo", "#EFE3F4"]];
const sheetReg = w => SHEET_REG.find(r => w <= r[0]);

// Tek sayfalık parmak tablosu (SVG metni). fontCss: gömülü @font-face kuralları (indirmede); yoksa sistem fontu.
function fingerSheetSvg(opts = {}){
  const en = opts.lang === "en", t = (tr, e) => en ? e : tr;
  const name = w => noteName(w)[en ? "en" : "tr"];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const notes = []; for(let w = LOW_NOTE; w <= HIGH_NOTE; w++) if(FINGERINGS[w]) notes.push(w);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_W}" height="${SHEET_H}" viewBox="0 0 ${SHEET_W} ${SHEET_H}">`;
  s += `<style>${opts.fontCss || ""} text{font-family:Commissioner,'Noto Music',Helvetica,Arial,sans-serif}</style>`;
  s += `<rect width="${SHEET_W}" height="${SHEET_H}" fill="#FFFFFF"/>`;
  // Başlık ve açıklama
  s += `<text x="60" y="110" font-size="66" font-weight="600" fill="#1A1C1E">${esc(t("Sol Klarnet · Parmak Tablosu", "G Clarinet · Fingering Chart"))}</text>`;
  s += `<text x="60" y="162" font-size="30" fill="#5F6368">${esc(t("Albert sistem (13 mandal, 2 halka) · yazılı notalar " + name(notes[0]) + " – " + name(notes[notes.length-1]) + " · temel parmaklar",
    "Albert system (13 keys, 2 rings) · written notes " + name(notes[0]) + " – " + name(notes[notes.length-1]) + " · basic fingerings"))}</text>`;
  const sw = (x, y, kind, label) => {
    let g = kind === "hole" ? `<circle cx="${x+14}" cy="${y-10}" r="13" fill="#1A1C1E"/>`
          : kind === "open" ? `<circle cx="${x+14}" cy="${y-10}" r="13" fill="#FFF" stroke="#6B6F72" stroke-width="2.6"/>`
          : kind === "key" ? `<rect x="${x}" y="${y-20}" width="30" height="18" rx="9" fill="#1A1C1E"/>`
          : `<rect x="${x}" y="${y-20}" width="30" height="18" rx="9" fill="#E4E7E8" stroke="#9AA3A5" stroke-width="1.6"/>`;
    return g + `<text x="${x+44}" y="${y}" font-size="28" fill="#1A1C1E">${esc(label)}</text>`;
  };
  s += sw(60, 232, "hole", t("delik kapalı", "hole closed")) + sw(330, 232, "open", t("delik açık", "hole open"))
     + sw(590, 232, "key", t("mandala bas", "press key")) + sw(850, 232, "off", t("dokunma", "don't touch"));
  SHEET_REG.forEach(([, reg, col], i) => {
    const x = 60 + i*300;
    s += `<rect x="${x}" y="268" width="34" height="26" rx="5" fill="${col}" stroke="#C7CACD" stroke-width="1.4"/><text x="${x+46}" y="290" font-size="28" fill="#1A1C1E">${reg}</text>`;
  });
  s += `<text x="60" y="346" font-size="25" fill="#5F6368">${esc(t("Çalgıcının gözünden görünüş. Kesik çizgili kutu arkadadır: register (R) ve başparmak deliği.",
    "Seen from the player's side. The dashed box is at the back: register (R) and thumb hole."))}</text>`;
  s += `<text x="60" y="380" font-size="25" fill="#5F6368">${esc(t("Dizekteki nota yazılı notadır; 8va bir oktav tiz çalınır. Alternatif parmaklar uygulamada.",
    "Staff notes are written pitch; 8va sounds an octave higher. Alternative fingerings are in the app."))}</text>`;
  // Rehber şema: hangi daire, hangi mandal
  const gk = 1.95, gx = 1380, gy = 14, P = (px, py) => [gx + px*gk, gy + py*gk];
  s += sheetChart([], gx, gy, gk);
  const lab = (px, py, tx, ty, label, anchor) => {
    const [ax, ay] = P(px, py);
    return `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${tx}" y2="${ty-7}" stroke="#9A9A9A" stroke-width="1.3"/>`
         + `<text x="${anchor === "end" ? tx-6 : tx+6}" y="${ty}" font-size="22" text-anchor="${anchor}" fill="#3C4043">${esc(label)}</text>`;
  };
  s += lab(14, 19, 1340, 40, t("R register", "R register"), "end")
     + lab(10, 36, 1340, 96, t("başparmak", "thumb"), "end")
     + lab(24, 104, 1340, 214, t("yan mandallar 1·2·3", "side keys 1·2·3"), "end")
     + lab(29, 143, 1340, 262, "Si♭", "end")
     + lab(16, 178, 1340, 300, t("sağ serçe: Sol♯ · Fa", "R pinky: G♯ · F"), "end")
     + lab(46, 2, 1620, 24, "La", "start")
     + lab(78, 10, 1620, 58, t("Sol♯ yan", "G♯ side"), "start")
     + lab(54, 48, 1620, 118, t("sol el: işaret · orta · yüzük", "left: index · middle · ring"), "start")
     + lab(68, 59, 1620, 160, "Mi♭", "start")
     + lab(90, 92, 1620, 218, t("sol serçe: Mi · Fa♯ · Sol♯", "L pinky: E · F♯ · G♯"), "start")
     + lab(54, 132, 1620, 290, t("sağ el: işaret · orta · yüzük", "right: index · middle · ring"), "start");
  // Notalar: 8 sütun × 6 satır
  const COLS = 8, X0 = 50, Y0 = 410, CW = (SHEET_W - 2*X0)/COLS, CH = (SHEET_H - Y0 - 40)/Math.ceil(notes.length/COLS);
  notes.forEach((w, i) => {
    const x = X0 + (i % COLS)*CW, y = Y0 + Math.floor(i/COLS)*CH, alts = fingeringsFor(w).length - 1;
    s += `<rect x="${x+5}" y="${y+5}" width="${CW-10}" height="${CH-10}" rx="14" fill="#FFFFFF" stroke="#C7CACD" stroke-width="2"/>`;
    s += `<path d="M${x+5} ${y+19} a14 14 0 0 1 14 -14 h${CW-38} a14 14 0 0 1 14 14 v44 h-${CW-10} z" fill="${sheetReg(w)[2]}"/>`;
    s += `<text x="${x+20}" y="${y+50}" font-size="38" font-weight="600" fill="#1A1C1E">${esc(name(w))}</text>`;
    if(alts) s += `<text x="${x+CW-18}" y="${y+48}" font-size="21" text-anchor="end" fill="#5F6368">+${alts} alt</text>`;
    s += sheetStaff(w, x+16, y+86, 64, CH-112);
    s += sheetChart(fingeringIds(FINGERINGS[w]), x+CW-12-100*1.62, y+82, 1.62);
  });
  s += `<text x="${SHEET_W-60}" y="${SHEET_H-14}" font-size="20" text-anchor="end" fill="#9AA0A6">Sol Klarnet · WFG Oehler/Albert</text>`;
  return s + "</svg>";
}

// İndirme: fontları gömüp SVG'yi tuvale çizer. PNG doğrudan; PDF tek sayfalık, içinde JPEG.
async function sheetFontCss(){
  const files = [["Commissioner", "fonts/Commissioner-1.woff2", "U+0000-00FF,U+0131,U+2000-206F"],
                 ["Commissioner", "fonts/Commissioner-0.woff2", "U+0100-02BA"],
                 ["Noto Music", "fonts/NotoMusic-8.woff2", "U+266D,U+266F,U+1D11E"]];
  const out = [];
  for(const [fam, url, range] of files){
    try{
      const buf = await (await fetch(url)).arrayBuffer();
      let bin = ""; const b = new Uint8Array(buf);
      for(let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
      out.push(`@font-face{font-family:'${fam}';src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');font-weight:100 900;unicode-range:${range}}`);
    }catch(e){}
  }
  return out.join("");
}
async function sheetCanvas(svgText, scale){
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
  await img.decode();
  const c = document.createElement("canvas");
  c.width = Math.round(SHEET_W*scale); c.height = Math.round(SHEET_H*scale);
  const g = c.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0, c.width, c.height);
  return c;
}
// Tek görüntülü A4 PDF (JPEG, DCTDecode)
function jpegPdf(jpeg, wpx, hpx){
  const enc = new TextEncoder(), parts = [], offs = [];
  let len = 0;
  const add = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, body) => { offs[n] = len; add(n + " 0 obj\n"); body(); add("\nendobj\n"); };
  const content = "q 595.28 0 0 841.89 0 0 cm /Im0 Do Q";
  add("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, () => add("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  obj(3, () => add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>"));
  obj(4, () => add("<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream"));
  obj(5, () => { add(`<< /Type /XObject /Subtype /Image /Width ${wpx} /Height ${hpx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); add(jpeg); add("\nendstream"); });
  const xref = len;
  add("xref\n0 6\n0000000000 65535 f \n" + [1,2,3,4,5].map(n => String(offs[n]).padStart(10, "0") + " 00000 n \n").join(""));
  add("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
  return new Blob(parts, { type:"application/pdf" });
}
// Dosyayı kaydettir: Android/iOS'ta paylaşım menüsü, tarayıcıda indirme
async function saveBlob(blob, name){
  const P = window.Capacitor && window.Capacitor.Plugins;
  if(P && P.Filesystem && P.Share){
    const data = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = no; r.readAsDataURL(blob); });
    const w = await P.Filesystem.writeFile({ path:name, data, directory:"CACHE" });
    await P.Share.share({ title:name, url:w.uri, dialogTitle:L("Parmak tablosunu kaydet", "Save the fingering chart") });
    return;
  }
  const file = new File([blob], name, { type:blob.type });
  if(navigator.canShare && navigator.canShare({ files:[file] }) && matchMedia("(pointer:coarse)").matches){
    await navigator.share({ files:[file], title:name }); return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

TRAINERS.tablo = function(ctx){
  const { SK, $, nn, miniChart, paintMini } = ctx;
  const notes = []; for(let w = LOW_NOTE; w <= HIGH_NOTE; w++) if(FINGERINGS[w]) notes.push(w);
  const ROWS = [["Chalumeau", L("pes bölge", "low register"), notes.filter(w => w <= 70)],
                ["Klarino", L("orta bölge, register basılı", "middle register, register key pressed"), notes.filter(w => w > 70 && w <= 84)],
                ["Altissimo", L("tiz bölge", "high register"), notes.filter(w => w > 84)]];
  const P = $("pp-tablo");
  P.innerHTML = `
    <p class="pdesc">${L(`Bütün notaların (${notes.length} nota) temel parmağı klarnet şeması üzerinde. Bir notaya dokun: sesini duy. Mikrofon açıkken çaldığın nota tabloda yanar. Ezber için tablonun tek sayfalık hâlini indirip yazdırabilirsin.`,
      `The basic fingering of every note (${notes.length} notes) on the clarinet chart. Tap a note to hear it. With the microphone on, the note you play lights up. To memorise, download the one-page version and print it.`)}</p>
    <div class="tbdl">
      <button class="primary small" id="tbpdf" type="button">${L("Tek sayfa indir (PDF)", "Download one page (PDF)")}</button>
      <button class="stopbtn" id="tbpng" type="button">${L("Resim olarak indir (PNG)", "Download as image (PNG)")}</button>
      <span class="reg" id="tbmsg" aria-live="polite">${L("A4, yazdırmaya hazır", "A4, ready to print")}</span>
    </div>
    ${ROWS.map(([reg, sub, ws], i) => `<div class="label tbreg">${reg} <em>${sub}</em></div><div class="tbgrid" id="tbrow${i}"></div>`).join("")}`;
  const cells = new Map();
  ROWS.forEach(([, , ws], ri) => {
    const row = $("tbrow" + ri);
    for(const w of ws){
      const alts = fingeringsFor(w).length - 1;
      const b = document.createElement("button");
      b.type = "button"; b.className = "tbcell";
      b.setAttribute("aria-label", nn(w) + L(", sesini dinle", ", listen"));
      b.innerHTML = `<span class="tbname"><b>${nn(w)}</b>${alts ? `<small>+${alts} alt</small>` : ""}</span>`;
      const ch = miniChart(); paintMini(ch, FINGERINGS[w]); ch.setAttribute("aria-hidden", "true");
      b.appendChild(ch);
      b.addEventListener("click", () => {
        if(SK.playing() === w){ SK.stopSound(); return; }
        SK.play(w);
        setTimeout(() => { if(SK.playing() === w) SK.stopSound(); }, 1400);
      });
      cells.set(w, b); row.appendChild(b);
    }
  });
  const live = w => cells.forEach((b, k) => b.classList.toggle("live", k === w));

  const msg = $("tbmsg"), btns = [$("tbpdf"), $("tbpng")];
  async function download(kind){
    btns.forEach(b => b.disabled = true);
    msg.textContent = L("Hazırlanıyor…", "Preparing…");
    try{
      const svg = fingerSheetSvg({ lang:LANG, fontCss: await sheetFontCss() });
      const c = await sheetCanvas(svg, 1.18);    // ~300 dpi
      const base = L("sol-klarnet-parmak-tablosu", "g-clarinet-fingering-chart");
      let blob;
      if(kind === "pdf"){
        const jpg = await new Promise(ok => c.toBlob(ok, "image/jpeg", 0.92));
        blob = jpegPdf(new Uint8Array(await jpg.arrayBuffer()), c.width, c.height);
      }else blob = await new Promise(ok => c.toBlob(ok, "image/png"));
      await saveBlob(blob, base + "." + kind);
      msg.textContent = L("Hazır: ", "Ready: ") + base + "." + kind + " (" + Math.round(blob.size/1024) + " KB)";
    }catch(e){
      msg.textContent = e && e.name === "AbortError" ? L("A4, yazdırmaya hazır", "A4, ready to print")
        : L("İndirilemedi: ", "Couldn't download: ") + (e && e.message || e);
    }finally{ btns.forEach(b => b.disabled = false); }
  }
  $("tbpdf").addEventListener("click", () => download("pdf"));
  $("tbpng").addEventListener("click", () => download("png"));
  return {
    note(r){ live(r.inRange ? r.written : null); },
    silence(){ live(null); },
    stop(){},
    leave(){ live(null); }
  };
};
