# Oyun havaları, eşlik, kulaktan çıkarma, okuma ve yol haritası: tasarım

Tarih: 2026-10-26. Proje sahibinin isteği: uygulama klarnete yeni başlayan birini günlük çalışmayla ileri seviyeye
götüren eksiksiz bir “süper uygulama” olsun. Sahibinin çalmak istediği tarz: Roman havası, oyun havası, karşılama (9/8),
çiftetelli, Trakya ve Rumeli. Benzer uygulamalarla (Yousician, Tonestro, SmartMusic, Modacity) karşılaştırmada öne
çıkan eksikler: uzun vadeli yol haritası, okuma ve kulak becerileri, eşlikle çalma, kulaktan çıkarma aracı.

## Trakya ve Roman

- Usuller (`learn.js` `USULS`, `halk:true`): Kasap havası 2/4, Çiftetelli 8/8, Karşılama 9/8 (2+2+2+3), Roman havası 9/8,
  Rumeli 7/8 (2+2+3). Düm-tek kalıpları yaygın darbuka çalışından; bir hocaya kontrol ettirilmeli.
- Nikriz makamı: Rast'ta Nikriz beşlisi + Nevâ'da Bûselik dörtlüsü, güçlü Nevâ, yeden Irak.
- Yedi özgün etüt (`repertoire.js`, level 6): kasap (Uşşak), karşılama (Hicaz), Roman havası (Kürdî), çiftetelli
  (Nikriz), Rumeli (Hüseynî), Nikriz etüdü, süslemeli Ağır Roman (Hicaz). Geleneksel ezgi değil, üslupta yazıldı.
- “Trakya ve Roman” ünitesi (8 ders): her derste usul (ritim adımı), dizi, serbest takip, tempolu çalma, merdiven;
  üslup dersinde kayış, çarpma, düşüş; son derste oyun havası öncesi taksim. Açılış: temeller ve usul dersi yeter,
  makam ünitesini beklemez.

## Eşlik (`band.js`)

- Usul başına kalıp: hücreler usul biriminin yarısı ya da çeyreği; `drum` (D/T/k), `bass` (1 kök, 5 beşli, 8 oktav),
  `chord` (x ud vuruşu). Elle yazılmayan usuller düm-tek vuruşlarından üretilir; usulü bilinmeyen eser ölçünün vuruş
  gruplarından.
- Sentez: düm 92→52 Hz (perde bulucunun altında), tek ve ka süzülmüş gürültü, bas üçgen + alçak geçiren (mikrofonla
  ölçümde yalnızca sinüs ve perde bulucunun altında), ud Karplus-Strong (kök, beşli, oktav).
- Mikrofon: ud perdeleri `ctx.setBandFreqs` ile dron gibi ayıklanır (sızıntı düzeyinin iki katından güçlü ses
  öğrencinindir). Kulaklık ya da Hoparlör modu önerilir.
- Eşlik sekmesi: usul, makam, tempo, bölümler, durak ↔ güçlü akor değişimi (4 ölçülük döngü), değerlendirme
  (nota başlarının usul hücrelerine oturması ±60 ms, seyir puanı).
- Etüt ve eserler: “orkestra” seçiliyse metronom yalnızca sayımda, grup sayımdan sonra; dinlemede de çalar.
  Nota arşivi: Eşlik seçeneklerine “Orkestra”, kök karar perdesi, ölçü ölçü usul kalıbı.

## Kulaktan çıkar (`transcribe.js`)

- WSOLA: 46 ms pencere, %50 örtüşme, ±12 ms benzerlik araması (4'te bir örnekle kaba, ±4 tam). Perde kaydırma =
  speed/p ile uzatma + p ile doğrusal yeniden örnekleme. 60 sn'lik bölge yarı hızda masaüstünde ≈1,2 sn.
- Dosya `decodeAudioData` ile açılır, tek kanala indirilir; dalga biçimi, sürükleyerek bölge, A/B, döngü, ±2 sn,
  boşluk/ok tuşları, dosya başına saklanan işaretler.
- Perde izi: 20 ms adımla `detectPitch` (netlik > 0,8), çalan yerin perdesi ve koma sapması; kaydırmayla birlikte.
- Seçili bölge (en çok 3 dk) `SK.convertPcm` → `SK.openConvert`: Çevir'in düzeltme ekranında açılır.

## Okuma ve kulak (`reading.js`)

- Deşifre: 4 seviye (Do4–Do5 dörtlük/ikilik → Sol3–Fa5 ve sekizlik, noktalı → makam perdeleri → bütün makamlar,
  2/4, 9/8, 7/8). Ritim ölçünün vuruş gruplarına göre bölünür; ezgi çoğunlukla adım, son nota durakta ve uzun.
  İnceleme süresi, sayım, `piecePlayer.startTempo`; dinlemek turdan sonra.
- Dikte: ritim (aynı ölçüde dört ayrı seçenek, bir ölçü sayım), ezgi (ilk nota verilir; perde düğmeleri ya da
  klarnetle çalarak). 3 seviye.
- Aralık (Kulak sekmesi ve ders adımı): Batı aralıkları ve makam aralıkları (bakiye, mücenneb, tanini, artık ikili).
- Dersler: Deşifre, Dikte, Aralıklar (Teknik ünitesi); makam perdeli deşifre ve dikte (İleri seviye).
- Günlük plan: deşifre, dikte ve oyun havası etüdü eklendi; plan günlük hedef süresine sığacak şekilde kırpılır
  (ısınma ve parmak testi hep kalır, diğerleri günün sırasıyla seçilir).

## Yol haritası (`roadmap.js`)

- Altı aşama: Başlangıç, Temel çalgıcı, Orta (hız ve süsleme), Makamlar, Oyun havaları, İleri. Her aşama ünitelerin
  dersleri + ölçülen kilometre taşları (store'daki en iyi sonuçlardan).
- Hedef tarz “oyun havaları” seçilirse Trakya ve Roman aşaması makamlardan önce gelir.
- Tahmin: son 28 günde biten ders sayısı; veri yoksa plan hızı (haftada 5 gün, ders başına 3 günlük çalışma).
- Bu hafta: pazartesiden 7 gün, hedefe ulaşılan günler; odak: sıradaki ders ve eksik ilk kilometre taşı.

## Doğrulama

- Etütlerin ölçü toplamları (`barCheck`), usul kalıplarının uzunlukları, deşifre ezgilerinin 1200 üretimde ölçü ve
  aralık denetimi, WSOLA'nın perde ve uzunluk korunumu Node'da sınandı.
- Tarayıcıda (Playwright, sahte mikrofon) bütün yeni sekmeler açıldı, konsol hatası yok.
- Gerçek klarnetle ve telefon hoparlörüyle denenmedi: eşlik sızıntısı, usule oturma eşiği (±60 ms) ve usul kalıpları
  gerçek kullanımda gözden geçirilmeli.
