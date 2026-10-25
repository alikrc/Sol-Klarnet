# mirasisaz.com incelemesi: Sol Klarnet ne alabilir?

İnceleme tarihi: 2026-10-25. Örnek sayfa:
[Dök Zülfünü Meydana Gel (Hisarbûselik Tavşanca)](https://mirasisaz.com/eser/hisarbuselik-tavsanca-dok-zulfunu-tanburi-mustafa-cavus/).

## Kısaca

Miras-ı Saz, ücretsiz ve üyeliksiz bir makam müziği sitesi: 1079 eserlik nota arşivi, 155 makam, 95 usul, 201
bestekâr, tarayıcıda çalınan 14 çalgı (klarnet dahil), kulak eğitimi ve 20'ye yakın araç. 16 dilde. Vite ile
derlenmiş statik bir site; verinin hepsi düz JSON dosyalarından okunuyor, gizli bir API yok.

En önemli bulgu: **notalar SymbTr'den geliyor** (MTG, Universitat Pompeu Fabra, CC BY-NC-SA 4.0). Bizim MusicXML
içe aktarmamız SymbTr'yi zaten okuyor (`repertoire.js` `parseMusicXML`). Yani bu arşivdeki her eseri resim tanıma
(OMR) olmadan, koma kaybı olmadan uygulamaya alabiliriz. neyzen.com'un PDF'lerini okumaya çalışmaktan çok daha
sağlam bir yol.

## Bir eser sayfasında neler var

Sayfa sunucuda hazır HTML olarak geliyor, sonra `eser-*.js` notayı ve çalıcıyı yüklüyor.

- **Künye:** ad, bestekâr (yaşam yılları, MusicBrainz/Wikidata/Discogs bağlantıları), güfte yazarı, makam, form,
  usul, yüzyıl, süre ve tempo (♩ = 120), seviye (Başlangıç / Orta / İleri), etiketler (ör. "Oyun havaları").
- **Çalıcı:** kanun sesiyle koma hassasiyetinde çalma, tempo yüzdesi, A–B ölçü döngüsü, dem (karar perdesi sesi),
  "melodiyi kapat (birlikte çal)", "Beni takip et: sen çal, nota seni beklesin" (mikrofonla), kudüm eşliği.
- **Nota:** Verovio ile çizilmiş SVG, AEU arıza işaretleri SMuFL/Bravura glifleriyle.
- **İndirme:** PDF (A4), MusicXML (doğrudan SymbTr'nin GitHub dosyasına bağlantı), MIDI, abc.
- **Bölümler:** aranağme, mısra 1, 2, 3… (notadaki başlangıç indeksiyle).
- **Kayıtlar:** MusicBrainz'den icralar: icracı, albüm, yıl, süre, kadro (kim hangi çalgıda), YouTube/Deezer
  bağlantıları.
- **Benzer eserler:** aynı makamdan ve aynı bestekârdan eserler, ezgi benzerliğine göre öneriler.
- **Güfte:** yalnız güfte yazarı 70 yıldan önce ölmüşse gösteriliyor (FSEK md. 27); bu örnekte gizli.

## Veri dosyaları

Hepsi `https://mirasisaz.com` altında, düz GET ile, oturum istemeden açılıyor.

| Dosya | Boyut | İçerik |
|---|---|---|
| `/eserler/liste.json` | 750 KB | 1079 eserin dizini, 201 bestekâr, etiketler, derlemeler |
| `/eserler/<id>.json` | ~23 KB | Tek eserin bütün verisi (aşağıda) |
| `/eserler/<id>.abc` | | abc nota metni, 53 eşit bölüm, koma işaretli |
| `/eserler/<id>.mid` | | MIDI |
| `/eserler/<id>.pdf` | | Baskıya hazır PDF |
| `/eserler/<id>-genis.svg` | ~250 KB | Verovio çizimi (yazılar yol olarak, metin değil) |
| `/eserler/sairler.json` | 54 KB | Güfte yazarları ve eserleri |
| `/veri/makamlar.json` | 119 KB | 155 makam: karar, güçlü, donanım (mandal), yapı ve seyir metni, kaynak |
| `/veri/usuller.json` | 97 KB | 95 usul: zaman, düm-tek-ke kalıbı, velveleli şekli, kaynak |
| `/veri/enstrumanlar.json` | 63 KB | 14 çalgı: tanıtım, tını ayarları, ses örneği kaynakları |
| `/llms.txt`, `/llms-full.txt` | | Sitenin bütün sayfalarının yapay zekâ için listesi |
| `/sitemap.xml` | | Bütün sayfalar |

### `liste.json` içindeki bir eser

```json
{ "id": "acem-ilahi-aldanma-dunya-zekai-dede", "ad": "Aldanma Dünya Varına",
  "besteci": "zekai-dede", "besteciYil": [1825, 1897], "makam": "acem", "form": "ilahi", "usul": "duyek",
  "kaynak": "acem--ilahi--duyek--aldanma_dunya--zekai_dede", "seviye": "baslangic", "tempo": 84,
  "sure": 90714, "notaSayisi": 266, "etiket": ["dini", "baslangic", "19-yuzyil"], "mbid": "…", "sair": "Sâbit" }
```

`kaynak` alanı SymbTr dosya adı: `https://raw.githubusercontent.com/MTG/SymbTr/master/MusicXML/<kaynak>.xml`.

### Eser JSON'undaki notalar

`notalar` her nota için bir dizi: `[kimlik, başlangıç ms, süre ms, koma, ölçü konumu, ad, süre türü]`.

```json
["n1", 0, 250, 230, 0, "E5", "8"]
["n2", 250, 250, 237, 0.111, "F5", "8"]
```

- **koma**: mutlak 53 eşit bölüm indeksi, Do(n) = (n−1)·53. Örnekte La4 = 199, Mi5 = 230, Fa5 = 234,
  Fa5 + 3 koma = 237. Bizim biçime geçiş: `c = koma − 190` (Rast = yazılı Sol4 = 190), `w` addan.
- **ölçü konumu**: ölçü numarası + ölçü içi kesir (9/8'de her sekizlik 0.111).
- Susların kendi satırı yok; zamandaki boşluktan çıkıyor (n6'dan n8'e atlama).
- Yanında: `bolumler` (`[nota indeksi, "aranagme" | "misra", sıra]`), `usuller` (`[başlangıç, 9, 8, "raksaksagi"]`),
  `tempo`, `kayitlar`, `benzerEzgi`.

### abc dosyası

```
%%MIDI temperamentequal 53
L:1/48
Q:1/4=120
=e6 ^3f6 =g6 ^3f6 =a6 =g12 z12 ^3f6 =g6 _5b6 =a6 …  ^4G6 =A18
```

`^3f` = Fa'nın 3 koma tizi, `_5b` = Si'nin 5 koma pesi. Arıza işaretleri doğrudan koma sayısı; bizim AEU işaret
kuralımızla birebir eşleşiyor (♯ = +4, ♭ = −5, ters ♭ = −4). Süsleme notaları da var: `{^4g}=f3`.

### `makamlar.json` içindeki bir makam

```json
{ "id": "hisarbuselik", "ad": "Hisarbûselik", "karar": "A", "guclu": "E", "mandal": { "D": 4, "F": 1, "G": 4 },
  "ders": { "aciklama": "…", "yapi": "Donanımı: Re bakiye diyez, Sol bakiye diyez, Fa koma diyez…",
            "seyir": "İnici-çıkıcı bir seyir izler…", "seyirKaynak": ["https://islamansiklopedisi.org.tr/hisar-buselik"] } }
```

Dosyanın kendi notu: "Uzman doğrulaması bekliyor."

### `usuller.json` içindeki bir usul

```json
{ "id": "raksaksagi", "ad": "Raksaksağı", "zaman": "9/8", "birim": 8,
  "vuruslar": [["D",2],["T",3],["D",2],["T",2]],
  "velveleli": [["D",1],["D",1],["T",1],["K",1],["T",0.5],["K",0.5],["D",1],["D",1],["T",1],["K",1]],
  "kaynak": "TDV İslâm Ansiklopedisi, “Raks Aksağı” maddesi…",
  "velveleKaynak": "İ. H. Özkan, Türk Mûsikîsi Nazariyatı ve Usûlleri: Kudüm Velveleleri…" }
```

## Lisans ve kullanım koşulları

Bu bölüm neyi alıp neyi alamayacağımızı belirliyor.

- **Notalar:** SymbTr, CC BY-NC-SA 4.0. Kaynak göstererek, **ticari olmayan** amaçla ve aynı lisansla
  paylaşılabilir. Uygulama ücretli olursa ya da reklam alırsa bu notalar uygulamanın içine konamaz (Woodwind
  Fingering Guide için `docs/TODO.md`'deki notla aynı karar noktası).
- **Sitenin kendi verisi:** [Kullanım koşulları](https://mirasisaz.com/sayfa/kosullar/) makam, usul, sözlük,
  bestekâr ve çeviri dosyalarını veri tabanı yapımcısı hakkıyla (FSEK) koruyor. Yazılı izin olmadan:
  - betikle ya da kazıyıcıyla toplu indirmek,
  - başka bir uygulamada ya da veri setinde yeniden yayımlamak, bunlardan yeni bir veri tabanı kurmak

  yasak. Sitenin tasarımı, yazılımı ve metinleri de izinsiz kopyalanamaz.
- **robots.txt:** `/api/` ve `/panel/` kapalı; geri kalan açık.
- **İletişim:** info@mirasisaz.com (izin ve iş birliği için koşullarda bu adres veriliyor).

Sonuç: notaları **SymbTr'nin kendisinden** alırız (GitHub'da açık); mirasisaz'ın JSON dosyalarını (liste, makam,
usul) izin almadan uygulamaya gömmeyiz ya da toplu çekmeyiz.

**Karar (2026-10-25):** Uygulama ücretsiz kalacak. SymbTr'nin 2200 eseri uygulamanın içine alındı (Nota arşivi,
`docs/superpowers/specs/2026-10-25-nota-arsivi-design.md`); mirasisaz'daki nota bölümünün özellikleri kendi kodumuzla
yapıldı.

## Ne alabiliriz

### 1. Eser arşivi: SymbTr'den, doğrudan (izin gerekmez, lisans NC)

- **Nota bul'a üçüncü kaynak: SymbTr.** MusicXML `parseMusicXML` ile zaten okunuyor, komalar `<alter>`'den.
  Resim tanıma yok, hata düzeltme ekranına neredeyse hiç iş kalmıyor. neyzen ve projetsm'den önce bunu yapmak
  mantıklı.
- SymbTr'nin dosya adı makam, form, usul, ad ve bestekârı taşıyor
  (`hisarbuselik--tavsanca--raksaksagi--dok_zulfunu--tanburi_mustafa_cavus`). Kendi dizinimizi GitHub'daki dosya
  listesinden kurabiliriz; mirasisaz'ın `liste.json`'una ihtiyaç yok.
- SymbTr'nin `txt` dosyalarında her notanın Koma53 değeri ve bölüm/güfte satırları var; bölüm işaretlerini (aranağme,
  mısra) eser ekranında gösterebiliriz.
- **Klarnete uygunluk süzgeci:** eserin en pes ve en tiz notası yazılı Mi3–Mi♭7 aralığına giriyor mu. Koma
  değerlerinden hesaplanır.
- **Seviye tahmini:** mirasisaz'ın yöntemi açıkça yazılı (ses alanı, hız, ritim, usul, perde çeşitliliği,
  uzunluk). Kendi formülümüzü yazarız; "Bugünün çalışması" ve repertuvar önerisinde kullanılır.
