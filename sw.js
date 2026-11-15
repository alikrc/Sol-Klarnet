// Çevrimdışı kullanım kaldırıldı (proje sahibi, 15 Kasım 2026: "internetsiz çalışmasın, öyle bir özelliğe gerek yok").
// Bu dosya yalnız daha önce kurulmuş service worker'ları temizlemek için durur: tarayıcı eski kaydı bu sürüme güncelleyince
// uygulamanın önbelleklerini siler ve kaydını kaldırır. fetch dinleyicisi yok, her istek doğrudan ağa gider. app.js yeni
// kayıt yapmaz, var olan kaydı da kaldırır; bu dosya eski kurulumlar temizlendikten sonra silinebilir.
// Önbellek adı satırı scripts/release.js ve scripts/build-web.js içindir (içerik değişince tarayıcı güncellemeyi alır).
const CACHE = "sol-klarnet-v104";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("sol-klarnet")).map(k => caches.delete(k))))
    .then(() => self.registration.unregister()));
});
