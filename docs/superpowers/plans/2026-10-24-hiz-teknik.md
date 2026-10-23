# Hız ve Teknik Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teknik kalıpları (dizi, gam, arpej, üçlü, parmak grubu, register geçişi), metronomlu çalışın ham sesten
ölçülmesi, tempo merdiveni, 7 derslik "Hız ve teknik" ünitesi, "Hız" sekmesi ve eserlerde merdiven.

**Architecture:** Kalıplar `skills.js`'te kurallarla üretilir. Çalış sırasında mikrofonun ham sesi `SK.pcmCapture`
ile biriktirilir; çalış bitince `ornamentTrack` (5 ms) → `runNotes` (perde değişimi + ses düzeyi çukuru) →
`alignRun` (dinamik programlama ile beklenen notalarla hizalama) → `runVerdict` (temiz mi, ipuçları) çalışır.
`TempoLadder` sonraki tempoyu seçer. Arayüz `trainers.js` (`techRun`, `TRAINERS.hiz`, `TRAINER_STEPS.tech`) ve
`pieces.js` (merdiven).

**Tech Stack:** Düz tarayıcı JavaScript, Web Audio, Node ile `node test.js` (+ `testornament.js`, yeni `testtech.js`).
Bağımlılık eklenmez.

**Spec:** `docs/superpowers/specs/2026-10-24-hiz-teknik-design.md`

## Global Constraints

- Kullanıcı metinleri iki dilli: veride `{ tr, en }`, arayüzde `L("…", "…")`.
- Saf mantık `skills.js` / `lessons.js` / `repertoire.js` / `pcmring.js`'te ve Node'da test edilir.
- Yeni perde bulucu yok: `ornamentTrack(pcm, sr, { T, expectHz, minRms, minHz, maxHz })`, `microNotes`, `partMs` kullanılır.
- Bütün kalıp notaları yazılı Mi3–Do6 (MIDI 52–84); taşan kalıp `null` döner.
- Temiz çalış: `correct ≥ 0,9`, `|mean| ≤ 0,25 × notaMs`, `sd ≤ 0,2 × notaMs`, `evenness ≤ 0,2`; perdeli oran < 0,5 → ölçülemedi.
- Merdiven: temiz → +4 (tempo > 120 ise +6); üst üste 2 temiz olmayan → −aynı adım; tek hata değiştirmez; ölçülemeyen sayılmaz;
  alt sınır başlangıcın %70'i; üst sınır 220; art arda 3 temiz olmayan → dinlen önerisi ve oturum sonu.
- Eser merdiveni: %60'tan, temiz → +%5, 2 temiz olmayan → −%5, en çok %120; eserde temiz = `pitchRate ≥ 0,9`, `|mean| ≤ 60`, `sd ≤ 50`.
- Kayıt en çok 30 sn.
- Ders sayısı 52 → 59; ünite sırası `teknik`, `hiz`, `susleme`, `makam`.
- Her task sonunda `npm test` geçer, commit edilir ve hemen pushlanır. Commit mesajı Türkçe, sonunda
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Metronom sızıntısı** (hoparlörden mikrofona kısa tık) nota sayılmamalı → Task 3 testi.
2. **Dille aynı notanın tekrarı** (register geçişi kalıbında değil ama dille çalışta) ayrı notalar olarak bulunmalı → Task 3 testi.
3. **Çok hızlı bağlı on altılık** (♩=140, 107 ms nota) eksiksiz bulunmalı → Task 3 ve Task 4 testleri.
4. **Dron ya da örnek ses çalarken** alınan aralıktaki notalar "kaçan" sayılmamalı (atlanmalı) → Task 4 testi (`busy`).
5. **Başka çalgı** (T ≠ 5) aynı yazılı kalıpta aynı sonucu vermeli → Task 3 testi.

---

### Task 1: Teknik kalıpları

