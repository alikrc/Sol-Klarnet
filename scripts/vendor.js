// pdf.js (pdfjs-dist, legacy derleme) dosyalarını vendor/pdfjs/ altına kopyalar. Çıktı depoya girer; uygulama
// yalnızca PDF seçilince import() ile yükler. Sürüm package.json'da sabit. Kullanım: npm run vendor
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "node_modules", "pdfjs-dist");
const OUT = path.join(ROOT, "vendor", "pdfjs");
const FILES = [["legacy/build/pdf.min.mjs", "pdf.min.mjs"], ["legacy/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"], ["LICENSE", "LICENSE"]];

fs.mkdirSync(OUT, { recursive: true });
for(const [from, to] of FILES) fs.copyFileSync(path.join(SRC, from), path.join(OUT, to));
const ver = JSON.parse(fs.readFileSync(path.join(SRC, "package.json"), "utf8")).version;
console.log(`vendor/pdfjs/: pdfjs-dist ${ver}, ${FILES.length} dosya`);
