// Uzman kontrolü: bir hoca ya da deneyimli Sol klarnetçi parmak pozisyonlarını, makam dizilerini ve icra
// düzeltmelerini tek tek "doğru / yanlış / emin değilim" diye işaretler, yorum yazar ve rapor paylaşır. Sorular sekmesinde
// kaynakların ayrıştığı ya da uzman kararı gereken konular (docs/DENEME-LISTESI.md) kendi seçenekleriyle cevaplanır.
// İşaretler cihazda (sk.review) tutulur; rapor düz metin + JSON olarak paylaşılır.
(function(){
  const SK = window.SK;
  if(!SK) return;
  const $ = id => document.getElementById(id);
  const store = SK.store, T = SK.T;
  const nn = w => LANG === "en" ? noteName(w).en : noteName(w).tr;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const root = $("reviewview");
  const rv = store.get("review", { name:"", items:{} });
  const save = () => store.set("review", rv);
  const VERDICTS = [["ok", L("Doğru", "Correct")], ["bad", L("Yanlış", "Wrong")], ["unsure", L("Emin değilim", "Not sure")]];

  root.innerHTML = `
    <div class="cardhead"><h2 class="vtitle" id="rvlab">${L("Uzman kontrolü", "Expert review")}</h2>
      <button class="stopbtn" type="button" data-goto="settings">${L("← Ayarlar", "← Settings")}</button></div>
    <p class="lede">${L("Uygulamadaki parmak pozisyonları Woodwind Fingering Guide'ın Albert tablolarından, makam dizileri AEU çeşni tanımlarından derlendi; icra düzeltmeleri yaklaşık. Gerçek bir Sol klarnetle kontrol edip her maddeyi işaretle, yanlışlar için doğrusunu yaz. Bitince raporu geliştiriciye gönder.",
      "The fingerings were compiled from the Woodwind Fingering Guide's Albert tables and the makam scales from AEU tetrachord definitions; the practice-tuning adjustments are approximate. Check each item on a real G clarinet, mark it, and write the correct version for anything wrong. Then send the report to the developer.")}</p>
    <div class="settings"><div class="srow">
      <label class="label" for="rvname">${L("Adın ve ünvanın", "Your name and role")}</label>
      <input type="text" id="rvname" placeholder="${L("ör. Ahmet Yılmaz, klarnet öğretmeni", "e.g. Jane Doe, clarinet teacher")}">
    </div></div>
    <div class="kv" id="rvsum"></div>
    <div class="ptabs" role="tablist" aria-label="${L("Kontrol türü", "Review type")}">
      <button type="button" role="tab" data-rt="f" id="rt-f">${L("Parmak pozisyonları", "Fingerings")}</button>
      <button type="button" role="tab" data-rt="m" id="rt-m">${L("Makamlar", "Makams")}</button>
      <button type="button" role="tab" data-rt="o" id="rt-o">${L("Süslemeler", "Ornaments")}</button>
      <button type="button" role="tab" data-rt="s" id="rt-s">${L("Sorular", "Questions")}</button>
    </div>
    <div id="rvbody"></div>
    <div class="pbar"><button class="primary small" id="rvshare" type="button">${L("Raporu paylaş", "Share the report")}</button>
      <button class="stopbtn" id="rvcopy" type="button">${L("Panoya kopyala", "Copy to clipboard")}</button>
      <span class="muted" id="rvmsg"></span></div>`;

  $("rvname").value = rv.name || "";
  $("rvname").addEventListener("change", () => { rv.name = $("rvname").value.trim(); save(); });

  // Sorular doğru/yanlış değil, kendi seçenekleriyle cevaplanır: sayımları ayrı tutulur
  const isQ = k => k.startsWith("s:");
  const answered = () => QUESTIONS.filter(q => { const it = rv.items["s:" + q.id]; return it && it.v; }).length;
  function summary(){
    const all = allItems().filter(k => !isQ(k)), v = all.map(k => rv.items[k] && rv.items[k].v);
    const n = x => v.filter(y => y === x).length;
    $("rvsum").innerHTML = `<div><span class="label">${L("Kontrol edilen", "Reviewed")}</span><span class="big2">${v.filter(Boolean).length}</span>/ ${all.length}</div>
      <div><span class="label">${L("Doğru", "Correct")}</span><span class="big2">${n("ok")}</span></div>
      <div><span class="label">${L("Yanlış", "Wrong")}</span><span class="big2">${n("bad")}</span></div>
      <div><span class="label">${L("Emin değil", "Unsure")}</span><span class="big2">${n("unsure")}</span></div>
      <div><span class="label">${L("Cevaplanan soru", "Questions answered")}</span><span class="big2">${answered()}</span>/ ${QUESTIONS.length}</div>`;
  }
  function allItems(){
    const out = [];
    for(let w=LOW_NOTE; w<=HIGH_NOTE; w++){
      fingeringsFor(w).forEach((_, i) => out.push("f:" + w + ":" + i));
      quarterFingeringsFor(w).forEach((_, i) => out.push("q:" + w + ":" + i));
    }
    MAKAMS.forEach(m => out.push("m:" + m.id));
    ORN_REVIEW.forEach(o => out.push("o:" + o.id));
    QUESTIONS.forEach(q => out.push("s:" + q.id));
    return out;
  }
  // Süslemeler: tanım, ölçüm eşikleri ve örnek ses (skills.js ORN, ornamentNotes); süslemeli etütler
  const ORN_REVIEW = [
    { id:"carpma-up", kind:"carpma", dir:"up", note:69, name:L("Üstten çarpma", "Upper grace note"),
      def:L("Asıl notadan hemen önce üstteki komşu nota çok kısa çalınır, bağlı. Ölçüm: süs notası " + ORN.grace[0] + "–" + ORN.grace[1] + " ms (ideal " + ORN.graceIdeal.join("–") + "), ardından en az " + ORN.mainMin + " ms ana nota.",
            "The upper neighbour is played very briefly, slurred, just before the main note. Measured: grace " + ORN.grace[0] + "–" + ORN.grace[1] + " ms (ideal " + ORN.graceIdeal.join("–") + "), then at least " + ORN.mainMin + " ms of the main note.") },
    { id:"carpma-down", kind:"carpma", dir:"down", note:69, name:L("Alttan çarpma", "Lower grace note"),
      def:L("Üstten çarpmanın aynısı, süs notası alttaki komşu.", "Same as the upper grace note, with the lower neighbour.") },
    { id:"tekrar", kind:"tekrar", dir:"up", note:69, name:L("Çarpmalı tekrar", "Repeated note split by grace notes"),
      def:L("Aynı nota dil yerine " + ORN.tekrar[0] + "–" + ORN.tekrar[1] + " ms'lik üst komşu çarpmalarıyla bölünür; ses kesilmez. En az " + ORN.tekrarMin + " bölme.",
            "The same note is split by " + ORN.tekrar[0] + "–" + ORN.tekrar[1] + " ms upper-neighbour taps instead of the tongue; the sound never stops. At least " + ORN.tekrarMin + " splits.") },
    { id:"mordan-up", kind:"mordan", dir:"up", note:69, name:L("Üst mordan", "Upper mordent"),
      def:L("Ana – üst komşu – ana; üçü birlikte en çok " + ORN.mordanTotal + " ms.", "Main – upper neighbour – main; all three within " + ORN.mordanTotal + " ms.") },
    { id:"mordan-down", kind:"mordan", dir:"down", note:72, name:L("Alt mordan", "Lower mordent"),
      def:L("Ana – alt komşu – ana; üçü birlikte en çok " + ORN.mordanTotal + " ms.", "Main – lower neighbour – main; all three within " + ORN.mordanTotal + " ms.") },
    { id:"tril", kind:"tril", dir:"up", note:67, name:L("Tril", "Trill"),
      def:L("Ana nota ile üst komşu arasında en az " + ORN.trilSwitch + " geçiş; düzen: süre değişkenlik katsayısı ≤ " + ORN.trilEven + ". Dersler saniyede 4–6 dönüş ister.",
            "At least " + ORN.trilSwitch + " alternations between the main note and the upper neighbour; evenness: duration coefficient of variation ≤ " + ORN.trilEven + ". Lessons ask for 4–6 turns per second.") },
    { id:"giris", kind:"giris", note:69, name:L("Alttan kayarak giriş", "Slide in from below"),
      def:L("Notaya en az " + ORN.girisDepth + " koma pesten, " + ORN.giris.join("–") + " ms içinde tek yönlü kayarak girilir.", "The note is entered from at least " + ORN.girisDepth + " commas below, sliding up within " + ORN.giris.join("–") + " ms.") },
    { id:"dusus", kind:"dusus", note:69, name:L("Sonda düşüş", "Fall at the end"),
      def:L("Notanın sonunda " + ORN.dusus.join("–") + " ms içinde en az " + ORN.dususDepth + " koma aşağı bırakılıp susulur.", "At the end of the note the pitch drops at least " + ORN.dususDepth + " commas within " + ORN.dusus.join("–") + " ms, into silence.") },
    { id:"grupetto", kind:"grupetto", note:69, name:L("Grupetto (çevirme)", "Turn"),
      def:L("Üst komşu – ana – alt komşu – ana; ilk üçü her biri en çok " + ORN.grupettoNote + " ms, toplamı en çok " + ORN.grupettoTotal + " ms, son nota en az " + ORN.mainMin + " ms.",
            "Upper neighbour – main – lower neighbour – main; the first three at most " + ORN.grupettoNote + " ms each and " + ORN.grupettoTotal + " ms in all, the last note at least " + ORN.mainMin + " ms.") },
    { id:"et:e-sus-ussak", etude:"e-sus-ussak" },
    { id:"et:e-sus-hicaz", etude:"e-sus-hicaz" }
  ];

  // Hocaya sorular (docs/DENEME-LISTESI.md bölüm 2; kimlikler aynı, raporda da yazar). now: uygulamada bugün olan;
  // theory: yazılı kaynağın dediği; practice: ölçüm ya da nota verisi; ask: hocadan istenen; hear: dinletilecek makam.
  // Cevap rv.items["s:<id>"].v seçeneğin kimliği, .c not
  const NOT_SURE = ["unsure", L("Emin değilim", "Not sure")];
  const qtAll = []; for(let w=LOW_NOTE; w<=HIGH_NOTE; w++) qtAll.push(...quarterFingeringsFor(w));
  const qtNotes = new Set(); for(let w=LOW_NOTE; w<=HIGH_NOTE; w++) if(quarterFingeringsFor(w).length) qtNotes.add(w);
  const qtKeyA = qtAll.filter(f => /\da/.test(f.code)).length;
  const Q_GROUPS = [["cesni", L("Çeşni ve perde kararları", "Çeşni and perde decisions")], ["sinama", L("Seviye sınaması", "Level check")],
    ["kapi", L("Kapı sırası", "Gate order")], ["parmak", L("Parmak", "Fingerings")], ["taksim", L("Makam ve taksim öğretimi", "Teaching makam and taksim")],
    ["metin", L("Metin ve üslup", "Texts and style")]];
  const FIT = [["fit", L("Uygun", "Fine")], ["partly", L("Kısmen", "Partly")], ["unfit", L("Uygun değil", "Not right")], NOT_SURE];
  const QUESTIONS = [
    { id:"saba-perde", g:"cesni", hear:"saba", title:L("Saba dizisinde Hüseynî mi, Dik Hisar mı?", "Saba scale: Hüseynî or Dik Hisar?"),
      now:L("Dizide Hüseynî (40). Bu yüzden Saba'nın Çargâh'taki Hicazı çeşni listesinde çıkmıyor, yalnız metinde yazılı.", "The scale has Hüseynî (40), so Saba's Hicaz on Çargâh is not in the çeşni list, only in the text."),
      theory:L("TDV Sabâ, perde listesinde ve Zirgüleli Hicaz tarifinde Dik Hisar (39, koma bemollü mi) der; aynı maddenin donanımında mi için işaret yoktur.", "TDV's Sabâ entry names Dik Hisar (39, E with a koma flat) in its perde list and its Zirgüleli Hicaz description, yet its key signature has no sign on E."),
      practice:L("SymbTr'deki 66 Saba eserinde bu perde 40 yazılı (süreye göre %9,9), 39 neredeyse hiç yok. Bu notanın yazılışıdır, çalınan perdenin ölçümü değildir.", "In SymbTr's 66 Saba pieces this perde is written as 40 (9.9% of the duration), almost never 39. That is how it is notated, not a measurement of what is played."),
      ask:L("Sol klarnette bu perdeyi nasıl öğretiyorsunuz?", "How do you teach this perde on the G clarinet?"),
      opts:[["huseyni", "Hüseynî (40)"], ["dikhisar", "Dik Hisar (39)"], ["depends", L("Yerine göre", "It depends")], NOT_SURE] },
    { id:"nihavend-hicaz", g:"cesni", hear:"nihavend", title:L("Nihâvend'in Nevâ'daki dörtlüsü", "Nihâvend's tetrachord on Nevâ"),
      now:L("Çıkışta Nevâ, Nim Hisar, Evç, Gerdâniye (4, 13, 5 koma); çeşni listesi bunu “(B A S)” biçimiyle Hicaz dörtlüsünde gösteriyor. İnerken Evç yerine Acem.", "Ascending: Nevâ, Nim Hisar, Evç, Gerdâniye (4, 13, 5 commas); the çeşni list shows it under the Hicaz tetrachord as “(B A S)”. Descending, Acem replaces Evç."),
      theory:L("TDV bu dörtlüye Hicaz der, biçimini söylemez. B A13 S'yi TDV Hüseynî'deki Hicaz için söyler.", "TDV calls this tetrachord Hicaz without giving its form. TDV gives B A13 S for the Hicaz on Hüseynî."),
      practice:L("Ölçüm yok.", "No measurement."),
      ask:L("Bu dörtlü Hicaz sayılır mı, biçimi böyle mi?", "Does this count as Hicaz, and is this its form?"),
      opts:[["bas", L("B A S doğru", "B A S is right")], ["other", L("Başka biçim", "Another form")], ["nothicaz", L("Hicaz sayılmaz", "Not Hicaz")], NOT_SURE] },
    { id:"ussak-segah", g:"cesni", hear:"ussak", title:L("Uşşak Segâh'ının icra akordu: çıkarken de pes mi?", "Practice tuning of Segâh in Uşşak: low when ascending too?"),
      now:L("Uşşak, Bayâtî, Karcığar ve Hüseynî'de Segâh çıkışta da inişte de −1,5 koma ölçülüyor (aralık −2 ile −1). Çıkış ve iniş için ayrı hedef yok, asma kararda da aynı.", "In Uşşak, Bayâtî, Karcığar and Hüseynî, Segâh is measured at −1.5 commas both ways (range −2 to −1). There is no separate target for ascending, descending or a suspended cadence."),
      theory:L("TDV Uşşak, inici seyirde 1–2 koma pes der, asma kararda değil.", "TDV's Uşşak entry says 1–2 commas low in descending seyir, not on a suspended cadence."),
      practice:L("Gürbüz 1983 ölçümü (Yarman 2008'de aktarılır): Dügâh'tan inerken 133, çıkarken 159 sent; AEU'da 181 sent. Ölçüm çıkarken de pes verir.", "Gürbüz's 1983 measurement (cited in Yarman 2008): 133 cents from Dügâh descending, 159 ascending; 181 in AEU. So it is low when ascending too."),
      ask:L("Öğrenciye hangi hedef gösterilsin?", "Which target should the student see?"),
      opts:[["single", L("Hep −1,5 kalsın", "Keep −1.5 always")], ["desc", L("Yalnız inerken pes", "Low only descending")], ["split", L("Çıkış ve iniş ayrı", "Separate up and down")], NOT_SURE] },
    { id:"sinama-huseyni", g:"sinama", title:L("Hüseynî ölçülmeden bitmiş sayılsın mı?", "Should Hüseynî count as done without being measured?"),
      now:L("Rast, Uşşak ve Hicaz turları geçilince Hüseynî dersi de bitmiş sayılıyor, ayrıca çalınmıyor. Gerekçe: dizisi Uşşak'a yakın ve ders zincirinde Hicaz'dan önce.", "Passing the Rast, Uşşak and Hicaz rounds also marks the Hüseynî lesson done, without playing it. The reason: its scale is close to Uşşak and it comes before Hicaz in the lesson chain."),
      theory:L("Uygulamanın dizilerinde iki makam çıkışta Evç ve Acem ile ayrılır; güçlüleri (Hüseynî, Nevâ) ve seyir türleri farklı.", "In the app's scales the two differ by Evç and Acem ascending; their dominants (Hüseynî, Nevâ) and seyir types differ."),
      ask:L("Bu kısayol uygun mu?", "Is this shortcut acceptable?"),
      opts:[["count", L("Sayılsın", "Count it")], ["measure", L("Ayrı ölçülsün", "Measure it")], ["no", L("Sayılmasın", "Don't count it")], NOT_SURE] },
    { id:"sinama-hicaz", g:"sinama", title:L("Kısa Hicaz seyri yeterli gösterge mi?", "Is a short Hicaz seyir a sufficient sign?"),
      now:L("En çok 40 sn, eşik 60 (Taksim 2: seyir dersinin Hicaz adımı gibi). Geçen kişi için Hüseynî ve Hicaz bitmiş sayılır; Makam sınavı geçilmiş sayılmaz. Ölçüm perde, durak ve güçlüye bakar; ezginin güzelliğini ölçemez.", "At most 40 s, threshold 60 (like the Hicaz step of Taksim 2: seyir). Passing marks Hüseynî and Hicaz done, but not the Makam exam. It measures perdes, final and dominant; it can't measure how good the melody is."),
      ask:L("Temel makamları bilen biri için bu yeterli gösterge mi?", "Does this show that someone knows the basic makams?"),
      opts:[["enough", L("Yeterli", "Sufficient")], ["more", L("Başka makam da", "Add another makam")], ["longer", L("Daha uzun", "Longer")], NOT_SURE] },
    { id:"sinama-turlar", g:"sinama", title:L("Üç turun seçimi ve eşikleri", "Choice of the three rounds and their thresholds"),
      now:L("Rast dizisi %50, Uşşak dizisi %55, Hicaz seyri 60; turlar sırayla, tutmayan tur bölümü bitirir. Makamlar ünitesinin 21 dersinden en çok 5'i geçilir.", "Rast scale 50%, Uşşak scale 55%, Hicaz seyir 60; rounds go in order and a failed round ends the section. At most 5 of the 21 lessons in the Makams unit are skipped."),
      ask:L("Turlar ve eşikler uygun mu?", "Are the rounds and thresholds right?"),
      opts:[["fit", L("Uygun", "Fine")], ["higher", L("Eşik yükselsin", "Raise them")], ["lower", L("Eşik düşsün", "Lower them")], NOT_SURE] },
    { id:"kapi-makam", g:"kapi", title:L("Makam dersleri Register sınavından sonra mı açılsın?", "Should makam lessons open after the Register exam?"),
      now:L("Teknik, hız, süsleme, makam ve Trakya üniteleri Register sınavı geçilince birlikte açılıyor; makam için teknik ünitesini bitirmek gerekmiyor.", "The technique, speed, ornament, makam and Thracian units all open with the Register exam; makam doesn't need the technique unit finished."),
      ask:L("Bu sıra uygun mu?", "Is this order right?"),
      opts:[["fit", L("Uygun", "Fine")], ["earlier", L("Daha erken", "Earlier")], ["later", L("Teknikten sonra", "After technique")], NOT_SURE] },
    { id:"kapi-ileri", g:"kapi", title:L("İleri seviye Makam sınavından sonra mı açılsın?", "Should Advanced open after the Makam exam?"),
      now:L("İleri ünitesi (beş taksim dersi, ileri kulak, iç tempo, deşifre, dikte) yalnız Makam sınavına bağlı; teknik, hız, süsleme ve Trakya sınavları şart değil.", "The Advanced unit (five taksim lessons, advanced ear, inner tempo, sight-reading, dictation) depends only on the Makam exam; the technique, speed, ornament and Thracian exams aren't required."),
      ask:L("Bu kapı yeterli mi?", "Is this gate enough?"),
      opts:[["fit", L("Uygun", "Fine")], ["more", L("Başka sınav da", "Require more exams")], ["earlier", L("Daha erken", "Earlier")], NOT_SURE] },
    { id:"kapi-taslar", g:"kapi", title:L("Kilometre taşları ilerlemeyi durdursun mu?", "Should milestones stop progress?"),
      now:L("Kapılar yalnız ünite sınavı; yol haritasındaki ölçülen kilometre taşlarını hoca kartı yalnız öneriyor.", "Only unit exams are gates; the coach card merely suggests the measured milestones on the roadmap."),
      ask:L("Kilometre taşı kapı olsun mu?", "Should a milestone be a gate?"),
      opts:[["suggest", L("Öneri kalsın", "Keep as advice")], ["gate", L("Kapı olsun", "Make it a gate")], ["some", L("Yalnız bazıları", "Only some")], NOT_SURE] },
    { id:"ceyrek-57", g:"parmak", title:L(qtAll.length + " çeyrek ses parmağı Türk Sol klarnetinde kullanılır mı?", "Are the " + qtAll.length + " quarter-tone fingerings usable on a Turkish G clarinet?"),
      now:L(qtNotes.size + " çeyrek seste " + qtAll.length + " parmak, WFG Oehler/Albert tablosundan (A. Wendl). Parmak kartında “doğrulanmamış” grubunda; ses kalitesi, geçiş ve kullanım yeri “bilinmiyor” yazılı.", qtAll.length + " fingerings for " + qtNotes.size + " quarter tones, from WFG's Oehler/Albert table (A. Wendl). They sit in the “unverified” group of the fingering card; tone quality, transitions and use are marked “unknown”."),
      ask:L("Parmaklar sekmesindeki “+ ¼” satırlarını tek tek işaretleyin; burada genel kanınızı yazın. Ses kalitesi, geçiş ve kullanım yerini nota yazın.", "Mark the “+ ¼” rows one by one in the Fingerings tab; give your overall view here. Note tone quality, transitions and where each is used."),
      opts:[["usable", L("Kullanılır", "Usable")], ["some", L("Bir kısmı", "Some of them")], ["no", L("Kullanılmaz", "Not usable")], NOT_SURE] },
    { id:"a-mandal", g:"parmak", title:L("“a” mandalı hangi mandal?", "Which key is the “a” key?"),
      now:L("WFG'ye göre sağ orta deliğin üstündeki mandal; şemada öyle çiziliyor. " + qtKeyA + " çeyrek ses parmağı bunu kullanıyor.", "According to WFG, the key above the right middle hole, and the chart draws it there. " + qtKeyA + " quarter-tone fingerings use it."),
      ask:L("Türk Sol klarnetinde karşılığı hangisi? Başka bir mandalsa nota yazın.", "What is it on a Turkish G clarinet? If it's another key, say which in the note."),
      opts:[["chart", L("Şemadaki doğru", "As on the chart")], ["other", L("Başka mandal", "Another key")], ["none", L("Bu çalgıda yok", "Not on this clarinet")], NOT_SURE] },
    { id:"benzer-makam", g:"taksim", title:L("Benzer makam listeleri öğretici mi?", "Are the similar-makam lists useful for teaching?"),
      now:L("Aynı durakta, dizisi en çok iki perdeyle ayrılan makamlar dizilerden hesaplanıyor (ör. Hüseynî, Uşşak'a Evç farkıyla benzer). Dizi yakınlığı müzikal yakınlıkla her zaman örtüşmez.", "Makams on the same final whose scales differ by at most two perdes are worked out from the scales (e.g. Hüseynî resembles Uşşak, differing by Evç). Scale closeness doesn't always match musical closeness."),
      ask:L("Yanıltıcı eşleşmeleri nota yazın.", "Note any misleading pairs."), opts:FIT },
    { id:"taksim-cesni", g:"taksim", title:L("“İlk çeşni = durak ile güçlü arası” sadeleştirmesi", "The “first çeşni = final to dominant” simplification"),
      now:L("Taksim 3 bu sadeleştirmeyle ölçüyor: bu perdelerin gezilmesi ve güçlüde biten cümleler. Ders metni bunun uygulamanın kabulü olduğunu söylüyor.", "Taksim 3 measures with this simplification: visiting these perdes and phrases ending on the dominant. The lesson says this is the app's own assumption."),
      ask:L("Öğrenciye böyle anlatmak uygun mu?", "Is it right to teach it this way?"), opts:FIT },
    { id:"taksim-karar", g:"taksim", title:L("Karar için “üstten ya da yedenden” gelme", "Reaching the cadence “from above or from the leading tone”"),
      now:L("Taksim 4: son cümle durakta, son nota en az 800 ms, durağa üstten ya da yedenden gelinmesi.", "Taksim 4: last phrase on the final, last note at least 800 ms, approaching the final from above or from the leading tone."),
      ask:L("Bu ölçü bütün makamlar için geçerli mi?", "Does this hold for all makams?"), opts:FIT },
    { id:"taksim-gecki", g:"taksim", title:L("Geçki ile yanlış makama kaymayı ayırmak", "Telling a modulation from drifting into the wrong makam"),
      now:L("Çalınan sürenin en az %8'i benzer makamın ayırt edici perdesinde geçer ve bu, o makamın karşılık gelen perdesinin en az iki katıysa uyarı çıkıyor. Yapay notalarla denendi, gerçek taksimle değil.", "A warning appears when at least 8% of the time is on a similar makam's distinguishing perde and that is at least twice as long as on this makam's matching perde. Tried with artificial notes, not a real taksim."),
      ask:L("Geçki yapan bir taksim uyarı almalı mı?", "Should a taksim with a modulation get this warning?"),
      opts:[["fit", L("Uyarı uygun", "Warning is fine")], ["loose", L("Eşik gevşesin", "Loosen it")], ["remove", L("Uyarı kalksın", "Remove it")], NOT_SURE] },
    { id:"gecme-esik", g:"taksim", title:L("Taksim derslerinin geçme eşikleri", "Pass thresholds of the taksim lessons"),
      now:L("Seyir adımlarında 55–75 (cümle 60–65, çeşni 65, karar 75).", "55–75 in the seyir steps (phrase 60–65, çeşni 65, cadence 75)."),
      ask:L("Bir öğrenciden bu düzey beklenir mi?", "Is this a fair level to expect?"),
      opts:[["fit", L("Uygun", "Fine")], ["higher", L("Yükselsin", "Raise them")], ["lower", L("Düşsün", "Lower them")], NOT_SURE] },
    { id:"kendim-akort", g:"metin", title:L("Kendim akordu hocalar için kullanışlı mı?", "Is the My tuning option useful for teachers?"),
      now:L("Akort ekranında makam başına her perdeye −3…+3 koma, 0,5 adım; çıkış ve iniş ayrı girilemiyor.", "On the tuner, each perde of a makam can be set from −3 to +3 commas in 0.5 steps; ascending and descending can't be set separately."),
      ask:L("Öğrencinize böyle perde verir miydiniz?", "Would you give your student perdes this way?"), opts:FIT },
    { id:"oyun-havasi", g:"metin", title:L("Oyun havası çalışları ve Trakya etütleri", "Dance-tune patterns and Thracian études"),
      now:L("Yedi oyun havası usulünün düm-tek kalıpları, ikinci çalışlar, dolgular; Nikriz dizisi ve 11 Trakya/Roman etüdü. Metin “yaygın bir çalış; yöreye, icracıya ve oyuna göre değişir” diyor.", "The düm-tek patterns of the seven dance usuls, second patterns and fills; the Nikriz scale and 11 Thracian/Romani études. The text says “a common pattern; it varies by region, player and dance”."),
      ask:L("Bir Trakya ya da Roman klarnetçisi dinleyip değerlendirsin. “Yaygın” denebilir mi?", "A Thracian or Romani clarinettist should listen. Is “common” fair?"), opts:FIT },
    { id:"baslangic-metin", g:"metin", title:L("Başlangıç dersleri ve kontrol listeleri", "Beginner lessons and checklists"),
      now:L("Kamış, eller, ağızlık, uzun ses, dil, ilk geçişler ve nefes dersleri sonradan yazıldı; oturuş açısı, dudak ve nefes anlatımı, Albert el pozisyonları gözden geçirilmedi. Oturuşta 5, ellerde 6 maddelik kontrol listesi var.", "The reed, hands, embouchure, long tone, tongue, first transitions and breath lessons were added later; sitting angle, embouchure and breath wording and Albert hand positions haven't been reviewed. Posture has a 5-item and hands a 6-item checklist."),
      ask:L("Dersleri okuyup düzeltilecek yerleri nota yazın.", "Read the lessons and note what to correct."), opts:FIT },
    { id:"uslup-metin", g:"metin", title:L("“Üslup üzerine” metni", "The “On style” text"),
      now:L("Videolar sekmesinde klasik, Trakya-Roman ve modern icrayı doğru-yanlış değil üslup olarak anlatıyor; bugünkü videoların hepsi Çorlu'dan iki hocanın tavrı.", "In the Videos tab it presents classical, Thracian-Romani and modern playing as styles, not right or wrong; all current videos show the manner of two teachers from Çorlu."),
      ask:L("Metin doğru ve adil mi?", "Is the text accurate and fair?"), opts:FIT },
    { id:"hiz-unite", g:"metin", title:L("Hız ünitesi", "Speed unit"),
      now:L("7 ders; gam ve arpej seçimi, hedef tempolar, hızlı Hicaz etüdü.", "7 lessons; choice of scales and arpeggios, target tempos, the fast Hicaz étude."),
      ask:L("Seçimler ve tempolar Sol klarnete uygun mu?", "Do the choices and tempos suit the G clarinet?"), opts:FIT }
  ];

  // İşaret düğmeleri ve yorum kutusu. Sorularda opts seçenekleri, ph not kutusunun ipucu, label grubun adı
  function verdictBox(key, o = {}){
    const it = rv.items[key] || {}, opts = o.opts || VERDICTS;
    return `<div class="rvv" data-key="${key}">
      <div class="seg" role="radiogroup" aria-label="${esc(o.label || L("Değerlendirme", "Verdict"))}">${opts.map(([v, t]) =>
        `<button type="button" role="radio" data-v="${v}" aria-checked="${it.v === v}">${t}</button>`).join("")}</div>
      <input type="text" class="rvc" placeholder="${o.ph || L("Yorum ya da doğrusu (ör. doğru parmak kodu)", "Comment or correction (e.g. the right fingering)")}" value="${esc(it.c || "")}">
    </div>`;
  }
  root.addEventListener("click", e => {
    const b = e.target.closest(".rvv [data-v]"); if(!b) return;
    const key = b.closest(".rvv").dataset.key, it = rv.items[key] || (rv.items[key] = {});
    it.v = it.v === b.dataset.v ? undefined : b.dataset.v;
    if(!it.v && !it.c) delete rv.items[key];
    b.parentNode.querySelectorAll("button").forEach(x => x.setAttribute("aria-checked", x.dataset.v === (it.v || "") ? "true" : "false"));
    save(); summary(); markHeads();
  });
  root.addEventListener("change", e => {
    if(!e.target.classList.contains("rvc")) return;
    const key = e.target.closest(".rvv").dataset.key, it = rv.items[key] || (rv.items[key] = {});
    it.c = e.target.value.trim();
    if(!it.v && !it.c) delete rv.items[key];
    save(); summary();
  });

  // Küçük parmak şeması (ana şemanın kopyası)
  function chart(code){
    const c = document.querySelector("svg.chart").cloneNode(true);
    c.querySelectorAll("[id]").forEach(n => { n.id = "rv-" + n.id; n.removeAttribute("tabindex"); n.removeAttribute("role"); n.removeAttribute("aria-label"); n.removeAttribute("aria-pressed"); });
    c.classList.add("minichart"); c.setAttribute("aria-hidden", "true");
    const on = new Set(fingeringIds(code).map(i => "rv-" + i));
    c.querySelectorAll(".hole, .key").forEach(n => { n.classList.toggle("on", on.has(n.id)); n.classList.toggle("half", on.has(n.id + "-half")); });
    return c;
  }

  let tab = store.get("review.tab", "f");
  function markHeads(){
    root.querySelectorAll("details[data-w]").forEach(d => {
      const w = +d.dataset.w, q = !!d.dataset.q, keys = (q ? quarterFingeringsFor(w) : fingeringsFor(w)).map((_, i) => (q ? "q:" : "f:") + w + ":" + i);
      const done = keys.filter(k => rv.items[k] && rv.items[k].v).length, bad = keys.some(k => rv.items[k] && rv.items[k].v === "bad");
      d.querySelector(".rvcount").textContent = done + "/" + keys.length + (bad ? " · " + L("yanlış var", "has errors") : "");
      d.classList.toggle("rvbad", bad);
    });
  }
  function renderFingers(){
    const body = $("rvbody");
    let html = "";
    for(let w=LOW_NOTE; w<=HIGH_NOTE; w++){
      const p = nearestPerde((w-67)*53/12);
      html += `<details class="rvnote" data-w="${w}"><summary><strong>${nn(w)}</strong> <span class="muted">${p ? p.name + " · " : ""}${fingeringsFor(w).length} ${L("parmak", "fingering(s)")}</span> <span class="rvcount muted"></span></summary><div class="rvlist"></div></details>`;
      // Çeyrek ses (WFG ocl_qt_*): yazılı notanın ≈ 50 sent tizi
      const nq = quarterFingeringsFor(w).length;
      if(nq) html += `<details class="rvnote" data-w="${w}" data-q="1"><summary><strong>${nn(w)} + ¼</strong> <span class="muted">${L("çeyrek ses", "quarter tone")} · ${nq} ${L("parmak", "fingering(s)")}</span> <span class="rvcount muted"></span></summary><div class="rvlist"></div></details>`;
    }
    body.innerHTML = html;
    body.querySelectorAll("details[data-w]").forEach(d => d.addEventListener("toggle", () => {
      if(!d.open || d.dataset.built) return;
      d.dataset.built = "1";
      const w = +d.dataset.w, q = !!d.dataset.q, list = d.querySelector(".rvlist");
      (q ? quarterFingeringsFor(w) : fingeringsFor(w)).forEach((fg, i) => {
        const item = document.createElement("div"); item.className = "rvitem";
        item.appendChild(chart(fg.code));
        const side = document.createElement("div");
        const steps = describeFingering(fg.code).filter(r => r.active).map(r => `<li><b>${esc(r.part)}</b> <span>${esc(r.text)}</span></li>`).join("");
        side.innerHTML = `<div class="label">${q ? L("Çeyrek ses parmağı ", "Quarter-tone fingering ") + (i + 1) : i ? L("Alternatif ", "Alternative ") + i : L("Temel parmak", "Basic fingering")}</div>
          <code class="fcode">${esc(fg.code)}</code>${fg.note ? `<p class="muted">${esc(fg.note)}</p>` : ""}
          <ul class="rvsteps">${steps || `<li>${L("Hiçbir şey basılı değil", "Nothing pressed")}</li>`}</ul>
          <button class="stopbtn" type="button" data-hear="${w}"${q ? ' data-q="1"' : ""}>${L("Notayı duy", "Hear the note")}</button>
          ${verdictBox((q ? "q:" : "f:") + w + ":" + i)}`;
        item.appendChild(side);
        list.appendChild(item);
      });
    }));
    markHeads();
  }
  const hearBar = mk => `<div class="pbar"><button class="stopbtn" type="button" data-mkhear="${mk.id}" data-mode="aeu">${L("Diziyi dinle (AEU)", "Hear the scale (AEU)")}</button>
          ${Object.keys(mk.icra).length ? `<button class="stopbtn" type="button" data-mkhear="${mk.id}" data-mode="icra">${L("Diziyi dinle (icra)", "Hear the scale (practice)")}</button>` : ""}</div>`;
  function renderMakams(){
    $("rvbody").innerHTML = MAKAMS.map(mk => {
      const chips = list => list.map(c => `<span class="pchip"><b>${perdeName(c)}</b><small>${nn(commaToWritten(c))} · ${c} k</small></span>`).join("");
      const fix = Object.entries(mk.icra).map(([k, d]) => perdeNameAt(+k) + " " + (d > 0 ? "+" : "−") + Math.abs(d) + " k").join(", ");
      const st = { cikici: L("çıkıcı", "ascending"), inici: L("inici", "descending"), "inici-cikici": L("inici-çıkıcı", "descending-ascending") }[mk.seyirType];
      return `<div class="rvmk">
        <h3 class="lstitle">${mk.name}</h3>
        <div class="kv"><div><span class="label">${L("Durak", "Final")}</span>${perdeName(mk.durak)}</div>
          <div><span class="label">${L("Güçlü", "Dominant")}</span>${perdeName(mk.guclu)}</div>
          <div><span class="label">${L("Yeden", "Leading tone")}</span>${perdeName(mk.yeden)}</div>
          <div><span class="label">${L("Seyir", "Seyir")}</span>${st}</div>
          <div><span class="label">${L("İcra düzeltmesi", "Practice tuning")}</span>${fix || "—"}</div></div>
        <p class="seyir">${esc(seyirText(mk, LANG))}</p>
        <div class="label">${L("Çıkış", "Ascending")}</div><div class="chiprow">${chips(mk.asc)}</div>
        <div class="label">${L("İniş", "Descending")}</div><div class="chiprow">${chips([...mk.desc].reverse())}</div>
        ${hearBar(mk)}
        ${verdictBox("m:" + mk.id)}
      </div>`;
    }).join("");
  }
  function renderOrnaments(){
    $("rvbody").innerHTML = ORN_REVIEW.map(o => {
      if(o.etude){
        const e = etudeById(o.etude);
        return `<div class="rvmk"><h3 class="lstitle">${esc(pick(e.name, LANG))}</h3>
          <p class="muted">${L("Etüt ve eserler sekmesinde dinlenebilir. Süsleme ekleri: k giriş, ç+ çarpma, m+/m- mordan, tr tril, gr grupetto, d düşüş.", "Can be heard in the Études & pieces tab. Ornament marks: k slide-in, ç+ grace note, m+/m- mordent, tr trill, gr turn, d fall.")}</p>
          <code class="fcode">${esc(e.text)}</code>${verdictBox("o:" + o.id)}</div>`;
      }
      return `<div class="rvmk"><h3 class="lstitle">${o.name}</h3><p>${o.def}</p>
        <div class="pbar"><button class="stopbtn" type="button" data-ornhear="${o.id}">${L("Örneği dinle", "Hear the example")}</button></div>
        ${verdictBox("o:" + o.id)}</div>`;
    }).join("");
  }
  // Sorular: uygulamada olan, teori ve icra ayrı satırlarda; hocanın görüşü seçenek ve not olarak gelir
  function renderQuestions(){
    const row = (label, text) => text ? `<div><dt class="label">${label}</dt><dd>${esc(text)}</dd></div>` : "";
    $("rvbody").innerHTML = `<p class="pdesc">${L("Kaynakların ayrıştığı ya da uzman kararı gereken konular. “Uygulamada” bugün kodda olandır; “Teori” yazılı kaynağın, “İcra” ölçüm ya da nota verisinin dediğidir. Hiçbiri kesin hüküm değil: görüşünüzü seçin, gerekçenizi nota yazın.",
        "Topics where sources disagree or an expert decision is needed. “In the app” is what the code does today; “Theory” is what written sources say, “Practice” what measurements or scores show. None is a final ruling: pick your view and add your reasoning in the note.")}</p>` +
      Q_GROUPS.map(([g, name]) => `<h3 class="lstitle">${name}</h3>` + QUESTIONS.filter(q => q.g === g).map(q => `<div class="rvmk rvq">
        <h4 class="rvqt">${esc(q.title)}</h4>
        <dl class="rvqf">${row(L("Uygulamada", "In the app"), q.now)}${row(L("Teori (kaynak)", "Theory (source)"), q.theory)}${row(L("İcra (ölçüm, nota)", "Practice (measurements, scores)"), q.practice)}${row(L("Hocaya soru", "Question for the teacher"), q.ask)}</dl>
        ${q.hear ? hearBar(makamById(q.hear)) : ""}
        ${verdictBox("s:" + q.id, { opts:q.opts, label:q.title, ph:L("Not: gerekçe, kaynak ya da doğrusu", "Note: reasoning, source or correction") })}
      </div>`).join("")).join("");
  }
  let hearToken = null;
  SK.on("stopall", () => { hearToken = null; });
  root.addEventListener("click", async e => {
    const oh = e.target.closest("[data-ornhear]");
    if(oh){
      const o = ORN_REVIEW.find(x => x.id === oh.dataset.ornhear), f = c => midiToFreq(commaToMidi(c) - T);
      SK.playGlide(ornamentNotes(o).map(x => ({ freq: f(x.comma), ms: x.ms, toFreq: x.to != null ? f(x.to) : null })));
      return;
    }
    const h = e.target.closest("[data-hear]");
    if(h){ const w = +h.dataset.hear; SK.play(w, h.dataset.q ? midiToFreq(w + 0.5 - T) : undefined); await sleep(1200); if(SK.playing() === w) SK.stopSound(); return; }
    const m = e.target.closest("[data-mkhear]");
    if(m){
      const mk = makamById(m.dataset.mkhear), token = {}; hearToken = token;
      for(const c of [...mk.asc, ...[...mk.desc].reverse().slice(1)]){
        if(hearToken !== token) return;
        SK.play(commaToWritten(c), midiToFreq(commaToMidi(perdeTarget(mk, c, m.dataset.mode)) - T)); await sleep(520);
      }
      if(hearToken === token) SK.stopSound();
    }
    const tb = e.target.closest("[data-rt]");
    if(tb){ tab = tb.dataset.rt; store.set("review.tab", tab); render(); }
  });
  function render(){
    root.querySelectorAll("[data-rt]").forEach(b => b.setAttribute("aria-selected", b.dataset.rt === tab ? "true" : "false"));
    if(tab === "m") renderMakams(); else if(tab === "o") renderOrnaments(); else if(tab === "s") renderQuestions(); else renderFingers();
    summary();
  }

  // ---- Rapor ----
  function report(){
    const lines = [L("Sol Klarnet — uzman kontrolü raporu", "Sol Klarnet — expert review report"),
      L("Kontrol eden: ", "Reviewer: ") + (rv.name || "—"), L("Tarih: ", "Date: ") + new Date().toISOString().slice(0, 10), ""];
    const vt = v => ({ ok: L("DOĞRU", "CORRECT"), bad: L("YANLIŞ", "WRONG"), unsure: L("EMİN DEĞİL", "UNSURE") })[v] || "—";
    for(const k of allItems()){
      const it = rv.items[k]; if(!it) continue;
      if(isQ(k)){
        const q = QUESTIONS.find(x => x.id === k.slice(2)), opt = q.opts.find(([v]) => v === it.v);
        lines.push(L("SORU", "QUESTION") + " [" + q.id + "] " + q.title + " → " + (opt ? opt[1] : L("cevap yok", "no answer")) + (it.c ? " — " + it.c : ""));
        continue;
      }
      let what;
      if(k.startsWith("f:")){ const [, w, i] = k.split(":"); what = nn(+w) + (+i ? " " + L("alt. ", "alt. ") + i : " " + L("temel", "basic")) + " [" + fingeringsFor(+w)[+i].code + "]"; }
      else if(k.startsWith("q:")){ const [, w, i] = k.split(":"); what = nn(+w) + " + ¼ " + L("çeyrek ses ", "quarter tone ") + (+i + 1) + " [" + quarterFingeringsFor(+w)[+i].code + "]"; }
      else if(k.startsWith("o:")){ const o = ORN_REVIEW.find(x => x.id === k.slice(2)); what = L("Süsleme ", "Ornament ") + (o.etude ? pick(etudeById(o.etude).name, LANG) : o.name); }
      else what = "Makam " + makamById(k.slice(2)).name;
      lines.push(vt(it.v) + " · " + what + (it.c ? " — " + it.c : ""));
    }
    const all = allItems().filter(k => !isQ(k)), done = all.filter(k => rv.items[k] && rv.items[k].v).length;
    lines.push("", L("Kontrol edilen: ", "Reviewed: ") + done + "/" + all.length, L("Cevaplanan soru: ", "Questions answered: ") + answered() + "/" + QUESTIONS.length,
      "", "JSON:", JSON.stringify({ app:"sol-klarnet-review", v:1, name:rv.name, items:rv.items }));
    return lines.join("\n");
  }
  $("rvcopy").addEventListener("click", async () => {
    try{ await navigator.clipboard.writeText(report()); $("rvmsg").textContent = L("Kopyalandı.", "Copied."); }
    catch(e){ $("rvmsg").textContent = L("Kopyalanamadı.", "Couldn't copy."); }
  });
  $("rvshare").addEventListener("click", async () => {
    const text = report(), P = window.Capacitor && window.Capacitor.Plugins;
    try{
      if(P && P.Share) await P.Share.share({ title: L("Sol Klarnet uzman raporu", "Sol Klarnet expert report"), text });
      else if(navigator.share) await navigator.share({ title: L("Sol Klarnet uzman raporu", "Sol Klarnet expert report"), text });
      else { await navigator.clipboard.writeText(text); $("rvmsg").textContent = L("Paylaşım yok; rapor panoya kopyalandı.", "No share option; the report was copied."); }
    }catch(e){ if(!e || e.name !== "AbortError") $("rvmsg").textContent = L("Paylaşılamadı.", "Couldn't share."); }
  });

  let built = false;
  SK.on("view", d => { if(d.v === "review" && !built){ built = true; render(); } });
  if(document.body.dataset.view === "review"){ built = true; render(); }
})();