**Files:**
- Modify: `skills.js` (yeni bölüm `// ---- Hız ve teknik ----`, exports)
- Create: `testtech.js` (`run(ok)`; `test.js` sonunda `testornament.js`'ten sonra çağrılır)
- Modify: `test.js` (çağrı)

**Interfaces:**
- Produces: `techPattern(spec) → { notes:[{ w, c, d }], meter:[4,4], label:{ tr, en } } | null`
  `spec: { type:"scale"|"arp"|"thirds"|"groups"|"break", makam?, base?, mode?:"major"|"minor", octaves?:1|2, sub:2|3|4, art:"legato"|"tongue", pair?:[w,w] }`.
  `d = 1/sub`. `c`: makam varsa perde koması, yoksa `null`.
  - Dizi kaynağı (`scale`, `thirds`, `groups`): makam varsa `mk.asc` (çıkış) ve `mk.desc` (iniş) komaları, 2 oktavda
    `+53` eklenerek; yoksa `base` (yazılı) + majör `[2,2,1,2,2,2,1]` / minör `[2,1,2,2,1,2,2]`.
  - `scale`: çıkış + iniş (tepe bir kez).
  - `arp`: majör `[0,4,7,12]`, minör `[0,3,7,12]`, 2 oktavda `[…,16|15,19,24]`; çıkış + iniş.
  - `thirds`: çıkışta `(S[i], S[i+2])` i=0…n−3, inişte `(S[i], S[i−2])` i=n−1…2.
  - `groups`: çıkışta `S[i..i+3]` i=0…n−4, sonra tepe.
  - `break`: `pair` 4 kez `a b`, sonra `a` (9 nota).
  - `label`: örn. `{ tr:"Rast dizisi · sekizlik", en:"Rast scale · eighths" }`; alt bölüm adları: 2 sekizlik/eighths,
    3 triole/triplets, 4 on altılık/sixteenths.
- Produces: `patternKey(spec) → string` = `[type, makam||base, mode||"", octaves||1, sub, art].join(":")`.

- [ ] **Step 1: Failing tests** (`testtech.js`, başlık `[37] Teknik kaliplari`)

```js
const S = require('./skills.js');
const r = S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' });
ok(r.notes.map(n => n.c).join() === '0,9,17,22,31,40,48,53,44,40,31,22,17,9,0' && r.notes.every(n => n.d === 0.5), 'Rast dizisi: cikis (Evc) inis (Acem), sekizlik');
ok(S.techPattern({ type:'scale', base:60, mode:'major', sub:4, art:'legato' }).notes.map(n => n.w).join() === '60,62,64,65,67,69,71,72,71,69,67,65,64,62,60', 'Do majör gami');
ok(S.techPattern({ type:'scale', base:57, mode:'minor', sub:2, art:'legato' }).notes.slice(0, 8).map(n => n.w).join() === '57,59,60,62,64,65,67,69', 'La minör gami');
ok(S.techPattern({ type:'arp', base:67, mode:'major', octaves:2, sub:3, art:'legato' }) === null, 'aralik disi kalip null (iki oktav Sol majör: Re6, Sol6)');
ok(S.techPattern({ type:'arp', base:57, mode:'minor', sub:2, art:'legato' }).notes.map(n => n.w).join() === '57,60,64,69,64,60,57', 'La minör arpej');
ok(S.techPattern({ type:'thirds', base:60, mode:'major', sub:2, art:'legato' }).notes.slice(0, 6).map(n => n.w).join() === '60,64,62,65,64,67', 'uclu atlamalar');
ok(S.techPattern({ type:'groups', base:67, mode:'major', sub:4, art:'legato' }).notes.slice(0, 8).map(n => n.w).join() === '67,69,71,72,69,71,72,74', 'dortlu gruplar');
ok(S.techPattern({ type:'break', pair:[69,71], sub:2, art:'legato' }).notes.map(n => n.w).join() === '69,71,69,71,69,71,69,71,69', 'register gecisi');
ok(S.techPattern({ type:'scale', makam:'rast', sub:2, art:'legato' }).label.tr === 'Rast dizisi · sekizlik' && S.patternKey({ type:'scale', makam:'rast', sub:2, art:'legato' }) === 'scale:rast::1:2:legato', 'etiket ve anahtar');
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL `techPattern is not a function`.
- [ ] **Step 3: Implement** `techPattern`, `patternKey`.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit + push** — `Hız: teknik kalıpları`.

---

### Task 2: Ham ses aboneliği

**Files:**
- Modify: `pcmring.js` (`PcmRecorder`), `app.js` (`take` içinde abonelere ver; `SK.pcmCapture`), `testtech.js` (`[38] Kayit`)

**Interfaces:**
- Produces: `class PcmRecorder { constructor(maxSamples); push(data:Float32Array, t:number /* perf ms, bloğun başı */); stop() → { data:Float32Array, t0, full:boolean } }`
  `maxSamples` aşılınca yeni bloklar alınmaz ve `full = true`.
- Produces: `SK.pcmCapture() → { stop() → { data, sampleRate, t0, busy:[[b,e]] } | null }` (mikrofon kapalıysa `null`).
  En çok `30 * sampleRate` örnek. `busy`: kayıt aralığıyla kesişen meşgul aralıklar (dron/örnek ses).

- [ ] **Step 1: Failing test**

```js
const { PcmRecorder } = require('./pcmring.js');
const rec = new PcmRecorder(5);
rec.push(Float32Array.from([1,2]), 100); rec.push(Float32Array.from([3,4]), 150); rec.push(Float32Array.from([5,6]), 200);
const out = rec.stop();
ok(out.t0 === 100 && out.data.join() === '1,2,3,4,5' && out.full, 'kayit bloklari birlestiriyor, siniri asmiyor');
```

- [ ] **Step 2: Run** — FAIL. **Step 3:** `PcmRecorder` yaz; `app.js`'te `const pcmTaps = new Set()`, `take` içinde
  `pcmTaps.forEach(f => f(data, me.endT - data.length/a.sampleRate*1000))`; `SK.pcmCapture` bir `PcmRecorder(30*sr)`
  aboneliği kurar, `stop()` aboneliği kaldırır ve `busy`'den kesişenleri ekler. **Step 4:** `npm test` — PASS.
- [ ] **Step 5: Commit + push** — `Hız: ham ses aboneliği`.

---

### Task 3: Çalışta notaları bulmak

**Files:**
- Modify: `skills.js`, `testaudio.js` (`addClicks`), `testtech.js` (`[39] Calista notalar`)

**Interfaces:**
- Consumes: `ornamentTrack`, `microNotes`, `partMs` (skills.js).
- Produces: `runNotes(track, opts?) → [{ t, end, comma }]` (`t`: nota başı, iz zamanı ms). Kurallar:
  `microNotes(track, 2, 40)` parçaları nota; bir parçanın içinde `rms` tepe değerin %45'inin altına düşüp %70'e dönerse
  (dip ≥ 15 ms) orada bölünür; perdesiz aralıkla ayrılan aynı perdeli parçalar ayrı notadır.
- Produces (`testaudio.js`): `addClicks(pcm, srate, timesMs, amp=0.4)` — her zamana 3 ms'lik geniş bantlı (gürültü) tık ekler.
- Produces (`testaudio.js`): `techAudio(notes, tempo, opts)` → `{ pcm, srate, starts:[ms] }`: `notes` (`techPattern`
  notaları) her biri `d*60000/tempo` ms; `opts.art==="tongue"` ise her notanın son 25 ms'i sus; `opts.jitter`
  (oran, rastgele), `opts.rush` (her notanın başına −oran), `opts.T`, `opts.seed`, `opts.wrong:{ i, w }`, `opts.skip:[i]`,
  `opts.extra:{ after, w }`. `ornamentAudio` üstüne kurulur.

- [ ] **Step 1: Failing tests**

```js
const A = require('./testaudio.js');
const P = S.techPattern({ type:'scale', makam:'rast', sub:4, art:'legato' });
const run = (o, tempo = 90) => { const a = A.techAudio(P.notes, tempo, { seed:1, ...o });
  const tr = S.ornamentTrack(a.pcm, a.srate, { T: o.T || 5, expectHz:300 }); return { a, n: S.runNotes(tr) }; };
ok(run({}).n.length === 15, 'bagli on altilik ♩=90: 15 nota');
ok(run({}, 140).n.length === 15, 'bagli on altilik ♩=140 (107 ms): 15 nota');
ok(run({ art:'tongue' }).n.length === 15, 'dille on altilik: 15 nota');
const rep = A.techAudio([{ w:69, d:0.5 }, { w:69, d:0.5 }, { w:69, d:0.5 }, { w:69, d:0.5 }], 90, { seed:2, art:'tongue' });
ok(S.runNotes(S.ornamentTrack(rep.pcm, rep.srate, { T:5, expectHz:300 })).length === 4, 'dille ayni notanin tekrari: 4 nota');
const ck = A.techAudio(P.notes, 90, { seed:3 }); A.addClicks(ck.pcm, ck.srate, [0,1,2,3,4,5].map(k => k*667 + 30));
ok(S.runNotes(S.ornamentTrack(ck.pcm, ck.srate, { T:5, expectHz:300 })).length === 15, 'metronom tiki nota sayilmiyor');
ok(run({ T:2 }).n.length === 15 && Math.abs(run({ T:2 }).n[0].comma - 0) < 1, 'baska calgida (T=2) ayni yazili notalar');
```

- [ ] **Step 2: Run** — FAIL. **Step 3:** `techAudio`, `addClicks`, `runNotes`. **Step 4:** PASS.
- [ ] **Step 5: Commit + push** — `Hız: çalışta notaları bulma`.

---

### Task 4: Hizalama ve karar

**Files:**
- Modify: `skills.js`, `testtech.js` (`[40] Hizalama`)

**Interfaces:**
- Produces: `alignRun(expected, played, opts?) → { notes:[{ i, state:"ok"|"pitch"|"miss"|"skip", dev?, got? }], extra, correct, mean, sd, evenness }`
  `expected:[{ t, w, ms }]` (`ms`: notanın beklenen süresi), `played:[{ t, w }]`, `opts.busy:[[b,e]]` (bu aralıktaki
  beklenen notalar `skip`, oranlara girmez). Dinamik programlama: eşleşme maliyeti `(w eşit ? 0 : 1) + |dt|/tol`,
  yalnızca `|dt| ≤ tol` iken; atlama maliyeti 1. `tol = max(80, 0.6*ms)`. `correct = ok / (beklenen − skip)`.
  `evenness`: art arda iki `ok` nota için `(got_t2 − got_t1) / (exp_t2 − exp_t1)` oranlarının değişkenlik katsayısı.
- Produces: `runVerdict(align, noteMs, voicedRatio) → { clean, measured, tips:[{ tr, en }] }` — Global Constraints'teki
  eşikler. İpucu sırası: ölçülemedi → yanlış/kaçan notalar ("3. ve 7. nota yanlış"; en çok 3 sıra numarası) →
  takılma (yanlış/kaçan notaların ≥ 2'si art arda 3 nota içindeyse "La4–Si4 geçişinde takılıyorsun") → acele/geç
  ("ortalama 40 ms erken") → düzensiz.
- Produces: `runPlayed(notes, w0) → [{ t, w }]` yardımcı: `runNotes` çıktısını `t0` kaydırmasıyla perf zamanına
  ve en yakın yazılı notaya çevirir (`w = Math.round(67 + comma*12/53)`).

- [ ] **Step 1: Failing tests** (Task 3'teki `techAudio` ile; beklenen zamanlar `a.starts`)

```js
const exp = (a, notes, tempo) => notes.map((n, i) => ({ t: a.starts[i], w: n.w, ms: n.d*60000/tempo }));
const judge = (o, tempo = 90) => { const a = A.techAudio(P.notes, tempo, { seed:1, ...o });
  const tr = S.ornamentTrack(a.pcm, a.srate, { T:5, expectHz:300 });
  const al = S.alignRun(exp(a, P.notes, tempo), S.runPlayed(S.runNotes(tr), 0), o.busy ? { busy:o.busy } : {});
  return { al, v: S.runVerdict(al, 60000/tempo/4, tr.filter(f => f.comma !== null).length/tr.length) }; };
const good = judge({});
ok(good.al.correct >= 0.95 && good.v.clean, 'dogru calis temiz', JSON.stringify([good.al.correct, good.al.mean, good.al.sd, good.al.evenness]));
ok(judge({}, 140).v.clean && judge({ art:'tongue' }).v.clean, '♩=140 bagli ve dille temiz');
const w = judge({ wrong:{ i:3, w:65 } });
ok(w.al.notes[3].state === 'pitch' && /4\./.test(w.v.tips[0].tr), 'yanlis nota yerinde bulunuyor');
ok(judge({ skip:[5] }).al.notes[5].state === 'miss', 'kacan nota');
ok(judge({ extra:{ after:7, w:76 } }).al.extra === 1, 'fazla nota');
ok(!judge({ rush:0.15 }).v.clean && /erken/.test(judge({ rush:0.15 }).v.tips.map(t => t.tr).join()), 'acele temiz degil');
ok(!judge({ jitter:0.6 }).v.clean, 'duzensiz temiz degil');
const b = judge({ busy:[[0, 700]] });
ok(b.al.notes.slice(0, 2).every(n => n.state === 'skip') && b.v.clean, 'mesgul araliktaki notalar atlaniyor, kacan sayilmiyor');
ok(!S.runVerdict({ notes:[], extra:0, correct:0, mean:0, sd:0, evenness:0 }, 160, 0.3).measured, 'perdeli oran %50 altinda olculemedi');
```

- [ ] **Step 2: Run** — FAIL. **Step 3:** `alignRun`, `runVerdict`, `runPlayed`. **Step 4:** PASS (`techAudio` jitter/rush seed'leri testi sabitler).
- [ ] **Step 5: Commit + push** — `Hız: hizalama ve temiz çalış kararı`.

---

### Task 5: Tempo merdiveni

**Files:**
- Modify: `skills.js`, `repertoire.js` (`pieceClean`), `testtech.js` (`[41] Merdiven`)

**Interfaces:**
- Produces: `class TempoLadder { constructor(start, { target?, max=220, stepFn? }); record("clean"|"dirty"|"unmeasured") → { tempo, best, done, rest }; tempo; best }`
  Adım: `tempo > 120 ? 6 : 4`. `done`: `target` varsa `best ≥ target`. `rest`: art arda 3 `dirty`. Alt sınır `Math.round(start*0.7)`.
- Produces: `class PctLadder` yerine `new TempoLadder(60, { target, max:120, stepFn: () => 5 })` (eser yüzdesi için aynı sınıf).
- Produces (`repertoire.js`): `pieceClean(res) → boolean` (`pitchRate ≥ 0.9 && |mean| ≤ 60 && sd ≤ 50`).

- [ ] **Step 1: Failing tests**

```js
const L = new S.TempoLadder(60, { target:72 });
ok(L.record('clean').tempo === 64 && L.best === 60, 'temiz: +4');
ok(L.record('dirty').tempo === 64 && L.record('dirty').tempo === 60, 'tek hata kalir, iki hata −4');
ok(L.record('unmeasured').tempo === 60, 'olculemeyen sayilmaz');
const H = new S.TempoLadder(118); H.record('clean'); ok(H.record('clean').tempo === 128, '120 ustunde +6');
const F = new S.TempoLadder(60); for(let k=0;k<10;k++) F.record('dirty'); ok(F.tempo === 42, 'alt sinir %70');
const R3 = new S.TempoLadder(60); R3.record('dirty'); R3.record('dirty'); ok(R3.record('dirty').rest, 'art arda 3 hata: dinlen');
const T = new S.TempoLadder(64, { target:68 }); T.record('clean'); ok(T.record('clean').done && T.best === 68, 'hedefte biter');
const Pc = new S.TempoLadder(60, { max:120, stepFn: () => 5 }); Pc.record('clean'); ok(Pc.tempo === 65, 'eser yuzdesi +5');
const R = require('./repertoire.js');
ok(R.pieceClean({ pitchRate:0.92, mean:-30, sd:40 }) && !R.pieceClean({ pitchRate:0.92, mean:70, sd:40 }) && !R.pieceClean({ pitchRate:0.85, mean:0, sd:10 }), 'eserde temiz calis');
```

(`best` güncellemesi: `record("clean")` çağrıldığında çalınan tempo `best`'e yazılır, sonra tempo artar.)

- [ ] **Step 2–4:** FAIL → yaz → PASS. **Step 5: Commit + push** — `Hız: tempo merdiveni`.

---

### Task 6: Ünite, dersler, `tech` adımı, hızlı etüt

**Files:**
- Modify: `lessons.js` (`UNITS`, `HIZ` dizisi, yerleştirme `sus-carpma`'dan önce, `stepTitle`, `stepOk`, `unlocked`, `dailyPlan`),
  `repertoire.js` (`e-hiz-hicaz`), `test.js` (`TYPES`'a `'tech'`, adım denetimi, `piece` modlarına `'ladder'`), `testtech.js` (`[42] Hiz dersleri`)

**Interfaces:**
- Consumes: `techPattern`, `patternKey` (Task 1).
- Produces: adım `{ type:"tech", pattern:{…spec}, start, target }`; `res.v` = en iyi temiz tempo; `stepOk`: `v ≥ target`.
  `stepTitle`: tr `Hız: <label.tr> · ♩=<start> → <target>`, en `Speed: <label.en> · ♩=<start> → <target>`.
- Produces: `piece` adımında `mode:"ladder"`: `stepOk` `v ≥ min`; başlık tr `Eser: <ad> · tempo merdiveni · %<min>'e kadar`,
  en `Piece: <name> · tempo ladder · up to <min>%`.
- Produces: `listen` adımı `pattern` + `tempo` alanıyla kalıbı çalar (Task 7 çalar).
- Produces: `dailyPlan(ctx)`: `ctx.techBest?: { [patternKey]: tempo }`; `hiz-metronom` bitmişse bitirilen hız
  derslerinden birinin ilk `tech` adımı, `start = best ? best − 8 : st.start`, `target = start + 12`.
- Dersler (spec tablosu): `hiz-metronom`, `hiz-artik`, `hiz-parmak`, `hiz-arpej`, `hiz-16lik`, `hiz-makam`, `hiz-etut`;
  her `tech` adımından önce `listen`. `hiz-etut`: `{ type:"piece", id:"e-hiz-hicaz", mode:"ladder", min:100 }`.
  Kalıp değerleri: 1) scale rast sub2 legato 60→80; scale base60 major sub2 legato 60→80. 2) scale rast sub2 legato 70→90;
  scale rast sub2 tongue 70→90. 3) groups base67 major sub4 legato 50→70; break [69,71] sub4 legato 60→80; break [70,72]
  sub4 legato 60→80. 4) arp base67 major sub2 60→84; arp base57 minor sub2 60→84; thirds makam rast sub2 60→80.
  5) scale rast sub4 legato 60→80; scale base55 major octaves2 sub4 legato 50→70. 6) scale ussak/hicaz/nihavend sub4 legato 70→90.
