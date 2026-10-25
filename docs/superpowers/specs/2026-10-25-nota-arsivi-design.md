# Nota arşivi: tasarım

Tarih: 2026-10-25. Proje sahibinin isteği: mirasisaz.com'daki nota bölümünün bütün özellikleri uygulamaya gelsin,
notalar SymbTr'den alınsın, nota arama ve nota ekranı uygulamada öne çıksın. Uygulama ücretsiz kalacak.
İnceleme: `docs/MIRASISAZ.md`.

## Amaç

Öğrenci bir eseri aramadan çalmaya kadar tek yerde yapsın: ara, süz, aç, dinle, yavaşlat, döngüye al, usulle ve
demle birlikte çal, notayı izle, mikrofonla takip ettir, tempolu çalıp değerlendirt.

## Kapsam dışı

- mirasisaz.com'un kendi dosyaları (liste, makam, usul, sözlük metinleri). Kullanım koşulları toplu indirmeyi ve
  başka uygulamada yayımlamayı yasaklıyor. Aynı bilgi birincil kaynaklardan derlenir.
- İnternet: arşiv uygulamanın içinde gelir; yalnız dış bağlantılar (MusicBrainz, YouTube araması, SymbTr MusicXML)
  tarayıcıda açılır.
- PDF/MIDI/abc dışa aktarma (sonraya).

## Veri

- `scripts/symbtr.js <SymbTr deposu>`: SymbTr `txt/` dosyalarını okur, MusicXML başlığından (ilk 6 KB, önbellekli)
  Türkçe ad, bestekâr, güfte yazarı, makam/form/usul adlarını alır.
- `notalar/index.json`: bütün eserlerin dizini (ad, makam, form, usul, bestekâr, güfte yazarı, nota sayısı, süre,
  tempo, ses alanı, karar perdesi, sözlü mü, klarnete sığıyor mu, seviye 1–3, MusicBrainz kimliği).
- `notalar/<id>.json`: notalar `[c, d, süs?, hece?]` (c Rast'a göre koma, d dörtlük), bölümler (ARANAĞME, SAZ,
  1. HANE, TESLİM…), cümle sınırları (SymbTr kod 53), usul değişimleri, tempo.
- Seviye: ses alanı, hız, ritim çeşitliliği, kısa notalar, aksak usul, perde çeşitliliği, süsleme ve uzunluktan
  puan; arşivin üçte birlik dilimleri.
- Lisans: CC BY-NC-SA 4.0. Uygulamada ve README'de SymbTr kaynağı yazılır.
- Kararım: SymbTr'nin 2200 eserinin hepsi alınır (proje sahibi "hepsini al" dedi). Bestekârı 70 yıl içinde ölen
  eserlerde FSEK riski var; README'de not düşülür, istenirse betikte süzgeç eklenir.

## Yer

- Alt menüye beşinci düğme **Notalar** (Akort, Parmak, Çalışma, Notalar, Ayarlar). Çalışma'daki "Eserler" grubunun
  ilk sekmesini (Nota arşivi) açar; böylece mikrofon, metronom ve dron araçları aynı kalır.
- Çalışma ana sayfasında Eserler grubunun başında da kart olarak durur.

## Arşiv ekranı

- Arama kutusu (ad, bestekâr, güfte yazarı, makam, form, usul; Türkçe harf ve şapka duyarsız).
- Süzgeçler: makam, form, usul, bestekâr, seviye, yalnız klarnete sığanlar, yalnız sözlüler, favoriler.
- Sıralama: ada göre, makama göre, kolaydan zora, kısadan uzuna.
- Son açılanlar ve favoriler kısa yolu. Sonuçlar 40'ar 40'ar.

## Eser ekranı

- Künye: ad, bestekâr, güfte, makam · form · usul · ♩ · süre · seviye · nota sayısı. Favori. "Eserlerime ekle"
  (Etüt ve eserler listesine, merdiven ve derslerle kullanılsın). Kaynak satırı, MusicBrainz ve YouTube araması.
- Nota: satırlara bölünmüş (sayfa) ya da tek şerit görünüm; ölçü çizgileri usule göre; AEU koma işaretleri;
  isteğe bağlı perde adları ve güfte heceleri; bölüm başlıkları satırın üstünde.
- Çalma: Çal/Durdur, Baştan, notaya dokununca oradan çal, tempo %25–150 (%100'e dön), A–B ölçü döngüsü,
  bölümü ya da cümleyi tekrar tekrar çal, dem (karar perdesi dronu), usul eşliği (sessiz / metronom / usul
  düm-tek), melodiyi kapat (birlikte çal).
- Mikrofonla: Beni takip et (serbest takip), Tempolu çal (değerlendirmeli), Merdiven.
- Ayarlar: transpoze (perde perde, ±7) ve oktav, otomatik "klarnete sığdır", notayı izle (imleç görünür kalsın),
  sözleri göster, perde adları, parmağı göster, cümleleri göster, nota boyutu (− / +), tam ekran, yazdır.
- Eseri öğren: 7 adım (dinle, yarı hızda dinle, usulü dinle, diziyi dinle, karar sesi, notayı takip et, kendin
  çal); ilerleme eser başına saklanır.
- Benzer eserler: aynı makamda, usulde, formda, bestekârdan.

## Kod

- `archive.js`: `TRAINERS.archive` (arşiv ve eser ekranı), arşiv usul kalıpları.
- `pieces.js`: `drawScore` satır için ek seçenekler (genel indeks, ölçü çizgisi yerleri, hece, ölçü işaretini
  gizleme, yakınlaştırma); `piecePlayer` dışarıdan nota görünümü alabilir, `listen` başlangıç/bitiş, döngü, sessiz
  melodi ve zamanlama geri çağrısı alır, mutlak zamanla kaymadan çalar.
- `practice.js`: sekme, kart, `ctx.droneOff`. `index.html`/`app.js`: Notalar düğmesi.
- `sw.js`, `scripts/build-web.js`: `archive.js` ve `notalar/`.
- Testler yazılmaz (proje kuralı).
