// Öğrenme özellikleri için saf mantık: makam dizileri, usuller, parmak testi, uzun ton puanı,
// entonasyon istatistiği, nota bölütleme, vibrato/glissando, taklit ve eser takibi, ilerleme.
// Tarayıcıda core.js'ten sonra <script src="learn.js"> ile, Node'da require("./learn.js") ile yüklenir.

const CORE = typeof module !== "undefined" ? require("./core.js")
  : { PERDES, nearestPerde, noteName, LOW_NOTE, HIGH_NOTE, fingeringsFor };

// ---- Makamlar ----
// Perdeler Rast'a (yazılı Sol4) göre koma cinsinden, AEU 53 koma sistemi.
// Diziler çeşni birleşimlerinden kuruldu (ör. Uşşak = Uşşak dörtlüsü + Bûselik beşlisi Nevâ'da);
// asc çıkıcı, desc inici (pesten tize yazılı, inerken tersten çalınır).
// Durak, güçlü, yeden, dizi ve seyir TDV İslâm Ansiklopedisi'nin makam maddelerine göre; kaynaklar docs/KAYNAKLAR.md'de.
const MAKAMS = [
  { id:"rast", name:"Rast", durak:0, guclu:31, yeden:-5,
    asc:[0,9,17,22,31,40,48,53], desc:[0,9,17,22,31,40,44,53],
    seyir:"Çıkıcı. Rast beşlisi + Nevâ'da Rast dörtlüsü. İnerken Evç yerine Acem basılır; Nevâ'da yarım, Rast'ta tam karar.",
    seyirEn:"Ascending. Rast pentachord + Rast tetrachord on Nevâ. Coming down, Acem replaces Evç; half cadence on Nevâ, final on Rast." },
  { id:"ussak", name:"Uşşak", durak:9, guclu:31, yeden:0,
    asc:[9,17,22,31,40,44,53,62], desc:[9,17,22,31,40,44,53,62],
    seyir:"Çıkıcı. Dügâh'ta Uşşak dörtlüsü + Nevâ'da Bûselik beşlisi. Nevâ civarında gezinip Dügâh'ta karar verir.",
    seyirEn:"Ascending. Uşşak tetrachord on Dügâh + Bûselik pentachord on Nevâ. Wanders around Nevâ and comes to the final on Dügâh." },
  { id:"huseyni", name:"Hüseynî", durak:9, guclu:40, yeden:0,
    asc:[9,17,22,31,40,48,53,62], desc:[9,17,22,31,40,44,53,62],
    seyir:"İnici-çıkıcı. Dügâh'ta Hüseynî beşlisi + Hüseynî'de Uşşak dörtlüsü. Güçlü Hüseynî; inerken Acem.",
    seyirEn:"Descending-ascending. Hüseynî pentachord on Dügâh + Uşşak tetrachord on Hüseynî. Dominant Hüseynî; Acem when coming down." },
  { id:"hicaz", name:"Hicaz", durak:9, guclu:31, yeden:0,
    asc:[9,14,26,31,40,48,53,62], desc:[9,14,26,31,40,44,53,62],
    seyir:"İnici-çıkıcı (bazen çıkıcı). Dügâh'ta Hicaz dörtlüsü (Dik Kürdî, Nim Hicaz) + Nevâ'da Rast beşlisi. Ezgi durak ya da güçlü civarından başlar; Nevâ'da Rast çeşnisiyle yarım karar, Dügâh'ta tam karar. Nevâ'daki Rast beşlisi Acem'le de çalınır (acemli rast).",
    seyirEn:"Descending-ascending (sometimes ascending). Hicaz tetrachord on Dügâh (Dik Kürdî, Nim Hicaz) + Rast pentachord on Nevâ. The melody opens around the final or the dominant; half cadence on Nevâ with Rast, final on Dügâh. The Rast pentachord on Nevâ is also played with Acem (acemli rast)." },
  { id:"huzzam", name:"Hüzzam", durak:17, guclu:31, yeden:13,
    asc:[17,22,31,36,48,53,62,70], desc:[17,22,31,36,48,53,62,70],
    seyir:"İnici-çıkıcı. Segâh'ta Hüzzam beşlisi; ezgi durak ya da güçlü civarından başlar. Nevâ'da Hicaz çeşnisiyle (Hisar, Evç) yarım karar; Segâh'ta karar ederken Kürdî yeden olur. Hisar uygulamada biraz tiz basılır.",
    seyirEn:"Descending-ascending. Hüzzam pentachord on Segâh; the melody opens around the final or the dominant. Half cadence on Nevâ with Hicaz (Hisar, Evç); Kürdî leads into the final on Segâh. Hisar is played a little high in practice." },
  { id:"segah", name:"Segâh", durak:17, guclu:31, yeden:13,
    asc:[17,22,31,39,48,53,62,70], desc:[17,22,31,40,44,53,62,70],
    seyir:"Çıkıcı. Segâh'ta Segâh beşlisi (Dik Hisar, Evç); inerken Evç yerine Acem, Dik Hisar yerine çoğu zaman Hüseynî gelir. Nevâ'da yarım karar; Segâh'ta karar ederken Kürdî yeden olur.",
    seyirEn:"Ascending. Segâh pentachord on Segâh (Dik Hisar, Evç); coming down, Acem replaces Evç and Hüseynî often replaces Dik Hisar. Half cadence on Nevâ; Kürdî leads into the final on Segâh." },
  { id:"saba", name:"Saba", durak:9, guclu:22, yeden:0,
    asc:[9,17,22,27,40,44,53,58], desc:[9,17,22,27,40,44,53,58],
    seyir:"Çıkıcı (bazen çıkıcı-inici). Dügâh'ta Saba dörtlüsü (Segâh, Çargâh, Hicaz). Güçlü Çargâh: orada Zirgüleli Hicaz çeşnisiyle yarım karar. Diziyi oktavda tekrar etmez.",
    seyirEn:"Ascending (sometimes ascending-descending). Saba tetrachord on Dügâh (Segâh, Çargâh, Hicaz). Dominant Çargâh: half cadence there with Zirgüleli Hicaz. The scale does not repeat at the octave." },
  { id:"kurdi", name:"Kürdî", durak:9, guclu:31, yeden:0,
    asc:[9,13,22,31,40,44,53,62], desc:[9,13,22,31,40,44,53,62],
    seyir:"Çıkıcı (bazen çıkıcı-inici). Dügâh'ta Kürdî dörtlüsü + Nevâ'da Bûselik beşlisi. Ezgi durak ya da güçlü civarından başlar; Nevâ'da Bûselik çeşnisiyle yarım karar, Çargâh'ta, Kürdî'de ve Rast'ta asma kararlar, Dügâh'ta karar.",
    seyirEn:"Ascending (sometimes ascending-descending). Kürdî tetrachord on Dügâh + Bûselik pentachord on Nevâ. The melody opens around the final or the dominant; half cadence on Nevâ with Bûselik, passing cadences on Çargâh, Kürdî and Rast, final on Dügâh." },
  { id:"nihavend", name:"Nihâvend", durak:0, guclu:31, yeden:-5,
    asc:[0,9,13,22,31,35,48,53], desc:[0,9,13,22,31,35,44,53],
    seyir:"İnici-çıkıcı (bugün çıkıcı ya da inici de kullanılır). Rast'ta Bûselik beşlisi + Nevâ'da Kürdî ya da Hicaz dörtlüsü. Nevâ'da çoğunlukla Kürdî'yle yarım, Nim Hisar ve Çargâh'ta asma karar; Rast'ta tam karar.",
    seyirEn:"Descending-ascending (today also ascending or descending). Bûselik pentachord on Rast + Kürdî or Hicaz tetrachord on Nevâ. Half cadence on Nevâ, mostly with Kürdî; passing cadences on Nim Hisar and Çargâh; final on Rast." },
  // ---- Genişletilmiş makamlar (ileri seviye) ----
  { id:"bayati", name:"Bayâtî", durak:9, guclu:31, yeden:0,
    asc:[9,17,22,31,40,44,53,62], desc:[9,17,22,31,40,44,53,62],
    seyir:"İnici-çıkıcı. Dizisi Uşşak'la aynı; ezgi Nevâ civarından başlar, Uşşak'tan farkı seyirdedir. Dügâh'ta karar.",
    seyirEn:"Descending-ascending. Same scale as Uşşak; the melody opens around Nevâ, the difference is in the seyir. Final on Dügâh." },
  { id:"karcigar", name:"Karcığar", durak:9, guclu:31, yeden:0,
    asc:[9,17,22,31,36,48,53,62], desc:[9,17,22,31,36,48,53,62],
    seyir:"İnici-çıkıcı. Dügâh'ta Uşşak dörtlüsü + Nevâ'da Hicaz beşlisi (Hisar, Evç). Nevâ'da yarım karar, Dügâh'ta tam karar.",
    seyirEn:"Descending-ascending. Uşşak tetrachord on Dügâh + Hicaz pentachord on Nevâ (Hisar, Evç). Half cadence on Nevâ, final on Dügâh." },
  { id:"humayun", name:"Hümâyun", durak:9, guclu:31, yeden:0,
    asc:[9,14,26,31,40,44,53,62], desc:[9,14,26,31,40,44,53,62],
    seyir:"İnici-çıkıcı (bazen çıkıcı). Dügâh'ta Hicaz dörtlüsü + Nevâ'da Bûselik beşlisi; Nevâ'da Bûselik çeşnisiyle yarım karar. Hicaz ailesinin hüzünlü rengi.",
    seyirEn:"Descending-ascending (sometimes ascending). Hicaz tetrachord on Dügâh + Bûselik pentachord on Nevâ; half cadence on Nevâ with Bûselik. The melancholy colour of the Hicaz family." },
  { id:"uzzal", name:"Uzzâl", durak:9, guclu:40, yeden:0,
    asc:[9,14,26,31,40,48,53,62], desc:[9,14,26,31,40,44,53,62],
    seyir:"İnici-çıkıcı (bazen çıkıcı). Dügâh'ta Hicaz beşlisi + Hüseynî'de Uşşak dörtlüsü. Güçlü Hüseynî; Nevâ ve Hüseynî çevresinde gezinir, inerken Evç yerine Acem basılır.",
    seyirEn:"Descending-ascending (sometimes ascending). Hicaz pentachord on Dügâh + Uşşak tetrachord on Hüseynî. Dominant Hüseynî; wanders around Nevâ and Hüseynî, Acem replaces Evç coming down." },
  { id:"zirguleli", name:"Zirgüleli Hicaz", durak:9, guclu:40, yeden:4,
    asc:[9,14,26,31,40,45,57,62], desc:[9,14,26,31,40,45,57,62],
    seyir:"İnici-çıkıcı. Dügâh'ta Hicaz beşlisi + Hüseynî'de Hicaz dörtlüsü (Dik Acem, Nim Şehnaz): iki Hicaz çeşnisi üst üste. Ezgi güçlü Hüseynî civarından başlar, orada Hicaz çeşnisiyle yarım karar; Nim Zirgüle yeden olup Dügâh'ta karar.",
    seyirEn:"Descending-ascending. Hicaz pentachord on Dügâh + Hicaz tetrachord on Hüseynî (Dik Acem, Nim Şehnaz): two Hicaz flavours stacked. The melody opens around the dominant Hüseynî, with a Hicaz half cadence there; Nim Zirgüle leads into the final on Dügâh." },
  { id:"suzinak", name:"Sûzinak", durak:0, guclu:31, yeden:-5,
    asc:[0,9,17,22,31,36,48,53], desc:[0,9,17,22,31,36,48,53],
    seyir:"İnici-çıkıcı. Rast'ta Rast beşlisi + Nevâ'da Hicaz dörtlüsü; Rast'ın parlaklığına Hicaz'ın rengi eklenir. Ezgi Nevâ civarından başlar, Nevâ'da Hicaz çeşnisiyle yarım karar; Rast'ta çoğu zaman yedensiz karar.",
    seyirEn:"Descending-ascending. Rast pentachord on Rast + Hicaz tetrachord on Nevâ; Rast's brightness with the colour of Hicaz. The melody opens around Nevâ, with a Hicaz half cadence there; the final on Rast usually comes without the leading tone." },
  { id:"hicazkar", name:"Hicazkâr", durak:0, guclu:53, yeden:-5,
    asc:[0,5,17,22,31,36,48,53], desc:[0,5,17,22,31,36,48,53],
    seyir:"İnici. Rast'ta Hicaz beşlisi (Zirgüle, Segâh) + Nevâ'da Hicaz dörtlüsü; Zirgüleli Hicaz'ın Rast'a göçürülmüşü. Ezgi Gerdâniye civarından başlar, güçlü Gerdâniye'de yarım karar; Nevâ ikinci güçlüdür.",
    seyirEn:"Descending. Hicaz pentachord on Rast (Zirgüle, Segâh) + Hicaz tetrachord on Nevâ; Zirgüleli Hicaz transposed to Rast. The melody starts around Gerdâniye, half cadence on the dominant Gerdâniye; Nevâ is the second dominant." },
  { id:"kurdilihicazkar", name:"Kürdîli Hicazkâr", durak:0, guclu:53, yeden:-9,
    asc:[0,4,13,22,31,35,44,53], desc:[0,4,13,22,31,35,44,53],
    seyir:"İnici. Rast'ta Kürdî dörtlüsü + Çargâh'ta Bûselik dizisi; ezgi Gerdâniye civarından başlar, güçlü Gerdâniye'de yarım karar. Karara yakın Acem Aşîran'da Bûselik'le kalmak âdettir.",
    seyirEn:"Descending. Kürdî tetrachord on Rast + Bûselik scale on Çargâh; the melody starts around Gerdâniye, half cadence on the dominant Gerdâniye. Near the end it customarily rests on Acem Aşîran with Bûselik." },
  { id:"mahur", name:"Mâhur", durak:0, guclu:53, yeden:-4,
    asc:[0,9,18,22,31,40,49,53], desc:[0,9,18,22,31,40,49,53],
    seyir:"İnici. Rast'ta Çargâh beşlisi + Nevâ'da Çargâh dörtlüsü (Bûselik, Mâhur perdeleri); ezgi Gerdâniye civarından başlar, güçlü Gerdâniye'de Çargâh çeşnisiyle yarım karar; Geveşt yeden olup Rast'ta karar.",
    seyirEn:"Descending. Çargâh pentachord on Rast + Çargâh tetrachord on Nevâ (Bûselik and Mâhur perdes); the melody starts around Gerdâniye, half cadence with Çargâh on the dominant Gerdâniye; Geveşt leads into the final on Rast." },
  { id:"acemasiran", name:"Acemaşîran", durak:-9, guclu:44, yeden:-13,
    asc:[-9,0,9,13,22,31,40,44], desc:[-9,0,9,13,22,31,40,44],
    seyir:"İnici. Acem makamı gibi gezinip Acem Aşîran'da Çargâh dörtlüsüyle karar verir; güçlüleri sırasıyla Acem, Çargâh ve Dügâh. Dizi: Acem Aşîran'da Çargâh beşlisi + Çargâh'ta Çargâh dörtlüsü (Kürdî perdesiyle).",
    seyirEn:"Descending. It moves like the Acem makam and ends on Acem Aşîran with a Çargâh tetrachord; its dominants are Acem, Çargâh and Dügâh, in that order. Scale: Çargâh pentachord on Acem Aşîran + Çargâh tetrachord on Çargâh (with the Kürdî perde)." },
  // ---- Trakya oyun havalarında da kullanılan makam ----
  { id:"nikriz", name:"Nikriz", durak:0, guclu:31, yeden:-5,
    asc:[0,9,13,26,31,40,48,53], desc:[0,9,13,26,31,40,44,53],
    seyir:"Çıkıcı (ya da inici-çıkıcı). Rast'ta Nikriz beşlisi (Kürdî, Nim Hicaz) + Nevâ'da Rast ve Bûselik dörtlüleri: çıkarken Rast (Evç), inerken Bûselik (Acem). Nevâ'da yarım, Rast'ta yedenli tam karar; Trakya karşılamalarında da kullanılır.",
    seyirEn:"Ascending (or descending-ascending). Nikriz pentachord on Rast (Kürdî, Nim Hicaz) + Rast and Bûselik tetrachords on Nevâ: Rast (Evç) going up, Bûselik (Acem) coming down. Half cadence on Nevâ, final on Rast with the leading tone; also heard in Thracian karşılamas." }
];
// Seyir türü: ezginin dizide nereden başlayıp nasıl gezindiği (seyir analizinde kullanılır)
const SEYIR_TYPE = { rast:"cikici", ussak:"cikici", huseyni:"inici-cikici", hicaz:"inici-cikici", huzzam:"inici-cikici",
  segah:"cikici", saba:"cikici", kurdi:"cikici", nihavend:"inici-cikici", bayati:"inici-cikici", karcigar:"inici-cikici",
  humayun:"inici-cikici", uzzal:"inici-cikici", zirguleli:"inici-cikici", suzinak:"inici-cikici", hicazkar:"inici",
  kurdilihicazkar:"inici", mahur:"inici", acemasiran:"inici", nikriz:"cikici" };
