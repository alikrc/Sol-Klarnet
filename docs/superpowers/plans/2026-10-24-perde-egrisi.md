# Perde eğrisi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kayıt sekmesine zaman–koma grafiği, nota başına kendiliğinden entonasyon işaretleri ve "en çok kaçan perdeler" özeti eklemek.

**Architecture:** Saf ölçüm (`cleanTrace`, `intonationIssues`, `intonationSummary`, `INTON`) `skills.js`'te, Node'da `testcurve.js` ile sınanır. `drills.js` `TRAINERS.rec` kayıt boyunca `raw` karelerini toplar, durdurunca bu fonksiyonlarla çözümler, tabloya "Not" sütunu, özet ve grafiği (canvas) ekler.

**Tech Stack:** Düz tarayıcı JS (`typeof module` korumalı), Canvas 2D, Node test (`npm test`).

**Spec:** `docs/superpowers/specs/2026-10-24-perde-egrisi-design.md`

## Global Constraints

- Bütün kullanıcı metinleri iki dilli: `L("Türkçe", "English")`.
- Saf mantık `skills.js`'te; tarayıcı yedek nesneleri (`SCORE`, `SLEARN`) kullanılan her adı içermeli.
- Eşikler: `INTON = { offKoma:1.5, driftKoma:1.5, scoopKoma:2, wobbleKoma:0.8, headMs:120, tailMs:80, minStableMs:150, minFrames:4, driftMinMs:400, spikeKoma:20 }`.
- Hata türleri `pes`, `tiz`, `kayma`, `titrek`; bilgi türleri `alttan`, `ustten`, `vibrato`, `disi`.
- Renkler: yerinde `--ok`, hatalı `--accent`, nötr `--muted`; yeni renk belirteci yok.
- Mevcut kayıt, tablo, paylaşma, "Notaları kopyala", "Eserlere ekle" davranışı değişmez.
- Commit sonrası hemen `git push`; commit sonu `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Doğrudan main.

## Review Focus

1. Tek karelik oktav sıçraması nota ortasında → işaret üretmemeli (Task 1 test 8 ve "spike nota içinde" testi).
2. Perde bulucunun bulamadığı ses (perde `null`, ör. 2,5 komadan uzak) → çökme yok, nota işaretsiz (Task 1 "perde yok" testi).
3. Hiç `raw` karesi gelmemiş ya da tek notalık kayıt → özet "ölçülmedi", grafik boş çizilir, hata yok (Task 1 "boş" testi, Task 3 tarayıcı denemesi).
4. Uzun kayıt (5 dk, ~10 000 kare) → çizim yalnızca görünür pencereyi dolaşır; `firstIndexAt` ikili araması testli (Task 1).
5. Bağlam ortada değişirse → kayıt durdurulduğu andaki bağlam kullanılır; çözüm `stopRec` içinde bir kez yapılır (Task 2).

---

### Task 1: Ölçüm fonksiyonları (`skills.js`)

**Files:**
- Modify: `skills.js` (yeni bölüm `// ---- Perde eğrisi ----` dışa aktarım listesinden önce; satır 5–6 yedek nesneler; satır 733 `module.exports`)
- Create: `testcurve.js`
- Modify: `test.js` (`require('./testtech.js').run(ok);` satırından sonra)

