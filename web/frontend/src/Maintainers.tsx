import {openContribution} from './contribution-actions';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Tooltip } from 'radix-ui';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingImage } from './LoadingImage';

type Maintainer = { name: string; url: string; avatarUrl: string; contributions: number };
const MaintainersContext = createContext<{ people: Maintainer[] | null; error: boolean; retry: () => void }>({ people: null, error: false, retry: () => {} });

export function MaintainersProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Maintainer[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch('/api/contributors', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error();
      const data = await response.json();
      if (!Array.isArray(data.items)) throw Error();
      return data.items as Maintainer[];
    }).then(items => { if (!controller.signal.aborted) setPeople(items); }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [attempt]);
  return <MaintainersContext.Provider value={{ people, error, retry: () => setAttempt(value => value + 1) }}>{children}</MaintainersContext.Provider>;
}

export function Maintainers({ compact = false }: { compact?: boolean }) {
  const { people, error, retry } = useContext(MaintainersContext);
  const limit = 8;
  const shown = compact ? people?.slice(0, limit) : people;
  return <section id={compact ? undefined : 'mantenedores'} aria-label="Mantenedores" className={compact ? 'flex max-w-full items-center justify-center gap-2' : 'space-y-4'}>
    <h2 className={compact ? 'sr-only' : 'text-2xl font-semibold tracking-tight'}>Mantenedores</h2>
    {!compact && <p className="text-muted-foreground">Pessoas que ajudam a construir o Guia e melhorar o catálogo.</p>}
    {error ? <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><p>Não foi possível carregar os mantenedores.</p><Button variant="link" size="inline" onClick={retry}>Tentar novamente</Button></div>
      : people === null ? <div role="status" aria-label="Carregando mantenedores" className="flex gap-1">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="size-8 rounded-none" />)}</div>
      : people.length === 0 ? <p className="text-xs text-muted-foreground">Os mantenedores serão apresentados aqui.</p>
      : <Tooltip.Provider delayDuration={150}><ul className={compact ? 'flex flex-wrap items-center justify-center gap-1' : 'flex max-w-sm flex-wrap gap-1 sm:max-w-lg'}>
        {shown?.map(person => <li key={person.url}><Tooltip.Root><Tooltip.Trigger asChild>
          <a href={person.url} target="_blank" rel="noopener noreferrer" aria-label={`Perfil de ${person.name} no GitHub`} className="block size-8 outline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-ring">
            <LoadingImage src={person.avatarUrl} alt={person.name} width={32} height={32} referrerPolicy="no-referrer" className="size-8" imageClassName="object-cover" />
          </a>
        </Tooltip.Trigger><Tooltip.Portal><Tooltip.Content side="top" sideOffset={8} collisionPadding={12} className="z-[100] max-w-64 border bg-popover px-3 py-2 text-popover-foreground shadow-md">
          <p className="text-sm font-semibold">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.contributions.toLocaleString('pt-BR')} {person.contributions === 1 ? 'contribuição' : 'contribuições'} no Guia</p>
          <Tooltip.Arrow className="fill-popover" />
        </Tooltip.Content></Tooltip.Portal></Tooltip.Root></li>)}
      </ul></Tooltip.Provider>}
    {compact && people && people.length > limit && <a href="/sobre#mantenedores" className="shrink-0 font-mono text-xs uppercase tracking-widest hover:text-primary">+{people.length - limit} mais</a>}
    {!compact && <><p className="text-xs text-muted-foreground">O GitHub reúne aqui quem contribuiu com alterações nos repositórios públicos do Guia.</p><Button variant="outline" onClick={() => openContribution()}>Quero contribuir</Button></>}
  </section>;
}
