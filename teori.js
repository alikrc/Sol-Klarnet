// Müzik teorisi: Sol klarnetçi için Türk müziği teorisi. Dersler bölümünün kök segmentlerinden biri (nav.js LROOTS).
// Konular soldaki listede; dokununca konu Dersler'in alt sayfası olarak açılır (telefonda liste gizlenir, ← listeye döner).
// Her konuda kısa anlatım, nota örnekleri (pieces.js drawScore), dinle düğmeleri, ilgili ders ve alıştırmalara bağlantılar
// ve sonda üç soruluk küçük bir sınav. Konuyu derinleştiren yerlere (Usuller, Dizi, Kulak, dersler) bağlanır, onları tekrarlamaz.

// Örnek notalar: perde (koma; yazılı nota ondan) ya da Batı notası (yazılı MIDI)
const thP = (c, d = 1) => ({ w: commaToWritten(c), c, d, rest:false });
const thW = (w, d = 1) => ({ w, c:null, d, rest:false });
const thR = d => ({ w:71, c:null, d, rest:true });
// Aralık harfleri (AEU): koma, bakiye, küçük mücenneb, büyük mücenneb, tanini, artık ikili
const TH_IV = { 1:"F", 4:"B", 5:"S", 8:"K", 9:"T", 12:"A", 13:"A" };
const thLetters = cs => cs.slice(1).map((c, i) => TH_IV[c - cs[i]] || c - cs[i]).join(" ");

