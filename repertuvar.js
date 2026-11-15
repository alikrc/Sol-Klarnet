// Dereceli repertuvar merdiveni (docs/BACKLOG.md S4.1): "Sıradaki eserim". Altı basamak; her basamağın eserleri
// scripts/eser-sec.js --basamak N --sec ile seçildi (telifsiz; form dengesi 4 şarkı, 2 türkü, 2 saz eseri, 2 oyun havası
// ya da ilâhî; her basamak bir alttakinin ölçütünü geçemeyen eserlerden). Liste betiğin çıktısıdır, elle değiştirilmez:
// yeniden seçmek için betiği basamak sırasıyla, alt basamakların eserlerini --haric ile vererek çalıştır.
// Eser arşivde "Eseri öğren" yedi adımıyla öğrenilir; "çalındı" sayılması için arşivde eserin tamamı kendi temposunda
// (%100) en az %80 doğru nota ile tempolu çalınır (archive.js repRecord çağırır). Basamak, eserlerinden REP_NEED tanesi
// çalınınca tamamlanır. Kayıt: rep.played { [id]: { d: gün, v: doğru % } }.
// Tarayıcıda archive.js'ten sonra yüklenir; Node'da require("./repertuvar.js") (roadmap.js ve denetim betiği).

const REP_NEED = 6;
// after: basamağın önerildiği ders (bitmişse); oct: arşivde açılınca uygulanan oktav kaydırma (basamak 1: Temeller'in
// aralığı için bir oktav pes, ilk eserler dersleriyle aynı)
const REP_LADDER = [
  { n:1, after:"temel-tekrar", oct:-1,
    title:{ tr:"Pes bölgede ilk eserler", en:"First pieces in the low register" },
    desc:{ tr:"Rast, Uşşak, Hüseynî, Nihâvend; Sofyan ve Düyek. Bir oktav pes çalınır (Mi3–Si♭4).", en:"Rast, Uşşak, Hüseynî, Nihâvend; Sofyan and Düyek. Played an octave lower (E3–B♭4)." },
    pieces:[
      ["huseyni--turku--sofyan--sabahin_seher--", "Sabahın Seher Vaktinde"],
      ["nihavent--kasaphavasi--duyek----", "Kasaphavası"],
      ["ussak--ilahi--sofyan--askinla_cak--haci_nafiz_bey", "Aşkınla Çak Olsa Bu Ten"],
      ["rast--sugul--duyek--ya_men--tanburi_ali_efendi", "Yâ Men Yuhibbu"],
      ["ussak--kurthavasi--sofyan--karsida_kurt--", "Karşıda Kürt Evleri"],
      ["nihavent--mars--sofyan--yilmam_olumden--ali_rifat_cagatay", "Yılmam Ölümden"],
      ["ussak--kanto--sofyan--telgirafin_tellerine--", "Telgırafın Tellerine..."],
      ["ussak--kupe--duyek--sanma_ussakin--ahmet_avni_konuk", "Sanma Uşşâk'ın Hemân"],
      ["ussak--ilahi--sofyan--hak_taala--ali_ufki", "Hak Taalâ Seni Bize"]
    ] },
  { n:2, after:"klarino",
    title:{ tr:"Klarino bölgesine çıkan eserler", en:"Pieces reaching the clarion" },
    desc:{ tr:"On temel makam; Aksak, Curcuna, Türk Aksağı da var. Mi3–Sol5, iki dakikaya kadar.", en:"Ten core makams; Aksak, Curcuna and Türk Aksağı too. E3–G5, up to two minutes." },
    pieces:[
      ["hicaz--turku--nimsofyan--bahcelerde_mor--istanbul", "Bahçelerde Mor Meni"],
      ["hicaz--rumeliturkusu--sofyan--gemi_kalkar--rumeli", "Gemi Kalkar Suları Akar"],
      ["ussak--ilahi--duyek--allah_emrin--zekai_dede", "Allah Emrin Tutalım"],
      ["saba--turku--nimsofyan--pinar_basi--", "Pınar Başı Burma Burma"],
      ["huzzam--turku--nimsofyan--ireyhan_eker--sivas", "İreyhan Eker misin"],
      ["hicaz--ilahi--sofyan--daglar_ile--kutbi_dede", "Dağlar İle Taşlar İle"],
      ["hicaz--turku--aksak--karanfil_oylum_oylum--", "Karanfil Oylum Oylum"],
      ["hicaz--turku--aksak--necibemin_ikidir--istanbul", "Necibemin İkidir Kürkü"]
    ] },
  { n:3, after:"hiz-etut",
    title:{ tr:"İlk şarkılar", en:"First şarkıs" },
    desc:{ tr:"On temel makam; Yürük Semâî, Devr-i Hindî, Ağır Aksak da var. Do6'ya kadar, üç dakikaya kadar.", en:"Ten core makams; Yürük Semâî, Devr-i Hindî and Ağır Aksak too. Up to C6, up to three minutes." },
    pieces:[
      ["hicaz--sarki--nimsofyan--cok_yasa--muhlis_sabahaddin_ezgi", "Çok Yaşa Sen Ayşe"],
      ["ussak--sarki--curcuna--akibet_bezdirdi--haci_arif_bey", "Âkıbet Bezdirdi"],
      ["huseyni--sarki--curcuna--edali_bir--ali_rifat_cagatay", "Edâlı Bir Yosma"],
      ["nihavent--sarki--semai--hatirla_ey_peri--muhlis_sabahaddin_ezgi", "Hatırla Ey Peri"],
      ["hicaz--turku--curcuna--urfaliyam_ezelden--", "Urfalıyam Ezelden"],
      ["huzzam--turku--aksak--arabaya_tas--istanbul", "Arabaya Taş Koydum"],
      ["nihavent--medhal--sofyan----ali_rifat_cagatay", "Nihâvent Medhal"],
      ["karcigar--ilahi--duyek--ey_derde_derman--rakim_elkutlu", "Ey Derde Derman"],
      ["ussak--ilahi--duyek--dostun_senden--ali_rifat_cagatay", "Dostun Senden Irak Değil"],
      ["huseyni--kupe--duyek--pesden--ahmet_avni_konuk", "Pestten Eylerdi Niyâzı"]
    ] },
  { n:4, after:"rast",
    title:{ tr:"Yirmi makam, ilk peşrevler", en:"Twenty makams, first peşrevs" },
    desc:{ tr:"Uygulamanın yirmi makamı, bütün usuller; ilk peşrevler. Do6'ya kadar, beş dakikaya kadar.", en:"The app's twenty makams, every usul; first peşrevs. Up to C6, up to five minutes." },
    pieces:[
      ["hicaz--sarki--yuruksemai_ii--ey_but-i--dede_efendi", "Ey Büt-i Nev Edâ"],
      ["suzinak--sarki--curcuna--pabusuna_ermek--haci_arif_bey", "Pâbûsuna Ermek"],
      ["nihavent--sarki--yuruksemai_ii--vucud_ikliminin--haci_arif_bey", "Vücud İkliminin Sultanı Sensin"],
      ["huzzam--sarki--senginsemai--hal-i_dil-i--haci_arif_bey", "Hâl-i Dîl-i Zârımı Duysa Cihân"],
      ["hicaz--turku--zafer--al_tavandan--ordu", "Al Tavandan Belleri"],
      ["huseyni--turku--musemmen--aglama_yar--anonim", "Ağlama Yâr"],
      ["suzinak--pesrev--devrikebir----nayi_emin_dede", "Sûzinâk Peşrev"],
      ["huseyni--pesrev--devrikebir----dede_salih_efendi", "Hüseynî Peşrev"],
      ["segah--ilahi--frenkcin--bu_ask--yenikoylu_hadi_bey", "Bu Aşk Bir Bahr-ı Ummândır"],
      ["hicaz_humayun--ilahi--sofyan--gelin_gidelim--dede_efendi", "Gelin Gidelim Allah Yoluna"]
    ] },
  { n:5, after:"makam-bulma",
    title:{ tr:"Bütün makamlar, peşrevler", en:"All makams, peşrevs" },
    desc:{ tr:"Arşivin bütün makamları; peşrevler ve uzun şarkılar. Mi6'ya kadar, yedi dakikaya kadar.", en:"Every makam in the archive; peşrevs and longer şarkıs. Up to E6, up to seven minutes." },
    pieces:[
      ["isfahan--sarki--musemmen--dusme_ey_asik--nikogos_aga", "Düşme Ey Âşık Hayâle"],
      ["acemasiran--sarki--semai--ey_cesm-i--nikogos_aga", "Ey Çeşm-i Âhû Mehlika"],
      ["neveser--sarki--aksak--gonlum_alip--latif_aga", "Gönlüm Alıp"],
      ["irak--sarki--musemmen--derd-i_hicrinle--bestenigar_ziya_bey", "Derd-i Hicrinle"],
      ["kurdi-gerdaniye--turku--raksan--cikar_gokyuzunde--", "Çıkar Gökyüzünde Pervaz İdersin"],
      ["pesendide--turku--sofyan--samavir_kuydum--", "Samavir Kuydum"],
      ["eski_sipihr--pesrev--muhammes----dilhayat_kalfa", "Sipihr Peşrev"],
      ["sevkaver--pesrev--hafif----i_mahmut", "Şevkâver Peşrev"],
      ["dugah-maye--oyunhavasi--sofyan--dugun_havasi--anonim", "Düğün Havası"],
      ["huzi--ilahi--duyek--tasti_rahmet--", "Taştı Rahmet Deryâsı"]
    ] },
  { n:6, after:"taksim-cumle",
    title:{ tr:"Hızlı ve süslü eserler", en:"Fast and ornate pieces" },
    desc:{ tr:"Otuzikilikler, sık süsleme, Fa♯6'ya kadar; uzun peşrevler ve hızlı oyun havaları.", en:"Thirty-seconds, dense ornaments, up to F♯6; long peşrevs and fast dance tunes." },
    pieces:[
      ["ussak--sarki--yuruksemai_ii--tifl-i_nazim--tanburi_ali_efendi", "Tıfl-ı Nâzım Meclis-i Rindâne Gel"],
      ["acemasiran--sarki--duyek--ruhumda_derin--kemal_gurses", "Ruhumda Derin"],
      ["buselik--sarki--turkaksagi--dun_gece_sende--sakir_aga", "Dün Gece Sende"],
      ["saba--sarki--aksak--bir_esmere--tanburi_mustafa_cavus", "Bir Esmere Gönül Verdim"],
      ["ussak--turku--nimsofyan--altin_yuzugum--anonim", "Altın Yüzüğüm Kırıldı"],
      ["kurdi--turku--sofyan--dalda_cikmis--", "Dalda Çıkmış Bir Elma"],
      ["tahir--pesrev--fahte----dede_salih_efendi", "Tâhir Peşrev"],
      ["beyati--pesrev--hafif----seyfettin_osmanoglu", "Beyâtî Peşrev"],
      ["acem--ilahi--duyek--aldanma_dunya--zekai_dede", "Aldanma Dünya Varına"],
      ["huseyni--oyunhavasi--nimsofyan--cecen_kizi--tanburi_cemil_bey", "Çeçen Kızı"]
    ] }
];
const repNeed = b => Math.min(REP_NEED, b.pieces.length);
const repStepOf = id => { const b = REP_LADDER.find(x => x.pieces.some(p => p[0] === id)); return b ? b.n : null; };
// Basamak başına çalınan eser sayısı: { 1: 3, 2: 0, … }
function repCounts(played){
  const out = {};
  for(const b of REP_LADDER) out[b.n] = b.pieces.filter(([id]) => played[id]).length;
  return out;
}
// Durum: her basamak için { b, played, need, done, open } (open: önerildiği ders bitmiş ya da basamak başlanmış)
function repStatus(played, prog, lessonDone){
  return REP_LADDER.map(b => {
    const n = b.pieces.filter(([id]) => played[id]).length, l = prog && lessonDone ? lessonDone(b.after, prog) : true;
    return { b, played:n, need:repNeed(b), done: n >= repNeed(b), open: l || n > 0 };
  });
}
// Sıradaki eser: açık ve bitmemiş ilk basamağın çalınmamış ilk eseri (yoksa null)
function repNext(played, prog, lessonDone){
  const s = repStatus(played, prog, lessonDone).find(x => x.open && !x.done);
  if(!s) return null;
  const p = s.b.pieces.find(([id]) => !played[id]);
  return p ? { b:s.b, id:p[0], name:p[1] } : null;
}
// Arşivden: eserin tamamı tempolu çalındı (pct: tempo oranı, v: doğru %). %100 tempoda %80 ve üstü "çalındı" sayılır;
// en iyi sonuç ve ilk çalınış günü tutulur. Dönen: yeni kayıtsa true
function repRecord(played, id, pct, v, day){
  if(!repStepOf(id) || pct < 1 - 1e-9 || v < 80) return false;
  const was = played[id];
  played[id] = { d: was ? was.d : day, v: Math.max(v, was ? was.v : 0) };
  return !was;
}

