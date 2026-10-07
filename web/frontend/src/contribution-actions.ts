export function openContribution(category = '') {
  window.dispatchEvent(new CustomEvent('guia:contribute', { detail: category }));
}
