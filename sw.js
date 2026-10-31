// Çevrimdışı kullanım: uygulama dosyaları önbellekte tutulur.
// Kendi dosyalarımız önce ağdan istenir (güncellemeler hemen gelsin), ağ yoksa önbellekten verilir.
// Fontlar da uygulamanın içindedir (fonts/); dış kaynak yoktur. Nota arşivinin eser dosyaları (notalar/) açıldıkça saklanır.
const CACHE = "sol-klarnet-v57";
const SHELL = ["./", "index.html", "app.css", "app.js", "nav.js", "i18n.js", "art.js", "core.js", "learn.js", "sources.js", "lessons.js", "videos.js", "skills.js", "repertoire.js", "trainers.js", "usuller.js", "pieces.js", "band.js", "follow.js", "transcribe.js", "reading.js", "roadmap.js", "archive.js", "notalar/index.json", "omrtemplates.js", "omr.js", "omrworker.js", "convert.js", "vendor/pdfjs/pdf.min.mjs", "vendor/pdfjs/pdf.worker.min.mjs", "drills.js", "chartsheet.js", "lessonview.js", "teori.js", "practice.js", "review.js", "onboard.js", "search.js", "nowplaying.js", "pcmring.js", "manifest.webmanifest", "icon.svg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "img/klarnet.webp", "img/darbuka.webp", "img/ud.webp", "img/agizlik.webp", "privacy.html",
  "fonts/Commissioner-0.woff2", "fonts/Commissioner-1.woff2", "fonts/fonts.css", "fonts/Fraunces-2.woff2", "fonts/Fraunces-3.woff2", "fonts/IBMPlexMono-4.woff2", "fonts/IBMPlexMono-5.woff2", "fonts/IBMPlexMono-6.woff2", "fonts/IBMPlexMono-7.woff2", "fonts/NotoMusic-8.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    e.respondWith(fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match("index.html"))));
  }
});
