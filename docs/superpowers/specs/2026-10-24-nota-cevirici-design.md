# Nota çevirici: PDF, resim ve sesten esere — tasarım

24 Ekim 2026 · Durum: tasarım, uygulanmadı

## Amaç ve neden

Proje sahibi çalmak istediği ezgilerin notasını genelde PDF, ekran görüntüsü ya da YouTube videosu olarak buluyor.
MusicXML dosyası bulmak pratik değil. Uygulamada bugün iki yol var: notaları elle yazmak ya da MusicXML içe
aktarmak. "Piyano (konser) notası" kutusu, konser notasını Sol klarnetin yazılı notasına çevirebiliyor.
Eksik olan şey, notaların kendisini PDF'ten, resimden ya da sesten çıkarmak.

Proje sahibinin kararları:

- Okuma **uygulamanın içinde** yapılır. Notayı sohbette Claude'a okutmak istenmiyor.
- **Yapay zekâ yok, sunucu yok.** Her şey telefonda, internetsiz çalışır. Uygulamanın "hiçbir şey cihazdan çıkmaz"
  sözü korunur.
- Üç kaynak desteklenir: PDF, ekran görüntüsü ya da fotoğraf, YouTube ya da ses kaydı.

Bu sınırlarla nota okuma, kalıp eşleştirme ve kurallara dayanan klasik görüntü işlemeyle yapılır. Ses ise
uygulamanın mevcut perde bulucusuyla yazıya dökülür. İkisi de hata yapabilir, bu yüzden her sonuç kaydedilmeden önce
bir **düzeltme ekranından** geçer. Tasarımın kalbi bu ekran: Okuyucu %90 doğruysa bile, kalan %10'u birkaç dokunuşla
düzeltebilmek gerekir.

## İlk gerçek örnek

Proje sahibinin verdiği örnek: neyzen.com nota arşivinden "Hicâz Longa" (Kemânî Nafiz Aydın Oran). Bu tür
notaların tipik özellikleri, tasarımın asıl hedefi bunlar:

- **PDF'in içi tek bir resim:** A4, 300 dpi (2480×3508) JPEG. Bilgisayarda yazılmış, sonra resim olarak
  aktarılmış: çizgiler düz ve temiz, ama içinde okunacak nota simgesi yok. Yani vektör okuma bu kaynakta işe
  yaramaz; resim yolu doğru yol.
- **PDF şifreli:** Yalnızca izin kısıtlaması var, açma parolası boş. pdf.js bunu açabilir; okuyucu bu durumu
  desteklemeli.
- **Türk müziği notası:** Donanımda AEU koma bemolü (eğik çizgili ♭) ve ♯ işaretleri var; çevrilmeden okunur.
  Ölçü içinde ♮, parantez içinde hatırlatma ♮, ♯ ve ♮ ile koma işaretleri geçiyor.
- **Biçim:** 2/4, on altılık kirişler, noktalı sekizlik, uzatma bağı, ölçü tekrarı işareti (%), tekrar çizgileri,
  segno (𝄋) ve "Son" ile hâne–teslim düzeni (1. Hâne, Teslim, 2. Hâne → Teslim …).
- **Yazılar:** Başlık, besteci, usul ("Nîm Sofyân"), tempo (♩ = 98), hâne adları. Bunlar okunmaz.

Bu örnek ayrıca bestecinin telif süresi içinde olan bir eser. Bu yüzden depoya girmez; aşağıdaki "Test"e bakın.

## Hedefler

- Eserler grubunda yeni bir **"Çevir"** sekmesi. İçinde üç giriş var: "PDF ya da resim seç", "Ses dosyası seç",
  "Dinleyerek yaz".
- **Bir eser ne kadar** (tasarımcının kararı): Birden çok resim seçilebilir; seçim sırasıyla tek esere eklenir
  (bir eser iki üç ekran görüntüsüne bölünmüş olabilir). Çok sayfalı PDF'te sayfa aralığı sorulur (varsayılan: hepsi);
  bir PDF'te birden çok eser varsa öğrenci her biri için aralığı ayrı seçip ayrı okutur. Bellekte yalnızca okunan
  sayfaların küçültülmüş görüntüsü tutulur.
- **PDF:** Bütün sayfalar telefonda resme çevrilir (pdf.js), sonra resim okuyucusundan geçer. Bilgisayarda yazılmış
  PDF'ler düzgün ve yüksek çözünürlüklü resim verdiğinden en iyi sonuç bu yoldan alınır.
