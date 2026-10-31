// Sorunlar ve çözümler: klarnet çalarken sık karşılaşılan teknik sorunlar (la–si kırılması, gıcırtı, tiz notalar, perde,
// nefes, dil, parmak, süsleme, kamış). Her sorunda belirti, neden ve adım adım çözüm; ilgili ders, alıştırma ve akort
// düğmeleri tek dokunuşla açar. Çalış bölümünün sayfası (Teknik grubu ve ana sayfanın başındaki kart).
// Belirtiye göre arama ve konu süzgeci var. Kaynaklar docs/SORUNLAR-KAYNAKLAR.md'de; metinler kaynaklardan derlenip yeniden yazıldı.

// Konular (süzgeç)
const SQ_CATS = [
  ["gecis", "⛰️", L("Geçiş ve register", "Breaks and registers")],
  ["ses", "🔊", L("Ses ve gıcırtı", "Tone and squeaks")],
  ["perde", "🎯", L("Perde ve koma", "Pitch and commas")],
  ["nefes", "🌬️", L("Nefes, ağız, dil", "Air, embouchure, tongue")],
  ["parmak", "✋", L("Parmaklar", "Fingers")],
  ["susleme", "✨", L("Süsleme ve üslup", "Ornaments and style")],
  ["ekipman", "🪶", L("Kamış ve çalgı", "Reed and instrument")]
];

