# Nota çevirici Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eserler grubuna, PDF'ten, resimden ve sesten nota okuyup düzeltme ekranından esere kaydeden "Çevir" sekmesi
ve neyzen.com / projetsm.com'da arayan "Nota bul" eklemek.

**Architecture:** Saf mantık Node'da test edilen dosyalarda: sesten nota `skills.js`, not düzenleme işlemleri
`repertoire.js`, resimden nota yeni `omr.js` (kalıplar `omrtemplates.js`, tarayıcıda `omrworker.js` içinde), site
ayrıştırıcıları yeni `sources.js`. Arayüz yeni `convert.js` (`TRAINERS.convert`). PDF için `vendor/pdfjs/` altında
pdf.js, yalnızca PDF seçilince yüklenir. Ağ yalnızca Nota bul'da, yerel uygulamada `CapacitorHttp` ile.

**Tech Stack:** Düz tarayıcı JS (modülsüz, `<script>`), Capacitor 8, Node testleri (`npm test`), `sharp` ve
`opentype.js` (yalnızca geliştirme/test), `pdfjs-dist` (dosyaları depoya kopyalanır).

**Spec:** [docs/superpowers/specs/2026-10-24-nota-cevirici-design.md](../specs/2026-10-24-nota-cevirici-design.md)

## Global Constraints

- Yapay zekâ yok, bizim sunucumuz yok. Okuma telefonda yapılır; ses, resim ve dosyalar cihazdan çıkmaz.
- İnternete yalnızca Nota bul çıkar ve yalnızca arama sözcüğünü ve indirilecek dosyanın adresini gönderir. Nota bul
  dışındaki hiçbir özellik internet istemez.
- Bütün arayüz metinleri iki dilli: `L("…", "…")`. Kod yorumları Türkçe, çevredeki kodun yoğunluğunda.
- Yazılı aralık `LOW_NOTE`–`HIGH_NOTE` (Mi3–Mi♭7). Aralık dışı nota sessizce atılmaz; kaydı engeller.
- Kayıt yalnızca düzeltme ekranından yapılır. Emin olunmayan notalar (`conf < 0.6`) sarı, süresi tutmayan ölçüler
  turuncu, aralık dışı kırmızı.
- Uzun işler (okuma, ses çözümleme) arayüzü dondurmaz: resim Worker'da, ses parça parça (`await` ile ara verir);
  ilerleme gösterilir; sekmeden çıkınca iş iptal edilir.
- pdf.js yalnızca PDF seçilince `import()` ile yüklenir; açılış süresi değişmez.
- Dinleyerek yaz en çok 3 dakika. Ses 22 050 Hz tek kanala indirilir.
- `testdata/omr/*` depoya girmez (README hariç). Gerçek site sayfaları depoya kopyalanmaz; ayrıştırıcı testleri
  sentetik HTML ile.
