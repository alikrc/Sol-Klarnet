# Sol Klarnet — Backlog

## ÖNCELİKLİ — proje sahibinin istekleri (3 Kasım 2026)

Proje sahibi: "Uygulama seviye belirletip ona göre adım adım ilerletmeli; bir hoca gibi elinden tutup içerik arasında
kademe kademe götürmeli. Uygulama freemium olabilir, bazı yerler premium satılabilir." Bu iki madde diğer işlerin önünde.

### 1. Kademeli hoca akışı — sürüyor

**Bugünkü durum:** 87 ders düz bir listede, dersler bitirilince açılıyor ("tüm dersleri aç" kutusu her şeyi açıyor).
"Bugünün çalışması" ısınma, tekrar ve bilinen konulardan her gün kuruluyor. Yol haritasında altı aşama ve ölçülen
kilometre taşları var ama bunlar yalnızca gösterge: hiçbir dersi kilitlemiyor. Ünite sınavı yalnızca rozet veriyor.
Kullanıcıya "şimdi şunu çalış, çünkü…" diyen tek bir yönlendirici yok; ne yapacağını listeden kendisi seçiyor.

**Hedef:** Uygulama seviyeyi ölçsün, kullanıcıyı her gün tek bir sıradaki adımla, nedenini söyleyerek götürsün;
bir kademeyi ancak o kademenin becerileri ölçülerek tuttuğunda (sınav ve kilometre taşları) sonrakine geçirsin.
Hocanın yaptığı gibi: önce ısınma ve tekrar, sonra yarım kalan iş, sonra yeni konu; zayıf kalan beceriye geri dönme.

Aşamalar:

- **A. Seviye belirleme** — yapıldı (3 Kasım). Karşılamada isteğe bağlı çalma sınaması: 12 nota dört grupta (pes/orta,
  boğaz, register geçişi, klarino); geçilen grupların Temeller ve Register dersleri bitmiş sayılır, ilk notalarda
  zorlanana Başlarken önerilir. Yalnızca notanın çıktığı ölçülüyor (ses kalitesi ve akort değil). Eksik: ritim/okuma
  sınaması (nota okuyabiliyor mu), makam çalanlar için makam sınaması; sınamayı karşılama dışında yeniden yapma
- **B. "Hocan diyor ki" kartı** — yapıldı (3 Kasım). Dersler'in en üstünde tek bir sıradaki adım ve nedeni
  (`roadmap.js` `coachNext`): yarım kalan ders/sınav → bugünün çalışması (ısınma ve vadesi gelen tekrarlar; yalnız
  gerçekten çalınmış ders varsa) → dersleri bitmiş ünitenin sınavı (hangi üniteleri açacağıyla) → kademenin dersleri
  bittiyse eksik kilometre taşı (şu anki değer ve hedef, alıştırmaya git) → yeni ders/yeni ünite → kalan kilometre
  taşları. Liste kartın altında duruyor