**Interfaces:**
- Consumes: `contextPerde(comma, ctx)` (core.js), `vibrato(frames)`, `mean`, `sd` (learn.js).
- Produces:
  - `INTON` (yukarıdaki nesne), `INTON_ERRORS = ["pes","tiz","kayma","titrek"]`
  - `cleanTrace(raw:[{t, comma|null}]) → [{t, comma|null}]`
  - `firstIndexAt(trace, t) → number` (t'den küçük olmayan ilk karenin indeksi; ikili arama)
  - `intonationIssues(notes:[{start,end,written,comma}], trace, opts={ctx:null}) → [{ i, written, perde:string|null, target:number|null, delta:number|null, inScale:boolean, drift:number|null, kinds:string[], short:boolean }]`
  - `intonationSummary(issues) → { total, measured, ok, perdes:[{ perde, written, n, mean, dir:"pes"|"tiz" }] }`

- [ ] **Step 1: Write the failing tests in `testcurve.js`**

`run(ok)` biçimi `testtech.js` gibi; bölüm başlığı `[45] Perde egrisi`. Yardımcı: `mk(start, dur, f)` 25 ms adımla `{ t, comma:f(t-start) }` kareleri üretir; `note(start, dur, w=67)` → `{ start, end:start+dur, written:w, comma:0 }`. Yazılı 67 = koma 0 = Rast.

```js
const I = (frames, notes, ctx = null) => S.intonationIssues(notes, S.cleanTrace(frames), { ctx });
// 1 hedefte
ok(I(mk(0, 800, () => 0), [note(0, 800)])[0].kinds.length === 0, 'hedefte nota: isaret yok');
// 2 tiz / pes
const t2 = I(mk(0, 800, () => 2), [note(0, 800)])[0];
ok(t2.kinds.join() === 'tiz' && Math.abs(t2.delta - 2) < 0.05, 'tiz +2', JSON.stringify(t2));
ok(I(mk(0, 800, () => -2), [note(0, 800)])[0].kinds.join() === 'pes', 'pes -2');
// 3 kayma (0 → +3, 800 ms)
const t3 = I(mk(0, 800, x => 3*x/800), [note(0, 800)])[0];
ok(t3.kinds.includes('kayma') && t3.drift > 1.5, 'kayan nota', JSON.stringify(t3));
// 4 alttan giris
const t4 = I(mk(0, 800, x => x < 120 ? -4 : 0), [note(0, 800)])[0];
ok(t4.kinds.join() === 'alttan', 'alttan giris bilgi isareti', JSON.stringify(t4));
// 5 vibrato 5,5 Hz ±0,8
const t5 = I(mk(0, 1500, x => 0.8*Math.sin(2*Math.PI*5.5*x/1000)), [note(0, 1500)])[0];
ok(t5.kinds.includes('vibrato') && !t5.kinds.includes('titrek'), 'vibrato titrek sayilmiyor', JSON.stringify(t5));
// 6 titrek: seed'li gürültü, sd ≈ 1,2
ok(I(mk(0, 1000, () => noise()*1.2), [note(0, 1000)])[0].kinds.includes('titrek'), 'titrek nota');
// 7 kisa
const t7 = I(mk(0, 200, () => 3), [note(0, 200)])[0];
ok(t7.short && t7.kinds.length === 0, 'kisa nota isaretsiz');
// 8 cleanTrace
const c8 = S.cleanTrace([...mk(0, 300, () => 0).map((f, i) => i === 6 ? { t:f.t, comma:53 } : f)]);
ok(c8.every(f => f.comma === null || Math.abs(f.comma) < 1), 'tek karelik oktav sicramasi atiliyor');
const c8b = S.cleanTrace([{ t:0, comma:0 }, { t:25, comma:0 }, { t:50, comma:null }, { t:75, comma:10 }, { t:100, comma:10 }]);
ok(c8b[3].comma === 10 && c8b[2].comma === null, 'sessizlik medyani boluyor');
// spike nota icinde: isaret yok
ok(I(mk(0, 800, x => Math.abs(x - 400) < 10 ? 53 : 0), [note(0, 800)])[0].kinds.length === 0, 'nota icindeki sicrama isaret uretmiyor');
// 9 ozet
// Uc perde: Rast (67, koma 0) iki kez -2, Dügâh (69, koma 9) iki kez +1.2, Segâh (71, koma 17) bir kez -3
//   → perdes: [Rast pes], Dügâh ortalama 1.2 > 1 → ikinci; Segâh tek kez → yok
// 10 Hicaz baglaminda Rast → disi
const hic = L.tuningCtx(L.makamById('hicaz'));
ok(I(mk(0, 800, () => 0), [note(0, 800)], hic)[0].kinds.includes('disi'), 'Hicaz baglaminda Rast dizi disi');
// 11 yanlis alarm: 6 notalik temiz ezgi, aralarda 60 ms gecis
// 12 perde yok: nearestPerde null olacak bir koma yok; bunun yerine trace bos → short:true, kinds:[]
ok(I([], [note(0, 800)])[0].short, 'karesiz nota olculmedi');
// 13 bos ozet
const e = S.intonationSummary([]); ok(e.total === 0 && e.measured === 0 && e.perdes.length === 0, 'bos ozet');
// 14 firstIndexAt
const tr = mk(0, 1000, () => 0); ok(S.firstIndexAt(tr, 510) === 21 && S.firstIndexAt(tr, -5) === 0 && S.firstIndexAt(tr, 5000) === tr.length, 'ikili arama');
```

9 ve 11 için kareleri ve notaları yukarıdaki yorumdaki gibi kur (yazılı 69 → koma 9, 71 → koma 17 için `perdeFreq` gerekmez; kareleri doğrudan hedef komaya göre üret). Assertions: 9 → `perdes.map(p => p.perde).join() === 'Rast,Dügâh'`, `perdes[0].dir === 'pes'`, `perdes[1].dir === 'tiz'`, `measured === 5`, `ok === 2`. 11 → `issues.every(x => x.kinds.filter(k => S.INTON_ERRORS.includes(k)).length === 0)`. `noise()` = seed'li LCG (testaudio'daki gibi) − 0,5'e göre ölçekli; sd'nin ≈ 1,2 olduğu doğrulansın.

