// Mikrofon sesinin son birkaç saniyesi (ham PCM): süsleme denemeleri bitince 5 ms adımla yeniden çözülür.
// Halka ana iş parçacığında tutulur; AudioWorklet bağlamında bu dosya ayrıca "pcm-ring" işlemcisini kaydeder,
// işlemci her bloğu zamanıyla birlikte ana iş parçacığına yollar. Node'da require("./pcmring.js") ile test edilir.

class PcmRing{
  constructor(capacity){ this.buf = new Float32Array(capacity); this.w = 0; this.n = 0; }
  get length(){ return this.n; }
  push(data){
    const cap = this.buf.length;
    let src = data;
    if(src.length > cap) src = src.subarray(src.length - cap);
    const first = Math.min(src.length, cap - this.w);
    this.buf.set(src.subarray(0, first), this.w);
    if(first < src.length) this.buf.set(src.subarray(first), 0);
    this.w = (this.w + src.length) % cap;
    this.n = Math.min(cap, this.n + src.length);
  }
  // Son n örnek (eskiden yeniye)
  read(n){
    const cap = this.buf.length, k = Math.min(n, this.n), out = new Float32Array(k);
    const start = (this.w - k + cap) % cap, first = Math.min(k, cap - start);
    out.set(this.buf.subarray(start, start + first), 0);
    if(first < k) out.set(this.buf.subarray(0, k - first), first);
    return out;
  }
}

// 128 örneklik worklet bloklarını size örneklik mesajlarda toplar (saniyede ~375 yerine ~45 mesaj).
// push dolunca { t (ilk bloğun ses saati), data } döner; blok sığmazsa birikmiş kısım gönderilir, blok yeniye başlar.
class PcmBatch{
  constructor(size){ this.size = size; this.buf = new Float32Array(size); this.n = 0; this.t = 0; }
  take(){ const out = { t: this.t, data: this.buf.subarray(0, this.n) }; this.buf = new Float32Array(this.size); this.n = 0; return out; }
  push(block, t){
    const out = this.n && this.n + block.length > this.size ? this.take() : null;
    if(this.n === 0) this.t = t;
    this.buf.set(block.subarray(0, this.size), this.n); this.n += Math.min(block.length, this.size);
    return out || (this.n >= this.size ? this.take() : null);
  }
}
// performance.now() ile ses saati arasındaki fark (ms): gecikmeli gelen mesajlar büyük değer verir, en küçüğü tutulur.
// İki saat arasındaki kayma birikmesin diye tutulan değer zamanla (100 ppm) yukarı sızar.
const CLOCK_LEAK = 1e-4;
function clockOffset(prev, sample, dtMs){
  return prev === null ? sample : Math.min(prev + dtMs*CLOCK_LEAK, sample);
}

if(typeof registerProcessor !== "undefined"){
  registerProcessor("pcm-ring", class extends AudioWorkletProcessor{
    constructor(){ super(); this.batch = new PcmBatch(2048); }
    process(inputs){
      const ch = inputs[0] && inputs[0][0];
      const out = ch && this.batch.push(ch, currentTime);
      if(out) this.port.postMessage(out, [out.data.buffer]);
      return true;
    }
  });
}

if(typeof module !== "undefined") module.exports = { PcmRing, PcmBatch, clockOffset };
