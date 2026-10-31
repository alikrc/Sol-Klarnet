# Sol Klarnet — Akort, Parmak, Makam

Türk Sol klarneti (Albert sistem, 13 mandal, 2 halka) için akort, parmak pozisyonu, makam, ritim ve kulak eğitimi
uygulaması. Klarneti ilk kez eline alan birini taksim yapabilecek, Trakya ve Roman oyun havalarını eşlikle çalabilecek
seviyeye kadar götüren 77 derslik bir müfredatı, ünite sınavları ve rozetler, aralıklı tekrar ve altı aşamalı bir yol haritası var.
Mikrofondan çalınan sesi dinler; ses, resim ve dosyalar yalnızca cihazda işlenir. İnternete yalnızca **Nota bul** çıkar
(yalnızca arama sözcüğünü ve indirilecek dosyanın adresini gönderir); başka hiçbir özellik internet istemez.

## Akort ve parmak

- **AEU perdesi** (53 koma, Rast = yazılı Sol) ve perdeden **kaç koma** saptığı; sent göstergesi de var
- **Makam bağlamı:** akort ekranında makam seçilince perde yalnızca o makamın perdeleri arasında aranır
  (Uşşak'ta yazılı Si4 = Segâh), dizi dışı perde işaretlenir
- **İcra akordu:** AEU'nun yanında yaygın uygulamaya göre yaklaşık düzeltmeler (Uşşak Segâh'ı pes, Saba Çargâh'ı pes,
  Hüzzam'da Hisar tiz vb.); dersler, örnek sesler ve değerlendirme seçilen akordu kullanır
- Yazılı nota, duyulan ses, frekans, **vibrato** (hız ve derinlik), son 8 saniyenin **entonasyon izi** ve glissando işaretleri
- **Parmak pozisyonu:** klarnet çizimi, adım adım talimat, 48 notada 124 parmak (temel + alternatif);
  şemaya dokunarak parmak kurup notayı duyma
- **Nota şeridi:** yazılı Mi3–Mi♭7 arası 48 nota; entonasyon ısı haritası
- **Çalgı seçimi:** Sol, Si♭, La, Do, Mi♭ klarnet (parmaklar Albert sisteme göre)
- **Perde bulucu:** McLeod NSDF (FFT ile), telefon mikrofonunun pes sesi kırpmasından doğan onikili/oktav hatasına
  karşı spektral alt harmonik denetimi; tizde kısa pencere

## Çalışma bölümü

Alt menüde beş bölüm (`nav.js`): **Akort** (üstteki geçişle **Parmak** şeması; geniş ekranda ikisi yan yana), **Dersler** (Dersler, Teori, Yol haritası,
Videolar), **Çalış** (**Teknik**: Parmak testi, Gör ve bas, Dizek haritası, Parmak tablosu, Deşifre, Uzun ton, Ritim, Usuller, Ritim heceleri, Hız, Süsleme; **Makam**: Dizi,
Taklit, Seyir, Kulak, Dikte; **İlerleme**), **Eserler** (Nota arşivi, Eşlik, Etüt ve eserler, Kulaktan çıkar, Çevir, Kayıt) ve **Ayarlar**.
Her bölüm kendi sayfa yığınını tutar: başka bölüme geçip dönünce kaldığın sayfa açılır, seçili bölüme yeniden dokununca bölümün başına dönülür.
İç sayfalarda üstte tek satır vardır: ← ve sayfanın adı; yanında "Nasıl kullanılır?" ve metronom/dron alttan açılan panelde. Ekrandaki ← ile
telefonun geri tuşu hep aynı şeyi yapar: bir sayfa geri; bölümün başında Akort'a, Akort'ta uygulamadan çıkış.
`?tab=seyir` gibi bir adresle doğrudan bir alıştırma açılır (`&ders=`, `&eser=` ile ders ve eser).

| Sekme | İçerik |
|---|---|
| Dersler | 9 ünitede 77 ders: Başlarken (klarneti tanı, duruş/nefes, nota okuma, ritim), Temeller, Register ve klarino, Teknik ve üslup (uzun ton, register geçişi, dil vuruşu, dinamik, ses kalitesi, glissando, vibrato, usuller, kulak), Hız ve teknik (metronomla dizi, bağlı ve dille, parmak çevikliği, arpejler ve üçlüler, on altılıklar, makam dizileri hızda, hızlı etüt), Süsleme (çarpma, çarpmalı tekrar, mordan, tril, kayarak giriş ve düşüş, süslemeli etütler, grupetto, makamda süsleme), 20 makam dersi (19 makam) ve **bir eserin makamını bulma** (durak, çeşni, güçlü, seyir; kulakla makam tanı), **Trakya ve Roman** (kasap havası, karşılama, Roman havası, Nikriz, çiftetelli, Rumeli 7/8, Trakya üslubu, sirto ve köçekçe, zeybek 9/4, Ağır Roman ve çarpmalı tekrar, oyun havası öncesi taksim), okuma ve kulak (deşifre, dikte, aralıklar), İleri seviye (taksim, ileri kulak, iç tempo, makam perdeli deşifre ve dikte). **Bugünün çalışması** her gün bitirilen derslerden yeniden kurulur; bitirilen derslerin adımları artan aralıklarla (1, 3, 7, 21, 60 gün) **tekrar** olarak geri gelir, başarısız tekrar aralığı kısaltır. Her ünitenin sonunda karışık adımlı **ünite sınavı**; geçince ünite rozeti |
| Teori | Sol klarnetçi için Türk müziği teorisi, sekiz konu: dizek ve sol anahtarı, nota değerleri ve ölçü, aralıklar ve koma (AEU 53 koma; düz ♯ +4, düz ♭ −5, slaşlı ♭ −4), perdeler ve isimleri, çeşniler (dörtlü ve beşliler, aralık harfleri), makam yapısı (durak, güçlü, yeden, seyir; makam seçici), usul ve ölçü (düm-tek ızgaraları), Sol klarnet transpozisyonu (Bolahenk). Nota örnekleri ve dinle düğmeleri, ilgili ders ve alıştırmalara kartlar, her konunun sonunda üç soruluk sınav (en iyi sonuç saklanır) |
| Yol haritası | Altı aşama (Başlangıç, Temel çalgıcı, Orta, Makamlar, Oyun havaları, İleri); her aşamada dersler ve ölçülen kilometre taşları (uzun ton, ritim, kulak eşiği, deşifre, dikte, hız, tril, çarpma, seyir, etütler, eşlikle usule oturma). **Haftalık özet** (bu hafta / geçen hafta) ve **rozetler** (ünite sınavları, seri, günlük çalışma, toplam süre). Hedef tarz (oyun havaları / fasıl / ikisi) sırayı değiştirir; bu haftanın günleri ve odağı; son 4 haftanın hızından kalan süre tahmini |
| Deşifre | Her turda yeni üretilen ezgiyi inceleme süresinden sonra sayımla tempoda çal; 4 seviye (Batı notaları → makam perdeleri ve 9/8, 7/8); doğru nota oranı |
| Dikte | Ritim diktesi (dört notadan duyduğunu seç) ve ezgi diktesi (ilk nota verilir, kalanı perde düğmeleriyle ya da klarnetle çalarak yaz); 3 seviye |
| Eşlik | Darbuka, bas ve ud (sentez) ile döngüde çal: Roman havası, karşılama, çiftetelli, kasap, Rumeli, sirto, zeybek ve klasik usuller; makam, tempo, durak ↔ güçlü akor değişimi; darbuka tek ölçülerde ikinci çalışa geçer, cümle sonunda dolgu çalar. Mikrofonla usule oturma ve seyir değerlendirmesi. **Grup seni izler:** temponu izler (ara nota başlarının aralığından), susunca bekler, ilk notanla yeniden girer. **Taksimle başla:** grup dem tutar; taksim durakta uzun bir notayla bitip nefes alınınca oyun havasının ilk notasıyla girer (ya da Gir). Etüt ve eserlerde ve nota arşivinde **orkestra** eşliği |
| Kulaktan çıkar | Ses ya da video dosyasını aç; perdesini bozmadan %25–125 hız (WSOLA), yarım ses ve koma kaydırma, sürükleyerek A–B döngü, işaretler, perde izi ve çalan perdenin adı; seçili bölgeyi Çevir'de notaya dök |
| Çevir | Notayı eserin kendisine dönüştürür; yapay zekâ ve sunucu yok, okuma telefonda yapılır. **PDF ya da resim seç:** PDF, ekran görüntüsü, tarama ya da fotoğraf (birden çok resim tek esere eklenir; çok sayfalı PDF'te sayfa aralığı sorulur); dizek, nota, süre, ölçü, donanım, tekrar ve AEU koma işaretleri okunur. **Ses dosyası seç** ve **Dinleyerek yaz** (en çok 3 dakika): ezgi notalara bölünür, tempo tahmin edilir, süreler ölçüye oturtulur. Her sonuç kaydedilmeden önce düzeltme ekranından geçer: emin olunmayan notalar sarı, süresi tutmayan ölçüler turuncu, yazılı aralık dışı kırmızı. **Nota bul:** neyzen.com ve projetsm.com'da arar, indirip doğrudan okur (neyzen arama dizini cihazda saklanır). Kaydedilen eser Etüt ve eserler'e girer |
| Parmak testi | Çal, Bul ve Oku (dizekten okuyup çal) modları; zorlanılan notalar daha sık sorulur |
| Gör ve bas | Dizekteki notadan adını düşünmeden parmağa: üç notayla başlar; her nota önce adıyla ve soluk parmağıyla gelir, doğru ve hızlı buldukça önce ad, sonra parmak gizlenir, en sonda parmak ancak beklenince çıkar. Hız da ölçülür (çalarak 1,5 sn, ekranda 3 sn); açık notaların hepsi oturunca yeni nota eklenir. Klarnetle çalarak ya da klarnetsiz, ekrandaki şemada deliklere basarak cevaplanır |
| Uzun ton | Sapma, yayılım, **ses temizliği** ve **ses gücü dengesi**; nota başına rekor |
| Dizi (Makam) | 20 makamın (Nikriz dahil) dizisi, seyri, durak/güçlü/yeden; çıkış-iniş alıştırması |
| Taklit | Makam dizisinden ezgi çalar, aynısını çal; ezgi uzar |
| Hız | Makam dizisi, gam, arpej, üçlü atlama, dörtlü grup, register geçişi; sekizlik/triole/on altılık, bağlı ya da dille. Metronomla çalınır, ham sesten ölçülür (doğru nota, zamanlama, eşitlik, tempo kayması); **tempo merdiveni** temiz çalışta hızlanır. Kalıp başına en iyi tempo ve 14 günlük çizgi |
| Süsleme | Çarpma, çarpmalı tekrar, mordan, tril, grupetto, kayarak giriş, düşüş; makam seçilirse komşu nota makam dizisinden. Her denemeden sonra perde eğrisi ve ne yapılacağı; en iyi tril hızı ve çarpma başarısı İlerleme'de. Ölçüm deneme bitince ham sesi 5 ms adımla yeniden çözer |
| Ritim | Kalıplar ve usuller (Sofyan, Semâî, Düyek, Aksak, Ağır Aksak, Curcuna; oyun havaları: Kasap 2/4, Çiftetelli 8/8, Karşılama ve Roman havası 9/8, Rumeli 7/8); erken/geç ve tutarlılık; metronomsuz iç tempo; hoparlörle ya da çalarak gecikme ayarı |
| Usuller | 15 usul kolaydan zora (Türk Aksağı 5/8 ve Yürük Semâî 6/8 dahil): ne olduğu, nerede çalındığı, düm-tek ızgarası ve hecelerle sayılışı. Her usul dört adımda öğrenilir: dinle ve say, Düm/Tek düğmeleriyle elle vur, ezberden vur (yalnız ölçü başı tık), klarnetle çal (mikrofon); adım puanları saklanır. **Hangi usul?** 8 soruluk kulaktan tanıma testi; “Bu usulde eserler” arşivi o usule süzer |
| Ritim heceleri | Nota değerlerini kelime heceleriyle öğretir: dörtlük “nar”, iki sekizlik “el-ma”, triole “por-ta-kal”, dört onaltılık “man-da-li-na”, ikilik “na-ar”, dörtlük sus. Hece sistemi seçilir: Meyveler, İngilizce (tea, cof-fee, co-co-nut, wa-ter-mel-on) ya da ta-ti. Kalıp kartları (nota yazısı ve heceler, dokununca çalar); Alıştırma'da üç seviyede rastgele 4/4 ölçü: dinle (çalan hece yanar), elle vur (puan, erken/geç), klarnetle çal (mikrofon). **Hangi ölçü?** duyulan ölçüyü üç nota yazısından bulma |
| Kulak | Tiz mi pes mi (uyarlanır merdivenle koma eşiği), perde ayırt (ABX, 1 komaya kadar), makam tanı, aralık (Batı aralıkları; bakiye, mücenneb, tanini, artık ikili) |
| Seyir | Serbest çalma / taksim: perdelerde süre, dizi dışı, güçlü vurgusu, açılış, karar; çalınan **süslemeler** (çarpma, çarpmalı tekrar, mordan, grupetto, tril, kayış, düşüş) ham sesten sayılır |
| Nota arşivi | **Eserler** bölümünün başında. SymbTr'den 2200 eser (155 makam, 88 usul, 56 form), uygulamanın içinde. “Oyun havaları” hızlı süzgeci (karşılama, köçekçe, Rumeli türküsü, sirto, longa, zeybek…). Ad, bestekâr, makam ve usule göre arama; makam, form, usul, bestekâr, seviye, sözlü ve favori süzgeçleri; sıralama. Eser ekranında satırlara bölünmüş ya da tek şerit nota, AEU koma işaretleri, perde adları ve güfte heceleri; çal, notaya dokununca oradan çal, tempo %25–150, A–B ölçü döngüsü, bölüm ve cümle döngüsü, dem (karar perdesi), metronom, usul (düm-tek) ya da orkestra (darbuka, bas, ud) eşliği, melodiyi kapat; mikrofonla takip, **Benimle çal** (orkestra seni izler), tempolu çalma ve merdiven; perde perde transpoze ve oktav, nota boyutu, notayı izle, tam ekran, yazdır; yedi adımlık "Eseri öğren", benzer eserler, son açılanlar ve favoriler; "Eserlerime ekle" |
| Etüt ve eserler | Koma işaretli dizek (AEU: koma, bakiye, küçük/büyük mücenneb); 28 özgün etüt (on biri Trakya ve Roman üslubunda: kasap, karşılama, Roman havası, çiftetelli, Rumeli 7/8, Nikriz, süslemeli Ağır Roman, sirto, köçekçe, zeybek, çarpmalı tekrarlı Ağır Roman; biri hızlı, ikisi süslemeli: tril, çarpma, mordan, kayış işaretleri dizekte); kendi eserini yazma; **MusicXML / .mxl içe aktarma** (SymbTr dahil, komalar `<alter>`'den); serbest takip, metronomla tempolu çalma (perde + zamanlama), takipte sıradaki notanın parmağı ve **önceki notadan değişen parmaklar** (kapanan halkalı, kalkan kesik çizgili), %60'tan başlayan tempo merdiveni ve **Benimle çal**: orkestra çaldığın notaları eserdeki yerine eşler; ilk notanla girer, hızlanırsan hızlanır, yavaşlarsan yavaşlar, durursan bekler ve kaldığın ya da biraz ilerideki notadan devam eder |
| Kayıt | Kayıt, nota dökümü, zaman–koma grafiği (perde eğrisi), pes/tiz/kayma/titreklik işaretleri ve en çok kaçan perdeler, kaydı dosya olarak paylaşma. Kayıtlar cihazda tarihle saklanır (son 50, ★ ile saklananlar silinmez); son kaydı bir ay önceki ya da seçilen bir kayıtla **karşılaştırma**: yan yana dinleme, üst üste perde eğrileri, yerinde nota, ortalama sapma ve ses temizliği farkı |
| İlerleme | Seri, günlük hedef, son 14 gün, test, uzun ton, entonasyon, ritim, kulak eşiği, seyir, eserler |

Usullü metronom ve durak sesi (dron) her sekmede üstteki araç çubuğundan tek dokunuşla açılır; ayarları
(usul, tempo, perde, ses düzeyi) ok düğmesiyle açılan kısımdadır. Dron hoparlörden çalarken sızıntı düzeyi
izlenir; durağı dronla birlikte çalmak da ölçülür.

## Ayarlar

Çalgı, diyapazon (La = 430–450 Hz), gösterge (koma / sent), hassasiyet ve **ortam gürültüsüne göre otomatik ayar**,
**hoparlör modu** (yankı giderme), günlük hedef ve (Android/iOS) **günlük hatırlatma**, tema, dil (Türkçe / İngilizce),
**yedekleme** (bütün ilerleme tek JSON dosyası) ve **uzman kontrolü** (hocaların parmakları, makamları ve süslemeleri
doğru/yanlış diye işaretleyip rapor paylaşması). İlk açılışta karşılama akışı seviyeye göre başlangıç noktasını kurar.

## Çalıştırma

Mikrofon yalnızca `https://` ya da `localhost` üzerinden açılır:

```bash
npm start
```

Sonra http://localhost:8080 adresini aç. Uygulama bir kez açıldıktan sonra çevrimdışı da çalışır ve telefonda
“Ana ekrana ekle” ile kurulabilir. Bağlantılar: `index.html#nota=52` (yazılı MIDI, 52 = Mi3 … 99 = Mi♭7),
`?tab=rhythm` (doğrudan bir sekme). Her sayfanın kendi adresi vardır ve adres çubuğu açık sayfayı gösterir:
`?view=finger`, `?view=practice` (Çalışma ana sayfası), `?view=settings`, `?tab=lessons&ders=makam-bulma` (bir ders),
`?tab=archive&eser=<id>` (nota arşivinde bir eser).

## Android ve iOS

Capacitor ile paketlenir: [docs/ANDROID.md](docs/ANDROID.md), [docs/IOS.md](docs/IOS.md).
Yeni sürüm için `npm run release -- 1.1.0` (package.json, service worker önbelleği, Android ve iOS sürüm numaraları).
Mağaza görselleri ve metinleri `store/` klasöründe; ekran görüntüleri ve tanıtım görseli `npm run store-shots` ile yeniden üretilir (Playwright gerekir).

## Ses denetimi

```bash
npm run audio-check     # testdata/ içindeki gerçek klarnet kayıtlarıyla perde bulucu denetimi
```

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html`, `app.css`, `app.js` | Sayfa iskeleti, stiller; ayarlar, gösterge, parmak şeması, nota şeridi, ses, mikrofon, görünümler (`window.SK`) |
| `core.js` | Perde/nota hesabı, makam bağlamı, çalgılar, parmak kodları, perde bulucu (tarayıcı + Node) |
| `learn.js` | Makam ve usul verisi, icra düzeltmeleri, test, puanlama, istatistik (tarayıcı + Node) |
| `lessons.js` | Müfredat (iki dilli), adım başlıkları, geçme koşulları, kilit sırası, günlük plan (tarayıcı + Node) |
| `skills.js` | Nota başı bulma, ritim, ses kalitesi, dinamik, seyir analizi, kulak eğitimi, süsleme ölçümü, teknik kalıpları, hızlı çalış ölçümü ve tempo merdiveni (tarayıcı + Node) |
| `pcmring.js` | Mikrofonun son 8 saniyelik ham sesi (AudioWorklet); süsleme denemeleri bundan çözülür |
| `repertoire.js` | Süreli nota biçimi, AEU koma işaretleri, MusicXML, tempolu çalma değerlendirmesi, etütler (tarayıcı + Node) |
| `nav.js` | Gezinme: alt menüdeki beş bölüm, bölüm başına sayfa yığını, tarayıcı geçmişi ve geri tuşu, adres, üst çubuk, alttan açılan panel |
| `practice.js` | Dersler, Çalış ve Eserler'in ortak kabuğu: bölüm ana sayfaları, metronom ve dron, sürekli ölçümler, sekmelere verilen ortak yardımcılar |
| `drills.js` | Parmak testi, Uzun ton, Dizi (makam), Taklit, Kayıt ve İlerleme sekmeleri |
| `lessonview.js` | Dersler sekmesi: ders listesi, ders sayfası ve adım çalıştırıcıları |
| `trainers.js`, `pieces.js` | Ritim, Kulak, Seyir ve Eserler sekmeleri, yeni ders adımları |
| `usuller.js` | Usuller sekmesi: usul öğretim metinleri, dinle/vur/ezber/çal adımları, düm-tek vuruş puanı, Hangi usul? testi; Ritim heceleri sekmesi (hece kalıpları, ritim notası SVG'si, alıştırma, Hangi ölçü?) |
| `band.js` | Eşlik grubu: usul başına darbuka, bas ve ud kalıpları, sentez, Eşlik sekmesi; eser çalarlar için ölçü olayları |
| `follow.js` | Seni izleyen eşlik: nota başları (`NoteStarts`), tempo haritası (`TempoMap`), eser takipçisi (`ScoreFollower`), notasız tempo izleme (`GrooveTracker`), haritaya göre çalan grup (`FollowBand`) |
| `convert.js` | Çevir sekmesi: PDF/resim/ses seçimi, düzeltme ekranı, Nota bul arayüzü |
| `omr.js`, `omrtemplates.js` | Nota okuyucu (dizek, simge kalıpları, perde ve süre) ve Bravura/Leland'dan üretilen kalıplar |
| `sources.js` | Nota bul: neyzen.com ve projetsm.com ayrıştırıcıları, neyzen dizini (IndexedDB); `SOURCES.neyzen.enabled` ile kapatılır |
| `transcribe.js` | Kulaktan çıkar: WSOLA zaman uzatma, perde kaydırma, perde izi, sekme |
| `reading.js` | Deşifre ezgisi, ritim ve ezgi diktesi, aralık soruları; Deşifre ve Dikte sekmeleri, ders adımları |
| `teori.js` | Teori sekmesi (Dersler kökü): konu metinleri, nota örnekleri, aralık tablosu, çeşniler, makam seçici, usul ızgaraları, transpozisyon tablosu, konu sınavları |
| `roadmap.js` | Yol haritası: aşamalar, kilometre taşları, hız tahmini, haftalık görünüm; sekme |
| `archive.js`, `notalar/` | Nota arşivi sekmesi ve verisi (`notalar/index.json` dizin, her eser ayrı dosya); `scripts/symbtr.js` SymbTr deposundan üretir |
| `review.js`, `onboard.js` | Uzman kontrolü, karşılama akışı |
| `i18n.js` | Tema ve dil; yeni metinler `L("Türkçe", "English")` ile, eskiler sözlükte |
| `fonts/` | Uygulamanın içindeki fontlar (`npm run fonts`) |
| `testdata/` | Gerçek klarnet kayıtları (`npm run audio-check`), nota okuyucunun yazı tipleri ve örnek listesi (örneklerin kendisi depoya girmez) |

## Kaynaklar

Parmak verisi ve mandal adları: [Woodwind Fingering Guide — Oehler/Albert](https://www.wfg.woodwind.org/clarinet/ocl_bas_1.html),
[mandal açıklaması](https://www.wfg.woodwind.org/clarinet/cl_fing.html). Temel parmaklar `ocl_bas_1–3`, alternatifler
`ocl_alt_1–4` sayfalarından; Albert sistemde olmayan mandalları kullanan Oehler parmakları alınmadı.
Fontlar Google Fonts'tan (SIL Open Font License).
Nota okuyucunun simge kalıpları [Bravura](https://github.com/steinbergmedia/bravura) ve
[Leland](https://github.com/MuseScoreFonts/Leland) yazı tiplerinden (SIL Open Font License) üretilir; yazı tipleri
`testdata/fonts/` altında. Gerçek nota örnekleri telifli olabildiği için depoya girmez (`testdata/omr/README.md`).
PDF okuma: [pdf.js](https://github.com/mozilla/pdf.js) (pdfjs-dist 4.10.38, Apache 2.0), `vendor/pdfjs/` altında; `npm run vendor`
ile `node_modules`tan kopyalanır, uygulama yalnızca PDF seçilince yükler.

Nota bul: [neyzen.com](https://www.neyzen.com/) ve [projetsm.com](http://projetsm.com/) nota arşivleri aranır, seçilen dosya
indirilip cihazda okunur; dosyalar uygulamaya kopyalanmaz. neyzen arama dizini IndexedDB'de saklanır. neyzen.com'dan
yayın öncesi yazılı izin alınmalıdır (bkz. BACKLOG).

Nota arşivi: [SymbTr](https://github.com/MTG/SymbTr) (M. K. Karaosmanoğlu, "A Turkish makam music symbolic database for
music information retrieval: SymbTr", ISMIR 2012; Music Technology Group, Universitat Pompeu Fabra), CC BY-NC-SA 4.0.
`notalar/` bu koleksiyondan türetilmiştir ve aynı lisansla, ticari olmayan amaçla paylaşılır. Yeniden üretmek için:
`node scripts/symbtr.js <SymbTr deposu>`. Koleksiyonda bestekârı 70 yıldan kısa süre önce ölmüş eserler de var
(FSEK md. 27); mağaza yayınında telif bildirimi gelirse betikte bestekâr süzgeci eklenebilir.

## Planlama

- [docs/BACKLOG.md](docs/BACKLOG.md): yapılanlar ve insan gerektiren işler
- [docs/TODO.md](docs/TODO.md): mağaza yayını için yapılacaklar