- neyzen kaynağı `sources.js`'te tek ayarla kapatılabilir (`SOURCES.neyzen.enabled`).
- Her görevden sonra `npm test` geçer; commit edilir ve hemen push edilir. Commit mesajı Türkçe, "Nota çevirici: …"
  ile başlar, sonunda `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Yeni her tarayıcı dosyası üç yere eklenir: `index.html` `<script>`, `scripts/build-web.js` `FILES`, `sw.js`
  `SHELL` (ve `CACHE` sürümü bir artar). `test.js` bölüm [25] bunu denetler.

## Review Focus

1. **Nota olmayan ya da boş resim / PDF sayfası:** okuyucu çökmez, `flags` içinde "dizek bulunamadı" döner, ekran
   "resme bakarak yaz"a geçer. → Görev 6 testi `boş sayfa`.
2. **Sessiz ya da ezgisiz ses dosyası, 3 dakikadan uzun dosya:** "ezgi bulunamadı" iletisi; uzun dosyanın yalnızca
   ilk 3 dakikası okunur ve bu söylenir. → Görev 1 testi `sessiz kayit`, Görev 3 tarayıcı denetimi.
3. **Elle düzeltme yapılmışken tempo değiştirmek:** düzeltmeler sorulmadan kaybolmaz. → Görev 3 tarayıcı denetimi.
4. **Nota bul dizini çıkarılırken internetin kopması:** yarım dizin bozuk saklanmaz; o ana kadar okunan sayfalar
   tutulur, sonraki aramada eksikler tamamlanır. → Görev 9 testi `yarim dizin`.
5. **Okuma sürerken sekmeden çıkmak ya da yeni dosya seçmek:** eski işin sonucu ekrana yazılmaz. → Görev 3 ve 7'de
   iş belirteci (`jobId`) denetimi.

---

## Aşama 1: Düzeltme ekranı ve ses

### Görev 1: Sesten ölçülü notalar (`skills.js`)

**Files:**
- Modify: `skills.js` (yeni fonksiyonlar `runNotes`'un yanına; `module.exports`'a eklenir)
- Create: `testconvert.js` (`run(ok)`; `test.js` sonunda `require('./testconvert.js').run(ok)`)
- Modify: `test.js` (çağrı)

**Interfaces:**
- Consumes: `ornamentTrack(pcm, sr, opts)`, `runNotes(track)` → `[{ t, end, comma }]`, `SCORE.contextPerde(comma, ctx)`,
  `SCORE.nearestPerde(comma)`, `SLEARN.tuningCtx(mk, mode)`, `SLEARN.makamById(id)`.
- Produces:
  - `audioNotes(pcm, sr, { T }) → [{ t, end, comma }]` — `ornamentTrack(pcm, sr, { T, hopMs:10, expectHz:300 })` →
    `runNotes`.
  - `tuningOffset(notes) → number` — en yakın AEU perdesinden sapmaların ortancası, ±26 koma ile sınırlı; 3'ten az
    nota varsa 0.
  - `quantizeRun(notes, opts) → { notes:[{ w, c, d, rest, conf }], tempo, meter:[4,4], offset }` —
    `opts: { tempo?, makam?, mode?:"aeu"|"icra", offset? }`.

- [ ] **Step 1: Testleri yaz (`testconvert.js`, bölüm `[44] Sesten nota`)**

`A.techAudio(notes, tempo, { seed, T:5 })` ile sentetik ses; `S.audioNotes(a.pcm, a.srate, { T:5 })` → `S.quantizeRun`.

```js
// Rast dizisi sekizlik ♩=90 → tempo ±%5, 15 nota, hepsi d=0.5, perdeler dizideki komalar
const q = S.quantizeRun(S.audioNotes(a.pcm, a.srate, { T:5 }), { makam:'rast' });
ok(Math.abs(q.tempo - 90) <= 4.5 && q.notes.filter(n => !n.rest).length === 15, 'tempo ve nota sayisi', ...);
ok(q.notes.filter(n => !n.rest).every(n => n.d === 0.5), 'sekizlikler');
ok(q.notes.filter(n => !n.rest).map(n => n.c).join() === '0,9,17,22,31,40,48,53,44,40,31,22,17,9,0', 'perdeler');
```

Ayrıca: noktalı ritim (`d` 0.75/0.25 dizisi) → aynı süreler; üçleme (`d` 1/3) → ızgara üçlü seçer; bir notanın
ortasında 1 vuruşluk sus → `rest:true, d:1`; 30 ms'lik süs notası (`segs` ile `ornamentAudio`) bir sonraki notaya
katılır; `opts.tempo:60` verilince tempo tahmin edilmez ve süreler ona göre; her notası +3 koma kaydırılmış ezgi
(`A.ornamentAudio` segmentlerinde `comma: n.c + 3`) → `tuningOffset` ≈ 3 (±0,7) ve `quantizeRun` perdeleri doğru; **`sessiz kayit`**: sıfırlardan oluşan
pcm → `audioNotes` boş, `quantizeRun([])` → `{ notes:[] }` çökmez.

- [ ] **Step 2: `npm test` — yeni testler FAIL ("quantizeRun is not a function")**

- [ ] **Step 3: Fonksiyonları yaz**

Tempo seçimi: aday vuruş süreleri 300–1200 ms, 5 ms adımla. Her aday için nota başlarının ilk notaya göre
`b/4` ve `b/3` ızgaralarına en yakın uzaklıklarının (vuruş oranı olarak) karelerinin ortalaması; iki ızgaradan
küçük olanı alınır; 60–120 vuruş/dk dışına 1,15 çarpanı ceza. En küçük maliyetli aday. Süre = sonraki başa kadarki
aralık ızgaraya yuvarlanır (son nota kendi `end`'ine göre); yarım vuruştan uzun boşluk ayrı sus; `b/8`'den kısa nota
sonrakine katılır. Perde: `offset` çıkarıldıktan sonra makam varsa `contextPerde(c, tuningCtx(mk, mode))`, yoksa
`nearestPerde` 1,5 koma içindeyse onun koması, değilse `c:null` ve `w` en yakın yarım ses. `w = round(67 + c*12/53)`.
`conf` = min(1, 1 − |perde sapması|/3) × min(1, 1 − ızgara uzaklığı×2).

- [ ] **Step 4: `npm test` — hepsi PASS**

- [ ] **Step 5: Commit ve push** — `Nota çevirici: sesten ölçülü notalar`

### Görev 2: Not düzenleme işlemleri (`repertoire.js`)

**Files:**
- Modify: `repertoire.js` (yeni bölüm `// ---- Düzeltme ----`, `module.exports`'a eklenir)
- Modify: `testconvert.js` (bölüm `[45] Duzeltme islemleri`)

**Interfaces:**
- Consumes: `turkishAccidental(c, w)`, `NAT_COMMA`, `LETTER_OF_PC`, `NAT_PC` (aynı dosyada), `concertToWritten`.
- Produces (hepsi yeni dizi/nesne döndürür, girdiyi değiştirmez; not biçimi `{ w, c, d, rest, conf?, box?, orn? }`):
  - `naturalOf(n) → { w, c }` — notanın harfinin doğal hali.
  - `stepNote(n, dir:+1|-1) → n'` — bir dizek basamağı; değiştirici sıfırlanır (doğal).
  - `withAccidental(n, { k, unit:"koma"|"semitone" }) → n'` — `naturalOf(n)`'e k ekler: koma biriminde
    `c` = doğal + k, `w = round(67 + c*12/53)`; yarım ses biriminde `w` = doğal + k, `c` en yakın perde ya da null.
  - `ACC_CYCLE = { koma:[0,5,-4,1,4,8,-1,-5,-8], semitone:[0,1,-1] }` — değiştirici düğmesinin döngüsü.
  - `scaleDur(n, f) → n'` (f = 0.5 ya da 2), `toggleDot(n) → n'` (d×1.5 ya da ÷1.5), `toRest(n) → n'`.
  - `mergeNext(notes, i) → notes'` — aynı perdeyse süreler toplanır, değilse değişmez.
  - `barCheck(notes, meter) → [{ from, to, sum, ok }]` — ölçü uzunluğu `meter[0]*4/meter[1]` dörtlük; ilk ölçü
    eksikse (anacrusis) `ok:true`.
  - `meterFromBars(bars:[number]) → [n, d]` — ölçü toplamlarının en sık değeri (dörtlük): 2→[2,4], 4→[4,4],
    4.5→[9,8], 3→[3,4], 2.5→[5,8], 5→[10,8], diğerleri → [round(x*2), 8].
  - `expandRepeats(notes, marks) → notes'` — `marks: [{ i, kind:"repStart"|"repEnd"|"segno"|"toSegno"|"sectionEnd" }]`
    (`i`: işaretten sonraki notanın sırası). ‖: :‖ arası iki kez; `toSegno` → son `segno`'ya dön, o bölümden sonraki
    ilk `repEnd`/`sectionEnd`'e kadar çal (tekrar ikinci kez açılmaz). İç içe değil.
  - `rangeIssues(notes) → [i]`, `shiftOctave(notes, idxs, dir) → notes'` (±12 yarım ses, ±53 koma).
  - `transposeAll(notes, steps, unit:"perde"|"semitone") → notes'` — perde: dizideki komşu AEU perdesine
    (`PERDES` sırası), yarım ses: w±1 ve en yakın perde.

