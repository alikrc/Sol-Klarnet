# Sol Klarnet — Backlog

## Oyun havaları, eşlik, kulaktan çıkarma, okuma ve yol haritası — tamamlandı (26 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-26-oyun-havalari-design.md](superpowers/specs/2026-10-26-oyun-havalari-design.md).

- Trakya ve Roman ünitesi (8 ders), beş oyun havası usulü (kasap, çiftetelli, karşılama, Roman havası, Rumeli),
  Nikriz makamı, yedi özgün etüt; toplam ders 59 → 72
- Eşlik sekmesi (darbuka, bas, ud), etüt ve nota arşivinde orkestra eşliği; arşivde “Oyun havaları” süzgeci
- Kulaktan çıkar: perdeyi bozmadan yavaşlatma, kaydırma, A–B döngü, işaretler, perde izi, Çevir'e aktarma
- Deşifre, Dikte (ritim, ezgi), Kulak'ta aralık; ilgili dersler ve günlük plan adımları; günlük plan hedef süresine sığar
- Yol haritası: altı aşama, kilometre taşları, haftalık görünüm, kalan süre tahmini
- Gerçek mikrofonla ve telefon hoparlörüyle denenmedi; Playwright'ta sahte mikrofonla açıldı


## Perde eğrisi — tamamlandı (24 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-24-perde-egrisi-design.md](superpowers/specs/2026-10-24-perde-egrisi-design.md),
plan: [docs/superpowers/plans/2026-10-24-perde-egrisi.md](superpowers/plans/2026-10-24-perde-egrisi.md).

- Kayıt sekmesinde zaman–koma grafiği: hedef perde şeritleri, nota rengine göre eğri, sürükleyerek kaydırma,
  "Tümü" görünümü, çalma çizgisi; grafiğe ya da tablo satırına dokununca kayıt o ana sarılır
- Kendiliğinden işaretler (`skills.js` `intonationIssues`, eşikler `INTON`): pes, tiz, kayma, titreklik;
  bilgi olarak alttan/üstten giriş, vibrato, dizi dışı. Hedef perde seçili makamın dizisinden alınır
- Özet: kaç nota yerinde, en çok kaçan üç perde, ipucu ve "Parmağa bak" bağlantısı
- Gerçek mikrofonla denenmedi: arayüz sahte kayıtla (`SKDEBUG.recPresent`), ölçüm sentetik izlerle sınandı

## Hız ve teknik — tamamlandı (24 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-24-hiz-teknik-design.md](superpowers/specs/2026-10-24-hiz-teknik-design.md),
plan: [docs/superpowers/plans/2026-10-24-hiz-teknik.md](superpowers/plans/2026-10-24-hiz-teknik.md).

- Teknik kalıpları kurallarla üretiliyor (`skills.js` `techPattern`): makam dizisi, Batı gamı, arpej, üçlü atlama,
  dörtlü grup, register geçişi; sekizlik/triole/on altılık, bağlı ya da dille
- Çalış ham sesten ölçülüyor (`SK.pcmCapture`, `runNotes` → `alignRun` → `runVerdict`): doğru nota, zamanlama,
  eşitlik ve tempo kayması; metronom tıkı ve dron aralıkları ayıklanıyor
- Tempo merdiveni (`TempoLadder`), "Hız ve teknik" ünitesi (7 ders, toplam 59), "Hız" sekmesi, eserlerde merdiven
- Gerçek mikrofonla denenmedi: tarayıcı panelinde mikrofon kapalıydı; ölçüm sentetik seslerle ve sahte kayıtla sınandı

## Süsleme — tamamlandı (23 Ekim 2026)

Tasarım: [docs/superpowers/specs/2026-10-23-susleme-design.md](superpowers/specs/2026-10-23-susleme-design.md),
plan: [docs/superpowers/plans/2026-10-23-susleme.md](superpowers/plans/2026-10-23-susleme.md).

- Yeni "Süsleme" ünitesi (7 ders): çarpma, alttan çarpma ve çarpmalı tekrar, mordan, tril, kayarak giriş ve düşüş,
  süslemeli iki etüt, makamda süsleme. Toplam ders 45 → 52