// Konular. text: paragraflar; ex: nota örnekleri { notes, meter?, names?, cap, beat (ms) }; links: { lesson | tab | go };
// quiz: { q, a, ok, why, score? }. Özel bölümler (aralık tablosu, çeşniler, makam seçici, usul ızgaraları) sec ile.
const TH_TOPICS = [
  { id:"porte", emo:"🎼", title:L("Dizek ve sol anahtarı", "The staff and the treble clef"),
    text:[
      L("Nota beş çizgili dizeğe (porte) yazılır. Başındaki sol anahtarı (𝄞) ikinci çizgiyi sarar ve o çizgiye Sol adını verir; Türk müziği notasında bu nota Rast perdesidir.",
        "Music is written on a five-line staff. The treble clef (𝄞) at its start curls around the second line and names it G; in Turkish notation that note is the Rast perde."),
      L("Çizgiler aşağıdan yukarı Mi, Sol, Si, Re, Fa; aralıklar Fa, La, Do, Mi. Dizeğe sığmayan notalar kısa ek çizgilerle yazılır. Adın yanındaki sayı oktavdır: Sol4 açık Sol, Sol5 bir oktav tizi.",
        "Lines from the bottom: E, G, B, D, F; spaces: F, A, C, E. Notes that don't fit on the staff get short ledger lines. The number after the name is the octave: G4 is open G, G5 an octave higher.")
    ],
    ex:[
      { notes:[64, 65, 67, 69, 71, 72, 74, 76, 77].map(w => thW(w)), names:true, beat:420,
        cap:L("Dizeğin içi: Mi4'ten Fa5'e", "Inside the staff: E4 to F5") },
      { notes:[57, 60, 62, 79, 81, 84].map(w => thW(w)), names:true, beat:420,
        cap:L("Ek çizgiler: La3, Do4, Re4 aşağıda; Sol5, La5, Do6 yukarıda", "Ledger lines: A3, C4, D4 below; G5, A5, C6 above") }
    ],
    links:[{ lesson:"nota-okuma" }, { tab:"staffmap" }, { tab:"gorbas" }],
    quiz:[
      { q:L("Sol anahtarı hangi çizgiye Sol adını verir?", "Which line does the treble clef name G?"),
        a:[L("Birinci", "First"), L("İkinci", "Second"), L("Üçüncü", "Third")], ok:1,
        why:L("Anahtar ikinci çizgiyi sarar; o çizgi Sol4, yani Rast'tır.", "The clef curls around the second line: that line is G4, Rast.") },
      { q:L("Dizeğin en alt çizgisindeki nota hangisi?", "Which note sits on the bottom line?"),
        a:["Mi4", "Sol4", "Do4"].map(n => LANG === "en" ? { Mi4:"E4", Sol4:"G4", Do4:"C4" }[n] : n), ok:0,
        why:L("Çizgiler aşağıdan Mi, Sol, Si, Re, Fa.", "The lines from the bottom are E, G, B, D, F.") },
      { q:L("Bu nota hangisi?", "Which note is this?"), score:[thW(72, 2)],
        a:LANG === "en" ? ["A4", "C5", "B4"] : ["La4", "Do5", "Si4"], ok:1,
        why:L("Üçüncü aralıktaki nota Do5'tir (aralıklar Fa, La, Do, Mi).", "The third space is C5 (the spaces are F, A, C, E).") }
    ] },

  { id:"deger", emo:"⏱️", title:L("Nota değerleri ve ölçü", "Note values and time signatures"),
    text:[
      L("Notanın şekli ne kadar süreceğini söyler. Dörtlük (♩) bir vuruş sürer; ikilik iki, birlik dört vuruş. Sekizlikte bir vuruşa iki, onaltılıkta dört nota düşer. Notanın yanındaki nokta süresine yarısını ekler: noktalı ikilik üç, noktalı dörtlük bir buçuk vuruş.",
        "A note's shape tells how long it lasts. A quarter note (♩) lasts one beat, a half note two and a whole note four. Two eighths or four sixteenths fit in one beat. A dot adds half the value: a dotted half lasts three beats, a dotted quarter one and a half."),
      L("Her değerin bir de susu vardır: o süre kadar çalmadan beklenir.",
        "Every value has a matching rest: you wait that long without playing."),
      L("Ölçü işaretinde üstteki sayı ölçüde kaç birim olduğunu, alttaki birimin cinsini söyler: 4/4 dört dörtlük, 9/8 dokuz sekizlik. Türk müziğinde ölçü çoğunlukla eserin usulüdür (aşağıda Usul ve ölçü).",
        "In a time signature the top number is how many units fill a bar and the bottom one which unit: 4/4 is four quarters, 9/8 nine eighths. In Turkish music the time signature is usually the piece's usul (see Usul and metre below).")
    ],
    ex:[
      { notes:[thW(67, 4), thW(67, 2), thW(67, 2), thW(67), thW(67), thW(67), thW(67), ...Array(8).fill(0).map(() => thW(67, 0.5))], meter:[4, 4], beat:500,
        cap:L("Birlik · iki ikilik · dört dörtlük · sekiz sekizlik", "Whole · two halves · four quarters · eight eighths") },
      { notes:[thW(67, 3), thW(69), thW(71, 1.5), thW(69, 0.5), thW(67), thR(1), thW(67), thR(1), thW(74, 2), thR(2)], meter:[4, 4], beat:500,
        cap:L("Noktalı ikilik, noktalı dörtlük, dörtlük ve ikilik suslar", "Dotted half, dotted quarter, quarter and half rests") }
    ],
    links:[{ tab:"hece" }, { tab:"rhythm" }, { lesson:"ritim-temel" }],
    quiz:[
      { q:L("Bir ikilik kaç dörtlük eder?", "How many quarter notes make a half note?"), a:["1", "2", "4"], ok:1,
        why:L("İkilik iki vuruş, dörtlük bir vuruş sürer.", "A half lasts two beats, a quarter one.") },
      { q:L("Noktalı dörtlük kaç vuruş sürer?", "How many beats does a dotted quarter last?"), a:["1", L("1,5", "1.5"), "2"], ok:1,
        why:L("Nokta yarısını ekler: 1 + ½.", "The dot adds half: 1 + ½.") },
      { q:L("9/8 ölçüde bir ölçüye ne sığar?", "What fills one bar of 9/8?"),
        a:[L("Dokuz sekizlik", "Nine eighths"), L("Dokuz dörtlük", "Nine quarters"), L("Sekiz dokuzluk", "Eight ninths")], ok:0,
        why:L("Üstteki 9 kaç birim, alttaki 8 birimin sekizlik olduğunu söyler.", "The top 9 is how many units, the bottom 8 says the unit is an eighth.") }
    ] },

  { id:"koma", emo:"📏", title:L("Aralıklar ve koma", "Intervals and the comma"),
    text:[
      L("İki perde arasındaki uzaklığa aralık denir. Türk müziğinin Arel-Ezgi-Uzdilek (AEU) sisteminde bir oktav 53 komaya, bir tam ses 9 komaya bölünür. Batı müziğindeki yarım sesin yerinde iki ayrı aralık vardır: 4 komalık bakiye ve 5 komalık küçük mücenneb.",
        "The distance between two perdes is an interval. In the Arel-Ezgi-Uzdilek (AEU) system of Turkish music an octave is divided into 53 commas and a whole tone into 9. Where Western music has one semitone, there are two intervals: the 4-comma bakiye and the 5-comma küçük mücenneb.")
    ],
    sec:"intervals",
    text2:[
      L("Notadaki işaretler de kaç koma olduğunu söyler. Düz diyez (♯) bakiye diyezidir: +4 koma. Düz bemol (♭) küçük mücenneb bemolüdür: −5 koma. Çizgili (slaşlı) bemol bakiye bemolüdür: −4 koma. Bunlardan başka koma (±1), küçük mücenneb diyezi (+5) ve büyük mücenneb (±8) işaretleri vardır.",
        "The accidentals also tell how many commas. A plain sharp (♯) is the bakiye sharp: +4 commas. A plain flat (♭) is the küçük mücenneb flat: −5. The slashed flat is the bakiye flat: −4. There are also koma (±1), küçük mücenneb sharp (+5) and büyük mücenneb (±8) signs."),
      L("Uygulama işaretin yanına koma sayısını küçük yazar: Segâh ♭1 (Si'nin 1 koma pesi), Kürdî ♭5, Dik Kürdî ♭4, Evç ♯4.",
        "The app writes the comma count small next to the sign: Segâh ♭1 (B lowered by one comma), Kürdî ♭5, Dik Kürdî ♭4, Evç ♯4.")
    ],
    ex:[
      { notes:[0, 13, 14, 17, 26, 27, 48].map(c => thP(c)), names:true, beat:520,
        cap:L("Rast, Kürdî ♭5, Dik Kürdî ♭4, Segâh ♭1, Nim Hicaz ♯4, Hicaz ♯5, Evç ♯4", "Rast, Kürdî ♭5, Dik Kürdî ♭4, Segâh ♭1, Nim Hicaz ♯4, Hicaz ♯5, Evç ♯4") }
    ],
    links:[{ tab:"ear" }, { lesson:"rast-giris" }, { lesson:"kulak-1" }],
    quiz:[
      { q:L("Tam ses (tanini) kaç komadır?", "How many commas is a whole tone (tanini)?"), a:["8", "9", "12"], ok:1,
        why:L("AEU'da tam ses 9 koma, oktav 53 komadır.", "In AEU a whole tone is 9 commas, an octave 53.") },
      { q:L("Segâh'tan Çargâh'a aralık hangisi?", "What is the interval from Segâh to Çargâh?"),
        a:[L("Bakiye (4)", "Bakiye (4)"), L("Küçük mücenneb (5)", "Küçük mücenneb (5)"), L("Tanini (9)", "Tanini (9)")], ok:1,
        why:L("Segâh 17, Çargâh 22 koma: aradaki 5 koma küçük mücennebdir.", "Segâh is 17 and Çargâh 22 commas: the 5 between them is a küçük mücenneb.") },
      { q:L("Türk notasında düz diyez (♯) kaç koma tizleştirir?", "In Turkish notation, how many commas does a plain sharp (♯) raise?"), a:["1", "4", "5"], ok:1,
        why:L("Düz diyez bakiye diyezidir: +4 koma.", "The plain sharp is the bakiye sharp: +4 commas.") }
    ] },

  { id:"perde", emo:"🏷️", title:L("Perdeler ve isimleri", "Perdes and their names"),
    text:[
      L("Türk müziğinde her sesin kendi adı vardır; bu seslere perde denir. Ana perdeler Batı'daki doğal notalara karşılık gelir: Rast (yazılı Sol4), Dügâh (La4), Segâh (Si4'ün 1 koma pesi), Çargâh (Do5), Nevâ (Re5), Hüseynî (Mi5), Evç (Fa5'in bakiye diyezi) ve Gerdâniye (Sol5).",
        "In Turkish music every pitch has its own name; these pitches are called perdes. The main perdes match the Western natural notes: Rast (written G4), Dügâh (A4), Segâh (B4 lowered by one comma), Çargâh (C5), Nevâ (D5), Hüseynî (E5), Evç (F5 with a bakiye sharp) and Gerdâniye (G5)."),
      L("Oktav değişince perde yeni bir ad alır: Rast'ın tizi Gerdâniye, Dügâh'ın tizi Muhayyer. Rast'ın altında Irak, Acem Aşîran, Hüseynî Aşîran ve Yegâh vardır. “Kaba” ön eki bir oktav pes, “Tiz” bir oktav tiz demektir: Kaba Dügâh, Tiz Segâh.",
        "When the octave changes the perde gets a new name: the octave of Rast is Gerdâniye, of Dügâh Muhayyer. Below Rast are Irak, Acem Aşîran, Hüseynî Aşîran and Yegâh. The prefix “Kaba” means an octave lower, “Tiz” an octave higher: Kaba Dügâh, Tiz Segâh.")
    ],
    ex:[
      { notes:[-22, -13, -9, -5, 0, 9, 17, 22, 31, 40, 48, 53, 62].map(c => thP(c)), names:true, beat:480,
        cap:L("Ana perdeler: Yegâh'tan Muhayyer'e", "Main perdes: Yegâh to Muhayyer") }
    ],
    text2:[
      L("Ana perdelerin arasındaki ara perdelerin de adı vardır. Dügâh ile Nevâ arasında Kürdî, Dik Kürdî, Segâh, Bûselik, Dik Bûselik, Çargâh, Nim Hicaz, Hicaz ve Dik Hicaz sıralanır. “Nim” yarım, “Dik” biraz tiz demektir. Hangi ara perdenin çalınacağını makam belirler.",
        "The perdes between the main ones have names too. Between Dügâh and Nevâ come Kürdî, Dik Kürdî, Segâh, Bûselik, Dik Bûselik, Çargâh, Nim Hicaz, Hicaz and Dik Hicaz. “Nim” means half, “Dik” slightly higher. The makam decides which in-between perde is played.")
    ],
    ex2:[
      { notes:[9, 13, 14, 17, 18, 21, 22, 26, 27, 30, 31].map(c => thP(c)), names:true, beat:520,
        cap:L("Dügâh'tan Nevâ'ya bütün perdeler", "Every perde from Dügâh to Nevâ") }
    ],
    links:[{ go:"tune" }, { tab:"tablo" }, { lesson:"rast-giris" }],
    quiz:[
      { q:L("Nevâ hangi yazılı notadır?", "Which written note is Nevâ?"), a:LANG === "en" ? ["C5", "D5", "E5"] : ["Do5", "Re5", "Mi5"], ok:1,
        why:L("Rast Sol4, Dügâh La4, Segâh Si4, Çargâh Do5, Nevâ Re5.", "Rast G4, Dügâh A4, Segâh B4, Çargâh C5, Nevâ D5.") },
      { q:L("Rast'ın bir oktav tizinin adı nedir?", "What is the octave above Rast called?"), a:["Gerdâniye", "Muhayyer", "Hüseynî"], ok:0,
        why:L("Gerdâniye yazılı Sol5'tir; Muhayyer Dügâh'ın tizidir.", "Gerdâniye is written G5; Muhayyer is the octave of Dügâh.") },
      { q:L("Kaba Dügâh nerededir?", "Where is Kaba Dügâh?"),
        a:[L("Dügâh'ın bir oktav pesi", "An octave below Dügâh"), L("Dügâh'ın 1 koma pesi", "One comma below Dügâh"), L("Dügâh'ın bir oktav tizi", "An octave above Dügâh")], ok:0,
        why:L("“Kaba” bir oktav pes demektir.", "“Kaba” means an octave lower.") }
    ] },

  { id:"cesni", emo:"🧩", title:L("Çeşni: dörtlü ve beşliler", "Çeşni: tetrachords and pentachords"),
    text:[
      L("Makam dizileri küçük yapı taşlarından kurulur: dört perdelik dörtlüler ve beş perdelik beşliler. Aralıklarının sırası her birine kendine özgü bir renk, bir çeşni verir. Dörtlü çoğunlukla bir tam dörtlüyü (22 koma), beşli bir tam beşliyi (31 koma) kaplar; beşli de çoğunlukla dörtlüye bir tam ses eklenmiş hâlidir.",
        "Makam scales are built from small blocks: four-perde tetrachords (dörtlü) and five-perde pentachords (beşli). The order of their intervals gives each its own colour, its çeşni. A tetrachord usually spans a perfect fourth (22 commas) and a pentachord a perfect fifth (31); a pentachord is usually a tetrachord plus a whole tone."),
      L("Bir makam dizisi çoğunlukla bir beşli ile bir dörtlünün birleşmesidir: Rast = Rast beşlisi + Nevâ'da Rast dörtlüsü; Uşşak = Dügâh'ta Uşşak dörtlüsü + Nevâ'da Bûselik beşlisi. Harfler aralıklardır: T tanini (9), K büyük mücenneb (8), S küçük mücenneb (5), B bakiye (4), A artık ikili (12–13).",
        "A makam scale is usually a pentachord joined to a tetrachord: Rast = Rast pentachord + Rast tetrachord on Nevâ; Uşşak = Uşşak tetrachord on Dügâh + Bûselik pentachord on Nevâ. The letters are intervals: T tanini (9), K büyük mücenneb (8), S küçük mücenneb (5), B bakiye (4), A augmented second (12–13)."),
      L("Aşağıda her çeşnide onu ayırt eden aralık ve perde, sonra geçtiği makamlar var. Asma karar, ezginin bir perdede kısa süre kalmasıdır; bitiş hissi tam karardan zayıftır.",
        "Below, each çeşni comes with the interval and perde that set it apart, then the makams it appears in. An asma karar is a brief stop on a perde; it feels less final than a full cadence.")
    ],
    sec:"cesni",
    links:[{ tab:"makam" }, { lesson:"makam-bulma" }],
    quiz:[
      { q:L("Hicaz dörtlüsünü ötekilerden ayıran aralık hangisi?", "Which interval sets the Hicaz tetrachord apart?"),
        a:[L("Artık ikili (12 koma)", "Augmented second (12 commas)"), L("Koma (1)", "Koma (1)"), L("Bakiye (4)", "Bakiye (4)")], ok:0,
        why:L("Hicaz dörtlüsü S A S: ortadaki geniş artık ikili ona rengini verir.", "The Hicaz tetrachord is S A S: the wide augmented second in the middle gives its colour.") },
      { q:L("Uşşak dörtlüsünün aralıkları hangisi?", "What are the intervals of the Uşşak tetrachord?"), a:["T K S", "K S T", "S A S"], ok:1,
        why:L("Dügâh–Segâh 8, Segâh–Çargâh 5, Çargâh–Nevâ 9 koma.", "Dügâh–Segâh 8, Segâh–Çargâh 5, Çargâh–Nevâ 9 commas.") },
      { q:L("Bir dörtlü kaç koma kaplar?", "How many commas does a tetrachord span?"), a:["22", "31", "53"], ok:0,
        why:L("Tam dörtlü 22, tam beşli 31, oktav 53 komadır.", "A perfect fourth is 22, a fifth 31, an octave 53 commas.") }
    ] },

  { id:"makam", emo:"🧭", title:L("Makam yapısı: durak, güçlü, seyir", "How a makam works: durak, güçlü, seyir"),
    text:[
      L("Makam yalnız bir dizi değildir; ezginin o dizide nasıl gezindiğidir. Bir makamı dört kavram tanıtır:",
        "A makam is not just a scale; it is how the melody moves within it. Four ideas describe a makam:")
    ],
    list:[
      L("<b>Durak:</b> ezginin bittiği, karar verdiği perde.", "<b>Durak</b> (final): the perde where the melody ends and settles."),
      L("<b>Güçlü:</b> duraktan sonra en önemli perde. Ezgi çevresinde dolaşır, yarım kararlar burada verilir; çoğunlukla iki çeşninin birleştiği yerdir.",
        "<b>Güçlü</b> (dominant): the most important perde after the final. The melody circles it and makes half cadences there; usually where the two çeşnis meet."),
      L("<b>Yeden:</b> durağın hemen altındaki perde; kararı hazırlar.", "<b>Yeden</b> (leading tone): the perde just below the final; it prepares the cadence."),
      L("<b>Seyir:</b> ezginin yolu. Çıkıcı seyir durak çevresinden başlayıp güçlüye çıkar, inici seyir tizden başlayıp iner, inici-çıkıcı seyir güçlü çevresinden başlar. Dizileri aynı olan makamlar (Uşşak ve Bayâtî gibi) seyirleriyle ayrılır.",
        "<b>Seyir</b> (path): the route the melody takes. An ascending seyir starts around the final and rises to the güçlü, a descending one starts high and comes down, a descending-ascending one starts around the güçlü. Makams with the same scale (like Uşşak and Bayâtî) differ by their seyir.")
    ],
    sec:"makam",
    links:[{ lesson:"makam-bulma" }, { tab:"seyir" }, { tab:"mimic" }],
    quiz:[
      { q:L("Ezginin bittiği perdeye ne denir?", "What is the perde where the melody ends called?"), a:[L("Güçlü", "Güçlü"), L("Durak", "Durak"), L("Yeden", "Yeden")], ok:1,
        why:L("Durak, makamın karar perdesidir.", "The durak is the makam's final.") },
      { q:L("Uşşak makamının durağı hangisi?", "What is the durak of makam Uşşak?"), a:["Rast", "Dügâh", "Nevâ"], ok:1,
        why:L("Uşşak Dügâh'ta karar verir; güçlüsü Nevâ'dır.", "Uşşak ends on Dügâh; its güçlü is Nevâ.") },
      { q:L("Tizden başlayıp inen seyre ne denir?", "What is a seyir that starts high and comes down called?"),
        a:[L("Çıkıcı", "Ascending"), L("İnici", "Descending"), L("İnici-çıkıcı", "Descending-ascending")], ok:1,
        why:L("İnici seyir tizden başlar; Mâhur ve Kürdîli Hicazkâr gibi.", "A descending seyir starts high; like Mâhur and Kürdîli Hicazkâr.") }
    ] },

  { id:"usul", emo:"🥁", title:L("Usul ve ölçü", "Usul and metre"),
    text:[
      L("Usul, Türk müziğinin ritim kalıbıdır: bir ölçünün içinde kalın “düm” ve ince “tek” vuruşlarının sırası. Eserin ölçü işareti usulün zamanını verir: Sofyan 4/4, Aksak 9/8.",
        "An usul is a rhythmic pattern of Turkish music: the order of deep “düm” and light “tek” strokes within a bar. A piece's time signature gives the usul's length: Sofyan 4/4, Aksak 9/8."),
      L("Küçük usuller 2–15 zamanlıdır; büyük usuller küçüklerin birleşmesiyle kurulur ve ağır eserlerde kullanılır. Aksak usullerde vuruşlar eşit değildir: 5/8 Türk aksağı 2+3, 9/8 Aksak 2+2+2+3 diye sayılır. Uzun gruplar ezgiye kendine özgü topallamasını verir.",
        "Small usuls have 2 to 15 beats; large usuls are built by joining small ones and are used in slow pieces. In limping (aksak) usuls the beats are unequal: 5/8 Türk aksağı counts 2+3, 9/8 Aksak 2+2+2+3. The longer groups give the melody its limp.")
    ],
    sec:"usul",
    links:[{ tab:"usul" }, { tab:"hece" }, { lesson:"usul" }],
    quiz:[
      { q:L("Usulde kalın vuruşun adı nedir?", "What is the deep stroke of an usul called?"), a:["Tek", "Düm", "Te"], ok:1,
        why:L("Kalın vuruş düm, ince vuruş tek.", "The deep stroke is düm, the light one tek.") },
      { q:L("9/8 Aksak nasıl gruplanır?", "How is 9/8 Aksak grouped?"), a:["3+3+3", "2+2+2+3", "3+2+2+2"], ok:1,
        why:L("Aksak bir sofyan (2+2) ile bir Türk aksağının (2+3) birleşmesidir; sondaki üçlü grup ona topal yürüyüşünü verir.", "Aksak joins a sofyan (2+2) and a Türk aksağı (2+3); the closing group of three gives it its limp.") },
      { q:L("Sofyan kaç zamanlıdır?", "How many beats does Sofyan have?"), a:["2", "4", "8"], ok:1,
        why:L("Sofyan 4/4: düm iki vuruş, ardından iki tek.", "Sofyan is 4/4: a two-beat düm, then two teks.") }
    ] },

  { id:"transpoz", emo:"🎷", title:L("Sol klarnet ve transpozisyon", "The G clarinet and transposition"),
    text:[
      L("Klarnet transpoze bir çalgıdır: yazılan nota ile duyulan ses farklıdır. Sol klarnette yazılı nota, duyulan sesin tam dörtlü (5 yarım ses) üstüdür. Yazılı Do çalınca Sol duyulur; çalgının adı buradan gelir.",
        "The clarinet is a transposing instrument: the written note and the sound differ. On the G clarinet the written note is a perfect fourth (5 semitones) above the sound. A written C sounds as G; that's where the name comes from."),
      L("Türk müziği notası Rast'ı Sol'e yazar ve en yaygın akort olan Bolahenk'te yazılandan tam dörtlü pes çalınır. Sol klarnetin farkı da tam dörtlü olduğundan Sol klarnetçi notayı olduğu gibi okur: yazılı Sol4 (Rast) Re4 olarak duyulur.",
        "Turkish notation writes Rast as G, and in Bolahenk, the most common pitch level, music sounds a perfect fourth below the written note. Since the G clarinet is also a fourth, its player reads the score as it is: written G4 (Rast) sounds as D4."),
      L("Piyano ya da başka bir çalgıyla çalarken çevir: duyulan sesi bulmak için yazılıdan tam dörtlü in, piyanodaki bir sesi çalmak için tam dörtlü çık. Uygulama her yerde yazılı notayı gösterir; Akort ekranı duyulanı da yazar.",
        "When playing with a piano or another instrument, convert: go down a fourth from the written note to get the sound, up a fourth to play a piano pitch. The app always shows the written note; the Tuner shows the sounding one too.")
    ],
    sec:"transpoz",
    ex:[
      { notes:[0, 9, 17, 22, 31].map(c => thP(c)), names:true, beat:520, sounding:true,
        cap:L("Yazılı Rast beşlisi", "The Rast pentachord as written") }
    ],
    links:[{ go:"tune" }, { tab:"tablo" }],
    quiz:[
      { q:L("Sol klarnette yazılı Sol4 nasıl duyulur?", "How does written G4 sound on the G clarinet?"), a:LANG === "en" ? ["G4", "D4", "C4"] : ["Sol4", "Re4", "Do4"], ok:1,
        why:L("Tam dörtlü pes: Sol4 → Re4.", "A perfect fourth lower: G4 → D4.") },
      { q:L("Piyanodaki Do4 sesini çalmak için Sol klarnette hangi notayı okursun?", "To play the piano's C4 on the G clarinet, which note do you read?"),
        a:LANG === "en" ? ["F4", "G4", "A3"] : ["Fa4", "Sol4", "La3"], ok:0,
        why:L("Duyulan sesten tam dörtlü çık: Do4 → Fa4.", "Go up a perfect fourth from the sound: C4 → F4.") },
      { q:L("Sol klarnet adını nereden alır?", "Where does the G clarinet get its name?"),
        a:[L("Yazılı Do'su Sol duyulduğu için", "Its written C sounds as G"), L("En pes notası Sol olduğu için", "Its lowest note is G"), L("Rast Sol'e yazıldığı için", "Rast is written as G")], ok:0,
        why:L("Transpoze çalgılar, yazılı Do'nun duyulan sesiyle adlandırılır.", "Transposing instruments are named after the sound of their written C.") }
    ] }
];

