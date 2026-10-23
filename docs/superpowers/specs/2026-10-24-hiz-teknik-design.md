# Hız ve teknik: tempo merdiveni, gamlar, arpejler — tasarım

24 Ekim 2026 · Durum: tasarım, uygulanmadı

## Amaç ve neden

Uygulama bir öğrenciyi alt-orta seviyeye getiriyor, ama orta seviyeye geçişte en büyük engel olan hız ve parmak
çevikliğini hiç çalıştırmıyor. Etütler 66–100 tempoda; kademeli tempo artırma, gamlar, arpejler ve parmak kalıpları yok.
Oyun havası ve hızlı taksim pasajları çalabilmek için öğrencinin aynı pasajı önce yavaş ve temiz, sonra adım adım hızlı
çalması gerekir.

Bu tasarım üç şey ekler:
1. **Teknik kalıpları:** makam dizileri, Batı gamları, arpejler, üçlü atlamalar, parmak çevikliği grupları ve register
   geçişi; program içinde kurallarla üretilir.
2. **Tempo merdiveni:** kalıp metronomla çalınır; temiz çalınırsa tempo bir basamak artar, çalınamazsa iner. En yüksek
   temiz tempo kaydedilir ve günden güne izlenir.
3. **Hızlı pasaj ölçümü:** bağlı (legato) çalışta dil vuruşu olmadığı için mevcut nota başı bulucu notaları ayıramaz.
   Süsleme için yapılan ham ses kaydı ve 5 ms'lik perde izi burada da kullanılır: nota sınırları perde değişiminden
   bulunur, çalınanlar beklenen notalarla hizalanır.

Proje sahibi bu konuda uzman değil ve soruları atlamayı seçti; aşağıdaki bütün kararlar tasarımcının kararıdır.
Müzik içeriği (hangi gamlar ve arpejler, hedef tempolar) bir hocaya kontrol ettirilmeli.

## Hedefler

- Öğrenci, ünite sonunda bir makam dizisini ve bir arpeji on altılıklarla ♩=90–100'de temiz çalabilmeli.
- Bir çalışın "temiz" olup olmadığı nesnel ölçülmeli: doğru nota oranı, zamanlama ve düzen.
- Merdiven kendiliğinden ilerlemeli; öğrenci tempoyu elle ayarlamak zorunda kalmamalı.
- Bağlı ve dille çalınan pasajlar ayrı ayrı ölçülebilmeli.
- Mevcut mimariye uymalı: saf mantık `skills.js`'te (Node'da test edilir), ders verisi `lessons.js`'te, arayüz
  `trainers.js` / `lessonview.js`'te, iki dilli metin.

## Hedef olmayanlar

- Tiz bölge (yazılı Do6 üstü): ayrı bir iş.
- Hızlı süsleme (hızlı pasaj içinde çarpma ya da tril ölçümü).
- Serbest çalmada (taksim) hız ölçümü.
- Çift dil (double tonguing): Sol klarnette yaygın değil.
- Ezberden çalma: kalıp dizekte ve nota çiplerinde görünür.

## Başarısızlık sayılacak şeyler

- Metronom tıkının ya da hoparlör sızıntısının nota sayılması.
- Doğru ve temiz bağlı çalışın, nota başı bulunamadığı için "kaçan nota" sayılması.
- Merdivenin cezalandırıcı olması: bir hata tempoyu çok düşürmemeli, tek bir şanslı çalış da tempoyu çok
  yükseltmemeli.
- Ölçüm emin değilken geçti/kaldı demek. Sessiz ya da kısık çalışlar "ölçülemedi" olur.
- Çalarken arayüzün takılması: çözümleme çalış bittikten sonra yapılır.
- Mevcut ritim, eser ve süsleme ölçümlerini ya da testlerini bozmak.

## Teknik kalıpları (`skills.js`)

`techPattern(spec) → { notes:[{ w, c?, d }], meter, label:{ tr, en } }` (süre dörtlük cinsinden; `c` makam perdesi).

