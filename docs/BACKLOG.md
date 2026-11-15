# Sol Klarnet — Backlog

Kodla bitmeyen işlerin güncel listesi: [DENEME-LISTESI.md](DENEME-LISTESI.md) (telefonda ve klarnetle denenecekler).

## Sıfırdan ileriye müfredat denetimi ve içerik PBI'ları (15 Kasım 2026)

Proje sahibi (15 Kasım): "İçeriği artır, eksik her şeyi çıkar, uygulanabilecek ayrıntıda PBI yaz. Hoca test etmeyecek.
Uygulama hiçbir şey bilmeyen birini sıfırdan ileri seviyeye götürmeli." Bu bölüm o denetimin sonucu. Yalnız **içerik
ve öğrenme yolu**; arayüz işleri (U grubu) ve teknik işler aşağıdaki bölümlerde duruyor.

**Bakılanlar:** `lessons.js` (89 ders, 9 ünite, sınavlar, kapılar), `repertoire.js` (28 etüt), `learn.js` (20 makam,
19 usul), `teori.js` (8 konu), `sorunlar.js` (19 sorun), `roadmap.js` (6 aşama, 21 kilometre taşı), `reading.js`
(deşifre, dikte, aralık), `videos.js` (122 video, 46 derse bağlı), `core.js` (parmak verisi yazılı 52–99), `notalar/`
(3037 eser). **Bakılamayanlar:** ders metinlerinin tek tek müzikal doğruluğu ve mikrofonlu adımların gerçek klarnetle
davranışı. Aşağıdaki eşik ve tempo değerleri var olan benzer derslerden alındı; gerçek çalgıyla ölçülmedi.

### Bugünkü müfredat (envanter)

| Ünite | Ders | Etüt | Öğrettiği | Denetim notu |
|---|---|---|---|---|
| Başlarken | 14 | 0 | Montaj, kamış, duruş, eller, ağızlık, ilk ses, uzun ses, dil, ilk geçiş, nefes, nota okuma, hece, ritim, usule giriş | En dolu ünite. Okuma tek ders, 6 nota |
| Temeller | 5 | 2 | Pes bölgenin 19 notası (Mi3–Si♭4) | **Çok dik:** ders başına 3–7 yeni nota, toplam 2 ezgi |
| Register ve klarino | 2 | 1 | Si4–Do6, 14 nota | **En dik yer:** ikinci ders tek seferde 11 nota |
| Teknik ve üslup | 13 | 1 | Uzun ton, glissando, vibrato, kırılma, dil, dinamik, ton, usul ×2, kulak, deşifre, dikte, aralık | Dil vuruşu yalnız ritim ölçüyor (kesik/bağlı ayrımı yok) |
| Hız ve teknik | 7 | 1 | Dizi, arpej, üçlü, onaltılık, makam dizisi hızda | Kromatik dizi ve iki oktav yok |
| Süsleme | 8 | 2 | Çarpma, mordan, tril, grupetto, kayış, düşüş | Yeterli |
| Makamlar | 21 | 9 | 19 makam + "makam bulma" | 10 makam dersinin etüdü yok; geçki, şed, form yok |
| Trakya ve Roman | 11 | 11 | Kasap, karşılama, roman, çiftetelli, rumeli, sirto, köçekçe, zeybek, Nikriz | Yeterli; başka yöre yok |
| İleri | 9 | 1 | Taksim ×5, kulak, iç tempo, deşifre, dikte | Altissimo, saz eseri icrası, geçkili taksim, repertuvar yok |

Araç olarak var, ders yoluna bağlı olmayanlar: nota arşivi (3037 eser; "kolaydan zora" sıralama ve üç seviye var ama
hiçbir ders arşivden eser çaldırmıyor, `piece` adımı yalnız `ETUDES`'i tanıyor), Teori sayfası (8 konu ve alıştırmaları;
derslerde `read` adımı "Onay" ile geçiliyor, bilgi ölçülmüyor), Kulaktan çıkar, Eşlik, Çevir.

### Bulgular: sıfırdan ileriye yolda eksikler

| # | Eksik | Kanıt | PBI |
|---|---|---|---|
| E1 | **İlk 3 ayda çalacak ezgi yok.** Hiç bilmeyen biri nota öğreniyor ama müzik çalmıyor | İlk 21 derste 3 etüt (`e-sol-el`, `e-iki-el`, `e-register`) | S1.1, S1.6 |
| E2 | **Temeller çok hızlı.** "Pes bölge" dersi 7 notayı, 5 diyez/bemolü "birer kez tanıtıp" geçiyor | `pes`: notes 53, 52, 58, 54, 56, 61, 63 | S1.1, S1.2 |
| E3 | **Klarino iki ders.** Si4–Re5 bir ders, Mi5–Do6 ve 5 arızalı nota tek ders. Kırılma çalışması (`register-gecisi`) bundan sonra, Teknik'te geliyor | `klarino`: 11 nota | S2.1 |
| E4 | **Altissimo hiç öğretilmiyor.** Parmak verisi 99'a kadar var, dersler 84'te (Do6) bitiyor | `LEVELS.altissimo` 85–99; `LESSONS` en tiz 84 | S2.4 |
| E5 | **Nota okuma tek ders.** Sus, nokta, bağ, donanım, arıza kuralı, tekrar işaretleri (dolap, senyo, D.C., Fine), ek çizgiler, tempo ve nüans terimleri ders olarak yok; arşivden eser açan kullanıcı bunları görüyor | `nota-okuma`: 1 okuma + 6 notalık test | S1.4 |
| E6 | **Bilgi ölçülmüyor.** 16 `read` adımı onayla geçiliyor; Teori sayfasının soruları derse bağlı değil | `lessons.js` adım türleri | S0.2 |
| E7 | **Kesik, bağlı, aksan yok.** Artikülasyon dersi dört ritim kalıbı; notanın uzunluğu ölçülmüyor | `artikulasyon`: 4 × `rhythm` | S2.2 |
| E8 | **Dizi ve arpej programı eksik.** Kromatik dizi, iki oktav makam dizisi, aksak usulde gruplar yok | `techPattern` türleri: scale, arp, groups, thirds, break | S2.3 |
| E9 | **10 makam dersinin etüdü yok.** Bayâtî, Karcığar, Hümâyun, Uzzâl, Zirgüleli Hicaz, Sûzinak, Hicazkâr, Kürdîli Hicazkâr, Mâhur, Acemaşîran dersleri dizi ve taklitle bitiyor | Ders adımları | S3.1 |
| E10 | **Arşivde sık, uygulamada olmayan makamlar.** Muhayyer 78 eser, Bûselik 73, Muhayyer Kürdî 50, Acemkürdî 46, Neveser 42, Evç 37, Sûzidil 37, Tâhir 35, Gerdâniye 32, Nişâburek 32, Şehnaz 32, Yegâh 30, Sultânîyegâh 29 (toplam 553 eser, arşivin %18'i) | `notalar/` dosya adları | S3.2 |
| E11 | **Makam dersi sığ.** Her makam tek ders: dizi, 1 ezgi, taklit. Karar kalıpları, çeşni çalışması, o makamda gerçek eser, benzer makamdan ayırma ve taksim aynı derste değil | Makam ders kalıbı | S3.3 |
| E12 | **Geçki öğretilmiyor.** Bütün derslerde sözcük bir kez geçiyor; eserlerin çoğu geçkili | `lessons.js` "geçki": 1 | S3.4 |
| E13 | **Şed (göçürme) ve ahenk yok.** Makam hep kendi yerinden çalınıyor; solistle çalan klarnetçi makamı başka perdeden çalar | Ders yok; Teori'de yalnız transpozisyon | S3.5 |
| E14 | **Form bilgisi yok.** Arşiv: şarkı 1527, türkü 356, saz semâîsi 122, peşrev 118, aranağme 77, beste 63, ilâhi 63; kullanıcı hane, teslim, meyan, aranağme nedir bilmeden açıyor | Teori 8 konu, form yok | S3.6 |
| E15 | **Veride olup dersi olmayan usuller.** Ağır Aksak ile 11 Kasım'da eklenen Nîm-sofyan, Sengin Semâî, Devr-i Hindî, Müsemmen hiçbir derste yok. Aksak Semâî 177 eserle veride de yok (B1) | `USULS` 19, derslerde 14 | S3.7 |
| E16 | **Dereceli repertuvar yok.** Öğrenci "sıradaki eserim ne" sorusuna cevap bulamıyor | Arşiv ders yoluna bağlı değil | S0.3, S4.1 |
| E17 | **Tek yöre: Trakya.** Türkü (356 eser), Ege zeybekleri (19), Rumeli türküleri (16) için ders yok; zeybek tek ders | `trakya` ünitesi | S4.2 |
| E18 | **Fasıl ve eşlik pratiği yok.** Aranağme, şarkıya giriş, söz arasını doldurma, solistin perdesine uyma | Ders yok; 77 aranağme arşivde | S4.3 |
| E19 | **Saz eseri icrası yok.** İleri ünite taksimle bitiyor; peşrev, saz semâîsi, longa çalınmıyor | `ileri`: 9 ders | S4.4 |
| E20 | **Taksim beş derste kalıyor.** Geçkili taksim, usullü (eşlik üstünde) taksim, meyan ve tiz bölge, uzun taksim planı yok | `taksim-*` | S4.5 |
| E21 | **Kulaktan çalma yolu yok.** `mimic` yalnız makam derslerinde tek adım; Kulaktan çıkar aracı derse bağlı değil | Ders adımları | S4.6 |
| E22 | **Ezber ve icra hazırlığı yok.** Notasız çalma, kendini kaydedip değerlendirme, bir eseri baştan sona hazırlama | `piece` modları: tempo, free | S4.7 |
| E23 | **Çalışma yöntemi öğretilmiyor.** Yavaş çalışma, parçalara bölme, ısınma sırası, günlük süre; hocasız öğrenci için en kritik bilgi | Ders yok | S1.5 |
| E24 | **Çalgıyı akortlama ve bakım dersi yok.** Bakım tek okuma adımı; barili çekme, ısınınca tizleşme, kamış döndürme yalnız Sorunlar'da | `klarneti-tani` 3. adım | S1.5 |
| E25 | **Nefes ileri kademesi yok.** Uzun cümle planı, nefes yeri işaretleme, sürekli nefes | `nefes-cumle` tek ders | S2.5 |
| E26 | **Terimler sözlüğü yok.** Dersler çeşni, yeden, asma karar, teslim, velvele gibi 100'e yakın terim kullanıyor | Sözlük sayfası yok | S5.4 |
| E27 | **Yol haritası ve sınama yeni içeriği bilmiyor.** Taş, sınav ve seviye sınaması 89 derse göre kurulu | `roadmap.js`, `onboard.js` | S5.1–S5.3 |
| E28 | **Bitiş yok.** Son dersten sonra "ileri seviye oldun" diyen ölçülü bir bitirme yok | `ileri` sınavı karışık adımlar | S5.5 |

### Hedef müfredat

Bugün 89 ders, 28 etüt, 20 makam. Hedef **≈ 170 ders, ≈ 75 etüt, 33 makam, 60 dereceli eser**. Süreler günde 30 dk
çalışmaya göre kaba tahmin (`roadmapPace` ders başına ≈ 3 gün sayıyor).

| Aşama | Süre | Bugün | Hedef | Bitince öğrenci ne yapabilir |
|---|---|---|---|---|
| 1 Başlangıç | 0–4 ay | 19 ders | 34 | Pes bölgede 19 notayı okur, 10 kısa ezgi ve arşivden 5 kolay eser çalar, 4 usulü vurur |
| 2 Temel çalgıcı | 4–9 ay | 15 ders | 30 | Mi3–Do6 arası çalar, kırılmayı temiz geçer, kesik ve bağlı çalar, 10 eser |
| 3 Orta | 9–15 ay | 15 ders | 22 | ♩=100 onaltılık, süslemeler, kromatik dizi, iki oktav diziler |
| 4 Makam | 15–27 ay | 21 ders | 48 | 33 makamda dizi, karar, etüt ve eser; geçki ve şed; form bilgisi; 20 eser |
| 5 Yöreler ve fasıl | 21–30 ay | 11 ders | 24 | Trakya, türkü ve zeybek; aranağme ve şarkı eşliği |
| 6 İleri | 27–36 ay+ | 9 ders | 20 | Altissimo, saz eserleri, geçkili ve usullü taksim, ezberden icra, bitirme sınavı |

### Bütün PBI'lar için ortak kurallar

1. **Var olan ders kimliği ve adım sırası değişmez.** İlerleme `lesson.prog` kaydında adım indeksine bağlı. Yeni
   içerik yeni ders kimliğiyle gelir; var olan derse adım yalnız **sona** eklenir (eklenince o ders eski kullanıcıda
   "bitmemiş" görünür, bu yüzden tercih yeni ders).
2. **Araya ders girince eski kullanıcı kilitlenmesin:** S0.1 göçü olmadan Temeller ve Klarino'ya ders eklenmez
   (`unlocked()` içindeki `base()` bu iki ünitenin bütün derslerini ister).
3. **Her metin iki dilde** (`{ tr, en }`); makam ve perde adları iki dilde Türkçe kalır.
4. **Müzikal bilgi uydurulmaz.** Dizi, durak, güçlü, yeden, seyir TDV İslâm Ansiklopedisi maddesinden alınır ve
   `KAYNAKLAR.md`'ye yazılır; kaynakların ayrıştığı yerde ders iki görüşü de söyler. Doğrulanmayan kalıp, parmak ya da
   tavır bilgisi eklenmez; "hocaya sor" ya da "uzman görmeli" notu yazılmaz (hoca yok).
5. **Etütler özgün yazılır** (telif yok), `repertoire.js` `ETUDES` biçiminde; makam etütleri perde adlarıyla, başlangıç
   etütleri nota adlarıyla. Her makam etüdü seyri izler: giriş bölgesi, güçlüde yarım karar, durakta tam karar; yalnız
   `MAKAMS[x].asc/desc` perdeleri. Yazıldıktan sonra `barCheck` ve `rangeIssues` ile denetlenir.
6. **Yeni ders eklenince dokunulacak yerler:** `lessons.js` (`LESSONS`, gerekiyorsa `EXAMS`, `GATE_AFTER`,
   `unlocked`), `roadmap.js` (`RM_STAGES` ünite listesi ve taşlar), `onboard.js` (sınamanın bitmiş saydığı dersler),
   `premium.js` (`units`), `videos.js` (`LESSON_VIDEOS`), `sorunlar.js` ve `search.js` bağlantıları, `sw.js` önbellek
   sürümü, `README.md` ders sayısı.
7. **Doğrulama (test yok):** S0.4 denetim betiği temiz çıkar; tarayıcıda 375 px genişlikte yeni dersler açılır, her
   adım türü bir kez başlatılır, konsolda hata yok; rehberli modda sıfır kullanıcı ve eski kullanıcı (bütün dersleri
   bitmiş kayıt) ile hoca kartı çıkmaza girmez.

Büyüklük: K ≈ yarım gün, O ≈ 1–2 gün, B ≈ 3 gün ve üstü.

### S0 — Altyapı (önce bunlar; ≈ 1 hafta)

- [x] **S0.1 Müfredat sürümü ve göç** (O). **Yapıldı (15 Kasım 2026).** *Neden:* Temeller ve Klarino'ya ders eklenince `base()` yanlış olur,
  bütün dersleri bitirmiş kullanıcıda Teknik, Hız, Süsleme ve Makam yeniden kilitlenir.
  *Yapılacak:* `lessons.js`'e `CURRICULUM_VER` (şimdi 2) ve yeni derslere `since: 2` alanı. Uygulama açılışında
  `lesson.ver` kaydı `CURRICULUM_VER`'den küçükse bir kez çalışan `migrateCurriculum(prog)`: `since` değeri kullanıcının
  sürümünden büyük her ders için, **aynı ünitede ondan sonra gelen bir ders bitmişse ya da o ünitenin sınavı geçilmişse**
  dersi `placed` olarak işaretle (seviye sınamasının kullandığı kayıt biçimi; `onboard.js` `finish`). Sonra
  `lesson.ver` yazılır. `placed` ders listede "✓ (sınamayla)" görünür, kullanıcı isterse çalar; aralıklı tekrara
  girmez (`srsSync` zaten çalınmamış dersi almıyor).
  *Kabul:* (a) 89 dersi bitmiş kayıtla açınca hiçbir ünite kilitlenmez, hoca kartı yeni dersleri "istersen" diye
  önerir; (b) Temeller'in ortasındaki kullanıcıda yalnız geride kalan yeni dersler `placed`, öndekiler sırada;
  (c) sıfır kullanıcıda hiçbir şey `placed` değil; (d) göç ikinci açılışta çalışmaz; (e) yedekten eski kayıt geri
  yüklenince göç yeniden çalışır.
  *Uygulanan:* `lessons.js` `CURRICULUM_VER = 2`, `migrateCurriculum(prog, seen, day)`, `placeLesson`; açılışta
  `practice.js` çalıştırır. **Sürüme değil kimliğe bağlı (S1.1'de düzeltildi):** `lesson.migIds` değerlendirilmiş
  `since`'li derslerin listesi; listede olmayan her yeni ders bir kez değerlendirilir. Sürüm numarası yetmiyordu: S0.1'i
  açan kullanıcıda `lesson.ver` 2 olmuştu ve aynı sürüme sonradan eklenen dersler hiç göçe girmiyordu. Yedekten dönen
  eski kayıtta liste eski ya da yok, göç yeniden çalışır. Seviye sınaması da sonunda göçü çalıştırır (`onboard.js`):
  sınamanın bitmiş saydığı derslerin arasına giren dersler "istersen" geçilir, önceki sınamadan kalan böyle kayıtlar
  önce silinir. "Ötesine geçti" ölçütü dörtlü: aynı ünitede sonraki ders bitmiş, dizide hemen sonraki ders bitmiş,
  ünite sınavı geçilmiş ya da `GATE_AFTER` zincirinde sonra gelen bir ünitede ders bitmiş (ünitenin sonuna eklenen ders
  sınavsız ilerleyen kullanıcıyı da kilitlemesin). Göçle geçilen ders `placed` ve `mig` işaretlenir. **Düzeltme:**
  `srsSync` `placed` dersleri de tekrara alıyordu (sınamayla geçilenler bilerek); göç dersleri `mig` ile dışarıda
  kalır, ders gerçekten bir adımı geçince `mig` silinir ve tekrara girer. Listede "✓ yeni · istersen", hoca kartında
  açılmamış ilk göç dersi için "istersen çal" notu (`lesson.migSeen`). **Sınavlar dondu:** `makeExam` yalnız `since`
  alanı olmayan derslerden kurulur; yoksa ünitelere ders eklenince sınav adımları kayar ve geçilmiş sınav geçilmemiş
  görünürdü. Yeni adımlar sınava S5.3'te elle eklenir. Node'da sahte `since:2` derslerle (a)–(d) denendi.
- [x] **S0.2 Adım türü: `soru`** (O, E6). **Yapıldı (15 Kasım 2026).** `{ type:"soru", q:{tr,en}, opts:[{tr,en}…], ok:<indeks>, why:{tr,en} }`;
  bir adımda `items:[…]` ile 3–6 soru, `min` doğru sayısı. Seçenekler karıştırılır, yanlışta `why` gösterilir ve soru
  tur sonunda yeniden gelir. Mikrofonsuz. `lessonview.js`'te `hece` adımının "quiz" kipindeki arayüz yeniden
  kullanılır; `stepOk`/`recordStep` puanı doğru sayısı. *Uygulanan:* `trainers.js` `TRAINER_STEPS.soru`; puan ilk
  denemede doğru bilinen soru sayısı, yanlış bilinen soru doğru bilinene kadar turun sonunda yeniden gelir. `min`
  verilmezse tek soruda 1, çok soruda %70 (yuvarlanır). `staff` tek dörtlükse `drawStaffInto`, değilse `drawScore`
  (`{ w, d }` nesneleri de alır, `meter` isteğe bağlı). Tarayıcıda 375 px'te denendi; henüz hiçbir ders kullanmıyor. İsteğe bağlı `staff:[midi…]` alanı soruda dizek çizer
  (`chartsheet.js`), `fing:<midi>` parmak kartı gösterir.
  *Kabul:* derste ve ünite sınavında çalışır; `reviewStep` bu adımı tekrara alabilir; ekran okuyucuda seçenekler
  düğme olarak okunur. Var olan `read` adımlarına dokunulmaz; yeni derslerde her `read`'in ardından bir `soru` gelir.
- [x] **S0.3 `piece` adımı arşiv eserini çalsın; "eser dersi" kalıbı** (B, E16). **Yapıldı (15 Kasım 2026).** Bugün `piece.id` yalnız `etudeById`.
  *Yapılacak:* `{ type:"piece", arsiv:"<notalar kimliği>", from?, to?, tempoPct?, mode, min }`. `from`/`to` ölçü
  numarası (1 tabanlı, dahil); `tempoPct` eserin kendi temposunun yüzdesi (60, 80, 100). Eser `notalar/<id>.json`'dan
  yüklenir (`archive.js` yükleyicisi; çevrimdışı için ders listesindeki eserler `sw.js` ön belleğine eklenir),
  `expandRepeats` uygulanmış hâli ölçülere bölünür (`barsAt`). Değerlendirme `alignPerformance` ile, etütle aynı.
  Yardımcı `eserSteps(id, parts, o)` (`techSteps` gibi): bir eser için sırayla `listen` (bölüm) → `piece` bölüm
  `tempoPct:60, mode:"free"` → sonraki bölüm … → `piece` tamamı `tempoPct:80, mode:"tempo"` → tamamı `100`.
  *Kabul:* 3 örnek eserle (kısa bir türkü, bir şarkı, bir saz semâîsi) ders açılır; bölüm döngüsü doğru ölçülerde
  başlar ve biter; tekrar işaretli eserde bölüm sınırı kaymaz; internet yokken ders açılır; eser arşivden kalkarsa
  ders "eser bulunamadı" der ve geçilebilir olur (çıkmaz yok).
  *Uygulanan:* `archive.js` `archSlice` (ölçüler eser sayfasıyla aynı `archMeasures` ile; `barsAt` değil) ve
  `archLessonPiece`; `pieces.js` `archivePieceStep` (`piece` adımında `arsiv` varsa; `listen` adımı `arsiv` ile aynı
  yükleyiciyi dinleme kipinde kullanır ve çalınınca biter). Adımda `name` zorunlu (başlık, dizin yüklenmeden yazılsın).
  `lessons.js` `eserSteps(arsiv, name, parts, o)`: her bölüm `listen` + %60 serbest takip, sonra tamamı %80 (`min:70`)
  ve %100 (`min:75`); bölüm verilmezse önce tamamı dinlenir. Adım üstünde eser künyesi (ölçü aralığı, tempo, bestekâr,
  form, usul) ve "Eseri arşivde aç". Eser açılamazsa "Adımı geç" (kayıtta `skip`). **Tekrar işaretleri:** arşivdeki
  SymbTr notaları tekrarları açılmış hâldedir, ölçü numarası çalınış sırasınındır; bölüm sınırı bu yüzden kaymaz.
  **Çevrimdışı istenmiyor** (proje sahibi, 15 Kasım: "internetsiz çalışmasın, öyle bir özelliğe gerek yok"): kabul
  ölçütündeki "internet yokken ders açılır" düşürüldü, ders eserleri için eklenen önbellek listesi kaldırıldı.
  Ardından sahibinin onayıyla web sürümünün bütün çevrimdışı önbelleği kaldırıldı: `app.js` service worker kaydetmez,
  eski kaydı ve `sol-klarnet*` önbelleklerini siler; `sw.js` yalnız eski kurulumları temizleyen bir dosyaya döndü
  (önbellekleri siler, kaydını kaldırır; fetch dinleyicisi yok). Tarayıcıda iki yol da denendi. Android ve iOS
  paketleri dosyaları zaten içinde taşır, onlar değişmedi.
  `npm run mufredat` ölçü aralığının eserin içinde kaldığını denetler. Tarayıcıda üç eserle (anonim türkü, şarkı, saz
  semâîsi) ve olmayan bir eserle denendi; çalma adımları mikrofon engelli olduğu için panelde başlatılamadı, dinleme
  adımları ve "Adımı geç" çalıştı. **S1.6 için not:** dosya adındaki bestekâr ile dizindeki (`b`) ayrışabiliyor (ör.
  `saba--sarki--sofyan--asikina_eylemez--numan_aga` dizinde Yesârî Âsım Arsoy); telif süzgeci dizindeki `b` alanına
  bakmalı.
- [x] **S0.4 Müfredat denetim betiği** (K). **Yapıldı (15 Kasım 2026).** `scripts/mufredat-check.js` (`npm run mufredat`), ölçüm betiği; test
  değil. Denetler: ders kimlikleri tekil; her `piece.id` `ETUDES`'te, her `piece.arsiv` `notalar/`'da var; her
  `makam`, `usul`, `pattern` kimliği veride var; her etüt yalnız o derse kadar öğretilmiş notaları kullanıyor
  (`knownNotes`); makam etütleri yalnız makamın perdelerini kullanıyor; her metinde `tr` ve `en` dolu; her ünitede
  sınav var; `RM_STAGES` bütün üniteleri kapsıyor; `GATE_AFTER` döngüsüz. Çıktı: ünite başına ders, etüt, yeni nota
  sayısı tablosu (bu bölümdeki envanterin güncel hâli).
  *Uygulanan:* ek olarak etüt ölçüleri (`barCheck`), ritim ve hız kalıpları, `ear` havuzundaki makamlar, `since`
  değeri ve `soru` cevap indeksi denetlenir. "Yalnız öğretilmiş nota" makamsız etütlere uygulanır; makam etüdünde
  ölçüt makamın perdeleri (mod 53). Bugünkü çıktı: 90 ders, 28 etüt, 9 sınav, hata yok. Sahte hatalarla denendi.

### S1 — Sıfırdan ilk eserlere (Başlangıç aşaması; ≈ 2 hafta)

- [x] **S1.1 Temeller'e ezgi ve pekiştirme dersleri** (B, E1, E2). **Yapıldı (15 Kasım 2026).** Var olan beş dersin arasına, hepsi `unit:"temel"`,
  `since:2`. Kalıp: `listen` → `notes` (yeni geçişler, `maxMiss:3`) → `piece` ×2 (`mode:"free"` sonra `"tempo"`,
  `min:70`) → `quiz` (`mode:"staff"`, o ana kadarki notalar, `n:8, min:6`).

  | Yeni ders | Yeri | Notalar (yazılı) | Yeni etütler |
  |---|---|---|---|
  | `ezgi-sol-el` "Sol elle iki ezgi" | `sol-el-2`'den sonra | Do4–Sol4 (60, 62, 64, 65, 66, 67) | `e-t1`, `e-t2` |
  | `ezgi-iki-el` "İki elle üç ezgi" | `sag-el`'den sonra | Sol3–Sol4 | `e-t3`, `e-t4`, `e-t5` (biri 3/4) |
  | `ezgi-pes` "Pes bölge ezgileri" | `pes`'ten sonra | Mi3–Sol4 | `e-t6`, `e-t7` |
  | `ezgi-bogaz` "Boğaz notalarıyla ezgi" | `bogaz`'dan sonra | Mi3–Si♭4 | `e-t8`, `e-t9` (biri 2/4) |
  | `temel-tekrar` "Pes bölge: toparlama" | ünitenin sonu | hepsi | `e-t10` (16 ölçü) |

  Etüt kuralları: 8 ölçü, tempo 66–80, `level:1`, yalnız dörtlük, ikilik, birlik ve (e-t5'ten sonra) sekizlik;
  en çok üçlü atlama, e-t8'den sonra bir dörtlü; her etüt Sol4, Re4 ya da Sol3'te biter. Ders metni 2 paragraf:
  hangi geçiş zor, nasıl çalışılır (yavaş, iki notayı ayırıp tekrar).
  *Kabul:* S0.4 "yalnız öğretilmiş nota" denetimi geçer; Temeller sınavına (`sinav-temel`) `e-t10` adımı eklenmez
  (sınav adım sırası korunur), yerine S5.3'te ele alınır.
  *Uygulanan:* `lessons.js` "S1.1 Temeller ezgileri" bloğu (`insertLessonAfter`, ortak kalıp `ezgiSteps`), etütler
  `repertoire.js` `e-t1`…`e-t10`. Kurallar betikle ölçüldü (ölçü, aralık, en çok üçlü atlama, e-t8'den sonra tek
  dörtlü, bitiş notası); sekizlik e-t6'dan başlıyor, e-t5'te noktalı ikilik (3/4) var. `ezgi-pes`, S1.2'nin
  `ariza-*` dersleri varsa onların arkasına girer. Üç etütlü `ezgi-iki-el`'de yalnız ilk etüt serbest takiple, diğer
  ikisi yalnız tempoda (adım sayısı makul kalsın). Sınama bu dersleri bitmiş saymaz, göçle "istersen" yapar (S5.2'nin
  ezgi kısmı böylece karşılandı). Mikrofonlu adımlar tarayıcı panelinde çalıştırılamadı (mikrofon engelli); notaların
  çizimi, ders sırası, kilit ve göç tarayıcıda denendi. README ders sayısı dalga sonunda güncellenecek.
- [x] **S1.2 Arızalı notalar iki derse yayılsın** (O, E2). **Yapıldı (15 Kasım 2026).** `pes` dersi kalır (kimlik ve adımlar aynı). Yeni:
  `ariza-1` "Fa♯3, Sol♯3, Si♭3" (54, 56, 58) ve `ariza-2` "Do♯4, Mi♭4 ve kromatik dizi" (61, 63; sonra 52'den 67'ye
  kromatik `notes`, `maxMiss:4`). Her derste: `read` (hangi mandal; metin `describeFingering` çıktısından üretilir,
  elle parmak tarifi yazılmaz) → `soru` (parmak kartından nota bul, 4 soru) → `hold` her yeni nota 4 sn `min:45` →
  `notes` komşularıyla geçiş → `quiz` `mode:"play"`. `ariza-2`'de serçe parmağın mandaldan mandala kayması için ayrı
  `notes` adımı (Mi3–Fa3–Fa♯3–Sol♯3 ileri geri). Yer: `pes`'ten sonra, `ezgi-pes`'ten önce.
  *Uygulanan:* `lessons.js` `// ---- S1.2 Arızalı notalar ----` bloğu, `insertLessonAfter("pes", ariza1, ariza2)`.
  `read` adımına isteğe bağlı `fing:[yazılı nota…]` alanı eklendi (`trainers.js`): her nota için küçük parmak şeması ve
  `describeFingering` tarifi çalışma anında çizilir, İngilizcesi sayfa çevirmeninden gelir; ders metni parmak tarif
  etmez. `soru` sorularının seçenekleri `noteName`'den (doğru nota ve üç komşusu), 4 soru, `min:3`; `ariza-2` sorularından
  ikisi `ariza-1` notalarını tekrar eder. `hold` 4 sn `min:45`, geçişler `maxMiss:3`, kromatik 52→67 `maxMiss:4`, serçe
  kayması 52–53–54–56 ileri geri, `quiz` `mode:"play"` `n:10, min:7`. Seviye sınamasında iki ders "Pes ve orta ses"
  grubuna eklendi (`onboard.js`). **Not:** o grup yalnız 52'yi çaldırıyor, arızalı notaları (54–63) hiç yoklamıyor;
  `pes` dersi için de durum aynıydı. Sınamaya bir arızalı nota (ör. 56 ya da 61) eklenmesi S5'teki sınama
  genişletmesinde ele alınmalı. **Düzeltme:** `hold` başlığı perdesi olmayan notada (Fa♯3) "· null" yazıyordu
  (`lessonview.js`); perde adı artık yalnız varsa gösterilir. Tarayıcıda 375 px'te iki dilde denendi. `README.md` ders sayısına dokunulmadı (zaten eskiydi; S1.1 ile birlikte düzeltilmeli).
- [ ] **S1.3 İlk diziler** (K). `dizi-ilk` "İlk diziler: Sol ve Do" Temeller'in sonunda, `temel-tekrar`'dan önce:
  `techSteps({ type:"scale", base:55, mode:"major", sub:1 }, 50, 66)`, aynısı `base:60` ve `{ base:57, mode:"minor" }`.
  Metin: dizi nedir, neden her gün; Türk müziğinde karşılığı (Do majör dizisi Çargâh, Sol'den majör Mâhur'a yakın;
  "yakın" sözü kalır, eşitlik iddia edilmez). Önce `techPattern`'in `sub:1` (dörtlük) desteklediğine bakılır,
  desteklemiyorsa eklenir.
- [x] **S1.4 Nota okuma 2–5** (B, E5). **Yapıldı (15 Kasım 2026).** Dört yeni ders, `unit:"baslangic"` yerine **Temeller**'e dağıtılır (okuma,
  çalınan notayla birlikte ilerlesin):

  | Ders | Yeri | İçerik | Adımlar |
  |---|---|---|---|
  | `okuma-2` "Süreler: sus, nokta, bağ" | `ezgi-sol-el`'den önce | Dörtlük, ikilik, birlik, sekizlik susları; noktalı nota; uzatma bağı ile ifade bağının farkı | `read`, `soru` ×5 (dizekte süre say), `hece` `lv:2` vur, `rhythm` noktalı kalıp |
  | `okuma-3` "Diyez, bemol, natürel ve donanım" | `ariza-1`'den önce | Arıza ölçü boyunca geçerlidir; donanım; natürel; Türk müziği işaretleri (koma, bakiye, küçük ve büyük mücenneb: `aeu-accidentals` kuralı, ♯ = +4, ♭ = −5, çizgili ♭ = −4) | `read` ×2, `soru` ×6 (`staff` alanıyla), `quiz` `mode:"staff"` arızalı notalar |
  | `okuma-4` "Yol işaretleri" | `ezgi-pes`'ten sonra | Tekrar çizgileri, 1. ve 2. dolap, senyo, D.C., D.S., Fine, koda; "bu eser hangi sırayla çalınır" | `read`, `soru` ×5 (ölçü sırası), `piece` `e-t7b` (dolaplı özgün 8 ölçü) |
  | `okuma-5` "Ek çizgiler, tempo ve nüans" | `temel-tekrar`'dan önce | Mi3–Si3 ek çizgileri; ♩=, ağır/yürük terimleri; p, f, cresc., nefes işareti | `read`, `quiz` `mode:"staff"` 52–60, `soru` ×4, `sight` seviye 1 |

  `okuma-4` için `expandRepeats`'in dolap desteği var; etüt metin biçiminin tekrar işaretini nasıl yazdığına
  `parseScoreText`'ten bakılır. Teori sayfasının "Dizek" ve "Nota değerleri" konuları bu derslere bağlantı verir.
  *Uygulanan:* `lessons.js` "S1.4 Nota okuma 2–5" bloğu; sıra `sol-el-2 → okuma-2 → ezgi-sol-el`, `pes → okuma-3 →
  ariza-1`, `ezgi-pes → okuma-4 → bogaz`, `akortlama → okuma-5 → temel-tekrar`. **Backlog'daki varsayım yanlıştı:**
  `expandRepeats`'te dolap yoktu, etüt metni tekrar işareti yazamıyordu, nota çizimi de işaret çizmiyordu (yalnız
  Çevir aracı işaretleri tutuyordu). Eklenenler: etüt metninde yol işareti sözcükleri (`|:` `:|` `[1` `[2` `%` `D.S.`
  `D.C.` `Fine`, `repertoire.js` `MARK_TOKENS`), `expandRepeats`'e dolap, D.C. ve Fine (D.C./D.S. dönüşünde tekrar
  yapılmaz, birinci dolap atlanır), `drawScore`'a `signs` (tekrar çizgileri, dolap köşeleri, senyo, D.C., D.S., Fine),
  `soru` adımına `score` alanı. `e-t7b` dolaplı etüt; çalınırken açılmış sırasıyla gösterilir (`etudePlayed`), işaretli
  hâli soru adımında. Yol işareti sorularının doğru seçeneği elle değil `expandRepeats`'le üretilir. Koda (⊕) yalnız
  metinde anlatılıyor, çizilmiyor ve açılmıyor. Teori: "Dizek" → okuma-5, okuma-4; "Nota değerleri" → okuma-2; "Aralıklar
  ve koma" → okuma-3. Seviye sınaması bu dersleri şimdilik göçle "istersen" geçer; ayrı ayrı sayılması S5.2'de.
  **Denetime eklendi:** ders verisi tarayıcıdaki `index.html` sırasıyla da yüklenir (`vm`); ilk yazımda yol işareti
  soruları `repertoire.js`'i yüklenmeden çağırıyordu, Node'da çalışıp tarayıcıda bütün uygulamayı durduruyordu.
