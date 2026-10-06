import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageNumbers } from './pagination';

export function ResourcePagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return <nav aria-label="Paginação da listagem" className="flex flex-wrap items-center justify-center gap-1 border-t px-3 py-3 sm:justify-end sm:px-4">
    <Button type="button" variant="ghost" size="sm" aria-label="Página anterior" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft aria-hidden="true" /><span className="hidden sm:inline">Anterior</span></Button>
    <span aria-live="polite" className="px-2 text-xs text-muted-foreground sm:hidden">Página {page} de {pages}</span>
    <div className="hidden items-center gap-1 sm:flex">
      {pageNumbers(page, pages).map((value, index) => value === 'gap'
        ? <span key={`gap-${index}`} className="grid size-8 place-items-center text-muted-foreground"><Ellipsis aria-hidden="true" /><span className="sr-only">Mais páginas</span></span>
        : <Button type="button" key={value} size="icon-sm" variant={value === page ? 'default' : 'ghost'} aria-label={`Página ${value}`} aria-current={value === page ? 'page' : undefined} onClick={() => onChange(value)}>{value}</Button>)}
    </div>
    <Button type="button" variant="ghost" size="sm" aria-label="Próxima página" disabled={page === pages} onClick={() => onChange(page + 1)}><span className="hidden sm:inline">Próxima</span><ChevronRight aria-hidden="true" /></Button>
  </nav>;
}
