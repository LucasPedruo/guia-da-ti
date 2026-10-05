import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog } from 'radix-ui';
import { Github, Moon, Sun, LogOut, HeartHandshake } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

type Session = { enabled: boolean; login: string | null; avatarUrl: string | null; csrfToken: string };
const SessionContext = createContext<{ session: Session | null; loading: boolean; logout: () => Promise<void>; startLogin: () => void; pending: boolean } | null>(null);
export function Participation({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const popup = useRef<Window | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    function refresh() { return fetch('/api/auth/session', { signal: controller.signal, cache: 'no-store' }).then(response => {
      if (!response.ok) throw Error();
      return response.json();
    }).then(data => { if (!controller.signal.aborted) setSession(data); }).catch(() => { /* Reading discussions remains available. */ }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); }
    void refresh();
    window.addEventListener('focus', refresh);
    if (new URLSearchParams(window.location.search).get('login') === 'failed') setError('Não foi possível entrar com o GitHub. Tente novamente.');
    return () => { controller.abort(); window.removeEventListener('focus', refresh); };
  }, []);
  function startLogin() {
    if (pending) { popup.current?.focus(); return; }
    setError('');
    const left = Math.max(0, window.screenX + (window.outerWidth - 520) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - 720) / 2);
    popup.current = window.open('/api/auth/login?returnUrl=%2Fauth%2Fcomplete.html', 'guia-github-login', `popup,width=520,height=720,left=${left},top=${top}`);
    if (!popup.current) {
      window.location.assign(`/api/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setPending(true);
  }
  useEffect(() => {
    if (!pending) return;
    const controller = new AbortController();
    const started = Date.now();
    let checking = false;
    async function checkSession() {
      if (checking || controller.signal.aborted) return;
      checking = true;
      try {
        const response = await fetch('/api/auth/session', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw Error();
        const next: Session = await response.json();
        if (controller.signal.aborted) return;
        if (next.login) { setSession(next); setPending(false); popup.current?.close(); }
        else if (popup.current?.closed) setPending(false);
        else if (Date.now() - started > 300000) { setPending(false); setError('O login não foi concluído. Tente novamente.'); popup.current?.close(); }
      } catch { if (!controller.signal.aborted && popup.current?.closed) setPending(false); }
      finally { checking = false; }
    }
    function completed(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== popup.current || event.data?.type !== 'guia:auth-complete') return;
      if (event.data.failed) { setError('Não foi possível entrar com o GitHub. Tente novamente.'); setPending(false); }
      else void checkSession();
    }
    const timer = window.setInterval(() => { void checkSession(); }, 1000);
    window.addEventListener('message', completed);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('message', completed); };
  }, [pending]);
  async function logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': session!.csrfToken } });
      if (!response.ok) throw Error();
      window.location.reload();
    } catch { setError('Não foi possível sair. Atualize a página e tente novamente.'); }
  }
  return <SessionContext.Provider value={{ session, loading, logout, startLogin, pending }}>
    {error && <p role="alert" className="mx-auto max-w-7xl px-4 py-3 text-sm text-destructive">{error}</p>}
    {children}
  </SessionContext.Provider>;
}

export function UserControls({ dark, toggleTheme }: { dark: boolean; toggleTheme: () => void }) {
  const auth = useContext(SessionContext);
  const themeLabel = dark ? 'Ativar tema claro' : 'Ativar tema escuro';
  const ThemeIcon = dark ? Sun : Moon;
  if (auth?.loading) return <div role="status" aria-label="Carregando usuário" className="flex items-center gap-2"><Skeleton className="size-9" /><Skeleton className="h-8 w-8 sm:w-36" /></div>;
  if (!auth?.session?.login) return <>
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={themeLabel}><ThemeIcon /></Button>
    <LoginPrompt enabled={auth?.session?.enabled !== false} />
  </>;
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" shape="circle" aria-label={`Menu do usuário ${auth.session.login}`}>{auth.session.avatarUrl ? <img src={auth.session.avatarUrl} alt={`Foto de ${auth.session.login}`} className="size-8 rounded-full object-cover" referrerPolicy="no-referrer" /> : <Github />}</Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>{auth.session.login}</DropdownMenuLabel><DropdownMenuSeparator />
      <DropdownMenuItem onSelect={toggleTheme}><ThemeIcon />{themeLabel}</DropdownMenuItem>
      <DropdownMenuItem asChild><a href="/contribuir"><HeartHandshake />Contribuir</a></DropdownMenuItem>
      <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => { void auth.logout(); }}><LogOut />Sair</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}

const loginPanelClass = 'fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg';

function GitHubHelp() {
  return <section aria-label="Sobre o GitHub" className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
    <h3 className="font-semibold">O que é o GitHub?</h3>
    <p className="leading-relaxed text-muted-foreground">É um site que reúne projetos e comunidades. Usamos sua conta para identificar você no fórum. Você não precisa saber programar para participar.</p>
    <h3 className="font-semibold">Ainda não tem conta?</h3>
    <ol className="list-decimal space-y-1 pl-5 text-muted-foreground"><li>Crie uma conta gratuita no GitHub.</li><li>Confirme seu e-mail.</li><li>Volte aqui e clique em “Entrar com GitHub”.</li></ol>
    <Button asChild variant="outline" size="sm"><a href="https://github.com/signup" target="_blank" rel="noopener noreferrer">Criar conta no GitHub</a></Button>
  </section>;
}

function LoginPrompt({ enabled }: { enabled: boolean }) {
  const auth = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (auth?.session?.login) setOpen(false); }, [auth?.session?.login]);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><Button size="sm"><Github className="size-4" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Entrar com GitHub</span></Button></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content data-slot="dialog-content" className={loginPanelClass}>
      <Dialog.Title className="text-lg font-semibold">Entre para participar</Dialog.Title>
      <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">{enabled ? 'Use sua conta do GitHub para criar tópicos e responder no fórum.' : 'O login está indisponível no momento. Você pode continuar lendo o fórum.'}</Dialog.Description>
      <GitHubHelp />
      <div className="flex flex-wrap gap-2"><LoginButton enabled={enabled} /><Dialog.Close asChild><Button variant="ghost" size="sm">Cancelar</Button></Dialog.Close></div>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}

function LoginButton({ enabled = true, compact = false }: { enabled?: boolean; compact?: boolean }) {
  const auth = useContext(SessionContext);
  const content = <><Github className="size-4" aria-hidden="true" /><span className={compact ? 'sr-only sm:not-sr-only' : undefined}>{auth?.pending ? 'Conectando…' : 'Entrar com GitHub'}</span></>;
  if (!enabled) return <Button size="sm" disabled>{content}</Button>;
  return <Button size="sm" onClick={auth?.startLogin} disabled={auth?.pending}>{content}</Button>;
}

export function Composer({ number, replyToId, categories, onPublished, label = 'Comentar', compact = false, prompt = false, githubUrl }: {
  number?: number; replyToId?: string; categories?: { id: string; name: string }[]; onPublished: (number: number) => void; label?: string; compact?: boolean; prompt?: boolean; githubUrl?: string;
}) {
  const session = useContext(SessionContext)?.session;
  const id = useId();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  if (!session) return null;
  const layout = compact ? 'data-[open=true]:basis-full data-[open=true]:space-y-3' : 'space-y-3';
  const triggerSize = prompt ? 'lg' : compact ? number ? 'xs' : 'default' : 'default';
  const triggerVariant = prompt ? 'prompt' : number ? compact ? 'ghost' : 'outline' : 'default';
  const triggerLabel = prompt ? 'Participe da conversa…' : label;
  if (!session.login || !session.enabled) return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><Button size={triggerSize} variant={triggerVariant}>{triggerLabel}</Button></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content data-slot="dialog-content" className={loginPanelClass}>
      <Dialog.Title className="text-lg font-semibold">Você está deslogado</Dialog.Title>
      <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">{session.enabled ? 'Entre com sua conta do GitHub para publicar sua mensagem aqui no Guia.' : 'A participação pelo Guia está em preparação. Por enquanto, você pode publicar pelo link do GitHub.'}</Dialog.Description>
      <GitHubHelp />
      <div className="flex flex-wrap gap-2">{session.enabled && <LoginButton />}
        {!session.enabled && githubUrl && <Button asChild variant="outline" size="sm"><a href={githubUrl} target="_blank" rel="noopener noreferrer">{number ? 'Responder no GitHub' : 'Criar tópico no GitHub'}</a></Button>}
        <Dialog.Close asChild><Button variant="ghost" size="sm">Cancelar</Button></Dialog.Close>
      </div>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setSuccess(false);
    try {
      const response = await fetch('/api/discussions/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session!.csrfToken },
        body: JSON.stringify({ number, replyToId, title, categoryId, body }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(response.status === 401 ? 'Sua sessão expirou. Entre novamente com o GitHub.' : result.error || 'Não foi possível confirmar a publicação. Confira o tópico no GitHub antes de tentar novamente.');
      setBody(''); setTitle(''); setOpen(false); setSuccess(true);
      onPublished(result.number);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível confirmar a publicação. Confira o tópico no GitHub antes de tentar novamente.'); }
    finally { setBusy(false); }
  }
  return <div data-open={open} className={layout}>
    {!open ? <Button size={triggerSize} variant={triggerVariant} onClick={() => { setOpen(true); setSuccess(false); }}>{triggerLabel}</Button> : <form data-motion onSubmit={submit} className="space-y-4 rounded-lg border p-4">
      {!number && <>
        <div className="space-y-2"><label htmlFor={`${id}-title`} className="text-sm font-medium">Título do tópico</label><Input id={`${id}-title`} value={title} onChange={event => setTitle(event.target.value)} required maxLength={256} disabled={busy} /></div>
        <Select value={categoryId} onValueChange={setCategoryId} disabled={busy}><SelectTrigger aria-label="Categoria do novo tópico"><SelectValue placeholder="Escolha a categoria" /></SelectTrigger><SelectContent>{categories?.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select>
      </>}
      <div className="space-y-2"><label htmlFor={`${id}-body`} className="text-sm font-medium">{number ? 'Sua mensagem' : 'Conteúdo do tópico'}</label><textarea id={`${id}-body`} value={body} onChange={event => setBody(event.target.value)} required maxLength={10000} rows={5} disabled={busy} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50" /></div>
      <p className="text-xs text-muted-foreground">Sua mensagem será pública no Guia e no GitHub, em nome de {session.login}.</p>
      <div className="flex gap-2"><Button type="submit" disabled={busy || !body.trim() || (!number && (!title.trim() || !categoryId))}>{busy ? 'Publicando…' : 'Publicar'}</Button><Button type="button" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>}
    {success && <p role="status" className="text-sm text-muted-foreground">Mensagem publicada.</p>}
  </div>;
}
