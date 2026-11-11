# Lisanslar ve kullanım izinleri

Uygulamaya giren her dış kaynak, lisansı, ticari kullanımda durumu ve yapılacak iş. 2 Kasım 2026'da derlendi.
**Bu belge hukuki görüş değildir.** Mağazaya ücretli ya da reklamlı çıkmadan önce bir avukata danışılmalı.

"Ticari kullanım" burada: uygulamanın ücretli satılması, uygulama içi satın alma, reklam ya da ücretli bir hizmetin
parçası olması. Ücretsiz ve reklamsız dağıtım da bazı lisanslarda tartışmalıdır; aşağıda ayrıca belirtildi.

## Özet

| Kaynak | Nerede | Lisans | Ücretsiz dağıtım | Ticari kullanım | Yapılacak |
|---|---|---|---|---|---|
| SymbTr v3.0 nota koleksiyonu | `notalar/` (3000 eser), Nota arşivi | CC BY 4.0 | Atıfla olur | Atıfla olur | Eser telifleri (aşağıda) |
| SymbTr v2.4 nota koleksiyonu | `notalar/` (`src: "v2"` işaretli 37 eser) | CC BY-NC-SA 4.0 | Atıfla olur; türetilen veri de BY-NC-SA kalmalı | **Olmaz** (NC) | Ticari sürümde bu 37 eser çıkarılmalı ya da MTG'den yazılı izin alınmalı |
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

## SymbTr v3.0 (CC BY 4.0) ve v2.4 (CC BY-NC-SA 4.0)

