// Resimden notaya (OMR), birinci yarı: ikilileştirme, eğiklik düzeltme, dizek bulma, çizgi silme, bağlı bileşenler,
// sap ayırma ve kalıpla simge sınıflama. Yapay zekâ yok; saf JS, tarayıcıya bağımlı değil: sayfada, Worker'da
// (importScripts) ve Node'da çalışır. Kalıplar omrtemplates.js'ten gelir (tarayıcıda ondan önce yüklenir).
// Girdi resmi: { data:Uint8Array (gri; 3/4 kanal da olur), width, height, channels? }. İkili resim: { bits (1 = siyah), width, height }.

const OMR = (() => {
  const G = 32;                                     // normalleştirilmiş simge ızgarası (G×G)
  const CLASSES = ["head_black", "head_half", "head_whole", "rest_1", "rest_2", "rest_4", "rest_8", "rest_16", "clef_g",
    "sharp", "flat", "natural", "aeu_koma_sharp", "aeu_kucuk_sharp", "aeu_buyuk_sharp", "aeu_koma_flat", "aeu_bakiye_flat",
    "aeu_buyuk_flat", "segno", "measure_repeat", "dot", "digit_0", "digit_1", "digit_2", "digit_3", "digit_4", "digit_5",
    "digit_6", "digit_7", "digit_8", "digit_9", "other"];

  // Değiştirici sınıfı → AEU koma farkı (doğal harften; repertoire.js turkishAccidental'ın k'sı). Yalın ♯ bakiye
  // diyez (+4), yalın ♭ küçük mücenneb bemol (−5): SMuFL adları ve AEU yazımı. Batı (tampere) notasında ♯/♭ ±1 yarım
  // sestir; o yorum okuyucunun (Görev 6) işidir.
  const ACC_K = { sharp:4, flat:-5, natural:0, aeu_koma_sharp:1, aeu_kucuk_sharp:5, aeu_buyuk_sharp:8,
    aeu_koma_flat:-1, aeu_bakiye_flat:-4, aeu_buyuk_flat:-8 };

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
  // İki tepelilik: sınıflar arası varyans / toplam varyans (Otsu eşiğinde). Temiz tarama ≈ 0,98, bulanık ≈ 0,87;
  // gölgeli fotoğrafta kâğıt tepesi yayılır (≈ 0,6)
  function bimodality(g, t){
    let s = 0, q = 0, s1 = 0, n1 = 0;
    for(let i = 0; i < g.length; i++){ const v = g[i]; s += v; q += v*v; if(v <= t){ s1 += v; n1++; } }
    const n = g.length, m = s/n, vt = q/n - m*m, n2 = n - n1;
    if(!(vt > 0) || !n1 || !n2) return 1;
    const d = s1/n1 - (s - s1)/n2; return n1*n2*d*d/(n*n)/vt;
  }
  // method "auto": parlaklık histogramı iki tepeli değilse ya da kâğıt parlaklığı resim boyunca çok değişiyorsa
  // (gölge, fotoğraf) Sauvola, yoksa Otsu. sp: dizek aralığı (Sauvola penceresi 2×sp); verilmezse Otsu'dan bulunur
  function binarize(img, method, sp){
    const W = img.width, H = img.height, g = greyOf(img); method = method || "auto";
    const t = otsu(g);
    const otsuBits = () => { const bits = new Uint8Array(W*H); for(let i = 0; i < bits.length; i++) bits[i] = g[i] <= t ? 1 : 0; return bits; };
    if(method === "auto"){
      let uneven = t >= 0 && bimodality(g, t) < 0.8;
      if(!uneven){
        const n = 8, bg = [];
        for(let ty = 0; ty < n; ty++) for(let tx = 0; tx < n; tx++){
          let s = 0, c = 0;
          for(let y = Math.floor(ty*H/n); y < Math.floor((ty + 1)*H/n); y += 2) for(let x = Math.floor(tx*W/n); x < Math.floor((tx + 1)*W/n); x += 2){ const v = g[y*W + x]; if(v > t){ s += v; c++; } }
          if(c > 20) bg.push(s/c);
        }
        uneven = bg.length > 0 && Math.max(...bg) - Math.min(...bg) > 40;
      }
      method = uneven ? "sauvola" : "otsu";
    }
    let bits;
    if(method === "sauvola"){
      if(!(sp > 0)) sp = findStaves({ bits:otsuBits(), width:W, height:H }).sp;
      const win = sp > 0 ? Math.max(9, Math.round(2*sp) | 1) : Math.max(15, Math.min(81, Math.round(Math.min(W, H)/40)) | 1);
      bits = sauvola(g, W, H, win, 0.2);
    }
    else bits = otsuBits();
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
    // Satırın en uzun siyah koşusu (≤ 2 piksellik boşluklar kapatılır). Satır kendisiyle altındaki satırın birleşimidir:
    // döndürülüp düzeltilmiş ince çizgi iki satıra bölünebilir.
    const run = new Float64Array(H); let maxRun = 0;
    for(let y = 0; y < H; y++){
      let best = 0, cur = 0, holes = 0;
      for(let x = 0; x < W; x++){
        if(bits[y*W + x] || (y + 1 < H && bits[(y + 1)*W + x])){ cur += 1 + holes; holes = 0; if(cur > best) best = cur; }
        else if(cur && holes < 2) holes++; else { cur = 0; holes = 0; }
      }
      run[y] = best; if(best > maxRun) maxRun = best;
    }
    const thr = Math.max(6*sp0, 0.3*maxRun), bands = [];
    for(let y = 0; y < H; y++){
      if(run[y] < thr) continue;
      let e = y, s = 0, sy = 0; while(e < H && run[e] >= thr){ s += run[e]; sy += run[e]*e; e++; }
      if(e - y <= Math.max(2*line + 3, 0.5*sp0)) bands.push(sy/s + 0.5);
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
    if(conf < 0.35) return { cls:"other", conf, best:cls, scores:best };
    if((cls === "rest_1" || cls === "rest_2") && staff){
      const near = y => Math.min(...staff.y.map(l => Math.abs(l - y)));
      cls = near(comp.y) < near(comp.y + comp.h - 1) ? "rest_1" : "rest_2";
    }
    return { cls, conf, margin:conf - second, scores:best };
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
          // satırda yakında (1 sp) başka parça varsa (boş başın öbür duvarı) orası baştır, kesilmez
          const alone = (cx, q) => { let a = cx, b = cx; while(a > 0 && m[q*w + a - 1]) a--; while(b < w - 1 && m[q*w + b + 1]) b++;
            const r = Math.round(1.0*sp);
            for(let k = Math.max(0, a - r); k < a - 1; k++) if(m[q*w + k]) return false;
            for(let k = b + 2; k <= Math.min(w - 1, b + r); k++) if(m[q*w + k]) return false;
            return true; };
          // 1,3 sp'den uzun ince kısım baş duvarı olamaz: yanında başka parça (bayrak) olsa da sap sayılır
          const thin = q => [x, x + 1].every(cx => cx >= w || !m[q*w + cx] || hrun(cx, q) <= lim), long = new Uint8Array(e - y);
          for(let q = y; q < e; ){ if(!thin(q)){ q++; continue; } let qe = q; while(qe < e && thin(qe)) qe++;
            if(qe - q >= 1.3*sp) long.fill(1, q - y, qe - y); q = qe; }
          const narrow = q => [x, x + 1].every(cx => cx >= w || !m[q*w + cx] || (hrun(cx, q) <= lim && (long[q - y] || alone(cx, q))));
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
          if(y0 >= 0 && y1 - y0 >= 0.3*minLen) stems.push({ x:comp.x + x, y0:comp.y + y0, y1:comp.y + y1 });
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
    return out.map(t => ({ x:comp.x + t.x - Math.round(0.15*sp), y:comp.y + t.y, w:Math.round(s*1.3), h:s, area:Math.round(t.f*s*s), cls:"head_black", conf:0.6, win:true }));
  }

  // Kiriş: en az 2 sp geniş, sütunlarının çoğunda 0,3–1,9 sp kalın, üst ya da alt kenarı doğruya yakın (eğik şerit;
  // ikinci kiriş kısa olabilir, asıl kiriş dışta kalır). Yan yana iki nota başında sütun kalınlığı kenarlara doğru
  // incelir, kenarlar kavislidir.
  function beamLike(b, bin, sp){
    if(b.w < 2*sp) return false;
    const W = bin.width, top = new Float64Array(b.w).fill(-1), bot = new Float64Array(b.w);
    for(const p of b.pixels){ const x = p % W - b.x, y = (p - p % W)/W; if(top[x] < 0 || y < top[x]) top[x] = y; if(y > bot[x]) bot[x] = y; }
    const xs = [];
    for(let x = 0; x < b.w; x++){ if(top[x] < 0) continue; const t = bot[x] - top[x] + 1; if(t >= 0.3*sp && t <= 1.9*sp) xs.push(x); }
    if(xs.length < 0.85*b.w) return false;
    const fit = e => {
      let sx = 0, sy = 0, sxx = 0, sxy = 0; const n = xs.length;
      for(const x of xs){ sx += x; sy += e[x]; sxx += x*x; sxy += x*e[x]; }
      const k = (n*sxy - sx*sy)/(n*sxx - sx*sx || 1), c0 = (sy - k*sx)/n;
      let q = 0; for(const x of xs) q += (e[x] - c0 - k*x)**2;
      return Math.abs(k) < 0.6 && Math.sqrt(q/n) < 0.15*sp;
    };
    return fit(top) || fit(bot);
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
            // kiriş: kayan pencere kirişin kalın yerlerini baş sanmasın
            if(rb.cls === "other" && beamLike(b, bin, sp)){ parts.push({ ...b, cls:"beam", conf:rb.conf }); continue; }
            if(rb.cls === "other" && (b.h > 1.3*sp || b.w > 1.8*sp)){ const hs = blackHeads(b, bin, sp); if(hs.length){ parts.push(...hs); continue; } }
            parts.push({ ...b, cls:rb.cls, conf:rb.conf, scores:rb.scores });
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
      return { parts:[{ ...c, cls:r.cls, conf:r.conf, scores:r.scores }], conf:rc };
    };
    const res = comps.map(solve);
    if(bin.removed){
      const lab = new Int32Array(W*H).fill(-1); comps.forEach((c, i) => { for(const p of c.pixels) lab[p] = i; });
      const br = new Uint8Array(bin.bits), maxGap = Math.max(2, 0.9*sp), pairs = new Set();
      for(let y = 0; y < H; y++){
        let x = 0;
        while(x < W){
          if(!bin.removed[y*W + x]){ x++; continue; }
          let e = x; while(e < W && bin.removed[y*W + e]) e++;
          if(e - x <= maxGap && x > 0 && e < W && bin.bits[y*W + x - 1] && bin.bits[y*W + e]){
            for(let q = x; q < e; q++) br[y*W + q] = 1;
            const a = lab[y*W + x - 1], b = lab[y*W + e];
            if(a >= 0 && b >= 0 && a !== b) pairs.add(Math.min(a, b) + ":" + Math.max(a, b));
          }
          x = e;
        }
      }
      for(const g of components({ bits:br, width:W, height:H })){
        const ids = new Set(); for(const p of g.pixels){ const l = lab[p]; if(l >= 0) ids.add(l); }
        if(ids.size < 2 || ids.size > 4 || g.h > 8*sp || g.w > 4*sp || [...ids].some(i => !res[i])) continue;
        const r = classify(g, bin, sp, near(g));
        if(r.cls !== "other" && r.conf > Math.max(...[...ids].map(i => res[i].conf))){
          ids.forEach(i => res[i] = null); res.push({ parts:[{ ...g, cls:r.cls, conf:r.conf, scores:r.scores }], conf:r.conf });
        }
      }
      // köprüyle bağlı ikililer de ayrıca denenir (öbek komşu başa ya da ölçü çizgisine de köprülenmiş olabilir)
      for(const pr of pairs){
        const [a, b] = pr.split(":").map(Number);
        if(!res[a] || !res[b] || res[a].parts.length > 1 || res[b].parts.length > 1) continue;
        const A = comps[a], B = comps[b], x = Math.min(A.x, B.x), y = Math.min(A.y, B.y);
        const g = { x, y, w:Math.max(A.x + A.w, B.x + B.w) - x, h:Math.max(A.y + A.h, B.y + B.h) - y, area:A.area + B.area, pixels:[...A.pixels, ...B.pixels] };
        if(g.h > 8*sp || g.w > 4*sp) continue;
        const r = classify(g, bin, sp, near(g));
        if(r.cls !== "other" && !/^head_/.test(r.cls) && r.conf > Math.max(res[a].conf, res[b].conf)){
          res[a] = res[b] = null; res.push({ parts:[{ ...g, cls:r.cls, conf:r.conf, scores:r.scores }], conf:r.conf });
        }
      }
    }
    return res.filter(Boolean).flatMap(r => r.parts);
  }

  // ======== İkinci yarı: simgelerden notaya ========
  // Dizekler → sistemler (yalnızca en üst dizek) → her dizekte soldan sağa: anahtar, donanım, ölçü sayısı, ölçü
  // çizgileri ve tekrar işaretleri, nota başı + sap + kiriş/bayrak + nokta + değiştirici, sus, bağ, %, segno.
  // repertoire.js (naturalOf, withAccidental, meterFromBars, barCheck) ilk kullanımda bulunur: Worker'da core.js ve
  // repertoire.js omr.js'ten önce importScripts ile yüklenir.
  let REP = null;
  const rep = () => REP || (REP = typeof module !== "undefined" ? require("./repertoire.js") :
    { naturalOf, withAccidental, meterFromBars, barCheck });
  const TARGET_SP = 14;                                 // ağır işler bu dizek aralığında yapılır
  const ACC_CLS = Object.keys(ACC_K);
  const WEST_K = { sharp:1, flat:-1, natural:0 };       // Batı notası: yarım ses
  const FLAT_LIKE = new Set(["flat", "aeu_koma_flat", "aeu_bakiye_flat", "aeu_buyuk_flat"]);
  const REST_D = { rest_1:4, rest_2:2, rest_4:1, rest_8:0.5, rest_16:0.25 };
  const MARK_ORDER = { repEnd:0, sectionEnd:1, toSegno:2, segno:3, repStart:4 };
  const NAT_PC7 = [0, 2, 4, 5, 7, 9, 11], LETTER_TR = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];

  // Gri resmi f oranında küçültür (alan ortalaması)
  function downscale(img, f){
    const W = img.width, H = img.height, g = greyOf(img), w = Math.max(1, Math.round(W*f)), h = Math.max(1, Math.round(H*f));
    const out = new Uint8Array(w*h), acc = new Float64Array(w), cnt = new Float64Array(w), tx = new Int32Array(W);
    for(let x = 0; x < W; x++) tx[x] = Math.min(w - 1, Math.floor(x*w/W));
    let ty = -1;
    for(let y = 0; y <= H; y++){
      const t = y < H ? Math.min(h - 1, Math.floor(y*h/H)) : -2;
      if(t !== ty){
        if(ty >= 0) for(let x = 0; x < w; x++) out[ty*w + x] = cnt[x] ? Math.round(acc[x]/cnt[x]) : 255;
        acc.fill(0); cnt.fill(0); ty = t;
      }
      if(y === H) break;
      for(let x = 0; x < W; x++){ acc[tx[x]] += g[y*W + x]; cnt[tx[x]]++; }
    }
    return { data:out, width:w, height:h, channels:1 };
  }
  // İkilileştirme, ölçek (sp ≈ 14'e küçültme), eğiklik, dizekler
  function prepare(img){
    let scale = 1;
    const sp0 = findStaves(binarize(img, "otsu")).sp;
    if(sp0 > 1.3*TARGET_SP){ scale = TARGET_SP/sp0; img = downscale(img, scale); }
    const d = deskew(binarize(img, "auto", sp0*scale));
    return { scale, angle:d.angle, bin:d.bin, st:findStaves(d.bin) };
  }
  // Düzeltilmiş (döndürülmüş, küçültülmüş) resimdeki kutu → özgün resim pikseli
  function toOrig(P, b){
    const cx = P.bin.width/2, cy = P.bin.height/2, a = P.angle*Math.PI/180, c = Math.cos(a), s = Math.sin(a), xs = [], ys = [];
    for(const [x, y] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]){
      const dx = x - cx, dy = y - cy; xs.push((cx + dx*c - dy*s)/P.scale); ys.push((cy + dx*s + dy*c)/P.scale);
    }
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    return { x:Math.round(x0), y:Math.round(y0), w:Math.round(Math.max(...xs) - x0), h:Math.round(Math.max(...ys) - y0) };
  }
  const union = (a, b) => { if(!a) return { ...b }; if(!b) return { ...a };
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w:Math.max(a.x + a.w, b.x + b.w) - x, h:Math.max(a.y + a.h, b.y + b.h) - y }; };
  const cxOf = s => s.x + s.w/2, cyOf = s => s.y + s.h/2;
  // Dizek basamağı (alt çizgi Mi4 = 0) → doğal yazılı nota (MIDI)
  function natOfStep(step){
    const idx = 30 + step, l = ((idx % 7) + 7) % 7, o = Math.floor(idx/7);
    return { w:(o + 1)*12 + NAT_PC7[l], letter:l };
  }

  // İki dizek ortak dikey çizgiyle (ölçü çizgisi, akolat) bağlı mı: aynı sistem
  function linked(bin, a, b, sp){
    const W = bin.width, ya = Math.round(a.y[4]), yb = Math.round(b.y[0]);
    if(yb - ya > 16*sp) return false;
    for(let x = Math.max(a.x0, b.x0) - Math.round(sp); x <= Math.min(a.x1, b.x1); x++){
      if(x < 0 || x + 1 >= W) continue;
      let miss = 0, y = ya;
      for(; y <= yb; y++){ if(bin.bits[y*W + x] || bin.bits[y*W + x + 1]) miss = 0; else if(++miss > 2) break; }
      if(y > yb) return true;
    }
    return false;
  }

  // Bir dizeği okur; olaylar st (sayfa durumu) içine eklenir. Notalar ham: { natW, letter, acc, d, rest, conf, box }
  function readStaff(S, sy, clean, sp, st){
    const W = clean.width, H = clean.height, bits = clean.bits;
    const d8 = (S.y[4] - S.y[0])/8, stepOf = y => (S.y[4] - y)/d8, yOf = s => S.y[4] - s*d8;
    // dizeğin yatay sınırları dışındaki simgeler (sayfa kenarındaki imza, tarih) okunmaz; son ölçü çizgisinin üstündeki
    // segno biraz taşabilir
    sy = sy.filter(s => cxOf(s) >= S.x0 - sp && cxOf(s) <= S.x1 + (s.cls === "segno" ? 2*sp : 0.5*sp));
    const used = new Set();
    const small = s => s.w >= 0.15*sp && s.h >= 0.15*sp && s.w <= 0.75*sp && s.h <= 0.75*sp && s.cls !== "stem";
    // aynı sütunda üst üste ya da arka arkaya gelen sap parçaları (bulanık bayrak sapı böler) tek saptır
    const stems = [];
    for(const s of sy.filter(s => s.cls === "stem").sort((a, b) => a.y - b.y)){
      const t = stems.find(t => Math.abs(t.x - (s.x + s.w/2)) <= 0.4*sp && s.y <= t.y1 + 0.5*sp && s.y + s.h - 1 >= t.y0 - 0.5*sp);
      if(t){ t.y0 = Math.min(t.y0, s.y); t.y1 = Math.max(t.y1, s.y + s.h - 1); t.parts.push(s); continue; }
      stems.push({ x:s.x + s.w/2, y0:s.y, y1:s.y + s.h - 1, s, parts:[s] });
    }
    // Anahtar
    const clef = sy.filter(s => s.cls === "clef_g" && s.x < S.x0 + 6*sp).sort((a, b) => a.x - b.x)[0];
    let hdr = clef ? clef.x + clef.w : S.x0 + 0.5*sp;
    if(clef) used.add(clef);
    // Saplı nota başları: sapın bir ucunda (sap yukarıysa başın sağında, baş altta; aşağıysa solunda, baş üstte)
    const heads = [], headCand = sy.filter(s => /^head_/.test(s.cls) && cxOf(s) > hdr && Math.abs(stepOf(cyOf(s)) - 4) <= 14);
    for(const t of stems){
      let best = null;
      for(const h of headCand){
        if(used.has(h)) continue;
        const up = Math.abs(t.x - (h.x + h.w)) <= 0.5*sp && Math.abs(cyOf(h) - t.y1) <= 0.8*sp,
              dn = Math.abs(t.x - h.x) <= 0.5*sp && Math.abs(cyOf(h) - t.y0) <= 0.8*sp;
        if(!up && !dn) continue;
        const sc = h.conf - (h.win ? 0.3 : 0) - (h.cls === "head_whole" ? 0.3 : 0);
        if(!best || sc > best.sc) best = { h, sc, up };
      }
      if(!best) continue;
      used.add(best.h); t.parts.forEach(p => used.add(p));
      heads.push({ s:best.h, stem:t, up:best.up, cls:best.h.cls === "head_whole" ? "head_half" : best.h.cls, conf:best.h.win ? 0.5 : best.h.conf });
    }
    // başka bir sapın uzak ucundaki "baş" (bulanık bayrağın kalın yeri, kendi sap parçasıyla) baş değildir
    for(let i = heads.length - 1; i >= 0; i--){ const B = heads[i];
      const val = h => h.stem.y1 - h.stem.y0 - (h.s.win ? sp : 0);       // uzun sap, kalıba uyan baş önce gelir
      if(heads.some(A => A !== B && val(A) > val(B) && Math.abs(cxOf(B.s) - A.stem.x) <= sp && Math.abs(cyOf(B.s) - (A.up ? A.stem.y0 : A.stem.y1)) <= 1.3*sp &&
        Math.abs(cyOf(A.s) - (A.up ? A.stem.y1 : A.stem.y0)) <= 0.8*sp)){ used.delete(B.s); B.stem.parts.forEach(p => used.delete(p)); heads.splice(i, 1); } }
    // kıvrık uçlu kalın ölçü çizgisinin (‖: ve :‖) kanadı baş değildir: sapı dizeği baştan başa geçen ve 1 sp
    // yakınında sap olmayan kalın (≥ 2 sütun) tam boy çizgi bulunan baş atılır
    {
      const ya = Math.round(S.y[0]), yb = Math.round(S.y[4]), stemCol = new Set();
      for(const t of stems) for(let x = t.s.x; x < t.s.x + t.s.w; x++) stemCol.add(x);
      const full = x => { if(x < 0 || x >= W || stemCol.has(x)) return false; let c = 0; for(let y = ya; y <= yb; y++) c += bits[y*W + x]; return c >= 0.92*(yb - ya + 1); };
      const thickNear = t => { let run = 0; for(let x = Math.round(t.x - sp); x <= Math.round(t.x + sp); x++){ run = full(x) ? run + 1 : 0; if(run >= 2) return true; } return false; };
      for(let i = heads.length - 1; i >= 0; i--){ const h = heads[i], t = h.stem;
        if(t.y0 <= S.y[0] + 0.3*sp && t.y1 >= S.y[4] - 0.3*sp && thickNear(t)){ used.delete(h.s); t.parts.forEach(p => used.delete(p)); heads.splice(i, 1); } }
    }
    const stemEnds = stems.flatMap(t => [[t.x, t.y0], [t.x, t.y1]]);
    // Ölçü çizgileri: dizek boyunca (≥ %92) siyah sütunlar (çizgiler silinmiş resimde; saplar ve anahtar hariç)
    const groups = [];
    {
      const ya = Math.round(S.y[0]), yb = Math.round(S.y[4]), n = yb - ya + 1;
      const xa = Math.max(0, Math.round(S.x0 - sp)), xb = Math.min(W - 2, Math.round(S.x1 + sp)), skip = new Uint8Array(W);
      for(const t of stems) for(let x = t.s.x - 1; x <= t.s.x + t.s.w; x++) if(x >= 0 && x < W) skip[x] = 1;
      if(clef) for(let x = clef.x; x < clef.x + clef.w && x < W; x++) skip[x] = 1;
      const segs = []; let cur = null;
      for(let x = xa; x <= xb; x++){
        let c = 0; for(let y = ya; y <= yb; y++) c += bits[y*W + x] | bits[y*W + x + 1];
        if(c >= 0.92*n && !skip[x]){ if(cur && x === cur.x1 + 1) cur.x1 = x; else segs.push(cur = { x0:x, x1:x }); }
      }
      for(const s of segs){
        if(s.x1 < S.x0 + 0.6*sp) continue;               // sistemin baş çizgisi
        const g = groups[groups.length - 1];
        if(g && s.x0 - g.x1 <= 1.2*sp){ g.x1 = s.x1; g.lines.push(s); } else groups.push({ x0:s.x0, x1:s.x1, lines:[s] });
      }
      for(const g of groups){
        // çizgilere değen simgeler (kanatlı kalın çizgi) kullanılmış sayılır
        sy.forEach(s => { if(!used.has(s) && s.cls !== "stem" && s.cls !== "segno" && s.x <= g.x1 + 1 && s.x + s.w >= g.x0 - 1 && (s.h >= 3*sp || (s.x >= g.x0 - 2 && s.x + s.w <= g.x1 + 3))) used.add(s); });
        const side = (lo, hi) => {
          const ds = sy.filter(s => !used.has(s) && small(s) && cxOf(s) >= lo && cxOf(s) <= hi && [3, 5].some(t => Math.abs(stepOf(cyOf(s)) - t) <= 0.8));
          const ok = ds.some(s => stepOf(cyOf(s)) < 4) && ds.some(s => stepOf(cyOf(s)) > 4);
          if(ok) ds.forEach(s => used.add(s));
          return ok;
        };
        g.repEnd = side(g.x0 - 1.4*sp, g.x0); g.repStart = side(g.x1 + 1, g.x1 + 1.4*sp);
        g.double = g.lines.length >= 2;
      }
    }
    // Değiştirici sınıfı: kalıptan ya da bağlamdan (değiştirici boyunda, değiştirici puanı ≥ 0,2)
    const accAs = s => {
      if(ACC_K[s.cls] !== undefined) return { cls:s.cls, sure:true };
      if(s.cls !== "other" || !s.scores || s.h < 1.6*sp || s.h > 3.8*sp || s.w < 0.4*sp || s.w > 1.6*sp) return null;
      let best = null, b = 0.2; for(const c of ACC_CLS) if((s.scores[c] || 0) > b){ b = s.scores[c]; best = c; }
      return best ? { cls:best, sure:false } : null;
    };
    const accY = (s, cls) => FLAT_LIKE.has(cls) ? s.y + s.h - 0.7*sp : s.y + s.h/2;
    // Donanım: anahtardan sonra arka arkaya değiştiriciler (hemen sağında aynı yükseklikte baş varsa notanındır)
    const items = sy.filter(s => !used.has(s) && s.cls !== "stem" && s.cls !== "beam" && cxOf(s) > hdr - 0.2*sp &&
      s.y + s.h > yOf(14) && s.y < yOf(-6)).sort((a, b) => a.x - b.x);
    const key = [];
    let kx = hdr;
    for(const s of items){
      if(s.x > kx + 1.5*sp) break;
      if(small(s) || s.w*s.h < 0.15*sp*sp) continue;
      const a = accAs(s); if(!a) break;
      const y = accY(s, a.cls);
      if(heads.some(h => h.s.x > s.x + s.w - 0.2*sp && h.s.x < s.x + s.w + 1.6*sp && Math.abs(cyOf(h.s) - y) < 0.5*d8)) break;
      key.push({ cls:a.cls, step:Math.round(stepOf(y)), sure:a.sure }); used.add(s); kx = s.x + s.w;
    }
    hdr = Math.max(hdr, kx);
    // Ölçü sayısı: donanımdan sonra sapsız, dar, orta çizginin iki yanına uzanan küme (ya da rakam)
    {
      const bx = groups.length ? groups[0].x0 : Infinity;
      const rest = items.filter(s => !used.has(s) && !small(s) && s.x >= hdr - 0.2*sp && s.x < Math.min(hdr + 2.5*sp, bx - 0.2*sp));
      if(rest.length){
        const cl = [rest[0]]; let x1 = rest[0].x + rest[0].w;
        for(const s of rest.slice(1)) if(s.x <= x1 + 0.3*sp){ cl.push(s); x1 = Math.max(x1, s.x + s.w); }
        const y0 = Math.min(...cl.map(s => s.y)), y1 = Math.max(...cl.map(s => s.y + s.h)), x0 = Math.min(...cl.map(s => s.x));
        // ilk notanın değiştiricisi ölçü sayısı sanılmasın
        const isHead = cl.some(s => heads.some(h => h.s === s) || ACC_K[s.cls] !== undefined);
        if(!isHead && (cl.some(s => /^digit_/.test(s.cls)) || (x1 - x0 <= 2.8*sp && y0 <= yOf(5.5) && y1 >= yOf(2.5)))){
          cl.forEach(s => used.add(s));
          // aynı sütundaki küçük parçalar da (rakamların kopan uçları)
          items.forEach(s => { if(s.x >= x0 - 0.2*sp && s.x + s.w <= x1 + 0.2*sp) used.add(s); });
          hdr = x1;
        }
      }
    }
    // Sapsız başlar: birlik (deliği olan), uçta sap yoksa
    for(const h of headCand){
      if(used.has(h) || h.win || cxOf(h) <= hdr) continue;
      if(stemEnds.some(([x, y]) => Math.abs(x - cxOf(h)) < h.w/2 + 0.6*sp && Math.abs(y - cyOf(h)) < 0.9*sp)) continue;
      const st_ = stepOf(cyOf(h));
      if(st_ < -8 || st_ > 18) continue;
      if(h.cls === "head_whole" && h.w <= 2.2*sp && h.h >= 0.7*sp && holeOf(h, clean) >= 0.03){
        used.add(h); heads.push({ s:h, stem:null, cls:"head_whole", conf:h.conf });
      }
    }
    // Ölçü tekrarı (%) ve segno: içlerindeki noktalar artık nokta değildir
    const inside = (s, b, m) => cxOf(s) >= b.x - m && cxOf(s) <= b.x + b.w + m && cyOf(s) >= b.y - m && cyOf(s) <= b.y + b.h + m;
    const mreps = sy.filter(s => s.cls === "measure_repeat" && !used.has(s) && Math.abs(stepOf(cyOf(s)) - 4) <= 3 && cxOf(s) > hdr);
    const segnos = sy.filter(s => s.cls === "segno" && !used.has(s) && stepOf(cyOf(s)) >= 8);
    for(const b of [...mreps, ...segnos]){ used.add(b); sy.forEach(s => { if(!used.has(s) && small(s) && inside(s, b, 0.4*sp)) used.add(s); }); }
    // Sapı bulunan başlara: süre, nokta, değiştirici
    // Kiriş ve bayrak sayısı: sapın uzak ucunda (baştan öteki uç), sapın iki yanındaki sütunlarda uçtan başa doğru
    // art arda gelen siyah koşular. Kirişler 0,5 sp kalın, 0,75 sp aralıklı; bulanıkta bitişen kirişler koşu boyundan
    // sayılır. Uçtan uzak (aradaki boşluk > 0,6 sp) koşular (komşu nota başı) sayılmaz.
    const beamsAt = h => {
      const t = h.stem, dir = h.up ? 1 : -1, hw = t.s.w/2, sx = Math.round(t.x);
      // sap ayırma kirişin içinde durur: gerçek uç, sap sütunu siyah kaldıkça ilerlenerek bulunur
      let tip = h.up ? t.y0 : t.y1;
      const blk = y => y >= 0 && y < H && (bits[y*W + sx] || (sx > 0 && bits[y*W + sx - 1]) || (sx + 1 < W && bits[y*W + sx + 1]));
      for(let k = 0; k < 4*sp && blk(tip - dir); k++) tip -= dir;
      const len = Math.min(3.2*sp, Math.abs(tip - (h.up ? t.y1 : t.y0)) - 0.8*sp);
      const probe = x => {
        if(x < 0 || x >= W) return 0;
        const runs = []; let run = 0, gap = 0, started = false;
        for(let k = Math.round(-0.3*sp); k <= len; k++){
          const y = Math.round(tip + dir*k), b = y >= 0 && y < H && bits[y*W + x];
          if(b){ if(!started && k > 1.8*sp) break; started = true; run++; gap = 0; }
          else { if(run){ runs.push(run); run = 0; } if(started && ++gap > 0.6*sp) break; }
        }
        if(run) runs.push(run);
        let n = 0; for(const r of runs) if(r >= 0.2*sp) n += Math.max(1, Math.round((r + 0.25*sp)/(0.75*sp)));
        return n;
      };
      let best = 0;
      for(const off of [-1, 1]){
        const a = probe(Math.round(t.x + off*(hw + 0.35*sp))), b = probe(Math.round(t.x + off*(hw + 0.65*sp)));
        // uzak sütun boşsa (düşük çözünürlükte bayrağın ince kuyruğu) yakın sütunun tek koşusu bayraktır
        best = Math.max(best, b ? Math.min(a, b) : Math.min(a, 1));
      }
      return Math.min(best, 4);
    };
    const notes = [];
    for(const h of heads){
      const s = h.s, cx = cxOf(s), cy = cyOf(s), step = Math.round(stepOf(cy));
      let base = h.cls === "head_whole" ? 4 : h.cls === "head_half" ? 2 : 1, conf = Math.min(1, h.conf/0.7);
      if(base === 1){ const nb = beamsAt(h); base = 1/Math.pow(2, nb); }
      let box = { x:s.x, y:s.y, w:s.w, h:s.h };
      // nokta: başın sağında, başın ya da üstündeki aralığın hizasında
      const dot = sy.filter(q => !used.has(q) && small(q) && q.x >= s.x + s.w - 0.2*sp && q.x <= s.x + s.w + 1.6*sp &&
        cyOf(q) >= cy - 1.0*sp && cyOf(q) <= cy + 0.4*sp && !stems.some(t => t.x > s.x + s.w && t.x < q.x - 1))
        .sort((a, b) => a.x - b.x)[0];
      if(dot){ used.add(dot); base *= 1.5; box = union(box, dot); }
      // değiştirici: başın solunda, 1,8 sp içinde, aynı yükseklikte
      let acc = null;
      const accs = sy.filter(q => !used.has(q) && q.x + q.w <= s.x + 0.3*sp && q.x + q.w >= s.x - 1.8*sp)
        .map(q => ({ q, a:accAs(q) })).filter(o => o.a && Math.abs(accY(o.q, o.a.cls) - cy) <= 0.45*sp)
        .sort((a, b) => b.q.x - a.q.x);
      if(accs.length){ acc = accs[0].a; used.add(accs[0].q); box = union(box, accs[0].q); if(!acc.sure) conf *= 0.8; }
      notes.push({ x:cx, cy, step, d:base, acc:acc && acc.cls, conf, box, s });
    }
    // Suslar
    // birlik/ikilik sus dolu dikdörtgendir (bulanık bağ yayının kalın ortası değil)
    const solid = s => s.cls !== "rest_1" && s.cls !== "rest_2" || !s.pixels || s.pixels.length >= 0.75*s.w*s.h;
    const rests = sy.filter(s => REST_D[s.cls] && !used.has(s) && cxOf(s) > hdr && Math.abs(stepOf(cyOf(s)) - 4) <= 5 && solid(s)).map(s => {
      used.add(s); let d = REST_D[s.cls], box = { x:s.x, y:s.y, w:s.w, h:s.h };
      const dot = sy.find(q => !used.has(q) && small(q) && q.x >= s.x + s.w - 0.1*sp && q.x <= s.x + s.w + 1.2*sp && Math.abs(cyOf(q) - cyOf(s)) <= 1.2*sp);
      if(dot){ used.add(dot); d *= 1.5; box = union(box, dot); }
      return { x:cxOf(s), rest:true, d, conf:Math.min(1, s.conf/0.7), box };
    });
    // Bağ yayı: xa–xb sütunlarında, başın 1,8 sp yakınında ince (≤ 0,7 sp) koşulardan sütundan sütuna kopmadan süren,
    // aralığın ortasından geçen ve en az %40'ını kaplayan şerit (uçları dizek çizgisiyle birlikte silinmiş olabilir).
    // Düz ve çizgi kalınlığındaki şerit (silinmemiş çizgi kalıntısı) sayılmaz. Simgeye bakılmaz: yay başlara değip
    // onlarla tek bileşen olsa da bulunur.
    const arcAt = (xa, xb, cy) => {
      xa = Math.max(0, Math.round(xa)); xb = Math.min(W - 1, Math.round(xb));
      const n = xb - xa + 1; if(n < 0.6*sp) return false;
      const ya = Math.max(0, Math.round(cy - 1.8*sp)), yb = Math.min(H - 1, Math.round(cy + 1.8*sp)), cols = [];
      for(let x = xa; x <= xb; x++){
        const rs = []; let r0 = -1;
        for(let y = ya; y <= yb + 1; y++){ const b = y <= yb && bits[y*W + x];
          if(b && r0 < 0) r0 = y; else if(!b && r0 >= 0){ if(y - r0 <= 0.7*sp) rs.push([(r0 + y - 1)/2, y - r0]); r0 = -1; } }
        cols.push(rs);
      }
      const tol = Math.max(1.5, 0.2*sp), mid = n >> 1, tried = new Set();
      for(let c0 = 0; c0 <= mid; c0++) for(const [y0, l0] of cols[c0]){
        if(tried.has(c0 + ":" + y0)) continue;
        let last = y0, gap = 0, thick = l0; const path = [[c0, y0]];
        for(let c = c0 + 1; c < n; c++){
          let best = null; for(const r of cols[c]) if(Math.abs(r[0] - last) <= tol && (!best || Math.abs(r[0] - last) < Math.abs(best[0] - last))) best = r;
          if(!best){ if(++gap > Math.max(3, 0.3*sp)) break; continue; }
          gap = 0; last = best[0]; thick = Math.max(thick, best[1]); path.push([c, best[0]]); tried.add(c + ":" + best[0]);
        }
        const [ca, ya_] = path[0], [cb, yb_] = path[path.length - 1];
        if(cb < mid || cb - ca + 1 < Math.max(0.4*n, 0.6*sp)) continue;
        let dev = 0; for(const [c, y] of path) dev = Math.max(dev, Math.abs(y - (ya_ + (yb_ - ya_)*(c - ca)/((cb - ca) || 1))));
        if(dev >= Math.max(1, 0.08*sp) || Math.abs(yb_ - ya_) >= 0.2*sp || thick >= (st.line || 2) + 2) return true;
      }
      return false;
    };
    const tieBetween = (a, b) => arcAt(a.s.x + a.s.w + 0.1*sp, b.s.x - 0.1*sp, (a.cy + b.cy)/2);
    // Olaylar soldan sağa
    const ev = [...notes.map(n => ({ x:n.x, n })), ...rests.map(n => ({ x:n.x, n })), ...groups.map(g => ({ x:(g.x0 + g.x1)/2, g })),
      ...mreps.map(m => ({ x:cxOf(m), m })), ...segnos.map(s => ({ x:s.x, seg:s }))].sort((a, b) => a.x - b.x);
    const lastNoteX = Math.max(-1, ...notes.map(n => n.x), ...rests.map(n => n.x));
    const keyMap = new Map(); key.forEach(k => keyMap.set(natOfStep(k.step).letter, k.cls));
    if(!key.length && st.prevKey) st.prevKey.forEach((v, k) => keyMap.set(k, v));
    st.prevKey = keyMap;
    if(!st.keySig) st.keySig = key;
    const mark = (kind, i) => st.marks.push({ i, kind });
    let mem = new Map(), prevStaffNote = null;
    const closeBar = () => {
      if(st.cur.from === st.notes.length && !st.cur.sum) return;
      st.bars.push({ from:st.cur.from, to:st.notes.length, sum:st.cur.sum });
      st.lastBar = st.notes.slice(st.cur.from);
      st.cur = { from:st.notes.length, sum:0 }; mem = new Map();
    };
    const pitchKey = n => n.natW + ":" + (n.acc && n.acc !== "natural" ? n.acc : "");
    let firstOnStaff = true;
    for(const e of ev){
      if(e.g){
        const g = e.g;
        if(g.repEnd || g.repStart || g.double || st.notes.length > st.cur.from || st.cur.sum) closeBar();
        if(g.repEnd) mark("repEnd", st.notes.length);
        if(g.repStart) mark("repStart", st.notes.length);
        if(g.double && !g.repEnd && !g.repStart) mark("sectionEnd", st.notes.length);
        continue;
      }
      if(e.seg){
        // son notadan sonra ya da dizeğin son ölçü çizgisinin üstünde: "segno'ya git" (Türk notası yazımı)
        const lastG = groups[groups.length - 1], atEnd = lastG && lastG.x1 >= S.x1 - sp && cxOf(e.seg) >= lastG.x0 - 1.5*sp;
        if(e.x > lastNoteX || atEnd){ st.endSegno = true; } else mark("segno", st.notes.length);
        continue;
      }
      if(e.m){
        const box = { x:e.m.x, y:e.m.y, w:e.m.w, h:e.m.h };
        for(const n of st.lastBar || []){ st.notes.push({ ...n, box, conf:Math.min(n.conf, Math.min(1, e.m.conf/0.7)), copy:true }); st.cur.sum += n.d; }
        st.repeatSeen = true; prevStaffNote = null;
        continue;
      }
      const n = e.n;
      if(n.rest){ st.notes.push({ rest:true, d:n.d, conf:n.conf, box:n.box }); st.cur.sum += n.d; prevStaffNote = null; firstOnStaff = false; continue; }
      const { w:natW, letter } = natOfStep(n.step), lo = natW;
      if(n.acc) mem.set(lo, n.acc);
      const acc = n.acc || (mem.has(lo) ? mem.get(lo) : keyMap.get(letter) || null);
      const raw = { natW, acc, d:n.d, conf:n.conf, box:n.box, explicitAcc:n.acc || null };
      st.cur.sum += n.d;
      // uzatma bağı: aynı harfteki önceki notaya yay varsa tek nota olur (ölçü çizgisini geçen bağlı nota
      // değiştiricisini yeniden yazmasa da önceki notanınkini taşır); dizek sonundan gelen bağ yeni dizeğin ilk notasına
      const prev = st.notes[st.notes.length - 1], same = prev && !prev.rest && prev.natW === natW;
      const inStaff = same && prevStaffNote && tieBetween(prevStaffNote, n),
            fromPrev = same && !inStaff && firstOnStaff && st.tieOut && arcAt(Math.max(hdr + 0.1*sp, n.s.x - 3*sp), n.s.x - 0.1*sp, n.cy);
      if((inStaff || fromPrev) && !n.acc) raw.acc = prev.acc;
      if((inStaff || fromPrev) && pitchKey(prev) === pitchKey(raw)){
        prev.d += n.d; prev.conf = Math.min(prev.conf, n.conf); if(inStaff) prev.box = union(prev.box, n.box);
      } else st.notes.push(raw);
      prevStaffNote = n; firstOnStaff = false;
    }
    // dizek sonu: ölçü kapanır; son notadan dizek sonuna uzanan yay sonraki dizeğe bağdır
    closeBar();
    const ln = notes.length ? notes.reduce((a, b) => b.x > a.x ? b : a) : null;
    st.tieOut = !!(ln && ln.s.x + ln.s.w + 8*sp >= S.x1 && arcAt(ln.s.x + ln.s.w + 0.1*sp, S.x1 - 0.3*sp, ln.cy));
    if(st.endSegno){ mark("toSegno", st.notes.length); st.endSegno = false; }
  }

  // Sayfayı ham notalara okur (perde henüz değiştirici sınıfıyla; Türk/Batı yorumu readPages'te)
  function readRaw(img, page){
    const P = prepare(img), { bin, st:S0 } = P, sp = S0.sp;
    const st = { notes:[], marks:[], bars:[], cur:{ from:0, sum:0 }, flags:[], keySig:null, sp:sp/P.scale, page, line:S0.line };
    if(!S0.staves.length || !(sp > 0)){ st.flags.push("nostaff"); return st; }
    if(sp/P.scale < 8) st.flags.push("lowres");
    const clean = removeStaffLines(bin, S0.staves, S0), syms = symbols(clean, sp, S0.staves);
    // Sistemler: bağlı dizeklerden yalnızca en üstteki okunur
    const staves = S0.staves, read = [];
    for(let i = 0; i < staves.length; i++){
      if(i > 0 && linked(bin, staves[i - 1], staves[i], sp)){ if(!st.flags.includes("pianoLowerSkipped")) st.flags.push("pianoLowerSkipped"); continue; }
      read.push(i);
    }
    // Her simge en yakın dizeğe (ortasına göre) düşer
    const mid = s => (s.y[0] + s.y[4])/2, bucket = staves.map(() => []);
    for(const s of syms){
      const y = cyOf(s); let bi = 0;
      for(let i = 1; i < staves.length; i++) if(Math.abs(mid(staves[i]) - y) < Math.abs(mid(staves[bi]) - y)) bi = i;
      if(Math.abs(mid(staves[bi]) - y) <= 9*sp) bucket[bi].push(s);
    }
    for(const i of read) readStaff(staves[i], bucket[i], clean, sp, st);
    // Okunan dizekten az perdeli nota (el yazısı, silik basım): notalara güvenilmez, "sparse" bayrağı
    if(read.length >= 2 && st.notes.filter(n => !n.rest).length < read.length){ st.flags.push("sparse"); for(const n of st.notes) n.conf *= 0.5; }
    for(const n of st.notes) n.box = { page, ...toOrig(P, n.box) };
    return st;
  }

  // Ham notalar → uygulama notaları. Türk notasında ♯/♭ ve AEU işaretleri koma (c = doğal + k), Batı notasında
  // ♯/♭ yarım ses (c en yakın perde ya da null).
  function finish(n, turkish){
    if(n.rest) return { w:null, c:null, d:n.d, rest:true, conf:+n.conf.toFixed(2), box:n.box };
    const R = rep(), nat = { w:n.natW, c:R.naturalOf({ w:n.natW }).c, d:n.d, rest:false };
    const k = n.acc ? (turkish ? ACC_K[n.acc] : (WEST_K[n.acc] !== undefined ? WEST_K[n.acc] : Math.sign(ACC_K[n.acc]))) : 0;
    const p = R.withAccidental(nat, { k, unit:turkish ? "koma" : "semitone" });
    return { w:p.w, c:p.c, d:n.d, rest:false, conf:+n.conf.toFixed(2), box:n.box };
  }

  // Sayfalar (gri/RGB/RGBA resimler) → { notes, marks, bars, meter, flags, nostaffPages, sp, turkish, keySig }. Worker'da çalışır;
  // onProgress(bitenSayfa, toplam) her sayfadan sonra çağrılır.
  function readPages(imgs, opts, onProgress){
    opts = opts || {};
    const raws = [];
    imgs.forEach((img, i) => { raws.push(readRaw(img, (opts.page || 0) + i)); if(onProgress) onProgress(i + 1, imgs.length); });
    const isAeu = c => /^aeu_/.test(c || "");
    const turkish = opts.turkish !== undefined ? !!opts.turkish :
      raws.some(r => (r.keySig || []).some(k => isAeu(k.cls)) || r.notes.some(n => isAeu(n.explicitAcc)));
    const notes = [], marks = [], bars = [], flags = [];
    let sp = 0;
    for(const r of raws){
      const off = notes.length;
      r.notes.forEach(n => notes.push(finish(n, turkish)));
      r.marks.forEach(m => marks.push({ i:m.i + off, kind:m.kind }));
      r.bars.forEach(b => bars.push({ from:b.from + off, to:b.to + off, sum:b.sum }));
      r.flags.forEach(f => { if(f !== "nostaff" && !flags.includes(f)) flags.push(f); });
      if(!sp && r.sp && !r.flags.includes("nostaff")) sp = r.sp;
    }
    // eserin sonundaki çift çizgi bölüm sonu değildir
    for(let i = marks.length - 1; i >= 0; i--) if(marks[i].kind === "sectionEnd" && marks[i].i >= notes.length) marks.splice(i, 1);
    // dizeksiz sayfalar ayrıca bildirilir; "nostaff" yalnızca hiçbir sayfada dizek yoksa (boş kapak sayfası iyi okumayı
    // geçersiz kılmasın)
    const nostaffPages = raws.filter(r => r.flags.includes("nostaff")).map(r => r.page);
    if(nostaffPages.length === raws.length) flags.unshift("nostaff");
    marks.sort((a, b) => a.i - b.i || MARK_ORDER[a.kind] - MARK_ORDER[b.kind]);
    if((marks.length || raws.some(r => r.repeatSeen)) && !flags.includes("repeat")) flags.push("repeat");
    const R = rep();
    let meter, outBars;
    if(bars.length >= 2){
      meter = R.meterFromBars(bars.map(b => b.sum));
      const L = meter[0]*4/meter[1];
      outBars = bars.map((b, i) => ({ from:b.from, to:b.to, sum:b.sum, ok:Math.abs(b.sum - L) < 1e-6 || (i === 0 && b.sum < L) }));
    } else {
      meter = [4, 4];
      outBars = notes.length ? R.barCheck(notes, meter) : [];
    }
    const first = raws.find(r => r.keySig && r.keySig.length);
    const keySig = first ? first.keySig.map(k => {
      const nt = natOfStep(k.step), p = finish({ natW:nt.w, acc:k.cls, d:1, conf:1 }, turkish);
      return { letter:LETTER_TR[nt.letter], step:k.step, cls:k.cls, k:turkish ? ACC_K[k.cls] : WEST_K[k.cls], w:p.w, c:p.c };
    }) : [];
    return { notes, marks, bars:outBars, meter, flags, nostaffPages, sp:+sp.toFixed(2), turkish, keySig };
  }
  const readPage = (img, opts) => readPages([img], opts);

  return { CLASSES, ACC_K, GRID:G, binarize, deskew, rotate, findStaves, removeStaffLines, components, gridOf, classify, splitStems, blackHeads,
    symbols, templates, fromB64, toB64, otsu, holeOf, beamLike, downscale, readPage, readPages };
})();

if(typeof module !== "undefined") module.exports = OMR;
