// Runs before styles and page content, including pre-rendered routes.
try {
  if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    document.documentElement.classList.add('route-enter');
    // A failed application bundle must never leave the page hidden.
    setTimeout(() => document.documentElement.classList.remove('route-enter'), 1500);
  }
  const dark = localStorage.getItem('theme') === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
} catch { /* Storage may be unavailable; keep the default light theme. */ }

try {
  document.documentElement.toggleAttribute('data-guide-dismissed', localStorage.getItem('guia:usage-tip:v1') === 'dismissed');
} catch { /* The usage tip stays visible when storage is unavailable. */ }