**11 Kasım 2026:** Arşiv SymbTr v3.0'a geçti. Koleksiyonun hazırlayıcısı M. K. Karaosmanoğlu (Yıldız Teknik Üniversitesi)
v3.0'ı 20 Mayıs 2025'te kendi ORCID'li hesabıyla Zenodo'ya **CC BY 4.0** lisansıyla yükledi
(https://doi.org/10.5281/zenodo.15470412; 3000 eser, 164 makam, 135 usul). CC BY ticari kullanıma izin verir, şartı
atıftır; atıf arşiv sayfasında ve her eser ekranında var (`archive.js`). v2.4'te olup v3'te bulunmayan 37 eser arşivde
kaldı (`index.json`'da `src: "v2"`); yalnız onlar için aşağıdaki NC şartı sürer. v2'deki 153 eserin v3'te adı değişmiş
(makam ya da usul yeniden sınıflanmış, ad kısaltılmış); `scripts/symbtr-adlar.json` bunları eşler ve eski kimlik korunur.
v2'den hâlâ okunan şeyler: başlık ve kişi adları (lisans tabloları bu adlarla tutulur), büyük usullerin ölçüsü (v3 XML'i
28/4'lük Devr-i Kebîr gibi usulleri 4/4'lük ölçülere bölüyor). Bunlar olgu bilgisidir; notaların kendisi v3'ten gelir.
v3 ile gelen 98 besteci ve 126 güfte yazarı tablolara eklendi: 53'ünün ölüm yılı ya da durumu Claude'un genel bilgisinden
yazıldı ("tek kaynak", doğrulanmalı), geri kalanı "bilinmiyor"dur ve eserleri `lisans-belirsiz.csv`'de.

Aşağısı v2.4 içindir (artık yalnız `src: "v2"` eserleri):

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

**v3 sonrası (11 Kasım 2026, `node scripts/lisans-disla.js`):** 3037 eserin 1232'sinde en az bir hak sahibi telifli,
532'si belirsiz, 1121'i kamu malı, 152'si anonim. Besteci kamu malı ama güfte yazarı kayıtlı olmayan sözlü eser 534;
bunların 213'ünde besteci 1900'den sonra ölmüş (`lisans-guftesiz.csv`; v3'le gelen 66 satır henüz araştırılmadı).
Aşağıdaki sayılar ve açıklamalar v2.4'teki 2200 eserlik arşive aittir.

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

**Durum (5 Kasım 2026, doğrulama ve katalog turu sonrası):**

| Tablo | Satır | Ölüm yılı dolu | Kamu malı | Telifli | Anonim | Bilinmiyor | "İki kaynak" | Zayıf |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Besteciler | 502 | 329 | 192 | 180 | 1 | 129 | 113 | 74 |
| Güfte yazarları | 363 | 211 | 106 | 131 | 0 | 126 | 51 | 42 |

Zayıf sütunu "tek kaynak", "ad eşleşmesi" ve "kaynaklar çelişiyor" satırlarını sayar; doğrulamadan önce 162 ve 83'tü. Besteciye
göre 2200 eserin 1033'ü kamu malı, 746'sı telifli, 285'i bilinmiyor, 136'sı anonim. Besteci ve güfte birlikte sayılınca: 908
eserde ikisi de kamu malı, 797 eserde en az biri telifli, 131 eser anonim ve güftesi engel değil, 364 eser belirsiz.

**Doğrulamada sonucu değişenler:**

- **Bilinmiyordan telifliye:** Erol Bingöl (66 seyir; İTÜ yetke kaydı 1948-, MusicBrainz d. 25 Ocak 1948, ölüm kaydı yok), Ömer
  Sami Güpgüp (21 eser; ö. 11 Ekim 2016), Kemal Altınkaya (ö. 1956), İrfan Doğrusöz (ö. 2003), İzzet Altınbaş (ö. 1993), Bilge
  Özgen (1935-), Özgen Gürbüz (1951-); güftede Melek Hiç (ö. 1964), Mehmet Çakırtaş (ö. 1988), Rahmi Duman (ö. 1985).
- **Bilinmiyordan kamu malına:** İsmet Ağa (ö. 1875), Osman Pehlivan (ö. 1942), Şeyh Ethem Efendi (ö. 1933), Âfet Mısırlıyan
  (ö. 1922), Seyfettin Osmanoğlu (ö. 1927). Çoğu tek kaynaktır. Osman Pehlivan bir notada "kaynak kişi" olarak geçiyor; eserleri
  ayrıca derleyen hakkı açısından bakılmalı.
- **Katalog turunda (5 Kasım) bilinmiyordan telifliye:** Özcan Korkut (ö. 2008), Sabri Süha Ansen (ö. 1990), Lâmi Güray (ö. 1989),
  Kadri Şençalar (ö. 1989), Mehveş Hanım (ö. 1976?), Mazhar Bey (Münir Mazhar Kamsoy, ö. 1973), Sarı Recep (ö. 1965), Ferruh Arsunar
  (ö. 1965; katalogda tarih yok, yıl Wikidata'dan), Esin Seçkin (1939-), Cahit Deniz (1958-); güftede Gülten Çiçek (ö. 2004). Sarı
  Recep, Şençalar ve Arsunar türkü satırlarıdır, derleyen ya da kaynak kişi olabilirler.
- **Katalog turunda bilinmiyordan kamu malına:** Tanburî Küçük Osman Bey (ö. 1900), Gülbenkyan (ö. 1940?), Hacı Nafiz Bey (ö. 1898,
  ad eşleşmesi); güftede Yusuf İzzettin Paşa (ö. 1916). Katalog turundan gelen bütün yıllar tek kaynaktır.
- **Şefik Gürmeriç:** ölüm yılı doğrulandı. İstanbul Ansiklopedisi (Hikmet Tongir, *Orkestra* 1969) 30 Nisan 1967 diyor, İTÜ yetke
  kaydı 1904-1967. Kişi İstanbul Konservatuvarı nazariyat öğretmenidir, basılmamış *Makamlar* kitabı vardır; ama 74 seyirin basılı
  kaynağı bulunamadı, yazarlık SymbTr ve MusicBrainz kaydına dayanır.
- **Erol Bingöl:** *Türk Musikisinde Makamlar ve Seyir Örnekleri* (Bakırköy Musıki Vakfı, 1999) kitabında "hazırlayan" olarak geçer.

**Nerede durdu:** "tek kaynak" ve "ad eşleşmesi" satırlarının hepsine bakıldı; ikinci kaynağı çıkmayanlar zayıf kaldı. İTÜ
kataloğuna bütün zayıf satırlar ve bütün `bilinmiyor` adlar soruldu. 5 Kasım turunda 215 ad en az 8 saniye aralıkla soruldu;
katalog bağlantıyı birkaç kez kesti, beklenip aralık 30 saniyeye kadar açıldı ve tarama tamamlandı. Sonuç vermeyen adlar şapkasız
ve bilinen başka yazımlarıyla yeniden soruldu; 127 adda yine kayıt çıkmadı. 15 adın sonucu değişti, kayıt çıkıp tarihi olmayan
ya da adaş riski taşıyan adlara yalnız not eklendi. Tek adlı kayıtlar (Hâşim, Nûri, Nâfiz, Ulvî, Rifat Bey, Rıza Bey gibi) kabul
edilmedi; doğum yılı 1937'den önce olup ölüm kaydı olmayanlar (Nefîse Özses, Bedirhan Kırmızı) `bilinmiyor` kaldı. Ömer Dilek bulunamadı: İTÜ kataloğunda da kayıt
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

- [lisans-disla.csv](lisans-disla.csv): en az bir hak sahibi telifli olan **797 eser** (doğrulamadan önce 690). `engel` sütunu:
  besteci 499, güfte 51, ikisi 247. `kamu_mali_yili`, eserin 1 Ocak'ta serbest kalacağı yıldır; hak sahiplerinden biri bilinmiyorsa
  ya da ölüm yılı yoksa boştur (539 eserde dolu). `zayif_kaynak` = `evet` olan 50 eserde telifli sayılmanın dayanağı yalnız "tek
  kaynak", "ad eşleşmesi" ya da "kaynaklar çelişiyor" kaydıdır. Doğrulamadan önce bu sayı 233'tü; o 233 eserden 32'si zayıf kaldı,
  18'i doğrulamada ve katalog turunda telifli çıkan yeni tek kaynaklı adlardır.
- [lisans-belirsiz.csv](lisans-belirsiz.csv): telifli hak sahibi görünmeyen, ama en az biri bilinmeyen **364 eser** (önce 483).
  `eksik` sütunu: besteci 233, güfte 97, ikisi 34. Bunlar dışlanmış sayılmadı, kamu malı da sayılmamalı.
- [lisans-guftesiz.csv](lisans-guftesiz.csv): besteci kamu malı ve 1900'den sonra ölmüş, söz gösteriliyor, güfte yazarı SymbTr'de
  kayıtlı değil: **147 eser** (Şarkı 117). Listede eser, besteci ve bulunan yazar var; söz yok. Bulunan yazarlar elle tutulan
  [lisans-guftesiz-yazar.csv](lisans-guftesiz-yazar.csv) dosyasındadır, betik bunları eserin durumuna katar.

Dikkat edilecekler:

- **Sözü gösterilmeyen 4 eser:** Vecdi Bingöl'ün güfteleri olan `Bende Oldum`, `Dilbera Sazın`, `Gül Mevsimi` ve `Şeb-i
  Vuslat`ta besteci kamu malı, engel yalnız güftedir ve arşiv sözü göstermiyor. Listede kaldılar; yalnız ezgiyle tutulup
  tutulamayacakları avukata sorulmalı.
- **Güftesi bilinmeyen eserler:** besteci kamu malı olan 363 eserde söz gösteriliyor ama güfte yazarı SymbTr'de kayıtlı değil;
  147'sinde besteci 1900'den sonra ölmüş (başta 141'di, altı eserin bestecisi doğrulamada kamu malı çıktı). ProjeTSM, MusicBrainz,
  İTÜ kataloğu ve TRT repertuvar kayıtlarında (defteriniz.com) arandı: 14 eserin yazarı bulundu (8 kamu malı, 3 telifli, 3 ölüm yılı
  bilinmiyor). Telifli çıkanlar `Varsın Gönül Aşkınla` (Vecdi Bingöl), `Aşkı Hüznümle Yarattım` (Kemal Şakir Yakar) ve `Sûziş-i
  Aşkınla Ben` (Ercüment Ekrem Talu) dışlama listesine geçti. Kalan 133 eserde kaynakların çoğu "Meçhul" ya da "[unknown]" diyor;
  bu, hak sahibinin olmadığı anlamına gelmez. Bu eserler sınıflandırmada kamu malı kalmıştır, kaynak durumu dosyada yazar.
- **Seyir örnekleri:** makam ekranındaki örnekler arşivden gelir (`drills.js`). 169 seyirin 140'ı telifli (Şefik Gürmeriç 74,
  Erol Bingöl 66), 29'u kamu malıdır (Rauf Yektâ). Belirsiz seyir kalmadı. Telifliler çıkarılırsa seyir örneği olan 78 makamın
  49'unda örnek kalmaz. Bu, önceki hesapta yalnız en kötü durumdu; Erol Bingöl telifli çıkınca karar için gerçek durum oldu.
- **Her yıl yeniden çalıştırılmalı:** örneğin 2027 için liste 774 telifli, 370 belirsiz, 925 kamu malı verir. Ölüm yılı
  belli satırlarda durum yıldan hesaplanır, tablodaki `telif_durumu` değil; tablo yine de elle güncellenmelidir.

### Lisans derlemesi

Eserleri çıkarma kararı verilmedi; bu seçenek karar verilirse tek komutla uygulanabilsin diye var. Varsayılan derleme ve depodaki
`notalar/` değişmez. Liste her derlemede CSV'lerden okunur. Bilinmeyen seçenek, boş liste ya da arşivde olmayan kimlik derlemeyi
durdurur. Bu da hukuki görüş değildir; SymbTr'nin NC şartı çıkarılmayan eserler için de geçerlidir.

```bash
npm run android:bundle:temiz
```

`npm run build:web:temiz`, `android:sync:temiz` ve `ios:sync:temiz` de var. Düz `android:bundle` ve `android:sync`, `www/`'yi
tam arşivle yeniden yazar. Belirsizleri de çıkarmak için: `npm run build:web -- --lisans-temiz --lisans-belirsiz`, sonra
`npx cap sync android`.

Etki (4 Kasım 2026 listeleriyle; CSV değişince sayılar değişir). Sıkıştırılmış sütun, dosyaların tek tek deflate edilmiş toplamıdır
ve paketin yaklaşık karşılığıdır; gerçek APK ya da AAB ölçülmedi.

| Derleme | Eser | Seyir | Seyiri olan makam (20'de) | Arşiv makamı | Form | Usul | Besteci | `www/` | Sıkıştırılmış |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Normal | 2200 | 169 | 20 | 155 | 56 | 88 | 501 | 16,99 MB | 4,62 MB |
| `--lisans-temiz` | 1414 | 29 | 13 | 149 | 54 | 81 | 320 | 13,01 MB | 4,07 MB |
| `--lisans-belirsiz` | 1821 | 169 | 20 | 146 | 49 | 83 | 362 | 15,18 MB | 4,39 MB |
| İkisi birlikte | 1035 | 29 | 13 | 140 | 43 | 74 | 177 | 11,20 MB | 3,84 MB |

- **Makam ekranı:** telifliler çıkınca Kürdî, Hümâyun, Uzzâl, Zirgüleli Hicaz, Kürdîli Hicazkâr, Mâhur ve Nikriz'in seyir örneği
  kalmaz; ekranda "Arşivde bu makamın seyir örneği yok." yazar. Kalan 13 makamda birer örnek kalır, hepsi Rauf Yektâ'nın. 20 makamın
  hiçbiri eserlerini tümden yitirmez; en azı Zirgüleli Hicaz (7 eserden 3) ve ikisi birlikte 2.
- **Dersler, etütler, yol haritası:** arşivdeki bir esere kimlikle bağlanan yer yok, kopan bağ yok. Bir derste "bir eser aç" diye
  genel bir görev var, o çalışır. Uygulamanın 15 usulünün 8'inde arşiv eseri vardır, bunların hiçbiri boşalmaz (en azı Türk Aksağı:
  64 eserden 32, ikisi birlikte 19).
- **Bağlantı, favori, son açılanlar:** `?eser=` bağlantısındaki eser yoksa arşiv listesi "Bu bağlantıdaki eser arşivde yok." ile
  açılır. Favori sayısı ve son açılanlar yalnız var olan eserleri sayar. Kayıtlı süzgeçteki besteci yoksa süzgeç "Hepsi"ye döner.
- **Sayılar:** uygulamadaki eser sayısı artık dizinden gelir, bunun için dizin açılışta boşta yüklenir. `store/listing.md` ve
  `README.md` elle yazılı kalır, derleme değişirse güncellenmeli.
- **Web önbelleği:** temiz derlemede `www/sw.js`'in önbellek adına listenin özeti eklenir; böylece web sürümünde daha önce açılmış
  eserler önbellekten silinir.

**Bu seçeneğin kapsamadıkları:**

- **Depo ve web sitesi:** seçenek yalnız `www/`'yi, yani Android ve iOS paketini etkiler. Depo herkese açıktır ve GitHub Pages
  `main` dalının kökünden yayımlar: `notalar/` içindeki 2200 eser orada kalır, `alikrc.github.io/Sol-Klarnet/` tam arşivi sunar.
  Karar verilirse bunun için ayrı iş gerekir.
- **Kullanıcının cihazı:** "Eserlerime ekle" ile kopyalanan eserler cihazda kalır ve paylaşım bağlantısı (`#nota=`) notayı kendi
  içinde taşıdığı için bu kopyalardan paylaşım sürer.

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