- [x] **S1.5 Hocasız öğrenci dersleri: çalışma yöntemi, ısınma, akort, bakım** (O, E23, E24). **Yapıldı (15 Kasım 2026).** Dördü de kısa,
  ağırlıkla `read` + `soru`:
  - `nasil-calisilir` (Başlarken, `ilk-gecis`'ten sonra): yavaş çalış, zor yeri iki notaya indir, 5 temiz tekrar
    kuralı, 20–30 dk günlük, yorulunca bırak (dudak), kayıt dinle. Adım: `read`, `soru` ×4, bir `notes` adımı iki
    kez (önce serbest, sonra "yarı hızda" metniyle).
  - `isinma` (Temeller, `sag-el`'den sonra): 5 dakikalık sıra (nefes, açık Sol uzun ton, pes uzun ton, yavaş dizi).
    Adım: `hold` 67 8 sn, `hold` 55 8 sn, `notes` Sol3–Sol4. Günlük çalışmanın ısınma turu bu dersi bitirenlerde bu
    sırayı kullanır (`dailyPlan`).
  - `akortlama` (Temeller sonu): klarnet ısınınca tizleşir, baril çekilir/itilir, hangi notayla akort edilir, A4
    ayarı ve Akort ekranı. Adım: `read`, `hold` 67 6 sn (sapma gösterilir), `soru` ×3. Bilgi `sorunlar.js` "akort"
    maddesiyle aynı dile çekilir, yeni iddia eklenmez.
  - `bakim` (Başlarken sonu): çalış sonrası kurulama, kamış döndürme ve saklama, mantar yağı, mandal yastıkları, ne
    zaman tamirciye. `equip.js` kamış ömrü sayacına bağlantı. Adım: `read` ×2, kontrol listesi (var olan
    `durus-nefes` listesi kalıbı), `soru` ×3.
  *Uygulanan:* `lessons.js` "S1.5 Hocasız öğrenci" bloğu, dördü `since:2`. Sıra: `nasil-calisilir` `ilk-gecis`'ten,
  `bakim` Başlarken'in son dersinden, `isinma` `ezgi-iki-el`'den (yoksa `sag-el`), `akortlama` `temel-tekrar`'dan hemen
  önce. Bilgi `klarneti-tani`, `kamis` dersleri ve `sorunlar.js` "akort", "kamis", "su" maddelerinden; yeni iddia yok.
  `read` adımına `links` (`{ go, el?, label }`: `SK.go` ile ekranı açar, öğeye kaydırır; Akort ekranı, diyapazon,
  Ekipmanım) ve `checkHint` (kontrol listesi notu; varsayılan not oturuşa göre) eklendi; `notes` adımına başlığa giden
  `hint` ("yarı hızda"). `dailyPlan`: `isinma` bitmişse ısınma turu dersin üç adımı, değilse eski tek uzun ton.
  `onboard.js` sınamasının Başlarken döngüsü `since`'li dersleri bitmiş saymaz: göç, arkası bitmiş olanı "istersen"
  yapar (`nasil-calisilir`), arkası boş kalan `bakim` açık kalır. Sorunlar'da "akort" → `akortlama`, "kamis" ve "su" →
  `bakim` bağlantısı. Var olan kontrol listesi notunda ve `klarneti-tani` bakım adımında "hocana göster" sözü duruyor
  (adım metni değişmediği için dokunulmadı).
- [x] **S1.6 İlk eserler basamağı** (O, E1, E16; S0.3 gerekir). **Yapıldı (15 Kasım 2026).** `ilk-eserler-1` ve `ilk-eserler-2` (Temeller sonu),
  her biri arşivden 2–3 eser, `eserSteps` ile. Seçim betikle: `scripts/eser-sec.js` arşivi tarar; ölçüt: yazılı
  aralık 52–70 içinde, en kısa süre onaltılık değil sekizlik, usul Sofyan/Düyek/Nîm-sofyan/Semâî, süre ≤ 90 sn,
  makam Rast/Uşşak/Hüseynî/Nihâvend/Kürdî (koma perdesi olan eserlerde ders metni "Segâh'ı şimdilik Si gibi çal,
  perdesini Makamlar'da öğreneceksin" der). Betik aday listesi basar, kimlikler elle seçilip derse yazılır. Telif:
  yalnız `lisans-besteciler.csv`'de kamu malı görünen ya da anonim eserler.
  *Uygulanan:* `scripts/eser-sec.js` (`npm run eser-sec`; makam, usul, form, aralık, değer, süre, koma ve süs
  ölçütleri parametreli). Telif süzgeci `lisans-disla.csv`, `lisans-belirsiz.csv` ve güfte yazarı bulunamamış
  `lisans-guftesiz.csv` kayıtlarını dışarıda bırakır (dizindeki bestekâra göre, dosya adına değil). **Ölçüt iki yerde
  sapmak zorunda kaldı:** (1) arşivde bu makam ve usullerin hiçbir eseri Si♭4'ün altında kalmıyor (ezgiler Re5–Do6'ya
  çıkıyor); eserler bir oktav pes çalınıyor (adımda `oct:-1`; perde adları pes oktavın adları olur: Hüseynî Aşîran,
  Yegâh, Irak). Ders metni bunu söyler ve klarino ünitesinden sonra arşivde asıl yerinde çalmayı önerir. (2) "En kısa
  değer sekizlik" ölçütüyle telifsiz yalnız bir eser kalıyordu (SymbTr kısa süslemeleri onaltılıkla yazıyor ve tempolar
  yavaş); seçimde gerçek süreye bakıldı: en kısa nota %100 tempoda ≈ 200–300 ms (Temeller etütlerinde ≈ 375–420 ms),
  ilk bölümler %60 tempoda serbest takiple. Dersler `ilk-eserler-1` (Sabahın Seher Vaktinde, anonim Hüseynî türkü;
  Sanma Uşşâk'ın Hemân, Ahmet Avni Konuk) ve `ilk-eserler-2` (Nihâvend Kasaphavası, anonim; Yâ Men Yuhibbu, Tanburî
  Ali Efendi), Temeller'in sonunda `temel-tekrar`'dan sonra. `npm run mufredat` arşiv adımlarında da "yalnız öğretilmiş
  nota" ölçütünü (oktav kaydırılmış hâl) denetler. Ders adımındaki uzun nota satırı
  sayfayı genişletiyordu (`.lsbody` `min-width`), arşiv eserinde perde adları üst üste biniyordu (geniş yerleşim);
  ikisi düzeltildi. Çalma adımları mikrofonla denenmedi.

### S2 — Klarino, teknik ve nefes (Temel ve Orta aşama; ≈ 2 hafta)

- [x] **S2.1 Klarino ünitesi 2 dersten 8 derse** (B, E3). **Yapıldı (15 Kasım 2026).** Var olan `register` ve `klarino` dersleri kalır; `klarino`
  ünitenin toparlama dersi olur (başlığı "Klarino bölgesi: hepsi birden" yapılır, adımlar aynı).

  | Yeni ders | Yeri | Notalar | Adımlar |
  |---|---|---|---|
  | `onikili` "On ikili: aynı parmak, iki ses" | `register`'den önce | 52→71, 53→72, 55→74 | `read`, `listen`, her çift için `notes` [pes, tiz, pes] `maxMiss:1`, `hold` 71 4 sn |
  | `kirilma-1` "La4–Si4: kırılmayı geçmek" | `register`'den sonra | 69, 70, 71, 72 | `notes` 69–71 ×8, 70–72 ×8, `techSteps({type:"break", pair:[69,71], sub:2}, 50, 66)` |
  | `klarino-1` "Mi5, Fa5, Sol5" | sonra | 76, 77, 79 | `listen`, `hold` her biri 4 sn `min:45`, `notes`, `quiz` |
  | `klarino-2` "La5, Si5, Do6" | sonra | 81, 83, 84 | aynı kalıp, `hold` `min:40` |
  | `klarino-ariza` "Klarino'da diyez ve bemoller" | sonra | 73, 75, 78, 80, 82 | S1.2 kalıbı |
  | `ezgi-klarino` "İki bölgede ezgiler" | `klarino`'dan önce | Sol3–Do6 | `piece` `e-k1`, `e-k2`, `e-k3` (8–12 ölçü, biri kırılmayı her ölçüde geçer) |

  Metinlerde on ikili ilişkisi parmak verisinden doğrulanır (`fingeringIds(n)` ile `fingeringIds(n+19)` register
  mandalı dışında aynı mı; aynı olmayan çift derse konmaz). Roadmap `quiz1` taşı etkilenmez.
  *Uygulanan:* `lessons.js` `// ---- S2.1 Klarino ----` bloğu (`onikili` `register`'ın hemen önüne, diğerleri
  `insertLessonAfter("register", …)`; hepsi `since:2`); `klarino` başlığı "Klarino bölgesi: hepsi birden". On ikili
  doğrulaması: 52–64 ile 71–83 register dışında aynı parmak; Fa4 → Do6 aynı değil, `klarino-2` metni Do6 için parmak
  kartına yönlendirir. `klarino-ariza` çiftleri (Fa♯3 → Do♯5, Sol♯3 → Mi♭5, Si3 → Fa♯5, Do♯4 → Sol♯5, Mi♭4 → Si♭5)
  veriden doğrulandı; parmak tarifi elle yazılmadı, `soru` adımı parmak kartından nota buldurur (5 soru, `min:4`).
  `onikili` ve `klarino-ariza`'da `read` ardından `soru`. `techSteps({type:"break", pair:[69,71], sub:2}, 50, 66)`
  olduğu gibi çalışıyor (`art` verilmezse bağlı). Etütler `e-k1` (Si4–Sol5), `e-k2` (10 ölçü, her ölçüde La4/Si♭4 ↔
  Si4/Do5), `e-k3` (12 ölçü, Sol3–Do6). `onboard.js` `CHECK`: "Register geçişi" `onikili`, `register`, `kirilma-1`;
  "Klarino" `klarino-1`, `klarino-2`, `klarino-ariza`, `klarino` (`ezgi-klarino` yok, S5.2). Tarayıcıda 375 px'te
  dersler açıldı, `read`, `soru`, `listen` ve hız `listen` adımları çalıştı; mikrofonlu adımlar tarayıcı panosunda
  mikrofon kapalı olduğu için başlatılamadı, telefonda denenmeli.
- [ ] **S2.2 Artikülasyon 2: bağlı, kesik, aksan** (B, E7). Yeni adım türü `artik { notes, style:"legato"|
  "staccato"|"tenuto", tempo, min }`: metronomla nota dizisi; ölçüm her vuruşta sesin sürdüğü oran (`runVoicedRatio`
  ve `OnsetDetector` var). Legato: vuruşlar arası kesinti yok (sesli oran ≥ ≈ %95, perde değişimi var); staccato:
  her notanın sesli oranı ≤ ≈ %50 ve her vuruşta yeni başlangıç; tenuto: arası. **Eşikler tahmin;** `testdata/iowa`
  kayıtlarından yapay dizilerle `audio-check` benzeri bir ölçümle ayarlanır, sonuç `testdata/README.md`'ye yazılır.
  Ders `artikulasyon-2` (Teknik, `artikulasyon`'dan sonra): `read` (Türk klarnet tavrında bağlı çalış baskındır, dil
  hafif kullanılır; bu cümle kaynakla doğrulanamazsa "çoğu icracı" diye yumuşatılır) → `artik` legato 67–74 → staccato
  → karışık (iki bağlı iki kesik) → `piece` `e-artik`. Hız ünitesinin `art:"legato"` adımları değişmez.
- [x] **S2.3 Dizi ve arpej programı** (O, E8). **Yapıldı (15 Kasım 2026).** Hız ünitesine dört ders, `hiz-etut`'ten önce, `since:2`:
  `hiz-kromatik` (yeni `techPattern` türü `chromatic { base, span }`; 52–71 ve 67–84; 60→88), `hiz-iki-oktav`
  (`scale` `octaves:2`: Sol majör, Rast, Uşşak, Hicaz; 60→84), `hiz-aksak` (`groups` 9/8 ve 7/8 gruplamada vurgu:
  `sub` yerine `group:[2,2,2,3]` parametresi; önce `techPattern`'e eklenir), `hiz-atlama` (dörtlü, beşli, oktav
  atlamalar; yeni tür `leaps`). Yeni taş: "Kromatik dizi ♩=80 temiz" (Orta aşama).
  *Uygulanan:* `lessons.js` `// ---- S2.3 Dizi ve arpej ----` bloğu, `insertLessonAfter("hiz-makam", …)`, dördü `since:2`;
  Hız ünitesi zinciri `hiz-makam → hiz-kromatik → hiz-iki-oktav → hiz-aksak → hiz-atlama → hiz-etut`. `skills.js`
  `techPattern` yeni türler: `chromatic { base, span }` (52–71 ve 67–84, 60→88), `leaps { iv:4|5|8 }` (oktavda dizi bir
  oktav uzatılır), `groups` + `group:[…]` (sekizlik, ölçü `[toplam, 8]`, grup başı `acc`, son nota ölçüyü doldurur;
  `ticks` ile metronom yalnız grup başlarında, ölçü başı kuvvetli; sayım yine dört dörtlük). **Sapma:** makam dizileri iki
  oktavda asıl yerinden Do6'yı aşıyor (Rast 67–91, Uşşak/Hicaz 69–93; `TECH_HIGH` 84); makam kalıbı sığmazsa bir oktav
  pes denenir: Rast Kaba Rast–Gerdâniye (55–79), Uşşak ve Hicaz Kaba Dügâh–Muhayyer (57–81). Bu, önceden `null` dönen
  (kullanılamayan) makam kalıplarını açar, var olanları değiştirmez. `patternKey` eski anahtarlarda aynı; aksak gruplama
  nota değeri alanında ("2-2-2-3"), `span`/`iv` yedinci alan; `patternFromKey` gidiş-dönüşü denendi. 7/8'i Rumeli (2+2+3),
  9/8'i Karşılama (2+2+2+3) gruplaması olarak anlatır (`learn.js` `USULS` verisi). `drawScore` vurgu (>) çizer; ders
  dinleme adımı kalıbın ölçüsünü kullanır (önce hep 4/4). Hız sekmesine Kromatik dizi, Aksak gruplar, Atlamalar türleri;
  makam dizilerinde 2 oktav seçeneği açıldı. Taş `roadmap.js` orta aşama `chrom`: `tech.best`'te `chromatic:` ile başlayan
  kalıpların en iyi temiz temposu, hedef 80. Tarayıcıda 375 px'te dersler, dinleme adımı (9/8 çizim ve vurgular), Hız
  sekmesinde yeni türler ve yol haritası taşı denendi, konsolda hata yok; mikrofonlu `tech` adımları panelde mikrofon
  kapalı olduğu için başlatılamadı, telefonda denenmeli.
- [ ] **S2.4 Altissimo** (O, E4). İleri üniteye iki ders: `altissimo-1` (Do♯6–Mi6: 85–88), `altissimo-2` (Fa6–Sol6:
  89–91). Adımlar: `read` (hava hızı, dudağı sıkmadan; ağız boşluğu) → her nota için alttaki klarino notasından
  bağlı çıkış `notes` → `hold` 3 sn `min:35` → `quiz` `mode:"find"`. Parmaklar `FINGERINGS`'ten; ders başında "bu
  bölgede çalgıdan çalgıya parmak değişir, alternatiflere bak" notu ve parmak kartı alternatifleri açık. Perde bulucu
  bu bölgede denenmedi: önce `audio-check` ile 85–91 arası Iowa kayıtlarında doğruluk ölçülür; %90'ın altındaysa
  dersler `hold` yerine yalnız "nota çıktı" (`notes`) ölçer.
- [ ] **S2.5 Nefes 2 ve 3** (K, E25). `nefes-2` (Teknik): 4–8–12–16 vuruşluk cümleler, `hold` 12, 16, 20 sn
  `min:50`; nefes yeri işaretleme (`piece` adımında virgül işaretli özgün etüt `e-nefes`; etüt metin biçimine nefes
  işareti gerekiyorsa `parseScoreText`'e `'` belirteci eklenir, çizimde virgül). `nefes-3` "Sürekli nefes" (İleri,
  isteğe bağlı, kapı değil): yalnız kaynaklı anlatım ve su bardağı–pipet alıştırması `read`, `hold` 67 30 sn
  (ölçüm yalnız kesintisiz süre). Kaynak `KAYNAKLAR.md`'ye eklenir; kaynak bulunamazsa `nefes-3` yazılmaz.
- [x] **S2.6 Ton ve dinamik 2** (K). **Yapıldı (15 Kasım 2026).** `dinamik-2` (Teknik): pp ve ff'te perde sabit kalsın (`dynamics` `shape:"mdv"`
  52, 67, 79'da; ek ölçüt: sapma ±1 koma içinde, `dynamicsEval` çıktısında perde verisi var mı bakılır), yankı
  çalışması (aynı cümle f sonra p: `piece` iki kez). Roadmap'e taş eklenmez.
  *Uygulanan:* `dynamicsEval` perde kaymasını zaten ölçüyordu (en yüksek − en düşük ≤ 2 koma, yani ±1); eşik adımda
  `drift` parametresi oldu ve başlıkta "perde ±1 koma" yazar. Ders `dinamik-2` (`ses-kalitesi`'nden sonra): messa di voce
  Sol4, Mi3, Sol5. **Yankı ölçülmüyor:** uygulama bir cümlenin ses gücünü değerlendirmiyor; çalışma okuma + iki serbest
  takip (`piece` adımına `cue`: başlıkta "güçlü (f)", "yankı, hafif (p)") olarak kondu, metin bunu açıkça söyler.
  Cümle ses gücü ölçümü ileride `artik` adımının ölçümüyle (S2.2) birlikte düşünülebilir.

### S3 — Makam, usul ve teori derinliği (Makam aşaması; ≈ 4 hafta)

- [x] **S3.1 Etüdü olmayan 10 makama etüt** (B, E9; eski C1'in yerine). **Yapıldı (15 Kasım 2026).** `e-bayati`, `e-karcigar`, `e-humayun`,
  `e-uzzal`, `e-zirguleli`, `e-suzinak`, `e-hicazkar`, `e-kurdilihicazkar`, `e-mahur`, `e-acemasiran`: 8 ölçü, 4/4,
  tempo 76–84, `level:3`, kural 5'e göre. İnici makamlarda (Hicazkâr, Kürdîli Hicazkâr, Mâhur, Acemaşîran) etüt
  tiz durak çevresinden başlar. Ders adımına **sona** `piece` eklenir (bu on dersin adım sayısı 4'ten 5'e çıkar; eski
  kullanıcıda ders "4/5" görünür, kabul edilir ve sürüm notuna yazılır) ya da S3.3'ün ikinci derslerine konur
  (tercih: S3.3). Karcığar etüdü Trakya girişindeki "Karcığar öne çıkar" cümlesine bağlanır.
  *Uygulanan:* `repertoire.js` `ETUDES` sonunda "S3.1" bloğu, on etüt; hepsi 8 ölçü 4/4, `level:3`, tempo 76–80, yalnız
  `asc/desc` perdeleri (makamın dizisinde olmayan yeden kullanılmadı: Bayâtî, Karcığar vb. Rast'a inmez), 4. ölçüde
  güçlüde yarım karar, 8. ölçüde durakta karar; inici makamlar Gerdâniye (Acemaşîran'da Acem) çevresinden başlar.
  **Yer: iki yol birlikte.** S3.3'ün on makamından yalnız Karcığar'ın etüdü yoktu; `e-karcigar` `karcigar-2`'de (önce
  serbest, sonra tempolu). Kalan dokuz makamın (Bayâtî, Hümâyun, Uzzâl, Zirgüleli Hicaz, Sûzinak, Hicazkâr, Kürdîli
  Hicazkâr, Mâhur, Acemaşîran) ikinci dersi yok; etütleri o makam dersinin **sonuna** `piece` (`tempo`, `min:65`) olarak
  eklendi. Bu dersler 4 adımdan 5 adıma çıktı: **eski kullanıcıda bu dokuz ders "4/5" görünür** (sürüm notuna yazılmalı);
  ikinci ders açmak bu dokuz makam için S3.3'ün ikinci dalgasıdır. Trakya girişine (`trakya-giris`) Karcığar
  etüdünün yerini söyleyen ipucu eklendi (adım değil). Günlük çalışmanın "makamın etüdü" adımı (`e-<makam>`) yeni
  etütleri kendiliğinden alır.
- [ ] **S3.2 13 yeni makam** (B, E10; eski C2'nin yerine). Sıra arşiv sıklığına göre, iki dalga:
  **Dalga 1:** Muhayyer (78), Bûselik (73), Muhayyer Kürdî (50), Acemkürdî (46), Evç (37), Tâhir (35).
  **Dalga 2:** Neveser (42), Sûzidil (37), Gerdâniye (32), Nişâburek (32), Şehnaz (32), Yegâh (30),
  Sultânîyegâh (29). Her makam için: `learn.js` `MAKAMS` kaydı (`id, name, durak, guclu, yeden, asc, desc, seyir,
  seyirEn, seyirType, icra`); arşiv dosya adındaki makam kimliğiyle eşleme (`archive.js` `ARCH_MAKAM`
  eşlemesine ek); `PERDES`'te eksik perde varsa eklenir (pest bölge: Yegâh, Hüseynî Aşîran; tiz: Tiz Çargâh…); ders
  (var olan makam dersi kalıbı + etüt); `makamPool`/`makamChoices`'a ve Akort ekranı makam seçicisine eklenir;
  `similarMakams` yeni çiftleri kendiliğinden bulur (Muhayyer–Hüseynî, Tâhir–Uşşak/Nevâ, Gerdâniye–Hüseynî:
  "aynı dizi, farklı seyir" metni yalnız hesap bunu veriyorsa). Kaynak: her makamın TDV maddesi; `KAYNAKLAR.md`
  bölüm 2'ye madde adı ve erişim tarihi. Yegâh ve Sultânîyegâh'ın durağı yazılı Re4 (Yegâh): klarnette rahat;
  Sûzidil ve Acemkürdî'nin karar perdeleri kaynaktan teyit edilmeden yazılmaz.
  *Kabul:* arşivden bu makamlardaki bir eser açılınca makam bilgisi kutusu dolu; S0.4 temiz; makam tanıma havuzu
  yeni makamları ancak dersleri bitince sorar.
- [x] **S3.3 Her temel makama ikinci ders: "cümle, karar ve eser"** (B, E11). **Yapıldı (15 Kasım 2026).** Önce 10 makam: Rast, Uşşak, Hüseynî,
  Hicaz, Nihâvend, Kürdî, Saba, Segâh, Hüzzam, Karcığar. Kimlik `<makam>-2`, yeri o makamın dersinden hemen sonra
  (S0.1 göçü gerekir). Kalıp, 7 adım:
  1. `read`: makamın karar yolu (yeden, asma karar perdeleri; `MAKAMS[x].seyir` metninden) + `soru` ×3 (durak,
     güçlü, yeden hangisi).
  2. `notes` ×3: üç kısa karar kalıbı (4–6 nota; güçlüden durağa iniş, yedenli karar, yarım karar). Kalıplar
     `asc/desc`'ten üretilir (`makamExercises` var; eksik kalıp türü eklenir), elle yazılmaz.
  3. `seyir` `focus:"cesni"` 30 sn: yarım karar çeşnisinde kal.
  4. `ear` `mode:"makam"` `pool:` o makam + `similarMakams` sonucu, `n:6, min:4`.
  5. `piece` S3.1 etüdü ya da var olan etüt `mode:"tempo"` `min:75` (bir üst tempo).
  6–7. `eserSteps`: arşivden o makamda bir kolay eser (S1.6 betiği, makam süzgeciyle; seviye 1–2).
  Segâh ve Hüzzam'da icra perdesi notu (`ICRA_INFO`) derste gösterilir.
  *Uygulanan:* `lessons.js` `// ---- S3.1 + S3.3 Makam ikinci dersleri ----` bloğu, `makamSecond(mk, o)` on dersi
  kurar (`since:2`, `insertLessonAfter(<makam>)`). Ders verisi yalnız `learn.js`'ten okunur (tarayıcıda önce yüklenir).
  Okuma adımı `seyirText` + durak/güçlü/yeden cümlesi; soruların seçenekleri bu üç perde ve diziden bir dördüncü.
  Karar kalıpları `learn.js` `makamCadences` (yeni; `makamExercises` de döndürür): güçlüden durağa iniş (desc), yedenli
  karar (durağın iki üst perdesi, durak, yeden, durak), güçlüde yarım karar (asc); kısa kalırsa güçlünün üst komşusuna
  uğranır (Saba, Segâh, Hüzzam). Adım başlığında kalıbın adı (`hint`). Kulak havuzu makam + `similarMakams(mk, 2)`'den
  en çok üç; **Segâh ve Hüzzam'da benzer makam çıkmıyor** (fark 2 perdeden çok), havuz aynı duraklı makam (Segâh ↔
  Hüzzam). Etüt adımı var olan etütte `tempo` ile bir üst tempo (Rast, Uşşak, Hüseynî, Nihâvend, Kürdî 88; Hicaz 84;
  Saba, Segâh, Hüzzam 80). İcra notu `makamIcraNote` ile `ICRA_INFO`'dan üretilir; Segâh makamının kaydı yok, ders
  "kaynaklı düzeltme yok, AEU" der. `eserSteps`'e `o.to` eklendi (tamamı adımları o ölçüde biter).
  **Eserler** (`eser-sec.js --usul hepsi --oktav 0 --aralik 52-84 --sn 120`, telifsiz, asıl yerinde): Rast "Al Dökeyim
  Gevheri" (anonim nefes, 13/8), Uşşak "Şu Dereden Gece Geçtim" (anonim türkü), Hüseynî "Hüseynî Seyir" (Rauf
  Yektâ), Hicaz "Dere Dibi Saz Olur" (anonim ninni), Nihâvend "Yılmam Ölümden" (Ali Rıfat Çağatay), Kürdî "Âşık-ı
  Dilhasteye Rahmeyle" (Ahmet Avni Konuk), Saba "Pınar Başı Burma Burma" (anonim; ilk sekiz ölçüsü `usul-3`'te de
  var, burada ilk kıta 1–34), Segâh "Bir Fındığın İçini" (anonim; ilk kıta 1–24), Hüzzam "Hüzzam Seyir" (Rauf Yektâ),
  Karcığar "Karadeniz Oyunhavası" (anonim mandra; ilk yarı 1–24). Saba, Segâh ve Karcığar'da ikinci yarı ölçü ölçü
  birincinin tekrarı (betikle denetlendi), bu yüzden `to`. Ölçütten iki sapma: Hüzzam'da koma ölçütüyle (≤ 2) hiç eser
  kalmadı, seyir 4 koma perdesiyle seçildi (Si5 Si4'ün oktavı, Do6'ya çıkar); Rast'ta telifsiz tek kısa eser 13/8
  usulde. `ilk-eserler-*` ve `usul-3/4`'teki eserler tekrar kullanılmadı (Saba dışında: başka aday yok). Tarayıcıda
  375 px'te dersler açıldı; okuma, soru ve arşiv dinleme adımları denendi, konsolda hata yok; çalma adımları mikrofon
  engelli olduğu için başlatılamadı.
