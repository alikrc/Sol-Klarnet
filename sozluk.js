// Terimler sözlüğü (docs/BACKLOG.md S5.4): derslerin, Teori'nin ve learn.js'in kullandığı terimler, tek yerde.
// Tanımlar var olan ders ve Teori metinlerinden derlenir; burada yeni bilgi yazılmaz. Perde tanımları core.js PERDES
// ve learn.js commaToWritten'dan üretilir (Rast'tan kaç koma, yazılı nota).
// Kayıt: { id, cat, term:{tr,en}, def:{tr,en}, see:["ders:<id>" | "teori:<id>" | "makam:<id>"],
//          match?:{ tr:[…], en:[…] } (ders metninde aranan biçimler; yoksa terimin kendisi),
//          mark?:false (çok genel kelime: sözlükte durur, ders metninde işaretlenmez), skip?: RegExp (yanlış anlam),
//          cs?:true (büyük-küçük harf duyarlı: perde adları; rast gelmek Rast değil) }
// Ders metninde işaretleme (lessonview.js, trainers.js read): metin çizildikten sonra metin düğümleri taranır, her terimin
// ilk geçtiği yer noktalı altı çizili düğme olur; dokununca alt panelde tanım (nav.js openSheet). Türkçe ekler için kök
// eşleme: terim + en çok 6 harf ek (Rast'ta, kamışın, dörtlüsünün). Desen dil başına bir kez kurulur.
// Node'da (scripts/mufredat-check.js) require ile yüklenir; tarayıcıda learn.js ve core.js'ten sonra.
const SZ_LEARN = typeof module !== "undefined" ? { ...require("./core.js"), ...require("./learn.js") } : { commaToWritten, noteName, PERDES };
const sz = (tr, en) => ({ tr, en });

const SZ_CATS = [
  ["calgi", sz("Çalgı ve teknik", "Instrument and technique")],
  ["nota", sz("Nota yazısı", "Notation")],
  ["aralik", sz("Koma ve aralıklar", "Commas and intervals")],
  ["perde", sz("Perde adları", "Perde names")],
  ["cesni", sz("Çeşniler", "Çeşnis")],
  ["makam", sz("Makam terimleri", "Makam terms")],
  ["usul", sz("Usuller", "Usuls")],
  ["form", sz("Formlar", "Forms")],
  ["susleme", sz("Süslemeler", "Ornaments")]
];

// Perde adları: Teori'nin "Perdeler ve isimleri" konusundaki cümle varsa o, yoksa yalnız üretilen satır
const SZ_PERDES = [
  ["yegah", "Yegâh", sz("Rast'ın altındaki perdelerden biri.", "One of the perdes below Rast.")],
  ["huseyniasiran", "Hüseynî Aşîran", sz("Rast'ın altındaki perdelerden biri.", "One of the perdes below Rast.")],
  ["acemasiran-p", "Acem Aşîran", sz("Rast'ın altındaki perdelerden biri.", "One of the perdes below Rast.")],
  ["irak", "Irak", sz("Rast'ın altındaki perdelerden biri; Evç'in bir oktav pesi.", "One of the perdes below Rast; an octave below Evç.")],
  ["rast-p", "Rast", sz("Ana perde: sol anahtarının sardığı çizgideki nota; tizi Gerdâniye.", "Main perde: the note on the line the treble clef curls around; its upper octave is Gerdâniye.")],
  ["zirgule", "Zirgüle", null],
  ["dugah-p", "Dügâh", sz("Ana perde; tizi Muhayyer. Türk müziğinde en çok karar verilen perdelerden biri.", "Main perde; its upper octave is Muhayyer. One of the perdes Turkish music most often ends on.")],
  ["kurdi-p", "Kürdî", sz("Dügâh ile Nevâ arasındaki ara perdelerden biri; notada ♭5. Dik Kürdî'den 1 koma pestir.", "One of the in-between perdes from Dügâh to Nevâ; ♭5 in notation. One comma below Dik Kürdî.")],
  ["dikkurdi", "Dik Kürdî", sz("Dügâh ile Nevâ arasındaki ara perdelerden biri; notada ♭4. Kürdî'den 1 koma tizdir.", "One of the in-between perdes from Dügâh to Nevâ; ♭4 in notation. One comma above Kürdî.")],
  ["segah-p", "Segâh", sz("Ana perde: Si4'ün 1 koma pesi (notada ♭1).", "Main perde: one comma below B4 (♭1 in notation).")],
  ["buselik-p", "Bûselik", sz("Dügâh ile Nevâ arasındaki ara perdelerden biri: Segâh'tan 1 koma tiz, Dügâh'tan tam 9 koma uzakta.", "One of the in-between perdes from Dügâh to Nevâ: one comma above Segâh, a full 9 commas from Dügâh.")],
  ["cargah-p", "Çargâh", sz("Ana perde.", "Main perde.")],
  ["nimhicaz", "Nim Hicaz", sz("Dügâh ile Nevâ arasındaki ara perdelerden biri. Hicaz dizilerinde adına rağmen Hicaz perdesi değil Nim Hicaz kullanılır.", "One of the in-between perdes from Dügâh to Nevâ. Despite the name, Hicaz scales use Nim Hicaz, not the Hicaz perde.")],
  ["hicaz-p", "Hicaz", sz("Dügâh ile Nevâ arasındaki ara perdelerden biri. Saba dörtlüsünün dördüncü sesidir.", "One of the in-between perdes from Dügâh to Nevâ. The fourth note of the Saba tetrachord.")],
  ["neva", "Nevâ", sz("Ana perde.", "Main perde.")],
  ["hisar", "Hisar", sz("Hüzzam beşlisinin dördüncü sesi; çok değişken bir perdedir.", "The fourth note of the Hüzzam pentachord; a very changeable perde.")],
  ["huseyni-p", "Hüseynî", sz("Ana perde.", "Main perde.")],
  ["acem-p", "Acem", null],
  ["evc-p", "Evç", sz("Ana perde: Fa5'in bakiye diyezi (notada ♯4). Çoğu klarnette biraz tiz çıkar; dudakla indirilir.", "Main perde: F5 raised by a bakiye (♯4 in notation). It comes out a little sharp on most clarinets; bring it down with the lips.")],
  ["gerdaniye-p", "Gerdâniye", sz("Ana perde: Rast'ın tizi.", "Main perde: the upper octave of Rast.")],
  ["muhayyer-p", "Muhayyer", sz("Dügâh'ın tizi.", "The upper octave of Dügâh.")]
];

