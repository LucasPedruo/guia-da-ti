import { Skeleton } from '@/components/ui/skeleton';

export function DiscussionSkeleton() {
  return <div role="status" aria-label="Carregando conversas" className="divide-y border-y">
    <span className="sr-only">Carregando conversas…</span>
    {[0, 1, 2].map(item => <div key={item} className="space-y-3 py-5">
      <Skeleton className="h-3 w-40" /><Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /><Skeleton className="h-7 w-28" />
    </div>)}
  </div>;
}

export function ContributorSkeleton() {
  return <div role="status" aria-label="Carregando mantenedores do GitHub" className="grid gap-4 sm:grid-cols-2">
    <span className="sr-only">Carregando mantenedores do GitHub…</span>
    {[0, 1].map(item => <div key={item} className="space-y-4 rounded-xl border p-6"><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /></div>)}
  </div>;
}