// İcra akordu: uygulamada AEU değerinden sapan perdeler (koma, perdenin mod 53 değerine göre). Yalnız kaynağı olanlar:
// Dügâh'taki Uşşak dörtlüsünün Segâh'ı 1-2 koma pes (Gürbüz 1983 ölçümü, Yarman 2008'de aktarılır);
// Hüzzam'da Hisar tiz (TDV: Hisar-Evç artık ikilisi 12 değil 10,5-11 koma); Saba'da Hicaz 2-2,5 koma dik (TDV).
// Yaklaşıktır; ayrıntı docs/KAYNAKLAR.md'de.
const ICRA = {
  ussak:{ 17:-1.5 }, bayati:{ 17:-1.5 }, karcigar:{ 17:-1.5 }, huseyni:{ 17:-1.5 },
  huzzam:{ 36:1.5 }, saba:{ 27:2 }
};
MAKAMS.forEach(m => { m.seyirType = SEYIR_TYPE[m.id]; m.icra = ICRA[m.id] || {}; });
const makamById = id => MAKAMS.find(m => m.id === id) || null;
const seyirText = (mk, lang) => lang === "en" && mk.seyirEn ? mk.seyirEn : mk.seyir;
// Akort bağlamı: makamın perdeleri ve (icra seçiliyse) düzeltmeler
function tuningCtx(mk, mode){
  if(!mk) return null;
  const offsets = {};
  if(mode === "icra") for(const [c, d] of Object.entries(mk.icra)) offsets[c] = d;
  return { scale: [...new Set([...mk.asc, ...mk.desc])], offsets };
}
// Bir perdenin seçili akorttaki hedefi (koma)
function perdeTarget(mk, c, mode){
  if(!mk || mode !== "icra") return c;
  return c + (mk.icra[((c % 53) + 53) % 53] || 0);
}