- **Telif süzgeci fikri:** bestekâr ve güfte yazarı 70 yıldan önce ölmüş eserleri almak, güfte yazarı bilinmiyorsa
  güfteyi göstermemek. Ölüm yılları MusicBrainz/Wikidata'dan (CC0).

### 2. Eser bilgisi: MusicBrainz ve Wikidata'dan (CC0, serbest)

mirasisaz'ın künye ve kayıt bilgisi bu iki kaynaktan. Biz de doğrudan alabiliriz:

- bestekâr yaşam yılları, portre bağlantısı,
- **kayıtlar:** eserin hangi icralarda olduğu, kadro, YouTube bağlantısı. Eser ekranında "Ustalardan dinle"
  listesi; YouTube bağlantısını mevcut "dinleyerek yaz" akışına vermek.

### 3. Makam ve usul bilgisi: birincil kaynaklardan, kendi metnimizle

Bizde 19 makam ve 6 usul var; sitede 155 makam ve 95 usul. JSON'larını kopyalayamayız ama hepsinin kaynağını
yazmışlar, aynı kaynaklardan kendimiz derleyebiliriz:

- seyir metinleri: TDV İslâm Ansiklopedisi makam maddeleri,
- usul kalıpları: TDV usul maddeleri (İ. H. Özkan, C. Tanrıkorur), MTG tomato vuruş grupları,
- velveleli şekiller: Özkan'ın *Kudüm Velveleleri* (Ozan Yarman'ın tablosu), Köprülü ve Işıldak 2017
  (Rast Müzikoloji Dergisi 5/2),