- `e-hiz-hicaz`: level 5, makam hicaz, meter [9,8], usul aksak, tempo 120, sekizlik ağırlıklı; mevcut etüt doğrulamasından geçer.
- Açılma: `unit === "hiz"` → ilk ders `base() && done("artikulasyon")`, diğerleri sıralı.

- [ ] **Step 1: Failing tests**

```js
const D = require('./lessons.js');
ok(D.LESSONS.length === 59 && D.LESSONS.filter(l => l.unit === 'hiz').map(l => l.id).join() === 'hiz-metronom,hiz-artik,hiz-parmak,hiz-arpej,hiz-16lik,hiz-makam,hiz-etut', 'hiz unitesi 7 ders');
ok(D.LESSONS.indexOf(D.lessonById('hiz-etut')) + 1 === D.LESSONS.indexOf(D.lessonById('sus-carpma')) && D.UNITS.map(u => u.id).join().includes('teknik,hiz,susleme'), 'hiz teknik ile susleme arasinda');
ok(D.stepTitle({ type:'tech', pattern:{ type:'scale', makam:'rast', sub:2, art:'legato' }, start:60, target:80 }) === 'Hız: Rast dizisi · sekizlik · ♩=60 → 80', 'tech basligi');
ok(D.stepOk({ type:'tech', target:80 }, { v:80 }) && !D.stepOk({ type:'tech', target:80 }, { v:76 }) && D.stepOk({ type:'piece', mode:'ladder', min:100 }, { v:100 }), 'gecme kosullari');
// kilit: temel+klarino+artikulasyon → hiz-metronom acik, hiz-artik kilitli (finishL kalibiyla)
// dailyPlan: hiz-metronom bitmis, techBest {'scale:rast::1:2:legato':84} → tech adimi start 76 target 88
```

