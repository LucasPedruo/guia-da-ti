export const adsHiddenKey = 'guia.ads.hidden-until';
export const adsHiddenDuration = 4 * 60 * 60 * 1000;
export function readAdsHiddenUntil() {
  try { const value = Number(localStorage.getItem(adsHiddenKey)); return Number.isFinite(value) && value > Date.now() ? value : 0; }
  catch { return 0; }
}
export function hideAdsTemporarily() {
  const until = Date.now() + adsHiddenDuration;
  try { localStorage.setItem(adsHiddenKey, String(until)); } catch { /* Still hide for this visit when storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent('guia:ads-hidden', { detail: until }));
  return until;
}
