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
    const { PcmBatch, clockOffset } = require('./pcmring.js');
    const bt = new PcmBatch(256), outs = [];
    for(let k=0;k<5;k++){ const o = bt.push(Float32Array.from({ length:128 }, (_, j) => k*128 + j), k*0.01); if(o) outs.push(o); }
    ok(outs.length === 2 && outs[0].data.length === 256 && outs[0].t === 0 && outs[1].t === 0.02 && outs[1].data[0] === 256, 'worklet bloklari 256 orneklik toplu mesajda, zaman ilk blogun');
    ok(clockOffset(null, 12, 0) === 12 && clockOffset(10, 12, 0) === 10 && clockOffset(10, 9, 5) === 9, 'saat farki: en kucugu tutulur');
    let off = 10; for(let s=0;s<60;s++) off = clockOffset(off, 13, 100);
    ok(off > 10 && off < 13, 'saat farki zamanla yavasca yukari kayabiliyor (saat kaymasi birikmez)', off);
    const swOff = clockOffset(10, 12, 60000);
    ok(swOff <= 12 && swOff > 10, 'bir dakikada en cok birkac ms', swOff);
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

  const ev = (segs, spec, o = {}) => { const a = A.ornamentAudio(segs, { seed: o.seed || 7, ...o });
    return S.ornamentEval(S.ornamentTrack(a.pcm, a.srate, { T:5, expectHz:300 }), spec); };
  console.log('\n[29] Carpma ve mordan');
  {
    const C = { kind:'carpma', note:69, dir:'up' };
    let hit = 0, durErr = 0;
    for(const ms of [25,40,60,80,110]) for(let s=0;s<4;s++){
      const r = ev([{ w:71, ms }, { w:69, ms:500 }], C, { seed:s+1, hp: s%2 ? 200 : null, breath: 0.02 + s*0.015 });
      if(r.ok){ hit++; durErr = Math.max(durErr, Math.abs(r.durMs - ms)); }
    }
    ok(hit >= 19, 'ustten carpma 25–110 ms (telefon suzgeci, nefes): en az 19/20 bulunuyor', hit);
    ok(durErr <= 15, 'carpma suresi hatasi ≤ 15 ms', durErr);
    const long = ev([{ w:71, ms:200 }, { w:69, ms:500 }], C);
    ok(!long.ok && long.measured && /appoggiatura/.test(long.tips[0].tr), 'uzun carpma: kaldi + appoggiatura ipucu', JSON.stringify(long));
    let fp = 0;
    for(let s=0;s<40;s++){ const r = ev([{ comma: 9 + (s%2 ? 3 : -3), ms:12 }, { w:69, ms:500 }], C, { seed:100+s }); if(r.found) fp++; }
    ok(fp <= 1, 'atak kaymasi (12 ms, ±3 koma) carpma sayilmiyor', fp);
    ok(!ev([{ w:69, ms:500 }], C).found, 'duz nota carpma degil');
    ok(ev([{ w:67, ms:50 }, { w:69, ms:500 }], { ...C, dir:'down' }).ok, 'alttan carpma');
    ok(Math.abs(S.ornamentNeighbor({ note:71, comma:17, makam:'ussak', dir:'up' }) - 22) < 0.01, 'Ussak ta Segah in ust komsusu Cargah (makam dizisinden)');
    const quiet = ev([{ w:71, ms:50 }, { w:69, ms:500 }], C, { gapMs:1500 });
    ok(!quiet.measured && !quiet.ok, 'cogu sessiz deneme olculemedi sayiliyor');
    ok(ev([{ w:69, ms:120 }, { w:71, ms:60 }, { w:69, ms:500 }], { kind:'mordan', note:69, dir:'up' }).ok, 'ust mordan');
    ok(!ev([{ w:69, ms:120 }, { w:71, ms:60 }, { w:69, ms:500 }], { kind:'mordan', note:69, dir:'down' }).ok, 'yanlis yone mordan gecmiyor');
    const rep = ev([{ w:69, ms:300 }, { w:71, ms:40 }, { w:69, ms:300 }, { w:71, ms:40 }, { w:69, ms:300 }, { w:71, ms:40 }, { w:69, ms:300 }], { kind:'tekrar', note:69, dir:'up' });
    ok(rep.ok && rep.count === 3, 'carpmali tekrar: 3 bolme', JSON.stringify(rep));
  }

  console.log('\n[30] Tril, giris, dusus');
  {
    const trill = (rateHz, n, jitter = 0, seed = 1) => { const segs = [], r = A.rng(seed);
      for(let i=0;i<n*2;i++) segs.push({ w: i%2 ? 69 : 67, ms: 1000/rateHz/2*(1 + jitter*(r()-0.5)) }); return segs; };
    const T6 = ev(trill(6, 14), { kind:'tril', note:67, dir:'up', rate:6, sec:2 });
    ok(T6.ok && Math.abs(T6.rate - 6) <= 0.5, 'duzenli 6/sn tril, hiz hatasi ≤ 0,5', JSON.stringify(T6));
    for(const hz of [3,4,8,10]){
      const x = ev(trill(hz, hz*2.5), { kind:'tril', note:67, dir:'up', rate:2, sec:2 });
      ok(x.found && Math.abs(x.rate - hz) <= 0.5, 'tril hizi ' + hz + '/sn olculuyor', x.rate);
    }
    ok(!ev(trill(6, 14, 0.9), { kind:'tril', note:67, dir:'up', rate:4, sec:2 }).ok, 'cok duzensiz tril gecmiyor');
    ok(!ev(trill(4, 10), { kind:'tril', note:67, dir:'up', rate:6, sec:2 }).ok, 'hedeften yavas tril gecmiyor');
    let vf = 0;
    for(let s=0;s<50;s++) if(ev([{ w:67, ms:2500, vib:{ rate: 5 + (s%4), depth:1.5 } }], { kind:'tril', note:67, dir:'up', rate:2, sec:2 }, { seed:200+s }).found) vf++;
    ok(vf <= 1, 'vibrato (±1,5 koma) tril sayilmiyor', vf);
    ok(ev([{ comma:4, ms:200, to:9 }, { w:69, ms:500 }], { kind:'giris', note:69 }).ok, 'alttan kayarak giris');
    ok(!ev([{ w:69, ms:600 }], { kind:'giris', note:69 }).found, 'duz atak giris degil');
    ok(ev([{ w:69, ms:500 }, { comma:9, ms:250, to:2 }], { kind:'dusus', note:69 }).ok, 'sonda dusus');
    ok(!ev([{ w:69, ms:600 }], { kind:'dusus', note:69 }).found, 'duz bitis dusus degil');
  }

  console.log('\n[31] Susleme isaretleri');
  {
    const R = require('./repertoire.js');
    const sig = ns => ns.map(n => n.orn ? n.orn.kind + (n.orn.dir || '') : '').join();
    const p = R.parseScoreText('La4:2:tr Si4:1:ç+ Sol4::m- Do5 Re5:1:k Mi5:1:d');
    ok(!p.errors.length && p.notes[0].orn.kind === 'tril' && p.notes[1].orn.dir === 'up' && p.notes[2].d === 1 && p.notes[2].orn.kind === 'mordan' && !p.notes[3].orn, 'nota metni susleme ekleri', JSON.stringify(p));
    ok(R.parseScoreText('La4:1:zz').errors.length === 1, 'bilinmeyen ek hata');
    ok(sig(R.parseScoreText('La4:1:g-').notes) === 'carpmadown', 'Ingilizce yazim (g-) alttan carpma');
    ok(sig(R.parseScoreText(R.scoreToText(p.notes)).notes) === sig(p.notes), 'ekler gidis-donus korunuyor', R.scoreToText(p.notes));
    const xml = '<part id="P1"><measure><attributes><divisions>1</divisions></attributes>' +
      '<note><grace/><pitch><step>B</step><octave>4</octave></pitch></note>' +
      '<note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><notations><ornaments><trill-mark/></ornaments></notations></note>' +
      '<note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><notations><ornaments><inverted-mordent/></ornaments></notations></note></measure></part>';
    const x = R.parseMusicXML(xml).notes;
    ok(x.length === 2 && x[0].orn.kind === 'tril' && x[1].orn.kind === 'mordan' && x[1].orn.dir === 'up', 'MusicXML tril ve mordan (isaret grace notadan once gelir)', JSON.stringify(x));
    const xg = R.parseMusicXML('<part id="P1"><measure><attributes><divisions>1</divisions></attributes>' +
      '<note><grace/><pitch><step>B</step><octave>4</octave></pitch></note>' +
      '<note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration></note>' +
      '<note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><notations><ornaments><mordent/></ornaments></notations></note></measure></part>').notes;
    ok(sig(xg) === 'carpmaup,mordandown', 'MusicXML grace nota ustten carpma, mordent alt mordan', JSON.stringify(xg));
    ['e-sus-ussak','e-sus-hicaz'].forEach(id => { const e = R.etudeById(id), n = e ? R.etudeNotes(e).filter(n => n.orn) : [];
      ok(n.length >= 4 && new Set(n.map(o => o.orn.kind)).size >= 3, id + ': en az 4 susleme, 3 tur'); });
  }

  console.log('\n[32] Susleme dersleri');
  {
    const D = require('./lessons.js');
    ok(D.LESSONS.length === 52 && D.LESSONS.filter(l => l.unit === 'susleme').map(l => l.id).join() === 'sus-carpma,sus-carpma-alt,sus-mordan,sus-tril,sus-uslup,sus-ezgi,sus-makam', 'susleme unitesi 7 ders, sirasi dogru', D.LESSONS.length);
    ok(D.LESSONS.indexOf(D.lessonById('sus-makam')) + 1 === D.LESSONS.indexOf(D.lessonById('rast-giris')), 'susleme makamlardan once');
    ok(D.UNITS.findIndex(u => u.id === 'susleme') === D.UNITS.findIndex(u => u.id === 'teknik') + 1, 'susleme unitesi teknikten sonra');
    ok(D.stepTitle({type:'ornament', kind:'carpma', dir:'up', note:69, n:5}) === 'Süsleme: üstten çarpma · La4 · 5 kez' &&
       D.stepTitle({type:'ornament', kind:'carpma', dir:'up', note:69, n:5}, 'en') === 'Ornament: upper grace note · A4 · 5 times' &&
       D.stepTitle({type:'ornament', kind:'tril', note:67, dir:'up', rate:6, sec:2}) === 'Süsleme: tril · Sol4 · 2 sn · en az 6 dönüş/sn' &&
       D.stepTitle({type:'ornament', kind:'tril', note:67, dir:'up', rate:6, sec:2}, 'en') === 'Ornament: trill · G4 · 2 s · at least 6 turns/s', 'susleme adim basligi',
       D.stepTitle({type:'ornament', kind:'carpma', dir:'up', note:69, n:5}) + ' / ' + D.stepTitle({type:'ornament', kind:'tril', note:67, dir:'up', rate:6, sec:2}, 'en'));
    ok(D.stepOk({type:'ornament', kind:'tril', rate:6}, {v:6.2}) && !D.stepOk({type:'ornament', kind:'carpma', n:5}, {v:4}) && D.stepOk({type:'ornament', kind:'carpma', n:5}, {v:5}), 'susleme adimi gecme kosulu');
    const p = {}, fin = id => { const l = D.lessonById(id); p[id] = { s: Object.fromEntries(l.steps.map((_, i) => [i, { v:99, ok:true }])) }; };
    D.LESSONS.filter(l => l.unit === 'temel' || l.unit === 'klarino').forEach(l => fin(l.id));
    const sc = D.lessonById('sus-carpma');
    ok(!D.unlocked(sc, p), 'temel ve klarino bitince susleme hala kilitli');
    fin('glissando');
    ok(!D.unlocked(sc, p), 'glissando tek basina yetmiyor');
    fin('artikulasyon');
    ok(D.unlocked(sc, p) && !D.unlocked(D.lessonById('sus-carpma-alt'), p), 'glissando ve dil vurusu bitince ilk susleme dersi acik, ikincisi kilitli');
    ['sus-carpma','sus-carpma-alt','sus-mordan','sus-tril','sus-uslup','sus-ezgi'].forEach(fin);
    ok(!D.unlocked(D.lessonById('sus-makam'), p), 'Ussak ve Hicaz bitmeden makamda susleme kilitli');
    fin('ussak'); fin('hicaz');
    ok(D.unlocked(D.lessonById('sus-makam'), p), 'Ussak ve Hicaz bitince makamda susleme acik');
    const dp = D.dailyPlan({ prog:p, intStats:{}, quizStats:{}, day:'2026-10-23' });
    ok(dp.steps.some(s => s.type === 'ornament'), 'susleme dersi bitince gunluk planda susleme adimi var');
    ok(!D.dailyPlan({ prog:{}, intStats:{}, quizStats:{}, day:'2026-10-23' }).steps.some(s => s.type === 'ornament'), 'susleme dersi bitmeden gunluk planda susleme yok');
  }

  console.log('\n[33] Susleme ornek sesi');
  {
    const on = S.ornamentNotes({ kind:'carpma', note:69, dir:'up' });
    ok(on.length === 2 && on[0].ms === 60 && on[0].comma === 18 && on[1].comma === 9 && on[1].ms === 900, 'ornek ses: carpma (Buselik → Dugah, perdelerde)', JSON.stringify(on));
    const ot = S.ornamentNotes({ kind:'tril', note:67, dir:'up' });
    ok(ot.length === 29 && ot.slice(0, 28).every(x => x.ms === 70) && ot[1].comma === 9, 'ornek ses: tril');
    ok(S.ornamentNotes({ kind:'giris', note:69 })[0].to === 9 && S.ornamentNotes({ kind:'giris', note:69 })[0].comma === 4, 'ornek ses: kayarak giris rampali');
    const od = S.ornamentNotes({ kind:'dusus', note:69 });
    ok(od.length === 2 && od[1].to === 1, 'ornek ses: dusus');
    ok(S.ornamentNotes({ kind:'mordan', note:69, dir:'down' }).map(x => x.comma).join() === '9,0,9' && S.ornamentNotes({ kind:'tekrar', note:69, dir:'up' }).length === 7, 'ornek ses: mordan ve tekrar');
    ok(S.ornamentNotes({ kind:'carpma', note:71, comma:17, makam:'ussak', dir:'up' })[0].comma === 22, 'ornek ses: makamda komsu makam dizisinden');
  }

  console.log('\n[34] Eser susleme puani');
  {
    ok(JSON.stringify(S.ornamentScore([{ ok:true, measured:true }, { ok:false, measured:true }, { ok:false, measured:false }])) === '{"n":2,"found":1,"pct":50}' &&
       S.ornamentScore([]).pct === null, 'eser susleme puani (olculemeyen sayilmaz)');
    const shortMain = [{ w:71, ms:50 }, { w:69, ms:220 }];
    ok(!ev(shortMain, { kind:'carpma', note:69, dir:'up' }).ok && ev(shortMain, { kind:'carpma', note:69, dir:'up', mainMin:150 }).ok, 'eserde kisa nota: mainMin ile ana nota alt siniri dusuyor');
  }

  console.log('\n[35] Gozden gecirme duzeltmeleri');
  {
    const { midiToFreq } = require('./core.js');
    // Pes bölge (2048 örneklik pencere): sonuç çalgıya göre değişmemeli
    const evT = (segs, spec, T, seed) => { const a = A.ornamentAudio(segs, { seed, T });
      return S.ornamentEval(S.ornamentTrack(a.pcm, a.srate, { T, expectHz: midiToFreq(spec.note - T) }), spec); };
    for(const T of [5, 2]){
      const lowC = { kind:'carpma', note:64, dir:'down' }, lowM = { kind:'mordan', note:64, dir:'down' }, rep = { kind:'tekrar', note:64, dir:'up' };
      const nbD = S.ornamentNeighbor(lowC), nbU = S.ornamentNeighbor(rep);
      let c = 0, m = 0, t = 0;
      for(let s=1;s<=5;s++){
        if(evT([{ comma:nbD, ms:60 }, { w:64, ms:500 }], lowC, T, s).ok) c++;
        if(evT([{ w:64, ms:120 }, { comma:nbD, ms:60 }, { w:64, ms:500 }], lowM, T, s).ok) m++;
        if(evT([{ w:64, ms:300 }, { comma:nbU, ms:40 }, { w:64, ms:300 }, { comma:nbU, ms:40 }, { w:64, ms:300 }, { comma:nbU, ms:40 }, { w:64, ms:300 }], rep, T, s).ok) t++;
      }
      ok(c >= 4 && m >= 4 && t >= 4, 'Mi4 (T=' + T + '): alttan carpma, alt mordan, carpmali tekrar bulunuyor', [c, m, t].join('/'));
    }
    // Tutulan notadan başlayan tril düzensiz sayılmamalı
    const trillFrom = (holdMs) => { const segs = [{ w:67, ms:holdMs }]; for(let i=0;i<28;i++) segs.push({ w: i%2 ? 67 : 69, ms:83 }); return segs; };
    for(const h of [300, 600]){
      const r = ev(trillFrom(h), { kind:'tril', note:67, dir:'up', rate:5, sec:2 });
      ok(r.ok && Math.abs(r.rate - 6) <= 0.5, 'tril ' + h + ' ms tutulan notadan basliyor: gecer, hiz dogru', JSON.stringify([r.rate, r.evenness]));
    }
    // Hassasiyet: kısık ses, kullanıcının eşiğiyle duyulur
    const q = A.ornamentAudio([{ w:71, ms:50 }, { w:69, ms:500 }], { seed:3, breath:0.002 });
    const quiet = q.pcm.map(x => x*0.012);
    const C = { kind:'carpma', note:69, dir:'up' };
    ok(!S.ornamentEval(S.ornamentTrack(quiet, q.srate, { T:5, expectHz:300 }), C).measured &&
       S.ornamentEval(S.ornamentTrack(quiet, q.srate, { T:5, expectHz:300, minRms:0.002 }), C).ok, 'kisik ses: kullanicinin esigi (minRms) ile olculuyor');
    // Ölçülemeyen deneme nedeni söylenir
    const ub = S.ornamentUnmeasured('busy', 'carpma'), un = S.ornamentUnmeasured('nobuf', 'carpma');
    ok(!ub.measured && !ub.ok && /dron/i.test(ub.tips[0].tr) && /drone/i.test(ub.tips[0].en) && un.tips.length === 1 && un.tips[0].tr !== ub.tips[0].tr, 'olculemeyen deneme: dron/ornek ses ve tampon nedeni soyleniyor');
    // Eserde önceki nota çarpmanın komşusuysa çarpma ölçülemez; etütlerde böyle çarpma yok
    ok(S.ornamentAmbiguous(22, { kind:'carpma', dir:'up', note:71, comma:17, makam:'ussak' }) && !S.ornamentAmbiguous(9, { kind:'carpma', dir:'up', note:71, comma:17, makam:'ussak' }) &&
       !S.ornamentAmbiguous(22, { kind:'tril', dir:'up', note:71, comma:17, makam:'ussak' }), 'onceki nota komsu perdedeyse carpma belirsiz');
    const R = require('./repertoire.js'), amb = [];
    R.ETUDES.forEach(e => { const ns = R.etudeNotes(e); ns.forEach((n, i) => { const p = ns[i-1];
      if(n.orn && p && !p.rest && p.c !== null && S.ornamentAmbiguous(p.c, { ...n.orn, note:n.w, comma:n.c, makam:e.makam || undefined })) amb.push(e.id + '#' + i); }); });
    ok(!amb.length, 'etutlerde onceki notasi komsu perdede olan carpma yok', amb.join(','));
  }

  console.log('\n[36] Ertelenen kucuk duzeltmeler');
  {
    const { midiToFreq } = require('./core.js');
    const tongued = ev([{ w:69, ms:300 }, { rest:true, ms:60 }, { w:69, ms:300 }, { rest:true, ms:60 }, { w:69, ms:300 }, { rest:true, ms:60 }, { w:69, ms:300 }], { kind:'tekrar', note:69, dir:'up' });
    ok(tongued.measured && !tongued.ok && /Dille/.test(tongued.tips.map(t => t.tr).join(' ')), 'dille bolunen tekrar: kalir, dil ipucu', JSON.stringify(tongued.tips));
    // Pes bölgede (2048 pencere, Mi4 ve T=5) çarpma süresi de ≤ 15 ms hatayla
    const C = { kind:'carpma', note:64, dir:'up' }, nb = S.ornamentNeighbor(C);
    let hit = 0, err = 0, n = 0;
    for(const ms of [30, 40, 60, 80, 110]) for(let s=1;s<=3;s++){
      n++;
      const a = A.ornamentAudio([{ comma:nb, ms }, { w:64, ms:500 }], { seed:s, T:5 });
      const r = S.ornamentEval(S.ornamentTrack(a.pcm, a.srate, { T:5, expectHz: midiToFreq(64 - 5) }), C);
      if(r.ok){ hit++; err = Math.max(err, Math.abs(r.durMs - ms)); }
    }
    ok(hit >= n - 1 && err <= 15, 'pes bolge (2048 pencere): carpma 30–110 ms bulunuyor, sure hatasi ≤ 15 ms', hit + '/' + n + ' hata ' + err.toFixed(1));
  }
}

module.exports = { run };