- [ ] **S3.4 Geçki: üç ders** (B, E12). Yeni adım parametresi: `seyir { makam, via, sec, min }`: `via` makamının
  ana makamdan **ayıran perdelerine** (`similarMakams`'ın fark hesabı) en az iki kez uğra, sonra ana makamın
  durağında karar ver; puan `seyirAnalysis` + bu iki koşul. Dersler (Makamlar sonu, `makam-bulma`'dan sonra):
  `gecki-1` "Çeşni değiştirmek" (`read` + `soru`; Rast'ta Nevâ üstünde Hicaz = Sûzinak rengi: `listen` iki cümle,
  `notes`, `seyir` rast via suzinak), `gecki-2` "Aynı durakta komşu makam" (Uşşak↔Hicaz↔Kürdî Dügâh'ta; Hüseynî↔
  Karcığar), `gecki-3` "Eserde geçkiyi bul" (arşivden geçkili 2 eser; betik arızaların ölçü ölçü değiştiği eserleri
  aday gösterir; `listen` + "hangi ölçüde renk değişti" `soru`, sonra `eserSteps`). Yalnız uygulamadaki dizilerden
  hesaplanabilen geçkiler anlatılır; "bu makam şuna geçer" türünden gelenek iddiası kaynaksız yazılmaz.
- [ ] **S3.5 Şed (göçürme) ve ahenk** (B, E13). *Önce bakılacak:* `core.js` `setTuningContext`/`contextPerde` bir
  makamı başka perdeye taşıyabiliyor mu; taşıyamıyorsa `scale`, `seyir` ve `mimic` adımlarına `shift:<koma>` (53
  TET'te 9 = tanini, 22 = dörtlü, 31 = beşli) eklenir, hedef perdeler `mod53` ile kaydırılır. Dersler (İleri):
  `sed-1` "Aynı makam, başka perde" (Rast'ı Do'dan ve Re'den: `scale` shift 22 ve 31; Hicaz'ı Nevâ'dan ve Rast'tan),
  `sed-2` "Solistin perdesine uymak" (ahenk kavramı: Bolahenk, Süpürde, Mansur, Kız; yalnız yazılı–duyulan farkı
  tablosu, kaynak TDV "Ahenk" maddesi; `soru` ×5; `piece` var olan `e-ussak` etüdü `transposeAll` ile iki farklı
  perdede), `sed-3` "Sık kullanılan şed makamlar" (yalnız veride karşılığı olanlar: Hicazkâr = Zirgüleli Hicaz'ın
  Rast'taki şeddi; bu bağ `learn.js` metninde zaten var). Arşiv eser sayfasına "başka perdeden çal" (transpoze)
  düğmesi `shiftOctave`'in yanına; yazılı aralık 52–91 dışına çıkarsa uyarı (`rangeIssues`).
- [ ] **S3.6 Formlar** (O, E14). Teori'ye 9. konu `form` ve ders `formlar` (Makamlar, `makam-bulma`'dan önce):
  şarkı (zemin, nakarat, meyan), türkü, peşrev ve saz semâîsi (hane, teslim), longa, aranağme, taksim, ilâhi; her
  biri 2–3 cümle + arşivden o formda süzülmüş liste bağlantısı (`archive.js` form süzgeci). Adım: `read` ×3, `soru`
  ×6, bir saz semâîsinin teslimini `listen` + ölçüleri işaretli gösterme. Eser sayfasında form adına dokununca bu
  konunun ilgili paragrafı alt panelde açılır. Kaynak: TDV form maddeleri, `KAYNAKLAR.md`'ye.
- [x] **S3.7 Usul 3 ve 4** (O, E15; B1 ile birlikte). **Yapıldı (15 Kasım 2026).** `usul-3` (Teknik, `usul-2`'den sonra): Nîm-sofyan, Ağır
  Aksak, Sengin Semâî; `usul-4` (Makamlar başı): Devr-i Hindî, Müsemmen ve, B1'de çözülürse, Aksak Semâî. Kalıp
  `usul-2` ile aynı (`usultap` mem → `rhythm`), her usulün sonunda arşivden o usulde bir kolay eserin ilk 8 ölçüsü
  (`piece` `arsiv`, `mode:"tempo"`). B4'ün dört usul etüdü bu derslere bağlanır. Yeni taş: "12 usulü ezberden vur".
  Büyük usuller (Devr-i Kebîr 45 eser, Hafîf 28, Muhammes 25, Evfer 24) ayrı PBI: kalıpları TDV'den okununca.
  *Uygulanan:* `lessons.js` `// ---- S3.7 Usul 3 ve 4 ----` bloğu, ikisi `since:2`. `usul-3` `usul-2`'nin arkasında;
  `usul-4` Makamlar'ın ilk dersi (`insertLessonAfter` Makamlar'ın ilk dersinden önceki derse, bugün `sus-makam`; ünitenin ilk
  dersi `unlocked`'ta `base()` ister, `rast-giris` artık `usul-4`'ü ister, eski kullanıcıda göç "istersen" yapar). Kalıp:
  bilinen usule dayananlarda (Nîm-sofyan, Ağır Aksak = Aksak, Sengin Semâî = Yürük Semâî) `usultap` `mem` → `rhythm`;
  yeni kalıplarda (Devr-i Hindî, Müsemmen) önce `tap`. Her usulün sonunda yardımcı `usulEser`: `listen` + `piece`
  (`from:1, to:8, mode:"tempo", min:65`). Metinler `usuller.js` `USUL_INFO`'dan (TDV). Eserler `scripts/eser-sec.js
  --makam hepsi --oktav 0 --aralik 52-84 --sn 300` ile; her usulde telifsiz ve ölçütü geçen tek eser çıktı, Müsemmen'de
  dört (en kolayı, en kısa değeri sekizlik olan seçildi): Pınar Başı Burma Burma (Sabâ türkü, anonim), Sarı Zeybek
  (Hüseynî, Osman Pehlivan), Gelse Nesîm-i Subh İle (Beyâtî yürük semâî), Şemsiyemin Ucu Kare (Hüseynî türkü, notası
  7/4), Ağlama Yâr (Hüseynî türkü, anonim). **Aksak Semâî eklenmedi:** B1 hâlâ açık (şemadaki değerler 9 zaman veriyor,
  usul 10 zamanlı); B1 çözülünce `usul-4`'ün sonuna değil yeni bir derse girer (kural 1). **B4'e bağlanmadı:** B4
  yapılmadı ve etütleri bu derslerin usullerinde değil (Düyek, Curcuna, Türk Aksağı, Yürük Semâî); yapılınca `usul`,
  `usul-2`'ye ya da kendi dersine bağlanmalı. Yol haritası: Makamlar aşamasına "12 usulü ezberden vur" (`usul12`,
  var olan `usulMem` ölçümü: `usul.prog`'ta `mem` ≥ 70 olan usuller). Müsemmen şemasındaki belirsizlik (B1 ⚠️) sürüyor.
- [x] **S3.8 Teori derslere bağlansın** (O, E6). **Yapıldı (15 Kasım 2026).** Teori'nin 8 konusu için 8 kısa ders değil, var olan yola serpilmiş
  `soru` adımlı 5 ders: `teori-koma` (Makamlar başı, `rast-giris`'ten önce: tanini, bakiye, mücenneb, 53 koma;
  `ear` `abx` seviye 1), `teori-perde` (`rast`'tan sonra: perde adları iki oktav, `soru` ×8 + `quiz` perde adıyla),
  `teori-cesni` (`hicaz`'dan sonra: dörtlü ve beşliler; `notes` her çeşni Dügâh ve Rast'tan), `teori-makam`
  (`nihavend`'den sonra: durak, güçlü, yeden, seyir türleri; `soru` ×6), `teori-transpoz` (Temeller sonu: yazılı ve
  duyulan ses). Metin Teori sayfasındakiyle aynı kaynaktan (`teori.js` konu nesnesi dışa aktarılır, ders ondan okur;
  metin iki yerde yazılmaz).
  *Uygulanan:* `teori.js` konuları ve çeşni listesi işlevle kurulur: `thTopics(L)`, `thCesni(L)`. Teori sayfası o anki
  dili (`L`), dersler iki dilli nesneyi alır (`(tr, en) => ({ tr, en })`); `LANG === "en" ? … : …` ile yazılmış seçenekler
  `L(…)`'e çevrildi. Konulara `ek` alanı eklendi: yalnız derste sorulan ek sorular (konunun metnindeki bilgiden; Teori
  sayfası göstermez). `teori.js` Node'da da yüklenir (`module.exports`; `learn.js` require ile, `TRAINERS` yoksa
  sayfa kurulmaz). `lessons.js` "S3.8 Teori dersleri" bloğu: ders başlığı, okuma adımının başlık ve paragrafları ve
  soru adımının soruları (ek + Teori sınavı) tembel getter; tarayıcıda `teori.js` sonra yüklendiği için ilk okunuşta
  kurulur. Dersler ve yerleri: `teori-koma` (Makamlar başı, `rast-giris`'ten önce; S3.7'nin `usul-4`'ünden sonra;
  `read`, `soru` ×6, `ear` `abx` seviye 1), `teori-perde` (`rast`'tan sonra, `rast-2` varsa ondan sonra; `read`,
  `soru` ×8 ikisi dizekte perde adı, `quiz` `mode:"play"` Yegâh'tan Muhayyer'e ana perdeler; "perde adıyla" ayrı quiz
  kipi yok, play kipi notanın altında perde adını gösterir), `teori-cesni` (`hicaz`'dan sonra, `hicaz-2` varsa ondan
  sonra; `read`, `soru` ×5, `notes` ×6: Rast'ta Rast ve Nikriz beşlisi, Dügâh'ta Uşşak, Bûselik, Kürdî, Hicaz
  dörtlüsü; perdeler `TH_CESNI`'den, başlıkta çeşni adı), `teori-makam` (`nihavend`'den sonra, `nihavend-2` varsa
  ondan sonra; `read`, `soru` ×6), `teori-transpoz` (Temeller, `okuma-5`'ten sonra, `temel-tekrar`'dan önce; `read`
  Akort bağlantısıyla, `soru` ×4). Teori sayfasında beş konunun ilk bağlantısı kendi dersi. Bûselik ve Kürdî perdeleri
  çeşni dersinde ilk kez çalınıyor (makam dersleri daha sonra). İngilizcede sayfa çevirmeni okuma adımında "Durak"
  sözcüğünü "Tonic (durak)" diye genişletiyor ("Tonic (durak) (final)"); Teori sayfasıyla aynı metin, dokunulmadı.
  Tarayıcıda 375 px'te iki dilde okuma ve soru adımları denendi (dizekli sorular, yanlışın yeniden gelmesi), Teori
  bağlantıları açıldı, konsolda hata yok; mikrofonlu adımlar (ear, quiz, notes) panelde denenmedi.

### S4 — Repertuvar, yöreler, fasıl, taksim (≈ 4 hafta)

- [x] **S4.1 Dereceli repertuvar merdiveni** (B, E16; S0.3 gerekir). **Yapıldı (15 Kasım 2026).**
  *Uygulanan:* `repertuvar.js` (6 basamak; liste `scripts/eser-sec.js --basamak N --sec` çıktısı, basamaklar sırayla ve
  alt basamakların eserleri `--haric` ile; her basamak önce bir alttakinin ölçütünü geçemeyen eserleri alır; form
  dengesi 4/2/2/2; seyir örneği, taksim, etüt alınmaz). Telifsiz uygun eser az olduğu için basamak 1'de 9, basamak 2'de
  8 eser var (gerekli sayı `min(6, eser sayısı)`). "En kısa değer" ölçütü süreyle (`--ms`), basamak 1 bir oktav pes
  (S1.6 gibi). Eserler → **Sıradaki eserim**: sıradaki eser, basamak kartları, çalınma ve öğrenme durumu. **Sapma:**
  "öğren" `eserSteps` değil, arşivin yedi adımlı "Eseri öğren" akışını açar (aynı kayıt, ikinci akış yazılmadı).
  "Çalındı": arşivde eserin tamamı %100 tempoda tempolu, en az %80 (`rep.played`). Yol haritasında her aşamaya
  "basamak N'den 6 eser" taşı; `soft` işaretli: hoca kartı bu taşı sıradaki dersin önüne koymaz, yalnız yan öneri
  yapar (sonradan eklenen taş dersleri bitmiş kullanıcıyı durdurmasın). Hoca kartı: son çalınan eserden bu yana gerçekten
  çalınıp biten 4 dersten sonra "Bu hafta bir eser". Tarayıcıda sekme, kayıt, "Öğren"in oktav kaydırması denendi;
  tempolu çalma mikrofon engelli olduğu için denenmedi. Yeni sayfa Eserler → **"Sıradaki eserim"**
  ve `repertuvar.js`: 6 basamak × 10 eser. Basamak ölçütleri betikle (`scripts/eser-sec.js --basamak`):

  | Basamak | Aralık (yazılı) | En kısa değer | Usul | Makam | Süre |
  |---|---|---|---|---|---|
  | 1 | 52–70 | sekizlik | Sofyan, Düyek, Nîm-sofyan, Semâî | komasız ya da tek koma perdesi | ≤ 90 sn |
  | 2 | 52–79 | sekizlik | + Aksak, Curcuna, Türk Aksağı | dersi bitmiş makamlar | ≤ 2 dk |
  | 3 | 52–84 | onaltılık (az) | + Yürük Semâî, Devr-i Hindî, Ağır Aksak | 10 temel makam | ≤ 3 dk |
  | 4 | 52–84 | onaltılık | hepsi | 20 makam, tek geçki | serbest |
  | 5 | 52–88 | onaltılık, üçleme | + Aksak Semâî, Sengin Semâî | hepsi | saz semâîleri, peşrevler |
  | 6 | 52–91 | otuzikilik | hepsi | hepsi | longalar, hızlı oyun havaları |

  Her basamakta form dengesi: 4 şarkı, 2 türkü, 2 saz eseri, 2 oyun havası ya da ilâhi. Eser kartı: "öğren"
  (`eserSteps`), "çalındı" ölçütü tam eser `tempoPct:100` `min:80`. Basamak, içinden 6 eser çalınınca tamamlanır.
  Hoca kartı ünite derslerinin arasında "bu hafta bir eser" önerir (her 4 dersten sonra). Taşlar: her aşamaya
  "basamak N'den 6 eser". Telif: S1.6 ile aynı süzgeç.
- [ ] **S4.2 Yeni ünite: Türkü ve yöreler** (B, E17). `unit:"turku"`, kapı Register sınavı (`GATE_AFTER`),
  rozet "Türkü yolcusu". 8 ders, içerik arşivdeki türkü (356), zeybek (19) ve Rumeli türküsü (16) kayıtlarından:
  `turku-giris` (türkü formu, kırık hava ve uzun hava ayrımı; yalnız kırık hava çalışılır), `turku-sofyan`,
  `turku-aksak` (5/8, 7/8, 9/8 türküler), `turku-huseyni` ve `turku-ussak` (türkülerde en sık iki dizi; sıklık
  arşivden sayılır, sayı metne yazılır), `zeybek-2` (ağır zeybek 9/4 ve kıvrak 9/8; var olan `zeybek` usul verisiyle),
  `rumeli-2`, `turku-susleme` (türküde çarpma ve tril: `ornament` adımları türkü cümlesinde). Her ders: usul
  `usultap` → `eserSteps` 2 türkü. Yöre tavrı hakkında kaynaksız cümle yazılmaz; ders metni eserin künyesini
  (yöre, kaynak kişi; SymbTr alanları) ve çalınan şeyi anlatır. Yöreye özgü usul kalıbı gerekiyorsa ve veride
  yoksa o türkü seçilmez.
- [ ] **S4.3 Fasıl ve eşlik pratiği** (B, E18). İleri üniteye 4 ders: `aranagme` (arşivdeki 77 aranağmeden Rast,
  Hicaz, Nihâvend, Uşşak; aranağme nedir, nerede çalınır; `eserSteps`), `sarki-eslik` (şarkıyı solistle çalmak:
  sözlü eserde ezgiyi sade çal, söz arasını doldur; `piece` adımı eserin sözlü ölçülerinde `mode:"free"`, söz
  aralarında `listen`; SymbTr söz hizası notalarda var: `notes[i][3]`), `fasil-sirasi` (`read` + `soru`: peşrev,
  beste, ağır semâî, şarkılar, yürük semâî, saz semâîsi; kaynak TDV "Fasıl"), `eslikle-calma` (Eşlik sekmesinde
  darbuka ve bas üstünde iki eser; ölçüt `band.hist` usule oturma ≥ %70; `band` adım türü yoksa eklenir:
  `{ type:"band", arsiv|id, min }`).
- [ ] **S4.4 Saz eserleri** (O, E19; S3.6 ve B1 Aksak Semâî gerekir). İleri: `pesrev-1` (bir peşrevin 1. hanesi ve
  teslimi), `sazsemaisi-1` (bir saz semâîsinin 1.–3. haneleri; Aksak Semâî 10/8), `sazsemaisi-2` (4. hane: usul
  değişir; aynı eser), `longa-1` (hızlı 2/4; `tempoPct` 60→80→100). Eserler basamak 5–6'dan, bestecisi kamu malı.
  Her derste hane hane `eserSteps`, sonunda tamamı.
- [ ] **S4.5 Taksim 6–9** (B, E20). `taksim-gecki` (S3.4'ün `via` ölçütüyle 60 sn: ana makam → geçki → dönüş ve
  karar), `taksim-tiz` (meyan bölgesi: seyir alanının üst dörtlüsüne çık, en az bir cümle orada; `seyirAnalysis`
  ambitus çıktısı), `taksim-usullu` (Eşlik'in darbukası üstünde; ölçüt seyir puanı + cümle sonlarının usul başına
  denk gelme oranı; `band.js` vuruş zamanları var), `taksim-uzun` (2 dakikalık plan: giriş, gelişme, meyan, karar;
  `phraseAnalysis` dört bölümü süreyle ayırır, her bölümün ölçütü ayrı gösterilir). Taş: "2 dakikalık taksim, dört
  bölüm de tutuyor".
- [x] **S4.6 Kulaktan çalma yolu** (O, E21). **Yapıldı (15 Kasım 2026).** Üç ders: `kulak-ezgi-1` (Temeller sonu: 3–4 notalık cümleyi duy ve
  çal, `mimic { commas | notes, len:3 }` pes bölge notalarıyla; önce `mimic`'in makamsız nota havuzu desteklediğine
  bakılır), `kulak-ezgi-2` (Makamlar ortası: 6–8 notalık makam cümlesi, `len:6`), `kulaktan-eser` (İleri: arşivden
  bir eserin ilk 8 ölçüsü nota gösterilmeden; `listen` → `piece` `hidden:true` → nota açılır ve farklar gösterilir;
  `piece` adımına `hidden` seçeneği). Kulaktan çıkar aracına ders sonundan bağlantı.
  *Uygulanan:* `mimic` adımı makamsız nota havuzunu desteklemiyordu (`makam` ya da `commas`); `notes:[midi…]` eklendi
  (`lessonview.js`: eşit aralıklı çalar, çiplerde ve geri bildirimde nota adı). `npm run mufredat` makamsız `mimic`
  notalarının o derse kadar öğretildiğini de denetler. `piece`/`listen` arşiv adımına `hidden:true` (`pieces.js`
  `archivePieceStep`): nota çizilir ama görünmez (`.scorehid`; perde adları, parmak kartı ve "Eseri arşivde aç" de
  gizli), tempolu çalış bitince nota açılır ve `alignPerformance` işaretleri (doğru, yanlış perde, kaçan) üstünde kalır;
  dinleme adımında nota hiç açılmaz. Ders sonu bağlantısı için ders alanı `endLink:{ tab, label, text }`
  (`lessonview.js` `renderNext`). Dersler `lessons.js` `// ---- S4.6 Kulaktan çalma ----` bloğu, üçü `since:2`:
  `kulak-ezgi-1` `ilk-eserler-2`'den sonra (Temeller'in son dersi; `listen` + `mimic notes:[55,57,59,60] len:3` +
  `mimic notes:[52,53,55,57,59,60] len:4`), `kulak-ezgi-2` `nihavend-2`'den sonra (beş makamdan sonra, Makamlar'ın
  ortası; Rast, Hicaz, Nihâvend `mimic len:6`), `kulaktan-eser` `kulak-2`'den sonra: Bahçelerde Mor Meni (anonim Hicaz
  türkü, `eser-sec.js --basamak 2`) ölçü 1–8, `listen hidden` → `piece hidden` %80 tempo `min:60` → nota açık %100
  `min:75`. Üçünün sonunda "Kulaktan çıkar aracını aç". Tarayıcıda 375 px'te üç ders açıldı; gizli dinleme ve gizli
  çalma (mikrofon sessiz akışla taklit edildi) denendi, nota çalış bitince işaretli açıldı; konsolda hata yok. Gerçek
  mikrofonla denenmedi.
