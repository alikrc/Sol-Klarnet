// Nota okuyucu (omr.js) testleri: dizek bulma, eğiklik, çizgi silme, nota başı ayırma ve simge sınıflama.
// Sentetik sayfalar testomrsynth.js'ten ve aşağıdaki simge sayfalarından gelir. test.js sonunda await run(ok).

const opentype = require('opentype.js'), sharp = require('sharp'), path = require('path');

// Simge sayfası: her sınıfın glifi dizek üzerinde olağan yerlerinde, birkaç kez. Kutular glifin yazı tipi
// sınırlarından hesaplanır; okunan simge (symbols) kutunun içindeki en büyük simgedir.
const fontCache = {};
function glyphOf(fontName, cp){
  const ld = n => fontCache[n] || (fontCache[n] = opentype.loadSync(path.join(__dirname, 'testdata', 'fonts', n === 'leland' ? 'Leland.otf' : 'Bravura.otf')));
  let f = ld(fontName), g = f.charToGlyph(String.fromCodePoint(cp));
  if(g.index === 0){ f = ld('bravura'); g = f.charToGlyph(String.fromCodePoint(cp)); }   // Leland'da olmayan AEU işaretleri
  return { f, g };
}
// Sınıf → dizekteki yerler (basamak: alt çizgi 0, üst çizgi 8; 12 = dizeğin üstü)
function sheetItems(cls){
  if(/^head_/.test(cls) || /sharp|flat|natural/.test(cls)) return [1, 2, 4, 5, 7];
  if(cls === 'rest_1') return [6, 6, 6];
  if(/^rest_/.test(cls)) return [4, 4, 4];
  if(/^digit_/.test(cls)) return [6, 2];
  if(cls === 'dot') return [1, 3, 5, 7];
  if(cls === 'segno') return [13, 13, 13];
  if(cls === 'clef_g') return [2, 2, 2];
  return [4, 4, 4];                                  // ölçü tekrarı
}
async function renderSheet(fontName, sp, degrade, CLASS_GLYPHS){
  const items = [];
  for(const cls of Object.keys(CLASS_GLYPHS)) for(const st of sheetItems(cls)) items.push({ cls, cp:CLASS_GLYPHS[cls], step:st });
  const perStaff = 12, slot = 3.6*sp, margin = 2*sp, pitch = 13*sp;
  const nStaves = Math.ceil(items.length/perStaff), W = Math.ceil(2*margin + perStaff*slot + 2*sp), H = Math.ceil(4*sp + nStaves*pitch);
  const parts = [], boxes = [];
  items.forEach((it, i) => {
    const si = Math.floor(i/perStaff), yb = 8*sp + si*pitch, x = margin + 2*sp + (i % perStaff)*slot;
    const { f, g } = glyphOf(fontName, it.cp), s = 4*sp/f.unitsPerEm, b = g.getBoundingBox(), y = yb - it.step*sp/2;
    parts.push(g.getPath(x, y, 4*sp).toPathData(2));
    boxes.push({ cls:it.cls, x:x + b.x1*s, y:y - b.y2*s, w:(b.x2 - b.x1)*s, h:(b.y2 - b.y1)*s });
  });
  let staff = '';
  for(let si = 0; si < nStaves; si++) for(let l = 0; l < 5; l++) staff += `<rect x="${margin}" y="${(8*sp + si*pitch - l*sp - 0.065*sp).toFixed(2)}" width="${W - 2*margin}" height="${(0.13*sp).toFixed(2)}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${staff}<path d="${parts.join('')}"/></svg>`;
  let { data, info } = await sharp(Buffer.from(svg), { density:72 }).greyscale().raw().toBuffer({ resolveWithObject:true });
  if(degrade && degrade.blur) ({ data } = await sharp(data, { raw:{ width:info.width, height:info.height, channels:1 } }).blur(degrade.blur).greyscale().raw().toBuffer({ resolveWithObject:true }));
  if(degrade && degrade.noise){ let a = 99; const rnd = () => (a = (a*1103515245 + 12345) % 2147483648)/2147483648, buf = Buffer.from(data);
    for(let i = 0; i < buf.length; i++){ const v = buf[i] + (rnd() + rnd() + rnd() - 1.5)*degrade.noise*255; buf[i] = v < 0 ? 0 : v > 255 ? 255 : v; } data = buf; }
  return { data:new Uint8Array(data), width:info.width, height:info.height, boxes };
}

