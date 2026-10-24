// Nota çevirici testleri için sentetik nota sayfaları (yalnızca test; tarayıcıya ve yapıya girmez).
// SMuFL yazı tiplerinden (Bravura, Leland; testdata/fonts) gerçek glifler çizilir, dizek/ölçü çizgisi/sap/kiriş
// çokgen olarak çizilir. renderPage(spec) hem sayfa resmini (gri, 1 kanal) hem de beklenen sonucu (truth) döndürür;
// okuyucu (omr.js) bu sayfalara karşı geliştirilir.
const fs = require("fs"), path = require("path");
const sharp = require("sharp"), opentype = require("opentype.js");
const R = require("./repertoire.js");

// ---- Yazı tipleri ----
const FONT_FILES = { bravura:"Bravura.otf", leland:"Leland.otf" };
const fontCache = {};
function loadFont(name){
  if(!FONT_FILES[name]) throw new Error("bilinmeyen yazi tipi: " + name);
  return fontCache[name] || (fontCache[name] = opentype.loadSync(path.join(__dirname, "testdata", "fonts", FONT_FILES[name])));
}
// Glif: yazı tipinde yoksa (Leland'da AEU koma işaretlerinin bir kısmı yok) Bravura'dan alınır
function glyphOf(fontName, cp){
  let f = loadFont(fontName), g = f.charToGlyph(String.fromCodePoint(cp));
  if(g.index === 0 && fontName !== "bravura"){ f = loadFont("bravura"); g = f.charToGlyph(String.fromCodePoint(cp)); }
  return { font:f, glyph:g };
}

// SMuFL kod noktaları
const CP = { head1:0xE0A2, head2:0xE0A3, head4:0xE0A4, gClef:0xE050, sharp:0xE262, flat:0xE260, natural:0xE261,
  segno:0xE047, dalSegno:0xE045, measureRepeat:0xE500, digit0:0xE080, flagUp:0xE240, flagDown:0xE241,
  restBase:0xE4E3 };   // E4E3 birlik … E4E8 otuz ikilik
// AEU işareti: k (doğal harften koma farkı) → kod noktası. Yalın ♯ küçük mücenneb (+5), yalın ♭ bakiye (−4).
// E440 BüyükMücennebFlat, E441 KüçükMücennebFlat, E442 BakiyeFlat, E443 KomaFlat, E444 KomaSharp, E445 BakiyeSharp,
// E446 KüçükMücennebSharp, E447 BüyükMücennebSharp (SMuFL glyphnames.json). SMuFL'de E445 yalın ♯, E441 yalın ♭
// çizimidir (Bravura'da E262/E260 ile piksel piksel aynı); uygulamanın yazımında yalın işaretler +5/−4 olduğundan
// bakiye diyez (+4) E446 (tek dikey, uzun yataylar), küçük mücenneb bemol (−5) E442 (çizikli ♭) çizimiyle çizilir.
// omr.js kalıpları da aynı eşlemeyi kullanır (scripts/omr-templates.js).
const ACC_GLYPH = { 0:CP.natural, 5:CP.sharp, "-4":CP.flat, 1:0xE444, "-1":0xE443, 4:0xE446, "-5":0xE442, 8:0xE447, "-8":0xE440 };
const accGlyph = k => { const cp = ACC_GLYPH[k]; if(cp === undefined) throw new Error("cizilemeyen koma isareti: k=" + k); return cp; };

// ---- Yazılı notanın dizek yeri ve değiştirici ----
const LETTER_OF_PC = [0,0,1,2,2,3,3,4,4,5,6,6];
const LETTER_NAMES = { c:0, d:1, e:2, f:3, g:4, a:5, b:6, do:0, re:1, mi:2, fa:3, sol:4, la:5, si:6 };
const NAT_STEP = [5, 6, 7, 8, 2, 3, 4];   // anahtar işareti: harfin dizekteki yeri (Do5 Re5 Mi5 Fa5 Sol4 La4 Si4)
function stepOf(w){ const pc = ((w % 12) + 12) % 12; return (Math.floor(w/12) - 1)*7 + LETTER_OF_PC[pc] - 30; }
function accOf(n){
  if(n.c !== null && n.c !== undefined) return R.turkishAccidental(n.c, n.w).k;
  const pc = ((n.w % 12) + 12) % 12;                 // perdesiz (tampere): yalın ♯ / ♭
  return [1,3,6,8,10].includes(pc) ? ([1,6,8].includes(pc) ? 5 : -4) : 0;
}
// Süre → { base, dots, lvl }: lvl 0 birlik/ikilik/dörtlük, 1 sekizlik, 2 on altılık, 3 otuz ikilik
function durInfo(d){
  for(let b = 4, lvl = -2; b >= 0.125 - 1e-9; b /= 2, lvl++){
    if(Math.abs(d - b) < 1e-6) return { base:b, dots:0, lvl:Math.max(lvl, 0) };
    if(Math.abs(d - b*1.5) < 1e-6) return { base:b, dots:1, lvl:Math.max(lvl, 0) };
  }
  throw new Error("cizilemeyen sure: " + d);
}