// Koma değerinin AEU perde adı (tam eşleşme yoksa en yakını)
function perdeName(c){
  const exact = CORE.PERDES.find(p => p[0] === c);
  if(exact) return exact[1];
  const n = CORE.nearestPerde(c);
  return n ? n.name : null;
}
// Koma değerine en yakın yazılı nota (MIDI)
const commaToWritten = c => Math.round(67 + c*12/53);
// Yazılı notadan çıkan ses için frekans katsayısı yok; koma → yazılı kesirli MIDI
const commaToMidi = c => 67 + c*12/53;

// Dizi alıştırmasındaki bir perdenin değerlendirmesi.
// played: çalınan koma, target: hedef koma, scale: dizideki komalar.
// Çalınan perde hedef yerine dizinin dışındaki başka bir perdeye daha yakınsa onu da söyler.
function judgePerde(played, target, scale){
  const dev = played - target;
  let other = null;
  const near = CORE.nearestPerde(played);
  if(near && near.comma !== target && !scale.includes(near.comma) &&
     Math.abs(near.delta) < Math.abs(dev)) other = near.name;
  return { dev, ok: Math.abs(dev) <= 1, other };
}

// ---- Usuller ----
// strokes: [vuruş, birim] — D düm, T tek; birim usulün `unit` değerinde.
const USULS = [
  { id:"semai",   name:"Semâî",      meter:"3/4",  strokes:[["D",1],["T",1],["T",1]] },
  { id:"sofyan",  name:"Sofyan",     meter:"4/4",  strokes:[["D",2],["T",1],["T",1]] },
  // Klasik usullerin vuruşları TDV İslâm Ansiklopedisi'nin usul şemalarına göre (docs/KAYNAKLAR.md)
  { id:"duyek",   name:"Düyek",      meter:"8/8",  strokes:[["D",1],["T",2],["T",1],["D",2],["T",2]] },
  { id:"aksak",   name:"Aksak",      meter:"9/8",  strokes:[["D",2],["T",1],["T",1],["D",2],["T",2],["T",1]] },
  { id:"agiraksak", name:"Ağır Aksak", meter:"9/4", strokes:[["D",2],["T",1],["T",1],["D",2],["T",2],["T",1]] },
  // Curcuna: Aksak Semâî'nin 10/16 mertebesi, notada çoğu zaman 10/8 yazılır
  { id:"curcuna", name:"Curcuna",    meter:"10/8", strokes:[["D",2],["T",1],["T",2],["D",2],["T",2],["T",1]] },
  { id:"turkaksagi", name:"Türk Aksağı", meter:"5/8", strokes:[["D",2],["T",2],["T",1]] },
  { id:"yuruksemai", name:"Yürük Semâî", meter:"6/8", strokes:[["D",1],["T",1],["T",1],["D",1],["T",2]] },
  // Trakya, Rumeli ve Roman oyun havaları (halk: true). Vuruş kalıpları yaygın darbuka çalışından; bir hocaya kontrol ettirilmeli.
  { id:"kasap",      name:"Kasap havası", meter:"2/4", halk:true, strokes:[["D",1],["T",1]] },
  { id:"ciftetelli", name:"Çiftetelli",   meter:"8/8", halk:true, strokes:[["D",1],["T",2],["T",1],["D",1],["D",1],["T",2]] },
  { id:"karsilama",  name:"Karşılama",    meter:"9/8", halk:true, strokes:[["D",2],["T",2],["D",2],["T",3]] },
  { id:"roman",      name:"Roman havası", meter:"9/8", halk:true, strokes:[["D",2],["T",2],["T",2],["D",1],["T",2]] },
  { id:"rumeli",     name:"Rumeli",       meter:"7/8", halk:true, strokes:[["D",2],["T",2],["T",3]] },
  { id:"sirto",      name:"Sirto",        meter:"2/4", halk:true, strokes:[["D",1],["T",1]] },
  // Zeybek: ağır 9/4 (2+2+2+3), Ağır Aksak'ın vuruşlarıyla (TDV: ağır aksak ağır oyun havalarında da kullanılır)
  { id:"zeybek",     name:"Zeybek",       meter:"9/4", halk:true, strokes:[["D",2],["T",1],["T",1],["D",2],["T",2],["T",1]] }
];
// Usulü birim zaman dilimlerine açar: her dilim "D", "T" ya da "" (vuruşun devamı)
function usulSlots(u){
  const out = [];
  for(const [s, d] of u.strokes){ out.push(s); for(let i=1;i<d;i++) out.push(""); }
  return out;
}

