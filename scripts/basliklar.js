// SymbTr başlıklarındaki büyük harf hatalarını ve bitişik yazılmış form adlarını düzeltir.
// SymbTr'de başlıklar Türkçe olmayan büyük harf çevirisiyle yazılmış: "Ordu'Nun", "Gül-I Rana", "Aşkın Ile".
// scripts/symbtr.js dizini yazarken kullanır; tek başına çalıştırılınca var olan notalar/index.json'u düzeltir:
//   node scripts/basliklar.js
const fs = require("fs");
const path = require("path");

const BACK = /[aıouâû]/, VOWEL = /[aeıioöuüâîû]/;
// Büyük "I" küçültülürken i mi ı mı olduğu ünlü uyumuyla seçilir (önceki sözcüğün son ünlüsü)
// Arapça kökenli "-âl" ince ek alır: hâl-i, Uzzâl'i
function lowI(stem){
  if(/âl$/.test(stem)) return "i";
  const v = [...stem.toLocaleLowerCase("tr")].reverse().find(c => VOWEL.test(c));
  return v && BACK.test(v) ? "ı" : "i";
}
const lowSuffix = (stem, suf) => [...suf].map(c => c === "I" ? lowI(stem) : c.toLocaleLowerCase("tr")).join("");
// Sözcük başındaki "I" çoğunlukla "İ" olmalı (ile, ise, idi, iken, İsfahân); Irmak, Işık, Irak, Itrî gibi doğru olanlar dokunulmaz
const DOTTED = new Set(["Ile", "Ise", "Idi", "Idim", "Iken", "Isfahân", "Isfahânlı", "Isfahan"]);

function fixTitle(s){
  if(!s) return s;
  return s
    // Kesme işaretinden sonraki ek küçük: Ordu'Nun → Ordu'nun, Iğdır'In → Iğdır'ın
    .replace(/([\p{L}]+)(['’])([\p{Lu}][\p{L}]*)/gu, (m, stem, ap, suf) => stem + ap + lowSuffix(stem, suf))
    // Tamlama eki küçük: Gül-I → Gül-i, Makam-I → Makam-ı, Küşa-Yı → Küşa-yı, Ruh-U → Ruh-u
    .replace(/([\p{L}]+)-(I|Yı|Yi|Ü|U|Yü|Yu)(?![\p{L}])/gu, (m, stem, suf) => stem + "-" + lowSuffix(stem, suf))
    // Bağlaç "ü": Âh Ü Figan → Âh ü Figan
    .replace(/(\s)Ü(?=\s)/g, "$1ü")
    .replace(/(^|[\s(-])(I[\p{Ll}]+)/gu, (m, pre, w) => pre + (DOTTED.has(w) ? "İ" + w.slice(1) : w));
}

const FORMS = {
  "Rumelitürküsü": "Rumeli türküsü", "Oyunhavası": "Oyun havası", "Kasaphavası": "Kasap havası", "Kürthavası": "Kürt havası",
  "Sazeseri": "Saz eseri", "Tevşihilâhi": "Tevşih", "Sazsemâîsi": "Saz semâîsi", "Ağırsemâî": "Ağır semâî", "Yürüksemâî": "Yürük semâî"
};
const fixForm = s => FORMS[s] || fixTitle(s);

// "(Anonim)", "[Anonim]" → bestekâr "Anonim"; anonim güfte gösterilmez
const ANON = /^[\[(]?\s*anonim\s*[\])]?$/i;
function fixEntry(e){
  for(const k of ["t", "b", "g", "mkn", "un"]) if(e[k]) e[k] = fixTitle(e[k]);
  if(e.b && ANON.test(e.b)) e.b = "Anonim";
  if(e.g && ANON.test(e.g)) e.g = null;
  if(e.fn) e.fn = fixForm(e.fn);
  return e;
}

module.exports = { fixTitle, fixForm, fixEntry };

if(require.main === module){
  const f = path.join(__dirname, "..", "notalar", "index.json");
  const ix = JSON.parse(fs.readFileSync(f, "utf8"));
  let n = 0;
  ix.pieces.forEach(e => { const before = JSON.stringify(e); fixEntry(e); if(JSON.stringify(e) !== before) n++; });
  fs.writeFileSync(f, JSON.stringify(ix));
  console.log(`${n} eserin adı düzeltildi → notalar/index.json`);
}