// Kirişsiz sayfa: dörtlük, ikilik, birlik ve noktalılar; sus, diyez/bemol, ek çizgiler (tohumlu)
function beamlessSpec(degrade){
  let a = 7; const rnd = () => (a = (a*1103515245 + 12345) % 2147483648)/2147483648;
  const pats = [[1,1,1,1], [2,1,1], [2,2], [4], [1.5,1,1.5], [3,1], [1,1,2], [1,3]];
  const notes = [];
  for(let b = 0; b < 32; b++){
    for(const d of pats[Math.floor(rnd()*pats.length)]){
      if(rnd() < 0.12 && d <= 2) notes.push({ rest:true, d });
      else notes.push({ w:62 + Math.floor(rnd()*30), c:null, d });
    }
  }
  return { notes, meter:[4,4], font:'bravura', sp:14, perLine:4, title:true, degrade };
}

async function run(ok){
  const O = require('./omr.js'), Y = require('./testomrsynth.js'), T = require('./scripts/omr-templates.js');
  console.log('\n[46] OMR: dizek ve simgeler');
  const t0 = Date.now(), ms = () => ((Date.now() - t0)/1000).toFixed(1) + ' sn';
  const prep = page => { const b = O.binarize(page, 'auto'), d = O.deskew(b); return { ...d, st:O.findStaves(d.bin) }; };

  // Dizek bulma, eğiklik, ölçek
  const spec = beamlessSpec(), page = await Y.renderPage(spec), p = prep(page);
  ok(p.st.staves.length === 8 && Math.abs(p.st.sp - 14) <= 0.5, 'sentetik sayfada 8 dizek, sp 14 ±0,5', p.st.staves.length + ' dizek, sp ' + p.st.sp.toFixed(2));
  const pr = prep(await Y.renderPage(beamlessSpec({ rotate:2 })));
  ok(Math.abs(pr.angle - 2) <= 0.3 && pr.st.staves.length === 8, 'rotate 2°: eğiklik 2 ±0,3, düzeltince 8 dizek', pr.angle + '°, ' + pr.st.staves.length + ' dizek');
  const ps = prep(await Y.renderPage(beamlessSpec({ scale:0.6 })));
  ok(Math.abs(ps.st.sp - 8.4) <= 0.5 && ps.st.staves.length === 8, 'scale 0,6: sp 8,4 ±0,5', ps.st.sp.toFixed(2) + ', ' + ps.st.staves.length + ' dizek');
  const blank = O.findStaves(O.binarize({ data:new Uint8Array(1200*1600).fill(255), width:1200, height:1600 }, 'auto'));
  ok(Array.isArray(blank.staves) && blank.staves.length === 0, 'bos beyaz sayfa: dizek yok');
  {
    const tp = require('./omrtemplates.js'), all = Object.values(tp.classes).flat(), u = new Uint8Array([0, 255, 7, 128, 64]);
    ok(all.every(b => { const a = O.fromB64(b), p = O.fromB64(b, true); return a.length === O.GRID*O.GRID && p.length === a.length && p.every((v, i) => v === a[i]); })
      && O.fromB64(O.toB64(u), true).join() === u.join() && Object.keys(tp.classes).length === O.CLASSES.length - 1,
      'kaliplar: her sinif var, base64 (atob olmadan da) cozuluyor', all.length + ' kalip');
  }
  console.log('    (dizekler ' + ms() + ')');

  // Çizgi silme ve nota başları: kirişsiz sayfada baş sayısı = nota sayısı
  {
    const clean = O.removeStaffLines(p.bin, p.st.staves, p.st);
    const syms = O.symbols(clean, p.st.sp, p.st.staves);
    const heads = syms.filter(s => /^head_/.test(s.cls)), want = spec.notes.filter(n => !n.rest).length;
    ok(heads.length === want, 'cizgi silinince nota basi sayisi = nota sayisi (kirissiz sayfa)', heads.length + ' / ' + want);
    // Başlar doğru yerde: her nota kutusunda tam bir baş (kutular deskew'den önceki pikselde; açı 0)
    let inBox = 0;
    page.truth.boxes.forEach((b, i) => { if(spec.notes[i].rest || !b) return;
      if(heads.filter(h => h.x + h.w/2 >= b.x - 2 && h.x + h.w/2 <= b.x + b.w + 2 && h.y + h.h/2 >= b.y - 2 && h.y + h.h/2 <= b.y + b.h + 2).length === 1) inBox++; });
    ok(inBox === want, 'her notanin kutusunda tek bas', inBox + ' / ' + want);
    const rests = syms.filter(s => /^rest_/.test(s.cls)).length, wantR = spec.notes.filter(n => n.rest).length;
    ok(rests === wantR, 'suslar bulunuyor', rests + ' / ' + wantR);
    // Gölgeli fotoğraf benzeri sayfa (kâğıt bir köşede koyulaşıyor): auto Sauvola seçer, okuma değişmez
    const W = page.width, H = page.height, g = new Uint8Array(page.data.length);
    for(let y = 0; y < H; y++) for(let x = 0; x < W; x++) g[y*W + x] = 30 + (page.data[y*W + x] - 30)*(1 - 0.7*(x/W)*(y/H));
    const sb = O.binarize({ data:g, width:W, height:H }, 'auto'), sst = O.findStaves(sb);
    const sh = O.symbols(O.removeStaffLines(sb, sst.staves, sst), sst.sp, sst.staves).filter(s => /^head_/.test(s.cls)).length;
    ok(sb.method === 'sauvola' && sst.staves.length === 8 && sh === want, 'golgeli sayfa: Sauvola, 8 dizek, bas sayisi tutuyor', sb.method + ', ' + sst.staves.length + ' dizek, ' + sh + ' bas');
    // Bozulmalı Leland sayfası (bulanık, gürültülü, 1,2° eğik, %90): baş sayısı ±%5
    const ls = beamlessSpec({ blur:0.6, noise:0.08, rotate:1.2, scale:0.9 }); ls.font = 'leland';
    const lp = prep(await Y.renderPage(ls)), lh = O.symbols(O.removeStaffLines(lp.bin, lp.st.staves, lp.st), lp.st.sp, lp.st.staves).filter(s => /^head_/.test(s.cls)).length;
    ok(lp.st.staves.length === 8 && Math.abs(lh - want) <= 0.05*want, 'bozulmali Leland sayfasi: bas sayisi ±%5', lh + ' / ' + want);
    console.log('    (bas sayimi ' + ms() + ')');
  }

  // Sınıflama: her sınıf, Bravura ve Leland, birkaç ölçek ve bozulma ile ≥ %95
  {
    const stat = {};                                  // font → sınıf → { n, ok, wrong:{} }
    for(const font of ['bravura', 'leland']){
      stat[font] = {};
      for(const sp of [11, 14, 17]) for(const dg of [null, { blur:0.6, noise:0.06 }]){
        const sh = await renderSheet(font, sp, dg, T.CLASS_GLYPHS);
        const b = O.binarize(sh, 'auto'), st = O.findStaves(b), clean = O.removeStaffLines(b, st.staves, st);
        const syms = O.symbols(clean, st.sp, st.staves).filter(x => x.cls !== 'stem');
        for(const bx of sh.boxes){
          const m = 0.25*sp, inside = syms.filter(c => c.x + c.w/2 >= bx.x - m && c.x + c.w/2 <= bx.x + bx.w + m && c.y + c.h/2 >= bx.y - m && c.y + c.h/2 <= bx.y + bx.h + m);
          const s = stat[font][bx.cls] || (stat[font][bx.cls] = { n:0, ok:0, wrong:{} }); s.n++;
          if(!inside.length){ s.wrong.yok = (s.wrong.yok || 0) + 1; continue; }
          const r = inside.reduce((a, x) => x.area > a.area ? x : a);
          if(r.cls === bx.cls) s.ok++; else s.wrong[r.cls] = (s.wrong[r.cls] || 0) + 1;
        }
      }
    }
    for(const font of ['bravura', 'leland']){
      const bad = Object.entries(stat[font]).filter(([, s]) => s.ok/s.n < 0.95);
      const total = Object.values(stat[font]).reduce((a, s) => [a[0] + s.ok, a[1] + s.n], [0, 0]);
      ok(Object.keys(stat[font]).length === Object.keys(T.CLASS_GLYPHS).length && !bad.length,
        `${font}: her sinif kendi sinifina >= %95 (${total[0]}/${total[1]})`, bad.map(([c, s]) => `${c} ${s.ok}/${s.n} ${JSON.stringify(s.wrong)}`).join('; '));
    }
    console.log('    (siniflama ' + ms() + ')');
  }
}

module.exports = { run, renderSheet, beamlessSpec };
