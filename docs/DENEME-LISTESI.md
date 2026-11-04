# Sol Klarnet — deneme listesi

Kodla bitmeyen işler burada toplu. `docs/BACKLOG.md`'deki "Uzman görmeli", "Uzman/hoca görmeli", "Gerçek klarnetle
denenmeli", "Gerçek cihazda denenmeli" ve "İnsan gerektiren işler" maddeleri 4 Kasım 2026'da tek tek kodla karşılaştırıldı.
Kodda çözülmüş olanlar çıkarıldı; hangileri çıkarıldığı en sondaki ekte yazıyor.

**Koddan sayılan güncel değerler (4 Kasım 2026):** 9 ünitede 87 ders ve 9 ünite sınavı; 48 notada 124 parmak (48 temel,
76 alternatif); 44 çeyrek seste 57 parmak; 20 makam; 28 etüt (11'i Trakya/Roman); 15 usul (7'si oyun havası); nota
arşivinde 2200 eser. Uzman kontrolünde 11 süsleme maddesi (9 süsleme, 2 etüt) ve 22 hoca sorusu var. BACKLOG'un eski
bölümlerindeki sayılar (72 ders, 24 etüt gibi) o günün sayılarıdır.

**Bu listede ölçülen şey:** Bugüne kadarki bütün ses sınamaları Si♭ klarnet kayıtları ve benzetimle yapıldı. Türk Sol
klarneti kaydı hiç yok; tarayıcı panelinde gerçek mikrofon da yoktu. Aşağıdaki eşiklerin hiçbiri gerçek çalışla
ayarlanmadı. Bir eşik değişecekse değerini tahminle değil, buradaki denemenin sonucuyla değiştir.

---

## 1. Telefonda ve klarnetle denenecekler

Sıra tek oturuş için kuruldu: önce kurulum, sonra sessiz oda ve tek başına çalınanlar, sonra hoparlörle eşlik, en sonda
klarnet gerektirmeyenler. E bölümü için çalabildiğin bir Uşşak, bir Hicaz ve bir Kürdî taksimi hazır olsun. Tek oturuşa
sığmazsa bölüm sonunda bırak. Haftalara yayılan iş H3'te.

Her madde için **Nerede** (ekranın yolu), **Yap**, **Bak** ve **Değişir** (sonuç kötüyse dokunulacak yer) yazıyor.
Eşiği olmayan maddelerde bulduğun hatayı not al.

### A. Hazırlık

- [ ] **A1. Uygulamayı telefona kur**
  - Nerede: bilgisayarda `npm run android:apk` (ayrıntı `docs/ANDROID.md`); çıkan APK'yı telefona yükle
  - Yap: uygulamayı aç, mikrofon iznini ver
  - Bak: Nota bul yalnız telefon uygulamasında çalışır, tarayıcıda denenmez. İlk açılışta örnek seslerin yüklenme süresi
    (1,9 MB; yüklenene kadar eski sentez çalar)
  - Değişir: eşik yok
- [ ] **A2. Önce ilerlemeni yedekle**
  - Nerede: Ayarlar → Yedek
  - Yap: yedek dosyasını al
  - Bak: B bölümündeki yeniden ölçme bitmiş dersleri açıp kapatabilir; deneme bitince yedekten dönebil
  - Değişir: eşik yok
- [ ] **A3. Gecikme ayarını yap**
  - Nerede: Çalış → Ritim → Ritim → Gecikme ayarı
  - Yap: Hoparlörle ölç; telefonu masaya koy, sessiz kal. Kulaklıkla çalışacaksan Çalarak ölç
  - Bak: kaç ms çıktı, iki ölçüm birbirine yakın mı. Ayar yapılmazsa gecikme 0 sayılır ve ritim sınaması, eşlikte usule
    oturma kayık çıkar
  - Değişir: `trainers.js` `calibrate`, `rhythm.lat` (bkz. B2)

### B. Seviye sınaması

Dersler listesinin altındaki "Seviyemi yeniden ölç". Karşılamada "Makam çalışıyorum" seçildiyse makam turları da gelir.

- [ ] **B1. On iki nota**
  - Nerede: Dersler → listenin altı → Seviyemi yeniden ölç
  - Yap: dizekteki 4 notayı adlandır, sonra 12 notayı sırayla çal
  - Bak: her nota 1,2 sn tutunca geçiyor mu; Mi3 ve Do6 gibi uçlarda geç kalıyor mu; yanlış nota "doğru" sayılıyor mu.
    Yalnız notanın çıkıp çıkmadığı ölçülür, ses kalitesi ölçülmez
  - Değişir: `onboard.js` `HOLD_MS` (1200), `READ_OK` (3), `CHECK` (nota grupları)