- Ölçüm: mikrofonun son 8 sn'lik ham sesi (`pcmring.js`, AudioWorklet) deneme bitince 5 ms adımla yeniden çözülür
  (`skills.js`: `ornamentTrack`, `microNotes`, `ornamentEval`); eşikler `ORN` içinde
- Teknik grubunda "Süsleme" alıştırma sekmesi; İlerleme'de en iyi tril hızı ve çarpma başarısı
- Nota metninde süsleme ekleri (`La4:2:tr`, `ç+`, `m-`, `k`, `d`), MusicXML'den tril, mordan ve süs notası; dizekte işaretler;
  tempolu çalmada ayrı süsleme puanı
- Uzman kontrolüne "Süslemeler" sekmesi
- Gerçek mikrofonla denenmedi: tarayıcı panelinde mikrofon kapalıydı, ölçüm yalnızca sentetik seslerle ve sahte PCM ile
  sınandı. Telefonda gerçek klarnetle denenmeli

## Kapsamlı iyileştirme — tamamlandı (10 Ekim 2026)

- Perde bulucu: FFT ile NSDF, telefon mikrofonunun pes sesi kırpmasına karşı alt harmonik denetimi, tizde kısa pencere;
  800 gerçekçi sentetik seste eski bulucu 190, yeni bulucu 3 hata. Gerçek kayıtlar için `npm run audio-check`
- Makam bağlamı ve icra akordu; 10 yeni makam (toplam 19), her birinin seyir türü
- Ritim (kalıplar, usuller, iç tempo, gecikme ayarı), kulak eğitimi (koma eşiği, ABX, makam tanı), seyir/taksim analizi,
  ses kalitesi (netlik, ses gücü dengesi), dinamik (crescendo/decrescendo/messa di voce)
- Eserler: koma işaretli dizek, 14 özgün etüt, MusicXML/.mxl içe aktarma, tempolu çalma değerlendirmesi
- Müfredat 21 → 46 ders (Başlarken ve İleri seviye üniteleri dahil); günlük plan yeni becerileri de içeriyor
- Karşılama akışı, günlük hedef ve hatırlatma, yedekleme/geri yükleme, kaydı paylaşma, uzman kontrolü ekranı
- Çalgı seçimi (Sol, Si♭, La, Do, Mi♭), hoparlör modu (yankı giderme), ortam gürültüsüne göre hassasiyet
- Fontlar uygulamanın içinde, internet izni yok; iOS projesi; İngilizce arayüzde eksik çeviri kalmadı

## İnsan gerektiren işler (kodla çözülemez)

1. **Uzman doğrulaması:** Bir Sol klarnet hocası Ayarlar → Uzman kontrolü ekranından 124 parmağı, 20 makamın (Nikriz dahil) dizisini,
   seyir türünü ve icra düzeltmelerini işaretleyip raporu göndermeli. 72 dersin metinleri ve 24 etüt de gözden geçirilmeli. Hız ünitesinin gam/arpej seçimi, hedef tempoları ve hızlı Hicaz etüdü
   (`e-hiz-hicaz`) de kontrol edilmeli. Süslemeler (Uzman kontrolü → Süslemeler): tanımlar,
   örnek sesler, ölçüm eşikleri (`skills.js` `ORN`; ör. tril düzeni ≤ 0,2, çarpma 20–120 ms) ve iki süslemeli etüt.
   Yanlış bulunanlar `core.js` (FINGERINGS, ALT_FINGERINGS), `learn.js` (MAKAMS, SEYIR_TYPE, ICRA) ve
   `repertoire.js` (ETUDES) içinde düzeltilir; testler tutarlılığı denetler.
2. **Gerçek kayıtlar:** `testdata/README.md` içindeki listeye göre telefonla kayıt toplanıp `npm run audio-check` çalıştırılmalı.
   Süsleme eşikleri (`ORN`) yalnızca sentetik seslerle ayarlandı; süslemeli gerçek kayıtlarla gözden geçirilmeli.
   Perde eğrisi eşikleri (`INTON`; ör. pes/tiz 1,5 koma, titreklik 0,8) de gerçek kayıtlarla gözden geçirilmeli.
