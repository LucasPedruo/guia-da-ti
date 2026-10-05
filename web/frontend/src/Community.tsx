import community from './generated/community.json';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Community({ area, preview = false, embedded = false }: { area: 'supporters' | 'contributors'; preview?: boolean; embedded?: boolean }) {
  const supporting = area === 'supporters';
  const title = supporting ? 'Empresas apoiadoras' : 'Contribuidores';
  const href = supporting ? '/apoiadores' : '/sobre#contribuidores';
  const [contributors, setContributors] = useState<{ name: string; url: string; contributions: number }[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (supporting) return;
    const controller = new AbortController();
    setError(false);
    fetch('/api/contributors', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error();
      return response.json();
    }).then(data => { if (!controller.signal.aborted) setContributors(data.items); }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [supporting, attempt]);
  const entries: { name: string; url: string; description: string }[] = supporting ? community.supporters : (contributors || []).map(person => ({ name: person.name, url: person.url, description: `${person.contributions} ${person.contributions === 1 ? 'contribuição' : 'contribuições'} nos repositórios públicos do Guia.` }));
  const Heading = preview || embedded ? 'h2' : 'h1';
  if (supporting) return <section id="apoiadores" aria-label={title} className="mx-auto max-w-4xl space-y-6">
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Parceiros do Guia</p>
      <Heading className="text-2xl font-semibold uppercase tracking-wide sm:text-3xl">{title}</Heading>
    </div>
    {entries.length ? <ul className="grid grid-cols-2 overflow-hidden border sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(entry => <li key={entry.url} className="-mb-px -mr-px border-b border-r">
        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="flex min-h-28 items-center justify-center px-5 py-6 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" aria-label={`Visitar ${entry.name}`}>
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">{entry.name}</span>
        </a>
      </li>)}
    </ul> : <p className="border p-5 text-sm text-muted-foreground">Os primeiros apoiadores serão apresentados aqui.</p>}
    {preview && <Button asChild variant="link" className="h-auto p-0 text-muted-foreground"><a href={href}>Conhecer os apoiadores</a></Button>}
  </section>;
  return <section id={supporting ? 'apoiadores' : 'contribuidores'} aria-label={title} className="mx-auto max-w-4xl space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><Heading className="text-2xl font-semibold tracking-tight">{title}</Heading>{preview && <Button asChild variant="link"><a href={href}>Ver todos</a></Button>}</div>
    <p className="text-muted-foreground">{supporting ? 'Empresas que ajudam o Guia da TI a crescer.' : 'Pessoas que ajudam a construir o Guia, melhorar o catálogo e cuidar da comunidade.'}</p>
    {!supporting && error ? <div role="alert" className="space-y-3 rounded-lg border p-5"><p className="text-sm">Não foi possível carregar os contribuidores do GitHub.</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</Button></div> : !supporting && contributors === null ? <p role="status" className="text-sm text-muted-foreground">Carregando contribuidores do GitHub…</p> : entries.length ? <div className="grid gap-4 sm:grid-cols-2">{(preview ? entries.slice(0, 4) : entries).map(entry => <Card key={entry.url} className="shadow-none"><CardHeader><CardTitle><a href={entry.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{entry.name}</a></CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{entry.description}</CardContent></Card>)}</div> : <p className="rounded-lg border p-5 text-sm text-muted-foreground">{supporting ? 'Os primeiros apoiadores serão apresentados aqui.' : 'O GitHub ainda não retornou contribuidores.'}</p>}
    {!supporting && <p className="text-xs text-muted-foreground">Autores de commits reconhecidos pelo GitHub nos repositórios públicos do Guia. Atualização automática; o GitHub pode levar algum tempo para reconhecer novas contribuições.</p>}
    {!supporting && <Button asChild variant="outline"><a href="/contribuir">Quero contribuir</a></Button>}
  </section>;
}