- **Resim:** Ekran görüntüsü, taranmış sayfa ya da düz çekilmiş fotoğraf. Dizekler, nota başları, kuyruklar,
  kirişler, noktalar, suslar, ölçü çizgileri, donanım ve değiştirici işaretler bulunur. Türk müziği koma işaretleri
  (AEU: koma, bakiye, küçük ve büyük mücenneb; diyez ve bemol) tanınır ve perde olarak kaydedilir.
- **Ses:** Ses dosyası (mp3, m4a, wav, ogg) ya da mikrofondan en çok 3 dakikalık dinleme. Ezgi notalara bölünür,
  tempo tahmin edilir, süreler ölçüye oturtulur, perdeler makam dizisine ya da en yakın AEU perdesine yerleştirilir.
  YouTube için: video başka bir cihazda ya da hoparlörde oynatılır, uygulama "Dinleyerek yaz" ile dinler.
- **Düzeltme ekranı:** Okunan notalar, düzeltilebilir bir nota şeridi olarak görünür. Resimden gelenlerde kaynak
  sayfa da görünür, her notanın üstünde bir kutu olur. Bir notaya dokunup perdesini, süresini ya da işaretini
  değiştirmek, silmek veya araya nota eklemek mümkündür. Süresi tutmayan ölçüler ve emin olunmayan notalar
  renkle işaretlenir. "Dinle" düğmesi düzeltilmiş ezgiyi çalar.
- **Nota türü:** "Türk müziği notası (olduğu gibi)" ya da "Piyano / konser notası (Sol klarnete çevir)". Resimde AEU
  işareti bulunursa Türk müziği varsayılır, yoksa son seçim hatırlanır. Ses her zaman duyulan sestir ve çalgının
  yazılı notasına çevrilir (`SK.T`).
- **Kaydet:** Ad, tempo, makam ve ölçü (ölçü çizgilerinden hesaplanır) ile "Kendi eserlerim"e eklenir. Bundan sonra
  eser, mevcut eserler gibi tempolu çalınır, takip edilir ve merdivende çalışılır.
- Bütün metinler iki dilli. İnternet izni eklenmez. Saf mantık Node'da test edilir.

## Hedef olmayanlar (bu işte)

- Elle yazılmış nota. Perspektifi bozuk, kıvrık sayfa fotoğrafları. (Yalnızca küçük eğiklik düzeltilir; öğrenciye
  "sayfayı düz çek, kırp" denir.)
- YouTube linkini yapıştırıp sesi indirme. YouTube kuralları buna izin vermiyor ve internet gerektiriyor.
- Çok sesli okuma: akorlarda en tiz nota alınır; piyano notasında yalnızca üst (Sol anahtarlı) dizek okunur, alt
  dizek atlanır. Sol anahtarı dışındaki anahtarlar okunmaz.
- Söz, başlık, usul ve tempo yazısı, nüans, legato yayları. (Eserin adı dosya adından önerilir:
  `hicaz_longa_…pdf` → "Hicaz Longa"; öğrenci değiştirebilir.)
- Volta (1. ve 2. bitiş), D.C. ve "Fine" yazısını okuma.
- Triole ve diğer düzensiz bölmeler resimde okunmaz; ölçü denetimi bu ölçüleri işaretler, öğrenci düzeltir.
  (Seste triole ızgarası vardır.)
- Süsleme işaretlerini (tr, mordan) resimden okuma.
- Seste kaynak ayırma: arkada yoğun eşlik varsa sonuç kötü olur; uygulama bunu söyler.
- PDF'in içindeki vektör nota simgelerini doğrudan okuma. PDF önce resme çevrilir. Gerçek örnekler resim yolunun
  yetmediğini gösterirse ayrı iş olarak ele alınır.

## Başarısızlık sayılacak şeyler

- Yanlış okunan notaların öğrenci görmeden esere kaydedilmesi. Kayıt yalnızca düzeltme ekranından yapılır; emin
  olunmayan yerler göze batacak biçimde işaretlenir.
- Uygulamanın internet izni istemesi ya da bir dosyanın cihazdan çıkması.
- Okuma sırasında arayüzün donması. Uzun işler bir Web Worker'da çalışır ve ilerleme gösterilir.
- Uygulamanın açılışının yavaşlaması. pdf.js yalnızca PDF seçilince yüklenir.
- Mevcut "Eser ekle" (metin, MusicXML, konser kutusu), Kayıt sekmesinin "Eserlere ekle" düğmesi ve eserlerin
  çalınmasının bozulması.

