// Görseller: alıştırma ikonları (24×24 çizgi, alt menüdeki ikonlarla aynı stil), ünite emojileri ve yerel fotoğraflar (img/).
// Fotoğrafların kaynağı ve lisansı img/KAYNAKLAR.md'de; uygulama içinde Ayarlar → Hakkında'da da yazılı.
(function(){
  const P = {
    lessons:  `<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/>`,
    roadmap:  `<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>`,
    teori:    `<path d="M12 3.5L2.5 8 12 12.5 21.5 8z"/><path d="M6.5 10v5c1.5 1.6 3.4 2.4 5.5 2.4s4-.8 5.5-2.4v-5"/><path d="M21.5 8v6"/>`,
    sorun:    `<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5"/><path d="M12 17.2h.01" stroke-width="2.6"/>`,
    videos:   `<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9v6l5-3z"/>`,
    quiz:     `<rect x="8" y="2.5" width="8" height="19" rx="4"/><circle cx="12" cy="8" r="1.6"/><circle cx="12" cy="12.5" r="1.6"/><circle cx="12" cy="17" r="1.6"/>`,
    gorbas:   `<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>`,
    staffmap: `<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/><ellipse cx="9" cy="14" rx="2.3" ry="1.7"/><ellipse cx="15.5" cy="8" rx="2.3" ry="1.7"/>`,
    tablo:    `<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17M3.5 15h17M9.5 3.5v17M15 3.5v17"/>`,
    desifre:  `<path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4"/><path d="M9 17V11l5-1v6"/><circle cx="8" cy="17" r="1.3"/><circle cx="13" cy="16" r="1.3"/>`,
    long:     `<ellipse cx="7" cy="12" rx="3.8" ry="2.8"/><path d="M11.5 12H21"/><path d="M14.5 9h6.5M14.5 15h6.5" opacity=".45"/>`,
    rhythm:   `<path d="M8 21h8l-3-17h-2z"/><path d="M12 15l5-8"/><path d="M6.5 21h11"/>`,
    usul:     `<path d="M7 4h10l-1.5 4.5a6 6 0 0 1-7 0z"/><path d="M8.5 8.5L7 20h10l-1.5-11.5"/><path d="M7.5 14h9"/>`,
    hece:     `<path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8 11h.01M12 11h.01M16 11h.01" stroke-width="2.6"/>`,
    hiz:      `<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>`,
    susleme:  `<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.4z"/><path d="M18.5 15l.8 2 2 .7-2 .8-.8 2-.8-2-2-.8 2-.7z"/>`,
    makam:    `<path d="M4 20l3-4 3 2 3-6 3 3 4-9"/><circle cx="20" cy="6" r="1.4"/>`,
    mimic:    `<path d="M4 10a5 5 0 0 1 9 0"/><path d="M11 14a5 5 0 0 0 9 0"/><path d="M13 10l-1.5 2M11 14l1.5-2"/><path d="M4 10v4M20 10v4"/>`,
    seyir:    `<path d="M3 17c3-8 5-8 7-4s4 4 6-2 3-6 5-4"/><path d="M3 21h18"/>`,
    ear:      `<path d="M7 9a5 5 0 0 1 10 0c0 3-2.5 4-3 6s-1 4-3.5 4A2.5 2.5 0 0 1 8 16.5"/><path d="M10 9.5a2 2 0 0 1 4 0c0 1.5-1.5 1.8-1.5 3"/>`,
    dikte:    `<path d="M16 3.5l4.5 4.5L9 19.5H4.5V15z"/><path d="M13.5 6l4.5 4.5"/>`,
    archive:  `<path d="M3.5 7h17v12.5h-17z"/><path d="M5.5 4h13v3h-13z"/><path d="M9.5 11h5"/>`,
    piece:    `<path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 13h8M8 16h5"/>`,
    band:     `<circle cx="7.5" cy="12" r="4.5"/><circle cx="16.5" cy="12" r="4.5"/><path d="M7.5 7.5v9M16.5 7.5v9" opacity=".5"/>`,
    kulaktan: `<path d="M3 12h1.5M7 8v8M11 5v14M15 9v6M19 7v10"/>`,
    convert:  `<path d="M4 7h13l-3-3M20 17H7l3 3"/>`,
    rec:      `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>`,
    progress: `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>`,
    search:   `<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>`,
    sun:      `<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>`,
    play:     `<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5z"/>`
  };
  // Ünite emojileri (Dersler listesi ve yol haritası)
  const UNIT_EMOJI = { baslangic:"🌱", temel:"🎵", klarino:"⛰️", teknik:"🎚️", hiz:"⚡", susleme:"✨", makam:"🎼", trakya:"💃", ileri:"🏆" };
  // Ana sayfa grup başlıkları
  const GROUP_EMOJI = { tech:"🛠️", makam:"🎼", pieces:"🧰", progress:"📈" };
  const PHOTO = {
    klarnet: "img/klarnet.webp", darbuka: "img/darbuka.webp", ud: "img/ud.webp", agizlik: "img/agizlik.webp"
  };
  // Nota arşivi kartındaki küçük dizek çizimi
  const SCORE = `<svg class="ascore" viewBox="0 0 72 52" aria-hidden="true">
    <path d="M4 14h64M4 20h64M4 26h64M4 32h64M4 38h64" stroke-width="1" opacity=".55"/>
    <path d="M7 41c-3-9 7-26 3-33-2 5-3 10 3 17 4 5-1 11-6 9" stroke-width="1.4"/>
    <g fill="currentColor" stroke="none"><ellipse cx="26" cy="32" rx="3.4" ry="2.5" transform="rotate(-20 26 32)"/><ellipse cx="36" cy="26" rx="3.4" ry="2.5" transform="rotate(-20 36 26)"/>
    <ellipse cx="46" cy="29" rx="3.4" ry="2.5" transform="rotate(-20 46 29)"/><ellipse cx="58" cy="20" rx="3.4" ry="2.5" transform="rotate(-20 58 20)"/></g>
    <path d="M29 31V12M39 25V9M49 28V9M61 19V4M39 9l10 0" stroke-width="1.4"/><path d="M39 9.5h10" stroke-width="3"/></svg>`;
  const icon = (id, cls = "aic") => P[id] ? `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[id]}</svg>` : "";
  const photo = (id, cls = "aphoto") => PHOTO[id] ? `<img class="${cls}" src="${PHOTO[id]}" alt="" loading="lazy" decoding="async">` : "";
  window.ART = { icon, photo, SCORE, has: id => !!P[id], UNIT_EMOJI, GROUP_EMOJI, PHOTO };
})();