// ---- Parmak ezberi testi ----
const LEVELS = [
  { id:"chalumeau", name:"Chalumeau", lo:52, hi:70 },
  { id:"klarino",   name:"Klarino",   lo:71, hi:84 },
  { id:"altissimo", name:"Altissimo", lo:85, hi:99 }
];
const UNLOCK_WINDOW = 20, UNLOCK_RATE = 0.8;

// stats: { [written]: {n, wrong, ms} } — ms ortalama cevap süresi.
// Yanlış ya da yavaş cevaplanan notanın ağırlığı artar; hiç sorulmamış nota orta ağırlıktadır.
function quizWeight(s){
  if(!s || !s.n) return 2;
  let w = (s.wrong + 1) / (s.n - s.wrong + 1) * 2;
  if(s.ms > 4000) w *= 1.5;
  return Math.min(6, Math.max(0.3, w));
}
function quizPick(levels, stats, rng = Math.random, last = null){
  const pool = [];
  for(const lv of levels) for(let w = lv.lo; w <= lv.hi; w++) if(w !== last) pool.push(w);
  const weights = pool.map(w => quizWeight(stats[w]));
  let r = rng() * weights.reduce((a,b) => a+b, 0);
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
  return pool[pool.length-1];
}
function quizRecord(stats, written, right, ms){
  const s = stats[written] || (stats[written] = { n:0, wrong:0, ms:0 });
  s.ms = (s.ms * s.n + ms) / (s.n + 1);
  s.n++; if(!right) s.wrong++;
  return s;
}
// Çalınan ile istenen nota: aynı, oktav hatası ya da yanlış
function compareNote(expected, played){
  if(played === expected) return "ok";
  if(((played - expected) % 12 + 12) % 12 === 0) return "octave";
  return "wrong";
}
// recent: seviye başına son cevaplar (true/false). Bir sonraki seviye, öncekinde son 20 cevabın %80'i doğruysa açılır.
function unlockedLevels(recent){
  let n = 1;
  for(let i=0;i<LEVELS.length-1;i++){
    const r = recent[LEVELS[i].id] || [];
    if(r.length >= UNLOCK_WINDOW && r.filter(Boolean).length / r.length >= UNLOCK_RATE) n = i+2;
    else break;
  }
  return n;
}
// "Bul" modu için 4 seçenek: doğru nota + aynı seviyeden yakın notalar
function quizChoices(written, lv, rng = Math.random){
  const near = [];
  for(let w = Math.max(lv.lo, written-4); w <= Math.min(lv.hi, written+4); w++) if(w !== written) near.push(w);
  const pick = [];
  while(pick.length < 3 && near.length) pick.push(near.splice(Math.floor(rng()*near.length), 1)[0]);
  pick.push(written);
  return pick.sort((a,b) => a-b);
}

