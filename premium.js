// Freemium hazırlığı: hangi bölümlerin premium olduğu ve kullanıcının hakkı (tarayıcı + Node).
// Ödeme kodu yok. FREEMIUM.enabled false iken hiçbir şey kilitlenmez; ayrım proje sahibinin kararını bekliyor
// (docs/BACKLOG.md "Freemium"). Satış açılmadan önce SymbTr ve WFG izinleri gerekir (docs/LISANSLAR.md).
// Ayrım şimdilik backlog'daki öneri: Başlarken, Temeller ve Register ücretsiz; sonraki üniteler ve aşağıdaki sekmeler premium.
const FREEMIUM = {
  enabled: false,
  units: ["teknik", "hiz", "susleme", "makam", "trakya", "ileri"],
  tabs: ["band", "kulaktan", "convert", "rec", "seyir"]
};
// Satın alma hakkı: ödeme eklenince mağazanın doğruladığı hak buraya yazılır (şimdilik yalnız deneme için)
let PREMIUM_OWNED = false;
function setPremiumOwned(on){ PREMIUM_OWNED = !!on; }
const premiumLocked = () => FREEMIUM.enabled && !PREMIUM_OWNED;
const premiumUnit = unitId => premiumLocked() && FREEMIUM.units.includes(unitId);
const premiumTab = tabId => premiumLocked() && FREEMIUM.tabs.includes(tabId);

if(typeof module !== "undefined") module.exports = { FREEMIUM, setPremiumOwned, premiumLocked, premiumUnit, premiumTab };
