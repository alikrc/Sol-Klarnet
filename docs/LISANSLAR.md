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
| Yazı tipleri: Commissioner, Fraunces, IBM Plex Mono, Noto Music | `fonts/` | SIL OFL 1.1 | Olur | Olur | Lisans metni pakete eklenmeli |
| Bravura, Leland (SMuFL) | `omrtemplates.js` simge kalıpları (glif resimlerinden) | SIL OFL 1.1 | Olur | Olur | — |
| pdf.js | `vendor/pdfjs/` | Apache 2.0 | Olur | Olur | Lisans dosyası pakette olmalı |
| qrcode-generator | `vendor/qrcode/` | MIT | Olur | Olur | Lisans başlığı korunmalı |
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

**Kaynak sırası:** önce TDV İslâm Ansiklopedisi, sonra Wikidata, MusicBrainz, Vikipedi ve salihbora.com. Kaynak `not`
sütununda yazar. "tek kaynak" ve "ad eşleşmesi" yazan satırlar daha zayıftır, ticari karardan önce yeniden bakılmalı.
Kaynaklar farklıysa `not`ta belirtildi. Veri tabanı bağlantıları ada karşı denetlendi; yanlış bulunanlar kullanılmadı
(ör. MusicBrainz İsmet Ağa'nın eserini Neşet Ertaş'a bağlıyor).

**Durum (4 Kasım 2026):**

| Tablo | Satır | Ölüm yılı dolu | Kamu malı | Telifli | Anonim | Bilinmiyor |
|---|---:|---:|---:|---:|---:|---:|
| Besteciler | 502 | 309 | 184 | 163 | 1 | 154 |
| Güfte yazarları | 363 | 203 | 105 | 122 | 0 | 136 |

Besteciye göre 2200 eserin 1015'i kamu malı, 639'u telifli, 410'u bilinmiyor, 136'sı anonim. Besteci ve güfte birlikte
sayılınca: 896 eserde ikisi de kamu malı, 690 eserde en az biri telifli, 131 eser anonim ve güftesi engel değil, 483 eser
belirsiz.

**Nerede durdu:** bütün satırlara bakıldı, "kontrol edilmedi" kalmadı. Kalan iş, `bilinmiyor` satırlarıdır: 154 besteci
ve 136 güfte yazarı aranan kaynaklarda bulunamadı, adaşlarından ayrılamadı ya da yalnızca doğum yılı biliniyor. Bunların
71 besteci ve 6 güfte yazarı satırında MusicBrainz eseri geleneksel gösteriyor; bu adlar derleyen ya da kaynak kişi
olabilir. Öncelik: Erol Bingöl (66 seyir), Ömer Sami Güpgüp (21), Ömer Dilek (13), boş besteci satırları (118 + 7 eser)
ve "-" güfte satırı (64 eser). Bunlar için Öztuna'nın *Türk Mûsikîsi Ansiklopedisi* gibi basılı kaynak ya da TRT repertuvar
kayıtları gerekir.

Telif sınırına takılan önemli adlar: Şefik Gürmeriç (ö. 1967, 74 seyir), Sadettin Kaynak (ö. 1961, 44), Rûhî Ayangil (28),
Münir Nurettin Selçuk (ö. 1981, 25); güftede Vecdi Bingöl (ö. 1973, 24), Yahya Kemal Beyatlı (ö. 1958, 13). Sınır yılında:
Şerif İçli, Nuri Halil Poyraz, Cahit Sıtkı Tarancı, Semih Mümtaz (ö. 1956, 1 Ocak 2027'den kamu malı).

- Kamu malı olmak yalnız besteciyi ve güfte yazarını ilgilendirir; SymbTr'nin NC şartı (yukarıda) ayrıca geçerlidir.

### Dışlama listesi

`node scripts/lisans-disla.js [yıl]` iki tabloyu `notalar/index.json` ile eser eser eşleştirir ve iki dosya yazar. Yıl
verilmezse bugünün yılı alınır. **Arşive dokunmaz:** `scripts/symbtr.js` bu listeyi okumuyor, telifli eserler `notalar/`
içinde durmaktadır. Liste hukuki görüş değildir; tablolardaki zayıf kayıtlar buraya da geçer.

- [lisans-disla.csv](lisans-disla.csv): en az bir hak sahibi telifli olan **690 eser**. `engel` sütunu: besteci 408, güfte
  51, ikisi 231. `kamu_mali_yili`, eserin 1 Ocak'ta serbest kalacağı yıldır; hak sahiplerinden biri bilinmiyorsa ya da ölüm
  yılı yoksa boştur (516 eserde dolu). `zayif_kaynak` = `evet` olan 233 eserde telifli sayılmanın dayanağı yalnız "tek
  kaynak" ya da "ad eşleşmesi" kaydıdır; bunların 74'ü Şefik Gürmeriç'in seyirleridir (ölüm yılı Wikidata ad eşleşmesi).
- [lisans-belirsiz.csv](lisans-belirsiz.csv): telifli hak sahibi görünmeyen, ama en az biri bilinmeyen **483 eser**. `eksik`
  sütunu: besteci 326, güfte 95, ikisi 62. Bunlar dışlanmış sayılmadı, kamu malı da sayılmamalı.

Dikkat edilecekler:

- **Sözü gösterilmeyen 4 eser:** Vecdi Bingöl'ün güfteleri olan `Bende Oldum`, `Dilbera Sazın`, `Gül Mevsimi` ve `Şeb-i
  Vuslat`ta besteci kamu malı, engel yalnız güftedir ve arşiv sözü göstermiyor. Listede kaldılar; yalnız ezgiyle tutulup
  tutulamayacakları avukata sorulmalı.
- **Listeye girmeyen boşluk:** kamu malı sayılan 896 eserin 354'ünde söz gösteriliyor ama güfte yazarı kayıtlı değil;
  bunların 141'inde besteci 1900'den sonra ölmüş. Eski eserlerde sorun çıkması beklenmez, ama güftenin hakkına bakılmış
  değildir. Bu eserler sınıflandırmada kamu malı kalmıştır.
- **Seyir örnekleri:** makam ekranındaki örnekler arşivden gelir (`drills.js`). 169 seyirin 74'ü telifli (Şefik Gürmeriç),
  66'sı belirsizdir (Erol Bingöl). Telifliler çıkarılırsa 78 makamın 16'sında, belirsizler de çıkarılırsa 49'unda seyir
  örneği kalmaz.
- **Her yıl yeniden çalıştırılmalı:** örneğin 2027 için liste 670 telifli, 490 belirsiz, 909 kamu malı verir. Ölüm yılı
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
