// Çalışma bölümünün kabuğu: sekme menüsü, usullü metronom ve durak sesi (dron), her zaman çalışan ölçümler
// (entonasyon, pratik süresi, vibrato, glissando) ve sekmelere verilen ortak yardımcılar (ctx).
// Sekmeler drills.js, trainers.js, pieces.js ve lessonview.js'te; mikrofon ve ses index.html'deki window.SK üzerinden.
(function(){
  const SK = window.SK;
  if(!SK) return;
  const $ = id => document.getElementById(id);
  const store = SK.store, T = SK.T;
  const nn = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
  const num = (v, d=1) => v.toFixed(d).replace(".", ",");
  const sgn = (v, d=1) => { const r = Math.round(v*10**d)/10**d; return (r>0 ? "+" : r<0 ? "−" : "±") + num(Math.abs(r), d); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const commaFreq = c => midiToFreq(commaToMidi(c) - T);
  // Seçili akortta (AEU / icra) bir makam perdesinin hedefi ve sesi
  const tgt = (mk, c) => perdeTarget(mk, c, SK.tuningMode());
  const mkFreq = (mk, c) => commaFreq(tgt(mk, c));
  const perdeOf = w => { const p = nearestPerde((w-67)*53/12); return p ? p.name : ""; };
  const label = w => nn(w) + (perdeOf(w) ? " · " + perdeOf(w) : "");
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ---- İskelet ----
  // Alıştırmalar beş gruba ayrılır. Çalışma bir ana sayfayla açılır: bütün alıştırmalar gruplu kartlar halinde,
  // tek dokunuşla açılır. Alıştırma ekranında üstte geri düğmesi ve grubun diğer alıştırmaları (alt sekmeler) durur.
  // Dersler grubu (Dersler, Yol haritası, Videolar) alt menüdeki Dersler düğmesiyle açılan ayrı bir sayfadır: ana sayfada
  // kart olarak görünmez, geri düğmesi yoktur. Mantığı ve verisi lessons.js'te
  const TABS = [["lessons","Dersler"],["roadmap",L("Yol haritası", "Roadmap")],["quiz","Parmak testi"],["gorbas",L("Gör ve bas", "See & press")],["staffmap",L("Dizek haritası", "Staff map")],["tablo",L("Parmak tablosu", "Fingering chart")],["desifre",L("Deşifre", "Sight-reading")],["long","Uzun ton"],["rhythm",L("Ritim", "Rhythm")],["hiz",L("Hız", "Speed")],["susleme",L("Süsleme", "Ornaments")],
                ["makam",L("Dizi", "Scale")],["mimic","Taklit"],["seyir",L("Seyir", "Seyir")],["ear",L("Kulak", "Ear")],["dikte",L("Dikte", "Dictation")],
                ["archive",L("Nota arşivi", "Score archive")],["piece",L("Etüt ve eserler", "Études & pieces")],["band",L("Eşlik", "Play-along")],["kulaktan",L("Kulaktan çıkar", "Learn by ear")],["convert",L("Çevir", "Convert")],["rec","Kayıt"],["videos",L("Videolar", "Videos")],["progress","İlerleme"]];
  const GROUPS = [["lessons","Dersler",["lessons","roadmap","videos"]],
                  ["tech",L("Teknik", "Skills"),["quiz","gorbas","staffmap","tablo","desifre","long","rhythm","hiz","susleme"]],
                  ["makam","Makam",["makam","mimic","seyir","ear","dikte"]],
                  ["pieces",L("Eserler", "Pieces"),["archive","piece","band","kulaktan","convert","rec"]],
                  ["progress","İlerleme",["progress"]]];
  const groupOf = id => GROUPS.find(g => g[2].includes(id));
  const isLesson = id => GROUPS[0][2].includes(id);
  const tabName = id => TABS.find(t => t[0] === id)[1];
  // Ana sayfa kartlarındaki kısa açıklamalar
  const BLURB = {
    lessons: L("Adım adım dersler, mikrofonla değerlendirilir", "Step-by-step lessons, checked with the microphone"),
    roadmap: L("Sıfırdan ustalığa altı aşama: neredesin, ne kaldı?", "Six stages from zero to mastery: where are you, what's left?"),
    desifre: L("Görmediğin notayı ilk seferde çal", "Play music you've never seen, first time"),
    dikte: L("Duyduğun ritmi ve ezgiyi yaz", "Write down the rhythm and tune you hear"),
    band: L("Darbuka, bas ve udla birlikte çal", "Play with darbuka, bass and oud"),
    kulaktan: L("Usta kaydını yavaşlat, döngüye al, çıkar", "Slow down, loop and learn a master's recording"),
    quiz: L("Notaları ve parmakları ezberle: çal, bul, oku", "Memorise notes and fingerings: play, find, read"),
    gorbas: L("Notayı gör, parmağı bas: adını düşünmeden", "See the note, press the fingering: no naming"),
    staffmap: L("Hangi nota dizekte nerede: Si4 mü, Si5 mi?", "Where each note sits: B4 or B5?"),
    tablo: L("Bütün parmaklar tek bakışta; tek sayfa PDF indir", "Every fingering at a glance; download a one-page PDF"),
    long: L("Bir notayı düz ve temiz tut", "Hold a note steady and clean"),
    rhythm: L("Metronomla zamanında çal", "Play in time with the metronome"),
    hiz: L("Gam, arpej, dizi: tempo merdiveniyle hızlan", "Scales, arpeggios: speed up with the tempo ladder"),
    susleme: L("Çarpma, mordan, tril, kayış: ölçülerek", "Grace notes, mordents, trills, slides: measured"),
    makam: L("Makam dizisini çık ve in", "Play the makam scale up and down"),
    mimic: L("Duyduğun ezgiyi tekrar çal", "Play back the phrase you hear"),
    seyir: L("Serbest çal, seyrini gör", "Play freely, see your seyir"),
    ear: L("Koma farklarını ve aralıkları duymayı öğren", "Learn to hear commas and intervals"),
    archive: L("2200 eser: ara, dinle, yavaşlat, birlikte çal", "2200 pieces: search, listen, slow down, play along"),
    piece: L("Etütleri ve kendi eserlerini çal", "Play études and your own pieces"),
    convert: L("PDF, resim ya da sesten esere", "From a PDF, picture or recording to a piece"),
    rec: L("Kaydet, dinle, sapmaları gör", "Record, listen, see deviations"),
    videos: L("Hocalardan makam, teknik ve süsleme videoları", "Makam, technique and ornament videos by masters"),
    progress: L("Çalışma süren ve gelişimin", "Your practice time and progress")
  };
  // "Nasıl kullanılır?" notları: ne işe yarar, adım adım nasıl çalışılır. Alıştırma açılınca başlığın altında
  // katlanmış durur. Metronom ve dron notları kendi ayar kutularında.
  const HUB_HELP = L(`<p><b>Hepsini bilmen gerekmiyor.</b> Her gün alt menüdeki <b>Dersler</b>'i sırayla takip et; dersler gereken alıştırmayı
      zamanı gelince kendisi açar. Buradaki kartlar bir konuyu ayrıca çalışmak içindir.</p>
    <p>Bir karta dokun, alıştırma açılır. Üstteki sekmeler aynı gruptaki diğer alıştırmalardır; “‹ Çalışma” ana sayfaya döner.
      Çoğu alıştırma mikrofon ister: sağ üstteki <b>Mikrofon</b>'a bas. Her alıştırmanın başında kendi “Nasıl kullanılır?” notu var.</p>
    <p><b>Kısa yol haritası:</b></p>
    <ol><li>Her gün Dersler → Bugünün çalışması. Nerede olduğunu Yol haritası gösterir.</li>
      <li>Bir nota hep pes ya da tiz çıkıyorsa Uzun ton, sonra Kayıt ile kendini dinle.</li>
      <li>Parmaklar yavaşsa Hız.</li>
      <li>Makamı oturtmak için Dizi → Taklit → Seyir.</li>
      <li>Oyun havası için Eşlik'te darbukayla çal; ustaları Kulaktan çıkar ile yavaşlatıp dinle.</li></ol>`,
    `<p><b>You don't need all of them.</b> Follow <b>Lessons</b> in the bottom menu in order every day; lessons open the exercise you need when it's time.
      The cards here are for working on one topic on its own.</p>
    <p>Tap a card to open the exercise. The tabs at the top are the other exercises in the same group; “‹ Practice” goes back.
      Most exercises need the microphone: tap <b>Microphone</b> at the top right. Each exercise has its own “How to use” note.</p>
    <p><b>A simple route:</b></p>
    <ol><li>Every day: Lessons → Today's practice. The Roadmap shows where you are.</li>
      <li>If a note keeps coming out flat or sharp: Long tone, then listen to yourself with Recording.</li>
      <li>If your fingers are slow: Speed.</li>
      <li>To settle a makam: Scale → Mimic → Seyir.</li>
      <li>For dance tunes, play with the darbuka in Play-along; slow masters down in Learn by ear.</li></ol>`);
  const HELP = {
    roadmap: L(`<p><b>Ne işe yarar:</b> Uzun yolu görmek: sıfırdan ustalığa altı aşama, her birinde dersler ve ölçülen kilometre taşları.</p>
      <ol><li>Üstte hedef tarzını seç: oyun havaları seçersen Trakya ve Roman aşaması makamlardan önce gelir.</li>
        <li>“Bu hafta” kaç gün hedefine ulaştığını, “Bu haftanın odağı” sıradaki dersi ve eksik ilk kilometre taşını gösterir.</li>
        <li>Bir kilometre taşına dokun: ilgili alıştırma açılır. Taşlar oradaki en iyi sonucundan hesaplanır.</li>
        <li>Tahmin son dört haftadaki hızına göredir; yeterli veri yoksa haftada 5 gün, günlük hedef kadar çalışacağın varsayılır.</li></ol>`,
      `<p><b>What it's for:</b> seeing the long road: six stages from zero to mastery, each with lessons and measured milestones.</p>
      <ol><li>Choose your goal style at the top: with dance tunes, the Thracian and Roman stage comes before the makams.</li>
        <li>“This week” shows how many days you reached your goal; “This week's focus” shows the next lesson and the first missing milestone.</li>
        <li>Tap a milestone to open its exercise. Milestones come from your best result there.</li>
        <li>The estimate uses your pace over the last four weeks; without enough data it assumes 5 days a week at your daily goal.</li></ol>`),
    desifre: L(`<p><b>Ne işe yarar:</b> Notayı ilk görüşte okuyup çalmak (deşifre).</p>
      <ol><li>Seviyeyi seç: 1 ve 2 Batı notaları, 3 ve 4 makam perdeleri ve aksak ölçüler.</li>
        <li>“Yeni ezgi”ye bas. İnceleme süresi boyunca notaya bak; süre bitince bir ölçü sayım çalar, sonra tempoda çal.</li>
        <li>Durma, geri dönme: yanlışı geç, tempoyu tut. Bitince doğru nota oranı görünür ve “Doğrusunu dinle” açılır.</li>
        <li>Bir seviyede üç tur üst üste %80'i geçince sonrakine geç.</li></ol>`,
      `<p><b>What it's for:</b> reading and playing music at first sight.</p>
      <ol><li>Choose a level: 1 and 2 are Western notes, 3 and 4 makam perdes and limping metres.</li>
        <li>Press “New tune”. Look at the score during the preview; then a one-bar count-in plays and you play in tempo.</li>
        <li>Don't stop or go back: let mistakes go and keep the tempo. Afterwards you see the share of correct notes and “Hear it” unlocks.</li>
        <li>Move up after 80% three rounds in a row.</li></ol>`),
    dikte: L(`<p><b>Ne işe yarar:</b> Duyduğunu notaya dökmek: kulaktan çalmanın ve kulaktan çıkarmanın temeli.</p>
      <ol><li><b>Ritim:</b> bir ölçü sayımdan sonra kısa bir ritim çalar; dört nota arasından duyduğunu seç.</li>
        <li><b>Ezgi:</b> makamdan kısa bir ezgi çalar; ilk nota verilir. Kalan notaları sırayla perde düğmelerinden seç ya da mikrofon açıkken klarnetle çal.</li>
        <li>“Tekrar dinle” istediğin kadar çalar. Yanlışta doğrusu dizekte gösterilir.</li></ol>`,
      `<p><b>What it's for:</b> writing down what you hear: the basis of playing and learning by ear.</p>
      <ol><li><b>Rhythm:</b> after a one-bar count-in a short rhythm plays; pick it from four scores.</li>
        <li><b>Melody:</b> a short makam tune plays; the first note is given. Pick the rest in order from the perde buttons, or play them on the clarinet with the mic on.</li>
        <li>“Listen again” replays as often as you like. When wrong, the answer is shown on the staff.</li></ol>`),
    band: L(`<p><b>Ne işe yarar:</b> Darbuka, bas ve udla birlikte çalmak: oyun havasını usule oturtmanın en hızlı yolu.</p>
      <ol><li>Usulü (Roman havası, karşılama, çiftetelli, kasap, Rumeli ya da klasik usuller) ve makamı seç; tempo usulün birimidir (9/8'de sekizlik).</li>
        <li>Başlat'a bas; grup döngüde çalar. Üstüne etüdü, bildiğin bir havayı ya da doğaçlamanı çal. “Akor değişsin” bası ve udu durak ile güçlü arasında gezdirir.</li>
        <li><b>Grup beni izlesin</b> açıkken grup senin temponu izler (yavaş yavaş hızlanır ya da yavaşlar), sen susunca bekler ve yeniden çaldığın ilk notayla girer.</li>
        <li><b>Taksimle başla:</b> grup yalnızca dem tutar. Taksimini durakta uzun bir notayla bitir, nefes al ve oyun havasına gir: grup ilk notanla birlikte girer. Hemen girmesi için <b>Gir</b>'e bas.</li>
        <li>Mikrofon açıksa ve “değerlendir” seçiliyse durdurunca usule oturma yüzden ve seyir puanı görünür.</li>
        <li>Kulaklık kullan ya da Ayarlar'da Hoparlör modunu aç: mikrofon grubu değil seni duysun. Etüt ve eserlerde ve nota arşivinde de “orkestra” eşliği var.</li></ol>`,
      `<p><b>What it's for:</b> playing with darbuka, bass and oud: the fastest way to get a dance tune into the groove.</p>
      <ol><li>Pick the usul (Roman havası, karşılama, çiftetelli, kasap, Rumeli or a classical usul) and the makam; the tempo counts the usul's unit (eighths in 9/8).</li>
        <li>Press Start; the band loops. Play an étude, a tune you know or improvise on top. “Chord changes” moves bass and oud between the tonic and the dominant.</li>
        <li>With <b>Band follows me</b> on, the band tracks your tempo (gradually speeding up or slowing down), waits when you go quiet and comes back in with your next note.</li>
        <li><b>Start with a taksim:</b> the band only holds a drone. End your taksim with a long note on the tonic, take a breath and start the dance tune: the band comes in with your first note. Press <b>Enter</b> to bring it in at once.</li>
        <li>With the mic on and “assess” ticked, stopping shows how well you sat in the groove and a seyir score.</li>
        <li>Use headphones or Speaker mode in Settings so the mic hears you, not the band. Études & pieces and the score archive also have a “band” accompaniment.</li></ol>`),
    kulaktan: L(`<p><b>Ne işe yarar:</b> Usta kayıtlarından kulakla öğrenmek (Trakya ve Roman geleneğinde asıl öğrenme yolu).</p>
      <ol><li>“Ses / video dosyası aç” ile telefondaki kaydı seç (MP3, M4A, WAV, MP4…). Dosya cihazdan çıkmaz.</li>
        <li>Dalga biçimine dokun: oradan çalar. Parmağını sürükle: o bölge seçilir ve döngüye girer. A ve B düğmeleri de çalan yerden seçer.</li>
        <li>Hızı düşür (%50 iyi bir başlangıç): perde değişmez. Kayıt başka ahenkteyse “Perde” ve “İnce ayar” ile klarnetine uydur.</li>
        <li>Alttaki şerit çalan yerin perdesini yazar. İşaret koyarak cümleleri ayır; “Seçili bölgeyi notaya dök” notayı Çevir'de açar.</li></ol>`,
      `<p><b>What it's for:</b> learning by ear from masters' recordings (the real way of learning in the Thracian and Roman tradition).</p>
      <ol><li>Use “Open an audio / video file” to choose a recording on your phone (MP3, M4A, WAV, MP4…). The file never leaves the device.</li>
        <li>Tap the waveform to play from there. Drag to select a passage; it loops. The A and B buttons select from the playing position too.</li>
        <li>Lower the speed (50% is a good start): the pitch stays the same. If the recording is in another key, match your clarinet with “Pitch” and “Fine”.</li>
        <li>The strip below shows the perde being played. Add markers to split phrases; “Turn the selection into notes” opens the notes in Convert.</li></ol>`),
    lessons: L(`<p><b>Ne işe yarar:</b> Sıfırdan ileri seviyeye adım adım 77 ders. Her ders birkaç adımdır: oku, dinle, çal.</p>
      <ol><li>Üstteki “Bugünün çalışması” o gün ne çalışacağını söyler; oradan başla.</li>
        <li>Bir derse dokun, adımları sırayla geç. Dinleme adımında önce örneği dinle.</li>
        <li>Çalma adımında mikrofonu aç ve çal; uygulama seni dinler, geçince sonraki adım açılır.</li>
        <li>Bir ders bitince sonraki ders açılır. Takılırsan dersi tekrar et.</li>
        <li>Bitirdiğin derslerin adımları “Tekrar” olarak birkaç gün sonra günlük plana geri gelir. Ünitenin bütün dersleri bitince sonundaki ünite sınavı açılır; geçince rozet kazanırsın.</li></ol>`,
      `<p><b>What it's for:</b> 77 step-by-step lessons from zero to advanced. Each lesson has a few steps: read, listen, play.</p>
      <ol><li>“Today's practice” at the top tells you what to work on today; start there.</li>
        <li>Tap a lesson and go through its steps. On listening steps, listen to the example first.</li>
        <li>On playing steps, turn on the microphone and play; the app listens and opens the next step when you pass.</li>
        <li>Finishing a lesson unlocks the next one. If you get stuck, repeat the lesson.</li>
        <li>Steps from lessons you've finished come back as “Review” in the daily plan a few days later. When all lessons of a unit are done, its unit test opens; pass it to earn a badge.</li></ol>`),
    quiz: L(`<p><b>Ne işe yarar:</b> Notaları ve parmakları ezberlemek.</p>
      <ol><li>Bir mod seç: <b>Çal</b> (istenen notayı çal), <b>Bul</b> (şemadaki parmak hangi nota, seç ya da çal),
        <b>Oku</b> (dizekteki notayı adını görmeden çal).</li>
        <li>Bölgeyi seç (önce pes notalar) ve “20 soruluk tur başlat”a bas.</li>
        <li>Zorlandığın notalar daha sık gelir. Bir bölgede son 20 cevabın %80'i doğruysa sonraki bölge açılır.</li></ol>`,
      `<p><b>What it's for:</b> memorising notes and fingerings.</p>
      <ol><li>Pick a mode: <b>Play</b> (play the requested note), <b>Identify</b> (which note is this fingering; pick or play it),
        <b>Read</b> (play the note on the staff without seeing its name).</li>
        <li>Choose a region (low notes first) and tap “Start a 20-question round”.</li>
        <li>Notes you struggle with come up more often. 80% correct in the last 20 answers unlocks the next region.</li></ol>`),
    gorbas: L(`<p><b>Ne işe yarar:</b> Dizekteki notayı görünce parmakların kendiliğinden gitsin diye. Nota adını aklından geçirmeden yerinden parmağa gitmeyi alıştırır.</p>
      <ol><li>Cevap yolunu seç: <b>Klarnetle çal</b> (mikrofon açılır) ya da klarnet elinde değilse <b>Ekranda bas</b> (şemadaki deliklere dokun).</li>
        <li>Üç notayla başlar. Yeni nota önce adıyla ve soluk parmağıyla gelir; doğru buldukça önce ad, sonra parmak gizlenir, en sonda parmak ancak birkaç saniye bekleyince çıkar.</li>
        <li>Hız da sayılır: çalarak 1,5 sn, ekranda 3 sn içinde bulmak “hızlı”dır. Açık notaların hepsini art arda hızlı bulunca yeni bir nota eklenir.</li>
        <li>Yanlışta doğru parmak gösterilir; bir kez doğru kurup geçersin. Günde 5 dakika yeter.</li></ol>`,
      `<p><b>What it's for:</b> making your fingers move by themselves when you see a note. It trains going from staff position to fingering without naming the note.</p>
      <ol><li>Choose how to answer: <b>Play clarinet</b> (turns on the microphone) or, without your clarinet, <b>Tap on screen</b> (tap the holes on the chart).</li>
        <li>It starts with three notes. A new note first comes with its name and a faded fingering; as you get it right, first the name, then the fingering is hidden, and at the end the fingering only shows after a few seconds.</li>
        <li>Speed counts too: within 1.5 s playing or 3 s on screen is “fast”. When you find every open note fast several times in a row, a new note is added.</li>
        <li>After a mistake the right fingering is shown; build it once and move on. Five minutes a day is enough.</li></ol>`),
    staffmap: L(`<p><b>Ne işe yarar:</b> Hangi notanın porte üzerinde nerede durduğunu öğrenmek.</p>
      <ol><li>Bir notaya dokun: sesini duyarsın, parmağını görürsün.</li>
        <li>Mikrofon açıkken çal: çaldığın nota haritada yanar.</li>
        <li>Notanın yanındaki sayı oktavdır ve her Do'da bir artar: Si4'ten sonra Do5 gelir.</li></ol>`,
      `<p><b>What it's for:</b> learning where each note sits on the staff.</p>
      <ol><li>Tap a note: you hear it and see its fingering.</li>
        <li>With the microphone on, play: the note you play lights up on the map.</li>
        <li>The number is the octave; it goes up at every C: after B4 comes C5.</li></ol>`),
    tablo: L(`<p><b>Ne işe yarar:</b> Bütün notaların parmağını bir arada görüp ezberlemek.</p>
      <ol><li>Notalar register'a göre üç bölümde: Chalumeau (pes), Klarino (register basılı), Altissimo (tiz). Her notada temel parmak çizili; “+2 alt” o notanın alternatif parmak sayısıdır (Parmak ekranında).</li>
        <li>Bir notaya dokun: sesini duyarsın. Mikrofon açıkken çaldığın nota tabloda yanar.</li>
        <li><b>Tek sayfa indir</b> bütün tabloyu A4 bir PDF yapar; yazdırıp çalgının yanına koy, bakarak çal, sonra bakmadan dene. PNG telefonda resim olarak saklamak içindir.</li></ol>`,
      `<p><b>What it's for:</b> seeing every note's fingering together and memorising them.</p>
      <ol><li>Notes are in three sections by register: Chalumeau (low), Clarion (register key pressed), Altissimo (high). Each note shows its basic fingering; “+2 alt” is how many alternative fingerings it has (on the Fingering screen).</li>
        <li>Tap a note to hear it. With the microphone on, the note you play lights up.</li>
        <li><b>Download one page</b> makes the whole chart an A4 PDF; print it, keep it by your instrument, play while looking, then try without. The PNG is for keeping it as a picture on your phone.</li></ol>`),
    long: L(`<p><b>Ne işe yarar:</b> Sesi oturtmak. Bir notayı düz ve sabit tutmayı çalışırsın; temiz ses ve doğru perde buradan gelir.</p>
      <ol><li>Notayı ve hedef süreyi seç; istersen Dinle ile notayı duy. Mikrofonu aç.</li>
        <li>Başlat'a bas ve notayı süre boyunca aynı güçte, titretmeden tut.</li>
        <li>Puan: ne kadar sabit kaldığın, perdeye ne kadar yakın olduğun ve süreyi tamamlaman. Her gün birkaç uzun ton, en iyi ısınmadır.</li></ol>`,
      `<p><b>What it's for:</b> settling your sound. You practise holding a note steady; a clean sound and true pitch come from this.</p>
      <ol><li>Choose the note and the target length; tap Listen to hear the note if you like. Turn on the microphone.</li>
        <li>Tap Start and hold the note at the same strength, without wobbling, for the whole time.</li>
        <li>The score: how steady you stayed, how close to the pitch, and whether you held it to the end. A few long tones a day are the best warm-up.</li></ol>`),
    rhythm: L(`<p><b>Ne işe yarar:</b> Zamanında çalmak.</p>
      <ol><li>İlk kez kullanıyorsan önce bir kez <b>Gecikme ayarı</b>'nı yap (telefonun ses gecikmesi ölçülür; yapmazsan sonuçlar hep biraz kayık çıkar).</li>
        <li>Bir kalıp ya da usul ve tempo seç, Başlat'a bas.</li>
        <li>Bir ölçü sayımdan sonra metronomla birlikte kısa notalar çal (hangi nota olduğu önemli değil).</li>
        <li>Sonuçta isabet, erken/geç ve tutarlılık görünür. Usulde düm ve tek vuruşlarında çalarsın.</li></ol>`,
      `<p><b>What it's for:</b> playing in time.</p>
      <ol><li>If it's your first time, run <b>Latency setup</b> once (it measures your phone's audio delay; without it results are always a little off).</li>
        <li>Pick a pattern or usul and a tempo, tap Start.</li>
        <li>After a one-bar count-in, play short notes with the metronome (any note).</li>
        <li>You see accuracy, early/late and consistency. With an usul you play on its düm and tek strokes.</li></ol>`),
    hiz: L(`<p><b>Ne işe yarar:</b> Parmakları hızlandırmak: gam, arpej, makam dizisi gibi kalıplar.</p>
      <ol><li>Bir kalıp seç (makam dizisi, Batı gamı, arpej…), nota değerini ve bağlı ya da dilli çalmayı seç.</li>
        <li>İstersen başlangıç temposunu (♩) değiştir, Başla'ya bas; bir ölçü sayımdan sonra kalıbı metronomla çal.</li>
        <li>Çalış bitince sonuç görünür. Temiz çalınca tempo kendiliğinden biraz artar; iki kez üst üste zorlanırsan iner.</li>
        <li>Üç kez zorlanırsan dinlenme önerilir. En iyi temiz tempon kaydedilir ve İlerleme'de görünür.</li></ol>`,
      `<p><b>What it's for:</b> speeding up your fingers with patterns such as scales, arpeggios and makam scales.</p>
      <ol><li>Pick a pattern (makam scale, Western scale, arpeggio…), a note value and slurred or tongued.</li>
        <li>Change the start tempo (♩) if you like and tap Start; after a one-bar count-in, play the pattern with the metronome.</li>
        <li>When the run ends you see the result. A clean run raises the tempo a little; two struggling runs in a row lower it.</li>
        <li>After three struggling runs you're told to rest. Your best clean tempo is saved and shown in Progress.</li></ol>`),
    susleme: L(`<p><b>Ne işe yarar:</b> Çarpma, mordan, tril, kayarak giriş ve düşüş gibi süslemeleri doğru çalmak.</p>
      <ol><li>Bir süsleme seç; makam seçersen komşu nota o makamdan gelir.</li>
        <li>Dinle ile örneği duy, sonra Başla'ya basıp çal.</li>
        <li>Denemeden sonra perde eğrin ve ne yapman gerektiği görünür (ör. “çarpma çok uzun”). Doğru yapınca yeşil olur.</li></ol>`,
      `<p><b>What it's for:</b> playing ornaments such as grace notes, mordents, trills, slides and falls correctly.</p>
      <ol><li>Pick an ornament; if you pick a makam, the neighbour note comes from that makam.</li>
        <li>Tap Listen to hear the example, then tap Start and play.</li>
        <li>After each try you see your pitch curve and what to do (e.g. “grace note too long”). It turns green when it's right.</li></ol>`),
    makam: L(`<p><b>Ne işe yarar:</b> Bir makamın perdelerini doğru yerde çalmak.</p>
      <ol><li>Makamı seç; dizisi nota şeridinde işaretlenir (çerçeveli: dizi, dolu: durak, noktalı: güçlü).</li>
        <li>“Diziyi dinle” ile önce duy. “Durağı dron yap” durak sesini arkada sürekli çalar.</li>
        <li>“Alıştırma: çık ve in”e bas ve diziyi önce çık, sonra in. Her perdede kaç koma kaçtığın görünür.</li></ol>`,
      `<p><b>What it's for:</b> playing a makam's perdes in the right place.</p>
      <ol><li>Pick the makam; its scale is marked on the note strip (outlined: scale, filled: tonic, dotted: dominant).</li>
        <li>Hear it first with “Listen to the scale”. “Final as drone” keeps the tonic sounding in the background.</li>
        <li>Tap “Exercise: up and down” and play the scale up, then down. You see how many commas each perde was off.</li></ol>`),
    mimic: L(`<p><b>Ne işe yarar:</b> Kulakla çalmayı öğrenmek.</p>
      <ol><li>Makamı seç, Başlat'a bas: uygulama kısa bir ezgi çalar.</li>
        <li>Aynı ezgiyi klarnetle çal.</li>
        <li>Doğru çalınca ezgi bir nota uzar, yanlışta kısalır. “Tekrar dinle” ezgiyi yeniden çalar.</li></ol>`,
      `<p><b>What it's for:</b> learning to play by ear.</p>
      <ol><li>Pick a makam and tap Start: the app plays a short phrase.</li>
        <li>Play the same phrase on the clarinet.</li>
        <li>Get it right and the phrase grows by one note; get it wrong and it shrinks. “Listen again” replays it.</li></ol>`),
    seyir: L(`<p><b>Ne işe yarar:</b> Taksimde makamın yolunu (seyrini) izleyip izlemediğini görmek.</p>
      <ol><li>Makamı ve süreyi (30, 60 ya da 120 sn) seç; istersen “Durağı dron yap”. Başlat'a bas.</li>
        <li>Süre bitene kadar taksim gibi serbest çal.</li>
        <li>Uygulama hangi perdelerde ne kadar durduğunu, dizi dışına çıkıp çıkmadığını, güçlüyü vurgulayıp vurgulamadığını
          ve durakta bitirip bitirmediğini söyler.</li></ol>`,
      `<p><b>What it's for:</b> seeing whether your taksim follows the makam's path (seyir).</p>
      <ol><li>Pick the makam and a length (30, 60 or 120 s); tap “Final as drone” if you like. Tap Start.</li>
        <li>Play freely like a taksim until the time is up.</li>
        <li>The app tells you where you dwelt, whether you left the scale, whether you stressed the dominant and whether you ended on the tonic.</li></ol>`),
    ear: L(`<p><b>Ne işe yarar:</b> Koma farklarını duymayı öğrenmek. Klarnet gerekmez, kulaklık önerilir.</p>
      <ol><li><b>Aralık:</b> İki ses art arda çalar; aralığın adını seç (Batı: ikili, üçlü…; makam: bakiye, mücenneb, tanini, artık ikili).</li>
        <li><b>Tiz mi pes mi:</b> İki ses çalar; ikincisi tiz mi pes mi seç. Bildikçe fark küçülür, sonunda duyabildiğin en küçük fark görünür.</li>
        <li><b>Perde ayırt:</b> A ve B perdelerini dinle, sonra X hangisiydi seç.</li>
        <li><b>Makam tanı:</b> Kısa bir ezgi dinle, makamını seç.</li></ol>`,
      `<p><b>What it's for:</b> learning to hear comma differences. No clarinet needed; headphones help.</p>
      <ol><li><b>Interval:</b> two notes play one after the other; name the interval (Western: seconds, thirds…; makam: bakiye, mücenneb, tanini, augmented second).</li>
        <li><b>Higher or lower:</b> two notes play; choose whether the second is higher or lower. The gap shrinks as you get it right, and finally shows the smallest difference you can hear.</li>
        <li><b>Tell perdes apart:</b> listen to A and B, then say which one X was.</li>
        <li><b>Name the makam:</b> listen to a short phrase and pick its makam.</li></ol>`),
    archive: L(`<p><b>Ne işe yarar:</b> SymbTr koleksiyonundaki 2200 eseri bulup notasından çalışmak.</p>
      <ol><li>Ada, bestekâra, makama ya da usule göre ara; "Süzgeçler" ile makam, form, usul, bestekâr ve seviye seç.</li>
        <li>Esere dokun. <b>Çal</b> ile dinle, tempoyu düşür. Notaya dokununca çalma oradan başlar.</li>
        <li>Zor bir yer için <b>A–B</b>'ye bas, ilk ve son ölçüye dokun: o kısım tekrar tekrar çalar. Bölüm düğmeleri (Aranağme, Hane, Teslim…) de aynı işi yapar.</li>
        <li><b>Dem</b> karar perdesinde dron açar; <b>Eşlik</b> metronom ya da usulün düm-tek vuruşlarını ekler. <b>Melodiyi kapat</b> ile yalnız eşlik kalır, sen çalarsın.</li>
        <li>Mikrofonla: <b>Beni takip et</b> doğru notayı çaldıkça ilerler; <b>Benimle çal</b>da orkestra seni izler (ilk notanla girer, hızlanırsan hızlanır, durursan bekler); <b>Tempolu çal</b> perde ve zamanlamanı ölçer; <b>Merdiven</b> tempoyu adım adım artırır.</li>
        <li>"Görünüm ve transpoze": perde perde transpoze, oktav, nota boyutu, sözler, perde adları, notayı izle, tam ekran, yazdır.</li>
        <li>"Eseri öğren" yedi adımda dinlemeden kendin çalmaya götürür. "Eserlerime ekle" eseri Etüt ve eserler listene koyar.</li></ol>`,
      `<p><b>What it's for:</b> finding any of the 2200 pieces in the SymbTr collection and practising from the score.</p>
      <ol><li>Search by title, composer, makam or usul; use "Filters" for makam, form, usul, composer and level.</li>
        <li>Tap a piece. <b>Play</b> to listen, lower the tempo. Tapping a note starts playback there.</li>
        <li>For a hard passage press <b>A–B</b> and tap the first and last bar: it loops. Section buttons do the same.</li>
        <li><b>Drone</b> plays the tonic; <b>Accomp.</b> adds a metronome or the usul's düm-tek. <b>Mute melody</b> leaves only the accompaniment for you to play along.</li>
        <li>With the mic: <b>Follow me</b> advances as you play the right notes; in <b>Play with me</b> the band follows you (comes in with your first note, speeds up with you, waits when you stop); <b>Play in tempo</b> scores pitch and timing; <b>Ladder</b> raises the tempo step by step.</li>
        <li>"View and transpose": transpose by perde, octave, score size, lyrics, perde names, follow the score, full screen, print.</li>
        <li>"Learn the piece" takes you from listening to playing in seven steps. "Add to my pieces" puts it in Études & pieces.</li></ol>`),
    piece: L(`<p><b>Ne işe yarar:</b> Etütleri ve eserleri notadan çalmak.</p>
      <ol><li>Listeden bir etüt seç; notası dizekte görünür. Dinle ile önce duy.</li>
        <li><b>Serbest takip:</b> kendi hızında çal, doğru notada bir sonrakine geçer. <b>Tempolu çal:</b> metronomla çal, doğru nota ve zamanlama ölçülür.
          <b>Merdiven:</b> tempo temiz çaldıkça artar. <b>Benimle çal:</b> orkestra seni izler; ilk notanla girer, temponu izler, durursan bekler.</li>
        <li>Kendi ezgini nota yazıp Kaydet ile ekleyebilir ya da “MusicXML içe aktar” ile nota dosyası yükleyebilirsin.</li></ol>`,
      `<p><b>What it's for:</b> playing études and pieces from the score.</p>
      <ol><li>Pick an étude; its score appears on the staff. Tap Listen to hear it first.</li>
        <li><b>Follow mode:</b> play at your own pace; it moves on when you hit the right note. <b>Play in tempo:</b> play with the metronome; notes and timing are measured.
          <b>Ladder:</b> the tempo rises as you play cleanly. <b>Play with me:</b> the band follows you; it comes in with your first note, tracks your tempo and waits when you stop.</li>
        <li>You can add your own tune by typing the notes and tapping Save, or load a score with “Import MusicXML”.</li></ol>`),
    convert: L(`<p><b>Ne işe yarar:</b> Bir notayı ya da kaydı esere çevirmek: okunan notaları düzeltip “Kendi eserlerim”e eklersin.</p>
      <ol><li><b>PDF</b> en iyi sonucu verir. Resim çekiyorsan sayfayı düz ve tam çek, kenarları kırp. Eğri ya da gölgeli fotoğraflar zayıf okunur; tarama ya da ekran görüntüsü daha iyidir.</li>
        <li><b>YouTube</b> ya da başka bir kayıt için: videoyu başka bir cihazda ya da hoparlörde aç, telefonu hoparlöre yaklaştır ve “Dinleyerek yaz”a bas (en çok 3 dakika). Ses dosyan varsa “Ses dosyası seç”. Arkada yoğun eşlik olan kayıtlarda ezgi iyi çıkmayabilir; tek çalgılı kayıt en iyisidir.</li>
        <li>Okunan notalar çip olarak görünür: <b>sarı</b> = emin değil, <b>turuncu</b> = ölçü tutmuyor, <b>kırmızı</b> = klarnet aralığı dışı. Bir çipe dokun, altındaki düğmelerle düzelt; ileri kullanıcı metin kutusundan da yazabilir.</li>
        <li>Okunanı kaydetmeden önce mutlaka <b>Dinle</b> ile kontrol et. Sonra ad ver ve Kaydet: eser “Etüt ve eserler”de açılır.</li></ol>`,
      `<p><b>What it's for:</b> turning a score or a recording into a piece: you correct the notes read and add them to “My pieces”.</p>
      <ol><li>A <b>PDF</b> gives the best result. If you take a photo, shoot the page flat and whole, and crop the edges. Curved or shadowed photos read poorly; a scan or a screenshot is better.</li>
        <li>For <b>YouTube</b> or any other recording: play it on another device or a speaker, hold the phone close and tap “Write by ear” (3 minutes at most). If you have an audio file, use “Choose an audio file”. With heavy accompaniment behind it the melody may not come out well; a solo recording works best.</li>
        <li>The notes read appear as chips: <b>yellow</b> = not sure, <b>orange</b> = the bar doesn't add up, <b>red</b> = outside the clarinet's range. Tap a chip and fix it with the buttons below; advanced users can type in the text box too.</li>
        <li>Always check the result with <b>Listen</b> before saving. Then name it and tap Save: the piece opens in “Études & pieces”.</li></ol>`),
    rec: L(`<p><b>Ne işe yarar:</b> Kendini dinlemek ve nerede pes ya da tiz kaldığını görmek.</p>
      <ol><li>Daha doğru ölçüm için Akort'ta çaldığın makamı seç.</li>
        <li>Kaydı başlat'a bas, çal, Kaydı durdur'a bas.</li>
        <li>Grafikte yatay şerit hedef perde, çizgi senin sesin: yeşil yerinde, turuncu kaçmış. Grafiği parmakla kaydır, “Tümü” bütün kaydı gösterir.
          Grafiğe ya da tablodaki bir satıra dokununca kayıt o andan çalar.</li>
        <li>Altta en çok kaçan perdeler ve ipucu; “Parmağa bak” o notanın parmağını açar. Saklamak için “Kaydı kaydet / paylaş”.</li></ol>`,
      `<p><b>What it's for:</b> listening to yourself and seeing where you were flat or sharp.</p>
      <ol><li>For a better reading, choose the makam you're playing in the Tuner.</li>
        <li>Tap Start recording, play, tap Stop recording.</li>
        <li>In the chart the band is the target perde and the line is you: green on pitch, orange off. Drag the chart; “All” shows the whole recording.
          Tap the chart or a table row to play from that moment.</li>
        <li>Below are the pitches most often off with a tip; “See fingering” opens that note's fingering. Use “Save / share the recording” to keep it.</li></ol>`),
    videos: L(`<p><b>Ne işe yarar:</b> Sol klarnet hocalarının eğitim videolarını konuya ve makama göre bulmak.</p>
      <ol><li>Konu ya da makam seç, istersen başlıkta ara.</li>
        <li>Bir videoya dokun: YouTube'da açılır. İnternet gerekir.</li>
        <li>Bir makamı çalışırken önce o makamın anlatım videosunu izle, sonra Dizi ve Taklit'e geç.</li></ol>`,
      `<p><b>What it's for:</b> finding teaching videos by Sol clarinet masters by topic and makam. The videos are in Turkish.</p>
      <ol><li>Pick a topic or makam, or search the titles.</li>
        <li>Tap a video to open it on YouTube. Needs an internet connection.</li>
        <li>When working on a makam, watch its explanation video first, then move on to Scale and Mimic.</li></ol>`),
    progress: L(`<p><b>Ne işe yarar:</b> Ne kadar çalıştığını ve neyin geliştiğini görmek.</p>
      <ol><li>Üstte seri (kaç gün üst üste) ve bugünkü süre; günlük hedefi Ayarlar'dan değiştirebilirsin.</li>
        <li>Altta ritim, kulak, seyir, hız, süsleme ve eserlerdeki en iyi sonuçların ve Taklit rekorun.</li>
        <li>Hangi notalarda zorlandığını görmek için Akort'taki nota şeridinde “Entonasyon haritası”nı aç: pes ya da tiz çıkan notalar renklenir.</li></ol>`,
      `<p><b>What it's for:</b> seeing how much you've practised and what's improving.</p>
      <ol><li>At the top: your streak and today's time; change the daily goal in Settings.</li>
        <li>Below: your best results in rhythm, ear, seyir, speed, ornaments and pieces, and your Mimic record.</li>
        <li>To see which notes you struggle with, turn on the “Intonation map” on the Tuner's note strip: flat or sharp notes are coloured.</li></ol>`)
  };
  const helpBox = (id, body) => `<details class="phelp"${id ? ` id="${id}"` : ""}><summary>${L("Nasıl kullanılır?", "How to use")}</summary><div class="phelpbody"${id ? ` id="${id}body"` : ""}>${body}</div></details>`;
  const ICON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>`,
    stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>`,
    chev: `<svg class="tchev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
    go: `<svg class="hgo" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`
  };
  const card = id => `<button type="button" class="hcard" data-open="${id}"><span><b>${tabName(id)}</b><small>${BLURB[id]}</small></span>${ICON.go}</button>`;
  const root = $("practice");
  root.innerHTML = `
    <div class="phead">
      <div class="label" id="plabel">Çalışma</div>
      <div class="pstat">
        <span class="pmic" id="pmic"></span>
        <button class="pgoal" id="pgoal" type="button">
          <span id="pgoaltx"></span><i aria-hidden="true"><b id="pgoalbar"></b></i></button>
      </div>
    </div>
    <div class="phub" id="phub">
      ${helpBox("", HUB_HELP)}
      <button type="button" class="hresume" id="hresume"></button>
      <button type="button" class="hfeat" data-open="archive"><span><small>${L("Nota arşivi · 2200 eser", "Score archive · 2200 pieces")}</small>
        <b>${L("Bir eser ara, dinle ve birlikte çal", "Find a piece, listen and play along")}</b></span>${ICON.go}</button>
      <button type="button" class="hfeat" data-open="band"><span><small>${L("Eşlik · Roman havası, karşılama, çiftetelli…", "Play-along · Roman havası, karşılama, çiftetelli…")}</small>
        <b>${L("Darbuka, bas ve udla oyun havası çal", "Play dance tunes with darbuka, bass and oud")}</b></span>${ICON.go}</button>
      ${GROUPS.slice(1).map(([g, name, members]) => `<section class="hgroup" data-g="${g}" aria-label="${name}">
        ${members.length > 1 ? `<h3 class="label">${name}</h3>` : ""}
        <div class="hcards">${members.map(card).join("")}</div></section>`).join("")}
    </div>
    <div class="pex" id="pex" hidden>
    <nav class="pnav" aria-label="Çalışma türü">
      <div class="pbar">
        <button type="button" class="pback" id="pback">${ICON.back}<span>${L("Çalışma", "Practice")}</span></button>
        <h2 class="ptitle" id="ptitle"></h2>
      </div>
      <div class="psubs" role="tablist" aria-label="Çalışma türü">
        ${TABS.map(([id, name]) => `<button type="button" role="tab" id="tab-${id}" aria-controls="pp-${id}" data-tab="${id}">${name}</button>`).join("")}
      </div>
    </nav>
    ${helpBox("phelp", "")}
    <div class="tools">
      <div class="tool" id="tmet">
        <div class="thead">
          <button class="tplay" id="metbtn" type="button"></button>
          <button class="tsum" type="button" aria-expanded="false" aria-controls="tmetbody">
            <span><span class="tname">${L("Metronom", "Metronome")}</span><span class="tval" id="metsum"></span></span>${ICON.chev}</button>
        </div>
        <div class="slots" id="slots" aria-hidden="true"></div>
        <div class="tbody" id="tmetbody" hidden>
          <div class="reg thelp">${L("▶ ile başlat, ■ ile durdur. Tempoyu − / + ile ya da sayıyı yazarak değiştir. Usul seçersen düm ve tek vuruşları farklı sesle çalar; noktalar ölçüdeki yeri gösterir.", "Start with ▶, stop with ■. Change the tempo with − / + or by typing it. With an usul, düm and tek strokes sound different; the dots show where you are in the bar.")}</div>
          <label class="tfield"><span class="label">Usul</span>
            <select id="usul" aria-label="Usul"><optgroup label="${L("Klasik usuller", "Classical usuls")}">${USULS.filter(u => !u.halk).map(u => `<option value="${u.id}">${u.name} ${u.meter}</option>`).join("")}</optgroup>
              <optgroup label="${L("Oyun havaları", "Dance tunes")}">${USULS.filter(u => u.halk).map(u => `<option value="${u.id}">${u.name} ${u.meter}</option>`).join("")}</optgroup></select></label>
          <div class="tfield"><span class="label">Tempo</span>
            <div class="stepper">
              <button class="mini" type="button" data-tempo="-4" aria-label="${L("Yavaşlat", "Slower")}">−</button>
              <input id="tempo" type="number" min="30" max="300" step="2" value="120" aria-label="Tempo">
              <button class="mini" type="button" data-tempo="4" aria-label="${L("Hızlandır", "Faster")}">+</button>
              <em>vuruş/dk</em>
            </div></div>
        </div>
      </div>
      <div class="tool" id="tdrone">
        <div class="thead">
          <button class="tplay" id="dronebtn" type="button"></button>
          <button class="tsum" type="button" aria-expanded="false" aria-controls="tdronebody">
            <span><span class="tname">${L("Dron", "Drone")}</span><span class="tval" id="dronesum"></span></span>${ICON.chev}</button>
        </div>
        <div class="tbody" id="tdronebody" hidden>
          <label class="tfield"><span class="label">${L("Durak perdesi", "Tonic perde")}</span><select id="dronep" aria-label="Dron perdesi"></select></label>
          <label class="tfield"><span class="label">${L("Ses düzeyi", "Volume")}</span>
            <input id="dronevol" type="range" min="1" max="10" value="4" aria-label="Dron ses düzeyi"></label>
          <div class="reg thelp">${L("Dron, arkada sürekli çalan sabit bir sestir: genelde makamın durak perdesi. Sen onun üstünde çalarak perdelerini kulakla oturtursun. ▶ ile aç, perdeyi ve ses düzeyini buradan seç.", "The drone is a steady background note, usually the makam's tonic. Playing over it helps you place your perdes by ear. Turn it on with ▶ and pick the perde and volume here.")}</div>
          <div class="reg">Kulaklık önerilir. Dron açıkken dron perdesiyle aynı ses (oktavı dahil) algılanmaz.</div>
        </div>
      </div>
    </div>
    ${TABS.map(([id]) => `<div class="ppanel" role="tabpanel" id="pp-${id}" aria-labelledby="tab-${id}" hidden></div>`).join("")}
    </div>
  `;

  const micNote = $("pmic");
  function micHint(){ micNote.hidden = SK.isListening(); micNote.textContent = "çoğu alıştırma mikrofon ister"; }
  SK.on("mic", micHint); micHint();
  async function needMic(){ if(!SK.isListening()) await SK.startMic(); return SK.isListening(); }

  // Araçlar (metronom, dron): başlıkta aç/kapat ve özet; ayarlar katlanır. Alıştırmayı kapatmasın diye
  // ayarlar her alıştırmada kapalı açılır.
  function setToolOpen(tool, open){
    const sum = tool.querySelector(".tsum");
    tool.classList.toggle("open", open);
    sum.setAttribute("aria-expanded", open ? "true" : "false");
    $(sum.getAttribute("aria-controls")).hidden = !open;
  }
  const closeTools = () => root.querySelectorAll(".tool").forEach(tool => setToolOpen(tool, false));
  root.querySelectorAll(".tool").forEach(tool => {
    setToolOpen(tool, false);
    tool.querySelector(".tsum").addEventListener("click", () => setToolOpen(tool, !tool.classList.contains("open")));
  });
  const PLAY_LABELS = {
    metbtn: [L("Metronomu başlat", "Start the metronome"), L("Metronomu durdur", "Stop the metronome")],
    dronebtn: [L("Dronu aç", "Turn the drone on"), L("Dronu kapat", "Turn the drone off")]
  };
  function setPlay(btn, on){
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", PLAY_LABELS[btn.id][on ? 1 : 0]);
    btn.innerHTML = on ? ICON.stop : ICON.play;
    btn.closest(".tool").classList.toggle("on", on);
  }

  // Etkin modül kararlı nota/sessizlik olaylarını alır
  const modules = {};
  let active = null, parked = false;    // parked: uygulama arka plana geçince alıştırma durduruldu (aşağıda park)
  const pnav = root.querySelector(".pnav");
  const descs = [];   // telefonda iki satıra kısalan açıklamalar
  // Ana sayfadan açılan alıştırma tarayıcı geçmişine eklenir: telefonun geri tuşu ana sayfaya döner
  let pushed = false;
  function selectTab(id, user){
    if(active && active !== id && !parked && modules[active].leave) modules[active].leave();
    parked = false;
    const fromHub = active === null;
    active = id; store.set("ptab", id); store.set(isLesson(id) ? "ptab.lesson" : "ptab.prac", id);
    root.classList.toggle("lessonsmode", isLesson(id));
    $("plabel").textContent = isLesson(id) ? tabName("lessons") : L("Çalışma", "Practice");
    const members = groupOf(id)[2];
    $("phub").hidden = true; $("pex").hidden = false;
    $("ptitle").textContent = tabName(id);
    TABS.forEach(([t]) => {
      $("tab-"+t).hidden = !members.includes(t);
      $("tab-"+t).setAttribute("aria-selected", t===id ? "true" : "false");
      $("tab-"+t).tabIndex = t===id ? 0 : -1;
      $("pp-"+t).hidden = t!==id;
    });
    pnav.classList.toggle("single", members.length < 2);
    closeTools();
    $("phelpbody").innerHTML = HELP[id] || ""; $("phelp").open = false;
    if(modules[id].enter) modules[id].enter();
    SK.setRoute({ tab:id });
    fitDescs();
    markNotes();
    if(user){
      const st = history.state || {};
      // Dersler ayrı sayfadır; ana sayfaya geri dönülecek bir geçmiş kaydı eklenmez
      if(fromHub && st.view === "practice" && !st.ex && !isLesson(id)){ history.pushState({ view:"practice", ex:id, exPush:true }, ""); pushed = true; }
      else if(st.view === "practice") history.replaceState({ ...st, ex:id }, "");
      // Yeni alıştırma baştan görünsün
      if(fromHub) window.scrollTo(0, 0);
      else{
        const top = pnav.getBoundingClientRect().bottom, p = $("pp-"+id).getBoundingClientRect().top;
        if(p < top) window.scrollBy(0, p - top - 8);
      }
    }
  }
  function showHub(){
    if(active && !parked && modules[active].leave) modules[active].leave();
    parked = false;
    // Alıştırmadan çıkınca sesi kesilir; çubukta kalmasın. Yine de ses sürerse o alıştırmaya yazılır (prevTab).
    if(active){ prevTab = active; soundTab = null; SK.resetSound(); }
    active = null; pushed = false;
    markNotes();
    TABS.forEach(([t]) => { $("pp-"+t).hidden = true; });
    $("pex").hidden = true; $("phub").hidden = false;
    root.classList.remove("lessonsmode"); $("plabel").textContent = L("Çalışma", "Practice");
    SK.setRoute({ tab:null });
    const last = store.get("ptab.prac", ""), r = $("hresume");
    r.hidden = !TABS.some(([t]) => t === last) || isLesson(last);
    if(r.hidden) return window.scrollTo(0, 0);
    r.dataset.open = last;
    r.innerHTML = `<span><small>${L("Kaldığın yerden devam et", "Pick up where you left off")}</small><b>${tabName(r.dataset.open)}</b></span>${ICON.go}`;
    window.scrollTo(0, 0);
  }
  function back(){
    if(pushed && history.state && history.state.ex) history.back();
    else{ if(history.state && history.state.ex){ const { ex, ...st } = history.state; history.replaceState(st, ""); } showHub(); }
  }
  $("pback").addEventListener("click", back);
  $("phub").addEventListener("click", e => { const c = e.target.closest("[data-open]"); if(c) selectTab(c.dataset.open, true); });
  window.addEventListener("popstate", e => {
    const st = e.state || {};
    if(st.view !== "practice") return;
    if(st.ex && TABS.some(([t]) => t === st.ex)){ if(active !== st.ex) selectTab(st.ex); }
    else if(active) showHub();
  });
  // Alt menüde açıkken Çalışma'ya yeniden dokunmak ana sayfaya döndürür; Dersler'den Çalışma'ya geçmek de ana sayfayı açar
  const navBtn = document.querySelector('.nav [data-view="practice"]');
  if(navBtn) navBtn.addEventListener("click", () => {
    if(active && isLesson(active)) setTimeout(() => { back(); markNotes(); });
    else if(document.body.dataset.view === "practice" && active) back();
  }, true);
  pnav.addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if(b) selectTab(b.dataset.tab, true); });
  // Alt menüdeki Notalar ve Dersler: Çalışma'yı nota arşiviyle / dersle açar; o sırada Çalışma değil onlar seçili görünür
  const notesBtn = $("navnotes"), lessonsBtn = $("navlessons");
  function markNotes(){
    const nb = notesBtn, lb = lessonsBtn, pb = document.querySelector('.nav [data-view="practice"]');
    if(!nb || !lb) return;
    const inP = document.body.dataset.view === "practice", on = inP && active === "archive", les = inP && !!active && isLesson(active);
    const cur = (b, v) => v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current");
    cur(nb, on); cur(lb, les);
    if(pb && inP) cur(pb, !on && !les);
  }
  if(lessonsBtn) lessonsBtn.addEventListener("click", () => setTimeout(() => {
    if(active && isLesson(active) && document.body.dataset.view === "practice") window.scrollTo({ top:0, behavior:"smooth" });
    else{ const t = store.get("ptab.lesson", "lessons"); selectTab(isLesson(t) ? t : "lessons", true); }
    markNotes();
  }));
  if(notesBtn) notesBtn.addEventListener("click", () => setTimeout(() => {
    if(active === "archive" && document.body.dataset.view === "practice") window.scrollTo({ top:0, behavior:"smooth" });
    else selectTab("archive", true);
    markNotes();
  }));
  SK.on("view", markNotes);
  pnav.addEventListener("keydown", e => {
    const step = {ArrowRight:1, ArrowLeft:-1}[e.key];
    if(!step || !e.target.closest(".psubs")) return;
    e.preventDefault();
    const m = groupOf(active)[2], i = (m.indexOf(active) + step + m.length) % m.length;
    selectTab(m[i], true); $("tab-"+m[i]).focus();
  });
  $("pgoal").addEventListener("click", () => selectTab("progress", true));

  // Uzun açıklamalar telefonda iki satır; taşıyorsa "devamı" düğmesi
  function fitDescs(){
    descs.forEach(([p, b]) => {
      if(p.closest("[hidden]")) return;
      if(p.classList.contains("open")){ b.hidden = false; return; }
      b.hidden = p.scrollHeight <= p.clientHeight + 2;
    });
  }
  window.addEventListener("resize", fitDescs);
  SK.on("note", d => { const m = modules[active]; if(m && m.note) m.note(d.r, d.t); });
  SK.on("silence", d => { const m = modules[active]; if(m && m.silence) m.silence(d.t); });
  SK.on("raw", d => { const m = modules[active]; if(m && m.raw) m.raw(d); });

  // Aynı notanın ne kadar süredir tutulduğunu izler (yanlış notalar ve sessizlik sıfırlar)
  function holder(){
    let w = null, since = 0, fired = false;
    return {
      push(written, t){ if(written !== w){ w = written; since = t; fired = false; } return { w, ms: t - since, fired }; },
      fire(){ fired = true; },
      reset(){ w = null; fired = false; }
    };
  }

  // ---- Ses: metronom ve dron (ana sentezleyicinin ses bağlamı) ----
  const slotsEl = $("slots");
  let met = null;
  function drawSlots(u, cur = -1){
    slotsEl.innerHTML = usulSlots(u).map((s, i) =>
      `<i class="${s==="D" ? "dum" : s==="T" ? "tek" : "rest"}${i===cur ? " now" : ""}">${s==="D" ? "Düm" : s==="T" ? "Tek" : "·"}</i>`).join("");
  }
  // dest: tıkların bağlanacağı düğüm (hız çalışı durdurulunca önceden planlanmış tıklar susturulabilsin)
  function hit(a, kind, t, vol = 1, dest = a.destination){
    const g = a.createGain();
    g.connect(dest);
    if(kind === "D"){
      // Düm: perde bulucunun alt sınırının (100 Hz) altında kalır, nota sanılmaz
      const o = a.createOscillator();
      o.frequency.setValueAtTime(85, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
      g.gain.setValueAtTime(0.6*vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g); o.start(t); o.stop(t + 0.32);
    }else{
      // Tek: süzülmüş gürültü, perdesiz
      const len = Math.round(a.sampleRate*0.06), buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
      for(let i=0;i<len;i++) ch[i] = (Math.random()*2-1) * (1 - i/len);
      const src = a.createBufferSource(), f = a.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = 2500; f.Q.value = 1.2;
      src.buffer = buf; src.connect(f).connect(g);
      g.gain.setValueAtTime(0.5*vol, t);
      src.start(t);
    }
  }
  function startMet(){
    const a = SK.audioCtx(), u = USULS.find(x => x.id === $("usul").value), slots = usulSlots(u);
    let i = 0, next = a.currentTime + 0.1;
    SK.metActive = true;
    met = { timer: setInterval(() => {
      const per = 60 / tempo();
      while(next < a.currentTime + 0.12){
        const k = i % slots.length, at = next;
        if(slots[k]) hit(a, slots[k], at, 1, SK.toolOut());
        setTimeout(() => { if(met) drawSlots(u, k); }, Math.max(0, (at - a.currentTime)*1000));
        next += per; i++;
      }
    }, 25) };
    setPlay($("metbtn"), true);
  }
  function stopMet(){
    if(met){ clearInterval(met.timer); met = null; }
    SK.metActive = false;
    setPlay($("metbtn"), false);
    drawSlots(USULS.find(x => x.id === $("usul").value));
    metSum();
  }
  // Tempo kutusu boş ya da sınır dışıysa 30–300 aralığına çekilir
  const clampTempo = v => Math.max(30, Math.min(300, Math.round(+v) || 120));
  const tempo = () => clampTempo($("tempo").value);
  function setTempo(v){ $("tempo").value = clampTempo(v); store.set("tempo", tempo()); metSum(); }
  function metSum(){ $("metsum").textContent = USULS.find(x => x.id === $("usul").value).name + " · " + tempo(); }
  $("usul").value = store.get("usul", "sofyan");
  $("tempo").value = store.get("tempo", 120);
  $("usul").addEventListener("change", () => { store.set("usul", $("usul").value); if(met){ stopMet(); startMet(); } else stopMet(); });
  $("tempo").addEventListener("change", () => setTempo($("tempo").value));
  $("tmetbody").addEventListener("click", e => { const b = e.target.closest("[data-tempo]"); if(b) setTempo(tempo() + +b.dataset.tempo); });
  $("metbtn").addEventListener("click", () => met ? stopMet() : startMet());
  stopMet();

  const dronSel = $("dronep");
  PERDES.filter(([c]) => c >= -22 && c <= 62).forEach(([c, n]) => {
    const o = document.createElement("option"); o.value = c; o.textContent = n + " (yazılı " + nn(commaToWritten(c)) + ")";
    dronSel.appendChild(o);
  });
  dronSel.value = store.get("drone", 0);
  let drone = null;
  function startDrone(){
    const a = SK.audioCtx(), c = +dronSel.value, f = commaFreq(c);
    const g = a.createGain(), lp = a.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1200;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.02 * +$("dronevol").value, a.currentTime + 0.4);
    const oscs = [f, f/2].map(fr => { const o = a.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr; o.connect(lp); o.start(); return o; });
    lp.connect(g).connect(SK.toolOut());
    drone = { g, oscs, f }; droneLv = []; SK.droneActive = true;
    setPlay($("dronebtn"), true);
  }
  function stopDrone(){
    if(drone){
      const a = SK.audioCtx(), t = a.currentTime;
      drone.g.gain.cancelScheduledValues(t);
      drone.g.gain.setValueAtTime(Math.max(drone.g.gain.value, 0.0001), t);
      drone.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      drone.oscs.forEach(o => o.stop(t + 0.35));
      drone = null; SK.droneActive = false;
    }
    setPlay($("dronebtn"), false);
    droneSum();
  }
  function droneSum(){ const p = PERDES.find(([c]) => c === +dronSel.value); $("dronesum").textContent = p ? p[1] : ""; }
  function setDrone(c){ dronSel.value = c; store.set("drone", c); droneSum(); if(drone){ stopDrone(); startDrone(); } }
  dronSel.addEventListener("change", () => setDrone(+dronSel.value));
  $("dronevol").addEventListener("input", () => { if(drone) drone.g.gain.setTargetAtTime(0.02 * +$("dronevol").value, SK.audioCtx().currentTime, 0.05); });
  $("dronebtn").addEventListener("click", () => drone ? stopDrone() : startDrone());
  stopDrone();

  // Kayıt dinletilirken ya da dron çalarken mikrofon o sesi nota saymasın.
  // Dronun hoparlörden mikrofona sızan seviyesi son 15 saniyenin alt %5'lik dilimiyle (nefes aralarından) izlenir; bunun iki katından
  // güçlü ses öğrencinin sesidir (durağı dronla birlikte çalmak da ölçülür). Sızıntı düzeyindeki her ölçüm yok sayılır.
  // Eşlik grubu (band.js) çalarken ud ve basın perdeleri de aynı yolla ayıklanır (bandFreqs, duyulan Hz)
  let playbackMute = false, droneLv = [], bandFreqs = [];
  SK.on("level", d => {
    if(!drone && !bandFreqs.length) return;
    droneLv.push(d.rms); if(droneLv.length > 375) droneLv.shift();
  });
  // (alt %10 kullanılınca nefes almadan 9 sn çalan öğrencinin kendi sesi "sızıntı" sayılıyor, durakta çaldığı notalar atılıyordu)
  const droneFloor = () => droneLv.length < 10 ? Infinity : [...droneLv].sort((a,b) => a-b)[Math.floor(droneLv.length*0.05)];
  SK.ignore = (f, rms) => {
    if(playbackMute) return true;
    if(!drone && !bandFreqs.length) return false;
    const floor = droneFloor();
    if(rms < floor*1.3) return true;
    const near = g => { const c = 1200*Math.log2(f/g), r = ((c % 1200) + 1200) % 1200; return Math.min(r, 1200 - r) < 25; };
    return ((drone && near(drone.f)) || bandFreqs.some(near)) && !(rms > floor*2);
  };
  function setBandFreqs(fs){
    if(fs.length && !bandFreqs.length && !drone) droneLv = [];
    bandFreqs = fs.slice();
  }
  // Uygulama arka plana geçince (ekran kilidi, başka uygulama) açık alıştırmanın çaları da durur
  // (nota arşivi, eser orkestrası, eşlik, kulaktan çıkar…); yoksa görünmeyen uygulama çalmaya devam eder.
  // Uygulamanın içinde başka sayfaya geçince ses sürer: "şu an çalıyor" çubuğundan dönülür ya da durdurulur.
  function park(){
    stopMet(); stopDrone(); SK.stopSound();
    if(active && !parked && modules[active].leave){ parked = true; modules[active].leave(); }
  }
  function unpark(){
    if(!parked) return;
    parked = false;
    if(active && modules[active].enter) modules[active].enter();
  }
  document.addEventListener("visibilitychange", () => {
    if(document.hidden) park();
    else if(document.body.dataset.view === "practice") unpark();
  });

  // Günlük hedef: bugünkü sesli çalma süresi / hedef (dakika)
  function goalText(){
    const goal = store.get("goal.min", 15), today = Math.floor((days[dayKey(new Date())] || 0)/60);
    const el = $("pgoal"); if(!el) return;
    const tx = L("Bugün ", "Today ") + today + "/" + goal + L(" dk", " min") + (today >= goal ? " ✓" : "");
    $("pgoaltx").textContent = tx;
    $("pgoalbar").style.width = Math.min(100, today/goal*100) + "%";
    el.setAttribute("aria-label", tx + L(" — İlerleme'yi aç", " — open Progress"));
    el.classList.toggle("goalok", today >= goal);
  }
  // Yalnızca Çalışma ekranı görünürken yenilenir; ekrana dönülünce (hedef Ayarlar'da değişmiş olabilir) hemen güncellenir
  setInterval(() => { if(document.body.dataset.view === "practice" && !document.hidden) goalText(); }, 5000);
  SK.on("view", d => { if(d.v === "practice") goalText(); });

  // ---- Her zaman çalışanlar: entonasyon istatistiği, pratik süresi, vibrato, glissando ----
  const intStats = store.get("int.stats", {});
  let intDirty = false;
  const collector = new NoteStatCollector((w, m) => { statAdd(intStats, w, m); intDirty = true; paintHeat(); });
  SK.on("note", d => { if(d.r.inRange && d.r.perde) collector.push(d.r.written, d.r.perde.delta, d.t); });
  SK.on("silence", () => collector.flush());

  const days = store.get("days", {});
  goalText();
  let lastRaw = 0, unsaved = 0;
  SK.on("raw", d => {
    const dt = d.t - lastRaw; lastRaw = d.t;
    if(dt > 0 && dt < 250){
      const k = dayKey(new Date());
      days[k] = (days[k] || 0) + dt/1000; unsaved += dt;
    }
    if(unsaved > 5000){ unsaved = 0; store.set("days", days); }
    if(intDirty){ intDirty = false; store.set("int.stats", intStats); }
  });
  let resetting = false;
  window.addEventListener("pagehide", () => { if(!resetting && !window.SK_RESETTING){ store.set("days", days); store.set("int.stats", intStats); } });

  // Vibrato: kararlı notanın son 1,5 saniyesindeki ham ölçümler
  const vibEl = $("vib");
  let vibFrames = [], vibNote = null, vibT = 0;
  SK.on("raw", d => {
    if(vibNote === null) return;
    vibFrames.push({ t:d.t, comma:d.comma });
    while(vibFrames.length && d.t - vibFrames[0].t > 1500) vibFrames.shift();
    if(d.t - vibT > 250){
      vibT = d.t;
      const v = vibrato(vibFrames, SK.windowSec());
      vibEl.innerHTML = v ? num(v.rate) + " <em>Hz</em> ±" + num(v.depth) + " <em>koma</em>" : "— <em>düz</em>";
    }
  });
  // Glissando: iki kararlı nota arasındaki geçiş kareleri
  let lastStable = null, between = [];
  SK.on("raw", d => between.push({ t:d.t, comma:d.comma }));
  SK.on("note", d => {
    if(d.r.written !== vibNote){ vibNote = d.r.written; vibFrames = []; }
    if(lastStable && lastStable.written !== d.r.written && isGlide([lastStable, ...between])) SK.markGlide(d.t);
    lastStable = { t:d.t, comma:d.r.comma, written:d.r.written };
    between = [];
  });
  SK.on("silence", () => {
    lastStable = null; between = []; vibNote = null; vibFrames = [];
    vibEl.innerHTML = "—";
  });

  // ---- Nota şeridi: entonasyon ısı haritası ve makam işaretleri ----
  const heatBtn = $("heatbtn");
  let heatOn = store.get("heat", false);
  function paintHeat(){
    SK.cells.forEach((el, w) => {
      const cls = heatOn ? heatClass(intStats[w]) : null;
      el.classList.remove("heat-sharp", "heat-flat", "heat-clean");
      if(cls) el.classList.add("heat-" + cls);
      const s = intStats[w];
      el.title = heatOn && s && s.n >= 3 ? "ortalama " + sgn(s.sum/s.n) + " koma (" + s.n + " ölçüm)" : "";
    });
    heatBtn.setAttribute("aria-pressed", heatOn ? "true" : "false");
    $("heatlg").hidden = !heatOn;
  }
  heatBtn.addEventListener("click", () => { heatOn = !heatOn; store.set("heat", heatOn); paintHeat(); });
  paintHeat();
  const markScale = mk => SK.markScale(mk);

  // Parmak şemasının küçük kopyası (test için; notanın adı gizli kalır)
  function miniChart(){
    const c = document.querySelector("svg.chart").cloneNode(true);
    c.querySelectorAll("[id]").forEach(n => { n.id = "q-" + n.id; n.removeAttribute("tabindex"); n.removeAttribute("role"); n.removeAttribute("aria-label"); n.removeAttribute("aria-pressed"); });
    c.classList.add("minichart"); c.setAttribute("aria-label", "Sorulan parmak pozisyonu");
    return c;
  }
  function paintMini(svg, code){
    const on = new Set(fingeringIds(code).map(i => "q-" + i));
    svg.querySelectorAll(".hole, .key").forEach(n => n.classList.toggle("on", on.has(n.id)));
  }
  const SVGNS = "http://www.w3.org/2000/svg";
  function staffSvg(){ const s = document.createElementNS(SVGNS, "svg"); s.setAttribute("viewBox", "0 0 150 108"); s.setAttribute("class", "staff"); s.setAttribute("role", "img"); return s; }

  // Ses kalitesi: netlik ve ses gücü dengesi (skills.js toneQuality)
  const toneKv = tq => tq ? `<div><span class="label">${L("Ses temizliği", "Tone clarity")}</span>%${tq.clarity}</div><div><span class="label">${L("Ses gücü dengesi", "Volume steadiness")}</span>%${tq.steadiness}</div>` : "";
  const toneTips = tq => tq ? tq.tips.map(t => pick(t, LANG)).join(" ") : "";

  // ======== Sekmeler: drills.js, trainers.js, pieces.js, lessonview.js ========
  // Dizi ve Taklit aynı makamı, Dizi ile derslerin makam adımları aynı "çalışıldı" kaydını paylaşır
  const makamState = { cur: makamById(store.get("makam", "rast")) || MAKAMS[0], done: store.get("makam.done", {}) };
  const ctx = { SK, $, store, T, nn, num, sgn, esc, sleep, label, perdeOf, tgt, mkFreq, commaFreq, hit, needMic, holder,
    miniChart, paintMini, staffSvg, toneKv, toneTips, markScale, days, intStats, paintHeat, goalText, makamState,
    droneOn: c => { setDrone(c); if(!drone) startDrone(); },
    droneOff: () => { if(drone) stopDrone(); },
    selectTab: id => selectTab(id, true),
    setPlaybackMute: v => { playbackMute = v; },
    setBandFreqs,
    markResetting: () => { resetting = true; } };
  TABS.forEach(([id]) => { modules[id] = TRAINERS[id](ctx); });

  // Açıklamalar telefonda kısalır; "devamı" ile açılır
  root.querySelectorAll(".ppanel > .pdesc").forEach(p => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "linkbtn pmore"; b.hidden = true;
    b.textContent = L("devamı", "more");
    b.addEventListener("click", () => {
      const open = p.classList.toggle("open");
      b.textContent = open ? L("kısalt", "less") : L("devamı", "more");
    });
    p.after(b); descs.push([p, b]);
  });

  // Durdur düğmesi (app.js stopAll): metronom, dron ve açık alıştırmanın sesi. Alıştırma stop() verirse o,
  // vermezse leave() + enter() ile baştan kurulur; sessiz alıştırmalar boş stop() ile yerinde kalır.
  function stopTab(id){
    const m = modules[id];
    if(id === active){
      if(m.stop) m.stop();
      else if(m.leave){ m.leave(); if(m.enter) m.enter(); }
    }
    const p = $("pp-" + id); if(p) p.querySelectorAll("audio, video").forEach(x => { if(!x.paused) x.pause(); });
    SK.stopSound(); SK.hush();
    if(soundTab === id) soundTab = null;
  }
  SK.on("stopall", () => {
    if(met) stopMet();
    if(drone) stopDrone();
    if(soundTab && soundTab !== active) stopTab(soundTab);
    if(active) stopTab(active);
  });

  // "Şu an çalıyor" çubuğu (nowplaying.js): metronom, dron ve sesi süren alıştırma. Alıştırma sesi, ses
  // başladığında açık olan sekmeye yazılır; başka sayfaya geçilse de çubuk oraya geri götürür.
  let soundTab = null, prevTab = null;
  const inPractice = () => document.body.dataset.view === "practice";
  const openTools = () => { if(!(inPractice() && active)) SK.openTab(active || store.get("ptab", "lessons")); };
  const mediaIn = id => [...$("pp-" + id).querySelectorAll("audio, video")].some(x => !x.paused && !x.ended);
  SK.addSource(() => {
    const out = [], toolsHere = inPractice() && !!active;
    if(met) out.push({ key:"met", title:L("Metronom", "Metronome"), sub:$("metsum").textContent, here:toolsHere, go:openTools, stop:stopMet });
    if(drone) out.push({ key:"drone", title:L("Dron", "Drone"), sub:$("dronesum").textContent, here:toolsHere, go:openTools, stop:stopDrone });
    const age = SK.soundAge();
    if(age < 300 && (active || prevTab)) soundTab = active || prevTab;
    if(soundTab && (age < 2500 || mediaIn(soundTab))){
      const id = soundTab, m = modules[id], sub = m.nowTitle ? m.nowTitle() : "";
      out.push({ key:"ex", title:tabName(id), sub, here: inPractice() && active === id,
        go: () => { if(active === id) SK.go("practice"); else SK.openTab(id); }, stop: () => stopTab(id) });
    }else if(soundTab && !mediaIn(soundTab)) soundTab = null;
    return out;
  });

  // Uygulama geneli arama (search.js): alıştırmalar ve doğrudan açma
  SK.practiceTabs = () => TABS.map(([id, name]) => ({ id, name, blurb: BLURB[id] || "", group: groupOf(id)[1] }));
  SK.openTab = id => { SK.go("practice"); selectTab(id, true); };
  $("tbopen").addEventListener("click", () => SK.openTab("tablo"));

  // Ana ekran kısayolu (?tab=rhythm) alıştırmayı doğrudan açar; yoksa ana sayfa
  // ?ders=<id> Dersler'i (lessonview.js dersi açar), ?eser=<id> nota arşivinde eseri açar
  const qs = new URLSearchParams(location.search);
  const qtab = qs.get("eser") ? "archive" : qs.get("ders") ? "lessons" : qs.get("tab");
  if(qtab === "archive" && qs.get("eser")){
    SK.openArchive(qs.get("eser"));
    if(history.state && history.state.view === "practice") history.replaceState({ ...history.state, ex:qtab }, "");
  }else if(TABS.some(([t]) => t === qtab)){
    selectTab(qtab);
    if(history.state && history.state.view === "practice") history.replaceState({ ...history.state, ex:qtab }, "");
  }else if(isLesson(store.get("ptab", ""))) selectTab(store.get("ptab"));   // en son Dersler açıktıysa oraya dön
  else showHub();
  SK.routeReady();
})();