3. **WFG izni:** Parmak verisi Woodwind Fingering Guide'dan; ücretli yayınlanacaksa sahibinden izin istenmeli.
4. **Mağaza:** Play geliştirici hesabı, yükleme anahtarı, kapalı test; iOS için Mac + Xcode + Apple geliştirici hesabı;
   mağaza ekran görüntüleri ve tanıtım görseli.
5. **Oyun havaları:** Beş halk usulünün düm-tek kalıpları (`learn.js` USULS, `band.js` BAND_STYLES), Nikriz dizisi ve yedi
   Trakya/Roman etüdü (`repertoire.js`, level 6) bir Trakya ya da Roman klarnetçisine dinletilmeli. Eşlikle usule oturma eşiği
   (±60 ms) ve eşlik sızıntısının ayıklanması telefon hoparlörüyle denenmeli.
6. **Repertuvar:** Telifli eserler eklenmedi; kullanıcı MusicXML içe aktarabiliyor. SymbTr gibi açık lisanslı arşivlerden
   seçki eklenecekse lisans koşulları kontrol edilmeli.

## Sonraki adımlar (öncelik sırasıyla, 27 Ekim 2026)

1. **Gerçek klarnetle deneme (proje sahibi):** Telefonda Eşlik, Kulaktan çıkar ve Trakya etütleri gerçek klarnetle
   çalınmalı. Bakılacaklar: eşlik hoparlörden mikrofona sızıp nota sanılıyor mu (`practice.js` `bandFreqs` ayıklaması),
   usule oturma yüzdesi gerçekçi mi (±60 ms), uzun dosyada yavaşlatma telefonda ne kadar sürüyor. Bulgulara göre düzeltilir.
2. **Eski kaydınla karşılaştırma:** Kayıtlar tarihle saklanır; "1 ay önceki ve bugünkü" kayıt yan yana dinlenir, perde
   eğrileri üst üste çizilir, entonasyon ve ses temizliği farkı sayıyla gösterilir. Kayıt altyapısı (Kayıt sekmesi,
   `skills.js` `intonationIssues`) hazır.
3. **Aralıklı tekrar:** Bitirilen derslerin adımları artan aralıklarla (1, 3, 7, 21 gün) günlük plana geri gelir;
   başarısız tekrarda aralık kısalır. `lessons.js` `dailyPlan`'a tekrar kuyruğu eklenir.
4. **Ünite sonu sınavları ve rozetler:** Her ünitenin sonunda karışık adımlardan bir sınav; geçince aşama rozeti
   ("Trakya ve Roman ustası" gibi). Haftalık özet ve seri ödülleri. Yol haritasında rozetler görünür.
5. **Daha fazla oyun havası:** Sirto, köçekçe, zeybek, Ağır Roman çeşitleri için etütler; eşlikte usul başına ikinci
   darbuka çalışı ve dolgu (fill) ölçüleri; Roman havasında çarpmalı tekrar alıştırması.
6. **Mağazaya çıkış:** Mağaza ekran görüntüleri, kısa ve uzun açıklama, tanıtım görseli (kodla hazırlanabilir);
   Play Console hesabı, yükleme anahtarı ve kapalı test (proje sahibi). Ayrıntı: [TODO.md](TODO.md).
7. **Süsleme ve perde:** Grupetto (çevirme) süslemesi; serbest çalmada ve taksimde (Seyir) süsleme tanıma; nim perdeler
   için çeyrek ses parmakları (WFG `ocl_qt_1`).
8. **Daha sonra:** Kamerayla duruş ve ağız kontrolü; hoca–öğrenci modu (ödev, kayda yorum); cihazlar arası eşitleme.
   Son ikisi internet ister: önce gizlilik kararı ("uygulama internete bağlanmaz" ilkesi) verilmeli.