- [ ] **B2. Ritim turları, kulaklıksız**
  - Nerede: aynı sınama, notalardan sonra
  - Yap: dörtlük ve sekizlik turlarını telefon hoparlöründen duyarak çal; sonra Gecikme ayarı → Sıfırla deyip aynısını
    yeniden dene, bitince gecikmeyi tekrar ölç
  - Bak: bildiğin bir ritimde puan eşiği geçiyor mu. Sınamanın kendisi gecikme ayarı yaptırmıyor; ilk açılışta gecikme 0
    iken iyi çalan biri kalıyor mu, bu özellikle önemli
  - Değişir: `onboard.js` `RT` (`min` 55 ve 50); kalıyorsa sınamadan önce gecikme ölçülmesi gerekir (`practice.js`
    `SK.rhythmTry`, `trainers.js` `rhythmEval`)
- [ ] **B3. Makam turları**
  - Nerede: aynı sınama, ritimden sonra
  - Yap: Rast dizisi, Uşşak dizisi, en çok 40 sn Hicaz seyri
  - Bak: iyi çalınmış dizi geçiyor mu, bilerek kötü çalınan kalıyor mu. Seyir puanı gerçek bir Hicaz'a uyuyor mu; Uşşak'ta
    Segâh'ı pes basınca dizi eşiği nasıl davranıyor. Sonuç kartında hangi dersler bitmiş sayıldı
  - Değişir: `onboard.js` `MK` (seyir `min` 60, `sec` 40); dizi eşikleri derslerden gelir (`lessons.js`, Rast 0,5, Uşşak
    0,55). Hangi dersin sayılacağı hocaya sorulur (bkz. bölüm 2)

### C. Akort ekranı

Önce sessiz odada, sonra televizyon ya da konuşma açıkken.

- [ ] **C1. Pes notalar, kısık (pp)**
  - Nerede: Akort, mikrofon açık, telefon 50 cm–1 m uzakta
  - Yap: yazılı Mi3–Re4 arasını pp uzun ton çal
  - Bak: gösterge notayı alıyor mu. Sınamada telefon süzgecinden sonra pp pes notalar hassasiyetin altında kaldı;
    telefonların otomatik kazancının bunu kurtarıp kurtarmadığı bilinmiyor
  - Değişir: `app.js` ortam eşiği `Math.max(0.0015, noise*2.5)`; Ayarlar'daki hassasiyet (`sensitivityToRms`)
- [ ] **C2. Gürültülü odada pes notalar**
  - Nerede: Akort, gürültü açık
  - Yap: pes notaları mf çal, gürültü yokken çıkan sonuçla karşılaştır
  - Bak: nota bir oktav pes ya da tiz gösteriliyor mu. Gürültü denetimi pes notalarda oktav korumasını zayıflatıyor mu
  - Değişir: `core.js` `SUB_FLOOR` (3), `SUB_MIN_RATIO` (0,025)