| `spec.type` | Ne üretir |
|---|---|
| `scale` | Bir makamın dizisi (`learn.js` `asc`/`desc`) ya da Batı gamı (majör/doğal minör, yazılı nota), çıkış + iniş |
| `arp` | Majör/minör üç sesli arpej (1-3-5-8-5-3-1), istenirse iki oktav |
| `thirds` | Dizide üçlü atlamalar (1-3, 2-4, 3-5, …) çıkış ve iniş |
| `groups` | Parmak çevikliği: dörtlü gruplar (1-2-3-4, 2-3-4-5, …) |
| `break` | Register geçişi: kırılmanın iki yanındaki notalar arasında git gel (ör. La4–Si4, Si♭4–Do5) |

Ortak alanlar: `base` (yazılı başlangıç notası ya da makam), `makam?`, `octaves` (1–2), `sub` (vuruş başına nota: 2 =
sekizlik, 3 = triole, 4 = on altılık), `art` (`legato` | `tongue`). Bütün notalar yazılı Mi3–Do6 aralığında kalmalı;
aralık dışına taşan kalıp üretilmez (hata döner).

Batı gamları ve arpejler yazılı notalarda (koma yok); makam dizileri ve üçlüleri makam perdeleriyle (`c` dolu) üretilir.
Batı tonları ilk sürümde: Do, Sol, Fa majör; La, Mi, Re minör (doğal minör).

## Bir çalış

1. Bir ölçü sayım (metronom, mevcut `ctx.hit` ile, eserlerdeki tempolu çalma gibi), sonra kalıbın notaları metronomla.
   Metronom çalış boyunca açık kalır.
2. Kayıt sayımın son vuruşunda başlar, son beklenen notanın bitişinden 700 ms sonra durur.
3. Çözümleme kayıt durduktan sonra yapılır; sonuç ve dizek işaretleri gösterilir, merdiven bir sonraki tempoyu seçer.
4. Merdivende sonraki çalış bir dokunuşla ("Sonraki: ♩=84") ya da "otomatik devam" açıksa 2 saniye sonra kendiliğinden
   başlar.

## Ölçüm

### Kayıt: ham ses aboneliği

Bir çalış 8 saniyeyi geçebilir (yavaş tempoda iki oktav). Halka tampon yerine yeni bir abonelik:
`SK.pcmCapture() → { stop() → { data: Float32Array, sampleRate, t0 } }`. `app.js`'teki `take` her bloğu
abonelere de verir; abonelik blokları biriktirir. `t0` `performance.now()` zaman çizgisinde ilk örneğin zamanıdır.
Örnek ses ya da dron çalarken alınan aralıklar (`busy`) sonuçla birlikte döner; o aralıklara düşen notalar
değerlendirilmez. Çalış en çok 30 saniye; aşarsa kayıt durur.

### Nota sınırları

`ornamentTrack` (5 ms adım) ile iz çıkarılır. Nota başları iki kaynaktan birleştirilir:
- **Perde değişimi:** `microNotes` parçalarının başları (bağlı çalış).
- **Ses düzeyi çukuru:** izdeki `rms` tepe değerin %45'inin altına düşüp %70'e geri çıkıyorsa (mevcut
  `OnsetDetector` kuralı) yeni nota başı (dille çalış ve aynı notanın tekrarı).

Metronom sızıntısını ayıklamak için: perdesiz ya da `clarity` düşük kısa ses patlamaları nota sayılmaz; bir nota başı,
ardından en az 40 ms perdeli ses geliyorsa geçerlidir.

### Hizalama

`alignRun(expected, played, opts) → { notes:[{ i, state:"ok"|"pitch"|"miss", dev? }], extra, correct, mean, sd, evenness }`

- `expected`: kalıbın notaları, metronoma göre beklenen başlangıç zamanlarıyla (`performance.now()` ms; ritim
  gecikme ayarı `rhythm.lat` uygulanmış).
