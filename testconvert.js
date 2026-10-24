// Sesten ölçülü nota testleri (audioNotes, tuningOffset, quantizeRun). test.js sonunda run(ok) ile çağrılır.

function run(ok){
  const S = require('./skills.js');
  const A = require('./testaudio.js');
  const P = S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' });
  const conv = (notes, tempo, o = {}, q = {}) => {
    const a = A.techAudio(notes, tempo, { seed:1, T:5, ...o });
    const n = S.audioNotes(a.pcm, a.srate, { T:5 });
    return { a, n, q: S.quantizeRun(n, q) };
  };
  const played = q => q.notes.filter(n => !n.rest);
  console.log('\n[44] Sesten nota');
  {
    const r = conv(P.notes, 90, {}, { makam:'rast' }), q = r.q;
    ok(Math.abs(q.tempo - 90) <= 4.5 && played(q).length === 15, 'Rast sekizlik ♩=90: tempo ±%5, 15 nota', q.tempo + ' / ' + played(q).length);
    ok(played(q).every(n => n.d === 0.5), 'sekizlikler', played(q).map(n => n.d).join());
    ok(played(q).map(n => n.c).join() === '0,9,17,22,31,40,48,53,44,40,31,22,17,9,0', 'perdeler', played(q).map(n => n.c).join());
    ok(q.meter.join() === '4,4' && played(q).every(n => n.conf > 0.6), 'ölçü 4/4, güven yüksek', played(q).map(n => n.conf.toFixed(2)).join());
    const q2 = S.quantizeRun(r.n);
    ok(played(q2).map(n => n.c).join() === played(q).map(n => n.c).join(), 'makamsız da aynı perdeler');
  }
  {
    const seq = [0.75, 0.25, 0.75, 0.25, 0.75, 0.25, 1, 1].map((d, i) => ({ w: [67,69,71,72,71,69,67,69][i], d }));
    const q = conv(seq, 90).q;
    ok(played(q).map(n => n.d).join() === seq.map(n => n.d).join() && Math.abs(q.tempo - 90) <= 4.5, 'noktalı ritim aynı süreler', played(q).map(n => n.d).join() + ' ♩=' + q.tempo);
  }
  {
    // Düzgün üçleme dörtlü ızgarada 3/4 tempoyla aynı başlangıçları verir: otomatik tempoda yalnızca süre tutarlılığı,
    // tempo verilince (90) ızgara üçlü seçer
    const seq = [67,69,71,72,71,69,67,69,71].map(w => ({ w, d:1/3 }));
    const q = conv(seq, 90).q, ms = 60000/90/3;
    ok(played(q).length === 9 && played(q).every(n => Math.abs(n.d*60000/q.tempo - ms) <= ms*0.1), 'üçleme: otomatik tempoda süreler gerçek uzunlukta', played(q).map(n => n.d).join() + ' ♩=' + q.tempo);
    const q3 = conv(seq, 90, {}, { tempo:90 }).q;
    ok(played(q3).length === 9 && played(q3).every(n => n.d === 1/3), 'üçleme: tempo verilince ızgara üçlü seçer', played(q3).map(n => n.d.toFixed(2)).join());
  }
  {
    // Düzgün sekizlikler tempoda ×2 / ÷2 belirsizdir: tempo gerçeğin ±%5 içinde ya da ×2/÷2 karşılığı olmalı, süreler gerçek uzunlukta
    for(const tp of [60, 70, 130]){
      const q = conv(P.notes, tp).q, ms = 30000/tp;
      const tempoOk = [1, 2, 0.5].some(k => Math.abs(q.tempo/(tp*k) - 1) <= 0.05);
      ok(tempoOk && played(q).length === 15 && played(q).every(n => Math.abs(n.d*60000/q.tempo - ms) <= ms*0.1), 'düzgün sekizlikler ♩=' + tp + ': tempo ×2/÷2 dahil tutarlı, süreler gerçek', q.tempo + ' d=' + played(q)[0].d);
    }
  }
  {
    const seq = [{ w:67, d:1 }, { w:69, d:1 }, { w:71, d:1 }, { w:72, d:1 }, { w:71, d:1 }];
    const q = conv(seq, 90, { skip:[2] }).q;
    ok(q.notes.map(n => (n.rest ? 'r' : 'n') + n.d).join() === 'n1,n1,r1,n1,n1', 'ortadaki 1 vuruşluk sus: rest d=1', q.notes.map(n => (n.rest ? 'r' : 'n') + n.d).join());
  }
  {
    // 30 ms'lik süs notası bir sonraki notaya katılır
    const segs = [];
    [67,69,71,72,71,69].forEach((w, i) => { if(i === 3) segs.push({ w:74, ms:30 }); segs.push({ w, ms:667 - (i === 3 ? 30 : 0) }); });
    const a = A.ornamentAudio(segs, { seed:3, T:5, gapMs:100 });
    const q = S.quantizeRun(S.audioNotes(a.pcm, a.srate, { T:5 }), {});
    ok(played(q).length === 6 && played(q).every(n => n.d === 1), 'süs notası sonrakine katılır', played(q).map(n => n.w + ':' + n.d).join());
  }
  {
    const r = conv([67,69,71,72,71,69].map(w => ({ w, d:1 })), 120, {}, { makam:'rast', tempo:60 }), q = r.q;
    ok(q.tempo === 60 && played(q).length === 6 && played(q).every(n => n.d === 0.5), 'opts.tempo verilince tahmin edilmez, süreler ona göre', q.tempo + ' ' + played(q).map(n => n.d).join());
  }
  {
    const shifted = P.notes.map(n => ({ ...n, c: n.c + 3 }));
    const r = conv(shifted, 90), off = S.tuningOffset(r.n);
    const q = S.quantizeRun(r.n, { makam:'rast', offset: off });
    ok(Math.abs(off - 3) <= 0.7, 'kayık akort: tuningOffset ≈ 3', off);
    ok(played(q).map(n => n.c).join() === '0,9,17,22,31,40,48,53,44,40,31,22,17,9,0' && Math.abs(q.offset - off) < 1e-9, 'kayık akort: perdeler doğru', played(q).map(n => n.c).join());
    const q3 = S.quantizeRun(r.n, { makam:'rast' });
    ok(played(q3).map(n => n.c).join() === played(q).map(n => n.c).join(), 'offset verilmezse kendisi bulur');
    ok(S.tuningOffset(r.n.slice(0, 2)) === 0, 'üçten az nota: kayma 0');
  }
  {
    const L = require('./learn.js'), hz = L.makamById('hicaz');
    const hs = [...hz.asc, ...[...hz.desc].reverse().slice(1)].map(c => ({ c, d:0.5 }));
    const off = (notes, sh) => S.tuningOffset(conv(notes.map(n => ({ ...n, c: n.c + sh })), 90).n);
    const o0 = off(hs, 0), o2 = off(hs, 2);
    ok(Math.abs(o0) <= 0.7, 'Hicaz dizisi kaymasız: |offset| ≤ 0,7', o0);
    ok(Math.abs(o2 - 2) <= 0.7, 'Hicaz +2 kayık: offset ≈ 2', o2);
    const om = off(P.notes, -3);
    ok(Math.abs(om + 3) <= 0.7, 'Rast -3 kayık: offset ≈ -3', om);
  }
  {
    const z = new Float32Array(22050*3);
    const n = S.audioNotes(z, 22050, { T:5 });
    ok(n.length === 0, 'sessiz kayit: audioNotes boş', n.length);
    let q = null, err = null;
    try{ q = S.quantizeRun([]); }catch(e){ err = e; }
    ok(!err && q && q.notes.length === 0, 'sessiz kayit: quantizeRun([]) çökmez', err && err.message);
  }
}

module.exports = { run };
