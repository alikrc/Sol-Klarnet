# Gezinme (menü) sadeleştirme — tasarım

Tarih: 2026-10-30

## Neden

Kullanıcı uygulamada kayboluyor. "Dersler, Çalışma iç içe; geri gitme vs kayboluyorum; app içinde aşağıda kalıyor." İnceleme sonucu dört kök neden:

1. **Alt menüdeki iki düğme bölüm değil, kısa yol.** "Dersler" ve "Notalar" Çalışma görünümünü belirli bir sekmeyle açar (`practice.js` `navlessons`/`navnotes`, `markNotes`). Seçili düğme hesabı karışır, aynı sayfaya üç yoldan girilir.
2. **Geri davranışı yola göre değişir.** Hub'dan açılan alıştırma geçmişe kayıt ekler (`exPush`), Dersler eklemez; Çalışma düğmesine yeniden dokunmak, Dersler'den Çalışma'ya geçmek ayrı özel durumlar (`practice.js` 465–534, `app.js` `go`).
3. **İçerik aşağıda kalır.** Bir alıştırmada içerikten önce: uygulama çubuğu → "ÇALIŞMA" etiketi + hedef çubuğu → "‹ Çalışma | Başlık" → kardeş çip satırı → "Nasıl kullanılır?" → metronom/dron → açıklama. Telefonda ekranın yarısı.
4. **Sayfa bir kartın içinde** (`section.card.practice`), iç içe görünümü artırır.

## Dayanak (best practice)

- Alt menü: 3–5 eşit önemde ana bölüm; aynı anda tek seçili; her bölüm kendi geçmişini tutar; seçili sekmeye tekrar dokununca bölüm başına döner (Material 3 navigation bar, Apple HIG tab bar).
- Bölüm içinde derinleşme: üstte tek satır "← Başlık"; ekrandaki ← ile sistem geri tuşu aynı şeyi yapar.
- Sekme/segment yalnızca aynı seviyedeki eş görünümler içindir, bölümler arası geçiş için değil.
- Kademeli gösterim: ikincil araçlar (yardım, metronom, dron) ilk ekranı kaplamaz.

Kullanıcı tıklanabilir taslağı gördü ve "daha iyi görünüyor" dedi. Bu belge o taslağı tarif eder.

## Hedefler

- Kullanıcı her an hangi bölümde ve hangi derinlikte olduğunu tek bakışta bilir.
- Geri tuşu (ekrandaki ← ve Android/tarayıcı geri) her yerde aynı kurala uyar.
- Bir alıştırma açılınca ilk ekranda alıştırmanın kendisi görünür.

## Hedef dışı

- Alıştırmaların, derslerin, arşivin iç işleyişi ve içeriği değişmez; yalnızca kabuk (gezinme, başlık, araç yerleşimi).
- Görsel kimlik (renkler, yazı tipleri, koyu/açık tema) değişmez.
- Yeni özellik eklenmez.

## Kaçınılacaklar (çalışsa bile başarısızlık sayılır)

- Bir bölüme iki farklı alt menü düğmesinden girilebilmesi.
- Aynı anda iki alt menü düğmesinin seçili görünmesi.
- Ekrandaki ← ile telefonun geri tuşunun farklı yere gitmesi.
- Var olan bağlantıların (`?view=…&tab=…&ders=…&eser=…`, `#nota=`, manifest kısayolları) kırılması.
- Çalan sesin (metronom, dron, eşlik, şimdi çalıyor çubuğu) sekme değiştirince beklenmedik şekilde kesilmesi ya da sürmesi; bugünkü davranış korunur.

## Yeni yapı

### Alt menü: beş bölüm

| Düğme | İçindekiler (bugünkü sekme kimlikleri) |
|---|---|
| **Akort** | akort / parmak (bugünkü `tune`, `finger`), parmak tablosu bağlantısı |
| **Dersler** | `lessons`, `roadmap`, `videos` |
| **Çalış** | Teknik: `quiz`, `gorbas`, `staffmap`, `tablo`, `desifre`, `long`, `rhythm`, `hiz`, `susleme`; Makam: `makam`, `mimic`, `seyir`, `ear`, `dikte`; Takip: `progress` |
| **Eserler** | `archive`, `piece`, `band`, `kulaktan`, `convert`, `rec` |
| **Ayarlar** | bugünkü ayarlar; `review` (uzman kontrolü) onun alt sayfası |

Kararlar:
- "Notalar" düğmesi **Eserler** olur ve Eserler grubunun tamamını alır (benim kararım; kullanıcı taslakta gördü, itiraz etmedi).
- "Çalışma" düğmesinin adı **Çalış** olur (benim kararım; alt menüde kısa ve fiil).
- `tablo` (parmak tablosu) Çalış/Teknik'te kalır; Akort'taki "parmak tablosu" bağlantısı onu açar (bugünkü gibi).

### Her bölümün kendi yığını