Son iki yorumdaki testleri `testornament.js` `[32]`'deki `fin` kalıbıyla yaz. `test.js` adım döngüsüne:
`tech` → `techPattern(st.pattern) !== null && st.start >= 40 && st.target > st.start && st.target <= 220`;
`listen` + `pattern` → `techPattern(st.pattern) !== null && st.tempo >= 40`; `piece` modları `['tempo','free','ladder']`.
`stepNotes` `tech` ve `pattern`'li `listen` için kalıbın yazılı notalarını döndürür (aralık denetimi buna dayanır).

- [ ] **Step 2–4:** FAIL → yaz → PASS (52 → 59 ders). **Step 5: Commit + push** — `Hız ve teknik ünitesi: 7 ders ve tech adımı`.

---

### Task 7: Çalış çalıştırıcısı ve ders adımı

**Files:**
- Modify: `trainers.js` (`techRun`, `TRAINER_STEPS.tech`), `lessonview.js` (`listen`/`hear` için `pattern`, `resText`, `canHear`), `app.css`

**Interfaces:**
- Consumes: `SK.pcmCapture`, `ornamentTrack`, `runNotes`, `runPlayed`, `alignRun`, `runVerdict`, `TempoLadder`, `techPattern`, `drawScore` (pieces.js, global), `ctx.hit`, `ctxToPerf`.
- Produces: `techRun(ctx, spec, holder, { start, target, onRun(result), onDone(best) }) → { stop() }`
  - Kalıbı `drawScore` ile çizer. Her çalış: bir ölçü sayım + metronom (`ctx.hit`), `SK.pcmCapture()` sayımın son
    vuruşunda başlar, son beklenen notanın bitişinden 700 ms sonra durur; çalarken geçerli nota `cur` işaretli.
  - Çözümleme `setTimeout(0)` ile: beklenen zamanlar `ctxToPerf` + `rhythm.lat`; `runVerdict`; dizekte `ok/bad/miss`
    işaretleri (`markScore`); merdiven kaydı; ekranda tempo, en iyi, temiz/değil, ilk ipucu.
  - Sonraki çalış: "Sonraki: ♩=N" düğmesi; "otomatik devam" (`store tech.auto`) açıksa 2 sn sonra kendiliğinden.
  - Kayıt: `tech.best[patternKey]` = `[{ day, tempo }]` (gün başına en iyi, son 60 gün).
  - `rest` → "Biraz dinlen" ve dur; `done` → `onDone(best)`.
