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

  console.log('\n[40] Hizalama');
  {
    const exp = (a, notes, tempo) => notes.map((n, i) => ({ t: a.starts[i], w: n.w, ms: n.d*60000/tempo }));
    const judge = (o, tempo = 90) => { const a = A.techAudio(P.notes, tempo, { seed:1, ...o });
      const tr = S.ornamentTrack(a.pcm, a.srate, { T:5, expectHz:300 });
      const al = S.alignRun(exp(a, P.notes, tempo), S.runPlayed(S.runNotes(tr), 0), o.busy ? { busy:o.busy } : {});
      return { al, v: S.runVerdict(al, 60000/tempo/4, tr.filter(f => f.comma !== null).length/tr.length) }; };
    const good = judge({});
    ok(good.al.correct >= 0.95 && good.v.clean, 'dogru calis temiz', JSON.stringify([good.al.correct, good.al.mean, good.al.sd, good.al.evenness, good.v.tips]));
    const f140 = judge({}, 140), tg = judge({ art:'tongue' });
    ok(f140.v.clean && tg.v.clean, '♩=140 bagli ve dille temiz', JSON.stringify([f140.al.correct, f140.al.sd, f140.al.evenness, tg.al.correct, tg.al.sd, tg.al.evenness]));
    const w = judge({ wrong:{ i:3, w:65 } });
    ok(w.al.notes[3].state === 'pitch' && /4\./.test(w.v.tips[0].tr), 'yanlis nota yerinde bulunuyor', JSON.stringify(w.v.tips));
    ok(judge({ skip:[5] }).al.notes[5].state === 'miss', 'kacan nota');
    ok(judge({ extra:{ after:7, w:76 } }).al.extra === 1, 'fazla nota', judge({ extra:{ after:7, w:76 } }).al.extra);
    const rush = judge({ rush:0.15 });
    ok(!rush.v.clean && /erken/.test(rush.v.tips.map(t => t.tr).join()), 'acele temiz degil', JSON.stringify(rush.v.tips));
    ok(rush.al.correct >= 0.9 && !/yanlış/.test(rush.v.tips.map(t => t.tr).join()), 'acele eden dogru notalar yanlis sayilmiyor (tempo kaymasi)', rush.al.correct);
    ok(!judge({ jitter:0.6 }).v.clean, 'duzensiz temiz degil');
    const b = judge({ busy:[[0, 300]] });
    ok(b.al.notes.slice(0, 2).every(n => n.state === 'skip') && b.v.clean, 'mesgul araliktaki notalar atlaniyor, kacan sayilmiyor');
    ok(!S.runVerdict({ notes:[], extra:0, correct:0, mean:0, sd:0, evenness:0 }, 160, 0.3).measured, 'perdeli oran %50 altinda olculemedi');
  }

  console.log('\n[41] Merdiven');
  {
    const L = new S.TempoLadder(60, { target:72 });
    ok(L.record('clean').tempo === 64 && L.best === 60, 'temiz: +4');
    ok(L.record('dirty').tempo === 64 && L.record('dirty').tempo === 60, 'tek hata kalir, iki hata −4');
    ok(L.record('unmeasured').tempo === 60, 'olculemeyen sayilmaz');
    const H = new S.TempoLadder(118); H.record('clean'); ok(H.record('clean').tempo === 128, '120 ustunde +6', H.tempo);
    const F = new S.TempoLadder(60); for(let k=0;k<10;k++) F.record('dirty'); ok(F.tempo === 42, 'alt sinir %70', F.tempo);
    const R3 = new S.TempoLadder(60); R3.record('dirty'); R3.record('dirty'); ok(R3.record('dirty').rest, 'art arda 3 hata: dinlen');
    const T = new S.TempoLadder(64, { target:68 }); T.record('clean'); ok(T.record('clean').done && T.best === 68, 'hedefte biter');
    const Pc = new S.TempoLadder(60, { max:120, stepFn: () => 5 }); Pc.record('clean'); ok(Pc.tempo === 65, 'eser yuzdesi +5');
    const Mx = new S.TempoLadder(118, { max:120, stepFn: () => 5 }); Mx.record('clean'); ok(Mx.tempo === 120, 'ust sinir', Mx.tempo);
    const R = require('./repertoire.js');
    ok(R.pieceClean({ pitchRate:0.92, mean:-30, sd:40 }) && !R.pieceClean({ pitchRate:0.92, mean:70, sd:40 }) && !R.pieceClean({ pitchRate:0.85, mean:0, sd:10 }), 'eserde temiz calis');
  }

  console.log('\n[42] Hiz dersleri');
  {
    const D = require('./lessons.js');
    ok(D.LESSONS.length === 59 && D.LESSONS.filter(l => l.unit === 'hiz').map(l => l.id).join() === 'hiz-metronom,hiz-artik,hiz-parmak,hiz-arpej,hiz-16lik,hiz-makam,hiz-etut', 'hiz unitesi 7 ders', D.LESSONS.length);
    ok(D.LESSONS.indexOf(D.lessonById('hiz-etut')) + 1 === D.LESSONS.indexOf(D.lessonById('sus-carpma')) && D.UNITS.map(u => u.id).join().includes('teknik,hiz,susleme'), 'hiz teknik ile susleme arasinda');
    ok(D.stepTitle({ type:'tech', pattern:{ type:'scale', makam:'rast', sub:2, art:'legato' }, start:60, target:80 }) === 'Hız: Rast dizisi · sekizlik · ♩=60 → 80' &&
       D.stepTitle({ type:'tech', pattern:{ type:'scale', makam:'rast', sub:2, art:'legato' }, start:60, target:80 }, 'en') === 'Speed: Rast scale · eighths · ♩=60 → 80', 'tech basligi');
    ok(D.stepOk({ type:'tech', target:80 }, { v:80 }) && !D.stepOk({ type:'tech', target:80 }, { v:76 }) && D.stepOk({ type:'piece', mode:'ladder', min:100 }, { v:100 }) && !D.stepOk({ type:'piece', mode:'ladder', min:100 }, { v:95 }), 'gecme kosullari');
    const p = {}, fin = id => { const l = D.lessonById(id); p[id] = { s: Object.fromEntries(l.steps.map((_, i) => [i, { v:999, ok:true }])) }; };
    D.LESSONS.filter(l => l.unit === 'temel' || l.unit === 'klarino').forEach(l => fin(l.id));
    const hm = D.lessonById('hiz-metronom');
    ok(!D.unlocked(hm, p), 'temel ve klarino bitince hiz hala kilitli');
    fin('artikulasyon');
    ok(D.unlocked(hm, p) && !D.unlocked(D.lessonById('hiz-artik'), p), 'dil vurusu bitince ilk hiz dersi acik, ikincisi kilitli');
    fin('hiz-metronom');
    const dp = D.dailyPlan({ prog:p, intStats:{}, quizStats:{}, day:'2026-10-24', techBest:{ 'scale:rast::1:2:legato':84 } });
    const ts = dp.steps.find(s => s.type === 'tech');
    ok(ts && ts.start === 76 && ts.target === 88, 'gunluk planda hiz: son en iyinin 8 alti, 3 basamak', JSON.stringify(ts));
    ok(!D.dailyPlan({ prog:{}, intStats:{}, quizStats:{}, day:'2026-10-24' }).steps.some(s => s.type === 'tech'), 'hiz dersi bitmeden gunluk planda hiz yok');
    // Süsleme ünitesinin açılması değişmedi
    const ps = {}; D.LESSONS.filter(l => l.unit === 'temel' || l.unit === 'klarino').forEach(l => { ps[l.id] = p[l.id]; }); ps.glissando = { s: Object.fromEntries(D.lessonById('glissando').steps.map((_, i) => [i, { v:999, ok:true }])) }; ps.artikulasyon = p.artikulasyon;
    ok(D.unlocked(D.lessonById('sus-carpma'), ps), 'susleme hiz unitesini beklemiyor');
  }
}

module.exports = { run };
