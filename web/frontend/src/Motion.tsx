import { useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';

const selector = '[data-motion], [data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-slot="sheet-content"], [data-slot="sheet-overlay"], [data-slot="dropdown-menu-content"], [data-slot="select-content"]';

export function Motion({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const animated = new WeakSet<Element>();
      const context = gsap.context(() => {});
      function enter(element: Element) {
        if (element.getAttribute('data-state') === 'closed') { animated.delete(element); return; }
        if (animated.has(element) || !element.getClientRects().length) return;
        animated.add(element);
        context.add(() => {
          const slot = element.getAttribute('data-slot') || '';
          const overlay = slot.endsWith('overlay');
          const anchored = slot.includes('menu-content') || slot === 'select-content';
          gsap.from(element, { opacity: 0, ...(overlay || anchored ? {} : { y: '+=10' }), duration: overlay ? 0.2 : 0.32, ease: 'power2.out', clearProps: 'opacity,transform' });
        });
      }
      function scan(node: Element) {
        if (node.matches(selector)) enter(node);
        node.querySelectorAll(selector).forEach(enter);
      }
      scan(document.body);
      const observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.type === 'attributes') scan(record.target as Element);
          else record.addedNodes.forEach(node => { if (node instanceof Element) scan(node); });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });
      return () => { observer.disconnect(); context.revert(); };
    });
    return () => media.revert();
  }, []);
  return children;
}