const SOZLUK = [
  // ---- Çalgı ve teknik ----
  { id:"sol-klarnet", cat:"calgi", term:sz("Sol klarnet", "G clarinet"), match:{ tr:["Sol klarnet"], en:["G clarinet", "Sol clarinet"] },
    def:sz("Transpoze bir çalgı: yazılı nota duyulan sesin tam dörtlü (5 yarım ses) üstüdür. Yazılı Do çalınca Sol duyulur; adı buradan gelir.",
      "A transposing instrument: the written note is a perfect fourth (5 semitones) above the sound. Play a written C and you hear G; that is where the name comes from."),
    see:["teori:transpoz", "ders:teori-transpoz"] },
  { id:"albert", cat:"calgi", term:sz("Albert sistem", "Albert system"),
    def:sz("Sol klarnetlerin çoğu Albert sistemdir: Batı'daki Boehm klarnetten daha az mandalı ve daha çok açık deliği vardır; bu, kayan seslere (glissando) ve dudakla perde oynatmaya uygundur.",
      "Most G clarinets are Albert system: fewer keys and more open holes than the Western Boehm clarinet, which suits sliding notes (glissando) and bending the pitch with the lips."),
    see:["ders:klarneti-tani"] },
  { id:"agizlik", cat:"calgi", term:sz("Ağızlık (bek)", "Mouthpiece"), match:{ tr:["ağızlık", "ağızlığ"], en:["mouthpiece"] },
    def:sz("Klarnetin en üst parçası; kamış ve bağ üstündedir. Açıklığı geniş (açık) bek genellikle daha yumuşak, dar (kapalı) bek daha sert kamışla iyi çalışır.",
      "The top part of the clarinet; the reed and ligature sit on it. A wide (open) mouthpiece usually works well with a softer reed, a narrow (closed) one with a harder reed."),
    see:["ders:klarneti-tani", "ders:agizlik", "ders:kamis"] },
  { id:"kamis", cat:"calgi", term:sz("Kamış", "Reed"), match:{ tr:["kamış"], en:["reed"] },
    def:sz("Sesin kaynağı: dil çekilince kamış titremeye başlar. Sert ya da yumuşak oluşu ağızlığın açıklığına ve çalanın ağzına uymalıdır; tek bir doğru numara yoktur.",
      "The source of the sound: when the tongue lifts away, the reed starts to vibrate. Its hardness should suit the mouthpiece opening and the player's mouth; there is no single right number."),
    see:["ders:kamis", "ders:bakim"] },
  { id:"barel", cat:"calgi", term:sz("Kesik (baş, barel)", "Barrel"), match:{ tr:["barel", "fıçı", "kesiği", "kesikle"], en:["barrel"] },
    def:sz("Ağızlıkla üst gövde arasındaki parça. Bütün notalar tizse biraz dışarı çekilir, hepsi pesse itilir; çok çekmek boğaz notalarını daha da pesleştirir.",
      "The piece between the mouthpiece and the upper joint. If every note is sharp, pull it out a little; if all are flat, push it in. Pulling it far makes the throat notes even flatter."),
    see:["ders:akortlama", "ders:klarneti-tani"] },
  { id:"ust-govde", cat:"calgi", term:sz("Üst gövde", "Upper joint"), match:{ tr:["üst gövde"], en:["upper joint"] },
    def:sz("Sol elin gövdesi: sol başparmak arkadaki deliği ve register mandalını, sol 1-2-3 parmaklar üst gövdenin üç deliğini kapatır.",
      "The left hand's joint: the left thumb covers the back hole and the register key, left fingers 1-2-3 the three holes of the upper joint."),
    see:["ders:klarneti-tani", "ders:eller"] },
  { id:"alt-govde", cat:"calgi", term:sz("Alt gövde", "Lower joint"), match:{ tr:["alt gövde"], en:["lower joint"] },
    def:sz("Sağ elin gövdesi: sağ 1-2-3 parmaklar alt gövdenin üç deliğini kapatır, sağ başparmak dayanaktadır.",
      "The right hand's joint: right fingers 1-2-3 cover its three holes, the right thumb rests on the thumb rest."),
    see:["ders:klarneti-tani", "ders:eller"] },
  { id:"kalak", cat:"calgi", term:sz("Kalak", "Bell"), match:{ tr:["kalak", "kalağ"], en:["bell"] }, skip:/belly/i,
    def:sz("Klarnetin en alttaki parçası; montajda ilk olarak alt gövdeye takılır.", "The lowest part of the clarinet; in assembly it goes onto the lower joint first."),
    see:["ders:klarneti-tani"] },
  { id:"mandal", cat:"calgi", term:sz("Mandal", "Key"), match:{ tr:["mandal"], en:["keys"] },
    def:sz("Parmakla basılan kol. Sol klarnette delikler açıktır (kapak yok); bazı notalar mandallarla çalınır: Sol♯4 yan mandal, La4 La mandalı, Si♭4 La mandalı ve register.",
      "A lever pressed with a finger. On the G clarinet the holes are open (no covers); some notes are played with keys: G♯4 with the side key, A4 with the A key, B♭4 with the A key and the register."),
    see:["ders:bogaz", "ders:pes"] },
  { id:"register", cat:"calgi", term:sz("Register mandalı", "Register key"), match:{ tr:["register"], en:["register key", "register"] },
    def:sz("Sol başparmakla basılan mandal. Başparmak deliği kapalıyken basılınca ses on ikili (oktav + beşli) yükselir: Mi3 parmağı Si4, Fa3 parmağı Do5 olur.",
      "The key pressed with the left thumb. With the thumb hole closed it raises the note a twelfth (octave + fifth): the E3 fingering becomes B4, F3 becomes C5."),
    see:["ders:onikili", "ders:register"] },
  { id:"embouchure", cat:"calgi", term:sz("Ağız pozisyonu (embouchure)", "Embouchure"), match:{ tr:["embouchure", "ağız pozisyon"], en:["embouchure"] },
    def:sz("Amaç iki şeyi birlikte tutmaktır: kamışın serbestçe titreyebileceği kadar gevşeklik ve havanın kaçmayacağı kadar sızdırmazlık.",
      "The aim is to hold two things together: loose enough for the reed to vibrate freely, sealed enough that no air escapes."),
    see:["ders:agizlik"] },
  { id:"dil-vurusu", cat:"calgi", term:sz("Dil vuruşu", "Tonguing"), match:{ tr:["dil vuruş", "dille başlat"], en:["tonguing"] },
    def:sz("Notayı nefesle değil dille başlatmak: dilin ucu kamışın ucuna hafifçe değer, hava arkada hazırdır; dil çekilince kamış titremeye başlar.",
      "Starting a note with the tongue, not the breath: the tip of the tongue lightly touches the tip of the reed, the air waits behind; when the tongue lifts, the reed starts to vibrate."),
    see:["ders:dil-ilk", "ders:artikulasyon"] },
  { id:"artikulasyon", cat:"calgi", term:sz("Artikülasyon", "Articulation"),
    def:sz("Notaların birbirine nasıl bağlandığı: bağlı, kesik, tenuto. Dil vuruşu notayı başlatır, artikülasyon bağlanışı söyler.",
      "How notes join one another: slurred, staccato, tenuto. Tonguing starts a note; articulation is how notes connect."),
    see:["ders:artikulasyon", "ders:artikulasyon-2"] },
  { id:"legato", cat:"calgi", term:sz("Bağlı (legato)", "Legato"), match:{ tr:["legato"], en:["legato"] },
    def:sz("Yalnız ilk nota dille başlar, sonrakilere hava kesilmeden yalnız parmaklar geçer. Notada bağ yayıyla (notaların üstünde eğri) gösterilir.",
      "Only the first note is tongued; the fingers move to the next notes without stopping the air. Shown by a slur (a curve over the notes)."),
    see:["ders:artikulasyon-2", "ders:hiz-artik"] },
  { id:"staccato", cat:"calgi", term:sz("Kesik (staccato)", "Staccato"), match:{ tr:["staccato"], en:["staccato"] },
    def:sz("Her nota dille başlar ve kısa kesilir: notanın ardından sessizlik kalır. Notada nota başının yanındaki noktayla gösterilir.",
      "Each note is tongued and cut short, leaving silence after it. Shown by a dot at the note head."),
    see:["ders:artikulasyon-2"] },
  { id:"tenuto", cat:"calgi", term:sz("Tenuto", "Tenuto"),
    def:sz("Notada kısa yatay çizgiyle gösterilen artikülasyon; bağlı ve kesik çalışın yanında üçüncü çalış biçimidir.",
      "An articulation shown by a short horizontal line at the note; the third way of playing beside slurred and staccato."),
    see:["ders:artikulasyon-2"] },
  { id:"diyafram", cat:"calgi", term:sz("Diyafram (karından nefes)", "Diaphragm (belly breathing)"), match:{ tr:["diyafram", "karından nefes"], en:["diaphragm", "belly breathing"] },
    def:sz("“Karından nefes al” sözü bir hissi anlatır: hava yine ciğerlere gider, diyafram aşağı indiği için karın öne gelir. Omuzlar kalkmaz, alt kaburgalar yanlara ve arkaya genişler.",
      "“Breathe from the belly” describes a feeling: the air still goes to the lungs, the belly comes forward because the diaphragm moves down. The shoulders stay down, the lower ribs widen sideways and back."),
    see:["ders:durus-nefes", "ders:nefes-cumle"] },
  { id:"nefes-yeri", cat:"calgi", term:sz("Nefes yeri", "Breath mark"), match:{ tr:["nefes yer"], en:["breath mark"] },
    def:sz("Dizeğin üstündeki virgül (’): nefesin alınacağı yer.", "The comma (’) above the staff: where to take a breath."),
    see:["ders:nefes-2"] },
  { id:"surekli-nefes", cat:"calgi", term:sz("Sürekli nefes (döngüsel nefes)", "Circular breathing"), match:{ tr:["sürekli nefes", "döngüsel nefes"], en:["circular breathing"] },
    def:sz("Bazı nefesli çalgı icracılarının sesi kesmeden çalmak için kullandığı teknik: yanaklarda biriktirilen hava ağızdan verilirken burundan nefes alınır.",
      "A technique some wind players use to play without a break: air stored in the cheeks is pushed out through the mouth while breathing in through the nose."),
    see:["ders:nefes-3"] },
  { id:"cumle", cat:"calgi", term:sz("Cümle", "Phrase"), match:{ tr:["cümle"], en:["phrase"] },
    def:sz("Bir nefeste çalınan ve bir perdede dinlenerek biten kısa ezgi. Ezgi konuşma gibi cümlelere ayrılır.",
      "A short melody played in one breath that ends resting on a perde. A melody divides into phrases, like speech."),
    see:["ders:nefes-cumle", "ders:taksim-cumle"] },
  { id:"uzun-ton", cat:"calgi", term:sz("Uzun ton", "Long tone"), match:{ tr:["uzun ton"], en:["long tone"] },
    def:sz("Klarnetçinin günlük ekmeği: bir notayı uzun tutarak sesi sabit, perdeyi temiz ve tonu dolgun tutmayı öğretir.",
      "The clarinettist's daily bread: holding a note to learn a steady sound, clean pitch and a full tone."),
    see:["ders:uzun-ton", "ders:uzun-ses-ilk"] },
  { id:"isinma", cat:"calgi", term:sz("Isınma", "Warm-up"), match:{ tr:["ısınma"], en:["warm-up"] },
    def:sz("Hem dudağı hem çalgıyı hazırlar: soğuk klarnet pes çalar, ısındıkça tizleşir. Klarnetsiz birkaç rahat nefes, açık Sol'de ve pes Sol3'te uzun ton, sonra yavaş bir dizi.",
      "It prepares both lips and instrument: a cold clarinet plays flat and goes sharp as it warms. A few easy breaths without the clarinet, long tones on open G and low G3, then a slow scale."),
    see:["ders:isinma"] },
  { id:"bogaz", cat:"calgi", term:sz("Boğaz notaları", "Throat notes"), match:{ tr:["boğaz nota"], en:["throat note"] },
    def:sz("Açık Sol'ün üstündeki üç nota (Sol♯4, La4, Si♭4): mandallarla çalınır, çok az parmak kapalıdır; ses kolayca incelir ve tizleşir.",
      "The three notes above open G (G♯4, A4, B♭4): played with keys and very few fingers down, so the sound easily goes thin and sharp."),
    see:["ders:bogaz", "ders:ezgi-bogaz"] },
  { id:"pes-bolge", cat:"calgi", term:sz("Pes bölge (chalumeau)", "Low register (chalumeau)"), match:{ tr:["pes bölge", "chalumeau"], en:["low register", "chalumeau"] },
    def:sz("Klarnetin register basılmadan çalınan pes bölgesi. Klarino bölgesinin parmakları bu bölgenin aynısıdır.",
      "The clarinet's low register, played without the register key. The fingerings of the clarion register are the same as here."),
    see:["ders:pes", "ders:ezgi-pes"] },
  { id:"klarino", cat:"calgi", term:sz("Klarino bölgesi", "Clarion register"), match:{ tr:["klarino"], en:["clarion"] },
    def:sz("Register basılı bölge: parmaklar pes bölgenin aynısıdır, ses on ikili tizdir (La3 → Mi5, Do4 → Sol5).",
      "The register with the register key down: the fingerings are those of the low register, the sound a twelfth higher (A3 → E5, C4 → G5)."),
    see:["ders:register", "ders:klarino"] },
  { id:"altissimo", cat:"calgi", term:sz("Altissimo", "Altissimo"),
    def:sz("Klarino bölgesinin üstündeki notalar: tizdir ve parmakları karışıktır.", "The notes above the clarion register: high, with complicated fingerings."),
    see:["ders:altissimo-1", "ders:altissimo-2"] },
  { id:"onikili", cat:"calgi", term:sz("On ikili", "Twelfth"), match:{ tr:["on ikili"], en:["twelfth"] },
    def:sz("Oktav + beşli. Register mandalı sesi on ikili yükseltir: aynı parmak, iki ses.", "An octave plus a fifth. The register key raises the note a twelfth: one fingering, two notes."),
    see:["ders:onikili"] },
  { id:"kirilma", cat:"calgi", term:sz("Kırılma (register geçişi)", "The break"), match:{ tr:["kırılma", "register geçiş"], en:["the break", "register change"] },
    def:sz("Si♭4 (boğaz notası) ile Si4 (klarino) arasında parmakların neredeyse tamamen değiştiği geçiş: bütün parmaklar aynı anda inmeli, yoksa arada istenmeyen sesler duyulur.",
      "The change between B♭4 (a throat note) and B4 (clarion) where nearly every finger changes: all fingers must land together, or unwanted notes sound in between."),
    see:["ders:kirilma-1", "ders:register-gecisi"] },
  { id:"dron", cat:"calgi", term:sz("Dron", "Drone"), match:{ tr:["dron"], en:["drone"] },
    def:sz("Arkada sürekli çalan sabit ses, genelde makamın durak perdesi. Onun üstünde çalarak perdeler kulakla oturtulur.",
      "A steady background note, usually the makam's tonic. Playing over it helps you place the perdes by ear."),
    see:["ders:kulak-1"] },
  { id:"akort", cat:"calgi", term:sz("Akort", "Tuning"), match:{ tr:["akort"], en:["tuning"] }, mark:false,
    def:sz("Bütün notaların birlikte doğru yerde durması. Tek tek notaları dudakla düzeltmeden önce çalgı ayarlanır: ısıtılır, gerekirse kesik çekilir ya da itilir.",
      "All the notes sitting in the right place together. Before fixing single notes with the lips you set the instrument: warm it up, and pull or push the barrel if needed."),
    see:["ders:akortlama"] },
  { id:"bolahenk", cat:"calgi", term:sz("Bolahenk", "Bolahenk"),
    def:sz("En yaygın akort: Türk müziği notası Rast'ı Sol'e yazar ve Bolahenk'te yazılandan tam dörtlü pes çalınır. Sol klarnetin farkı da tam dörtlü olduğundan Sol klarnetçi notayı olduğu gibi okur.",
      "The most common pitch level: Turkish notation writes Rast as G, and in Bolahenk it sounds a perfect fourth lower. The G clarinet's difference is also a perfect fourth, so the G clarinettist reads the music as written."),
    see:["teori:transpoz", "ders:sed-2"] },
  { id:"ahenk", cat:"calgi", term:sz("Âhenk", "Âhenk"), match:{ tr:["âhenk"], en:["âhenk"] },
    def:sz("TDV İslâm Ansiklopedisi'ne göre müzikte düzen, akort: çalgıların, özellikle neyin, belli sabit bir perdeye göre düzenlenmiş hâli.",
      "According to the TDV Encyclopaedia of Islam: order or tuning in music, the state of instruments (above all the ney) set to a fixed pitch."),
    see:["ders:sed-2"] },
  { id:"transpozisyon", cat:"calgi", term:sz("Transpozisyon", "Transposition"), match:{ tr:["transpoz"], en:["transpos"] },
    def:sz("Yazılan nota ile duyulan sesin farklı olması. Sol klarnette yazılı nota duyulanın tam dörtlü üstüdür; piyanoyla çalarken duyulanı bulmak için yazılıdan tam dörtlü inilir.",
      "The written note differing from the sound. On the G clarinet the written note is a perfect fourth above the sound; with a piano, go down a fourth from the written note to find the sounding one."),
    see:["teori:transpoz", "ders:teori-transpoz"] },
  { id:"desifre", cat:"calgi", term:sz("Deşifre", "Sight-reading"), match:{ tr:["deşifre"], en:["sight-reading", "sight-read"] },
    def:sz("Daha önce görmediğin bir notayı ilk seferde çalmak.", "Playing music you have never seen, first time."),
    see:["ders:desifre-1", "ders:desifre-2"] },
  { id:"dikte", cat:"calgi", term:sz("Dikte", "Dictation"),
    def:sz("Kulakla notayı birleştirir: kısa bir ritim ya da ezgi çalınır, duyulan yazılır.", "It joins ear and notation: a short rhythm or melody is played and you write down what you hear."),
    see:["ders:dikte-1", "ders:dikte-2"] },
  { id:"tempo", cat:"calgi", term:sz("Tempo", "Tempo"),
    def:sz("Dakikadaki vuruş sayısı. Vuruş, müzikteki düzenli nabızdır.", "The number of beats per minute. The beat is music's steady pulse."),
    see:["ders:ritim-temel", "ders:okuma-5"] },
  { id:"nuans", cat:"calgi", term:sz("Nüans", "Dynamics"), match:{ tr:["nüans"], en:["dynamics"] },
    def:sz("Sesin gücünü söyleyen işaretler: p (piyano) hafif, mf yarı güçlü, f (forte) güçlü.", "Signs for loudness: p (piano) soft, mf medium loud, f (forte) loud."),
    see:["ders:okuma-5", "ders:dinamik"] },
  { id:"crescendo", cat:"calgi", term:sz("Crescendo, decrescendo", "Crescendo, decrescendo"), match:{ tr:["crescendo", "decrescendo"], en:["crescendo", "decrescendo"] },
    def:sz("Crescendo sesi giderek güçlendirmek, decrescendo giderek hafifletmektir. Messa di voce ikisini birleştirir: hafif-güçlü-hafif.",
      "Crescendo means growing gradually louder, decrescendo gradually softer. Messa di voce joins them: soft-loud-soft."),
    see:["ders:dinamik", "ders:dinamik-2"] },
  { id:"arpej", cat:"calgi", term:sz("Arpej", "Arpeggio"), match:{ tr:["arpej"], en:["arpeggio"] },
    def:sz("Bir akorun seslerini sırayla çalmak: kök, üçlü, beşli, oktav.", "Playing the notes of a chord one after another: root, third, fifth, octave."),
    see:["ders:hiz-arpej"] },
  { id:"kromatik", cat:"calgi", term:sz("Kromatik dizi", "Chromatic scale"), match:{ tr:["kromatik"], en:["chromatic"] },
    def:sz("Her notadan bir yarım ses yukarı çıkan dizi: aradaki bütün arızalı notalar dahil, yarım ses yarım ses çıkar ve iner.",
      "A scale that moves up a semitone from every note: semitone by semitone up and down, every altered note included."),
    see:["ders:ariza-2", "ders:hiz-kromatik"] },
  { id:"tavir", cat:"calgi", term:sz("Tavır (üslup)", "Playing style"), match:{ tr:["tavır", "tavr", "üslup"], en:["playing style"] },
    def:sz("Türk klarnet icrasında farklı tavırlar vardır: klasik Türk musikisi, Trakya ve Roman oyun havaları, modern ve karma icra. Bunlar doğru ya da yanlış değil, farklı üsluplardır.",
      "Turkish clarinet playing has several styles: classical Turkish music, Thracian and Romani dance music, modern or mixed playing. None is right or wrong; they are styles."),
    see:["ders:sus-uslup", "ders:trakya-uslup"] },

  // ---- Nota yazısı ----
  { id:"dizek", cat:"nota", term:sz("Dizek (porte)", "Staff"), match:{ tr:["dizek", "porte"], en:["staff"] },
    def:sz("Notanın yazıldığı beş çizgi. Çizgiler aşağıdan yukarı Mi, Sol, Si, Re, Fa; aralıklar Fa, La, Do, Mi.",
      "The five lines music is written on. Lines from the bottom: E, G, B, D, F; spaces: F, A, C, E."),
    see:["teori:porte", "ders:nota-okuma"] },
  { id:"sol-anahtari", cat:"nota", term:sz("Sol anahtarı", "Treble clef"), match:{ tr:["sol anahtar"], en:["treble clef"] },
    def:sz("Dizeğin başındaki işaret (𝄞): ikinci çizgiyi sarar ve o çizgiye Sol adını verir; Türk müziği notasında bu nota Rast perdesidir.",
      "The sign (𝄞) at the start of the staff: it curls around the second line and names it G; in Turkish notation that note is the Rast perde."),
    see:["teori:porte", "ders:nota-okuma"] },
  { id:"ek-cizgi", cat:"nota", term:sz("Ek çizgi", "Ledger line"), match:{ tr:["ek çizgi"], en:["ledger line"] },
    def:sz("Dizeğe sığmayan notalar için kısa çizgiler. Do4 birinci ek çizgide, La3 ikincide.", "Short lines for notes that don't fit on the staff. C4 is on the first ledger line below, A3 on the second."),
    see:["teori:porte", "ders:okuma-5"] },
  { id:"dortluk", cat:"nota", term:sz("Dörtlük", "Quarter note"), match:{ tr:["dörtlük"], en:["quarter note", "quarter"] },
    def:sz("Bir vuruş süren nota (♩). İkilik iki, birlik dört vuruş sürer.", "A note lasting one beat (♩). A half note lasts two beats, a whole note four."),
    see:["teori:deger", "ders:ritim-temel"] },
  { id:"ikilik", cat:"nota", term:sz("İkilik", "Half note"), match:{ tr:["ikilik"], en:["half note"] },
    def:sz("İki vuruş süren nota. Noktalı ikilik üç vuruş sürer.", "A note lasting two beats. A dotted half lasts three."),
    see:["teori:deger", "ders:ritim-temel"] },
  { id:"birlik", cat:"nota", term:sz("Birlik", "Whole note"), mark:false,
    def:sz("Dört vuruş süren nota.", "A note lasting four beats."), see:["teori:deger", "ders:ritim-temel"] },
  { id:"sekizlik", cat:"nota", term:sz("Sekizlik", "Eighth note"), match:{ tr:["sekizlik"], en:["eighth note", "eighth"] },
    def:sz("Yarım vuruş süren nota: bir vuruşa iki sekizlik düşer.", "A note lasting half a beat: two eighths fit in one beat."),
    see:["teori:deger", "ders:ritim-temel"] },
  { id:"onaltilik", cat:"nota", term:sz("On altılık", "Sixteenth note"), match:{ tr:["on altılık", "onaltılık"], en:["sixteenth"] },
    def:sz("Bir vuruşa dört tanesi düşen nota.", "A note of which four fit in one beat."), see:["teori:deger", "ders:hiz-16lik"] },
  { id:"nokta", cat:"nota", term:sz("Noktalı nota", "Dotted note"), match:{ tr:["noktalı"], en:["dotted"] },
    def:sz("Nota başının sağındaki nokta, notanın süresine yarısını ekler: noktalı ikilik üç, noktalı dörtlük bir buçuk vuruş.",
      "A dot to the right of the note head adds half the value: a dotted half lasts three beats, a dotted quarter one and a half."),
    see:["teori:deger", "ders:okuma-2"] },
  { id:"sus", cat:"nota", term:sz("Sus", "Rest"), match:{ tr:["sus"], en:["rest"] }, skip:/sust|the rest|rest of|restart|rest (on|in|the)|resting/i,
    def:sz("Her nota değerinin bir de susu vardır: o süre kadar çalmadan beklenir.", "Every note value has a matching rest: you wait that long without playing."),
    see:["teori:deger", "ders:okuma-2"] },
  { id:"uzatma-bagi", cat:"nota", term:sz("Uzatma bağı", "Tie"), match:{ tr:["uzatma bağ"], en:["tie"] },
    def:sz("Aynı yükseklikteki iki notayı birleştiren yay: ikinci nota yeniden başlatılmaz, süreler toplanır.",
      "A curve joining two notes of the same pitch: the second is not restarted, the values add up."),
    see:["ders:okuma-2"] },
  { id:"ifade-bagi", cat:"nota", term:sz("İfade bağı", "Slur"), match:{ tr:["ifade bağ"], en:["slur"] },
    def:sz("Farklı yükseklikteki notaları birleştiren yay: notalar kesintisiz, bağlı çalınır; dil yalnız ilk notada kullanılır.",
      "A curve joining notes of different pitch: they are played smoothly, slurred; only the first note is tongued."),
    see:["ders:okuma-2", "ders:artikulasyon-2"] },
  { id:"olcu", cat:"nota", term:sz("Ölçü işareti", "Time signature"), match:{ tr:["ölçü işaret"], en:["time signature"] },
    def:sz("Üstteki sayı ölçüde kaç birim olduğunu, alttaki birimin cinsini söyler: 4/4 dört dörtlük, 9/8 dokuz sekizlik. Türk müziğinde ölçü çoğunlukla eserin usulüdür.",
      "The top number is how many units fill a bar, the bottom one which unit: 4/4 is four quarters, 9/8 nine eighths. In Turkish music it is usually the piece's usul."),
    see:["teori:deger", "teori:usul"] },
  { id:"olcu-cizgisi", cat:"nota", term:sz("Ölçü çizgisi", "Bar line"), match:{ tr:["ölçü çizgi"], en:["bar line", "barline"] },
    def:sz("Ölçüleri ayıran çizgi. Bir ölçüde yazılan arıza o ölçünün sonuna kadar geçerlidir; ölçü çizgisi onu siler.",
      "The line between bars. An accidental holds until the end of its bar; the bar line cancels it."),
    see:["ders:okuma-3"] },
  { id:"diyez", cat:"nota", term:sz("Diyez (♯)", "Sharp (♯)"), match:{ tr:["diyez"], en:["sharp sign"] },
    def:sz("Notayı tizleştiren işaret. Türk müziği notasında koma sayısını da söyler: düz diyez bakiye diyezidir, +4 koma.",
      "The sign that raises a note. In Turkish notation it also tells the number of commas: the plain sharp is the bakiye sharp, +4 commas."),
    see:["teori:koma", "ders:okuma-3"] },
  { id:"bemol", cat:"nota", term:sz("Bemol (♭)", "Flat (♭)"), match:{ tr:["bemol"], en:["flat sign"] },
    def:sz("Notayı pesleştiren işaret. Düz bemol küçük mücenneb bemolüdür (−5 koma); çizgili (slaşlı) bemol bakiye bemolüdür (−4 koma).",
      "The sign that lowers a note. The plain flat is the küçük mücenneb flat (−5 commas); the slashed flat is the bakiye flat (−4 commas)."),
    see:["teori:koma", "ders:okuma-3"] },
  { id:"naturel", cat:"nota", term:sz("Natürel", "Natural"), match:{ tr:["natürel"], en:["natural sign"] },
    def:sz("Notayı doğal hâline döndüren işaret.", "The sign that returns a note to its natural form."), see:["ders:okuma-3"] },
  { id:"ariza", cat:"nota", term:sz("Arıza", "Accidental"), match:{ tr:["arıza"], en:["accidental"] },
    def:sz("Diyez, bemol ya da natürel. Türk müziğinde (AEU yazımı) arızalar koma sayısıyla ayrılır: koma (1), bakiye (4), küçük mücenneb (5), büyük mücenneb (8).",
      "A sharp, flat or natural. In Turkish (AEU) notation accidentals are told apart by commas: koma (1), bakiye (4), küçük mücenneb (5), büyük mücenneb (8)."),
    see:["teori:koma", "ders:okuma-3"] },
  { id:"donanim", cat:"nota", term:sz("Donanım", "Key signature"), match:{ tr:["donanım"], en:["key signature"] },
    def:sz("Anahtarın hemen yanına yazılan arızalar; eserin her yerinde geçerlidir. Tek başına makamı söylemez: Uşşak ile Bayâtî'nin donanımı aynıdır.",
      "The accidentals written right after the clef; they hold throughout the piece. On their own they don't name the makam: Uşşak and Bayâtî share one."),
    see:["ders:okuma-3", "ders:makam-bulma"] },
  { id:"dolap", cat:"nota", term:sz("Dolap", "Volta (1st/2nd ending)"), match:{ tr:["dolap", "dolab"], en:["1st and 2nd ending", "ending bracket"] },
    def:sz("Tekrarın sonunda “1.” ve “2.” yazan köşeli çizgiler: ilk geçişte birinci dolap, tekrarda birinci atlanıp ikinci dolap çalınır.",
      "The brackets marked “1.” and “2.” at the end of a repeat: the first time play the first ending; on the repeat skip it and play the second."),
    see:["ders:okuma-4"] },
  { id:"dc", cat:"nota", term:sz("D.C., D.S., Fine", "D.C., D.S., Fine"), match:{ tr:["D.C.", "D.S."], en:["D.C.", "D.S."] },
    def:sz("D.C. (da capo) baştan, D.S. (dal segno) 𝄋 işaretinden yeniden çalmak demektir; Fine yazan yerde eser biter. Dönüşte tekrarlar yeniden çalınmaz (yaygın kural).",
      "D.C. (da capo) means play again from the start, D.S. (dal segno) from the 𝄋 sign; the piece ends at Fine. On the way back repeats are not played again (the usual rule)."),
    see:["ders:okuma-4"] },

  // ---- Koma ve aralıklar ----
  { id:"koma", cat:"aralik", term:sz("Koma", "Comma"), match:{ tr:["koma"], en:["comma"] },
    def:sz("AEU sisteminde oktavın 53'te biri; bir tam ses 9 komadır. Kürdî ile Dik Kürdî arasında 1 koma (yaklaşık 23 sent) vardır.",
      "One 53rd of an octave in the AEU system; a whole tone is 9 commas. Kürdî and Dik Kürdî are 1 comma (about 23 cents) apart."),
    see:["teori:koma", "ders:teori-koma", "ders:kulak-1"], skip:/virgül|comma \(’\)|the comma \(/i },
  { id:"aeu", cat:"aralik", term:sz("AEU (Arel-Ezgi-Uzdilek)", "AEU (Arel-Ezgi-Uzdilek)"), match:{ tr:["AEU", "Arel-Ezgi-Uzdilek"], en:["AEU", "Arel-Ezgi-Uzdilek"] },
    def:sz("Türk müziğinin yazım ve ses sistemi: bir oktav 53 komaya, bir tam ses 9 komaya bölünür. Batı'daki yarım sesin yerinde iki ayrı aralık vardır: bakiye (4) ve küçük mücenneb (5).",
      "The notation and pitch system of Turkish music: the octave is split into 53 commas, a whole tone into 9. In place of the Western semitone there are two intervals: bakiye (4) and küçük mücenneb (5)."),
    see:["teori:koma", "ders:teori-koma"] },
  { id:"aralik", cat:"aralik", term:sz("Aralık", "Interval"), mark:false,
    def:sz("İki perde arasındaki uzaklık. Makam müziğinde koma cinsinden ölçülür: bakiye (4), küçük mücenneb (5), büyük mücenneb (8), tanini (9), artık ikili (12–13).",
      "The distance between two perdes. In makam music it is measured in commas: bakiye (4), küçük mücenneb (5), büyük mücenneb (8), tanini (9), artık ikili (12–13)."),
    see:["teori:koma", "ders:aralik"] },
  { id:"tanini", cat:"aralik", term:sz("Tanini", "Tanini"),
    def:sz("Tam ses: 9 koma. Çeşni harflerinde T.", "A whole tone: 9 commas. Letter T in çeşni formulas."), see:["teori:koma", "teori:cesni", "ders:aralik"] },
  { id:"bakiye", cat:"aralik", term:sz("Bakiye", "Bakiye"),
    def:sz("4 komalık aralık; çeşni harflerinde B. Düz diyez (+4) ve çizgili bemol (−4) bakiye işaretleridir.",
      "The 4-comma interval; letter B in çeşni formulas. The plain sharp (+4) and the slashed flat (−4) are bakiye signs."),
    see:["teori:koma", "ders:aralik"] },
  { id:"kucuk-mucenneb", cat:"aralik", term:sz("Küçük mücenneb", "Küçük mücenneb"),
    def:sz("5 komalık aralık; çeşni harflerinde S. Düz bemol küçük mücenneb bemolüdür (−5).", "The 5-comma interval; letter S in çeşni formulas. The plain flat is the küçük mücenneb flat (−5)."),
    see:["teori:koma", "ders:aralik"] },
  { id:"buyuk-mucenneb", cat:"aralik", term:sz("Büyük mücenneb", "Büyük mücenneb"),
    def:sz("8 komalık aralık; çeşni harflerinde K. Uşşak'ta Dügâh'tan Segâh'a 8 koma yazılır, inici seyirde 6–7 komaya iner (eksik büyük mücenneb).",
      "The 8-comma interval; letter K in çeşni formulas. In Uşşak Dügâh to Segâh is written as 8 commas but narrows to 6–7 in descending lines (eksik büyük mücenneb)."),
    see:["teori:koma", "teori:cesni", "ders:aralik"] },
  { id:"artik-ikili", cat:"aralik", term:sz("Artık ikili", "Augmented second"), match:{ tr:["artık ikili"], en:["augmented second"] },
    def:sz("12–13 komalık geniş aralık; çeşni harflerinde A. Hicaz çeşnisinin tanınan rengi: Dik Kürdî ile Nim Hicaz arası 12 koma.",
      "The wide 12–13 comma step; letter A in çeşni formulas. The telltale colour of the Hicaz çeşni: 12 commas from Dik Kürdî to Nim Hicaz."),
    see:["teori:cesni", "ders:hicaz"] },
  { id:"oktav", cat:"aralik", term:sz("Oktav", "Octave"), match:{ tr:["oktav"], en:["octave"] },
    def:sz("AEU sisteminde 53 koma. Oktav değişince perde yeni bir ad alır: Rast'ın tizi Gerdâniye. Nota adının yanındaki sayı oktavdır: Sol4 açık Sol, Sol5 bir oktav tizi.",
      "53 commas in the AEU system. A perde takes a new name in the next octave: Rast's upper octave is Gerdâniye. The number after a note name is the octave: G4 is open G, G5 an octave higher."),
    see:["teori:perde", "teori:porte"] },
  { id:"tam-dortlu", cat:"aralik", term:sz("Tam dörtlü", "Perfect fourth"), match:{ tr:["tam dörtlü"], en:["perfect fourth"] },
    def:sz("22 koma (5 yarım ses). Sol klarnette yazılı ile duyulan arasındaki fark da tam dörtlüdür.", "22 commas (5 semitones). It is also the gap between written and sounding notes on the G clarinet."),
    see:["teori:cesni", "teori:transpoz"] },
  { id:"tam-besli", cat:"aralik", term:sz("Tam beşli", "Perfect fifth"), match:{ tr:["tam beşli"], en:["perfect fifth"] },
    def:sz("31 koma. Beşli çeşniler çoğunlukla bir tam beşliyi kaplar.", "31 commas. Pentachords usually span a perfect fifth."), see:["teori:cesni"] },
  { id:"perde", cat:"aralik", term:sz("Perde", "Perde"), match:{ tr:["perde"], en:["perde"] },
    def:sz("Türk müziğinde her sesin kendi adı vardır; bu seslere perde denir. Ana perdeler Batı'daki doğal notalara karşılık gelir: Rast (yazılı Sol4), Dügâh (La4), Segâh, Çargâh (Do5), Nevâ (Re5), Hüseynî (Mi5), Evç, Gerdâniye (Sol5).",
      "In Turkish music every pitch has its own name; these are perdes. The main perdes match the Western natural notes: Rast (written G4), Dügâh (A4), Segâh, Çargâh (C5), Nevâ (D5), Hüseynî (E5), Evç, Gerdâniye (G5)."),
    see:["teori:perde", "ders:teori-perde"] },
  { id:"ara-perde", cat:"aralik", term:sz("Ara perde", "In-between perde"), match:{ tr:["ara perde"], en:["in-between perde"] },
    def:sz("Ana perdelerin arasındaki perdeler. Dügâh ile Nevâ arasında Kürdî, Dik Kürdî, Segâh, Bûselik, Dik Bûselik, Çargâh, Nim Hicaz, Hicaz ve Dik Hicaz sıralanır; hangisinin çalınacağını makam belirler.",
      "The perdes between the main ones. From Dügâh to Nevâ come Kürdî, Dik Kürdî, Segâh, Bûselik, Dik Bûselik, Çargâh, Nim Hicaz, Hicaz and Dik Hicaz; the makam decides which one is played."),
    see:["teori:perde"] },
  { id:"kaba-tiz", cat:"aralik", term:sz("Kaba, Tiz (perde adında)", "Kaba, Tiz (in perde names)"), mark:false,
    def:sz("“Kaba” ön eki bir oktav pes, “Tiz” bir oktav tiz demektir: Kaba Dügâh, Tiz Segâh.", "The prefix “Kaba” means an octave lower, “Tiz” an octave higher: Kaba Dügâh, Tiz Segâh."),
    see:["teori:perde"] },
  { id:"nim-dik", cat:"aralik", term:sz("Nim, Dik (perde adında)", "Nim, Dik (in perde names)"), mark:false,
    def:sz("“Nim” yarım, “Dik” biraz tiz demektir: Nim Hicaz, Dik Kürdî.", "“Nim” means half, “Dik” a little higher: Nim Hicaz, Dik Kürdî."), see:["teori:perde"] },

  // ---- Çeşniler (teori.js thCesni notlarından) ----
  { id:"cesni", cat:"cesni", term:sz("Çeşni", "Çeşni"), match:{ tr:["çeşni"], en:["çeşni"] },
    def:sz("Makam dizilerinin yapı taşı: dört perdelik dörtlüler ve beş perdelik beşliler. Aralıklarının sırası her birine kendine özgü bir renk, bir çeşni verir.",
      "The building block of makam scales: four-note tetrachords and five-note pentachords. The order of their steps gives each its own colour, its çeşni."),
    see:["teori:cesni", "ders:teori-cesni", "ders:gecki-1"] },
  { id:"dortlu", cat:"cesni", term:sz("Dörtlü", "Tetrachord"), match:{ tr:["dörtlü"], en:["tetrachord"] },
    def:sz("Dört perdelik çeşni; çoğunlukla bir tam dörtlüyü (22 koma) kaplar. Bir makam dizisi çoğunlukla bir beşli ile bir dörtlünün birleşmesidir.",
      "A four-note çeşni, usually spanning a perfect fourth (22 commas). A makam scale is usually a pentachord joined to a tetrachord."),
    see:["teori:cesni", "ders:teori-cesni"], skip:/dörtlü (atlama|ve beşli atla)|“düğün/i },
  { id:"besli", cat:"cesni", term:sz("Beşli", "Pentachord"), match:{ tr:["beşli"], en:["pentachord"] },
    def:sz("Beş perdelik çeşni; çoğunlukla bir tam beşliyi (31 koma) kaplar ve dörtlüye bir tam ses eklenmiş hâlidir.",
      "A five-note çeşni, usually spanning a perfect fifth (31 commas): a tetrachord with a whole tone added."),
    see:["teori:cesni", "ders:teori-cesni"], skip:/oktav \+ beşli|üçlü, beşli|beşli atla/i },
  { id:"rast-besli", cat:"cesni", term:sz("Rast beşlisi", "Rast pentachord"), match:{ tr:["Rast beşli", "Rast dörtlü", "Rast çeşni"], en:["Rast pentachord", "Rast tetrachord"] },
    def:sz("Rast'ta T K S T: üçüncü sesi Segâh'tır. Çargâh beşlisinde aynı yerde Bûselik vardır; fark 1 komadır.",
      "On Rast, T K S T: its third note is Segâh. The Çargâh pentachord has Bûselik in that place; the difference is one comma."),
    see:["teori:cesni", "ders:rast-giris", "makam:rast"] },
  { id:"ussak-dortlu", cat:"cesni", term:sz("Uşşak dörtlüsü", "Uşşak tetrachord"), match:{ tr:["Uşşak dörtlü", "Uşşak çeşni"], en:["Uşşak tetrachord"] },
    def:sz("Dügâh'ta K S T; ayırt edici perdesi Segâh'tır. İnici seyirde Segâh 1–2 koma daha pes basılır.",
      "On Dügâh, K S T; its telling perde is Segâh. In descending lines Segâh is played 1–2 commas lower."),
    see:["teori:cesni", "makam:ussak"] },
  { id:"huseyni-besli", cat:"cesni", term:sz("Hüseynî beşlisi", "Hüseynî pentachord"), match:{ tr:["Hüseynî beşli"], en:["Hüseynî pentachord"] },
    def:sz("Dügâh'taki Uşşak dörtlüsünün üstüne bir tanini daha gelir ve dizi Hüseynî perdesine uzanır; Hüseynî makamının temelidir.",
      "A tanini on top of the Uşşak tetrachord on Dügâh, reaching the Hüseynî perde; the base of makam Hüseynî."),
    see:["teori:cesni", "makam:huseyni"] },
  { id:"buselik-dortlu", cat:"cesni", term:sz("Bûselik dörtlüsü", "Bûselik tetrachord"), match:{ tr:["Bûselik dörtlü", "Bûselik beşli", "Bûselik çeşni"], en:["Bûselik tetrachord", "Bûselik pentachord"] },
    def:sz("Dügâh'ta T B T: ikinci sesi Bûselik'tir. Bûselik dizileri Batı'nın minörüne karşılık gelir.",
      "On Dügâh, T B T: its second note is Bûselik. Bûselik scales correspond to the Western minor."),
    see:["teori:cesni", "makam:buselik"] },
  { id:"kurdi-dortlu", cat:"cesni", term:sz("Kürdî dörtlüsü", "Kürdî tetrachord"), match:{ tr:["Kürdî dörtlü", "Kürdî çeşni"], en:["Kürdî tetrachord"] },
    def:sz("Dügâh'ta B T T: bakiye en alttadır, Dügâh'ın 4 koma üstünde Kürdî perdesi gelir.", "On Dügâh, B T T: the bakiye is at the bottom, with the Kürdî perde 4 commas above Dügâh."),
    see:["teori:cesni", "makam:kurdi"] },
  { id:"hicaz-dortlu", cat:"cesni", term:sz("Hicaz dörtlüsü", "Hicaz tetrachord"), match:{ tr:["Hicaz dörtlü", "Hicaz beşli", "Hicaz çeşni"], en:["Hicaz tetrachord", "Hicaz pentachord"] },
    def:sz("Dügâh'ta S A S: karakteristiği ortadaki artık ikilidir (Dik Kürdî ile Nim Hicaz arası 12 koma). Adına rağmen Hicaz perdesi değil Nim Hicaz kullanılır.",
      "On Dügâh, S A S: its hallmark is the augmented second in the middle (12 commas from Dik Kürdî to Nim Hicaz). Despite the name it uses Nim Hicaz, not the Hicaz perde."),
    see:["teori:cesni", "makam:hicaz"] },
  { id:"cargah-dortlu", cat:"cesni", term:sz("Çargâh dörtlüsü", "Çargâh tetrachord"), match:{ tr:["Çargâh dörtlü", "Çargâh beşli", "Çargâh çeşni"], en:["Çargâh tetrachord", "Çargâh pentachord"] },
    def:sz("Yalnız tanini ve bakiyeden oluşur (T T B), bakiye en üsttedir. Çargâh dizileri Batı'nın majörüne karşılık gelir.",
      "Made only of tanini and bakiye (T T B), with the bakiye on top. Çargâh scales correspond to the Western major."),
    see:["teori:cesni", "makam:mahur"] },
  { id:"segah-besli", cat:"cesni", term:sz("Segâh beşlisi", "Segâh pentachord"), match:{ tr:["Segâh beşli", "Segâh çeşni"], en:["Segâh pentachord"] },
    def:sz("Segâh perdesi üzerine kurulur ve üst perdeleri değişkendir. Segâh makamı tam kararını bu beşliyle ya da eksik biçimiyle verir.",
      "Built on the Segâh perde, with changeable upper notes. Makam Segâh ends with this pentachord or its incomplete form."),
    see:["teori:cesni", "makam:segah"] },
  { id:"huzzam-besli", cat:"cesni", term:sz("Hüzzam beşlisi", "Hüzzam pentachord"), match:{ tr:["Hüzzam beşli", "Hüzzam çeşni"], en:["Hüzzam pentachord"] },
    def:sz("Segâh beşlisinden farkı dördüncü sesidir: Dik Hisar yerine Hisar gelir, son aralık artık ikili olur.",
      "It differs from the Segâh pentachord in its fourth note: Hisar instead of Dik Hisar, which makes the last step an augmented second."),
    see:["teori:cesni", "makam:huzzam"] },
  { id:"saba-dortlu", cat:"cesni", term:sz("Saba dörtlüsü", "Saba tetrachord"), match:{ tr:["Saba dörtlü", "Saba çeşni"], en:["Saba tetrachord"] },
    def:sz("Öteki dörtlüler 22 koma iken bu 18 komadır: Dügâh, Segâh, Çargâh ve Hicaz'dan oluşan eksik bir dörtlü.",
      "The other tetrachords span 22 commas, this one 18: an incomplete tetrachord of Dügâh, Segâh, Çargâh and Hicaz."),
    see:["teori:cesni", "makam:saba"] },
  { id:"nikriz-besli", cat:"cesni", term:sz("Nikriz beşlisi", "Nikriz pentachord"), match:{ tr:["Nikriz beşli", "Nikriz çeşni"], en:["Nikriz pentachord"] },
    def:sz("Rast'ta: ilk dört sesi 26 komalık bir artık dörtlüdür. Hicaz ailesi makamlarında Rast perdesine düşülünce Nikriz çeşnili asma karar yapılır.",
      "On Rast: its first four notes span an augmented fourth of 26 commas. In the Hicaz family, dropping to the Rast perde brings an asma karar with Nikriz."),
    see:["teori:cesni", "makam:nikriz"] },

  // ---- Makam terimleri ----
  { id:"makam", cat:"makam", term:sz("Makam", "Makam"), match:{ tr:["makam"], en:["makam"] }, mark:false,
    def:sz("Yalnız bir dizi değil, ezginin o dizide nasıl gezindiğidir. Bir makamı dört kavram tanıtır: durak, güçlü, yeden ve seyir.",
      "Not just a scale but how the melody moves within it. Four ideas introduce a makam: durak, güçlü, yeden and seyir."),
    see:["teori:makam", "ders:teori-makam"] },
  { id:"durak", cat:"makam", term:sz("Durak", "Durak (tonic)"), match:{ tr:["durak", "durağ"], en:["durak", "tonic"] },
    def:sz("Ezginin bittiği, karar verdiği perde.", "The perde where the melody ends, where it makes its final cadence."), see:["teori:makam", "ders:teori-makam"] },
  { id:"guclu", cat:"makam", term:sz("Güçlü", "Güçlü (dominant)"), match:{ tr:["güçlü"], en:["güçlü", "dominant"] },
    def:sz("Duraktan sonra en önemli perde. Ezgi çevresinde dolaşır, yarım kararlar burada verilir; çoğunlukla iki çeşninin birleştiği yerdir.",
      "The most important perde after the durak. The melody circles around it and makes half cadences there; it is usually where the two çeşnis meet."),
    see:["teori:makam", "ders:teori-makam"], skip:/yarı güçlü|güçlü\s*\(f|\(forte\)\s*güçlü|hafif(te)? ve güçlü|güçlü(de)? (ses|çal|nefes|üfle|hava)|güçlüde perde/i },
  { id:"yeden", cat:"makam", term:sz("Yeden", "Yeden (leading note)"), match:{ tr:["yeden"], en:["yeden", "leading note"] },
    def:sz("Durağın hemen altındaki perde; kararı hazırlar.", "The perde just below the durak; it prepares the cadence."), see:["teori:makam", "ders:teori-makam"] },
  { id:"seyir", cat:"makam", term:sz("Seyir", "Seyir"), match:{ tr:["seyir", "seyr"], en:["seyir"] }, skip:/seyrek/i,
    def:sz("Ezginin yolu. Dizileri aynı olan makamlar (Uşşak ve Bayâtî gibi) seyirleriyle ayrılır.", "The path of the melody. Makams with the same scale (like Uşşak and Bayâtî) differ by their seyir."),
    see:["teori:makam", "ders:taksim-giris"] },
  { id:"cikici", cat:"makam", term:sz("Çıkıcı seyir", "Ascending seyir"), match:{ tr:["çıkıcı"], en:["ascending seyir"] },
    def:sz("Durak çevresinden başlayıp güçlüye çıkan seyir.", "A seyir that starts around the durak and rises to the güçlü."), see:["teori:makam"] },
  { id:"inici", cat:"makam", term:sz("İnici seyir", "Descending seyir"), match:{ tr:["inici"], en:["descending seyir"] }, skip:/inici-çıkıcı/i,
    def:sz("Tizden başlayıp inen seyir.", "A seyir that starts high and comes down."), see:["teori:makam", "ders:taksim-2"] },
  { id:"inici-cikici", cat:"makam", term:sz("İnici-çıkıcı seyir", "Descending-ascending seyir"), match:{ tr:["inici-çıkıcı"], en:["descending-ascending"] },
    def:sz("Güçlü çevresinden başlayan seyir.", "A seyir that starts around the güçlü."), see:["teori:makam", "ders:taksim-2"] },
  { id:"tam-karar", cat:"makam", term:sz("Karar (tam karar)", "Final cadence"), match:{ tr:["tam karar", "karar"], en:["final cadence"] },
    def:sz("Ezginin durakta bitmesi. Asma karar ve yarım karar tam karardan zayıf, geçici duruşlardır.",
      "The melody ending on the durak. Asma karar and half cadences are weaker, passing stops."),
    see:["teori:makam", "ders:taksim-karar"] },
  { id:"yarim-karar", cat:"makam", term:sz("Yarım karar", "Half cadence"), match:{ tr:["yarım karar"], en:["half cadence"] },
    def:sz("Ezginin güçlüde verdiği geçici duruş: Rast'ta Nevâ'da yarım karar, Rast'ta tam karar verilir.",
      "A passing stop the melody makes on the güçlü: in Rast, a half cadence on Nevâ and the final on Rast."),
    see:["teori:makam", "ders:taksim-cesni"] },
  { id:"asma-karar", cat:"makam", term:sz("Asma karar", "Asma karar"), match:{ tr:["asma karar"], en:["asma karar"] },
    def:sz("Ezginin bir perdede kısa süre kalması; bitiş hissi tam karardan zayıftır.", "The melody resting briefly on a perde; it feels less final than the final cadence."),
    see:["teori:cesni", "ders:taksim-cesni"] },
  { id:"gecki", cat:"makam", term:sz("Geçki", "Geçki (modulation)"), match:{ tr:["geçki"], en:["geçki", "modulation"] },
    def:sz("Eserin ya da taksimin ortasında başka makama (ya da başka çeşniye) geçmek.", "Moving to another makam (or çeşni) in the middle of a piece or taksim."),
    see:["ders:gecki-1", "ders:gecki-2", "ders:taksim-gecki"] },
  { id:"sed", cat:"makam", term:sz("Şed (göçürme)", "Şed (transposing a makam)"), match:{ tr:["şed", "göçür"], en:["şed"] },
    def:sz("Bir makamın bütün perdelerini aynı aralıkla kaydırıp makamı başka bir perdeden çalmak. 53 komalık sistemde kaydırma koma ile ölçülür.",
      "Shifting every perde of a makam by the same interval to play it from another perde. In the 53-comma system the shift is counted in commas."),
    see:["ders:sed-1", "ders:sed-2", "ders:sed-3"] },
  { id:"seyir-ezgisi", cat:"makam", term:sz("Seyir ezgisi", "Seyir melody"), match:{ tr:["seyir ezgi"], en:["seyir melody"] },
    def:sz("Makamın nereden başlayıp nerelerde durduğunu ve nasıl karar verdiğini gösteren kısa bir örnek ezgi.",
      "A short example melody showing where a makam starts, where it pauses and how it cadences."),
    see:["teori:makam"] },
  { id:"taksim", cat:"makam", term:sz("Taksim", "Taksim"),
    def:sz("Bir usule bağlı kalmadan, icracının o anki ilhamıyla bir ya da birkaç makamda yaptığı doğaçlama seyir; giriş, ara ve geçiş taksimi gibi türleri vardır.",
      "An improvised seyir in one or more makams, free of any usul, from the player's inspiration of the moment; there are opening, interlude and transition taksims."),
    see:["teori:form", "ders:taksim-cumle", "ders:taksim-giris"] },

  // ---- Usuller ----
  { id:"usul", cat:"usul", term:sz("Usul", "Usul"), match:{ tr:["usul"], en:["usul"] },
    def:sz("Türk müziğinin ritim kalıbı: bir ölçünün içinde kalın “düm” ve ince “tek” vuruşlarının sırası. Ezgi ne olursa olsun altında bu kalıp döner.",
      "The rhythmic cycle of Turkish music: the order of deep “düm” and light “tek” strokes within a bar. Whatever the melody does, this pattern turns beneath it."),
    see:["teori:usul", "ders:usul-giris", "ders:usul"], skip:/usulsüz/i },
  { id:"dum-tek", cat:"usul", term:sz("Düm, tek", "Düm, tek"), match:{ tr:["düm"], en:["düm"] }, skip:/dümdüz/i,
    def:sz("Usulün iki vuruşu: düm kalın ve vurgulu, tek ince.", "The two strokes of an usul: düm deep and accented, tek light."), see:["teori:usul", "ders:usul"] },
  { id:"buyuk-usul", cat:"usul", term:sz("Küçük ve büyük usul", "Small and large usuls"), match:{ tr:["büyük usul", "küçük usul"], en:["large usul", "small usul"] },
    def:sz("Küçük usuller 2–15 zamanlıdır; büyük usuller küçüklerin birleşmesiyle kurulur ve ağır eserlerde kullanılır.",
      "Small usuls have 2–15 beats; large usuls are built by joining small ones and are used in slow pieces."),
    see:["teori:usul"] },
  { id:"mertebe", cat:"usul", term:sz("Mertebe", "Mertebe"), match:{ tr:["mertebe"], en:["mertebe"] },
    def:sz("Usulün ölçü işaretindeki alt rakam: her zamanın hangi birimle sayıldığı. 3/8, 3/4, 3/2 aynı semâîdir; alt rakam küçüldükçe usul ağırlaşır.",
      "The bottom number of an usul's time signature: the unit each beat is counted in. 3/8, 3/4 and 3/2 are the same semâî; the smaller the bottom number, the slower the usul."),
    see:["teori:mertebe", "ders:usul-3"] },
  { id:"velvele", cat:"usul", term:sz("Velvele", "Velvele"), match:{ tr:["velvele"], en:["velvele"] },
    def:sz("Usulün bazı vuruşlarını küçük vuruş parçalarına bölerek süslü vurmak; örneğin bir zamanı “düm, düm” diye ikiye bölmek. Peşrevlerde kudümler usulün velvelesini vurur.",
      "Striking an usul ornamented by splitting some strokes into smaller ones, e.g. splitting one beat in two as “düm, düm”. In peşrevs the kudüms strike the usul's velvele."),
    see:["teori:mertebe"] },
  { id:"aksak", cat:"usul", term:sz("Aksak (9/8)", "Aksak (9/8)"), match:{ tr:["aksak"], en:["aksak"] }, skip:/aksak semâî|türk aksağ|ağır aksak/i,
    def:sz("Dokuz zamanlı usul, 2+2+2+3 diye sayılır. Aksak usullerde vuruşlar eşit aralıklı değildir; uzun gruplar ezgiye kendine özgü topallamasını verir.",
      "A nine-beat usul counted 2+2+2+3. In aksak (limping) usuls the beats are unequal; the long groups give the melody its limp."),
    see:["teori:usul", "ders:usul", "ders:turku-aksak"] },
  { id:"sofyan", cat:"usul", term:sz("Sofyan (4/4)", "Sofyan (4/4)"), match:{ tr:["sofyan"], en:["sofyan"] }, skip:/n[îi]m[ -]sofyan|yarım sofyan/i,
    def:sz("Dört zamanlıdır ama üç darbı vardır: düm iki zaman sürer, ardından iki tek (Düm · Tek Tek).", "Four beats but three strokes: düm lasts two beats, then two teks (Düm · Tek Tek)."),
    see:["ders:usul-giris", "ders:turku-sofyan"] },
  { id:"nim-sofyan", cat:"usul", term:sz("Nîm Sofyan (2/4)", "Nîm Sofyan (2/4)"), match:{ tr:["Nîm Sofyan", "Nîm-sofyan", "nîm-sofyan", "yarım sofyan"], en:["Nîm Sofyan", "Nîm-sofyan"] },
    def:sz("Dört zamanlı Sofyan'ın yarısı olduğu için “yarım sofyan” denmiştir; sirto, longa, marş ve bazı türkülerde.",
      "Called “half sofyan” because it is half of four-beat Sofyan; used in sirto, longa, marches and some türküs."),
    see:["ders:usul-3", "ders:longa-1"] },
  { id:"semai", cat:"usul", term:sz("Semâî (3/4)", "Semâî (3/4)"), match:{ tr:["Semâî"], en:["Semâî"] }, skip:/(saz|yürük|aksak|sengin|ağır) semâî/i,
    def:sz("Üç zamanlıdır: Düm Tek Tek, vals gibi döner.", "Three beats: Düm Tek Tek, turning like a waltz."), see:["ders:usul-giris"] },
  { id:"duyek", cat:"usul", term:sz("Düyek (8/8)", "Düyek (8/8)"), match:{ tr:["düyek"], en:["düyek"] },
    def:sz("Sekiz zamanlı usul (8/8). İlâhilerde en çok kullanılan usullerden biridir.", "An eight-beat usul (8/8). One of the usuls most used in ilâhis."),
    see:["ders:usul", "teori:form"] },
  { id:"turk-aksagi", cat:"usul", term:sz("Türk Aksağı (5/8)", "Türk Aksağı (5/8)"), match:{ tr:["Türk Aksağ"], en:["Türk Aksağı"] },
    def:sz("Beş sekizlik (2+3): iki sekizlik düm, sonra uzun bir tek ve kısa bir tek.", "Five eighths (2+3): a two-eighth düm, then a long tek and a short tek."),
    see:["ders:usul-2", "ders:turku-aksak"] },
  { id:"yuruk-semai", cat:"usul", term:sz("Yürük Semâî (6/8)", "Yürük Semâî (6/8)"), match:{ tr:["Yürük Semâî"], en:["Yürük Semâî"] },
    def:sz("Altı sekizlik, iki üçlük (3+3): düm tek tek, düm tek.", "Six eighths in two threes (3+3): düm tek tek, düm tek."), see:["ders:usul-2"] },
  { id:"sengin-semai", cat:"usul", term:sz("Sengin Semâî (6/4)", "Sengin Semâî (6/4)"), match:{ tr:["Sengin Semâî"], en:["Sengin Semâî"] },
    def:sz("Yürük Semâî'nin vuruşlarını bir mertebe ağır vurur (6/4): düm tek tek, düm tek.", "Yürük Semâî's strokes one level slower (6/4): düm tek tek, düm tek."), see:["ders:usul-3", "teori:mertebe"] },
  { id:"aksak-semai", cat:"usul", term:sz("Aksak Semâî (10/8)", "Aksak Semâî (10/8)"), match:{ tr:["Aksak Semâî"], en:["Aksak Semâî"] },
    def:sz("On zamanlı usul (10/8). Saz semâîsinin ilk üç hanesi bu usuldedir.", "A ten-beat usul (10/8). The first three hanes of a saz semâîsi are in it."),
    see:["ders:sazsemaisi-1", "teori:form"] },
  { id:"agir-aksak", cat:"usul", term:sz("Ağır Aksak (9/4)", "Ağır Aksak (9/4)"), match:{ tr:["Ağır Aksak"], en:["Ağır Aksak"] },
    def:sz("Aksak'ın bir mertebe ağırı: aynı vuruşlar, dokuz dörtlük (9/4). Vuruş dörtlükle sayılır.", "Aksak one level slower: the same strokes in nine quarters (9/4), counted in quarters."),
    see:["ders:usul-3", "ders:zeybek-2", "teori:mertebe"] },
  { id:"curcuna", cat:"usul", term:sz("Curcuna (10/8)", "Curcuna (10/8)"), match:{ tr:["Curcuna"], en:["Curcuna"] },
    def:sz("On sekizlik usul; Aksak'a benzer ama üçüncü vuruşu bir sekizlik uzundur.", "A ten-eighth usul; like Aksak, but its third beat is an eighth longer."), see:["ders:usul-2"] },
  { id:"devri-hindi", cat:"usul", term:sz("Devr-i Hindî (7/8)", "Devr-i Hindî (7/8)"), match:{ tr:["Devr-i Hindî"], en:["Devr-i Hindî"] },
    def:sz("Yedi zamanlıdır (3+2+2): üç zamanlık düm tek tek, sonra iki zamanlık düm ve iki zamanlık tek; bir semâî ile bir sofyanın eklenmesidir.",
      "Seven beats (3+2+2): a three-beat düm tek tek, then a two-beat düm and a two-beat tek; a semâî joined to a sofyan."),
    see:["ders:usul-4"] },
  { id:"musemmen", cat:"usul", term:sz("Müsemmen (8/8)", "Müsemmen (8/8)"), match:{ tr:["Müsemmen"], en:["Müsemmen"] },
    def:sz("Sekiz zamanlıdır ama Düyek gibi değil: 3+2+3 diye sayılır, ilk grup üç zamanlıdır.", "Eight beats, but not like Düyek: counted 3+2+3, with a three-beat first group."), see:["ders:usul-4"] },
  { id:"devri-kebir", cat:"usul", term:sz("Devr-i Kebîr (28/4)", "Devr-i Kebîr (28/4)"), match:{ tr:["Devr-i Kebîr", "devr-i kebîr"], en:["Devr-i Kebîr", "devr-i kebîr"] },
    def:sz("28 zamanlı büyük usul; bir çevrim birkaç ölçüye yazılır. Peşrevlerin en çok bestelendiği usuldür.", "A large 28-beat usul; one cycle is written over several bars. The usul peşrevs are most often composed in."),
    see:["teori:form", "ders:pesrev-1"] },
  { id:"karsilama", cat:"usul", term:sz("Karşılama (9/8)", "Karşılama (9/8)"), match:{ tr:["karşılama"], en:["karşılama"] },
    def:sz("Karşılıklı oynanan bir Trakya oyunu. Ölçü dokuz sekizliktir ve 2+2+2+3 diye sayılır: üç kısa vuruş ve bir uzun vuruş.",
      "A Thracian dance danced face to face. Nine eighths counted 2+2+2+3: three short beats and one long."),
    see:["ders:karsilama"] },
  { id:"roman-havasi", cat:"usul", term:sz("Roman havası (9/8)", "Roman havası (9/8)"), match:{ tr:["Roman havası", "Roman hava"], en:["Roman havası"] },
    def:sz("9/8'dir ama karşılamadan vurgusu farklıdır: son grup (3) “düm-tek” diye ikiye bölünür ve ölçünün sonunda bir sıçrama hissi verir.",
      "Also 9/8, but accented differently from karşılama: the last group (3) splits into “düm-tek”, giving a lift at the end of the bar."),
    see:["ders:roman-havasi", "ders:agir-roman"] },
  { id:"ciftetelli", cat:"usul", term:sz("Çiftetelli (8/8)", "Çiftetelli (8/8)"), match:{ tr:["çiftetelli"], en:["çiftetelli"] },
    def:sz("Sekiz sekizlik; vuruşlar eşit değil, kaydırmalıdır: “düm . tek tek düm düm tek .” Ezgi uzun-kısa (noktalı) adımlarla salınır.",
      "Eight eighths with shifted, unequal beats: “düm . tek tek düm düm tek .” The melody sways in long-short (dotted) steps."),
    see:["ders:ciftetelli"] },
  { id:"kasap", cat:"usul", term:sz("Kasap havası (2/4)", "Kasap havası (2/4)"), match:{ tr:["kasap"], en:["kasap"] },
    def:sz("Her vuruşun bir adım gibi olduğu oyun havası: düm ve tek eşit, canlı ve sürekli.", "A dance tune where every beat is like a step: düm and tek equal, lively and steady."),
    see:["ders:trakya-giris"] },
  { id:"sirto", cat:"usul", term:sz("Sirto (2/4)", "Sirto (2/4)"), match:{ tr:["sirto"], en:["sirto"] },
    def:sz("Rumeli'den ve adalardan gelen 2/4'lük bir oyun havası; kasaptan daha yaylıdır: ölçünün başı kısa-kısa-uzun sekizlik ve on altılıklarla sekerek ilerler.",
      "A 2/4 dance tune from Rumeli and the islands, springier than kasap: the bar opens with short-short-long eighths and sixteenths, skipping along."),
    see:["ders:sirto-kocekce"] },
  { id:"kocekce", cat:"usul", term:sz("Köçekçe", "Köçekçe"),
    def:sz("Köçeklerin dans ettiği oyun havası takımları; çoğu aksak 9/8'dir (2+2+2+3).", "Suites of dance tunes the köçek dancers danced to; most are in aksak 9/8 (2+2+2+3)."),
    see:["ders:sirto-kocekce"] },
  { id:"zeybek", cat:"usul", term:sz("Zeybek (9/4)", "Zeybek (9/4)"), match:{ tr:["zeybek"], en:["zeybek"] },
    def:sz("Ege'nin ağır, ağırbaşlı oyunu. Ölçü dokuz dörtlüktür ve 2+2+2+3 diye sayılır; son uzun vuruşta oyuncu diz vurur ya da döner.",
      "The slow, dignified dance of the Aegean. Nine quarters counted 2+2+2+3; on the last long beat the dancer kneels or turns."),
    see:["ders:zeybek", "ders:zeybek-2"] },
  { id:"rumeli-havasi", cat:"usul", term:sz("Rumeli havası (7/8)", "Rumeli havası (7/8)"), match:{ tr:["Rumeli hava"], en:["Rumeli havası"] },
    def:sz("Rumeli oyun havaları çoğunlukla 7/8'dir, 2+2+3 diye sayılır.", "Rumeli dance tunes are mostly in 7/8, counted 2+2+3."), see:["ders:rumeli", "ders:rumeli-2"] },

  // ---- Formlar (Teori "Formlar" konusundan) ----
  { id:"sarki", cat:"form", term:sz("Şarkı", "Şarkı (song)"), match:{ tr:["şarkı"], en:["şarkı"] },
    def:sz("Divan şiirine dayanan, din dışı sözlü form; küçük usullerle bestelenir. Dörtlüğün 1. mısraı zemin, 2. nakarat, 3. meyan; 4. mısra nakaratın bestesiyle okunur.",
      "A secular vocal form based on Ottoman court poetry, composed in small usuls. In each quatrain line 1 is the zemin, line 2 the nakarat, line 3 the meyan; line 4 is sung to the nakarat's music."),
    see:["teori:form", "ders:formlar", "ders:sarki-eslik"] },
  { id:"turku", cat:"form", term:sz("Türkü", "Türkü (folk song)"), match:{ tr:["türkü"], en:["türkü"] },
    def:sz("Ezgiyle söylenen anonim halk şiiri; çoğu zaman bağlama eşliğinde söylenir. Bölümleri bent ve kavuştaktır.",
      "Anonymous folk poetry sung to a melody, often with bağlama. Its sections are bent and kavuştak."),
    see:["teori:form", "ders:turku-giris"] },
  { id:"pesrev", cat:"form", term:sz("Peşrev", "Peşrev"),
    def:sz("Belli bir usulle bestelenmiş, Türk müziğinin en büyük saz eseri formu. Çoğu dört hanelidir; her haneden sonra mülâzime gelir. Faslın başında çalınır.",
      "The largest instrumental form of Turkish music, composed in a set usul. Most have four hanes, each followed by the mülâzime. It opens the fasıl."),
    see:["teori:form", "ders:pesrev-1"] },
  { id:"saz-semaisi", cat:"form", term:sz("Saz semâîsi", "Saz semâîsi"), match:{ tr:["saz semâî"], en:["saz semâî"] },
    def:sz("Peşrevden sonra en önemli saz eseri formu: dört hane ve mülâzime. İlk üç hane aksak semâî usulündedir, 4. hanede başka bir semâî usulüne geçilir. Faslın sonunda çalınır.",
      "The most important instrumental form after the peşrev: four hanes and a mülâzime. The first three hanes are in aksak semâî; the 4th moves to another semâî usul. It closes the fasıl."),
    see:["teori:form", "ders:sazsemaisi-1", "ders:sazsemaisi-2"] },
  { id:"aranagme", cat:"form", term:sz("Aranağme", "Aranağme"), match:{ tr:["aranağme", "ara nağme"], en:["aranağme"] },
    def:sz("Şarkının mısraları arasında çalınan saz nağmesi; arşivde ayrı eser olarak da yazılmıştır.", "The instrumental phrase played between the lines of a şarkı; also written as separate pieces in the archive."),
    see:["teori:form", "ders:aranagme"] },
  { id:"longa", cat:"form", term:sz("Longa", "Longa"),
    def:sz("Saz semâîsi ve sirto gibi faslın saz eserleri ve oyun havaları arasında sayılır; nîm-sofyan usulüyle birlikte anılır.",
      "Counted among the fasıl's instrumental pieces and dance tunes, like saz semâîsi and sirto; associated with the nîm-sofyan usul."),
    see:["teori:form", "ders:longa-1"] },
  { id:"ilahi", cat:"form", term:sz("İlâhi", "İlâhi"), match:{ tr:["ilâhi"], en:["ilâhi"] },
    def:sz("Dinî-tasavvufî sözlü eserlerin genel adı; en çok sofyan, düyek, evfer, devr-i hindî gibi usullerle bestelenir.",
      "The general name for religious-Sufi vocal pieces, mostly composed in usuls like sofyan, düyek, evfer and devr-i hindî."),
    see:["teori:form"] },
  { id:"hane", cat:"form", term:sz("Hane", "Hane"),
    def:sz("Peşrev ve saz semâîsinin bölümleri; çoğu eserde dört hane vardır ve her haneden sonra mülâzime gelir.", "The sections of a peşrev or saz semâîsi; most have four, each followed by the mülâzime."),
    see:["teori:form", "ders:pesrev-1"], skip:/hanende/i },
  { id:"mulazime", cat:"form", term:sz("Mülâzime", "Mülâzime"),
    def:sz("Peşrevin her hanesinden sonra gelen, nağmesi değişmeyen bölüm; ilk hanenin makamına dönüp karar verir.", "The unchanging section after each hane of a peşrev; it returns to the first hane's makam and cadences."),
    see:["teori:form", "ders:pesrev-1"] },
  { id:"teslim", cat:"form", term:sz("Teslim", "Teslim"),
    def:sz("Bugün çoğu zaman mülâzimeye denir; asıl teslim, haneyi mülâzimeye bağlayan kısa nağmedir.", "Today often used for the mülâzime; strictly, the teslim is the short phrase linking a hane to the mülâzime."),
    see:["teori:form", "ders:pesrev-1"] },
  { id:"zemin", cat:"form", term:sz("Zemin", "Zemin"),
    def:sz("Şarkıda dörtlüğün 1. mısraı; genellikle makamın güçlüsünde yarım karar verir.", "Line 1 of a şarkı's quatrain; it usually makes a half cadence on the makam's güçlü."), see:["teori:form"] },
  { id:"nakarat", cat:"form", term:sz("Nakarat", "Nakarat (refrain)"),
    def:sz("Şarkıda dörtlüğün 2. mısraı; 4. mısra da nakaratın bestesiyle okunur.", "Line 2 of a şarkı's quatrain; line 4 is sung to the same music."), see:["teori:form"] },
  { id:"meyan", cat:"form", term:sz("Meyan", "Meyan"),
    def:sz("Şarkıda dörtlüğün 3. mısraı: başka makamlara geçilen yer.", "Line 3 of a şarkı's quatrain: where the music moves to other makams."), see:["teori:form", "ders:taksim-tiz"] },
  { id:"bent", cat:"form", term:sz("Bent, kavuştak", "Bent, kavuştak"), match:{ tr:["kavuştak", "bent"], en:["kavuştak"] },
    def:sz("Türkünün bölümleri.", "The sections of a türkü."), see:["teori:form", "ders:turku-giris"], skip:/\bbent(on|ler)\b|bent (over|down)/i },
  { id:"uzun-hava", cat:"form", term:sz("Uzun hava, kırık hava", "Uzun hava, kırık hava"), match:{ tr:["uzun hava", "kırık hava"], en:["uzun hava", "kırık hava"] },
    def:sz("Usulsüz türkülere uzun hava, usullü olanlara kırık hava (oyun havası ya da oturak havası) denir. Uzun havada ezgi serbest akar.",
      "Türküs without usul are uzun hava, those with one kırık hava (dance or sitting tunes). In uzun hava the melody flows freely."),
    see:["teori:form", "ders:turku-giris"] },
  { id:"oyun-havasi", cat:"form", term:sz("Oyun havası", "Dance tune"), match:{ tr:["oyun hava"], en:["dance tune"] },
    def:sz("Oynamak için çalınan usullü ezgi. Sol klarnet Trakya'da, Rumeli'de ve Roman müzisyenlerin elinde oyun havasının baş sazıdır.",
      "A melody with an usul, played for dancing. In Thrace, Rumeli and in the hands of Romani musicians the G clarinet is the lead instrument of dance music."),
    see:["ders:trakya-giris", "ders:eslikle-calma"] },
  { id:"fasil", cat:"form", term:sz("Fasıl", "Fasıl"),
    def:sz("Hepsi aynı makamda olan, form bakımından büyükten küçüğe, usul bakımından ağırdan yürüğe sıralanmış eserlerle verilen konser; çalıp söyleyen topluluğa fasıl heyeti denir.",
      "A concert of pieces all in one makam, ordered from large forms to small and from slow usuls to fast; the ensemble is called the fasıl heyeti."),
    see:["ders:fasil-sirasi"] },

  // ---- Süslemeler ----
  { id:"susleme", cat:"susleme", term:sz("Süsleme", "Ornament"), match:{ tr:["süsleme"], en:["ornament"] }, mark:false,
    def:sz("Ezgiye eklenen kısa süs notaları: çarpma, mordan, tril, grupetto, kayarak giriş ve düşüş.", "Short added notes that decorate the melody: grace note, mordent, trill, turn, slide-in and fall."),
    see:["ders:sus-carpma", "ders:sus-makam"] },
  { id:"carpma", cat:"susleme", term:sz("Çarpma", "Grace note (çarpma)"), match:{ tr:["çarpma"], en:["grace note", "çarpma"] }, skip:/çarpmalı tekrar/i,
    def:sz("Asıl notadan hemen önce çok kısa çalınan süs notası; Türk klarnetinde en sık kullanılan süslemedir. Alttan çarpmada süs notası asıl notanın altındadır.",
      "A very short note played just before the main note; the most common ornament on the Turkish clarinet. In a lower grace note it sits below the main note."),
    see:["ders:sus-carpma", "ders:sus-carpma-alt"] },
  { id:"mordan", cat:"susleme", term:sz("Mordan", "Mordent"), match:{ tr:["mordan"], en:["mordent"] },
    def:sz("Üç notalı hızlı süsleme: asıl nota, komşu nota, yine asıl nota. Üst mordanda komşu üstte, alt mordanda alttadır.",
      "A quick three-note ornament: main note, neighbour, main note. In an upper mordent the neighbour is above, in a lower one below."),
    see:["ders:sus-mordan"] },
  { id:"tril", cat:"susleme", term:sz("Tril", "Trill"), match:{ tr:["tril"], en:["trill"] },
    def:sz("Asıl nota ile üstündeki nota arasında hızlı ve düzenli bir git gel; tek parmakla yapılır.", "A fast, even back-and-forth between the main note and the one above; done with one finger."),
    see:["ders:sus-tril"] },
  { id:"grupetto", cat:"susleme", term:sz("Grupetto (çevirme)", "Turn (grupetto)"), match:{ tr:["grupetto"], en:["grupetto", "turn ornament"] },
    def:sz("Asıl notanın etrafında dönen dört notalık süs: üstteki nota, asıl nota, alttaki nota ve yine asıl nota.", "A four-note ornament circling the main note: the note above, the main note, the note below, the main note again."),
    see:["ders:sus-grupetto"] },
  { id:"kayarak-giris", cat:"susleme", term:sz("Kayarak giriş", "Slide-in"), match:{ tr:["kayarak gir"], en:["slide-in", "slide in"] },
    def:sz("Notaya birkaç koma pesten başlamak: parmak deliğin kenarından sıyrılır, dudak sesi yukarı taşır. Notaya en geç 0,4 saniyede oturulur.",
      "Starting a note a few commas below: the finger slides off the edge of the hole, the lips carry the sound up. Land on the note within 0.4 seconds."),
    see:["ders:sus-uslup", "ders:trakya-uslup"] },
  { id:"dusus", cat:"susleme", term:sz("Düşüş", "Fall"), match:{ tr:["düşüş"], en:["fall-off"] },
    def:sz("Nota tutulurken sonunda ses kesilmeden aşağı bırakılması.", "Letting the note drop at its end without stopping the sound."), see:["ders:sus-uslup", "ders:trakya-uslup"] },
  { id:"carpmali-tekrar", cat:"susleme", term:sz("Çarpmalı tekrar", "Grace-note repeat"), match:{ tr:["çarpmalı tekrar"], en:["grace-note repeat"] },
    def:sz("Roman klarnetinin imzası: aynı nota art arda gelince dille kesilmez, üstteki notaya kısacık vurularak bölünür.",
      "The signature of Romani clarinet: a repeated note is not tongued but split by a very quick touch of the note above."),
    see:["ders:agir-roman", "ders:sus-carpma-alt"] },
  { id:"kayis", cat:"susleme", term:sz("Kayış", "Slide (kayış)"), match:{ tr:["kayış"], en:["kayış"] },
    def:sz("Perdeyi dudakla ve parmakla kaydırarak bir sese varmak; Türk tavrında perdeyi dudakla oynatmak (koma, kayış) önemlidir. Kayış kısa olmalıdır.",
      "Reaching a note by sliding the pitch with lips and fingers; bending the pitch with the lips (koma, kayış) matters in Turkish style. Keep it short."),
    see:["ders:sus-uslup", "ders:trakya-uslup"] },
  { id:"glissando", cat:"susleme", term:sz("Glissando", "Glissando"),
    def:sz("Türk klarnetinin imzası kayan sesler: parmaklar deliklerden yavaşça kayarak açılır, dudak da sesi taşır; iki nota arasında perdeler kesintisiz duyulur.",
      "The signature sliding sound of the Turkish clarinet: the fingers slowly slide off the holes, the lips carry the sound, and every pitch between two notes is heard."),
    see:["ders:glissando"] },
  { id:"vibrato", cat:"susleme", term:sz("Vibrato", "Vibrato"),
    def:sz("Perdenin hafifçe ve düzenli aşağı-yukarı dalgalanması. Türk klarnetinde çoğunlukla çene ve dudakla yapılır.", "A gentle, even wave of the pitch up and down. On the Turkish clarinet it is mostly done with the jaw and lips."),
    see:["ders:vibrato"] }
];

// Perde kayıtları: tanım + üretilen satır (Rast'tan kaç koma, yazılı nota). Aynı adda makam varsa bağlantı.
(function(){
  const at = name => SZ_LEARN.PERDES.find(p => p[1] === name);
  for(const [id, name, base] of SZ_PERDES){
    const p = at(name); if(!p) continue;
    const c = p[0], w = SZ_LEARN.commaToWritten(c), n = SZ_LEARN.noteName(w);
    const pos = sz(c === 0 ? "Rast perdesi" : "Rast'tan " + Math.abs(c) + " koma " + (c > 0 ? "tiz" : "pes"),
                   c === 0 ? "The Rast perde" : Math.abs(c) + " commas " + (c > 0 ? "above" : "below") + " Rast");
    SOZLUK.push({ id, cat:"perde", term:sz(name, name), match:{ tr:[name], en:[name] }, perde:c, cs:true,
      def:sz((base ? base.tr + " " : "") + pos.tr + "; klarnette yazılı " + n.tr + ".", (base ? base.en + " " : "") + pos.en + "; written " + n.en + " on the clarinet."),
      see:["teori:perde"], notBefore:/^(?:kâr|l[iıuü](?!\p{L})|aşîran|['’]?\p{L}{0,6}\s+(?:makam|beşli|dörtlü|çeşni|pentachord|tetrachord|Kürdî|Hicaz))/iu });
  }
})();

// ---- Ders metninde işaretleme ----
// Dil başına bir desen: bütün eşleme biçimleri uzundan kısaya (asma karar önce, karar sonra), her biri kendi grubunda.
// Kelime başı harf değil; biçim + en çok 6 harf ek (kesme işaretiyle ya da bitişik), ardından harf değil.
const SZ_PAT = {};
function szPattern(lang){
  if(SZ_PAT[lang]) return SZ_PAT[lang];
  const forms = [];
  for(const e of SOZLUK){
    if(e.mark === false) continue;
    const list = (e.match && e.match[lang]) || [e.term[lang].replace(/\s*\(.*\)$/, "")];
    for(const f of list) forms.push([f, e, e.cs]);
  }
  forms.sort((a, b) => b[0].length - a[0].length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Her kelimenin ilk harfi büyük ya da küçük olabilir (cümle başı); geri kalanı yazıldığı gibi
  const word = w => { const a = w[0], u = a.toLocaleUpperCase("tr"), l = a.toLocaleLowerCase("tr"); return (u !== l ? "[" + esc(u) + esc(l) + "]" : esc(a)) + esc(w.slice(1)); };
  const src = forms.map(([f, , cs]) => "(" + f.split(/(\s+|-)/).map(p => /^\s+$/.test(p) ? "\\s+" : p === "-" ? "-" : !p ? "" : cs ? esc(p) : word(p)).join("") + ")").join("|");
  const re = new RegExp("(?<!\\p{L})(?:" + src + ")((?:['’]?\\p{L}){0,6})(?!\\p{L})", "gu");
  return SZ_PAT[lang] = { re, forms };
}
// root içindeki metin düğümlerinde her terimin ilk geçtiği yeri işaretler. seen: aynı dersin başka kutularıyla ortak küme.
function sozlukMark(root, lang, seen){
  if(!root) return seen;
  seen = seen || new Set();
  const { re, forms } = szPattern(lang);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n =>
    n.parentElement.closest("button, a, .gterm, .scorewrap, svg, label, select, .pbar, h3, .eyebrow") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; for(let n; (n = walker.nextNode());) nodes.push(n);
  for(const node of nodes){
    const text = node.data, hits = [];
    re.lastIndex = 0;
    for(let m; (m = re.exec(text));){
      const g = m.findIndex((x, i) => i > 0 && i <= forms.length && x !== undefined);
      if(g < 0) continue;
      const e = forms[g - 1][1];
      if(seen.has(e.id)) continue;
      const after = text.slice(m.index + forms[g - 1][0].length), around = text.slice(Math.max(0, m.index - 16), m.index + m[0].length + 16);
      if(e.skip && e.skip.test(around)) continue;
      if(e.notBefore && e.notBefore.test(after)) continue;
      seen.add(e.id);
      hits.push([m.index, m[0], e]);
    }
    if(!hits.length) continue;
    const frag = document.createDocumentFragment();
    let pos = 0;
    for(const [i, s, e] of hits){
      if(i > pos) frag.appendChild(document.createTextNode(text.slice(pos, i)));
      const b = document.createElement("button");
      b.type = "button"; b.className = "gterm"; b.dataset.g = e.id; b.textContent = s;
      frag.appendChild(b); pos = i + s.length;
    }
    if(pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  }
  return seen;
}
const sozlukById = id => SOZLUK.find(e => e.id === id);

if(typeof module !== "undefined") module.exports = { SOZLUK, SZ_CATS, sozlukById, szPattern };

// ---- Sözlük sayfası ve alt panel (tarayıcı) ----
if(typeof TRAINERS !== "undefined") TRAINERS.sozluk = function(ctx){
  const { SK, $, store, esc } = ctx;
  const P = $("pp-sozluk");
  const tx = x => pick(x, LANG);
  const fold = s => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
  const sorted = [...SOZLUK].sort((a, b) => tx(a.term).localeCompare(tx(b.term), LANG === "en" ? "en" : "tr"));
  P.innerHTML = `
    <p class="pdesc">${L("Derslerde ve Teori'de geçen " + SOZLUK.length + " terim: çalgının parçaları, nota işaretleri, perde ve çeşni adları, makam ve usul terimleri, formlar, süslemeler. Ders metinlerinde noktalı altı çizili kelimeye dokununca tanımı da açılır.",
      SOZLUK.length + " terms used in the lessons and in Theory: instrument parts, notation, perde and çeşni names, makam and usul terms, forms, ornaments. In lesson texts, tap a word with a dotted underline to see its definition.")}</p>
    <div class="vfilt gzfilt">
      <input id="gzq" type="search" placeholder="${L("Terim ara", "Search terms")}" aria-label="${L("Sözlükte ara", "Search the glossary")}">
      <select id="gzcat" aria-label="${L("Konu", "Topic")}"><option value="">${L("Bütün konular", "All topics")}</option>${SZ_CATS.map(([id, n]) => `<option value="${id}">${esc(tx(n))}</option>`).join("")}</select>
    </div>
    <div id="gzout"></div>`;

  // Bağlantı kartları: ders (kilitliyse soluk), Teori konusu, makam (Dizi). Perde kaydında aynı adda makam varsa o da.
  function seeOf(e){
    const out = [...e.see];
    if(e.cat === "perde"){ const mk = MAKAMS.find(m => m.name === e.term.tr); if(mk) out.push("makam:" + mk.id); }
    return out;
  }
  function linkHtml(s){
    const [kind, id] = s.split(":");
    if(kind === "ders"){ const l = lessonById(id); if(!l) return ""; const on = SK.lessonOpen(id);
      return `<button type="button" class="stopbtn small gzlink" data-lesson="${id}"${on ? "" : " disabled"}>${L("Ders", "Lesson")}: ${esc(tx(l.title))}${on ? "" : L(" · kilitli", " · locked")}</button>`; }
    if(kind === "teori"){ const t = TH_TOPICS.find(x => x.id === id); return t ? `<button type="button" class="stopbtn small gzlink" data-teori="${id}">${L("Teori", "Theory")}: ${esc(t.title)}</button>` : ""; }
    if(kind === "makam"){ const m = makamById(id); return m ? `<button type="button" class="stopbtn small gzlink" data-makam="${id}">${L("Dizi", "Scale")}: ${esc(m.name)}</button>` : ""; }
    return "";
  }
  const other = e => LANG === "en" ? (e.term.tr !== e.term.en ? e.term.tr : "") : (e.term.en !== e.term.tr ? e.term.en : "");
  const entryHtml = (e, head) => `${head ? `<h4 class="gzterm">${esc(tx(e.term))}${other(e) ? ` <small>${esc(other(e))}</small>` : ""}</h4>` : ""}
    <p>${esc(tx(e.def))}</p>
    <div class="pbar gzsee">${seeOf(e).map(linkHtml).join("")}</div>`;

  function render(){
    const q = fold($("gzq").value.trim()), cat = $("gzcat").value;
    const list = sorted.filter(e => (!cat || e.cat === cat) && (!q || fold(e.term.tr + " " + e.term.en + " " + tx(e.def)).includes(q)));
    // Ada göre eşleşenler önce
    if(q) list.sort((a, b) => (fold(tx(b.term)).includes(q) ? 1 : 0) - (fold(tx(a.term)).includes(q) ? 1 : 0));
    $("gzout").innerHTML = list.length ? `<p class="muted small">${list.length} ${L("terim", "terms")}</p>` +
      list.map(e => `<article class="gzitem" id="gz-${e.id}"><span class="label">${esc(tx(SZ_CATS.find(c => c[0] === e.cat)[1]))}</span>${entryHtml(e, true)}</article>`).join("")
      : `<p class="muted">${L("Bu aramada terim yok.", "No terms match.")}</p>`;
  }
  $("gzq").addEventListener("input", render);
  $("gzcat").addEventListener("change", () => { store.set("sozluk.cat", $("gzcat").value); render(); });
  $("gzcat").value = store.get("sozluk.cat", "");
  if(!SZ_CATS.some(c => c[0] === $("gzcat").value)) $("gzcat").value = "";
  render();

  // Bağlantılar: sayfada ve alt panelde aynı
  function go(b){
    if(b.dataset.lesson) SK.openLesson(b.dataset.lesson);
    else if(b.dataset.teori) SK.openTeori(b.dataset.teori);
    else if(b.dataset.makam) SK.openMakam(b.dataset.makam);
  }
  P.addEventListener("click", e => { const b = e.target.closest(".gzlink"); if(b && !b.disabled) go(b); });

  // Alt panel: ders metninde işaretli terime ya da aramada bir terime dokununca
  const sheetEl = document.createElement("div");
  sheetEl.className = "gzsheet";
  sheetEl.addEventListener("click", e => {
    const b = e.target.closest(".gzlink"); if(b && !b.disabled){ go(b); return; }
    if(e.target.closest("[data-gzall]")) SK.nav.open("sozluk");
  });
  SK.glossOpen = id => {
    const e = sozlukById(id); if(!e) return;
    sheetEl.innerHTML = (other(e) ? `<p class="muted small">${esc(other(e))}</p>` : "") + entryHtml(e, false) +
      `<button type="button" class="linkbtn" data-gzall>${L("Bütün sözlük", "Whole glossary")} →</button>`;
    SK.nav.openSheet(tx(e.term), sheetEl);
  };
  document.addEventListener("click", e => { const t = e.target.closest(".gterm"); if(t){ e.preventDefault(); SK.glossOpen(t.dataset.g); } });
  return {};
};
