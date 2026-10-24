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
  {
    // Uzun kayıt parça parça çözülür (Çevir sekmesi, 5 sn'lik parçalar): parça sınırında kalan nota tek nota olarak birleşir.
    // 1,37 sn'lik parçalarda sınırlar sık ve nota ortalarına düşer; 5 sn (uygulamanın değeri) dörtlüklerin içine düşer.
    const cases = [[A.techAudio(P.notes, 90, { seed:3, T:5 }), 1.37, 'sekizlik, 1,37 sn'],
                   [A.techAudio([...P.notes, ...P.notes].map(n => ({ ...n, d:1 })), 70, { seed:4, T:5 }), 5, 'dortluk ♩=70, 5 sn'],
                   [A.techAudio([...P.notes, ...P.notes, ...P.notes], 100, { seed:5, T:5, art:'tongue' }), 5, 'dilli sekizlik ♩=100, 5 sn']];
    for(const [a, sec, label] of cases){
      const whole = S.audioNotes(a.pcm, a.srate, { T:5 });
      const C = Math.round(a.srate*sec), OV = Math.round(a.srate*0.05);
      let got = [];
      for(let k=0; k*C < a.pcm.length; k++){
        const s = Math.max(0, k*C - OV), e = Math.min(a.pcm.length, (k+1)*C);
        got = S.joinAudioChunk(got, S.audioNotes(a.pcm.subarray(s, e), a.srate, { T:5 }), s/a.srate*1000, (k*C - s)/a.srate*1000);
      }
      const near = (x, y) => x.length === y.length && x.every((n, i) => Math.abs(n.comma - y[i].comma) <= 1 && Math.abs(n.t - y[i].t) <= 40);
      ok(near(got, whole) && a.pcm.length > 2*C, 'parcali cozum butunle ayni notalar (' + label + ')', got.length + ' / ' + whole.length);
      const q1 = S.quantizeRun(got, { makam:'rast' }), q0 = S.quantizeRun(whole, { makam:'rast' });
      ok(played(q1).map(n => n.c + ':' + n.d).join() === played(q0).map(n => n.c + ':' + n.d).join(), 'parcali cozumden ayni nota ve sureler (' + label + ')');
    }
  }
  console.log('\n[45] Duzeltme islemleri');
  {
    const R = require('./repertoire.js');
    const P = t => R.parseScoreText(t).notes;
    const freeze = a => { a.forEach(n => Object.freeze(n)); return Object.freeze(a); };
    const n = P('Segâh')[0];
    ok(R.naturalOf(n).w === 71 && R.stepNote(n, 1).w === 72 && R.stepNote(n, 1).c === 22, 'basamak: Si → Do (Çargâh), isaret sifirlanir');
    ok(R.stepNote(P('Do5')[0], -1).w === 71 && R.stepNote(P('Do5')[0], -1).c === 18, 'basamak: Do → alt Si (oktav gecisi)');
    ok(R.withAccidental(R.naturalOf(n), { k:-1, unit:'koma' }).c === n.c, 'Si + koma bemol = Segâh');
    const hz = R.withAccidental(P('Si4')[0], { k:-4, unit:'koma' });
    ok(hz.c === 14 && hz.w === 70, 'Si + bakiye = c 14, w Si♭', hz.c + ',' + hz.w);
    ok(R.withAccidental(P('Fa4')[0], { k:1, unit:'semitone' }).w === 66, 'konser: Fa♯');
    ok(R.withAccidental(P('Si4')[0], { k:-1, unit:'semitone' }).w === 70, 'konser: Si♭');
    ok(R.ACC_CYCLE.koma.join() === '0,5,-4,1,4,8,-1,-5,-8' && R.ACC_CYCLE.semitone.join() === '0,1,-1', 'ACC_CYCLE');
    const ex = { ...P('Sol4:1')[0], conf:0.4, box:[1,2,3,4], orn:{ kind:'tril', dir:'up' } };
    const keep = [R.stepNote(ex, 1), R.withAccidental(ex, { k:5, unit:'koma' }), R.scaleDur(ex, 2), R.toggleDot(ex), R.transposeAll([ex], 1, 'perde')[0], R.shiftOctave([ex], [0], 1)[0]];
    ok(keep.every(x => x.conf === 0.4 && x.box.join() === '1,2,3,4' && x.orn.kind === 'tril'), 'duzenleme alan korur (conf, box, orn)');
    ok(R.scaleDur(ex, 2).d === 2 && R.scaleDur(ex, 0.5).d === 0.5, 'scaleDur');
    ok(R.toggleDot({ d:1 }).d === 1.5 && R.toggleDot({ d:1.5 }).d === 1 && R.toggleDot({ d:0.75 }).d === 0.5 && R.toggleDot({ d:0.5 }).d === 0.75, 'toggleDot');
    const rs = R.toRest(ex);
    ok(rs.rest === true && rs.w === null && rs.c === null && rs.d === 1 && !rs.orn, 'toRest');
    // birlestirme
    const mg = freeze(P('Sol4:1 Sol4:0.5 La4:1'));
    ok(R.mergeNext(mg, 0).length === 2 && R.mergeNext(mg, 0)[0].d === 1.5, 'mergeNext: ayni perde toplanir');
    ok(R.mergeNext(mg, 1).length === 3 && R.mergeNext(mg, 1)[1].d === 0.5, 'mergeNext: farkli perde degismez');
    ok(mg.length === 3 && mg[0].d === 1, 'mergeNext girdiyi degistirmez');
    // olcu
    const durs = a => a.map(d => ({ w:67, c:0, d, rest:false }));
    const b2 = R.barCheck(durs([2.5,2,2]), [2,4]);
    ok(b2.length === 3 && !b2[0].ok && b2[0].sum === 2.5 && b2[1].ok && b2[0].ok === false, '2/4: tek 2,5 olcu ok:false', JSON.stringify(b2));
    const b3 = R.barCheck(durs([0.5,1,1,1,1]), [2,4]);
    ok(b3.length === 3 && b3[0].ok && b3[0].to === 1 && b3[1].ok && b3[2].ok, 'anacrusis: ilk olcu 0,5 ok:true', JSON.stringify(b3));
    ok(R.barCheck(durs([1,1,1,1]), [2,4]).every(b => b.ok), 'tam olculer ok');
    ok(R.meterFromBars([2,2,2,1.5]).join() === '2,4' && R.meterFromBars([4.5,4.5]).join() === '9,8', 'olcu');
    ok(R.meterFromBars([4,4,3]).join() === '4,4' && R.meterFromBars([3,3]).join() === '3,4' && R.meterFromBars([2.5]).join() === '5,8' &&
       R.meterFromBars([5,5]).join() === '10,8' && R.meterFromBars([3.5,3.5]).join() === '7,8', 'olcu: diger');
    // tekrar (Hicaz Longa: A ‖: B :‖ segno C | D toSegno)
    const lt = s => s.split(' ').map((l, i) => ({ w:67, c:0, d:1, rest:false, l }));
    const hn = lt('a b c d');
    const out = R.expandRepeats(hn, [{ i:1, kind:'repStart' }, { i:2, kind:'repEnd' }, { i:2, kind:'segno' }, { i:3, kind:'sectionEnd' }, { i:4, kind:'toSegno' }]);
    ok(out.map(x => x.l).join('') === 'abbcdc', 'expandRepeats: Hicaz Longa duzeni', out.map(x => x.l).join(''));
    const o2 = R.expandRepeats(hn, [{ i:2, kind:'repEnd' }]);
    ok(o2.map(x => x.l).join('') === 'ababcd', 'expandRepeats: basi isaretsiz tekrar', o2.map(x => x.l).join(''));
    const o3 = R.expandRepeats(hn, [{ i:1, kind:'segno' }, { i:4, kind:'toSegno' }]);
    ok(o3.map(x => x.l).join('') === 'abcdbcd', 'expandRepeats: bitise kadar segno', o3.map(x => x.l).join(''));
    ok(R.expandRepeats(hn, []).length === 4 && out !== hn && out[0] !== hn[0], 'expandRepeats: yeni nesneler');
    // aralik
    const rg = freeze(P('Re3 Sol4 Mi♭7 Fa7'));
    ok(R.rangeIssues(rg).join() === '0,3', 'rangeIssues: Re3 ve Fa7', R.rangeIssues(rg).join());
    const fx = R.shiftOctave(rg, [0, 3], 1);
    const so = R.shiftOctave(P('Sol4'), [0], 1)[0];
    ok(fx[0].w === rg[0].w + 12 && so.w === 79 && so.c === 53, 'shiftOctave +12 / +53');
    const fx2 = R.shiftOctave(rg, [3], -1);
    ok(R.rangeIssues(R.shiftOctave(P('Re3 Fa7'), [0], 1)).join() === '1' && R.rangeIssues(fx2).join() === '0' && fx2[3].w === rg[3].w - 12, 'shiftOctave duzeltir');
    ok(rg[0].w === P('Re3')[0].w, 'shiftOctave girdiyi degistirmez');
    // aktarim
    const rast = freeze(P('Rast Dügâh Segâh Çargâh Nevâ Hüseynî Evç Gerdâniye'));
    const ivs = a => a.slice(1).map((x, k) => x.c - a[k].c).join();
    const up = R.transposeAll(rast, 1, 'perde');
    ok(up[0].c === 9 && ivs(up) === ivs(rast), 'transposeAll perde +1: Dügâh tan baslar, araliklar ayni', up.map(x => x.c).join());
    ok(R.transposeAll(up, -1, 'perde').map(x => x.c).join() === rast.map(x => x.c).join(), 'transposeAll perde: geri alinir');
    ok(R.transposeAll(rast, 2, 'perde')[0].c === 17 && R.transposeAll(rast, -1, 'perde')[0].c === -5, 'transposeAll perde: +2 Segâh, -1 Irak');
    {
      const hz = require('./learn.js').makamById('hicaz'), hp = freeze(hz.asc.map(c => ({ w:Math.round(67 + c*12/53), c, d:1, rest:false })));
      const hu = R.transposeAll(hp, 3, 'perde'), hd = R.transposeAll(hu, -3, 'perde');
      ok(ivs(hu) === ivs(hp) && ivs(hd) === ivs(hp) && hd[0].c === hp[0].c, 'transposeAll perde: Hicaz araliklari korunur');
    }
    const sg = R.transposeAll(P('Segâh Si4'), 1, 'semitone');
    ok(sg[1].c - sg[0].c === 1 && sg[0].w === 72, 'semitone: Segâh ile Si arasindaki koma korunur', sg.map(x => x.c).join());
    const st = R.transposeAll(P('Sol4 Fa4'), 2, 'semitone');
    ok(st[0].w === 69 && st[1].w === 67 && st[0].c === 9, 'transposeAll semitone');
    const rp = R.expandRepeats(lt('a b c d'), [{ i:0, kind:'repStart' }, { i:1, kind:'repEnd' }, { i:3, kind:'repEnd' }]);
    ok(rp.map(x => x.l).join('') === 'aabcbcd', 'expandRepeats: ikinci :|| bir oncekinden sonrasini tekrarlar', rp.map(x => x.l).join(''));
    ok(R.shiftOctave([{ w:67, d:1, rest:false }], [0], 1)[0].c === null, 'shiftOctave: c yok -> null (NaN degil)');
    ok(R.transposeAll([{ w:null, c:null, d:1, rest:true }], 1, 'perde')[0].rest === true && rast[0].c === 0 && rast.length === 8, 'sus ve girdi korunur');
  }
  {
    // Değiştirici döngüsü adı olmayan bir koma verebilir (Si + 5 koma = 23): metin görünümü çökmez, yazılı adı yazar
    const R = require('./repertoire.js');
    const x = R.withAccidental(R.parseScoreText('Si4').notes[0], { k:5, unit:'koma' });
    let t = null, err = null;
    try{ t = R.scoreToText([x, { w:69, c:9, d:2, rest:false }]); }catch(e){ err = e; }
    ok(!err && t === 'Do5 Dügâh:2', 'scoreToText: adsiz koma yazili adla', err ? err.message : t);
    // Metin görünümü yeniden okunurken değişmeyen parçalar eski notayı (adsız koma, güven) korur; ekleme/silme kaydırmaz
    const prev = [{ ...x, conf:0.4 }, { w:69, c:9, d:2, rest:false, conf:0.9 }, { w:67, c:0, d:1, rest:false, conf:0.5 }];
    const r1 = R.reparseKeeping('Do5 Dügâh:2 Rast', prev);
    ok(r1.notes[0].c === 23 && r1.notes[0].conf === 0.4 && r1.notes[2].conf === 0.5 && !r1.errors.length, 'yeniden okuma: adsiz koma ve guven korunur', JSON.stringify(r1.notes[0]));
    const r2 = R.reparseKeeping('Do5 Nevâ Dügâh:2 Xyz Rast', prev);
    ok(r2.notes.length === 4 && r2.notes[0].c === 23 && r2.notes[1].c === 31 && r2.notes[1].conf === undefined && r2.notes[2].conf === 0.9 && r2.notes[3].conf === 0.5 && r2.errors.join() === 'Xyz',
      'yeniden okuma: araya ekleme ve hatali parca', JSON.stringify(r2.notes.map(n => n.c)));
    const r3 = R.reparseKeeping('Do6 Dügâh:2 Rast', prev);
    ok(r3.notes[0].c === 75 && r3.notes[0].conf === undefined && r3.notes[1].conf === 0.9, 'yeniden okuma: degisen parca yeniden okunur', JSON.stringify(r3.notes[0]));
  }
}

module.exports = { run };
