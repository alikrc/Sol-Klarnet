// pdf.js (pdfjs-dist, legacy derleme) dosyalarını vendor/pdfjs/ altına, QR kod üreticisini (qrcode-generator)
// vendor/qrcode/ altına kopyalar. Çıktı depoya girer; uygulama pdf.js'i yalnızca PDF seçilince, QR üreticisini
// yalnızca eser paylaşılınca yükler. Sürümler package.json'da sabit. Kullanım: npm run vendor
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

const QSRC = path.join(ROOT, "node_modules", "qrcode-generator"), QOUT = path.join(ROOT, "vendor", "qrcode");
fs.mkdirSync(QOUT, { recursive: true });
fs.copyFileSync(path.join(QSRC, "qrcode.js"), path.join(QOUT, "qrcode.js"));
const qver = JSON.parse(fs.readFileSync(path.join(QSRC, "package.json"), "utf8")).version;
console.log(`vendor/qrcode/: qrcode-generator ${qver} (MIT, lisans dosyanın başında)`);
