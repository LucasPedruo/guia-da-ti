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
          // Tailwind 4 positions dialogs with CSS translate. GSAP transform
          // conversion and matchMedia reversion can apply that translation twice.
          const positioned = anchored || slot === 'dialog-content' || slot === 'sheet-content';
          if (element instanceof HTMLElement && element.tagName === 'MAIN') {
            gsap.fromTo(element, {opacity:0,y:10}, {opacity:1,y:0,duration:0.45,ease:'power2.out',clearProps:'opacity,transform'});
            return;
          }
          gsap.from(element, { opacity: 0, ...(overlay || positioned ? {} : { y: '+=10' }), duration: overlay ? 0.2 : 0.32, ease: 'power2.out', clearProps: overlay || positioned ? 'opacity' : 'opacity,transform' });
        });
      }
      function scan(node: Element) {
        if (node.matches(selector)) enter(node);
        node.querySelectorAll(selector).forEach(enter);
      }
      // The head script and CSS prepare the route before its first paint.
      // Animate the page once; nested server content follows its parent.
      document.querySelectorAll(selector).forEach(element => {
        if (element.tagName === 'MAIN' && document.documentElement.classList.contains('route-enter')) enter(element); else animated.add(element);
      });
      document.documentElement.classList.remove('route-enter');
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
