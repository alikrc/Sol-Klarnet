// Perde eğrisi testleri: iz temizleme, nota başına entonasyon işaretleri ve özet.
// test.js sonunda run(ok) ile çağrılır.

function run(ok){
  const S = require('./skills.js');
  const L = require('./learn.js');
  console.log('\n[45] Perde egrisi');
  // 25 ms adımla kareler; f(nota başından ms) → koma
  const mk = (start, dur, f) => { const a = []; for(let x = 0; x <= dur; x += 25) a.push({ t:start + x, comma:f(x) }); return a; };
  const note = (start, dur, w = 67) => ({ start, end:start + dur, written:w, comma:0 });
  const rast = L.tuningCtx(L.makamById('rast'));
  const I = (frames, notes, ctx = rast) => S.intonationIssues(notes, S.cleanTrace(frames), { ctx });
  let seed = 7;
  const noise = () => { seed = (seed*1103515245 + 12345) % 2147483648; return (seed/2147483648 - 0.5)*Math.sqrt(12); };   // sd ≈ 1

  ok(I(mk(0, 800, () => 0), [note(0, 800)])[0].kinds.length === 0, 'hedefte nota: isaret yok');
  const t2 = I(mk(0, 800, () => 2), [note(0, 800)])[0];
  ok(t2.kinds.join() === 'tiz' && Math.abs(t2.delta - 2) < 0.05 && t2.perde === 'Rast', 'tiz +2', JSON.stringify(t2));
  ok(I(mk(0, 800, () => -2), [note(0, 800)])[0].kinds.join() === 'pes', 'pes -2');
  const t3 = I(mk(0, 800, x => 4*x/800), [note(0, 800)])[0];
  ok(t3.kinds.includes('kayma') && t3.drift > 1.5, 'kayan nota', JSON.stringify(t3));
  const t4 = I(mk(0, 800, x => x < 120 ? -4 : 0), [note(0, 800)])[0];
  ok(t4.kinds.join() === 'alttan', 'alttan giris bilgi isareti', JSON.stringify(t4));
  const t5 = I(mk(0, 1500, x => 0.8*Math.sin(2*Math.PI*5.5*x/1000)), [note(0, 1500)])[0];
  ok(t5.kinds.includes('vibrato') && !t5.kinds.includes('titrek'), 'vibrato titrek sayilmiyor', JSON.stringify(t5));
  const t6 = I(mk(0, 1000, () => noise()*1.2), [note(0, 1000)])[0];
  ok(t6.kinds.includes('titrek') && !t6.kinds.includes('vibrato'), 'titrek nota', JSON.stringify(t6));
  const t7 = I(mk(0, 200, () => 3), [note(0, 200)])[0];
  ok(t7.short && t7.kinds.length === 0, 'kisa nota isaretsiz');

  const c8 = S.cleanTrace(mk(0, 300, () => 0).map((f, i) => i === 6 ? { t:f.t, comma:53 } : f));
  ok(c8.every(f => f.comma === null || Math.abs(f.comma) < 1), 'tek karelik oktav sicramasi atiliyor', JSON.stringify(c8));
  const c8b = S.cleanTrace([{ t:0, comma:0 }, { t:25, comma:0 }, { t:50, comma:null }, { t:75, comma:10 }, { t:100, comma:10 }]);
  ok(c8b[3].comma === 10 && c8b[2].comma === null, 'sessizlik medyani boluyor', JSON.stringify(c8b));
  ok(I(mk(0, 800, x => Math.abs(x - 400) < 10 ? 53 : 0), [note(0, 800)])[0].kinds.length === 0, 'nota icindeki sicrama isaret uretmiyor');

  // Özet: Rast iki kez −2, Dügâh iki kez +1,2, Segâh bir kez −2,2
  {
    const spec = [[67, 0, -2], [69, 9, 1.2], [67, 0, -2], [71, 17, -2.2], [69, 9, 1.2]];
    const frames = [], notes = [];
    spec.forEach(([w, c, d], k) => {
      const s = k*700;
      frames.push(...mk(s, 600, () => c + d), { t:s + 650, comma:null });
      notes.push(note(s, 600, w));
    });
    const sm = S.intonationSummary(I(frames, notes));
    ok(sm.perdes.map(p => p.perde).join() === 'Rast,Dügâh' && sm.perdes[0].dir === 'pes' && sm.perdes[1].dir === 'tiz'
       && sm.perdes[0].written === 67 && sm.perdes[0].n === 2 && sm.measured === 5 && sm.ok === 2 && sm.total === 5, 'ozet: en cok kacan perdeler', JSON.stringify(sm));
  }

  const hic = L.tuningCtx(L.makamById('hicaz'));
  const t10 = I(mk(0, 800, () => 17), [note(0, 800, 71)], hic)[0];
  ok(t10.kinds.includes('disi') && !t10.inScale && t10.perde === 'Segâh', 'Hicaz baglaminda Segâh dizi disi', JSON.stringify(t10));

  // Yanlış alarm: geçişli temiz ezgi
  {
    const cs = [0, 9, 17, 22, 17, 9], frames = [], notes = [];
    cs.forEach((c, k) => {
      const s = k*560, prev = k ? cs[k-1] : c;
      frames.push(...mk(s, 535, x => (x < 60 ? prev + (c - prev)*x/60 : c) + noise()*0.25));
      notes.push(note(s, 535, 67 + k));
    });
    const iss = I(frames, notes);
    ok(iss.every(x => !x.short && x.kinds.filter(k => S.INTON_ERRORS.includes(k)).length === 0), 'temiz ezgide hata isareti yok', JSON.stringify(iss.map(x => x.kinds)));
  }

  ok(I([], [note(0, 800)])[0].short, 'karesiz nota olculmedi');
  const nc = I(mk(0, 800, () => -2), [note(0, 800)], null)[0];
  ok(nc.perde === 'Dik Geveşt' && nc.kinds.length === 0 && nc.inScale, 'baglamsiz: en yakin AEU perdesi, dizi disi denmez', JSON.stringify(nc));
  ok(I(mk(0, 800, () => -2), [note(0, 800)])[0].perde === 'Rast', 'Rast baglaminda 2 koma pes nota Rast sayiliyor');
  const e = S.intonationSummary([]);
  ok(e.total === 0 && e.measured === 0 && e.ok === 0 && e.perdes.length === 0, 'bos ozet');
  // Gerçek perde bulucu 40 ms'de bir ölçer (app.js tick); zaman damgaları biraz oynar
  console.log('\n[46] Perde egrisi: 40 ms kareler');
  {
    const mk40 = (start, dur, f) => { const a = []; for(let x = 0; x <= dur; x += 40) a.push({ t:start + x + (noise()*3), comma:f(x) }); return a; };
    const errs = x => x.kinds.filter(k => S.INTON_ERRORS.includes(k));
    for(const [dur, hz, dep] of [[600, 5, 1.75], [900, 5, 1.75], [900, 4.5, 2], [1500, 6.5, 2], [1500, 5.5, 1.5]]){
      const x = I(mk40(0, dur, t => dep*Math.sin(2*Math.PI*hz*t/1000)), [note(0, dur)])[0];
      ok(errs(x).length === 0, `vibrato ${dur} ms, ${hz} Hz, ±${dep} koma hata sayilmiyor`, JSON.stringify(x));
    }
    const b = I(mk40(0, 800, t => t >= 400 && t <= 480 ? 53 : 0), [note(0, 800)])[0];
    ok(errs(b).length === 0, '3 karelik oktav hatasi isaret uretmiyor', JSON.stringify(b));
    const w = I(mk40(0, 1200, () => noise()*1.4), [note(0, 1200)])[0];
    ok(w.kinds.includes('titrek'), 'uzun notada duzensiz dalgalanma titrek', JSON.stringify(w));
    // AEU modunda (düzeltme yok) Uşşak Segâh'ı icradaki gibi 1,5 koma pes: hata değil
    const us = L.makamById('ussak'), aeu = { ...L.tuningCtx(us), icra:us.icra };
    const u = I(mk40(0, 800, () => 15.2), [note(0, 800, 71)], aeu)[0];
    ok(u.perde === 'Segâh' && errs(u).length === 0, 'Ussak Segah icra perdesinde pes sayilmiyor', JSON.stringify(u));
    ok(errs(I(mk40(0, 800, () => 19), [note(0, 800, 71)], aeu)[0]).join() === 'tiz', 'Ussak Segah 2 koma tiz yine tiz');
    // Kararlı nota bulucusu notayı ≈ 80 ms geç başlatır: kaymanın çoğu nota başından önceki karelerde kalır
    const sc = I(mk40(0, 900, t => t < 140 ? -4 : 0), [note(80, 820)])[0];
    ok(sc.kinds.join() === 'alttan', 'nota basindan onceki alttan giris de bulunuyor', JSON.stringify(sc));
    const gap = I([...mk40(0, 300, () => -6), { t:330, comma:null }, ...mk40(400, 800, () => 0)], [note(400, 800)])[0];
    ok(gap.kinds.length === 0, 'sessizlikten onceki nota giris sayilmiyor', JSON.stringify(gap));
    // Dizi dışı notada pes/tiz yok (hedef belirsiz)
    const d = I(mk40(0, 800, () => 2), [note(0, 800)], { scale:[9], offsets:{} })[0];
    ok(d.kinds.join() === 'disi', 'dizi disi notada yalnizca dizi disi isareti', JSON.stringify(d));
  }

  const tr = mk(0, 1000, () => 0);
  ok(S.firstIndexAt(tr, 510) === 21 && S.firstIndexAt(tr, -5) === 0 && S.firstIndexAt(tr, 5000) === tr.length, 'ikili arama');
}

module.exports = { run };