- Produces: `TRAINER_STEPS.tech(st, stage, done, ctx)` → `techRun(..., { start: st.start, target: st.target, onDone: best => done({ v: best }) })`.
- Produces: `lessonview` `listen`/`hear`: `st.pattern` varsa kalıbı `st.tempo`'da `SK.play` ile çalar (sekizlik vb. süreler).

- [ ] **Step 1:** Yaz (DOM; Node testi yok). `npm test` — PASS (derleme ve önbellek testleri).
- [ ] **Step 2: Tarayıcıda doğrula** (mikrofon panelde kapalı): `techRun`'ı sahte `SK.pcmCapture` ile çağır — `techAudio`
  benzeri bir sinüs dizisi döndürsün — sonuç satırı, dizek işaretleri, merdiven temposunun +4 artması; 375 px genişlikte
  taşma yok; konsol temiz. Ders listesinde "Hız ve teknik" ünitesi görünüyor, `listen` adımı kalıbı çalıyor.
- [ ] **Step 3: Commit + push** — `Hız: çalış çalıştırıcısı ve ders adımı`.

---

### Task 8: "Hız" sekmesi ve ilerleme

**Files:**
- Modify: `practice.js` (`TABS`, `GROUPS` tech, `BLURB`), `trainers.js` (`TRAINERS.hiz`), `drills.js` (`moreStats` → "Hız" satırı)

