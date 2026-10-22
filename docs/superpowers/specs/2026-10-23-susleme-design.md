# Süsleme: dersler ve ölçüm — tasarım

23 Ekim 2026 · Durum: tasarım, uygulanmadı

## Amaç ve neden

Uygulama bugün öğrenciyi alt-orta seviyeye kadar getiriyor. Orta-ileri seviyedeki bir Sol klarnetçiyi ayıran
en önemli şeylerden biri süsleme: çarpma, mordan, tril ve Sol klarnete özgü kayarak giriş ve düşüş. Bunlar uygulamada
hiç yok (`lessons.js` ve `repertoire.js` içinde geçmiyor). Glissando ve vibrato dersleri var, ama tek başlarına
üslup kurmaya yetmiyor.

Bu tasarım iki şey ekler: (1) süslemeyi adım adım öğreten bir ders ünitesi ve (2) mikrofondan süslemenin çalınıp
çalınmadığını, süresini, aralığını ve tril için hız ve düzenini ölçen bir analiz.

Proje sahibi bu konuda uzman değil. Aşağıdaki müzik içeriği (süsleme tanımları, süreler, hangi perdeye hangi
süslemenin yapıldığı) genel Türk klarnet pratiğine göre yazıldı ve **bir Sol klarnet hocasına kontrol ettirilmesi
gerekiyor**. Bu, `docs/BACKLOG.md`'deki "Uzman doğrulaması" maddesine eklenecek.

## Hedefler

- Sıfırdan gelen bir öğrenci üniteyi bitirince beş süslemeyi temiz çalabilmeli ve bir ezgide yerinde kullanabilmeli.
- Ölçüm, süslemenin yapılıp yapılmadığını güvenilir biçimde ayırt etmeli. Yanlış "Güzel!" demek, hiç ölçmemekten kötü.
- Geri bildirim neyin yanlış olduğunu söylemeli: "çarpma çok uzun, appoggiatura gibi oldu", "tril düzensiz", "üst nota
  pes" gibi.
- Mevcut mimariye uymalı: saf mantık `skills.js`'te (Node'da test edilir), ders verisi `lessons.js`'te, adım
  çalıştırıcısı `lessonview.js`'te, iki dilli metin `{ tr, en }` ile.

## Hedef olmayanlar (bu sürümde)

- Grupetto (çevirme). Mordan ve tril oturduktan sonra eklenebilir.
- Serbest çalmada ya da taksimde süsleme tanıma (Seyir analizine eklemek). Önce ders ortamında, beklenen süslemeyi
  ölçmek; neyin çalınacağı bilinmeden tanımak çok daha zor.
- Süslemenin "zevkli" olup olmadığını yargılamak. Yalnızca ölçülebilen şeyler: var mı, süresi, aralığı, hızı, düzeni.
- Tiz bölge (yazılı Do6 üstü) süslemeleri.

## Başarısızlık sayılacak şeyler (teknik olarak çalışsa bile)

- Süslemesiz düz bir notaya ya da doğal atak kaymasına "çarpma yaptın" demek.
- Vibratoyu tril saymak.
- Ölçüm emin değilken geçti/kaldı demek. Emin değilse "duyamadım, biraz daha yüksek ya da yavaş dene" demeli.
- Mevcut perde bulucunun, ritim ve diğer ölçümlerin davranışını ya da testlerini bozmak.
- Telefonda ders ekranının takılması (analiz arayüzü dondurmamalı).

## Teknik kısıt: 40 ms yetmiyor

`app.js`'teki `tick` 40 ms'de bir çalışır ve perde penceresi 43–85 ms'dir (`app.js:716` civarı). Bir çarpma
30–100 ms, tril notaları 60–80 ms sürer. Canlı akışta bir çarpma 0–2 ölçüme düşer; güvenilir değil.

Karar: **Kaydet, sonra çöz.** Süsleme adımında her deneme bitince (ses başladı, sonra sessizlik ya da süre doldu),
o denemenin ham sesi (PCM) alınır ve 5 ms adımla, kısa pencereyle yeniden analiz edilir. Canlı gösterge olduğu gibi
kalır.

### PCM halka tamponu

- `app.js` mikrofonu açarken bir **AudioWorklet** düğümü kurar; son 4 saniyelik sesi bir halka tamponunda tutar.
  AudioWorklet yoksa `ScriptProcessorNode` yedeği kullanılır.
- Worklet kodu ayrı bir dosyada olmak zorunda (ör. `pcmring.js`). Bu dosya `sw.js` önbellek listesine, `www/`
  kopyasına ve çevrimdışı önbellek testine eklenir.