- Her bölüm bir sayfa yığını tutar: kök sayfa + üstüne açılan sayfalar. Örnek: Eserler → Nota arşivi → eser.
- Başka bölüme geçip dönünce yığının en üstündeki sayfa gösterilir ve kaydırma konumu korunur.
- Seçili bölümün düğmesine yeniden dokunmak: yığın köke iner; zaten kökteyse başa kaydırır.
- Yığınlar oturum içinde bellekte tutulur. Uygulama yeniden açılınca bugünkü gibi son görünüm ve son sekme açılır (`store` `view`, `ptab`).

### Kök sayfa (bölüm ana sayfası)

- Üstte uygulama çubuğu: logo, bölüm adı büyük başlık, arama, mikrofon.
- Kart çerçevesi yok; içerik sayfa zeminine doğrudan dizilir.
- **Çalış** kökü: hedef çubuğu ("Bugün 12/30 dk", dokununca İlerleme), "Kaldığın yerden devam et", Teknik / Makam / Takip grupları (bugünkü hub kartları).
- **Dersler** kökü: üstte Dersler / Yol haritası / Videolar segmenti (aynı seviyede eş görünümler; segment burada doğru kullanım). Altında "Sıradaki ders" ve ders listesi.
- **Eserler** kökü: arama alanı, Nota arşivi ve Eşlik öne çıkan satırlar, altında araçlar (Etüt ve eserler, Kulaktan çıkar, Çevir, Kayıt).
- **Akort** kökü: bugünkü Akort / Parmak geçişiyle aynı.

### İç sayfa (alıştırma, ders, eser, araç)

- Uygulama çubuğunun yerini tek satır alır: `←  Başlık        ?  [metronom]  [mikrofon]`.
  - `?` "Nasıl kullanılır?" metnini alttan açılan panelde gösterir.
  - Metronom ikonu yalnızca metronom/dron kullanan sayfalarda görünür; metronom ve dronu alttan açılan panelde gösterir. Metronom ya da dron çalarken ikon vurgulu görünür ki açık olduğu anlaşılsın.
  - Mikrofon düğmesi küçük ikon olarak kalır (alıştırmalar ona bağlı).
- Kaldırılanlar: "ÇALIŞMA" etiketi, hedef çubuğu, "‹ Çalışma" düğmesi, kardeş çip satırı (`.psubs`), kart çerçevesi.
- Alıştırmanın açıklama paragrafı (`descs`, "devamı") yerinde kalır; ilk satırda içerikten önce gelen tek öğe odur.
- Başka alıştırmaya geçiş bölüm kökünden yapılır. Alıştırma içinden başka alıştırmaya giden bağlantılar (ör. `rclong` → `long`, `mmchange` → `makam`) aynı bölümdeyse yığına yeni sayfa ekler, başka bölümdeyse o bölüme geçip onun yığınına ekler.

### Geri kuralı (tek kural)

- Her "içeri gir" geçmişe bir kayıt ekler (`history.pushState`), her ← bir kayıt geri alır (`history.back`). Ekrandaki ← doğrudan `history.back()` çağırır; ayrı yol yoktur.
- Alttan açılan panel açıkken geri: yalnızca paneli kapatır (panel açılırken geçmişe kayıt eklenir).
- Bölüm kökündeyken geri: Akort'a döner; Akort kökündeyken geri uygulamadan çıkar (Android'de Capacitor'ın varsayılan davranışı: WebView geçmişi bitince çıkış).
- Alt menüyle bölüm değiştirmek geçmişe yeni kayıt eklemez, kaydı değiştirir (`replaceState`). Yani alt menüde gezinmek geri tuşunu "doldurmaz".

### Bağlantılar ve dış giriş noktaları

Bunların hepsi yeni yapıda çalışmaya devam etmeli:
- URL: `?view=practice&tab=<id>`, `&ders=`, `&eser=`, `?view=settings`, `#nota=`. Eski biçim okunmaya devam eder; `tab` kimliği hangi bölümde olduğunu belirler. Yeni yazılan adresler aynı biçimi korur (benim kararım: yeni adres biçimi icat etme, mevcut paylaşılan bağlantılar bozulmasın).
- `manifest.webmanifest` kısayolları (`tab=lessons`, `rhythm`, `piece`).
- `SK.openTab`, `SK.openArchive`, `SK.openLesson`, `SK.openMakam`, `SK.openConvert`, `SK.go`, `ctx.selectTab`: imzaları aynı kalır; hedef sekmenin bölümüne geçip onun yığınına sayfa ekler.
- Arama (`search.js`, `SK.practiceTabs` içindeki `group`) sonuçları doğru bölümü gösterir.
- Şimdi çalıyor çubuğu (`nowplaying.js`) "git" eylemi doğru bölüm ve sayfayı açar.

### Geniş ekran