- [ ] **S4.7 Ezber ve icra hazırlığı** (O, E22). `piece` adımına `mode:"mem"` (nota 4 ölçü önden silinir, sonra
  tümü gizli; değerlendirme aynı). Dersler (İleri sonu): `ezber` (basamak 3'ten bir eser: bölüm bölüm ezber),
  `kayit-dinle` (bir eseri kaydet, dinle, öz değerlendirme listesi: ton, perde, ritim, cümle; her madde 1–5;
  uygulamanın ölçtüğü `recSummary` değerleriyle yan yana; fark büyükse hoca kartı o beceriyi önerir), `program`
  (10 dakikalık program: taksim + iki eser, arka arkaya durmadan; ölçüt her parçanın kendi eşiği).

### S5 — Akış, ölçme ve bitiş (≈ 1,5 hafta; içerik PBI'larıyla birlikte)

- [ ] **S5.1 Yol haritası yeniden** (O, E27). `RM_STAGES` "Hedef müfredat" tablosuna göre: yeni üniteler aşamalara
  yazılır (`turku` → Yöreler ve fasıl aşaması, Trakya ile birlikte). Yeni taşlar: okuma (dizek testi 52–84 arası
  %80), eser (basamak taşları), "12 usul", "kromatik ♩=80", "5 makamda karar kalıpları", "geçkili seyir puanı 65",
  "2 dakikalık taksim". `mileStuck` deneme günü kaynaklarına yeni kayıtlar (`rep.hist`) eklenir. `roadmapPace`
  tahmini ders sayısı artınca "36 ay" gibi caydırıcı sayı göstermesin: U-6 ile birlikte yalnız içinde bulunulan
  aşamanın süresi gösterilir.
- [ ] **S5.2 Seviye sınaması eşlemesi** (K, E27). `onboard.js`: nota turlarının bitmiş saydığı ders listelerine yeni
  Temeller ve Klarino dersleri eklenir (S1.1, S1.2, S2.1); okuma sınaması 4 sorudan 8'e (ikisi süre, ikisi arıza)
  ve `okuma-2…5`'i ayrı ayrı sayar; ezgi dersleri (`ezgi-*`, `ilk-eserler-*`) sınamayla **bitmiş sayılmaz**
  ("istersen" önerilir). Makam turları `<makam>-2` derslerini saymaz.
- [ ] **S5.3 Ünite sınavları** (O). Var olan sınavların adım sırası korunur, yeni adımlar sona eklenir (sınavı
  geçmiş kullanıcıda sınav geçilmiş kalır: `examPassed` kaydı adım sayısına değil geçme kaydına bakmalı; bakmıyorsa
  S0.1 göçünde `placed` yapılır). Eklenecekler: Temeller'e `e-t10` ve `soru` ×5 (okuma); Klarino'ya `e-k3` ve kırılma
  `tech`; Teknik'e `artik` ve `usultap` (usul-3'ten); Makamlar'a iki `<makam>-2` karar kalıbı ve bir geçki; yeni
  `sinav-turku`.
- [ ] **S5.4 Terimler sözlüğü** (O, E26). `sozluk.js`: `{ id, term:{tr,en}, def:{tr,en}, see:[ders|teori|makam] }`;
  ≈ 120 terim (çalgı parçaları, nota işaretleri, perde adları, çeşni adları, makam ve usul terimleri, formlar,
  süslemeler). Tanımlar var olan ders ve Teori metinlerinden derlenir, yeni iddia yazılmaz. Dersler → "Sözlük"
  segmenti; arama (`search.js`) terimleri bulur; ders metinlerinde terimin ilk geçtiği yer noktalı altı çizili,
  dokununca alt panelde tanım (`nav.js` `openSheet`). İşaretleme elle değil: metin çizilirken sözlük terimleri eşlenir
  (Türkçe ek almış biçimler için kök eşleme: terim + en çok 6 harf ek).
- [ ] **S5.5 Bitirme sınavı** (O, E28). `sinav-ustalik` (İleri ünite sınavının yerine değil, ardından): 2 dakikalık
  taksim (dört bölüm), basamak 5'ten bir saz eseri ezberden `tempoPct:100` `min:80`, bir oyun havası eşlikle, makam
  tanıma 8'de 7, deşifre seviye 4 %70, Aksak ve Curcuna'da metronomsuz ritim. Geçince rozet "Usta yolunda" ve son
  kademe raporu (başlangıçtan bugüne `stageGrowth`). Metin: "uygulamanın ölçebildiği her şeyi tuttun; bundan sonrası
  dinlemek, usta icracılardan çıkarmak ve başkalarıyla çalmak" (videolar ve Kulaktan çıkar bağlantısı).
- [ ] **S5.6 Hoca yerine öz denetim adımları** (K). Ölçülemeyen şeyler (duruş, dudak, parmak yüksekliği, omuz)
  için `check` adımı: 4–5 maddelik liste + "ön kamerayla kendine bak" (kamera yalnız ekranda ayna, kayıt yok; izin
  istenir, reddedilirse liste tek başına çalışır). Var olan `durus-nefes` listesi bu türe taşınmaz (adım sırası
  korunur); yeni derslerde kullanılır: `durus-2` (Temeller ortası: bir ay sonra duruş kontrolü), `el-2` (parmaklar
  deliklere yakın, serçeler mandal üstünde). Aralıklı tekrar bu adımları 30 günde bir getirir.

### Önerilen sıra

1. **S0.1, S0.2, S0.4** (altyapı; bunlar olmadan araya ders girmez).
2. **S1.1, S1.2, S1.4, S1.5, S2.1** (sıfırdan başlayanın ilk altı ayı; en büyük eksik burada).
3. **S0.3, S1.6, S4.1** (arşiv ders yoluna bağlanır; eser çalmak başlar).
4. **S3.1, S3.3, S3.8, S3.7** (var olan makam ve usul içeriği derinleşir).
5. **S2.2, S2.3, S2.5, S2.6, S4.6** (teknik ve kulak).
6. **S3.2, S3.4, S3.6, S3.5** (yeni makamlar, geçki, form, şed).
7. **S4.2, S4.3, S4.4, S4.5, S2.4, S4.7** (yöreler, fasıl, saz eserleri, ileri).
8. **S5.1–S5.6** her dalganın sonunda güncellenir; S5.5 en son.

Toplam kaba büyüklük: ≈ 14 hafta kod ve içerik işi. Proje sahibinden karar beklenen yer yok; yalnız iki bilgi notu:
(1) S3.1 ve S5.3 bazı bitmiş dersleri ve sınavları "bir adım eksik" gösterebilir, bunu göçle gizlemek mümkün (S0.1);
(2) yeni ünite "Türkü ve yöreler" Dersler listesine onuncu ünite olarak girer.

Bu bölümle ilişkisi olan eski maddeler: **C1 → S3.1** (beş makamın dersi zaten var, eksik olan etüt),
**C2 → S3.2**, **B1** (Aksak Semâî) S3.7 ve S4.4'ün ön koşulu, **B3** (ritim kalıpları) S1.4 `okuma-2` ile birlikte
yapılır, **B4** S3.7'ye bağlanır, **D1** kural 4 gereği sürer.

## İçerik ve arayüz değerlendirmesi, iş planı (10 Kasım 2026)

Proje sahibinin yönlendirmesiyle (10 Kasım) bu bölüm yalnız **içerik** ve **arayüz/kullanım** gözüyle yazıldı; ürün
yönetimi ve teknik bulgular kenara alındı (bölümün sonunda tek paragraf). Proje sahibi uygulamayı telefonda bir süre
kullandı ve beğendi. **Hocaya gönderilmeyecek:** uzman raporu beklenmiyor, "hocaya sor" diye açık duran sorular
kaynaklarla kapatılacak (D grubu).