- **C. Kademe kapısı (rehberli mod)** — yapıldı (3 Kasım). `lessons.js` `GATE_AFTER`/`gateFor`: Temeller ←
  Başlarken sınavı, Register ← Temeller sınavı; teknik, hız, süsleme, makam ve Trakya ← Register sınavı; İleri ← Makam
  sınavı. Kilitli derse dokununca hangi sınavın eksik olduğu ve sınava giden düğme. Dersler listesinin altında "rehberli
  ilerleme" kutusu (varsayılan açık, `lesson.guided`); "tüm dersleri aç" ve bitmiş dersler eskisi gibi. O üniteden
  önceden ders bitirmiş kullanıcıda kapı yok. Karşılamada atlanan/sınamayla geçilen ünitelerin sınavı da geçilmiş sayılır.
  `nextLesson` ders kalmadıysa açık sınavı döndürür (önceden "bütün dersleri bitirdin" diyordu). Uzman görmeli: kapı
  sırası (ör. makamın Register sınavına bağlı olması, İleri'nin Makam sınavına); kilometre taşları henüz kapı değil,
  yalnız kartta öneri
- **D. Zayıf beceriye dönüş** — yapıldı (3 Kasım), `roadmap.js` `weakSkill`: uzun ton puanı, ses kararlılığı
  (yayılım), ritim ve taksim puanında son 4 haftanın ortalaması önceki 4 haftaya göre eşikten (8 puan; yayılımda 0,15
  koma) fazla kötüleştiyse ve o beceri bugün çalışılmadıysa, kart ısınmadan sonra "önce bunu toparlayalım" deyip
  alıştırmayı açar. Her pencerede en az 3 kayıt ister. Eksik: ders özetindeki "en az farkla geçilen adım" henüz karta
  gelmiyor; eşikler gerçek kullanımla gözden geçirilmeli
- **E. Kademe raporu** — yapıldı (3 Kasım). Yol haritasındaki bir aşama (dersleri ve kilometre taşları) bitince hoca
  kartı bir kez rapor gösterir: kaç günde tamamlandığı (gerçekten çalınmış derslerin ilk ve son bitiş günü), ölçülen
  kilometre taşları ve sıradaki kademenin hedefi; "Sıradaki adım" ile kapanır (`rm.reported`). Eksik: önceki kademeye
  göre beceri farkı (ör. uzun ton puanının kademe başı ve sonu)

### 2. Freemium — öneri, proje sahibinin kararı bekleniyor

**Önce lisans engelleri** (`docs/LISANSLAR.md`): ücretli ya da uygulama içi satışlı sürümde SymbTr nota arşivi (CC
BY-NC-SA, ticari kullanım yok) ve WFG parmak tabloları (açık lisans yok) izin alınmadan kullanılamaz; neyzen.com ve
projetsm.com için de izin gerekir. Bu izinler çıkmadan ücretli sürüm yayımlanmamalı. Seçenekler: MTG ve WFG'den yazılı
izin; ya da bu içerikleri yalnız ücretsiz katmanda tutmak da yetmez (NC şartı uygulamanın tamamının ticari olmasına
bakar, hukuki görüş alınmalı).

**Önerilen ayrım (karar proje sahibinin):**

- Ücretsiz: akort (AEU/icra, makam bağlamı), parmak şeması ve tablosu, Başlarken ve Temeller üniteleri, seviye
  sınaması ve hoca kartı (ilk kademe), metronom ve dron, günlük çalışma (ilk kademe içeriğiyle)
- Premium: Register'dan sonraki üniteler (teknik, hız, süsleme, makam, Trakya, ileri) ve sınavları, eşlik grubu,
  kulaktan çıkar, Çevir (nota okuyucu), kayıt karşılaştırma ve haftalık gelişim, taksim değerlendirmesi
- Teknik: ödeme Google Play Billing / App Store uygulama içi satın alma ile (Capacitor eklentisi, ör. RevenueCat ya da
  cordova-plugin-purchase); sunucu yok, satın alma cihazda mağazadan doğrulanır. Web sürümü (PWA) ücretsiz kalabilir ya
  da yalnız tanıtım olur. Kodda tek bir `entitlement` katmanı (premium mu) ve özellik başına kapı; kapıda "neden
  premium, ne kazanırsın" ekranı

**Proje sahibine sorular:** (1) Abonelik mi (aylık/yıllık) tek seferlik satın alma mı, fiyat? (2) Hangi bölümler
premium (yukarıdaki öneri uygun mu)? (3) Reklam olacak mı (öneri: yok)? (4) SymbTr ve WFG için izin istenecek mi,
yoksa ticari sürümde arşiv ve WFG tabloları çıkarılıp yerine kendi içerik mi konacak? (5) Play Console ve App Store
geliştirici hesapları hazır mı? Bu cevaplar gelmeden ödeme kodu yazılmayacak; kademe akışı (madde 1) premium ayrımına
uygun kurulacak (kademe = satış sınırı olabilir).

## Uzman inceleme bulguları — sürüyor (2 Kasım 2026)

Bir Türk musikisi ve Sol klarnet uzmanı gözüyle yazılmış inceleme listesi. Yeni özellikten önce mevcut içeriğin müzikal
doğruluğu, gerçek Sol klarnete uygunluğu ve eğitim kalitesi. Çalışan özellikler bozulmayacak, mimari gereksiz yere
değişmeyecek, mobil uyum korunacak.

**Yöntem:** Tek seferde değiştirilmeyecek. Önce kod incelenip her madde doğrulanacak; her madde için "mevcut durum /
önerilen çözüm" listesi çıkarılıp P0–P1–P2 sırası kesinleşecek, sonra aşama aşama uygulanacak. Her aşamanın sonunda:
değişen dosyalar, yapılanlar, yapılan denetimler (projede test yok, bkz. kullanıcı kararı; tarayıcıda deneme ve ölçüm
betikleri) ve gerçek klarnetle denenmesi gerekenler ayrıca yazılacak. Emin olunmayan müzikal bilgi kesin gibi sunulmayacak;
teori, icra pratiği ve öğretmen tavsiyesi ayrı gösterilecek; doğrulanmamış her şey açıkça işaretlenecek.

### Kod incelemesi: mevcut durum ve çözüm

| # | Madde | Mevcut durum (kodda doğrulandı) | Önerilen çözüm | Öncelik |
|---|---|---|---|---|
| 1.1 | Gerçek kayıtla ses analizi | `audio-check` Iowa'nın gerçek Si♭ klarnet kayıtlarında 138/139 nota doğru (pp/mf/ff). Gürültü, telefon mikrofonu, vibrato ve Sol klarnetin pes bölgesi (duyulan Si2–Re3) hiç denenmemiş; betiğin zinciri uygulamadaki oktav korumasını içermiyor. Türk Sol klarneti kaydı yok | Betiğe koşul sınaması: gerçek kayıtlara telefon mikrofonu süzgeci, gürültü (SNR 20/10 dB), vibrato, oda yankısı ve 3 yarım ses pesleştirme uygulanır; sonuç "gerçek tını + benzetilmiş koşul" diye ayrı raporlanır. Zincir uygulamayla eşitlenir. Çıkan hatalar perde bulucuda düzeltilir | P0 |
| 1.2a | Koma işaretlerini ayırma, Leland çizgili bemol | 9 değiştirici sınıfı, kalıp eşlemesi (Jaccard). Leland'ın çizgili bemolü küçük boyutta düz bemol okunabiliyor (backlog'da bilinen) | Yazı tiplerinden çizilen işaretlerle karışıklık tablosu; çizgili/düz bemol için ayırıcı özellik (sapı kesen çizgi) | P0 |
| 1.2b | Güven puanı | Notada `conf` var, arayüzde yalnızca <0,6 "sarı" | Seçili notada ve özet satırında güven yüzdesi; çipin açıklamasında yüzde | P0 |
| 1.2c | Elle nota/koma düzeltme | Var: ▲▼, oktav, "♯ ♭" düğmesi 9 koma değerini sırayla dolaşıyor | Doğrudan seçim: değiştirici listesi (adı ve koma değeriyle) | P0 |
| 1.2d | Uzun PDF sınırı | Sayfa aralığı soruluyor ama üst sınır yok; her sayfa 2480 px (A4'te ~35 MB tuval, sayfa sonrası boşaltılıyor) | Bir okumada en çok 20 sayfa, büyük dosyada (>40 MB) uyarı; aralık bu sınıra göre kısılır | P0 |
| 1.2e | D.S. gibi yazılı işaretler | Segno simgesi ve "segno'ya dön" okunuyor; yazıyla D.S./D.C./Fine/Coda okunmuyor, kullanıcıya söylenmiyor | Sonuç ekranında uyarı ve düzeltme ekranında seçili notaya işaret ekleme (segno, D.S., tekrar) | P0 |
| 1.3 | Çeyrek ses parmakları | 57 parmak WFG Oehler/Albert tablosundan; parmak kartında "¼ pes/tiz" düğmeleri alternatiflerle aynı sırada, doğrulanmamış uyarısı yok | Ayrı "Çeyrek ses (doğrulanmamış)" grubu; her parmakta kaynak, durum, bilinen not; ses kalitesi/geçiş/bağlam bilgisi yoksa "bilinmiyor" yazılır, uydurulmaz. Kullanıcı kendi çalgısında denediğini işaretleyebilir; Uzman kontrolünde kalite ve geçiş puanı toplanır | P0 |
| 2.1 | İcra perdesi | `ICRA` 6 makamda tek değer (ör. Uşşak Segâh −1,5); kaynaklarda aralık var (1–2 koma, 2–2,5 koma). Yardım metni "İcra ustaların gerçekte çaldığı perdedir… Emin değilsen İcra'yı seç" diyor | Değer + aralık; metin "yaklaşık, icracıya göre değişir" diye düzeltilir; kullanıcı (öğretmeninin) perdesini makam başına ayarlayabilir; çıkış/inişte farklılık olabileceği yazılır (veri uydurulmaz) | P1 |
| 2.2 | Makam eğitimi | 20 makam, durak/güçlü/yeden/seyir TDV'ye göre, kaynaklı. Karşılaştırma, çıkış/iniş ezgi örneği yok | Benzer makam karşılaştırması (aynı dizi farklı seyir: Uşşak/Bayâtî, Hicaz/Hümâyun/Uzzâl…) dizilerden üretilir; ezgi örnekleri kaynağı olan eserlerden (SymbTr) seçilir | P1 |
| 2.3 | Usul ve ritim | Usul metinlerinde "vuruş" hem zaman hem darb anlamında (Sofyan "dört vuruş: düm iki vuruş sürer"). Halk ritimleri tek kalıp, yalnızca kodda "hocaya kontrol ettirilmeli" notu | Zaman/darb/düm/tek/çevrim açıklaması; her usulde "N zaman, M darb"; halk ritimlerinde "yaygın bir çalış, yöreye ve icracıya göre değişir" | P1 |
| 3 | Başlangıç dersleri | "Başlarken" 4 ders (tanı ve kur, duruş-ağız-nefes, nota, ritim) + "İlk ses". Nefes "karından al", kamış "2–2½ numara" kesin kural gibi | 10 ders yapısına bölme; nefes (alt kaburgalar, rahat alış, kontrollü akış), dudak (gevşeklik/sızdırmazlık dengesi), kamış (bek açıklığı, marka, kişi) metinleri | P1 |
| 4 | Ses ve video | Örnek sesler Iowa Si♭ klarnetinden perde ayarlı; arayüzde yalnızca Ayarlar'daki teşekkür satırında. Videolar tek kanal (Çorlu Klarnet Üstatları) | Örnek sesin yanında "Si♭ klarnet kaydı, perde ayarlı; Sol klarnet tınısı değil". Video kaynakları ve üslup ayrımı (klasik / Trakya-Roman / modern) etiketlenir; yeni kayıt ve video proje sahibine | P1 |
| 5 | Öğrenme deneyimi | Karşılama akışı, yol haritası, aralıklı tekrar, ünite sınavları, kayıt karşılaştırma var. Taksim aşamaları ve ses kararlılığı takibi kısmen (uzun ton puanı) | Ders sonu değerlendirme özeti, ses kararlılığı ve ritim doğruluğu eğrileri, taksim aşamaları | P2 |
| 6 | Lisans | SymbTr CC BY-NC-SA 4.0 arşivde belirtiliyor; ücretli/reklamlı dağıtımda NC sorunu yazılı değil. WFG ve neyzen izni "İnsan gerektiren işler"de | `docs/LISANSLAR.md`: her kaynak, lisansı, ticari kullanım durumu, yapılacak iş | P1 |

### Aşamalar

1. **P0 — ses analizi, OMR, çeyrek ses parmakları** — tamamlandı (2 Kasım 2026), ayrıntı aşağıda
2. **P1 — icra perdesi, usul, başlangıç dersleri, ses etiketleri, lisans belgesi** — tamamlandı (2 Kasım 2026), ayrıntı aşağıda
3. **P1 — makam karşılaştırma ve örnekler, videolar** — tamamlandı (2 Kasım 2026), ayrıntı aşağıda
4. **P2 — öğrenme deneyimi** — tamamlandı (3 Kasım 2026), ayrıntı aşağıda
5. **Kalanlardan P0 — koşul sınaması, belgelerde Si♭ dili, OMR karışıklık tablosu** — tamamlandı (3 Kasım 2026), ayrıntı aşağıda

### Aşama 1 (P0) — tamamlandı (2 Kasım 2026)

**Değişen dosyalar:** `core.js`, `scripts/audio-check.js`, `omr.js`, `convert.js`, `app.js`, `index.html`, `app.css`,
`i18n.js`, `testdata/README.md`, `testdata/omr/README.md`.

- **Perde bulucu gürültüde oktav/onikili yanılgısı** (`core.js` `detectPitch`, `SUB_FLOOR`): alt harmonik denetimi oda
  gürültüsünün pes bölgedeki enerjisini temel ses sanıyordu; gerçek klarnet kayıtlarına benzetilmiş 10 dB SNR gürültüde
  doğru nota %16,5'ti. Aday frekans artık Hann penceresinin ±2 kutudaki sıfırlarında ölçülen düzeyin 3 katı olmalı:
  %99,3. Zayıf temel sesli (sert telefon süzgeci) durumdaki koruma aynı kaldı (66 notada 57, denetim kapalıyken 48)
- **Koşul sınaması** (`npm run audio-check -- testdata/iowa --kosul`): Iowa'nın gerçek Si♭ klarnet kayıtlarına telefon
  mikrofonu, gürültü, vibrato, yankı ve Sol klarnet pesliği benzetilir; çıktı "kayıtlar gerçek, koşullar benzetim" der.
  Betiğin zinciri uygulamanın oktav korumasını da içeriyor. Sonuçlar `testdata/README.md`'de
- **Çizgili bemol** (`omr.js` `hiddenSlash`, `flat_slash`): çizik dizek çizgisiyle birlikte siliniyordu; özgün resimde
  sapın solundaki kalınlıkla bulunuyor. Batı notasında ♭ sayılır, Türk notası kararını değiştirmez. Ayrıntı
  `testdata/omr/README.md`
- **Düzeltme ekranı** (`convert.js`): bilgi satırında ortalama okuma güveni ve %60 altı nota sayısı; çipin üstünde ve
  seçili nota satırında güven yüzdesi; değiştirici listesi (AEU adları ve koma değeriyle, konser notasında ♮ ♯ ♭);
  "İşaret" listesi (segno, D.S./D.C., Fine, tekrar başı/sonu, kaldır). Yazıyla yazılan D.S./D.C./Fine'ın okunmadığı her
  resim okumasında söylenir; Coda desteklenmiyor
- **Uzun PDF** (`CV_PAGE_LIMIT` = 15): bir okumada en çok 15 sayfa (sayfa başı ~9 MB gri resim); aralık sorusu buna göre
  kısılır, resim seçiminde de sayılır, aşılınca düzeltme ekranında yazar
- **Çeyrek ses parmakları** (`app.js` `showFingerings`): parmak kartında ayrı "Çeyrek ses · doğrulanmamış" grubu; her
  çeyrek seste kaynak (WFG, A. Wendl) ve "Türk Sol klarnetinde denenmedi; ses kalitesi, geçiş ve kullanım yeri
  bilinmiyor". Bu bilgiler uydurulmadı. Kullanıcı kendi çalgısında "çalışıyor/çalışmıyor" ve ses (temiz / idare eder /
  zayıf) işaretleyebilir (`sk.qt.mine`, yalnız cihazda; düğmede ✓/✗). Alternatif parmaklarda da "WFG'den, doğrulanmadı"