`test.js`'e: `require('./testcurve.js').run(ok);`

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test 2>&1 | tail -5`
Expected: FAIL — `S.intonationIssues is not a function` (ya da `[45]` testleri başarısız).

- [ ] **Step 3: Implement in `skills.js`**

- Yedek nesnelere ekle: `SCORE` → `contextPerde`; `SLEARN` → `vibrato`.
- `cleanTrace`: önce `null`larla ayrılmış her bölümde, komşu 2+2 karenin medyanından `spikeKoma`'dan çok uzak kare atılır; sonra bölüm içinde 3'lü kayan medyan (bölüm kenarında pencere daralır). `null` kareler korunur.
- `intonationIssues`: her nota için `trace`'ten `[start, end]` içindeki `null` olmayan kareler (`firstIndexAt` ile). Kararlı bölüm `[start+headMs, end−tailMs]`; süre < `minStableMs` ya da kare < `minFrames` ise `short:true`. Medyan → `contextPerde(med, opts.ctx ?? null)`; `null` dönerse `short:true` say (perde yok). `delta`, `target = p.comma`, `perde = p.name`, `inScale = p.inScale !== false`. Türler tasarımdaki sırayla; `alttan/ustten` yalnızca |delta| ≤ `offKoma` iken; `vibrato()` sonuç verirse `titrek` denetlenmez; `titrek` eğilim (doğrusal regresyon) çıkarılmış `sd` ile; `disi` yalnızca `opts.ctx` varken.
- `intonationSummary`: `measured` = `!short`; `ok` = hata türü yok; perdeler `perde` adına göre gruplanır, `n ≥ 2` ve |ortalama delta| > 1, |ortalama|ya göre azalan, en çok 3; `written` grubun ilk notasının yazılısı.
- `module.exports`'a beş adı ve `INTON`, `INTON_ERRORS`, `firstIndexAt` ekle.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test 2>&1 | tail -5`
Expected: `TUM TESTLER GECTI`

- [ ] **Step 5: Commit and push**

```bash
git add skills.js testcurve.js test.js
git commit -m "Perde eğrisi: entonasyon ölçümü"
git push
```

---

### Task 2: Kayıt sekmesi — kare toplama, tablo sütunu, özet (`drills.js`)

**Files:**
- Modify: `drills.js:402-503` (`TRAINERS.rec`)
- Modify: `app.css` (`.rtable` yakınına `.inton` stilleri)

**Interfaces:**
- Consumes: Task 1'in `cleanTrace`, `intonationIssues`, `intonationSummary`, `INTON_ERRORS` (tarayıcıda global); `getTuningContext()` (core.js); `SK.showNote(w)`; `[data-goto]` tıklaması (app.js:878); `ctx.selectTab` (practice.js:469).
- Produces: `present(r, url)` (Step 4) içinde `an = { trace, issues, summary, ctx }`; Task 3 bunu grafiğe verir. Tabloda satır `id="rn<i>"` korunur; `seek(ms)` yardımcı fonksiyonu (audio varsa `currentTime` ayarlar ve çalar).

- [ ] **Step 1: Kare toplama**

`rec`'e `raw: []` ekle. Mevcut `SK.on("raw")` dinleyicisi `rec.raw.push({ t:d.t - rec.t0, comma:d.comma })` da yapsın; `SK.on("silence")` `rec.raw.push({ t:d.t - rec.t0, comma:null })`. Not: `SK.ignore` ile bastırılan sesler zaten `raw` olarak gelmez (app.js:803).

- [ ] **Step 2: Çözüm**

`stopRec`'te `notes` bulunduktan sonra: `const tctx = getTuningContext(); const trace = cleanTrace(r.raw); const issues = intonationIssues(notes, trace, { ctx:tctx }); const summary = intonationSummary(issues);`

- [ ] **Step 3: Tablo ve özet**

