# Kaynaklar ve doğrulama

Uygulamadaki bilgi içeren her bölüm (perdeler, makamlar, icra akordu, usuller, teori, parmak tabloları, sorunlar)
aşağıdaki kaynaklarla karşılaştırıldı. Doğrulama 2026-10-31'de yapıldı: TDV maddelerinin metni ve usul şemaları
(resim) sitelerinden indirilip okundu, bağlantıların hepsi açılıp başlıkları kontrol edildi.

Durum işaretleri:
- ✅ **Doğrulandı**: kaynakla aynı.
- 🔧 **Düzeltildi**: kaynakla çelişiyordu, kaynağa göre değiştirildi (ne değiştiği yazılı).
- ⚠️ **Kısmen**: kaynak var ama tam bu biçimde değil ya da kaynaklar ayrışıyor; nedeni yazılı.
- ❔ **Kaynaksız**: yazılı bir kaynak bulunamadı; uygulamada yaygın icra olarak duruyor.

Ana kaynak **TDV İslâm Ansiklopedisi** (İSAM). Makam maddelerinin çoğu İsmail Hakkı Özkan'ın, bir kısmı Cinuçen
Tanrıkorur'undur; Arel-Ezgi-Uzdilek (AEU) nazariyatını izlerler. Uygulamanın komaları da AEU'dur.

---

## 1. Ses sistemi, aralıklar ve perdeler (`core.js` PERDES, `teori.js`)

