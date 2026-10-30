// Nota bul kaynakları (saf mantık, Node'da denenebilir): neyzen.com ve projetsm.com sayfa ayrıştırıcıları ve arama dizini.
// Ağ çağırmaz; sayfaları getiren işlev (fetchText) dışarıdan verilir.
// Tarayıcıda learn.js'ten sonra <script src="sources.js"> ile, Node'da require("./sources.js") ile yüklenir.

const SRC_MAKAMS = typeof module !== "undefined" ? require("./learn.js").MAKAMS : MAKAMS;

// neyzen kaynağı tek ayarla kapatılabilir (enabled:false → aramada neyzen sonucu çıkmaz)
const SOURCES = {
  neyzen: { enabled: true, base: "https://www.neyzen.com/" },
  projetsm: { enabled: true, base: "http://projetsm.com/" },
};

// Aramada şapka, nokta ve büyük/küçük harf farkı olmasın
const normTr = s => String(s == null ? "" : s)
  .replace(/İ/g, "i").replace(/I/g, "i").toLowerCase()
  .replace(/[âä]/g, "a").replace(/[îı]/g, "i").replace(/û/g, "u")
  .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u")
  .replace(/[^a-z0-9]+/g, " ").trim();

// Sitelerde yazım ayrı olabilir (Beyâtî, Acem Aşîrân, Sûznâk); boşluksuz karşılaştırılır
const MAKAM_ALIAS = { beyati: "bayati", suznak: "suzinak" };
const compactTr = s => normTr(s).replace(/ /g, "");
const makamIdOf = name => {
  const k = compactTr(name);
  if (!k) return null;
  const hit = SRC_MAKAMS.find(m => compactTr(m.name) === k || m.id === k);
  return hit ? hit.id : (MAKAM_ALIAS[k] || null);
};

const decodeEnt = s => String(s)
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const textOf = h => decodeEnt(String(h).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
// Bir satırın (<tr>) hücre metinleri
const cellsOf = row => row.split(/<td[^>]*>/i).slice(1).map(textOf);

// Bağlantıdaki adres: bir kısmı zaten %XX kodlu gelir; önce çözülüp yeniden kodlanır (%2520 olmasın)
const uriOf = u => { try { return encodeURI(decodeURI(u)); } catch (e) { return encodeURI(u); } };

// ---- neyzen.com ----
// Makam listesi: ../makamlar/x.html bağlantıları
const parseNeyzenMakamList = html => {
  const out = [], seen = new Set();
  const re = /<a\s[^>]*href="(?:\.\.\/)?(makamlar\/[^"#?]+\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(String(html || "")))) {
    const makam = textOf(m[2]);
    if (!makam || seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ makam, url: SOURCES.neyzen.base + m[1] });
  }
  return out;
};

// Makam sayfası: her <tr> içinde nota_arsivi/…pdf bağlantısı; ilk hücre biçim, ikinci hücre besteci
const parseNeyzenMakamPage = (html, makamName) => {
  const out = [], seen = new Set();
  const makamId = makamIdOf(makamName);
  const rows = String(html || "").split(/<tr[\s>]/i).slice(1);
  for (const row of rows) {
    const a = /<a\s[^>]*href="(?:\.\.\/)?(nota_arsivi\/[^"]+?\.pdf)"/i.exec(row);
    if (!a || seen.has(a[1])) continue;
    seen.add(a[1]);
    const cells = cellsOf(row);
    const first = cells[0] || "";
    out.push({
      title: [makamName, first].filter(Boolean).join(" ").trim(),
      form: first.replace(/\s*\(.*$/, "").trim(),
      composer: (cells[1] || "").replace(/\s*\(.*$/, "").trim(),
      makam: makamName || "", makamId,
      url: SOURCES.neyzen.base + uriOf(decodeEnt(a[1])), source: "neyzen",
    });
  }
  return out;
};

// ---- projetsm.com ----
// Eser adının sluğunda geçen biçimler (arama sonucunda ayrı bir biçim sütunu yok)
const PS_FORMS = ["agir semai", "yuruk semai", "saz semaisi", "semai", "sarki", "pesrev", "longa", "turku", "ilahi", "kar", "beste",
  "nakis", "sirto", "oyun havasi", "gazel", "tevsih", "durak", "marsi", "mars", "kanto", "zeybek", "karsilama", "sama"];
