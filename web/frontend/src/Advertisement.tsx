import { useState } from 'react';
import { EyeOff, Info, Megaphone, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Advertisement() {
  const [hidden, setHidden] = useState(false);
  const [about, setAbout] = useState(false);
  if (hidden) return null;
  return <aside aria-label="Publicidade" className="my-2 min-h-28 space-y-3 rounded-lg bg-muted/30 px-4 py-3">
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex size-7 items-center justify-center rounded-full bg-muted"><Megaphone className="size-3.5" aria-hidden="true" /></span>
      <span className="font-medium">Publicidade</span><span aria-hidden="true">·</span><span>Espaço reservado</span>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="ml-auto size-7" aria-label="Opções da publicidade"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setHidden(true)}><EyeOff />Ocultar publicidade</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setAbout(value => !value)}><Info />Sobre este espaço</DropdownMenuItem>
      </DropdownMenuContent></DropdownMenu>
    </div>
    <p className="pl-9 text-sm text-muted-foreground">Espaço para publicidade</p>
    {about && <p className="pl-9 text-xs leading-relaxed text-muted-foreground">Este espaço está reservado para anúncios. Ainda não há uma campanha ativa.</p>}
  </aside>;
}