## Bileşenler

### `omr.js`: resimden notaya (saf, Node'da ve Worker'da çalışır)

Girdi: gri tonlu piksel dizisi `{ data:Uint8Array, width, height }`. Tarayıcıya bağımlılığı yoktur.

1. **İkilileştirme:** Taranmış ve ekran görüntülerinde Otsu, fotoğraflarda gölgeye dayanıklı yerel eşik (Sauvola).
   Hangisinin kullanılacağı resmin parlaklık dağılımından seçilir.
2. **Eğiklik:** ±5° içinde, yatay izdüşüm profilinin en sivri olduğu açı bulunur ve resim döndürülür.
3. **Dizek bulma:** Dikey siyah koşu uzunluklarından çizgi kalınlığı, beyaz koşulardan dizek aralığı (`sp`) bulunur.
   Satır yoğunluğu yüksek olan ve `sp` aralıklı 5'li çizgi grupları dizektir. Sonraki bütün ölçüler `sp` ile
   ölçeklenir.
4. **Sistemler:** Ortak ölçü çizgisiyle bağlanan dizekler aynı sistemdir. Sistem birden çok dizekliyse (piyano)
   yalnızca en üstteki okunur.
5. **Çizgi silme:** Dizek çizgilerindeki pikseller, üstünde ve altında siyah yoksa silinir. Böylece nota başları
   kopmadan çizgiler kalkar.
6. **Simgeler:** Bağlı bileşenler ve kalıp eşleştirme:
   - Dolu ve boş nota başı (kalıp, `sp` ölçeğinde), sap (≥ 2,5 `sp` dikey koşu), kiriş (saplar arasında kalın eğik
     şerit; sayısı süreyi verir), bayrak, nokta (nota başının sağındaki küçük leke).
   - Suslar (birlik, ikilik, dörtlük, sekizlik, on altılık), ölçü çizgisi (dizek yüksekliğinde dikey çizgi), Sol
     anahtarı, tekrar işareti (yalnızca uyarı için).
   - Değiştirici işaretler: ♯ ♭ ♮ ve SMuFL'deki 8 AEU işareti (U+E440–E447). Kalıplar iki kaynaktan gelir ve
     `omr.js` içinde küçük normalleştirilmiş bitmapler olarak durur:
     - serbest lisanslı müzik yazı tipleri (en az Bravura ve Leland, OFL), bir betikle çıkarılır;
     - **gerçek örnekler:** bir geliştirme betiği (`npm run omr-templates`) `testdata/omr/` içindeki sayfaları okur,
       tanıdığı simgeleri kırpar ve sınıfına göre kaydeder; kurucu yanlışları ayıklar. Türk müziği notalarındaki
       koma işaretlerinin çizimi Bravura'dan farklı olduğu için bu yol şart. Kırpılan küçük simgeler eserin
       kendisi değildir, depoya girebilir.
   - Her simge bir güven değeri taşır. Eşiğin altındakiler "emin değil" olarak işaretlenir.
7. **Donanım:** Anahtardan sonra, ilk notadan önceki değiştirici işaretler. Ölçü içi değiştiriciler ölçü sonuna kadar
   geçerlidir.