2 Ekim 2026 · Asıl doküman: [Claude Docs](https://claude.ai/code/artifact/f9c1b6aa-5fdc-475c-914d-1701a7b8a2b9)

## Dersler — tamamlandı (4 Ekim 2026)

Çalışma bölümüne ilk sekme olarak "Dersler" eklendi: 4 ünitede 21 ders (temeller, register ve klarino, teknik ve
üslup, makamlar), geçme koşullu adımlar, sıralı kilit ve günlük çalışma planı. Ders metinleri ve makam etütleri
uygulama için yazıldı; parmak anlatımları ve makam ezgileri bir hocaya ya da Sol klarnetçiye kontrol ettirilmeli.

Sonraki adım fikirleri: usullü ritim alıştırması (vuruşa göre zamanlama ölçümü), nim perdeler için çeyrek ses
parmakları, gerçek eserlerden kısa bölümler (lisans netleşince).

## Öğrenme özellikleri — tamamlandı (4 Ekim 2026)

Ayrıntılı kapsam ve kabul kriterleri: [Öğrenme Özellikleri Backlog](https://claude.ai/code/artifact/9aff5b8b-6e52-41e3-879b-4a5a2fde6749)

1. Parmak ezberi testi
2. Uzun ton ve entonasyon raporu (nota şeridinde ısı haritası)
3. Makam modu ve dizi alıştırması
4. Usullü metronom
5. Durak sesi (dron)
6. Taklit oyunu
7. Kayıt ve nota dökümü
8. Vibrato ve glissando ölçümü
9. İlerleme ve seri takibi
10. Eser takip modu

Onuncu madde hariç hepsi tasarlandığı gibi yapıldı. Eser takibinde SymbTr yerine makam alıştırmaları ve
kullanıcının kendi yazdığı ezgiler var (lisans sorusu açık kaldığı için). Makam dizileri ve usul vuruşları
çeşni tanımlarından kuruldu; bir hocaya ya da Sol klarnetçiye kontrol ettirilmeli.

## Alternatif parmak pozisyonları — tamamlandı (3 Ekim 2026)

Yazılı Mi3–Mi♭7 aralığında 48 temel parmak ve 76 alternatif eklendi ([ocl_alt_3](https://www.wfg.woodwind.org/clarinet/ocl_alt_3.html) ve [ocl_alt_4](https://www.wfg.woodwind.org/clarinet/ocl_alt_4.html) dahil). Alternatiflerin bir Türk Sol klarnetçisi tarafından gerçek çalgıda kontrol edilmesi hâlâ gerekiyor.

Amaç: her nota için temel parmağın yanında Albert sistemde çalınabilen alternatif parmakları da göstermek.

**Kaynak:** WFG alternatif parmak sayfaları ([chalumeau](https://www.wfg.woodwind.org/clarinet/ocl_alt_1.html), [klarino](https://www.wfg.woodwind.org/clarinet/ocl_alt_2.html)). Yazılı Mi3–Do6 aralığında temel parmaklar dahil yaklaşık 76 parmak var.

**Kapsam:**

- [x] Alternatif parmakları WFG'den derle, her biri için kaynağın açıklamasını (ör. "basit havalandırma parmağı") sakla.
- [x] Yalnızca Oehler'de olan mandalları kullananları ayıkla (ör. sol serçe Sol♯/Si♭, sol Fa ince mandalı); mevcut `keyInfo` kontrolü bunları zaten reddediyor.
- [x] Veri yapısını nota başına parmak listesine çevir; ilk eleman temel parmak kalsın.
- [x] Arayüz: parmak kartında "Temel / Alt. 1 / Alt. 2…" seçimi; çizim ve adım adım talimat seçilene göre güncellensin.
- [x] Her alternatifin yanında ne için kullanıldığı (tril, temiz ses, perde düzeltme) kısa notla yazsın.
- [x] Testler: tüm alternatifler ayrıştırılabiliyor, Albert mandallarıyla çalınabiliyor ve şemada çiziliyor.

**Kabul kriterleri:** Alternatifi olan her notada seçim görünür; temel parmak varsayılan kalır; listedeki her parmak WFG ile birebir aynıdır.

**Doğrulama:** Alternatifler WFG'nin Oehler/Albert ortak tablosundan geliyor. Bir Türk Sol klarnetçisinin gerçek çalgı üzerinde kontrol etmesi gerekir.

**Sonraki adım fikri:** WFG'nin [çeyrek ses sayfası](https://www.wfg.woodwind.org/clarinet/ocl_qt_1.html) nim perdeler için parmak önerileri içeriyor; AEU koma perdeleriyle eşleştirilebilir.
