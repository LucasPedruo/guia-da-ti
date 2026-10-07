import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Toast } from 'radix-ui';
import { CheckCircle2, X } from 'lucide-react';
import { categories } from './catalog';

type Notice = { id: string; login: string; name: string; category: string; url: string };
const NoticeContext = createContext<(notice: Notice) => void>(() => {});
export const useContributionToast = () => useContext(NoticeContext);

export function ContributionToasts({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const seen = useRef(new Set<string>());
  const notify = useCallback((notice: Notice) => {
    if (seen.current.has(notice.id)) return;
    seen.current.add(notice.id);
    if (seen.current.size > 256) seen.current.delete(seen.current.values().next().value!);
    setNotices(current => [...current.slice(-2), notice]);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let cursor: { stream: string; cursor: number } | undefined;
    async function poll() {
      let delay = 5000;
      try {
        if (!document.hidden) {
          const query = cursor ? '?' + new URLSearchParams({ stream: cursor.stream, after: String(cursor.cursor) }) : '';
          const response = await fetch('/api/contributions/notices' + query, { signal: controller.signal, cache: 'no-store' });
          if (!response.ok) throw Error();
          const page = await response.json() as { stream: string; cursor: number; items: Notice[] };
          if (!controller.signal.aborted) {
            page.items.slice(-3).forEach(notify);
            cursor = page;
          }
        }
      } catch { delay = 15000; }
      if (!controller.signal.aborted) timer = setTimeout(poll, delay);
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [notify]);
  return <NoticeContext.Provider value={notify}><Toast.Provider duration={7000} swipeDirection="right">
    {children}
    {notices.map(notice => <Toast.Root key={notice.id} defaultOpen type="background" onOpenChange={open => { if (!open) setNotices(current => current.filter(n => n.id !== notice.id)); }} className="flex items-start gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in motion-reduce:animate-none">
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 space-y-1">
        <Toast.Title className="break-words text-sm font-medium">{notice.login} adicionou {notice.name} em {notice.category === 'creators' ? 'Criadores' : categories.find(c => c.id === notice.category)?.name ?? notice.category}</Toast.Title>
        <Toast.Description className="text-xs text-muted-foreground">Sugestão enviada para revisão</Toast.Description>
        <a href={notice.url} className="inline-block text-xs text-primary underline underline-offset-4">Acompanhar sugestão</a>
      </div>
      <Toast.Close aria-label="Fechar aviso" className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><X className="size-4" /></Toast.Close>
    </Toast.Root>)}
    <Toast.Viewport aria-label="Avisos de sugestões" className="fixed right-4 bottom-4 z-[100] m-0 flex w-[calc(100vw-2rem)] max-w-sm list-none flex-col gap-2 outline-none" />
  </Toast.Provider></NoticeContext.Provider>;
}
