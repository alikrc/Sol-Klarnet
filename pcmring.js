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

if(typeof registerProcessor !== "undefined"){
  registerProcessor("pcm-ring", class extends AudioWorkletProcessor{
    process(inputs){
      const ch = inputs[0] && inputs[0][0];
      if(ch) this.port.postMessage({ t: currentTime, data: ch.slice() });
      return true;
    }
  });
}

if(typeof module !== "undefined") module.exports = { PcmRing };