- `played`: bulunan notalar `{ t, w, comma }`.
- Dinamik programlama ile hizalama (eşleşme maliyeti: perde uyuşmazlığı + zaman farkı; atlama = kaçan ya da fazla nota).
  Bağlı ve dille çalış aynı hizalamayı kullanır.
- `correct`: doğru perdede çalınan beklenen nota oranı.
- `mean`, `sd`: doğru notaların zaman sapması (ms).
- `evenness`: art arda doğru iki nota arasındaki sürelerin beklenen süreye oranının değişkenlik katsayısı.

### Temiz çalış

Bir çalış şu koşulların hepsini sağlarsa **temiz** sayılır (ilk değerler, sentetik ve gerçek kayıtlarla ayarlanacak):
- `correct ≥ 0,9`
- `|mean| ≤ 0,25 × nota süresi` ve `sd ≤ 0,2 × nota süresi`
- `evenness ≤ 0,2`

Perdeli ölçüm oranı %50'nin altındaysa çalış "ölçülemedi" olur. Geri bildirim en büyük sorunu söyler: "yanlış notalar:
3. ve 7.", "acele ediyorsun (ortalama 40 ms erken)", "notalar eşit değil", "Si4–Do5 geçişinde takılıyorsun" (kaçan ya da
yanlış notalar bir yerde toplanıyorsa).

## Tempo merdiveni

`TempoLadder(start, opts)` (saf mantık, `skills.js`):
- Temiz çalış → tempo `+step` (varsayılan 4 vuruş/dk; ♩=120 üstünde 6).
- Temiz olmayan iki çalış üst üste → tempo `−step`; tek hata tempoyu değiştirmez.
- Ölçülemeyen çalış sayılmaz.
- `best`: temiz çalınan en yüksek tempo. `target` verildiyse ona ulaşınca merdiven biter.
- Alt sınır başlangıç temposunun %70'i; üst sınır 220.
- Art arda 3 temiz olmayan çalıştan sonra "biraz dinlen" önerisi ve oturum sonu.

Her kalıp için kayıt: `tech.best[patternKey] = [{ day, tempo }]` (gün başına en iyi). `patternKey` kalıbın
`type:base:makam:sub:art:octaves` özeti.

## Dersler

Yeni ünite: `{ id:"hiz", name:{ tr:"Hız ve teknik", en:"Speed and technique" } }`, `UNITS` içinde `teknik`'ten sonra,
`susleme`'den önce. İlk ders temel + klarino ve `artikulasyon` (dil vuruşu) dersleri bitince açılır; ünite içinde
sıralı. Süsleme ünitesinin açılma kuralı değişmez.

Yeni adım türü: `{ type:"tech", pattern:{…techPattern spec}, start, target, art }`. Adım, merdiven `target`'a ulaşınca
geçer (`res.v` = ulaşılan en yüksek temiz tempo, `stepOk`: `v ≥ target`).

