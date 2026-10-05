import community from './generated/community.json';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Community({ area, preview = false }: { area: 'supporters' | 'contributors'; preview?: boolean }) {
  const supporting = area === 'supporters';
  const title = supporting ? 'Empresas apoiadoras' : 'Contribuidores';
  const href = supporting ? '/apoiadores' : '/contribuidores';
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
  const entries: { name: string; url: string; description: string }[] = supporting ? community.supporters : (contributors || []).map(person => ({ name: person.name, url: person.url, description: `${person.contributions} ${person.contributions === 1 ? 'contribuição' : 'contribuições'} nos repositórios do Guia.` }));
  const Heading = preview ? 'h2' : 'h1';
  return <section aria-label={title} className="mx-auto max-w-4xl space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><Heading className="text-2xl font-semibold tracking-tight">{title}</Heading>{preview && <Button asChild variant="link"><a href={href}>Ver todos</a></Button>}</div>
    <p className="text-muted-foreground">{supporting ? 'Empresas que ajudam o Guia da TI a crescer.' : 'Pessoas que ajudam a construir o Guia, melhorar o catálogo e cuidar da comunidade.'}</p>
    {!supporting && error ? <div role="alert" className="space-y-3 rounded-lg border p-5"><p className="text-sm">Não foi possível carregar os contribuidores do GitHub.</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</Button></div> : !supporting && contributors === null ? <p role="status" className="text-sm text-muted-foreground">Carregando contribuidores do GitHub…</p> : entries.length ? <div className="grid gap-4 sm:grid-cols-2">{(preview ? entries.slice(0, 4) : entries).map(entry => <Card key={entry.url} className="shadow-none"><CardHeader><CardTitle><a href={entry.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{entry.name}</a></CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{entry.description}</CardContent></Card>)}</div> : <p className="rounded-lg border p-5 text-sm text-muted-foreground">{supporting ? 'Os primeiros apoiadores serão apresentados aqui.' : 'O GitHub ainda não retornou contribuidores.'}</p>}
    {!supporting && <p className="text-xs text-muted-foreground">Autores de commits reconhecidos pelo GitHub nos repositórios da aplicação e do catálogo. Atualização automática; o GitHub pode levar algum tempo para reconhecer novas contribuições.</p>}
    {!supporting && <Button asChild variant="outline"><a href="/contribuir">Quero contribuir</a></Button>}
  </section>;
}