// Sorunlar. sym: belirtiler; why: nedenler; fix: adım adım çözüm; keys: aramada bulunsun diye ek kelimeler;
// links: { lesson } | { tab } | { long: yazılı nota (Uzun ton o notayla açılır) } | { go:"tune" | "finger" }
const SQ = [
  { id:"la-si", cat:"gecis", emo:"🌉", title:L("La–Si geçişi (kırılma)", "Crossing the break (A to B)"),
    keys:L("kırılma register boğaz klarino la4 si4 si bemol geçiş atlama", "break register throat clarion a4 b4 b flat crossing"),
    sym:[L("La4 ya da Si♭4'ten Si4, Do5'e geçerken araya başka bir ses ya da gıcırtı giriyor.", "Going from A4 or B♭4 to B4 or C5, a stray note or squeak slips in."),
      L("Si4 geç ya da boğuk çıkıyor, bazen hiç çıkmıyor; ses bir an kesiliyor.", "B4 speaks late or muffled, sometimes not at all; the sound drops out for a moment.")],
    why:[L("Bu iki nota arasında neredeyse bütün parmaklar aynı anda değişir: boğaz notalarında çalgı neredeyse boştur, Si4'te bütün delikler, iki serçe mandalı ve register kapalıdır. Parmakların biri geç kalınca ara ses duyulur.", "Almost every finger moves at once: throat notes use an almost empty tube, while B4 closes every hole, both little-finger keys and the register key. One late finger and an in-between note sounds."),
      L("Sol klarnette delikler açıktır (kapak yok) ve sağ el deliklerinin arası geniştir; parmak ucu deliği tam örtmezse Si4 çıkmaz.", "On the G clarinet the holes are open (no pads) and the right hand stretches wide; if a fingertip doesn't seal its hole, B4 won't sound."),
      L("Geçişte hava yavaşlar ya da ağız gevşer; klarino bölgesi daha hızlı ve destekli hava ister.", "The air slows or the embouchure slackens at the change; the clarion register needs faster, supported air.")],
    fix:[L("Önce Si4'ü tek başına uzun tut (8 sn). Ses temiz değilse sorun geçiş değil kapatmadır: parmakları birer birer kaldırıp yeniden bas, delik izini parmağın yastığında hisset.", "First hold B4 on its own for 8 seconds. If it isn't clean, the problem is sealing, not the change: lift and replace each finger, feel the hole's ring on the pad of your finger."),
      L("La4'ü sağ el parmakları kapalıyken çal (sağ el delikleri ve Fa mandalı basılı, sol el La mandalında). Ses neredeyse değişmez; böylece geçişte yalnızca sol el ve register hareket eder. Parmak tablosunda La4'ün “havalandırma” alternatifine bak.", "Play A4 with the right-hand fingers already down (right-hand holes and the F key closed, left hand on the A key). The pitch barely changes, and at the change only the left hand and register move. See the “venting” alternative for A4 in the fingering chart."),
      L("Yavaş çal: La4 – Si4 – La4, her nota iki vuruş. Parmaklar bir blok gibi, aynı anda insin. Ara ses kalmayınca tempoyu artır.", "Play slowly: A4 – B4 – A4, two beats each. Bring the fingers down together as one block. When no stray note is left, speed up."),
      L("Geçiş anında havayı kesme, hatta biraz artır; dudakları sıkma, çene yerinde dursun.", "Don't stop the air at the change — give it a little more; don't pinch, keep the jaw still."),
      L("Sağ el temiz olunca aynı alıştırmayı sağ eli kaldırarak da çal: hızlı pasajlarda her zaman basılı tutmak gerekmez.", "Once it's clean, also practise with the right hand lifted: in fast passages you won't always keep it down.")],
    links:[{ lesson:"register-gecisi" }, { long:71 }, { tab:"tablo" }, { lesson:"bogaz" }] },

  { id:"tiz", cat:"gecis", emo:"🏔️", title:L("Tiz notalar çıkmıyor", "High notes won't speak"),
    keys:L("klarino altissimo tiz yüksek mi5 do6 re6 çıkmıyor ince", "clarion altissimo high notes e5 c6 d6 won't sound thin"),
    sym:[L("Mi5'ten yukarısı zor çıkıyor, ses bir alt registere düşüyor ya da hiç çıkmıyor.", "From E5 up the notes are hard to get; they drop to the lower register or don't sound."),
      L("Tiz notalar ince, sıkık ve tiz (perdesinden yukarıda) çıkıyor.", "High notes come out thin, pinched and sharp.")],
    why:[L("Hava yavaş ya da dağınık; tiz bölge dar ve hızlı hava ister.", "The air is slow or spread; the high register needs a narrow, fast air stream."),
      L("Dilin arkası aşağıda (“ah” ağzı): ağız içi çok geniş kalınca üst register oturmaz.", "The back of the tongue sits low (“ah” mouth); with too much room in the mouth the upper register won't lock in."),
      L("Çeneyle kamışı yukarı sıkmak kamışı kapatır; ses kesilir ya da tiz kaçar.", "Biting up with the jaw closes the reed; the sound stops or goes sharp."),
      L("Kamış fazla yumuşak: hava artınca kapanır.", "The reed is too soft and closes up as the air increases.")],
    fix:[L("“İiii” der gibi dilin arkasını hafifçe kaldır, havayı ince ve soğuk üfle. Dudakları sıkmadan havayı hızlandır.", "Raise the back of the tongue as if saying “eee”; blow a thin, cool air stream. Speed up the air without tightening the lips."),
      L("Oktav kaydırma: Mi4'ü çal, parmakları değiştirmeden register'a bas ve Si4'e geç; sonra aynı şeyi La3 → Mi5 ile yap. Notalar arasında ağız değişmesin, yalnız hava hızlansın.", "Octave slurs: play E4, press the register without moving other fingers and go to B4; then do the same from A3 to E5. Keep the mouth the same, let only the air speed up."),
      L("Ağızlığı biraz daha ağzına al (birkaç milimetre); alt dudak kamışın titreşen yerini boğmasın.", "Take a little more mouthpiece (a few millimetres); keep the lower lip off the vibrating part of the reed."),
      L("Akortta tiz notaları tut: ibre tize kaçıyorsa çene baskısını azalt, pese düşüyorsa hava hızını artır.", "Hold the high notes on the tuner: if the needle goes sharp ease the jaw, if it sags give faster air."),
      L("Hâlâ kapanıyorsa kamışı yarım numara sertiyle dene.", "If it still closes up, try a reed half a strength harder.")],
    links:[{ lesson:"klarino" }, { long:76 }, { go:"tune" }, { tab:"hiz" }] },

  { id:"pes", cat:"gecis", emo:"🕳️", title:L("Pes notalar çıkmıyor ya da kaba çıkıyor", "Low notes won't speak or sound rough"),
    keys:L("pes kalın mi3 fa3 serçe mandal gürültü kaba", "low notes e3 f3 little finger keys rough"),
    sym:[L("Mi3, Fa3, Sol3 gibi en pes notalarda ses gelmiyor, hırıltılı ya da bir üst registerden (oktav tizinden) çıkıyor.", "The lowest notes (E3, F3, G3) don't come, sound rough, or jump up a register.")],
    why:[L("Pes notada bütün delikler kapalıdır: tek bir delikteki kaçak sesi bozar. Sağ elin serçe ve yüzük parmakları en çok buradan kaçırır.", "Every hole is closed on a low note, so a leak at any one hole spoils it. The right ring and little fingers are the usual culprits."),
      L("Fazla sert ve hızlı hava; pes bölge geniş, sıcak ve yavaş hava ister.", "Air that is too hard and fast; the low register wants warm, wide, slower air.")],
    fix:[L("Sol3'ten başlayıp aşağı in: Sol3, Fa♯3, Fa3, Mi3. Hangi notada bozulduysa o notada yeni basılan parmağı kontrol et.", "Start from G3 and step down: G3, F♯3, F3, E3. Wherever it breaks, check the finger that was added for that note."),
      L("“Oh” der gibi ağzın içini aç, sıcak bir nefesle üfle; çeneyi gevşet ama dudak çevresini koru.", "Open the inside of the mouth as if saying “oh” and blow warm air; relax the jaw but keep the lip seal."),
      L("Pes notaları piano (hafif) başlat; ses oturunca crescendo yap.", "Start low notes softly; once the sound settles, crescendo."),
      L("Parmaklar düzgün ama ses hâlâ kaçıyorsa çalgıyı bir ustaya göster: mandal yayları ve yastıklar kaçırıyor olabilir.", "If the fingers are fine but it still leaks, have the instrument checked: key springs or pads may be leaking.")],
    links:[{ lesson:"pes" }, { lesson:"sag-el" }, { long:55 }, { tab:"gorbas" }] },

  { id:"gicirti", cat:"ses", emo:"🐭", title:L("Gıcırtı (cıyaklama)", "Squeaks"),
    keys:L("gıcırtı cıyaklama ıslık tiz ses kaçak", "squeak squeal whistle leak"),
    sym:[L("Çalarken birden tiz, keskin bir ses çıkıyor; çoğu zaman notanın başında ya da bir geçişte.", "A sudden sharp, high noise jumps out — often at the start of a note or at a change.")],
    why:[L("Bir delik tam kapanmıyor: parmak ucu kaymış ya da parmağın eklemi deliğin üstünde. Sol klarnetin açık deliklerinde en sık sebep budur.", "A hole isn't fully sealed: a fingertip slipped, or a knuckle sits over the hole. On the G clarinet's open holes this is the most common cause."),
      L("Ağızlık fazla içeride ya da alt dudak gevşek; kamış kontrolsüz titreşiyor.", "Too much mouthpiece, or a slack lower lip lets the reed vibrate uncontrolled."),
      L("Kamış çatlak, ucu kırık, eğrilmiş ya da fazla yumuşak.", "The reed is chipped, cracked, warped or too soft."),
      L("Notaya başlarken ağız henüz hazır değil; dil kamıştan ayrılırken dudak da oynuyor.", "The embouchure isn't set when the note starts; the lip moves as the tongue releases.")],
    fix:[L("Önce kaynağı bul: yalnız ağızlık ve kesiği (barel) takıp üfle. Orada da gıcırdıyorsa sorun kamış ya da ağızdadır; gıcırdamıyorsa parmaklardadır.", "First find the source: play just the mouthpiece and barrel. If it squeaks there, it's the reed or embouchure; if not, it's the fingers."),
      L("Parmaklar: gözünü kapat, her deliği parmağın yastığıyla (ucuyla değil) tek tek bas ve deliğin halkasını hisset. Gıcırdayan notada en son inen parmağa bak.", "Fingers: close your eyes and press each hole with the pad of the finger (not the tip), feeling the ring of the hole. On the squeaky note, check the finger that came down last."),
      L("Ağız: dudakları notadan önce kur, sonra dili bırak; hava başladıktan sonra ağzı değiştirme.", "Embouchure: set the lips before the note, then release the tongue; don't change the mouth once the air has started."),
      L("Kamış: ucunu ışığa tut; çatlak ya da dalgalıysa değiştir. Birkaç kamışı sırayla kullan.", "Reed: hold the tip to the light; if it's chipped or wavy, replace it. Rotate several reeds."),
      L("Gıcırtı hep aynı notadaysa o notanın yastığı ya da halkası kaçırıyor olabilir: bir ustaya kontrol ettir.", "If it's always the same note, that note's pad or ring may leak: have it checked.")],
    links:[{ lesson:"durus-nefes" }, { tab:"gorbas" }, { long:67 }, { lesson:"klarneti-tani" }] },

  { id:"ton", cat:"ses", emo:"🎷", title:L("Ses ince, sert ya da havalı", "Thin, harsh or airy tone"),
    keys:L("ton ses kalitesi havalı boğuk sert ince dolgun", "tone quality airy stuffy harsh thin full"),
    sym:[L("Ses hışırtılı, havalı; ya da sıkık, sert ve parlak.", "The sound is breathy and airy, or tight, harsh and buzzy.")],
    why:[L("Havalı ses: dudak köşelerinden hava kaçıyor ya da hava desteksiz ve yavaş.", "Airy: air leaks from the corners of the mouth, or the air is slow and unsupported."),
      L("Sert ve ince ses: dudak ve çene kamışı sıkıyor, ağızlık az alınmış.", "Thin and harsh: lips and jaw squeeze the reed, or there's too little mouthpiece in the mouth."),
      L("Kamış çok sert ya da ölmüş.", "The reed is too hard or worn out.")],
    fix:[L("Ayna karşısında çal: dudak köşeleri ağızlığı her yandan sarsın, yanaklar şişmesin.", "Play in front of a mirror: the corners of the mouth should hug the mouthpiece, cheeks flat."),
      L("Uzun ton: orta bölgede bir notayı 8–12 sn piano başlat, crescendo yap, yeniden hafiflet. Ses rengi bütün nüanslarda aynı kalsın.", "Long tones: start a middle note softly for 8–12 seconds, crescendo, then fade. Keep the colour the same at every dynamic."),
      L("Havayı karından destekle: nefes verirken karın kasları yavaşça içeri çekilsin, göğüs ve omuzlar oynamasın.", "Support from the belly: as you blow, let the belly muscles draw in slowly; chest and shoulders stay still."),
      L("Kayıt alıp dinle: çalarken duyduğun ses ile dışarıdan duyulan farklıdır.", "Record and listen: what you hear while playing differs from what the room hears.")],
    links:[{ lesson:"ses-kalitesi" }, { tab:"long" }, { tab:"rec" }, { lesson:"dinamik" }] },

  { id:"titreme", cat:"ses", emo:"〰️", title:L("Uzun seste ses dalgalanıyor", "The pitch wobbles on long notes"),
    keys:L("uzun ton dalgalanma titreme sabit tutamamak dayanıklılık", "long tone wobble unsteady endurance"),
    sym:[L("Tutulan notanın perdesi ya da gürlüğü dalgalanıyor; sonuna doğru ses düşüyor ya da tize kaçıyor.", "A held note wavers in pitch or volume; towards the end it sags or goes sharp.")],
    why:[L("Nefes desteği notanın sonunda azalıyor; ağız bunu sıkarak telafi ediyor.", "Breath support fades towards the end and the mouth compensates by squeezing."),
      L("Dudak kasları yorgun; çalışma süresi henüz kısa.", "Lip muscles tire; your stamina is still building.")],
    fix:[L("Uzun ton alıştırmasını her gün 5 dakika yap: önce 4 sn, sonra 8, 12, 16. Uygulama sapmayı ve dağılımı puanlar.", "Do long tones for 5 minutes a day: 4 seconds first, then 8, 12, 16. The app scores the drift and spread."),
      L("Dron aç (metronom ve dron paneli) ve aynı perdeyi onun üstünde tut: iki ses arasında dalgalanma (vuru) duyulmasın.", "Turn on the drone (metronome & drone panel) and hold the same perde over it: there should be no beating between the two."),
      L("Notayı bitirirken havayı kesmeden önce dili değil nefesi azalt; perde son ana kadar aynı kalsın.", "End notes by easing the breath, not by stopping with the tongue; keep the pitch until the very end."),
      L("Yorulunca dur, dudağı dinlendir. Kısa ve sık çalışma uzun ve seyrek çalışmadan iyidir.", "Rest when tired. Short, frequent sessions beat long, rare ones.")],
    links:[{ tab:"long" }, { lesson:"uzun-ton" }, { go:"tune" }] },

  { id:"akort", cat:"perde", emo:"🎯", title:L("Genel olarak pes ya da tiz çalıyorum", "I'm generally flat or sharp"),
    keys:L("akort pes tiz kesik barel sıcaklık entonasyon", "tuning flat sharp barrel temperature intonation"),
    sym:[L("Akortta bütün notalar aynı yöne kayıyor: hepsi biraz pes ya da hepsi biraz tiz.", "On the tuner every note leans the same way: all a bit flat or all a bit sharp.")],
    why:[L("Çalgı soğuk: soğuk klarnet pes çalar, ısınınca tizleşir.", "The instrument is cold: a cold clarinet plays flat and rises as it warms."),
      L("Kesik (barel) ve gövdeler doğru açılmamış.", "The barrel and joints aren't set right."),
      L("Ağız alışkanlığı: çene sıkmak tizleştirir, gevşek ve desteksiz hava pesleştirir.", "Embouchure habit: biting raises the pitch, slack unsupported air lowers it.")],
    fix:[L("Çalmadan önce çalgıyı birkaç dakika ısıt (içine sıcak nefes ver ya da hafif notalar çal).", "Warm the instrument for a few minutes before tuning (breathe warm air through it or play softly)."),
      L("Akortu tek notaya göre değil, açık Sol4, Do5 ve Sol5'e birlikte bakarak yap. Hepsi tizse kesiği biraz dışarı çek, hepsi pesse it.", "Tune by looking at open G4, C5 and G5 together, not one note. If all are sharp, pull the barrel out a little; if all are flat, push it in."),
      L("Kesiği çok fazla çekmek boğaz notalarını daha da pesleştirir; çok çekmen gerekiyorsa daha uzun bir kesik ya da başka ağızlık gerekebilir.", "Pulling the barrel a lot lowers the throat notes even more; if you need to pull far, a longer barrel or another mouthpiece may help."),
      L("Ayarladıktan sonra akort aracında birkaç notayı tut, ibre ortada dursun; sonra gözünü kapatıp çal, tekrar bak.", "After setting it, hold a few notes on the tuner until the needle centres; then play with eyes closed and check again.")],
    links:[{ go:"tune" }, { tab:"long" }, { lesson:"klarneti-tani" }] },

  { id:"bogaz", cat:"perde", emo:"🫁", title:L("Boğaz notaları kötü ve tiz", "Throat notes sound poor and sharp"),
    keys:L("boğaz sol♯4 la4 si♭4 bemol cılız tiz zayıf", "throat g#4 a4 bb4 weak sharp thin"),
    sym:[L("Sol♯4, La4, Si♭4 diğer notalardan cılız, boş ve çoğu zaman tiz.", "G♯4, A4 and B♭4 are weaker, hollow and often sharp compared to the rest.")],
    why:[L("Bu notalarda çalgının çok kısa bir bölümü titreşir: ses doğal olarak boş ve tizdir.", "Only a short part of the tube vibrates on these notes, so they are naturally hollow and sharp."),
      L("Boğaz notalarında ağız gevşer ya da sıkılır; hava desteği bırakılır.", "The embouchure loosens or tightens on throat notes and the air support drops.")],
    fix:[L("Sağ el parmaklarını (ve gerekirse Fa mandalını) kapatarak çal: ses dolgunlaşır, perde biraz iner. Parmak tablosunda bu notaların havalandırma alternatiflerine bak.", "Play them with the right-hand fingers (and the F key if needed) down: the tone fills out and the pitch drops slightly. See the venting alternatives in the fingering chart."),
      L("Ağzı diğer notalardaki gibi tut; boğaz notası için ağzı değiştirme.", "Keep the same embouchure as on other notes; don't change it for throat notes."),
      L("Akortta La4'ü Si4 ve Do5 ile kıyasla; La4 tizse havalandırma parmağını kullan.", "Compare A4 with B4 and C5 on the tuner; if A4 is sharp, use the venting fingering.")],
    links:[{ lesson:"bogaz" }, { tab:"tablo" }, { long:69 }, { go:"tune" }] },

  { id:"koma", cat:"perde", emo:"📏", title:L("Koma perdelerini tutturamıyorum", "I can't place the comma perdes"),
    keys:L("koma segah eviç evç hicaz kürdi ara perde mikroton uşşak", "comma segah evc hicaz kurdi microtone perde"),
    sym:[L("Segâh, Evç, Hicaz, Kürdî gibi perdeler Batı notasına kayıyor; makam “düz” duyuluyor.", "Perdes like Segâh, Evç, Hicaz and Kürdî slide to the Western note; the makam sounds “flat-footed”.")],
    why:[L("Klarnetin parmakları 12 eşit yarım sese göre yapılmıştır; koma farkı dudak, hava ve yarım delikle verilir.", "Clarinet fingerings are built for 12 equal semitones; comma differences come from the lips, air and half-holing."),
      L("Kulak henüz farkı duymuyor: duymadığın perdeyi çalamazsın.", "The ear doesn't hear the difference yet: you can't play a perde you can't hear.")],
    fix:[L("Önce dinle: Kulak alıştırmasıyla 1 ve 4 komalık farkları ayırt etmeye çalış.", "Listen first: use the Ear drill to learn to tell 1- and 4-comma differences apart."),
      L("Segâh (Si'nin 1 koma pesi): Si4'ü çal, çeneyi çok az gevşet; akortta ibre 1 koma aşağıda dursun.", "Segâh (B lowered by one comma): play B4 and relax the jaw very slightly; on the tuner the needle should sit one comma low."),
      L("Evç (Fa'nın bakiye diyezi, Fa♯'tan 1 koma pes): Fa♯5'i çal ve hafifçe pesleştir.", "Evç (F with a bakiye sharp, one comma below F♯): play F♯5 and lower it slightly."),
      L("Dron açıp makamın durağı üstünde diziyi yavaşça çık; her perdede akort aracına bak, sonra kulakla aynı yeri bul.", "With the drone on the makam's final, climb the scale slowly; check each perde on the tuner, then find the same spot by ear."),
      L("Sabit kalan pes perdelerde parmakla düzelt: alttaki bir deliği yarım kapatmak perdeyi biraz indirir.", "For perdes that stay low, correct with a finger: half-closing a hole below lowers the pitch slightly.")],
    links:[{ tab:"ear" }, { lesson:"kulak-1" }, { tab:"makam" }, { go:"tune" }, { lesson:"rast-giris" }] },

  { id:"nefes", cat:"nefes", emo:"🌬️", title:L("Nefesim yetmiyor", "I run out of breath"),
    keys:L("nefes yetmiyor uzun cümle soluk diyafram karın", "breath run out phrase breathing diaphragm"),
    sym:[L("Cümlenin ortasında nefes bitiyor; nefes alırken ritim kayıyor.", "Breath runs out mid-phrase; the rhythm slips when you breathe.")],
    why:[L("Nefes göğüsten, omuzlar kalkarak alınıyor; akciğerin alt kısmı dolmuyor.", "Breathing high in the chest with raised shoulders; the lower lungs don't fill."),
      L("Hava kaçıyor (dudak köşeleri) ya da gerekenden fazla hava harcanıyor.", "Air leaks at the corners or more air is used than needed."),
      L("Nefes yerleri önceden seçilmemiş.", "Breathing spots aren't planned.")],
    fix:[L("Ağızdan, hızlı ve derin nefes al: önce karın ve bel genişlesin, omuzlar kalkmasın.", "Breathe in quickly and deeply through the mouth: belly and waist expand first, shoulders stay down."),
      L("Nefes verme alıştırması: metronom 60'ta 4 vuruş nefes al, 8, 12, 16 vuruş boyunca ince ve eşit üfle.", "Exhale drill: at 60 bpm, breathe in for 4 beats, then blow a thin even stream for 8, 12, 16 beats."),
      L("Eserde nefes yerlerini nota üstüne işaretle: genellikle uzun notadan sonra ya da cümle sonunda. Nefes için son notadan biraz çal, ritmi bozma.", "Mark breathing spots in the music, usually after a long note or at the end of a phrase. Take the time from the last note, not from the beat."),
      L("Uzun ton süresini yavaş yavaş artır; nefes dayanıklılığı çalışarak gelir.", "Gradually lengthen your long tones; breath stamina comes with practice.")],
    links:[{ lesson:"durus-nefes" }, { tab:"long" }, { tab:"rhythm" }] },

  { id:"dudak", cat:"nefes", emo:"👄", title:L("Dudak çabuk yoruluyor, ağız ağrıyor", "My lip tires fast or hurts"),
    keys:L("dudak yorgunluk ağrı çene ısırmak diş yara ağızlık", "lip fatigue pain jaw biting teeth embouchure"),
    sym:[L("Birkaç dakika sonra dudak titriyor, alt dudakta diş izi ya da yara oluyor; ses kontrolü kayboluyor.", "After a few minutes the lip shakes, the lower lip gets teeth marks or sores, and control goes.")],
    why:[L("Kamış çeneyle ısırılıyor; ağızlığı tutan dudak değil dişler.", "The reed is being bitten; the teeth hold the mouthpiece instead of the lips."),
      L("Kamış fazla sert.", "The reed is too hard."),
      L("Çalgının ağırlığı ağıza veriliyor; sağ başparmak taşımıyor.", "The instrument's weight goes into the mouth instead of the right thumb.")],
    fix:[L("Çalgıyı sağ başparmak ve üst dişler taşısın; alt dudak yalnızca bir yastık olsun. Başparmak ağrıyorsa boyun askısı kullan.", "Let the right thumb and upper teeth carry the instrument; the lower lip is only a cushion. If the thumb hurts, use a neck strap."),
      L("Dudak köşelerini içe doğru topla (“ü” der gibi), çeneyi aşağıda tut.", "Draw the corners of the mouth in (as if saying “oo”) and keep the jaw down."),
      L("Çalışmayı böl: 10–15 dakika çal, birkaç dakika dinlen.", "Split your practice: 10–15 minutes playing, a few minutes rest."),
      L("Kamış seni zorluyorsa yarım numara yumuşağını dene.", "If the reed fights you, try one half a strength softer.")],
    links:[{ lesson:"durus-nefes" }, { tab:"long" }, { lesson:"ses-kalitesi" }] },

  { id:"dil", cat:"nefes", emo:"👅", title:L("Dil vuruşu yavaş, sert ya da kirli", "Tonguing is slow, heavy or messy"),
    keys:L("dil vuruşu artikülasyon staccato tu tu patlama hızlı dil", "tonguing articulation staccato attack fast tongue"),
    sym:[L("Notaların başı patlıyor ya da “thu” diye boğuk; hızlı dille çalışta ritim dağılıyor.", "Note starts thump or sound like “thu”; fast tonguing falls out of time.")],
    why:[L("Dilin çok büyük bir yeri kamışa değiyor ya da dil kamıştan uzakta duruyor.", "Too much of the tongue touches the reed, or it sits far from the reed."),
      L("Her notada hava yeniden başlatılıyor; dil yerine nefesle ayrılıyor.", "The air restarts on each note; notes are separated with breath, not tongue."),
      L("Çene ve boğaz dil ile birlikte oynuyor.", "Jaw and throat move along with the tongue.")],
    fix:[L("Dil ucunun hemen arkası kamışın ucuna hafifçe değsin. “Tu” ya da “du” hecesini fısılda; çene kıpırdamasın (aynaya bak).", "Let the area just behind the tongue tip touch the reed tip lightly. Whisper “too” or “doo”; keep the jaw still (use a mirror)."),
      L("Önce uzun bir nota çal, sonra havayı kesmeden dille dörtlüklere böl: hava bir musluk gibi açık, dil yalnızca dokunur.", "Start a long note, then split it into quarters with the tongue without stopping the air: air is an open tap, the tongue only touches."),
      L("Metronomla 60'tan başla: dörtlük, sekizlik, üçleme, on altılık. Temizse 4 artır.", "Start at 60 with the metronome: quarters, eighths, triplets, sixteenths. Add 4 when it's clean."),
      L("Hızlı oyun havalarında ikili dil (“tu-ku”) de denenir; önce yavaş ve eşit çalış.", "For fast dance tunes double tonguing (“too-koo”) is an option; practise it slowly and evenly first.")],
    links:[{ lesson:"artikulasyon" }, { tab:"rhythm" }, { lesson:"hiz-artik" }, { tab:"hiz" }] },

  { id:"parmak", cat:"parmak", emo:"🖐️", title:L("Hızlı pasajlarda parmaklar karışıyor", "Fingers tangle in fast passages"),
    keys:L("parmak hız koordinasyon çeviklik karışıyor geç kalıyor hızlı pasaj", "finger speed coordination dexterity fast passage"),
    sym:[L("Hızlanınca notalar yutuluyor, parmaklar aynı anda inmiyor, bazı notalar çift çıkıyor.", "At speed notes vanish, fingers don't land together, some notes double.")],
    why:[L("Parmaklar delikten çok yükseğe kalkıyor; dönüş yolu uzuyor.", "Fingers lift too high above the holes, making the way back longer."),
      L("El gergin; özellikle sağ el ve başparmak sıkıyor.", "The hand is tense, especially the right hand and thumb."),
      L("Pasaj hiç temiz yavaş çalınmadan hızlandırılmış.", "The passage was sped up before it was ever clean slowly.")],
    fix:[L("Parmaklar deliklerin hemen üstünde, bir iki santim yukarıda dursun; kaldırırken değil, basarken hareket et.", "Keep the fingers just above the holes, a centimetre or two; move when pressing, not when lifting."),
      L("Zor yeri iki üç notalık parçalara böl; her birini ritmi değiştirerek çal (uzun-kısa, kısa-uzun).", "Break the hard spot into 2–3 note cells; play each in changed rhythms (long-short, short-long)."),
      L("Hız alıştırmasının tempo merdiveni: temiz çaldıkça tempo kendi kendine artar, hata yapınca geri iner.", "Use the tempo ladder in Speed: clean playing raises the tempo, mistakes bring it back down."),
      L("Ellerini sık sık gevşet: omuzları düşür, başparmakla çalgıyı sıkma.", "Release the hands often: drop the shoulders, don't squeeze the instrument with the thumb.")],
    links:[{ tab:"hiz" }, { lesson:"hiz-parmak" }, { tab:"quiz" }, { lesson:"hiz-metronom" }] },

  { id:"sistem", cat:"parmak", emo:"🔀", title:L("Boehm'den Sol klarnete (Albert) geçiyorum", "Switching from Boehm to the G clarinet (Albert)"),
    keys:L("boehm albert öhler oehler sistem fark parmak pozisyonu halka mandal", "boehm albert oehler system difference fingering rings keys"),
    sym:[L("Si♭ klarnetteki (Boehm) parmaklar Sol klarnette tutmuyor; Fa, Si♭ ve serçe parmak notaları şaşıyor.", "Fingerings from a B♭ (Boehm) clarinet don't work on the G clarinet; F, B♭ and the little-finger notes go wrong.")],
    why:[L("Türk Sol klarneti Albert sistemdir: daha az mandal, sağ elde iki halka, sol elde yüzük yok. Boehm'deki çatal ve yan mandal seçenekleri burada farklıdır ya da yoktur. Alman Öhler sistemi Albert'e yakındır ama ek mandalları vardır.", "The Turkish G clarinet is Albert system: fewer keys, two rings on the right hand, none on the left. Boehm's fork and side-key options differ or are missing. The German Oehler system is close to Albert but has extra keys."),
      L("Sol klarnet daha uzundur; sağ el delikleri daha aralıklıdır.", "The G clarinet is longer; the right-hand holes are further apart."),
      L("Notalar yazılı notaya göre parmaklanır ama duyulan ses bir tam dörtlü pestir: kulağın şaşırabilir.", "Fingerings follow the written note, but it sounds a perfect fourth lower — the ear can be fooled.")],
    fix:[L("Parmak tablosunu aç ve özellikle Fa4, Si♭4, Mi♭ ve serçe mandal notalarını tek tek çal; tablodaki çizimle karşılaştır.", "Open the fingering chart and play F4, B♭4, E♭ and the little-finger notes one by one, comparing with the drawing."),
      L("Gör ve bas ile parmakları notayı düşünmeden bulana kadar çalış; eski alışkanlık ancak tekrarla değişir.", "Use See & press until the fingers find the notes without thinking; old habits change only with repetition."),
      L("Sağ eli gevşek ve yassı tut; parmakların ucu değil yastığı deliğe gelsin.", "Keep the right hand relaxed and flat; the pad, not the tip, goes on the hole."),
      L("Teori'deki transpozisyon konusunu oku: yazılı nota ile duyulan ses arasındaki farkı bilmek kulağı rahatlatır.", "Read the transposition topic in Theory: knowing the written-vs-sounding gap settles the ear.")],
    links:[{ tab:"tablo" }, { tab:"gorbas" }, { tab:"quiz" }, { tab:"teori" }] },

  { id:"glissando", cat:"susleme", emo:"🎢", title:L("Glissando ve kayış olmuyor", "Glissando and slides won't work"),
    keys:L("glissando kayış kayarak giriş portamento parmak kaydırma dudak", "glissando slide portamento finger slide lip bend"),
    sym:[L("Notalar arasında kayma yerine basamak basamak sesler duyuluyor; kayış ortada kopuyor.", "Instead of a smooth slide you hear steps; the slide breaks in the middle.")],
    why:[L("Parmaklar delikleri birden açıyor; kaydırmak yerine kaldırıyor.", "The fingers open the holes all at once — lifting, not sliding."),
      L("Ağız ve dil sabit; kayışın çoğunu dudak ve ağız içi yapar.", "Mouth and tongue stay fixed, while most of a slide comes from the lips and the inside of the mouth."),
      L("Yukarı kayış aşağıdan zordur; register geçişinde (La–Si) kayış ayrıca zorlaşır.", "Sliding up is harder than down; across the break (A–B) it gets harder still.")],
    fix:[L("Parmağı deliğin üstünden yana doğru yavaşça kaydırarak aç; delik yavaş yavaş açılsın. Sol klarnetin açık delikleri bunun için çok uygundur.", "Open the hole by sliding the finger sideways off it, uncovering it gradually. The G clarinet's open holes are made for this."),
      L("Aşağı kayışla başla: notayı çal, çeneyi hafifçe gevşetip perdeyi indir, sonra geri getir. Akortta ne kadar indiğine bak.", "Start with bends down: play a note, relax the jaw slightly to lower it, then bring it back. Watch how far it drops on the tuner."),
      L("Yukarı kayışta dilin arkasını “a”dan “i”ye doğru kaldır ve havayı hızlandır; parmaklar aynı anda kaysın.", "For upward slides, raise the back of the tongue from “ah” to “ee” and speed up the air while the fingers slide."),
      L("Önce küçük aralıklarla (bir ses) çalış, sonra dörtlü ve beşliye genişlet.", "Practise small intervals (a whole tone) first, then widen to fourths and fifths.")],
    links:[{ lesson:"glissando" }, { lesson:"sus-uslup" }, { tab:"susleme" }, { go:"tune" }] },

  { id:"susleme", cat:"susleme", emo:"✨", title:L("Çarpma, tril ve mordan düzensiz", "Grace notes, trills and mordents are uneven"),
    keys:L("çarpma tril mordan süsleme düzensiz yavaş grupetto çevirme", "grace note trill mordent ornament uneven turn"),
    sym:[L("Çarpma ana notadan uzun sürüyor ya da ritmi kaydırıyor; tril eşit değil, yavaşlayıp hızlanıyor.", "Grace notes last too long or shift the beat; the trill is uneven, slowing and rushing.")],
    why:[L("Süsleme notası “ayrı bir nota” gibi çalınıyor; ana notanın zamanından çalınmıyor.", "The ornament is played as a separate note instead of inside the main note's time."),
      L("Tril parmağı kaldırılırken yükseğe gidiyor; el sıkı.", "The trill finger lifts too high; the hand is tense.")],
    fix:[L("Önce süslemesiz çal, sonra süslemeyi ekle: ana notanın vuruşu yerinde kalmalı.", "Play it plain first, then add the ornament: the main note's beat must stay in place."),
      L("Trili ritimli çalış: önce sekizlik, sonra üçleme, sonra on altılık; parmak deliğin hemen üstünde.", "Practise trills in rhythm: eighths, then triplets, then sixteenths; finger right above the hole."),
      L("Süsleme alıştırması süreyi ve düzeni ölçer; hedef süreyi tutana kadar tekrar et.", "The Ornaments drill measures timing and evenness; repeat until you hit the target."),
      L("Ustaların kayıtlarını dinle: Türk müziğinde süsleme makama ve yöreye göre değişir.", "Listen to masters' recordings: in Turkish music ornaments vary with the makam and region.")],
    links:[{ tab:"susleme" }, { lesson:"sus-carpma" }, { lesson:"sus-tril" }, { tab:"videos" }] },

  { id:"vibrato", cat:"susleme", emo:"🌊", title:L("Vibrato düzensiz ya da hiç yok", "Vibrato is uneven or missing"),
    keys:L("vibrato titreşim çene dalgalanma", "vibrato jaw wavering"),
    sym:[L("Vibrato keçi meler gibi hızlı ya da düzensiz; ya da ses hep düz.", "The vibrato bleats or wobbles unevenly — or the sound is always straight.")],
    why:[L("Vibrato çeneyle yapılır: çene düzenli küçük hareketlerle perdeyi biraz indirip geri getirir. Hareket kontrolsüzse vibrato düzensiz olur.", "Vibrato is made with the jaw, lowering and returning the pitch in small regular movements. Uncontrolled movement makes it uneven.")],
    fix:[L("Metronom 60'ta vuruş başına 2, sonra 3, sonra 4 dalga yap; perde yukarı değil aşağı doğru dalgalansın.", "At 60 bpm make 2, then 3, then 4 waves per beat; let the pitch dip below, not above."),
      L("Önce düz ses: uzun tonda düz tutabildiğin sesi vibratolu çalmak daha kolaydır.", "Straight tone first: a note you can hold straight is easier to add vibrato to."),
      L("Vibrato bir süs: her notaya koyma, uzun notalara ve cümle sonlarına sakla.", "Vibrato is an ornament: save it for long notes and phrase ends, not every note.")],
    links:[{ lesson:"vibrato" }, { tab:"long" }, { go:"tune" }] },

  { id:"kamis", cat:"ekipman", emo:"🪶", title:L("Kamış sorunları: seçme ve bakım", "Reed trouble: choosing and care"),
    keys:L("kamış sert yumuşak numara seçme ömür ölü kamış ağızlık bağ", "reed hard soft strength choose life dead mouthpiece ligature"),
    sym:[L("Dün iyi çalan kamış bugün kötü; ses kapanıyor ya da çok zor çıkıyor.", "A reed that played well yesterday is bad today; the sound closes up or is very hard to get.")],
    why:[L("Fazla yumuşak kamış tiz notalarda kapanır, ses pes ve vızıltılı olur. Fazla sert kamış havayı zorlar, ses havalı ve inatçıdır.", "A reed that's too soft closes on high notes and buzzes flat; one that's too hard resists, sounding airy and stubborn."),
      L("Kamış eskir: birkaç haftalık düzenli çalışmada canlılığını yitirir, ucu çatlar ya da dalgalanır.", "Reeds wear out: after a few weeks of steady use they lose life, the tip chips or warps."),
      L("Kamış ağızlıkta ortalanmamış ya da bağ (kelepçe) eğri.", "The reed isn't centred on the mouthpiece, or the ligature is crooked.")],
    fix:[L("Kamışın ucu ağızlığın ucuyla tam hizada olsun (bir saç teli kadar geride); yanlarda eşit pay kalsın; bağı orta sıkılıkta tak.", "Line the reed tip up with the mouthpiece tip (a hair below), equal on both sides; tighten the ligature moderately."),
      L("Çalmadan önce kamışı bir iki dakika ağızda ya da suda ıslat.", "Wet the reed for a minute or two in your mouth or in water before playing."),
      L("Üç dört kamışı sırayla kullan; çaldıktan sonra kurulayıp düz bir yüzeyde ya da kutusunda sakla.", "Rotate three or four reeds; after playing, wipe them and store them flat or in a case."),
      L("Doğru sertlik: pes Mi3 ve tiz Do6 ikisi de rahat çıkmalı. Pes zor çıkıyorsa kamış sert, tiz kapanıyorsa yumuşak.", "The right strength lets both low E3 and high C6 speak comfortably. Hard lows mean too hard; closing highs mean too soft.")],
    links:[{ lesson:"klarneti-tani" }, { long:84 }, { long:52 }] },

  { id:"su", cat:"ekipman", emo:"💧", title:L("Ses cızırtılı ya da hırıltılı, bir notada kesiliyor", "Gurgling or buzzing; a note cuts out"),
    keys:L("su damla cızırtı hırıltı fokurdama nem bakım temizlik", "water gurgle buzz moisture cleaning care"),
    sym:[L("Bir süre çaldıktan sonra belli bir notada fokurdama ya da cızırtı duyuluyor; ses bir anda kesiliyor.", "After a while one note starts gurgling or buzzing; the sound cuts out suddenly.")],
    why:[L("Nefesteki nem bir deliğe ya da register borusuna su olarak toplanır.", "Moisture from the breath collects in a tone hole or the register tube."),
      L("Soğuk çalgıda yoğuşma daha fazladır.", "Cold instruments collect more condensation.")],
    fix:[L("Cümle arasında suyun toplandığı deliği açıp kısa ve sert üfle; ya da deliğe ince bir kâğıt şerit bastırıp nemi al.", "Between phrases open the wet hole and blow a short sharp breath, or press a thin paper strip on the hole to soak it up."),
      L("Çalmadan önce çalgıyı ısıt; çaldıktan sonra temizlik bezini gövdelerden geçir.", "Warm the instrument before playing; pull a swab through after playing."),
      L("Sorun sürekli aynı deliktense bir ustaya göster: deliğin içi ya da register borusu temizlik isteyebilir.", "If it's always the same hole, show a repairer: the hole or register tube may need cleaning.")],
    links:[{ lesson:"klarneti-tani" }] }
];