- **Yapılan denetimler:** `audio-check` temiz ve 9 koşulda; sentetik sayfalarda değiştirici okuma (Bravura/Leland, üç
  ölçek); Hicâz Longa gerçek sayfası (228/228, pdf.js ile çıkarılan resim); tarayıcıda parmak kartı (grup, uyarı, kişisel
  işaret, kayıt) ve Çevir'de sentetik Leland sayfası (16/16 nota, güven, değiştirici listesi, D.S. ve segno ekleme),
  telefon genişliğinde taşma yok, konsolda hata yok
- **Gerçek klarnetle denenmeli:** gerçek Sol klarnet kayıtlarıyla `audio-check` (hâlâ hiç yok); telefonda gürültülü
  odada akort göstergesi (yeni gürültü denetimi pes notalarda oktav korumasını zayıflatıyor mu); pp pes notaların
  telefonda görünüp görünmediği; 57 çeyrek ses parmağı (uzman); gerçek Leland/Bravura basılı nota fotoğraflarında
  çizgili bemol

### Aşama 2 (P1) — tamamlandı (2 Kasım 2026)

**Değişen dosyalar:** `learn.js`, `app.js`, `index.html`, `app.css`, `i18n.js`, `usuller.js`, `lessons.js`,
`lessonview.js`, `sorunlar.js`, `skills.js`; yeni `docs/LISANSLAR.md`, `docs/lisans-besteciler.csv`.

- **İcra perdesi** (`learn.js` `ICRA_INFO`, `setCustomIcra`): icra düzeltmesinin yanında kaynağın aralığı ve varsa
  çıkış/iniş farkı gösteriliyor. Uşşak ailesinde Segâh: −1,5 (−2 ile −1 arası; çıkarken ≈ −1, inerken ≈ −2, Gürbüz 1983
  ölçümü); Hüzzam'da Hisar +1 ile +1,5; Saba'da Hicaz +2 ile +2,5. Ölçüm yine ortadaki değeri kullanıyor; çıkıp inerken
  ayrı hedef yok (kaynak yalnız Segâh için var). Yardım metni "ustaların gerçekte çaldığı perde, emin değilsen İcra"
  yerine "yaklaşık; icracıya, ezgiye ve tavra göre değişir" diyor
- **Kendim akordu:** akort ekranında üçüncü seçenek. Seçili makamın her perdesi için öğretmeninin ya da örnek aldığı
  icracının sapması girilir (−3…+3 koma, 0,5 adım, `sk.tune.custom`); akort ve alıştırmalar bu hedeflere göre ölçer,
  "İcra değerlerine dön" sıfırlar
- **Usul** (`usuller.js`): "Kavramlar" kutusu (zaman, darb, düm, tek, te-ke, usul çevrimi); başlıkta "4/4 · 4 zaman · 3
  darb". Sofyan metni zaman/darb farkını anlatıyor, "vuruş" yerine zaman ya da darb. Oyun havası usullerinde "yaygın bir
  çalış; yöreye, icracıya ve oyuna göre değişir, tek doğru kalıp yok"
