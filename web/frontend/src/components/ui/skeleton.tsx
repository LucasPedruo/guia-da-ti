import { cn } from 'cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" data-slot="skeleton" className={cn('skeleton rounded-md bg-muted', className)} />;
}