// Çeşniler: ad, başladığı perde, perdeleri (koma), ayırt edici yanı (note; kaynaklar docs/KAYNAKLAR.md §2a).
// core: makam dizilerinde aranacak perde sayısı (varsayılan 4: dörtlü ve beşli birlikte bulunsun; ayrı adı olan beşlilerde 5).
// alt: aynı çeşninin öteki aralık biçimleri (koma).
const TH_CESNI = [
  { name:L("Rast beşlisi", "Rast pentachord"), on:"Rast", cs:[0, 9, 17, 22, 31],
    note:L("Üçüncü sesi Segâh'tır: taniniden sonra K ve S gelir. Çargâh beşlisinde aynı yerde Bûselik vardır (T ve B); fark 1 komadır. Bir tanini üstte, Dügâh'ta bir Uşşak dörtlüsü durur; bu yüzden Rast seyrinde Dügâh'ta Uşşak çeşnili asma karar yapılır. Segâh'taki segâhlı ya da ferahnâkli asma kararlar da karakteristiktir.",
      "Its third note is Segâh: after the tanini come K and S. The Çargâh pentachord has Bûselik in that place (T and B); the difference is one comma. A tanini higher, on Dügâh, sits an Uşşak tetrachord, so the seyir of Rast makes asma kararlar on Dügâh with Uşşak. Asma kararlar on Segâh, with Segâh or Ferahnâk, are characteristic too.") },
  { name:L("Uşşak dörtlüsü", "Uşşak tetrachord"), on:"Dügâh", cs:[9, 17, 22, 31],
    note:L("Ayırt edici perdesi Segâh'tır. Dügâh'tan Segâh'a 8 koma yazılır, ama inici seyirde Segâh 1–2 koma daha pes basılır ve aralık 6–7 komaya iner (eksik büyük mücenneb). Notada bunun işareti yoktur; asma kararda değil, inerken olur ve Uşşak çeşnisinin bulunduğu bütün makamlarda duyulur. Uşşak makamının en önemli asma karar perdesi de Segâh'tır.",
      "Its telling perde is Segâh. Dügâh to Segâh is written as 8 commas, but in descending lines Segâh is played 1–2 commas lower, narrowing the step to 6–7 commas (eksik büyük mücenneb). Notation has no sign for this; it happens going down, not on an asma karar, and shows in every makam that has the Uşşak çeşni. Segâh is also the most important asma karar perde of makam Uşşak.") },
  { name:L("Hüseynî beşlisi", "Hüseynî pentachord"), on:"Dügâh", cs:[9, 17, 22, 31, 40], core:5,
    note:L("Dügâh'taki Uşşak dörtlüsünün üstüne bir tanini daha gelir ve dizi Hüseynî perdesine uzanır. Hüseynî makamının temelidir: Hüseynî perdesinde Uşşak çeşnisiyle yarım karar, Dügâh'ta bu beşliyle tam karar verilir. En karakteristik asma karar perdesi Çargâh'tır.",
      "A tanini is added on top of the Uşşak tetrachord on Dügâh, reaching the Hüseynî perde. It is the base of makam Hüseynî: half cadence on Hüseynî with Uşşak, final on Dügâh with this pentachord. Its most characteristic asma karar perde is Çargâh.") },
  { name:L("Bûselik dörtlüsü", "Bûselik tetrachord"), on:"Dügâh", cs:[9, 18, 22, 31],
    note:L("İkinci sesi Bûselik'tir: Uşşak'taki Segâh'tan 1 koma tiz, Dügâh'tan tam 9 koma uzakta. Ardından Çargâh'a bir bakiye (4) gelir. Bûselik dizileri Batı'nın minörüne karşılık gelir: Bûselik makamı la minöre çok yakındır, Nihâvend bu dizinin Rast'a göçürülmüşüdür. Uşşak, Kürdî ve Hümâyun Nevâ'da Bûselik çeşnisiyle yarım karar verir.",
      "Its second note is Bûselik: one comma above the Segâh of Uşşak, a full 9 commas from Dügâh. A bakiye (4) then leads to Çargâh. Bûselik scales correspond to the Western minor: makam Bûselik is very close to A minor, and Nihâvend is this scale moved to Rast. Uşşak, Kürdî and Hümâyun make their half cadence on Nevâ with Bûselik.") },
  { name:L("Kürdî dörtlüsü", "Kürdî tetrachord"), on:"Dügâh", cs:[9, 13, 22, 31],
    note:L("Bakiye en alttadır: Dügâh'ın 4 koma üstünde Kürdî perdesi gelir. Dügâh'taki Kürdî makamı az kullanılır; dizinin Rast'a göçürülmüşü Kürdîli Hicazkâr ise çok kullanılır. Hüseynî'de inerken Evç yerine Acem basılınca Uşşak dörtlüsünün yerini Kürdî dörtlüsü alır. Nihâvend Nevâ'da çoğunlukla Kürdî çeşnisiyle yarım karar verir.",
      "The bakiye is at the bottom: the Kürdî perde lies 4 commas above Dügâh. Makam Kürdî on Dügâh is little used, while its scale moved to Rast, Kürdîli Hicazkâr, is used a lot. In Hüseynî, when Acem replaces Evç coming down, a Kürdî tetrachord takes the place of Uşşak. Nihâvend mostly makes its half cadence on Nevâ with Kürdî.") },
  { name:L("Hicaz dörtlüsü", "Hicaz tetrachord"), on:"Dügâh", cs:[9, 14, 26, 31], alt:[[4, 13, 5]],
    note:L("Çeşninin karakteristiği ortadaki artık ikilidir: Dik Kürdî ile Nim Hicaz arası 12 koma. Adına rağmen bu dizilerde Hicaz perdesi (27) değil, Nim Hicaz (26) kullanılır. Hicaz, Hümâyun, Uzzâl ve Zirgüleli Hicaz'ın temeli Dügâh'taki bu çeşnidir; kimi dörtlü, kimi beşli olarak kullanır, değişen güçlüler ve üstlerindeki çeşnilerdir. Zirgüleli Hicaz'da Hüseynî'deki Hicaz, özellikle inerken B A S (4, 13, 5) biçimini de alabilir.",
      "The hallmark of this çeşni is the augmented second in the middle: 12 commas from Dik Kürdî to Nim Hicaz. Despite the name, these scales use Nim Hicaz (26), not the Hicaz perde (27). Hicaz, Hümâyun, Uzzâl and Zirgüleli Hicaz all rest on this çeşni on Dügâh, some as a tetrachord, some as a pentachord; what changes is the dominant and the çeşni above it. In Zirgüleli Hicaz the Hicaz on Hüseynî can also take the form B A S (4, 13, 5), especially coming down.") },
  { name:L("Çargâh dörtlüsü", "Çargâh tetrachord"), on:"Çargâh", cs:[22, 31, 40, 44],
    note:L("Yalnız tanini ve bakiyeden oluşur, bakiye en üsttedir. Çargâh dizisi işaretsiz yazılır ve AEU'da ana dizi sayılır, ama az kullanılır. Çargâh dizileri Batı'nın majörüne karşılık gelir: Mâhur, Rast'taki Çargâh dizisidir ve Batı müziği bakımından sol majördür. Hüseynî'de Çargâh perdesindeki Çargâh çeşnili asma karar çok önemlidir.",
      "It has only tanini and bakiye, with the bakiye on top. The Çargâh scale is written without accidentals and counts as the main scale in AEU, though it is little used. Çargâh scales correspond to the Western major: Mâhur is the Çargâh scale on Rast, which in Western terms is G major. In Hüseynî the asma karar on the Çargâh perde with this çeşni is very important.") },
  { name:L("Segâh beşlisi", "Segâh pentachord"), on:"Segâh", cs:[17, 22, 31, 39, 48], core:5,
    note:L("Segâh perdesi üzerine kurulur ve üst perdeleri değişkendir. Evç yerine Acem gelince S T K S aralıklı eksik Segâh beşlisi, Dik Hisar yerine Hüseynî gelince Ferahnâk beşlisi olur (S T T K; Acem'le S T T B). Segâh makamı tam kararını bu beşliyle ya da eksik biçimiyle verir, Kürdî yeden olur. Uşşak'ta Segâh perdesinde bu çeşniyle kalmak için Hüseynî'ye koma bemolü getirmek gerekir.",
      "It is built on the Segâh perde and its upper notes change. With Acem instead of Evç it becomes the incomplete Segâh pentachord, S T K S; with Hüseynî instead of Dik Hisar, a Ferahnâk pentachord (S T T K; with Acem, S T T B). Makam Segâh makes its final with this pentachord or its incomplete form, with Kürdî as the leading tone. To stop on Segâh with this çeşni in Uşşak, Hüseynî needs a comma flat.") },
  { name:L("Hüzzam beşlisi", "Hüzzam pentachord"), on:"Segâh", cs:[17, 22, 31, 36, 48], core:5,
    note:L("Segâh beşlisinden farkı dördüncü sesidir: Dik Hisar yerine Hisar gelir, son aralık artık ikili olur. Hisar çok değişken bir perdedir; yazılı değerinden 1–1,5 koma dik basılır, Hisar–Evç aralığı da 12 değil yaklaşık 10,5–11 koma kalır. Hüzzam tam kararını mutlaka bu beşliyle, genellikle Kürdî yedenle verir. Karcığar, Sûzinak ve Hicazkâr'da Segâh'ta hüzzamlı asma karar yapılır.",
      "It differs from the Segâh pentachord in its fourth note: Hisar instead of Dik Hisar, which makes the last interval an augmented second. Hisar is a very changeable perde: it is played 1–1.5 commas above its written value, so Hisar–Evç comes to about 10.5–11 commas, not 12. Hüzzam must end with this pentachord, usually with Kürdî as the leading tone. Karcığar, Sûzinak and Hicazkâr make asma kararlar on Segâh with Hüzzam.") },
  { name:L("Saba dörtlüsü", "Saba tetrachord"), on:"Dügâh", cs:[9, 17, 22, 27],
    note:L("Öteki dörtlüler 22 koma iken bu 18 komadır: Dügâh, Segâh, Çargâh ve Hicaz'dan oluşan bir eksik dörtlü. Dördüncü sesi Hicaz, seyir sırasında 2–2,5 koma dik basılır; notada bunun işareti yoktur. Saba tam kararını Dügâh'ta bu çeşniyle verir. Bütün seyrin ekseni ise Çargâh'tır: yarım karar orada Zirgüleli Hicaz çeşnisiyle yapılır.",
      "The other tetrachords span 22 commas, this one 18: an incomplete tetrachord of Dügâh, Segâh, Çargâh and Hicaz. Its fourth note, Hicaz, is played 2–2.5 commas high during the seyir; notation has no sign for this. Saba makes its final on Dügâh with this çeşni. The axis of the whole seyir, though, is Çargâh, where the half cadence comes with Zirgüleli Hicaz.") },
  { name:L("Nikriz beşlisi", "Nikriz pentachord"), on:"Rast", cs:[0, 9, 14, 26, 31], core:5,
    note:L("İlk dört sesi tam değil, 26 komalık bir artık dörtlüdür; beşli de tanini değil S eklenerek tamamlanır. Dügâh'tan yukarısı bir Hicaz dörtlüsüdür, Nikriz'in Hicaz ailesine yakınlığı buradan gelir. Hicaz ailesi makamlarında Rast perdesine düşülünce Nikriz çeşnili asma karar yapılır.",
      "Its first four notes span not a perfect fourth but an augmented one of 26 commas, and the pentachord is completed with S, not a tanini. From Dügâh up it is a Hicaz tetrachord, which is why Nikriz is so close to the Hicaz family. In the Hicaz family, dropping to the Rast perde brings an asma karar with Nikriz.") }
];
// Çeşninin makamlarda geçtiği yerler: aralıkları makamın çıkış ya da iniş dizisinde art arda geçiyorsa makam, başladığı perdeyle
// yazılır. Elle yazılmış liste yok; makam dizileri değişirse liste de değişir. Sonuç: [{ c, mks:[ad, ...] }], pesten tize.
function cesniYerleri(x){
  const steps = cs => cs.slice(1).map((c, i) => c - cs[i]);
  const main = steps(x.cs.slice(0, x.core || 4)), forms = [main, ...(x.alt || [])];
  const by = new Map();
  for(const mk of MAKAMS) for(const sc of [mk.asc, mk.desc]) for(let i = 0; i + main.length < sc.length; i++){
    const got = steps(sc.slice(i, i + main.length + 1)).join(), f = forms.find(p => p.join() === got);
    if(!f) continue;
    const name = mk.name + (f === main ? "" : ` (${f.map(d => TH_IV[d]).join(" ")})`);
    if(!by.has(sc[i])) by.set(sc[i], []);
    if(!by.get(sc[i]).includes(name)) by.get(sc[i]).push(name);
  }
  return [...by].sort((a, b) => a[0] - b[0]).map(([c, mks]) => ({ c, mks }));
}
// Aralık tablosu: ad, harf, koma, örnek perde çifti
const TH_INTERVALS = [
  ["Koma", "F", 13, 14], ["Bakiye", "B", 9, 13], [L("Küçük mücenneb", "Küçük mücenneb"), "S", 17, 22],
  [L("Büyük mücenneb", "Büyük mücenneb"), "K", 9, 17], [L("Tanini (tam ses)", "Tanini (whole tone)"), "T", 0, 9], [L("Artık ikili", "Augmented second"), "A", 14, 26]
];
const TH_MAKAMS = ["rast", "ussak", "huseyni", "hicaz", "nihavend", "kurdi", "saba", "segah", "huzzam"];
const TH_USULS = ["semai", "sofyan", "turkaksagi", "aksak"];
const TH_SEYIR = { cikici:L("Çıkıcı", "Ascending"), inici:L("İnici", "Descending"), "inici-cikici":L("İnici-çıkıcı", "Descending-ascending") };

