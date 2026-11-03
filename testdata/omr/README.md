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

## Değiştirici karışıklık tablosu (3 Kasım 2026)

`npm run omr-acc-check -- --bulanik` Bravura ve Leland'dan sentetik sayfalar çizer: her değiştirici (♯ +4, ♭ −5, ♮,
koma ±1, küçük mücenneb ♯ +5, bakiye ♭ −4, büyük mücenneb ±8) 12 notanın önünde, notalar çizgi ve aralıklara dağılmış.
Dizek aralığı 20 px (≈ 300 dpi), 14 (≈ 200 dpi), 11 (≈ 150 dpi) ve 9; `--bulanik` aynı sayfaları 0,8 px bulanıklaştırıp
JPEG 60 ile sıkıştırır (telefon fotoğrafı benzetimi). Okunan koma farkı değiştirici sınıfına geri çevrilir; satır
çizilen, sütun okunan işarettir. `--png <klasör>` sayfaları da yazar.

**Sınırı:** sayfalar okuyucunun kalıplarını üreten yazı tiplerinden çizilir, kâğıt, mürekkep yayılması ve eğik çekim
yoktur; temiz sayfadaki %100 gerçek basılı notada %100 demek değildir. Gerçek sayfa sınaması yukarıdaki örneklerle.

Bu sınamayla bulunup düzeltilenler:

- **Bulanık küçük sayfada düz bemol okunmuyordu** (Leland 11 px bulanık: 12 notada 3). Bemolün kavisi dolup sapın
  ucunda nota başına benziyor, okuyucu sembolü sap + baş diye bölüyordu. Bemol boyundaki (3 sp altı, 1,4 sp'den dar)
  değiştirici artık bölünmüyor
- **Büyük mücenneb bemol (−8) bakiye (−4) okunuyordu**: iki çiziğinden biri dizek çizgisine denk gelince çizgiyle
  siliniyor. Bakiye okunan işarette sapın solundaki sütunlarda çizikler sayılıyor (görünen çizik ya da yalın çizgiden
  kalın çizgi koşusu); yeterince sütunda iki çizik varsa büyük mücenneb. Bravura 11 px bulanıkta hata 1'den 0'a indi
- **Düşük çözünürlük uyarısı** dizek aralığı 8 yerine 10 pikselin altında veriliyor ve koma işaretlerini gözden
  geçirmeyi söylüyor

Son ölçüm (işaret başına 12 nota; 2 yazı tipi × 4 ölçek × temiz/bulanık = 192 nota):

| Durum | Doğru | Kalan karışıklıklar |
|---|---|---|
| Temiz, 20/14/11 px | 648/648 (iki yazı tipi) | yok |
| Temiz, 9 px | Bravura 108/108, Leland 107/108 | Leland bakiye ♭ → ♭ (1) |
| Bulanık, 20/14 px | 432/432 | yok |
| Bulanık, 11 px | Bravura 108/108, Leland 105/108 | Leland büyük mücenneb ♭ → bakiye ♭ (3): iki çizik tek leke olmuş; Bravura'nın kalın tek çiziğinden güvenle ayrılamıyor |
| Bulanık, 9 px | Bravura 96/108, Leland 98/108 | ♯ → büyük mücenneb ♯ (7 ve 4), ♯ okunmadı (2 ve 1), bakiye ♭ → büyük ♭ (Bravura 3), büyük ♭ → bakiye ♭ (Leland 3) |

İşaret başına toplam: ♯ 178/192, ♭ 192/192, ♮ 192/192, koma ♯ 191/192, küçük mücenneb ♯ 192/192, büyük mücenneb ♯
192/192, koma ♭ 192/192, bakiye ♭ 187/192, büyük mücenneb ♭ 186/192. Değişiklikten önce (20/14/11 px) düz bemol 141/144,
büyük mücenneb bemol 140/144'tü. Hicâz Longa sayfası değişiklikten sonra da 228/228.

## Simge kalıpları

`npm run omr-templates` kalıpları (`omrtemplates.js`) Bravura ve Leland'dan yeniden üretir. Bu klasörde PNG/JPG sayfa
varsa okuyucunun bulduğu simgeleri sınıflarına göre geçici klasöre (`--out <klasör>` ile değişir) döker ve
`liste.txt` yazar. Yanlış satırları silip ya da sınıfını düzeltip `npm run omr-templates -- --accept <liste.txt>`
ile kalan kırpıntılar `scripts/omr-samples.json`'a eklenir; sonraki her üretimde kalıplara katılır.
