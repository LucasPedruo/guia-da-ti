import community from './generated/community.json';
import { Button } from '@/components/ui/button';
import { Maintainers } from './Maintainers';
import { ArrowUpRight, HeartHandshake } from 'lucide-react';

export function Community({ area, preview = false, embedded = false }: { area: 'supporters' | 'contributors'; preview?: boolean; embedded?: boolean }) {
  const supporting = area === 'supporters';
  const title = 'Empresas apoiadoras';
  const href = '/sobre#apoiadores';
  const entries = community.supporters;
  const Heading = preview || embedded ? 'h2' : 'h1';
  if (!supporting) return <Maintainers compact={preview} />;
  if (embedded) return <section id="apoiadores" aria-label={title} className="flex h-full flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-6">
    <header className="space-y-3"><span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><HeartHandshake className="size-5" /></span><h2 className="text-xl font-semibold tracking-tight">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">Empresas que apoiam o Guia da TI.</p></header>
    {entries.length ? <ul className="space-y-3">{entries.map(entry => <li key={entry.url}><a href={entry.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-4 py-5 transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Visitar ${entry.name}`}><span className="text-lg font-semibold tracking-tight">{entry.name}</span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground" /></a></li>)}</ul> : <p className="text-sm text-muted-foreground">Os primeiros apoiadores serão apresentados aqui.</p>}
    <p className="mt-auto border-t pt-4 text-xs leading-relaxed text-muted-foreground">Conheça cada empresa pelo link para o site oficial.</p>
  </section>;
  if (supporting) return <section id="apoiadores" aria-label={title} className="mx-auto w-full max-w-4xl space-y-6">
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Parceiros do Guia</p>
      <Heading className={preview ? 'sr-only' : 'text-2xl font-semibold uppercase tracking-wide sm:text-3xl'}>{title}</Heading>
    </div>
    {entries.length ? <ul className="grid grid-cols-2 overflow-hidden border sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(entry => <li key={entry.url} className="-mb-px -mr-px border-b border-r">
        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="flex min-h-28 items-center justify-center px-5 py-6 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" aria-label={`Visitar ${entry.name}`}>
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">{entry.name}</span>
        </a>
      </li>)}
    </ul> : <p className="border p-5 text-sm text-muted-foreground">Os primeiros apoiadores serão apresentados aqui.</p>}
    {preview && <Button asChild variant="link" size="inline"><a href={href}>Conhecer os apoiadores</a></Button>}
  </section>;
}