- `SK.pcm(fromT, toT)` → `{ data: Float32Array, sampleRate, t0 }`. `t0` `performance.now()` zaman çizgisinde olmalı ki
  canlı olaylarla (`note`, `silence`) eşleşsin.
- Dron ya da örnek ses çalarken alınan PCM analiz edilmez (canlı akıştaki `SK.ignore` ve `synthUntil` kuralları
  burada da geçerli).

### Yoğun perde izi (`skills.js`)

`ornamentTrack(pcm, sampleRate, opts)` → `[{ t, freq, comma, rms, clarity }]`

- Adım 5 ms. Pencere: beklenen ses 250 Hz üstündeyse 1024 örnek (≈21–23 ms), altındaysa 2048.
- `core.js`'teki `detectPitch` kullanılır (aynı alt harmonik denetimiyle). Yeni bir perde bulucu yazılmaz.
- Komalar `app.js`'teki `raw` olayıyla aynı formülle hesaplanır (Rast'a göre koma), ki ders verisiyle aynı ölçekte olsun.
- Kapsam (v1): yazılı Mi4–Do6. Derslerdeki bütün süslemeler bu aralıkta.

## Süslemeler ve nasıl tanınacakları

Her süslemenin bir **ana notası** (yazılı MIDI + makam varsa koma) ve bir **komşusu** var. Komşu: adımda makam
verilmişse makam dizisinde ana notanın bir üstü ya da altı (`learn.js` makam dizisinden), verilmemişse yazılı
dizideki komşu nota. Komşunun koma değeri `mapToScale` ile bulunur.

Yoğun iz önce **mikro notalara** bölünür: aynı perdeye (±2 koma) en az 15 ms oturan ardışık ölçümler bir parça olur.
Tanıma kuralları bu parçalar üzerinde çalışır. Aşağıdaki sayılar ilk değerlerdir; sentetik ve gerçek kayıtlarla
ayarlanacak (bkz. Test).

