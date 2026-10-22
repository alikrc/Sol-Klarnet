// Süsleme testleri (çarpma, mordan, tril, kayarak giriş, düşüş): PCM tamponu, yoğun perde izi, değerlendirme,
// nota işaretleri ve dersler. test.js sonunda run(ok) ile çağrılır.
const fs = require('fs');
const path = require('path');
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

function run(ok){
  console.log('\n[27] PCM halka tamponu');
  {
    const { PcmRing } = require('./pcmring.js');
    const r = new PcmRing(8);
    r.push(Float32Array.from([1,2,3])); r.push(Float32Array.from([4,5,6,7,8,9,10]));
    ok(r.length === 8 && r.read(3).join() === '8,9,10' && r.read(8).join() === '3,4,5,6,7,8,9,10', 'halka tamponu son ornekleri sirayla veriyor');
    ok(r.read(20).length === 8, 'tamponda olandan fazlasi istenince olan kadar');
    const sw = rd('sw.js'), build = rd('scripts/build-web.js');
    ok(sw.includes('"pcmring.js"') && build.includes('"pcmring.js"'), 'worklet dosyasi SW onbelleginde ve www/ paketinde');
  }
}

module.exports = { run };