// ---- SVG yardımcıları ----
const f2 = v => (+v).toFixed(2);
function rectPath(x, y, w, h){ return `M${f2(x)} ${f2(y)}h${f2(w)}v${f2(h)}h${f2(-w)}z`; }
function mulberry(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---- Düzen ----
function renderSvg(spec){
  const sp = spec.sp || 14, perLine = spec.perLine || 8, fontName = spec.font || "bravura";
  const meter = spec.meter || [4,4], barLen = meter[0]*4/meter[1];
  const notes = spec.notes, marks = spec.marks || [];
  const key = (spec.key || []).map(k => ({ letter: typeof k.letter === "number" ? k.letter : LETTER_NAMES[String(k.letter).toLowerCase()], k:k.k }));
  const keyOf = new Map(key.map(k => [k.letter, k.k]));
  const beatLen = meter[1] === 8 && meter[0] % 3 === 0 ? 1.5 : 1;
  const T = { staff:0.13*sp, stem:0.12*sp, thin:0.16*sp, thick:0.5*sp, ledger:0.16*sp, beam:0.5*sp };
  const out = [];                                   // SVG parçaları
  const glyph = (cp, x, y, size) => {                // glif yolu: (x,y) başlangıç noktası, size = yazı boyu (4 sp)
    const { glyph:g } = glyphOf(fontName, cp);
    return g.getPath(x, y, (size || 4*sp)).toPathData(2);
  };
  const adv = cp => { const { font, glyph:g } = glyphOf(fontName, cp); return g.advanceWidth*4*sp/font.unitsPerEm; };
  const bbox = cp => { const { font, glyph:g } = glyphOf(fontName, cp), s = 4*sp/font.unitsPerEm, b = g.getBoundingBox();
    return { x1:b.x1*s, x2:b.x2*s, y1:-b.y2*s, y2:-b.y1*s }; };   // y aşağı doğru, başlangıca göre

  // 1) Ölçülere böl
  const bars = []; { let cur = { from:0, to:0, sum:0 };
    notes.forEach((n, i) => { cur.sum += n.d; cur.to = i + 1; if(cur.sum >= barLen - 1e-6){ bars.push(cur); cur = { from:i + 1, to:i + 1, sum:0 }; } });
    if(cur.to > cur.from) bars.push(cur); }
  const barOfIndex = i => bars.findIndex(b => b.from === i);
  // 2) İşaretler: sınır işaretleri ölçü başında (i = ölçünün ilk notası); nota üstü işaretleri notaya bağlı
  const bounds = new Map();                          // ölçü sınırı b (b. ölçünün başı; bars.length = son) → {repStart, repEnd, sectionEnd}
  const above = new Map();                           // nota sırası → "segno" | "toSegno"
  const mrepBars = new Set();                        // ölçü tekrarı çizilen ölçüler
  for(const m of marks){
    if(m.kind === "segno" || m.kind === "toSegno"){ above.set(m.i, m.kind); continue; }
    const b = m.i >= notes.length ? bars.length : barOfIndex(m.i);
    if(b < 0) throw new Error("isaret olcu basinda degil: " + m.kind + " i=" + m.i);
    if(m.kind === "measureRepeat"){ mrepBars.add(b); continue; }
    const e = bounds.get(b) || {}; e[m.kind] = true; bounds.set(b, e);
  }
  // 3) Her notanın yatay yeri (ölçü içinde göreli) ve çizim bilgisi
  const info = notes.map((n, i) => {
    const di = durInfo(n.d);
    return { i, n, di, step: n.rest ? null : stepOf(n.w), acc:null, x:0, y:0, dir:null };
  });
  const headW = adv(CP.head4), accW = adv(CP.sharp) + 0.25*sp;
  const slotW = d => sp*(1.9 + Math.log2(Math.max(d, 0.25)*4));
  // Her ölçü için ölçüdeki notalar ve geniş: değiştirici belleği (ölçü içinde aynı harf+oktav için)
  const layoutBars = bars.map((b, bi) => {
    const mem = new Map(), bnd = bounds.get(bi + 1) || {}; let cx = 1.2*sp + (bounds.get(bi) && bounds.get(bi).repStart ? 1.8*sp : 0); const items = [];
    if(mrepBars.has(bi)){ for(let i = b.from; i < b.to; i++) info[i].skip = true; return { bar:b, items, w:6.2*sp, mrep:true }; }
    for(let i = b.from; i < b.to; i++){
      const it = info[i], n = it.n;
      let extra = 0;
      if(!n.rest){
        const k = accOf(n), pc = ((n.w % 12) + 12) % 12, letter = LETTER_OF_PC[pc], mk = letter + ":" + Math.floor(n.w/12);
        const state = mem.has(mk) ? mem.get(mk) : (keyOf.get(letter) || 0);
        if(k !== state){ it.acc = k; extra = accW; }
        mem.set(mk, k);
      }
      cx += extra; it.rx = cx;
      const dotW = it.di.dots ? 0.8*sp : 0;
      cx += slotW(n.d) + dotW; items.push(it);
    }
    return { bar:b, items, w:cx + 0.6*sp + (bnd.repEnd || bnd.sectionEnd ? 1.2*sp : 0) };
  });
  // 4) Sistemlere böl, genişlik ve yükseklik
  const lead = (() => { let w = 1.0*sp + adv(CP.gClef) + 0.8*sp; w += key.length*(adv(CP.sharp) + 0.15*sp); return w; })();
  const meterW = adv(CP.digit0)*(String(Math.max(meter[0], meter[1])).length) + 1.2*sp;
  const systems = []; for(let i = 0; i < layoutBars.length; i += perLine) systems.push(layoutBars.slice(i, i + perLine));
  const sysNat = systems.map((s, si) => lead + (si === 0 ? meterW : 0) + s.reduce((a, b) => a + b.w, 0) + 1.0*sp);
  const marginX = 2*sp, W = Math.ceil(Math.max(...sysNat, 30*sp) + 2*marginX);
  const titleH = spec.title ? 7*sp : 0, sysPitch = 15*sp, top = 6*sp + titleH;
  const H = Math.ceil(top + systems.length*sysPitch + 2*sp);
  out.push(`<rect width="${W}" height="${H}" fill="#fff"/>`);
  // Başlık: okuyucunun atlaması gereken metin benzeri bloklar ve bir sayı satırı
  const boxes = new Array(notes.length).fill(null);
  if(spec.title){
    const rnd = mulberry(7); let x = marginX + 10*sp; const w1 = W - 2*marginX - 20*sp, yT = 3.2*sp;
    let p = ""; while(x < marginX + 10*sp + w1*0.55){ const w = (2 + rnd()*4)*sp; p += rectPath(x, yT, w, 1.4*sp); x += w + 0.9*sp; }
    out.push(`<path d="${p}" fill="#222"/>`);
    let x2 = marginX + 10*sp, p2 = ""; while(x2 < marginX + 10*sp + w1*0.35){ const w = (1.5 + rnd()*3)*sp; p2 += rectPath(x2, yT + 2.6*sp, w, 0.8*sp); x2 += w + 0.7*sp; }
    out.push(`<path d="${p2}" fill="#444"/>`);
    out.push(`<path d="${glyph(CP.digit0 + 1, marginX, yT + 1.6*sp, 3*sp)}${glyph(CP.digit0 + 2, marginX + 1.4*sp, yT + 1.6*sp, 3*sp)}" fill="#222"/>`);
  }
  const fills = [];                                  // siyah çizimler tek yolda birleşir
  const addRect = (x, y, w, h) => fills.push(rectPath(x, y, w, h));
  const addPoly = pts => fills.push("M" + pts.map(p => f2(p[0]) + " " + f2(p[1])).join("L") + "z");
  const addGlyph = (cp, x, y, size) => fills.push(glyph(cp, x, y, size));
  const addDot = (x, y) => { const r = 0.22*sp; fills.push(`M${f2(x - r)} ${f2(y)}a${f2(r)} ${f2(r)} 0 1 0 ${f2(2*r)} 0a${f2(r)} ${f2(r)} 0 1 0 ${f2(-2*r)} 0z`); };
  const ties = [];
  systems.forEach((sys, si) => {
    const yb = top + si*sysPitch + 6*sp;               // alt çizginin y'si
    const Y = step => yb - step*sp/2;
    const natW = sysNat[si], last = si === systems.length - 1;
    const stretch = !last || natW > 0.7*(W - 2*marginX) ? (W - 2*marginX) : natW;
    const x0 = marginX, x1 = marginX + stretch;
    for(let s = 0; s < 5; s++) addRect(x0, Y(2*s) - T.staff/2, x1 - x0, T.staff);
    // Başlangıç: ölçü çizgisi, anahtar, anahtar işareti, ölçü sayısı
    addRect(x0, Y(8), T.thin, 4*sp);
    let cx = x0 + 1.0*sp;
    addGlyph(CP.gClef, cx, Y(2)); cx += adv(CP.gClef) + 0.8*sp;
    key.forEach(kk => { addGlyph(accGlyph(kk.k), cx, Y(NAT_STEP[kk.letter])); cx += adv(accGlyph(kk.k)) + 0.15*sp; });
    if(si === 0){
      const dig = (num, step) => { const s = String(num); let dx = cx + (String(Math.max(meter[0], meter[1])).length - s.length)*adv(CP.digit0)/2;
        for(const ch of s){ addGlyph(CP.digit0 + +ch, dx, Y(step)); dx += adv(CP.digit0); } };
      dig(meter[0], 6); dig(meter[1], 2); cx += meterW - 1.2*sp + 1.2*sp;
    }
    // Ölçüleri genişlet (sistemi doldurmak için artan boşluk ölçülere ve notalara paylaştırılır)
    const barsW = sys.reduce((a, b) => a + b.w, 0), avail = x1 - cx;
    const f = Math.max(1, avail/barsW), isLastSys = last && stretch === natW;
    const fac = isLastSys ? 1 : f;
    let bx = cx;
    sys.forEach((lb, bj) => {
      const bi = si*perLine + bj, bw = lb.w*fac, endX = bx + bw;
      lb.x0 = bx; lb.x1 = endX; lb.fac = fac;
      lb.items.forEach(it => { it.x = bx + it.rx*fac; it.y = Y(it.step === null ? 4 : it.step); it.line = si; });
      if(lb.mrep){
        const bb = bbox(CP.measureRepeat), gx = (bx + endX)/2 - adv(CP.measureRepeat)/2;
        addGlyph(CP.measureRepeat, gx, Y(4));
        const bxx = { x:gx + bb.x1, y:Y(4) + bb.y1, w:bb.x2 - bb.x1, h:bb.y2 - bb.y1 };
        for(let i = lb.bar.from; i < lb.bar.to; i++) boxes[i] = { ...bxx };
      }
      bx = endX;
    });
    // Ölçü çizgileri: her ölçünün sonunda; tekrar başı ölçünün başında (sınırda ikisi birlikteyse yalnızca ince çizgiler)
    const top_ = Y(8), h_ = 4*sp, dots = xx => { addDot(xx, Y(3)); addDot(xx, Y(5)); };
    sys.forEach((lb, bj) => {
      const bi = si*perLine + bj, isEnd = bi === layoutBars.length - 1;
      const eEnd = bounds.get(bi + 1) || {}, eStart = bounds.get(bi) || {}, xr = lb.x1, xl = lb.x0;
      if(eStart.repStart){
        if(eStart.repEnd && bj > 0){ addRect(xl + 0.3*sp, top_, T.thin, h_); dots(xl + 0.9*sp); }
        else { addRect(xl, top_, T.thick, h_); addRect(xl + 0.9*sp, top_, T.thin, h_); dots(xl + 1.5*sp); }
      }
      if(eEnd.repEnd){
        if(eEnd.repStart && bj < sys.length - 1){ addRect(xr - 0.3*sp - T.thin, top_, T.thin, h_); dots(xr - 0.9*sp); }
        else { addRect(xr - T.thick, top_, T.thick, h_); addRect(xr - 1.0*sp, top_, T.thin, h_); dots(xr - 1.6*sp); }
      } else if(eEnd.sectionEnd){ addRect(xr - 0.6*sp, top_, T.thin, h_); addRect(xr - T.thin, top_, T.thin, h_); }
      else if(isEnd){ addRect(xr - 0.9*sp, top_, T.thin, h_); addRect(xr - T.thick, top_, T.thick, h_); }
      else if(!(bounds.get(bi + 1) && bounds.get(bi + 1).repStart)) addRect(xr - T.thin, top_, T.thin, h_);
    });
    // Notalar
    const placed = sys.flatMap(lb => lb.items);
    // Sapların yönü: orta çizgi kuralı; kirişli gruplar tek yön
    const groups = [], inGroup = new Set();
    sys.forEach(lb => {
      let pos = 0, cur = null;
      lb.items.forEach(it => {
        const n = it.n, g = Math.floor((pos + 1e-6)/beatLen), fits = pos + n.d <= (g + 1)*beatLen + 1e-6;
        if(!n.rest && n.d < 1 - 1e-6 && fits){
          if(cur && cur.g === g) cur.items.push(it); else { cur = { g, items:[it] }; groups.push(cur); }
        } else cur = null;
        pos += n.d;
      });
    });
    const beamed = groups.filter(g => g.items.length >= 2);
    beamed.forEach(g => g.items.forEach(it => inGroup.add(it)));
    const dirOf = it => it.step < 4 ? "up" : "down";
    beamed.forEach(g => { let far = g.items[0]; for(const it of g.items) if(Math.abs(it.step - 4) > Math.abs(far.step - 4)) far = it; g.dir = dirOf(far); });
    const stemX = (it, dir) => dir === "up" ? it.x + headW - T.stem/2 : it.x + T.stem/2;
    const attachY = (it, dir) => it.y + (dir === "up" ? -0.17*sp : 0.17*sp);
    const tipY = (it, dir) => dir === "up" ? Math.min(it.y - 3.5*sp, Y(4)) : Math.max(it.y + 3.5*sp, Y(4));
    for(const it of placed){
      const n = it.n; if(it.skip) continue;
      if(n.rest){
        const lvl = it.di.base >= 4 ? 0 : it.di.base >= 2 ? 1 : it.di.base >= 1 ? 2 : it.di.base >= 0.5 ? 3 : it.di.base >= 0.25 ? 4 : 5;
        const cp = CP.restBase + lvl, yy = lvl === 0 ? Y(6) : lvl === 1 ? Y(4) : Y(4);
        const bb = bbox(cp), rx = it.x + (slotW(n.d)/2 - adv(cp)/2) + 0.2*sp;
        addGlyph(cp, rx, yy);
        let right = rx + bb.x2;
        if(it.di.dots){ addDot(right + 0.5*sp, Y(5)); right += 0.8*sp; }
        boxes[it.i] = { x:rx + bb.x1, y:yy + bb.y1, w:right - (rx + bb.x1), h:bb.y2 - bb.y1 };
        continue;
      }
      // Ek çizgiler
      const lg = (s) => addRect(it.x - 0.4*sp, Y(s) - T.ledger/2, headW + 0.8*sp, T.ledger);
      for(let s = -2; s >= it.step; s -= 2) lg(s);
      for(let s = 10; s <= it.step; s += 2) lg(s);
      const headCp = it.di.base >= 4 ? CP.head1 : it.di.base >= 2 ? CP.head2 : CP.head4;
      const hw = adv(headCp);
      addGlyph(headCp, it.x, it.y);
      let left = it.x, right = it.x + hw;
      if(it.acc !== null){ const cp = accGlyph(it.acc), aw = adv(cp); addGlyph(cp, it.x - aw - 0.2*sp, it.y); left = it.x - aw - 0.2*sp; }
      if(it.di.dots){ addDot(it.x + hw + 0.55*sp, it.step % 2 === 0 ? it.y - 0.5*sp : it.y); right = it.x + hw + 0.8*sp; }
      const hb = bbox(headCp);
      boxes[it.i] = { x:left, y:it.y + hb.y1, w:right - left, h:hb.y2 - hb.y1 };
      it.dir = inGroup.has(it) ? null : dirOf(it);
      if(it.di.base < 4 && !inGroup.has(it)){
        const dir = it.dir, sx = stemX(it, dir), ay = attachY(it, dir), ty = tipY(it, dir);
        addRect(sx - T.stem/2, Math.min(ay, ty), T.stem, Math.abs(ty - ay));
        if(it.di.lvl >= 1) addGlyph((dir === "up" ? CP.flagUp : CP.flagDown) + 2*(it.di.lvl - 1), sx - T.stem/2, ty);
      }
    }
    // Kirişler
    for(const g of beamed){
      const dir = g.dir, its = g.items, sgn = dir === "up" ? 1 : -1;
      const xa = stemX(its[0], dir), xb = stemX(its[its.length - 1], dir);
      const t0 = tipY(its[0], dir), t1 = tipY(its[its.length - 1], dir);
      const slope = Math.max(-1.25*sp, Math.min(1.25*sp, t1 - t0))/(xb - xa || 1);
      let by0 = t0;                                 // kiriş çizgisi: y = by0 + slope*(x − xa)
      for(const it of its){ const line = by0 + slope*(stemX(it, dir) - xa), need = tipY(it, dir); by0 += dir === "up" ? Math.min(0, need - line) : Math.max(0, need - line); }
      const by = x => by0 + slope*(x - xa);
      // saplar
      for(const it of its){ const sx = stemX(it, dir), ay = attachY(it, dir), ty = by(sx) + (dir === "up" ? 0 : 0);
        addRect(sx - T.stem/2, Math.min(ay, ty), T.stem, Math.abs(ty - ay)); }
      for(let L = 1; L <= 3; L++){
        const off = (L - 1)*0.75*sp*(dir === "up" ? 1 : -1);
        const poly = (x1_, x2_) => addPoly([[x1_, by(x1_) + off], [x2_, by(x2_) + off], [x2_, by(x2_) + off + sgn*T.beam], [x1_, by(x1_) + off + sgn*T.beam]]);
        let k = 0;
        while(k < its.length){
          if(its[k].di.lvl < L){ k++; continue; }
          let e = k; while(e + 1 < its.length && its[e + 1].di.lvl >= L) e++;
          if(e > k) poly(stemX(its[k], dir) - T.stem/2, stemX(its[e], dir) + T.stem/2);
          else { // kısa kiriş parçası: grubun ilk notasında sağa, ötekilerde sola
            const sx = stemX(its[k], dir);
            if(k === 0) poly(sx - T.stem/2, sx + 1.2*sp); else poly(sx - 1.2*sp, sx + T.stem/2);
          }
          k = e + 1;
        }
      }
    }
    // Bağ yayları
    placed.forEach(it => {
      if(!it.n.tie || it.n.rest) return;
      const nx = info[it.i + 1]; if(!nx || nx.n.rest) return;
      const dir = inGroup.has(it) ? groups.find(g => g.items.includes(it)).dir : dirOf(it), sg = dir === "up" ? 1 : -1;
      ties.push({ it, nx, sg, si, x0, x1, yb });
    });
  });
  // Bağ yayları (sistem sınırını geçen bağ iki parça olur)
  const tieArc = (xa, xb, y, sg) => {
    const h = 0.55*sp, xm = (xa + xb)/2, th = 0.28*sp;
    fills.push(`M${f2(xa)} ${f2(y)}Q${f2(xm)} ${f2(y + sg*2*h)} ${f2(xb)} ${f2(y)}Q${f2(xm)} ${f2(y + sg*(2*h - 2*th))} ${f2(xa)} ${f2(y)}z`);
  };
  for(const t of ties){
    const ya = t.it.y + t.sg*0.55*sp;
    if(t.nx.line === t.it.line || t.nx.line === undefined) tieArc(t.it.x + headW*0.7, t.nx.x + headW*0.3, ya, t.sg);
    else {
      tieArc(t.it.x + headW*0.7, t.x1 - 0.3*sp, ya, t.sg);
      tieArc(t.x0 + 3*sp, t.nx.x + headW*0.3, t.nx.y + t.sg*0.55*sp, t.sg);
    }
  }
  // Segno / segno'ya git: notanın üstünde (dizeğin üstünde)
  for(const [i, kind] of above){
    const it = info[i]; let x, sy;
    if(it) { x = it.x; const sys = it.line; sy = top + sys*sysPitch + 6*sp; }
    else { const lb = layoutBars[layoutBars.length - 1], sys = Math.floor((layoutBars.length - 1)/perLine); x = lb.x1 - 4*sp; sy = top + sys*sysPitch + 6*sp; }
    const cp = kind === "segno" ? CP.segno : CP.dalSegno;
    const yy = sy - 4*sp - 1.6*sp;
    addGlyph(cp, x, yy, kind === "segno" ? 4*sp : 3*sp);
  }
  // her parça ayrı yol: tek yolda üst üste binen alt yollar (çizgi + nota başı) sarım kuralıyla birbirini silerdi
  out.push(`<g fill="#000">${fills.map(f => `<path d="${f}"/>`).join("")}</g>`);
  return { svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out.join("")}</svg>`, W, H, boxes };
}

// ---- Sayfa: SVG → gri ham piksel, sonra bozulmalar ----
async function renderPage(spec){
  const { svg, W, H, boxes } = renderSvg(spec);
  let { data, info } = await sharp(Buffer.from(svg), { density:72 }).greyscale().raw().toBuffer({ resolveWithObject:true });
  let width = info.width, height = info.height, bx = boxes.map(b => b && { ...b });
  const dg = spec.degrade;
  if(dg){
    if(dg.blur) ({ data } = await sharp(data, { raw:{ width, height, channels:1 } }).blur(Math.max(0.3, dg.blur)).greyscale().raw().toBuffer({ resolveWithObject:true }));
    if(dg.noise){                                    // ham piksel gürültüsü (tohumlu, tekrarlanabilir)
      const rnd = mulberry(12345), buf = Buffer.from(data), amp = dg.noise*255;
      for(let i = 0; i < buf.length; i++){ const v = buf[i] + (rnd() + rnd() + rnd() - 1.5)*amp; buf[i] = v < 0 ? 0 : v > 255 ? 255 : v; }
      data = buf;
    }
    if(dg.rotate){
      const r = await sharp(data, { raw:{ width, height, channels:1 } }).rotate(dg.rotate, { background:"#fff" }).greyscale().raw().toBuffer({ resolveWithObject:true });
      const th = dg.rotate*Math.PI/180, c = Math.cos(th), s = Math.sin(th), ox = width/2, oy = height/2;
      bx = bx.map(b => { if(!b) return b;
        const xs = [], ys = [];
        for(const [px, py] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]){
          const dx = px - ox, dy = py - oy; xs.push(dx*c - dy*s + r.info.width/2); ys.push(dx*s + dy*c + r.info.height/2); }
        const x = Math.min(...xs), y = Math.min(...ys); return { x, y, w:Math.max(...xs) - x, h:Math.max(...ys) - y }; });
      data = r.data; width = r.info.width; height = r.info.height;
    }
    if(dg.scale && dg.scale !== 1){
      const nw = Math.max(1, Math.round(width*dg.scale)), nh = Math.max(1, Math.round(height*dg.scale));
      const r = await sharp(data, { raw:{ width, height, channels:1 } }).resize(nw, nh).greyscale().raw().toBuffer({ resolveWithObject:true });
      bx = bx.map(b => b && { x:b.x*nw/width, y:b.y*nh/height, w:b.w*nw/width, h:b.h*nh/height });
      data = r.data; width = nw; height = nh;
    }
  }
  const truth = { notes: spec.notes.map(n => ({ ...n })), marks: (spec.marks || []).map(m => ({ ...m })), boxes: bx, meter: spec.meter || [4,4], key: spec.key || [] };
  return { data:new Uint8Array(data), width, height, channels:1, truth };
}

// Gözle denetim için: sayfayı PNG olarak yazar
async function savePng(page, file){
  await sharp(Buffer.from(page.data), { raw:{ width:page.width, height:page.height, channels:1 } }).png().toFile(file);
}

// ---- Örnek sayfalar ----
// "|" ile ölçülere bölünmüş metinden notalar ve ölçü başlarının nota sırası
function fromBars(text){
  const notes = [], starts = [];
  for(const b of text.split("|")){ starts.push(notes.length); notes.push(...R.parseScoreText(b).notes); }
  starts.push(notes.length);
  return { notes, starts };
}
function demoSpecs(){
  // Sayfa 1 (Bravura, 4/4): yarım/noktalı/kirişli sekizlik ve on altılıklar, sus, bağ (sistem arası dahil),
  // AEU işaretleri, segno, "segno'ya git", tekrar işaretleri
  const p1 = fromBars("Rast:2 Dügâh:1.5 Segâh:0.5 | Çargâh:0.5 Nevâ:0.5 Hüseynî:0.25 Nevâ:0.25 Çargâh:0.25 Segâh:0.25 Rast:2 | " +
    "Nim_Zirgüle:1 Zirgüle:1 Kürdî:1 Dik_Kürdî:1 | Segâh:0.5 Dik_Bûselik:0.5 Nim_Hicaz:1 Hicaz:1 Dik_Hicaz:1 | " +
    "Dügâh:1 -:1 Nim_Hisar:0.5 Hisar:0.5 Dik_Hisar:1 | Nevâ:2 Nevâ:2 | Irak:0.5 Geveşt:0.5 Dik_Geveşt:1 Rast:2 | " +
    "Evç:1 Mâhûr:0.5 Dik_Mâhûr:0.5 Dik_Acem:1 Acem:1 | Acem:2 Gerdâniye:1 -:1 | Rast:3 Dügâh:0.5 Dik_Zirgüle:0.5 | -:4");
  const n1 = p1.notes, st = p1.starts;
  n1[st[5]].tie = true; n1[st[8] - 1].tie = true;      // bar 6'da Nevâ–Nevâ; bar 8'in Acem'i sistem sınırı boyunca bar 9'un Acem'ine bağlı
  const spec1 = { notes:n1, meter:[4,4], font:"bravura", sp:14, perLine:4,
    marks:[{ i:0, kind:"repStart" }, { i:st[2] + 1, kind:"segno" }, { i:st[4], kind:"repEnd" }, { i:st[7] + 3, kind:"toSegno" },
      { i:st[9], kind:"sectionEnd" }] };
  // Sayfa 2 (Leland, 9/8, anahtar işareti, ölçü tekrarı, başlık, bozulmalı)
  const p2 = fromBars("Dügâh:0.5 Dik_Kürdî:0.5 Nim_Hicaz:0.5 Nevâ:0.5 Nevâ:0.5 Nim_Hicaz:0.5 Dik_Kürdî:0.5 Dügâh:1 | " +
    "Nevâ:0.5 Hüseynî:0.5 Nevâ:0.5 Nim_Hicaz:0.5 Nevâ:1 Dik_Kürdî:0.5 Dügâh:1 | " +
    "Nevâ:0.5 Hüseynî:0.5 Nevâ:0.5 Nim_Hicaz:0.5 Nevâ:1 Dik_Kürdî:0.5 Dügâh:1 | " +
    "Dügâh:0.5 Dik_Kürdî:0.5 Nim_Hicaz:0.5 Nevâ:0.5 Hüseynî:1 Nevâ:1.5 | Nim_Hicaz:0.5 Dik_Kürdî:0.5 Rast:0.5 Dügâh:3");
  const spec2 = { notes:p2.notes, meter:[9,8], font:"leland", sp:14, perLine:3, title:true,
    key:[{ letter:"si", k:-4 }, { letter:"mi", k:-4 }],
    marks:[{ i:p2.starts[2], kind:"measureRepeat" }, { i:p2.starts[5], kind:"repEnd" }],
    degrade:{ blur:0.6, noise:0.08, rotate:1.2, scale:0.9 } };
  return [spec1, spec2];
}

module.exports = { renderPage, renderSvg, savePng, demoSpecs, accGlyph, durInfo };

if(require.main === module){
  (async () => {
    const dir = process.argv[2] || require("os").tmpdir(), specs = demoSpecs();
    for(let i = 0; i < specs.length; i++){
      const p = await renderPage(specs[i]), f = path.join(dir, "omrsynth" + (i + 1) + ".png");
      await savePng(p, f); console.log(f, p.width + "x" + p.height, p.truth.notes.length + " nota");
    }
  })().catch(e => { console.error(e); process.exit(1); });
}
