# Lisanslar ve kullanım izinleri

Uygulamaya giren her dış kaynak, lisansı, ticari kullanımda durumu ve yapılacak iş. 2 Kasım 2026'da derlendi.
**Bu belge hukuki görüş değildir.** Mağazaya ücretli ya da reklamlı çıkmadan önce bir avukata danışılmalı.

"Ticari kullanım" burada: uygulamanın ücretli satılması, uygulama içi satın alma, reklam ya da ücretli bir hizmetin
parçası olması. Ücretsiz ve reklamsız dağıtım da bazı lisanslarda tartışmalıdır; aşağıda ayrıca belirtildi.

## Özet

| Kaynak | Nerede | Lisans | Ücretsiz dağıtım | Ticari kullanım | Yapılacak |
|---|---|---|---|---|---|
| SymbTr nota koleksiyonu | `notalar/` (2200 eser), Nota arşivi | CC BY-NC-SA 4.0 | Atıfla olur; türetilen veri de BY-NC-SA kalmalı | **Olmaz** (NC) | Ticari sürümde arşiv çıkarılmalı ya da MTG'den yazılı izin alınmalı; ayrıca eser telifleri (aşağıda) |
| Eserlerin besteci ve güfte telifleri | `notalar/` | Eserine göre | Tabloya göre eser eser bakılmalı | Telifli eserler izinsiz olmaz | `lisans-besteciler.csv` ve `lisans-guftekarlar.csv` dolduruldu, `lisans-disla.csv` dışlama listesi çıkarıldı (4 Kasım 2026); telifli eserler arşivden henüz çıkarılmadı, bilinmeyenler araştırılmalı |
| Woodwind Fingering Guide | `core.js` parmak tabloları, çeyrek ses parmakları | Açık lisans yok | Atıfla veriliyor | İzin gerekir | Sahibinden (WFG) yazılı izin |
| University of Iowa EMS kayıtları | `sounds/klarnet.wav`, `testdata/iowa/` | Site: ücretsiz, "herhangi bir projede kısıtlamasız" | Olur | Olur (sitenin beyanına göre) | Beyanın ekran görüntüsü/arşiv bağlantısı saklanmalı |
| VCSL darbuka | `sounds/darbuka.wav` | CC0 | Olur | Olur | — |
| Wikimedia fotoğrafları | `img/` (klarnet, darbuka, ud, ağızlık) | CC BY-SA 3.0, CC BY 2.0 | Atıfla olur (Ayarlar → Hakkında'da var) | Atıf ve (BY-SA) aynı lisansla paylaşım şartıyla olur | Düzenlenmiş görsellerin BY-SA altında kaldığı belirtilmeli |
| Yazı tipleri: Commissioner, Fraunces, IBM Plex Mono, Noto Music | `fonts/` | SIL OFL 1.1 | Olur | Olur | — (lisans metinleri `fonts/OFL-*.txt`, pakete giriyor; Hakkında'dan bağlantılı) |
| Bravura, Leland (SMuFL) | `omrtemplates.js` simge kalıpları (glif resimlerinden) | SIL OFL 1.1 | Olur | Olur | — |
| pdf.js | `vendor/pdfjs/` | Apache 2.0 | Olur | Olur | — (`vendor/pdfjs/LICENSE` pakete giriyor; Hakkında'dan bağlantılı) |
| qrcode-generator | `vendor/qrcode/` | MIT | Olur | Olur | — (başlık `vendor/qrcode/qrcode.js` içinde duruyor) |
| Capacitor ve eklentileri | Android/iOS paketi | MIT | Olur | Olur | — |
| neyzen.com | Nota bul (arama ve PDF indirme) | Açık lisans yok | Kullanıcı kendi indiriyor; yine de izin istenmeli | İzin gerekir | Mehmet Yücel'den yazılı izin; yoksa `SOURCES.neyzen.enabled = false` |
| projetsm.com | Nota bul | Açık lisans yok | Kullanıcı kendi indiriyor | İzin istenmeli | Site sahibine sorulmalı |
| YouTube videoları (Çorlu Klarnet Üstatları) | Videolar sekmesi, ders altları | Gömülmüyor, bağlantı | Bağlantı vermek olur | Bağlantı vermek olur | Kanal sahibine haber vermek iyi olur |
| TDV İslâm Ansiklopedisi, akademik kaynaklar | Makam, usul ve icra bilgileri (`docs/KAYNAKLAR.md`) | Telifli metin | Bilgi aktarılıyor, metin kopyalanmıyor | Aynı | Uzun alıntı yapılmamalı |
| Özgün etütler ve ders metinleri | `repertoire.js`, `lessons.js` | Proje sahibinin | — | — | — |

## SymbTr (CC BY-NC-SA 4.0)

- Kaynak: M. K. Karaosmanoğlu, *A Turkish makam music symbolic database for music information retrieval: SymbTr*,
  ISMIR 2012; Music Technology Group, Universitat Pompeu Fabra. https://github.com/MTG/SymbTr
- **BY:** atıf arşiv sayfasında ve her eser ekranında var (`archive.js`).
- **NC:** ticari olmayan kullanım. Uygulama ücretli, reklamlı ya da uygulama içi satışlı olursa arşiv bu şartı bozar.
  Seçenekler: (1) MTG'den ticari kullanım izni istemek, (2) ticari sürümde arşivi çıkarıp yalnızca kullanıcının kendi
  içe aktardığı notaları bırakmak, (3) uygulamayı ücretsiz ve reklamsız tutmak.
- **SA:** `notalar/*.json` SymbTr'den türetilmiş veridir; aynı lisansla paylaşılmalı. Uygulamanın kendi kodu bu
  veriden ayrı bir eserdir, ama karışık dağıtımda bu ayrım belirtilmeli (README ve arşiv sayfası).
- SymbTr lisansı yalnız kodlamanın (notaya dökümün) lisansıdır; **eserlerin kendi telif haklarını kaldırmaz**.

## Eserlerin telif durumu

Arşivde 502 besteci satırı (136 eser "Anonim", 118 boş), 363 güfte yazarı satırı ve sözüyle birlikte gösterilen 1558
eser var. **Aşağıdaki tablolar çalışma tablosudur, hukuki görüş değildir.** Besteci ve güfte yazarının hakları ayrıdır:
bir eserin kullanılabilmesi için ikisine de ayrı ayrı bakılır.

- [lisans-besteciler.csv](lisans-besteciler.csv): bestecilere göre eser sayısı, formlar, ölüm yılı, telif durumu, kaynak.
- [lisans-guftekarlar.csv](lisans-guftekarlar.csv): güfte yazarları için aynı düzen.

**Süre kuralı (FSEK m. 26-27):** koruma, eser sahibinin hayatı boyunca ve ölümünden sonra 70 yıl sürer; süre ölüm yılını
izleyen yılın 1 Ocak'ında başlar. Yani ölüm yılı Y ise koruma 31 Aralık Y+70'te biter. 2026 için sınır **ölüm yılı ≤ 1955**:
1955'te ölenler 1 Ocak 2026'dan beri kamu malıdır, 1956'da ölenler 31 Aralık 2026'ya kadar korunur. Tablolar her yıl
yeniden hesaplanmalıdır. Birden çok eser sahibi varsa süre son sağ kalanın ölümünden başlar; aslı ile işlenmesinin süreleri
birbirinden bağımsızdır (m. 26).

`telif_durumu` değerleri:

| Değer | Anlamı |
|---|---|
| `kamu malı (ölüm + 70 doldu)` | Ölüm yılı ≤ 1955. `olum_yili` boşsa yıl kesin değildir ama kaynaktaki yüzyıl, yıl aralığı ya da doğum yılı (≤ 1855) sınırın çok öncesidir; `not` sütununda yazar |
| `telifli` | Ölüm yılı ≥ 1956; ya da ölüm kaydı yok ve kişi 1955'ten sonra yaşamış (doğum ≥ 1937 ya da belgeli etkinlik) |
| `bilinmiyor` | Ölüm yılı doğrulanamadı ya da kim olduğu belli değil. **Kamu malı sayılmamalı** |
| `anonim` | Ölüm + 70 uygulanmaz; adsız eserde süre alenileşmeden başlar (m. 27). Ezgi anonim olsa da derleyenin, notaya alanın ya da düzenleyenin hakları olabilir; TRT repertuvarı kaynaklıysa ayrıca bakılmalı |

**Kaynak sırası:** önce TDV İslâm Ansiklopedisi, sonra İTÜ Türk Müziği Dijital Kütüphanesi'nin (tmdkarsiv.itu.edu.tr) besteci
ve güfteci yetke kayıtları, Türk Edebiyatı İsimler Sözlüğü (TEİS), İstanbul Ansiklopedisi, Wikidata, MusicBrainz, Vikipedi ve
salihbora.com. Kaynak `not` sütununda yazar. Not sütunundaki işaretler:

| İşaret | Anlamı |
|---|---|
| `iki kaynak: A + B` | İki ayrı kayıt aynı ölüm yılını veriyor. Wikidata ve Vikipedi aynı kaynak ailesi sayıldı, birbirinin ikincisi olamaz. Kayıtlar ayrıdır ama aynı basılı kaynağa (ör. Öztuna) dayanıyor olabilirler |
| `tek kaynak`, `ad eşleşmesi` | Yıl yalnız bir kayda ya da yalnız ada dayanıyor; zayıftır, ticari karardan önce yeniden bakılmalı |
| `kaynaklar çelişiyor` | Kaynaklar farklı yıl veriyor; biri seçilmedi, tabloda ilk kayıt kaldı ve satır zayıf sayılır. Bu satırlarda çelişki kamu malı ya da telifli sonucunu değiştirmiyor |

Veri tabanı bağlantıları ada, döneme ve eser türüne karşı denetlendi; yanlış bulunanlar kullanılmadı (ör. MusicBrainz İsmet
Ağa'nın eserini Neşet Ertaş'a bağlıyor). Tek adlı kayıtlar (Hâşim, Nûri, Burhan gibi) adaş riski yüzünden kabul edilmedi.

**Durum (4 Kasım 2026, doğrulama sonrası):**

| Tablo | Satır | Ölüm yılı dolu | Kamu malı | Telifli | Anonim | Bilinmiyor | "İki kaynak" | Zayıf |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Besteciler | 502 | 318 | 189 | 170 | 1 | 142 | 113 | 61 |
| Güfte yazarları | 363 | 207 | 105 | 126 | 0 | 132 | 51 | 36 |

Zayıf sütunu "tek kaynak", "ad eşleşmesi" ve "kaynaklar çelişiyor" satırlarını sayar; doğrulamadan önce 162 ve 83'tü. Besteciye
göre 2200 eserin 1030'u kamu malı, 736'sı telifli, 298'i bilinmiyor, 136'sı anonim. Besteci ve güfte birlikte sayılınca: 904
eserde ikisi de kamu malı, 786 eserde en az biri telifli, 131 eser anonim ve güftesi engel değil, 379 eser belirsiz.

**Doğrulamada sonucu değişenler:**

- **Bilinmiyordan telifliye:** Erol Bingöl (66 seyir; İTÜ yetke kaydı 1948-, MusicBrainz d. 25 Ocak 1948, ölüm kaydı yok), Ömer
  Sami Güpgüp (21 eser; ö. 11 Ekim 2016), Kemal Altınkaya (ö. 1956), İrfan Doğrusöz (ö. 2003), İzzet Altınbaş (ö. 1993), Bilge
  Özgen (1935-), Özgen Gürbüz (1951-); güftede Melek Hiç (ö. 1964), Mehmet Çakırtaş (ö. 1988), Rahmi Duman (ö. 1985).
- **Bilinmiyordan kamu malına:** İsmet Ağa (ö. 1875), Osman Pehlivan (ö. 1942), Şeyh Ethem Efendi (ö. 1933), Âfet Mısırlıyan
  (ö. 1922), Seyfettin Osmanoğlu (ö. 1927). Çoğu tek kaynaktır. Osman Pehlivan bir notada "kaynak kişi" olarak geçiyor; eserleri
  ayrıca derleyen hakkı açısından bakılmalı.
- **Şefik Gürmeriç:** ölüm yılı doğrulandı. İstanbul Ansiklopedisi (Hikmet Tongir, *Orkestra* 1969) 30 Nisan 1967 diyor, İTÜ yetke
  kaydı 1904-1967. Kişi İstanbul Konservatuvarı nazariyat öğretmenidir, basılmamış *Makamlar* kitabı vardır; ama 74 seyirin basılı
  kaynağı bulunamadı, yazarlık SymbTr ve MusicBrainz kaydına dayanır.
- **Erol Bingöl:** *Türk Musikisinde Makamlar ve Seyir Örnekleri* (Bakırköy Musıki Vakfı, 1999) kitabında "hazırlayan" olarak geçer.

**Nerede durdu:** "tek kaynak" ve "ad eşleşmesi" satırlarının hepsine bakıldı; ikinci kaynağı çıkmayanlar zayıf kaldı. İTÜ
kataloğuna bütün zayıf satırlar ve en çok eseri olan yaklaşık 70 `bilinmiyor` ad soruldu, kalan yaklaşık 200 ad sorulmadı: katalog
2 saniye aralıkla sorguda bağlantıyı bir süre kesti, 8 saniye aralıkla devam edildi. Ömer Dilek bulunamadı: İTÜ kataloğunda da kayıt
yok, TRT repertuvar numarası (19533) ve güfte yazarlarının dönemi çağdaş olduğunu düşündürüyor, ama belge olmadığı için `bilinmiyor`
kaldı. Boş besteci satırları (118 + 7 eser) ve "-" güfte satırı (64 eser) kişi değildir, eser eser bakılmalı. TDV'nin arama adresi
ile Studocu otomatik isteği engelledi, bu siteler bırakıldı. Öztuna'nın *Türk Mûsikîsi Ansiklopedisi* gibi basılı kaynaklara
bakılmadı.

Telif sınırına takılan önemli adlar: Şefik Gürmeriç (ö. 1967, 74 seyir), Erol Bingöl (66 seyir), Sadettin Kaynak (ö. 1961, 44),
Rûhî Ayangil (28), Münir Nurettin Selçuk (ö. 1981, 25), Ömer Sami Güpgüp (ö. 2016, 21); güftede Vecdi Bingöl (ö. 1973, 25),
Yahya Kemal Beyatlı (ö. 1958, 13). Sınır yılında: Şerif İçli, Nuri Halil Poyraz, Cahit Sıtkı Tarancı, Semih Mümtaz, Kemal Altınkaya,
Ercüment Ekrem Talu (ö. 1956, 1 Ocak 2027'den kamu malı).

- Kamu malı olmak yalnız besteciyi ve güfte yazarını ilgilendirir; SymbTr'nin NC şartı (yukarıda) ayrıca geçerlidir.

### Dışlama listesi

`node scripts/lisans-disla.js [yıl]` iki tabloyu `notalar/index.json` ile eser eser eşleştirir ve üç dosya yazar. Yıl
verilmezse bugünün yılı alınır. **Arşive dokunmaz:** `scripts/symbtr.js` bu listeyi okumuyor, telifli eserler `notalar/`
içinde durmaktadır. Liste hukuki görüş değildir; tablolardaki zayıf kayıtlar buraya da geçer.

- [lisans-disla.csv](lisans-disla.csv): en az bir hak sahibi telifli olan **786 eser** (doğrulamadan önce 690). `engel` sütunu:
  besteci 493, güfte 50, ikisi 243. `kamu_mali_yili`, eserin 1 Ocak'ta serbest kalacağı yıldır; hak sahiplerinden biri bilinmiyorsa
  ya da ölüm yılı yoksa boştur (530 eserde dolu). `zayif_kaynak` = `evet` olan 39 eserde telifli sayılmanın dayanağı yalnız "tek
  kaynak", "ad eşleşmesi" ya da "kaynaklar çelişiyor" kaydıdır. Doğrulamadan önce bu sayı 233'tü; o 233 eserden 32'si zayıf kaldı,
  7'si bu turda telifli çıkan yeni tek kaynaklı adlardır.
- [lisans-belirsiz.csv](lisans-belirsiz.csv): telifli hak sahibi görünmeyen, ama en az biri bilinmeyen **379 eser** (önce 483).
  `eksik` sütunu: besteci 243, güfte 98, ikisi 38. Bunlar dışlanmış sayılmadı, kamu malı da sayılmamalı.
- [lisans-guftesiz.csv](lisans-guftesiz.csv): besteci kamu malı ve 1900'den sonra ölmüş, söz gösteriliyor, güfte yazarı SymbTr'de
  kayıtlı değil: **146 eser** (Şarkı 116). Listede eser, besteci ve bulunan yazar var; söz yok. Bulunan yazarlar elle tutulan
  [lisans-guftesiz-yazar.csv](lisans-guftesiz-yazar.csv) dosyasındadır, betik bunları eserin durumuna katar.

Dikkat edilecekler:

- **Sözü gösterilmeyen 4 eser:** Vecdi Bingöl'ün güfteleri olan `Bende Oldum`, `Dilbera Sazın`, `Gül Mevsimi` ve `Şeb-i
  Vuslat`ta besteci kamu malı, engel yalnız güftedir ve arşiv sözü göstermiyor. Listede kaldılar; yalnız ezgiyle tutulup
  tutulamayacakları avukata sorulmalı.
- **Güftesi bilinmeyen eserler:** besteci kamu malı olan 362 eserde söz gösteriliyor ama güfte yazarı SymbTr'de kayıtlı değil;
  146'sında besteci 1900'den sonra ölmüş (başta 141'di, beş eserin bestecisi bu turda kamu malı çıktı). ProjeTSM, MusicBrainz,
  İTÜ kataloğu ve TRT repertuvar kayıtlarında (defteriniz.com) arandı: 14 eserin yazarı bulundu (8 kamu malı, 3 telifli, 3 ölüm yılı
  bilinmiyor). Telifli çıkanlar `Varsın Gönül Aşkınla` (Vecdi Bingöl), `Aşkı Hüznümle Yarattım` (Kemal Şakir Yakar) ve `Sûziş-i
  Aşkınla Ben` (Ercüment Ekrem Talu) dışlama listesine geçti. Kalan 132 eserde kaynakların çoğu "Meçhul" ya da "[unknown]" diyor;
  bu, hak sahibinin olmadığı anlamına gelmez. Bu eserler sınıflandırmada kamu malı kalmıştır, kaynak durumu dosyada yazar.
- **Seyir örnekleri:** makam ekranındaki örnekler arşivden gelir (`drills.js`). 169 seyirin 140'ı telifli (Şefik Gürmeriç 74,
  Erol Bingöl 66), 29'u kamu malıdır (Rauf Yektâ). Belirsiz seyir kalmadı. Telifliler çıkarılırsa seyir örneği olan 78 makamın
  49'unda örnek kalmaz. Bu, önceki hesapta yalnız en kötü durumdu; Erol Bingöl telifli çıkınca karar için gerçek durum oldu.
- **Her yıl yeniden çalıştırılmalı:** örneğin 2027 için liste 763 telifli, 385 belirsiz, 921 kamu malı verir. Ölüm yılı
  belli satırlarda durum yıldan hesaplanır, tablodaki `telif_durumu` değil; tablo yine de elle güncellenmelidir.

## Woodwind Fingering Guide

Parmak tabloları (temel, alternatif, çeyrek ses) WFG'den derlendi ve kaynak gösteriliyor. Sitede açık bir yeniden
kullanım lisansı yok. Parmak bilgisinin kendisi olgu olsa da derlemenin düzeni korunabilir; ücretsiz dağıtımda da
izin istemek doğru olur, ücretli dağıtımda gerekir.

## Kayıtlar

- Klarnet örnek sesleri Iowa EMS'nin **Boehm sistem Si♭ klarnet** kayıtlarıdır, Sol klarnet değildir; uygulamada
  perde ayarlanarak çalınır ve bu arayüzde yazılır (Ayarlar → Hakkında, ders "Dinle" adımları).
- Gerçek Sol klarnet kayıtları eklenecekse kayıt yapan icracıdan yazılı izin (kullanım yeri, süre, ticari kullanım)
  alınmalı ve burada belgelenmeli.

## Kullanıcının içe aktardığı notalar

MusicXML, PDF ve resimden içe aktarılan notalar yalnızca kullanıcının cihazında kalır; paylaşım bağlantısı notayı
kullanıcının kendisi gönderir. Uygulama bu içeriği dağıtmaz. Paylaşım ekranında telifli eserleri paylaşmamak gerektiği
hatırlatılabilir.