// ---- Gör ve bas: dizekteki notadan doğrudan parmağa ----
// Az notayla başlar; her nota ipucuyla öğretilir, ipucu hızlandıkça söner. Hepsi hızlı ve doğruysa yeni nota eklenir.
// Sıra: önce sol elin tek tek kapattığı pes doğal notalar, sonra sağ el, arızalılar, klarino, altissimo.
const GB_ORDER = [67,64,62,60,65,69,59,57,55,53,52, 66,63,61,68,58,56,54,70,
  72,74,76,77,79,81,83,84,71, 73,75,78,80,82, 86,88,89,91,93,95,96,98, 85,87,90,92,94,97,99];
// İpucu seviyeleri: 0 ad ve parmak, 1 yalnız parmak, 2 parmak gecikmeli, 3 ipucu yok
const GB_START = 3, GB_LEVELS = 3;
// Hızlı sayılan cevap süresi (ms); 2. seviyede ipucu bu süre dolunca çıkar. Ekranda parmak kurmak çalmaktan uzun sürer.
const GB_FAST = { play:1500, tap:3000 };
// st: { n: açık nota sayısı, notes: { [written]: { lv, h } } }; h son 4 cevap: 2 hızlı doğru, 1 yavaş doğru, 0 yanlış
function gbState(st){ return { n: st && st.n || GB_START, notes: st && st.notes || {} }; }
function gbNote(st, w){ return st.notes[w] || (st.notes[w] = { lv:0, h:[] }); }
const gbActive = st => GB_ORDER.slice(0, st.n);
function gbMastered(s){ return !!s && s.lv >= GB_LEVELS && s.h.length >= 3 && s.h.slice(-3).every(x => x === 2); }
function gbWeight(s){
  if(!s || s.h.length < 2) return 4;                // yeni nota sık gelir
  if(gbMastered(s)) return 0.6;
  return [3.5, 3, 2.5, 1.5][s.lv];
}
function gbPick(st, rng = Math.random, last = null){
  const pool = gbActive(st).filter(w => w !== last);
  const weights = pool.map(w => gbWeight(st.notes[w]));
  let r = rng() * weights.reduce((a,b) => a+b, 0);
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
  return pool[pool.length-1];
}
// Cevabı kaydeder. Doğru cevap ipucunu bir kademe azaltır (2. seviyede yalnız ipucu çıkmadan, hızlı cevap);
// yanlış cevap parmağı yeniden hemen gösterir. Açık notaların hepsi oturduysa sıradaki nota eklenir.
// Dönüş: { fast, lv, added: eklenen nota ya da null }
function gbRecord(st, w, ok, ms, input){
  const s = gbNote(st, w), fast = ok && ms <= GB_FAST[input];
  s.h.push(ok ? (fast ? 2 : 1) : 0); if(s.h.length > 4) s.h.shift();
  if(!ok) s.lv = Math.max(0, Math.min(s.lv, 2) - 1);
  else if(s.lv < 2 || (s.lv === 2 && fast)) s.lv++;
  let added = null;
  if(st.n < GB_ORDER.length && gbActive(st).every(x => gbMastered(st.notes[x]))){ added = GB_ORDER[st.n]; st.n++; }
  return { fast, lv: s.lv, added };
}