| Süsleme | Kural | Geri bildirim için ölçülen |
|---|---|---|
| **Üstten / alttan çarpma** | Komşu parçası 20–120 ms, hemen ardından (boşluk ≤ 30 ms) ana nota en az 300 ms. | Çarpma süresi (ideal 40–80 ms; 120 ms üstü "uzun, appoggiatura gibi"), komşunun aralığı (±2 koma), ana notanın entonasyonu |
| **Çarpmalı tekrar** (aynı notayı dille değil parmakla bölmek) | Ana nota sürerken araya 20–80 ms'lik komşu parçası giriyor, ses kesilmiyor (rms tepe değerin %30'unun altına düşmüyor). | Bölme sayısı, her birinin süresi, dil vuruşu kullanılıp kullanılmadığı (`OnsetDetector`'daki dip) |
| **Üst / alt mordan** | Ana (kısa) → komşu 20–120 ms → ana en az 300 ms; süslemenin tamamı ≤ 300 ms. | Orta parçanın süresi ve aralığı, toplam süre |
| **Tril** | Ana ile komşu arasında en az 6 geçiş; iz iki seviyede oturuyor (iki tepeli dağılım). Aralık en az 3 koma. | Hız (tam dönüş/sn), düzen (parça sürelerinin değişkenlik katsayısı), üst notanın aralığı, süre |
| **Alttan kayarak giriş** | Notanın başında iz hedefin en az 3 koma altından başlayıp 80–400 ms içinde tek yönlü olarak hedefe çıkıyor, arada ses kesilmiyor. | Başlangıç derinliği (koma), kayış süresi, hedefe oturma |
| **Sonda düşüş** | En az 300 ms süren notanın son 100–500 ms'inde iz en az 5 koma düşüp sessizliğe gidiyor. | Düşüş derinliği ve süresi |

**Tril ile vibratoyu ayırmak:** vibratonun derinliği `learn.js`'teki `vibrato` ölçümüne göre çoğunlukla ±1,5 komanın
altında ve iz sinüs gibi; trilde iz iki perde arasında oturur. Kural: aralık ≥ 3 koma **ve** iki tepeli dağılım.
Bu ayrım testle güvenceye alınır (vibratolu sentetik ses tril sayılmamalı).

**Doğal atak kayması:** her klarnet atağının ilk birkaç ms'inde perde biraz oynar. Çarpma kuralındaki 20 ms alt
sınır ve "komşu perdeye oturmuş olma" şartı bunu ayıklamak için var. Kayarak giriş kuralındaki 3 komalık alt sınır da
aynı amaçla.

**Emin olamamak:** iz denemenin %60'ından azında perde bulduysa ya da ses çok kısıksa sonuç "ölçülemedi" olur:
adım ne geçer ne kalır, öğrenciye nedeni söylenir.

### Dönen sonuç

`ornamentEval(track, spec)` → `{ ok, measured:false | true, kind, found, durMs, intervalErr, rate, evenness,
mainErr, tips:[{ tr, en }] }`. `spec` adımdan gelir: `{ kind, note, comma?, dir:"up"|"down", rate?, sec? }`.
`tips` biçimi `toneQuality` ile aynı.

## Dersler

Yeni ünite: `{ id:"susleme", name:{ tr:"Süsleme", en:"Ornaments" } }`, `UNITS` içinde `teknik`'ten sonra, `makam`'dan
önce.

Açılma: ünitenin ilk dersi temel + klarino dersleri ve **glissando** ile **dil vuruşu** dersleri bitince açılır
(`glissando` ve `artikulasyon` kimlikli dersler; parmak kontrolü ve legato gerekiyor). Ünite içinde dersler sırayla
açılır. Son ders ayrıca `ussak` ve `hicaz` makam derslerini ister. Bu `unlocked` fonksiyonuna yeni bir kural olarak eklenir.

| # | id | Başlık | İçerik ve adımlar |
|---|---|---|---|
| 1 | `sus-carpma` | Çarpma | Üstten çarpma: ne olduğu, parmağın vurup hemen kalkması. `listen` (örnek), `ornament` çarpma üstten La4 ×5, Sol4 ×5, Do5 ×5 |
| 2 | `sus-carpma-alt` | Alttan çarpma ve çarpmalı tekrar | Alttan çarpma ×5 iki notada; aynı notayı dil yerine parmakla bölmek (oyun havalarında yaygın) ×2 |
| 3 | `sus-mordan` | Mordan | Üst ve alt mordan; önce yavaş (orta parça 120 ms'e kadar kabul), sonra hızlı (80 ms) |
| 4 | `sus-tril` | Tril | Tril parmağı, yavaştan hızlıya: Sol4–La4 en az 4 dönüş/sn 2 sn, sonra 6 dönüş/sn; Re5–Mi5 5 dönüş/sn |
| 5 | `sus-uslup` | Sol klarnet üslubu: kayarak giriş ve düşüş | Alttan kayarak giriş ×4, sonda düşüş ×4; mevcut glissando dersine atıf |
| 6 | `sus-ezgi` | Süslemeyi ezgide kullanmak | İki yeni süslemeli etüt (`piece` adımı süsleme denetimiyle) |
| 7 | `sus-makam` | Makamda süsleme | Komalı komşular: Uşşak'ta Segâh'a Çargâh'tan çarpma, Hicaz'da tril. Komşu makam dizisinden gelir |

Toplam ders sayısı 46'dan 53'e çıkar; README ve testlerdeki sayılar güncellenir.

Her derste `text` ve `tips` iki dilli. Her `ornament` adımından önce bir `listen` adımı süslemeyi örnek seste çalar.

### Yeni adım türü: `ornament`

```js
{ type:"ornament", kind:"carpma", dir:"up", note:69, n:5 }          // 5 başarılı çarpma
{ type:"ornament", kind:"tril", note:67, rate:6, sec:2 }             // 2 sn, en az 6 dönüş/sn
{ type:"ornament", kind:"carpma", dir:"up", note:71, makam:"ussak", n:3 }
```

`kind`: `carpma`, `tekrar`, `mordan`, `tril`, `giris`, `dusus`. `lessons.js`'te `stepTitle`, `stepOk`, `recordStep`;
`lessonview.js`'te bir çalıştırıcı ve sonuç metni (`r.v + "/" + st.n`, tril için hız) eklenir; `canHear` listesine
girer.

### Çalıştırıcı (lessonview.js)

1. Ana notayı ve (tril için) tril parmağını gösterir. Hedefi yazar: "La4'e Si4'ten çarpmayla gir".
2. Canlı `note`/`silence` olaylarıyla denemenin başını ve sonunu bulur (ses en az 300 ms sürüp sessizlik geldiğinde
   ya da tril için `sec` dolduğunda).
3. `SK.pcm` ile denemeyi alır, `ornamentTrack` + `ornamentEval` çalıştırır. Analiz arayüzü dondurmamalı (gerekirse
   `setTimeout(0)` ile parçalı ya da bir Web Worker'da).
4. Sonucu gösterir: sayaç, geri bildirim cümlesi ve **yakın iz**: denemenin perde eğrisi, beklenen şekil (ör. çarpma
   için kısa üst basamak) soluk çizgiyle üstünde. Öğrenci neyi yanlış yaptığını görmeli.

## Örnek ses

Örnek sesler süslemeyi duyurmalı. Mevcut sentez (şerit ve `listen` adımları) nota dizisi çalıyor; süsleme için
`ornamentNotes(spec)` → `[[freq, ms]]` dizisi üretilir (çarpma: komşu 60 ms + ana; tril: 70 ms'lik dönüşler).
Kayarak giriş ve düşüş için perde rampası gerekir; sentez bunu desteklemiyorsa eklenir.

## Nota gösterimi ve eserler (repertoire.js)

- Nota metnine süsleme eki: `La4:2:tr` (tril), `La4:1:ç+` / `ç-` (üstten/alttan çarpma), `m+` / `m-` (mordan),
  `k` (kayarak giriş), `d` (düşüş). `parseScoreText` her notaya `orn` alanı ekler; ek yoksa davranış aynen kalır.
- MusicXML içe aktarma: `<trill-mark/>`, `<mordent/>`, `<inverted-mordent/>` ve `<grace/>` notalar `orn` alanına
  çevrilir.
- Dizekte işaretler çizilir: tril için "tr", mordan işareti, çarpma için küçük nota.
- Tempolu çalma değerlendirmesine ayrı bir **süsleme puanı** eklenir: işaretli notalarda süsleme bulundu mu.
  Süslemesiz eserlerin puanı değişmez.
- Etütler: iki yeni özgün etüt (ör. süslemeli Uşşak etüdü, süslemeli Hicaz 9/8 oyun havası). Telifli eser yok.

## Çalışma sekmesi ve ilerleme

- **Teknik** grubuna "Süsleme" alt sekmesi: süsleme türü, nota ve (isteğe bağlı) makam seçilir; sınırsız deneme,
  her denemede aynı geri bildirim ve yakın iz. `?tab=susleme` adresi çalışır.
- İlerleme: en iyi tril hızı (düzen eşiğini geçen), çarpma başarı oranı (son 20 deneme).
- Günlük plan (`dailyPlan`): süsleme dersleri bitmişse ara sıra bir `ornament` adımı eklenir.
- Uzman kontrolü ekranına süsleme tanımları ve örnek sesleri eklenir, hoca doğru/yanlış işaretleyebilsin.

## Test

- `testaudio.js`'teki sentetik klarnet üretecine süslemeli sesler eklenir: çarpma (20–150 ms, üst/alt), mordan,
  tril (3–10 dönüş/sn, düzenli ve düzensiz), kayarak giriş, düşüş; mevcut gürültü, yankı, telefon mikrofonu ve
  vibrato koşullarıyla.
- Kabul eşikleri (ilk değerler, gerçek kayıtlarla gözden geçirilecek):
  - Sentetik süslemelerde doğru tanıma ≥ %95
  - Süslemesiz düz notalarda (doğal atak kayması dahil) yanlış "çarpma" ≤ %3
  - Vibratolu notalarda yanlış "tril" ≤ %2
  - Tril hızı hatası ≤ 0,5 dönüş/sn; çarpma süresi hatası ≤ 15 ms
- `test.js`: yeni adım türü bütün ders adımı denetimlerinden geçer (iki dilli metin, çalınabilir notalar, geçme
  koşulları, kilit sırası); `parseScoreText` ve MusicXML süsleme ekleri; `sw.js` listesinde worklet dosyası.
- Gerçek kayıtlar: `testdata/README.md` listesine süslemeli kayıtlar eklenir (insan işi; BACKLOG'a yazılır).

## Kararlaştırılanlar ve kimin kararı

Proje sahibi uzman olmadığı için ayrıntıları tasarımcıya bıraktı. Aşağıdakilerin hepsi **tasarımcının kararı**:

- Kapsam: beş süsleme + çarpmalı tekrar; grupetto ve taksimde tanıma yok
- Kaydet-sonra-çöz yöntemi, AudioWorklet halka tamponu, 5 ms adım
- Yeni ünite ve açılma kuralı, 7 ders
- Nota eki söz dizimi
- Bütün sayısal eşikler

## Builder'a kalanlar

- Eşiklerin sentetik ve gerçek kayıtlarla ayarlanması
- Yakın izin görünümü, renkleri, süsleme işaretlerinin dizekteki çizimi
- Analizin ana iş parçacığında mı Worker'da mı çalışacağı (telefonda ölçüp karar ver)
- Ders metinlerinin yazımı (iki dilli, mevcut derslerin üslubunda), etüt ezgileri