- Tabloya "Not" (`L("Not", "Note")`) sütunu: `issues[i].kinds` etiketleri `KIND_LABEL` sözlüğünden, ` · ` ile; hata türleri `<b>`, bilgi türleri `.muted`. Etiketler: pes `L("pes","flat")`, tiz `L("tiz","sharp")`, kayma `L("kayıyor","drifts")`, titrek `L("titrek","unsteady")`, alttan `L("alttan","from below")`, ustten `L("üstten","from above")`, vibrato `"vib."`, disi `L("dizi dışı","out of scale")`. Kısa notada `—`.
- `qcount` satırının altına özet: `L(`${measured} notadan ${ok}'i yerinde`, `${ok} of ${measured} notes on pitch`)`; kısa nota sayısı varsa `· N kısa nota ölçülmedi`. Hiç hata yoksa `L("Bütün notalar yerinde.", "All notes on pitch.")`. `measured === 0` ise `L("Ölçülecek kadar uzun nota yok.", "No notes long enough to measure.")`.
- "En çok kaçan perdeler" listesi (`summary.perdes`): `${perde} (${L("yazılı","written")} ${nn(written)}) · ${n} ${L("kez","times")} · ${L("ortalama","average")} ${num(|mean|,1)} ${L("koma","commas")} ${dir}` + ipucu + `<button class="stopbtn small" data-goto="tune" data-note="${written}">${L("Parmağa bak","See fingering")}</button>`. Butona tıklamada önce `SK.showNote(+data-note)` (kendi dinleyicin; `data-goto` gerisini yapar).
- İpuçları: pes → `L("Dudak baskısını biraz artır, ağızlığı biraz daha az al.", "Firm up the embouchure a little and take a bit less mouthpiece.")`; tiz → `L("Dudağı biraz gevşet, ağızlığı biraz daha çok al.", "Relax the embouchure a little and take a bit more mouthpiece.")`. Listenin altında, kayıtta `kayma` varsa `L("Kayan notalarda nefesi notanın sonuna kadar aynı tut.", "On drifting notes keep the air steady to the end.")`; `titrek` varsa `L("Titrek notalar için uzun ton çalış.", "Practise long tones for unsteady notes.")` + `selectTab("long")` çağıran bağlantı.
- Satıra tıklama: `seek(notes[i].start)`.

- [ ] **Step 4: Tarayıcıda dene**

Mikrofon panelde kapalı ve `SK` olay yayıcısını dışa açmıyor. Bu yüzden `stopRec`'in çözüm ve gösterim kısmını `present(r, url)` adlı fonksiyona ayır (`r = { frames, raw, glides, t0 }`, `frames`/`raw` mutlak `t` ile) ve `TRAINERS.rec` içinde `window.SKDEBUG = Object.assign(window.SKDEBUG || {}, { recPresent: present });` ile aç. `stopRec` MediaRecorder bitince `present(r, url)` çağırır; davranış aynı kalır.
`preview_start` ile uygulamayı aç; Çalış → Kayıt; `javascript_tool` ile sahte `frames` (`{t, written, comma}` + sessizlik `{t, written:null}`) ve `raw` üretip `SKDEBUG.recPresent({ frames, raw, glides:[], t0:0 }, null)` çağır.
Expected: tablo "Not" sütunu, özet satırı, perdeler listesi görünür; "Parmağa bak" Akort'u o notayla açar; konsolda hata yok.

- [ ] **Step 5: Run tests, commit and push**

Run: `npm test 2>&1 | tail -3` → `TUM TESTLER GECTI`

```bash
git add drills.js app.css
git commit -m "Perde eğrisi: kayıtta işaretler ve özet"
git push
```

---

### Task 3: Grafik (`drills.js`, `app.css`)

**Files:**
- Modify: `drills.js` (`TRAINERS.rec` içinde `drawCurve` ve olay dinleyicileri)
- Modify: `app.css` (`canvas.curve{height:200px; touch-action:pan-y}` ve `.curvebar`)

**Interfaces:**
- Consumes: Task 2'nin `an`, `notes`, `seek(ms)`; Task 1'in `firstIndexAt`, `INTON_ERRORS`; global `PERDES`.
- Produces: yok (son kullanıcı arayüzü).

- [ ] **Step 1: Yerleşim**

`finish()` içinde ses çaların altına: `<div class="curvebar"><button class="stopbtn small" id="rcall">Tümü</button><span class="muted small" id="rcwin"></span></div><canvas class="trace curve" id="rccurve"></canvas>`. `Tümü` metni `L("Tümü","All")`, basılıyken `L("8 sn","8 s")`.

- [ ] **Step 2: `drawCurve()`**

