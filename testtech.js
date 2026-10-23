// Hız ve teknik testleri: kalıplar, kayıt, çalışta notalar, hizalama, tempo merdiveni ve dersler.
// test.js sonunda run(ok) ile çağrılır.

function run(ok){
  const S = require('./skills.js');
  console.log('\n[37] Teknik kaliplari');
  {
    const r = S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' });
    ok(r.notes.map(n => n.c).join() === '0,9,17,22,31,40,48,53,44,40,31,22,17,9,0' && r.notes.every(n => n.d === 0.5), 'Rast dizisi: cikis (Evc) inis (Acem), sekizlik', r.notes.map(n => n.c).join());
    ok(S.techPattern({ type:'scale', base:60, mode:'major', sub:4, art:'legato' }).notes.map(n => n.w).join() === '60,62,64,65,67,69,71,72,71,69,67,65,64,62,60', 'Do majör gami');
    ok(S.techPattern({ type:'scale', base:57, mode:'minor', sub:2, art:'legato' }).notes.slice(0, 8).map(n => n.w).join() === '57,59,60,62,64,65,67,69', 'La minör gami');
    ok(S.techPattern({ type:'arp', base:67, mode:'major', octaves:2, sub:3, art:'legato' }) === null, 'aralik disi kalip null (iki oktav Sol majör: Re6, Sol6)');
    ok(S.techPattern({ type:'arp', base:57, mode:'minor', sub:2, art:'legato' }).notes.map(n => n.w).join() === '57,60,64,69,64,60,57', 'La minör arpej');
    ok(S.techPattern({ type:'thirds', base:60, mode:'major', sub:2, art:'legato' }).notes.slice(0, 6).map(n => n.w).join() === '60,64,62,65,64,67', 'uclu atlamalar');
    ok(S.techPattern({ type:'groups', base:67, mode:'major', sub:4, art:'legato' }).notes.slice(0, 8).map(n => n.w).join() === '67,69,71,72,69,71,72,74', 'dortlu gruplar');
    ok(S.techPattern({ type:'break', pair:[69,71], sub:2, art:'legato' }).notes.map(n => n.w).join() === '69,71,69,71,69,71,69,71,69', 'register gecisi');
    ok(S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' }).label.tr === 'Rast dizisi · sekizlik' && S.patternKey({ type:'scale', makam:'rast', sub:2, art:'legato' }) === 'scale:rast::1:2:legato', 'etiket ve anahtar');
  }

  console.log('\n[38] Kayit');
  {
    const { PcmRecorder } = require('./pcmring.js');
    const rec = new PcmRecorder(5);
    rec.push(Float32Array.from([1,2]), 100); rec.push(Float32Array.from([3,4]), 150); rec.push(Float32Array.from([5,6]), 200);
    const out = rec.stop();
    ok(out.t0 === 100 && out.data.join() === '1,2,3,4,5' && out.full, 'kayit bloklari birlestiriyor, siniri asmiyor');
  }

  const A = require('./testaudio.js');
  const P = S.techPattern({ type:'scale', makam:'rast', sub:4, art:'legato' });
  console.log('\n[39] Calista notalar');
  {
    const run = (o, tempo = 90) => { const a = A.techAudio(P.notes, tempo, { seed:1, ...o });
      const tr = S.ornamentTrack(a.pcm, a.srate, { T: o.T || 5, expectHz:300 }); return { a, n: S.runNotes(tr) }; };
    ok(run({}).n.length === 15, 'bagli on altilik ♩=90: 15 nota', run({}).n.length);
    ok(run({}, 140).n.length === 15, 'bagli on altilik ♩=140 (107 ms): 15 nota', run({}, 140).n.length);
    ok(run({ art:'tongue' }).n.length === 15, 'dille on altilik: 15 nota', run({ art:'tongue' }).n.length);
    const rep = A.techAudio([{ w:69, d:0.5 }, { w:69, d:0.5 }, { w:69, d:0.5 }, { w:69, d:0.5 }], 90, { seed:2, art:'tongue' });
    const rn = S.runNotes(S.ornamentTrack(rep.pcm, rep.srate, { T:5, expectHz:300 }));
    ok(rn.length === 4, 'dille ayni notanin tekrari: 4 nota', rn.length);
    const ck = A.techAudio(P.notes, 90, { seed:3 }); A.addClicks(ck.pcm, ck.srate, [0,1,2,3,4,5].map(k => k*667 + 30));
    const cn = S.runNotes(S.ornamentTrack(ck.pcm, ck.srate, { T:5, expectHz:300 }));
    ok(cn.length === 15, 'metronom tiki nota sayilmiyor', cn.length);
    const t2 = run({ T:2 });
    ok(t2.n.length === 15 && Math.abs(t2.n[0].comma - 0) < 1, 'baska calgida (T=2) ayni yazili notalar', t2.n.length);
  }
}

module.exports = { run };