- makam tanıma: OTMM Makam Recognition ve Tonic veri setleri (MTG, CC BY-NC-SA).

### 4. Özellik fikirleri (veri değil, fikir; serbest)

| Fikir | Sitede | Bizde |
|---|---|---|
| A–B ölçü döngüsü | Eser çalıcısında | Yok; tempo merdiveniyle birlikte zor cümle çalışmasına uyar |
| Dem (karar perdesi) eşliği | Eser çalıcısında | Durak sesi (dron) var; eser ekranına bağlanabilir |
| Usul eşliği (kudüm) eserle birlikte | Var | Usullü metronom var; eserin usulüyle kendiliğinden açılabilir |
| "Melodiyi kapat, birlikte çal" | Var | Dinleme var; eşlikte melodi sesini kısma seçeneği |
| Bölümler (aranağme, mısra) | Var | Yok |
| Meşk aracı: kaydı perdesini bozmadan yavaşlat, döngüye al | Araçlarda | Yok; "dinleyerek yaz" ile birleşebilir |
| Göçürme: makamı başka perdeye taşı | Araçlarda | `transposeAll` var; arayüzü yok |
| Çeşni bulucu, aralık hesaplayıcı | Araçlarda | Yok |
| Makam bulucu: çal, hangi makam olduğunu söylesin | Araçlarda (20 makam, ilk üçte %88) | Seyir analizi var; makam tahmini yok |
| Entonasyon aynası | Araçlarda | Akort ve entonasyon izi zaten var |
| PDF/MusicXML/MIDI/abc dışa aktarma | Her eserde | Paylaşma var; abc ya da MusicXML dışa aktarma eklenebilir |
| Porte denetimi: çizilen notayı otomatik okuyup kaynakla karşılaştırma | Yayın öncesi | Nota çeviricinin doğruluğunu ölçmek için aynı fikir |

