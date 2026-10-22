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

  const S = require('./skills.js'), A = require('./testaudio.js');
  console.log('\n[28] Yogun perde izi');
  {
    const { pcm, srate } = A.ornamentAudio([{ w:69, ms:400 }, { w:71, ms:400 }], { seed:1 });
    const tr = S.ornamentTrack(pcm, srate, { T:5, expectHz:300 });
    ok(Math.abs(tr[1].t - tr[0].t - 5) < 0.01 && tr.length >= 150, 'iz 5 ms adimla', tr.length);
    const mn = S.microNotes(tr);
    ok(mn.length === 2 && Math.abs(mn[0].comma - 9) < 1 && Math.abs(mn[1].comma - 17.7) < 1 && Math.abs(mn[0].ms - 400) < 40, 'iki nota iki mikro nota, komalar dogru', JSON.stringify(mn));
    const g = A.ornamentAudio([{ w:71, ms:50 }, { w:69, ms:400 }], { seed:2 });
    const gm = S.microNotes(S.ornamentTrack(g.pcm, g.srate, { T:5, expectHz:300 }));
    ok(gm.length === 2 && gm[0].ms >= 30 && gm[0].ms <= 70, '50 ms lik kisa nota ayri mikro nota olarak goruluyor', JSON.stringify(gm.map(m => m.ms)));
    const b = A.ornamentAudio([{ w:69, ms:400 }], { seed:3, T:2 });     // Si♭ klarnet
    const bm = S.microNotes(S.ornamentTrack(b.pcm, b.srate, { T:2, expectHz:400 }));
    ok(bm.length === 1 && Math.abs(bm[0].comma - 9) < 1, 'baska calgida (T=2) ayni yazili koma', JSON.stringify(bm));
  }
}

module.exports = { run };