- 768 px üstünde alt menü bugünkü gibi yan raya dönüşür; aynı beş bölüm.
- İç sayfa üst satırı geniş ekranda da aynıdır.
- 1100 px üstünde Akort'ta parmak şemasının yanda durması korunur.

### Ayrıntı kararları (bağımsız okuma sonrası; hepsi benim kararım)

1. **Yığınlar ve tarayıcı geçmişi.** Doğruluk kaynağı uygulamanın kendi yığın modelidir. Tarayıcı geçmişi her zaman yalnızca *o an seçili bölümün* yığınını yansıtır: en altta Akort kaydı, bölüm Akort değilse üstünde bölüm kökü, üstünde yığındaki her sayfa için bir kayıt. Bölüm değiştirince (ve seçili bölüme dokunup köke inince) geçmiş yeniden kurulur: `history.go(-n)` ile Akort kaydına inilir, sonra hedef yığının derinliği kadar `pushState`. Böylece başka bölümün sayfaları geri tuşunun altında kalmaz ve "bölüm kökünde geri → Akort" kuralı her zaman tutar. (Yukarıdaki "bölüm değiştirmek `replaceState`" cümlesinin uygulaması budur.)
2. **Başka bölüme giden bağlantı** (`mmchange`, şimdi çalıyor "git", arama sonucu…): hedef bölüme geçilir, sayfa o bölümün yığınına eklenir. Geri, hedef bölümün yığınında bir adım iner; bağlantının bulunduğu sayfaya dönmez (iOS/Android sekme uygulamalarındaki gibi). Bağlantıyı içeren bölümün yığını olduğu gibi kalır; o bölüme dönünce oradasın.
3. **Ses ve modül yaşam döngüsü.** Bugünkü "tek etkin alıştırma" kuralı korunur: başka bir bölümde yeni bir alıştırma/sayfa *açılınca* önceki etkin modüle `leave()` çağrılır. Yalnızca alt menüyle bölüm değiştirmek (yeni sayfa açmadan) bugün görünüm değiştirmek gibi davranır: ses sürer, şimdi çalıyor çubuğu gösterir. Gizli bölümün yığınında duran sayfaya geri dönünce modülün `enter()` çağrılır.
4. **Bağlantıyla ya da yeniden açılışla gelince yığın.** Derin bağlantı tam yığını kurar: `?tab=archive&eser=X` → Eserler kökü → Nota arşivi → eser; `?tab=lessons&ders=Y` → Dersler kökü → ders. Yeniden açılışta son bölüm ve o bölümde son açılan sayfa (bir kat) açılır; bugünkü `store` anahtarlarından türetilir.
5. **Eserler kökündeki arama alanı** yeni özellik değildir: dokununca mevcut genel aramayı (`search.js`) açar.
6. **Akort ↔ Parmak** Akort kökünde eş görünüm segmentidir; geçmişe kayıt eklemez. Akort kökünde geri uygulamadan çıkar.

## Kod etkisi (yol gösterici, bağlayıcı değil)

- `index.html`: alt menü düğmeleri (`data-view` beş bölüm; `navlessons`/`navnotes` kısa yolları kalkar), Çalışma kartı.
- `app.js`: `VIEWS`, `setView`/`go`, `popstate`, `syncUrl`, açılışta adres okuma — bölüm + yığın modeline geçer.
- `practice.js`: tek "Çalışma" kabuğu (hub + `pex` + `pnav` + `psubs` + `tools`) üç bölüme bölünür; `GROUPS` bölüm eşlemesinin kaynağı olur; `markNotes`, `exPush`, `pushed` ve Çalışma düğmesi özel durumları kalkar.
- `app.css`: kart çerçevesi, `.pnav`/`.psubs`, yeni üst satır ve alttan açılan panel.
- `i18n.js`: yeni etiketler (Çalış, Eserler) iki dilde.

## Kullanıcıya bırakılmayan, kurucuya kalan

- Alttan açılan panelin görsel ayrıntısı, animasyonu (taslaktaki gibi sade).
- İkonlar (mevcut SVG dilinde; metronom ve yardım için yeni iki ikon).
- Kodu tek seferde mi, adım adım mı değiştireceği (her adım sonunda uygulama çalışır durumda olmalı).

## Doğrulama

Proje kuralı: otomatik test yok. Doğrulama telefon boyutunda (375×812) ve geniş ekranda elle gezerek:
- Her bölüm: köke gir, iki kat derine in, başka bölüme geç, geri dön → aynı sayfa ve konum.
- Ekrandaki ← ve tarayıcı geri tuşu her adımda aynı yere gider.
- Seçili bölüme tekrar dokun → köke.
- Tüm dış giriş noktaları (yukarıdaki liste) doğru bölüm ve sayfayı açar.
- Metronom/dron paneli açılır, geri tuşu paneli kapatır; çalan ses bugünkü gibi davranır.

Tıklanabilir taslak: brainstorm oturumunda `nav-taslak.html` (repoda değil).