### 5. Bağlantı verme (her zaman serbest)

- Eser ekranında "mirasisaz.com'da aç" bağlantısı: `https://mirasisaz.com/eser/<id>/`.
- Sitenin klarnet sayfası: `https://mirasisaz.com/cal/klarnet/?makam=<makam>`.

## Alamayacağımız ya da izin isteyenler

- `liste.json`, `makamlar.json`, `usuller.json`, `sairler.json`, `enstrumanlar.json` dosyalarını uygulamaya gömmek
  ya da toplu çekmek (koşullar yasaklıyor; izin gerekir).
- Sitenin seyir, makam ders ve sözlük metinleri, çevirileri.
- Verovio SVG'leri ve PDF'ler: SymbTr'den türetilmiş, ama mirasisaz'ın düzeni; MusicXML'den kendimiz çizeriz.
- `/api/` uçları (sayaç, beğeni; robots.txt kapatıyor, işimize de yaramaz).

## Önerilen sıra

1. **Nota bul'a SymbTr kaynağı:** GitHub'daki MusicXML listesinden dizin, arama (ad, makam, form, usul, bestekâr),
   indirip `parseMusicXML` ile açma, klarnet aralığı süzgeci, "Kaynak: SymbTr (CC BY-NC-SA 4.0)" notu.
   Nota çevirici planındaki Görev 9–10'un önüne alınabilir; OMR'a gerek kalmadan en çok eseri getirir.
2. **Lisans kararı:** uygulama ücretli ya da reklamlı olacak mı? Olacaksa SymbTr eserleri uygulamaya gömülemez,
   yalnız öğrencinin kendisinin indirdiği dosya olarak kalabilir.
3. **mirasisaz'a e-posta (isteğe bağlı):** `liste.json`'u (seviye, tempo, MusicBrainz eşlemesi, telif süzgeci
   hazır) kullanmak için izin istemek. İzin gelirse 1. adımdaki dizin işi küçülür.
4. Eser ekranında A–B döngüsü, dem ve usul eşliği, bölümler.
5. MusicBrainz'den kayıtlar ve "Ustalardan dinle".
