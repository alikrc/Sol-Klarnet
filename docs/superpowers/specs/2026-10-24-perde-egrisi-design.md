# Perde eğrisi: kayıtta zaman–koma grafiği ve kendiliğinden işaretler — tasarım

24 Ekim 2026 · Durum: tasarım, uygulanmadı

## Amaç ve neden

Kayıt sekmesi bugün çalınan notaları bir tabloda listeliyor: her notanın zamanı, perdesi ve ortalama koma sapması.
Ortalama tek başına çok şey saklıyor. Bir nota doğru ortalamayla çalınmış olabilir ama alttan girip sonda düşüyor
olabilir, ya da titriyor olabilir. Hangi perdenin kayıt boyunca hep pes kaldığı da tablodan okunmuyor.

Proje sahibinin hocası yok ve olmayacak. Bu yüzden grafiğe işareti hoca koymayacak; sorunlu yerleri uygulama
kendisi bulup gösterecek. Hedef, kendi başına çalışan öğrencinin kaydını dinlerken "nerede, ne kadar, ne yönde
kaçtım" sorusunun cevabını tek bakışta görmesi.

Proje sahibi soruları atlamayı seçti; aşağıdaki kararların hepsi tasarımcının.

## Hedefler

- Kayıt bitince tablonun üstünde, kaydın tamamını kapsayan bir zaman–koma grafiği görünür.
- Grafik kayıt çalarken çalma çizgisiyle birlikte ilerler. Grafiğe dokunmak kaydı o noktaya sarar; tablodaki satıra
  dokunmak da grafiği ve kaydı o notaya götürür.
- Uygulama her notada şu durumları kendisi işaretler: pes, tiz, nota içinde kayma, alttan/üstten giriş, titreklik.
  Vibrato ve dizi dışı perde ayrıca belirtilir ama hata sayılmaz.
- Kaydın altında bir özet: kaç nota yerinde, en çok kaçan üç perde ve yönü. Her biri için o notanın parmak kartına
  giden bir bağlantı.
- Saf mantık `skills.js`'te olur ve Node'da test edilir; çizim ve etkileşim `drills.js` içindeki `TRAINERS.rec`'te.
  Bütün metinler iki dilli.

## Hedef olmayanlar

