// Android paketi için web dosyalarını www/ klasörüne kopyalar (Capacitor webDir).
// Depo kökünde node_modules ve android/ olduğundan kök doğrudan webDir yapılamaz.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "www");
const FILES = ["index.html", "app.css", "app.js", "i18n.js", "core.js", "learn.js", "lessons.js", "videos.js", "skills.js", "repertoire.js", "trainers.js", "pieces.js", "band.js", "transcribe.js", "reading.js", "roadmap.js", "archive.js", "omrtemplates.js", "omr.js", "convert.js", "drills.js", "lessonview.js", "practice.js", "review.js", "onboard.js", "pcmring.js", "pcmring.js",
  "sw.js", "manifest.webmanifest", "icon.svg", "privacy.html"];
const DIRS = ["icons", "fonts", "notalar"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for(const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
for(const d of DIRS) fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
console.log(`www/: ${FILES.length} dosya, ${DIRS.length} klasör`);