8. **Perde:** Nota başının dizekteki basamağı (Sol anahtarı) harfi ve oktavı verir. Değiştirici AEU işaretiyse koma
   tam olarak hesaplanır (`turkishAccidental`'ın tersi: doğalın koması + k). Düz ♯/♭ Türk müziği notasında küçük
   mücenneb ve bakiye kabul edilir (AEU yazımında bu ikisi düz işaretle aynı şekildedir). Sonuç `{ w, c }` olur.
9. **Süre:** Nota başı türü, kiriş ya da bayrak sayısı ve nokta. Dörtlük cinsinden `d`.
10. **Bağ ve tekrarlar** (örnekte hepsi var):
    - Uzatma bağı: aynı perdedeki iki komşu nota başını birleştiren yay bulunursa iki nota tek nota olur. Farklı
      perdeler arasındaki yay (legato) yok sayılır.
    - Ölçü tekrarı (%): önceki ölçünün notaları kopyalanır.
    - Tekrar çizgileri (‖: :‖), segno (𝄋) ve bölümler: okunan notalar bölüm işaretleriyle birlikte tutulur.
      Düzeltme ekranında **"Tekrarları aç"** seçeneği (varsayılan açık) eseri çalınacağı sırayla düzleştirir:
      tekrar çizgisi arası iki kez; bir bölümün sonundaki segno, segno işaretli bölüme döner ve o bölümün kapanış
      çizgisine kadar çalar (hâne–teslim düzeni). Kapalıyken nota yazıldığı gibi, düz kalır. Bu kural
      tasarımcının kararı; Türk müziği formlarındaki "hâneden sonra teslime dön" alışkanlığına göre seçildi.
    - Parantez içindeki hatırlatma işaretleri normal işaret gibi okunur (zaten ölçüdeki durumu tekrarlar).
11. **Ölçü denetimi:** Ölçü çizgileri arasındaki sürelerin en sık toplamı ölçü kabul edilir (4/4, 9/8 …). İlk ölçü
    eksik olabilir (anacrusis). Toplamı tutmayan ölçüler işaretlenir.

Çıktı: `{ notes:[{ w, c, d, rest, conf, box:{ page, x, y, w, h } }], bars:[{ from, to, ok }], meter, flags:[…],
staffSpace }`. `flags`: "tekrar işareti var", "piyano notası: alt dizek atlandı", "dizek bulunamadı" gibi
öğrenciye gösterilecek uyarılar.

**Çözünürlük:** PDF sayfaları `sp` yaklaşık 14 px olacak ölçekte çizilir. Ekran görüntüsünde `sp` 8 px'in altındaysa
okuma kalitesinin düşeceği söylenir.

### Sesten notaya: `skills.js`

Mevcut parçalar kullanılır: `ornamentTrack(pcm, sr, { T: SK.T, hopMs:10 })` → `runNotes(track)`.

- **`quantizeRun(notes, opts) → { notes:[{ w, c, d, rest, conf }], tempo, meter }`**
  - Tempo: 50–200 vuruş/dk arasındaki adaylar denenir. Nota başlangıçlarını çeyrek vuruşluk ya da üçte bir vuruşluk
    ızgaraya oturtmanın hatası en küçük olan seçilir. 60–120 arasına hafif öncelik verilir. `opts.tempo` verilirse
    tahmin edilmez (düzeltme ekranından tempo değiştirilince yeniden hesaplanır).
  - Süre: bir notanın başından sonrakinin başına kadar olan süre ızgaraya yuvarlanır. Yarım vuruştan uzun boşluk sus
    olur. Ondalıklı vuruşun sekizde birinden kısa notalar (süsleme, geçiş) bir sonraki notaya katılır.
  - Perde: `opts.makam` varsa `contextPerde` ile o makamın dizisine, yoksa 1,5 komadan yakınsa en yakın AEU
    perdesine yerleşir, değilse tamperede kalır.
  - `conf`: perdenin kararlılığı ve ızgaraya uzaklık.
  - Ölçü: v1'de 4/4 varsayılır; düzeltme ekranından değiştirilir.
  - **Kaydın akordu** (tasarımcının kararı): YouTube kayıtları başka ahenkte ya da A440'tan biraz kayık olabilir.
    Perdelere oturtmadan önce bütün notaların en yakın AEU perdesinden sapmalarının ortancası bulunur ve bu sabit
    kayma çıkarılır (en çok ±26 koma, yani yarım ses ötesine gitmez). Sonuç ekranında "kayıt 3 koma pes akortlu"
    gibi gösterilir. Amaç, kayıtla birlikte çalınabilecek yazılı notayı vermektir; başka bir yerden başlatmak
    isteyen öğrenci düzeltme ekranındaki "aktar" denetimini kullanır.
- **Ses alma:**
  - Dosya: `decodeAudioData` → tek kanal → 22 050 Hz'e yeniden örnekleme (`OfflineAudioContext`).
  - Dinleyerek yaz: mikrofondan en çok 3 dakika, 22 050 Hz'e indirgenerek tutulur. `SK.pcmCapture`'ın 30 sn sınırı
    bir parametreyle uzatılır. Dinlerken hoparlör modu ayarı (yankı giderme kapalı) kullanılır.
- Kayıt sekmesindeki mevcut "Eserlere ekle" düğmesi de bu yolu kullanır: bugün bütün notalar 1 dörtlük kaydediliyor,
  artık süreler ölçüye oturur ve sonuç düzeltme ekranında açılır.

### Düzeltme ekranı: "Çevir" sekmesi (`pieces.js` ya da yeni `convert.js`)

- **Nota şeridi:** Her nota bir çip (ad ve süre: "Segâh ♩", "Re5 ♪."). Emin olunmayan çipler sarı, süresi tutmayan
  ölçünün çipleri turuncu çerçeveli. Ölçüler arasında ince ayraç.
- **Kaynak görünümü** (yalnızca resim ve PDF): Sayfa resmi, kaydırılıp yakınlaştırılabilir. Notaların üstünde
  kutular, renkleri çiplerle aynı. Kutuya dokunmak çipi seçer, çipe dokunmak kutuya kaydırır.
- **Seçili nota için düğmeler:** ▲ ▼ (bir dizek basamağı), değiştirici (döngü: yok, ♯, ♭, ♮, koma işaretleri),
  süre (yarıya, iki katına, nokta), sus yap, sil, önüne nota ekle, sonrakiyle birleştir.
- **Metin görünümü:** Aynı notalar mevcut nota metniyle (`scoreToText`) gösterilir ve elle düzenlenebilir. İki
  görünüm birbirini günceller. İleri kullanıcı için kısa yol; çiplerle yapılamayan her şey buradan yapılır.
- **Aktar** (tasarımcının kararı): seçili notaları ya da hepsini bir oktav yukarı/aşağı taşıma; hepsini perde perde
  (bir AEU perdesi ya da bir yarım ses) yukarı/aşağı aktarma.
- **Üst satır:** Nota türü seçimi (Türk müziği / konser), makam, tempo, ölçü. Seste tempo değişince yeniden ızgaraya
  oturtulur (öğrencinin elle yaptığı düzeltmeler varsa önce sorulur).
- **Dinle:** Düzeltilmiş ezgiyi mevcut ses üretimiyle çalar; çalan çip vurgulanır.
- **Kaydet** (aralık kuralı tasarımcının kararı): Konser notasında önce `concertToWritten`'ın oktav kuralı uygulanır.
  Yine de Mi3–Mi♭7 dışında kalan nota varsa (Türk müziği notasında ve seste de) bu çipler kırmızı olur ve kayıt
  engellenir; uyarının yanında "taşanları bir oktav kaydır" ve "hepsini bir oktav kaydır" düğmeleri çıkar. Notalar
  sessizce atılmaz. Sonra mevcut `addUser` ile eklenir ve "Etüt ve eserler" sekmesi o
  eserle açılır.
- Öğrenci okuma bitmeden ekrandan çıkarsa iş iptal edilir. Kaydedilmemiş düzeltmeler, sekmeye dönünce aynı yerde
  durur (oturum boyunca).

### pdf.js

- `pdfjs-dist` sabit bir sürümle geliştirici bağımlılığı olarak eklenir. Gereken dosyalar bir betikle (`npm run
  vendor`) `vendor/pdfjs/` altına kopyalanır, depoya girer. `build-web.js` ve `sw.js` önbellek listesi güncellenir.
- Yalnızca PDF seçilince `import()` ile yüklenir. Sayfalar `OffscreenCanvas`'a (yoksa normal canvas) çizilir, gri
  tona çevrilir ve Worker'a gönderilir.
- Lisans (Apache 2.0) README'deki kaynaklar bölümüne yazılır.

## Aşamalar

Her aşama kendi başına kullanılabilir ve ayrı commit'lenir:

Proje sahibinin örneği PDF olduğu için, ilk aşama bitince 2 ve 3 birlikte ele alınabilir; ilk hedef Hicâz Longa'nın
okunmasıdır.

1. **Düzeltme ekranı ve ses:** "Çevir" sekmesi, nota şeridi, metin görünümü, ses dosyası, dinleyerek yaz,
   `quantizeRun`, Kayıt'taki "Eserlere ekle"nin bu yola bağlanması. Mevcut kodun çoğunu kullandığı için ilk bu.
2. **Resim okuyucu:** `omr.js`, kalıp çıkarma betiği, Worker, kaynak görünümü ve kutular, resim seçme.
3. **PDF:** pdf.js, sayfaların resme çevrilmesi, çok sayfalı okuma.
4. **Dayanıklılık:** fotoğraf (Sauvola, eğiklik), düşük çözünürlüklü ekran görüntüleri, gerçek örneklerle eşik
   ayarı.

## Test

- **`testomr.js`** (`test.js`'ten çağrılır): Bilinen nota listelerinden, Bravura yazı tipiyle SVG nota sayfaları
  üretilir ve `sharp` ile PNG'ye çevrilir (yalnızca geliştirmede; uygulamaya girmez). Aynı sayfalar bozulur:
  bulanıklık, gürültü, 2° eğiklik, ekran görüntüsü çözünürlüğüne küçültme. Okunan notalar beklenenle karşılaştırılır.
  - Ölçüt: temiz sayfada nota başına en az %98, bozulmuş sayfalarda en az %90 doğru (perde ve süre birlikte). Sonuç
    oranla yazdırılır.
  - Ayrı ayrı: dizek aralığı bulma, iki dizekli sistemde alt dizeğin atlanması, donanımın ölçü boyunca geçerliliği,
    8 AEU işaretinin her biri doğru komaya, noktalı ve kirişli süreler, sus türleri, ölçü denetiminin eksik ölçüyü
    işaretlemesi.
- **Gerçek örnekler:** `testdata/omr/` altında; her örnek için aynı adla beklenen nota metni (`.txt`, tekrarlar
  açılmadan, yazıldığı gibi). Bu klasör `.gitignore`'a eklenir, çünkü örnekler telifli olabilir (ilk örnek öyle).
  Klasörde yalnızca bir `README.md` depoya girer; içinde örneklerin nereden indirileceği yazar. Test, klasörde
  örnek varsa koşar ve doğruluk oranını yazdırır, yoksa atlar. İlk örnek: Hicâz Longa (yukarıda). Beklenen nota
  metnini kurucu nota sayfasından elle yazar.
  - Ölçüt: Hicâz Longa'da nota başına en az %95 doğru (perde ve süre birlikte), donanım ve bütün koma işaretleri
    doğru.
- **Ses:** Mevcut sentetik ses üreticisiyle bilinen bir ezgi (farklı tempolar, noktalı ritim, triole, süsleme
  notası, sus) → `quantizeRun` → tempo ±%5 içinde, süreler ve perdeler doğru. Makam verilince perdelerin diziye
  oturduğu.
- **Arayüz:** Tarayıcı panelinde sentetik bir sayfa resmi ve sentetik ses dosyasıyla: okuma ilerlemesi, kutu ve çip
  seçimi, her düzeltme düğmesi, metin ile çiplerin eşleşmesi, kaydetme, eserin "Etüt ve eserler"de açılması, telefon
  boyutu ve İngilizce. Konsolda hata olmaz.

## Belgeler

- `docs/BACKLOG.md`: yeni bölüm. Gerçek örneklerle eşik ayarı "İnsan gerektiren işler"e eklenir.
- `README.md`: Çevir sekmesi ve pdf.js kaynağı.
- Çevir sekmesine "Nasıl kullanılır?" notu (diğer sekmelerdeki gibi). İçinde: sayfayı düz ve tam çek, PDF en iyi
  sonucu verir, YouTube'u başka cihazda aç ve telefonu hoparlöre yaklaştır, okunanı mutlaka dinleyip kontrol et.

## Riskler

- **Türk müziği notalarının yazı tipleri.** Her arşivin (neyzen.com, Mus2, Finale) koma işareti çizimi farklı
  olabilir. Kalıplar yazı tiplerinden ve gerçek örneklerden alınır; yeni bir kaynak tutmazsa onun örneği
  `testdata/omr/`'a eklenip kalıplar yeniden çıkarılır.
- **Fotoğraflar.** Klasik yöntem eğri ve gölgeli fotoğraflarda zayıf kalır. Bu, "Nasıl kullanılır?" notunda açıkça
  söylenir.
- **YouTube sesi.** Yoğun eşlikli kayıtlarda ezgi bulunamayabilir. Ses güveni düşükse sonuç ekranında "bu kayıtta
  ezgi net duyulmuyor" uyarısı çıkar.

## Kurucuya kalanlar

- Kalıp eşleştirme yöntemi (normalleştirilmiş bitmap ile en yakın komşu, ya da biçim özellikleri) ve güven eşikleri.
- Çip, kutu ve düğmelerin görünümü; telefonda kaynak görünümü ile şeridin yerleşimi.
- Worker ile ana iş parçacığı arasındaki ileti biçimi.
- pdf.js'in tam sürümü ve hangi dosyalarının gerektiği.
- Düzeltme ekranının `pieces.js` içinde mi, ayrı bir `convert.js` dosyasında mı olacağı.