**Interfaces:**
- Consumes: `techRun`, `techPattern`, `patternKey`.
- Produces: sekme `hiz`: tür (dizi, gam, arpej, üçlü, parmak grubu, register geçişi), makam ya da ton + majör/minör,
  oktav, alt bölüm (sekizlik/triole/on altılık), bağlı/dille, başlangıç temposu (varsayılan: son en iyinin 8 altı,
  yoksa 60), otomatik devam kutusu; son 14 günün en iyi tempo çizgisi (basit SVG polyline). Seçimler `tech.opts`'ta.
- İlerleme: "Hız" satırı: en çok çalışılan 3 kalıbın en iyi temposu ve son 14 gündeki artışı.

- [ ] **Step 1:** Yaz. **Step 2:** `npm test` — PASS. **Step 3: Tarayıcıda doğrula:** `?view=practice&tab=hiz`; kalıp
  değişince dizek güncelleniyor; aralık dışı seçimde "Bu kalıp klarnetin aralığına sığmıyor" uyarısı ve Başla kapalı;
  İngilizce arayüzde Türkçe metin yok (makam/perde adları hariç); konsol temiz.
- [ ] **Step 4: Commit + push** — `Hız sekmesi ve ilerleme`.

---

### Task 9: Eserlerde merdiven