- [ ] **C3. Register geçişi**
  - Nerede: Akort
  - Yap: register geçişini ve oktav atlamalarını hızlıca çal
  - Bak: gösterge anlık yanlış oktava sıçrıyor mu; gerçek oktav atlaması gereksiz gecikiyor mu (beklenen 80 ms'lik fark)
  - Değişir: `app.js` tick, `stab.push(noteKey(r), octJump ? 5 : undefined)`
- [ ] **C4. Hava sesi süzgeci**
  - Nerede: Ayarlar → Hava sesi süzgeci, sonra Akort
  - Yap: süzgeç açık ve kapalıyken aynı pp notaları ve nefes hışırtısını dene
  - Bak: açıkken hışırtı nota sanılmıyor mu; pp notalar kayboluyor mu
  - Değişir: `app.js` `minClarity: settings.breath ? 0.7 : 0`
- [ ] **C5. Dinleyerek diyapazon**
  - Nerede: Ayarlar → Dinleyerek ayarla
  - Yap: bir notayı 3 sn düz tut; sonra bilerek vibratolu çal
  - Bak: düz notada kabul ediyor, vibratoda reddediyor mu; çıkan Hz bildiğin akorda uyuyor mu
  - Değişir: `app.js` `a4listen`, `offs.length < 25` ve `q(0.8) - q(0.2) > 15`
- [ ] **C6. Akort izi ve makam perdeleri**
  - Nerede: Akort, makam seç (Uşşak), İcra akordu; ham perde eğrisine bak
  - Yap: Segâh'ı bildiğin gibi çıkarak ve inerek bas, sonra kayış ve çarpma yap
  - Bak: ince çizgi gerçek kayışı gösteriyor mu; tek hedef olan −1,5 koma çıkışta ve inişte nerede kalıyor. Bu sonuç hocaya
    sorulacak Uşşak Segâh'ı sorusuna ölçüm olarak eklenebilir
  - Değişir: eşik yok; akort kararı `learn.js` `ICRA`, `ICRA_INFO`
- [ ] **C7. Kamış süre sayımı**
  - Nerede: Ayarlar → Ekipmanım, bir kamış seç
  - Yap: oturuş boyunca etkin kalsın
  - Bak: oturuş sonunda süre gerçek çalma süresine yakın mı
  - Değişir: `equip.js` (`limitH` 25 saat varsayılan)

### D. Süsleme ve kayıt

- [ ] **D1. Süslemeler**
  - Nerede: Çalış → Ses ve teknik → Süsleme
  - Yap: üstten ve alttan çarpma, çarpmalı tekrar, üst ve alt mordan, yavaş ve hızlı tril, kayarak giriş, düşüş, grupetto;
    her birinden birkaç deneme ve bir de süslemesiz nota
  - Bak: iyi yaptıkların tanınıyor mu; süslemesiz nota süsleme sayılıyor mu
  - Değişir: `skills.js` `ORN` (ör. `grace` 20–120 ms, `trilEven` 0,2, `mordanTotal` 300, `grupettoNote` 160,
    `grupettoTotal` 450)
- [ ] **D2. Kayıt ve perde eğrisi**
  - Nerede: Çalış → Takip → Kayıt
  - Yap: bir Uşşak dizisini önce temiz, sonra bir perdeyi bilerek pes çal; eski kayıtla karşılaştır
  - Bak: pes, tiz, kayma ve titreklik işaretleri kulağına uyuyor mu; vibrato titreklik sayılıyor mu
  - Değişir: `skills.js` `INTON` (`offKoma` 1,5, `driftKoma` 1,5, `wobbleKoma` 0,8)

### E. Taksim

- [ ] **E1. Cümle bölme**
  - Nerede: Dersler → İleri seviye → Taksim 1: cümle kurma (kilitliyse listenin altındaki "tüm dersleri aç")
  - Yap: kısa cümlelerle, gerçek nefes aralarıyla taksim
  - Bak: puan çalığın cümle sayısına uyuyor mu; nefes aldığın yer yeni cümle sayılıyor mu
  - Değişir: `skills.js` `phraseAnalysis` `gapMs` (350)
- [ ] **E2. Benzer makam uyarısı**
  - Nerede: Çalış → Makam ve kulak → Seyir
  - Yap: temiz bir Uşşak, Hicaz ve Kürdî taksimi çal; sonra Uşşak'ta bilerek geçki yap
  - Bak: temiz taksimde yanlış alarm var mı; geçki "yanlış makama kayma" sayılıyor mu
  - Değişir: `skills.js` `similarDrift` (`0.08*total`, `2*tOwn`)
- [ ] **E3. Taksimde süsleme sayımı ve çözüm süresi**
  - Nerede: aynı ekran, 2 dakikalık bir taksim
  - Yap: kronometreyle bitirme ile sonucun gelişi arasını ölç
  - Bak: süsleme sayısı kulağına uyuyor mu; çözüm kaç saniye sürüyor, ekran donuyor mu
  - Değişir: `skills.js` `ornamentScan`, `ORN.scanStep` (3–10 koma)

### F. Eşlik, hoparlörden

Telefon hoparlöründe, kulaklıksız. Sızıntı en çok burada görünür.

- [ ] **F1. Eşlik sızıntısı**
  - Nerede: Eserler → Eşlik
  - Yap: mikrofon açık, önce çalmadan grubu dinlet, sonra üstüne çal
  - Bak: sen çalmıyorken ud ve bas nota sanılıyor mu; çalarken durak ve güçlü perdelerin sızıntı sanılıp atılıyor mu
  - Değişir: `practice.js` `bandFreqs`, `droneFloor` (son 15 sn'nin alt %5'i), `rms > floor*2`
- [ ] **F2. Usule oturma yüzdesi**
  - Nerede: Eşlik, Değerlendir açık; kasap, karşılama, Roman havası, çiftetelli, Rumeli
  - Yap: usule oturduğunu bildiğin bir oyun havası çal
  - Bak: yüzde gerçekçi mi. Yol haritasının hedefi %75
  - Değişir: `band.js` `Math.min(60, cellMs*0.3)` (±60 ms); `roadmap.js` `groove` `target` 75
- [ ] **F3. Grup beni izlesin**
  - Nerede: Eşlik → Grup beni izlesin
  - Yap: tempoyu yavaşça değiştir, dur, yeniden gir
  - Bak: grup temponu izliyor mu, yanlış tempoya kilitleniyor mu (sınamada %20'yi aşan ani değişimde 3:2'ye kilitlendi),
    durunca bekliyor, ilk notanla giriyor mu
  - Değişir: `follow.js` `GROOVE` (`tol`, `win`, `lo`, `hi`)
- [ ] **F4. Taksimle başla**
  - Nerede: Eşlik → Taksimle başla
  - Yap: taksimi durakta uzun notayla bitir, nefes al, oyun havasına gir
  - Bak: grup ilk notanla giriyor mu; taksimin ortasında yanlış giriyor mu
  - Değişir: `band.js` `r.hold.last - r.hold.since >= 800`
- [ ] **F5. Benimle çal**
  - Nerede: Eserler → Etüt ve eserler (ya da Nota arşivi) → Benimle çal
  - Yap: bir Trakya etüdünü çal, bir yerde 3 sn dur, biraz hızlan
  - Bak: grup seni izliyor mu, gereksiz bekliyor mu, kaldığın yerden devam ediyor mu
  - Değişir: `follow.js` `FOLLOW`, `followWait` (`Math.max(550, beatMs*0.85)`)

### G. Araçlar

- [ ] **G1. Kulaktan çıkar**
  - Nerede: Eserler → Kulaktan çıkar
  - Yap: bir kaydı yavaşlat, A–B döngüsü kur, işaret koy, Çevir'e aktar
  - Bak: perde bozulmadan yavaşlıyor mu; telefonda takılıyor mu
  - Değişir: eşik yok
- [ ] **G2. Kayıt yeri**
  - Nerede: Çalış → Takip → Kayıt
  - Yap: oturuşun sonunda kayıtlarının tuttuğu yere bak (telefonun uygulama depolaması)
  - Bak: son 50 kayıt tutuluyor; yer sorun oluyor mu
  - Değişir: `drills.js` `REC_KEEP` (50)
- [ ] **G3. Dinleyerek yaz**
  - Nerede: Eserler → Çevir → Dinleyerek yaz
  - Yap: kısa bir ezgi çal, düzeltme ekranına bak
  - Bak: nota ve süreler doğru mu
  - Değişir: `transcribe.js` eşikleri
- [ ] **G4. Nota bul**
  - Nerede: Eserler → Çevir → Nota bul (yalnız telefon uygulaması)
  - Yap: neyzen.com ve projetsm.com'da bir eser ara, nota indir, "Dosyayı kaydet" de
  - Bak: neyzen dizini çıkıyor mu; projetsm.com'a şifresiz istek gidiyor mu; GIF ve PDF iniyor, okunuyor mu
  - Değişir: `sources.js`, Android `network_security_config`, iOS ATS istisnası
- [ ] **G5. Dokunmatik ve parolalı PDF**
  - Nerede: Çevir, düzeltme ekranı
  - Yap: iki parmakla yakınlaştır; parolalı bir PDF seç
  - Bak: yakınlaştırma akıcı mı; parolalıda "parolasız kopya seç" uyarısı geliyor mu
  - Değişir: eşik yok (`convert.js`)
- [ ] **G6. Basılı nota fotoğrafı**
  - Nerede: Çevir → fotoğraf ya da PDF
  - Yap: farklı yayınlardan tarama, ekran görüntüsü ve telefon fotoğrafı oku; özellikle koma işaretli sayfalar, 150 dpi altı
    ve Leland/Bravura yazılı örnekler
  - Bak: çizgili bemol, ♯ ile büyük mücenneb ♯, iki bemol çizikli işaretler karışıyor mu. Karışıklık tablosu sentetik
  - Değişir: `omr.js` eşikleri; örnekleri `testdata/omr/` altına koy (depoya girmez), `testdata/omr/README.md`

### H. Dinleme ve kayıt toplama

Klarnet gerektirmeyen dinleme ile sonraya kalabilecek işler.

- [ ] **H1. Sesleri dinle**
  - Nerede: Parmak, ders "Dinle" adımları, Eşlik
  - Yap: klarnet (Si♭ kaydı, perde ayarlı), darbuka, ud ve bas seslerini dinle
  - Bak: kulağa nasıl geliyor; ud sentez, gerçek kayıt değil
  - Değişir: `sampler.js`, `band.js`
- [ ] **H2. Sol klarnet kayıtları**
  - Nerede: telefonla kayıt; liste `testdata/README.md` "Neler kaydedilmeli"
  - Yap: her notada uzun ton (pp, mf, ff), makam perdeleri, süslemeler, gürültülü oda; dosyaları `testdata/` altına koy,
    `npm run audio-check` çalıştır
  - Bak: hangi notalar yanlış çıkıyor. Bu, listedeki en değerli iş: bütün eşikler ilk kez gerçek sesle ölçülür
  - Değişir: `core.js` `detectPitch`; süsleme için `ORN`, eğri için `INTON`
- [ ] **H3. Ses kararlılığı ve zayıf beceri (birkaç hafta)**
  - Nerede: Takip → İlerleme → Gelişim (haftalara göre); hoca kartı
  - Yap: normal çalışmaya devam et, en az 8 hafta sonra bak
  - Bak: ses kararlılığı eğrisi hafta hafta anlamlı değişiyor mu; "önce bunu toparlayalım" kartı doğru zamanda mı geliyor
  - Değişir: `roadmap.js` `WEAK_SKILLS` (`eps` 8 puan, yayılımda 0,15 koma)

---

## 2. Hocaya sorulacaklar

**Nasıl sorulur:** Ayarlar → Uzman kontrolü → Sorular sekmesinde aşağıdaki 22 sorunun hepsi seçenek ve not kutusuyla var;
cevaplar "Raporu paylaş" ile gelen rapora girer. Her sorunun kimliği (`saba-perde` gibi) raporda da yazar.

**Sekmelerde ayrıca işaretlenecekler:** Parmaklar (124 parmak ve "+ ¼" satırlarında 57 çeyrek ses parmağı), Makamlar (20
makamın dizisi, durağı, güçlüsü, seyir türü ve icra düzeltmeleri), Süslemeler (9 tanım ve 2 süslemeli etüt). Yanlış
bulunanlar `core.js` (`FINGERINGS`, `ALT_FINGERINGS`, `QT_FINGERINGS`), `learn.js` (`MAKAMS`, `SEYIR_TYPE`, `ICRA`),
`repertoire.js` (`ETUDES`) ve `skills.js` (`ORN`) içinde düzeltilir. 87 dersin metni ve 28 etüt uygulamada dersleri
okuyarak gözden geçirilir; ekranda ders başına işaret yok.

Aşağıda **Teori** yazılı kaynağın dediği, **İcra** ölçüm ya da nota verisi, **Uygulamada** bugün kodda olandır. Üçü de
kesin hüküm değildir; **Hocaya soru** öğretmen görüşünü almak içindir. Kaynak ayrıntısı `docs/KAYNAKLAR.md`.

### Çeşni ve perde kararları

**`saba-perde` — Saba dizisinde Hüseynî mi, Dik Hisar mı?**
- Uygulamada: dizide Hüseynî (40). Bu yüzden Saba'nın Çargâh'taki Hicazı çeşni listesinde çıkmıyor, metinde yazılı
- Teori: TDV Sabâ perde listesinde ve Zirgüleli Hicaz tarifinde Dik Hisar (39, koma bemollü mi) der; aynı maddenin
  donanımında mi için işaret yoktur
- İcra: SymbTr'deki 66 Saba eserinde bu perde 40 yazılı (süreye göre %9,9), 39 neredeyse hiç yok. Bu notanın yazılışıdır,
  çalınan perdenin ölçümü değildir
- Hocaya soru: Sol klarnette bu perdeyi nasıl öğretiyorsunuz?
- Cevap değiştirir: `learn.js` `MAKAMS` saba, `teori.js` çeşni metni, `KAYNAKLAR.md` §2a

**`nihavend-hicaz` — Nihâvend'in Nevâ'daki dörtlüsü**
- Uygulamada: çıkışta Nevâ, Nim Hisar, Evç, Gerdâniye (4, 13, 5 koma); çeşni listesi bunu "(B A S)" biçimiyle Hicaz
  dörtlüsünde gösteriyor. İnerken Evç yerine Acem
- Teori: TDV bu dörtlüye Hicaz der, biçimini söylemez. B A13 S'yi TDV Hüseynî'deki Hicaz için söyler
- İcra: ölçüm yok
- Hocaya soru: Bu dörtlü Hicaz sayılır mı, biçimi böyle mi?
- Cevap değiştirir: `learn.js` `MAKAMS` nihavend, `teori.js` Hicaz dörtlüsünün `alt` biçimi

**`ussak-segah` — Uşşak Segâh'ının icra akordu**
- Uygulamada: Uşşak, Bayâtî, Karcığar ve Hüseynî'de Segâh çıkışta da inişte de −1,5 koma ölçülüyor (aralık −2 ile −1).
  Çıkış ve iniş için ayrı hedef yok, asma kararda da aynı
- Teori: TDV Uşşak, inici seyirde 1–2 koma pes der, asma kararda değil
- İcra: Gürbüz 1983 ölçümü (Yarman 2008'de aktarılır): Dügâh'tan inerken 133, çıkarken 159 sent; AEU'da 181 sent. Yani
  ölçüm çıkarken de pes verir
- Hocaya soru: Öğrenciye hangi hedef gösterilsin?
- Cevap değiştirir: `learn.js` `ICRA`, `ICRA_INFO`, `SEGAH_USSAK`; ayrı hedef seçilirse ölçüm kodu da (`perdeTarget`)

### Seviye sınaması

**`sinama-huseyni` — Hüseynî ölçülmeden bitmiş sayılsın mı?**
- Uygulamada: Rast, Uşşak ve Hicaz turları geçilince `huseyni` dersi de bitmiş sayılıyor, ayrıca çalınmıyor. Gerekçe:
  dizisi Uşşak'a yakın ve ders zincirinde Hicaz'dan önce
- Teori: uygulamanın dizilerinde iki makam çıkışta Evç/Acem ile ayrılır; güçlüleri (Hüseynî, Nevâ) ve seyir türleri farklı
- Hocaya soru: Bu kısayol uygun mu?
- Cevap değiştirir: `onboard.js` `MK` (`lessons`)

**`sinama-hicaz` — Kısa Hicaz seyri yeterli gösterge mi?**
- Uygulamada: en çok 40 sn, eşik 60 (Taksim 2: seyir dersinin Hicaz adımı gibi). Geçen kişi için `huseyni` ve `hicaz`
  bitmiş sayılır; Makam sınavı geçilmiş sayılmaz. Ölçüm perde, durak ve güçlüye bakar; ezginin güzelliğini ölçemez
- Hocaya soru: Temel makamları bilen biri için bu yeterli gösterge mi?
- Cevap değiştirir: `onboard.js` `MK`

**`sinama-turlar` — Üç turun seçimi ve eşikleri**
- Uygulamada: Rast dizisi %50, Uşşak dizisi %55, Hicaz seyri 60; turlar sırayla, tutmayan tur bölümü bitirir. Makamlar
  ünitesinin 21 dersinden en çok 5'i geçilir
- Hocaya soru: Turlar ve eşikler uygun mu?
- Cevap değiştirir: `onboard.js` `MK`, `lessons.js` dizi adımları

**`sinama-sonraki` — Tutmayan turdan sonraki turların eski kaydı kalsın mı?**
- Uygulamada: yeniden ölçmede tutmayan turun önceki sınamadan kalan kaydı silinir; sonraki turlar çalınmadığı için kayıtları
  kalır (Boğaz tutmazsa Register ve Klarino, Uşşak tutmazsa Hüseynî ve Hicaz). Önceki sınamanın ölçümü geçerli sayılıyor
- Hocaya soru: Bir grubu çalamayan sonrakini de çalamaz mı sayılmalı, yoksa eski ölçüm dursun mu?
- Cevap değiştirir: `onboard.js` `finish`

### Kapı sırası

**`kapi-makam` — Makam dersleri Register sınavından sonra mı?**
- Uygulamada: teknik, hız, süsleme, makam ve Trakya üniteleri Register sınavı geçilince birlikte açılıyor; makam için
  teknik ünitesini bitirmek gerekmiyor
- Cevap değiştirir: `lessons.js` `GATE_AFTER`

**`kapi-ileri` — İleri seviye Makam sınavından sonra mı?**
- Uygulamada: İleri ünitesi (beş taksim dersi, ileri kulak, iç tempo, deşifre, dikte) kapıda yalnız Makam sınavına bağlı;
  teknik, hız, süsleme ve Trakya sınavları şart değil. Ama ilk dersi, listede önündeki Trakya'nın son dersi bitmeden
  açılmıyor: Makam sınavını geçen, Trakya dersleri bitmemişse İleri'ye giremiyor. Trakya şart olsun mu?
- Cevap değiştirir: `lessons.js` `GATE_AFTER`, `unlocked` son satırı

**`kapi-taslar` — Kilometre taşları ilerlemeyi durdursun mu?**
- Uygulamada: kapılar yalnız ünite sınavı; yol haritasındaki ölçülen kilometre taşlarını hoca kartı yalnız öneriyor. Dersler
  bitince kart taşı söyler; taş iki ayrı günde denenip ya da üç çalışılan günde tutmazsa sıradaki derse geçer, taş yan öneri
  olur (`MILE_STUCK`)
- Cevap değiştirir: `lessons.js` `gateFor`, `roadmap.js` `coachNext`, `MILE_STUCK`

### Parmak

**`ceyrek-57` — 57 çeyrek ses parmağı Türk Sol klarnetinde kullanılır mı?**
- Uygulamada: 44 çeyrek seste 57 parmak, WFG Oehler/Albert tablosundan (A. Wendl). Parmak kartında "doğrulanmamış"
  grubunda; ses kalitesi, geçiş ve kullanım yeri "bilinmiyor" yazılı
- Hocaya soru: Parmaklar sekmesindeki "+ ¼" satırlarını tek tek işaretleyin; burada genel kanı. Ses kalitesi, geçiş ve
  kullanım yeri için ayrı alan yok, yorum kutusuna yazılır
- Cevap değiştirir: `core.js` `QT_FINGERINGS`; `app.js` `showFingerings` uyarısı

**`a-mandal` — "a" mandalı hangi mandal?**
- Uygulamada: WFG'ye göre sağ orta deliğin üstündeki mandal; şemada öyle çiziliyor. 3 çeyrek ses parmağı bunu kullanıyor
- Hocaya soru: Türk Sol klarnetinde karşılığı hangisi?
- Cevap değiştirir: `core.js` `keyInfo`, `QT_A`; `app.js` mandal adı (`k-a-rh`); `index.html` şema gerekirse

### Makam ve taksim öğretimi

**`benzer-makam` — Benzer makam listeleri öğretici mi?**
- Uygulamada: aynı durakta, dizisi en çok iki perdeyle ayrılan makamlar dizilerden hesaplanıyor (ör. Hüseynî, Uşşak'a Evç
  farkıyla benzer). Dizi yakınlığı müzikal yakınlıkla her zaman örtüşmez
- Cevap değiştirir: `drills.js` `similarMakams(mk, 2)` kullanımı, gerekirse elle dışlama

**`taksim-cesni` — "İlk çeşni = durak ile güçlü arası" sadeleştirmesi**
- Uygulamada: Taksim 3 bu sadeleştirmeyle ölçüyor; metin de uygulamanın sadeleştirmesi olduğunu söylüyor
- Cevap değiştirir: `skills.js` `phraseAnalysis`, `lessons.js` Taksim 3 metni

**`taksim-karar` — Karar için "üstten ya da yedenden"**
- Uygulamada: son cümle durakta, son nota en az 800 ms, durağa üstten ya da yedenden gelinmesi
- Cevap değiştirir: `skills.js` `phraseAnalysis`

**`taksim-gecki` — Geçki ile yanlış makama kaymayı ayırmak**
- Uygulamada: çalınan sürenin en az %8'i benzer makamın ayırt edici perdesinde geçer ve bu, o makamın karşılık gelen
  perdesinin en az iki katıysa uyarı çıkıyor. Yapay notalarla denendi (bkz. E2)
- Cevap değiştirir: `skills.js` `similarDrift`

**`gecme-esik` — Taksim derslerinin geçme eşikleri**
- Uygulamada: seyir adımlarında 55–75 (cümle 60–65, çeşni 65, karar 75)
- Cevap değiştirir: `lessons.js` adımlardaki `min`

### Metin ve üslup

**`kendim-akort` — Kendim akordu hocalar için kullanışlı mı?**
- Uygulamada: akort ekranında makam başına her perdeye −3…+3 koma, 0,5 adım; çıkış ve iniş ayrı girilemiyor
- Cevap değiştirir: `app.js` Kendim düzenleyicisi, `learn.js` `setCustomIcra`

**`oyun-havasi` — Oyun havası çalışları ve Trakya etütleri**
- Uygulamada: yedi oyun havası usulünün düm-tek kalıpları, ikinci çalışlar, dolgular; Nikriz dizisi ve 11 Trakya/Roman
  etüdü. Metin "yaygın bir çalış; yöreye, icracıya ve oyuna göre değişir" diyor. Zeybek kaynağı `KAYNAKLAR.md` §4'te kısmi
- Hocaya soru: Bir Trakya ya da Roman klarnetçisine dinletilmeli
- Cevap değiştirir: `learn.js` `USULS`, `band.js` `BAND_STYLES`, `repertoire.js` `ETUDES`

**`baslangic-metin` — Başlangıç dersleri ve kontrol listeleri**
- Uygulamada: kamış, eller, ağızlık, uzun ses, dil, ilk geçişler ve nefes dersleri sonradan yazıldı; oturuş açısı, dudak ve
  nefes anlatımı, Albert el pozisyonları gözden geçirilmedi. Oturuşta 5, ellerde 6 maddelik kontrol listesi var
- Cevap değiştirir: `lessons.js` Başlarken ünitesi

**`uslup-metin` — "Üslup üzerine" metni**
- Uygulamada: klasik, Trakya-Roman ve modern icrayı doğru-yanlış değil üslup olarak anlatıyor; bugünkü videoların hepsi
  Çorlu'dan iki hocanın tavrı
- Cevap değiştirir: `videos.js`

**`hiz-unite` — Hız ünitesi**
- Uygulamada: 7 ders; gam ve arpej seçimi, hedef tempolar, hızlı Hicaz etüdü (`e-hiz-hicaz`)
- Cevap değiştirir: `lessons.js` hız ünitesi, `repertoire.js` `ETUDES`

---

## Ek: bu listeye girmeyenler

**Deneme ya da hoca sorusu olmayan insan işleri.** İzinler ve eser kararı: `docs/LISANSLAR.md` (WFG, neyzen.com; eserlerin
arşivden çıkarılıp çıkarılmayacağı). Mağaza hesapları ve yükleme anahtarı: `docs/TODO.md`. Çekilecek ya da izinle
bağlanacak içerik: eller, nefes ve kamış takma için kısa videolar; farklı icracı ve üsluplardan örnekler.

**Koda bakılıp çıkarılanlar.** BACKLOG'da açık gibi duruyor ama kodda çözülmüş ya da eskimiş:

| BACKLOG'da yazan | Kodda bugün |
|---|---|
| Nota çevirici: Leland çizgili bemol düz bemol okunuyor | `omr.js` `hiddenSlash`, `flat_slash` okuyor; gerçek fotoğraf denemesi G6'da |
| Nota çevirici: uzun PDF'te sayfa ve bellek sınırı yok | `convert.js` `CV_PAGE_LIMIT` = 15 |
| Nota çevirici: "D.S." yazısı okunmuyor | Hâlâ okunmuyor ama her okumada uyarı ve "İşaret" listesi var; denenecek bir şey değil, bilinen sınır |
| Tablo 1.1: `audio-check` zinciri oktav korumasını içermiyor | Aşama 1'de eklendi |
| Tablo 2.3: halk ritimleri tek kalıp, not yalnız kodda | `usuller.js` metni "yaygın bir çalış" diyor; açık kalan `oyun-havasi` sorusu |
| Aşama 2: "Yapılmadı (aşama 3–4)" | Makam karşılaştırması, taksim–makam bağı ve üslup etiketleri yapıldı |
| 27 Ekim: "Yapılmadı: çeyrek ses parmakları" | 1 Kasım'da yapıldı |
| İnsan işleri 1: "72 ders", "24 etüt"; Aşama 2: "Toplam ders 84" | 87 ders, 28 etüt |
| İnsan işleri 1: "testler tutarlılığı denetler" | Projede test yok; tutarlılık elle denetlenir |
| İnsan işleri 4: mağaza ekran görüntüleri ve tanıtım görseli | `store/` içinde hazır; kalan hesap işleri `TODO.md`'de |
| İnsan işleri 6: "Telifli eserler eklenmedi", "SymbTr'den seçki eklenecekse" | Arşivde 2200 eser var; `lisans-disla.csv` 690 telifli eser sayıyor, karar `LISANSLAR.md`'de |
| 4 Ekim: makam dizileri ve usul vuruşları hocaya kontrol ettirilmeli | Klasik usuller ve makam dizileri TDV ile karşılaştırıldı (`KAYNAKLAR.md`); kalan kısmı Makamlar sekmesi ve `oyun-havasi` |

**Önerilip yapılmayan:** Tablo 1.3'ün "Uzman kontrolünde kalite ve geçiş puanı toplanır" maddesi yapılmadı; çeyrek ses
satırlarında yalnız doğru/yanlış ve yorum var.
