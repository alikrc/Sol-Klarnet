// Gerçek çalgı örnekleri (sounds/): klarnet ve darbuka. Örnekler ilk ses açılınca bir kez yüklenir; yüklenene kadar
// (ya da yüklenemezse) eski sentez sesleri çalar. Zaman çizelgesi sounds/sounds.js'te (scripts/sounds.py üretir).
// Klarnet: University of Iowa Electronic Music Studios, Si♭ klarnet mf, 3 yarım seste bir nota, döngülü.
// Örnek playbackRate = istenen Hz / örneğin ölçülen Hz ile çalınır: perde örnekten değil istenen frekanstan gelir,
// komalı perdeler (53 eşit koma, icra düzeltmeleri) tam çıkar.
// Darbuka: VCSL (Versilian Studios, CC0); düm, tek, ka; iki şiddet, iki tekrar.
const SAMPLER = (() => {
  const S = { klarnet: null, darbuka: null };
  let loading = null;
  async function get(a, name){
    const res = await fetch("sounds/" + name + ".wav");
    if(!res.ok) throw new Error(name + ": " + res.status);
    return await a.decodeAudioData(await res.arrayBuffer());
  }
  function load(a){
    if(loading || typeof SOUND_MAP === "undefined" || typeof fetch === "undefined") return loading;
    loading = Promise.all(["klarnet", "darbuka"].map(n => get(a, n).then(b => { if(n === "klarnet") mendLoops(b); S[n] = b; }).catch(e => console.warn("örnek yüklenemedi", e))));
    return loading;
  }
  // Döngü dikişini onar. Dosya 32 kHz; tarayıcı çözerken ses kartının hızına (çoğu zaman 48 kHz) çevirir ve
  // döngü sonunun hemen ardındaki sessizlik son örnekleri bozar (yarıya düşer, dalgalanır): uzun notalarda her
  // döngüde (yarım saniyede bir) tık, art arda cızırt. Döngü sonunun son 10 ms'i, döngü başının öncesindeki temiz
  // sesle (bir döngü uzunluğu geride) değiştirilir; sonundaki boşluğa da döngü başının devamı yazılır.
  function mendLoops(b){
    const sr = b.sampleRate, X = Math.round(0.01*sr), H = 96, G = Math.round(0.02*sr);
    for(let c = 0; c < b.numberOfChannels; c++){
      const d = b.getChannelData(c);
      for(const m of SOUND_MAP.klarnet){
        const ls = m.loopStart*sr, le = m.loopEnd*sr, L = le - ls;
        const at = p => { const i = Math.floor(p), f = p - i; return d[i]*(1 - f) + d[i + 1]*f; };
        const i0 = Math.ceil(le) - X, i1 = Math.min(d.length - 1, Math.ceil(le) + G);
        if(i0 - L < 1) continue;
        const src = new Float32Array(i1 - i0);
        for(let i = i0; i < i1; i++) src[i - i0] = at(i - L);
        for(let i = i0; i < i1; i++){
          const w = Math.min(1, (i - i0)/(X - H));
          d[i] = d[i]*(1 - w) + src[i - i0]*w;
        }
      }
    }
  }
  // İstenen frekansa en yakın klarnet örneği (log ölçekte) ve gereken çalma hızı
  function klarnet(freq){
    if(!S.klarnet) return null;
    let best = SOUND_MAP.klarnet[0];
    for(const m of SOUND_MAP.klarnet) if(Math.abs(Math.log(m.hz/freq)) < Math.abs(Math.log(best.hz/freq))) best = m;
    return { buf: S.klarnet, m: best, rate: freq/best.hz };
  }
  // Döngülü klarnet sesi; kaynak düğümü döner (playbackRate ile perde, stop ile susar). Kuru kayda hafif oda yankısı eklenir.
  let room = null;
  function roomOf(a){
    if(room && room.context === a) return room;
    const n = Math.round(a.sampleRate*0.7), ir = a.createBuffer(2, n, a.sampleRate);
    for(let c = 0; c < 2; c++){
      const d = ir.getChannelData(c);
      for(let i = 0; i < n; i++) d[i] = (Math.random()*2 - 1)*Math.exp(-i/(a.sampleRate*0.11))*(i < a.sampleRate*0.012 ? i/(a.sampleRate*0.012) : 1);
    }
    const cv = a.createConvolver(), wet = a.createGain(), out = a.createGain();
    cv.buffer = ir; wet.gain.value = 0.16;
    out.connect(a.destination); out.connect(cv); cv.connect(wet); wet.connect(a.destination);
    return (room = { context: a, input: out });
  }
  function klarnetVoice(a, freq, at){
    const k = klarnet(freq);
    if(!k) return null;
    const src = a.createBufferSource();
    src.buffer = k.buf; src.loop = true; src.loopStart = k.m.loopStart; src.loopEnd = k.m.loopEnd;
    src.playbackRate.setValueAtTime(k.rate, at);
    src.start(at, k.m.start);
    return { src, hz: k.m.hz, out: roomOf(a).input };
  }
  // Darbuka vuruşu (k: D, T, k); örnek yoksa null. rate: perde katsayısı (düm, perde bulucunun altına indirilebilsin)
  let rr = 0;
  function drum(a, k, at, dest, vol = 1, rate = 1){
    if(!S.darbuka) return null;
    // Güçlü vuruşlar (vl2); düm, tek ve ka arasındaki düzey farkı kayıttaki gibi kalır. İki tekrar sırayla çalar.
    const list = SOUND_MAP.darbuka.filter(d => d.k === k && d.v === 2);
    if(!list.length) return null;
    const d = list[rr++ % list.length], src = a.createBufferSource(), g = a.createGain();
    src.buffer = S.darbuka; src.playbackRate.value = rate;
    g.gain.value = vol;
    src.connect(g).connect(dest);
    src.start(at, d.start, d.end - d.start);
    return src;
  }
  return { load, klarnetVoice, drum, ready: () => !!S.klarnet };
})();