| # | id | Başlık | İçerik |
|---|---|---|---|
| 1 | `hiz-metronom` | Metronomla dizi | Rast dizisi sekizlik, ♩=60 → 80; Do majör gamı sekizlik |
| 2 | `hiz-artik` | Bağlı ve dille | Aynı dizi bağlı ve dille; dille sekizlik ♩=70 → 90 |
| 3 | `hiz-parmak` | Parmak çevikliği | Dörtlü gruplar (Sol4'ten), register geçişi La4–Si4 ve Si♭4–Do5 |
| 4 | `hiz-arpej` | Arpejler ve üçlüler | Sol majör ve La minör arpej, Rast'ta üçlü atlamalar |
| 5 | `hiz-16lik` | On altılıklar | Rast dizisi on altılık ♩=60 → 80, Sol majör gamı iki oktav |
| 6 | `hiz-makam` | Makam dizileri hızda | Uşşak, Hicaz, Nihâvend on altılık ♩=70 → 90 |
| 7 | `hiz-etut` | Hızlı etüt | Yeni özgün etüt `e-hiz-hicaz` (Hicaz 9/8 oyun havası pasajı, ♩=120, sekizlikler) merdivenle %60 → %100 tempo: `{ type:"piece", id:"e-hiz-hicaz", mode:"ladder", min:100 }` (`res.v` = temiz çalınan en yüksek yüzde) |

Her `tech` adımından önce bir `listen` adımı kalıbı hedef tempoda çalar. Ders metinleri: rahat parmak (parmaklar
deliklere yakın), önce yavaş ve temiz, nefes yerleri, gevşek omuz.

Günlük plan: `hiz-metronom` bitmişse, bitirilen hız derslerinden bir kalıp, son en iyi temponun 8 altından başlayan kısa
bir merdiven (3 basamak).

## "Hız" alıştırma sekmesi

**Teknik** grubunda yeni sekme `hiz`:
- Kalıp seçimi: tür, başlangıç notası ya da makam, oktav, `sub`, bağlı/dille; başlangıç temposu (varsayılan: o kalıbın
  son en iyisinin 8 altı, yoksa 60).
- Kalıp dizekte (mevcut `drawScore`) ve çalış sırasında geçerli nota işaretli.
- Her çalıştan sonra: temiz mi, doğru nota oranı, zamanlama, düzen, en büyük sorun; dizekte yanlış ve kaçan notalar
  işaretli.
- Merdiven durumu: şimdiki tempo, en iyi, son 14 günün en iyi tempo çizgisi.

İlerleme sekmesine "Hız" satırı: kalıp başına en iyi tempo ve son 14 gündeki artış.

## Eserlerde merdiven

`pieces.js`'te tempolu çalmaya "merdiven" düğmesi: %60'tan başlar, temiz çalış olursa %5 artar, %120'ye kadar; iki
temiz olmayan çalış üst üste %5 düşürür. Eserde temiz çalış, mevcut `alignPerformance` sonucuna göre: doğru nota oranı
≥ %90, `|mean| ≤ 60 ms`, `sd ≤ 50 ms`. Ders adımında `mode:"ladder"` aynı merdiveni çalıştırır. Hız kaydırıcısı (%50–120) olduğu gibi kalır. Eser ölçümü mevcut nota başı yöntemini
kullanmaya devam eder; bağlı eserler için ham ses yöntemine geçmek bu sürümün dışında.

## Test

- `techPattern`: her tür doğru notaları ve süreleri üretiyor; aralık dışı kalıp hata veriyor; makam dizileri perdelerle.
- Sentetik çalışlar (`testaudio.js` `ornamentAudio` ile): bağlı ve dille, sekizlik ve on altılık, ♩=60–140:
  - doğru çalışta `correct ≥ 0,95`, temiz;
  - bir yanlış nota, bir kaçan nota, bir fazla nota doğru yerde bulunuyor;
  - acele (her nota %15 erken) ve düzensiz (±%30 rastgele) çalış temiz sayılmıyor;
  - metronom tıkı (kısa geniş bantlı patlama) karışmış çalışta fazla nota yok.
- `TempoLadder`: artış, iki hatada düşüş, tek hatada kalma, alt/üst sınır, hedefte bitiş, ölçülemeyen çalışın
  sayılmaması.
- Ders adımı denetimleri (`test.js`) yeni `tech` türünü içeriyor.

## Kararlaştırılanlar (tasarımcının kararı)

- Kalıplar kurallarla üretilir, elle yazılmaz (yeni kalıp eklemek kolay olsun).
- Ölçüm ham sesten, çalış bitince; bağlı çalış için perde değişimi, dille çalış için ses düzeyi çukuru.
- Merdiven: +4 (♩=120 üstünde +6), iki hatada −4, tek hata tempoyu değiştirmez.
- Yeni ünite (7 ders) teknik ile süsleme arasında.
- Bütün sayısal eşikler.

## Uygulayıcıya kalanlar

- Hizalama maliyet ağırlıkları ve eşiklerin ayarı.
- Sekme düzeni ve çizgi grafiğin görünümü.
- Ders metinlerinin yazımı ve hızlı etüdün ezgisi.
- Çalış uzunluğu sınırının (30 sn) telefonda bellek açısından uygun olup olmadığı.
