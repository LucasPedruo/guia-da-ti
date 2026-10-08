import { useEffect, useState, type ReactElement } from 'react';
import { Globe2 } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { LoadingImage } from './LoadingImage';
import { resourceImage } from './resource-image';
import type { Resource } from './catalog';

export function ResourcePreview({ resource, extra = '', children, disabled = false }: { resource: Resource; extra?: string; children: ReactElement; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  const image = resourceImage(resource);
  return <HoverCard openDelay={280} closeDelay={120} open={open && !disabled} onOpenChange={setOpen}>
    <HoverCardTrigger asChild>{children}</HoverCardTrigger>
    <HoverCardContent className="pointer-events-none max-h-[var(--radix-hover-card-content-available-height)] overflow-y-auto p-0">
      {image && <LoadingImage src={image} alt="" loading="eager" className="h-36 w-full rounded-t-lg border-b bg-muted/40" imageClassName="object-contain p-3" />}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Globe2 className="size-4" />{new URL(resource.url).hostname.replace(/^www\./, '')}</div>
        <p className="text-base font-semibold">{resource.name}</p>
        <p className="mt-1 text-sm leading-relaxed">{resource.description}</p>
        {extra && <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">{extra}</p>}
      </div>
    </HoverCardContent>
  </HoverCard>;
}
