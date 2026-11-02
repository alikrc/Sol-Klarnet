# Gerçek klarnet kayıtları

`iowa/` klasöründe Iowa Üniversitesi'nin serbest Si♭ klarnet kayıtları var (139 nota, pp/mf/ff); `npm run audio-check`
bunları da denetler. Ayrıntı: [iowa/README.md](iowa/README.md). Türk Sol klarneti kayıtları hâlâ gerekli.

Perde bulucuyu gerçek Sol klarnet sesiyle denetlemek için kayıtları bu klasöre koy, sonra:

```bash
npm run audio-check
```

## Koşul sınaması

```bash
npm run audio-check -- testdata/iowa --kosul
```

Kromatik dizi kayıtlarına (Iowa) çalma ortamı benzetilerek uygulanır: `telefon` (300 Hz altı ve 7 kHz üstü kesik),
`gurultu20` / `gurultu10` (oda gürültüsü, SNR dB; eşik uygulamadaki ortam ölçümü gibi gürültünün 2,5 katı), `vibrato`
(±30 sent, 5,5 Hz), `yanki` (RT60 0,6 sn), `sol` (3 yarım ses pes: Sol klarnetin pes bölgesi) ve bunların birleşimleri.
Yalnız birini seçmek için `--kosul gurultu10,sol`. Kayıtlar gerçek klarnettir ama koşullar benzetimdir; sonuç gerçek
Sol klarnet kaydıyla yapılmış sınamanın yerini tutmaz.

Son ölçüm (2 Kasım 2026, 139 nota): temiz, gürültü 20 ve 10 dB, vibrato, yankı ve pesleştirmede 138/139; telefon
süzgeciyle 134/139. Telefondaki 4 hata pp kaydın en pes notaları: süzgeçten sonra −68 dBFS'ye iniyor ve en yüksek
hassasiyetin altında kalıyor (algılanan perde doğru, nota hiç gösterilmiyor). Telefonların otomatik kazancı bunu
yükseltir; gerçek cihazda denenmeli. Kalan 1 hata kaydın kendisinde (Sol♯6 ≈ 50 sent pes çalınmış).

## Dosya adı

`<yazılı nota>_<açıklama>.wav`. Örnekler:

- `Mi3_pes.wav`, `La4_uzun-ton.wav`, `Do6_tiz.wav`: yazılı nota (Sol klarnette yazılı Sol4 = duyulan Re4)
- `Segâh_uzun.wav`, `Dik_Kürdî_vibrato.wav`: AEU perde adı (boşluk yerine alt çizgi); koma sapması o perdeye göre ölçülür
- `taksim-ussak.wav`: nota adı yoksa yalnızca algılanan notaların dökümü verilir

## Neler kaydedilmeli

En değerli set, her register'dan ve farklı koşullardan kısa kayıtlar:

1. Yazılı Mi3'ten Do6'ya her nota, 2–3 saniye düz uzun ton (telefon mikrofonuyla, 50 cm–1 m uzaktan)
2. Aynı notaların birkaçı vibratolu ve hafif (piano) çalınmış hâli
3. Altissimo: Do♯6–Sol6
4. Makam perdeleri: Segâh, Bûselik, Kürdî, Dik Kürdî, Nim Hicaz, Hicaz, Evç, Acem (doğru basıldığından emin olunan)
5. Gürültülü oda ve yankılı oda örnekleri
6. Süslemeler: her birinden 5'er örnek (üstten ve alttan çarpma, çarpmalı tekrar, üst ve alt mordan, yavaş ve hızlı tril,
   kayarak giriş, düşüş), ayrıca aynı notaların süslemesiz hâli (yanlış pozitifleri denetlemek için). Dosya adında süsleme:
   `La4_carpma-ust.wav`, `Sol4_tril-6.wav`
7. Hızlı pasajlar: Rast dizisi ve Sol majör gamı bağlı ve dille, sekizlik ve on altılık, ♩=60/90/120; bir kısmı metronom
   hoparlörden açıkken (sızıntıyı denetlemek için). Dosya adında tempo: `rast-dizi_16lik-bagli_90.wav`

WAV (16/24 bit PCM ya da 32 bit float, mono ya da stereo) okunur. Telefonun ses kaydedicisi genellikle m4a verir;
`ffmpeg -i kayit.m4a kayit.wav` ile çevrilebilir.

Bir kaydın sonucu FAIL ise (doğru nota oranı %95'in altında) dosyayı ve çıktıyı geliştiriciye ilet.
