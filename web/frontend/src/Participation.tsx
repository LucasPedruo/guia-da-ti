import {SelectField} from './SelectField';
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog } from 'radix-ui';
import { Github, Moon, Sun, LogOut, HeartHandshake, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { categories, labels, taxonomy } from './catalog';
import { CreatorAvatar, useCreatorProfile, followersLabel } from './CreatorProfile';
import { brazilRegions, type CommunityLocation } from './community-location';
import brazilMap from './data/brazil-states.json';
import { communityCategoryOrder, communityModalities, communityPlatforms } from './community-options';

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
  return <details aria-label="Ajuda para entrar com GitHub" className="group rounded-lg border bg-muted/30 text-sm">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium marker:hidden [&::-webkit-details-marker]:hidden">
      Primeira vez no GitHub?<ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-3 border-t px-4 py-3">
      <p className="leading-relaxed text-muted-foreground">Usamos sua conta para identificar você no fórum. Não precisa saber programar para participar.</p>
      <p className="font-medium">Ainda não tem conta?</p>
      <ol className="list-decimal space-y-1 pl-5 text-muted-foreground"><li>Crie uma conta gratuita no GitHub.</li><li>Confirme seu e-mail.</li><li>Volte aqui e clique em “Entrar com GitHub”.</li></ol>
      <Button asChild variant="outline" size="sm"><a href="https://github.com/signup" target="_blank" rel="noopener noreferrer">Criar conta no GitHub</a></Button>
    </div>
  </details>;
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

const typeNames: Record<string, string> = { courses: 'Cursos', platforms: 'Plataformas de cursos', universities: 'Faculdades', bootcamps: 'Bootcamps', roadmaps: 'Roadmaps', books: 'Livros', certifications: 'Certificações', news: 'Notícias', blogs: 'Blogs', newsletters: 'Newsletters', podcasts: 'Podcasts', youtube: 'YouTube', creators: 'Criadores', articles: 'Artigos', tutorials: 'Tutoriais', studies: 'Estudos', 'case-studies': 'Estudos de caso', reports: 'Relatórios', communities: 'Comunidades', events: 'Eventos', meetups: 'Meetups', conferences: 'Conferências', hackathons: 'Hackathons', tools: 'Ferramentas', 'open-source': 'Projetos open source', challenges: 'Desafios', labs: 'Laboratórios', jobs: 'Vagas', internships: 'Estágios', scholarships: 'Bolsas', mentoring: 'Mentorias', volunteering: 'Voluntariado' };

export function ResourceContribution() {
  const session = useContext(SessionContext)?.session;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [successLinkLabel, setSuccessLinkLabel] = useState('Abrir conversa');
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const [languages, setLanguages] = useState<string[]>(['pt-BR']);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [communityScope, setCommunityScope] = useState<CommunityLocation['scope'] | ''>('');
  const [communityStates, setCommunityStates] = useState<string[]>([]);
  const [communityPlatformIds, setCommunityPlatformIds] = useState<string[]>([]);
  const [communityModality, setCommunityModality] = useState('');
  useEffect(() => {
    const requested=new URLSearchParams(window.location.search).get('categoria');
    if(requested && taxonomy.types.includes(requested)) setType(requested);
  }, []);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const creatorCategory = type === 'creators' || type === 'youtube';
  const catalogOnly = creatorCategory || type === 'communities';
  const lookup = useCreatorProfile(url, creatorCategory && !!session?.login);
  useEffect(() => {
    if (!lookup.profile) return;
    setName(lookup.profile.name.slice(0, 100));
    setSummary(lookup.profile.description.slice(0, 240));
    setDescription(lookup.profile.description.slice(0, 4000));
  }, [lookup.profile]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.login || busy) return;
    setBusy(true); setError(''); setSuccess('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const communityLocation = type === 'communities' && communityScope ? { scope: communityScope, ...(communityScope === 'regional' ? { states: communityStates } : {}) } : undefined;
    const proposal = { type, name: String(form.get('name') || '').trim(), url: String(form.get('url') || '').trim(), summary: String(form.get('summary') || '').trim(), description: String(form.get('description') || '').trim(), areas: area ? [area] : [], technologies, languages, communityLocation,
      ...(type === 'communities' ? {communityPlatforms:communityPlatformIds,communityModality} : {}) };
    try {
      const response = await fetch('/api/contributions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrfToken }, body: JSON.stringify(proposal) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(result.error || 'Não foi possível enviar a contribuição.');
      if (result.kind === 'catalog' && result.url) {
        setSuccess('Sugestão enviada para revisão dos mantenedores. O cadastro aparece no guia após a aprovação.');
        setSuccessUrl(result.url); setSuccessLinkLabel('Acompanhar revisão');
      } else {
        setSuccess(`Sugestão enviada! A conversa #${result.number} já está aberta para comentários.`);
        setSuccessUrl(`/?conversa=${result.number}`); setSuccessLinkLabel('Abrir conversa');
      }
      formElement.reset(); setType(''); setArea(''); setLanguages(['pt-BR']); setTechnologies([]);
      setUrl(''); setName(''); setSummary(''); setDescription('');
      setCommunityScope(''); setCommunityStates([]);
      setCommunityPlatformIds([]); setCommunityModality('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível enviar a contribuição.'); }
    finally { setBusy(false); }
  }
  if (!session?.login) return <div className="space-y-3 rounded-lg border p-5"><p>Entre com GitHub para sugerir um recurso. Criadores e comunidades vão para revisão do catálogo; as demais sugestões abrem uma conversa no fórum.</p><LoginButton /></div>;
  return <form onSubmit={submit} className="space-y-4 rounded-lg border p-5">
    <label className="block space-y-2 text-sm font-medium">Categoria do guia<select required value={type} onChange={event => setType(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 font-normal"><option value="">Escolha uma categoria</option>{taxonomy.types.map((id: string) => <option key={id} value={id}>{typeNames[id] || categories.find(category => category.id === id)?.name || id}</option>)}</select></label>
    {type === 'communities' && <fieldset className="space-y-3 rounded-md border p-4"><legend className="text-sm font-medium">Localização da comunidade</legend>
      <SelectField label="Área de atuação" name="communityScope" required value={communityScope} onChange={value=>setCommunityScope(value as CommunityLocation['scope'])} placeholder="Escolha o alcance" options={[{id:'regional',name:'Regional'},{id:'national',name:'Nacional'},{id:'international',name:'Internacional'}]} />
      {communityScope === 'regional' && <>
        <p className="text-xs text-muted-foreground">Marque os estados onde a comunidade atua ou selecione uma região inteira.</p>
        <div className="flex flex-wrap gap-2">{brazilRegions.map(region => <Button key={region.id} type="button" size="sm" variant="outline" onClick={() => setCommunityStates(current => [...new Set([...current, ...region.states])])}>{region.name}</Button>)}</div>
        <div className="grid gap-2 sm:grid-cols-2">{[...brazilMap.states].sort((a,b) => a.name.localeCompare(b.name, 'pt-BR')).map(state => <label key={state.uf} className="flex items-center gap-2 text-xs"><input type="checkbox" name="communityStates" value={state.uf} checked={communityStates.includes(state.uf)} onChange={event => setCommunityStates(current => event.target.checked ? [...current, state.uf] : current.filter(uf => uf !== state.uf))} />{state.name} ({state.uf})</label>)}</div>
      </>}
    </fieldset>}
    {type === 'communities' && <fieldset className="space-y-3 rounded-md border p-4"><legend className="text-sm font-medium">Como a comunidade se reúne</legend>
      <SelectField label="Modalidade" name="communityModality" required value={communityModality} onChange={setCommunityModality} placeholder="Escolha a modalidade" options={communityModalities} />
      <p className="text-sm font-medium">Plataforma</p><p className="text-xs text-muted-foreground">Marque pelo menos uma plataforma onde as pessoas se encontram.</p>
      <div className="grid gap-2 sm:grid-cols-2">{communityPlatforms.map(item=><label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="communityPlatforms" value={item.id} checked={communityPlatformIds.includes(item.id)} onChange={event=>setCommunityPlatformIds(current=>event.target.checked?[...current,item.id]:current.filter(id=>id!==item.id))} />{item.name}</label>)}</div>
    </fieldset>}
    <label className="block space-y-2 text-sm font-medium">Link<Input name="url" type="url" required maxLength={500} placeholder="https://" value={url} onChange={event => {
      setUrl(event.target.value);
      if (creatorCategory) { setName(''); setSummary(''); setDescription(''); }
    }} /></label>
    {creatorCategory && <div aria-live="polite" className="space-y-2 text-sm text-muted-foreground">
      <p>Cole o link do perfil para buscar os dados automaticamente. Confira as informações antes de enviar.</p>
      {lookup.loading && <p role="status">Buscando perfil…</p>}
      {lookup.error && <p role="status">{lookup.error}</p>}
      {lookup.profile && <div className="flex items-center gap-3 rounded-md border p-3"><CreatorAvatar profile={lookup.profile} name={lookup.profile.name} /><div><p className="font-medium text-foreground">{lookup.profile.name}</p><p>{followersLabel(lookup.profile)}</p></div></div>}
    </div>}
    <label className="block space-y-2 text-sm font-medium">Nome<Input name="name" required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
    <label className="block space-y-2 text-sm font-medium">Resumo<Input name="summary" required minLength={10} maxLength={240} placeholder="Uma frase para apresentar o recurso" value={summary} onChange={event => setSummary(event.target.value)} /></label>
    <label className="block space-y-2 text-sm font-medium">Descrição<textarea name="description" required minLength={10} maxLength={4000} rows={4} value={description} onChange={event => setDescription(event.target.value)} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm font-normal" /></label>
    {type === 'communities' ? <SelectField label="Categoria da comunidade" name="area" required value={area} onChange={setArea} placeholder="Escolha uma categoria" options={[...communityCategoryOrder, ...taxonomy.areas.filter(id=>!communityCategoryOrder.includes(id))].map(id=>({id,name:labels[id]||id}))} /> : <label className="block space-y-2 text-sm font-medium">Assunto principal<select name="area" required value={area} onChange={event=>setArea(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 font-normal"><option value="">Escolha um assunto</option>{taxonomy.areas.map(id=><option key={id} value={id}>{labels[id]||id}</option>)}</select></label>}
    <fieldset className="space-y-2"><legend className="text-sm font-medium">Tecnologias (opcional)</legend><div className="flex flex-wrap gap-4">{taxonomy.technologies.map((technology: string) => <label key={technology} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={technologies.includes(technology)} onChange={event => setTechnologies(current => event.target.checked ? [...current, technology] : current.filter(item => item !== technology))} />{labels[technology] || technology}</label>)}</div></fieldset>
    <fieldset className="space-y-2"><legend className="text-sm font-medium">Idiomas disponíveis</legend><div className="flex flex-wrap gap-4">{taxonomy.languages.map((language: string) => <label key={language} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={languages.includes(language)} onChange={event => setLanguages(current => event.target.checked ? [...current, language] : current.filter(item => item !== language))} />{language}</label>)}</div></fieldset>
    <p className="text-xs text-muted-foreground">{catalogOnly ? 'A sugestão vai para revisão dos mantenedores e entra no catálogo após a aprovação. Ela não abre uma conversa no fórum. Para enviar, o GitHub pode preparar uma cópia do catálogo na sua conta.' : 'A publicação cria uma conversa em Ideias. A comunidade pode comentar ali; após a revisão, a aprovação prepara estes dados no catálogo.'}</p>
    <Button type="submit" disabled={busy || !type || !area || !languages.length || type === 'communities' && (!communityScope || communityScope === 'regional' && !communityStates.length || !communityModality || !communityPlatformIds.length)}>{busy ? 'Enviando…' : catalogOnly ? 'Enviar para revisão' : 'Enviar sugestão e abrir conversa'}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{success && <p role="status" className="text-sm text-muted-foreground">{success} <a className="text-primary underline" href={successUrl}>{successLinkLabel}</a></p>}
  </form>;
}

export function ApproveContribution({ number }: { number: number }) {
  const session = useContext(SessionContext)?.session;
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [url, setUrl] = useState('');
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (!session?.login) { setAllowed(false); return; }
    const controller = new AbortController();
    fetch(`/api/discussions/${number}/approval-status`, { signal: controller.signal, cache: 'no-store' }).then(response => response.ok ? response.json() : { allowed: false }).then(result => { if (!controller.signal.aborted) setAllowed(result.allowed === true); }).catch(() => {});
    return () => controller.abort();
  }, [number, session?.login]);
  if (!session?.login) return null;
  if (!allowed && !url) return null;
  async function approve() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/discussions/${number}/approve`, { method: 'POST', headers: { 'X-CSRF-Token': session!.csrfToken } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(result.error || 'Não foi possível aprovar esta sugestão.');
      setUrl(result.url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível aprovar esta sugestão.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">{url ? <p className="text-sm">Pull Request criado: <a className="text-primary underline" href={url} target="_blank" rel="noopener noreferrer">revisar e mesclar no GitHub</a></p> : <Button variant="outline" size="sm" disabled={busy} onClick={() => void approve()}>{busy ? 'Preparando cadastro…' : 'Aprovar e preparar cadastro'}</Button>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}