// ---- Uzun ton ----
// devs: hedef perdeden koma sapmaları; durMs tutulan süre; targetMs hedef süre.
function mean(a){ return a.length ? a.reduce((x,y) => x+y, 0) / a.length : 0; }
function sd(a){ const m = mean(a); return a.length ? Math.sqrt(mean(a.map(x => (x-m)*(x-m)))) : 0; }
function longToneScore(devs, durMs, targetMs){
  const m = mean(devs), s = sd(devs);
  const stability = Math.max(0, 1 - s/1.0);       // 1 koma yayılım = 0 puan
  const accuracy  = Math.max(0, 1 - Math.abs(m)/1.5);
  const completion = Math.min(1, durMs/targetMs);
  return { mean:m, sd:s, durMs,
           score: Math.round(100*(0.4*stability + 0.35*accuracy + 0.25*completion)) };
}

// ---- Nota başına entonasyon istatistiği ----
// Aynı nota en az minMs tutulursa o bölümün ortalama sapması istatistiğe eklenir; kısa geçiş notaları sayılmaz.
class NoteStatCollector{
  constructor(onCommit, minMs = 300){ this.onCommit = onCommit; this.minMs = minMs; this.cur = null; }
  push(written, delta, t){
    if(this.cur && this.cur.written === written){ this.cur.devs.push(delta); this.cur.end = t; return; }
    this.flush();
    this.cur = { written, devs:[delta], start:t, end:t };
  }
  flush(){
    const c = this.cur; this.cur = null;
    if(c && c.end - c.start >= this.minMs) this.onCommit(c.written, mean(c.devs), c.end - c.start);
  }
}
function statAdd(stats, written, m){
  const s = stats[written] || (stats[written] = { n:0, sum:0, sumSq:0 });
  s.n++; s.sum += m; s.sumSq += m*m;
  return s;
}
// Isı haritası sınıfı: en az 3 ölçüm, ortalama ±0,5 komadan büyükse tiz/pes
function heatClass(s){
  if(!s || s.n < 3) return null;
  const m = s.sum / s.n;
  return m > 0.5 ? "sharp" : m < -0.5 ? "flat" : "clean";
}

