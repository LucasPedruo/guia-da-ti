import { useContext, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { SessionContext } from './Participation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PublicationActions({ author, number, commentId, title, body, onChanged, onDeleted, hasReplies = false }: { author: string; number: number; commentId?: string; title?: string; body: string; onChanged: () => void; onDeleted?: () => void; hasReplies?: boolean }) {
  const auth = useContext(SessionContext);
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null);
  const [text, setText] = useState(body);
  const [heading, setHeading] = useState(title || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [originalLoaded, setOriginalLoaded] = useState(false);
  if (number < 1 || !auth?.session?.login || auth.session.login.toLowerCase() !== author.toLowerCase()) return null;
  const noun = commentId ? 'comentário' : 'tópico';
  async function show(value: 'edit' | 'delete') {
    setText(body); setHeading(title || ''); setError(''); setMode(value); setOriginalLoaded(value === 'delete');
    if (value !== 'edit') return;
    setBusy(true);
    try {
      const response = await fetch(`/api/discussions/${number}/editable${commentId ? `?commentId=${encodeURIComponent(commentId)}` : ''}`, { cache: 'no-store' });
      const original = await response.json();
      if (!response.ok) throw Error(original.error || 'Não foi possível carregar o texto original. Feche e tente novamente.');
      setText(original.body); setHeading(original.title || ''); setOriginalLoaded(true);
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível carregar o texto original.'); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (busy || (mode === 'edit' && !originalLoaded)) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/discussions/${number}${commentId ? `/comments/${encodeURIComponent(commentId)}` : ''}`, {
        method: mode === 'delete' ? 'DELETE' : 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': auth!.session!.csrfToken },
        ...(mode === 'edit' ? { body: JSON.stringify({ body: text, ...(!commentId ? { title: heading } : {}) }) } : {}),
      });
      if (!response.ok) { const result = await response.json().catch(() => null); throw Error(result?.error || 'Não foi possível alterar sua publicação. Entre novamente e tente outra vez.'); }
      const deleted = mode === 'delete';
      setMode(null);
      if (deleted && onDeleted) onDeleted(); else onChanged();
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.'); }
    finally { setBusy(false); }
  }
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" aria-label={`Opções do seu ${noun}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => show('edit')}><Pencil />Editar {noun}</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => show('delete')}><Trash2 />Excluir {noun}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    <Dialog open={!!mode} onOpenChange={value => { if (!value && !busy) setMode(null); }}><DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{mode === 'delete' ? `Excluir ${noun}?` : `Editar ${noun}`}</DialogTitle><DialogDescription>{mode === 'delete' ? !commentId ? 'O tópico e todos os comentários serão excluídos do Guia e do GitHub. Essa ação não pode ser desfeita.' : hasReplies ? 'O texto do comentário será removido do Guia e do GitHub. As respostas podem permanecer para preservar a conversa.' : 'Seu comentário será excluído do Guia e do GitHub. Essa ação não pode ser desfeita.' : 'A alteração também aparece na sua publicação no GitHub.'}</DialogDescription></DialogHeader><form onSubmit={event => { event.preventDefault(); void submit(); }} className="space-y-4">{mode === 'edit' && <>{!commentId && <div className="space-y-2"><Label htmlFor="publication-heading">Título</Label><Input id="publication-heading" disabled={busy || !originalLoaded} required maxLength={256} value={heading} onChange={event => setHeading(event.target.value)} /></div>}<div className="space-y-2"><Label htmlFor="publication-body">Texto</Label><Textarea id="publication-body" disabled={busy || !originalLoaded} required maxLength={10000} rows={8} value={text} onChange={event => setText(event.target.value)} /></div></>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setMode(null)}>Cancelar</Button><Button type="submit" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={busy || (mode === 'edit' && !originalLoaded)}>{busy ? 'Aguarde…' : mode === 'delete' ? `Excluir ${noun}` : 'Salvar alterações'}</Button></DialogFooter></form></DialogContent></Dialog>
  </>;
}
