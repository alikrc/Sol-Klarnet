// Google Fonts'u depoya indirir: fonts/*.woff2 ve fonts/fonts.css (latin + latin-ext, Türkçe karakterler dahil).
// Böylece uygulama internetsiz ilk açılışta da doğru fontla açılır. Fontlar SIL Open Font License ile dağıtılır.
// Lisans metinleri de iner (fonts/OFL-*.txt): OFL, yazı tipiyle birlikte dağıtılmasını ister.
// Kullanım: npm run fonts
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "fonts");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const SOURCES = [
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Commissioner:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
  // Nota simgeleri: yalnızca sol anahtarı, diyez ve bemol
  "https://fonts.googleapis.com/css2?family=Noto+Music&text=%F0%9D%84%9E%E2%99%AF%E2%99%AD&display=swap"
];
const LICENSES = { Commissioner:"commissioner", Fraunces:"fraunces", IBMPlexMono:"ibmplexmono", NotoMusic:"notomusic" };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let css = "/* npm run fonts ile üretildi: Google Fonts (SIL Open Font License) */\n";
  const got = new Map();
  for(const src of SOURCES){
    const text = await (await fetch(src, { headers: { "user-agent": UA } })).text();
    // Yalnızca latin ve latin-ext blokları (Kiril, Vietnamca vb. gerekmez); text= ile alınan alt kümede yorum yoktur
    const blocks = text.split(/(?=\/\* [\w-]+ \*\/)/).filter(b => !/^\/\* /.test(b) || /^\/\* latin(-ext)? \*\//.test(b));
    for(let b of blocks){
      const m = /url\((https:[^)]+\.woff2|https:[^)]+)\)/.exec(b);
      if(!m) continue;
      const url = m[1];
      if(!got.has(url)){
        const fam = (/font-family: '([^']+)'/.exec(b) || [, "font"])[1].replace(/\s+/g, "");
        const name = fam + "-" + got.size + ".woff2";
        const buf = Buffer.from(await (await fetch(url, { headers: { "user-agent": UA } })).arrayBuffer());
        fs.writeFileSync(path.join(OUT, name), buf);
        got.set(url, name);
      }
      css += b.replace(url, got.get(url)).replace(/format\('[^']+'\)/, "format('woff2')").trim() + "\n";
    }
  }
  fs.writeFileSync(path.join(OUT, "fonts.css"), css);
  for(const [name, dir] of Object.entries(LICENSES)){
    const res = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${dir}/OFL.txt`);
    if(!res.ok) throw new Error(`${name} lisansı indirilemedi: ${res.status}`);
    fs.writeFileSync(path.join(OUT, `OFL-${name}.txt`), await res.text());
  }
  console.log(`fonts/: ${got.size} dosya`);
})();
