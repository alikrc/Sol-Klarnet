# Nota okuyucu örnekleri

Nota okuyucunun (`omr.js`) gerçek notalarla denendiği örnekler. Örnekler telifli olabildiği için depoya girmez
(`.gitignore`); yalnızca bu dosya girer. Aşağıdakileri indirip bu klasöre koy.

Her örneğin yanında aynı adla bir `.txt` dosyası beklenen notaları uygulamanın nota metniyle, tekrarlar açılmadan,
yazıldığı gibi tutar. Bu dosya yoksa test yalnızca okunanı yazdırır.

Yerelde bulunan örnekler (son ölçüm: okunan notaların beklenen `.txt` ile eşleşme oranı):

| Dosya | Eser | Sayfa | Nota | Son ölçüm | Kaynak ve not |
|---|---|---|---|---|---|
| `hicaz_longa_aydin_oran_kemani_nafiz.pdf` + `.txt` | Hicâz Longa, Aydın Oran / Kemani Nafiz | 1 | 228 | 1.000 | https://www.neyzen.com/nota_arsivi/02_klasik_eserler/034_hicaz/hicaz_longa_aydin_oran_kemani_nafiz.pdf — 300 dpi JPEG, şifreli (boş parola). AEU koma bemolü, hâne–teslim, segno, % |

Yeni örnek eklerken tabloya satır ekle. Beklenen `.txt` elle ve bağımsız denetlenmedi sayılır.

## Simge kalıpları

`npm run omr-templates` kalıpları (`omrtemplates.js`) Bravura ve Leland'dan yeniden üretir. Bu klasörde PNG/JPG sayfa
varsa okuyucunun bulduğu simgeleri sınıflarına göre geçici klasöre (`--out <klasör>` ile değişir) döker ve
`liste.txt` yazar. Yanlış satırları silip ya da sınıfını düzeltip `npm run omr-templates -- --accept <liste.txt>`
ile kalan kırpıntılar `scripts/omr-samples.json`'a eklenir; sonraki her üretimde kalıplara katılır.