- **Başlangıç dersleri** (Başlarken ünitesi, 12 ders): parçalar ve montaj → kamış seçimi ve takma (yeni) → oturuş ve
  tutuş → sol ve sağ el (yeni) → ağızlık ve dudak (yeni) → ilk ses (Temeller'den taşındı) → uzun ses (yeni) → dil ile
  başlatma (yeni) → ilk geçişler (yeni) → nefes ve cümleleme (yeni) → nota okuma → ritim. Nefes: alt kaburgalar, rahat
  alış, kontrollü akış ("karından" sözünün neyi anlattığı açıklanıyor). Dudak: gevşeklik ile köşelerdeki sızdırmazlık
  dengesi; Türk tavrındaki esneklik "üslup farkı, kural değil". Kamış: numara markaya ve bek açıklığına göre değişir,
  kulakla ve hocayla seçilir. Var olan derslerin kimliği ve adım sayısı aynı kaldı (eski ilerleme korunur); yeni dersler
  teknik ünitesinin kilidini etkilemesin diye Başlarken'de. Toplam ders 84. Sorunlar sayfasının nefes ve gıcırtı
  bağlantıları yeni derslere yönlendi, nefes tavsiyeleri aynı dile çekildi
- **Örnek ses etiketi:** derslerin "Dinle" adımında ve Hakkında'da "Si♭ klarnet kaydı, perdesi ayarlı; Sol klarnetin
  tınısı değil"
- **Lisanslar** ([LISANSLAR.md](LISANSLAR.md)): her kaynak, lisansı, ücretsiz/ticari durumu ve yapılacak iş. SymbTr NC
  şartı ticari sürümle çelişir; eser telifleri SymbTr lisansından ayrı. [lisans-besteciler.csv](lisans-besteciler.csv):
  502 besteci, eser sayıları ve formlar; ölüm yılı ve telif durumu sütunları doldurulmalı (363 güfte yazarı ayrıca)
- **Yapılan denetimler:** tarayıcıda akort ekranı (icra aralığı metni, Kendim düzenleyicisi, kayıt), usul sayfası
  (Sofyan, Karşılama, kavramlar), yeni derslerin sırası ve içeriği, "Dinle" etiketi; konsolda hata yok. Node'da
  `tuningCtx`/`perdeTarget` Kendim modu ve ders sırası
- **Uzman/hoca görmeli:** yeni 7 dersin metinleri (özellikle oturuş açısı, dudak ve nefes anlatımı, Albert el
  pozisyonları); Kendim akordunun hocalar için kullanışlı olup olmadığı; oyun havası çalışlarının "yaygın" sayılabilirliği
- **Yapılmadı (aşama 3–4):** makam karşılaştırması ve ezgi örnekleri, taksim–makam bağı, kısa konu videoları ve
  üslup etiketleri (aşama 3'te yapıldı), P2 öğrenme deneyimi. Yeni gerçek Sol klarnet kayıtları ve videolar proje sahibine bağlı

### Aşama 3 (P1) — tamamlandı (2 Kasım 2026)

- **Değişen dosyalar:** `learn.js`, `skills.js`, `drills.js`, `trainers.js`, `teori.js`, `videos.js`, `lessonview.js`,
  `app.css`, `sw.js` (önbellek v63)
- **Benzer makamlar** (`learn.js` `similarMakams`): aynı durakta karar veren ve dizisi (çıkış + iniş, oktav farkı yok
  sayılarak) en çok iki perdeyle ayrılan makamlar, uygulamadaki dizilerden hesaplanır; elle yazılmış iddia yok. Dizi
  sekmesinde "Makamı tanı" bölümü: her benzer makam için ayıran perdeler ("Fark — Uşşak: Segâh · Kürdî: Kürdî"), güçlü
  ve seyir türü farkı, "İkisini dinle" (iki makamın çıkışı arka arkaya) ve o makama geçiş. Uşşak/Bayâtî gibi dizisi aynı
  olanlarda "fark seyirde ve ezgide". Teori sayfasındaki makam kartında da dizisi yakın makamlar yazar
- **Ezgi örnekleri:** nota arşivindeki SymbTr seyir ezgileri (Rauf Yektâ, Şefik Gürmeriç, Erol Bingöl; 20 makamın
  hepsinde 2–5 örnek) "Makamı tanı"dan açılır; arşiv ekranında dinlenir, takip edilerek çalınır. Örnekler kendimiz
  yazılmadı, kaynak eserlerden alındı. (Erol Bingöl çağdaş bir müzisyen: telif denetimine bkz. `lisans-besteciler.csv`)
- **Taksim–makam bağı** (`skills.js` `similarDrift`): taksim/seyir değerlendirmesinde, çalınan sürenin en az %8'i benzer
  bir makamın ayırt edici perdesinde geçtiyse (ve bu makamın karşılık gelen perdesinden en az iki kat uzunsa) geri
  bildirime "X perdesinde çok durdun: bu, dizisi yakın olan Y makamının perdesi" eklenir. Seyir sonucu ekranında
  "makamını incele" düğmeleri Dizi'de "Makamı tanı"yı açar. Eşikler yapay notalarla denendi, gerçek taksimle değil
- **Videolar:** Videolar sekmesinde "Üslup üzerine" kutusu (klasik / Trakya-Roman / modern icra doğru-yanlış değil
  üslup; buradaki videoların hepsi Çorlu'dan iki hocanın tavrı, başka üsluplardan örnek henüz yok). Etiketler (eski
  tavır, oyun havası, yakın çekim, caz) yalnızca başlıkta yazandan çıkar; videolara izlenmeden üslup etiketi verilmedi.
  Yeni başlangıç derslerine var olan videolar bağlandı: kamış ve ağızlık (bek-kamış-üfleme videosu), dil ile başlatma
  (dil vurma), ilk geçişler (yumuşak geçişler). Eller ve nefes-cümleleme derslerine uygun video yok
- **Yapılan denetimler:** Node'da 20 makamın benzer listesi gözden geçirildi; `similarDrift` Uşşak hedefiyle üç yapay
  taksimde (temiz Uşşak: uyarı yok; Kürdî perdesiyle: Kürdî; Evç'le: Hüseynî). Tarayıcıda Dizi → Makamı tanı (liste,
  makam geçişi, İkisini dinle, seyir örneğinin arşivde açılması), teori makam kartı, Videolar üslup kutusu ve etiketler;
  konsolda hata yok
- **Uzman/hoca görmeli:** benzer makam listelerinin öğretici olup olmadığı (dizi yakınlığı müzikal yakınlıkla her zaman
  örtüşmez; ör. Hüseynî'nin Uşşak'a "Evç farkıyla" benzemesi); taksimde geçki ile "yanlış makama kayma"yı ayırmak için
  %8 eşiği; "Üslup üzerine" metni
- **Gerçek klarnetle denenmeli:** taksim değerlendirmesindeki yeni uyarı (benzer makam perdesi) gerçek bir Uşşak,
  Hicaz ve Kürdî taksiminde yanlış alarm veriyor mu
- **Proje sahibine kalan:** konuya özel kısa başlangıç videoları (eller, nefes, kamış takma) ve farklı icracı/üsluplardan
  örnekler çekilmeli ya da izinle bağlanmalı

### Aşama 4 (P2) — tamamlandı (3 Kasım 2026)

- **Değişen dosyalar:** `skills.js`, `trainers.js`, `lessons.js`, `lessonview.js`, `drills.js`, `videos.js`, `app.css`,
  `sw.js` (önbellek v64)
- **Ders sonu özeti:** biten derste her ölçülen adımın en iyi sonucu ve hedefi listelenir; hedefi en az farkla geçilen
  adım "yarın bir kez daha" diye önerilir, "Gelişimimi gör" İlerleme'yi açar
- **Gelişimin zaman içinde takibi** (İlerleme → "Gelişim (haftalara göre)"): son 8 haftanın haftalık ortalamaları ve son
  4 haftanın önceki 4 haftayla karşılaştırması: uzun ton puanı, **ses kararlılığı** (uzun tonda sapmanın yayılımı, koma),
  **ritim puanı**, taksim (seyir) puanı. Ders adımlarındaki uzun ton, ritim ve seyir sonuçları da artık geçmişe yazılıyor
  (önceden yalnız alıştırma ekranları yazıyordu); yayılım bu sürümden önceki kayıtlarda yok
- **Taksim aşamaları:** ileri ünitede beş ders: (1) cümle kurma — yeni, (2) seyir — var olan "Taksime giriş", (3) çeşni
  ve yarım karar — yeni, (4) karar — yeni, (5) inici makamlar — var olan. Seyir adımına `focus` eklendi; puan o aşamanın
  ölçüsüdür (`skills.js` `phraseAnalysis`): notalar en az 350 ms sessizlikle cümlelere bölünür.
  - Cümle: en az 4 cümle, 1,5–10 sn, dizideki bir perdede tutularak biten
  - Çeşni: durak ile güçlü arasındaki perdelerin gezilmesi ve güçlüde biten cümle
  - Karar: son cümle durakta, son nota ≥ 800 ms, durağa üstten ya da yedenden gelinmesi
  Metinler uygulamanın ölçebildiğini ve ölçemediğini (ezginin güzelliği) ayrı söyler; "ilk çeşni = durak–güçlü arası"
  bu uygulamanın sadeleştirmesi olarak yazıldı. Var olan ders kimlikleri ve adım sayıları değişmedi; bitmiş dersler açık kalır
- **Duruş ve el kontrol listesi:** "Doğru oturuş ve klarneti tutuş" (5 madde) ve "Sol ve sağ el parmak pozisyonları"
  (6 madde) derslerinin okuma adımında; maddeler ders metninden alındı. Telefonla 20–30 sn video ya da ayna ile
  işaretlenir, cihazda saklanır, geçmeyi engellemez. Kamerayla otomatik duruş denetimi yok
- **Kişisel öğrenme akışı:** var olan karşılama akışı (deneyimliler için Başlarken ünitesini geçme) ve yol haritası
  korundu; bu aşamada değiştirilmedi
- **Yapılan denetimler:** Node'da `phraseAnalysis` yapay bir Uşşak taksimiyle (4 cümle, güçlü ve durak kalışları:
  üç puan da 100); tarayıcıda taksim (karar) adımı yapay perde akışıyla (puan ve geri bildirim), ders özeti, kontrol
  listesi (işaretleme ve saklama), İlerleme'deki haftalık eğriler (örnek geçmişle), yeni taksim derslerinin sırası.
  Okuma adımındaki bir hata (ctx eksik) denetimde bulunup düzeltildi; sonra konsolda hata yok
- **Uzman/hoca görmeli:** taksim aşamalarının sırası ve tanımları (özellikle çeşninin durak–güçlü arası olarak
  sadeleştirilmesi, karar için "üstten ya da yedenden"); kontrol listesi maddeleri; geçme eşikleri (60–75)
- **Gerçek klarnetle denenmeli:** cümle bölme eşiği (350 ms sessizlik) gerçek nefes aralarında doğru mu; ses kararlılığı
  eğrisinin hafta hafta anlamlı değişip değişmediği

### Aşama 5 (kalanlardan P0) — tamamlandı (3 Kasım 2026)

- **Değişen dosyalar:** `scripts/audio-check.js`, `omr.js`, `convert.js`, `README.md`, `testdata/README.md`,
  `testdata/omr/README.md`, `store/listing.md`, `package.json`, `sw.js` (önbellek v65); yeni `scripts/omr-acc-check.js`
- **Koşul sınamasına dört koşul** (`CONDITIONS`): `glissando` (2 yarım ses pesten 200 ms'de kayarak giriş), `atak`
  (ilk 25 ms'de notanın 4 katı güçte geniş bantlı patlama), `nefes` (genlik ±%45 oynar, 30 dB altında nefes hışırtısı),
  `sonus` (son yarı 40 dB sönerek biter) ve `sol+telefon+nefes+sonus`. Dördünde de 138/139 (temizle aynı; oktav
  yanılgısı yok); birleşimde 134/139 (bilinen telefon/pp pes notalar). Perde bulucuda düzeltme gerekmedi
- **Belgelerde Si♭ dili:** README, `testdata/README.md` ve betik başlığı "gerçek klarnet kayıtları" yerine "Si♭ klarnet
  (Iowa), Sol klarnet kaydı henüz yok; koşullar benzetim" diyor. Mağaza metnine (TR/EN) "Bilmen gerekenler" paragrafı:
  örnek sesler Si♭ kaydı, perde bulucu Si♭ kayıtları ve benzetimle sınandı, çeyrek ses parmakları doğrulanmadı. Aynı
  metinde ders sayısı 77 → 87, icra akordu "yaklaşık, aralığıyla; öğretmeninin perdeleri" ve Saba'da Çargâh yerine
  Hicaz (koddaki değer) düzeltildi
- **OMR değiştirici karışıklık tablosu** (`npm run omr-acc-check -- --bulanik`): 9 değiştirici × 12 nota, Bravura ve
  Leland, 20/14/11/9 px, temiz ve bulanık+JPEG. Bulunan iki hata düzeltildi: bulanık küçük sayfada düz bemolün sap +
  baş diye bölünmesi (bemol boyundaki değiştirici artık bölünmüyor) ve büyük mücenneb bemolün çiziklerinden biri dizek
  çizgisiyle silinince bakiye okunması (sapın solunda çizik sayımı). "Resim küçük" uyarısı 8 yerine 10 px altında ve
  koma işaretlerini gözden geçirmeyi söylüyor. Tablo ve kalan karışıklıklar `testdata/omr/README.md`'de
- **Yapılan denetimler:** `audio-check --kosul` yeni koşullarla; `omr-acc-check` (192 nota/işaret) değişiklikten önce ve
  sonra; Hicâz Longa gerçek sayfası (pdf.js ile Node'da çıkarılan resim) her değişiklikten sonra 228/228; tarayıcıda
  Çevir'e 9 px bulanık sentetik sayfa verildi: yeni uyarı görünüyor, konsolda hata yok
- **Gerçek klarnetle / gerçek notayla denenmeli:** yeni koşulların hiçbiri gerçek Türk tavrı değil (geniş glissando,
  sert dil, nefes); gerçek Sol klarnet kaydı gerekiyor. Karışıklık tablosu sentetik: gerçek Leland/Bravura basılı nota
  fotoğraflarında (özellikle 150 dpi altı) ♯ ile büyük mücenneb ♯ ve iki bemol çizikli işaretler

### Kalanlar (liste 3 Kasım'da yeniden geldi, aşamalarla karşılaştırıldı)

Aynı liste tekrar geldi; maddelerin hepsi yukarıdaki dört aşamada ele alınmış, P0 kalanları aşama 5'te. Açıkta kalanlar:

- **Kişisel öğrenme akışı / seviye belirleme**: en üstteki öncelikli "Kademeli hoca akışı" maddesine taşındı (çalma
  sınaması 3 Kasım'da yapıldı)
- **Makam çeşnileri ayrıntısı** (P1): seyir metinlerinde çeşniler adıyla geçiyor, ayrı ayrı anlatılmıyor (ör. Uşşak'taki
  Segâh'ın rengi, Hicaz'ın artık ikilisi). Yalnızca kaynaklı bilgiyle (`docs/KAYNAKLAR.md`) yazılmalı; kaynak yoksa yazılmaz
- **OMR düşük çözünürlük** (P1): 9 px bulanık sayfada ♯ büyük mücenneb ♯ okunuyor (12 notada 7 ve 4); Leland 11 px
  bulanıkta büyük mücenneb ♭ bakiye okunuyor (3). Ayırmak için gerçek düşük çözünürlüklü fotoğraf örnekleri gerekli
- **Lisans tablosu** (P1): `lisans-besteciler.csv` ölüm yılı ve telif durumu sütunları hâlâ boş (502 besteci, 363 güfte
  yazarı); ticari sürümden önce doldurulmalı
- **Proje sahibine / uzmana bağlı** (kod değil): gerçek Albert Sol klarnet kayıtları (her notada pp/mf/ff) ve
  `audio-check` ile sınama; 57 çeyrek ses parmağında ses kalitesi ve geçiş bilgisi; konuya özel kısa başlangıç videoları
  (eller, nefes, kamış takma); farklı icracı ve üsluplardan izinli örnekler; aşamalardaki "Uzman/hoca görmeli" maddeleri

### Maddeler (gelen liste)

### P0 — kritik

1. **Gerçek Sol klarnet ses analizi**
   - Akort, uzun ses, hız, süsleme ve eşlik gerçek Sol klarnet kayıtlarıyla sınanabilmeli (`testdata/README.md`,
     `npm run audio-check` var; kayıt yok)
   - Vibrato, glissando, atak, nefes dalgalanması ve harmonik kaynaklı oktav hataları hesaba katılmalı (oktav koruması
     2 Kasım'da eklendi, gerçek seste denenmedi)
   - Üst harmoniklerin yanlış nota sayılması önlenmeli; gürültülü ortam ve farklı telefon mikrofonlarında davranış
     iyileştirilmeli
   - Gerçek kayıt yoksa sentetik sınamalar gerçek sınama gibi sunulmamalı (arayüz, belgeler, mağaza metni gözden geçirilecek)
2. **Nota tanıma (OMR) ve koma işaretleri**
   - Koma işaretleri birbirinden doğru ayrılmalı; Leland eğik çizgili bemolün düz bemol (−5 yerine −4) okunması giderilmeli
   - Her notada güven puanı gösterilmeli (şimdi yalnızca "emin değil" sarısı var)
   - Algılanan nota ve koma işareti elle düzeltilebilmeli (düzeltme ekranında koma seçimi var mı, bakılacak)
   - Uzun PDF'lerde sayfa ve bellek sınırı; tanınmayan D.S. gibi işaretlerin ele alınması (en azından uyarı)
3. **Çeyrek ses parmakları** (`core.js` `QT_FINGERINGS`, 57 parmak, WFG Oehler/Albert tablosundan)
   - Albert Sol klarnete göre gözden geçirilmeli; doğrulanmamış pozisyon kesin gibi sunulmamalı
   - Alternatifler ayrı kategoride; her pozisyon için ses kalitesi, geçiş kolaylığı, kullanım bağlamı
   - Gerçek çalgıda doğrulanması gerekenler arayüzde işaretlenmeli ("a" mandalının karşılığı dahil)

### P1 — Türk musikisi ve makam doğruluğu

4. **İcra perdesi** (`learn.js` `ICRA`)
   - Teorik AEU değerleri ile icrada kullanılan perde ayrı gösterilmeli; sabit koma düzeltmeleri mutlak doğru gibi sunulmamalı
   - Çıkıcı ve inici seyirdeki perde farkları (ör. inişte pesleşen perdeler)
   - Kullanıcı öğretmeninin ya da örnek aldığı icracının referansını ayarlayabilmeli
   - Gerektiğinde tek değer yerine önerilen aralık
5. **Makam eğitimi** (19/20 makam)
   - Durak, güçlü, yeden ve seyir açıklamaları kontrol edilmeli; karakteristik çeşniler ayrıntılı anlatılmalı
   - Çıkıcı ve inici seyir örnekleri, karakteristik ezgileri dinleten örnekler
   - Benzer makamların karşılaştırması (ör. Uşşak/Bayâtî, Hicaz/Uzzal/Zirgüleli Hicaz, Kürdî/Kürdîli Hicazkâr)
   - Taksim örnekleri makam çözümlemesiyle ilişkilendirilmeli
6. **Usul ve ritim** (`learn.js` `USULS`, `usuller.js`)
   - Zaman, vuruş, darb, düm, tek ve usul çevrimi kavramları ayrı anlatılmalı
   - Sofyan gibi usullerde zaman sayısı ile darb sayısının farklı olabileceği açıklanmalı
   - Roman, Karşılama, Çiftetelli ve Rumeli tek kesin kalıp gibi sunulmamalı; yöresel ve icracıya bağlı farklar belirtilmeli
   - Ritimler sesli ve görsel örnekle desteklenmeli
7. **Klarnet başlangıç eğitimi** — ayrı dersler: (1) parçalar ve montaj, (2) kamış seçimi ve takılması, (3) oturuş ve
   tutuş, (4) sol ve sağ el parmak pozisyonları, (5) ağızlık ve dudak pozisyonu, (6) ilk ses, (7) uzun ses, (8) dil ile
   başlatma (artikülasyon), (9) ilk nota geçişleri, (10) nefes kontrolü ve müzikal cümleleme
   - Nefes: "karından nefes al" yerine alt kaburgaların genişlemesi, rahat nefes alma, kontrollü hava akışı
   - Dudak: gevşeklik ile ağızlık çevresindeki sızdırmazlık arasındaki denge
   - Kamış sertliği (2–2,5 gibi) kesin kural değil; bek açıklığı, kamış markası ve icracıya göre değişir
   - Mevcut "Başlarken" ünitesi ile karşılaştırılıp eksik dersler eklenecek, var olanlar bölünecek
8. **Ses ve video içerikleri**
   - Si♭ klarnetten perde kaydırmayla üretilen örnekler gerçek Sol klarnet kaydı gibi sunulmamalı (`sampler.js` Iowa Si♭
     örnekleri; arayüzde ve belgelerde açıkça yazılmalı)
   - Mümkünse Albert sistem gerçek Sol klarnet kayıtları; her nota için farklı dinamikler
   - Başlangıç dersleri tek uzun video yerine konuya özel kısa videolarla (`videos.js`)
   - Farklı Türk klarnet icracılarından örnekler; klasik Türk musikisi, Trakya/Roman tavrı ve modern icra ayrı, doğru/yanlış
     değil icra üslubu olarak anlatılmalı

### P2 — öğrenme deneyimi

9. - Seviyeye göre kişisel öğrenme akışı (karşılama akışı ve yol haritası var; seviye belirleme gözden geçirilecek)
   - Her ders sonunda küçük uygulama ve değerlendirme; gelişimin zaman içinde takibi
   - Duruş ve el pozisyonu için video kontrol listesi
   - Öğrencinin kendi kayıtlarını karşılaştırması (eski kayıtla karşılaştırma var, 27 Ekim)
   - Taksim eğitimi aşamalara bölünmeli: cümle kurma, seyir, çeşni, karar
   - Yalnızca nota doğruluğu değil, ses kararlılığı ve ritim doğruluğu da takip edilmeli

### Lisans ve telif

10. - SymbTr ve diğer nota kaynaklarının lisans koşulları; CC BY-NC-SA 4.0 içeriklerin ticari kullanım açısından ayrıca
      değerlendirilmesi (ücretli uygulamada NC sorunu)
    - Her eserin bestecisi, telif ve kullanım durumu ayrı ayrı kontrol edilmeli
    - Harici nota ve ses kaynaklarının (WFG, Iowa EMS, VCSL, neyzen.com, projetsm.com) kullanım izinleri belgelenmeli
      (ör. `docs/LISANSLAR.md`)

## Eksikler listesinden: akort, dem, tolerans, ekipman, istatistik, paylaşım — tamamlandı (2 Kasım 2026)

Gelen iki eksik listesindeki maddeler koda göre denetlendi. Zaten olanlar: dinlerken ekranın açık kalması (Wake Lock),
ortam gürültüsüne göre eşik, dron, makam durak/güçlü bilgisi (akort ekranı, Teori), etütler ve teknik kalıpları, kayıtla
senkron perde eğrisi ve çarpma/kayış tanıma (Kayıt, Seyir), arşivde A–B döngü ve tempo merdiveni, dosyaya yedek, kalıcı
depolama izni, diyapazon 430–450 Hz, entonasyon haritası ve kaçan perdeler. Eksik olanlar yapıldı:

- **Oktav sıçrama koruması** (`app.js` tick, `core.js` `NoteStabilizer.push(key, hold)`): gösterilen notadan tam bir oktav
  uzaktaki nota ancak 5 ölçüm (200 ms) sürerse kabul edilir; register geçişindeki anlık oktav yanılgısı göstergeye ve
  alıştırmalara geçmez (gerçek oktav atlaması 80 ms gecikir)
- **Hava sesi süzgeci** (Ayarlar): açıkken perde bulucu netliği 0,7'nin altındaki sesi almaz (`detectPitch` `minClarity`)
- **Entonasyon toleransı** (Ayarlar): temiz ±0,25 / kabul ±1,5 koma varsayılan; göstergede iki bant (yeşil, petrol) ve
  kabul sınırı kayıt değerlendirmesinin pes/tiz eşiği (`INTON.offKoma`)
- **Akort izinde ham perde eğrisi:** kalın çizgi tutulan nota, ince çizgi her ölçüm; notalar arası kayış, çarpma ve nefesle
  bükme 8 saniyelik izde görünür
- **Diyapazon:** 440 / 442 / 432 hazır değerleri ve "Dinleyerek ayarla" (3 sn dinler, tampere notadan sapmanın ortancası
  diyapazona eklenir; ses sabit değilse reddeder)
- **Dem:** akort ekranında makam seçilince "▶ Dem: <durak>" düğmesi; makam değişince açık dron yeni durağa geçer (`SK.drone`)
- **Ekran açık kalsın** (Ayarlar): mikrofon kapalıyken de ekran kilidi tutulur. Yedek ipucunda son yedeğin tarihi; 30 günü
  geçince Drive'a ya da e-postaya kaydetme önerisi
- **Ekipmanım** (Ayarlar, `equip.js`): bek, kamış listesi, seçili kamışla perdesi duyulan süre, kamış notu, kamış ömrü
  (varsayılan 25 saat) dolunca bir kez hatırlatma
- **Arşivde kademeli hızlanma:** A–B döngüsünde her turda tempo %5 artar (en çok %100); açılınca tempo %60'tan başlar
- **İstatistik** (Takip): makamlara göre süre (son 30 gün; makam akort bağlamından, `sk.days.mk`, 90 gün tutulur) ve hafta
  günlerine göre ortalama süre
- **Eser paylaşımı** (Etüt ve eserler): kendi eseri sıkıştırılıp bağlantının `#paylas=` kısmına yazılır, sunucuya gitmez;
  kopyala, paylaş menüsü ve QR kod (`vendor/qrcode`, 1800 karakteri aşan bağlantıda QR yok). Bağlantıyı açan kişiye
  "Eserlerime ekle" sorulur; uygulamada bağlantı "Eser ekle" kutusuna yapıştırılarak eklenir. Uygulamadan paylaşılan
  bağlantı web sürümünü (alikrc.github.io/Sol-Klarnet) açar
- **Yapılmadı:** bulut eşitleme (sunucu ve hesap gerektirir; yedek dosyası Drive'a kaydedilebiliyor); kamış/bek profiline
  göre mikrofon ayarı (kamış perde ölçümünü değiştirmez; ortam ölçümü ve hava süzgeci yeterli); MIDI dışa aktarma
- **Denenmedi:** gerçek mikrofonla (tarayıcı panelinde mikrofon yok): oktav koruması, hava süzgecinin pp notalara etkisi,
  dinleyerek diyapazon, ham perde eğrisinin gerçek kayışlarda görünüşü, kamış süre sayımı. Paylaşım (gönder, aç, ekle),
  QR, dem düğmesi, tolerans bantları, kademeli hızlanma ve istatistikler tarayıcıda denendi

## Çeyrek ses parmakları ve gerçek çalgı sesleri — tamamlandı (1 Kasım 2026)

- **Çeyrek ses parmakları** (`core.js` `QT_FINGERINGS`, `quarterFingeringsFor`, `quarterFor`): WFG'nin Oehler/Albert çeyrek
  ses tablolarından (ocl_qt_1–3, Arnold Wendl) yazılı Mi3 + ¼ ile Si6 + ¼ arasında 44 çeyrek ses, 57 parmak. Sağ 2. yan
  mandalı (Albert'te yok) kullanan iki parmak alınmadı. Yeni gösterimler: `½` yarım kapalı delik (şemada yarı dolu, talimatta
  "yarım kapalı"), `a` sağ orta deliğin üstündeki mandal (şemada eklendi). Parmak kartında "¼ pes" / "¼ tiz" seçenekleri;
  hedef perde (icra düzeltmesiyle) çeyrek sese yarım sesten yakınsa o seçenek işaretlenir ve önerilir (ör. Uşşak icrasında
  Segâh ≈ Si♭4 + ¼). AEU perdelerinin hepsi tampere notaya ~25 sentten yakın olduğundan öneri yalnızca icra akordunda çıkar.
  Uzman kontrolünde ayrı satırlar
- **Klarnet sesi:** sentez yerine gerçek klarnet kaydı (`sampler.js`, `sounds/`; University of Iowa EMS Si♭ klarnet mf,
  16 nota, döngülü, hafif oda yankısı). Her örneğin perdesi ölçüldü; çalma hızı istenen frekansa göre ayarlanır, kaydın kendi
  akordu (tizde 30 sente kadar pes) sonuca girmez. Tarayıcıda ölçüldü: AEU ve icra perdelerinde sapma en çok 0,6 sent
- **Darbuka:** VCSL (CC0) gerçek düm, tek ve ka. Düm perde bulucunun alt sınırının altına indirilir (Sol klarnette 87 Hz)
- **Ud ve bas:** lisansı uygun gerçek ud örneği bulunamadı; genişletilmiş Karplus-Strong (mızrap kesiti, çekilen yer,
  perdeye göre sönüm, gövde rezonansları, çift tel). Eski modelin döngü süzgeci perdeyi 2–9 sent pes çıkarıyordu; artık
  süzgecin gecikmesi hesaba katılıyor (0,2 sent içinde)
- **Komalı eserler:** 28 etüdün 842 notası makam dizilerinde; nota arşivinden rastgele 25 eserin (10 167 nota) komaları SymbTr
  kaynağıyla birebir aynı (süs notaları bilerek süsleme işaretine çevriliyor)
- **Denenmedi:** seslerin kulağa nasıl geldiği (bu ortamda dinlenemedi), telefonda yükleme süresi (örnekler 1,9 MB, ilk ses
  açılınca yüklenir; yüklenene kadar eski sentez çalar). Çeyrek ses parmakları gerçek çalgıda denenmedi

## Nota çevirici — tamamlandı (30 Ekim 2026)

Tasarım: [2026-10-24-nota-cevirici-design.md](superpowers/specs/2026-10-24-nota-cevirici-design.md) ·
plan: [2026-10-24-nota-cevirici.md](superpowers/plans/2026-10-24-nota-cevirici.md)

- **Çevir sekmesi** (Eserler; `convert.js`): PDF ya da resimden (`omr.js`, simge kalıpları `omrtemplates.js`; PDF sayfaları
  pdf.js ile resme çevrilir, yalnızca PDF seçilince yüklenir), ses dosyasından ve "Dinleyerek yaz" ile mikrofondan (en çok
  3 dakika, 22 050 Hz tek kanal) nota çıkarılır. Her sonuç kaydedilmeden önce düzeltme ekranından geçer: emin olunmayan
  notalar sarı, süresi tutmayan ölçüler turuncu, yazılı aralık (Mi3–Mi♭7) dışı kırmızı ve kaydı engeller. Okuma ve çözümleme
  arayüzü dondurmaz, ilerleme gösterilir, sekmeden çıkınca iptal edilir
- **Nota bul:** neyzen.com ve projetsm.com uygulamanın içinden aranır, nota indirilip doğrudan okunur (`sources.js`; neyzen
  kaynağı `SOURCES.neyzen.enabled` ile kapatılır). neyzen arama dizini cihazda IndexedDB'de tutulur. Uygulamada internete
  yalnızca burası çıkar ve yalnızca arama sözcüğünü ve indirilecek dosyanın adresini gönderir
- Okuyucu sentetik sayfalarda (temiz ve bozulmuş), fotoğraf benzeri sayfalarda ve bir gerçek sayfada (Hicâz Longa, 228 nota)
  ölçüldü; gerçek sayfada son ölçüm 1.000. Örnekler: [testdata/omr/README.md](../testdata/omr/README.md)
- **Denenmedi:** gerçek mikrofonla Dinleyerek yaz (tarayıcı panelinde mikrofon kapalı); gerçek dokunmatik cihazda iki
  parmakla yakınlaştırma; parolalı PDF; gerçek Android/iOS'ta Nota bul (İnsan gerektiren işler, 7); okuyucu eşikleri yalnızca
  sentetik sayfalar ve tek gerçek sayfayla ayarlandı (9); gerçek klarnet kayıtlarında ses çözümü. Bilinen küçük eksikler:
  Leland'daki eğik çizgili bemol küçük boyutta düz bemol (−5, olması gereken −4) okunabiliyor; "D.S." yazısı okunmuyor;
  uzun PDF'lerde sayfa ya da bellek sınırı yok

## Seni izleyen eşlik — tamamlandı (28 Ekim 2026)

- **Benimle çal** (Etüt ve eserler, nota arşivi; `follow.js`, `pieces.js` `startFollow`): çaldığın notalar eserdeki yerine eşlenir
  (`ScoreFollower`: perde + beklenen zaman, en çok 4 nota atlama, süsleme ve fazla notalar yok sayılır, duyulmayan dille tekrar
  sayılır); eşleşmelerden tempo ve konum çıkar (`TempoMap`), orkestra bu haritaya göre 150 ms önceden kurulur (`FollowBand`).
  İlk notanla girer, sıradaki nota `followWait` kadar gecikirse bekler, kaldığın ya da biraz ilerideki notadan devam eder.
  Sonuçta doğru nota oranı, atlanan, tempo aralığı ve bekleme sayısı
- **Eşlik sekmesi:** "Grup beni izlesin" (`GrooveTracker`: tempo ardışık nota başlarının aralığından, evre en yakın hücreden;
  ayarlanan tempoya göre %75–130), susunca bekler ve ilk notanla cümle başından girer. "Taksimle başla": grup dem tutar,
  taksim durakta en az 0,8 sn'lik notayla bitip sessizlik gelince oyun havasının ilk notasıyla girer; "Gir" ile hemen
- Sızıntı süzgeci düzeltmesi (`practice.js` `droneFloor`): sızıntı düzeyi son 10 sn'nin alt %10'u yerine son 15 sn'nin alt
  %5'i; nefes almadan çalınca öğrencinin durak ve güçlü perdeleri grup sızıntısı sanılıp atılıyordu
- Sınama: Playwright'ta sahte mikrofona sentetik klarnet sesi. Eserde (Kasap havası: %85 hızda başla, 3 sn dur, %112'de devam)
  doğru nota %100, grup 94'e indi, bir kez bekledi, 124'e çıktı. Eşlik sekmesinde taksim → 100 → 88 → duraklama: grup taksimin
  ardından ilk notayla girdi, 93–101 ve 86–90 arasında izledi, bekleyip yeniden girdi
- Sınırlar: notasız izlemede %20'yi aşan ani tempo değişimi yanlış tempoya (3:2) kilitlenebiliyor (bu yüzden aralık dar);
  düzenli nota başlarından otomatik giriş denendi, sentetik sesteki ±50 ms oynamada hızlı taksim geçişlerini oyun havasından
  ayıramadığı için (yanlış giriş %50–80) bırakıldı. Gerçek klarnetle ve hoparlör sızıntısıyla denenmedi

## Tekrar, sınav, rozet, kayıt karşılaştırma, yeni oyun havaları, grupetto, mağaza — tamamlandı (27 Ekim 2026)

- **Aralıklı tekrar** (`lessons.js` `srsSync`, `srsDue`, `srsUpdate`): bitirilen derslerin bir adımı 1, 3, 7, 21, 60 gün
  aralıkla günlük plana gelir (günde en çok 2); başarılı tekrar aralığı uzatır, başarısız kısaltır. Eski bitmiş dersler günlere dağıtılır
- **Ünite sınavları** (`EXAMS`): her ünitenin derslerinden en çok altı adım, karışık; ders zincirini kilitlemez. Geçince ünite rozeti
- **Rozetler ve haftalık özet** (`roadmap.js` `badgeList`, `weekSummary`): ünite, seri (3–100 gün), günlük çalışma ve toplam süre
  basamakları; yol haritasında bu hafta / geçen hafta karşılaştırması
- **Eski kaydınla karşılaştırma:** kayıtlar IndexedDB'de tarihle (son 50, ★ ile saklananlar silinmez); yerinde nota oranı,
  ortalama sapma, ses temizliği farkı, iki oynatıcı ve üst üste perde eğrileri (`skills.js` `recSummary`, `recCompare`, `recBaseline`)
- **Oyun havaları:** sirto (2/4) ve zeybek (9/4) usulleri; Hicaz sirto, Karcığar köçekçe, Hüseynî zeybek ve çarpmalı tekrarlı
  Kürdî Ağır Roman etütleri; Trakya ünitesine üç ders. Eşlikte ikinci darbuka çalışı ve cümle sonu dolgu ölçüsü (`band.js` `bandDrum`)
- **Grupetto:** ölçüm, örnek ses, Süsleme sekmesi, `gr` eki, MusicXML `<turn>`, dizekte işaret, uzman kontrolü, yeni ders (toplam 76)
- **Taksimde süsleme tanıma** (`skills.js` `ornamentScan`): Seyir sekmesi ve taksim adımında ham sesten çarpma, çarpmalı tekrar,
  mordan, grupetto, tril, kayış ve düşüş sayılır. Yalnızca sentetik seslerle ayarlandı
- **Mağaza:** telefon ekran görüntüleri ve 1024×500 tanıtım görseli (`npm run store-shots`), Türkçe/İngilizce kısa ve uzun açıklama
  (`store/listing.md`), manifest'te ekran görüntüleri
- Yapılmadı: çeyrek ses parmakları (sonra yapıldı, 1 Kasım 2026)

## Oyun havaları, eşlik, kulaktan çıkarma, okuma ve yol haritası — tamamlandı (26 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-26-oyun-havalari-design.md](superpowers/specs/2026-10-26-oyun-havalari-design.md).

- Trakya ve Roman ünitesi (8 ders), beş oyun havası usulü (kasap, çiftetelli, karşılama, Roman havası, Rumeli),
  Nikriz makamı, yedi özgün etüt; toplam ders 59 → 72
- Eşlik sekmesi (darbuka, bas, ud), etüt ve nota arşivinde orkestra eşliği; arşivde “Oyun havaları” süzgeci
- Kulaktan çıkar: perdeyi bozmadan yavaşlatma, kaydırma, A–B döngü, işaretler, perde izi, Çevir'e aktarma
- Deşifre, Dikte (ritim, ezgi), Kulak'ta aralık; ilgili dersler ve günlük plan adımları; günlük plan hedef süresine sığar
- Yol haritası: altı aşama, kilometre taşları, haftalık görünüm, kalan süre tahmini
- Gerçek mikrofonla ve telefon hoparlörüyle denenmedi; Playwright'ta sahte mikrofonla açıldı


## Perde eğrisi — tamamlandı (24 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-24-perde-egrisi-design.md](superpowers/specs/2026-10-24-perde-egrisi-design.md),
plan: [docs/superpowers/plans/2026-10-24-perde-egrisi.md](superpowers/plans/2026-10-24-perde-egrisi.md).

- Kayıt sekmesinde zaman–koma grafiği: hedef perde şeritleri, nota rengine göre eğri, sürükleyerek kaydırma,
  "Tümü" görünümü, çalma çizgisi; grafiğe ya da tablo satırına dokununca kayıt o ana sarılır
- Kendiliğinden işaretler (`skills.js` `intonationIssues`, eşikler `INTON`): pes, tiz, kayma, titreklik;
  bilgi olarak alttan/üstten giriş, vibrato, dizi dışı. Hedef perde seçili makamın dizisinden alınır
- Özet: kaç nota yerinde, en çok kaçan üç perde, ipucu ve "Parmağa bak" bağlantısı
- Gerçek mikrofonla denenmedi: arayüz sahte kayıtla (`SKDEBUG.recPresent`), ölçüm sentetik izlerle sınandı

## Hız ve teknik — tamamlandı (24 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-24-hiz-teknik-design.md](superpowers/specs/2026-10-24-hiz-teknik-design.md),
plan: [docs/superpowers/plans/2026-10-24-hiz-teknik.md](superpowers/plans/2026-10-24-hiz-teknik.md).

- Teknik kalıpları kurallarla üretiliyor (`skills.js` `techPattern`): makam dizisi, Batı gamı, arpej, üçlü atlama,
  dörtlü grup, register geçişi; sekizlik/triole/on altılık, bağlı ya da dille
- Çalış ham sesten ölçülüyor (`SK.pcmCapture`, `runNotes` → `alignRun` → `runVerdict`): doğru nota, zamanlama,
  eşitlik ve tempo kayması; metronom tıkı ve dron aralıkları ayıklanıyor
- Tempo merdiveni (`TempoLadder`), "Hız ve teknik" ünitesi (7 ders, toplam 59), "Hız" sekmesi, eserlerde merdiven
- Gerçek mikrofonla denenmedi: tarayıcı panelinde mikrofon kapalıydı; ölçüm sentetik seslerle ve sahte kayıtla sınandı

## Süsleme — tamamlandı (23 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-23-susleme-design.md](superpowers/specs/2026-10-23-susleme-design.md),
plan: [docs/superpowers/plans/2026-10-23-susleme.md](superpowers/plans/2026-10-23-susleme.md).

- Yeni "Süsleme" ünitesi (7 ders): çarpma, alttan çarpma ve çarpmalı tekrar, mordan, tril, kayarak giriş ve düşüş,
  süslemeli iki etüt, makamda süsleme. Toplam ders 45 → 52
- Ölçüm: mikrofonun son 8 sn'lik ham sesi (`pcmring.js`, AudioWorklet) deneme bitince 5 ms adımla yeniden çözülür
  (`skills.js`: `ornamentTrack`, `microNotes`, `ornamentEval`); eşikler `ORN` içinde
- Teknik grubunda "Süsleme" alıştırma sekmesi; İlerleme'de en iyi tril hızı ve çarpma başarısı
- Nota metninde süsleme ekleri (`La4:2:tr`, `ç+`, `m-`, `k`, `d`), MusicXML'den tril, mordan ve süs notası; dizekte işaretler;
  tempolu çalmada ayrı süsleme puanı
- Uzman kontrolüne "Süslemeler" sekmesi
- Gerçek mikrofonla denenmedi: tarayıcı panelinde mikrofon kapalıydı, ölçüm yalnızca sentetik seslerle ve sahte PCM ile
  sınandı. Telefonda gerçek klarnetle denenmeli

## Kapsamlı iyileştirme — tamamlandı (10 Ekim 2026)

- Perde bulucu: FFT ile NSDF, telefon mikrofonunun pes sesi kırpmasına karşı alt harmonik denetimi, tizde kısa pencere;
  800 gerçekçi sentetik seste eski bulucu 190, yeni bulucu 3 hata. Gerçek kayıtlar için `npm run audio-check`
- Makam bağlamı ve icra akordu; 10 yeni makam (toplam 19), her birinin seyir türü
- Ritim (kalıplar, usuller, iç tempo, gecikme ayarı), kulak eğitimi (koma eşiği, ABX, makam tanı), seyir/taksim analizi,
  ses kalitesi (netlik, ses gücü dengesi), dinamik (crescendo/decrescendo/messa di voce)
- Eserler: koma işaretli dizek, 14 özgün etüt, MusicXML/.mxl içe aktarma, tempolu çalma değerlendirmesi
- Müfredat 21 → 46 ders (Başlarken ve İleri seviye üniteleri dahil); günlük plan yeni becerileri de içeriyor
- Karşılama akışı, günlük hedef ve hatırlatma, yedekleme/geri yükleme, kaydı paylaşma, uzman kontrolü ekranı
- Çalgı seçimi (Sol, Si♭, La, Do, Mi♭), hoparlör modu (yankı giderme), ortam gürültüsüne göre hassasiyet
- Fontlar uygulamanın içinde, internet izni yok; iOS projesi; İngilizce arayüzde eksik çeviri kalmadı

## İnsan gerektiren işler (kodla çözülemez)

1. **Uzman doğrulaması:** Bir Sol klarnet hocası Ayarlar → Uzman kontrolü ekranından 124 parmağı, 20 makamın (Nikriz dahil) dizisini,
   seyir türünü ve icra düzeltmelerini işaretleyip raporu göndermeli. 72 dersin metinleri ve 24 etüt de gözden geçirilmeli. Hız ünitesinin gam/arpej seçimi, hedef tempoları ve hızlı Hicaz etüdü
   (`e-hiz-hicaz`) de kontrol edilmeli. Süslemeler (Uzman kontrolü → Süslemeler): tanımlar,
   örnek sesler, ölçüm eşikleri (`skills.js` `ORN`; ör. tril düzeni ≤ 0,2, çarpma 20–120 ms) ve iki süslemeli etüt.
   Çeyrek ses parmakları (Uzman kontrolü → Parmaklar, "+ ¼" satırları, 57 parmak) gerçek çalgıda denenmeli; özellikle
   "a" mandalı (WFG: sağ orta deliğin üstündeki mandal) Türk Sol klarnetinde hangi mandala karşılık geliyor.
   Yeni klarnet, darbuka, ud ve bas sesleri dinlenip beğenilmeli.
   Yanlış bulunanlar `core.js` (FINGERINGS, ALT_FINGERINGS, QT_FINGERINGS), `learn.js` (MAKAMS, SEYIR_TYPE, ICRA) ve
   `repertoire.js` (ETUDES) içinde düzeltilir; testler tutarlılığı denetler.
2. **Gerçek kayıtlar:** `testdata/README.md` içindeki listeye göre telefonla kayıt toplanıp `npm run audio-check` çalıştırılmalı.
   Süsleme eşikleri (`ORN`) yalnızca sentetik seslerle ayarlandı; süslemeli gerçek kayıtlarla gözden geçirilmeli.
   Perde eğrisi eşikleri (`INTON`; ör. pes/tiz 1,5 koma, titreklik 0,8) de gerçek kayıtlarla gözden geçirilmeli.
   Taksimde süsleme tanıma (`ornamentScan`, `ORN.scanStep`) ve grupetto eşikleri (`ORN.grupettoNote`, `grupettoTotal`) de.
3. **WFG izni:** Parmak verisi Woodwind Fingering Guide'dan; ücretli yayınlanacaksa sahibinden izin istenmeli.
4. **Mağaza:** Play geliştirici hesabı, yükleme anahtarı, kapalı test; iOS için Mac + Xcode + Apple geliştirici hesabı;
   mağaza ekran görüntüleri ve tanıtım görseli.
5. **Oyun havaları:** Yedi halk usulünün (sirto ve zeybek dahil) düm-tek kalıpları, ikinci çalışlar ve dolgular (`learn.js` USULS,
   `band.js` BAND_STYLES), Nikriz dizisi ve on bir Trakya/Roman etüdü (`repertoire.js`, level 6) bir Trakya ya da Roman klarnetçisine dinletilmeli. Eşlikle usule oturma eşiği
   (±60 ms) ve eşlik sızıntısının ayıklanması telefon hoparlörüyle denenmeli.
6. **Repertuvar ve lisans:** ayrıntı [LISANSLAR.md](LISANSLAR.md). Telifli eserler eklenmedi; kullanıcı MusicXML içe aktarabiliyor. SymbTr gibi açık lisanslı arşivlerden
   seçki eklenecekse lisans koşulları kontrol edilmeli.
7. **Nota bul gerçek cihazda denenmedi (30 Ekim 2026):** Arayüz tarayıcı panelinde sahte ağla (curl'den alınmış sayfalar)
   denendi; `CapacitorHttp` ile gerçek arama, neyzen dizininin çıkarılması (89 makam sayfası, ~1,6 milyon karakter;
   IndexedDB'de, yedeğe girmez), projetsm.com'a cleartext istek (Android `network_security_config`, iOS ATS istisnası),
   GIF/PDF indirme ve "Dosyayı kaydet" paylaşımı `npm run android:apk` ile telefonda denenmeli. Aynı turda gerçek mikrofonla
   Dinleyerek yaz, dokunmatik ekranda yakınlaştırma ve parolalı bir PDF de denenmeli.
8. **neyzen.com izni:** Nota bul neyzen.com'dan arar ve nota indirir. Siteyi yapan Mehmet Yücel'den yazılı izin alınmalı,
   mağazaya çıkmadan önce; izin yoksa `sources.js`'te `SOURCES.neyzen.enabled = false` yapılır (projetsm.com kalır).
9. **Nota okuyucu eşikleri:** `omr.js` eşikleri sentetik sayfalar, fotoğraf benzeri bozulmuş sayfalar ve tek gerçek sayfayla
   ayarlandı. Farklı yayınlardan (tarama, ekran görüntüsü, fotoğraf) daha çok gerçek örnek `testdata/omr/` altına konup
   okuma doğruluğu ölçülmeli, eşikler gerekirse gözden geçirilmeli. Ses çözümü eşikleri de gerçek klarnet kayıtlarıyla
   denenmeli.

## Sonraki adımlar (öncelik sırasıyla, 27 Ekim 2026)

1. **Gerçek klarnetle deneme (proje sahibi):** Telefonda Benimle çal (grup seni izliyor mu, gereksiz bekliyor mu), Eşlik'te
   grup beni izlesin ve Taksimle başla, Kulaktan çıkar, Trakya etütleri, taksimde süsleme tanıma ve kayıt
   karşılaştırması gerçek klarnetle denenmeli. Bakılacaklar: eşlik hoparlörden mikrofona sızıp nota sanılıyor mu (`practice.js`
   `bandFreqs`), usule oturma yüzdesi gerçekçi mi (±60 ms), taksimde süsleme sayısı kulağa uyuyor mu, 2 dakikalık taksimin
   çözümü telefonda ne kadar sürüyor, IndexedDB'de 50 kayıt ne kadar yer tutuyor. Bulgulara göre düzeltilir.
2. **Mağazaya çıkış (proje sahibi):** Play Console hesabı, yükleme anahtarı, kapalı test, veri güvenliği formu. Görseller ve
   metinler `store/` klasöründe hazır. Ayrıntı: [TODO.md](TODO.md).
3. **Daha sonra:** Kamerayla duruş ve ağız kontrolü; hoca–öğrenci modu (ödev, kayda yorum); cihazlar arası eşitleme.
   İnternet kullanmak serbest (28 Ekim 2026, proje sahibi): internetsiz çalışma şartı yok.


2 Ekim 2026 · Asıl doküman: [Claude Docs](https://claude.ai/code/artifact/f9c1b6aa-5fdc-475c-914d-1701a7b8a2b9)

## Dersler — tamamlandı (4 Ekim 2026)

Çalışma bölümüne ilk sekme olarak "Dersler" eklendi: 4 ünitede 21 ders (temeller, register ve klarino, teknik ve
üslup, makamlar), geçme koşullu adımlar, sıralı kilit ve günlük çalışma planı. Ders metinleri ve makam etütleri
uygulama için yazıldı; parmak anlatımları ve makam ezgileri bir hocaya ya da Sol klarnetçiye kontrol ettirilmeli.

Sonraki adım fikirleri: usullü ritim alıştırması (vuruşa göre zamanlama ölçümü), nim perdeler için çeyrek ses
parmakları, gerçek eserlerden kısa bölümler (lisans netleşince).

## Öğrenme özellikleri — tamamlandı (4 Ekim 2026)

Ayrıntılı kapsam ve kabul kriterleri: [Öğrenme Özellikleri Backlog](https://claude.ai/code/artifact/9aff5b8b-6e52-41e3-879b-4a5a2fde6749)

1. Parmak ezberi testi
2. Uzun ton ve entonasyon raporu (nota şeridinde ısı haritası)
3. Makam modu ve dizi alıştırması
4. Usullü metronom
5. Durak sesi (dron)
6. Taklit oyunu
7. Kayıt ve nota dökümü
8. Vibrato ve glissando ölçümü
9. İlerleme ve seri takibi
10. Eser takip modu

Onuncu madde hariç hepsi tasarlandığı gibi yapıldı. Eser takibinde SymbTr yerine makam alıştırmaları ve
kullanıcının kendi yazdığı ezgiler var (lisans sorusu açık kaldığı için). Makam dizileri ve usul vuruşları
çeşni tanımlarından kuruldu; bir hocaya ya da Sol klarnetçiye kontrol ettirilmeli.

## Alternatif parmak pozisyonları — tamamlandı (3 Ekim 2026)

Yazılı Mi3–Mi♭7 aralığında 48 temel parmak ve 76 alternatif eklendi ([ocl_alt_3](https://www.wfg.woodwind.org/clarinet/ocl_alt_3.html) ve [ocl_alt_4](https://www.wfg.woodwind.org/clarinet/ocl_alt_4.html) dahil). Alternatiflerin bir Türk Sol klarnetçisi tarafından gerçek çalgıda kontrol edilmesi hâlâ gerekiyor.

Amaç: her nota için temel parmağın yanında Albert sistemde çalınabilen alternatif parmakları da göstermek.

**Kaynak:** WFG alternatif parmak sayfaları ([chalumeau](https://www.wfg.woodwind.org/clarinet/ocl_alt_1.html), [klarino](https://www.wfg.woodwind.org/clarinet/ocl_alt_2.html)). Yazılı Mi3–Do6 aralığında temel parmaklar dahil yaklaşık 76 parmak var.

**Kapsam:**

- [x] Alternatif parmakları WFG'den derle, her biri için kaynağın açıklamasını (ör. "basit havalandırma parmağı") sakla.
- [x] Yalnızca Oehler'de olan mandalları kullananları ayıkla (ör. sol serçe Sol♯/Si♭, sol Fa ince mandalı); mevcut `keyInfo` kontrolü bunları zaten reddediyor.
- [x] Veri yapısını nota başına parmak listesine çevir; ilk eleman temel parmak kalsın.
- [x] Arayüz: parmak kartında "Temel / Alt. 1 / Alt. 2…" seçimi; çizim ve adım adım talimat seçilene göre güncellensin.
- [x] Her alternatifin yanında ne için kullanıldığı (tril, temiz ses, perde düzeltme) kısa notla yazsın.
- [x] Testler: tüm alternatifler ayrıştırılabiliyor, Albert mandallarıyla çalınabiliyor ve şemada çiziliyor.

**Kabul kriterleri:** Alternatifi olan her notada seçim görünür; temel parmak varsayılan kalır; listedeki her parmak WFG ile birebir aynıdır.

**Doğrulama:** Alternatifler WFG'nin Oehler/Albert ortak tablosundan geliyor. Bir Türk Sol klarnetçisinin gerçek çalgı üzerinde kontrol etmesi gerekir.

**Sonraki adım fikri:** WFG'nin [çeyrek ses sayfası](https://www.wfg.woodwind.org/clarinet/ocl_qt_1.html) nim perdeler için parmak önerileri içeriyor; AEU koma perdeleriyle eşleştirilebilir.