Bakılanlar: ders, usul, ritim, makam ve etüt verisi (`lessons.js`, `learn.js`, `usuller.js`, `trainers.js`,
`repertoire.js`, `roadmap.js`), arşivin usul ve makam dağılımı (`notalar/`, 2200 eser), uygulama telefon genişliğinde
(375×812) gezildi. **Bakılamayanlar:** mikrofonla çalınan adımlar (Klarnetle çal, Elle vur'un puanı) ve ders
metinlerinin tek tek müzikal doğruluğu.

### Usul ve ritim öğretimi: ne var

Var, ve kapsamlı; ama Çalış bölümünde ayrı duruyor.

| Yer | İçerik |
|---|---|
| Çalış → Ritim → **Usuller** | 15 usul (8 klasik: Semâî, Sofyan, Düyek, Aksak, Ağır Aksak, Curcuna, Türk Aksağı, Yürük Semâî; 7 oyun havası: Kasap, Sirto, Çiftetelli, Karşılama, Roman, Rumeli, Zeybek). Her usulde dört adım: Dinle ve say → Elle vur (Düm/Tek düğmeleri) → Ezberden vur → Klarnetle çal. "Hangi usul?" kulak sınaması (8 soru). Zaman, darb, düm, tek, çevrim açıklaması. "Bu usulde eserler" arşive bağlı |
| Çalış → Ritim → **Ritim heceleri** | 6 kalıp, 3 seviye (dörtlük, iki sekizlik, sus, ikilik, triole, dört onaltılık); üç hece takımı (meyveler, İngilizce, ta-ti); Kalıplar, Alıştırma, "Hangi ölçü?" |
| Çalış → Ritim → **Ritim** | Metronomla klarnet: 5 düz kalıp (dörtlük, ikilik, sekizlik, noktalı, ters vuruş) ve 15 usul; metronomsuz devam; gecikme ayarı |
| Dersler | 25 ritim adımı: "Ritim: vuruş ve nota değerleri", "Usuller: düm ve tek" (Sofyan, Semâî, Düyek, Aksak), "İç tempo", Trakya ünitesinin her dersinde usul adımı; ritim diktesi ve aksak usullü deşifre |
| Diğer | Usullü metronom, Eşlik (darbuka ve bas, usule oturma ölçümü), günlük çalışmada ritim turu |

### Bulgular — içerik

| # | Bulgu | Öneri |
|---|---|---|
| İ1 | **Usuller ve Ritim heceleri sayfaları derslere bağlı değil.** Hiçbir ders adımı bu sayfaları açmıyor, yol haritasında usul kilometre taşı yok, hoca kartı önermiyor. "Usuller" dersinin metni "önce elinle vur" diyor ama adımı yok; ders dört usulü doğrudan klarnetle çaldırıyor. En iyi ritim içeriğini kullanıcı ancak Çalış'ı kurcalarsa buluyor | Elle vurma ve hece adımları ders adımı olsun (A1–A4) |
| İ2 | **Ritim geç geliyor.** İlk ritim dersi Başlarken'in 11. (son) dersi; usul 27. derste (Teknik'in 8.'si). Oysa heceleri söylemek ve usul vurmak klarnetsiz yapılır; ses çıkaramayan ilk günlerin en iyi işi | Hece ve usule giriş Başlarken'e alınsın (A2, A3) |
| İ3 | **Öğretilen usuller arşivle örtüşmüyor.** Arşivde 88 usul adı var, öğretilen 15. Öğretilmeyenlerin en sıkları: Aksak Semâî 128 eser, Nim Sofyan 99, Sengin Semâî 72, Devr-i Hindî 58, Müsemmen 38 (395 eser, arşivin %18'i). Kullanıcı bu eserleri açınca usulünü öğrenecek yer yok | Beş usul eklensin (B1); eser sayfasında usul tanıtımı (B2) |
| İ4 | Dersli usuller az: 15 usulün Türk Aksağı, Yürük Semâî, Ağır Aksak'ı hiçbir derste yok; Curcuna yalnız "İç tempo"da bir adım | Usul dersi üçe bölünsün (A2) |
| İ5 | Ritim kalıpları başlangıçta kalıyor: senkop, noktalı sekizlik + onaltılık, sekizlik + iki onaltılık, bağlı nota, 6/8 üçlemeleri yok. Oyun havalarının ezgileri tam bu kalıplardan kurulu | Hecelere 4. ve 5. seviye, Ritim'e aynı kalıplar (B3) |
| İ6 | Usullü etüt dağılımı dengesiz: usul etiketi taşıyan 14 etüdün 4'ü Aksak, 3'ü Roman; Düyek, Curcuna, Türk Aksağı, Yürük Semâî etüdü yok | Birer kısa etüt (B4) |
| İ7 | Makam: veride 20 makam var, dersi olan 10 (Rast, Uşşak, Hüseynî, Hicaz, Nihâvend, Kürdî, Saba, Segâh, Hüzzam, Nikriz). Trakya girişi "Karcığar öne çıkar" diyor ama Karcığar dersi yok. Arşivde sık olup veride hiç olmayanlar: Muhayyer 67, Bûselik 57, Acemkürdî 37, Evç 33 | Önce verisi hazır beş makama ders (C1), sonra yeni makamlar (C2) |
| İ8 | "Hocaya sor" diye açık 22 soru ve derslerdeki "uzman görmeli" notları artık cevap beklemiyor | Kaynaklarla kapat (D1) |

İyi olanlar: usul metinleri zaman ile darbı ayırıyor ve oyun havası kalıplarının "yaygın bir çalış" olduğunu söylüyor;
dört adımlı sıra (dinle, vur, ezberden vur, çal) pedagojik olarak doğru; dersler ölçümle geçiliyor; ders, etüt, eşlik
ve arşiv aynı usul kimliklerini kullanıyor, yani bağlamak ucuz.

### Bulgular — arayüz ve kullanım

Ritim ekranları (yeni bakıldı):

| # | Bulgu (telefon genişliğinde görüldü) | Öneri |
|---|---|---|
| R1 | Usuller'de usul listesi yatay şerit: 15 usulün iki buçuğu görünüyor, seviye başlığı kesik ("LANGIÇ"), ilerleme dört küçük nokta | Telefonda iki sütunlu ızgara ya da açılır liste; ilerleme "2/4" |
| R2 | Adım düğmeleri ekranın dibinde, adımın sahnesi (talimat, Düm/Tek düğmeleri, sonuç) onların altında; alt menüye yapışık, kaydırmadan zor görülüyor | Adım seçilince sahne görünür alana gelsin; Elle vur'da Düm ve Tek ekranın alt yarısını kaplasın (başparmakla vurulacak) |
| R3 | Ritim sekmesi neredeyse boş bir ekran: 20 seçenekli tek açılır liste, kalıbın notası gösterilmiyor | Hecelerdeki gibi notalı kalıp kartları; usuller ayrı grup |
| R4 | Üç ritim sayfası (Ritim, Usuller, Ritim heceleri) birbirine bağlantısız, hangisinin önce geldiği yazmıyor | Ritim grubunun başında üç adımlı yol: heceler → usul → klarnetle |
| R5 | Usul seçince öğrenme temposu birimi "dörtlük/dk" ya da "sekizlik/dk"; başka yerlerde "vuruş/dk" | Tek dil: "vuruş/dk", yanında küçük nota simgesi |

Genel (önceki turdan, geçerli):

| # | Bulgu | Öneri |
|---|---|---|
| U1 | Açılış ekranı Akort; sıradaki adımı söyleyen hoca kartı Dersler'in içinde | "Bugün" ana ekranı: hoca kartı, günlük hedef, seri, tek düğme |
| U2 | Dersler'de üç giriş birden (hoca kartı, "Bugünün çalışması", 12 satırlık liste; 11'i "kilitli") | Yeni kullanıcıda liste katlı; "kilitli" yazısı yerine simge |
| U3 | Çalış'ta eşit ağırlıkta 20 kart | Üstte "Son kullandıkların" ve "Sana önerilen"; seviyenin üstündekiler soluk |
| U4 | Ayarlar tek sayfa, 3 400 px kaydırma | Alt sayfalar |
| U5 | Dokunma hedefleri küçük: Akort/Parmak geçişi ve makam seçici 35 px, AEU/İcra/Kendim 34 px (öneri en az 44 px); 60'tan fazla yerde yazı 12,5 px ve altı | Klarnet elde, telefon sehpada: küçük hedef burada normalden pahalı |
| U6 | Boş durum metinleri caydırıcı ("hepsi 15 ay sürer", "günde ort. 0 dk") | İlk hafta tahmini gizle, ilk hedefi yaz |
| U7 | Çalarken uzaktan okuma zor: sonuç ve geri bildirim küçük yazıyla | "Sehpa görünümü": büyük nota, büyük sapma |
| U8 | Her sayfada üç satır açıklama ve "devamı", ayrıca "Nasıl kullanılır?" | İlk üç açılıştan sonra açıklamayı gizle |

### İş listesi (öncelik sırasıyla)

Büyüklük: K ≈ yarım gün, O ≈ 1–2 gün, B ≈ 3 gün ve üstü. Hepsi kod işi; proje sahibinden yalnız sondaki iki karar.

**A — Ritim ve usulü derslere bağla (ilk iş; ≈ 4 gün)**

- [x] **A1 Ders adımı: usul vurma** (O, İ1; yapıldı 10 Kasım, `usultap` adımı, `usuller.js`; mikrofonsuz, puan ve sınır sayfayla aynı, kayıt ortak `usul.prog`): Usuller sayfasının Dinle ve say, Elle vur, Ezberden vur adımları ders
  içinde çalışsın (yeni adım türü; puan ve geçme sınırı sayfadakiyle aynı, ilerleme ortak). Kabul: derste geçilen adım
  Usuller sayfasında da geçilmiş görünür
- [~] **A2 Usul derslerini yeniden kur** (O, İ2, İ4; 10 Kasım: yeni `usul-giris` Başlarken'in sonunda ve `usul-2` Teknik'te eklendi, ders sayısı 89; kalan: "Düyek ve Aksak"ta önce vur sonra çal ve Trakya derslerinde elle vurma, bunlar var olan ders adım sırasını kaydırır, yeni ders kimliğiyle çözülecek): "Usule giriş: Semâî ve Sofyan" Başlarken'e (klarnetsiz: dinle,
  vur); "Düyek ve Aksak" bugünkü yerinde, önce vur sonra çal; yeni "Türk Aksağı, Yürük Semâî, Curcuna" dersi.
  Trakya derslerinde usul adımından önce elle vurma. Var olan ders kimlikleri değişmez (ilerleme korunur)