// ---- Nota bölütleme (kayıt, taklit) ----
// frames: [{t, written, comma}] ya da sessizlikte {t, written:null}. Aynı notanın art arda gelen
// karelerini birleştirir; minMs'den kısa olanları atar.
function segmentNotes(frames, minMs = 120){
  const out = []; let cur = null;
  const close = () => {
    if(cur && cur.end - cur.start >= minMs)
      out.push({ written:cur.written, start:cur.start, end:cur.end, comma:mean(cur.commas) });
    cur = null;
  };
  for(const f of frames){
    if(f.written == null){ close(); continue; }
    if(cur && cur.written === f.written){ cur.end = f.t; cur.commas.push(f.comma); continue; }
    close();
    cur = { written:f.written, start:f.t, end:f.t, commas:[f.comma] };
  }
  close();
  return out;
}

// ---- Vibrato ve glissando ----
// frames: [{t (ms), comma}] aynı notada. Doğrusal eğilim çıkarılır, kalan salınımın
// sıfır geçişlerinden hız (Hz), etkin değerinden derinlik (± koma) bulunur.
// winSec: perde bulucunun ölçüm penceresi; pencere salınımı yumuşattığı için derinlik buna göre düzeltilir.
function vibrato(frames, winSec = 0){
  if(frames.length < 12) return null;
  const t0 = frames[0].t, T = frames[frames.length-1].t - t0;
  if(T < 700) return null;
  const xs = frames.map(f => (f.t - t0)/1000), ys = frames.map(f => f.comma);
  const mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for(let i=0;i<xs.length;i++){ num += (xs[i]-mx)*(ys[i]-my); den += (xs[i]-mx)*(xs[i]-mx); }
  const b = den ? num/den : 0;
  const res = ys.map((y,i) => y - (my + b*(xs[i]-mx)));
  const depth = Math.sqrt(mean(res.map(r => r*r))) * Math.SQRT2;
  const hyst = depth * 0.25;
  let sign = 0, cross = 0;
  for(const r of res){
    const s = r > hyst ? 1 : r < -hyst ? -1 : 0;
    if(s && sign && s !== sign) cross++;
    if(s) sign = s;
  }
  const rate = cross / 2 / (T/1000);
  if(cross < 4 || depth < 0.15 || rate < 3 || rate > 9) return null;
  const x = Math.PI * rate * winSec, sinc = x ? Math.sin(x)/x : 1;
  return { rate, depth: depth / Math.max(0.3, sinc) };
}
// İki kararlı nota arasındaki kareler sürekli ve tek yönlü en az 3 koma kayıyorsa glissando
function isGlide(frames, minSpan = 3, minMs = 100){
  if(frames.length < 3) return false;
  const dur = frames[frames.length-1].t - frames[0].t;
  const span = frames[frames.length-1].comma - frames[0].comma;
  if(dur < minMs || Math.abs(span) < minSpan) return false;
  let along = 0;
  for(let i=1;i<frames.length;i++) if(Math.sign(frames[i].comma - frames[i-1].comma) === Math.sign(span)) along++;
  return along / (frames.length-1) >= 0.6;
}

