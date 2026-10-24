// Resimden notaya (OMR), birinci yarı: ikilileştirme, eğiklik düzeltme, dizek bulma, çizgi silme, bağlı bileşenler,
// sap ayırma ve kalıpla simge sınıflama. Yapay zekâ yok; saf JS, tarayıcıya bağımlı değil: sayfada, Worker'da
// (importScripts) ve Node'da çalışır. Kalıplar omrtemplates.js'ten gelir (tarayıcıda ondan önce yüklenir).
// Girdi resmi: { data:Uint8Array (gri; 3/4 kanal da olur), width, height, channels? }. İkili resim: { bits (1 = siyah), width, height }.

const OMR = (() => {
  const G = 32;                                     // normalleştirilmiş simge ızgarası (G×G)
  const CLASSES = ["head_black", "head_half", "head_whole", "rest_1", "rest_2", "rest_4", "rest_8", "rest_16", "clef_g",
    "sharp", "flat", "natural", "aeu_koma_sharp", "aeu_bakiye_sharp", "aeu_buyuk_sharp", "aeu_koma_flat", "aeu_kucuk_flat",
    "aeu_buyuk_flat", "segno", "measure_repeat", "dot", "digit_0", "digit_1", "digit_2", "digit_3", "digit_4", "digit_5",
    "digit_6", "digit_7", "digit_8", "digit_9", "other"];

  // ---- base64 (Worker'da Buffer yok; atob varsa o) ----
  const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function fromB64(s, pure){
    if(typeof atob === "function" && !pure){ const t = atob(s), out = new Uint8Array(t.length); for(let i = 0; i < t.length; i++) out[i] = t.charCodeAt(i); return out; }
    const clean = s.replace(/=+$/, ""), out = new Uint8Array(Math.floor(clean.length*3/4));
    let bits = 0, acc = 0, o = 0;
    for(let i = 0; i < clean.length; i++){ acc = (acc << 6) | B64.indexOf(clean[i]); bits += 6; if(bits >= 8){ bits -= 8; out[o++] = (acc >> bits) & 255; } }
    return out;
  }
  function toB64(u8){
    let s = "";
    for(let i = 0; i < u8.length; i += 3){
      const a = u8[i], b = u8[i + 1], c = u8[i + 2], n = (a << 16) | ((b || 0) << 8) | (c || 0);
      s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < u8.length ? B64[(n >> 6) & 63] : "=") + (i + 2 < u8.length ? B64[n & 63] : "=");
    }
    return s;
  }

  // ---- Kalıplar (ilk kullanımda çözülür) ----
  let TPL = null;
  function templates(){
    if(TPL) return TPL;
    const src = typeof OMR_TEMPLATES !== "undefined" ? OMR_TEMPLATES : (typeof module !== "undefined" ? require("./omrtemplates.js") : null);
    TPL = [];
    if(!src) return TPL;
    for(const cls of Object.keys(src.classes)){
      src.classes[cls].forEach((b, i) => {
        const u = fromB64(b), g = new Float32Array(u.length); let sum = 0;
        for(let k = 0; k < u.length; k++){ g[k] = u[k]/255; sum += g[k]; }
        TPL.push({ cls, g, sum, dim:src.dims[cls][i] });
      });
    }
    return TPL;
  }

  // ---- 1) İkilileştirme ----
  function greyOf(img){
    const n = img.width*img.height, ch = img.channels || Math.round(img.data.length/n);
    if(ch === 1) return img.data;
    const g = new Uint8Array(n), d = img.data;
    for(let i = 0, j = 0; i < n; i++, j += ch){
      const v = 0.299*d[j] + 0.587*d[j + 1] + 0.114*d[j + 2];
      g[i] = ch === 4 ? 255 - (255 - v)*d[j + 3]/255 : v;    // saydam = beyaz
    }
    return g;
  }
  function otsu(g){
    const h = new Float64Array(256); for(let i = 0; i < g.length; i++) h[g[i]]++;
    let sum = 0; for(let i = 0; i < 256; i++) sum += i*h[i];
    let wB = 0, sB = 0, best = -1, t = -1;
    for(let i = 0; i < 256; i++){
      wB += h[i]; if(!wB) continue; const wF = g.length - wB; if(!wF) break;
      sB += i*h[i]; const mB = sB/wB, mF = (sum - sB)/wF, v = wB*wF*(mB - mF)*(mB - mF);
      if(v > best){ best = v; t = i; }
    }
    return best > 0 ? t : -1;                       // tek renkli resim: siyah yok
  }
  // Sauvola: yerel ortalama ve sapmaya göre eşik (gölgeli fotoğraflar); toplamlar tümlev resminden
  function sauvola(g, W, H, win, k){
    const W1 = W + 1, S = new Float64Array(W1*(H + 1)), Q = new Float64Array(W1*(H + 1)), bits = new Uint8Array(W*H);
    for(let y = 0; y < H; y++){ let rs = 0, rq = 0;
      for(let x = 0; x < W; x++){ const v = g[y*W + x]; rs += v; rq += v*v; S[(y + 1)*W1 + x + 1] = S[y*W1 + x + 1] + rs; Q[(y + 1)*W1 + x + 1] = Q[y*W1 + x + 1] + rq; } }
    const r = win >> 1;
    for(let y = 0; y < H; y++){ const y0 = Math.max(0, y - r), y1 = Math.min(H, y + r + 1);
      for(let x = 0; x < W; x++){ const x0 = Math.max(0, x - r), x1 = Math.min(W, x + r + 1), n = (x1 - x0)*(y1 - y0);
        const s = S[y1*W1 + x1] - S[y0*W1 + x1] - S[y1*W1 + x0] + S[y0*W1 + x0], q = Q[y1*W1 + x1] - Q[y0*W1 + x1] - Q[y1*W1 + x0] + Q[y0*W1 + x0];
        const m = s/n, sd = Math.sqrt(Math.max(0, q/n - m*m));
        bits[y*W + x] = g[y*W + x] <= m*(1 + k*(sd/128 - 1)) && g[y*W + x] < 200 ? 1 : 0; } }
    return bits;
  }
  // method "auto": kâğıt parlaklığı resim boyunca çok değişiyorsa (gölge, fotoğraf) Sauvola, yoksa Otsu
  function binarize(img, method){
    const W = img.width, H = img.height, g = greyOf(img); method = method || "auto";
    const t = otsu(g);
    if(method === "auto"){
      const n = 8, bg = [];
      for(let ty = 0; ty < n; ty++) for(let tx = 0; tx < n; tx++){
        let s = 0, c = 0;
        for(let y = Math.floor(ty*H/n); y < Math.floor((ty + 1)*H/n); y += 2) for(let x = Math.floor(tx*W/n); x < Math.floor((tx + 1)*W/n); x += 2){ const v = g[y*W + x]; if(v > t){ s += v; c++; } }
        if(c > 20) bg.push(s/c);
      }
      method = bg.length && Math.max(...bg) - Math.min(...bg) > 40 ? "sauvola" : "otsu";
    }
    let bits;
    if(method === "sauvola") bits = sauvola(g, W, H, Math.max(15, Math.min(81, Math.round(Math.min(W, H)/40)) | 1), 0.2);
    else { bits = new Uint8Array(W*H); for(let i = 0; i < bits.length; i++) bits[i] = g[i] <= t ? 1 : 0; }
    return { bits, width:W, height:H, method };
  }

  // ---- 2) Eğiklik: ±5°, yatay izdüşümün en sivri olduğu açı (0,25° adım, sonra 0,05° ile inceltme) ----
  // angle: resmin saat yönünde (y aşağı) ne kadar döndüğü; bin düzeltilmiş resimdir
  function deskew(bin){
    const { bits, width:W, height:H } = bin;
    let cnt = 0; for(let i = 0; i < bits.length; i++) cnt += bits[i];
    if(cnt < 50) return { bin, angle:0 };
    const step = Math.max(1, Math.floor(cnt/250000)), xs = [], ys = [];
    for(let i = 0, k = 0; i < bits.length; i++) if(bits[i] && (k++ % step) === 0){ xs.push(i % W - W/2); ys.push(Math.floor(i/W) - H/2); }
    const off = Math.ceil(W*0.1 + H/2 + 2), hist = new Float64Array(2*off + H);
    const score = deg => {
      const a = deg*Math.PI/180, c = Math.cos(a), s = Math.sin(a); hist.fill(0);
      for(let i = 0; i < xs.length; i++) hist[Math.round(ys[i]*c - xs[i]*s) + off]++;
      let sc = 0; for(let i = 0; i < hist.length; i++) sc += hist[i]*hist[i]; return sc;
    };
    let best = 0, bs = -1;
    for(let d = -5; d <= 5 + 1e-9; d += 0.25){ const sc = score(d); if(sc > bs){ bs = sc; best = d; } }
    const coarse = best;
    for(let d = coarse - 0.2; d <= coarse + 0.2 + 1e-9; d += 0.05){ const sc = score(d); if(sc > bs){ bs = sc; best = d; } }
    best = Math.round(best*100)/100;
    if(Math.abs(best) < 0.05) return { bin, angle:0 };
    return { bin:rotate(bin, -best), angle:best };
  }
  // İkili resmi deg derece (saat yönü) döndürür; boyut aynı, dışarısı beyaz
  function rotate(bin, deg){
    const { bits, width:W, height:H } = bin, out = new Uint8Array(W*H), a = -deg*Math.PI/180, c = Math.cos(a), s = Math.sin(a), cx = W/2, cy = H/2;
    for(let y = 0; y < H; y++){ const dy = y + 0.5 - cy;
      for(let x = 0; x < W; x++){ const dx = x + 0.5 - cx, sx = Math.floor(cx + dx*c - dy*s), sy = Math.floor(cy + dx*s + dy*c);
        if(sx >= 0 && sy >= 0 && sx < W && sy < H) out[y*W + x] = bits[sy*W + sx]; } }
    return { bits:out, width:W, height:H, method:bin.method };
  }

  // ---- 3) Dizek bulma ----
  // Dikey koşulardan çizgi kalınlığı (en sık siyah koşu) ve aralık (en sık beyaz koşu); uzun yatay koşulu satırlar
  // çizgi adayıdır, sp aralıklı 5'li gruplar dizektir.
  function findStaves(bin){
    const { bits, width:W, height:H } = bin;
    const bh = new Float64Array(H + 1), wh = new Float64Array(H + 1);
    for(let x = 0; x < W; x += 2){
      let y = 0, prevBlack = false;
      while(y < H){
        const v = bits[y*W + x]; let e = y; while(e < H && bits[e*W + x] === v) e++;
        if(v) { bh[e - y]++; prevBlack = true; }
        else if(prevBlack && e < H) wh[e - y]++;
        y = e;
      }
    }
    let line = 0; for(let i = 1; i <= H; i++) if(bh[i] > bh[line]) line = i;
    if(!line) return { sp:0, line:0, staves:[] };
    let gap = 0; for(let i = Math.max(2, line); i <= H; i++) if(wh[i] > (wh[gap] || 0)) gap = i;
    const sp0 = line + gap;
    // Satırın en uzun siyah koşusu (≤ 2 piksellik boşluklar kapatılır)
    const run = new Float64Array(H); let maxRun = 0;
    for(let y = 0; y < H; y++){
      let best = 0, cur = 0, holes = 0;
      for(let x = 0; x < W; x++){
        if(bits[y*W + x]){ cur += 1 + holes; holes = 0; if(cur > best) best = cur; }
        else if(cur && holes < 2) holes++; else { cur = 0; holes = 0; }
      }
      run[y] = best; if(best > maxRun) maxRun = best;
    }
    const thr = Math.max(6*sp0, 0.3*maxRun), bands = [];
    for(let y = 0; y < H; y++){
      if(run[y] < thr) continue;
      let e = y, s = 0, sy = 0; while(e < H && run[e] >= thr){ s += run[e]; sy += run[e]*e; e++; }
      if(e - y <= Math.max(2*line + 2, 0.5*sp0)) bands.push(sy/s);
      y = e;
    }
    // 5'li gruplar
    const staves = [], used = new Set();
    for(let i = 0; i < bands.length; i++){
      if(used.has(i)) continue;
      const chain = [i]; let d1 = 0;
      while(chain.length < 5){
        const last = bands[chain[chain.length - 1]]; let pick = -1, pd = 1e9;
        for(let j = chain[chain.length - 1] + 1; j < bands.length && bands[j] - last < 1.5*sp0; j++){
          const d = bands[j] - last, dev = Math.abs(d - (d1 || sp0));
          if(dev <= (d1 ? 0.2*d1 + 1 : 0.3*sp0) && dev < pd){ pd = dev; pick = j; }
        }
        if(pick < 0) break;
        if(!d1) d1 = bands[pick] - last;
        chain.push(pick);
      }
      if(chain.length < 5) continue;
      chain.forEach(j => used.add(j));
      const y = chain.map(j => bands[j]);
      // Yatay sınırlar: 5 çizginin en az 3'ünde siyah olan sütunların en uzun dizisi (sp'den kısa boşluklar kapatılır)
      const r = Math.max(1, Math.ceil(line/2) + 1);
      let bx0 = -1, bx1 = -1, cx0 = -1, last = -1e9;
      for(let x = 0; x < W; x++){
        let n = 0;
        for(const yy of y){ const yc = Math.round(yy); for(let d = -r; d <= r; d++){ const q = yc + d; if(q >= 0 && q < H && bits[q*W + x]){ n++; break; } } }
        if(n >= 3){ if(x - last > sp0) cx0 = x; last = x; if(bx0 < 0 || x - cx0 > bx1 - bx0){ bx0 = cx0; bx1 = x; } }
      }
      staves.push({ y, x0:bx0, x1:bx1 });
    }
    const sp = staves.length ? staves.reduce((a, s) => a + (s.y[4] - s.y[0])/4, 0)/staves.length : sp0;
    return { sp, line, staves };
  }

  // ---- 5) Çizgi silme ----
  // Dizek ve ek çizgi yerlerinde, sütundaki siyah koşu çizgi bandının içinde kalıyorsa (üstünde ve altında siyah
  // yoksa) silinir; nota başı gibi çizgiyi aşan şekiller kalır. Çizgi yeri sütun sütun izlenir (hafif eğrilik).
  function removeStaffLines(bin, staves, info){
    const { width:W, height:H } = bin, bits = new Uint8Array(bin.bits);
    const line = (info && info.line) || 2, h = line/2 + 1;
    // yc yakınındaki koşu: [a, b] ya da null
    const runAt = (x, yc) => {
      for(let d = 0; d <= h + 1; d++) for(const q of [Math.round(yc) + d, Math.round(yc) - d]){
        if(q < 0 || q >= H || !bits[q*W + x]) continue;
        let a = q, b = q; while(a > 0 && bits[(a - 1)*W + x]) a--; while(b < H - 1 && bits[(b + 1)*W + x]) b++;
        return [a, b];
      }
      return null;
    };
    const thin = (r, yc) => r && r[0] >= yc - h && r[1] <= yc + h;
    for(const st of staves){
      const spS = (st.y[4] - st.y[0])/4, yc = st.y.slice(), x0 = Math.max(0, st.x0 - Math.round(spS)), x1 = Math.min(W - 1, st.x1 + Math.round(spS));
      // Ek çizgiler: önce adaylar (yatay ince parçalar), sonra silme; dizek çizgisi silinmeden önce bakılır
      const ledgerCols = [];
      for(let k = 1; k <= 5; k++) for(const base of [0, 4]){
        const yy = base === 0 ? st.y[0] - k*spS : st.y[4] + k*spS;
        if(yy < 0 || yy >= H) continue;
        // ince parçalar; kısa parça da silinir, yanında (1,5 sp içinde) uzun bir ek çizgi parçası varsa
        // (iki simge arasında kalan ek çizgi kırıntısı)
        const segs = []; let seg = [];
        const flush = () => { if(seg.length) segs.push(seg); seg = []; };
        for(let x = x0; x <= x1; x++){ const r = runAt(x, yy); if(thin(r, yy)) seg.push([x, r]); else flush(); }
        flush();
        // ek çizgi yataydır: parçadaki koşu ortaları en çok 1 piksel oynar (eğik ince çizgiler, ör. bemol
        // üstündeki çizikler, silinmez)
        const mid = s => s.map(c => (c[1][0] + c[1][1])/2), flat = s => { const m = mid(s); return Math.max(...m) - Math.min(...m) <= 1; };
        const avg = s => mid(s).reduce((a, v) => a + v, 0)/s.length;
        const long = segs.filter(s => s.length >= 0.3*spS && flat(s));
        for(const s of segs)
          if(long.includes(s) || (flat(s) && long.some(t => t[0][0] - s[s.length - 1][0] <= 1.5*spS && s[0][0] - t[t.length - 1][0] <= 1.5*spS && Math.abs(avg(t) - avg(s)) <= 1)))
            for(const c of s) ledgerCols.push(c);
      }
      // Çizginin üst ve alt kenarı da izlenir: çizgiden kalın ama bandı aşmayan koşuda (çizgiye teğet ince yay:
      // boş baş, rakam) yalnızca çizginin kendi satırları silinir, yay kopmaz
      const top = yc.map(y => y - (line - 1)/2), bot = yc.map(y => y + (line - 1)/2);
      // Bu dizekte yalın çizgi koşusunun boyu: bant içi koşuların %85'i (döndürülmüş, bulanık resimde çizgi kalınlaşır)
      const lens = [];
      for(let x = x0; x <= x1; x += 2) for(let l = 0; l < 5; l++){ const r = runAt(x, st.y[l]); if(thin(r, st.y[l])) lens.push(r[1] - r[0] + 1); }
      lens.sort((a, b) => a - b);
      const pure = Math.max(line, lens.length ? lens[Math.floor(lens.length*0.85)] : line);
      for(let x = x0; x <= x1; x++){
        for(let l = 0; l < 5; l++){
          const r = runAt(x, yc[l]);
          if(!thin(r, yc[l])) continue;
          if(r[1] - r[0] + 1 <= pure){
            for(let q = r[0]; q <= r[1]; q++) bits[q*W + x] = 0;
            yc[l] = 0.7*yc[l] + 0.3*(r[0] + r[1])/2; top[l] = 0.8*top[l] + 0.2*r[0]; bot[l] = 0.8*bot[l] + 0.2*r[1];
          } else for(let q = Math.max(r[0], Math.round(top[l])); q <= Math.min(r[1], Math.round(bot[l])); q++) bits[q*W + x] = 0;
        }
      }
      for(const [x, r] of ledgerCols) for(let q = r[0]; q <= r[1]; q++) bits[q*W + x] = 0;
    }
    // removed: silinen pikseller (çizgiye denk gelip kopan simge parçalarını yeniden birleştirmek için)
    const removed = new Uint8Array(W*H); for(let i = 0; i < removed.length; i++) removed[i] = bin.bits[i] & (bits[i] ^ 1);
    return { bits, width:W, height:H, method:bin.method, removed };
  }

  // ---- Bağlı bileşenler (8 komşu) ----
  function components(bin){
    const { bits, width:W, height:H } = bin, seen = new Uint8Array(W*H), stack = new Int32Array(W*H), out = [];
    for(let i = 0; i < bits.length; i++){
      if(!bits[i] || seen[i]) continue;
      let sp = 0, n = 0, x0 = W, y0 = H, x1 = -1, y1 = -1; const px = [];
      stack[sp++] = i; seen[i] = 1;
      while(sp){
        const p = stack[--sp], x = p % W, y = (p - x)/W; px.push(p); n++;
        if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y;
        for(let dy = -1; dy <= 1; dy++){ const yy = y + dy; if(yy < 0 || yy >= H) continue;
          for(let dx = -1; dx <= 1; dx++){ const xx = x + dx; if(xx < 0 || xx >= W) continue; const q = yy*W + xx;
            if(bits[q] && !seen[q]){ seen[q] = 1; stack[sp++] = q; } } }
      }
      out.push({ x:x0, y:y0, w:x1 - x0 + 1, h:y1 - y0 + 1, area:n, pixels:Int32Array.from(px) });
    }
    return out;
  }

  // ---- Normalleştirme: bileşen kutusu G×G ızgaraya (her hücrede 3×3 örnekle doluluk, 0..1) ----
  function maskOf(comp, bin){
    const W = bin.width, m = new Uint8Array(comp.w*comp.h);
    if(comp.pixels) for(const p of comp.pixels){ const x = p % W, y = (p - x)/W; m[(y - comp.y)*comp.w + x - comp.x] = 1; }
    else for(let y = 0; y < comp.h; y++) for(let x = 0; x < comp.w; x++) m[y*comp.w + x] = bin.bits[(comp.y + y)*W + comp.x + x];
    return m;
  }
  function gridOf(comp, bin, mask){
    const m = mask || maskOf(comp, bin), g = new Float32Array(G*G);
    for(let cy = 0; cy < G; cy++) for(let cx = 0; cx < G; cx++){
      let s = 0;
      for(let sy = 0; sy < 3; sy++) for(let sx = 0; sx < 3; sx++){
        const x = Math.min(comp.w - 1, Math.floor((cx + (sx + 0.5)/3)*comp.w/G)), y = Math.min(comp.h - 1, Math.floor((cy + (sy + 0.5)/3)*comp.h/G));
        s += m[y*comp.w + x];
      }
      g[cy*G + cx] = s/9;
    }
    return g;
  }
  // Kapalı boşluk oranı: kutunun kenarından ulaşılamayan beyaz pikseller / kutu alanı (boş baş)
  function holeOf(comp, bin, mask){
    const m = mask || maskOf(comp, bin), w = comp.w, h = comp.h, seen = new Uint8Array(w*h), st = [];
    const push = i => { if(!m[i] && !seen[i]){ seen[i] = 1; st.push(i); } };
    for(let x = 0; x < w; x++){ push(x); push((h - 1)*w + x); }
    for(let y = 0; y < h; y++){ push(y*w); push(y*w + w - 1); }
    while(st.length){ const i = st.pop(), x = i % w, y = (i - x)/w;
      if(x > 0) push(i - 1); if(x < w - 1) push(i + 1); if(y > 0) push(i - w); if(y < h - 1) push(i + w); }
    let n = 0; for(let i = 0; i < m.length; i++) if(!m[i] && !seen[i]) n++;
    return n/(w*h);
  }

  // ---- 6) Sınıflama: Jaccard benzerliği × boyut uyumu (sp cinsinden) ----
  // staff verilirse birlik/ikilik sus ayrımı dizek çizgisine göre yapılır (birlik çizgiden sarkar, ikilik çizgiye oturur)
  function classify(comp, bin, sp, staff){
    const T = templates(), mask = maskOf(comp, bin), g = gridOf(comp, bin, mask);
    let gs = 0; for(let i = 0; i < g.length; i++) gs += g[i];
    const best = {};
    for(const t of T){
      let mn = 0; for(let i = 0; i < g.length; i++) mn += g[i] < t.g[i] ? g[i] : t.g[i];
      const J = mn/(gs + t.sum - mn || 1);
      const lw = Math.log((comp.w + 1)/(t.dim[0]*sp + 1)), lh = Math.log((comp.h + 1)/(t.dim[1]*sp + 1));
      const sc = J*Math.exp(-(lw*lw + lh*lh)/(2*0.2*0.2));
      if(!(t.cls in best) || sc > best[t.cls]) best[t.cls] = sc;
    }
    // İçinde kapalı boşluk olan leke dolu baş olamaz (küçük ölçekte boş başın deliği kalıpta kaybolur)
    if(best.head_black && holeOf(comp, bin, mask) >= 0.04) best.head_black *= 0.5;
    let cls = "other", conf = 0, second = 0;
    for(const c in best){ if(best[c] > conf){ second = conf; conf = best[c]; cls = c; } else if(best[c] > second) second = best[c]; }
    if(conf < 0.35) return { cls:"other", conf, best:cls };
    if((cls === "rest_1" || cls === "rest_2") && staff){
      const near = y => Math.min(...staff.y.map(l => Math.abs(l - y)));
      cls = near(comp.y) < near(comp.y + comp.h - 1) ? "rest_1" : "rest_2";
    }
    return { cls, conf, margin:conf - second };
  }

  // ---- Sap ayırma: ≥ 2,5 sp dikey koşuların sap kalınlığındaki ince kısmı silinir, kalan lekeler döner ----
  function splitStems(comp, bin, sp){
    const W = bin.width, w = comp.w, h = comp.h, m = new Uint8Array(w*h);
    for(const p of comp.pixels){ const x = p % W, y = (p - x)/W; m[(y - comp.y)*w + x - comp.x] = 1; }
    const minLen = 2.5*sp, maxW = Math.max(2, Math.round(0.3*sp + 1)), cut = new Uint8Array(w*h), stems = [];
    const hrun = (x, y) => { let a = x, b = x; while(a > 0 && m[y*w + a - 1]) a--; while(b < w - 1 && m[y*w + b + 1]) b++; return b - a + 1; };
    // Dikey koşular yan yana iki sütunun birleşiminde ve 1 piksellik kopukluklar atlanarak aranır (döndürülmüş ya da
    // gürültülü resimde ince sap sütun değiştirir)
    const col = (x, y) => m[y*w + x] || (x + 1 < w && m[y*w + x + 1]);
    for(let x = 0; x < w; x++){
      let y = 0;
      while(y < h){
        if(!col(x, y)){ y++; continue; }
        let e = y; while(e < h && (col(x, e) || (e + 1 < h && col(x, e + 1)))) e++;
        if(e - y >= minLen){
          // sapın kendi kalınlığı: koşudaki yatay genişliklerin ortancası; ondan 1 fazlasına kadar olan satırlar
          // kesilir (sapa bitişik boş baş kenarı daha geniştir, kalır)
          const ws = [];
          for(let q = y; q < e; q++) for(const cx of [x, x + 1]) if(cx < w && m[q*w + cx]) ws.push(hrun(cx, q));
          ws.sort((a, b) => a - b);
          const lim = Math.min(maxW, ws[ws.length >> 1] + 1);
          // yalnızca ≥ 0,6 sp süren ince kısımlar kesilir: boş başın sapa bitişik kısa yan duvarı kalır
          // satırda yakında (1,2 sp) başka parça varsa (boş başın öbür duvarı) orası baştır, kesilmez
          const alone = (cx, q) => { let a = cx, b = cx; while(a > 0 && m[q*w + a - 1]) a--; while(b < w - 1 && m[q*w + b + 1]) b++;
            const r = Math.round(1.2*sp);
            for(let k = Math.max(0, a - r); k < a - 1; k++) if(m[q*w + k]) return false;
            for(let k = b + 2; k <= Math.min(w - 1, b + r); k++) if(m[q*w + k]) return false;
            return true; };
          const narrow = q => [x, x + 1].every(cx => cx >= w || !m[q*w + cx] || (hrun(cx, q) <= lim && alone(cx, q)));
          let y0 = -1, y1 = -1;
          for(let q = y; q < e; ){
            if(!narrow(q)){ q++; continue; }
            // tek satırlık genişleme (pürüz) parçayı bölmez
            let qe = q; while(qe < e && (narrow(qe) || (qe + 1 < e && narrow(qe + 1) && qe > q))) qe++;
            if(qe - q >= 0.6*sp){
              for(let r = q; r < qe; r++) if(narrow(r)) for(const cx of [x, x + 1]) if(cx < w && m[r*w + cx]) cut[r*w + cx] = 1;
              if(y0 < 0) y0 = q; y1 = qe - 1;
            }
            q = qe;
          }
          if(y0 >= 0 && y1 - y0 >= 0.5*minLen) stems.push({ x:comp.x + x, y0:comp.y + y0, y1:comp.y + y1 });
        }
        y = e;
      }
    }
    // ince sütunları birleştir (bir sap 1–3 sütun)
    const merged = [];
    stems.sort((a, b) => a.x - b.x).forEach(s => { const l = merged[merged.length - 1];
      if(l && s.x - l.x1 <= 1 && Math.min(s.y1, l.y1) > Math.max(s.y0, l.y0)){ l.x1 = s.x; l.y0 = Math.min(l.y0, s.y0); l.y1 = Math.max(l.y1, s.y1); }
      else merged.push({ x:s.x, x1:s.x, y0:s.y0, y1:s.y1 }); });
    for(let i = 0; i < m.length; i++) if(cut[i]) m[i] = 0;
    const sub = components({ bits:m, width:w, height:h }).filter(c => c.area >= 0.05*sp*sp);
    const blobs = sub.map(c => ({ x:c.x + comp.x, y:c.y + comp.y, w:c.w, h:c.h, area:c.area,
      pixels:c.pixels.map(p => { const x = p % w, y = (p - x)/w; return (y + comp.y)*W + x + comp.x; }) }));
    return { stems:merged.map(s => ({ x:(s.x + s.x1)/2, w:s.x1 - s.x + 1, y0:s.y0, y1:s.y1 })), blobs };
  }

  // Dolu başlar için kayan pencere: sp×sp penceresinde doluluk ≥ 0,7 olan yerel en yüksekler (akor, bitişik başlar)
  function blackHeads(comp, bin, sp){
    const W = bin.width, w = comp.w, h = comp.h, I = new Float64Array((w + 1)*(h + 1));
    const m = new Uint8Array(w*h); for(const p of comp.pixels){ const x = p % W, y = (p - x)/W; m[(y - comp.y)*w + x - comp.x] = 1; }
    for(let y = 0; y < h; y++){ let r = 0; for(let x = 0; x < w; x++){ r += m[y*w + x]; I[(y + 1)*(w + 1) + x + 1] = I[y*(w + 1) + x + 1] + r; } }
    const s = Math.max(2, Math.round(sp*0.9)), hits = [];
    for(let y = 0; y + s <= h; y++) for(let x = 0; x + s <= w; x++){
      const f = (I[(y + s)*(w + 1) + x + s] - I[y*(w + 1) + x + s] - I[(y + s)*(w + 1) + x] + I[y*(w + 1) + x])/(s*s);
      if(f >= 0.7) hits.push({ x, y, f });
    }
    hits.sort((a, b) => b.f - a.f);
    const out = [];
    for(const t of hits) if(out.every(o => Math.abs(o.x - t.x) >= 0.8*sp || Math.abs(o.y - t.y) >= 0.8*sp)) out.push(t);
    return out.map(t => ({ x:comp.x + t.x - Math.round(0.15*sp), y:comp.y + t.y, w:Math.round(s*1.3), h:s, area:Math.round(t.f*s*s), cls:"head_black", conf:0.6 }));
  }

  // ---- Simgeler: bileşenler sınıflanır; sapı olan nota (≥ 2,5 sp yüksek, kalıba uymayan) sapından ayrılır ----
  // Çizgi silinirken dizek çizgisine denk gelen ince yaylar kopabilir (birlik başın üstü, bemolün karnı): silinmiş
  // kısa yatay boşluklar köprülenir, köprüyle birleşen bileşenler tek simge olarak da sınıflanır ve daha iyi
  // uyuyorsa parçaların yerine geçer. Dönüş: [{ x, y, w, h, area, cls, conf, pixels? }]; saplar cls:"stem"
  function symbols(bin, sp, staves){
    const W = bin.width, H = bin.height;
    const mid = s => (s.y[0] + s.y[4])/2, near = c => staves && staves.length ? staves.reduce((a, s) => Math.abs(mid(s) - (c.y + c.h/2)) < Math.abs(mid(a) - (c.y + c.h/2)) ? s : a) : null;
    const comps = components(bin).filter(c => c.area >= Math.max(2, 0.03*sp*sp));
    const solve = c => {
      const r = classify(c, bin, sp, near(c)), rc = r.cls === "other" ? 0 : r.conf;
      if(c.h >= 2.5*sp){
        const sp_ = splitStems(c, bin, sp);
        if(sp_.stems.length){
          const parts = [];
          for(const b of sp_.blobs){
            const rb = classify(b, bin, sp, near(b));
            if(rb.cls === "other" && (b.h > 1.3*sp || b.w > 1.8*sp)){ const hs = blackHeads(b, bin, sp); if(hs.length){ parts.push(...hs); continue; } }
            parts.push({ ...b, cls:rb.cls, conf:rb.conf });
          }
          // nota başı sapın bir ucundadır; uçta olmayan baş benzeri leke (ör. bitişik ölçü rakamları) başka şeydir
          const atEnd = p => sp_.stems.some(s => s.x >= p.x - 0.5*sp && s.x <= p.x + p.w + 0.5*sp &&
            Math.min(Math.abs(p.y + p.h/2 - s.y0), Math.abs(p.y + p.h/2 - s.y1)) <= 0.9*sp);
          parts.forEach(p => { if(/^head_/.test(p.cls) && !atEnd(p)){ p.cls = "other"; p.conf = 0; } });
          const headConf = Math.max(0, ...parts.filter(p => /^head_/.test(p.cls)).map(p => p.conf));
          if(headConf > rc){
            parts.push(...sp_.stems.map(s => ({ x:Math.round(s.x - s.w/2), y:s.y0, w:s.w, h:s.y1 - s.y0 + 1, area:s.w*(s.y1 - s.y0 + 1), cls:"stem", conf:1 })));
            return { parts, conf:headConf };
          }
        }
      }
      return { parts:[{ ...c, cls:r.cls, conf:r.conf }], conf:rc };
    };
    const res = comps.map(solve);
    if(bin.removed){
      const lab = new Int32Array(W*H).fill(-1); comps.forEach((c, i) => { for(const p of c.pixels) lab[p] = i; });
      const br = new Uint8Array(bin.bits), maxGap = Math.max(2, 0.9*sp);
      for(let y = 0; y < H; y++){
        let x = 0;
        while(x < W){
          if(!bin.removed[y*W + x]){ x++; continue; }
          let e = x; while(e < W && bin.removed[y*W + e]) e++;
          if(e - x <= maxGap && x > 0 && e < W && bin.bits[y*W + x - 1] && bin.bits[y*W + e]) for(let q = x; q < e; q++) br[y*W + q] = 1;
          x = e;
        }
      }
      for(const g of components({ bits:br, width:W, height:H })){
        const ids = new Set(); for(const p of g.pixels){ const l = lab[p]; if(l >= 0) ids.add(l); }
        if(ids.size < 2 || ids.size > 4 || g.h > 8*sp || g.w > 4*sp || [...ids].some(i => !res[i])) continue;
        const r = classify(g, bin, sp, near(g));
        if(r.cls !== "other" && r.conf > Math.max(...[...ids].map(i => res[i].conf))){
          ids.forEach(i => res[i] = null); res.push({ parts:[{ ...g, cls:r.cls, conf:r.conf }], conf:r.conf });
        }
      }
    }
    return res.filter(Boolean).flatMap(r => r.parts);
  }

  return { CLASSES, GRID:G, binarize, deskew, rotate, findStaves, removeStaffLines, components, gridOf, classify, splitStems, blackHeads,
    symbols, templates, fromB64, toB64, otsu, holeOf };
})();

if(typeof module !== "undefined") module.exports = OMR;