if(typeof module !== "undefined") module.exports = { REP_LADDER, REP_NEED, repNeed, repStepOf, repCounts, repStatus, repNext, repRecord };

// ======== Sekme: Sıradaki eserim ========
if(typeof TRAINERS !== "undefined") TRAINERS.repertuvar = function(ctx){
  const { SK, $, store, esc } = ctx;
  const P = $("pp-repertuvar");
  const tx = x => pick(x, LANG);
  const ld = (id, prog) => { const l = lessonById(id); return !!l && lessonDone(l, prog); };
  let meta = null;
  function card(b, id, name, played, learn){
    const e = meta && meta.get(id), p = played[id], ls = learn[id] ? learn[id].length : 0;
    const info = e ? [e.mkn, e.un, e.fn, e.b || L("Anonim", "Anonymous"), Math.floor(e.s/60) + ":" + String(e.s % 60).padStart(2, "0")].filter(Boolean).join(" · ") : "";
    return `<li class="rpitem${p ? " done" : ""}"><span><b>${esc(e ? e.t : name)}</b><small>${esc(info)}</small>
        <small class="rpst">${p ? "✓ " + L("çalındı · %", "played · ") + p.v + (LANG === "en" ? "%" : "") : ls ? L("öğren: " + ls + "/7 adım", "learning: " + ls + "/7 steps") : ""}</small></span>
      <button type="button" class="${p ? "stopbtn" : "primary"} small" data-rp="${esc(id)}" data-oct="${b.oct || 0}">${p ? L("Yeniden aç", "Open again") : ls ? L("Devam et", "Continue") : L("Öğren", "Learn")}</button></li>`;
  }
  function render(){
    const played = store.get("rep.played", {}), learn = store.get("arch.learn", {}), prog = store.get("lesson.prog", {});
    const st = repStatus(played, prog, ld), nx = repNext(played, prog, ld), cur = st.find(x => x.open && !x.done);
    P.innerHTML = `<p class="pdesc">${L("Dereceli eser merdiveni: altı basamak, her basamakta nota arşivinden seçilmiş telifsiz eserler. Bir eseri öğren (arşivde yedi adım), sonra eserin tamamını kendi temposunda tempolu çal: doğru nota %80'i geçince “çalındı” sayılır. Bir basamağın " + REP_NEED + " eseri çalınınca sıradaki basamak önerilir.",
      "A graded ladder of pieces: six steps, each with copyright-free pieces chosen from the score archive. Learn a piece (seven steps in the archive), then play the whole piece in tempo at its own speed: above 80% correct notes it counts as “played”. When " + REP_NEED + " pieces of a step are played, the next step is suggested.")}</p>
      ${nx ? `<section class="rpnext"><div class="eyebrow">${L("Sıradaki eserin", "Your next piece")}</div><strong>${esc((meta && meta.get(nx.id) ? meta.get(nx.id).t : nx.name))}</strong>
        <p class="muted small">${L("Basamak ", "Step ")}${nx.b.n} · ${esc(tx(nx.b.title))}</p>
        <button type="button" class="primary small" data-rp="${esc(nx.id)}" data-oct="${nx.b.oct || 0}">${L("Öğrenmeye başla", "Start learning")} →</button></section>`
        : `<p class="muted">${st.every(x => x.done) ? L("Bütün basamakları bitirdin.", "You've finished every step.") : L("Sıradaki basamak, önerildiği ders bitince açılır; istersen aşağıdan şimdi de başlayabilirsin.", "The next step opens after its lesson; you can start below now if you like.")}</p>`}
      ${st.map(x => `<details class="rpstep"${x === (cur || st.find(y => !y.done)) ? " open" : ""}><summary><b>${L("Basamak ", "Step ")}${x.b.n} · ${esc(tx(x.b.title))}</b>
          <small>${x.done ? "✓ " : ""}${x.played}/${x.need} ${L("çalındı", "played")}${x.open ? "" : " · " + L("önerildiği ders: ", "suggested after: ") + esc(lessonById(x.b.after) ? tx(lessonById(x.b.after).title) : x.b.after)}</small></summary>
        <p class="muted small">${esc(tx(x.b.desc))}</p>
        <ul class="rplist">${x.b.pieces.map(([id, name]) => card(x.b, id, name, played, learn)).join("")}</ul></details>`).join("")}`;
  }
  P.addEventListener("click", e => {
    const b = e.target.closest("[data-rp]"); if(!b) return;
    const id = b.dataset.rp, oct = +b.dataset.oct;
    // Basamak 1: eser arşivde bir oktav pes açılsın (kullanıcı arşivde değiştirmediyse)
    if(oct){ const tr = store.get("arch.tr", {}); if(!tr[id]){ tr[id] = { steps:0, oct }; store.set("arch.tr", tr); } }
    SK.openArchive(id);
  });
  SK.repNext = () => repNext(store.get("rep.played", {}), store.get("lesson.prog", {}), ld);
  return {
    enter(){
      render();
      if(!meta && SK.archiveIndex) SK.archiveIndex().then(list => { meta = new Map(list.map(e => [e.id, e])); render(); }).catch(() => {});
    }
  };
};