TRAINERS.teori = function(ctx){
  const { SK, $, store, nn, esc, sleep, commaFreq, droneOn } = ctx;
  const P = $("pp-teori");
  P.innerHTML = `
    <p class="pdesc">${L("Türk müziği teorisinin temelleri, Sol klarnetçinin gözüyle: dizek, nota değerleri, koma ve aralıklar, perdeler, çeşniler, makam yapısı, usul ve transpozisyon. Her konuda dinlenebilen nota örnekleri ve sonda üç soruluk küçük bir sınav var.",
      "The basics of Turkish music theory, from a G clarinettist's point of view: the staff, note values, commas and intervals, perdes, çeşnis, how a makam works, usul and transposition. Each topic has notation you can listen to and a short three-question quiz at the end.")}</p>
    <div class="lsgrid thgrid">
      <div class="lsside"><nav class="lslist" id="thlist" aria-label="${L("Konular", "Topics")}"></nav></div>
      <div class="lsbody thbody" id="thbody"></div>
    </div>`;
  const grid = P.querySelector(".thgrid");
  const prog = store.get("teori.prog", {});        // { konu: en iyi doğru sayısı }
  let cur = TH_TOPICS.find(t => t.id === store.get("teori.cur", "")) || TH_TOPICS[0];
  let answers = {}, mk = makamById(store.get("teori.makam", "ussak")) || makamById("ussak"), token = null;
  const exs = [];                                  // açık konunun nota örnekleri (data-ex sırası)

  // ---- Ses ----
  function halt(){ token = null; SK.stopSound(); P.querySelectorAll(".thplay[aria-pressed='true']").forEach(b => b.setAttribute("aria-pressed", "false")); }
  // notes: drawScore notaları; beat: vuruş (ms). btn çalarken basılı görünür, yeniden basınca durur.
  async function playNotes(notes, beat, btn, freqOf){
    if(btn && btn.getAttribute("aria-pressed") === "true"){ halt(); return; }
    halt();
    const my = token = {};
    if(btn) btn.setAttribute("aria-pressed", "true");
    for(const n of notes){
      if(token !== my) return;
      const ms = n.d*beat;
      if(n.rest){ SK.stopSound(); await sleep(ms); continue; }
      SK.play(n.w, freqOf ? freqOf(n) : n.c !== null ? commaFreq(n.c) : undefined);
      await sleep(ms*0.88); if(token !== my) return;
      SK.stopSound(); await sleep(ms*0.12);
    }
    if(token === my){ token = null; if(btn) btn.setAttribute("aria-pressed", "false"); }
  }
  const playBtn = (attrs, label) => `<button class="stopbtn thplay" type="button" aria-pressed="false" ${attrs}>${label}</button>`;

  // ---- Liste ----
  const best = id => prog[id] || 0;
  function renderList(){
    $("thlist").innerHTML = TH_TOPICS.map((t, i) => `<button type="button" class="lsitem${best(t.id) === t.quiz.length ? " done" : ""}${t === cur ? " cur" : ""}" data-t="${t.id}">
      <span><i class="lsemo" aria-hidden="true">${t.emo}</i>${i + 1}. ${esc(t.title)}</span><small>${best(t.id) === t.quiz.length ? "✓" : best(t.id) ? best(t.id) + "/" + t.quiz.length : ""}</small></button>`).join("");
  }
  $("thlist").addEventListener("click", e => { const b = e.target.closest("[data-t]"); if(b) openSub(TH_TOPICS.find(t => t.id === b.dataset.t)); });
  // Konu, Dersler'in alt sayfasıdır (dersler gibi): üst çubukta adı ve ←; telefonda konu açıkken liste gizlenir
  function openSub(t){
    const top = SK.nav.top();
    open(t);
    SK.setRoute({ ders:null });                    // adreste son açılan dersin kimliği kalmasın
    (top && top.sub ? SK.nav.replaceSub : SK.nav.pushSub)("teori:" + t.id, t.title, closeSub);
    grid.classList.add("open"); P.classList.add("thopen");
    window.scrollTo(0, 0);
  }
  function closeSub(){ halt(); grid.classList.remove("open"); P.classList.remove("thopen"); }

  // ---- Konu sayfası ----
  const exHtml = list => (list || []).map(x => { exs.push(x); const k = exs.length - 1; return `
    <figure class="thex"><div class="scorewrap" data-ex="${k}"></div>
      <figcaption>${esc(x.cap)}${playBtn(`data-play="${k}"`, L("Dinle", "Listen"))}</figcaption></figure>`; }).join("");
  const paras = list => (list || []).map(p => `<p>${p}</p>`).join("");
  function linkHtml(k){
    // Kilitli ders açılamaz (dersler sırayla açılır): kart soluk, yalnız adı görünür
    if(k.lesson){ const l = lessonById(k.lesson), on = SK.lessonOpen(k.lesson); return l ? `<button type="button" class="hcard thlink" data-lesson="${k.lesson}"${on ? "" : " disabled"}><span class="hic">${ART.icon("lessons")}</span><span><small>${L("Ders", "Lesson")}${on ? "" : L(" · kilitli", " · locked")}</small><b>${esc(pick(l.title, LANG))}</b></span></button>` : ""; }
    if(k.tab){ const t = SK.practiceTabs().find(x => x.id === k.tab); return t ? `<button type="button" class="hcard thlink" data-tab="${k.tab}"><span class="hic">${ART.icon(k.tab)}</span><span><small>${esc(t.group)}</small><b>${esc(t.name)}</b></span></button>` : ""; }
    if(k.go === "tune") return `<button type="button" class="hcard thlink" data-go="tune"><span class="hic">${ART.icon("sun")}</span><span><small>${L("Akort", "Tuner")}</small><b>${L("Perdeyi çal, sapmasını gör", "Play a perde, see how far off it is")}</b></span></button>`;
    return "";
  }
  function intervalsHtml(){
    return `<table class="thtable"><thead><tr><th>${L("Aralık", "Interval")}</th><th>${L("Harf", "Letter")}</th><th>${L("Koma", "Commas")}</th><th>${L("Örnek", "Example")}</th><th></th></tr></thead><tbody>
      ${TH_INTERVALS.map(([n, s, a, b], i) => `<tr><td>${n}</td><td class="thmono">${s}</td><td class="thmono">${b - a}</td><td>${perdeName(a)} → ${perdeName(b)}</td>
        <td>${playBtn(`data-iv="${i}" aria-label="${L("Dinle: ", "Listen: ") + esc(n)}"`, "▶")}</td></tr>`).join("")}</tbody></table>`;
  }
  const chips = (cs, k) => cs.map((c, i) => `<span class="pchip${k && c === k.durak ? " durak" : ""}${k && c === k.guclu ? " guclu" : ""}"><b>${perdeName(c)}</b><small>${nn(commaToWritten(c))}</small><i>${i ? "+" + (c - cs[i-1]) : ""}</i></span>`).join("");
  function cesniHtml(){
    return TH_CESNI.map((x, i) => `<div class="thcesni"><div class="thch"><b>${esc(x.name)}</b><span class="thmono">${thLetters(x.cs)}</span>
      <small>${L("başlangıç: ", "starts on ")}${x.on}</small>${playBtn(`data-ce="${i}"`, L("Dinle", "Listen"))}</div>
      <div class="chiprow scroll">${chips(x.cs)}</div>
      <p class="thnote">${x.note}</p>
      <div class="thwhere"><span class="label">${L("Makamlarda", "In makams")}</span>${cesniYerleri(x).map(g => `<div><b>${perdeName(g.c)}:</b> ${g.mks.map(esc).join(", ")}</div>`).join("")}</div></div>`).join("") +
      `<p class="muted small">${L("Makam listeleri uygulamadaki çıkış ve iniş dizilerinden hesaplanır: çeşninin aralıkları dizide art arda geçiyorsa makam yazılır, önündeki perde çeşninin başladığı yerdir. Dörtlüler beşli hâlleriyle birlikte sayılır. Listede olmak, çeşninin o makamın ana yapısı olduğunu göstermez.",
        "The makam lists are worked out from the app's ascending and descending scales: a makam is listed when the çeşni's intervals appear in a row, and the perde in front is where the çeşni starts. Tetrachords are counted together with their pentachord forms. Being listed does not mean the çeşni is part of the makam's main structure.")}</p>`;
  }
  function makamHtml(){
    return `<div class="mklist" id="thmk" role="radiogroup" aria-label="Makam">${TH_MAKAMS.map(id => `<button type="button" role="radio" data-mk="${id}" aria-checked="${id === mk.id}">${makamById(id).name}</button>`).join("")}</div>
      <div id="thmkbox"></div>`;
  }
  function paintMakam(){
    const box = $("thmkbox"); if(!box) return;
    box.innerHTML = `<div class="kv"><div><span class="label">Durak</span>${perdeName(mk.durak)}</div>
        <div><span class="label">${L("Güçlü", "Güçlü")}</span>${perdeName(mk.guclu)}</div>
        <div><span class="label">Yeden</span>${perdeName(mk.yeden)}</div>
        <div><span class="label">Seyir</span>${TH_SEYIR[mk.seyirType] || ""}</div></div>
      <div class="chiprow scroll">${chips(mk.asc, mk)}</div>
      <p class="seyir">${esc(seyirText(mk, LANG))}</p>
      ${(sim => sim.length ? `<p class="muted small">${L("Dizisi yakın makamlar: ", "Makams with a nearby scale: ")}${sim.map(x => x.mk.name).join(", ")}. ${L("Farklarını Dizi'de \"Makamı tanı\" bölümünde dinleyebilirsin.", "Compare them under \"Get to know the makam\" in Scale.")}</p>` : "")(similarMakams(mk, 2).slice(0, 4))}
      <div class="pbar">${playBtn('data-mkplay', L("Diziyi dinle", "Listen to the scale"))}
        <button class="stopbtn" type="button" data-mkdrone>${L("Durağı dron yap", "Drone the final")}</button>
        <button class="primary small" type="button" data-mkopen>${L("Dizi'de çalış", "Practise in Scale")}</button></div>
      <p class="muted small">${L("Alt çizgi: durak (yeşil) ve güçlü (turuncu). Küçük sayılar bir önceki perdeye uzaklık (koma).", "Underline: final (green) and güçlü (orange). Small numbers are the distance from the previous perde (commas).")}</p>`;
    $("thmk").querySelectorAll("[data-mk]").forEach(b => b.setAttribute("aria-checked", b.dataset.mk === mk.id ? "true" : "false"));
  }
  function usulHtml(){
    return TH_USULS.map(id => USULS.find(u => u.id === id)).filter(Boolean).map(u => {
      const slots = usulSlots(u);
      return `<div class="thusul"><div class="thch"><b>${esc(u.name)}</b><span class="thmono">${u.meter}</span></div>
        <div class="usrow" style="--n:${slots.length}" aria-label="${esc(u.name)}: ${slots.map(usulSyl).join(" ")}">${slots.map((s, k) =>
        `<span class="uscell ${s || "c"}"><b>${usulSyl(s)}</b><i>${k + 1}</i></span>`).join("")}</div></div>`;
    }).join("") + `<p class="muted small">${L("Koyu kutular düm, açık kutular tek, noktalar sesin sürdüğü yer. Dinlemek ve elle vurmak için Usuller'i aç.", "Dark boxes are düm, light ones tek, dots are where the sound carries on. Open Usuls to listen and tap along.")}</p>`;
  }
  function transpozHtml(){
    const ws = [0, 9, 17, 22, 31].map(commaToWritten), nm = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
    const t = SK.T || 5;
    return `<table class="thtable"><thead><tr><th>${L("Perde", "Perde")}</th><th>${L("Yazılı", "Written")}</th><th>${L("Duyulan", "Sounds")}</th></tr></thead><tbody>
      ${ws.map((w, i) => `<tr><td>${perdeName([0, 9, 17, 22, 31][i])}</td><td class="thmono">${nm(w)}</td><td class="thmono">${nm(w - 5)}</td></tr>`).join("")}</tbody></table>
      <p class="muted small">${L("Segâh iki sütunda da yazılandan 1 koma pestir.", "Segâh is one comma lower than written in both columns.")}</p>
      <div class="pbar">${playBtn("data-tr='k'", L("Klarnetin yazılı Sol4'ü", "Clarinet: written G4"))}${playBtn("data-tr='p'", L("Piyanonun Sol4'ü", "Piano: G4"))}</div>
      ${t !== 5 ? `<p class="muted small">${L("Ayarlar'da başka bir çalgı seçili: uygulama senin çalgında yazılıyı duyulandan " + t + " yarım ses tiz sayar.", "Another instrument is chosen in Settings: the app takes your written notes as " + t + " semitones above the sound.")}</p>` : ""}`;
  }
  const SECS = { intervals:intervalsHtml, cesni:cesniHtml, makam:makamHtml, usul:usulHtml, transpoz:transpozHtml };

  function quizHtml(t){
    const a = answers, right = t.quiz.filter((q, i) => a[i] === q.ok).length, done = Object.keys(a).length === t.quiz.length;
    return `<h4 class="thh">${L("Kendini dene", "Check yourself")}</h4>
      <ol class="thquiz">${t.quiz.map((q, i) => `<li><p>${esc(q.q)}</p>${q.score ? `<div class="scorewrap thqs" data-qs="${i}"></div>` : ""}
        <div class="thopts">${q.a.map((x, j) => `<button type="button" class="opt small${a[i] !== undefined ? (j === q.ok ? " right" : j === a[i] ? " wrong" : "") : ""}" data-q="${i}" data-a="${j}"${a[i] !== undefined ? " disabled" : ""}>${esc(x)}</button>`).join("")}</div>
        ${a[i] !== undefined ? `<p class="fb ${a[i] === q.ok ? "good" : "bad"}">${a[i] === q.ok ? L("Doğru. ", "Right. ") : L("Doğrusu: ", "Answer: ") + esc(q.a[q.ok]) + ". "}${esc(q.why)}</p>` : ""}</li>`).join("")}</ol>
      ${done ? `<div class="thres"><b>${right}/${t.quiz.length}</b> ${right === t.quiz.length ? L("— tamam!", "— well done!") : ""}
        <button class="stopbtn" type="button" data-qreset>${L("Yeniden dene", "Try again")}</button>
        ${TH_TOPICS.indexOf(t) < TH_TOPICS.length - 1 ? `<button class="primary small" type="button" data-next>${L("Sonraki konu", "Next topic")}</button>` : ""}</div>` : ""}`;
  }
  // Örnek çizimi: ölçüsüz dizilerde ölçü çizgisi yok; notalar anahtara ve ölçü rakamlarına değmesin diye biraz sağa kayar
  function draw(el, notes, o = {}){
    const { svg } = drawScore(el, notes, o.meter ? o : { ...o, barAfter:new Set() });
    const vb = svg.viewBox.baseVal, dx = 12;
    svg.setAttribute("viewBox", `0 0 ${vb.width + dx} ${vb.height}`);
    svg.setAttribute("width", +svg.getAttribute("width") + dx);
    svg.querySelectorAll("line.sl").forEach(l => l.setAttribute("x2", +l.getAttribute("x2") + dx));
    svg.querySelectorAll("g.sn").forEach(g => g.setAttribute("transform", `translate(${dx} 0)`));
    svg.querySelectorAll("line.barl").forEach(l => { l.setAttribute("x1", +l.getAttribute("x1") + dx); l.setAttribute("x2", +l.getAttribute("x2") + dx); });
  }
  function paintQuiz(){
    const box = $("thq"); if(!box) return;
    box.innerHTML = quizHtml(cur);
    box.querySelectorAll("[data-qs]").forEach(el => draw(el, cur.quiz[+el.dataset.qs].score));
  }

  function open(t){
    halt();
    cur = t; answers = {}; exs.length = 0;
    store.set("teori.cur", t.id);
    const i = TH_TOPICS.indexOf(t);
    $("thbody").innerHTML = `
      <div class="eyebrow">${t.emo} ${L("Müzik teorisi", "Music theory")} · ${i + 1}/${TH_TOPICS.length}</div>
      <h3 class="lstitle">${esc(t.title)}</h3>
      ${paras(t.text)}
      ${t.list ? `<ul class="thlist">${t.list.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}
      ${t.sec === "transpoz" ? "" : exHtml(t.ex)}
      ${t.sec ? `<div class="thsec">${SECS[t.sec]()}</div>` : ""}
      ${t.sec === "transpoz" ? exHtml(t.ex) : ""}
      ${paras(t.text2)}${exHtml(t.ex2)}
      ${t.links.length ? `<h4 class="thh">${L("Çalışarak pekiştir", "Put it into practice")}</h4><div class="hcards thlinks">${t.links.map(linkHtml).join("")}</div>` : ""}
      <div id="thq"></div>`;
    $("thbody").querySelectorAll("[data-ex]").forEach(el => {
      const x = exs[+el.dataset.ex];
      draw(el, x.notes, { meter:x.meter, names:x.names, base:x.names ? 0 : undefined });
    });
    if(t.sec === "makam") paintMakam();
    paintQuiz();
    renderList();
  }

  // ---- Olaylar ----
  $("thbody").addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b || b.disabled) return;
    const d = b.dataset;
    if(d.play !== undefined){ const x = exs[+d.play]; playNotes(x.notes, x.beat, b); }
    else if(d.iv !== undefined){ const [, , a, c] = TH_INTERVALS[+d.iv]; playNotes([a, c, a, c].map(v => thP(v)), 600, b); }
    else if(d.ce !== undefined){ const cs = TH_CESNI[+d.ce].cs; playNotes([...cs, ...cs.slice(0, -1).reverse()].map(v => thP(v)), 480, b); }
    else if(d.mk){ halt(); mk = makamById(d.mk); store.set("teori.makam", mk.id); paintMakam(); }
    else if(d.mkplay !== undefined) playNotes([...mk.asc, ...[...mk.desc].reverse().slice(1)].map(v => thP(v)), 480, b, n => ctx.mkFreq(mk, n.c));
    else if(d.mkdrone !== undefined) droneOn(mk.durak);
    else if(d.mkopen !== undefined){ halt(); SK.openMakam(mk.id); }
    else if(d.tr === "k") playNotes([thW(67, 3)], 600, b);
    else if(d.tr === "p") playNotes([thW(67, 3)], 600, b, () => midiToFreq(67));
    else if(d.lesson){ halt(); SK.openLesson(d.lesson); }
    else if(d.tab){ halt(); SK.nav.open(d.tab); }
    else if(d.go){ halt(); SK.go(d.go); }
    else if(d.q !== undefined && answers[+d.q] === undefined){
      answers[+d.q] = +d.a;
      if(Object.keys(answers).length === cur.quiz.length){
        const right = cur.quiz.filter((q, i) => answers[i] === q.ok).length;
        if(right > best(cur.id)){ prog[cur.id] = right; store.set("teori.prog", prog); renderList(); }
      }
      paintQuiz();
    }
    else if(d.qreset !== undefined){ answers = {}; paintQuiz(); }
    else if(d.next !== undefined) openSub(TH_TOPICS[TH_TOPICS.indexOf(cur) + 1]);
  });

  // Konu ilk gösterimde çizilir (bağlantı kartları practice.js'in kurulumu bitince var olan SK.practiceTabs'ı kullanır)
  renderList();
  return {
    enter(){ if(!$("thbody").firstChild) open(cur); },
    nowTitle: () => cur.title,
    stop: halt,
    leave: halt
  };
};