- [x] **A3 Ders adımı: ritim hecesi** (K, İ1, İ2; yapıldı 10 Kasım: `hece` adımı (söyle, vur, hangi ölçü) ve yeni `ritim-hece` dersi, nota okumadan sonra ve klarnetle ritimden önce; var olan `ritim-temel`'in adım sırası değişmedi): "Ritim: vuruş ve nota değerleri" dersine hecelerle söyleme ve
  "Hangi ölçü?" adımı; ders nota okumadan hemen sonraya
- [x] **A4 Yol haritası ve hoca kartı** (K, İ1; yapıldı 10 Kasım: taşlar "4 usulü ezberden vur" (Başlangıç), "8 usulü ezberden vur" ve "Hangi usul? 6/8" (Temel çalgıcı aşaması, usul dersleri orada); ritim puanı geriledi ve 4 usul ezberlenmemişse kart Usuller'i açar): kilometre taşları "4 usulü ezberden vur" (Başlangıç), "8 usul" (Orta),
  "Hangi usul? 8'de 6"; hoca kartı ritim puanı zayıfsa Usuller'i önersin
- [x] **A5 Günlük çalışmada usul** (K; yapıldı 10 Kasım: usul dersleri bitmişse üç günden biri ritim turu öğrenilmiş bir usulle): ritim turu bugün yalnız dörtlük ya da sekizlik; öğrenilmiş usullerden biri de
  sıraya girsin

**R — Ritim ekranlarının arayüzü (A ile birlikte; ≈ 2 gün)**

- [x] **R-1 Usuller telefonda** (O, R1, R2, R5; yapıldı 10 Kasım: iki sütunlu liste, "2/4 adım", adım seçilince sahne ekrana gelir, Düm/Tek düğmeleri ekran boyuna göre büyür, birim "vuruş/dk (♪/♩)"): ızgara liste, sahne görünür alanda, büyük Düm/Tek düğmeleri
- [x] **R-2 Ritim sekmesi** (K, R3; yapıldı 10 Kasım: açılır liste yerine notalı kalıp kartları ve düm-tek ızgaralı usul kartları, seçili kalıp başlat satırında): notalı kalıp kartları
- [x] **R-3 Ritim grubu yolu** (K, R4; yapıldı 10 Kasım: grup sırası heceler, usul, klarnetle; kartlarda 1 · Ağızla, 2 · Elle, 3 · Klarnetle): heceler → usul → klarnetle

**B — Usul ve ritim içeriğini genişlet (≈ 1 hafta)**

- [~] **B1 Beş yeni usul — dördü eklendi (11 Kasım), Aksak Semâî eksik** (O, İ3): TDV şemaları basılı cilt PDF'lerinden okundu (ayrıntı `KAYNAKLAR.md` bölüm 4). Eklenenler: Nîm-sofyan 2/4, Sengin Semâî 6/4, Devr-i Hindî 7/8, Müsemmen 8/8 (Müsemmen'in şemasındaki "Düm 2-3" yazısı belirsiz, ⚠️). Aksak Semâî eklenmedi: şemadaki nota değerleri 9 zaman veriyor, usul 10 zamanlı; çözmek için ikinci kaynak ya da hoca lazım (128 arşiv eseri bu usulde). Aşağıdaki not eklemeden önceki durumdur: TDV maddelerinin vuruş şemaları resim; metin olarak okunabilen kaynaklarda (TDV Usul ve Nîm-sofyan maddeleri, Wikipedia, CompMusic) yalnız zaman sayıları var: Nim Sofyan 2, Aksak Semâî 10, Sengin Semâî 6, Devr-i Hindî 7, Müsemmen 8. Nîm-sofyan için TDV "birinci darb kuvvetli, ikincisi hafif" diyor, mertebeleri 2/8, 2/4 (en çok kullanılan), 2/2. Düm-tek dizisini yalnız chromatone.center veriyor, o da yalnız Aksak Semâî (X.x.x.x.x., 2+2+2+2+2, 10/16) ve Devr-i Hindî (X...x.., 4+3, 7/16) için, kaynak göstermeden. Sengin Semâî ve Müsemmen için hiçbir kaynakta kalıp yok. Kural gereği doğrulanmayan kalıp eklenmedi. Yol: TDV maddelerindeki şema resimlerine bakmak (Nîm-sofyan, Aksak semâî, Sengin semâî, Devr-i hindî, Müsemmen) ya da proje sahibi chromatone kalıplarını geçici olarak kabul eder. Orijinal not: Nim Sofyan 2/4, Aksak Semâî 10/8, Sengin Semâî 6/4, Devr-i Hindî 7/8, Müsemmen 8/8.
  Vuruş kalıpları TDV İslâm Ansiklopedisi maddelerinden alınır, `KAYNAKLAR.md`'ye yazılır; kaynakta doğrulanmayan kalıp
  eklenmez. Sonra bakılacaklar: Evfer, Raks Aksağı, Oynak, Devr-i Turan
- [x] **B2 Eser sayfasında usul** (K, İ3; yapıldı 11 Kasım: eser sayfasında usul kutusu; bilinen usulde ad, ölçü, düm-tek satırı ve "Bu usulü öğren" (Usuller'de o usulü açar); bilinmeyen usulde "uygulama bu usulün vuruş kalıbını bilmiyor" ve metronomun ölçüyü hangi gruplara bölüp çaldığı. Bugünkü davranış: bilinmeyen usulde ölçünün vuruş grupları, ilk grup düm, ötekiler tek (`archive.js` `ARCH_GROUPS`), gerçek kalıp değil): arşivden eser açılınca usulün adı, düm-tek satırı ve "bu usulü öğren"
  bağlantısı; uygulamanın bilmediği usulde bunu açıkça yazsın. Önce bugünkü davranışa bakılacak (bilinmeyen usulde
  metronom ne çalıyor)
- [ ] **B3 Ritim kalıpları** (O, İ5): hecelere 4. seviye (noktalı dörtlük + sekizlik, sekizlik + iki onaltılık, senkop)
  ve 5. seviye (noktalı sekizlik + onaltılık, bağlı nota, 6/8); aynı kalıplar Ritim sekmesinde ve ritim diktesinde
- [ ] **B4 Usul etütleri** (O, İ6): Düyek, Curcuna, Türk Aksağı, Yürük Semâî'de birer kısa etüt (kendi yazımımız ya da
  kamu malı ezgi)
- [ ] **B5 Teori: velvele ve mertebe** (K): usulün süslenerek vurulması ve ağır/yürük mertebeler kısa okuma metni

**U — Genel sadeleştirme (≈ 1,5 hafta)**

- [x] **U-1 Dokunma hedefleri ve yazı boyu** (O, U5; yapıldı 10 Kasım: `app.css` sonunda dokunmatik ve dar ekran bloğu; düğme, seçici, sekme, aralık çubuğu en az 44 px, yardım ve açıklama yazıları 14 px, büyük harfli etiketler 12,5 px, alt menü 12,5 px; Akort, Dersler, Çalış, Usuller, Ritim, Eşlik 375 px genişlikte ölçüldü, kalan küçük yazı: bazı arşiv ve düzeltme ekranı öğeleri, ölçülmedi): etkileşimli her öğe en az 44 px; gövde yazısı en az 14 px. En
  ucuz ve en görünür iyileştirme; A'dan önce de yapılabilir
- [ ] **U-2 "Bugün" ana ekranı** (B, U1): hoca kartı, günlük hedef, seri; Akort ikinci sırada. Tasarım önce proje
  sahibine gösterilir
- [ ] **U-3 Dersler ve Çalış'ta odak** (O, U2, U3)
- [ ] **U-4 Sehpa görünümü** (O, U7): önce Uzun ton, ders adımları ve usul vurma
- [ ] **U-5 Ayarlar alt sayfaları** (O, U4)
- [ ] **U-6 Boş durumlar ve açıklamalar** (K, U6, U8)

**C — Makam içeriği (sonra)**

- [ ] **C1 Verisi hazır makamlara ders** (B, İ7): Karcığar, Bayâtî, Hicazkâr, Mâhur, Kürdîlihicazkâr (dizi, seyir ve
  çeşni verisi var; ders ve etüt yok)
- [ ] **C2 Yeni makamlar** (B, İ7): Muhayyer, Bûselik, Acemkürdî, Evç

**D — Hoca olmadan kapanacaklar**

- [ ] **D1 Açık soruları kaynakla kapat** (O, İ8): `DENEME-LISTESI.md` bölüm 2'deki 22 soru tek tek `KAYNAKLAR.md` ve
  TDV'ye göre karara bağlanır; kaynakların ayrıştığı yerde uygulama iki görüşü de yazar. Çeyrek ses parmaklarında
  ölçüt kullanıcının kendi çalgısındaki işareti olur (özellik var)
- [ ] **D2 Uzman kontrolü ekranı** (K): Ayarlar'ın ana listesinden çıkar, "Gelişmiş" altına iner; belgelerdeki "uzman
  görmeli" notları D1 bittikçe silinir

### Proje sahibinden beklenen kararlar

1. **"Bugün" ana ekranı (U-2):** açılış Akort'tan hoca kartına taşınsın mı? Alt menü sırası değişir.
2. **Yeni usuller (B1):** önerilen beşli uygun mu, öne almak istediğin başka usul var mı?

### Kenara alınanlar (10 Kasım, proje sahibi: "onları boşver")

Ürün ve teknik bulgular bu planda yok; unutulmasın diye başlıkları: ilerleme yalnız `localStorage`'da ve yazma hatası
sessiz (`app.js:20`), yedek elle; genel hata yakalama ve "sorun bildir" yok; `index.html`, `sw.js` ve
`scripts/build-web.js` dosya listeleri elle tutuluyor; service worker'da ağ zaman aşımı yok; lisans kararı ve mağaza
yayını (`LISANSLAR.md`, `TODO.md`). Freemium ertelendi (aşağıda madde 2).

## ÖNCELİKLİ — proje sahibinin istekleri (3 Kasım 2026)

Proje sahibi: "Uygulama seviye belirletip ona göre adım adım ilerletmeli; bir hoca gibi elinden tutup içerik arasında
kademe kademe götürmeli. Uygulama freemium olabilir, bazı yerler premium satılabilir." Bu iki madde diğer işlerin önünde.

### 1. Kademeli hoca akışı — kod işleri tamamlandı (4 Kasım 2026), gerçek klarnetle deneme kaldı

**Başlangıçtaki durum (3 Kasım):** 87 ders düz bir listede, dersler bitirilince açılıyor ("tüm dersleri aç" kutusu her şeyi açıyor).
"Bugünün çalışması" ısınma, tekrar ve bilinen konulardan her gün kuruluyor. Yol haritasında altı aşama ve ölçülen
kilometre taşları var ama bunlar yalnızca gösterge: hiçbir dersi kilitlemiyor. Ünite sınavı yalnızca rozet veriyor.
Kullanıcıya "şimdi şunu çalış, çünkü…" diyen tek bir yönlendirici yok; ne yapacağını listeden kendisi seçiyor.

**Hedef:** Uygulama seviyeyi ölçsün, kullanıcıyı her gün tek bir sıradaki adımla, nedenini söyleyerek götürsün;
bir kademeyi ancak o kademenin becerileri ölçülerek tuttuğunda (sınav ve kilometre taşları) sonrakine geçirsin.
Hocanın yaptığı gibi: önce ısınma ve tekrar, sonra yarım kalan iş, sonra yeni konu; zayıf kalan beceriye geri dönme.

Aşamalar:

- **A. Seviye belirleme** — yapıldı (3 Kasım). Karşılamada isteğe bağlı çalma sınaması: 12 nota dört grupta (pes/orta,
  boğaz, register geçişi, klarino); geçilen grupların Temeller ve Register dersleri bitmiş sayılır, ilk notalarda
  zorlanana Başlarken önerilir. Yalnızca notanın çıktığı ölçülüyor (ses kalitesi ve akort değil). Dersler listesinin
  altındaki "Seviyemi yeniden ölç" sınamayı karşılama dışında açar. Sınama önce nota okumayı yoklar (dizekte 4 nota,
  adı seçilir; mikrofonsuz): 3'ten azı doğruysa Başlarken'in "Nota okuma" dersi bitmiş sayılmaz ve kart onu önerir.
  Notalardan sonra ritim sınaması: metronomla iki kısa tur (dörtlük ve sekizlik, 60 vuruş/dk, 4 ölçü; Başlarken'in
  "Ritim" dersinin adımlarıyla aynı eşik, 55 ve 50). Ölçülen bir tur eşiğin altındaysa o ders bitmiş sayılmaz ve kart
  onu önerir; tur geçilebilir ve yeniden denenebilir (`SK.rhythmTry`, `onboard.check.rhythm`). Yeniden ölçmede okuma
  ya da ritim tutmazsa önceki sınamanın bitmiş saydığı (çalınmamış) ders yeniden açılır. Ritim yalnızca Başlarken'deki
  dersi etkiliyor; Teknik'teki dil vuruşu ve usul dersleri sınamaya bağlı değil. Gerçek cihazda (hoparlör gecikmesi,
  kulaklıksız metronom) denenmeli. Makam sınaması (4 Kasım): "Makam çalışıyorum" seçene (yeniden ölçmede de,
  `onboard.level`; bu kayıttan önce seçenlerde "bütün dersler açık" ayarına bakılır) ritimden sonra üç tur: Rast dizisi,
  Uşşak dizisi, en çok 40 sn'lik Hicaz seyri. Notaların hiçbiri çıkmadıysa sorulmaz. Adımlar derslerin kendi
  değerlendiricileridir (`SK.stepTry`, dizi eşiği dersten; seyir eşiği Taksim 2'nin Hicaz adımı gibi 60). Kural: turlar
  sırayla, tutmayan tur bölümü bitirir, baştan geçilen turların dersleri bitmiş sayılır (Rast: `rast-giris`, `rast`;
  Uşşak: `ussak`; Hicaz seyri: `huseyni`, `hicaz`). Geçilmeyen tur karar vermez; ölçülüp tutmayan turun önceki sınamadan
  kalan kaydı silinir (ders yeniden açılınca ünite sınavının placed kaydı da). Yeniden ölçme `lesson.all`'ı değiştirmez.
  Makamlar ünitesinin 21 dersinin yalnız 5'i sayıldığı için Makam sınavı geçilmiş sayılmaz: İleri'nin kapısı rehberli
  ilerlemede kapalı kalır; Makam ünitesinin kapısı ise bir makam dersi bitmiş sayılınca açılır (`gateFor`). Sonuç
  `onboard.check.makam`. **Uzman görmeli:** bu makam ve ders eşlemesi (özellikle ölçülmeyen Hüseynî'nin sayılması, Hicaz
  seyrinin temel makamların yeterli göstergesi olup olmadığı), üç turun seçimi, eşikler. Gerçek klarnetle denenmeli
- **B. "Hocan diyor ki" kartı** — yapıldı (3 Kasım). Dersler'in en üstünde tek bir sıradaki adım ve nedeni
  (`roadmap.js` `coachNext`): yarım kalan ders/sınav → bugünün çalışması (ısınma ve vadesi gelen tekrarlar; yalnız
  gerçekten çalınmış ders varsa) → dersleri bitmiş ünitenin sınavı (hangi üniteleri açacağıyla) → kademenin dersleri
  bittiyse eksik kilometre taşı (şu anki değer ve hedef, alıştırmaya git; takılan taş kartı tutmaz, aşağıda) → yeni
  ders/yeni ünite → kalan kilometre taşları. Liste kartın altında duruyor
- **C. Kademe kapısı (rehberli mod)** — yapıldı (3 Kasım). `lessons.js` `GATE_AFTER`/`gateFor`: Temeller ←
  Başlarken sınavı, Register ← Temeller sınavı; teknik, hız, süsleme, makam ve Trakya ← Register sınavı; İleri ← Makam
  sınavı. Kilitli derse dokununca hangi sınavın eksik olduğu ve sınava giden düğme. Dersler listesinin altında "rehberli
  ilerleme" kutusu (varsayılan açık, `lesson.guided`); "tüm dersleri aç" ve bitmiş dersler eskisi gibi. O üniteden
  önceden ders bitirmiş kullanıcıda kapı yok. Karşılamada atlanan/sınamayla geçilen ünitelerin sınavı da geçilmiş sayılır.
  `nextLesson` ders kalmadıysa açık sınavı döndürür (önceden "bütün dersleri bitirdin" diyordu). Uzman görmeli: kapı
  sırası (ör. makamın Register sınavına bağlı olması, İleri'nin Makam sınavına); kilometre taşları henüz kapı değil,
  yalnız kartta öneri. Rehberli modda ders listesi de odaklanır: bitmiş üniteler ("✓ 12 ders") ve henüz açılmamış
  üniteler ("🔒 Temeller sınavından sonra") katlanır, yalnız üzerinde çalışılanlar açık
- **D. Zayıf beceriye dönüş** — yapıldı (3 Kasım), `roadmap.js` `weakSkill`: uzun ton puanı, ses kararlılığı
  (yayılım), ritim ve taksim puanında son 4 haftanın ortalaması önceki 4 haftaya göre eşikten (8 puan; yayılımda 0,15
  koma) fazla kötüleştiyse ve o beceri bugün çalışılmadıysa, kart ısınmadan sonra "önce bunu toparlayalım" deyip
  alıştırmayı açar. Her pencerede en az 3 kayıt ister. Ders özetindeki "en az farkla geçilen adım" da aralıklı
  tekrara bağlandı (`reviewStep`, `stepMargin`): gerçekten çalınmış derste üç tekrardan ikisinde o adım gelir. Eşikler
  gerçek kullanımla gözden geçirilmeli
- **E. Kademe raporu** — yapıldı (3 Kasım). Yol haritasındaki bir aşama (dersleri ve kilometre taşları) bitince hoca
  kartı bir kez rapor gösterir: kaç günde tamamlandığı (gerçekten çalınmış derslerin ilk ve son bitiş günü), ölçülen
  kilometre taşları ve sıradaki kademenin hedefi; "Sıradaki adım" ile kapanır (`rm.reported`). Raporda kademe başından
  sonuna beceri farkı da var (`stageGrowth`): kademenin ilk ve son ders günü arasındaki uzun ton puanı, ses kararlılığı,
  ritim ve taksim kayıtlarının ilk 3 ve son 3 ortalaması (en az 4 kayıt olan beceriler). Kayıt geçmişi 100 kayıtla
  sınırlı olduğu için uzun kademelerde başlangıç kayıtları düşmüş olabilir
- **Uçtan uca denetim** — yapıldı (4 Kasım). Geçici benzetimle (depoda değil) sıfırdan, okuması ya da ritmi tutmayan,
  notaları geçen, makam turlarını geçen, "tüm dersleri aç", rehberli kapalı, eski kullanıcı ve oyun havası hedefi son derse
  kadar yürütüldü; rastgele durumlarda ve yolun ortasında yeniden ölçmede de çıkmaz çıkmadı. Düzeltilenler: yeniden ölçme
  gerçekten çalınmış dersi `placed` yapıyordu (sonraki ölçme onu silebiliyordu; eski kayıtlarda ayırt edilemez), dersleri
  gerçekten bitmiş ünitenin sınavını geçilmiş sayıyordu, ölçmeden geçince Başlarken'i, okuma ve ritim dersini bitmiş
  sayıyordu; yeniden ölçmede "Başlarken'den başla" etkisizdi, tutmayan nota grubunun kaydı kalıyordu. Kart, sınavla
  açılmayan üniteleri "açılır" diye sayıyordu; ders sonu düğmesi kartla aynı sırayı söylemiyordu; oyun havası hedefinde kart
  Makam'ı Trakya'dan önce götürüyordu; rapor "bütün kademeler bitti" diyebiliyordu. Gerçek klarnetle denenmedi.
  **Uzman görmeli:** İleri'nin ilk dersi zincirle Trakya'nın son dersine bağlı (`unlocked` son satırı): Makam sınavı tek
  başına İleri'yi açmıyor, kapı listesinde böyle yazmıyor. Denetimin bulduğu takılmalar aşağıdaki maddede
- **Takılmaların giderilmesi** — yapıldı (4 Kasım). Kapılar (`gateFor`, `GATE_AFTER`) ve eşikler değişmedi; taşların kapı
  olması `kapi-taslar` hoca sorusunda.
  **Kilometre taşı:** kart tutmayan taşta sonsuza kadar beklemiyor. Ölçüt `roadmap.js` `MILE_STUCK` (`triedDays:2`,
  `waitDays:3`), hesap `mileStuck`. Sayaç kademenin son dersinin bitiş gününden sonra başlar. Taş iki ayrı günde denenip
  tutmadıysa ya da üç çalışılan günde (en az 60 sn, seriyle aynı) tutmadıysa takılmış sayılır; kademede bekleyen n. taşa 3×n
  gün tanınır (`roadmapPace` de taş başına bir derslik çalışma, ders başına ≈ 3 gün sayar). Aynı günün denemeleri bir gün
  sayılır: "bugün olmadı, yarın yine dene". Çalışılmayan gün saymaz: uzun aradan dönene kart taşı yine söyler. Kart sıradaki
  takılmamış taşa (dersleri bitmiş sonraki kademeninkiler dahil), o da yoksa sıradaki derse geçer; takılan ilk taş ders ve
  sınav kartında "Yan öneri" olarak kalır (`side`, alıştırma düğmesiyle), taş tutunca kalkar. Ders kalmadıysa kart yine
  taşı söyler. Deneme günleri var olan kayıtlardan: `long.hist`, `rhythm.hist` (yalnız alıştırma; ders denemesi bu taşları
  yükseltmez), `quiz.rounds`, `sight.hist`, `dict.hist`, `tech.best` (yalnız temiz çalışlar yazılır), `orn.hist`,
  `seyir.hist`, `band.hist`. Kulak eşiği, makam tanıma ve iki etüt taşının deneme kaydı yok: bunlar yalnız günle bırakılır.
  Değerler gerçek kullanımla gözden geçirilmeli.
  **Bugünün çalışması:** `lessons.js` `dailySettled`: bütün adımların sonucu varsa (geçti ya da tutmadı) kart günü bırakır,
  sıradaki adıma geçer. Bir adımın bir kez denenmesi yeter, çünkü plan ertesi gün yeniden kurulur. Günlük çalışma yine bitmiş
  sayılmaz: `lesson.dailyDone`, rozet değişmez, listede 6/8 gibi görünür. Sonuç vermeyen adım (nota tutulamayan uzun ton,
  "Durdur") denenmiş sayılmaz; kart o gün günlükte kalır, liste altta açıktır.
  **Aralıklı tekrar:** `srsSync` dersi müfredattan kalkmış ya da ilerlemesi silinmiş (yeniden ölçmenin açtığı ders) kaydı
  atar; yeniden ölçme sonunda da çalışır. Yedek bütün anahtarları birlikte getirdiği için ilerlemesi olan kayıt korunur: adım
  eklendiği için bitmemiş sayılan eski dersin aralığı kalır.
  **Yeniden ölçmede sonraki turlar: kayıt silinmiyor, davranış değişmedi.** Boğaz tutmazsa Register ve Klarino, Rast ya da
  Uşşak tutmazsa sonraki turların `placed` kaydı kalır. Neden: (1) bu turlar çalınmadı, yani yeni ölçüm yok; kayıt önceki
  sınamanın gerçek ölçümünden geliyor ve `onboard.js`'in okuma, ritim, nota ve makam bölümlerindeki kural aynı ("geçilmeyen
  tur karar vermez"); (2) silmek geri alınamaz, kötü bir günde tek tur birkaç dersi siler; (3) benzetimde kalan kayıt çıkmaz
  yapmıyor: kart önce tutmayan turun dersine götürüyor ve yol sonuna varıyor; sonuç ekranı da "o turun derslerini açık
  bıraktık" diyor. Pedagojik yanı (bir grubu çalamayan sonrakini de çalamaz mı) `sinama-sonraki` hoca sorusunda.
  Doğrulama: geçici benzetimle (depoda değil; gerçek `onboard.js` `finish` ile) takılan taşlar, günlük, eski veri, yeniden
  ölçme, beş ayarda baştan sona yürüyüş ve 3000 rastgele durum; tarayıcıda kart, yan öneri ve telefon genişliği. Gerçek
  klarnetle denenmedi

### 2. Freemium — ertelendi (proje sahibi: "ileride bakarız", 3 Kasım 2026)

Şimdilik öncelik değil; `premium.js` kapalı kalıyor. Aşağıdaki öneri ve sorular, konu yeniden açılınca başlangıç noktası.

**Önce lisans engelleri** (`docs/LISANSLAR.md`): ücretli ya da uygulama içi satışlı sürümde SymbTr nota arşivi (CC
BY-NC-SA, ticari kullanım yok) ve WFG parmak tabloları (açık lisans yok) izin alınmadan kullanılamaz; neyzen.com ve
projetsm.com için de izin gerekir. Bu izinler çıkmadan ücretli sürüm yayımlanmamalı. Seçenekler: MTG ve WFG'den yazılı
izin; ya da bu içerikleri yalnız ücretsiz katmanda tutmak da yetmez (NC şartı uygulamanın tamamının ticari olmasına
bakar, hukuki görüş alınmalı).

**Önerilen ayrım (karar proje sahibinin):**

- Ücretsiz: akort (AEU/icra, makam bağlamı), parmak şeması ve tablosu, Başlarken ve Temeller üniteleri, seviye
  sınaması ve hoca kartı (ilk kademe), metronom ve dron, günlük çalışma (ilk kademe içeriğiyle)
- Premium: Register'dan sonraki üniteler (teknik, hız, süsleme, makam, Trakya, ileri) ve sınavları, eşlik grubu,
  kulaktan çıkar, Çevir (nota okuyucu), kayıt karşılaştırma ve haftalık gelişim, taksim değerlendirmesi
- Teknik: ödeme Google Play Billing / App Store uygulama içi satın alma ile (Capacitor eklentisi, ör. RevenueCat ya da
  cordova-plugin-purchase); sunucu yok, satın alma cihazda mağazadan doğrulanır. Web sürümü (PWA) ücretsiz kalabilir ya
  da yalnız tanıtım olur. Kodda tek bir `entitlement` katmanı (premium mu) ve özellik başına kapı; kapıda "neden
  premium, ne kazanırsın" ekranı

**Hazırlık yapıldı (3 Kasım), kapalı:** `premium.js` (`FREEMIUM.enabled = false`): premium üniteler (`units`) ve
sekmeler (`tabs`) yukarıdaki öneriye göre listelendi. Açılınca premium ünitelerin bitmemiş dersleri "tüm dersleri aç"
ile bile açılmaz (bitmiş dersler açık kalır), listede "★ Premium" diye katlanır, hoca kartı ücretsiz bölüm bitince
"Premium hakkında" der; premium sekmede içerik yerine bilgi kutusu durur ve modül başlatılmaz. Satın alma yok:
`setPremiumOwned(true)` ileride mağazanın doğruladığı hakla çağrılacak. Kararlar gelince yalnız bu dosyadaki listeler
ve ödeme eklentisi değişir. Tarayıcı konsolunda `FREEMIUM.enabled = true` ile denenebilir.

**Proje sahibine sorular:** (1) Abonelik mi (aylık/yıllık) tek seferlik satın alma mı, fiyat? (2) Hangi bölümler
premium (yukarıdaki öneri uygun mu)? (3) Reklam olacak mı (öneri: yok)? (4) SymbTr ve WFG için izin istenecek mi,
yoksa ticari sürümde arşiv ve WFG tabloları çıkarılıp yerine kendi içerik mi konacak? (5) Play Console ve App Store
geliştirici hesapları hazır mı? Bu cevaplar gelmeden ödeme kodu yazılmayacak; kademe akışı (madde 1) premium ayrımına
uygun kurulacak (kademe = satış sınırı olabilir).

## Uzman inceleme bulguları — aşamalar tamamlandı, kalanlar uzmana ve örneklere bağlı (2 Kasım 2026)

Bir Türk musikisi ve Sol klarnet uzmanı gözüyle yazılmış inceleme listesi. Yeni özellikten önce mevcut içeriğin müzikal
doğruluğu, gerçek Sol klarnete uygunluğu ve eğitim kalitesi. Çalışan özellikler bozulmayacak, mimari gereksiz yere
değişmeyecek, mobil uyum korunacak.

**Yöntem:** Tek seferde değiştirilmeyecek. Önce kod incelenip her madde doğrulanacak; her madde için "mevcut durum /
önerilen çözüm" listesi çıkarılıp P0–P1–P2 sırası kesinleşecek, sonra aşama aşama uygulanacak. Her aşamanın sonunda:
değişen dosyalar, yapılanlar, yapılan denetimler (projede test yok, bkz. kullanıcı kararı; tarayıcıda deneme ve ölçüm
betikleri) ve gerçek klarnetle denenmesi gerekenler ayrıca yazılacak. Emin olunmayan müzikal bilgi kesin gibi sunulmayacak;
teori, icra pratiği ve öğretmen tavsiyesi ayrı gösterilecek; doğrulanmamış her şey açıkça işaretlenecek.

### Kod incelemesi: mevcut durum ve çözüm

| # | Madde | Mevcut durum (kodda doğrulandı) | Önerilen çözüm | Öncelik |
|---|---|---|---|---|
| 1.1 | Gerçek kayıtla ses analizi | `audio-check` Iowa'nın gerçek Si♭ klarnet kayıtlarında 138/139 nota doğru (pp/mf/ff). Gürültü, telefon mikrofonu, vibrato ve Sol klarnetin pes bölgesi (duyulan Si2–Re3) hiç denenmemiş; betiğin zinciri uygulamadaki oktav korumasını içermiyor. Türk Sol klarneti kaydı yok | Betiğe koşul sınaması: gerçek kayıtlara telefon mikrofonu süzgeci, gürültü (SNR 20/10 dB), vibrato, oda yankısı ve 3 yarım ses pesleştirme uygulanır; sonuç "gerçek tını + benzetilmiş koşul" diye ayrı raporlanır. Zincir uygulamayla eşitlenir. Çıkan hatalar perde bulucuda düzeltilir | P0 |
| 1.2a | Koma işaretlerini ayırma, Leland çizgili bemol | 9 değiştirici sınıfı, kalıp eşlemesi (Jaccard). Leland'ın çizgili bemolü küçük boyutta düz bemol okunabiliyor (backlog'da bilinen) | Yazı tiplerinden çizilen işaretlerle karışıklık tablosu; çizgili/düz bemol için ayırıcı özellik (sapı kesen çizgi) | P0 |
| 1.2b | Güven puanı | Notada `conf` var, arayüzde yalnızca <0,6 "sarı" | Seçili notada ve özet satırında güven yüzdesi; çipin açıklamasında yüzde | P0 |
| 1.2c | Elle nota/koma düzeltme | Var: ▲▼, oktav, "♯ ♭" düğmesi 9 koma değerini sırayla dolaşıyor | Doğrudan seçim: değiştirici listesi (adı ve koma değeriyle) | P0 |
| 1.2d | Uzun PDF sınırı | Sayfa aralığı soruluyor ama üst sınır yok; her sayfa 2480 px (A4'te ~35 MB tuval, sayfa sonrası boşaltılıyor) | Bir okumada en çok 20 sayfa, büyük dosyada (>40 MB) uyarı; aralık bu sınıra göre kısılır | P0 |
| 1.2e | D.S. gibi yazılı işaretler | Segno simgesi ve "segno'ya dön" okunuyor; yazıyla D.S./D.C./Fine/Coda okunmuyor, kullanıcıya söylenmiyor | Sonuç ekranında uyarı ve düzeltme ekranında seçili notaya işaret ekleme (segno, D.S., tekrar) | P0 |
| 1.3 | Çeyrek ses parmakları | 57 parmak WFG Oehler/Albert tablosundan; parmak kartında "¼ pes/tiz" düğmeleri alternatiflerle aynı sırada, doğrulanmamış uyarısı yok | Ayrı "Çeyrek ses (doğrulanmamış)" grubu; her parmakta kaynak, durum, bilinen not; ses kalitesi/geçiş/bağlam bilgisi yoksa "bilinmiyor" yazılır, uydurulmaz. Kullanıcı kendi çalgısında denediğini işaretleyebilir; Uzman kontrolünde kalite ve geçiş puanı toplanır | P0 |
| 2.1 | İcra perdesi | `ICRA` 6 makamda tek değer (ör. Uşşak Segâh −1,5); kaynaklarda aralık var (1–2 koma, 2–2,5 koma). Yardım metni "İcra ustaların gerçekte çaldığı perdedir… Emin değilsen İcra'yı seç" diyor | Değer + aralık; metin "yaklaşık, icracıya göre değişir" diye düzeltilir; kullanıcı (öğretmeninin) perdesini makam başına ayarlayabilir; çıkış/inişte farklılık olabileceği yazılır (veri uydurulmaz) | P1 |
| 2.2 | Makam eğitimi | 20 makam, durak/güçlü/yeden/seyir TDV'ye göre, kaynaklı. Karşılaştırma, çıkış/iniş ezgi örneği yok | Benzer makam karşılaştırması (aynı dizi farklı seyir: Uşşak/Bayâtî, Hicaz/Hümâyun/Uzzâl…) dizilerden üretilir; ezgi örnekleri kaynağı olan eserlerden (SymbTr) seçilir | P1 |
| 2.3 | Usul ve ritim | Usul metinlerinde "vuruş" hem zaman hem darb anlamında (Sofyan "dört vuruş: düm iki vuruş sürer"). Halk ritimleri tek kalıp, yalnızca kodda "hocaya kontrol ettirilmeli" notu | Zaman/darb/düm/tek/çevrim açıklaması; her usulde "N zaman, M darb"; halk ritimlerinde "yaygın bir çalış, yöreye ve icracıya göre değişir" | P1 |
| 3 | Başlangıç dersleri | "Başlarken" 4 ders (tanı ve kur, duruş-ağız-nefes, nota, ritim) + "İlk ses". Nefes "karından al", kamış "2–2½ numara" kesin kural gibi | 10 ders yapısına bölme; nefes (alt kaburgalar, rahat alış, kontrollü akış), dudak (gevşeklik/sızdırmazlık dengesi), kamış (bek açıklığı, marka, kişi) metinleri | P1 |
| 4 | Ses ve video | Örnek sesler Iowa Si♭ klarnetinden perde ayarlı; arayüzde yalnızca Ayarlar'daki teşekkür satırında. Videolar tek kanal (Çorlu Klarnet Üstatları) | Örnek sesin yanında "Si♭ klarnet kaydı, perde ayarlı; Sol klarnet tınısı değil". Video kaynakları ve üslup ayrımı (klasik / Trakya-Roman / modern) etiketlenir; yeni kayıt ve video proje sahibine | P1 |
| 5 | Öğrenme deneyimi | Karşılama akışı, yol haritası, aralıklı tekrar, ünite sınavları, kayıt karşılaştırma var. Taksim aşamaları ve ses kararlılığı takibi kısmen (uzun ton puanı) | Ders sonu değerlendirme özeti, ses kararlılığı ve ritim doğruluğu eğrileri, taksim aşamaları | P2 |
| 6 | Lisans | SymbTr CC BY-NC-SA 4.0 arşivde belirtiliyor; ücretli/reklamlı dağıtımda NC sorunu yazılı değil. WFG ve neyzen izni "İnsan gerektiren işler"de | `docs/LISANSLAR.md`: her kaynak, lisansı, ticari kullanım durumu, yapılacak iş | P1 |

### Aşamalar

1. **P0 — ses analizi, OMR, çeyrek ses parmakları** — tamamlandı (2 Kasım 2026), ayrıntı aşağıda
2. **P1 — icra perdesi, usul, başlangıç dersleri, ses etiketleri, lisans belgesi** — tamamlandı (2 Kasım 2026), ayrıntı aşağıda
3. **P1 — makam karşılaştırma ve örnekler, videolar** — tamamlandı (2 Kasım 2026), ayrıntı aşağıda
4. **P2 — öğrenme deneyimi** — tamamlandı (3 Kasım 2026), ayrıntı aşağıda
5. **Kalanlardan P0 — koşul sınaması, belgelerde Si♭ dili, OMR karışıklık tablosu** — tamamlandı (3 Kasım 2026), ayrıntı aşağıda

### Aşama 1 (P0) — tamamlandı (2 Kasım 2026)

**Değişen dosyalar:** `core.js`, `scripts/audio-check.js`, `omr.js`, `convert.js`, `app.js`, `index.html`, `app.css`,
`i18n.js`, `testdata/README.md`, `testdata/omr/README.md`.

- **Perde bulucu gürültüde oktav/onikili yanılgısı** (`core.js` `detectPitch`, `SUB_FLOOR`): alt harmonik denetimi oda
  gürültüsünün pes bölgedeki enerjisini temel ses sanıyordu; gerçek klarnet kayıtlarına benzetilmiş 10 dB SNR gürültüde
  doğru nota %16,5'ti. Aday frekans artık Hann penceresinin ±2 kutudaki sıfırlarında ölçülen düzeyin 3 katı olmalı:
  %99,3. Zayıf temel sesli (sert telefon süzgeci) durumdaki koruma aynı kaldı (66 notada 57, denetim kapalıyken 48)
- **Koşul sınaması** (`npm run audio-check -- testdata/iowa --kosul`): Iowa'nın gerçek Si♭ klarnet kayıtlarına telefon
  mikrofonu, gürültü, vibrato, yankı ve Sol klarnet pesliği benzetilir; çıktı "kayıtlar gerçek, koşullar benzetim" der.
  Betiğin zinciri uygulamanın oktav korumasını da içeriyor. Sonuçlar `testdata/README.md`'de
- **Çizgili bemol** (`omr.js` `hiddenSlash`, `flat_slash`): çizik dizek çizgisiyle birlikte siliniyordu; özgün resimde
  sapın solundaki kalınlıkla bulunuyor. Batı notasında ♭ sayılır, Türk notası kararını değiştirmez. Ayrıntı
  `testdata/omr/README.md`
- **Düzeltme ekranı** (`convert.js`): bilgi satırında ortalama okuma güveni ve %60 altı nota sayısı; çipin üstünde ve
  seçili nota satırında güven yüzdesi; değiştirici listesi (AEU adları ve koma değeriyle, konser notasında ♮ ♯ ♭);
  "İşaret" listesi (segno, D.S./D.C., Fine, tekrar başı/sonu, kaldır). Yazıyla yazılan D.S./D.C./Fine'ın okunmadığı her
  resim okumasında söylenir; Coda desteklenmiyor
- **Uzun PDF** (`CV_PAGE_LIMIT` = 15): bir okumada en çok 15 sayfa (sayfa başı ~9 MB gri resim); aralık sorusu buna göre
  kısılır, resim seçiminde de sayılır, aşılınca düzeltme ekranında yazar
- **Çeyrek ses parmakları** (`app.js` `showFingerings`): parmak kartında ayrı "Çeyrek ses · doğrulanmamış" grubu; her
  çeyrek seste kaynak (WFG, A. Wendl) ve "Türk Sol klarnetinde denenmedi; ses kalitesi, geçiş ve kullanım yeri
  bilinmiyor". Bu bilgiler uydurulmadı. Kullanıcı kendi çalgısında "çalışıyor/çalışmıyor" ve ses (temiz / idare eder /
  zayıf) işaretleyebilir (`sk.qt.mine`, yalnız cihazda; düğmede ✓/✗). Alternatif parmaklarda da "WFG'den, doğrulanmadı"
- **Yapılan denetimler:** `audio-check` temiz ve 9 koşulda; sentetik sayfalarda değiştirici okuma (Bravura/Leland, üç
  ölçek); Hicâz Longa gerçek sayfası (228/228, pdf.js ile çıkarılan resim); tarayıcıda parmak kartı (grup, uyarı, kişisel
  işaret, kayıt) ve Çevir'de sentetik Leland sayfası (16/16 nota, güven, değiştirici listesi, D.S. ve segno ekleme),
  telefon genişliğinde taşma yok, konsolda hata yok
- **Gerçek klarnetle denenmeli:** gerçek Sol klarnet kayıtlarıyla `audio-check` (hâlâ hiç yok); telefonda gürültülü
  odada akort göstergesi (yeni gürültü denetimi pes notalarda oktav korumasını zayıflatıyor mu); pp pes notaların
  telefonda görünüp görünmediği; 57 çeyrek ses parmağı (uzman); gerçek Leland/Bravura basılı nota fotoğraflarında
  çizgili bemol

### Aşama 2 (P1) — tamamlandı (2 Kasım 2026)

**Değişen dosyalar:** `learn.js`, `app.js`, `index.html`, `app.css`, `i18n.js`, `usuller.js`, `lessons.js`,
`lessonview.js`, `sorunlar.js`, `skills.js`; yeni `docs/LISANSLAR.md`, `docs/lisans-besteciler.csv`.

- **İcra perdesi** (`learn.js` `ICRA_INFO`, `setCustomIcra`): icra düzeltmesinin yanında kaynağın aralığı ve varsa
  çıkış/iniş farkı gösteriliyor. Uşşak ailesinde Segâh: −1,5 (−2 ile −1 arası; çıkarken ≈ −1, inerken ≈ −2, Gürbüz 1983
  ölçümü); Hüzzam'da Hisar +1 ile +1,5; Saba'da Hicaz +2 ile +2,5. Ölçüm yine ortadaki değeri kullanıyor; çıkıp inerken
  ayrı hedef yok (kaynak yalnız Segâh için var). Yardım metni "ustaların gerçekte çaldığı perde, emin değilsen İcra"
  yerine "yaklaşık; icracıya, ezgiye ve tavra göre değişir" diyor
- **Kendim akordu:** akort ekranında üçüncü seçenek. Seçili makamın her perdesi için öğretmeninin ya da örnek aldığı
  icracının sapması girilir (−3…+3 koma, 0,5 adım, `sk.tune.custom`); akort ve alıştırmalar bu hedeflere göre ölçer,
  "İcra değerlerine dön" sıfırlar
- **Usul** (`usuller.js`): "Kavramlar" kutusu (zaman, darb, düm, tek, te-ke, usul çevrimi); başlıkta "4/4 · 4 zaman · 3
  darb". Sofyan metni zaman/darb farkını anlatıyor, "vuruş" yerine zaman ya da darb. Oyun havası usullerinde "yaygın bir
  çalış; yöreye, icracıya ve oyuna göre değişir, tek doğru kalıp yok"
- **Başlangıç dersleri** (Başlarken ünitesi, 12 ders): parçalar ve montaj → kamış seçimi ve takma (yeni) → oturuş ve
  tutuş → sol ve sağ el (yeni) → ağızlık ve dudak (yeni) → ilk ses (Temeller'den taşındı) → uzun ses (yeni) → dil ile
  başlatma (yeni) → ilk geçişler (yeni) → nefes ve cümleleme (yeni) → nota okuma → ritim. Nefes: alt kaburgalar, rahat
  alış, kontrollü akış ("karından" sözünün neyi anlattığı açıklanıyor). Dudak: gevşeklik ile köşelerdeki sızdırmazlık
  dengesi; Türk tavrındaki esneklik "üslup farkı, kural değil". Kamış: numara markaya ve bek açıklığına göre değişir,
  kulakla ve hocayla seçilir. Var olan derslerin kimliği ve adım sayısı aynı kaldı (eski ilerleme korunur); yeni dersler
  teknik ünitesinin kilidini etkilemesin diye Başlarken'de. Toplam ders 84. Sorunlar sayfasının nefes ve gıcırtı
  bağlantıları yeni derslere yönlendi, nefes tavsiyeleri aynı dile çekildi
- **Örnek ses etiketi:** derslerin "Dinle" adımında ve Hakkında'da "Si♭ klarnet kaydı, perdesi ayarlı; Sol klarnetin
  tınısı değil"
- **Lisanslar** ([LISANSLAR.md](LISANSLAR.md)): her kaynak, lisansı, ücretsiz/ticari durumu ve yapılacak iş. SymbTr NC
  şartı ticari sürümle çelişir; eser telifleri SymbTr lisansından ayrı. [lisans-besteciler.csv](lisans-besteciler.csv):
  502 besteci, eser sayıları ve formlar; ölüm yılı ve telif durumu 4 Kasım'da dolduruldu (363 güfte yazarı `lisans-guftekarlar.csv`)
- **Yapılan denetimler:** tarayıcıda akort ekranı (icra aralığı metni, Kendim düzenleyicisi, kayıt), usul sayfası
  (Sofyan, Karşılama, kavramlar), yeni derslerin sırası ve içeriği, "Dinle" etiketi; konsolda hata yok. Node'da
  `tuningCtx`/`perdeTarget` Kendim modu ve ders sırası
- **Uzman/hoca görmeli:** yeni 7 dersin metinleri (özellikle oturuş açısı, dudak ve nefes anlatımı, Albert el
  pozisyonları); Kendim akordunun hocalar için kullanışlı olup olmadığı; oyun havası çalışlarının "yaygın" sayılabilirliği
- **Yapılmadı (aşama 3–4):** makam karşılaştırması ve ezgi örnekleri, taksim–makam bağı, kısa konu videoları ve
  üslup etiketleri (aşama 3'te yapıldı), P2 öğrenme deneyimi. Yeni gerçek Sol klarnet kayıtları ve videolar proje sahibine bağlı

### Aşama 3 (P1) — tamamlandı (2 Kasım 2026)

- **Değişen dosyalar:** `learn.js`, `skills.js`, `drills.js`, `trainers.js`, `teori.js`, `videos.js`, `lessonview.js`,
  `app.css`, `sw.js` (önbellek v63)
- **Benzer makamlar** (`learn.js` `similarMakams`): aynı durakta karar veren ve dizisi (çıkış + iniş, oktav farkı yok
  sayılarak) en çok iki perdeyle ayrılan makamlar, uygulamadaki dizilerden hesaplanır; elle yazılmış iddia yok. Dizi
  sekmesinde "Makamı tanı" bölümü: her benzer makam için ayıran perdeler ("Fark — Uşşak: Segâh · Kürdî: Kürdî"), güçlü
  ve seyir türü farkı, "İkisini dinle" (iki makamın çıkışı arka arkaya) ve o makama geçiş. Uşşak/Bayâtî gibi dizisi aynı
  olanlarda "fark seyirde ve ezgide". Teori sayfasındaki makam kartında da dizisi yakın makamlar yazar
- **Ezgi örnekleri:** nota arşivindeki SymbTr seyir ezgileri (Rauf Yektâ, Şefik Gürmeriç, Erol Bingöl; 20 makamın
  hepsinde 2–5 örnek) "Makamı tanı"dan açılır; arşiv ekranında dinlenir, takip edilerek çalınır. Örnekler kendimiz
  yazılmadı, kaynak eserlerden alındı. (Erol Bingöl çağdaş bir müzisyen: telif denetimine bkz. `lisans-besteciler.csv`)
- **Taksim–makam bağı** (`skills.js` `similarDrift`): taksim/seyir değerlendirmesinde, çalınan sürenin en az %8'i benzer
  bir makamın ayırt edici perdesinde geçtiyse (ve bu makamın karşılık gelen perdesinden en az iki kat uzunsa) geri
  bildirime "X perdesinde çok durdun: bu, dizisi yakın olan Y makamının perdesi" eklenir. Seyir sonucu ekranında
  "makamını incele" düğmeleri Dizi'de "Makamı tanı"yı açar. Eşikler yapay notalarla denendi, gerçek taksimle değil
- **Videolar:** Videolar sekmesinde "Üslup üzerine" kutusu (klasik / Trakya-Roman / modern icra doğru-yanlış değil
  üslup; buradaki videoların hepsi Çorlu'dan iki hocanın tavrı, başka üsluplardan örnek henüz yok). Etiketler (eski
  tavır, oyun havası, yakın çekim, caz) yalnızca başlıkta yazandan çıkar; videolara izlenmeden üslup etiketi verilmedi.
  Yeni başlangıç derslerine var olan videolar bağlandı: kamış ve ağızlık (bek-kamış-üfleme videosu), dil ile başlatma
  (dil vurma), ilk geçişler (yumuşak geçişler). Eller ve nefes-cümleleme derslerine uygun video yok
- **Yapılan denetimler:** Node'da 20 makamın benzer listesi gözden geçirildi; `similarDrift` Uşşak hedefiyle üç yapay
  taksimde (temiz Uşşak: uyarı yok; Kürdî perdesiyle: Kürdî; Evç'le: Hüseynî). Tarayıcıda Dizi → Makamı tanı (liste,
  makam geçişi, İkisini dinle, seyir örneğinin arşivde açılması), teori makam kartı, Videolar üslup kutusu ve etiketler;
  konsolda hata yok
- **Uzman/hoca görmeli:** benzer makam listelerinin öğretici olup olmadığı (dizi yakınlığı müzikal yakınlıkla her zaman
  örtüşmez; ör. Hüseynî'nin Uşşak'a "Evç farkıyla" benzemesi); taksimde geçki ile "yanlış makama kayma"yı ayırmak için
  %8 eşiği; "Üslup üzerine" metni
- **Gerçek klarnetle denenmeli:** taksim değerlendirmesindeki yeni uyarı (benzer makam perdesi) gerçek bir Uşşak,
  Hicaz ve Kürdî taksiminde yanlış alarm veriyor mu
- **Proje sahibine kalan:** konuya özel kısa başlangıç videoları (eller, nefes, kamış takma) ve farklı icracı/üsluplardan
  örnekler çekilmeli ya da izinle bağlanmalı

### Aşama 4 (P2) — tamamlandı (3 Kasım 2026)

- **Değişen dosyalar:** `skills.js`, `trainers.js`, `lessons.js`, `lessonview.js`, `drills.js`, `videos.js`, `app.css`,
  `sw.js` (önbellek v64)
- **Ders sonu özeti:** biten derste her ölçülen adımın en iyi sonucu ve hedefi listelenir; hedefi en az farkla geçilen
  adım "yarın bir kez daha" diye önerilir, "Gelişimimi gör" İlerleme'yi açar
- **Gelişimin zaman içinde takibi** (İlerleme → "Gelişim (haftalara göre)"): son 8 haftanın haftalık ortalamaları ve son
  4 haftanın önceki 4 haftayla karşılaştırması: uzun ton puanı, **ses kararlılığı** (uzun tonda sapmanın yayılımı, koma),
  **ritim puanı**, taksim (seyir) puanı. Ders adımlarındaki uzun ton, ritim ve seyir sonuçları da artık geçmişe yazılıyor
  (önceden yalnız alıştırma ekranları yazıyordu); yayılım bu sürümden önceki kayıtlarda yok
- **Taksim aşamaları:** ileri ünitede beş ders: (1) cümle kurma — yeni, (2) seyir — var olan "Taksime giriş", (3) çeşni
  ve yarım karar — yeni, (4) karar — yeni, (5) inici makamlar — var olan. Seyir adımına `focus` eklendi; puan o aşamanın
  ölçüsüdür (`skills.js` `phraseAnalysis`): notalar en az 350 ms sessizlikle cümlelere bölünür.
  - Cümle: en az 4 cümle, 1,5–10 sn, dizideki bir perdede tutularak biten
  - Çeşni: durak ile güçlü arasındaki perdelerin gezilmesi ve güçlüde biten cümle
  - Karar: son cümle durakta, son nota ≥ 800 ms, durağa üstten ya da yedenden gelinmesi
  Metinler uygulamanın ölçebildiğini ve ölçemediğini (ezginin güzelliği) ayrı söyler; "ilk çeşni = durak–güçlü arası"
  bu uygulamanın sadeleştirmesi olarak yazıldı. Var olan ders kimlikleri ve adım sayıları değişmedi; bitmiş dersler açık kalır
- **Duruş ve el kontrol listesi:** "Doğru oturuş ve klarneti tutuş" (5 madde) ve "Sol ve sağ el parmak pozisyonları"
  (6 madde) derslerinin okuma adımında; maddeler ders metninden alındı. Telefonla 20–30 sn video ya da ayna ile
  işaretlenir, cihazda saklanır, geçmeyi engellemez. Kamerayla otomatik duruş denetimi yok
- **Kişisel öğrenme akışı:** var olan karşılama akışı (deneyimliler için Başlarken ünitesini geçme) ve yol haritası
  korundu; bu aşamada değiştirilmedi
- **Yapılan denetimler:** Node'da `phraseAnalysis` yapay bir Uşşak taksimiyle (4 cümle, güçlü ve durak kalışları:
  üç puan da 100); tarayıcıda taksim (karar) adımı yapay perde akışıyla (puan ve geri bildirim), ders özeti, kontrol
  listesi (işaretleme ve saklama), İlerleme'deki haftalık eğriler (örnek geçmişle), yeni taksim derslerinin sırası.
  Okuma adımındaki bir hata (ctx eksik) denetimde bulunup düzeltildi; sonra konsolda hata yok
- **Uzman/hoca görmeli:** taksim aşamalarının sırası ve tanımları (özellikle çeşninin durak–güçlü arası olarak
  sadeleştirilmesi, karar için "üstten ya da yedenden"); kontrol listesi maddeleri; geçme eşikleri (60–75)
- **Gerçek klarnetle denenmeli:** cümle bölme eşiği (350 ms sessizlik) gerçek nefes aralarında doğru mu; ses kararlılığı
  eğrisinin hafta hafta anlamlı değişip değişmediği

### Aşama 5 (kalanlardan P0) — tamamlandı (3 Kasım 2026)

- **Değişen dosyalar:** `scripts/audio-check.js`, `omr.js`, `convert.js`, `README.md`, `testdata/README.md`,
  `testdata/omr/README.md`, `store/listing.md`, `package.json`, `sw.js` (önbellek v65); yeni `scripts/omr-acc-check.js`
- **Koşul sınamasına dört koşul** (`CONDITIONS`): `glissando` (2 yarım ses pesten 200 ms'de kayarak giriş), `atak`
  (ilk 25 ms'de notanın 4 katı güçte geniş bantlı patlama), `nefes` (genlik ±%45 oynar, 30 dB altında nefes hışırtısı),
  `sonus` (son yarı 40 dB sönerek biter) ve `sol+telefon+nefes+sonus`. Dördünde de 138/139 (temizle aynı; oktav
  yanılgısı yok); birleşimde 134/139 (bilinen telefon/pp pes notalar). Perde bulucuda düzeltme gerekmedi
- **Belgelerde Si♭ dili:** README, `testdata/README.md` ve betik başlığı "gerçek klarnet kayıtları" yerine "Si♭ klarnet
  (Iowa), Sol klarnet kaydı henüz yok; koşullar benzetim" diyor. Mağaza metnine (TR/EN) "Bilmen gerekenler" paragrafı:
  örnek sesler Si♭ kaydı, perde bulucu Si♭ kayıtları ve benzetimle sınandı, çeyrek ses parmakları doğrulanmadı. Aynı
  metinde ders sayısı 77 → 87, icra akordu "yaklaşık, aralığıyla; öğretmeninin perdeleri" ve Saba'da Çargâh yerine
  Hicaz (koddaki değer) düzeltildi
- **OMR değiştirici karışıklık tablosu** (`npm run omr-acc-check -- --bulanik`): 9 değiştirici × 12 nota, Bravura ve
  Leland, 20/14/11/9 px, temiz ve bulanık+JPEG. Bulunan iki hata düzeltildi: bulanık küçük sayfada düz bemolün sap +
  baş diye bölünmesi (bemol boyundaki değiştirici artık bölünmüyor) ve büyük mücenneb bemolün çiziklerinden biri dizek
  çizgisiyle silinince bakiye okunması (sapın solunda çizik sayımı). "Resim küçük" uyarısı 8 yerine 10 px altında ve
  koma işaretlerini gözden geçirmeyi söylüyor. Tablo ve kalan karışıklıklar `testdata/omr/README.md`'de
- **Yapılan denetimler:** `audio-check --kosul` yeni koşullarla; `omr-acc-check` (192 nota/işaret) değişiklikten önce ve
  sonra; Hicâz Longa gerçek sayfası (pdf.js ile Node'da çıkarılan resim) her değişiklikten sonra 228/228; tarayıcıda
  Çevir'e 9 px bulanık sentetik sayfa verildi: yeni uyarı görünüyor, konsolda hata yok
- **Gerçek klarnetle / gerçek notayla denenmeli:** yeni koşulların hiçbiri gerçek Türk tavrı değil (geniş glissando,
  sert dil, nefes); gerçek Sol klarnet kaydı gerekiyor. Karışıklık tablosu sentetik: gerçek Leland/Bravura basılı nota
  fotoğraflarında (özellikle 150 dpi altı) ♯ ile büyük mücenneb ♯ ve iki bemol çizikli işaretler

### Kalanlar (liste 3 Kasım'da yeniden geldi, aşamalarla karşılaştırıldı)

Aynı liste tekrar geldi; maddelerin hepsi yukarıdaki dört aşamada ele alınmış, P0 kalanları aşama 5'te. Açıkta kalanlar:

- **Kişisel öğrenme akışı / seviye belirleme**: en üstteki öncelikli "Kademeli hoca akışı" maddesine taşındı (çalma
  sınaması 3 Kasım'da yapıldı)
- **Makam çeşnileri ayrıntısı** (P1): tamamlandı (4 Kasım 2026). Teori'nin çeşni konusunda 11 çeşni (Rast, Uşşak, Hüseynî,
  Bûselik, Kürdî, Hicaz, Çargâh, Segâh, Hüzzam, Saba, Nikriz) ayırt edici aralık ve perdesiyle anlatılıyor; geçtiği makamlar
  dizilerden hesaplanıyor (`cesniYerleri`). Kaynaklar `docs/KAYNAKLAR.md` §2a. Bu sırada Nikriz'in Kürdî perdesi TDV'ye göre
  Dik Kürdî yapıldı. **Uzman/hoca görmeli:** Saba'da Hüseynî mi Dik Hisar mı (kaynaklar ayrışıyor, veri değişmedi);
  Nihâvend'in Nevâ'daki Hicaz dörtlüsünün B A S biçimi; icra akordunda Uşşak Segâh'ının çıkarken de pes sayılması (TDV yalnız
  inerken der, Gürbüz ölçümü ikisini de verir)
- **OMR düşük çözünürlük** (P1): 9 px bulanık sayfada ♯ büyük mücenneb ♯ okunuyor (12 notada 7 ve 4); Leland 11 px
  bulanıkta büyük mücenneb ♭ bakiye okunuyor (3). Ayırmak için gerçek düşük çözünürlüklü fotoğraf örnekleri gerekli
- **Lisans tablosu** (P1): 4 Kasım 2026'da dolduruldu, zayıf kayıtlar doğrulandı, 5 Kasım'da kalan adlar İTÜ kataloğuna soruldu;
  `lisans-besteciler.csv` 502 satır (329 ölüm yılı dolu; 192 kamu malı, 180 telifli, 1 anonim, 129 bilinmiyor),
  `lisans-guftekarlar.csv` 363 satır (211 yıl dolu; 106 kamu malı, 131 telifli, 126 bilinmiyor). Sınır 2026 için ölüm yılı ≤ 1955
  (FSEK m. 26-27). Dışlama listesi (`scripts/lisans-disla.js`): `lisans-disla.csv` 797 telifli (50'si zayıf kaynaklı),
  `lisans-belirsiz.csv` 364 belirsiz, `lisans-guftesiz.csv` 147 güfte yazarı kayıtlı olmayan eser (14'ünün yazarı bulundu). Şefik
  Gürmeriç 1967 doğrulandı, Erol Bingöl ve Ömer Sami Güpgüp telifli çıktı: 169 seyirin 140'ı telifli, çıkarılırsa 49 makamda seyir
  örneği kalmaz. Kalan: Ömer Dilek, kataloğun da bilmediği adlar ve basılı kaynak. Eserler arşivden çıkarılmadı; bu proje sahibinin
  kararı; ayrıntı `LISANSLAR.md`
- **Çeyrek ses puanı** (P0, tablo 1.3): tamamlandı (7 Kasım 2026). Uzman kontrolünde "+ ¼" satırlarına ses kalitesi (temiz /
  idare eder / zayıf), geçiş (kolay / orta / zor) ve kullanım yeri eklendi (`review.js` `QT_RATES`; `.q`, `.g`, `.u`); rapora
  ve JSON'a giriyor, raporda kaç parmağın puanlandığı yazıyor. Tarayıcıda denendi. Parmak kartı hâlâ "bilinmiyor" diyor:
  gelen raporlar uygulamaya elle işlenecek
- **Proje sahibine / uzmana bağlı** (kod değil): gerçek Albert Sol klarnet kayıtları (her notada pp/mf/ff) ve
  `audio-check` ile sınama; 57 çeyrek ses parmağında ses kalitesi ve geçiş bilgisi; konuya özel kısa başlangıç videoları
  (eller, nefes, kamış takma); farklı icracı ve üsluplardan izinli örnekler; aşamalardaki "Uzman/hoca görmeli" maddeleri

### Maddeler (gelen liste)

### P0 — kritik

1. **Gerçek Sol klarnet ses analizi**
   - Akort, uzun ses, hız, süsleme ve eşlik gerçek Sol klarnet kayıtlarıyla sınanabilmeli (`testdata/README.md`,
     `npm run audio-check` var; kayıt yok)
   - Vibrato, glissando, atak, nefes dalgalanması ve harmonik kaynaklı oktav hataları hesaba katılmalı (oktav koruması
     2 Kasım'da eklendi, gerçek seste denenmedi)
   - Üst harmoniklerin yanlış nota sayılması önlenmeli; gürültülü ortam ve farklı telefon mikrofonlarında davranış
     iyileştirilmeli
   - Gerçek kayıt yoksa sentetik sınamalar gerçek sınama gibi sunulmamalı (arayüz, belgeler, mağaza metni gözden geçirilecek)
2. **Nota tanıma (OMR) ve koma işaretleri**
   - Koma işaretleri birbirinden doğru ayrılmalı; Leland eğik çizgili bemolün düz bemol (−5 yerine −4) okunması giderilmeli
   - Her notada güven puanı gösterilmeli (şimdi yalnızca "emin değil" sarısı var)
   - Algılanan nota ve koma işareti elle düzeltilebilmeli (düzeltme ekranında koma seçimi var mı, bakılacak)
   - Uzun PDF'lerde sayfa ve bellek sınırı; tanınmayan D.S. gibi işaretlerin ele alınması (en azından uyarı)
3. **Çeyrek ses parmakları** (`core.js` `QT_FINGERINGS`, 57 parmak, WFG Oehler/Albert tablosundan)
   - Albert Sol klarnete göre gözden geçirilmeli; doğrulanmamış pozisyon kesin gibi sunulmamalı
   - Alternatifler ayrı kategoride; her pozisyon için ses kalitesi, geçiş kolaylığı, kullanım bağlamı
   - Gerçek çalgıda doğrulanması gerekenler arayüzde işaretlenmeli ("a" mandalının karşılığı dahil)

### P1 — Türk musikisi ve makam doğruluğu

4. **İcra perdesi** (`learn.js` `ICRA`)
   - Teorik AEU değerleri ile icrada kullanılan perde ayrı gösterilmeli; sabit koma düzeltmeleri mutlak doğru gibi sunulmamalı
   - Çıkıcı ve inici seyirdeki perde farkları (ör. inişte pesleşen perdeler)
   - Kullanıcı öğretmeninin ya da örnek aldığı icracının referansını ayarlayabilmeli
   - Gerektiğinde tek değer yerine önerilen aralık
5. **Makam eğitimi** (19/20 makam)
   - Durak, güçlü, yeden ve seyir açıklamaları kontrol edilmeli; karakteristik çeşniler ayrıntılı anlatılmalı (çeşniler 4 Kasım'da yazıldı, bkz. Kalanlar)
   - Çıkıcı ve inici seyir örnekleri, karakteristik ezgileri dinleten örnekler
   - Benzer makamların karşılaştırması (ör. Uşşak/Bayâtî, Hicaz/Uzzal/Zirgüleli Hicaz, Kürdî/Kürdîli Hicazkâr)
   - Taksim örnekleri makam çözümlemesiyle ilişkilendirilmeli
6. **Usul ve ritim** (`learn.js` `USULS`, `usuller.js`)
   - Zaman, vuruş, darb, düm, tek ve usul çevrimi kavramları ayrı anlatılmalı
   - Sofyan gibi usullerde zaman sayısı ile darb sayısının farklı olabileceği açıklanmalı
   - Roman, Karşılama, Çiftetelli ve Rumeli tek kesin kalıp gibi sunulmamalı; yöresel ve icracıya bağlı farklar belirtilmeli
   - Ritimler sesli ve görsel örnekle desteklenmeli
7. **Klarnet başlangıç eğitimi** — ayrı dersler: (1) parçalar ve montaj, (2) kamış seçimi ve takılması, (3) oturuş ve
   tutuş, (4) sol ve sağ el parmak pozisyonları, (5) ağızlık ve dudak pozisyonu, (6) ilk ses, (7) uzun ses, (8) dil ile
   başlatma (artikülasyon), (9) ilk nota geçişleri, (10) nefes kontrolü ve müzikal cümleleme
   - Nefes: "karından nefes al" yerine alt kaburgaların genişlemesi, rahat nefes alma, kontrollü hava akışı
   - Dudak: gevşeklik ile ağızlık çevresindeki sızdırmazlık arasındaki denge
   - Kamış sertliği (2–2,5 gibi) kesin kural değil; bek açıklığı, kamış markası ve icracıya göre değişir
   - Mevcut "Başlarken" ünitesi ile karşılaştırılıp eksik dersler eklenecek, var olanlar bölünecek
8. **Ses ve video içerikleri**
   - Si♭ klarnetten perde kaydırmayla üretilen örnekler gerçek Sol klarnet kaydı gibi sunulmamalı (`sampler.js` Iowa Si♭
     örnekleri; arayüzde ve belgelerde açıkça yazılmalı)
   - Mümkünse Albert sistem gerçek Sol klarnet kayıtları; her nota için farklı dinamikler
   - Başlangıç dersleri tek uzun video yerine konuya özel kısa videolarla (`videos.js`)
   - Farklı Türk klarnet icracılarından örnekler; klasik Türk musikisi, Trakya/Roman tavrı ve modern icra ayrı, doğru/yanlış
     değil icra üslubu olarak anlatılmalı

### P2 — öğrenme deneyimi

9. - Seviyeye göre kişisel öğrenme akışı (karşılama akışı ve yol haritası var; seviye belirleme gözden geçirilecek)
   - Her ders sonunda küçük uygulama ve değerlendirme; gelişimin zaman içinde takibi
   - Duruş ve el pozisyonu için video kontrol listesi
   - Öğrencinin kendi kayıtlarını karşılaştırması (eski kayıtla karşılaştırma var, 27 Ekim)
   - Taksim eğitimi aşamalara bölünmeli: cümle kurma, seyir, çeşni, karar
   - Yalnızca nota doğruluğu değil, ses kararlılığı ve ritim doğruluğu da takip edilmeli

### Lisans ve telif

10. - SymbTr ve diğer nota kaynaklarının lisans koşulları; CC BY-NC-SA 4.0 içeriklerin ticari kullanım açısından ayrıca
      değerlendirilmesi (ücretli uygulamada NC sorunu)
    - Her eserin bestecisi, telif ve kullanım durumu ayrı ayrı kontrol edilmeli
    - Harici nota ve ses kaynaklarının (WFG, Iowa EMS, VCSL, neyzen.com, projetsm.com) kullanım izinleri belgelenmeli
      (ör. `docs/LISANSLAR.md`)

## Eksikler listesinden: akort, dem, tolerans, ekipman, istatistik, paylaşım — tamamlandı (2 Kasım 2026)

Gelen iki eksik listesindeki maddeler koda göre denetlendi. Zaten olanlar: dinlerken ekranın açık kalması (Wake Lock),
ortam gürültüsüne göre eşik, dron, makam durak/güçlü bilgisi (akort ekranı, Teori), etütler ve teknik kalıpları, kayıtla
senkron perde eğrisi ve çarpma/kayış tanıma (Kayıt, Seyir), arşivde A–B döngü ve tempo merdiveni, dosyaya yedek, kalıcı
depolama izni, diyapazon 430–450 Hz, entonasyon haritası ve kaçan perdeler. Eksik olanlar yapıldı:

- **Oktav sıçrama koruması** (`app.js` tick, `core.js` `NoteStabilizer.push(key, hold)`): gösterilen notadan tam bir oktav
  uzaktaki nota ancak 5 ölçüm (200 ms) sürerse kabul edilir; register geçişindeki anlık oktav yanılgısı göstergeye ve
  alıştırmalara geçmez (gerçek oktav atlaması 80 ms gecikir)
- **Hava sesi süzgeci** (Ayarlar): açıkken perde bulucu netliği 0,7'nin altındaki sesi almaz (`detectPitch` `minClarity`)
- **Entonasyon toleransı** (Ayarlar): temiz ±0,25 / kabul ±1,5 koma varsayılan; göstergede iki bant (yeşil, petrol) ve
  kabul sınırı kayıt değerlendirmesinin pes/tiz eşiği (`INTON.offKoma`)
- **Akort izinde ham perde eğrisi:** kalın çizgi tutulan nota, ince çizgi her ölçüm; notalar arası kayış, çarpma ve nefesle
  bükme 8 saniyelik izde görünür
- **Diyapazon:** 440 / 442 / 432 hazır değerleri ve "Dinleyerek ayarla" (3 sn dinler, tampere notadan sapmanın ortancası
  diyapazona eklenir; ses sabit değilse reddeder)
- **Dem:** akort ekranında makam seçilince "▶ Dem: <durak>" düğmesi; makam değişince açık dron yeni durağa geçer (`SK.drone`)
- **Ekran açık kalsın** (Ayarlar): mikrofon kapalıyken de ekran kilidi tutulur. Yedek ipucunda son yedeğin tarihi; 30 günü
  geçince Drive'a ya da e-postaya kaydetme önerisi
- **Ekipmanım** (Ayarlar, `equip.js`): bek, kamış listesi, seçili kamışla perdesi duyulan süre, kamış notu, kamış ömrü
  (varsayılan 25 saat) dolunca bir kez hatırlatma
- **Arşivde kademeli hızlanma:** A–B döngüsünde her turda tempo %5 artar (en çok %100); açılınca tempo %60'tan başlar
- **İstatistik** (Takip): makamlara göre süre (son 30 gün; makam akort bağlamından, `sk.days.mk`, 90 gün tutulur) ve hafta
  günlerine göre ortalama süre
- **Eser paylaşımı** (Etüt ve eserler): kendi eseri sıkıştırılıp bağlantının `#paylas=` kısmına yazılır, sunucuya gitmez;
  kopyala, paylaş menüsü ve QR kod (`vendor/qrcode`, 1800 karakteri aşan bağlantıda QR yok). Bağlantıyı açan kişiye
  "Eserlerime ekle" sorulur; uygulamada bağlantı "Eser ekle" kutusuna yapıştırılarak eklenir. Uygulamadan paylaşılan
  bağlantı web sürümünü (alikrc.github.io/Sol-Klarnet) açar
- **Yapılmadı:** bulut eşitleme (sunucu ve hesap gerektirir; yedek dosyası Drive'a kaydedilebiliyor); kamış/bek profiline
  göre mikrofon ayarı (kamış perde ölçümünü değiştirmez; ortam ölçümü ve hava süzgeci yeterli); MIDI dışa aktarma
- **Denenmedi:** gerçek mikrofonla (tarayıcı panelinde mikrofon yok): oktav koruması, hava süzgecinin pp notalara etkisi,
  dinleyerek diyapazon, ham perde eğrisinin gerçek kayışlarda görünüşü, kamış süre sayımı. Paylaşım (gönder, aç, ekle),
  QR, dem düğmesi, tolerans bantları, kademeli hızlanma ve istatistikler tarayıcıda denendi

## Çeyrek ses parmakları ve gerçek çalgı sesleri — tamamlandı (1 Kasım 2026)

- **Çeyrek ses parmakları** (`core.js` `QT_FINGERINGS`, `quarterFingeringsFor`, `quarterFor`): WFG'nin Oehler/Albert çeyrek
  ses tablolarından (ocl_qt_1–3, Arnold Wendl) yazılı Mi3 + ¼ ile Si6 + ¼ arasında 44 çeyrek ses, 57 parmak. Sağ 2. yan
  mandalı (Albert'te yok) kullanan iki parmak alınmadı. Yeni gösterimler: `½` yarım kapalı delik (şemada yarı dolu, talimatta
  "yarım kapalı"), `a` sağ orta deliğin üstündeki mandal (şemada eklendi). Parmak kartında "¼ pes" / "¼ tiz" seçenekleri;
  hedef perde (icra düzeltmesiyle) çeyrek sese yarım sesten yakınsa o seçenek işaretlenir ve önerilir (ör. Uşşak icrasında
  Segâh ≈ Si♭4 + ¼). AEU perdelerinin hepsi tampere notaya ~25 sentten yakın olduğundan öneri yalnızca icra akordunda çıkar.
  Uzman kontrolünde ayrı satırlar
- **Klarnet sesi:** sentez yerine gerçek klarnet kaydı (`sampler.js`, `sounds/`; University of Iowa EMS Si♭ klarnet mf,
  16 nota, döngülü, hafif oda yankısı). Her örneğin perdesi ölçüldü; çalma hızı istenen frekansa göre ayarlanır, kaydın kendi
  akordu (tizde 30 sente kadar pes) sonuca girmez. Tarayıcıda ölçüldü: AEU ve icra perdelerinde sapma en çok 0,6 sent
- **Darbuka:** VCSL (CC0) gerçek düm, tek ve ka. Düm perde bulucunun alt sınırının altına indirilir (Sol klarnette 87 Hz)
- **Ud ve bas:** lisansı uygun gerçek ud örneği bulunamadı; genişletilmiş Karplus-Strong (mızrap kesiti, çekilen yer,
  perdeye göre sönüm, gövde rezonansları, çift tel). Eski modelin döngü süzgeci perdeyi 2–9 sent pes çıkarıyordu; artık
  süzgecin gecikmesi hesaba katılıyor (0,2 sent içinde)
- **Komalı eserler:** 28 etüdün 842 notası makam dizilerinde; nota arşivinden rastgele 25 eserin (10 167 nota) komaları SymbTr
  kaynağıyla birebir aynı (süs notaları bilerek süsleme işaretine çevriliyor)
- **Denenmedi:** seslerin kulağa nasıl geldiği (bu ortamda dinlenemedi), telefonda yükleme süresi (örnekler 1,9 MB, ilk ses
  açılınca yüklenir; yüklenene kadar eski sentez çalar). Çeyrek ses parmakları gerçek çalgıda denenmedi

## Nota çevirici — tamamlandı (30 Ekim 2026)

Tasarım: [2026-10-24-nota-cevirici-design.md](superpowers/specs/2026-10-24-nota-cevirici-design.md) ·
plan: [2026-10-24-nota-cevirici.md](superpowers/plans/2026-10-24-nota-cevirici.md)

- **Çevir sekmesi** (Eserler; `convert.js`): PDF ya da resimden (`omr.js`, simge kalıpları `omrtemplates.js`; PDF sayfaları
  pdf.js ile resme çevrilir, yalnızca PDF seçilince yüklenir), ses dosyasından ve "Dinleyerek yaz" ile mikrofondan (en çok
  3 dakika, 22 050 Hz tek kanal) nota çıkarılır. Her sonuç kaydedilmeden önce düzeltme ekranından geçer: emin olunmayan
  notalar sarı, süresi tutmayan ölçüler turuncu, yazılı aralık (Mi3–Mi♭7) dışı kırmızı ve kaydı engeller. Okuma ve çözümleme
  arayüzü dondurmaz, ilerleme gösterilir, sekmeden çıkınca iptal edilir
- **Nota bul:** neyzen.com ve projetsm.com uygulamanın içinden aranır, nota indirilip doğrudan okunur (`sources.js`; neyzen
  kaynağı `SOURCES.neyzen.enabled` ile kapatılır). neyzen arama dizini cihazda IndexedDB'de tutulur. Uygulamada internete
  yalnızca burası çıkar ve yalnızca arama sözcüğünü ve indirilecek dosyanın adresini gönderir
- Okuyucu sentetik sayfalarda (temiz ve bozulmuş), fotoğraf benzeri sayfalarda ve bir gerçek sayfada (Hicâz Longa, 228 nota)
  ölçüldü; gerçek sayfada son ölçüm 1.000. Örnekler: [testdata/omr/README.md](../testdata/omr/README.md)
- **Denenmedi:** gerçek mikrofonla Dinleyerek yaz (tarayıcı panelinde mikrofon kapalı); gerçek dokunmatik cihazda iki
  parmakla yakınlaştırma; parolalı PDF; gerçek Android/iOS'ta Nota bul (İnsan gerektiren işler, 7); okuyucu eşikleri yalnızca
  sentetik sayfalar ve tek gerçek sayfayla ayarlandı (9); gerçek klarnet kayıtlarında ses çözümü. Bilinen küçük eksikler:
  Leland'daki eğik çizgili bemol küçük boyutta düz bemol (−5, olması gereken −4) okunabiliyor; "D.S." yazısı okunmuyor;
  uzun PDF'lerde sayfa ya da bellek sınırı yok

## Seni izleyen eşlik — tamamlandı (28 Ekim 2026)

- **Benimle çal** (Etüt ve eserler, nota arşivi; `follow.js`, `pieces.js` `startFollow`): çaldığın notalar eserdeki yerine eşlenir
  (`ScoreFollower`: perde + beklenen zaman, en çok 4 nota atlama, süsleme ve fazla notalar yok sayılır, duyulmayan dille tekrar
  sayılır); eşleşmelerden tempo ve konum çıkar (`TempoMap`), orkestra bu haritaya göre 150 ms önceden kurulur (`FollowBand`).
  İlk notanla girer, sıradaki nota `followWait` kadar gecikirse bekler, kaldığın ya da biraz ilerideki notadan devam eder.
  Sonuçta doğru nota oranı, atlanan, tempo aralığı ve bekleme sayısı
- **Eşlik sekmesi:** "Grup beni izlesin" (`GrooveTracker`: tempo ardışık nota başlarının aralığından, evre en yakın hücreden;
  ayarlanan tempoya göre %75–130), susunca bekler ve ilk notanla cümle başından girer. "Taksimle başla": grup dem tutar,
  taksim durakta en az 0,8 sn'lik notayla bitip sessizlik gelince oyun havasının ilk notasıyla girer; "Gir" ile hemen
- Sızıntı süzgeci düzeltmesi (`practice.js` `droneFloor`): sızıntı düzeyi son 10 sn'nin alt %10'u yerine son 15 sn'nin alt
  %5'i; nefes almadan çalınca öğrencinin durak ve güçlü perdeleri grup sızıntısı sanılıp atılıyordu
- Sınama: Playwright'ta sahte mikrofona sentetik klarnet sesi. Eserde (Kasap havası: %85 hızda başla, 3 sn dur, %112'de devam)
  doğru nota %100, grup 94'e indi, bir kez bekledi, 124'e çıktı. Eşlik sekmesinde taksim → 100 → 88 → duraklama: grup taksimin
  ardından ilk notayla girdi, 93–101 ve 86–90 arasında izledi, bekleyip yeniden girdi
- Sınırlar: notasız izlemede %20'yi aşan ani tempo değişimi yanlış tempoya (3:2) kilitlenebiliyor (bu yüzden aralık dar);
  düzenli nota başlarından otomatik giriş denendi, sentetik sesteki ±50 ms oynamada hızlı taksim geçişlerini oyun havasından
  ayıramadığı için (yanlış giriş %50–80) bırakıldı. Gerçek klarnetle ve hoparlör sızıntısıyla denenmedi

## Tekrar, sınav, rozet, kayıt karşılaştırma, yeni oyun havaları, grupetto, mağaza — tamamlandı (27 Ekim 2026)

- **Aralıklı tekrar** (`lessons.js` `srsSync`, `srsDue`, `srsUpdate`): bitirilen derslerin bir adımı 1, 3, 7, 21, 60 gün
  aralıkla günlük plana gelir (günde en çok 2); başarılı tekrar aralığı uzatır, başarısız kısaltır. Eski bitmiş dersler günlere dağıtılır
- **Ünite sınavları** (`EXAMS`): her ünitenin derslerinden en çok altı adım, karışık; ders zincirini kilitlemez. Geçince ünite rozeti
- **Rozetler ve haftalık özet** (`roadmap.js` `badgeList`, `weekSummary`): ünite, seri (3–100 gün), günlük çalışma ve toplam süre
  basamakları; yol haritasında bu hafta / geçen hafta karşılaştırması
- **Eski kaydınla karşılaştırma:** kayıtlar IndexedDB'de tarihle (son 50, ★ ile saklananlar silinmez); yerinde nota oranı,
  ortalama sapma, ses temizliği farkı, iki oynatıcı ve üst üste perde eğrileri (`skills.js` `recSummary`, `recCompare`, `recBaseline`)
- **Oyun havaları:** sirto (2/4) ve zeybek (9/4) usulleri; Hicaz sirto, Karcığar köçekçe, Hüseynî zeybek ve çarpmalı tekrarlı
  Kürdî Ağır Roman etütleri; Trakya ünitesine üç ders. Eşlikte ikinci darbuka çalışı ve cümle sonu dolgu ölçüsü (`band.js` `bandDrum`)
- **Grupetto:** ölçüm, örnek ses, Süsleme sekmesi, `gr` eki, MusicXML `<turn>`, dizekte işaret, uzman kontrolü, yeni ders (toplam 76)
- **Taksimde süsleme tanıma** (`skills.js` `ornamentScan`): Seyir sekmesi ve taksim adımında ham sesten çarpma, çarpmalı tekrar,
  mordan, grupetto, tril, kayış ve düşüş sayılır. Yalnızca sentetik seslerle ayarlandı
- **Mağaza:** telefon ekran görüntüleri ve 1024×500 tanıtım görseli (`npm run store-shots`), Türkçe/İngilizce kısa ve uzun açıklama
  (`store/listing.md`), manifest'te ekran görüntüleri
- Yapılmadı: çeyrek ses parmakları (sonra yapıldı, 1 Kasım 2026)

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

Güncel sayılar ve sıralı liste [DENEME-LISTESI.md](DENEME-LISTESI.md) içinde; buradaki sayılar yazıldığı günündür.

1. **Uzman doğrulaması:** Bir Sol klarnet hocası Ayarlar → Uzman kontrolü ekranından 124 parmağı, 20 makamın (Nikriz dahil) dizisini,
   seyir türünü ve icra düzeltmelerini işaretleyip raporu göndermeli. 72 dersin metinleri ve 24 etüt de gözden geçirilmeli. Hız ünitesinin gam/arpej seçimi, hedef tempoları ve hızlı Hicaz etüdü
   (`e-hiz-hicaz`) de kontrol edilmeli. Süslemeler (Uzman kontrolü → Süslemeler): tanımlar,
   örnek sesler, ölçüm eşikleri (`skills.js` `ORN`; ör. tril düzeni ≤ 0,2, çarpma 20–120 ms) ve iki süslemeli etüt.
   Çeyrek ses parmakları (Uzman kontrolü → Parmaklar, "+ ¼" satırları, 57 parmak) gerçek çalgıda denenmeli; özellikle
   "a" mandalı (WFG: sağ orta deliğin üstündeki mandal) Türk Sol klarnetinde hangi mandala karşılık geliyor.
   Yeni klarnet, darbuka, ud ve bas sesleri dinlenip beğenilmeli.
   Yanlış bulunanlar `core.js` (FINGERINGS, ALT_FINGERINGS, QT_FINGERINGS), `learn.js` (MAKAMS, SEYIR_TYPE, ICRA) ve
   `repertoire.js` (ETUDES) içinde düzeltilir; testler tutarlılığı denetler.
2. **Gerçek kayıtlar:** `testdata/README.md` içindeki listeye göre telefonla kayıt toplanıp `npm run audio-check` çalıştırılmalı.
   Süsleme eşikleri (`ORN`) yalnızca sentetik seslerle ayarlandı; süslemeli gerçek kayıtlarla gözden geçirilmeli.
   Perde eğrisi eşikleri (`INTON`; ör. pes/tiz 1,5 koma, titreklik 0,8) de gerçek kayıtlarla gözden geçirilmeli.
   Taksimde süsleme tanıma (`ornamentScan`, `ORN.scanStep`) ve grupetto eşikleri (`ORN.grupettoNote`, `grupettoTotal`) de.
3. **WFG izni:** Parmak verisi Woodwind Fingering Guide'dan; ücretli yayınlanacaksa sahibinden izin istenmeli.
4. **Mağaza:** Play geliştirici hesabı, yükleme anahtarı, kapalı test; iOS için Mac + Xcode + Apple geliştirici hesabı;
   mağaza ekran görüntüleri ve tanıtım görseli.
5. **Oyun havaları:** Yedi halk usulünün (sirto ve zeybek dahil) düm-tek kalıpları, ikinci çalışlar ve dolgular (`learn.js` USULS,
   `band.js` BAND_STYLES), Nikriz dizisi ve on bir Trakya/Roman etüdü (`repertoire.js`, level 6) bir Trakya ya da Roman klarnetçisine dinletilmeli. Eşlikle usule oturma eşiği
   (±60 ms) ve eşlik sızıntısının ayıklanması telefon hoparlörüyle denenmeli.
6. **Repertuvar ve lisans:** ayrıntı [LISANSLAR.md](LISANSLAR.md). Telifli eserler eklenmedi; kullanıcı MusicXML içe aktarabiliyor. SymbTr gibi açık lisanslı arşivlerden
   seçki eklenecekse lisans koşulları kontrol edilmeli.
7. **Nota bul gerçek cihazda denenmedi (30 Ekim 2026):** Arayüz tarayıcı panelinde sahte ağla (curl'den alınmış sayfalar)
   denendi; `CapacitorHttp` ile gerçek arama, neyzen dizininin çıkarılması (89 makam sayfası, ~1,6 milyon karakter;
   IndexedDB'de, yedeğe girmez), projetsm.com'a cleartext istek (Android `network_security_config`, iOS ATS istisnası),
   GIF/PDF indirme ve "Dosyayı kaydet" paylaşımı `npm run android:apk` ile telefonda denenmeli. Aynı turda gerçek mikrofonla
   Dinleyerek yaz, dokunmatik ekranda yakınlaştırma ve parolalı bir PDF de denenmeli.
8. **neyzen.com izni:** Nota bul neyzen.com'dan arar ve nota indirir. Siteyi yapan Mehmet Yücel'den yazılı izin alınmalı,
   mağazaya çıkmadan önce; izin yoksa `sources.js`'te `SOURCES.neyzen.enabled = false` yapılır (projetsm.com kalır).
9. **Nota okuyucu eşikleri:** `omr.js` eşikleri sentetik sayfalar, fotoğraf benzeri bozulmuş sayfalar ve tek gerçek sayfayla
   ayarlandı. Farklı yayınlardan (tarama, ekran görüntüsü, fotoğraf) daha çok gerçek örnek `testdata/omr/` altına konup
   okuma doğruluğu ölçülmeli, eşikler gerekirse gözden geçirilmeli. Ses çözümü eşikleri de gerçek klarnet kayıtlarıyla
   denenmeli.

## Sonraki adımlar (öncelik sırasıyla, 27 Ekim 2026)

1. **Gerçek klarnetle deneme (proje sahibi):** Telefonda Benimle çal (grup seni izliyor mu, gereksiz bekliyor mu), Eşlik'te
   grup beni izlesin ve Taksimle başla, Kulaktan çıkar, Trakya etütleri, taksimde süsleme tanıma ve kayıt
   karşılaştırması gerçek klarnetle denenmeli. Bakılacaklar: eşlik hoparlörden mikrofona sızıp nota sanılıyor mu (`practice.js`
   `bandFreqs`), usule oturma yüzdesi gerçekçi mi (±60 ms), taksimde süsleme sayısı kulağa uyuyor mu, 2 dakikalık taksimin
   çözümü telefonda ne kadar sürüyor, IndexedDB'de 50 kayıt ne kadar yer tutuyor. Bulgulara göre düzeltilir.
2. **Mağazaya çıkış (proje sahibi):** Play Console hesabı, yükleme anahtarı, kapalı test, veri güvenliği formu. Görseller ve
   metinler `store/` klasöründe hazır (5 Kasım 2026'da yenilendi: 8 ekran, Play 1080×2160 ve iPhone 6,9" 1320×2868; iPad takımı yok, Xcode hedefi iPad'i de kapsıyor). Ayrıntı: [TODO.md](TODO.md).
3. **Daha sonra:** Kamerayla duruş ve ağız kontrolü; hoca–öğrenci modu (ödev, kayda yorum); cihazlar arası eşitleme.
   İnternet kullanmak serbest (28 Ekim 2026, proje sahibi): internetsiz çalışma şartı yok.


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
