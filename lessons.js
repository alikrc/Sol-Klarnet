// Dersler: sıralı müfredat, her derste kısa anlatım ve geçme koşullu adımlar; günlük çalışma planı.
// Metinler iki dilde ({tr, en}) tutulur; arayüz LANG'a göre seçer. Nota adları adım başlıklarında üretilir.
// Tarayıcıda learn.js'ten sonra <script src="lessons.js"> ile, Node'da require("./lessons.js") ile yüklenir.
//
// Adım türleri (hepsi mikrofonla değerlendirilir, "listen" hariç):
//   listen  { notes | commas }               örnek ezgiyi dinle (geçme koşulu yok)
//   hold    { note, sec, min }               notayı sec saniye tut, en az min puan
//   notes   { notes | commas, maxMiss, hint? }  notaları sırayla çal, en çok maxMiss hata; hint başlığa eklenir ("yarı hızda")
//   quiz    { notes, mode, n, min }          n soruluk parmak testi ("play" çal / "find" bul), en az min doğru
//   scale   { makam, min }                   makam dizisi çıkış-iniş, perdelerin en az min oranı ±1 koma temiz
//   mimic   { makam | commas | notes, len }  taklit oyununda len notalık ezgiye ulaş (notes: makamsız yazılı notalar)
//   vibrato { note, sec }                    notada sec saniye düzenli vibrato (4–8 Hz)
//   glide   { from, to, n }                  from'dan to'ya n kez glissando
//   read    { title, body, fing?, check?, checkId?, checkHint?, links? }  okuma (bilgi) adımı; "Onay" ile geçilir.
//                                             fing: [yazılı nota…] her nota için parmak şeması ve describeFingering tarifi
//                                             (elle parmak tarifi yazılmaz); check: kontrol listesi (checkHint liste notu);
//                                             links: [{ go: SK.go görünümü, el?: kaydırılacak öğe, label }]
//   check   { title, items:[{tr,en}…], checkId }  öz denetim (mikrofonsuz): liste, isteğe bağlı ön kamera aynası; bütün
//                                             maddeler işaretlenince geçilir (işaretler check.<checkId> kaydında)
//   soru    { q, opts, ok, why } | { items:[{ q, opts, ok, why, staff?, fing? }…], min }  bilgi sorusu (mikrofonsuz):
//                                             seçenekler karışık gelir, yanlışta why gösterilir ve soru turun sonunda yeniden
//                                             sorulur; puan ilk denemede doğru bilinen soru sayısı, en az min (varsayılan:
//                                             tek soruda 1, çok soruda %70). staff: [yazılı nota | { w, d }…] dizek çizer,
//                                             score: "<etüt metni>" (meter?) yol işaretleriyle nota çizer,
//                                             fing: <yazılı nota> parmak şemasını gösterir
//   rhythm  { pattern | usul, tempo, bars, silent, min }  metronomla çal, en az min ritim puanı
//   usultap { usul, mode: "listen"|"tap"|"mem", tempo?, min }  usulu elle vur (klarnetsiz): dinle ve say, Düm/Tek düğmeleriyle vur,
//                                             ezberden vur; puanı en az min (usuller.js, ilerleme Usuller sayfasıyla ortak)
//   hece    { mode: "say"|"tap"|"quiz", lv, n?, min? }  ritim hecesi (klarnetsiz): ölçüyü heceleriyle söyle, vur ya da üç notadan bul
//   dynamics{ note, sec, shape, drift? }      crescendo / decrescendo / messa di voce; drift: perdenin en çok kayması
//                                             (en yüksek − en düşük, koma; varsayılan 2 = ±1 koma)
//   artik   { notes, style, tempo, min }       metronomla her vuruşta bir nota; style "legato" (bağlı) | "staccato" (kesik) |
//                                             "tenuto" ya da notalara sırayla uygulanan dizi (null: serbest). Puan (0–100):
//                                             %40 doğru nota, %60 çalışı tutan nota (skills.js artikEval); en az min
//   seyir   { makam, sec, min, focus? }       serbest çalma (taksim), en az min seyir puanı; focus verilirse taksim
//                                             aşamasının puanı ("cumle", "cesni", "karar"; skills.js phraseAnalysis;
//                                             "tiz": tizAnalysis, "uzun": uzunAnalysis dört bölüm); usul (+ tempo) verilirse
//                                             darbuka o usulü çalar, puan usulTaksimAnalysis (cümle sonları usul başında)
//   ear     { mode: "abx"|"makam", level | pool, n, min }  kulak: perde ayırt ya da makam tanı
//   piece   { id, mode: "tempo"|"free", min, cue? } etüt çal (cue: başlıkta yönerge, ör. "güçlü (f)"; ölçülmez): tempoda en az min % doğru nota, serbestte en çok min hata
//   piece   { arsiv, name, from?, to?, tempoPct?, oct?, mode, min }  nota arşivinden eser (ölçü aralığı, temponun yüzdesi,
//                                             oktav kaydırma);
//                                             listen { arsiv, … } aynı eseri dinletir. Kalıp: eserSteps
//   hold'a quality eklenirse ses temizliği de en az o kadar olmalı

const LCORE = typeof module !== "undefined" ? require("./core.js") : { noteName, nearestPerde };
// Etütler repertoire.js'te; Node'da gerektiğinde yüklenir (tarayıcıda repertoire.js lessons.js'ten sonra gelir)
const LREP = () => typeof module !== "undefined" ? require("./repertoire.js") : { etudeById, parseScoreText, expandRepeats };
const LSK = () => typeof module !== "undefined" ? require("./skills.js") : { techPattern, patternKey };
const LPREM = () => typeof module !== "undefined" ? require("./premium.js") : { premiumUnit };
const LLEARN = typeof module !== "undefined" ? require("./learn.js")
  : { MAKAMS, makamById, perdeName, commaToWritten, quizWeight, USULS, makamCadences, similarMakams, makamDiff, seyirText, ICRA_INFO, ablTr };

const UNITS = [
  { id:"baslangic", name:{ tr:"Başlarken", en:"Getting started" }, badge:{ tr:"Yola çıktın", en:"On the road" } },
  { id:"temel",  name:{ tr:"Temeller", en:"Basics" }, badge:{ tr:"Temel çalgıcı", en:"Core player" } },
  { id:"klarino", name:{ tr:"Register ve klarino", en:"Register and clarion" }, badge:{ tr:"Klarino bölgesi", en:"Clarion climber" } },
  { id:"teknik", name:{ tr:"Teknik ve üslup", en:"Technique and style" }, badge:{ tr:"Teknik ve üslup", en:"Technique and style" } },
  { id:"hiz", name:{ tr:"Hız ve teknik", en:"Speed and technique" }, badge:{ tr:"Hızlı parmaklar", en:"Fast fingers" } },
  { id:"susleme", name:{ tr:"Süsleme", en:"Ornaments" }, badge:{ tr:"Süsleme ustası", en:"Ornament master" } },
  { id:"makam",  name:{ tr:"Makamlar", en:"Makams" }, badge:{ tr:"Makam yolcusu", en:"Makam traveller" } },
  // since: ünitenin kendisi sonradan eklendi; sınavı bütün (since'li) derslerinden kurulur (makeExam)
  { id:"turku", since:2, name:{ tr:"Türkü ve yöreler", en:"Türküs and regions" }, badge:{ tr:"Türkü yolcusu", en:"Türkü traveller" } },
  { id:"trakya", name:{ tr:"Trakya ve Roman", en:"Thracian and Romani" }, badge:{ tr:"Trakya ve Roman ustası", en:"Thracian and Romani master" } },
  { id:"ileri",  name:{ tr:"İleri seviye", en:"Advanced" }, badge:{ tr:"Taksimci", en:"Taksim player" } }
];

const LESSONS = [
  // ---- Temeller ----
  { id:"ilk-ses", unit:"temel", notes:[67],
    title:{ tr:"İlk ses: açık Sol", en:"First sound: open G" },
    text:[
      { tr:"Sol klarnette yazılı Sol4 hiçbir delik kapatılmadan çalınır ve Rast perdesidir. Klarnet yazıldığından tam dörtlü pes duyulur; uygulama her yerde yazılı notayı gösterir.",
        en:"On the G clarinet, written G4 is played with every hole open and is the Rast perde. The clarinet sounds a perfect fourth lower than written; the app always shows the written note." },
      { tr:"Kamışı ağızda birkaç dakika nemlendir. Üst dişler ağızlığın üstüne hafifçe değsin, alt dudak alt dişleri örtsün; dudak köşeleri ağızlığı her yandan sarsın, çene düz kalsın.",
        en:"Wet the reed in your mouth for a few minutes. Rest the upper teeth lightly on top of the mouthpiece and cover the lower teeth with the lower lip; the corners of the mouth hug the mouthpiece and the chin stays flat." },
      { tr:"Omuzları kaldırmadan rahat bir nefes al (alt kaburgalar genişler), sesi “tu” hecesiyle dilinle başlat. Önce kısa sesler, sonra uzun ve düz bir ses hedefle.",
        en:"Take a relaxed breath without lifting the shoulders (the lower ribs widen) and start the sound with the tongue on a “too” syllable. Aim for short notes first, then a long, steady one." }
    ],
    tips:[
      { tr:"Ses cızırdıyorsa ağızlığı ağzına biraz az al ya da dudak baskısını azalt.", en:"If it squeaks, take a little less mouthpiece or ease the lip pressure." },
      { tr:"Ses çıkmıyorsa kamış kuru ya da bağ gevşek olabilir.", en:"If there is no sound, the reed may be dry or the ligature loose." }
    ],
    steps:[
      { type:"listen", notes:[67] },
      { type:"hold", note:67, sec:4, min:40 },
      { type:"hold", note:67, sec:8, min:55 }
    ] },

  { id:"sol-el-1", unit:"temel", notes:[66, 64, 62],
    title:{ tr:"Sol el: Fa♯4, Mi4, Re4", en:"Left hand: F♯4, E4, D4" },
    text:[
      { tr:"Sol el üst gövdededir. Başparmak arkadaki deliği kapatınca Fa♯4 çıkar. Buna işaret parmağını eklersen Mi4, orta parmağı da eklersen Re4 olur.",
        en:"The left hand is on the upper joint. Closing the thumb hole on the back gives F♯4. Add the index finger for E4, then the middle finger for D4." },
      { tr:"Delikleri parmak uçlarıyla değil, parmağın yumuşak ve düz yeriyle kapat. Hava kaçarsa ses cızırdar ya da hiç çıkmaz.",
        en:"Cover the holes with the soft, flat pad of the finger, not the tip. A leak makes the note squeak or not speak at all." }
    ],
    tips:[
      { tr:"Çalarken parmak kartında kapalı delikler koyu görünür; kendi parmağınla karşılaştır.", en:"While you play, the fingering card shows closed holes filled in; compare with your own fingers." }
    ],
    steps:[
      { type:"listen", notes:[67, 66, 64, 62] },
      { type:"hold", note:64, sec:4, min:45 },
      { type:"notes", notes:[67, 66, 64, 66, 67, 64, 62, 64, 67], maxMiss:3 },
      { type:"quiz", notes:[62, 64, 66, 67], mode:"play", n:8, min:6 }
    ] },

  { id:"sol-el-2", unit:"temel", notes:[60, 65],
    title:{ tr:"Sol el tamam: Do4 ve Fa4", en:"Full left hand: C4 and F4" },
    text:[
      { tr:"Sol elin üç parmağı ve başparmak kapalıyken Do4 çıkar. Bu, sol elin tam kapalı hâlidir; sağ el ilerleyen derslerde bunun altına eklenir.",
        en:"With the left thumb and three fingers closed you get C4. This is the full left hand; the right hand will be added below it in later lessons." },
      { tr:"Fa4 için Mi4 parmağına sağ elin yan mandalı eklenir (sağ işaret parmağının yanı). Parmak kartında hangi mandal olduğunu gör.",
        en:"F4 is the E4 fingering plus a right-hand side key (side of the right index finger). See which key on the fingering card." }
    ],
    tips:[
      { tr:"Re4 → Do4 geçişinde yüzük parmağını tam kapattığından emin ol; en sık hava kaçağı buradadır.", en:"On D4 → C4 make sure the ring finger seals fully; this is the most common leak." }
    ],
    steps:[
      { type:"listen", notes:[67, 65, 64, 62, 60] },
      { type:"hold", note:60, sec:4, min:45 },
      { type:"notes", notes:[60, 62, 64, 65, 67, 65, 64, 62, 60], maxMiss:3 },
      { type:"quiz", notes:[60, 62, 64, 65, 66, 67], mode:"find", n:8, min:6 }
    ] },

  { id:"sag-el", unit:"temel", notes:[59, 57, 55],
    title:{ tr:"Sağ el: Si3, La3, Sol3", en:"Right hand: B3, A3, G3" },
    text:[
      { tr:"Sol el tam kapalıyken sağ elin işaret parmağını ekle: Si3. Orta parmağı ekle: La3. Yüzük parmağını ekle: Sol3. Sağ el orta ve yüzük deliklerindeki halkalar parmakla birlikte kapanır.",
        en:"With the left hand fully closed, add the right index finger: B3. Add the middle finger: A3. Add the ring finger: G3. The rings on the right middle and ring holes close together with the finger." },
      { tr:"Pes notalar daha çok ve daha yavaş hava ister. Ağız boşluğunu “o” der gibi aç, dudağı sıkma.",
        en:"Low notes want more, slower air. Open the mouth cavity as if saying “o” and don't pinch the lips." }
    ],
    tips:[
      { tr:"Sol3 çıkmıyorsa önce Do4'ü çal, parmakları teker teker ekleyerek in; hangi parmakta bozulduğunu bul.", en:"If G3 won't speak, start on C4 and add fingers one at a time going down; find where it breaks." }
    ],
    steps:[
      { type:"listen", notes:[60, 59, 57, 55] },
      { type:"hold", note:55, sec:6, min:45 },
      { type:"notes", notes:[60, 59, 57, 55, 57, 59, 60, 62, 64, 62, 60, 59, 57, 55], maxMiss:4 },
      { type:"quiz", notes:[55, 57, 59, 60, 62, 64], mode:"play", n:10, min:7 }
    ] },

  { id:"pes", unit:"temel", notes:[53, 52, 58, 54, 56, 61, 63],
    title:{ tr:"Pes bölge ve serçe mandalları", en:"Low register and pinky keys" },
    text:[
      { tr:"Altı delik kapalıyken sağ serçe Fa mandalına basınca Fa3, buna sol serçe Mi mandalını da eklersen Mi3 çıkar. Mi3 Sol klarnetin en pes notasıdır.",
        en:"With all six holes closed, the right pinky F key gives F3; add the left pinky E key for E3, the lowest note on the G clarinet." },
      { tr:"Diyez ve bemoller (Fa♯3, Sol♯3, Si♭3, Do♯4, Mi♭4) serçe ve ince mandallarla çalınır. Her birini parmak kartında incele; bu derste hepsini birer kez tanıyacaksın.",
        en:"The sharps and flats (F♯3, G♯3, B♭3, C♯4, E♭4) use pinky and sliver keys. Study each one on the fingering card; in this lesson you meet them all once." }
    ],
    tips:[
      { tr:"Serçe parmakları gergin değil, mandalların üstünde gevşek dursun.", en:"Keep the pinkies relaxed just above the keys, not tense." }
    ],
    steps:[
      { type:"listen", notes:[55, 53, 52] },
      { type:"hold", note:52, sec:6, min:45 },
      { type:"notes", notes:[52, 53, 55, 57, 59, 60, 59, 57, 55, 53, 52], maxMiss:4 },
      { type:"quiz", notes:[52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64], mode:"find", n:10, min:7 }
    ] },

  { id:"bogaz", unit:"temel", notes:[68, 69, 70],
    title:{ tr:"Boğaz notaları: Sol♯4, La4, Si♭4", en:"Throat tones: G♯4, A4, B♭4" },
    text:[
      { tr:"Açık Sol'un üstündeki üç nota mandallarla çalınır: Sol♯4 için sol işaret parmağının iç yüzüyle yan mandal, La4 için işaret parmağını yukarı kaydırıp La mandalı, Si♭4 için La mandalına ek olarak başparmakla register.",
        en:"The three notes above open G use keys: G♯4 the side key with the inside of the left index finger, A4 the A key by sliding the index finger up, and B♭4 the A key plus the register key with the thumb." },
      { tr:"La4 Dügâh perdesidir; Türk müziğinde en çok karar verilen perdelerden biri. Sesin incelmemesi için ağız boşluğunu açık tut.",
        en:"A4 is the Dügâh perde, one of the most common finals in Turkish music. Keep the mouth cavity open so the tone doesn't thin out." }
    ],
    tips:[
      { tr:"Mi4 → La4 gibi geçişlerde parmakları aynı anda oynat; arada başka nota duyulmasın.", en:"On moves like E4 → A4, move the fingers together so no other note sneaks in." }
    ],
    steps:[
      { type:"listen", notes:[67, 68, 69, 70] },
      { type:"hold", note:69, sec:6, min:50 },
      { type:"notes", notes:[64, 67, 69, 67, 64, 62, 64, 67, 69, 70, 69, 67], maxMiss:3 },
      { type:"quiz", notes:[62, 64, 65, 66, 67, 68, 69, 70], mode:"play", n:10, min:7 }
    ] },

  // ---- Register ve klarino ----
  { id:"register", unit:"klarino", notes:[71, 72, 74],
    title:{ tr:"Register: Si4, Do5, Re5", en:"Register: B4, C5, D5" },
    text:[
      { tr:"Başparmak deliği kapalıyken register mandalına da basarsan ses on ikili (oktav + beşli) yükselir: Mi3 parmağı Si4, Fa3 parmağı Do5, Sol3 parmağı Re5 olur.",
        en:"Pressing the register key while the thumb hole stays closed raises the note by a twelfth (octave + fifth): the E3 fingering gives B4, F3 gives C5, and G3 gives D5." },
      { tr:"Klarino bölgesi daha hızlı ve daha sıkı bir hava ister, ama dudakla sıkmak sesi tizleştirir. Havayı hızlandır, dudağı değil.",
        en:"The clarion register wants faster, more focused air, but biting makes it sharp. Speed up the air, not the lips." },
      { tr:"Si4 Segâh/Bûselik perdesine düşer. Bu ders sonunda pes ve tiz bölgeyi birbirine bağlayabileceksin.",
        en:"B4 falls on the Segâh/Bûselik perde. By the end of this lesson you'll connect the low and high registers." }
    ],
    tips:[
      { tr:"Önce Mi3'ü çal, sesi kesmeden başparmakla register'a bas: Si4'e sıçramalı.", en:"Play E3, then press the register with the thumb without stopping the sound: it should jump to B4." }
    ],
    steps:[
      { type:"listen", notes:[52, 71, 53, 72, 55, 74] },
      { type:"notes", notes:[52, 71, 53, 72, 55, 74], maxMiss:3 },
      { type:"hold", note:72, sec:6, min:50 },
      { type:"notes", notes:[67, 69, 70, 71, 72, 74, 72, 71, 69, 67], maxMiss:3 }
    ] },

  { id:"klarino", unit:"klarino", notes:[76, 77, 78, 79, 81, 83, 84, 73, 75, 80, 82],
    title:{ tr:"Klarino bölgesi: hepsi birden", en:"Clarion register: all together" },
    text:[
      { tr:"Klarino parmakları pes bölgenin aynısıdır, yalnızca register basılıdır: La3 → Mi5, Si3 → Fa♯5, Do4 → Sol5, Re4 → La5, Mi4 → Si5. Do6 için sol elde yalnızca orta parmak kapalıdır.",
        en:"Clarion fingerings are the low ones with the register pressed: A3 → E5, B3 → F♯5, C4 → G5, D4 → A5, E4 → B5. For C6 only the left middle finger is down." },
      { tr:"Sol5 Gerdâniye, La5 Muhayyer perdesidir; makamların tiz bölgesinde sık kullanılır.",
        en:"G5 is Gerdâniye and A5 is Muhayyer; makams use them often in the upper range." }
    ],
    tips:[
      { tr:"Tiz notalar tizleşmeye eğilimlidir; entonasyon izini izle, gerekirse çeneyi gevşet.", en:"High notes tend to go sharp; watch the intonation trace and loosen the jaw if needed." }
    ],
    steps:[
      { type:"listen", notes:[74, 76, 78, 79, 81, 83, 84] },
      { type:"notes", notes:[72, 74, 76, 77, 79, 81, 83, 84, 83, 81, 79, 77, 76, 74, 72], maxMiss:4 },
      { type:"hold", note:79, sec:8, min:55 },
      { type:"quiz", notes:[71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84], mode:"find", n:10, min:7 },
      { type:"quiz", notes:[71, 72, 74, 76, 77, 78, 79, 81, 83, 84], mode:"play", n:10, min:7 }
    ] },

  // ---- Teknik ve üslup ----
  { id:"uzun-ton", unit:"teknik", notes:[],
    title:{ tr:"Uzun ton ve temiz perde", en:"Long tones and clean pitch" },
    text:[
      { tr:"Uzun ton, klarnetçinin günlük ekmeğidir: sesi sabit, perdeyi temiz ve tonu dolgun tutmayı öğretir. Uygulama sapmanın dağılımını, perdeye yakınlığı ve süreyi puanlar.",
        en:"Long tones are a clarinettist's daily bread: they teach a steady sound, clean pitch and a full tone. The app scores the spread of deviation, closeness to the perde and duration." },
      { tr:"AEU sisteminde bir oktav 53 komadır; bir tam ses 9 koma. ±1 koma içinde kalan ses temiz sayılır. Durak sesini (dron) açıp onunla birlikte çalmak kulağını eğitir.",
        en:"In the AEU system an octave has 53 commas and a whole tone is 9. Staying within ±1 comma counts as clean. Playing along with the drone trains your ear." }
    ],
    tips:[
      { tr:"Sesin sonunu da başı kadar özenle bitir: perde düşmesin.", en:"End the note as carefully as you start it: don't let the pitch sag." },
      { tr:"Entonasyon haritasını aç; hangi notaları tiz ya da pes çaldığını gör.", en:"Turn on the intonation map to see which notes you play sharp or flat." }
    ],
    steps:[
      { type:"hold", note:67, sec:12, min:65 },
      { type:"hold", note:62, sec:12, min:65 },
      { type:"hold", note:69, sec:12, min:65 },
      { type:"hold", note:74, sec:12, min:65 },
      { type:"hold", note:55, sec:12, min:65 }
    ] },

  { id:"glissando", unit:"teknik", notes:[],
    title:{ tr:"Glissando", en:"Glissando" },
    text:[
      { tr:"Türk klarnetinin imzası kayan seslerdir. Glissando'da parmaklar deliklerden yavaşça kayarak açılır, dudak da sesi taşır; iki nota arasında perdeler kesintisiz duyulur.",
        en:"Sliding sounds are the signature of the Turkish clarinet. In a glissando the fingers roll slowly off the holes while the lips carry the sound, so every pitch between two notes is heard." },
      { tr:"Önce Re4'ten Sol4'e kay: parmakları birer birer değil, deliklerin kenarından sıyırarak kaldır. Uygulama kaymayı entonasyon izinde kesik çizgiyle işaretler.",
        en:"Start with D4 to G4: don't lift the fingers one by one, slide them off the edges of the holes. The app marks the slide with a dashed line on the intonation trace." }
    ],
    tips:[
      { tr:"Hızlı bir kayış atlama gibi duyulur; kaymayı en az yarım saniyeye yay.", en:"A fast slide sounds like a jump; stretch it over at least half a second." }
    ],
    steps:[
      { type:"glide", from:62, to:67, n:3 },
      { type:"glide", from:64, to:69, n:3 },
      { type:"glide", from:69, to:72, n:2 }
    ] },

  { id:"vibrato", unit:"teknik", notes:[],
    title:{ tr:"Vibrato", en:"Vibrato" },
    text:[
      { tr:"Türk klarnetinde vibrato çoğunlukla çene ve dudakla yapılır: çeneyi çok az, düzenli aralıklarla oynatarak perde hafifçe aşağı-yukarı dalgalanır.",
        en:"Turkish clarinet vibrato is mostly made with the jaw and lips: moving the jaw very slightly and evenly makes the pitch wave gently up and down." },
      { tr:"Önce yavaş ve geniş başla, sonra saniyede 5–6 dalgaya çık. Uygulama vibratonun hızını (Hz) ve derinliğini (± koma) ölçer; burada 4–8 Hz arası düzenli vibrato aranır.",
        en:"Start slow and wide, then build up to 5–6 waves per second. The app measures the rate (Hz) and depth (± commas); here an even vibrato between 4 and 8 Hz is required." }
    ],
    tips:[
      { tr:"Vibrato perdenin etrafında dalgalanmalı, perdeyi aşağı çekmemeli.", en:"Vibrato should wave around the perde, not drag it down." }
    ],
    steps:[
      { type:"vibrato", note:67, sec:2 },
      { type:"vibrato", note:69, sec:3 },
      { type:"vibrato", note:74, sec:3 }
    ] },

  // ---- Makamlar ----
  { id:"rast-giris", unit:"makam", notes:[], makam:"rast",
    title:{ tr:"Perdeler ve koma: Rast beşlisi", en:"Perdes and commas: the Rast pentachord" },
    text:[
      { tr:"Türk müziğinde notalar perde adıyla anılır. Rast (yazılı Sol4), Dügâh (La4), Segâh (Si4), Çargâh (Do5) ve Nevâ (Re5) Rast beşlisini kurar.",
        en:"In Turkish music notes are called by perde names. Rast (written G4), Dügâh (A4), Segâh (B4), Çargâh (C5) and Nevâ (D5) form the Rast pentachord." },
      { tr:"Segâh, Batı müziğindeki Si'den biraz pestir (Rast'tan 17 koma). Klarnette bunu dudakla hafifçe indirerek bulursun; göstergede koma sapmasını izle.",
        en:"Segâh is a little lower than Western B (17 commas above Rast). On the clarinet you find it by lowering the pitch slightly with the lips; watch the comma deviation on the display." }
    ],
    tips:[
      { tr:"Rast'ı dron yapıp beşliyi onun üstünde çal; Segâh'ın yerini kulağınla da duy.", en:"Set Rast as the drone and play the pentachord over it; hear where Segâh sits." }
    ],
    steps:[
      { type:"listen", commas:[0, 9, 17, 22, 31, 22, 17, 9, 0] },
      { type:"notes", commas:[0, 9, 17, 22, 31, 22, 17, 9, 0], maxMiss:3 },
      { type:"hold", note:71, sec:6, min:50, comma:17 },
      { type:"mimic", commas:[0, 9, 17, 22, 31], len:4 }
    ] },

  { id:"rast", unit:"makam", notes:[], makam:"rast",
    title:{ tr:"Rast makamı", en:"Makam Rast" },
    text:[
      { tr:"Rast, Rast beşlisine Nevâ'da Rast dörtlüsü eklenerek kurulur. Çıkarken Evç, inerken genellikle Acem basılır. Nevâ'da yarım karar, Rast'ta tam karar verilir.",
        en:"Rast is a Rast pentachord with a Rast tetrachord on Nevâ. Evç is used going up and usually Acem coming down. Half cadence on Nevâ, final on Rast." }
    ],
    tips:[
      { tr:"Evç (yazılı Fa♯5) çoğu klarnette biraz tiz çıkar; dudakla indir.", en:"Evç (written F♯5) comes out a bit sharp on most clarinets; lower it with the lips." }
    ],
    steps:[
      { type:"listen", commas:[0, 9, 17, 22, 31, 40, 48, 53, 44, 40, 31, 22, 17, 9, 0] },
      { type:"scale", makam:"rast", min:0.5 },
      { type:"notes", commas:[0, 9, 17, 22, 31, 22, 17, 22, 9, 0, 31, 40, 44, 40, 31, 22, 17, 9, 0], maxMiss:4 },
      { type:"mimic", makam:"rast", len:5 }
    ] },

  { id:"ussak", unit:"makam", notes:[], makam:"ussak",
    title:{ tr:"Uşşak makamı", en:"Makam Uşşak" },
    text:[
      { tr:"Uşşak, Dügâh'ta (yazılı La4) Uşşak dörtlüsü ile Nevâ'da Bûselik beşlisinden oluşur. Durak Dügâh, güçlü Nevâ'dır. Segâh perdesi Uşşak'ın rengini verir.",
        en:"Uşşak is an Uşşak tetrachord on Dügâh (written A4) plus a Bûselik pentachord on Nevâ. The final is Dügâh, the dominant Nevâ. The Segâh perde gives Uşşak its colour." },
      { tr:"Karara giderken sık sık Rast perdesine (yeden) inilip Dügâh'a dönülür.",
        en:"Approaching the final, the melody often dips to Rast (the leading tone) and returns to Dügâh." }
    ],
    tips:[
      { tr:"Durağı dron yap: Dügâh üstünde Segâh'ın pesliğini duymak kolaylaşır.", en:"Use the final as the drone: Segâh's lowness is easier to hear over Dügâh." }
    ],
    steps:[
      { type:"listen", commas:[9, 17, 22, 31, 22, 17, 9, 0, 9] },
      { type:"scale", makam:"ussak", min:0.55 },
      { type:"notes", commas:[9, 17, 22, 31, 40, 31, 22, 17, 22, 17, 9, 0, 9], maxMiss:3 },
      { type:"mimic", makam:"ussak", len:5 }
    ] },

  { id:"huseyni", unit:"makam", notes:[], makam:"huseyni",
    title:{ tr:"Hüseynî makamı", en:"Makam Hüseynî" },
    text:[
      { tr:"Hüseynî, Dügâh'ta Hüseynî beşlisi ile Hüseynî perdesinde (yazılı Mi5) Uşşak dörtlüsünden oluşur. Güçlüsü Hüseynî'dir; ezgi bu perdenin çevresinde dolaşır.",
        en:"Hüseynî is a Hüseynî pentachord on Dügâh plus an Uşşak tetrachord on the Hüseynî perde (written E5). The dominant is Hüseynî; the melody circles around it." },
      { tr:"Çıkarken Evç, inerken Acem kullanılır; Uşşak'tan farkı güçlünün yeridir.",
        en:"Evç going up, Acem coming down; it differs from Uşşak by where the dominant sits." }
    ],
    tips:[],
    steps:[
      { type:"listen", commas:[9, 17, 22, 31, 40, 48, 40, 44, 40, 31, 22, 17, 9] },
      { type:"scale", makam:"huseyni", min:0.55 },
      { type:"notes", commas:[31, 40, 31, 40, 44, 40, 31, 22, 17, 22, 31, 22, 17, 9], maxMiss:3 },
      { type:"mimic", makam:"huseyni", len:5 }
    ] },

  { id:"hicaz", unit:"makam", notes:[], makam:"hicaz",
    title:{ tr:"Hicaz makamı", en:"Makam Hicaz" },
    text:[
      { tr:"Hicaz, Dügâh'ta Hicaz dörtlüsü (Dügâh, Dik Kürdî, Nim Hicaz, Nevâ) ile Nevâ'da Rast beşlisinden oluşur. Dik Kürdî ile Nim Hicaz arasındaki geniş aralık Hicaz'ın tanınan rengidir.",
        en:"Hicaz is a Hicaz tetrachord on Dügâh (Dügâh, Dik Kürdî, Nim Hicaz, Nevâ) plus a Rast pentachord on Nevâ. The wide step between Dik Kürdî and Nim Hicaz is its familiar colour." },
      { tr:"Dik Kürdî yazılı Si♭4, Nim Hicaz yazılı Do♯5 parmağıyla çalınır.",
        en:"Dik Kürdî uses the written B♭4 fingering and Nim Hicaz the written C♯5 fingering." }
    ],
    tips:[
      { tr:"Nim Hicaz'ı fazla tiz basma; Nevâ'ya yaslanan bir yeden gibi düşün.", en:"Don't push Nim Hicaz too high; think of it leaning towards Nevâ." }
    ],
    steps:[
      { type:"listen", commas:[9, 14, 26, 31, 26, 14, 9] },
      { type:"scale", makam:"hicaz", min:0.55 },
      { type:"notes", commas:[9, 14, 26, 31, 40, 31, 26, 14, 9, 14, 26, 31, 44, 40, 31, 26, 14, 9], maxMiss:4 },
      { type:"mimic", makam:"hicaz", len:5 }
    ] },

  { id:"nihavend", unit:"makam", notes:[], makam:"nihavend",
    title:{ tr:"Nihâvend makamı", en:"Makam Nihâvend" },
    text:[
      { tr:"Nihâvend, Rast'ta Bûselik beşlisi ile Nevâ'da Kürdî dörtlüsünden oluşur; çıkarken Hicaz dörtlüsü (Evç) de kullanılır. Batı minörüne benzer ama Kürdî perdesi ondan biraz farklıdır.",
        en:"Nihâvend is a Bûselik pentachord on Rast plus a Kürdî tetrachord on Nevâ; going up a Hicaz tetrachord (Evç) is also used. It resembles Western minor, but the Kürdî perde differs slightly." }
    ],
    tips:[],
    steps:[
      { type:"listen", commas:[0, 9, 13, 22, 31, 22, 13, 9, 0] },
      { type:"scale", makam:"nihavend", min:0.55 },
      { type:"notes", commas:[0, 9, 13, 22, 31, 35, 48, 53, 44, 35, 31, 22, 13, 9, 0], maxMiss:4 },
      { type:"mimic", makam:"nihavend", len:5 }
    ] },

  { id:"kurdi", unit:"makam", notes:[], makam:"kurdi",
    title:{ tr:"Kürdî makamı", en:"Makam Kürdî" },
    text:[
      { tr:"Kürdî, Dügâh'ta Kürdî dörtlüsü (Dügâh, Kürdî, Çargâh, Nevâ) ile Nevâ'da Bûselik beşlisinden oluşur. Dügâh ile Kürdî arası küçük (4 koma) bir adımdır.",
        en:"Kürdî is a Kürdî tetrachord on Dügâh (Dügâh, Kürdî, Çargâh, Nevâ) plus a Bûselik pentachord on Nevâ. Dügâh to Kürdî is a small step (4 commas)." }
    ],
    tips:[],
    steps:[
      { type:"listen", commas:[9, 13, 22, 31, 22, 13, 9] },
      { type:"scale", makam:"kurdi", min:0.55 },
      { type:"notes", commas:[9, 13, 22, 31, 40, 44, 40, 31, 22, 13, 9], maxMiss:3 },
      { type:"mimic", makam:"kurdi", len:5 }
    ] },

  { id:"saba", unit:"makam", notes:[], makam:"saba",
    title:{ tr:"Saba makamı", en:"Makam Saba" },
    text:[
      { tr:"Saba, Dügâh'ta Saba dörtlüsü (Dügâh, Segâh, Çargâh, Hicaz) ile kurulur; Çargâh'ta Hicaz çeşnisi duyulur. Diziyi oktavda tekrar etmez, bu yüzden hüzünlü ve kendine has bir renk taşır.",
        en:"Saba is built on a Saba tetrachord on Dügâh (Dügâh, Segâh, Çargâh, Hicaz), with a Hicaz flavour on Çargâh. Its scale doesn't repeat at the octave, which gives it a mournful, unique colour." },
      { tr:"Hicaz perdesi yazılı Do♯5 parmağıyla çalınır; Çargâh'tan hemen sonra geldiği için temiz basmak zordur.",
        en:"The Hicaz perde uses the written C♯5 fingering; coming right after Çargâh it is hard to place cleanly." }
    ],
    tips:[],
    steps:[
      { type:"listen", commas:[9, 17, 22, 27, 22, 17, 9] },
      { type:"scale", makam:"saba", min:0.5 },
      { type:"notes", commas:[9, 17, 22, 27, 22, 17, 9, 17, 22, 27, 40, 27, 22, 17, 9], maxMiss:4 },
      { type:"mimic", makam:"saba", len:5 }
    ] },

  { id:"segah", unit:"makam", notes:[], makam:"segah",
    title:{ tr:"Segâh makamı", en:"Makam Segâh" },
    text:[
      { tr:"Segâh makamının durağı Segâh perdesidir (yazılı Si4). Segâh beşlisi üstünde Nevâ ve Evç çevresinde gezinir, Segâh'ta karar verir.",
        en:"Makam Segâh ends on the Segâh perde (written B4). It wanders around Nevâ and Evç over a Segâh pentachord and resolves to Segâh." },
      { tr:"Durak perdesi Batı Si'sinden pes olduğu için bu makamda dudak kontrolü özellikle önemlidir.",
        en:"Because the final is lower than Western B, lip control matters especially in this makam." }
    ],
    tips:[],
    steps:[
      { type:"listen", commas:[17, 22, 31, 22, 17, 9, 17] },
      { type:"scale", makam:"segah", min:0.5 },
      { type:"notes", commas:[17, 22, 31, 40, 48, 40, 31, 22, 17, 9, 17], maxMiss:3 },
      { type:"mimic", makam:"segah", len:5 }
    ] },

  { id:"huzzam", unit:"makam", notes:[], makam:"huzzam",
    title:{ tr:"Hüzzam makamı", en:"Makam Hüzzam" },
    text:[
      { tr:"Hüzzam da Segâh'ta karar verir, ama Nevâ'da Hicaz çeşnisi (Hisar, Evç) belirgindir. Hisar uygulamada biraz tiz basılır.",
        en:"Hüzzam also ends on Segâh, but has a prominent Hicaz flavour on Nevâ (Hisar, Evç). In practice Hisar is played a little high." }
    ],
    tips:[],
    steps:[
      { type:"listen", commas:[17, 22, 31, 36, 48, 36, 31, 22, 17] },
      { type:"scale", makam:"huzzam", min:0.5 },
      { type:"notes", commas:[17, 22, 31, 36, 48, 53, 48, 36, 31, 22, 17, 9, 17], maxMiss:3 },
      { type:"mimic", makam:"huzzam", len:5 }
    ] }
];

// ---- Başlarken: hiç klarnet çalmamış biri için ----
const BASLANGIC = [
  { id:"klarneti-tani", unit:"baslangic", notes:[],
    title:{ tr:"Klarnetin parçaları ve montajı", en:"The parts of the clarinet and assembly" },
    text:[
      { tr:"Sol klarnet Türk müziğinde en yaygın klarnettir. Çoğu Albert sistemdir: Batı'daki Boehm klarnetten daha az mandalı ve daha çok açık deliği vardır; bu da kayan seslere (glissando) ve dudakla perde oynatmaya uygundur.",
        en:"The G clarinet is the most common clarinet in Turkish music. Most are Albert-system: fewer keys and more open holes than the Western Boehm clarinet, which suits slides (glissando) and bending the pitch with the lips." }
    ],
    tips:[
      { tr:"Klarneti kurarken mandallara değil, gövdenin tahta kısmına bastır; mandal ve halkalar kolay eğilir.", en:"When assembling, push on the wood, not the keys; keys and rings bend easily." }
    ],
    steps:[
      { type:"read", title:{ tr:"Parçalar", en:"The parts" }, body:[
        { tr:"Yukarıdan aşağı: ağızlık (bek; kamış ve bağ üstündedir), baş (fıçı), üst gövde (sol el), alt gövde (sağ el) ve kalak. Arkadaki başparmak deliği ve register mandalı sol başparmakla kullanılır; sağ başparmak alt gövdenin arkasındaki dayanağın altına girer.",
          en:"From the top: the mouthpiece (with reed and ligature), the barrel, the upper joint (left hand), the lower joint (right hand) and the bell. The thumb hole and register key on the back are for the left thumb; the right thumb goes under the thumb rest on the back of the lower joint." },
        { tr:"Uygulamadaki parmak şeması klarneti senin gözünden gösterir: üstte sol el, altta sağ el; başparmak deliği ve register solda ayrıca çizilidir.",
          en:"The fingering chart in the app shows the clarinet from your point of view: left hand on top, right hand below; the thumb hole and register key are drawn separately on the left." } ] },
      { type:"read", title:{ tr:"Kurma sırası", en:"Assembly order" }, body:[
        { tr:"Mantarlar kuruysa biraz mantar yağı sür. Gövdeleri döndürerek, zorlamadan tak: kalak alt gövdeye, alt gövde üst gövdeye (köprü mandalları hizalı olsun; takarken üst gövdenin halkalarına basıp köprüyü kaldır), sonra baş ve ağızlık.",
          en:"If the corks are dry, add a little cork grease. Twist the joints together without forcing: bell to lower joint, lower to upper joint (line up the bridge keys; press the upper rings to lift the bridge while fitting), then barrel and mouthpiece." },
        { tr:"Kamışı en son, ağızlık yerine oturduktan sonra tak (sonraki ders). Sökerken tersi sırayla; önce kamışı çıkar.",
          en:"Put the reed on last, once the mouthpiece is in place (next lesson). Take it apart in reverse order, reed first." } ] },
      { type:"read", title:{ tr:"Bakım ve saklama", en:"Care and storage" }, body:[
        { tr:"Çaldıktan sonra içini temizleme bezi (swab) ile kurula, kamışı çıkarıp kutusuna koy. Klarneti güneşte, kaloriferin yanında ya da soğuk arabada bırakma; soğuk tahtayı birden ısıtma: tahta çatlayabilir.",
          en:"After playing, pull a swab through the bore and put the reed back in its case. Never leave the clarinet in the sun, by a radiator or in a cold car, and don't warm cold wood suddenly: it can crack." },
        { tr:"Mandallar sertleşir ya da ses bir yerden hava kaçırır gibi olursa (özellikle pes notalarda) yastıklar sızdırıyor olabilir: bir tamirciye ya da hocana göster.",
          en:"If keys get stiff or the sound seems to leak somewhere (especially on low notes), the pads may be leaking: show it to a repairer or your teacher." } ] }
    ] },

  { id:"kamis", unit:"baslangic", notes:[],
    title:{ tr:"Kamış seçimi ve ağızlığa takılması", en:"Choosing a reed and fitting it" },
    text:[
      { tr:"Kamış sesin kaynağıdır: sert ya da yumuşak oluşu, ağızlığın (bekin) açıklığına ve senin ağzına uymalıdır. Tek bir doğru numara yoktur.",
        en:"The reed is where the sound starts: how hard or soft it is must suit the mouthpiece opening and your embouchure. There is no single right number." }
    ],
    tips:[
      { tr:"Yeni kamışı ilk günlerde kısa süre çal; birkaç kamışı sırayla kullanmak hepsinin ömrünü uzatır.", en:"Play a new reed only briefly for the first days; rotating a few reeds makes them all last longer." }
    ],
    steps:[
      { type:"read", title:{ tr:"Hangi kamış?", en:"Which reed?" }, body:[
        { tr:"Numara markaya göre değişir: bir markanın 2½'si başka bir markanın 3'ü kadar sert olabilir. Bek de etkiler: açıklığı geniş (açık) bek genellikle daha yumuşak, dar (kapalı) bek daha sert kamışla iyi çalışır. Başlarken görece yumuşak bir kamışla başlamak yaygındır, ama bu bir kural değil.",
          en:"Strength numbers differ between brands: one brand's 2½ can be as hard as another's 3. The mouthpiece matters too: a wide (open) tip usually works with a softer reed, a narrow (close) tip with a harder one. Starting on a relatively soft reed is common, but it isn't a rule." },
        { tr:"Kulakla karar ver: ses ince, cızırtılı ve tize kaçıyorsa ya da kuvvetli çalınca kamış kapanıyorsa kamış yumuşak olabilir. Ses çıkarmak zor, ses havalı ve pes notalar geç konuşuyorsa sert olabilir. Kamışını hocanla birlikte seç; ilerledikçe değişebilir.",
          en:"Decide by ear: if the sound is thin, buzzy and goes sharp, or the reed closes up when you play loud, it may be too soft. If it's hard to get a sound, the tone is airy and low notes are slow to speak, it may be too hard. Choose with your teacher; it may change as you progress." } ] },
      { type:"read", title:{ tr:"Takma", en:"Fitting it" }, body:[
        { tr:"Kamışın ucunu birkaç dakika ağzında ya da suda ıslat. Ağızlığın düz yüzüne yerleştir: kamışın ucu ağızlığın ucuyla aynı hizada ya da kıl payı aşağıda, kamış ortalanmış olsun.",
          en:"Wet the reed tip in your mouth or in water for a few minutes. Place it on the flat side of the mouthpiece: tip level with the mouthpiece tip or a hair below, and centred." },
        { tr:"Bağı kamışın kalın kısmına geçir, vidaları yalnızca kamış kaymayacak kadar sık. Fazla sıkmak kamışın titreşimini boğar. Ucu kırık ya da çatlak kamışı kullanma.",
          en:"Slide the ligature over the thick part of the reed and tighten the screws only enough to stop it slipping. Over-tightening chokes the reed. Don't use a reed with a chipped or cracked tip." } ] }
    ] },

  { id:"durus-nefes", unit:"baslangic", notes:[67],
    title:{ tr:"Doğru oturuş ve klarneti tutuş", en:"Sitting well and holding the clarinet" },
    text:[
      { tr:"Rahat bir duruş nefesi ve parmakları serbest bırakır. Bu derste oturuşu ve tutuşu kurup açık Sol'ü kısa kısa çalacaksın; ağız ve nefes ayrıntıları sonraki derslerde.",
        en:"A relaxed posture frees the breath and the fingers. In this lesson you set up sitting and holding, then play short open Gs; embouchure and breathing come in the next lessons." }
    ],
    tips:[
      { tr:"Klarneti ağzına getir, başını klarnete eğme.", en:"Bring the clarinet to your mouth; don't bend your head down to it." }
    ],
    steps:[
      { type:"read", title:{ tr:"Oturuş", en:"Sitting" }, body:[
        { tr:"Sandalyenin önüne doğru otur, ayaklar yere düz bassın. Sırt dik ama kaskatı değil; omuzlar düşük ve gevşek. Ayakta çalarken ağırlık iki ayağa eşit dağılsın.",
          en:"Sit towards the front of the chair with both feet flat on the floor. Back upright but not stiff; shoulders low and loose. Standing, spread your weight evenly on both feet." },
        { tr:"Başın dik; çene ne öne uzansın ne göğse gömülsün. Klarnet gövdenden yaklaşık 30–40 derece açıyla öne uzanır. Tam açı bekin ağza giriş açısına ve kişiye göre değişir; hocan ayarlar.",
          en:"Keep your head up, the chin neither jutting forward nor tucked in. The clarinet points forward at roughly 30–40 degrees from your body. The exact angle depends on how the mouthpiece meets your mouth and on you; your teacher will adjust it." } ] },
      { type:"read", title:{ tr:"Tutuş", en:"Holding" }, body:[
        { tr:"Klarnetin ağırlığını sağ başparmak (dayanağın altında) taşır; ağız ve sol el yalnızca dengeler. Bilekler düz, dirsekler gövdeden hafifçe açık.",
          en:"The right thumb (under the thumb rest) carries the clarinet's weight; the mouth and left hand only steady it. Wrists straight, elbows slightly away from the body." },
        { tr:"Parmaklar doğal bir kavisle deliklerin üstünde, onlara yakın dursun. Kapatırken parmağın yumuşak ve düz yerini kullan, bastırma: delik sızdırmadan kapanınca yeter.",
          en:"Fingers curve naturally and hover close above the holes. Cover with the soft, flat pad of the finger without pressing hard: a sealed hole is enough." } ],
        // Kontrol listesi (isteğe bağlı, geçmeyi engellemez): maddeler yukarıdaki anlatımdan
        checkId:"durus", check:[
          { tr:"Sandalyenin önündeyim, iki ayağım yere düz basıyor", en:"I sit towards the front of the chair, both feet flat on the floor" },
          { tr:"Sırtım dik ama gergin değil; omuzlarım düşük", en:"My back is upright but not stiff; my shoulders are low" },
          { tr:"Başım dik; klarneti ağzıma getiriyorum, başımı eğmiyorum", en:"My head is up; I bring the clarinet to my mouth instead of bending down" },
          { tr:"Ağırlığı sağ başparmak taşıyor; bileklerim düz", en:"The right thumb carries the weight; my wrists are straight" },
          { tr:"Dirseklerim gövdemden hafifçe açık", en:"My elbows are slightly away from my body" }
        ] },
      { type:"listen", notes:[67] },
      { type:"hold", note:67, sec:3, min:30 },
      { type:"hold", note:67, sec:6, min:45 }
    ] },

  { id:"eller", unit:"baslangic", notes:[],
    title:{ tr:"Sol ve sağ el parmak pozisyonları", en:"Left- and right-hand positions" },
    text:[
      { tr:"Sol el üstte, sağ el altta. Sol başparmak arkadaki deliği ve register mandalını, sol 1-2-3 parmaklar üst gövdenin üç deliğini kapatır. Sağ 1-2-3 parmaklar alt gövdenin üç deliğini kapatır, sağ başparmak dayanaktadır. Serçe parmaklar alttaki mandalları kullanır.",
        en:"Left hand on top, right hand below. The left thumb covers the thumb hole and works the register key; left fingers 1-2-3 cover the three holes of the upper joint. Right fingers 1-2-3 cover the three holes of the lower joint and the right thumb sits on the rest. The little fingers work the low keys." },
      { tr:"Albert klarnette birçok delik açıktır: parmak deliği tam ortalamazsa hava kaçar ve ses cızırdar. Parmağın düz yerini deliğin ortasına koy.",
        en:"On an Albert clarinet many holes are open: if a finger misses the centre the hole leaks and the note squeaks. Place the flat pad right over the centre." }
    ],
    tips:[
      { tr:"Kullanmadığın parmakları deliklerden uzaklaştırma; bir iki santim yukarıda bekleyen parmak hızlı ve temiz geçer.", en:"Don't lift unused fingers far; a finger waiting a centimetre or two above the hole moves quickly and cleanly." },
      { tr:"Parmak kartında koyu delikler kapalı demektir; çalmadan önce kendi elinle karşılaştır.", en:"Dark holes on the fingering card are closed; compare with your own hand before playing." }
    ],
    steps:[
      { type:"read", title:{ tr:"Gevşek eller", en:"Relaxed hands" }, body:[
        { tr:"Elin bir topu tutar gibi yuvarlak dursun; parmaklar gergin ya da dümdüz olmasın. Bileği kırma, başparmakla klarneti sıkma.",
          en:"Keep your hand rounded as if holding a ball; fingers neither tense nor straight. Don't bend the wrist or squeeze the clarinet with the thumb." },
        { tr:"Aynada ya da telefon kamerasıyla kendine bak: omuz kalkıyor mu, parmaklar delikten çok uzaklaşıyor mu, serçe parmak gergin mi?",
          en:"Watch yourself in a mirror or on the phone camera: are your shoulders rising, are the fingers lifting far from the holes, is the little finger tense?" } ],
        checkId:"eller", check:[
          { tr:"Sol el üstte, sağ el altta", en:"Left hand on top, right hand below" },
          { tr:"Ellerim top tutar gibi yuvarlak; parmaklar dümdüz ya da gergin değil", en:"My hands are rounded as if holding a ball; fingers not straight or tense" },
          { tr:"Parmağın düz yeri deliğin tam ortasında", en:"The flat pad of each finger sits right over the centre of the hole" },
          { tr:"Kullanmadığım parmaklar deliğin bir iki santim üstünde bekliyor", en:"Unused fingers wait a centimetre or two above the holes" },
          { tr:"Başparmakla klarneti sıkmıyorum; serçe parmaklarım gevşek", en:"I don't squeeze with the thumb; my little fingers are relaxed" },
          { tr:"Çalarken omuzlarım kalkmıyor", en:"My shoulders don't rise while I play" }
        ] },
      { type:"quiz", notes:[62, 64, 66, 67], mode:"find", n:6, min:4 }
    ] },

  { id:"agizlik", unit:"baslangic", notes:[67],
    title:{ tr:"Ağızlık ve dudak pozisyonu", en:"Mouthpiece and lip position" },
    text:[
      { tr:"Ağız pozisyonunda (embouchure) amaç iki şeyi birlikte tutmaktır: kamışın serbestçe titreyebileceği kadar gevşeklik ve havanın kaçmayacağı kadar sızdırmazlık.",
        en:"The embouchure has to balance two things: enough looseness for the reed to vibrate freely and enough seal that no air escapes." }
    ],
    tips:[
      { tr:"Yanaklar şişmesin; şişiyorsa köşeler gevşek ya da hava kaçıyor.", en:"Don't puff your cheeks; if they puff, the corners are slack or leaking." },
      { tr:"Ses cızırdıyorsa ağızlığı biraz daha az al ya da dudak baskısını azalt.", en:"If it squeaks, take a little less mouthpiece or ease the lip pressure." }
    ],
    steps:[
      { type:"read", title:{ tr:"Yerleştirme", en:"Placement" }, body:[
        { tr:"Alt dudak alt dişlerin üstünü yastık gibi örtsün, kamış bu yastığa otursun. Üst dişler ağızlığın üstüne hafifçe değsin. Ağızlığın ne kadarının ağza gireceği bekten beke değişir: ses ince ve sıkışıksa biraz daha çok, cızırtılı ya da kontrolsüzse biraz daha az al.",
          en:"The lower lip covers the lower teeth like a cushion and the reed rests on it. The upper teeth rest lightly on top of the mouthpiece. How much mouthpiece goes in varies by mouthpiece: if the tone is thin and pinched take a little more, if it squeals or runs away take a little less." } ] },
      { type:"read", title:{ tr:"Gevşeklik ve sızdırmazlık", en:"Looseness and seal" }, body:[
        { tr:"Dudak köşeleri ağızlığı her yandan sarar ve havayı tutar; baskı kamışın üstünde değil, köşelerin çevresindedir. Çok sıkarsan kamış boğulur: ses ince, tiz ve sert olur. Çok gevşek bırakırsan hava kaçar: ses pes, dağınık ve havalı olur.",
          en:"The corners of the mouth wrap the mouthpiece and hold the air; the pressure is around the corners, not on top of the reed. Bite too hard and the reed is choked: thin, sharp, hard tone. Too loose and air escapes: flat, spread, airy tone." },
        { tr:"Türk tavrında perdeyi dudakla oynatmak (koma, kayış) önemlidir; bu yüzden birçok icracı alt dudağı Batı klasik okuluna göre biraz daha esnek tutar. Bu bir üslup farkıdır, kural değil; sızdırmazlık her tavırda gerekir.",
          en:"In Turkish style, bending the pitch with the lips (commas, slides) matters, so many players keep the lower lip a little more flexible than in the Western classical school. That's a style difference, not a rule; the seal is needed in every style." } ] },
      { type:"hold", note:67, sec:3, min:35 }
    ] },

  { id:"uzun-ses-ilk", unit:"baslangic", notes:[67, 66, 64],
    title:{ tr:"Uzun ses çalışması", en:"Long-note practice" },
    text:[
      { tr:"Uzun ses, sesi sabit tutmayı öğretir: aynı güçte, aynı perdede, titremeden. Her gün birkaç dakika uzun ses bütün tekniğin temelidir.",
        en:"Long notes teach you to keep the sound steady: same volume, same pitch, no wobble. A few minutes of long notes every day is the base of all technique." },
      { tr:"Sesi rahat bir güçte başlat, ortada sabit tut, sonunda perdeyi düşürmeden bitir. Göstergedeki çizgi düz kalmalı.",
        en:"Start at a comfortable volume, keep it steady in the middle and end without letting the pitch sag. The line on the tuner should stay flat." }
    ],
    tips:[
      { tr:"Sesin sonunda perde düşüyorsa hava desteği bitiyordur: daha kısa tut ya da daha erken nefes al.", en:"If the pitch drops at the end, your air support is running out: hold shorter or breathe sooner." }
    ],
    steps:[
      { type:"hold", note:67, sec:6, min:50 },
      { type:"hold", note:66, sec:6, min:50 },
      { type:"hold", note:64, sec:8, min:50 }
    ] },

  { id:"dil-ilk", unit:"baslangic", notes:[67],
    title:{ tr:"Dil ile nota başlatma", en:"Starting notes with the tongue" },
    text:[
      { tr:"Notayı nefesle “hu” diye değil, dille başlatırız: dilin ucu kamışın ucuna hafifçe değer, hava arkada hazırdır; dil çekilince kamış titremeye başlar. “Tu” ya da “du” hecesi bu hareketi anlatır.",
        en:"We start the note with the tongue, not with a breathy “hoo”: the tongue tip lightly touches the reed tip with the air ready behind it; when the tongue releases, the reed starts to vibrate. The syllable “too” or “doo” describes the motion." },
      { tr:"Dil yalnızca sesi başlatır. Sesi dille durdurmak da mümkündür, ama başlangıçta notanın sonunu havayı yumuşakça bırakarak bitir.",
        en:"The tongue only starts the note. Stopping it with the tongue is possible too, but as a beginner end notes by easing the air." }
    ],
    tips:[
      { tr:"Dil vururken çene ve dudak oynamasın; aynada bak.", en:"The jaw and lips shouldn't move when you tongue; check in a mirror." },
      { tr:"Ses geç başlıyorsa hava, dil çekilmeden önce hazır değildir.", en:"If the note speaks late, the air wasn't ready before the tongue released." }
    ],
    steps:[
      { type:"rhythm", pattern:"half", tempo:60, bars:4, min:55 },
      { type:"rhythm", pattern:"quarter", tempo:60, bars:4, min:55 }
    ] },

  { id:"ilk-gecis", unit:"baslangic", notes:[67, 66, 64],
    title:{ tr:"İlk nota geçişleri", en:"First note changes" },
    text:[
      { tr:"İki nota arasında geçerken parmaklar aynı anda hareket etmeli, hava kesilmemeli. Bu derste açık Sol ile sol el notaları arasında dilsiz (bağlı) geçeceksin.",
        en:"When changing notes, the fingers should move together and the air shouldn't stop. In this lesson you slur (no tongue) between open G and the left-hand notes." },
      { tr:"Geçişte bir ara ses duyuluyorsa parmaklar aynı anda inip kalkmıyordur. Yavaş çal, parmakları deliklerin yakınında tut.",
        en:"If you hear an in-between note, the fingers aren't moving together. Go slowly and keep the fingers close to the holes." }
    ],
    tips:[
      { tr:"Havayı tek bir akış gibi düşün: hava sürer, yalnızca parmaklar değişir.", en:"Think of the air as one stream: it keeps flowing, only the fingers change." }
    ],
    steps:[
      { type:"listen", notes:[67, 66, 67, 64, 67] },
      { type:"notes", notes:[67, 66, 67, 66, 67], maxMiss:2 },
      { type:"notes", notes:[67, 64, 67, 66, 64, 66, 67], maxMiss:2 }
    ] },

  { id:"nefes-cumle", unit:"baslangic", notes:[67],
    title:{ tr:"Nefes kontrolü ve müzikal cümleleme", en:"Breath control and phrasing" },
    text:[
      { tr:"Nefes alırken omuzlar kalkmasın: alt kaburgaların yanlara ve arkaya doğru genişlediğini, karnın gevşeyip öne geldiğini hisset. “Karından nefes al” sözü bu hissi anlatır; hava yine ciğerlere gider, diyafram aşağı indiği için karın öne gelir.",
        en:"When you breathe in, don't lift the shoulders: feel the lower ribs widen to the sides and back and the belly relax forward. “Breathe from the belly” describes this feeling; the air still goes to the lungs, the belly moves because the diaphragm drops." },
      { tr:"Nefesi zorlamadan, ağız köşelerinden hızlı ve sessizce al; ciğerleri sonuna kadar doldurmaya çalışmak gerginlik yaratır. Verirken karın ve kaburga kaslarıyla havayı sabit ve kontrollü gönder; boğaz ve omuzlar gevşek kalsın.",
        en:"Breathe in quickly and quietly through the corners of the mouth without forcing; trying to fill up completely creates tension. Breathing out, keep the airflow steady and controlled with the belly and rib muscles; throat and shoulders stay relaxed." },
      { tr:"Cümleleme: ezgi konuşma gibi cümlelere ayrılır. Nefesi cümle sonlarında al, cümlenin ortasında değil; cümlenin nereye gittiğini (yükselip alçalmasını) sesin gücüyle göster.",
        en:"Phrasing: a melody divides into sentences like speech. Breathe at the ends of phrases, not in the middle, and show where the phrase goes (its rise and fall) with the volume." }
    ],
    tips:[
      { tr:"Nefes nerede alınacak? Notada cümle sonlarına kurşun kalemle küçük bir virgül koy.", en:"Where to breathe? Pencil a small comma at the phrase ends in your music." }
    ],
    steps:[
      { type:"hold", note:67, sec:10, min:50 },
      { type:"dynamics", note:67, sec:5, shape:"cresc" },
      { type:"dynamics", note:67, sec:5, shape:"dim" }
    ] },

  { id:"nota-okuma", unit:"baslangic", notes:[64, 65, 67, 69, 71, 72],
    title:{ tr:"Nota okuma: dizek ve nota adları", en:"Reading music: the staff and note names" },
    text:[
      { tr:"Klarnet notası sol anahtarıyla, beş çizgili dizeğe yazılır. Notanın çizgide ya da aralıkta oluşu adını belirler.",
        en:"Clarinet music is written in the treble (G) clef on a five-line staff. Whether a note sits on a line or in a space gives its name." },
      { tr:"Çizgiler aşağıdan yukarı: Mi, Sol, Si, Re, Fa. Aralıklar: Fa, La, Do, Mi. Dizeğin dışındakiler ek çizgilerle yazılır (ör. Do4 bir ek çizgi aşağıda).",
        en:"Lines from the bottom: E, G, B, D, F. Spaces: F, A, C, E. Notes outside the staff use ledger lines (e.g. C4 one ledger line below)." }
    ],
    tips:[
      { tr:"Sol anahtarı ikinci çizgiden başlar: o çizgi Sol'dür ve Türk müziğinde Rast perdesidir.", en:"The treble clef curls around the second line: that line is G, the Rast perde in Turkish music." },
      { tr:"Diyez (♯) yarım ses tizleştirir, bemol (♭) yarım ses pesleştirir.", en:"A sharp (♯) raises a note by a semitone, a flat (♭) lowers it by a semitone." }
    ],
    steps:[
      { type:"read", title:{ tr:"Türk müziği notasındaki koma işaretleri", en:"Comma accidentals in Turkish notation" }, body:[
        { tr:"Türk müziği notasında diyez ve bemoller koma sayısını da gösterir: koma (1 koma), bakiye (4), küçük mücenneb (5) ve büyük mücenneb (8). Örneğin Segâh, Si'nin 1 koma pesi (Si üstünde koma bemolü) olarak yazılır.",
          en:"Turkish notation uses accidentals that show how many commas: koma (1 comma), bakiye (4), küçük mücenneb (5) and büyük mücenneb (8). For example Segâh is written as B lowered by one comma (a koma flat on B)." },
        { tr:"Uygulama her yerde yazılı notayı ve perde adını birlikte gösterir; perde adı hangi koma işaretinin kastedildiğini söyler.",
          en:"The app always shows the written note together with the perde name; the perde name tells you which comma accidental is meant." } ] },
      { type:"quiz", notes:[64, 65, 67, 69, 71, 72], mode:"staff", n:8, min:6 }
    ] },

  { id:"ritim-temel", unit:"baslangic", notes:[],
    title:{ tr:"Ritim: vuruş ve nota değerleri", en:"Rhythm: the beat and note values" },
    text:[
      { tr:"Müzikteki düzenli nabza vuruş denir; tempo, dakikadaki vuruş sayısıdır. Dörtlük nota bir vuruş, ikilik iki, birlik dört vuruş sürer; sekizlik notada bir vuruşa iki nota düşer.",
        en:"The steady pulse in music is the beat; tempo is beats per minute. A quarter note lasts one beat, a half note two and a whole note four; two eighth notes fit in one beat." },
      { tr:"Bu derste herhangi bir notayı (ör. açık Sol) metronomla birlikte kısa kısa çalacaksın. Uygulama her notanın vuruşa göre erken mi geç mi geldiğini ölçer.",
        en:"In this lesson you play short notes (e.g. open G) with the metronome. The app measures whether each note comes early or late against the beat." }
    ],
    tips:[
      { tr:"İlk ölçü sayımdır: dinle, ikinci ölçüde çalmaya başla.", en:"The first bar is a count-in: listen, start playing on the second bar." },
      { tr:"Telefon hoparlörden çalıyorsa Ritim sekmesindeki gecikme ayarını bir kez yap.", en:"If the phone plays through its speaker, run the latency calibration in the Rhythm tab once." }
    ],
    steps:[
      { type:"rhythm", pattern:"quarter", tempo:60, bars:4, min:55 },
      { type:"rhythm", pattern:"half", tempo:70, bars:4, min:55 },
      { type:"rhythm", pattern:"eighth", tempo:60, bars:4, min:50 }
    ] },

  { id:"usul-giris", unit:"baslangic", notes:[],
    title:{ tr:"Usule giriş: Semâî ve Sofyan", en:"Introduction to usul: Semâî and Sofyan" },
    text:[
      { tr:"Türk müziğinde ritim kalıbına usul denir. Usul, kalın “düm” ve ince “tek” vuruşlarının dizisidir; ezgi ne olursa olsun altında bu kalıp döner. Usulü önce elinle öğrenirsin: klarnet gerekmez, ses çıkaramadığın günlerde de çalışabilirsin.",
        en:"A rhythmic pattern in Turkish music is called an usul: a cycle of deep “düm” and light “tek” strokes that keeps turning under the tune. You learn it with your hands first: no clarinet needed, so you can practise on days you can't make a sound." },
      { tr:"Semâî üç zamanlıdır: Düm Tek Tek, vals gibi döner. Sofyan dört zamanlıdır ama üç darbı vardır: düm iki zaman sürer, ardından iki tek (Düm · Tek Tek). Dinle, sesli say, sonra Düm ve Tek düğmeleriyle vur.",
        en:"Semâî has three beats: Düm Tek Tek, turning like a waltz. Sofyan has four beats but three strokes: the düm lasts two beats, then two teks (Düm · Tek Tek). Listen, count aloud, then tap with the Düm and Tek buttons." }
    ],
    tips:[
      { tr:"Hecelerle sesli say: “Düm” kalın, “tek” ince söylenir. Noktalı yerlerde sesi uzat, vurma.", en:"Count aloud with the syllables: “Düm” deep, “tek” light. On the dots hold the sound, don't tap." },
      { tr:"Vuruşları yanlış zamanda atıyorsan tempoyu düşür: Çalış → Ritim → Usuller'de tempo ayarı var.", en:"If your taps land at the wrong time, lower the tempo: the Practice → Rhythm → Usuls page has a tempo control." }
    ],
    steps:[
      { type:"usultap", usul:"semai", mode:"listen" },
      { type:"usultap", usul:"semai", mode:"tap", min:70 },
      { type:"usultap", usul:"semai", mode:"mem", min:70 },
      { type:"usultap", usul:"sofyan", mode:"listen" },
      { type:"usultap", usul:"sofyan", mode:"tap", min:70 },
      { type:"usultap", usul:"sofyan", mode:"mem", min:70 }
    ] },

  { id:"ritim-hece", unit:"baslangic", notes:[],
    title:{ tr:"Ritim heceleri: nota değerlerini söyle", en:"Rhythm syllables: say the note values" },
    text:[
      { tr:"Ritmi önce ağzınla öğren: her nota değerine bir hece verilir. Dörtlük “nar”, iki sekizlik “el-ma”, dörtlük sus sessizlik, ikilik “na-ar” diye söylenir. Heceyi söylemek vuruşu kendiliğinden doğru böler; klarnet gerekmez.",
        en:"Learn rhythm with your mouth first: each note value gets a syllable. A quarter is “tea”, two eighths “cof-fee”, a quarter rest is silence, a half note “te-ea”. Saying the word splits the beat correctly; no clarinet needed." },
      { tr:"Bu derste dört vuruşluk ölçüleri dinleyip heceleriyle söylersin, sonra elle vurursun ve çalan ölçüyü notasından tanırsın. Heceler Çalış → Ritim → Ritim heceleri sayfasında da var; orada başka hece takımı da seçebilirsin.",
        en:"In this lesson you listen to four-beat bars and say them with the syllables, then tap them and recognise the playing bar from its notation. The same exercises are on the Practice → Rhythm → Rhythm syllables page, where you can pick another syllable set." }
    ],
    tips:[
      { tr:"Önce yavaş söyle; metronomun kalın tıkı ölçünün başıdır.", en:"Say it slowly first; the deep metronome click is the start of the bar." },
      { tr:"Suslarda sesin dur, içinden say.", en:"On rests stay silent and count in your head." }
    ],
    steps:[
      { type:"hece", mode:"say", lv:1 },
      { type:"hece", mode:"tap", lv:1, min:70 },
      { type:"hece", mode:"quiz", lv:1, n:5, min:4 }
    ] }
];

// ---- Teknik ünitesine eklenen dersler ----
const TEKNIK2 = [
  { id:"register-gecisi", unit:"teknik", notes:[],
    title:{ tr:"Register geçişi (kırılma)", en:"Crossing the break" },
    text:[
      { tr:"Si♭4 (boğaz notası) ile Si4 (klarino) arasında parmaklar neredeyse tamamen değişir; buna kırılma denir. Geçişte arada istenmeyen sesler duyulmaması için sağ el parmaklarını önceden kapatabilirsin.",
        en:"Between B♭4 (throat) and B4 (clarion) almost every finger changes; this is the break. To avoid stray notes in between you can keep the right-hand fingers down in advance." }
    ],
    tips:[
      { tr:"Havayı geçiş boyunca kesme; dudak değil hava hızlansın.", en:"Don't stop the air through the change; speed up the air, not the lips." }
    ],
    steps:[
      { type:"listen", notes:[69, 70, 71, 72, 71, 70, 69] },
      { type:"notes", notes:[69, 70, 71, 70, 69, 71, 72, 71, 70, 69], maxMiss:2 },
      { type:"notes", notes:[67, 71, 67, 72, 67, 74, 72, 71, 70, 69, 67], maxMiss:2 },
      { type:"hold", note:71, sec:8, min:55 }
    ] },

  { id:"artikulasyon", unit:"teknik", notes:[],
    title:{ tr:"Dil vuruşu (artikülasyon)", en:"Tonguing (articulation)" },
    text:[
      { tr:"Notaları dille ayırmak, hızlı pasajlarda ve oyun havalarında temel tekniktir. Dilin ucu kamışın ucuna hafifçe dokunup çekilir; hava hiç kesilmez, yalnızca dil sesi böler.",
        en:"Separating notes with the tongue is essential for fast passages and dance tunes. The tip of the tongue touches the tip of the reed and releases; the air never stops, only the tongue interrupts the sound." },
      { tr:"Uygulama aynı notayı dille tekrarladığını da sayar: ses kısa bir an kısılıp yeniden yükselince yeni nota başı olarak algılanır.",
        en:"The app also counts repeated tongued notes: a short dip and rise in the sound is detected as a new note." }
    ],
    tips:[
      { tr:"“Tu-tu-tu” hecelerini fısıldayarak dilin yerini bul; çene oynamasın.", en:"Whisper “tu-tu-tu” to find the tongue position; keep the jaw still." }
    ],
    steps:[
      { type:"rhythm", pattern:"quarter", tempo:80, bars:4, min:65 },
      { type:"rhythm", pattern:"eighth", tempo:70, bars:4, min:60 },
      { type:"rhythm", pattern:"dotted", tempo:70, bars:4, min:55 },
      { type:"rhythm", pattern:"offbeat", tempo:70, bars:4, min:55 }
    ] },

  { id:"dinamik", unit:"teknik", notes:[],
    title:{ tr:"Dinamik: hafif ve güçlü", en:"Dynamics: soft and loud" },
    text:[
      { tr:"Müziği canlı kılan, sesin gücündeki değişimlerdir. Crescendo sesi giderek güçlendirmek, decrescendo giderek hafifletmektir. Zor olan, ses gücü değişirken perdeyi sabit tutmaktır: klarnette ses açılınca perde kayma eğilimindedir.",
        en:"Changes in volume bring music to life. A crescendo grows louder, a decrescendo softer. The hard part is keeping the pitch steady while the volume changes: on the clarinet the pitch tends to drift as the sound opens up." }
    ],
    tips:[
      { tr:"Ses gücünü dudakla değil hava miktarıyla değiştir; hafif seste de hava desteğini bırakma.", en:"Change the volume with the amount of air, not the lips; keep supporting the air even when soft." }
    ],
    steps:[
      { type:"dynamics", note:67, sec:5, shape:"cresc" },
      { type:"dynamics", note:67, sec:5, shape:"dim" },
      { type:"dynamics", note:69, sec:8, shape:"messa" },
      { type:"dynamics", note:74, sec:8, shape:"messa" }
    ] },

  { id:"ses-kalitesi", unit:"teknik", notes:[],
    title:{ tr:"Ses kalitesi: temiz ve dolgun ton", en:"Tone quality: a clean, full sound" },
    text:[
      { tr:"Temiz bir sesin içinde hava ve cızırtı duyulmaz. Uygulama sesin ne kadar periyodik (net) olduğunu ve ses gücünün ne kadar sabit kaldığını ölçer. Bu dersteki uzun tonları hem perde hem de ses temizliği şartıyla geçeceksin.",
        en:"A clean sound has no air or buzz in it. The app measures how periodic (clear) the sound is and how steady its volume stays. In this lesson the long tones must pass both the pitch and the tone-clarity requirement." }
    ],
    tips:[
      { tr:"Ses havalıysa ağızlığı ağzına biraz daha az al ve dudak köşelerini sıkılaştır.", en:"If the tone is airy, take a little less mouthpiece and firm up the corners." },
      { tr:"Cızırdıyorsa kamışı kontrol et; ucu çatlak ya da çok sert olabilir.", en:"If it buzzes, check the reed; the tip may be chipped or too hard." }
    ],
    steps:[
      { type:"hold", note:67, sec:8, min:60, quality:60 },
      { type:"hold", note:62, sec:8, min:60, quality:60 },
      { type:"hold", note:74, sec:8, min:60, quality:55 },
      { type:"hold", note:55, sec:8, min:55, quality:55 }
    ] },

  { id:"usul", unit:"teknik", notes:[],
    title:{ tr:"Usuller: düm ve tek", en:"Usuls: düm and tek" },
    text:[
      { tr:"Türk müziğinde ritim kalıplarına usul denir. Her usul düm (kalın, vurgulu) ve tek (ince) vuruşlardan oluşur. Sofyan 4/4: Düm · Tek Tek; Semâî 3/4: Düm Tek Tek; Düyek 8/8; Aksak 9/8.",
        en:"Rhythmic cycles in Turkish music are called usuls. Each usul is built from düm (deep, accented) and tek (light) strokes. Sofyan 4/4: Düm · Tek Tek; Semâî 3/4: Düm Tek Tek; Düyek 8/8; Aksak 9/8." },
      { tr:"Bu derste usulün vuruşlarında kısa notalar çalacaksın. Aksak gibi aksak usullerde vuruşlar eşit aralıklı değildir: sayarken 2+2+2+3 diye düşün.",
        en:"In this lesson you play short notes on the usul's strokes. In limping usuls like Aksak the strokes are not evenly spaced: count 2+2+2+3." }
    ],
    tips:[
      { tr:"Önce usulü metronomla dinle (Çalışma bölümündeki usullü metronom), sonra elinle vurarak say.", en:"First listen to the usul on the metronome (the usul metronome in the Practice section), then tap it with your hand." }
    ],
    steps:[
      { type:"rhythm", usul:"sofyan", tempo:100, bars:4, min:60 },
      { type:"rhythm", usul:"semai", tempo:110, bars:4, min:60 },
      { type:"rhythm", usul:"duyek", tempo:160, bars:3, min:55 },
      { type:"rhythm", usul:"aksak", tempo:180, bars:3, min:55 }
    ] },

  { id:"usul-2", unit:"teknik", notes:[],
    title:{ tr:"Türk Aksağı, Yürük Semâî ve Curcuna", en:"Türk Aksağı, Yürük Semâî and Curcuna" },
    text:[
      { tr:"Üç usul daha: Türk Aksağı beş sekizliktir (2+3): iki sekizlik düm, sonra uzun bir tek ve kısa bir tek. Yürük Semâî altı sekizliktir, iki üçlük (3+3): düm tek tek, düm tek. Curcuna on sekizliktir; Aksak'a benzer ama üçüncü vuruşu bir sekizlik uzundur.",
        en:"Three more usuls: Türk Aksağı has five eighths (2+3): a two-eighth düm, then a long tek and a short tek. Yürük Semâî has six eighths in two threes (3+3): düm tek tek, düm tek. Curcuna has ten eighths; it resembles aksak but its third stroke is one eighth longer." },
      { tr:"Her usulde önce elinle vur, ezgiyi klarnetle çalmadan kalıbı vücuduna oturt; sonra aynı kalıbı metronomla klarnette çal.",
        en:"For each usul tap it with your hands first so the pattern sits in your body, then play the same pattern on the clarinet with the metronome." }
    ],
    tips:[
      { tr:"Aksak usullerde vuruşlar eşit aralıklı değildir: Türk Aksağı'nı 2+3, Yürük Semâî'yi 3+3 diye say.", en:"In limping usuls the strokes are not evenly spaced: count Türk Aksağı as 2+3 and Yürük Semâî as 3+3." }
    ],
    steps:[
      { type:"usultap", usul:"turkaksagi", mode:"tap", min:70 },
      { type:"rhythm", usul:"turkaksagi", tempo:140, bars:3, min:55 },
      { type:"usultap", usul:"yuruksemai", mode:"tap", min:70 },
      { type:"rhythm", usul:"yuruksemai", tempo:150, bars:3, min:55 },
      { type:"usultap", usul:"curcuna", mode:"mem", min:70 },
      { type:"rhythm", usul:"curcuna", tempo:150, bars:3, min:55 }
    ] },

  { id:"kulak-1", unit:"teknik", notes:[],
    title:{ tr:"Kulak eğitimi: koma farkını duymak", en:"Ear training: hearing commas" },
    text:[
      { tr:"Makam müziğini doğru çalmanın ön şartı, perdeler arasındaki küçük farkları duymaktır. Örneğin Kürdî ile Dik Kürdî arasında yalnızca 1 koma (yaklaşık 23 sent) vardır.",
        en:"Playing makam music in tune starts with hearing the small differences between perdes. For example Kürdî and Dik Kürdî are just 1 comma (about 23 cents) apart." },
      { tr:"Bu derste A ve B perdelerini dinleyip X'in hangisi olduğunu bulacaksın. Kulak sekmesindeki “tiz mi pes mi” alıştırmasıyla da her gün birkaç dakika çalış.",
        en:"In this lesson you listen to perdes A and B and decide which one X was. Also spend a few minutes a day on “higher or lower” in the Ear tab." }
    ],
    tips:[
      { tr:"Kulaklık kullan ve sessiz bir ortam seç.", en:"Use headphones and a quiet room." }
    ],
    steps:[
      { type:"ear", mode:"abx", level:1, n:8, min:6 },
      { type:"ear", mode:"abx", level:2, n:8, min:5 }
    ] }
];

// ---- Makam ünitesine eklenen dersler ----
// Kısa kalıp: listen (çıkış-iniş), scale, notes (seyre uygun bir ezgi), mimic
function makamLesson(id, mk, text, tips, phrase, extra = []){
  const m = LLEARN.makamById(mk);
  const updown = [...m.asc, ...[...m.desc].reverse().slice(1)];
  return { id, unit:"makam", notes:[], makam:mk, title:{ tr: m.name + " makamı", en: "Makam " + m.name }, text, tips,
    steps:[ { type:"listen", commas: updown }, { type:"scale", makam:mk, min:0.55 },
            { type:"notes", commas: phrase, maxMiss:4 }, { type:"mimic", makam:mk, len:5 }, ...extra ] };
}
const MAKAM2 = [
  makamLesson("bayati", "bayati", [
    { tr:"Bayâtî'nin dizisi Uşşak'la aynıdır; farkı seyrindedir: ezgi Nevâ civarından başlar, aşağı inip Dügâh'ta karar verir, sonra yeniden yükselebilir.",
      en:"Bayâtî has the same scale as Uşşak; the difference is in its seyir: the melody starts around Nevâ, comes down to resolve on Dügâh and may rise again." }],
    [{ tr:"Segâh'ı Uşşak'taki gibi pes bas.", en:"Play Segâh low, as in Uşşak." }],
    [31, 40, 31, 22, 17, 22, 31, 22, 17, 9, 0, 9]),
  makamLesson("karcigar", "karcigar", [
    { tr:"Karcığar, Dügâh'ta Uşşak dörtlüsü ile Nevâ'da Hicaz beşlisinden oluşur. Nevâ'nın üstündeki Hisar ve Evç perdeleri ona Hicaz rengini verir.",
      en:"Karcığar is an Uşşak tetrachord on Dügâh plus a Hicaz pentachord on Nevâ. The Hisar and Evç perdes above Nevâ give it a Hicaz colour." }],
    [{ tr:"Hisar (yazılı Mi♭5) ile Evç (Fa♯5) arasındaki geniş aralığı abartmadan çal.", en:"Don't exaggerate the wide step between Hisar (written E♭5) and Evç (F♯5)." }],
    [9, 17, 22, 31, 36, 48, 36, 31, 22, 17, 9]),
  makamLesson("humayun", "humayun", [
    { tr:"Hümâyun, Dügâh'ta Hicaz dörtlüsü ile Nevâ'da Bûselik beşlisinden oluşur. Hicaz'a benzer başlar ama Nevâ üstünde Bûselik rengine döner.",
      en:"Hümâyun is a Hicaz tetrachord on Dügâh plus a Bûselik pentachord on Nevâ. It starts like Hicaz but turns to a Bûselik colour above Nevâ." }],
    [],
    [9, 14, 26, 31, 40, 44, 40, 31, 26, 14, 9]),
  makamLesson("uzzal", "uzzal", [
    { tr:"Uzzâl, Dügâh'ta Hicaz beşlisi ile Hüseynî'de Uşşak dörtlüsünden oluşur. Nevâ ve Hüseynî çevresinde gezinir, Dügâh'ta karar verir.",
      en:"Uzzâl is a Hicaz pentachord on Dügâh plus an Uşşak tetrachord on Hüseynî. It wanders around Nevâ and Hüseynî and resolves on Dügâh." }],
    [],
    [9, 14, 26, 31, 40, 31, 40, 48, 40, 31, 26, 14, 9]),
  makamLesson("zirguleli", "zirguleli", [
    { tr:"Zirgüleli Hicaz'da iki Hicaz çeşnisi üst üste gelir: Dügâh'ta Hicaz beşlisi ve Hüseynî'de Hicaz dörtlüsü (Dik Acem, Nim Şehnaz). Ezgi güçlü Hüseynî civarından başlar; Nim Zirgüle yeden olup Dügâh'ta karar verir.",
      en:"Zirgüleli Hicaz stacks two Hicaz flavours: a Hicaz pentachord on Dügâh and a Hicaz tetrachord on Hüseynî (Dik Acem, Nim Şehnaz). The melody opens around the dominant Hüseynî; Nim Zirgüle leads into the final on Dügâh." }],
    [{ tr:"Dik Acem Fa5'in 1 koma tizidir; Nim Şehnaz yazılı Sol♯5 parmağıyla çalınır.", en:"Dik Acem is F5 raised by one comma; Nim Şehnaz uses the written G♯5 fingering." }],
    [40, 45, 57, 45, 40, 31, 26, 14, 9, 14, 26, 31, 26, 14, 9]),
  makamLesson("suzinak", "suzinak", [
    { tr:"Sûzinak, Rast beşlisinin üstüne Nevâ'da Hicaz dörtlüsü koyar. İnici-çıkıcıdır: ezgi Nevâ civarından başlar, Hisar ile Hicaz rengini gösterip Rast'a iner.",
      en:"Sûzinak puts a Hicaz tetrachord on Nevâ above a Rast pentachord. It is descending-ascending: the melody opens around Nevâ, shows the Hicaz colour with Hisar and comes down to Rast." }],
    [],
    [31, 36, 48, 36, 31, 22, 17, 9, 0, 9, 17, 22, 17, 9, 0]),
  makamLesson("hicazkar", "hicazkar", [
    { tr:"Hicazkâr, Zirgüleli Hicaz'ın Rast perdesine göçürülmüş hâlidir: Rast'ta Hicaz beşlisi (Zirgüle, Segâh) ve Nevâ'da Hicaz dörtlüsü. İnici bir makamdır: ezgi Gerdâniye civarından başlar, Gerdâniye'de yarım karar verir.",
      en:"Hicazkâr is Zirgüleli Hicaz transposed to Rast: a Hicaz pentachord on Rast (Zirgüle, Segâh) and a Hicaz tetrachord on Nevâ. It is a descending makam: the melody starts around Gerdâniye and makes its half cadence there." }],
    [{ tr:"Zirgüle yazılı Sol♯4 parmağıyla çalınır.", en:"Zirgüle uses the written G♯4 fingering." }],
    [53, 48, 36, 31, 36, 31, 22, 17, 5, 0, 5, 17, 22, 17, 5, 0]),
  makamLesson("kurdilihicazkar", "kurdilihicazkar", [
    { tr:"Kürdîli Hicazkâr inici bir makamdır: ezgi Gerdâniye civarından başlar, orada yarım karar verip Rast'a iner. Rast'ta Kürdî dörtlüsü ile Çargâh'ta Bûselik dizisinden oluşur.",
      en:"Kürdîli Hicazkâr is a descending makam: the melody starts around Gerdâniye, makes its half cadence there and descends to Rast. It is a Kürdî tetrachord on Rast plus a Bûselik scale on Çargâh." }],
    [],
    [53, 44, 35, 31, 22, 31, 22, 13, 4, 0]),
  makamLesson("mahur", "mahur", [
    { tr:"Mâhur inici bir makamdır; ezgi Gerdâniye civarından başlar. Rast'ta Çargâh beşlisi ile Nevâ'da Çargâh dörtlüsünden oluşur; Bûselik ve Mâhur perdeleri ona parlak bir renk verir.",
      en:"Mâhur is a descending makam; the melody starts around Gerdâniye. It is a Çargâh pentachord on Rast plus a Çargâh tetrachord on Nevâ; the Bûselik and Mâhur perdes give it a bright colour." }],
    [{ tr:"Mâhur perdesi yazılı Fa♯5'tir; Evç'ten biraz tiz bas.", en:"The Mâhur perde is written F♯5; play it a little higher than Evç." }],
    [53, 49, 40, 31, 22, 18, 9, 0, 9, 18, 22, 31, 22, 18, 9, 0]),
  makamLesson("acemasiran", "acemasiran", [
    { tr:"Acemaşîran inici bir makamdır ve Acem Aşîran perdesinde (yazılı Fa4) Çargâh dörtlüsüyle karar verir. Dizisi Acem Aşîran'da Çargâh beşlisi ile Çargâh'ta Çargâh dörtlüsüdür; güçlüleri sırasıyla Acem, Çargâh ve Dügâh.",
      en:"Acemaşîran is a descending makam that resolves on the Acem Aşîran perde (written F4) with a Çargâh tetrachord. Its scale is a Çargâh pentachord on Acem Aşîran plus a Çargâh tetrachord on Çargâh; its dominants are Acem, Çargâh and Dügâh, in that order." }],
    [],
    [44, 40, 31, 22, 13, 22, 13, 9, 0, -9]),
  // Makam ünitesinin kapanışı: duyulan ya da okunan bir eserin makamını bulma yöntemi
  { id:"makam-bulma", unit:"makam", notes:[],
    title:{ tr:"Bir eserin makamı nasıl anlaşılır?", en:"How do you tell a piece's makam?" },
    text:[
      { tr:"Makamı bulmak bir dedektiflik işidir: tek bir ipucu yetmez, ipuçlarını sırayla toplarsın. Bu derste dört soruyla çalışacaksın: Ezgi nerede bitiyor (durak)? Durağın hemen üstündeki perdeler nasıl (çeşni)? Ezgi en çok nerede dinleniyor (güçlü)? Nereden başlıyor, nasıl geziniyor (seyir)?",
        en:"Finding the makam is detective work: one clue is not enough, you gather them in order. In this lesson you work with four questions: Where does the melody end (the final)? What are the perdes just above the final like (the çeşni)? Where does the melody rest most (the dominant)? Where does it start and how does it move (the seyir)?" },
      { tr:"Önce okuma adımlarını oku, sonra dinleme adımlarında aynı ipuçlarını kulağınla karşılaştır; en sonda kısa ezgilerin makamını kendin bul.",
        en:"Read the reading steps first, then compare the same clues by ear in the listening steps; at the end, name the makam of short phrases yourself." }
    ],
    tips:[
      { tr:"Duyduğun ezginin son notasını klarnetle bul: o perde büyük olasılıkla durağıdır.", en:"Find the last note of the tune on your clarinet: that perde is most likely its final." },
      { tr:"Nota arşivinde makamı yazılı bir eser aç, makama bakmadan önce son notasına ve arızalarına bakıp tahmin et; sonra karşılaştır.",
        en:"Open a piece in the score archive and guess its makam from the last note and the accidentals before looking at the label; then compare." }
    ],
    steps:[
      { type:"read", title:{ tr:"1. Durak: ezgi nerede bitiyor?", en:"1. The final: where does the melody end?" }, body:[
        { tr:"Eserin son notası neredeyse her zaman makamın durağıdır. Notada son ölçüye, kulakla en sondaki uzun ve “eve dönmüş” gibi duyulan sese bak. Cümle sonları da çoğunlukla durakta ya da güçlüde biter.",
          en:"The last note of a piece is almost always the makam's final. In the score look at the last bar; by ear, listen for the long closing note that sounds like “home”. Phrase endings usually land on the final or the dominant too." },
        { tr:"Sol klarnette yazılı Sol4 Rast, La4 Dügâh, Si4 Segâh perdesidir. Rast'ta bitiyorsa Rast, Nihâvend, Mâhur, Sûzinak, Nikriz gibi Rast ailesi; Dügâh'ta bitiyorsa Uşşak, Hüseynî, Hicaz, Kürdî, Saba, Bayâtî, Karcığar gibi Dügâh ailesi; Segâh'ta bitiyorsa Segâh ya da Hüzzam adaydır.",
          en:"On the G clarinet, written G4 is Rast, A4 is Dügâh and B4 is Segâh. Ending on Rast points to the Rast family (Rast, Nihâvend, Mâhur, Sûzinak, Nikriz); ending on Dügâh to the Dügâh family (Uşşak, Hüseynî, Hicaz, Kürdî, Saba, Bayâtî, Karcığar); ending on Segâh to Segâh or Hüzzam." },
        { tr:"Dikkat: eserin ortasında başka makama geçilebilir (geçki). Karar için ortadaki duraklara değil, sona bak.",
          en:"Careful: a piece may move to another makam in the middle (modulation). For the final, look at the end, not the stops along the way." }
      ] },
      { type:"read", title:{ tr:"2. Çeşni: durağın üstündeki perdeler", en:"2. The çeşni: the perdes above the final" }, body:[
        { tr:"Aynı durakta biten makamları durağın üstündeki ilk dört-beş perde ayırır. Dügâh'ta biten bir ezgide ikinci perdeye (yazılı Si) ve dördüncüye (Re civarı) bak:",
          en:"Makams that end on the same final are told apart by the first four or five perdes above it. In a tune ending on Dügâh, check the second perde (written B) and the fourth (around D):" },
        { tr:"Si koma bemollü (Segâh), Do ve Re doğal → Uşşak dörtlüsü: Uşşak, Bayâtî, Hüseynî. Si bemol (Kürdî), Do doğal → Kürdî. Si bemol (Dik Kürdî) ve Do diyez (Nim Hicaz): aradaki geniş aralık → Hicaz ailesi (Hicaz, Hümâyun, Uzzâl). Segâh, Çargâh ve hemen ardından Re♭ (Hicaz perdesi) → Saba; Saba'nın dördüncü perdesi Nevâ'ya ulaşmaz.",
          en:"B with a comma flat (Segâh), C and D natural → Uşşak tetrachord: Uşşak, Bayâtî, Hüseynî. B flat (Kürdî) with C natural → Kürdî. B flat (Dik Kürdî) and C sharp (Nim Hicaz) with the wide step between them → the Hicaz family (Hicaz, Hümâyun, Uzzâl). Segâh, Çargâh and right after D♭ (the Hicaz perde) → Saba; Saba's fourth degree never reaches Nevâ." },
        { tr:"Notada bu bilgi donanımda ve eserin içindeki arızalarda görünür; ama donanım tek başına yetmez: Uşşak ile Bayâtî'nin donanımı aynıdır.",
          en:"In a score this shows in the key signature and the accidentals in the piece; but the key signature alone is not enough: Uşşak and Bayâtî share the same one." }
      ] },
      { type:"listen", commas:[9, 17, 22, 31, 22, 17, 9] },
      { type:"listen", commas:[9, 13, 22, 31, 22, 13, 9] },
      { type:"listen", commas:[9, 14, 26, 31, 26, 14, 9] },
      { type:"listen", commas:[9, 17, 22, 27, 22, 17, 9] },
      { type:"read", title:{ tr:"3. Güçlü ve 4. seyir: dizi aynıysa", en:"3. The dominant and 4. the seyir: when the scale is the same" }, body:[
        { tr:"Az önce dinlediğin dört dörtlü aynı durakta başlayıp bitti; farkı yalnızca orta perdeler yaptı: Uşşak, Kürdî, Hicaz, Saba.",
          en:"The four tetrachords you just heard started and ended on the same final; only the middle perdes differed: Uşşak, Kürdî, Hicaz, Saba." },
        { tr:"Dizisi aynı olan makamları güçlü ve seyir ayırır. Güçlü, ezginin yarım karar verip dinlendiği perdedir: Uşşak'ta Nevâ (Re5), Hüseynî'de Hüseynî (Mi5), Saba'da Çargâh (Do5).",
          en:"Makams with the same scale are told apart by the dominant and the seyir. The dominant is the perde where the melody makes half cadences and rests: Nevâ (D5) in Uşşak, Hüseynî (E5) in Hüseynî, Çargâh (C5) in Saba." },
        { tr:"Seyir ezginin başladığı yer ve gidişidir. Çıkıcı makamlar (Rast, Uşşak, Segâh) durak civarından başlayıp yükselir; inici-çıkıcılar (Hüseynî, Bayâtî, Karcığar) güçlü civarından başlar; inici makamlar (Mâhur, Acemaşîran, Kürdîli Hicazkâr) tizden başlayıp adım adım iner. Sıradaki üç ezginin durağı ve dizisi aynı: Uşşak durakta gezinir, Bayâtî Nevâ'dan başlar, Hüseynî Hüseynî perdesinde dinlenir.",
          en:"The seyir is where the melody starts and how it travels. Ascending makams (Rast, Uşşak, Segâh) start near the final and rise; descending-ascending ones (Hüseynî, Bayâtî, Karcığar) start around the dominant; descending makams (Mâhur, Acemaşîran, Kürdîli Hicazkâr) start high and step down. The next three phrases share the final and the scale: Uşşak lingers near the final, Bayâtî opens on Nevâ, Hüseynî rests on the Hüseynî perde." }
      ] },
      { type:"listen", commas:[9, 17, 22, 17, 9, 17, 22, 31, 22, 17, 9] },
      { type:"listen", commas:[31, 40, 31, 22, 17, 22, 31, 22, 17, 9] },
      { type:"listen", commas:[40, 44, 40, 31, 40, 31, 22, 17, 22, 17, 9] },
      { type:"read", title:{ tr:"Özet: dört soru", en:"Summary: four questions" }, body:[
        { tr:"1) Son nota hangi perde? → makam ailesi. 2) Durağın üstündeki perdeler (özellikle ikinci ve dördüncü) nasıl? → çeşni. 3) Ezgi en çok nerede dinleniyor? → güçlü. 4) Nereden başlıyor, çıkıyor mu iniyor mu? → seyir.",
          en:"1) Which perde is the last note? → the makam family. 2) What are the perdes above the final like (especially the second and fourth)? → the çeşni. 3) Where does the melody rest most? → the dominant. 4) Where does it start; does it rise or fall? → the seyir." },
        { tr:"Bu dört cevap çoğu eserde makamı tek bir adaya indirir. Kalan adımlarda kısa ezgileri dinleyip makamını seçeceksin; Makam > Kulak > Makam tanı sekmesinde istediğin kadar tekrar edebilirsin.",
          en:"In most pieces these four answers narrow the makam down to a single candidate. In the remaining steps you listen to short phrases and pick the makam; you can keep practising in Makam > Ear > Makam ID." }
      ] },
      { type:"ear", mode:"makam", pool:["rast","ussak","hicaz","kurdi","saba"], n:8, min:5 },
      { type:"ear", mode:"makam", pool:["rast","nihavend","ussak","huseyni","hicaz","kurdi","saba","segah","huzzam"], n:10, min:6 }
    ] }
];

// ---- İleri seviye: taksim (seyir), ileri kulak ve ritim ----
const ILERI = [
  // Taksim aşamaları: cümle kurma → seyir → çeşni → karar → inici makamlar. Her aşama ayrı ölçülür (focus).
  { id:"taksim-cumle", unit:"ileri", notes:[], makam:"rast",
    title:{ tr:"Taksim 1: cümle kurma", en:"Taksim 1: building phrases" },
    text:[
      { tr:"Taksim, makamı usulsüz ve doğaçlama olarak sergilemektir. Önce cümle kurmayı çalışacağız: bir cümle, bir nefeste çalınan ve bir perdede dinlenerek biten kısa bir ezgidir. Cümleler arasında kısa bir sessizlik olur; dinleyen cümlenin nerede bittiğini duyar.",
        en:"A taksim is an unmetered improvisation that presents the makam. First we practise building phrases: a phrase is a short melody played in one breath that ends by resting on a perde. There is a short silence between phrases, so the listener hears where each one ends." },
      { tr:"Bu derste makamın kurallarına değil cümlelere bakılır: en az dört cümle, her biri birkaç saniye, her biri dizideki bir perdede tutularak bitiyor mu. Ezginin güzelliğini uygulama ölçemez; onu kulağın ve hocan değerlendirir.",
        en:"This lesson looks at phrases, not at the makam's rules: at least four phrases, each a few seconds long, each ending held on a perde of the scale. The app cannot judge how beautiful the melody is; your ear and your teacher do that." }
    ],
    tips:[
      { tr:"Konuşur gibi düşün: kısa bir soru, kısa bir cevap. Her cümleden sonra nefes al.", en:"Think of speech: a short question, a short answer. Breathe after each phrase." },
      { tr:"Az perdeyle başla: durak ve üstündeki üç dört perde yeter.", en:"Start with few perdes: the final and the three or four above it are enough." }
    ],
    steps:[
      { type:"seyir", makam:"rast", sec:45, min:60, focus:"cumle" },
      { type:"seyir", makam:"ussak", sec:45, min:65, focus:"cumle" }
    ] },
  { id:"taksim-giris", unit:"ileri", notes:[], makam:"rast",
    title:{ tr:"Taksim 2: seyir", en:"Taksim 2: seyir" },
    text:[
      { tr:"Taksim, makamı usulsüz ve doğaçlama olarak sergilemektir. Bir makamı tanıtan dizisi değil seyridir: ezginin nereden başladığı, hangi perdelerde dinlendiği (güçlü, yarım karar) ve nerede bittiği (durak).",
        en:"A taksim is an unmetered improvisation that presents the makam. What defines a makam is not its scale but its seyir: where the melody starts, where it rests (dominant, half cadences) and where it ends (the final)." },
      { tr:"Bu adımlarda serbestçe çalacaksın; uygulama perdelerde geçirdiğin süreyi, dizi dışına çıkıp çıkmadığını, güçlüyü vurgulayıp vurgulamadığını ve durakta karar verip vermediğini değerlendirir.",
        en:"In these steps you play freely; the app checks how long you stay on each perde, whether you leave the scale, emphasise the dominant and resolve on the final." }
    ],
    tips:[
      { tr:"Kısa cümleler kur: her cümle bir perdede dinlensin. Güçlüde yarım karar, durakta tam karar ver.", en:"Build short phrases, each resting on a perde. Half cadence on the dominant, full cadence on the final." },
      { tr:"Durağı dron yapmak kulağını makamda tutar.", en:"A drone on the final keeps your ear in the makam." }
    ],
    steps:[
      { type:"seyir", makam:"rast", sec:45, min:55 },
      { type:"seyir", makam:"ussak", sec:45, min:55 },
      { type:"seyir", makam:"hicaz", sec:60, min:60 }
    ] },
  { id:"taksim-cesni", unit:"ileri", notes:[], makam:"ussak",
    title:{ tr:"Taksim 3: çeşni ve yarım karar", en:"Taksim 3: çeşni and half cadence" },
    text:[
      { tr:"Makamın rengini çeşniler verir. Bu uygulamada makamın ilk çeşnisi, çıkış dizisinde durak ile güçlü arasındaki perdeler olarak alınır (Uşşak'ta Dügâh–Nevâ, Hicaz'da Dügâh–Nevâ). Bu perdeleri gezerek çeşniyi tanıt, sonra bir cümleyi güçlüde bitirerek yarım karar ver.",
        en:"Çeşnis give the makam its colour. In this app the makam's first çeşni is taken as the perdes of the ascending scale from the final to the dominant (Dügâh–Nevâ in Uşşak and in Hicaz). Present the çeşni by moving through these perdes, then end a phrase on the dominant for a half cadence." },
      { tr:"Ölçülen: bu perdelerin ne kadarına uğradığın ve güçlüde biten cümle sayısı. Çeşnide hangi perdenin nasıl basılacağı (ör. Uşşak'ın Segâh'ı) ayrı bir konudur; Akort ekranında icra perdesine bak.",
        en:"What is measured: how many of these perdes you visit and how many phrases end on the dominant. How each perde of the çeşni is pitched (e.g. Segâh in Uşşak) is a separate matter; see the practice tuning in the Tuner." }
    ],
    tips:[
      { tr:"Durağı dron yap; güçlüye vardığında orada biraz kal.", en:"Put a drone on the final; when you reach the dominant, stay there a moment." }
    ],
    steps:[
      { type:"seyir", makam:"ussak", sec:60, min:65, focus:"cesni" },
      { type:"seyir", makam:"hicaz", sec:60, min:65, focus:"cesni" }
    ] },
  { id:"taksim-karar", unit:"ileri", notes:[], makam:"rast",
    title:{ tr:"Taksim 4: karar", en:"Taksim 4: the final cadence" },
    text:[
      { tr:"Taksim durakta karar vererek biter. Son cümle durağa üstten iner ya da yedenden çıkar ve durak uzunca tutulur; dinleyen taksimin bittiğini buradan anlar.",
        en:"A taksim ends with a cadence on the final. The last phrase comes down to the final from above or rises to it from the leading tone, and the final is held for a while; this is how the listener knows the taksim is over." },
      { tr:"Ölçülen: son cümlenin durakta bitmesi, son notanın en az bir saniye kadar tutulması ve durağa üstten ya da yedenden gelinmesi.",
        en:"What is measured: whether the last phrase ends on the final, whether the last note is held for about a second, and whether you approach the final from above or from the leading tone." }
    ],
    tips:[
      { tr:"Kararı acele etme: son cümleden önce güçlüde bir yarım karar, sonra durağa iniş.", en:"Don't rush the cadence: a half cadence on the dominant first, then the descent to the final." }
    ],
    steps:[
      { type:"seyir", makam:"rast", sec:45, min:75, focus:"karar" },
      { type:"seyir", makam:"hicaz", sec:45, min:75, focus:"karar" }
    ] },
  { id:"taksim-2", unit:"ileri", notes:[],
    title:{ tr:"Taksim 5: inici ve inici-çıkıcı makamlar", en:"Taksim 5: descending makams" },
    text:[
      { tr:"İnici makamlarda (Mâhur, Acemaşîran, Kürdîli Hicazkâr) taksim tiz bölgeden başlar ve adım adım durağa iner. İnici-çıkıcı makamlarda (Hüseynî, Bayâtî, Karcığar) güçlü civarından başlanır.",
        en:"In descending makams (Mâhur, Acemaşîran, Kürdîli Hicazkâr) the taksim starts high and steps down to the final. In descending-ascending makams (Hüseynî, Bayâtî, Karcığar) it starts around the dominant." }
    ],
    tips:[],
    steps:[
      { type:"seyir", makam:"huseyni", sec:60, min:60 },
      { type:"seyir", makam:"mahur", sec:60, min:60 },
      { type:"seyir", makam:"kurdilihicazkar", sec:60, min:60 }
    ] },
  { id:"kulak-2", unit:"ileri", notes:[],
    title:{ tr:"İleri kulak: makam tanıma ve tek koma", en:"Advanced ear: makam ID and one comma" },
    text:[
      { tr:"Bir makamı birkaç notasından tanımak, usta bir müzisyenin en önemli becerilerinden biridir. Bu derste kısa ezgilerin makamını bulacak ve 1 komalık farkları ayırt edeceksin (ör. Segâh ile Bûselik).",
        en:"Recognising a makam from a few notes is one of a master musician's key skills. In this lesson you name the makam of short phrases and tell apart one-comma differences (e.g. Segâh and Bûselik)." }
    ],
    tips:[],
    steps:[
      { type:"ear", mode:"makam", pool:["rast","ussak","hicaz","kurdi","saba","segah","nihavend","huzzam","huseyni"], n:8, min:5 },
      { type:"ear", mode:"abx", level:3, n:10, min:7 }
    ] },
  { id:"ritim-ileri", unit:"ileri", notes:[],
    title:{ tr:"İç tempo: metronomsuz çalmak", en:"Inner tempo: playing without the click" },
    text:[
      { tr:"İyi bir müzisyen tempoyu içinde taşır. Bu derste metronom yalnızca sayım ölçüsünde çalar; sonra susar ve sen aynı tempoda devam edersin. Uygulama tempodan ne kadar kaydığını ölçer.",
        en:"A good musician carries the tempo inside. In this lesson the metronome plays only the count-in, then stops and you keep the same tempo. The app measures how far you drift." }
    ],
    tips:[
      { tr:"Ayağınla ya da içinden sayarak vuruşu sürdür.", en:"Keep the beat by tapping your foot or counting inside." }
    ],
    steps:[
      { type:"rhythm", pattern:"quarter", tempo:80, bars:4, silent:true, min:55 },
      { type:"rhythm", usul:"aksak", tempo:180, bars:3, silent:true, min:50 },
      { type:"rhythm", usul:"curcuna", tempo:180, bars:3, min:55 }
    ] }
];

// Etütleri derslere ekle: temel derslerde serbest takip, makam derslerinde tempolu çalma
const addStep = (id, st) => { const l = [...LESSONS, ...BASLANGIC, ...TEKNIK2, ...MAKAM2, ...ILERI].find(x => x.id === id); if(l) l.steps.push(st); };
addStep("sol-el-2", { type:"piece", id:"e-sol-el", mode:"free", min:4 });
addStep("sag-el", { type:"piece", id:"e-iki-el", mode:"free", min:4 });
addStep("klarino", { type:"piece", id:"e-register", mode:"tempo", min:60 });
for(const mk of ["rast","ussak","huseyni","hicaz","nihavend","kurdi","saba","segah","huzzam"]) addStep(mk, { type:"piece", id:"e-" + mk, mode:"tempo", min:65 });
addStep("usul", { type:"piece", id:"e-semai", mode:"tempo", min:60 });
addStep("ritim-ileri", { type:"piece", id:"e-aksak", mode:"tempo", min:55 });

// ---- Süsleme ünitesi ----
// ornament adımı: { kind, note, dir?, makam?, comma?, n? (sayılı türler), rate?, sec? (tril) }; ölçüm skills.js'te.
// Her süsleme adımından önce aynı süslemeyi çalan bir dinleme adımı (orn alanı) gelir.
const SUSLEME = [
  { id:"sus-carpma", unit:"susleme", notes:[],
    title:{ tr:"Çarpma", en:"Grace notes" },
    text:[
      { tr:"Çarpma, asıl notadan hemen önce çok kısa çalınan bir süs notasıdır. Türk klarnetinde en sık kullanılan süslemedir: ezgiye canlılık ve vurgu katar.",
        en:"A grace note is a very short note played just before the main note. It is the most common ornament on the Turkish clarinet: it adds life and accent to the melody." },
      { tr:"Üstten çarpmada asıl notanın parmağını kurarsın, üstteki notayı açacak parmağı kaldırıp hemen geri kapatırsın. Parmak vurup kalkar; süs notası neredeyse duyulmadan geçer, ses kesilmez.",
        en:"For an upper grace note, set the fingering of the main note, then lift the finger that opens the upper note and put it straight back. The finger taps and lifts; the grace note passes almost unheard and the sound never stops." },
      { tr:"Uygulama süs notasının süresini ölçer: 40–80 ms arası en doğal duyulur. 120 ms'yi geçerse çarpma değil, iki ayrı nota gibi duyulur.",
        en:"The app measures how long the grace note lasts: 40–80 ms sounds most natural. Beyond 120 ms it no longer sounds like a grace note but like two separate notes." }
    ],
    tips:[
      { tr:"Dille ayırma: süs notası ile asıl nota tek nefeste, bağlı çalınır.", en:"Don't tongue: the grace note and the main note are slurred in one breath." },
      { tr:"Önce yavaş dene, sonra parmağı giderek daha çabuk kaldırıp kapat.", en:"Try it slowly first, then lift and close the finger faster and faster." }
    ],
    steps:[
      { type:"listen", notes:[69], orn:{ kind:"carpma", dir:"up" } },
      { type:"ornament", kind:"carpma", dir:"up", note:69, n:5 },
      { type:"ornament", kind:"carpma", dir:"up", note:67, n:5 },
      { type:"ornament", kind:"carpma", dir:"up", note:72, n:5 }
    ] },
  { id:"sus-carpma-alt", unit:"susleme", notes:[],
    title:{ tr:"Alttan çarpma ve çarpmalı tekrar", en:"Lower grace notes and repeated notes" },
    text:[
      { tr:"Alttan çarpmada süs notası asıl notanın altındadır: asıl notanın bir altındaki parmağı kısaca kapatıp hemen açarsın.",
        en:"In a lower grace note the ornament sits below the main note: briefly close the finger for the note below and open it again at once." },
      { tr:"Oyun havalarında aynı nota art arda çalınırken çoğu zaman dil kullanılmaz: nota, araya giren kısa çarpmalarla bölünür. Buna çarpmalı tekrar diyoruz; ses hiç kesilmez, yalnızca parmak vurur.",
        en:"In dance tunes, repeated notes are often not tongued: the note is split by short grace notes. We call this a repeated note split by grace notes; the sound never stops, only the finger taps." }
    ],
    tips:[
      { tr:"Çarpmalı tekrarda nefes desteğini sabit tut; bölmeyi dil değil parmak yapar.", en:"Keep the breath support steady in repeated notes; the finger splits the note, not the tongue." }
    ],
    steps:[
      { type:"listen", notes:[69], orn:{ kind:"carpma", dir:"down" } },
      { type:"ornament", kind:"carpma", dir:"down", note:69, n:5 },
      { type:"ornament", kind:"carpma", dir:"down", note:71, n:5 },
      { type:"listen", notes:[69], orn:{ kind:"tekrar", dir:"up" } },
      { type:"ornament", kind:"tekrar", dir:"up", note:69, n:2 }
    ] },
  { id:"sus-mordan", unit:"susleme", notes:[],
    title:{ tr:"Mordan", en:"Mordents" },
    text:[
      { tr:"Mordan üç notalı hızlı bir süslemedir: asıl nota, komşu nota, yine asıl nota. Üst mordanda komşu üstte, alt mordanda alttadır.",
        en:"A mordent is a quick three-note ornament: main note, neighbour, main note again. In an upper mordent the neighbour is above, in a lower mordent below." },
      { tr:"Mordanı asıl notayla başlayan bir çarpma gibi düşün: parmak bir kez vurup kalkar. Üç nota birlikte 300 ms'yi geçmemeli.",
        en:"Think of it as a grace note that starts on the main note: the finger taps and lifts once. All three notes together should take no more than 300 ms." }
    ],
    tips:[
      { tr:"Son notaya otur ve tut; mordan bir vurgudur, asıl nota sonra gelir.", en:"Land on the last note and hold it; the mordent is an accent, the main note comes after." }
    ],
    steps:[
      { type:"listen", notes:[69], orn:{ kind:"mordan", dir:"up" } },
      { type:"ornament", kind:"mordan", dir:"up", note:69, n:4 },
      { type:"listen", notes:[72], orn:{ kind:"mordan", dir:"down" } },
      { type:"ornament", kind:"mordan", dir:"down", note:72, n:4 }
    ] },
  { id:"sus-tril", unit:"susleme", notes:[],
    title:{ tr:"Tril", en:"Trills" },
    text:[
      { tr:"Tril, asıl nota ile üstündeki nota arasında hızlı ve düzenli bir git geldir. Uzun notaları süsler, özellikle karar öncesinde sık duyulur.",
        en:"A trill is a quick, even alternation between the main note and the note above. It decorates long notes and is often heard just before a cadence." },
      { tr:"Trili tek parmakla yap: asıl notanın parmağı dururken yalnızca üst notayı açan parmak oynar. Önce yavaş ve eşit başla, hız düzenden sonra gelir.",
        en:"Trill with one finger: keep the fingering of the main note and move only the finger that opens the upper note. Start slow and even; speed comes after evenness." },
      { tr:"Uygulama saniyedeki dönüş sayısını (bir dönüş = iki nota) ve iki notada kalma sürelerinin ne kadar eşit olduğunu ölçer.",
        en:"The app measures turns per second (one turn = two notes) and how evenly you stay on each note." }
    ],
    tips:[
      { tr:"Parmağı yüksek kaldırma; deliğin hemen üstünde kalırsa tril hem hızlı hem düzenli olur.", en:"Don't lift the finger high; kept just above the hole, the trill becomes both faster and more even." }
    ],
    steps:[
      { type:"listen", notes:[67], orn:{ kind:"tril", dir:"up" } },
      { type:"ornament", kind:"tril", dir:"up", note:67, rate:4, sec:2 },
      { type:"ornament", kind:"tril", dir:"up", note:67, rate:6, sec:2 },
      { type:"ornament", kind:"tril", dir:"up", note:74, rate:5, sec:2 }
    ] },
  { id:"sus-uslup", unit:"susleme", notes:[],
    title:{ tr:"Sol klarnet üslubu: kayarak giriş ve düşüş", en:"Sol clarinet style: slide-ins and falls" },
    text:[
      { tr:"Sol klarnetin sesini tanınır yapan şeylerden biri notalara kayarak girmek ve notaların sonunu aşağı bırakmaktır. Glissando dersindeki parmak sıyırmasını burada kısa ve tek nota üzerinde kullanırsın.",
        en:"Part of what makes the Sol clarinet recognisable is sliding into notes and letting their ends fall. You use the finger slide from the glissando lesson here, short and on a single note." },
      { tr:"Kayarak girişte notaya birkaç koma pesten başlarsın: parmak deliğin kenarından sıyrılır, dudak sesi yukarı taşır. Düşüşte nota tutulurken sonunda ses kesilmeden aşağı bırakılır.",
        en:"For a slide-in, start a few commas below the note: the finger slides off the edge of the hole while the lips carry the pitch up. For a fall, hold the note and let it drop at the end without stopping the sound." }
    ],
    tips:[
      { tr:"Kayış kısa olmalı: notaya en geç 0,4 saniyede otur.", en:"Keep the slide short: settle on the note within 0.4 seconds." }
    ],
    steps:[
      { type:"listen", notes:[69], orn:{ kind:"giris" } },
      { type:"ornament", kind:"giris", note:69, n:4 },
      { type:"listen", notes:[69], orn:{ kind:"dusus" } },
      { type:"ornament", kind:"dusus", note:69, n:4 },
      { type:"ornament", kind:"giris", note:74, n:4 }
    ] },
  { id:"sus-ezgi", unit:"susleme", notes:[],
    title:{ tr:"Süslemeyi ezgide kullanmak", en:"Using ornaments in a melody" },
    text:[
      { tr:"Süslemeler ezginin içinde anlam kazanır. Bu iki etütte süslemeler dizekte işaretli: tr tril, küçük nota çarpma, dalgalı işaret mordan, notadan önceki çizgi kayarak giriş, sonraki çizgi düşüş.",
        en:"Ornaments make sense inside a melody. In these two études they are marked on the staff: tr is a trill, a small note a grace note, the wavy sign a mordent, a line before the note a slide-in, a line after it a fall." },
      { tr:"Önce dinle, sonra süslemeleri atlamadan tempoda çal. Uygulama doğru nota oranının yanında işaretli süslemelerden kaçını duyduğunu da söyler.",
        en:"Listen first, then play in tempo without skipping the ornaments. Besides the share of correct notes, the app tells you how many of the marked ornaments it heard." }
    ],
    tips:[
      { tr:"Süsleme tempoyu bozmamalı: süs notası asıl notanın zamanından çalınır.", en:"Ornaments must not break the tempo: the grace note takes its time from the main note." }
    ],
    steps:[
      { type:"piece", id:"e-sus-ussak", mode:"tempo", min:60 },
      { type:"piece", id:"e-sus-hicaz", mode:"tempo", min:55 }
    ] },
  { id:"sus-grupetto", unit:"susleme", notes:[],
    title:{ tr:"Grupetto (çevirme)", en:"The turn (grupetto)" },
    text:[
      { tr:"Grupetto, asıl notanın etrafında dönen dört notalık bir süstür: üstteki nota, asıl nota, alttaki nota ve yine asıl nota. İlk üçü çok kısa, sonuncusu uzundur; ezgiye yuvarlak bir dönüş katar.",
        en:"The turn is a four-note ornament that circles the main note: the note above, the main note, the note below and the main note again. The first three are very short and the last one long; it gives the tune a rounded twist." },
      { tr:"Makamda komşu notalar makamın dizisinden gelir: Hicaz'da Nevâ'nın üstü Hüseynî, altı Nim Hicaz'dır. Dört notayı tek nefeste, bağlı çal.",
        en:"In a makam the neighbours come from its scale: in Hicaz, above Nevâ is Hüseynî and below it Nim Hicaz. Play all four notes slurred, in one breath." }
    ],
    tips:[
      { tr:"Önce dört notayı yavaş ve eşit çal, sonra ilk üçünü sıkıştır; son nota hep uzun kalsın.", en:"First play the four notes slowly and evenly, then squeeze the first three; the last note always stays long." }
    ],
    steps:[
      { type:"listen", notes:[69], orn:{ kind:"grupetto" } },
      { type:"ornament", kind:"grupetto", note:69, n:3 },
      { type:"listen", notes:[74], orn:{ kind:"grupetto" }, makam:"hicaz", commas:[31] },
      { type:"ornament", kind:"grupetto", note:74, makam:"hicaz", comma:31, n:3 }
    ] },
  { id:"sus-makam", unit:"susleme", notes:[],
    title:{ tr:"Makamda süsleme", en:"Ornaments within a makam" },
    text:[
      { tr:"Makam içinde süsleme notası makamın dizisinden gelir. Uşşak'ta Segâh'a üstten çarpma Çargâh'tan yapılır; aradaki aralık Batı müziğindeki yarım sesten biraz geniştir.",
        en:"Within a makam the ornament note comes from the makam's scale. In Uşşak a grace note onto Segâh comes from Çargâh; that step is a little wider than a Western semitone." },
      { tr:"Hicaz'da Dügâh üzerindeki tril Dik Kürdî ile yapılır; bu dar aralık Hicaz'ın rengini verir. Göstergede komşu notanın koma sapmasını izle.",
        en:"In Hicaz the trill on Dügâh uses Dik Kürdî; that narrow step gives Hicaz its colour. Watch the comma deviation of the neighbour note on the display." }
    ],
    tips:[
      { tr:"Süs notası da perdesinde olmalı: kısa diye perdesiz çalma.", en:"The ornament note must be in tune too: being short is no excuse to play it out of its perde." }
    ],
    steps:[
      { type:"listen", commas:[17], makam:"ussak", orn:{ kind:"carpma", dir:"up" } },
      { type:"ornament", kind:"carpma", dir:"up", note:71, comma:17, makam:"ussak", n:3 },
      { type:"listen", commas:[9], makam:"hicaz", orn:{ kind:"tril", dir:"up" } },
      { type:"ornament", kind:"tril", dir:"up", note:69, comma:9, makam:"hicaz", rate:5, sec:2 }
    ] }
];

// ---- Hız ve teknik ünitesi ----
// tech adımı: { pattern (skills.js techPattern), start, target } — tempo merdiveni target'a ulaşınca geçer.
// Her kalıptan önce dinleme adımı kalıbı hedef tempoda çalar.
// Arşiv eserinden ders adımları ("eser dersi" kalıbı; docs/BACKLOG.md S0.3): her bölüm önce dinlenir, sonra %60 tempoda
// serbest takiple çalınır; en sonda eserin tamamı %80 ve %100 tempoda. parts: [[from, to] ölçü aralıkları…] (1 tabanlı,
// dahil; boşsa yalnız tamamı), name: eserin adı (adım başlığında; dizin derste yüklenmeden okunmaz)
// o.oct: bütün adımlarda oktav kaydırma (−1: bir oktav pes); o.to: tamamı adımları bu ölçüde biter (tekrarlanan ikinci kıta çalınmaz)
function eserSteps(arsiv, name, parts = [], o = {}){
  const base = { arsiv, name, ...(o.oct ? { oct:o.oct } : {}) }, whole = { ...base, ...(o.to ? { to:o.to } : {}) };
  return [
    ...parts.flatMap(([from, to]) => [{ type:"listen", ...base, from, to, tempoPct:60 }, { type:"piece", ...base, from, to, tempoPct:60, mode:"free", min: o.freeMin || 4 }]),
    ...(parts.length ? [] : [{ type:"listen", ...whole, tempoPct:80 }]),
    { type:"piece", ...whole, tempoPct:80, mode:"tempo", min: o.min80 || 70 },
    { type:"piece", ...whole, tempoPct:100, mode:"tempo", min: o.min || 75 }
  ];
}
// Arşiv adımının başlığı: "Eserin adı · ölçü 1–8 · %60 tempo"
const arsivWhat = (st, lang) => { const en = lang === "en";
  return pick(st.name, lang) + (st.from || st.to ? (en ? " · bars " : " · ölçü ") + (st.from || 1) + "–" + (st.to || "") : "") +
    (st.tempoPct && st.tempoPct !== 100 ? (en ? " · " + st.tempoPct + "% tempo" : " · %" + st.tempoPct + " tempo") : "") +
    (st.oct ? (en ? " · an octave " + (st.oct < 0 ? "lower" : "higher") : " · bir oktav " + (st.oct < 0 ? "pes" : "tiz")) : "") +
    (st.hidden && st.mode !== "mem" ? (en ? " · score hidden" : " · nota gizli") : ""); };
// Ezber adımının başlığı (pieces.js memRounds): iki tur ya da (hidden) doğrudan tümü gizli
const memWhat = (st, en) => st.hidden ? (en ? "from memory, score hidden · at least " + st.min + "% correct" : "ezberden, nota gizli · en az %" + st.min + " doğru")
  : (en ? "memory: first 4 bars erased, then all hidden · at least " + st.min + "% correct" : "ezber: önce ilk 4 ölçü silinir, sonra tümü gizli · en az %" + st.min + " doğru");
const techSteps = (pattern, start, target) => [{ type:"listen", pattern, tempo:target }, { type:"tech", pattern, start, target }];
const HIZ = [
  { id:"hiz-metronom", unit:"hiz", notes:[],
    title:{ tr:"Metronomla dizi", en:"Scales with the metronome" },
    text:[
      { tr:"Hızlı çalmanın yolu yavaş ve temiz çalmaktan geçer. Bu ünitede bir kalıbı metronomla çalarsın; temiz çalınca tempo birkaç vuruş artar, iki kez üst üste zorlanırsan iner. Böylece her gün sınırının hemen altında çalışırsın.",
        en:"The road to playing fast goes through playing slowly and cleanly. In this unit you play a pattern with the metronome; when it is clean the tempo goes up a few beats, and if you struggle twice in a row it comes down. That way you always work just below your limit." },
      { tr:"Temiz çalış: notaların en az %90'ı doğru, notalar vuruşun üstünde ve hepsi eşit uzunlukta. Uygulama her çalıştan sonra en büyük sorunu söyler.",
        en:"A clean run: at least 90% of the notes right, on the beat and all equally long. After every run the app tells you the biggest problem." }
    ],
    tips:[
      { tr:"Parmakları deliklerin hemen üstünde tut; yüksek kaldırılan parmak geç döner.", en:"Keep your fingers just above the holes; a finger lifted high comes back late." },
      { tr:"Omuzlar ve çene gevşek kalsın; hız gerginlikten değil düzenden gelir.", en:"Keep shoulders and jaw loose; speed comes from evenness, not tension." }
    ],
    steps:[
      ...techSteps({ type:"scale", makam:"rast", sub:2, art:"legato" }, 60, 80),
      ...techSteps({ type:"scale", base:60, mode:"major", sub:2, art:"legato" }, 60, 80)
    ] },
  { id:"hiz-artik", unit:"hiz", notes:[],
    title:{ tr:"Bağlı ve dille", en:"Slurred and tongued" },
    text:[
      { tr:"Aynı diziyi önce bağlı (tek nefeste, dilsiz), sonra her notayı dille ayırarak çal. Dille çalarken dil hafifçe kamışa dokunur; hava kesilmez.",
        en:"Play the same scale first slurred (one breath, no tongue), then separating every note with the tongue. When tonguing, the tongue touches the reed lightly; the air never stops." },
      { tr:"Hızlı dille çalışta dil ile parmak aynı anda hareket etmeli. Uygulama dille çalışta notaları ses düzeyindeki kısa düşüşlerden ayırır.",
        en:"In fast tonguing, tongue and fingers must move together. In tongued runs the app separates the notes by the short dips in loudness." }
    ],
    tips:[
      { tr:"Dil vuruşu kısa ve hafif olsun: \"ta\" değil \"da\".", en:"Keep the tongue stroke short and light: \"da\" rather than \"ta\"." }
    ],
    steps:[
      ...techSteps({ type:"scale", makam:"rast", sub:2, art:"legato" }, 70, 90),
      ...techSteps({ type:"scale", makam:"rast", sub:2, art:"tongue" }, 70, 90)
    ] },
  { id:"hiz-parmak", unit:"hiz", notes:[],
    title:{ tr:"Parmak çevikliği", en:"Finger agility" },
    text:[
      { tr:"Dörtlü gruplar diziyi dörder nota ilerleterek parmakların her geçişi tek tek çalışmasını sağlar. Register geçişi ise klarnetin en zor yeridir: boğaz notalarından klarino bölgesine geçerken bütün parmaklar aynı anda kapanmalı.",
        en:"Four-note groups move through the scale four notes at a time so every finger change gets practised. Crossing the break is the hardest spot on the clarinet: going from the throat notes into the clarion register, all fingers must close at the same moment." },
      { tr:"Geçişte takılıyorsan iki notayı yavaşça, parmakları birlikte indirmeye odaklanarak tekrar et.",
        en:"If you stumble at the break, repeat the two notes slowly, focusing on putting the fingers down together." }
    ],
    tips:[
      { tr:"Geçişte havayı kesme; parmaklar değişirken hava aynı hızla aksın.", en:"Don't stop the air at the break; keep it flowing at the same speed while the fingers change." }
    ],
    steps:[
      ...techSteps({ type:"groups", base:67, mode:"major", sub:4, art:"legato" }, 50, 70),
      ...techSteps({ type:"break", pair:[69, 71], sub:4, art:"legato" }, 60, 80),
      ...techSteps({ type:"break", pair:[70, 72], sub:4, art:"legato" }, 60, 80)
    ] },
  { id:"hiz-arpej", unit:"hiz", notes:[],
    title:{ tr:"Arpejler ve üçlüler", en:"Arpeggios and thirds" },
    text:[
      { tr:"Arpej, bir akorun seslerini sırayla çalmaktır: kök, üçlü, beşli, oktav. Dizideki adım adım hareketten farklı olarak atlamalar parmaklardan daha büyük değişimler ister.",
        en:"An arpeggio plays the notes of a chord one after another: root, third, fifth, octave. Unlike stepwise scales, the leaps ask for bigger finger changes." },
      { tr:"Üçlü atlamalar makam müziğinde de sık görülür; Rast dizisinde birer basamak atlayarak çıkıp inersin.",
        en:"Leaps of a third are common in makam music too; you climb and descend the Rast scale skipping one step each time." }
    ],
    tips:[
      { tr:"Atlamada dudağı sıkma; havayı biraz hızlandırmak yeter.", en:"Don't pinch on the leaps; slightly faster air is enough." }
    ],
    steps:[
      ...techSteps({ type:"arp", base:67, mode:"major", sub:2, art:"legato" }, 60, 84),
      ...techSteps({ type:"arp", base:57, mode:"minor", sub:2, art:"legato" }, 60, 84),
      ...techSteps({ type:"thirds", makam:"rast", sub:2, art:"legato" }, 60, 80)
    ] },
  { id:"hiz-16lik", unit:"hiz", notes:[],
    title:{ tr:"On altılıklar", en:"Sixteenth notes" },
    text:[
      { tr:"On altılıkta her vuruşa dört nota düşer. Önce yavaş bir tempoda, vuruşun başındaki notayı hafifçe vurgulayarak çal; dörtlü gruplar kulağında sayılmayı kolaylaştırır.",
        en:"In sixteenths four notes fall on every beat. Start at a slow tempo and lightly accent the note on the beat; hearing the groups of four makes counting easier." },
      { tr:"İki oktavlık gamda register geçişi hızda gelir; geçişi önceki dersteki gibi hazırlamış olman burada işe yarar.",
        en:"In the two-octave scale the break comes at speed; the work you did on it in the previous lesson pays off here." }
    ],
    tips:[
      { tr:"Nefesi gamın başında al; ortada nefes almak zorunda kalırsan tempoyu düşür.", en:"Breathe before the scale; if you have to breathe in the middle, lower the tempo." }
    ],
    steps:[
      ...techSteps({ type:"scale", makam:"rast", sub:4, art:"legato" }, 60, 80),
      ...techSteps({ type:"scale", base:55, mode:"major", octaves:2, sub:4, art:"legato" }, 50, 70)
    ] },
  { id:"hiz-makam", unit:"hiz", notes:[],
    title:{ tr:"Makam dizileri hızda", en:"Makam scales at speed" },
    text:[
      { tr:"Hızlı çalarken de perdeler yerinde olmalı: Uşşak'ta Segâh, Hicaz'da Dik Kürdî ve Nim Hicaz, Nihâvend'de Kürdî. Uygulama yanlış perdeyi yanlış nota sayar.",
        en:"The perdes must stay in place at speed too: Segâh in Uşşak, Dik Kürdî and Nim Hicaz in Hicaz, Kürdî in Nihâvend. The app counts a wrong perde as a wrong note." }
    ],
    tips:[
      { tr:"Önce diziyi yavaşça dronla çal, sonra merdivene geç.", en:"Play the scale slowly against the drone first, then start the ladder." }
    ],
    steps:[
      ...techSteps({ type:"scale", makam:"ussak", sub:4, art:"legato" }, 70, 90),
      ...techSteps({ type:"scale", makam:"hicaz", sub:4, art:"legato" }, 70, 90),
      ...techSteps({ type:"scale", makam:"nihavend", sub:4, art:"legato" }, 70, 90)
    ] },
  { id:"hiz-etut", unit:"hiz", notes:[],
    title:{ tr:"Hızlı etüt", en:"Fast étude" },
    text:[
      { tr:"Bu Hicaz oyun havası pasajı sekizliklerle ♩=120'de çalınır. Merdiven %60 tempodan başlar; her temiz çalışta %5 hızlanır.",
        en:"This Hicaz dance passage is played in eighths at ♩=120. The ladder starts at 60% tempo and speeds up 5% after every clean run." }
    ],
    tips:[
      { tr:"9/8'in uzun vuruşunu (son üç sekizlik) hissederek çal; hızda ölçü dağılmasın.", en:"Feel the long beat of 9/8 (the last three eighths); don't let the bar fall apart at speed." }
    ],
    steps:[
      { type:"piece", id:"e-hiz-hicaz", mode:"ladder", min:100 }
    ] }
];

// ---- Trakya ve Roman ünitesi ----
// Oyun havaları: kasap havası (2/4), karşılama ve Roman havası (9/8), çiftetelli (8/8), Rumeli (7/8), Nikriz makamı,
// sirto (2/4), köçekçe (aksak 9/8), zeybek (9/4), Ağır Roman ve çarpmalı tekrar, Trakya üslubu (kayış, çarpma, düşüş) ve oyun havası öncesi taksim. Etütler repertoire.js'te (level 6), usuller learn.js'te.
const TRAKYA = [
  { id:"trakya-giris", unit:"trakya", notes:[],
    title:{ tr:"Trakya ve Roman klarneti, kasap havası", en:"Thracian and Romani clarinet, the kasap dance" },
    text:[
      { tr:"Sol klarnet Trakya'da, Rumeli'de ve Roman müzisyenlerin elinde oyun havasının baş sazıdır. Bu üslupta ses parlak ve güçlüdür; ezgi bol çarpma, kayış ve düşüşle süslenir, usul ise hiç bırakılmaz.",
        en:"The G clarinet is the lead instrument of dance music in Thrace, the Balkans (Rumeli) and among Romani musicians. In this style the tone is bright and strong; the tune is full of grace notes, slides and falls, and the usul never lets go." },
      { tr:"En sık usuller: kasap havası (2/4), karşılama ve Roman havası (9/8, 2+2+2+3), çiftetelli (8/8) ve Rumeli havaları (7/8, 2+2+3). Makam olarak Hicaz, Karcığar, Uşşak, Hüseynî ve Nikriz öne çıkar.",
        en:"The most common usuls: kasap (2/4), karşılama and Roman havası (9/8, 2+2+2+3), çiftetelli (8/8) and Rumeli tunes (7/8, 2+2+3). The usual makams are Hicaz, Karcığar, Uşşak, Hüseynî and Nikriz." },
      { tr:"Bu müzik kulaktan öğrenilir. Ünitedeki etütler bu üslupta yazıldı; asıl repertuvarı ustaların kayıtlarından Kulaktan çıkar aracıyla yavaşlatarak, Eşlik sekmesinde darbuka ve bas eşliğinde çalarak öğren.",
        en:"This music is learned by ear. The études in this unit are written in the style; learn the real repertoire from masters' recordings with the Learn by ear tool (slowed down), and play along with darbuka and bass in the Play-along tab." }
    ],
    tips:[
      { tr:"Kasap havasında her vuruş bir adım gibidir: düm ve tek eşit, canlı ve sürekli.", en:"In the kasap every beat is a step: düm and tek even, lively and steady." },
      { tr:"Önce usulü elinle vur, sonra ezgiyi çal.", en:"First tap the usul with your hand, then play the tune." }
    ],
    steps:[
      { type:"read", title:{ tr:"Bu üniteyi nasıl çalışmalı?", en:"How to work through this unit" }, body:[
        { tr:"Her derste önce usulü metronomla çal (Ritim adımı), sonra etüdü serbest takiple notaları oturt, en son tempolu çal. Takıldığın etüdü Etüt ve eserler'de Merdiven ile hızlandır.",
          en:"In each lesson first play the usul with the metronome (the Rhythm step), then settle the notes in follow mode, and finally play in tempo. Speed up an étude you are stuck on with the Ladder in Études & pieces." },
        { tr:"Günde bir kez Eşlik sekmesini aç: usulü ve makamı seç, darbuka ve bas çalarken serbestçe çal. Orkestrayla çalmak usulü vücuduna oturtur.",
          en:"Open the Play-along tab once a day: pick the usul and the makam and play freely while the darbuka and bass play. Playing with a band puts the usul into your body." },
        { tr:"Bir etüdü tempolu çalabildiğinde Etüt ve eserler'de “Benimle çal”a bas: orkestra seni izler, sen hızlanınca hızlanır, yavaşlayınca yavaşlar, durursan bekler.",
          en:"Once you can play an étude in tempo, press “Play with me” in Études & pieces: the band follows you, speeding up and slowing down with you and waiting when you stop." } ] },
      { type:"rhythm", usul:"kasap", tempo:100, bars:4, min:60 },
      { type:"piece", id:"e-kasap", mode:"free", min:6 },
      { type:"piece", id:"e-kasap", mode:"tempo", min:60 }
    ] },
  { id:"karsilama", unit:"trakya", notes:[], makam:"hicaz",
    title:{ tr:"Karşılama (9/8)", en:"Karşılama (9/8)" },
    text:[
      { tr:"Karşılama, karşılıklı oynanan bir Trakya oyunudur. Ölçü dokuz sekizliktir ve 2+2+2+3 diye sayılır: üç kısa vuruş ve bir uzun vuruş. Uzun vuruş oyuncunun ağırlığını verdiği yerdir; aceleye getirme.",
        en:"Karşılama is a Thracian dance danced face to face. The bar has nine eighths counted 2+2+2+3: three short beats and one long one. The long beat is where the dancer puts their weight; don't rush it." },
      { tr:"Etüt Hicaz'dadır: Dügâh'ta Hicaz dörtlüsü (Dik Kürdî, Nim Hicaz), Nevâ'da yarım karar.",
        en:"The étude is in Hicaz: the Hicaz tetrachord on Dügâh (Dik Kürdî, Nim Hicaz), half cadence on Nevâ." }
    ],
    tips:[
      { tr:"Saymayı “bir-iki, bir-iki, bir-iki, bir-iki-üç” diye yap.", en:"Count “one-two, one-two, one-two, one-two-three”." }
    ],
    steps:[
      { type:"rhythm", usul:"karsilama", tempo:180, bars:3, min:55 },
      { type:"scale", makam:"hicaz", min:0.55 },
      { type:"piece", id:"e-karsilama", mode:"free", min:5 },
      { type:"piece", id:"e-karsilama", mode:"tempo", min:60 }
    ] },
  { id:"roman-havasi", unit:"trakya", notes:[], makam:"kurdi",
    title:{ tr:"Roman havası (9/8)", en:"Roman havası (9/8)" },
    text:[
      { tr:"Roman havası da 9/8'dir ama vurgusu farklıdır: son grup (3) “düm-tek” diye ikiye bölünür ve ölçünün sonunda bir sıçrama hissi verir. Ezgiler kısa, tekrar eden motiflerden kurulur.",
        en:"The Roman havası is also 9/8 but with a different accent: the last group (3) splits into “düm-tek”, giving a lift at the end of the bar. Tunes are built from short, repeating motifs." },
      { tr:"Aynı nota art arda gelince dil yerine çarpmalı tekrar dene (Süsleme ünitesi); Roman klarnetinin karakteri buradan gelir.",
        en:"When the same note repeats, try a grace-note split instead of tonguing (Ornaments unit); this is where the character of Romani clarinet comes from." }
    ],
    tips:[
      { tr:"Tempo merdiveniyle yavaştan başla; hızlanınca 9/8'in uzun vuruşu kısalmasın.", en:"Start slow with the tempo ladder; as you speed up, don't shorten the long beat of 9/8." }
    ],
    steps:[
      { type:"rhythm", usul:"roman", tempo:180, bars:3, min:55 },
      { type:"scale", makam:"kurdi", min:0.55 },
      { type:"piece", id:"e-roman", mode:"tempo", min:60 },
      { type:"piece", id:"e-roman", mode:"ladder", min:100 }
    ] },
  { id:"nikriz", unit:"trakya", notes:[], makam:"nikriz",
    title:{ tr:"Nikriz makamı", en:"Makam Nikriz" },
    text:[
      { tr:"Nikriz, Rast'ta Nikriz beşlisi (Rast, Dügâh, Dik Kürdî, Nim Hicaz, Nevâ) ile Nevâ'da Rast ve Bûselik dörtlülerinden kurulur: çıkarken Evç, inerken Acem. Dik Kürdî ile Nim Hicaz arasındaki artık ikili Nikriz'e kendine özgü rengini verir; Trakya karşılamalarında da duyulur.",
        en:"Nikriz is a Nikriz pentachord on Rast (Rast, Dügâh, Dik Kürdî, Nim Hicaz, Nevâ) with Rast and Bûselik tetrachords on Nevâ: Evç going up, Acem coming down. The augmented second between Dik Kürdî and Nim Hicaz gives Nikriz its own colour; it is also heard in Thracian karşılamas." },
      { tr:"Güçlü Nevâ'dır; Nevâ'da yarım karar, Rast'ta tam karar verilir. Rast'a çoğunlukla Irak üzerinden (yeden) gelinir.",
        en:"The dominant is Nevâ; half cadence on Nevâ, final on Rast. Rast is usually approached through Irak (the leading note)." }
    ],
    tips:[
      { tr:"Nim Hicaz (yazılı Do♯5) çoğu klarnette biraz pes çıkar; Nevâ'ya giderken yerini kulakla kontrol et.", en:"Nim Hicaz (written C♯5) comes out a little flat on most clarinets; check it by ear on the way to Nevâ." }
    ],
    steps:[
      { type:"listen", commas:[0, 9, 14, 26, 31, 26, 14, 9, 0] },
      { type:"scale", makam:"nikriz", min:0.55 },
      { type:"mimic", makam:"nikriz", len:5 },
      { type:"piece", id:"e-nikriz", mode:"tempo", min:65 }
    ] },
  { id:"ciftetelli", unit:"trakya", notes:[], makam:"nikriz",
    title:{ tr:"Çiftetelli (8/8)", en:"Çiftetelli (8/8)" },
    text:[
      { tr:"Çiftetelli sekiz sekizliktir; vuruşlar eşit değil, kaydırmalıdır: “düm . tek tek düm düm tek .” Ezgi uzun-kısa (noktalı) adımlarla salınır.",
        en:"Çiftetelli has eight eighths with uneven, syncopated strokes: “düm . tek tek düm düm tek .” The tune sways in long-short (dotted) steps." }
    ],
    tips:[
      { tr:"Noktalı dörtlükten sonra gelen sekizliği kısa ve hafif çal; vurgu bir sonraki notadadır.", en:"Play the eighth after a dotted quarter short and light; the accent falls on the next note." }
    ],
    steps:[
      { type:"rhythm", usul:"ciftetelli", tempo:160, bars:3, min:55 },
      { type:"piece", id:"e-ciftetelli", mode:"free", min:5 },
      { type:"piece", id:"e-ciftetelli", mode:"tempo", min:60 }
    ] },
  { id:"rumeli", unit:"trakya", notes:[], makam:"huseyni",
    title:{ tr:"Rumeli havası (7/8)", en:"Rumeli tune (7/8)" },
    text:[
      { tr:"Rumeli ve Balkan oyun havalarında 7/8 sık görülür: 2+2+3 diye sayılır, son vuruş uzundur. Etüt Hüseynî'dedir; çıkarken Evç, inerken Acem kullanılır.",
        en:"7/8 is common in Rumeli and Balkan dance tunes: counted 2+2+3, with a long last beat. The étude is in Hüseynî; Evç going up, Acem coming down." }
    ],
    tips:[
      { tr:"“Bir-iki, bir-iki, bir-iki-üç”: uzun vuruşta nefesini bırakma.", en:"“One-two, one-two, one-two-three”: don't drop your breath on the long beat." }
    ],
    steps:[
      { type:"rhythm", usul:"rumeli", tempo:200, bars:3, min:55 },
      { type:"piece", id:"e-rumeli", mode:"free", min:5 },
      { type:"piece", id:"e-rumeli", mode:"tempo", min:60 }
    ] },
  { id:"trakya-uslup", unit:"trakya", notes:[], makam:"hicaz",
    title:{ tr:"Trakya üslubu: kayış, çarpma, düşüş", en:"Thracian style: slides, grace notes, falls" },
    text:[
      { tr:"Bu üslubu notadan çok süslemeler belirler: uzun notaya alttan kayarak girilir, vurgulu notalar çarpmayla, cümle sonları düşüşle süslenir. Ağır Roman bunların hepsini yavaş tempoda duyurur.",
        en:"This style is defined more by ornaments than by notes: long notes are entered with a slide from below, accented notes get grace notes, phrase ends get falls. The ağır Roman (slow Romani dance) shows all of them at a slow tempo." }
    ],
    tips:[
      { tr:"Süslemeyi abartma: ana nota hep daha uzun ve daha güçlü kalmalı.", en:"Don't overdo it: the main note must stay longer and stronger." }
    ],
    steps:[
      { type:"glide", from:69, to:74, n:2 },
      { type:"listen", notes:[74], orn:{ kind:"carpma", dir:"up" } },
      { type:"ornament", kind:"carpma", dir:"up", note:74, makam:"hicaz", comma:31, n:4 },
      { type:"ornament", kind:"dusus", note:74, makam:"hicaz", comma:31, n:3 },
      { type:"piece", id:"e-agir-roman", mode:"tempo", min:55 }
    ] },
  { id:"sirto-kocekce", unit:"trakya", notes:[], makam:"hicaz",
    title:{ tr:"Sirto ve köçekçe", en:"Sirto and köçekçe" },
    text:[
      { tr:"Sirto Rumeli'den ve adalardan gelen 2/4'lük bir oyun havasıdır; kasaptan daha yaylıdır: ölçünün başı kısa-kısa-uzun sekizlik ve on altılıklarla sekerek ilerler.",
        en:"The sirto is a 2/4 dance from Rumeli and the islands; it is springier than the kasap: the start of the bar skips forward in short-short-long eighths and sixteenths." },
      { tr:"Köçekçeler köçeklerin dans ettiği oyun havası takımlarıdır; çoğu aksak 9/8'dir (2+2+2+3). Etüt Karcığar'dadır: Dügâh'ta Uşşak dörtlüsü, Nevâ'da Hicaz beşlisi (Hisar, Evç).",
        en:"Köçekçe are suites of dance tunes for the köçek dancers; most are in limping 9/8 (2+2+2+3). The étude is in Karcığar: an Uşşak tetrachord on Dügâh and a Hicaz pentachord on Nevâ (Hisar, Evç)." }
    ],
    tips:[
      { tr:"On altılıkları dille değil, bağlı ve hafif çal; vurgu ölçünün başında kalsın.", en:"Play the sixteenths slurred and light, not tongued; keep the accent at the start of the bar." }
    ],
    steps:[
      { type:"rhythm", usul:"sirto", tempo:100, bars:4, min:60 },
      { type:"piece", id:"e-sirto", mode:"free", min:6 },
      { type:"piece", id:"e-sirto", mode:"tempo", min:60 },
      { type:"rhythm", usul:"aksak", tempo:180, bars:3, min:55 },
      { type:"scale", makam:"karcigar", min:0.55 },
      { type:"piece", id:"e-kocekce", mode:"tempo", min:60 }
    ] },
  { id:"zeybek", unit:"trakya", notes:[], makam:"huseyni",
    title:{ tr:"Zeybek (ağır 9/4)", en:"Zeybek (slow 9/4)" },
    text:[
      { tr:"Zeybek Ege'nin ağır, ağırbaşlı oyunudur. Ölçü dokuz dörtlüktür ve 2+2+2+3 diye sayılır; her vuruş bir adımdır, son uzun vuruşta oyuncu diz vurur ya da döner.",
        en:"The zeybek is the slow, stately dance of the Aegean. The bar has nine quarters counted 2+2+2+3; each beat is a step, and on the last long beat the dancer kneels or turns." },
      { tr:"Uzun notalar zeybeğin ruhudur: sesi sonuna kadar dolu tut, girişleri kayarak yap, cümle sonlarında düşüşle bırak.",
        en:"Long notes are the soul of the zeybek: keep the sound full to the end, slide into the entries and let phrase ends go with a fall." }
    ],
    tips:[
      { tr:"Acele etme: ağır tempoda usulü içinden say, uzun vuruşu kısaltma.", en:"Don't rush: count the usul in your head at the slow tempo and don't shorten the long beat." }
    ],
    steps:[
      { type:"rhythm", usul:"zeybek", tempo:84, bars:2, min:55 },
      { type:"hold", note:76, sec:8, min:55 },
      { type:"piece", id:"e-zeybek", mode:"free", min:5 },
      { type:"piece", id:"e-zeybek", mode:"tempo", min:60 }
    ] },
  { id:"agir-roman", unit:"trakya", notes:[], makam:"kurdi",
    title:{ tr:"Ağır Roman ve çarpmalı tekrar", en:"Ağır Roman and split repeated notes" },
    text:[
      { tr:"Roman klarnetinin imzası çarpmalı tekrardır: aynı nota art arda gelince dille kesilmez, üstteki notaya kısacık vurularak bölünür. Ağır Roman bunu yavaş tempoda, her tekrarda duyurur.",
        en:"The signature of Romani clarinet is the split repeated note: when a note repeats it isn't tongued but split by a very short tap on the note above. The ağır Roman makes it heard on every repeat." },
      { tr:"Etüt Kürdî'dedir; aynı perdenin ikinci notasındaki ç+ işareti çarpmayı gösterir.",
        en:"The étude is in Kürdî; the ç+ mark on the second of two equal notes shows the grace note." }
    ],
    tips:[
      { tr:"Önce Nevâ'yı uzun tut ve Hüseynî parmağıyla üç kez böl; ses hiç kesilmesin.", en:"First hold Nevâ and split it three times with the Hüseynî finger; the sound must never stop." }
    ],
    steps:[
      { type:"listen", notes:[74], orn:{ kind:"tekrar", dir:"up" } },
      { type:"ornament", kind:"tekrar", dir:"up", note:74, makam:"kurdi", comma:31, n:3 },
      { type:"ornament", kind:"tekrar", dir:"up", note:72, makam:"kurdi", comma:22, n:3 },
      { type:"piece", id:"e-agir-roman-kurdi", mode:"free", min:6 },
      { type:"piece", id:"e-agir-roman-kurdi", mode:"tempo", min:55 }
    ] },
  { id:"trakya-taksim", unit:"trakya", notes:[], makam:"hicaz",
    title:{ tr:"Oyun havası öncesi taksim", en:"The taksim before a dance tune" },
    text:[
      { tr:"Trakya ve Roman müziğinde oyun havasından önce kısa, usulsüz bir taksim çalınır: makamı tanıtır ve oyuna hazırlar. Genellikle güçlü civarında başlar, birkaç cümlede durağa iner ve oyun havası hemen başlar.",
        en:"In Thracian and Romani music a short, unmetered taksim comes before the dance tune: it presents the makam and prepares the dance. It usually starts near the dominant, comes down to the final in a few phrases, and the dance starts straight away." },
      { tr:"Taksimden sonra oyuna geçmeyi Eşlik sekmesinde çalış: aynı makamı ve Roman havası ya da karşılama usulünü seç, “Taksimle başla”ya bas. Grup dem tutar; taksimi durakta uzun bir notayla bitirip nefes alınca oyun havasının ilk notasıyla seninle girer ve temponu izler.",
        en:"Practise going from the taksim into the dance in the Play-along tab: pick the same makam and the Roman havası or karşılama usul and press “Start with a taksim”. The band holds a drone; end the taksim with a long note on the tonic, take a breath, and it comes in with the first note of the dance tune and follows your tempo." }
    ],
    tips:[
      { tr:"Ustaların taksimlerini Kulaktan çıkar aracında %50 hızda dinle; bir cümleyi döngüye al ve taklit et.", en:"Listen to masters' taksims at 50% speed in the Learn by ear tool; loop one phrase and imitate it." }
    ],
    steps:[
      { type:"seyir", makam:"hicaz", sec:45, min:55 },
      { type:"seyir", makam:"kurdi", sec:45, min:55 },
      { type:"seyir", makam:"nikriz", sec:45, min:55 }
    ] }
];

// ---- Okuma ve kulak ----
// sight: deşifre (ilk görüşte okuma; ezgi her seferinde yeniden üretilir, reading.js), dictation: ezgi ya da ritim dikte,
// ear mode:"interval": aralık tanıma. İkinci basamak İleri seviye ünitesinde.
const OKUMA1 = [
  { id:"desifre-1", unit:"teknik", notes:[],
    title:{ tr:"Deşifre: ilk görüşte okuma", en:"Sight-reading" },
    text:[
      { tr:"Deşifre, daha önce görmediğin bir notayı ilk seferde çalmaktır. Her turda yeni bir ezgi üretilir; önce birkaç saniye göz gezdirirsin, sonra bir ölçü sayımla tempoda çalarsın.",
        en:"Sight-reading is playing music you have never seen, first time. A new tune is generated every round; you get a few seconds to look it over, then play in tempo after a one-bar count-in." },
      { tr:"Durma, düzeltme: yanlış notayı geç, tempoyu tut. Önce ölçünün başlarına, sonra atlamalara bak.",
        en:"Don't stop or fix: let a wrong note go and keep the tempo. Look first at where the bars start, then at the leaps." }
    ],
    tips:[
      { tr:"Göz bir iki nota ileride olsun: çaldığın notaya değil, sıradakine bak.", en:"Keep your eyes a note or two ahead: look at the next note, not the one you are playing." }
    ],
    steps:[
      { type:"sight", level:1, min:70 },
      { type:"sight", level:2, min:65 }
    ] },
  { id:"dikte-1", unit:"teknik", notes:[],
    title:{ tr:"Dikte: duyduğunu yaz", en:"Dictation: write what you hear" },
    text:[
      { tr:"Dikte kulakla notayı birleştirir: uygulama kısa bir ritim ya da ezgi çalar, sen onu yazarsın. Kulaktan çıkarmanın ilk adımı budur.",
        en:"Dictation joins the ear and the page: the app plays a short rhythm or tune and you write it down. It is the first step towards learning by ear." },
      { tr:"Ritim diktesinde duyduğun ritmi dört nota arasından seç. Ezgi diktesinde ilk nota verilir; kalan notaları sırayla düğmelerden seç.",
        en:"In rhythm dictation pick the rhythm you heard from four options. In melodic dictation the first note is given; pick the remaining notes in order from the buttons." }
    ],
    tips:[
      { tr:"Ezgiyi önce içinden söyle; yukarı mı aşağı mı, adım mı atlama mı, ona karar ver.", en:"Sing the tune in your head first; decide whether it goes up or down, steps or leaps." }
    ],
    steps:[
      { type:"dictation", mode:"rhythm", level:1, n:6, min:5 },
      { type:"dictation", mode:"melody", level:1, n:6, min:4 }
    ] },
  { id:"aralik", unit:"teknik", notes:[],
    title:{ tr:"Aralıklar: Batı ve makam aralıkları", en:"Intervals: Western and makam" },
    text:[
      { tr:"İki ses arasındaki uzaklığa aralık denir. Batı müziğinde ikili, üçlü, dörtlü, beşli ve oktav; makam müziğinde ise koma cinsinden bakiye (4), küçük mücenneb (5), büyük mücenneb (8), tanini (9) ve artık ikili (12–13) vardır.",
        en:"The distance between two notes is an interval. Western music has seconds, thirds, fourths, fifths and the octave; makam music measures in commas: bakiye (4), small mücenneb (5), large mücenneb (8), tanini (9) and the augmented second (12–13)." },
      { tr:"Makam aralıklarını duymak, Uşşak'ın Segâh'ını Rast'ın Segâh'ından, Hicaz'ın artık ikilisini Kürdî'den ayırmanı sağlar.",
        en:"Hearing makam intervals lets you tell Uşşak's Segâh from Rast's, and Hicaz's augmented second from Kürdî." }
    ],
    tips:[
      { tr:"Bildiğin ezgilerle eşleştir: dörtlü “düğün marşının” ilk iki notası gibi, Hicaz'ın artık ikilisi Roman havalarının rengi.", en:"Match intervals with tunes you know; Hicaz's augmented second is the colour of Romani tunes." }
    ],
    steps:[
      { type:"ear", mode:"interval", pool:"bati", n:10, min:7 },
      { type:"ear", mode:"interval", pool:"makam", n:10, min:6 }
    ] }
];
const OKUMA2 = [
  { id:"desifre-2", unit:"ileri", notes:[],
    title:{ tr:"Deşifre: makam perdeleri ve aksak usuller", en:"Sight-reading: makam perdes and limping usuls" },
    text:[
      { tr:"Bu basamakta ezgiler makam dizilerinden üretilir: koma işaretli perdeler (Segâh, Dik Kürdî, Nim Hicaz…) ve 9/8, 7/8 gibi aksak ölçüler gelir.",
        en:"At this stage tunes are generated from makam scales: perdes with comma accidentals (Segâh, Dik Kürdî, Nim Hicaz…) and limping metres such as 9/8 and 7/8." }
    ],
    tips:[
      { tr:"Koma işaretini gördüğünde parmağı ve perdeyi birlikte düşün: ♭1 Segâh, ♯4 Nim Hicaz gibi.", en:"When you see a comma accidental think of the fingering and the perde together: ♭1 is Segâh, ♯4 Nim Hicaz, and so on." }
    ],
    steps:[
      { type:"sight", level:3, min:65 },
      { type:"sight", level:4, min:60 }
    ] },
  { id:"dikte-2", unit:"ileri", notes:[],
    title:{ tr:"Dikte: makam ezgileri ve usuller", en:"Dictation: makam tunes and usuls" },
    text:[
      { tr:"Ezgiler artık makam perdelerinden gelir ve daha uzundur; ritimler aksak usullerden seçilir.",
        en:"Tunes now come from makam perdes and are longer; rhythms come from limping usuls." }
    ],
    tips:[],
    steps:[
      { type:"dictation", mode:"rhythm", level:3, n:6, min:4 },
      { type:"dictation", mode:"melody", level:3, n:6, min:4 }
    ] }
];

// Yeni dersleri müfredattaki yerlerine yerleştir. İlk ses Başlarken'e taşınır (kimliği aynı, ilerleme korunur):
// parçalar → kamış → oturuş → eller → ağızlık → ilk ses → uzun ses → dil → geçiş → nefes, sonra nota ve ritim
{ const ilk = LESSONS.splice(LESSONS.findIndex(l => l.id === "ilk-ses"), 1)[0]; ilk.unit = "baslangic";
  BASLANGIC.splice(BASLANGIC.findIndex(l => l.id === "uzun-ses-ilk"), 0, ilk); }
LESSONS.unshift(...BASLANGIC);
// Heceyle söyleme klarnetle ritimden önce gelir: ağızla öğren, sonra çal
{ const h = LESSONS.splice(LESSONS.findIndex(l => l.id === "ritim-hece"), 1)[0]; LESSONS.splice(LESSONS.findIndex(l => l.id === "ritim-temel"), 0, h); }
LESSONS.splice(LESSONS.findIndex(l => l.id === "vibrato") + 1, 0, ...TEKNIK2);
LESSONS.splice(LESSONS.findIndex(l => l.id === "huzzam") + 1, 0, ...MAKAM2);
LESSONS.push(...ILERI);
LESSONS.splice(LESSONS.findIndex(l => l.id === "rast-giris"), 0, ...SUSLEME);
LESSONS.splice(LESSONS.findIndex(l => l.id === "sus-carpma"), 0, ...HIZ);
LESSONS.splice(LESSONS.findIndex(l => l.id === "kulak-1") + 1, 0, ...OKUMA1);
LESSONS.splice(LESSONS.findIndex(l => l.id === "taksim-cumle"), 0, ...TRAKYA);
LESSONS.push(...OKUMA2);

// Sonradan eklenen dersler (müfredat sürümü 2 ve sonrası; docs/BACKLOG.md S1–S5) var olan dersin hemen arkasına girer.
// Her yeni derste since: <sürüm> olur (migrateCurriculum, sınavın dondurulması). Bloklar PBI'a göre ayrı tutulur.
function insertLessonAfter(afterId, ...ls){
  const i = LESSONS.findIndex(l => l.id === afterId);
  if(i < 0) throw new Error("insertLessonAfter: ders yok " + afterId);
  LESSONS.splice(i + 1, 0, ...ls);
}

// ---- S1.1 Temeller ezgileri ----
// Her yeni nota grubundan sonra o notalarla kısa ezgiler: dinle, zor geçişi ayır, etüdü önce serbest takipte sonra
// tempoda çal, dizekten oku. Etütler repertoire.js'te (e-t1…e-t10)
const ezgiSteps = (listen, pass, etudes, staff, o = {}) => [
  { type:"listen", notes: listen },
  { type:"notes", notes: pass, maxMiss: o.maxMiss || 3 },
  ...etudes.flatMap((id, k) => k < (o.free ?? etudes.length) ? [{ type:"piece", id, mode:"free", min: o.freeMin || 4 }, { type:"piece", id, mode:"tempo", min:70 }]
                                                             : [{ type:"piece", id, mode:"tempo", min:70 }]),
  { type:"quiz", notes: staff, mode:"staff", n: o.n || 8, min: o.min || 6 }
];
const EZGI_TEXT = {
  slow:{ tr:"Etüdü önce serbest takipte çal: uygulama seni bekler, acele yok. Takıldığın iki notayı ayırıp beş kez temiz çal, sonra yeniden baştan. Tempolu çalış ancak serbestte rahatça çıkınca.",
         en:"Play the étude in follow mode first: the app waits for you, there is no rush. Take the two notes you stumble on, play them cleanly five times, then start again. Move to the in-tempo run only when follow mode feels easy." }
};
insertLessonAfter("sol-el-2", { id:"ezgi-sol-el", unit:"temel", since:2, notes:[],
  title:{ tr:"Sol elle iki ezgi", en:"Two tunes with the left hand" },
  text:[
    { tr:"Sol elin altı notasıyla (Do4, Re4, Mi4, Fa4, Fa♯4, Sol4) iki kısa ezgi. Birincisi Fa4'ü, ikincisi Fa♯4'ü kullanır: ikisinin parmağı farklıdır, kulağın da farkı duysun. En zor geçiş Mi4 → Fa4: yan mandala basarken sol elin parmakları kalkmasın.",
      en:"Two short tunes on the six left-hand notes (C4, D4, E4, F4, F♯4, G4). The first uses F4, the second F♯4: their fingerings differ, and your ear should hear the difference too. The hardest move is E4 → F4: keep the left-hand fingers down while you press the side key." },
    EZGI_TEXT.slow
  ],
  tips:[{ tr:"Do4'te ses kırılıyorsa üç parmağın da deliği tam kapattığına bak; en sık kaçak yüzük parmağındadır.", en:"If C4 cracks, check all three fingers seal fully; the ring finger leaks most often." }],
  steps: ezgiSteps([60, 62, 64, 60, 62, 64, 65, 64], [60, 62, 64, 65, 67, 65, 64, 66, 67, 66, 64, 62, 60], ["e-t1", "e-t2"], [60, 62, 64, 65, 66, 67]) });

insertLessonAfter("sag-el", { id:"ezgi-iki-el", unit:"temel", since:2, notes:[],
  title:{ tr:"İki elle üç ezgi", en:"Three tunes with both hands" },
  text:[
    { tr:"Sol3'ten Sol4'e kadar iki elle üç ezgi; üçüncüsü 3/4 ölçüde, her ölçüde üç vuruş. En zor yer Do4 ↔ Si3: sol el tam kapalı kalırken sağ işaret parmağı iner ve kalkar. Sol el bu geçişte hiç kıpırdamamalı.",
      en:"Three tunes from G3 to G4 with both hands; the third is in 3/4, three beats to the bar. The hardest spot is C4 ↔ B3: the left hand stays fully closed while the right index finger goes down and up. The left hand must not move at all here." },
    EZGI_TEXT.slow
  ],
  tips:[{ tr:"Pes notalarda ağız boşluğunu açık tut; Sol3'e inerken dudağı sıkma, havayı yavaşlat.", en:"Keep the mouth open on low notes; going down to G3, don't pinch, slow the air down." }],
  steps: ezgiSteps([60, 59, 57, 59, 60, 62, 64, 62], [60, 59, 57, 59, 60, 62, 60, 59, 57, 55, 57, 59, 60], ["e-t3", "e-t4", "e-t5"], [55, 57, 59, 60, 62, 64, 65, 66, 67], { free:1, n:10, min:7 }) });

// Pes bölge ezgileri pes dersinden (ve varsa arızalı nota derslerinden, S1.2) sonra gelir
insertLessonAfter(["ariza-2", "ariza-1", "pes"].find(id => LESSONS.some(l => l.id === id)), { id:"ezgi-pes", unit:"temel", since:2, notes:[],
  title:{ tr:"Pes bölge ezgileri", en:"Low-register tunes" },
  text:[
    { tr:"Mi3'e kadar inen iki ezgi. Birincisi doğal notalarla, ikincisi Fa♯3, Sol♯3 ve Do♯4 ile. İlk ezgide ilk kez sekizlik var: bir vuruşa iki nota, “el-ma” der gibi. Mi3 ve Fa3'te serçe parmaklar mandala tam basmalı, yoksa ses gelmez.",
      en:"Two tunes reaching down to E3. The first uses natural notes, the second F♯3, G♯3 and C♯4. The first has eighth notes for the first time: two notes to a beat, like saying “cof-fee”. On E3 and F3 the little fingers must press their keys fully or the note won't speak." },
    EZGI_TEXT.slow
  ],
  tips:[{ tr:"Pes notalar geç konuşur: notayı biraz erken düşün, havayı önce ver.", en:"Low notes speak late: think the note a little early and get the air there first." }],
  steps: ezgiSteps([55, 53, 52, 53, 55, 57, 59, 57], [55, 53, 52, 53, 55, 57, 56, 57, 59, 61, 62, 61, 59, 57, 56, 54, 56, 57], ["e-t6", "e-t7"],
    [52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 64, 65, 67], { n:10, min:7 }) });

insertLessonAfter("bogaz", { id:"ezgi-bogaz", unit:"temel", since:2, notes:[],
  title:{ tr:"Boğaz notalarıyla ezgi", en:"Tunes with the throat tones" },
  text:[
    { tr:"La4, Si♭4 ve Sol♯4 ile iki ezgi; ikincisi 2/4 ölçüde, her ölçüde iki vuruş. Bu ezgilerde ilk kez bir dörtlü atlama var (Mi4 → La4). Boğaz notalarında çok az parmak kapalıdır, ses kolayca incelir ve tizleşir: havayı aynı tut, dudağı gevşet.",
      en:"Two tunes with A4, B♭4 and G♯4; the second is in 2/4, two beats to the bar. For the first time there is a leap of a fourth (E4 → A4). Few fingers are down on the throat tones, so the sound thins and goes sharp easily: keep the air the same and relax the lips." },
    EZGI_TEXT.slow
  ],
  tips:[{ tr:"Si♭4 ile La4 arasında yalnız bir mandal değişir; parmakları yükseğe kaldırma.", en:"Only one key changes between B♭4 and A4; don't lift the fingers high." }],
  steps: ezgiSteps([65, 67, 69, 67, 70, 69, 67, 69], [65, 67, 69, 70, 69, 67, 68, 69, 64, 69, 67, 65, 62], ["e-t8", "e-t9"], [52, 55, 57, 59, 62, 65, 67, 68, 69, 70], { n:10, min:7 }) });

// Ünitenin sonu: Temeller'in son dersinden sonra
insertLessonAfter(LESSONS.filter(l => l.unit === "temel").pop().id, { id:"temel-tekrar", unit:"temel", since:2, notes:[],
  title:{ tr:"Pes bölge: toparlama", en:"Low register: review" },
  text:[
    { tr:"Temeller'in bütün notaları bir arada: Mi3'ten La4'e 16 ölçülük bir ezgi. İkinci yarı tiz Sol4 ve La4'e çıkar, sonra Mi3'e bir dörtlüyle iner. Önce aralıksız Sol3'ten La4'e çıkıp inen geçişi çal.",
      en:"All the Basics notes together: a 16-bar tune from E3 to A4. The second half climbs to G4 and A4, then drops a fourth to E3. First play the run from G3 up to A4 and back without stopping." },
    { tr:"Bu dersi bitirince register ve klarino bölgesine geçmeye hazırsın. Ünite sınavı geçmediysen önce onu çöz.",
      en:"Once this lesson is done you're ready for the register and the clarion. If you haven't passed the unit test yet, do that first." }
  ],
  tips:[{ tr:"Uzun ezgide nefesi ölçü sonlarında al; 4. ve 8. ölçünün uzun notası en rahat yer.", en:"In a long tune, breathe at the ends of bars; the long notes in bars 4 and 8 are the easiest places." }],
  steps: ezgiSteps([55, 57, 59, 60, 62, 64, 62, 60], [55, 57, 59, 60, 62, 64, 66, 67, 69, 67, 66, 64, 62, 60, 59, 57, 55, 52, 55], ["e-t10"],
    [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70], { maxMiss:4, freeMin:6, n:10, min:8 }) });

// ---- S1.2 Arızalı notalar ----
// pes dersindeki beş arızalı nota iki derse yayılır: önce okuma (parmak kartları describeFingering'den), parmak kartından
// nota bulma, her yeni notayı tutma, komşularla geçiş ve çalma testi. pes dersi olduğu gibi kalır.
{
  const nm = LCORE.noteName;
  // Parmak kartından nota bulma sorusu: doğru cevap 0. seçenek (seçenekler adımda karıştırılır)
  const fingQ = (w, wrong) => ({
    q:{ tr:"Bu parmak hangi notayı verir?", en:"Which note does this fingering give?" }, fing:w,
    opts:[nm(w), ...wrong.map(nm)], ok:0,
    why:{ tr:"Bu " + nm(w).tr + " parmağı. Okuma adımındaki kartlarla karşılaştır: hangi mandal basılı?",
          en:"This is the " + nm(w).en + " fingering. Compare with the cards in the reading step: which key is pressed?" } });
  const ariza1 = { id:"ariza-1", unit:"temel", since:2, notes:[54, 56, 58],
    title:{ tr:"Fa♯3, Sol♯3, Si♭3", en:"F♯3, G♯3, B♭3" },
    text:[
      { tr:"Diyez (♯) notayı yarım ses tizleştirir, bemol (♭) yarım ses pesleştirir. Fa♯3 Fa3 ile Sol3'ün, Sol♯3 Sol3 ile La3'ün, Si♭3 La3 ile Si3'ün arasındadır.",
        en:"A sharp (♯) raises a note by a semitone, a flat (♭) lowers it by a semitone. F♯3 lies between F3 and G3, G♯3 between G3 and A3, B♭3 between A3 and B3." },
      { tr:"Üçü de pes bölgenin parmağına bir mandal eklenerek çalınır. Önce kartlarda hangi mandal olduğunu gör, sonra her notayı ayrı ayrı tut; en son komşu notalarla birlikte çal.",
        en:"All three are played by adding one key to a low-register fingering. First see which key it is on the cards, then hold each note on its own; finally play it together with its neighbours." }
    ],
    tips:[
      { tr:"Serçe parmakları gergin değil, mandalların üstünde gevşek dursun.", en:"Keep the pinkies relaxed just above the keys, not tense." },
      { tr:"Mandala basarken öteki parmaklar deliklerden kalkmasın; hava kaçarsa nota cızırdar.", en:"Keep the other fingers on their holes while you press the key; a leak makes the note squeak." }
    ],
    steps:[
      { type:"read", title:{ tr:"Hangi mandal?", en:"Which key?" }, fing:[54, 56, 58], body:[
        { tr:"Aşağıdaki kartlar üç notanın parmağını gösterir: basılı delik ve mandallar şemada koyu, tarifi yanında. Klarnetini eline al ve her birini kurup bak.",
          en:"The cards below show the fingering of the three notes: pressed holes and keys are dark on the chart, the description is beside it. Take your clarinet and set up each one." } ] },
      { type:"soru", items:[ fingQ(54, [53, 55, 56]), fingQ(56, [55, 57, 54]), fingQ(58, [57, 59, 56]), fingQ(53, [54, 52, 55]) ], min:3 },
      { type:"hold", note:54, sec:4, min:45 },
      { type:"hold", note:56, sec:4, min:45 },
      { type:"hold", note:58, sec:4, min:45 },
      { type:"notes", notes:[53, 54, 55, 56, 57, 58, 59, 58, 57, 56, 55, 54, 53], maxMiss:3 },
      { type:"quiz", notes:[52, 53, 54, 55, 56, 57, 58, 59, 60], mode:"play", n:10, min:7 }
    ] };
  const ariza2 = { id:"ariza-2", unit:"temel", since:2, notes:[61, 63],
    title:{ tr:"Do♯4, Mi♭4 ve kromatik dizi", en:"C♯4, E♭4 and the chromatic scale" },
    text:[
      { tr:"Do♯4 Do4 ile Re4'ün, Mi♭4 Re4 ile Mi4'ün arasındadır. Bu iki notayla Mi3'ten Sol4'e bütün yarım sesleri çalabilirsin: her notadan bir yarım ses yukarı çıkan diziye kromatik dizi denir.",
        en:"C♯4 lies between C4 and D4, E♭4 between D4 and E4. With these two you can play every semitone from E3 to G4: a scale that climbs one semitone at a time is called the chromatic scale." },
      { tr:"Pes bölgede Mi3, Fa3, Fa♯3 ve Sol♯3 serçe mandallarıyla çalınır; aralarında geçerken serçe parmak bir mandaldan ötekine kayar. Bunun için dersin sonunda ayrı bir alıştırma var: yavaş başla, iki notayı ayırıp tekrar et.",
        en:"In the low register E3, F3, F♯3 and G♯3 use the pinky keys; moving between them, a pinky slides from one key to another. There is a separate drill for this at the end of the lesson: start slowly and repeat the two notes on their own." }
    ],
    tips:[
      { tr:"Kromatik dizide acele etme; her notanın parmağı oturmadan sonrakine geçme.", en:"Don't rush the chromatic scale; don't move on until each fingering is settled." },
      { tr:"Serçe parmak mandaldan kalkmadan kaysın; kaldırırsan arada başka nota duyulur.", en:"Let the pinky slide without lifting off; if you lift it, another note sneaks in." }
    ],
    steps:[
      { type:"read", title:{ tr:"Hangi mandal?", en:"Which key?" }, fing:[61, 63], body:[
        { tr:"Aşağıdaki kartlar iki notanın parmağını gösterir: basılı delik ve mandallar şemada koyu, tarifi yanında. Klarnetini eline al ve her birini kurup bak.",
          en:"The cards below show the fingering of the two notes: pressed holes and keys are dark on the chart, the description is beside it. Take your clarinet and set up each one." } ] },
      { type:"soru", items:[ fingQ(61, [60, 62, 63]), fingQ(63, [62, 64, 61]), fingQ(54, [53, 55, 56]), fingQ(58, [57, 59, 56]) ], min:3 },
      { type:"hold", note:61, sec:4, min:45 },
      { type:"hold", note:63, sec:4, min:45 },
      { type:"notes", notes:[60, 61, 62, 63, 64, 63, 62, 61, 60], maxMiss:3 },
      { type:"notes", notes:[52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], maxMiss:4 },
      { type:"notes", notes:[52, 53, 54, 56, 54, 53, 52, 53, 54, 56, 54, 53, 52], maxMiss:3 },
      { type:"quiz", notes:[57, 58, 59, 60, 61, 62, 63, 64, 65], mode:"play", n:10, min:7 }
    ] };
  insertLessonAfter("pes", ariza1, ariza2);
}

// ---- S2.1 Klarino ----
// Klarino ünitesi 2 dersten 8 derse (docs/BACKLOG.md S2.1). On ikili çiftleri core.js parmak verisinden doğrulandı:
// fingeringIds(n) ile fingeringIds(n + 19) register mandalı dışında aynı (52–64 → 71–83); Fa4 → Do6 aynı değil, derse
// on ikili diye konmadı. onikili register'dan hemen önce girer (Temeller'in sonuna eklenen derslerden bağımsız).
LESSONS.splice(LESSONS.findIndex(l => l.id === "register"), 0,
  { id:"onikili", unit:"klarino", since:2, notes:[71, 72, 74],
    title:{ tr:"On ikili: aynı parmak, iki ses", en:"The twelfth: one fingering, two notes" },
    text:[
      { tr:"Register mandalı klarnette sesi bir oktav değil, bir on ikili (oktav + beşli, 19 yarım ses) yükseltir. Bu yüzden pes bölgede öğrendiğin parmaklar, register basılınca başka adlı notalar verir.",
        en:"On the clarinet the register key raises the note not by an octave but by a twelfth (octave + fifth, 19 semitones). So the fingerings you learned in the low register give differently named notes with the register pressed." },
      { tr:"Bu derste üç çifti tanıyacaksın: Mi3 → Si4, Fa3 → Do5, Sol3 → Re5. Parmaklar aynı kalır; yalnız başparmak deliği kapatmaya devam ederken register mandalına da basar.",
        en:"In this lesson you meet three pairs: E3 → B4, F3 → C5, G3 → D5. The fingers stay the same; the thumb keeps covering its hole and also presses the register key." }
    ],
    tips:[
      { tr:"Tiz nota çıkmıyorsa dudağı sıkma; havayı hızlandır ve pes notayı önce temiz çal.", en:"If the high note won't speak, don't bite; speed up the air and get the low note clean first." }
    ],
    steps:[
      { type:"read", title:{ tr:"Neden on ikili?", en:"Why a twelfth?" }, body:[
        { tr:"Flüt ve saksafonda üfleme tizleşince ses bir oktav çıkar; klarnette on ikili çıkar. Mi3 ile Si4 arası 19 yarım sestir: bir oktav (12) ve bir beşli (7).",
          en:"On the flute and the saxophone overblowing goes up an octave; on the clarinet it goes up a twelfth. E3 to B4 is 19 semitones: an octave (12) plus a fifth (7)." },
        { tr:"Bunu bilmek klarino bölgesini ezberlemeyi kolaylaştırır: tiz notanın parmağını bulmak için 19 yarım ses aşağıdaki pes notayı düşün ve register'ı ekle.",
          en:"Knowing this makes the clarion register easy to learn: to find a high note's fingering, think of the low note 19 semitones below and add the register." }
      ] },
      { type:"soru", items:[
        { q:{ tr:"Register mandalına basınca ses ne kadar yükselir?", en:"How far does the register key raise the note?" },
          opts:[{ tr:"On ikili (oktav + beşli)", en:"A twelfth (octave + fifth)" }, { tr:"Bir oktav", en:"An octave" }, { tr:"Bir beşli", en:"A fifth" }], ok:0,
          why:{ tr:"Klarnette register sesi oktav değil on ikili (19 yarım ses) yükseltir.", en:"On the clarinet the register raises the note by a twelfth (19 semitones), not an octave." } },
        { q:{ tr:"Mi3 parmağına register eklersen hangi nota çıkar?", en:"Which note do you get by adding the register to the E3 fingering?" }, fing:71,
          opts:[{ tr:"Si4", en:"B4" }, { tr:"Mi4", en:"E4" }, { tr:"La4", en:"A4" }], ok:0,
          why:{ tr:"Mi3'ün on ikili üstü Si4'tür.", en:"A twelfth above E3 is B4." } },
        { q:{ tr:"Re5'i hangi pes notanın parmağıyla çalarsın?", en:"Which low fingering do you use for D5?" },
          opts:[{ tr:"Sol3", en:"G3" }, { tr:"Re4", en:"D4" }, { tr:"Fa3", en:"F3" }], ok:0,
          why:{ tr:"Re5 Sol3'ün on ikili üstüdür; Fa3 parmağı Do5 verir.", en:"D5 is a twelfth above G3; the F3 fingering gives C5." } }
      ] },
      { type:"listen", notes:[52, 71, 53, 72, 55, 74] },
      { type:"notes", notes:[52, 71, 52], maxMiss:1 },
      { type:"notes", notes:[53, 72, 53], maxMiss:1 },
      { type:"notes", notes:[55, 74, 55], maxMiss:1 },
      { type:"hold", note:71, sec:4, min:45 }
    ] });

insertLessonAfter("register",
  { id:"kirilma-1", unit:"klarino", since:2, notes:[69, 70, 71, 72],
    title:{ tr:"La4–Si4: kırılmayı geçmek", en:"A4–B4: crossing the break" },
    text:[
      { tr:"La4 ve Si♭4'te deliklerin neredeyse hepsi açıktır; Si4 ve Do5'te hepsi kapalıdır ve register basılıdır. Bu geçişe kırılma denir: bütün parmaklar aynı anda inmeli, yoksa arada istenmeyen sesler duyulur.",
        en:"On A4 and B♭4 almost every hole is open; on B4 and C5 they are all closed and the register is pressed. This move is called the break: all fingers must land together, or stray notes sneak in between." },
      { tr:"Yavaş başla. Önce parmakları birlikte indirip kaldırmaya odaklan, sonra hızı artır.",
        en:"Start slowly. Focus first on putting the fingers down and lifting them together, then build speed." }
    ],
    tips:[
      { tr:"Geçişte havayı kesme; parmaklar değişirken hava aynı hızla aksın.", en:"Don't stop the air at the break; keep it flowing at the same speed while the fingers change." }
    ],
    steps:[
      { type:"notes", notes:[69, 71, 69, 71, 69, 71, 69, 71, 69, 71, 69, 71, 69, 71, 69, 71], maxMiss:3 },
      { type:"notes", notes:[70, 72, 70, 72, 70, 72, 70, 72, 70, 72, 70, 72, 70, 72, 70, 72], maxMiss:3 },
      ...techSteps({ type:"break", pair:[69, 71], sub:2 }, 50, 66)
    ] },

  { id:"klarino-1", unit:"klarino", since:2, notes:[76, 77, 79],
    title:{ tr:"Mi5, Fa5, Sol5", en:"E5, F5, G5" },
    text:[
      { tr:"Üç yeni nota da pes bölgedeki bir parmağın on ikili üstüdür: La3 → Mi5, Si♭3 → Fa5, Do4 → Sol5. Parmağı parmak kartında karşılaştır; tek fark register mandalıdır.",
        en:"All three new notes are a twelfth above a low fingering: A3 → E5, B♭3 → F5, C4 → G5. Compare them on the fingering card; the only difference is the register key." },
      { tr:"Sol5 Gerdâniye perdesidir; makamların tiz bölgesinde sık kullanılır.",
        en:"G5 is the Gerdâniye perde; makams use it often in the upper range." }
    ],
    tips:[
      { tr:"Tiz notalar tizleşmeye eğilimlidir; entonasyon izini izle, gerekirse çeneyi gevşet.", en:"High notes tend to go sharp; watch the intonation trace and loosen the jaw if needed." }
    ],
    steps:[
      { type:"listen", notes:[74, 76, 77, 79] },
      { type:"hold", note:76, sec:4, min:45 },
      { type:"hold", note:77, sec:4, min:45 },
      { type:"hold", note:79, sec:4, min:45 },
      { type:"notes", notes:[72, 74, 76, 77, 79, 77, 76, 74, 72], maxMiss:3 },
      { type:"quiz", notes:[71, 72, 74, 76, 77, 79], mode:"play", n:8, min:6 }
    ] },

  { id:"klarino-2", unit:"klarino", since:2, notes:[81, 83, 84],
    title:{ tr:"La5, Si5, Do6", en:"A5, B5, C6" },
    text:[
      { tr:"La5 Re4'ün, Si5 Mi4'ün on ikili üstüdür; ikisi de register eklenmiş pes parmaklardır. Do6 farklıdır: Fa4'ün parmağına register eklemek Do6 vermez, parmağını kartta ayrıca incele.",
        en:"A5 is a twelfth above D4 and B5 a twelfth above E4; both are low fingerings with the register added. C6 is different: adding the register to the F4 fingering does not give C6, so study its fingering on the card on its own." },
      { tr:"La5 Muhayyer perdesidir. Bu üç nota klarino bölgesinin tepesidir; ses incelmesin diye ağız boşluğunu açık tut.",
        en:"A5 is the Muhayyer perde. These three notes are the top of the clarion register; keep the mouth cavity open so the tone doesn't thin out." }
    ],
    tips:[
      { tr:"Tepeye çıkarken dudakla sıkma, havayı hızlandır.", en:"Going up to the top, don't bite; speed up the air." }
    ],
    steps:[
      { type:"listen", notes:[79, 81, 83, 84] },
      { type:"hold", note:81, sec:4, min:40 },
      { type:"hold", note:83, sec:4, min:40 },
      { type:"hold", note:84, sec:4, min:40 },
      { type:"notes", notes:[76, 77, 79, 81, 83, 84, 83, 81, 79, 77, 76], maxMiss:3 },
      { type:"quiz", notes:[76, 77, 79, 81, 83, 84], mode:"play", n:8, min:6 }
    ] },

  { id:"klarino-ariza", unit:"klarino", since:2, notes:[73, 75, 78, 80, 82],
    title:{ tr:"Klarino'da diyez ve bemoller", en:"Sharps and flats in the clarion register" },
    text:[
      { tr:"Klarino bölgesinin beş arızalı notası da pes bölgede öğrendiğin arızalı parmakların on ikili üstüdür: Fa♯3 → Do♯5, Sol♯3 → Mi♭5, Si3 → Fa♯5, Do♯4 → Sol♯5, Mi♭4 → Si♭5.",
        en:"All five altered notes of the clarion register are a twelfth above low fingerings you already know: F♯3 → C♯5, G♯3 → E♭5, B3 → F♯5, C♯4 → G♯5, E♭4 → B♭5." },
      { tr:"Hangi mandalın basıldığını her notanın parmak kartında gör; mandal pes notadakiyle aynıdır, üstüne register eklenir.",
        en:"See which key is pressed on each note's fingering card; it is the same key as on the low note, with the register added." }
    ],
    tips:[
      { tr:"Serçe mandalından mandala geçerken parmağı kaldırmadan kaydır.", en:"Moving from one pinky key to another, slide the finger instead of lifting it." }
    ],
    steps:[
      { type:"read", title:{ tr:"Pes parmak + register", en:"Low fingering + register" }, body:[
        { tr:"Do♯5 Fa♯3'ün, Mi♭5 Sol♯3'ün, Fa♯5 Si3'ün, Sol♯5 Do♯4'ün, Si♭5 Mi♭4'ün parmağıdır; hepsine register eklenir. Ders sayfasındaki nota kartlarına dokunup parmakları karşılaştır.",
          en:"C♯5 uses the F♯3 fingering, E♭5 the G♯3, F♯5 the B3, G♯5 the C♯4 and B♭5 the E♭4; the register is added to each. Tap the note cards on the lesson page to compare the fingerings." }
      ] },
      { type:"soru", min:4, items:[
        { q:{ tr:"Parmak kartındaki nota hangisi?", en:"Which note is on the fingering card?" }, fing:73,
          opts:[{ tr:"Do♯5", en:"C♯5" }, { tr:"Fa♯3", en:"F♯3" }, { tr:"Re5", en:"D5" }], ok:0,
          why:{ tr:"Fa♯3 parmağına register eklenmiş: Do♯5.", en:"The F♯3 fingering with the register added: C♯5." } },
        { q:{ tr:"Parmak kartındaki nota hangisi?", en:"Which note is on the fingering card?" }, fing:75,
          opts:[{ tr:"Mi♭5", en:"E♭5" }, { tr:"Sol♯3", en:"G♯3" }, { tr:"Mi5", en:"E5" }], ok:0,
          why:{ tr:"Sol♯3 parmağına register eklenmiş: Mi♭5.", en:"The G♯3 fingering with the register added: E♭5." } },
        { q:{ tr:"Parmak kartındaki nota hangisi?", en:"Which note is on the fingering card?" }, fing:78,
          opts:[{ tr:"Fa♯5", en:"F♯5" }, { tr:"Si3", en:"B3" }, { tr:"Sol5", en:"G5" }], ok:0,
          why:{ tr:"Si3 parmağına register eklenmiş: Fa♯5.", en:"The B3 fingering with the register added: F♯5." } },
        { q:{ tr:"Parmak kartındaki nota hangisi?", en:"Which note is on the fingering card?" }, fing:80,
          opts:[{ tr:"Sol♯5", en:"G♯5" }, { tr:"Do♯4", en:"C♯4" }, { tr:"La5", en:"A5" }], ok:0,
          why:{ tr:"Do♯4 parmağına register eklenmiş: Sol♯5.", en:"The C♯4 fingering with the register added: G♯5." } },
        { q:{ tr:"Parmak kartındaki nota hangisi?", en:"Which note is on the fingering card?" }, fing:82,
          opts:[{ tr:"Si♭5", en:"B♭5" }, { tr:"Mi♭4", en:"E♭4" }, { tr:"Si5", en:"B5" }], ok:0,
          why:{ tr:"Mi♭4 parmağına register eklenmiş: Si♭5.", en:"The E♭4 fingering with the register added: B♭5." } }
      ] },
      { type:"hold", note:73, sec:4, min:45 },
      { type:"hold", note:75, sec:4, min:45 },
      { type:"hold", note:78, sec:4, min:45 },
      { type:"hold", note:80, sec:4, min:40 },
      { type:"hold", note:82, sec:4, min:40 },
      { type:"notes", notes:[72, 73, 74, 75, 76, 75, 74, 73, 72], maxMiss:3 },
      { type:"notes", notes:[77, 78, 79, 80, 81, 82, 83, 82, 81, 80, 79, 78, 77], maxMiss:4 },
      { type:"quiz", notes:[71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84], mode:"play", n:10, min:7 }
    ] },

  { id:"ezgi-klarino", unit:"klarino", since:2, notes:[],
    title:{ tr:"İki bölgede ezgiler", en:"Tunes across both registers" },
    text:[
      { tr:"Üç kısa ezgi: ilki yalnız klarino bölgesinde, ikincisi her ölçüde kırılmayı geçer, üçüncüsü Sol3'ten Do6'ya çıkıp geri iner.",
        en:"Three short tunes: the first stays in the clarion register, the second crosses the break in every bar, and the third climbs from G3 to C6 and back down." },
      { tr:"Önce yavaş tempoda dinle, sonra çal. Kırılmada takılırsan o ölçüyü ayrıca tekrar et.",
        en:"Listen at a slow tempo first, then play. If you stumble at the break, repeat that bar on its own." }
    ],
    tips:[
      { tr:"Bölge değişirken havayı kesme.", en:"Keep the air going when you change registers." }
    ],
    steps:[
      { type:"piece", id:"e-k1", mode:"tempo", min:60 },
      { type:"piece", id:"e-k2", mode:"tempo", min:60 },
      { type:"piece", id:"e-k3", mode:"tempo", min:60 }
    ] });

// ---- S1.5 Hocasız öğrenci ----
// Hocası olmayan öğrencinin kendi kendine yapacağı işler: nasıl çalışılır, ısınma, akortlama, bakım. Bilgiler var olan
// derslerden ve Sorunlar sayfasından (sorunlar.js "akort", "kamis", "su") alınır; yeni müzikal ya da bakım iddiası yok.
insertLessonAfter("ilk-gecis", { id:"nasil-calisilir", unit:"baslangic", since:2, notes:[],
  title:{ tr:"Nasıl çalışılır", en:"How to practise" },
  text:[
    { tr:"Hocan yokken çalışmanın nasıl geçeceğine sen karar verirsin. Bu derste beş kural var: yavaş çal, zor yeri küçült, beş temiz tekrar, her gün kısa çalış, kendini dinle.",
      en:"Without a teacher, you decide how each practice session goes. This lesson has five rules: play slowly, shrink the hard spot, five clean repeats, practise a little every day, listen to yourself." }
  ],
  tips:[
    { tr:"Bir şey olmuyorsa daha çok zorlamak yerine yavaşla ve parçayı küçült.", en:"If something won't come, don't push harder: slow down and make the piece smaller." }
  ],
  steps:[
    { type:"read", title:{ tr:"Beş kural", en:"Five rules" }, body:[
      { tr:"<b>Yavaş çal.</b> Hatasız çalabildiğin hız senin bugünkü hızındır. Hızlı ve hatalı tekrar, hatayı da alışkanlık yapar; hız temiz tekrarlarla kendiliğinden gelir.",
        en:"<b>Play slowly.</b> The speed at which you play without mistakes is your speed today. Fast, sloppy repeats turn the mistake into a habit too; speed comes by itself from clean repeats." },
      { tr:"<b>Zor yeri küçült.</b> Takıldığın yeri bul ve iki notaya indir; yalnız o iki nota arasında geç. Temiz geçince bir nota ekle, sonra yerine koyup bütün cümleyi çal.",
        en:"<b>Shrink the hard spot.</b> Find where you stumble and cut it down to two notes; move only between those two. When that is clean, add a note, then put it back and play the whole phrase." },
      { tr:"<b>Beş temiz tekrar.</b> Bir geçişi arka arkaya beş kez hatasız çalınca öğrenmiş say. Arada hata olursa sayı baştan başlar.",
        en:"<b>Five clean repeats.</b> Count a passage as learned when you play it five times in a row without a mistake. If you slip, the count starts again." },
      { tr:"<b>Her gün kısa çalış.</b> Her gün 20–30 dakika, haftada bir uzun oturumdan iyidir. Dudak yorulunca (ses incelir, ağız köşelerinden hava kaçar) bırak: yorgun dudakla çalmak yanlış ağız alışkanlığı kurar. Dersler'deki “Bugünün çalışması” her gün kısa bir plan kurar.",
        en:"<b>Practise a little every day.</b> 20–30 minutes a day beats one long session a week. Stop when the lips tire (the tone thins, air leaks from the corners): playing on tired lips builds a wrong embouchure. “Today's practice” in Lessons builds a short plan every day." },
      { tr:"<b>Kendini dinle.</b> Çalarken duyduğun ses dışarıdan duyulanla aynı değildir. Telefonla kısa bir kayıt al ve dinle: ses nerede titriyor, nefesi nerede alıyorsun?",
        en:"<b>Listen to yourself.</b> What you hear while playing isn't what others hear. Make a short phone recording and listen: where does the tone wobble, where do you breathe?" } ] },
    { type:"soru", min:3, items:[
      { q:{ tr:"Bir geçişte hep hata yapıyorsun. İlk ne yaparsın?", en:"You keep making a mistake in one passage. What do you do first?" },
        opts:[{ tr:"Yavaşlarım ve zor yeri iki notaya indiririm", en:"Slow down and cut the hard spot to two notes" },
              { tr:"Daha hızlı çalıp geçmeye çalışırım", en:"Play it faster to get through" },
              { tr:"O yeri atlayıp devam ederim", en:"Skip it and carry on" }], ok:0,
        why:{ tr:"Zor yeri küçült ve yavaş çal: iki nota temiz olunca bir nota ekle.", en:"Shrink the hard spot and slow down: when two notes are clean, add one more." } },
      { q:{ tr:"Beş temiz tekrar kuralında 4. tekrarda hata yaptın. Ne olur?", en:"Using the five-clean-repeats rule, you slip on the 4th repeat. What happens?" },
        opts:[{ tr:"Sayı baştan başlar", en:"The count starts again" },
              { tr:"5. tekrarı yapıp bitiririm", en:"I do the 5th and I'm done" },
              { tr:"Hata sayılmaz", en:"It doesn't count" }], ok:0,
        why:{ tr:"Arka arkaya beş hatasız tekrar gerekir; arada hata olursa sayı sıfırlanır.", en:"You need five in a row without a mistake; a slip resets the count." } },
      { q:{ tr:"Hangisi daha iyi bir çalışma düzeni?", en:"Which is the better practice routine?" },
        opts:[{ tr:"Her gün 20–30 dakika", en:"20–30 minutes every day" },
              { tr:"Haftada bir gün üç saat", en:"Three hours one day a week" },
              { tr:"Canım istediğinde, ara sıra", en:"Now and then, when I feel like it" }], ok:0,
        why:{ tr:"Kısa ve her gün: dudak ve parmaklar her gün biraz çalışınca gelişir.", en:"Short and daily: lips and fingers improve with a little work every day." } },
      { q:{ tr:"Çalarken ses inceliyor, ağız köşelerinden hava kaçıyor. Ne yaparsın?", en:"While playing, the tone thins and air leaks from the corners of your mouth. What do you do?" },
        opts:[{ tr:"Dudağım yorulmuştur; ara veririm ya da o gün bırakırım", en:"My lips are tired; I take a break or stop for the day" },
              { tr:"Dudaklarımı daha çok sıkarım", en:"Squeeze my lips harder" },
              { tr:"Daha yüksek sesle çalarım", en:"Play louder" }], ok:0,
        why:{ tr:"Bunlar yorgun dudağın işaretleri. Yorgun dudakla devam etmek yanlış ağız alışkanlığı kurar.", en:"Those are signs of tired lips. Carrying on with tired lips builds a wrong embouchure." } }
    ] },
    { type:"notes", notes:[67, 64, 67, 66, 64, 66, 67], maxMiss:3 },
    { type:"notes", notes:[67, 64, 67, 66, 64, 66, 67], maxMiss:1,
      hint:{ tr:"yarı hızda", en:"at half speed" } }
  ] });

// Isınma, iki elin notaları öğrenildikten sonra (S1.1'in ezgi dersi varsa onun arkasında). Bu dersi bitirenin günlük
// çalışması ısınmayı bu sırayla kurar (dailyPlan)
insertLessonAfter(LESSONS.some(l => l.id === "ezgi-iki-el") ? "ezgi-iki-el" : "sag-el", { id:"isinma", unit:"temel", since:2, notes:[],
  title:{ tr:"Beş dakikalık ısınma", en:"A five-minute warm-up" },
  text:[
    { tr:"Her çalışmaya aynı kısa ısınmayla başla: önce klarnetsiz birkaç rahat nefes (omuzlar kalkmadan, alt kaburgalar genişler), sonra açık Sol'de uzun ton, sonra pes Sol3'te uzun ton, en son Sol3'ten Sol4'e yavaş bir dizi.",
      en:"Start every session with the same short warm-up: first a few relaxed breaths without the clarinet (shoulders down, lower ribs widening), then a long tone on open G, then a long tone on low G3, and last a slow scale from G3 to G4." },
    { tr:"Isınma hem dudağı hem çalgıyı hazırlar: soğuk klarnet pes çalar, ısındıkça tizleşir. Bu dersi bitirince “Bugünün çalışması” ısınmayı bu sırayla kurar.",
      en:"The warm-up gets both your lips and the instrument ready: a cold clarinet plays flat and rises as it warms. Once you finish this lesson, “Today's practice” builds its warm-up in this order." }
  ],
  tips:[
    { tr:"Uzun tonda göstergedeki çizgi düz kalsın; sesin sonunda perdeyi düşürme.", en:"On long tones keep the line on the tuner flat; don't let the pitch sag at the end." },
    { tr:"Dizide acele etme: her nota temiz başlasın, parmaklar birlikte insin.", en:"Don't rush the scale: let every note start cleanly and the fingers move together." }
  ],
  steps:[
    { type:"hold", note:67, sec:8, min:55 },
    { type:"hold", note:55, sec:8, min:50 },
    { type:"notes", notes:[55, 57, 59, 60, 62, 64, 66, 67, 66, 64, 62, 60, 59, 57, 55], maxMiss:3 }
  ] });

// Akortlama Temeller'in sonunda, toparlama dersinden (temel-tekrar) önce. Bilgi sorunlar.js "akort" maddesiyle aynı
insertLessonAfter((() => { const t = LESSONS.filter(l => l.unit === "temel"), k = t.findIndex(l => l.id === "temel-tekrar");
  return (k > 0 ? t[k - 1] : t[t.length - 1]).id; })(), { id:"akortlama", unit:"temel", since:2, notes:[],
  title:{ tr:"Klarneti akortlamak", en:"Tuning the clarinet" },
  text:[
    { tr:"Akort, bütün notaların birlikte doğru yerde durmasıdır. Tek tek notaları dudakla düzeltmeden önce çalgının kendisini ayarlarsın: ısıtırsın, gerekirse kesiği çeker ya da itersin.",
      en:"Tuning means getting all the notes to sit in the right place together. Before fixing single notes with the lips, you set up the instrument itself: warm it up, then pull or push the barrel if needed." }
  ],
  tips:[
    { tr:"Ağız alışkanlığı da akordu kaydırır: çene sıkmak tizleştirir, gevşek ve desteksiz hava pesleştirir.", en:"Embouchure habits shift the tuning too: biting raises the pitch, slack unsupported air lowers it." }
  ],
  steps:[
    { type:"read", title:{ tr:"Isıt, bak, ayarla", en:"Warm up, check, adjust" }, body:[
      { tr:"<b>Önce ısıt.</b> Soğuk klarnet pes çalar, ısındıkça tizleşir. Akortlamadan önce çalgıyı birkaç dakika ısıt: içine sıcak nefes ver ya da hafif notalar çal.",
        en:"<b>Warm up first.</b> A cold clarinet plays flat and rises as it warms. Warm it for a few minutes before tuning: breathe warm air through it or play softly." },
      { tr:"<b>Birkaç notaya birlikte bak.</b> Akortu tek notaya göre yapma: açık Sol4, Do5 ve Sol5'e birlikte bakılır. Do5 ile Sol5'i Register ve klarino ünitesinde öğreneceksin; o zamana kadar açık Sol4'e ve bildiğin birkaç notaya bak.",
        en:"<b>Check several notes together.</b> Don't tune to a single note: look at open G4, C5 and G5 together. You'll learn C5 and G5 in the Register and clarion unit; until then check open G4 and a few notes you know." },
      { tr:"<b>Kesikle ayarla.</b> Bütün notalar aynı yöne kayıyorsa: hepsi tizse kesiği (baş, barel) biraz dışarı çek, hepsi pesse it. Kesiği çok fazla çekmek boğaz notalarını daha da pesleştirir; çok çekmen gerekiyorsa daha uzun bir kesik ya da başka ağızlık gerekebilir.",
        en:"<b>Adjust with the barrel.</b> If every note leans the same way: when all are sharp pull the barrel out a little, when all are flat push it in. Pulling the barrel a lot lowers the throat notes even more; if you need to pull far, a longer barrel or another mouthpiece may help." },
      { tr:"<b>Akort ekranı ve diyapazon.</b> Akort ekranı çaldığın notanın sapmasını gösterir. Ayarladıktan sonra birkaç notayı tut, ibre ortada dursun; sonra gözünü kapatıp çal, tekrar bak. Ölçünün dayandığı La (diyapazon) Ayarlar'ın Akort bölümündedir, varsayılan 440 Hz. Başka bir sazla ya da grupla çalıyorsan onlardan bir nota çaldırıp “Dinleyerek ayarla”ya bas: diyapazon o sese göre kurulur.",
        en:"<b>The tuner and the reference pitch.</b> The tuner shows how far off the note you play is. After adjusting, hold a few notes until the needle centres; then play with your eyes closed and check again. The A it measures against (the reference pitch) is in Settings under Tuning, 440 Hz by default. If you play with another instrument or a group, have them play a note and press “Tune by listening”: the reference is set to that sound." } ],
      links:[{ go:"tune", label:{ tr:"Akort ekranını aç", en:"Open the tuner" } },
             { go:"settings", el:"a4", label:{ tr:"Diyapazon ayarı", en:"Reference pitch setting" } }] },
    { type:"hold", note:67, sec:6, min:50 },
    { type:"soru", min:2, items:[
      { q:{ tr:"Klarnet ısındıkça perdesi ne olur?", en:"What happens to the pitch as the clarinet warms up?" },
        opts:[{ tr:"Tizleşir", en:"It rises" }, { tr:"Pesleşir", en:"It drops" }, { tr:"Değişmez", en:"It doesn't change" }], ok:0,
        why:{ tr:"Soğuk klarnet pes çalar, ısındıkça tizleşir. Bu yüzden akorttan önce birkaç dakika ısıtılır.", en:"A cold clarinet plays flat and rises as it warms, so you warm it for a few minutes before tuning." } },
      { q:{ tr:"Isınmış klarnette akort ekranında bütün notalar biraz tiz. Ne yaparsın?", en:"With the clarinet warm, every note on the tuner is a bit sharp. What do you do?" },
        opts:[{ tr:"Kesiği biraz dışarı çekerim", en:"Pull the barrel out a little" },
              { tr:"Kesiği iterim", en:"Push the barrel in" },
              { tr:"Çenemi sıkarım", en:"Bite harder" }], ok:0,
        why:{ tr:"Hepsi tizse kesik biraz dışarı çekilir, hepsi pesse itilir. Çene sıkmak sesi daha da tizleştirir.", en:"All sharp: pull the barrel out a little; all flat: push it in. Biting makes it even sharper." } },
      { q:{ tr:"Birlikte çaldığın sazın akordu 440 Hz'e uymuyor. Uygulamada ne yaparsın?", en:"The instrument you play with doesn't match 440 Hz. What do you do in the app?" },
        opts:[{ tr:"Ayarlar'da “Dinleyerek ayarla” ile diyapazonu onun sesine kurarım", en:"Use “Tune by listening” in Settings to set the reference to its sound" },
              { tr:"Kesiği sonuna kadar çekerim", en:"Pull the barrel out as far as it goes" },
              { tr:"Hiçbir şey; uygulama hep 440 Hz ölçer", en:"Nothing; the app always measures at 440 Hz" }], ok:0,
        why:{ tr:"Diyapazon Ayarlar'ın Akort bölümünde değişir; “Dinleyerek ayarla” öteki sazın notasını dinleyip kurar.", en:"The reference pitch is changed in Settings under Tuning; “Tune by listening” sets it from the other instrument's note." } }
    ] }
  ] });

// Bakım Başlarken'in sonunda. Bilgi klarneti-tani, kamis dersleri ve sorunlar.js "kamis", "su" maddelerinden
insertLessonAfter(LESSONS.filter(l => l.unit === "baslangic").pop().id, { id:"bakim", unit:"baslangic", since:2, notes:[],
  title:{ tr:"Klarnetin ve kamışın bakımı", en:"Caring for the clarinet and reeds" },
  text:[
    { tr:"Bakım her çalıştan sonra birkaç dakikadır. Düzenli bakılan klarnet ve kamış daha uzun yaşar, ses de bozulmaz.",
      en:"Care takes a few minutes after every session. A clarinet and reeds that are looked after regularly last longer, and the sound stays good." }
  ],
  tips:[
    { tr:"Sorunlar sayfasının “Kamış ve çalgı” bölümünde fokurdama, kamış ve kaçak sorunlarının çözümleri var.", en:"The “Reed and instrument” section of the Troubleshooting page has fixes for gurgling, reed and leak problems." }
  ],
  steps:[
    { type:"read", title:{ tr:"Çaldıktan sonra", en:"After playing" }, body:[
      { tr:"<b>Kurula.</b> Kamışı çıkar, kurula ve kutusuna koy. Temizlik bezini (swab) gövdelerden geçir: nefesteki nem içeride su olarak toplanır.",
        en:"<b>Dry it.</b> Take the reed off, wipe it and put it in its case. Pull a swab through the joints: moisture from your breath collects inside as water." },
      { tr:"<b>Çalarken su toplanırsa.</b> Bir notada fokurdama ya da cızırtı başlarsa cümle arasında o deliği açıp kısa ve sert üfle, ya da deliğe ince bir kâğıt şerit bastırıp nemi al. Soğuk çalgıda yoğuşma daha fazladır; çalmadan önce ısıt.",
        en:"<b>If water collects while playing.</b> If a note starts gurgling or buzzing, open that hole between phrases and blow a short sharp breath, or press a thin paper strip on it to soak up the moisture. Cold instruments collect more condensation, so warm it before playing." },
      { tr:"<b>Sakla.</b> Klarneti güneşte, kaloriferin yanında ya da soğuk arabada bırakma; soğuk tahtayı birden ısıtma: tahta çatlayabilir.",
        en:"<b>Store it.</b> Never leave the clarinet in the sun, by a radiator or in a cold car, and don't warm cold wood suddenly: it can crack." } ] },
    { type:"read", title:{ tr:"Kamış, mantar, mandallar", en:"Reeds, corks, keys" }, body:[
      { tr:"<b>Kamışlar.</b> Üç dört kamışı sırayla kullan; yeni kamışı ilk günlerde kısa süre çal. Kamış eskir: birkaç haftalık düzenli çalışmada canlılığını yitirir. Ucunu ışığa tut; çatlak ya da dalgalıysa değiştir.",
        en:"<b>Reeds.</b> Rotate three or four reeds; play a new reed only briefly for the first days. Reeds wear out: after a few weeks of steady use they lose life. Hold the tip to the light; if it's chipped or wavy, replace it." },
      { tr:"<b>Kamış ömrü sayacı.</b> Ayarlar'daki Ekipmanım bölümüne kamışlarını ekle: seçili kamışla çaldığın süre sayılır ve belirlediğin ömrü geçince bir kez hatırlatılır. Tını matlaşınca ya da ses zor çıkınca kamışın notuna yaz.",
        en:"<b>Reed-life counter.</b> Add your reeds under My gear in Settings: the time you play on the selected reed is counted, with one reminder when it passes the life you set. When the tone goes dull or notes get hard to start, write it in the reed's note." },
      { tr:"<b>Mantarlar.</b> Gövdeler zor takılıyorsa ya da mantarlar kuruysa biraz mantar yağı sür. Takarken zorlama, döndürerek tak.",
        en:"<b>Corks.</b> If the joints are hard to fit or the corks are dry, add a little cork grease. Don't force them; twist them together." },
      { tr:"<b>Ne zaman tamirciye?</b> Mandallar sertleşirse, parmaklar doğru olduğu hâlde ses bir yerden hava kaçırır gibiyse (özellikle pes notalarda), su hep aynı delikte toplanıyorsa ya da bir mandal veya halka eğildiyse: kaçıran yastık ve eğri mandal ancak onarımla düzelir, bir çalgı tamircisine göster.",
        en:"<b>When to see a repairer?</b> If keys get stiff, if the sound seems to leak somewhere although the fingers are right (especially on low notes), if water always gathers in the same hole, or if a key or ring is bent: leaking pads and bent keys only get better with a repair, so take it to a repairer." } ],
      links:[{ go:"settings", el:"equipgrp", label:{ tr:"Ekipmanım: kamış ömrü", en:"My gear: reed life" } }],
      checkId:"bakim", checkHint:{ tr:"Her çalıştan sonra bu listeye bak; işaretler cihazında kalır, geçmeyi engellemez.", en:"Look at this list after every session; your ticks stay on this device and don't block progress." },
      check:[
        { tr:"Kamışı çıkardım, kuruladım, kutusuna koydum", en:"I took the reed off, wiped it and put it in its case" },
        { tr:"Temizlik bezini gövdelerden geçirdim", en:"I pulled the swab through the joints" },
        { tr:"Klarneti güneşte, kalorifer yanında ya da arabada bırakmadım", en:"I didn't leave the clarinet in the sun, by a radiator or in the car" },
        { tr:"Mantarlar kuru değil; gövdeler zorlamadan takılıyor", en:"The corks aren't dry; the joints fit without forcing" },
        { tr:"Mandallar rahat çalışıyor; bir yerden hava kaçmıyor", en:"The keys move freely; nothing is leaking" }
      ] },
    { type:"soru", min:2, items:[
      { q:{ tr:"Çalışman bitti. İlk ne yaparsın?", en:"Your session is over. What do you do first?" },
        opts:[{ tr:"Kamışı çıkarıp kurularım, gövdelerden temizlik bezini geçiririm", en:"Take the reed off and wipe it, then pull the swab through the joints" },
              { tr:"Kamışı ağızlıkta bırakıp klarneti kutuya koyarım", en:"Leave the reed on and put the clarinet in its case" },
              { tr:"Kurusun diye klarneti güneşe koyarım", en:"Put the clarinet in the sun to dry" }], ok:0,
        why:{ tr:"Kamış çıkarılıp kurulanır, nem temizlik beziyle alınır. Güneş ve sıcak tahtayı çatlatabilir.", en:"The reed comes off and is wiped, the moisture comes out with the swab. Sun and heat can crack the wood." } },
      { q:{ tr:"Hep aynı delikte fokurdama oluyor; üflemek ve kâğıt şerit geçirmiyor. Ne yaparsın?", en:"The same hole always gurgles; blowing and the paper strip don't help. What do you do?" },
        opts:[{ tr:"Bir çalgı tamircisine gösteririm", en:"Show it to a repairer" },
              { tr:"Daha sert üflerim", en:"Blow harder" },
              { tr:"Kamışı değiştiririm", en:"Change the reed" }], ok:0,
        why:{ tr:"Sorun hep aynı delikteyse deliğin içi ya da register borusu temizlik isteyebilir: bu tamircinin işi.", en:"If it's always the same hole, the hole or register tube may need cleaning: that's a job for a repairer." } },
      { q:{ tr:"Kamışın ucunu ışığa tuttun, ucunda küçük bir çatlak var. Ne yaparsın?", en:"You hold the reed tip to the light and see a small chip. What do you do?" },
        opts:[{ tr:"Kamışı değiştiririm", en:"Replace the reed" },
              { tr:"Bağı daha sıkı takarım", en:"Tighten the ligature more" },
              { tr:"Daha çok ıslatırım", en:"Wet it more" }], ok:0,
        why:{ tr:"Ucu çatlak ya da dalgalı kamış kullanılmaz; değiştir.", en:"A chipped or wavy reed shouldn't be used; replace it." } }
    ] }
  ] });

// ---- S1.4 Nota okuma 2–5 ----
// Okuma çalınan notayla birlikte ilerler: süreler Temeller'in ilk ezgisinden önce, arızalar arızalı notalardan önce, yol
// işaretleri pes ezgilerinden sonra, ek çizgiler ve terimler ünitenin toparlamasından önce
const okSt = (w, d = 1) => w == null ? { w:null, c:null, d, rest:true } : { w, d };
// Yol işareti sorusu: doğru seçenek nota metninden (repertoire.js) açılarak üretilir, yanlışlar nota sıra numaralarıyla.
// Seçenekler ilk okunduğunda hesaplanır: tarayıcıda repertoire.js bu dosyadan sonra yüklenir
function yolSoru(score, meter, wrong, why){
  let opts = null;
  const build = () => {
    const R = LREP(), r = R.parseScoreText(score);
    const names = (ns, k) => ns.map(n => LCORE.noteName(n.w)[k].replace(/\d/, "")).join(" ");
    const opt = ns => ({ tr:names(ns, "tr"), en:names(ns, "en") });
    return [opt(R.expandRepeats(r.notes, r.marks)), ...wrong.map(ix => opt(ix.map(i => r.notes[i])))];
  };
  return { q:{ tr:"Bu satır hangi sırayla çalınır?", en:"In what order is this line played?" }, score, meter, ok:0, why,
    get opts(){ return opts || (opts = build()); } };
}
insertLessonAfter("sol-el-2", { id:"okuma-2", unit:"temel", since:2, notes:[],
  title:{ tr:"Süreler: sus, nokta, bağ", en:"Durations: rests, dots, ties" },
  text:[
    { tr:"Sıradaki derste ilk ezgileri çalacaksın. Önce notaların ne kadar sürdüğünü okumayı öğren: dörtlük bir vuruş, ikilik iki, birlik dört, sekizlik yarım vuruştur. Her sürenin bir susu vardır: o kadar süre çalmadan beklenir.",
      en:"In the next lesson you'll play your first tunes. First learn to read how long notes last: a quarter is one beat, a half two, a whole four and an eighth half a beat. Every value has a rest: you wait that long without playing." }
  ],
  tips:[{ tr:"Nota değerlerinin dizekte nasıl göründüğü Teori sayfasının “Nota değerleri ve ölçü” konusunda; orada dinleyerek de karşılaştırabilirsin.", en:"How the values look on the staff is in the Theory page under “Note values and time signatures”; you can listen to them there too." }],
  steps:[
    { type:"read", title:{ tr:"Nokta ve bağ", en:"Dots and ties" }, body:[
      { tr:"Nota başının sağındaki nokta, notanın süresine yarısını ekler: noktalı ikilik üç vuruş, noktalı dörtlük bir buçuk vuruş sürer.",
        en:"A dot to the right of the note head adds half the note's value: a dotted half lasts three beats, a dotted quarter one and a half." },
      { tr:"Aynı yükseklikteki iki notayı birleştiren yay uzatma bağıdır: ikinci nota yeniden başlatılmaz, süreler toplanır. Farklı yükseklikteki notaları birleştiren yay ise ifade bağıdır: notalar kesintisiz, bağlı çalınır; dil yalnız ilk notada kullanılır.",
        en:"A curve joining two notes of the same pitch is a tie: the second note is not restarted, the values add up. A curve over notes of different pitches is a slur: the notes are played smoothly connected, tonguing only the first." }
    ] },
    { type:"soru", items:[
      { q:{ tr:"İlk nota kaç vuruş sürer?", en:"How many beats does the first note last?" }, staff:[okSt(67, 2), okSt(64), okSt(62)], meter:[4, 4],
        opts:[{ tr:"2", en:"2" }, { tr:"1", en:"1" }, { tr:"4", en:"4" }], ok:0,
        why:{ tr:"İçi boş, saplı nota ikiliktir: iki vuruş.", en:"A hollow head with a stem is a half note: two beats." } },
      { q:{ tr:"Noktalı ikilik kaç vuruş sürer?", en:"How many beats does the dotted half last?" }, staff:[okSt(67, 3), okSt(64)], meter:[4, 4],
        opts:[{ tr:"3", en:"3" }, { tr:"2", en:"2" }, { tr:"2½", en:"2½" }], ok:0,
        why:{ tr:"Nokta yarısını ekler: 2 + 1 = 3.", en:"The dot adds half: 2 + 1 = 3." } },
      { q:{ tr:"İkinci vuruşta ne yapılır?", en:"What happens on the second beat?" }, staff:[okSt(67), okSt(null), okSt(64, 2)], meter:[4, 4],
        opts:[{ tr:"Susulur (dörtlük sus)", en:"Rest (quarter rest)" }, { tr:"Sol4 uzatılır", en:"G4 is held on" }, { tr:"Mi4 erken başlar", en:"E4 starts early" }], ok:0,
        why:{ tr:"Dörtlük sus bir vuruş boyunca sessizliktir.", en:"A quarter rest is one beat of silence." } },
      { q:{ tr:"İlk iki nota birlikte kaç vuruş eder?", en:"How many beats do the first two notes make together?" }, staff:[okSt(60, 0.5), okSt(62, 0.5), okSt(64), okSt(65, 2)], meter:[4, 4],
        opts:[{ tr:"1", en:"1" }, { tr:"2", en:"2" }, { tr:"½", en:"½" }], ok:0,
        why:{ tr:"Sekizlik yarım vuruştur; iki sekizlik bir vuruş eder.", en:"An eighth is half a beat; two eighths make one beat." } },
      { q:{ tr:"Aynı yükseklikteki iki ikilik uzatma bağıyla bağlı. Nasıl çalınır?", en:"Two half notes of the same pitch are tied. How are they played?" },
        opts:[{ tr:"Tek ses, dört vuruş; ikinci nota yeniden başlatılmaz", en:"One sound, four beats; the second note is not restarted" },
              { tr:"İki ayrı ses, her biri iki vuruş", en:"Two separate sounds, two beats each" },
              { tr:"İkinci nota daha güçlü çalınır", en:"The second note is played louder" }], ok:0,
        why:{ tr:"Uzatma bağı süreleri toplar: 2 + 2 = 4 vuruş, tek ses.", en:"A tie adds the values: 2 + 2 = 4 beats, one sound." } }
    ] },
    { type:"hece", mode:"tap", lv:2, min:70 },
    { type:"rhythm", pattern:"dotted", tempo:60, bars:4, min:55 }
  ] });

insertLessonAfter("pes", { id:"okuma-3", unit:"temel", since:2, notes:[],
  title:{ tr:"Diyez, bemol, natürel ve donanım", en:"Sharps, flats, naturals and key signatures" },
  text:[
    { tr:"Pes bölge dersinde beş arızalı nota gördün. Şimdi arızaların yazıda nasıl okunduğunu öğren; sonraki iki derste bu notaları tek tek çalışacaksın.",
      en:"In the low-register lesson you met five notes with accidentals. Now learn how accidentals are read; the next two lessons practise those notes one by one." }
  ],
  tips:[{ tr:"Koma işaretlerinin hepsi Teori sayfasının “Aralıklar ve koma” konusunda, sesleriyle birlikte.", en:"All the comma signs are in the Theory page under “Intervals and the comma”, with their sounds." }],
  steps:[
    { type:"read", title:{ tr:"Diyez, bemol, natürel", en:"Sharp, flat, natural" }, body:[
      { tr:"Diyez (♯) notayı tizleştirir, bemol (♭) pesleştirir, natürel (♮) önceki arızayı bozar. Bir ölçüde yazılan arıza, o ölçünün sonuna kadar aynı yerdeki notaya geçerlidir; ölçü çizgisi onu siler.",
        en:"A sharp (♯) raises a note, a flat (♭) lowers it and a natural (♮) cancels an earlier accidental. An accidental lasts to the end of its bar for notes in the same place; the bar line cancels it." },
      { tr:"Donanım, anahtarın hemen yanına yazılan arızalardır ve eserin her yerinde geçerlidir: donanımda Fa♯ varsa arızasız yazılan her Fa, diyezli çalınır.",
        en:"The key signature is the set of accidentals written right after the clef and it holds throughout the piece: with F♯ in the key signature every F written without an accidental is played sharp." }
    ] },
    { type:"read", title:{ tr:"Türk müziği arızaları", en:"Turkish accidentals" }, body:[
      { tr:"Türk müziğinde (AEU yazımı) arızalar koma sayısıyla ayrılır: koma (1), bakiye (4), küçük mücenneb (5), büyük mücenneb (8). Düz diyez bakiye diyezidir (+4 koma), düz bemol küçük mücenneb bemolüdür (−5); çizgili bemol bakiye bemolüdür (−4). Basılı notalarda her birinin ayrı biçimi vardır.",
        en:"In Turkish music (AEU notation) accidentals differ by comma count: koma (1), bakiye (4), small mücenneb (5), large mücenneb (8). The plain sharp is the bakiye sharp (+4 commas), the plain flat the small-mücenneb flat (−5); the slashed flat is the bakiye flat (−4). In print each has its own shape." },
      { tr:"Bu uygulamanın notalarında Türk müziği arızasının yanında küçük bir sayı durur: kaç koma olduğunu söyler (♭5, ♯4, ♭1). Pes bölgede şimdilik yarım sesleri çalıyorsun; koma perdeleri Makamlar ünitesinde gelir.",
        en:"In this app's scores a small number sits next to a Turkish accidental: it tells how many commas (♭5, ♯4, ♭1). In the low register you're playing semitones for now; the comma perdes come in the Makams unit." }
    ] },
    { type:"soru", items:[
      { q:{ tr:"Bu nota hangisi?", en:"Which note is this?" }, staff:[66], opts:[{ tr:"Fa♯4", en:"F♯4" }, { tr:"Fa4", en:"F4" }, { tr:"Sol4", en:"G4" }], ok:0,
        why:{ tr:"Fa aralığında diyezli nota: Fa♯4.", en:"The F space with a sharp: F♯4." } },
      { q:{ tr:"Bu nota hangisi?", en:"Which note is this?" }, staff:[58], opts:[{ tr:"Si♭3", en:"B♭3" }, { tr:"Si3", en:"B3" }, { tr:"La3", en:"A3" }], ok:0,
        why:{ tr:"Si yerinde bemol: Si♭3.", en:"A flat on B: B♭3." } },
      { q:{ tr:"Ölçünün başında Fa♯4 yazılı. Aynı ölçüde arızasız yazılan Fa4 nasıl çalınır?", en:"F♯4 is written at the start of a bar. How is an F4 later in the same bar, written without an accidental, played?" },
        opts:[{ tr:"Fa♯4 (arıza ölçü sonuna kadar geçerli)", en:"F♯4 (the accidental lasts to the end of the bar)" }, { tr:"Fa4", en:"F4" }, { tr:"Sol4", en:"G4" }], ok:0,
        why:{ tr:"Arıza ölçü çizgisine kadar geçerlidir.", en:"An accidental holds until the bar line." } },
      { q:{ tr:"Natürel (♮) ne yapar?", en:"What does a natural (♮) do?" },
        opts:[{ tr:"Önceki arızayı ya da donanımı o nota için bozar", en:"Cancels an earlier accidental or the key signature for that note" },
              { tr:"Notayı yarım ses tizleştirir", en:"Raises the note a semitone" }, { tr:"Notayı uzatır", en:"Lengthens the note" }], ok:0,
        why:{ tr:"Natürel, notayı doğal hâline döndürür.", en:"A natural returns the note to its plain form." } },
      { q:{ tr:"Donanımda Fa♯ var. Eserde arızasız yazılan Fa nasıl çalınır?", en:"The key signature has F♯. How is an F written without an accidental played?" },
        opts:[{ tr:"Fa♯", en:"F♯" }, { tr:"Fa", en:"F" }, { tr:"Mi", en:"E" }], ok:0,
        why:{ tr:"Donanım eserin her yerinde geçerlidir.", en:"The key signature holds throughout the piece." } },
      { q:{ tr:"Notanın yanındaki ♭5 ne demek?", en:"What does ♭5 next to a note mean?" },
        opts:[{ tr:"5 koma pes (küçük mücenneb bemolü)", en:"5 commas lower (small-mücenneb flat)" }, { tr:"5 vuruş sürer", en:"It lasts 5 beats" }, { tr:"5. parmakla çalınır", en:"Played with the 5th finger" }], ok:0,
        why:{ tr:"Sayı koma sayısıdır; düz bemol 5 koma pesleştirir.", en:"The number is the comma count; the plain flat lowers by 5 commas." } }
    ] },
    { type:"quiz", notes:[54, 56, 58, 61, 63, 66], mode:"staff", n:8, min:6 }
  ] });

insertLessonAfter("ezgi-pes", { id:"okuma-4", unit:"temel", since:2, notes:[],
  title:{ tr:"Yol işaretleri: tekrar, dolap, D.C., Fine", en:"Road signs: repeats, endings, D.C., Fine" },
  text:[
    { tr:"Eserler çoğu zaman yazıldığı sırayla çalınmaz: tekrar çizgileri, dolaplar ve D.C., D.S., Fine işaretleri yolu gösterir. Nota arşivindeki eserlerde bunlarla sık karşılaşacaksın.",
      en:"Pieces are often not played in the order they're written: repeat bars, endings and D.C., D.S. and Fine show the way. You'll meet them often in the score archive." }
  ],
  tips:[{ tr:"Çalmadan önce eserin yolunu parmağınla izle: tekrar nereden başlıyor, hangi dolap, nerede bitiyor.", en:"Before playing, trace the route with your finger: where the repeat starts, which ending, where it stops." }],
  steps:[
    { type:"read", title:{ tr:"İşaretler", en:"The signs" }, body:[
      { tr:"‖: ile :‖ arasındaki bölüm iki kez çalınır; yalnız :‖ varsa baştan tekrarlanır. Tekrarın sonunda “1.” ve “2.” yazan köşeli çizgiler dolaptır: ilk geçişte birinci dolap, tekrarda birinci atlanıp ikinci dolap çalınır.",
        en:"The section between ‖: and :‖ is played twice; if there is only :‖ it repeats from the start. Brackets marked “1.” and “2.” at the end of a repeat are endings: the first time play the first ending, on the repeat skip it and play the second." },
      { tr:"D.C. (da capo) baştan, D.S. (dal segno) 𝄋 işaretinden yeniden çalmak demektir; Fine yazan yerde eser biter. D.C. ve D.S.'den sonraki dönüşte tekrarlar yeniden çalınmaz; yaygın kural budur, eserde aksi yazıyorsa ona uyulur. Koda işareti (⊕) görürsen dönüşte oradan koda bölümüne atlanır.",
        en:"D.C. (da capo) means play again from the start, D.S. (dal segno) from the 𝄋 sign; the piece ends where Fine is written. On the return after D.C. or D.S. the repeats are not played again; that is the usual rule, unless the piece says otherwise. If you see a coda sign (⊕), on the return you jump from there to the coda." }
    ] },
    { type:"soru", items:[
      yolSoru("|: Sol3 La3 Si3 Do4 :| Re4:4", [4, 4], [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 0, 1, 2, 3]],
        { tr:"Tekrar çizgileri arasındaki dört nota iki kez, sonra Re.", en:"The four notes between the repeat bars twice, then D." }),
      yolSoru("|: Sol3 La3 [1 Si3:2 :| [2 Do4:2", [2, 4], [[0, 1, 2, 0, 1, 2, 3], [0, 1, 2, 3]],
        { tr:"İlk geçişte birinci dolap (Si), tekrarda ikinci dolap (Do).", en:"First time the first ending (B), on the repeat the second ending (C)." }),
      yolSoru("Sol3 La3 Fine Si3 Do4 D.C.", [2, 4], [[0, 1, 2, 3, 0, 1, 2, 3], [0, 1, 2, 3]],
        { tr:"D.C. ile baştan dönülür, Fine'da biter.", en:"D.C. returns to the start and the piece ends at Fine." }),
      yolSoru("Sol3:2 % La3 Si3 Fine Do4 Re4 D.S.", [2, 4], [[0, 1, 2, 3, 4, 0, 1, 2], [0, 1, 2, 3, 4]],
        { tr:"D.S. senyo işaretine (𝄋) döner: La'dan yeniden başlar, Fine'da (Si'den sonra) biter.", en:"D.S. returns to the sign (𝄋): it starts again from A and ends at Fine (after B)." }),
      yolSoru("|: Sol3 La3 :| Si3 Do4 Fine Re4 Mi4 D.C.", [2, 4], [[0, 1, 0, 1, 2, 3, 4, 5, 0, 1, 0, 1, 2, 3], [0, 1, 2, 3, 4, 5, 0, 1, 2, 3]],
        { tr:"Önce tekrar (Sol La iki kez), sonra D.C. ile baştan; dönüşte tekrar yapılmaz, Fine'da biter.", en:"First the repeat (G A twice), then D.C. from the start; no repeat on the return, it ends at Fine." })
    ] },
    { type:"soru", items:[
      { q:{ tr:"Bu ezgide birinci dolap kaç kez çalınır?", en:"How many times is the first ending played in this tune?" },
        score:"|: Sol3 La3 Si3 Do4 | Re4:2 Si3:2 | Do4 Si3 La3 Si3 | [1 Sol3:2 La3:2 :| [2 Sol3:4 | La3 Si3 Do4 Si3 | La3:2 Fa♯3:2 | Sol3:4",
        opts:[{ tr:"Bir kez", en:"Once" }, { tr:"İki kez", en:"Twice" }, { tr:"Hiç", en:"Never" }], ok:0,
        why:{ tr:"Birinci dolap yalnız ilk geçişte; tekrarda ikinci dolaba geçilir. Şimdi bu ezgiyi çal: uygulama notayı çalınış sırasıyla açılmış gösterir.", en:"The first ending only on the first time through; the repeat goes to the second. Now play the tune: the app shows it written out in playing order." } }
    ] },
    { type:"piece", id:"e-t7b", mode:"free", min:4 },
    { type:"piece", id:"e-t7b", mode:"tempo", min:70 }
  ] });

// Toparlama dersinden hemen önce
insertLessonAfter((() => { const t = LESSONS.filter(l => l.unit === "temel"), k = t.findIndex(l => l.id === "temel-tekrar"); return t[k - 1].id; })(),
  { id:"okuma-5", unit:"temel", since:2, notes:[],
  title:{ tr:"Ek çizgiler, tempo ve nüans", en:"Ledger lines, tempo and dynamics" },
  text:[
    { tr:"Pes notalar dizeğin altına ek çizgilerle yazılır; eserin başındaki tempo ve dizeğin altındaki nüans işaretleri de nasıl çalınacağını söyler.",
      en:"Low notes are written below the staff on ledger lines; the tempo at the top of a piece and the dynamics under the staff tell you how to play it." }
  ],
  tips:[{ tr:"Ek çizgileri saymak yerine iki işaret notası ezberle: Do4 birinci ek çizgide, La3 ikincide.", en:"Instead of counting ledger lines, memorise two landmarks: C4 on the first ledger line, A3 on the second." }],
  steps:[
    { type:"read", title:{ tr:"Ek çizgiler, tempo, nüans", en:"Ledger lines, tempo, dynamics" }, body:[
      { tr:"Dizeğin en alt çizgisi Mi4'tür. Altındaki aralık Re4, birinci ek çizgi Do4, onun altı Si3, ikinci ek çizgi La3, altı Sol3, üçüncü ek çizgi Fa3, altı Mi3.",
        en:"The bottom line of the staff is E4. The space below is D4, the first ledger line C4, below it B3, the second ledger line A3, below it G3, the third ledger line F3 and below it E3." },
      { tr:"♩ = 72, dakikada 72 dörtlük demektir. Türk müziğinde tempo çoğu zaman sözle yazılır: ağır, ağırca, orta, yürük, çok yürük. Nüans: p (piyano) hafif, mf yarı güçlü, f (forte) güçlü; cresc. giderek güçlenerek, dim. giderek hafifleyerek. Dizeğin üstündeki virgül (’) nefes yeridir.",
        en:"♩ = 72 means 72 quarter notes a minute. Turkish music often writes tempo in words: ağır (slow), ağırca, orta (moderate), yürük (fast), çok yürük. Dynamics: p (piano) soft, mf moderately loud, f (forte) loud; cresc. getting louder, dim. getting softer. A comma (’) above the staff marks a breath." }
    ] },
    { type:"soru", items:[
      { q:{ tr:"Bu nota hangisi?", en:"Which note is this?" }, staff:[57], opts:[{ tr:"La3", en:"A3" }, { tr:"Do4", en:"C4" }, { tr:"Fa3", en:"F3" }], ok:0,
        why:{ tr:"İkinci ek çizgi La3.", en:"The second ledger line is A3." } },
      { q:{ tr:"Bu nota hangisi?", en:"Which note is this?" }, staff:[53], opts:[{ tr:"Fa3", en:"F3" }, { tr:"Sol3", en:"G3" }, { tr:"Mi3", en:"E3" }], ok:0,
        why:{ tr:"Üçüncü ek çizgi Fa3.", en:"The third ledger line is F3." } },
      { q:{ tr:"♩ = 60 ne demek?", en:"What does ♩ = 60 mean?" },
        opts:[{ tr:"Dakikada 60 dörtlük, saniyede bir vuruş", en:"60 quarter notes a minute, one beat per second" }, { tr:"60 ölçü", en:"60 bars" }, { tr:"60 saniye sürer", en:"It lasts 60 seconds" }], ok:0,
        why:{ tr:"Sayı, dakikadaki dörtlük sayısıdır.", en:"The number is quarter notes per minute." } },
      { q:{ tr:"Dizeğin altında “p” yazıyor. Nasıl çalınır?", en:"“p” is written under the staff. How do you play?" },
        opts:[{ tr:"Hafif", en:"Softly" }, { tr:"Güçlü", en:"Loudly" }, { tr:"Hızlı", en:"Fast" }], ok:0,
        why:{ tr:"p (piyano) hafif demektir; f (forte) güçlü.", en:"p (piano) means soft; f (forte) loud." } }
    ] },
    { type:"quiz", notes:[52, 53, 55, 57, 59, 60], mode:"staff", n:8, min:6 },
    { type:"sight", level:1, min:60 }
  ] });

// ---- S1.6 İlk eserler ----
// Temeller'in sonunda nota arşivinden ilk eserler (scripts/eser-sec.js; telifsiz: anonim ya da bestekârı kamu malı).
// Arşivde bu makam ve usullerin hiçbir eseri Si♭4'ün altında kalmadığı için eserler bir oktav pes çalınır (oct:-1)
const ILK_ESER_TEXT = {
  oct:{ tr:"Bu eserler nota arşivinden, gerçek besteler. Asıl yerleri klarino bölgesi; sen henüz pes bölgedesin, bu yüzden bir oktav pes çalıyorsun. Register ve klarino ünitesinden sonra aynısını arşivde asıl yerinde çalabilirsin.",
        en:"These pieces come from the score archive: real compositions. They belong in the clarion register; you're still in the low register, so you play them an octave lower. After the register and clarion unit you can play the same pieces at their real pitch in the archive." },
  how:{ tr:"Her eser bölüm bölüm gelir: önce dinle, sonra yavaş tempoda serbest takiple çal (uygulama seni bekler). En sonda eserin tamamı önce %80, sonra kendi temposunda. Takılırsan zor ölçüyü arşivde açıp döngüye al.",
        en:"Each piece comes section by section: listen first, then play it slowly in follow mode (the app waits for you). At the end the whole piece, first at 80% and then at its own tempo. If you get stuck, open the piece in the archive and loop the hard bar." }
};
insertLessonAfter("temel-tekrar", { id:"ilk-eserler-1", unit:"temel", since:2, notes:[],
  title:{ tr:"İlk eserler: bir türkü ve bir küpe", en:"First pieces: a türkü and a küpe" },
  text:[
    ILK_ESER_TEXT.oct,
    { tr:"Birincisi Hüseynî makamında anonim bir türkü, ikincisi Ahmet Avni Konuk'un Uşşak makamında bir küpesi. İkisinde de Segâh perdesi var; şimdilik Si gibi çal, gerçek perdesini Makamlar'da öğreneceksin. Türküde Irak perdesi de geçer (Eviç'in bir oktav pesi): onu da şimdilik Fa♯ gibi çal.",
      en:"The first is an anonymous türkü in makam Hüseynî, the second a küpe in makam Uşşak by Ahmet Avni Konuk. Both use the Segâh perde; for now play it like B, you'll learn its real pitch in Makams. The türkü also has the Irak perde (Eviç an octave lower): play it like F♯ for now." },
    ILK_ESER_TEXT.how
  ],
  tips:[{ tr:"Notanın altındaki perde adları sana yardım eder; Ayarlar'da batı adlarını da açabilirsin.", en:"The perde names under the notes help you; you can also turn on Western names in Settings." }],
  steps:[
    ...eserSteps("huseyni--turku--sofyan--sabahin_seher--", { tr:"Sabahın Seher Vaktinde", en:"Sabahın Seher Vaktinde" }, [[1, 6], [7, 11]], { oct:-1 }),
    ...eserSteps("ussak--kupe--duyek--sanma_ussakin--ahmet_avni_konuk", { tr:"Sanma Uşşâk'ın Hemân", en:"Sanma Uşşâk'ın Hemân" }, [[1, 4], [5, 8]], { oct:-1 })
  ] });

insertLessonAfter("ilk-eserler-1", { id:"ilk-eserler-2", unit:"temel", since:2, notes:[],
  title:{ tr:"İlk eserler: bir kasap havası ve bir şugul", en:"First pieces: a kasap dance and a şugul" },
  text:[
    ILK_ESER_TEXT.oct,
    { tr:"Birincisi Nihâvend makamında anonim bir kasap havası: oyun havası olduğu için tempoya iyi otur. İkincisi Tanburî Ali Efendi'nin Rast makamında bir şugulü. Kasap havasında Irak'ı (Eviç'in bir oktav pesi) şimdilik Fa♯ gibi, şugulde Segâh'ı Si gibi çal.",
      en:"The first is an anonymous kasap dance in makam Nihâvend: it's a dance tune, so settle firmly into the tempo. The second is a şugul in makam Rast by Tanburî Ali Efendi. For now play Irak (Eviç an octave lower) like F♯ in the dance and Segâh like B in the şugul." },
    ILK_ESER_TEXT.how
  ],
  tips:[{ tr:"Kasap havasını Eşlik'in darbukasıyla da çalabilirsin: eser sayfasında usul ve dem düğmeleri var.", en:"You can play the kasap dance with the band's darbuka too: the piece page has usul and drone buttons." }],
  steps:[
    ...eserSteps("nihavent--kasaphavasi--duyek----", { tr:"Kasaphavası (Nihâvend)", en:"Kasap dance (Nihâvend)" }, [[1, 8], [9, 16]], { oct:-1 }),
    ...eserSteps("rast--sugul--duyek--ya_men--tanburi_ali_efendi", { tr:"Yâ Men Yuhibbu", en:"Yâ Men Yuhibbu" }, [[1, 4], [5, 8]], { oct:-1 })
  ] });

// ---- S3.7 Usul 3 ve 4 ----
// Veride olup dersi olmayan usuller (learn.js USULS, açıklamalar usuller.js USUL_INFO; TDV şemaları, docs/KAYNAKLAR.md).
// Her usul: usultap (yeni kalıpta önce tap) → mem → rhythm → arşivden o usulde bir eserin ilk 8 ölçüsü (dinle, çal).
// Eserler scripts/eser-sec.js ile (--makam hepsi --oktav 0 --aralik 52-84 --sn 300; telifsiz). Aksak Semâî yok: B1'de
// şeması çözülmedi (docs/BACKLOG.md)
const usulEser = (arsiv, name, min = 65) => [
  { type:"listen", arsiv, name, from:1, to:8 },
  { type:"piece", arsiv, name, from:1, to:8, mode:"tempo", min }
];
insertLessonAfter("usul-2", { id:"usul-3", unit:"teknik", since:2, notes:[],
  title:{ tr:"Nîm-sofyan, Ağır Aksak ve Sengin Semâî", en:"Nîm-sofyan, Ağır Aksak and Sengin Semâî" },
  text:[
    { tr:"Üç usul daha; üçü de bildiğin bir usule dayanır. Nîm-sofyan iki zamanlıdır (2/4): düm tek. Dört zamanlı Sofyan'ın yarısı olduğu için “yarım sofyan” denmiştir; sirto, longa, marş ve bazı türkülerde.",
      en:"Three more usuls, each built on one you know. Nîm-sofyan has two beats (2/4): düm tek. It is called “half sofyan” because it is half the four-beat Sofyan; in sirtos, longas, marches and some türküs." },
    { tr:"Ağır Aksak, Aksak'ın bir mertebe ağırıdır: aynı vuruşlar, dokuz dörtlük (9/4). Zeybek de bu vuruşlarla çalınır. Sengin Semâî de Yürük Semâî'nin vuruşlarını bir mertebe ağır vurur (6/4): düm tek tek, düm tek.",
      en:"Ağır Aksak is Aksak one level slower: the same strokes in nine quarters (9/4). Zeybek is played with these strokes too. Sengin Semâî likewise takes Yürük Semâî's strokes one level slower (6/4): düm tek tek, düm tek." },
    { tr:"Her usulü ezberden vur, sonra metronomla klarnette çal; en sonda arşivden o usulde bir eserin ilk sekiz ölçüsü. Türküde (Sabâ) iki koma perdesi var, Si ve Do♯ yazılı: şimdilik yazıldığı gibi çal, gerçek perdelerini Makamlar'da öğreneceksin.",
      en:"Tap each usul from memory, then play it on the clarinet with the metronome; at the end, the first eight bars of an archive piece in that usul. The türkü (Sabâ) has two comma perdes, written B and C♯: play them as written for now, you'll learn their real pitch in Makams." }
  ],
  tips:[
    { tr:"Ağır usullerde vuruşu dörtlükle say, sekizlikle değil: Ağır Aksak'ı 2+2+2+3 dörtlük diye say.", en:"In slow usuls count the strokes in quarters, not eighths: count Ağır Aksak as 2+2+2+3 quarters." }
  ],
  steps:[
    { type:"usultap", usul:"nimsofyan", mode:"mem", min:70 },
    { type:"rhythm", usul:"nimsofyan", tempo:100, bars:6, min:60 },
    ...usulEser("saba--turku--nimsofyan--pinar_basi--", { tr:"Pınar Başı Burma Burma", en:"Pınar Başı Burma Burma" }),
    { type:"usultap", usul:"agiraksak", mode:"mem", min:70 },
    { type:"rhythm", usul:"agiraksak", tempo:90, bars:2, min:55 },
    ...usulEser("huseyni--zeybek--agiraksak--sarizeybek--osman_pehlivan", { tr:"Sarı Zeybek", en:"Sarı Zeybek" }),
    { type:"usultap", usul:"senginsemai", mode:"mem", min:70 },
    { type:"rhythm", usul:"senginsemai", tempo:100, bars:3, min:55 },
    ...usulEser("beyati--yuruksemai--senginsemai--gelse_nesim-i--iv_murad", { tr:"Gelse Nesîm-i Subh İle", en:"Gelse Nesîm-i Subh İle" })
  ] });

// Makamlar'ın başına: ünitenin ilk dersinden önceki dersin arkasına (unlocked: ünitenin ilk dersi base() ister, sonrakiler
// bir öncekini; usul-4 bitmeden Makamlar'ın ikinci dersi açılmaz, eski kullanıcıda göç "istersen" yapar)
insertLessonAfter(LESSONS[LESSONS.findIndex(l => l.unit === "makam") - 1].id, { id:"usul-4", unit:"makam", since:2, notes:[],
  title:{ tr:"Devr-i Hindî ve Müsemmen", en:"Devr-i Hindî and Müsemmen" },
  text:[
    { tr:"Makam eserlerinde sık geçen iki usul. Devr-i Hindî yedi zamanlıdır (7/8): üç zamanlık düm tek tek, sonra iki zamanlık düm ve iki zamanlık tek; bir semâî ile bir sofyanın eklenmesidir. 7/4'lük (ağır) mertebesi de var: bu dersteki türkünün notası 7/4 yazılı.",
      en:"Two usuls common in makam pieces. Devr-i Hindî has seven beats (7/8): a three-beat düm tek tek, then a two-beat düm and a two-beat tek; a semâî and a sofyan joined. There is a heavier 7/4 form too: this lesson's türkü is written in 7/4." },
    { tr:"Müsemmen sekiz zamanlıdır (8/8) ama Düyek gibi değil: üç zamanlık düm, iki zamanlık tek, üç zamanlık tek (3+5). Bir semâî ile bir Türk aksağının eklenmesidir; “Katakofti” diye de anılır.",
      en:"Müsemmen has eight beats (8/8) but unlike Düyek: a three-beat düm, a two-beat tek and a three-beat tek (3+5). A semâî and a Türk aksağı joined; also known as “Katakofti”." },
    { tr:"Önce kalıbı göre göre vur, sonra ezberden; ardından metronomla klarnette ve sonunda arşivden bir türkünün ilk sekiz ölçüsü. İki türküde de Si koma perdesi var, birincisinde Fa♯ da: bu ünitenin derslerinde öğreneceksin, şimdilik yazıldığı gibi çal.",
      en:"Tap the pattern first while watching it, then from memory; then with the metronome on the clarinet, and finally the first eight bars of a türkü from the archive. Both türküs have the comma perde B, the first one F♯ too: you'll learn them in this unit, for now play them as written." }
  ],
  tips:[
    { tr:"Devr-i Hindî'yi 3+2+2, Müsemmen'i 3+2+3 diye say; ikisinde de ilk grup üç zamanlıdır.", en:"Count Devr-i Hindî as 3+2+2 and Müsemmen as 3+2+3; both start with a three-beat group." }
  ],
  steps:[
    { type:"usultap", usul:"devrihindi", mode:"tap", min:70 },
    { type:"usultap", usul:"devrihindi", mode:"mem", min:70 },
    { type:"rhythm", usul:"devrihindi", tempo:150, bars:3, min:55 },
    ...usulEser("huseyni--turku--devrihindi--semsiyemin_ucu--trakya", { tr:"Şemsiyemin Ucu Kare", en:"Şemsiyemin Ucu Kare" }),
    { type:"usultap", usul:"musemmen", mode:"tap", min:70 },
    { type:"usultap", usul:"musemmen", mode:"mem", min:70 },
    { type:"rhythm", usul:"musemmen", tempo:140, bars:3, min:55 },
    ...usulEser("huseyni--turku--musemmen--aglama_yar--anonim", { tr:"Ağlama Yâr", en:"Ağlama Yâr" })
  ] });

// ---- S3.8 Teori dersleri ----
// Teori sayfasının konuları yola serpilir. Metin ve sorular teori.js'teki konu nesnelerinden gelir (tek yer): konular
// iki dilli kurulur (thTopics((tr, en) => ({ tr, en }))). Tarayıcıda teori.js bu dosyadan sonra yüklendiği için ders
// alanları tembel getter'dır; ilk okunduğunda konu kurulur. Ders sorusu = konunun ek soruları + Teori sayfasındaki sınav.
const LTH = () => typeof module !== "undefined" ? require("./teori.js") : { thTopics, thCesni };
let thBi = null, thCeBi = null;
const thBiL = (tr, en) => ({ tr, en });
const thTopic = id => (thBi || (thBi = LTH().thTopics(thBiL))).find(t => t.id === id);
const thCesniBi = () => thCeBi || (thCeBi = LTH().thCesni(thBiL));
const thSoru = q => ({ q:q.q, opts:q.a, ok:q.ok, why:q.why, ...(q.staff ? { staff:q.staff } : {}) });
// Konudan okuma adımı (paragraflar: [alan, indeks] çiftleri) ve soru adımı; alanlar ilk okunduğunda doldurulur
function thRead(id, parts, extra = {}){
  return { type:"read", ...extra, get title(){ return thTopic(id).title; },
    get body(){ const t = thTopic(id); return parts.flatMap(([k, i]) => i == null ? t[k] : [t[k][i]]); } };
}
function thSoruStep(id, min){
  let items = null;
  return { type:"soru", ...(min != null ? { min } : {}),
    get items(){ return items || (items = (t => [...(t.ek || []), ...t.quiz].map(thSoru))(thTopic(id))); } };
}
// Ders başlığı konunun başlığıdır
const thLesson = (id, topic, o) => Object.defineProperty({ id, unit:o.unit, since:2, notes:[], text:o.text, tips:o.tips || [], steps:o.steps },
  "title", { get(){ return thTopic(topic).title; }, enumerable:true });

// Makamlar'ın başında, ilk makam dersinden (rast-giris) önce
insertLessonAfter(LESSONS[LESSONS.findIndex(l => l.id === "rast-giris") - 1].id, thLesson("teori-koma", "koma", { unit:"makam",
  text:[{ tr:"Makamlara başlamadan önce Türk müziğinin aralıklarını tanı: perdeler arasındaki uzaklık komayla ölçülür. Okuduktan sonra birbirine yakın iki perdeyi kulakla ayırt edeceksin.",
          en:"Before the makams, get to know the intervals of Turkish music: the distance between perdes is measured in commas. After reading, you'll tell two close perdes apart by ear." }],
  tips:[{ tr:"Aralık tablosunu sesleriyle Teori sayfasının “Aralıklar ve koma” konusunda dinleyebilirsin.", en:"You can listen to the interval table in the Theory page under “Intervals and the comma”." }],
  steps:[
    thRead("koma", [["text", 0], ["text2"]]),
    thSoruStep("koma"),
    { type:"ear", mode:"abx", level:1, n:8, min:6 }
  ] }));

// Rast'tan (ve varsa ikinci Rast dersinden) sonra: perde adları iki oktav
insertLessonAfter(["rast-2", "rast"].find(id => LESSONS.some(l => l.id === id)), thLesson("teori-perde", "perde", { unit:"makam",
  text:[{ tr:"Rast beşlisini ve Rast makamını çaldın. Şimdi perdelerin adlarını iki oktav boyunca öğren; makam derslerinde notalar hep bu adlarla anılacak.",
          en:"You've played the Rast pentachord and makam Rast. Now learn the perde names across two octaves; the makam lessons always call the notes by these names." }],
  steps:[
    thRead("perde", [["text"], ["text2"]]),
    thSoruStep("perde", 6),
    // Ana perdeler, Yegâh'tan Muhayyer'e (Teori sayfasındaki örnekle aynı): çalınca perde adı notanın altında görünür
    { type:"quiz", notes:[-22, -13, -9, -5, 0, 9, 17, 22, 31, 40, 48, 53, 62].map(c => LLEARN.commaToWritten(c)), mode:"play", n:10, min:7 }
  ] }));

// Hicaz'dan (ve varsa ikinci Hicaz dersinden) sonra: dörtlü ve beşliler; Dügâh ve Rast'tan başlayan çeşniler çalınır
insertLessonAfter(["hicaz-2", "hicaz"].find(id => LESSONS.some(l => l.id === id)), thLesson("teori-cesni", "cesni", { unit:"makam",
  text:[{ tr:"Şimdiye kadar çaldığın makamlar küçük yapı taşlarından kurulu. Bu derste o taşları, çeşnileri, tek tek tanıyıp Dügâh ve Rast perdelerinden çalacaksın.",
          en:"The makams you've played so far are built from small blocks. In this lesson you get to know those blocks, the çeşnis, one by one and play them from Dügâh and Rast." }],
  tips:[{ tr:"Her çeşninin ayırt edici perdesi ve geçtiği makamlar Teori sayfasının “Çeşni” konusunda.", en:"Each çeşni's telling perde and the makams it appears in are in the Theory page under “Çeşni”." }],
  steps:[
    thRead("cesni", [["text", 0], ["text", 1]]),
    thSoruStep("cesni"),
    // Çeşni listesi teori.js'ten (TH_CESNI ile aynı kaynak): Dügâh'ta ve Rast'ta başlayanlar, çıkış ve iniş
    ...thCesniOn(["Rast", "Dügâh"])
  ] }));
function thCesniOn(ons){
  // Adım sayısı yüklenirken bilinmeli: çeşni listesinin sırası ve başladığı perdeler sabit, çeşniler ilk okunduğunda kurulur
  const ORDER = { "Rast":[0, 10], "Dügâh":[1, 3, 4, 5] }, ixs = ons.flatMap(o => ORDER[o]);
  return ixs.map(i => ({ type:"notes", maxMiss:2,
    get commas(){ const cs = thCesniBi()[i].cs; return [...cs, ...cs.slice(0, -1).reverse()]; },
    get hint(){ return thCesniBi()[i].name; } }));
}

// Nihâvend'den (ve varsa ikinci Nihâvend dersinden) sonra: durak, güçlü, yeden, seyir
insertLessonAfter(["nihavend-2", "nihavend"].find(id => LESSONS.some(l => l.id === id)), thLesson("teori-makam", "makam", { unit:"makam",
  text:[{ tr:"Beş makam çaldın. Bir makamı tanıtan dört kavramı (durak, güçlü, yeden, seyir) adlarıyla öğren; sonraki makam derslerinde hepsini arayacaksın.",
          en:"You've played five makams. Learn by name the four ideas that describe a makam (durak, güçlü, yeden, seyir); you'll look for all of them in the next makam lessons." }],
  tips:[{ tr:"Teori sayfasının “Makam yapısı” konusunda bir makam seçip durağını ve güçlüsünü dizide görebilirsin.", en:"In the Theory page under “How a makam works” you can pick a makam and see its final and güçlü in the scale." }],
  steps:[
    thRead("makam", [["text"], ["list"]]),
    thSoruStep("makam")
  ] }));

// Temeller'de, nota okumanın son dersinden (okuma-5) sonra: yazılı ve duyulan ses
insertLessonAfter("okuma-5", thLesson("teori-transpoz", "transpoz", { unit:"temel",
  text:[{ tr:"Uygulama her yerde yazılı notayı gösteriyor. Piyanoyla ya da başka bir çalgıyla çalmadan önce yazılı ve duyulan sesin farkını öğren.",
          en:"The app always shows the written note. Before playing with a piano or another instrument, learn the difference between the written and the sounding note." }],
  steps:[
    thRead("transpoz", [["text"]], { links:[{ go:"tune", label:{ tr:"Akort ekranını aç", en:"Open the tuner" } }] }),
    thSoruStep("transpoz")
  ] }));

// ---- S2.3 Dizi ve arpej ----
// Hız ünitesine, hızlı etütten önce dört ders: kromatik dizi, iki oktav dizi, aksak gruplama, atlamalar (skills.js techPattern
// chromatic, scale octaves:2, groups group:[…], leaps). İki oktav makam dizileri bir oktav pesten başlar (Do6'nın üstüne çıkmasın).
insertLessonAfter("hiz-makam",
  { id:"hiz-kromatik", unit:"hiz", since:2, notes:[],
    title:{ tr:"Kromatik dizi", en:"The chromatic scale" },
    text:[
      { tr:"Kromatik dizi yarım ses yarım ses çıkar ve iner: aradaki bütün arızalı notalar dahil. Her parmak geçişini, mandalları ve serçe parmak kaymalarını tek kalıpta çalıştırır; bu yüzden klarnetçilerin günlük ısınmasında yer alır.",
        en:"The chromatic scale climbs and descends in half steps, every sharp and flat in between included. It drills every finger change, the keys and the little-finger slides in one pattern, which is why clarinettists use it as a daily warm-up." },
      { tr:"Önce pes bölgede Mi3'ten Si4'e, sonra klarino bölgesinde Sol4'ten Do6'ya. İkincisinde register geçişi de var: Si♭4'ten Si4'e geçerken parmaklar birlikte kapansın.",
        en:"First in the low register from E3 to B4, then in the clarion register from G4 to C6. The second includes the break: going from B♭4 to B4, close the fingers together." }
    ],
    tips:[
      { tr:"Hangi notanın hangi mandalla çalındığını unuttuysan Parmaklar ekranına bak; kalıbı yavaş tempoda ezberle.", en:"If you forget which key a note uses, check the Fingerings screen; learn the pattern slowly first." },
      { tr:"Arızalı notalarda parmağı kaldırmadan mandala kaydır; el pozisyonu bozulmasın.", en:"On sharps and flats slide onto the key without lifting; keep the hand position steady." }
    ],
    steps:[
      ...techSteps({ type:"chromatic", base:52, span:19, sub:2, art:"legato" }, 60, 88),
      ...techSteps({ type:"chromatic", base:67, span:17, sub:2, art:"legato" }, 60, 88)
    ] },
  { id:"hiz-iki-oktav", unit:"hiz", since:2, notes:[],
    title:{ tr:"İki oktav diziler", en:"Two-octave scales" },
    text:[
      { tr:"İki oktav dizi pes bölgeden klarino bölgesine kesintisiz geçer; register geçişini hızın içinde çalıştırır. Sol majör gamı Sol3'ten Sol5'e çıkar.",
        en:"A two-octave scale runs from the low register into the clarion without a break; it trains the register crossing at speed. The G major scale climbs from G3 to G5." },
      { tr:"Makam dizilerinde iki oktav asıl yerinden başlarsa klarnetin rahat aralığını aşar; bu yüzden bir oktav pesten başlar: Rast, Kaba Rast'tan Gerdâniye'ye; Uşşak ve Hicaz Kaba Dügâh'tan Muhayyer'e. Dizilerin perdeleri makam derslerindekiyle aynıdır, yalnız pes oktavdan başlar.",
        en:"Starting at their usual place, two-octave makam scales would go beyond the clarinet's comfortable range, so they start an octave lower: Rast from Kaba Rast to Gerdâniye, Uşşak and Hicaz from Kaba Dügâh to Muhayyer. The perdes are the same as in the makam lessons, just starting from the lower octave." }
    ],
    tips:[
      { tr:"Nefesi dizinin başında al; iki oktav tek nefeste çalınamıyorsa tempoyu yükselt değil, nefesi tazele ve yeniden başla.", en:"Breathe before the scale; if two octaves don't fit in one breath, take a fresh breath and start again rather than rushing." }
    ],
    steps:[
      ...techSteps({ type:"scale", base:55, mode:"major", octaves:2, sub:2, art:"legato" }, 60, 84),
      ...techSteps({ type:"scale", makam:"rast", octaves:2, sub:2, art:"legato" }, 60, 84),
      ...techSteps({ type:"scale", makam:"ussak", octaves:2, sub:2, art:"legato" }, 60, 84),
      ...techSteps({ type:"scale", makam:"hicaz", octaves:2, sub:2, art:"legato" }, 60, 84)
    ] },
  { id:"hiz-aksak", unit:"hiz", since:2, notes:[],
    title:{ tr:"Aksak gruplar: 9/8 ve 7/8", en:"Aksak groups: 9/8 and 7/8" },
    text:[
      { tr:"Aksak ölçülerde vuruşlar eşit değildir: 9/8 sekizlikleri 2+2+2+3, 7/8 ise 2+2+3 diye gruplanır (Karşılama ve Rumeli usullerindeki gibi). Bu derste dizi sekizliklerle çıkıp iner, her grubun ilk notası vurgulu (>) ve metronom yalnız grup başlarında tıklar.",
        en:"In aksak metres the beats are unequal: 9/8 groups its eighths 2+2+2+3, 7/8 groups them 2+2+3 (as in the Karşılama and Rumeli usuls). In this lesson the scale goes up and down in eighths, the first note of each group is accented (>) and the metronome clicks only on group starts." },
      { tr:"Vurguyu dille ya da hava ile hafifçe ver; uzun grubu (üçlü) acele etme. Son nota ölçünün sonuna kadar uzar.",
        en:"Give the accent lightly with the tongue or the air; don't rush the long group (of three). The last note is held to the end of the bar." }
    ],
    tips:[
      { tr:"Önce Usul ekranında Karşılama ve Rumeli'yi vur; sayışı elinde hissedince diziye geç.", en:"Tap Karşılama and Rumeli in the Usul screen first; move to the scale once you feel the count in your hand." }
    ],
    steps:[
      ...techSteps({ type:"groups", makam:"rast", group:[2,2,2,3], art:"legato" }, 50, 72),
      ...techSteps({ type:"groups", makam:"hicaz", group:[2,2,2,3], art:"legato" }, 50, 72),
      ...techSteps({ type:"groups", base:60, mode:"major", group:[2,2,3], art:"legato" }, 50, 72)
    ] },
  { id:"hiz-atlama", unit:"hiz", since:2, notes:[],
    title:{ tr:"Dörtlü, beşli ve oktav atlamalar", en:"Leaps of a fourth, fifth and octave" },
    text:[
      { tr:"Üçlülerden sonra daha geniş atlamalar: dizinin her basamağından dörtlüye, beşliye ya da oktava sıçrayıp sonraki basamağa dönersin. Atlamalar parmakların birlikte inip kalkmasını ve havanın her iki notayı da taşımasını ister.",
        en:"After thirds come wider leaps: from every step of the scale you jump a fourth, a fifth or an octave and come back to the next step. Leaps demand that the fingers move together and that the air carries both notes." },
      { tr:"Oktav atlamalarında pes bölgeden klarino bölgesine geçersin: register mandalı ile başparmak birlikte, dudak sıkmadan.",
        en:"In octave leaps you cross from the low register into the clarion: register key and thumb together, without pinching." }
    ],
    tips:[
      { tr:"Üst notayı \"yakalamaya\" çalışma; havayı hızlandır, ağız aynı kalsın.", en:"Don't \"grab\" the top note; speed up the air and keep the mouth the same." }
    ],
    steps:[
      ...techSteps({ type:"leaps", base:60, mode:"major", iv:4, sub:2, art:"legato" }, 60, 80),
      ...techSteps({ type:"leaps", base:60, mode:"major", iv:5, sub:2, art:"legato" }, 60, 80),
      ...techSteps({ type:"leaps", base:55, mode:"major", iv:8, sub:2, art:"legato" }, 50, 72)
    ] });

// ---- S3.1 + S3.3 Makam ikinci dersleri ----
// Her temel makama "cümle, karar ve eser" dersi (<makam>-2, makam dersinin hemen arkasında). Kalıp (docs/BACKLOG.md S3.3):
// read (karar yolu, MAKAMS seyir metni) + soru ×3 (durak, güçlü, yeden) → notes ×3 karar kalıbı (learn.js makamCadences,
// diziden üretilir) → seyir çeşni 30 sn → ear makam (makam + similarMakams; Segâh ve Hüzzam'da benzer yok, aynı duraklı
// makam) → etüt (S3.1 etüdü ya da var olan etüt bir üst tempoda) → arşivden eser (scripts/eser-sec.js, telifsiz, asıl
// yerinde). Segâh ve Hüzzam'da icra perdesi notu ICRA_INFO'dan üretilir.
// Veri yalnız learn.js'ten okunur (tarayıcıda lessons.js'ten önce yüklenir); repertoire.js ve skills.js çağrılmaz.
const M2_PERDE = c => LLEARN.perdeName(c);
const M2_KOMA = (x, en) => en ? String(x) : String(x).replace(".", ",");
function makamIcraNote(mk){
  const info = LLEARN.ICRA_INFO[mk.id] || {}, ks = Object.keys(info);
  if(!ks.length) return { tr:"Akort ekranındaki “icra” ayarında " + mk.name + " makamı için kaynaklı bir düzeltme yok: perdeler AEU değerinde ölçülür. Durak perdesini göstergede izle.",
    en:"The “practice” tuning on the Tuner screen has no sourced adjustment for makam " + mk.name + ": perdes are measured at their AEU values. Watch the final on the display." };
  const parts = ks.map(k => { const f = info[k], p = M2_PERDE(+k), up = f.range[0] > 0;
    return { tr: p + " AEU değerinden " + M2_KOMA(Math.abs(f.range[0])) + "–" + M2_KOMA(Math.abs(f.range[1])) + " koma " + (up ? "tiz" : "pes") + " basılır (" + f.src + ")",
             en: p + " is played " + M2_KOMA(Math.abs(f.range[0]), 1) + "–" + M2_KOMA(Math.abs(f.range[1]), 1) + " commas " + (up ? "higher" : "lower") + " than its AEU value (" + f.src + ")" }; });
  return { tr:"İcra perdesi: " + parts.map(x => x.tr).join("; ") + ". Akort ekranında “icra”yı seçersen uygulama bu düzeltmeyle ölçer; yaklaşıktır, icracıya ve ezgiye göre değişir.",
           en:"Practice pitch: " + parts.map(x => x.en).join("; ") + ". Choose “practice” on the Tuner screen and the app measures with this adjustment; it is approximate and varies with the player and the melody." };
}
function makamSecond(mk, o){
  const m = LLEARN.makamById(mk), D = M2_PERDE(m.durak), G = M2_PERDE(m.guclu), Y = M2_PERDE(m.yeden);
  const cad = LLEARN.makamCadences(m);
  const scale = [...new Set([...m.asc, ...m.desc])].sort((a, b) => a - b);
  const fourth = M2_PERDE(scale.find(c => ![m.durak, m.guclu, m.yeden].includes(c)));
  const opts = [D, G, Y, fourth].map(x => ({ tr:x, en:x }));
  const q = (tr, en, ok, why) => ({ q:{ tr, en }, opts, ok, why });
  const sim = LLEARN.similarMakams(m, 2).slice(0, 3).map(x => x.mk.id);
  const pool = [mk, ...(sim.length ? sim : LLEARN.MAKAMS.filter(x => x.id !== mk && x.durak === m.durak).slice(0, 3).map(x => x.id))];
  const etude = o.etude || { type:"piece", id:"e-" + mk, mode:"tempo", min:75, tempo:o.tempo };
  return { id: mk + "-2", unit:"makam", since:2, notes:[], makam:mk,
    title:{ tr: m.name + ": cümle, karar ve eser", en: m.name + ": phrase, cadence and piece" },
    text:[
      { tr:"İlk " + m.name + " dersinde diziyi öğrendin. Bu derste makamın nasıl cümle kurup karar verdiğini çalışacaksın: önce karar yolu, sonra üç kısa karar kalıbı, çeşnide serbest çalma, kulakla benzer makamdan ayırma, etüt ve en sonda arşivden gerçek bir eser.",
        en:"In the first " + m.name + " lesson you learned the scale. In this one you work on how the makam builds phrases and cadences: first the path to the final, then three short cadence patterns, free playing in the çeşni, telling it apart from a similar makam by ear, an étude and finally a real piece from the archive." },
      ...o.text,
      ...(o.icra ? [makamIcraNote(m)] : [])
    ],
    tips: o.tips || [],
    steps:[
      { type:"read", title:{ tr:"Karar yolu", en:"The path to the final" }, body:[
        { tr: LLEARN.seyirText(m, "tr"), en: LLEARN.seyirText(m, "en") },
        { tr:"Durak " + D + ", güçlü " + G + ", yeden " + Y + ". Cümleler güçlüde yarım kararla dinlenir; durağa çoğu zaman yedenden ya da üstten adım adım inilerek varılır. Sıradaki üç kalıp bu perdelerden kuruldu.",
          en:"Final " + D + ", dominant " + G + ", leading tone " + Y + ". Phrases rest on the dominant with a half cadence; the final is usually reached from the leading tone or by stepping down from above. The next three patterns are built from these perdes." }
      ] },
      { type:"soru", items:[
        q(m.name + " makamının durağı hangi perde?", "Which perde is the final of makam " + m.name + "?", 0,
          { tr:"Durak " + D + ": ezgi orada biter.", en:"The final is " + D + ": the melody ends there." }),
        q(m.name + " makamının güçlüsü hangi perde?", "Which perde is the dominant of makam " + m.name + "?", 1,
          { tr:"Güçlü " + G + ": yarım kararlar orada verilir.", en:"The dominant is " + G + ": half cadences land there." }),
        q(m.name + " makamında yeden hangi perde?", "Which perde is the leading tone in makam " + m.name + "?", 2,
          { tr:"Yeden " + Y + ": durağın hemen altında, karara götürür.", en:"The leading tone is " + Y + ": just below the final, it leads into the cadence." })
      ], min:2 },
      ...cad.map(k => ({ type:"notes", commas:k.commas, maxMiss:2, hint:k.name })),
      { type:"seyir", makam:mk, sec:30, min:60, focus:"cesni" },
      { type:"ear", mode:"makam", pool, n:6, min:4 },
      ...(o.etudeFree ? [{ type:"piece", id:"e-" + mk, mode:"free", min:5 }] : []),
      etude,
      ...eserSteps(o.eser.id, o.eser.name, o.eser.parts, { to:o.eser.to })
    ] };
}
const M2_ESER = (id, tr, parts, to) => ({ id, name:{ tr, en:tr }, parts, to });
const M2_EVERY = { tr:"Eser asıl yerinde, klarino bölgesinde çalınır. Önce bölüm bölüm dinle ve yavaş tempoda serbest takiple çal; en sonda tamamı %80 ve kendi temposunda.",
  en:"The piece is played at its real pitch, in the clarion register. Listen section by section and play it slowly in follow mode; at the end the whole piece at 80% and at its own tempo." };
const MAKAM_SECOND = [
  makamSecond("rast", { tempo:88, eser:M2_ESER("rast--nefes--bektasidevrirevani--al_dokeyim--", "Al Dökeyim Gevheri", [[1, 3], [4, 6]]),
    text:[{ tr:"Eser anonim bir Bektaşî nefesi, Bektâşî Devr-i Revânı usulünde (13/8): ölçüyü 13 sekizlik say. " + M2_EVERY.tr, en:"The piece is an anonymous Bektashi nefes in the usul Bektâşî Devr-i Revânı (13/8): count 13 eighths to the bar. " + M2_EVERY.en }] }),
  makamSecond("ussak", { tempo:88, eser:M2_ESER("ussak--turku--devrisureyyasofyani--su_dereden--", "Şu Dereden Gece Geçtim", [[1, 5], [6, 11]]),
    text:[{ tr:"Eser anonim bir türkü, Devr-i Süreyyâ Sofyanı usulünde (10/16). " + M2_EVERY.tr, en:"The piece is an anonymous türkü in the usul Devr-i Süreyyâ Sofyanı (10/16). " + M2_EVERY.en }] }),
  makamSecond("huseyni", { tempo:88, eser:M2_ESER("huseyni--seyir--semai--1--rauf_yekta", "Hüseynî Seyir", [[1, 16], [17, 32]]),
    text:[{ tr:"Eser Rauf Yektâ'nın Hüseynî seyri, Semâî usulünde (3/4): makamın gezinişini kısa bir ezgide gösterir. " + M2_EVERY.tr, en:"The piece is Rauf Yektâ's Hüseynî seyir in Semâî (3/4): it shows how the makam moves in a short melody. " + M2_EVERY.en }] }),
  makamSecond("hicaz", { tempo:84, eser:M2_ESER("hicaz--ninni--yuruksofyan--dere_dibi--", "Dere Dibi Saz Olur", [[1, 11], [12, 22]]),
    text:[{ tr:"Eser anonim bir ninni, Yürük Sofyan usulünde (2/4). " + M2_EVERY.tr, en:"The piece is an anonymous lullaby in Yürük Sofyan (2/4). " + M2_EVERY.en }] }),
  makamSecond("nihavend", { tempo:88, eser:M2_ESER("nihavent--mars--sofyan--yilmam_olumden--ali_rifat_cagatay", "Yılmam Ölümden", [[1, 11], [12, 22]]),
    text:[{ tr:"Eser Ali Rıfat Çağatay'ın bir marşı, Sofyan usulünde (4/4). " + M2_EVERY.tr, en:"The piece is a march by Ali Rıfat Çağatay in Sofyan (4/4). " + M2_EVERY.en }] }),
  makamSecond("kurdi", { tempo:88, eser:M2_ESER("kurdi--kupe--musemmen--asik-i--ahmet_avni_konuk", "Âşık-ı Dilhasteye Rahmeyle", [[1, 4], [5, 8]]),
    text:[{ tr:"Eser Ahmet Avni Konuk'un bir küpesi, Müsemmen usulünde (8/8). " + M2_EVERY.tr, en:"The piece is a küpe by Ahmet Avni Konuk in Müsemmen (8/8). " + M2_EVERY.en }] }),
  makamSecond("saba", { tempo:80, eser:M2_ESER("saba--turku--nimsofyan--pinar_basi--", "Pınar Başı Burma Burma", [[1, 18], [19, 34]], 34),
    text:[{ tr:"Eser anonim bir türkü, Nîm Sofyan usulünde (2/4); ilk sekiz ölçüsünü Usul 3 dersinde çaldın. Burada ilk kıtanın tamamı (34 ölçü; ikinci kıta aynı ezgi). " + M2_EVERY.tr, en:"The piece is an anonymous türkü in Nîm Sofyan (2/4); you played its first eight bars in Usul 3. Here the whole first verse (34 bars; the second verse has the same tune). " + M2_EVERY.en }] }),
  makamSecond("segah", { tempo:80, icra:true, eser:M2_ESER("segah--turku--ciftesofyan--bir_findigin--", "Bir Fındığın İçini", [[1, 12], [13, 24]], 24),
    text:[{ tr:"Eser anonim bir türkü, Çifte Sofyan usulünde (9/8); burada ilk kıta (24 ölçü; ikinci kıta aynı ezgi). " + M2_EVERY.tr, en:"The piece is an anonymous türkü in Çifte Sofyan (9/8); here the first verse (24 bars; the second verse has the same tune). " + M2_EVERY.en }] }),
  makamSecond("huzzam", { tempo:80, icra:true, eser:M2_ESER("huzzam--seyir--semai--1--rauf_yekta", "Hüzzam Seyir", [[1, 16], [17, 32]]),
    text:[{ tr:"Eser Rauf Yektâ'nın Hüzzam seyri, Semâî usulünde (3/4): makamın gezinişini kısa bir ezgide gösterir. " + M2_EVERY.tr, en:"The piece is Rauf Yektâ's Hüzzam seyir in Semâî (3/4): it shows how the makam moves in a short melody. " + M2_EVERY.en }] }),
  makamSecond("karcigar", { etudeFree:true, etude:{ type:"piece", id:"e-karcigar", mode:"tempo", min:75 },
    eser:M2_ESER("karcigar--mandra--devrituran--karadeniz_oyunhavasi--", "Karadeniz Oyunhavası", [[1, 12], [13, 24]], 24),
    text:[{ tr:"Karcığar, Trakya ve Roman oyun havalarında da öne çıkan makamlardandır; bu dersteki Karcığar etüdü o ünitede işine yarar. Eser anonim bir Karadeniz oyun havası (mandra), Devr-i Turan usulünde (7/8); burada ilk yarısı (24 ölçü; ikinci yarı aynı ezgi). " + M2_EVERY.tr,
      en:"Karcığar is also one of the leading makams of Thracian and Romani dance tunes; the Karcığar étude in this lesson helps you in that unit. The piece is an anonymous Black Sea dance (mandra) in Devr-i Turan (7/8); here the first half (24 bars; the second half has the same tune). " + M2_EVERY.en }] })
];
for(const l of MAKAM_SECOND) insertLessonAfter(l.makam, l);
// S3.1: S3.3 dışında kalan dokuz makamın etüdü o makam dersinin SONUNA (kural 1; eski kullanıcıda ders "4/5" görünür)
for(const mk of ["bayati", "humayun", "uzzal", "zirguleli", "suzinak", "hicazkar", "kurdilihicazkar", "mahur", "acemasiran"]){
  const l = LESSONS.find(x => x.id === mk);
  if(l && !l.steps.some(s => s.id === "e-" + mk)) l.steps.push({ type:"piece", id:"e-" + mk, mode:"tempo", min:65 });
}
{ const t = LESSONS.find(x => x.id === "trakya-giris");
  if(t) t.tips.push({ tr:"Karcığar'ın etüdü Makamlar'daki “Karcığar: cümle, karar ve eser” dersinde.", en:"The Karcığar étude is in the Makams lesson “Karcığar: phrase, cadence and piece”." }); }

// ---- S2.6 Ton ve dinamik 2 ----
// Hafif ve güçlüde perde sabit kalsın: messa di voce üç bölgede, perde ±1 koma (dynamicsEval). Yankı çalışması ses
// gücünü ölçmez (uygulama bir cümlenin ses gücünü değerlendirmiyor); yönergeli serbest takiptir
insertLessonAfter("ses-kalitesi", { id:"dinamik-2", unit:"teknik", since:2, notes:[],
  title:{ tr:"Dinamik 2: hafifte ve güçlüde perde", en:"Dynamics 2: pitch when soft and loud" },
  text:[
    { tr:"Klarnette ses açıldıkça ya da kısıldıkça perde kayar. Bu derste aynı notayı hafiften güçlüye ve yeniden hafife götürürken perdeyi ±1 koma içinde tutacaksın: pes Mi3'te, orta Sol4'te ve klarino Sol5'te.",
      en:"On the clarinet the pitch drifts as the sound grows or fades. In this lesson you take one note from soft to loud and back while keeping the pitch within ±1 comma: on low E3, middle G4 and clarion G5." },
    { tr:"Ses güçlenirken dudağı sıkma, havayı artır; hafiflerken havayı kesme, yalnız azalt. Akort ekranında sapmayı izleyerek de çalışabilirsin.",
      en:"As the sound grows, don't bite: add air. As it fades, don't cut the air, just reduce it. You can also practise watching the deviation on the tuner." }
  ],
  tips:[{ tr:"Perde kayıyorsa önce aralığı daralt: daha az güçlen, daha az hafifle; sonra yavaş yavaş genişlet.", en:"If the pitch drifts, narrow the range first: less loud, less soft; then widen it gradually." }],
  steps:[
    { type:"dynamics", note:67, sec:8, shape:"messa", drift:2 },
    { type:"dynamics", note:52, sec:8, shape:"messa", drift:2 },
    { type:"dynamics", note:79, sec:8, shape:"messa", drift:2 },
    { type:"read", title:{ tr:"Yankı", en:"Echo" }, body:[
      { tr:"Aynı ezgiyi önce güçlü (f), sonra yankı gibi hafif (p) çal. Uygulama burada ses gücünü ölçmez, notaları takip eder; farkı kendi kulağınla, istersen kaydedip dinleyerek değerlendir.",
        en:"Play the same tune first loud (f), then softly like an echo (p). Here the app doesn't measure loudness, it follows the notes; judge the difference by ear, or record yourself and listen." }
    ] },
    { type:"piece", id:"e-iki-el", mode:"free", min:4, cue:{ tr:"güçlü (f)", en:"loud (f)" } },
    { type:"piece", id:"e-iki-el", mode:"free", min:4, cue:{ tr:"yankı, hafif (p)", en:"echo, soft (p)" } }
  ] });

// ---- S4.6 Kulaktan çalma ----
// Üç basamak: Temeller sonunda makamsız taklit (mimic notes, pes bölge), Makamlar ortasında makam cümlesi (len:6), İleri'de
// arşivden bir eserin ilk 8 ölçüsü nota gizli (listen hidden → piece hidden; çalış bitince nota açılır, farklar işaretli).
// Ders sonu Kulaktan çıkar aracına bağlanır (endLink; lessonview.js renderNext).
const KULAK_LINK = { tab:"kulaktan", label:{ tr:"Kulaktan çıkar aracını aç", en:"Open the Learn by ear tool" },
  text:{ tr:"Sıradaki adım: sevdiğin bir kaydı Kulaktan çıkar'da yavaşlat, bir cümleyi döngüye al ve aynı yoldan çıkar.",
         en:"Next: slow down a recording you like in Learn by ear, loop one phrase and work it out the same way." } };
insertLessonAfter("ilk-eserler-2", { id:"kulak-ezgi-1", unit:"temel", since:2, notes:[], endLink:KULAK_LINK,
  title:{ tr:"Kulaktan çalma 1: duy ve çal", en:"Playing by ear 1: hear it, play it" },
  text:[
    { tr:"Türk müziği yüzyıllarca kulaktan öğrenildi: usta çalar, çırak dinler ve aynısını çalar. Bu derste uygulama pes bölgeden 3–4 notalık kısa bir cümle çalar; notası görünmez, sen duyduğunu klarnetle çalarsın. Doğru çaldıkça cümle bir nota uzar.",
      en:"Turkish music was learned by ear for centuries: the master plays, the apprentice listens and plays it back. In this lesson the app plays a short 3–4 note phrase in the low register; you don't see the notes, you play what you hear on the clarinet. Each time you get it right, the phrase grows by one note." },
    { tr:"Önce ilk notayı bul: ilk nota çoğu zaman Sol, La ya da Si'dir. Sonra her notanın bir öncekinden ince mi kalın mı olduğunu dinle; cümleler çoğunlukla komşu notalara adım adım gider.",
      en:"Find the first note first: it's usually G, A or B. Then listen whether each note is higher or lower than the one before; the phrases mostly move step by step to neighbouring notes." }
  ],
  tips:[
    { tr:"Çalmadan önce cümleyi içinden ya da sesli söyle; söyleyebildiğin cümleyi çalmak kolaydır.", en:"Sing the phrase in your head or out loud before you play; a phrase you can sing is easy to play." },
    { tr:"Yanlış nota da bilgi verir: uygulama doğrusunu gösterir, yeni cümlede aynı aralığa dikkat et.", en:"A wrong note teaches too: the app shows the right one; watch for the same interval in the next phrase." }
  ],
  steps:[
    { type:"listen", notes:[55, 57, 59, 60, 59, 57, 55] },
    { type:"mimic", notes:[55, 57, 59, 60], len:3 },
    { type:"mimic", notes:[52, 53, 55, 57, 59, 60], len:4 }
  ] });
insertLessonAfter("nihavend-2", { id:"kulak-ezgi-2", unit:"makam", since:2, notes:[], endLink:KULAK_LINK,
  title:{ tr:"Kulaktan çalma 2: makam cümlesi", en:"Playing by ear 2: a makam phrase" },
  text:[
    { tr:"Artık beş makamın dizisini biliyorsun. Bu derste uygulama Rast, Hicaz ve Nihâvend dizilerinden cümleler çalar ve cümle 6 notaya kadar uzar. Cümlenin hangi makamdan olduğunu bildiğin için perdeler de belli: hangi koma perdesini çalacağını ayrıca düşünmezsin, dizinin perdeleri yeter.",
      en:"You now know the scales of five makams. In this lesson the app plays phrases from the Rast, Hicaz and Nihâvend scales, and they grow up to 6 notes. Since you know which makam the phrase is in, the perdes are fixed too: you don't have to work out which comma perde to play, the scale's perdes are enough." },
    { tr:"Uzun cümlede hepsini birden aklında tutmaya çalışma: iki parçaya böl, önce ilk üç notayı, sonra kalanını düşün. Takılırsan Tekrar dinle'ye bas.",
      en:"Don't try to hold a long phrase all at once: split it in two, think of the first three notes, then the rest. If you get stuck, press Listen again." }
  ],
  tips:[{ tr:"Cümle başlamadan durağı dron yapmak kulağını makama oturtur; cümleyi o sese göre duyarsın.", en:"Setting the tonic as a drone before the phrase settles your ear in the makam; you hear the phrase against that note." }],
  steps:[
    { type:"listen", makam:"rast", commas:[0, 9, 17, 22, 31, 22, 17, 9, 0] },
    { type:"mimic", makam:"rast", len:6 },
    { type:"mimic", makam:"hicaz", len:6 },
    { type:"mimic", makam:"nihavend", len:6 }
  ] });
insertLessonAfter("kulak-2", { id:"kulaktan-eser", unit:"ileri", since:2, notes:[], endLink:KULAK_LINK,
  title:{ tr:"Kulaktan eser: notasız ilk sekiz ölçü", en:"A piece by ear: the first eight bars without the score" },
  text:[
    { tr:"Bu derste arşivden bir eserin ilk 8 ölçüsünü notasına bakmadan öğreneceksin. Eser anonim bir Hicaz türküsü: Bahçelerde Mor Meni. Önce dinle (nota gizli), sonra kulağınla çal. Çalış bitince nota açılır: yeşil doğru, kırmızı yanlış perde, soluk olanlar kaçırdığın notalar.",
      en:"In this lesson you learn the first 8 bars of a piece from the archive without looking at the score. The piece is an anonymous Hicaz türkü: Bahçelerde Mor Meni. Listen first (score hidden), then play it by ear. When you finish the score opens: green is right, red a wrong pitch, faded notes are the ones you missed." },
    { tr:"Dinlerken üç şeyi yakala: ezginin başladığı perde, cümlenin çıktığı en tiz perde ve karar perdesi. Hicaz Dügâh'ta karar verir; arada Dik Kürdî ile Nim Hicaz arasındaki geniş aralığın rengini duyacaksın. Son adımda aynı ölçüleri nota açık, kendi temposunda çalıp farkları düzeltirsin.",
      en:"While listening, catch three things: the perde where the tune starts, the highest perde of the phrase and the final perde. Hicaz cadences on Dügâh; in between you'll hear the colour of the wide step between Dik Kürdî and Nim Hicaz. In the last step you play the same bars with the score open at full tempo and fix the differences." }
  ],
  tips:[{ tr:"İlk dinlemede çalma; ikinci dinlemede parmaklarını sessizce hareket ettir.", en:"Don't play on the first listen; on the second, move your fingers silently." }],
  steps:[
    { type:"listen", arsiv:"hicaz--turku--nimsofyan--bahcelerde_mor--istanbul", name:{ tr:"Bahçelerde Mor Meni", en:"Bahçelerde Mor Meni" }, from:1, to:8, hidden:true },
    { type:"piece", arsiv:"hicaz--turku--nimsofyan--bahcelerde_mor--istanbul", name:{ tr:"Bahçelerde Mor Meni", en:"Bahçelerde Mor Meni" }, from:1, to:8, tempoPct:80, hidden:true, mode:"tempo", min:60 },
    { type:"piece", arsiv:"hicaz--turku--nimsofyan--bahcelerde_mor--istanbul", name:{ tr:"Bahçelerde Mor Meni", en:"Bahçelerde Mor Meni" }, from:1, to:8, mode:"tempo", min:75 }
  ] });

// ---- S2.5 Nefes 2 ve 3 ----
// nefes-2 (Teknik, uzun-ton'dan sonra): uzayan uzun tonlar ve nefes yeri işaretli etüt e-nefes (etüt metninde ' nefes yeri,
// çizimde virgül). Bilgi nefes-cumle dersinden ve sorunlar.js "nefes" maddesinden. nefes-3 (İleri, ünitenin sonu) sürekli
// nefes: optional, kapı değil (unlocked zinciri, ünite sınavı, nextLesson, hoca kartı ve aşama sayımı onu atlar).
// Kaynaklar: DANSR "Circular Breathing 101" (Greg Oakes, 2017) ve Wikipedia "Circular breathing" (docs/KAYNAKLAR.md §10).
insertLessonAfter("uzun-ton", { id:"nefes-2", unit:"teknik", since:2, notes:[],
  title:{ tr:"Nefes 2: uzun cümleler ve nefes yeri", en:"Breath 2: long phrases and breathing spots" },
  text:[
    { tr:"Başlarken'deki nefes dersinin devamı. Cümleler uzadıkça nefesi plânlamak gerekir: nereden alacağını çalmadan önce seç. Nefes yeri notada dizeğin üstünde küçük bir virgülle (’) işaretlenir; genellikle uzun bir notadan sonra ya da cümle sonundadır.",
      en:"A follow-up to the breathing lesson in Getting started. The longer the phrases, the more you need to plan your breath: choose where you will breathe before you play. A breathing spot is marked with a small comma (’) above the staff, usually after a long note or at the end of a phrase." },
    { tr:"Önce uzun tonlar 12, 16 ve 20 saniyeye uzar. Havayı ince ve eşit ver: sesin başında hepsini harcama. Sonra etüt: dört cümlesi 4, 8, 12 ve 16 vuruş sürer, her cümlenin sonunda virgül var. Nefesin zamanını virgülden önceki son notadan al (o notayı biraz kısa kes), sonraki cümle vuruşunda başlasın; ritim kaymasın.",
      en:"First the long tones grow to 12, 16 and 20 seconds. Blow a thin, even stream: don't spend it all at the start. Then the étude: its four phrases last 4, 8, 12 and 16 beats, each ending with a comma. Take the time for the breath from the last note before the comma (cut it a little short) so the next phrase starts on the beat; don't let the rhythm slip." }
  ],
  tips:[
    { tr:"Klarnetsiz alıştırma: metronom 60'ta 4 vuruş nefes al, sonra 8, 12, 16 vuruş boyunca ince ve eşit üfle.", en:"Without the clarinet: at 60 bpm, breathe in for 4 beats, then blow a thin even stream for 8, 12, 16 beats." },
    { tr:"Nefesi ağızdan, hızlı ve zorlamadan al; omuzlar kalkmasın, alt kaburgalar genişlesin.", en:"Breathe in through the mouth quickly and without forcing; shoulders stay down, lower ribs widen." }
  ],
  steps:[
    { type:"hold", note:67, sec:12, min:50 },
    { type:"hold", note:62, sec:16, min:50 },
    { type:"hold", note:67, sec:20, min:50 },
    { type:"piece", id:"e-nefes", mode:"free", min:4 },
    { type:"piece", id:"e-nefes", mode:"tempo", min:70 }
  ] });
insertLessonAfter([...LESSONS].reverse().find(l => l.unit === "ileri").id, { id:"nefes-3", unit:"ileri", since:2, optional:true, notes:[],
  title:{ tr:"Sürekli nefes", en:"Circular breathing" },
  text:[
    { tr:"Sürekli nefes (döngüsel nefes), bazı nefesli çalgı icracılarının sesi kesmeden çalmak için kullandığı bir tekniktir: yanaklarda biriktirilen hava ağızdan verilirken burundan nefes alınır. Zurnada çok kullanılır; klarnet de bu tekniğin kullanıldığı çalgılar arasında sayılır.",
      en:"Circular breathing is a technique some wind players use to play without breaking the sound: you breathe in through the nose while pushing out, through the mouth, air stored in the cheeks. It is used a great deal on the zurna, and the clarinet is among the instruments it is used on." },
    { tr:"Nasıl işler: ciğerler boşalmaya yakınken son havanın bir kısmıyla yanakları şişir. Yanakları sıkarak bu havayı verirken, ağızdaki hava bitmeden burundan hızla nefes al; sonra yeniden ciğerlerden ver ve döngüyü tekrarla.",
      en:"How it works: when the lungs are nearly empty, puff the cheeks with part of the last air. While squeezing that air out with the cheeks, breathe in quickly through the nose before the mouth air runs out; then blow from the lungs again and repeat the cycle." },
    { tr:"Bu ders isteğe bağlıdır: hiçbir dersi ya da sınavı kilitlemez, hoca kartı da önermez. Önce bardak ve pipetle, sonra yalnız ağızlıkla, en son klarnetle çalış.",
      en:"This lesson is optional: it locks no lesson or test and the coach card doesn't suggest it. Practise with a glass and straw first, then on the mouthpiece alone, and only then on the clarinet." }
  ],
  tips:[
    { tr:"Burundan nefes alırken yanaklardan hava vermeyi önce pipetsiz ve susuz dene; ilk denemede su çekmezsin.", en:"Try breathing in through the nose while pushing air from the cheeks without the straw and water first, so you don't draw in water on the first try." }
  ],
  steps:[
    { type:"read", title:{ tr:"Bardak ve pipet", en:"Glass and straw" }, body:[
      { tr:"Bir bardağa 2,5–5 cm su koy, pipeti daldır. 1) Normal nefesle kabarcık üfle. 2) Yanakları şişir ve yalnız yanaktaki havayı pipetten ver; ciğerlerden hava gelmesin. 3) Normal hava ile yanak havasını sırayla, arada durarak birkaç kez değiştir. 4) Aynısını durmadan yap.",
        en:"Put 2.5–5 cm (1–2 inches) of water in a glass and dip a straw in. 1) Blow bubbles with normal air. 2) Puff the cheeks and push only the cheek air through the straw, with no air from the lungs. 3) Alternate normal air and cheek air a few times, pausing in between. 4) Do the same without pausing." },
      { tr:"5) Yanak havasını verirken burundan nefes al (önce pipetsiz ve susuz). 6) Yanaktan verirken burundan alarak normal hava ile yanak havası arasında, önce durarak, sonra durmadan geç. Asıl adım bu: kabarcıklar hiç kesilmesin. 7) Kabarcıklar kesintisiz akınca aynı hareketi yalnız ağızlıkla (kamışlı) yap, sonra klarnetle.",
        en:"5) Breathe in through the nose while pushing out the cheek air (first without straw and water). 6) Switch between normal air and cheek air while breathing in through the nose, first with pauses, then without. This is the key step: the bubbles never stop. 7) Once the bubbles flow without a break, do the same motion on the mouthpiece (with reed) alone, then on the clarinet." }
    ] },
    { type:"hold", note:67, sec:30, min:100, cont:true }
  ] });

// ---- S2.2 Artikülasyon 2 ----
// Bağlı, kesik ve tenuto çalış (artik adımı, skills.js artikEval). Dizi Sol4–Re5 çıkış ve iniş, her vuruşta bir nota.
// "Türk klarnet tavrında bağlı çalış baskındır" cümlesi kaynakla doğrulanamadı (KAYNAKLAR.md'de yok): metne konmadı.
{ const SEQ = [67, 69, 71, 72, 74, 72, 71, 69, 67];
  insertLessonAfter("artikulasyon", { id:"artikulasyon-2", unit:"teknik", since:2, notes:[],
    title:{ tr:"Artikülasyon 2: bağlı, kesik, tenuto", en:"Articulation 2: slurred, staccato, tenuto" },
    text:[
      { tr:"Dil vuruşu notayı başlatır; artikülasyon ise notaların birbirine nasıl bağlandığıdır. Bağlı (legato) çalışta yalnız ilk nota dille başlar, sonrakilere hava kesilmeden yalnız parmaklar geçer. Kesik (staccato) çalışta her nota dille başlar ve kısa kesilir: notanın ardından sessizlik kalır. Tenuto'da her nota dille başlar ama tam süresince tutulur.",
        en:"Tonguing starts a note; articulation is how notes join. Slurred (legato): only the first note is tongued and the fingers move on without stopping the air. Staccato: every note is tongued and stopped short, leaving a silence after it. Tenuto: every note is tongued but held for its full length." },
      { tr:"Notada bağ yayı (notaların üstünde eğri) bağlı, nota başının yanındaki nokta kesik, kısa yatay çizgi tenuto demektir. Bu uygulamada hız dizileri ve süslemeler bağlı çalınır; dille ayırma notaları belirginleştirir. Hangisinin nerede kullanılacağı esere ve icracıya göre değişir: dinlediğin kayıtlarda bağlı ve kesik yerleri ayırt etmeye çalış.",
        en:"In notation a slur (a curve over the notes) means slurred, a dot by the note head staccato, a short horizontal line tenuto. In this app the speed scales and ornaments are slurred; tonguing makes notes stand out. Where to use which depends on the piece and the player: try to hear the slurred and detached places in the recordings you listen to." },
      { tr:"Uygulama her notanın vuruşunun ne kadarında ses olduğunu ve notalar arasında sesin kesilip kesilmediğini ölçer. Bağlıda ses vuruşun en az %85'inde sürmeli ve notalar arasında kopmamalı; kesikte vuruşun en çok %60'ında ses olmalı ve her notadan sonra sessizlik kalmalı. Puanın %40'ı doğru nota, %60'ı çalışı tutan nota. Ölçüm yankılı odada zorlaşır: kesik çalışta notanın kuyruğu odada uzar.",
        en:"The app measures how much of each beat is sounding and whether the sound breaks between notes. Slurred: sound for at least 85% of the beat with no break between notes; staccato: sound for at most 60% of the beat with a silence after every note. 40% of the score is correct notes, 60% notes with the right articulation. Echoing rooms make it harder: in staccato the room stretches each note's tail." }
    ],
    tips:[
      { tr:"Kesikte havayı durdurma: hava dilin arkasında hazır beklesin, dil kamışa dokunarak sesi kessin (\"tut\").", en:"In staccato don't stop the air: keep it ready behind the tongue and stop the sound by touching the reed (\"tut\")." },
      { tr:"Bağlıda parmaklar birlikte ve tam zamanında insin; geç kalan parmak araya istenmeyen bir nota sokar.", en:"When slurring, move the fingers together and on time; a late finger slips an unwanted note in between." }
    ],
    steps:[
      { type:"read", title:{ tr:"Bağlı, kesik, tenuto", en:"Slurred, staccato, tenuto" },
        body:[{ tr:"Önce \"Örneği dinle\" ile her adımın örneğini dinle: bağlıda sesler birbirine akar, kesikte notalar arasında sessizlik duyulur. Sayımdan sonra her vuruşta bir nota çal. Kesik çalışta notayı nefesle değil dille kes.",
               en:"Listen to each step with \"Hear example\" first: in legato the sounds flow into each other, in staccato you hear silence between the notes. After the count-in play one note per beat. In staccato stop the note with the tongue, not the breath." }] },
      { type:"artik", notes:SEQ, style:"legato", tempo:60, min:70 },
      { type:"artik", notes:SEQ, style:"staccato", tempo:60, min:70 },
      { type:"artik", notes:SEQ.slice(0, 8), style:["legato", null, "staccato", "staccato"], tempo:60, min:70 },
      { type:"piece", id:"e-artik", mode:"tempo", min:65 }
    ] });
}

// ---- S3.6 Formlar ----
// Metin ve sorular teori.js "form" konusundan (S3.8 yardımcıları). Örnek: III. Selim'in Pesendîde saz semâîsi; SymbTr'nin
// bölüm işaretlerine göre 1. hane ölçü 1–5, teslim 5–6, 4. hane 19–27 (Yürük Semâî II, 6/8), teslim 27–28 (Aksak Semâî)
const PESENDIDE = { arsiv:"pesendide--sazsemaisi--aksaksemai----iii_selim", name:{ tr:"Pesendîde Saz Semâîsi (III. Selim)", en:"Pesendîde Saz Semâîsi (Selim III)" } };
insertLessonAfter(LESSONS[LESSONS.findIndex(l => l.id === "makam-bulma") - 1].id, thLesson("formlar", "form", { unit:"makam",
  text:[{ tr:"Arşivde bir eser açınca formunu görürsün: şarkı, türkü, peşrev, saz semâîsi… Her formun kendi bölümleri vardır ve eseri bölüm bölüm çalışmak bu bölümleri tanımakla kolaylaşır.",
          en:"When you open a piece in the archive you see its form: şarkı, türkü, peşrev, saz semâîsi… Each form has its own sections, and learning a piece section by section is easier once you know them." }],
  tips:[{ tr:"Arşivde eser sayfasında form adının yanındaki ⓘ ile o formun kısa açıklamasını açabilirsin.", en:"On a piece page in the archive, the ⓘ next to the form name opens a short description of that form." }],
  steps:[
    thRead("form", [["text", 0], ["text", 1]]),
    thRead("form", [["text", 2], ["text", 3]]),
    thRead("form", [["text", 4], ["text", 5]]),
    thSoruStep("form", 4),
    { type:"listen", ...PESENDIDE, from:1, to:6 },
    { type:"listen", ...PESENDIDE, from:19, to:28 },
    { type:"soru", items:[
      { q:{ tr:"Dinlediğin saz semâîsinde 4. hane hangi ölçüdeydi?", en:"In the saz semâîsi you heard, what metre was the 4th hane in?" },
        opts:[{ tr:"6/8 (Yürük Semâî)", en:"6/8 (Yürük Semâî)" }, { tr:"10/8 (Aksak Semâî)", en:"10/8 (Aksak Semâî)" }, { tr:"4/4 (Sofyan)", en:"4/4 (Sofyan)" }], ok:0,
        why:{ tr:"İlk üç hane Aksak Semâî (10/8), 4. hane Yürük Semâî (6/8); teslimle Aksak Semâî'ye dönülür.", en:"The first three hanes are Aksak Semâî (10/8), the 4th hane Yürük Semâî (6/8); the teslim returns to Aksak Semâî." } },
      { q:{ tr:"Teslim (mülâzime) her haneden sonra nasıl gelir?", en:"How does the teslim (mülâzime) come after each hane?" },
        opts:[{ tr:"Hep aynı nağmeyle", en:"Always with the same music" }, { tr:"Her seferinde başka makamda", en:"In a different makam each time" }, { tr:"Yalnız eserin sonunda bir kez", en:"Only once, at the end" }], ok:0,
        why:{ tr:"Teslim her haneden sonra değişmeden gelir ve ilk makamda karar verir.", en:"The teslim returns unchanged after each hane and cadences in the first makam." } }
    ] }
  ] }));

// ---- S3.4 Geçki ----
// Üç ders (Makamlar sonu, makam-bulma'dan sonra): Rast'ta Sûzinak rengi, Dügâh'ta komşu makamlar, arşiv eserinde geçkiyi
// bulmak. Anlatılan bütün farklar learn.js dizilerinden hesaplanır (makamDiff); "bu makam şuna geçer" türünden gelenek
// bilgisi yazılmadı. Seyir adımı via: geçilen makamın ayıran perdelerine en az iki uğrayış ve ana makamın durağında
// karar (skills.js geckiAnalysis). Eserler scripts/gecki-sec.js ile (telifsiz; ilk iki ölçü makamın dizisinde, sonra
// ölçüden ölçüye arıza değişir, geri dönülür, durakta biter). Veri yalnız learn.js'ten okunur.
{ const P = c => LLEARN.perdeName(c), M = id => LLEARN.makamById(id);
  const diff = (a, b) => LLEARN.makamDiff(M(a), M(b)), names = cs => cs.map(P).join(", ");
  const opt = xs => xs.map(x => ({ tr:x, en:x }));
  const rs = diff("rast", "suzinak");                        // Rast: Hüseynî, Acem · Sûzinak: Hisar
  const uk = diff("ussak", "kurdi"), hu = diff("hicaz", "ussak"), hk = diff("huseyni", "karcigar");
  const gap = 48 - 36;                                       // Sûzinak'ta Hisar–Eviç (koma)
  const GOR = "mahur--sarki--aksak--gor_nitti_cana--dede_efendi", AGY = "hicaz--sarki--senginsemai--agyar_ile--bimen_sen";
  const GORN = { tr:"Gör Nitti Cana", en:"Gör Nitti Cana" }, AGYN = { tr:"Ağyâr İle Sen", en:"Ağyâr İle Sen" };
  insertLessonAfter("makam-bulma",
  { id:"gecki-1", unit:"makam", since:2, notes:[], makam:"rast",
    title:{ tr:"Geçki 1: çeşni değiştirmek", en:"Geçki 1: changing the çeşni" },
    text:[
      { tr:"Bir ezgi kendi makamının dizisiyle başlar, bir süre başka bir makamın perdelerini kullanır, sonra geri dönüp kendi durağında karar verir: buna geçki denir. Geçkide makamın çoğu yerinde kalır; yalnız birkaç perde değişir ve ezginin rengi o perdelerle değişir.",
        en:"A melody starts in its own makam's scale, uses the perdes of another makam for a while, then comes back and resolves on its own final: this is called geçki (modulation). Most of the makam stays in place; only a few perdes change, and the colour of the melody changes with them." },
      { tr:"Bu derslerde yalnız uygulamadaki dizilerden hesaplanan geçkiler var: iki makamın dizisini yan yana koyup hangi perdelerin değiştiğine bakıyoruz. Hangi makamın gelenekte hangi makama geçtiği burada anlatılmıyor; onu eserleri dinleyerek öğrenirsin.",
        en:"These lessons only use modulations computed from the app's scales: we put two makams' scales side by side and look at which perdes change. Which makam traditionally modulates to which is not taught here; you learn that by listening to pieces." },
      { tr:"Rast ile Sûzinak'ın durağı (" + P(0) + ") ve güçlüsü (" + P(31) + ") aynı, alt yarıları da aynı. Nevâ'nın üstü ayrılır: Rast'ta " + names(rs.only) + ", Sûzinak'ta " + names(rs.other) + ". Sûzinak'ta Hisar ile Eviç arasındaki " + gap + " komalık artık ikili, Nevâ üstündeki Hicaz dörtlüsünün rengidir.",
        en:"Rast and Sûzinak share the final (" + P(0) + ") and the dominant (" + P(31) + "), and their lower halves are the same. Above Nevâ they part: Rast has " + names(rs.only) + ", Sûzinak has " + names(rs.other) + ". In Sûzinak the " + gap + "-comma augmented second between Hisar and Eviç is the colour of the Hicaz tetrachord on Nevâ." }
    ],
    tips:[
      { tr:"Geçkiye girerken ve çıkarken güçlüde (Nevâ) bir an dinlen: iki dizinin ortak perdesi kapı gibidir.", en:"Rest briefly on the dominant (Nevâ) going in and coming out: the perde both scales share works like a door." },
      { tr:"Hisar'ı göstergede izle; Hüseynî'ye kayarsa renk Rast'a döner.", en:"Watch Hisar on the display; if it slides up to Hüseynî the colour returns to Rast." }
    ],
    steps:[
      { type:"read", title:{ tr:"Geçki nedir?", en:"What is geçki?" }, body:[
        { tr:"Geçki, ezginin bir süre başka bir makamın perdeleriyle gezinip yeniden kendi makamına dönmesidir. Geçkiyi izlemek için üç şeye bak: hangi perdeler değişti, ezgi ne kadar orada kaldı, geri dönüp kendi durağında karar verdi mi.",
          en:"Geçki is the melody moving for a while with another makam's perdes and then returning to its own makam. To follow it, check three things: which perdes changed, how long the melody stayed there, and whether it came back to resolve on its own final." },
        { tr:"Rast dizisi Nevâ'nın üstünde " + names(rs.only) + " kullanır, Sûzinak dizisi " + names(rs.other) + ". Rast ezgisinde Hisar duyulunca Sûzinak rengine geçilmiş olur; Hüseynî ya da Acem yeniden duyulunca Rast'a dönülmüştür. Sıradaki iki dinleme adımında önce Rast cümlesi, sonra Hisar'a uğrayıp Rast'a dönen cümle var.",
          en:"Above Nevâ the Rast scale uses " + names(rs.only) + ", the Sûzinak scale " + names(rs.other) + ". When Hisar sounds in a Rast melody it has moved into Sûzinak's colour; when Hüseynî or Acem sounds again it is back in Rast. The next two listening steps play a Rast phrase, then a phrase that visits Hisar and returns to Rast." }
      ] },
      { type:"soru", items:[
        { q:{ tr:"Sûzinak'ta Nevâ'nın üstünde Rast'ta olmayan hangi perde var?", en:"Which perde above Nevâ is in Sûzinak but not in Rast?" },
          opts:opt([P(36), P(40), P(17), P(22)]), ok:0, why:{ tr:"Hisar: Sûzinak'ın Nevâ üstündeki Hicaz dörtlüsünün perdesi.", en:"Hisar: the perde of Sûzinak's Hicaz tetrachord on Nevâ." } },
        { q:{ tr:"Rast'tan Sûzinak rengine geçip dönen bir ezgi hangi perdede karar verir?", en:"A melody that moves from Rast into Sûzinak's colour and back resolves on which perde?" },
          opts:opt([P(0), P(31), P(36), P(9)]), ok:0, why:{ tr:"Rast: geçkiden sonra ana makamın durağında karar verilir.", en:"Rast: after the geçki the melody resolves on the main makam's final." } },
        { q:{ tr:"Sûzinak'ta Hisar ile Eviç arası kaç koma?", en:"How many commas lie between Hisar and Eviç in Sûzinak?" },
          opts:opt(["12", "9", "5", "8"]), ok:0, why:{ tr:"12 koma (artık ikili): Hicaz dörtlüsünün rengi.", en:"12 commas (augmented second): the colour of the Hicaz tetrachord." } }
      ], min:2 },
      { type:"listen", makam:"rast", commas:[0, 9, 17, 22, 31, 40, 48, 40, 31, 22, 17, 9, 0] },
      { type:"listen", makam:"rast", commas:[0, 9, 17, 22, 31, 36, 48, 36, 31, 40, 31, 22, 17, 9, 0] },
      { type:"notes", makam:"suzinak", commas:[22, 31, 36, 48, 36, 31], maxMiss:2, hint:{ tr:"Nevâ üstünde Hicaz", en:"Hicaz on Nevâ" } },
      { type:"notes", makam:"rast", commas:[31, 40, 31, 22, 17, 9, 0], maxMiss:2, hint:{ tr:"Rast'a dönüş", en:"back to Rast" } },
      { type:"seyir", makam:"rast", via:"suzinak", sec:60, min:60 }
    ] },
  { id:"gecki-2", unit:"makam", since:2, notes:[], makam:"ussak",
    title:{ tr:"Geçki 2: aynı durakta komşu makam", en:"Geçki 2: a neighbouring makam on the same final" },
    text:[
      { tr:"Uşşak, Hicaz ve Kürdî üçü de Dügâh'ta karar verir ve güçlüleri Nevâ'dır; ayrıldıkları yer Dügâh ile Nevâ arasındaki perdelerdir. Uşşak ile Kürdî arasında tek perde değişir: Uşşak'ta " + names(uk.only) + ", Kürdî'de " + names(uk.other) + ". Hicaz'da Uşşak'ın " + names(hu.other) + " perdeleri yerine " + names(hu.only) + " çalınır.",
        en:"Uşşak, Hicaz and Kürdî all resolve on Dügâh with Nevâ as the dominant; they differ in the perdes between Dügâh and Nevâ. Between Uşşak and Kürdî only one perde changes: Uşşak has " + names(uk.only) + ", Kürdî " + names(uk.other) + ". Hicaz plays " + names(hu.only) + " instead of Uşşak's " + names(hu.other) + "." },
      { tr:"Hüseynî ile Karcığar da Dügâh'ta karar verir. Alt yarıları aynı; Nevâ'nın üstünde Hüseynî'nin " + names(hk.only) + " perdeleri yerine Karcığar'da " + names(hk.other) + " var. Geçki adımlarında ana makamla başla, komşu makamın perdelerine iki kez uğra, sonra ana makamın durağında bitir.",
        en:"Hüseynî and Karcığar also resolve on Dügâh. Their lower halves are the same; above Nevâ, Karcığar has " + names(hk.other) + " where Hüseynî has " + names(hk.only) + ". In the geçki steps start in the main makam, visit the neighbour's perdes twice, then finish on the main makam's final." }
    ],
    tips:[
      { tr:"Kürdî perdesi Segâh'tan dört koma pestir; göstergede ikisini ayırt et.", en:"The Kürdî perde is four commas below Segâh; tell them apart on the display." },
      { tr:"Hicaz'dan Uşşak'a geçerken Çargâh'ı açıkça çal: Segâh ile Dik Kürdî birbirine yakın, Çargâh ile Nim Hicaz arası daha belirgin.", en:"Going from Hicaz to Uşşak, play Çargâh clearly: Segâh and Dik Kürdî are close together, Çargâh and Nim Hicaz are further apart." }
    ],
    steps:[
      { type:"read", title:{ tr:"Dügâh'ta üç dörtlü", en:"Three tetrachords on Dügâh" }, body:[
        { tr:"Uşşak: " + names([9, 17, 22, 31]) + ". Kürdî: " + names([9, 13, 22, 31]) + ". Hicaz: " + names([9, 14, 26, 31]) + ". Üçü de Dügâh'tan Nevâ'ya çıkar; değişen yalnız aradaki perdeler. Her dinleme adımında ana makamla başlayan, komşu dörtlüye uğrayıp geri dönen bir cümle var; ardından aynısını kendin serbestçe çal.",
          en:"Uşşak: " + names([9, 17, 22, 31]) + ". Kürdî: " + names([9, 13, 22, 31]) + ". Hicaz: " + names([9, 14, 26, 31]) + ". All three climb from Dügâh to Nevâ; only the perdes in between change. Each listening step plays a phrase that starts in the main makam, visits the neighbouring tetrachord and comes back; then you play the same freely." }
      ] },
      { type:"soru", items:[
        { q:{ tr:"Uşşak'tan Kürdî'ye geçince hangi perde değişir?", en:"Going from Uşşak to Kürdî, which perde changes?" },
          opts:opt([P(17) + " → " + P(13), P(22) + " → " + P(26), P(31) + " → " + P(36), P(40) + " → " + P(44)]), ok:0,
          why:{ tr:"Segâh yerine Kürdî çalınır; öteki perdeler aynı.", en:"Kürdî is played instead of Segâh; the other perdes stay." } },
        { q:{ tr:"Hicaz'dan Uşşak'a geçince hangi perdeler gelir?", en:"Going from Hicaz to Uşşak, which perdes come in?" },
          opts:opt([names(hu.other), names(hu.only), P(13), P(36)]), ok:0,
          why:{ tr:"Uşşak'ın " + names(hu.other) + " perdeleri Hicaz dizisinde yok.", en:"Uşşak's " + names(hu.other) + " are not in the Hicaz scale." } },
        { q:{ tr:"Hüseynî'den Karcığar'a geçince Nevâ'nın üstünde hangi perde gelir?", en:"Going from Hüseynî to Karcığar, which perde comes in above Nevâ?" },
          opts:opt([names(hk.other), P(40), P(48), P(13)]), ok:0,
          why:{ tr:"Karcığar'da " + names(hk.other) + " var, Hüseynî'nin " + names(hk.only) + " perdeleri yok.", en:"Karcığar has " + names(hk.other) + " and lacks Hüseynî's " + names(hk.only) + "." } }
      ], min:2 },
      { type:"listen", makam:"ussak", commas:[9, 17, 22, 31, 22, 13, 9, 13, 22, 31, 22, 17, 9] },
      { type:"seyir", makam:"ussak", via:"kurdi", sec:60, min:60 },
      { type:"listen", makam:"hicaz", commas:[9, 14, 26, 31, 26, 14, 9, 17, 22, 31, 22, 17, 9, 14, 26, 14, 9] },
      { type:"seyir", makam:"hicaz", via:"ussak", sec:60, min:60 },
      { type:"listen", makam:"huseyni", commas:[9, 22, 31, 40, 48, 40, 31, 36, 48, 36, 31, 22, 17, 9] },
      { type:"seyir", makam:"huseyni", via:"karcigar", sec:60, min:60 }
    ] },
  { id:"gecki-3", unit:"makam", since:2, notes:[],
    title:{ tr:"Geçki 3: eserde geçkiyi bul", en:"Geçki 3: find the geçki in a piece" },
    text:[
      { tr:"Eserlerin çoğunda ezgi bir yerde başka bir makamın perdelerine uğrar. Notada bunu arızaların değişmesinden görürsün: birkaç ölçü boyunca yeni bir arıza belirir, sonra eski arızalar geri gelir. Bu derste arşivden iki eserde bunu dinleyerek bulacaksın, sonra eserleri çalacaksın.",
        en:"In most pieces the melody visits another makam's perdes somewhere. In the score you see it as a change of accidentals: a new accidental appears for a few bars, then the old ones come back. In this lesson you find this by ear in two pieces from the archive, then play them." },
      { tr:"Eserler bir betikle seçildi: makamının dizisiyle başlıyor, bir ölçüde makamın dizisinde olmayan perdeler giriyor, bu perdelerin hepsi aynı durakta karar veren bir makamın dizisinde var ve ezgi sonra kendi dizisine dönüp durakta bitiyor.",
        en:"The pieces were chosen by a script: each starts in its makam's scale, then in one bar perdes outside the scale come in, all of them belong to a makam with the same final, and the melody then returns to its own scale and ends on the final." }
    ],
    tips:[
      { tr:"Dinlerken ölçüleri say; nota ekranında ölçü çizgilerini takip et.", en:"Count the bars while listening; follow the bar lines on the score." }
    ],
    steps:[
      { type:"read", title:{ tr:"Mâhur'da Hisar", en:"Hisar in Mâhur" }, body:[
        { tr:"Gör Nitti Cana (Dede Efendi, Aksak, Mâhur). Mâhur'un durağı Rast'tır; Nevâ'nın üstünde Hüseynî ve Acem kullanır. Sûzinak'ın Hisar'ı Mâhur dizisinde yok. İlk on ölçüyü dinle: Hisar kaçıncı ölçüde giriyor?",
          en:"Gör Nitti Cana (Dede Efendi, Aksak, Mâhur). Mâhur resolves on Rast and uses Hüseynî and Acem above Nevâ. Sûzinak's Hisar is not in the Mâhur scale. Listen to the first ten bars: in which bar does Hisar come in?" }
      ] },
      { type:"listen", arsiv:GOR, name:GORN, from:1, to:10, tempoPct:80 },
      { type:"soru", items:[
        { q:{ tr:"Gör Nitti Cana'da Hisar (Sûzinak rengi) kaçıncı ölçüde giriyor?", en:"In Gör Nitti Cana, in which bar does Hisar (Sûzinak's colour) come in?" },
          opts:opt(["3", "5", "7", "9"]), ok:2,
          why:{ tr:"7. ölçüde (“Yok mu…”): 7–10. ölçüler Hisar'la; 11. ölçüde Hüseynî ve Acem geri gelir, eser Rast'ta biter.", en:"Bar 7 (“Yok mu…”): bars 7–10 use Hisar; in bar 11 Hüseynî and Acem return and the piece ends on Rast." } }
      ] },
      ...eserSteps(GOR, GORN, [[1, 6], [7, 14]], { min80:60, min:65 }),
      { type:"read", title:{ tr:"Hicaz'da Segâh ve Çargâh", en:"Segâh and Çargâh in Hicaz" }, body:[
        { tr:"Ağyâr İle Sen (Bîmen Şen, Sengin Semâî, Hicaz). İlk sekiz ölçü saz arası, söz 9. ölçüde başlar. Hicaz dizisinde Dügâh ile Nevâ arasında " + names(hu.only) + " var; Uşşak ve Hüseynî dizisindeki " + names(hu.other) + " yok. 9. ölçüden 18. ölçüye kadar dinle: bu iki perde kaçıncı ölçüde giriyor?",
          en:"Ağyâr İle Sen (Bîmen Şen, Sengin Semâî, Hicaz). The first eight bars are an instrumental interlude; the words start in bar 9. Between Dügâh and Nevâ the Hicaz scale has " + names(hu.only) + "; the " + names(hu.other) + " of the Uşşak and Hüseynî scales are absent. Listen from bar 9 to 18: in which bar do these two perdes come in?" }
      ] },
      { type:"listen", arsiv:AGY, name:AGYN, from:9, to:18, tempoPct:80 },
      { type:"soru", items:[
        { q:{ tr:"Ağyâr İle Sen'de Segâh ve Çargâh kaçıncı ölçüde giriyor?", en:"In Ağyâr İle Sen, in which bar do Segâh and Çargâh come in?" },
          opts:opt(["11", "13", "15", "17"]), ok:2,
          why:{ tr:"15. ölçüde: ezgi Segâh'ta dinlenir; 17. ölçüde Dik Kürdî ve Nim Hicaz geri gelir, cümle Dügâh'ta biter.", en:"Bar 15: the melody rests on Segâh; in bar 17 Dik Kürdî and Nim Hicaz return and the phrase ends on Dügâh." } }
      ] },
      ...eserSteps(AGY, AGYN, [[1, 8], [9, 20], [21, 35]], { min80:65, min:70 })
    ] });
}
// ---- S3.5 Şed ve ahenk ----
// Şed (göçürme): scale, seyir, mimic ve listen adımlarında shift (koma, 53'lük sistem; learn.js makamShifted), etüt adımında
// piece shift (repertoire.js transposeAll "koma"). İleri ünitesinde, taksim-2'den sonra üç ders. Âhenk bilgisi yalnız TDV
// "Âhenk" maddesinin müzik bölümünden (Haydar Sanal, 1988; docs/KAYNAKLAR.md): madde âhenkler arasında perde ya da koma
// farkı vermez, ders de vermez. sed-3'teki bağlar uygulamanın dizilerinden hesaplanır (Hicazkâr = Zirgüleli Hicaz'ın
// Rast'a göçürülmüşü learn.js metninde ve TDV Hicazkâr'da; Kürdîli Hicazkâr = Kürdî'nin Rast'taki şeddi TDV Kürdî'de, KAYNAKLAR §2);
// Mâhur → Acemaşîran yalnız dizi eşliği olarak anlatılır, "şeddidir" denmez.
insertLessonAfter("taksim-2",
  { id:"sed-1", unit:"ileri", since:2, notes:[], makam:"rast",
    title:{ tr:"Şed 1: aynı makam, başka perde", en:"Şed 1: the same makam from another perde" },
    text:[
      { tr:"Şed ya da göçürme, bir makamın bütün perdelerini aynı aralıkla kaydırıp makamı başka bir perdeden çalmaktır. Aralıklar korunduğu için makamın rengi aynı kalır; yalnız yükseklik, perde adları ve parmaklar değişir.",
        en:"Şed, or göçürme, means moving every perde of a makam by the same interval and playing the makam from another perde. Because the intervals stay the same, the makam keeps its colour; only the pitch, the perde names and the fingerings change." },
      { tr:"53 komalık sistemde kaydırma koma ile ölçülür: tanini 9, tam dörtlü 22, tam beşli 31 koma. Rast'ı Çargâh'tan (yazılı Do5) çalmak bütün perdeleri 22 koma, Nevâ'dan (yazılı Re5) çalmak 31 koma yukarı taşır. Rast Çargâh'tan: Çargâh, Nevâ, Dik Hisar, Acem, Gerdâniye, Muhayyer, Tiz Segâh, Tiz Çargâh. Asıl dizideki Segâh'ın yerini Dik Hisar, Evç'in yerini Tiz Segâh alır.",
        en:"In the 53-comma system the shift is counted in commas: a whole tone is 9, a perfect fourth 22, a perfect fifth 31 commas. Playing Rast from Çargâh (written C5) moves every perde up 22 commas; from Nevâ (written D5), 31 commas. Rast from Çargâh: Çargâh, Nevâ, Dik Hisar, Acem, Gerdâniye, Muhayyer, Tiz Segâh, Tiz Çargâh. Dik Hisar takes the place of Segâh in the original scale, and Tiz Segâh that of Evç." },
      { tr:"Hicaz'ı da iki yerden çalacaksın: Nevâ'dan (22 koma tiz: Nevâ, Hisar, Evç, Gerdâniye…) ve Rast'tan (9 koma pes: Rast, Zirgüle, Segâh, Çargâh…). Ölçüm her adımda kaydırılmış diziye göre yapılır. Son adımda Hicaz'ı Nevâ'dan serbest çal: durak artık Nevâ, güçlü Gerdâniye.",
        en:"You'll play Hicaz from two places too: from Nevâ (22 commas higher: Nevâ, Hisar, Evç, Gerdâniye…) and from Rast (9 commas lower: Rast, Zirgüle, Segâh, Çargâh…). Each step is measured against the shifted scale. In the last step play Hicaz freely from Nevâ: the final is now Nevâ and the dominant Gerdâniye." }
    ],
    tips:[
      { tr:"Yeni yerde parmaklara değil kulağa güven: önce \"Örneği dinle\" ile diziyi duy, aralıkları asıl dizidekiyle karşılaştır.", en:"In the new place trust your ear rather than your fingers: hear the scale with \"Hear example\" first and compare the steps with the original scale." }
    ],
    steps:[
      { type:"listen", makam:"rast", shift:22, commas:[22, 31, 39, 44, 53, 44, 39, 31, 22] },
      { type:"scale", makam:"rast", shift:22, min:0.7 },
      { type:"scale", makam:"rast", shift:31, min:0.7 },
      { type:"scale", makam:"hicaz", shift:22, min:0.7 },
      { type:"scale", makam:"hicaz", shift:-9, min:0.7 },
      { type:"mimic", makam:"rast", shift:22, len:5 },
      { type:"seyir", makam:"hicaz", shift:22, sec:45, min:50 }
    ] },
  { id:"sed-2", unit:"ileri", since:2, notes:[], makam:"ussak",
    title:{ tr:"Şed 2: solistin perdesine uymak (âhenk)", en:"Şed 2: following the soloist's pitch (âhenk)" },
    text:[
      { tr:"Toplu çalışta herkesin aynı perdede buluşması gerekir. Hanende eseri notasına bağlı kalır ama sesinin uyduğu âhenge göçürerek okur; sazendeler de aynı notayı izleyerek göçürme yapar. Klarnetçi için bu, eseri yazıldığı yerden değil solistin perdesinden çalmak demektir.",
        en:"When playing together, everyone has to meet on the same pitch. The singer keeps to the written score but sings it shifted to the âhenk that suits their voice; the instrumentalists follow the same score and shift it too. For a clarinettist this means playing the piece from the soloist's perde rather than from where it is written." },
      { tr:"Bu derste Uşşak etüdünü iki yerden çalacaksın: önce Nevâ'dan (22 koma tiz), sonra Rast'tan (9 koma pes). Notalar aynı aralıklarla kayar; uygulama perdeleri AEU'ya göre değerlendirir, arşivdeki aktarmada olduğu gibi.",
        en:"In this lesson you play the Uşşak étude from two places: first from Nevâ (22 commas higher), then from Rast (9 commas lower). The notes move by the same intervals; the app judges the perdes against AEU, as with transposing in the archive." }
    ],
    tips:[
      { tr:"Eserlerde aynısını arşivde yapabilirsin: eser sayfasında \"Başka perdeden çal\" ile eseri perde perde kaydır.", en:"You can do the same with pieces in the archive: on a piece's page use \"Play from another perde\" to move it perde by perde." }
    ],
    steps:[
      { type:"read", title:{ tr:"Âhenk", en:"Âhenk" }, body:[
        { tr:"TDV İslâm Ansiklopedisi'ne göre âhenk, müzikte düzen, akort demektir: çalgıların, özellikle neyin, belli sabit bir perdeye göre düzenlenmiş hâli. Toplu icrada sabit perde yüksekliği farklı uzunluktaki neylerle sağlanmış. Ney, hangi perdesi sabit sese (440 titreşim/saniye) denk gelirse o âhengin adını alır: Dügâh'ı denk gelen ney Mansûr, Nevâ'sı denk gelen ney Bolâhenk neydir. Maddenin aktardığına göre (İsmail Hakkı Özkan) Türk musikisinde esas akort Bolâhenk'tir.",
          en:"According to the TDV Encyclopaedia of Islam, âhenk in music means order, tuning: the state of instruments, above all the ney, set to a fixed pitch. In ensembles a fixed pitch level was given by neys of different lengths. A ney takes the name of the âhenk whose perde falls on the fixed pitch (440 vibrations per second): the ney whose Dügâh falls there is the Mansûr, the one whose Nevâ falls there the Bolâhenk. The article reports (after İsmail Hakkı Özkan) that the standard tuning in Turkish music is Bolâhenk." },
        { tr:"Maddedeki yedi ana ney ve sabit sese denk gelen perdeleri: Kız ney → Rast · Mansûr → Dügâh · Şah → Segâh (sonraki listede Bûselik) · Dâvud → Çargâh · Bolâhenk → Nevâ · Süpürde → Hüseynî · Müstahsen → Acem (önceki listede Evç). İki âhengin arasındakilere \"mâbeyn\" denir: Bolâhenk ile Süpürde arasındaki Mehtâbiye gibi.",
          en:"The article's seven main neys and the perde of each that falls on the fixed pitch: Kız ney → Rast · Mansûr → Dügâh · Şah → Segâh (Bûselik in a later list) · Dâvud → Çargâh · Bolâhenk → Nevâ · Süpürde → Hüseynî · Müstahsen → Acem (Evç in an earlier list). Those in between two âhenks are called \"mâbeyn\", like Mehtâbiye between Bolâhenk and Süpürde." },
        { tr:"Neyzen, aynı âhenkte neyi varsa notayı ve parmak yerini değiştirmeden çalar; yoksa aynı notayı izleyip parmak yerini değiştirerek göçürür. Madde âhenkler arasındaki farkı perde ya da koma olarak vermez; bu yüzden burada sayı yazılmadı. Klarnette yazılı ve duyulan ses farkı için Teori'deki transpozisyon konusuna bak: Sol klarnet yazıldığından tam dörtlü pes duyulur.",
          en:"If the neyzen has a ney in the same âhenk, they play without changing the score or the fingering; if not, they follow the same score and shift it by changing the fingering. The article doesn't give the distance between âhenks in perdes or commas, so no numbers are given here. For the written and sounding pitch of the clarinet see the transposition topic in Theory: the G clarinet sounds a perfect fourth lower than written." }
      ] },
      { type:"soru", items:[
        { q:{ tr:"Âhenk ne demektir?", en:"What does âhenk mean?" },
          opts:[{ tr:"Çalgıların sabit bir perdeye göre düzeni (akort)", en:"Instruments set to a fixed pitch (tuning)" }, { tr:"Bir usulün adı", en:"The name of an usul" }, { tr:"Makamın güçlü perdesi", en:"The dominant of a makam" }, { tr:"Bir süsleme türü", en:"A kind of ornament" }], ok:0,
          why:{ tr:"Âhenk müzikte düzen, akort demektir: çalgıların, özellikle neyin, sabit bir perdeye göre düzenlenmesi.", en:"In music âhenk means order, tuning: instruments, above all the ney, set to a fixed pitch." } },
        { q:{ tr:"TDV maddesine göre sabit ses (ney için) kaç titreşim/saniyedir?", en:"According to the TDV article, what is the fixed pitch for the ney, in vibrations per second?" },
          opts:["440", "880", "432", "415"], ok:0,
          why:{ tr:"440: Mansûr neyin Dügâh'ı bu sese denk gelir. Nısfiyelerde 880 (bir oktav tiz).", en:"440: the Mansûr ney's Dügâh falls on it. For the nısfiye it is 880 (an octave higher)." } },
        { q:{ tr:"Bolâhenk neyde sabit sese (440) hangi perde denk gelir?", en:"On the Bolâhenk ney, which perde falls on the fixed pitch (440)?" },
          opts:["Nevâ", "Rast", "Dügâh", "Hüseynî"], ok:0,
          why:{ tr:"Bolâhenk → Nevâ. Rast Kız ney, Dügâh Mansûr, Hüseynî Süpürde.", en:"Bolâhenk → Nevâ. Rast is the Kız ney, Dügâh the Mansûr, Hüseynî the Süpürde." } },
        { q:{ tr:"Kız neyde sabit sese hangi perde denk gelir?", en:"Which perde of the Kız ney falls on the fixed pitch?" },
          opts:["Rast", "Çargâh", "Segâh", "Acem"], ok:0,
          why:{ tr:"Kız ney → Rast. Çargâh Dâvud, Segâh Şah, Acem Müstahsen.", en:"Kız ney → Rast. Çargâh is the Dâvud, Segâh the Şah, Acem the Müstahsen." } },
        { q:{ tr:"Hanende eseri notasına bağlı kalarak nasıl okur?", en:"How does the singer sing a piece while keeping to the score?" },
          opts:[{ tr:"Sesinin uyduğu âhenge göçürerek", en:"Shifted to the âhenk that suits their voice" }, { tr:"Her zaman Mansûr âhenginde", en:"Always in the Mansûr âhenk" }, { tr:"Makamı değiştirerek", en:"By changing the makam" }, { tr:"Notayı bir oktav tiz okuyarak", en:"Reading the score an octave higher" }], ok:0,
          why:{ tr:"Hanende notaya bağlı kalır ama sesinin uyduğu âhenge göçürür; makam ve aralıklar değişmez.", en:"The singer keeps to the score but shifts it to the âhenk that suits their voice; the makam and the intervals stay the same." } }
      ], min:4 },
      { type:"piece", id:"e-ussak", shift:22, mode:"free", min:4 },
      { type:"piece", id:"e-ussak", shift:22, mode:"tempo", min:65 },
      { type:"piece", id:"e-ussak", shift:-9, mode:"tempo", min:65 }
    ] },
  { id:"sed-3", unit:"ileri", since:2, notes:[], makam:"hicazkar",
    title:{ tr:"Şed 3: aynı dizi, başka ad", en:"Şed 3: the same scale, another name" },
    text:[
      { tr:"Bazı makamların dizisi başka bir makamın göçürülmüş dizisidir. Uygulamanın Hicazkâr kaydı bunu söyler: Hicazkâr, Zirgüleli Hicaz'ın Rast'a göçürülmüşüdür. Zirgüleli Hicaz'ın bütün perdelerini 9 koma pes çalınca dizi Rast, Zirgüle, Segâh, Çargâh, Nevâ, Hisar, Evç, Gerdâniye olur: Hicazkâr dizisinin ta kendisi.",
        en:"Some makams have a scale that is another makam's scale shifted. The app's Hicazkâr entry says so: Hicazkâr is Zirgüleli Hicaz moved to Rast. Play every perde of Zirgüleli Hicaz 9 commas lower and the scale becomes Rast, Zirgüle, Segâh, Çargâh, Nevâ, Hisar, Evç, Gerdâniye: exactly the Hicazkâr scale." },
      { tr:"İkinci bir çift TDV'nin Kürdî maddesinde: Kürdîli Hicazkâr, Kürdî'nin Rast'taki şeddidir; Kürdî dizisini 9 koma pes çalınca Kürdîli Hicazkâr dizisi çıkar. Uygulamanın dizilerinde bir çift daha var: Mâhur dizisi 9 koma pes çalınınca Acemaşîran dizisi çıkar. Ama makam yalnız dizi değildir: Zirgüleli Hicaz'ın güçlüsü Hüseynî Rast'a göçürülünce Nevâ'ya düşer, Hicazkâr'ın güçlüsü ise Gerdâniye (Nevâ ikinci güçlü); Kürdî çıkıcı, Kürdîli Hicazkâr inicidir. Mâhur'un güçlüsü Gerdâniye ise göçürülünce Acem olur, Acemaşîran'ın güçlüsü de Acem'dir.",
        en:"A second pair is in the TDV article on Kürdî: Kürdîli Hicazkâr is the şed of Kürdî on Rast; play the Kürdî scale 9 commas lower and you get the Kürdîli Hicazkâr scale. The app's scales show one more pair: the Mâhur scale 9 commas lower gives the Acemaşîran scale. But a makam is more than its scale: Zirgüleli Hicaz's dominant Hüseynî lands on Nevâ when moved to Rast, while Hicazkâr's dominant is Gerdâniye (Nevâ is the second dominant); Kürdî ascends, Kürdîli Hicazkâr descends. Mâhur's dominant Gerdâniye becomes Acem when moved, and Acem is Acemaşîran's dominant too." }
    ],
    tips:[
      { tr:"İki diziyi art arda çal: Zirgüleli Hicaz Rast'tan ile Hicazkâr aynı perdeleri ister; farkı seyirde arayacaksın.", en:"Play the two scales one after the other: Zirgüleli Hicaz from Rast and Hicazkâr need the same perdes; look for the difference in the seyir." }
    ],
    steps:[
      { type:"soru", items:[
        { q:{ tr:"Uygulamanın kaydına göre Hicazkâr hangi makamın Rast'a göçürülmüşüdür?", en:"According to the app's entry, Hicazkâr is which makam moved to Rast?" },
          opts:["Zirgüleli Hicaz", "Hicaz", "Hümâyun", "Uzzâl"], ok:0,
          why:{ tr:"Zirgüleli Hicaz: iki Hicaz çeşnisi üst üste; Dügâh'tan Rast'a 9 koma pes.", en:"Zirgüleli Hicaz: two Hicaz çeşnis stacked; 9 commas lower, from Dügâh to Rast." } },
        { q:{ tr:"Dügâh'tan Rast'a göçürmek perdeleri kaç koma kaydırır?", en:"Moving from Dügâh to Rast shifts the perdes by how many commas?" },
          opts:[{ tr:"9 koma pes", en:"9 commas lower" }, { tr:"22 koma pes", en:"22 commas lower" }, { tr:"4 koma pes", en:"4 commas lower" }, { tr:"31 koma tiz", en:"31 commas higher" }], ok:0,
          why:{ tr:"Rast ile Dügâh arası bir tanini, 9 koma.", en:"Rast to Dügâh is a whole tone, 9 commas." } },
        { q:{ tr:"Zirgüleli Hicaz'ın güçlüsü Hüseynî, Rast'a göçürülünce hangi perdeye düşer?", en:"Zirgüleli Hicaz's dominant is Hüseynî; on which perde does it land when moved to Rast?" },
          opts:["Nevâ", "Gerdâniye", "Çargâh", "Acem"], ok:0,
          why:{ tr:"Hüseynî (40) − 9 = 31, Nevâ. Hicazkâr'ın güçlüsü Gerdâniye'dir: dizi aynı, seyir farklı.", en:"Hüseynî (40) − 9 = 31, Nevâ. Hicazkâr's dominant is Gerdâniye: same scale, different seyir." } }
      ] },
      { type:"scale", makam:"zirguleli", shift:-9, min:0.7 },
      { type:"scale", makam:"hicazkar", min:0.7 },
      { type:"scale", makam:"kurdi", shift:-9, min:0.7 },
      { type:"scale", makam:"kurdilihicazkar", min:0.7 },
      { type:"seyir", makam:"hicazkar", sec:45, min:50 }
    ] });

// ---- S3.2 Yeni makamlar ----
// Arşivde sık geçen ve uygulamada olmayan makamlar (docs/BACKLOG.md S3.2). Kalıp ileri makam dersleriyle aynı (makamLesson:
// dinle, dizi, ezgi, taklit) + makamın etüdü (repertoire.js "S3.2" bloğu) serbest ve tempolu. Metin learn.js MAKAMS'tan
// üretilir (TDV maddeleri, docs/KAYNAKLAR.md); "aynı dizi" cümlesi yalnız similarMakams farksız dizi bulursa yazılır.
// Acemkürdî eklenmedi: TDV maddesi dizi ve yeden vermiyor (BACKLOG). Makam tanıma oyunu bu makamları ders bitince sorar
// (learn.js learnFirst, trainers.js earMakams).
function newMakamLesson(mk, phrase){
  const m = LLEARN.makamById(mk), P = c => LLEARN.perdeName(c);
  const same = LLEARN.similarMakams(m, 0);
  const diff = x => [x.guclu ? ["güçlüsü", "dominant"] : null, x.seyir ? ["seyir yönü", "direction of the seyir"] : null].filter(Boolean);
  const sameText = same.map(x => { const d = diff(x);
    return { tr: m.name + " ile " + x.mk.name + " aynı diziyi kullanır; farkı seyirdedir" + (d.length ? " (" + d.map(z => z[0]).join(", ") + " başka)" : "") + ".",
             en: m.name + " and " + x.mk.name + " use the same scale; the difference is in the seyir" + (d.length ? " (different " + d.map(z => z[1]).join(", ") + ")" : "") + "." }; });
  const l = makamLesson(mk, mk, [
    { tr:"Durak " + P(m.durak) + ", güçlü " + P(m.guclu) + ", yeden " + P(m.yeden) + ".", en:"Final " + P(m.durak) + ", dominant " + P(m.guclu) + ", leading tone " + P(m.yeden) + "." },
    { tr: LLEARN.seyirText(m, "tr"), en: LLEARN.seyirText(m, "en") },
    ...sameText,
    { tr:"Derste önce diziyi dinleyip çalacaksın, sonra seyre uygun bir ezgi, taklit ve en sonda makamın etüdü (önce serbest, sonra tempolu).",
      en:"In this lesson you first listen to and play the scale, then a melody that follows the seyir, imitation and finally the makam's étude (first free, then in tempo)." }
  ], [], phrase, [
    { type:"piece", id:"e-" + mk, mode:"free", min:5 },
    { type:"piece", id:"e-" + mk, mode:"tempo", min:65 }
  ]);
  l.since = 2;
  return l;
}
insertLessonAfter("acemasiran",
  newMakamLesson("muhayyer", [62, 53, 48, 40, 48, 53, 62, 53, 44, 40, 31, 22, 17, 9]),
  newMakamLesson("buselik", [9, 18, 22, 31, 22, 31, 40, 44, 57, 62, 53, 44, 40, 31, 22, 18, 9]),
  newMakamLesson("muhayyerkurdi", [62, 53, 48, 40, 53, 62, 53, 44, 40, 31, 22, 13, 22, 13, 9]),
  newMakamLesson("evic", [48, 40, 48, 40, 31, 22, 17, 9, 17, 22, 17, 9, 0, -5]),
  newMakamLesson("tahir", [62, 53, 48, 53, 62, 53, 48, 40, 31, 40, 31, 22, 17, 9]),
  newMakamLesson("neveser", [31, 36, 48, 36, 31, 26, 14, 26, 31, 26, 14, 9, 0]),
  newMakamLesson("suzidil", [40, 35, 22, 18, 22, 35, 40, 35, 22, 18, 9, 4, -8, -13]),
  newMakamLesson("gerdaniye", [53, 62, 53, 48, 40, 48, 53, 44, 40, 31, 22, 17, 9]),
  newMakamLesson("nisaburek", [40, 49, 53, 49, 40, 31, 26, 31, 26, 18, 26, 18, 9]),
  newMakamLesson("sehnaz", [62, 57, 45, 57, 62, 57, 45, 40, 31, 26, 14, 26, 14, 9]),
  newMakamLesson("yegah", [31, 22, 17, 22, 31, 26, 18, 9, 0, -5, -13, -22]),
  newMakamLesson("sultaniyegah", [31, 26, 14, 26, 31, 26, 14, 9, 13, 9, 0, -9, -13, -22])
);

// ---- S2.4 Altissimo ----
// Do♯6–Sol6 (yazılı 85–91). Perde bulucu bu bölgede Iowa kayıtlarıyla ölçüldü (npm run audio-check, testdata/README.md):
// bu notaların hepsi doğru bulunuyor, bu yüzden uzun ton (hold) adımı kullanılır. Parmaklar core.js FINGERINGS'ten;
// bu bölgede çalgıdan çalgıya değişir, parmak kartında seçenekler var
const ALT_TEXT = {
  read:{ tr:"Klarinonun üstündeki notalar (altissimo) tiz ve parmakları karışıktır. Havayı hızlı ve destekli ver; sesi dudağı sıkarak değil, havayla taşı. Her yeni notaya alttaki bildiğin notadan bağlı çıkarak gir.",
         en:"The notes above the clarion (altissimo) are high and their fingerings are intricate. Give fast, supported air; carry the sound with the air, not by biting. Approach each new note slurred from a note you already know below it." },
  fing:{ tr:"Bu bölgede aynı nota için birden çok parmak var ve hangisinin iyi çıktığı çalgıdan çalgıya değişir. Parmak kartındaki seçenekleri dene, en temiz çıkanı seç.",
         en:"In this region a note has several fingerings and which one speaks best varies from instrument to instrument. Try the options on the fingering card and keep the cleanest one." }
};
const altSteps = (prev, notes) => [
  { type:"read", title:{ tr:"Altissimo", en:"Altissimo" }, body:[ALT_TEXT.read, ALT_TEXT.fing] },
  { type:"soru", items:[
    { q:{ tr:"Altissimoda bir nota temiz çıkmıyorsa önce ne yaparsın?", en:"If an altissimo note doesn't speak cleanly, what do you try first?" },
      opts:[{ tr:"Parmak kartındaki başka bir parmağı denerim", en:"Try another fingering from the card" }, { tr:"Dudağı daha çok sıkarım", en:"Bite harder" }, { tr:"Havayı azaltırım", en:"Use less air" }], ok:0,
      why:{ tr:"Bu bölgede parmak çalgıdan çalgıya değişir; dudağı sıkmak sesi daraltır ve tizleştirir.", en:"Fingerings vary between instruments here; biting thins the sound and pushes it sharp." } }
  ] },
  ...notes.flatMap(w => [
    { type:"notes", notes:[prev(w), w, prev(w), w], maxMiss:2 },
    { type:"hold", note:w, sec:3, min:35 }
  ]),
  { type:"quiz", notes, mode:"find", n:6, min:4 }
];
const altPrev = w => w - 12 >= 73 ? w - 12 : 84;        // bir oktav alttaki klarino notasından bağlı çıkış
// İleri ünitesinin sonunda (dersler sırayla açılır; taksim yolunu zor bir teknik konunun arkasında kilitlemesin)
insertLessonAfter("dikte-2",
  { id:"altissimo-1", unit:"ileri", since:2, notes:[85, 86, 87, 88],
    title:{ tr:"Altissimo 1: Do♯6, Re6, Mi♭6, Mi6", en:"Altissimo 1: C♯6, D6, E♭6, E6" },
    text:[{ tr:"Klarinonun bittiği yerden (Do6) yukarı dört yarım ses. Her notaya bir oktav alttan bağlı çıkarak girersin, sonra notayı üç saniye tutarsın.",
            en:"Four semitones up from where the clarion ends (C6). You approach each note slurred from an octave below, then hold it for three seconds." }],
    tips:[{ tr:"Ses incelip kesiliyorsa hava hızını artır, çeneni gevşet.", en:"If the sound thins out and breaks, speed up the air and relax the jaw." }],
    steps: altSteps(altPrev, [85, 86, 87, 88]) },
  { id:"altissimo-2", unit:"ileri", since:2, notes:[89, 90, 91],
    title:{ tr:"Altissimo 2: Fa6, Fa♯6, Sol6", en:"Altissimo 2: F6, F♯6, G6" },
    text:[{ tr:"Sol6'ya kadar üç nota daha. Bu notalar çok tizdir; kısa çalış, yorulunca bırak ve ertesi gün devam et.",
            en:"Three more notes up to G6. These notes are very high; practise briefly, stop when tired and continue the next day." }],
    tips:[{ tr:"Fa♯6 ve Sol6'nın birçok parmağı var; parmak kartında hepsini dene.", en:"F♯6 and G6 have many fingerings; try them all on the fingering card." }],
    steps: altSteps(altPrev, [89, 90, 91]) });

// ---- S4.4 Saz eserleri ----
// Dört ders (İleri, sed-3'ten sonra): peşrev, saz semâîsi (1.–3. hane, 4. hane), longa. Eserler scripts/eser-sec.js
// --basamak 6 --form pesrev,sazsemaisi,longa ile (telifsiz). Hane sınırları eser dosyasındaki SymbTr bölüm işaretlerinden
// (sections, not indeksi) archMeasures ile ölçüye çevrildi; teslimlerin notası her seferinde aynı (node ile karşılaştırıldı),
// bu yüzden teslim bir kez çalışılır. Hane ve mülâzime anlatımı Teori "form" konusundan (thRead; metin tek yerde).
// Longanın SymbTr dosyasında bölüm işareti yok: bölümler tekrar eden 4 ölçülük bloklardan (1–16 = 17–32 = 49–64 = 65–80,
// 33–48 bir kez); hane adı verilmedi. Şehnâz Longa (hane işaretli) Re6'ya çıktığı için alınmadı (öğretilmemiş nota).
// Aksak Semâî usul verisi yok (B1): saz semâîsinin ilk üç hanesine usul vurma adımı konmadı; 4. hane Sengin Semâî'de.
const SAZ_PES = { arsiv:"ussak--pesrev--cenber----zurnazen_ibrahim_aga", name:{ tr:"Uşşak Peşrev (Zurnazen İbrahim Ağa)", en:"Uşşak Peşrev (Zurnazen İbrahim Ağa)" } };
const SAZ_SEM = { arsiv:"ussak--sazsemaisi--aksaksemai----kantemiroglu", name:{ tr:"Uşşak Saz Semâîsi (Kantemiroğlu)", en:"Uşşak Saz Semâîsi (Kantemiroğlu)" } };
const SAZ_LON = { arsiv:"nikriz--longa--nimsofyan----tanburi_cemil_bey", name:{ tr:"Nikrîz Longa (Tanburî Cemil Bey)", en:"Nikrîz Longa (Tanburî Cemil Bey)" } };
insertLessonAfter("sed-3",
  { id:"pesrev-1", unit:"ileri", since:2, notes:[],
    title:{ tr:"Peşrev 1: ilk hane ve mülâzime", en:"Peşrev 1: the first hane and the mülâzime" },
    text:[
      { tr:"Şimdiye kadar çaldığın eserlerin çoğu sözlüydü. Bu ve sonraki üç derste saz eserlerine geçiyorsun: peşrev, saz semâîsi ve longa. İlk eser Zurnazen İbrahim Ağa'nın Uşşak peşrevi; usulü Çenber, notada bir ölçü 24 dörtlük.",
        en:"Most of the pieces you've played so far had words. In this and the next three lessons you move on to instrumental pieces: peşrev, saz semâîsi and longa. The first is Zurnazen İbrahim Ağa's Uşşak peşrev; its usul is Çenber, and one bar in the score is 24 quarter notes long." },
      { tr:"Arşivdeki notada 1. hane 1. ölçü, mülâzime 2–3. ölçüler. Önce ikisini ayrı ayrı yavaş tempoda dinleyip çalacaksın, sonra hane ve mülâzimeyi arka arkaya, önce %80 sonra eserin kendi temposunda.",
        en:"In the archive score the 1st hane is bar 1 and the mülâzime bars 2–3. You'll first listen to and play each one separately at a slow tempo, then the hane and the mülâzime back to back, first at 80% and then at the piece's own tempo." }
    ],
    tips:[
      { tr:"Uzun ölçüde yerini kaybetmemek için cümle sonlarındaki uzun notalarda nefes al.", en:"To keep your place in the long bar, breathe on the long notes at the ends of phrases." },
      { tr:"Mülâzimeyi iyi öğren: peşrevin her hanesinden sonra aynı nağme geri gelir.", en:"Learn the mülâzime well: the same music comes back after every hane of the peşrev." }
    ],
    steps:[
      thRead("form", [["text", 2]]),
      ...eserSteps(SAZ_PES.arsiv, SAZ_PES.name, [[1, 1], [2, 3]], { to:3 })
    ] },
  { id:"sazsemaisi-1", unit:"ileri", since:2, notes:[],
    title:{ tr:"Saz semâîsi 1: ilk üç hane", en:"Saz semâîsi 1: the first three hanes" },
    text:[
      { tr:"Kantemiroğlu'nun Uşşak saz semâîsi: ilk üç hane ve teslimleri Aksak Semâî usulünde (10/8). Arşivdeki notada 1. hane 1–4. ölçüler, teslim 5–12, 2. hane 13–16, 3. hane 25–28. Teslimin notası her haneden sonra aynı (17–24 ve 29–36), bu yüzden onu bir kez çalışırsın.",
        en:"Kantemiroğlu's Uşşak saz semâîsi: the first three hanes and their teslims are in the Aksak Semâî usul (10/8). In the archive score the 1st hane is bars 1–4, the teslim 5–12, the 2nd hane 13–16, the 3rd hane 25–28. The teslim's notes are the same after every hane (17–24 and 29–36), so you work on it once." },
      { tr:"Hane hane yavaş tempoda dinle ve çal; sonunda 1–36. ölçüleri (üç hane, üç teslim) önce %80, sonra eserin kendi temposunda arka arkaya çal. Aksak Semâî'yi uygulamada henüz elle vuramazsın; usulü dinlerken say: 10 zaman.",
        en:"Listen and play hane by hane at a slow tempo; at the end play bars 1–36 (three hanes, three teslims) straight through, first at 80%, then at the piece's own tempo. You can't tap Aksak Semâî in the app yet; count it while you listen: 10 beats." }
    ],
    tips:[
      { tr:"Her hanenin son ölçüsünü teslimin ilk ölçüsüyle birlikte birkaç kez çal: geçişte durma.", en:"Play the last bar of each hane together with the first bar of the teslim a few times: don't stop at the join." }
    ],
    steps:[
      thRead("form", [["text", 3]]),
      ...eserSteps(SAZ_SEM.arsiv, SAZ_SEM.name, [[1, 4], [5, 12], [13, 16], [25, 28]], { to:36 })
    ] },
  { id:"sazsemaisi-2", unit:"ileri", since:2, notes:[],
    title:{ tr:"Saz semâîsi 2: dördüncü hane", en:"Saz semâîsi 2: the fourth hane" },
    text:[
      { tr:"Aynı Uşşak saz semâîsinin 4. hanesi (37–44. ölçüler) Sengin Semâî usulünde (6/4); teslimle (45–52) Aksak Semâî'ye dönülür. Önce Sengin Semâî'yi ezberden vur, sonra haneyi tek başına ve teslimiyle çal.",
        en:"The 4th hane of the same Uşşak saz semâîsi (bars 37–44) is in the Sengin Semâî usul (6/4); with the teslim (45–52) it returns to Aksak Semâî. First tap Sengin Semâî from memory, then play the hane on its own and with its teslim." },
      { tr:"Sonunda eserin tamamını (52 ölçü) önce %80, sonra kendi temposunda çalarsın.",
        en:"Finally you play the whole piece (52 bars), first at 80%, then at its own tempo." }
    ],
    tips:[
      { tr:"Usul değişince ölçünün uzunluğu da değişir: 4. hanede vuruşu yeniden say.", en:"When the usul changes, the length of the bar changes too: count the beat again in the 4th hane." }
    ],
    steps:[
      { type:"usultap", usul:"senginsemai", mode:"mem", min:70 },
      ...eserSteps(SAZ_SEM.arsiv, SAZ_SEM.name, [[37, 44], [37, 52]])
    ] },
  { id:"longa-1", unit:"ileri", since:2, notes:[],
    title:{ tr:"Longa: hızlı saz eseri", en:"Longa: a fast instrumental piece" },
    text:[
      { tr:"Tanburî Cemil Bey'in Nikrîz longası, Nîm-sofyan usulünde (2/4). Arşivdeki notada hane işareti yok, ama yapısı notadan okunuyor: 1–16. ölçüler eserde dört kez aynen geçiyor (17–32, 49–64, 65–80), 33–48. ölçüler bir kez. Yani bu iki bölümü öğrenince 80 ölçünün tamamını bilirsin.",
        en:"Tanburî Cemil Bey's Nikrîz longa, in the Nîm-sofyan usul (2/4). The archive score has no hane marks, but its shape can be read from the notes: bars 1–16 come four times unchanged (17–32, 49–64, 65–80), bars 33–48 once. So once you've learned these two sections you know all 80 bars." },
      { tr:"Tempo üç basamakta artar: bölümler sekizer ölçü %60'ta, eserin tamamı önce %80, sonra %100.",
        en:"The tempo rises in three steps: the sections eight bars at a time at 60%, then the whole piece at 80% and finally at 100%." }
    ],
    tips:[
      { tr:"Hızlı pasajda parmaklar yükselmesin; önce yavaş ve temiz, hız sonra gelir.", en:"In fast passages keep your fingers low; slow and clean first, the speed comes later." }
    ],
    steps:[
      thRead("form", [["text", 4]]),
      { type:"usultap", usul:"nimsofyan", mode:"mem", min:70 },
      ...eserSteps(SAZ_LON.arsiv, SAZ_LON.name, [[1, 8], [9, 16], [33, 40], [41, 48]])
    ] }
);

// ---- S4.2 Türkü ve yöreler ----
// Yeni ünite (UNITS "turku", since: sınavı bütün derslerinden). Her ders: usul usultap → arşivden iki türkü (eserSteps).
// Eserler scripts/eser-sec.js ile (--form turku,rumeliturkusu,zeybek --makam hepsi --usul hepsi --oktav 0 --aralik 52-88
// --sn 300 --ms 110; telifsiz, derslerde kullanılmamış). Künye SymbTr'den: yöre dosya adının son alanı, kişi dizindeki `b`
// (bütün seçilenlerde Anonim). Yöre tavrı yazılmaz. Usulü uygulamanın verisinde olmayan türküler (Devr-i Turan) seçilmedi.
// Sayılar arşivden (notalar/index.json, form "turku" 356 eser): Hicaz 40, Hüseynî 34, Segâh 33, Uşşak 30; usul Sofyan 94,
// Aksak 60, Nîm-sofyan 47; zeybek 19 (Ağır Aksak 8, Aksak 8), Rumeli türküsü 16 (Aksak 5, Sofyan 4).
// Ünite Trakya'dan önce durur (ders dizisinde de): ilk dersi unlocked'ta kendi kuralıyla açılır, Trakya'nın ilk dersi de;
// ünite başka bir dersi kilitlemez.
const TK = (arsiv, tr) => ({ arsiv, name:{ tr, en:tr } });
const tkEser = (e, parts, o) => eserSteps(e.arsiv, e.name, parts, o);
const TK_KOMA = { tr:"Si koma perdesini (Segâh) Makamlar'da öğrenmediysen şimdilik notada yazıldığı gibi çal.",
  en:"If you haven't learned the comma perde B (Segâh) in Makams yet, play it as written for now." };
const TK_E = {
  uskudar: TK("nihavent--turku--nimsofyan--uskudara_gider--", "Üsküdar'a Gider İken"),
  pencere: TK("hicaz--turku--nimsofyan--pencereden_kus--", "Pencereden Kuş Uçtu"),
  sandal: TK("hicaz--turku--sofyan--sandalim_geliyor--", "Sandalım Geliyor Varda"),
  yemeni: TK("mahur--turku--sofyan--yemenimde_hare_var--", "Yemenimde Hâre Var"),
  mayadag: TK("hicaz--turku--turkaksagi--mayadagdan_kalkan--", "Mayadağ'dan Kalkan Kazlar"),
  karanfil: TK("hicaz--turku--aksak--karanfil_oylum_oylum--", "Karanfil Oylum Oylum"),
  fadime: TK("huseyni--turku--aksak--a_fadimem--", "A Fadimem"),
  bursa: TK("huseyni--turku--aksak--bursanin_ufak--bursa", "Bursa'nın Ufak Tefek Taşları"),
  dereboyu: TK("ussak--turku--sofyan--dereboyu_kavaklar--giresun", "Dereboyu Kavaklar"),
  kale: TK("ussak--turku--sofyan--kalenin_burcu_muyam--", "Kalenin Burcu Muyam"),
  kordon: TK("rast--zeybek--agiraksak--kordon_zeybegi--", "Kordon Zeybeği"),
  izmir: TK("hicaz--zeybek--aksak--izmir_zeybegi--izmir", "İzmir Zeybeği"),
  gemi: TK("hicaz--rumeliturkusu--sofyan--gemi_kalkar--rumeli", "Gemi Kalkar Suları Akar"),
  akzade: TK("huseyni--rumeliturkusu--aksak--akzadeler_giyer--rumeli", "Akzâdeler Giyer"),
  findikli: TK("ussak--turku--aksak--findikli_bizim--", "Fındıklı Bizim Yolumuz"),
  cikayim: TK("huseyni--turku--sofyan--cikayim_gideyim--", "Çıkayım Gideyim Urumeline")
};
const TURKU = [
  { id:"turku-giris", unit:"turku", since:2, notes:[],
    title:{ tr:"Türkü: kırık hava ve uzun hava", en:"The türkü: kırık hava and uzun hava" },
    text:[
      { tr:"Bu ünitede arşivdeki türkülerden çalacaksın: 356 türkü, 19 zeybek ve 16 Rumeli türküsü. Yalnız usullü türküler (kırık hava) çalışılır; usulsüz uzun havada ezgi serbest akar, notası ve ölçüsü ders adımıyla izlenemez.",
        en:"In this unit you play türküs from the archive: 356 türküs, 19 zeybeks and 16 Rumeli türküsü. Only türküs with a usul (kırık hava) are practised; in the free-rhythm uzun hava the melody flows freely and can't be followed bar by bar in a lesson step." },
      { tr:"Her derste eserin künyesi yazılı: SymbTr notasındaki yöre ve kişi. Bu ünitenin türkülerinin hepsinde kişi alanı “Anonim”dir; yöre yalnız notada yazılıysa verilir.",
        en:"Each lesson gives the piece's details as they are in the SymbTr score: region and person. In every türkü of this unit the person field is “Anonim” (anonymous); the region is given only when the score names it." },
      { tr:"İlk iki türkü Nîm-sofyan'dır (2/4, düm tek): Üsküdar'a Gider İken (Nihâvent, ♩=84) ve Pencereden Kuş Uçtu (Hicaz, ♩=66). İkisinde de yöre yazılı değil.",
        en:"The first two türküs are in Nîm-sofyan (2/4, düm tek): Üsküdar'a Gider İken (Nihâvent, ♩=84) and Pencereden Kuş Uçtu (Hicaz, ♩=66). Neither score names a region." }
    ],
    tips:[
      { tr:"Notadaki ARANAĞME işaretli ölçüler sözsüz giriş nağmesidir, SAZ işaretliler söz aralarındaki saz bölümü; ezgiyi bu bölümlere göre bölerek çalış.", en:"Bars marked ARANAĞME in the score are the wordless introduction, those marked SAZ the instrumental part between the words; split your practice along these sections." }
    ],
    steps:[
      thRead("form", [["text", 1]]),
      { type:"read", title:{ tr:"Arşivde türkü notası", en:"A türkü score in the archive" }, body:[
        { tr:"Arşivdeki türkü notalarında bölümler işaretlidir: ARANAĞME (sözsüz giriş) ve SAZ (söz aralarındaki saz bölümü). Sözler notanın altında hece hece yazılıdır; tekrarlar açılmıştır, ölçü numarası çalınış sırasınındır.",
          en:"Sections are marked in the archive's türkü scores: ARANAĞME (wordless introduction) and SAZ (instrumental part between the words). The words are written under the notes syllable by syllable; repeats are written out and bar numbers follow the order of playing." },
        { tr:"Derslerde önce bir bölümü yavaş tempoda dinleyip çalarsın, sonra türkünün ilk kıtasını %80 ve kendi temposunda.",
          en:"In the lessons you first listen to and play one section at a slow tempo, then the türkü's first verse at 80% and at its own tempo." } ] },
      { type:"soru", items:[
        { q:{ tr:"Usullü türkülere ne denir?", en:"What are türküs with a usul called?" },
          opts:[{ tr:"Kırık hava", en:"Kırık hava" }, { tr:"Uzun hava", en:"Uzun hava" }, { tr:"Peşrev", en:"Peşrev" }], ok:0,
          why:{ tr:"Usulsüz olanlar uzun hava, usullü olanlar kırık hava (oyun havası, oturak havası).", en:"Those without a usul are uzun hava; those with one are kırık hava (dance tunes, oturak havası)." } },
        { q:{ tr:"Türkünün bölümleri nelerdir?", en:"What are the parts of a türkü?" },
          opts:[{ tr:"Bent ve kavuştak", en:"Bent and kavuştak" }, { tr:"Hane ve teslim", en:"Hane and teslim" }, { tr:"Zemin ve meyan", en:"Zemin and meyan" }], ok:0,
          why:{ tr:"Bent ve kavuştak türkünün; hane ve teslim peşrevin; zemin ve meyan şarkının bölümleridir.", en:"Bent and kavuştak belong to the türkü; hane and teslim to the peşrev; zemin and meyan to the şarkı." } },
        { q:{ tr:"Arşiv notasında ARANAĞME işaretli ölçüler nedir?", en:"What are the bars marked ARANAĞME in an archive score?" },
          opts:[{ tr:"Sözsüz giriş nağmesi", en:"The wordless introduction" }, { tr:"Türkünün sözlü ilk dizesi", en:"The first sung line" }, { tr:"Usulsüz bir taksim", en:"An unmetered taksim" }], ok:0,
          why:{ tr:"ARANAĞME sözsüz giriştir; sözler ondan sonra başlar.", en:"ARANAĞME is the wordless introduction; the words start after it." } }
      ] },
      { type:"usultap", usul:"nimsofyan", mode:"tap", min:70 },
      ...tkEser(TK_E.uskudar, [[1, 8], [9, 16]]),
      ...tkEser(TK_E.pencere, [[1, 8]])
    ] },
  { id:"turku-sofyan", unit:"turku", since:2, notes:[],
    title:{ tr:"Sofyan türküleri", en:"Türküs in Sofyan" },
    text:[
      { tr:"Arşivdeki 356 türküden 94'ü Sofyan'dır (4/4: düm iki zaman, sonra iki tek); en sık türkü usulü budur.",
        en:"Of the 356 türküs in the archive, 94 are in Sofyan (4/4: a two-beat düm, then two teks); it is the most common türkü usul." },
      { tr:"Sandalım Geliyor Varda (Hicaz, ♩=90) ve Yemenimde Hâre Var (Mâhur, ♩=90); ikisinde de yöre yazılı değil. İki türkü de iki kıtadır, derste ilk kıtası çalınır (ölçü 1–24 ve 1–30). Yemenimde Hâre Var'da koma perdesi yok; Hicaz türküsünde Si♭ ve Do♯ yazılıdır.",
        en:"Sandalım Geliyor Varda (Hicaz, ♩=90) and Yemenimde Hâre Var (Mâhur, ♩=90); neither score names a region. Both have two verses; the lesson plays the first (bars 1–24 and 1–30). Yemenimde Hâre Var has no comma perde; the Hicaz türkü is written with B♭ and C♯." }
    ],
    tips:[
      { tr:"Sofyan'da düm iki zaman sürer: ölçünün başındaki uzun notayı kısaltma.", en:"In Sofyan the düm lasts two beats: don't cut short the long note at the start of the bar." }
    ],
    steps:[
      { type:"usultap", usul:"sofyan", mode:"mem", min:70 },
      { type:"rhythm", usul:"sofyan", tempo:90, bars:4, min:60 },
      ...tkEser(TK_E.sandal, [[1, 8], [9, 16]], { to:24 }),
      ...tkEser(TK_E.yemeni, [[1, 10]], { to:30 })
    ] },
  { id:"turku-aksak", unit:"turku", since:2, notes:[],
    title:{ tr:"Aksak türküler: 5/8, 7/8, 9/8", en:"Limping türküs: 5/8, 7/8, 9/8" },
    text:[
      { tr:"Türkülerde aksak usuller çoktur: arşivde 60 türkü Aksak (9/8: 2+2+2+3), 13 türkü Türk Aksağı (5/8: 2+3). Yedi zamanlılar (7/8) çoğunlukla Devr-i Hindî ya da Devr-i Turan ile yazılıdır; Devr-i Turan'ın kalıbı uygulamada yok, bu yüzden 7/8'i yalnız usul olarak vuracaksın.",
        en:"Limping usuls are common in türküs: in the archive 60 türküs are in Aksak (9/8: 2+2+2+3) and 13 in Türk Aksağı (5/8: 2+3). The seven-beat ones (7/8) are mostly written in Devr-i Hindî or Devr-i Turan; Devr-i Turan's pattern isn't in the app, so you'll tap 7/8 only as an usul." },
      { tr:"Mayadağ'dan Kalkan Kazlar (Hicaz, Türk Aksağı, ♩=102; ilk kıta ölçü 1–57) ve Karanfil Oylum Oylum (Hicaz, Aksak, ♩=72). İkisinde de yöre yazılı değil.",
        en:"Mayadağ'dan Kalkan Kazlar (Hicaz, Türk Aksağı, ♩=102; first verse bars 1–57) and Karanfil Oylum Oylum (Hicaz, Aksak, ♩=72). Neither score names a region." }
    ],
    tips:[
      { tr:"Aksak usulde uzun vuruş hep sondadır: 5/8'i 2+3, 7/8'i 3+2+2 (Devr-i Hindî), 9/8'i 2+2+2+3 diye say.", en:"In a limping usul the long beat is always last: count 5/8 as 2+3, 7/8 as 3+2+2 (Devr-i Hindî), 9/8 as 2+2+2+3." }
    ],
    steps:[
      { type:"usultap", usul:"turkaksagi", mode:"mem", min:70 },
      { type:"usultap", usul:"devrihindi", mode:"tap", min:70 },
      { type:"usultap", usul:"aksak", mode:"mem", min:70 },
      ...tkEser(TK_E.mayadag, [[1, 8], [9, 21]], { to:57 }),
      ...tkEser(TK_E.karanfil, [[1, 4]])
    ] },
  { id:"turku-huseyni", unit:"turku", since:2, notes:[], makam:"huseyni",
    title:{ tr:"Hüseynî türküleri", en:"Türküs in Hüseynî" },
    text:[
      { tr:"Arşivdeki 356 türküden 34'ü Hüseynî'dir; Hicaz'dan (40) sonra en sık ikinci makam. Hüseynî'nin durağı Dügâh (La4), güçlüsü Hüseynî (Mi5); dizide Segâh (Si koma) ve çıkarken Evç (Fa♯5) kullanılır.",
        en:"Of the 356 türküs in the archive, 34 are in Hüseynî; after Hicaz (40) it is the second most common makam. Hüseynî's final is Dügâh (A4) and its dominant Hüseynî (E5); the scale uses Segâh (comma B) and Evç (F♯5) going up." },
      { tr:"A Fadimem (♩=99; yöre yazılı değil; ilk kıta ölçü 1–28) ve Bursa'nın Ufak Tefek Taşları (♩=90; yöre: Bursa; ilk kıta ölçü 1–32). İkisi de Aksak (9/8).",
        en:"A Fadimem (♩=99; no region named; first verse bars 1–28) and Bursa'nın Ufak Tefek Taşları (♩=90; region: Bursa; first verse bars 1–32). Both are in Aksak (9/8)." },
      TK_KOMA
    ],
    tips:[
      { tr:"Cümle sonlarında Dügâh'a (La4) inişi dinle: türkü orada karar verir.", en:"Listen for the descent to Dügâh (A4) at the phrase ends: that is where the türkü cadences." }
    ],
    steps:[
      { type:"usultap", usul:"aksak", mode:"mem", min:70 },
      { type:"rhythm", usul:"aksak", tempo:180, bars:3, min:55 },
      ...tkEser(TK_E.fadime, [[1, 8]], { to:28 }),
      ...tkEser(TK_E.bursa, [[1, 9]], { to:32 })
    ] },
  { id:"turku-ussak", unit:"turku", since:2, notes:[], makam:"ussak",
    title:{ tr:"Uşşak türküleri", en:"Türküs in Uşşak" },
    text:[
      { tr:"Arşivdeki 356 türküden 30'u Uşşak'tır (Hicaz 40, Hüseynî 34 ve Segâh 33'ten sonra). Uşşak'ın durağı da Dügâh'tır (La4), güçlüsü Nevâ (Re5); Segâh (Si koma) dizinin ikinci perdesidir.",
        en:"Of the 356 türküs in the archive, 30 are in Uşşak (after Hicaz 40, Hüseynî 34 and Segâh 33). Uşşak's final is also Dügâh (A4) and its dominant Nevâ (D5); Segâh (comma B) is the second degree." },
      { tr:"Dereboyu Kavaklar (♩=90; yöre: Giresun) ve Kalenin Burcu Muyam (♩=90; yöre yazılı değil; ilk kıta ölçü 1–24). İkisi de Sofyan.",
        en:"Dereboyu Kavaklar (♩=90; region: Giresun) and Kalenin Burcu Muyam (♩=90; no region named; first verse bars 1–24). Both are in Sofyan." },
      TK_KOMA
    ],
    tips:[
      { tr:"Hüseynî ile Uşşak'ın durağı aynı: farkı güçlüde ara (Mi5 ya da Re5).", en:"Hüseynî and Uşşak share the final: look for the difference in the dominant (E5 or D5)." }
    ],
    steps:[
      { type:"usultap", usul:"sofyan", mode:"mem", min:70 },
      ...tkEser(TK_E.dereboyu, [[1, 4]]),
      ...tkEser(TK_E.kale, [[1, 8]], { to:24 })
    ] },
  { id:"zeybek-2", unit:"turku", since:2, notes:[],
    title:{ tr:"Zeybek: 9/4 ve 9/8", en:"Zeybek: 9/4 and 9/8" },
    text:[
      { tr:"Arşivdeki 19 zeybekten 8'i Ağır Aksak (9/4), 8'i Aksak (9/8) ile yazılıdır. İkisinin vuruşları aynıdır (2+2+2+3), yalnız mertebe farklıdır; uygulamanın Zeybek usulü de Ağır Aksak'ın vuruşlarıdır.",
        en:"Of the 19 zeybeks in the archive, 8 are written in Ağır Aksak (9/4) and 8 in Aksak (9/8). Their strokes are the same (2+2+2+3), only the note value differs; the app's Zeybek usul uses Ağır Aksak's strokes too." },
      { tr:"Kordon Zeybeği (Rast, Ağır Aksak, ♩=114; yöre yazılı değil) ve İzmir Zeybeği (Hicaz, Aksak, ♩=54; yöre: İzmir). İzmir Zeybeği 9/8 yazılı olsa da temposu yavaştır: dörtlük 54. İkisi de sözsüzdür ve notada bölüm işareti yok.",
        en:"Kordon Zeybeği (Rast, Ağır Aksak, ♩=114; no region named) and İzmir Zeybeği (Hicaz, Aksak, ♩=54; region: İzmir). Although İzmir Zeybeği is written in 9/8 its tempo is slow: quarter = 54. Both are instrumental and the scores have no section marks." }
    ],
    tips:[
      { tr:"9/8 yazılı yavaş bir eserde sekizlikleri say, dörtlükleri değil: 2+2+2+3 sekizlik.", en:"In a slow piece written in 9/8, count the eighths, not the quarters: 2+2+2+3 eighths." }
    ],
    steps:[
      { type:"usultap", usul:"zeybek", mode:"mem", min:70 },
      ...tkEser(TK_E.kordon, [[1, 8]]),
      { type:"usultap", usul:"aksak", mode:"mem", min:70 },
      ...tkEser(TK_E.izmir, [[1, 8]])
    ] },
  { id:"rumeli-2", unit:"turku", since:2, notes:[],
    title:{ tr:"Rumeli türküleri", en:"Rumeli türküsü" },
    text:[
      { tr:"Arşivde 16 eserin formu Rumeli türküsüdür; usulleri çoğunlukla Aksak (5) ve Sofyan (4). Trakya ünitesindeki Rumeli havası (7/8) bir oyun havası etüdüydü; burada notası arşivde olan iki türkü var.",
        en:"In the archive 16 pieces have the form Rumeli türküsü; their usuls are mostly Aksak (5) and Sofyan (4). The Rumeli tune (7/8) in the Thrace unit was a dance étude; here are two türküs whose scores are in the archive." },
      { tr:"Gemi Kalkar Suları Akar (Hicaz, Sofyan, ♩=78) ve Akzâdeler Giyer (Hüseynî, Aksak, ♩=102; ilk kıta ölçü 1–38). İkisinin de notasında yöre “Rumeli” yazılı.",
        en:"Gemi Kalkar Suları Akar (Hicaz, Sofyan, ♩=78) and Akzâdeler Giyer (Hüseynî, Aksak, ♩=102; first verse bars 1–38). Both scores give the region as “Rumeli”." },
      TK_KOMA
    ],
    tips:[
      { tr:"Akzâdeler Giyer'in aranağmesi 16 ölçüdür: söz 17. ölçüde başlar.", en:"Akzâdeler Giyer has a 16-bar aranağme: the words start in bar 17." }
    ],
    steps:[
      { type:"usultap", usul:"sofyan", mode:"mem", min:70 },
      ...tkEser(TK_E.gemi, [[1, 8]]),
      { type:"usultap", usul:"aksak", mode:"mem", min:70 },
      ...tkEser(TK_E.akzade, [[1, 16]], { to:38 })
    ] },
  { id:"turku-susleme", unit:"turku", since:2, notes:[], makam:"ussak",
    title:{ tr:"Türküde süsleme: çarpma ve tril", en:"Ornaments in the türkü: grace notes and trills" },
    text:[
      { tr:"Arşiv notalarında süsleme işaretlidir. Fındıklı Bizim Yolumuz'da (Uşşak, Aksak, ♩=108; yöre yazılı değil) ilk kıtada (ölçü 1–26) çarpma Çargâh (Do5), Gerdâniye (Sol5) ve Evç'te, tril Hüseynî (Mi5) ve Çargâh'tadır. Çıkayım Gideyim Urumeline'de (Hüseynî, Sofyan, ♩=72; yöre yazılı değil) çarpma Nevâ (Re5) ve Segâh'tadır (Si koma).",
        en:"Ornaments are marked in the archive scores. In Fındıklı Bizim Yolumuz (Uşşak, Aksak, ♩=108; no region named), in the first verse (bars 1–26), grace notes fall on Çargâh (C5), Gerdâniye (G5) and Evç, trills on Hüseynî (E5) and Çargâh. In Çıkayım Gideyim Urumeline (Hüseynî, Sofyan, ♩=72; no region named) grace notes fall on Nevâ (D5) and Segâh (comma B)." },
      { tr:"Önce süslemeyi tek notada çalış, sonra türküde notadaki yerinde çal.",
        en:"First practise the ornament on a single note, then play it in the türkü where the score marks it." },
      TK_KOMA
    ],
    tips:[
      { tr:"Süsleme ana notanın süresinden çalınır: ana nota yine ölçüde yerinde başlar ve en uzun o kalır.", en:"The ornament takes its time from the main note: the main note still starts in its place in the bar and stays the longest." }
    ],
    steps:[
      { type:"listen", notes:[72], orn:{ kind:"carpma", dir:"up" } },
      { type:"ornament", kind:"carpma", dir:"up", note:72, makam:"ussak", comma:22, n:4 },
      { type:"listen", notes:[76], orn:{ kind:"tril", dir:"up" } },
      { type:"ornament", kind:"tril", dir:"up", note:76, makam:"ussak", comma:40, rate:5, sec:2 },
      { type:"usultap", usul:"aksak", mode:"mem", min:70 },
      ...tkEser(TK_E.findikli, [[1, 6]], { to:26 }),
      { type:"ornament", kind:"carpma", dir:"up", note:74, makam:"huseyni", comma:31, n:4 },
      { type:"usultap", usul:"sofyan", mode:"mem", min:70 },
      ...tkEser(TK_E.cikayim, [[1, 12]])
    ] }
];
LESSONS.splice(LESSONS.findIndex(l => l.id === "trakya-giris"), 0, ...TURKU);
// ---- S4.5 Taksim 6–9 ----
// İleri ünitesinde taksim-2'den sonra dört ders (S3.5 şed dersleri bunlardan sonra gelir). Ölçütler skills.js'te: geçki
// seyir { via } (S3.4 geckiAnalysis), tiz seyir { focus:"tiz" } (tizAnalysis: seyir alanının üst dörtlüsünde cümle),
// usullü seyir { usul, tempo } (usulTaksimAnalysis: darbuka band.js kalıbıyla çalar, cümle sonları usul başında mı),
// uzun seyir { focus:"uzun" } (uzunAnalysis: süre dörde bölünür, giriş/gelişme/meyan/karar ayrı puanlanır). Taksim tanımı
// ve türleri TDV "Taksim (Mûsiki)" (Teori → Formlar, docs/KAYNAKLAR.md §11); usul üstünde taksim ve dört bölümlü plan bu
// derslerin alıştırmasıdır, gelenek bilgisi olarak anlatılmaz. Perde adları ve farkları learn.js dizilerinden hesaplanır.
{ const P = c => LLEARN.perdeName(c), M = id => LLEARN.makamById(id);
  const names = cs => cs.map(P).join(", ");
  const top = mk => Math.max(...M(mk).asc, ...M(mk).desc), zone = mk => P(top(mk) - 22) + "–" + P(top(mk));
  const rs = LLEARN.makamDiff(M("rast"), M("suzinak")), hk = LLEARN.makamDiff(M("huseyni"), M("karcigar"));
  insertLessonAfter("taksim-2",
  { id:"taksim-gecki", unit:"ileri", since:2, notes:[], makam:"rast",
    title:{ tr:"Taksim 6: geçkili taksim", en:"Taksim 6: a taksim with a geçki" },
    text:[
      { tr:"Taksim bir ya da birkaç makamda yapılan doğaçlama seyirdir (Teori → Formlar). Geçki derslerinde bir ezginin başka bir makamın perdelerine gidip döndüğünü gördün; şimdi bunu taksimde yapacaksın: ana makamla başla, geçilen makamın perdelerine uğra, ana makama dön ve onun durağında karar ver.",
        en:"A taksim is an improvised seyir in one or more makams (Theory → Forms). In the geçki lessons you saw a melody go to another makam's perdes and come back; now you do it in a taksim: start in the main makam, visit the other makam's perdes, return to the main makam and resolve on its final." },
      { tr:"Rast'tan Sûzinak rengine geçişte değişen perdeler: Rast'ta " + names(rs.only) + ", Sûzinak'ta " + names(rs.other) + ". Hüseynî'den Karcığar rengine: Hüseynî'de " + names(hk.only) + ", Karcığar'da " + names(hk.other) + ".",
        en:"Going from Rast into Sûzinak's colour the perdes that change are: Rast " + names(rs.only) + ", Sûzinak " + names(rs.other) + ". From Hüseynî into Karcığar's colour: Hüseynî " + names(hk.only) + ", Karcığar " + names(hk.other) + "." },
      { tr:"Ölçülen: ana makamın seyir puanı, geçilen makamın ayıran perdelerine en az iki ayrı uğrayış ve sonunda ana makamın durağında karar (Geçki derslerindeki ölçüt).",
        en:"What is measured: the main makam's seyir score, at least two separate visits to the perdes that set the other makam apart, and a final cadence on the main makam's final (the measure from the Geçki lessons)." }
    ],
    tips:[
      { tr:"Önce ana makamı birkaç cümleyle kur; geçkiye ancak makam yerleşince gir.", en:"First set up the main makam with a few phrases; only go into the geçki once the makam is established." },
      { tr:"Geçkiden çıkarken ana makamın değişen perdesini açıkça çal: dönüş onunla duyulur.", en:"Coming out of the geçki, play the main makam's changed perde clearly: that is how the return is heard." }
    ],
    steps:[
      { type:"seyir", makam:"rast", via:"suzinak", sec:60, min:60 },
      { type:"seyir", makam:"huseyni", via:"karcigar", sec:60, min:60 }
    ] },
  { id:"taksim-tiz", unit:"ileri", since:2, notes:[], makam:"rast",
    title:{ tr:"Taksim 7: meyan ve tiz bölge", en:"Taksim 7: meyan and the upper register" },
    text:[
      { tr:"Şarkıda meyan, ezginin başka perdelere ve makamlara gittiği bölümdür (Teori → Formlar). Bu derslerde taksimin ortasında tiz bölgede gezinilen kısma da meyan diyoruz: taksim pes ve orta bölgede kurulduktan sonra seyir alanının üst ucuna çıkar, orada en az bir cümle söyler ve yeniden durağa iner.",
        en:"In a şarkı the meyan is the section where the melody goes to other perdes and makams (Theory → Forms). In these lessons we also call meyan the middle part of a taksim that moves in the upper register: once the taksim is set up low and in the middle, it climbs to the top of the seyir range, says at least one phrase there and comes back down to the final." },
      { tr:"Seyir alanı burada makamın uygulamadaki dizisidir; üst dörtlüsü en tiz perdeden bir tam dörtlü (22 koma) aşağısına kadar uzanır: Rast'ta " + zone("rast") + ", Hicaz'da " + zone("hicaz") + ".",
        en:"Here the seyir range is the makam's scale in the app; its upper fourth runs from the highest perde down a perfect fourth (22 commas): " + zone("rast") + " in Rast, " + zone("hicaz") + " in Hicaz." },
      { tr:"Ölçülen: seyir puanı, en az bir cümlenin (uzun notalarının çoğu) üst dörtlüde kalması ve dizinin en tiz perdesine ulaşman.",
        en:"What is measured: the seyir score, at least one phrase staying (most of its long notes) in the upper fourth, and reaching the top perde of the scale." }
    ],
    tips:[
      { tr:"Tiz bölgeye birden sıçrama; güçlüden adım adım çık. Klarino bölgesinde nefes desteğini artır.", en:"Don't jump to the top; climb step by step from the dominant. Give more breath support in the clarion register." },
      { tr:"Tizde kısa bir cümle yeter; sonra inişi acele etme.", en:"A short phrase up high is enough; then don't rush the descent." }
    ],
    steps:[
      { type:"seyir", makam:"rast", sec:60, min:60, focus:"tiz" },
      { type:"seyir", makam:"hicaz", sec:60, min:60, focus:"tiz" }
    ] },
  { id:"taksim-usullu", unit:"ileri", since:2, notes:[], makam:"rast",
    title:{ tr:"Taksim 8: usul üstünde taksim", en:"Taksim 8: a taksim over a usul" },
    text:[
      { tr:"Taksim bir usule bağlı kalmadan yapılır (Teori → Formlar). Bu derste ise bir alıştırma yapacaksın: Eşlik'in darbukası bir usulü sabit tempoda çalarken sen serbestçe, notaya bağlı olmadan çalacaksın. Ezginin içi serbest kalır; yalnız cümlelerin son notası usulün başına, ilk düme denk gelmeli.",
        en:"A taksim is played without being tied to a usul (Theory → Forms). In this lesson you do an exercise: while the Play-along darbuka plays a usul at a steady tempo, you play freely, without a score. Inside the phrase you are free; only the last note of each phrase should land on the start of the usul, the first düm." },
      { tr:"Önce usulü dinleyip say. Sonra iki adımda çal: Rast'ta Sofyan (4/4), Hicaz'da Düyek (8/8). Ölçülen: seyir puanı ve cümle sonlarının (en az 300 ms tutulan son nota) kaçta kaçının usul başına denk geldiği.",
        en:"First listen to the usul and count it. Then play in two steps: Rast over Sofyan (4/4), Hicaz over Düyek (8/8). What is measured: the seyir score and how many phrase endings (a last note held at least 300 ms) land on the start of the usul." }
    ],
    tips:[
      { tr:"Bir döngüyü dinleyerek başla; ilk cümleni ikinci döngünün başına doğru bitir.", en:"Start by listening to one cycle; aim to end your first phrase at the start of the second cycle." },
      { tr:"Cümle erken biterse kalış notasını uzat, geç kalacaksa bir notayı atla: darbuka seni beklemez.", en:"If a phrase ends early, hold the resting note longer; if it will be late, drop a note: the darbuka doesn't wait for you." }
    ],
    steps:[
      { type:"usultap", usul:"sofyan", mode:"listen" },
      { type:"seyir", makam:"rast", usul:"sofyan", tempo:72, sec:60, min:55 },
      { type:"usultap", usul:"duyek", mode:"listen" },
      { type:"seyir", makam:"hicaz", usul:"duyek", tempo:144, sec:60, min:55 }
    ] },
  { id:"taksim-uzun", unit:"ileri", since:2, notes:[], makam:"rast",
    title:{ tr:"Taksim 9: iki dakikalık taksim", en:"Taksim 9: a two-minute taksim" },
    text:[
      { tr:"Şimdiye kadar taksimin parçalarını ayrı ayrı çalıştın: cümle, seyir, çeşni, meyan, karar. Bu derste hepsini iki dakikalık tek bir taksimde birleştireceksin. Plan dört bölüm, her biri yaklaşık 30 saniye:",
        en:"So far you practised the parts of a taksim separately: phrase, seyir, çeşni, meyan, cadence. In this lesson you join them in a single two-minute taksim. The plan has four parts of about 30 seconds each:" },
      { tr:"1) Giriş: makamın seyrine uygun yerden başla (çıkıcıda durak civarı, inici-çıkıcıda güçlü civarı, inicide tiz). 2) Gelişme: durak ile güçlü arasını gez, güçlüde yarım karar ver. 3) Meyan: üst dörtlüye çık, orada en az bir cümle. 4) Karar: durağa in ve uzunca tut.",
        en:"1) Opening: start where the makam's seyir starts (near the final in ascending makams, around the dominant in descending-ascending ones, high in descending ones). 2) Development: move between the final and the dominant, make a half cadence on the dominant. 3) Meyan: climb to the upper fourth, at least one phrase there. 4) Cadence: come down to the final and hold it." },
      { tr:"Uygulama çaldığın süreyi dört eşit parçaya böler ve her bölümü kendi ölçütüyle ayrı puanlar; sonuçta dört satır görürsün. Bu plan bu dersin alıştırmasıdır; ustaların taksimleri böyle bir kalıba uymak zorunda değildir.",
        en:"The app splits your playing time into four equal parts and scores each part with its own measure; the result shows four lines. This plan is this lesson's exercise; masters' taksims need not fit such a mould." }
    ],
    tips:[
      { tr:"Saati izle: yaklaşık 30, 60 ve 90. saniyede bir sonraki bölüme geç.", en:"Watch the clock: move to the next part at about 30, 60 and 90 seconds." },
      { tr:"Bölüm geçişlerini nefesle yap; kısa bir sessizlik cümleyi bitirir.", en:"Change parts on a breath; a short silence ends the phrase." }
    ],
    steps:[
      { type:"seyir", makam:"rast", sec:120, min:60, focus:"uzun" },
      { type:"seyir", makam:"hicaz", sec:120, min:60, focus:"uzun" }
    ] });
}

// ---- S4.3 Fasıl ve eşlik ----
// Dört ders (İleri, şed derslerinden sonra): aranağme, şarkıda söz arası, fasıl sırası, eşlikle çalma.
// Aranağme ve şarkı tanımı teori.js "form" konusundan (thRead; ikinci kez yazılmaz). Fasıl bilgisi yalnız TDV "Fasıl
// (Mûsiki)" maddesinden (İsmail Hakkı Özkan, 1995; docs/KAYNAKLAR.md §11). Aranağme: arşivin 77 aranağmesinden 76'sının
// bestecisi kayıtlı değil (lisans-belirsiz.csv); telifsiz tek aranağme Muallim İsmail Hakkı Bey'in Hicazkâr Aranağmesi.
// Söz araları scripts/soz-arasi.js ile bulundu (SymbTr hecesi; "Saz" hecesi ve hecesiz ölçü saz arası). band adımı band.js.
const HICAZKAR_AR = { arsiv:"hicazkar--aranagme--aksak--1--muallim_ismail_hakki_bey", name:{ tr:"Hicazkâr Aranağme (Muallim İsmail Hakkı Bey)", en:"Hicazkâr Aranağme (Muallim İsmail Hakkı Bey)" } };
const AGLAMAZ = { arsiv:"ussak--sarki--aksak--aglamaz_mi--haci_arif_bey", name:{ tr:"Ağlamaz mı Çeşm-i Hasret (Hacı Ârif Bey)", en:"Ağlamaz mı Çeşm-i Hasret (Hacı Ârif Bey)" } };
const KALENIN = { arsiv:"ussak--turku--sofyan--kalenin_burcu_muyam--", name:{ tr:"Kalenin Burcu Muyam", en:"Kalenin Burcu Muyam" } };
insertLessonAfter("sed-3",
  { id:"aranagme", unit:"ileri", since:2, notes:[], makam:"hicazkar",
    title:{ tr:"Aranağme", en:"The aranağme" },
    text:[
      { tr:"Aranağme, şarkının mısraları arasında ve şarkıları birbirine bağlarken çalınan saz nağmesidir. Önce Teori'deki tanımı oku, sonra arşivden bir aranağmeyi bölüm bölüm çal: Muallim İsmail Hakkı Bey'in Hicazkâr Aranağmesi (Aksak 9/8, 36 ölçü).",
        en:"An aranağme is the instrumental phrase played between the lines of a şarkı and when linking şarkıs to one another. First read the definition from the Theory page, then play an aranağme from the archive section by section: Muallim İsmail Hakkı Bey's Hicazkâr Aranağme (Aksak 9/8, 36 bars)." },
      { tr:"Eser dört bölümde çalışılır: ölçü 1–8 (dört ölçülük cümle iki kez), 9–16 (Rast'ta karar), 17–28 ve 29–36. Hicazkâr'ın durağı Rast, güçlüsü Gerdâniye'dir; bölüm sonlarında hangi perdede durduğuna dikkat et.",
        en:"The piece is learned in four sections: bars 1–8 (a four-bar phrase played twice), 9–16 (cadence on Rast), 17–28 and 29–36. Hicazkâr's final is Rast and its dominant Gerdâniye; notice which perde each section stops on." }
    ],
    tips:[{ tr:"Arşivdeki aranağmelerin çoğunun bestecisi kayıtlı değil; arşivde Eserler → Nota arşivi → form süzgecinden hepsini dinleyebilirsin.", en:"Most aranağmes in the archive have no composer on record; you can listen to all of them in Pieces → Score archive with the form filter." }],
    steps:[
      thRead("form", [["text", 0], ["text", 4]]),
      { type:"read", title:{ tr:"Aranağme fasılda", en:"The aranağme in the fasıl" }, body:[
        { tr:"TDV'nin Fasıl maddesine göre XIX. yüzyılın ikinci yarısından sonra şarkı fasılların merkezine geçti ve ince saz toplulukları şarkıları birbirine ara nağmelerle bağladı. Maddenin yazıldığı yıllardaki fasılda da şarkılar, usulleri ağırdan yürüğe sıralanıp ara nağmelerle bağlanarak okunur.",
          en:"According to TDV's article on the fasıl, from the second half of the 19th century the şarkı moved to the centre of the fasıl and ince saz ensembles linked the şarkıs with interludes (ara nağme). In the fasıl of the years the article was written, too, şarkıs are sung with their usuls ordered from slow to fast and linked by ara nağmes." }] },
      { type:"soru", items:[
        { q:{ tr:"Aranağme nedir?", en:"What is an aranağme?" },
          opts:[{ tr:"Şarkının mısraları arasında ya da şarkıları bağlarken çalınan saz nağmesi", en:"An instrumental phrase played between a şarkı's lines or to link şarkıs" }, { tr:"Usulsüz doğaçlama", en:"A free improvisation without usul" }, { tr:"Peşrevin her haneden sonra dönen bölümü", en:"The section of a peşrev that returns after each hane" }], ok:0,
          why:{ tr:"Usulsüz doğaçlama taksimdir; haneden sonra dönen bölüm mülâzimedir.", en:"A free improvisation is a taksim; the section returning after each hane is the mülâzime." } },
        { q:{ tr:"Fasılda şarkılar nasıl sıralanır?", en:"How are the şarkıs ordered in a fasıl?" },
          opts:[{ tr:"Usulleri ağırdan yürüğe", en:"By usul, from slow to fast" }, { tr:"Yürükten ağıra", en:"From fast to slow" }, { tr:"Her şarkı başka makamda", en:"Each şarkı in a different makam" }], ok:0,
          why:{ tr:"Fasıl eserleri usul bakımından ağırdan yürüğe sıralanır ve aynı makamdadır.", en:"Fasıl pieces go from slow to fast usuls and are in the same makam." } },
        { q:{ tr:"Hicazkâr'ın durağı hangi perdedir?", en:"Which perde is Hicazkâr's final?" },
          opts:["Rast", "Dügâh", "Nevâ", "Gerdâniye"], ok:0,
          why:{ tr:"Hicazkâr Rast'ta karar verir; güçlüsü Gerdâniye'dir.", en:"Hicazkâr cadences on Rast; its dominant is Gerdâniye." } }
      ] },
      ...eserSteps(HICAZKAR_AR.arsiv, HICAZKAR_AR.name, [[1, 8], [9, 16], [17, 28], [29, 36]])
    ] },
  { id:"sarki-eslik", unit:"ileri", since:2, notes:[], makam:"ussak",
    title:{ tr:"Şarkıda söz arası", en:"Filling between the lines of a şarkı" },
    text:[
      { tr:"Hanende şarkıyı okurken saz ezgiyi onunla birlikte sade çalar; söz bitince, sesin sustuğu ölçülerde nağme sazdadır. Bu derste Hacı Ârif Bey'in Uşşak şarkısı Ağlamaz mı Çeşm-i Hasret'i (Aksak 9/8) bu iki rolle çalışacaksın.",
        en:"While the singer sings the şarkı, the instrument plays the tune along plainly; when the words stop, in the bars where the voice is silent, the melody belongs to the instrument. In this lesson you work through Hacı Ârif Bey's Uşşak şarkı Ağlamaz mı Çeşm-i Hasret (Aksak 9/8) in these two roles." },
      { tr:"SymbTr notasındaki hecelere göre sözlü ölçüler 1–3, 6–8, 11–14, 17–19, 22–24 ve 27–30; söz araları (hecesiz ya da \"Saz\" yazılı ölçüler) 4–5, 9–10, 15–16, 20–21, 25–26 ve 31. 22–31. ölçüler 6–15'in tekrarıdır. Sözlü ölçüleri sade, süslemeden çal; söz aralarını önce dinle, en sonda eserin tamamında onları sen doldur.",
        en:"From the syllables in the SymbTr score, the sung bars are 1–3, 6–8, 11–14, 17–19, 22–24 and 27–30; the gaps (bars with no syllable or marked \"Saz\") are 4–5, 9–10, 15–16, 20–21, 25–26 and 31. Bars 22–31 repeat 6–15. Play the sung bars plainly, without ornaments; listen to the gaps first, and in the whole piece at the end you fill them yourself." }
    ],
    tips:[{ tr:"Sözlü ölçülerde hanendenin önüne geçme: uzun notaları tam tut, nefesini mısra sonlarında al.", en:"In the sung bars don't run ahead of the singer: hold the long notes full length and breathe at the ends of lines." }],
    steps:[
      { type:"listen", ...AGLAMAZ, tempoPct:80 },
      { type:"piece", ...AGLAMAZ, from:1, to:3, tempoPct:60, mode:"free", min:4 },
      { type:"listen", ...AGLAMAZ, from:4, to:5, tempoPct:60 },
      { type:"piece", ...AGLAMAZ, from:6, to:8, tempoPct:60, mode:"free", min:4 },
      { type:"listen", ...AGLAMAZ, from:9, to:10, tempoPct:60 },
      { type:"piece", ...AGLAMAZ, from:11, to:14, tempoPct:60, mode:"free", min:4 },
      { type:"listen", ...AGLAMAZ, from:15, to:16, tempoPct:60 },
      { type:"piece", ...AGLAMAZ, from:17, to:19, tempoPct:60, mode:"free", min:4 },
      { type:"listen", ...AGLAMAZ, from:20, to:21, tempoPct:60 },
      { type:"piece", ...AGLAMAZ, tempoPct:80, mode:"tempo", min:70 }
    ] },
  { id:"fasil-sirasi", unit:"ileri", since:2, notes:[],
    title:{ tr:"Fasıl ve sırası", en:"The fasıl and its order" },
    text:[
      { tr:"Fasıl, aynı makamdaki eserlerin belli bir sırayla çalınıp okunduğu konserdir. Bu derste TDV İslâm Ansiklopedisi'nin Fasıl maddesinden klasik faslın sırasını ve bugünkü fasılın nasıl değiştiğini okuyacaksın.",
        en:"A fasıl is a concert in which pieces in the same makam are played and sung in a set order. In this lesson you read, from the TDV İslâm Ansiklopedisi article on the fasıl, the order of the classical fasıl and how today's fasıl has changed." }
    ],
    tips:[{ tr:"Arşivde aynı makamdan bir peşrev, bir şarkı ve bir saz semâîsi seçip arka arkaya dinle: küçük bir fasıl kurmuş olursun.", en:"In the archive, pick a peşrev, a şarkı and a saz semâîsi in the same makam and listen to them in a row: you've built a small fasıl." }],
    steps:[
      { type:"read", title:{ tr:"Fasıl ve sırası", en:"The fasıl and its order" }, body:[
        { tr:"Fasıl, hepsi aynı makamda olan, form bakımından büyükten küçüğe, usul bakımından ağırdan yürüğe sıralanmış eserlerle verilen konserdir; çalıp söyleyen topluluğa fasıl heyeti denir. Eski güfte mecmualarında bir makamın eserlerinin toplandığı bölüme de fasıl denirdi (rast faslı gibi).",
          en:"A fasıl is a concert of pieces all in the same makam, ordered from large to small forms and from slow to fast usuls; the ensemble that plays and sings it is the fasıl heyeti. In old lyric anthologies the section collecting one makam's pieces was also called a fasıl (the rast faslı, for example)." },
        { tr:"Klasik sıra (XIX. yüzyıla kadar): taksim, peşrev, kâr, birinci beste, ikinci beste, ağır semâî, yürük semâî, saz semâîsi. Fasılda şarkı da okunacaksa şarkılar ağırdan yürüğe sıralanıp ağır semâî ile yürük semâî arasına girer. Peşrev ile saz semâîsi saz eserleridir: biri taksimden sonra faslı açar, öteki kapatır.",
          en:"The classical order (up to the 19th century): taksim, peşrev, kâr, first beste, second beste, ağır semâî, yürük semâî, saz semâîsi. If şarkıs are sung too, they go from slow to fast between the ağır semâî and the yürük semâî. The peşrev and the saz semâîsi are instrumental: one opens the fasıl after the taksim, the other closes it." },
        { tr:"XIX. yüzyılın ikinci yarısından sonra şarkı fasılların merkezine geçti, büyük formlar ihmal edildi ve şarkılar ara nağmelerle bağlandı. Maddenin yazıldığı yıllarda (1995) kâr, beste ve semâî çoğu zaman çalınmaz: şarkılar usulleri ağırdan yürüğe sıralanıp ara nağmelerle bağlanır, ortada bir saz taksim yapar; sonda bazen saz semâîsi, bazen longa, sirto ya da bir oyun havası çalınır.",
          en:"From the second half of the 19th century the şarkı moved to the centre of the fasıl, the large forms were neglected and the şarkıs were linked with ara nağmes. In the years the article was written (1995) the kâr, beste and semâî are mostly left out: şarkıs are sung from slow to fast usuls linked by ara nağmes, an instrument plays a taksim in the middle, and at the end sometimes a saz semâîsi, sometimes a longa, a sirto or a dance tune is played." },
        { tr:"İleri ünitesinin dersleri bu parçalara hazırlar: aranağme, şarkıda söz arası, taksim ve eşlikle çalma.",
          en:"The lessons of the Advanced unit prepare you for these parts: the aranağme, filling between a şarkı's lines, the taksim and playing with the band." }] },
      { type:"soru", min:5, items:[
        { q:{ tr:"Fasıldaki eserler nasıl sıralanır?", en:"How are the pieces in a fasıl ordered?" },
          opts:[{ tr:"Aynı makamda, büyük formdan küçüğe, ağır usulden yürüğe", en:"Same makam, large forms to small, slow usuls to fast" }, { tr:"Her eser başka makamda, küçükten büyüğe", en:"Each piece in another makam, small to large" }, { tr:"Yürük usulden ağıra", en:"From fast usuls to slow" }], ok:0,
          why:{ tr:"TDV: hepsi aynı makamda, form bakımından büyükten küçüğe, usul bakımından ağırdan yürüğe.", en:"TDV: all in the same makam, large to small in form, slow to fast in usul." } },
        { q:{ tr:"Klasik fasılda taksimden sonra ilk eser hangisidir?", en:"In the classical fasıl, which piece comes first after the taksim?" },
          opts:[{ tr:"Peşrev", en:"Peşrev" }, { tr:"Saz semâîsi", en:"Saz semâîsi" }, { tr:"Yürük semâî", en:"Yürük semâî" }, { tr:"Şarkı", en:"Şarkı" }], ok:0,
          why:{ tr:"Sıra taksim, peşrev, kâr, besteler… diye başlar.", en:"The order begins taksim, peşrev, kâr, the bestes…" } },
        { q:{ tr:"Klasik fasıl hangi eserle biter?", en:"Which piece ends the classical fasıl?" },
          opts:[{ tr:"Saz semâîsi", en:"Saz semâîsi" }, { tr:"Ağır semâî", en:"Ağır semâî" }, { tr:"Kâr", en:"Kâr" }], ok:0,
          why:{ tr:"Yürük semâîden sonra saz semâîsi faslı kapatır.", en:"After the yürük semâî, the saz semâîsi closes the fasıl." } },
        { q:{ tr:"Klasik fasılda şarkı okunacaksa nereye girer?", en:"If şarkıs are sung in a classical fasıl, where do they go?" },
          opts:[{ tr:"Ağır semâî ile yürük semâî arasına", en:"Between the ağır semâî and the yürük semâî" }, { tr:"Peşrevden önce", en:"Before the peşrev" }, { tr:"Saz semâîsinden sonra", en:"After the saz semâîsi" }], ok:0,
          why:{ tr:"Şarkılar ağırdan yürüğe sıralanıp ağır semâî ile yürük semâî arasında okunur.", en:"The şarkıs are ordered slow to fast and sung between the ağır semâî and the yürük semâî." } },
        { q:{ tr:"Bugünkü fasılda şarkılar birbirine neyle bağlanır?", en:"In today's fasıl, what links the şarkıs?" },
          opts:[{ tr:"Ara nağmelerle", en:"Ara nağmes (instrumental interludes)" }, { tr:"Peşrevlerle", en:"Peşrevs" }, { tr:"Hiçbir şeyle; aralarda susulur", en:"Nothing; there's silence between them" }], ok:0,
          why:{ tr:"Şarkılar usulleri ağırdan yürüğe sıralanıp ara nağmelerle bağlanır.", en:"The şarkıs are ordered from slow to fast usuls and linked by ara nağmes." } },
        { q:{ tr:"Maddeye göre bugünkü fasılda taksim nerede yapılır?", en:"According to the article, where is the taksim in today's fasıl?" },
          opts:[{ tr:"Faslın ortasında, bir saz", en:"In the middle of the fasıl, by an instrument" }, { tr:"Hiç yapılmaz", en:"It isn't played at all" }, { tr:"Yalnız en sonda, hanende", en:"Only at the very end, by the singer" }], ok:0,
          why:{ tr:"Faslın ortasında bir saz taksim yapar; sonda saz semâîsi, longa, sirto ya da oyun havası çalınabilir.", en:"An instrument plays a taksim in the middle; at the end a saz semâîsi, longa, sirto or dance tune may be played." } }
      ] }
    ] },
  { id:"eslikle-calma", unit:"ileri", since:2, notes:[], makam:"ussak",
    title:{ tr:"Eşlikle çalmak", en:"Playing with the band" },
    text:[
      { tr:"Toplu çalışta ezgi usulün üstüne oturur: darbukanın düm ve tekleri seni bekleyen bir metronom değildir, grup kendi temposunda gider. Bu derste iki Uşşak eserini önce notadan öğrenecek, sonra Eşlik sekmesinde darbuka, bas ve udla çalacaksın: Kalenin Burcu Muyam (anonim türkü, Sofyan; SymbTr notasında 1–8. ölçüler \"aranağme\" diye işaretli) ve Şarkıda söz arası dersindeki Ağlamaz mı Çeşm-i Hasret (Aksak).",
        en:"When playing together the tune sits on the usul: the darbuka's düm and tek are not a metronome that waits for you; the band keeps its own tempo. In this lesson you first learn two Uşşak pieces from the score, then play them in the Band tab with darbuka, bass and oud: Kalenin Burcu Muyam (anonymous türkü, Sofyan; bars 1–8 are marked \"aranağme\" in the SymbTr score) and Ağlamaz mı Çeşm-i Hasret (Aksak) from the lesson Filling between the lines of a şarkı." },
      { tr:"Eşlik, nota başlarının usulün vuruşlarına ne kadar oturduğunu ölçer (usule oturma, %). Adım, Eşlik'te değerlendirilen çalışların en iyisi en az %70 olunca geçer. Kulaklık tak ya da Ayarlar'da Hoparlör modunu aç; yoksa mikrofon grubu da duyar.",
        en:"The Band measures how well your note starts sit on the usul's strokes (in the groove, %). The step passes when your best assessed run in the Band reaches at least 70%. Wear headphones or turn on Speaker mode in Settings; otherwise the mic hears the band too." }
    ],
    tips:[{ tr:"Grubun ilk ölçüsünü çalmadan dinle ve düm'leri içinden say; eseri bir sonraki ölçünün düm'üyle başlat.", en:"Listen to the band's first bar without playing and count the düms in your head; start the piece on the next bar's düm." }],
    steps:[
      { type:"listen", ...KALENIN, from:1, to:24 },
      { type:"piece", ...KALENIN, from:1, to:24, mode:"free", min:4 },
      { type:"band", ...KALENIN, from:1, to:24, usul:"sofyan", makam:"ussak", tempo:90, min:70 },
      { type:"listen", ...AGLAMAZ },
      { type:"band", ...AGLAMAZ, usul:"aksak", makam:"ussak", tempo:120, min:70 }
    ] }
);
// ---- S4.7 Ezber ve icra ----
// İleri'nin sonu (isteğe bağlı nefes-3'ten önce gelen son dersten sonra): ezber (repertuvar basamak 3'ten Dostun Senden Irak
// Değil, bölüm bölüm; piece mode:"mem": önce ilk 4 ölçü silinir, sonra tümü gizli; pieces.js memRounds), kayit-dinle (basamak
// 3'ten Âkıbet Bezdirdi öğrenilir, kaydedilir, dinlenir; selfrate adımı: ton, perde, ritim, cümle 1–5, uygulamanın ölçtükleri
// yan yana, fark büyükse hoca kartı o beceriyi önerir; drills.js), program (Uşşak taksim + iki eser arka arkaya; her parçanın
// kendi eşiği). Program durmadan çalınmayı denetlemez: adımlar ayrı başlatılır (docs/BACKLOG.md S4.7).
const EZBER_ID = "ussak--ilahi--duyek--dostun_senden--ali_rifat_cagatay", EZBER_NAME = { tr:"Dostun Senden Irak Değil", en:"Dostun Senden Irak Değil" };
const KAYIT_ID = "ussak--sarki--curcuna--akibet_bezdirdi--haci_arif_bey", KAYIT_NAME = { tr:"Âkıbet Bezdirdi", en:"Âkıbet Bezdirdi" };
const ezberPart = (from, to) => [
  { type:"listen", arsiv:EZBER_ID, name:EZBER_NAME, from, to, tempoPct:80 },
  { type:"piece", arsiv:EZBER_ID, name:EZBER_NAME, from, to, tempoPct:80, mode:"tempo", min:70 },
  { type:"piece", arsiv:EZBER_ID, name:EZBER_NAME, from, to, tempoPct:80, mode:"mem", min:65 }
];
insertLessonAfter([...LESSONS].reverse().find(l => l.unit === "ileri" && !l.optional).id, { id:"ezber", unit:"ileri", since:2, notes:[],
  title:{ tr:"Ezber: notasız çalmak", en:"Memorising: playing without the score" },
  text:[
    { tr:"Ezberden çalınan eser kulağa ve parmaklara yerleşir: göz notadan kalkınca dinlemeye ve cümleye yer açılır. Bu derste Ali Rıfat Çağatay'ın Uşşak ilâhîsi Dostun Senden Irak Değil'i (Düyek, 31 ölçü) dört bölümde ezberleyeceksin: 1–8, 9–16, 17–23, 24–31.",
      en:"A piece played from memory settles in the ear and the fingers: once the eyes leave the score there is room for listening and phrasing. In this lesson you memorise Ali Rıfat Çağatay's Uşşak ilâhî Dostun Senden Irak Değil (Düyek, 31 bars) in four sections: 1–8, 9–16, 17–23, 24–31." },
    { tr:"Her bölümde: dinle, notaya bakarak tempolu çal, sonra ezber adımı. Ezber adımının ilk turunda notanın baştan 4 ölçüsü silinir, kalanına bakarak çalarsın; bu turu geçince ikinci turda notanın tamamı gizlenir. Her tur bitince nota açılır, nerede şaştığını görürsün. En sonda eserin tamamı ezberden.",
      en:"In each section: listen, play it in tempo reading the score, then the memory step. In its first round the first 4 bars of the score are erased and you read the rest; pass that and in the second round the whole score is hidden. After each round the score opens and you see where you slipped. At the end, the whole piece from memory." },
    { tr:"Benzeyen yerleri bilmek ezberi kısaltır: 5–8, 1–4'e çok benzer; 13–16, 9–12'yi tekrarlar; 21–23 de 17–19'a benzer. Neyin tekrar ettiğini, neyin değiştiğini ayır; ezberlemen gereken asıl yer değişen notalardır.",
      en:"Knowing what repeats shortens the work: bars 5–8 are very like 1–4, 13–16 repeat 9–12, and 21–23 are like 17–19. Tell apart what repeats and what changes; the changing notes are what you really have to memorise." }
  ],
  tips:[
    { tr:"Ezberi çalgısız da sına: ezgiyi içinden söyle, parmakları sessizce oynat.", en:"Test the memory without the clarinet too: sing the tune in your head and move your fingers silently." },
    { tr:"Takıldığın yerden değil bölüm başından yeniden başla; ezber cümleyle birlikte kurulur.", en:"Restart from the start of the section, not from where you got stuck; memory is built together with the phrase." }
  ],
  steps:[
    ...ezberPart(1, 8), ...ezberPart(9, 16), ...ezberPart(17, 23), ...ezberPart(24, 31),
    { type:"soru", items:[
      { q:{ tr:"Ezber adımının ilk turunda ne olur?", en:"What happens in the first round of the memory step?" },
        opts:[{ tr:"Notanın ilk 4 ölçüsü silinir, kalanına bakarak çalınır", en:"The first 4 bars are erased; you read the rest" }, { tr:"Notanın tamamı gizlenir", en:"The whole score is hidden" }, { tr:"Eser yavaş çalınır, nota açık kalır", en:"The piece is played slowly with the score open" }], ok:0,
        why:{ tr:"İlk turda yalnız baştaki 4 ölçü silinir; tümü ikinci turda gizlenir.", en:"Only the first 4 bars are erased in round 1; everything is hidden in round 2." } },
      { q:{ tr:"Ezberde takılınca nereden yeniden başlamak iyidir?", en:"When you get stuck memorising, where is it best to restart?" },
        opts:[{ tr:"Bölümün başından", en:"From the start of the section" }, { tr:"Takıldığın notadan", en:"From the note where you got stuck" }, { tr:"Eserin sonundan", en:"From the end of the piece" }], ok:0,
        why:{ tr:"Ezber cümleyle kurulur; bölüm başından başlamak cümleyi bütün tutar.", en:"Memory is built with the phrase; restarting at the section keeps the phrase whole." } }
    ] },
    { type:"piece", arsiv:EZBER_ID, name:EZBER_NAME, mode:"mem", min:70 }
  ] });
insertLessonAfter("ezber", { id:"kayit-dinle", unit:"ileri", since:2, notes:[],
  title:{ tr:"Kendini kaydet ve dinle", en:"Record yourself and listen back" },
  text:[
    { tr:"Çalarken kendi sesini olduğu gibi duymak zordur: dikkat parmaklarda ve notadadır. Kayıt bu yüzden hocasız çalışmanın en güçlü aracıdır. Bu derste Hacı Ârif Bey'in Uşşak şarkısı Âkıbet Bezdirdi'yi (Curcuna, 33 ölçü) öğrenip kendini kaydedecek ve kaydı dört maddede puanlayacaksın: ton, perde, ritim, cümle.",
      en:"While playing it is hard to hear yourself as you are: your attention is on the fingers and the score. That is why recording is the strongest tool for learning without a teacher. In this lesson you learn Hacı Ârif Bey's Uşşak şarkı Âkıbet Bezdirdi (Curcuna, 33 bars), record yourself and rate the recording on four items: tone, pitch, rhythm, phrasing." },
    { tr:"Son tempolu adımdan sonra Kayıt sekmesinde eserin tamamını kaydet ve dinle. Puanlama adımında uygulamanın ölçtükleri yanında görünür: ton ve perde bugünkü son kaydından, ritim son tempolu çalışından. Cümleyi uygulama ölçmez, onu yalnız sen değerlendirirsin. Puanınla ölçüm arasında 2 ya da daha çok fark varsa kulağın o maddede seni yanıltıyor olabilir: adım ve hoca kartı o becerinin alıştırmasını önerir.",
      en:"After the last in-tempo step, record the whole piece in the Recording tab and listen to it. In the rating step the app's measurements appear next to each item: tone and pitch from today's latest recording, rhythm from your latest in-tempo run. The app doesn't measure phrasing; only you judge that. If your score and the measurement differ by 2 or more, your ear may be misleading you on that item: the step and the coach card suggest an exercise for that skill." }
  ],
  tips:[
    { tr:"Kaydı hemen değil bir gün sonra dinlersen daha tarafsız duyarsın.", en:"You hear more objectively if you listen to the recording a day later rather than right away." },
    { tr:"Kayıt sekmesinde eski bir kaydını bugünküyle yan yana dinle; ilerlemeyi kulağınla duyarsın.", en:"In the Recording tab, play an old recording next to today's; you'll hear your progress." }
  ],
  steps:[
    ...eserSteps(KAYIT_ID, KAYIT_NAME, [[1, 8], [9, 16], [17, 24]]),
    { type:"selfrate" }
  ] });
insertLessonAfter("kayit-dinle", { id:"program", unit:"ileri", since:2, notes:[], makam:"ussak",
  title:{ tr:"Program: taksim ve iki eser", en:"A programme: taksim and two pieces" },
  text:[
    { tr:"Bir icra, parçaların tek tek çalınmasından fazlasıdır: aradaki sessizlik, nefes ve dikkat de programın parçasıdır. Bu derste Uşşak'ta kısa bir program çalacaksın: önce 3 dakikalık taksim, sonra Âkıbet Bezdirdi (nota açık, kendi temposunda), en sonda Dostun Senden Irak Değil (ezberden). Toplam yaklaşık 7 dakika.",
      en:"A performance is more than its pieces played one by one: the silence between them, the breath and the attention are part of the programme too. In this lesson you play a short Uşşak programme: first a 3-minute taksim, then Âkıbet Bezdirdi (score open, at its own tempo), and finally Dostun Senden Irak Değil (from memory). About 7 minutes in all." },
    { tr:"Üç adımı arka arkaya çal: bir adım bitince ara vermeden sonrakini başlat, bir sonuç kötü olsa da programı sonuna kadar götür. Her parçanın kendi eşiği var; geçmeyeni programdan sonra ayrıca çalış. Taksim aynı makamda olduğu için kulağın eserlere hazır girer: Dügâh'ta karar ver, sonra ilk eseri başlat.",
      en:"Play the three steps back to back: when one ends start the next without a break, and carry the programme to the end even if a result is poor. Each piece has its own threshold; work on the one that fails separately afterwards. Since the taksim is in the same makam, your ear enters the pieces ready: resolve on Dügâh, then start the first piece." }
  ],
  tips:[
    { tr:"Programı kaydet: Kayıt sekmesini açık tutup baştan sona çal, sonra dinle.", en:"Record the programme: keep the Recording tab running and play it start to finish, then listen back." },
    { tr:"Parçalar arasında yalnız bir nefes kadar dur.", en:"Pause between pieces only as long as a breath." }
  ],
  steps:[
    { type:"seyir", makam:"ussak", sec:180, min:60 },
    { type:"piece", arsiv:KAYIT_ID, name:KAYIT_NAME, mode:"tempo", min:75 },
    { type:"piece", arsiv:EZBER_ID, name:EZBER_NAME, mode:"mem", hidden:true, min:75 }
  ] });

// ---- S5.6 Öz denetim ----
// Ölçülemeyen şeyler (duruş, el) için check adımı. Maddeler Başlarken'deki durus-nefes ve eller listelerinin aynısı
// (yeni iddia yok); burada aylar sonra yeniden, ön kamera aynasıyla denetlenir
const ckFrom = (id, i) => LESSONS.find(l => l.id === id).steps[i].check;
insertLessonAfter("ariza-2", { id:"durus-2", unit:"temel", since:2, notes:[],
  title:{ tr:"Duruşa yeniden bak", en:"Check your posture again" },
  text:[{ tr:"Başlarken'de duruşu kurdun; haftalar içinde alışkanlıklar kayar. Şimdi aynı listeyi yeniden, kendine aynada ya da ön kamerada bakarak denetle. Tutmayan madde varsa birkaç gün çalarken onu düşün.",
          en:"You set up your posture in Getting started; habits drift over the weeks. Now check the same list again, looking at yourself in a mirror or the front camera. If an item doesn't hold, think about it while you play for a few days." }],
  tips:[{ tr:"Kendini yandan ve önden görmek için telefonu bir rafa yasla.", en:"Lean the phone on a shelf to see yourself from the side and the front." }],
  steps:[
    { type:"check", checkId:"durus2", title:{ tr:"Duruş", en:"Posture" }, get items(){ return ckFrom("durus-nefes", 1); } },
    { type:"hold", note:55, sec:6, min:50 }
  ] });
insertLessonAfter("ezgi-pes", { id:"el-2", unit:"temel", since:2, notes:[],
  title:{ tr:"Ellere yeniden bak", en:"Check your hands again" },
  text:[{ tr:"Pes bölgede bütün parmaklar iş başında. Ellerin duruşunu Başlarken'deki listeyle yeniden denetle: parmaklar deliklere yakın mı, başparmak sıkıyor mu?",
          en:"In the low register every finger is at work. Check your hands again with the list from Getting started: are the fingers close to the holes, is the thumb squeezing?" }],
  tips:[{ tr:"Parmakların kalktığını görmek için yavaş bir geçişi kamerada çal.", en:"Play a slow passage in front of the camera to see how high your fingers lift." }],
  steps:[
    { type:"check", checkId:"el2", title:{ tr:"Eller", en:"Hands" }, get items(){ return ckFrom("eller", 0); } },
    { type:"notes", notes:[55, 57, 59, 60, 62, 64, 62, 60, 59, 57, 55, 53, 52, 53, 55], maxMiss:3 }
  ] });

const pick = (x, lang) => x == null ? "" : typeof x === "string" ? x : (x[lang] || x.tr);

// ---- Ünite sınavları ----
// Sınav yalnız ilk müfredatın (since alanı olmayan) derslerinden kurulur: sonradan ünitelere eklenen dersler sınavın
// adımlarını kaydırmasın (geçilmiş sınav, adım indeksine bağlı kayıtla geçilmiş kalsın). Yeni adımlar sınava elle eklenir.
// Ünitenin kendisi sonradan eklendiyse (UNITS kaydında since) sınav onun bütün derslerinden kurulur: geçilmiş eski sınav yok.
// Her ünitenin sonunda karışık bir sınav: ünitenin derslerinden eşit aralıkla seçilen en çok altı dersin son (en zor)
// adımı, ünite kimliğinden türeyen sırayla karışık. Sınav ders zincirine girmez (sonraki dersleri kilitlemez);
// ünitenin bütün dersleri bitince açılır, geçilince ünitenin rozeti kazanılır (roadmap.js badgeList).
const EXAM_STEPS = 6;
// Kayıt öz değerlendirmesi (selfrate) beceri ölçmez: tekrara ve sınava girmez
const gatedStep = st => st.type !== "listen" && st.type !== "read" && st.type !== "selfrate" && !(st.type === "piece" && st.mode === "ladder");
// Adımı dersinden kopyalar: makam dersinin adımı makamını yanında taşır (günlük planda ve sınavda ders bağlamı yok)
const stepFrom = (l, st) => ({ ...st, ...(l.makam && !st.makam ? { makam: l.makam } : {}) });
// S5.3: sonradan eklenen derslerin sınav adımları. Eski ünitelerin sınavına SONA ve sabit sırayla eklenir: eski adımların
// indeksi kaymaz; sınavı önceden geçmiş kullanıcıda geçme kaydı (p.d) durur (lessonDone, sınav). since'li ünite (turku)
// bütün derslerinden kurulduğu için burada yok. Adımlar dersinden kopyalanır (stepFrom: makam bağlamı).
const exLesson = id => { const l = LESSONS.find(x => x.id === id); if(!l) throw new Error("sınav: ders yok " + id); return l; };
const exLast = (id, ok) => { const l = exLesson(id), g = l.steps.filter(ok); if(!g.length) throw new Error("sınav: adım yok " + id); return stepFrom(l, g[g.length - 1]); };
const exType = t => st => st.type === t;
const exSoru = (picks, min) => ({ type:"soru", min,
  items: picks.map(([id, j, k]) => exLesson(id).steps.filter(exType("soru"))[j].items[k]) });
const EXAM_EXTRA = {
  temel: () => [
    exLast("temel-tekrar", st => st.type === "piece" && st.id === "e-t10" && st.mode === "tempo"),
    // Okuma: süre (S1.4 okuma-2), donanım (okuma-3), dolap ve D.C. (okuma-4), ek çizgi (okuma-5)
    exSoru([["okuma-2", 0, 1], ["okuma-3", 0, 4], ["okuma-4", 0, 1], ["okuma-4", 0, 4], ["okuma-5", 0, 1]], 4)
  ],
  klarino: () => [
    exLast("ezgi-klarino", st => st.type === "piece" && st.id === "e-k3"),
    exLast("kirilma-1", exType("tech"))
  ],
  teknik: () => [
    exLast("artikulasyon-2", exType("artik")),
    exLast("usul-3", exType("usultap"))
  ],
  makam: () => [
    exLast("ussak-2", st => st.type === "notes" && st.hint && st.hint.tr === "yedenli karar"),
    exLast("kurdi-2", st => st.type === "notes" && st.hint && st.hint.tr === "güçlüden durağa iniş"),
    exLast("gecki-2", st => st.type === "seyir" && st.via)
  ]
};
const examExtra = unitId => EXAM_EXTRA[unitId] ? EXAM_EXTRA[unitId]() : [];
function makeExam(u){
  const ls = LESSONS.filter(l => l.unit === u.id && (u.since || !l.since) && l.steps.some(gatedStep));
  const n = Math.min(EXAM_STEPS, ls.length), idx = [...new Set(Array.from({ length:n }, (_, k) => n < 2 ? 0 : Math.round(k*(ls.length - 1)/(n - 1))))];
  const rng = seeded("sinav-" + u.id);
  const steps = idx.map(i => { const l = ls[i], g = l.steps.filter(gatedStep); return stepFrom(l, g[g.length - 1]); })
    .map(st => ({ st, r: rng() })).sort((a, b) => a.r - b.r).map(x => x.st);
  if(!u.since) steps.push(...examExtra(u.id));
  return { id:"sinav-" + u.id, unit:u.id, exam:true, notes:[],
    title:{ tr:"Ünite sınavı: " + u.name.tr, en:"Unit test: " + u.name.en },
    text:[{ tr:"Ünitenin derslerinden karışık adımlar. Hepsini geçersen “" + u.badge.tr + "” rozetini kazanırsın. Rehberli ilerlemede sonraki ünite bu sınavla açılır; rehberli ilerleme kapalıysa sınav hiçbir dersi kilitlemez.",
            en:"Mixed steps from the unit's lessons. Pass them all to earn the “" + u.badge.en + "” badge. With guided progress the next unit opens after this test; with it off the test locks nothing." }],
    tips:[{ tr:"Takıldığın adımın dersine dönüp orayı tekrar çalış.", en:"If a step stops you, go back to its lesson and practise it there." }],
    steps };
}
const EXAMS = UNITS.map(makeExam).filter(e => e.steps.length);
const examFor = unitId => EXAMS.find(e => e.unit === unitId && !e.final) || null;
// ---- Bitirme sınavı (docs/BACKLOG.md S5.5) ----
// İleri ünitesinin sınavı geçilince açılır; uygulamanın ölçebildiği becerilerin hepsinden bir adım. Geçince "Usta yolunda"
// rozeti (roadmap.js badgeList) ve başlangıçtan bugüne gelişim raporu (lessonview.js). Adımlar derslerde kullanılan biçimde:
// eser, derste öğrenilen Uşşak saz semâîsi (sazsemaisi-1); oyun havası repertuvar basamak 6'dan, telifsiz
const USTA_SAZ = { arsiv:"ussak--sazsemaisi--aksaksemai----kantemiroglu", name:{ tr:"Uşşak Saz Semâîsi (Kantemiroğlu)", en:"Uşşak Saz Semâîsi (Kantemiroğlu)" } };
const USTA_DANS = { arsiv:"huseyni--oyunhavasi--nimsofyan--cecen_kizi--tanburi_cemil_bey", name:{ tr:"Çeçen Kızı (Tanburî Cemil Bey)", en:"Çeçen Kızı (Tanburî Cemil Bey)" } };
EXAMS.push({ id:"sinav-ustalik", unit:"ileri", exam:true, final:true, notes:[],
  title:{ tr:"Bitirme sınavı: Usta yolunda", en:"Final test: On the master's path" },
  badge:{ tr:"Usta yolunda", en:"On the master's path" },
  text:[{ tr:"Uygulamanın ölçebildiği her şeyden bir adım: iki dakikalık taksim, öğrendiğin saz semâîsini ezberden ve kendi temposunda, eşlikle bir oyun havası, makam tanıma, deşifre ve metronomsuz iki aksak usul. Hepsini geçince “Usta yolunda” rozetini ve başlangıçtan bugüne gelişim raporunu alırsın.",
          en:"One step from everything the app can measure: a two-minute taksim, the saz semâîsi you learned from memory at its own tempo, a dance tune with the band, makam recognition, sight-reading and two aksak usuls without a click. Pass them all to earn the “On the master's path” badge and a report of your growth from the start." }],
  tips:[{ tr:"Takıldığın adımın dersine dönüp orayı tekrar çalış; sınav hiçbir dersi kilitlemez.", en:"If a step stops you, go back to its lesson and practise there; the test locks no lesson." }],
  steps:[
    { type:"seyir", makam:"hicaz", sec:120, min:60, focus:"uzun" },
    { type:"piece", ...USTA_SAZ, to:36, tempoPct:100, mode:"mem", min:80 },
    { type:"band", ...USTA_DANS, usul:"nimsofyan", makam:"huseyni", tempo:96, min:70 },
    { type:"ear", mode:"makam", pool:["rast", "ussak", "huseyni", "hicaz", "nihavend", "kurdi", "saba", "segah", "huzzam"], n:8, min:7 },
    { type:"sight", level:4, min:70 },
    { type:"rhythm", usul:"aksak", tempo:180, bars:3, silent:true, min:55 },
    { type:"rhythm", usul:"curcuna", tempo:150, bars:3, silent:true, min:55 }
  ] });
const lessonById = id => LESSONS.find(l => l.id === id) || EXAMS.find(l => l.id === id) || null;

// ---- Aralıklı tekrar ----
// Bitirilen dersin bir adımı artan aralıklarla (1, 3, 7, 21, 60 gün) günlük plana geri gelir. Başarılı tekrar aralığı
// bir basamak uzatır, başarısız tekrar bir basamak kısaltır; günün ilk denemesi sayılır.
// srs: { [lessonId]: { lv (SRS_DAYS sırası), due: "YYYY-MM-DD", last?: gün, n?: tekrar sayısı } }
const SRS_DAYS = [1, 3, 7, 21, 60], SRS_PER_DAY = 2;
const p2 = n => String(n).padStart(2, "0");
function shiftDay(day, n){
  const [y, m, d] = day.split("-").map(Number), t = new Date(y, m - 1, d + n);
  return t.getFullYear() + "-" + p2(t.getMonth() + 1) + "-" + p2(t.getDate());
}
// Kaydı olmayan bitmiş dersleri sıraya ekler. Bu özellikten önce bitmiş çok ders varsa hepsi aynı gün gelmesin:
// k. ders en erken bugün + k/SRS_PER_DAY günde. Dersi müfredattan kalkmış ya da ilerlemesi silinmiş (yeniden ölçme çalınmamış
// dersi açar) kayıt atılır. Yalnız bu ikisi: adım eklendiği için bitmiş sayılmayan eski dersin (yedekten dönen veri) kaydı ve
// aralığı kalır
function srsSync(srs, prog, day){
  for(const id of Object.keys(srs)) if(!lessonById(id) || !prog[id]) delete srs[id];
  let k = 0;
  for(const l of LESSONS){
    if(srs[l.id] || !lessonDone(l, prog) || prog[l.id].mig || !l.steps.some(gatedStep)) continue;
    const a = shiftDay(prog[l.id].d || day, SRS_DAYS[0]), b = shiftDay(day, Math.floor(k++/SRS_PER_DAY));
    srs[l.id] = { lv:0, due: a > b ? a : b };
  }
  return srs;
}
// Bugün tekrarı gelen dersler: en eski vadeli önce, en çok max tane
function srsDue(srs, day, max = SRS_PER_DAY){
  return Object.entries(srs).filter(([id, e]) => e.due <= day && lessonById(id) && !lessonById(id).exam)
    .sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[1].lv - b[1].lv).slice(0, max).map(([id]) => id);
}
// Tekrar adımı: dersin geçme koşullu adımlarından biri (gün ve dersten türeyen seçim), rev alanında dersin kimliği
// Adımın kayıtlı sonucunun geçme koşulunu ne kadar aştığı (oran; 0: tam sınırda). Hata sayısında azı iyidir.
// Koşulu sayıyla olmayan adımlarda null
function stepMargin(st, v){
  if(v == null) return null;
  const low = st.type === "notes" || (st.type === "piece" && st.mode === "free");
  const goal = { notes:st.maxMiss, mimic:st.len, vibrato:st.sec, glide:st.n, tech:st.target, ornament: st.kind === "tril" ? st.rate : st.n }[st.type] ?? st.min;
  if(goal == null || typeof v !== "number") return null;
  return low ? (goal - v)/Math.max(1, goal) : (v - goal)/Math.max(st.type === "scale" ? 0.01 : 1, goal);
}
// Tekrar adımı: dersin ölçülen adımlarından biri. Kayıtlı sonuçlar varsa (dersi gerçekten çalmışsa) üç tekrardan ikisinde
// geçme koşulunu en az farkla geçtiği adım gelir: hoca zayıf kalan yeri yoklar
function reviewStep(lesson, day, prog){
  const g = lesson.steps.filter(gatedStep), rng = seeded(day + lesson.id), pick = g[Math.floor(rng()*g.length)];
  const p = prog && prog[lesson.id];
  let st = pick;
  if(p && !p.placed && rng() < 0.67){
    const m = g.map(x => ({ x, m: stepMargin(x, p.s[lesson.steps.indexOf(x)] && p.s[lesson.steps.indexOf(x)].v) })).filter(y => y.m != null);
    if(m.length) st = m.reduce((a, b) => b.m < a.m ? b : a).x;
  }
  return { ...stepFrom(lesson, st), rev: lesson.id };
}
function srsUpdate(srs, id, ok, day){
  const e = srs[id] || (srs[id] = { lv:0, due:day });
  if(e.last === day) return e;
  e.lv = ok ? Math.min(SRS_DAYS.length - 1, e.lv + 1) : Math.max(0, e.lv - 1);
  e.due = shiftDay(day, SRS_DAYS[e.lv]); e.last = day; e.n = (e.n || 0) + 1;
  return e;
}

// Adımın yazılı notaları (çalma ya da dinleme için)
function stepNotes(step){
  if(step.pattern){ const p = LSK().techPattern(step.pattern); return p ? p.notes.map(n => n.w) : []; }
  if(step.notes) return step.notes;
  if(step.commas) return step.commas.map(LLEARN.commaToWritten);
  return [];
}

const RHYTHM_NAMES = {
  quarter:{ tr:"her vuruşta bir nota", en:"one note per beat" }, half:{ tr:"ikilik notalar", en:"half notes" },
  eighth:{ tr:"sekizlik notalar", en:"eighth notes" }, dotted:{ tr:"noktalı dörtlük + sekizlik", en:"dotted quarter + eighth" },
  offbeat:{ tr:"ters vuruşlar", en:"off-beats" } };
const DYN_NAMES = { cresc:{ tr:"crescendo (hafiften güçlüye)", en:"crescendo" }, dim:{ tr:"decrescendo (güçlüden hafife)", en:"decrescendo" },
  messa:{ tr:"messa di voce (hafif-güçlü-hafif)", en:"messa di voce" } };

// Artikülasyon adı ve nasıl çalınacağı (adım başlığı ve adım ekranı)
const ARTIK_NAMES = {
  legato:{ name:{ tr:"Bağlı (legato)", en:"Slurred (legato)" }, how:{ tr:"Bağlı: yalnız ilk notayı dille başlat; hava hiç kesilmesin, notalar arasında ses kopmasın.", en:"Slurred: tongue only the first note; keep the air going so the sound never breaks between notes." } },
  staccato:{ name:{ tr:"Kesik (staccato)", en:"Detached (staccato)" }, how:{ tr:"Kesik: her notayı dille başlat ve kısa kes; notanın ardından vuruşun en az yarısı sessiz kalsın.", en:"Staccato: start every note with the tongue and stop it short; leave at least half of each beat silent." } },
  tenuto:{ name:{ tr:"Tenuto (tam süre)", en:"Tenuto (full length)" }, how:{ tr:"Tenuto: her notayı tam süresince tut, yalnız dil kısa bir an ayırsın.", en:"Tenuto: hold every note for its full length; only the tongue separates them for a moment." } } };
const artikName = style => Array.isArray(style) ? { tr:"Karışık: bağlı ve kesik", en:"Mixed: slurred and staccato" } : ARTIK_NAMES[style].name;
function artikHow(style){
  if(!Array.isArray(style)) return ARTIK_NAMES[style].how;
  const word = { legato:["bağlı", "slurred"], staccato:["kesik", "staccato"], tenuto:["tenuto", "tenuto"] };
  const seq = style.map(s => s ? word[s] : ["serbest", "free"]);
  return { tr:"Karışık: sırayla " + seq.map(x => x[0]).join(", ") + ". Yaylı notalar bağlı, noktalılar kesik; bağın son notası serbest.",
           en:"Mixed: in turn " + seq.map(x => x[1]).join(", ") + ". Notes under a slur are slurred, dotted ones staccato; the last note of a slur is free." };
}

const ORN_NAMES = {
  carpma:{ up:{ tr:"üstten çarpma", en:"upper grace note" }, down:{ tr:"alttan çarpma", en:"lower grace note" } },
  tekrar:{ tr:"çarpmalı tekrar", en:"repeated note split by grace notes" },
  mordan:{ up:{ tr:"üst mordan", en:"upper mordent" }, down:{ tr:"alt mordan", en:"lower mordent" } },
  tril:{ tr:"tril", en:"trill" },
  giris:{ tr:"alttan kayarak giriş", en:"slide in from below" },
  dusus:{ tr:"sonda düşüş", en:"fall at the end" },
  grupetto:{ tr:"grupetto (çevirme)", en:"turn" } };
const ornName = o => { const n = ORN_NAMES[o.kind]; return n.up ? n[o.dir === "down" ? "down" : "up"] : n; };

// Adım başlığı: "Uzun ton: Sol4 · 8 sn · en az 55 puan"
function stepTitle(step, lang = "tr"){
  const en = lang === "en";
  if(step.rev){ const l = lessonById(step.rev); return (en ? "Review" : "Tekrar") + (l ? " (" + pick(l.title, lang) + ")" : "") + " · " + stepTitle({ ...step, rev: undefined }, lang); }
  const nn = w => LCORE.noteName(w)[en ? "en" : "tr"];
  // Uzun dizilerin başı yazılır; adım başlayınca bütün notalar çipler hâlinde görünür
  const seq = () => {
    const names = step.commas ? step.commas.map(LLEARN.perdeName) : step.notes.map(nn);
    return names.length <= 9 ? names.join(" ") : names.slice(0, 5).join(" ") + " … (" + names.length + (en ? " notes)" : " nota)");
  };
  // shift: şed adımı, makam adının yanına yeni durağın adı ("Rast (Çargâh'tan)")
  const shName = () => { if(!step.shift) return ""; const d = LLEARN.perdeName(LLEARN.makamById(step.makam).durak + step.shift);
    return en ? " (from " + d + ")" : " (" + LLEARN.ablTr(d) + ")"; };
  const mk = step.makam ? LLEARN.makamById(step.makam).name + shName() : null;
  switch(step.type){
    case "listen": if(step.arsiv) return (en ? "Listen: " : "Dinle: ") + arsivWhat(step, lang);
      if(step.pattern) return (en ? "Listen: " : "Dinle: ") + pick(LSK().techPattern(step.pattern).label, lang) + " · ♩=" + step.tempo;
      return (en ? "Listen: " : "Dinle: ") + (step.orn ? pick(ornName(step.orn), lang) + " · " : "") + seq();
    case "tech": return (en ? "Speed: " : "Hız: ") + pick(LSK().techPattern(step.pattern).label, lang) + " · ♩=" + step.start + " → " + step.target;
    case "ornament": {
      const what = (en ? "Ornament: " : "Süsleme: ") + pick(ornName(step), lang) + " · " + nn(step.note) + (step.comma != null ? " (" + LLEARN.perdeName(step.comma) + ")" : "");
      return step.kind === "tril" ? what + " · " + step.sec + (en ? " s · at least " + step.rate + " turns/s" : " sn · en az " + step.rate + " dönüş/sn")
                                  : what + " · " + step.n + (en ? " times" : " kez");
    }
    case "hold": return (en ? "Long tone: " : "Uzun ton: ") + nn(step.note) + (step.comma != null ? " (" + LLEARN.perdeName(step.comma) + ")" : "") +
      " · " + step.sec + (en ? " s · at least " : " sn · en az ") + step.min + (en ? " points" : " puan") +
      (step.quality ? (en ? " · tone clarity ≥ " : " · ses temizliği ≥ %") + step.quality + (en ? "%" : "") : "");
    case "notes": return (en ? "Play in order: " : "Sırayla çal: ") + seq() +
      " · " + (en ? "at most " + step.maxMiss + " mistakes" : "en çok " + step.maxMiss + " hata") + (step.hint ? " · " + pick(step.hint, lang) : "");
    case "quiz": return (step.mode === "find" ? (en ? "Fingering quiz (find): " : "Parmak testi (bul): ") : step.mode === "staff" ? (en ? "Read from the staff and play: " : "Dizekten oku ve çal: ") : (en ? "Fingering quiz (play): " : "Parmak testi (çal): ")) +
      step.notes.map(nn).join(" ") + " · " + (en ? step.min + "/" + step.n + " correct" : step.min + "/" + step.n + " doğru");
    case "scale": return (en ? "Scale up and down: " : "Dizi çıkış ve iniş: ") + mk + " · " +
      (en ? "at least " + Math.round(step.min*100) + "% of perdes clean" : "perdelerin en az %" + Math.round(step.min*100) + "'i temiz");
    case "mimic": return (en ? "Imitate: " : "Taklit: ") + (mk || (step.commas ? step.commas.map(LLEARN.perdeName) : step.notes.map(nn)).join(" ")) +
      " · " + (en ? "reach a " + step.len + "-note phrase" : step.len + " notalık ezgiye ulaş");
    case "vibrato": return (en ? "Vibrato: " : "Vibrato: ") + nn(step.note) + " · " + step.sec + (en ? " s of even vibrato" : " sn düzenli vibrato");
    case "glide": return (en ? "Glissando: " : "Glissando: ") + nn(step.from) + " → " + nn(step.to) + " · " + step.n + (en ? " times" : " kez");
    case "read": return (en ? "Read: " : "Oku: ") + pick(step.title, lang);
    case "check": return (en ? "Self-check: " : "Öz denetim: ") + pick(step.title, lang) + " · " + step.items.length + (en ? " items" : " madde");
    case "band": return (en ? "With the band: " : "Eşlikle: ") + arsivWhat(step, lang) + " · " + (en ? "at least " + step.min + "% in the groove" : "usule oturma en az %" + step.min);
    case "soru": { const n = soruItems(step).length;
      return n === 1 ? (en ? "Question: " : "Soru: ") + pick(step.q || step.items[0].q, lang)
        : (en ? "Questions: " + n + " · at least " + soruMin(step) + " right first time" : "Sorular: " + n + " soru · en az " + soruMin(step) + " ilk seferde doğru"); }
    case "selfrate": return en ? "Listen back and rate: tone, pitch, rhythm, phrasing" : "Kaydını dinle ve puanla: ton, perde, ritim, cümle";
    case "piece": { if(step.arsiv) return (en ? "Piece: " : "Eser: ") + arsivWhat(step, lang) + " · " +
        (step.mode === "free" ? (en ? "follow mode · at most " + step.min + " mistakes" : "serbest takip · en çok " + step.min + " hata")
         : step.mode === "mem" ? memWhat(step, en)
                              : (en ? "in tempo · at least " + step.min + "% correct" : "tempolu · en az %" + step.min + " doğru"));
      const e = LREP().etudeById(step.id), cue = step.cue ? " · " + pick(step.cue, lang) : "";
      if(step.mode === "ladder") return (en ? "Piece: " : "Eser: ") + pick(e.name, lang) + (en ? " · tempo ladder · up to " + step.min + "%" : " · tempo merdiveni · %" + step.min + "'e kadar");
      const shD = step.shift && e.makam ? LLEARN.perdeName(LLEARN.makamById(e.makam).durak + step.shift) : null;
      const shTr = !step.shift ? "" : shD ? (en ? " (from " + shD + ")" : " (" + LLEARN.ablTr(shD) + ")") : (en ? " · moved " + step.shift + " commas" : " · " + step.shift + " koma kaydırılmış");
      return (en ? "Piece: " : "Eser: ") + pick(e.name, lang) + shTr + cue + " · " + (step.mode === "free" ? (en ? "follow mode · at most " + step.min + " mistakes" : "serbest takip · en çok " + step.min + " hata")
        : step.mode === "mem" ? memWhat(step, en)
        : (en ? "in tempo · at least " + step.min + "% correct" : "tempolu · en az %" + step.min + " doğru")); }
    case "rhythm": {
      const what = step.usul ? "Usul " + LLEARN.USULS.find(u => u.id === step.usul).name : pick(RHYTHM_NAMES[step.pattern], lang);
      return (en ? "Rhythm: " : "Ritim: ") + what + " · " + step.tempo + (en ? " bpm" : " vuruş/dk") + (step.silent ? (en ? " · metronome only for the count-in" : " · metronom yalnızca sayımda") : "") +
        " · " + (en ? "at least " + step.min + " points" : "en az " + step.min + " puan");
    }
    case "usultap": { const u = LLEARN.USULS.find(x => x.id === step.usul);
      if(step.mode === "listen") return (en ? "Usul: listen and count " : "Usul: dinle ve say ") + u.name;
      return (en ? "Usul: " : "Usul: ") + u.name + (step.mode === "mem" ? (en ? " · tap from memory" : " · ezberden vur") : (en ? " · tap along" : " · elle vur")) +
        " · " + (en ? "at least " + step.min + " points" : "en az " + step.min + " puan"); }
    case "hece": { const lv = en ? " (level " + step.lv + ")" : " (seviye " + step.lv + ")";
      if(step.mode === "say") return (en ? "Rhythm syllables: say the bar" : "Ritim heceleri: ölçüyü heceleriyle söyle") + lv;
      if(step.mode === "quiz") return (en ? "Rhythm syllables: which bar?" : "Ritim heceleri: hangi ölçü?") + lv + " · " + step.min + "/" + step.n + (en ? " correct" : " doğru");
      return (en ? "Rhythm syllables: tap the bar" : "Ritim heceleri: ölçüyü vur") + lv + " · " + (en ? "at least " + step.min + " points" : "en az " + step.min + " puan"); }
    case "artik": return pick(artikName(step.style), lang) + ": " + seq() + " · ♩=" + step.tempo + " · " + (en ? "at least " + step.min + " points" : "en az " + step.min + " puan");
    case "dynamics": return (en ? "Dynamics: " : "Dinamik: ") + nn(step.note) + " · " + pick(DYN_NAMES[step.shape], lang) + " · " + step.sec + (en ? " s" : " sn") +
      (step.drift != null ? (en ? " · pitch within ±" : " · perde ±") + (step.drift/2).toString().replace(".", en ? "." : ",") + (en ? " comma" : " koma") : "");
    case "seyir": if(step.via){ const a = LLEARN.makamById(step.makam).name, b = LLEARN.makamById(step.via).name;
        return (en ? "Geçki: " : "Geçki: ") + a + " → " + b + " → " + a + " · " + step.sec + (en ? " s · at least " : " sn · en az ") + step.min + (en ? " points" : " puan"); }
      if(step.usul){ const u = LLEARN.USULS.find(x => x.id === step.usul);
        return (en ? "Taksim over a usul: " : "Usullü taksim: ") + mk + " · " + (u ? u.name : step.usul) + " · " + step.sec + (en ? " s · at least " : " sn · en az ") + step.min + (en ? " points" : " puan"); }
      if(step.focus){ const f = { cumle:["cümle kurma", "phrases"], cesni:["çeşni", "çeşni"], karar:["karar", "cadence"], tiz:["meyan, tiz bölge", "meyan, upper register"], uzun:["dört bölüm", "four parts"] }[step.focus];
        return (en ? "Taksim (" + f[1] + "): " : "Taksim (" + f[0] + "): ") + mk + " · " + step.sec + (en ? " s · at least " : " sn · en az ") + step.min + (en ? " points" : " puan"); }
      return (en ? "Free playing (seyir): " : "Serbest çalma (seyir): ") + mk + " · " + step.sec + (en ? " s · at least " : " sn · en az ") + step.min + (en ? " points" : " puan");
    case "sight": return (en ? "Sight-reading: level " : "Deşifre: seviye ") + step.level + " · " + (en ? "at least " + step.min + "% correct notes" : "en az %" + step.min + " doğru nota");
    case "dictation": return (step.mode === "rhythm" ? (en ? "Rhythm dictation" : "Ritim dikte") : (en ? "Melodic dictation" : "Ezgi dikte")) + (en ? ": level " : ": seviye ") + step.level +
      " · " + step.min + "/" + step.n + (en ? " correct" : " doğru");
    case "ear": if(step.mode === "interval") return (en ? "Ear: name the interval (" : "Kulak: aralık tanı (") + (step.pool === "makam" ? (en ? "makam" : "makam") : (en ? "Western" : "Batı")) + ") · " + step.min + "/" + step.n + (en ? " correct" : " doğru");
      return (en ? "Ear: " : "Kulak: ") + (step.mode === "makam" ? (en ? "name the makam" : "makamı tanı") : (en ? "tell the perdes apart (level " : "perde ayırt (seviye ") + (step.level || 1) + ")") +
      " · " + step.min + "/" + step.n + (en ? " correct" : " doğru");
  }
  return step.type;
}

// Bilgi sorusu adımının soruları ve geçme sınırı
const soruItems = st => st.items || [st];
const soruMin = st => st.min != null ? st.min : soruItems(st).length === 1 ? 1 : Math.max(1, Math.round(soruItems(st).length*0.7));

// Bir adımın sonucu geçer mi. res: { v } — puan, doğru sayısı, hata sayısı, oran ya da ulaşılan uzunluk.
function stepOk(step, res){
  if(!res) return false;
  const v = res.v;
  switch(step.type){
    case "listen": return true;
    case "hold": return v >= step.min && (step.quality == null || (res.q || 0) >= step.quality);
    case "read": case "check": return v >= 1;
    case "soru": return v >= soruMin(step);
    case "rhythm": case "seyir": case "ear": case "sight": case "dictation": case "artik": return v >= step.min;
    case "hece": return v >= (step.mode === "say" ? 1 : step.min);
    case "usultap": return v >= (step.mode === "listen" ? 1 : step.min);
    case "dynamics": return v >= 1;
    case "selfrate": return v >= 4;
    case "piece": return step.mode === "free" ? v <= step.min : v >= step.min;
    case "band": return v >= step.min;
    case "tech": return v >= step.target;
    case "notes": return v <= step.maxMiss;
    case "quiz": return v >= step.min;
    case "scale": return v >= step.min;
    case "mimic": return v >= step.len;
    case "vibrato": return v >= step.sec;
    case "glide": return v >= step.n;
    case "ornament": return step.kind === "tril" ? v >= step.rate : v >= step.n;
  }
  return false;
}
// Sonuçlardan hangisi daha iyi (hata sayısında az olan iyidir)
function better(step, a, b){
  if(!b) return a;
  if(!a) return b;
  const lowerBetter = step.type === "notes" || (step.type === "piece" && step.mode === "free");
  return lowerBetter ? (a.v <= b.v ? a : b) : (a.v >= b.v ? a : b);
}

// prog: { [lessonId]: { s: { [adım]: {v, ok} }, d: "YYYY-MM-DD" (bitiş günü) } }
function recordStep(prog, lesson, idx, res, day){
  const p = prog[lesson.id] || (prog[lesson.id] = { s:{} });
  const step = lesson.steps[idx];
  const ok = stepOk(step, res);
  const prev = p.s[idx];
  const b = better(step, { v:res.v, ok }, prev);
  p.s[idx] = { v:b.v, ok: ok || !!(prev && prev.ok) };
  if(ok && p.mig) delete p.mig;                      // göçle geçilmiş ders gerçekten çalındı: aralıklı tekrara girer
  if(!p.d && lessonDone(lesson, prog)) p.d = day;
  return { ok, first: !(prev && prev.ok) && ok, done: !!p.d };
}
// Ders, dinleme dışındaki bütün adımlar geçildiyse biter
function lessonDone(lesson, prog){
  const p = prog[lesson.id];
  if(!p) return false;
  // Sınav bir kez geçildiyse geçilmiş kalır: geçme kaydı p.d (rozet de ona bakar, roadmap.js badgeList). S5.3 sınavların
  // sonuna adım ekledi; eski kullanıcının yeni adımları geçilmemiş olsa da sınavı, rozeti ve rehberli kapısı durur.
  if(lesson.exam && p.d) return true;
  return lesson.steps.every((st, i) => st.type === "listen" || (p.s[i] && p.s[i].ok));
}
function lessonProgress(lesson, prog){
  const p = prog[lesson.id] || { s:{} };
  const gated = lesson.steps.map((st, i) => i).filter(i => lesson.steps[i].type !== "listen");
  return { done: gated.filter(i => p.s[i] && p.s[i].ok).length, total: gated.length };
}
// ---- Müfredat sürümü ve göç ----
// Sürüm 1: ilk 89 ders. Sonradan eklenen derste since: <sürüm> alanı olur. Araya giren ders, onun ötesine geçmiş eski
// kullanıcıda sonraki üniteleri kilitlemesin (unlocked: Temeller ve klarinonun hepsi bitmeli). Uygulama açılışında
// migrateCurriculum, daha önce değerlendirilmemiş (lesson.migIds'te olmayan) her since'li dersi bir kez değerlendirir;
// sürüm numarasına değil kimliğe bakılır, çünkü aynı sürüme ders sonradan da eklenir. Bitmemiş yeni ders, kullanıcı onun
// ötesine geçmişse bitmiş sayılır: aynı ünitede sonraki bir ders ya da dizideki bir sonraki ders
// bitmişse, ünitenin sınavı geçilmişse ya da ünitenin kapısından geçen (GATE_AFTER zincirinde ondan sonra gelen) bir
// ünitede ders bitmişse. Böyle ders placed (çalınmadan geçildi) ve mig (göçle; aralıklı tekrara girmez, liste ve hoca
// kartı "istersen" der) işaretlenir. Önündeki dersler sırayla açılır. Yedekten eski kayıt yüklenince lesson.migIds de eski
// gelir (ya da hiç yoktur), göç yeniden çalışır.
const CURRICULUM_VER = 2;
// Dersin bütün adımlarını geçilmiş say (seviye sınamasının kayıt biçimi, onboard.js markDone)
function placeLesson(prog, l, day){
  const p = prog[l.id] || (prog[l.id] = { s:{} });
  l.steps.forEach((st, k) => { if(!(p.s[k] && p.s[k].ok)) p.s[k] = { v: st.type === "read" ? 1 : st.type === "notes" ? 0 : (st.min || st.n || 1), ok:true }; });
  p.d = p.d || day; p.placed = true;
  return p;
}
// unitId'nin kapısından geçen üniteler (GATE_AFTER zincirinde sonra gelenler)
function unitsAfter(unitId){
  const out = new Set(), walk = u => { for(const [k, v] of Object.entries(GATE_AFTER)) if(v.includes(u) && !out.has(k)){ out.add(k); walk(k); } };
  walk(unitId);
  return out;
}
const sinceIds = () => LESSONS.filter(l => l.since).map(l => l.id);
// seen: daha önce değerlendirilmiş ders kimlikleri (Set; boşsa bütün since'li dersler). Dönen: bitmiş sayılanlar
function migrateCurriculum(prog, seen, day){
  seen = seen || new Set();
  const placed = [], done = l => lessonDone(l, prog);
  // Sondan başa: yeni ders, ondan sonra gelen ve aynı göçte geçilmiş yeni dersi de "ötesi" sayar
  for(let i = LESSONS.length - 1; i >= 0; i--){
    const l = LESSONS[i];
    if(!l.since || seen.has(l.id) || done(l)) continue;
    const after = unitsAfter(l.unit), ex = examFor(l.unit);
    const beyond = (i + 1 < LESSONS.length && done(LESSONS[i + 1])) ||
      LESSONS.slice(i + 1).some(x => x.unit === l.unit && done(x)) ||
      (ex && prog[ex.id] && lessonDone(ex, prog)) ||
      LESSONS.some(x => after.has(x.unit) && done(x));
    if(!beyond) continue;
    placeLesson(prog, l, day).mig = true;
    placed.push(l.id);
  }
  return placed.reverse();
}

// Rehberli ilerleme (kademe kapısı): bir ünitenin dersleri, önkoşul ünitelerin sınavı geçilmeden açılmaz; hoca
// ünite bitince sınavla pekiştirip öyle geçirir. Kapı, kullanıcı o üniteden daha önce ders bitirdiyse uygulanmaz
// (eski ilerleme bozulmasın). Tarayıcıda practice.js açar (Ayarlar: lesson.guided), Node'da kapalı.
const GATE_AFTER = { temel:["baslangic"], klarino:["temel"], teknik:["klarino"], hiz:["klarino"], susleme:["klarino"],
  makam:["klarino"], turku:["klarino"], trakya:["klarino"], ileri:["makam"] };
let GUIDED = false;
function setGuided(on){ GUIDED = !!on; }
const examPassed = (unitId, prog) => { const e = examFor(unitId); return !e || lessonDone(e, prog); };
// Ünitenin dersleri için geçilmemiş önkoşul sınavları (rehberli değilse ya da ünite başlanmışsa boş)
function gateFor(unitId, prog){
  if(!GUIDED || !GATE_AFTER[unitId]) return [];
  if(LESSONS.some(l => l.unit === unitId && lessonDone(l, prog))) return [];
  return GATE_AFTER[unitId].filter(u => !examPassed(u, prog)).map(examFor);
}
// Temeller ve klarino dersleri sırayla açılır. Bunlar bitince teknik derslerinin hepsi ve ilk makam dersi açılır;
// makam dersleri kendi içinde sırayla gider (teknik ünitesini bitirmek gerekmez).
function unlocked(lesson, prog, all = false){
  if(lessonDone(lesson, prog)) return true;          // bitmiş ders hep açık (yeni dersler araya eklense de)
  if(LPREM().premiumUnit(lesson.unit)) return false; // premium ünite (premium.js; satış açık değilse hiçbir şey kilitlenmez)
  if(all) return true;
  if(lesson.final) return examPassed(lesson.unit, prog);   // bitirme sınavı: İleri sınavı geçilince
  if(lesson.exam) return LESSONS.filter(l => l.unit === lesson.unit && !l.optional).every(l => lessonDone(l, prog));
  if(gateFor(lesson.unit, prog).length) return false;
  let i = LESSONS.indexOf(lesson);
  if(i <= 0) return true;
  // İsteğe bağlı ders (optional) zincire girmez: arkasındaki ders onun önündekine bakar
  while(i > 1 && LESSONS[i-1].optional) i--;
  const base = () => LESSONS.filter(l => l.unit === "temel" || l.unit === "klarino").every(l => lessonDone(l, prog));
  if(lesson.unit === "teknik") return base();
  // Hız ve teknik: dil vuruşu gerekir, ünite içinde sırayla
  if(lesson.unit === "hiz"){
    if(LESSONS[i-1].unit === "hiz") return lessonDone(LESSONS[i-1], prog);
    const art = lessonById("artikulasyon");
    return base() && !!art && lessonDone(art, prog);
  }
  // Süsleme: glissando ve dil vuruşu gerekir, ünite içinde sırayla; son ders Uşşak ve Hicaz'ı da ister
  if(lesson.unit === "susleme"){
    const d = id => { const l = lessonById(id); return !!l && lessonDone(l, prog); };
    const open = LESSONS[i-1].unit === "susleme" ? lessonDone(LESSONS[i-1], prog) : base() && d("glissando") && d("artikulasyon");
    return open && (lesson.id !== "sus-makam" || (d("ussak") && d("hicaz")));
  }
  if(lesson.unit === "makam") return LESSONS[i-1].unit === "makam" ? lessonDone(LESSONS[i-1], prog) : base();
  // Türkü ve yöreler: Trakya gibi (temeller ve usul dersi), ünite içinde sırayla
  if(lesson.unit === "turku"){
    if(LESSONS[i-1].unit === "turku") return lessonDone(LESSONS[i-1], prog);
    const us = lessonById("usul");
    return base() && !!us && lessonDone(us, prog);
  }
  // Trakya ve Roman: temeller ve usul dersi yeter (makam ünitesini bitirmek gerekmez), ünite içinde sırayla
  if(lesson.unit === "trakya"){
    if(LESSONS[i-1].unit === "trakya") return lessonDone(LESSONS[i-1], prog);
    const us = lessonById("usul");
    return base() && !!us && lessonDone(us, prog);
  }
  return lessonDone(LESSONS[i-1], prog);
}
// Kaldığın yer: açık ve bitmemiş ilk ders (isteğe bağlı dersler önerilmez)
// Ders kalmadıysa (ya da sıradakiler kademe kapısında bekliyorsa) açık ve geçilmemiş ilk ünite sınavı
function nextLesson(prog, all = false){
  return LESSONS.find(l => !l.optional && unlocked(l, prog, all) && !lessonDone(l, prog)) ||
    EXAMS.find(e => unlocked(e, prog, all) && !lessonDone(e, prog)) || null;
}
// Bitirilen derslerde öğrenilen notalar (hiç ders bitmediyse açık Sol)
function knownNotes(prog){
  const s = new Set();
  for(const l of LESSONS) if(lessonDone(l, prog)) l.notes.forEach(w => s.add(w));
  if(!s.size) s.add(67);                               // hiç ders bitmediyse açık Sol (Rast)
  return [...s].sort((a,b) => a-b);
}

// "Bul" modu için seçenekler: doğru nota + verilen listeden en yakın 3 nota
function choicesFrom(notes, w, rng = Math.random){
  const others = notes.filter(x => x !== w).sort((a,b) => Math.abs(a-w) - Math.abs(b-w)).slice(0, 5);
  const pick3 = [];
  while(pick3.length < 3 && others.length) pick3.push(others.splice(Math.floor(rng()*others.length), 1)[0]);
  return [...pick3, w].sort((a,b) => a-b);
}
// Ders testinde soru: zorlanılan nota daha sık gelir (learn.js'teki ağırlık), aynı nota art arda gelmez
function quizPickFrom(notes, stats, rng = Math.random, last = null){
  const pool = notes.length > 1 ? notes.filter(w => w !== last) : notes;
  const weights = pool.map(w => LLEARN.quizWeight(stats[w]));
  let r = rng() * weights.reduce((a,b) => a+b, 0);
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
  return pool[pool.length-1];
}

// Glissando adımı: frames [{t, comma}] kalkış notasının son karesinden varış notasının ilk kararlı karesine.
// Kalkıştan (±1,5 koma) son ayrılış ile varışa (±1,5 koma) ilk değiş arasında en az minMs geçmeli ve aradaki
// kareler iki nota arasında çoğunlukla tek yönlü ilerlemeli. Ani atlamada arada en fazla bir iki ölçüm penceresi kalır.
function glideBetween(frames, minMs = 200, tol = 1.5){
  if(frames.length < 3) return false;
  const a = frames[0].comma, b = frames[frames.length-1].comma, dir = Math.sign(b - a);
  if(Math.abs(b - a) < 3) return false;
  let i0 = 0;
  for(let i=0;i<frames.length;i++) if(Math.abs(frames[i].comma - a) <= tol) i0 = i; else if(Math.abs(frames[i].comma - b) <= tol) break;
  let i1 = frames.findIndex((f, i) => i > i0 && Math.abs(f.comma - b) <= tol);
  if(i1 < 0) return false;
  if(frames[i1].t - frames[i0].t < minMs) return false;
  const mid = frames.slice(i0, i1 + 1);
  if(mid.length < 4) return false;
  let along = 0;
  for(let i=1;i<mid.length;i++) if(Math.sign(mid[i].comma - mid[i-1].comma) === dir) along++;
  const inside = mid.every(f => (f.comma - a) * dir >= -tol && (b - f.comma) * dir >= -tol);
  return inside && along / (mid.length - 1) >= 0.6;
}

// Tarihten türeyen tekrarlanabilir rastgele sayı (günlük plan gün içinde değişmesin)
function seeded(str){
  let h = 2166136261;
  for(const ch of str){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
}

// Günlük plandaki adımların yaklaşık süresi (dakika)
const DAILY_MIN = { hold:1, quiz:2, scale:2, mimic:2, notes:1, rhythm:2, piece:3, ear:2, seyir:2, ornament:2, tech:3, sight:3, dictation:3 };
// Günlük çalışma: ısınma uzun tonu (en çok sapan nota), zorlanılan notalardan test, bir makam dizisi ve taklit.
// ctx: { prog, intStats: {[w]: {n,sum}}, quizStats: {[w]: {n,wrong,ms}}, day: "YYYY-MM-DD", srs?, techBest?, goalMin? }
function dailyPlan(ctx){
  const rng = seeded(ctx.day);
  const known = knownNotes(ctx.prog);
  const steps = [];
  const done = id => { const l = lessonById(id); return !!l && lessonDone(l, ctx.prog); };
  // 1. Isınma: ısınma dersi bitmişse onun sırası (açık Sol, pes Sol, yavaş dizi); yoksa entonasyonu en çok sapan bilinen
  // nota, o da yoksa bilinenlerden biri
  if(done("isinma")) steps.push(...lessonById("isinma").steps.map(st => ({ ...st })));
  else {
    const off = known.map(w => [w, ctx.intStats[w]]).filter(([, s]) => s && s.n >= 3)
      .sort((a,b) => Math.abs(b[1].sum/b[1].n) - Math.abs(a[1].sum/a[1].n));
    const warm = off.length ? off[0][0] : known[Math.floor(rng()*known.length)];
    steps.push({ type:"hold", note:warm, sec:8, min:60 });
  }
  // 2. Parmak testi: bilinen notalardan en zorlanılan 6'sı (en az 3 nota)
  if(known.length >= 3){
    const hard = [...known].sort((a,b) => LLEARN.quizWeight(ctx.quizStats[b]) - LLEARN.quizWeight(ctx.quizStats[a]) || a - b).slice(0, 6);
    steps.push({ type:"quiz", notes: hard.sort((a,b) => a-b), mode: rng() < 0.5 ? "play" : "find", n:8, min:6 });
  }
  // Tekrar: vadesi gelen bitmiş derslerden birer adım (ctx.srs); ısınma ve testle birlikte süre sınırında hep kalır
  const reviews = ctx.srs ? srsDue(ctx.srs, ctx.day).map(id => reviewStep(lessonById(id), ctx.day, ctx.prog)) : [];
  steps.push(...reviews);
  const nFix = steps.length;
  // 3–4. Makam: bitirilen makam derslerinden biri; hiç yoksa bilinen notalarla çıkış-iniş ve taklit
  const mks = LESSONS.filter(l => l.makam && l.id !== "rast-giris" && lessonDone(l, ctx.prog)).map(l => l.makam);
  let mk = null;
  if(mks.length){
    mk = mks[Math.floor(rng()*mks.length)];
    steps.push({ type:"scale", makam:mk, min:0.6 });
    steps.push({ type:"mimic", makam:mk, len:5 });
  }else if(known.length >= 3){
    steps.push({ type:"notes", notes:[...known, ...[...known].reverse().slice(1)], maxMiss:3 });
  }
  // 5. Ritim: ritim dersi bitmişse kısa bir tur (tempo her gün biraz değişir)
  // Usul dersleri bitmişse üç günden biri öğrenilmiş usullerden biri (dersteki tempo ve eşikle); öteki günler düz kalıp
  const usulSteps = ["usul", "usul-2"].filter(done).flatMap(id => lessonById(id).steps.filter(x => x.type === "rhythm" && x.usul));
  if(done("ritim-temel")){
    if(usulSteps.length && rng() < 1/3) steps.push({ ...usulSteps[Math.floor(rng()*usulSteps.length)] });
    else steps.push({ type:"rhythm", pattern: rng() < 0.5 ? "quarter" : "eighth", tempo: 70 + 10*Math.floor(rng()*3), bars:4, min:60 });
  }
  // 6. Eser: makamın etüdü tempolu
  if(mk && LREP().etudeById("e-" + mk)) steps.push({ type:"piece", id:"e-" + mk, mode:"tempo", min:65 });
  // 7. Kulak: perde ayırt (ileri kulak dersi bittiyse tek koma)
  if(done("kulak-1")) steps.push({ type:"ear", mode:"abx", level: done("kulak-2") ? 3 : 2, n:6, min:4 });
  // 8. Seyir: taksime giriş bittiyse bugünün makamında kısa serbest çalma
  if(mk && done("taksim-giris")) steps.push({ type:"seyir", makam:mk, sec:45, min:55 });
  // 9. Süsleme: bitirilen süsleme derslerinden birinin ilk süsleme adımı
  const sus = LESSONS.filter(l => l.unit === "susleme" && lessonDone(l, ctx.prog) && l.steps.some(s => s.type === "ornament"));
  if(done("sus-carpma") && sus.length) steps.push({ ...sus[Math.floor(rng()*sus.length)].steps.find(s => s.type === "ornament") });
  // 10. Hız: bitirilen hız derslerinden birinin ilk kalıbı, son en iyinin 8 altından üç basamak (ctx.techBest: { [patternKey]: tempo })
  const hz = LESSONS.filter(l => l.unit === "hiz" && lessonDone(l, ctx.prog) && l.steps.some(s => s.type === "tech"));
  if(done("hiz-metronom") && hz.length){
    const st = hz[Math.floor(rng()*hz.length)].steps.find(s => s.type === "tech");
    const best = (ctx.techBest || {})[LSK().patternKey(st.pattern)], start = best ? best - 8 : st.start;
    steps.push({ ...st, start, target: start + 12 });
  }
  // 11. Oyun havası: bitirilen Trakya ve Roman derslerinin etütlerinden biri, tempolu
  const tr = LESSONS.filter(l => l.unit === "trakya" && lessonDone(l, ctx.prog) && l.steps.some(s => s.type === "piece"));
  if(tr.length){ const st = tr[Math.floor(rng()*tr.length)].steps.find(s => s.type === "piece"); steps.push({ type:"piece", id: st.id, mode:"tempo", min:65 }); }
  // 12. Deşifre ve dikte: ilgili ders bittiyse kısa birer tur (ileri basamak bittiyse onun seviyesinde)
  if(done("desifre-1")) steps.push({ type:"sight", level: done("desifre-2") ? 3 + Math.floor(rng()*2) : 1 + Math.floor(rng()*2), min:70 });
  if(done("dikte-1")) steps.push({ type:"dictation", mode: rng() < 0.5 ? "melody" : "rhythm", level: done("dikte-2") ? 3 : 2, n:5, min:4 });
  // Süre sınırı (ctx.goalMin, dk): ısınma, parmak testi ve tekrarlar hep kalır; diğerlerinden günün sırasıyla sığanlar seçilir,
  // seçilenler plandaki yerlerinde kalır. Kalanlar başka günlerde gelir.
  const budget = ctx.goalMin || 0;
  if(budget && steps.length > nFix){
    const cost = st => DAILY_MIN[st.type] || 2;
    let total = steps.slice(0, nFix).reduce((a, st) => a + cost(st), 0);
    const rest = steps.slice(nFix).map((st, i) => ({ st, i, r: rng() })).sort((a, b) => a.r - b.r), keep = [];
    for(const x of rest) if(total + cost(x.st) <= budget || !keep.length){ keep.push(x); total += cost(x.st); }
    steps.splice(nFix, steps.length, ...keep.sort((a, b) => a.i - b.i).map(x => x.st));
  }
  return { id:"daily", unit:null, notes:[], daily:true,
           title:{ tr:"Bugünün çalışması", en:"Today's practice" },
           text:[{ tr:"Bitirdiğin derslerden her gün yeniden kurulan kısa bir program: zorlandığın notalar ve perdeler öne çıkar.",
                   en:"A short routine rebuilt every day from the lessons you've finished: the notes and perdes you struggle with come first." }],
           tips:[], steps };
}

// Bugünün çalışması denenip bırakıldı mı: bütün adımların sonucu var (geçti ya da tutmadı). Tutmayan adım hoca kartını o gün
// bekletmesin; günlük çalışma yine bitmiş sayılmaz (lesson.dailyDone, rozet ve seri ayrı). daily: lesson.daily kaydı
function dailySettled(daily, day){
  return !!daily && daily.day === day && daily.plan.every((st, i) => st.type === "listen" || daily.p.s[i]);
}

if(typeof module !== "undefined") module.exports = {
  UNITS, LESSONS, EXAMS, examFor, lessonById, pick, SRS_DAYS, shiftDay, srsSync, srsDue, srsUpdate, reviewStep, stepMargin, stepNotes, stepTitle, stepOk, ARTIK_NAMES, artikName, artikHow, recordStep, lessonDone, lessonProgress,
  unlocked, nextLesson, knownNotes, choicesFrom, quizPickFrom, glideBetween, seeded, dailyPlan, dailySettled, setGuided, gateFor, examPassed,
  eserSteps, CURRICULUM_VER, migrateCurriculum, sinceIds, placeLesson, soruItems, soruMin, GATE_AFTER, insertLessonAfter
};
