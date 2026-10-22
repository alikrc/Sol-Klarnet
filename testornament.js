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
}

module.exports = { run };
