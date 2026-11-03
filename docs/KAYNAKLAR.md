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

## Doğrulanamayanlar ve açık kalanlar

- Halk usullerinin (karşılama, Roman havası, Rumeli, çiftetelli, kasap, sirto, zeybek) düm-tek dizileri: yöreden
  yöreye değişen icra kalıplarıdır, klasik usuller gibi yazılı bir standartları yok.
- Curcuna’nın vuruş dizisi tek bir eğitim sitesinden; TDV Aksak Semâî maddesi vuruş sayısını (6) doğruluyor ama
  şeması indirilemedi.
- Acemaşîran’ın yedeni (Hüseynî Aşîran) çıkarımdır, TDV maddesinde geçmez.
- Saba dizisindeki Hüseynî / Dik Hisar ayrımı (§2a): TDV’nin perde listesi ile donanımı ve SymbTr notaları ayrışıyor.
- İcra akordundaki sayılar yaklaşık; ölçüm çalışmaları icracıya göre değişen değerler verir.
