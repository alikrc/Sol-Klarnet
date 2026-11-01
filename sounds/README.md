# Çalgı sesleri

`scripts/sounds.py` üretir (`python scripts/sounds.py <iowa_klasörü> <vcsl_darbuka_klasörü>`); uygulama `sampler.js` ile çalar.

- `klarnet.wav`: [University of Iowa Electronic Music Studios](https://theremin.music.uiowa.edu/MISBbclarinet.html),
  Si♭ klarnet, mf (`BbClar.mf.*.aiff`). Site: "may be downloaded and used for any projects, without restrictions".
  Duyulan Re3–Si6 arasında 3 yarım seste bir nota (16 nota), 32 kHz tek kanal, her biri döngülü. Her örneğin
  perdesi ölçülüp `sounds.js`'e yazılır; uygulama örneği `playbackRate = istenen Hz / ölçülen Hz` ile çalar, böylece
  kaydın kendi akordundan bağımsız olarak AEU ve icra perdeleri tam frekansta çıkar.
- `darbuka.wav`: [VCSL](https://github.com/sgossner/VCSL) (Versilian Community Sample Library, Versilian Studios),
  CC0 1.0. `Darbuka_1` düm, `Darbuka_2` tek, `Darbuka_3` ka; iki şiddet, iki tekrar.
- `sounds.js`: örneklerin zaman çizelgesi (başlangıç, döngü, ölçülen perde).

Ud ve bas örnek değildir: `band.js` içinde genişletilmiş Karplus-Strong modeliyle sentezlenir (lisansı uygun, gerçek
ud örnekleri bulunamadı).
