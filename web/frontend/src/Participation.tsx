import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Session = { enabled: boolean; login: string | null; csrfToken: string };
const SessionContext = createContext<Session | null>(null);
export function Participation({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/session', { signal: controller.signal, cache: 'no-store' }).then(response => {
      if (!response.ok) throw Error();
      return response.json();
    }).then(setSession).catch(() => { /* Reading discussions remains available. */ });
    if (new URLSearchParams(window.location.search).get('login') === 'failed') setError('Não foi possível entrar com o GitHub. Tente novamente.');
    return () => controller.abort();
  }, []);
  async function logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': session!.csrfToken } });
      if (!response.ok) throw Error();
      window.location.reload();
    } catch { setError('Não foi possível sair. Atualize a página e tente novamente.'); }
  }
  return <SessionContext.Provider value={session}>
    {session?.enabled && <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
      <p>{session.login ? session.login : 'Participe com sua conta GitHub'}</p>
      {session.login ? <Button variant="ghost" size="sm" className="h-8" onClick={logout}>Sair</Button> : <LoginButton />}
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {children}
  </SessionContext.Provider>;
}

function LoginButton() {
  const [returnUrl, setReturnUrl] = useState('/');
  useEffect(() => setReturnUrl(window.location.pathname + window.location.search), []);
  return <Button asChild size="sm"><a href={`/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`}>Entrar com GitHub</a></Button>;
}

export function Composer({ number, replyToId, categories, onPublished, label = 'Comentar', compact = false, prompt = false, githubUrl }: {
  number?: number; replyToId?: string; categories?: { id: string; name: string }[]; onPublished: (number: number) => void; label?: string; compact?: boolean; prompt?: boolean; githubUrl?: string;
}) {
  const session = useContext(SessionContext);
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
  const triggerClass = prompt ? 'h-10 w-full justify-start rounded-full px-4 text-sm font-normal text-muted-foreground' : compact ? 'h-8 px-2 text-xs text-muted-foreground' : undefined;
  const triggerVariant = number ? compact ? 'ghost' : 'outline' : 'default';
  const triggerLabel = prompt ? 'Participe da conversa…' : label;
  if (!session.login || !session.enabled) return <div data-open={open} className={layout}>
    <Button size={compact ? 'sm' : 'default'} className={triggerClass} variant={triggerVariant} onClick={() => setOpen(value => !value)} aria-expanded={open}>{triggerLabel}</Button>
    {open && <div className="space-y-3 rounded-lg border p-4 text-sm">
      <p>{session.enabled ? 'Entre com sua conta do GitHub para publicar sua mensagem aqui no Guia.' : 'A participação pelo Guia está em preparação. Por enquanto, você pode publicar pelo link do GitHub.'}</p>
      {session.enabled && <LoginButton />}
      {!session.enabled && githubUrl && <Button asChild variant="outline" size="sm"><a href={githubUrl} target="_blank" rel="noopener noreferrer">{number ? 'Responder no GitHub' : 'Criar tópico no GitHub'}</a></Button>}
    </div>}
  </div>;
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
    {!open ? <Button size={compact ? 'sm' : 'default'} className={triggerClass} variant={triggerVariant} onClick={() => { setOpen(true); setSuccess(false); }}>{triggerLabel}</Button> : <form onSubmit={submit} className="space-y-4 rounded-lg border p-4">
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
