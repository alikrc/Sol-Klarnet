# Nota okuyucu örnekleri

Nota okuyucunun (`omr.js`) gerçek notalarla denendiği örnekler. Örnekler telifli olabildiği için depoya girmez
(`.gitignore`); yalnızca bu dosya girer. Aşağıdakileri indirip bu klasöre koy.

Her örneğin yanında aynı adla bir `.txt` dosyası beklenen notaları uygulamanın nota metniyle, tekrarlar açılmadan,
yazıldığı gibi tutar; okunan elle bununla karşılaştırılır (otomatik test yok). `.txt` yoksa örnek yalnızca kalıp
kırpıntıları için kullanılır (aşağıda).

Yerelde bulunan örnekler (son ölçüm: okunan notaların beklenen `.txt` ile eşleşme oranı):

| Dosya | Eser | Sayfa | Nota | Son ölçüm | Kaynak ve not |
|---|---|---|---|---|---|
| `hicaz_longa_aydin_oran_kemani_nafiz.pdf` + `.txt` | Hicâz Longa, Aydın Oran / Kemani Nafiz | 1 | 228 | 1.000 | https://www.neyzen.com/nota_arsivi/02_klasik_eserler/034_hicaz/hicaz_longa_aydin_oran_kemani_nafiz.pdf — 300 dpi JPEG, şifreli (boş parola). AEU koma bemolü, hâne–teslim, segno, % |

Yeni örnek eklerken tabloya satır ekle. Beklenen `.txt` elle ve bağımsız denetlenmedi sayılır.

## Çizgili bemol (2 Kasım 2026)

Leland'ın çizgili bemolü (bakiye, −4) küçük ya da düşük çözünürlüklü sayfada düz bemol (küçük mücenneb, −5)
okunuyordu. Sebep sınıflayıcı değil: işaret tek başına her boyutta doğru tanınıyor; çizik dizek çizgisine denk gelince
çizgi silinirken çizik de siliniyor. Okuyucu artık düz bemol bulunca özgün resimde sapın solundaki şeride bakıyor:
oradaki dikey koşu aynı satırlardaki yalın dizek çizgisinden kalınsa işaret bakiye bemolü sayılıyor (güven ×0,8).
Bravura ve Leland'la çizilmiş sentetik sayfalarda (8 değiştirici × 10 nota, ölçek 1 / 0,7 / 0,55) Leland'da −4 → −5
hatası 6'dan 0'a indi, düz bemolde yeni hata yok; Hicâz Longa sayfası hâlâ 1.000. Kalan bilinen karışıklık: düşük
çözünürlükte büyük mücenneb bemolü (−8) bakiye bemolü (−4) okunabiliyor (sınıflayıcı; ölçek 0,55'te 10 notada 3).

## Simge kalıpları

`npm run omr-templates` kalıpları (`omrtemplates.js`) Bravura ve Leland'dan yeniden üretir. Bu klasörde PNG/JPG sayfa
varsa okuyucunun bulduğu simgeleri sınıflarına göre geçici klasöre (`--out <klasör>` ile değişir) döker ve
`liste.txt` yazar. Yanlış satırları silip ya da sınıfını düzeltip `npm run omr-templates -- --accept <liste.txt>`
ile kalan kırpıntılar `scripts/omr-samples.json`'a eklenir; sonraki her üretimde kalıplara katılır.
