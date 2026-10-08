import type { MouseEvent } from 'react';

export function shouldOpenRow(event: MouseEvent<HTMLElement>) {
  return !event.defaultPrevented && event.button === 0 && !window.getSelection()?.toString()
    && !(event.target as Element).closest('a, button, input, select, textarea, [role="button"], [role="link"]');
}

export function openRowLink(event: MouseEvent<HTMLElement>, href: string, external = false) {
  if (external || event.ctrlKey || event.metaKey || event.shiftKey) window.open(href, '_blank', 'noopener,noreferrer');
  else window.location.assign(href);
}