**Files:**
- Modify: `pieces.js` (`piecePlayer`: `startLadder`, düğme; `TRAINER_STEPS.piece` `mode:"ladder"`)

**Interfaces:**
- Consumes: `TempoLadder` (`{ max:120, stepFn: () => 5 }`), `pieceClean`, mevcut `startTempo(pct)`.
- Produces: `startTempo(pct, onResult)`: bitişte `onResult(res)` (mevcut `onDone` ile birlikte). `startLadder(target)`:
  %60'tan başlar, her çalış sonrası `pieceClean(res) ? "clean" : "dirty"`, kaydırıcıyı ve "%N" etiketini günceller,
  2 sn sonra sonraki çalış; `done` ya da `rest`'te durur; `onDone({ v: best, mode:"ladder" })`.
- Eserler sekmesinde "Merdiven" düğmesi (hedef %120).

- [ ] **Step 1:** Yaz. **Step 2:** `npm test` — PASS. **Step 3: Tarayıcıda doğrula:** merdiven düğmesi sayımı başlatıyor
  (mikrofon kapalıyken mevcut uyarı), konsol temiz. **Step 4: Commit + push** — `Eserlerde tempo merdiveni`.

---

### Task 10: Belgeler

**Files:**
- Modify: `README.md` (ders sayısı 59, ünite listesi, Hız sekmesi, `testtech.js`), `onboard.js` (52 → 59), `docs/BACKLOG.md`
  (tamamlandı bölümü; uzman doğrulamasına gamlar, arpejler, hedef tempolar ve `e-hiz-hicaz`; gerçek mikrofon denemesi),
  `testdata/README.md` (hızlı pasaj kayıtları: bağlı ve dille, sekizlik ve on altılık, metronom hoparlörden açıkken)

- [ ] **Step 1:** Yaz. **Step 2:** `npm test` — PASS. **Step 3: Commit + push** — `Hız ve teknik: belgeler`.