- Hocanın işaret koyması, kaydın hocaya gönderilip geri alınması, hocadan ödev bağlantısı. (Hoca yok; bu fikirler
  backlog'dan çıkarılır.)
- Kayıtları uygulama içinde saklama ve eski kayıtla karşılaştırma. Mevcut "Kaydı kaydet / paylaş" yeterli.
- Eser ve etüt değerlendirmesinde, Seyir'de ya da Akort'taki canlı izde aynı grafik. Fonksiyonlar buralarda da
  kullanılabilecek biçimde yazılır ama bu işte bağlanmaz.
- Grafiği elle düzenleme ya da işaret silme.

## Başarısızlık sayılacak şeyler

- Doğru çalınmış bir notanın hatalı diye işaretlenmesi. Emin olunmayan durumda işaret konmaz. Bir kaydın yarısı
  kırmızıysa öğrenci uygulamaya güvenmeyi bırakır.
- Oktav sıçraması ya da tek karelik perde bulucu hatasının eğride dikey çizgi gibi görünüp işaret üretmesi.
- Dron, metronom ya da kaydın kendisinin hoparlörden çalınması sırasında oluşan sesin eğriye girmesi.
- Uzun kayıtta (birkaç dakika) grafiğin kaydırırken ya da çalarken takılması.
- Mevcut kayıt, tablo, paylaşma ve "Eserlere ekle" davranışının bozulması.

## Veri

Kayıt sırasında `SK.on("raw")` olayları zaten geliyor (`{ t, freq, comma, rms, clarity }`), ama yalnızca nota
geçişlerindeki glissando denetimi için kısa süre tutuluyor. Kayıt boyunca bütün `raw` kareleri `rec.raw` dizisine
`{ t, comma }` olarak eklenir (t, kayıt başından ms). Sessizlik olayında `{ t, comma:null }` eklenir; eğri orada
kopar. Saniyede birkaç düzine kare olduğundan beş dakikalık kayıt bile birkaç bin öğe tutar.

Notalar bugünkü gibi `segmentNotes(frames, 150)` ile bulunur. Her notaya, kendi zaman aralığına düşen `raw`
kareleri bağlanır.

Makam bağlamı (`getTuningContext()`) kaydı durdururken alınır ve bütün hesaplar onunla yapılır. Bağlam yoksa
`contextPerde` AEU'nun en yakın perdesini kullanır.

## Ölçüm: `skills.js`

### `cleanTrace(raw) → [{ t, comma|null }]`

- 3 karelik kayan medyan; boşluk (`null`) medyan penceresini böler.
- Komşularının ortanca değerinden 20 komadan fazla uzaklaşan tek kare (oktav ya da alt harmonik hatası) atılır.

### `intonationIssues(notes, trace, opts) → [{ i, kinds:[…], delta, target, perde, inScale, …ölçüler }]`

Her nota için (`notes[i]`, `trace` o aralıktaki temiz kareler):

- **Kararlı bölüm:** notanın ilk 120 ms'i ve son 80 ms'i atılır. Kalan kısım 150 ms'den kısaysa ya da 4 kareden az
  içeriyorsa notaya hiç işaret konmaz (`kinds:[]`, `short:true`).
- **Hedef:** kararlı bölümün medyanı `contextPerde`'ye verilir; `delta` = medyan − hedef koma.
- **pes / tiz:** |delta| > `INTON.offKoma` = 1,5 koma.
- **kayma:** nota ≥ 400 ms ise kararlı bölümün ilk ve son üçte birinin ortalamaları arasındaki fark
  > `INTON.driftKoma` = 1,5. Yönü (`drift` > 0 tizleşiyor, < 0 düşüyor) saklanır.
- **giriş:** ilk 120 ms'in ortalaması hedeften `INTON.scoopKoma` = 2 komadan fazla uzak, kararlı bölüm ise yerinde
  (|delta| ≤ 1,5) → "alttan giriş" ya da "üstten giriş". Hata değil, bilgi işareti: süslemedeki kayarak giriş
  kasıtlı olabilir.
- **vibrato:** mevcut `vibrato()` bir sonuç döndürürse bilgi işareti; titreklik denetimi o notada yapılmaz.
- **titrek:** vibrato yoksa, eğilimi çıkarılmış kararlı bölümün standart sapması > `INTON.wobbleKoma` = 0,8.
- **dizi dışı:** bağlam varken `inScale` false → bilgi işareti.

Hata türleri: pes, tiz, kayma, titrek. Bilgi türleri: giriş, vibrato, dizi dışı. Eşikler tek bir `INTON` nesnesinde
durur; gerçek kayıtlarla ayarlanmaları gerektiği backlog'a yazılır.

### `intonationSummary(issues) → { total, ok, measured, perdes:[{ perde, written, n, mean, dir }] }`

- `measured`: işaret konabilen (kısa olmayan) notalar; `ok`: bunların içinde hata türü taşımayanlar.
- `perdes`: aynı perdeye düşen notalar gruplanır; en az 2 kez çalınmış ve ortalama |delta| > 1 olan perdeler,
  ortalama |delta|'ya göre büyükten küçüğe, en çok üç tane. `dir`: "pes" ya da "tiz".

## Arayüz: Kayıt sekmesi

Kayıt bitince sırasıyla: ses çalar → **grafik** → özet satırı → "en çok kaçan perdeler" → mevcut tablo → mevcut
düğmeler.

### Grafik

- Akort'taki iz gibi bir `canvas` (`canvas.trace` stili, yükseklik 200 px), aynı renk ve yazı belirteçleri.
- **Zaman ekseni:** görünür pencere 8 sn; kayıt daha uzunsa grafik yatay sürüklenerek kaydırılır. "Tümü" düğmesi
  kaydın tamamını sığdırır, tekrar basınca 8 sn'ye döner. Altta saniye işaretleri.
- **Perde ekseni:** görünür penceredeki notaların en pes ve en tiz hedefinin 3 koma ötesine kadar, en az ±6 koma.
  Bağlamdaki dizi perdeleri çizgi ve adıyla, dizi dışı AEU perdeleri soluk çizgiyle (Akort izindeki gibi).
- **Notalar:** her notanın hedef perdesi, nota süresi boyunca kalın, yarı saydam bir şerit. Eğri bu şeridin
  üstünden geçer; öğrenci şeritten ne kadar saptığını görür.
- **Eğri:** `cleanTrace` sonucu. Rengi nota bazında: hata türü yoksa `--ok`, pes/tiz/kayma/titrek varsa `--accent`
  . Kısa notalar ve notalar arası geçişler `--muted`.
- **İşaretler:** hatalı notanın üstünde kısa etiket ("pes 2,1", "kayıyor", "titrek"); bilgi işaretleri soluk
  ("alttan", "vib.", "dizi dışı"). Etiketler üst üste binerse sonraki gizlenir (Akort izindeki perde adları gibi).
- **Çalma çizgisi:** `audio.timeupdate` ve `requestAnimationFrame` ile dikey çizgi. Çalarken çizgi pencereden çıkarsa
  pencere kayar. Öğrenci elle kaydırdıktan sonra 3 sn boyunca otomatik kaydırma yapılmaz.
- **Dokunma:** sürüklemeden yapılan dokunuş kaydı o zamana sarar ve çalmayı başlatır. O andaki nota tabloda
  vurgulanır (mevcut `.now` sınıfı).
- Çizim yalnızca görünür penceredeki kareleri dolaşır (ikili aramayla başlangıç), böylece uzun kayıt takılmaz.
- Tarayıcı kaydı desteklemiyorsa (`MediaRecorder` yok) grafik yine çizilir; çalma çizgisi ve sarma olmaz.

### Özet ve öneriler

- Satır: "18 notadan 14'ü yerinde · 3 kısa nota ölçülmedi".
- "En çok kaçan perdeler": "Segâh (yazılı Si4) · 4 kez · ortalama 2,3 koma pes · Parmağa bak". "Parmağa bak",
  Akort görünümünü `#nota=<yazılı>` ile açar; bu bağlantı zaten var. Parmak kartında alternatif parmaklar
  görünüyor.
- Kısa bir yön ipucu: hep pes kalan perdede "dudak baskısını biraz artır, ağızlığı biraz daha az al", hep tiz
  kalanda tersi. Kayan notada "nefesi notanın sonuna kadar aynı tut". Titrek notada "uzun ses çalış" ve Uzun ses
  sekmesine bağlantı. Bu metinler genel bilgidir; tasarımcının kararıdır.
- Hiç hata yoksa: "Bütün notalar yerinde."

### Tablo

- Yeni sütun "Not": notanın işaretleri, kısaltılmış ("pes", "kayıyor · alttan").
- Satıra dokunmak kaydı notanın başına sarar ve grafiği oraya kaydırır.

## Test (`testcurve.js`, `test.js`'ten çağrılır)

Sentetik karelerle (`t` adımı 25 ms):

1. Hedefte sabit nota → işaret yok.
2. +2 koma sabit → "tiz", delta ≈ 2; −2 → "pes".
3. 0'dan +3'e doğrusal kayan 800 ms nota → "kayma", yön tizleşme.
4. İlk 120 ms −4, sonra hedefte → "alttan giriş", hata türü yok.
5. 5,5 Hz, ±0,8 koma salınım → "vibrato", "titrek" değil.
6. Düzensiz gürültü, sapma 1,2 koma → "titrek".
7. 200 ms'lik nota → `short`, işaret yok.
8. `cleanTrace`: tek karelik +53 koma sıçraması atılır; `null` sonrası medyan sızmaz.
9. `intonationSummary`: üç perde farklı ortalamalarla; sıralama, 2 kez kuralı, en çok üç.
10. Bağlam Hicaz iken dizi dışı perde → "dizi dışı" bilgi işareti.
11. Hedefte temiz çalınmış, 2 komalık kısa geçişler içeren bir ezgi → hiçbir notada hata türü yok (yanlış alarm
    denetimi).

Arayüz tarayıcı panelinde sahte `raw` olaylarıyla denenir: grafik çizilir, sürükleme ve "Tümü" çalışır, tabloya
dokunmak vurguyu taşır. Konsolda hata olmaz.

## Belgeler

- `docs/BACKLOG.md`: yeni "Perde eğrisi — tamamlandı" bölümü. "Sonraki adım fikirleri"nden hoca ile ilgili iki
  madde çıkarılır. `INTON` eşikleri "Gerçek kayıtlar" maddesine eklenir.
- `README.md`: Kayıt sekmesinin tanımı güncellenir.

## Kurucuya kalanlar

- Şeritlerin ve etiketlerin saydamlık ve yazı boyutu.
- Etiket kısaltmaları ve İngilizce karşılıkları.
- Dokunma ile sürükleme ayrımının eşiği (öneri: 8 px).