| Bilgi | Uygulamada | Kaynak | Durum |
|---|---|---|---|
| Oktav 53 koma, tam ses (tanini) 9 koma | `teori.js` koma konusu | [Wikipedia, Turkish makam](https://en.wikipedia.org/wiki/Turkish_makam) aralık tablosu | ✅ |
| Aralıklar: koma 1 (F), bakiye 4 (B), küçük mücenneb 5 (S), büyük mücenneb 8 (K), tanini 9 (T), artık ikili 12–13 (A) | `teori.js` TH_IV, aralık tablosu | aynı tablo | ✅ |
| Düz diyez +4 (bakiye), düz bemol −5 (küçük mücenneb), çizgili bemol −4 (bakiye bemolü), ayrıca ±1, +5, ±8 işaretleri | `teori.js`, dizek çizimi | Wikipedia Turkish makam, “Accidentals” tablosu | ✅ |
| Tam dörtlü 22, tam beşli 31 koma; dörtlü ve beşlilerin aralık dizileri (Rast T K S T, Uşşak K S T, Bûselik T B T, Kürdî B T T, Hicaz S A S, Çargâh T T B) | `teori.js` TH_CESNI | Wikipedia Turkish makam (dörtlü/beşli şekli); TDV maddelerinde aynı aralık harfleri (ör. Segâh beşlisi “S T K T”, Saba dörtlüsü “K S S”, Nikriz’in 26 komalık artık dörtlüsü) | ✅ |
| Perde komaları (Rast 0, Dügâh 9, Kürdî 13, Dik Kürdî 14, Segâh 17, Bûselik 18, Çargâh 22, Nim Hicaz 26, Hicaz 27, Nevâ 31, Nim Hisar 35, Hisar 36, Dik Hisar 39, Hüseynî 40, Acem 44, Evç 48, Mâhur 49, Gerdâniye 53 …; Irak −5, Geveşt −4, Acem Aşîran −9, Hüseynî Aşîran −13, Yegâh −22) | `core.js` PERDES | TDV maddelerindeki perde tanımları: Hicaz = Çargâh + küçük mücenneb diyezi (27), Hisar = Nevâ + küçük mücenneb diyezi (36), Irak = bakiye diyezli fa (−5), Geveşt = küçük mücenneb diyezli fa (−4), Kürdî = bakiye diyezli la (13), Segâh = koma bemollü si (17), Dik Hisar = koma bemollü mi (39), Nim Hisar = küçük mücenneb bemollü mi (35). Bkz. [Rast](https://islamansiklopedisi.org.tr/rast), [Hüzzam](https://islamansiklopedisi.org.tr/huzzam), [Segâh](https://islamansiklopedisi.org.tr/segah), [Mâhur](https://islamansiklopedisi.org.tr/mahur), [Nihâvend](https://islamansiklopedisi.org.tr/nihavend--musiki) | ✅ |
| Rast’ın altındaki perdeler Irak, Acem Aşîran, Hüseynî Aşîran, Yegâh; “Kaba” bir oktav pes, “Tiz” bir oktav tiz | `teori.js` perde konusu | TDV [Acem-Aşiran](https://islamansiklopedisi.org.tr/acem-asiran) (“bir oktav pestindeki fa notasına kaba acem-aşiran”), [Rast](https://islamansiklopedisi.org.tr/rast) (yegâh) | ✅ |

## 2. Makamlar (`learn.js` MAKAMS, SEYIR_TYPE; `lessons.js` makam dersleri)

Her makam için durak, güçlü, yeden, dizi (asc/desc) ve seyir türü TDV maddesiyle karşılaştırıldı.

| Makam | TDV maddesi | Durum ve not |
|---|---|---|
| Rast | [Rast](https://islamansiklopedisi.org.tr/rast) (Özkan, 2007, c. 34 s. 461-462) | ✅ çıkıcı; Rast beşlisi + Nevâ’da Rast dörtlüsü; güçlü Nevâ, yeden Irak; inerken Evç yerine Acem (acemli rast) |
| Uşşak | [Uşşak](https://islamansiklopedisi.org.tr/ussak) (Özkan, 2012, c. 42 s. 231-232) | ✅ çıkıcı; Uşşak dörtlüsü + Nevâ’da Bûselik beşlisi; güçlü Nevâ, yeden Rast |
| Hüseynî | [Hüseynî](https://islamansiklopedisi.org.tr/huseyni) (Özkan, 1999, c. 19 s. 21-22) | ✅ inici-çıkıcı; Hüseynî beşlisi + Hüseynî’de Uşşak dörtlüsü; güçlü Hüseynî, yeden Rast; inerken Acem |
| Hicaz | [Hicaz](https://islamansiklopedisi.org.tr/hicaz--musiki) (Özkan, 1998, c. 17 s. 440-441) | 🔧 seyir metni: “ezgi Nevâ civarından başlar” → “durak ya da güçlü civarından başlar” (TDV). “İnerken Acem” yerine TDV’deki “Nevâ’da acemli rast” genişlemesi yazıldı. Diğerleri ✅ (inici-çıkıcı, bazen çıkıcı; güçlü Nevâ, Rast çeşnisiyle yarım karar; yeden Rast) |
| Hüzzam | [Hüzzam](https://islamansiklopedisi.org.tr/huzzam) (Özkan, 1999, c. 19 s. 76-77) | 🔧 **yeden Dügâh → Kürdî** (TDV: “yedeni … bakiye diyezli la (kürdî)”). Diğerleri ✅ (inici-çıkıcı; güçlü Nevâ, Hicaz çeşnisiyle yarım karar; Hisar değişken, uygulamada tiz). Dizinin üst kısmı (Muhayyer, Tiz Segâh) TDV’nin “Nevâ’daki Hicaz dörtlüsü Hümâyun dizisi olarak uzanır” tarifine uyar |
| Segâh | [Segâh](https://islamansiklopedisi.org.tr/segah) (Özkan, 2009, c. 36 s. 304-306) | 🔧 **yeden Dügâh → Kürdî** (TDV). 🔧 **çıkıcı dizide Hüseynî → Dik Hisar**: Segâh beşlisi S T K T = Segâh, Çargâh, Nevâ, Dik Hisar, Evç. İnici dizi TDV’deki eksik ferahnâk biçimi (Hüseynî, Acem). Güçlü Nevâ ✅, çıkıcı ✅ |
| Saba | [Sabâ](https://islamansiklopedisi.org.tr/saba) (Özkan, 2008, c. 35 s. 328-330) | ✅ çıkıcı ya da çıkıcı-inici; Saba dörtlüsü K S S; güçlü Çargâh, Zirgüleli Hicaz çeşnisiyle yarım karar; yeden Rast; tiz durak tam sekizli değil |
| Kürdî | [Kürdî](https://islamansiklopedisi.org.tr/kurdi) (Özkan, 2002, c. 26 s. 563-564) | 🔧 seyir türüne “bazen çıkıcı-inici” ve Nevâ’daki Bûselik’li yarım karar eklendi. Diğerleri ✅ |
| Nihâvend | [Nihâvend](https://islamansiklopedisi.org.tr/nihavend--musiki) (Özkan, 2007, c. 33 s. 99-100) | 🔧 “(çıkarken) Hicaz” kaldırıldı: TDV Nevâ’da Kürdî ya da Hicaz dörtlüsü der, yönle bağlamaz; yarım karar çoğunlukla Kürdî’yle. Uygulamanın asc dizisinde Hicaz, desc dizisinde Kürdî olması iki biçimi birlikte göstermek içindir. Diğerleri ✅ (yeden Irak, asma kararlar Nim Hisar ve Çargâh) |
| Bayâtî | [Bayatî](https://islamansiklopedisi.org.tr/bayati--musiki) (Tanrıkorur, 1992, c. 5 s. 220) | ✅ Uşşak’la aynı dizi, seyri orta bölgeden (güçlü civarından) başlar; güçlü Nevâ |
| Karcığar | [Karcığar](https://islamansiklopedisi.org.tr/karcigar) (Özkan, 2001, c. 24 s. 484) | ✅ inici-çıkıcı; Uşşak dörtlüsü + Nevâ’da Hicaz beşlisi; güçlü Nevâ, yeden Rast |
| Hümâyun | [Hümâyun](https://islamansiklopedisi.org.tr/humayun--musiki) (Özkan, 1998, c. 18 s. 480-481) | ✅ inici-çıkıcı, bazen çıkıcı; Hicaz dörtlüsü + Nevâ’da Bûselik beşlisi; güçlü Nevâ (Bûselik’le) |
| Uzzâl | [Uzzâl](https://islamansiklopedisi.org.tr/uzzal) (Özkan, 2012, c. 42 s. 269-270) | ✅ inici-çıkıcı, bazen çıkıcı; dizi Dügâh, Dik Kürdî, Nim Hicaz, Nevâ, Hüseynî, Evç, Gerdâniye, Muhayyer; güçlü Hüseynî; inerken Acem |
| Zirgüleli Hicaz | [Zirgüleli Hicaz](https://islamansiklopedisi.org.tr/zirguleli-hicaz) (Özkan, 2013, c. 44 s. 457-458) | 🔧 **büyük düzeltme.** Eski: çıkıcı, güçlü Nevâ, yeden Rast, dizi Nevâ’da Hicaz. TDV: **inici-çıkıcı**, Dügâh’ta Hicaz beşlisi + **Hüseynî’de** Hicaz dörtlüsü; dizi Dügâh, Dik Kürdî, Nim Hicaz, Nevâ, Hüseynî, **Dik Acem, Nim Şehnaz**, Muhayyer; **güçlü Hüseynî**, **yeden Nim Zirgüle**; seyir güçlü civarından başlar. Ders metni ve ezgisi de buna göre değişti |
| Sûzinak | [Sûzinak](https://islamansiklopedisi.org.tr/suzinak) (Özkan, 2010, c. 38 s. 8-10) | 🔧 **çıkıcı → inici-çıkıcı**; seyir Nevâ civarından başlar, Rast’ta genellikle yedensiz karar. Dizi ve güçlü ✅ |
| Hicazkâr | [Hicazkâr](https://islamansiklopedisi.org.tr/hicazkar) (Özkan, 1998, c. 17 s. 445-446) | 🔧 **inici-çıkıcı → inici**; **güçlü Nevâ → Gerdâniye** (TDV: birinci mertebe güçlü Gerdâniye, Nevâ ikinci); seyir Gerdâniye civarından. Dizi ✅ (Zirgüleli Hicaz’ın Rast’taki şeddi) |
| Kürdîli Hicazkâr | [Kürdili-Hicazkâr](https://islamansiklopedisi.org.tr/kurdili-hicazkar) (Özkan, 2002, c. 26 s. 565-567) | 🔧 **güçlü Çargâh → Gerdâniye**; “Çargâh’ta yarım karar” → “Gerdâniye’de yarım karar”. İnici ✅, yeden Acem Aşîran ✅, dizi ✅ |
| Mâhur | [Mâhur](https://islamansiklopedisi.org.tr/mahur) (Özkan, 2003, c. 27 s. 394-395) | 🔧 **güçlü Nevâ → Gerdâniye** (TDV: “inici bir makam olması münasebetiyle güçlüsü tiz durak gerdâniye”). İnici ✅, yeden Geveşt ✅, dizi ✅ |
| Acemaşîran | [Acem-Aşiran](https://islamansiklopedisi.org.tr/acem-asiran) (Tanrıkorur, 1988, c. 1 s. 322-323) | 🔧 **güçlü Çargâh → Acem** (TDV: “güçlüleri sırasıyla acem, çârgâh ve dügâh”); seyir metni TDV’nin tarifine göre yazıldı. İnici ✅, durak ✅. ⚠️ Yeden Hüseynî Aşîran TDV maddesinde geçmiyor; dizi Çargâh dizisinin göçürülmüşü olduğundan Çargâh’ın yedeni Bûselik’e (4 koma alttaki perde) karşılık gelen perdedir — aynı mantıkla TDV Mâhur’un yedenini Geveşt verir |
| Nikriz | [Nikriz](https://islamansiklopedisi.org.tr/nikriz) (Özkan, 2007, c. 33 s. 118-119) | 🔧 Nevâ’da **Rast ve Bûselik** dörtlüleri: çıkarken Evç, inerken Acem (eskiden yalnız Bûselik vardı); seyir türüne “inici-çıkıcı” eklendi. 🔧 “Roman havalarında çok sevilir” kaynaksızdı, kaldırıldı; yerine kaynaklı olan “Trakya karşılamalarında da kullanılır” yazıldı (bkz. §6). 🔧 **Kürdî → Dik Kürdî** (2026-11-04): beşli T B A S değil **T S A S**. TDV: donanımda “si için bakiye bemolü”, Dügâh’ta Hicaz dörtlüsü, “nîm-hicaz ve dik-kürdî perdeleri”; Uzzâl maddesi de Nikriz beşlisini Hicaz dörtlüsünün bir tanini altına koyar. SymbTr’deki 25 Nikriz eserinde süreye göre Dik Kürdî %9,3, Kürdî %0,4. Eski değer de 26 komalık artık dörtlüyü verdiği için önceki karşılaştırmada fark edilmemişti. `learn.js`, `lessons.js`, `repertoire.js` (Nikriz etüdü, Çiftetelli) düzeltildi |
| Muhayyer | [Muhayyer](https://islamansiklopedisi.org.tr/muhayyer) (Özkan, 2020, c. 31 s. 22-23) | S3.2 (erişim 15 Kasım 2026). Dizi Hüseynî’ninkiyle aynı (“hüseynî makamının inici şeklinden ibarettir”); **inici**; durak Dügâh; birinci güçlü tiz durak Muhayyer (Uşşak ya da Hüseynî’yle yarım karar), ikinci güçlü Hüseynî (Uşşak’la asma karar); yeden Rast; Nevâ’da Rast ya da Bûselik (Evç yerine Acem), Çargâh ve Segâh’ta asma kararlar. asc/desc Hüseynî’ninkiyle aynı alındı |
| Bûselik | [Bûselik](https://islamansiklopedisi.org.tr/buselik) (Yavaşça, 1992, c. 6 s. 467-468) | S3.2. **Çıkıcı**; durak Dügâh; güçlüler Hüseynî ve Çargâh; Bûselik beşlisi + Hüseynî’de Hicaz **ya da** Kürdî dörtlüsü (iki çeşit dizi; asc Hicaz, desc Kürdî iki biçimi göstermek için, Nihâvend’deki gibi); donanımsız, la minöre çok yakın. Hicaz dörtlüsü B A13 S ile Acem, Nim Şehnaz. ⚠️ **Yeden maddede yok**: Sultânîyegâh maddesi (“bûselik makamı dizisinin yegâh perdesine göçürülmesi”) yedeni durağın 5 koma altındaki Kaba Nim Hicaz verir; aynı aralık Dügâh’ta Nim Zirgüle (4) eder. Başlangıç bölgesi ve yarım karar maddede yok, metne yazılmadı |
| Muhayyer Kürdî | [Muhayyer-Kürdî](https://islamansiklopedisi.org.tr/muhayyer-kurdi) (Özkan, 2020, c. 31 s. 24) | S3.2. Muhayyer dizisinin sonuna Kürdî dörtlüsü (desc Kürdî’li); **inici**; güçlü Muhayyer (Uşşak ya da Hüseynî’yle yarım karar); yeden Rast; asma kararlar Nevâ (Rast, Bûselik), Çargâh, Segâh, Dügâh (Uşşak); Dügâh’ta Kürdî ile karar |
| Acemkürdî | [Acem-Kürdî](https://islamansiklopedisi.org.tr/acem-kurdi) (Tanrıkorur, 1988, c. 1 s. 325-326) | ❌ **eklenmedi.** Madde durak Dügâh, güçlüler Acem ve Çargâh, inici seyir ve Kürdî’yle karar der; **dizinin perdelerini ve yedeni vermez** (Acem makamının icrasından sonra Kürdî’ye geçilir). Dizi Acem ve Kürdî maddelerinden kurulabilir, ama Acem makamının dizisi uygulamada yok ve iki maddenin birleşimi yoruma kalır |
| Evç | [Eviç](https://islamansiklopedisi.org.tr/evic) (Özkan, 1995, c. 11 s. 521); yeden: [Irak](https://islamansiklopedisi.org.tr/irak--musiki) (Özkan, 1999, c. 19 s. 115-116) | S3.2. **İnici**; durak Irak; birinci güçlü Evç (Segâh’la yarım karar), ikinci güçlü Dügâh (Uşşak’lı kalış karakteristik); dizi “ırak makamı dizisinin inici şekli”: Irak’ta eksik Segâh beşlisi, yerinde Uşşak dizisi, Nevâ’da Rast beşlisi, Evç’te eksik Segâh beşlisi. Uygulamadaki dizi bu parçaların Irak–Evç arası: Irak, Rast, Dügâh, Segâh, Çargâh, Nevâ, Hüseynî, Evç (maddedeki şema resim, metin olarak okunamadı). ⚠️ **Yeden Eviç maddesinde yok**; Irak maddesi Irak’ın yedenini Acem Aşîran verir, Evç bu dizinin inici biçimi olduğundan aynı alındı. Arşiv kimliği `evic`, uygulamada da `evic` |
| Tâhir | [Tâhir](https://islamansiklopedisi.org.tr/tahir) (Özkan, 2010, c. 39 s. 393-394) | S3.2. **İnici**; Dügâh’ta Uşşak dörtlüsü + Nevâ’da Rast beşlisi (Nevâ makamının inici şekli); birinci güçlü Muhayyer (Uşşak’la yarım karar), ikinci güçlü Nevâ (Rast’la asma karar), yeden Rast; Hüseynî’de asma karar yapılmaz (Muhayyer’e benzer); inerken Evç yerine bazen Acem. Maddenin perde listesi (“dügâh, segâh, çârgâh, nevâ, eviç, gerdâniye ve muhayyer”) Hüseynî’yi saymaz; Nevâ’daki Rast beşlisi onu içerdiği için dizide var |
| Neveser | [Neveser](https://islamansiklopedisi.org.tr/neveser) (Özkan, 2007, c. 33 s. 43-44) | S3.2. İnici-çıkıcı, bazen çıkıcı; Rast’ta Nikriz beşlisi + Nevâ’da Hicaz dörtlüsü (Nihâvend dizisine Nim Hicaz eklenmiş); donanım si, mi bakiye bemol, fa, do bakiye diyez (Dik Kürdî, Hisar, Evç, Nim Hicaz); güçlü Nevâ (Hicaz’la yarım karar), yeden Irak; Rast’ta Nikriz’le çoğu zaman yedenli karar |
| Sûzidil | [Sûzidil](https://islamansiklopedisi.org.tr/suzidil) (Özkan, 2010, c. 38 s. 5-7) | S3.2. **Karar perdesi teyitli: Hüseynî Aşîran** (backlog şartı). Zirgüleli Hicaz’ın Hüseynî Aşîran’a göçürülmüşü; **inici**; birinci güçlü tiz durak Hüseynî (Zirgüleli Hicaz’la yarım karar), ikinci güçlü Bûselik; yeden Kaba Nim Hisar; inerken Nim Hisar yerine Nevâ, Dügâh’ta Bûselik’le asma karar. Maddenin perde listesi “hüseynî-aşiran, dik acem-aşiran, nîm-zirgüle, bûselik, çârgâh, nîm-hisar veya nevâ ve hüseynî” Dügâh’ı saymaz; Hicaz beşlisi (Hüseynî Aşîran–Bûselik) onu içerdiği ve madde Dügâh’taki asma kararı anlattığı için dizide var |
| Gerdâniye | [Gerdâniye](https://islamansiklopedisi.org.tr/gerdaniye) (Özkan, 1996, c. 14 s. 28-29) | S3.2. **İnici**; Rast dizisi + yerinde inici Hüseynî dizisi; birinci güçlü Gerdâniye (Rast’la yarım karar), ikinci Nevâ; durak Dügâh, yeden Rast; asma kararlar Muhayyer, Hüseynî (Uşşak), Nevâ, Çargâh, Segâh, Rast. Dizi perdeleri maddede sayılmaz; iki dizinin Dügâh–Muhayyer arası (Evç çıkarken, Acem inerken) |
| Nişâburek | [Nişâburek](https://islamansiklopedisi.org.tr/nisaburek) (Özkan, 2007, c. 33 s. 151-152) | S3.2. İnici-çıkıcı; Dügâh’ta Rast beşlisi + Hüseynî’de Bûselik ya da Rast dörtlüsü; donanım fa küçük mücennep diyezi (Mâhûr), do bakiye diyezi (Nim Hicaz); güçlü Hüseynî (çoğunlukla Bûselik’le yarım karar); Nim Hicaz en önemli asma karar perdesi; yeden Nim Zirgüle; Dügâh’ta yedenli karar. Dizi Bûselik dörtlüsüyle yazıldı |
| Şehnaz | [Şehnaz](https://islamansiklopedisi.org.tr/sehnaz) (Özkan, 2010, c. 38 s. 458-459) | S3.2. **İnici**; dizi “dügâh, dik-kürdî, nîm-hicaz, nevâ, hüseynî, acem veya dik-acem yahut eviç, gerdâniye, muhayyer” + Hüseynî’de Hümâyun dizisi (Dik Acem, Nim Şehnaz); uygulamada Dik Acem + Nim Şehnaz biçimi; birinci güçlü Muhayyer (Bûselik’le, Nim Şehnaz yedenli yarım karar), ikinci Hüseynî; yeden Rast (“bazı eserlerde bakiye diyezli sol”); Dügâh’ta Hicaz’la karar |
| Yegâh | [Yegâh](https://islamansiklopedisi.org.tr/yegah) (Özkan, 2013, c. 43 s. 387-388) | S3.2. **İnici**; yerinde Nevâ dizisi + Yegâh’ta Rast dizisi (“yegâh, hüseynî-aşiran, ırak, rast, dügâh, bûselik, nîm-hicaz veya çârgâh, nevâ”); güçlü Nevâ (Rast’la yarım karar), ikinci güçlü Dügâh; yeden Kaba Nim Hicaz; Yegâh’ta Rast’la yedenli ya da yedensiz karar. asc Yegâh’taki Rast dizisi, desc Nevâ dizisinin Uşşak dörtlüsü (Segâh, Çargâh). Durak yazılı Re4 |
| Sultânîyegâh | [Sultânîyegâh](https://islamansiklopedisi.org.tr/sultaniyegah) (Özkan, 2009, c. 37 s. 522-523) | S3.2. **İnici**; Bûselik dizisinin Yegâh’a göçürülmüşü: “yegâh, hüseynî-aşiran, acem-aşiran, rast, dügâh, dik-kürdî veya kürdî, nîm-hicaz veya çârgâh ve nevâ”; tiz tarafta Hicaz kural (asc), inişte Bûselik beşlisi + Kürdî dörtlüsü (desc); güçlü tiz durak Nevâ (Bûselik’le yarım karar), ikinci Dügâh; yeden Kaba Nim Hicaz |

Dersler (`lessons.js`) aynı makam bilgilerini tekrar ettiği için birlikte düzeltildi: Zirgüleli Hicaz, Sûzinak,
Hicazkâr, Kürdîli Hicazkâr, Acemaşîran ve Nikriz metinleri; Trakya ünitesindeki makam listesi (Kürdî → Karcığar, §6).

### 2a. Çeşniler (`teori.js` TH_CESNI, “Çeşni: dörtlü ve beşliler” konusu)

Metinler 2026-11-04’te TDV maddelerinden yazıldı. “Makamlarda” listeleri elle yazılmadı: `cesniYerleri` çeşninin
aralıklarını makamın `asc` ve `desc` dizilerinde arar. Bulduğu yerlerin önemli kısmı TDV’deki asma kararlarla örtüşür
(ör. Nikriz Çargâh’ta: Karcığar, Sûzinak, Hicazkâr; Hüzzam Segâh’ta: aynı üç makam; Çargâh, Kürdî’de: Nihâvend), ama
liste “dizide geçer” der, “ana yapıdadır” demez; ekranda da böyle yazılı. Çeşninin “rengi” için TDV’nin söylemediği
duygu sözleri yazılmadı. Aralık ve perde karşılaştırmaları (ör. Segâh ile Bûselik arası 1 koma) §1’deki perde komalarından
hesaptır.

| Çeşni | Metindeki bilgi | Kaynak | Durum |
|---|---|---|---|
| Genel | Dörtlü ve beşli tanımı; asma kararın bitiş hissi tam karardan zayıf | TDV [Makam](https://islamansiklopedisi.org.tr/makam--musiki) (“Dörtlü ve Beşliler”, “Kararlar”) | ✅ |
| Genel | “Çoğunlukla” 22/31 koma ve “çoğunlukla” dörtlü + tanini: Saba 18 koma, Nikriz S ile tamamlanır | TDV [Sabâ](https://islamansiklopedisi.org.tr/saba), [Nikriz](https://islamansiklopedisi.org.tr/nikriz) | 🔧 giriş metni kesin söylüyordu, yumuşatıldı |
| Rast | Dügâh’ta Uşşak dörtlüsü ve Uşşak çeşnili asma karar; Segâh’ta segâhlı ya da ferahnâkli asma kararlar karakteristik | TDV [Rast](https://islamansiklopedisi.org.tr/rast) | ✅ |
| Uşşak | İnici seyirde Segâh 1–2 koma pes, asma kararda değil; Dügâh–Segâh 6–7 koma (“eksik büyük mücennep”); notada işareti yok; Uşşak çeşnisinin bulunduğu bütün makamlarda; Segâh en önemli asma karar perdesi | TDV [Uşşak](https://islamansiklopedisi.org.tr/ussak) | ✅ |
| Hüseynî | Dizi (Hüseynî beşlisi + Hüseynî’de Uşşak), Uşşak çeşnili yarım karar, Dügâh’ta tam karar, Çargâh en karakteristik asma karar | TDV [Hüseynî](https://islamansiklopedisi.org.tr/huseyni) | ✅ K S T T aralık harfleri maddede metin olarak yok (şekilde); perdelerden çıkar |
| Bûselik | Bûselik makamı la minöre çok yakın; Bûselik dizileri minör; Nihâvend Bûselik dizisinin Rast’a göçürülmüşü; Uşşak, Kürdî, Hümâyun Nevâ’da Bûselik çeşnisiyle yarım karar | TDV [Bûselik](https://islamansiklopedisi.org.tr/buselik), [Mâhur](https://islamansiklopedisi.org.tr/mahur), [Nihâvend](https://islamansiklopedisi.org.tr/nihavend--musiki), [Uşşak](https://islamansiklopedisi.org.tr/ussak), [Kürdî](https://islamansiklopedisi.org.tr/kurdi), [Hümâyun](https://islamansiklopedisi.org.tr/humayun--musiki) | ✅ |
| Kürdî | Dügâh’taki Kürdî makamı az, Rast’taki şeddi Kürdîli Hicazkâr çok kullanılır; Hüseynî’de Acem’le Uşşak’ın yerine Kürdî dörtlüsü; Nihâvend yarım kararı çoğunlukla Kürdî | TDV [Kürdî](https://islamansiklopedisi.org.tr/kurdi), [Hüseynî](https://islamansiklopedisi.org.tr/huseyni), [Nihâvend](https://islamansiklopedisi.org.tr/nihavend--musiki) | ✅ |
| Hicaz | Dik Kürdî–Nim Hicaz artık ikilisi “hicaz çeşnisinin karakteristiği”; Hicaz perdesi değil Nim Hicaz; dört makamlık aile, ortak temel Dügâh’taki Hicaz, değişen güçlüler; B A13 S biçimi | TDV [Hümâyun](https://islamansiklopedisi.org.tr/humayun--musiki), [Hicaz](https://islamansiklopedisi.org.tr/hicaz--musiki), [Zirgüleli Hicaz](https://islamansiklopedisi.org.tr/zirguleli-hicaz) | ✅ B A13 S’yi TDV Hüseynî’deki Hicaz için söyler; listede Nihâvend’in Nevâ’daki dörtlüsü de bu aralıklarla “(B A S)” diye görünür. ⚠️ TDV bu dörtlüyü Hicaz der, biçimini söylemez |
| Çargâh | Yalnız tanini ve bakiye; işaretsiz; AEU’da ana dizi, az kullanılır; Çargâh dizileri majör, Mâhur Batı bakımından sol majör; Hüseynî’de Çargâh çeşnili asma karar çok önemli | TDV [Çârgâh](https://islamansiklopedisi.org.tr/cargah), [Mâhur](https://islamansiklopedisi.org.tr/mahur), [Hüseynî](https://islamansiklopedisi.org.tr/huseyni) | ✅ |
| Segâh | S T K T; eksik beşli S T K S; Ferahnâk S T T K ve S T T B; tam karar tam ya da eksik beşliyle, Kürdî yeden; Uşşak’ta Segâh çeşnisi için Hüseynî’ye koma bemolü | TDV [Segâh](https://islamansiklopedisi.org.tr/segah), [Uşşak](https://islamansiklopedisi.org.tr/ussak) | ✅ |
| Hüzzam | Tam beşli; Hisar 1–1,5 koma dik, çok değişken; Hisar–Evç 10,5–11 koma; tam karar muhakkak bu beşliyle, genellikle yedenli; Karcığar, Sûzinak, Hicazkâr’da Segâh’ta hüzzamlı asma karar | TDV [Hüzzam](https://islamansiklopedisi.org.tr/huzzam), [Karcığar](https://islamansiklopedisi.org.tr/karcigar), [Sûzinak](https://islamansiklopedisi.org.tr/suzinak), [Hicazkâr](https://islamansiklopedisi.org.tr/hicazkar) | ✅ S T S A harfleri maddede metin olarak yok; perdelerden ve “4. aralığı artık ikili” tarifinden çıkar |
| Saba | K S S, 18 komalık eksik dörtlü; Hicaz 2–2,5 koma dik; tam karar bu çeşniyle; Çargâh eksen, Zirgüleli Hicaz çeşnili yarım karar | TDV [Sabâ](https://islamansiklopedisi.org.tr/saba) | ✅ |
| Nikriz | 26 komalık artık dörtlü, S eklenerek beşli; Dügâh’ta Hicaz dörtlüsü ve Hicaz ailesine yakınlık; ailede Rast’a düşülünce nikrizli asma karar | TDV [Nikriz](https://islamansiklopedisi.org.tr/nikriz), [Hümâyun](https://islamansiklopedisi.org.tr/humayun--musiki), [Uzzâl](https://islamansiklopedisi.org.tr/uzzal), [Zirgüleli Hicaz](https://islamansiklopedisi.org.tr/zirguleli-hicaz) | ✅ |

**Kaynaklar ayrışıyor, veri değiştirilmedi:** ⚠️ Saba dizisinde uygulama Hüseynî (40) kullanıyor. TDV [Sabâ](https://islamansiklopedisi.org.tr/saba)
perde listesinde ve Zirgüleli Hicaz tarifinde Dik Hisar (39, koma bemollü mi) der, ama aynı maddenin donanımında mi için
işaret yoktur. SymbTr’deki 66 Saba eserinde bu perde süreye göre %9,9 oranıyla 40’tır, 39 neredeyse hiç yoktur. Hoca
görmeli; bu yüzden Saba’nın Çargâh’taki Hicazı listede çıkmıyor, metinde yazılı.

## 3. İcra akordu (`learn.js` ICRA)

AEU değerinden sapan icra perdeleri. Önceki listede kaynağı olmayan değerler vardı; yalnız kaynaklılar bırakıldı.

| Sapma | Kaynak | Durum |
|---|---|---|
| Dügâh’taki Uşşak dörtlüsünde Segâh ~1,5 koma pes (Uşşak, Bayâtî, Karcığar, Hüseynî) | Gürbüz (1983) ölçümü: Uşşak perdesi Dügâh’tan inerken 133, çıkarken 159 sent; AEU’da 181 sent (8 koma) → 1–2 koma pes. Aktaran: O. Yarman, Ş. Ş. Beşiroğlu, “Türk makam müziği’nde nazariyat-icra örtüşmezliğine bir çözüm: 79-sesli düzen”, *İTÜ Dergisi/B* 5(2), 2008 ([tam metin](https://www.ozanyarman.com/files/itudergisi_makale_tam.pdf)). Aynı yerde Zeren: Uşşak’ta Segâh yazılandan pes istenir | ✅ |
| Hüzzam’da Hisar ~1,5 koma tiz | TDV [Hüzzam](https://islamansiklopedisi.org.tr/huzzam): Hisar–Evç artık ikilisi “12 koma olmayıp yaklaşık 10,5 veya 11 koma”, Hisar “çok değişken bir perde” | 🔧 +1 → +1,5 |
| Saba’da Hicaz perdesi 2 koma dik | TDV [Sabâ](https://islamansiklopedisi.org.tr/saba): “hicaz perdesi … seyir sırasında 2-2,5 koma kadar daha dik basılır” | 🔧 eklendi |
| (kaldırıldı) Rast’ta Segâh −1 ve Evç −1; Hüseynî’de Evç −1; Segâh’ta Segâh −1 ve Evç −1; Hüzzam’da Segâh −1; Saba’da Segâh −1,5 ve Çargâh −1; Mâhur’da Mâhur −1; Sûzinak’ta Segâh −1 | yazılı kaynak bulunamadı | 🔧 kaldırıldı |

## 4. Usuller (`learn.js` USULS, `usuller.js`, `band.js` davul kalıpları, `teori.js`)

Klasik usullerin düm-tek dizileri TDV maddelerindeki şemalardan (resim) okundu.

| Usul | Kaynak | Durum |
|---|---|---|
| Semâî 3/4: düm tek tek | TDV [Semâî](https://islamansiklopedisi.org.tr/semai--musiki) şeması | ✅ |
| Sofyan 4/4: düm (2) te ke | TDV [Sofyan](https://islamansiklopedisi.org.tr/sofyan) (dört zamanlı, üç vuruşlu) ve şeması | ✅ |
| Düyek 8/8: **düm (1) tek (2) tek (1) düm (2) tek (2)** | TDV [Düyek](https://islamansiklopedisi.org.tr/duyek) şeması (sekiz zamanlı, beş vuruşlu, iki sofyanın birleşmesi); aynı dizi: [neyzenim.com usuller](https://www.neyzenim.com/neydersleri_13.html) | 🔧 eskiden “te-düm …” (ilk iki vuruş yer değiştirmiş) |
| Türk Aksağı 5/8: **düm (2) tek (2) tek (1)** | TDV [Türk Aksağı](https://islamansiklopedisi.org.tr/turk-aksagi) şeması; neyzenim.com aynı | 🔧 eskiden tek (1) tek (2) |
| Yürük Semâî 6/8: düm tek tek düm tek (2) | TDV [Yürük Semâî](https://islamansiklopedisi.org.tr/yuruk-semai) şeması | ✅ |
| Aksak 9/8: **düm (2) te (1) ke (1) düm (2) tek (2) tek (1)** — 6 vuruş | TDV [Aksak](https://islamansiklopedisi.org.tr/aksak) (“dokuz zamanlı ve altı vuruşlu”, “2 + 1 şeklinde bitişi”), [Yürük Aksak](https://islamansiklopedisi.org.tr/yuruk-aksak) (sofyan + Türk aksağı), [Ağır Aksak](https://islamansiklopedisi.org.tr/agir-aksak) şeması | 🔧 eskiden 5 vuruş (son tek 3 birim) |
| Ağır Aksak 9/4: Aksak’la aynı vuruşlar, dörtlük birimle | TDV [Ağır Aksak](https://islamansiklopedisi.org.tr/agir-aksak) şeması (düüm te ke düüm teek tek) | 🔧 aynı düzeltme |
| Curcuna 10/8: **düm (2) te (1) ke (2) düm (2) tek (2) tek (1)** | Curcuna, Aksak Semâî’nin 10/16 mertebesidir: TDV [Aksak Semâî](https://islamansiklopedisi.org.tr/aksak-semai) (“on zamanlı ve altı vuruşlu”); vuruş dizisi ve Curcuna adı: [neyzenim.com](https://www.neyzenim.com/neydersleri_13.html) (“DÜM 2, TE 1, KÂ 2, DÜM 2, TEK 2, TEK 1”; “10/16’lık birinci mertebesine Curcuna adı verilir”) | 🔧 eskiden tek (1) tek (1) … tek (2) tek (2). ⚠️ vuruş dizisi için TDV şemasına ulaşılamadı, ikinci kaynak bir eğitim sitesi |
| Nîm-sofyan 2/4: **düm (1) tek (1)** | TDV [Nîm-sofyan](https://islamansiklopedisi.org.tr/nim-sofyan) şeması (2/8, 2/4, 2/2 mertebeleri; düm ve tek birer dörtlük); en çok 2/4 | ✅ 11 Kasım şemadan okundu |
| Sengin Semâî 6/4: Yürük Semâî ile aynı, **düm tek tek düm tek (2)** | TDV [Sengin Semâî](https://islamansiklopedisi.org.tr/sengin-semai): "6/8'lik, 6/4'lük, 6/2'lik mertebelerin vuruluşları yani yapıları aynı", beş darblı (2. semâînin son iki zamanı birleşik); darb kuvvetleri: 1 kuvvetli, 2 yarı, 3-4 zayıf, 5 yarı | ✅ 11 Kasım metinden |
| Devr-i Hindî 7/8: **düm (1) tek (1) tek (1) düm (2) tek (2)** | TDV [Devr-i Hindî](https://islamansiklopedisi.org.tr/devr-i-hindi) şeması (3+4; "yedi zamanlı ve beş vuruşlu"; 7/8 ve 7/4 mertebeleri; şemada düm, tek, tek, düm 2, tek 2) | ✅ 11 Kasım şemadan okundu (basılı cilt PDF'i) |
| Müsemmen 8/8: **düm (3) tek (2) tek (3)** | TDV [Müsemmen](https://islamansiklopedisi.org.tr/musemmen--musiki) şeması (3/8 + 5/8; "sekiz zamanlı", yalnız 8/8 kullanılır; şemada Düm 2-3, Tek 2, Tek 2-3, noktalı dörtlük, dörtlük, noktalı dörtlük) | ⚠️ süre toplamı 8 tutuyor ama şemadaki "2-3" yazısı belirsiz: bir hocaya ya da ikinci kaynağa kontrol ettirilmeli |
| Aksak Semâî 10/8 (uygulamaya EKLENMEDİ) | TDV [Aksak Semâî](https://islamansiklopedisi.org.tr/aksak-semai) şeması (basılı cilt PDF'i): "on zamanlı ve altı vuruşlu"; şemada dörtlük düm, sekizlik düm, sekizlik tek, dörtlük düm, dörtlük tek, sekizlik tek | ❔ nota değerleri toplamı 9, olması gereken 10: ya ilk vuruş üç zamanlık ya da şemada boşluk var; neyzenim.com'un Curcuna dizisinden (2,1,2,2,2,1) de ayrışıyor (ikinci vuruş TDV'de düm yönünde). Çözülmeden eklenmez |
| Küçük usuller 2–15 zamanlı, büyükler 16 ve üstü; sofyandan itibaren usuller birleşik | TDV [Usul](https://islamansiklopedisi.org.tr/usul--musiki) | ✅ |
| Kasap havası 2/4, Sirto 2/4 | — | ❔ klasik usul değil; yaygın oyun havası ölçüsü. “Hora” örneği kaynaksızdı, kaldırıldı |
| Çiftetelli 8/8 (düm tek tek düm düm tek) | M. Frishkopf, [Arab durub chart](https://sites.ualberta.ca/~michaelf/Theory/Durub%20chart%20rev%202009.pdf) (Univ. of Alberta) çiftetelliyi “dum tek tek dum … dum dum tek” verir; [Maqam World](https://ftp.maqamworld.com/en/iqaa/ciftetelli.php) 8/4 Türk usulü olarak tanıtır | ⚠️ vuruş yerleri tabloda tam okunamadı |
| Karşılama 9/8 (2+2+2+3), Roman havası 9/8, Rumeli 7/8 (2+2+3) | Ölçüler için: İTÜ, [Trakya karşılaması](https://polen.itu.edu.tr/handle/11527/17580) (“çoğunlukla dokuz zamanlı”, 9/8 ve 9/16) ve [Trakya’da Romanların düğünlerinde dokuz zamanlı ritmik yapılar](https://polen.itu.edu.tr/handle/11527/12644) | ⚠️ ölçüler kaynaklı; düm-tek dizileri yaygın darbuka çalışıdır, yöreye göre değişir, tek bir yazılı standart bulunamadı |
| Zeybek 9/4 | Ağır zeybek 9/4: [Zeybek (dance)](https://en.wikipedia.org/wiki/Zeybek_(dance)); TDV Ağır Aksak: “ağır oyun havalarında kullanılmıştır” | ⚠️ vuruşları Ağır Aksak’a eşitlendi |

`band.js`’teki elle yazılmış Aksak, Zeybek ve Düyek davul kalıpları yeni vuruşlara göre güncellendi. `teori.js`
sınavındaki “9/8 Aksak nasıl gruplanır?” sorusunun yanlış şıklarından “4+5” aslında doğruydu (Aksak = 4 zamanlı
sofyan + 5 zamanlı Türk aksağı); şık “3+2+2+2” yapıldı.

## 5. Sol klarnet, akort ve transpozisyon (`teori.js`, `core.js`)

| Bilgi | Kaynak | Durum |
|---|---|---|
| Sol klarnet yazılandan tam dörtlü pes çalar (yazılı Mi3 → duyulan Si2) ve Türk müziğinde yaygındır | [Wikipedia, Clarinet family](https://en.wikipedia.org/wiki/Clarinet_family) tablosu: G clarinet, yazılı E3–C7, duyulan B2–G6; “commonly used in Turkish music” | ✅ |
| Esas akort Bolâhenk; Bolâhenk’te Nevâ (yazılı Re5) 440 Hz La olarak duyulur, yani yazılandan tam dörtlü pes | TDV [Âhenk](https://islamansiklopedisi.org.tr/ahenk): “Türk mûsikisinde esas akort bolâhenktir. Bu akortta 440 titreşimli la sesi nevâ perdesi olarak kabul edilmektedir”; “nevâ perdesi bu ayırt sesine isabet ederse ney bolâhenk ney” | ✅ |
| Sol klarnetçi Bolâhenk notayı olduğu gibi okur (iki fark da tam dörtlü) | yukarıdaki iki kaynaktan çıkar | ✅ |
| Âhenk = çalgıların (özellikle neyin) sabit bir perdeye göre düzeni; ney, sabit sese (440 titreşim/sn; nısfiyede 880) denk gelen perdesinin âhengiyle adlanır: Kız ney Rast, Mansûr Dügâh, Şah Segâh (sonra Bûselik), Dâvud Çargâh, Bolâhenk Nevâ, Süpürde Hüseynî, Müstahsen Acem (önce Evç); aradakiler “mâbeyn” (Mehtâbiye: Bolâhenk–Süpürde); hanende eseri sesinin uyduğu âhenge göçürür, neyzen aynı âhenkte ney yoksa parmak yerini değiştirerek göçürür (`lessons.js` `sed-2`) | TDV [Âhenk](https://islamansiklopedisi.org.tr/ahenk#3-musiki), müzik bölümü (Haydar Sanal, 1988, c. 1 s. 517-521), erişim 2026-11-15 | ✅ Madde âhenkler arasındaki farkı perde ya da koma olarak vermez (yalnız 36 basamaklı sıra tablosu); derste sayı yazılmadı. Klarnetin âhengi maddede geçmez |
| Şed: makamın bütün perdeleri aynı koma kadar kayar (53 koma; tanini 9, dörtlü 22, beşli 31). Hicazkâr = Zirgüleli Hicaz’ın Rast’taki şeddi; Kürdîli Hicazkâr = Kürdî’nin Rast’taki şeddi; Mâhur ile Acemaşîran dizileri 9 koma farkla aynı (`lessons.js` `sed-1`, `sed-3`) | §1 (koma değerleri); §2 TDV Hicazkâr ve Kürdî satırları; Mâhur/Acemaşîran eşliği uygulamanın `asc/desc` dizilerinden hesaplandı | ✅ Mâhur–Acemaşîran için “şeddidir” denmedi; derste yalnız dizi eşliği |

## 6. Trakya ve Roman oyun havaları (`lessons.js` Trakya ünitesi, `learn.js` Nikriz)

| Bilgi | Kaynak | Durum |
|---|---|---|
| Karşılamalarda Karcığar, Hicaz, Uşşak, Nikriz, Segâh, Rast, Çargâh, Hüseynî makamları kullanılır | İTÜ, [Giresun Karşılaması ile Trakya Karşılamasının Karşılaştırılması](https://polen.itu.edu.tr/handle/11527/17580) | 🔧 ders metnindeki listeye uyduruldu (Kürdî → Karcığar) |
| Nikriz’in Roman müziğinde özellikle sevildiği | yazılı kaynak bulunamadı | 🔧 kaldırıldı |
| Ağır Roman, çarpmalı tekrar, kayış, düşüş gibi üslup anlatımları | — | ❔ icra geleneği; yazılı kaynakla doğrulanmadı |

## 7. Parmak tabloları (`core.js`, `chartsheet.js`)

Oehler/Albert sistem parmakları The Woodwind Fingering Guide’dan (Timothy Reichard; tablo Eoin McAuley ve Arnold
Wendl katkısı) alındı. WFG sayfaları indirilip her satırdaki nota ve parmak kodu `core.js` ile makineyle
karşılaştırıldı:

- **Ana parmaklar (`FINGERINGS`): 48/48 eşleşti** ✅ — Mi3–Do♯6 temel tablolar (`ocl_bas_1–3`), Sol♯6 ve üstü
  alternatif tablosunun ilk parmağı (`ocl_alt_4`, o bölgede temel tablo yok).
- **Alternatif parmaklar (`ALT_FINGERINGS`): 76/76 eşleşti** ✅ (üçünde fark yalnızca yazımdaki boşluk:
  “123C# E” = “123C#E”).

Sayfalar (hepsi açıldı, başlıkları doğrulandı):
[Chalumeau temel](https://www.wfg.woodwind.org/clarinet/ocl_bas_1.html),
[Clarion temel](https://www.wfg.woodwind.org/clarinet/ocl_bas_2.html),
[Alt altissimo temel](https://www.wfg.woodwind.org/clarinet/ocl_bas_3.html),
[Chalumeau alternatif](https://www.wfg.woodwind.org/clarinet/ocl_alt_1.html),
[Clarion alternatif](https://www.wfg.woodwind.org/clarinet/ocl_alt_2.html),
[Alt altissimo alternatif](https://www.wfg.woodwind.org/clarinet/ocl_alt_3.html),
[Üst altissimo alternatif](https://www.wfg.woodwind.org/clarinet/ocl_alt_4.html),
[parmak gösterimi açıklaması](https://www.wfg.woodwind.org/clarinet/cl_fing.html).

## 8. Sorunlar ve çözümler (`sorunlar.js`)

Kaynak listesi: [SORUNLAR-KAYNAKLAR.md](SORUNLAR-KAYNAKLAR.md). Bütün bağlantılar 2026-10-31’de kontrol edildi:

- Açılıp başlığı doğrulananlar ✅: Bret Pimentel; clarinet-now.com; Yamaha Music Educators Hub; DANSR’ın dört yazısı;
  Paul Harris; SUTD deposu; WFG.
- Siteleri otomatik isteği engellediği (403, bot doğrulaması) için arama motoruyla varlığı doğrulananlar ✅:
  *The Instrumentalist*’in üç yazısı (Christine Damm, “Tips for the Clarinet Break”, Ekim 2019 dahil); Okan, Kırıkkale
  ve tezara.org’daki tezler (nîm perdeler tezi: Tez No 669772, yüksek lisans, 2021).
- Eksik künyeler tamamlandı:
  - J.-M. Chen, J. Smith, J. Wolfe, “Pitch bending and glissandi on the clarinet: Roles of the vocal tract and partial
    tone hole closure”, *J. Acoust. Soc. Am.* 126(3), 1511–1520, 2009, doi:10.1121/1.3177269.
  - S. Slis vd., “Lingual Behavior in Clarinet Articulation: A Multiple-Case Study Into Single and Double Tonguing”,
    *Music & Science*, Ağustos 2021 ([DOAJ](https://doaj.org/article/e84bae1125774ae1bc0f84a3da3729b0)): dört
    profesyonel klarnetçide dil sırtının alçak konumu altissimoda başarıyla ilişkili bulundu.

## 9. Veri kaynakları (lisanslar)

- Nota arşivi: [SymbTr](https://github.com/MTG/SymbTr) (M. K. Karaosmanoğlu, ISMIR 2012; MTG, Universitat Pompeu
  Fabra), CC BY-NC-SA 4.0. Ayrıntı README’de; lisans ve telif durumu [LISANSLAR.md](LISANSLAR.md).
- Nota bul: [neyzen.com](https://www.neyzen.com/), [projetsm.com](http://projetsm.com/) (dosyalar cihazda okunur,
  uygulamaya kopyalanmaz).
- Fontlar: Google Fonts ve [Leland](https://github.com/MuseScoreFonts/Leland) (SIL Open Font License).

## 10. Nefes 2 ve sürekli nefes (`lessons.js` `nefes-2`, `nefes-3`)

Doğrulama 2026-11-15'te yapıldı (sayfalar açılıp okundu).

| Bilgi | Uygulamada | Kaynak | Durum |
|---|---|---|---|
| Nefes yeri plânı, ağızdan hızlı ve zorlamadan nefes, 4 vuruş al / 8–12–16 vuruş ver alıştırması, nefesin zamanını son notadan almak | `nefes-2` metni ve ipuçları | `nefes-cumle` dersi ve `sorunlar.js` “Nefesim yetmiyor” maddesi ([SORUNLAR-KAYNAKLAR.md](SORUNLAR-KAYNAKLAR.md)); yeni iddia yok | ✅ |
| Nefes işareti dizeğin üstünde virgül (’) | `nefes-2`, `okuma-5`, etüt metninde `'` | okuma-5 ile aynı (yaygın nota yazımı) | ✅ |
| Sürekli nefesin tanımı ve işleyişi: ciğerler boşalırken yanaklar havayla şişirilir, yanak havası verilirken burundan nefes alınır, sonra yeniden ciğerden verilir; zurnada çok kullanılır, klarnet kullanılan çalgılar arasında | `nefes-3` metni | [Wikipedia, Circular breathing](https://en.wikipedia.org/wiki/Circular_breathing) (sayfada “daha çok kaynak gerekli” etiketi var) | ⚠️ ansiklopedi maddesi; klarnete özgü bir yöntem kitabı bulunamadı |
| Bardak–pipet alıştırması: 1–2 inç su; normal hava, yalnız yanak havası, durarak ve durmadan değiştirme, burundan alırken yanaktan verme (önce susuz), kabarcıklar kesilmeden; sonra yalnız ağızlık | `nefes-3` `read` adımı ve ipucu | Greg Oakes, [“Circular Breathing 101”](https://www.dansr.com/resources/circular-breathing-101), DANSR (Vandoren ABD dağıtıcısı), 24 Temmuz 2017 | ✅ |

Kaynaklarda **olmayan** ve bu yüzden derse yazılmayanlar: geçişte perde ya da ton kayması, baş dönmesi uyarısı,
çalışma süresi, Türk klarnet icracılarının bu tekniği ne kadar kullandığı.

## 11. Formlar (`teori.js` "form" konusu, `lessons.js` `formlar`, arşiv eser sayfasındaki ⓘ)

Erişim: 15 Kasım 2026. Metin maddelerin söylediğiyle sınırlı tutuldu.

| Form | Kaynak | Kullanılan bilgi |
|---|---|---|
| Şarkı | TDV [Şarkı (Mûsiki)](https://islamansiklopedisi.org.tr/sarki--musiki) | Din dışı sözlü form, küçük usuller; zemin (güçlüde yarım karar), nakarat, miyan (başka makamlara geçiş), 4. mısra nakaratın bestesiyle; mısralar arasında ara nağme |
| Türkü | TDV [Türkü](https://islamansiklopedisi.org.tr/turku) | Anonim, ezgiyle söylenen halk şiiri, çoğu zaman bağlama eşliğinde; bent ve kavuştak; usulsüz (uzun hava) ve usullü (kırık hava, oyun havası, oturak havası) |
| Peşrev | TDV [Peşrev](https://islamansiklopedisi.org.tr/pesrev) | En büyük saz eseri formu; çoğu dört haneli, her haneden sonra mülâzime; asıl teslim haneyi mülâzimeye bağlayan kısa nağme; genellikle büyük usuller, en çok devr-i kebîr, aksak usuller kullanılmaz; faslın başında |
| Saz semâîsi | TDV [Saz Semâisi](https://islamansiklopedisi.org.tr/saz-semaisi) | Peşrevden sonra en önemli saz formu; dört hane + mülâzime; hanelerde güçlüde yarım karar, mülâzimede durakta tam karar; ilk üç hane aksak semâî, 4. hanede başka bir semâî usulü; faslın sonunda |
| Taksim | TDV [Taksim (Mûsiki)](https://islamansiklopedisi.org.tr/taksim--musiki) | Usule bağlı olmayan doğaçlama seyir; giriş, ara, geçiş taksimi |
| İlâhi | TDV [İlâhi](https://islamansiklopedisi.org.tr/ilahi) | Dinî-tasavvufî sözlü eserlerin genel adı; en çok sofyan, düyek, evfer, devr-i hindî… |
| Aranağme | TDV'de ayrı madde yok | Yalnız Şarkı maddesindeki "mısralar arasında ara nağme"; arşivde ayrı eser olarak bulunduğu veriden |
| Longa | TDV'de ayrı madde yok | Hâne ve Fasıl maddelerinde saz eserleri ve oyun havaları arasında sayılır; Nîm-sofyan ve Nikriz maddelerinde nîm-sofyanla anılır |

Örnek eser: III. Selim, Pesendîde Saz Semâîsi (SymbTr; bölüm işaretleri dosyada): ilk üç hane Aksak Semâî, 4. hane
Yürük Semâî II (6/8), teslim Aksak Semâî. Bu, Saz Semâisi maddesinin tarifiyle uyuşur.

## Doğrulanamayanlar ve açık kalanlar

- Halk usullerinin (karşılama, Roman havası, Rumeli, çiftetelli, kasap, sirto, zeybek) düm-tek dizileri: yöreden
  yöreye değişen icra kalıplarıdır, klasik usuller gibi yazılı bir standartları yok.
- Curcuna’nın vuruş dizisi tek bir eğitim sitesinden; TDV Aksak Semâî maddesi vuruş sayısını (6) doğruluyor ama
  şeması indirilemedi.
- Acemaşîran’ın yedeni (Hüseynî Aşîran) çıkarımdır, TDV maddesinde geçmez.
- S3.2: Bûselik’in yedeni (Nim Zirgüle) Sultânîyegâh maddesinden, Evç’in yedeni (Acem Aşîran) Irak maddesinden çıkarımdır;
  kendi maddelerinde geçmez. Acemkürdî’nin dizisi ve yedeni TDV maddesinde yok, makam eklenmedi.
- Saba dizisindeki Hüseynî / Dik Hisar ayrımı (§2a): TDV’nin perde listesi ile donanımı ve SymbTr notaları ayrışıyor.
- İcra akordundaki sayılar yaklaşık; ölçüm çalışmaları icracıya göre değişen değerler verir.
- Aranağme ve longa için TDV'de ayrı madde yok (§11); tanımları başka maddelerdeki geçişlerden.
