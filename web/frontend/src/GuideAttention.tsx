import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { macCursorSvg } from './mac-cursor';

const keyForRoute = () => `guia:help-attention:v1:${window.location.pathname.replace(/\/+$/, '') || '/'}`;
const seenThisVisit = new Set<string>();

function wasSeen(key: string) {
  if (seenThisVisit.has(key)) return true;
  try { return localStorage.getItem(key) === 'seen'; } catch { return false; }
}

export function GuideAttention({ target, enabled }: { target: RefObject<HTMLButtonElement | null>; enabled: boolean }) {
  const [active, setActive] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const completed = useRef<(() => void) | null>(null);

  useEffect(() => {
    const button = target.current;
    if (!enabled || !button) return;
    const key = keyForRoute();
    if (wasSeen(key)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    let timer: number | undefined;
    let finished = false;
    let inView = false;
    function finish() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      observer.disconnect();
      seenThisVisit.add(key);
      try { localStorage.setItem(key, 'seen'); } catch { /* Keep the one-time behavior for this document. */ }
      setActive(false);
    }
    completed.current = finish;
    function schedule() {
      window.clearTimeout(timer);
      if (!inView || document.hidden || motion.matches || finished || wasSeen(key)) return;
      timer = window.setTimeout(() => {
        if (document.hidden || motion.matches || wasSeen(key)) return;
        observer.disconnect();
        setActive(true);
      }, 900);
    }
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].intersectionRatio >= 0.95;
      schedule();
    }, { threshold: 0.95 });
    observer.observe(button);
    button.addEventListener('click', finish);
    const cancel = () => { window.clearTimeout(timer); observer.disconnect(); setActive(false); };
    motion.addEventListener('change', cancel);
    document.addEventListener('visibilitychange', schedule);
    const stored = (event: StorageEvent) => { if (event.key === key && event.newValue === 'seen') finish(); };
    window.addEventListener('storage', stored);
    return () => {
      window.clearTimeout(timer); observer.disconnect(); button.removeEventListener('click', finish);
      motion.removeEventListener('change', cancel); completed.current = null;
      document.removeEventListener('visibilitychange', schedule); window.removeEventListener('storage', stored);
      setActive(false);
    };
  }, [target, enabled]);

  useEffect(() => {
    const button = target.current;
    if (!active || !button || !cursor.current || !halo.current) return;
    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const context = gsap.context(() => {
      gsap.set(halo.current, { x: x - 26, y: y - 26 });
      gsap.timeline({ onComplete: () => completed.current?.() })
        .fromTo(cursor.current, { x: window.innerWidth + 35, y: Math.min(window.innerHeight - 36, y + 100), opacity: 0, scale: 1 }, { x: x - 2, y: y - 2, opacity: 1, duration: 1.1, ease: 'power2.inOut' })
        .to(cursor.current, { scale: 0.82, duration: 0.12 })
        .to(cursor.current, { scale: 1, duration: 0.18 })
        .fromTo(halo.current, { opacity: 0.85, scale: 0.65 }, { opacity: 0, scale: 1.8, duration: 0.7, ease: 'power2.out' }, 1.15)
        .to(cursor.current, { opacity: 0, y: y + 18, duration: 0.4, ease: 'power2.in' }, 2.05);
    });
    // If the target moves or the visitor switches tabs, stop the decoration.
    const stop = () => completed.current?.();
    window.addEventListener('resize', stop);
    window.addEventListener('scroll', stop, true);
    document.addEventListener('visibilitychange', stop);
    return () => {
      context.revert(); window.removeEventListener('resize', stop); window.removeEventListener('scroll', stop, true);
      document.removeEventListener('visibilitychange', stop);
    };
  }, [active, target]);

  if (!active) return null;
  return createPortal(<div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
    <div ref={halo} className="absolute top-0 left-0 size-[52px] rounded-full border-2 border-primary bg-primary/20 opacity-0" />
    <div ref={cursor} className="absolute top-0 left-0 origin-top-left opacity-0 drop-shadow-sm" dangerouslySetInnerHTML={{ __html: macCursorSvg }} />
  </div>, document.body);
}