const psFormOf = (slug, makam) => {
  const s = " " + normTr(slug) + " ";
  const mk = normTr(makam);
  const from = mk ? s.indexOf(" " + mk + " ") : -1;
  const tail = from >= 0 ? s.slice(from + mk.length + 1) : s;
  let best = "", bestAt = 1e9;
  for (const f of PS_FORMS) {
    const at = tail.indexOf(" " + f + " ");
    if (at >= 0 && at < bestAt) { best = f; bestAt = at; }
  }
  return best;
};

const parseProjetsmSearch = html => {
  const out = [], seen = new Set();
  const rows = String(html || "").split(/<tr[\s>]/i).slice(1);
  for (const row of rows) {
    const e = /<a\s[^>]*href="(\/eserler\/\d+-[^"#?]*)"[^>]*>([\s\S]*?)<\/a>/i.exec(row);
    if (!e || seen.has(e[1])) continue;
    seen.add(e[1]);
    const cells = cellsOf(row);
    const makam = cells[0] || "";
    out.push({
      title: textOf(e[2]), form: psFormOf(e[1], makam), composer: cells[2] || "", makam, makamId: makamIdOf(makam),
      url: SOURCES.projetsm.base + e[1].replace(/^\//, ""), source: "projetsm",
    });
  }
  return out;
};

// Eser sayfası: /uploads/attachment/<id>_v<n>_<k>.gif; ilk (en küçük) sürümün sayfaları, sayfa sırasıyla
const parseProjetsmPiece = html => {
  const byVer = new Map();
  const re = /\/uploads\/attachment\/(\d+)_v(\d+)_(\d+)\.gif/gi;
  let m;
  while ((m = re.exec(String(html || "")))) {
    const v = +m[2], k = +m[3];
    if (!byVer.has(v)) byVer.set(v, new Map());
    byVer.get(v).set(k, SOURCES.projetsm.base + m[0].replace(/^\//, ""));
  }
  if (!byVer.size) return { pages: [], hasScore: false };
  const v0 = Math.min(...byVer.keys());
  const pages = [...byVer.get(v0).entries()].sort((a, b) => a[0] - b[0]).map(x => x[1]);
  return { pages, hasScore: pages.length > 0 };
};

// ---- neyzen dizini ----
// Her makam sayfası bir "sayfa"dır. En çok 2 istek aynı anda; hata veren sayfa atlanır (complete:false),
// prev.pagesDone'daki sayfalar yeniden istenmez, böylece kopan dizin sonraki aramada tamamlanır.
const buildNeyzenIndex = async (fetchText, prev, onProgress) => {
  const done = new Set((prev && prev.pagesDone) || []);
  const entries = ((prev && prev.entries) || []).slice();
  const date = new Date().toISOString().slice(0, 10);
  let list;
  try { list = parseNeyzenMakamList(await fetchText(SOURCES.neyzen.base + "Sablonlar/makamListesi.html")); }
  catch (e) { return { entries, pagesDone: [...done], complete: false, date }; }
  if (!list.length) return { entries, pagesDone: [...done], complete: false, date };
  const todo = list.filter(p => !done.has(p.url));
  let next = 0, failed = 0, finished = list.length - todo.length;
  const worker = async () => {
    while (next < todo.length) {
      const p = todo[next++];
      try {
        entries.push(...parseNeyzenMakamPage(await fetchText(p.url), p.makam));
        done.add(p.url);
      } catch (e) { failed++; }
      finished++;
      if (onProgress) onProgress(finished, list.length);
    }
  };
  await Promise.all([worker(), worker()]);
  return { entries, pagesDone: [...done], complete: failed === 0, date };
};

// Sorgunun her sözcüğü (normTr) başlık, biçim, besteci ya da makamda geçmeli; başlıkta geçen önce
const searchIndex = (entries, query, opts) => {
  const o = opts || {};
  const words = normTr(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  const hits = [];
  (entries || []).forEach((e, i) => {
    if (!e || (SOURCES[e.source] && !SOURCES[e.source].enabled)) return;
    if (o.source && e.source !== o.source) return;
    if (o.makamId && e.makamId !== o.makamId) return;
    const t = normTr(e.title);
    const all = t + " " + normTr(e.form) + " " + normTr(e.composer) + " " + normTr(e.makam);
    if (!words.every(w => all.includes(w))) return;
    hits.push({ e, rank: words.every(w => t.includes(w)) ? 0 : 1, i });
  });
  return hits.sort((a, b) => a.rank - b.rank || a.i - b.i).map(h => h.e);
};

if (typeof module !== "undefined") module.exports = {
  SOURCES, normTr, makamIdOf, parseNeyzenMakamList, parseNeyzenMakamPage, parseProjetsmSearch, parseProjetsmPiece,
  buildNeyzenIndex, searchIndex,
};
