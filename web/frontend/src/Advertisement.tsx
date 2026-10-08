import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, EyeOff, Info, Megaphone, MoreHorizontal } from 'lucide-react';
import { adsHiddenKey, hideAdsTemporarily, readAdsHiddenUntil } from './ad-preferences';
import { Button } from '@/components/ui/button';
import { LoadingImage } from './LoadingImage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Creative = { id: string; company: string; title: string; description: string; imageUrl: string | null; clickUrl: string; ticket: string };
export function Advertisement({ placement = 'forum-feed', preview = false, listItem = false }: { placement?: 'forum-feed' | 'forum-topic' | 'study-topic'; preview?: boolean; listItem?: boolean }) {
  const [hiddenUntil, setHiddenUntil] = useState(0);
  const [ad, setAd] = useState<Creative | null>(null);
  const [enabled, setEnabled] = useState(true);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (preview) return;
    setHiddenUntil(readAdsHiddenUntil());
    function sync(event: Event) {
      if (event instanceof StorageEvent && event.key !== adsHiddenKey && event.key !== null) return;
      setHiddenUntil(event instanceof CustomEvent ? event.detail : readAdsHiddenUntil());
    }
    window.addEventListener('storage', sync);
    window.addEventListener('guia:ads-hidden', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('guia:ads-hidden', sync); };
  }, [preview]);
  useEffect(() => {
    if (!hiddenUntil) return;
    const timer = window.setTimeout(() => setHiddenUntil(0), Math.max(0, hiddenUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [hiddenUntil]);
  useEffect(() => {
    if (preview || hiddenUntil || (enabled && !root.current)) return;
    const controller = new AbortController();
    let timer: number | undefined;
    let visible = false;
    let busy = false;
    let previous: string | undefined;
    let interval = 45;
    async function load() {
      if (busy || controller.signal.aborted || (enabled && !visible) || document.hidden) return;
      busy = true;
      try {
        const query = new URLSearchParams({ placement, ...(previous ? { previous } : {}) });
        const response = await fetch(`/api/ads/select?${query}`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw Error();
        const data: { rotationSeconds: number; ad: Creative | null; enabled: boolean } = await response.json();
        if (controller.signal.aborted) return;
        setEnabled(data.enabled); setAd(data.ad); previous = data.ad?.id; interval = data.rotationSeconds;
      } catch { if (!controller.signal.aborted) setAd(null); }
      finally { busy = false; if (!controller.signal.aborted) timer = window.setTimeout(() => { void load(); }, interval * 1000); }
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { window.clearTimeout(timer); void load(); }
    });
    if (root.current) observer.observe(root.current);
    if (!enabled) timer = window.setTimeout(() => { void load(); }, interval * 1000);
    function focused() { if (!document.hidden && (visible || !enabled)) { window.clearTimeout(timer); void load(); } }
    document.addEventListener('visibilitychange', focused);
    return () => { controller.abort(); window.clearTimeout(timer); observer.disconnect(); document.removeEventListener('visibilitychange', focused); };
  }, [placement, preview, hiddenUntil, enabled]);
  useEffect(() => {
    if (!ad || !root.current || preview || hiddenUntil) return;
    let timer: number | undefined;
    let recorded = false;
    let visible = false;
    function check() {
      window.clearTimeout(timer);
      if (!recorded && visible && !document.hidden) timer = window.setTimeout(() => {
        recorded = true;
        void fetch('/api/ads/impression', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: ad!.ticket }) }).catch(() => {});
      }, 1000);
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= 0.5; check(); }, { threshold: [0, 0.5] });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', check);
    return () => { observer.disconnect(); window.clearTimeout(timer); document.removeEventListener('visibilitychange', check); };
  }, [ad, preview, hiddenUntil]);
  if ((hiddenUntil || !enabled) && !preview) return null;
  const imageOnly = ad?.imageUrl && !ad.title.trim() && !ad.description.trim();
  const menu = <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" className={ad ? 'absolute right-2 top-2 z-10 bg-background/90 hover:bg-background' : 'ml-auto'} aria-label="Opções da publicidade"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem asChild><a href="/empresas"><Info />Sobre este espaço</a></DropdownMenuItem>
    {!preview && <DropdownMenuItem onSelect={() => { setAd(null); setHiddenUntil(hideAdsTemporarily()); }}><EyeOff />Ocultar anúncios por 4 horas</DropdownMenuItem>}
  </DropdownMenuContent></DropdownMenu>;
  const content = <aside ref={root} data-motion aria-label="Publicidade" className={`relative my-2 overflow-hidden rounded-lg bg-muted/30 ${imageOnly ? '' : 'min-h-28 space-y-3 px-4 py-3'}`}>
    {!ad && <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex size-7 items-center justify-center rounded-full bg-muted"><Megaphone className="size-3.5" aria-hidden="true" /></span>
      <span className="font-medium">Publicidade</span><span aria-hidden="true">·</span><span>Espaço reservado</span>
      {menu}
    </div>}
    {ad && menu}
    {ad && imageOnly ? <a key={ad.id} href={ad.clickUrl} target="_blank" rel="noopener noreferrer" aria-label={`Publicidade: abrir site de ${ad.company}`} className="block w-full motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"><LoadingImage src={ad.imageUrl!} alt={`Anúncio de ${ad.company}`} referrerPolicy="no-referrer" className="aspect-[4/1] w-full bg-muted" imageClassName="object-cover" /></a> : ad ? <div key={ad.id} className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
      {ad.imageUrl && <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir site de ${ad.company}`} className="block w-full shrink-0 sm:w-40"><LoadingImage src={ad.imageUrl} alt={ad.company} referrerPolicy="no-referrer" className="aspect-video w-full rounded-md bg-muted" imageClassName="object-contain" /></a>}
      <div className="min-w-0 flex-1 space-y-2"><p className="text-base font-semibold">{ad.title}</p><p className="text-sm leading-relaxed text-muted-foreground">{ad.description}</p><Button asChild size="sm"><a href={ad.clickUrl} target="_blank" rel="noopener noreferrer">Abrir site<ArrowUpRight /></a></Button></div>
    </div> : <p className="pl-9 text-sm text-muted-foreground">Espaço para publicidade</p>}
  </aside>;
  return listItem ? <li>{content}</li> : content;
}