- [ ] **Step 1: Testleri yaz**

```js
const n = R.parseScoreText('Segâh').notes[0];                          // Si koma bemol
ok(R.naturalOf(n).w === 71 && R.stepNote(n, 1).w === 72 && R.stepNote(n, 1).c === 22, 'basamak: Si → Do (Çargâh), isaret sifirlanir');
ok(R.withAccidental(R.naturalOf(n), { k:-1, unit:'koma' }).c === n.c, 'Si + koma bemol = Segâh');
ok(R.withAccidental(R.parseScoreText('Fa4').notes[0], { k:1, unit:'semitone' }).w === 66, 'konser: Fa♯');
ok(R.meterFromBars([2,2,2,1.5]).join() === '2,4' && R.meterFromBars([4.5,4.5]).join() === '9,8', 'olcu');
```

Ayrıca: `barCheck` 2/4'te 2,5 dörtlüklük ölçü `ok:false`, ilk ölçü 0,5 `ok:true`; `expandRepeats` Hicâz Longa düzeni
(A ‖: B :‖ segno C D toSegno) → A B B C D C … dizisi beklenen sırada (küçük harf etiketli notalarla); `mergeNext` aynı
perdede d toplanır, farklıda değişmez; `rangeIssues` Re3'ü bulur, `shiftOctave` düzeltir; `transposeAll` Rast
dizisini bir perde yukarı → Dügâh'tan başlar; girdiler değişmeden kalır.

- [ ] **Step 2: `npm test` — FAIL**
- [ ] **Step 3: Fonksiyonları yaz**
- [ ] **Step 4: `npm test` — PASS**
- [ ] **Step 5: Commit ve push** — `Nota çevirici: düzeltme işlemleri`

### Görev 3: "Çevir" sekmesi: düzeltme ekranı, ses dosyası, dinleyerek yaz

**Files:**
- Create: `convert.js` (`TRAINERS.convert = function(ctx){ … }`, `pieces.js` kalıbında)
- Modify: `practice.js` (`TABS`'a `["convert", L("Çevir", "Convert")]`, `GROUPS` pieces → `["piece","convert","rec"]`,
  `BLURB.convert`, `HELP.convert`)
- Modify: `pieces.js` (`SK.addPiece(name, ws)` yanına `SK.addPieceFull(piece)`: `addUser` + `fillSel` + sekmeyi açar;
  eser `source`'u saklanır ve `pcmeta`'da "Kaynak: …" bağlantısı olarak görünür)
