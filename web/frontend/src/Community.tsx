import community from './generated/community.json';
import { Button } from '@/components/ui/button';
import { Maintainers } from './Maintainers';

export function Community({ area, preview = false, embedded = false }: { area: 'supporters' | 'contributors'; preview?: boolean; embedded?: boolean }) {
  const supporting = area === 'supporters';
  const title = 'Empresas apoiadoras';
  const href = '/apoiadores';
  const entries = community.supporters;
  const Heading = preview || embedded ? 'h2' : 'h1';
  if (!supporting) return <Maintainers compact={preview} />;
  if (supporting) return <section id="apoiadores" aria-label={title} className="mx-auto max-w-4xl space-y-6">
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