Durum: `view = { from:0, span:8000 }` (ms), `full` bayrağı; `dur = max(son nota sonu, son kare t)`. Akort izindeki (app.js:570-618) dpr, renk (`getComputedStyle`), sol etiket boşluğu (`LEFT = 92`) ve etiket çakışma kuralını kullan.
- Y aralığı: görünür penceredeki notaların `target` değerlerinin min/max ± 3, en az ±6 merkez çevresi; hiç not yoksa son görünür kare çevresi ±6.
- Perde çizgileri: bağlam varsa dizi perdeleri (`ctx.scale` mod 53 ile eşleşen PERDES) `--line` + ad, diğer PERDES `--line` %40 saydam, adsız. Bağlam yoksa hepsi Akort izindeki gibi.
- Nota şeritleri: `target` yüksekliğinde, 6 px kalın, nota rengi %25 saydam (`globalAlpha`).
- Eğri: kareler `firstIndexAt(trace, from)`'dan `from+span`'e kadar; her karenin rengi o andaki notaya göre (hatalı `--accent`, yerinde `--ok`, kısa ya da nota dışı `--muted`); renk değişiminde yeni path.
- Etiketler: hatalı notanın ilk hata türü + `num(|delta|,1)` (pes/tiz için), şeridin üstünde; bilgi türleri `--muted`. Önceki etiketin sağ kenarına binen atlanır.
- Alt eksen: her 1 sn (tamamda 5 ya da 10 sn) işaret ve `num(s)` yazısı.
- Çalma çizgisi: `playMs` varsa `--ink` 1,5 px dikey.

- [ ] **Step 3: Etkileşim**

- `pointerdown/move/up` ile sürükleme: dx > 8 px ise kaydırma (`from -= dx*span/plotW`, `[0, dur-span]` içinde tut), `manualUntil = now + 3000`. Sürüklenmeden bırakılırsa `seek(from + (x-LEFT)/plotW*span)`.
- `Tümü`: `full = !full`; `span = full ? max(dur, 1000) : 8000`, `from = full ? 0 : clamp(playMs - 2000)`.
- Çalma: `audio` `play`'de rAF döngüsü başlar, `pause/ended`'da durur; her karede `playMs = audio.currentTime*1000`; `!full && now > manualUntil` ve `playMs` pencere dışında ya da son %15'te ise `from = playMs - span*0.2`. Mevcut `timeupdate` satır vurgusu kalır.
- Tablo satırına tıklama: `from = clamp(start - 1000)` ve `seek(start)`.
- `resize` ile yeniden çizim; `leave()`'de rAF iptal.
- `#rcwin`: `num(from/1000)–num((from+span)/1000) sn`.

- [ ] **Step 4: Tarayıcıda dene**

`SKDEBUG.recPresent` ile 20 sn'lik, 3 pes Segâh ve bir kayan nota içeren sahte kayıt; ayrıca 5 dk'lık (12 000 kare) kayıt.
Expected: eğri, şeritler, etiketler çizilir; sürükleme pencereyi kaydırır; "Tümü" sığdırır; dokunuş `seek`'i doğru zamanla çağırır (`url` olarak sessiz bir WAV blob'u ver ve `audio.currentTime`'ı oku); 5 dk'lık kayıtta `drawCurve` < 16 ms (`performance.now()` ile ölç); dar ekranda (375 px) yatay taşma yok; koyu temada okunur. Konsolda hata yok. Ekran görüntüsü al.

- [ ] **Step 5: Run tests, commit and push**

Run: `npm test 2>&1 | tail -3` → `TUM TESTLER GECTI`

```bash
git add drills.js app.css
git commit -m "Perde eğrisi: kayıtta zaman–koma grafiği"
git push
```

---

### Task 4: Belgeler

**Files:**
- Modify: `docs/BACKLOG.md`, `README.md`

- [ ] **Step 1:** BACKLOG'a en üste "## Perde eğrisi — tamamlandı (24 Ekim 2026)" bölümü (grafik, işaretler, özet; gerçek mikrofonla denenmedi). "Sonraki adım fikirleri"nden "Hocanın öğrenciye ödev…" ve "Kayıt üzerinde perde eğrisi…" maddelerini çıkar. "Gerçek kayıtlar" maddesine `INTON` eşiklerinin gerçek kayıtlarla ayarlanması gerektiğini ekle.
- [ ] **Step 2:** README'de Kayıt sekmesi tanımına grafik ve kendiliğinden işaretleri ekle (`grep -n "Kayıt" README.md` ile yeri bul).
- [ ] **Step 3:** `npm test 2>&1 | tail -3` → `TUM TESTLER GECTI`; commit "Perde eğrisi: belgeler" ve push.