- Modify: `app.js` (`pcmCapture(maxSec = 30)`)
- Modify: `drills.js` (Kayıt "Eserlere ekle": kaydın pcm'i `audioNotes` → `quantizeRun` → `SK.openConvert({ notes,
  tempo, meter, name })`)
- Modify: `index.html`, `scripts/build-web.js`, `sw.js`, `app.css`, `i18n.js` (gerekirse)
- Modify: `test.js` (`tabs.length === 14` → `15`)

**Interfaces:**
- Consumes: Görev 1 (`audioNotes`, `quantizeRun`, `tuningOffset`), Görev 2 (bütün düzeltme işlemleri),
  `parseScoreText`, `scoreToText`, `concertToWritten`, `drawScore(holder, notes, { meter, names })`, `SK.T`,
  `SK.pcmCapture(maxSec)`, `ctx.store`.
- Produces:
  - `SK.openConvert(job)` — `job: { notes, tempo?, meter?, name?, makam?, kind:"audio"|"image", turkish?, pages?:
    [{ url, width, height }], marks?, flags?, source? }`. Çevir sekmesini açar ve düzeltme ekranını doldurur. Görev 7,
    8 ve 10 bunu çağırır.
  - Düzeltme ekranı durumu `state = { notes, marks, meter, tempo, makam, turkish, expand:true, sel, dirty, jobId }`.

- [ ] **Step 1: `test.js`'te sekme sayısını 15 yap, `npm test` — FAIL ("Nasil kullanilir" ve SW/paket denetimi)**

- [ ] **Step 2: Sekmeyi ve iskeleti yaz**

Üstten aşağı: Nota bul yeri (Görev 10'a kadar boş), giriş düğmeleri ("PDF ya da resim seç" — Görev 7'ye kadar gizli,
"Ses dosyası seç" `accept="audio/*"`, "Dinleyerek yaz"/"Durdur"), ilerleme satırı, düzeltme ekranı. Düzeltme ekranı:
üst satır (nota türü seçimi — ses işlerinde gizli, makam, tempo, ölçü, "Tekrarları aç"), kaynak görünümü (Görev 7),
çip şeridi (ölçü ayraçlı; sınıflar `unsure`, `badbar`, `outrange`, `sel`), seçili nota düğmeleri (▲ ▼, değiştirici
döngüsü `ACC_CYCLE`, ½×, 2×, nokta, sus, sil, önüne ekle, sonrakiyle birleştir, oktav ▲▼), "Hepsini aktar" (perde/yarım
ses ▲▼), metin görünümü (`scoreToText`; `input`'ta `parseScoreText`, hatalı token kırmızı ileti, çipler güncellenir),
dizek önizlemesi (`drawScore`), Dinle, ad alanı, Kaydet.

- [ ] **Step 3: Ses girişleri**

Dosya: `arrayBuffer` → `AudioContext.decodeAudioData` → kanalların ortalaması → `OfflineAudioContext(1, n, 22050)` ile
yeniden örnekleme; 180 sn'den uzunsa kesilir ve "ilk 3 dakika okundu" denir. Dinleyerek yaz: `SK.pcmCapture(180)`,
hoparlör modu ayarı açıkken; durdurunca aynı yol. Çözümleme `audioNotes`'u 30 sn'lik parçalarla, aralarında
`await sleep(0)` ile çalıştırır (parçalar 50 ms örtüşür, sınırdaki notalar birleştirilir). `tuningOffset` →
`quantizeRun({ makam, offset })`; offset ≠ 0 ise "kayıt 3 koma pes akortlu" bilgisi. Boşsa "ezgi bulunamadı". Her işe
artan `jobId`; sonuç gelince `jobId` eskiyse yazılmaz; `leave()` işi iptal eder.

- [ ] **Step 4: Davranış kuralları**

Tempo değişince ses işinde yeniden `quantizeRun`; `state.dirty` ise önce `confirm(L("Elle yaptığın düzeltmeler
silinecek. Devam edilsin mi?", …))`. Kaydet: konser notasında önce `concertToWritten(notes, SK.T)`; sonra
`rangeIssues` boş değilse kayıt yok, "taşanları bir oktav kaydır" / "hepsini bir oktav kaydır" düğmeleri; boşsa
`expand` açıksa `expandRepeats`, `SK.addPieceFull({ name, notes, tempo, meter, makam, source })` ve "Etüt ve
eserler" o eserle açılır. Düzeltilmemiş iş oturum boyunca (`sessionStorage` değil, modül değişkeni) sekmeye dönünce
yerinde durur.

- [ ] **Step 5: `HELP.convert` ve `BLURB.convert`**

HELP içeriği (iki dilli): PDF en iyi sonucu verir; resmi düz ve tam çek, kırp; YouTube'u başka cihazda ya da
hoparlörde aç, telefonu yaklaştır, "Dinleyerek yaz"; okunanı mutlaka Dinle ile kontrol et; sarı = emin değil,
turuncu = ölçü tutmuyor, kırmızı = klarnet aralığı dışı. BLURB: "PDF, resim ya da sesten esere".

- [ ] **Step 6: Dosyayı üç listeye ekle; `npm test` — PASS**

- [ ] **Step 7: Tarayıcıda dene** (`preview_start`, telefon boyutu ve İngilizce)

Sentetik bir ses dosyası (`techAudio` çıktısını WAV'a yazan küçük betikle scratchpad'e) seç → ilerleme, çipler,
tempo; her düzeltme düğmesi; metin ↔ çip eşleşmesi; düzeltmeden sonra tempo değiştirince onay sorusu; aralık dışı
nota → kayıt engelli, kaydır düğmeleri; kaydet → "Etüt ve eserler"de açılıyor; Kayıt sekmesinden "Eserlere ekle"
(`SKDEBUG.recPresent` ile) Çevir'i açıyor; okuma sürerken başka dosya seçmek eski sonucu yazmıyor. Konsolda hata yok.

- [ ] **Step 8: Commit ve push** — `Nota çevirici: Çevir sekmesi, ses dosyası ve dinleyerek yaz`

## Aşama 2: Resim okuyucu

### Görev 4: Sentetik nota sayfaları ve yazı tipleri (yalnızca test)

**Files:**
- Create: `testdata/fonts/Bravura.otf`, `testdata/fonts/Leland.otf`, `testdata/fonts/OFL.txt` (Bravura:
  github.com/steinbergmedia/bravura, Leland: github.com/MuseScoreFonts/Leland; ikisi de SIL OFL — depoya girer)
- Create: `testomrsynth.js`
- Modify: `package.json` (`devDependencies`: `opentype.js@1.3.4`)

**Interfaces:**
- Produces: `renderPage(spec) → Promise<{ data:Uint8Array, width, height, truth }>`.
  `spec: { notes:[{ w, c, d, rest }], marks?, key?:[{ letter, k }], meter:[n,d], font:"bravura"|"leland",
  sp:14, perLine:8 (ölçü), title?:true, degrade?:{ blur?:px, noise?:0–1, rotate?:deg, scale?:oran } }`.
  `truth` = `spec.notes` (tekrarlar açılmadan) ve her notanın kutusu. SMuFL kod noktaları: nota başları U+E0A2
  (birlik), U+E0A3 (ikilik), U+E0A4 (dolu); suslar U+E4E3–E4E7; Sol anahtarı U+E050; ♯ U+E262, ♭ U+E260, ♮ U+E261;
  AEU U+E440–E447 (`accidentalBuyukMucennebFlat` … `accidentalBuyukMucennebSharp`); segno U+E047; ölçü tekrarı U+E500;
  rakamlar U+E080–E089. Kirişler, saplar, dizek ve ölçü çizgileri dikdörtgen/çokgen olarak çizilir; bağ yayı ikinci
  dereceden Bezier. SVG → `sharp(...).greyscale().raw()`.

- [ ] **Step 1: `testomrsynth.js`'i yaz; iki sayfa üret ve scratchpad'e PNG olarak kaydedip bak** (gözle: dizek,
  kirişli on altılıklar, noktalı, AEU işaretleri, bağ, segno doğru yerde)
- [ ] **Step 2: Commit ve push** — `Nota çevirici: test için sentetik nota sayfaları`

### Görev 5: Dizek bulma, çizgi silme ve simge kalıpları (`omr.js`, `omrtemplates.js`)

**Files:**
- Create: `omr.js` (tarayıcıda global, Node'da `module.exports`; `skills.js` başlığındaki `typeof module` kalıbı)
- Create: `scripts/omr-templates.js` (`npm run omr-templates`), çıktısı `omrtemplates.js`
  (`const OMR_TEMPLATES = { size:[w,h] her sınıf için, classes:{ <ad>:[Uint8 bitmap base64, …] } }`)
- Create: `testomr.js` (`run(ok)` async; `test.js` sonunda `await require('./testomr.js').run(ok)`)

**Interfaces:**
- Produces:
  - `binarize(img, method:"otsu"|"sauvola"|"auto") → { bits:Uint8Array, width, height }`
  - `deskew(bin) → { bin, angle }` (±5°, 0,25° adım)
  - `findStaves(bin) → { sp, line, staves:[{ y:[5 sayı], x0, x1 }] }`
  - `removeStaffLines(bin, staves) → bin'`
  - `components(bin) → [{ x, y, w, h, area, pixels? }]`
  - `classify(comp, bin, sp) → { cls, conf }` — sınıflar: `head_black`, `head_half`, `head_whole`, `rest_1`,
    `rest_2`, `rest_4`, `rest_8`, `rest_16`, `clef_g`, `sharp`, `flat`, `natural`, `aeu_koma_sharp`,
    `aeu_bakiye_sharp`, `aeu_buyuk_sharp`, `aeu_koma_flat`, `aeu_kucuk_flat`, `aeu_buyuk_flat`, `segno`,
    `measure_repeat`, `dot`, `digit_0`…`digit_9`, `other`. (AEU'da küçük mücenneb diyez = `sharp`, bakiye bemol =
    `flat` çizimiyle aynıdır.)
  - Şablon betiği: yazı tiplerinden her sınıfı `sp` = 14'te çizip `size`'a normalleştirir; `testdata/omr/`'da örnek
    varsa `omr.js` ile bulunan bileşenleri sınıflarına göre `scratchpad`'e PNG olarak döker, `--accept <dosya>`
    listesindekileri kalıplara ekler.

- [ ] **Step 1: Testleri yaz (`[46] OMR: dizek ve simgeler`)**: sentetik sayfada `findStaves` 8 dizek, `sp` 14 ±0,5;
  `rotate:2` ile `deskew` açısı 2 ±0,3; `scale:0.6` ile `sp` 8,4 ±0,5; çizgi silindikten sonra nota başı bileşen
  sayısı nota sayısına eşit (kirişsiz sayfa); her sınıf için Bravura ve Leland çizimlerinin `classify`'da kendi
  sınıfına düşmesi ≥ %95; boş beyaz sayfa → `staves:[]`.
- [ ] **Step 2: `npm test` — FAIL**
- [ ] **Step 3: Yaz.** Sınıflama: bileşen sınırlayıcı kutusu `size`'a ölçeklenir, kalıplarla Jaccard benzerliği;
  en iyi eşleşmenin skoru `conf`; nota başları saplara bitişik olduğundan önce dikey koşu ≥ 2,5 `sp` olan saplar
  ayrılır, kalan leke nota başı adayıdır (dolu baş için `sp`×`sp` penceresinde doluluk ≥ 0,7 ile kayan pencere).
- [ ] **Step 4: `npm test` — PASS**
- [ ] **Step 5: Commit ve push** — `Nota çevirici: dizek bulma ve simge kalıpları`

### Görev 6: Notaya çevirme (`omr.js`)

**Files:**
- Modify: `omr.js`, `testomr.js`
- Create (yerel, depoya girmez): `testdata/omr/hicaz_longa_aydin_oran_kemani_nafiz.txt` — sayfadaki notalar elle,
  nota metniyle, tekrarlar açılmadan; ölçü çizgileri `|`, işaretler ayrı satırda yorum olarak.

**Interfaces:**
- Consumes: Görev 5, Görev 2 (`meterFromBars`, `barCheck`), `turkishAccidental` tersi için `NAT_COMMA`.
- Produces: `readPage(img, opts) → { notes, marks, bars, meter, flags, sp, turkish, keySig }` ve
  `readPages(imgs, opts, onProgress) → aynı biçim, sayfalar birleşik, box.page dolu`. `notes[i].box = { page, x, y,
  w, h }` (özgün resim pikseli), `conf` ∈ [0,1]. `flags`: `"nostaff"`, `"lowres"` (sp < 8), `"pianoLowerSkipped"`,
  `"repeat"`. `marks` Görev 2 biçiminde.

- [ ] **Step 1: Testleri yaz (`[47] OMR: notalar`)**

Yardımcı `scoreMatch(read, truth) → oran` (w ve d çiftleri üzerinde düzenleme uzaklığı hizalaması; 1 − hata/uzunluk).
Sentetik: Bravura ve Leland temiz sayfa ≥ 0,98; `blur:1, noise:0.05, rotate:2, scale:0.6` ≥ 0,90; donanım (Hicaz:
Si koma bemol, Do♯, Fa♯) ölçü boyunca uygulanıyor ve ölçü içi ♮ yalnızca o ölçüde; 8 AEU işaretinin her biri doğru
komaya (`c` = doğal + k); noktalı sekizlik + on altılık; uzatma bağı birleşiyor, farklı perdeli yay birleştirmiyor;
`%` önceki ölçüyü kopyalıyor; ‖: :‖, segno → `marks`; iki dizekli sistem → üst dizek, `pianoLowerSkipped`;
`meter` 2/4; bir ölçüsü eksik sayfa → `bars[k].ok === false`; **`boş sayfa`** → `notes:[]`, `flags` `nostaff`.
Gerçek örnek varsa: `testdata/omr/*.pdf|png|jpg|gif` için yanında `.txt` olanlar okunur, oran yazdırılır; Hicâz Longa
için ≥ 0,95 ve `keySig` doğru (bu iki denetim yalnızca dosya varsa koşar). PDF örneği bu görevde `scripts/` altında
Node'da pdf.js ile değil, gömülü JPEG'i çıkararak okunur (yardımcı `extractPdfJpeg(buf)` testomr.js içinde).

- [ ] **Step 2: `npm test` — FAIL**
- [ ] **Step 3: Yaz.** Sıra: dizekler → sistemler (dizek yüksekliğini aşan ölçü çizgisiyle bağlı dizekler) →
  her dizekte soldan sağa simgeler → anahtar ve donanım (anahtardan sonra, ilk nota başından önceki değiştiriciler)
  → ölçüler → nota başının basamağı (`(y_alt_çizgi − y)/(sp/2)`, alt çizgi Mi4) → değiştirici (başın solunda
  1,5 `sp` içinde) → süre (baş türü, sapa bağlı kiriş/bayrak sayısı, sağda nokta) → bağlar → işaretler. `turkish` =
  donanımda ya da notalarda AEU sınıfı var. Gerçek örnekte tutmayan sınıflar için `npm run omr-templates` ile örnekten
  kalıp eklenir.
- [ ] **Step 4: `npm test` — PASS (Hicâz Longa oranı çıktıda)**
- [ ] **Step 5: Commit ve push** — `Nota çevirici: resimden notalar`

### Görev 7: Worker, resim girişi, kaynak görünümü, resme bakarak yaz

**Files:**
- Create: `omrworker.js` (`importScripts("core.js","learn.js","repertoire.js","omrtemplates.js","omr.js")`;
  ileti `{ jobId, pages:[{ data, width, height }] }` → `{ jobId, progress }` … `{ jobId, result }` ya da `{ jobId, error }`)
- Modify: `convert.js`, `app.css`, `index.html`/`build-web.js`/`sw.js` (yeni dosyalar)

**Interfaces:**
- Consumes: Görev 6 `readPages`, Görev 3 `SK.openConvert(job)`.
- Produces: `imagesToPages(files) → Promise<[{ data, width, height, url }]>` (canvas ile gri ton; `url` küçültülmüş
  önizleme `objectURL`; en uzun kenar 3000 px'e sınırlanır). Görev 8 ve 10 bunu kullanır.

- [ ] **Step 1:** "PDF ya da resim seç" düğmesi (`accept="image/*,application/pdf"`, `multiple`); resimler seçim
  sırasıyla tek iş; Worker'a gönder, ilerleme; sonuç → `SK.openConvert({ kind:"image", pages, notes, marks, meter,
  turkish, flags, name: dosya adından })`. Ad önerisi: uzantı ve `_` atılır, ilk iki sözcük büyük harfle
  (`hicaz_longa_aydin…` → "Hicaz Longa").
- [ ] **Step 2:** Kaynak görünümü: sayfa resimleri dikey, iki parmakla yakınlaşma (`touch-action` + CSS `transform`),
  kutular mutlak konumlu, çiplerle aynı renk sınıfları; kutuya dokun → çip seçilir; çip seç → kutuya kaydır.
- [ ] **Step 3:** Resme bakarak yaz: `flags` `nostaff` ya da ortalama `conf < 0.5` ise sonuç atılır, ekran boş şeritle
  ve "Okuyamadım, notaları resme bakarak ekle" iletisiyle açılır. Ekleme düğmesi: son eklenen notanın bir basamak
  yukarısı/aşağısı ve süre düğmeleriyle yeni nota (`stepNote`, `scaleDur`).
- [ ] **Step 4:** `flags` iletileri: `lowres` "Resim küçük, okuma zayıf olabilir"; `pianoLowerSkipped`; `repeat`
  "Tekrarlar bulundu, 'Tekrarları aç' açık".
- [ ] **Step 5: `npm test` — PASS; tarayıcıda dene:** sentetik sayfa PNG'si ve `testdata/omr/` örneğinin
  çıkarılmış JPEG'i ile okuma, kutu–çip eşleşmesi, yakınlaşma, telefon boyutu; düz beyaz resimde resme bakarak yaz;
  okuma sürerken sekmeden çıkınca Worker işinin sonucu yazılmıyor. Konsolda hata yok.
- [ ] **Step 6: Commit ve push** — `Nota çevirici: resimden okuma ve kaynak görünümü`

## Aşama 3: PDF

### Görev 8: pdf.js ile PDF okuma

**Files:**
- Modify: `package.json` (`devDependencies`: `pdfjs-dist@4.10.38`; script `"vendor": "node scripts/vendor.js"`)
- Create: `scripts/vendor.js` (`node_modules/pdfjs-dist/legacy/build/pdf.min.mjs` ve `pdf.worker.min.mjs` →
  `vendor/pdfjs/`, `LICENSE` ile)
- Create: `vendor/pdfjs/*` (depoya girer)
- Modify: `scripts/build-web.js` (`DIRS` + `"vendor"`), `sw.js` (`SHELL` + iki dosya), `convert.js`, `README.md`
  (kaynaklar: pdf.js, Apache 2.0)

**Interfaces:**
- Produces: `pdfToPages(file, range?:[from,to]) → Promise<[{ data, width, height, url }]>` — sayfa genişliği 2480 px
  olacak ölçekte çizer (A4, 300 dpi); şifreli (boş parolalı) PDF açılır; parolalı PDF "Bu PDF parolalı" iletisi.

- [ ] **Step 1:** `npm run vendor`; `test.js` [25]'e `vendor/pdfjs/pdf.min.mjs` ve worker'ın `SHELL`'de ve pakette
  olduğu denetimini ekle; `npm test` — FAIL, sonra listeleri güncelle — PASS.
- [ ] **Step 2:** `pdfToPages`: `const pdfjs = await import("./vendor/pdfjs/pdf.min.mjs")`,
  `GlobalWorkerOptions.workerSrc`; 1'den çok sayfa varsa sayfa aralığı sorusu (iki sayı alanı, varsayılan hepsi);
  sonra Görev 7'nin Worker yolu.
- [ ] **Step 3: Tarayıcıda dene:** Hicâz Longa PDF'i (`testdata/omr/`) okunuyor, şifre sorunu yok. Sayfa aralığı
  sorusu, tarayıcı panelinde birkaç sayfalı herhangi bir sayfayı "PDF olarak kaydet" ile üretilmiş bir PDF'le
  denenir. Uygulama açılırken `pdf.min.mjs`'nin istenmediği ağ isteklerinde görülür.
- [ ] **Step 4: Commit ve push** — `Nota çevirici: PDF okuma`

## Aşama 4: Nota bul

### Görev 9: Kaynak ayrıştırıcıları ve dizin (`sources.js`)

**Files:**
- Create: `sources.js` (saf; ağ çağırmaz, `fetchText`/`fetchBinary` dışarıdan verilir)
- Create: `testsources.js` (`run(ok)`, sentetik HTML; `test.js`'ten çağrılır)

**Interfaces:**
- Consumes: `MAKAMS` (`learn.js`) — makam eşlemesi için.
- Produces:
  - `SOURCES = { neyzen:{ enabled:true, base:"https://www.neyzen.com/" }, projetsm:{ enabled:true,
    base:"http://projetsm.com/" } }`
  - `normTr(s) → string` (küçük harf; â→a, î→i, û→u, ı→i, ş→s, ç→c, ğ→g, ö→o, ü→u; noktalama boşluk)
  - `makamIdOf(name) → id | null` (`normTr` ile `MAKAMS` adlarına; "Hicâz" → "hicaz", "Acem Aşîrân" → "acemasiran")
  - `parseNeyzenMakamList(html) → [{ makam, url }]` — `Sablonlar/makamListesi.html` içindeki `../makamlar/x.html`
    bağlantıları, mutlak adrese.
  - `parseNeyzenMakamPage(html, makamName) → [{ title, form, composer, makam, makamId, url, source:"neyzen" }]` —
    `nota_arsivi/…pdf` bağlantıları; satırdaki form ve besteci metni.
  - `parseProjetsmSearch(html) → [{ title, form, composer, makam, makamId, url, source:"projetsm" }]` —
    `/eserler/<id>-<slug>` bağlantıları ve bağlantı metni.
  - `parseProjetsmPiece(html) → { pages:[url], hasScore }` — `/uploads/attachment/<id>_v<n>_<k>.gif`, ilk sürüm,
    sayfa sırasıyla.
  - `buildNeyzenIndex(fetchText, prev, onProgress) → Promise<{ entries, pagesDone:[url], complete, date }>` — aynı
    anda en çok 2 istek; `prev.pagesDone`'dakileri atlar; bir sayfa hata verirse o sayfa atlanır, `complete:false`.
  - `searchIndex(entries, query, { source?, makamId? }) → entries'` — sorgunun her sözcüğü `normTr` ile başlık,
    form, besteci ya da makamda geçmeli; başlıkta geçen önce.

- [ ] **Step 1: Testleri yaz (`[48] Nota bul`)** — her ayrıştırıcı için küçük sentetik HTML (gerçek sayfanın
  yapısını taklit eden 5–10 satır); `normTr('Hicâz Longa') === 'hicaz longa'`; `makamIdOf('Acem Aşîrân') ===
  'acemasiran'`; `searchIndex` "longa hicaz" iki sözcükle buluyor, şapkasız sorgu şapkalı başlığı buluyor;
  bozuk/boş HTML → `[]`, çökme yok; **`yarim dizin`**: `fetchText` ikinci sayfada hata atınca `complete:false`,
  `pagesDone` bir sayfa; aynı `prev` ile ikinci çağrı yalnızca kalan sayfayı ister ve `complete:true`;
  `SOURCES.neyzen.enabled = false` iken `searchIndex(..., {})` neyzen sonuçlarını döndürmez.
- [ ] **Step 2: `npm test` — FAIL**
- [ ] **Step 3: Yaz** (gerçek sayfa yapısını doğrulamak için geliştirirken `curl` ile birer sayfaya bakılabilir;
  sayfalar depoya kopyalanmaz)
- [ ] **Step 4: `npm test` — PASS**
- [ ] **Step 5: Commit ve push** — `Nota çevirici: neyzen ve projetsm ayrıştırıcıları`

### Görev 10: Nota bul arayüzü, ağ ve izinler

**Files:**
- Modify: `convert.js` (arama kutusu, süzgeçler, sonuç listesi, önizleme, Çevir, Dosyayı kaydet, Dizini yenile)
- Modify: `android/app/src/main/AndroidManifest.xml` (`android.permission.INTERNET`,
  `android:networkSecurityConfig="@xml/network_security_config"`)
- Create: `android/app/src/main/res/xml/network_security_config.xml` (yalnızca `projetsm.com` için cleartext)
- Modify: `ios/App/App/Info.plist` (`NSAppTransportSecurity` → `NSExceptionDomains` → `projetsm.com`,
  `NSExceptionAllowsInsecureHTTPLoads`)
- Modify: `test.js` [25] ("internet izni istemiyor" denetimi yerine: izin var; cleartext yalnızca projetsm.com;
  `http(s)://` istekleri yalnızca `convert.js`'teki `httpGet` içinden — `fetch(` ve `CapacitorHttp` başka dosyada
  geçmiyor), `privacy.html`
- Modify: `index.html`/`build-web.js`/`sw.js` (`sources.js`)

**Interfaces:**
- Consumes: Görev 9 (hepsi), Görev 7 `imagesToPages`, Görev 8 `pdfToPages`, Görev 3 `SK.openConvert`.
- Produces: `httpGet(url, { binary }) → Promise<string | Blob>` — yerelde `Capacitor.Plugins.CapacitorHttp.get`
  (`responseType: binary ? "blob" : "text"`), tarayıcıda yok: "Nota bul yalnızca telefon uygulamasında çalışır".

- [ ] **Step 1: `test.js` denetimlerini değiştir; `npm test` — FAIL; izinleri ve ağ yardımcısını ekle — PASS**
- [ ] **Step 2: Arayüz.** Arama: neyzen dizini yoksa ya da 30 günden eskiyse önce `buildNeyzenIndex` (ilerleme
  "Dizin hazırlanıyor 23/94"), dizin `store.set("convert.neyzen", …)`; projetsm `search?search=` ile canlı.
  Sonuçlar birleşik liste: başlık, form, besteci, makam, kaynak etiketi. Dokun → önizleme (neyzen: PDF ilk sayfa,
  `pdfToPages(blob,[1,1])`; projetsm: GIF'ler, `hasScore:false` ise "bu eserin notası yok"). "Çevir" → dosya →
  `pdfToPages`/`imagesToPages` → Worker → `SK.openConvert({ …, name: title, makam: makamId, source:{ site, url } })`.
  "Dosyayı kaydet" → mevcut `Filesystem.writeFile` + `Share` yolu (`drills.js:500` kalıbı). Hata iletileri: internet
  yok, site yanıt vermiyor, "bu kaynak şu an okunamıyor" (ayrıştırıcı boş döndü).
- [ ] **Step 3: `privacy.html`'e** iki dilli paragraf: "Nota bul kullanılırsa arama sözcüğün ve indirilen notanın
  adresi neyzen.com ya da projetsm.com'a gider. Başka hiçbir şey gönderilmez."
- [ ] **Step 4: Dene.** Tarayıcı panelinde: web sürümünde "yalnızca telefon uygulamasında" iletisi; arayüz,
  `httpGet`'i `SKDEBUG.httpGet` ile `curl`'den alınmış birer sayfa döndüren sahteyle değiştirerek: arama, süzgeç,
  önizleme, Çevir → düzeltme ekranı ad/makam/kaynak dolu. Android'de (`npm run android:apk`, cihaz varsa) gerçek
  arama; cihaz yoksa bu denetimin yapılmadığı BACKLOG'a yazılır.
- [ ] **Step 5: Commit ve push** — `Nota çevirici: Nota bul`

## Aşama 5: Dayanıklılık ve belgeler

### Görev 11: Fotoğraf ve düşük çözünürlük

**Files:** Modify `omr.js`, `testomr.js`

- [ ] **Step 1: Testler (`[49] OMR: fotograf`)**: sentetik sayfaya soldan sağa %40 karartan gölge gradyanı +
  `rotate:4` + `noise:0.1` → `binarize("auto")` Sauvola'yı seçiyor, `findStaves` bütün dizekleri buluyor,
  `scoreMatch` ≥ 0,85; `scale:0.45` (sp ≈ 6) → `flags` `lowres`.
- [ ] **Step 2: `npm test` — FAIL; Sauvola (pencere 2×`sp`, k 0,2) ve `auto` seçimi (parlaklık histogramı iki tepeli
  değilse Sauvola) — PASS**
- [ ] **Step 3: Commit ve push** — `Nota çevirici: fotoğraflarda okuma`

### Görev 12: Belgeler

**Files:** Modify `docs/BACKLOG.md`, `README.md`, `testdata/omr/README.md`

- [ ] **Step 1:** BACKLOG'a "Nota çevirici — tamamlandı (tarih)" bölümü (tasarım ve plan bağlantıları, ne yapıldı,
  neyin gerçek cihazda/sesle denenmediği). "İnsan gerektiren işler"e: neyzen.com'dan (Mehmet Yücel) yazılı izin —
  mağazadan önce, yoksa `SOURCES.neyzen.enabled = false`; okuyucu eşiklerini gerçek örneklerle ayarlama
  (`testdata/omr/`). README: Çevir sekmesi, Nota bul, pdf.js ve yazı tipi kaynakları. `testdata/omr/README.md`:
  eklenen örnekler tablosu.
- [ ] **Step 2: `npm test` — PASS; commit ve push** — `Nota çevirici: belgeler`