// ---- Taklit oyunu ----
// Makam dizisinden çoğunlukla adım adım ilerleyen bir motif üretir (komalar).
function makeMotif(scale, len, rng = Math.random){
  const s = [...new Set(scale)].sort((a,b) => a-b);
  let i = Math.floor(rng() * Math.ceil(s.length/2));
  const out = [s[i]];
  while(out.length < len){
    const r = rng();
    const step = r < 0.35 ? 1 : r < 0.7 ? -1 : r < 0.85 ? 2 : -2;
    i = Math.max(0, Math.min(s.length-1, i + step));
    if(s[i] === out[out.length-1]) i = i > 0 ? i-1 : i+1;
    out.push(s[i]);
  }
  return out;
}

// ---- Eser takibi ----
// "Sol4 La4 Si♭4 Do5" (ya da İngilizce "G4 A4 B♭4 C5") gibi yazılı nota listesini MIDI numaralarına çevirir.
const LETTER_PC = { do:0, re:2, mi:4, fa:5, sol:7, la:9, si:11, c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
function parseMelody(text){
  const notes = [], errors = [];
  for(const tok of text.split(/[\s,;|]+/).filter(Boolean)){
    const low = tok.toLocaleLowerCase("tr").replace("ı","i");
    const m = /^(do|re|mi|fa|sol|la|si)([♯#]|[♭b])?(\d)$/.exec(low) || /^([a-g])([♯#]|[♭b])?(\d)$/.exec(low);
    if(!m){ errors.push(tok); continue; }
    const acc = !m[2] ? 0 : /[♯#]/.test(m[2]) ? 1 : -1;
    notes.push(LETTER_PC[m[1]] + acc + (+m[3] + 1) * 12);
  }
  return { notes, errors };
}
// Makam dizisinden alıştırma ezgileri (yazılı notalar)
function makamExercises(mk){
  const up = mk.asc.map(commaToWritten), down = [...mk.desc].reverse().map(commaToWritten);
  const thirds = [];
  for(let i=0;i+2<up.length;i++) thirds.push(up[i], up[i+2]);
  thirds.push(up[up.length-1]);
  return [
    { name: mk.name + " — çıkış ve iniş", notes: [...up, ...down.slice(1)] },
    { name: mk.name + " — üçlü atlamalar", notes: thirds }
  ];
}

// ---- İlerleme ----
function dayKey(d){
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth()+1) + "-" + p(d.getDate());
}
// days: { "YYYY-MM-DD": saniye }. En az 60 sn çalışılan art arda günler; bugün henüz yoksa dünden sayılır.
function streak(days, today = new Date()){
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if(!((days[dayKey(d)] || 0) >= 60)) d.setDate(d.getDate()-1);
  let n = 0;
  while((days[dayKey(d)] || 0) >= 60){ n++; d.setDate(d.getDate()-1); }
  return n;
}

if(typeof module !== "undefined") module.exports = {
  MAKAMS, makamById, seyirText, tuningCtx, perdeTarget, SEYIR_TYPE, ICRA, perdeName, commaToWritten, commaToMidi, judgePerde,
  USULS, usulSlots, LEVELS, UNLOCK_WINDOW, quizWeight, quizPick, quizRecord, compareNote, unlockedLevels, quizChoices,
  GB_ORDER, GB_START, GB_LEVELS, GB_FAST, gbState, gbNote, gbActive, gbMastered, gbPick, gbRecord,
  mean, sd, longToneScore, NoteStatCollector, statAdd, heatClass, segmentNotes, vibrato, isGlide,
  makeMotif, parseMelody, makamExercises, dayKey, streak
};
