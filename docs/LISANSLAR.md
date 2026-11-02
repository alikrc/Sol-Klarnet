# Lisanslar ve kullanım izinleri

Uygulamaya giren her dış kaynak, lisansı, ticari kullanımda durumu ve yapılacak iş. 2 Kasım 2026'da derlendi.
**Bu belge hukuki görüş değildir.** Mağazaya ücretli ya da reklamlı çıkmadan önce bir avukata danışılmalı.

"Ticari kullanım" burada: uygulamanın ücretli satılması, uygulama içi satın alma, reklam ya da ücretli bir hizmetin
parçası olması. Ücretsiz ve reklamsız dağıtım da bazı lisanslarda tartışmalıdır; aşağıda ayrıca belirtildi.

## Özet

| Kaynak | Nerede | Lisans | Ücretsiz dağıtım | Ticari kullanım | Yapılacak |
|---|---|---|---|---|---|
| SymbTr nota koleksiyonu | `notalar/` (2200 eser), Nota arşivi | CC BY-NC-SA 4.0 | Atıfla olur; türetilen veri de BY-NC-SA kalmalı | **Olmaz** (NC) | Ticari sürümde arşiv çıkarılmalı ya da MTG'den yazılı izin alınmalı; ayrıca eser telifleri (aşağıda) |
| Eserlerin besteci ve güfte telifleri | `notalar/` | Eserine göre | Kontrol edilmedi | Kontrol edilmedi | `lisans-besteciler.csv` doldurulmalı |
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

Arşivde 502 besteci (136 "Anonim", 118 boş), 363 güfte yazarı ve sözüyle birlikte gösterilen 1558 eser var. Türkiye'de
(FSEK) eser sahibinin ölümünden sonra 70 yıl koruma sürer; besteci ve güfte yazarı için ayrı ayrı bakılır. Arşivde
yakın zamanda ölmüş ve hâlâ yaşayan bestecilerin eserleri de var (ör. 20. yüzyıl şarkı ve saz eseri bestecileri,
seyir örneklerini yazan çağdaş müzisyenler).

- [lisans-besteciler.csv](lisans-besteciler.csv): bestecilere göre eser sayısı ve formlar; ölüm yılı ve telif durumu
  sütunları boş. Her satır doldurulmalı: ölüm yılı + 70 yıl geçmişse "kamu malı", değilse "telifli — izin ya da çıkar".
- Güfte yazarları ayrıca denetlenmeli (sözler eser ekranında gösteriliyor).
- Türküler ve "Anonim" eserler: ezgi anonim olsa da derleyenin, notaya alanın ya da düzenleyenin hakları olabilir;
  TRT repertuvarı kaynaklıysa ayrıca bakılmalı.
- Telifli olduğu anlaşılan eserler `scripts/symbtr.js` çıktısından süzülmeli (bir dışlama listesiyle).

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