TRAINERS.sorun = function(ctx){
  const { SK, $, store, esc } = ctx;
  const P = $("pp-sorun");
  P.innerHTML = `
    <p class="pdesc">${L("Klarnet çalarken sık karşılaşılan sorunlar: belirtisi, neden olduğu ve adım adım çözümü. Belirtiyi yaz ya da konu seç; düğmeler ilgili ders, alıştırma ya da akort aracını açar, ← ile buraya dönersin.",
      "Common problems clarinettists run into: what it sounds like, why it happens and how to fix it step by step. Type a symptom or pick a topic; the buttons open the matching lesson, drill or tuner, and ← brings you back.")}</p>
    <div class="sqfilt">
      <input id="sqq" type="search" placeholder="${L("Belirti ara: gıcırtı, Si4, nefes…", "Search a symptom: squeak, B4, breath…")}" aria-label="${L("Sorun ara", "Search problems")}" autocomplete="off" enterkeyhint="search">
      <div class="mklist" id="sqcat" role="radiogroup" aria-label="${L("Konu", "Topic")}">
        <button type="button" role="radio" data-c="">${L("Hepsi", "All")}</button>
        ${SQ_CATS.map(([id, emo, name]) => `<button type="button" role="radio" data-c="${id}"><span aria-hidden="true">${emo}</span> ${esc(name)}</button>`).join("")}
      </div>
    </div>
    <div id="sqout"></div>
    <p class="muted small">${L("Sorun sürüyorsa bir hocaya ya da çalgı ustasına danış: bazı sorunlar (kaçıran yastık, eğri mandal) yalnızca onarımla geçer.",
      "If a problem persists, ask a teacher or repairer: some (leaking pads, bent keys) only go away with a repair.")}</p>`;
  const fold = s => s.toLocaleLowerCase("tr").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i");
  const hay = SQ.map(s => fold([s.title, s.keys, ...s.sym, ...s.why, ...s.fix].join(" ")));
  let cat = store.get("sorun.cat", "");
  const opened = new Set(store.get("sorun.open", ["la-si"]));

  function linkHtml(k){
    // Kilitli ders açılamaz (dersler sırayla açılır): kart soluk, yalnız adı görünür
    if(k.lesson){ const l = lessonById(k.lesson), on = SK.lessonOpen(k.lesson); return l ? `<button type="button" class="hcard" data-lesson="${k.lesson}"${on ? "" : " disabled"}><span class="hic">${ART.icon("lessons")}</span><span><small>${L("Ders", "Lesson")}${on ? "" : L(" · kilitli", " · locked")}</small><b>${esc(pick(l.title, LANG))}</b></span></button>` : ""; }
    if(k.long) return `<button type="button" class="hcard" data-long="${k.long}"><span class="hic">${ART.icon("long")}</span><span><small>${L("Uzun ton", "Long tone")}</small><b>${esc(ctx.label(k.long))} ${L("notasını tut", "— hold it")}</b></span></button>`;
    if(k.tab){ const t = SK.practiceTabs().find(x => x.id === k.tab); return t ? `<button type="button" class="hcard" data-tab="${k.tab}"><span class="hic">${ART.icon(k.tab)}</span><span><small>${esc(t.group)}</small><b>${esc(t.name)}</b></span></button>` : ""; }
    if(k.go === "tune") return `<button type="button" class="hcard" data-go="tune"><span class="hic">${ART.icon("sun")}</span><span><small>${L("Akort", "Tuner")}</small><b>${L("Perdeni ölç", "Check your pitch")}</b></span></button>`;
    return "";
  }
  const list = (items, tag = "ul") => `<${tag} class="thlist">${items.map(x => `<li>${esc(x)}</li>`).join("")}</${tag}>`;
  function render(){
    const q = fold($("sqq").value.trim()), words = q.split(/\s+/).filter(Boolean);
    $("sqcat").querySelectorAll("[data-c]").forEach(b => b.setAttribute("aria-checked", b.dataset.c === cat ? "true" : "false"));
    const shown = SQ.filter((s, i) => (!cat || s.cat === cat) && words.every(w => hay[i].includes(w)));
    $("sqout").innerHTML = shown.length ? shown.map(s => {
      const c = SQ_CATS.find(x => x[0] === s.cat);
      return `<details class="sqitem" data-id="${s.id}"${opened.has(s.id) || words.length ? " open" : ""}>
        <summary><span class="sqemo" aria-hidden="true">${s.emo}</span><span><b>${esc(s.title)}</b><small>${esc(c[2])}</small></span></summary>
        <div class="sqbody">
          <h4 class="thh">${L("Belirti", "What you notice")}</h4>${list(s.sym)}
          <h4 class="thh">${L("Neden olur?", "Why it happens")}</h4>${list(s.why)}
          <h4 class="thh">${L("Ne yapmalı?", "What to do")}</h4>${list(s.fix, "ol")}
          <h4 class="thh">${L("Hemen çalış", "Practise it now")}</h4><div class="hcards thlinks">${s.links.map(linkHtml).join("")}</div>
        </div></details>`;
    }).join("") : `<p class="muted">${L("Bu aramaya uyan sorun yok. Başka bir kelime dene ya da “Hepsi”ni seç.", "No problem matches. Try another word or pick “All”.")}</p>`;
  }
  $("sqq").addEventListener("input", render);
  $("sqcat").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if(!b) return; cat = b.dataset.c; store.set("sorun.cat", cat); render(); });
  // Açık kalan sorunlar hatırlanır (aramayla açılanlar hariç)
  $("sqout").addEventListener("toggle", e => {
    const d = e.target; if(!d.matches || !d.matches("details.sqitem") || $("sqq").value.trim()) return;
    if(d.open) opened.add(d.dataset.id); else opened.delete(d.dataset.id);
    store.set("sorun.open", [...opened]);
  }, true);
  $("sqout").addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b || b.disabled) return;
    const d = b.dataset;
    if(d.lesson) SK.openLesson(d.lesson);
    else if(d.long){ store.set("long.note", d.long); const s = $("ltnote"); if(s) s.value = d.long; SK.nav.open("long"); }
    else if(d.tab) SK.nav.open(d.tab);
    else if(d.go) SK.go(d.go);
  });

  // Kartlar her girişte yeniden çizilir: practice.js'in kurulumu bitince var olan SK.practiceTabs'ı kullanır, açılan dersler de güncellenir
  return { enter: render };
};
